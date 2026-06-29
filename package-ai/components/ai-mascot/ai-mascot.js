const { getPoseSrc } = require('../../utils/ai-mascot');

/**
 * 动态 AI 形象组件
 * status: idle | thinking | happy | error | speaking
 * size: sm | md | lg
 */
Component({
  properties: {
    status: { type: String, value: 'idle' },
    size: { type: String, value: 'md' },
    animated: { type: Boolean, value: true },
    ring: { type: Boolean, value: false }
  },

  data: {
    src: getPoseSrc('idle')
  },

  observers: {
    status(next) {
      this.setData({ src: getPoseSrc(next) });
    }
  },

  lifetimes: {
    attached() {
      this.setData({ src: getPoseSrc(this.properties.status) });
    }
  }
});
