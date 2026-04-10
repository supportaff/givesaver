import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

type CookiesToSet = Parameters<CookieMethodsServer['setAll']>[0];

// Browser-safe server client (anon key, cookie-aware)
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_GS_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_GS_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: CookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* ignore in Server Components */ }
        },
      },
    }
  );
}

// Service-role admin client (no generic — avoids 'never' overload errors from hand-rolled types)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_GS_SUPABASE_URL!,
    process.env.GS_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
