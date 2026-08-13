// Format A — the profile picture frame.
//
// X crops avatars to a circle, so every piece of branding here lives inside the
// inscribed circle and the photo fills the full square. That way the export works
// both as an avatar and as a standalone square image.

import { EVENT, type Theme } from '../../brand';
import { display, mono } from '../fonts';
import { palm, sparkle, sun, wavyBand, waves } from './motifs';
import {
  arcText,
  cover,
  grain,
  grid,
  roundedPath,
  text,
  textWidth,
  type Ctx,
} from './primitives';
import type { RenderState } from './types';

const SIZE = 1080;
const C = SIZE / 2;

/** Filled ring between two radii. */
function annulus(ctx: Ctx, rOuter: number, rInner: number, color: string): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(C, C, rOuter, 0, Math.PI * 2);
  ctx.arc(C, C, rInner, 0, Math.PI * 2, true);
  ctx.fill('evenodd');
  ctx.restore();
}

function ring(ctx: Ctx, radius: number, width: number, color: string, dash?: number[]): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.arc(C, C, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** Rounded label chip, auto-sized to its text. */
function pill(
  ctx: Ctx,
  cx: number,
  cy: number,
  label: string,
  font: string,
  bg: string,
  fg: string,
  tracking = 4,
  padX = 30,
  height = 56,
): void {
  const w = textWidth(ctx, label, { font, color: fg, tracking }) + padX * 2;

  ctx.save();
  ctx.fillStyle = bg;
  roundedPath(ctx, cx - w / 2, cy - height / 2, w, height, height / 2);
  ctx.fill();
  ctx.restore();

  text(ctx, label, cx, cy, { font, color: fg, align: 'center', baseline: 'middle', tracking });
}

/** Darkens the outer edge so light photos never wash out against the frame. */
function vignette(ctx: Ctx, theme: Theme): void {
  const g = ctx.createRadialGradient(C, C, SIZE * 0.28, C, C, SIZE * 0.58);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = theme.ink;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.restore();
}

function backdrop(ctx: Ctx, state: RenderState, theme: Theme): void {
  ctx.fillStyle = theme.ink;
  ctx.fillRect(0, 0, SIZE, SIZE);

  if (state.photo) {
    cover(ctx, state.photo.canvas, 0, 0, SIZE, SIZE, state.zoom, state.panX, state.panY);
    vignette(ctx, theme);
    return;
  }

  // Empty state still shows the frame, so people can see what they are getting.
  grid(ctx, SIZE, SIZE, 60, theme.rule, 0.5);
  sun(ctx, C, C - 40, 78, theme.gold);
  text(ctx, 'ADD YOUR PHOTO', C, C + 130, {
    font: mono(26, 500),
    color: theme.paper,
    align: 'center',
    baseline: 'middle',
    tracking: 6,
  });
}

function drawSeal(ctx: Ctx, theme: Theme): void {
  annulus(ctx, C, 446, theme.ink);
  ring(ctx, 535, 8, theme.gold);
  ring(ctx, 450, 7, theme.gold);
  ring(ctx, 433, 3, theme.hot);

  arcText(ctx, `${EVENT.name}  ·  ${EVENT.cityLocal}`, C, C, 493, -Math.PI / 2, {
    font: display(46, 900),
    color: theme.paper,
    tracking: 3,
  });

  arcText(ctx, EVENT.hashtag, C, C, 491, Math.PI / 2, {
    font: display(52, 900),
    color: theme.gold,
    tracking: 2,
    flip: true,
  });

  sparkle(ctx, C + 493, C, 15, theme.hot);
  sparkle(ctx, C - 493, C, 15, theme.hot);

  pill(ctx, C, 142, EVENT.dates, mono(23, 500), theme.ink, theme.gold, 5, 32, 58);
}

function drawWave(ctx: Ctx, theme: Theme): void {
  sun(ctx, 812, 252, 38, theme.gold);

  // Gold band first, ink band 16px lower — the offset is what makes the lip.
  wavyBand(ctx, 0, 774, SIZE, SIZE, 26, 3, theme.gold);
  wavyBand(ctx, 0, 790, SIZE, SIZE, 26, 3, theme.ink);

  // Both palms have to stand where the avatar circle is still wide, or the
  // crop shears their fronds off.
  palm(ctx, 236, 946, 132, theme.gold, -8);
  palm(ctx, 852, 958, 118, theme.gold, 9);

  text(ctx, EVENT.name, C, 878, {
    font: display(76, 900),
    color: theme.paper,
    align: 'center',
    baseline: 'middle',
    tracking: 1,
    maxWidth: 580,
    minSize: 48,
  });

  text(ctx, `${EVENT.city}  ·  ${EVENT.dates}`, C, 926, {
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

  ring(ctx, 528, 16, theme.gold);
}

function drawTape(ctx: Ctx, theme: Theme): void {
  ring(ctx, 520, 32, theme.gold);
  ring(ctx, 497, 7, theme.ink);
  ring(ctx, 480, 4, theme.hot);

  arcText(ctx, `${EVENT.name} · ${EVENT.city} ${EVENT.year}`, C, C, 520, -Math.PI / 2, {
    font: mono(21, 500),
    color: theme.ink,
    tracking: 7,
  });

  arcText(ctx, `${EVENT.dates} · ${EVENT.place}`, C, C, 520, Math.PI / 2, {
    font: mono(21, 500),
    color: theme.ink,
    tracking: 7,
    flip: true,
  });

  for (const angle of [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4]) {
    sparkle(ctx, C + Math.cos(angle) * 520, C + Math.sin(angle) * 520, 13, theme.ink);
  }

  pill(ctx, C, 902, EVENT.hashtag, display(46, 900), theme.ink, theme.gold, 1, 40, 82);
}

export function renderPfp(ctx: Ctx, state: RenderState, theme: Theme): void {
  ctx.clearRect(0, 0, SIZE, SIZE);
  backdrop(ctx, state, theme);

  if (state.ring === 'wave') drawWave(ctx, theme);
  else if (state.ring === 'tape') drawTape(ctx, theme);
  else drawSeal(ctx, theme);

  grain(ctx, SIZE, SIZE, 0.045);
}
