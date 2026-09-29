/* ============================================================
   levels.js — zonas, atos e ordem dos blocos
   ============================================================ */
(function () {
  'use strict';
  var S = window.S;

  S.ZONES = [
    { id: 'camara', name: 'CAMARA DOS DEPUTADOS', theme: 'camara', music: 'zone1',
      color: '#e6a758', intro: 'Plenario, madeira e o painel de votacao.' },
    { id: 'senado', name: 'SENADO FEDERAL', theme: 'senado', music: 'zone2',
      color: '#7fb6ff', intro: 'Azul, ouro no teto e sessao em andamento.' },
    { id: 'stf', name: 'SUPREMO TRIBUNAL', theme: 'stf', music: 'zone3',
      color: '#ff9a3c', intro: 'A Justica na praca, ao por do sol.' }
  ];

  S.ACTS = [
    {
      id: 'z1a1', zone: 0, act: 1, name: 'CAMARA DOS DEPUTADOS — ATO 1', emerald: 0,
      time: 36000, theme: 'camara',
      chunks: ['start', 'flat', 'hill', 'badniks', 'loop', 'gap', 'check',
               'springs', 'bighill', 'dashrun', 'ringroom', 'tower', 'goal']
    },
    {
      id: 'z1a2', zone: 0, act: 2, name: 'CAMARA DOS DEPUTADOS — ATO 2', emerald: 1,
      time: 36000, theme: 'camara', boss: { type: 'wrecker', hits: 8 },
      chunks: ['start', 'hill', 'spikepit', 'badniks', 'valley', 'loop', 'check',
               'bounce', 'stairs', 'xblocks', 'tunnel', 'ringroom',
               'arenaIn', 'arena', 'arena', 'goal']
    },
    {
      id: 'z2a1', zone: 1, act: 1, name: 'SENADO FEDERAL — ATO 1', emerald: 2,
      time: 36000, theme: 'senado',
      chunks: ['start', 'bridge', 'badniks', 'tunnel', 'gap', 'check',
               'springs', 'sky', 'ringroom', 'loop', 'tower', 'goal']
    },
    {
      id: 'z2a2', zone: 1, act: 2, name: 'SENADO FEDERAL — ATO 2', emerald: 3,
      time: 36000, theme: 'senado', boss: { type: 'driller', hits: 8 },
      chunks: ['start', 'valley', 'xblocks', 'bridge', 'spikepit', 'check',
               'bounce', 'badniks', 'tunnel', 'bighill', 'ringroom',
               'arenaIn', 'arena', 'arena', 'goal']
    },
    {
      id: 'z3a1', zone: 2, act: 1, name: 'SUPREMO TRIBUNAL — ATO 1', emerald: 4,
      time: 36000, theme: 'stf',
      chunks: ['start', 'sky', 'gap', 'stairs', 'badniks', 'check',
               'bounce', 'spikepit', 'tower', 'dashrun', 'loop', 'ringroom', 'goal']
    },
    {
      id: 'z3a2', zone: 2, act: 2, name: 'SUPREMO TRIBUNAL — ATO FINAL', emerald: 5,
      time: 36000, theme: 'stf', boss: { type: 'egglaser', hits: 10 },
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
