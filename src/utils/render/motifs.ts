// Hand-drawn Goa motifs. Vector paths rather than image assets so they stay
// crisp at any export size and recolour with the theme for free.

import type { Ctx } from './primitives';

const rad = (deg: number) => (deg * Math.PI) / 180;

/** One drooping palm frond growing out of (cx, cy) at `angle`. */
function frond(ctx: Ctx, cx: number, cy: number, angle: number, len: number, width: number): void {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const nx = -dy;
  const ny = dx;

  // Gravity pulls the tip down, which is what makes it read as a palm.
  const tipX = cx + dx * len;
  const tipY = cy + dy * len + len * 0.3;

  ctx.moveTo(cx, cy);
  ctx.quadraticCurveTo(
    cx + dx * len * 0.55 + nx * width,
    cy + dy * len * 0.55 + ny * width,
    tipX,
    tipY,
  );
  ctx.quadraticCurveTo(
    cx + dx * len * 0.5 - nx * width * 0.35,
    cy + dy * len * 0.5 - ny * width * 0.35,
    cx,
    cy,
  );
}

/** Palm silhouette standing on (x, y). `lean` tilts the whole tree in degrees. */
export function palm(ctx: Ctx, x: number, y: number, size: number, color: string, lean = 0): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rad(lean));
  ctx.fillStyle = color;

  const s = size / 100;
  const crownX = 9 * s;
  const crownY = -78 * s;

  ctx.beginPath();
  ctx.moveTo(-7 * s, 0);
  ctx.quadraticCurveTo(-3 * s, -42 * s, crownX - 3 * s, crownY);
  ctx.lineTo(crownX + 6 * s, crownY + 3 * s);
  ctx.quadraticCurveTo(4 * s, -40 * s, 6 * s, 0);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  for (const angle of [-172, -140, -108, -72, -40, -8]) {
    frond(ctx, crownX, crownY, rad(angle), 46 * s, 13 * s);
  }
  ctx.fill();

  // Coconuts.
  ctx.beginPath();
  ctx.arc(crownX - 6 * s, crownY + 8 * s, 4.5 * s, 0, Math.PI * 2);
  ctx.arc(crownX + 6 * s, crownY + 11 * s, 4 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Sun disc with spiked rays. */
export function sun(ctx: Ctx, cx: number, cy: number, radius: number, color: string, spikes = 12): void {
  ctx.save();
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  for (let i = 0; i < spikes; i++) {
    const a = (i / spikes) * Math.PI * 2;
    const half = Math.PI / spikes / 2.6;
    ctx.moveTo(cx + Math.cos(a - half) * radius * 1.16, cy + Math.sin(a - half) * radius * 1.16);
    ctx.lineTo(cx + Math.cos(a) * radius * 1.68, cy + Math.sin(a) * radius * 1.68);
    ctx.lineTo(cx + Math.cos(a + half) * radius * 1.16, cy + Math.sin(a + half) * radius * 1.16);
    ctx.closePath();
  }
  ctx.fill();
  ctx.restore();
}

/** Four-pointed sparkle used as a punctuation mark between labels. */
export function sparkle(ctx: Ctx, cx: number, cy: number, size: number, color: string): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.quadraticCurveTo(cx + size * 0.18, cy - size * 0.18, cx + size, cy);
  ctx.quadraticCurveTo(cx + size * 0.18, cy + size * 0.18, cx, cy + size);
  ctx.quadraticCurveTo(cx - size * 0.18, cy + size * 0.18, cx - size, cy);
  ctx.quadraticCurveTo(cx - size * 0.18, cy - size * 0.18, cx, cy - size);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Stacked sine waves — the shoreline. */
export function waves(
  ctx: Ctx,
  x: number,
  y: number,
  width: number,
  amplitude: number,
  color: string,
  rows = 3,
  gap = 15,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  for (let r = 0; r < rows; r++) {
    ctx.beginPath();
    const baseY = y + r * gap;
    for (let i = 0; i <= width; i += 6) {
      const wy = baseY + Math.sin((i / width) * Math.PI * 6 + r * 0.9) * amplitude;
      if (i === 0) ctx.moveTo(x + i, wy);
      else ctx.lineTo(x + i, wy);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** Filled band whose top edge is a wave, from `topY` down to `bottomY`. */
export function wavyBand(
  ctx: Ctx,
  x: number,
  topY: number,
  width: number,
  bottomY: number,
  amplitude: number,
  periods: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, bottomY);
  ctx.lineTo(x, topY);
  for (let i = 0; i <= width; i += 5) {
    ctx.lineTo(x + i, topY + Math.sin((i / width) * Math.PI * periods) * amplitude);
  }
  ctx.lineTo(x + width, bottomY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
