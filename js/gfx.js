/* ============================================================
   gfx.js — desenho procedural dos personagens e objetos
   ============================================================ */
(function () {
  'use strict';
  var S = window.S;
  var Gfx = S.Gfx = {};

  Gfx.CHARS = {
    sonic: {
      name: 'SONIC', full: 'SONIC THE HEDGEHOG',
      body: '#1c6fd6', body2: '#3f97f0', dark: '#0e3f85',
      skin: '#f7c68f', shoe: '#e03027', shoeB: '#ffffff', cuff: '#ffffff',
      superBody: '#ffe14d', superBody2: '#fff5a8', superDark: '#e0a91a',
      top: 6.2, jump: 6.6, acc: 0.046875,
      ability: 'SPIN DASH + DROP DASH',
      desc: 'O mais rápido. Equilibrado e com o Drop Dash no ar.'
    },
    tails: {
      name: 'TAILS', full: 'MILES "TAILS" PROWER',
      body: '#f2921d', body2: '#ffb851', dark: '#b8610a',
      skin: '#ffe6c2', shoe: '#e03027', shoeB: '#ffffff', cuff: '#ffffff',
      superBody: '#ffe14d', superBody2: '#fff9c8', superDark: '#dca516',
      top: 5.6, jump: 6.4, acc: 0.046875,
      ability: 'VOO COM AS CAUDAS',
      desc: 'Voa segurando o pulo. Mais lento, porém alcança tudo.'
    },
    knuckles: {
      name: 'KNUCKLES', full: 'KNUCKLES THE ECHIDNA',
      body: '#d1382f', body2: '#f05a4c', dark: '#8d1d17',
      skin: '#ffd9a8', shoe: '#159b52', shoeB: '#ffe14d', cuff: '#ffffff',
      superBody: '#ffc0cb', superBody2: '#ffe6ec', superDark: '#d1738a',
      top: 5.8, jump: 6.0, acc: 0.046875,
      ability: 'PLANAR E ESCALAR',
      desc: 'Planar no ar e escalar paredes. Quebra blocos com o soco.'
    }
  };

  /* ---------- peças ---------- */
  function shoe(ctx, c, x, y, r) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(r || 0);
    ctx.fillStyle = c.shoe;
    S.roundRect(ctx, -7, -4, 15, 9, 4); ctx.fill();
    ctx.fillStyle = c.shoeB;
    ctx.fillRect(-7, -1, 15, 3);
    ctx.fillStyle = '#ffffff';
    S.roundRect(ctx, -6, 3, 14, 3, 1.5); ctx.fill();
    ctx.restore();
  }

  function glove(ctx, c, x, y, r) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(r || 0);
    ctx.fillStyle = '#ffffff';
    S.circle(ctx, 0, 0, 4.6); ctx.fill();
    ctx.fillStyle = c.cuff;
    ctx.fillRect(-4.6, 2.6, 9.2, 2.4);
    ctx.restore();
  }

  function head(ctx, c, bob, blink, look) {
    var hx = 2, hy = -30 + bob;
    // orelhas
    ctx.fillStyle = c.body;
    S.poly(ctx, [hx - 7, hy - 8, hx - 3, hy - 16, hx + 0, hy - 7]); ctx.fill();
    S.poly(ctx, [hx + 4, hy - 9, hx + 8, hy - 16, hx + 9, hy - 6]); ctx.fill();
    // cabeça
    ctx.fillStyle = c.body;
    S.circle(ctx, hx, hy, 11.5); ctx.fill();
    ctx.fillStyle = c.body2;
    S.ellipse(ctx, hx - 2, hy - 4, 8, 6, -.4); ctx.fill();
    // focinho
    ctx.fillStyle = c.skin;
    S.ellipse(ctx, hx + 8, hy + 3.5, 7.5, 6, 0); ctx.fill();
    // nariz
    ctx.fillStyle = '#20232d';
    S.ellipse(ctx, hx + 13, hy + 1, 2.6, 2.2, 0); ctx.fill();
    // boca
    ctx.strokeStyle = '#20232d'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(hx + 10, hy + 4, 3.4, .2, 1.5); ctx.stroke();
    // olhos
    var ey = hy - 2 + (look || 0);
    ctx.fillStyle = '#ffffff';
    S.ellipse(ctx, hx + 2.5, ey, 3.8, blink ? .8 : 5.2, -.12); ctx.fill();
    S.ellipse(ctx, hx + 9.5, ey, 3.4, blink ? .7 : 4.8, -.12); ctx.fill();
    if (!blink) {
      ctx.fillStyle = '#1f2a55';
      S.ellipse(ctx, hx + 3.6, ey + .6, 1.8, 2.7, 0); ctx.fill();
      S.ellipse(ctx, hx + 10.3, ey + .6, 1.6, 2.5, 0); ctx.fill();
    }
  }

  function torso(ctx, c, bob) {
    ctx.fillStyle = c.body;
    S.ellipse(ctx, 0, -16 + bob * .5, 9.5, 11, 0); ctx.fill();
    ctx.fillStyle = c.skin;
    S.ellipse(ctx, 3, -14 + bob * .5, 6, 7.5, 0); ctx.fill();
  }

  function spikes(ctx, c, id, bob) {
    ctx.fillStyle = c.body;
    if (id === 'sonic') {
      var base = -30 + bob;
      S.poly(ctx, [-6, base - 6, -22, base - 12, -8, base + 1]); ctx.fill();
      S.poly(ctx, [-6, base - 1, -23, base - 1, -7, base + 6]); ctx.fill();
      S.poly(ctx, [-5, base + 4, -20, base + 10, -6, base + 10]); ctx.fill();
    } else if (id === 'knuckles') {
      var b2 = -30 + bob;
      ctx.fillStyle = c.body;
      S.poly(ctx, [-6, b2 - 5, -19, b2 + 4, -6, b2 + 5]); ctx.fill();
      S.poly(ctx, [-5, b2 + 2, -17, b2 + 13, -4, b2 + 8]); ctx.fill();
    } else {
      var b3 = -30 + bob;
      S.poly(ctx, [-6, b3 - 4, -16, b3 - 2, -6, b3 + 5]); ctx.fill();
    }
  }

  function tails2(ctx, c, t, spread) {
    ctx.save();
    ctx.fillStyle = c.body;
    for (var i = 0; i < 2; i++) {
      var a = Math.sin(t * .5 + i * 1.1) * .45 + (i ? .35 : -.35) * (spread || 1);
      ctx.save();
      ctx.translate(-8, -17);
      ctx.rotate(a);
      ctx.fillStyle = c.body;
      S.ellipse(ctx, -11, 0, 12, 4.6, 0); ctx.fill();
      ctx.fillStyle = c.skin;
      S.ellipse(ctx, -19, 0, 5.5, 4.4, 0); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  /* ---------- bola (pulo / roll) ---------- */
  function ball(ctx, c, spin, r) {
    r = r || 15;
    ctx.save();
    ctx.translate(0, -r);
    ctx.rotate(spin);
    ctx.fillStyle = c.dark;
    S.circle(ctx, 0, 0, r); ctx.fill();
    ctx.fillStyle = c.body;
    S.circle(ctx, 0, 0, r - 1.5); ctx.fill();
    ctx.fillStyle = c.body2;
    for (var i = 0; i < 3; i++) {
      var a = i * Math.PI * 2 / 3;
      ctx.beginPath();
      ctx.arc(0, 0, r - 2, a, a + .8);
      ctx.arc(0, 0, r - 8, a + .8, a, true);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = c.skin;
    S.circle(ctx, 0, 0, 4.2); ctx.fill();
    ctx.restore();
  }

  Gfx.ball = ball;
  Gfx.shoePart = shoe;
  Gfx.headPart = head;
  Gfx.torsoPart = torso;
  Gfx.spikesPart = spikes;
  Gfx.tailsPart = tails2;
  Gfx.glovePart = glove;
})();

/* ---------- pose completa do personagem ---------- */
(function () {
  'use strict';
  var S = window.S, Gfx = S.Gfx;

  function pal(id, superForm) {
    var c = Gfx.CHARS[id];
    if (!superForm) return c;
    return {
      body: c.superBody, body2: c.superBody2, dark: c.superDark,
      skin: c.skin, shoe: c.shoe, shoeB: c.shoeB, cuff: c.cuff
    };
  }

  /* x,y = pé do personagem (centro da base) */
  Gfx.drawChar = function (ctx, id, o) {
    var c = pal(id, o.superForm);
    var t = o.t || 0;
    var st = o.state || 'idle';
    var face = o.facing < 0 ? -1 : 1;

    ctx.save();
    ctx.translate(o.x, o.y);
    if (o.angle) ctx.rotate(o.angle);
    if (o.scale) ctx.scale(o.scale, o.scale);
    ctx.scale(face, 1);

    if (o.flash && Math.floor(t / 2) % 2 === 0) ctx.globalAlpha = .35;

    if (st === 'roll' || st === 'jump' || st === 'spring' || st === 'dead') {
      if (st === 'dead') { ctx.globalAlpha = 1; }
      Gfx.ball(ctx, c, o.spin || t * .4, 15);
      if (id === 'tails') { ctx.globalAlpha *= .9; }
      ctx.restore();
      if (o.superForm) Gfx.superAura(ctx, o.x, o.y - 15, 19, t);
      return;
    }

    if (st === 'spindash') {
      Gfx.ball(ctx, c, t * 1.1, 14);
      ctx.restore();
      // poeira do spindash
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.scale(face, 1);
      ctx.globalAlpha = .5;
      ctx.fillStyle = '#ffffff';
      for (var d = 0; d < 3; d++) {
        var px = -14 - d * 9 - (t * 2 % 7);
        S.circle(ctx, px, -4 - Math.sin(t * .4 + d) * 3, 4 - d); ctx.fill();
      }
      ctx.restore();
      return;
    }

    var bob = (st === 'idle') ? Math.sin(t * .09) * .9 : 0;
    var blink = (st === 'idle') && (Math.floor(t / 14) % 13 === 0);
    var look = st === 'lookup' ? -2.5 : (st === 'crouch' ? 2 : 0);

    if (st === 'crouch') { ctx.translate(0, 9); ctx.scale(1, .78); }

    // traseiro / caudas
    if (id === 'tails') Gfx.tailsPart(ctx, c, t * (st === 'run' || st === 'dash' ? .9 : .35), 1);
    Gfx.spikesPart(ctx, c, id, bob);

    // braços de trás
    ctx.fillStyle = c.skin;
    var armSw = (st === 'walk' || st === 'run' || st === 'dash') ? Math.sin(t * .35) * 5 : 0;
    ctx.save(); ctx.translate(-4, -19 + bob * .5);
    ctx.rotate(st === 'run' || st === 'dash' ? -0.9 : armSw * .09);
    ctx.fillRect(-2, 0, 4, 8); ctx.restore();

    Gfx.torsoPart(ctx, c, bob);

    if (id === 'knuckles') {
      ctx.fillStyle = '#ffffff';
      S.poly(ctx, [-2, -20, 8, -17, 2, -10]); ctx.fill();
    }

    // pernas
    Gfx.legs(ctx, c, st, t, face);

    Gfx.headPart(ctx, c, bob, blink, look);

    // braço da frente / luva
    var gx = 7, gy = -15 + bob * .5;
    if (st === 'run' || st === 'dash') { gx = 9; gy = -17; }
    else if (st === 'skid') { gx = 11; gy = -22; }
    else if (st === 'push') { gx = 12; gy = -18; }
    else if (st === 'victory') { gx = 10; gy = -34; }
    else if (st === 'glide') { gx = 13; gy = -24; }
    else if (st === 'climb') { gx = 8; gy = -30 - Math.sin(t * .2) * 5; }
    else gx = 7 + armSw * .4;
    Gfx.glovePart(ctx, c, gx, gy, 0);

    if (st === 'hurt') {
      ctx.fillStyle = '#ffffff'; ctx.globalAlpha = .5;
      S.circle(ctx, 2, -30, 14); ctx.fill();
    }

    ctx.restore();
    if (o.superForm) Gfx.superAura(ctx, o.x, o.y - 20, 24, t);
  };

  Gfx.legs = function (ctx, c, st, t, face) {
    var sh = Gfx.shoePart;
    if (st === 'run' || st === 'dash') {
      var speed = st === 'dash' ? .95 : .62;
      ctx.save();
      ctx.globalAlpha = .5;
      ctx.fillStyle = '#f6efe2';
      S.ellipse(ctx, 0, -6, 15, 7, 0); ctx.fill();
      ctx.restore();
      for (var i = 0; i < 2; i++) {
        var a = t * speed + i * Math.PI;
        var px = Math.cos(a) * 11, py = -6 + Math.sin(a) * 5;
        sh(ctx, c, px, py, Math.sin(a) * .5);
      }
      return;
    }
    if (st === 'walk') {
      var sw = Math.sin(t * .33) * 7;
      ctx.fillStyle = c.skin;
      ctx.fillRect(-2 + sw * .3, -9, 4, 5);
      ctx.fillRect(-2 - sw * .3, -9, 4, 5);
      sh(ctx, c, -1 + sw, -3, 0);
      sh(ctx, c, -1 - sw, -3, 0);
      return;
    }
    if (st === 'skid') {
      sh(ctx, c, 8, -3, -.25);
      sh(ctx, c, -6, -3, .15);
      return;
    }
    if (st === 'fly') {
      sh(ctx, c, 2, -2, .4 + Math.sin(t * .2) * .1);
      sh(ctx, c, -5, -1, .2);
      return;
    }
    if (st === 'glide') {
      sh(ctx, c, -3, -2, .1);
      sh(ctx, c, 5, -1, -.1);
      return;
    }
    if (st === 'climb') {
      sh(ctx, c, 3, -4 + Math.sin(t * .2) * 3, -.3);
      sh(ctx, c, -3, -2 - Math.sin(t * .2) * 3, -.3);
      return;
    }
    if (st === 'push') {
      sh(ctx, c, 5, -3, 0);
      sh(ctx, c, -6, -3, 0);
      return;
    }
    // idle / crouch / lookup / hurt / victory
    sh(ctx, c, 4, -3, 0);
    sh(ctx, c, -5, -3, 0);
  };

  Gfx.superAura = function (ctx, x, y, r, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var a = .18 + Math.sin(t * .25) * .08;
    var g = ctx.createRadialGradient(x, y, r * .3, x, y, r * 1.5);
    g.addColorStop(0, 'rgba(255,240,140,' + a + ')');
    g.addColorStop(1, 'rgba(255,200,40,0)');
    ctx.fillStyle = g;
    S.circle(ctx, x, y, r * 1.5); ctx.fill();
    ctx.restore();
  };
})();

/* ---------- objetos e inimigos ---------- */
(function () {
  'use strict';
  var S = window.S, Gfx = S.Gfx;

  Gfx.ring = function (ctx, x, y, t, scale) {
    var w = Math.abs(Math.cos(t * .12));
    scale = scale || 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = '#b8860b';
    S.ellipse(ctx, 0, 0, Math.max(1.2, 8 * w), 8, 0); ctx.stroke();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#ffd23c';
    S.ellipse(ctx, 0, 0, Math.max(1, 7 * w), 7, 0); ctx.stroke();
    if (w > .45) {
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      S.ellipse(ctx, -2.2 * w, -3, 1.4 * w, 2.4, -.4); ctx.fill();
    }
    ctx.restore();
  };

  Gfx.emerald = function (ctx, x, y, color, t, scale) {
    scale = scale || 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.rotate(Math.sin(t * .05) * .12);
    var pts = [0, -12, 9, -4, 6, 9, -6, 9, -9, -4];
    S.poly(ctx, pts);
    var g = ctx.createLinearGradient(0, -12, 0, 10);
    g.addColorStop(0, S.shade(color, .55));
    g.addColorStop(.5, color);
    g.addColorStop(1, S.shade(color, -.4));
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    S.poly(ctx, [0, -11, 6, -4, 0, 0, -6, -4]); ctx.fill();
    ctx.restore();
  };

  var BOX_ICONS = {
    rings: function (ctx) { Gfx.ring(ctx, 0, 0, 0, .85); },
    shield: function (ctx) {
      ctx.fillStyle = '#39a7ff'; S.circle(ctx, 0, 0, 7.5); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.65)'; S.circle(ctx, -2, -2, 3); ctx.fill();
    },
    invinc: function (ctx, t) {
      ctx.fillStyle = '#ffffff';
      for (var i = 0; i < 3; i++) {
        var a = t * .1 + i * 2.1;
        S.circle(ctx, Math.cos(a) * 4.5, Math.sin(a) * 4.5, 2.6 - i * .4); ctx.fill();
      }
    },
    shoes: function (ctx) {
      ctx.fillStyle = '#e03027'; S.roundRect(ctx, -7, -3, 13, 7, 3); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-7, -1, 13, 2.5);
    },
    life: function (ctx, t, char) {
      Gfx.drawChar(ctx, char || 'sonic', { x: 0, y: 8, state: 'idle', t: 0, facing: 1, scale: .38 });
    },
    bomb: function (ctx) {
      ctx.fillStyle = '#24262e'; S.circle(ctx, 0, 1, 6.5); ctx.fill();
      ctx.strokeStyle = '#ffb02e'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(3, -4); ctx.quadraticCurveTo(7, -9, 3, -11); ctx.stroke();
    },
    electric: function (ctx) {
      ctx.fillStyle = '#ffe14d';
      S.poly(ctx, [-2, -8, 4, -2, 0, -1, 3, 8, -4, 1, 0, 0]); ctx.fill();
    }
  };

  Gfx.itemBox = function (ctx, x, y, kind, t, broken, char) {
    ctx.save(); ctx.translate(x, y);
    if (broken) {
      ctx.globalAlpha = .6;
      ctx.fillStyle = '#7d8598';
      ctx.fillRect(-14, 6, 28, 8);
      ctx.restore(); return;
    }
    ctx.fillStyle = '#4a5468';
    S.roundRect(ctx, -15, -15, 30, 30, 4); ctx.fill();
    ctx.fillStyle = '#9fb0cc';
    S.roundRect(ctx, -13, -13, 26, 22, 3); ctx.fill();
    ctx.fillStyle = '#d9e6ff';
    S.roundRect(ctx, -12, -12, 24, 20, 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.rect(-12, -12, 24, 20); ctx.clip();
    ctx.translate(0, -2);
    var f = BOX_ICONS[kind] || BOX_ICONS.rings;
    f(ctx, t, char);
    ctx.restore();
    ctx.fillStyle = '#2b3245';
    ctx.fillRect(-15, 9, 30, 6);
    ctx.globalAlpha = .35; ctx.fillStyle = '#ffffff';
    ctx.fillRect(-11, -11, 6, 18);
    ctx.restore();
  };

  Gfx.spring = function (ctx, x, y, dir, press, color) {
    ctx.save(); ctx.translate(x, y);
    if (dir === 'right') ctx.rotate(-Math.PI / 2);
    else if (dir === 'left') ctx.rotate(Math.PI / 2);
    else if (dir === 'down') ctx.rotate(Math.PI);
    var h = 12 - press * 8;
    ctx.fillStyle = '#c8ccd8';
    for (var i = 0; i < 3; i++) {
      ctx.fillRect(-9, -h * (i / 3) - 2, 18, 3);
    }
    ctx.fillStyle = color || '#e03027';
    S.roundRect(ctx, -14, -h - 7, 28, 8, 3); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-11, -h - 5, 22, 2);
    ctx.fillStyle = '#5a6172';
    ctx.fillRect(-14, -2, 28, 4);
    ctx.restore();
  };

  Gfx.spikes = function (ctx, x, y, n, up) {
    ctx.save(); ctx.translate(x, y);
    if (!up) ctx.scale(1, -1);
    for (var i = 0; i < n; i++) {
      var px = i * 16;
      ctx.fillStyle = '#9aa4b8';
      S.poly(ctx, [px, 0, px + 8, -13, px + 16, 0]); ctx.fill();
      ctx.fillStyle = '#d7dded';
      S.poly(ctx, [px + 3, 0, px + 8, -12, px + 9, 0]); ctx.fill();
    }
    ctx.fillStyle = '#5a6172';
    ctx.fillRect(0, 0, n * 16, 4);
    ctx.restore();
  };

  Gfx.checkpoint = function (ctx, x, y, on, t) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#c3cbdb'; ctx.fillRect(-3, -46, 6, 46);
    ctx.fillStyle = '#7d8598'; ctx.fillRect(-9, -3, 18, 5);
    ctx.save();
    ctx.translate(0, -46);
    if (on) ctx.rotate(t * .25);
    ctx.fillStyle = on ? '#ffd23c' : '#4c86ff';
    S.circle(ctx, 0, 0, 8); ctx.fill();
    ctx.fillStyle = '#ffffff';
    S.circle(ctx, -2.5, -2.5, 2.6); ctx.fill();
    ctx.restore();
    if (on) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,220,80,.25)';
      S.circle(ctx, 0, -46, 14 + Math.sin(t * .2) * 3); ctx.fill();
    }
    ctx.restore();
  };

  Gfx.goalSign = function (ctx, x, y, spin, face, charId) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#c3cbdb'; ctx.fillRect(-3, -74, 6, 74);
    ctx.fillStyle = '#7d8598'; ctx.fillRect(-14, -4, 28, 6);
    var w = Math.cos(spin);
    ctx.save();
    ctx.translate(0, -58);
    ctx.scale(Math.abs(w) < .06 ? .06 : w, 1);
    ctx.fillStyle = w > 0 ? '#2e59b5' : '#c22f28';
    S.roundRect(ctx, -26, -18, 52, 36, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    S.roundRect(ctx, -24, -16, 48, 14, 3); ctx.fill();
    if (w > .25) {
      Gfx.drawChar(ctx, charId || 'sonic', { x: 0, y: 14, state: 'idle', t: 0, facing: 1, scale: .62 });
    } else if (w < -.25) {
      S.text(ctx, 'GOAL', 0, 6, { size: 16, color: '#ffd23c', align: 'center', outline: '#5a1410', outlineW: 3 });
    }
    ctx.restore();
    ctx.restore();
  };
})();

