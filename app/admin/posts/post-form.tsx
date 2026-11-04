"use client";

import { useState, useTransition } from "react";
import { savePost, type SaveIntent } from "./actions";

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author_name: string;
  status: "draft" | "in_review" | "approved" | "published";
};

export default function PostForm({ post }: { post?: Post }) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [authorName, setAuthorName] = useState(post?.author_name ?? "");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  // Published posts cannot change their slug (the database blocks it).
  const slugLocked = post?.status === "published";
  const locked = post?.status === "approved" || post?.status === "published";

  function submit(intent: SaveIntent) {
    setError("");
    startTransition(async () => {
      const result = await savePost(
        {
          id: post?.id,
          title,
          slug,
          excerpt,
          content,
          author_name: authorName,
        },
        intent
      );
      if (result?.error) setError(result.error);
    });
  }

  const input = "rounded border border-gray-400 p-2";

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Title
        <input
          className={input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Slug (the web address, leave empty to make it from the title)
        <input
          className={input}
          value={slug}
          disabled={slugLocked}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="ramadan-reflections-2026"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Author name
        <input
          className={input}
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Short summary (optional)
        <textarea
          className={input}
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Article (Markdown)
        <textarea
          className={`${input} font-mono`}
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </label>

      <div className="flex flex-wrap gap-3">
        {locked ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => submit("save")}
            className="rounded bg-green-800 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save changes"}
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => submit("draft")}
              className="rounded border border-gray-400 px-4 py-2 disabled:opacity-50"
            >
              {pending ? "Saving..." : "Save as draft"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => submit("review")}
              className="rounded bg-green-800 px-4 py-2 font-semibold text-white disabled:opacity-50"
            >
              {pending ? "Saving..." : "Submit for review"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}