/* ============================================================
   level.js — montagem do mapa, colisão e pré-renderização
   ============================================================ */
(function () {
  'use strict';
  var S = window.S, T = S.TILE;

  var TILES = {
    '#': { solid: 1, mask: 'full' },
    'X': { solid: 1, mask: 'full', breakable: 1 },
    'T': { top: 1, mask: 'full' },
    '/': { solid: 1, mask: 'up' },
    '7': { solid: 1, mask: 'dn' },
    '^': { solid: 1, mask: 'spike', hazard: 1 },
    'v': { hazardCeil: 1 },
    '~': { water: 1, surface: 1 },
    'W': { water: 1 }
  };
  S.TILES = TILES;

  function maskH(m, col) {
    if (m === 'full') return 16;
    if (m === 'up') return col + 1;
    if (m === 'dn') return 16 - col;
    if (m === 'spike') return 10;
    return 0;
  }

  var OBJECTS = {
    'o': 'ring', '1': 'box:rings', '2': 'box:shield', '3': 'box:invinc',
    '4': 'box:shoes', '5': 'box:life', 's': 'spring:up', '>': 'spring:right',
    '<': 'spring:left', 'm': 'motobug', 'z': 'buzzbomber', 'c': 'crabmeat',
    'h': 'chopper', 'k': 'orbinaut', 'b': 'bat', 'K': 'checkpoint',
    'G': 'goal', 'D': 'dash', 'E': 'biring', 'P': 'spawn', 'Q': 'loop'
  };

  var Level = S.Level = {};

  Level.build = function (def) {
    var seq = def.chunks;
    var w = seq.length * S.CHUNK_W, h = S.MAP_H;
    var grid = [];
    var y, x, r;
    for (y = 0; y < h; y++) { grid.push(new Array(w).fill('.')); }

    var lv = {
      def: def, w: w, h: h, pxW: w * T, pxH: h * T,
      theme: def.theme, grid: grid, entities: [], loops: [], water: [],
      spawn: { x: 64, y: 300 }, goalX: w * T - 80, hasGoal: false,
      bossX: 0, name: def.name, id: def.id, isBoss: !!def.boss, boss: def.boss || null,
      parRings: 0
    };

    for (var ci = 0; ci < seq.length; ci++) {
      var ch = S.CHUNKS[seq[ci]];
      if (!ch) continue;
      var ox = ci * S.CHUNK_W;
      for (r = 0; r < ch.rows.length; r++) {
        var row = ch.rows[r], ty = ch.top + r;
        if (ty >= h) continue;
        for (x = 0; x < row.length; x++) {
          var c = row.charAt(x);
          if (c === '.') continue;
          var tx = ox + x;
          if (OBJECTS[c]) {
            Level.spawnObject(lv, OBJECTS[c], tx, ty);
          } else {
            grid[ty][tx] = c;
            if (c === 'W' || c === '~') lv.water.push({ tx: tx, ty: ty, surface: c === '~' });
          }
        }
      }
    }

    // teto e chão infinitos nas bordas
    lv.waterLevel = lv.water.length ? Math.min.apply(null, lv.water.map(function (o) { return o.ty * T; })) : null;

    Level.prerender(lv);
    return lv;
  };

  Level.spawnObject = function (lv, kind, tx, ty) {
    var px = tx * T + T / 2, py = ty * T + T;
    if (kind === 'spawn') { lv.spawn = { x: px, y: py }; return; }
    if (kind === 'goal') { lv.goalX = px; lv.hasGoal = true; }
    if (kind === 'loop') {
      lv.loops.push({ x: tx * T + T / 2, y: ty * T + T / 2, r: 72 });
      return;
    }
    lv.entities.push({ kind: kind, tx: tx, ty: ty, x: px, y: py });
    if (kind === 'ring') lv.parRings++;
  };

  /* -------- consultas -------- */
  Level.tile = function (lv, tx, ty) {
    if (tx < 0 || tx >= lv.w || ty < 0 || ty >= lv.h) return '.';
    return lv.grid[ty][tx];
  };

  Level.setTile = function (lv, tx, ty, c) {
    if (tx < 0 || tx >= lv.w || ty < 0 || ty >= lv.h) return;
    lv.grid[ty][tx] = c;
    var ctx = lv.canvas.getContext('2d');
    ctx.clearRect(tx * T, ty * T, T, T);
    Level.drawTile(ctx, lv, tx, ty);
  };

  /* Retorna a altura (0..16) de sólido a partir da base do tile */
  Level.tileHeight = function (ch, col) {
    var d = TILES[ch];
    if (!d) return 0;
    return maskH(d.mask, col);
  };

  /* Sensor para baixo. Devolve {y, ch, hazard} ou null.
     opts: {fromAbove:bool, prevBottom:number, ignoreTop:bool} */
  Level.groundSense = function (lv, x, y, range, opts) {
    opts = opts || {};
    var tx = Math.floor(x / T);
    if (tx < 0 || tx >= lv.w) return null;
    var col = ((x | 0) % T + T) % T;
    var ty0 = Math.floor((y - T) / T);
    var ty1 = Math.floor((y + range) / T);
    for (var ty = ty0; ty <= ty1; ty++) {
      var ch = Level.tile(lv, tx, ty);
      var d = TILES[ch];
      if (!d) continue;
      if (d.water) continue;
      if (d.top) {
        if (opts.ignoreTop) continue;
        if (!opts.fromAbove) continue;
      }
      if (!d.solid && !d.top) continue;
      var hgt = maskH(d.mask, col);
      if (hgt <= 0) continue;
      var surf = ty * T + (T - hgt);
      if (d.top && opts.prevBottom !== undefined && opts.prevBottom > surf + 6) continue;
      if (opts.minSurf !== undefined && surf < opts.minSurf) continue;
      if (surf >= y - T && surf <= y + range) {
        return { y: surf, ch: ch, hazard: !!d.hazard, top: !!d.top, tx: tx, ty: ty };
      }
    }
    return null;
  };

  /* Sensor para cima (teto). Devolve y da face inferior ou null */
  Level.ceilSense = function (lv, x, y, range) {
    var tx = Math.floor(x / T);
    if (tx < 0 || tx >= lv.w) return null;
    var ty1 = Math.floor(y / T);
    var ty0 = Math.floor((y - range) / T);
    for (var ty = ty1; ty >= ty0; ty--) {
      var ch = Level.tile(lv, tx, ty);
      var d = TILES[ch];
      if (!d || !d.solid) continue;
      if (d.mask !== 'full') continue;
      var bottom = ty * T + T;
      if (bottom <= y && bottom >= y - range) return { y: bottom, ch: ch, tx: tx, ty: ty };
    }
    return null;
  };

  /* Parede sólida (apenas tiles cheios) */
  Level.wallAt = function (lv, x, y) {
    var tx = Math.floor(x / T), ty = Math.floor(y / T);
    var ch = Level.tile(lv, tx, ty);
    var d = TILES[ch];
    if (!d || !d.solid) return null;
    if (d.mask !== 'full') return null;
    return { tx: tx, ty: ty, ch: ch };
  };

  Level.hazardCeilAt = function (lv, x, y) {
    var tx = Math.floor(x / T), ty = Math.floor(y / T);
    var d = TILES[Level.tile(lv, tx, ty)];
    return d && d.hazardCeil;
  };

  Level.isWater = function (lv, x, y) {
    var tx = Math.floor(x / T), ty = Math.floor(y / T);
    var d = TILES[Level.tile(lv, tx, ty)];
    return !!(d && d.water);
  };
})();

