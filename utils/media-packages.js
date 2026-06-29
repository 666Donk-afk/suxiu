/**
 * 预加载图片分包 mediaA / mediaB（合计约 4.16MB，无法同时写入 preloadRule）
 */
let mediaAPromise = null;
let mediaBPromise = null;
let mediaAReady = false;
let mediaBReady = false;

function loadSubpackage(name) {
  return new Promise(resolve => {
    if (!wx.loadSubpackage) {
      resolve(false);
      return;
    }
    wx.loadSubpackage({
      name,
      success: () => resolve(true),
      fail: err => {
        console.warn('[media-packages] load failed:', name, err);
        resolve(false);
      }
    });
  });
}

function ensureMediaA() {
  if (mediaAReady) return Promise.resolve(true);
  if (!mediaAPromise) {
    mediaAPromise = loadSubpackage('mediaA').then(ok => {
      mediaAReady = ok;
      return ok;
    });
  }
  return mediaAPromise;
}

function ensureMediaB() {
  if (mediaBReady) return Promise.resolve(true);
  if (!mediaBPromise) {
    mediaBPromise = ensureMediaA()
      .then(() => loadSubpackage('mediaB'))
      .then(ok => {
        mediaBReady = ok;
        return ok;
      });
  }
  return mediaBPromise;
}

function ensureAllMedia() {
  return ensureMediaB();
}

function isAllMediaReady() {
  return mediaAReady && mediaBReady;
}

module.exports = {
  ensureMediaA,
  ensureMediaB,
  ensureAllMedia,
  isAllMediaReady
};
