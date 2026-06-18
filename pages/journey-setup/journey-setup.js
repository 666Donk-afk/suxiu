const storage = require('../../utils/storage');
const { getJourneyHotCities, searchJourneyCities } = require('../../data/journey-cities');
const { getJourneyCategories } = require('../../data/journey-categories');
const { getTravelPlanLabel } = require('../../utils/recommendation');
const {
  t,
  getLocale,
  setLocale,
  getSupportedLanguages
} = require('../../i18n.js');

const TOTAL_STEPS = 4;

Page({
  data: {
    step: 1,
    totalSteps: TOTAL_STEPS,
    showContent: false,
    animating: false,

    languages: [],
    selectedLanguage: 'zh-CN',

    hotCities: [],
    selectedCity: '',
    citySearch: '',
    citySuggestions: [],
    showSuggestions: false,

    categories: [],
    selectedCategories: [],
    selectedCategoryMap: {},

    travelOptions: [],
    selectedTravel: '',
    preferExperience: null,
    showExperienceModal: false,

    summary: null,
    i18n: {}
  },

  buildCategoryMap(keys) {
    const map = {};
    (keys || []).forEach(key => { map[key] = true; });
    return map;
  },

  onLoad() {
    const locale = getLocale();
    const prefs = storage.getJourneyPreferences();

    this.setData({
      languages: getSupportedLanguages(),
      selectedLanguage: locale,
      hotCities: getJourneyHotCities(locale),
      categories: getJourneyCategories(locale),
      selectedCity: prefs.selectedCity || '',
      selectedCategories: prefs.interestedCategories || [],
      selectedCategoryMap: this.buildCategoryMap(prefs.interestedCategories || []),
      selectedTravel: prefs.travelPlan || '',
      preferExperience: prefs.preferExperience ? true : (prefs.preferExperience === false ? false : null)
    });

    this.refreshI18n();
    setTimeout(() => this.setData({ showContent: true }), 80);
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
        step3Title: t('journeySetup.step3.title', locale),
        step3Subtitle: t('journeySetup.step3.subtitle', locale),
        step3Hint: t('journeySetup.step3.hint', locale),
        step4Title: t('journeySetup.step4.title', locale),
        step4Subtitle: t('journeySetup.step4.subtitle', locale),
        summaryTitle: t('journeySetup.summary.title', locale),
        summarySubtitle: t('journeySetup.summary.subtitle', locale),
        summaryLanguage: t('journeySetup.summary.language', locale),
        summaryCity: t('journeySetup.summary.city', locale),
        summaryInterests: t('journeySetup.summary.interests', locale),
        summaryTravel: t('journeySetup.summary.travel', locale),
        summaryNotSet: t('journeySetup.summary.notSet', locale),
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
      hotCities: getJourneyHotCities(locale),
      categories: getJourneyCategories(locale)
    });
  },

  getProgressPercent() {
    const step = this.data.step;
    if (step > TOTAL_STEPS) return 100;
    return Math.round((step / TOTAL_STEPS) * 100);
  },

  onSelectLanguage(e) {
    const { code } = e.currentTarget.dataset;
    setLocale(code);
    const app = getApp();
    if (app && app.globalData) app.globalData.locale = code;
    this.setData({ selectedLanguage: code });
    this.refreshI18n();
    if (this.data.selectedCity) {
      this.updateCitySuggestions(this.data.citySearch);
    }
  },

  onSelectCity(e) {
    const { name } = e.currentTarget.dataset;
    this.setData({
      selectedCity: name,
      citySearch: name,
      showSuggestions: false,
      citySuggestions: []
    });
  },

  onCitySearchInput(e) {
    const value = e.detail.value;
    this.setData({ citySearch: value, selectedCity: '' });
    this.updateCitySuggestions(value);
  },

  onCitySearchFocus() {
    if (this.data.citySearch) {
      this.updateCitySuggestions(this.data.citySearch);
    }
  },

  onCitySearchBlur() {
    setTimeout(() => {
      this.setData({ showSuggestions: false });
    }, 200);
  },

  updateCitySuggestions(keyword) {
    const list = searchJourneyCities(keyword, getLocale());
    this.setData({
      citySuggestions: list,
      showSuggestions: keyword.trim().length > 0 && list.length > 0
    });
  },

  onPickSuggestion(e) {
    const { name } = e.currentTarget.dataset;
    this.setData({
      selectedCity: name,
      citySearch: name,
      showSuggestions: false,
      citySuggestions: []
    });
  },

  onToggleCategory(e) {
    const { key } = e.currentTarget.dataset;
    let selected = [...this.data.selectedCategories];
    const idx = selected.indexOf(key);
    if (idx >= 0) {
      selected.splice(idx, 1);
    } else {
      selected.push(key);
    }
    this.setData({ selectedCategories: selected, selectedCategoryMap: this.buildCategoryMap(selected) });
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
      selectedCity: this.data.selectedCity,
      interestedCategories: this.data.selectedCategories,
      travelPlan: this.data.selectedTravel,
      preferExperience: this.data.preferExperience === true
    });
  },

  applySkipDefaults() {
    const defaults = {
      selectedCity: this.data.selectedCity || '',
      interestedCategories: this.data.selectedCategories.length
        ? this.data.selectedCategories
        : ['craft'],
      travelPlan: this.data.selectedTravel || 'no_plan',
      preferExperience: this.data.preferExperience === true
    };
    storage.setJourneyPreferences(defaults);
    this.setData({
      selectedCity: defaults.selectedCity,
      selectedCategories: defaults.interestedCategories,
      selectedCategoryMap: this.buildCategoryMap(defaults.interestedCategories),
      selectedTravel: defaults.travelPlan,
      preferExperience: defaults.preferExperience
    });
    return defaults;
  },

  buildSummary() {
    const locale = getLocale();
    const lang = this.data.languages.find(l => l.code === this.data.selectedLanguage);
    const categoryLabels = this.data.selectedCategories.map(key => {
      const item = this.data.categories.find(c => c.key === key);
      return item ? item.label : key;
    });
    const sep = locale === 'en-US' ? ', ' : '、';

    return {
      language: lang ? lang.native : t('journeySetup.summary.notSet', locale),
      city: this.data.selectedCity || t('journeySetup.summary.notSet', locale),
      interests: categoryLabels.length
        ? categoryLabels.join(sep)
        : t('journeySetup.summary.notSet', locale),
      travel: this.data.selectedTravel
        ? getTravelPlanLabel(this.data.selectedTravel, locale)
        : t('journeySetup.summary.notSet', locale)
    };
  },

  goToStep(nextStep) {
    if (this.data.animating) return;
    this.setData({ animating: true, showContent: false });
    setTimeout(() => {
      this.setData({ step: nextStep, animating: false });
      this.refreshI18n();
      setTimeout(() => this.setData({ showContent: true }), 60);
    }, 280);
  },

  onBack() {
    const { step } = this.data;
    if (step <= 1) return;
    if (step === 5) {
      this.goToStep(4);
      return;
    }
    this.goToStep(step - 1);
  },

  onSkip() {
    this.applySkipDefaults();
    const summary = this.buildSummary();
    this.setData({ summary });
    this.goToStep(5);
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
      this.persistCurrentStep();
      const summary = this.buildSummary();
      this.setData({ summary });
      this.goToStep(5);
    }
  },

  onStartExplore() {
    this.persistCurrentStep();
    wx.redirectTo({ url: '/pages/login/login' });
  }
});
