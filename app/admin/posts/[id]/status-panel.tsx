"use client";

import { useState, useTransition } from "react";
import {
  changeStatus,
  deletePost,
  type StatusAction,
} from "../status-actions";

const labels: Record<string, string> = {
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
  published: "Published",
};

export default function StatusPanel({
  id,
  status,
  role,
}: {
  id: string;
  status: string;
  role: "admin" | "publisher";
}) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const isAdmin = role === "admin";

  function run(action: StatusAction) {
    setError("");
    startTransition(async () => {
      const result = await changeStatus(id, action);
      if (result?.error) setError(result.error);
    });
  }

  function remove() {
    if (!window.confirm("Delete this post for good? This cannot be undone.")) {
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await deletePost(id);
      if (result?.error) setError(result.error);
    });
  }

  const button = "rounded px-3 py-2 text-sm font-semibold disabled:opacity-50";

  return (
    <section className="mb-6 rounded border border-gray-400 p-4">
      <p className="mb-3 text-sm">
        Status: <strong>{labels[status] ?? status}</strong>
      </p>

      {error && (
        <p className="mb-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {isAdmin && (status === "draft" || status === "in_review") && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("approve")}
            className={`${button} bg-green-800 text-white`}
          >
            Approve
          </button>
        )}

        {status === "approved" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("publish")}
            className={`${button} bg-green-800 text-white`}
          >
            Publish
          </button>
        )}

        {isAdmin && (status === "approved" || status === "published") && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("back_to_draft")}
            className={`${button} border border-gray-400`}
          >
            {status === "published" ? "Unpublish (back to draft)" : "Move back to draft"}
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            disabled={pending}
            onClick={remove}
            className={`${button} border border-red-400 text-red-700`}
          >
            Delete
          </button>
        )}
      </div>

      {status === "draft" || status === "in_review" ? (
        !isAdmin && (
          <p className="mt-3 text-xs text-gray-600">
            An admin must approve this post before it can be published.
          </p>
        )
      ) : null}
    </section>
  );
}