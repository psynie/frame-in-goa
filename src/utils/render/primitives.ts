// Low-level drawing helpers shared by both formats. Everything here is pure
// canvas work with no knowledge of the brand or the layouts.

export type Ctx = CanvasRenderingContext2D;

export type TextOpts = {
  font: string;
  color: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  /** Extra space between glyphs, in px. */
  tracking?: number;
  /** Shrinks the font until the string fits this width. */
  maxWidth?: number;
  /** Font size floor when shrinking. */
  minSize?: number;
};

const segmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;

/**
 * Splits into user-perceived characters. Iterating a string by code point tears
 * Devanagari apart — "गोवा" becomes ग + ो + व + ा, and the detached vowel signs
 * land on the wrong glyphs. Anything that draws character-by-character (tracking,
 * arc text) has to walk grapheme clusters instead.
 */
function graphemes(str: string): string[] {
  if (!segmenter) return [...str];
  return [...segmenter.segment(str)].map((s) => s.segment);
}

const sizeOf = (font: string) => Number(/(\d+(?:\.\d+)?)px/.exec(font)?.[1] ?? 16);
const resize = (font: string, size: number) => font.replace(/\d+(?:\.\d+)?px/, `${size}px`);

/** Width of a string including manual tracking. */
export function measure(ctx: Ctx, str: string, tracking = 0): number {
  const base = ctx.measureText(str).width;
  return str.length > 1 ? base + tracking * (str.length - 1) : base;
}

/** Returns the font string that makes `str` fit inside `maxWidth`. */
function shrinkToFit(ctx: Ctx, str: string, opts: TextOpts): string {
  let font = opts.font;
  if (!opts.maxWidth) return font;

  const floor = opts.minSize ?? 16;
  let size = sizeOf(font);

  ctx.font = font;
  while (measure(ctx, str, opts.tracking) > opts.maxWidth && size > floor) {
    size -= 1;
    font = resize(font, size);
    ctx.font = font;
  }
  return font;
}

/** Draws a single line, honouring tracking, alignment and auto-shrink. */
export function text(ctx: Ctx, str: string, x: number, y: number, opts: TextOpts): void {
  if (!str) return;

  ctx.save();
  ctx.font = shrinkToFit(ctx, str, opts);
  ctx.fillStyle = opts.color;
  ctx.textBaseline = opts.baseline ?? 'alphabetic';

  const tracking = opts.tracking ?? 0;
  const align = opts.align ?? 'left';

  if (!tracking) {
    ctx.textAlign = align;
    ctx.fillText(str, x, y);
    ctx.restore();
    return;
  }

  // Manual tracking means we have to place the run ourselves.
  const width = measure(ctx, str, tracking);
  let cursor = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x;

  ctx.textAlign = 'left';
  for (const ch of graphemes(str)) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + tracking;
  }
  ctx.restore();
}

/** Width the same call to `text` would occupy. */
export function textWidth(ctx: Ctx, str: string, opts: TextOpts): number {
  ctx.save();
  ctx.font = shrinkToFit(ctx, str, opts);
  const w = measure(ctx, str, opts.tracking);
  ctx.restore();
  return w;
}

/**
 * Lays a string along a circle. `centerAngle` is where the middle of the string
 * sits (-PI/2 is top, PI/2 is bottom); bottom arcs need `flip` so they read
 * left-to-right rather than upside down.
 */
export function arcText(
  ctx: Ctx,
  str: string,
  cx: number,
  cy: number,
  radius: number,
  centerAngle: number,
  opts: TextOpts & { flip?: boolean },
): void {
  if (!str) return;

  ctx.save();
  ctx.font = opts.font;
  ctx.fillStyle = opts.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const dir = opts.flip ? -1 : 1;
  const tracking = opts.tracking ?? 0;
  const chars = graphemes(str);
  const widths = chars.map((ch) => ctx.measureText(ch).width + tracking);
  const span = widths.reduce((a, b) => a + b, 0) / radius;

  let angle = centerAngle - (dir * span) / 2;

  for (let i = 0; i < chars.length; i++) {
    const step = widths[i] / radius;
    const at = angle + (dir * step) / 2;

    ctx.save();
    ctx.translate(cx + Math.cos(at) * radius, cy + Math.sin(at) * radius);
    ctx.rotate(at + (opts.flip ? -Math.PI / 2 : Math.PI / 2));
    ctx.fillText(chars[i], 0, 0);
    ctx.restore();

    angle += dir * step;
  }
  ctx.restore();
}

