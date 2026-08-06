LeadDesk AI — Product Contract
Version: 1.0

Status: Scope Frozen

Niche: Web studio accepting inbound requests for website and SaaS development

Implementation Timeline: 12–14 working days

Number of Stages: 8

Final Point: Single production deployment on Vercel

1. Product Summary
LeadDesk AI is a compact B2B CRM for a web studio that receives inquiries via a public form.

The system:

accepts an inquiry;

creates a lead;

analyzes the inquiry via AI;

calculates a transparent lead score;

generates a response draft;

helps the manager process the lead;

allows moving the lead through a fixed pipeline;

displays key metrics on a dashboard.

LeadDesk AI is not a universal CRM, marketing platform, messenger, or project management system.

2. Product Goals
Primary Goal
Demonstrate a complete, commercially viable SaaS product with a full business scenario:
Lead Capture → AI Qualification → Manager Review → Email Reply → Pipeline → Analytics

Portfolio Goals
The project must showcase:

modern responsive SaaS interface;

Next.js App Router and TypeScript;

Supabase Auth, PostgreSQL, and RLS;

multi-tenant workspace isolation;

secure public form;

AI structured output;

transparent lead scoring;

kanban drag-and-drop;

email sending;

Stripe test mode;

dashboard with real data;

production deployment;

documentation and case study.

Non-Goals
The project must not compete with HubSpot, Salesforce, Pipedrive, or full-scale helpdesk systems.

3. Target Users
Owner
Web studio owner.

Can:

manage workspace;

view and edit all leads;

assign responsibilities;

manage members;

manage billing;

change company settings;

create and edit tasks;

send replies.

Member
Manager or sales specialist.

Can:

view workspace leads;

process leads;

change stages;

create notes;

create and complete tasks;

send replies;

view dashboard.

Member cannot:

manage billing;

delete workspace;

change subscription plan;

manage Owner roles.

A complex permission system is not built.

4. Fixed MVP Scope
4.1 Authentication
Implemented:

registration;

login;

logout;

password recovery;

protected application routes;

creation of the first workspace after registration;

server-side session check.

Not implemented:

social login;

SSO;

2FA;

enterprise authentication;

custom auth providers.

4.2 Workspace
Implemented:

company name;

logo;

Owner;

Members;

member invitation;

member removal;

Owner/Member role switching within allowed limits;

data isolation via workspace_id and RLS.

In the MVP, a single user works within one active workspace.

4.3 Public Lead Form
Form Fields:

name;

email;

company;

project type;

estimated budget;

desired timeline;

task description;

current website link;

data processing consent.

Project Types
Fixed list:

Corporate Website;

Landing Page;

E-commerce;

SaaS MVP;

Web Application;

Redesign;

Other.

Budget
Fixed ranges:

Less than $1,000;

$1,000–$3,000;

$3,000–$7,000;

$7,000–$15,000;

More than $15,000;

Not sure.

Desired Timeline
Fixed options:

Urgent: less than 2 weeks;

2–4 weeks;

1–2 months;

2–4 months;

Flexible;

Not sure.

Security Requirements
lead creation exclusively via a server endpoint;

Zod validation;

string sanitization;

rate limiting;

honeypot field;

consent check;

field length restriction;

client does not pass workspace_id directly;

workspace is determined by the server via a public form token or demo configuration.

4.4 Inbox
Inbox contains:

lead list;

name;

company;

email;

project type;

source;

stage;

priority;

score;

assignee;

creation date;

new/read state.

Supported:

search by name, email, company, and description;

filter by stage;

filter by priority;

filter by source;

filter by assignee;

sort by date;

sort by score;

sort by budget;

empty state;

loading state;

error state;

pagination or limited server selection.

Not implemented:

saved views;

custom columns;

bulk automation;

complex batch operations.

4.5 Pipeline
Fixed Stages:

New;

Qualified;

Contacted;

Proposal;

Won;

