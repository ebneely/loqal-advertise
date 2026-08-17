/**
 * Rewrites the QR inside index.html so it points at wherever the page
 * is actually served. Run it whenever the domain changes:
 *
 *   node scripts/qr.mjs https://join.loqal.app
 *
 * With no argument it uses SITE_URL from .env.
 *
 * The QR is generated offline as an inline SVG path — no image file, no CDN,
 * nothing to break. A QR that points at a dead URL is worse than no QR, so the
 * matrix is rebuilt from the emitted path and compared before the file is
 * written.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const PAGE = 'index.html';

function targetUrl() {
  if (process.argv[2]) return process.argv[2];
  const env = Object.fromEntries(
    readFileSync('.env', 'utf8')
      .split('\n')
      .filter((l) => l.trim() && !l.trim().startsWith('#'))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      }),
  );
  const base = (env.BACKEND_DOMAIN || '').replace(/\/+$/, '');
  if (!base) {
    console.error(
      'No URL given and BACKEND_DOMAIN is empty in .env.\n' +
        'Usage: node scripts/join-qr.mjs https://your-domain/join',
    );
    process.exit(1);
  }
  return `${base}/join`;
}

const url = targetUrl();

// python's qrcode does the encoding; this script owns the SVG and the check
const py = `
import qrcode, json
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=1, border=0)
qr.add_data(${JSON.stringify(url)}); qr.make(fit=True)
print(json.dumps(qr.get_matrix()))
`;
const matrix = JSON.parse(execFileSync('python', ['-c', py], { encoding: 'utf8' }));
const n = matrix.length;

const parts = [];
for (let y = 0; y < n; y++) {
  for (let x = 0; x < n; ) {
    if (matrix[y][x]) {
      let x2 = x;
      while (x2 + 1 < n && matrix[y][x2 + 1]) x2++;
      parts.push(`M${x} ${y}h${x2 - x + 1}v1h-${x2 - x + 1}z`);
      x = x2 + 1;
    } else x++;
  }
}
const d = parts.join('');

// prove the path still describes the same matrix before shipping it
const rebuilt = Array.from({ length: n }, () => new Array(n).fill(false));
for (const [, sx, sy, w] of d.matchAll(/M(\d+) (\d+)h(\d+)v1h-\3z/g).map((m) => m)) {
  // placeholder — replaced below
}
for (const m of d.matchAll(/M(\d+) (\d+)h(\d+)v1h-\3z/g)) {
  const x = +m[1], y = +m[2], w = +m[3];
  for (let i = 0; i < w; i++) rebuilt[y][x + i] = true;
}
const same = rebuilt.every((row, y) => row.every((v, x) => v === !!matrix[y][x]));
if (!same) {
  console.error('QR path does not reproduce the matrix — refusing to write.');
  process.exit(1);
}

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" ` +
  `shape-rendering="crispEdges" role="img" aria-label="QR code to the Loqaaal join page">` +
  `<path fill="#0A0A0A" d="${d}"/></svg>`;

const html = readFileSync(PAGE, 'utf8');
const next = html.replace(
  /(<div class="qr-frame" id="qr">)[\s\S]*?(<\/div>)/,
  (_, a, b) => a + svg + b,
);
if (next === html) {
  console.error('Could not find the QR container in ' + PAGE);
  process.exit(1);
}
writeFileSync(PAGE, next);
console.log(`QR now points at ${url}  (${n}x${n} modules, matrix verified)`);
