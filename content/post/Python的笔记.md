---
title: 'Python的笔记'
date: 2017-07-27T08:08:08+08:00
draft: false
url: 'python-note'
tags:
  - Note
  - Python
categories:
  - Hobbies
---

> Life is short, you need Python
> -- [Bruce Eckel](http://sebsauvage.net/python/)

日常开发中难免会与 Python 打交道，本文记录一些平时遇到的问题及解决方案：

## 升级`pip`所有安装包

这个也算是[stackoverflow](https://stackoverflow.com/questions/2720014/upgrading-all-packages-with-pip)上一个经典问题了，下面就贴一下具体代码：

```bash
pip freeze --local | grep -v '^\-e' | cut -d = -f 1  | xargs -n1 pip install -U
```

另外，Github 上  有个[issue](https://github.com/pypa/pip/issues/59)专门做了需不需要为`pip`添加`upgrade`和`upgrade-all`的讨论，有兴趣的可以去参与一下。

---

## 升级`pyxattr`遇到无法找到`attr/xattr.h`的问题

具体报错信息如下：

```bash
# centos7 / Python 2.7.5 / pip 9.0.1

gcc -pthread -fno-strict-aliasing -O2 -g -pipe -Wall -Wp,-D_FORTIFY_SOURCE=2 -fexceptions -fstack-protector-strong --param=ssp-buffer-size=4 -grecord-gcc-switches -m64 -mtune=generic -D_GNU_SOURCE -fPIC -fwrapv -DNDEBUG -O2 -g -pipe -Wall -Wp,-D_FORTIFY_SOURCE=2 -fexceptions -fstack-protector-strong --param=ssp-buffer-size=4 -grecord-gcc-switches -m64 -mtune=generic -D_GNU_SOURCE -fPIC -fwrapv -fPIC -D_XATTR_VERSION="0.6.0" -D_XATTR_AUTHOR="Iustin Pop" -D_XATTR_EMAIL="iustin@k1024.org" -I/usr/include/python2.7 -c xattr.c -o build/temp.linux-x86_64-2.7/xattr.o -Wall -Werror -Wsign-compare
    xattr.c:29:24: fatal error: attr/xattr.h: No such file or directory
     #include <attr/xattr.h>
                            ^
    compilation terminated.
    error: command 'gcc' failed with exit status 1
```

如果你也碰到了上面的问题，[解决方案](https://github.com/jay-johnson/sci-pype#coming-soon-and-known-issues)很简单，安装一下对应的系统包就行了：

```bash
# Install RPM:
sudo yum install -y libattr-devel

# Install Deb:
sudo apt-get install -y libattr1-dev
```

---

## 升级`pygpgme`遇到无法找到`gpgme.h`的问题

具体报错信息如下：

```bash
# centos6 / Python 2.6.6 / pip 9.0.1

Running setup.py install for pygpgme ... error
    Complete output from command /usr/bin/python -u -c "import setuptools, tokenize;__file__='/tmp/pip-build-iYzzHD/pygpgme/setup.py';f=getattr(tokenize, 'open', open)(__file__);code=f.read().replace('\r\n', '\n');f.close();exec(compile(code, __file__, 'exec'))" install --record /tmp/pip-6Ep2BO-record/install-record.txt --single-version-externally-managed --compile:
    running install
    running build
    running build_py
    creating build
    creating build/lib.linux-x86_64-2.6
    creating build/lib.linux-x86_64-2.6/gpgme
    copying gpgme/editutil.py -> build/lib.linux-x86_64-2.6/gpgme
    copying gpgme/__init__.py -> build/lib.linux-x86_64-2.6/gpgme
    running build_ext
    building 'gpgme._gpgme' extension
    creating build/temp.linux-x86_64-2.6
    creating build/temp.linux-x86_64-2.6/src
    gcc -pthread -fno-strict-aliasing -O2 -g -pipe -Wall -Wp,-D_FORTIFY_SOURCE=2 -fexceptions -fstack-protector --param=ssp-buffer-size=4 -m64 -mtune=generic -D_GNU_SOURCE -fPIC -fwrapv -DNDEBUG -O2 -g -pipe -Wall -Wp,-D_FORTIFY_SOURCE=2 -fexceptions -fstack-protector --param=ssp-buffer-size=4 -m64 -mtune=generic -D_GNU_SOURCE -fPIC -fwrapv -fPIC -I/usr/include/python2.6 -c src/gpgme.c -o build/temp.linux-x86_64-2.6/src/gpgme.o
    In file included from src/gpgme.c:22:
    src/pygpgme.h:24:19: error: gpgme.h: No such file or directory
    In file included from src/gpgme.c:22:
    src/pygpgme.h:32: error: expected specifier-qualifier-list before ‘gpgme_ctx_t’
    src/pygpgme.h:37: error: expected specifier-qualifier-list before ‘gpgme_key_t’
    src/pygpgme.h:42: error: expected specifier-qualifier-list before ‘gpgme_subkey_t’
    src/pygpgme.h:48: error: expected specifier-qualifier-list before ‘gpgme_user_id_t’
    src/pygpgme.h:54: error: expected specifier-qualifier-list before ‘gpgme_key_sig_t’
    src/pygpgme.h:124: error: expected ‘)’ before ‘err’
    src/pygpgme.h:125: error: expected ‘)’ before ‘err’
    src/pygpgme.h:126: error: expected ‘=’, ‘,’, ‘;’, ‘asm’ or ‘__attribute__’ before ‘pygpgme_check_pyerror’
    src/pygpgme.h:130: error: expected ‘)’ before ‘*’ token
    src/pygpgme.h:131: error: expected ‘)’ before ‘key’
    src/pygpgme.h:132: error: expected ‘)’ before ‘siglist’
    src/pygpgme.h:133: error: expected ‘)’ before ‘siglist’
    src/pygpgme.h:134: error: expected ‘)’ before ‘ctx’
    src/pygpgme.h:135: error: expected ‘)’ before ‘ctx’
    src/gpgme.c: In function ‘create_module’:
    src/gpgme.c:92: warning: implicit declaration of function ‘gpgme_check_version’
    src/gpgme.c:92: warning: assignment makes pointer from integer without a cast
    error: command 'gcc' failed with exit status 1
```

简单推测这个应该和系统的`gpgme`有关，Google 了一下，发现有人已经提出过这个问题[Can't upgrade to 0.3 on Centos 6.4](https://bugs.launchpad.net/pygpgme/+bug/1218063)，同时，William Grant 也给出了分析，需要 centos 系统安装`gpgme-devel`即可。

```bash
# Install RPM:
sudo yum install -y gpgme-devel
```

---

## 升级`pycurl`遇到无法找到`gpgme.h`的问题

具体报错信息如下：

```bash
# centos6 / Python 2.6.6 / pip 9.0.1

Complete output from command python setup.py egg_info:
    Traceback (most recent call last):
      File "<string>", line 1, in <module>
      File "/tmp/pip-build-vOVaGA/pycurl/setup.py", line 823, in <module>
        ext = get_extension(sys.argv, split_extension_source=split_extension_source)
      File "/tmp/pip-build-vOVaGA/pycurl/setup.py", line 497, in get_extension
        ext_config = ExtensionConfiguration(argv)
      File "/tmp/pip-build-vOVaGA/pycurl/setup.py", line 71, in __init__
        self.configure()
      File "/tmp/pip-build-vOVaGA/pycurl/setup.py", line 107, in configure_unix
        raise ConfigurationError(msg)
    __main__.ConfigurationError: Could not run curl-config: [Errno 2] No such file or directory
```

`curl-config`无法找到，十有八九跟系统的`curl`有关，查了一下，确实又是缺少了`libcurl-devel`，可以看一下这个[gist](https://gist.github.com/lxneng/1031014#gistcomment-1344029)：

```bash
# Install RPM:
sudo yum install -y libcurl-devel
```

---

## 升级`pip`至`v9.*`版本以后，遇到权限问题

```
OSError: [Errno 13] Permission denied: '/usr/lib/python2.7/dist-packages/attr/_compat.py'
```

解决方案有 2 种，第一种比较直接，用`sudo`权限，第二种就是启用`pip`的`--user`配置项，例如，本文前面所说的升级全部的 pip package 时，命令修改如下：

```
pip freeze --local | grep -v '^\-e' | cut -d = -f 1  | xargs -n1 pip install --user
```

---

## `yum`无法正常使用，提示`pycurl`有问题

```
There was a problem importing one of the Python modules
required to run yum. The error leading to this problem was:

   pycurl: libcurl link-time ssl backend (nss) is different from compile-time ssl backend (openssl)

Please install a package which provides this module, or
verify that the module is installed correctly.
```

看提示，应该是`pycurl`所依赖的`libcurl`用的是`nss`的 SSL 方案，但是`pycurl`使用的却是`openssl`的 SSL 方案，所以导致了冲突，果然，在[stackoverflow](https://stackoverflow.com/questions/21096436/ssl-backend-error-when-using-openssl)上看到了相关的东西，解决方案也比较简单，如下操作即可：

```shell
pip uninstall pycurl
export PYCURL_SSL_LIBRARY=nss
pip install pycurl --no-cache-dir
```

排查了一下原因，发现可能是之前想玩 shadowsocks 的时候，安装了`python-devel`一系列之后又做了一次全局的依赖升级，导致了这个问题，有空了再去深究
