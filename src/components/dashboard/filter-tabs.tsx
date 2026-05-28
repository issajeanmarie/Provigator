"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Up", value: "UP" },
  { label: "Down", value: "DOWN" },
  { label: "Checking", value: "CHECKING" },
] as const;

export function FilterTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("status") ?? "";

  function handleFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    router.replace(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          onClick={() => handleFilter(filter.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
            currentFilter === filter.value
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
              : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
