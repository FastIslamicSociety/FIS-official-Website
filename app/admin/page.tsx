import { requireStaff } from "@/lib/auth";
import { logout } from "./actions";

export default async function AdminHome() {
  const { user, role } = await requireStaff();

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

      <p>
        Signed in as <strong>{user.email}</strong> ({role})
      </p>
      <p className="mt-4 text-gray-600">Blog posts will appear here.</p>
    </main>
  );
}