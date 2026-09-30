/* ============================================================
   gfx.js — desenho procedural dos personagens e objetos
   ============================================================ */
(function () {
  'use strict';
  var S = window.S;
  var Gfx = S.Gfx = {};

  Gfx.CHARS = {
    lula: {
      name: 'LULA', full: 'LUIZ INACIO LULA DA SILVA',
      human: true, hairStyle: 'wavy', beard: true, smile: true,
      body: '#252a3a', body2: '#39405a', dark: '#14171f',
      suit: '#252a3a', suit2: '#39405a', suitDark: '#14171f',
      skin: '#e8ac7e', skin2: '#cf8f63',
      hair: '#e9e9e9', hair2: '#bfbfbf', eye: '#4a3526',
      tie: '#cf2b25', tie2: '#8d1d17', shirt: '#ffffff', card: '#c0392b', pickup: 'picanha',
      shoe: '#15181f', shoeB: '#2a2f3c', cuff: '#ffffff', pin: false,
      superBody: '#ffe14d', superBody2: '#fff5a8', superDark: '#e0a91a',
      top: 5.9, jump: 6.2, acc: 0.046875,
      ability: 'PLANEIO E ESCALADA',
      desc: 'Planeia no ar e escala paredes. Quebra blocos no impacto.'
    },
    bolsonaro: {
      name: 'BOLSONARO', full: 'JAIR BOLSONARO',
      human: true, hairStyle: 'short', beard: false, smile: false,
      body: '#22304f', body2: '#33456e', dark: '#131b2e',
      suit: '#22304f', suit2: '#33456e', suitDark: '#131b2e',
      skin: '#f0b083', skin2: '#d89468',
      hair: '#4a3626', hair2: '#8d8378', eye: '#3c6ea8',
      tie: '#1aa053', tie2: '#ffd23c', shirt: '#ffffff', card: '#1e7a3c', pickup: 'comprimido',
      shoe: '#15181f', shoeB: '#2a2f3c', cuff: '#ffffff', pin: true,
      superBody: '#ffe14d', superBody2: '#fff5a8', superDark: '#e0a91a',
      top: 6.2, jump: 6.6, acc: 0.046875,
      ability: 'ARRANCADA (SPIN DASH + DROP DASH)',
      desc: 'O mais rapido. Equilibrado e com o Drop Dash no ar.'
    },
    alexandre: {
      name: 'ALEXANDRE DE MORAIS', full: 'ALEXANDRE DE MORAIS',
      human: true, hairStyle: 'bald', beard: false, smile: false,
      body: '#1b1b20', body2: '#2c2c34', dark: '#0d0d10',
      suit: '#1b1b20', suit2: '#2c2c34', suitDark: '#0d0d10',
      skin: '#f0bd92', skin2: '#d69a6d',
      hair: '#2a2318', hair2: '#4a4033', eye: '#4a4a52',
      tie: '#2a4a8a', tie2: '#6f93d6', shirt: '#bcd4f5',
      shoe: '#101014', shoeB: '#25252d', cuff: '#bcd4f5',
      pin: false, card: '#2a3a6e', pickup: 'dinheiro',
      superBody: '#ffe14d', superBody2: '#fff5a8', superDark: '#e0a91a',
      top: 5.8, jump: 6.3, acc: 0.046875,
      ability: 'PISAO (APERTE O PULO NO AR)',
      desc: 'Mergulha no chao, quebra blocos e solta onda de choque.'
    },
    renan: {
      name: 'RENAN SANTOS', full: 'RENAN SANTOS',
      human: true, hairStyle: 'short', beard: 'stubble', smile: false, noTie: true,
      body: '#1c2440', body2: '#2c3860', dark: '#101728',
      suit: '#1c2440', suit2: '#2c3860', suitDark: '#101728',
      skin: '#eeae84', skin2: '#d0906a',
      hair: '#171512', hair2: '#3a342c', eye: '#4a3526',
      tie: '#1c2440', tie2: '#2c3860', shirt: '#ffffff', card: '#3b4a86',
      shoe: '#15181f', shoeB: '#2a2f3c', cuff: '#ffffff', pin: false,
      superBody: '#ffe14d', superBody2: '#fff9c8', superDark: '#dca516',
      top: 5.7, jump: 6.4, acc: 0.046875,
      ability: 'IMPULSO AEREO (APERTE O PULO NO AR)',
      desc: 'Flutua no ar apertando o pulo de novo. Alcanca qualquer lugar.'
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
    if (id === 'bolsonaro') {
      var base = -30 + bob;
      S.poly(ctx, [-6, base - 6, -22, base - 12, -8, base + 1]); ctx.fill();
      S.poly(ctx, [-6, base - 1, -23, base - 1, -7, base + 6]); ctx.fill();
      S.poly(ctx, [-5, base + 4, -20, base + 10, -6, base + 10]); ctx.fill();
    } else if (id === 'lula') {
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
    var c = Gfx.CHARS[id] || Gfx.CHARS.lula;
    if (!superForm) return c;
    var o = {};
    for (var k in c) o[k] = c[k];
    o.body = c.superBody; o.body2 = c.superBody2; o.dark = c.superDark;
    o.suit = c.superBody; o.suit2 = c.superBody2; o.suitDark = c.superDark;
    return o;
  }

  /* x,y = pé do personagem (centro da base) */
  Gfx.drawChar = function (ctx, id, o) {
    var c = pal(id, o.superForm);
    if (c.human) { Gfx.drawHuman(ctx, c, o); return; }
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
      if (id === 'renan') { ctx.globalAlpha *= .9; }
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
    if (id === 'renan') Gfx.tailsPart(ctx, c, t * (st === 'run' || st === 'dash' ? .9 : .35), 1);
    Gfx.spikesPart(ctx, c, id, bob);

    // braços de trás
    ctx.fillStyle = c.skin;
    var armSw = (st === 'walk' || st === 'run' || st === 'dash') ? Math.sin(t * .35) * 5 : 0;
    ctx.save(); ctx.translate(-4, -19 + bob * .5);
    ctx.rotate(st === 'run' || st === 'dash' ? -0.9 : armSw * .09);
    ctx.fillRect(-2, 0, 4, 8); ctx.restore();

    Gfx.torsoPart(ctx, c, bob);

    if (id === 'lula') {
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
    rings: function (ctx, t) { Gfx.pickup(ctx, 0, 0, t || 0, .85); },
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
      Gfx.drawChar(ctx, char || 'bolsonaro', { x: 0, y: 8, state: 'idle', t: 0, facing: 1, scale: .38 });
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
      Gfx.drawChar(ctx, charId || 'bolsonaro', { x: 0, y: 14, state: 'idle', t: 0, facing: 1, scale: .62 });
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
    banco: {
      name: 'BANCO MASTER',
      sky: ['#2f8ce0', '#6fc0f2', '#bfe4fb'],
      grass: '#2f6fd8', grassDark: '#16305e', grassLight: '#7fb6ff',
      dirt: '#8f96a8', dirt2: '#767e92', edge: '#3a4054',
      accent: '#ffd23c', water: 'rgba(90,150,240,.35)',
      music: 'boss'
    },
    camara: {
      name: 'CAMARA DOS DEPUTADOS',
      sky: ['#150f14', '#241a1c', '#33261f'],
      grass: '#c07a2e', grassDark: '#8a5320', grassLight: '#e6a758',
      dirt: '#6b4a2a', dirt2: '#573a20', edge: '#2e1f12',
      accent: '#ffd23c', water: 'rgba(60,150,255,.3)',
      music: 'zone1'
    },
    senado: {
      name: 'SENADO FEDERAL',
      sky: ['#06133f', '#0d2a6e', '#1a52b8'],
      grass: '#2f6fd8', grassDark: '#1b4795', grassLight: '#7fb6ff',
      dirt: '#1b2a5e', dirt2: '#142146', edge: '#0a1230',
      accent: '#ffd23c', water: 'rgba(80,140,255,.35)',
      music: 'zone2'
    },
    stf: {
      name: 'SUPREMO TRIBUNAL FEDERAL',
      sky: ['#2b1f6b', '#8a3f8a', '#ff8a3c'],
      grass: '#e6ebf7', grassDark: '#aab3cc', grassLight: '#ffffff',
      dirt: '#9aa0b5', dirt2: '#7f8699', edge: '#4a4f63',
      accent: '#ffd23c', water: 'rgba(120,150,230,.4)',
      music: 'zone3'
    },
    congresso: {
      name: 'PRACA DOS TRES PODERES',
      sky: ['#1b2a6b', '#7b3f9e', '#ff9a3c'],
      grass: '#2f9f4f', grassDark: '#1d6b36', grassLight: '#63d47a',
      dirt: '#9aa0b8', dirt2: '#7d8399', edge: '#3a3f55',
      accent: '#ffd23c', water: 'rgba(90,120,220,.4)',
      music: 'zone1'
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
    else if (theme === 'congresso') Gfx.bgCongresso(ctx, th, cam, t);
    else if (theme === 'banco') Gfx.bgBanco(ctx, th, cam, t);
    else if (theme === 'camara') Gfx.bgCamara(ctx, th, cam, t);
    else if (theme === 'senado') Gfx.bgSenado(ctx, th, cam, t);
    else if (theme === 'stf') Gfx.bgSTF(ctx, th, cam, t);
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

/* ---------- caricaturas humanas: corpo ---------- */
(function () {
  'use strict';
  var S = window.S, Gfx = S.Gfx;

  function dressShoe(ctx, c, x, y, r) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(r || 0);
    ctx.fillStyle = c.shoe;
    S.roundRect(ctx, -7, -4, 16, 8, 3.5); ctx.fill();
    ctx.fillStyle = c.shoeB;
    S.roundRect(ctx, -6, -3.6, 8, 3, 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    S.ellipse(ctx, 4, -1.6, 3.4, 1.3, -.2); ctx.fill();
    ctx.restore();
  }

  function trouser(ctx, c, x, y, h, w) {
    w = w || 4.8;
    ctx.fillStyle = c.suit;
    S.roundRect(ctx, x - w, y - h, w * 2, h, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    S.roundRect(ctx, x - .9, y - h + 1, 1.8, h - 2, .9); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    S.roundRect(ctx, x - w, y - h, 1.6, h, .8); ctx.fill();
  }

  Gfx.dressShoe = dressShoe;

  Gfx.humanLegs = function (ctx, c, st, t) {
    var sw, k;
    if (st === 'run' || st === 'dash') {
      var rs = st === 'dash' ? .62 : .46;
      var rw = Math.sin(t * rs) * 9;
      ctx.save();
      ctx.globalAlpha = .22; ctx.fillStyle = c.suit2;
      S.ellipse(ctx, -1, -9, 12, 6, 0); ctx.fill();
      ctx.restore();
      trouser(ctx, c, -1 - rw * .45, -4, 15, 4.4);
      dressShoe(ctx, c, -2 - rw, -3 - Math.max(0, -rw) * 2.2, -rw * .05);
      trouser(ctx, c, -1 + rw * .45, -4 - Math.max(0, rw) * 2.5, 15, 4.4);
      dressShoe(ctx, c, -1 + rw, -3 - Math.max(0, rw) * 3, rw * .05);
      return;
    }
    if (st === 'walk') {
      sw = Math.sin(t * .33) * 6.5;
      trouser(ctx, c, -1 - sw * .45, -4, 15, 4.5);
      trouser(ctx, c, -1 + sw * .45, -4, 15, 4.5);
      dressShoe(ctx, c, -2 - sw, -3, 0);
      dressShoe(ctx, c, -1 + sw, -3, 0);
      return;
    }
    if (st === 'skid') {
      trouser(ctx, c, 5, -4, 14, 4.5); trouser(ctx, c, -6, -4, 14, 4.5);
      dressShoe(ctx, c, 8, -3, -.25);
      dressShoe(ctx, c, -7, -3, .15);
      return;
    }
    if (st === 'fly' || st === 'glide') {
      trouser(ctx, c, 3, -4, 13, 4.4); trouser(ctx, c, -5, -3, 13, 4.4);
      dressShoe(ctx, c, 3, -2, .35);
      dressShoe(ctx, c, -6, -1, .15);
      return;
    }
    if (st === 'climb') {
      k = Math.sin(t * .2) * 3;
      trouser(ctx, c, 3, -5 + k, 13, 4.4); trouser(ctx, c, -4, -4 - k, 13, 4.4);
      dressShoe(ctx, c, 3, -4 + k, -.3);
      dressShoe(ctx, c, -4, -2 - k, -.3);
      return;
    }
    trouser(ctx, c, 4.6, -4, 16, 4.8);
    trouser(ctx, c, -4.6, -4, 16, 4.8);
    dressShoe(ctx, c, 4.6, -3, 0);
    dressShoe(ctx, c, -5, -3, 0);
  };
})();

/* ---------- caricaturas humanas: terno e bola ---------- */
(function () {
  'use strict';
  var S = window.S, Gfx = S.Gfx;

  Gfx.humanTorso = function (ctx, c, bob) {
    var y0 = -23.5 + bob * .5, y1 = -12.5, k;
    ctx.fillStyle = c.suitDark;
    S.roundRect(ctx, -13.8, y0 - 1, 27.6, 8, 5); ctx.fill();
    ctx.fillStyle = c.suit;
    S.roundRect(ctx, -12.8, y0, 25.6, y1 - y0, 6); ctx.fill();
    ctx.fillStyle = c.suit2;
    S.roundRect(ctx, -12.8, y0, 25.6, 7, 5); ctx.fill();

    ctx.fillStyle = c.shirt;
    S.poly(ctx, [-4.5, y0 - 1, 4.5, y0 - 1, 3, y0 + 9, 0, y0 + 12, -3, y0 + 9]); ctx.fill();

    if (c.noTie) {
      ctx.fillStyle = c.suit2;
      S.poly(ctx, [-4.6, y0 - 1, -1.4, y0 + 7, -5.8, y0 + 10]); ctx.fill();
      S.poly(ctx, [4.6, y0 - 1, 1.4, y0 + 7, 5.8, y0 + 10]); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.10)';
      S.ellipse(ctx, 0, y0 + 4, 2.6, 3.4, 0); ctx.fill();
    } else {
      ctx.fillStyle = c.tie;
      S.poly(ctx, [-2.2, y0 + 1, 2.2, y0 + 1, 2.8, y0 + 4, 0, y0 + 13.5, -2.8, y0 + 4]); ctx.fill();
      ctx.fillStyle = c.tie2;
      for (k = 0; k < 3; k++) {
        S.poly(ctx, [-2.6, y0 + 3 + k * 3.4, 2.6, y0 + 1.8 + k * 3.4,
                     2.6, y0 + 3.4 + k * 3.4, -2.6, y0 + 4.6 + k * 3.4]);
        ctx.fill();
      }
      ctx.fillStyle = c.tie;
      S.roundRect(ctx, -2.4, y0, 4.8, 3.4, 1.4); ctx.fill();
    }

    ctx.fillStyle = c.suit2;
    S.poly(ctx, [-5, y0 - 1, -11.4, y0 + 2, -6.5, y0 + 10]); ctx.fill();
    S.poly(ctx, [5, y0 - 1, 11.4, y0 + 2, 6.5, y0 + 10]); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    S.roundRect(ctx, -12.8, y1 - 3, 25.6, 3, 1.5); ctx.fill();

    if (c.pin) {
      ctx.fillStyle = '#1aa053';
      S.roundRect(ctx, 7.4, y0 + 4, 4.4, 3.2, 1); ctx.fill();
      ctx.fillStyle = '#ffd23c';
      S.circle(ctx, 9.6, y0 + 5.6, 1.1); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,.3)';
    S.circle(ctx, 4.5, y1 - 3.5, 1); ctx.fill();
  };

  Gfx.humanBall = function (ctx, c, spin, r) {
    r = r || 15;
    ctx.save();
    ctx.translate(0, -r);
    ctx.rotate(spin);
    ctx.fillStyle = c.suitDark || c.dark;
    S.circle(ctx, 0, 0, r); ctx.fill();
    ctx.fillStyle = c.suit || c.body;
    S.circle(ctx, 0, 0, r - 1.6); ctx.fill();
    ctx.fillStyle = c.suit2 || c.body2;
    for (var i = 0; i < 3; i++) {
      var a = i * Math.PI * 2 / 3;
      ctx.beginPath();
      ctx.arc(0, 0, r - 2, a, a + .8);
      ctx.arc(0, 0, r - 6.5, a + .8, a, true);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = c.shirt || '#ffffff';
    S.ellipse(ctx, -3.5, 5, 4.6, 3, .5); ctx.fill();
    ctx.fillStyle = c.tie || c.dark;
    S.ellipse(ctx, -5, 7.5, 2.4, 3.4, .5); ctx.fill();
    ctx.fillStyle = (c.hairStyle === 'bald') ? c.skin2 : c.hair;
    S.circle(ctx, 1, -2, 8); ctx.fill();
    ctx.fillStyle = c.skin;
    S.circle(ctx, 2.6, 0.6, 6.4); ctx.fill();
    ctx.fillStyle = '#ffffff';
    S.ellipse(ctx, 3.4, -1.4, 2, 1.7, 0); ctx.fill();
    ctx.fillStyle = c.eye || '#3b2a1a';
    S.circle(ctx, 3.8, -1.2, 1.1); ctx.fill();
    ctx.fillStyle = c.skin2;
    S.ellipse(ctx, 5.6, 2, 1.8, 1.5, 0); ctx.fill();
    ctx.restore();
  };
})();

/* ---------- caricaturas humanas: rosto ---------- */
(function () {
  'use strict';
  var S = window.S, Gfx = S.Gfx;

  Gfx.humanHead = function (ctx, c, bob, blink, st) {
    var hx = 1.5, hy = -34.5 + bob;

    ctx.fillStyle = c.skin2;
    S.roundRect(ctx, hx - 3.6, hy + 8, 7.2, 8, 3); ctx.fill();
    S.ellipse(ctx, hx - 11.5, hy + 1, 2.6, 4, 0); ctx.fill();
    S.ellipse(ctx, hx + 11.5, hy + 1, 2.6, 4, 0); ctx.fill();

    ctx.fillStyle = c.skin;
    S.ellipse(ctx, hx, hy, 12, 13.2, 0); ctx.fill();
    ctx.save();
    ctx.globalAlpha = .3; ctx.fillStyle = c.skin2;
    S.ellipse(ctx, hx, hy + 7.5, 9, 5.2, 0); ctx.fill();
    ctx.restore();

    if (c.hairStyle === 'bald') {
      ctx.save();
      ctx.globalAlpha = .5;
      ctx.fillStyle = '#ffffff';
      S.ellipse(ctx, hx - 3.5, hy - 7.5, 5.2, 3.2, -.35); ctx.fill();
      ctx.globalAlpha = .18;
      S.ellipse(ctx, hx + 4, hy - 9, 3.4, 2, .3); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = .16; ctx.fillStyle = c.skin2;
      ctx.beginPath();
      ctx.ellipse(hx, hy - 2, 12, 11, 0, Math.PI, Math.PI * 1.25);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    } else if (c.hairStyle === 'wavy') {
      ctx.fillStyle = c.hair;
      ctx.beginPath();
      ctx.ellipse(hx, hy - 3.5, 12.8, 10.8, 0, Math.PI, 0);
      ctx.closePath(); ctx.fill();
      S.ellipse(ctx, hx - 11.2, hy - 1, 3.4, 6.4, .2); ctx.fill();
      S.ellipse(ctx, hx + 11.2, hy - 1, 3.4, 6.4, -.2); ctx.fill();
      ctx.fillStyle = c.hair2;
      S.ellipse(ctx, hx - 5, hy - 10, 6.4, 3.2, -.28); ctx.fill();
      S.ellipse(ctx, hx + 6, hy - 9.4, 5, 2.6, .24); ctx.fill();
    } else {
      ctx.fillStyle = c.hair;
      ctx.beginPath();
      ctx.ellipse(hx, hy - 2.5, 12.4, 10, 0, Math.PI, 0);
      ctx.closePath(); ctx.fill();
      S.poly(ctx, [hx - 12.2, hy - 3, hx - 5, hy - 13, hx + 9, hy - 12,
                   hx + 12.2, hy - 4, hx + 8, hy - 8, hx - 3, hy - 9]); ctx.fill();
      ctx.fillStyle = c.hair2;
      S.ellipse(ctx, hx - 10.6, hy - 2.5, 2.4, 4.4, .16); ctx.fill();
      S.ellipse(ctx, hx + 10.6, hy - 2.5, 2.4, 4.4, -.16); ctx.fill();
    }

    ctx.fillStyle = (c.hairStyle === 'wavy') ? c.hair2 : (c.hair === '#171512' ? '#171512' : '#33251a');
    if (c.smile) {
      S.ellipse(ctx, hx - 4.6, hy - 4.6, 3.6, 1.3, -.2); ctx.fill();
      S.ellipse(ctx, hx + 4.6, hy - 4.9, 3.6, 1.3, .14); ctx.fill();
    } else {
      S.poly(ctx, [hx - 9, hy - 6.6, hx - 1, hy - 4.2, hx - 1, hy - 2.2, hx - 9, hy - 4.2]); ctx.fill();
      S.poly(ctx, [hx + 9, hy - 7, hx + 1, hy - 4.6, hx + 1, hy - 2.6, hx + 9, hy - 4.6]); ctx.fill();
    }

    var ey = hy - .4 + (st === 'lookup' ? -1.4 : (st === 'crouch' ? 1.2 : 0));
    ctx.fillStyle = '#ffffff';
    S.ellipse(ctx, hx - 4.4, ey, 3.2, blink ? .6 : 3.3, 0); ctx.fill();
    S.ellipse(ctx, hx + 4.6, ey, 3.2, blink ? .6 : 3.3, 0); ctx.fill();
    if (!blink) {
      ctx.fillStyle = c.eye || '#3b2a1a';
      S.circle(ctx, hx - 3.4, ey + .3, 1.7); ctx.fill();
      S.circle(ctx, hx + 5.4, ey + .3, 1.7); ctx.fill();
      ctx.fillStyle = '#16181f';
      S.circle(ctx, hx - 3.4, ey + .3, .8); ctx.fill();
      S.circle(ctx, hx + 5.4, ey + .3, .8); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      S.circle(ctx, hx - 4, ey - .6, .7); ctx.fill();
      S.circle(ctx, hx + 4.8, ey - .6, .7); ctx.fill();
    }

    ctx.fillStyle = c.skin2;
    S.ellipse(ctx, hx + 1, hy + 4.2, 2.8, 2.3, 0); ctx.fill();

    if (c.beard === 'stubble') {
      ctx.save();
      ctx.globalAlpha = .55; ctx.fillStyle = c.hair;
      ctx.beginPath();
      ctx.ellipse(hx, hy + 4.6, 9.4, 8.6, 0, 0, Math.PI);
      ctx.closePath(); ctx.fill();
      S.ellipse(ctx, hx - 8.6, hy + 1.6, 2.4, 4.6, 0); ctx.fill();
      S.ellipse(ctx, hx + 8.6, hy + 1.6, 2.4, 4.6, 0); ctx.fill();
      ctx.restore();
      ctx.fillStyle = c.hair;
      S.ellipse(ctx, hx + .6, hy + 6.4, 4.6, 1.5, 0); ctx.fill();
      S.roundRect(ctx, hx - 1.2, hy + 9.4, 3.2, 3.4, 1.4); ctx.fill();
      ctx.save();
      ctx.strokeStyle = '#8a4a42'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(hx - 3.4, hy + 8.4); ctx.lineTo(hx + 4.2, hy + 8);
      ctx.stroke();
      ctx.restore();
    } else if (c.beard) {
      ctx.fillStyle = c.hair;
      ctx.beginPath();
      ctx.ellipse(hx, hy + 5.6, 9.8, 8.2, 0, 0, Math.PI);
      ctx.closePath(); ctx.fill();
      S.ellipse(ctx, hx - 8.8, hy + 2.6, 2.8, 5, 0); ctx.fill();
      S.ellipse(ctx, hx + 8.8, hy + 2.6, 2.8, 5, 0); ctx.fill();
      ctx.fillStyle = '#7a3b3b';
      S.ellipse(ctx, hx + .6, hy + 8.4, 4.8, 2.8, 0); ctx.fill();
      ctx.fillStyle = '#ffffff';
      S.ellipse(ctx, hx + .6, hy + 7.6, 4.4, 1.6, 0); ctx.fill();
      ctx.fillStyle = c.hair2;
      S.ellipse(ctx, hx + .6, hy + 5.8, 5.6, 2, 0); ctx.fill();
    } else {
      ctx.save();
      ctx.strokeStyle = '#8a4a42'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath();
      if (st === 'hurt') ctx.arc(hx + .6, hy + 10.6, 3.4, Math.PI * 1.15, Math.PI * 1.85);
      else { ctx.moveTo(hx - 3.8, hy + 8.6); ctx.lineTo(hx + 4.6, hy + 8.1); }
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = .12; ctx.fillStyle = '#000000';
      S.ellipse(ctx, hx + .6, hy + 10, 4.6, 1.5, 0); ctx.fill();
      ctx.restore();
    }
  };
})();

/* ---------- caricaturas humanas: pose completa ---------- */
(function () {
  'use strict';
  var S = window.S, Gfx = S.Gfx;

  Gfx.drawHuman = function (ctx, c, o) {
    var t = o.t || 0;
    var st = o.state || 'idle';
    var face = o.facing < 0 ? -1 : 1;
    var d;

    ctx.save();
    ctx.translate(o.x, o.y);
    if (o.angle) ctx.rotate(o.angle);
    if (o.scale) ctx.scale(o.scale, o.scale);
    ctx.scale(face, 1);
    if (o.flash && Math.floor(t / 2) % 2 === 0) ctx.globalAlpha = .35;

    if (st === 'roll' || st === 'jump' || st === 'spring' || st === 'dead') {
      Gfx.humanBall(ctx, c, o.spin || t * .4, 15);
      ctx.restore();
      if (o.superForm) Gfx.superAura(ctx, o.x, o.y - 15, 20, t);
      return;
    }

    if (st === 'spindash') {
      Gfx.humanBall(ctx, c, t * 1.1, 14);
      ctx.restore();
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.scale(face, 1);
      ctx.globalAlpha = .5;
      ctx.fillStyle = '#ffffff';
      for (d = 0; d < 3; d++) {
        S.circle(ctx, -14 - d * 9 - (t * 2 % 7), -4 - Math.sin(t * .4 + d) * 3, 4 - d);
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    var bob = (st === 'idle') ? Math.sin(t * .09) * .9 : 0;
    var blink = (st === 'idle') && (Math.floor(t / 14) % 13 === 0);
    if (st === 'crouch') { ctx.translate(0, 9); ctx.scale(1, .78); }

    var armSw = (st === 'walk' || st === 'run' || st === 'dash') ? Math.sin(t * .35) * 5 : 0;

    ctx.save();
    ctx.translate(-9.5, -20 + bob * .5);
    ctx.rotate((st === 'run' || st === 'dash') ? -0.85 : armSw * .1);
    ctx.fillStyle = c.suitDark;
    S.roundRect(ctx, -3.4, 0, 6.8, 13, 3); ctx.fill();
    ctx.fillStyle = c.skin2;
    S.circle(ctx, 0, 14.5, 3.3); ctx.fill();
    ctx.restore();

    Gfx.humanLegs(ctx, c, st, t);
    Gfx.humanTorso(ctx, c, bob);
    Gfx.humanHead(ctx, c, bob, blink, st);

    var rot = armSw * -.11;
    if (st === 'run' || st === 'dash') rot = -1.15;
    else if (st === 'skid') rot = -1.55;
    else if (st === 'push') rot = -1.35;
    else if (st === 'victory') rot = -2.55;
    else if (st === 'glide') rot = -1.95;
    else if (st === 'fly') rot = -1.7 + Math.sin(t * .3) * .25;
    else if (st === 'climb') rot = -2.25 + Math.sin(t * .2) * .3;
    else if (st === 'lookup') rot = -.25;
    ctx.save();
    ctx.translate(9.5, -20 + bob * .5);
    ctx.rotate(rot);
    ctx.fillStyle = c.suit;
    S.roundRect(ctx, -3.7, 0, 7.4, 13, 3); ctx.fill();
    ctx.fillStyle = c.cuff;
    ctx.fillRect(-3.7, 11.4, 7.4, 1.9);
    ctx.fillStyle = c.skin;
    S.circle(ctx, 0, 15.4, 3.6); ctx.fill();
    if (st === 'victory') {
      ctx.fillStyle = c.skin;
      S.roundRect(ctx, -1.2, 11, 2.6, 5, 1.2); ctx.fill();
    }
    ctx.restore();

    if (st === 'hurt') {
      ctx.globalAlpha = .4; ctx.fillStyle = '#ffffff';
      S.circle(ctx, 1.5, -33, 15); ctx.fill();
    }

    ctx.restore();
    if (o.superForm) Gfx.superAura(ctx, o.x, o.y - 24, 28, t);
  };
})();

/* ---------- cenário: Congresso Nacional ao pôr do sol ---------- */
(function () {
  'use strict';
  var S = window.S, Gfx = S.Gfx;

  var CLOUDS = [
    [30, 52, 120, 10, '#f07a4a'], [180, 38, 90, 8, '#c95ea8'],
    [300, 66, 150, 11, '#ff9a5c'], [470, 44, 110, 9, '#f2708c'],
    [80, 96, 170, 12, '#ff8f4d'], [360, 110, 140, 10, '#ffb56b'],
    [520, 86, 120, 9, '#ff7f5a'], [210, 128, 160, 11, '#ffc27a'],
    [10, 150, 130, 9, '#ffb069'], [430, 148, 150, 10, '#ffd08a']
  ];

  function skyline(ctx, x, y, s) {
    // silhueta distante de arvores
    ctx.fillStyle = '#1d4a2e';
    for (var i = 0; i < 26; i++) {
      var px = x + i * 26 * s;
      ctx.beginPath();
      ctx.ellipse(px, y, 16 * s, (8 + ((i * 37) % 9)) * s, 0, Math.PI, 0);
      ctx.closePath(); ctx.fill();
    }
  }

  function congressBuilding(ctx, cx, base, sc, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    ctx.translate(cx, base);
    ctx.scale(sc, sc);

    // cupula (esquerda) e tigela (direita)
    ctx.fillStyle = '#e9ecf5';
    ctx.beginPath();
    ctx.ellipse(-170, 0, 92, 52, 0, Math.PI, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#cfd6e8';
    ctx.beginPath();
    ctx.ellipse(-170, 0, 92, 52, 0, Math.PI, Math.PI * 1.45);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#dfe5f2';
    ctx.beginPath();
    ctx.moveTo(78, -44); ctx.lineTo(262, -44);
    ctx.quadraticCurveTo(170, 24, 78, -44);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f6f8ff';
    ctx.beginPath();
    ctx.moveTo(78, -44); ctx.lineTo(262, -44);
    ctx.quadraticCurveTo(170, -20, 78, -44);
    ctx.closePath(); ctx.fill();

    // torres gemeas
    ctx.fillStyle = '#d7dcea';
    ctx.fillRect(-46, -212, 40, 212);
    ctx.fillStyle = '#eef1fa';
    ctx.fillRect(8, -212, 40, 212);
    ctx.fillStyle = '#9aa2bd';
    ctx.fillRect(-6, -212, 14, 212);
    ctx.fillStyle = 'rgba(80,90,130,.5)';
    for (var r = 0; r < 26; r++) {
      ctx.fillRect(-44, -206 + r * 8, 36, 3);
      ctx.fillRect(10, -206 + r * 8, 36, 3);
    }
    ctx.fillStyle = '#7fd4ff';
    ctx.fillRect(-8, -118, 18, 16);
    ctx.fillStyle = '#c3cbdb';
    ctx.fillRect(-42, -222, 3, 12); ctx.fillRect(-16, -222, 3, 12);
    ctx.fillRect(14, -222, 3, 12); ctx.fillRect(40, -222, 3, 12);

    // base horizontal
    ctx.fillStyle = '#eef1fa';
    ctx.fillRect(-330, 0, 660, 14);
    ctx.fillStyle = '#20264a';
    ctx.fillRect(-330, 14, 660, 30);
    ctx.fillStyle = '#ffd88a';
    for (var w = 0; w < 44; w++) {
      if ((w * 7) % 5 === 0) ctx.fillStyle = '#ffe9b8'; else ctx.fillStyle = '#3d4a7d';
      ctx.fillRect(-326 + w * 15, 18, 10, 22);
    }
    ctx.fillStyle = '#dfe5f2';
    for (var p = 0; p < 45; p++) ctx.fillRect(-330 + p * 14.7, 14, 3, 30);
    ctx.fillStyle = '#e9ecf5';
    ctx.fillRect(-330, 44, 660, 8);

    // rampa central
    ctx.fillStyle = '#f2f5ff';
    S.poly(ctx, [-8, 0, 20, 0, 58, 52, 8, 52]); ctx.fill();
    ctx.fillStyle = 'rgba(120,130,170,.45)';
    for (var q = 0; q < 8; q++) S.poly(ctx, [0 + q * 5, 6 + q * 6, 24 + q * 5, 6 + q * 6, 26 + q * 5, 9 + q * 6, 2 + q * 5, 9 + q * 6]), ctx.fill();

    ctx.restore();
  }

  function flag(ctx, x, y, t, sc) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(sc, sc);
    ctx.fillStyle = '#c3cbdb';
    ctx.fillRect(-1.5, -70, 3, 70);
    var w = Math.sin(t * .06) * 3;
    ctx.fillStyle = '#1aa053';
    S.poly(ctx, [2, -70, 40, -66 + w, 40, -48 + w, 2, -52]); ctx.fill();
    ctx.fillStyle = '#ffd23c';
    S.poly(ctx, [10, -62, 21, -58 + w * .6, 32, -62 + w, 21, -66 + w * .4]); ctx.fill();
    ctx.fillStyle = '#1b3a8f';
    S.circle(ctx, 21, -62 + w * .4, 3.4); ctx.fill();
    ctx.restore();
  }

  function lamp(ctx, x, y, sc) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(sc, sc);
    ctx.fillStyle = '#3a3f55';
    ctx.fillRect(-1.5, -26, 3, 26);
    ctx.fillStyle = '#ffd88a';
    S.circle(ctx, 0, -28, 3.4); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,200,110,.30)';
    S.circle(ctx, 0, -28, 9); ctx.fill();
    ctx.restore();
  }

  Gfx.bgCongresso = function (ctx, th, cam, t) {
    var px = -(cam.x * .08) % 640;
    var py = -cam.y * .05;

    // estrelas
    ctx.save();
    for (var i = 0; i < 60; i++) {
      var sx = ((i * 173) % 640 + px * .4 + 640) % 640;
      var sy = (i * 47) % 120;
      ctx.globalAlpha = .25 + ((i * 13) % 10) / 16;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx, sy + py, 2, 2);
    }
    ctx.restore();

    // sol
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var g = ctx.createRadialGradient(556, 214 + py, 6, 556, 214 + py, 110);
    g.addColorStop(0, 'rgba(255,240,170,.95)');
    g.addColorStop(.35, 'rgba(255,170,70,.45)');
    g.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = g; S.circle(ctx, 556, 214 + py, 110); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#ffeaa0';
    S.circle(ctx, 556, 214 + py, 26); ctx.fill();

    // nuvens
    ctx.save();
    for (var k = 0; k < CLOUDS.length; k++) {
      var cl = CLOUDS[k];
      var cx2 = ((cl[0] + px * (1 + (k % 3) * .35) + t * .08 * (1 + k % 2)) % 820 + 820) % 820 - 90;
      ctx.globalAlpha = .75;
      ctx.fillStyle = cl[4];
      S.roundRect(ctx, cx2, cl[1] + py, cl[2], cl[3], cl[3] / 2); ctx.fill();
      S.roundRect(ctx, cx2 + cl[2] * .25, cl[1] + py - cl[3] * .7, cl[2] * .5, cl[3], cl[3] / 2); ctx.fill();
    }
    ctx.restore();

    // arvores no horizonte
    skyline(ctx, -20 + px * .5, 232 + py, 1);

    // gramado
    ctx.fillStyle = '#2f9f4f';
    ctx.fillRect(0, 232 + py, S.W, 40);
    ctx.fillStyle = '#63d47a';
    ctx.fillRect(0, 232 + py, S.W, 4);

    // predio
    congressBuilding(ctx, 320 + px * .6, 228 + py, .52);
    flag(ctx, 470 + px * .6, 232 + py, t, .9);
    lamp(ctx, 120 + px * .6, 240 + py, 1);
    lamp(ctx, 224 + px * .6, 240 + py, 1);
    lamp(ctx, 424 + px * .6, 240 + py, 1);
    lamp(ctx, 528 + px * .6, 240 + py, 1);

    // espelho d'agua
    var poolY = 272 + py;
    var pg = ctx.createLinearGradient(0, poolY, 0, S.H);
    pg.addColorStop(0, '#3a4fa8');
    pg.addColorStop(1, '#1b2050');
    ctx.fillStyle = pg;
    ctx.fillRect(0, poolY, S.W, S.H - poolY);

    ctx.save();
    ctx.beginPath(); ctx.rect(0, poolY, S.W, S.H - poolY); ctx.clip();
    ctx.globalAlpha = .34;
    ctx.translate(0, poolY * 2 + 8);
    ctx.scale(1, -1);
    congressBuilding(ctx, 320 + px * .6, 228 + py, .52);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,200,120,.16)';
    for (var r2 = 0; r2 < 14; r2++) {
      var ry = poolY + 6 + r2 * 7;
      var off = Math.sin(t * .04 + r2) * 10;
      ctx.fillRect(516 + off, ry, 80 - r2 * 2, 2.4);
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(255,255,255,.22)';
    for (var w2 = 0; w2 < 18; w2++) {
      var wy = poolY + 4 + w2 * 5;
      ctx.fillRect((w2 * 91 + t * .5) % S.W, wy, 26, 1.4);
    }
    ctx.fillStyle = '#e9ecf5';
    ctx.fillRect(0, poolY - 4, S.W, 4);
  };
})();

/* ---------- cenário: Câmara dos Deputados ---------- */
(function () {
  'use strict';
  var S = window.S, Gfx = S.Gfx;

  /* repete um desenho a cada `period` px com parallax `f` */
  function band(cam, f, period, cb) {
    var off = ((cam.x * f) % period + period) % period;
    var i0 = Math.floor(cam.x * f / period);
    for (var i = -1; i <= Math.ceil(S.W / period) + 1; i++) cb(i * period - off, i0 + i);
  }
  Gfx.bgBand = band;

  function flagBR(ctx, x, y, h, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#c3cbdb';
    ctx.fillRect(-1.5, -h, 3, h);
    ctx.fillStyle = '#e0c14a';
    S.circle(ctx, 0, -h - 3, 3); ctx.fill();
    var w = Math.sin(t * .05 + x * .01) * 2;
    ctx.fillStyle = '#1aa053';
    S.poly(ctx, [2, -h + 4, 24, -h + 2 + w, 26, -h + 34 + w, 2, -h + 32]); ctx.fill();
    ctx.fillStyle = '#ffd23c';
    S.poly(ctx, [6, -h + 18, 14, -h + 8 + w * .6, 22, -h + 18 + w, 14, -h + 28 + w * .4]); ctx.fill();
    ctx.fillStyle = '#12308f';
    S.circle(ctx, 14, -h + 18 + w * .5, 4.2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.fillRect(10, -h + 17 + w * .5, 8, 1);
    ctx.restore();
  }
  Gfx.flagBR = flagBR;

  function brasao(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#e0c14a';
    S.circle(ctx, 0, 0, r); ctx.fill();
    ctx.fillStyle = '#1aa053';
    S.circle(ctx, 0, 0, r * .62); ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4;
      S.poly(ctx, [Math.cos(a) * r, Math.sin(a) * r,
                   Math.cos(a + .35) * r * .55, Math.sin(a + .35) * r * .55,
                   Math.cos(a - .35) * r * .55, Math.sin(a - .35) * r * .55]);
      ctx.fill();
    }
    ctx.fillStyle = '#12308f';
    S.circle(ctx, 0, 0, r * .3); ctx.fill();
    ctx.restore();
  }
  Gfx.brasao = brasao;

  Gfx.bgCamara = function (ctx, th, cam, t) {
    var py = -cam.y * .06;

    // teto e luminárias
    ctx.fillStyle = '#0e0b10';
    ctx.fillRect(0, 0, S.W, 46 + py);
    band(cam, .05, 150, function (x) {
      ctx.fillStyle = '#f6e6b0';
      S.roundRect(ctx, x + 30, 14 + py, 64, 7, 3); ctx.fill();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,225,150,.16)';
      S.ellipse(ctx, x + 62, 24 + py, 60, 22, 0); ctx.fill();
      ctx.restore();
    });

    ctx.save();
    var cg = ctx.createLinearGradient(0, 0, 0, 70 + py);
    cg.addColorStop(0, 'rgba(8,6,10,.5)');
    cg.addColorStop(1, 'rgba(8,6,10,0)');
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, S.W, 70 + py);
    ctx.restore();

    // balcão superior de madeira
    ctx.fillStyle = '#3a2716';
    ctx.fillRect(0, 42 + py, S.W, 34);
    band(cam, .1, 46, function (x) {
      ctx.fillStyle = '#7a5227';
      ctx.fillRect(x + 4, 46 + py, 38, 24);
      ctx.fillStyle = '#9a6a33';
      ctx.fillRect(x + 4, 46 + py, 38, 4);
    });
    ctx.fillStyle = '#241608';
    ctx.fillRect(0, 74 + py, S.W, 8);

    // parede de lâminas verticais
    ctx.fillStyle = '#16181f';
    ctx.fillRect(0, 82 + py, S.W, 150);
    band(cam, .18, 14, function (x, i) {
      ctx.fillStyle = (i % 2) ? '#c9ccd8' : '#8d92a3';
      ctx.fillRect(x, 82 + py, 7, 150);
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.fillRect(x + 7, 82 + py, 7, 150);
      if (i % 3 === 0) {
        ctx.fillStyle = '#1aa053';
        ctx.fillRect(x, 104 + py, 7, 26);
        ctx.fillStyle = '#ffd23c';
        ctx.fillRect(x, 130 + py, 7, 22);
      }
    });

    // crucifixo, bandeiras, mesa e brasão a cada ciclo
    band(cam, .25, 620, function (x) {
      ctx.fillStyle = '#d8d2c4';
      ctx.fillRect(x + 308, 96 + py, 4, 34);
      ctx.fillRect(x + 298, 106 + py, 24, 4);
      ctx.fillStyle = '#e8c9a0';
      ctx.fillRect(x + 307, 108 + py, 6, 12);

      flagBR(ctx, x + 196, 232 + py, 118, t);
      flagBR(ctx, x + 424, 232 + py, 118, t);

      ctx.fillStyle = '#5b3a1c';
      S.roundRect(ctx, x + 232, 196 + py, 156, 36, 3); ctx.fill();
      ctx.fillStyle = '#7a5227';
      S.roundRect(ctx, x + 232, 196 + py, 156, 8, 3); ctx.fill();
      ctx.fillStyle = '#1b1d24';
      ctx.fillRect(x + 240, 210 + py, 140, 16);
      brasao(ctx, x + 310, 218 + py, 9);
      ctx.fillStyle = '#3a3f55';
      for (var k = 0; k < 5; k++) S.roundRect(ctx, x + 244 + k * 30, 176 + py, 20, 18, 3), ctx.fill();
    });

    // painéis laterais
    band(cam, .25, 620, function (x) {
      panel(ctx, x + 20, 118 + py, 150, 84, 'CAMARA DOS', 'DEPUTADOS');
      votes(ctx, x + 452, 112 + py, 156, 96, t);
    });

    // bancadas em primeiro plano
    ctx.fillStyle = '#1b1208';
    ctx.fillRect(0, 232 + py, S.W, 60);
    for (var r = 0; r < 3; r++) {
      var yy = 236 + py + r * 20;
      band(cam, .34 + r * .06, 72, function (x) {
        ctx.fillStyle = r % 2 ? '#8a5c2a' : '#7a5227';
        S.roundRect(ctx, x, yy, 64, 13, 2); ctx.fill();
        ctx.fillStyle = '#b4813f';
        ctx.fillRect(x, yy, 64, 3);
        ctx.fillStyle = '#2b2f3c';
        S.roundRect(ctx, x + 8, yy - 9, 18, 10, 2); ctx.fill();
        S.roundRect(ctx, x + 38, yy - 9, 18, 10, 2); ctx.fill();
      });
    }
  };

  function panel(ctx, x, y, w, h, l1, l2) {
    ctx.fillStyle = '#0a1330';
    S.roundRect(ctx, x, y, w, h, 4); ctx.fill();
    ctx.strokeStyle = '#2a3a70'; ctx.lineWidth = 2;
    S.roundRect(ctx, x, y, w, h, 4); ctx.stroke();
    ctx.fillStyle = '#dbe6ff';
    S.text(ctx, l1, x + w / 2, y + h * .44, { size: 13, align: 'center', color: '#dbe6ff', shadow: false });
    S.text(ctx, l2, x + w / 2, y + h * .68, { size: 13, align: 'center', color: '#dbe6ff', shadow: false });
    ctx.fillStyle = '#1aa053'; ctx.fillRect(x + w / 2 - 26, y + h - 14, 18, 4);
    ctx.fillStyle = '#ffd23c'; ctx.fillRect(x + w / 2 - 6, y + h - 14, 18, 4);
    ctx.fillStyle = '#2f6fd8'; ctx.fillRect(x + w / 2 + 14, y + h - 14, 18, 4);
  }

  function votes(ctx, x, y, w, h, t) {
    ctx.fillStyle = '#04122c';
    S.roundRect(ctx, x, y, w, h, 4); ctx.fill();
    ctx.strokeStyle = '#2a3a70'; ctx.lineWidth = 2;
    S.roundRect(ctx, x, y, w, h, 4); ctx.stroke();
    for (var c = 0; c < 4; c++) {
      for (var r = 0; r < 9; r++) {
        var seed = (c * 17 + r * 7 + Math.floor(t / 90)) % 7;
        ctx.fillStyle = seed < 3 ? '#1aa053' : (seed < 5 ? '#ffd23c' : '#1e3a7a');
        ctx.fillRect(x + 8 + c * 36, y + 8 + r * 9, 28, 5);
      }
    }
  }
})();

/* ---------- cenário: Senado Federal ---------- */
(function () {
  'use strict';
  var S = window.S, Gfx = S.Gfx;

  Gfx.bgSenado = function (ctx, th, cam, t) {
    var band = Gfx.bgBand, py = -cam.y * .06;

    // cúpula dourada com luminárias
    ctx.save();
    var dg = ctx.createLinearGradient(0, 0, 0, 150 + py);
    dg.addColorStop(0, '#5a4210');
    dg.addColorStop(1, '#241b08');
    ctx.fillStyle = dg;
    ctx.fillRect(0, 0, S.W, 152 + py);
    ctx.restore();

    for (var row = 0; row < 7; row++) {
      var ry = 12 + row * 20 + py;
      var step = 30 + row * 4;
      band(cam, .03 + row * .004, step, function (x) {
        var r = 4.4 - row * .35;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(255,215,120,' + (0.5 - row * .05) + ')';
        S.circle(ctx, x, ry, r * 2.6); ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#ffeaa8';
        S.circle(ctx, x, ry, r); ctx.fill();
      });
    }
    ctx.fillStyle = 'rgba(10,16,44,.55)';
    ctx.fillRect(0, 132 + py, S.W, 24);
    ctx.save();
    var vg = ctx.createLinearGradient(0, 0, 0, 92 + py);
    vg.addColorStop(0, 'rgba(6,12,40,.55)');
    vg.addColorStop(1, 'rgba(6,12,40,0)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, S.W, 92 + py);
    ctx.restore();

    // parede de lâminas claras ao fundo
    ctx.fillStyle = '#0d1636';
    ctx.fillRect(0, 150 + py, S.W, 110);
    band(cam, .16, 16, function (x, i) {
      ctx.fillStyle = (i % 2) ? '#d5dae8' : '#9aa1b8';
      ctx.fillRect(x, 150 + py, 8, 108);
      ctx.fillStyle = 'rgba(0,0,0,.4)';
      ctx.fillRect(x + 8, 150 + py, 8, 108);
    });
    band(cam, .16, 22, function (x) {
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      S.circle(ctx, x + 10, 156 + py, 3.2); ctx.fill();
    });

    // arquibancadas azuis laterais
    for (var s2 = 0; s2 < 2; s2++) {
      for (var k = 0; k < 4; k++) {
        var yy = 176 + k * 18 + py;
        band(cam, .22 + k * .02, 26, function (x) {
          ctx.fillStyle = k % 2 ? '#1b4795' : '#23509f';
          S.roundRect(ctx, x, yy, 20, 12, 2); ctx.fill();
          ctx.fillStyle = '#2f6fd8';
          ctx.fillRect(x, yy, 20, 3);
        });
      }
      break;
    }

    // ciclo central: brasão, mesa, bandeiras, telas
    band(cam, .25, 660, function (x) {
      Gfx.brasao(ctx, x + 330, 196 + py, 12);

      Gfx.flagBR(ctx, x + 214, 250 + py, 104, t);
      Gfx.flagBR(ctx, x + 446, 250 + py, 104, t);

      // mesa diretora com pessoas
      ctx.fillStyle = '#123066';
      S.roundRect(ctx, x + 246, 224 + py, 168, 32, 3); ctx.fill();
      ctx.fillStyle = '#1e4694';
      S.roundRect(ctx, x + 246, 224 + py, 168, 7, 3); ctx.fill();
      Gfx.brasao(ctx, x + 330, 242 + py, 7);
      for (var p = 0; p < 6; p++) {
        var px2 = x + 258 + p * 28;
        ctx.fillStyle = ['#2a3150', '#3a4160', '#c8b06a', '#2a3150', '#3a4160', '#a83a4a'][p];
        S.roundRect(ctx, px2, 208 + py, 17, 18, 4); ctx.fill();
        ctx.fillStyle = '#e8b183';
        S.circle(ctx, px2 + 8.5, 204 + py, 5.4); ctx.fill();
        ctx.fillStyle = ['#2b2118', '#6b5a48', '#3a2a1a', '#1d1a16', '#7a6a58', '#2b2118'][p];
        ctx.beginPath();
        ctx.ellipse(px2 + 8.5, 202 + py, 5.6, 4.6, 0, Math.PI, 0);
        ctx.closePath(); ctx.fill();
      }

      // telas laterais
      screen(ctx, x + 30, 168 + py, 168, 74, t);
      screen(ctx, x + 462, 168 + py, 168, 74, t);
    });

    // bancada curva em primeiro plano
    ctx.fillStyle = '#0a1c44';
    ctx.fillRect(0, 258 + py, S.W, 48);
    for (var r2 = 0; r2 < 3; r2++) {
      var y2 = 262 + py + r2 * 18;
      band(cam, .34 + r2 * .06, 78, function (x) {
        ctx.fillStyle = '#8a5c2a';
        S.roundRect(ctx, x, y2, 70, 12, 2); ctx.fill();
        ctx.fillStyle = '#b4813f';
        ctx.fillRect(x, y2, 70, 3);
        ctx.fillStyle = '#1b3a78';
        S.roundRect(ctx, x + 10, y2 - 10, 20, 11, 3); ctx.fill();
        S.roundRect(ctx, x + 42, y2 - 10, 20, 11, 3); ctx.fill();
      });
    }
  };

  function screen(ctx, x, y, w, h, t) {
    ctx.fillStyle = '#0a1a46';
    S.roundRect(ctx, x, y, w, h, 3); ctx.fill();
    ctx.strokeStyle = '#3a63b8'; ctx.lineWidth = 2;
    S.roundRect(ctx, x, y, w, h, 3); ctx.stroke();
    // retrato
    ctx.fillStyle = '#123066';
    ctx.fillRect(x + 6, y + 8, 52, h - 16);
    ctx.fillStyle = '#e8b183';
    S.circle(ctx, x + 32, y + 26, 9); ctx.fill();
    ctx.fillStyle = '#6b6f80';
    ctx.beginPath(); ctx.ellipse(x + 32, y + 24, 9.4, 7, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2a3150';
    S.roundRect(ctx, x + 20, y + 34, 24, 20, 4); ctx.fill();
    ctx.fillStyle = '#dbe6ff';
    ctx.fillRect(x + 29, y + 34, 6, 20);
    // texto
    S.text(ctx, 'SESSAO', x + 66, y + 28, { size: 13, color: '#ffffff', shadow: false });
    S.text(ctx, 'DO SENADO FEDERAL', x + 66, y + 44, { size: 9, color: '#bcd0ff', shadow: false });
    ctx.fillStyle = '#4a7ad8';
    for (var i = 0; i < 5; i++) ctx.fillRect(x + 66 + i * 18, y + 54, 12, 4);
  }
})();

/* ---------- cenário: Supremo Tribunal Federal ao pôr do sol ---------- */
(function () {
  'use strict';
  var S = window.S, Gfx = S.Gfx;

  var CL = [
    [20, 40, 130, 9, '#ff7a4a'], [200, 26, 96, 8, '#e05f9e'],
    [330, 58, 150, 10, '#ff9a5c'], [500, 34, 110, 8, '#f2708c'],
    [90, 88, 170, 11, '#ff8f4d'], [390, 104, 140, 9, '#ffb56b'],
    [540, 78, 120, 9, '#ff7f5a'], [230, 120, 160, 10, '#ffc27a']
  ];

  function justica(ctx, x, y, sc) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(sc, sc);
    // pedestal
    ctx.fillStyle = '#b9bdcc';
    S.poly(ctx, [-34, 0, 34, 0, 28, -22, -28, -22]); ctx.fill();
    ctx.fillStyle = '#9ba0b2';
    ctx.fillRect(-28, -28, 56, 7);
    // corpo sentado
    ctx.fillStyle = '#d9dce8';
    S.poly(ctx, [-26, -28, 26, -28, 20, -76, -18, -76]); ctx.fill();
    ctx.fillStyle = '#c3c7d6';
    S.poly(ctx, [-26, -28, -4, -28, -6, -74, -18, -76]); ctx.fill();
    // braços e espada horizontal
    ctx.fillStyle = '#e4e7f2';
    S.roundRect(ctx, -22, -74, 44, 10, 5); ctx.fill();
    ctx.fillStyle = '#aeb3c4';
    ctx.fillRect(-40, -70, 80, 4);
    ctx.fillStyle = '#8f94a6';
    ctx.fillRect(38, -73, 5, 10);
    // cabeça e venda
    ctx.fillStyle = '#e4e7f2';
    S.ellipse(ctx, 0, -88, 12, 14, 0); ctx.fill();
    ctx.fillStyle = '#c3c7d6';
    S.roundRect(ctx, -12, -94, 24, 7, 2); ctx.fill();
    ctx.fillStyle = '#d9dce8';
    S.roundRect(ctx, -13, -103, 26, 8, 3); ctx.fill();
    ctx.restore();
  }
  Gfx.justica = justica;

  function pilar(ctx, x, base, h, w) {
    ctx.fillStyle = '#eef1fa';
    ctx.beginPath();
    ctx.moveTo(x - w, base);
    ctx.quadraticCurveTo(x - w * .1, base - h * .55, x - w * .62, base - h);
    ctx.lineTo(x + w * .62, base - h);
    ctx.quadraticCurveTo(x + w * .1, base - h * .55, x + w, base);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(160,168,196,.5)';
    ctx.beginPath();
    ctx.moveTo(x - w, base);
    ctx.quadraticCurveTo(x - w * .1, base - h * .55, x - w * .62, base - h);
    ctx.lineTo(x - w * .28, base - h);
    ctx.quadraticCurveTo(x + w * .2, base - h * .5, x - w * .55, base);
    ctx.closePath(); ctx.fill();
  }

  Gfx.bgSTF = function (ctx, th, cam, t) {
    var band = Gfx.bgBand;
    var px = -(cam.x * .09) % 640;
    var py = -cam.y * .05;
    var i;

    // sol
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var sunX = 88 - (cam.x * .04) % 900;
    if (sunX < -160) sunX += 900;
    var g = ctx.createRadialGradient(sunX, 86 + py, 6, sunX, 86 + py, 130);
    g.addColorStop(0, 'rgba(255,245,180,.95)');
    g.addColorStop(.35, 'rgba(255,165,70,.42)');
    g.addColorStop(1, 'rgba(255,110,40,0)');
    ctx.fillStyle = g; S.circle(ctx, sunX, 86 + py, 130); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#ffeaa0';
    S.circle(ctx, sunX, 86 + py, 25); ctx.fill();
    ctx.fillStyle = '#fff6cc';
    S.circle(ctx, sunX - 6, 80 + py, 9); ctx.fill();

    // nuvens
    ctx.save();
    for (i = 0; i < CL.length; i++) {
      var c = CL[i];
      var cx = ((c[0] + px * (1 + (i % 3) * .3) + t * .07 * (1 + i % 2)) % 820 + 820) % 820 - 90;
      ctx.globalAlpha = .8;
      ctx.fillStyle = c[4];
      S.roundRect(ctx, cx, c[1] + py, c[2], c[3], c[3] / 2); ctx.fill();
      S.roundRect(ctx, cx + c[2] * .3, c[1] + py - c[3] * .7, c[2] * .45, c[3], c[3] / 2); ctx.fill();
    }
    ctx.restore();

    // arvores no horizonte
    ctx.fillStyle = '#1d4a2e';
    band(cam, .3, 30, function (x) {
      ctx.beginPath();
      ctx.ellipse(x, 226 + py, 18, 11, 0, Math.PI, 0);
      ctx.closePath(); ctx.fill();
    });

    // edifício: laje superior contínua
    var base = 226 + py, roofY = 128 + py;
    ctx.fillStyle = '#e9ecf5';
    ctx.fillRect(0, roofY, S.W, 12);
    ctx.fillStyle = '#c3c9db';
    ctx.fillRect(0, roofY + 12, S.W, 5);

    // fachada envidraçada
    ctx.fillStyle = '#20263f';
    ctx.fillRect(0, roofY + 17, S.W, base - (roofY + 17));
    band(cam, .22, 34, function (x, i2) {
      for (var r = 0; r < 2; r++) {
        ctx.fillStyle = ((i2 + r) % 4 === 0) ? '#ffd88a' : '#ffb85c';
        ctx.fillRect(x + 3, roofY + 24 + r * 34, 26, 26);
        ctx.fillStyle = 'rgba(255,255,255,.18)';
        ctx.fillRect(x + 3, roofY + 24 + r * 34, 26, 5);
      }
      ctx.fillStyle = '#3a4160';
      ctx.fillRect(x, roofY + 17, 4, base - (roofY + 17));
    });

    // pilares curvos
    band(cam, .22, 128, function (x) { pilar(ctx, x + 64, base, 96, 17); });

    // piso e espelho d'água
    ctx.fillStyle = '#cfd4e2';
    ctx.fillRect(0, base, S.W, 26);
    ctx.fillStyle = '#b9bfd2';
    ctx.fillRect(0, base, S.W, 3);

    var poolY = base + 26;
    var pg = ctx.createLinearGradient(0, poolY, 0, S.H);
    pg.addColorStop(0, '#6a4f8e');
    pg.addColorStop(1, '#2a2350');
    ctx.fillStyle = pg;
    ctx.fillRect(0, poolY, S.W, S.H - poolY);

    // reflexo do sol e das luzes
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < 16; i++) {
      var ry = poolY + 3 + i * 5;
      var off = Math.sin(t * .045 + i) * 9;
      ctx.fillStyle = 'rgba(255,190,110,' + (0.2 - i * .009) + ')';
      ctx.fillRect(52 + off, ry, 78 - i * 2, 2.6);
    }
    ctx.restore();
    band(cam, .22, 34, function (x) {
      ctx.save();
      ctx.globalAlpha = .28;
      ctx.fillStyle = '#ffb85c';
      ctx.fillRect(x + 3, poolY + 4, 26, 26);
      ctx.restore();
    });
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    for (i = 0; i < 16; i++) ctx.fillRect((i * 97 + t * .45) % S.W, poolY + 4 + i * 5, 24, 1.3);

    // estátua e mastro a cada ciclo
    band(cam, .26, 560, function (x) {
      justica(ctx, x + 430, base + 22, .72);
      ctx.fillStyle = '#c3cbdb';
      ctx.fillRect(x + 150, roofY - 64, 3, 64);
      var w = Math.sin(t * .05) * 3;
      ctx.fillStyle = '#1aa053';
      S.poly(ctx, [x + 153, roofY - 64, x + 190, roofY - 60 + w, x + 190, roofY - 42 + w, x + 153, roofY - 46]); ctx.fill();
      ctx.fillStyle = '#ffd23c';
      S.poly(ctx, [x + 161, roofY - 55, x + 172, roofY - 51 + w * .6, x + 182, roofY - 55 + w, x + 172, roofY - 59 + w * .4]); ctx.fill();
      ctx.fillStyle = '#12308f';
      S.circle(ctx, x + 172, roofY - 55 + w * .4, 3.2); ctx.fill();
    });
  };
})();

/* ---------- cenário: sede do Banco Master ---------- */
(function () {
  'use strict';
  var S = window.S, Gfx = S.Gfx;

  function nuvem(ctx, x, y, s) {
    ctx.fillStyle = '#ffffff';
    S.roundRect(ctx, x, y, 54 * s, 12 * s, 6 * s); ctx.fill();
    S.roundRect(ctx, x + 12 * s, y - 9 * s, 34 * s, 14 * s, 7 * s); ctx.fill();
    ctx.fillStyle = '#d9e8f7';
    S.roundRect(ctx, x, y + 8 * s, 54 * s, 4 * s, 2 * s); ctx.fill();
  }

  function logoM(ctx, x, y, s, cor) {
    ctx.fillStyle = cor || '#ffffff';
    S.poly(ctx, [x - 9 * s, y + 8 * s, x - 6 * s, y - 8 * s, x, y + 1 * s,
                 x + 6 * s, y - 8 * s, x + 9 * s, y + 8 * s, x + 5 * s, y + 8 * s,
                 x + 3.5 * s, y - 1 * s, x, y + 6 * s, x - 3.5 * s, y - 1 * s,
                 x - 5 * s, y + 8 * s]);
    ctx.fill();
  }
  Gfx.logoM = logoM;

  Gfx.bgBanco = function (ctx, th, cam, t) {
    var band = Gfx.bgBand, py = -cam.y * .05, i;

    // nuvens
    for (i = 0; i < 7; i++) {
      var cx = ((i * 190 - cam.x * .07 - t * .09) % 900 + 900) % 900 - 120;
      nuvem(ctx, cx, 26 + (i % 3) * 30 + py, .8 + (i % 2) * .45);
    }

    // skyline ao fundo
    band(cam, .12, 96, function (x, i2) {
      var h = 110 + ((i2 * 53) % 90);
      ctx.fillStyle = '#7fa9d8';
      ctx.fillRect(x, 236 + py - h, 64, h);
      ctx.fillStyle = 'rgba(255,255,255,.22)';
      for (var w = 0; w < 6; w++) ctx.fillRect(x + 6 + (w % 3) * 20, 244 + py - h + Math.floor(w / 3) * 26, 12, 14);
    });

    // arvores
    band(cam, .2, 84, function (x) {
      ctx.fillStyle = '#2f7a3a';
      S.circle(ctx, x + 18, 214 + py, 20); ctx.fill();
      ctx.fillStyle = '#3f9a4a';
      S.circle(ctx, x + 12, 208 + py, 13); ctx.fill();
      ctx.fillStyle = '#5a3a20';
      ctx.fillRect(x + 15, 214 + py, 6, 24);
    });

    // sede envidracada
    var topo = 62 + py, base = 240 + py;
    band(cam, .3, 620, function (x) {
      // bloco lateral claro
      ctx.fillStyle = '#cfd6e4';
      ctx.fillRect(x + 470, topo + 26, 110, base - topo - 26);
      ctx.fillStyle = '#b6bfd2';
      ctx.fillRect(x + 470, topo + 26, 110, 6);

      // torre de vidro
      ctx.fillStyle = '#16305e';
      ctx.fillRect(x + 60, topo, 420, base - topo);
      for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 17; c++) {
          ctx.fillStyle = ((r + c) % 5 === 0) ? '#2f6fd8' : ((r + c) % 3 === 0 ? '#12274d' : '#1b3d78');
          ctx.fillRect(x + 66 + c * 24, topo + 8 + r * 19, 20, 15);
        }
      }

      // letreiro
      ctx.fillStyle = '#0f2450';
      S.roundRect(ctx, x + 150, topo + 22, 250, 58, 4); ctx.fill();
      ctx.fillStyle = '#2f6fd8';
      S.roundRect(ctx, x + 160, topo + 28, 46, 46, 5); ctx.fill();
      logoM(ctx, x + 183, topo + 50, 2.3, '#ffffff');
      S.text(ctx, 'BANCO', x + 220, topo + 48, { size: 17, color: '#e8eefc', shadow: false });
      S.text(ctx, 'MASTER', x + 220, topo + 71, { size: 23, weight: '900', color: '#ffffff', shadow: false });

      // marquise e entrada
      ctx.fillStyle = '#e4e9f5';
      ctx.fillRect(x + 176, base - 74, 230, 14);
      ctx.fillStyle = '#b6bfd2';
      ctx.fillRect(x + 176, base - 60, 230, 5);
      for (var L = 0; L < 5; L++) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(255,220,140,.30)';
        S.circle(ctx, x + 206 + L * 42, base - 56, 15); ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#ffd88a';
        S.circle(ctx, x + 206 + L * 42, base - 58, 4); ctx.fill();
      }
      ctx.fillStyle = '#f2c56b';
      ctx.fillRect(x + 196, base - 56, 190, 56);
      ctx.fillStyle = '#e0a94a';
      for (var d = 0; d < 6; d++) ctx.fillRect(x + 200 + d * 32, base - 52, 26, 48);
      ctx.fillStyle = '#16305e';
      ctx.fillRect(x + 268, base - 50, 46, 50);
      ctx.fillStyle = '#7fb0e8';
      ctx.fillRect(x + 272, base - 46, 18, 42);
      ctx.fillRect(x + 292, base - 46, 18, 42);

      // mastro com bandeira
      ctx.fillStyle = '#c3cbdb';
      ctx.fillRect(x + 36, topo + 4, 4, base - topo - 4);
      var w2 = Math.sin(t * .05) * 3;
      ctx.fillStyle = '#1aa053';
      S.poly(ctx, [x + 40, topo + 10, x + 88, topo + 6 + w2, x + 88, topo + 38 + w2, x + 40, topo + 42]); ctx.fill();
      ctx.fillStyle = '#ffd23c';
      S.poly(ctx, [x + 50, topo + 26, x + 64, topo + 14 + w2 * .6, x + 78, topo + 26 + w2, x + 64, topo + 38 + w2 * .4]); ctx.fill();
      ctx.fillStyle = '#12308f';
      S.circle(ctx, x + 64, topo + 26 + w2 * .5, 5); ctx.fill();

      // totem
      ctx.fillStyle = '#0f2450';
      S.roundRect(ctx, x - 24, base - 124, 74, 124, 4); ctx.fill();
      ctx.fillStyle = '#2f6fd8';
      S.roundRect(ctx, x - 12, base - 112, 50, 44, 4); ctx.fill();
      logoM(ctx, x + 13, base - 90, 2.2, '#ffffff');
      S.text(ctx, 'BANCO', x + 13, base - 52, { size: 11, align: 'center', color: '#e8eefc', shadow: false });
      S.text(ctx, 'MASTER', x + 13, base - 36, { size: 14, align: 'center', weight: '900', color: '#ffffff', shadow: false });

      // placa de valores
      ctx.fillStyle = '#131a2c';
      S.roundRect(ctx, x + 496, base - 74, 128, 74, 3); ctx.fill();
      ctx.fillStyle = '#2f6fd8';
      ctx.fillRect(x + 504, base - 66, 4, 56);
      S.text(ctx, 'SOLIDEZ', x + 516, base - 52, { size: 11, color: '#ffffff', shadow: false });
      S.text(ctx, 'CONFIANCA', x + 516, base - 34, { size: 11, color: '#ffffff', shadow: false });
      S.text(ctx, 'RESULTADOS', x + 516, base - 16, { size: 11, color: '#ffffff', shadow: false });
    });

    // arbustos
    band(cam, .34, 46, function (x) {
      ctx.fillStyle = '#2f7a3a';
      S.roundRect(ctx, x, base - 22, 40, 22, 9); ctx.fill();
      ctx.fillStyle = '#4aa356';
      S.roundRect(ctx, x + 3, base - 22, 34, 9, 5); ctx.fill();
    });

    // calcada e rua
    ctx.fillStyle = '#c3c9d6';
    ctx.fillRect(0, base, S.W, 30);
    ctx.fillStyle = '#aeb5c4';
    for (i = 0; i < 22; i++) ctx.fillRect((i * 40 - cam.x * .4) % (S.W + 40), base, 2, 30);
    ctx.fillStyle = '#5b6070';
    ctx.fillRect(0, base + 30, S.W, S.H);
    ctx.fillStyle = '#7d8394';
    ctx.fillRect(0, base + 30, S.W, 3);
  };
})();

/* ---------- coletáveis por personagem ---------- */
(function () {
  'use strict';
  var S = window.S, Gfx = S.Gfx;

  /* picanha: peça de carne com capa de gordura */
  Gfx.picanha = function (ctx, x, y, t, scale) {
    scale = scale || 1;
    var w = .45 + .55 * Math.abs(Math.cos(t * .11));
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * w, scale);
    ctx.rotate(Math.sin(t * .05) * .1);

    // contorno
    ctx.fillStyle = '#4a150c';
    S.roundRect(ctx, -10, -8, 20, 16, 7); ctx.fill();
    // carne
    ctx.fillStyle = '#a32a22';
    S.roundRect(ctx, -9, -7, 18, 14, 6); ctx.fill();
    ctx.fillStyle = '#c94034';
    S.roundRect(ctx, -7.5, -5.5, 15, 11, 5); ctx.fill();
    // marmoreio
    ctx.fillStyle = 'rgba(255,190,175,.55)';
    S.ellipse(ctx, -2.5, -1, 3.2, 1.1, -.5); ctx.fill();
    S.ellipse(ctx, 2.5, 2, 2.6, .9, .4); ctx.fill();
    // capa de gordura
    ctx.fillStyle = '#f2e3b8';
    ctx.beginPath();
    ctx.ellipse(0, -5.4, 9, 5.2, 0, Math.PI, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff6da';
    ctx.beginPath();
    ctx.ellipse(-1, -6.2, 6.4, 3, 0, Math.PI, 0);
    ctx.closePath(); ctx.fill();
    // crosta dourada
    ctx.fillStyle = '#c98a3c';
    S.roundRect(ctx, -9, -8.4, 18, 2.6, 1.3); ctx.fill();
    // sal
    ctx.fillStyle = '#ffffff';
    S.circle(ctx, -4, -7.4, .8); ctx.fill();
    S.circle(ctx, 1.6, -8, .7); ctx.fill();
    S.circle(ctx, 5.4, -7, .6); ctx.fill();
    ctx.restore();
  };

  /* maço de notas de 100 reais */
  Gfx.dinheiro = function (ctx, x, y, t, scale) {
    scale = scale || 1;
    var w = .45 + .55 * Math.abs(Math.cos(t * .11));
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * w, scale);
    ctx.rotate(-.12 + Math.sin(t * .05) * .08);

    // notas de tras
    ctx.fillStyle = '#1f7e74';
    S.roundRect(ctx, -9.5, -4.5, 19, 10, 1.6); ctx.fill();
    ctx.fillStyle = '#2b9f92';
    S.roundRect(ctx, -9, -5.6, 18.5, 10, 1.6); ctx.fill();
    // nota da frente
    ctx.fillStyle = '#137a6e';
    S.roundRect(ctx, -9.5, -7, 19, 10.5, 1.8); ctx.fill();
    ctx.fillStyle = '#3fc0ad';
    S.roundRect(ctx, -8.8, -6.4, 17.6, 9.3, 1.5); ctx.fill();
    ctx.fillStyle = '#9fe6d8';
    S.roundRect(ctx, -8, -5.7, 16, 7.9, 1.2); ctx.fill();
    // efigie
    ctx.fillStyle = '#4fb8a6';
    S.ellipse(ctx, -4.2, -1.7, 2.6, 3.4, 0); ctx.fill();
    // valor
    ctx.fillStyle = '#0d5a52';
    S.roundRect(ctx, 1.6, -4.6, 5.6, 2.2, .8); ctx.fill();
    ctx.fillStyle = 'rgba(13,90,82,.55)';
    ctx.fillRect(1.6, -.6, 5.6, .9);
    ctx.fillRect(1.6, 1, 4.2, .9);
    // cinta
    ctx.fillStyle = '#e8c34a';
    S.roundRect(ctx, -2.4, -7.4, 4.6, 11.4, .8); ctx.fill();
    ctx.fillStyle = '#fbe490';
    ctx.fillRect(-2.4, -7.4, 1.6, 11.4);
    ctx.restore();
  };

  Gfx.pickupColor = function (charId) {
    var k = Gfx.pickupKind(charId);
    return k === 'picanha' ? '#e8776a' :
           (k === 'dinheiro' ? '#7fe0cf' :
           (k === 'comprimido' ? '#8fc4ff' : '#ffe98a'));
  };

  Gfx.pickupKind = function (charId) {
    var id = charId || (S.Game && S.Game.session && S.Game.session.charId) ||
             (S.Save && S.Save.data && S.Save.data.favChar);
    var c = Gfx.CHARS[id];
    return (c && c.pickup) || 'ring';
  };

  Gfx.pickup = function (ctx, x, y, t, scale, charId) {
    var k = Gfx.pickupKind(charId);
    if (k === 'picanha') Gfx.picanha(ctx, x, y, t, scale);
    else if (k === 'dinheiro') Gfx.dinheiro(ctx, x, y, t, scale);
    else if (k === 'comprimido') Gfx.comprimido(ctx, x, y, t, scale);
    else Gfx.ring(ctx, x, y, t, scale);
  };

  /* nome usado no HUD e nos textos */
  S.pickupLabel = function (charId) {
    var k = Gfx.pickupKind(charId);
    return k === 'picanha' ? 'PICANHAS' :
           (k === 'dinheiro' ? 'DINHEIRO' :
           (k === 'comprimido' ? 'PILULAS' : 'ANEIS'));
  };
})();

/* ---------- coletável do Bolsonaro: comprimido azul ---------- */
(function () {
  'use strict';
  var S = window.S, Gfx = S.Gfx;

  function losango(ctx, w, h) {
    ctx.beginPath();
    ctx.moveTo(-w, 0);
    ctx.quadraticCurveTo(-w * .7, -h * .72, 0, -h);
    ctx.quadraticCurveTo(w * .7, -h * .72, w, 0);
    ctx.quadraticCurveTo(w * .7, h * .72, 0, h);
    ctx.quadraticCurveTo(-w * .7, h * .72, -w, 0);
    ctx.closePath();
  }

  Gfx.comprimido = function (ctx, x, y, t, scale) {
    scale = scale || 1;
    var w = .45 + .55 * Math.abs(Math.cos(t * .11));
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * w, scale);
    ctx.rotate(Math.sin(t * .05) * .08);

    // espessura
    ctx.fillStyle = '#0d3f86';
    losango(ctx, 10, 7); ctx.fill();
    ctx.save(); ctx.translate(0, 2.2);
    ctx.fillStyle = '#1257ad';
    losango(ctx, 9.6, 6.6); ctx.fill();
    ctx.restore();

    // face de cima
    ctx.fillStyle = '#1e6fd0';
    losango(ctx, 9.6, 6.6); ctx.fill();
    ctx.save();
    ctx.translate(0, -.6);
    ctx.fillStyle = '#3f97ea';
    losango(ctx, 8.4, 5.6); ctx.fill();
    ctx.restore();

    // sulco central
    ctx.fillStyle = 'rgba(12,60,120,.35)';
    ctx.fillRect(-6.4, -.7, 12.8, 1.4);

    // brilho
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    S.ellipse(ctx, -3.4, -3.2, 3.4, 1.3, -.42); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    S.ellipse(ctx, 3.6, -2.4, 1.7, .8, .3); ctx.fill();
    ctx.restore();
  };
})();
