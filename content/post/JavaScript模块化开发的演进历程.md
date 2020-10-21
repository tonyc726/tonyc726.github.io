---
title: "JavaScript模块化开发的演进历程"
date: 2017-09-07T08:08:08+08:00
draft: false
url: "javascript-module-history"
tags:
  - FrontEnd
  - Javascript
categories:
  - Web Technologies
---

[Brendan Eich](https://brendaneich.com/)用了 10 天就创造了 JavaScript，因为当时的需求定位，导致了在设计之初，在语言层就不包含很多高级语言的特性，其中就包括模块这个特性，但是经过了这么多年的发展，如今对 JavaScript 的需求已经远远超出了 Brendan Eich 的预期，其中模块化开发更是其中最大的需求之一。

尤其是 2009 年 Node.js 出现以后，CommonJS 规范的落地极大的推动了整个社区的模块化开发氛围，并且随之出现了 AMD、CMD、UMD 等等一系列可以在浏览器等终端实现的异步加载的模块化方案。

此前，虽然自己也一直在推进模块化开发，但是没有深入了解过模块化演进的历史，直到最近看到了一篇文章《[精读 JS 模块化发展](https://zhuanlan.zhihu.com/p/26118022)》，文章总结了[History of JavaScript](https://github.com/myshov/history-of-javascript/tree/master/4_evolution_of_js_modularity)这个开源项目中关于 JavaScript 模块化演进的部分，细读几次之后，对于一些以前模棱两可的东西，顿时清晰了不少，下面就以时间线总结一下自己的理解：

在**1999 年**的时候，绝大部分工程师做 JS 开发的时候就直接将变量定义在全局，做的好一些的或许会做一些文件目录规划，将资源归类整理，这种方式被称为**直接定义依赖**，举个例子：

```javascript
// greeting.js
var helloInLang = {
  en: "Hello world!",
  es: "¡Hola mundo!",
  ru: "Привет мир!",
};
function writeHello(lang) {
  document.write(helloInLang[lang]);
}

// third_party_script.js
function writeHello() {
  document.write("The script is broken");
}
```

```html
// index.html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Basic example</title>
    <script src="./greeting.js"></script>
    <script src="./third_party_script.js"></script>
  </head>
  <body onLoad="writeHello('ru')"></body>
</html>
```

但是，即使有规范的目录结构，也不能避免由此而产生的大量全局变量，这就导致了一不小心就会有变量冲突的问题，就好比上面这个例子中的`writeHello`。

于是在**2002 年**左右，有人提出了**命名空间模式**的思路，用于解决遍地的全局变量，将需要定义的部分归属到一个对象的属性上，简单修改上面的例子，就能实现这种模式：

```javascript
// greeting.js
var app = {};
app.helloInLang = {
  en: "Hello world!",
  es: "¡Hola mundo!",
  ru: "Привет мир!",
};
app.writeHello = function (lang) {
  document.write(helloInLang[lang]);
};

// third_party_script.js
function writeHello() {
  document.write("The script is broken");
}
```

不过这种方式，毫无隐私可言，本质上就是全局对象，谁都可以来访问并且操作，一点都不安全。

所以在**2003 年**左右就有人提出利用[IIFE](https://developer.mozilla.org/zh-CN/docs/Glossary/%E7%AB%8B%E5%8D%B3%E6%89%A7%E8%A1%8C%E5%87%BD%E6%95%B0%E8%A1%A8%E8%BE%BE%E5%BC%8F)结合[Closures](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)特性，以此解决私有变量的问题，这种模式被称为**闭包模块化模式**：

```javascript
// greeting.js
var greeting = (function () {
  var module = {};
  var helloInLang = {
    en: "Hello world!",
    es: "¡Hola mundo!",
    ru: "Привет мир!",
  };

  module.getHello = function (lang) {
    return helloInLang[lang];
  };

  module.writeHello = function (lang) {
    document.write(module.getHello(lang));
  };

  return module;
})();
```

IIFE 可以形成一个独立的作用域，其中声明的变量，仅在该作用域下，从而达到实现私有变量的目的，就如上面例子中的`helloInLang`，在该 IIFE 外是不能直接访问和操作的，可以通过暴露一些方法来访问和操作，比如说上面例子里面的`getHello`和`writeHello`2 个方法，这就是所谓的 Closures。

同时，不同模块之间的引用也可以通过参数的形式来传递：

```javascript
// x.js
// @require greeting.js
var x = (function (greeting) {
  var module = {};

  module.writeHello = function (lang) {
    document.write(greeting.getHello(lang));
  };

  return module;
})(greeting);
```

此外使用 IIFE，还有 2 个好处：

1. 提高性能：通过 IIFE 的参数传递常用全局对象 window、document，在作用域内引用这些全局对象。JavaScript 解释器首先在作用域内查找属性，然后一直沿着链向上查找，直到全局范围，因此将全局对象放在 IIFE 作用域内可以提升 js 解释器的查找速度和性能；

2. 压缩空间：通过参数传递全局对象，压缩时可以将这些全局对象匿名为一个更加精简的变量名；

在那个年代，除了这种解决思路以外，还有通过其它语言的协助来完成模块化的解决思路，比如说**模版依赖定义**、**注释依赖定义**、**外部依赖定义**等等，不过不常见，所以就不细说了，究其本源，它们想最终实现的方式都差不多。

不过，这些方案，虽然解决了依赖关系的问题，但是没有解决如何管理这些模块，或者说在使用时清晰描述出依赖关系，这点还是没有被解决，可以说是少了一个管理者。

没有管理者的时候，在实际项目中，得手动管理第三方的库和项目封装的模块，就像下面这样把所有需要的 JS 文件一个个按照依赖的顺序加载进来：

```html
<script src="zepto.js"></script>
<script src="jhash.js"></script>
<script src="fastClick.js"></script>
<script src="iScroll.js"></script>
<script src="underscore.js"></script>
<script src="handlebar.js"></script>
<script src="datacenter.js"></script>
<script src="deferred.js"></script>
<script src="util/wxbridge.js"></script>
<script src="util/login.js"></script>
<script src="util/base.js"></script>
<script src="util/city.js"></script>
```

如果页面中使用的模块数量越来越多，恐怕再有经验的工程师也很难维护好它们之间的依赖关系了。

于是如 LABjs 之类的加载工具就横空出世了，通过使用它的 API，动态创建`<script>`，从而达到控制 JS 文件加载以及执行顺序的目的，在一定的程度上解决了依赖关系，例如：

```javascript
$LAB
  .script("greeting.js")
  .wait()
  .script("x.js")
  .script("y.js")
  .wait()
  .script("run.js");
```

不过 LABjs 之类的加载工具是建立在以文件为单位的基础之上的，但是 JS 中的模块又不一定必须是文件，同一个文件中可以声明多个模块，YUI 作为昔日前端领域的佼佼者，很好的糅合了**命名空间模式**及**沙箱模式**，下面来一睹它的风采：

```javascript
// YUI - 编写模块
YUI.add('dom', function(Y) {
  Y.DOM = { ... }
})

// YUI - 使用模块
YUI().use('dom', function(Y) {
  Y.DOM.doSomeThing();
  // use some methods DOM attach to Y
})

// hello.js
YUI.add('hello', function(Y){
    Y.sayHello = function(msg){
        Y.DOM.set(el, 'innerHTML', 'Hello!');
    }
},'3.0.0',{
    requires:['dom']
})

// main.js
YUI().use('hello', function(Y){
    Y.sayHello("hey yui loader");
})
```

此外，YUI 团队还提供的一系列用于 JS 压缩、混淆、请求合并（合并资源需要 server 端配合）等性能优化的工具，说其是现有 JS 模块化的鼻祖一点都不过分。

不过，随着 Node.js 的到来，CommonJS 规范的落地以及各种前端工具、解决方案的出现，很快，YUI3 就被湮没在了历史的长流里面，这样成为了 JS 模块化开发的一个分水岭，引用一段描述：

> 从 1999 年开始，模块化探索都是基于语言层面的优化，真正的革命从 2009 年 CommonJS 的引入开始，前端开始大量使用预编译。

CommonJS 是一套同步的方案，它考虑的是在服务端运行的 Node.js，主要是通过`require`来加载依赖项，通过`exports`或者`module.exports`来暴露接口或者数据的方式，想了解更多，可以看一下《[CommonJS 规范](http://javascript.ruanyifeng.com/nodejs/module.html)》，下面举个简单的例子：

```javascript
var math = require("math");
esports.result = math.add(2, 3); // 5
```

由于服务器上通过`require`加载资源是直接读取文件的，因此中间所需的时间可以忽略不计，但是在浏览器这种需要依赖 HTTP 获取资源的就不行了，资源的获取所需的时间不确定，这就导致必须使用异步机制，代表主要有 2 个：

- 基于 [AMD](http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition) 的 RequireJS

- 基于 [CMD](https://github.com/cmdjs/specification/blob/master/draft/module.md) 的 SeaJS

它们分别在浏览器实现了`define`、`require`及`module`的核心功能，虽然两者的目标是一致的，但是实现的方式或者说是思路，还是有些区别的，AMD 偏向于依赖前置，CMD 偏向于用到时才运行的思路，从而导致了依赖项的加载和运行时间点会不同，关于这 2 者的比较，网上有很多了，这里推荐几篇仅供参考：

- 《[SeaJS 和 RequireJS 的异同](https://lifesinger.wordpress.com/2011/05/17/the-difference-between-seajs-and-requirejs/)》
- 《[再谈 SeaJS 与 RequireJS 的差异](https://div.io/topic/430)》

本人就先接触了 SeaJS 后转到 RequireJS，虽然感觉 AMD 的模式写确实没有 CMD 这么符合一惯的语义逻辑，但是写了几个模块以后就习惯了，而且**社区资源**比较丰富的 AMD 阵营更加符合当时的项目需求（扯多了），下面分别写个例子做下直观的对比：

```javascript
// CMD
define(function (require) {
  var a = require("./a"); // <- 运行到此处才开始加载并运行模块a
  var b = require("./b"); // <- 运行到此处才开始加载并运行模块b
  // more code ..
});
```

```javascript
// AMD
define(["./a", "./b"], function (a, b) {
  // <- 前置声明，也就是在主体运行前就已经加载并运行了模块a和模块b
  // more code ..
});
```

通过例子，你可以看到除了语法上面的区别，这 2 者主要的差异还是在于：

> 何时加载和运行依赖项？

这也是 CommonJS 社区中质疑 AMD 最主要原因之一，不少人认为它破坏了规范，反观 CMD 模式，简单的去除`define`的外包装，这就是标准的 CommonJS 实现，所以说 CMD 是最贴近 CommonJS 的异步模块化方案，不过孰优孰劣，这里就不扯了，需求决定一切。

此外同一时期还出现了一个 UMD 的方案，其实它就是 AMD 与 CommonJS 的集合体，通过 IIFE 的前置条件判断，使一个模块既可以在浏览器运行，也可以在 Node.JS 中运行，举个例子：

```javascript
// UMD
(function (define) {
  define(function () {
    var helloInLang = {
      en: "Hello world!",
      es: "¡Hola mundo!",
      ru: "Привет мир!",
    };

    return {
      sayHello: function (lang) {
        return helloInLang[lang];
      },
    };
  });
})(
  typeof module === "object" && module.exports && typeof define !== "function"
    ? function (factory) {
        module.exports = factory();
      }
    : define
);
```

个人觉得最少用到的就是这个 UMD 模式了。

2015 年 6 月，**ECMAScript2015**也就是**ES6**发布了，JavaScript 终于在语言标准的层面上，实现了模块功能，使得在编译时就能确定模块的依赖关系，以及其输入和输出的变量，不像 CommonJS、AMD 之类的需要在运行时才能确定（例如 FIS 这样的工具只能预处理依赖关系，本质上还是运行时解析），成为浏览器和服务器通用的模块解决方案。

```javascript
// lib/greeting.js
const helloInLang = {
    en: 'Hello world!',
    es: '¡Hola mundo!',
    ru: 'Привет мир!'
};

export const getHello = (lang) => (
    helloInLang[lang];
);

export const sayHello = (lang) => {
    console.log(getHello(lang));
};

// hello.js
import { sayHello } from './lib/greeting';

sayHello('ru');
```

与 CommonJS 用`require()`方法加载模块不同，在 ES6 中，`import`命令可以具体指定加载模块中用`export`命令暴露的接口（不指定具体的接口，默认加载`export default`），没有指定的是不会加载的，因此会在编译时就完成模块的加载，这种加载方式称为**编译时加载**或者**静态加载**。

而 CommonJS 的`require()`方法是在运行时才加载的：

```javascript
// lib/greeting.js
const helloInLang = {
  en: "Hello world!",
  es: "¡Hola mundo!",
  ru: "Привет мир!",
};
const getHello = function (lang) {
  return helloInLang[lang];
};

exports.getHello = getHello;
exports.sayHello = function (lang) {
  console.log(getHello(lang));
};

// hello.js
const sayHello = require("./lib/greeting").sayHello;

sayHello("ru");
```

可以看出，CommonJS 中是将整个模块作为一个对象引入，然后再获取这个对象上的某个属性。

因此 ES6 的**编译时加载**，在效率上面会提高不少，此外，还会带来一些其它的好处，比如引入宏（macro）和类型检验（type system）这些只能靠静态分析实现的功能。

可惜的是，目前浏览器和 Node.js 的支持程度都并不理想，截止发稿，也就只有 Chrome61+ 与 Safari10.1+ 才做到了部分支持。

不过可以通过 Babel 这类工具配合相关的 plugin（可以参考《[Babel 笔记](https://itony.net/post/babel-note.html)》），转换为 ES5 的语法，这样就可以在 Node.js 运行起来了，如果想在浏览器上运行，可以添加 Babel 配置，为模块文件添上 AMD 的`define`函数作为外层，再并配合 RequireJS 之类的加载器即可。

更多关于 ES6 Modules 的资料，可以看一下《[ECMAScript 6 入门 - Module 的语法](http://es6.ruanyifeng.com/#docs/module)》。

---

### 参考

- [精读 js 模块化发展](https://zhuanlan.zhihu.com/p/26118022)
- [History of JavaScript](https://github.com/myshov/history-of-javascript/tree/master/4_evolution_of_js_modularity)
- [JavaScript 模块化七日谈](https://huangxuan.me/2015/07/09/js-module-7day/)
- [JavaScript Module Pattern: In-Depth](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html)
- [前端模块化开发那点历史](https://github.com/seajs/seajs/issues/588)
- [JavaScript Modules: A Beginner’s Guide](https://medium.freecodecamp.org/javascript-modules-a-beginner-s-guide-783f7d7a5fcc)
