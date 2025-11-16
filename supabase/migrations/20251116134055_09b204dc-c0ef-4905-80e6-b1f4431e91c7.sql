-- Make category_id nullable in profile_assets and profile_needs tables
ALTER TABLE profile_assets ALTER COLUMN category_id DROP NOT NULL;
ALTER TABLE profile_needs ALTER COLUMN category_id DROP NOT NULL;