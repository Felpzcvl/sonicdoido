/* ============================================================
   audio.js — sintetizador de efeitos + trilha chiptune
   Tudo gerado via WebAudio (sem arquivos externos).
   ============================================================ */
(function () {
  'use strict';
  var S = window.S;

  var A = S.Audio = {
    ctx: null, master: null, musicBus: null, sfxBus: null,
    ready: false, musicVol: .6, sfxVol: .8,
    song: null, step: 0, nextTime: 0, playing: false,
    currentId: null, tempoScale: 1,

    init: function () {
      if (this.ctx) return;
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      this.ctx = new C();
      this.master = this.ctx.createGain();
      this.master.gain.value = .9;
      this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.musicVol;
      var mComp = this.ctx.createDynamicsCompressor();
      this.musicBus.connect(mComp); mComp.connect(this.master);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = this.sfxVol;
      this.sfxBus.connect(this.master);
      this.ready = true;
    },

    resume: function () {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },

    setMusicVol: function (v) { this.musicVol = v; if (this.musicBus) this.musicBus.gain.value = v; },
    setSfxVol: function (v) {
      this.sfxVol = v;
      if (this.sfxBus) this.sfxBus.gain.value = v;
      for (var k in this._voiceEls || {}) this._voiceEls[k].volume = Math.min(1, v);
    },

    tone: function (o) {
      if (!this.ready) return;
      var ctx = this.ctx, t0 = ctx.currentTime + (o.delay || 0);
      var osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = o.type || 'square';
      osc.frequency.setValueAtTime(o.freq, t0);
      if (o.to) {
        if (o.exp !== false) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.to), t0 + o.dur);
        else osc.frequency.linearRampToValueAtTime(o.to, t0 + o.dur);
      }
      var vol = (o.vol === undefined ? .3 : o.vol);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + (o.atk || .006));
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
      if (o.detune) osc.detune.value = o.detune;
      osc.connect(g); g.connect(o.bus || this.sfxBus);
      osc.start(t0); osc.stop(t0 + o.dur + .05);
    },

    noise: function (o) {
      if (!this.ready) return;
      var ctx = this.ctx, t0 = ctx.currentTime + (o.delay || 0);
      var len = Math.max(1, Math.floor(ctx.sampleRate * o.dur));
      var buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      var src = ctx.createBufferSource(); src.buffer = buf;
      var f = ctx.createBiquadFilter();
      f.type = o.filter || 'bandpass';
      f.frequency.setValueAtTime(o.freq || 1200, t0);
      if (o.to) f.frequency.exponentialRampToValueAtTime(Math.max(40, o.to), t0 + o.dur);
      f.Q.value = o.q || 1.2;
      var g = ctx.createGain();
      g.gain.setValueAtTime(o.vol === undefined ? .3 : o.vol, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
      src.connect(f); f.connect(g); g.connect(o.bus || this.sfxBus);
      src.start(t0); src.stop(t0 + o.dur + .02);
    }
  };
})();

