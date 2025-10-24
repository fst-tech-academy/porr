import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Crop as CropIcon, ZoomIn, ZoomOut, X, Save, Trash2 } from 'lucide-react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = (rotation * Math.PI) / 180;

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageData: string) => void;
  onRemove: () => void;
  originalImage: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  onRemove,
  originalImage
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        16 / 9,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }, []);

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop, rotation = 0, flip = { horizontal: false, vertical: false }): Promise<Blob | null> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return Promise.resolve(null);
      }

      const rotRad = (rotation * Math.PI) / 180;

      // calculate bounding box of the rotated image
      const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
      );

      // set canvas size to match the bounding box
      canvas.width = bBoxWidth;
      canvas.height = bBoxHeight;

      // translate canvas context to a central location to allow rotating and flipping around the center
      ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
      ctx.rotate(rotRad);
      ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
      ctx.translate(-image.width / 2, -image.height / 2);

      // draw rotated image
      ctx.drawImage(image, 0, 0);

      const croppedCanvas = document.createElement('canvas');
      const croppedCtx = croppedCanvas.getContext('2d');

      if (!croppedCtx) {
        return Promise.resolve(null);
      }

      // Set the size of the cropped canvas
      croppedCanvas.width = crop.width;
      croppedCanvas.height = crop.height;

      // Draw the cropped image onto the new canvas
      croppedCtx.drawImage(
        canvas,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      // As a blob
      return new Promise((resolve) => {
        croppedCanvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.9);
      });
    },
    []
  );

  const handleSave = async () => {
    if (!imgRef.current || !completedCrop) return;

    try {
      const croppedImageBlob = await getCroppedImg(
        imgRef.current,
        completedCrop,
        rotation,
        {
          horizontal: flipHorizontal,
          vertical: flipVertical,
        }
      );

      if (croppedImageBlob) {
        const reader = new FileReader();
        reader.onload = () => {
          onSave(reader.result as string);
        };
        reader.readAsDataURL(croppedImageBlob);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    }
    onClose();
  };

  const handleRemove = () => {
    onRemove();
    onClose();
  };

  const resetTransformations = () => {
    setZoom(1);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setAspectRatio(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden bg-white text-black dark:bg-slate-800 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-black dark:text-white">Edit Image</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Crop, resize, and adjust your image. Use the controls on the right to make changes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-6 h-[70vh]">
          {/* Image Display - Left Side */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative border border-slate-200 bg-slate-50 rounded-lg overflow-hidden max-w-full max-h-full">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                minWidth={50}
                minHeight={50}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={originalImage}
                  style={{ 
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>
          </div>

          {/* Controls - Right Side */}
          <div className="w-80 space-y-6 overflow-y-auto pr-2">
            {/* Zoom Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Zoom: {Math.round(zoom * 100)}%</label>
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Rotation Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Rotation: {rotation}°</label>
              <Slider
                value={[rotation]}
                onValueChange={(value) => setRotation(value[0])}
                min={-180}
                max={180}
                step={15}
                className="w-full"
              />
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Aspect Ratio</label>
              <Select value={aspectRatio?.toString()} onValueChange={(value) => setAspectRatio(value === 'free' ? undefined : Number(value))}>
                <SelectTrigger className="bg-white text-black border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="free" className="text-black">Free</SelectItem>
                  <SelectItem value="1" className="text-black">1:1 (Square)</SelectItem>
                  <SelectItem value="16/9" className="text-black">16:9</SelectItem>
                  <SelectItem value="4/3" className="text-black">4:3</SelectItem>
                  <SelectItem value="3/2" className="text-black">3:2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Flip Controls */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Flip</label>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFlipHorizontal(!flipHorizontal)}
                  className={`bg-white hover:bg-gray-50 border-gray-200 text-black ${flipHorizontal ? 'bg-blue-100' : ''}`}
                >
                  ↔️
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFlipVertical(!flipVertical)}
                  className={`bg-white hover:bg-gray-50 border-gray-200 text-black ${flipVertical ? 'bg-blue-100' : ''}`}
                >
                  ↕️
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={resetTransformations}
                className="w-full bg-gray-100 hover:bg-gray-600 border-gray-200 text-black"
              >
                Reset
              </Button>
              <Button
                variant="outline"
                onClick={handleRemove}
                className="w-full bg-red-50 hover:bg-red-100 border-gray-200 text-red-600 hover:text-red-700"
              >
                Remove Image
              </Button>
              <Button
                onClick={handleSave}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditor;
