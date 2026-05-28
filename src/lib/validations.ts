import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .refine((email) => email.toLowerCase().endsWith("@awesomity.rw"), {
      message: "Only @awesomity.rw emails are allowed",
    }),
  password: z.string().min(1, "Password is required"),
});

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be less than 100 characters"),
  clientName: z
    .string()
    .min(1, "Client name is required")
    .max(100, "Client name must be less than 100 characters"),
  url: z
    .string()
    .url("Invalid URL format")
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return ["http:", "https:"].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      { message: "URL must use http or https protocol" }
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
