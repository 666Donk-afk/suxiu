Component({
  properties: {
    heritage: { type: Object, value: null },
    confidence: { type: String, value: '' },
    confidenceLabel: { type: String, value: '识别置信度' },
    viewDetailLabel: { type: String, value: '查看详情' },
    locationLabel: { type: String, value: '所在地' }
  },

  methods: {
    onViewDetail() {
      const id = this.properties.heritage && this.properties.heritage.id;
      if (!id) return;
      wx.navigateTo({ url: `/package-detail/pages/heritage-detail/heritage-detail?id=${id}` });
    }
  }
});