/* ---------------- biblioteca de efeitos ---------------- */
(function () {
  'use strict';
  var A = window.S.Audio;

  A.sfx = function (name) {
    if (!this.ready) { this.init(); if (!this.ready) return; }
    var T = this.tone.bind(this), N = this.noise.bind(this);
    switch (name) {
      case 'jump':     T({ freq: 300, to: 760, dur: .16, type: 'square', vol: .18 }); break;
      case 'ring':     T({ freq: 988, dur: .09, type: 'sine', vol: .22 });
                       T({ freq: 1318, dur: .18, type: 'sine', vol: .22, delay: .06 }); break;
      case 'ringbig':  T({ freq: 1318, dur: .1, type: 'triangle', vol: .25 });
                       T({ freq: 1760, dur: .25, type: 'triangle', vol: .25, delay: .07 }); break;
      case 'spring':   T({ freq: 420, to: 1500, dur: .22, type: 'triangle', vol: .26 }); break;
      case 'spindash': T({ freq: 180, to: 900, dur: .22, type: 'sawtooth', vol: .13 }); break;
      case 'release':  T({ freq: 900, to: 140, dur: .3, type: 'sawtooth', vol: .16 });
                       N({ freq: 2400, to: 400, dur: .3, vol: .16 }); break;
      case 'hurt':     T({ freq: 220, to: 90, dur: .35, type: 'square', vol: .2 }); break;
      case 'ringloss': N({ freq: 2600, to: 700, dur: .4, vol: .22 });
                       T({ freq: 660, to: 220, dur: .35, type: 'triangle', vol: .12 }); break;
      case 'pop':      N({ freq: 1800, to: 200, dur: .22, vol: .3 });
                       T({ freq: 520, to: 120, dur: .2, type: 'square', vol: .12 }); break;
      case 'break':    N({ freq: 900, to: 160, dur: .32, vol: .3, filter: 'lowpass' }); break;
      case 'box':      T({ freq: 660, dur: .06, type: 'square', vol: .2 });
                       T({ freq: 880, dur: .12, type: 'square', vol: .2, delay: .06 }); break;
      case 'shield':   T({ freq: 400, to: 1200, dur: .3, type: 'sine', vol: .2 });
                       T({ freq: 600, to: 1800, dur: .3, type: 'sine', vol: .12, delay: .04 }); break;
      case 'invinc':   T({ freq: 700, to: 2000, dur: .35, type: 'triangle', vol: .2 }); break;
      case 'shoes':    T({ freq: 500, to: 1400, dur: .2, type: 'sawtooth', vol: .16 }); break;
      case 'life':     [523, 659, 784, 1046].forEach(function (f, i) {
                         T({ freq: f, dur: .18, type: 'triangle', vol: .22, delay: i * .1 }); }); break;
      case 'check':    T({ freq: 784, dur: .1, type: 'square', vol: .2 });
                       T({ freq: 1174, dur: .2, type: 'square', vol: .2, delay: .09 }); break;
      case 'goal':     [659, 784, 988, 1318].forEach(function (f, i) {
                         T({ freq: f, dur: .22, type: 'square', vol: .2, delay: i * .08 }); }); break;
      case 'select':   T({ freq: 880, dur: .05, type: 'square', vol: .17 }); break;
      case 'move':     T({ freq: 520, dur: .04, type: 'square', vol: .12 }); break;
      case 'cancel':   T({ freq: 400, to: 200, dur: .12, type: 'square', vol: .15 }); break;
      case 'start':    T({ freq: 660, dur: .08, type: 'square', vol: .22 });
                       T({ freq: 990, dur: .08, type: 'square', vol: .22, delay: .08 });
                       T({ freq: 1320, dur: .25, type: 'square', vol: .22, delay: .16 }); break;
      case 'die':      T({ freq: 440, to: 80, dur: .9, type: 'triangle', vol: .22, exp: false }); break;
      case 'bosshit':  N({ freq: 500, to: 120, dur: .3, vol: .3, filter: 'lowpass' });
                       T({ freq: 200, to: 60, dur: .3, type: 'square', vol: .2 }); break;
      case 'explode':  N({ freq: 700, to: 60, dur: .7, vol: .38, filter: 'lowpass' }); break;
      case 'laser':    T({ freq: 1600, to: 300, dur: .25, type: 'sawtooth', vol: .16 }); break;
      case 'emerald':  [784, 988, 1318, 1568, 2093].forEach(function (f, i) {
                         T({ freq: f, dur: .3, type: 'sine', vol: .2, delay: i * .09 }); }); break;
      case 'splash':   N({ freq: 1200, to: 300, dur: .35, vol: .25 }); break;
      case 'bubble':   T({ freq: 700, to: 1400, dur: .12, type: 'sine', vol: .14 }); break;
      case 'skid':     N({ freq: 3000, to: 1200, dur: .12, vol: .1 }); break;
      case 'warn':     T({ freq: 880, dur: .1, type: 'square', vol: .2 });
                       T({ freq: 880, dur: .1, type: 'square', vol: .2, delay: .2 }); break;
      case 'dash':     T({ freq: 200, to: 1200, dur: .18, type: 'sawtooth', vol: .15 }); break;
      case 'fly':      T({ freq: 300, to: 420, dur: .08, type: 'sine', vol: .08 }); break;
      case 'glide':    N({ freq: 900, dur: .2, vol: .06, filter: 'bandpass' }); break;
      case 'hint':     T({ freq: 1046, dur: .12, type: 'sine', vol: .18 }); break;
    }
  };
})();

