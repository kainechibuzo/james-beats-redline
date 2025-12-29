// Image compression and optimization utilities

/**
 * Compress an image file to reduce upload size
 * @param file The image file to compress
 * @param maxWidth Maximum width (default 800px for covers)
 * @param quality JPEG quality 0-1 (default 0.8)
 */
export const compressImage = (
  file: File,
  maxWidth = 800,
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // If not an image or already small, return as-is
    if (!file.type.startsWith('image/') || file.size < 100000) {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original
          }
        },
        'image/jpeg',
        quality
      );

      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      resolve(file); // Fallback to original on error
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Get optimized image URL for Supabase storage
 */
export const getOptimizedImageUrl = (
  url: string | null | undefined,
  width = 400
): string => {
  if (!url) return '/placeholder.svg';
  
  // Add transformation params for Supabase storage if supported
  if (url.includes('supabase') && url.includes('/storage/')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&quality=80`;
  }
  
  return url;
};
