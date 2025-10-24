import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { X, Edit, Trash2 } from 'lucide-react';

interface ImagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onEdit?: () => void;
  onRemove?: () => void;
  title?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onEdit,
  onRemove,
  title = "Image Preview"
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-black dark:bg-slate-800 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-black dark:text-white">{title}</DialogTitle>
          <DialogDescription className="text-gray-900 dark:text-white">
            Click outside the image or press Escape to close this preview.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Large Image Display */}
          <div className="flex justify-center">
            <div className="relative max-w-full max-h-[70vh] overflow-hidden rounded-lg border border-gray-200 bg-white dark:bg-slate-800 dark:border-slate-700">
              <img
                src={imageUrl}
                alt="Preview"
                className="max-w-full max-h-[70vh] object-contain"
                style={{ maxWidth: '100%', maxHeight: '70vh' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-4 border-t">
            {onEdit && (
              <Button
                onClick={onEdit}
                className="bg-blue-900 hover:bg-blue-800 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Image
              </Button>
            )}
            {onRemove && (
              <Button
                variant="destructive"
                onClick={onRemove}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Image
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="bg-white dark:bg-slate-800 text-black dark:text-white">
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreview;
