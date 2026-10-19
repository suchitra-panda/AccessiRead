import { PreprocessingConfig } from '../types';

/**
 * Apply image preprocessing pipeline on HTML5 canvas and return base64 DataURL
 */
export async function preprocessImage(
  imageSource: string | HTMLImageElement,
  config: PreprocessingConfig
): Promise<{ dataUrl: string; width: number; height: number }> {
  const img = await resolveImage(imageSource);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context could not be created');
  }

  // Handle deskew rotation if needed
  const rad = (config.deskewAngle * Math.PI) / 180;
  const absCos = Math.abs(Math.cos(rad));
  const absSin = Math.abs(Math.sin(rad));

  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  canvas.width = Math.floor(origWidth * absCos + origHeight * absSin);
  canvas.height = Math.floor(origWidth * absSin + origHeight * absCos);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -origWidth / 2, -origHeight / 2);
  ctx.restore();

  // If no pixel transformations requested, return rotated
  if (!config.grayscale && !config.binarize && config.contrast === 0 && config.brightness === 0 && !config.invert) {
    return { dataUrl: canvas.toDataURL('image/jpeg', 0.95), width: canvas.width, height: canvas.height };
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const len = data.length;

  const contrastFactor = (259 * (config.contrast + 255)) / (255 * (259 - config.contrast));
  const brightnessOffset = config.brightness * 1.28; // scale -100..100 to approx -128..128

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Contrast & Brightness
    if (config.contrast !== 0) {
      r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
      g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
      b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));
    }
    if (config.brightness !== 0) {
      r = Math.min(255, Math.max(0, r + brightnessOffset));
      g = Math.min(255, Math.max(0, g + brightnessOffset));
      b = Math.min(255, Math.max(0, b + brightnessOffset));
    }

    // Grayscale (Luminance weighting)
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    if (config.binarize) {
      // Thresholding
      const binaryVal = gray >= config.threshold ? 255 : 0;
      data[i] = binaryVal;
      data[i + 1] = binaryVal;
      data[i + 2] = binaryVal;
    } else if (config.grayscale) {
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    } else {
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    // Invert if needed
    if (config.invert) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.92),
    width: canvas.width,
    height: canvas.height
  };
}

function resolveImage(source: string | HTMLImageElement): Promise<HTMLImageElement> {
  if (typeof source !== 'string') {
    return Promise.resolve(source);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image for preprocessing: ' + err));
    img.src = source;
  });
}

/**
 * Compute Otsu's threshold automatically from image grayscale histogram
 */
export function calculateOtsuThreshold(imageData: ImageData): number {
  const data = imageData.data;
  const histogram = new Array(256).fill(0);
  const totalPixels = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    histogram[gray]++;
  }

  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * histogram[i];

  let sumB = 0;
  let weightB = 0;
  let maxVariance = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    weightB += histogram[t];
    if (weightB === 0) continue;

    const weightF = totalPixels - weightB;
    if (weightF === 0) break;

    sumB += t * histogram[t];
    const meanB = sumB / weightB;
    const meanF = (sum - sumB) / weightF;

    const varianceBetween = weightB * weightF * Math.pow(meanB - meanF, 2);
    if (varianceBetween > maxVariance) {
      maxVariance = varianceBetween;
      threshold = t;
    }
  }

  return threshold;
}
