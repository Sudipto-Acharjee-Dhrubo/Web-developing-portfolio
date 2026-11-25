/* ==========================================================================
   certificates.js — builds the certificate cards from window.DATA.certs,
   filters them, and opens a full-size viewer (native <dialog>) with prev / next.
   ========================================================================== */
(function () {
  "use strict";
  var grid = document.querySelector("[data-cert-grid]");
  if (!grid || !window.DATA) return;
  var certs = window.DATA.certs;
  var dlg = document.querySelector("[data-viewer]");
  var cur = -1;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var labels = { ai: "AI and ML", sim: "Job simulation", event: "Competition", uni: "ULAB" };

  certs.forEach(function (c, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "ccard"; b.setAttribute("data-cat", c.cat); b.setAttribute("data-i", i);
    b.setAttribute("aria-label", "View certificate: " + c.title);
    b.innerHTML =
      '<span class="ccard__paper"><img src="assets/certs/' + c.img + '-thumb.jpg" alt="Certificate: ' + esc(c.title) + '" loading="lazy" decoding="async"></span>' +
      '<span class="ccard__meta">' +
        '<span class="ccard__row"><span class="ccard__tag">' + labels[c.cat] + '</span><span class="ccard__date">' + esc(c.date) + "</span></span>" +
        '<span class="ccard__title">' + esc(c.title) + "</span>" +
        '<span class="ccard__issuer">' + esc(c.issuer) + "</span>" +
      "</span>";
    grid.appendChild(b);
  });
  var cards = Array.prototype.slice.call(grid.children);

  /* ---------- filters ---------- */
  var bar = document.querySelector("[data-filters]"), count = document.querySelector("[data-count]");
  function apply(key) {
    var n = 0;
    cards.forEach(function (c) { var s = key === "all" || c.getAttribute("data-cat") === key; c.hidden = !s; if (s) n++; });
    if (count) count.textContent = n + (n === 1 ? " certificate" : " certificates");
    Array.prototype.forEach.call(bar.querySelectorAll("button"), function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-f") === key)); });
  }
  if (bar) {
    bar.addEventListener("click", function (e) { var b = e.target.closest("button[data-f]"); if (b) apply(b.getAttribute("data-f")); });
    apply("all");
  }

  /* ---------- viewer ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var vimg = dlg.querySelector("[data-v-img]");
  var EASE = "cubic-bezier(0.2, 0.7, 0.1, 1)";
  function visible() { return cards.filter(function (c) { return !c.hidden; }).map(function (c) { return +c.getAttribute("data-i"); }); }
  function thumbOf(i) { return cards[i] && cards[i].querySelector("img"); }

  function show(i) {
    cur = i; var c = certs[i], th = thumbOf(i);
    var ar = th && th.naturalWidth ? th.naturalWidth / th.naturalHeight : 1.4;
    vimg.style.setProperty("--ar", ar.toFixed(4));
    vimg.style.backgroundImage = "url(assets/certs/" + c.img + "-thumb.jpg)";
    vimg.src = "assets/certs/" + c.img + ".jpg"; vimg.alt = "Certificate: " + c.title;
    dlg.querySelector("[data-v-title]").textContent = c.title;
    dlg.querySelector("[data-v-sub]").textContent = c.issuer + (c.date ? " · " + c.date : "");
    dlg.querySelector("[data-v-note]").textContent = c.note || "";
    var pdf = dlg.querySelector("[data-v-pdf]");
    if (c.pdf) { pdf.href = "assets/certs/" + c.img + ".pdf"; pdf.hidden = false; } else pdf.hidden = true;
  }

  /* the certificate lifts out of its card (a shared-element move) and settles in the viewer */
  function fromTo(a, b, back) {
    var dx = a.left - b.left, dy = a.top - b.top, sx = a.width / b.width, sy = a.height / b.height;
    var small = "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ")";
    var lift = back ? "rotateX(0) rotateY(0)" : "rotateX(8deg) rotateY(-14deg)";
    var frames = back
      ? [{ transform: "none" }, { transform: small }]
      : [{ transform: small + " " + lift, offset: 0 }, { transform: "translate(" + dx * 0.25 + "px," + dy * 0.25 + "px) scale(" + (1 + (sx - 1) * 0.25) + ") rotateX(-2deg) rotateY(3deg)", offset: 0.7 }, { transform: "none", offset: 1 }];
    return vimg.animate(frames, { duration: back ? 380 : 620, easing: EASE, fill: back ? "forwards" : "none" });
  }

  function openFrom(card) {
    var i = +card.getAttribute("data-i"), th = thumbOf(i), first = th.getBoundingClientRect();
    show(i);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    document.documentElement.classList.add("is-locked");
    if (reduce) return;
    var last = vimg.getBoundingClientRect();
    th.style.opacity = "0";
    dlg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: "ease-out" });
    dlg.querySelector(".viewer__bar").animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 420, delay: 260, easing: EASE, fill: "backwards" });
    var an = fromTo(first, last, false);
    an.onfinish = an.oncancel = function () { th.style.opacity = ""; };
  }

  var closing = false;
  function closeViewer() {
    if (closing || !dlg.open) return;
    var th = thumbOf(cur), r = th && th.getBoundingClientRect();
    var onScreen = r && r.bottom > 0 && r.top < innerHeight && !cards[cur].hidden;
    if (reduce || !onScreen) { dlg.close(); return; }
    closing = true; th.style.opacity = "0";
    var an = fromTo(r, vimg.getBoundingClientRect(), true);
    dlg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 340, delay: 60, easing: "ease-in", fill: "forwards" });
    an.onfinish = function () {
      th.style.opacity = ""; dlg.close(); closing = false;
      vimg.getAnimations().forEach(function (x) { x.cancel(); }); dlg.getAnimations().forEach(function (x) { x.cancel(); });
    };
  }

  function step(d) {
    var v = visible(); if (!v.length || closing) return;
    var at = v.indexOf(cur); show(v[(at + d + v.length) % v.length]);
    if (!reduce) vimg.animate([{ opacity: 0, transform: "translateX(" + d * 48 + "px) rotateY(" + d * -10 + "deg)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: EASE });
  }

  grid.addEventListener("click", function (e) {
    var b = e.target.closest(".ccard"); if (b) openFrom(b);
  });
  dlg.addEventListener("cancel", function (e) { e.preventDefault(); closeViewer(); });
  dlg.addEventListener("close", function () { document.documentElement.classList.remove("is-locked"); var c = cards[cur]; if (c) c.focus(); });
  dlg.addEventListener("click", function (e) {
    if (e.target === dlg || e.target.closest("[data-v-close]")) closeViewer();
    else if (e.target.closest("[data-v-prev]")) step(-1);
    else if (e.target.closest("[data-v-next]")) step(1);
  });
  dlg.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") step(-1); else if (e.key === "ArrowRight") step(1);
  });
})();
