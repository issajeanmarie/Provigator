"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";
import { captureScreenshot } from "@/services/screenshot";
import { monitorSingleProject } from "@/services/monitoring";
import type { ActionResult } from "@/types";

async function requireAuth() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function createProjectAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();

  const raw = {
    name: formData.get("name") as string,
    clientName: formData.get("clientName") as string,
    url: formData.get("url") as string,
  };

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, fieldErrors };
  }

  const { name, clientName, url } = parsed.data;

  const existing = await db.project.findUnique({ where: { url } });
  if (existing) {
    return { success: false, fieldErrors: { url: ["This URL is already being monitored"] } };
  }

  const project = await db.project.create({
    data: { name, clientName, url },
  });

  captureScreenshot(url, project.id)
    .then(async (thumbnailPath) => {
      if (thumbnailPath) {
        await db.project.update({
          where: { id: project.id },
          data: { thumbnail: thumbnailPath },
        });
      }
    })
    .catch(console.error);

  monitorSingleProject(project.id).catch(console.error);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateProjectAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth();

  const id = formData.get("id") as string;
  if (!id) return { success: false, error: "Project ID is required" };

  const raw = {
    name: formData.get("name") as string,
    clientName: formData.get("clientName") as string,
    url: formData.get("url") as string,
  };

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, fieldErrors };
  }

  const { name, clientName, url } = parsed.data;

  const existing = await db.project.findFirst({
    where: { url, NOT: { id } },
  });
  if (existing) {
    return { success: false, fieldErrors: { url: ["This URL is already being monitored by another project"] } };
  }

  const currentProject = await db.project.findUnique({ where: { id } });
  if (!currentProject) {
    return { success: false, error: "Project not found" };
  }

  await db.project.update({
    where: { id },
    data: { name, clientName, url },
  });

  if (currentProject.url !== url) {
    captureScreenshot(url, id)
      .then(async (thumbnailPath) => {
        if (thumbnailPath) {
          await db.project.update({
            where: { id },
            data: { thumbnail: thumbnailPath },
          });
        }
      })
      .catch(console.error);

    monitorSingleProject(id).catch(console.error);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/projects/${id}`);
  redirect("/dashboard");
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  await requireAuth();

  const id = formData.get("id") as string;
  if (!id) return;

  await db.project.delete({ where: { id } }).catch(() => {});

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
