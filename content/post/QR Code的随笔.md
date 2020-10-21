---
title: 'QR Code的随笔'
date: 2017-07-26T08:08:08+08:00
draft: false
url: 'qrcode-note'
tags:
  - QR Code
categories:
  - Hobbies
---

> 封面图来自于[qr-code-generator](http://www.qr-code-generator.com/)

或许在 10 年多你都没有听说过二维码，不过现在，在这个信息化的社会中，仿佛它已经无处不在了，下面就简单的介绍一下：

## 什么是二维码？

[QR 图码](https://zh.wikipedia.org/wiki/QR%E7%A2%BC)（全称为快速响应矩阵图码；英语：Quick Response Code）是二维条码的一种，于 1994 年由[日本 DENSO WAVE 公司](http://www.qrcode.com/zh/)发明。

一般呈正方形，常见的是黑白两色。在 3 个角落，印有较小，像“回”字的正方图案。这 3 个是帮助解码软件定位的图案，用户不需要对准，无论以任何角度扫描，数据仍然可以正确被读取。

![QR_Code_Structure](https://cdn.itony.net/blog/20171016/YEM9GNq17YBAiWi3DqoTQxVC.png)

### 存储容量

QR 码设有 1 到 40 的不同版本（种类)，每个版本都具备固有的码元结构(码元数)。（码元是指构成 QR 码的方形黑白点。)

“码元结构”是指二维码中的码元数。从版本 1(21 码元 ×21 码元)开始，在纵向和横向各自以 4 码元为单位递增，一直到版本 40(177 码元 ×177 码元)，目前版本 40 可以存储中文汉字最多 984 字符（采用 UTF-8）。

### 容错能力

QR 码有容错能力，QR 码图形如果有破损，仍然可以被机器读取内容，最高可以到 7%~30%面积破损仍可被读取，理所当然，容错率愈高，QR 码图形面积愈大，所以一般折衷使用 15%容错能力。

- L 档次，约 7%的字码可被修正
- M 档次，约 15%的字码可被修正
- Q 档次，约 25%的字码可被修正
- H 档次，约 30%的字码可被修正

结合存储容量，两者有对应的关系大致如下：
![alt](https://cdn.itony.net/blog/20171016/iYfAmbcSBnnWYtOB_VsyXa_g.png)

## 如何生成二维码？

关于具体的编码原理，本文就不细说了，如果想了解的，可以去看一下这篇文章[《二维码的生成细节和原理》](http://coolshell.cn/articles/10590.html)，写的非常详细，况且如今，已经有很多的在线服务就能方便的帮你生成二维码，例如:

- [qr-code-generator](http://www.qr-code-generator.com/)
- [草料](http://cli.im/)

也有很多可以运行在本地的服务，比如说:

- 基于 Python 的[QR-Code](https://github.com/sylnsfar/qrcode)
- 基于 Nodejs 的[node-qrcode](https://github.com/soldair/node-qrcode)
- 基于 C 的[libqrencode](https://fukuchi.org/works/qrencode/index.html)

下面就简单说一下[libqrencode](https://fukuchi.org/works/qrencode/index.html)：

如果你用 MAC，那么安装就很简单了直接运行`brew install qrencode`即可，完了以后，就可以调用`qrencode`的命令模式了，具体的文档，你可以通过`man qrencode`查阅，下面就简单句两个例子：

```bash
# 生成指定字符串的二维码
qrencode -o ./qrcode.png 'https://itony.net/qrcode-note'

# 生成无边框指定字符串的二维码
qrencode -o ./qrcode.png 'https://itony.net/qrcode-note' -m 0

# 生成透明背景指定字符串的二维码
qrencode -o ./qrcode.png 'https://itony.net/qrcode-note' --background ffffff00

# 自定义图片尺寸的
qrencode -o ./qrcode.png 'https://itony.net/qrcode-note' -s 6
```

以上就是最简单的例子了，仅供参考。

### 参考链接

1. https://zh.wikipedia.org/wiki/QR%E7%A2%BC
2. http://www.qrcode.com/zh/
