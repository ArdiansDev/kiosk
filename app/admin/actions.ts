"use server";

import {
  assertAdminEnvironment,
  clearAdminSession,
  createAdminSession,
  sanitizeAdminNextPath,
  validateAdminCredentials,
} from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export type AdminLoginState = {
  error: string;
};

export async function loginAdmin(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  assertAdminEnvironment();

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = sanitizeAdminNextPath(
    String(formData.get("next") ?? "/admin"),
  );

  if (!username || !password) {
    return {
      error: "Username dan password admin wajib diisi.",
    };
  }

  if (!validateAdminCredentials(username, password)) {
    return {
      error: "Username atau password admin tidak valid.",
    };
  }

  await createAdminSession();
  redirect(nextPath);
}

export async function logoutAdmin() {
  assertAdminEnvironment();

  await clearAdminSession();
  redirect("/admin/login");
}
