import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type StaffRole = "admin" | "publisher";

// Returns the signed-in admin/publisher, or null for everyone else.
export async function getStaff() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "publisher")) {
    return null;
  }

  return { supabase, user, role: profile.role as StaffRole };
}

// Use at the top of every admin page: sends visitors to the login page.
export async function requireStaff() {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login");
  return staff;
}