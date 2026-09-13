/**
 * 站点共享脚本：数据读取、卡片渲染、标签聚合、页面分发。
 * 每个页面通过 <body data-page="xxx"> 声明自己的身份。
 */
(function () {
  'use strict';

  /* ---------- 数据层 ---------- */

  // 只对外暴露已发布的条目
  var allItems = (window.ITEMS || []).filter(function (it) {
    return it.status === 'published';
  });

  function byType(type) {
    return allItems
      .filter(function (it) { return it.type === type; })
      .sort(function (a, b) { return b.date.localeCompare(a.date); });
  }

  function byId(id) {
    for (var i = 0; i < allItems.length; i++) {
      if (allItems[i].id === id) return allItems[i];
    }
    return null;
  }

  function byTag(tag) {
    return allItems
      .filter(function (it) { return it.tags.indexOf(tag) !== -1; })
      .sort(function (a, b) { return b.date.localeCompare(a.date); });
  }

  // 从所有已发布条目自动聚合标签：去重 + 计数，按数量降序
  function tagCounts() {
    var map = {};
    allItems.forEach(function (it) {
      it.tags.forEach(function (t) {
        map[t] = (map[t] || 0) + 1;
      });
    });
    return Object.keys(map)
      .map(function (name) { return { name: name, count: map[name] }; })
      .sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name, 'zh'); });
  }

  /* ---------- 工具 ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function getParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  }

  function el(id) { return document.getElementById(id); }

  function tagLink(t) {
    return '<a class="tag" href="tag.html?tag=' + encodeURIComponent(t) + '">' + esc(t) + '</a>';
  }

  function typeBadge(type) {
    return type === 'work'
      ? '<span class="type-badge work">作品</span>'
      : '<span class="type-badge">文章</span>';
  }

  /* ---------- 组件 ---------- */

  // 列表行：缩略图 + 元信息 + 标题 + 摘要，无方框、行间细分隔线，全站共用
  function thumbHTML(it) {
    if (it.cover) {
      return '<img class="row-thumb" src="' + esc(it.cover) + '" alt="" loading="lazy">';
    }
    // 无封面时，用标题首字做素色占位块
    return '<div class="row-thumb row-thumb-ph" aria-hidden="true">' +
      esc(it.title.charAt(0)) + '</div>';
  }

  function rowHTML(it) {
    var url = 'item.html?id=' + encodeURIComponent(it.id);
    return '<div class="item-row">' +
      '<a class="row-link" href="' + url + '" aria-label="' + esc(it.title) + '"></a>' +
      thumbHTML(it) +
      '<div class="row-main">' +
        '<div class="row-meta">' +
          '<span class="row-type">' + (it.type === 'work' ? '作品' : '文章') + '</span>' +
          '<span class="row-sep">·</span>' +
          '<span class="row-date">' + esc(it.date) + '</span>' +
        '</div>' +
        '<a class="row-title" href="' + url + '">' + esc(it.title) + '</a>' +
        '<p class="row-summary">' + esc(it.summary) + '</p>' +
        '<div class="row-tags">' + it.tags.map(tagLink).join('') + '</div>' +
      '</div>' +
    '</div>';
  }

  function listHTML(items, emptyText) {
    if (!items.length) {
      return '<div class="empty-note">' + esc(emptyText || '这里还没有内容，正在筹备中。') + '</div>';
    }
    return '<div class="item-rows">' + items.map(rowHTML).join('') + '</div>';
  }

  function tagChipsHTML(tags) {
    if (!tags.length) return '';
    return '<div class="tag-cloud">' + tags.map(function (t) {
      return '<a class="tag-chip" href="tag.html?tag=' + encodeURIComponent(t.name) + '">' +
        esc(t.name) + '<span class="n">' + t.count + '</span></a>';
    }).join('') + '</div>';
  }

  /* ---------- 骨架（导航 / 页脚） ---------- */

  var NAV = [
    ['index.html', '首页', 'home'],
    ['works.html', '作品', 'works'],
    ['articles.html', '文章', 'articles'],
    ['tags.html', '标签', 'tags'],
    ['about.html', '关于', 'about']
  ];

  function renderShell(page) {
    var header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML =
      '<div class="wrap">' +
        '<a class="site-title" href="index.html">数字展览馆</a>' +
        '<nav class="site-nav">' +
          NAV.map(function (n) {
            var active = n[2] === page ? ' class="active"' : '';
            return '<a href="' + n[0] + '"' + active + '>' + n[1] + '</a>';
          }).join('') +
        '</nav>' +
        '<form class="search-form" action="search.html" method="get" role="search">' +
          '<input type="search" name="q" placeholder="搜索作品和文章…" aria-label="搜索">' +
          '<button type="submit">搜索</button>' +
        '</form>' +
      '</div>';
    // 搜索页时，把关键词回填到搜索框
    if (page === 'search') {
      var searchInput = header.querySelector('input[name="q"]');
      if (searchInput) searchInput.value = getParam('q') || '';
    }
    document.body.prepend(header);

    var footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML =
      '<div class="wrap">个人数字展览馆 · 只展示已完成的公开内容 · 纯静态页面</div>';
    document.body.appendChild(footer);
  }

  /* ---------- 各页面 ---------- */

  function pageHome() {
    var works = byType('work');
    var articles = byType('article');
    var featured = allItems
      .filter(function (it) { return it.featured; })
      .sort(function (a, b) { return b.date.localeCompare(a.date); })
      .slice(0, 5);
    var latest = allItems
      .slice()
      .sort(function (a, b) { return b.date.localeCompare(a.date); })
      .slice(0, 5);

    el('entry-works').innerHTML =
      '<h2>作品</h2><p>我做的网页、小工具和数据工具。</p>' +
      '<span class="count">' + works.length + ' 件</span>';
    el('entry-articles').innerHTML =
      '<h2>文章</h2><p>完整写成的文章、专题与复盘。</p>' +
      '<span class="count">' + articles.length + ' 篇</span>';

    el('featured').innerHTML = listHTML(featured, '展厅刚开张，精选位虚席以待。');
    el('latest').innerHTML = listHTML(latest, '这里还没有内容。');
    el('home-tags').innerHTML = tagChipsHTML(tagCounts());
  }

  function pageWorks() {
    el('list').innerHTML = listHTML(byType('work'), '这里还没有作品，正在筹备中。');
  }

  function pageArticles() {
    el('list').innerHTML = listHTML(byType('article'), '这里还没有文章，正在筹备中。');
  }

  function pageTags() {
    var tags = tagCounts();
    el('list').innerHTML = tags.length
      ? '<ul class="tag-list">' + tags.map(function (t) {
          return '<li><a href="tag.html?tag=' + encodeURIComponent(t.name) + '">' +
            esc(t.name) + '</a><span class="n">' + t.count + ' 条内容</span></li>';
        }).join('') + '</ul>'
      : '<div class="empty-note">还没有标签。</div>';
  }

  function pageTag() {
    var tag = getParam('tag');
    if (!tag) {
      el('result').innerHTML = '<div class="empty-note">缺少标签参数。去 <a href="tags.html">标签页</a> 看看。</div>';
      return;
    }
    document.title = tag + ' · 标签';
    el('tag-name').textContent = tag;
    var items = byTag(tag);
    el('result').innerHTML = listHTML(items, '这个标签下暂时没有已发布的内容。');
  }

  // 搜索：纯前端字符串匹配，只搜已发布内容
  // 字段：标题、摘要、标签；文章额外搜正文（先去掉 HTML 标签再匹配）
  function pageSearch() {
    var q = (getParam('q') || '').trim();
    if (!q) {
      el('result').innerHTML =
        '<div class="empty-note">输入关键词，搜索已发布的作品和文章。</div>';
      return;
    }
    document.title = '搜索「' + q + '」 · 数字展览馆';
    el('q-line').hidden = false;
    el('q-text').textContent = q;

    var needle = q.toLowerCase();
    var results = allItems.filter(function (it) {
      var hay = [it.title, it.summary, (it.tags || []).join(' ')];
      if (it.type === 'article' && it.body) {
        hay.push(it.body.replace(/<[^>]*>/g, ' '));
      }
      return hay.join(' ').toLowerCase().indexOf(needle) !== -1;
    });

    el('result').innerHTML = results.length
      ? '<p class="search-count">找到 ' + results.length + ' 条结果（作品和文章一起显示）</p>' +
        listHTML(results)
      : '<div class="empty-note">没有找到相关内容，换个关键词试试。</div>';
  }

  function pageItem() {
    var id = getParam('id');
    var it = id ? byId(id) : null;
    if (!it) {
      el('detail').innerHTML =
        '<div class="empty-note">没有找到这条内容，可能还未发布或已被移除。<br><br>' +
        '<a href="index.html">回到首页</a></div>';
      return;
    }
    document.title = it.title + ' · 数字展览馆';

    var html = '<div class="item-head">' +
      '<div class="crumb">' + typeBadge(it.type) + '</div>' +
      '<h1>' + esc(it.title) + '</h1>' +
      '<div class="card-meta"><span>' + esc(it.date) + '</span>' +
      it.tags.map(tagLink).join('') + '</div>' +
      '</div>';

    if (it.type === 'article') {
      html += '<div class="article-body">' + it.body + '</div>';
    } else {
      if (it.cover) {
        html += '<img class="work-cover" src="' + esc(it.cover) + '" alt="' + esc(it.title) + '">';
      }
      html += '<p style="max-width:640px">' + esc(it.summary) + '</p>';
      if (it.externalUrl) {
        html += '<div class="work-actions"><a class="btn" href="' + esc(it.externalUrl) +
          '" target="_blank" rel="noopener">打开作品 ↗</a></div>';
      }
      if (it.embed && it.externalUrl) {
        html += '<div class="embed-box">' +
          '<iframe src="' + esc(it.externalUrl) + '" title="' + esc(it.title) + '" loading="lazy"></iframe>' +
          '<div class="embed-note">在线预览 · 如无法显示，请点击上方按钮直接打开</div>' +
          '</div>';
      }
    }

    // 关联内容
    var related = (it.relatedIds || []).map(byId).filter(Boolean);
    if (related.length) {
      html += '<section><div class="section-head"><h2>关联内容</h2></div>' +
        listHTML(related) + '</section>';
    }

    el('detail').innerHTML = html;
  }

  /* ---------- 分发 ---------- */

  var pages = {
    home: pageHome,
    works: pageWorks,
    articles: pageArticles,
    tags: pageTags,
    tag: pageTag,
    search: pageSearch,
    item: pageItem,
    about: function () {}
  };

  var page = document.body.getAttribute('data-page') || 'home';
  renderShell(page);
  if (pages[page]) pages[page]();
})();
