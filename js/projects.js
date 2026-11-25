/* ==========================================================================
   projects.js — builds the project cards from window.DATA.projects.
   Each card gets a small hand-drawn SVG that comes alive on hover.
   ========================================================================== */
(function () {
  "use strict";
  var grid = document.querySelector("[data-work-grid]");
  if (!grid || !window.DATA) return;
  var D = window.DATA;

  /* ---------- illustrations ---------- */
  function hand() {
    var chains = [
      [[50, 92], [36, 80], [26, 68], [19, 55], [14, 43]],        // thumb
      [[50, 92], [42, 62], [40, 46], [39, 33], [38, 21]],        // index
      [[50, 92], [52, 60], [52, 42], [52, 27], [52, 14]],        // middle
      [[50, 92], [62, 62], [64, 45], [65, 33], [66, 22]],        // ring
      [[50, 92], [71, 68], [76, 55], [79, 45], [82, 36]]         // pinky
    ];
    var lines = chains.map(function (c) {
      return '<polyline class="v-stroke" points="' + c.map(function (p) { return p.join(","); }).join(" ") + '"/>';
    }).join("");
    var palm = '<polyline class="v-stroke" points="42,62 52,60 62,62 71,68"/>';
    var dots = "";
    chains.forEach(function (c, ci) {
      c.slice(ci === 0 ? 1 : 1).forEach(function (p) { dots += '<circle class="v-joint v-fill" cx="' + p[0] + '" cy="' + p[1] + '" r="2.1"/>'; });
    });
    dots += '<circle class="v-fill" cx="50" cy="92" r="2.8"/>';
    return '<svg viewBox="0 0 100 100" aria-hidden="true">' + lines + palm + dots +
      '<g transform="translate(72 8)"><rect class="v-soft" width="26" height="12" rx="6"/><text class="v-txt" x="13" y="8.4" text-anchor="middle">“hello”</text></g></svg>';
  }

  function face() {
    return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<path class="v-stroke v-acc" d="M18 30V14h16M66 14h16v16M82 70v16H66M34 86H18V70"/>' +
      '<ellipse class="v-stroke" cx="50" cy="50" rx="19" ry="25"/>' +
      '<ellipse class="v-eye v-fill" cx="42" cy="44" rx="3.2" ry="2.4"/><ellipse class="v-eye v-fill" cx="58" cy="44" rx="3.2" ry="2.4"/>' +
      '<path class="v-stroke" d="M50 48v9M43 63q7 5 14 0"/>' +
      '<rect class="v-scan v-fill" x="20" y="16" width="60" height="1.6" rx="0.8" opacity="0.8"/>' +
      '<g transform="translate(60 4)"><rect class="v-soft" width="34" height="12" rx="6"/><text class="v-txt" x="17" y="8.4" text-anchor="middle">✓ marked</text></g></svg>';
  }

  function ecg() {
    var d = "M4 38H28l4-5 4 10 5-28 6 42 5-19 3 0H66l4-5 4 10 5-28 6 42 5-19H116";
    return '<svg viewBox="0 0 120 68" aria-hidden="true">' +
      '<path class="v-stroke" style="opacity:.4" d="' + d + '"/>' +
      '<path class="v-stroke v-acc v-ecg" stroke-width="2.2" d="' + d + '"/>' +
      '<text class="v-mono" x="4" y="10">POST /predict</text><text class="v-mono" x="4" y="62">200 OK · docker</text></svg>';
  }

  function orbit() {
    return '<svg viewBox="0 0 120 100" aria-hidden="true">' +
      '<circle class="v-stroke" cx="60" cy="50" r="24"/><circle class="v-stroke" cx="60" cy="50" r="40" style="opacity:.6"/>' +
      '<circle class="v-fill" cx="60" cy="50" r="7"/>' +
      '<g class="v-orbit"><circle class="v-fill" cx="84" cy="50" r="3.2"/></g>' +
      '<g class="v-orbit v-orbit--b"><circle fill="currentColor" cx="20" cy="50" r="2.6"/></g>' +
      '<circle fill="currentColor" cx="14" cy="14" r="1"/><circle fill="currentColor" cx="104" cy="22" r="1.2"/><circle fill="currentColor" cx="96" cy="88" r="1"/></svg>';
  }

  function link() {
    return '<div class="v-link" aria-hidden="true"><span class="v-long">https://example.com/a/very/long/path?id=8472&ref=mail</span>' +
      '<span class="v-short">sho.rt/x7Q</span></div>';
  }

  function club() {
    var n = [[60, 34], [24, 18], [96, 18], [22, 54], [98, 52], [60, 62], [60, 8]];
    var e = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 3], [2, 4], [1, 6], [2, 6]];
    var lines = e.map(function (p) {
      return '<line class="v-stroke v-edge" x1="' + n[p[0]][0] + '" y1="' + n[p[0]][1] + '" x2="' + n[p[1]][0] + '" y2="' + n[p[1]][1] + '"/>';
    }).join("");
    var dots = n.map(function (p, i) {
      return i === 0 ? '<circle class="v-fill" cx="' + p[0] + '" cy="' + p[1] + '" r="6"/>'
        : '<circle class="v-joint" fill="var(--paper)" stroke="currentColor" stroke-width="1.4" cx="' + p[0] + '" cy="' + p[1] + '" r="3.6"/>';
    }).join("");
    return '<svg viewBox="0 0 120 68" aria-hidden="true">' + lines + dots + "</svg>";
  }

  function derm() {
    /* a real dermoscopy image (ISIC_0009992) with the model's output drawn over the lesion */
    return '<img class="pcard__photo" src="assets/dermo-lesion.jpg" width="900" height="675" alt="" loading="lazy" decoding="async">' +
      '<svg class="pcard__ov" viewBox="0 0 100 75" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<defs><linearGradient id="dshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient></defs>' +
      '<rect width="100" height="75" fill="url(#dshade)"/>' +
      '<ellipse class="v-stroke v-acc v-contour" stroke-width="1.1" cx="37" cy="40" rx="27" ry="25" style="stroke:var(--accent)"/>' +
      '<g transform="translate(4 5)"><rect width="36" height="8" rx="4" fill="rgba(10,10,16,.78)"/><text x="18" y="5.4" text-anchor="middle" style="font:600 4.2px var(--font-sans);fill:#fff">melanoma 0.73</text></g>' +
      '<g transform="translate(60 62)"><rect fill="var(--accent)" width="26" height="8" rx="4"/><text x="13" y="5.4" text-anchor="middle" style="font:700 4.2px var(--font-sans);fill:var(--accent-ink)">abstain</text></g>' +
      '<text x="4" y="71" style="font:500 3.6px var(--font-mono);fill:#fff;opacity:.85">A · B · C · D</text></svg>';
  }

  function route() {
    return '<svg viewBox="0 0 120 68" aria-hidden="true">' +
      '<path class="v-stroke" style="opacity:.35" d="M6 56C24 56 26 30 44 30S62 52 78 44 98 14 114 12"/>' +
      '<path class="v-stroke v-acc v-trail" stroke-width="2" d="M6 56C24 56 26 30 44 30S62 52 78 44 98 14 114 12"/>' +
      '<circle class="v-fill" cx="6" cy="56" r="3.2"/><circle class="v-fill v-joint" cx="114" cy="12" r="4.4"/>' +
      '<circle cx="44" cy="30" r="2.4" fill="currentColor"/><circle cx="78" cy="44" r="2.4" fill="currentColor"/></svg>';
  }

  var visuals = { path: route, hand: hand, face: face, ecg: ecg, orbit: orbit, link: link, club: club, derm: derm };

  /* ---------- card ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function build(p) {
    var el = document.createElement("article");
    el.className = "pcard" + (p.featured ? " pcard--featured" : "");
    el.setAttribute("data-id", p.id);
    el.setAttribute("data-cat", p.cat || "");

    var main, extra = "";
    if (p.repo) {
      main = '<a class="is-main link-u" data-cursor="Code" href="' + (/^https?:/.test(p.repo) ? p.repo : D.me.github + "/" + p.repo) + '" target="_blank" rel="noopener" aria-label="' + esc(p.title) + ' on GitHub">Code <span aria-hidden="true">↗</span></a>';
    } else {
      main = "";
    }
    if (p.demo) extra = '<a class="link-u" href="' + p.demo + '" target="_blank" rel="noopener">Live demo <span aria-hidden="true">↗</span></a>';

    el.innerHTML =
      '<div class="pcard__vis">' + (visuals[p.visual] ? visuals[p.visual]() : "") + "</div>" +
      '<div class="pcard__body">' +
        '<div class="pcard__head"><h3 class="pcard__title">' + esc(p.title) + '</h3><span class="pcard__kind">' + esc(p.kind) + "</span>" + (p.latest ? '<span class="pcard__badge">latest</span>' : "") + "</div>" +
        '<p class="pcard__desc">' + esc(p.desc.replace(" (check)", "")) + "</p>" +
        (p.fact ? '<p class="pcard__fact">' + esc(p.fact) + "</p>" : "") +
        '<ul class="pcard__tags">' + p.tags.map(function (t) { return '<li class="tag">' + esc(t) + "</li>"; }).join("") + "</ul>" +
        '<div class="pcard__links">' + main + extra + "</div>" +
      "</div>";
    return el;
  }

  D.projects.forEach(function (p) { grid.appendChild(build(p)); });
  var more = document.createElement("a");
  more.className = "pmore"; more.href = D.me.github; more.target = "_blank"; more.rel = "noopener"; more.setAttribute("data-cat", "*");
  more.innerHTML = '<span class="pmore__code mono">git clone --all</span><span class="pmore__t">More on GitHub <span aria-hidden="true">↗</span></span><span class="pmore__s">Smaller experiments and coursework live there too.</span>';
  grid.appendChild(more);

  /* ---------- filters (projects page only) ---------- */
  var bar = document.querySelector("[data-filters]");
  if (bar) {
    var cards = Array.prototype.slice.call(grid.children);
    var count = document.querySelector("[data-count]");
    var empty = document.querySelector("[data-empty]");
    var apply = function (key) {
      var n = 0;
      cards.forEach(function (c) {
        var show = key === "all" || c.getAttribute("data-cat") === key || c.getAttribute("data-cat") === "*";
        c.hidden = !show; if (show && c.classList.contains("pcard")) n++;
      });
      if (count) count.textContent = n + (n === 1 ? " project" : " projects");
      if (empty) empty.hidden = n > 0;
      Array.prototype.forEach.call(bar.querySelectorAll("button"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-f") === key ? "true" : "false");
      });
    };
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-f]");
      if (b) apply(b.getAttribute("data-f"));
    });
    apply("all");
  }
})();
