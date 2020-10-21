---
title: "Charles小书"
date: 2017-12-21T08:08:08+08:00
draft: false
url: "charles-note"
tags:
  - Note
  - Debug Tool
categories:
  - Web Technologies
---

## 前言

日常开发中，经常会有与 App 联调的工作，除了 iOS 的 Safari 和 Android 的 adb，用来查看 console 的信息，往往还需要抓取一下 HTTP 的数据包，用来确认网络情况。

## 概述

![Charles-thumb](https://cdn.itony.net/blog/20171221/ZbhlqbjYZdSpsN1aMZFqCZKb.png)

Charles 就是一款非常优秀的跨平台网络代理工具，支持 Windows、Mac、Linux，不过最重要的是它的功能非常强大，当然这么好的工具当然不是免费的，官方需要 **_\$30 / license_**， 不过通过一些合作的代理商可能会便宜一些。

## 功能特点

- 支持[SSL 代理](https://www.charlesproxy.com/documentation/proxying/ssl-proxying/) - 以纯文本格式查看 SSL 请求和响应；
- 支持[限制带宽](https://www.charlesproxy.com/documentation/proxying/throttling/) - 模拟低速的移动网络或者网络延迟的使用场景；
- 支持 AJAX 调试 - 以树或文本的形式查看 XML 和 JSON 请求和响应；
- 支持[AMF](https://www.charlesproxy.com/documentation/additional/amf/)调试 - 以 Flash 的形式查看 Flash Remoting / Flex Remoting 消息的内容；
- 支持重复请求以便于后端开发；
- 支持编辑 Request 参数；
- 支持拦截和编辑 Request 和 Response 的内容；
- 支持检查 HTML，CSS 和 RSS 内容是否符合 W3C 标准。

## 基本介绍

如何安装本文就不累述了，[官网介绍](https://www.charlesproxy.com/documentation/installation/)的很详细了，也很简单，对照着自己的环境，下载安装包安装即可。

Charles 的界面很简洁，分为 Structure 和 Sequence 模式，这 2 种模式可以获取的信息是差不多的，不过 Sequence 模式下多了一个便捷的 Filter 输入框，可以快速的过滤出来当前需要的查看的网络请求。

![screenshot-sequence](https://cdn.itony.net/blog/20171221/nB8wxf7Ubi3q_E6T1x3s6WsA.png)

## 如何使用

Charles 启动时默认会抓取本机的网络请求，所以一开始，你可能会看到很多网络请求的信息，如果你想停止或者清理，可以用工具条上的便捷键来操作：
![screenshot-tools](https://cdn.itony.net/blog/20171221/fJNxyicceQHgSlCO_CBwRVbn.png)

下面就说说在 Mac 下如何通过 Charles 抓取移动设备上的网络请求。

主要步骤分为以下几步：

1. 设置并开启 Charles 代理；
2. 配置移动设备代理；
3. 如果需要抓取 HTTPS，则需要配置 SSL 证书；

### 设置并开启 Charles 代理

打开菜单，点击 **Proxy** 一栏，就可以看到 **Proxy Settings...** 的选项：
![screenshot-setting-proxy](https://cdn.itony.net/blog/20171221/tY6G-QgBla5XYONNANdYjDS1.png)

接着在 **Port: ** 一栏中填入代理的端口号，这里填写的是 **8888**：
![screenshot-proxy-settings](https://cdn.itony.net/blog/20171221/9wRBt3GkywN5T22fW431YA4c.png)

点击 **OK** 即可生效设置，然后再打开菜单，点击 **Help** 一栏，找到到 **Local IP Address** 获取本机当前局域网中的 IP 地址：
![screenshot-local-ip](https://cdn.itony.net/blog/20171221/amM6wJPjStXlXS4KhO4zrwc0.png)

![screenshot-local-ip-address](https://cdn.itony.net/blog/20171221/fFgcLY_HiQlHeqLsmKpS-d5c.png)

### 配置移动设备代理

以 iOS 为例，操作步骤 **设置** -> **无线局域网** -> **wifi 设置(叹号图标)** -> **HTTP 代理** -> **配置代理 -> **手动** -> **服务器(上一步获取的本机局域网 IP)** 和 **端口(上一步设置的端口号)\*\*：
![screenshot-ios-wifi-proxy](https://cdn.itony.net/blog/20171221/xnMrosw2gDOpnnOc5Okg2CKP.png)

如果一切顺利，你的本机 Charles 会有一个提示出现：

![screenshot-charles-allow-tip](https://cdn.itony.net/blog/20171221/XupFxGQqiaF40rcY-JHyaOxh.png)

选择 **Allow** 就可以代理你的 iOS 了：
![screenshot-charles-ios](https://cdn.itony.net/blog/20171221/YvKS5Zdp1JGXAsAsATh-W0I1.png)

如果你仅仅是需要 HTTP 的代理，那么上述的应该就可以满足了，不过随着 HTTPS 的推广，就需要额外的设置 SSL 证书来获取 HTTPS 的内容了。

### 配置 SSL 证书，抓取 HTTPS

如果我们在自己的服务上已经配置了 SSL，开启了 HTTPS，那么用 HTTP 的方式抓包就只能看到一堆的乱码了。

这时候，不过我们可以用 Charles 作为中间人来进行 HTTPS 的代理，用它的根证书动态签发一张证书，同时让你的浏览器收不到服务端证书的，然后 Charles 来伪装服务端的证书，你的浏览器接受 Charles 的证书用于 SSL 加密，而 Charles 仍然用目标服务器的 SSL 证书与服务端进行通信，所以 Charles 就可以用它自己的根证书来解码你发出的请求了，如果想了解的更多，可以去找找有关于中间人攻击的资料。

具体到操作其实就 3 步：

1. 在本机安装 Charles 根证书；
2. 在客户端安装 Charles 提供的证书；
3. 开启 Charles 的 SSL Proxying；

#### 在本机安装 Charles 根证书

Charles 提供了非常简单的方式来安装，你只需要打开菜单，点击 **Help** 一栏，选中 **SSL Proxying** 就可以看到 **Install Charles Root Certificate** 的选项：
![screenshot-install-charles-root-certificate](https://cdn.itony.net/blog/20171221/HkWIPLTkLD5XjE3nz0fW0pRM.png)

点击安装以后，会打开本地的 **Keychain Access** 提示是否添加，选择 **Add** 即可。
![screenshot-add-charles-root-certificate](https://cdn.itony.net/blog/20171221/EDiliS8QmOtE_MprKZvElMIv.png)

由于 Charles 的提供的 SSL 根证书是它自己颁发的，并未经过权威机构的认证，所以，有时候会经常提示证书的安全性问题，这个时候，你可以在 **Keychain Access** 中找到这个证书，并在 **Trust** 一项中选择 **Always Trust**即可：
![screenshot-keychain-access-trust](https://cdn.itony.net/blog/20171221/_kRgPcKxD8TcWPoyaU6XEERI.png)

#### 在客户端安装 Charles 提供的证书

打开菜单，点击 **Help** 一栏，选中 **SSL Proxying** 就可以看到 **Install Charles Root Certificate on a Mobile Device or Remote Browser** 的选项，它会提示你用需要连接的设备去访问 `chls.pro/ssl` 这个 URL：
![screenshot-install-charles-root-certificate-client](https://cdn.itony.net/blog/20171221/aI_gnmQc3morBWWdA1XJSgUk.png)

客户端在访问 `chls.pro/ssl`，会得到一个证书文件，不论是 iOS 还是 Android，都会进入证书的添加环节，下面以 iOS 为例：
![screenshot-client-ssl-installing](https://cdn.itony.net/blog/20171221/XT7kuUvCrW3zF2twNPzF98dS.png)

这里需要注意一点，iOS 10.3 以后的系统，需要在 **证书信任设置** 中启用才行（[Charles-ssl-certificates](https://www.charlesproxy.com/documentation/using-charles/ssl-certificates)），操作步骤 **设置** -> **通用** -> **关于本机** -> **证书信任设置** -> **开启对应证书**：
![screenshot-client-ssl-trusted](https://cdn.itony.net/blog/20171221/-reJd37URcALSCWHNsIaqL7g.png)

#### 开启 Charles 的 SSL Proxying

打开 Charles 的菜单，点击 **Proxy** 一栏，就可以看到 **SSL Proxy Settings...** 的选项，然后增加一项规则即可：
![screenshot-charles-ssl-proxy-settings](https://cdn.itony.net/blog/20171221/1LeqY-6F6Rp-mbpHg_ZN0F4A.png)

好了，本文就先介绍到这，最多也就是操作 6 步，你就可以通过 Charles 截取 HTTPS 的数据包了，当然 Charles 的功能远不止如此，更多的惊喜，你可以慢慢的去挖掘。

---

### 2018.04.23

Q: Android 提示 **键入凭据存储的密码** ？

A: 检查是否设置了锁屏密码，如果没有需要先设置锁屏密码，再次安装`chls.pro/ssl`下载的证书，输入锁屏密码即可；

---

## 参考

- [charlesproxy](https://www.charlesproxy.com/documentation/)
- [细说 Charles 配置 HTTPS 代理的乱码问题](https://malcolmyu.github.io/2017/02/26/Dive-into-Charles-HTTPS-Proxying/)
- [Charles 抓包配置流程(Charles4.1.2 iOS)](http://www.jianshu.com/p/a5265f35980a)
