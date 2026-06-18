/**
 * 生成本地占位图片（无需外部依赖）
 * 运行: node scripts/generate-images.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..', 'images');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, r, g, b) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const i = rowStart + 1 + x * 4;
      const t = x / width;
      raw[i] = Math.min(255, r + t * 30);
      raw[i + 1] = Math.min(255, g + t * 20);
      raw[i + 2] = Math.min(255, b + t * 10);
      raw[i + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const compressed = zlib.deflateSync(raw);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeImage(subdir, name, w, h, color) {
  const dir = path.join(ROOT, subdir);
  ensureDir(dir);
  const file = path.join(dir, `${name}.png`);
  fs.writeFileSync(file, createPng(w, h, color[0], color[1], color[2]));
  return `/images/${subdir}/${name}.png`;
}

const palette = {
  banner: [[160, 48, 31], [139, 40, 24], [179, 77, 46]],
  city: [[120, 60, 40], [90, 70, 50], [140, 80, 60], [100, 55, 45], [130, 65, 50]],
  heritage: [
    [160, 48, 31], [139, 58, 38], [120, 70, 50], [100, 60, 45],
    [180, 90, 50], [150, 75, 55], [130, 65, 48], [170, 85, 60]
  ],
  avatar: [[160, 48, 31]]
};

ensureDir(ROOT);

const manifest = { banners: [], cities: {}, heritages: {}, defaultHeritage: '', avatar: '' };

palette.banner.forEach((c, i) => {
  manifest.banners.push(writeImage('banner', `banner-${i + 1}`, 750, 360, c));
});

palette.city.forEach((c, i) => {
  const p = writeImage('city', `city-${i + 1}`, 400, 300, c);
  manifest.cities[`city-${i + 1}`] = p;
});

palette.heritage.forEach((c, i) => {
  const p = writeImage('heritage', `heritage-${i + 1}`, 600, 400, c);
  manifest.heritages[`heritage-${i + 1}`] = p;
});

manifest.defaultHeritage = writeImage('heritage', 'default', 600, 400, palette.heritage[0]);
manifest.avatar = writeImage('avatar', 'default', 200, 200, palette.avatar[0]);

ensureDir(path.join(__dirname, '..', 'data'));
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'images.js'),
  `/** 本地图片路径（由 scripts/generate-images.js 生成） */\nmodule.exports = ${JSON.stringify(manifest, null, 2)};\n`
);

console.log('Generated local images in /images');
console.log('Manifest written to data/images.js');