Lost.

Supported:

kanban board;

drag-and-drop via dnd-kit;

optimistic UI;

saving the new stage;

recording change history;

displaying lead count;

displaying potential value;

mobile fallback without awkward horizontal drag-and-drop.

User cannot:

create stages;

delete stages;

rename stages;

change stage order.

4.6 Lead Details
Lead Card includes:

Contact
name;

email;

company;

website link;

source.

Request
project type;

description;

budget;

timeline;

creation date.

Qualification
AI summary;

AI priority;

lead score;

score explanation;

completeness score;

extracted fields;

missing information;

identified risks;

studio service fit.

Management
current stage;

assignee;

new/read state;

notes;

tasks;

activity history;

reply draft;

sent email history.

Supported:

stage change;

assignee assignment;

adding a note;

task creation;

editing AI draft before sending;

re-running AI analysis only after an error or source data change.

Not implemented:

attachments;

chat;

calls;

commercial proposals;

invoices;

deals as a separate entity.

4.7 Tasks
Fields:

title;

description — optional;

due date;

status;

assignee;

related lead;

workspace;

creation date.

Statuses:

Todo;

In Progress;

Completed.

Supported:

creation;

editing;

completion;

deletion;

filtering by status;

filtering by assignee;

displaying overdue tasks.

A full-fledged project manager is not created.

4.8 Email
Supported:

editing AI draft;

sending via Resend;

test or allowed address;

saving subject;

saving body;

saving send status;

saving date;

saving sending error;

recording activity event.

AI never sends emails automatically.

Not implemented:

incoming mail;

email synchronization;

reply threading;

sequences;

bulk mailings;

tracking opens/clicks;

custom email client.

4.9 Dashboard
Displayed metrics:

new leads for selected period;

qualified leads;

average lead score;

conversion rate;

potential pipeline value;

source distribution;

stage distribution;

average first response time;

recent leads;

upcoming tasks.

Formulas
New Leads: Count of leads created within the period.

Qualified Leads: Count of leads at Qualified stage or further, excluding Lost.

Average Score: Average score value among AI-processed leads.

Conversion Rate: Won leads / all closed leads × 100 (Closed leads: Won, Lost).

Potential Value: Sum of normalized budget estimates for active leads (New–Proposal).

Average Response Time: Average time between lead creation and the first of the events: stage change away from New, note added, email sent, or assignee changed.

4.10 Billing
Plans:

Free: up to 30 leads, 1 user, limited AI analyses, basic dashboard.

Pro: increased lead limit, up to 5 users, AI qualification, email, full dashboard.

Agency: increased limits, up to 15 users, same core MVP features, tariff structure demonstration.

Stripe is used in test mode only.

Supported:

pricing page;

Stripe checkout;

customer portal (with reasonable complexity);

storing customer ID;

storing subscription ID;

subscription status webhook update;

Free plan limitations.

Not implemented:

usage-based billing;

coupons;

invoices UI;

annual billing;

taxes;

production payments.

5. Main User Journey
Journey A — Owner Registration: Landing → Register → Account Creation → Email Confirmation (if configured) → Workspace Creation → Dashboard → Demo/Empty Onboarding State.

Journey B — Lead Capture: Public Form → Fill Mandatory Fields → Submit → Server Validation → Lead Creation → Activity Event Created → AI Qualification Triggered → Success State.

Journey C — Lead Qualification: Lead Appears in Inbox → AI Analysis → Extracted Fields Saved → Score Calculated → Explanation Saved → Reply Draft Formatted → Retry State on Error.

Journey D — Manager Processing: Open Lead → Review Request & AI Analysis → Assign Assignee → Add Note → Create Task → Edit Draft → Send Test Email → Move Lead to Contacted/Next Stage.

Journey E — Pipeline and Analytics: Open Pipeline → Drag/Move Lead Between Stages → History Recorded → Dashboard Recalculates Metrics → Won/Lost Included in Conversion Rate.

