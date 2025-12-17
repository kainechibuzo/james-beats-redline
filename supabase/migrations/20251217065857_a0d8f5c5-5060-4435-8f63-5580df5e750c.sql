-- Drop the restrictive storage policy for songs
DROP POLICY IF EXISTS "Paid users can upload songs" ON storage.objects;

-- Create new policy allowing all authenticated users to upload songs
CREATE POLICY "Authenticated users can upload songs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'songs' AND auth.uid() IS NOT NULL);