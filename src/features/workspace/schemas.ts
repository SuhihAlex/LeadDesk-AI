import { z } from "zod"

export const workspaceSettingsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must contain at least 2 characters.")
    .max(120, "Full name is too long."),

  workspaceName: z
    .string()
    .trim()
    .min(1, "Company name is required.")
    .max(120, "Company name is too long."),
})

export const workspaceInvitationSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email address is required.")
    .email("Enter a valid email address.")
    .max(254, "Email address is too long."),
})