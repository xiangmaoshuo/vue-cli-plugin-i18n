const path = require('path');

const { pluginName, webpackPluginName } = require('./constant');
const TransformI18nWebpackPlugin = require(webpackPluginName);

module.exports = (api, { pluginOptions = {} }) => {
  const options = pluginOptions[pluginName] || { i18nPath: 'src/i18n/index.js' };
  api.chainWebpack(config => {
    const resolve = (dir) => path.join(api.service.context, dir);
    const pluginNodeModules = resolve(`./node_modules/${api.id}/node_modules`);
    config.resolveLoader.modules.add(pluginNodeModules);

    // js
    insertBefore({
      rule: config.module.rule('js'),
      beforeLoaderName: 'babel-loader',
      loaderName: 'i18n-js-loader',
      loaderPath: `${webpackPluginName}/loader/for-js.js`,
      testRegExp: /\.m?jsx?$/
    });

    // vue
    insertBefore({
      rule: config.module.rule('vue'),
      beforeLoaderName: 'vue-loader',
      loaderName: 'i18n-vue-loader',
      loaderPath: `${webpackPluginName}/loader/for-vue.js`,
      testRegExp: /\.vue$/
    });

    // excel
    config.module
      .rule('excel')
      .test(/\.xlsx?$/)
      .use('i18n-excel-loader')
      .loader(`${webpackPluginName}/loader/for-excel.js`);
  });
  api.configureWebpack(() => {
    return {
      plugins: [
        new TransformI18nWebpackPlugin(options),
      ],
    };
  });
}

// 插入loader，放在cache-loader后面
function insertBefore({ rule, loaderName, loaderPath, beforeLoaderName, testRegExp }) {
  const uses = rule.uses;
  const loaders = [...uses.store];
  
  // 表示对应的规则不存在
  if (loaders.length) {
    rule.test(testRegExp)
    .use(loaderName)
    .loader(loaderPath);
    return;
  }

  uses.clear();
  const beforeLoaderIndex = loaders.findIndex(([a]) => a === beforeLoaderName);
  // 插入
  if (beforeLoaderIndex > -1) {
    setLoaders(uses, loaders.slice(0, beforeLoaderIndex));
    rule.use(loaderName).loader(loaderPath);
    setLoaders(uses, loaders.slice(beforeLoaderIndex));
    return;
  }

  // 没有要插入的loader，则插入到最后
  setLoaders(uses, loaders);
  rule.use(loaderName).loader(loaderPath);
}

function setLoaders(uses, loaders) {
  loaders.forEach(([a, b]) => uses.set(a, b));
};
