import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

type CookiesToSet = Parameters<CookieMethodsServer['setAll']>[0];

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
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

// Service-role client for server-side admin operations
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_GS_SUPABASE_URL!,
    process.env.GS_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
