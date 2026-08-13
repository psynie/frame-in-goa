import { THEMES, THEME_ORDER, type ThemeName } from '../brand';
import { RING_STYLES, type Format, type RingStyle } from '../utils/render';

type Props = {
  format: Format;
  theme: ThemeName;
  ring: RingStyle;
  onTheme: (v: ThemeName) => void;
  onRing: (v: RingStyle) => void;
};

export default function StylePicker({ format, theme, ring, onTheme, onRing }: Props) {
  return (
    <>
      {format === 'pfp' && (
        <>
          <p className="field-label">FRAME STYLE</p>
          <div className="ring-grid" role="radiogroup" aria-label="Frame style">
            {RING_STYLES.map((s) => (
              <button
                key={s.value}
                type="button"
                role="radio"
                aria-checked={ring === s.value}
                className={`ring-option ${ring === s.value ? 'is-active' : ''}`}
                onClick={() => onRing(s.value)}
              >
                <b>{s.label}</b>
                <small>{s.note}</small>
              </button>
            ))}
          </div>
        </>
      )}

      <p className="field-label">COLOURWAY</p>
      <div className="theme-grid" role="radiogroup" aria-label="Colourway">
        {THEME_ORDER.map((name) => {
          const t = THEMES[name];
          return (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={theme === name}
              className={`theme-option ${theme === name ? 'is-active' : ''}`}
              onClick={() => onTheme(name)}
            >
              <span className="swatch" aria-hidden="true">
                {t.swatch.map((c) => (
                  <i key={c} style={{ background: c }} />
                ))}
              </span>
              <b>{t.label}</b>
              <small>{t.note}</small>
            </button>
          );
        })}
      </div>
    </>
  );
}
