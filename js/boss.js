/* ============================================================
   boss.js — Daniel Vocaro e suas máquinas
   ============================================================ */
(function () {
  'use strict';
  var S = window.S;
  var Gfx = S.Gfx;

  /* Daniel Vocaro pilotando a nave do Banco Master */
  Gfx.bossPod = function (ctx, x, y, t, hurt, face) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(face < 0 ? -1 : 1, 1);
    if (hurt) ctx.globalAlpha = (Math.floor(t / 2) % 2) ? .35 : 1;

    // propulsor
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var fl = 8 + Math.sin(t * .6) * 4;
    var g1 = ctx.createRadialGradient(0, 22, 2, 0, 22, fl + 8);
    g1.addColorStop(0, 'rgba(160,215,255,.95)');
    g1.addColorStop(1, 'rgba(40,120,255,0)');
    ctx.fillStyle = g1; S.circle(ctx, 0, 22, fl + 8); ctx.fill();
    ctx.restore();

    // casco
    ctx.fillStyle = '#c9ccd8';
    S.ellipse(ctx, 0, 4, 40, 22, 0); ctx.fill();
    ctx.fillStyle = '#7f879c';
    S.ellipse(ctx, 0, 12, 40, 12, 0); ctx.fill();
    ctx.fillStyle = '#13306e';
    S.roundRect(ctx, -42, -2, 84, 9, 4); ctx.fill();
    ctx.fillStyle = '#2f6fd8';
    S.roundRect(ctx, -42, -2, 84, 4, 2); ctx.fill();

    // logo do banco no casco (nao espelha junto com a nave)
    ctx.save();
    if (face < 0) ctx.scale(-1, 1);
    ctx.fillStyle = '#ffffff';
    S.poly(ctx, [-35, 5, -31, -1, -27, 3, -23, -1, -19, 5, -21, 5, -23, 2, -27, 5, -31, 2, -33, 5]);
    ctx.fill();
    S.text(ctx, 'MASTER', 27, 5.4, { size: 6.5, align: 'center', color: '#ffffff', shadow: false });
    ctx.restore();

    // cupula
    ctx.fillStyle = 'rgba(190,230,255,.4)';
    ctx.beginPath(); ctx.arc(0, -2, 27, Math.PI, 0); ctx.closePath(); ctx.fill();

    // ---- Daniel Vocaro ----
    ctx.save();
    ctx.translate(1, -3);
    // terno
    ctx.fillStyle = '#1e2740';
    S.roundRect(ctx, -16, -8, 32, 16, 6); ctx.fill();
    ctx.fillStyle = '#2b3856';
    S.roundRect(ctx, -16, -8, 32, 6, 4); ctx.fill();
    ctx.fillStyle = '#ffffff';
    S.poly(ctx, [-5, -9, 5, -9, 3, -1, 0, 2, -3, -1]); ctx.fill();
    ctx.fillStyle = '#4f7fc4';
    S.poly(ctx, [-2.4, -8, 2.4, -8, 3, -5, 0, 5, -3, -5]); ctx.fill();
    ctx.fillStyle = '#8fb4e6';
    for (var k = 0; k < 3; k++) {
      S.poly(ctx, [-2.6, -6 + k * 3.2, 2.6, -6.9 + k * 3.2, 2.6, -5.9 + k * 3.2, -2.6, -5 + k * 3.2]);
      ctx.fill();
    }
    ctx.fillStyle = '#2b3856';
    S.poly(ctx, [-5, -9, -12, -6, -7, 2]); ctx.fill();
    S.poly(ctx, [5, -9, 12, -6, 7, 2]); ctx.fill();
    // rosto
    ctx.fillStyle = '#f0b98e';
    S.ellipse(ctx, 0, -20, 12.5, 13.5, 0); ctx.fill();
    ctx.fillStyle = '#d99a6c';
    S.ellipse(ctx, -12, -19, 2.4, 3.6, 0); ctx.fill();
    S.ellipse(ctx, 12, -19, 2.4, 3.6, 0); ctx.fill();
    // barba curta
    ctx.save();
    ctx.globalAlpha = .7; ctx.fillStyle = '#4a2f18';
    ctx.beginPath(); ctx.ellipse(0, -21, 10.5, 9.5, 0, 0, Math.PI); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#5a3a20';
    S.ellipse(ctx, 0, -18.4, 4.8, 1.5, 0); ctx.fill();
    // cabelo ondulado castanho
    ctx.fillStyle = '#6b4526';
    ctx.beginPath(); ctx.ellipse(0, -25, 13, 11, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
    S.ellipse(ctx, -11.5, -24, 3.4, 6, .25); ctx.fill();
    S.ellipse(ctx, 11.5, -24, 3.4, 6, -.25); ctx.fill();
    ctx.fillStyle = '#8a5c33';
    S.ellipse(ctx, -4.5, -32, 6.4, 3.2, -.3); ctx.fill();
    S.ellipse(ctx, 6, -31.5, 5, 2.6, .25); ctx.fill();
    // sobrancelhas, olhos e sorriso
    ctx.fillStyle = '#4a3018';
    S.ellipse(ctx, -5, -24.5, 3.6, 1.2, -.14); ctx.fill();
    S.ellipse(ctx, 5, -24.5, 3.6, 1.2, .14); ctx.fill();
    ctx.fillStyle = '#ffffff';
    S.ellipse(ctx, -4.6, -21, 3.2, 3, 0); ctx.fill();
    S.ellipse(ctx, 4.6, -21, 3.2, 3, 0); ctx.fill();
    ctx.fillStyle = '#3f5a3a';
    S.circle(ctx, -4.4, -20.8, 1.5); ctx.fill();
    S.circle(ctx, 4.8, -20.8, 1.5); ctx.fill();
    ctx.fillStyle = '#16181f';
    S.circle(ctx, -4.4, -20.8, .7); ctx.fill();
    S.circle(ctx, 4.8, -20.8, .7); ctx.fill();
    ctx.fillStyle = '#d99a6c';
    S.ellipse(ctx, 0.4, -16.6, 2.4, 2, 0); ctx.fill();
    ctx.fillStyle = '#7a3b3b';
    S.ellipse(ctx, 0.4, -12.6, 5, 2.6, 0); ctx.fill();
    ctx.fillStyle = '#ffffff';
    S.ellipse(ctx, 0.4, -13.4, 4.6, 1.5, 0); ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(210,240,255,.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -2, 27, Math.PI, 0); ctx.stroke();
    ctx.restore();
  };

  Gfx.wreckingBall = function (ctx, x, y, t) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#3a3f55'; S.circle(ctx, 0, 0, 17); ctx.fill();
    ctx.fillStyle = '#5b6379'; S.circle(ctx, -5, -5, 7); ctx.fill();
    ctx.fillStyle = '#20232d';
    for (var i = 0; i < 6; i++) {
      var a = i * Math.PI / 3 + t * .02;
      S.circle(ctx, Math.cos(a) * 10, Math.sin(a) * 10, 2.6); ctx.fill();
    }
    ctx.restore();
  };

  Gfx.chain = function (ctx, x1, y1, x2, y2) {
    var n = 8;
    ctx.save();
    for (var i = 1; i <= n; i++) {
      var p = i / (n + 1);
      ctx.fillStyle = i % 2 ? '#b9bfd0' : '#7d8598';
      S.circle(ctx, x1 + (x2 - x1) * p, y1 + (y2 - y1) * p, 4); ctx.fill();
    }
    ctx.restore();
  };

  Gfx.drill = function (ctx, x, y, t) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#9aa4b8';
    S.poly(ctx, [-16, 0, 16, 0, 0, 40]); ctx.fill();
    ctx.fillStyle = '#e4e9f5';
    for (var i = 0; i < 4; i++) {
      var o = ((t * 3 + i * 10) % 40);
      ctx.globalAlpha = .8 - i * .12;
      S.poly(ctx, [-14 + o * .35, o, 14 - o * .35, o, 12 - o * .35, o + 4, -12 + o * .35, o + 4]);
      ctx.fill();
    }
    ctx.restore();
  };

  Gfx.laserArm = function (ctx, x, y, t, charging) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#5b6379';
    S.roundRect(ctx, -12, 0, 24, 26, 4); ctx.fill();
    ctx.fillStyle = charging ? '#ff4d4d' : '#3a3f55';
    S.circle(ctx, 0, 28, 8); ctx.fill();
    if (charging) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = .5 + Math.sin(t * .6) * .3;
      ctx.fillStyle = '#ff8080';
      S.circle(ctx, 0, 28, 14); ctx.fill();
    }
    ctx.restore();
  };
})();

