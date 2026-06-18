/** 通用工具 */

/** 列表页只传必要字段，避免 setData 过大导致卡顿/超时 */
function toHeritageListItem(h, extra = {}) {
  if (!h) return null;
  return {
    id: h.id,
    name: h.name,
    city: h.city,
    level: h.level,
    category: h.category,
    cover: h.cover,
    summary: h.summary,
    ...extra
  };
}

function formatNumber(num) {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万';
  if (num >= 1000) return num.toLocaleString();
  return String(num);
}

function fakeLikeCount(id) {
  return 3000 + (id * 617) % 8000;
}

function paginate(list, page, pageSize) {
  const start = (page - 1) * pageSize;
  return {
    list: list.slice(start, start + pageSize),
    hasMore: start + pageSize < list.length,
    total: list.length
  };
}

module.exports = {
  toHeritageListItem,
  formatNumber,
  fakeLikeCount,
  paginate
};
