"use client";

import { useState, useTransition } from "react";
import { deleteProjectAction } from "@/actions/projects";
import { Button } from "@/components/ui/button";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button
        variant="danger"
        size="sm"
        onClick={() => setConfirming(true)}
      >
        Delete
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-red-600 dark:text-red-400">Are you sure?</span>
      <form
        action={(formData) => {
          startTransition(() => {
            deleteProjectAction(formData);
          });
        }}
      >
        <input type="hidden" name="id" value={projectId} />
        <Button variant="danger" size="sm" type="submit" loading={isPending}>
          {isPending ? "Deleting..." : "Confirm"}
        </Button>
      </form>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
    </div>
  );
}
