import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="px-6 pt-6 sm:px-8 sm:pt-8">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">
          Reset your password
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Enter your email address and we will send password recovery
          instructions.
        </p>
      </CardHeader>

      <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
        <form className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="recovery-email">Email address</Label>
            <Input
              id="recovery-email"
              name="email"
              type="email"
              placeholder="alex@kinetic.studio"
              autoComplete="email"
            />
          </div>

          <Button type="submit" className="w-full">
            Send recovery email
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}