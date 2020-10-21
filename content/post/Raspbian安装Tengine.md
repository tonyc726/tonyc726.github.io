---
title: 'Raspbian安装Tengine'
date: 2017-07-04T08:08:08+08:00
draft: false
url: 'raspbian-install-tengine'
tags:
  - Raspberry Pi
  - Raspbian
  - Linux
categories:
  - Hobbies
---

很早之前买了一个**Raspberry Pi 3**，之前在上面玩过爬虫，搭过简单的 web 服务，不过一直用的是 Nginx，在以前用 Seajs 的时候，用过基于 [Tengine](http://tengine.taobao.org/) 的 Combo 服务，所以就想着在 Pi 上试试看，下面就简单的记录一下，如何在 Raspbian 系统上安装 [Tengine](http://tengine.taobao.org/)：

## 安装系统依赖包

```bash
# 解决PERL，需要安装以下依赖包
sudo apt-get install libpcre3 libpcre3-dev -y

# 解决OpenSSL，需要安装以下依赖包
sudo apt-get install libssl-dev -y

# 其它可能需要的，看具体的提示
sudo apt-get install gcc libpcre3 libpcre3-dev zlib1g zlib1g-dev openssl libcurl4-openssl-dev -y
```

## 下载、解压、编译、安装

```bash
# 下载
wget http://tengine.taobao.org/download/tengine-2.2.0.tar.gz

# 解压
tar zxvf tengine-2.2.0.tar.gz

# 编译、安装
cd tengine-2.2.0 && \
sudo ./configure && \
sudo make && \
sudo make install
```

## 安装结果

```shell
nginx path prefix: "/usr/local/nginx"
nginx binary file: "/usr/local/nginx/sbin/nginx"
nginx configuration prefix: "/usr/local/nginx/conf"
nginx configuration file: "/usr/local/nginx/conf/nginx.conf"
nginx pid file: "/usr/local/nginx/logs/nginx.pid"
nginx error log file: "/usr/local/nginx/logs/error.log"
nginx http access log file: "/usr/local/nginx/logs/access.log"
nginx http client request body temporary files: "client_body_temp"
nginx dso module path: "/usr/local/nginx/modules/"
nginx http proxy temporary files: "proxy_temp"
nginx http fastcgi temporary files: "fastcgi_temp"
nginx http uwsgi temporary files: "uwsgi_temp"
nginx http scgi temporary files: "scgi_temp"
```
