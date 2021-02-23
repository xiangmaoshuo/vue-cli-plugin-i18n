const { dependencies } = require('./package.json');

exports.pluginName = 'i18n-transform';
exports.webpackPluginName = Object.keys(dependencies)[0];