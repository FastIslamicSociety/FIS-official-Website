"use server";

import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";

export type PostInput = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_name: string;
};

// "draft"  = save as draft
// "review" = save and send for review
// "save"   = save changes without touching the status (approved/published posts)
export type SaveIntent = "draft" | "review" | "save";

// Turns "Ramadan Reflections 2026!" into "ramadan-reflections-2026"
function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Returns an error message to show, or redirects to the dashboard on success.
export async function savePost(
  input: PostInput,
  intent: SaveIntent
): Promise<{ error: string } | undefined> {
  // Server actions can be called by anyone, so check the login again here.
  const { supabase, user } = await requireStaff();

  const title = input.title.trim();
  const content = input.content.trim();
  const authorName = input.author_name.trim();
  const excerpt = input.excerpt.trim();

  if (!title || !content || !authorName) {
    return { error: "Title, content and author name are required." };
  }

  const slug = slugify(input.slug.trim() || title);
  if (!slug) {
    return {
      error:
        "Could not make a web address from the title. Type a slug using English letters and numbers.",
    };
  }

  const fields = {
    title,
    slug,
    excerpt: excerpt || null,
    content,
    author_name: authorName,
  };

  if (!input.id) {
    // NEW POST
    const { error } = await supabase.from("blogs").insert({
      ...fields,
      author_id: user.id,
      status: intent === "review" ? "in_review" : "draft",
    });
    if (error) return { error: friendlyError(error) };
  } else {
    // EXISTING POST
    const { data: current } = await supabase
      .from("blogs")
      .select("status")
      .eq("id", input.id)
      .maybeSingle();
    if (!current) return { error: "This post no longer exists." };

    // Only draft and in_review posts change status here.
    let status: "draft" | "in_review" | undefined;
    if (intent === "review" && current.status === "draft") status = "in_review";
    if (intent === "draft" && current.status === "in_review") status = "draft";

    const { data, error } = await supabase
      .from("blogs")
      .update(status ? { ...fields, status } : fields)
      .eq("id", input.id)
      .select("id");
    if (error) return { error: friendlyError(error) };
    if (!data || data.length === 0) {
      return { error: "Could not save: you may not have permission." };
    }
  }

  redirect("/admin");
}

function friendlyError(error: { code?: string; message: string }) {
  if (error.code === "23505") {
    return "Another post already uses this slug. Change the slug and try again.";
  }
  if (error.code === "23514") {
    return "The slug can only use lowercase English letters, numbers and single hyphens.";
  }
  return error.message;
}