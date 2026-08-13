import type { ThemeName } from '../../brand';
import type { Photo } from '../imageLoader';

export type Format = 'pfp' | 'card';

/** Frame treatments for the PFP format. */
export type RingStyle = 'seal' | 'wave' | 'tape';

export const RING_STYLES: { value: RingStyle; label: string; note: string }[] = [
  { value: 'seal', label: 'Coast Seal', note: 'curved wordmark ring' },
  { value: 'wave', label: 'Shoreline', note: 'palms + wave banner' },
  { value: 'tape', label: 'Signal', note: 'minimal double ring' },
];

export type RenderState = {
  format: Format;
  theme: ThemeName;
  ring: RingStyle;
  photo: Photo | null;
  /** 1 = photo exactly covers the frame. */
  zoom: number;
  /** -1..1 of the available slack in each axis. */
  panX: number;
  panY: number;
  name: string;
  role: string;
  title: string;
  team: string;
};

export const ARTBOARD: Record<Format, { w: number; h: number }> = {
  pfp: { w: 1080, h: 1080 },
  card: { w: 1080, h: 1350 },
};
