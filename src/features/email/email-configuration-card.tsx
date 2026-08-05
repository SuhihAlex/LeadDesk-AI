import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Mail,
  MailCheck,
  Server,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import type {
  EmailConfigurationStatus,
} from "@/features/email/email-configuration"

type EmailConfigurationCardProps = {
  status: EmailConfigurationStatus
}

function getProviderDescription(
  status: EmailConfigurationStatus,
): string {
  if (status.provider === "mock") {
    return "Emails are simulated locally. No real message is delivered and no paid API is used."
  }

  if (status.provider === "resend") {
    return status.isReady
      ? "Real email delivery is configured through Resend."
      : "Resend is selected, but required environment variables are missing or invalid."
  }

  return "The configured provider is not supported by this application."
}

export function EmailConfigurationCard({
  status,
}: EmailConfigurationCardProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Mail
                className="size-5 text-primary"
                aria-hidden="true"
              />

              <h2 className="text-lg font-semibold">
                Email delivery
              </h2>
            </div>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review the active provider and
              production readiness without
              exposing credentials.
            </p>
          </div>

          <Badge
            variant={
              status.isReady
                ? "default"
                : "destructive"
            }
            className="w-fit"
          >
            {status.isReady
              ? "Ready"
              : "Action required"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <Server
                className="mt-0.5 size-5 text-primary"
                aria-hidden="true"
              />

              <div>
                <p className="text-sm font-medium">
                  Active provider
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {status.providerLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <MailCheck
                className="mt-0.5 size-5 text-primary"
                aria-hidden="true"
              />

              <div>
                <p className="text-sm font-medium">
                  Delivery mode
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {status.isRealDelivery
                    ? "Real email delivery"
                    : "Simulation only"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm leading-6 text-muted-foreground">
          {getProviderDescription(status)}
        </p>

        {status.provider === "resend" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
              <div className="flex items-center gap-2">
                <KeyRound
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />

                <span className="text-sm">
                  API key
                </span>
              </div>

              <Badge
                variant={
                  status.apiKeyConfigured
                    ? "outline"
                    : "destructive"
                }
              >
                {status.apiKeyConfigured
                  ? "Configured"
                  : "Missing"}
              </Badge>
            </div>

            <div className="rounded-lg border px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Sender
              </p>

              <p className="mt-1 break-all text-sm font-medium">
                {status.sender ||
                  "Not configured"}
              </p>
            </div>

            <div className="rounded-lg border px-4 py-3 sm:col-span-2">
              <p className="text-xs text-muted-foreground">
                Reply-to
              </p>

              <p className="mt-1 break-all text-sm font-medium">
                {status.replyTo ||
                  "Provider default"}
              </p>
            </div>
          </div>
        )}

        {status.issues.length > 0 && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 size-5 shrink-0 text-destructive"
                aria-hidden="true"
              />

              <div>
                <p className="text-sm font-medium text-destructive">
                  Configuration issues
                </p>

                <ul className="mt-2 space-y-1 text-sm text-destructive">
                  {status.issues.map(
                    (issue) => (
                      <li key={issue}>
                        {issue}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {status.isReady && (
          <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-success"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-medium">
                Provider is ready
              </p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                LeadDesk can process email
                delivery using the active
                provider.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}