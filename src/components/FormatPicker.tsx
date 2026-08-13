import { IdCard, UserRound } from 'lucide-react';
import type { Format } from '../utils/render';

const FORMATS: { value: Format; label: string; note: string; spec: string; Icon: typeof IdCard }[] = [
  { value: 'pfp', label: 'PFP FRAME', note: 'Your face, framed', spec: '1080 × 1080', Icon: UserRound },
  { value: 'card', label: 'BUILDER ID', note: 'Event badge card', spec: '1080 × 1350', Icon: IdCard },
];

export default function FormatPicker({
  value,
  onChange,
}: {
  value: Format;
  onChange: (v: Format) => void;
}) {
  return (
    <div className="format-grid" role="radiogroup" aria-label="Output format">
      {FORMATS.map(({ value: v, label, note, spec, Icon }) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          className={`format ${value === v ? 'is-active' : ''}`}
          onClick={() => onChange(v)}
        >
          <Icon size={26} />
          <b>{label}</b>
          <small>{note}</small>
          <em>{spec}</em>
        </button>
      ))}
    </div>
  );
}
