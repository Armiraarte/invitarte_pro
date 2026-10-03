const RASTER_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp'
]);

const BYPASS_IMAGE_TYPES = new Set([
  'image/gif',
  'image/svg+xml'
]);

type LoadedImageSource = {
  width: number;
  height: number;
  draw: (context: CanvasRenderingContext2D, width: number, height: number) => void;
  cleanup: () => void;
};

export type OptimizeImageOptions = {
  maxDimension?: number;
  quality?: number;
  minBytesToProcess?: number;
};

const readFileAsDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No pudimos leer la imagen seleccionada.'));
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('No pudimos convertir la imagen a base64.'));
    };
    reader.readAsDataURL(file);
  });

const estimateDataUrlBytes = (value: string) => {
  const base64 = value.split(',', 2)[1] ?? '';
  const padding = (base64.match(/=*$/)?.[0].length ?? 0);
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
};

const loadImageWithElement = (file: Blob) =>
  new Promise<LoadedImageSource>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
        draw: (context, width, height) => {
          context.drawImage(image, 0, 0, width, height);
        },
        cleanup: () => URL.revokeObjectURL(objectUrl)
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No pudimos decodificar la imagen seleccionada.'));
    };

    image.decoding = 'async';
    image.src = objectUrl;
  });

const loadImageSource = async (file: Blob): Promise<LoadedImageSource> => {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        width: bitmap.width,
        height: bitmap.height,
        draw: (context, width, height) => {
          context.drawImage(bitmap, 0, 0, width, height);
        },
        cleanup: () => bitmap.close()
      };
    } catch {
      return loadImageWithElement(file);
    }
  }

  return loadImageWithElement(file);
};

export const optimizeImageFileToDataUrl = async (
  file: File,
  options: OptimizeImageOptions = {}
): Promise<string> => {
  const {
    maxDimension = 1600,
    quality = 0.82,
    minBytesToProcess = 180 * 1024
  } = options;

  if (BYPASS_IMAGE_TYPES.has(file.type) || !RASTER_IMAGE_TYPES.has(file.type)) {
    return readFileAsDataUrl(file);
  }

  try {
    const source = await loadImageSource(file);

    try {
      const originalWidth = source.width || 0;
      const originalHeight = source.height || 0;
      if (originalWidth <= 0 || originalHeight <= 0) {
        return readFileAsDataUrl(file);
      }

      const maxSide = Math.max(originalWidth, originalHeight);
      const scale = maxSide > maxDimension ? maxDimension / maxSide : 1;
      const targetWidth = Math.max(1, Math.round(originalWidth * scale));
      const targetHeight = Math.max(1, Math.round(originalHeight * scale));

      if (scale === 1 && file.size < minBytesToProcess) {
        return readFileAsDataUrl(file);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext('2d', { alpha: true });
      if (!context) {
        return readFileAsDataUrl(file);
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      source.draw(context, targetWidth, targetHeight);

      const optimizedDataUrl = canvas.toDataURL('image/webp', quality);
      if (!optimizedDataUrl.startsWith('data:image/webp')) {
        return readFileAsDataUrl(file);
      }

      const optimizedBytes = estimateDataUrlBytes(optimizedDataUrl);
      if (scale === 1 && optimizedBytes >= file.size * 0.97) {
        return readFileAsDataUrl(file);
      }

      return optimizedDataUrl;
    } finally {
      source.cleanup();
    }
  } catch {
    return readFileAsDataUrl(file);
  }
};
