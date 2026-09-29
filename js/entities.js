/* ============================================================
   entities.js — anéis, itens, molas e badniks
   ============================================================ */
(function () {
  'use strict';
  var S = window.S;
  var E = S.Entities = {};

  E.base = function (spec) {
    return {
      kind: spec.kind, x: spec.x, y: spec.y, sx: spec.x, sy: spec.y,
      vx: 0, vy: 0, t: 0, cool: 0, alive: true, face: -1,
      w: 20, h: 20, ox: -10, oy: -20
    };
  };

  E.box = function (e) { return { x: e.x + e.ox, y: e.y + e.oy, w: e.w, h: e.h }; };

  E.make = {};

  E.create = function (spec, lv) {
    var kind = spec.kind;
    if (kind.indexOf('box:') === 0) return E.make.itembox(spec, kind.slice(4));
    if (kind.indexOf('spring:') === 0) return E.make.spring(spec, kind.slice(7));
    var f = E.make[kind];
    return f ? f(spec, lv) : null;
  };
})();

/* ---------------- anéis ---------------- */
(function () {
  'use strict';
  var S = window.S, E = S.Entities;

  E.make.ring = function (spec) {
    var e = E.base(spec);
    e.w = 20; e.h = 20; e.ox = -10; e.oy = -10;
    e.y = spec.y - 8;
    e.update = function (g) {
      this.t++;
      if (this.scattered) {
        this.vy += .19;
        this.x += this.vx; this.y += this.vy;
        var gr = S.Level.groundSense(g.level, this.x, this.y + 7, 8, { fromAbove: true });
        if (gr && this.vy > 0) { this.y = gr.y - 7; this.vy *= -.72; this.vx *= .96; }
        if (--this.ttl <= 0) { this.alive = false; return; }
        if (this.delay > 0) { this.delay--; return; }
      }
      var p = g.player;
      if (!p.dead && S.aabb(E.box(this), p.hitbox())) {
        this.alive = false;
        g.addRing(1);
        S.Particles.burst(this.x, this.y, 4, { color: '#ffe98a', maxSpeed: 2, life: 14, size: 2 });
      }
    };
    e.draw = function (ctx, cam) {
      var a = 1;
      if (this.scattered && this.ttl < 70) a = (Math.floor(this.ttl / 4) % 2) ? .25 : 1;
      ctx.globalAlpha = a;
      S.Gfx.ring(ctx, this.x - cam.x, this.y - cam.y, this.t + this.x);
      ctx.globalAlpha = 1;
    };
    return e;
  };

  E.scatterRings = function (g, x, y, n) {
    n = Math.min(n, 32);
    for (var i = 0; i < n; i++) {
      var r = E.make.ring({ kind: 'ring', x: x, y: y + 8 });
      r.scattered = true; r.ttl = 256; r.delay = 24;
      r.vx = (i % 2 ? 1 : -1) * (1 + Math.random() * 2.6);
      r.vy = -(2.4 + Math.random() * 2.6) + Math.floor(i / 8) * .8;
      g.entities.push(r);
    }
  };

  E.make.biring = function (spec) {
    var e = E.base(spec);
    e.w = 52; e.h = 52; e.ox = -26; e.oy = -52;
    e.update = function (g) {
      this.t++;
      if (this.cool > 0) { this.cool--; if (this.cool === 0) this.used = false; }
      var p = g.player;
      if (this.used || p.dead) return;
      if (!S.aabb(E.box(this), p.hitbox())) return;
      this.used = true;
      if (g.rings >= 50) { g.enterSpecial(); }
      else {
        S.Particles.popup(this.x, this.y - 62, 'PRECISA DE 50 ANEIS', '#ffd23c');
        S.Audio.sfx('cancel'); this.cool = 70;
      }
    };
    e.draw = function (ctx, cam) {
      var x = this.x - cam.x, y = this.y - cam.y - 26;
      var w = Math.abs(Math.cos(this.t * .04));
      ctx.save();
      ctx.lineWidth = 7; ctx.strokeStyle = '#b8860b';
      S.ellipse(ctx, x, y, Math.max(2, 26 * w), 26, 0); ctx.stroke();
      ctx.lineWidth = 4.5; ctx.strokeStyle = '#ffd23c';
      S.ellipse(ctx, x, y, Math.max(1.5, 24 * w), 24, 0); ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = .22 + Math.sin(this.t * .1) * .1;
      ctx.fillStyle = '#ffe98a';
      S.circle(ctx, x, y, 34); ctx.fill();
      ctx.restore();
    };
    return e;
  };
})();