/* ---------------- motor de música ---------------- */
(function () {
  'use strict';
  var A = window.S.Audio;
  A.songs = {};

  A.playMusic = function (id, opts) {
    this.init();
    if (!this.ready) return;
    var ts = (opts && opts.tempoScale) || 1;
    if (this.currentId === id && this.playing && this.tempoScale === ts) return;
    this.currentId = id;
    this.song = this.songs[id];
    if (!this.song) { this.playing = false; return; }
    this.step = 0;
    this.nextTime = this.ctx.currentTime + .06;
    this.playing = true;
    this.tempoScale = ts;
  };

  A.stopMusic = function () {
    this.playing = false; this.currentId = null;
    if (this.stopBossTheme) this.stopBossTheme();
  };
  A.mtof = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };

  A.tick = function () {
    if (!this.playing || !this.song || !this.ready) return;
    var stepDur = (60 / this.song.bpm / 4) / this.tempoScale;
    var lookahead = this.ctx.currentTime + .15;
    var guard = 0;
    while (this.nextTime < lookahead && guard++ < 48) {
      this.scheduleStep(this.step, this.nextTime, stepDur);
      this.step++;
      this.nextTime += stepDur;
    }
  };

  A.scheduleStep = function (step, when, dur) {
    var s = this.song, bus = this.musicBus, self = this;
    function play(arr, type, vol, len, oct) {
      if (!arr || !arr.length) return;
      var n = arr[step % arr.length];
      if (!n) return;
      var osc = self.ctx.createOscillator(), g = self.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(self.mtof(n + (oct || 0) * 12), when);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(vol, when + .008);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur * len);
      osc.connect(g); g.connect(bus);
      osc.start(when); osc.stop(when + dur * len + .03);
    }
    play(s.lead, s.leadType || 'square', .13, s.leadLen || 1.5);
    play(s.harm, s.harmType || 'square', .07, 1.2);
    play(s.bass, 'triangle', .19, 1.4);
    if (s.arp) play(s.arp, 'square', .05, .8);
    if (s.drum) {
      var d = s.drum[step % s.drum.length], dl = when - this.ctx.currentTime;
      if (dl < 0) dl = 0;
      if (d === 1) this.noise({ freq: 160, to: 60, dur: .1, vol: .2, filter: 'lowpass', bus: bus, delay: dl });
      else if (d === 2) this.noise({ freq: 2200, dur: .07, vol: .12, filter: 'highpass', bus: bus, delay: dl });
      else if (d === 3) this.noise({ freq: 1400, dur: .18, vol: .16, filter: 'bandpass', bus: bus, delay: dl });
    }
  };
})();

