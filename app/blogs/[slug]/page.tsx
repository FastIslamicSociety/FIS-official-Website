import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Markdown from "@/components/markdown";
import { formatDate } from "@/lib/format";
import { blogImageUrl, createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

// cache() lets the page and its metadata share one database lookup.
const getPost = cache(async (slug: string) => {
  const { data } = await createPublicClient()
    .from("blogs")
    .select(
      "title, slug, excerpt, content, author_name, published_at, cover_image_path, cover_image_alt"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found | FAST Islamic Society" };

  const cover = blogImageUrl(post.cover_image_path);
  return {
    title: `${post.title} | FAST Islamic Society`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const cover = blogImageUrl(post.cover_image_path);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <a href="/blogs" className="text-sm underline">
        ← All blogs
      </a>

      <h1 className="font-display mt-4 text-4xl font-black leading-tight text-[#2d7550] md:text-5xl">
        {post.title}
      </h1>
      <p className="mb-8 mt-3 text-sm text-[#6b5b45]">
        By {post.author_name}
        {post.published_at && <> · {formatDate(post.published_at)}</>}
      </p>

      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt={post.cover_image_alt ?? ""}
          className="mb-8 max-h-96 w-full rounded-lg object-cover"
        />
      )}

      <Markdown>{post.content}</Markdown>
    </main>
  );
}