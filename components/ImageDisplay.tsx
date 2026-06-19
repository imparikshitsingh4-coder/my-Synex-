'use client';

import Image from 'next/image';

interface ImageResult {
  url: string;
  prompt: string;
}

interface ImageDisplayProps {
  images: ImageResult[];
  isLoading: boolean;
}

export default function ImageDisplay({ images, isLoading }: ImageDisplayProps) {
  if (images.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-5xl mb-4">🎨</div>
          <h2 className="text-2xl font-bold text-secondary mb-2">Generate Images</h2>
          <p className="text-gray-400">Describe your vision and watch it come to life</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
      {images.map((image, idx) => (
        <div
          key={idx}
          className="bg-white/5 border border-white/10 rounded-lg overflow-hidden animate-in fade-in"
        >
          <div className="relative w-full h-64 bg-gradient-to-br from-secondary/20 to-accent/20">
            <Image
              src={image.url}
              alt={image.prompt}
              fill
              className="object-cover"
              crossOrigin="anonymous"
            />
          </div>
          <div className="p-3 border-t border-white/10">
            <p className="text-xs text-gray-300 line-clamp-2">{image.prompt}</p>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-accent rounded-full animate-spin opacity-50" />
              <div className="absolute inset-1 bg-background rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">🎨</div>
            </div>
            <p className="text-sm text-gray-400">Generating your image...</p>
          </div>
        </div>
      )}
    </div>
  );
}
