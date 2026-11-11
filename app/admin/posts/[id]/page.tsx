import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import PostForm from "../post-form";
import StatusPanel from "./status-panel";

// Dates are formatted here on the server, in Pakistan time, so every
// reader sees the same date.
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Karachi",
  });
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase, role } = await requireStaff();
  const { id } = await params;

  const { data: post } = await supabase
    .from("blogs")
    .select(
      "id, title, slug, excerpt, content, author_name, cover_image_path, cover_image_alt, status, approved_by, approved_at, published_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();

  // Only admins are allowed to read other people's profiles, so a publisher
  // gets no name back and sees "an admin" instead.
  let approverName = "an admin";
  if (post.approved_by) {
    const { data: approver } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", post.approved_by)
      .maybeSingle();
    if (approver) approverName = approver.full_name || approver.email;
  }

  const approvedText = post.approved_at
    ? `Approved by ${approverName} on ${formatDate(post.approved_at)}`
    : null;
  const publishedText = post.published_at
    ? `Published on ${formatDate(post.published_at)}`
    : null;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/admin" className="text-sm underline">
        ← Back to posts
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">Edit post</h1>
      <StatusPanel
        id={post.id}
        status={post.status}
        role={role}
        approvedText={approvedText}
        publishedText={publishedText}
      />
      <PostForm post={post} />
    </main>
  );
}