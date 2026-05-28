import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/forms/login-form";

export const metadata = {
  title: "Sign In — Provigator",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-dark">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
            <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Welcome to Provigator
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Awesomity&apos;s internal uptime monitor
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <LoginForm />
        </div>

        <p className="mt-4 text-center text-xs text-neutral-400 dark:text-neutral-500">
          Only @awesomity.rw emails are authorized
        </p>
      </div>
    </div>
  );
}
