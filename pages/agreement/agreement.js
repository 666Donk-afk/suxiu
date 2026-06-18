const { t, getLocale } = require('../../i18n.js');

const CONTENT = {
  'zh-CN': {
    user: {
      title: '用户协议',
      sections: [
        { heading: '一、服务说明', text: '「非遗寻迹」是一款帮助用户按城市探索中国非物质文化遗产的微信小程序。我们致力于以数字化方式传播中国传统文化。' },
        { heading: '二、用户行为规范', text: '您在使用本服务时应遵守法律法规，不得利用本服务从事违法违规活动，不得发布虚假、侵权或不当内容。' },
        { heading: '三、知识产权', text: '本小程序中的文字、图片、界面设计等内容的知识产权归运营方所有。未经授权，不得复制、传播或用于商业用途。' },
        { heading: '四、免责声明', text: '本小程序展示的非遗信息仅供参考，我们力求准确但不保证信息的完整性与实时性。因使用本服务产生的风险由用户自行承担。' },
        { heading: '五、协议变更', text: '我们保留修改本协议的权利。修改后的协议将在小程序内公布，继续使用即视为同意修改后的协议。' }
      ]
    },
    privacy: {
      title: '隐私政策',
      sections: [
        { heading: '一、信息收集', text: '在您授权登录时，我们会获取您的微信头像和昵称，用于个性化展示。浏览记录、收藏数据保存在您的设备本地。' },
        { heading: '二、信息使用', text: '收集的信息仅用于提供收藏同步、浏览历史、个性化推荐等功能，不会用于其他商业目的。' },
        { heading: '三、信息存储', text: '您的收藏与浏览数据通过本地存储保存在设备中，我们不会将数据上传至第三方服务器。' },
        { heading: '四、信息安全', text: '我们采取合理措施保护您的信息安全。请您妥善保管设备，避免他人未经授权访问您的账户数据。' },
        { heading: '五、您的权利', text: '您可以随时清除小程序缓存以删除本地存储的数据。如需了解更多，请通过意见反馈联系我们。' }
      ]
    }
  },
  'en-US': {
    user: {
      title: 'User Agreement',
      sections: [
        { heading: '1. Service Description', text: 'Heritage Explorer is a WeChat mini program that helps users discover China\'s intangible cultural heritage by city through digital experiences.' },
        { heading: '2. User Conduct', text: 'You must comply with applicable laws and must not use this service for illegal activities or publish false, infringing, or inappropriate content.' },
        { heading: '3. Intellectual Property', text: 'Text, images, and interface designs in this mini program are owned by the operator. Unauthorized copying or commercial use is prohibited.' },
        { heading: '4. Disclaimer', text: 'Heritage information is provided for reference only. We strive for accuracy but do not guarantee completeness or timeliness. Use is at your own risk.' },
        { heading: '5. Agreement Changes', text: 'We may update this agreement. Continued use after updates constitutes acceptance of the revised terms.' }
      ]
    },
    privacy: {
      title: 'Privacy Policy',
      sections: [
        { heading: '1. Information Collection', text: 'When you authorize login, we collect your WeChat avatar and nickname for personalization. Favorites and browsing history are stored locally on your device.' },
        { heading: '2. Information Use', text: 'Collected information is used only for favorites sync, browsing history, and personalized features — not for other commercial purposes.' },
        { heading: '3. Information Storage', text: 'Your favorites and history are stored locally on your device. We do not upload this data to third-party servers.' },
        { heading: '4. Information Security', text: 'We take reasonable measures to protect your information. Please keep your device secure to prevent unauthorized access.' },
        { heading: '5. Your Rights', text: 'You may clear the mini program cache to delete local data. Contact us via Feedback for more information.' }
      ]
    }
  }
};

Page({
  data: {
    title: '',
    sections: [],
    updateDate: ''
  },

  onLoad(options) {
    this.loadContent(options.type);
  },

  onShow() {
    this.loadContent(this._type || 'user');
  },

  loadContent(type) {
    const docType = type === 'privacy' ? 'privacy' : 'user';
    this._type = docType;
    const locale = getLocale();
    const pack = CONTENT[locale] || CONTENT['zh-CN'];
    const content = pack[docType];
    wx.setNavigationBarTitle({ title: content.title });
    this.setData({
      title: content.title,
      sections: content.sections,
      updateDate: t('agreement.updateDate')
    });
  }
});
