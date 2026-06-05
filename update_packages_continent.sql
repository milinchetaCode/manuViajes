-- =====================================================================
-- UPDATE SCRIPT: Add continent field to packages table
-- =====================================================================

-- Add continent column to packages table
-- Using TEXT type to allow for continent names like "Europe", "Asia", "North America", etc.
ALTER TABLE packages 
ADD COLUMN continent TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN packages.continent IS 'Continent where the travel package is located (e.g., Europe, Asia, North America, South America, Africa, Oceania)';

-- Optional: Add a check constraint to ensure valid continent values
-- This helps maintain data consistency
ALTER TABLE packages 
ADD CONSTRAINT chk_continent_valid 
CHECK (continent IN (
    'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania', 'Antarctica',
    'Eastern Europe', 'Western Europe', 'Northern Europe', 'Southern Europe',
    'Eastern Asia', 'Western Asia', 'Central Asia', 'Southern Asia', 'South-Eastern Asia',
    'Northern America', 'Central America', 'Caribbean', 'South America',
    'Northern Africa', 'Western Africa', 'Middle Africa', 'Eastern Africa', 'Southern Africa',
    'Australia', 'New Zealand', 'Melanesia', 'Micronesia', 'Polynesia'
) OR continent IS NULL);

-- Update the updated_at timestamp to reflect this schema change
UPDATE packages 
SET updated_at = timezone('utc'::text, now())
WHERE continent IS NULL;

-- Create an index on the continent column for better query performance
CREATE INDEX IF NOT EXISTS idx_packages_continent ON packages(continent);

-- =====================================================================
-- SCRIPT COMPLETED
-- =====================================================================
-- The "continent" field has been successfully added to the packages table.
-- You can now start inserting continent values for your existing and new packages.
-- =====================================================================