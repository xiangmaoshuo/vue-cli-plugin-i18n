import Vue from 'vue';
import axios from 'axios';
import VueI18n from 'vue-i18n';
import ViewUI from 'view-design';
import messages, { asyncLangs, locale } from 'TODO:excel-path';
import zh from 'view-design/dist/locale/zh-CN';

Vue.use(VueI18n);
Vue.use(ViewUI);
Vue.locale = () => {};

const i18n = new VueI18n({
  locale,
  fallbackLocale: locale,
  messages: {
    [locale]: { ...messages[locale], ...zh },
  },
});

const loadedLanguages = [locale];

function setI18nLanguage(lang) {
  i18n.locale = lang;
  axios.defaults.headers.common['Accept-Language'] = lang;
  document.querySelector('html').setAttribute('lang', lang);
  return lang;
}

function loadUiLang(lang) {
  switch (lang) {
    case 'en-us':
      return import('view-design/dist/locale/en-US').then(a => a.default);
    default:
      return Promise.resolve(zh);
  }
}

export default i18n;

export const $t = i18n.t.bind(i18n);

// 该方法一般用在路由钩子及切换语言处
export function loadLanguageAsync(lang) {
  if (i18n.locale === lang) {
    return Promise.resolve(lang);
  }
  if (loadedLanguages.includes(lang)) {
    return Promise.resolve(setI18nLanguage(lang));
  }
  return Promise.all([
    asyncLangs[lang](),
    loadUiLang(lang),
  ]).then(([a, b]) => {
    i18n.setLocaleMessage(lang, {
      ...b,
      ...a.default,
    });
    loadedLanguages.push(lang);
    return setI18nLanguage(lang);
  });
}
