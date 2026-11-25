/* ==========================================================================
   learning.js — "currently learning" log with a live spinner on running rows.
   ========================================================================== */
(function () {
  "use strict";
  var box = document.querySelector("[data-learning]");
  if (!box || !window.DATA) return;
  var reduce = window.Site && window.Site.reduceMotion;
  var spinners = [];
  var frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  window.DATA.learning.forEach(function (l) {
    var row = document.createElement("div");
    row.className = "log__row";
    row.setAttribute("data-status", l.status);
    var glyph = l.status === "done" ? "✓" : l.status === "run" ? frames[0] : "○";
    var label = l.status === "done" ? "done" : l.status === "run" ? "in progress" : "up next";
    row.innerHTML = '<span class="log__g" aria-hidden="true">' + glyph + "</span>" +
      '<span class="log__t">' + esc(l.text) + '<span class="sr-only"> (' + label + ")</span></span>" +
      '<span class="log__d">' + esc(l.detail) + "</span>";
    box.appendChild(row);
    if (l.status === "run") spinners.push(row.querySelector(".log__g"));
  });

  if (!reduce && spinners.length) {
    var i = 0;
    setInterval(function () {
      i = (i + 1) % frames.length;
      spinners.forEach(function (s) { s.textContent = frames[i]; });
    }, 90);
  }
})();
