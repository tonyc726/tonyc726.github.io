---
title: '搭建私有npm仓库'
date: 2017-12-20T08:08:08+08:00
draft: false
url: 'npm-repository-registry'
tags:
  - Node.js
  - NPM
categories:
  - Hobbies
---

在开发中，有时需要用到一些私有库，这些不太能够发布到公有仓库的，在使用`npm`和`yarn`安装的时候，往往是从私有 git 仓库来拉取，但是这样的话，就不能使用语义化版本号的方式来控制版本了。

为了解决这个事情，最好的方式就是用私有 npm 仓库，npmjs 官方倒是有提供这个服务，但是这个价格（如果你是土豪，这个倒也是不错的选择）和速度，却令人望而止步啊！

![npmjs-pricing](https://cdn.itony.net/blog/20171220/0msbTJXerJp1T5w1pFFKn8gi.png)

没办法，还是自己折腾吧，首先考虑到的就是用 cnpm 来自己搞一个，毕竟有阿里在维护，而且功能齐全，下面是 cnpm 官方的线路图：

![cnpm-relation](https://cdn.itony.net/blog/20171220/Q3KNjKR5smGxkS68lF_omBte.png)

不过想搭建 cnpm 的私有库，需要依赖 Node.js 和 MySQL，不是特别轻便，所以就想到了之前有过一眼之缘的[sinopia](https://github.com/rlidwka/sinopia)，可惜这个库有点年代了，最后找到一个 fork 出去的项目叫做[verdaccio](https://github.com/verdaccio/verdaccio)，它做的风生水起，而且用起来特别简单。

![verdaccio-logo](https://cdn.itony.net/blog/20180531/FsgoFeW9QMxjI3E-NQVEVoeJ-DX_.png)

安装的话就一步：

```bash
$ npm install --global verdaccio
```

verdaccio 在文件系统上存储数据，没有额外依赖，而且提供了一套默认配置，我们可以直接启动仓储服务，不过最好事先将需要的文件及文件夹创建好：

```bash
# 缓存包的存放目录
$ mkdir -p storage

# 配置文件
$ touch config.yaml

# 储存auth信息的文件
$ touch htpasswd

# verdaccio的日志文件
$ touch verdaccio.log
```

接着来修改一下[默认配置](https://github.com/verdaccio/verdaccio/blob/master/wiki/config.md)文件：

```yaml
# 设置托管或缓存包的存放目录
storage: ./storage
# 权限控制
auth:
  # 默认使用htpasswd做权限控制
  htpasswd:
    # 制定 htpasswd 文件路径，htpasswd 中存储者用户名和加密过的秘钥
    file: ./htpasswd
    # 最多允许注册用户数
    max_users: 1000
# 备用仓库，如果 verdaccio 找不到，就会用到这里的仓储
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
  yarnjs:
    url: https://registry.yarnpkg.com/
  cnpmjs:
    url: https://registry.npm.taobao.org/
# 包访问或发布的规则
packages:
  '@*/*':
    access: $all
    publish: $authenticated
    proxy: npmjs
  '**':
    access: $all
    proxy: npmjs
# 日志配置
logs:
  - { type: file, path: verdaccio.log, level: info }
# 开启web模式
web:
  enable: true
```

好了，一切就绪，使用`nohup`在后台启动一下吧：

```bash
$ nohup verdaccio &
```

打开 http://localhost:4873 ，你就可以看到下面这个界面了（4873 是默认端口）：

![verdaccio-home](https://cdn.itony.net/blog/20171220/qTY-1Ee2URUk5M247rHSRgdm.png)

verdaccio 默认 web 界面有最基础的提示，如果要注册这个私有仓库需要运行：

```bash
$ npm adduser --register http://localhost:4873
```

如果需要发布，则需要运行：

```bash
$ npm publish --register http://localhost:4873
```

最后，如果你需要指定域名或者使用 https，verdaccio 就有配置项可以使用，当然你也可以像我一样用 Nginx 做代理，另外 verdaccio 可以使用不同的 plugin 来扩展功能，不亚于 cnpm，不过开箱即用的体验做的确实不错。

---

## 补充说明

上面只不过是简单的说明了一下，实际在运用的时候，尤其是写一个依赖于现有 npm 仓库中的包，比如说你用到了`lodash`，在安装私有库的时候会遇到`403`的问题，提示`unregistered users are not allowed to access package lodash`。

此时，需要修改`packages`中的权限，具体的可以参考[verdaccio - Package Access](https://www.verdaccio.org/docs/en/packages.html)，参考如下：

```yaml
packages:
  '@*/*':
    access: $all
    publish: $authenticated
    proxy: npmjs
  # 这里的'**'表示所有npm资源
  '**':
    # access 表示可访问的权限，如果没有设置all或者@all，就会报403错误
    access: $all
    proxy: npmjs
```

---

## 参考

- [verdaccio](https://github.com/verdaccio/verdaccio) - A lightweight private npm proxy registry (sinopia fork)
- [Sinopia | 从零开始搭建 npm 仓库](https://zhuanlan.zhihu.com/p/20892656)
- [使用 verdaccio 搭建 npm 私有仓储](https://blog.sigoden.com/verdaccio--private-npm-registry/#scope-%E5%8C%85)
