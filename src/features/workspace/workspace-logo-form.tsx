"use client"

import {
  Building2,
  LoaderCircle,
  Trash2,
  Upload,
} from "lucide-react"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  removeWorkspaceLogoAction,
  uploadWorkspaceLogoAction,
} from "@/features/workspace/actions"

type WorkspaceLogoFormProps = {
  workspaceName: string
  logoUrl: string | null
  isOwner: boolean
}

function UploadButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <LoaderCircle
          className="size-4 animate-spin"
          aria-hidden="true"
        />
      ) : (
        <Upload
          className="size-4"
          aria-hidden="true"
        />
      )}

      {pending ? "Uploading..." : "Upload logo"}
    </Button>
  )
}

function RemoveButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      className="text-destructive hover:text-destructive"
    >
      {pending ? (
        <LoaderCircle
          className="size-4 animate-spin"
          aria-hidden="true"
        />
      ) : (
        <Trash2
          className="size-4"
          aria-hidden="true"
        />
      )}

      {pending ? "Removing..." : "Remove"}
    </Button>
  )
}

export function WorkspaceLogoForm({
  workspaceName,
  logoUrl,
  isOwner,
}: WorkspaceLogoFormProps) {
  return (
    <div className="border-t pt-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {logoUrl ? (
          <div
            role="img"
            aria-label={`${workspaceName} logo`}
            className="size-20 shrink-0 rounded-xl border bg-white bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("${logoUrl}")`,
            }}
          />
        ) : (
          <div className="flex size-20 shrink-0 items-center justify-center rounded-xl border bg-primary/10 text-primary">
            <Building2
              className="size-8"
              aria-hidden="true"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">
            Workspace logo
          </h3>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Upload a PNG, JPEG or WebP image. Maximum
            file size is 2 MB.
          </p>

          {isOwner ? (
            <div className="mt-4 flex flex-col gap-3">
              <form
                action={uploadWorkspaceLogoAction}
                className="flex flex-col gap-3 sm:flex-row sm:items-end"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <Label htmlFor="workspace-logo">
                    Logo file
                  </Label>

                  <Input
                    id="workspace-logo"
                    name="logo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    required
                  />
                </div>

                <UploadButton />
              </form>

              {logoUrl ? (
                <form
                  action={removeWorkspaceLogoAction}
                >
                  <RemoveButton />
                </form>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Only the workspace Owner can change the
              company logo.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}