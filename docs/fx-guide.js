/* Creative layer for the guide: ripple dot fields, glyph trail, nav decode, typed line,
   marquee, spotlight/tilt, magnetic buttons, step progress and diagram pulses. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function cssVar(n, fb) { var v = getComputedStyle(root).getPropertyValue(n).trim(); return v || fb; }

  /* Interactive dot field: cursor bulge plus click ripples. */
  function dotField(host, opts) {
    opts = opts || {};
    var cv = document.createElement("canvas");
    cv.className = "fx-field"; cv.setAttribute("aria-hidden", "true");
    host.appendChild(cv);
    var ctx = cv.getContext("2d"), sp = opts.spacing || 22;
    var w = 0, h = 0, dpr = 1, mouse = { x: -999, y: -999, a: 0 }, ripples = [], visible = true, raf = 0;
    var base, acc, mag;
    function colors() { base = cssVar("--cp-border-strong", "#888"); acc = cssVar("--cp-accent", "#a78bfa"); mag = cssVar("--cp-chart-magenta", "#e879f9"); }
    function size() {
      var r = host.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw(now) {
      ctx.clearRect(0, 0, w, h);
      ripples = ripples.filter(function (r) { return now - r.t < 1800; });
      for (var x = sp / 2; x < w; x += sp) for (var y = sp / 2; y < h; y += sp) {
        var dx = x - mouse.x, dy = y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
        var k = Math.max(0, 1 - d / 150) * mouse.a;
        var px = x + (d ? dx / d : 0) * k * 7, py = y + (d ? dy / d : 0) * k * 7;
        var rad = 1.1 + k * 2.4, col = k > 0.05 ? acc : base, alpha = 0.35 + k * 0.65;
        for (var i = 0; i < ripples.length; i++) {
          var R = ripples[i], age = (now - R.t) / 1000, ring = age * 380;
          var rd = Math.abs(Math.sqrt((x - R.x) * (x - R.x) + (y - R.y) * (y - R.y)) - ring);
          if (rd < 46) {
            var f = (1 - rd / 46) * (1 - age / 1.8);
            var a = Math.atan2(y - R.y, x - R.x);
            px += Math.cos(a) * f * 9; py += Math.sin(a) * f * 9;
            rad += f * 2.6; col = mag; alpha = Math.max(alpha, 0.35 + f * 0.65);
          }
        }
        ctx.globalAlpha = Math.min(1, alpha); ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(px, py, rad, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function loop(now) {
      raf = 0;
      mouse.a += ((mouse.on ? 1 : 0) - mouse.a) * 0.12;
      draw(now);
      if (visible && !reduce && (ripples.length || mouse.a > 0.01 || mouse.on)) raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf && visible && !reduce) raf = requestAnimationFrame(loop); }
    function pos(e) { var r = host.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }
    host.addEventListener("pointermove", function (e) { pos(e); mouse.on = true; kick(); });
    host.addEventListener("pointerleave", function () { mouse.on = false; kick(); });
    host.addEventListener("pointerdown", function (e) { pos(e); ripples.push({ x: mouse.x, y: mouse.y, t: performance.now() }); kick(); });
    window.addEventListener("resize", function () { size(); draw(performance.now()); });
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) kick(); }).observe(host);
    new MutationObserver(function () { colors(); draw(performance.now()); }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    colors(); size(); draw(performance.now());
    if (!reduce && opts.intro) setTimeout(function () { ripples.push({ x: w * 0.72, y: h * 0.32, t: performance.now() }); kick(); }, 700);
    root.classList.add("fx-on");
  }

  /* Glyph trail: only over empty space, so text stays easy to select and copy. */
  function trail() {
    if (reduce || !fine) return;
    var SKIP = "header,nav,a,button,input,textarea,select,label,pre,code,summary,video,img,table,.fx-term,.fx-marquee";
    var colors = ["#c3a0ef", "#f73678", "#ff9d4d", "#69aeff", "#5fed83", "#e6cf3a"], glyphs = "-/).+=><*&(".split("");
    var N = 10, blocks = [], idx = 0, lx = -1, ly = -1;
    for (var i = 0; i < N; i++) { var b = document.createElement("div"); b.className = "fx-trail-block"; b.setAttribute("aria-hidden", "true"); document.body.appendChild(b); blocks.push(b); }
    function overText(el) {
      if (!el || !el.closest) return true;
      if (el.closest(SKIP)) return true;
      for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) return true;
      return false;
    }
    document.addEventListener("mousemove", function (e) {
      if (overText(e.target)) return;
      var x = 20 * Math.floor(e.clientX / 20), y = 20 * Math.floor(e.clientY / 20);
      if (x === lx && y === ly) return;
      lx = x; ly = y; idx = (idx + 1) % N;
      var b = blocks[idx];
      b.style.transform = "translate(" + x + "px," + y + "px)";
      b.style.background = colors[(Math.random() * colors.length) | 0];
      b.textContent = Math.random() < 0.3 ? " " : glyphs[(Math.random() * glyphs.length) | 0];
      b.classList.add("fx-active");
      setTimeout(function () { b.classList.remove("fx-active"); }, 100 + 300 * Math.random());
    });
  }

  /* Nav text decode on mouse-leave and focus. */
  function decode(links) {
    if (reduce) return;
    var CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.!@#$%^&*()_+-=[]{}|/;<>?";
    links.forEach(function (a) {
      var text = a.textContent, timers = [];
      if (a.children.length) return;
      a.textContent = "";
      a.setAttribute("aria-label", text);
      var el = document.createElement("span"); el.className = "fx-dec";
      var ph = document.createElement("span"); ph.className = "fx-ph"; ph.textContent = text;
      var live = document.createElement("span"); live.className = "fx-live"; live.setAttribute("aria-hidden", "true"); live.textContent = text;
      el.append(ph, live); a.appendChild(el);
      function run() {
        timers.forEach(clearTimeout); timers = [];
        var buf = new Array(text.length).fill(" ");
        for (var i = 0; i < text.length; i++) (function (i) {
          var fl = 1 + ((Math.random() * 2) | 0);
          for (var f = 0; f <= fl; f++) (function (f) {
            timers.push(setTimeout(function () {
              buf[i] = f < fl && text.charAt(i) !== " " ? CH.charAt((Math.random() * CH.length) | 0) : text.charAt(i);
              live.textContent = buf.join("");
            }, 40 * i + 45 * f));
          })(f);
        })(i);
      }
      a.addEventListener("mouseleave", run);
      a.addEventListener("focus", run);
    });
  }

  /* Typed terminal line. */
  function terminal() {
    var anchor = $(".hero .lede");
    if (!anchor) return;
    var line = document.createElement("div");
    line.className = "fx-term"; line.setAttribute("aria-hidden", "true");
    var full = 'copilot "make me an animated video about…"';
    line.innerHTML = '<b>&gt;_</b><span class="fx-t"></span><i class="fx-caret"></i>';
    anchor.parentNode.insertBefore(line, anchor);
    var t = $(".fx-t", line);
    if (reduce) { t.textContent = full; return; }
    var i = 0;
    setTimeout(function tick() { t.textContent = full.slice(0, ++i); if (i < full.length) setTimeout(tick, 32 + Math.random() * 40); }, 500);
  }

  /* Marquee band of the tech used. */
  function marquee() {
    var hero = $(".hero");
    if (!hero) return;
    var words = ["Canvas", "SVG", "WebGL", "Neural TTS", "ffmpeg", "Microsoft Edge", "Synth music", "Copilot skills", "One prompt"];
    var set = words.map(function (w) { return "<span>" + w + "</span><i>✦</i>"; }).join("");
    var m = document.createElement("div");
    m.className = "fx-marquee"; m.setAttribute("aria-hidden", "true");
    m.innerHTML = '<div class="fx-marquee-track">' + set + set + "</div>";
    hero.parentNode.insertBefore(m, hero.nextSibling);
  }

  /* Spotlight glow and tilt. */
  function spotlight() {
    if (!fine) return;
    $$(".card, .callout, .dl-card, .hero .facts li, .table-wrap").forEach(function (el) {
      var tilt = el.matches(".dl-card, .hero .facts li");
      el.classList.add("fx-spot"); if (tilt && !reduce) el.classList.add("fx-tilt");
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        el.style.setProperty("--mx", x + "px"); el.style.setProperty("--my", y + "px");
        if (tilt && !reduce) { el.style.setProperty("--rx", ((x / r.width - 0.5) * 8).toFixed(2) + "deg"); el.style.setProperty("--ry", ((0.5 - y / r.height) * 8).toFixed(2) + "deg"); }
        el.classList.add("fx-hot");
      });
      el.addEventListener("pointerleave", function () { el.classList.remove("fx-hot"); el.style.removeProperty("--rx"); el.style.removeProperty("--ry"); });
    });
  }

  function magnetic() {
    if (!fine || reduce) return;
    $$(".cta-row .btn").forEach(function (b) {
      b.classList.add("fx-mag");
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* Each step lights up (and the connector fills) as you scroll to it. */
  function steps() {
    var items = $$(".steps > li");
    if (!items.length) return;
    var q = false;
    function check() {
      q = false;
      items.forEach(function (li) { if (li.getBoundingClientRect().top < window.innerHeight * 0.65) li.classList.add("fx-reached"); });
    }
    window.addEventListener("scroll", function () { if (!q) { q = true; requestAnimationFrame(check); } }, { passive: true });
    check();
  }

  /* Glowing pulses travel along the hero diagram's connectors. */
  function pulses() {
    if (reduce) return;
    var NS = "http://www.w3.org/2000/svg", svg = $(".dl-signal svg");
    if (!svg) return;
    [["M200 140 H230", 0], ["M430 140 C450 140 450 62 470 62", 0.9], ["M430 140 H470", 1.1], ["M430 140 C450 140 450 218 470 218", 1.3],
     ["M670 62 C690 62 690 140 710 140", 2.1], ["M670 140 H710", 2.3], ["M670 218 C690 218 690 140 710 140", 2.5],
     ["M800 180 V266 H330 V180", 3.2]].forEach(function (p) {
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("r", "4"); c.setAttribute("class", "fx-pulse");
      var a = document.createElementNS(NS, "animateMotion");
      a.setAttribute("path", p[0]); a.setAttribute("dur", p[1] > 3 ? "2.6s" : "1.1s"); a.setAttribute("begin", p[1] + "s"); a.setAttribute("repeatCount", "indefinite");
      c.appendChild(a); svg.appendChild(c);
    });
  }

  var hero = $(".hero"), foot = $(".site-footer");
  if (hero) dotField(hero, { intro: true });
  if (foot) dotField(foot, { spacing: 24 });
  trail();
  terminal();
  marquee();
  decode($$(".chips a, .toc a"));
  spotlight();
  magnetic();
  steps();
  pulses();
})();
