import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function DemoLeadFormPage() {
  return (
    <section className="border-b">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-primary">Public lead form</p>

          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            See how a new project inquiry enters LeadDesk AI.
          </h1>

          <p className="mt-5 text-pretty text-base leading-7 text-muted-foreground">
            This form represents the public intake experience for a web studio.
            On Stage 4 it will create a real lead through a secure server
            endpoint.
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Tell us about your project</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Complete the details below to generate a demonstration inquiry.
            </p>
          </CardHeader>

          <CardContent>
            <form className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lead-name">Name</Label>
                <Input id="lead-name" placeholder="Olivia Martin" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-email">Email</Label>
                <Input
                  id="lead-email"
                  type="email"
                  placeholder="olivia@northstar.io"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-company">Company</Label>
                <Input id="lead-company" placeholder="Northstar Labs" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-type">Project type</Label>
                <Input id="project-type" placeholder="SaaS MVP" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Approximate budget</Label>
                <Input id="budget" placeholder="$7,000–$15,000" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">Desired timeline</Label>
                <Input id="timeline" placeholder="1–2 months" />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="website-url">Current website</Label>
                <Input
                  id="website-url"
                  type="url"
                  placeholder="https://northstar.io"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="project-description">
                  Project description
                </Label>
                <Textarea
                  id="project-description"
                  rows={6}
                  placeholder="Describe the business goal, required pages, functionality, and launch expectations."
                />
              </div>

              <div className="flex items-start gap-3 sm:col-span-2">
                <Checkbox id="lead-consent" />
                <Label
                  htmlFor="lead-consent"
                  className="text-sm font-normal leading-6 text-muted-foreground"
                >
                  I agree to the processing of the information submitted in this
                  demonstration form.
                </Label>
              </div>

              <div className="sm:col-span-2">
                <Button type="submit" size="lg">
                  Submit demo inquiry
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}