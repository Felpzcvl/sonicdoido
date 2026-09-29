/* ============================================================
   player.js — física clássica de plataforma (estilo Genesis)
   ============================================================ */
(function () {
  'use strict';
  var S = window.S, L = S.Level;

  var K = {
    ACC: 0.046875, FRC: 0.046875, DEC: 0.5, AIR: 0.09375,
    GRV: 0.21875, JMP: 6.6, TOP: 6,
    ROLLFRC: 0.0234375, ROLLDEC: 0.125,
    SLOPE: 0.125, SLOPEUP: 0.078125, SLOPEDOWN: 0.3125,
    MAXFALL: 16, MAXX: 16
  };
  S.PHYS = K;

  S.Player = {};

  S.Player.create = function (charId, x, y) {
    var def = S.Gfx.CHARS[charId] || S.Gfx.CHARS.sonic;
    var p = {
      charId: charId, def: def,
      x: x, y: y, prevY: y,
      gsp: 0, vx: 0, vy: 0, angle: 0,
      grounded: false, rolling: false, jumping: false, jumpHeld: false,
      face: 1, rw: 10, hStand: 38, hRoll: 30,
      state: 'idle', animT: 0,
      ctrlLock: 0, spinRev: 0, spindash: false,
      crouch: false, lookup: false, pushing: false,
      invulnTimer: 0, invincTimer: 0, shoesTimer: 0,
      shield: null, superForm: false, superTimer: 0,
      hurtTimer: 0, dead: false, deadTimer: 0,
      flying: false, flyTimer: 0, flyUp: 0,
      gliding: false, glideSpd: 0, climbing: false, slideTimer: 0,
      dropCharge: 0, dropReady: false,
      inWater: false, air: 1800,
      controlEnabled: true, goalLock: false,
      scoreChain: 0, standTimer: 0, idleTimer: 0
    };

    p.height = function () { return this.rolling || this.jumping || this.spindash ? this.hRoll : this.hStand; };

    p.hitbox = function () {
      var h = this.height();
      return { x: this.x - this.rw, y: this.y - h, w: this.rw * 2, h: h };
    };

    p.isAttacking = function () {
      if (this.invincTimer > 0 || this.superForm) return true;
      if (this.spindash) return true;
      if (this.rolling) return true;
      if (!this.grounded && this.jumping && !this.flying) return true;
      if (this.charId === 'knuckles' && this.gliding) return true;
      return false;
    };

    p.topSpeed = function () {
      var t = this.def.top;
      if (this.superForm) t = 10;
      else if (this.shoesTimer > 0) t = 11;
      if (this.inWater) t *= .55;
      return t;
    };

    p.accel = function () {
      var a = K.ACC;
      if (this.superForm) a = 0.1875;
      else if (this.shoesTimer > 0) a = 0.09375;
      if (this.inWater) a *= .5;
      return a;
    };

    p.jumpForce = function () {
      var j = this.def.jump;
      if (this.inWater) j = 3.6;
      return j;
    };

    p.landOn = function (surfY) {
      if (this.vy < 0) return;
      this.y = surfY;
      this.grounded = true; this.jumping = false; this.flying = false;
      this.gliding = false; this.vy = 0;
      if (this.gsp === 0) this.gsp = this.vx;
    };

    p.launchUp = function (force) {
      this.vy = -force; this.grounded = false; this.jumping = false;
      this.rolling = false; this.spindash = false; this.flying = false;
      this.gliding = false; this.climbing = false;
      this.ctrlLock = 0;
      this.state = 'spring';
      this.springTimer = 26;
    };

    p.launchSide = function (dir, force) {
      this.gsp = dir * force; this.vx = dir * force; this.face = dir;
      this.ctrlLock = 16;
      this.gliding = false; this.climbing = false;
      if (!this.grounded) this.vy = Math.min(this.vy, 0);
    };

    p.hurt = function (srcX) {
      if (this.invulnTimer > 0 || this.dead || this.invincTimer > 0 || this.superForm) return;
      var g = S.Game.session;
      if (this.shield) {
        this.shield = null;
        S.Audio.sfx('hurt');
      } else if (g.rings > 0) {
        S.Entities.scatterRings(g, this.x, this.y - 20, g.rings);
        g.rings = 0;
        S.Audio.sfx('ringloss');
      } else {
        this.die();
        return;
      }
      this.invulnTimer = 120;
      this.hurtTimer = 40;
      this.grounded = false; this.rolling = false; this.jumping = false;
      this.spindash = false; this.flying = false; this.gliding = false; this.climbing = false;
      this.vy = -4;
      this.vx = (this.x < srcX ? -1 : 1) * 2;
      this.gsp = 0;
      this.state = 'hurt';
      S.Game.shake(6);
    };

    p.die = function () {
      if (this.dead) return;
      this.dead = true;
      this.deadTimer = 0;
      this.vy = -7; this.vx = 0; this.gsp = 0;
      this.grounded = false;
      this.state = 'dead';
      S.Audio.stopMusic();
      S.Audio.sfx('die');
    };

    return p;
  };
})();

