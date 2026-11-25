/* ==========================================================================
   graph.js — the toolkit as a drifting node graph (SVG, no libraries).
   Hover or focus a node to light up everything it connects to.
   The hub in the middle is my 3D portrait (assets/portrait.glb), rendered by
   js/vendor/hub3d.js. Both the renderer and the model are lazy-loaded.
   ========================================================================== */
(function () {
  "use strict";
  var box = document.querySelector("[data-graph]");
  var listEl = document.querySelector("[data-skill-list]");
  if (!box || !window.DATA) return;

  var NS = "http://www.w3.org/2000/svg";
  var S = window.DATA.skills;
  var svg = box.querySelector("svg");
  var readout = box.querySelector("[data-graph-readout]");
  var rk = readout.querySelector(".graph__rk");
  var rv = readout.querySelector(".graph__rv");
  var reduce = window.Site && window.Site.reduceMotion;

  var globe = null, nodes = {}, edges = [], hubOf = {}, W = 0, H = 0, raf = 0, visible = false;
  var hubEl = box.querySelector("[data-hub]");          // centre of the graph (desktop / tablet)
  var hubM = document.querySelector("[data-hub-m]");    // above the list (phones)
  var hub = null, hubState = "idle";                    // idle | loading | ready | failed
  var meR = 0;                                          // radius around the hub where lines stop

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ---------- mobile list ---------- */
  if (listEl) {
    S.hubs.forEach(function (h) {
      var d = document.createElement("div");
      d.innerHTML = "<h3>" + h.label + "</h3><ul>" +
        h.items.map(function (i) { return '<li class="tag">' + i.label + "</li>"; }).join("") + "</ul>";
      listEl.appendChild(d);
    });
  }

  /* ---------- layout ---------- */
  function build() {
    W = box.clientWidth; H = box.clientHeight;
    if (W < 10) return;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.innerHTML = "";
    nodes = {}; edges = []; hubOf = {};

    var gEdges = el("g", {}, svg), gNodes = el("g", {}, svg);
    var cx = W / 2, cy = H / 2, unit = Math.min(W, H);

    /* centre: the 3D portrait is a canvas laid over this point (see layoutHub) */
    nodes.me = { x: cx, y: cy, bx: cx, by: cy, g: null, amp: 0, ph: 0, sp: 0, kind: "me" };
    meR = hubState === "failed" ? 50 : hubDims().h * 0.3;
    if (hubState === "failed") drawFallback(gNodes, cx, cy);

    /* a globe of tools around the portrait. Every tool sits on a spiral that winds from the
       south pole to the north pole; the whole sphere turns, tilted toward the viewer. Tools on
       the near side are drawn in front of the portrait, the far side behind it. */
    var frontSvg = box.querySelector(".graph__svg--front");
    if (!frontSvg) {
      frontSvg = document.createElementNS(NS, "svg");
      frontSvg.setAttribute("class", "graph__svg graph__svg--front");
      frontSvg.setAttribute("aria-hidden", "false");
      box.insertBefore(frontSvg, readout);
    }
    frontSvg.setAttribute("viewBox", "0 0 " + W + " " + H);
    frontSvg.innerHTML = "";
    var gFront = el("g", {}, frontSvg);
    globe = { cx: cx, cy: cy, rx: Math.max(140, (W / 2 - 150) / 1.13), ry: Math.max(100, (H / 2 - 40) / 1.13), gNodes: gNodes, gFront: gFront, mer: [], lat: [] };
    globe.outline = el("ellipse", { cx: cx, cy: cy, rx: globe.rx, ry: globe.ry, class: "g-ring" }, gEdges);
    for (var m = 0; m < 4; m++) globe.mer.push(el("ellipse", { class: "g-ring" }, gEdges));
    for (var q = 0; q < 3; q++) globe.lat.push(el("ellipse", { class: "g-ring" }, gEdges));

    var total = 0; S.hubs.forEach(function (h) { total += h.items.length; });
    var TAU = Math.PI * 2, seen = 0, TURNS = 2.4;
    function sph(i) {
      var lat = Math.asin(-0.84 + 1.68 * (i + 0.5) / total), lon = TAU * TURNS * i / total + 0.6;
      return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
    }

    S.hubs.forEach(function (h, hi) {
      var hg = el("g", { class: "g-node g-hub", tabindex: 0, role: "img", "aria-label": h.label + ": " + h.items.length + " tools" }, gNodes);
      var hin = el("g", { class: "g-in" }, hg);
      el("circle", { r: 24, fill: "transparent", stroke: "none", class: "g-hit" }, hin);
      el("circle", { r: 8 }, hin);
      var ht = el("text", { "text-anchor": "middle", y: -18 }, hin);
      ht.textContent = h.label;
      var mv = [0, 0, 0];
      h.items.forEach(function (_, i) { var u = sph(seen + i); mv[0] += u[0]; mv[1] += u[1]; mv[2] += u[2]; });
      var k = 0.95 / h.items.length;
      nodes[h.id] = { id: h.id, kind: "hub", v: [mv[0] * k, mv[1] * k, mv[2] * k], g: hg, inner: hin, layer: gNodes, x: cx, y: cy, label: h.label, note: h.items.length + " tools in this group." };

      h.items.forEach(function (it, i) {
        var g = el("g", { class: "g-node", tabindex: 0, role: "img", "aria-label": it.label + ". " + it.note }, gNodes);
        var inn = el("g", { class: "g-in" }, g);
        el("circle", { r: 5 }, inn);
        var rect = el("rect", { y: -13, height: 26, rx: 13, fill: "transparent" }, inn);
        var t = el("text", { y: 4.5 }, inn);
        t.textContent = it.label;
        nodes[it.id] = { id: it.id, kind: "skill", hub: h.id, v: sph(seen + i), g: g, inner: inn, layer: gNodes, rect: rect, t: t, w: it.label.length * 7.4 + 32, side: 0, x: cx, y: cy, label: it.label, note: it.note };
        hubOf[it.id] = h.id;
        edges.push({ a: h.id, b: it.id, x: false, path: el("path", { class: "g-edge" }, gEdges) });
      });
      seen += h.items.length;
      edges.push({ a: "me", b: h.id, x: false, path: el("path", { class: "g-edge" }, gEdges) });
    });

    S.links.forEach(function (l) {
      if (nodes[l[0]] && nodes[l[1]]) edges.push({ a: l[0], b: l[1], x: true, path: el("path", { class: "g-edge is-x" }, gEdges) });
    });

    Object.keys(nodes).forEach(function (id) {
      var nd = nodes[id];
      if (nd.kind === "me") return;
      nd.g.addEventListener("pointerenter", function () { focusNode(id); });
      nd.g.addEventListener("focus", function () { focusNode(id); });
      nd.g.addEventListener("pointerleave", clearFocus);
      nd.g.addEventListener("blur", clearFocus);
    });
    draw(0);
  }

  /* ---------- highlight ---------- */
  function neighbours(id) {
    var set = {}; set[id] = true;
    var nd = nodes[id];
    edges.forEach(function (e) {
      if (e.a === id || e.b === id) { set[e.a] = set[e.b] = true; }
    });
    if (nd.kind === "skill") set[nd.hub] = true;
    if (nd.kind === "hub") { set.me = true; }
    return set;
  }
  function focusNode(id) {
    var set = neighbours(id);
    box.classList.add("has-focus");
    Object.keys(nodes).forEach(function (k) {
      var g = nodes[k].g;
      if (g && g.classList) g.classList.toggle("is-lit", !!set[k]);
    });
    edges.forEach(function (e) {
      var on = (e.a === id || e.b === id) && !(nodes[id].kind === "skill" && e.a === "me");
      e.path.classList.toggle("is-lit", on);
    });
    rk.textContent = nodes[id].label;
    rv.textContent = nodes[id].note;
  }
  function clearFocus() {
    box.classList.remove("has-focus");
    Object.keys(nodes).forEach(function (k) { nodes[k].g && nodes[k].g.classList.remove("is-lit"); });
    edges.forEach(function (e) { e.path.classList.remove("is-lit"); });
    rk.textContent = "Pick a node";
    rv.textContent = "Each one is something I have actually used in a project.";
  }

  /* ---------- drift ---------- */
  function draw(t) {
    var yaw = reduce ? 0 : t * 0.17, tilt = 0.34;
    var cy_ = Math.cos(yaw), sy_ = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt);
    var G = globe, ox = G.cx, oy = G.cy;
    Object.keys(nodes).forEach(function (k) {
      var n = nodes[k];
      if (n.kind === "me") return;
      var v = n.v;
      var x1 = v[0] * cy_ + v[2] * sy_, z1 = -v[0] * sy_ + v[2] * cy_;
      var y2 = v[1] * ct - z1 * st, z2 = v[1] * st + z1 * ct;   // z2 > 0 faces the viewer
      var p = 1 + z2 * 0.13;
      n.x = ox + x1 * G.rx * p; n.y = oy - y2 * G.ry * p; n.z = z2;
      n.g.setAttribute("transform", "translate(" + n.x.toFixed(1) + " " + n.y.toFixed(1) + ")");
      var near = z2 * 0.5 + 0.5;
      n.inner.setAttribute("transform", "scale(" + (0.8 + 0.3 * near).toFixed(3) + ")");
      n.inner.style.opacity = (0.32 + 0.68 * near).toFixed(2);
      var layer = z2 > 0.02 ? G.gFront : G.gNodes;
      if (layer !== n.layer && !n.g.classList.contains("is-lit") && document.activeElement !== n.g && !n.g.matches(":hover")) {
        layer.appendChild(n.g); n.layer = layer;
      }
      if (n.kind === "skill") {
        var side = n.x >= ox ? 1 : -1;
        if (side !== n.side) {
          n.side = side;
          n.t.setAttribute("x", side > 0 ? 11 : -11);
          n.t.setAttribute("text-anchor", side > 0 ? "start" : "end");
          n.rect.setAttribute("x", side > 0 ? -10 : -(n.w - 10));
          n.rect.setAttribute("width", n.w);
        }
      }
    });
    /* the globe's wire: four meridians that turn with it, three latitude rings */
    G.mer.forEach(function (e, i) {
      var a = yaw + (i * Math.PI) / 4;
      e.setAttribute("cx", ox); e.setAttribute("cy", oy);
      e.setAttribute("rx", Math.abs(Math.cos(a)) * G.rx * 1.0); e.setAttribute("ry", G.ry);
    });
    [-0.55, 0, 0.55].forEach(function (lat, i) {
      var e = G.lat[i], r = Math.cos(lat);
      e.setAttribute("cx", ox); e.setAttribute("cy", oy - Math.sin(lat) * ct * G.ry);
      e.setAttribute("rx", r * G.rx); e.setAttribute("ry", r * st * G.ry);
    });
    edges.forEach(function (e) {
      var a = nodes[e.a], b = nodes[e.b];
      var ax = a.x, ay = a.y;
      if (e.a === "me" && meR) { // lines leave from the edge of the portrait, not from behind it
        var ux = b.x - a.x, uy = b.y - a.y, ul = Math.hypot(ux, uy) || 1;
        ax = a.x + (ux / ul) * meR; ay = a.y + (uy / ul) * meR;
      }
      var mx = (ax + b.x) / 2, my = (ay + b.y) / 2;
      var dx = b.x - ax, dy = b.y - ay, len = Math.hypot(dx, dy) || 1;
      var bend = e.x ? 0.22 : 0.08;
      var qx = mx - (dy / len) * len * bend, qy = my + (dx / len) * len * bend;
      e.path.setAttribute("d", "M" + ax.toFixed(1) + " " + ay.toFixed(1) + " Q" + qx.toFixed(1) + " " + qy.toFixed(1) + " " + b.x.toFixed(1) + " " + b.y.toFixed(1));
    });
  }
  function loop(ms) {
    if (!visible) { raf = 0; return; }
    draw(ms / 1000);
    raf = requestAnimationFrame(loop);
  }

  /* ---------- 3D portrait hub ---------- */
  function hubDims() {
    var inGraph = box.clientWidth > 10;
    var h = inGraph ? Math.round(Math.max(250, Math.min(380, Math.min(box.clientWidth, box.clientHeight) * 0.52))) : 300;
    return { w: Math.round(h * 0.6), h: h, inGraph: inGraph };
  }

  function layoutHub() {
    if (!hub) return;
    var d = hubDims();
    var target = d.inGraph ? hubEl : hubM;
    if (!target) return;
    hub.mount(target, d.w, d.h);
  }

  function loadScript(src) {
    return new Promise(function (ok, no) {
      var s = document.createElement("script");
      s.src = src; s.onload = ok; s.onerror = function () { no(new Error("could not load " + src)); };
      document.head.appendChild(s);
    });
  }
  function fromBase64() { // used on file://, where fetch() is blocked
    return loadScript("js/portrait-model.js").then(function () {
      var bin = atob(window.PORTRAIT_GLB_B64), u = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      return u.buffer;
    });
  }

  function startHub() {
    if (hubState !== "idle") return;
    hubState = "loading";
    var webgl = (function () { try { var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } })();
    if (!webgl) { failHub(); return; }

    loadScript("js/vendor/hub3d.js").then(function () {
      if (location.protocol === "file:") return fromBase64();
      return fetch("assets/portrait.glb").then(function (r) {
        if (!r.ok) throw new Error("glb " + r.status);
        return r.arrayBuffer();
      }).catch(fromBase64);
    }).then(function (buffer) {
      return window.PortraitHub.create({ buffer: buffer, accent: window.Site.cssVar("--accent") });
    }).then(function (c) {
      hub = c; hubState = "ready";
      layoutHub(); hub.reveal(); hub.setActive(inView);
    }).catch(failHub);
  }

  /* If WebGL or the model is unavailable, fall back to the still photo so the hub is never empty. */
  function failHub(err) {
    hubState = "failed";
    if (window.console) console.warn("[portrait hub] 3D portrait could not load, showing the still photo instead.", err && (err.message || err.target && err.target.src || err));
    build();
  }
  function drawFallback(g, cx, cy) {
    var me = el("g", { class: "g-me" }, g);
    var cp = el("clipPath", { id: "me-clip" }, el("defs", {}, me));
    el("circle", { cx: cx, cy: cy, r: 42 }, cp);
    el("circle", { cx: cx, cy: cy, r: 42, fill: "var(--paper-2)" }, me);
    el("image", { href: "assets/sudipto.png", x: cx - 104, y: cy - 62, width: 208, height: 230, "clip-path": "url(#me-clip)" }, me);
    el("circle", { class: "g-me__ring", cx: cx, cy: cy, r: 52 }, me);
  }

  window.Site.onTheme(function () { if (hub) hub.setAccent(window.Site.cssVar("--accent")); });

  /* ---------- start ---------- */
  var inView = false;
  build();
  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { build(); layoutHub(); }, 150);
  });

  var section = document.getElementById("toolkit") || box;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      inView = en[0].isIntersecting;
      if (inView) startHub();                 // lazy: nothing 3D loads until the section is near
      if (!reduce) {
        visible = inView;
        if (visible && !raf) raf = requestAnimationFrame(loop);
      }
      if (hub) hub.setActive(inView);         // and the 3D loop sleeps when it is off screen
    }, { rootMargin: "300px" }).observe(section);
  } else {
    inView = true; startHub();
  }
})();
