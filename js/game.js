/* ============================================================
   game.js — laço principal, máquina de estados e sessão de jogo
   ============================================================ */
(function () {
  'use strict';
  var S = window.S;

  var Game = S.Game = {
    canvas: null, ctx: null,
    state: null, screen: null,
    frames: 0, acc: 0, last: 0,
    shakeAmt: 0, shakeT: 0,
    fade: 0, fadeDir: 0, fadeNext: null,
    session: null,
    fps: 60, fpsAcc: 0, fpsT: 0,
    paused: false,

    init: function () {
      this.canvas = document.getElementById('game');
      this.ctx = this.canvas.getContext('2d', { alpha: false });
      this.ctx.imageSmoothingEnabled = false;
      S.Save.load();
      S.Audio.setMusicVol(S.Save.data.options.music);
      S.Audio.setSfxVol(S.Save.data.options.sfx);
      S.Audio.preloadVoices();
      S.Input.init(this.canvas);
      this.resize();
      var self = this;
      window.addEventListener('resize', function () { self.resize(); });
      var unlock = function () { S.Audio.resume(); };
      window.addEventListener('pointerdown', unlock);
      window.addEventListener('keydown', unlock);
      var el = document.getElementById('loading');
      if (el) el.style.display = 'none';
      this.setState('splash');
      this.last = performance.now();
      requestAnimationFrame(function (t) { self.loop(t); });
    },

    resize: function () {
      var wrap = document.getElementById('wrap');
      var availW = wrap.clientWidth - 16, availH = wrap.clientHeight - 16;
      var scale = Math.min(availW / S.W, availH / S.H);
      scale = Math.max(.4, scale);
      this.canvas.style.width = Math.floor(S.W * scale) + 'px';
      this.canvas.style.height = Math.floor(S.H * scale) + 'px';
    },

    loop: function (t) {
      var self = this;
      requestAnimationFrame(function (n) { self.loop(n); });
      var dt = t - this.last;
      if (dt > 250) dt = 250;
      this.last = t;
      this.acc += dt;
      var steps = 0;
      while (this.acc >= S.STEP && steps < 5) {
        this.acc -= S.STEP;
        this.step();
        steps++;
      }
      this.fpsAcc++;
      if (t - this.fpsT > 500) { this.fps = Math.round(this.fpsAcc * 1000 / (t - this.fpsT)); this.fpsAcc = 0; this.fpsT = t; }
      this.render();
    },

    step: function () {
      this.frames++;
      S.Input.update();
      S.Audio.tick();
      if (this.shakeT > 0) { this.shakeT--; if (this.shakeT === 0) this.shakeAmt = 0; }

      if (this.fadeDir !== 0) {
        this.fade += this.fadeDir * 0.055;
        if (this.fadeDir > 0 && this.fade >= 1) {
          this.fade = 1; this.fadeDir = -1;
          if (this.fadeNext) { this.applyState(this.fadeNext.name, this.fadeNext.opts); this.fadeNext = null; }
        } else if (this.fadeDir < 0 && this.fade <= 0) { this.fade = 0; this.fadeDir = 0; }
      }

      if (this.screen && this.screen.update) this.screen.update(this);
    },

    render: function () {
      var ctx = this.ctx;
      ctx.save();
      if (this.shakeAmt > 0 && S.Save.data.options.shake) {
        ctx.translate(S.rand(-this.shakeAmt, this.shakeAmt), S.rand(-this.shakeAmt, this.shakeAmt));
      }
      ctx.fillStyle = '#05060c';
      ctx.fillRect(-20, -20, S.W + 40, S.H + 40);
      if (this.screen && this.screen.draw) this.screen.draw(ctx, this);
      ctx.restore();

      S.UI.scanlines(ctx);

      if (this.fade > 0) {
        ctx.save();
        ctx.globalAlpha = this.fade;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, S.W, S.H);
        ctx.restore();
      }
      if (S.Save.data.options.showFps) {
        S.text(ctx, this.fps + ' FPS', S.W - 8, S.H - 8, { size: 11, align: 'right', color: '#7fe47c', shadow: false });
      }
    },

    setState: function (name, opts) {
      this.applyState(name, opts);
    },

    go: function (name, opts) {
      if (this.fadeDir !== 0) return;
      this.fadeDir = 1;
      this.fadeNext = { name: name, opts: opts };
    },

    applyState: function (name, opts) {
      if (this.screen && this.screen.exit) this.screen.exit(this);
      this.state = name;
      this.screen = S.Screens[name];
      if (this.screen && this.screen.enter) this.screen.enter(this, opts || {});
    },

    shake: function (n) { this.shakeAmt = Math.max(this.shakeAmt, n); this.shakeT = Math.max(this.shakeT, 10); }
  };

  S.Game.shake = Game.shake.bind(Game);

  window.addEventListener('load', function () { Game.init(); });
})();