/* ---------------- colisões auxiliares ---------------- */
(function () {
  'use strict';
  var S = window.S, L = S.Level, K = S.PHYS;

  function wallCollide(p, lv) {
    var ys = [p.y - 10, p.y - p.height() + 8];
    var hit = false;
    for (var i = 0; i < ys.length; i++) {
      var y = ys[i];
      var wr = L.wallAt(lv, p.x + p.rw + 1, y);
      if (wr) { p.x = wr.tx * S.TILE - p.rw - 1; hit = 1; }
      var wl = L.wallAt(lv, p.x - p.rw - 1, y);
      if (wl) { p.x = (wl.tx + 1) * S.TILE + p.rw + 1; hit = -1; }
    }
    if (hit) {
      if (p.grounded) {
        if ((hit === 1 && p.gsp > 0) || (hit === -1 && p.gsp < 0)) { p.gsp = 0; p.pushing = true; }
      } else {
        if ((hit === 1 && p.vx > 0) || (hit === -1 && p.vx < 0)) { p.vx = 0; p.gsp = 0; }
      }
      p.wallSide = hit;
    } else { p.pushing = false; p.wallSide = 0; }
    if (p.x < p.rw + 2) { p.x = p.rw + 2; if (p.gsp < 0) p.gsp = 0; if (p.vx < 0) p.vx = 0; }
    var maxX = lv.pxW - p.rw - 2;
    if (p.x > maxX) { p.x = maxX; if (p.gsp > 0) p.gsp = 0; if (p.vx > 0) p.vx = 0; }
  }

  function ceilCollide(p, lv) {
    var top = p.y - p.height();
    var c1 = L.ceilSense(lv, p.x - 8, top, 12);
    var c2 = L.ceilSense(lv, p.x + 8, top, 12);
    var c = null;
    if (c1 && c2) c = c1.y > c2.y ? c1 : c2; else c = c1 || c2;
    if (c && c.y > top) {
      p.y = c.y + p.height();
      if (p.vy < 0) p.vy = 0;
    }
    if (L.hazardCeilAt(lv, p.x, top - 2)) p.hurt(p.x);
  }

  function senseGround(p, lv, range, extra) {
    var o = { fromAbove: true, prevBottom: p.prevY };
    if (extra) for (var k in extra) o[k] = extra[k];
    var a = L.groundSense(lv, p.x - 9, p.y, range, o);
    var b = L.groundSense(lv, p.x + 9, p.y, range, o);
    if (!a && !b) return null;
    var best = (!a) ? b : (!b) ? a : (a.y <= b.y ? a : b);
    var ang = 0;
    if (a && b) ang = Math.atan2(b.y - a.y, 18);
    best.angle = S.clamp(ang, -0.95, 0.95);
    best.hazard = (a && a.hazard) || (b && b.hazard);
    return best;
  }

  S.Player.wallCollide = wallCollide;
  S.Player.ceilCollide = ceilCollide;
  S.Player.senseGround = senseGround;
})();

