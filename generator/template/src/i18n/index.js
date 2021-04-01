import Vue from 'vue';
import axios from 'axios';
import VueI18n from 'vue-i18n';
import messages, { asyncLangs, locale } from './locale.xlsx';
import zh from 'view-design/dist/locale/zh-CN';
import en from 'view-design/dist/locale/en-US';

// ui的语言包一般很小，没必要异步加载
// 当然你也可以将它和对应的业务语言包打包到一个chunk中
const uiLangs = { zh, en };

Vue.use(VueI18n);
Vue.locale = () => {};

const i18n = new VueI18n({
  locale,
  fallbackLocale: locale,
  messages: {}
});

const t = i18n.t.bind(i18n);
const currentLocale = localStorage.getItem('lang') || locale;
const loadedLanguages = Object.keys(messages);
const length = loadedLanguages.length;

function _loadAsyncLang(lang) {
  return asyncLangs[lang]().then(res => {
    i18n.setLocaleMessage(lang, {
      ...uiLangs[lang],
      ...res.default
    });
  });
}

function _setI18nLanguage (lang) {
  i18n.locale = lang;
  axios.defaults.headers.common['Accept-Language'] = lang;
  document.querySelector('html').setAttribute('lang', lang);
  localStorage.setItem('lang', lang);
  return lang;
}

// 如果你的项目在切换语言后，页面能够正常显示，则使用该方法即可
// 反之，使用changeLanguageAndReload
function changeLanguage (lang = currentLocale) {
  if (i18n.locale === lang) {
    return Promise.resolve(lang);
  }
  if (loadedLanguages.includes(lang)) {
    return Promise.resolve(_setI18nLanguage(lang));
  }
  // for async analysis excel
  return _loadAsyncLang(lang).then(() => {
    loadedLanguages.push(lang);
    return _setI18nLanguage(lang);
  });
}

// 改变语言时直接重载页面
function changeLanguageAndReload (lang, reload = true) {
  localStorage.setItem('lang', lang);
  if (reload) {location.reload();}
}

// 默认配置下，该方法会在恰当的时机（excel更新、项目收集的中文内容变化）自动执行，以提供hmr效果
function initLocaleMessage() {
  loadedLanguages.slice(0, length).forEach(l => {
    i18n.setLocaleMessage(l, { ...messages[l], ...uiLangs[l] });
  });
  // for async analysis excel
  loadedLanguages.slice(length).forEach(_loadAsyncLang);
}

initLocaleMessage();
// 确保当前语言下的语言包被加载
// 如果您的项目无法保证异步加载的语言包能够正确更新页面
// 您可以在该方法返回的promise之后再加载其他资源
// 或者对于excel解析时使用同步的方式
changeLanguage();

// 这里$t对外暴露得采用这种方式，防止页面中存在中文时，与插件插入的$t变量重复导致报错
export { t as $t, currentLocale, changeLanguage, changeLanguageAndReload };
export default i18n;
