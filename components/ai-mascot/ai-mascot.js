const { getPoseSrc } = require('../../utils/ai-mascot');

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
