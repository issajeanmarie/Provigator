import Link from "next/link";
import { Button } from "./button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 px-6 py-16 text-center dark:border-neutral-700">
      {icon && (
        <div className="mb-4 text-neutral-400 dark:text-neutral-500">{icon}</div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
