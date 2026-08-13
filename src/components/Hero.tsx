import { ArrowDown } from 'lucide-react';
import { EVENT } from '../brand';

const TICKER = [
  'BUILD ON THE BEACH',
  EVENT.dates,
  'NO LOGIN · NO UPLOAD · NO WAITING',
  EVENT.hashtag,
  'RENDERED IN YOUR BROWSER',
  EVENT.place,
];

export default function Hero() {
  return (
    <header className="hero">
      <div className="hero-frame">
        <div className="topline">
          <span>{EVENT.place}</span>
          <span className="topline-mid">{EVENT.dates}</span>
          <span>{EVENT.hashtag}</span>
        </div>

        <div className="hero-copy">
          <p className="eyebrow">FRAME + ID GENERATOR</p>

          <h1>
            <span>HACKER</span>
            <span>HOUSE</span>
          </h1>

          <div className="goa-lockup">
            <span className="goa">GOA</span>
            <span className="goa-local">{EVENT.cityLocal}</span>
            <span className="goa-year">{EVENT.year}</span>
          </div>

          <p className="hero-lede">
            Turn any photo into a Hacker House Goa profile picture or builder ID — in about three
            seconds, right here in your browser.
          </p>

          <a href="#studio" className="cta">
            START BUILDING <ArrowDown size={17} />
          </a>
        </div>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <div className="ticker-run" key={copy}>
              {TICKER.map((item) => (
                <span key={item}>
                  {item}
                  <i>✦</i>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
