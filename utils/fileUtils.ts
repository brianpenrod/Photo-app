
import { UploadedImage } from '../types';

export const fileToUploadedImage = (file: File): Promise<UploadedImage> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
        return reject(new Error('Invalid file type. Please upload an image.'));
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [header, base64Data] = result.split(',');
      const mimeTypeMatch = header.match(/:(.*?);/);

      if (!mimeTypeMatch || !base64Data) {
        return reject(new Error('Invalid image format. Could not read base64 data.'));
      }

      const mimeType = mimeTypeMatch[1];
      resolve({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        base64URL: result,
        base64Data,
        mimeType,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