/** Draws `photo` so it covers the current clip region, honouring zoom and pan. */
export function cover(
  ctx: Ctx,
  photo: CanvasImageSource & { width: number; height: number },
  x: number,
  y: number,
  w: number,
  h: number,
  zoom: number,
  panX: number,
  panY: number,
): void {
  const scale = Math.max(w / photo.width, h / photo.height) * zoom;
  const dw = photo.width * scale;
  const dh = photo.height * scale;

  // Pan is normalised to -1..1 of the slack in each axis, so dragging feels the
  // same regardless of how the photo was shaped or how far it is zoomed in.
  const slackX = Math.max(0, (dw - w) / 2);
  const slackY = Math.max(0, (dh - h) / 2);

  ctx.drawImage(
    photo,
    x + (w - dw) / 2 + panX * slackX,
    y + (h - dh) / 2 + panY * slackY,
    dw,
    dh,
  );
}

let grainPattern: CanvasPattern | null = null;

/** A cached film-grain tile. Built once, reused for every redraw. */
function grainTile(ctx: Ctx): CanvasPattern | null {
  if (grainPattern) return grainPattern;

  const size = 128;
  const tile = document.createElement('canvas');
  tile.width = tile.height = size;

  const tctx = tile.getContext('2d')!;
  const data = tctx.createImageData(size, size);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 120 + Math.random() * 135;
    data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  tctx.putImageData(data, 0, 0);

  grainPattern = ctx.createPattern(tile, 'repeat');
  return grainPattern;
}

/** Print-like texture over the whole artboard. Keeps flat fills from looking dead. */
export function grain(ctx: Ctx, w: number, h: number, alpha = 0.05): void {
  const pattern = grainTile(ctx);
  if (!pattern) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Evenly spaced hairline grid, drawn under the artwork. */
export function grid(ctx: Ctx, w: number, h: number, step: number, color: string, alpha = 0.35): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = step; x < w; x += step) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
  }
  for (let y = step; y < h; y += step) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
  }
  ctx.stroke();
  ctx.restore();
}

/** Radiating wedges from a point — the sunburst behind the seal. */
export function rays(
  ctx: Ctx,
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  count: number,
  color: string,
  alpha = 0.18,
  offset = 0,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  const wedge = Math.PI / count;

  for (let i = 0; i < count; i++) {
    const a = offset + i * 2 * wedge;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    ctx.lineTo(cx + Math.cos(a + wedge) * outer, cy + Math.sin(a + wedge) * outer);
    ctx.lineTo(cx + Math.cos(a + wedge) * inner, cy + Math.sin(a + wedge) * inner);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** A row of varied-width bars — reads as a barcode without encoding anything. */
export function barcode(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  seed: string,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;

  // Deterministic from the seed so a given card always looks the same.
  let state = 0;
  for (let i = 0; i < seed.length; i++) state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };

  let cursor = x;
  while (cursor < x + w) {
    const bar = 2 + Math.round(next() * 5);
    const gap = 2 + Math.round(next() * 4);
    if (cursor + bar > x + w) break;
    ctx.fillRect(cursor, y, bar, h);
    cursor += bar + gap;
  }
  ctx.restore();
}

/**
 * Picks whichever of two colours stays readable on `bg`. Themes swap which slot
 * holds a light colour, so filled chips can't hardcode their text colour.
 */
export function readableOn(bg: string, light: string, dark: string): string {
  const hex = /^#?([0-9a-f]{6})$/i.exec(bg);
  if (!hex) return dark;

  const n = parseInt(hex[1], 16);
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const luminance =
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255);

  return luminance > 0.4 ? dark : light;
}

/** Rounded rectangle path, falling back for browsers without `roundRect`. */
export function roundedPath(ctx: Ctx, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  const radius = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
