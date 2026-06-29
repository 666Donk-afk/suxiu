/**
 * 非遗体验路线规划结果卡片
 */
Component({
  properties: {
    route: { type: Object, value: {} },
    durationLabel: { type: String, value: '预计时长' },
    reasonLabel: { type: String, value: '推荐理由' },
    stepsLabel: { type: String, value: '路线安排' }
  }
});
