-- Check existing RLS policies
-- Run this in Supabase SQL Editor to see what policies exist

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('restaurants', 'staff', 'locations')
ORDER BY tablename, policyname;
