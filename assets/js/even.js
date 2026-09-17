'use strict';

/*
 * Even —— vanilla JS 重写版（替代原 jQuery + slideout + fancybox 实现）
 * 初始化入口在文件底部；兼容原主题的 CSS 类名（slideout-open / fixed-open 等）。
 */
const Even = {};

/* ============================== Back to top ============================== */
Even.backToTop = function () {
  const el = document.getElementById('back-to-top');
  if (!el) return;

  let ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      el.style.display = window.scrollY > 100 ? 'block' : 'none';
      ticking = false;
    });
  }, { passive: true });

  el.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};

/* ============================== Mobile navbar（原生抽屉，替代 slideout.js） ============================== */
Even.mobileNavbar = function () {
  const navbar = document.getElementById('mobile-navbar');
  const icon = document.querySelector('.mobile-navbar-icon');
  const panel = document.getElementById('mobile-panel');
  const menu = document.getElementById('mobile-menu');
  if (!navbar || !icon || !panel || !menu) return;

  panel.classList.add('slideout-panel');
  let open = false;

  function setOpen(state) {
    open = state;
    const root = document.documentElement;
    if (open) {
      root.classList.add('slideout-open');
      navbar.classList.add('fixed-open');
      icon.classList.remove('icon-out');
      icon.classList.add('icon-click');
      panel.style.transition = 'transform 300ms ease';
      panel.style.transform = 'translate3d(180px, 0, 0)';
    } else {
      root.classList.remove('slideout-open');
      navbar.classList.remove('fixed-open');
      icon.classList.add('icon-out');
      icon.classList.remove('icon-click');
      panel.style.transform = 'translate3d(0, 0, 0)';
    }
  }

  icon.addEventListener('click', function () { setOpen(!open); });

  // 点击菜单内链接后自动收起
  menu.addEventListener('click', function (e) {
    if (open && e.target.closest('a')) setOpen(false);
  });

  // 点击面板（即菜单展开时点击内容区）收起 —— 与原实现行为一致
  panel.addEventListener('touchend', function () {
    if (open) setOpen(false);
  });

  window.addEventListener('resize', function () {
    if (open && window.innerWidth > 960) setOpen(false);
  });
};

/* ============================== TOC ============================== */
Even._initToc = function () {
  const SPACING = 20;
  const toc = document.querySelector('.post-toc');
  const footer = document.querySelector('.post-footer');

  if (toc && footer) {
    const minScrollTop = toc.offsetTop - SPACING;
    const maxScrollTop = footer.offsetTop - toc.offsetHeight - SPACING;

    window.addEventListener('scroll', function () {
      const scrollTop = window.scrollY;
      if (scrollTop < minScrollTop) {
        toc.style.position = 'absolute';
        toc.style.top = minScrollTop + 'px';
      } else if (scrollTop > maxScrollTop) {
        toc.style.position = 'absolute';
        toc.style.top = maxScrollTop + 'px';
      } else {
        toc.style.position = 'fixed';
        toc.style.top = SPACING + 'px';
      }
    }, { passive: true });
  }

  const HEADERFIX = 30;
  const tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc-link'));
  const headerLinks = Array.prototype.slice.call(document.querySelectorAll('.headerlink'));
  const tocLinkLis = Array.prototype.slice.call(document.querySelectorAll('.post-toc-content li'));
  if (!tocLinks.length || !headerLinks.length) return;

  const headerTops = headerLinks.map(function (link) { return link.offsetTop; });

  const searchActiveTocIndex = function (array, target) {
    for (let i = 0; i < array.length - 1; i++) {
      if (target > array[i] && target <= array[i + 1]) return i;
    }
    if (target > array[array.length - 1]) return array.length - 1;
    return -1;
  };

  window.addEventListener('scroll', function () {
    const activeTocIndex = searchActiveTocIndex(headerTops, window.scrollY - HEADERFIX);

    tocLinks.forEach(function (link) { link.classList.remove('active'); });
    tocLinkLis.forEach(function (li) { li.classList.remove('has-active'); });

    if (activeTocIndex !== -1 && tocLinks[activeTocIndex]) {
      tocLinks[activeTocIndex].classList.add('active');
      let ancestor = tocLinks[activeTocIndex].parentNode;
      while (ancestor && ancestor.tagName !== 'NAV') {
        ancestor.classList.add('has-active');
        ancestor = ancestor.parentNode ? ancestor.parentNode.parentNode : null;
      }
    }
  }, { passive: true });
};

