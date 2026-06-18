/**
 * 国际化核心
 */
const zh = require('./zh-CN.js');
const en = require('./en-US.js');

const messages = {
  'zh-CN': zh,
  'en-US': en
};

const SUPPORTED = [
  { code: 'zh-CN', native: '简体中文', english: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'en-US', native: 'English', english: 'English', flag: '🇺🇸' }
];

const DEFAULT_LOCALE = 'zh-CN';
const STORAGE_KEY = 'selectedLanguage';

function getLocale() {
  try {
    return wx.getStorageSync(STORAGE_KEY) || DEFAULT_LOCALE;
  } catch (e) {
    return DEFAULT_LOCALE;
  }
}

function setLocale(locale) {
  const next = messages[locale] ? locale : DEFAULT_LOCALE;
  try {
    wx.setStorageSync(STORAGE_KEY, next);
  } catch (e) {
    console.warn('setLocale failed', e);
  }
  const app = getApp();
  if (app && app.globalData) {
    app.globalData.locale = next;
  }
  return next;
}

function t(path, locale) {
  const loc = locale || getLocale();
  const val = path.split('.').reduce((obj, key) => (obj ? obj[key] : undefined), messages[loc]);
  return val !== undefined && val !== '' ? val : path;
}

function getLangLabel(locale) {
  const loc = locale || getLocale();
  return loc === 'en-US' ? 'EN' : '中文';
}

function getSupportedLanguages() {
  return SUPPORTED;
}

function showLanguageSheet(onSelect) {
  const locale = getLocale();
  const langs = getSupportedLanguages();
  wx.showActionSheet({
    itemList: langs.map(l => {
      const mark = l.code === locale ? '✓ ' : '';
      return `${mark}${l.native}`;
    }),
    success: res => {
      const selected = langs[res.tapIndex];
      if (selected && selected.code !== locale) {
        setLocale(selected.code);
        if (onSelect) onSelect(selected.code);
      }
    }
  });
}

module.exports = {
  DEFAULT_LOCALE,
  STORAGE_KEY,
  getLocale,
  setLocale,
  t,
  getLangLabel,
  getSupportedLanguages,
  showLanguageSheet
};
