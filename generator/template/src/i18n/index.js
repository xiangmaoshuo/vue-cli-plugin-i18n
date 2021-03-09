import Vue from 'vue';
import axios from 'axios';
import VueI18n from 'vue-i18n';
import messages, { asyncLangs, locale } from './portal-lang.xlsx';
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
  messages: {
    [locale]: {
      ...messages[locale],
      ...uiLangs[locale]
    }
  }
});

const t = i18n.t.bind(i18n);
const currentLocale = localStorage.getItem('lang') || locale;
const loadedLanguages = [locale];

// 由于i18n使用的是异步加载可选语言包，所以当currentLocale为可选语言包时
// 一般需要先加载该语言包，然后才能加载其他文件；原因是：如果不这样的话，
// 假如其他文件中一开始就有国际化的操作，那么此时拿到的语言文件将是默认语言包对应的内容
// 当然，如果你能保证在切换到可选语言包时，您的页面在不需要刷新的情况下也能正确更新，
// 那么也就不需要关心这个问题了
function changeLanguageAsync (lang = currentLocale) {
  if (i18n.locale === lang) {
    return Promise.resolve(lang);
  }
  if (loadedLanguages.includes(lang)) {
    return Promise.resolve(setI18nLanguage(lang));
  }
  return asyncLangs[lang]().then(res => {
    i18n.setLocaleMessage(lang, {
      ...uiLangs[lang],
      ...res.default
    });
    loadedLanguages.push(lang);
    return setI18nLanguage(lang);
  });
}

function setI18nLanguage (lang) {
  i18n.locale = lang;
  axios.defaults.headers.common['Accept-Language'] = lang;
  document.querySelector('html').setAttribute('lang', lang);
  changeLanguage(lang, false); // 这里就不用重载了
  return lang;
}

// 改变语言；本项目为老项目集成，改变语言时直接重载页面
function changeLanguage (lang, reload = true) {
  localStorage.setItem('lang', lang);
  if (reload) {location.reload();}
}

export default i18n;

// 切换语言时，如果不需要reload也能正确更新，请使用changeLanguageAsync，不需要关心js的加载顺序；
// 反之，使用changeLanguage，同时需要注意js加载顺序。
// 不管怎样，一般都需要在初始化后调用一次changeLanguageAsync
// 这里$t对外暴露得采用这种方式，防止页面中存在中文时，与插件插入的$t变量重复导致报错
export { t as $t, currentLocale, changeLanguageAsync, changeLanguage };
