import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="px-6 pt-6 sm:px-8 sm:pt-8">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">
          Create your workspace
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Start with a focused CRM built for website and SaaS project
          inquiries.
        </p>
      </CardHeader>

      <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
        <form className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              name="fullName"
              placeholder="Alex Morgan"
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company name</Label>
            <Input
              id="company"
              name="company"
              placeholder="KINETIC Studio"
              autoComplete="organization"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email">Email address</Label>
            <Input
              id="register-email"
              name="email"
              type="email"
              placeholder="alex@kinetic.studio"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-start gap-3">
            <Checkbox id="terms" />
            <Label
              htmlFor="terms"
              className="text-sm font-normal leading-6 text-muted-foreground"
            >
              I agree to the Terms and Privacy Policy.
            </Label>
          </div>

          <Button type="submit" className="w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}