/**
 * 将城市封面同步到主包 images/city-covers/
 * 用法: node scripts/sync-city-covers.js
 */
const fs = require('fs');
const path = require('path');

const citiesRaw = require('../data/cities-data.js');

const destDir = path.join(__dirname, '../images/city-covers');
fs.mkdirSync(destDir, { recursive: true });

const filenames = new Set();
citiesRaw.forEach(city => {
  if (!city.cover) return;
  const name = city.cover.split('/').pop();
  if (name && name !== 'default.jpg') filenames.add(name);
});

let copied = 0;
filenames.forEach(filename => {
  const src = ['package-media-a', 'package-media-b']
    .map(root => path.join(__dirname, '..', root, 'images', 'heritage', filename))
    .find(filePath => fs.existsSync(filePath));
  if (!src) {
    console.warn('missing source:', filename);
    return;
  }
  fs.copyFileSync(src, path.join(destDir, filename));
  copied += 1;
});

const defaultSrc = path.join(__dirname, '../package-media-a/images/heritage/hanju.jpg');
if (fs.existsSync(defaultSrc)) {
  fs.copyFileSync(defaultSrc, path.join(destDir, 'default.jpg'));
}

console.log(`Synced ${copied} city covers to ${destDir}`);
