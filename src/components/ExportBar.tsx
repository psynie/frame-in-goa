import { Download, Loader2 } from 'lucide-react';

type Props = {
  disabled: boolean;
  busy: boolean;
  status: string;
  onDownload: () => void;
  onShare: () => void;
};

export default function ExportBar({ disabled, busy, status, onDownload, onShare }: Props) {
  return (
    <div className="export">
      <div className="export-actions">
        <button type="button" className="btn ghost" disabled={disabled || busy} onClick={onDownload}>
          <Download size={17} /> DOWNLOAD PNG
        </button>
        <button type="button" className="btn solid" disabled={disabled || busy} onClick={onShare}>
          {busy ? <Loader2 size={17} className="spin" /> : <XLogo />} POST ON X
        </button>
      </div>

      <p className="export-status" role="status">
        {status || (
          <>
            POSTS MUST INCLUDE <b>#FrameInGoa</b> — IT IS ALREADY IN THE CAPTION
          </>
        )}
      </p>
    </div>
  );
}

function XLogo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-7.2 8.3L23.3 22h-6.6l-5.2-6.8L5.5 22H2.4l7.7-8.9L1 2h6.8l4.7 6.2L18.9 2Zm-1.1 18h1.7L7.3 3.7H5.5L17.8 20Z" />
    </svg>
  );
}
