const path = require('path');

const { pluginName, webpackPluginName } = require('./constant');
const TransformI18nWebpackPlugin = require(webpackPluginName);

module.exports = (api, { pluginOptions = {} }) => {
  const options = pluginOptions[pluginName] || { i18nPath: 'src/i18n/index.js', generateZhPath: false };
  api.chainWebpack(config => {
    const resolve = (dir) => path.join(api.service.context, dir);
    const pluginNodeModules = resolve(`./node_modules/${api.id}/node_modules`);
    config.resolveLoader.modules.add(pluginNodeModules);

    // js
    insertLoader({
      rule: config.module.rule('js'),
      loaderName: 'i18n-js-loader',
      loaderPath: `${webpackPluginName}/loader/for-js.js`,
    });

    // vue
    insertLoader({
      rule: config.module.rule('vue'),
      loaderName: 'i18n-vue-loader',
      loaderPath: `${webpackPluginName}/loader/for-vue.js`,
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
function insertLoader({ rule, loaderName, loaderPath }) {
  const uses = rule.uses;
  const loaders = [...uses.store];

  uses.clear();
  
  const cacheLoaderIndex = loaders.findIndex(([a]) => a === 'cache-loader');
  if (cacheLoaderIndex > -1) {
    const [k, v] = loaders.splice(cacheLoaderIndex, 1)[0];
    uses.set(k, v);
  }

  rule.use(loaderName).loader(loaderPath);

  loaders.forEach(([a, b]) => uses.set(a, b));
}
