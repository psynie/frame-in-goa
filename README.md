# HH Goa 2026 — Frame & Builder ID Generator

A web tool for **Hacker House Goa 2026**. Upload a photo, get back a branded graphic
ready to download and post on X with **#FrameInGoa**.

Everything renders on-device with the Canvas API. No backend, no account, no upload —
the photo never leaves the browser.

> Built on top of an earlier prototype by [@inchara5119](https://github.com/inchara5119)
> ([original repo](https://github.com/inchara5119/HH_Goa_2026)), which established the
> palette and the single-page studio layout.

## Both formats

**Format A — PFP Frame** (1080 × 1080)
A frame that wraps the photo for use as an X avatar. X crops avatars to a circle, so
every piece of branding sits inside the inscribed circle and the photo fills the full
square — it works as an avatar *and* as a standalone square image. Three treatments:

| Style | What it is |
| --- | --- |
| Coast Seal | thick ring with the wordmark curved along it |
| Shoreline | wave banner, palms and a sun |
| Signal | minimal double ring with arc-set event details |

**Format B — Builder ID** (1080 × 1350)
An event badge: lanyard slot, portrait panel, name, role/stack, an auto-generated
builder title, and a perforated stub carrying the team name, a barcode and the hashtag.
4:5 because that is how X crops portrait images in the timeline.

Four colourways apply to both: Palm Green, Anjuna Sunset, Arabian Sea, Night Shift.

## Handling real photos

- **HEIC from iPhone** is decoded in-browser. The decoder is ~1.35 MB, so it is loaded
  on demand and never touches the initial bundle.
- **EXIF orientation is honoured**, so portraits shot on a phone don't come out sideways.
  `createImageBitmap` is asked for `from-image` explicitly, with an `<img>` fallback.
- **Any aspect ratio** works. The photo is scaled to cover the frame, and drag / pinch /
  scroll reposition it. Pan is stored as a fraction of the available slack, so dragging
  tracks the pointer identically on a phone and a desktop.
- Photos are downscaled to a 1800px long edge on load, which keeps redraws instant.

## Sharing

X has no public API for attaching an image to a prefilled compose window, so the flow
adapts to what the device can do:

| Device | Behaviour |
| --- | --- |
| Mobile | native share sheet with the PNG attached, X as a target |
| Desktop | PNG copied to the clipboard + prefilled compose window — one paste away |
| Fallback | PNG downloaded + prefilled compose window |

The caption ships with `#FrameInGoa` already in it.

## Before deploying

Set the deployed origin in `.env` — the OG tags in `index.html` read it, and without a
correct absolute URL the link preview on X will not resolve:

```
VITE_SITE_URL=https://your-domain.example/
```

## Local development

```bash
npm install
npm run dev     # vite dev server
npm run build   # tsc -b && vite build -> dist/
npm run preview
```

## Layout

```
src/
  brand.ts              event copy + colourway tokens, shared by DOM and canvas
  utils/
    imageLoader.ts      decode, EXIF orientation, HEIC, downscale
    fonts.ts            resolves webfonts before the first canvas paint
    titles.ts           deterministic builder-title generator
    share.ts            Web Share -> clipboard -> download
    render/
      primitives.ts     text fitting, arc text, cover, grain, barcode
      motifs.ts         palm, sun, sparkle, waves — vector, theme-coloured
      pfp.ts            Format A
      card.ts           Format B
  components/           Hero, Studio and the control blocks
```

Fonts are loaded in `index.html` rather than via CSS `@import` so they resolve before
first paint — canvas silently substitutes a system font otherwise, and the export
stops matching the site.
