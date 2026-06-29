/**
 * 聊天消息气泡组件
 * 支持：用户文本 / 用户图片 / AI 文本 / AI 路线卡片 / AI 识别卡片 / 错误提示
 */
Component({
  properties: {
    message: { type: Object, value: {} },
    durationLabel: { type: String, value: '预计时长' },
    reasonLabel: { type: String, value: '推荐理由' },
    confidenceLabel: { type: String, value: '识别置信度' },
    viewDetailLabel: { type: String, value: '查看详情' },
    locationLabel: { type: String, value: '所在地' }
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
      } else if (msg.type === 'route' || msg.type === 'recognize') {
        status = 'happy';
      }
      this.setData({ mascotStatus: status });
    }
  }
});
