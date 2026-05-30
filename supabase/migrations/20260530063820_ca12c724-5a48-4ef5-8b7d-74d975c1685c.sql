-- Grant sole admin to kainechibuzo@gmail.com, revoke any other admins
DELETE FROM public.user_roles WHERE role = 'admin';

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE lower(email) = 'kainechibuzo@gmail.com'
ON CONFLICT DO NOTHING;