/* ---------------- sessão de jogo ---------------- */
(function () {
  'use strict';
  var S = window.S;

  S.newSession = function (charId, actIndex, carry) {
    carry = carry || {};
    var g = {
      charId: charId, actIndex: actIndex,
      score: carry.score || 0,
      lives: carry.lives === undefined ? S.Save.data.options.lives : carry.lives,
      continues: carry.continues === undefined ? 2 : carry.continues,
      rings: 0, time: 0, frames: 0,
      chain: 0, chainTimer: 0,
      phase: 'play', phaseT: 0,
      checkpoint: null, entities: [], boss: null,
      bossActive: false, bossDown: false,
      bossIntro: 0, bossIntroT: 0, bankMode: false,
      cam: { x: 0, y: 0, lock: null, lookY: 0 },
      timeWarn: false, nextLife: 100,
      results: null, emeraldWon: false
    };

    g.level = S.Levels.build(actIndex);
    g.def = S.Levels.def(actIndex);
    g.zone = S.ZONES[g.def.zone];

    g.spawnEntities = function () {
      this.entities.length = 0;
      for (var i = 0; i < this.level.entities.length; i++) {
        var e = S.Entities.create(this.level.entities[i], this.level);
        if (e) this.entities.push(e);
      }
    };
    g.spawnEntities();
    S.Particles.reset();

    g.player = S.Player.create(charId, g.level.spawn.x, g.level.spawn.y);
    if (S.Save.allEmeralds()) g.player.canSuper = true;

    g.cam.x = S.clamp(g.player.x - S.W / 2, 0, g.level.pxW - S.W);
    g.cam.y = S.clamp(g.player.y - S.H * .6, 0, g.level.pxH - S.H);

    /* ---------- utilidades ---------- */
    g.shake = function (n) { S.Game.shake(n); };
    g.nearCamera = function (x, pad) {
      pad = pad || 360;
      return Math.abs(x - (this.cam.x + S.W / 2)) < pad || Math.abs(x - this.player.x) < pad;
    };

    g.restoreMusic = function () {
      if (this.phase !== 'play') return;
      if (this.player.superForm) { S.Audio.playMusic('invincible'); return; }
      if (this.player.invincTimer > 0) { S.Audio.playMusic('invincible'); return; }
      if (this.bossActive && !this.bossDown) { S.Audio.playBossTheme(); return; }
      S.Audio.playMusic(this.zone.music, { tempoScale: this.player.shoesTimer > 0 ? 1.22 : 1 });
    };

    g.addRing = function (n) {
      this.rings += n;
      S.Audio.sfx('ring');
      if (this.rings >= this.nextLife) {
        this.nextLife += 100;
        this.lives++;
        S.Audio.sfx('life');
        S.Particles.popup(this.player.x, this.player.y - 50, '1UP', '#7fe47c');
      }
      if (this.player.canSuper && !this.player.superForm && this.rings >= 50 && S.Save.allEmeralds()) {
        this.superHint = 180;
      }
    };

    g.enemyKilled = function (x, y) {
      this.chain = Math.min(this.chain + 1, 4);
      this.chainTimer = 120;
      var pts = [100, 200, 500, 1000][this.chain - 1];
      this.score += pts;
      S.Audio.sfx('pop');
      S.Particles.burst(x, y - 10, 14, { color: '#ffd23c', maxSpeed: 4.5, life: 26, size: 4 });
      S.Particles.burst(x, y - 10, 8, { color: '#ffffff', maxSpeed: 3, life: 20, size: 3 });
      S.Particles.popup(x, y - 30, String(pts), '#ffd23c');
    };

    g.giveItem = function (kind, x, y) {
      var p = this.player;
      if (kind === 'rings') { this.addRing(10); S.Particles.popup(x, y, '+10 ' + S.pickupLabel(this.charId), '#ffd23c'); }
      else if (kind === 'shield') { p.shield = 'shield'; S.Audio.sfx('shield'); S.Particles.popup(x, y, 'ESCUDO', '#4cc3ff'); }
      else if (kind === 'invinc') { p.invincTimer = 1200; S.Audio.sfx('invinc'); S.Particles.popup(x, y, 'INVENCIVEL', '#ffffff'); S.Audio.playMusic('invincible'); }
      else if (kind === 'shoes') { p.shoesTimer = 1200; S.Audio.sfx('shoes'); S.Particles.popup(x, y, 'TENIS VELOZES', '#e03027'); this.restoreMusic(); }
      else if (kind === 'life') { this.lives++; S.Audio.sfx('life'); S.Particles.popup(x, y, '1UP', '#7fe47c'); }
    };

    g.setCheckpoint = function (x, y) {
      this.checkpoint = { x: x, y: y, time: this.time, rings: 0 };
      S.Particles.popup(x, y - 60, 'CHECKPOINT', '#ffd23c');
    };

    g.enterSpecial = function () {
      this.phase = 'special';
      S.Audio.stopMusic();
      S.Game.go('special', { session: this });
    };

    g.finishAct = function () {
      if (this.phase !== 'play') return;
      this.phase = 'clear'; this.phaseT = 0;
      this.player.goalLock = true;
      S.Audio.stopMusic();
      S.Audio.sfx('goal');
    };

    g.onPlayerDead = function () {
      if (this.phase === 'dead') return;
      this.phase = 'dead'; this.phaseT = 0;
    };

    g.startBossIntro = function () {
      this.bossIntro = 1;
      this.bossIntroT = 0;
      this.bankMode = false;
      this.cam.lock = { min: this.level.bossGateX, max: this.level.bossEndX - S.W };
      this.player.controlEnabled = false;
      this.player.gsp = 0;
      this.player.rolling = false;
      S.Audio.stopMusic();
      S.Audio.stopVoice();
    };

    g.onBossDying = function () { this.bossDown = true; };

    g.onBossDefeated = function () {
      this.score += 1000;
      this.cam.lock = null;
      this.bossActive = false;
      this.bankMode = false;
      S.Audio.stopBossTheme();
      S.Particles.popup(this.player.x, this.player.y - 60, 'DANIEL VOCARO DERROTADO!', '#ffd23c');
      this.restoreMusic();
    };

    return g;
  };
})();

