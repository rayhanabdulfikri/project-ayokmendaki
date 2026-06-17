import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: any;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase credentials are missing! Please make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY configured in your .env file or Vercel Environment Variables settings."
  );

  // Return a safe mock/dummy client to prevent initialization and runtime crashes
  const createDummyChain = () => {
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

  const dummyAuth = {
    signInWithOAuth: () => Promise.resolve({ data: {}, error: new Error("Supabase URL or Key missing") }),
    signInWithPassword: () => Promise.resolve({ data: {}, error: new Error("Supabase URL or Key missing") }),
    signUp: () => Promise.resolve({ data: {}, error: new Error("Supabase URL or Key missing") }),
    signOut: () => Promise.resolve({ error: new Error("Supabase URL or Key missing") }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null })
  };

  client = new Proxy({}, {
    get(target, prop) {
      if (prop === "auth") {
        return dummyAuth;
      }
      if (prop === "from") {
        return createDummyChain;
      }
      // Return a dummy function for any other property
      return () => createDummyChain();
    }
  });
} else {
  client = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = client;
