// Format A — the profile picture frame.
//
// Two constraints drive the layout. X crops avatars to a circle, so every piece
// of branding sits inside the inscribed circle. And the photo is clipped to a
// circle *inside* the frame, so it never bleeds into the border or the corners —
// the square around it stays solid brand colour.

import { EVENT, type Theme } from '../../brand';
import { display, mono } from '../fonts';
import { palm, sparkle, sun, wavyBand } from './motifs';
import { arcText, cover, grain, grid, rays, text, type Ctx } from './primitives';
import type { RenderState, RingStyle } from './types';

const SIZE = 1080;
const C = SIZE / 2;

/** Radius the photo is clipped to, per frame style. */
const PHOTO_RADIUS: Record<RingStyle, number> = {
  seal: 444,
  wave: 430,
  tape: 468,
};

function ring(ctx: Ctx, radius: number, width: number, color: string): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(C, C, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Brand-coloured square with the photo clipped into a circle at its centre.
 * Everything outside that circle belongs to the frame.
 */
function backdrop(ctx: Ctx, state: RenderState, theme: Theme, radius: number): void {
  ctx.fillStyle = theme.ink;
  ctx.fillRect(0, 0, SIZE, SIZE);

  grid(ctx, SIZE, SIZE, 60, theme.rule, 0.4);
  rays(ctx, C, C, radius, 760, 16, theme.gold, 0.05);

  ctx.save();
  ctx.beginPath();
  ctx.arc(C, C, radius, 0, Math.PI * 2);
  ctx.clip();

  if (state.photo) {
    const d = radius * 2;
    cover(ctx, state.photo.canvas, C - radius, C - radius, d, d, state.zoom, state.panX, state.panY);
  } else {
    ctx.fillStyle = theme.ink;
    ctx.fillRect(C - radius, C - radius, radius * 2, radius * 2);
    grid(ctx, SIZE, SIZE, 60, theme.rule, 0.6);
    sun(ctx, C, C - 40, 78, theme.gold);
    text(ctx, 'ADD YOUR PHOTO', C, C + 130, {
      font: mono(26, 500),
      color: theme.paper,
      align: 'center',
      baseline: 'middle',
      tracking: 6,
    });
  }
  ctx.restore();
}

function drawSeal(ctx: Ctx, theme: Theme): void {
  ring(ctx, 448, 9, theme.gold);
  ring(ctx, 536, 8, theme.gold);

  // The band is only 92px deep. A second concentric line of type collides with
  // the wordmark's descenders, so the seal carries the name and hashtag only.
  arcText(ctx, EVENT.fullName, C, C, 496, -Math.PI / 2, {
    font: display(48, 900),
    color: theme.paper,
    tracking: 3,
  });

  arcText(ctx, EVENT.hashtag, C, C, 494, Math.PI / 2, {
    font: display(52, 900),
    color: theme.gold,
    tracking: 2,
    flip: true,
  });

  sparkle(ctx, C + 495, C, 15, theme.hot);
  sparkle(ctx, C - 495, C, 15, theme.hot);
}

function drawWave(ctx: Ctx, theme: Theme): void {
  ring(ctx, 436, 11, theme.gold);

  sun(ctx, 812, 236, 36, theme.gold);

  // Gold band first, ink band 16px lower — the offset is what makes the lip.
  wavyBand(ctx, 0, 774, SIZE, SIZE, 26, 3, theme.gold);
  wavyBand(ctx, 0, 790, SIZE, SIZE, 26, 3, theme.ink);

  // Both palms have to stand where the avatar circle is still wide, or the
  // crop shears their fronds off.
  palm(ctx, 236, 946, 132, theme.gold, -8);
  palm(ctx, 852, 958, 118, theme.gold, 9);

  text(ctx, EVENT.fullName, C, 878, {
    font: display(66, 900),
    color: theme.paper,
    align: 'center',
    baseline: 'middle',
    tracking: 1,
    maxWidth: 600,
    minSize: 42,
  });

  text(ctx, EVENT.dates, C, 926, {
    font: mono(23, 500),
    color: theme.paper,
    align: 'center',
    baseline: 'middle',
    tracking: 5,
    maxWidth: 620,
  });

  text(ctx, EVENT.hashtag, C, 988, {
    font: display(44, 900),
    color: theme.gold,
    align: 'center',
    baseline: 'middle',
    maxWidth: 520,
  });

  sparkle(ctx, C - 190, 986, 12, theme.hot);
  sparkle(ctx, C + 190, 986, 12, theme.hot);
}

function drawTape(ctx: Ctx, theme: Theme): void {
  ring(ctx, 486, 32, theme.gold);
  ring(ctx, 508, 4, theme.hot);
  ring(ctx, 470, 5, theme.ink);

  arcText(ctx, `${EVENT.fullName} · ${EVENT.year}`, C, C, 486, -Math.PI / 2, {
    font: mono(21, 500),
    color: theme.ink,
    tracking: 6,
  });

  arcText(ctx, `${EVENT.hashtag} · ${EVENT.dates}`, C, C, 486, Math.PI / 2, {
    font: mono(21, 500),
    color: theme.ink,
    tracking: 6,
    flip: true,
  });

  for (const angle of [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4]) {
    sparkle(ctx, C + Math.cos(angle) * 486, C + Math.sin(angle) * 486, 13, theme.ink);
  }
}

export function renderPfp(ctx: Ctx, state: RenderState, theme: Theme): void {
  ctx.clearRect(0, 0, SIZE, SIZE);
  backdrop(ctx, state, theme, PHOTO_RADIUS[state.ring]);

  if (state.ring === 'wave') drawWave(ctx, theme);
  else if (state.ring === 'tape') drawTape(ctx, theme);
  else drawSeal(ctx, theme);

  grain(ctx, SIZE, SIZE, 0.045);
}
