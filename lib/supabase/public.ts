import { createClient } from "@supabase/supabase-js";

// A Supabase client for pages that anyone can open. It never uses a
// login, so it can only ever see what the public is allowed to see
// (published posts), even when an admin is signed in on the same browser.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// The web address of an image stored in the blog-images bucket.
export function blogImageUrl(path: string | null) {
  if (!path) return null;
  return createPublicClient().storage.from("blog-images").getPublicUrl(path)
    .data.publicUrl;
}