6. Page Map
Public Routes
/ — Landing (Product presentation and CTA)

/pricing — Pricing (Free, Pro, and Agency plans)

/demo — Lead Form Demo (Public lead capture form)

/login — Login (User authentication)

/register — Register (Account creation)

/forgot-password — Recovery (Password recovery)

/reset-password — Reset Password (Set a new password)

Application Routes
/app — Dashboard (Main metrics and recent activity)

/app/inbox — Inbox (Searchable lead list)

/app/pipeline — Pipeline (Fixed-stage kanban)

/app/leads/[leadId] — Lead Details (Lead qualification and processing)

/app/tasks — Tasks (Workspace task management)

/app/team — Team (Members and roles)

/app/settings — Settings (Company and workspace configuration)

/app/billing — Billing (Plan and Stripe test subscription)

Server Endpoints
POST /api/public/leads — Secure public lead creation

POST /api/leads/[id]/qualify — AI qualification

POST /api/leads/[id]/send-email — Send reviewed draft

POST /api/stripe/checkout — Create test checkout session

POST /api/stripe/portal — Open billing portal

POST /api/webhooks/stripe — Process Stripe events

Additional server actions are permitted inside Next.js for authenticated CRUD.

7. Navigation Structure
Public Navigation: Product, How it works, Pricing, Demo, Login, Get Started.

Application Sidebar: Dashboard, Inbox, Pipeline, Tasks, Team, Settings, Billing.

Bottom Area: Active workspace, current user, logout.

Mobile Devices: Uses drawer or sheet navigation.

8. Data Model
All tenant-dependent tables contain workspace_id. All identifiers use UUID. All timestamp fields are stored as timestamptz.

8.1 profiles: Extension of Supabase Auth user (id, full_name, avatar_url, created_at, updated_at).

8.2 workspaces: (id, name, slug, logo_url, public_form_token, plan [free, pro, agency], created_by, created_at, updated_at).

8.3 workspace_members: (id, workspace_id, user_id, role [owner, member], joined_at). Unique constraint on (workspace_id, user_id).

8.4 workspace_invitations: (id, workspace_id, email, role, token, invited_by, status [pending, accepted, revoked, expired], expires_at, created_at).

8.5 leads: (id, workspace_id, name, email, company, project_type, budget_range, budget_value [normalized], desired_timeline, description, website_url, consent_given [must be true], source, stage, priority, assigned_to, is_read, ai_status, created_at, updated_at, first_processed_at, closed_at).

8.6 lead_qualifications: (id, workspace_id, lead_id [unique], summary, score [0–100], completeness_score, priority, service_fit, extracted_budget, extracted_timeline, extracted_service, extracted_company_context, urgency, missing_information [jsonb], risks [jsonb], score_breakdown [jsonb], model, prompt_version, raw_response, created_at, updated_at).

8.7 lead_reply_drafts: (id, workspace_id, lead_id, subject, body, status [ai_generated, edited, sent], generated_by_model, last_edited_by, created_at, updated_at).

8.8 lead_notes: (id, workspace_id, lead_id, author_id, content, created_at, updated_at).

8.9 tasks: (id, workspace_id, lead_id, title, description, status [todo, in_progress, completed], due_at, assigned_to, created_by, completed_at, created_at, updated_at).

8.10 lead_activities: Append-only history (id, workspace_id, lead_id, actor_id, type, metadata, created_at).

8.11 sent_emails: (id, workspace_id, lead_id, draft_id, recipient, subject, body, provider_message_id, status [pending, sent, failed], error_message, sent_by, sent_at, created_at).

8.12 subscriptions: (id, workspace_id [unique], stripe_customer_id, stripe_subscription_id, stripe_price_id, plan, status [inactive, trialing, active, past_due, canceled], current_period_end, created_at, updated_at).

9. Relationship Summary
auth.users → profiles: one-to-one

