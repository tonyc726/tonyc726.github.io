---
title: "Babel笔记"
date: 2017-07-31T08:08:08+08:00
url: "babel-note"
draft: false
tags:
  - Note
  - FrontEnd
categories:
  - Web Technologies
---

正如封面图所述，[Babel](https://babeljs.io)作为一个 JavaScript 的语法编译器，可以将`ES6/7/8`代码转为`ES5`代码，从而在现有环境执行。

但是初次配置`.babelrc`的时候，各种`presets`、`plugins`看的眼花缭乱，不知道如何下手，下面就自己学习 Babel 时遇到的问题做一下总结：

> 如果你是初次接触 babel，推荐阅读阮一峰的《[Babel 入门教程](http://www.ruanyifeng.com/blog/2016/01/babel.html)》

## Plugin、Preset、Stage-X 的关系

按照 Babel 官网的[介绍](http://babeljs.io/docs/plugins/)，其实**Preset**和**Stage-X**都是归属到**Plugin**里面的，只不过所覆盖的范围不同而已。

举个例子，如果需要转换 ES2015(ES6)的语法，那么你可以在`.babelrc`的`plugins`中按需引入`check-es2015-constants`、`es2015-arrow-functions`、`es2015-block-scoped-functions`等等几十个不同作用的 plugin：

```JSON
// .babelrc
{
  "plugins": [
    "check-es2015-constants",
    "es2015-arrow-functions",
    "es2015-block-scoped-functions",
    // ...
  ]
}
```

但是 Babel 团队为了方便，将[同属 ES2015 的几十个 Transform Plugins](http://babeljs.io/docs/plugins/preset-es2015/)集合到`babel-preset-es2015`一个 Preset 中，这样你只需要在`.babelrc`的`presets`加入`es2015`一个配置就可以完成全部 ES2015 语法的支持了：

```JSON
// .babelrc
{
  "presets": [
    "es2015"
  ]
}
```

另外，不论是 Plugin 还是 Preset，有不少都有单独属于自己的配置项，具体如何操作的可以看一下[官网的说明](http://babeljs.io/docs/plugins/#plugin-preset-options)。

上面介绍了 Plugin 与 Preset，那么 Stage-X 就很好理解了，`stage-0`、`stage-1`、`stage-2`、`stage-3`、~~`stage-4`~~分别对应的就是进入标准之前的 5 个阶段，不同`stage-x`之间存在依赖关系，数字越小，阶段越靠后，靠后阶段包含前面阶段所有的功能，简单理解就是`stage-0`包含`stage-1/2/3`的内容，所以如果你不知道需要哪个`stage-x`的话，直接引入`stage-0`就好了。

> PS: `babel-preset-stage-4`已经整合入 Presets 不单独发布了。

以上就是一些基础概念，目前，官方推荐使用[`babel-preset-env`](http://babeljs.io/docs/plugins/preset-env/)，它可以根据你的配置结合[`compat-table`](https://github.com/kangax/compat-table)来帮你自动引入你需要的 plugins，它有很多[配置项](http://babeljs.io/docs/plugins/preset-env/#options)，下面介绍几个常用的：

- **targets**： `{ [string]: number | string }`，默认 `{}`；  
  需要支持的环境，可选例如：`chrome`, `edge`, `firefox`, `safari`, `ie`, `ios`, `node`，甚至可以指定版本，如`node: "6.10"`或者`node: "current"`代表使用当前的版本；

- **targets.node**： `number | string | "current" | true`；  
  指定`node`的版本，例如：`6.10`；

- **targets.browsers**： `Array<string> | string`；  
  指定需要兼容的浏览器清单，具体参考[browserslist](https://github.com/ai/browserslist)，例如：`["last 2 versions", "safari >= 7"]`；

例如需要配置兼容`["last 2 versions", "safari >= 7"]`的`babel-preset-env`：

```JSON
// .babelrc
{
  "presets": [
    ["env", {
      "targets": {
        "browsers": ["last 2 versions", "safari >= 7"]
      }
    }]
  ]
}
```

此外，不同的 plugins 和 presets 或许有些功能是重复的，有些存在依赖关系，在配置的时候还有前后顺序的不同，那么 Babel 在运行的时候是怎么处理的呢？总结一下，规律大概有以下几点：

1. plugins 优先于 presets 进行编译；
2. plugins 按照数组的 index 增序(从数组第一个到最后一个)进行编译；
3. presets 按照数组的 index 倒序(从数组最后一个到第一个)进行编译，因为作者认为大部分会把 presets 写成`["es2015", "stage-0"]`，具体细节可以看[这个](https://github.com/babel/notes/blob/master/2016-08/august-01.md#potential-api-changes-for-traversal)。

> 摘自《[如何写好.babelrc？Babel 的 presets 和 plugins 配置解析](https://excaliburhan.com/post/babel-preset-and-plugins.html)》

## `babel-polyfill`与`babel-runtime`的选择

Babel 默认只转换新的 JavaScript 语法，而不转换新的 API，比如`Iterator`、`Generator`、`Set`、`Maps`、`Promise`等等全局对象，以及一些定义在全局对象上的方法（比如`Object.assign`）都不会转码，具体的可以参考`babel-plugin-transform-runtime`模块的[definitions.js](https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-runtime/src/definitions.js)文件。

`babel-polyfill`与`babel-runtime`就是为了解决这种全局对象或者全局对象方法不足的问题，而诞生的 2 种解决方式。

> 当然，你还可以用`promise-polyfill`此类 Polyfill 解决全局对象的问题；
>
> 或者用`lodash`此类 Utils 解决`Object.assign`这种方法扩展的问题。

先说说`babel-polyfill`，它的做法比较暴力，就是将全局对象通通污染一遍，这样做的坏处有几点：

1. 可能会增加很多根本没有用到的 polyfill；
2. 可能会污染子模块的局部作用域，严重的或许会导致冲突；

但是，这样做也有好处，如果你的运行环境比较 low，比如说 Android 一些老机子，而你有需要大量使用`Promise`、`Object.assign`、`Array.find`之类的全局对象或者其所属方法，那么使用`babel-polyfill`，绝对是一劳永逸。

接着，再来说说`babel-runtime`，相对而言，它的处理方式比较温柔，套用步步高的广告词就是哪里需要加哪里，比如说你需要`Promise`，你只需要`import Promise from 'babel-runtime/core-js/promise'`即可，这样不仅避免污染全局对象，而且可以减少不必要的代码。

不过，如果 N 个文件都需要`Promise`，难道得一个个文件的加`import Promise from 'babel-runtime/core-js/promise'`么，显然不是，Babel 已经为这样情况考虑过了，只需要使用`babel-plugin-transform-runtime`就可以轻松的帮你省去手动`import`的痛苦，而且，它还做了公用方法的抽离，哪怕你有 100 个模块使用了`Promise`，但是 promise 的 polyfill 仅仅存在 1 份，所有要的地方都是引用一地方，具体的配置参考如下：

```JSON
// .babelrc
{
  "presets": [
    "env",
    "stage-0"
  ],
  "plugins": [
    "transform-runtime"
  ],
  "comments": false
}
```

此外，需要注意的是，如果你直接写`[1,2,3].find((i) => (i === 1))`这样的语法，`babel-runtime`处理以后的结果并不会引入`Array.find`相关的 polyfill：

```javascript
// 源码
[1, 2, 3].find((i) => i === 1);

// 转码后
[1, 2, 3].find(function (i) {
  return i === 1;
});
```

你需要使用`Array.find`才可以：

```javascript
// 源码
Array.find([1, 2, 3], (i) => i === 1);

// 转码后
var _find = require("babel-runtime/core-js/array/find");
var _find2 = _interopRequireDefault(_find);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

(0, _find2.default)([1, 2, 3], function (i) {
  return i === 1;
});
```

当然，你也可以在需要的地方引入`core-js/fn/array/find`或者`lodash/find`作为一个 function 来使用：

```javascript
import ArrayFind from "core-js/fn/array/find";

ArrayFind([1, 2, 3], (i) => i === 1);
```

不过，如果你执意要使用`[1,2,3].find((i) => (i === 1))`这样的语法，那么只能对`Array.prototype`进行扩展，增加一个`find`的方法了，`babel-polyfill`就可以实现，当然你也可以自己做扩展。

> 写在最后，我在[Github 上开了一个项目](https://github.com/tonyc726/babel-note)，做了几个测试，有兴趣的可以一起来试试看。

---

> 2017.7.30 补充

关于`babel`与`webpack`结合使用的教程网上已经有很多了，有不少却还在用`v1.*`的版本（不推荐），从而在过渡到`v2.*`或者`v3.*`(推荐)的版本时，碰到一个关于`babel`的配置问题，示例如下：

```json
// .babelrc - webpack v1.*
{
  "presets": ["env", "stage-0"]
}
```

```json
// .babelrc - webpack v2.* - v3.*
{
  "presets": [
    [
      "env",
      {
        "modules": false
      }
    ],
    "stage-0"
  ]
}
```

很明显，一眼就能看出相对于`v1.*`的版本，`v2.*`或者`v3.*`版本多了`"modules": false`这项配置，如果仔细看[官网的迁移指南](https://webpack.js.org/guides/migrating/#mixing-es2015-with-amd-and-commonjs)，你就能明白了，以前你可能需要用`babel`来将`ES6`的模块语法转换为`AMD`、`CommonJS`、`UMD`之类的模块化标准语法，但是现在 webpack 已经把这个事情做了，所以就不需要`babel`来做了，但是`babel`配置项中的`modules`[默认值](https://babeljs.io/docs/plugins/preset-env/#optionsmodules)是`commonjs`，所以你需要将`modules`设置为`false`才行，不然就冲突了。

---

### 参考资料

1. http://www.ruanyifeng.com/blog/2016/01/babel.html
2. https://excaliburhan.com/post/babel-preset-and-plugins.html
3. https://segmentfault.com/q/1010000005596587?from=singlemessage&isappinstalled=1
4. https://github.com/brunoyang/blog/issues/20
5. https://github.com/lmk123/blog/issues/45
6. http://www.cnblogs.com/flyingzl/p/5501247.html
