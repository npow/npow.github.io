/* Interactive figures for the Muon explainer. Needs muon-core.js. */
(function () {
  'use strict';
  var C = window.MuonCore; if (!C) return;
  var COLOR = { sgd: 'var(--mu-blue)', adam: 'var(--mu-orange)', muon: 'var(--mu-aqua)', momentum: 'var(--mu-yellow)', nesterov: 'var(--mu-magenta)', rmsprop: 'var(--mu-violet)', ref: 'var(--mu-ink-2)' };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function body(id) { // insert a working area above the figure's caption
    var fig = document.getElementById(id); if (!fig) return null;
    var div = document.createElement('div'); div.className = 'mu-body';
    fig.insertBefore(div, fig.querySelector('figcaption')); return div;
  }
  function h(html) { var t = document.createElement('div'); t.innerHTML = html; return t.firstElementChild; }
  function fmt(v) { var a = Math.abs(v); if (v === 0) return '0'; return (a >= 1000 || a < 0.01) ? v.toExponential(1) : (a >= 10 ? v.toFixed(0) : a >= 1 ? v.toFixed(2) : v.toFixed(3)); }
  function slider(parent, o) {
    var w = h('<label class="mu-ctl"><span>' + o.label + ' <output></output></span><input type="range" min="' + o.min + '" max="' + o.max + '" step="' + o.step + '" value="' + o.value + '"></label>');
    var inp = w.querySelector('input'), out = w.querySelector('output');
    var val = function () { return o.map ? o.map(+inp.value) : +inp.value; };
    var show = function () { out.textContent = o.fmt ? o.fmt(val()) : val(); };
    inp.addEventListener(o.lazy ? 'change' : 'input', function () { show(); o.on(val()); });
    if (o.lazy) inp.addEventListener('input', show);
    show(); parent.appendChild(w); return { value: val };
  }
  function legend(parent, items) {
    var el = parent.querySelector('.mu-legend') || parent.appendChild(h('<div class="mu-legend"></div>'));
    el.innerHTML = items.map(function (it) { return '<span><i style="background:' + it.color + (it.dash ? ';opacity:.6' : '') + '"></i>' + it.name + '</span>'; }).join('');
  }

  // ---------- generic line chart with crosshair + tooltip ----------
  function lineChart(host, o) {
    var W = o.w || 560, H = o.h || 300, L = 52, R = 14, Tp = 12, B = 40;
    var lx = function (v) { return o.xlog ? Math.log10(v) : v; }, ly = function (v) { return o.ylog ? Math.log10(v) : v; };
    var x0 = lx(o.x[0]), x1 = lx(o.x[1]), y0 = ly(o.y[0]), y1 = ly(o.y[1]);
    var sx = function (v) { return L + (lx(v) - x0) / (x1 - x0) * (W - L - R); };
    var sy = function (v) { v = Math.min(o.y[1], Math.max(o.y[0], v)); return H - B - (ly(v) - y0) / (y1 - y0) * (H - Tp - B); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (o.aria || '') + '">';
    if (o.band) s += '<rect class="mu-band" x="' + L + '" y="' + sy(o.band[1]) + '" width="' + (W - L - R) + '" height="' + (sy(o.band[0]) - sy(o.band[1])) + '"/>' +
      '<text class="mu-tick" x="' + (L + 4) + '" y="' + (sy(o.band[1]) - 6) + '">' + o.band[2] + '</text>';
    o.yticks.forEach(function (t) { var y = sy(t); s += '<line class="mu-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"/><text class="mu-tick" x="' + (L - 7) + '" y="' + (y + 4) + '" text-anchor="end">' + (o.yfmt ? o.yfmt(t) : t) + '</text>'; });
    o.xticks.forEach(function (t) { s += '<text class="mu-tick" x="' + sx(t) + '" y="' + (H - B + 16) + '" text-anchor="middle">' + (o.xfmt ? o.xfmt(t) : t) + '</text>'; });
    s += '<line class="mu-axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>';
    s += '<text class="mu-lab" x="' + ((L + W - R) / 2) + '" y="' + (H - 5) + '" text-anchor="middle">' + o.xlabel + '</text>';
    s += '<text class="mu-lab" transform="translate(13 ' + ((Tp + H - B) / 2) + ') rotate(-90)" text-anchor="middle">' + o.ylabel + '</text>';
    o.series.forEach(function (se) {
      var d = ''; for (var i = 0; i < se.ys.length; i++) d += (i ? 'L' : 'M') + sx(o.xs[i]).toFixed(1) + ' ' + sy(se.ys[i]).toFixed(1);
      s += '<path class="mu-line" style="stroke:' + se.color + '"' + (se.dash ? ' stroke-dasharray="5 4"' : '') + ' d="' + d + '"/>';
      if (o.markers) for (i = 0; i < se.ys.length; i++) s += '<circle class="mu-dot" r="4" style="fill:' + se.color + '" cx="' + sx(o.xs[i]) + '" cy="' + sy(se.ys[i]) + '"/>';
    });
    s += '<g class="mu-hover" visibility="hidden"><line class="mu-cross" y1="' + Tp + '" y2="' + (H - B) + '"/>' + o.series.map(function (se) { return '<circle class="mu-dot" r="4.5" style="fill:' + se.color + '"/>'; }).join('') + '</g>';
    s += '<rect class="mu-hit" x="' + L + '" y="' + Tp + '" width="' + (W - L - R) + '" height="' + (H - Tp - B) + '"/></svg><div class="mu-tip" hidden></div>';
    host.innerHTML = s;
    var svg = host.querySelector('svg'), g = svg.querySelector('.mu-hover'), tip = host.querySelector('.mu-tip'), dots = g.querySelectorAll('circle'), cross = g.querySelector('line');
    var n = o.series[0].ys.length;
    function move(ev) {
      var r = svg.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width * W, best = 0, bd = 1e9;
      for (var i = 0; i < n; i++) { var dd = Math.abs(sx(o.xs[i]) - px); if (dd < bd) { bd = dd; best = i; } }
      var X = sx(o.xs[best]); cross.setAttribute('x1', X); cross.setAttribute('x2', X);
      var rows = o.series.map(function (se, k) { dots[k].setAttribute('cx', X); dots[k].setAttribute('cy', sy(se.ys[best])); return '<div><i style="background:' + se.color + '"></i>' + se.name.replace(/ \(.*\)$/, '') + '<b>' + fmt(se.ys[best]) + '</b></div>'; });
      tip.innerHTML = '<div class="mu-tip-h">' + o.tipx(o.xs[best]) + '</div>' + rows.join('');
      g.setAttribute('visibility', 'visible'); tip.hidden = false;
      var left = X / W * r.width; tip.style.left = Math.min(Math.max(left + 12, 0), r.width - tip.offsetWidth) + 'px';
      if (left + 12 + tip.offsetWidth > r.width) tip.style.left = Math.max(0, left - 12 - tip.offsetWidth) + 'px';
    }
    var hit = svg.querySelector('.mu-hit');
    hit.addEventListener('pointermove', move); hit.addEventListener('pointerdown', move);
    hit.addEventListener('pointerleave', function () { g.setAttribute('visibility', 'hidden'); tip.hidden = true; });
  }
  function logTicks(lo, hi, every) { var t = []; for (var e = Math.ceil(Math.log10(lo)); e <= Math.log10(hi) + 1e-9; e += every) t.push(Math.pow(10, e)); return t; }
  function pow10(v) { var e = Math.round(Math.log10(v)); return e === 0 ? '1' : e === 1 ? '10' : '10' + String(e).replace('-', '⁻').replace(/\d/g, function (d) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]; }); }

  // ---------- 3-D loss surface with optimizer paths ----------
  (function () {
    var root = body('mu-surface'); if (!root) return;
    var STEPS = 150, keys = ['sgd', 'momentum', 'nesterov', 'rmsprop', 'adam'], N = 30, W = 640, H = 400, EL = 36 * Math.PI / 180;
    var V50 = C.valley(50, 0); V50.lr = 1 / 50; V50.min = 0;
    var SURF = {
      valley: { P: V50, xr: 4.6, yr: 2.2, az: 62, marks: [[0, 0]] },
      saddle: { P: C.saddle(), xr: 1.5, yr: 1.6, az: -58, marks: [[0, 1], [0, -1]] }
    };
    Object.keys(SURF).forEach(function (k) { var S = SURF[k], mx = 0;
      S.h = function (x, y) { return Math.sqrt(Math.max(0, S.P.loss([x, y]) - S.P.min)); };
      for (var i = 0; i <= N; i++) for (var j = 0; j <= N; j++) mx = Math.max(mx, S.h(-S.xr + 2 * S.xr * i / N, -S.yr + 2 * S.yr * j / N));
      S.hmax = mx; S.data = C.raceOn(S.P, STEPS); });
    var which = 'valley', az = SURF.valley.az, t = STEPS, raf;
    var ctl = root.appendChild(h('<div class="mu-controls"></div>'));
    var seg = ctl.appendChild(h('<div class="mu-seg" role="group" aria-label="Surface"><button type="button" aria-pressed="true" data-k="valley">Valley</button><button type="button" aria-pressed="false" data-k="saddle">Saddle</button></div>'));
    var rot = h('<label class="mu-ctl"><span>Rotate <output></output></span><input type="range" min="-180" max="180" step="1"></label>'); ctl.appendChild(rot);
    var rotIn = rot.querySelector('input'), rotOut = rot.querySelector('output');
    var btn = ctl.appendChild(h('<button type="button">▶ Play</button>'));
    legend(root, keys.map(function (k) { return { name: C.RACE[k].name, color: COLOR[k] }; }));
    var panel = root.appendChild(h('<div class="mu-panel mu-3d"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Three-dimensional loss surface with the path of each optimizer drawn on it"><g class="mu-mesh"></g><g class="mu-paths"></g></svg></div>'));
    var svg = panel.querySelector('svg'), mesh = svg.querySelector('.mu-mesh'), paths = svg.querySelector('.mu-paths');
    function proj(S, x, y, lift) { // -> [screenX, screenY, depth]
      var X = x / S.xr, Y = y / S.yr * 0.72, Z = S.h(x, y) / S.hmax * 0.62 + (lift || 0), a = az * Math.PI / 180;
      var xr = X * Math.cos(a) - Y * Math.sin(a), yr = X * Math.sin(a) + Y * Math.cos(a);
      return [W / 2 + 230 * xr, H / 2 + 96 + 230 * (yr * Math.sin(EL) - Z * Math.cos(EL)), yr];
    }
    function drawMesh() {
      var S = SURF[which], quads = [], i, j;
      for (i = 0; i < N; i++) for (j = 0; j < N; j++) {
        var x0 = -S.xr + 2 * S.xr * i / N, x1 = -S.xr + 2 * S.xr * (i + 1) / N, y0 = -S.yr + 2 * S.yr * j / N, y1 = -S.yr + 2 * S.yr * (j + 1) / N;
        var c = [proj(S, x0, y0), proj(S, x1, y0), proj(S, x1, y1), proj(S, x0, y1)];
        quads.push({ d: (c[0][2] + c[1][2] + c[2][2] + c[3][2]) / 4, z: S.h((x0 + x1) / 2, (y0 + y1) / 2) / S.hmax,
          pts: c.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ') });
      }
      quads.sort(function (a, b) { return a.d - b.d; });
      mesh.innerHTML = quads.map(function (q) { return '<polygon class="mu-quad" points="' + q.pts + '" style="fill-opacity:' + (0.05 + 0.3 * q.z).toFixed(3) + '"/>'; }).join('');
    }
    function drawPaths() {
      var S = SURF[which], s = '';
      S.marks.forEach(function (m) { var q = proj(S, m[0], m[1], 0.004); s += '<circle class="mu-goal" r="3.5" cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '"/>'; });
      keys.forEach(function (key) {
        var pts = S.data[key].path.slice(0, t + 1).map(function (p) { return proj(S, Math.max(-S.xr, Math.min(S.xr, p[0])), Math.max(-S.yr, Math.min(S.yr, p[1])), 0.006); });
        var e = pts[pts.length - 1];
        s += '<path class="mu-line" style="stroke:' + COLOR[key] + '" d="' + pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('') + '"/>' +
          '<circle class="mu-dot" r="5" style="fill:' + COLOR[key] + '" cx="' + e[0].toFixed(1) + '" cy="' + e[1].toFixed(1) + '"/>';
      });
      paths.innerHTML = s;
    }
    function setAz(v) { az = ((v + 180) % 360 + 360) % 360 - 180; rotIn.value = Math.round(az); rotOut.textContent = Math.round(az) + '°'; drawMesh(); drawPaths(); }
    rotIn.addEventListener('input', function () { setAz(+rotIn.value); });
    seg.addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; cancelAnimationFrame(raf); which = b.getAttribute('data-k'); t = STEPS;
      Array.prototype.forEach.call(seg.children, function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); }); setAz(SURF[which].az); });
    btn.addEventListener('click', function () { cancelAnimationFrame(raf); if (reduceMotion) { t = STEPS; drawPaths(); return; }
      t = 0; (function tick() { drawPaths(); if (t < STEPS) { t++; raf = requestAnimationFrame(tick); } })(); });
    var drag = null; // drag the surface to spin it
    svg.addEventListener('pointerdown', function (ev) { drag = { x: ev.clientX, az: az }; svg.setPointerCapture(ev.pointerId); });
    svg.addEventListener('pointermove', function (ev) { if (drag) setAz(drag.az + (ev.clientX - drag.x) * 0.5); });
    ['pointerup', 'pointercancel'].forEach(function (n) { svg.addEventListener(n, function () { drag = null; }); });
    setAz(az);
  })();

  // ---------- Figure 1: the valley race ----------
  (function () {
    var root = body('mu-race'); if (!root) return;
    var STEPS = 150, keys = ['sgd', 'momentum', 'nesterov', 'rmsprop', 'adam'], kappa = 50, deg = 0, t = STEPS, data, raf;
    var ctl = root.appendChild(h('<div class="mu-controls"></div>'));
    slider(ctl, { label: 'Valley steepness κ', min: 0.7, max: 2.7, step: 0.05, value: Math.log10(50), map: function (v) { return Math.round(Math.pow(10, v)); }, on: function (v) { kappa = v; compute(); } });
    slider(ctl, { label: 'Valley rotation', min: 0, max: 90, step: 5, value: 0, fmt: function (v) { return v + '°'; }, on: function (v) { deg = v; compute(); } });
    var btn = ctl.appendChild(h('<button type="button">▶ Play</button>'));
    legend(root, keys.map(function (k) { return { name: C.RACE[k].name, color: COLOR[k] }; }));
    var row = root.appendChild(h('<div class="mu-row"><div class="mu-panel mu-map"></div><div class="mu-panel mu-chart"></div></div>'));
    var map = row.children[0], chart = row.children[1], S = 340, sc = S / 9.2;
    var X = function (p) { return (S / 2 + sc * Math.max(-9, Math.min(9, p[0]))).toFixed(1); }, Y = function (p) { return (S / 2 - sc * Math.max(-9, Math.min(9, p[1]))).toFixed(1); };
    function draw() {
      var s = '<svg viewBox="0 0 ' + S + ' ' + S + '" role="img" aria-label="Optimizer paths on a contour map of the valley"><g transform="translate(' + S / 2 + ' ' + S / 2 + ') rotate(' + (-deg) + ')">';
      for (var k = -1; k < 9; k++) { var c = 0.5 * (16 + kappa * 1.44) * Math.pow(2.2, -k); s += '<ellipse class="mu-contour" rx="' + (sc * Math.sqrt(2 * c)).toFixed(1) + '" ry="' + (sc * Math.sqrt(2 * c / kappa)).toFixed(1) + '"/>'; }
      s += '</g><circle class="mu-goal" cx="' + S / 2 + '" cy="' + S / 2 + '" r="3"/>';
      keys.forEach(function (key) {
        var pts = data[key].path.slice(0, t + 1), d = pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p) + ' ' + Y(p); }).join(''), e = pts[pts.length - 1];
        s += '<path class="mu-line mu-thin" style="stroke:' + COLOR[key] + '" d="' + d + '"/><circle class="mu-dot" r="4.5" style="fill:' + COLOR[key] + '" cx="' + X(e) + '" cy="' + Y(e) + '"/>';
      });
      map.innerHTML = s + '</svg>';
      var xs = []; for (var i = 0; i <= t; i++) xs.push(i);
      var top = Math.pow(10, Math.ceil(Math.log10(data.sgd.loss[0])));
      lineChart(chart, { w: 420, h: 340, x: [0, STEPS], y: [1e-9, top], ylog: true, xs: xs.length > 1 ? xs : [0, 0], xticks: [0, 50, 100, 150], yticks: logTicks(1e-9, top, 2), yfmt: pow10,
        xlabel: 'step', ylabel: 'loss (log scale)', aria: 'Loss per step for each optimizer', tipx: function (x) { return 'step ' + x; },
        series: keys.map(function (k) { var ys = data[k].loss.slice(0, t + 1); if (ys.length < 2) ys.push(ys[0]); return { name: C.RACE[k].name, color: COLOR[k], ys: ys }; }) });
    }
    function compute() { cancelAnimationFrame(raf); data = C.race(kappa, deg, STEPS); t = STEPS; draw(); }
    btn.addEventListener('click', function () {
      cancelAnimationFrame(raf); if (reduceMotion) { t = STEPS; draw(); return; }
      t = 0; (function tick() { draw(); if (t < STEPS) { t++; raf = requestAnimationFrame(tick); } })();
    });
    compute();
  })();

  // ---------- Figure 2: unit balls ----------
  (function () {
    var root = body('mu-balls'); if (!root) return;
    var ctl = root.appendChild(h('<div class="mu-controls"></div>')), row = root.appendChild(h('<div class="mu-row mu-three"></div>'));
    var S = 200, c0 = S / 2, u = 62;
    function arrow(x, y, cls, style) { var X = c0 + u * x, Y = c0 - u * y, a = Math.atan2(-y, x), hx = 8;
      return '<line class="' + cls + '" style="' + (style || '') + '" x1="' + c0 + '" y1="' + c0 + '" x2="' + X + '" y2="' + Y + '"/>' +
        '<path class="' + cls + ' mu-head" style="' + (style || '').replace('stroke', 'fill') + '" d="M' + X + ' ' + Y + 'L' + (X - hx * Math.cos(a - 0.4)) + ' ' + (Y - hx * Math.sin(a - 0.4)) + 'L' + (X - hx * Math.cos(a + 0.4)) + ' ' + (Y - hx * Math.sin(a + 0.4)) + 'Z"/>'; }
    function panel(title, sub, shape, d, step, color, ax) {
      return '<div class="mu-panel"><div class="mu-ptitle">' + title + '</div><svg viewBox="0 0 ' + S + ' ' + S + '" role="img" aria-label="' + title + '">' +
        '<line class="mu-grid" x1="8" x2="' + (S - 8) + '" y1="' + c0 + '" y2="' + c0 + '"/><line class="mu-grid" y1="8" y2="' + (S - 8) + '" x1="' + c0 + '" x2="' + c0 + '"/>' +
        '<text class="mu-tick" x="' + (S - 8) + '" y="' + (c0 + 14) + '" text-anchor="end">' + ax[0] + '</text><text class="mu-tick" x="' + (c0 + 6) + '" y="16">' + ax[1] + '</text>' +
        shape + arrow(d[0] * 1.45, d[1] * 1.45, 'mu-garrow') + arrow(step[0], step[1], 'mu-sarrow', 'stroke:' + color) + '</svg>' +
        '<div class="mu-read">step = (' + step[0].toFixed(2) + ', ' + step[1].toFixed(2) + ')</div><div class="mu-psub">' + sub + '</div></div>';
    }
    function draw(a) {
      var th = a * Math.PI / 180, d = [Math.cos(th), Math.sin(th)], sg = function (v) { return Math.abs(v) < 1e-9 ? 0 : v > 0 ? 1 : -1; };
      var circle = '<circle class="mu-ball" cx="' + c0 + '" cy="' + c0 + '" r="' + u + '"/>', sq = '<rect class="mu-ball" x="' + (c0 - u) + '" y="' + (c0 - u) + '" width="' + 2 * u + '" height="' + 2 * u + '"/>';
      row.innerHTML =
        panel('ℓ₂ ball → SGD', 'Step is proportional to the gradient.', circle, d, d, COLOR.sgd, ['w₁', 'w₂']) +
        panel('ℓ∞ ball → sign descent', 'Every coordinate moves ±1. Adam without its averages.', sq, d, [sg(d[0]), sg(d[1])], COLOR.adam, ['w₁', 'w₂']) +
        panel('Spectral ball → Muon', 'Same square, but the axes are the gradient’s own singular directions. Always the full corner.', sq, [Math.abs(d[0]), Math.abs(d[1])], [1, 1], COLOR.muon, ['u₁v₁ᵀ', 'u₂v₂ᵀ']);
    }
    slider(ctl, { label: 'Downhill direction', min: 0, max: 360, step: 1, value: 20, fmt: function (v) { return v + '°'; }, on: draw });
    draw(20);
  })();

  // ---------- Figure 3: spectral allocation ----------
  (function () {
    var root = body('mu-alloc'); if (!root) return;
    var ctl = root.appendChild(h('<div class="mu-controls"></div>'));
    legend(root, [{ name: 'SGD (raw gradient)', color: COLOR.sgd }, { name: 'Adam, averages off (sign)', color: COLOR.adam }, { name: 'Muon (5 Newton–Schulz steps)', color: COLOR.muon }]);
    var chart = root.appendChild(h('<div class="mu-panel mu-chart"></div>')), xs = []; for (var i = 1; i <= 16; i++) xs.push(i);
    function draw(decay) {
      var a = C.allocation(decay);
      lineChart(chart, { w: 640, h: 300, x: [1, 16], y: [-0.15, 1.05], xs: xs, xticks: [1, 4, 8, 12, 16], yticks: [0, 0.25, 0.5, 0.75, 1], markers: true,
        xlabel: 'singular direction of the gradient (1 = largest)', ylabel: 'step size, relative to largest', aria: 'Step size given to each singular direction by SGD, sign descent and Muon',
        tipx: function (x) { return 'direction ' + x + ' · gradient σ = ' + fmt(a.sigma[x - 1]); },
        series: [{ name: 'SGD', color: COLOR.sgd, ys: a.sgd }, { name: 'Adam (sign)', color: COLOR.adam, ys: a.adam }, { name: 'Muon', color: COLOR.muon, ys: a.muon }] });
    }
    slider(ctl, { label: 'How lopsided the gradient is (σ ratio between neighbours)', min: 0.05, max: 0.7, step: 0.05, value: 0.3, fmt: function (v) { return Math.exp(v).toFixed(2) + '×'; }, on: draw });
    draw(0.3);
  })();

  // ---------- Figure 4: Newton-Schulz ----------
  (function () {
    var root = body('mu-ns'); if (!root) return;
    var ctl = root.appendChild(h('<div class="mu-controls"></div>'));
    legend(root, [{ name: 'Muon’s tuned quintic (3.4445, −4.7750, 2.0315)', color: COLOR.muon }, { name: 'Classic cubic (1.5, −0.5)', color: COLOR.ref, dash: true }]);
    var chart = root.appendChild(h('<div class="mu-panel mu-chart"></div>')), read = root.appendChild(h('<div class="mu-read mu-left"></div>')), xs = [];
    for (var i = 0; i <= 240; i++) xs.push(Math.pow(10, -4 + 4 * i / 240));
    function draw(k) {
      var tuned = xs.map(function (x) { return C.nsScalar(x, k, C.NS_TUNED); }), cubic = xs.map(function (x) { return C.nsScalar(x, k, C.NS_CUBIC); });
      lineChart(chart, { w: 640, h: 300, x: [1e-4, 1], xlog: true, y: [0, 1.4], xs: xs, xticks: [1e-4, 1e-3, 1e-2, 1e-1, 1], xfmt: pow10, yticks: [0, 0.5, 1], band: [0.68, 1.2, 'band where 5 tuned steps land: 0.68 to 1.20'],
        xlabel: 'singular value going in (after dividing by the Frobenius norm)', ylabel: 'singular value coming out', aria: 'Output of the Newton–Schulz iteration as a function of the input singular value',
        tipx: function (x) { return 'in: ' + fmt(x); }, series: [{ name: 'Tuned quintic', color: COLOR.muon, ys: tuned }, { name: 'Classic cubic', color: COLOR.ref, ys: cubic, dash: true }] });
      var first = function (ys) { for (var j = 0; j < xs.length; j++) if (ys[j] >= 0.68) return xs[j]; return null; };
      var a = first(tuned), b = first(cubic);
      read.textContent = 'After ' + k + ' step' + (k === 1 ? '' : 's'), read.textContent += ': tuned quintic lifts every singular value above ' + (a ? fmt(a) : '—') + ' to at least 0.68; the classic cubic only those above ' + (b ? fmt(b) : '1 (none yet)') + '.';
    }
    slider(ctl, { label: 'Newton–Schulz steps', min: 1, max: 10, step: 1, value: 5, on: draw });
    draw(5);
  })();

  // ---------- Figure 5: one linear layer ----------
  (function () {
    var root = body('mu-toy'); if (!root) return;
    var STEPS = 150, kappa = 1000, rotate = true, xs = []; for (var i = 0; i <= STEPS; i++) xs.push(i);
    var ctl = root.appendChild(h('<div class="mu-controls"></div>'));
    slider(ctl, { label: 'Input conditioning κ', min: 1, max: 4, step: 0.25, value: 3, lazy: true, map: function (v) { return Math.round(Math.pow(10, v)); }, on: function (v) { kappa = v; run(); } });
    var chk = ctl.appendChild(h('<label class="mu-check"><input type="checkbox" checked> Rotate the input features</label>')).querySelector('input');
    chk.addEventListener('change', function () { rotate = chk.checked; run(); });
    var leg = root.appendChild(h('<div class="mu-legend"></div>')), chart = root.appendChild(h('<div class="mu-panel mu-chart"><p class="mu-wait">Running 39 training runs…</p></div>'));
    function run() {
      chart.classList.add('mu-busy');
      setTimeout(function () {
        var r = C.toy(kappa, rotate, STEPS), names = { sgd: 'SGD + Nesterov', adam: 'Adam', muon: 'Muon' };
        var series = ['sgd', 'adam', 'muon'].map(function (k) { return { name: names[k] + ' (best lr ' + fmt(r[k].lr) + ')', color: COLOR[k], ys: r[k].curve.map(function (v) { return Math.max(v, 1e-12); }) }; });
        leg.innerHTML = ''; legend(root, series);
        var lo = Math.min.apply(null, series.map(function (se) { return Math.min.apply(null, se.ys); })), floor = Math.pow(10, Math.max(-12, Math.floor(Math.log10(lo) / 3) * 3));
        lineChart(chart, { w: 640, h: 320, x: [0, STEPS], y: [floor, 1], ylog: true, xs: xs, xticks: [0, 50, 100, 150], yticks: logTicks(floor, 1, 3), yfmt: pow10,
          xlabel: 'step', ylabel: 'loss ÷ starting loss (log)', aria: 'Training loss for SGD, Adam and Muon on a 16 by 16 linear layer', tipx: function (x) { return 'step ' + x; }, series: series });
        chart.classList.remove('mu-busy');
      }, 30);
    }
    run();
  })();
})();
