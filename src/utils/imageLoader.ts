// Turns whatever the user picked into a plain, correctly-oriented canvas that the
// renderer can draw dozens of times per second without re-decoding anything.

/** Longest edge we keep. The largest thing we ever draw into is 1080px, so 1800
 *  leaves room for 1.6x zoom without softness while keeping redraws cheap. */
const MAX_EDGE = 1800;
const MAX_BYTES = 30 * 1024 * 1024;

export type Photo = {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
};

export class PhotoError extends Error {}

const isHeic = (file: File) =>
  /hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

const isSupported = (file: File) =>
  /^image\//i.test(file.type) || /\.(jpe?g|png|webp|gif|hei[cf]|avif)$/i.test(file.name);

/** heic2any is ~1.4MB, so it only ever loads for the people who actually need it. */
async function decodeHeic(file: File): Promise<Blob> {
  const { default: heic2any } = await import('heic2any');
  const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
  return Array.isArray(out) ? out[0] : (out as Blob);
}

/**
 * Safari and Chrome disagree on whether createImageBitmap honours EXIF, so we ask
 * for `from-image` explicitly and fall back to an <img>, which auto-orients per spec.
 */
async function decode(blob: Blob): Promise<{ source: CanvasImageSource; w: number; h: number }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
      return { source: bitmap, w: bitmap.width, h: bitmap.height };
    } catch {
      /* falls through to the <img> path below */
    }
  }

  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new PhotoError("We couldn't read that image. Try another photo."));
      el.src = url;
    });
    return { source: img, w: img.naturalWidth, h: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function loadPhoto(file: File): Promise<Photo> {
  if (!isSupported(file)) {
    throw new PhotoError('That file type is not an image. Use JPG, PNG, WEBP or HEIC.');
  }
  if (file.size > MAX_BYTES) {
    throw new PhotoError('That photo is over 30MB. Pick a smaller one.');
  }

  const blob: Blob = isHeic(file) ? await decodeHeic(file) : file;
  const { source, w, h } = await decode(blob);

  if (!w || !h) throw new PhotoError("That image came back empty. Try another photo.");

  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);

  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

  if ('close' in source && typeof source.close === 'function') source.close();

  return { canvas, width: canvas.width, height: canvas.height };
}
