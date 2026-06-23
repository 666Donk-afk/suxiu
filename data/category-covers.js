/**
 * 启程指引 - 气泡布局（比例坐标 0~1，覆盖四角）
 */
const BUBBLE_LAYOUT = {
  craft: {
    cover: '/package-media-a/images/heritage/xilan.jpg',
    sizeType: 'large',
    xRatio: 0.5,
    yRatio: 0.14,
    zIndex: 8,
    floatDelay: 0
  },
  opera: {
    cover: '/package-media-a/images/heritage/huangmei.jpg',
    sizeType: 'medium',
    xRatio: 0.22,
    yRatio: 0.13,
    zIndex: 5,
    floatDelay: 0.8
  },
  folk: {
    cover: '/package-media-a/images/heritage/baishou.jpg',
    sizeType: 'small',
    xRatio: 0.78,
    yRatio: 0.13,
    zIndex: 3,
    floatDelay: 1.4
  },
  quyi: {
    cover: '/package-media-a/images/heritage/hanju.jpg',
    sizeType: 'medium',
    xRatio: 0.88,
    yRatio: 0.3,
    zIndex: 6,
    floatDelay: 0.3
  },
  art: {
    cover: '/package-media-a/images/heritage/heritage-1.png',
    sizeType: 'small',
    xRatio: 0.1,
    yRatio: 0.28,
    zIndex: 4,
    floatDelay: 1.1
  },
  medicine: {
    cover: '/package-media-a/images/heritage/heritage-6.png',
    sizeType: 'medium',
    xRatio: 0.24,
    yRatio: 0.44,
    zIndex: 5,
    floatDelay: 0.5
  },
  sports: {
    cover: '/package-media-a/images/heritage/wudang.jpg',
    sizeType: 'large',
    xRatio: 0.5,
    yRatio: 0.34,
    zIndex: 9,
    floatDelay: 0.2
  },
  food: {
    cover: '/images/banner/banner-2.png',
    sizeType: 'medium',
    xRatio: 0.76,
    yRatio: 0.44,
    zIndex: 5,
    floatDelay: 1.6
  },
  festival: {
    cover: '/images/banner/banner-3.png',
    sizeType: 'small',
    xRatio: 0.12,
    yRatio: 0.72,
    zIndex: 3,
    floatDelay: 0.9
  },
  literature: {
    cover: '/package-media-a/images/heritage/heritage-4.png',
    sizeType: 'medium',
    xRatio: 0.36,
    yRatio: 0.62,
    zIndex: 6,
    floatDelay: 1.2
  },
  dance: {
    cover: '/package-media-a/images/heritage/baishou.jpg',
    sizeType: 'small',
    xRatio: 0.88,
    yRatio: 0.72,
    zIndex: 4,
    floatDelay: 1.8
  },
  music: {
    cover: '/package-media-a/images/heritage/hanju.jpg',
    sizeType: 'medium',
    xRatio: 0.52,
    yRatio: 0.86,
    zIndex: 7,
    floatDelay: 0.6
  }
};

function buildInterestBubbles(categories) {
  return (categories || []).map(item => {
    const meta = BUBBLE_LAYOUT[item.key] || {
      cover: '/package-media-a/images/heritage/default.png',
      sizeType: 'medium',
      xRatio: 0.5,
      yRatio: 0.5,
      zIndex: 1,
      floatDelay: 0
    };

    return {
      key: item.key,
      label: item.label,
      cover: meta.cover,
      sizeType: meta.sizeType,
      xRatio: meta.xRatio,
      yRatio: meta.yRatio,
      zIndex: meta.zIndex,
      floatDelay: meta.floatDelay
    };
  });
}

module.exports = {
  BUBBLE_LAYOUT,
  buildInterestBubbles
};
