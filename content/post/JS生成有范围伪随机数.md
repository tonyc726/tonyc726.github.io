---
title: "JS生成有范围伪随机数"
date: 2017-09-12T08:08:08+08:00
draft: false
url: "javascript-random-number"
tags:
  - FrontEnd
  - Javascript
  - Math
categories:
  - Web Technologies
---

众所周知，JS 生成伪随机数无非就是采用`Math.random()`，但是，如何生成一个有范围的伪随机数（整数），一般都会这么写：

```javascript
/**
 * 生成一个介于 min ~ max 的随机数
 */
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * 生成一个介于 min ~ max 的随机整数
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

没错，以前我也是这么解决的（Google 一下，so easy！)。

但是没有仔细考虑过，为何要这么做，今天无意翻到 [stackoverflow 上一个解答](http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range?answertab=active#tab-top)，十分详细的说明背后的逻辑，总结一下可以归纳为 3 条：

`Math.random()`返回一个从 `0`_(包含)_ 到 `1`_(不包含)_ 的随机数，具体如下：

```bash
[0 .................................... 1)
```

现在我们需要有一个取值范围，也就是`min`_(包含)_ 到 `max`_(不包含)_，结合原始的示意图，就有下面这个图了：

```bash
[0 .................................... 1)
[min .................................. max)
```

好吧，但是明显我们需要将`min`转换为`0`，那么很显然，`max`那个部分得变为`max - min`，示意图如下：

```bash
[0 .................................... 1)
[min - min ............................ max - min)
```

简化一下就是：

```bash
[0 .................................... 1)
[0 ............................ max - min)
```

很明显，再结合`Math.random()`，进行乘法计算，我们就可以获取到一个介于 `min` 到 `max` 的随机整数了：

```bash
                Math.random()
                    |
[0 .................................... 1)
[0 .................................... max - min)
                    |
                    x (what we need)
```

但是，这个结果是不包含 `min` 的，别忘了，它的范围是从 `0` 开始的，所以我们需要在此基础上加上`min`的值，也就是：

```bash
Math.random() * (max - min) + min;
```

这样就实现了一个`min`_(包含)_ 到 `max`*(不包含)*的伪随机数了。

但是，有时候我们还需要是一个整数的 `min`_(包含)_ 到一个整数的 `max`_(不包含)_ 的伪随机数，这个时候，我们就想到了 JS 里面的几个原生的方法：`Math.round`,`Math.ceil`,`Math.floor`，他们都能返回一个整数值给我们.

但是仔细的理解，你会发现，如果使用`Math.round(Math.random() * (max - min)) + min`，它返回的随机数并不是均匀分布的，下面这个图可以帮你理解一下:

```bash
min...min+0.5...min+1...min+1.5   ...    max-0.5......max
└───┬───┘└────────┬───────┘└───── ... ─────────┘└───┬──┘   ← round()
   min          min+1                          max
```

看图，也许你就发现了，明显随机到 `max` 的概率要小于随机到 `min` 的概率。

接下来，我们尝试一下`Math.floor(Math.random() * (max - min + 1)) + min`，再画个示意图：

```bash
min.... min+1... min+2  ... max-1... max.... max+1 (is excluded from interval)
|         |        |         |        |        |
└───┬────┘└───┬───┘└─── ... ┘└───┬───┘└───┬────┘   ← floor()
   min     min+1               max-1    max
```

很明显，此时，随机到 `max` 的概率要基本上与随机到 `min` 的概率一致了，也就是达到了一种概率均匀分布的状态。

另外，你也可以尝试一下`Math.ceil(Math.random() * (max - min - 1)) + min`，你会发现随机到 `min` 的概率要小于随机到 `max` 的概率，也就是随机概率又不均匀了。

---

### 参考资料

1. https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/random
2. http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range?answertab=active#tab-top
