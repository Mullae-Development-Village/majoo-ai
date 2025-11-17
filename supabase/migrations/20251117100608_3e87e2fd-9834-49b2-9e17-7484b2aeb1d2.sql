-- Drop existing public view policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view all profile assets" ON profile_assets;
DROP POLICY IF EXISTS "Users can view all profile needs" ON profile_needs;

-- Create new policies requiring authentication
CREATE POLICY "Authenticated users can view profiles"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view profile assets"
ON profile_assets FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view profile needs"
ON profile_needs FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);