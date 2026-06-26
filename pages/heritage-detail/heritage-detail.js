const { getHeritageById, getRecommendations } = require('../../data/heritages');
const { getInheritorProfilesByHeritageId } = require('../../data/inheritors');
const { getExperiencesByHeritageId } = require('../../data/experience.js');
const storage = require('../../utils/storage');
const { ensureLoggedIn } = require('../../utils/auth');
const { fakeLikeCount, toHeritageListItem } = require('../../utils/util');
const { t, getLocale } = require('../../i18n.js');

Page({
  data: {
    heritageId: null,
    heritage: null,
    favorited: false,
    expanded: false,
    recommendations: [],
    experiences: [],
    inheritors: [],
    likeCount: 0,
    statusBarHeight: 20,
    i18n: {},
    _locale: ''
  },

  onLoad(options) {
    const id = parseInt(options.id, 10);
    const app = getApp();
    this.setData({
      heritageId: id,
      statusBarHeight: app.globalData.statusBarHeight
    });
    this.refreshI18n();
    this.loadHeritage(id, true);
  },

  onShow() {
    this.refreshI18n();
    const locale = getLocale();
    if (locale !== this.data._locale && this.data.heritageId) {
      this.loadHeritage(this.data.heritageId, false);
    }
  },

  refreshI18n() {
    this.setData({
      i18n: {
        overview: t('heritageDetail.overview'),
        origin: t('heritageDetail.origin'),
        history: t('heritageDetail.history'),
    story: t('heritageDetail.story'),
    meaning: t('heritageDetail.meaning'),
    inheritorsTitle: t('heritageDetail.inheritorsTitle'),
    inheritance: t('heritageDetail.inheritance'),
        masters: t('heritageDetail.masters'),
        methods: t('heritageDetail.methods'),
        development: t('heritageDetail.development'),
        challenges: t('heritageDetail.challenges'),
        materials: t('heritageDetail.materials'),
        gallery: t('heritageDetail.gallery'),
        experience: t('heritageDetail.experience'),
        experienceSubtitle: t('heritageDetail.experienceSubtitle'),
        openTime: t('heritageDetail.openTime'),
        reservation: t('heritageDetail.reservation'),
        reservationAvailable: t('heritageDetail.reservationAvailable'),
        bookNow: t('heritageDetail.bookNow'),
        videoTitle: t('heritageDetail.videoTitle'),
        watchVideo: t('heritageDetail.watchVideo'),
        copyVideoLink: t('heritageDetail.copyVideoLink'),
        recommend: t('heritageDetail.recommend'),
        expand: t('common.expand'),
        collapse: t('common.collapse')
      }
    });
  },

  loadHeritage(id, recordHistory) {
    const locale = getLocale();
    const heritage = getHeritageById(id, locale);
    if (!heritage) {
      wx.showToast({ title: t('heritageDetail.notFound'), icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    if (recordHistory && storage.isLoggedIn()) {
      storage.addHistory({
        id: heritage.id,
        name: heritage.name,
        city: heritage.city,
        cover: heritage.cover,
        level: heritage.level
      });
    }

    const sep = locale === 'en-US' ? ', ' : '、';
    const mastersText =
      heritage.inheritance && heritage.inheritance.masters
        ? heritage.inheritance.masters.join(sep)
        : '';

    const experiences = getExperiencesByHeritageId(id, locale);
    const inheritors = getInheritorProfilesByHeritageId(id, locale);
    const recommendations = getRecommendations(heritage.recommendations || [], locale)
      .slice(0, 5)
      .map(h => toHeritageListItem(h));

    // 首屏只传必要字段，长文本分批注入，避免 setData 过大超时
    const base = {
      id: heritage.id,
      name: heritage.name,
      city: heritage.city,
      location: heritage.location,
      level: heritage.level,
      category: heritage.category,
      cover: heritage.cover,
      declareYear: heritage.declareYear,
      summary: heritage.summary,
      history: heritage.history,
      gallery: heritage.gallery,
      materials: heritage.materials || '',
      video: heritage.video || null,
      inheritance: heritage.inheritance
        ? { ...heritage.inheritance, mastersText }
        : null,
      origin: '',
      story: '',
      meaning: ''
    };

    this.setData({
      _locale: locale,
      heritage: base,
      favorited: storage.isFavorite(id),
      experiences,
      inheritors,
      recommendations,
      likeCount: fakeLikeCount(id),
      expanded: false
    });

    wx.nextTick(() => {
      this.setData({
        'heritage.origin': heritage.origin || '',
        'heritage.story': heritage.story || '',
        'heritage.meaning': heritage.meaning || ''
      });
    });
  },

  goBack() {
    wx.navigateBack();
  },

  toggleFavorite() {
    if (!ensureLoggedIn({ content: t('heritageDetail.loginForFavorite') })) return;
    const { heritage } = this.data;
    const favorited = storage.toggleFavorite(heritage.id);
    this.setData({ favorited });
    wx.showToast({
      title: favorited ? t('heritageDetail.favorited') : t('heritageDetail.unfavorited'),
      icon: 'none'
    });
  },

  toggleExpand() {
    this.setData({ expanded: !this.data.expanded });
  },

  playVideo() {
    const video = this.data.heritage && this.data.heritage.video;
    if (!video || !video.url) return;
    wx.navigateTo({
      url: `/pages/heritage-video/heritage-video?url=${encodeURIComponent(video.url)}&title=${encodeURIComponent(video.title || this.data.heritage.name)}`
    });
  },

  copyVideoLink() {
    const video = this.data.heritage && this.data.heritage.video;
    if (!video || !video.url) return;
    wx.setClipboardData({
      data: video.url,
      success: () => wx.showToast({ title: t('heritageDetail.linkCopied'), icon: 'none' })
    });
  },

  previewImage(e) {
    const { url } = e.currentTarget.dataset;
    const urls = this.data.heritage.gallery || [url];
    wx.previewImage({ current: url, urls });
  },

  goExperience(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/experience-guide/experience-guide?id=${id}` });
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.redirectTo({ url: `/pages/heritage-detail/heritage-detail?id=${id}` });
  },

  onShareAppMessage() {
    const { heritage } = this.data;
    return {
      title: `${heritage.name} · ${heritage.city}`,
      path: `/pages/heritage-detail/heritage-detail?id=${heritage.id}`,
      imageUrl: heritage.cover
    };
  }
});
