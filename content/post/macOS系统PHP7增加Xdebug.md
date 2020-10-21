---
title: "macOS系统PHP7增加Xdebug"
date: 2018-03-19T08:08:08+08:00
draft: false
url: "macos-php"
tags:
  - PHP
  - BackEnd
  - Debug Tool
categories:
  - Web Technologies
---

Apple 在发布 macOS High Sierra 后，系统也终于自带了 php v7.1，相比于之前，如果想使用 php7，还得额外想办法( **[Homebrew](https://brew.sh/)** 或者 **[php-osx](https://php-osx.liip.ch)** )而言着实方便了不少。

但是，系统自带的 PHP 只有基础的配置，如果想做 PHP 开发，Xdebug 还是必须的，以下就总结一下如何在 macOS High Sierra 中为系统自带的 PHP 增加 Xdebug 模块。

## 基础环境( macOS 及 PHP 信息)

- macOS High Sierra: v10.13.3
- PHP: v7.1.7

## 安装 Xdebug

[Xdebug 官网安装文档](https://xdebug.org/docs/install)中有 MAC 推荐的方式，鉴于系统自带的是 PHP 是**v7.1.7**，所以在选择的时候，需要选择**php71-xdebug**这个安装包。

![brew-info-php-xdebug](https://cdn.itony.net/blog/20180322/FvuU2gIgeUOKULV883uLjtiiuyrJ.jpg)

另外由于 brew 中的**php71-xdebug**依赖于**php71**的，所以建议加上`--without-homebrew-php`这个参数，这样的话 brew 就会忽略安装**php71**。

```bash
brew install php71-xdebug --without-homebrew-php
```

不过这个时候，或许你会碰到下面这样的报错：

```bash
phpize
grep: /usr/include/php/main/php.h: No such file or directory
grep: /usr/include/php/Zend/zend_modules.h: No such file or directory
grep: /usr/include/php/Zend/zend_extensions.h: No such file or directory
Configuring for:
PHP Api Version:
Zend Module Api No:
Zend Extension Api No:
```

提示缺失依赖，从而导致`phpize`无法正常工作，`phpize`是用来准备 PHP 扩展库的编译环境的，理论上系统自带的 PHP 应该是有`phpize`的，但是没有在`/usr/include/php/*`里面找到它需要的模块，并且检索`/usr/include`时发现这个目录根本不存在。

Google 了一圈，解决问题，就需要在`/usr/include`中补全相关的内容，在 OSX v10.10 以前系统，需要手动做软链来解决：

```bash
sudo ln -s /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/usr/include /usr/include
```

但是 v10.11 以后的系统重写了安全策略，所以会遇到权限问题(`sudo`也不行)：

```bash
ln: /usr/include: Operation not permitted
```

不过好在 Apple 为开发人员准备了 Xcode，这是一个很强大的工具，但是体积也很大(下载安装有点慢)，而一般我们只需要它提供的**Command Line Tools**就够了，上面的问题，其实只要安装**Command Line Tools**就可以解决：

```bash
xcode-select --install
```

接下来，跟着提示做，安装、同意协议...
![xcode-install-confirm](https://cdn.itony.net/blog/20180322/Fu1ss6OFpxdmw4YzmQZX1m7aEG1c.jpg)

等待安装结束以后，再用 **brew** 来安装 **php71-xdebug**:

```bash
brew install php71-xdebug --without-homebrew-php
```

一切结束以后，brew 会给出提示：

```bash
To finish installing xdebug for PHP 7.1:
  * /usr/local/etc/php/7.1/conf.d/ext-xdebug.ini was created,
    do not forget to remove it upon extension removal.
  * Validate installation via one of the following methods:
  *
  * Using PHP from a webserver:
  * - Restart your webserver.
  * - Write a PHP page that calls "phpinfo();"
  * - Load it in a browser and look for the info on the xdebug module.
  * - If you see it, you have been successful!
  *
  * Using PHP from the command line:
  * - Run `php -i "(command-line 'phpinfo()')"`
  * - Look for the info on the xdebug module.
  * - If you see it, you have been successful!
```

## 开启 PHP 的 Xdebug

经过上面步骤，系统里面是有 Xdebug 了，但是在`php.ini`配置文件中不一定有，因此需要手动添加 Xdebug 的配置项：

```
[xdebug]
zend_extension="/usr/local/opt/php71-xdebug/xdebug.so"
xdebug.remote_enable = 1
xdebug.remote_autostart = 1
xdebug.remote_connect_back = 1
xdebug.remote_port = 9000
xdebug.scream = 0
xdebug.show_local_vars = 1
```

然后就是重启`php-fpm`：

```bash
# 关闭php-fpm
sudo killall php-fpm

# 启动php-fpm
sudo php-fpm
```

运行`php -i "(command-line 'phpinfo()')" | grep xdebug`后，你就可以看到关于 Xdebug 的配置内容了：

```bash
xdebug
...
xdebug.remote_autostart => On => On
xdebug.remote_connect_back => On => On
xdebug.remote_cookie_expire_time => 3600 => 3600
xdebug.remote_enable => On => On
xdebug.remote_handler => dbgp => dbgp
xdebug.remote_host => localhost => localhost
xdebug.remote_log => no value => no value
xdebug.remote_mode => req => req
xdebug.remote_port => 9000 => 9000
xdebug.remote_timeout => 200 => 200
xdebug.scream => Off => Off
...
```

## Visual Studio Code - PHP Debug

VSCode 是目前最流行的开发工具之一，虽然轻量，但是对标各类 IDE 毫不逊色，微软良心之作，通过安装不同的插件可以扩展它的能力，其中有一款 **[PHP Debug](https://github.com/felixfbecker/vscode-php-debug)** 的插件，可以作为 Xdebug 的桥梁，方便直接通过 Xdebug 调试 PHP，官方的描述十分贴切：

> PHP Debug Adapter for Visual Studio Code

官网的指导也写的相当不错：

> 1. [Install XDebug](https://xdebug.org/docs/install) > **_I highly recommend you make a simple `test.php` file, put a `phpinfo();` statement in there, then copy the output and paste it into the [XDebug installation wizard](https://xdebug.org/wizard.php). It will analyze it and give you tailored installation instructions for your environment._**
>    In short:
>
> - On Windows: [Download](https://xdebug.org/download.php) the appropiate precompiled DLL for your PHP version, architecture (64/32 Bit), thread safety (TS/NTS) and Visual Studio compiler version and place it in your PHP extension folder.
> - On Linux: Either download the source code as a tarball or [clone it with git](https://xdebug.org/docs/install#source), then [compile it](https://xdebug.org/docs/install#compile).
>
> 2. [Configure PHP to use XDebug](https://xdebug.org/docs/install#configure-php) by adding `zend_extension=path/to/xdebug` to your php.ini.
>    The path of your php.ini is shown in your `phpinfo()` output under "Loaded Configuration File".
> 3. Enable remote debugging in your php.ini:
>
> ```ini
> [XDebug]
> xdebug.remote_enable = 1
> xdebug.remote_autostart = 1
> ```
>
> There are other ways to tell XDebug to connect to a remote debugger than `remote_autostart`, like cookies, query parameters or browser extensions. I recommend `remote_autostart` because it "just works". There are also a variety of other options, like the port (by default 9000), please see the [XDebug documentation on remote debugging](https://xdebug.org/docs/remote#starting) for more information. 4. If you are doing web development, don't forget to restart your webserver to reload the settings 5. Verify your installation by checking your `phpinfo()` output for an XDebug section.

这里需要注意的是它推荐开启 Xdebug 配置项中的`remote_autostart`这一项。

好了，经过上面的操作，你应该可以跟 Demo 里面一样在 VSCode 中调试 PHP 了。
![vscode-php-xdebug-demo](https://cdn.itony.net/blog/20180322/FgL4GXON1KgZuHfv5nPFygV_EYRh.gif)
