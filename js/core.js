/* ============================================================
   SONIC — EMERALD RUSH
   core.js — namespace, math helpers, drawing helpers
   ============================================================ */
(function () {
  'use strict';

  var S = window.S = {};

  S.W = 640;
  S.H = 360;
  S.TILE = 16;
  S.FPS = 60;
  S.STEP = 1000 / 60;
  S.VERSION = '1.0';

  /* ---------- math ---------- */
  S.clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  S.lerp = function (a, b, t) { return a + (b - a) * t; };
  S.approach = function (cur, target, step) {
    if (cur < target) return Math.min(cur + step, target);
    if (cur > target) return Math.max(cur - step, target);
    return target;
  };
  S.sgn = function (v) { return v < 0 ? -1 : (v > 0 ? 1 : 0); };
  S.rand = function (a, b) { return a + Math.random() * (b - a); };
  S.randInt = function (a, b) { return Math.floor(a + Math.random() * (b - a + 1)); };
  S.choice = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  S.dist = function (x1, y1, x2, y2) { var dx = x2 - x1, dy = y2 - y1; return Math.sqrt(dx * dx + dy * dy); };
  S.wrapAngle = function (a) { while (a < 0) a += Math.PI * 2; while (a >= Math.PI * 2) a -= Math.PI * 2; return a; };

  S.mulberry32 = function (seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  S.aabb = function (a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  };

  /* ---------- formatting ---------- */
  S.pad = function (n, len) {
    var s = String(Math.floor(n));
    while (s.length < len) s = '0' + s;
    return s;
  };
  S.fmtTime = function (frames) {
    var total = Math.floor(frames / 60);
    var m = Math.floor(total / 60);
    var sec = total % 60;
    return S.pad(m, 1) + "'" + S.pad(sec, 2) + '"' + S.pad(Math.floor((frames % 60) * 100 / 60), 2);
  };
  S.fmtClock = function (frames) {
    var total = Math.floor(frames / 60);
    var m = Math.floor(total / 60);
    var sec = total % 60;
    return S.pad(m, 1) + ':' + S.pad(sec, 2);
  };

  /* ---------- drawing ---------- */
  S.text = function (ctx, str, x, y, o) {
    o = o || {};
    var size = o.size || 16;
    var weight = o.weight || 'bold';
    var family = o.family || '"Trebuchet MS","Segoe UI",sans-serif';
    ctx.save();
    ctx.font = weight + ' ' + size + 'px ' + family;
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = o.baseline || 'alphabetic';
    if (o.letterSpacing && ctx.letterSpacing !== undefined) ctx.letterSpacing = o.letterSpacing;
    if (o.shadow !== false) {
      ctx.fillStyle = o.shadowColor || 'rgba(0,0,0,.65)';
      ctx.fillText(str, x + (o.shadowOff || 2), y + (o.shadowOff || 2));
    }
    if (o.outline) {
      ctx.lineWidth = o.outlineW || 4;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = o.outline;
      ctx.strokeText(str, x, y);
    }
    if (o.gradient) {
      var g = ctx.createLinearGradient(0, y - size, 0, y + size * .3);
      g.addColorStop(0, o.gradient[0]);
      g.addColorStop(1, o.gradient[1]);
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = o.color || '#fff';
    }
    ctx.fillText(str, x, y);
    ctx.restore();
  };

  S.measure = function (ctx, str, size, weight) {
    ctx.save();
    ctx.font = (weight || 'bold') + ' ' + (size || 16) + 'px "Trebuchet MS","Segoe UI",sans-serif';
    var w = ctx.measureText(str).width;
    ctx.restore();
    return w;
  };

  S.roundRect = function (ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  S.ellipse = function (ctx, x, y, rx, ry, rot) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, Math.PI * 2);
  };

  S.circle = function (ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2);
  };

  S.poly = function (ctx, pts) {
    ctx.beginPath();
    for (var i = 0; i < pts.length; i += 2) {
      if (i === 0) ctx.moveTo(pts[0], pts[1]); else ctx.lineTo(pts[i], pts[i + 1]);
    }
    ctx.closePath();
  };

  /* Horizontal scanline shine used on menus/titles */
  S.shine = function (ctx, x, y, w, h, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var p = ((t * 0.4) % (w + 200)) - 100;
    var g = ctx.createLinearGradient(x + p - 60, 0, x + p + 60, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(.5, 'rgba(255,255,255,.22)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  };

  S.hsl = function (h, s, l, a) {
    return 'hsla(' + h + ',' + s + '%,' + l + '%,' + (a === undefined ? 1 : a) + ')';
  };

  /* Shade a hex color by amount (-1..1) */
  S.shade = function (hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (amt > 0) { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
    else { r *= (1 + amt); g *= (1 + amt); b *= (1 + amt); }
    return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
  };

  S.mkCanvas = function (w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  };

})();