/* ---------------- loopings ---------------- */
(function () {
  'use strict';
  var S = window.S;

  S.Loops = {
    check: function (p, g) {
      if (p.loop || p.dead) return;
      if (p.loopCool > 0) { p.loopCool--; return; }
      if (!p.grounded || Math.abs(p.gsp) < 4.6) return;
      var L = g.level.loops;
      for (var i = 0; i < L.length; i++) {
        var l = L[i];
        if (Math.abs(p.x - l.x) > 18) continue;
        if (Math.abs(p.y - (l.y + l.r)) > 18) continue;
        p.loop = { x: l.x, y: l.y, r: l.r, theta: 0, dir: S.sgn(p.gsp) };
        p.rolling = false;
        S.Audio.sfx('dash');
        return;
      }
    },

    move: function (p, g) {
      var l = p.loop;
      var mag = Math.abs(p.gsp);
      if (mag < 3.2 && l.theta > 1.0 && l.theta < Math.PI * 2 - 1.0) {
        p.loop = null; p.loopCool = 40;
        p.grounded = false; p.vx = p.gsp * .4; p.vy = 0; p.angle = 0;
        return;
      }
      l.theta += mag / l.r;
      if (l.theta >= Math.PI * 2) {
        p.loop = null; p.loopCool = 50;
        p.x = l.x + l.dir * 4; p.y = l.y + l.r;
        p.angle = 0; p.grounded = true;
        return;
      }
      p.x = l.x + l.dir * Math.sin(l.theta) * l.r;
      p.y = l.y + Math.cos(l.theta) * l.r;
      p.angle = -l.theta * l.dir;
      p.grounded = true; p.vy = 0;
      p.face = l.dir;
      if (g.frames % 3 === 0) {
        S.Particles.spawn({ type: 'dust', x: p.x, y: p.y, vx: 0, vy: 0, g: 0,
          life: 14, size: 3, color: '#ffffff' });
      }
    },

    draw: function (ctx, g, back) {
      var L = g.level.loops, cam = g.cam;
      for (var i = 0; i < L.length; i++) {
        var l = L[i];
        if (l.x - cam.x < -200 || l.x - cam.x > S.W + 200) continue;
        S.Gfx.loopRing(ctx, l.x - cam.x, l.y - cam.y, l.r, g.level.theme, back);
      }
    }
  };
})();

