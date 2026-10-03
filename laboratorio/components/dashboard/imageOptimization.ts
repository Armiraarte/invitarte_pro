export type ImageOptimizationTarget =
  | 'global-background'
  | 'section-background'
  | 'main-image'
  | 'content-image';

type ImageOptimizationPreset = {
  maxDimension: number;
  quality: number;
  keepOriginalBelowBytes: number;
};

const IMAGE_OPTIMIZATION_PRESETS: Record<ImageOptimizationTarget, ImageOptimizationPreset> = {
  'global-background': {
    maxDimension: 1600,
    quality: 0.8,
    keepOriginalBelowBytes: 350_000,
  },
  'section-background': {
    maxDimension: 1600,
    quality: 0.8,
    keepOriginalBelowBytes: 320_000,
  },
  'main-image': {
    maxDimension: 1400,
    quality: 0.84,
    keepOriginalBelowBytes: 300_000,
  },
  'content-image': {
    maxDimension: 1200,
    quality: 0.82,
    keepOriginalBelowBytes: 260_000,
  },
};

const BYPASS_IMAGE_TYPES = new Set(['image/gif', 'image/svg+xml']);

const readFileAsDataUrl = (file: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();

  reader.onload = () => {
    if (typeof reader.result === 'string') {
      resolve(reader.result);
      return;
    }

    reject(new Error('No se pudo leer la imagen como data URL.'));
  };

  reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer la imagen.'));
  reader.readAsDataURL(file);
});

const loadImageElement = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.decoding = 'async';
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('No se pudo decodificar la imagen.'));
  image.src = src;
});

const getConstrainedSize = (width: number, height: number, maxDimension: number) => {
  if (!width || !height) {
    return { width: 0, height: 0 };
  }

  const largestSide = Math.max(width, height);

  if (largestSide <= maxDimension) {
    return { width, height };
  }

  const scale = maxDimension / largestSide;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

export const optimizeUploadedImage = async (
  file: File,
  target: ImageOptimizationTarget
): Promise<string> => {
  const originalDataUrl = await readFileAsDataUrl(file);

  if (!file.type.startsWith('image/') || BYPASS_IMAGE_TYPES.has(file.type)) {
    return originalDataUrl;
  }

  try {
    const preset = IMAGE_OPTIMIZATION_PRESETS[target];
    const image = await loadImageElement(originalDataUrl);
    const nextSize = getConstrainedSize(image.naturalWidth, image.naturalHeight, preset.maxDimension);

    if (!nextSize.width || !nextSize.height) {
      return originalDataUrl;
    }

    const alreadyEfficient =
      nextSize.width === image.naturalWidth
      && nextSize.height === image.naturalHeight
      && file.type === 'image/webp'
      && file.size <= preset.keepOriginalBelowBytes;

    if (alreadyEfficient) {
      return originalDataUrl;
    }

    const canvas = document.createElement('canvas');
    canvas.width = nextSize.width;
    canvas.height = nextSize.height;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) {
      return originalDataUrl;
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, nextSize.width, nextSize.height);

    const optimizedDataUrl = canvas.toDataURL('image/webp', preset.quality);

    return optimizedDataUrl.length < originalDataUrl.length
      ? optimizedDataUrl
      : originalDataUrl;
  } catch {
    return originalDataUrl;
  }
};
