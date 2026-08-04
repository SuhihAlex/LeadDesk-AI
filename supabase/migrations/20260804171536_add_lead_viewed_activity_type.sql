alter type public.lead_activity_type
add value if not exists 'lead_viewed'
after 'lead_created';