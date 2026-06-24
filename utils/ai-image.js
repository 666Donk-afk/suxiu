/**
 * 智能体模块 — 选图、压缩、读取 base64
 */
const MAX_BASE64_LEN = 900000;

function chooseImage() {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: res => {
        const file = res.tempFiles && res.tempFiles[0];
        if (!file || !file.tempFilePath) {
          reject(new Error('NO_FILE'));
          return;
        }
        resolve({
          path: file.tempFilePath,
          size: file.size || 0
        });
      },
      fail: err => reject(err || new Error('CANCEL'))
    });
  });
}

function readImageBase64(filePath) {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager();

    const read = path => {
      fs.readFile({
        filePath: path,
        encoding: 'base64',
        success: res => {
          const base64 = res.data || '';
          if (base64.length > MAX_BASE64_LEN) {
            reject(new Error('TOO_LARGE'));
            return;
          }
          resolve(base64);
        },
        fail: () => reject(new Error('READ_FAIL'))
      });
    };

    fs.getFileInfo({
      filePath,
      success: info => {
        if (info.size > 800000) {
          wx.compressImage({
            src: filePath,
            quality: 60,
            success: r => read(r.tempFilePath),
            fail: () => read(filePath)
          });
          return;
        }
        read(filePath);
      },
      fail: () => read(filePath)
    });
  });
}

module.exports = {
  chooseImage,
  readImageBase64,
  MAX_BASE64_LEN
};
