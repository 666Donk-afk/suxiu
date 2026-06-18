Component({
  properties: {
    item: { type: Object, value: {} },
    showFavorite: { type: Boolean, value: true },
    favorited: { type: Boolean, value: false },
    likeCount: { type: Number, value: 0 }
  },

  data: {
    favLabel: '收藏',
    favoritedLabel: '已收藏'
  },

  attached() {
    this.refreshLabels();
  },

  pageLifetimes: {
    show() {
      this.refreshLabels();
    }
  },

  methods: {
    refreshLabels() {
      const { t } = require('../../i18n.js');
      this.setData({
        favLabel: t('heritageCard.favorite'),
        favoritedLabel: t('heritageCard.favorited')
      });
    },

    onTap() {
      const { id } = this.data.item;
      if (id) {
        wx.navigateTo({ url: `/pages/heritage-detail/heritage-detail?id=${id}` });
      }
    },

    onFavorite() {
      const { id } = this.data.item;
      if (!id) return;
      this.triggerEvent('favorite', { id });
    }
  }
});
