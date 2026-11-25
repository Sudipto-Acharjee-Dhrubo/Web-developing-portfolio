/* ==========================================================================
   contact.js — fills the page from window.DATA.me, copy-to-clipboard buttons,
   and a form that opens the visitor's own mail app with the message filled in
   (the site is static, so there is no server to send mail).
   ========================================================================== */
(function () {
  "use strict";
  var me = window.DATA && window.DATA.me;
  if (!me) return;

  var form = document.querySelector("[data-form]");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = new FormData(form);
    var subject = "Hello from " + (f.get("name") || "your portfolio");
    var body = (f.get("message") || "") + "\n\n— " + (f.get("name") || "") + (f.get("from") ? "\n" + f.get("from") : "");
    window.location.href = "mailto:" + me.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-copy]"), function (btn) {
    var label = btn.textContent;
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () { btn.classList.add("is-done"); btn.textContent = "Copied"; setTimeout(function () { btn.classList.remove("is-done"); btn.textContent = label; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { window.prompt("Copy this:", text); });
      else window.prompt("Copy this:", text);
    });
  });
})();
