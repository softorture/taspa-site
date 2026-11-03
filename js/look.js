/* Taspa, site v4.1: try the look. Our cast in the demo capsule (wardrobe v1, 22.10.2026):
   one piece changes per step, the face stays. The stage is a white studio in every site mode.
   Three creators, the middle one is active: arrows, a click on a side figure, a swipe or the arrow keys switch.
   Five looks per creator; the panel lists the pieces, hotspots sit on the figure, the new piece is marked.
   The first time the stage is in view the looks play once by themselves, until any click.
   Hotspot positions are % of the figure box (760 x 1362 images). Texts of the section are in the page. */
(function () {
  "use strict";
  var box = document.querySelector("[data-ttl]");
  if (!box) return;
  var root = document.documentElement;
  var lang = root.lang === "ru" ? "ru" : "en";
  var me = document.currentScript;
  var base = me && me.src ? new URL("../assets/look/", me.src).href : "assets/look/";
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; };
  var reduce = mq("(prefers-reduced-motion: reduce)").matches;
  var fine = mq("(hover: hover) and (pointer: fine)").matches;

  var T = {
    en: { look: "Look", of: "of", isNew: "New", seen: "Seen in",
          items: { i01: "Camel blazer", i02: "Beige trench", i03: "White tee", i04: "Cable-knit sweater", i05: "Brown trousers",
                   i06: "Light-wash jeans", i07: "Brown loafers", i08: "White sneakers", i09: "AY crescent bag", i10: "Ultramarine puffer",
                   i11: "Tomato bomber", i13: "Mint polo", i14: "Emerald pleated skirt", i15: "Red suede sneakers", i16: "Sky mini bag" },
          looks: { maya: ["Base", "Puffer", "Skirt", "Red sneakers", "Mini bag"],
                   vera: ["Base", "Bomber", "Polo", "Skirt", "Red sneakers"],
                   leo: ["Base", "Polo", "Trench", "Jeans", "Puffer"] } },
    ru: { look: "Образ", of: "из", isNew: "Новое", seen: "В ролике",
          items: { i01: "Пиджак цвета кэмел", i02: "Бежевый тренч", i03: "Белая футболка", i04: "Свитер с косами", i05: "Коричневые брюки",
                   i06: "Светлые джинсы", i07: "Коричневые лоферы", i08: "Белые кеды", i09: "Сумка-полумесяц AY", i10: "Ультрамариновый пуховик",
                   i11: "Томатный бомбер", i13: "Мятное поло", i14: "Изумрудная юбка плиссе", i15: "Красные замшевые кеды", i16: "Голубая мини-сумка" },
          looks: { maya: ["База", "Пуховик", "Юбка", "Красные кеды", "Мини-сумка"],
                   vera: ["База", "Бомбер", "Поло", "Юбка", "Красные кеды"],
                   leo: ["База", "Поло", "Тренч", "Джинсы", "Пуховик"] } }
  }[lang];

  /* items: [piece, x %, y %]; isNew: the piece that changed at this step; seen: a case video with this look */
  var DATA = {
    maya: [
      { items: [["i01", 36, 32], ["i03", 50, 22], ["i05", 42, 73], ["i07", 37, 94], ["i09", 58, 46]], seen: ["FL_MB_maya_modelbehavior.mp4", "Model Behavior"] },
      { items: [["i10", 32, 34], ["i03", 50, 22], ["i05", 42, 73], ["i07", 37, 94], ["i09", 60, 47]], isNew: "i10" },
      { items: [["i10", 32, 34], ["i03", 50, 22], ["i14", 42, 68], ["i07", 37, 94], ["i09", 60, 47]], isNew: "i14" },
      { items: [["i10", 32, 34], ["i03", 50, 22], ["i14", 42, 68], ["i15", 37, 94], ["i09", 60, 47]], isNew: "i15" },
      { items: [["i10", 32, 34], ["i03", 50, 22], ["i14", 42, 68], ["i15", 37, 94], ["i16", 63, 48]], isNew: "i16" }
    ],
    vera: [
      { items: [["i02", 35, 42], ["i04", 50, 26], ["i06", 44, 80], ["i08", 42, 94]] },
      { items: [["i11", 32, 35], ["i04", 50, 27], ["i06", 44, 72], ["i08", 42, 94]], isNew: "i11" },
      { items: [["i11", 32, 35], ["i13", 50, 25], ["i06", 44, 72], ["i08", 42, 94]], isNew: "i13" },
      { items: [["i11", 32, 35], ["i13", 50, 25], ["i14", 43, 66], ["i08", 42, 94]], isNew: "i14" },
      { items: [["i11", 32, 35], ["i13", 50, 25], ["i14", 43, 66], ["i15", 42, 94]], isNew: "i15" }
    ],
    leo: [
      { items: [["i04", 38, 33], ["i05", 42, 72], ["i07", 41, 95]] },
      { items: [["i13", 38, 30], ["i05", 42, 72], ["i07", 41, 95]], isNew: "i13" },
      { items: [["i02", 34, 45], ["i13", 50, 23], ["i05", 45, 82], ["i07", 41, 95]], isNew: "i02" },
      { items: [["i02", 34, 45], ["i13", 50, 23], ["i06", 45, 82], ["i07", 41, 95]], isNew: "i06" },
      { items: [["i10", 33, 38], ["i13", 50, 30], ["i06", 45, 76], ["i07", 41, 95]], isNew: "i10" }
    ]
  };

  var stage = box.querySelector(".ttl-stage");
  var figs = Array.prototype.slice.call(box.querySelectorAll(".ttl-fig"));
  var names = figs.map(function (f) { return f.getAttribute("data-name") || f.dataset.model; });
  var looks = figs.map(function (f) { return DATA[f.dataset.model]; });
  var n = figs.length, active = 0;
  var steps = figs.map(function () { return 0; });
  var who = box.querySelector(".ttl-who b"), whoStep = box.querySelector(".ttl-who span");
  var chips = box.querySelector(".ttl-looks"), list = box.querySelector(".ttl-items");
  var seenBtn = box.querySelector(".ttl-seen"), live = box.querySelector(".ttl-live");
  if (!stage || !n || !chips || !list) return;

  function pad(k) { return (k < 10 ? "0" : "") + k; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function lookSrc(i, k) { return base + figs[i].dataset.model + "_" + k + ".webp"; }
  function itemSrc(key) { return base + "items/" + key + ".webp"; }

  /* every look is its own layer in the figure, made the first time the creator is active */
  function layers(i) {
    var f = figs[i];
    if (f._layers) return f._layers;
    var first = f.querySelector("img"), out = [first], dots = f.querySelector(".ttl-dots");
    first.classList.add("on");
    for (var k = 1; k < looks[i].length; k++) {
      var im = new Image();
      im.decoding = "async"; im.alt = ""; im.width = 760; im.height = 1362;
      im.setAttribute("aria-hidden", "true");
      im.src = lookSrc(i, k);
      f.insertBefore(im, dots);
      out.push(im);
    }
    f._layers = out;
    return out;
  }

  /* layout: the active figure in the middle, the others to the sides, a wrap enters from the far side */
  function offOf(i) { var o = ((i - active) % n + n) % n; if (o > n / 2) o -= n; return o; }
  function place(animate) {
    var W = stage.clientWidth, narrow = W < 640;
    var sp = narrow ? 0.43 : 0.34, ss = narrow ? 0.8 : 0.84, so = narrow ? 0.35 : 0.5;
    figs.forEach(function (f, i) {
      var o = offOf(i), prev = f._off, fw = f.offsetWidth;
      var s = o === 0 ? 1 : ss;
      var x = W / 2 + o * W * sp - fw / 2;
      if (animate && prev != null && Math.abs(o - prev) > 1) {
        var x0 = W / 2 + (o + (o > 0 ? 0.7 : -0.7)) * W * sp - fw / 2;
        f.style.transition = "none";
        f.style.transform = "translate3d(" + x0.toFixed(1) + "px,0,0) scale(" + s + ")";
        f.style.opacity = "0";
        void f.offsetWidth;
        f.style.transition = "";
      }
      f.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0) scale(" + s + ")";
      f.style.opacity = String(o === 0 ? 1 : so);
      f.style.zIndex = o === 0 ? "3" : "2";
      f.classList.toggle("is-active", o === 0);
      f._off = o;
    });
    if (animate) smear();
  }

  /* horizontal motion blur while the figures slide (fine pointer only, never with reduced motion) */
  var fe = null, smearRaf = 0;
  if (!reduce && fine) {
    try {
      var ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
      svg.setAttribute("class", "defs"); svg.setAttribute("aria-hidden", "true"); svg.setAttribute("focusable", "false");
      var flt = document.createElementNS(ns, "filter");
      flt.setAttribute("id", "ttl-mblur"); flt.setAttribute("x", "-20%"); flt.setAttribute("y", "0"); flt.setAttribute("width", "140%"); flt.setAttribute("height", "100%");
      fe = document.createElementNS(ns, "feGaussianBlur");
      fe.setAttribute("stdDeviation", "0 0");
      flt.appendChild(fe); svg.appendChild(flt); box.appendChild(svg);
    } catch (e) { fe = null; }
  }
  function smear() {
    if (!fe) return;
    var t0 = performance.now(), dur = 560;
    cancelAnimationFrame(smearRaf);
    figs.forEach(function (f) { f.classList.add("is-moving"); });
    var tick = function (now) {
      var p = Math.min(1, (now - t0) / dur);
      fe.setAttribute("stdDeviation", (Math.sin(Math.PI * p) * 9).toFixed(2) + " 0");
      if (p < 1) smearRaf = requestAnimationFrame(tick);
      else figs.forEach(function (f) { f.classList.remove("is-moving"); });
    };
    smearRaf = requestAnimationFrame(tick);
  }

  /* panel */
  function buildChips() {
    var m = figs[active].dataset.model;
    chips.innerHTML = "";
    looks[active].forEach(function (_, j) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "ttl-look";
      b.innerHTML = "<i>" + pad(j + 1) + "</i>" + esc(T.looks[m][j]);
      b.addEventListener("click", function () { stopDemo(); setLook(j); });
      chips.appendChild(b);
    });
  }
  function hot(key, on) {
    $$(".ttl-item, .ttl-dot").forEach(function (el) { if (el.dataset.item === key) el.classList.toggle("is-hot", on); else if (on) el.classList.remove("is-hot"); });
  }
  function $$(s) { return Array.prototype.slice.call(box.querySelectorAll(s)); }
  function render(quiet) {
    var m = figs[active].dataset.model, k = steps[active], L = looks[active][k];
    if (who) who.textContent = names[active];
    if (whoStep) whoStep.textContent = T.look + " " + pad(k + 1) + " / " + pad(looks[active].length);
    Array.prototype.forEach.call(chips.children, function (b, j) { b.setAttribute("aria-pressed", j === k ? "true" : "false"); });

    list.innerHTML = "";
    L.items.forEach(function (it) {
      var key = it[0], fresh = key === L.isNew;
      var li = document.createElement("li");
      li.className = "ttl-item" + (fresh ? " is-new" : "");
      li.dataset.item = key;
      li.innerHTML = '<img src="' + itemSrc(key) + '" alt="" width="480" height="480" decoding="async"><span>' + esc(T.items[key]) + "</span>" + (fresh ? "<em>" + esc(T.isNew) + "</em>" : "");
      li.addEventListener("mouseenter", function () { hot(key, true); });
      li.addEventListener("mouseleave", function () { hot(key, false); });
      list.appendChild(li);
    });

    figs.forEach(function (f, i) {
      var d = f.querySelector(".ttl-dots");
      d.innerHTML = "";
      if (i !== active) return;
      L.items.forEach(function (it, j) {
        var key = it[0], b = document.createElement("button");
        b.type = "button"; b.className = "ttl-dot" + (key === L.isNew ? " is-new" : "");
        b.dataset.item = key;
        b.style.left = it[1] + "%"; b.style.top = it[2] + "%"; b.style.setProperty("--i", j);
        b.setAttribute("aria-label", T.items[key]);
        b.innerHTML = "<span>" + esc(T.items[key]) + "</span>";
        b.addEventListener("mouseenter", function () { hot(key, true); });
        b.addEventListener("mouseleave", function () { hot(key, false); });
        b.addEventListener("focus", function () { hot(key, true); });
        b.addEventListener("blur", function () { hot(key, false); });
        b.addEventListener("click", function (e) {
          e.stopPropagation(); stopDemo(); hot(key, true);
          var li = list.querySelector('[data-item="' + key + '"]');
          if (li && list.scrollWidth > list.clientWidth) list.scrollTo({ left: li.offsetLeft - 8, behavior: reduce ? "auto" : "smooth" });
        });
        d.appendChild(b);
      });
    });

    var frame = L.seen ? document.querySelector('.frame[data-src$="' + L.seen[0] + '"]') : null;
    if (seenBtn) {
      seenBtn.hidden = !frame;
      seenBtn._frame = frame;
      if (frame) seenBtn.textContent = T.seen + " " + L.seen[1];
    }
    if (!quiet && live) live.textContent = names[active] + ". " + T.look + " " + (k + 1) + " " + T.of + " " + looks[active].length + ": " + T.looks[m][k] + ".";
  }
  function setLook(k) {
    k = Math.max(0, Math.min(looks[active].length - 1, k));
    steps[active] = k;
    layers(active).forEach(function (im, j) { im.classList.toggle("on", j === k); });
    render();
  }
  function go(i) {
    i = ((i % n) + n) % n;
    if (i === active) return;
    active = i;
    layers(i).forEach(function (im, j) { im.classList.toggle("on", j === steps[i]); });
    place(true); buildChips(); render();
  }

  /* one pass of looks the first time the stage is in view, stops on any click */
  var demoTimer = 0, demoDone = reduce, inView = false;
  function stopDemo() { demoDone = true; clearTimeout(demoTimer); }
  function demoStep() {
    if (demoDone || !inView) return;
    if (steps[active] >= looks[active].length - 1) { demoDone = true; return; }
    demoTimer = setTimeout(function () { if (demoDone || !inView) return; setLook(steps[active] + 1); demoStep(); }, 1500);
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      inView = en[0].isIntersecting;
      clearTimeout(demoTimer);
      if (inView) demoStep();
    }, { threshold: 0.6 }).observe(stage);
  }

  /* input */
  $$(".ttl-arrow").forEach(function (b) {
    b.addEventListener("click", function () { stopDemo(); go(active + Number(b.dataset.step)); });
  });
  figs.forEach(function (f, i) {
    f.addEventListener("click", function () { if (i !== active) { stopDemo(); go(i); } });
  });
  stage.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); stopDemo(); go(active + (e.key === "ArrowRight" ? 1 : -1)); }
  });
  var sx = null, sy = 0;
  stage.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") { sx = e.clientX; sy = e.clientY; } });
  stage.addEventListener("pointerup", function (e) {
    if (sx == null) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    sx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { stopDemo(); go(active + (dx < 0 ? 1 : -1)); }
  });
  stage.addEventListener("pointercancel", function () { sx = null; });
  if (seenBtn) seenBtn.addEventListener("click", function () { stopDemo(); if (seenBtn._frame) seenBtn._frame.click(); });
  var rq = 0;
  window.addEventListener("resize", function () { cancelAnimationFrame(rq); rq = requestAnimationFrame(function () { place(false); }); });

  /* start */
  figs.forEach(function (f) {
    var d = document.createElement("div"); d.className = "ttl-dots"; f.appendChild(d);
    f.querySelector("img").classList.add("on");
  });
  box.classList.add("is-live");
  layers(0);
  place(false);
  buildChips();
  render(true);
})();
