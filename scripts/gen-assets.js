// Generates simple, valid PNG assets (icon, splash, favicon) with a "K" mark
// so the app has real branding without needing a design tool. Run with `node`.
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

function hexToRgb(h) {
  return [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
}

const BG = hexToRgb("#0B0F14");
const PANEL = hexToRgb("#111820");
const LEAF = hexToRgb("#34D399");
const LEAF2 = hexToRgb("#6EE7B7");

// CRC + PNG chunk plumbing
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

function png(width, height, draw) {
  // RGBA raw with filter byte per row
  const raw = Buffer.alloc(height * (1 + width * 4));
  let p = 0;
  for (let y = 0; y < height; y++) {
    raw[p++] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = draw(x, y, width, height);
      raw[p++] = r;
      raw[p++] = g;
      raw[p++] = b;
      raw[p++] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Signed distance to a thick line segment, for drawing the "K".
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

// Draw a K centered in a `size` canvas. `withPanel` rounds a darker panel.
function makeK(size, withPanel) {
  const cx = size / 2;
  const cy = size / 2;
  const s = size; // shorthand
  const stroke = s * 0.09;
  // K geometry in normalized box
  const left = s * 0.36;
  const top = s * 0.3;
  const bot = s * 0.7;
  const mid = s * 0.5;
  const right = s * 0.66;

  return (x, y) => {
    let bg = BG;
    if (withPanel) {
      // rounded panel
      const inset = s * 0.12;
      const r = s * 0.24;
      const qx = Math.max(inset, Math.min(x, s - inset)) - x;
      const qy = Math.max(inset, Math.min(y, s - inset)) - y;
      const inX = x > inset && x < s - inset;
      const inY = y > inset && y < s - inset;
      // rounded-rect via corner distance
      const cxr = Math.min(Math.max(x, inset + r), s - inset - r);
      const cyr = Math.min(Math.max(y, inset + r), s - inset - r);
      const d = Math.hypot(x - cxr, y - cyr);
      if ((inX && inY) || d <= r) bg = PANEL;
    }

    // K strokes
    const dStem = Math.abs(x - left) <= stroke / 2 && y >= top && y <= bot
      ? 0
      : distSeg(x, y, left, top, left, bot);
    const dUp = distSeg(x, y, left, mid, right, top);
    const dDown = distSeg(x, y, left, mid, right, bot);
    const d = Math.min(dStem, dUp, dDown);

    if (d <= stroke / 2) {
      // subtle vertical gradient on the K
      const t = (y - top) / (bot - top);
      const r = Math.round(LEAF2[0] * (1 - t) + LEAF[0] * t);
      const g = Math.round(LEAF2[1] * (1 - t) + LEAF[1] * t);
      const b = Math.round(LEAF2[2] * (1 - t) + LEAF[2] * t);
      return [r, g, b, 255];
    }
    return [...bg, 255];
  };
}

const outDir = path.join(__dirname, "..", "assets");
fs.mkdirSync(outDir, { recursive: true });

function write(name, buf) {
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log("wrote", name, `${(buf.length / 1024).toFixed(1)}kb`);
}

// Icon + adaptive icon: 1024 with K, no panel (fills bg)
write("icon.png", png(1024, 1024, makeK(1024, false)));
write("adaptive-icon.png", png(1024, 1024, makeK(1024, false)));
write("favicon.png", png(96, 96, makeK(96, false)));

// Splash: tall canvas, K centered
const SW = 1284;
const SH = 2778;
const kDraw = makeK(SW, false);
write(
  "splash.png",
  png(SW, SH, (x, y) => {
    // center the K vertically by offsetting y into the K's square region
    const oy = y - (SH - SW) / 2;
    if (oy >= 0 && oy < SW) return kDraw(x, oy);
    return [...BG, 255];
  }),
);