workspace → workspace_members: one-to-many

workspace → leads: one-to-many

lead → lead_qualification: one-to-one

lead → reply drafts: one-to-many

lead → notes: one-to-many

lead → tasks: one-to-many

lead → activities: one-to-many

lead → sent emails: one-to-many

workspace → subscription: one-to-one

10. Multi-Tenant and RLS Contract
Mandatory Rule: Access to tenant data is granted only when workspace_members.workspace_id = resource.workspace_id and workspace_members.user_id = auth.uid().

Public Form Exception: Public users do not get direct insert access to the leads table. Creation occurs via a server endpoint with service role after validation (form token, rate limit, Zod, consent, sanitization, honeypot).

Owner-only Operations: Only Owners can update workspaces, manage members/invitations, initiate Stripe checkout, and open the billing portal.

Service Role: Used strictly on the server; never exposed to the browser; applied for public lead endpoints, Stripe webhooks, and controlled system operations.

11. AI Contract
11.1 AI Responsibilities: Summary, data extraction, service fit classification, priority recommendation, completeness analysis, missing-info detection, risk detection, reply draft generation. AI takes no irreversible actions and never sends emails, changes stages, assigns leads, deletes data, or promises prices/timelines.

11.2 AI Input: Lead details plus web studio services definition, scoring rules, and safe reply rules. Excludes service role keys, Stripe data, auth tokens, and other workspaces' data.

11.3 Structured Output: Strictly validated schema (summary, extracted info, qualification scores/breakdown, missing info, risks, reply draft) parsed via Zod. On invalid output: max 1 retry attempt, otherwise status marked as failed, UI shows retry action while original lead remains available.

12. Lead Score Contract (0–100)
12.1 Budget (0–25): Varies from 4 points (<$1k) to 25 points (>$15k), with 7 for "Not sure".

12.2 Timeline (0–15): Realism-based (from 15 for realistic/specified down to 2 for clearly unrealistic).

12.3 Completeness (0–20): round(completenessScore × 0.20) based on goal, scope, budget, timeline, business context, and expected outcome.

12.4 Service Fit (0–20): Poor (2), Partial (9), Good (16), Excellent (20) for web-related services.

12.5 Urgency (0–10): Low (4), Medium (7), High (10).

12.6 Description Quality (0–10): Evaluates specificity, consistency, goals, requirements, and absence of nonsense text.

12.7 Priority Mapping: 0–34 (Low), 35–59 (Medium), 60–79 (High), 80–100 (Urgent).

12.8 Score Transparency: Interface must display total score, 6 categories, category points, short explanation, missing information, and identified risks.

13. Reply Draft Rules
AI draft must be professional, short, acknowledge receipt, mention task understanding, avoid fabricated facts, avoid quoting exact prices/deadlines, ask max 3 key questions, propose a next step, avoid aggressive sales, and be ready for manual editing. English language only for MVP.

14. Error Handling Contract
Public Form: Validation errors, invalid token, rate limits, duplicates, database errors, and server errors are safely handled without exposing stack traces.

AI: Timeouts, provider unavailability, rate limits, invalid schemas, missing keys, and persistence errors handled gracefully; leads are saved even if AI fails.

Email: Invalid recipients, provider errors, domain restrictions, rate limits handled cleanly.

Pipeline: Optimistic updates roll back on error.

Billing: Webhooks are made idempotent based on Stripe event IDs.

15. Demo Data Contract
Seed creates 1 demo workspace, 3 users (Alex Morgan - Owner, Emma Carter, Daniel Brooks - Members), 30 leads, 15 tasks, 4 sources, all 6 stages, varied scores/budgets/priorities, notes, stage history, sent emails, AI error/retry examples, and subscription record. Lorem ipsum is prohibited.

16. Non-Functional Requirements
Performance: SSR data loading where reasonable, lightweight client components, unblocked Kanban/charts, Next.js image optimization, no N+1 queries.

