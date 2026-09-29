/* ============================================================
   ui.js — componentes de menu reaproveitáveis
   ============================================================ */
(function () {
  'use strict';
  var S = window.S;
  var UI = S.UI = {};

  UI.panel = function (ctx, x, y, w, h, o) {
    o = o || {};
    ctx.save();
    ctx.globalAlpha = o.alpha === undefined ? .82 : o.alpha;
    var g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, o.top || 'rgba(16,24,58,.96)');
    g.addColorStop(1, o.bottom || 'rgba(8,12,30,.96)');
    ctx.fillStyle = g;
    S.roundRect(ctx, x, y, w, h, o.r || 12); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = o.border || 'rgba(120,170,255,.45)';
    ctx.lineWidth = 2;
    S.roundRect(ctx, x + 1, y + 1, w - 2, h - 2, o.r || 12); ctx.stroke();
    ctx.restore();
  };

  /* Menu vertical simples.
     items = [{label, value, disabled, hint}] */
  UI.menu = function (ctx, items, sel, x, y, o) {
    o = o || {};
    var gap = o.gap || 34, size = o.size || 20, w = o.w || 300;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var iy = y + i * gap;
      var on = i === sel;
      if (on) {
        ctx.save();
        var gl = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
        gl.addColorStop(0, 'rgba(80,160,255,0)');
        gl.addColorStop(.5, 'rgba(80,160,255,.38)');
        gl.addColorStop(1, 'rgba(80,160,255,0)');
        ctx.fillStyle = gl;
        ctx.fillRect(x - w / 2, iy - size + 4, w, size + 10);
        ctx.restore();
      }
      var col = it.disabled ? 'rgba(180,190,210,.4)' : (on ? '#ffd23c' : '#e6ecff');
      S.text(ctx, it.label, o.align === 'left' ? x - w / 2 + 16 : x, iy, {
        size: size, color: col, align: o.align || 'center',
        outline: 'rgba(0,0,0,.65)', outlineW: 4, shadow: false
      });
      if (it.value !== undefined) {
        S.text(ctx, it.value, x + w / 2 - 16, iy, {
          size: size - 2, color: on ? '#ffffff' : '#9fb0cc', align: 'right',
          outline: 'rgba(0,0,0,.65)', outlineW: 4, shadow: false
        });
      }
      if (on) {
        var ax = (o.align === 'left' ? x - w / 2 + 4 : x - S.measure(ctx, it.label, size) / 2 - 18);
        S.text(ctx, '▶', ax, iy, { size: size - 4, color: '#ffd23c', shadow: false });
      }
    }
  };

  UI.hint = function (ctx, txt, y) {
    S.text(ctx, txt, S.W / 2, y || S.H - 16, {
      size: 12, color: 'rgba(220,230,255,.75)', align: 'center', shadow: false
    });
  };

  UI.title = function (ctx, t, y, scale) {
    scale = scale || 1;
    ctx.save();
    ctx.translate(S.W / 2, y);
    ctx.scale(scale, scale);
    var bob = Math.sin(t * .04) * 2;

    S.text(ctx, 'SONIC', 0, bob, {
      size: 62, align: 'center', weight: '900',
      gradient: ['#8fd6ff', '#1c6fd6'],
      outline: '#0b1a3a', outlineW: 9, shadow: false
    });
    S.text(ctx, 'SONIC', 0, bob, {
      size: 62, align: 'center', weight: '900',
      color: 'rgba(255,255,255,.14)', shadow: false
    });
    S.text(ctx, 'EMERALD RUSH', 0, 30 + bob, {
      size: 21, align: 'center', weight: 'bold',
      color: '#ffd23c', outline: '#5a2a00', outlineW: 5, shadow: false, letterSpacing: '3px'
    });
    ctx.restore();
  };

  /* barra de rolagem/valor 0..1 */
  UI.bar = function (ctx, x, y, w, frac, color) {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    S.roundRect(ctx, x, y, w, 8, 4); ctx.fill();
    ctx.fillStyle = color || '#ffd23c';
    S.roundRect(ctx, x, y, Math.max(6, w * S.clamp(frac, 0, 1)), 8, 4); ctx.fill();
    ctx.restore();
  };

  /* cartão de personagem na seleção */
  UI.charCard = function (ctx, id, x, y, w, h, selected, t) {
    var c = S.Gfx.CHARS[id];
    ctx.save();
    ctx.globalAlpha = selected ? 1 : .72;
    var g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, S.shade(c.card || c.body, .12));
    g.addColorStop(1, S.shade(c.card || c.dark, -.55));
    ctx.fillStyle = g;
    S.roundRect(ctx, x, y, w, h, 12); ctx.fill();
    ctx.lineWidth = selected ? 4 : 2;
    ctx.strokeStyle = selected ? '#ffd23c' : 'rgba(255,255,255,.3)';
    S.roundRect(ctx, x, y, w, h, 12); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath(); S.roundRect(ctx, x, y, w, h, 12); ctx.clip();
    ctx.globalAlpha = .18; ctx.fillStyle = '#ffffff';
    for (var i = 0; i < 4; i++) ctx.fillRect(x - 40 + i * 34 + (t * .4) % 34, y, 10, h);
    ctx.restore();

    S.Gfx.drawChar(ctx, id, {
      x: x + w / 2, y: y + h - 26,
      state: selected ? (Math.floor(t / 40) % 2 ? 'run' : 'idle') : 'idle',
      t: t, facing: 1, scale: selected ? 1.25 : 1.05
    });
    var ns = selected ? 17 : 15;
    while (ns > 8 && S.measure(ctx, c.name, ns) > w - 10) ns--;
    S.text(ctx, c.name, x + w / 2, y + h - 8, {
      size: ns, align: 'center', color: selected ? '#ffd23c' : '#ffffff',
      outline: 'rgba(0,0,0,.7)', outlineW: 4, shadow: false
    });
  };

  UI.scanlines = function (ctx) {
    if (!S.Save.data.options.scanlines) return;
    ctx.save();
    ctx.globalAlpha = .07;
    ctx.fillStyle = '#000';
    for (var y = 0; y < S.H; y += 3) ctx.fillRect(0, y, S.W, 1);
    ctx.restore();
  };

  UI.vignette = function (ctx, strength) {
    ctx.save();
    var g = ctx.createRadialGradient(S.W / 2, S.H / 2, S.H * .35, S.W / 2, S.H / 2, S.H * .85);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,' + (strength || .45) + ')');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S.W, S.H);
    ctx.restore();
  };
})();
