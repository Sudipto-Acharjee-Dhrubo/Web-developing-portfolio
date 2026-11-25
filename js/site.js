/* ==========================================================================
   site.js — behaviour shared by every page:
   theme cord, nav slider + mobile menu, cursor trail, footer clock.
   Classic script (no modules) so the site also works when opened from disk.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var Site = (window.Site = { reduceMotion: reduceMotion, listeners: [] });

  /* ---------- Theme ---------- */
  Site.theme = function () { return root.getAttribute("data-theme") || "light"; };
  Site.setTheme = function (t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch (e) {}
    Site.listeners.forEach(function (fn) { fn(t); });
  };
  Site.toggleTheme = function () {
    Site.setTheme(Site.theme() === "dark" ? "light" : "dark");
    return Site.theme();
  };
  Site.onTheme = function (fn) { Site.listeners.push(fn); };

  /** Reads a CSS custom property from :root (used by canvas / SVG code). */
  Site.cssVar = function (name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  };

  var cord = document.querySelector(".cord");
  if (cord) {
    cord.addEventListener("click", function () {
      cord.classList.remove("is-pulled");
      void cord.offsetWidth; // restart animation
      cord.classList.add("is-pulled");
      Site.toggleTheme();
    });
  }

  /* ---------- Nav: sliding pill + mobile menu ---------- */
  var nav = document.querySelector(".nav");
  var pill = document.querySelector(".nav__pill");
  var slider = document.querySelector(".nav__slider");
  if (pill && slider) {
    var links = Array.prototype.slice.call(pill.querySelectorAll("a"));
    var current = pill.querySelector('[aria-current="page"]') || links[0];

    var moveTo = function (el, hovering) {
      if (!el) return;
      slider.style.width = el.offsetWidth + "px";
      slider.style.transform = "translateX(" + el.offsetLeft + "px)";
      slider.classList.toggle("is-hover", !!hovering && el !== current);
    };
    var settle = function () { moveTo(current, false); };

    links.forEach(function (a) {
      a.addEventListener("mouseenter", function () { moveTo(a, true); });
      a.addEventListener("focus", function () { moveTo(a, true); });
    });
    pill.addEventListener("mouseleave", settle);
    pill.addEventListener("focusout", settle);
    window.addEventListener("resize", settle);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
    settle();
  }

  var menuBtn = document.querySelector(".nav__menu");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.textContent = open ? "Close" : "Menu";
    });
  }

  /* ---------- Cursor trail ---------- */
  var fine = window.matchMedia("(pointer: fine)").matches;
  if (fine && !reduceMotion) {
    var cur = document.createElement("div");
    cur.className = "cursor";
    cur.innerHTML = '<span class="cursor__label"></span>';
    document.body.appendChild(cur);
    var label = cur.firstChild;
    var tx = 0, ty = 0, x = 0, y = 0;

    window.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      cur.classList.add("is-on");
    }, { passive: true });
    document.addEventListener("pointerleave", function () { cur.classList.remove("is-on"); });

    document.addEventListener("pointerover", function (e) {
      var t = e.target.closest ? e.target.closest("[data-cursor], a, button, input, textarea, summary") : null;
      var text = t && t.getAttribute("data-cursor");
      cur.classList.toggle("is-label", !!text);
      cur.classList.toggle("is-link", !!t && !text);
      label.textContent = text || "";
    });

    (function loop() {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      cur.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Footer clock (Dhaka) ---------- */
  var clock = document.querySelector("[data-clock]");
  if (clock) {
    var fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    });
    var tick = function () { clock.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 1000);
  }
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
