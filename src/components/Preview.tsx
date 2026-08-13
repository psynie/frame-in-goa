import { Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ARTBOARD, render, type RenderState } from '../utils/render';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type Props = {
  state: RenderState;
  onChange: (patch: Partial<RenderState>) => void;
  ready: boolean;
};

export default function Preview({ state, onChange, ready }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ panX: number; panY: number; zoom: number; spread: number } | null>(null);
  const [active, setActive] = useState(false);

  // `ready` flips once webfonts resolve; without it the first paint uses fallbacks.
  useEffect(() => {
    if (canvasRef.current) render(canvasRef.current, state);
  }, [state, ready]);

  const interactive = Boolean(state.photo);

  const setPan = useCallback(
    (panX: number, panY: number) => onChange({ panX: clamp(panX, -1, 1), panY: clamp(panY, -1, 1) }),
    [onChange],
  );

  const setZoom = useCallback(
    (zoom: number) => onChange({ zoom: clamp(zoom, MIN_ZOOM, MAX_ZOOM) }),
    [onChange],
  );

  const spreadOf = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gesture.current = {
      panX: state.panX,
      panY: state.panY,
      zoom: state.zoom,
      spread: pointers.current.size === 2 ? spreadOf() : 0,
    };
    setActive(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive || !gesture.current || !pointers.current.has(e.pointerId)) return;

    const previous = pointers.current.get(e.pointerId)!;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Pinch: two fingers scale relative to the spread when the gesture started.
    if (pointers.current.size === 2 && gesture.current.spread > 0) {
      setZoom(gesture.current.zoom * (spreadOf() / gesture.current.spread));
      return;
    }

    // Pan: deltas are measured against the rendered size, so dragging tracks the
    // finger identically on a 320px phone and a 900px desktop preview.
    const rect = e.currentTarget.getBoundingClientRect();
    setPan(
      state.panX + ((e.clientX - previous.x) / rect.width) * 2,
      state.panY + ((e.clientY - previous.y) / rect.height) * 2,
    );
  };

  const endPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current = null;
    if (pointers.current.size === 0) setActive(false);
  };

  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    setZoom(state.zoom - e.deltaY * 0.002);
  };

  const board = ARTBOARD[state.format];

  return (
    <div className="preview">
      <div className="preview-bar">
        <span className="dot-live" aria-hidden="true" />
        <span>LIVE PREVIEW</span>
        <span className="preview-spec">
          {board.w} × {board.h} PNG
        </span>
      </div>

      <div className={`stage ${state.format}`}>
        <canvas
          ref={canvasRef}
          width={board.w}
          height={board.h}
          className={`${active ? 'is-active' : ''} ${interactive ? 'is-draggable' : ''}`}
          aria-label={`${state.format === 'card' ? 'Builder ID card' : 'Profile picture frame'} preview`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onWheel={onWheel}
        />
        {state.format === 'pfp' && (
          <p className="stage-note">
            <Maximize2 size={12} /> X CROPS AVATARS TO A CIRCLE — ALL BRANDING SITS INSIDE IT
          </p>
        )}
      </div>

      <div className="zoom" data-disabled={!interactive}>
        <span>ZOOM</span>
        <button type="button" aria-label="Zoom out" disabled={!interactive} onClick={() => setZoom(state.zoom - 0.15)}>
          <Minus size={16} />
        </button>
        <input
          type="range"
          aria-label="Photo zoom"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={state.zoom}
          disabled={!interactive}
          onChange={(e) => setZoom(Number(e.target.value))}
        />
        <button type="button" aria-label="Zoom in" disabled={!interactive} onClick={() => setZoom(state.zoom + 0.15)}>
          <Plus size={16} />
        </button>
        <button
          type="button"
          className="reset"
          disabled={!interactive}
          onClick={() => onChange({ zoom: 1, panX: 0, panY: 0 })}
        >
          <RotateCcw size={13} /> RESET
        </button>
      </div>

      <p className="hint">
        {interactive ? 'DRAG TO REPOSITION · PINCH OR SCROLL TO ZOOM' : 'UPLOAD A PHOTO TO START'}
      </p>
    </div>
  );
}
