Page({
  data: {
    pageUrl: '',
    pageTitle: '非遗影像',
    loadFailed: false
  },

  onLoad(options) {
    const url = decodeURIComponent(options.url || '');
    const title = decodeURIComponent(options.title || '非遗影像');
    if (!url) {
      wx.showToast({ title: '视频链接无效', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1200);
      return;
    }
    wx.setNavigationBarTitle({ title: title.length > 12 ? `${title.slice(0, 12)}…` : title });
    this.setData({ pageUrl: url, pageTitle: title });
  },

  onWebError() {
    this.setData({ loadFailed: true });
  },

  copyLink() {
    wx.setClipboardData({
      data: this.data.pageUrl,
      success: () => wx.showToast({ title: '链接已复制', icon: 'none' })
    });
  }
});
