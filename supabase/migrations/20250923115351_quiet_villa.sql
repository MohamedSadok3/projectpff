/*
  # Add 8D Report URL field to complaints table

  1. Changes
    - Add `report_8d_url` field to store 8D report PDF URLs
    - This allows admins to upload 8D reports that clients can download

  2. Security
    - Field is accessible by all roles with existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'complaints' AND column_name = 'report_8d_url'
  ) THEN
    ALTER TABLE complaints ADD COLUMN report_8d_url text;
  END IF;
END $$;