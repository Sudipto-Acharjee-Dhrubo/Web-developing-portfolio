/* ==========================================================================
   terminal.js — a small interactive terminal that introduces me.
   Commands read from window.DATA so the content stays in one place.
   ========================================================================== */
(function () {
  "use strict";
  var out = document.querySelector("[data-term-out]");
  var form = document.querySelector("[data-term-form]");
  var input = document.getElementById("term-in");
  var chipsEl = document.querySelector("[data-term-chips]");
  if (!out || !form || !input || !window.DATA) return;

  var D = window.DATA;
  var history = [], hIndex = 0;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function link(href, text, ext) {
    return '<a href="' + href + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + esc(text) + "</a>";
  }
  function print(html, cls) {
    var d = document.createElement("div");
    d.className = "term__line" + (cls ? " " + cls : "");
    d.innerHTML = html;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  }
  function pad(s, n) { s = String(s); while (s.length < n) s += " "; return s; }

  var commands = {
    help: function () {
      var rows = [
        ["whoami", "who I am"], ["projects", "where my work lives"], ["skills", "what I use"],
        ["learning", "what I am working on now"], ["dhrubo", "what my name means"],
        ["contact", "where to find me"], ["theme", "switch light and dark"],
        ["ls", "pages on this site"], ["clear", "clear the screen"]
      ];
      print('<span class="term__dim">available commands</span>');
      rows.forEach(function (r) { print('  <span class="term__key">' + pad(r[0], 10) + "</span>" + esc(r[1])); });
    },
    whoami: function () {
      print(esc(D.me.name));
      print('<span class="term__dim">' + esc(D.me.program) + "</span>");
      print('<span class="term__dim">' + esc(D.me.school) + ", " + esc(D.me.status) + "</span>");
    },
    projects: function () {
      print("My projects live on their own page: " + link("projects.html", "projects.html"));
      print('<span class="term__dim">' + D.projects.length + " of them, from the capstone to browser-side ML.</span>");
    },
    skills: function () {
      D.skills.hubs.forEach(function (h) {
        print('<span class="term__key">' + esc(h.label) + "</span>");
        print("  " + h.items.map(function (i) { return esc(i.label); }).join(", "), "term__dim");
      });
    },
    learning: function () {
      var g = { done: '<span class="term__ok">✓</span>', run: '<span class="term__key">●</span>', next: '<span class="term__dim">○</span>' };
      D.learning.forEach(function (l) { print(g[l.status] + " " + esc(l.text)); });
    },
    dhrubo: function () {
      print('ধ্রুব <span class="term__dim">(dhrubo)</span>');
      print("  adj. constant, fixed.  n. the pole star.");
      print('<span class="term__dim">In code: a value you can rely on. I try to be that, and to ship.</span>');
    },
    contact: function () {
      print("Email     " + link("mailto:" + D.me.email, D.me.email, true));
      print("GitHub    " + link(D.me.github, "github.com/Sudipto-Acharjee-Dhrubo", true));
      print("LinkedIn  " + link(D.me.linkedin, "in/sudiptoacharjeedhrubo", true));
      print("More      " + link("contact.html", "contact.html"));
    },
    ls: function () {
      print(["index.html", "projects.html", "certificates.html", "contact.html"].map(function (f) { return link(f, f); }).join("   "));
    },
    theme: function () {
      var t = window.Site.toggleTheme();
      print('<span class="term__ok">theme → ' + t + "</span>");
    },
    clear: function () { out.innerHTML = ""; },
    sudo: function (args) {
      if (args.join(" ") === "hire-me") {
        print('<span class="term__dim">[sudo] password for recruiter: ********</span>');
        print('<span class="term__ok">access granted.</span> Let’s talk: ' + link(D.me.linkedin, "LinkedIn", true) + " or " + link("contact.html", "contact.html") + ".");
      } else {
        print("sudo: try <span class=\"term__key\">sudo hire-me</span>");
      }
    }
  };

  function run(raw) {
    var line = raw.trim();
    if (!line) return;
    print(esc(line), "term__cmd");
    history.push(line); hIndex = history.length;
    var parts = line.split(/\s+/), name = parts[0].toLowerCase();
    if (commands[name]) commands[name](parts.slice(1));
    else print('command not found: ' + esc(name) + '. Try <span class="term__key">help</span>.');
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    run(input.value);
    input.value = "";
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp" && history.length) {
      e.preventDefault(); hIndex = Math.max(0, hIndex - 1); input.value = history[hIndex] || "";
    } else if (e.key === "ArrowDown") {
      e.preventDefault(); hIndex = Math.min(history.length, hIndex + 1); input.value = history[hIndex] || "";
    } else if (e.key === "Tab") {
      e.preventDefault();
      var v = input.value.trim().toLowerCase();
      if (!v) return;
      var m = Object.keys(commands).filter(function (c) { return c.indexOf(v) === 0; });
      if (m.length === 1) input.value = m[0];
    }
  });

  ["whoami", "projects", "skills", "learning", "dhrubo", "contact", "sudo hire-me", "theme"].forEach(function (c) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = c;
    b.addEventListener("click", function () { run(c); });
    chipsEl.appendChild(b);
  });

  /* Opening sequence — typed once, no scroll jump */
  print('<span class="term__dim">Welcome. Type a command, or tap one below.</span>');
  run("whoami");
  out.scrollTop = 0;
})();
