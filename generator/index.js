const { pluginName } = require('../constant');
const { updateGitIgnore } = require('./util');

module.exports = api => {
  api.extendPackage({
    dependencies: {
      'vue-i18n': '^8.22.1',
      'xlsx': '^0.16.8'
    }
  });

  api.render('./template');

  api.extendPackage({
    vue: {
      pluginOptions: {
        [pluginName]: {
          i18nPath: 'src/i18n/index.js'
        }
      }
    }
  });

  api.onCreateComplete(() => {
    updateGitIgnore(api);
  });

  api.exitLog(`
    \n more config: https://github.com/xiangmaoshuo/webpack-i18n-transform`,
    'done'
  );
};
