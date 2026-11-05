"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    redirect("/admin/login?error=invalid");
  }

  // Only admins and publishers may enter the admin area.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "publisher")) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=noaccess");
  }

  redirect("/admin");
}