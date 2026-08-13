// X has no public API for attaching an image to a prefilled compose window, so
// the flow adapts to whatever the device can actually do:
//
//   mobile  -> native share sheet with the PNG attached, X listed as a target
//   desktop -> copy the PNG to the clipboard + open a prefilled compose window,
//              so posting is one Cmd/Ctrl+V away
//   neither -> download the PNG and open the prefilled compose window
//
// The hard constraint: browsers only allow `window.open` and `clipboard.write`
// while a user gesture is still active. Awaiting the PNG render first burns that
// activation and the popup gets blocked, so both calls are started synchronously
// and the rendered blob is handed to them as a promise.

export const CAPTION = [
  "I'm building at Hacker House Goa 2026 🌴",
  '',
  'Made my builder frame in a few seconds — grab yours:',
].join('\n');

export const HASHTAG = '#FrameInGoa';

export type ShareOutcome =
  | 'shared'
  | 'copied'
  | 'downloaded'
  | 'blocked'
  | 'cancelled';

const composeUrl = (siteUrl: string) =>
  `https://x.com/intent/post?text=${encodeURIComponent(`${CAPTION}\n${siteUrl}\n\n${HASHTAG}`)}`;

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** True when the browser can share actual image files, not just text. */
function canShareFiles(): boolean {
  try {
    const probe = new File(['probe'], 'probe.png', { type: 'image/png' });
    return Boolean(navigator.canShare?.({ files: [probe] }));
  } catch {
    return false;
  }
}

/**
 * Must be invoked synchronously from the click. Safari only permits a clipboard
 * write during a gesture, but accepts a pending promise inside ClipboardItem —
 * which is exactly how we cover the time the PNG takes to encode.
 */
function copyToClipboard(blob: Promise<Blob>): Promise<boolean> {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    return Promise.resolve(false);
  }

  const write = (item: ClipboardItem) =>
    navigator.clipboard.write([item]).then(
      () => true,
      () => false,
    );

  try {
    return write(new ClipboardItem({ 'image/png': blob })).then(async (ok) => {
      if (ok) return true;
      // Some builds reject a promise-valued ClipboardItem; retry with the
      // resolved blob. Outside the gesture this needs clipboard permission.
      try {
        return await write(new ClipboardItem({ 'image/png': await blob }));
      } catch {
        return false;
      }
    });
  } catch {
    return Promise.resolve(false);
  }
}

export async function shareToX(
  renderPng: () => Promise<Blob>,
  filename: string,
): Promise<ShareOutcome> {
  const siteUrl = window.location.origin + window.location.pathname;
  const url = composeUrl(siteUrl);

  // Mobile: the share sheet carries the image, so no popup is involved.
  if (canShareFiles()) {
    try {
      const file = new File([await renderPng()], filename, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${CAPTION}\n${siteUrl}\n\n${HASHTAG}` });
        return 'shared';
      }
    } catch (error) {
      // A dismissed share sheet is a normal outcome, not a failure to route around.
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    }
  }

  // Desktop. Everything gesture-bound happens before the first await.
  const pending = renderPng();
  const copied = copyToClipboard(pending);
  const win = window.open(url, '_blank', 'noopener,noreferrer');

  const blob = await pending;
  const didCopy = await copied;

  if (!didCopy) downloadBlob(blob, filename);
  if (!win) return 'blocked';

  return didCopy ? 'copied' : 'downloaded';
}
