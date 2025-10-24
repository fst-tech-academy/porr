import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import PropertyImageManager from '../components/PropertyImageManager';
import apiService from '../services/api';

const schema = yup.object({
  propertyName: yup.string().required('Property name is required'),
  address: yup.object({
    street: yup.string().required('Street address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    postalCode: yup.string().required('Postal code is required'),
    country: yup.string().required('Country is required'),
  }),
  propertyType: yup.string().required('Property type is required'),
  description: yup.string(),
});

interface PropertyFormWithImagesProps {
  propertyId?: string; // For editing existing property
  onSuccess?: () => void;
}

const PropertyFormWithImages: React.FC<PropertyFormWithImagesProps> = ({
  propertyId,
  onSuccess
}) => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      propertyName: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Somalia'
      },
      propertyType: 'apartment',
      description: ''
    }
  });

  // Load existing property data if editing
  useEffect(() => {
    if (propertyId) {
      loadPropertyData();
    }
  }, [propertyId]);

  const loadPropertyData = async () => {
    try {
      setLoading(true);
      // You'll need to implement this method in your API service
      // const response = await apiService.getProperty(propertyId);
      // const property = response.data;
      
      // setValue('propertyName', property.propertyName);
      // setValue('address', property.address);
      // setValue('propertyType', property.propertyType);
      // setValue('description', property.description);
      // setImages(property.images || []);
    } catch (err) {
      setError('Failed to load property data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      if (propertyId) {
        // Update existing property
        // await apiService.updateProperty(propertyId, data);
        console.log('Updating property:', data);
      } else {
        // Create new property
        const response = await apiService.createLandlordProperty(data);
        console.log('Created property:', response.data);
        
        // If we have images, add them to the property
        if (images.length > 0 && response.data.property._id) {
          for (const image of images) {
            await apiService.addPropertyImage(response.data.property._id, {
              imageUrl: image.url,
              key: image.key,
              originalName: image.originalName,
              caption: image.caption,
              size: image.size,
              mimetype: image.mimetype
            });
          }
        }
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImagesUpdated = (updatedImages: any[]) => {
    setImages(updatedImages);
  };

  if (loading && !images.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="propertyName">Property Name</Label>
            <Input
              id="propertyName"
              {...register('propertyName')}
              className={errors.propertyName ? 'border-red-500' : ''}
            />
            {errors.propertyName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.propertyName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                {...register('address.street')}
                className={errors.address?.street ? 'border-red-500' : ''}
              />
              {errors.address?.street && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.address.street.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...register('address.city')}
                className={errors.address?.city ? 'border-red-500' : ''}
              />
              {errors.address?.city && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.address.city.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                {...register('address.state')}
                className={errors.address?.state ? 'border-red-500' : ''}
              />
              {errors.address?.state && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.address.state.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                {...register('address.postalCode')}
                className={errors.address?.postalCode ? 'border-red-500' : ''}
              />
              {errors.address?.postalCode && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.address.postalCode.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Property Images */}
      <PropertyImageManager
        propertyId={propertyId || 'new'} // Use 'new' for new properties
        images={images}
        onImagesUpdated={handleImagesUpdated}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : propertyId ? 'Update Property' : 'Create Property'}
        </Button>
      </div>
    </form>
  );
};

export default PropertyFormWithImages;
