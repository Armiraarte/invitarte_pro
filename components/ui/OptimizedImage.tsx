import React from 'react';

type OptimizedImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  decoding?: 'async' | 'auto' | 'sync';
  sizes?: string;
  width?: number;
  height?: number;
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  style,
  loading = 'lazy',
  fetchPriority = 'auto',
  decoding = 'async',
  sizes,
  width,
  height
}) => (
  <img
    src={src}
    alt={alt}
    className={className}
    style={style}
    loading={loading}
    fetchPriority={fetchPriority}
    decoding={decoding}
    sizes={sizes}
    width={width}
    height={height}
  />
);