/* ---------------- trilhas (composições originais) ---------------- */
(function () {
  'use strict';
  var G = window.S.Audio.songs;

  G.title = {
    bpm: 132,
    lead: [76, 0, 79, 0, 83, 0, 79, 0, 81, 0, 78, 0, 74, 0, 0, 0,
           76, 0, 79, 0, 83, 0, 86, 0, 84, 0, 83, 0, 79, 0, 0, 0],
    harm: [71, 0, 74, 0, 76, 0, 74, 0, 74, 0, 71, 0, 69, 0, 0, 0,
           71, 0, 74, 0, 76, 0, 79, 0, 76, 0, 74, 0, 71, 0, 0, 0],
    bass: [47, 0, 47, 0, 54, 0, 47, 0, 45, 0, 45, 0, 52, 0, 45, 0,
           47, 0, 47, 0, 54, 0, 47, 0, 43, 0, 43, 0, 50, 0, 50, 0],
    drum: [1, 0, 2, 0, 3, 0, 2, 0, 1, 0, 2, 0, 3, 0, 2, 2]
  };

  G.zone1 = {
    bpm: 150,
    lead: [72, 0, 76, 79, 0, 76, 72, 0, 74, 0, 77, 81, 0, 77, 74, 0,
           76, 0, 79, 83, 0, 79, 76, 0, 77, 76, 74, 72, 0, 0, 71, 0],
    harm: [64, 0, 67, 72, 0, 67, 64, 0, 65, 0, 69, 72, 0, 69, 65, 0,
           67, 0, 72, 76, 0, 72, 67, 0, 69, 67, 65, 64, 0, 0, 62, 0],
    bass: [48, 48, 0, 55, 48, 0, 48, 55, 50, 50, 0, 57, 50, 0, 50, 57,
           52, 52, 0, 59, 52, 0, 52, 59, 53, 0, 52, 0, 50, 0, 43, 0],
    drum: [1, 0, 2, 0, 3, 0, 2, 0, 1, 1, 2, 0, 3, 0, 2, 2]
  };

  G.zone2 = {
    bpm: 144, leadType: 'sawtooth',
    lead: [69, 0, 0, 72, 0, 76, 0, 74, 72, 0, 69, 0, 67, 0, 0, 0,
           71, 0, 0, 74, 0, 77, 0, 76, 74, 0, 71, 0, 69, 0, 0, 0],
    harm: [57, 0, 0, 60, 0, 64, 0, 62, 60, 0, 57, 0, 55, 0, 0, 0,
           59, 0, 0, 62, 0, 65, 0, 64, 62, 0, 59, 0, 57, 0, 0, 0],
    bass: [45, 0, 45, 45, 0, 45, 52, 0, 45, 0, 45, 43, 0, 43, 50, 0,
           47, 0, 47, 47, 0, 47, 54, 0, 45, 0, 45, 0, 40, 0, 40, 0],
    arp:  [69, 72, 76, 81, 76, 72, 69, 64, 67, 71, 74, 79, 74, 71, 67, 62],
    drum: [1, 0, 2, 2, 3, 0, 2, 0, 1, 0, 2, 2, 3, 0, 2, 3]
  };

  G.zone3 = {
    bpm: 158,
    lead: [79, 78, 79, 0, 74, 0, 71, 0, 72, 0, 74, 0, 76, 0, 79, 0,
           81, 79, 78, 0, 76, 0, 74, 0, 71, 0, 74, 0, 67, 0, 0, 0],
    harm: [67, 66, 67, 0, 62, 0, 59, 0, 60, 0, 62, 0, 64, 0, 67, 0,
           69, 67, 66, 0, 64, 0, 62, 0, 59, 0, 62, 0, 55, 0, 0, 0],
    bass: [43, 43, 50, 43, 43, 50, 43, 43, 41, 41, 48, 41, 41, 48, 41, 41,
           39, 39, 46, 39, 39, 46, 39, 39, 38, 38, 45, 38, 45, 38, 45, 45],
    drum: [1, 2, 2, 0, 3, 2, 1, 0, 1, 2, 2, 0, 3, 2, 3, 2]
  };

  G.boss = {
    bpm: 168, leadType: 'sawtooth',
    lead: [64, 64, 0, 64, 0, 63, 64, 0, 67, 0, 66, 0, 64, 0, 0, 0,
           62, 62, 0, 62, 0, 61, 62, 0, 65, 0, 64, 0, 62, 0, 59, 0],
    bass: [40, 40, 40, 47, 40, 40, 47, 40, 40, 40, 40, 47, 43, 43, 45, 46],
    drum: [1, 2, 1, 2, 3, 2, 1, 2, 1, 2, 1, 2, 3, 3, 2, 3]
  };

  G.invincible = {
    bpm: 190,
    lead: [84, 86, 88, 91, 88, 86, 84, 81, 84, 86, 88, 93, 91, 88, 86, 84],
    harm: [72, 74, 76, 79, 76, 74, 72, 69, 72, 74, 76, 81, 79, 76, 74, 72],
    bass: [48, 48, 55, 55, 48, 48, 55, 55, 50, 50, 57, 57, 52, 52, 59, 59],
    drum: [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]
  };

  G.results = {
    bpm: 140,
    lead: [72, 76, 79, 84, 0, 83, 79, 0, 76, 79, 83, 88, 0, 0, 0, 0],
    harm: [60, 64, 67, 72, 0, 71, 67, 0, 64, 67, 71, 76, 0, 0, 0, 0],
    bass: [48, 0, 55, 0, 53, 0, 50, 0, 52, 0, 55, 0, 48, 0, 0, 0],
    drum: [1, 0, 2, 0, 1, 0, 2, 2, 1, 0, 2, 0, 1, 1, 3, 0]
  };

  G.special = {
    bpm: 160, leadType: 'triangle',
    lead: [81, 0, 83, 0, 84, 0, 88, 0, 86, 0, 84, 0, 83, 0, 79, 0],
    harm: [69, 0, 71, 0, 72, 0, 76, 0, 74, 0, 72, 0, 71, 0, 67, 0],
    bass: [45, 45, 52, 45, 47, 47, 54, 47, 48, 48, 55, 48, 50, 50, 57, 50],
    arp:  [81, 84, 88, 93, 88, 84, 81, 76, 79, 83, 86, 91, 86, 83, 79, 74],
    drum: [1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 2, 2, 2]
  };

  G.gameover = {
    bpm: 96,
    lead: [69, 0, 0, 0, 67, 0, 0, 0, 65, 0, 0, 0, 64, 0, 0, 0],
    bass: [45, 0, 0, 0, 43, 0, 0, 0, 41, 0, 0, 0, 40, 0, 0, 0],
    drum: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
  };

  G.ending = {
    bpm: 128,
    lead: [72, 0, 74, 0, 76, 0, 79, 0, 81, 0, 79, 0, 76, 0, 0, 0,
           77, 0, 79, 0, 81, 0, 84, 0, 83, 0, 81, 0, 79, 0, 0, 0],
    harm: [60, 0, 62, 0, 64, 0, 67, 0, 69, 0, 67, 0, 64, 0, 0, 0,
           65, 0, 67, 0, 69, 0, 72, 0, 71, 0, 69, 0, 67, 0, 0, 0],
    bass: [48, 0, 48, 55, 0, 48, 0, 55, 53, 0, 53, 60, 0, 53, 0, 60,
           50, 0, 50, 57, 0, 50, 0, 57, 43, 0, 43, 50, 0, 43, 0, 50],
    drum: [1, 0, 2, 0, 3, 0, 2, 0, 1, 0, 2, 0, 3, 0, 2, 2]
  };

  G.drowning = { bpm: 200, lead: [84, 0, 84, 0, 84, 0, 0, 0], bass: [48, 0, 48, 0, 48, 0, 0, 0] };
})();

