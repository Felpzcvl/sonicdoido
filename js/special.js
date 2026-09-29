/* ============================================================
   special.js — fase especial (túnel) para pegar as Esmeraldas
   ============================================================ */
(function () {
  'use strict';
  var S = window.S;
  var SP = S.Special = {};

  SP.HORIZON = 118;
  SP.TUBE_R = 150;

  SP.start = function (emeraldIndex, charId, onDone) {
    var rng = S.mulberry32(1337 + emeraldIndex * 977);
    var st = SP.state = {
      idx: emeraldIndex, charId: charId, onDone: onDone,
      phi: 0, vphi: 0, t: 0, z: 0, speed: 7,
      rings: 0, target: 40 + emeraldIndex * 8,
      objs: [], phase: 'intro', phaseT: 0,
      rng: rng, hop: 0, flash: 0
    };
    for (var i = 0; i < 120; i++) SP.addRow(st, 300 + i * 150);
    S.Audio.playMusic('special');
    return st;
  };

  SP.addRow = function (st, z) {
    var r = st.rng();
    var base = st.rng() * Math.PI * 2;
    var kind, n, spread;
    if (r < .52) { kind = 'ring'; n = 3 + Math.floor(st.rng() * 4); spread = .34; }
    else if (r < .74) { kind = 'ring'; n = 6; spread = .5; }
    else if (r < .9) { kind = 'bomb'; n = 1 + Math.floor(st.rng() * 3); spread = .6; }
    else { kind = 'boost'; n = 1; spread = 0; }
    for (var i = 0; i < n; i++) {
      st.objs.push({
        kind: kind,
        z: z + i * (kind === 'ring' ? 46 : 0),
        a: base + (kind === 'ring' ? 0 : i * spread),
        dead: false
      });
    }
  };

  SP.norm = function (a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  };

  SP.proj = function (a, dz) {
    var s = 300 / Math.max(26, dz + 70);
    return {
      s: s,
      x: S.W / 2 + Math.sin(a) * SP.TUBE_R * s * 1.05,
      y: SP.HORIZON + Math.cos(a) * SP.TUBE_R * s * .78
    };
  };

  SP.update = function (st) {
    var In = S.Input;
    st.t++;

    if (st.phase === 'intro') {
      st.phaseT++;
      if (st.phaseT > 150) { st.phase = 'run'; st.phaseT = 0; }
      return;
    }
    if (st.phase === 'win' || st.phase === 'lose') {
      st.phaseT++;
      if (st.phaseT > 170 || (st.phaseT > 40 && In.pressed('confirm'))) {
        S.Audio.stopMusic();
        var win = st.phase === 'win';
        SP.state = null;
        st.onDone(win);
      }
      return;
    }

    var ax = In.axisX();
    st.vphi = S.approach(st.vphi, ax * .062, .009);
    st.phi += st.vphi;
    if (In.pressed('jump') && st.hop <= 0) { st.hop = 26; S.Audio.sfx('jump'); }
    if (st.hop > 0) st.hop--;
    if (st.flash > 0) st.flash--;

    st.speed = Math.min(13, st.speed + .0022);
    st.z += st.speed;

    var alive = 0;
    for (var i = 0; i < st.objs.length; i++) {
      var o = st.objs[i];
      if (o.dead) continue;
      alive++;
      var dz = o.z - st.z;
      if (dz < -60) { o.dead = true; continue; }
      if (dz < 26 && dz > -26) {
        var da = Math.abs(SP.norm(o.a - st.phi));
        if (da < .42 && st.hop <= 0) {
          o.dead = true;
          if (o.kind === 'ring') {
            st.rings++; S.Audio.sfx('ring');
            S.Particles.burst(S.W / 2, S.H - 96, 5, { color: '#ffd23c', maxSpeed: 3, life: 16, size: 3 });
          } else if (o.kind === 'bomb') {
            st.rings = Math.max(0, st.rings - 8);
            st.flash = 22; st.speed = Math.max(5, st.speed - 2.2);
            S.Audio.sfx('pop'); S.Game.shake(10);
          } else {
            st.speed = Math.min(15, st.speed + 2.4);
            S.Audio.sfx('shoes');
          }
        }
      }
    }
    if (alive < 90) SP.addRow(st, st.z + 1800 + st.rng() * 400);

    if (st.rings >= st.target) {
      st.phase = 'win'; st.phaseT = 0;
      S.Audio.stopMusic(); S.Audio.sfx('emerald');
    } else if (st.t > 60 * 62) {
      st.phase = 'lose'; st.phaseT = 0;
      S.Audio.stopMusic(); S.Audio.sfx('cancel');
    }
  };
})();

