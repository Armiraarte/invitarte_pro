import type { CSSProperties } from 'react';

const SOFT_IMAGE_FILTER = 'contrast(1.03) saturate(1.05) brightness(1.01)';

export const getImagePresentationStyle = (scale: number): CSSProperties => ({
  transform: `scale(${scale})`,
  transformOrigin: 'center center',
  filter: SOFT_IMAGE_FILTER,
  imageRendering: 'auto',
  backfaceVisibility: 'hidden',
});
