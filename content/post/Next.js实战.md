---
title: "Next.js实战"
date: 2017-11-01T08:08:08+08:00
draft: false
url: "nextjs-battle"
tags:
  - Note
  - FrontEnd
  - React
  - SSR
categories:
  - Web Technologies
---

[Next.js](https://github.com/zeit/next.js/)是目前用于实现 React 服务端渲染框架中的比较流行的一个，得力于[ZEIT](https://zeit.co)的维护，使得相对于其它的一些框架，不论是在文档还是配套上面，它都比较齐全。

官方就提供了[learnnextjs](https://learnnextjs.com/)这样的交互式入门教程，这里就不多说了（结合文档效果更好）。

既然是实战，这里就说点自己遇到的问题及解决方案，下面将问题总的划分为几个分类：

## JS 方面的坑

### 使用`jsx`作为文件后缀？

一开始笔者习惯性的使用`jsx`作为文件后缀，发现控制台中老是报错，说是模块没有找到，这种一看就是配置问题，需要修改`next.config.js`中 webpack 的配置，增加`extensions`的`jsx`还有对应的`babel-loader`的配置，结果发现完全不起作用，看来是 next.js 中对于相关文件做了特殊的处理，目前来看只能使用`*.js`作为文件后缀了。

官方目前的回复也是这样，暂时就支持`*.js`作为后缀，具体可以看一下这个[issue](https://github.com/zeit/next.js/issues/200#issuecomment-291043036)

### JS 中读取`process.env.*`返回`undefined`？

如果直接用`node`执行`*.js`文件，那么**cross-env**就比较合适，这个包帮我们处理的跨平台时`env`定义的问题，但是**next.js**是依赖于构建工具**webpack**的，换句话说，如果直接在`package.json`的`scripts`中使用`cross-env`是无法直接影响**webpack**的处理结果的，还需要用到`webpack.DefinePlugin`这个插件来做一次定义，**next.js**提供了一个[简单的例子](https://github.com/zeit/next.js/blob/canary/examples/with-now-env)，[核心代码](https://github.com/zeit/next.js/blob/canary/examples/with-now-env/next.config.js#L21-L30)如下：

```javascript
webpack: (config) => {
  config.plugins.forEach((plugin) => {
    if (plugin.constructor.name === "DefinePlugin") {
      plugin.definitions["process.env.SECRET"] = JSON.stringify(
        process.env.SECRET
      );
    }
  });

  return config;
};
```

另外，这只是其中的一个解决方法，**next.js**还提供了一个[基于**Babel**和**dotenv**的例子](https://github.com/zeit/next.js/blob/canary/examples/with-dotenv)，原理就是在 Babel 处理阶段就将代码中的`process.env.*`替换处理。

### 使用**babel**处理`node_modules`中部分 JS 的方法？

为了兼容 **Android4.3**，就必须要用 **babel** 结合相关的工具对 ES6 做兼容性处理，但是，默认的`next.config.js`中关于`jsx`的处理一般都会设置`exclude`过滤掉`node_modules`，就像这样的配置：

```javascript
{
  test: /\.(js|jsx)$/,
  use: ['babel-loader'],
  exclude: /node_modules/,
}
```

**next.js**的 issues 中有不少关于这个的讨论，目前实践下来，最简单的就是直接修改`exclude`属性即可：

```javascript
{
  test: /\.(js|jsx)$/,
  use: ['babel-loader'],
  // 这里对react及react-dom 2个做了过滤处理
  // 也就是说这2个会被babel做处理
  exclude: /node_modules\/(?!(react|react-dom)\/).*/
}
```

当然，babel 还需要结合`.babelrc`和`.browserslistrc`这些配置项及`babel-plugin-transform-runtime`这样的工具，如果需要了解更多，可以参考 **[Babel 笔记](https://itony.net/post/babel-note.html)** 这篇文章。

## Static 静态资源方面的坑

> 官网教程中并没有全面的介绍如何控制好静态资源的加载及维护，下面就说说一些常见的问题。

### 如何引入图片、字体等静态资源？

webpack 及配套的`*-loader`，使得我们可以很方便的在 JS 文件中通过`import`载入各种静态资源，不过 next.js 基础中并未对图片、字体等文件做特殊配置，所以需要我们手动在`next.config.js`中增加 webpack 的相关配置：

```javascript
{
  test: /\.(png|jpe?g|gif)(\?.*)?$/,
  use: [{
      loader: 'emit-file-loader',
      options: {
        name: 'dist/[path][name].[ext]',
      },
    },
    {
      loader: 'url-loader',
      options: {
        limit: 2000,
        outputPath: 'static/images/',
        publicPath: '/_next/',
      },
    },
  ],
}, {
  test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
  use: [{
      loader: 'emit-file-loader',
      options: {
        name: 'dist/[path][name].[ext]',
      },
    },
    {
      loader: 'url-loader',
      options: {
        limit: 2000,
        outputPath: 'static/fonts/',
        publicPath: '/_next/',
      },
    },
  ],
}
```

### 如何引用全局静态资源？

[官网的推荐](https://github.com/zeit/next.js/#static-file-serving-eg-images)是在根目录的`static`文件夹中放入即可，后续不论是在 JS 还是 CSS 文件中，只需要写绝对路径`/static/{path_to_file}`即可，next.js 帮助做了一些类似于路由映射的处理，很遗憾，官方并未给出 cache 的方案，目前来看有 2 中思路

#### 1. 基于 URL 中`param`的 cache 方案

```javascript
<link
  rel="stylesheet"
  type="text/css"
  href={`/static/styles/app.css?${this.props.__NEXT_DATA__.buildStats["app.js"].hash}`}
/>
```

#### 2. 基于 URL 中`path`结合脚本迁移文件路*(暂时是个思路，未具体实现)*

```javascript
<link
  rel="stylesheet"
  type="text/css"
  href={`/_next/${this.props.__NEXT_DATA__.buildStats["app.js"].hash}/app.css`}
/>
```

文件迁移脚本

> [jq](https://stedolan.github.io/jq/)是一个轻量级的命令行 JSON 处理工具

```bash
#!/usr/bin/env bash
NEXT_BUILD_ID=`cat .next/build-stats.json | jq -r '.[][]'`
cp -Rf ./static/* ./_next/${NEXT_BUILD_ID}/
```

## CSS 方面的坑

> 官方提供了很多 CSS 的示例，但是个人觉得这个是踩坑最多的地方

### 实现`CSS Modules`？

得益于`css-loader`，如果单单是做客户端渲染，只需要在 webpack 的配置中启用[`modules`](https://github.com/webpack-contrib/css-loader#modules)配置即可，从而简简单单的实现**BEM**，但是 Next.js 官方并不支持该方案，具体可以参考这个[issue](https://github.com/zeit/next.js/issues/544)，虽然大家也都集思广益，造出了各种方案，但是具体实施起来效果都不怎么理想，反倒是官方推荐的`styled-jsx`方案，结合`postcss`之后，成了不错的选择。

[with-styled-jsx-plugins](https://github.com/zeit/next.js/tree/canary/examples/with-styled-jsx-plugins)这个例子已经实现了基础的配置，你只需要增加`postcss.config.js`扩展一下即可：

```javascript
/**
 * postcss.config.js
 *
 * @see https://github.com/zeit/next.js/tree/master/examples/with-global-stylesheet/
 */
const postcssEasyImport = require("postcss-easy-import");
const postcssCssnext = require("postcss-cssnext");
const cssnano = require("cssnano");
const lost = require("lost");

const postCSSPluginCombinations = [
  // keep this first
  // https://github.com/TrySound/postcss-easy-import#options
  postcssEasyImport({
    // prefix: '_',
  }),
  lost(),
  postcssCssnext({
    // so imports are auto-prefixed too
    // @see http://robin-front.github.io/2016/04/09/postCSS-loader%E9%85%8D%E7%BD%AE/
    browsers: ["> 1% in CN", "last 2 versions"],
    features: {
      rem: false,
    },
  }),
];

module.exports = {
  plugins:
    process.env.NODE_ENV === "production"
      ? [
          ...postCSSPluginCombinations,
          cssnano({
            autoprefixer: false,
            discardUnused: { fontFace: false },
          }),
        ]
      : postCSSPluginCombinations,
};
```

### `styled-jsx`与 babel 的冲突？

之前在`babel`的生产环境发布前，会利用一些`plugin`优化 react 的产出代码，其中最常用的就是`transform-react-remove-prop-types`、`transform-react-constant-elements`、`transform-react-inline-elements`，这个时候 `styled-jsx`对于`<style jsx>{***}</style>`中的处理就会与**`transform-react-constant-elements`**、**`transform-react-inline-elements`**冲突了，导致无法正常处理`scope`及`optimized`的功能，这里建议直接将`transform-react-constant-elements`和`transform-react-inline-elements`去除即可。

### `cssnano`处理后`@font-face`内容缺失？

一般现在都会在上生产环境前使用 cssnano 对 CSS 文件做一次压缩优化，不过现在碰到一个问题，在处理后，`@font-face`的内容缺失了，[cssnano 的 issue 中有人提供了解决方式](https://github.com/ben-eb/cssnano/issues/145#issuecomment-186311624)：禁用其对`@font-face`的优化即可。

```javascript
cssnano({
  autoprefixer: false,
  // 禁用对`@font-face`的优化
  discardUnused: {
    fontFace: false,
  },
});
```

### 首次渲染`pages/_document.js`，全局未能生效？

next.js 推荐使用`styled-jsx`处理 css，所以在`_document.js`中想当然的使用了下面的写法：

```jsx
<style jsx global>
  {mainStyles}
</style>
```

这样就直接导致了一个问题，在第一次访问服务的时候，发现`mainStyles`中的内容并未被加载并执行，next.js 的[issues](https://github.com/zeit/next.js/issues) 中有人也已经反映过[这个问题并且给出了解决方案](https://github.com/zeit/next.js/issues/2210)，简单来说就是直接使用`<style>`加载即可，不要使用`<style jsx global>`。
