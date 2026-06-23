const { buildUserContext, getWelcomeMessage, getQuickPrompts } = require('../../utils/ai-context');
const aiService = require('../../utils/ai-service');
const { isRouteIntent } = require('../../utils/ai-intent');
const { t, getLocale } = require('../../i18n.js');

const STORAGE_KEY = 'ai_guide_chat_history';
const MASCOT_RESET_MS = 2200;

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    navMascotStatus: 'idle',
    messages: [],
    inputValue: '',
    sending: false,
    scrollIntoView: '',
    quickPrompts: [],
    i18n: {},
    userContext: null
  },

  onLoad() {
    const app = getApp();
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20,
      navBarHeight: app.globalData.navBarHeight || 44
    });
    this._mascotTimer = null;
    this.refreshI18n();
    this.initChat();
  },

  onUnload() {
    if (this._mascotTimer) {
      clearTimeout(this._mascotTimer);
      this._mascotTimer = null;
    }
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
        clear: t('aiGuide.clear', locale),
        contextHint: t('aiGuide.contextHint', locale),
        errorNetwork: t('aiGuide.errorNetwork', locale),
        errorGeneric: t('aiGuide.errorGeneric', locale),
        durationLabel: t('aiGuide.durationLabel', locale),
        reasonLabel: t('aiGuide.reasonLabel', locale)
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
    if (!text || this.data.sending) return;
    this.sendMessage(text, key || '');
  },

  onSendTap() {
    const text = (this.data.inputValue || '').trim();
    if (!text || this.data.sending) return;
    this.sendMessage(text);
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
    this.setData({ messages, inputValue: '', sending: true });
    this.setNavMascotStatus('thinking');
    this.saveHistory(messages);
    this.scrollToBottom(`msg-${userMsg.id}`);

    const userContext = buildUserContext(locale);
    const useRoute = isRouteIntent(text, promptKey);

    const request = useRoute
      ? aiService.planRoute({ message: text }, userContext, locale)
      : aiService.chat(text, userContext, locale);

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
        this.setData({ messages: next, sending: false, userContext });
        this.setNavMascotStatus('happy', true);
        this.saveHistory(next);
        this.scrollToBottom(`msg-${assistantMsg.id}`);
      })
      .catch(err => {
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
      confirmColor: '#A0301F',
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
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/index/index' }) });
  }
});
