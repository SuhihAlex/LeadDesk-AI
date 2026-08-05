alter type public.lead_activity_type
add value if not exists 'ai_qualification_started'
after 'lead_viewed';

alter type public.lead_activity_type
add value if not exists 'ai_qualification_failed'
after 'ai_qualification_completed';