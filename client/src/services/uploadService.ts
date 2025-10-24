import apiService from './api';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    imageUrl: string;
    key: string;
    originalName: string;
    size: number;
    mimetype: string;
  };
}

export interface MultipleUploadResponse {
  success: boolean;
  message: string;
  data: Array<{
    imageUrl: string;
    key: string;
    originalName: string;
    size: number;
    mimetype: string;
  }>;
}

class UploadService {
  private getApiUrl(endpoint: string): string {
    const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5009/api';
    return `${baseURL}${endpoint}`;
  }

  /**
   * Upload a single image to S3
   */
  async uploadSingleImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(this.getApiUrl('/upload/single'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || 'Upload failed');
    }

    return response.json();
  }

  /**
   * Upload multiple images to S3
   */
  async uploadMultipleImages(files: File[]): Promise<MultipleUploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await fetch(this.getApiUrl('/upload/multiple'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || 'Upload failed');
    }

    return response.json();
  }

  /**
   * Delete an image from S3
   */
  async deleteImage(imageUrl: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(this.getApiUrl('/upload/delete'), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Delete failed' }));
      throw new Error(errorData.message || 'Delete failed');
    }

    return response.json();
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Only image files are allowed' };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 5MB' };
    }

    return { isValid: true };
  }

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new UploadService();
