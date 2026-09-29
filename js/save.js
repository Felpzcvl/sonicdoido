/* ============================================================
   save.js — progresso e opções em localStorage
   ============================================================ */
(function () {
  'use strict';
  var S = window.S;
  var KEY = 'sonic_emerald_rush_v1';

  var DEFAULTS = {
    highScore: 50000,
    unlockedAct: 0,          // índice do ato mais avançado liberado
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
      try {
        var raw = localStorage.getItem(KEY);
        if (raw) {
          var d = JSON.parse(raw);
          this.data = this.merge(clone(DEFAULTS), d);
        }
      } catch (e) { this.data = clone(DEFAULTS); }
      // personagem salvo de uma versao antiga
      if (window.S.Gfx && !window.S.Gfx.CHARS[this.data.favChar]) this.data.favChar = DEFAULTS.favChar;
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

    emeraldCount: function () {
      var n = 0;
      for (var i = 0; i < this.data.emeralds.length; i++) if (this.data.emeralds[i]) n++;
      return n;
    },

    allEmeralds: function () { return this.emeraldCount() >= this.data.emeralds.length; },

    unlock: function (actIndex) {
      if (actIndex > this.data.unlockedAct) { this.data.unlockedAct = actIndex; this.save(); }
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
