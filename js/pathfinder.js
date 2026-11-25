/* ==========================================================================
   pathfinder.js — draw walls, drag start / goal, watch A* search.
   Canvas only; colours are read from the CSS tokens so it follows the theme.
   ========================================================================== */
(function () {
  "use strict";
  var canvas = document.querySelector("[data-pf-canvas]");
  if (!canvas) return;
  var statsEl = document.querySelector("[data-pf-stats]");
  var ctx = canvas.getContext("2d");
  var reduce = window.Site && window.Site.reduceMotion;

  var COLS = 28, ROWS = 14, CELL = 0, DPR = 1;
  var wall, seen, path, start, goal, anim = 0, running = false;
  var drag = null; // "start" | "goal" | "draw" | "erase"
  var colors = {};

  function idx(x, y) { return y * COLS + x; }
  function reset(keepWalls) {
    cancelAnimationFrame(anim); running = false;
    if (!keepWalls || !wall) wall = new Uint8Array(COLS * ROWS);
    seen = new Uint8Array(COLS * ROWS);
    path = [];
    if (!start) { start = { x: 3, y: 7 }; goal = { x: COLS - 4, y: 7 }; }
  }

  function readColors() {
    var v = window.Site.cssVar;
    colors = { ink: v("--ink"), accent: v("--accent"), ok: v("--ok"), line: v("--line"), paper: v("--paper-2"), card: v("--card") };
  }

  function size() {
    var w = canvas.parentElement.clientWidth - 16;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    CELL = Math.floor(w / COLS);
    canvas.style.width = CELL * COLS + "px";
    canvas.style.height = CELL * ROWS + "px";
    canvas.width = CELL * COLS * DPR;
    canvas.height = CELL * ROWS * DPR;
    draw();
  }

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = colors.paper; ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
    var pad = Math.max(1, CELL * 0.07);
    for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) {
      var i = idx(x, y), px = x * CELL, py = y * CELL;
      if (wall[i]) { ctx.fillStyle = colors.ink; rr(px + pad, py + pad, CELL - pad * 2, CELL - pad * 2, CELL * 0.22); ctx.fill(); }
      else if (seen[i]) {
        ctx.globalAlpha = 0.1 + 0.2 * (seen[i] / 255);
        ctx.fillStyle = colors.accent; rr(px + pad, py + pad, CELL - pad * 2, CELL - pad * 2, CELL * 0.22); ctx.fill(); ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = colors.line; ctx.beginPath(); ctx.arc(px + CELL / 2, py + CELL / 2, 1.2, 0, 6.3); ctx.fill();
      }
    }
    if (path.length) {
      ctx.strokeStyle = colors.ink; ctx.lineWidth = Math.max(2, CELL * 0.2); ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath();
      path.forEach(function (p, k) { var X = p.x * CELL + CELL / 2, Y = p.y * CELL + CELL / 2; k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
      ctx.stroke();
    }
    dot(start, colors.accent); dot(goal, colors.ok);
  }
  function dot(p, c) {
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(p.x * CELL + CELL / 2, p.y * CELL + CELL / 2, CELL * 0.36, 0, 6.3); ctx.fill();
    ctx.strokeStyle = colors.card; ctx.lineWidth = 2; ctx.stroke();
  }

  /* ---------- A* ---------- */
  function astar() {
    var open = [], g = new Float32Array(COLS * ROWS).fill(Infinity), from = new Int16Array(COLS * ROWS).fill(-1);
    var closed = new Uint8Array(COLS * ROWS), order = [];
    var s = idx(start.x, start.y), t = idx(goal.x, goal.y);
    var h = function (x, y) { return Math.abs(x - goal.x) + Math.abs(y - goal.y); };
    g[s] = 0; open.push({ i: s, f: h(start.x, start.y) });
    while (open.length) {
      var bi = 0;
      for (var k = 1; k < open.length; k++) if (open[k].f < open[bi].f) bi = k;
      var cur = open.splice(bi, 1)[0].i;
      if (closed[cur]) continue;
      closed[cur] = 1; order.push(cur);
      if (cur === t) break;
      var cx = cur % COLS, cy = (cur / COLS) | 0;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var nx = cx + d[0], ny = cy + d[1];
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) return;
        var ni = idx(nx, ny);
        if (wall[ni] || closed[ni]) return;
        var ng = g[cur] + 1;
        if (ng < g[ni]) { g[ni] = ng; from[ni] = cur; open.push({ i: ni, f: ng + h(nx, ny) }); }
      });
    }
    var p = [];
    if (closed[t]) for (var c = t; c !== -1; c = from[c]) p.push({ x: c % COLS, y: (c / COLS) | 0 });
    return { order: order, path: p.reverse() };
  }

  function run() {
    reset(true);
    var res = astar();
    running = true;
    var n = 0, per = Math.max(2, Math.ceil(res.order.length / 90));
    function say(done) {
      if (!done) { statsEl.textContent = "Exploring… " + n + " cells"; return; }
      statsEl.textContent = res.path.length
        ? "Explored " + res.order.length + " cells · shortest path " + (res.path.length - 1) + " steps"
        : "Explored " + res.order.length + " cells · no path. The walls win this one.";
    }
    if (reduce) {
      res.order.forEach(function (i) { seen[i] = 255; }); path = res.path; running = false; say(true); draw(); return;
    }
    (function step() {
      for (var k = 0; k < per && n < res.order.length; k++) seen[res.order[n++]] = 255;
      for (var i = 0; i < seen.length; i++) if (seen[i] > 40 && seen[i] < 255) seen[i] -= 0; // keep solid
      draw(); say(false);
      if (n < res.order.length) anim = requestAnimationFrame(step);
      else { path = res.path; running = false; say(true); draw(); }
    })();
  }

  function maze() {
    reset(false);
    for (var i = 0; i < wall.length; i++) wall[i] = Math.random() < 0.27 ? 1 : 0;
    wall[idx(start.x, start.y)] = 0; wall[idx(goal.x, goal.y)] = 0;
    statsEl.textContent = "New maze. Press Run A*."; draw();
  }

  /* ---------- input ---------- */
  function cellAt(e) {
    var r = canvas.getBoundingClientRect();
    var x = Math.floor((e.clientX - r.left) / (r.width / COLS)), y = Math.floor((e.clientY - r.top) / (r.height / ROWS));
    return (x < 0 || y < 0 || x >= COLS || y >= ROWS) ? null : { x: x, y: y };
  }
  function apply(c) {
    if (!c) return;
    if (drag === "start" && !(c.x === goal.x && c.y === goal.y)) { start = c; wall[idx(c.x, c.y)] = 0; }
    else if (drag === "goal" && !(c.x === start.x && c.y === start.y)) { goal = c; wall[idx(c.x, c.y)] = 0; }
    else if (drag === "draw" || drag === "erase") {
      if ((c.x === start.x && c.y === start.y) || (c.x === goal.x && c.y === goal.y)) return;
      wall[idx(c.x, c.y)] = drag === "draw" ? 1 : 0;
    }
    seen = new Uint8Array(COLS * ROWS); path = [];
    draw();
  }
  canvas.addEventListener("pointerdown", function (e) {
    if (running) return;
    var c = cellAt(e); if (!c) return;
    canvas.setPointerCapture(e.pointerId);
    if (c.x === start.x && c.y === start.y) drag = "start";
    else if (c.x === goal.x && c.y === goal.y) drag = "goal";
    else drag = wall[idx(c.x, c.y)] ? "erase" : "draw";
    apply(c);
  });
  canvas.addEventListener("pointermove", function (e) { if (drag) apply(cellAt(e)); });
  ["pointerup", "pointercancel"].forEach(function (n) { canvas.addEventListener(n, function () { drag = null; }); });

  document.querySelector('[data-pf="run"]').addEventListener("click", run);
  document.querySelector('[data-pf="maze"]').addEventListener("click", maze);
  document.querySelector('[data-pf="clear"]').addEventListener("click", function () {
    reset(false); statsEl.textContent = "Cleared. Draw some walls, then press Run."; draw();
  });

  window.Site.onTheme(function () { readColors(); draw(); });
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 120); });

  readColors(); reset(false);
  /* seed a few walls so the first run shows something interesting */
  for (var y = 3; y < 11; y++) wall[idx(13, y)] = 1;
  for (var x = 14; x < 19; x++) wall[idx(x, 3)] = 1;
  size();
})();
