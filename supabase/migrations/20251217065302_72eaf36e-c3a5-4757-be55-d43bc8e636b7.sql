-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Paid users can upload songs" ON public.songs;

-- Create new policy allowing all authenticated users to upload
CREATE POLICY "Authenticated users can upload songs"
ON public.songs
FOR INSERT
WITH CHECK (auth.uid() = user_id);