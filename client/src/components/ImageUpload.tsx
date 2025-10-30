import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import uploadService from '../services/uploadService';
import imageService from '../services/imageService';
import { useSettings } from '../hooks/useSettings';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved?: () => void;
  currentImageUrl?: string;
  multiple?: boolean;
  maxFiles?: number;
  clearPreview?: boolean; // New prop to clear preview
  onFileSelected?: (file: File) => void; // New prop to pass file to parent
  selectedFile?: File | null; // New prop for selected file
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  onImageRemoved,
  currentImageUrl,
  multiple = false,
  maxFiles = 5,
  clearPreview = false,
  onFileSelected,
  selectedFile = null
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [localPreview, setLocalPreview] = useState<string>('');
  const [proxyUrl, setProxyUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isFileUploadsEnabled } = useSettings();

  // Debug localPreview changes
  useEffect(() => {
    console.log('localPreview changed:', localPreview);
  }, [localPreview]);

  // Clear preview when clearPreview prop is true
  useEffect(() => {
    if (clearPreview) {
      setLocalPreview('');
    }
  }, [clearPreview]);

  // Debug currentImageUrl changes
  useEffect(() => {
    console.log('ImageUpload - currentImageUrl changed:', currentImageUrl);
    console.log('ImageUpload - localPreview:', localPreview);
    console.log('ImageUpload - should show image:', !!(localPreview || currentImageUrl));
  }, [currentImageUrl, localPreview]);

  // Convert S3 URL to proxy URL
  useEffect(() => {
    const convertToProxyUrl = async () => {
      if (currentImageUrl && !localPreview) {
        try {
          console.log('ImageUpload: Converting S3 URL to proxy URL:', currentImageUrl);
          const proxyUrl = await imageService.getSignedUrl(currentImageUrl);
          console.log('ImageUpload: Got proxy URL:', proxyUrl);
          setProxyUrl(proxyUrl);
        } catch (error) {
          console.error('ImageUpload: Error converting to proxy URL:', error);
          // For now, use the original S3 URL as fallback
          setProxyUrl(currentImageUrl);
        }
      } else {
        setProxyUrl('');
      }
    };

    convertToProxyUrl();
  }, [currentImageUrl, localPreview]);

  // Cleanup object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault(); // Prevent form submission
    event.stopPropagation(); // Stop event bubbling
    
    const files = event.target.files;
    if (!files || files.length === 0) return;

    console.log('File selected:', files[0]);
    setError(null);

    // Create local preview immediately
    const file = files[0];
    const validation = uploadService.validateFile(file);
    
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    console.log('Preview URL created:', previewUrl);
    setLocalPreview(previewUrl);

    // If onImageUploaded is provided, upload the file immediately
    if (onImageUploaded) {
      setUploading(true);
      try {
        const response = await uploadService.uploadSingleImage(file);
        const imageUrl = response.data.imageUrl;
        console.log('Image uploaded successfully:', imageUrl);
        onImageUploaded(imageUrl);
        setUploadedImages(prev => [...prev, imageUrl]);
      } catch (err) {
        console.error('Upload failed:', err);
        setError('Failed to upload image');
        setLocalPreview('');
      } finally {
        setUploading(false);
      }
    } else if (onFileSelected) {
      // Pass the file to parent component for later upload
      onFileSelected(file);
    }

    // Clear the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    try {
      await uploadService.deleteImage(imageUrl);
      setUploadedImages(prev => prev.filter(url => url !== imageUrl));
      if (onImageRemoved) {
        onImageRemoved();
      }
    } catch (err) {
      setError('Failed to delete image');
    }
  };

  const openFileDialog = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    fileInputRef.current?.click();
  };

  // If file uploads are disabled, show a disabled state
  if (!isFileUploadsEnabled()) {
    return (
      <div className="space-y-4">
        <Card className="border-2 border-gray-200 bg-gray-50">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">File Uploads Disabled</p>
                <p className="text-xs text-gray-400">This feature has been disabled by the administrator</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Upload Area */}
      <div className="relative">
        {/* Profile Photo Display/Upload Area */}
        <div className="relative group">
          {localPreview || (currentImageUrl && proxyUrl) ? (
            // Show uploaded/preview image
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl mx-auto border-4 border-white shadow-xl ring-4 ring-blue-100 bg-gray-100 overflow-hidden">
                <img
                  src={localPreview || proxyUrl}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                  onLoad={(e) => {
                    console.log('Preview image loaded successfully:', e.currentTarget.src);
                    console.log('Image dimensions:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight);
                  }}
                  onError={(e) => {
                    console.error('Preview image failed to load:', e.currentTarget.src);
                    console.error('Error details:', e);
                    // If proxy URL fails, try the original S3 URL
                    if (e.currentTarget.src.includes('/upload/image/') && currentImageUrl) {
                      console.log('Trying fallback to original S3 URL:', currentImageUrl);
                      e.currentTarget.src = currentImageUrl;
                    }
                  }}
                />
              </div>
              
              {/* Overlay with upload button - only visible on hover */}
              <div className="absolute inset-0 w-32 h-32 mx-auto rounded-2xl transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl"></div>
                <Button
                  onClick={openFileDialog}
                  disabled={uploading}
                  size="sm"
                  className="relative z-10 bg-white text-gray-900 hover:bg-gray-100"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Change'}
                </Button>
              </div>
              
              {/* Remove button */}
              <Button
                onClick={() => {
                  if (currentImageUrl) {
                    handleRemoveImage(currentImageUrl);
                  } else {
                    setLocalPreview('');
                  }
                }}
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full p-0 shadow-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            // Show upload placeholder
            <div 
              className="w-32 h-32 mx-auto border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group"
              onClick={openFileDialog}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                  Upload Photo
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Max 5MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Error message */}
        {error && (
          <div className="flex items-center justify-center text-red-600 text-sm mt-3">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}

      </div>

    </div>
  );
};

export default ImageUpload;