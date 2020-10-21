---
title: 'SS助力ECS'
date: 2017-11-05T08:08:08+08:00
draft: false
url: 'shadowsocks-ecs'
tags:
  - Linux
  - Shadowsocks
categories:
  - Hobbies
---

有时候需要在 ECS 上访问 Github 的服务，那个速度，真是惨不忍睹啊，正好前几天通过[Vultr 搞了一个私人的 SS 服务](https://itony.net/post/the-big-world.html)，上个 Google、看个油管什么的再也没问题了，于是动了在 ECS 上部署 SS Client 的念头。

说动手就动手，SS Client 安装最方便的就是通过`pip`了，简简单单的使用：

```bash
pip install shadowsocks
```

就搞定了，不过这边有个坑，如果你使用的加密协议是`aes-256-gcm`的话，你就需要用下面这种方式来升级一下才能支持`aes-256-gcm`（[方法来源](https://github.com/shadowsocks/shadowsocks/issues/986)）：

```bash
pip install --upgrade git+https://github.com/shadowsocks/shadowsocks.git@master
```

然后创建 shadowsocks 的配置文件`/etc/sslocal.json`，下面是配置模板：

```json
{
  "server": "YOUR_SS_SERVER_IP",
  "server_port": "YOUR_SS_SERVER_PORT",
  "local_address": "127.0.0.1",
  "local_port": YOUR_LOCAL_PORT,
  "password": "YOUR_SS_SERVER_PASSWORD",
  "timeout": 100,
  "method": "aes-256-gcm",
  "fast_open": false
}
```

接着就让`sslocal`依据配置文件`/etc/sslocal.json`在后台运行就可以了，这里用到了[`nohup`](https://www.ibm.com/support/knowledgecenter/zh/ssw_aix_61/com.ibm.aix.cmds4/nohup.htm)，同时将输出清理掉：

```bash
nohup sslocal -c /etc/sslocal.json /dev/null 2>&1 &
```

为了方便起见，还可以在开机启动文件`/etc/rc.local`中加入以上内容，方便以后重启以后自动开启`sslocal`。

好了，开启`sslocal`后，运行一下：

```bash
curl --socks5 127.0.0.1:YOUR_LOCAL_PORT ipinfo.io
```

如果一切正常，你可以看到包含你 SS Server IP 的运行结果：

```bash
{
  "ip": "YOUR_SS_SERVER_IP",
  "hostname": "YOUR_SS_SERVER_HOSTNAME",
  ...
}#
```

不过 SS 走的是 Socket5，平时我们用到最多的还是 HTTP(s)，这时候需要再安装一个[Privoxy](https://www.privoxy.org)用于将 Socket5 转到 HTTP(s)上。

一般`yum`中会自带 Privoxy，如果没有的话，你可以先安装一下[EPEL 扩展](https://fedoraproject.org/wiki/EPEL/zh-cn)：

```bash
yum install epel-release -y
```

然后再安装 Privoxy:

```bash
yum install privoxy -y
```

修改 Privoxy 配置文件`/etc/privoxy/config`中的相关内容，增加转发规则：

```shell
# 注意别忘了结尾那个.
forward-socks5t / 127.0.0.1:YOUR_LOCAL_PORT .
```

运行 Privoxy，并将它列入开机启动项：

```bash
systemctl start privoxy
systemctl enable privoxy
```

最后别忘了，在`.bashrc`或者`.zshrc`中加入`http_proxy`与`https_proxy`的设置：

```shell
export http_proxy=http://127.0.0.1:8118
export https_proxy=http://127.0.0.1:8118
```

`8118`是 Privoxy 默认的监听端口，你也可以自行设定。

### 参考资料

1. https://github.com/shadowsocks/shadowsocks/issues/986
2. https://brickyang.github.io/2017/01/14/CentOS-7-%E5%AE%89%E8%A3%85-Shadowsocks-%E5%AE%A2%E6%88%B7%E7%AB%AF/
3. https://www.loyalsoldier.me/fuck-the-gfw-with-my-own-shadowsocks-server/
