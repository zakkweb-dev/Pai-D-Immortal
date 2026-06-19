/**
 * Utility to compress local images in-browser using HTML5 Canvas.
 * Resizes the image to fit within safe limits and converts it to a standard JPEG Data URL,
 * ensuring it fits perfectly in Firestore limits (<1MB) and works on both laptops and phones.
 */
export function compressImage(
  file: File,
  maxWidth = 500,
  maxHeight = 500,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Basic safety check: If it's not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate safe dimensions preserving aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to uncompressed Base64 if canvas is unavailable
          resolve(event.target?.result as string);
          return;
        }

        // Draw image resized onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas image to WebP or JPEG with quality reduction
        // WebP is preferred but fallback to JPEG for complete browser compatibility
        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (e) {
          resolve(event.target?.result as string);
        }
      };

      img.onerror = (err) => {
        reject(err);
      };
    };

    reader.onerror = (err) => {
      reject(err);
    };
  });
}
