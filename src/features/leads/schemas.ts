import { z } from "zod"

const optionalWebsiteUrlSchema = z
  .string()
  .trim()
  .max(2048, "Website URL is too long.")
  .refine(
    (value) => {
      if (!value) {
        return true
      }

      try {
        const url = new URL(value)

        return url.protocol === "http:" || url.protocol === "https:"
      } catch {
        return false
      }
    },
    {
      message: "Enter a valid website URL.",
    },
  )

export const publicLeadSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must contain at least 2 characters.")
    .max(120, "Full name is too long."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email address is required.")
    .email("Enter a valid email address.")
    .max(254, "Email address is too long."),

  company: z
    .string()
    .trim()
    .max(160, "Company name is too long."),

  projectType: z.enum([
    "marketing_website",
    "ecommerce",
    "saas_mvp",
    "web_application",
    "redesign",
    "other",
  ]),

  budgetRange: z.enum([
    "under_3000",
    "3000_7000",
    "7000_15000",
    "15000_30000",
    "over_30000",
    "not_sure",
  ]),

  desiredTimeline: z.enum([
    "asap",
    "one_month",
    "one_to_two_months",
    "three_to_six_months",
    "flexible",
  ]),

  description: z
    .string()
    .trim()
    .min(20, "Describe the project in at least 20 characters.")
    .max(10000, "Project description is too long."),

  websiteUrl: optionalWebsiteUrlSchema,

  consent: z.literal("on", {
    error: "Consent is required.",
  }),

  /*
   * Honeypot field. A normal user never sees or fills this.
   */
  website: z.string().max(0, "Invalid form submission."),
})