const path = require('path');
const fs = require('fs');
const selfName = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json'))).name;

const { pluginName, webpackPluginName } = require('./constant');
const AutoI18nWebpackPlugin = require(webpackPluginName);

module.exports = (api, { pluginOptions = {} }) => {
  const options = pluginOptions[pluginName] || { i18nPath: 'src/i18n/index.js', generateZhPath: false };
  api.chainWebpack(config => {
    const resolve = (dir) => path.join(api.service.context, dir);
    const pluginNodeModules = resolve(`./node_modules/${selfName}/node_modules`);
    config.resolveLoader.modules.add(pluginNodeModules);

    // js
    const jsRule = config.module.rule('js');

    const jsUses = jsRule.uses;
    const babelLoader = jsUses.get('babel-loader');
    jsUses.delete('babel-loader');

    jsRule.use('i18n-js-loader').loader(`${webpackPluginName}/loader/for-js.js`);

    jsUses.set('babel-loader', babelLoader);

    // vue
    const vueRule = config.module.rule('vue');

    const vueUses = vueRule.uses;
    const vueLoader = vueUses.get('vue-loader');
    vueUses.delete('vue-loader');

    vueRule.use('i18n-vue-loader')
      .loader(`${webpackPluginName}/loader/for-vue.js`);

    vueUses.set('vue-loader', vueLoader);

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
        new AutoI18nWebpackPlugin(options),
      ],
    };
  });
}
