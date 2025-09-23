import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadFile = async (
  file: File,
  bucket: string,
  folder: string = ''
): Promise<UploadResult> => {
  try {
    // Check if bucket exists first
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('Error checking buckets:', listError);
      return { success: false, error: `Storage error: ${listError.message}` };
    }

    const bucketExists = buckets?.some(b => b.name === bucket);
    if (!bucketExists) {
      return { 
        success: false, 
        error: `Storage bucket '${bucket}' not found. Please create it in your Supabase dashboard.` 
      };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

export const uploadMultipleFiles = async (
  files: File[],
  bucket: string,
  folder: string = ''
): Promise<string[]> => {
  // If no files, return empty array
  if (!files.length) return [];
  
  try {
    const uploadPromises = files.map(file => uploadFile(file, bucket, folder));
    const results = await Promise.all(uploadPromises);
    
    return results
      .filter(result => result.success)
      .map(result => result.url!)
      .filter(Boolean);
  } catch (error) {
    console.error('Storage upload failed, falling back to base64:', error);
    // Fallback: convert files to base64 for database storage
    return await convertFilesToBase64(files);
  }
};

// Fallback function to convert files to base64
const convertFilesToBase64 = async (files: File[]): Promise<string[]> => {
  const base64Promises = files.map(file => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  });
  
  try {
    return await Promise.all(base64Promises);
  } catch (error) {
    console.error('Error converting files to base64:', error);
    return [];
  }
};

export const deleteFile = async (
  bucket: string,
  filePath: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    return !error;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};