/* ---------------- vozes dos personagens ---------------- */
(function () {
  'use strict';
  var A = window.S.Audio;

  A.voices = {
    lula: 'audio/lula.mp3',
    bolsonaro: 'audio/bolsonaro.mp3',
    alexandre: 'audio/alexandre.mp3',
    renan: 'audio/renan.mp3'
  };
  A._voiceEls = {};
  A._voiceNow = null;
  A._ducked = false;

  A.preloadVoices = function () {
    for (var id in this.voices) {
      if (this._voiceEls[id]) continue;
      var el = new Audio(this.voices[id]);
      el.preload = 'auto';
      el.volume = Math.min(1, this.sfxVol);
      el.addEventListener('ended', A._onVoiceEnd);
      this._voiceEls[id] = el;
    }
  };

  A._onVoiceEnd = function () { A.unduck(); A._voiceNow = null; };

  /* abaixa a musica enquanto a fala toca */
  A.duck = function () {
    if (this._ducked || !this.musicBus) return;
    this._ducked = true;
    try { this.musicBus.gain.value = this.musicVol * 0.18; } catch (e) {}
  };
  A.unduck = function () {
    if (!this._ducked || !this.musicBus) return;
    this._ducked = false;
    try { this.musicBus.gain.value = this.musicVol; } catch (e) {}
  };

  A.voiceIsPlaying = function () {
    return !!(this._voiceNow && !this._voiceNow.paused);
  };

  A.stopVoice = function () {
    var el = this._voiceNow;
    this._voiceNow = null;
    this.unduck();
    if (!el) return;
    try { el.pause(); el.currentTime = 0; } catch (e) {}
  };

  A.voice = function (id) {
    this.resume();
    this.preloadVoices();
    var el = this._voiceEls[id];
    if (!el) return;
    if (this._voiceNow && this._voiceNow !== el) {
      try { this._voiceNow.pause(); this._voiceNow.currentTime = 0; } catch (e) {}
    }
    this._voiceNow = el;
    el.volume = Math.min(1, this.sfxVol);
    this.duck();
    try { el.currentTime = 0; } catch (e) {}
    var p = el.play();
    if (p && p.catch) p.catch(function () { A.unduck(); });
  };
})();

/* ---------------- tema do chefe (arquivo) ---------------- */
(function () {
  'use strict';
  var A = window.S.Audio;

  A.BOSS_THEME = 'audio/boss-daniel.mp3';
  A._bossEl = null;

  A.bossThemeEl = function () {
    if (!this._bossEl) {
      var el = new Audio(this.BOSS_THEME);
      el.preload = 'auto';
      el.loop = true;
      el.volume = Math.min(1, this.musicVol);
      this._bossEl = el;
    }
    return this._bossEl;
  };

  A.playBossTheme = function () {
    this.resume();
    this.stopMusic();
    var el = this.bossThemeEl();
    el.volume = Math.min(1, this.musicVol);
    try { el.currentTime = 0; } catch (e) {}
    var p = el.play();
    if (p && p.catch) p.catch(function () {});
    this.bossPlaying = true;
  };

  A.stopBossTheme = function () {
    if (!this._bossEl) return;
    try { this._bossEl.pause(); this._bossEl.currentTime = 0; } catch (e) {}
    this.bossPlaying = false;
  };

  A.bossThemeIsPlaying = function () {
    return !!(this._bossEl && !this._bossEl.paused);
  };

  /* o volume da musica tambem controla o tema do chefe */
  var setMusic = A.setMusicVol;
  A.setMusicVol = function (v) {
    setMusic.call(this, v);
    if (this._bossEl) this._bossEl.volume = Math.min(1, v);
  };
})();
