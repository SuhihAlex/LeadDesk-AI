# LeadDesk AI

LeadDesk AI is a compact multi-tenant B2B CRM for web studios that receive website and SaaS project inquiries.

The product demonstrates a complete commercial SaaS workflow:

**Lead Capture → AI Qualification → Manager Review → Email Reply → Pipeline → Tasks → Analytics → Billing**

## Product status

- Product Contract: Scope Frozen
- Current stage: Stage 8 — Production Readiness
- Billing: Stripe test mode only
- Deployment target: Vercel
- Database and authentication: Supabase

LeadDesk AI is a portfolio product and is not intended to compete with general-purpose CRM, helpdesk, project-management, or omnichannel platforms.

## Main features

- Supabase authentication and protected application routes
- Multi-tenant workspace isolation with PostgreSQL RLS
- Owner and Member roles
- Secure public lead form
- Searchable lead inbox
- Fixed six-stage pipeline
- AI structured qualification and transparent lead scoring
- Editable AI reply drafts
- Email delivery through Resend
- Lead notes, tasks, assignees, and activity history
- Dashboard analytics based on real workspace data
- Stripe Checkout and Customer Portal in test mode
- Durable Stripe webhook idempotency
- Free-plan usage limits

## Technology stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Supabase Auth, PostgreSQL, RLS, and Storage
- OpenAI structured output
- Resend
- Stripe test mode
- dnd-kit
- Zod
- Vercel

## Requirements

- Node.js 22 or newer
- npm
- Supabase project
- Stripe test-mode account for billing flows
- OpenAI API key when using the OpenAI provider
- Resend account when using the Resend provider

## Local setup

Clone the repository and install dependencies:

git clone https://github.com/SuhihAlex/LeadDesk-AI.git
cd LeadDesk-AI
npm install

Copy the environment template:

cp .env.example .env.local

On Windows PowerShell:

Copy-Item .env.example .env.local

Fill in the required Supabase values.

For local development without external AI or email calls, keep:

AI_PROVIDER=mock
EMAIL_PROVIDER=mock

Start the application:

npm run dev

Open:

http://localhost:3000

## Environment variables

# Supabase

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_DEMO_FORM_TOKEN=

SUPABASE_SECRET_KEY is server-only and must never be exposed to the browser.

# Application

NEXT_PUBLIC_SITE_URL=http://localhost:3000

For production, set this to the final Vercel URL or custom domain.

# AI

AI_PROVIDER=mock
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini

Supported providers:

mock
openai

# Email

EMAIL_PROVIDER=mock
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_REPLY_TO=

Supported providers:

mock
resend

# Stripe

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
STRIPE_AGENCY_PRICE_ID=

All Stripe configuration is test mode only.

The webhook endpoint is:

/api/webhooks/stripe

## Database migrations

Migrations are stored in:

supabase/migrations

To review migration state:

npx supabase migration list

To apply pending migrations to the linked Supabase project:

npx supabase db push

Do not rewrite migrations that have already been applied.

## Validation commands

npm run lint
npm run typecheck
npm run build
git diff --check

A release is not considered valid until all commands pass.

## Free-plan limits

50 leads per calendar month
1 workspace user
20 AI generations per calendar month
20 emails per calendar month

Limits are enforced server-side in PostgreSQL and cannot be bypassed by browser requests.

## Security model

All tenant-dependent data contains workspace_id
Tenant isolation is enforced through Supabase RLS
Authenticated mutations validate the current user and workspace
Owner-only operations are verified on the server
Public lead creation does not provide direct anonymous table access
Stripe, OpenAI, Resend, and Supabase secrets remain server-only
Stripe webhook signatures are verified before processing
Stripe webhook event IDs are stored for durable idempotency

## Application routes

Public:

/
/pricing
/demo
/login
/register
/forgot-password
/reset-password

Application:

/app
/app/inbox
/app/pipeline
/app/leads/[leadId]
/app/tasks
/app/team
/app/settings
/app/billing

## Deployment

The production target is Vercel with one hosted Supabase project.

Before deployment:

Apply all Supabase migrations.
Configure all production environment variables in Vercel.
Set the final NEXT_PUBLIC_SITE_URL.
Create Stripe test products and recurring prices.
Configure Stripe Customer Portal.
Register the Stripe webhook endpoint.
Add the Stripe webhook signing secret.
Configure Supabase Auth redirect URLs.
Run lint, typecheck, and production build.
Complete the manual end-to-end release flow.

## Scope

The Product Contract is frozen. New pages, roles, entities, integrations, pipeline stages, and Post-MVP functionality must not be added before release.