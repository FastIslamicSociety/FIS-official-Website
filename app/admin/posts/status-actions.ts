"use server";

import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";

export type StatusAction = "approve" | "publish" | "back_to_draft";

const newStatus = {
  approve: "approved",
  publish: "published",
  back_to_draft: "draft",
} as const;

// Moves a post along the workflow. The database also enforces these rules.
export async function changeStatus(
  id: string,
  action: StatusAction
): Promise<{ error: string } | undefined> {
  const { supabase, role } = await requireStaff();

  // Publishers may publish; everything else here is for admins only.
  if (action !== "publish" && role !== "admin") {
    return { error: "Only admins can do this." };
  }

  const { data, error } = await supabase
    .from("blogs")
    .update({ status: newStatus[action] })
    .eq("id", id)
    .select("id");

  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: "Could not change the status: post not found or no permission." };
  }

  redirect("/admin");
}

export async function deletePost(
  id: string
): Promise<{ error: string } | undefined> {
  const { supabase, role } = await requireStaff();

  if (role !== "admin") {
    return { error: "Only admins can delete posts." };
  }

  const { data, error } = await supabase
    .from("blogs")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: "Could not delete: post not found or no permission." };
  }

  redirect("/admin");
}