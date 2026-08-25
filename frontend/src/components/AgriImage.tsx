import React, { useState } from 'react';

interface AgriImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

const DEFAULT_AGRI_FALLBACK = "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=800";

export const AgriImage: React.FC<AgriImageProps> = ({
  src,
  alt,
  className = "",
  fallbackSrc = DEFAULT_AGRI_FALLBACK
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const currentSrc = hasError ? fallbackSrc : src;

  return (
    <div className={`relative overflow-hidden bg-cream-dark ${className}`}>
      {/* Blur loading skeleton backdrop */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-cream-dark via-cream to-cream-dark animate-pulse z-10" />
      )}
      
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
