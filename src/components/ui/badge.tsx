import { cn } from "@/lib/utils";
import { getStatusBgColor } from "@/lib/utils";

interface BadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        getStatusBgColor(status),
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "UP" && "bg-green-500 animate-pulse",
          status === "DOWN" && "bg-red-500",
          status === "CHECKING" && "bg-yellow-500 animate-pulse"
        )}
      />
      {status}
    </span>
  );
}
