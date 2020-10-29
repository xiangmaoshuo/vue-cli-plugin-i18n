# vue-cli-plugin-auto-i18n
基于[webpack-auto-i18n](https://github.com/xiangmaoshuo/webpack-auto-plugin)进行的封装

### 基于`vue-i18n`使用本插件时的说明
1. 在基于`vue-i18n`做国际化时，为了提供更好的体验，建议在`计算属性`或者`render`/`template`中处理国际化，而不是在`data`中使用；因为`vue-i18n`是基于`vue`自身的`响应式数据`来实现更新的；当然如果你一定要在data中使用中文，再将变量绑定到视图中，这时候在切换语言环境时，最好使用`location.reload()`;
2. 如果是老项目集成国际化功能，那么使用本插件或许是很方便的一种方式，但是由于一开始对代码开发要求并不高，所以在切换语言环境时建议使用`location.reload()`刷新页面；
3. `i18n/index.js`中给出了基于`axios`、`view-design`场景下的异步加载解决方案以供参考
4. 该文档只列举了vue相关的说明事项，详细说明请参考[webpack-auto-i18n](https://github.com/xiangmaoshuo/webpack-auto-plugin)