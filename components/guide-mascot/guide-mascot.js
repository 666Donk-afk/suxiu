/**
 * 首页 AI 助手悬浮虚拟角色入口
 */
Component({
  properties: {
    label: { type: String, value: 'AI导游' }
  },

  data: {
    tapping: false
  },

  methods: {
    onTap() {
      if (this.data.tapping) return;
      this.setData({ tapping: true });
      setTimeout(() => this.setData({ tapping: false }), 280);
      this.triggerEvent('open');
    }
  }
});
