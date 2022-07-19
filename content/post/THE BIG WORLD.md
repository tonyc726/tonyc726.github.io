---
title: 'THE BIG WORLD'
date: 2017-11-03T08:08:08+08:00
draft: false
url: 'the-big-world'
tags:
  - Linux
  - Shadowsocks
  - VPS
categories:
  - Hobbies
---

> 世界那么大，我想去看看！
> There is such a lot of world to see.

自从 V\*P\*N 被禁后，就折腾起了 SS(R)+BBR 的方案，先后入手了 bandwagonHOST、Digitalocean、UFOHost、[Vultr](https://www.vultr.com/?ref=7202148)...

真是验证了那句话，生命不止，折腾不惜。

总的来说，还是 Vultr 的 Tokyo 的机房最合适，别看某些自称香港 CN2 线路，但是带宽太小，价格也不便宜，虽然 ping 的结果看着不错，但是上个 Google 都卡，油管的 HD 就更加别指望了，所以，交完学费，还是给大家推荐平民路线的**[Vultr](https://www.vultr.com/?ref=7202148)**。

先来一张效果图：
![alt](https://cdn.itony.net/blog/20171103/WlT9jLPMaq5C6n-MxTp3odTt.png)

下面来说一下如何在[Vultr](https://www.vultr.com/?ref=7202148)上搭建自己的 SS(R)+BBR 服务吧。

## 搞个账号

首先你得有个[Vultr](https://www.vultr.com/?ref=7202148)账户，在以前[Vultr](https://www.vultr.com/?ref=7202148)没有支持支付宝的时候，Paypal 是最方便的支付方式，但是现在[Vultr](https://www.vultr.com/?ref=7202148)已经支持支付宝了，难道是...（此处省略 N 字）

![alt](https://cdn.itony.net/blog/20171103/l1E-1U5HqX6V7-0Ea9oFYxcs.png)

## 开台服务器

接着直接新开一个服务器，这里不得不说 Vultr 的用户体验做的真是不错，简洁、使用。
![deploy-step-1](https://cdn.itony.net/blog/20171103/tOliecv5tZVK8AAATcHZ6N0D.png)

### Server Location 选择 _**Tokyo**_

![deploy-step-2](https://cdn.itony.net/blog/20171103/u0j7zViIm8co2Mp_b2Cg0FXq.png)

### Server Type 选择 _**Centos7**_

当然，你可以选着 Ubuntu16，这 2 个系统对于后面搭建 BBR 服务最不容易出问题。
![deploy-step-3](https://cdn.itony.net/blog/20171103/YZzOEtI7OaBxN36OKdzcSHyk.png)

至于其它的请随意，不过个人建议还是开启 IPv6，以后便于扩展点其它的用途。

## 搭建 SS(R)+BBR

> 感谢[秋水逸冰](https://teddysun.com)提供了一键式的脚本方案

### 搭建 SS 服务

这里使用秋水逸冰提供了一键式的脚本，具体的可以[参考这边](https://teddysun.com/486.html)，下面就简单的说一下如何操作：

#### 使用 root 用户登录，运行以下命令：

```bash
wget --no-check-certificate -O shadowsocks-all.sh https://raw.githubusercontent.com/teddysun/shadowsocks_install/master/shadowsocks-all.sh

chmod +x shadowsocks-all.sh

./shadowsocks-all.sh 2>&1 | tee shadowsocks-all.log
```

#### 安装完成后，脚本提示如下

```bash
Congratulations, your_shadowsocks_version install completed!
Your Server IP        :your_server_ip
Your Server Port      :your_server_port
Your Password         :your_password
Your Encryption Method:your_encryption_method

Welcome to visit:https://teddysun.com/486.html
Enjoy it!
```

## 安装 BBR

> 这里还是用[秋水逸冰](https://teddysun.com)提供了一键式的脚本方案，具体[参考这里](https://teddysun.com/489.html)

> 以前还有速锐，不过现在除了破解版都不能用了，不过 Google 的 BBR 也是不错的选择。

### 使用 root 用户登录，运行以下命令：

```bash
wget --no-check-certificate https://github.com/teddysun/across/raw/master/bbr.sh

chmod +x bbr.sh

./bbr.sh
```

安装完成后，脚本会提示需要重启 VPS，输入 y 并回车后重启。

### 检查 BBR 是否安装成功

```bash
sysctl net.ipv4.tcp_available_congestion_control

# >>> net.ipv4.tcp_available_congestion_control = bbr cubic reno
```

好了，服务端的东西差不多结束了，至于如何在客户端配置我就不多说了，网上一搜一大堆，推荐配合 Chrome 的 SwitchyOmega 会更加舒服。

## 其它

这里得说一下 Vultr，如果你跟我一样，用的是 Centos7 的系统，你可能会碰到端口被禁用的问题，其实这是因为系统默认启用了`firewall`导致的，`firewall.service`默认只开启了`22`端口，所以你需要新增刚才配置的 SS 服务端口才行：

```bash
firewall-cmd --zone=public --add-port=YOUR_SERVER_PORT/tcp --permanent

# >>> success
```

记得要重启`firewalld`：

```bash
systemctl restart firewalld
```

如果你对`firewalld`感兴趣，可以看看这篇[文章](http://www.wordpressleaf.com/2016_1402.html)。