Even.toc = function () {
  const tocContainer = document.getElementById('post-toc');
  if (tocContainer !== null) {
    const toc = document.getElementById('TableOfContents');
    if (toc === null) {
      // toc = true, but there are no headings
      tocContainer.parentNode.removeChild(tocContainer);
    } else {
      this._refactorToc(toc);
      this._linkToc();
      this._initToc();
    }
  }
};

Even._refactorToc = function (toc) {
  // when headings do not start with `h1`
  const oldTocList = toc.children[0];
  let newTocList = oldTocList;
  let temp;
  while (newTocList.children.length === 1
      && (temp = newTocList.children[0].children[0]) && temp.tagName === 'UL') {
    newTocList = temp;
  }

  if (newTocList !== oldTocList) toc.replaceChild(newTocList, oldTocList);
};

Even._linkToc = function () {
  const links = document.querySelectorAll('#TableOfContents a:first-child');
  for (let i = 0; i < links.length; i++) links[i].className += ' toc-link';

  for (let num = 1; num <= 6; num++) {
    const headers = document.querySelectorAll('.post-content>h' + num);
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      header.innerHTML = '<a href="#' + header.id + '" class="headerlink anchor"><i class="iconfont icon-link"></i></a>' + header.innerHTML;
    }
  }
};

/* ============================== Lightbox（原生实现，替代 fancybox） ============================== */
Even.lightbox = function () {
  if (!window.__ENABLE_LIGHTBOX__) return;

  const images = Array.prototype.slice.call(document.querySelectorAll('.post-content img'));
  if (!images.length) return;

  let index = 0;
  const overlay = document.createElement('div');
  overlay.className = 'even-lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML =
    '<button type="button" class="even-lightbox-close" aria-label="关闭">&times;</button>' +
    '<button type="button" class="even-lightbox-prev" aria-label="上一张">&#10094;</button>' +
    '<button type="button" class="even-lightbox-next" aria-label="下一张">&#10095;</button>' +
    '<figure><img alt=""><figcaption></figcaption></figure>';

  const img = overlay.querySelector('img');
  const caption = overlay.querySelector('figcaption');
  const prevBtn = overlay.querySelector('.even-lightbox-prev');
  const nextBtn = overlay.querySelector('.even-lightbox-next');

  function show(i) {
    index = (i + images.length) % images.length;
    const target = images[index];
    img.src = target.currentSrc || target.src;
    const text = target.getAttribute('title') || target.getAttribute('alt') || '';
    caption.textContent = text;
    caption.style.display = text ? '' : 'none';
    const multi = images.length > 1;
    prevBtn.style.display = multi ? '' : 'none';
    nextBtn.style.display = multi ? '' : 'none';
  }

  function open(i) {
    show(i);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    document.body.style.overflow = '';
  }

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });
  overlay.querySelector('.even-lightbox-close').addEventListener('click', close);
  prevBtn.addEventListener('click', function () { show(index - 1); });
  nextBtn.addEventListener('click', function () { show(index + 1); });

  document.addEventListener('keydown', function (e) {
    if (!overlay.parentNode) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });

  images.forEach(function (image, i) {
    image.style.cursor = 'zoom-in';
    image.addEventListener('click', function (e) {
      e.preventDefault();
      open(i);
    });
  });
};

/* ============================== Chroma（服务端高亮由 Hugo 生成，这里补语言类名） ============================== */
Even.chroma = function () {
  const blocks = document.querySelectorAll('.highlight > .chroma');
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const afterHighLight = block.querySelector('pre.chroma > code[data-lang]');
    const lang = afterHighLight ? afterHighLight.className : '';
    block.className += ' ' + lang;
  }
};

/* ============================== Responsive table ============================== */
Even.responsiveTable = function () {
  const tables = document.querySelectorAll('.post-content table:not(.lntable)');
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    table.parentElement.replaceChild(wrapper, table);
    wrapper.appendChild(table);
  }
};

/* ============================== Init ============================== */
document.addEventListener('DOMContentLoaded', function () {
  Even.backToTop();
  Even.mobileNavbar();
  Even.toc();
  Even.lightbox();
  Even.responsiveTable();
  Even.chroma();
});
