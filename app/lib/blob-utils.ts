/**
 * Utility functions for working with Vercel Blob Storage
 */

// Upload a file to Vercel Blob
export async function uploadToBlob(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
  
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }
  
    const data = await response.json();
    return data.url;
  }
  
  // Upload multiple files to Vercel Blob
  export async function uploadMultipleToBlob(
    files: File[], 
    onProgress?: (progress: number) => void
  ): Promise<string[]> {
    if (files.length === 0) return [];
  
    const urls: string[] = [];
  
    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadToBlob(files[i]);
        urls.push(url);
        
        if (onProgress) {
          onProgress(Math.round(((i + 1) / files.length) * 100));
        }
      } catch (error) {
        console.error(`Failed to upload file ${i}:`, error);
        // Continue with other files even if one fails
      }
    }
  
    return urls;
  }