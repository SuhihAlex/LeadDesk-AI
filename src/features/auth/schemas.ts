import { z } from "zod"

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email address is required.")
  .email("Enter a valid email address.")
  .max(254, "Email address is too long.")

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters.")
  .max(128, "Password is too long.")

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
})

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must contain at least 2 characters.")
    .max(120, "Full name is too long."),

  company: z
    .string()
    .trim()
    .min(1, "Company name is required.")
    .max(120, "Company name is too long."),

  email: emailSchema,
  password: passwordSchema,

  terms: z.literal("on", {
    error: "You must accept the Terms and Privacy Policy.",
  }),
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, "Confirm your new password."),
  })
  .refine(
    (values) => values.newPassword === values.confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    },
  )