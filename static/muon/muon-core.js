/* Math for the Muon explainer. Pure functions, no DOM. Works in the browser and in Node. */
(function (root) {
  'use strict';

  // ---------- seeded randomness ----------
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(r) {
    var u = 0; while (u === 0) u = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
  }

  // ---------- small dense matrices (arrays of rows) ----------
  function zeros(m, n) { var A = []; for (var i = 0; i < m; i++) { A.push(new Array(n).fill(0)); } return A; }
  function randn(m, n, r, s) { var A = zeros(m, n); for (var i = 0; i < m; i++) for (var j = 0; j < n; j++) A[i][j] = gauss(r) * (s || 1); return A; }
  function T(A) { var m = A.length, n = A[0].length, B = zeros(n, m); for (var i = 0; i < m; i++) for (var j = 0; j < n; j++) B[j][i] = A[i][j]; return B; }
  function mul(A, B) {
    var m = A.length, k = B.length, n = B[0].length, C = zeros(m, n);
    for (var i = 0; i < m; i++) { var Ai = A[i], Ci = C[i]; for (var p = 0; p < k; p++) { var a = Ai[p]; if (a === 0) continue; var Bp = B[p]; for (var j = 0; j < n; j++) Ci[j] += a * Bp[j]; } }
    return C;
  }
  function map2(A, B, f) { return A.map(function (row, i) { return row.map(function (v, j) { return f(v, B[i][j]); }); }); }
  function map1(A, f) { return A.map(function (row) { return row.map(f); }); }
  function axpy(a, X, Y) { return map2(X, Y, function (x, y) { return a * x + y; }); }
  function scale(A, s) { return map1(A, function (v) { return v * s; }); }
  function frob(A) { var s = 0; for (var i = 0; i < A.length; i++) for (var j = 0; j < A[0].length; j++) s += A[i][j] * A[i][j]; return Math.sqrt(s); }
  function diagMul(A, d) { return A.map(function (row) { return row.map(function (v, j) { return v * d[j]; }); }); } // A * diag(d)
  // m x n matrix with orthonormal columns (m >= n), by Gram-Schmidt on a Gaussian matrix
  function randOrth(m, n, r) {
    var cols = [];
    for (var j = 0; j < n; j++) {
      var v = []; for (var i = 0; i < m; i++) v.push(gauss(r));
      for (var pass = 0; pass < 2; pass++) for (var k = 0; k < cols.length; k++) {
        var d = 0; for (i = 0; i < m; i++) d += v[i] * cols[k][i];
        for (i = 0; i < m; i++) v[i] -= d * cols[k][i];
      }
      var nn = 0; for (i = 0; i < m; i++) nn += v[i] * v[i]; nn = Math.sqrt(nn);
      for (i = 0; i < m; i++) v[i] /= nn;
      cols.push(v);
    }
    return T(cols);
  }
  function col(A, j) { return A.map(function (row) { return row[j]; }); }
  // u^T A v
  function bilinear(u, A, v) { var s = 0; for (var i = 0; i < A.length; i++) { var t = 0; for (var j = 0; j < v.length; j++) t += A[i][j] * v[j]; s += u[i] * t; } return s; }

  // ---------- Newton-Schulz, as in KellerJordan/Muon muon.py ----------
  var NS_TUNED = [3.4445, -4.7750, 2.0315];   // Muon's coefficients
  var NS_CUBIC = [1.5, -0.5, 0];              // classic Newton-Schulz
  function nsScalar(x, steps, c) {
    c = c || NS_TUNED;
    for (var k = 0; k < steps; k++) { var x2 = x * x; x = x * (c[0] + x2 * (c[1] + x2 * c[2])); }
    return x;
  }
  function newtonSchulz(G, steps, c) {
    c = c || NS_TUNED; if (steps === undefined) steps = 5;
    var tall = G.length > G[0].length;
    var X = scale(tall ? T(G) : G, 1 / (frob(G) + 1e-7));
    for (var k = 0; k < steps; k++) {
      var A = mul(X, T(X));
      var B = axpy(c[2], mul(A, A), scale(A, c[1]));   // b*A + c*A@A
      X = axpy(c[0], X, mul(B, X));                    // a*X + B@X
    }
    return tall ? T(X) : X;
  }

  // ---------- Figure 1: five optimizers on a tilted 2-D valley ----------
  // f(p) = 0.5 * (a^2 + kappa * b^2), where (a, b) are p's coordinates along / across the valley.
  function valley(kappa, deg) {
    var th = deg * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
    return {
      loss: function (p) { var a = c * p[0] + s * p[1], b = -s * p[0] + c * p[1]; return 0.5 * (a * a + kappa * b * b); },
      grad: function (p) { var a = c * p[0] + s * p[1], b = -s * p[0] + c * p[1]; return [c * a - s * kappa * b, s * a + c * kappa * b]; },
      start: [c * -4 - s * 1.2, s * -4 + c * 1.2]
    };
  }
  var RACE = {
    sgd:      { name: 'SGD' },
    momentum: { name: 'Momentum', beta: 0.9 },
    nesterov: { name: 'Nesterov', beta: 0.9 },
    rmsprop:  { name: 'RMSProp', lr: 0.05, beta2: 0.99, eps: 1e-8 },
    adam:     { name: 'Adam', lr: 0.05, beta1: 0.9, beta2: 0.999, eps: 1e-8 }
  };
  // P = { loss, grad, start, lr }: lr is the step size for SGD, momentum and Nesterov
  function raceOn(P, steps) {
    var V = P, out = {}, lrSgd = P.lr;
    Object.keys(RACE).forEach(function (key) {
      var h = RACE[key], p = V.start.slice(), m = [0, 0], v = [0, 0], path = [p.slice()], loss = [V.loss(p)];
      for (var t = 1; t <= steps; t++) {
        var g, i, d = [0, 0];
        if (key === 'sgd') { g = V.grad(p); d = [lrSgd * g[0], lrSgd * g[1]]; }
        else if (key === 'momentum') { g = V.grad(p); for (i = 0; i < 2; i++) { m[i] = h.beta * m[i] + g[i]; d[i] = lrSgd * m[i]; } }
        else if (key === 'nesterov') { // gradient at the look-ahead point
          g = V.grad([p[0] - lrSgd * h.beta * m[0], p[1] - lrSgd * h.beta * m[1]]);
          for (i = 0; i < 2; i++) { m[i] = h.beta * m[i] + g[i]; d[i] = lrSgd * m[i]; }
        } else if (key === 'rmsprop') { g = V.grad(p); for (i = 0; i < 2; i++) { v[i] = h.beta2 * v[i] + (1 - h.beta2) * g[i] * g[i]; d[i] = h.lr * g[i] / (Math.sqrt(v[i]) + h.eps); } }
        else { g = V.grad(p); for (i = 0; i < 2; i++) {
          m[i] = h.beta1 * m[i] + (1 - h.beta1) * g[i]; v[i] = h.beta2 * v[i] + (1 - h.beta2) * g[i] * g[i];
          var mh = m[i] / (1 - Math.pow(h.beta1, t)), vh = v[i] / (1 - Math.pow(h.beta2, t));
          d[i] = h.lr * mh / (Math.sqrt(vh) + h.eps); } }
        p = [p[0] - d[0], p[1] - d[1]]; path.push(p.slice()); loss.push(V.loss(p));
      }
      out[key] = { name: h.name, path: path, loss: loss };
    });
    return out;
  }
  function race(kappa, deg, steps) { var V = valley(kappa, deg); V.lr = 1 / kappa; return raceOn(V, steps); }
  // Saddle at the origin, minima at (0, +1) and (0, -1):  f = x^2 + y^4/4 - y^2/2
  function saddle() {
    return { lr: 0.04, start: [-1.4, 0.001], min: -0.25,
      loss: function (p) { var y2 = p[1] * p[1]; return p[0] * p[0] + 0.25 * y2 * y2 - 0.5 * y2; },
      grad: function (p) { return [2 * p[0], p[1] * p[1] * p[1] - p[1]]; } };
  }

  // ---------- Figure 3: how each rule spreads one step across the gradient's singular directions ----------
  function allocation(decay, seed) {
    var m = 24, n = 16, r = rng(seed || 7), U = randOrth(m, n, r), V = randOrth(n, n, r), s = [];
    for (var i = 0; i < n; i++) s.push(Math.exp(-decay * i));
    var G = mul(diagMul(U, s), T(V));
    var S = map1(G, function (x) { return x > 0 ? 1 : x < 0 ? -1 : 0; });
    var O = newtonSchulz(G, 5);
    var res = { sigma: s, sgd: [], adam: [], muon: [], muonRaw: [] };
    for (i = 0; i < n; i++) { var u = col(U, i), v = col(V, i); res.sgd.push(s[i]); res.adam.push(bilinear(u, S, v)); res.muonRaw.push(bilinear(u, O, v)); }
    var norm = function (a) { var mx = Math.max.apply(null, a.map(Math.abs)); return a.map(function (x) { return x / mx; }); };
    res.sgd = norm(res.sgd); res.adam = norm(res.adam); res.muon = norm(res.muonRaw);
    return res;
  }

  // ---------- Figure 5: one linear layer, inputs with an ill-conditioned covariance ----------
  // loss(W) = 0.5 * tr((W - W*) C (W - W*)^T) / (same at W = 0);  gradient = (W - W*) C
  var TOY_GRID = { sgd: [], adam: [], muon: [] };
  (function () { for (var i = 0; i < 13; i++) { var f = Math.pow(10, i / 4); TOY_GRID.sgd.push(0.002 * f); TOY_GRID.adam.push(0.0005 * f); TOY_GRID.muon.push(0.0005 * f); } })();
  function toyProblem(kappa, rotate, seed) {
    var n = 16, r = rng(seed || 3), Wstar = randn(n, n, r, 1 / Math.sqrt(n)), Q = randOrth(n, n, r), lam = [];
    for (var i = 0; i < n; i++) lam.push(Math.pow(kappa, -i / (n - 1)));
    var I = zeros(n, n); for (i = 0; i < n; i++) I[i][i] = 1;
    var C = rotate ? mul(diagMul(Q, lam), T(Q)) : diagMul(I, lam);
    var loss = function (W) { var E = axpy(-1, Wstar, W), EC = mul(E, C), s = 0; for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) s += E[i][j] * EC[i][j]; return 0.5 * s; };
    var L0 = loss(zeros(n, n));
    return { n: n, loss: function (W) { return loss(W) / L0; }, grad: function (W) { return mul(axpy(-1, Wstar, W), C); } };
  }
  function toyRun(P, opt, lr0, steps) {
    var n = P.n, W = zeros(n, n), M = zeros(n, n), Vv = zeros(n, n), curve = [P.loss(W)];
    for (var t = 1; t <= steps; t++) {
      var lr = lr0 * (1 - (t - 1) / steps), G = P.grad(W), D;   // linear decay to zero
      if (opt === 'sgd') { M = axpy(0.9, M, G); D = axpy(0.9, M, G); }                       // Nesterov momentum
      else if (opt === 'adam') {
        M = axpy(0.9, M, scale(G, 0.1)); Vv = map2(Vv, G, function (v, g) { return 0.999 * v + 0.001 * g * g; });
        var c1 = 1 - Math.pow(0.9, t), c2 = 1 - Math.pow(0.999, t);
        D = map2(M, Vv, function (m, v) { return (m / c1) / (Math.sqrt(v / c2) + 1e-8); });
      } else {                                                                              // Muon, as in muon.py
        M = axpy(0.95, M, scale(G, 0.05));            // momentum.lerp_(grad, 1 - beta)
        D = newtonSchulz(axpy(0.95, M, scale(G, 0.05)), 5); // Nesterov mix, then orthogonalize
      }
      W = axpy(-lr, D, W);
      var L = P.loss(W); if (!isFinite(L) || L > 1e6) { L = 1e6; curve.push(L); break; }
      curve.push(L);
    }
    while (curve.length < steps + 1) curve.push(curve[curve.length - 1]);
    return curve;
  }
  function toy(kappa, rotate, steps, seed) {
    var P = toyProblem(kappa, rotate, seed), out = {};
    ['sgd', 'adam', 'muon'].forEach(function (opt) {
      var best = null;
      TOY_GRID[opt].forEach(function (lr) { var c = toyRun(P, opt, lr, steps), f = c[c.length - 1]; if (!best || f < best.final) best = { lr: lr, curve: c, final: f }; });
      out[opt] = best;
    });
    return out;
  }

  var api = { rng: rng, zeros: zeros, randn: randn, T: T, mul: mul, frob: frob, randOrth: randOrth, scale: scale,
    NS_TUNED: NS_TUNED, NS_CUBIC: NS_CUBIC, nsScalar: nsScalar, newtonSchulz: newtonSchulz,
    valley: valley, saddle: saddle, RACE: RACE, race: race, raceOn: raceOn, allocation: allocation, toy: toy, toyProblem: toyProblem, toyRun: toyRun, TOY_GRID: TOY_GRID };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MuonCore = api;
})(typeof window !== 'undefined' ? window : this);
