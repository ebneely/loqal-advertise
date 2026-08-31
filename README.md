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

The form posts to the Loqal API — `POST /v1/brand-applications`, the `API`
constant near the top of the page's script — and every submission becomes a
`BrandApplication` row an admin reviews in the dashboard. **WhatsApp to
`01559959890` is the fallback, not the flow**: if the request fails for any
reason, the same fields open as a pre-written WhatsApp message, so a shop
owner is never stranded. Two things must both be true in production or every
application silently takes the fallback: the `API` constant points at the
deployed backend over **https**, and that backend's `CORS_ORIGINS` includes
this page's origin.

## Decisions worth not undoing

- **Arabic is written, not translated.** The English is the mirror, not the source.
- **The wordmark stretches** on hover: LOQAAAL pulls the three A's apart and lets them recoil past the mark before settling. Now that the wordmark is Latin in both languages this is plain `letter-spacing` on a span, which the Arabic لوكال could never take — splitting a joined word into spans breaks the letter-joining and the word falls into pieces. It widens into the empty middle of the header bar, so nothing beside it moves.
- **مجانا carries no tanween.** At display size the `ً` sits over the ج and the word reads as مخانا.
- **Single light theme, painted explicitly.** The page gets printed and scanned in daylight; a viewer's dark mode was turning it into a different brand.
- **Smooth scrolling is opt-in from JS.** Left on in CSS, a script error would pin the wrapper and make the whole document unscrollable.
- **No stock photography.** Every commercially-licensed shop photo available was off-message, and one was a shuttered storefront. Replace the `.card` icons and the hang-tag block with real partner-shop photos when there are some — the cards are already shaped to take one.

## Printing

`print.html` is two A4 sheets, opened in a browser and printed with **background graphics on** at **100% scale** — without those two settings the stone ground drops to white and the millimetre sizes shift.

- **Sheet 1** is a wall poster. Its QR is 92mm, roughly 3.2mm a module, which scans from across a shop.
- **Sheet 2** cuts into **8 hand-out cards** along the dashed guides.

Both codes point at `https://join-loqaaal.vercel.app/`, which is different from the QR *inside* the site — that one opens WhatsApp. A poster on a wall should lead to the pitch; a code in a conversation should lead to the conversation.

## Layout

```
index.html          the entire site
print.html          A4 wall poster + a sheet of 8 cards
scripts/serve.mjs   dependency-free dev server
scripts/qr.mjs      regenerates the QR inside index.html
```