/* ---------- badniks ---------- */
(function () {
  'use strict';
  var S = window.S, Gfx = S.Gfx;

  Gfx.badnik = {
    motobug: function (ctx, x, y, t, face) {
      ctx.save(); ctx.translate(x, y); ctx.scale(face < 0 ? -1 : 1, 1);
      ctx.fillStyle = '#2c3142';
      S.circle(ctx, -8, -4, 5); ctx.fill();
      S.circle(ctx, 8, -4, 5); ctx.fill();
      ctx.strokeStyle = '#8b93a8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-8, -4);
      ctx.lineTo(-8 + Math.cos(t * .3) * 4, -4 + Math.sin(t * .3) * 4); ctx.stroke();
      ctx.fillStyle = '#d6342b';
      S.ellipse(ctx, 0, -14, 14, 10, 0); ctx.fill();
      ctx.fillStyle = '#25282f';
      S.ellipse(ctx, 0, -18, 13, 5, 0); ctx.fill();
      ctx.fillStyle = '#ffd23c';
      S.circle(ctx, 9, -16, 3.2); ctx.fill();
      ctx.fillStyle = '#1b1d23'; S.circle(ctx, 10, -16, 1.5); ctx.fill();
      ctx.fillStyle = '#8b93a8';
      ctx.fillRect(-16, -18, 4, 3);
      ctx.restore();
    },

    buzzbomber: function (ctx, x, y, t, face) {
      ctx.save(); ctx.translate(x, y); ctx.scale(face < 0 ? -1 : 1, 1);
      ctx.save();
      ctx.globalAlpha = .55; ctx.fillStyle = '#cfe6ff';
      var f = Math.sin(t * 1.4) * 6;
      S.ellipse(ctx, -2, -12, 12, 4, -.4 + f * .04); ctx.fill();
      S.ellipse(ctx, -2, -12, 12, 4, .4 - f * .04); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#2e6bd8';
      S.ellipse(ctx, 0, -5, 15, 8, 0); ctx.fill();
      ctx.fillStyle = '#ffd23c';
      ctx.fillRect(-6, -9, 4, 9); ctx.fillRect(2, -9, 4, 9);
      ctx.fillStyle = '#c8ccd8';
      S.poly(ctx, [14, -8, 26, -5, 14, -2]); ctx.fill();
      ctx.fillStyle = '#e03027';
      S.circle(ctx, 10, -8, 3); ctx.fill();
      ctx.fillStyle = '#8b93a8';
      S.poly(ctx, [-15, -6, -24, -10, -22, -2]); ctx.fill();
      ctx.restore();
    },

    crabmeat: function (ctx, x, y, t, face) {
      ctx.save(); ctx.translate(x, y); ctx.scale(face < 0 ? -1 : 1, 1);
      var leg = Math.sin(t * .25) * 3;
      ctx.strokeStyle = '#3f465c'; ctx.lineWidth = 3;
      for (var i = -1; i <= 1; i += 2) {
        ctx.beginPath(); ctx.moveTo(i * 8, -8);
        ctx.lineTo(i * 14, -4 + leg * i); ctx.lineTo(i * 16, 0); ctx.stroke();
      }
      ctx.fillStyle = '#e0642e';
      S.ellipse(ctx, 0, -14, 16, 9, 0); ctx.fill();
      ctx.fillStyle = '#ffb15e';
      S.ellipse(ctx, 0, -16, 13, 5, 0); ctx.fill();
      ctx.fillStyle = '#f4f7ff';
      S.circle(ctx, -5, -16, 3); ctx.fill(); S.circle(ctx, 5, -16, 3); ctx.fill();
      ctx.fillStyle = '#1b1d23';
      S.circle(ctx, -5, -16, 1.5); ctx.fill(); S.circle(ctx, 5, -16, 1.5); ctx.fill();
      ctx.fillStyle = '#e0642e';
      S.roundRect(ctx, -30, -18, 13, 9, 3); ctx.fill();
      S.roundRect(ctx, 17, -18, 13, 9, 3); ctx.fill();
      ctx.restore();
    },

    chopper: function (ctx, x, y, t, face) {
      ctx.save(); ctx.translate(x, y); ctx.scale(face < 0 ? -1 : 1, 1);
      ctx.rotate(Math.sin(t * .1) * .2);
      ctx.fillStyle = '#2f8f6a';
      S.ellipse(ctx, 0, 0, 15, 9, 0); ctx.fill();
      ctx.fillStyle = '#4fc79a';
      S.poly(ctx, [-14, 0, -26, -8, -24, 6]); ctx.fill();
      ctx.fillStyle = '#ffffff';
      S.poly(ctx, [2, 2, 14, 1, 2, 8]); ctx.fill();
      ctx.fillStyle = '#ffd23c'; S.circle(ctx, 7, -3, 3); ctx.fill();
      ctx.fillStyle = '#1b1d23'; S.circle(ctx, 8, -3, 1.4); ctx.fill();
      ctx.restore();
    },

    spiker: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * .06);
      ctx.fillStyle = '#5b6379';
      for (var i = 0; i < 8; i++) {
        var a = i * Math.PI / 4;
        S.poly(ctx, [Math.cos(a) * 16, Math.sin(a) * 16,
                     Math.cos(a + .35) * 8, Math.sin(a + .35) * 8,
                     Math.cos(a - .35) * 8, Math.sin(a - .35) * 8]); ctx.fill();
      }
      ctx.fillStyle = '#2c3142'; S.circle(ctx, 0, 0, 9); ctx.fill();
      ctx.fillStyle = '#e03027'; S.circle(ctx, 0, 0, 4); ctx.fill();
      ctx.restore();
    },

    orbinaut: function (ctx, x, y, t) {
      ctx.save(); ctx.translate(x, y);
      ctx.fillStyle = '#3d4458';
      S.circle(ctx, 0, 0, 11); ctx.fill();
      ctx.fillStyle = '#7f8aa3'; S.circle(ctx, -3, -3, 4); ctx.fill();
      ctx.fillStyle = '#ffd23c'; S.circle(ctx, 3, 0, 3.5); ctx.fill();
      for (var i = 0; i < 4; i++) {
        var a = t * .04 + i * Math.PI / 2;
        ctx.save();
        ctx.translate(Math.cos(a) * 26, Math.sin(a) * 26);
        ctx.fillStyle = '#5b6379';
        for (var k = 0; k < 6; k++) {
          var b = k * Math.PI / 3;
          S.poly(ctx, [Math.cos(b) * 9, Math.sin(b) * 9,
                       Math.cos(b + .5) * 4, Math.sin(b + .5) * 4,
                       Math.cos(b - .5) * 4, Math.sin(b - .5) * 4]); ctx.fill();
        }
        ctx.fillStyle = '#2c3142'; S.circle(ctx, 0, 0, 5); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    },

    bat: function (ctx, x, y, t, face) {
      ctx.save(); ctx.translate(x, y); ctx.scale(face < 0 ? -1 : 1, 1);
      var f = Math.sin(t * .4);
      ctx.fillStyle = '#6a4bb5';
      S.poly(ctx, [-4, -4, -20, -10 + f * 6, -16, 2]); ctx.fill();
      S.poly(ctx, [4, -4, 20, -10 - f * 6, 16, 2]); ctx.fill();
      ctx.fillStyle = '#3a2a6b';
      S.ellipse(ctx, 0, 0, 9, 10, 0); ctx.fill();
      ctx.fillStyle = '#ff4d4d';
      S.circle(ctx, -3, -2, 2.2); ctx.fill(); S.circle(ctx, 3, -2, 2.2); ctx.fill();
      ctx.restore();
    }
  };

  Gfx.projectile = function (ctx, x, y, kind, t) {
    ctx.save(); ctx.translate(x, y);
    if (kind === 'laser') {
      ctx.fillStyle = '#ff4d4d';
      S.ellipse(ctx, 0, 0, 9, 3.4, 0); ctx.fill();
      ctx.fillStyle = '#ffd7d7';
      S.ellipse(ctx, 0, 0, 5, 1.6, 0); ctx.fill();
    } else if (kind === 'bubble') {
      ctx.strokeStyle = 'rgba(200,240,255,.9)'; ctx.lineWidth = 1.6;
      S.circle(ctx, 0, 0, 6); ctx.stroke();
    } else {
      ctx.fillStyle = '#ffd23c';
      S.circle(ctx, 0, 0, 5 + Math.sin(t * .4)); ctx.fill();
      ctx.fillStyle = '#ff8c1a';
      S.circle(ctx, 0, 0, 2.6); ctx.fill();
    }
    ctx.restore();
  };
})();