/* ---------------- lógica do chefe ---------------- */
(function () {
  'use strict';
  var S = window.S, E = S.Entities;

  E.make.boss = function (spec, cfg) {
    var e = E.base(spec);
    cfg = cfg || { type: 'wrecker', hits: 8 };
    e.type = cfg.type;
    e.hp = cfg.hits;
    e.maxHp = cfg.hits;
    e.w = 84; e.h = 46; e.ox = -42; e.oy = -26;
    e.face = -1;
    e.phase = 'intro';
    e.timer = 0;
    e.invuln = 0;
    e.baseY = spec.y;
    e.homeX = spec.x;
    e.ballA = 0; e.ballLen = 76;
    e.dead = false;
    e.deadTimer = 0;

    e.hitbox = function () { return { x: this.x - 42, y: this.y - 26, w: 84, h: 46 }; };

    e.damage = function (g, p) {
      if (this.invuln > 0 || this.dead) return;
      this.hp--;
      this.invuln = 60;
      S.Audio.sfx('bosshit');
      g.shake(10);
      S.Particles.burst(this.x, this.y, 10, { color: '#ff9c3c', maxSpeed: 4, life: 24, size: 4 });
      if (p && !p.grounded) p.vy = -Math.min(7, Math.abs(p.vy) + 2);
      if (this.hp <= 0) {
        this.dead = true; this.deadTimer = 150; this.phase = 'dying';
        S.Audio.stopMusic();
        g.onBossDying();
      }
    };

    e.touchPlayer = function (g) {
      var p = g.player;
      if (p.dead || this.dead) return;
      if (!S.aabb(this.hitbox(), p.hitbox())) return;
      if (p.isAttacking()) this.damage(g, p);
      else p.hurt(this.x);
    };

    e.hazard = function (g, x, y, r) {
      var p = g.player;
      if (p.dead || this.dead) return;
      if (S.aabb({ x: x - r, y: y - r, w: r * 2, h: r * 2 }, p.hitbox())) p.hurt(x);
    };

    e.update = function (g) {
      this.t++;
      if (this.invuln > 0) this.invuln--;

      if (this.dead) {
        this.deadTimer--;
        this.y += .35;
        this.x += this.face * .3;
        if (this.deadTimer % 9 === 0) {
          S.Audio.sfx('explode');
          S.Particles.burst(this.x + S.rand(-34, 34), this.y + S.rand(-18, 18), 12,
            { color: S.choice(['#ffd23c', '#ff7b2e', '#ffffff']), maxSpeed: 5, life: 30, size: 5 });
          g.shake(6);
        }
        if (this.deadTimer <= 0) { this.alive = false; g.onBossDefeated(); }
        return;
      }

      if (this.phase === 'intro') {
        this.timer++;
        this.y = this.baseY - 150 + Math.min(150, this.timer * 2.4);
        if (this.timer > 70) { this.phase = 'fight'; this.timer = 0; }
        return;
      }

      this.timer++;
      if (this.type === 'wrecker') this.updWrecker(g);
      else if (this.type === 'driller') this.updDriller(g);
      else this.updLaser(g);

      this.touchPlayer(g);
    };

    /* --- chefe 1: bola de demolição --- */
    e.updWrecker = function (g) {
      var left = g.level.bossGateX + 70, right = g.level.bossEndX - 70;
      this.x += this.face * 1.5;
      if (this.x < left) { this.x = left; this.face = 1; }
      if (this.x > right) { this.x = right; this.face = -1; }
      this.y = this.baseY + Math.sin(this.t * .04) * 8;
      this.ballA = Math.sin(this.t * .045) * 1.15;
      var bx = this.x + Math.sin(this.ballA) * this.ballLen;
      var by = this.y + 18 + Math.cos(this.ballA) * this.ballLen;
      this.bx = bx; this.by = by;
      this.hazard(g, bx, by, 17);
    };

    /* --- chefe 2: broca mergulhadora --- */
    e.updDriller = function (g) {
      var p = g.player;
      if (this.sub === undefined) { this.sub = 'track'; this.subT = 0; }
      this.subT++;
      if (this.sub === 'track') {
        this.x = S.approach(this.x, p.x, 2.2);
        this.y = S.approach(this.y, this.baseY, 1.6);
        this.face = p.x < this.x ? -1 : 1;
        if (this.subT > 90) { this.sub = 'dive'; this.subT = 0; S.Audio.sfx('warn'); }
      } else if (this.sub === 'dive') {
        this.y += 5.5;
        var gr = S.Level.groundSense(g.level, this.x, this.y + 60, 30, { fromAbove: true });
        if (gr) {
          this.y = gr.y - 60; this.sub = 'stuck'; this.subT = 0;
          g.shake(14); S.Audio.sfx('explode');
          S.Particles.burst(this.x, this.y + 60, 16, { color: '#c98a3c', maxSpeed: 5, life: 26, size: 5, angle: -Math.PI / 2 });
        }
      } else {
        if (this.subT > 80) { this.sub = 'rise'; this.subT = 0; }
      }
      if (this.sub === 'rise') {
        this.y -= 3;
        if (this.y <= this.baseY) { this.y = this.baseY; this.sub = 'track'; this.subT = 0; }
      }
      if (this.sub !== 'stuck') this.hazard(g, this.x, this.y + 48, 16);
    };

    /* --- chefe 3: canhão laser --- */
    e.updLaser = function (g) {
      var p = g.player;
      var left = g.level.bossGateX + 70, right = g.level.bossEndX - 70;
      if (this.sub === undefined) { this.sub = 'move'; this.subT = 0; }
      this.subT++;
      this.y = this.baseY + Math.sin(this.t * .05) * 10;
      if (this.sub === 'move') {
        this.x += this.face * 2.6;
        if (this.x < left) { this.x = left; this.face = 1; }
        if (this.x > right) { this.x = right; this.face = -1; }
        if (this.subT > 120) { this.sub = 'charge'; this.subT = 0; }
      } else if (this.sub === 'charge') {
        this.x = S.approach(this.x, p.x, 1.4);
        if (this.subT === 1) S.Audio.sfx('warn');
        if (this.subT > 60) { this.sub = 'fire'; this.subT = 0; S.Audio.sfx('laser'); }
      } else if (this.sub === 'fire') {
        if (this.subT < 46) {
          this.beam = true;
          var bx = this.x;
          var p2 = g.player;
          if (!p2.dead && Math.abs(p2.x - bx) < 14 && p2.y > this.y) p2.hurt(bx);
        } else { this.beam = false; this.sub = 'bombs'; this.subT = 0; }
      } else {
        if (this.subT % 34 === 0 && this.subT < 110) {
          g.entities.push(E.make.shot({ kind: 'shot', x: this.x, y: this.y + 26 },
            { vx: S.rand(-1.6, 1.6), vy: 1.4, grav: .1, style: 'ball' }));
          S.Audio.sfx('laser');
        }
        if (this.subT > 130) { this.sub = 'move'; this.subT = 0; }
      }
    };

    e.draw = function (ctx, cam) {
      var x = this.x - cam.x, y = this.y - cam.y;
      if (this.type === 'wrecker' && this.bx !== undefined) {
        S.Gfx.chain(ctx, x, y + 18, this.bx - cam.x, this.by - cam.y);
        S.Gfx.wreckingBall(ctx, this.bx - cam.x, this.by - cam.y, this.t);
      }
      if (this.type === 'driller') S.Gfx.drill(ctx, x, y + 18, this.t);
      if (this.type === 'masterlaser') {
        S.Gfx.laserArm(ctx, x, y + 16, this.t, this.sub === 'charge');
        if (this.beam) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = 'rgba(255,80,80,.75)';
          ctx.fillRect(x - 8, y + 44, 16, S.H);
          ctx.fillStyle = 'rgba(255,220,220,.9)';
          ctx.fillRect(x - 3, y + 44, 6, S.H);
          ctx.restore();
        }
      }
      S.Gfx.bossPod(ctx, x, y, this.t, this.invuln > 0, this.face);
    };
    return e;
  };
})();
