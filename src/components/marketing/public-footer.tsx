import Link from "next/link"

import { BrandLogo } from "@/components/layout/brand-logo"
import { siteConfig } from "@/config/site"

const legalLinks = [
  {
    label: "Privacy",
    href: "/privacy",
  },
  {
    label: "Terms",
    href: "/terms",
  },
]

export function PublicFooter() {
  return (
    <footer className="bg-card">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b pb-10 md:grid-cols-[1fr_auto_auto]">
          <div className="max-w-sm">
            <BrandLogo />

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              AI-powered lead qualification CRM built for web studios and SaaS
              development teams.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold">Product</p>

            <nav
              aria-label="Footer product navigation"
              className="mt-4 flex flex-col gap-3"
            >
              {siteConfig.navigation.public.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-sm font-semibold">Account</p>

            <nav
              aria-label="Footer account navigation"
              className="mt-4 flex flex-col gap-3"
            >
              <Link
                href="/login"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Log in
              </Link>

              <Link
                href="/register"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Create account
              </Link>
            </nav>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} KINETIC Studio. LeadDesk AI portfolio
            project.
          </p>

          <nav aria-label="Legal navigation" className="flex gap-5">
            {legalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}