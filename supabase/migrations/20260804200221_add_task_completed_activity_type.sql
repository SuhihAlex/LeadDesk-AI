alter type public.lead_activity_type
add value if not exists 'task_completed'
after 'task_created';