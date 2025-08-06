import { createBrowserClient } from '@supabase/ssr';

/**
 * Cleans up malformed cookies that cause JSON parsing errors in Supabase
 */
export function cleanMalformedCookies() {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    if (cookie.startsWith('sb-')) {
      const [name, value] = cookie.split('=');
      try {
        JSON.parse(decodeURIComponent(value));
      } catch (e) {
        // Delete malformed cookie
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      }
    }
  }
}

/**
 * Initializes Supabase client with cookie cleanup
 */
export function initSupabase() {
  cleanMalformedCookies();
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}