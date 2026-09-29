/* ============================================================
   hud.js — interface durante a fase
   ============================================================ */
(function () {
  'use strict';
  var S = window.S;
  var HUD = S.HUD = {};

  var EMCOL = ['#3fc34a', '#39b5ff', '#ff5c8a', '#ffd23c', '#b46ef0', '#ff7b2e'];
  HUD.EMCOL = EMCOL;

  function label(ctx, txt, x, y, color) {
    S.text(ctx, txt, x, y, { size: 15, color: color || '#ffd23c', outline: 'rgba(10,14,30,.85)', outlineW: 4, shadow: false });
  }
  function value(ctx, txt, x, y, color) {
    S.text(ctx, txt, x, y, { size: 15, color: color || '#ffffff', outline: 'rgba(10,14,30,.85)', outlineW: 4, shadow: false });
  }

  HUD.draw = function (ctx, g) {
    var p = g.player;

    // painel
    ctx.save();
    ctx.globalAlpha = .28;
    ctx.fillStyle = '#060a18';
    S.roundRect(ctx, 6, 6, 186, 66, 8); ctx.fill();
    ctx.restore();

    label(ctx, 'PONTOS', 16, 26);
    value(ctx, S.pad(g.score, 6), 96, 26);

    label(ctx, 'TEMPO', 16, 46, g.timeWarn ? '#ff5c5c' : '#ffd23c');
    value(ctx, S.fmtClock(g.time), 96, 46);

    var lowRings = g.rings === 0 && Math.floor(g.frames / 8) % 2 === 0;
    label(ctx, 'ANEIS', 16, 66, lowRings ? '#ff5c5c' : '#ffd23c');
    value(ctx, S.pad(g.rings, 3), 96, 66);

    // vidas
    ctx.save();
    ctx.globalAlpha = .28; ctx.fillStyle = '#060a18';
    S.roundRect(ctx, 6, S.H - 44, 104, 38, 8); ctx.fill();
    ctx.restore();
    S.Gfx.drawChar(ctx, g.charId, { x: 30, y: S.H - 12, state: 'idle', t: g.frames * .5, facing: 1, scale: .58 });
    value(ctx, 'x ' + g.lives, 56, S.H - 16, '#ffffff');

    // esmeraldas
    for (var i = 0; i < 6; i++) {
      var ex = S.W - 26 - (5 - i) * 24, ey = 24;
      if (S.Save.data.emeralds[i]) {
        S.Gfx.emerald(ctx, ex, ey, EMCOL[i], g.frames + i * 20, .62);
      } else {
        ctx.save();
        ctx.globalAlpha = .28;
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4;
        S.poly(ctx, [ex, ey - 7.5, ex + 5.6, ey - 2.5, ex + 3.8, ey + 5.6, ex - 3.8, ey + 5.6, ex - 5.6, ey - 2.5]);
        ctx.stroke(); ctx.restore();
      }
    }

    // temporizadores de itens
    var ty = 88;
    if (p.invincTimer > 0) ty = timerBar(ctx, ty, 'INVENCIVEL', p.invincTimer / 1200, '#ffd23c');
    if (p.shoesTimer > 0) ty = timerBar(ctx, ty, 'TENIS', p.shoesTimer / 1200, '#e03027');
    if (p.superForm) ty = timerBar(ctx, ty, 'SUPER', Math.min(1, g.rings / 50), '#fff3a8');
    if (p.charId === 'renan' && p.flying) ty = timerBar(ctx, ty, 'IMPULSO', p.flyTimer / 500, '#9fe2ff');

    // chefe
    if (g.boss && g.boss.alive && g.boss.phase !== 'intro') HUD.bossBar(ctx, g.boss);

    // aviso de tempo
    if (g.timeWarn && Math.floor(g.frames / 20) % 2 === 0) {
      S.text(ctx, 'TEMPO ACABANDO!', S.W / 2, 108, {
        size: 18, color: '#ff5c5c', align: 'center', outline: '#2a0000', outlineW: 4, shadow: false });
    }

    S.Input.drawTouch(ctx);
  };

  function timerBar(ctx, y, name, frac, color) {
    ctx.save();
    ctx.globalAlpha = .3; ctx.fillStyle = '#060a18';
    S.roundRect(ctx, 14, y - 10, 120, 14, 4); ctx.fill();
    ctx.restore();
    ctx.fillStyle = color;
    ctx.fillRect(18, y - 6, Math.max(0, 112 * S.clamp(frac, 0, 1)), 6);
    S.text(ctx, name, 18, y - 8, { size: 9, color: '#ffffff', shadow: false, baseline: 'bottom' });
    return y + 22;
  }

  HUD.bossBar = function (ctx, boss) {
    var w = 240, x = (S.W - w) / 2, y = 22;
    ctx.save();
    ctx.globalAlpha = .35; ctx.fillStyle = '#060a18';
    S.roundRect(ctx, x - 6, y - 6, w + 12, 24, 6); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#2a3150';
    S.roundRect(ctx, x, y, w, 12, 4); ctx.fill();
    var f = Math.max(0, boss.hp / boss.maxHp);
    var gr = ctx.createLinearGradient(x, 0, x + w, 0);
    gr.addColorStop(0, '#ff5c5c'); gr.addColorStop(1, '#ffd23c');
    ctx.fillStyle = gr;
    S.roundRect(ctx, x, y, Math.max(2, w * f), 12, 4); ctx.fill();
    S.text(ctx, 'DR. EGGMAN', S.W / 2, y - 8, {
      size: 12, color: '#ffffff', align: 'center', outline: 'rgba(0,0,0,.8)', outlineW: 3, shadow: false });
  };
})();
