import "server-only"

import { getAiQualificationProvider } from "@/features/ai/get-ai-provider"
import {
  aiQualificationOutputSchema,
} from "@/features/ai/qualification-schema"
import { normalizeQualificationScore } from "@/features/ai/validate-qualification-score"
import { getCurrentWorkspace } from "@/features/workspace/get-current-workspace"
import { createClient } from "@/lib/supabase/server"

type QualifiableLeadRow = {
  id: string
  full_name: string
  email: string
  company: string | null
  project_type: string
  budget_range: string
  desired_timeline: string
  description: string
  website_url: string | null
  source: string
  ai_status: "pending" | "processing" | "completed" | "failed"
}

export type QualifyLeadResult =
  | {
      status: "success"
      qualificationId: string
    }
  | {
      status: "already_processing"
    }
  | {
      status: "error"
      message: string
    }

function getSafeFailureMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message.slice(0, 1000)
  }

  return "AI qualification failed unexpectedly."
}

export async function qualifyLead(
  leadId: string,
): Promise<QualifyLeadResult> {
  const context = await getCurrentWorkspace()
  const supabase = await createClient()

  const { data: leadData, error: leadError } =
    await supabase
      .from("leads")
      .select(
        `
          id,
          full_name,
          email,
          company,
          project_type,
          budget_range,
          desired_timeline,
          description,
          website_url,
          source,
          ai_status
        `,
      )
      .eq("workspace_id", context.workspace.id)
      .eq("id", leadId)
      .maybeSingle()

  if (leadError) {
    return {
      status: "error",
      message: "The lead could not be loaded.",
    }
  }

  if (!leadData) {
    return {
      status: "error",
      message: "Lead not found.",
    }
  }

  const lead = leadData as QualifiableLeadRow

  const { data: started, error: startError } =
    await supabase.rpc(
      "start_lead_qualification",
      {
        target_lead_id: lead.id,
      },
    )

  if (startError) {
    return {
      status: "error",
      message:
        "AI qualification could not be started.",
    }
  }

  if (started !== true) {
    return {
      status: "already_processing",
    }
  }

  try {
    const provider =
      getAiQualificationProvider()

    const providerResult =
      await provider.qualifyLead({
        lead: {
          id: lead.id,
          fullName: lead.full_name,
          email: lead.email,
          company: lead.company,
          projectType: lead.project_type,
          budgetRange: lead.budget_range,
          desiredTimeline:
            lead.desired_timeline,
          description: lead.description,
          websiteUrl: lead.website_url,
          source: lead.source,
        },
        studioContext: {
          name: "LeadDesk Studio",
          services: [
            "Corporate websites",
            "Landing pages",
            "E-commerce",
            "SaaS MVP",
            "Web applications",
            "Website redesign",
            "Frontend development",
          ],
          responseLanguage: "English",
        },
      })

    const validatedOutput =
      aiQualificationOutputSchema.parse(
        providerResult.output,
      )

    const output =
      normalizeQualificationScore(
        validatedOutput,
      )

    const {
      data: qualificationId,
      error: completeError,
    } = await supabase.rpc(
      "complete_lead_qualification",
      {
        target_lead_id: lead.id,

        qualification_summary:
          output.summary,

        qualification_score:
          output.score.total,

        qualification_completeness_score:
          output.qualification
            .completenessScore,

        qualification_priority:
          output.qualification.priority,

        qualification_service_fit:
          output.qualification.serviceFit,

        qualification_urgency:
          output.qualification.urgency,

        extracted_project_type:
          output.extracted.projectType,

        extracted_services:
          output.extracted.requestedServices,

        extracted_budget:
          output.extracted.budget,

        extracted_timeline:
          output.extracted.timeline,

        extracted_company_context:
          output.extracted.companyContext,

        extracted_main_goal:
          output.extracted.mainGoal,

        qualification_missing_information:
          output.missingInformation,

        qualification_risks:
          output.risks,

        qualification_score_breakdown:
          output.score,

        qualification_model:
          providerResult.model,

        qualification_prompt_version:
          providerResult.promptVersion,

        qualification_raw_response:
          providerResult.rawResponse,

        draft_subject:
          output.replyDraft.subject,

        draft_body:
          output.replyDraft.body,
      },
    )

    if (
      completeError ||
      typeof qualificationId !== "string"
    ) {
      throw new Error(
        completeError?.message ||
          "Qualification could not be persisted.",
      )
    }

    return {
      status: "success",
      qualificationId,
    }
  } catch (error) {
    const failureMessage =
      getSafeFailureMessage(error)

    const { error: failureError } =
      await supabase.rpc(
        "fail_lead_qualification",
        {
          target_lead_id: lead.id,
          failure_message: failureMessage,
        },
      )

    if (failureError) {
      console.error(
        "AI qualification failure state could not be persisted.",
        {
          leadId: lead.id,
          qualificationError:
            failureMessage,
          persistenceError:
            failureError.message,
        },
      )
    }

    return {
      status: "error",
      message:
        "AI qualification failed. The lead remains available and can be retried.",
    }
  }
}