/* ---------- cenários e tiles ---------- */
(function () {
  'use strict';
  var S = window.S, Gfx = S.Gfx;

  Gfx.THEMES = {
    hill: {
      name: 'EMERALD HILL',
      sky: ['#39b5ff', '#9fe2ff', '#d9f5ff'],
      grass: '#3fc34a', grassDark: '#249a34', grassLight: '#7fe47c',
      dirt: '#c98a3c', dirt2: '#a86a26', edge: '#6b3f12',
      accent: '#ffd23c', water: 'rgba(60,150,255,.35)',
      music: 'zone1'
    },
    lagoon: {
      name: 'CHEMICAL LAGOON',
      sky: ['#2a1150', '#5a1f7a', '#9b3f9b'],
      grass: '#7b39c9', grassDark: '#4d1f8c', grassLight: '#b46ef0',
      dirt: '#3c2a63', dirt2: '#2a1d47', edge: '#17102b',
      accent: '#42f2c8', water: 'rgba(120,60,220,.4)',
      music: 'zone2'
    },
    fortress: {
      name: 'SKY FORTRESS',
      sky: ['#0b1030', '#1b2450', '#3a4680'],
      grass: '#8d97ad', grassDark: '#5b6379', grassLight: '#c3cbdb',
      dirt: '#47506a', dirt2: '#333b52', edge: '#1c2132',
      accent: '#ff7b2e', water: 'rgba(90,110,200,.35)',
      music: 'zone3'
    }
  };

  /* Fundo com parallax. cam = {x,y} */
  Gfx.drawBackground = function (ctx, theme, cam, t) {
    var th = Gfx.THEMES[theme] || Gfx.THEMES.hill;
    var g = ctx.createLinearGradient(0, 0, 0, S.H);
    g.addColorStop(0, th.sky[0]);
    g.addColorStop(.55, th.sky[1]);
    g.addColorStop(1, th.sky[2]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S.W, S.H);

    if (theme === 'hill') Gfx.bgHill(ctx, th, cam, t);
    else if (theme === 'lagoon') Gfx.bgLagoon(ctx, th, cam, t);
    else Gfx.bgFortress(ctx, th, cam, t);
  };

  function tiled(ctx, cam, factor, spacing, yBase, fn) {
    var off = (cam.x * factor) % spacing;
    var startIdx = Math.floor(cam.x * factor / spacing);
    for (var i = -1; i < Math.ceil(S.W / spacing) + 2; i++) {
      var x = i * spacing - off;
      fn(x, yBase, startIdx + i);
    }
  }

  Gfx.bgHill = function (ctx, th, cam, t) {
    // sol
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var sg = ctx.createRadialGradient(520, 70, 10, 520, 70, 120);
    sg.addColorStop(0, 'rgba(255,250,200,.85)');
    sg.addColorStop(1, 'rgba(255,220,120,0)');
    ctx.fillStyle = sg; S.circle(ctx, 520, 70, 120); ctx.fill();
    ctx.restore();

    // nuvens
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    tiled(ctx, { x: cam.x + t * .25 }, .06, 210, 0, function (x, _, i) {
      var y = 38 + ((i * 53) % 60) - cam.y * .05;
      var s = .7 + ((i * 31) % 40) / 70;
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      S.circle(ctx, 0, 0, 18); ctx.fill();
      S.circle(ctx, 20, 4, 14); ctx.fill();
      S.circle(ctx, -20, 5, 13); ctx.fill();
      S.circle(ctx, 8, -9, 13); ctx.fill();
      ctx.restore();
    });

    // montanhas distantes
    ctx.fillStyle = '#2f9f6e';
    tiled(ctx, cam, .18, 260, 0, function (x, _, i) {
      var h = 90 + ((i * 47) % 50);
      var y = S.H - 70 - cam.y * .12;
      S.poly(ctx, [x - 130, y, x, y - h, x + 130, y]); ctx.fill();
    });
    ctx.fillStyle = '#1f7e56';
    tiled(ctx, cam, .3, 200, 0, function (x, _, i) {
      var h = 62 + ((i * 29) % 40);
      var y = S.H - 40 - cam.y * .18;
      S.poly(ctx, [x - 110, y, x, y - h, x + 110, y]); ctx.fill();
    });

    // palmeiras
    tiled(ctx, cam, .5, 160, 0, function (x, _, i) {
      var y = S.H - 10 - cam.y * .3 - ((i * 17) % 22);
      ctx.save(); ctx.translate(x, y);
      ctx.strokeStyle = '#7a4a1c'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(6, -40, 2, -74); ctx.stroke();
      ctx.fillStyle = '#1c8a4a';
      for (var k = 0; k < 6; k++) {
        var a = -Math.PI / 2 + (k - 2.5) * .5 + Math.sin(t * .02 + i) * .05;
        ctx.save(); ctx.translate(2, -74); ctx.rotate(a);
        S.ellipse(ctx, 22, 0, 24, 7, 0); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    });
  };

  Gfx.bgLagoon = function (ctx, th, cam, t) {
    ctx.fillStyle = 'rgba(255,255,255,.07)';
    for (var i = 0; i < 40; i++) {
      var x = ((i * 137) % S.W + S.W - (cam.x * .04) % S.W) % S.W;
      var y = (i * 71) % 200;
      S.circle(ctx, x, y, 1.4); ctx.fill();
    }
    // torres químicas
    tiled(ctx, cam, .2, 180, 0, function (x, _, i) {
      var h = 130 + ((i * 41) % 70);
      var y = S.H - 30 - cam.y * .12;
      ctx.fillStyle = '#2a1d47';
      ctx.fillRect(x - 32, y - h, 64, h);
      ctx.fillStyle = '#42f2c8';
      for (var k = 0; k < 5; k++) {
        if ((i + k) % 3 === 0) continue;
        ctx.globalAlpha = .55 + Math.sin(t * .05 + k + i) * .3;
        ctx.fillRect(x - 22 + (k % 2) * 26, y - h + 16 + k * 22, 16, 10);
      }
      ctx.globalAlpha = 1;
    });
    // tubos
    tiled(ctx, cam, .4, 130, 0, function (x, _, i) {
      var y = S.H - 20 - cam.y * .25;
      ctx.fillStyle = '#4d1f8c';
      ctx.fillRect(x - 14, y - 90 - ((i * 23) % 40), 28, 200);
      ctx.fillStyle = '#7b39c9';
      ctx.fillRect(x - 14, y - 90 - ((i * 23) % 40), 8, 200);
    });
    ctx.fillStyle = 'rgba(66,242,200,.10)';
    ctx.fillRect(0, S.H - 70, S.W, 70);
  };

  Gfx.bgFortress = function (ctx, th, cam, t) {
    // estrelas
    for (var i = 0; i < 70; i++) {
      var x = ((i * 191) % S.W + S.W - (cam.x * .02) % S.W) % S.W;
      var y = (i * 83) % 230;
      ctx.globalAlpha = .3 + ((i * 7) % 10) / 14;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y - cam.y * .02, 1.6, 1.6);
    }
    ctx.globalAlpha = 1;
    // lua
    ctx.fillStyle = '#f2f5ff';
    S.circle(ctx, 110, 72, 34); ctx.fill();
    ctx.fillStyle = '#d5dcf0';
    S.circle(ctx, 100, 64, 7); ctx.fill();
    S.circle(ctx, 122, 84, 5); ctx.fill();
    // nuvens escuras
    ctx.fillStyle = 'rgba(40,52,96,.75)';
    tiled(ctx, { x: cam.x + t * .6 }, .12, 240, 0, function (x, _, i) {
      var y = 150 + ((i * 37) % 60) - cam.y * .06;
      ctx.save(); ctx.translate(x, y);
      S.ellipse(ctx, 0, 0, 70, 16, 0); ctx.fill();
      S.ellipse(ctx, 40, 6, 46, 12, 0); ctx.fill();
      ctx.restore();
    });
    // silhueta da fortaleza
    tiled(ctx, cam, .32, 190, 0, function (x, _, i) {
      var y = S.H - 20 - cam.y * .16;
      var h = 120 + ((i * 53) % 80);
      ctx.fillStyle = '#141a33';
      ctx.fillRect(x - 46, y - h, 92, h + 30);
      ctx.fillStyle = '#ff7b2e';
      for (var k = 0; k < 4; k++) {
        if ((i * k) % 3 === 0) continue;
        ctx.globalAlpha = .7;
        ctx.fillRect(x - 30 + (k % 2) * 40, y - h + 20 + Math.floor(k / 2) * 34, 14, 12);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#0d1226';
      S.poly(ctx, [x - 54, y - h, x, y - h - 34, x + 54, y - h]); ctx.fill();
    });
  };
})();

/* ---------- looping ---------- */
(function () {
  'use strict';
  var S = window.S, Gfx = S.Gfx;

  Gfx.loopRing = function (ctx, x, y, r, theme, back) {
    var th = Gfx.THEMES[theme] || Gfx.THEMES.hill;
    ctx.save();
    ctx.translate(x, y);
    ctx.lineWidth = 16;
    ctx.strokeStyle = back ? S.shade(th.dirt2, -.25) : th.dirt;
    S.circle(ctx, 0, 0, r + 8); ctx.stroke();
    ctx.lineWidth = 5;
    ctx.strokeStyle = th.grass;
    S.circle(ctx, 0, 0, r); ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = th.grassLight;
    S.circle(ctx, 0, 0, r - 2.5); ctx.stroke();
    if (!back) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.18)';
      S.circle(ctx, 0, 0, r + 14); ctx.stroke();
    }
    ctx.restore();
  };
})();