/* ---------------- atualização e desenho da fase ---------------- */
(function () {
  'use strict';
  var S = window.S;

  S.Play = {
    update: function (g) {
      var p = g.player, lv = g.level, In = S.Input;
      g.frames++;
      if (g.chainTimer > 0) { g.chainTimer--; if (g.chainTimer === 0) g.chain = 0; }
      if (g.superHint > 0) g.superHint--;

      if (g.phase === 'play' && !p.dead) {
        g.time++;
        g.timeWarn = (g.def.time - g.time) < 1800;
        if (g.time >= g.def.time) { g.timeOver = true; p.die(); }
      }

      // transformação Super
      if (p.canSuper && !p.superForm && g.rings >= 50 && !p.grounded &&
          (p.jumping || p.rolling) && In.pressed('action')) {
        p.superForm = true; p.superTimer = 0; p.invulnTimer = 0;
        S.Audio.sfx('emerald');
        S.Audio.playMusic('invincible');
        S.Particles.burst(p.x, p.y - 20, 26, { color: '#fff3a8', maxSpeed: 6, life: 34, size: 5 });
        S.Game.shake(8);
      }

      S.Player.update(p, g);
      S.Loops.check(p, g);

      // porta do chefe
      if (g.def.boss && !g.bossActive && !g.bossDown && !g.bossIntro && p.x > lv.bossGateX + 60) {
        g.startBossIntro();
      }
      if (g.bossIntro) S.Play.bossIntro(g);
      if (g.cam.lock) {
        p.x = S.clamp(p.x, lv.bossGateX + 20, lv.bossEndX - 20);
      }

      // entidades
      for (var i = 0; i < g.entities.length; i++) {
        var e = g.entities[i];
        if (!e.alive) continue;
        if (e.kind !== 'boss' && e.kind !== 'ring' && e.kind !== 'shot' && !g.nearCamera(e.x, 520)) continue;
        e.update(g);
      }
      for (var j = g.entities.length - 1; j >= 0; j--) if (!g.entities[j].alive) g.entities.splice(j, 1);
      if (g.boss && !g.boss.alive) g.boss = null;

      S.Particles.update();
      this.camera(g);

      if (g.phase === 'clear') g.phaseT++;
      if (g.phase === 'dead') g.phaseT++;
    },

    /* marcos da abertura do chefe, em quadros */
    BI: { ALERTA: 24, BATIDA1: 72, BATIDA2: 104, BATIDA3: 128, TREMOR: 134,
          ESTOURO: 172, REVELA: 178, FIM: 268 },

    bossIntro: function (g) {
      var B = S.Play.BI;
      var t = g.bossIntroT++;
      var p = g.player;

      p.gsp = S.approach(p.gsp, 0, .3);
      if (t === B.ALERTA) S.Audio.sfx('warn');
      if (t === B.BATIDA1 || t === B.BATIDA2 || t === B.BATIDA3) {
        S.Audio.sfx('bosshit');
        g.shake(5);
      }
      if (t >= B.TREMOR && t < B.ESTOURO) {
        if (t % 6 === 0) g.shake(2 + (t - B.TREMOR) * .18);
        if (t % 9 === 0) {
          S.Particles.spawn({ type: 'dust', x: g.cam.x + S.rand(40, S.W - 40),
            y: g.cam.y + S.H - 40, vx: S.rand(-.4, .4), vy: -S.rand(.6, 1.6),
            g: -.01, life: 34, size: S.rand(2, 5), color: '#cfd7e8' });
        }
      }
      if (t === B.ESTOURO) {
        S.Audio.sfx('explode');
        g.shake(20);
      }
      if (t === B.REVELA) {
        g.bankMode = true;
        g.bossActive = true;
        g.boss = S.Entities.make.boss({ kind: 'boss', x: g.level.bossX, y: 210 }, g.def.boss);
        g.entities.push(g.boss);
        S.Audio.playBossTheme();
        S.Particles.burst(g.level.bossX, 150, 26,
          { color: '#9fd4ff', maxSpeed: 6, life: 34, size: 5 });
      }
      if (t >= B.FIM) {
        g.bossIntro = 0;
        p.controlEnabled = true;
      }
    },

    camera: function (g) {
      var p = g.player, cam = g.cam;
      var dx = p.x - (cam.x + S.W / 2);
      var maxSpd = Math.abs(p.gsp) > 8 ? 26 : 16;
      if (dx > 6) cam.x += Math.min(dx - 6, maxSpd);
      else if (dx < -6) cam.x += Math.max(dx + 6, -maxSpd);

      if (p.lookup) cam.lookY = S.approach(cam.lookY, -78, 2);
      else if (p.crouch) cam.lookY = S.approach(cam.lookY, 78, 2);
      else cam.lookY = S.approach(cam.lookY, 0, 3);

      var ty = p.y - S.H * .58 + cam.lookY;
      var vs = p.grounded ? 9 : 17;
      cam.y += S.clamp(ty - cam.y, -vs, vs);

      var minX = 0, maxX = g.level.pxW - S.W;
      if (cam.lock) { minX = Math.max(minX, cam.lock.min); maxX = Math.min(maxX, cam.lock.max); }
      cam.x = S.clamp(cam.x, minX, Math.max(minX, maxX));
      cam.y = S.clamp(cam.y, 0, Math.max(0, g.level.pxH - S.H));
    },

    draw: function (ctx, g) {
      var lv = g.level, cam = g.cam;
      var cx = Math.round(cam.x), cy = Math.round(cam.y);

      S.Gfx.drawBackground(ctx, g.bankMode ? 'banco' : lv.theme, { x: cx, y: cy }, g.frames);
      S.Loops.draw(ctx, { level: lv, cam: { x: cx, y: cy } }, false);
      ctx.drawImage(lv.canvas, cx, cy, S.W, S.H, 0, 0, S.W, S.H);

      var i;
      for (i = 0; i < g.entities.length; i++) {
        var e = g.entities[i];
        if (!e.alive) continue;
        if (e.x - cx < -140 || e.x - cx > S.W + 140) continue;
        e.draw(ctx, { x: cx, y: cy });
      }

      S.Player.draw(g.player, ctx, { x: cx, y: cy });
      S.Level.drawWater(ctx, lv, { x: cx, y: cy }, g.frames);
      S.Particles.draw(ctx, { x: cx, y: cy });

      if (g.player.inWater) {
        ctx.save();
        ctx.globalAlpha = .12; ctx.fillStyle = '#48b0ff';
        ctx.fillRect(0, 0, S.W, S.H); ctx.restore();
      }

      S.UI.vignette(ctx, .35);
      if (g.bossIntro) S.Play.drawBossIntro(ctx, g);
      S.HUD.draw(ctx, g);

      if (g.superHint > 0 && !g.player.superForm) {
        S.text(ctx, 'SEGURE O PULO E APERTE X PARA VIRAR SUPER!', S.W / 2, S.H - 58, {
          size: 13, align: 'center', color: '#fff3a8', outline: 'rgba(0,0,0,.8)', outlineW: 4, shadow: false });
      }

      if (g.phase === 'clear') {
        var a = Math.min(1, g.phaseT / 26);
        ctx.save(); ctx.globalAlpha = a;
        S.text(ctx, 'ATO CONCLUIDO!', S.W / 2, 150, {
          size: 34, align: 'center', color: '#ffd23c', outline: '#3a1d00', outlineW: 6, shadow: false });
        ctx.restore();
      }
    }
  };
})();

