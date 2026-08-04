"use server"

import { publicLeadSchema } from "@/features/leads/schemas"
import type { PublicLeadFormState } from "@/features/leads/types"
import { getDemoPublicFormToken } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value : ""
}

export async function createPublicLeadAction(
  _previousState: PublicLeadFormState,
  formData: FormData,
): Promise<PublicLeadFormState> {
  const parsed = publicLeadSchema.safeParse({
    fullName: getStringValue(formData, "fullName"),
    email: getStringValue(formData, "email"),
    company: getStringValue(formData, "company"),
    projectType: getStringValue(formData, "projectType"),
    budgetRange: getStringValue(formData, "budgetRange"),
    desiredTimeline: getStringValue(formData, "desiredTimeline"),
    description: getStringValue(formData, "description"),
    websiteUrl: getStringValue(formData, "websiteUrl"),
    consent: getStringValue(formData, "consent"),
    website: getStringValue(formData, "website"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const formToken = getDemoPublicFormToken()

  const { data, error } = await supabase.rpc("create_public_lead", {
    form_token: formToken,
    lead_full_name: parsed.data.fullName,
    lead_email: parsed.data.email,
    lead_company: parsed.data.company,
    lead_project_type: parsed.data.projectType,
    lead_budget_range: parsed.data.budgetRange,
    lead_desired_timeline: parsed.data.desiredTimeline,
    lead_description: parsed.data.description,
    lead_website_url: parsed.data.websiteUrl,
    lead_consent_given: true,
  })

  if (error) {
    return {
      status: "error",
      message:
        "Your inquiry could not be submitted. Please check the form and try again.",
    }
  }

  if (typeof data !== "string" || !data) {
    return {
      status: "error",
      message:
        "The inquiry was submitted, but no confirmation ID was returned.",
    }
  }

  return {
    status: "success",
    message:
      "Thanks — your project inquiry has been received. Our team will review it shortly.",
    leadId: data,
  }
}