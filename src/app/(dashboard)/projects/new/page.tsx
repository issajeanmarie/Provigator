import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ProjectForm } from "@/components/forms/project-form";
import { createProjectAction } from "@/actions/projects";

export const metadata = {
  title: "Add Project — Provigator",
};

export default function NewProjectPage() {
  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Add New Project
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Start monitoring a new website or application
        </p>
      </div>

      <Card className="max-w-lg">
        <ProjectForm action={createProjectAction} submitLabel="Add Project" />
      </Card>
    </div>
  );
}
