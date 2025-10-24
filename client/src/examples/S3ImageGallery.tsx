import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import S3Image from '../components/S3Image';
import ImageUpload from '../components/ImageUpload';
import uploadService from '../services/uploadService';

const S3ImageGallery: React.FC = () => {
  const [images, setImages] = useState([
    {
      id: '1',
      url: 'https://porr-uploads.s3.eu-west-2.amazonaws.com/broker-1757994313598-879169777.png',
      caption: 'Sample Property Image 1',
      originalName: 'broker-1757994313598-879169777.png'
    },
    {
      id: '2', 
      url: 'https://porr-uploads.s3.eu-west-2.amazonaws.com/broker-1757994315837-341798285.png',
      caption: 'Sample Property Image 2',
      originalName: 'broker-1757994315837-341798285.png'
    },
    {
      id: '3',
      url: 'https://porr-uploads.s3.eu-west-2.amazonaws.com/broker-1758081832206-151885604.png',
      caption: 'Sample Property Image 3',
      originalName: 'broker-1758081832206-151885604.png'
    }
  ]);

  const handleImageUploaded = (imageUrl: string) => {
    const newImage = {
      id: Date.now().toString(),
      url: imageUrl,
      caption: 'New Uploaded Image',
      originalName: 'uploaded-image.png'
    };
    setImages(prev => [...prev, newImage]);
  };

  const handleDeleteImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleDownloadImage = (imageUrl: string, originalName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>S3 Image Gallery Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            This demonstrates how to display and manage images stored in AWS S3.
            Your images are served directly from S3 with fast global access.
          </p>
          
          <div className="mb-6">
            <ImageUpload
              onImageUploaded={handleImageUploaded}
              multiple={false}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <S3Image
                    src={image.url}
                    alt={image.caption}
                    size="lg"
                    showActions={true}
                    caption={image.caption}
                    onDelete={() => handleDeleteImage(image.id)}
                    onDownload={() => handleDownloadImage(image.url, image.originalName)}
                  />
                  
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-900">
                      {image.originalName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      S3 URL: {image.url.split('/').pop()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {images.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-lg mb-2">No images to display</div>
              <div className="text-sm">Upload some images to see them here</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>S3 Integration Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✅ What's Working</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Images served directly from AWS S3</li>
                <li>• Fast global content delivery</li>
                <li>• Automatic scaling and redundancy</li>
                <li>• Professional URLs for sharing</li>
                <li>• Cost-effective storage</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">🚀 Next Steps</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Integrate with your property forms</li>
                <li>• Add image compression before upload</li>
                <li>• Set up CloudFront CDN for faster delivery</li>
                <li>• Implement image thumbnails</li>
                <li>• Add image metadata management</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default S3ImageGallery;
