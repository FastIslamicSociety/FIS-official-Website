import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { logout } from "./actions";

const statusLabels: Record<string, string> = {
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
  published: "Published",
};

export default async function AdminHome() {
  const { supabase, user, role } = await requireStaff();

  const { data: posts, error } = await supabase
    .from("blogs")
    .select("id, title, slug, status, author_name, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">FIS Admin</h1>
        <form action={logout}>
          <button
            type="submit"
            className="rounded border border-gray-400 px-3 py-1 text-sm hover:bg-gray-100"
          >
            Sign out
          </button>
        </form>
      </header>

      <p className="mb-6 text-sm">
        Signed in as <strong>{user.email}</strong> ({role})
      </p>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Blog posts</h2>
        <Link
          href="/admin/posts/new"
          className="rounded bg-green-800 px-3 py-2 text-sm font-semibold text-white"
        >
          New post
        </Link>
      </div>

      {error && (
        <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Could not load posts: {error.message}
        </p>
      )}

      {posts && posts.length === 0 && (
        <p className="text-gray-600">No posts yet. Click New post to start.</p>
      )}

      <ul className="divide-y divide-gray-300">
        {posts?.map((post) => (
          <li key={post.id} className="flex items-center justify-between py-3">
            <div>
              <Link
                href={`/admin/posts/${post.id}`}
                className="font-medium underline"
              >
                {post.title}
              </Link>
              <p className="text-xs text-gray-500">
                by {post.author_name} · updated{" "}
                {new Date(post.updated_at).toLocaleDateString("en-GB")}
              </p>
            </div>
            <span className="rounded-full border border-gray-400 px-2 py-0.5 text-xs">
              {statusLabels[post.status] ?? post.status}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}