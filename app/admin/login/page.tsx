import { redirect } from "next/navigation";
import { getStaff } from "@/lib/auth";
import { login } from "./actions";

const messages: Record<string, string> = {
  invalid: "Wrong email or password.",
  noaccess: "This account does not have admin access.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Already signed in? Go straight to the dashboard.
  if (await getStaff()) redirect("/admin");

  const { error } = await searchParams;
  const message = error ? messages[error] : undefined;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">FIS Admin</h1>

      {message && (
        <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {message}
        </p>
      )}

      <form action={login} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded border border-gray-400 p-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded border border-gray-400 p-2"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-green-800 p-2 font-semibold text-white hover:bg-green-900"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}