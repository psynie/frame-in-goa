// Canvas silently substitutes a system font if the family has not finished
// loading, which is how an export ends up looking nothing like the page. So we
// resolve the exact weights the renderer asks for before the first paint.

// Fraunces and DM Mono carry no Devanagari, so "गोवा" would otherwise fall back
// to whatever the OS picks — which shapes the vowel signs inconsistently across
// platforms. Naming a Devanagari font in the stack pins the shaping everywhere.
const DEVANAGARI = "'Noto Sans Devanagari'";

export const DISPLAY = `Fraunces, ${DEVANAGARI}, Georgia, serif`;
export const MONO = `'DM Mono', ${DEVANAGARI}, ui-monospace, monospace`;

const NEEDED = [
  '900 100px Fraunces',
  '700 100px Fraunces',
  "500 100px 'DM Mono'",
  "400 100px 'DM Mono'",
  `700 100px ${DEVANAGARI}`,
  `500 100px ${DEVANAGARI}`,
];

let pending: Promise<void> | null = null;

/** Resolves once the canvas fonts are usable. Safe to await repeatedly. */
export function ensureFonts(): Promise<void> {
  if (pending) return pending;

  if (typeof document === 'undefined' || !document.fonts) {
    pending = Promise.resolve();
    return pending;
  }

  pending = Promise.all(
    NEEDED.map((font) => document.fonts.load(font, 'HACKER गोवा 2026')),
  )
    .then(() => undefined)
    // A font that fails to load is a cosmetic problem, never a blocking one.
    .catch(() => undefined);

  return pending;
}

export const display = (size: number, weight: 700 | 900 = 900) =>
  `${weight} ${size}px ${DISPLAY}`;

export const mono = (size: number, weight: 400 | 500 = 500) =>
  `${weight} ${size}px ${MONO}`;
