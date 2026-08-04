"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

type CopyInvitationLinkButtonProps = {
  token: string
}

export function CopyInvitationLinkButton({
  token,
}: CopyInvitationLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  async function copyInvitationLink() {
    const invitationUrl = `${window.location.origin}/invite/${token}`

    try {
      await navigator.clipboard.writeText(invitationUrl)
      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={copyInvitationLink}
    >
      {copied ? (
        <Check className="size-4 text-success" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}

      {copied ? "Copied" : "Copy link"}
    </Button>
  )
}