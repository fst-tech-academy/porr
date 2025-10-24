import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import imageService from '../services/imageService';

interface SignedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SignedImage: React.FC<SignedImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  fallback,
  size = 'md'
}) => {
  const [signedUrl, setSignedUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  useEffect(() => {
    const loadSignedUrl = async () => {
      if (!src) {
        console.log('SignedImage: No src provided');
        setLoading(false);
        return;
      }

      console.log('SignedImage: Loading signed URL for:', src);

      try {
        setLoading(true);
        setError(false);
        
        // Check if it's already a signed URL or a direct S3 URL
        if (src.includes('X-Amz-Signature') || src.includes('X-Amz-Algorithm')) {
          // Already a signed URL
          console.log('SignedImage: Already a signed URL');
          setSignedUrl(src);
        } else {
          // Get signed URL from our service
          console.log('SignedImage: Getting signed URL from service');
          const url = await imageService.getSignedUrlWithCache(src);
          console.log('SignedImage: Got signed URL:', url);
          setSignedUrl(url);
        }
      } catch (err) {
        console.error('SignedImage: Error loading signed URL:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadSignedUrl();
  }, [src]);

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !signedUrl) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full`}>
        <span className="text-gray-500 text-xs">
          {fallback || '?'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={signedUrl}
      alt={alt}
      className={`${sizeClasses[size]} ${className} rounded-full object-cover`}
      onError={(e) => {
        console.error('SignedImage: Image failed to load:', signedUrl);
        console.error('SignedImage: Error event:', e);
        setError(true);
      }}
    />
  );
};

export default SignedImage;
