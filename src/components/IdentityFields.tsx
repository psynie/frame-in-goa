import { Shuffle } from 'lucide-react';
import type { RenderState } from '../utils/render';

type Props = {
  state: RenderState;
  onChange: (patch: Partial<RenderState>) => void;
  /** The auto-generated title shown when the field is left empty. */
  autoTitle: string;
  onReroll: () => void;
};

export default function IdentityFields({ state, onChange, autoTitle, onReroll }: Props) {
  return (
    <div className="fields">
      <label className="field">
        <span>NAME</span>
        <input
          value={state.name}
          placeholder="Inchara Shetty"
          maxLength={26}
          autoComplete="name"
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </label>

      <label className="field">
        <span>ROLE / STACK</span>
        <input
          value={state.role}
          placeholder="Full-stack · TS + Rust"
          maxLength={30}
          onChange={(e) => onChange({ role: e.target.value })}
        />
      </label>

      <label className="field wide">
        <span>TEAM / COLLECTIVE</span>
        <input
          value={state.team}
          placeholder="Independent"
          maxLength={26}
          onChange={(e) => onChange({ team: e.target.value })}
        />
      </label>

      <label className="field wide">
        <span>
          BUILDER TITLE <em>auto-generated — edit it if you like</em>
        </span>
        <div className="with-action">
          <input
            value={state.title}
            placeholder={autoTitle}
            maxLength={34}
            onChange={(e) => onChange({ title: e.target.value })}
          />
          <button type="button" onClick={onReroll} title="Roll a new title" aria-label="Roll a new title">
            <Shuffle size={16} />
          </button>
        </div>
      </label>
    </div>
  );
}
