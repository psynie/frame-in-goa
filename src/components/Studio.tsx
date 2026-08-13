import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ThemeName } from '../brand';
import { ensureFonts } from '../utils/fonts';
import { loadPhoto, PhotoError } from '../utils/imageLoader';
import { exportPng, filenameFor, type Format, type RenderState, type RingStyle } from '../utils/render';
import { downloadBlob, shareToX } from '../utils/share';
import { generateTitle } from '../utils/titles';
import ExportBar from './ExportBar';
import FormatPicker from './FormatPicker';
import IdentityFields from './IdentityFields';
import PhotoDrop from './PhotoDrop';
import Preview from './Preview';
import StylePicker from './StylePicker';

const INITIAL: RenderState = {
  format: 'pfp',
  theme: 'lime',
  ring: 'seal',
  photo: null,
  zoom: 1,
  panX: 0,
  panY: 0,
  name: '',
  role: '',
  title: '',
  team: '',
};

const OUTCOME_COPY = {
  shared: 'SHARED — KEEP #FrameInGoa IN THE POST',
  copied: 'IMAGE COPIED — PASTE IT INTO THE POST (⌘/CTRL + V)',
  downloaded: 'DOWNLOADED — ATTACH IT TO THE POST THAT JUST OPENED',
  cancelled: '',
} as const;

export default function Studio() {
  const [state, setState] = useState<RenderState>(INITIAL);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [salt, setSalt] = useState(0);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    ensureFonts().then(() => setFontsReady(true));
  }, []);

  const patch = useCallback((next: Partial<RenderState>) => {
    setState((prev) => ({ ...prev, ...next }));
  }, []);

  const autoTitle = useMemo(() => generateTitle(state.name || 'builder', salt), [state.name, salt]);

  // The renderer always receives a resolved title, so the card is never blank.
  const renderState = useMemo<RenderState>(
    () => ({ ...state, title: state.title.trim() || autoTitle }),
    [state, autoTitle],
  );

  const onFile = useCallback(
    async (file: File) => {
      setError('');
      setStatus('');
      setLoading(true);
      try {
        const photo = await loadPhoto(file);
        patch({ photo, zoom: 1, panX: 0, panY: 0 });
      } catch (e) {
        setError(
          e instanceof PhotoError
            ? e.message
            : "We couldn't process that photo. Try a different one.",
        );
      } finally {
        setLoading(false);
      }
    },
    [patch],
  );

  const onDownload = useCallback(async () => {
    setExporting(true);
    try {
      const blob = await exportPng(renderState);
      downloadBlob(blob, filenameFor(renderState));
      setStatus('SAVED TO YOUR DEVICE');
    } catch {
      setStatus('EXPORT FAILED — TRY AGAIN');
    } finally {
      setExporting(false);
    }
  }, [renderState]);

  const onShare = useCallback(async () => {
    setExporting(true);
    try {
      const blob = await exportPng(renderState);
      const outcome = await shareToX(blob, filenameFor(renderState));
      setStatus(OUTCOME_COPY[outcome]);
    } catch {
      setStatus('SHARING FAILED — DOWNLOAD AND POST MANUALLY');
    } finally {
      setExporting(false);
    }
  }, [renderState]);

  const steps = [
    {
      title: 'PICK YOUR FORMAT',
      body: <FormatPicker value={state.format} onChange={(format: Format) => patch({ format })} />,
    },
    {
      title: 'ADD YOUR PHOTO',
      body: <PhotoDrop onFile={onFile} error={error} busy={loading} hasPhoto={Boolean(state.photo)} />,
    },
    {
      title: 'STYLE IT',
      body: (
        <StylePicker
          format={state.format}
          theme={state.theme}
          ring={state.ring}
          onTheme={(theme: ThemeName) => patch({ theme })}
          onRing={(ring: RingStyle) => patch({ ring })}
        />
      ),
    },
    ...(state.format === 'card'
      ? [
          {
            title: 'YOUR DETAILS',
            body: (
              <IdentityFields
                state={state}
                onChange={patch}
                autoTitle={autoTitle}
                onReroll={() => setSalt((s) => s + 1)}
              />
            ),
          },
        ]
      : []),
    {
      title: 'DOWNLOAD & POST',
      body: (
        <ExportBar
          disabled={!state.photo}
          busy={exporting}
          status={status}
          onDownload={onDownload}
          onShare={onShare}
        />
      ),
    },
  ];

  return (
    <section id="studio" className="studio">
      <header className="studio-head">
        <p className="eyebrow">THE FRAME STUDIO</p>
        <h2>
          MAKE YOUR <i>#FrameInGoa</i>
        </h2>
        <p className="lede">
          Upload a photo, pick a format, post it. Everything renders on your device — no account,
          no upload, no waiting.
        </p>
      </header>

      <div className="studio-grid">
        <Preview state={renderState} onChange={patch} ready={fontsReady} />

        <aside className="controls">
          {steps.map((step, i) => (
            <section key={step.title} className="control-block">
              <p className="step">
                <span>{String(i + 1).padStart(2, '0')}</span> {step.title}
              </p>
              {step.body}
            </section>
          ))}
        </aside>
      </div>
    </section>
  );
}