/* ---------------- desenho da fase especial ---------------- */
(function () {
  'use strict';
  var S = window.S, SP = S.Special;

  SP.draw = function (ctx, st) {
    var g = ctx.createLinearGradient(0, 0, 0, S.H);
    g.addColorStop(0, '#120a35');
    g.addColorStop(.5, '#2a1470');
    g.addColorStop(1, '#0a0620');
    ctx.fillStyle = g; ctx.fillRect(0, 0, S.W, S.H);

    var i;
    for (i = 0; i < 50; i++) {
      ctx.globalAlpha = .2 + (i % 5) * .1;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((i * 137 + st.t * .4) % S.W, (i * 53) % SP.HORIZON, 2, 2);
    }
    ctx.globalAlpha = 1;

    for (var k = 26; k >= 0; k--) {
      var dz = k * 90 + 40 - (st.z % 90);
      var col = ((Math.floor((st.z + k * 90) / 90) + k) % 2 === 0);
      ctx.save();
      ctx.globalAlpha = Math.max(.06, .5 - k * .016);
      ctx.strokeStyle = col ? '#7b5cff' : '#2fd9c8';
      ctx.lineWidth = Math.max(1, 26 / (k + 1));
      ctx.beginPath();
      for (var a = 0; a <= 24; a++) {
        var p = SP.proj(a / 24 * Math.PI * 2 - st.phi, dz);
        if (a === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.restore();
    }

    var list = [];
    for (i = 0; i < st.objs.length; i++) {
      var o = st.objs[i];
      if (!o.dead && o.z - st.z > -30 && o.z - st.z < 2200) list.push(o);
    }
    list.sort(function (a, b) { return b.z - a.z; });
    for (var j = 0; j < list.length; j++) {
      var ob = list[j];
      var pp = SP.proj(ob.a - st.phi, ob.z - st.z);
      if (pp.s < .06) continue;
      ctx.save();
      ctx.globalAlpha = Math.min(1, pp.s * 3.2);
      if (ob.kind === 'ring') {
        S.Gfx.ring(ctx, pp.x, pp.y, st.t * 2 + ob.z, pp.s * 1.5);
      } else if (ob.kind === 'bomb') {
        ctx.translate(pp.x, pp.y); ctx.scale(pp.s * 1.6, pp.s * 1.6);
        ctx.fillStyle = '#24262e'; S.circle(ctx, 0, 0, 9); ctx.fill();
        ctx.fillStyle = '#ff4d4d'; S.circle(ctx, -3, -3, 3); ctx.fill();
        ctx.strokeStyle = '#ffb02e'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(4, -7); ctx.quadraticCurveTo(10, -13, 5, -16); ctx.stroke();
      } else {
        ctx.translate(pp.x, pp.y); ctx.scale(pp.s * 1.6, pp.s * 1.6);
        ctx.fillStyle = '#42f2c8';
        S.poly(ctx, [-2, -10, 5, -2, 0, -1, 4, 10, -5, 1, 0, 0]); ctx.fill();
      }
      ctx.restore();
    }

    var hopY = st.hop > 0 ? -Math.sin((26 - st.hop) / 26 * Math.PI) * 34 : 0;
    ctx.save();
    ctx.globalAlpha = .3; ctx.fillStyle = '#000';
    S.ellipse(ctx, S.W / 2, S.H - 70, 22 + hopY * .14, 6, 0); ctx.fill();
    ctx.restore();
    S.Gfx.drawChar(ctx, st.charId, {
      x: S.W / 2, y: S.H - 74 + hopY,
      state: st.hop > 0 ? 'roll' : 'run',
      t: st.t * 1.4, spin: st.t * .4, facing: 1, scale: 1.2
    });

    SP.drawHud(ctx, st);
    S.Particles.draw(ctx, { x: 0, y: 0 });

    if (st.flash > 0) {
      ctx.save();
      ctx.globalAlpha = st.flash / 22 * .55;
      ctx.fillStyle = '#ff2b2b'; ctx.fillRect(0, 0, S.W, S.H);
      ctx.restore();
    }

    if (st.phase === 'intro') {
      var n = 3 - Math.floor(st.phaseT / 40);
      S.UI.panel(ctx, S.W / 2 - 200, 100, 400, 140);
      S.text(ctx, 'FASE ESPECIAL', S.W / 2, 142, { size: 26, align: 'center', color: '#ffd23c', outline: '#3a1d00', outlineW: 5, shadow: false });
      S.text(ctx, 'PEGUE ' + st.target + ' ANEIS EM 60s', S.W / 2, 174, { size: 16, align: 'center', color: '#ffffff', shadow: false });
      S.text(ctx, n > 0 ? String(n) : 'JA!', S.W / 2, 218, { size: 30, align: 'center', color: '#9fe2ff', outline: '#0a1b3a', outlineW: 5, shadow: false });
    } else if (st.phase === 'win') {
      S.UI.panel(ctx, S.W / 2 - 200, 84, 400, 176);
      S.Gfx.emerald(ctx, S.W / 2, 146, S.HUD.EMCOL[st.idx], st.t, 2.6);
      S.text(ctx, 'ESMERALDA DO CAOS!', S.W / 2, 212, { size: 22, align: 'center', color: '#ffd23c', outline: '#3a1d00', outlineW: 5, shadow: false });
      S.text(ctx, 'Pressione para continuar', S.W / 2, 242, { size: 12, align: 'center', color: '#cfd8ff', shadow: false });
    } else if (st.phase === 'lose') {
      S.UI.panel(ctx, S.W / 2 - 200, 110, 400, 130);
      S.text(ctx, 'NAO DEU DESSA VEZ', S.W / 2, 158, { size: 22, align: 'center', color: '#ff8a8a', outline: '#3a0000', outlineW: 5, shadow: false });
      S.text(ctx, 'Voce pegou ' + st.rings + ' de ' + st.target + ' aneis', S.W / 2, 190, { size: 14, align: 'center', color: '#ffffff', shadow: false });
      S.text(ctx, 'Pressione para continuar', S.W / 2, 222, { size: 12, align: 'center', color: '#cfd8ff', shadow: false });
    }
  };

  SP.drawHud = function (ctx, st) {
    ctx.save();
    ctx.globalAlpha = .32; ctx.fillStyle = '#060a18';
    S.roundRect(ctx, S.W / 2 - 130, 8, 260, 36, 8); ctx.fill();
    ctx.restore();
    S.text(ctx, 'ANEIS ' + st.rings + ' / ' + st.target, S.W / 2, 25, {
      size: 15, align: 'center', color: '#ffd23c', outline: 'rgba(0,0,0,.8)', outlineW: 4, shadow: false });
    S.UI.bar(ctx, S.W / 2 - 112, 32, 224, st.rings / st.target, '#42f2c8');
    var left = Math.max(0, 62 - Math.floor(st.t / 60));
    S.text(ctx, left + 's', S.W - 24, 26, {
      size: 15, align: 'right', color: left < 11 ? '#ff5c5c' : '#ffffff',
      outline: 'rgba(0,0,0,.8)', outlineW: 4, shadow: false });
    S.Input.drawTouch(ctx);
  };
})();
