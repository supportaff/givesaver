import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Hardcoded cookie type — avoids @supabase/ssr internal type instability across versions
type CookieOption = { name: string; value: string; options?: Record<string, unknown> };

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_GS_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_GS_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieOption[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Record<string, unknown>)
            );
          } catch {
            // Ignore — expected in read-only Server Components
          }
        },
      },
    }
  );
}

// Admin client — no generic to avoid 'never' overload errors from hand-rolled types
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_GS_SUPABASE_URL!,
    process.env.GS_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