Accessibility: Keyboard navigation, visible focus, form labels, ARIA attributes, contrast, accessible tables/kanban, tied error states.

Responsive: Mobile from 360px up to wide desktop (tables turn into cards, sidebar becomes a drawer, etc.).

Security: RLS, server-side authorization, input validation, sanitization, environment secrets isolation, server-side third-party calls, webhook signature verification.

Observability: Structured server logs, clear error messages, Vercel logs, database status fields.

17. Design Contract
Visual Direction: Light neutral palette, white/soft gray surfaces, one restrained accent color, compact tables, clear hierarchy, thin borders, minimal shadows, clean badges, noise-free charts.

UI Foundation: shadcn/ui, Tailwind CSS, CSS variables, consistent spacing, radius, statuses, and Lucide icons.

Required States: Loading, empty, error, success, disabled, optimistic, skeleton, confirmation.

Priority UI Areas: Lead Details, Inbox, Pipeline, Dashboard, Public Lead Form.

18. Technical Architecture Contract
Application: Next.js App Router, TypeScript strict mode, Tailwind CSS, shadcn/ui, React Hook Form, Zod.

Data and Auth: Supabase PostgreSQL, Supabase Auth, Supabase Storage (workspace logo only).

AI: OpenAI or compatible LLM provider (server-only, structured output, Zod parsing, prompt versioning).

Charts & Pipeline: Recharts, dnd-kit.

Email & Billing: Resend test config, Stripe test mode.

Deployment: Vercel, Supabase hosted project, single production environment.

Restrictions: No separate FastAPI/Node backend, microservices, Redis, Kafka, RabbitMQ, custom queues, Kubernetes, event sourcing, CQRS, or complex repository abstractions.

19. Testing Contract
Required Automated Tests: Lead form validation, public lead endpoint, workspace isolation, score calculation, AI schema parsing, pipeline stage updates, task creation, email error handling, Stripe webhook mock path.

Required Manual E2E Flow: Registration → Workspace creation → Public form submission → Lead appearance → AI qualification → Score display → Reply draft edit → Email send → Task creation → Pipeline move → Dashboard update → Mobile layout check.

20. Definition of Done
The project is complete only when all product flows work seamlessly, security measures (RLS, public form protection, webhook signature verification) are enforced, UI states and responsiveness are finalized across all pages, engineering criteria (seed, lint, typecheck, build, tests, docs, production deployment) are met, and portfolio artifacts (README, screenshots, case study) are prepared.

21. Severity Rules
Critical (Blocks Release): Registration/login failure, public form failure, tenant data leak, AI breaking lead flow, pipeline not saving, email data loss, build/deployment failure, broken mobile flow.

Major (Fixed before Release): Incorrect dashboard calculations, broken filters, incorrect error states, awkward mobile pipeline, Stripe test flow issues.

Minor (Non-blocking): Small spacing issues, minor animations, cosmetic mismatches, edge cases.

22. Post-MVP
Features postponed for future versions (custom stages, multiple workspaces, multilingual UI/AI, WhatsApp/Telegram/telephony integration, incoming email sync, PDF proposals, invoices, workflow builder, public API, zapier, mobile app, voice AI, enterprise SSO, etc.).

23. Stage Boundaries
Stage 1: Product Contract (Scope Frozen)

Stage 2: Design System and Shell

Stage 3: Database, Auth, and Workspace

Stage 4: Lead Capture and Inbox

Stage 5: Pipeline and Lead Details

Stage 6: AI Qualification

Stage 7: Tasks, Email, Analytics, and Billing

Stage 8: Release

24. Delivery Schedule
Stage 1: Day 1

Stages 2–3: Days 2–5

Stages 4–5: Days 6–9

Stage 6: Day 10

Stage 7: Days 11–12

Stage 8: Days 13–14

25. Scope Freeze Rule
After accepting the Product Contract, no new entities or unapproved features are added.