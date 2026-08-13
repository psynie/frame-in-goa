// X has no public API for attaching an image to a prefilled compose window, so
// the flow adapts to whatever the device can actually do:
//
//   mobile  -> native share sheet with the PNG attached, X listed as a target
//   desktop -> copy the PNG to the clipboard + open a prefilled compose window,
//              so posting is one Cmd/Ctrl+V away
//   neither -> download the PNG and open the prefilled compose window

export const CAPTION = [
  "I'm building at Hacker House Goa 2026 🌴",
  '',
  'Made my builder frame in a few seconds — grab yours:',
].join('\n');

export const HASHTAG = '#FrameInGoa';

export type ShareOutcome = 'shared' | 'copied' | 'downloaded' | 'cancelled';

const composeUrl = (siteUrl: string) =>
  `https://x.com/intent/post?text=${encodeURIComponent(`${CAPTION}\n${siteUrl}\n\n${HASHTAG}`)}`;

function openCompose(siteUrl: string): void {
  window.open(composeUrl(siteUrl), '_blank', 'noopener,noreferrer');
}

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

async function copyToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') return false;
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch {
    return false;
  }
}

export async function shareToX(blob: Blob, filename: string): Promise<ShareOutcome> {
  const file = new File([blob], filename, { type: 'image/png' });
  const siteUrl = window.location.origin + window.location.pathname;

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        text: `${CAPTION}\n${siteUrl}\n\n${HASHTAG}`,
      });
      return 'shared';
    } catch (error) {
      // A dismissed share sheet is a normal outcome, not a failure to route around.
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    }
  }

  if (await copyToClipboard(blob)) {
    openCompose(siteUrl);
    return 'copied';
  }

  downloadBlob(blob, filename);
  openCompose(siteUrl);
  return 'downloaded';
}
