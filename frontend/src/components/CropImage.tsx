import React, { useState } from 'react';
import { getCropImageMetadata, getCropImage, DEFAULT_CROP_FALLBACK } from '../services/imageService';
import { CropItem } from '../data/crops';

export interface CropImageProps {
  crop?: CropItem | null;
  cropName?: string;
  src?: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
}

export const CropImage: React.FC<CropImageProps> = ({
  crop,
  cropName,
  src,
  alt,
  className = '',
  fallbackSrc,
  loading = 'lazy'
}) => {
  // Resolve crop metadata if available
  const resolvedName = cropName || crop?.name || '';
  const metadata = resolvedName ? getCropImageMetadata(resolvedName) : null;

  const primarySrc = src || crop?.imageUrl || crop?.image || (metadata ? metadata.imageUrl : (resolvedName ? getCropImage(resolvedName) : DEFAULT_CROP_FALLBACK));
  const secondarySrc = metadata?.secondaryImageUrl || fallbackSrc || DEFAULT_CROP_FALLBACK;
  const resolvedAlt = alt || crop?.imageAlt || metadata?.imageAlt || (resolvedName ? `Fresh ${resolvedName}` : 'Agricultural crop produce');

  const [currentSrcIndex, setCurrentSrcIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Hierarchy of sources
  const srcHierarchy = [
    primarySrc,
    secondarySrc,
    DEFAULT_CROP_FALLBACK
  ].filter(Boolean) as string[];

  const currentSrc = srcHierarchy[Math.min(currentSrcIndex, srcHierarchy.length - 1)];

  const handleError = () => {
    if (currentSrcIndex < srcHierarchy.length - 1) {
      setCurrentSrcIndex(prev => prev + 1);
    } else {
      setIsLoaded(true);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-cream-dark ${className}`}>
      {/* Loading Skeleton Pulse */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-cream-dark via-cream to-cream-dark animate-pulse z-10" />
      )}

      <img
        src={currentSrc}
        alt={resolvedAlt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover transition-all duration-500 ease-out ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      />
    </div>
  );
};