/* ---------- pré-renderização dos tiles ---------- */
(function () {
  'use strict';
  var S = window.S, T = S.TILE, Level = S.Level;

  function solidish(ch) { var d = S.TILES[ch]; return d && (d.solid || d.top); }

  Level.drawTile = function (ctx, lv, tx, ty) {
    var ch = lv.grid[ty][tx];
    var d = S.TILES[ch];
    if (!d || d.water) return;
    var th = S.Gfx.THEMES[lv.theme] || S.Gfx.THEMES.hill;
    var x = tx * T, y = ty * T;
    var above = Level.tile(lv, tx, ty - 1);
    var openAbove = !solidish(above) || S.TILES[above] && S.TILES[above].top;

    if (ch === '#') {
      dirt(ctx, th, x, y, tx, ty);
      if (openAbove) grassCap(ctx, th, x, y);
      if (!solidish(Level.tile(lv, tx - 1, ty))) edge(ctx, th, x, y, -1);
      if (!solidish(Level.tile(lv, tx + 1, ty))) edge(ctx, th, x, y, 1);
    } else if (ch === 'X') {
      ctx.fillStyle = th.dirt2;
      ctx.fillRect(x, y, T, T);
      ctx.fillStyle = th.grassLight;
      ctx.fillRect(x + 1, y + 1, T - 2, 2);
      ctx.fillStyle = th.edge;
      ctx.fillRect(x, y + T - 2, T, 2);
      ctx.fillStyle = th.accent;
      ctx.fillRect(x + 6, y + 6, 4, 4);
    } else if (ch === 'T') {
      ctx.fillStyle = th.edge;
      ctx.fillRect(x, y, T, 10);
      ctx.fillStyle = th.dirt;
      ctx.fillRect(x, y + 2, T, 7);
      ctx.fillStyle = th.grass;
      ctx.fillRect(x, y, T, 3);
      ctx.fillStyle = th.grassLight;
      ctx.fillRect(x, y, T, 1);
    } else if (ch === '/') {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, y + T); ctx.lineTo(x + T, y); ctx.lineTo(x + T, y + T);
      ctx.closePath(); ctx.clip();
      dirt(ctx, th, x, y, tx, ty);
      ctx.restore();
      slopeCap(ctx, th, x, y + T, x + T, y);
    } else if (ch === '7') {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + T, y + T); ctx.lineTo(x, y + T);
      ctx.closePath(); ctx.clip();
      dirt(ctx, th, x, y, tx, ty);
      ctx.restore();
      slopeCap(ctx, th, x, y, x + T, y + T);
    } else if (ch === '^') {
      ctx.fillStyle = th.edge;
      ctx.fillRect(x, y + 10, T, 6);
      ctx.fillStyle = '#9aa4b8';
      ctx.beginPath(); ctx.moveTo(x, y + 12); ctx.lineTo(x + 8, y - 2); ctx.lineTo(x + T, y + 12);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e4e9f5';
      ctx.beginPath(); ctx.moveTo(x + 4, y + 12); ctx.lineTo(x + 8, y - 1); ctx.lineTo(x + 9, y + 12);
      ctx.closePath(); ctx.fill();
    } else if (ch === 'v') {
      ctx.fillStyle = '#9aa4b8';
      ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x + 8, y + T + 2); ctx.lineTo(x + T, y + 2);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5a6172';
      ctx.fillRect(x, y, T, 3);
    }
  };

  function dirt(ctx, th, x, y, tx, ty) {
    var alt = ((tx + ty) & 1) === 0;
    ctx.fillStyle = alt ? th.dirt : th.dirt2;
    ctx.fillRect(x, y, T, T);
    ctx.fillStyle = 'rgba(0,0,0,.08)';
    ctx.fillRect(x, y + T - 3, T, 3);
  }

  function grassCap(ctx, th, x, y) {
    ctx.fillStyle = th.grass;
    ctx.fillRect(x, y, T, 6);
    ctx.fillStyle = th.grassLight;
    ctx.fillRect(x, y, T, 2);
    ctx.fillStyle = th.grassDark;
    ctx.fillRect(x, y + 6, T, 2);
  }

  function slopeCap(ctx, th, x1, y1, x2, y2) {
    ctx.save();
    ctx.lineCap = 'butt';
    ctx.strokeStyle = th.grass; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(x1, y1 + 3); ctx.lineTo(x2, y2 + 3); ctx.stroke();
    ctx.strokeStyle = th.grassLight; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y1 + 1); ctx.lineTo(x2, y2 + 1); ctx.stroke();
    ctx.restore();
  }

  function edge(ctx, th, x, y, dir) {
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    if (dir < 0) ctx.fillRect(x, y, 2, T); else ctx.fillRect(x + T - 2, y, 2, T);
  }

  Level.prerender = function (lv) {
    var c = S.mkCanvas(lv.pxW, lv.pxH);
    var ctx = c.getContext('2d');
    for (var ty = 0; ty < lv.h; ty++) {
      for (var tx = 0; tx < lv.w; tx++) {
        if (lv.grid[ty][tx] !== '.') Level.drawTile(ctx, lv, tx, ty);
      }
    }
    // decoração de fundo nas bordas de grama
    lv.canvas = c;
  };

  /* água desenhada dinamicamente por cima */
  Level.drawWater = function (ctx, lv, cam, t) {
    if (!lv.water.length) return;
    var th = S.Gfx.THEMES[lv.theme] || S.Gfx.THEMES.hill;
    ctx.save();
    ctx.fillStyle = th.water;
    for (var i = 0; i < lv.water.length; i++) {
      var w = lv.water[i];
      var x = w.tx * T - cam.x, y = w.ty * T - cam.y;
      if (x < -T || x > S.W || y < -T || y > S.H) continue;
      if (w.surface) {
        var off = Math.sin(t * .06 + w.tx * .5) * 2;
        ctx.fillRect(x, y + off, T, T - off);
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        ctx.fillRect(x, y + off, T, 2);
        ctx.fillStyle = th.water;
      } else {
        ctx.fillRect(x, y, T, T);
      }
    }
    ctx.restore();
  };
})();
