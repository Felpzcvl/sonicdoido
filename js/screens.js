/* ============================================================
   screens.js — todas as telas do jogo
   ============================================================ */
(function () {
  'use strict';
  var S = window.S;
  var Sc = S.Screens = {};

  S.nav = function (st, len, horizontal) {
    var In = S.Input, moved = 0;
    var prev = horizontal ? 'left' : 'up', next = horizontal ? 'right' : 'down';
    if (In.pressed(prev)) { st.sel = (st.sel - 1 + len) % len; moved = -1; }
    if (In.pressed(next)) { st.sel = (st.sel + 1) % len; moved = 1; }
    if (moved) S.Audio.sfx('move');
    return moved;
  };

  /* ---------------- abertura ---------------- */
  Sc.splash = {
    enter: function (g) { this.t = 0; },
    update: function (g) {
      this.t++;
      if (this.t === 30) S.Audio.sfx('start');
      if (this.t > 170 || S.Input.pressed('confirm') || S.Input.pressed('pause')) g.go('title');
    },
    draw: function (ctx, g) {
      var t = this.t;
      ctx.fillStyle = '#05060c'; ctx.fillRect(0, 0, S.W, S.H);
      var a = S.clamp(t / 30, 0, 1) * S.clamp((170 - t) / 30, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(S.W / 2, S.H / 2 - 10);
      var sc = 1 + Math.max(0, (30 - t)) * .02;
      ctx.scale(sc, sc);
      S.text(ctx, 'FELLI GAMES', 0, 0, {
        size: 36, align: 'center', weight: '900',
        gradient: ['#ffffff', '#6fb8ff'], outline: '#0b1a3a', outlineW: 7, shadow: false
      });
      S.text(ctx, 'apresenta', 0, 30, { size: 13, align: 'center', color: '#9fb0cc', shadow: false });
      ctx.restore();
      if (t > 40 && t < 150) S.shine(ctx, S.W / 2 - 170, S.H / 2 - 40, 340, 50, t * 4);
    }
  };

  /* ---------------- título ---------------- */
  Sc.title = {
    enter: function (g) {
      this.t = 0; this.camx = 0;
      S.Audio.playMusic('title');
    },
    update: function (g) {
      this.t++;
      this.camx += 1.6;
      var In = S.Input;
      if (In.pressed('confirm') || In.pressed('pause') || In.pressed('jump')) {
        S.Audio.sfx('start');
        g.go('menu');
      }
    },
    draw: function (ctx, g) {
      var t = this.t;
      S.Gfx.drawBackground(ctx, 'congresso', { x: this.camx, y: 40 }, t);
      var chars = ['lula', 'bolsonaro', 'renan'];
      for (var i = 0; i < 3; i++) {
        var x = ((t * 3.4 + i * 90) % (S.W + 160)) - 80;
        S.Gfx.drawChar(ctx, chars[i], {
          x: x, y: 272, state: 'run', t: t * 1.5 + i * 7, facing: 1, scale: .9
        });
      }

      S.UI.vignette(ctx, .4);
      S.UI.title(ctx, t, 116, 1);
      S.shine(ctx, S.W / 2 - 180, 70, 360, 70, t * 3);

      if (Math.floor(t / 26) % 2 === 0) {
        S.text(ctx, 'PRESSIONE ENTER OU ESPACO', S.W / 2, 228, {
          size: 17, align: 'center', color: '#ffffff', outline: 'rgba(0,0,0,.75)', outlineW: 4, shadow: false });
      }
      S.text(ctx, 'RECORDE  ' + S.pad(S.Save.data.highScore, 6), S.W / 2, 262, {
        size: 13, align: 'center', color: '#9fe2ff', shadow: false });
      S.text(ctx, 'v' + S.VERSION + '  •  um jogo de plataforma feito em HTML5', S.W / 2, S.H - 14, {
        size: 11, align: 'center', color: 'rgba(230,240,255,.6)', shadow: false });
    }
  };

  /* ---------------- menu principal ---------------- */
  Sc.menu = {
    enter: function (g, o) {
      this.t = 0;
      this.sel = (o && o.sel) || 0;
      S.Audio.playMusic('title');
    },
    items: function () {
      return [
        { label: 'NOVO JOGO' },
        { label: 'CONTINUAR', disabled: S.Save.data.unlockedAct === 0 },
        { label: 'SELECIONAR FASE' },
        { label: 'PERSONAGEM', value: (S.Gfx.CHARS[S.Save.data.favChar] || S.Gfx.CHARS.lula).name },
        { label: 'OPCOES' },
        { label: 'CONTROLES' },
        { label: 'CREDITOS' }
      ];
    },
    update: function (g) {
      this.t++;
      var items = this.items();
      S.nav(this, items.length);
      var In = S.Input;
      if (In.pressed('confirm')) {
        var it = items[this.sel];
        if (it.disabled) { S.Audio.sfx('cancel'); return; }
        S.Audio.sfx('select');
        switch (this.sel) {
          case 0: g.go('charselect', { act: 0, fresh: true }); break;
          case 1: g.go('charselect', { act: S.Save.data.unlockedAct }); break;
          case 2: g.go('levelselect'); break;
          case 3: g.go('charselect', { pickOnly: true }); break;
          case 4: g.go('options'); break;
          case 5: g.go('controls'); break;
          case 6: g.go('credits'); break;
        }
      }
    },
    draw: function (ctx, g) {
      var t = this.t;
      S.Gfx.drawBackground(ctx, 'congresso', { x: t * 1.1, y: 60 }, t);
      S.UI.vignette(ctx, .55);
      S.UI.title(ctx, t, 62, .62);
      S.UI.panel(ctx, S.W / 2 - 170, 108, 340, 214);
      S.UI.menu(ctx, this.items(), this.sel, S.W / 2, 140, { gap: 30, size: 18, w: 320, align: 'left' });
      S.UI.hint(ctx, 'SETAS mover  •  ENTER confirmar  •  ESC voltar');
    }
  };
})();

/* ---------------- seleção de personagem ---------------- */
(function () {
  'use strict';
  var S = window.S, Sc = S.Screens;
  var IDS = ['lula', 'bolsonaro', 'renan'];

  Sc.charselect = {
    enter: function (g, o) {
      this.t = 0;
      this.opts = o || {};
      this.sel = Math.max(0, IDS.indexOf(S.Save.data.favChar));
      S.Audio.playMusic('title');
      S.Audio.voice(IDS[this.sel]);
    },
    exit: function () { S.Audio.stopVoice(); },
    update: function (g) {
      this.t++;
      var In = S.Input;
      if (S.nav(this, 3, true)) {
        S.Save.data.favChar = IDS[this.sel];
        S.Save.save();
        S.Audio.voice(IDS[this.sel]);
      }
      if (In.pressed('confirm')) {
        S.Audio.sfx('start');
        S.Save.data.favChar = IDS[this.sel];
        S.Save.save();
        if (this.opts.pickOnly) { g.go('menu', { sel: 3 }); return; }
        g.go('zoneintro', {
          charId: IDS[this.sel],
          act: this.opts.act || 0,
          carry: null
        });
      } else if (In.pressed('back')) {
        S.Audio.sfx('cancel');
        g.go('menu');
      }
    },
    draw: function (ctx, g) {
      var t = this.t;
      S.Gfx.drawBackground(ctx, 'congresso', { x: t * .8, y: 70 }, t);
      S.UI.vignette(ctx, .6);
      S.text(ctx, 'ESCOLHA SEU HEROI', S.W / 2, 44, {
        size: 24, align: 'center', color: '#ffd23c', outline: '#3a1d00', outlineW: 5, shadow: false });

      var cw = 150, ch = 168, gap = 18;
      var total = cw * 3 + gap * 2;
      for (var i = 0; i < 3; i++) {
        var x = (S.W - total) / 2 + i * (cw + gap);
        var sel = i === this.sel;
        S.UI.charCard(ctx, IDS[i], x, 66 + (sel ? -8 : 0), cw, ch, sel, t + i * 30);
      }

      var c = S.Gfx.CHARS[IDS[this.sel]];
      S.UI.panel(ctx, 40, 258, S.W - 80, 62);
      S.text(ctx, c.full, S.W / 2, 280, { size: 16, align: 'center', color: '#ffffff', shadow: false });
      S.text(ctx, 'HABILIDADE: ' + c.ability, S.W / 2, 300, { size: 13, align: 'center', color: '#ffd23c', shadow: false });
      S.text(ctx, c.desc, S.W / 2, 316, { size: 11, align: 'center', color: '#b9c6e6', shadow: false });
      S.UI.hint(ctx, 'ESQ/DIR escolher  •  ENTER confirmar  •  ESC voltar', S.H - 8);
    }
  };

  /* ---------------- seleção de fase ---------------- */
  Sc.levelselect = {
    enter: function (g) {
      this.t = 0; this.sel = 0;
      S.Audio.playMusic('title');
    },
    update: function (g) {
      this.t++;
      var In = S.Input;
      S.nav(this, S.ACTS.length);
      if (In.pressed('confirm')) {
        if (this.sel > S.Save.data.unlockedAct) { S.Audio.sfx('cancel'); return; }
        S.Audio.sfx('start');
        g.go('zoneintro', { charId: S.Save.data.favChar, act: this.sel, carry: null });
      } else if (In.pressed('back')) { S.Audio.sfx('cancel'); g.go('menu', { sel: 2 }); }
    },
    draw: function (ctx, g) {
      var t = this.t;
      var act = S.ACTS[this.sel];
      S.Gfx.drawBackground(ctx, act.theme, { x: t * .8, y: 60 }, t);
      S.UI.vignette(ctx, .6);
      S.text(ctx, 'SELECIONAR FASE', S.W / 2, 38, {
        size: 22, align: 'center', color: '#ffd23c', outline: '#3a1d00', outlineW: 5, shadow: false });

      S.UI.panel(ctx, 30, 54, 340, 250);
      var items = [];
      for (var i = 0; i < S.ACTS.length; i++) {
        var a = S.ACTS[i];
        var locked = i > S.Save.data.unlockedAct;
        var done = S.Save.data.cleared[a.id];
        items.push({
          label: (locked ? '🔒 ' : (done ? '✔ ' : '')) + a.name,
          disabled: locked
        });
      }
      S.UI.menu(ctx, items, this.sel, 200, 86, { gap: 34, size: 14, w: 320, align: 'left' });

      S.UI.panel(ctx, 382, 54, S.W - 412, 250);
      var best = S.Save.data.bestTimes[act.id];
      var bs = S.Save.data.bestScores[act.id];
      S.text(ctx, S.ZONES[act.zone].name, 400, 84, { size: 16, color: '#ffd23c', shadow: false });
      S.text(ctx, 'ATO ' + act.act, 400, 106, { size: 13, color: '#ffffff', shadow: false });
      S.text(ctx, S.ZONES[act.zone].intro, 400, 132, { size: 11, color: '#b9c6e6', shadow: false });
      S.text(ctx, 'MELHOR TEMPO', 400, 168, { size: 11, color: '#9fb0cc', shadow: false });
      S.text(ctx, best ? S.fmtTime(best) : '--', 400, 188, { size: 16, color: '#ffffff', shadow: false });
      S.text(ctx, 'MELHOR PONTUACAO', 400, 216, { size: 11, color: '#9fb0cc', shadow: false });
      S.text(ctx, bs ? S.pad(bs, 6) : '--', 400, 236, { size: 16, color: '#ffffff', shadow: false });
      if (act.boss) S.text(ctx, '⚠ CHEFE NO FINAL', 400, 268, { size: 12, color: '#ff8a8a', shadow: false });
      if (S.Save.data.emeralds[act.emerald]) {
        S.Gfx.emerald(ctx, S.W - 60, 268, S.HUD.EMCOL[act.emerald], t, 1.1);
      }
      S.UI.hint(ctx, 'ENTER jogar  •  ESC voltar');
    }
  };
})();

/* ---------------- opções ---------------- */
(function () {
  'use strict';
  var S = window.S, Sc = S.Screens;
  var DIFF = ['FACIL', 'NORMAL', 'DIFICIL'];

  Sc.options = {
    enter: function (g) { this.t = 0; this.sel = 0; this.confirmReset = 0; },
    items: function () {
      var o = S.Save.data.options;
      return [
        { label: 'MUSICA', value: Math.round(o.music * 100) + '%', key: 'music' },
        { label: 'EFEITOS', value: Math.round(o.sfx * 100) + '%', key: 'sfx' },
        { label: 'VIDAS INICIAIS', value: String(o.lives), key: 'lives' },
        { label: 'DIFICULDADE', value: DIFF[o.difficulty], key: 'difficulty' },
        { label: 'BOTOES NA TELA', value: o.touch ? 'SIM' : 'NAO', key: 'touch' },
        { label: 'MOSTRAR FPS', value: o.showFps ? 'SIM' : 'NAO', key: 'showFps' },
        { label: 'LINHAS DE TV', value: o.scanlines ? 'SIM' : 'NAO', key: 'scanlines' },
        { label: 'TREMOR DE TELA', value: o.shake ? 'SIM' : 'NAO', key: 'shake' },
        { label: this.confirmReset ? 'CONFIRMA APAGAR? (ENTER)' : 'APAGAR PROGRESSO', key: 'reset' },
        { label: 'VOLTAR', key: 'back' }
      ];
    },
    update: function (g) {
      this.t++;
      var In = S.Input, o = S.Save.data.options;
      var items = this.items();
      if (S.nav(this, items.length)) this.confirmReset = 0;
      var it = items[this.sel];
      var d = (In.pressed('right') ? 1 : 0) - (In.pressed('left') ? 1 : 0);
      if (d) {
        S.Audio.sfx('move');
        if (it.key === 'music') { o.music = S.clamp(+(o.music + d * .1).toFixed(2), 0, 1); S.Audio.setMusicVol(o.music); }
        else if (it.key === 'sfx') { o.sfx = S.clamp(+(o.sfx + d * .1).toFixed(2), 0, 1); S.Audio.setSfxVol(o.sfx); S.Audio.sfx('ring'); }
        else if (it.key === 'lives') o.lives = S.clamp(o.lives + d, 1, 9);
        else if (it.key === 'difficulty') o.difficulty = S.clamp(o.difficulty + d, 0, 2);
        else if (it.key === 'touch') o.touch = !o.touch;
        else if (it.key === 'showFps') o.showFps = !o.showFps;
        else if (it.key === 'scanlines') o.scanlines = !o.scanlines;
        else if (it.key === 'shake') o.shake = !o.shake;
        S.Save.save();
      }
      if (In.pressed('confirm')) {
        if (it.key === 'back') { S.Audio.sfx('cancel'); g.go('menu', { sel: 4 }); }
        else if (it.key === 'reset') {
          if (this.confirmReset) {
            S.Save.reset(); this.confirmReset = 0;
            S.Audio.setMusicVol(S.Save.data.options.music);
            S.Audio.setSfxVol(S.Save.data.options.sfx);
            S.Audio.sfx('pop');
          } else { this.confirmReset = 1; S.Audio.sfx('warn'); }
        } else S.Audio.sfx('select');
      }
      if (In.pressed('back')) { S.Audio.sfx('cancel'); g.go('menu', { sel: 4 }); }
    },
    draw: function (ctx, g) {
      var t = this.t;
      S.Gfx.drawBackground(ctx, 'congresso', { x: t * .5, y: 60 }, t);
      S.UI.vignette(ctx, .65);
      S.text(ctx, 'OPCOES', S.W / 2, 40, {
        size: 24, align: 'center', color: '#ffd23c', outline: '#3a1d00', outlineW: 5, shadow: false });
      S.UI.panel(ctx, S.W / 2 - 200, 54, 400, 268);
      S.UI.menu(ctx, this.items(), this.sel, S.W / 2, 82, { gap: 27, size: 15, w: 380, align: 'left' });
      S.UI.hint(ctx, 'ESQ/DIR ajustar  •  ESC voltar');
    }
  };
})();

/* ---------------- controles ---------------- */
(function () {
  'use strict';
  var S = window.S, Sc = S.Screens;

  Sc.controls = {
    enter: function (g) { this.t = 0; },
    update: function (g) {
      this.t++;
      if (S.Input.pressed('back') || S.Input.pressed('confirm')) { S.Audio.sfx('cancel'); g.go('menu', { sel: 5 }); }
    },
    draw: function (ctx, g) {
      var t = this.t;
      S.Gfx.drawBackground(ctx, 'congresso', { x: t * .5, y: 60 }, t);
      S.UI.vignette(ctx, .65);
      S.text(ctx, 'COMO JOGAR', S.W / 2, 36, {
        size: 24, align: 'center', color: '#ffd23c', outline: '#3a1d00', outlineW: 5, shadow: false });
      S.UI.panel(ctx, 24, 48, 300, 272);
      var rows = [
        ['SETAS / A D', 'Andar e virar'],
        ['SETA BAIXO', 'Rolar em movimento'],
        ['BAIXO + PULO', 'Spin Dash (carregar)'],
        ['ESPACO / Z', 'Pular'],
        ['PULO NO AR', 'Habilidade especial'],
        ['X / SHIFT', 'Virar Super (6 esmeraldas)'],
        ['ENTER / P', 'Pausar'],
        ['ESC', 'Voltar / cancelar']
      ];
      for (var i = 0; i < rows.length; i++) {
        var y = 78 + i * 30;
        S.text(ctx, rows[i][0], 40, y, { size: 13, color: '#ffd23c', shadow: false });
        S.text(ctx, rows[i][1], 156, y, { size: 12, color: '#e6ecff', shadow: false });
      }
      S.UI.panel(ctx, 334, 48, S.W - 358, 272);
      S.text(ctx, 'HABILIDADES', 352, 76, { size: 15, color: '#ffd23c', shadow: false });
      var chars = ['lula', 'bolsonaro', 'renan'];
      for (var k = 0; k < 3; k++) {
        var c = S.Gfx.CHARS[chars[k]];
        var yy = 100 + k * 68;
        S.Gfx.drawChar(ctx, chars[k], { x: 378, y: yy + 34, state: 'idle', t: t + k * 20, facing: 1, scale: .74 });
        S.text(ctx, c.name, 406, yy + 10, { size: 13, color: '#ffffff', shadow: false });
        S.text(ctx, c.ability, 406, yy + 28, { size: 11, color: '#9fe2ff', shadow: false });
        S.text(ctx, c.desc, 406, yy + 44, { size: 10, color: '#b9c6e6', shadow: false });
      }
      S.UI.hint(ctx, 'ESC ou ENTER para voltar');
    }
  };
})();

/* ---------------- créditos ---------------- */
(function () {
  'use strict';
  var S = window.S, Sc = S.Screens;

  Sc.credits = {
    enter: function (g) { this.t = 0; this.scroll = 0; },
    lines: [
      ['SONIC — EMERALD RUSH', 22, '#ffd23c'],
      ['', 10, '#ffffff'],
      ['Um jogo de plataforma em HTML5 Canvas', 13, '#e6ecff'],
      ['', 14, '#ffffff'],
      ['PROGRAMACAO E ARTE', 14, '#9fe2ff'],
      ['Motor, fisica, IA e graficos vetoriais', 12, '#e6ecff'],
      ['gerados em tempo real no navegador', 12, '#e6ecff'],
      ['', 14, '#ffffff'],
      ['TRILHA SONORA', 14, '#9fe2ff'],
      ['Chiptune sintetizada via WebAudio', 12, '#e6ecff'],
      ['', 14, '#ffffff'],
      ['FISICA', 14, '#9fe2ff'],
      ['Inspirada nos classicos de 16 bits:', 12, '#e6ecff'],
      ['aceleracao, atrito, rampas e rolamento', 12, '#e6ecff'],
      ['', 14, '#ffffff'],
      ['ZONAS', 14, '#9fe2ff'],
      ['Emerald Hill / Chemical Lagoon / Sky Fortress', 12, '#e6ecff'],
      ['', 14, '#ffffff'],
      ['AGRADECIMENTOS', 14, '#9fe2ff'],
      ['A voce, por jogar ate aqui!', 12, '#e6ecff'],
      ['', 20, '#ffffff'],
      ['Sonic e um personagem da SEGA.', 11, '#9fb0cc'],
      ['Projeto educacional sem fins lucrativos.', 11, '#9fb0cc']
    ],
    update: function (g) {
      this.t++;
      this.scroll += S.Input.held('down') ? 2.4 : .6;
      if (this.scroll > 720) this.scroll = -40;
      if (S.Input.pressed('back') || S.Input.pressed('confirm')) { S.Audio.sfx('cancel'); g.go('menu', { sel: 6 }); }
    },
    draw: function (ctx, g) {
      var t = this.t;
      S.Gfx.drawBackground(ctx, 'congresso', { x: t * 1.4, y: 40 }, t);
      S.UI.vignette(ctx, .7);
      var y = S.H + 10 - this.scroll;
      for (var i = 0; i < this.lines.length; i++) {
        var l = this.lines[i];
        if (y > -30 && y < S.H + 30) {
          S.text(ctx, l[0], S.W / 2, y, {
            size: l[1], align: 'center', color: l[2],
            outline: 'rgba(0,0,0,.6)', outlineW: 3, shadow: false });
        }
        y += l[1] + 12;
      }
      S.Gfx.drawChar(ctx, 'lula', { x: 64, y: 272, state: 'idle', t: t, facing: 1, scale: .82 });
      S.Gfx.drawChar(ctx, 'bolsonaro', { x: S.W - 64, y: 272, state: 'idle', t: t + 30, facing: -1, scale: .82 });
      S.UI.hint(ctx, 'BAIXO acelera  •  ESC para voltar');
    }
  };
})();

/* ---------------- cartão da zona ---------------- */
(function () {
  'use strict';
  var S = window.S, Sc = S.Screens;

  Sc.zoneintro = {
    enter: function (g, o) {
      this.t = 0;
      this.opts = o;
      this.def = S.Levels.def(o.act);
      this.zone = S.ZONES[this.def.zone];
      S.Audio.stopMusic();
      S.Audio.sfx('start');
    },
    update: function (g) {
      this.t++;
      if (this.t > 120 || S.Input.pressed('confirm')) {
        g.go('play', { charId: this.opts.charId, act: this.opts.act, carry: this.opts.carry });
      }
    },
    draw: function (ctx, g) {
      var t = this.t;
      ctx.fillStyle = '#05060c'; ctx.fillRect(0, 0, S.W, S.H);
      S.Gfx.drawBackground(ctx, this.def.theme, { x: t * 3, y: 60 }, t);
      ctx.save();
      ctx.globalAlpha = .55; ctx.fillStyle = '#05060c';
      ctx.fillRect(0, 0, S.W, S.H);
      ctx.restore();

      var slide = S.clamp(t / 18, 0, 1);
      var x = S.W / 2 + (1 - slide) * 260;
      ctx.save();
      ctx.translate(x - S.W / 2, 0);
      S.UI.panel(ctx, S.W / 2 - 220, 110, 440, 130, { border: this.zone.color });
      S.text(ctx, this.zone.name, S.W / 2, 158, {
        size: 28, align: 'center', color: this.zone.color, outline: 'rgba(0,0,0,.8)', outlineW: 6, shadow: false });
      S.text(ctx, 'ATO ' + this.def.act, S.W / 2, 190, {
        size: 20, align: 'center', color: '#ffffff', outline: 'rgba(0,0,0,.8)', outlineW: 5, shadow: false });
      S.text(ctx, this.zone.intro, S.W / 2, 216, { size: 12, align: 'center', color: '#c8d4f0', shadow: false });
      ctx.restore();

      var cx = -60 + t * 6;
      S.Gfx.drawChar(ctx, this.opts.charId, {
        x: cx, y: 276, state: 'run', t: t * 1.6, facing: 1, scale: 1.1 });
    }
  };
})();

/* ---------------- fase ---------------- */
(function () {
  'use strict';
  var S = window.S, Sc = S.Screens;

  function respawn(sess) {
    var lv = sess.level;
    sess.spawnEntities();
    S.Particles.reset();
    var cp = sess.checkpoint;
    var x = cp ? cp.x : lv.spawn.x;
    var y = cp ? cp.y : lv.spawn.y;
    sess.player = S.Player.create(sess.charId, x, y);
    if (S.Save.allEmeralds()) sess.player.canSuper = true;
    sess.rings = 0;
    sess.time = cp ? cp.time : 0;
    sess.phase = 'play'; sess.phaseT = 0;
    sess.boss = null; sess.bossActive = false; sess.bossDown = false;
    sess.cam.lock = null;
    sess.timeOver = false;
    sess.nextLife = 100;
    sess.cam.x = S.clamp(x - S.W / 2, 0, lv.pxW - S.W);
    sess.cam.y = S.clamp(y - S.H * .6, 0, lv.pxH - S.H);
    sess.restoreMusic();
  }
  Sc.respawn = respawn;

  Sc.play = {
    enter: function (g, o) {
      if (o && o.session) {
        this.sess = o.session;
        S.Game.session = this.sess;
        this.sess.phase = 'play';
        this.sess.restoreMusic();
        return;
      }
      var carry = (o && o.carry) || null;
      this.sess = S.newSession(o.charId, o.act, carry);
      S.Game.session = this.sess;
      this.sess.restoreMusic();
    },
    update: function (g) {
      var sess = this.sess, In = S.Input;
      if (In.pressed('pause') && sess.phase === 'play') {
        S.Audio.sfx('select');
        g.setState('pause', { play: this });
        return;
      }
      S.Play.update(sess);

      if (sess.phase === 'dead' && sess.phaseT > 40) {
        sess.lives--;
        if (sess.lives < 0) { g.go('gameover', { play: this }); }
        else { respawn(sess); }
        return;
      }
      if (sess.phase === 'clear' && sess.phaseT > 150) {
        sess.phase = 'results';
        g.go('results', { play: this });
      }
    },
    draw: function (ctx, g) { S.Play.draw(ctx, this.sess); }
  };

  /* ---------------- pausa ---------------- */
  Sc.pause = {
    enter: function (g, o) {
      this.play = o.play; this.sel = 0; this.t = 0;
      if (S.Audio.musicBus) S.Audio.musicBus.gain.value = S.Save.data.options.music * .3;
    },
    exit: function () {
      if (S.Audio.musicBus) S.Audio.musicBus.gain.value = S.Save.data.options.music;
    },
    items: [{ label: 'CONTINUAR' }, { label: 'REINICIAR ATO' }, { label: 'SAIR PARA O MENU' }],
    update: function (g) {
      this.t++;
      var In = S.Input;
      S.nav(this, this.items.length);
      if (In.pressed('pause') || In.pressed('back')) { S.Audio.sfx('cancel'); g.setState('play', { session: this.play.sess }); return; }
      if (In.pressed('confirm')) {
        S.Audio.sfx('select');
        if (this.sel === 0) g.setState('play', { session: this.play.sess });
        else if (this.sel === 1) {
          var s = this.play.sess;
          s.checkpoint = null;
          Sc.respawn(s);
          g.setState('play', { session: s });
        } else {
          S.Audio.stopMusic();
          g.go('menu');
        }
      }
    },
    draw: function (ctx, g) {
      S.Play.draw(ctx, this.play.sess);
      ctx.save();
      ctx.globalAlpha = .6; ctx.fillStyle = '#05060c';
      ctx.fillRect(0, 0, S.W, S.H);
      ctx.restore();
      S.UI.panel(ctx, S.W / 2 - 150, 92, 300, 176);
      S.text(ctx, 'PAUSA', S.W / 2, 130, {
        size: 28, align: 'center', color: '#ffd23c', outline: '#3a1d00', outlineW: 5, shadow: false });
      S.UI.menu(ctx, this.items, this.sel, S.W / 2, 176, { gap: 32, size: 17, w: 270 });
      S.UI.hint(ctx, 'ENTER confirmar  •  P/ESC volta ao jogo', 252);
    }
  };
})();

/* ---------------- resultados do ato ---------------- */
(function () {
  'use strict';
  var S = window.S, Sc = S.Screens;

  function timeBonus(frames) {
    var s = Math.floor(frames / 60);
    if (s < 30) return 50000;
    if (s < 45) return 10000;
    if (s < 60) return 5000;
    if (s < 90) return 4000;
    if (s < 120) return 3000;
    if (s < 180) return 2000;
    if (s < 240) return 1000;
    if (s < 300) return 500;
    return 0;
  }

  Sc.results = {
    enter: function (g, o) {
      this.play = o.play;
      var s = this.play.sess;
      this.t = 0;
      this.timeB = timeBonus(s.time);
      this.ringB = s.rings * 100;
      this.phase = 0;
      this.total = s.score;
      S.Audio.playMusic('results');
      S.Save.recordAct(s.def.id, s.time, s.score + this.timeB + this.ringB);
      if (s.actIndex + 1 < S.Levels.count()) S.Save.unlock(s.actIndex + 1);
    },
    update: function (g) {
      this.t++;
      var s = this.play.sess;
      if (this.t > 60) {
        if (this.timeB > 0) {
          var d = Math.min(this.timeB, 100);
          this.timeB -= d; s.score += d;
          if (this.t % 3 === 0) S.Audio.sfx('move');
        } else if (this.ringB > 0) {
          var r = Math.min(this.ringB, 100);
          this.ringB -= r; s.score += r;
          if (this.t % 3 === 0) S.Audio.sfx('move');
        } else if (this.phase === 0) {
          this.phase = 1; this.doneT = this.t;
          S.Audio.sfx('life');
          if (s.score > S.Save.data.highScore) { S.Save.data.highScore = s.score; S.Save.save(); }
        }
      }
      if (this.phase === 1 && (this.t - this.doneT > 90 || S.Input.pressed('confirm'))) {
        S.Audio.stopMusic();
        var next = s.actIndex + 1;
        var carry = { score: s.score, lives: s.lives, continues: s.continues };
        if (next >= S.Levels.count()) g.go('ending', { sess: s });
        else g.go('zoneintro', { charId: s.charId, act: next, carry: carry });
      }
    },
    draw: function (ctx, g) {
      var s = this.play.sess, t = this.t;
      S.Gfx.drawBackground(ctx, s.level.theme, { x: t * 1.4, y: 60 }, t);
      ctx.save(); ctx.globalAlpha = .5; ctx.fillStyle = '#05060c';
      ctx.fillRect(0, 0, S.W, S.H); ctx.restore();

      S.text(ctx, s.def.name, S.W / 2, 52, {
        size: 20, align: 'center', color: '#ffffff', outline: 'rgba(0,0,0,.8)', outlineW: 5, shadow: false });
      S.text(ctx, 'ATO CONCLUIDO', S.W / 2, 84, {
        size: 30, align: 'center', color: '#ffd23c', outline: '#3a1d00', outlineW: 6, shadow: false });

      S.UI.panel(ctx, S.W / 2 - 180, 104, 360, 150);
      var rows = [
        ['BONUS DE TEMPO', S.pad(this.timeB, 5)],
        ['BONUS DE ANEIS', S.pad(this.ringB, 5)],
        ['TEMPO', S.fmtTime(s.time)],
        ['PONTOS', S.pad(s.score, 6)]
      ];
      for (var i = 0; i < rows.length; i++) {
        var y = 136 + i * 30;
        S.text(ctx, rows[i][0], S.W / 2 - 160, y, { size: 14, color: '#9fe2ff', shadow: false });
        S.text(ctx, rows[i][1], S.W / 2 + 160, y, { size: 16, color: '#ffffff', align: 'right', shadow: false });
      }

      S.Gfx.drawChar(ctx, s.charId, {
        x: S.W / 2, y: S.H - 36, state: 'victory', t: t, facing: 1, scale: 1.25 });

      if (this.phase === 1 && Math.floor(t / 22) % 2 === 0) {
        S.UI.hint(ctx, 'ENTER para continuar', S.H - 10);
      }
    }
  };

  /* ---------------- fim de jogo ---------------- */
  Sc.gameover = {
    enter: function (g, o) {
      this.play = o.play; this.t = 0; this.sel = 0;
      S.Audio.playMusic('gameover');
      var s = this.play.sess;
      if (s.score > S.Save.data.highScore) { S.Save.data.highScore = s.score; S.Save.save(); }
    },
    update: function (g) {
      this.t++;
      var s = this.play.sess;
      var items = this.items();
      S.nav(this, items.length);
      if (this.t > 60 && S.Input.pressed('confirm')) {
        S.Audio.sfx('select');
        if (items[this.sel].key === 'continue') {
          s.continues--;
          s.lives = S.Save.data.options.lives;
          s.score = 0;
          S.Audio.stopMusic();
          Sc.respawn(s);
          g.go('play', { session: s });
        } else {
          S.Audio.stopMusic();
          g.go('title');
        }
      }
    },
    items: function () {
      var s = this.play.sess;
      var list = [];
      if (s.continues > 0) list.push({ label: 'CONTINUAR (' + s.continues + ')', key: 'continue' });
      list.push({ label: 'VOLTAR AO TITULO', key: 'title' });
      return list;
    },
    draw: function (ctx, g) {
      var t = this.t;
      ctx.fillStyle = '#0a0410'; ctx.fillRect(0, 0, S.W, S.H);
      ctx.save();
      ctx.globalAlpha = .3;
      S.Gfx.drawBackground(ctx, 'congresso', { x: t * .3, y: 40 }, t);
      ctx.restore();
      var drop = Math.min(120, t * 4);
      S.text(ctx, 'FIM DE JOGO', S.W / 2, 40 + drop, {
        size: 42, align: 'center', color: '#ff5c5c', outline: '#2a0000', outlineW: 7, shadow: false });
      if (t > 50) {
        S.text(ctx, 'PONTOS: ' + S.pad(this.play.sess.score, 6), S.W / 2, 208, {
          size: 15, align: 'center', color: '#ffffff', shadow: false });
        S.UI.menu(ctx, this.items(), this.sel, S.W / 2, 252, { gap: 32, size: 17, w: 300 });
      }
    }
  };
})();

/* ---------------- fase especial ---------------- */
(function () {
  'use strict';
  var S = window.S, Sc = S.Screens;

  Sc.special = {
    enter: function (g, o) {
      this.sess = o.session;
      var sess = this.sess;
      var idx = sess.def.emerald;
      S.Particles.reset();
      S.Special.start(idx, sess.charId, function (win) {
        if (win) {
          S.Save.data.emeralds[idx] = true;
          S.Save.save();
          sess.score += 10000;
          sess.emeraldWon = true;
          if (S.Save.allEmeralds()) sess.player.canSuper = true;
        }
        sess.rings = Math.max(0, sess.rings - 50);
        S.Game.go('play', { session: sess });
      });
    },
    update: function (g) {
      if (S.Special.state) S.Special.update(S.Special.state);
      S.Particles.update();
    },
    draw: function (ctx, g) {
      if (S.Special.state) S.Special.draw(ctx, S.Special.state);
      else { ctx.fillStyle = '#05060c'; ctx.fillRect(0, 0, S.W, S.H); }
    }
  };

  /* ---------------- final ---------------- */
  Sc.ending = {
    enter: function (g, o) {
      this.sess = o.sess;
      this.t = 0;
      this.good = S.Save.allEmeralds();
      S.Audio.playMusic('ending');
      S.Save.unlock(S.Levels.count() - 1);
      S.Save.data.seenIntro = true;
      S.Save.save();
    },
    update: function (g) {
      this.t++;
      if (this.t > 140 && S.Input.pressed('confirm')) { S.Audio.stopMusic(); g.go('title'); }
    },
    draw: function (ctx, g) {
      var t = this.t, s = this.sess;
      S.Gfx.drawBackground(ctx, 'congresso', { x: t * 1.6, y: 30 }, t);
      ctx.save(); ctx.globalAlpha = .35; ctx.fillStyle = '#05060c';
      ctx.fillRect(0, 0, S.W, S.H); ctx.restore();

      S.text(ctx, this.good ? 'FINAL VERDADEIRO' : 'PARABENS!', S.W / 2, 56, {
        size: 30, align: 'center', color: '#ffd23c', outline: '#3a1d00', outlineW: 6, shadow: false });

      var msg = this.good
        ? ['Com as seis Esmeraldas do Caos reunidas,', 'a fortaleza do Eggman desabou no mar.',
           'A paz voltou as colinas esmeralda.']
        : ['O Eggman fugiu, mas os animais estao livres!', 'Algumas Esmeraldas do Caos ainda estao por ai...',
           'Tente de novo para ver o final verdadeiro.'];
      for (var i = 0; i < msg.length; i++) {
        S.text(ctx, msg[i], S.W / 2, 104 + i * 24, {
          size: 14, align: 'center', color: '#e6ecff', outline: 'rgba(0,0,0,.6)', outlineW: 3, shadow: false });
      }

      for (var e = 0; e < 6; e++) {
        var ex = S.W / 2 + (e - 2.5) * 44;
        var ey = 196 + Math.sin(t * .05 + e) * 6;
        if (S.Save.data.emeralds[e]) S.Gfx.emerald(ctx, ex, ey, S.HUD.EMCOL[e], t + e * 20, 1.25);
        else {
          ctx.save(); ctx.globalAlpha = .25; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
          S.poly(ctx, [ex, ey - 12, ex + 9, ey - 4, ex + 6, ey + 9, ex - 6, ey + 9, ex - 9, ey - 4]);
          ctx.stroke(); ctx.restore();
        }
      }

      var chars = ['lula', 'bolsonaro', 'renan'];
      for (var c = 0; c < 3; c++) {
        S.Gfx.drawChar(ctx, chars[c], {
          x: S.W / 2 + (c - 1) * 86, y: 276,
          state: c === 1 ? 'victory' : 'idle', t: t + c * 24, facing: c === 2 ? -1 : 1,
          scale: 1.1, superForm: this.good && c === 1
        });
      }

      S.text(ctx, 'PONTUACAO FINAL  ' + S.pad(s ? s.score : 0, 6), S.W / 2, 246, {
        size: 15, align: 'center', color: '#ffffff', outline: 'rgba(0,0,0,.7)', outlineW: 4, shadow: false });

      if (t > 140 && Math.floor(t / 24) % 2 === 0) S.UI.hint(ctx, 'ENTER para voltar ao titulo', S.H - 8);
    }
  };
})();
