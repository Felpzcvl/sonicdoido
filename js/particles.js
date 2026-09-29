/* ============================================================
   particles.js — partículas e pop-ups de pontuação
   ============================================================ */
(function () {
  'use strict';
  var S = window.S;

  function P() { this.dead = true; }

  var Particles = S.Particles = {
    list: [],
    reset: function () { this.list.length = 0; },

    spawn: function (o) {
      var p = null;
      for (var i = 0; i < this.list.length; i++) if (this.list[i].dead) { p = this.list[i]; break; }
      if (!p) { p = new P(); this.list.push(p); }
      p.dead = false;
      p.type = o.type || 'spark';
      p.x = o.x; p.y = o.y;
      p.vx = o.vx || 0; p.vy = o.vy || 0;
      p.g = o.g === undefined ? .16 : o.g;
      p.life = o.life || 30; p.max = p.life;
      p.size = o.size || 4;
      p.color = o.color || '#ffd23c';
      p.text = o.text || '';
      p.rot = o.rot || 0; p.vr = o.vr || 0;
      return p;
    },

    burst: function (x, y, n, o) {
      o = o || {};
      for (var i = 0; i < n; i++) {
        var a = o.angle === undefined ? Math.random() * Math.PI * 2 : o.angle + S.rand(-.6, .6);
        var sp = S.rand(o.minSpeed || 1, o.maxSpeed || 4);
        this.spawn({
          type: o.type || 'spark', x: x, y: y,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          g: o.g, life: o.life || S.randInt(18, 34),
          size: o.size || S.rand(2, 5), color: o.color || '#ffd23c'
        });
      }
    },

    popup: function (x, y, text, color) {
      this.spawn({ type: 'text', x: x, y: y, vy: -1.1, g: .02, life: 52, text: text, color: color || '#ffffff' });
    },

    update: function () {
      for (var i = 0; i < this.list.length; i++) {
        var p = this.list[i];
        if (p.dead) continue;
        p.x += p.vx; p.y += p.vy; p.vy += p.g;
        p.rot += p.vr;
        if (p.type === 'dust') { p.vx *= .92; p.size += .12; }
        if (p.type === 'splash') p.vx *= .97;
        if (--p.life <= 0) p.dead = true;
      }
    },

    draw: function (ctx, cam) {
      for (var i = 0; i < this.list.length; i++) {
        var p = this.list[i];
        if (p.dead) continue;
        var x = p.x - cam.x, y = p.y - cam.y;
        if (x < -40 || x > S.W + 40 || y < -40 || y > S.H + 40) continue;
        var a = Math.min(1, p.life / (p.max * .5));
        ctx.save();
        ctx.globalAlpha = a;
        if (p.type === 'text') {
          S.text(ctx, p.text, x, y, { size: 13, color: p.color, align: 'center', outline: 'rgba(0,0,0,.7)', outlineW: 3, shadow: false });
        } else if (p.type === 'star') {
          ctx.translate(x, y); ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          S.poly(ctx, [0, -p.size, p.size * .4, -p.size * .3, p.size, 0,
                       p.size * .4, p.size * .3, 0, p.size, -p.size * .4, p.size * .3,
                       -p.size, 0, -p.size * .4, -p.size * .3]);
          ctx.fill();
        } else if (p.type === 'dust') {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = a * .55;
          S.circle(ctx, x, y, p.size); ctx.fill();
        } else if (p.type === 'shard') {
          ctx.translate(x, y); ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (p.type === 'splash') {
          ctx.fillStyle = p.color;
          S.ellipse(ctx, x, y, p.size, p.size * .6, 0); ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          S.circle(ctx, x, y, p.size); ctx.fill();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = a * .4;
          S.circle(ctx, x, y, p.size * 2); ctx.fill();
        }
        ctx.restore();
      }
    }
  };
})();
