"use server";

import { redirect } from "next/navigation";
import {
  isValidEmail,
  isValidPassword,
  createSession,
  setSessionCookie,
  destroySession,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/types";

export async function loginAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const rateCheck = checkRateLimit(raw.email?.toLowerCase() ?? "unknown");
  if (!rateCheck.allowed) {
    return { success: false, error: "Too many login attempts. Please try again later." };
  }

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, fieldErrors };
  }

  const { email, password } = parsed.data;

  if (!isValidEmail(email)) {
    return { success: false, error: "Only @awesomity.rw emails are allowed" };
  }

  if (!isValidPassword(password)) {
    return { success: false, error: "Invalid credentials" };
  }

  const token = await createSession(email);
  await setSessionCookie(token);

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
