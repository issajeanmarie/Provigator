"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/types";

interface ProjectFormProps {
  action: (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  defaultValues?: {
    id?: string;
    name: string;
    clientName: string;
    url: string;
  };
  submitLabel: string;
}

export function ProjectForm({ action, defaultValues, submitLabel }: ProjectFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-5">
      {defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {state.error}
        </div>
      )}

      <Input
        id="name"
        name="name"
        label="Project Name"
        placeholder="e.g. Company Website"
        defaultValue={defaultValues?.name}
        error={state?.fieldErrors?.name?.[0]}
        required
      />

      <Input
        id="clientName"
        name="clientName"
        label="Client Name"
        placeholder="e.g. Acme Corp"
        defaultValue={defaultValues?.clientName}
        error={state?.fieldErrors?.clientName?.[0]}
        required
      />

      <Input
        id="url"
        name="url"
        label="URL"
        type="url"
        placeholder="https://example.com"
        defaultValue={defaultValues?.url}
        error={state?.fieldErrors?.url?.[0]}
        required
      />

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={isPending}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
