import Link from "next/link";
import Image from "next/image";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate, formatResponseTime } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    clientName: string;
    url: string;
    thumbnail: string | null;
    currentStatus: string;
    responseTime: number | null;
    lastCheckedAt: Date | null;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group rounded-xl border border-neutral-200 bg-white transition-all duration-200 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:shadow-neutral-900/50">
        <div className="relative h-44 w-full overflow-hidden rounded-t-xl bg-neutral-100 dark:bg-neutral-800">
          {project.thumbnail ? (
            <Image
              src={project.thumbnail}
              alt={`${project.name} screenshot`}
              fill
              className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg className="h-10 w-10 text-neutral-300 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
          )}
          <div className="absolute right-3 top-3">
            <StatusBadge status={project.currentStatus} />
          </div>
        </div>

        <div className="p-4">
          <h3 className="mb-0.5 truncate text-sm font-semibold text-neutral-900 dark:text-white">
            {project.name}
          </h3>
          <p className="mb-3 truncate text-xs text-neutral-500 dark:text-neutral-400">
            {project.clientName}
          </p>

          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span className="truncate max-w-[60%]" title={project.url}>
              {new URL(project.url).hostname}
            </span>
            <div className="flex items-center gap-3">
              {project.responseTime !== null && (
                <span className="font-mono">{formatResponseTime(project.responseTime)}</span>
              )}
              <span>{formatDate(project.lastCheckedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
