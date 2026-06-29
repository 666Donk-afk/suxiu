const storage = require('../../../utils/storage');
const {
  getProvinceByCode,
  getProvinceByCity
} = require('../../../data/provinces.js');
const { getCitiesByProvinceCode } = require('../../../data/province-cities.js');
const { hasProvinceMap } = require('../../../data/province-maps.js');
const { buildCityCards } = require('../../../data/city-covers.js');
const { pickLocale } = require('../../../i18n/locale-field.js');
const { getJourneyCategories } = require('../../../data/journey-categories');
const { buildInterestBubbles } = require('../../data/category-covers.js');
const {
  SoftBodyBubbleEngine,
  computeFieldMetrics
} = require('../../utils/soft-body-bubble-engine.js');
const {
  t,
  getLocale,
  setLocale,
  getSupportedLanguages
} = require('../../../i18n.js');

const TOTAL_STEPS = 4;

Page({
  data: {
    step: 1,
    totalSteps: TOTAL_STEPS,
    showContent: false,
    animating: false,

    languages: [],
    selectedLanguage: 'zh-CN',

    selectedProvince: '',
    selectedProvinceCode: '',
    activeProvinceCode: '',
    selectedCity: '',
    mapView: 'china',
    showCitySheet: false,
    sheetProvinceName: '',
    sheetCityCards: [],
    selectionSummary: null,

    categories: [],
    interestBubbles: [],
    selectedCategories: [],
    selectedCategoryMap: {},

    travelOptions: [],
    selectedTravel: '',
    preferExperience: null,
    showExperienceModal: false,

    interestCanvasW: 300,
    interestCanvasH: 360,

    i18n: {}
  },

  buildCategoryMap(keys) {
    const map = {};
    (keys || []).forEach(key => { map[key] = true; });
    return map;
  },

  buildStep3NextLabel(count, locale) {
    if (count > 0) {
      return t('journeySetup.step3.nextWithCount', locale).replace('{count}', count);
    }
    return t('journeySetup.next', locale);
  },

  buildStep3SelectedText(count, locale) {
    return t('journeySetup.step3.selectedCount', locale).replace('{count}', count);
  },

  refreshInterestBubbles(locale) {
    const categories = getJourneyCategories(locale);
    return {
      categories,
      interestBubbles: buildInterestBubbles(categories)
    };
  },

  onLoad() {
    const locale = getLocale();
    const prefs = storage.getJourneyPreferences();

    this.setData({
      languages: getSupportedLanguages(),
      selectedLanguage: locale,
      ...this.refreshInterestBubbles(locale),
      selectedProvince: prefs.selectedProvince || '',
      selectedCity: prefs.selectedCity || '',
      selectedCategories: prefs.interestedCategories || [],
      selectedCategoryMap: this.buildCategoryMap(prefs.interestedCategories || []),
      selectedTravel: prefs.travelPlan || '',
      preferExperience: prefs.preferExperience ? true : (prefs.preferExperience === false ? false : null)
    });

    this.restoreCitySelection(prefs.selectedCity, prefs.selectedProvince);
    this._interestMetrics = computeFieldMetrics(this._getWindowInfo());
    this.refreshI18n();
    setTimeout(() => this.setData({ showContent: true }), 80);
  },

  onUnload() {
    this._destroyInterestCanvas();
  },

  onReady() {
    if (this.data.step === 3) {
      this._scheduleInterestCanvasInit();
    }
  },

  _getWindowInfo() {
    if (wx.getWindowInfo) return wx.getWindowInfo();
    return wx.getSystemInfoSync();
  },

  restoreCitySelection(city, provinceName) {
    if (!city) return;
    const locale = getLocale();
    let province = provinceName
      ? getProvinceByCode(this.findProvinceCodeByName(provinceName), locale)
      : null;
    if (!province) province = getProvinceByCity(city);
    if (!province) return;

    this.setData({
      selectedProvince: province.name,
      selectedProvinceCode: province.code,
      activeProvinceCode: province.code,
      selectionSummary: this.buildSelectionSummary(province, city)
    });
  },

  findProvinceCodeByName(name) {
    const { RAW } = require('../../../data/provinces.js');
    const item = RAW.find(p => {
      const zh = p.name['zh-CN'];
      return name === zh || name.includes(zh) || zh.includes(name);
    });
    return item ? item.code : '';
  },

  refreshI18n() {
    const locale = getLocale();
    const step = this.data.step;
    const progressText = t('journeySetup.progress', locale)
      .replace('{current}', Math.min(step, TOTAL_STEPS))
      .replace('{total}', TOTAL_STEPS);

    this.setData({
      i18n: {
        skip: t('journeySetup.skip', locale),
        back: t('journeySetup.back', locale),
        next: t('journeySetup.next', locale),
        startExplore: t('journeySetup.startExplore', locale),
        progress: progressText,
        step1Title: t('journeySetup.step1.title', locale),
        step1Subtitle: t('journeySetup.step1.subtitle', locale),
        step2Title: t('journeySetup.step2.title', locale),
        step2Subtitle: t('journeySetup.step2.subtitle', locale),
        step2Search: t('journeySetup.step2.searchPlaceholder', locale),
        step2SelectedLabel: t('journeySetup.step2.selectedLabel', locale),
        step2Destination: t('journeySetup.step2.destination', locale),
        step2Province: t('journeySetup.step2.province', locale),
        step2HeritageDirections: t('journeySetup.step2.heritageDirections', locale),
        step2TapMapHint: t('journeySetup.step2.tapMapHint', locale),
        step2TapProvinceMapHint: t('journeySetup.step2.tapProvinceMapHint', locale),
        step2TapCityCardHint: t('journeySetup.step2.tapCityCardHint', locale),
        step2BackToChina: t('journeySetup.step2.backToChina', locale),
        step2PrevStep: t('journeySetup.step2.prevStep', locale),
        step3Title: t('journeySetup.step3.title', locale),
        step3Subtitle: t('journeySetup.step3.subtitle', locale),
        step3Hint: t('journeySetup.step3.hint', locale),
        step3SelectedText: this.buildStep3SelectedText(this.data.selectedCategories.length, locale),
        step3NextLabel: this.buildStep3NextLabel(this.data.selectedCategories.length, locale),
        step4Title: t('journeySetup.step4.title', locale),
        step4Subtitle: t('journeySetup.step4.subtitle', locale),
        experienceModalTitle: t('journeySetup.experienceModal.title', locale),
        experienceModalYes: t('journeySetup.experienceModal.yes', locale),
        experienceModalNo: t('journeySetup.experienceModal.no', locale),
        categoryMinToast: t('journeySetup.step3.minToast', locale),
        cityRequiredToast: t('journeySetup.step2.requiredToast', locale)
      },
      travelOptions: [
        { key: 'within_week', label: t('journeySetup.travelOptions.withinWeek', locale) },
        { key: 'within_month', label: t('journeySetup.travelOptions.withinMonth', locale) },
        { key: 'within_three_months', label: t('journeySetup.travelOptions.withinThreeMonths', locale) },
        { key: 'no_plan', label: t('journeySetup.travelOptions.noPlan', locale) }
      ],
      ...this.refreshInterestBubbles(locale)
    });
  },

  buildSelectionSummary(province, city) {
    const locale = getLocale();
    const sep = locale === 'en-US' ? ', ' : ' · ';
    return {
      city,
      province: province.name,
      heritageDirections: province.heritageDirections.join(sep)
    };
  },

  openCityPicker(code) {
    const locale = getLocale();
    const province = getProvinceByCode(code, locale);
    if (!province) return;

    const cities = getCitiesByProvinceCode(code);
    const provinceShort = pickLocale(province.name, 'zh-CN');
    this.setData({
      showCitySheet: true,
      sheetProvinceName: province.name,
      sheetCityCards: buildCityCards(cities, provinceShort)
    });
  },

  onProvinceMapChange(e) {
    const { code } = e.detail;
    this.setData({
      activeProvinceCode: code,
      selectedCity: '',
      selectionSummary: null,
      showCitySheet: false
    });

    if (hasProvinceMap(code)) {
      this.setData({ mapView: 'province' });
      return;
    }

    this.openCityPicker(code);
  },

  onProvinceCityChange(e) {
    const { city } = e.detail;
    if (city) this.applyCitySelection(city);
  },

  onBackToChinaMap() {
    this.setData({
      mapView: 'china',
      showCitySheet: false,
      activeProvinceCode: this.data.selectedProvinceCode || ''
    });
  },

  onCloseCitySheet() {
    this.setData({ showCitySheet: false });
  },

  onPickCityCard(e) {
    const { name } = e.currentTarget.dataset;
    this.applyCitySelection(name);
    this.setData({ showCitySheet: false });
  },

  applyCitySelection(cityName) {
    const locale = getLocale();
    const code = this.data.activeProvinceCode || this.data.selectedProvinceCode;
    const province = getProvinceByCode(code, locale);
    if (!province) return;

    this.setData({
      selectedCity: cityName,
      selectedProvince: province.name,
      selectedProvinceCode: province.code,
      activeProvinceCode: province.code,
      selectionSummary: this.buildSelectionSummary(province, cityName),
      showCitySheet: false
    });
  },

  onSelectLanguage(e) {
    const { code } = e.currentTarget.dataset;
    setLocale(code);
    const app = getApp();
    if (app && app.globalData) app.globalData.locale = code;
    this.setData({ selectedLanguage: code });
    this.refreshI18n();
  },

  onToggleCategory(e) {
    const key = (e && e.detail && e.detail.key) || (e && e.currentTarget && e.currentTarget.dataset.key) || e;
    if (!key || typeof key !== 'string') return;
    let selected = [...this.data.selectedCategories];
    const idx = selected.indexOf(key);
    if (idx >= 0) {
      selected.splice(idx, 1);
    } else {
      selected.push(key);
    }
    const locale = getLocale();
    this.setData({
      selectedCategories: selected,
      selectedCategoryMap: this.buildCategoryMap(selected),
      'i18n.step3SelectedText': this.buildStep3SelectedText(selected.length, locale),
      'i18n.step3NextLabel': this.buildStep3NextLabel(selected.length, locale)
    }, () => this._syncInterestEngineSelection());
  },

  _syncInterestEngineSelection() {
    if (!this._interestEngine) return;
    this._interestEngine.setSelectedMap(this.data.selectedCategoryMap);
    this._interestEngine.setPressingKey(this._interestPressingKey || '');
    this._requestInterestRedraw();
  },

  _destroyInterestCanvas() {
    if (this._interestRafId != null) {
      if (this._interestCanvas && this._interestCanvas.cancelAnimationFrame) {
        this._interestCanvas.cancelAnimationFrame(this._interestRafId);
      } else {
        clearTimeout(this._interestRafId);
      }
    }
    this._interestRafId = null;
    this._interestRunning = false;
    this._interestEngine = null;
    this._interestCtx = null;
    this._interestCanvas = null;
    this._interestCanvasReady = false;
    if (this._canvasInitTimer) {
      clearTimeout(this._canvasInitTimer);
      this._canvasInitTimer = null;
    }
  },

  _scheduleInterestCanvasInit() {
    if (this._canvasInitTimer) clearTimeout(this._canvasInitTimer);
    this._canvasInitTimer = setTimeout(() => this._initInterestCanvas(0), 320);
  },

  _initInterestCanvas(retry) {
    if (this.data.step !== 3 || this._interestCanvasReady) return;

    const metrics = this._interestMetrics || computeFieldMetrics(this._getWindowInfo());
    wx.createSelectorQuery()
      .in(this)
      .select('#interestCanvas')
      .fields({ node: true, size: true })
      .exec(res => {
        const item = res && res[0];
        if (!item || !item.node) {
          if (retry < 12) {
            this._canvasInitTimer = setTimeout(() => this._initInterestCanvas(retry + 1), 120);
          }
          return;
        }

        let cssWidth = Number(item.width);
        let cssHeight = Number(item.height);
        const win = this._getWindowInfo();
        if (!cssWidth || cssWidth < 10) cssWidth = win.windowWidth;
        if (cssWidth < win.windowWidth * 0.98) cssWidth = win.windowWidth;
        if (!cssHeight || cssHeight < 10) {
          cssHeight = Math.min(metrics.height, Math.floor(win.windowHeight * 0.42));
        }

        cssWidth = Math.floor(cssWidth);
        cssHeight = Math.floor(cssHeight);

        if ((!cssWidth || !cssHeight) && retry < 12) {
          this._canvasInitTimer = setTimeout(() => this._initInterestCanvas(retry + 1), 120);
          return;
        }

        const canvas = item.node;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (retry < 12) {
            this._canvasInitTimer = setTimeout(() => this._initInterestCanvas(retry + 1), 120);
          }
          return;
        }

        const dpr = this._getWindowInfo().pixelRatio || 2;
        canvas.width = Math.max(1, Math.floor(cssWidth * dpr));
        canvas.height = Math.max(1, Math.floor(cssHeight * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this._interestCanvas = canvas;
        this._interestCtx = ctx;
        this._interestCssW = cssWidth;
        this._interestCssH = cssHeight;
        this._interestLastTime = Date.now();
        this._interestCanvasReady = true;

        this.setData({
          interestCanvasW: Math.floor(cssWidth),
          interestCanvasH: Math.floor(cssHeight)
        });

        const bubbles = this.data.interestBubbles || [];
        if (!bubbles.length) return;

        this._interestEngine = new SoftBodyBubbleEngine({
          width: cssWidth,
          height: cssHeight,
          windowWidth: metrics.windowWidth
        });
        this._interestEngine.initFromConfigs(bubbles);
        this._interestEngine.bindCanvas(canvas, () => this._requestInterestRedraw());
        this._syncInterestEngineSelection();

        this._interestRunning = true;
        this._interestLoop(true);
      });
  },

  _interestLoop(force) {
    if (!this._interestRunning || !this._interestEngine || !this._interestCtx) return;
    if (!this._interestCssW || !this._interestCssH) return;

    const now = Date.now();
    const dt = Math.min((now - (this._interestLastTime || now)) / 1000, 0.05);
    this._interestLastTime = now;

    const needsFrame = force || this._interestEngine.step(dt) || this._interestEngine.needsRender();
    if (needsFrame) {
      const ctx = this._interestCtx;
      ctx.clearRect(0, 0, this._interestCssW, this._interestCssH);
      this._interestEngine.render(ctx);
    }

    const stillAnimating = this._interestEngine.bubbles.some(b => b.isAnimating());
    if (stillAnimating || force) {
      if (this._interestCanvas && this._interestCanvas.requestAnimationFrame) {
        this._interestRafId = this._interestCanvas.requestAnimationFrame(() => this._interestLoop(false));
      } else {
        this._interestRafId = setTimeout(() => this._interestLoop(false), 16);
      }
    } else {
      this._interestRafId = null;
    }
  },

  _requestInterestRedraw() {
    if (!this._interestEngine || !this._interestCtx) return;
    this._interestEngine._dirty = true;
    if (this._interestRafId == null && this._interestRunning) {
      this._interestLastTime = Date.now();
      this._interestLoop(true);
    }
  },

  _interestTouchPoint(e) {
    const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    if (!touch) return null;
    return { x: touch.x, y: touch.y };
  },

  onInterestCanvasTouchStart(e) {
    if (!this._interestEngine) return;
    const pt = this._interestTouchPoint(e);
    if (!pt) return;
    const key = this._interestEngine.hitTest(pt.x, pt.y);
    this._interestPressingKey = key || '';
    this._interestEngine.setPressingKey(this._interestPressingKey);
    this._requestInterestRedraw();
  },

  onInterestCanvasTouchEnd(e) {
    if (!this._interestEngine) return;
    const pt = this._interestTouchPoint(e);
    const key = pt ? this._interestEngine.hitTest(pt.x, pt.y) : this._interestPressingKey;
    this._interestPressingKey = '';
    this._interestEngine.setPressingKey('');
    this._requestInterestRedraw();
    if (key) this.onToggleCategory(key);
  },

  onSelectTravel(e) {
    const { key } = e.currentTarget.dataset;
    this.setData({ selectedTravel: key });

    if (key !== 'no_plan') {
      this.setData({ showExperienceModal: true });
    } else {
      this.setData({ preferExperience: false, showExperienceModal: false });
    }
  },

  onExperiencePrefer(e) {
    const { value } = e.currentTarget.dataset;
    this.setData({
      preferExperience: value === 'yes',
      showExperienceModal: false
    });
  },

  onCloseExperienceModal() {
    this.setData({ showExperienceModal: false });
  },

  persistCurrentStep() {
    storage.setJourneyPreferences({
      selectedProvince: this.data.selectedProvince,
      selectedCity: this.data.selectedCity,
      interestedCategories: this.data.selectedCategories,
      travelPlan: this.data.selectedTravel,
      preferExperience: this.data.preferExperience === true
    });
  },

  applySkipDefaults() {
    const defaults = {
      selectedProvince: this.data.selectedProvince || '',
      selectedCity: this.data.selectedCity || '',
      interestedCategories: this.data.selectedCategories.length
        ? this.data.selectedCategories
        : ['craft'],
      travelPlan: this.data.selectedTravel || 'no_plan',
      preferExperience: this.data.preferExperience === true
    };
    storage.setJourneyPreferences(defaults);
    this.setData({
      selectedProvince: defaults.selectedProvince,
      selectedCity: defaults.selectedCity,
      selectedCategories: defaults.interestedCategories,
      selectedCategoryMap: this.buildCategoryMap(defaults.interestedCategories),
      selectedTravel: defaults.travelPlan,
      preferExperience: defaults.preferExperience
    });
    return defaults;
  },

  finishJourneySetup() {
    this.persistCurrentStep();
    wx.redirectTo({ url: '/package-user/pages/login/login' });
  },

  goToStep(nextStep) {
    if (this.data.animating) return;
    if (this.data.step === 3) this._destroyInterestCanvas();
    this.setData({ animating: true, showContent: false, showCitySheet: false });
    setTimeout(() => {
      this.setData({ step: nextStep, animating: false });
      this.refreshI18n();
      setTimeout(() => {
        this.setData({ showContent: true });
        if (nextStep === 3) this._scheduleInterestCanvasInit();
      }, 60);
    }, 280);
  },

  onBack() {
    const { step, mapView } = this.data;
    if (step <= 1) return;
    if (step === 2 && mapView === 'province') {
      this.onBackToChinaMap();
      return;
    }
    this.goToStep(step - 1);
  },

  onSkip() {
    if (this.data.step === 3) this._destroyInterestCanvas();
    this.applySkipDefaults();
    this.finishJourneySetup();
  },

  onNext() {
    const { step, selectedCity, selectedCategories, selectedTravel } = this.data;

    if (step === 1) {
      setLocale(this.data.selectedLanguage);
      this.goToStep(2);
      return;
    }

    if (step === 2) {
      if (!selectedCity) {
        wx.showToast({ title: this.data.i18n.cityRequiredToast, icon: 'none' });
        return;
      }
      this.persistCurrentStep();
      this.goToStep(3);
      return;
    }

    if (step === 3) {
      if (selectedCategories.length < 1) {
        wx.showToast({ title: this.data.i18n.categoryMinToast, icon: 'none' });
        return;
      }
      this.persistCurrentStep();
      this.goToStep(4);
      return;
    }

    if (step === 4) {
      if (!selectedTravel) {
        this.setData({ selectedTravel: 'no_plan', preferExperience: false });
      }
      this.finishJourneySetup();
    }
  }
});
