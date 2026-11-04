import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import PostForm from "../post-form";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase } = await requireStaff();
  const { id } = await params;

  const { data: post } = await supabase
    .from("blogs")
    .select("id, title, slug, excerpt, content, author_name, status")
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/admin" className="text-sm underline">
        ← Back to posts
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">Edit post</h1>
      <PostForm post={post} />
    </main>
  );
}