/* ---------------- monitores, molas, turbo ---------------- */
(function () {
  'use strict';
  var S = window.S, E = S.Entities;

  E.make.itembox = function (spec, kind) {
    var e = E.base(spec);
    e.item = kind;
    e.w = 30; e.h = 30; e.ox = -15; e.oy = -30;
    e.broken = 0;
    e.update = function (g) {
      this.t++;
      if (this.broken) { this.broken--; if (this.broken <= 0) this.alive = false; return; }
      this.vy += .2;
      this.y += this.vy;
      var gr = S.Level.groundSense(g.level, this.x, this.y, 12, { fromAbove: true });
      if (gr && this.vy >= 0) { this.y = gr.y; this.vy = 0; }
      var p = g.player;
      if (p.dead) return;
      var pb = p.hitbox(), mb = E.box(this);
      if (!S.aabb(mb, pb)) return;
      var breaking = p.rolling || (!p.grounded && p.jumping) || p.invincTimer > 0 ||
                     p.superForm || (p.charId === 'knuckles' && p.gliding);
      if (breaking) { this.pop(g, p); return; }
      if (p.vy >= 0 && pb.y + pb.h - Math.max(1, p.vy) <= mb.y + 8) { p.landOn(mb.y); }
      else {
        if (pb.x + pb.w / 2 < mb.x + mb.w / 2) p.x = mb.x - p.rw - 1;
        else p.x = mb.x + mb.w + p.rw + 1;
        p.gsp = 0;
      }
    };
    e.pop = function (g, p) {
      this.broken = 22;
      if (p && !p.grounded && p.vy > 0) p.vy = -Math.abs(p.vy) * .8;
      S.Audio.sfx('box');
      S.Particles.burst(this.x, this.y - 15, 12, { type: 'shard', color: '#d9e6ff', maxSpeed: 4, life: 26, size: 4 });
      g.giveItem(this.item, this.x, this.y - 22);
    };
    e.draw = function (ctx, cam) {
      var cid = S.Game.session ? S.Game.session.charId : 'sonic';
      S.Gfx.itemBox(ctx, this.x - cam.x, this.y - 15 - cam.y, this.item, this.t, this.broken > 0, cid);
    };
    return e;
  };

  E.make.spring = function (spec, dir) {
    var e = E.base(spec);
    e.dir = dir || 'up';
    e.press = 0;
    e.w = 32; e.h = 20; e.ox = -16; e.oy = -20;
    if (e.dir === 'right' || e.dir === 'left') { e.w = 20; e.h = 34; e.ox = -10; e.oy = -34; }
    e.update = function (g) {
      this.t++;
      if (this.cool > 0) this.cool--;
      if (this.press > 0) this.press -= .1;
      var p = g.player;
      if (p.dead || this.cool > 0) return;
      if (!S.aabb(E.box(this), p.hitbox())) return;
      this.cool = 10; this.press = 1;
      S.Audio.sfx('spring');
      if (this.dir === 'up') p.launchUp(11.6);
      else p.launchSide(this.dir === 'right' ? 1 : -1, 10);
      S.Particles.burst(this.x, this.y - 10, 7, { color: '#ffffff', maxSpeed: 3, life: 16, size: 3 });
    };
    e.draw = function (ctx, cam) {
      S.Gfx.spring(ctx, this.x - cam.x, this.y - cam.y, this.dir, Math.max(0, this.press));
    };
    return e;
  };

  E.make.dash = function (spec) {
    var e = E.base(spec);
    e.w = 32; e.h = 14; e.ox = -16; e.oy = -14;
    e.update = function (g) {
      this.t++;
      if (this.cool > 0) { this.cool--; return; }
      var p = g.player;
      if (p.dead || !p.grounded) return;
      if (!S.aabb(E.box(this), p.hitbox())) return;
      this.cool = 26;
      p.gsp = (p.gsp >= 0 ? 1 : -1) * Math.max(9.5, Math.abs(p.gsp) + 3);
      p.face = p.gsp >= 0 ? 1 : -1;
      S.Audio.sfx('dash');
      S.Particles.burst(p.x, p.y - 10, 8, { color: '#9fe2ff', maxSpeed: 4, life: 18, size: 3 });
    };
    e.draw = function (ctx, cam) {
      var x = this.x - cam.x, y = this.y - cam.y;
      ctx.save();
      ctx.fillStyle = '#2b3245'; S.roundRect(ctx, x - 16, y - 11, 32, 11, 3); ctx.fill();
      for (var i = 0; i < 3; i++) {
        var o = ((this.t * 2 + i * 11) % 32);
        ctx.fillStyle = 'rgba(255,210,60,' + (0.9 - i * .22) + ')';
        S.poly(ctx, [x - 16 + o, y - 9, x - 10 + o, y - 5.5, x - 16 + o, y - 2]); ctx.fill();
      }
      ctx.restore();
    };
    return e;
  };

  E.make.checkpoint = function (spec) {
    var e = E.base(spec);
    e.w = 26; e.h = 52; e.ox = -13; e.oy = -52;
    e.on = false;
    e.update = function (g) {
      this.t++;
      if (this.on) return;
      var p = g.player;
      if (p.dead) return;
      if (!S.aabb(E.box(this), p.hitbox())) return;
      this.on = true;
      g.setCheckpoint(this.x, this.y);
      S.Audio.sfx('check');
      S.Particles.burst(this.x, this.y - 46, 14, { type: 'star', color: '#ffd23c', maxSpeed: 3.4, life: 30, size: 4 });
    };
    e.draw = function (ctx, cam) {
      S.Gfx.checkpoint(ctx, this.x - cam.x, this.y - cam.y, this.on, this.t);
    };
    return e;
  };

  E.make.goal = function (spec) {
    var e = E.base(spec);
    e.w = 44; e.h = 78; e.ox = -22; e.oy = -78;
    e.spin = 0; e.spinning = 0;
    e.update = function (g) {
      this.t++;
      if (this.spinning > 0) {
        this.spinning--;
        this.spin += Math.max(.06, this.spinning / 90) * .5;
        if (this.spinning === 0) this.spin = 0;
        return;
      }
      if (this.done || g.player.dead) return;
      if (!S.aabb(E.box(this), g.player.hitbox())) return;
      this.done = true; this.spinning = 110;
      g.finishAct();
    };
    e.draw = function (ctx, cam) {
      var cid = S.Game.session ? S.Game.session.charId : 'sonic';
      S.Gfx.goalSign(ctx, this.x - cam.x, this.y - cam.y, this.spin, 1, cid);
    };
    return e;
  };
})();

