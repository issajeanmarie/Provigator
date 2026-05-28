import { db } from "@/lib/db";
import type { MonitorResult, ProjectStatus } from "@/types";
import { sendDownAlert, sendRecoveryAlert } from "./email";

const TIMEOUT = 15_000;
const MAX_RETRIES = 2;

async function checkUrl(url: string): Promise<MonitorResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Provigator/1.0 Uptime Monitor",
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - start;

    if (response.ok) {
      return { status: "UP", responseTime, errorMessage: null };
    }
    return {
      status: "DOWN",
      responseTime,
      errorMessage: `HTTP ${response.status} ${response.statusText}`,
    };
  } catch (error: unknown) {
    const responseTime = Date.now() - start;
    let errorMessage = "Unknown error";

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = `Timeout after ${TIMEOUT}ms`;
      } else if (error.message.includes("ENOTFOUND")) {
        errorMessage = "DNS resolution failed";
      } else if (error.message.includes("ECONNREFUSED")) {
        errorMessage = "Connection refused";
      } else if (
        error.message.includes("SSL") ||
        error.message.includes("certificate") ||
        error.message.includes("CERT")
      ) {
        errorMessage = `SSL/TLS error: ${error.message}`;
      } else {
        errorMessage = error.message;
      }
    }

    return { status: "DOWN", responseTime, errorMessage };
  }
}

async function checkWithRetries(url: string): Promise<MonitorResult> {
  let lastResult: MonitorResult = { status: "DOWN", responseTime: null, errorMessage: "No check performed" };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    lastResult = await checkUrl(url);
    if (lastResult.status === "UP") return lastResult;
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  return lastResult;
}

export async function monitorAllProjects() {
  const projects = await db.project.findMany();
  if (projects.length === 0) return;

  const BATCH_SIZE = 5;
  for (let i = 0; i < projects.length; i += BATCH_SIZE) {
    const batch = projects.slice(i, i + BATCH_SIZE);
    await Promise.allSettled(
      batch.map(async (project) => {
        const result = await checkWithRetries(project.url);
        const previousStatus = project.currentStatus as ProjectStatus;

        await db.monitoringLog.create({
          data: {
            projectId: project.id,
            status: result.status,
            responseTime: result.responseTime,
            errorMessage: result.errorMessage,
          },
        });

        await db.project.update({
          where: { id: project.id },
          data: {
            currentStatus: result.status,
            responseTime: result.responseTime,
            lastCheckedAt: new Date(),
          },
        });

        const statusChanged = previousStatus !== result.status && previousStatus !== "CHECKING";

        if (statusChanged && result.status === "DOWN") {
          await sendDownAlert({
            projectName: project.name,
            clientName: project.clientName,
            url: project.url,
            errorMessage: result.errorMessage ?? "Unknown error",
            responseTime: result.responseTime,
            timestamp: new Date(),
          }).catch(console.error);
        }

        if (statusChanged && result.status === "UP" && previousStatus === "DOWN") {
          await sendRecoveryAlert({
            projectName: project.name,
            clientName: project.clientName,
            url: project.url,
            responseTime: result.responseTime,
            timestamp: new Date(),
          }).catch(console.error);
        }
      })
    );
  }
}

export async function monitorSingleProject(projectId: string) {
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return;

  const result = await checkWithRetries(project.url);

  await db.monitoringLog.create({
    data: {
      projectId: project.id,
      status: result.status,
      responseTime: result.responseTime,
      errorMessage: result.errorMessage,
    },
  });

  await db.project.update({
    where: { id: project.id },
    data: {
      currentStatus: result.status,
      responseTime: result.responseTime,
      lastCheckedAt: new Date(),
    },
  });

  return result;
}
