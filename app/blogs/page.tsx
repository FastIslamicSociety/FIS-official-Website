import type { Metadata } from "next";
import BlogCard from "@/components/blog-card";
import { formatDate } from "@/lib/format";
import { blogImageUrl, createPublicClient } from "@/lib/supabase/public";

// Always fetch fresh, so a newly published post shows up straight away.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blogs | FAST Islamic Society",
  description: "Articles and reflections from the FAST Islamic Society.",
};

export default async function BlogsPage() {
  const supabase = createPublicClient();

  const { data: posts, error } = await supabase
    .from("blogs")
    .select(
      "id, title, slug, excerpt, author_name, published_at, cover_image_path, cover_image_alt"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-4xl font-black text-[#2d7550] md:text-5xl">
        Blogs
      </h1>
      <p className="mb-10 mt-2 text-[#6b5b45]">
        Articles and reflections from the FAST Islamic Society.
      </p>

      {error && (
        <p className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          Sorry, the blogs could not be loaded right now. Please try again
          later.
        </p>
      )}

      {!error && posts && posts.length === 0 && (
        <p>No posts yet. Please check back soon.</p>
      )}

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts?.map((post) => (
          <BlogCard
            key={post.id}
            slug={post.slug}
            title={post.title}
            excerpt={post.excerpt}
            author={post.author_name}
            date={formatDate(post.published_at)}
            coverUrl={blogImageUrl(post.cover_image_path)}
            coverAlt={post.cover_image_alt}
          />
        ))}
      </div>
    </main>
  );
}