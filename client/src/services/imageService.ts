import apiService from './api';

class ImageService {
  /**
   * Get a proxy URL for an image
   * @param imageUrl - The S3 URL of the image
   * @returns Promise<string> - The proxy URL
   */
  async getSignedUrl(imageUrl: string): Promise<string> {
    try {
      console.log('ImageService: Getting proxy URL for:', imageUrl);
      
      // Extract the key from the S3 URL
      const key = this.extractKeyFromUrl(imageUrl);
      console.log('ImageService: Extracted key:', key);
      
      if (!key) {
        throw new Error('Invalid image URL');
      }

      // Use the proxy endpoint instead of signed URLs
      const proxyUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5009/api'}/upload/image/${key}`;
      console.log('ImageService: Using proxy URL:', proxyUrl);
      return proxyUrl;
    } catch (error) {
      console.error('ImageService: Error getting proxy URL:', error);
      throw error;
    }
  }

  /**
   * Extract the S3 key from a full S3 URL
   * @param url - The full S3 URL
   * @returns string | null - The S3 key or null if invalid
   */
  private extractKeyFromUrl(url: string): string | null {
    try {
      // Handle different S3 URL formats
      // https://bucket-name.s3.amazonaws.com/key
      // https://bucket-name.s3.region.amazonaws.com/key
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Remove leading slash and return the key
      return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    } catch (error) {
      console.error('Error extracting key from URL:', error);
      return null;
    }
  }

  /**
   * Get a signed URL with caching
   * @param imageUrl - The S3 URL of the image
   * @returns Promise<string> - The signed URL
   */
  async getSignedUrlWithCache(imageUrl: string): Promise<string> {
    // Check if we have a cached signed URL
    const cacheKey = `signed_url_${imageUrl}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const { url, expiry } = JSON.parse(cached);
      // Check if the cached URL is still valid (with 5 minute buffer)
      if (Date.now() < expiry - 300000) {
        return url;
      }
    }

    // Get a new signed URL
    const signedUrl = await this.getSignedUrl(imageUrl);
    
    // Cache the signed URL (expires in 1 hour)
    const expiry = Date.now() + 3600000;
    localStorage.setItem(cacheKey, JSON.stringify({ url: signedUrl, expiry }));
    
    return signedUrl;
  }
}

export default new ImageService();
