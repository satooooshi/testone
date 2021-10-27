import { Crop } from 'react-image-crop';

export const getCroppedImageURL = (
  image: HTMLImageElement,
  crop: Crop,
): string | undefined => {
  if (typeof window === 'undefined') {
    return;
  }
  if (
    crop.width === undefined ||
    crop.height === undefined ||
    crop.x === undefined ||
    crop.y === undefined
  ) {
    return;
  }

  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  const pixelRatio = window.devicePixelRatio;
  canvas.width = crop.width * pixelRatio;
  canvas.height = crop.height * pixelRatio;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height,
  );

  return canvas.toDataURL();
};
