/**
 * 聊天消息气泡组件
 * 支持：用户文本 / AI 文本 / AI 路线卡片 / 错误提示
 */
Component({
  properties: {
    message: { type: Object, value: {} },
    durationLabel: { type: String, value: '预计时长' },
    reasonLabel: { type: String, value: '推荐理由' }
  },

  data: {
    mascotStatus: 'idle'
  },

  observers: {
    message(msg) {
      if (!msg || msg.role !== 'assistant') return;
      let status = 'idle';
      if (msg.isError) {
        status = 'error';
      } else if (msg.type === 'route') {
        status = 'happy';
      }
      this.setData({ mascotStatus: status });
    }
  }
});
