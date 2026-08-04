"use client"

import { useActionState, useState } from "react"
import { LoaderCircle, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createPublicLeadAction } from "@/features/leads/actions"
import {
  leadBudgetRangeLabels,
  leadProjectTypeLabels,
  leadTimelineLabels,
} from "@/features/leads/constants"
import { PublicLeadFieldError } from "@/features/leads/public-lead-field-error"
import { PublicLeadFormMessage } from "@/features/leads/public-lead-form-message"
import {
  initialPublicLeadFormState,
  type LeadBudgetRange,
  type LeadProjectType,
  type LeadTimeline,
} from "@/features/leads/types"

const projectTypes = Object.entries(
  leadProjectTypeLabels,
) as [LeadProjectType, string][]

const budgetRanges = Object.entries(
  leadBudgetRangeLabels,
) as [LeadBudgetRange, string][]

const timelines = Object.entries(
  leadTimelineLabels,
) as [LeadTimeline, string][]

export function PublicLeadForm() {
  const [consentAccepted, setConsentAccepted] = useState(false)

  const [state, formAction, pending] = useActionState(
    createPublicLeadAction,
    initialPublicLeadFormState,
  )

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
      <PublicLeadFormMessage state={state} />

      <div
        className="absolute -left-[9999px] top-auto size-px overflow-hidden"
        aria-hidden="true"
      >
        <Label htmlFor="website">
          Leave this field empty
        </Label>

        <Input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lead-full-name">Full name</Label>

          <Input
            id="lead-full-name"
            name="fullName"
            placeholder="Alex Morgan"
            autoComplete="name"
            disabled={pending}
            required
            aria-invalid={Boolean(state.fieldErrors?.fullName)}
          />

          <PublicLeadFieldError
            errors={state.fieldErrors?.fullName}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lead-email">Email address</Label>

          <Input
            id="lead-email"
            name="email"
            type="email"
            placeholder="alex@company.com"
            autoComplete="email"
            disabled={pending}
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
          />

          <PublicLeadFieldError errors={state.fieldErrors?.email} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lead-company">Company</Label>

        <Input
          id="lead-company"
          name="company"
          placeholder="Acme Studio"
          autoComplete="organization"
          disabled={pending}
          aria-invalid={Boolean(state.fieldErrors?.company)}
        />

        <PublicLeadFieldError errors={state.fieldErrors?.company} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="project-type">Project type</Label>

          <select
            id="project-type"
            name="projectType"
            defaultValue=""
            disabled={pending}
            required
            aria-invalid={Boolean(state.fieldErrors?.projectType)}
            className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              Select project type
            </option>

            {projectTypes.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <PublicLeadFieldError
            errors={state.fieldErrors?.projectType}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget-range">Approximate budget</Label>

          <select
            id="budget-range"
            name="budgetRange"
            defaultValue=""
            disabled={pending}
            required
            aria-invalid={Boolean(state.fieldErrors?.budgetRange)}
            className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              Select budget range
            </option>

            {budgetRanges.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <PublicLeadFieldError
            errors={state.fieldErrors?.budgetRange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="desired-timeline">Desired timeline</Label>

        <select
          id="desired-timeline"
          name="desiredTimeline"
          defaultValue=""
          disabled={pending}
          required
          aria-invalid={Boolean(state.fieldErrors?.desiredTimeline)}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="" disabled>
            Select desired timeline
          </option>

          {timelines.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <PublicLeadFieldError
          errors={state.fieldErrors?.desiredTimeline}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-description">
          Tell us about the project
        </Label>

        <Textarea
          id="project-description"
          name="description"
          placeholder="Describe the business, project goals, required pages or features, and any important constraints."
          rows={7}
          minLength={20}
          maxLength={10000}
          disabled={pending}
          required
          aria-invalid={Boolean(state.fieldErrors?.description)}
        />

        <PublicLeadFieldError
          errors={state.fieldErrors?.description}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website-url">
          Current website URL
        </Label>

        <Input
          id="website-url"
          name="websiteUrl"
          type="url"
          placeholder="https://example.com"
          autoComplete="url"
          disabled={pending}
          aria-invalid={Boolean(state.fieldErrors?.websiteUrl)}
        />

        <PublicLeadFieldError
          errors={state.fieldErrors?.websiteUrl}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="lead-consent"
            checked={consentAccepted}
            onCheckedChange={(checked) => {
              setConsentAccepted(checked === true)
            }}
            disabled={pending}
            aria-invalid={Boolean(state.fieldErrors?.consent)}
          />

          <input
            type="hidden"
            name="consent"
            value={consentAccepted ? "on" : ""}
          />

          <Label
            htmlFor="lead-consent"
            className="text-sm font-normal leading-6 text-muted-foreground"
          >
            I agree that the information submitted in this form may be
            processed to respond to my project inquiry.
          </Label>
        </div>

        <PublicLeadFieldError
          errors={state.fieldErrors?.consent}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        disabled={pending}
      >
        {pending ? (
          <LoaderCircle
            className="size-4 animate-spin"
            aria-hidden="true"
          />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}

        {pending ? "Submitting inquiry..." : "Submit project inquiry"}
      </Button>
    </form>
  )
}