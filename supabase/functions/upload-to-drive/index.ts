import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.9/mod.ts";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const type = formData.get("type") as string; // 'ktp' | 'selfie' | 'doc'

    if (!file || !userId || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: file, userId, or type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const gdClientEmail = Deno.env.get("GD_CLIENT_EMAIL");
    const gdPrivateKey = Deno.env.get("GD_PRIVATE_KEY");
    const gdKtpFolderId = Deno.env.get("GD_KTP_FOLDER_ID"); // Untuk KTP dan Selfie
    const gdDocFolderId = Deno.env.get("GD_DOC_FOLDER_ID"); // Untuk sertifikat APIGI, NIB, dsb.

    if (!gdClientEmail || !gdPrivateKey || !gdKtpFolderId || !gdDocFolderId) {
      return new Response(
        JSON.stringify({ error: "Google Drive secrets are not fully configured in Supabase env variables." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Tentukan folder penyimpanan berdasarkan tipe berkas
    const targetFolderId = (type === "ktp" || type === "selfie") ? gdKtpFolderId : gdDocFolderId;

    // 1. Authenticate with Google API using JWT
    const cleanPem = gdPrivateKey.replace(/\\n/g, "\n");
    const keyData = cleanPem
      .replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "")
      .replace(/\s+/g, "");
    
    // Gunakan fungsi decode dari Deno standard library (lebih aman dan stabil)
    const binaryKey = decode(keyData);

    const key = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: { name: "SHA-256" },
      },
      false,
      ["sign"]
    );

    const jwtHeader = { alg: "RS256", typ: "JWT" };
    const jwtPayload = {
      iss: gdClientEmail,
      scope: "https://www.googleapis.com/auth/drive",
      aud: "https://oauth2.googleapis.com/token",
      exp: getNumericDate(3600),
      iat: getNumericDate(0),
    };

    const jwt = await create(jwtHeader, jwtPayload, key);

    // 2. Exchange JWT for Google API Access Token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to get Google Access Token: ${errorText}`);
    }

    const { access_token } = await tokenResponse.json();

    // 3. Upload File to Google Drive
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const driveFileName = `${userId}_${type}_${Date.now()}_${cleanFileName}`;
    
    const metadata = {
      name: driveFileName,
      parents: [targetFolderId],
    };

    const boundary = "ayokmendaki_upload_boundary";
    
    // Perbaikan format delimiter multipart agar sesuai dengan spec Google Drive API
    const delimiter = `--${boundary}\r\n`;
    const nextDelimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;
    const mediaType = file.type || "application/octet-stream";

    const encoder = new TextEncoder();
    const requestPrefix = encoder.encode(
      delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      nextDelimiter +
      `Content-Type: ${mediaType}\r\n\r\n`
    );

    const fileBuffer = new Uint8Array(await file.arrayBuffer());
    const requestSuffix = encoder.encode(closeDelimiter);

    const combinedBody = new Uint8Array(
      requestPrefix.byteLength + fileBuffer.byteLength + requestSuffix.byteLength
    );
    combinedBody.set(requestPrefix, 0);
    combinedBody.set(fileBuffer, requestPrefix.byteLength);
    combinedBody.set(requestSuffix, requestPrefix.byteLength + fileBuffer.byteLength);

    const uploadResponse = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: combinedBody,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to upload file to Google Drive: ${errorText}`);
    }

    const uploadedFile = await uploadResponse.json();

    // 4. Set Permission to "anyone with link can view" so it displays on website
    const permissionResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${uploadedFile.id}/permissions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "reader",
          type: "anyone",
        }),
      }
    );

    if (!permissionResponse.ok) {
      console.warn("Failed to set public read permission on Google Drive file.");
    }

    // Direct view link format that can be used inside img tags
    const directViewLink = `https://lh3.googleusercontent.com/d/${uploadedFile.id}=w800`;
    
    return new Response(
      JSON.stringify({
        success: true,
        fileId: uploadedFile.id,
        url: directViewLink,
        webViewLink: uploadedFile.webViewLink,
        webContentLink: uploadedFile.webContentLink
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "An unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
