---
title: '基于阿里云ECS的Centos7搭建Ghost'
date: 2017-07-05T08:08:08+08:00
draft: false
url: 'aliyun-ecs-ghost'
tags:
  - Linux
  - VPS
  - Ghost
categories:
  - Hobbies
---

本文属于一个入门级的教程，简单记录如何基于[阿里云 ECS](https://www.aliyun.com)的 CentOS7 系统，用[Ghost](https://ghost.org/)搭建一个博客系统。

首先，来了解一下，整个环节下来，需要用到哪些东西：

- 一个完成 A 记录解析设置的域名（建议做好 ICP 备案），例如本站的域名[itony.net](https://www.itony.net)；
- 使用 [MySQL](https://www.mysql.com/) 做数据库服务；
- 使用 [Nginx](https://nginx.org/) 做网页服务器（Ghost 的代理服务）；
- 使用 [NodeJS](https://nodejs.org) 做后端服务；
- [Ghost](https://ghost.org/)一个开源的博客系统；

一切准备就绪，开始使用`root`用户的初始化的密码远程登录入系统：

```bash
# xxx.xxx.xxx.xxx 为你的公网IP，可以在ECS控制台中找到
ssh root@xxx.xxx.xxx.xxx
```

查看一下系统信息：

```bash
cat /etc/redhat-release
# >>> CentOS Linux release 7.3.1611 (Core)
```

更新一下系统，安装一些基础工具：

```bash
# 阿里云的centos已经优化了yum的源，你也可以自行修改
yum update -y && yum upgrage -y && yum clean all

# curl, wget都是方便后边的下载
# vim作为一个老牌Linux文本编辑工具，你值得拥有
yum install curl wget vim -y

# 更新全系统的vim配置
curl https://raw.githubusercontent.com/tonyc726/vim-for-server/master/vimrc > /etc/vimrc
```

接下来，就直接动手来安装 Ghost 需要用到的系统环境吧，由于 CentOS7 已经不带 Mysql 数据库了（默认的数据库是 MariaDB，Mysql 的一个分支），所以需要先安裝 MySQL Repository（具体的版本号，可以参考 https://dev.mysql.com/downloads/repo/yum/）:

```bash
# 安裝 MySQL Repository
rpm -Uvh https://dev.mysql.com/get/mysql57-community-release-el7-11.noarch.rpm

# 安装MySQL数据库的服务器社区稳定版
yum install mysql-community-server -y

# 启动MySQL服务
systemctl start mysqld.service

# 设置随系统自启动
systemctl enable mysqld.service
```

安装完成以后，运行`mysql_secure_installation`，初始化 MySQL 的一些配置，不过由于 MySQL5.7 默认会初始化 Root 用户的密码，所以在执行之前需要获取这个初始密码：

```
grep "password" /var/log/mysqld.log
```

拿到密码以后，就可以用 root 账户进入 MySQL 了，然后来创建 Ghost 需要的用户及数据库：

```
# 运行以后输入刚才拿到的密码
mysql -uroot -p

# 添加新数据库blog，后面Ghost会用到
CREATE DATABASE blog;

# 添加新用户ghost
# 请将password替换为你需要的密码
CREATE USER ghost IDENTIFIED BY 'password';

# 授予ghost用户在blog数据库上的所有权限
# password就是你刚才创建ghost账户时设置的密码
GRANT ALL PRIVILEGES ON blog.* TO 'ghost'@'localhost' IDENTIFIED BY 'password';

# 刷新权限
# 当执行过GRANT，CREATE USER，REVOKE命令之后，必须要执行刷新权限才能生效
FLUSH PRIVILEGES;

# Ctrl+D 退出
```

好了，以上就是 MySQL 部分，接下来安装 NodeJS：

```bash
# 推荐使用以下方式安装NodeJS
# 本系统使用V6稳定版，如需其它版本，你可以自行调整
curl -sL https://rpm.nodesource.com/setup_6.x | sudo -E bash -
# 安装NodeJS及其依赖包
yum install gcc-c++ make nodejs -y

# NodeJS安装以后，默认已经自带的NPM
# 不过npm之前一直被吐槽，建议升级最新版或者用yarn代替
# 升级npm至最新版本(^v5.0.4)
npm install npm@latest -g
# 安装yarn代替（推荐）
curl --silent --location https://rpm.nodesource.com/setup_6.x | bash -
yum install yarn -y

# 测试一下
node -v
# >>> v6.11.0
npm -v
# >>> v5.1.0
yarn -v
# >>> v0.27.5
```

这里有个坑，如果直接使用`yum install nodejs -y`也是可以安装**NodeJS**的，不过[nodesource](https://github.com/nodesource/distributions)维护的更加好，而且可以升级**npm**。

如果你已经看到了最后输出的信息，那么久代表**NodeJS**已经就绪了，接下来安装**Nginx**并做一些简单的配置：

```bash
# 直接安装即可
yum install nginx -y

# 立即启动
systemctl start nginx

# 设置开机自启动
systemctl enable nginx
```

现在，打开你的浏览器，输入你的公网 IP，不出意外，你就已经可以看到一个**Nginx**的欢迎页面了。

不过，出于后期的扩展或者安全性考虑，我们需要为系统创建一个名为`www`的用户，专门用于管理网站：

```bash
# 添加新用户，默认会创建一个名为www的用户组
adduser www

# 设置密码(请记录下你的密码，以后需要用到)
passwd www

# 分配Root权限 - 让我们新创建的www用户拥有Root用户的权限
gpasswd -a www wheel

# 将nginx用户添加入www的用户组，方便后期的权限控制
usermod -a -G nginx,www nginx
```

以上就是 Ghost 需要用到的基础系统了，下面就来安装 Ghost，新开一个 Terminal 窗口，用 www 账户登录：

```bash
ssh www@xxx.xxx.xxx.xxx
```

然后下载 Ghost 最新的代码，这里我选用的最新的稳定版`v0.11.9`:

```bash
# 下载Ghost最新的稳定版
curl -L https://ghost.org/zip/ghost-latest.zip -o ghost.zip

# 解压
unzip -uo ghost.zip -d ghost

# 进入Ghost的目录并安装生产环境的依赖
cd ghost && npm install --production

# 修改Ghost的config，修改数据库配置
vim config.js
```

完整的`config.js`配置如下：

```javascript
var path = require('path'),
  config;

config = {
  production: {
    url: 'https://www.itony.net',
    mail: {},
    database: {
      client: 'mysql',
      connection: {
        host: '127.0.0.1',
        user: 'ghost', //用户名
        password: 'password', //ghost的密码
        database: 'blog', //数据库名
        charset: 'utf8',
      },
      debug: false,
    },

    server: {
      host: '127.0.0.1',
      port: '2368',
    },
  },
};

module.exports = config;
```

运行一下`npm start --production`，如果看到下面的提示，证明你已经完成 80%了：

```
Ghost is running in production...
Your blog is now available on https://www.itony.net
Ctrl+C to shut down
```

目前你是开着远程连接到你的服务器，一旦你把窗口关闭了，那么你刚才起的`npm start --production`可就悲剧了，如何避免呢，这时候我们就需要一个能帮我们在后台稳定运行 node 服务的工具了，目前比较火热的要数[PM2](http://pm2.keymetrics.io/)了：

```bash
# 全局安装PM2
yarn global add pm2 --prefix /usr/local

# 用PM2来启动Ghost的node服务
# 先切到ghost的目录，然后再运行
NODE_ENV=production pm2 start index.js --name "blog"

# 检查运行结果
pm2 show blog
```

OK，这时候已经是 90%的进度了，不过你去浏览器里面访问可还不行，因为你服务起的是`2368`的端口，而你直接访问`https://www.itony.net`就相当于访问`https://www.itony.net:80`也就是`80`端口，而`80`端口现在已经被 Nginx 使用了，所以我们还得做最后一步，使用 Nginx 代理你的`2368`：

```
# 进入Nginx的目录，如果你是按照之前的流程走的，那么应该是在/etc/nginx
cd /etc/nginx

# 用sudo权限编辑nginx.conf
sudo vim nginx.conf
```

在`http`那一层中加入 Ghost 的 server 配置：

```bash
# 由于这里是入门级的教程，所以不做vhost的处理了，想了解Nginx的可以自行去学习

http {
    ...
    server {
        listen       80;
        listen       [::]:80;
        server_name  itony.net www.itony.net;

        location / {
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   Host      $http_host;
            proxy_set_header   X-Forwarded-Proto $scheme;
            proxy_pass         http://127.0.0.1:2368;
        }
    }
}
```

检查 Nginx 的配置，并重启：

```bash
# 检查Nginx语法是否正确
sudo nginx -t

# 如果正确的话，重启Nginx服务
systemctl restart nginx.service
```

好了，如果以上都没有问题，你应该已经可以在浏览器里面访问你的域名了。
