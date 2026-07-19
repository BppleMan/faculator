// 卡片加载器:优先使用编译产物 _ds_bundle.js,缺失时用 Babel 现场编译组件源码
(function () {
  var base = document.currentScript.src.replace(/components\/_card_loader\.js.*$/, '');
  function scan() {
    for (var i = 0, ks = Object.getOwnPropertyNames(window); i < ks.length; i++) {
      try {
        var v = window[ks[i]];
        if (v && typeof v === 'object' && typeof v.Button === 'function' && typeof v.Panel === 'function') return v;
      } catch (e) {}
    }
    return null;
  }
  var FILES = [
    'buttons/Button', 'buttons/IconButton', 'buttons/LatchGroup',
    'inputs/Input', 'inputs/NumberField', 'inputs/Select',
    'toggles/Checkbox', 'toggles/Radio', 'toggles/Switch', 'toggles/Segmented',
    'feedback/Badge', 'feedback/Tag', 'feedback/Alert', 'feedback/ProgressBar',
    'overlays/Tooltip', 'overlays/Dialog',
    'data/Gauge', 'data/StatCard', 'data/DataTable', 'data/ChartFrame',
    'navigation/Tabs', 'navigation/Breadcrumb', 'navigation/SideNav',
    'surfaces/Panel',
  ];
  window.__dsReady = (async function () {
    var ns = scan();
    if (ns) return ns;
    try {
      var r = await fetch(base + '_ds_bundle.js');
      if (r.ok) { (0, eval)(await r.text()); ns = scan(); if (ns) return ns; }
    } catch (e) {}
    ns = {};
    await Promise.all(FILES.map(async function (p) {
      try {
        var resp = await fetch(base + 'components/' + p + '.jsx');
        if (!resp.ok) throw new Error('fetch ' + p + ' -> ' + resp.status);
        var src = await resp.text();
        var code = Babel.transform(src, { presets: [['react', { runtime: 'classic' }]], plugins: ['transform-modules-commonjs'] }).code;
        var module = { exports: {} };
        new Function('require', 'module', 'exports', 'React', code)(function () { return React; }, module, module.exports, React);
        Object.assign(ns, module.exports);
      } catch (e) {
        console.error('[card_loader] ' + p + ': ' + (e && e.message));
        throw e;
      }
    }));
    return ns;
  })();
  window.__dsReady.catch(function (e) {
    console.error('[card_loader] failed: ' + (e && e.message));
    var el = document.createElement('pre');
    el.style.cssText = 'color:#E36A6A;font:12px monospace;padding:12px';
    el.textContent = 'card_loader failed: ' + (e && e.message);
    document.body.appendChild(el);
  });
  function runApps(ns) {
    document.querySelectorAll('script[type="text/x-app"]').forEach(function (s) {
      try {
        var code = Babel.transform(s.textContent, { presets: [['react', { runtime: 'classic' }]] }).code;
        new Function('React', 'ReactDOM', 'NS', code)(React, ReactDOM, ns);
      } catch (e) { console.error('[card_loader] app: ' + (e && e.stack || e)); }
    });
  }
  window.__dsReady.then(function (ns) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { runApps(ns); });
    else runApps(ns);
  });
})();
