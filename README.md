# Loqaaal — join page

The page a shop owner lands on after scanning the QR on a printed card. Arabic first, English on a toggle. One self-contained `index.html`: fonts, styles, script and the QR are all embedded, so it can be dropped on any static host, opened from a USB stick, or served from the API — nothing external to fetch and nothing to break.

```bash
npm run dev          # http://127.0.0.1:4321
npm run qr -- https://join.loqal.app   # re-point the QR at the real domain
```

## Before printing anything

The QR currently encodes **https://join.loqal.app**. It is baked into the file, so it must be regenerated whenever the domain changes:

```bash
npm run qr -- https://your-real-domain
```

The script rebuilds the matrix from the SVG path it just wrote and refuses to save unless the two agree. A QR pointing at a dead URL is worse than no QR.

## What the page does

The form does not post anywhere. It opens **WhatsApp** to `01559959890` with every field already written out as a message — an Egyptian shop owner already lives in WhatsApp, and it means no server, no database and no spam to moderate. If a browser blocks the popup, the message appears in a pre-selected textarea instead of a button that silently did nothing.

## Decisions worth not undoing

- **Arabic is written, not translated.** The English is the mirror, not the source.
- **The wordmark stretches** on hover: لوكـــال pulls out to لوكــــــــــال. It animates the character *count*, because splitting the word into spans to scale one breaks Arabic letter-joining and the word falls into pieces.
- **مجانا carries no tanween.** At display size the `ً` sits over the ج and the word reads as مخانا.
- **Single light theme, painted explicitly.** The page gets printed and scanned in daylight; a viewer's dark mode was turning it into a different brand.
- **Smooth scrolling is opt-in from JS.** Left on in CSS, a script error would pin the wrapper and make the whole document unscrollable.
- **No stock photography.** Every commercially-licensed shop photo available was off-message, and one was a shuttered storefront. Replace the `.card` icons and the hang-tag block with real partner-shop photos when there are some — the cards are already shaped to take one.

## Layout

```
index.html          the entire site
scripts/serve.mjs   dependency-free dev server
scripts/qr.mjs      regenerates the embedded QR
```