/* ---------------- abertura do chefe: suspense ---------------- */
(function () {
  'use strict';
  var S = window.S;

  S.Play.drawBossIntro = function (ctx, g) {
    var B = S.Play.BI, t = g.bossIntroT;

    // escurecimento crescente
    var dark = 0;
    if (t < B.ESTOURO) dark = S.clamp((t - 16) / (B.ESTOURO - 16), 0, 1) * .72;
    else dark = Math.max(0, .72 - (t - B.ESTOURO) * .05);
    if (dark > 0) {
      ctx.save();
      ctx.globalAlpha = dark;
      ctx.fillStyle = '#04060f';
      ctx.fillRect(0, 0, S.W, S.H);
      ctx.restore();
      S.UI.vignette(ctx, dark);
    }

    // pulsos vermelhos nas batidas
    [B.BATIDA1, B.BATIDA2, B.BATIDA3].forEach(function (b) {
      var d = t - b;
      if (d >= 0 && d < 16) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = (1 - d / 16) * .3;
        ctx.fillStyle = '#ff2b2b';
        ctx.fillRect(0, 0, S.W, S.H);
        ctx.restore();
      }
    });

    // alerta piscando
    if (t > B.ALERTA && t < B.ESTOURO) {
      var pisca = Math.floor(t / 10) % 2 === 0;
      if (pisca) {
        S.text(ctx, '!', S.W / 2, 132, {
          size: 74, align: 'center', weight: '900', color: '#ff3b3b',
          outline: '#2a0000', outlineW: 8, shadow: false
        });
        S.text(ctx, 'ALGO SE APROXIMA', S.W / 2, 172, {
          size: 17, align: 'center', color: '#ffd23c',
          outline: 'rgba(0,0,0,.85)', outlineW: 5, shadow: false
        });
      }
      // barras de cinema
      var bar = S.clamp((t - B.ALERTA) / 40, 0, 1) * 34;
      ctx.fillStyle = '#04060f';
      ctx.fillRect(0, 0, S.W, bar);
      ctx.fillRect(0, S.H - bar, S.W, bar);
    }

    // clarao da revelacao
    var f = t - B.ESTOURO;
    if (f >= 0 && f < 14) {
      ctx.save();
      ctx.globalAlpha = 1 - f / 14;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, S.W, S.H);
      ctx.restore();
    }

    // cartao com o nome do chefe
    if (t > B.REVELA && t < B.FIM) {
      var k = t - B.REVELA;
      var ent = S.clamp(k / 16, 0, 1);
      var sai = S.clamp((B.FIM - t) / 18, 0, 1);
      ctx.save();
      ctx.globalAlpha = Math.min(ent, sai);
      ctx.translate((1 - ent) * -90, 0);
      var y = S.H - 92;
      ctx.fillStyle = 'rgba(8,18,44,.88)';
      S.roundRect(ctx, S.W / 2 - 190, y, 380, 62, 8); ctx.fill();
      ctx.strokeStyle = '#2f6fd8'; ctx.lineWidth = 2;
      S.roundRect(ctx, S.W / 2 - 190, y, 380, 62, 8); ctx.stroke();
      ctx.fillStyle = '#2f6fd8';
      S.roundRect(ctx, S.W / 2 - 180, y + 12, 38, 38, 5); ctx.fill();
      S.Gfx.logoM(ctx, S.W / 2 - 161, y + 32, 1.9, '#ffffff');
      S.text(ctx, 'DANIEL VOCARO', S.W / 2 - 128, y + 30, {
        size: 22, weight: '900', color: '#ffffff',
        outline: 'rgba(0,0,0,.7)', outlineW: 4, shadow: false
      });
      S.text(ctx, 'BANCO MASTER', S.W / 2 - 128, y + 50, {
        size: 13, color: '#9fc4ff', shadow: false
      });
      ctx.restore();
    }
  };
})();
