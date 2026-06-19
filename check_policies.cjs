const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually
const envContent = fs.readFileSync('./.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    env[key] = val;
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL or Key missing in .env file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runCheck() {
  console.log("Checking Supabase Storage buckets...");

  // Test upload check with .jpg extension
  console.log("\nTesting upload capability to 'kyc_document' with a .jpg file...");
  const dummyFile = Buffer.from("test kyc data");
  try {
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('kyc_document')
      .upload('test_connection.jpg', dummyFile, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadErr) {
      console.error("❌ Test upload failed:", uploadErr.message, uploadErr);
    } else {
      console.log("✅ Test upload succeeded! Upload path:", uploadData.path);
      // Cleanup
      const { error: removeErr } = await supabase.storage.from('kyc_document').remove(['test_connection.jpg']);
      if (removeErr) {
        console.warn("Warning: Could not delete test file:", removeErr.message);
      } else {
        console.log("✅ Cleanup test file succeeded.");
      }
    }
  } catch (err) {
    console.error("Exception during test upload:", err.message);
  }
}

runCheck();
