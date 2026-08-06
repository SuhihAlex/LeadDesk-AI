grant select
on table public.subscriptions
to authenticated;

comment on table public.subscriptions is
  'Stores Stripe test subscription state. Authenticated reads remain restricted to workspace Owners by RLS.';