/* ---------------- atualização no chão ---------------- */
(function () {
  'use strict';
  var S = window.S, L = S.Level, K = S.PHYS;

  S.Player.groundUpdate = function (p, g, inx, ctrl) {
    var lv = g.level, In = S.Input;
    p.jumping = false; p.flying = false; p.gliding = false; p.climbing = false;
    p.dropCharge = 0; p.dropReady = false; p.flyTimer = 0;

    if (p.spindash) {
      if (ctrl && In.held('down')) {
        if (In.pressed('jump')) {
          p.spinRev = Math.min(8, p.spinRev + 2);
          S.Audio.sfx('spindash');
          S.Particles.burst(p.x - p.face * 12, p.y - 5, 5,
            { color: '#ffffff', maxSpeed: 2.4, life: 13, size: 2 });
        }
        p.spinRev -= (p.spinRev / 0.125) / 256;
        if (p.spinRev < 0) p.spinRev = 0;
      } else {
        p.spindash = false; p.rolling = true; p.crouch = false;
        p.gsp = (8 + Math.floor(p.spinRev) / 2) * p.face * (p.superForm ? 1.2 : 1);
        p.spinRev = 0;
        S.Audio.sfx('release'); g.shake(5);
        S.Particles.burst(p.x - p.face * 16, p.y - 7, 12,
          { color: '#e6f0ff', maxSpeed: 4.5, life: 22, size: 3, angle: p.face > 0 ? Math.PI : 0 });
      }
    } else {
      p.crouch = ctrl && In.held('down') && Math.abs(p.gsp) < 0.5 && !p.rolling;
      p.lookup = ctrl && In.held('up') && Math.abs(p.gsp) < 0.5 && !p.rolling;
      if (p.crouch && ctrl && In.pressed('jump')) {
        p.spindash = true; p.spinRev = 2; p.rolling = false;
        S.Audio.sfx('spindash');
      }

      if (!p.rolling) {
        var acc = p.accel(), top = p.topSpeed();
        if (inx < 0) {
          if (p.gsp > 0) {
            p.gsp -= K.DEC;
            if (p.gsp > 3.5) skid(p, g);
            if (p.gsp <= 0) p.gsp = -0.5;
          } else if (p.gsp > -top) {
            p.gsp = Math.max(-top, p.gsp - acc);
          }
          p.face = -1;
        } else if (inx > 0) {
          if (p.gsp < 0) {
            p.gsp += K.DEC;
            if (p.gsp < -3.5) skid(p, g);
            if (p.gsp >= 0) p.gsp = 0.5;
          } else if (p.gsp < top) {
            p.gsp = Math.min(top, p.gsp + acc);
          }
          p.face = 1;
        } else {
          var fr = p.inWater ? K.FRC * .5 : K.FRC;
          p.gsp -= Math.min(Math.abs(p.gsp), fr) * S.sgn(p.gsp);
        }
        if (ctrl && In.held('down') && Math.abs(p.gsp) >= 1.0) {
          p.rolling = true; S.Audio.sfx('spindash');
        }
      } else {
        if (inx !== 0 && S.sgn(inx) !== S.sgn(p.gsp)) p.gsp -= K.ROLLDEC * S.sgn(p.gsp);
        p.gsp -= Math.min(Math.abs(p.gsp), K.ROLLFRC) * S.sgn(p.gsp);
        if (Math.abs(p.gsp) < 0.5) { p.rolling = false; p.gsp = 0; }
      }
    }

    // fator de rampa
    var sa = Math.sin(p.angle);
    if (!p.spindash) {
      var sl = K.SLOPE;
      if (p.rolling) sl = (S.sgn(p.gsp) === S.sgn(sa)) ? K.SLOPEDOWN : K.SLOPEUP;
      p.gsp += sl * sa;
    }
    p.gsp = S.clamp(p.gsp, -K.MAXX, K.MAXX);

    if (Math.abs(p.gsp) < 2.2 && Math.abs(sa) > 0.62) p.ctrlLock = Math.max(p.ctrlLock, 24);

    // pulo
    if (ctrl && In.pressed('jump') && !p.spindash && !p.crouch) {
      p.vy = -p.jumpForce();
      p.vx = p.gsp;
      p.grounded = false; p.jumping = true; p.rolling = false;
      p.state = 'jump';
      S.Audio.sfx('jump');
      return;
    }

    if (!p.spindash) p.x += p.gsp;
    S.Player.wallCollide(p, lv);

    var s = S.Player.senseGround(p, lv, 16);
    if (s) {
      p.y = s.y; p.angle = s.angle; p.vy = 0;
      if (s.hazard) p.hurt(p.x);
      if (Math.abs(p.gsp) > 5 && p.animT % 4 === 0) {
        S.Particles.spawn({ type: 'dust', x: p.x - p.face * 8, y: p.y - 2,
          vx: -p.face * .6, vy: -.3, g: -.008, life: 16, size: 2.6, color: '#ffffff' });
      }
    } else {
      p.grounded = false; p.vx = p.gsp; p.angle = 0;
    }
  };

  function skid(p, g) {
    if (p.animT % 6 === 0) {
      S.Audio.sfx('skid');
      S.Particles.spawn({ type: 'dust', x: p.x, y: p.y - 3, vx: -S.sgn(p.gsp) * 1.2,
        vy: -.5, g: .02, life: 20, size: 3, color: '#ffffff' });
    }
  }
})();

