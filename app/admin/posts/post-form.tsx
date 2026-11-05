"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import Markdown from "@/components/markdown";
import { savePost, type SaveIntent } from "./actions";

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author_name: string;
  cover_image_path: string | null;
  cover_image_alt: string | null;
  status: "draft" | "in_review" | "approved" | "published";
};

// Allowed image types and the file ending we give each one.
const imageTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export default function PostForm({ post }: { post?: Post }) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [authorName, setAuthorName] = useState(post?.author_name ?? "");
  const [coverPath, setCoverPath] = useState(post?.cover_image_path ?? "");
  const [coverAlt, setCoverAlt] = useState(post?.cover_image_alt ?? "");
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  // Published posts cannot change their slug (the database blocks it).
  const slugLocked = post?.status === "published";
  const locked = post?.status === "approved" || post?.status === "published";

  const coverUrl = coverPath
    ? createClient().storage.from("blog-images").getPublicUrl(coverPath).data
        .publicUrl
    : "";

  async function onPickImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be chosen again later
    if (!file) return;

    const ext = imageTypes[file.type];
    if (!ext) {
      setError("Please choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("The image must be smaller than 5 MB.");
      return;
    }

    setError("");
    setUploading(true);
    const path = `covers/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await createClient()
      .storage.from("blog-images")
      .upload(path, file, { contentType: file.type });
    setUploading(false);

    if (uploadError) {
      setError(`Image upload failed: ${uploadError.message}`);
      return;
    }
    setCoverPath(path);
  }

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
          cover_image_path: coverPath,
          cover_image_alt: coverAlt,
        },
        intent
      );
      if (result?.error) setError(result.error);
    });
  }

  const input = "rounded border border-gray-400 p-2";
  const busy = pending || uploading;

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

      <fieldset className="flex flex-col gap-2 rounded border border-gray-400 p-3">
        <legend className="px-1 text-sm">Cover image (optional)</legend>

        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={coverAlt || "Cover image preview"}
            className="max-h-56 w-full rounded object-cover"
          />
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPickImage}
          disabled={busy}
          className="text-sm"
        />
        {uploading && <p className="text-sm">Uploading...</p>}
        <p className="text-xs text-gray-500">JPG, PNG or WebP, up to 5 MB.</p>

        {coverPath && (
          <>
            <label className="flex flex-col gap-1 text-sm">
              Describe the image (alt text, for screen readers)
              <input
                className={input}
                value={coverAlt}
                onChange={(e) => setCoverAlt(e.target.value)}
                placeholder="Students sitting under a banyan tree"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setCoverPath("");
                setCoverAlt("");
              }}
              className="self-start text-sm underline"
            >
              Remove image
            </button>
          </>
        )}
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        Short summary (optional)
        <textarea
          className={input}
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />
      </label>

      <div className="flex flex-col gap-1 text-sm">
        <div className="flex items-center justify-between">
          <label htmlFor="article">Article (Markdown)</label>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="text-sm underline"
          >
            {preview ? "Back to writing" : "Preview"}
          </button>
        </div>
        {preview ? (
          <div className="min-h-[24rem] rounded border border-gray-400 p-4">
            {content.trim() ? (
              <Markdown>{content}</Markdown>
            ) : (
              <p className="text-gray-500">Nothing to preview yet.</p>
            )}
          </div>
        ) : (
          <textarea
            id="article"
            className={`${input} font-mono`}
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {locked ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => submit("save")}
            className="rounded bg-green-800 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save changes"}
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => submit("draft")}
              className="rounded border border-gray-400 px-4 py-2 disabled:opacity-50"
            >
              {pending ? "Saving..." : "Save as draft"}
            </button>
            <button
              type="button"
              disabled={busy}
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