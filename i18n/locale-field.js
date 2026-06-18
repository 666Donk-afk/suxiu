const { getLocale } = require('./index.js');

function pickLocale(field, locale) {
  if (field === null || field === undefined) return '';
  if (typeof field === 'string' || typeof field === 'number') return String(field);
  const loc = locale || getLocale();
  return field[loc] || field['zh-CN'] || field[Object.keys(field)[0]] || '';
}

function localizeItem(item, fields, locale) {
  if (!item) return null;
  const result = { ...item };
  fields.forEach(f => {
    if (item[f] !== undefined) result[f] = pickLocale(item[f], locale);
  });
  return result;
}

module.exports = { pickLocale, localizeItem };
