---
title: '常用Shell整理'
date: 2017-11-08T08:08:08+08:00
draft: false
url: 'shell-note'
tags:
  - Note
  - Linux
  - Shell
categories:
  - Hobbies
---

## 实现“按任意键继续/Press any key to continue”效果

> 关键词：`stty`

```shell
get_char() {
    SAVEDSTTY=`stty -g`
    # 隐藏终端输入显示
    stty -echo
    stty cbreak
    # dd等待用户按键
    # bs(block size) 块大小 = 1 count总数 = 1， 作用只取一个字符
    # 2 > /dev/null，  不显示任何信息
    dd if=/dev/tty bs=1 count=1 2> /dev/null

    # 恢复终端显示
    stty -raw
    stty echo
    stty $SAVEDSTTY
}

echo ""
echo "Press any key to start...or Press Ctrl+c to cancel"

char=`get_char`
```
