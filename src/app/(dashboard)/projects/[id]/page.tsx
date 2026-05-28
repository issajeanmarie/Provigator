import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteProjectButton } from "@/components/dashboard/delete-project-button";
import { formatDate, formatResponseTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id } });
  return {
    title: project ? `${project.name} — Provigator` : "Project Not Found",
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    include: {
      monitoringLogs: {
        orderBy: { checkedAt: "desc" },
        take: 50,
      },
    },
  });

  if (!project) notFound();

  const uptimeLogs = project.monitoringLogs;
  const totalLogs = uptimeLogs.length;
  const upCount = uptimeLogs.filter((l) => l.status === "UP").length;
  const uptimePercent = totalLogs > 0 ? ((upCount / totalLogs) * 100).toFixed(1) : "—";
  const avgResponseTime =
    totalLogs > 0
      ? Math.round(
          uptimeLogs
            .filter((l) => l.responseTime !== null)
            .reduce((sum, l) => sum + (l.responseTime ?? 0), 0) /
            (uptimeLogs.filter((l) => l.responseTime !== null).length || 1)
        )
      : null;

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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {project.name}
              </h1>
              <StatusBadge status={project.currentStatus} />
            </div>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {project.clientName} —{" "}
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                {project.url}
              </a>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/projects/${project.id}/edit`}>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </Link>
            <DeleteProjectButton projectId={project.id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {project.thumbnail && (
            <Card className="overflow-hidden p-0">
              <div className="relative h-64 w-full sm:h-80">
                <Image
                  src={project.thumbnail}
                  alt={`${project.name} screenshot`}
                  fill
                  className="object-cover object-top"
                />
              </div>
            </Card>
          )}

          <Card>
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
              Monitoring History
            </h2>
            {uptimeLogs.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No monitoring data yet. The first check will run shortly.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800">
                      <th className="pb-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
                        Status
                      </th>
                      <th className="pb-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
                        Response Time
                      </th>
                      <th className="pb-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
                        Error
                      </th>
                      <th className="pb-3 text-right font-medium text-neutral-500 dark:text-neutral-400">
                        Checked At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {uptimeLogs.map((log) => (
                      <tr key={log.id} className="group">
                        <td className="py-3">
                          <StatusBadge status={log.status} />
                        </td>
                        <td className="py-3 font-mono text-neutral-700 dark:text-neutral-300">
                          {formatResponseTime(log.responseTime)}
                        </td>
                        <td className="max-w-xs truncate py-3 text-neutral-500 dark:text-neutral-400">
                          {log.errorMessage || "—"}
                        </td>
                        <td className="py-3 text-right text-neutral-500 dark:text-neutral-400">
                          {formatDate(log.checkedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {uptimeLogs.length >= 50 && (
              <div className="mt-4 text-center">
                <Link href={`/projects/${project.id}/logs`}>
                  <Button variant="ghost" size="sm">
                    View all logs
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
              Overview
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Uptime
                </dt>
                <dd className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                  {uptimePercent}%
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Avg Response Time
                </dt>
                <dd className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                  {formatResponseTime(avgResponseTime)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Last Checked
                </dt>
                <dd className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                  {formatDate(project.lastCheckedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Total Checks
                </dt>
                <dd className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                  {totalLogs}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Created
                </dt>
                <dd className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                  {formatDate(project.createdAt)}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
