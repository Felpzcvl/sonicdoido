/* ============================================================
   input.js — teclado, gamepad e controles de toque
   ============================================================ */
(function () {
  'use strict';
  var S = window.S;

  var MAP = {
    left:    ['ArrowLeft', 'KeyA'],
    right:   ['ArrowRight', 'KeyD'],
    up:      ['ArrowUp', 'KeyW'],
    down:    ['ArrowDown', 'KeyS'],
    jump:    ['Space', 'KeyZ', 'KeyJ'],
    action:  ['KeyX', 'KeyK', 'ShiftLeft', 'ShiftRight'],
    confirm: ['Enter', 'Space', 'KeyZ', 'NumpadEnter'],
    back:    ['Escape', 'Backspace', 'KeyX'],
    pause:   ['Enter', 'KeyP', 'Escape'],
    debug:   ['F1']
  };

  var Input = S.Input = {
    keys: {},
    justKeys: {},
    down: {},
    prev: {},
    anyPressed: false,
    lastDevice: 'keyboard',
    touchActive: false,
    touchBtns: [],
    pointers: {},

    /* aceita e.code e e.key (teclados/layouts diferentes) */
    codes: function (e) {
      var out = [];
      if (e.code) out.push(e.code);
      var k = e.key;
      if (k) {
        if (k === ' ') { out.push('Space'); }
        else if (k.length === 1) { out.push('Key' + k.toUpperCase()); }
        else { out.push(k); }
      }
      return out;
    },

    init: function (canvas) {
      this.canvas = canvas;
      var self = this;
      window.addEventListener('keydown', function (e) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter', 'Tab'].indexOf(e.code) >= 0) e.preventDefault();
        if (e.repeat) return;
        var ids = Input.codes(e);
        for (var q = 0; q < ids.length; q++) { self.keys[ids[q]] = true; self.justKeys[ids[q]] = true; }
        self.lastDevice = 'keyboard';
      });
      window.addEventListener('keyup', function (e) {
        var ids = Input.codes(e);
        for (var q = 0; q < ids.length; q++) self.keys[ids[q]] = false;
      });
      window.addEventListener('blur', function () { self.keys = {}; });

      // ---- touch ----
      var onDown = function (e) {
        if (e.pointerType === 'mouse') return;
        self.touchActive = true;
        self.lastDevice = 'touch';
        self.pointers[e.pointerId] = self.mapPoint(e);
        e.preventDefault();
      };
      var onMove = function (e) {
        if (self.pointers[e.pointerId] === undefined) return;
        self.pointers[e.pointerId] = self.mapPoint(e);
      };
      var onUp = function (e) { delete self.pointers[e.pointerId]; };
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);
      canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

      this.buildTouchButtons();
    },

    mapPoint: function (e) {
      var r = this.canvas.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * (S.W / r.width),
        y: (e.clientY - r.top) * (S.H / r.height)
      };
    },

    buildTouchButtons: function () {
      var y = S.H - 62;
      this.touchBtns = [
        { a: 'left',    x: 42,  y: y,      r: 30, label: '◀' },
        { a: 'right',   x: 112, y: y,      r: 30, label: '▶' },
        { a: 'down',    x: 77,  y: y + 40, r: 26, label: '▼' },
        { a: 'up',      x: 77,  y: y - 44, r: 26, label: '▲' },
        { a: 'jump',    x: S.W - 50,  y: y + 8,  r: 34, label: 'A' },
        { a: 'action',  x: S.W - 122, y: y - 16, r: 28, label: 'B' },
        { a: 'pause',   x: S.W - 30,  y: 22,     r: 18, label: 'II' }
      ];
    },

    update: function () {
      var i, k, a;
      this.prev = this.down;
      var d = {};
      for (a in MAP) {
        var list = MAP[a], on = false;
        for (i = 0; i < list.length; i++) if (this.keys[list[i]] || this.justKeys[list[i]]) { on = true; break; }
        d[a] = on;
      }

      // gamepad
      if (navigator.getGamepads) {
        var pads = navigator.getGamepads();
        for (i = 0; i < pads.length; i++) {
          var p = pads[i];
          if (!p) continue;
          var ax = p.axes[0] || 0, ay = p.axes[1] || 0;
          if (ax < -.4 || p.buttons[14] && p.buttons[14].pressed) { d.left = true; this.lastDevice = 'pad'; }
          if (ax > .4 || p.buttons[15] && p.buttons[15].pressed) { d.right = true; this.lastDevice = 'pad'; }
          if (ay < -.4 || p.buttons[12] && p.buttons[12].pressed) { d.up = true; }
          if (ay > .4 || p.buttons[13] && p.buttons[13].pressed) { d.down = true; }
          var b = function (n) { return p.buttons[n] && p.buttons[n].pressed; };
          if (b(0) || b(1) || b(2) || b(3)) { d.jump = true; d.confirm = true; this.lastDevice = 'pad'; }
          if (b(2) || b(3) || b(4) || b(5)) d.action = true;
          if (b(1)) d.back = true;
          if (b(9)) { d.pause = true; d.confirm = true; }
          if (b(8)) d.back = true;
        }
      }

      // touch
      var pts = [];
      for (k in this.pointers) pts.push(this.pointers[k]);
      if (pts.length) {
        for (i = 0; i < this.touchBtns.length; i++) {
          var btn = this.touchBtns[i];
          for (var j = 0; j < pts.length; j++) {
            var dx = pts[j].x - btn.x, dy = pts[j].y - btn.y;
            if (dx * dx + dy * dy < (btn.r + 8) * (btn.r + 8)) {
              d[btn.a] = true;
              if (btn.a === 'jump') d.confirm = true;
              if (btn.a === 'action') d.back = true;
            }
          }
        }
      }

      this.down = d;
      this.justKeys = {};
      this.anyPressed = false;
      for (a in d) if (d[a] && !this.prev[a]) this.anyPressed = true;
    },

    held: function (a) { return !!this.down[a]; },
    pressed: function (a) { return !!this.down[a] && !this.prev[a]; },
    released: function (a) { return !this.down[a] && !!this.prev[a]; },

    /* horizontal axis -1/0/1 */
    axisX: function () { return (this.held('right') ? 1 : 0) - (this.held('left') ? 1 : 0); },
    axisY: function () { return (this.held('down') ? 1 : 0) - (this.held('up') ? 1 : 0); },

    drawTouch: function (ctx) {
      if (!this.touchActive || !S.Save.data.options.touch) return;
      ctx.save();
      for (var i = 0; i < this.touchBtns.length; i++) {
        var b = this.touchBtns[i];
        var on = this.down[b.a];
        ctx.globalAlpha = on ? .55 : .27;
        ctx.fillStyle = '#ffffff';
        S.circle(ctx, b.x, b.y, b.r); ctx.fill();
        ctx.globalAlpha = on ? .95 : .6;
        ctx.strokeStyle = '#0b1030'; ctx.lineWidth = 2; ctx.stroke();
        S.text(ctx, b.label, b.x, b.y + 6, { size: b.r > 30 ? 20 : 15, color: '#0b1030', align: 'center', shadow: false });
      }
      ctx.restore();
    }
  };
})();
