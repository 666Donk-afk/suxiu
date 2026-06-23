Component({
  properties: {
    item: { type: Object, value: {} },
    showFavorite: { type: Boolean, value: true },
    favorited: { type: Boolean, value: false },
    likeCount: { type: Number, value: 0 }
  },

  data: {
    favLabel: '收藏',
    favoritedLabel: '已收藏',
    expandLabel: '展开',
    collapseLabel: '收起',
    expanded: false,
    canExpand: false
  },

  observers: {
    'item.id'() {
      this.setData({ expanded: false });
      this.checkSummaryOverflow();
    },
    'item.summary'() {
      this.setData({ expanded: false });
      this.checkSummaryOverflow();
    }
  },

  attached() {
    this.refreshLabels();
    this.checkSummaryOverflow();
  },

  ready() {
    this.checkSummaryOverflow();
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
        favoritedLabel: t('heritageCard.favorited'),
        expandLabel: t('common.expand'),
        collapseLabel: t('common.collapse')
      });
    },

    checkSummaryOverflow() {
      const summary = (this.properties.item && this.properties.item.summary) || '';
      if (!summary.trim()) {
        this.setData({ canExpand: false });
        return;
      }

      wx.nextTick(() => {
        this.createSelectorQuery()
          .select('.summary-measure-full')
          .boundingClientRect()
          .select('.summary-measure-clamp')
          .boundingClientRect()
          .exec(res => {
            const full = res && res[0];
            const clamp = res && res[1];
            if (full && clamp) {
              this.setData({ canExpand: full.height > clamp.height + 2 });
              return;
            }
            this.setData({ canExpand: summary.length > 80 });
          });
      });
    },

    onToggleSummary() {
      this.setData({ expanded: !this.data.expanded });
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
