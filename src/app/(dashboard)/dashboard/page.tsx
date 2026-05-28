import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProjectCard } from "@/components/dashboard/project-card";
import { SearchBar } from "@/components/dashboard/search-bar";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardSkeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Dashboard — Provigator",
};

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

async function DashboardContent({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const query = params.q?.toLowerCase() ?? "";
  const statusFilter = params.status ?? "";

  const allProjects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: allProjects.length,
    up: allProjects.filter((p) => p.currentStatus === "UP").length,
    down: allProjects.filter((p) => p.currentStatus === "DOWN").length,
    checking: allProjects.filter((p) => p.currentStatus === "CHECKING").length,
  };

  const filtered = allProjects.filter((p) => {
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.clientName.toLowerCase().includes(query) ||
      p.url.toLowerCase().includes(query);
    const matchesStatus = !statusFilter || p.currentStatus === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <StatsCards {...stats} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar />
          <FilterTabs />
        </div>
        <Link href="/projects/new">
          <Button>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Project
          </Button>
        </Link>
      </div>

      {filtered.length === 0 ? (
        allProjects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Start monitoring your first project by adding it to the dashboard."
            actionLabel="Add Your First Project"
            actionHref="/projects/new"
            icon={
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            }
          />
        ) : (
          <EmptyState
            title="No matching projects"
            description="Try adjusting your search or filter to find what you're looking for."
            icon={
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            }
          />
        )
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage(props: DashboardPageProps) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Monitor all your projects in real-time
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
