import { Camera, ImageUp, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif';

type Props = {
  onFile: (file: File) => void;
  error: string;
  busy: boolean;
  hasPhoto: boolean;
};

export default function PhotoDrop({ onFile, error, busy, hasPhoto }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  // Screenshot -> Cmd+V is the fastest path on desktop, so support it everywhere.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = [...(e.clipboardData?.files ?? [])].find((f) => /^image\//.test(f.type));
      if (file) onFile(file);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [onFile]);

  const pick = (input: HTMLInputElement | null) => {
    if (input) {
      // Reset first, so re-picking the same file still fires a change event.
      input.value = '';
      input.click();
    }
  };

  return (
    <div className="drop-block">
      <input
        ref={fileInput}
        className="sr-only"
        type="file"
        accept={ACCEPT}
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      <input
        ref={cameraInput}
        className="sr-only"
        type="file"
        accept="image/*"
        capture="user"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />

      <button
        type="button"
        className={`dropzone ${over ? 'is-over' : ''} ${hasPhoto ? 'is-filled' : ''}`}
        disabled={busy}
        onClick={() => pick(fileInput.current)}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) onFile(file);
        }}
      >
        {busy ? (
          <>
            <Loader2 size={26} className="spin" />
            <b>PROCESSING…</b>
            <small>CONVERTING YOUR PHOTO</small>
          </>
        ) : hasPhoto ? (
          <>
            <RefreshCw size={24} />
            <b>SWAP PHOTO</b>
            <small>DROP, PASTE OR CLICK TO REPLACE</small>
          </>
        ) : (
          <>
            <ImageUp size={30} />
            <b>UPLOAD YOUR PHOTO</b>
            <small>DROP IT HERE · PASTE · OR CLICK</small>
            <em>JPG · PNG · WEBP · HEIC FROM IPHONE</em>
          </>
        )}
      </button>

      <button type="button" className="camera" disabled={busy} onClick={() => pick(cameraInput.current)}>
        <Camera size={15} /> USE CAMERA INSTEAD
      </button>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
