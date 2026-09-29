/* ============================================================
   levels.js — zonas, atos e ordem dos blocos
   ============================================================ */
(function () {
  'use strict';
  var S = window.S;

  S.ZONES = [
    { id: 'hill',     name: 'EMERALD HILL',    theme: 'hill',     music: 'zone1',
      color: '#3fc34a', intro: 'Colinas verdes, loopings e liberdade.' },
    { id: 'lagoon',   name: 'CHEMICAL LAGOON', theme: 'lagoon',   music: 'zone2',
      color: '#b46ef0', intro: 'Tubos, quimicos e pontes instaveis.' },
    { id: 'fortress', name: 'SKY FORTRESS',    theme: 'fortress', music: 'zone3',
      color: '#ff7b2e', intro: 'A fortaleza voadora do Dr. Eggman.' }
  ];

  S.ACTS = [
    {
      id: 'z1a1', zone: 0, act: 1, name: 'EMERALD HILL — ATO 1', emerald: 0,
      time: 36000, theme: 'hill',
      chunks: ['start', 'flat', 'hill', 'badniks', 'loop', 'gap', 'check',
               'springs', 'bighill', 'dashrun', 'ringroom', 'tower', 'goal']
    },
    {
      id: 'z1a2', zone: 0, act: 2, name: 'EMERALD HILL — ATO 2', emerald: 1,
      time: 36000, theme: 'hill', boss: { type: 'wrecker', hits: 8 },
      chunks: ['start', 'hill', 'spikepit', 'badniks', 'valley', 'loop', 'check',
               'bounce', 'stairs', 'xblocks', 'tunnel', 'ringroom',
               'arenaIn', 'arena', 'arena', 'goal']
    },
    {
      id: 'z2a1', zone: 1, act: 1, name: 'CHEMICAL LAGOON — ATO 1', emerald: 2,
      time: 36000, theme: 'lagoon',
      chunks: ['start', 'bridge', 'badniks', 'tunnel', 'gap', 'check',
               'springs', 'sky', 'ringroom', 'loop', 'tower', 'goal']
    },
    {
      id: 'z2a2', zone: 1, act: 2, name: 'CHEMICAL LAGOON — ATO 2', emerald: 3,
      time: 36000, theme: 'lagoon', boss: { type: 'driller', hits: 8 },
      chunks: ['start', 'valley', 'xblocks', 'bridge', 'spikepit', 'check',
               'bounce', 'badniks', 'tunnel', 'bighill', 'ringroom',
               'arenaIn', 'arena', 'arena', 'goal']
    },
    {
      id: 'z3a1', zone: 2, act: 1, name: 'SKY FORTRESS — ATO 1', emerald: 4,
      time: 36000, theme: 'fortress',
      chunks: ['start', 'sky', 'gap', 'stairs', 'badniks', 'check',
               'bounce', 'spikepit', 'tower', 'dashrun', 'loop', 'ringroom', 'goal']
    },
    {
      id: 'z3a2', zone: 2, act: 2, name: 'SKY FORTRESS — ATO FINAL', emerald: 5,
      time: 36000, theme: 'fortress', boss: { type: 'egglaser', hits: 10 },
      chunks: ['start', 'spikepit', 'sky', 'tunnel', 'badniks', 'check',
               'stairs', 'gap', 'bounce', 'xblocks', 'ringroom',
               'arenaIn', 'arena', 'arena', 'goal']
    }
  ];

  S.Levels = {
    count: function () { return S.ACTS.length; },
    def: function (i) { return S.ACTS[S.clamp(i, 0, S.ACTS.length - 1)]; },

    build: function (i) {
      var def = this.def(i);
      var lv = S.Level.build(def);
      lv.index = i;

      // anel gigante para a fase especial (se o bloco não trouxe um)
      var has = false, e;
      for (e = 0; e < lv.entities.length; e++) if (lv.entities[e].kind === 'biring') has = true;
      if (!has) {
        var bx = lv.goalX - 460;
        var g = S.Level.groundSense(lv, bx, 96, 420, { fromAbove: true });
        if (g) lv.entities.push({ kind: 'biring', x: bx, y: g.y - 4 });
      }

      // arena do chefe
      if (def.boss) {
        var arenaStart = def.chunks.indexOf('arenaIn');
        lv.bossX = (arenaStart + 1.5) * S.CHUNK_W * S.TILE;
        lv.bossGateX = (arenaStart + 1) * S.CHUNK_W * S.TILE;
        lv.bossEndX = (arenaStart + 3) * S.CHUNK_W * S.TILE;
      }
      return lv;
    }
  };
})();
