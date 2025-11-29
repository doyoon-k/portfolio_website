-- Add sort_order column to projects table
ALTER TABLE projects ADD COLUMN sort_order BIGINT DEFAULT 0;

-- Initialize sort_order based on created_at (optional, but good for existing data)
-- This ensures existing projects have a stable initial order
WITH ranked_projects AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM projects
)
UPDATE projects
SET sort_order = ranked_projects.rn
FROM ranked_projects
WHERE projects.id = ranked_projects.id;
