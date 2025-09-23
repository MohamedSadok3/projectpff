/*
  # Create Storage Buckets for Complaint Files

  1. New Storage Buckets
    - `complaint-images` - For error pictures uploaded with complaints
    - `complaint-reports` - For 8D reports and other documents
  
  2. Security
    - Enable RLS on storage buckets
    - Add policies for authenticated users to upload/view files
    - Admins can manage all files
    - Clients can upload images for their complaints
    - Fournisseurs can upload reports for assigned complaints
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('complaint-images', 'complaint-images', true),
  ('complaint-reports', 'complaint-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for complaint images - clients can upload, everyone can view
CREATE POLICY "Clients can upload complaint images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'complaint-images' AND
    (EXISTS (
      SELECT 1 FROM client 
      WHERE client.email = ((current_setting('request.jwt.claims', true))::json ->> 'email')
    ) OR EXISTS (
      SELECT 1 FROM admin 
      WHERE admin.email = ((current_setting('request.jwt.claims', true))::json ->> 'email')
    ))
  );

CREATE POLICY "Everyone can view complaint images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'complaint-images');

-- Policy for complaint reports - admins and fournisseurs can upload
CREATE POLICY "Admins and fournisseurs can upload reports"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'complaint-reports' AND
    (EXISTS (
      SELECT 1 FROM admin 
      WHERE admin.email = ((current_setting('request.jwt.claims', true))::json ->> 'email')
    ) OR EXISTS (
      SELECT 1 FROM fournisseurs 
      WHERE fournisseurs.email = ((current_setting('request.jwt.claims', true))::json ->> 'email')
    ))
  );

CREATE POLICY "Everyone can view complaint reports"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'complaint-reports');

-- Policy for deleting files - only admins
CREATE POLICY "Admins can delete files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin 
      WHERE admin.email = ((current_setting('request.jwt.claims', true))::json ->> 'email')
    )
  );