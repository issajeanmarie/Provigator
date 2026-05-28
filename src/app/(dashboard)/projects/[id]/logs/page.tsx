import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate, formatResponseTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id } });
  return {
    title: project ? `Logs — ${project.name} — Provigator` : "Not Found",
  };
}

export default async function ProjectLogsPage({ params }: PageProps) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    include: {
      monitoringLogs: {
        orderBy: { checkedAt: "desc" },
        take: 200,
      },
    },
  });

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
          Monitoring Logs
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Full monitoring history for {project.name}
        </p>
      </div>

      <Card>
        {project.monitoringLogs.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            No monitoring logs available yet.
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
                {project.monitoringLogs.map((log) => (
                  <tr key={log.id}>
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
      </Card>
    </div>
  );
}
