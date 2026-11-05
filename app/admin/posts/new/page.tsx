import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import PostForm from "../post-form";

export default async function NewPostPage() {
  await requireStaff();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/admin" className="text-sm underline">
        ← Back to posts
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">New post</h1>
      <PostForm />
    </main>
  );
}