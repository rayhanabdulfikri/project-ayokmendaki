import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: any;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase credentials are missing! Please make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY configured in your .env file or Vercel Environment Variables settings."
  );

  // Return a safe mock/dummy client to prevent initialization and runtime crashes
  client = new Proxy({}, {
    get(target, prop) {
      // Return a chainable dummy query builder
      const dummyQuery = () => {
        const chain: any = {
          select: () => chain,
          insert: () => Promise.resolve({ data: null, error: new Error("Supabase URL or Key missing") }),
          update: () => chain,
          delete: () => chain,
          eq: () => chain,
          single: () => Promise.resolve({ data: null, error: new Error("Supabase URL or Key missing") }),
          then: (callback: any) => Promise.resolve({ data: null, error: new Error("Supabase URL or Key missing") }).then(callback)
        };
        return chain;
      };
      return dummyQuery;
    }
  });
} else {
  client = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = client;
