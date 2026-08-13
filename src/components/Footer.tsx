import { EVENT } from '../brand';

export default function Footer() {
  return (
    <footer className="site-footer">
      <b>HACKER HOUSE GOA {EVENT.year}</b>
      <span>{EVENT.place} · {EVENT.dates}</span>
      <span>
        BUILT FOR <b>{EVENT.hashtag}</b> · PHOTOS NEVER LEAVE YOUR DEVICE
      </span>
    </footer>
  );
}
