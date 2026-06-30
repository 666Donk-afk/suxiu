const { buildUserContext, getWelcomeMessage, getQuickPrompts } = require('../../utils/ai-context');

const aiService = require('../../utils/ai-service');

const { isRouteIntent, isStoryIntent } = require('../../utils/ai-intent');
const { chooseImage, readImageBase64 } = require('../../utils/ai-image');
const { t, getLocale } = require('../../../i18n.js');



const STORAGE_KEY = 'ai_guide_chat_history';

const MASCOT_RESET_MS = 2200;

function getHeaderPaddingRight() {
  try {
    const windowInfo = wx.getWindowInfo();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    return Math.max(16, windowInfo.windowWidth - menuButton.left + 8);
  } catch (e) {
    return 96;
  }
}



Page({

  data: {

    statusBarHeight: 20,

    navBarHeight: 44,
    headerPaddingRight: 96,

    navMascotStatus: 'idle',

    messages: [],

    inputValue: '',

    sending: false,

    recognizing: false,

    pendingImage: null,

    scrollIntoView: '',

    quickPrompts: [],

    i18n: {},

    userContext: null

  },



  onLoad() {

    const app = getApp();

    this.setData({

      statusBarHeight: app.globalData.statusBarHeight || 20,

      navBarHeight: app.globalData.navBarHeight || 44,

      headerPaddingRight: getHeaderPaddingRight()

    });

    this._mascotTimer = null;

    this._destroyed = false;

    this._navLock = false;

    this.refreshI18n();

    this.initChat();

  },



  onUnload() {

    this._destroyed = true;

    if (this._mascotTimer) {

      clearTimeout(this._mascotTimer);

      this._mascotTimer = null;

    }

  },



  safeSetData(patch, cb) {

    if (this._destroyed) return;

    this.setData(patch, cb);

  },



  setNavMascotStatus(status, resetToIdle) {

    if (this._mascotTimer) {

      clearTimeout(this._mascotTimer);

      this._mascotTimer = null;

    }

    this.setData({ navMascotStatus: status });

    if (resetToIdle && status !== 'idle') {

      this._mascotTimer = setTimeout(() => {

        this.setData({ navMascotStatus: 'idle' });

        this._mascotTimer = null;

      }, MASCOT_RESET_MS);

    }

  },



  onShow() {
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#F5DCC0'
    });
    this.refreshI18n();
  },



  refreshI18n() {

    const locale = getLocale();

    wx.setNavigationBarTitle({ title: t('aiGuide.title', locale) });

    this.setData({

      i18n: {

        title: t('aiGuide.title', locale),

        subtitle: t('aiGuide.subtitle', locale),

        inputPlaceholder: t('aiGuide.inputPlaceholder', locale),

        send: t('aiGuide.send', locale),

        thinking: t('aiGuide.thinking', locale),

        recognizing: t('aiGuide.recognizing', locale),

        camera: t('aiGuide.camera', locale),

        clear: t('aiGuide.clear', locale),

        contextHint: t('aiGuide.contextHint', locale),

        errorNetwork: t('aiGuide.errorNetwork', locale),

        errorGeneric: t('aiGuide.errorGeneric', locale),

        durationLabel: t('aiGuide.durationLabel', locale),

        reasonLabel: t('aiGuide.reasonLabel', locale),

        confidenceLabel: t('aiGuide.confidenceLabel', locale),

        viewDetail: t('aiGuide.viewDetail', locale),

        locationLabel: t('aiGuide.locationLabel', locale),

        imageCaption: t('aiGuide.imageCaption', locale),

        imageReadError: t('aiGuide.imageReadError', locale),

        imageTooLarge: t('aiGuide.imageTooLarge', locale),

        recognizeFail: t('aiGuide.recognizeFail', locale),

        photoActionRecognize: t('aiGuide.photoActionRecognize', locale),

        photoActionUpload: t('aiGuide.photoActionUpload', locale),

        photoUploadHint: t('aiGuide.photoUploadHint', locale),

        photoUploadDefault: t('aiGuide.photoUploadDefault', locale),

        removePhoto: t('aiGuide.removePhoto', locale)

      },

      quickPrompts: getQuickPrompts(locale)

    });

  },



  initChat() {

    const locale = getLocale();

    const userContext = buildUserContext(locale);

    let messages = this.loadHistory();



    if (!messages.length) {

      messages = [{

        id: 'welcome',

        role: 'assistant',

        type: 'text',

        content: getWelcomeMessage(locale)

      }];

    }



    this.setData({ messages, userContext });

    this.scrollToBottom();

  },



  loadHistory() {

    try {

      const raw = wx.getStorageSync(STORAGE_KEY);

      return Array.isArray(raw) ? raw : [];

    } catch (e) {

      return [];

    }

  },



  saveHistory(messages) {

    const trimmed = messages

      .filter(m => m.role === 'user' || m.role === 'assistant')

      .slice(-20)

      .map(m => ({

        id: m.id,

        role: m.role,

        type: m.type || 'text',

        content: m.content || '',

        route: m.route || null,

        heritage: m.heritage || null,

        confidence: m.confidence || '',

        isError: !!m.isError

      }));

    try {

      wx.setStorageSync(STORAGE_KEY, trimmed);

    } catch (e) {

      console.warn('save chat history failed', e);

    }

  },



  onInput(e) {

    this.setData({ inputValue: e.detail.value });

  },



  onQuickPrompt(e) {

    const { text, key } = e.currentTarget.dataset;

    if (this.data.sending) return;

    if (key === 'recognize') {

      this.onPickImage();

      return;

    }

    if (!text) return;

    this.sendMessage(text, key || '');

  },



  onSendTap() {

    const text = (this.data.inputValue || '').trim();

    if (this.data.sending) return;

    if (this.data.pendingImage) {

      this.sendMessageWithImage(text);

      return;

    }

    if (!text) return;

    this.sendMessage(text);

  },



  onPickImage() {

    if (this.data.sending || this._navLock) return;

    const locale = getLocale();

    wx.showActionSheet({

      itemList: [

        t('aiGuide.photoActionRecognize', locale),

        t('aiGuide.photoActionUpload', locale)

      ],

      success: res => {

        if (res.tapIndex === 0) this.pickImageForRecognize();

        else if (res.tapIndex === 1) this.pickImageForUpload();

      }

    });

  },



  pickImageForRecognize() {

    chooseImage()

      .then(file => readImageBase64(file.path).then(base64 => ({ path: file.path, base64 })))

      .then(({ path, base64 }) => this.sendRecognize(path, base64))

      .catch(err => this.handleImagePickError(err));

  },



  pickImageForUpload() {

    chooseImage()

      .then(file => readImageBase64(file.path).then(base64 => ({ path: file.path, base64 })))

      .then(({ path, base64 }) => {

        this.setData({ pendingImage: { path, base64 } });

      })

      .catch(err => this.handleImagePickError(err));

  },



  onRemovePendingImage() {

    this.setData({ pendingImage: null });

  },



  handleImagePickError(err) {

    if (!err || err.errMsg && String(err.errMsg).includes('cancel')) return;

    if (err.message === 'TOO_LARGE') {

      wx.showToast({ title: this.data.i18n.imageTooLarge, icon: 'none' });

      return;

    }

    wx.showToast({ title: this.data.i18n.imageReadError, icon: 'none' });

  },



  sendMessageWithImage(text) {

    const locale = getLocale();

    const pending = this.data.pendingImage;

    if (!pending || !pending.base64) return;

    const caption = (text || '').trim() || t('aiGuide.photoUploadDefault', locale);

    const userMsg = {

      id: `u_${Date.now()}`,

      role: 'user',

      type: 'image',

      imageUrl: pending.path,

      content: caption

    };

    const messages = [...this.data.messages, userMsg];

    this.setData({

      messages,

      inputValue: '',

      pendingImage: null,

      sending: true,

      recognizing: false

    });

    this.setNavMascotStatus('thinking');

    this.saveHistory(messages);

    this.scrollToBottom(`msg-${userMsg.id}`);

    const userContext = buildUserContext(locale);

    aiService.chat(caption, userContext, locale, {

      imageBase64: pending.base64,

      mimeType: 'image/jpeg'

    })

      .then(result => {

        const assistantMsg = {

          id: `a_${Date.now()}`,

          role: 'assistant',

          type: 'text',

          content: result.reply || result.content || ''

        };

        const next = [...this.data.messages, assistantMsg];

        this.setData({ messages: next, sending: false, userContext });

        this.setNavMascotStatus('happy', true);

        this.saveHistory(next);

        this.scrollToBottom(`msg-${assistantMsg.id}`);

      })

      .catch(err => {

        if (this._destroyed) return;

        const isNetwork = err.code === 'NETWORK_ERROR';

        const errMsg = {

          id: `e_${Date.now()}`,

          role: 'assistant',

          type: 'text',

          content: isNetwork ? this.data.i18n.errorNetwork : (err.message || this.data.i18n.errorGeneric),

          isError: true

        };

        const next = [...this.data.messages, errMsg];

        this.setData({ messages: next, sending: false });

        this.setNavMascotStatus('error', true);

        this.scrollToBottom(`msg-${errMsg.id}`);

      });

  },



  sendRecognize(imagePath, imageBase64) {

    const locale = getLocale();

    const userMsg = {

      id: `u_${Date.now()}`,

      role: 'user',

      type: 'image',

      imageUrl: imagePath,

      content: t('aiGuide.imageCaption', locale)

    };

    const messages = [...this.data.messages, userMsg];

    this.setData({ messages, sending: true, recognizing: true });

    this.setNavMascotStatus('thinking');

    this.saveHistory(messages);

    this.scrollToBottom(`msg-${userMsg.id}`);



    const userContext = buildUserContext(locale);



    aiService.recognize(imageBase64, 'image/jpeg', userContext, locale)

      .then(result => {

        if (this._destroyed) return;

        const heritage = result.heritage || null;

        const hasMatch = heritage && heritage.name && heritage.id;

        const assistantMsg = {

          id: `a_${Date.now()}`,

          role: 'assistant',

          type: 'recognize',

          heritage,

          confidence: result.confidence || (heritage && heritage.confidence) || '',

          content: result.reply || (hasMatch ? '' : this.data.i18n.recognizeFail)

        };

        const next = [...this.data.messages, assistantMsg];

        this.setData({ messages: next, sending: false, recognizing: false, userContext });

        this.setNavMascotStatus(hasMatch ? 'happy' : 'idle', hasMatch);

        this.saveHistory(next);

        this.scrollToBottom(`msg-${assistantMsg.id}`);

      })

      .catch(err => {

        if (this._destroyed) return;

        const isNetwork = err.code === 'NETWORK_ERROR';

        const errMsg = {

          id: `e_${Date.now()}`,

          role: 'assistant',

          type: 'text',

          content: isNetwork ? this.data.i18n.errorNetwork : (err.message || this.data.i18n.errorGeneric),

          isError: true

        };

        const next = [...this.data.messages, errMsg];

        this.setData({ messages: next, sending: false, recognizing: false });

        this.setNavMascotStatus('error', true);

        this.scrollToBottom(`msg-${errMsg.id}`);

      });

  },



  sendMessage(text, promptKey) {

    const locale = getLocale();

    const userMsg = {

      id: `u_${Date.now()}`,

      role: 'user',

      type: 'text',

      content: text

    };

    const messages = [...this.data.messages, userMsg];

    this.setData({ messages, inputValue: '', sending: true, recognizing: false });

    this.setNavMascotStatus('thinking');

    this.saveHistory(messages);

    this.scrollToBottom(`msg-${userMsg.id}`);



    const userContext = buildUserContext(locale);

    const useRoute = isRouteIntent(text, promptKey);
    const useStory = !useRoute && isStoryIntent(text, promptKey);

    const request = useRoute
      ? aiService.planRoute({ message: text }, userContext, locale)
      : aiService.chat(text, userContext, locale, useStory ? { intent: 'story' } : undefined);



    request

      .then(result => {

        let assistantMsg;

        if (useRoute && result.route) {

          assistantMsg = {

            id: `a_${Date.now()}`,

            role: 'assistant',

            type: 'route',

            route: result.route,

            content: ''

          };

        } else {

          assistantMsg = {

            id: `a_${Date.now()}`,

            role: 'assistant',

            type: 'text',

            content: result.reply || result.content || ''

          };

        }

        const next = [...this.data.messages, assistantMsg];

        this.setData({ messages: next, sending: false, recognizing: false, userContext });

        this.setNavMascotStatus('happy', true);

        this.saveHistory(next);

        this.scrollToBottom(`msg-${assistantMsg.id}`);

      })

      .catch(err => {

        if (this._destroyed) return;

        const isNetwork = err.code === 'NETWORK_ERROR';

        const errMsg = {

          id: `e_${Date.now()}`,

          role: 'assistant',

          type: 'text',

          content: isNetwork ? this.data.i18n.errorNetwork : (err.message || this.data.i18n.errorGeneric),

          isError: true

        };

        const next = [...this.data.messages, errMsg];

        this.setData({ messages: next, sending: false, recognizing: false });

        this.setNavMascotStatus('error', true);

        this.scrollToBottom(`msg-${errMsg.id}`);

      });

  },



  scrollToBottom(id) {

    wx.nextTick(() => {

      this.setData({ scrollIntoView: id || 'chat-bottom' });

    });

  },



  onClearChat() {

    const locale = getLocale();

    wx.showModal({

      title: t('aiGuide.clearConfirmTitle', locale),

      content: t('aiGuide.clearConfirmContent', locale),

      confirmColor: '#9E2B25',

      success: res => {

        if (!res.confirm) return;

        try {

          wx.removeStorageSync(STORAGE_KEY);

        } catch (e) { /* ignore */ }

        this.setData({

          messages: [{

            id: 'welcome',

            role: 'assistant',

            type: 'text',

            content: getWelcomeMessage(locale)

          }]

        });

      }

    });

  },



  goBack() {

    if (this._navLock) return;

    this._navLock = true;

    const pages = getCurrentPages();

    const done = () => {

      setTimeout(() => { this._navLock = false; }, 400);

    };

    if (pages.length > 1) {

      wx.navigateBack({ delta: 1, complete: done });

      return;

    }

    wx.switchTab({ url: '/pages/index/index', complete: done });

  }

});

