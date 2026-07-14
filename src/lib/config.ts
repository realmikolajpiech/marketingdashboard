declare global {
  interface Window {
    __TRAILO_CONFIG__?: {
      supabaseUrl?: string;
      supabaseAnonKey?: string;
    };
  }
}

export const CONFIG_ERROR =
  "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY when building, or provide them as server environment variables for /runtime-config.js.";

export function getSupabaseConfig() {
  const runtime = typeof window !== "undefined" ? window.__TRAILO_CONFIG__ : undefined;

  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || runtime?.supabaseUrl || "",
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || runtime?.supabaseAnonKey || "",
  };
}

export function isSupabaseConfigured() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function loadRuntimeConfig(): Promise<void> {
  if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return Promise.resolve();
  }

  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.__TRAILO_CONFIG__) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = `/runtime-config.js?${Date.now()}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}
