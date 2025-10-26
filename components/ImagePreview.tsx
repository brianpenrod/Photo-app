
import React from 'react';
import type { UploadedImage } from '../types';
import { TrashIcon } from './Icons';

interface ImagePreviewProps {
  image: UploadedImage;
  onRemove: (id: string) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ image, onRemove }) => {
  return (
    <div className="relative group aspect-square">
      <img
        src={image.base64URL}
        alt={image.file.name}
        className="w-full h-full object-cover rounded-lg"
      />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
        <button
          onClick={() => onRemove(image.id)}
          className="p-2 bg-red-600/80 hover:bg-red-500 rounded-full text-white transition-colors"
          aria-label="Remove image"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};
