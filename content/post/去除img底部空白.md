---
title: "去除`img`底部空白"
date: 2016-08-29T08:08:08+08:00
draft: false
url: "remove-img-element-blank"
tags:
    - FrontEnd
    - CSS
categories:
    - Web Technologies
---

最近在做项目时，使用 table，div，css 布局，最顶部加入 img（图片）后，底部总是有空白，经过查找了大量资料，问题总算是解决了。

网上朋友说是在进行页面的 DIV+CSS 排版时，遇到 IE6（当然有时 Firefox 下也会偶遇）浏览器中的图片元素 img 下出现多余空白的问题绝对是常见的对于该问题的解决方法也是“见机行事”，根据原因的不同要用不同的解决方法，这里把解决直接把解决 img 图片布局下边的多余空隙的 BUG 的常用方法归纳，供大家参考。

## 1、将图片转换为块级对象

> 即设置 img 的 style 为：`style="display:block"`，或者设置其 CSS 为：

```css
img {
    display: block;
}
```

经试验，此方法可以解决。

## 2、设置图片的垂直对齐方式

> 即设置图片的`vertical-align`属性为“top，text-top，bottom，text-bottom”也可以解决，或者增加一组 CSS 代码：

```css
img {
    display: block;
}
```

## 3、设置父对象的文字大小为 0px

> 即，在#table 中 css 中添加一行：

```css
.parent {
    // img parent DOM
    font-size: 0;
}
```

可以解决问题。但这也引发了新的问题，在父对象中的文字都无法显示。就算文字部分被子对象括起来，设置子对象文字大小依然可以显示，但在 CSS 效验的时候会提示文字过小的错误。

## 4、改变父对象的属性

> 如果父对象的宽、高固定，图片大小随父对象而定，那么可以设置`overflow:hidden`来解决。

```css
.parent {
    // img parent DOM
    overflow: hidden;
}
```

## 5、设置图片的浮动属性

> 即在本例中增加一行 CSS 代码：

```css
img {
    float: left;
    clear: left;
}
```

如果要实现图文混排，这种方法是很好的选择。

## 6、取消图片标签和其父对象的最后一个结束标签之间的空格。

> 这个方法要强调下，在实际开发中该方法可能会出乱子，因为在写代码的时候为了让代码更体现语义和层次清晰，难免要通过 IDE 提供代码缩进显示，这必然会让标签和其他标签换行显示，比如说 DW 的“套用源格式”命令。

所以说这个方法可以供我们了解出现 BUG 的一种情况，具体解决方案的还得各位见招拆招了。
