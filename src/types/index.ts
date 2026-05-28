export type ProjectStatus = "UP" | "DOWN" | "CHECKING";

export interface MonitorResult {
  status: ProjectStatus;
  responseTime: number | null;
  errorMessage: string | null;
}

export interface ActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}
