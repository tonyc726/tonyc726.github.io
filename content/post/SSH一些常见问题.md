---
title: 'SSH一些常见问题'
date: 2017-07-17T08:08:08+08:00
draft: false
url: 'ssh-note'
tags:
  - Note
  - Linux
  - SSH
categories:
  - Hobbies
---

## 1、系统警告`Could not open a connection to your authentication agent.`

一般这个问题会出现在你使用`ssh-add`命令的时候，究其原因其实很简单就是你还没有启动`ssh-agent`，网上有很多解决方式，最便捷的就是直接开启`ssh-agent`：

```bash
eval `ssh-agent -s`
ssh-add
```

不过，如果每次都这样开启`ssh-agent`也太麻烦了一些，[Joseph M. Reagle](http://www.cygwin.com/ml/cygwin/2001-06/msg00537.html) 就提供了一段`shell`脚本，方便自启动`ssh-agent`：

```shell
SSH_ENV="$HOME/.ssh/environment"

function start_agent {
     echo "Initialising new SSH agent..."
     /usr/bin/ssh-agent | sed 's/^echo/#echo/' > "${SSH_ENV}"
     echo succeeded
     chmod 600 "${SSH_ENV}"
     . "${SSH_ENV}" > /dev/null
     /usr/bin/ssh-add;
}

# Source SSH settings, if applicable

if [ -f "${SSH_ENV}" ]; then
     . "${SSH_ENV}" > /dev/null
     #ps ${SSH_AGENT_PID} doesn't work under cywgin
     ps -ef | grep ${SSH_AGENT_PID} | grep ssh-agent$ > /dev/null || {
         start_agent;
     }
else
     start_agent;
fi
```

如果你是使用`bash`那么直接将这段代码放入你的`.bash_profile`即可，然后`source .bash_profile`或者重新登了一下，你可以看到以下提示：

```bash
Initialising new SSH agent...
succeeded
```

接下来你就可以使用`ssh-add`进行操作了。

### 参考链接

1. [could-not-open-a-connection-to-your-authentication-agent](https://stackoverflow.com/questions/17846529/could-not-open-a-connection-to-your-authentication-agent#answer-17848593)
2. [start-ssh-agent-on-login](https://stackoverflow.com/questions/18880024/start-ssh-agent-on-login/18915067#answer-18915067)
3. http://mah.everybody.org/docs/ssh
4. http://www.cygwin.com/ml/cygwin/2001-06/msg00537.html
