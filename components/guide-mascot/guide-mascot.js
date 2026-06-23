/**
 * 首页 AI 助手悬浮虚拟角色入口
 * - 展示角色立绘
 * - 点击缩放动画
 * - 触发 navigate 事件由页面跳转聊天页
 */
Component({
  properties: {
    label: { type: String, value: 'AI导游' },
    bottom: { type: String, value: '140rpx' }
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
