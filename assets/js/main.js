// 站点级 main.js：拼在 even.js 之后加载（见 layouts/partials/scripts.html）。
// even.js 内是主题的 vanilla JS 初始化逻辑，此文件放站点自有增强。

/* ============================== 代码块一键复制 ============================== */
(function () {
  var BUTTON_LABEL = '复制';
  var BUTTON_COPIED = '已复制';

  function copyText(text, done) {
    function legacy() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        done();
      } catch (e) {
        /* 剪贴板不可用时静默失败 */
      }
      document.body.removeChild(ta);
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, legacy);
    } else {
      legacy();
    }
  }

  document.querySelectorAll('.post-content .highlight').forEach(function (block) {
    if (block.querySelector('.copy-code-button')) return;

    // Chroma 行号表格取代码列；无行号时退化为整块 pre
    var code = block.querySelector('.lntd:last-child code, td.code code, pre code');
    if (!code) return;

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code-button';
    button.textContent = BUTTON_LABEL;

    var timer = null;
    button.addEventListener('click', function () {
      copyText(code.innerText, function () {
        button.textContent = BUTTON_COPIED;
        button.classList.add('copied');
        clearTimeout(timer);
        timer = setTimeout(function () {
          button.textContent = BUTTON_LABEL;
          button.classList.remove('copied');
        }, 1600);
      });
    });

    block.appendChild(button);
  });
})();
