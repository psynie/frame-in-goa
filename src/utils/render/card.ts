// Format B — the builder ID card. A 4:5 badge, sized for how X actually crops
// portrait images in the timeline.

import { EVENT, type Theme } from '../../brand';
import { display, mono } from '../fonts';
import { palm, sparkle } from './motifs';
import {
  barcode,
  cover,
  grain,
  grid,
  readableOn,
  roundedPath,
  text,
  textWidth,
  type Ctx,
} from './primitives';
import type { RenderState } from './types';

const W = 1080;
const H = 1350;
const M = 76;

const upper = (v: string, fallback: string) => (v.trim() || fallback).toUpperCase();

function pill(
  ctx: Ctx,
  cx: number,
  cy: number,
  label: string,
  font: string,
  bg: string,
  fg: string,
  tracking: number,
  height: number,
  maxWidth: number,
): void {
  const opts = { font, color: fg, tracking, maxWidth: maxWidth - 72 };
  const w = Math.min(textWidth(ctx, label, opts) + 72, maxWidth);

  ctx.save();
  ctx.fillStyle = bg;
  roundedPath(ctx, cx - w / 2, cy - height / 2, w, height, height / 2);
  ctx.fill();
  ctx.restore();

  text(ctx, label, cx, cy + 1, { ...opts, align: 'center', baseline: 'middle' });
}

function header(ctx: Ctx, theme: Theme): void {
  ctx.fillStyle = theme.ink;
  ctx.fillRect(0, 0, W, 258);

  // Lanyard slot — the detail that makes it read as a badge rather than a poster.
  ctx.save();
  ctx.fillStyle = theme.paper;
  roundedPath(ctx, W / 2 - 96, 40, 192, 34, 17);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.3;
  palm(ctx, 116, 252, 96, theme.gold, -9);
  palm(ctx, 966, 252, 88, theme.gold, 10);
  ctx.restore();

  text(ctx, EVENT.fullName, W / 2, 168, {
    font: display(60, 900),
    color: theme.paper,
    align: 'center',
    tracking: 1,
    maxWidth: 800,
  });

  text(ctx, `${EVENT.cityLocal} · ${EVENT.place} · ${EVENT.dates}`, W / 2, 214, {
    font: mono(21, 500),
    color: theme.gold,
    align: 'center',
    tracking: 4,
    maxWidth: 860,
  });

  ctx.fillStyle = theme.gold;
  ctx.fillRect(0, 258, W, 12);
  ctx.fillStyle = theme.hot;
  ctx.fillRect(0, 270, W, 5);
}

function portrait(ctx: Ctx, state: RenderState, theme: Theme): void {
  const x = M;
  const y = 314;
  const w = W - M * 2;
  const h = 588;

  ctx.save();
  roundedPath(ctx, x, y, w, h, 22);
  ctx.clip();

  ctx.fillStyle = theme.ink;
  ctx.fillRect(x, y, w, h);

  if (state.photo) {
    cover(ctx, state.photo.canvas, x, y, w, h, state.zoom, state.panX, state.panY);
  } else {
    grid(ctx, W, H, 54, theme.rule, 0.3);
    text(ctx, 'ADD YOUR PHOTO', x + w / 2, y + h / 2, {
      font: mono(26, 500),
      color: theme.paper,
      align: 'center',
      baseline: 'middle',
      tracking: 6,
    });
  }
  ctx.restore();

  ctx.save();
  roundedPath(ctx, x, y, w, h, 22);
  ctx.strokeStyle = theme.gold;
  ctx.lineWidth = 9;
  ctx.stroke();
  ctx.restore();

  sparkle(ctx, x + w - 46, y + h - 46, 16, theme.hot);
}

function identity(ctx: Ctx, state: RenderState, theme: Theme): void {
  text(ctx, upper(state.name, 'your name'), W / 2, 984, {
    font: display(88, 900),
    color: theme.ink,
    align: 'center',
    tracking: 0,
    maxWidth: W - M * 2,
    minSize: 40,
  });

  pill(
    ctx,
    W / 2,
    1040,
    upper(state.role, 'role / stack'),
    mono(24, 500),
    theme.hot,
    // `hot` is a light yellow in some themes, so the chip picks its own text colour.
    readableOn(theme.hot, theme.paper, theme.ink),
    4,
    58,
    W - M * 2,
  );

  text(ctx, 'BUILDER TITLE', W / 2, 1104, {
    font: mono(17, 500),
    color: theme.rule,
    align: 'center',
    tracking: 6,
  });

  text(ctx, upper(state.title, 'the vision builder'), W / 2, 1152, {
    font: display(44, 900),
    color: theme.ink,
    align: 'center',
    maxWidth: W - M * 2,
    minSize: 26,
  });
}

function stub(ctx: Ctx, state: RenderState, theme: Theme): void {
  const y = 1200;

  // Perforation.
  ctx.save();
  ctx.fillStyle = theme.rule;
  for (let x = M; x < W - M; x += 22) {
    ctx.beginPath();
    ctx.arc(x, y - 14, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.fillStyle = theme.ink;
  ctx.fillRect(0, y, W, H - y);

  text(ctx, 'TEAM / COLLECTIVE', M, y + 42, {
    font: mono(16, 500),
    color: theme.gold,
    tracking: 4,
  });

  text(ctx, upper(state.team, 'independent'), M, y + 92, {
    font: display(36, 900),
    color: theme.paper,
    maxWidth: 440,
    minSize: 20,
  });

  text(ctx, EVENT.hashtag, W - M, y + 54, {
    font: display(42, 900),
    color: theme.gold,
    align: 'right',
  });

  barcode(ctx, W - M - 236, y + 74, 236, 28, `${state.name}${state.team}${state.role}`, theme.paper);
}

export function renderCard(ctx: Ctx, state: RenderState, theme: Theme): void {
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = theme.paper;
  ctx.fillRect(0, 0, W, H);
  grid(ctx, W, H, 45, theme.rule, 0.14);

  header(ctx, theme);
  portrait(ctx, state, theme);
  identity(ctx, state, theme);
  stub(ctx, state, theme);

  ctx.save();
  ctx.strokeStyle = theme.ink;
  ctx.lineWidth = 26;
  ctx.strokeRect(13, 13, W - 26, H - 26);
  ctx.restore();

  grain(ctx, W, H, 0.05);
}
