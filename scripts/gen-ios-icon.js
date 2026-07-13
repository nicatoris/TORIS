// Generates the liquid-metal iOS app icon: a brushed-silver "K" on deep
// graphite, written straight into the Xcode asset catalog. Run with `node`.
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

const BG_TOP = hexToRgb("#15161B");
const BG_BOT = hexToRgb("#08090C");
const K_TOP = hexToRgb("#F4F5F8");
const K_BOT = hexToRgb("#8A8D96");

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
function png(size, draw) {
  const raw = Buffer.alloc(size * (1 + size * 4));
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = draw(x, y);
      raw[p++] = r;
      raw[p++] = g;
      raw[p++] = b;
      raw[p++] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

const S = 1024;
const stroke = S * 0.085;
const left = S * 0.37;
const top = S * 0.3;
const bot = S * 0.7;
const mid = S * 0.5;
const right = S * 0.65;

const icon = png(S, (x, y) => {
  // K strokes with a vertical silver gradient
  const dStem = distSeg(x, y, left, top, left, bot);
  const dUp = distSeg(x, y, left, mid, right, top);
  const dDown = distSeg(x, y, left, mid, right, bot);
  const d = Math.min(dStem, dUp, dDown);
  if (d <= stroke / 2) {
    let t = (y - top) / (bot - top);
    // brushed shimmer band across the middle
    const band = Math.exp(-Math.pow((t - 0.42) * 4.2, 2)) * 0.35;
    t = Math.max(0, Math.min(1, t - band));
    const r = Math.round(K_TOP[0] * (1 - t) + K_BOT[0] * t);
    const g = Math.round(K_TOP[1] * (1 - t) + K_BOT[1] * t);
    const b = Math.round(K_TOP[2] * (1 - t) + K_BOT[2] * t);
    return [r, g, b];
  }
  // graphite background with a soft radial sheen top-center
  const t = y / S;
  const sheen =
    Math.exp(-((Math.pow(x - S * 0.5, 2) + Math.pow(y - S * 0.12, 2)) / (2 * Math.pow(S * 0.42, 2)))) * 0.5;
  const r = Math.round((BG_TOP[0] * (1 - t) + BG_BOT[0] * t) * (1 + sheen));
  const g = Math.round((BG_TOP[1] * (1 - t) + BG_BOT[1] * t) * (1 + sheen));
  const b = Math.round((BG_TOP[2] * (1 - t) + BG_BOT[2] * t) * (1 + sheen));
  return [Math.min(255, r), Math.min(255, g), Math.min(255, b)];
});

const out = path.join(
  __dirname,
  "..",
  "apple",
  "KSafe",
  "Assets.xcassets",
  "AppIcon.appiconset",
  "AppIcon.png",
);
fs.writeFileSync(out, icon);
console.log("wrote", out, `${(icon.length / 1024).toFixed(1)}kb`);
