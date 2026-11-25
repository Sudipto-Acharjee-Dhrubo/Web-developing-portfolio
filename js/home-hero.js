/* ==========================================================================
   home-hero.js — hero behaviour:
   · wordmark letters thin out and narrow near the pointer (variable font axes)
   · circuit spotlight follows the pointer
   · floating UI parallax
   · rotating role tag and a typed code snippet
   ========================================================================== */
(function () {
  "use strict";
  var hero = document.querySelector(".hero");
  if (!hero) return;
  var reduce = window.Site && window.Site.reduceMotion;
  var fine = window.matchMedia("(pointer: fine)").matches;

  /* ---------- Wordmark: each letter's extruded shadow points away from the pointer ---------- */
  var letters = Array.prototype.slice.call(hero.querySelectorAll(".wordmark__l"));
  var RADIUS = 380, REST = { x: 5, y: 6 };
  var state = letters.map(function () { return { sx: REST.x, sy: REST.y, ly: 0 }; });
  var pointer = { x: -9999, y: -9999, active: false };
  var wave = { on: false };

  function frame() {
    letters.forEach(function (el, i) {
      var r = el.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = cx - pointer.x, dy = cy - pointer.y;
      var d = Math.hypot(dx, dy) || 1;
      var f = pointer.active || wave.on ? Math.max(0, 1 - d / RADIUS) : 0;
      f = f * f * (3 - 2 * f); // smoothstep
      var len = 5 + 8 * f;
      var tx = f > 0.01 ? (dx / d) * len : REST.x;
      var ty = f > 0.01 ? (dy / d) * len : REST.y;
      var s = state[i];
      s.sx += (tx - s.sx) * 0.16;
      s.sy += (ty - s.sy) * 0.16;
      s.ly += (-5 * f - s.ly) * 0.16;
      el.style.setProperty("--sx", s.sx.toFixed(2));
      el.style.setProperty("--sy", s.sy.toFixed(2));
      el.style.setProperty("--ly", s.ly.toFixed(2));
    });
    requestAnimationFrame(frame);
  }

  /* One intro sweep: a virtual pointer glides across the letters */
  function introWave() {
    var first = letters[0].getBoundingClientRect();
    var last = letters[letters.length - 1].getBoundingClientRect();
    var y = first.top + first.height / 2;
    var x0 = first.left - 80, x1 = last.right + 80;
    var dur = 1900, start = performance.now();
    wave.on = true;
    (function step(now) {
      var p = Math.min(1, (now - start) / dur);
      if (pointer.active) { wave.on = false; return; }
      pointer.x = x0 + (x1 - x0) * p;
      pointer.y = y;
      if (p < 1) requestAnimationFrame(step);
      else { wave.on = false; pointer.x = pointer.y = -9999; }
    })(start);
  }

  if (!reduce) {
    requestAnimationFrame(frame);
    setTimeout(introWave, 1100);
  }

  /* ---------- Pointer: spotlight + parallax ---------- */
  var depthEls = Array.prototype.slice.call(hero.querySelectorAll("[data-depth]"));
  depthEls.forEach(function (el) { el.style.setProperty("--d", el.getAttribute("data-depth")); });

  if (fine && !reduce) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      hero.style.setProperty("--mx", x + "px");
      hero.style.setProperty("--my", y + "px");
      hero.style.setProperty("--px", ((x / r.width) * 2 - 1).toFixed(3));
      hero.style.setProperty("--py", ((y / r.height) * 2 - 1).toFixed(3));
      pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true;
    }, { passive: true });
    hero.addEventListener("pointerleave", function () {
      pointer.active = false; pointer.x = pointer.y = -9999;
    });
  }

  /* ---------- Rotating role tag ---------- */
  var roleEl = hero.querySelector("[data-role]");
  var roles = ["CSE student", "problem solver", "builds on-device ML", "still curious"];
  if (roleEl && !reduce) {
    var ri = 0;
    setInterval(function () {
      roleEl.classList.add("is-out");
      setTimeout(function () {
        ri = (ri + 1) % roles.length;
        roleEl.textContent = roles[ri];
        roleEl.classList.remove("is-out");
      }, 350);
    }, 2800);
  }

  /* ---------- Typed code snippet ---------- */
  var codeEl = hero.querySelector("[data-snippet]");
  if (codeEl) {
    var parts = [
      ["k", "const"], [null, " dhrubo = {\n  meaning: "], ["s", '"constant"'], [null, ", "], ["c", "// ধ্রুব"],
      [null, "\n  student: "], ["s", '"CSE · ULAB"'], [null, ",\n  builds: ["], ["s", '"ML"'], [null, ", "], ["s", '"web"'],
      [null, ", "], ["s", '"APIs"'], [null, "],\n  ready: "], ["n", "true"], [null, ",\n};"]
    ];
    var spans = parts.map(function (p) {
      var s = document.createElement(p[0] ? "span" : "span");
      if (p[0]) s.className = p[0];
      codeEl.appendChild(s);
      return { el: s, text: p[1] };
    });
    var total = parts.reduce(function (n, p) { return n + p[1].length; }, 0);

    var render = function (n) {
      var left = n;
      spans.forEach(function (sp) {
        var take = Math.max(0, Math.min(sp.text.length, left));
        sp.el.textContent = sp.text.slice(0, take);
        left -= take;
      });
    };
    if (reduce) render(total);
    else {
      var i = 0;
      setTimeout(function type() {
        render(++i);
        if (i < total) setTimeout(type, 26 + Math.random() * 30);
      }, 1400);
    }
  }
})();
