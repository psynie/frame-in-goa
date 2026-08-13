import { THEMES } from '../../brand';
import { renderCard } from './card';
import { renderPfp } from './pfp';
import { ARTBOARD, type RenderState } from './types';

export * from './types';

/** Draws `state` into `canvas`, resizing it to the format's artboard first. */
export function render(canvas: HTMLCanvasElement, state: RenderState): void {
  const board = ARTBOARD[state.format];
  if (canvas.width !== board.w || canvas.height !== board.h) {
    canvas.width = board.w;
    canvas.height = board.h;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const theme = THEMES[state.theme];
  if (state.format === 'card') renderCard(ctx, state, theme);
  else renderPfp(ctx, state, theme);
}

/** Renders to an offscreen canvas and hands back a real PNG. */
export function exportPng(state: RenderState): Promise<Blob> {
  const canvas = document.createElement('canvas');
  render(canvas, state);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not export the image.'))),
      'image/png',
    );
  });
}

export function filenameFor(state: RenderState): string {
  const who = state.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const kind = state.format === 'card' ? 'builder-id' : 'pfp';
  return `hh-goa-2026-${kind}${who ? `-${who}` : ''}-FrameInGoa.png`;
}
