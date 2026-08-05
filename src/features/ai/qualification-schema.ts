import { z } from "zod"

export const aiServiceFitSchema = z.enum([
  "poor",
  "partial",
  "good",
  "excellent",
])

export const aiUrgencySchema = z.enum([
  "low",
  "medium",
  "high",
])

export const aiPrioritySchema = z.enum([
  "low",
  "medium",
  "high",
  "urgent",
])

export const aiScoreBreakdownSchema = z
  .object({
    total: z.number().int().min(0).max(100),
    budget: z.number().int().min(0).max(25),
    timeline: z.number().int().min(0).max(15),
    completeness: z.number().int().min(0).max(20),
    serviceFit: z.number().int().min(0).max(20),
    urgency: z.number().int().min(0).max(10),
    descriptionQuality: z
      .number()
      .int()
      .min(0)
      .max(10),
    explanation: z
      .array(z.string().trim().min(1).max(500))
      .max(12),
  })
  .strict()

export const aiQualificationOutputSchema = z
  .object({
    summary: z.string().trim().min(1).max(3000),

    extracted: z
      .object({
        projectType: z
          .string()
          .trim()
          .min(1)
          .max(160),

        requestedServices: z
          .array(
            z.string().trim().min(1).max(160),
          )
          .max(12),

        budget: z
          .string()
          .trim()
          .min(1)
          .max(160)
          .nullable(),

        timeline: z
          .string()
          .trim()
          .min(1)
          .max(160)
          .nullable(),

        companyContext: z
          .string()
          .trim()
          .min(1)
          .max(1000)
          .nullable(),

        mainGoal: z
          .string()
          .trim()
          .min(1)
          .max(1000)
          .nullable(),
      })
      .strict(),

    qualification: z
      .object({
        serviceFit: aiServiceFitSchema,
        urgency: aiUrgencySchema,
        completenessScore: z
          .number()
          .int()
          .min(0)
          .max(100),
        priority: aiPrioritySchema,
      })
      .strict(),

    missingInformation: z
      .array(z.string().trim().min(1).max(500))
      .max(20),

    risks: z
      .array(z.string().trim().min(1).max(500))
      .max(20),

    score: aiScoreBreakdownSchema,

    replyDraft: z
      .object({
        subject: z
          .string()
          .trim()
          .min(1)
          .max(240),

        body: z
          .string()
          .trim()
          .min(1)
          .max(10000),
      })
      .strict(),
  })
  .strict()

export type AiServiceFit = z.infer<
  typeof aiServiceFitSchema
>

export type AiUrgency = z.infer<
  typeof aiUrgencySchema
>

export type AiPriority = z.infer<
  typeof aiPrioritySchema
>

export type AiScoreBreakdown = z.infer<
  typeof aiScoreBreakdownSchema
>

export type AiQualificationOutput = z.infer<
  typeof aiQualificationOutputSchema
>