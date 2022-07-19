---
title: '备份Ghost至Bitbucket'
date: 2017-07-17T18:08:08+08:00
draft: false
url: 'ghost-backup-to-bitbucket'
tags:
  - Linux
  - VPS
  - Ghost
categories:
  - Hobbies
---

关于如何为 Ghost 做备份，Google 一下，你会找到有很多种方式，不过由于本博客使用了 Mysql 作为 Ghost 的数据库，平时自己又习惯于使用 Git 做版本管理，所以就衍生了一个用 Git 来备份博客数据的想法。

大致的思路就是，先用`mysqldump`备份 Ghost 的 database，将其压缩存储至 Ghost 根目录的`content/data`文件夹中，通过`git commit`将其添加入 Git 仓库，然后`push`至[Bitbucket]。

PS: 市面上有很多可以提供私有仓库的 Git 服务，孰优孰劣各有不同，这里就选用了自己常用的[Bitbucket](https://bitbucket.org/)。

那么首先就来建立一个名为`cron_backup.sh`的文件，具体代码如下：

```shell
#!/bin/sh
# Set variables
DB_NAME="xxx"
MYSQL_USER="xxx"
MYSQL_PASSWORD="xxx"

BACKUP_TIME=$(date +"%Y%m%d%H%M")
BACKUP_DIR="path/to/ghost/content/data"
FULLDATE=$(date +"%Y-%d-%m %H:%M")

# Check current Git status and update
git status
git pull origin HEAD

# 判断MYSQL是否启动,mysql没有启动则备份退出
MYSQL_PS=`ps -ef |grep mysql |wc -l`
MYSQL_LISTEN=`netstat -an |grep LISTEN |grep 3306|wc -l`
if [ [$MYSQL_PS == 0] -o [$MYSQL_LISTEN == 0] ]; then
  echo "ERROR:MySQL is not running! backup stop!"
  exit
else
  echo "Welcome to use MySQL backup tools!"
fi

# 连接到mysql数据库，无法连接则备份退出
mysql -u$MYSQL_USER -p$MYSQL_PASSWORD <<end
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = "$DB_NAME";
exit
end

FLAG=`echo $?`
if [ $FLAG != "0" ]; then
  echo "ERROR:Can't connect mysql server! backup stop!"
  exit
else
  echo "MySQL connect ok! Please wait......"
  echo "The database $DB_NAME backup start..."
  # 判断有没有定义备份的数据库，如果定义则开始备份，否则退出备份
  `mysqldump -hlocalhost -P3306 -u$MYSQL_USER -p$MYSQL_PASSWORD $DB_NAME --default-character-set="utf8" | gzip > $BACKUP_DIR/$BACKUP_TIME.sql.gz`
  FLAG=`echo $?`
  if [ $FLAG == "0" ];then
    echo "database $DB_NAME success backup to $BACKUP_DIR/$BACKUP_TIME.sql.gz"
  else
    echo "database $DB_NAME backup fail!"
  fi
fi

# 删除过期备份，则进行删除操作，暂定为7天以前的备份数据
find $BACKUP_DIR -mtime +7 -exec rm -f {} \;

# Add to Git and commit
git add -A
git commit -m "Automatic backup - $FULLDATE"
git push origin HEAD
```

以上脚本中的`DB_NAME`、`MYSQL_USER`、`MYSQL_PASSWORD`及`path/to/ghost/content/data`请自行替换。

接着你先为 Ghost 的根目录下初始化 Git，并连接 Bitbucket 远程仓库，如有疑问，可以 Google，这点在这里就不描述了。

现在，来测试一下这个脚本，如果遇到权限问题，请赋予当前用户`chmod +x`的权限，如果没有问题，你的备份脚本就已经 OK 了。

不过，如果仅仅是这样感觉还是麻烦了一些，做好能做个定时脚本，这时候我们就用到了`crontab`，为当前的用户添加一个定时任务吧，让系统自动每天凌晨帮你备份一次：

```bash
# crontab command
00 00 * * * cd path/to/ghost && ./cron_backup.sh > /dev/null 2>&1
```

这里有一点小提示，为何不是直接运行`path/to/ghost/cron_backup.sh`，因为有可能你执行`crontab`并非 Ghost 目录的拥有者，会导致 Git 操作失败。

以上想法及示例代码仅供参考。

##### 参考链接

1. https://github.com/astaxie/build-web-application-with-golang/blob/master/zh/12.4.md
2. https://jabran.me/articles/automatic-database-backup-using-git-hosting
3. https://gist.github.com/oodavid/2206527
4. https://gist.github.com/pakcheong/6570839
5. https://zh.wikipedia.org/wiki/Cron
