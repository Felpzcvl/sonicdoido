/* ============================================================
   save.js — progresso e opções em localStorage
   ============================================================ */
(function () {
  'use strict';
  var S = window.S;
  var KEY = 'sonic_emerald_rush_v1';

  var DEFAULTS = {
    highScore: 50000,
    unlockedAct: 99,         // todas as fases liberadas desde o inicio
    emeralds: [false, false, false, false, false, false],
    bestTimes: {},           // actId -> frames
    bestScores: {},          // actId -> score
    cleared: {},             // actId -> true
    favChar: 'lula',
    seenIntro: false,
    totalRings: 0,
    options: {
      music: 0.6,
      sfx: 0.8,
      lives: 3,
      difficulty: 1,   // 0 fácil, 1 normal, 2 difícil
      touch: true,
      showFps: false,
      scanlines: true,
      shake: true
    }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  var Save = S.Save = {
    data: clone(DEFAULTS),

    load: function () {
      this.data = clone(DEFAULTS);
      try {
        var raw = localStorage.getItem(KEY);
        if (raw) this.data = this.merge(clone(DEFAULTS), JSON.parse(raw));
      } catch (e) { this.data = clone(DEFAULTS); }
      // personagem salvo de uma versao antiga
      if (window.S.Gfx && !window.S.Gfx.CHARS[this.data.favChar]) this.data.favChar = DEFAULTS.favChar;
      // todas as fases ficam liberadas, inclusive em saves antigos
      this.data.unlockedAct = this.lastAct();
      return this.data;
    },

    merge: function (base, over) {
      for (var k in over) {
        if (!over.hasOwnProperty(k)) continue;
        if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) &&
            over[k] && typeof over[k] === 'object' && !Array.isArray(over[k])) {
          base[k] = this.merge(base[k], over[k]);
        } else if (over[k] !== undefined && over[k] !== null) {
          base[k] = over[k];
        }
      }
      return base;
    },

    save: function () {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) {}
    },

    reset: function () {
      this.data = clone(DEFAULTS);
      this.save();
    },

    /* indice do ultimo ato existente */
    lastAct: function () {
      return (window.S.ACTS ? window.S.ACTS.length : 6) - 1;
    },

    /* primeiro ato ainda nao zerado, para o "continuar" */
    nextAct: function () {
      var A = window.S.ACTS || [];
      for (var i = 0; i < A.length; i++) if (!this.data.cleared[A[i].id]) return i;
      return Math.max(0, A.length - 1);
    },

    clearedCount: function () {
      var A = window.S.ACTS || [], n = 0;
      for (var i = 0; i < A.length; i++) if (this.data.cleared[A[i].id]) n++;
      return n;
    },

    emeraldCount: function () {
      var n = 0;
      for (var i = 0; i < this.data.emeralds.length; i++) if (this.data.emeralds[i]) n++;
      return n;
    },

    allEmeralds: function () { return this.emeraldCount() >= this.data.emeralds.length; },

    unlock: function (actIndex) {
      this.data.unlockedAct = this.lastAct();
    },

    recordAct: function (actId, frames, score) {
      var d = this.data;
      d.cleared[actId] = true;
      if (!d.bestTimes[actId] || frames < d.bestTimes[actId]) d.bestTimes[actId] = frames;
      if (!d.bestScores[actId] || score > d.bestScores[actId]) d.bestScores[actId] = score;
      if (score > d.highScore) d.highScore = score;
      this.save();
    }
  };
})();
