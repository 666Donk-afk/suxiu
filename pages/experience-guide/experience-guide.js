const { getExperienceById } = require('../../data/experience.js');
const { getHeritageById } = require('../../data/heritages.js');
const storage = require('../../utils/storage');
const { t, getLocale } = require('../../i18n.js');

Page({
  data: {
    experience: null,
    heritageId: null,
    canOpenWeixinArticle: false,
    i18n: {}
  },

  onLoad(options) {
    const id = parseInt(options.id, 10);
    this.loadExperience(id);
  },

  onShow() {
    this.refreshI18n();
    if (this.data.experience) {
      wx.setNavigationBarTitle({ title: t('experience.guideTitle') });
    }
  },

  refreshI18n() {
    this.setData({
      i18n: {
        guideDesc: t('experience.guideDesc'),
        qrHint: t('experience.qrHint'),
        miniLabel: t('experience.miniLabel'),
        miniHint: t('experience.miniHint'),
        websiteHint: t('experience.websiteHint'),
        noticeTitle: t('experience.noticeTitle'),
        copyInfo: t('experience.copyInfo'),
        backDetail: t('experience.backDetail'),
        openTime: t('experience.openTime'),
        previewQr: t('experience.previewQr'),
        copyLink: t('experience.copyLink'),
        openArticle: t('experience.openArticle')
      }
    });
  },

  loadExperience(id) {
    const locale = getLocale();
    const experience = getExperienceById(id, locale);
    if (!experience) {
      wx.showToast({ title: t('common.notFound'), icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    const heritage = getHeritageById(experience.heritageId, locale);
    storage.addExperienceHistory(experience, heritage ? heritage.name : '');

    wx.setNavigationBarTitle({ title: t('experience.guideTitle') });
    const canOpenWeixinArticle = /mp\.weixin\.qq\.com\/s\//.test(experience.qrTargetUrl || '');
    this.setData({
      experience,
      heritageId: experience.heritageId,
      canOpenWeixinArticle
    });
    this.refreshI18n();
  },

  previewQr() {
    const { experience } = this.data;
    if (!experience || !experience.qrCode) return;
    wx.previewImage({
      current: experience.qrCode,
      urls: [experience.qrCode]
    });
  },

  onCopy() {
    const { experience } = this.data;
    if (!experience) return;

    let text = `${experience.title}\n${experience.location}\n${t('experience.openTime')}：${experience.openTime}\n`;

    if (experience.reservationType === 'mini' && experience.officialMiniProgram) {
      text += `${t('experience.miniLabel')}：${experience.officialMiniProgram}\n${t('experience.miniHint')}`;
    } else if (experience.reservationType === 'website' && experience.officialWebsite) {
      text += `${experience.officialWebsite}\n${t('experience.websiteHint')}`;
      wx.setClipboardData({
        data: experience.officialWebsite,
        success: () => wx.showToast({ title: t('experience.copied'), icon: 'none' })
      });
      return;
    } else if (experience.reservationType === 'qr' && experience.qrTargetUrl) {
      text += `${experience.officialMiniProgram || experience.officialWebsite || ''}\n${experience.qrTargetUrl}\n${t('experience.qrHint')}`;
      wx.setClipboardData({
        data: experience.qrTargetUrl,
        success: () => wx.showToast({ title: t('experience.copied'), icon: 'none' })
      });
      return;
    } else {
      text += `${t('experience.qrHint')}\n${experience.notice}`;
    }

    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: t('experience.copied'), icon: 'none' })
    });
  },

  onCopyMini() {
    const { experience } = this.data;
    if (!experience || !experience.officialMiniProgram) return;
    wx.setClipboardData({
      data: experience.officialMiniProgram,
      success: () => wx.showToast({ title: t('experience.copied'), icon: 'none' })
    });
  },

  onCopyWebsite() {
    const { experience } = this.data;
    if (!experience || !experience.officialWebsite) return;
    wx.setClipboardData({
      data: experience.officialWebsite,
      success: () => {
        wx.showToast({ title: t('experience.websiteHint'), icon: 'none', duration: 2500 });
      }
    });
  },

  onCopyQrUrl() {
    const { experience } = this.data;
    if (!experience || !experience.qrTargetUrl) return;
    wx.setClipboardData({
      data: experience.qrTargetUrl,
      success: () => wx.showToast({ title: t('experience.copied'), icon: 'none' })
    });
  },

  openWeixinArticle() {
    const { experience } = this.data;
    const url = experience && experience.qrTargetUrl;
    if (!url || !/mp\.weixin\.qq\.com\/s\//.test(url)) return;
    if (typeof wx.openOfficialAccountArticle === 'function') {
      wx.openOfficialAccountArticle({
        url,
        fail: () => {
          wx.setClipboardData({
            data: url,
            success: () => wx.showToast({ title: t('experience.copied'), icon: 'none' })
          });
        }
      });
      return;
    }
    wx.setClipboardData({
      data: url,
      success: () => wx.showToast({ title: t('experience.copied'), icon: 'none' })
    });
  },

  goBack() {
    wx.navigateBack();
  }
});
