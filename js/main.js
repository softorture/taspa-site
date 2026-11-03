/* Taspa, site v3: theme button, loader, menus, hero words, reveals, pinned manifesto, showreel slot,
   directions previews, sideways work ribbon with filters, cursor label, cast colors, counters,
   player, price slider, sample form, multi-step request, floating CTA, footer loop, Almaty clock. */
(function () {
  "use strict";
  var root = document.documentElement;
  var lang = root.lang === "ru" ? "ru" : "en";
  var T = {
    en: { play: "Play", pause: "Pause", view: "View", soundOn: "Sound on", soundOff: "Mute",
          form: "Your email app should open with the request. Prefer Telegram? The text is copied, paste it to", perVideo: "per video",
          pack3: "This is our UGC Video Pack: 3 videos, 3 hooks.", pack10: "This is our UGC Pack 10: 10 videos, 2 creators, 5 hooks.",
          next: "Next", finish: "Finish request", theme: "Theme", switchTo: "Switch to",
          modes: { white: "Light", black: "Dark", blue: "Blue" }, openMenu: "Open menu", closeMenu: "Close menu",
          mail: { sample: "I'd like a free hook.", product: "Product", where: "Where it runs", reply: "Reply to", sampleSubj: "Free hook request",
                  req: "Request from taspa site", need: "Need", budget: "Budget", time: "Timing", name: "Name", brand: "Brand",
                  site: "Website", contact: "Email", reqSubj: "Request", newBrand: "new brand" } },
    ru: { play: "Смотреть", pause: "Пауза", view: "Открыть", soundOn: "Со звуком", soundOff: "Без звука",
          form: "Должна открыться почта с заявкой. Удобнее Telegram? Текст скопирован, вставьте его в чат", perVideo: "за ролик",
          pack3: "Это наш UGC Video Pack: 3 ролика, 3 хука.", pack10: "Это наш UGC Pack 10: 10 роликов, 2 креатора, 5 хуков.",
          next: "Дальше", finish: "Завершить заявку", theme: "Тема", switchTo: "Переключить на",
          modes: { white: "Светлая", black: "Тёмная", blue: "Синяя" }, openMenu: "Открыть меню", closeMenu: "Закрыть меню",
          mail: { sample: "Хочу бесплатный хук.", product: "Товар", where: "Где реклама", reply: "Ответить", sampleSubj: "Бесплатный хук",
                  req: "Заявка с сайта Taspa", need: "Нужно", budget: "Бюджет", time: "Сроки", name: "Имя", brand: "Бренд",
                  site: "Сайт", contact: "Контакт", reqSubj: "Заявка", newBrand: "новый бренд" } }
  }[lang];
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false, addEventListener: function () {} }; };
  var reduce = mq("(prefers-reduced-motion: reduce)").matches;
  var finePointer = mq("(hover: hover) and (pointer: fine)").matches;
  var hasIO = "IntersectionObserver" in window;
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function noMenu(e) { e.preventDefault(); }
  function onScrollFrame(fn) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { fn(); ticking = false; });
    }, { passive: true });
  }

  /* header height drives every sticky offset */
  var header = $(".site-header");
  var hh = 68;
  function setHH() { hh = header.offsetHeight; root.style.setProperty("--hh", hh + "px"); }
  setHH();

  /* one theme button: white, black, blue, around again. The head script already applied the saved one. */
  var MODES = ["white", "black", "blue"];
  var themeBtn = $("[data-theme-cycle]");
  function currentMode() { return root.getAttribute("data-mode") || "white"; }
  function syncTheme() {
    var m = currentMode(), next = MODES[(MODES.indexOf(m) + 1) % MODES.length];
    themeBtn.setAttribute("aria-label", T.theme + ": " + T.modes[m] + ". " + T.switchTo + " " + T.modes[next]);
    themeBtn.title = T.theme + ": " + T.modes[m];
  }
  themeBtn.addEventListener("click", function () {
    var next = MODES[(MODES.indexOf(currentMode()) + 1) % MODES.length];
    if (next === "white") root.removeAttribute("data-mode"); else root.setAttribute("data-mode", next);
    try { localStorage.setItem("taspa-mode", next); } catch (e) {}
    syncTheme();
  });
  syncTheme();

  /* hero title: words rise from under the line */
  var split = $("[data-split]");
  if (split && !reduce) {
    var wi = 0;
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement("span"), inner = document.createElement("span");
            w.className = "w"; w.style.setProperty("--wi", wi++);
            inner.textContent = part; w.appendChild(inner); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(split);
    split.classList.add("split");
  }
  function startHero() { if (split) requestAnimationFrame(function () { split.classList.add("is-in"); }); }

  /* reveal on scroll, once; groups step 60 ms, max 6 */
  var revealEls = $$("[data-reveal]");
  $$("[data-reveal-group]").forEach(function (g) {
    $$(":scope > [data-reveal]", g).forEach(function (el, i) { el.style.setProperty("--i", Math.min(i, 5)); });
  });
  var counters = $$("[data-count]");
  function runCounter(el) {
    var target = parseFloat(el.dataset.count), out = el.querySelector(".n") || el;
    var start = null, dur = 900;
    var step = function (ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      out.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(step); else out.textContent = String(target);
    };
    out.textContent = "0";
    requestAnimationFrame(step);
  }
  if (!reduce && hasIO) {
    root.classList.add("js");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el.hasAttribute("data-reveal")) el.classList.add("is-in");
        if (el.hasAttribute("data-count")) runCounter(el);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
    counters.forEach(function (el) { io.observe(el); });
  } else if (split) {
    split.classList.add("is-in");
  }

  /* loader: up to 0.9 s, once per session */
  if (root.classList.contains("is-loading")) {
    try { sessionStorage.setItem("taspa-seen", "1"); } catch (e) {}
    var loader = $(".loader");
    setTimeout(function () {
      loader.classList.add("out");
      setTimeout(function () { root.classList.remove("is-loading"); }, 400);
      startHero();
    }, 500);
  } else startHero();

  /* manifesto: pinned, each word goes from 20% to 100% as you read down */
  var manifesto = $("[data-manifesto]");
  if (manifesto) {
    var words = manifesto.textContent.trim().split(/\s+/);
    manifesto.innerHTML = words.map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
    var spans = $$(".w", manifesto);
    var msec = manifesto.closest(".manifesto");
    if (!reduce) {
      msec.classList.add("is-pinned");
      var paint = function () {
        var r = msec.getBoundingClientRect(), vh = window.innerHeight;
        var run = Math.max(1, r.height - (vh - hh));
        var p = clamp((hh + vh * 0.25 - r.top) / (run + vh * 0.25), 0, 1);
        var lit = p * 1.1 * spans.length;
        spans.forEach(function (s, i) { s.style.setProperty("--o", (0.2 + 0.8 * clamp(lit - i, 0, 1)).toFixed(3)); });
      };
      onScrollFrame(paint);
      window.addEventListener("resize", paint);
      paint();
    }
  }

  /* stage: one showreel file when it is set, otherwise three clips (one loop on phones) */
  function startLoop(v) {
    v.addEventListener("contextmenu", noMenu);
    if (reduce) return;
    v.src = v.dataset.src; v.muted = true;
    v.play().catch(function () {});
  }
  function pauseOffscreen(box, vids) {
    if (!hasIO || reduce) return;
    new IntersectionObserver(function (en) {
      vids.forEach(function (v) { if (!v.src) return; if (en[0].isIntersecting) v.play().catch(function () {}); else v.pause(); });
    }).observe(box);
  }
  var stage = $(".stage");
  if (stage) {
    var stageVids;
    if (stage.dataset.showreel) {
      var fig = document.createElement("figure");
      fig.className = "showreel";
      var sv = document.createElement("video");
      sv.muted = true; sv.loop = true; sv.playsInline = true; sv.preload = "none";
      sv.setAttribute("disablepictureinpicture", ""); sv.setAttribute("aria-label", "Showreel, no sound");
      sv.dataset.src = stage.dataset.showreel;
      fig.appendChild(sv); stage.appendChild(fig); stage.classList.add("has-showreel");
      stageVids = [sv];
    } else {
      var wideStage = mq("(min-width: 720px)").matches;
      stageVids = $$(wideStage ? ".stage-reels video" : ".stage-mobile video", stage);
      if (wideStage) stageVids.forEach(function (v) { if (v.dataset.poster) v.poster = v.dataset.poster; });
    }
    stageVids.forEach(startLoop);
    pauseOffscreen(stage, stageVids);
  }

  /* quiet hover preview: the file is requested only on hover */
  function hoverVideo(box, src) {
    var v = null;
    box.addEventListener("mouseenter", function () {
      v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = "auto";
      v.setAttribute("disablepictureinpicture", "");
      v.src = src; box.appendChild(v);
      v.play().catch(function () {});
    });
    box.addEventListener("mouseleave", function () {
      if (v) { v.pause(); v.removeAttribute("src"); v.load(); v.remove(); v = null; }
    });
  }

  /* directions: video, photo cycle, plan drawing, site scroll */
  $$(".dir").forEach(function (dir) {
    var media = $(".dir-media", dir), kind = dir.dataset.preview;
    if (kind === "draw") {
      var draw = function () { media.classList.remove("drawing"); void media.offsetWidth; media.classList.add("drawing"); };
      if (!reduce && hasIO) {
        var dio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { draw(); dio.disconnect(); } }, { threshold: 0.4 });
        dio.observe(media);
        if (finePointer) dir.addEventListener("mouseenter", draw);
      }
      return;
    }
    if (!finePointer || reduce) return;
    if (kind === "video") hoverVideo(media, dir.dataset.src);
    if (kind === "photos") {
      var alts = $$(".alt", media), timer = null, k = 0;
      dir.addEventListener("mouseenter", function () {
        alts.forEach(function (a) { if (!a.src) a.src = a.dataset.src; });
        k = 0;
        timer = setInterval(function () {
          k = (k + 1) % (alts.length + 1);
          alts.forEach(function (a, i) { a.classList.toggle("on", i < k); });
        }, 900);
      });
      dir.addEventListener("mouseleave", function () { clearInterval(timer); alts.forEach(function (a) { a.classList.remove("on"); }); });
    }
    if (kind === "scroll") {
      var view = $(".browser-view", dir), shot = $("img", view);
      dir.addEventListener("mouseenter", function () { shot.style.setProperty("--shift", Math.min(0, view.clientHeight - shot.offsetHeight) + "px"); });
      dir.addEventListener("mouseleave", function () { shot.style.setProperty("--shift", "0px"); });
    }
  });

  /* work: sideways ribbon while the section is pinned (wide screens), plain stack otherwise */
  var work = $(".work");
  var wScroll = $(".work-scroll"), wPin = $(".work-pin"), wHead = $(".work-head"), track = $(".work-track");
  var prog = document.createElement("div");
  prog.className = "work-progress"; prog.setAttribute("aria-hidden", "true"); prog.innerHTML = "<i></i>";
  wPin.appendChild(prog);
  var wide = mq("(min-width: 960px)");
  var pinned = false, maxShift = 0;
  function moveTrack() {
    if (!pinned) return;
    var p = maxShift ? clamp((hh - wScroll.getBoundingClientRect().top) / maxShift, 0, 1) : 0;
    track.style.transform = "translate3d(" + (-p * maxShift).toFixed(1) + "px,0,0)";
    prog.style.setProperty("--p", p.toFixed(4));
  }
  function layoutWork() {
    pinned = wide.matches && !reduce;
    work.classList.toggle("is-pinned", pinned);
    if (!pinned) { wScroll.style.height = ""; track.style.transform = ""; work.style.removeProperty("--fh"); return; }
    var vh = window.innerHeight;
    var avail = vh - hh - wHead.offsetHeight - 110;
    work.style.setProperty("--fh", Math.round(clamp(avail, 240, 460)) + "px");
    maxShift = Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
    wScroll.style.height = (vh - hh + maxShift) + "px";
    moveTrack();
  }
  track.addEventListener("focusin", function (e) {
    if (!pinned || !maxShift) return;
    var c = e.target.closest(".case");
    if (!c) return;
    wPin.scrollLeft = 0;
    var p = clamp((c.offsetLeft - 32) / maxShift, 0, 1);
    var top = wScroll.getBoundingClientRect().top + window.pageYOffset - hh;
    window.scrollTo(0, top + p * maxShift);
  });
  onScrollFrame(moveTrack);

  /* work filters: niche hides cases, format hides frames */
  var filter = { niche: "all", format: "all" };
  function applyFilters() {
    var shown = 0;
    $$(".case[data-niche]").forEach(function (c) {
      var ok = filter.niche === "all" || c.dataset.niche === filter.niche;
      var frames = $$(".frame[data-format]", c);
      frames.forEach(function (f) { f.hidden = !(filter.format === "all" || f.dataset.format === filter.format); });
      if (frames.length && frames.every(function (f) { return f.hidden; })) ok = false;
      c.hidden = !ok;
      if (ok) shown++;
    });
    $(".work-empty").hidden = shown > 0;
    layoutWork();
  }
  $$(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var group = chip.dataset.group;
      filter[group] = chip.dataset.value;
      $$('.chip[data-group="' + group + '"]').forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
      applyFilters();
    });
  });

  /* frames: hover preview and a cursor label that follows the mouse */
  if (finePointer && !reduce) {
    $$(".frame-video").forEach(function (f) { hoverVideo(f, f.dataset.src); });
    var cur = $(".cursor"), curLabel = $("span", cur);
    var x = -200, y = -200, tx = x, ty = y, raf = null;
    var loop = function () {
      x += (tx - x) * 0.25; y += (ty - y) * 0.25;
      cur.style.setProperty("--cx", x.toFixed(1) + "px"); cur.style.setProperty("--cy", y.toFixed(1) + "px");
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : null;
    };
    window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
    root.classList.add("has-cursor");
    $$(".frame[data-type]").forEach(function (f) {
      f.addEventListener("mouseenter", function () { curLabel.textContent = f.dataset.type === "video" ? T.play : T.view; x = tx; y = ty; loop(); cur.classList.add("on"); });
      f.addEventListener("mouseleave", function () { cur.classList.remove("on"); });
    });
  }

  /* cast: the section takes the color of the person in the middle of the screen */
  var cast = $(".cast");
  if (cast && hasIO) {
    cast.classList.add("is-live");
    var castIdx = $$(".cast-index li", cast);
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target;
        cast.setAttribute("data-tone", t.dataset.panelTone);
        castIdx.forEach(function (li) { li.classList.toggle("on", li.dataset.for === t.dataset.name); });
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    $$(".cast-panel", cast).forEach(function (p) { cio.observe(p); });
  }

  /* player: no download button, no menu, sound on by click */
  var player = $("#player");
  var pStage = $(".player-stage", player);
  var caption = $(".player-caption", player);
  var btnPlay = $('[data-act="play"]', player);
  var btnSound = $('[data-act="sound"]', player);
  var progress = $(".progress", player);
  var progressFill = $("i", progress);
  var video = null, lastFocus = null;
  pStage.addEventListener("contextmenu", noMenu);
  function syncSound() { if (video) btnSound.textContent = video.muted ? T.soundOn : T.soundOff; }
  function togglePlay() {
    if (!video) return;
    if (video.paused) { video.play().catch(function () {}); btnPlay.textContent = T.pause; }
    else { video.pause(); btnPlay.textContent = T.play; }
  }
  function openPlayer(m) {
    lastFocus = m;
    pStage.innerHTML = "";
    var isVideo = m.dataset.type === "video";
    pStage.style.aspectRatio = isVideo ? "9 / 16" : "3 / 4";
    btnPlay.hidden = btnSound.hidden = progress.hidden = !isVideo;
    if (isVideo) {
      video = document.createElement("video");
      video.preload = "metadata"; video.playsInline = true; video.poster = m.dataset.poster;
      video.setAttribute("controlsList", "nodownload noplaybackrate noremoteplayback");
      video.setAttribute("disablepictureinpicture", ""); video.setAttribute("disableremoteplayback", "");
      video.src = m.dataset.src;
      pStage.appendChild(video);
      var shield = document.createElement("div");
      shield.className = "player-shield";
      shield.addEventListener("click", togglePlay);
      pStage.appendChild(shield);
      video.addEventListener("timeupdate", function () {
        if (video && video.duration) progressFill.style.width = (video.currentTime / video.duration * 100) + "%";
      });
      video.addEventListener("ended", function () { btnPlay.textContent = T.play; });
      video.play().then(function () { btnPlay.textContent = T.pause; }).catch(function () {
        if (!video) return;
        video.muted = true; syncSound();
        video.play().then(function () { btnPlay.textContent = T.pause; }).catch(function () { btnPlay.textContent = T.play; });
      });
      syncSound();
    } else {
      var img = document.createElement("img");
      img.src = m.dataset.src; img.alt = $("img", m).alt; img.draggable = false;
      pStage.appendChild(img);
    }
    caption.innerHTML = m.dataset.caption;
    player.hidden = false;
    document.body.style.overflow = "hidden";
    if (cur) cur.classList.remove("on");
    $('[data-act="close"]', player).focus();
  }
  function closePlayer() {
    if (video) { video.pause(); video.removeAttribute("src"); video.load(); video = null; }
    pStage.innerHTML = "";
    progressFill.style.width = "0";
    player.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  btnPlay.addEventListener("click", togglePlay);
  btnSound.addEventListener("click", function () { if (video) { video.muted = !video.muted; syncSound(); } });
  progress.addEventListener("click", function (e) {
    if (!video || !video.duration) return;
    var r = progress.getBoundingClientRect();
    video.currentTime = clamp((e.clientX - r.left) / r.width, 0, 1) * video.duration;
  });
  $('[data-act="close"]', player).addEventListener("click", closePlayer);
  player.addEventListener("click", function (e) { if (e.target === player) closePlayer(); });
  $$(".frame[data-type]").forEach(function (m) {
    m.addEventListener("click", function () { openPlayer(m); });
    m.addEventListener("contextmenu", noMenu);
  });

  /* price slider */
  var slider = document.getElementById("videos");
  if (slider) {
    var box = slider.closest(".slider-box");
    var tiers = JSON.parse(box.dataset.tiers);   // [[minCount, pricePerVideo], ...] ascending
    var currency = box.dataset.currency;
    var fmt = function (n) {
      if (currency === "KZT") return n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₸";
      return "$" + n.toLocaleString("en-US");
    };
    // optional third value in a tier: the same price in dollars, shown next to tenge (RU)
    var usd = function (n) { return n == null ? "" : ' <span class="usd">$' + n.toLocaleString("en-US").replace(/,/g, "\u00a0") + "</span>"; };
    var out = {
      count: $(".count", box), per: $('[data-out="per"]', box), total: $('[data-out="total"]', box),
      hint: $(".pack-hint", box), tiers: $$(".tiers li", box)
    };
    var update = function () {
      var n = parseInt(slider.value, 10), idx = 0;
      tiers.forEach(function (t, i) { if (n >= t[0]) idx = i; });
      var per = tiers[idx][1], perUsd = tiers[idx][2];
      out.count.textContent = n;
      out.per.innerHTML = fmt(per) + usd(perUsd);
      out.total.innerHTML = fmt(per * n) + usd(perUsd == null ? null : perUsd * n);
      out.tiers.forEach(function (li, i) { li.classList.toggle("on", i === idx); });
      out.hint.textContent = n === 3 ? T.pack3 : n === 10 ? T.pack10 : "";
      slider.setAttribute("aria-valuetext", n + ", " + fmt(per) + " " + T.perVideo);
    };
    slider.addEventListener("input", update);
    update();
  }

  /* contact channels: no backend, the request opens in email or goes to Telegram */
  var CONTACT = { email: "alikhan.tasbulatov@hotmail.com", tg: "rarealmatysnowflake" };
  function mailto(subject, body) { return "mailto:" + CONTACT.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body); }
  function copyText(t) { try { if (navigator.clipboard) navigator.clipboard.writeText(t); } catch (e) {} }
  function fieldVal(f, n) { var el = f.elements[n]; return el && el.value ? el.value.trim() : ""; }

  /* sample form: opens an email with the request filled in */
  $$("form[data-draft]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var M = T.mail;
      var body = M.sample + "\n" +
        M.product + ": " + (fieldVal(f, "product") || "-") + "\n" + M.where + ": " + (fieldVal(f, "platform") || "-") + "\n" + M.reply + ": " + (fieldVal(f, "email") || "-");
      var s = $(".form-status", f);
      s.innerHTML = "";
      s.appendChild(document.createTextNode(T.form + " "));
      var a = document.createElement("a"); a.href = "https://t.me/" + CONTACT.tg; a.target = "_blank"; a.rel = "noopener"; a.textContent = "@" + CONTACT.tg;
      s.appendChild(a);
      s.classList.add("on");
      copyText(body);
      window.location.href = mailto(M.sampleSubj, body);
    });
  });

  /* mobile menu */
  var menuBtn = $(".menu-btn"), menu = $("#menu");
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? T.closeMenu : T.openMenu);
    document.body.style.overflow = open ? "hidden" : "";
  }
  menuBtn.addEventListener("click", function () { setMenu(menu.hidden); });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* mega menu: closes after a click even while the mouse is still over it */
  $$(".nav-item").forEach(function (item) {
    $$(".mega a", item).forEach(function (a) {
      a.addEventListener("click", function () { item.classList.add("is-closed"); a.blur(); });
    });
    item.addEventListener("mouseleave", function () { item.classList.remove("is-closed"); });
  });

  /* multi-step request */
  var wiz = $("#wizard");
  if (wiz) {
    var steps = $$(".step", wiz);
    var dots = $$(".dots i", wiz);
    var back = $('[data-wiz="back"]', wiz);
    var next = $('[data-wiz="next"]', wiz);
    var nav = $(".wizard-nav", wiz);
    var at = 0, opener = null;
    var show = function (i, dir) {
      var old = steps[at];
      var go = function () {
        old.hidden = true; old.classList.remove("leave");
        at = i;
        var s = steps[at];
        s.hidden = false;
        s.classList.remove("enter", "enter-back");
        if (!reduce) { void s.offsetWidth; s.classList.add(dir < 0 ? "enter-back" : "enter"); }
        dots.forEach(function (d, k) { d.classList.toggle("on", k === Math.min(at, dots.length - 1)); });
        back.disabled = at === 0 || at === steps.length - 1;
        next.textContent = at === steps.length - 2 ? T.finish : T.next;
        nav.hidden = at === steps.length - 1;
        var f = s.querySelector("input, button, select, textarea");
        if (f) f.focus();
      };
      if (old && old !== steps[i] && !reduce) { old.classList.add("leave"); setTimeout(go, 280); }
      else go();
    };
    var openWiz = function (e) {
      e.preventDefault();
      opener = e.currentTarget;
      if (!menu.hidden) setMenu(false);
      steps.forEach(function (s, k) { s.hidden = k !== 0; s.classList.remove("leave", "enter", "enter-back"); });
      at = 0; show(0, 1);
      wiz.hidden = false;
      document.body.style.overflow = "hidden";
    };
    var closeWiz = function () {
      wiz.hidden = true;
      document.body.style.overflow = "";
      if (opener && opener.offsetParent !== null) opener.focus({ preventScroll: true });
    };
    $$("[data-open-wizard]").forEach(function (b) { b.addEventListener("click", openWiz); });
    next.addEventListener("click", function () { if (at < steps.length - 1) show(at + 1, 1); });
    back.addEventListener("click", function () { if (at > 0) show(at - 1, -1); });
    $$('[data-wiz="close"]', wiz).forEach(function (b) { b.addEventListener("click", closeWiz); });
    wiz.addEventListener("click", function (e) { if (e.target === wiz) closeWiz(); });
    $("form", wiz).addEventListener("submit", function (e) { e.preventDefault(); next.click(); });
    var summary = function () {
      var f = $("form", wiz), pick = function (n) {
        return $$('input[name="' + n + '"]:checked', f).map(function (i) { return i.parentNode.textContent.trim(); }).join(", ") || "-";
      };
      var M = T.mail;
      return M.req + "\n" + M.need + ": " + pick("need") + "\n" + M.budget + ": " + pick("budget") + "\n" + M.time + ": " + pick("time") +
        "\n" + M.name + ": " + (fieldVal(f, "name") || "-") + "\n" + M.brand + ": " + (fieldVal(f, "brand") || "-") + "\n" + M.site + ": " + (fieldVal(f, "site") || "-") + "\n" + M.contact + ": " + (fieldVal(f, "email") || "-");
    };
    var em = $('[data-send="email"]', wiz), tgl = $('[data-send="telegram"]', wiz);
    next.addEventListener("click", function () {
      { var t = summary(); if (em) em.href = mailto(T.mail.reqSubj + ": " + (fieldVal($("form", wiz), "brand") || T.mail.newBrand), t); if (tgl) tgl.dataset.text = t; }
    });
    if (tgl) tgl.addEventListener("click", function () { copyText(tgl.dataset.text || summary()); });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") {
      if (e.key === " " && !player.hidden && video) { e.preventDefault(); togglePlay(); }
      return;
    }
    if (!player.hidden) closePlayer();
    else if (wiz && !wiz.hidden) $('[data-wiz="close"]', wiz).click();
    else if (!menu.hidden) { setMenu(false); menuBtn.focus(); }
  });

  /* floating CTA after the hero, hidden over the cast colors and near the sample, contact and footer */
  var fc = $(".float-cta"), hero = $(".hero");
  if (fc && hero && hasIO) {
    var heroOut = false, nearForm = false;
    var sync = function () { fc.classList.toggle("show", heroOut && nearForm === false); };
    new IntersectionObserver(function (en) { heroOut = !en[0].isIntersecting; sync(); }).observe(hero);
    var vis = new Set();
    var io2 = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) vis.add(x.target); else vis.delete(x.target); });
      nearForm = vis.size > 0; sync();
    });
    $$(".cast, #sample, #contact, .site-footer").forEach(function (el) { io2.observe(el); });
  }

  /* footer loop: requested only when the footer comes near */
  var fv = $(".foot-video");
  if (fv && hasIO && !reduce) {
    var fio = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) {
        if (!fv.src) { fv.src = fv.dataset.src; fv.muted = true; }
        fv.play().catch(function () {});
      } else if (fv.src) fv.pause();
    }, { rootMargin: "200px 0px" });
    fio.observe(fv.parentNode);
  }

  /* local time in Almaty */
  var clock = $("[data-clock]");
  if (clock && window.Intl) {
    try {
      var tf = new Intl.DateTimeFormat(lang === "ru" ? "ru-RU" : "en-GB", { timeZone: "Asia/Almaty", hour: "2-digit", minute: "2-digit", hour12: false });
      var tick = function () { clock.textContent = tf.format(new Date()) + ", GMT+5"; };
      tick();
      setInterval(tick, 30000);
    } catch (e) {}
  }

  layoutWork();
  window.addEventListener("resize", function () {
    setHH();
    layoutWork();
    if (window.innerWidth > 960 && !menu.hidden) setMenu(false);
  });
  window.addEventListener("load", layoutWork);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutWork);
})();
