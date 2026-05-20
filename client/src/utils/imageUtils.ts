/**
 * Optimizes a Cloudinary URL by injecting f_auto (format) and q_auto (quality) parameters.
 * If the URL is not a Cloudinary URL, it returns it as is.
 */
export const optimizeImage = (url: string | undefined): string => {
  if (!url) return '';
  
  if (url.includes('cloudinary.com')) {
    // Look for '/upload/' in the URL and inject optimization parameters after it
    if (url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/f_auto,q_auto/');
    }
  }
  
  return url;
};