/* ---------------- badniks ---------------- */
(function () {
  'use strict';
  var S = window.S, E = S.Entities;

  E.destroy = function (e, g, p) {
    e.alive = false;
    g.enemyKilled(e.x, e.y);
    if (p && !p.grounded) {
      if (p.vy > 0) p.vy = -Math.min(6.5, Math.abs(p.vy) + 1.2);
      else p.vy += 1.2;
    }
  };

  E.touch = function (e, g, opts) {
    var p = g.player;
    if (p.dead || !e.alive) return;
    if (!S.aabb(E.box(e), p.hitbox())) return;
    if (p.isAttacking() && !(opts && opts.armored)) E.destroy(e, g, p);
    else p.hurt(e.x);
  };

  E.patrol = function (e, g, speed) {
    var lv = g.level;
    e.x += e.face * speed;
    var probe = S.Level.groundSense(lv, e.x + e.face * 12, e.y - 2, 16, { fromAbove: true });
    var wall = S.Level.wallAt(lv, e.x + e.face * 14, e.y - 10);
    if (!probe || wall) { e.face *= -1; e.x += e.face * speed * 2; }
    var gr = S.Level.groundSense(lv, e.x, e.y - 4, 18, { fromAbove: true });
    if (gr) e.y = gr.y;
  };

  E.make.motobug = function (spec) {
    var e = E.base(spec);
    e.w = 30; e.h = 26; e.ox = -15; e.oy = -26;
    e.update = function (g) {
      this.t++;
      if (!g.nearCamera(this.x, 360)) return;
      E.patrol(this, g, .82);
      if (this.t % 10 === 0) {
        S.Particles.spawn({ type: 'dust', x: this.x - this.face * 14, y: this.y - 3,
          vx: -this.face * .4, vy: -.2, g: -.01, life: 18, size: 2.4, color: '#cfd7e8' });
      }
      E.touch(this, g);
    };
    e.draw = function (ctx, cam) { S.Gfx.badnik.motobug(ctx, this.x - cam.x, this.y - cam.y, this.t, this.face); };
    return e;
  };

  E.make.crabmeat = function (spec) {
    var e = E.base(spec);
    e.w = 40; e.h = 24; e.ox = -20; e.oy = -24;
    e.phase = 0;
    e.update = function (g) {
      this.t++;
      if (!g.nearCamera(this.x, 360)) return;
      this.phase++;
      if (this.phase < 90) { E.patrol(this, g, .45); }
      else if (this.phase === 110) {
        S.Audio.sfx('laser');
        for (var s = -1; s <= 1; s += 2) {
          g.entities.push(E.make.shot({ kind: 'shot', x: this.x + s * 24, y: this.y - 18 },
            { vx: s * 1.7, vy: -2.6, grav: .12, style: 'ball' }));
        }
      } else if (this.phase > 150) { this.phase = 0; this.face *= -1; }
      E.touch(this, g);
    };
    e.draw = function (ctx, cam) { S.Gfx.badnik.crabmeat(ctx, this.x - cam.x, this.y - cam.y, this.t, this.face); };
    return e;
  };

  E.make.buzzbomber = function (spec) {
    var e = E.base(spec);
    e.w = 34; e.h = 24; e.ox = -17; e.oy = -18;
    e.y = spec.y - 24;
    e.update = function (g) {
      this.t++;
      if (!g.nearCamera(this.x, 400)) return;
      this.x += this.face * 1.1;
      this.y = this.sy - 24 + Math.sin(this.t * .06) * 6;
      if (Math.abs(this.x - this.sx) > 110) this.face *= -1;
      var p = g.player;
      if (this.cool > 0) this.cool--;
      else if (Math.abs(p.x - this.x) < 56 && p.y > this.y && this.face === S.sgn(p.x - this.x)) {
        this.cool = 150;
        S.Audio.sfx('laser');
        g.entities.push(E.make.shot({ kind: 'shot', x: this.x + this.face * 20, y: this.y + 4 },
          { vx: this.face * 1.6, vy: 2.2, grav: 0, style: 'laser' }));
      }
      E.touch(this, g);
    };
    e.draw = function (ctx, cam) { S.Gfx.badnik.buzzbomber(ctx, this.x - cam.x, this.y - cam.y, this.t, this.face); };
    return e;
  };

  E.make.chopper = function (spec) {
    var e = E.base(spec);
    e.w = 28; e.h = 22; e.ox = -14; e.oy = -14;
    e.base = spec.y + 60;
    e.y = e.base;
    e.update = function (g) {
      this.t++;
      if (!g.nearCamera(this.x, 320)) return;
      this.vy += .18;
      this.y += this.vy;
      if (this.y > this.base) { this.y = this.base; this.vy = -5.6; }
      E.touch(this, g);
    };
    e.draw = function (ctx, cam) {
      S.Gfx.badnik.chopper(ctx, this.x - cam.x, this.y - cam.y, this.t, this.vy < 0 ? -1 : 1);
    };
    return e;
  };

  E.make.orbinaut = function (spec) {
    var e = E.base(spec);
    e.w = 24; e.h = 24; e.ox = -12; e.oy = -12;
    e.y = spec.y - 40;
    e.update = function (g) {
      this.t++;
      if (!g.nearCamera(this.x, 360)) return;
      this.y = this.sy - 40 + Math.sin(this.t * .03) * 22;
      var p = g.player;
      if (p.dead) return;
      // orbes espinhados machucam sempre
      for (var i = 0; i < 4; i++) {
        var a = this.t * .04 + i * Math.PI / 2;
        var ox = this.x + Math.cos(a) * 26, oy = this.y + Math.sin(a) * 26;
        if (S.aabb({ x: ox - 10, y: oy - 10, w: 20, h: 20 }, p.hitbox())) { p.hurt(ox); return; }
      }
      E.touch(this, g);
    };
    e.draw = function (ctx, cam) { S.Gfx.badnik.orbinaut(ctx, this.x - cam.x, this.y - cam.y, this.t); };
    return e;
  };

  E.make.bat = function (spec) {
    var e = E.base(spec);
    e.w = 30; e.h = 24; e.ox = -15; e.oy = -12;
    e.y = spec.y - 70;
    e.update = function (g) {
      this.t++;
      if (!g.nearCamera(this.x, 380)) return;
      var p = g.player;
      var dx = p.x - this.x, dy = (p.y - 20) - this.y;
      var d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      this.vx = S.approach(this.vx, dx / d * 1.5, .05);
      this.vy = S.approach(this.vy, dy / d * 1.1, .05);
      this.x += this.vx; this.y += this.vy + Math.sin(this.t * .1) * .5;
      this.face = this.vx < 0 ? -1 : 1;
      E.touch(this, g);
    };
    e.draw = function (ctx, cam) { S.Gfx.badnik.bat(ctx, this.x - cam.x, this.y - cam.y, this.t, this.face); };
    return e;
  };

  E.make.shot = function (spec, o) {
    var e = E.base(spec);
    o = o || {};
    e.w = 14; e.h = 14; e.ox = -7; e.oy = -7;
    e.vx = o.vx || 0; e.vy = o.vy || 0;
    e.grav = o.grav === undefined ? .1 : o.grav;
    e.style = o.style || 'ball';
    e.life = o.life || 260;
    e.update = function (g) {
      this.t++;
      this.vy += this.grav;
      this.x += this.vx; this.y += this.vy;
      if (--this.life <= 0) { this.alive = false; return; }
      if (S.Level.groundSense(g.level, this.x, this.y, 6, { fromAbove: true }) && this.grav > 0) {
        this.alive = false;
        S.Particles.burst(this.x, this.y, 5, { color: '#ffb02e', maxSpeed: 2, life: 14, size: 3 });
        return;
      }
      var p = g.player;
      if (!p.dead && S.aabb(E.box(this), p.hitbox())) {
        this.alive = false;
        if (p.invincTimer > 0 || p.superForm) return;
        p.hurt(this.x);
      }
    };
    e.draw = function (ctx, cam) { S.Gfx.projectile(ctx, this.x - cam.x, this.y - cam.y, this.style, this.t); };
    return e;
  };
})();
