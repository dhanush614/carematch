-- Enable Row Level Security
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregiver_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for parent_profiles
CREATE POLICY "Users can view their own parent profile"
ON parent_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own parent profile"
ON parent_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own parent profile"
ON parent_profiles
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can create parent profiles"
ON parent_profiles
FOR INSERT
WITH CHECK (true);

-- Create policies for caregiver_profiles
CREATE POLICY "Users can view their own caregiver profile"
ON caregiver_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own caregiver profile"
ON caregiver_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own caregiver profile"
ON caregiver_profiles
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can create caregiver profiles"
ON caregiver_profiles
FOR INSERT
WITH CHECK (true);

-- Add policy for public profile viewing
CREATE POLICY "Public can view all verified caregiver profiles"
ON caregiver_profiles
FOR SELECT
USING (verified = true);

CREATE POLICY "Public can view all parent profiles with active requests"
ON parent_profiles
FOR SELECT
USING (status = 'active');