/* ---------------- atualização no ar ---------------- */
(function () {
  'use strict';
  var S = window.S, L = S.Level, K = S.PHYS;

  S.Player.airUpdate = function (p, g, inx, ctrl) {
    var lv = g.level, In = S.Input;

    if (p.jumping && !In.held('jump') && p.vy < -4 && !p.inWater) p.vy = -4;

    abilities(p, g, ctrl, inx);

    if (p.climbing) { climb(p, g, ctrl); return; }

    if (!p.gliding) {
      var aa = p.inWater ? K.AIR * .5 : K.AIR;
      var top = p.topSpeed();
      if (inx !== 0) {
        if (Math.abs(p.vx) < top || S.sgn(inx) !== S.sgn(p.vx)) p.vx += inx * aa * (p.flying ? .7 : 1);
        p.vx = S.clamp(p.vx, -Math.max(top, Math.abs(p.vx)), Math.max(top, Math.abs(p.vx)));
        p.face = inx;
      }
      if (p.vy < 0 && p.vy > -4) p.vx -= (p.vx / 0.125) / 256;
    }

    var grv = p.inWater ? 0.0625 : K.GRV;
    if (p.gliding) grv = 0.055;
    if (p.flying && p.flyUp > 0) grv = -0.11;
    p.vy += grv;

    var maxFall = p.inWater ? 4 : K.MAXFALL;
    if (p.vy > maxFall) p.vy = maxFall;
    if (p.flying && p.vy < -1.5) p.vy = -1.5;
    if (p.gliding && p.vy > 2.2) p.vy = 2.2;

    p.x += p.vx; p.y += p.vy;

    S.Player.wallCollide(p, lv);
    S.Player.ceilCollide(p, lv);

    if (p.gliding && p.wallSide && p.charId === 'knuckles') {
      p.gliding = false; p.climbing = true;
      p.vy = 0; p.vx = 0; p.face = p.wallSide;
      S.Audio.sfx('glide');
    }

    if (p.vy >= 0) {
      var range = Math.max(10, p.vy + 8);
      var s = S.Player.senseGround(p, lv, range, { minSurf: p.prevY - 8 });
      if (s) {
        p.y = s.y; p.angle = s.angle;
        p.grounded = true; p.vy = 0;
        p.gsp = p.vx;
        if (Math.abs(p.angle) > .3) p.gsp = p.vx / Math.cos(p.angle);
        p.gsp = S.clamp(p.gsp, -K.MAXX, K.MAXX);
        land(p, g);
        if (s.hazard) p.hurt(p.x);
      }
    }

    if (p.y > lv.pxH + 80) p.die();
  };

  function land(p, g) {
    if (p.dropReady) {
      p.gsp = (p.superForm ? 12 : 8) * p.face;
      p.rolling = true;
      S.Audio.sfx('release'); g.shake(4);
      S.Particles.burst(p.x, p.y - 6, 10, { color: '#cfe6ff', maxSpeed: 4, life: 20, size: 3 });
    }
    p.jumping = false; p.flying = false; p.gliding = false;
    p.dropCharge = 0; p.dropReady = false;
    if (!p.rolling) p.rolling = false;
    if (p.slideT === undefined) p.slideT = 0;
  }

  function abilities(p, g, ctrl, inx) {
    var In = S.Input;
    if (!ctrl) return;

    if (p.charId === 'tails') {
      if (In.pressed('jump') && !p.flying && p.jumping) {
        p.flying = true; p.jumping = false; p.flyTimer = 500; p.flyUp = 26;
        S.Audio.sfx('fly');
      } else if (p.flying) {
        if (In.pressed('jump')) { p.flyUp = 26; S.Audio.sfx('fly'); }
        if (p.flyUp > 0) p.flyUp--;
        if (--p.flyTimer <= 0) { p.flying = false; }
      }
      return;
    }

    if (p.charId === 'knuckles') {
      if (In.pressed('jump') && !p.gliding && !p.climbing && p.jumping) {
        p.gliding = true; p.jumping = false;
        p.vy = 0; p.glideSpd = 4.2;
        p.vx = p.face * p.glideSpd;
        S.Audio.sfx('glide');
      } else if (p.gliding) {
        if (!In.held('jump')) { p.gliding = false; p.vy = 1; return; }
        p.glideSpd = Math.min(7, p.glideSpd + .03);
        if (inx !== 0 && inx !== p.face) {
          p.glideSpd -= .22;
          if (p.glideSpd <= .6) { p.face = inx; p.glideSpd = 1; }
        }
        p.vx = p.face * p.glideSpd;
        if (p.animT % 6 === 0) {
          S.Particles.spawn({ type: 'dust', x: p.x - p.face * 12, y: p.y - 16,
            vx: -p.face * .4, vy: 0, g: 0, life: 14, size: 2, color: '#ffffff' });
        }
      }
      return;
    }

    // Sonic: drop dash
    if (p.jumping && !p.grounded) {
      if (In.held('jump')) {
        if (p.dropCharge === 0 && !In.pressed('jump')) p.dropCharge = 1;
        if (p.dropCharge > 0) {
          p.dropCharge++;
          if (p.dropCharge === 22) { p.dropReady = true; S.Audio.sfx('spindash'); }
        }
      } else { p.dropCharge = 0; p.dropReady = false; }
    }
  }

  function climb(p, g, ctrl) {
    var In = S.Input, lv = g.level;
    var wallX = p.x + p.face * (p.rw + 3);
    var still = L.wallAt(lv, wallX, p.y - 18);
    if (ctrl && In.pressed('jump')) {
      p.climbing = false; p.jumping = true;
      p.face = -p.face; p.vx = p.face * 3.6; p.vy = -4.4;
      S.Audio.sfx('jump');
      return;
    }
    var dy = ctrl ? S.Input.axisY() : 0;
    p.y += dy * 1.4;
    if (!still) {
      // chegou ao topo
      var top = L.groundSense(lv, wallX, p.y, 20, { fromAbove: true });
      if (dy < 0 && top) {
        p.x = wallX + p.face * 4; p.y = top.y;
        p.grounded = true; p.climbing = false; p.gsp = 0;
      } else if (!L.wallAt(lv, wallX, p.y - 8)) {
        p.climbing = false; p.vy = 0; p.vx = 0;
      }
    }
    if (L.wallAt(lv, wallX, p.y - 34) === null && dy < 0) { /* topo livre */ }
    if (p.y > lv.pxH + 80) p.die();
  }
})();

