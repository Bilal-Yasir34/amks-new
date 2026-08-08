-- Add parent_id column to categories table for sub-category support
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES categories(id) ON DELETE CASCADE;

-- Index for efficient parent/child hierarchy lookups
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
