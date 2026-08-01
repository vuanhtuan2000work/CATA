// Generates a simple 32x32 orange cat-face tray icon (assets/icon.png)
// without any image dependencies, using a minimal PNG encoder.
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const SIZE = 32;
const pixels = Buffer.alloc(SIZE * SIZE * 4);

function setPx(x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
  const i = (y * SIZE + x) * 4;
  pixels[i] = r;
  pixels[i + 1] = g;
  pixels[i + 2] = b;
  pixels[i + 3] = a;
}

const ORANGE = [242, 166, 90];
const DARK = [43, 43, 43];

// head
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const dx = x - 16;
    const dy = y - 18;
    if (dx * dx + dy * dy <= 11 * 11) setPx(x, y, ...ORANGE, 255);
  }
}
// ears (triangles)
for (let y = 4; y <= 12; y++) {
  const half = Math.floor((y - 4) * 0.8);
  for (let x = 8 - half; x <= 8 + half; x++) setPx(x, y, ...ORANGE, 255);
  for (let x = 24 - half; x <= 24 + half; x++) setPx(x, y, ...ORANGE, 255);
}
// eyes
for (const ex of [12, 20]) {
  setPx(ex, 17, ...DARK, 255);
  setPx(ex + 1, 17, ...DARK, 255);
  setPx(ex, 18, ...DARK, 255);
  setPx(ex + 1, 18, ...DARK, 255);
}
// nose
setPx(16, 21, ...DARK, 255);
setPx(15, 21, ...DARK, 255);
setPx(17, 21, ...DARK, 255);

// encode PNG
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

let crcTable = null;
function crc32(buf) {
  if (!crcTable) {
    crcTable = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c;
    }
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return crc ^ 0xffffffff;
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // RGBA
const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1));
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE * 4 + 1)] = 0; // filter none
  pixels.copy(raw, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4);
}
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw)),
  chunk("IEND", Buffer.alloc(0)),
]);

const out = path.join(__dirname, "..", "assets", "icon.png");
fs.mkdirSync(path.dirname(out), { recursive: true });

// Keep a hand-designed logo if present (build must not overwrite it).
if (fs.existsSync(out)) {
  const existing = fs.statSync(out);
  // Generated stub is a tiny 32×32 PNG (~200 bytes); real logos are much larger.
  if (existing.size > 2048) {
    console.log("Keeping existing logo:", out, `(${existing.size} bytes)`);
    process.exit(0);
  }
}

fs.writeFileSync(out, png);
console.log("Generated tray icon:", out);
