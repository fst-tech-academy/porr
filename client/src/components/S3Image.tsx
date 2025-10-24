import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, Download, ExternalLink } from 'lucide-react';

interface S3ImageProps {
  src: string;
  alt?: string;
  className?: string;
  showActions?: boolean;
  onDelete?: () => void;
  onDownload?: () => void;
  caption?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const S3Image: React.FC<S3ImageProps> = ({
  src,
  alt = 'Image',
  className = '',
  showActions = false,
  onDelete,
  onDownload,
  caption,
  size = 'md'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = src;
      link.download = alt || 'image';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openInNewTab = () => {
    window.open(src, '_blank');
  };

  if (error) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-xs">Failed to load</div>
          <div className="text-xs mt-1">image</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <div className={`${sizeClasses[size]} relative overflow-hidden rounded-lg bg-gray-100`}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            loading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {showActions && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={openInNewTab}
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              
              {onDownload && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDownload}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onDelete}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {caption && (
        <p className="text-xs text-gray-600 mt-2 text-center truncate">
          {caption}
        </p>
      )}
    </div>
  );
};

export default S3Image;
