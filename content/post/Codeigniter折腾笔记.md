---
title: "Codeigniter折腾笔记"
date: 2017-07-20T08:08:08+08:00
draft: false
url: "codeigniter-note"
tags:
  - Note
  - PHP
  - BackEnd
categories:
  - Web Technologies
---

> 本文记录一些自己在使用 **[Codeigniter](https://www.codeigniter.com/)** 开发时遇到的坑及解决方法，仅供参考。

## 1、 升级到`V3`之后，如果有多个域名同时指向到`$config['base_url']`的解决方案

很多时候，当使用 **Nginx** 做 **[VHOST](https://zh.wikipedia.org/wiki/%E8%99%9A%E6%8B%9F%E4%B8%BB%E6%9C%BA)** 的时候，我们可能会定义`server xxx.com www.xxx.com`，本意就是不论打开`xxx.com`还是`www.xxx.com`都可以正常的访问站点，但是 **Codeigniter** 从`V2`升级到`V3`之后，官方公布了[升级指南](https://www.codeigniter.com/user_guide/installation/upgrade_300.html)明确指出：

> Make sure your ‘base_url’ config value is not empty

如果你没有配置`$config['base_url']`，那么根据`system/core/Config.php`的源码，可以知道，这个时候`base_url`会被设置为`$_SERVER['SERVER_ADDR']`，也就是**IP**，如果你一个 IP(IPV6)就一个站点，那或许这么处理没啥问题，但是，如果用 VHOST 处理就麻烦了，好在，官方文档比较尽责，提供了一个不错的解决方案：

```PHP
$allowed_domains = array('xxx.com', 'www.xxx.com');
$default_domain  = 'xxx.com';

if (in_array($_SERVER['HTTP_HOST'], $allowed_domains, TRUE))
{
    $domain = $_SERVER['HTTP_HOST'];
}
else
{
    $domain = $default_domain;
}

if ( ! empty($_SERVER['HTTPS']))
{
    $config['base_url'] = 'https://'.$domain;
}
else
{
    $config['base_url'] = 'http://'.$domain;
}
```

这样就可以根据`$allowed_domains`来动态过滤相应的域名了

---

## 2、 为 [Codeigniter](https://www.codeigniter.com/) 增加 [smarty](https://www.smarty.net/) 模板引擎

很多 Codeigniter 的使用者都是极简主义者，因为 Codeigniter 够简单，所以对于`view`的处理，就连官网的文档《[模板解析类](https://codeigniter.org.cn/user_guide/libraries/parser.html)》也有这样的描述：

> CodeIgniter 并没有 让你必须使用这个类，因为直接在视图中使用纯 PHP 可能速度会更快点。 尽管如此，一些开发者还是喜欢使用模板引擎，他们可能是和一些其他的不熟悉 PHP 的设计师共同工作。

就如上述所说，往往团队中会有一些人喜欢用模板引擎，比如说[smarty](https://www.smarty.net/)，很可惜官网的文档中只有一个模板类的描述，也不甚详细，Google 了一圈，找到一篇 coolphptools 上的文章《[CodeIgniter and Smarty](http://www.coolphptools.com/codeigniter-smarty)》，写的比较详细(中文版请访问参考链接[4])。

好了，接下来就动手吧，因为我本地安装了[composer](https://getcomposer.org/)，所以我就直接运行`composer require smarty/smarty`安装[smarty](https://www.smarty.net/)到项目根目录的`vendor/`文件夹中，你也可手动下载然后复制到该文件夹中。

接着，在`application/libraries`中创建`Smartie.php`，写入以下代码：

```php
<?php if (!defined('BASEPATH')) {
    exit('No direct script access allowed');
}

/**
 * Smartie Class
 *
 * @package        CodeIgniter
 * @subpackage     Libraries
 * @category       Smarty
 * @author         Kepler Gelotte
 * @link           http://www.coolphptools.com/codeigniter-smarty
 */
require_once BASEPATH . '../vendor/smarty/smarty/libs/Smarty.class.php';

class Smartie extends Smarty
{

    public $debug = false;

    public function __construct()
    {
        parent::__construct();

        $this->template_dir = APPPATH . "views";
        $this->compile_dir  = APPPATH . "_views";
        if (!is_writable($this->compile_dir)) {
            // make sure the compile directory can be written to
            @chmod($this->compile_dir, 0777);
        }

        // Uncomment these 2 lines to change Smarty's delimiters
        // $this->left_delimiter = '{{';
        // $this->right_delimiter = '}}';

        $this->assign('FCPATH', FCPATH); // path to website
        $this->assign('APPPATH', APPPATH); // path to application directory
        $this->assign('BASEPATH', BASEPATH); // path to system directory

        log_message('debug', "Smarty Class Initialized");
    }

    public function setDebug($debug = true)
    {
        $this->debug = $debug;
    }

    /**
     *  Parse a template using the Smarty engine
     *
     * This is a convenience method that combines assign() and
     * display() into one step.
     *
     * Values to assign are passed in an associative array of
     * name => value pairs.
     *
     * If the output is to be returned as a string to the caller
     * instead of being output, pass true as the third parameter.
     *
     * @access    public
     * @param    string
     * @param    array
     * @param    bool
     * @return    string
     */
    public function view($template, $data = array(), $return = false)
    {
        if (!$this->debug) {
            $this->error_reporting = false;
        }
        $this->error_unassigned = false;

        foreach ($data as $key => $val) {
            $this->assign($key, $val);
        }

        if ($return == false) {
            $CI = &get_instance();
            if (method_exists($CI->output, 'set_output')) {
                $CI->output->set_output($this->fetch($template));
            } else {
                $CI->output->final_output = $this->fetch($template);
            }
            return;
        } else {
            return $this->fetch($template);
        }
    }
}
// END Smartie Class
```

引用`Smarty.class.php`的时候，记得检查一下引用的路径，或者你也可以将`application/config/config.php`中的`$config['composer_autoload']`设置为`BASEPATH . '../vendor/autoload.php'`，这样就可以自动加载 composer 的资源了，而不需要在这里手动使用`require_once`引用 Smarty。

另外`template_dir`与`compile_dir`也可以自己去设置，这里仅作参考。

然后，设置`application/config/autoload.php`，在`$autoload['libraries']`中添加`'smartie' => 'smarty'`，这样就可以在`controllers/*.php`中使用`$this->smarty->view()`的方法了，对应的 view 文件中已经可以使用[smarty](https://www.smarty.net/)的语法了。

如果，你下载了 coolphptools 中的[codeigniter-smarty_3.zip](http://www.coolphptools.com/userfiles/downloads/codeigniter-smarty_3.zip)，你会发现测试`example`的时候会报错，这是因为 Kepler Gelotte 对 Smarty 做了结合 Codeigniter 部分扩展，你可以将 codeigniter-smarty*3.zip 中`application/third_party/smarty/libs/plugins`文件夹下的几个`function.ci*\*\*.php`文件全部拷贝至你的`vendor/smarty/smarty/libs/plugins`目录下，并且需要在`function.ci_form_validation.php`手动加载`form_validation`：

```php
// get a Code Igniter instance
$CI = &get_instance();
// 在此加载form_validation类库
// 或者，在autoload中全局加载
$CI->load->library('form_validation');
$_validation = $CI->form_validation;
```

结果示意图：
![example-codeignter-smarty-page](/content/images/2017/07/example-codeignter-smarty-page-1.png)

### 参考链接

1. https://www.codeigniter.com/user\_guide/installation/upgrade_300.html#step-19-make-sure-your-base-url-config-value-is-not-empty
2. https://github.com/bcit-ci/CodeIgniter/issues/4576
3. http://www.coolphptools.com/codeigniter-smarty
4. https://jasonhzy.github.io/2016/02/27/ci-smarty/