/* ---------------- laço principal do jogador ---------------- */
(function () {
  'use strict';
  var S = window.S, L = S.Level, K = S.PHYS;

  S.Player.update = function (p, g) {
    var In = S.Input, lv = g.level;
    p.animT++;
    p.prevY = p.y;

    if (p.invulnTimer > 0) p.invulnTimer--;
    if (p.ctrlLock > 0) p.ctrlLock--;
    if (p.hurtTimer > 0) p.hurtTimer--;
    if (p.springTimer > 0) p.springTimer--;
    if (p.shoesTimer > 0) { p.shoesTimer--; if (p.shoesTimer === 0) g.restoreMusic(); }
    if (p.invincTimer > 0) {
      p.invincTimer--;
      if (p.animT % 3 === 0) {
        S.Particles.spawn({ type: 'star', x: p.x + S.rand(-14, 14), y: p.y - S.rand(4, 36),
          vx: S.rand(-.5, .5), vy: S.rand(-.6, .2), g: .02, life: 22,
          size: S.rand(2.5, 5), color: S.choice(['#ffffff', '#ffd23c', '#9fe2ff']), vr: .2 });
      }
      if (p.invincTimer === 0) g.restoreMusic();
    }

    if (p.dead) { deadUpdate(p, g); return; }

    if (p.superForm) {
      p.superTimer++;
      if (p.superTimer % 60 === 0) {
        g.rings--;
        if (g.rings <= 0) { g.rings = 0; p.superForm = false; g.restoreMusic(); }
      }
      if (p.animT % 4 === 0) {
        S.Particles.spawn({ type: 'spark', x: p.x + S.rand(-12, 12), y: p.y - S.rand(2, 34),
          vx: 0, vy: -.4, g: 0, life: 18, size: S.rand(1.5, 3), color: '#fff3a8' });
      }
    }

    // água
    var wasWater = p.inWater;
    p.inWater = L.isWater(lv, p.x, p.y - 14);
    if (p.inWater !== wasWater) {
      S.Audio.sfx('splash');
      for (var i = 0; i < 8; i++) {
        S.Particles.spawn({ type: 'splash', x: p.x + S.rand(-10, 10), y: p.y - 14,
          vx: S.rand(-2, 2), vy: S.rand(-3, -1), g: .18, life: 24, size: S.rand(2, 4), color: '#bfe6ff' });
      }
      if (p.inWater) { p.vy *= .4; p.gsp *= .6; }
      else if (p.vy < 0) p.vy *= 1.1;
    }
    if (p.inWater && p.animT % 46 === 0) {
      S.Particles.spawn({ type: 'splash', x: p.x + p.face * 8, y: p.y - 26,
        vx: 0, vy: -.7, g: -.005, life: 50, size: 2.6, color: 'rgba(200,240,255,.85)' });
    }

    if (p.loop) { S.Loops.move(p, g); S.Player.animate(p); return; }

    var ctrl = p.controlEnabled && !p.goalLock && p.hurtTimer <= 0;
    var inx = (ctrl && p.ctrlLock <= 0) ? In.axisX() : 0;

    if (p.grounded) S.Player.groundUpdate(p, g, inx, ctrl);
    else S.Player.airUpdate(p, g, inx, ctrl);

    if (p.goalLock) {
      p.gsp = S.approach(p.gsp, 0, .08);
      if (p.grounded) p.x += 0;
    }

    animate(p);
  };

  function deadUpdate(p, g) {
    p.vy += 0.21875;
    p.y += p.vy;
    p.deadTimer++;
    if (p.deadTimer > 90 && !p.reported) { p.reported = true; g.onPlayerDead(); }
  }

  function animate(p) {
    var sp = Math.abs(p.grounded ? p.gsp : p.vx);
    var st = 'idle';
    if (p.dead) st = 'dead';
    else if (p.hurtTimer > 0) st = 'hurt';
    else if (p.spindash) st = 'spindash';
    else if (p.climbing) st = 'climb';
    else if (p.gliding) st = 'glide';
    else if (p.flying) st = 'fly';
    else if (p.rolling) st = 'roll';
    else if (!p.grounded) st = (p.springTimer > 0 ? 'spring' : 'jump');
    else if (p.pushing && sp < 0.6) st = 'push';
    else if (p.crouch) st = 'crouch';
    else if (p.lookup) st = 'lookup';
    else if (sp > 9.5) st = 'dash';
    else if (sp > 3.2) st = 'run';
    else if (sp > 0.06) st = 'walk';
    p.state = st;
    if (p.grounded && (st === 'walk' || st === 'run' || st === 'dash')) {
      p.animSpeed = Math.max(.12, Math.min(1.4, sp * .16));
    } else p.animSpeed = 1;
    p.animPhase = (p.animPhase || 0) + p.animSpeed * (st === 'walk' ? 1.2 : 1);
    if (st === 'roll' || st === 'jump' || st === 'spring') {
      p.spin = (p.spin || 0) + Math.max(.22, Math.min(.85, sp * .09)) * (p.face >= 0 ? 1 : -1);
    }
  }

  S.Player.animate = animate;

  S.Player.draw = function (p, ctx, cam) {
    var x = p.x - cam.x, y = p.y - cam.y;
    var flash = p.invulnTimer > 0 && p.hurtTimer <= 0;

    S.Gfx.drawChar(ctx, p.charId, {
      x: x, y: y,
      state: p.state,
      t: p.animPhase || 0,
      spin: p.spin || 0,
      facing: p.face,
      angle: (p.grounded && !p.rolling) ? p.angle : 0,
      flash: flash,
      superForm: p.superForm
    });

    if (p.shield) drawShield(ctx, x, y - 18, p.shield, p.animT);
    if (p.invincTimer > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = .18 + Math.sin(p.animT * .3) * .08;
      ctx.fillStyle = '#ffffff';
      S.circle(ctx, x, y - 18, 26); ctx.fill();
      ctx.restore();
    }
    if (p.spindash) {
      S.text(ctx, '', 0, 0, {});
    }
  };

  function drawShield(ctx, x, y, kind, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var col = kind === 'shield' ? '#4cc3ff' : '#ffd23c';
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.4;
    ctx.globalAlpha = .55 + Math.sin(t * .18) * .2;
    S.circle(ctx, x, y, 25 + Math.sin(t * .18) * 1.5); ctx.stroke();
    ctx.globalAlpha = .18;
    ctx.fillStyle = col;
    S.circle(ctx, x, y, 25); ctx.fill();
    ctx.restore();
  }
})();
