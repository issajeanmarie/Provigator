import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { ProjectForm } from "@/components/forms/project-form";
import { updateProjectAction } from "@/actions/projects";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id } });
  return {
    title: project ? `Edit ${project.name} — Provigator` : "Project Not Found",
  };
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;

  const project = await db.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/projects/${project.id}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to {project.name}
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Edit Project
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Update monitoring details for {project.name}
        </p>
      </div>

      <Card className="max-w-lg">
        <ProjectForm
          action={updateProjectAction}
          defaultValues={{
            id: project.id,
            name: project.name,
            clientName: project.clientName,
            url: project.url,
          }}
          submitLabel="Save Changes"
        />
      </Card>
    </div>
  );
}
