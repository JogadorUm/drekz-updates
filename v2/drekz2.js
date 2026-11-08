(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // src/util.js
  var $ = (s, r = document) => r.querySelector(s);
  var $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class") e.className = v;
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else if (k === "html") e.innerHTML = v;
      else e.setAttribute(k, v === true ? "" : v);
    }
    for (const c of kids.flat()) {
      if (c == null || c === false) continue;
      e.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return e;
  }
  var norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  function lev(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    let p = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const c = [i];
      for (let j = 1; j <= b.length; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      p = c;
    }
    return p[b.length];
  }
  async function get(url2, { timeout = 15e3, text = true, cache: cache2 } = {}) {
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const t = setTimeout(() => ctl && ctl.abort(), timeout);
    try {
      const r = await fetch(url2, { signal: ctl && ctl.signal, cache: cache2 });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return text ? await r.text() : await r.json();
    } finally {
      clearTimeout(t);
    }
  }
  var b64u = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  var fmt = (s) => {
    s = Math.max(0, Math.floor(s || 0));
    const h2 = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60, p = (n) => String(n).padStart(2, "0");
    return (h2 ? h2 + ":" : "") + p(m) + ":" + p(x);
  };

  // src/nav.js
  var backs = [];
  var onBack = (fn) => {
    backs.push(fn);
    return () => {
      const i = backs.indexOf(fn);
      i >= 0 && backs.splice(i, 1);
    };
  };
  var scopeFn = () => $("#ui");
  var setScope = (f) => {
    scopeFn = f;
  };
  var KEY = {
    ENTER: [13],
    BACK: [10009, 27, 8, 4, 461, 166],
    UP: [38],
    DOWN: [40],
    LEFT: [37],
    RIGHT: [39],
    CHUP: [427, 33],
    CHDOWN: [428, 34],
    PLAY: [415, 10252, 179],
    PAUSE: [19],
    STOP: [413],
    FF: [417, 228],
    RW: [412, 227]
  };
  var is = (e, k) => KEY[k].includes(e.keyCode);
  function focusables(root2) {
    return $$(".f", root2 || scopeFn()).filter((e) => e.offsetParent !== null && !e.hasAttribute("disabled"));
  }
  function focus(el, { scroll = true } = {}) {
    if (!el) return;
    const c = $(".f.on");
    c && c !== el && c.classList.remove("on");
    el.classList.add("on");
    if (scroll) {
      try {
        el.scrollIntoView({ block: "nearest", inline: "nearest" });
      } catch (e) {
      }
    }
    if (el.tagName === "INPUT") el.focus();
    else if (document.activeElement && document.activeElement.tagName === "INPUT") document.activeElement.blur();
  }
  var current = () => $(".f.on");
  function focusFirst(root2) {
    const l = focusables(root2);
    const p = l.find((e) => e.hasAttribute("data-first")) || l[0];
    focus(p);
    return p;
  }
  function rc(e) {
    const r = e.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, l: r.left, r: r.right, t: r.top, b: r.bottom };
  }
  function move(dir) {
    const list = focusables(), cur2 = current();
    if (!cur2 || !list.includes(cur2)) return focus(list[0]);
    const c = rc(cur2);
    let best = null, bs = 1e9;
    for (const e of list) {
      if (e === cur2) continue;
      const r = rc(e);
      let dx = r.x - c.x, dy = r.y - c.y, pri, sec;
      if (dir === "LEFT") {
        if (r.x >= c.x - 2) continue;
        pri = -dx;
        sec = Math.abs(dy);
      } else if (dir === "RIGHT") {
        if (r.x <= c.x + 2) continue;
        pri = dx;
        sec = Math.abs(dy);
      } else if (dir === "UP") {
        if (r.y >= c.y - 2) continue;
        pri = -dy;
        sec = Math.abs(dx);
      } else {
        if (r.y <= c.y + 2) continue;
        pri = dy;
        sec = Math.abs(dx);
      }
      const s = pri + sec * 3;
      if (s < bs) {
        bs = s;
        best = e;
      }
    }
    if (best) focus(best);
    return !!best;
  }
  function initKeys(hook) {
    window.addEventListener("keydown", (e) => {
      const inp = e.target && e.target.tagName === "INPUT";
      if (hook && hook(e) === true) {
        e.preventDefault();
        return;
      }
      for (const d of ["UP", "DOWN", "LEFT", "RIGHT"]) if (is(e, d)) {
        if (inp && (d === "LEFT" || d === "RIGHT")) return;
        e.preventDefault();
        move(d);
        return;
      }
      if (is(e, "ENTER")) {
        const c = current();
        if (c) {
          if (c.tagName === "INPUT") return;
          e.preventDefault();
          c.click();
        }
        return;
      }
      if (is(e, "BACK")) {
        if (inp && e.keyCode === 8) return;
        e.preventDefault();
        const f = backs[backs.length - 1];
        f && f();
        return;
      }
    });
    document.addEventListener("click", (e) => {
      const f = e.target.closest && e.target.closest(".f");
      if (f && f !== current()) focus(f, { scroll: false });
    }, true);
  }

  // src/ui.js
  var toast = (m, ms = 3500) => {
    const t = $("#toast");
    t.textContent = m;
    t.style.display = "block";
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.style.display = "none", ms);
  };
  function modal(titulo, linhas, { onClose } = {}) {
    const m = $("#modal"), box = h("div", { class: "box" }, h("h3", null, titulo)), prev = $(".f.on");
    linhas.forEach((l) => box.append(h(
      "div",
      { class: "row f" + (l.sel ? " sel" : ""), onclick: () => {
        fecha();
        l.fn && l.fn();
      } },
      h("div", null, l.t, l.s && h("small", null, l.s)),
      l.sel ? h("b", null, "\u25CF") : null
    )));
    m.innerHTML = "";
    m.append(box);
    m.style.display = "flex";
    setScope(() => m);
    const off = onBack(() => fecha());
    function fecha() {
      m.style.display = "none";
      off();
      setScope(() => $("#ui"));
      onClose && onClose();
      if (prev && prev.isConnected) focus(prev);
    }
    const s = box.querySelector(".sel") || box.querySelector(".f");
    focus(s);
    return fecha;
  }
  var card = (it, fn, pct) => h(
    "div",
    { class: "card f", onclick: fn },
    h("div", { class: "pi", style: it.poster ? "background-image:url('" + it.poster + "')" : "" }),
    pct != null ? h("div", { class: "bar" }, h("i", { style: "width:" + Math.round(pct * 100) + "%" })) : null,
    h("div", { class: "ti" }, it.title)
  );
  var SVG = {
    home: "M10,20v-6h4v6h5v-8h3L12,3 2,12h3v8z",
    tv: "M21,6h-7.59l3.29-3.29L16,2l-4,4-4-4-.71.71L10.59,6H3c-1.1,0-2,.89-2,2v12c0,1.1.9,2 2,2h18c1.1,0 2-.9 2-2V8c0-1.11-.9-2-2-2zM21,20H3V8h18v12zM9,10v8l7-4z",
    movie: "M18,4l2,4h-3l-2-4h-2l2,4h-3l-2-4H8l2,4H7L5,4H4c-1.1,0-1.99.9-1.99,2L2,18c0,1.1.9,2 2,2h16c1.1,0 2-.9 2-2V4h-4z",
    serie: "M21,3H3c-1.1,0-2,.9-2,2v12c0,1.1.9,2 2,2h5v2h8v-2h5c1.1,0 1.99-.9 1.99-2L23,5c0-1.1-.9-2-2-2zm0,14H3V5h18v12z",
    search: "M15.5,14h-.79l-.28-.27C15.41,12.59 16,11.11 16,9.5 16,5.91 13.09,3 9.5,3S3,5.91 3,9.5 5.91,16 9.5,16c1.61,0 3.09-.59 4.23-1.57l.27.28v.79l5,4.99L20.49,19l-4.99-5zM9.5,14C7.01,14 5,11.99 5,9.5S7.01,5 9.5,5 14,7.01 14,9.5 11.99,14 9.5,14z",
    cfg: "M19.14,12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24,0-.43.17-.47.41l-.36,2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47,0-.59.22L2.74,8.87c-.12.21-.08.47.12.61l2.03,1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03,1.58c-.18.14-.23.41-.12.61l1.92,3.32c.12.22.37.29.59.22l2.39-.96c.5.38,1.03.7,1.62.94l.36,2.54c.05.24.24.41.48.41h3.84c.24,0,.44-.17.47-.41l.36-2.54c.59-.24,1.13-.56,1.62-.94l2.39.96c.22.08.47,0,.59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6 3.6,1.62 3.6,3.6-1.62,3.6-3.6,3.6z"
  };

  // src/store.js
  var P = "drekz2_";
  function rd(k, d) {
    try {
      const v = localStorage.getItem(P + k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  }
  function wr(k, v) {
    try {
      localStorage.setItem(P + k, JSON.stringify(v));
    } catch (e) {
    }
  }
  var DEF = {
    urlCanais: "https://canais-saimo.pages.dev/",
    urlFilmes: "https://filmes-saimo.pages.dev/",
    buffer: "normal",
    proximoAuto: true,
    pularAbertura: false,
    ponteSempre: false,
    ultimoCanal: ""
  };
  var prefs = { get() {
    return __spreadValues(__spreadValues({}, DEF), rd("prefs", {}));
  }, set(o) {
    wr("prefs", __spreadValues(__spreadValues({}, rd("prefs", {})), o));
  } };
  var progress = {
    all() {
      return rd("prog", {});
    },
    get(id) {
      return rd("prog", {})[id];
    },
    set(id, o) {
      const a = rd("prog", {});
      a[id] = __spreadProps(__spreadValues(__spreadValues({}, a[id]), o), { updatedAt: Date.now() });
      const k = Object.keys(a);
      if (k.length > 200) {
        k.sort((x, y) => a[x].updatedAt - a[y].updatedAt).slice(0, k.length - 200).forEach((i) => delete a[i]);
      }
      wr("prog", a);
    },
    del(id) {
      const a = rd("prog", {});
      delete a[id];
      wr("prog", a);
    },
    recentes() {
      const a = rd("prog", {});
      return Object.keys(a).map((id) => __spreadValues({ id }, a[id])).filter((x) => x.title && !x.done).sort((x, y) => y.updatedAt - x.updatedAt).slice(0, 20);
    }
  };
  var favs = {
    all() {
      return rd("favs", []);
    },
    has(id) {
      return rd("favs", []).includes(id);
    },
    toggle(id) {
      const a = rd("favs", []), i = a.indexOf(id);
      i < 0 ? a.push(id) : a.splice(i, 1);
      wr("favs", a);
      return i < 0;
    }
  };
  var cache = { get: rd, set: wr };

  // src/player.js
  var plat = {
    get avplay() {
      return window.webapis && window.webapis.avplay;
    },
    get exo() {
      return window.DrekzExo && window.DrekzExo.exoPlay ? window.DrekzExo : null;
    },
    get ponte() {
      return window.__ponte || null;
    }
  };
  var CANCEL = "cancelado";
  var host = (u) => String(u).split("/")[2] || "?";
  var BUF = { normal: [4, 8], grande: [8, 14], maximo: [15, 25] };
  var AvEngine = class {
    constructor(ev) {
      this.ev = ev;
      this.tk = 0;
      this.ok = false;
      if (!document.getElementById("av-player")) {
        const o = document.createElement("object");
        o.id = "av-player";
        o.type = "application/avplayer";
        o.style.cssText = "position:absolute;left:0;top:0;width:1920px;height:1080px;z-index:0";
        document.body.insertBefore(o, document.body.firstChild);
      }
      this.r = [0, 0, 1920, 1080];
    }
    get ap() {
      return plat.avplay;
    }
    async open(s) {
      const ap = this.ap;
      if (!ap) throw new Error("AVPlay indispon\xEDvel");
      this.stop();
      const tk = ++this.tk;
      let url2 = s.url;
      if (/\.txt(\?|$)/i.test(url2) && !/\|COMPONENT=/.test(url2)) url2 += "|COMPONENT=HLS";
      try {
        ap.open(url2);
        ap.setDisplayRect(...this.r);
        ap.setDisplayMethod("PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO");
        const b = s.live ? BUF[prefs.get().buffer] || BUF.normal : [5, 10];
        ap.setBufferingParam("PLAYER_BUFFER_FOR_PLAY", "PLAYER_BUFFER_SIZE_IN_SECOND", b[0]);
        ap.setBufferingParam("PLAYER_BUFFER_FOR_RESUME", "PLAYER_BUFFER_SIZE_IN_SECOND", b[1]);
        if (s.ref || s.ua) {
          let m = "";
          if (s.ref) m += "Referer: " + s.ref + "\r\n";
          if (s.ua) m += "User-Agent: " + s.ua + "\r\n";
          ap.setStreamingProperty("CUSTOM_MESSAGE", m);
        }
        if (s.clearKey) {
          const [i, k] = s.clearKey.split(":");
          if (i && k) ap.setDrm("CLEARKEY", "SetProperties", JSON.stringify({ drm_type: "CLEARKEY", keys: [{ key_id: i, key: k }] }));
        }
        ap.setListener({
          onbufferingstart: () => this.ev.buf && this.ev.buf(true),
          onbufferingcomplete: () => this.ev.buf && this.ev.buf(false),
          oncurrentplaytime: (t) => {
            this.pos = t / 1e3;
            this.ev.time && this.ev.time(this.pos, this.dur);
          },
          onstreamcompleted: () => tk === this.tk && this.ev.end && this.ev.end(),
          onerror: (e) => tk === this.tk && this.ok && this.ev.err && this.ev.err("Erro AVPlay: " + e)
        });
        await new Promise((res, rej) => {
          const t0 = Date.now(), lim = s.live && !s.manual ? 12e3 : s.live ? 3e4 : 115e3, iv = setInterval(() => {
            if (tk !== this.tk) {
              clearInterval(iv);
              rej(new Error(CANCEL));
            } else if (Date.now() - t0 > lim) {
              clearInterval(iv);
              rej(new Error("Tempo esgotado (" + host(s.url) + ")"));
            }
          }, 500);
          ap.prepareAsync(
            () => {
              clearInterval(iv);
              if (tk !== this.tk) return rej(new Error(CANCEL));
              this.ok = true;
              ap.play();
              try {
                this.dur = ap.getDuration() / 1e3;
              } catch (e) {
              }
              res();
            },
            (e) => {
              clearInterval(iv);
              rej(new Error("Falha ao preparar (" + host(s.url) + "): " + (e && (e.name || e.message) || e)));
            }
          );
        });
        if (s.start > 5) try {
          ap.seekTo(s.start * 1e3);
        } catch (e) {
        }
      } catch (e) {
        this.stop(true);
        throw e;
      }
    }
    rect(x, y, w, h2) {
      this.r = [x, y, w, h2];
      try {
        this.ok && this.ap.setDisplayRect(x, y, w, h2);
      } catch (e) {
      }
    }
    pause() {
      try {
        this.ap.pause();
      } catch (e) {
      }
    }
    resume() {
      try {
        this.ap.play();
      } catch (e) {
      }
    }
    seek(t) {
      try {
        this.ap.seekTo(Math.max(0, t) * 1e3);
      } catch (e) {
      }
    }
    stop() {
      this.tk++;
      this.ok = false;
      try {
        const ap = this.ap;
        if (ap) {
          ap.stop();
          ap.close();
        }
      } catch (e) {
      }
    }
  };
  var ExoEngine = class {
    constructor(ev) {
      this.ev = ev;
      this.tk = 0;
      this.cb = null;
      this.r = [0, 0, 1920, 1080];
      if (!document.getElementById("d2-exo")) {
        const st = document.createElement("style");
        st.id = "d2-exo";
        st.textContent = "html.exo,html.exo body,html.exo #app,html.exo #video-layer{background:transparent!important}";
        document.head.append(st);
      }
      window.__exoEv = (t, a, b) => this.nat(t, a, b);
    }
    nat(t, a, b) {
      const ev = this.ev;
      if (t === "ready") this.cb && this.cb.ready();
      else if (t === "err") {
        this.cb ? this.cb.err(String(a)) : this.live && ev.err && ev.err("Erro nativo: " + a);
      } else if (t === "time") {
        this.pos = +a || 0;
        this.dur = +b || 0;
        ev.time && ev.time(this.pos, this.dur);
      } else if (t === "buf") ev.buf && ev.buf(!!+a);
      else if (t === "end") ev.end && ev.end();
    }
    async open(s) {
      const E = plat.exo;
      if (!E) throw new Error("Player nativo indispon\xEDvel");
      this.stop();
      const tk = ++this.tk;
      this.live = !!s.live;
      await new Promise((res, rej) => {
        let fin = false;
        const done = (f, x) => {
          if (fin) return;
          fin = true;
          clearTimeout(tm);
          this.cb = null;
          f(x);
        }, tm = setTimeout(() => done(rej, new Error("Tempo esgotado (" + host(s.url) + ")")), s.live && !s.manual ? 15e3 : s.live ? 3e4 : 115e3);
        this.cb = {
          ready: () => tk !== this.tk ? done(rej, new Error(CANCEL)) : (document.documentElement.classList.add("exo"), this.rect(...this.r), done(res)),
          err: (m) => done(rej, new Error("Falha no player nativo (" + host(s.url) + "): " + m))
        };
        try {
          E.exoPlay(JSON.stringify({ url: s.url, ua: s.ua || "", ref: s.ref || "", live: !!s.live, clearKey: s.clearKey || "" }));
          this.rect(...this.r);
        } catch (e) {
          done(rej, e);
        }
      });
      if (s.start > 5) this.seek(s.start);
    }
    rect(x, y, w, h2) {
      this.r = [x, y, w, h2];
      try {
        const E = plat.exo;
        if (!E) return;
        if (w >= 1900 && h2 >= 1060) return E.exoRectFull();
        const d = document.documentElement, b = d.getBoundingClientRect(), k = b.width / (d.offsetWidth || 1920), dp = window.devicePixelRatio || 1;
        E.exoRect(Math.round((b.left + x * k) * dp), Math.round((b.top + y * k) * dp), Math.round(w * k * dp), Math.round(h2 * k * dp));
      } catch (e) {
      }
    }
    pause() {
      try {
        plat.exo.exoPause();
      } catch (e) {
      }
    }
    resume() {
      try {
        plat.exo.exoResume();
      } catch (e) {
      }
    }
    seek(t) {
      try {
        plat.exo.exoSeek(t);
      } catch (e) {
      }
    }
    stop() {
      this.tk++;
      this.cb = null;
      document.documentElement.classList.remove("exo");
      try {
        plat.exo && plat.exo.exoStop();
      } catch (e) {
      }
    }
  };
  var hlsP = null;
  function carregaHls() {
    if (window.Hls) return Promise.resolve();
    return hlsP || (hlsP = new Promise((ok, no) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js";
      s.onload = ok;
      s.onerror = () => {
        hlsP = null;
        no(new Error("hls.js indispon\xEDvel"));
      };
      document.head.append(s);
    }));
  }
  var HtmlEngine = class {
    constructor(v, ev) {
      this.v = v;
      this.ev = ev;
      this.tk = 0;
      this.hls = null;
      this.ok = false;
      v.addEventListener("timeupdate", () => this.ev.time && this.ev.time(v.currentTime, v.duration || 0));
      v.addEventListener("waiting", () => this.ev.buf && this.ev.buf(true));
      v.addEventListener("playing", () => this.ev.buf && this.ev.buf(false));
      v.addEventListener("ended", () => this.ev.end && this.ev.end());
      v.addEventListener("error", () => {
        this.ok && this.ev.err && this.ev.err("Erro de v\xEDdeo");
      });
    }
    async open(s) {
      const v = this.v;
      this.stop();
      const tk = ++this.tk;
      const m3u = /\.m3u8|\.txt(\?|$)/i.test(s.url) || s.hls;
      if (m3u && !v.canPlayType("application/vnd.apple.mpegurl")) {
        await carregaHls();
        if (tk !== this.tk) throw new Error(CANCEL);
        if (!window.Hls || !window.Hls.isSupported()) throw new Error("HLS n\xE3o suportado");
        this.hls = new window.Hls({ maxBufferLength: 30, liveSyncDurationCount: 4, manifestLoadingMaxRetry: 2, fragLoadingMaxRetry: 3 });
        this.hls.on(window.Hls.Events.ERROR, (e, d) => {
          if (d.fatal && this.ok && this.ev.err) this.ev.err("Erro HLS: " + d.details);
        });
        this.hls.loadSource(s.url);
        this.hls.attachMedia(v);
      } else v.src = s.url;
      await new Promise((res, rej) => {
        const fim = () => {
          clearTimeout(tm);
          v.removeEventListener("playing", on);
          v.removeEventListener("resize", on);
          v.removeEventListener("error", er);
        }, on = () => {
          if (!v.videoWidth && !s.audio) return;
          fim();
          this.ok = true;
          res();
        }, er = () => {
          fim();
          rej(new Error("Erro de v\xEDdeo (" + host(s.url) + ")"));
        }, tm = setTimeout(() => {
          fim();
          rej(new Error("Sem imagem (" + host(s.url) + ")"));
        }, s.live && !s.manual ? 15e3 : s.live ? 3e4 : 6e4);
        v.addEventListener("playing", on);
        v.addEventListener("resize", on);
        v.addEventListener("error", er);
        const p = v.play();
        p && p.catch && p.catch(() => {
        });
      });
      if (tk !== this.tk) throw new Error(CANCEL);
      if (s.start > 5) try {
        v.currentTime = s.start;
      } catch (e) {
      }
    }
    rect() {
    }
    pause() {
      this.v.pause();
    }
    resume() {
      this.v.play();
    }
    seek(t) {
      try {
        this.v.currentTime = Math.max(0, t);
      } catch (e) {
      }
    }
    stop() {
      this.tk++;
      this.ok = false;
      if (this.hls) {
        try {
          this.hls.destroy();
        } catch (e) {
        }
        this.hls = null;
      }
      try {
        this.v.pause();
        this.v.removeAttribute("src");
        this.v.load();
      } catch (e) {
      }
    }
  };
  var Player = class {
    constructor(video, ev) {
      this.ev = ev || {};
      this.v = video;
      this.nat = plat.exo ? new ExoEngine(this.proxy()) : plat.avplay ? new AvEngine(this.proxy()) : null;
      this.web = new HtmlEngine(video, this.proxy());
      this.act = null;
      this.pos = 0;
      this.dur = 0;
    }
    proxy() {
      const self = this;
      return {
        time: (t, d) => {
          self.pos = t;
          self.dur = d;
          self.ev.time && self.ev.time(t, d);
        },
        buf: (b) => self.ev.buf && self.ev.buf(b),
        end: () => self.ev.end && self.ev.end(),
        err: (m) => self.ev.err && self.ev.err(m)
      };
    }
    ponteUrl(s) {
      const P3 = plat.ponte;
      let u = "http://" + P3.ip + ":" + P3.porta + "/p?u=" + b64u(s.url);
      if (s.ua) u += "&a=" + b64u(s.ua);
      if (s.ref) u += "&r=" + b64u(s.ref);
      if (/\.m3u8|\.txt(\?|$)/i.test(s.url)) u += "&e=.m3u8";
      return __spreadProps(__spreadValues({}, s), { url: u, _p: 1 });
    }
    async open(s) {
      const P3 = plat.ponte, privada = /^https?:\/\/(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(s.url), usaPonte = !!P3 && !s.audio && !s._p && /^https?:/i.test(s.url) && !privada, sempre = usaPonte && prefs.get().ponteSempre;
      const msg = this.ev.msg || (() => {
      });
      if (sempre) try {
        await this.try1(this.ponteUrl(s));
        return;
      } catch (e) {
        if (e.message === CANCEL) throw e;
        msg("Pela ponte falhou, tentando direto...");
      }
      try {
        await this.try1(s);
      } catch (e) {
        if (e.message === CANCEL) throw e;
        if (!usaPonte || sempre) throw e;
        msg("Tentando pela ponte do celular...");
        await this.try1(this.ponteUrl(s));
      }
    }
    async try1(s) {
      this.web.stop();
      if (this.nat) {
        try {
          await this.nat.open(s);
          this.act = this.nat;
          return;
        } catch (e) {
          if (e.message === CANCEL) throw e;
          this.nat.stop();
          if (/^https:/i.test(s.url) && !/esgotado/i.test(e.message) && plat.avplay) try {
            await this.nat.open(__spreadProps(__spreadValues({}, s), { url: s.url.replace(/^https:/i, "http:") }));
            this.act = this.nat;
            return;
          } catch (e2) {
            if (e2.message === CANCEL) throw e2;
            this.nat.stop();
          }
          if (!s.live && /esgotado/i.test(e.message)) throw e;
        }
      }
      this.act = this.web;
      await this.web.open(s);
    }
    rect(x, y, w, h2) {
      this.nat && this.nat.rect(x, y, w, h2);
    }
    pause() {
      this.act && this.act.pause();
    }
    resume() {
      this.act && this.act.resume();
    }
    seek(t) {
      this.act && this.act.seek(t);
    }
    stop() {
      this.nat && this.nat.stop();
      this.web.stop();
      this.act = null;
    }
  };

  // src/watch.js
  var pl;
  var P2;
  var S = null;
  var osdT = 0;
  var saveT = 0;
  var root = () => document.documentElement;
  function initWatch() {
    P2 = pl = new Player($("#v"), {
      time: (t, d) => {
        if (!S) return;
        S.t = t;
        S.d = d;
        paint();
        if (S.kind === "vod" && Date.now() - saveT > 8e3) {
          saveT = Date.now();
          grava();
        }
      },
      buf: (b) => $("#pl").classList.toggle("buf", !!b),
      end: () => {
        if (!S) return;
        S.kind === "live" ? erroLive("A transmiss\xE3o terminou") : fimVod();
      },
      err: (m) => {
        if (!S) return;
        S.kind === "live" ? erroLive(m) : erroVod(m);
      },
      msg: (m) => toast(m, 2500)
    });
    const pe = $("#pl");
    pe.addEventListener("click", (e) => {
      if (e.target.closest(".f,#gv")) return;
      osd(!pe.classList.contains("osd"));
    });
    let y0 = null, x0 = null;
    pe.addEventListener("touchstart", (e) => {
      const t = e.touches[0];
      y0 = t.clientY;
      x0 = t.clientX;
    }, { passive: true });
    pe.addEventListener("touchend", (e) => {
      if (y0 == null || !S || S.kind !== "live" || e.target.closest("#gv")) return;
      const t = e.changedTouches[0], dy = t.clientY - y0, dx = t.clientX - x0;
      y0 = null;
      if (Math.abs(dy) > 70 && Math.abs(dy) > Math.abs(dx) * 1.5) zap(dy < 0 ? 1 : -1);
    });
    initWatch.pl = pl;
    return pl;
  }
  var assistindo = () => !!S;
  function osd(on, fixo) {
    const pe = $("#pl");
    pe.classList.toggle("osd", on);
    clearTimeout(osdT);
    if (on) {
      setScope(() => $("#pl"));
      if (!current() || !current().isConnected || !pe.contains(current())) focus(pe.querySelector("[data-first]") || pe.querySelector(".f"));
      if (!fixo) osdT = setTimeout(() => osd(false), 6e3);
    } else {
      const f = current();
      f && f.classList.remove("on");
    }
  }
  function paint() {
    if (!S) return;
    const pb = $("#pl .pb i");
    if (S.kind === "vod") {
      pb.style.width = (S.d ? Math.min(100, S.t / S.d * 100) : 0) + "%";
      $("#pl .t1").textContent = fmt(S.t);
      $("#pl .t2").textContent = fmt(S.d);
    }
    const sk = $("#pl .skip");
    if (sk) sk.style.display = S.kind === "vod" && S.serie && S.t < 240 ? "" : "none";
  }
  function monta() {
    const pe = $("#pl");
    pe.innerHTML = "";
    const live = S.kind === "live", B = (t, fn, x = {}) => h("div", { class: "btn f " + (x.c || ""), "data-first": x.first, onclick: () => {
      fn();
      if (!x.keep) osd(true);
    } }, t);
    const ctl = h("div", { class: "ctl" });
    if (live) {
      ctl.append(
        B("\u25B2 Canal", () => zap(-1)),
        B("\u25BC Canal", () => zap(1)),
        B("\u2630 Canais", gaveta, { first: 1, keep: 1 }),
        B("\u2699 Fontes", fontes, { keep: 1 }),
        B(favs.has(S.ch.id) ? "\u2605 Favorito" : "\u2606 Favoritar", (e) => {
          favs.toggle(S.ch.id);
          monta2();
        }, { keep: 1 })
      );
    } else {
      ctl.append(B("\u23EA 30s", () => pl.seek(S.t - 30)), B("\u23EA 10s", () => pl.seek(S.t - 10)), B("\u23EF", toggle, { first: 1 }), B("10s \u23E9", () => pl.seek(S.t + 10)), B("30s \u23E9", () => pl.seek(S.t + 30)));
      if (S.serie) {
        const sk = B("Pular abertura \u23ED", () => pl.seek(S.t + 85));
        sk.classList.add("skip");
        ctl.append(B("\u23EE Ep.", () => vaiEp(-1), { keep: 1 }), B("Ep. \u23ED", () => vaiEp(1), { keep: 1 }), sk);
      }
      ctl.append(B("\u2699 Fontes", fontes, { keep: 1 }));
    }
    pe.append(
      h("div", { class: "top" }, h("span", { class: "tt" }, S.titulo || "")),
      h("div", { class: "sp" }),
      h("div", { class: "bot" }, live ? null : h("div", { class: "pb" }, h("i")), live ? null : h("div", { class: "tm" }, h("span", { class: "t1" }, "00:00"), h("span", { class: "t2" }, "00:00")), ctl),
      h("div", { id: "gv" })
    );
    function monta2() {
      const o = pe.classList.contains("osd"), b = pe.querySelector(".buf");
      monta();
      pe.classList.toggle("osd", o);
      if (o) focus(pe.querySelector(".f"));
    }
  }
  function toggle() {
    if (S.paused) {
      pl.resume();
      S.paused = false;
    } else {
      pl.pause();
      S.paused = true;
    }
  }
  async function abrirLive(lista, idx) {
    S = { kind: "live", lista, ch: lista[idx], vi: 0, rt: 0, okT: 0, tok: 0 };
    root().classList.add("assistindo");
    monta();
    prefs.set({ ultimoCanal: S.ch.id });
    setScope(() => $("#pl"));
    const off = onBack(sair);
    S.off = off;
    await sintoniza(S.ch, 0, false);
  }
  async function sintoniza(ch, vi, manual) {
    const my = ++S.tok;
    S.ch = ch;
    S.vi = vi;
    S.manual = !!manual;
    S.rt = 0;
    S.restart = false;
    $("#pl .tt").textContent = ch.num + " \xB7 " + ch.name + (ch.variants.length > 1 ? "  (fonte " + (vi + 1) + "/" + ch.variants.length + ")" : "");
    osd(true);
    $("#pl").classList.add("buf");
    const n = ch.variants.length;
    for (let k = 0; k < n; k++) {
      const i = (vi + k) % n, v = ch.variants[i];
      try {
        await pl.open({ url: v.url, live: true, manual, ua: v.userAgent, ref: v.referer, clearKey: v.clearKey });
        if (my !== S.tok) return;
        S.vi = i;
        S.okT = Date.now();
        $("#pl").classList.remove("buf");
        $("#pl .tt").textContent = ch.num + " \xB7 " + ch.name + (n > 1 ? "  (fonte " + (i + 1) + "/" + n + ")" : "");
        osd(true);
        return;
      } catch (e) {
        if (my !== S.tok || e.message === "cancelado") return;
        if (manual) {
          $("#pl").classList.remove("buf");
          toast("Essa fonte n\xE3o abriu. Escolha outra em Fontes.");
          return;
        }
        if (k < n - 1) toast("Fonte " + (i + 1) + " falhou, tentando a pr\xF3xima...", 2e3);
      }
    }
    $("#pl").classList.remove("buf");
    toast("Nenhuma fonte abriu esse canal agora.");
  }
  function erroLive(m) {
    if (!S || S.kind !== "live" || S.restart) return;
    if (Date.now() - S.okT > 3e4) S.rt = 0;
    const ch = S.ch, vi = S.vi, my = S.tok;
    if (S.rt < 2) {
      S.rt++;
      S.restart = true;
      toast("A fonte caiu. Reiniciando (" + S.rt + "/2)...", 2500);
      setTimeout(async () => {
        if (!S || S.tok !== my) return;
        S.restart = false;
        const v = ch.variants[vi];
        $("#pl").classList.add("buf");
        try {
          await pl.open({ url: v.url, live: true, manual: S.manual, ua: v.userAgent, ref: v.referer, clearKey: v.clearKey });
          if (S && S.tok === my) {
            S.okT = Date.now();
            $("#pl").classList.remove("buf");
          }
        } catch (e) {
          if (S && S.tok === my && e.message !== "cancelado") {
            S.restart = false;
            erroLive(e.message);
          }
        }
      }, 1500);
    } else {
      S.rt = 0;
      if (S.manual) toast("A fonte caiu. Abra Fontes e escolha outra.");
      else if (ch.variants.length > 1) {
        toast("A fonte n\xE3o voltou. Trocando de fonte...");
        sintoniza(ch, (vi + 1) % ch.variants.length, false);
      } else toast("A transmiss\xE3o caiu.");
    }
  }
  function zap(d) {
    if (!S || S.kind !== "live") return;
    const l = S.lista, i = (l.findIndex((c) => c.id === S.ch.id) + d + l.length) % l.length;
    prefs.set({ ultimoCanal: l[i].id });
    sintoniza(l[i], 0, false);
    monta();
    osd(true);
  }
  function gaveta() {
    const g = $("#gv");
    if (g.classList.contains("on2")) {
      g.classList.remove("on2");
      setScope(() => $("#pl"));
      return;
    }
    g.innerHTML = "";
    S.lista.forEach((c, i) => g.append(h(
      "div",
      { class: "ch f", onclick: () => {
        g.classList.remove("on2");
        setScope(() => $("#pl"));
        sintoniza(c, 0, false);
        monta();
        osd(true);
      } },
      c.logo ? h("img", { src: c.logo, loading: "lazy" }) : null,
      h("div", { class: "n" }, c.num + " \xB7 " + c.name)
    )));
    g.classList.add("on2");
    setScope(() => g);
    const cur2 = [...g.children].find((_, i) => S.lista[i].id === S.ch.id) || g.firstChild;
    focus(cur2);
  }
  function fontes() {
    const L = S.kind === "live" ? S.ch.variants.map((v, i) => ({ t: "Fonte " + (i + 1) + (v.quality ? " \xB7 " + v.quality : ""), s: v.url.split("/")[2], sel: i === S.vi, fn: () => sintoniza(S.ch, i, true) })) : S.srcs.map((u, i) => ({ t: "Fonte " + (i + 1), s: u.split("/")[2], sel: i === S.si, fn: () => abreVod(i, S.t, true) }));
    clearTimeout(osdT);
    modal("Fontes", L);
  }
  async function abrirVod(it, ctx) {
    S = { kind: "vod", it, serie: !!it.serie, srcs: ctx.srcs, si: 0, titulo: ctx.titulo, s: ctx.s, e: ctx.e, seasons: ctx.seasons, t: ctx.start || 0, d: 0, tok: 0, rt: 0 };
    root().classList.add("assistindo");
    monta();
    setScope(() => $("#pl"));
    S.off = onBack(sair);
    saveT = Date.now();
    $("#pl .tt").textContent = S.titulo;
    await abreVod(0, S.t, false);
  }
  async function abreVod(i, start, manual) {
    const my = ++S.tok;
    S.si = i;
    osd(true);
    $("#pl").classList.add("buf");
    const n = S.srcs.length;
    for (let k = 0; k < n; k++) {
      const j = (i + k) % n;
      try {
        await pl.open({ url: S.srcs[j], live: false, manual: true, start });
        if (my !== S.tok) return;
        S.si = j;
        $("#pl").classList.remove("buf");
        osd(true);
        return;
      } catch (e) {
        if (my !== S.tok || e.message === "cancelado") return;
        if (manual) {
          toast("Essa fonte n\xE3o abriu.");
          $("#pl").classList.remove("buf");
          return;
        }
        if (k < n - 1) toast("Fonte " + (j + 1) + " falhou, tentando a pr\xF3xima...", 2e3);
      }
    }
    $("#pl").classList.remove("buf");
    toast("Nenhuma fonte abriu esse v\xEDdeo.");
  }
  function erroVod(m) {
    if (!S || S.kind !== "vod" || S.restart) return;
    if (S.rt < 1) {
      S.rt++;
      S.restart = true;
      toast("Falha no v\xEDdeo. Reiniciando...", 2500);
      const t = S.t;
      setTimeout(() => {
        if (S) {
          S.restart = false;
          abreVod(S.si, t, false);
        }
      }, 1500);
    } else {
      S.rt = 0;
      if (S.srcs.length > 1) {
        toast("Trocando de fonte...");
        abreVod((S.si + 1) % S.srcs.length, S.t, false);
      } else toast("O v\xEDdeo parou de carregar.");
    }
  }
  function grava() {
    if (!S || S.kind !== "vod" || !S.d) return;
    const it = S.it, done = S.d - S.t < 120;
    progress.set(it.id, { t: S.t, d: S.d, title: it.title, poster: it.poster, serie: it.serie, s: S.s, e: S.e, done: done && !it.serie ? true : false, letra: it.letra, tmdb: it.tmdb });
  }
  function proxEp(d) {
    if (!S || !S.seasons) return null;
    const all = [];
    S.seasons.forEach((se) => se.eps.forEach((ep) => all.push({ s: se.n, ep })));
    const i = all.findIndex((x) => x.s === S.s && x.ep.n === S.e), n = all[i + d];
    return n || null;
  }
  function vaiEp(d) {
    const n = proxEp(d);
    if (!n) {
      toast(d > 0 ? "Esse \xE9 o \xFAltimo epis\xF3dio." : "Esse \xE9 o primeiro epis\xF3dio.");
      return;
    }
    grava();
    const it = S.it, seasons = S.seasons;
    progress.set(it.id, { t: 0, d: 0, title: it.title, poster: it.poster, serie: true, s: n.s, e: n.ep.n, letra: it.letra, tmdb: it.tmdb });
    const off = S.off;
    pl.stop();
    S = null;
    off && off();
    abrirVod(it, { srcs: n.ep.sources, titulo: it.title + " \xB7 T" + n.s + " E" + n.ep.n, start: 0, s: n.s, e: n.ep.n, seasons });
  }
  function fimVod() {
    if (S.serie && prefs.get().proximoAuto && proxEp(1)) {
      toast("Pr\xF3ximo epis\xF3dio...", 1500);
      vaiEp(1);
    } else {
      grava();
      progress.set(S.it.id, { done: !S.serie, t: 0 });
      sair();
    }
  }
  function sair() {
    if (!S) return;
    if (S.kind === "vod") grava();
    const off = S.off;
    S.tok++;
    pl.stop();
    S = null;
    off && off();
    clearTimeout(osdT);
    root().classList.remove("assistindo");
    $("#pl").classList.remove("osd", "buf");
    setScope(() => $("#ui"));
    window.dispatchEvent(new Event("drekz-voltou"));
  }
  function playerKey(e) {
    if (!S) return false;
    const pe = $("#pl"), vis = pe.classList.contains("osd"), g = $("#gv").classList.contains("on2");
    if (is(e, "CHUP") && S.kind === "live") {
      zap(-1);
      return true;
    }
    if (is(e, "CHDOWN") && S.kind === "live") {
      zap(1);
      return true;
    }
    if (is(e, "PLAY") || is(e, "PAUSE")) {
      if (S.kind === "vod") toggle();
      return true;
    }
    if (is(e, "FF") && S.kind === "vod") {
      pl.seek(S.t + 30);
      osd(true);
      return true;
    }
    if (is(e, "RW") && S.kind === "vod") {
      pl.seek(S.t - 30);
      osd(true);
      return true;
    }
    if (document.getElementById("modal").style.display === "flex" || g) return false;
    if (!vis) {
      if (is(e, "ENTER")) {
        osd(true);
        return true;
      }
      if (is(e, "UP") || is(e, "DOWN")) {
        if (S.kind === "live") {
          zap(is(e, "UP") ? -1 : 1);
          return true;
        }
        osd(true);
        return true;
      }
      if (is(e, "LEFT") || is(e, "RIGHT")) {
        if (S.kind === "vod") {
          pl.seek(S.t + (is(e, "LEFT") ? -10 : 10));
          osd(true);
          return true;
        }
        osd(true);
        return true;
      }
    } else if (is(e, "BACK")) {
      osd(false);
      return true;
    } else {
      clearTimeout(osdT);
      osdT = setTimeout(() => osd(false), 6e3);
    }
    return false;
  }

  // src/data.js
  var TMDB = "https://api.themoviedb.org/3";
  var KEY2 = "15d2ea6d0dc1d476efbca3eba2b9bbfb";
  var IMG = "https://image.tmdb.org/t/p/";
  var base = (k) => {
    const p = prefs.get();
    return (k === "c" ? p.urlCanais : p.urlFilmes) || (k === "c" ? "https://canais-saimo.pages.dev/" : "https://filmes-saimo.pages.dev/");
  };
  var CATS = ["TV Aberta", "Filmes e S\xE9ries", "Esportes", "Not\xEDcias", "Infantil", "Document\xE1rios", "Pluto TV", "24 Horas", "Variedades"];
  var mem = {};
  function parseCanais(txt) {
    const out = [];
    let c = null, v = null, n = 1;
    for (let l of txt.split(/\r?\n/)) {
      l = l.trim();
      if (!l || l[0] === "#") continue;
      const i = l.indexOf(":");
      if (i < 0) continue;
      const k = l.slice(0, i).trim().toLowerCase(), val = l.slice(i + 1).trim();
      if (k === "canal") {
        if (c && c.variants.length) out.push(c);
        c = { id: "ch_" + n, name: val, cat: "Variedades", logo: "", variants: [] };
        n++;
        v = null;
      } else if (c) {
        if (k === "categoria") c.cat = val;
        else if (k === "logo") c.logo = val;
        else if (k === "fonte") {
          v = { url: val };
          c.variants.push(v);
        } else if (v) {
          if (k === "qualidade") v.quality = val;
          else if (k === "referer") v.referer = val;
          else if (k === "agente") v.userAgent = val;
          else if (k === "chave") v.clearKey = val;
        }
      }
    }
    if (c && c.variants.length) out.push(c);
    const o = (x) => {
      const i = CATS.indexOf(x.cat);
      return i < 0 ? CATS.length : i;
    };
    out.forEach((x, i) => x._i = i);
    out.sort((a, b) => o(a) - o(b) || a._i - b._i);
    out.forEach((x, i) => x.num = i + 1);
    return out;
  }
  async function canais(force) {
    if (mem.canais && !force) return mem.canais;
    try {
      const t = await get(base("c") + "catalogo.txt");
      const r = parseCanais(t);
      if (r.length) {
        cache.set("canais", r);
        mem.canais = r;
        return r;
      }
    } catch (e) {
    }
    return mem.canais = cache.get("canais", []);
  }
  function categorias(list) {
    const s = [];
    list.forEach((c) => s.includes(c.cat) || s.push(c.cat));
    return s.sort((a, b) => {
      const i = CATS.indexOf(a), j = CATS.indexOf(b);
      return (i < 0 ? 99 : i) - (j < 0 ? 99 : j);
    });
  }
  var poster = (p, w) => !p ? "" : /^https?:/.test(p) ? p : IMG + w + p;
  async function fichas() {
    if (mem.fichas) return mem.fichas;
    try {
      const t = await get(base("f") + "fichas.txt");
      const out = [];
      for (const l of t.split(/\r?\n/)) {
        const o = l.split("	");
        if (o.length < 5) continue;
        const serie = o[0] === "s", title = o[1].trim(), L = title[0].toUpperCase();
        out.push({
          id: (serie ? "s_" : "f_") + title,
          title,
          serie,
          tmdb: parseInt(o[2]) || 0,
          poster: poster(o[3].trim(), "w342"),
          genres: o[4].split(",").map((x) => x.trim()).filter(Boolean),
          letra: /[A-Z]/.test(L) ? L : "#",
          n: norm(title)
        });
      }
      if (out.length) {
        mem.fichas = out;
        return out;
      }
    } catch (e) {
    }
    return mem.fichas = [];
  }
  async function destaques() {
    if (mem.dest) return mem.dest;
    try {
      const t = await get(base("f") + "destaques.txt");
      const rails = [];
      let r = null, capa = IMG + "w342";
      for (let l of t.split(/\r?\n/)) {
        l = l.trim();
        if (!l || l[0] === "#") continue;
        if (l.startsWith("capa:")) capa = l.slice(5).trim();
        else if (l.startsWith("fila	")) {
          r = { titulo: l.slice(5).trim(), itens: [] };
          rails.push(r);
        } else if (r) {
          const f = l.split("	");
          if (f.length < 3) continue;
          const serie = f[0].trim() !== "f", title = f[1].trim(), p = (f[4] || "").trim();
          r.itens.push({
            id: (serie ? "s_" : "f_") + title,
            title,
            serie,
            letra: f[2].trim(),
            year: (f[3] || "").trim(),
            poster: p ? /^https?:/.test(p) ? p : capa + p : "",
            genres: []
          });
        }
      }
      if (rails.length) {
        cache.set("dest", rails);
        return mem.dest = rails;
      }
    } catch (e) {
    }
    return mem.dest = cache.get("dest", []);
  }
  async function bases() {
    if (mem.bases) return mem.bases;
    const b = [];
    for (const f of ["bases.txt", "indice.txt"]) {
      try {
        const t = await get(base("f") + f + "?t=" + Date.now());
        for (const l of t.split(/\r?\n/)) {
          const m = /^\s*(?:base\s*:)?\s*(\d+)\s*[\s:=]\s*(https?:\/\/\S+)/i.exec(l);
          if (m && !b[+m[1]]) b[+m[1]] = m[2].trim();
        }
      } catch (e) {
      }
    }
    if (b.length) mem.bases = b;
    return b;
  }
  function url(s, B) {
    s = s.trim();
    if (/^https?:\/\//.test(s)) return s;
    const i = s.indexOf(":");
    if (i <= 0 || i === s.length - 1) return "";
    const n = parseInt(s.slice(0, i), 10), r = B[n];
    if (isNaN(n) || !r) return "";
    const o = s.slice(i + 1);
    return o.includes(".") ? r + o : r + o + ".mp4";
  }
  var letra = (it) => {
    const L = (it.letra || it.title[0]).toUpperCase();
    return /[A-Z]/.test(L) ? L : "#";
  };
  async function fontesFilme(it) {
    if (it.sources && it.sources.length) return it.sources;
    const B = await bases(), t = await get(base("f") + "filmes-" + letra(it) + ".txt?t=" + Date.now());
    for (const l of t.split(/\r?\n/)) {
      const c = l.split("	");
      if (c.length < 2) continue;
      const nm = c[0].trim();
      if (nm === it.title || nm.startsWith(it.title)) {
        const s = [];
        for (let i = 1; i < c.length; i++) {
          const f = c[i].trim(), e = f.indexOf("=");
          if (e > 0) for (const m of f.slice(e + 1).split(",")) {
            const u = url(m, B);
            u && s.push(u);
          }
        }
        return it.sources = s;
      }
    }
    return [];
  }
  async function temporadas(it) {
    if (it.seasons) return it.seasons;
    const B = await bases(), L = letra(it);
    const idx = await get(base("f") + "series-" + L + ".txt?t=" + Date.now());
    let k = 0;
    for (const l of idx.split(/\r?\n/)) {
      const c = l.split("	");
      if (c.length >= 3 && c[0].trim() === it.title) {
        k = parseInt(c[2].trim(), 10) || 0;
        break;
      }
    }
    const t = await get(base("f") + "series-" + L + "-" + k + ".txt?t=" + Date.now());
    const map = /* @__PURE__ */ new Map();
    let on = false;
    for (const l of t.split(/\r?\n/)) {
      if (l[0] === "@") {
        if (on) break;
        on = l.slice(1).split("	")[0].trim() === it.title;
        continue;
      }
      if (!on) continue;
      const c = l.split("	");
      if (c.length < 4) continue;
      const s = parseInt(c[0]) || 1, e = parseInt(c[1]) || 1, src = c[3].split(",").map((x) => url(x, B)).filter(Boolean);
      if (!map.has(s)) map.set(s, /* @__PURE__ */ new Map());
      const m = map.get(s);
      m.has(e) ? m.get(e).sources.push(...src) : m.set(e, { n: e, title: "Epis\xF3dio " + e, sources: src });
    }
    const out = [...map].map(([s, m]) => ({ n: s, eps: [...m.values()].sort((a, b) => a.n - b.n) })).sort((a, b) => a.n - b.n);
    return it.seasons = out;
  }
  async function detalhes(it) {
    if (it._det) return it;
    it._det = 1;
    const f = (await fichas()).find((x) => x.id === it.id);
    if (f) {
      it.tmdb = f.tmdb;
      it.genres = f.genres;
      it.poster = it.poster || f.poster;
    }
    if (!it.tmdb) return it;
    try {
      const j = await get("".concat(TMDB, "/").concat(it.serie ? "tv" : "movie", "/").concat(it.tmdb, "?api_key=").concat(KEY2, "&language=pt-BR"), { text: false });
      it.sinopse = j.overview || "";
      it.nota = j.vote_average || 0;
      it.ano = (j.release_date || j.first_air_date || "").slice(0, 4);
      if (j.backdrop_path) it.fundo = IMG + "w1280" + j.backdrop_path;
      if (j.poster_path && !it.poster) it.poster = IMG + "w342" + j.poster_path;
      if (j.genres && j.genres.length) it.genres = j.genres.map((g) => g.name);
    } catch (e) {
    }
    return it;
  }
  async function tmdbBusca(q) {
    try {
      const j = await get("".concat(TMDB, "/search/multi?api_key=").concat(KEY2, "&language=pt-BR&query=").concat(encodeURIComponent(q)), { text: false, timeout: 8e3 });
      return (j.results || []).filter((r) => r.media_type === "movie" || r.media_type === "tv").map((r) => ({ tmdb: r.id, tv: r.media_type === "tv" }));
    } catch (e) {
      return [];
    }
  }
  function recarregar() {
    for (const k in mem) delete mem[k];
  }

  // src/search.js
  function score(q, qt, it) {
    const t = it.n;
    if (!t) return 0;
    if (t === q) return 100;
    if (t.startsWith(q)) return 90;
    if (t.includes(q)) return 75;
    const w = t.split(" ");
    let s = 0, ok = 0;
    for (const x of qt) {
      let best = 0;
      for (const y of w) {
        if (y === x) best = Math.max(best, 1);
        else if (y.startsWith(x)) best = Math.max(best, 0.85);
        else if (x.length >= 4 || y.length >= 4) {
          const d = lev(x, y), m = Math.max(x.length, y.length);
          if (d <= (m >= 8 ? 2 : 1) && d / m <= 0.34) best = Math.max(best, 0.6);
        }
      }
      if (best) {
        ok++;
        s += best;
      }
    }
    if (ok < qt.length) return 0;
    return 40 + 30 * s / qt.length;
  }
  async function buscar(texto) {
    const q = norm(texto);
    if (q.length < 2) return [];
    const lista = await fichas(), qt = q.split(" ");
    let r = lista.map((it) => ({ it, s: score(q, qt, it) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.it);
    if (r.length < 6) {
      const ids = await tmdbBusca(texto);
      const seen = new Set(r.map((x) => x.id));
      for (const x of ids) {
        const f = lista.find((y) => y.tmdb === x.tmdb && y.serie === x.tv);
        if (f && !seen.has(f.id)) {
          seen.add(f.id);
          r.push(f);
        }
      }
    }
    return r.slice(0, 120);
  }

  // src/upd.js
  var VER = "2.0.1";
  var D = () => window.__DREKZ || null;
  var nova = null;
  var mostrando = false;
  var snooze = () => {
    try {
      return +localStorage.getItem("drekz2_snooze") || 0;
    } catch (e) {
      return 0;
    }
  };
  async function verificar(manual) {
    const d = D();
    if (!d) {
      manual && toast("Atualiza\xE7\xE3o autom\xE1tica s\xF3 no app instalado.");
      return;
    }
    try {
      const j = JSON.parse(await get(d.base + "v2/versao.json?t=" + Date.now(), { cache: "no-store", timeout: 1e4 }));
      if (j.build > d.build) {
        nova = j;
        if (manual || Date.now() > snooze() && !assistindo() && !mostrando) pergunta();
        else if (manual) toast("Nova vers\xE3o " + j.versao + " dispon\xEDvel");
      } else {
        nova = null;
        manual && toast("Voc\xEA j\xE1 est\xE1 na vers\xE3o mais recente (" + VER + ")");
      }
    } catch (e) {
      manual && toast("Sem conex\xE3o com o servidor de atualiza\xE7\xF5es");
    }
  }
  function pergunta() {
    if (!nova || mostrando) return;
    mostrando = true;
    modal(
      "Nova vers\xE3o " + (nova.versao || ""),
      [
        { t: "Atualizar agora", s: nova.notas || "Melhorias e corre\xE7\xF5es", fn: aplicar },
        { t: "Depois", s: "Pergunto de novo em 30 minutos", fn: () => {
          try {
            localStorage.setItem("drekz2_snooze", String(Date.now() + 18e5));
          } catch (e) {
          }
        } }
      ],
      { onClose: () => {
        mostrando = false;
      } }
    );
  }
  async function aplicar() {
    const j = nova, d = D();
    if (!j || !d) return;
    toast("Baixando atualiza\xE7\xE3o...", 2e4);
    try {
      const r = await fetch(d.base + "v2/" + (j.arquivo || "drekz2.js") + "?b=" + j.build, { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const js = await r.text();
      if (j.tamanho && js.length !== j.tamanho) throw new Error("download incompleto");
      await gravaCore({ build: j.build, versao: j.versao, js });
      try {
        localStorage.removeItem("drekz_boot");
        localStorage.removeItem("drekz2_snooze");
      } catch (e) {
      }
      toast("Atualizado! Reiniciando...", 3e3);
      setTimeout(() => location.reload(), 900);
    } catch (e) {
      toast("Falha ao atualizar: " + (e && e.message || e));
    }
  }
  function idb(fn) {
    return new Promise((ok, no) => {
      const q = indexedDB.open("drekz-core", 1);
      q.onupgradeneeded = () => q.result.createObjectStore("core");
      q.onerror = () => no(q.error);
      q.onsuccess = () => {
        const t = q.result.transaction("core", "readwrite");
        fn(t.objectStore("core"));
        t.oncomplete = () => ok();
        t.onerror = () => no(t.error);
      };
    });
  }
  var gravaCore = (o) => idb((s) => s.put(o, "cur"));
  async function voltarAntigo() {
    try {
      await idb((s) => s.delete("cur"));
      localStorage.setItem("drekz_v2_no", "1");
      localStorage.removeItem("drekz_boot");
    } catch (e) {
    }
    location.reload();
  }
  function iniciarUpd() {
    if (!D()) return;
    setTimeout(() => verificar(false), 8e3);
    setInterval(() => verificar(false), 18e5);
  }

  // src/screens.js
  var VERSAO = "Pre-Alpha " + VER;
  var main = () => $("#main");
  var hist = [];
  var cur = null;
  function go(nome, arg, { push = true } = {}) {
    if (push && cur) hist.push(cur);
    cur = { nome, arg };
    document.querySelectorAll(".nb").forEach((b) => b.classList.toggle("sel", b.dataset.n === (nome === "detalhe" ? arg && arg.serie ? "series" : "filmes" : nome)));
    const m = main();
    m.scrollTop = 0;
    m.innerHTML = "";
    (TELAS[nome] || TELAS.inicio)(m, arg);
  }
  function voltar() {
    const p = hist.pop();
    if (!p) return false;
    go(p.nome, p.arg, { push: false });
    return true;
  }
  var reabrir = () => cur && go(cur.nome, cur.arg, { push: false });
  var aguarda = (m) => m.append(h("div", { class: "vazio" }, "Carregando..."));
  function rail(titulo, itens, fn, pctFn) {
    return h("div", null, h("h2", null, titulo), h("div", { class: "rail" }, itens.map((it) => card(it, () => fn(it), pctFn && pctFn(it)))));
  }
  var abre = (it) => go("detalhe", it);
  var TELAS = {
    async inicio(m) {
      m.append(h("h1", null, "Drekz TV"));
      const rec = progress.recentes();
      if (rec.length) m.append(rail(
        "Continuar assistindo",
        rec.map((r) => ({ id: r.id, title: r.title + (r.serie && r.s ? " \xB7 T" + r.s + "E" + r.e : ""), poster: r.poster, serie: r.serie, letra: r.letra, tmdb: r.tmdb })),
        (it) => abre(__spreadProps(__spreadValues({}, it), { title: it.title.replace(/ · T\d+E\d+$/, "") })),
        (it) => {
          const p = progress.get(it.id);
          return p && p.d ? p.t / p.d : null;
        }
      ));
      const fv = favs.all();
      const cs = await canais();
      if (fv.length) {
        const l = cs.filter((c) => fv.includes(c.id));
        if (l.length) m.append(h("div", null, h("h2", null, "Canais favoritos"), h("div", { class: "rail" }, l.map((c) => chTile(c, l)))));
      }
      const ds = await destaques();
      ds.forEach((r) => m.append(rail(r.titulo, r.itens, abre)));
      if (!ds.length && !rec.length) m.append(h("div", { class: "vazio" }, "N\xE3o consegui carregar os destaques. Confira a internet e abra Ajustes."));
      focusFirst(m);
    },
    async tv(m, arg) {
      m.append(h("h1", null, "TV ao vivo"));
      aguarda(m);
      const cs = await canais();
      m.innerHTML = "";
      m.append(h("h1", null, "TV ao vivo"));
      if (!cs.length) return m.append(h("div", { class: "vazio" }, "Nenhum canal carregado. Confira a internet."));
      const cats = ["Todos", ...favs.all().length ? ["\u2605 Favoritos"] : [], ...categorias(cs)];
      const cat = arg && arg.cat || "Todos";
      const chips = h("div", { class: "chips" }, cats.map((c) => h("div", { class: "chip f" + (c === cat ? " sel" : ""), onclick: () => go("tv", { cat: c }, { push: false }) }, c)));
      const lista = cat === "Todos" ? cs : cat === "\u2605 Favoritos" ? cs.filter((c) => favs.has(c.id)) : cs.filter((c) => c.cat === cat);
      m.append(chips, h("div", { class: "chs" }, lista.map((c) => chTile(c, lista))));
      const ult = prefs.get().ultimoCanal, first = [...m.querySelectorAll(".ch")][lista.findIndex((c) => c.id === ult)];
      focus(first || m.querySelector(".chip.sel"));
    },
    async filmes(m, arg) {
      return catalogo(m, arg, false);
    },
    async series(m, arg) {
      return catalogo(m, arg, true);
    },
    async detalhe(m, it) {
      const meta = await detalhes(it);
      const pr = progress.get(it.id);
      const bg = h("div", { class: "bg", style: it.fundo ? "background-image:url('" + it.fundo + "')" : "" });
      const tx = h(
        "div",
        { class: "tx" },
        h("h1", null, it.title),
        h("div", { class: "meta" }, [it.ano, it.serie ? "S\xE9rie" : "Filme", it.genres && it.genres.join(" \xB7 "), it.nota ? "\u2605 " + it.nota.toFixed(1) : ""].filter(Boolean).join("  \xB7  ")),
        h("p", null, it.sinopse || "")
      );
      const btns = h("div", { style: "margin-bottom:28px" });
      tx.append(btns);
      m.append(h("div", { class: "det" }, bg, h("div", { class: "in" }, h("div", { class: "po", style: it.poster ? "background-image:url('" + it.poster + "')" : "" }), tx)));
      if (!it.serie) {
        btns.append(h(
          "div",
          { class: "btn pri f", "data-first": 1, onclick: async () => {
            try {
              const s = await fontesFilme(it);
              if (!s.length) return toast("Esse filme ainda n\xE3o tem fonte.");
              abrirVod(it, { srcs: s, titulo: it.title, start: pr && !pr.done ? pr.t : 0 });
            } catch (e) {
              toast("N\xE3o consegui carregar as fontes: " + e.message);
            }
          } },
          pr && pr.t > 30 && !pr.done ? "\u25B6 Continuar" : "\u25B6 Assistir"
        ));
      } else {
        tx.append(h("div", { class: "vazio", id: "epl" }, "Carregando epis\xF3dios..."));
        temporadas(it).then((ss) => {
          const box = $("#epl");
          if (!box) return;
          box.className = "";
          box.innerHTML = "";
          if (!ss.length) return box.append(h("div", { class: "vazio" }, "Sem epis\xF3dios dispon\xEDveis."));
          let sel = pr && pr.s && ss.find((x) => x.n === pr.s) ? pr.s : ss[0].n;
          const play = (se, ep) => {
            const p = progress.get(it.id), ini = p && p.s === se.n && p.e === ep.n ? p.t : 0;
            if (!ep.sources.length) return toast("Epis\xF3dio sem fonte.");
            abrirVod(it, { srcs: ep.sources, titulo: it.title + " \xB7 T" + se.n + " E" + ep.n, start: ini, s: se.n, e: ep.n, seasons: ss });
          };
          const pinta = () => {
            box.innerHTML = "";
            const cont = pr && pr.s ? ss.find((x) => x.n === pr.s) : null, epc = cont && cont.eps.find((x) => x.n === pr.e);
            btns.innerHTML = "";
            btns.append(h("div", { class: "btn pri f", "data-first": 1, onclick: () => epc ? play(cont, epc) : play(ss[0], ss[0].eps[0]) }, epc ? "\u25B6 Continuar T" + pr.s + " E" + pr.e : "\u25B6 Assistir"));
            box.append(h("div", { class: "chips" }, ss.map((s) => h("div", { class: "chip f" + (s.n === sel ? " sel" : ""), onclick: () => {
              sel = s.n;
              pinta();
              focus(box.querySelector(".chip.sel"));
            } }, "Temporada " + s.n))));
            const se = ss.find((s) => s.n === sel), pp = progress.get(it.id);
            box.append(h("div", { class: "eps" }, se.eps.map((ep) => h(
              "div",
              { class: "ep f" + (pp && pp.s === se.n && pp.e > ep.n ? " vis" : ""), onclick: () => play(se, ep) },
              "Ep. " + ep.n,
              pp && pp.s === se.n && pp.e === ep.n && pp.d ? h("i", { class: "bar", style: "width:" + Math.round(pp.t / pp.d * 100) + "%" }) : null
            ))));
          };
          pinta();
          if (!document.querySelector(".f.on") || !main().contains(document.querySelector(".f.on"))) focusFirst(m);
        }).catch((e) => {
          const box = $("#epl");
          box && (box.textContent = "N\xE3o consegui carregar os epis\xF3dios: " + e.message);
        });
      }
      btns.append(h("div", { class: "btn f", onclick: (e) => {
        const on = favs.toggle(it.id);
        e.currentTarget.textContent = on ? "\u2605 Na minha lista" : "\u2606 Minha lista";
      } }, favs.has(it.id) ? "\u2605 Na minha lista" : "\u2606 Minha lista"));
      focusFirst(m);
    },
    busca(m, arg) {
      const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
      const inp = h("input", { class: "f", placeholder: "Digite o nome (sem acento tudo bem)", autocomplete: "off", "data-first": 1 });
      const res = h("div", { class: "grid" });
      let tm = 0;
      const atual = () => inp.value;
      const rodar = () => {
        clearTimeout(tm);
        tm = setTimeout(async () => {
          const q = atual();
          if (q.trim().length < 2) {
            res.innerHTML = "";
            return;
          }
          res.innerHTML = "";
          res.append(h("div", { class: "vazio" }, "Buscando..."));
          const r = await buscar(q);
          if (atual() !== q) return;
          res.innerHTML = "";
          if (!r.length) res.append(h("div", { class: "vazio" }, 'Nada encontrado para "' + q + '".'));
          r.forEach((it) => res.append(card(it, () => abre(it))));
        }, 250);
      };
      inp.addEventListener("input", rodar);
      const k = (t) => h("div", { class: "k f", onclick: () => {
        t === "\u232B" ? inp.value = inp.value.slice(0, -1) : t === "\u2423" ? inp.value += " " : inp.value += t.toLowerCase();
        rodar();
      } }, t);
      m.append(h("h1", null, "Busca"), h("div", { class: "sb" }, h("div", null, h("div", { class: "kb" }, [...letras, "\u2423", "\u232B"].map(k))), h("div", { style: "flex:1;min-width:0" }, inp, res)));
      focus(m.querySelector(".k"));
    },
    ajustes(m) {
      const p = () => prefs.get(), L = { normal: "Normal (~4 s)", grande: "Grande (~8 s)", maximo: "M\xE1ximo (~15 s)" };
      const lin = (t, s, val, fn) => {
        const r = h("div", { class: "row f", onclick: () => {
          fn();
          reabrirAj();
        } }, h("div", null, t, s && h("small", null, s)), h("b", null, val));
        return r;
      };
      const reabrirAj = () => {
        const i = [...m.querySelectorAll(".f")].indexOf(document.querySelector(".f.on"));
        m.innerHTML = "";
        TELAS.ajustes(m);
        const l = [...m.querySelectorAll(".f")];
        focus(l[Math.max(0, i)]);
      };
      m.append(
        h("h1", null, "Ajustes"),
        lin("Buffer ao vivo", "Maior = menos travadas, mas demora mais para abrir o canal", L[p().buffer], () => {
          const o = ["normal", "grande", "maximo"];
          prefs.set({ buffer: o[(o.indexOf(p().buffer) + 1) % 3] });
        }),
        lin("Pr\xF3ximo epis\xF3dio autom\xE1tico", "Passa sozinho para o pr\xF3ximo ao terminar", p().proximoAuto ? "Ligado" : "Desligado", () => prefs.set({ proximoAuto: !p().proximoAuto })),
        window.__ponte ? lin("Sempre usar a ponte do celular", "Carrega tudo pelo celular (ajuda em canais que a TV n\xE3o abre)", p().ponteSempre ? "Ligado" : "Desligado", () => prefs.set({ ponteSempre: !p().ponteSempre })) : null,
        lin('Limpar "Continuar assistindo"', null, "", () => {
          localStorage.removeItem("drekz2_prog");
          toast("Lista limpa");
        }),
        lin("Recarregar cat\xE1logos", "Baixa canais e filmes de novo", "", () => {
          recarregar && recarregar();
          toast("Recarregando...", 1500);
        }),
        lin("Verificar atualiza\xE7\xE3o", "Procura uma vers\xE3o nova do Drekz TV 2", "", () => verificar(true)),
        window.__DREKZ ? lin("Voltar ao Drekz TV anterior (0.7.x)", "Desinstala o n\xFAcleo novo e volta ao app antigo embutido", "", () => voltarAntigo()) : null,
        h("div", { class: "vazio" }, "Drekz TV " + VERSAO)
      );
      focus(m.querySelector(".f"));
    }
  };
  function chTile(c, lista) {
    return h(
      "div",
      { class: "ch f", onclick: () => abrirLive(lista, lista.indexOf(c)) },
      c.logo ? h("img", { src: c.logo, loading: "lazy", onerror: (e) => e.target.style.display = "none" }) : null,
      h("div", { class: "n" }, c.name, h("small", null, c.num + " \xB7 " + c.cat))
    );
  }
  var CAP = 60;
  async function catalogo(m, arg, serie) {
    m.append(h("h1", null, serie ? "S\xE9ries" : "Filmes"));
    aguarda(m);
    const todos = (await fichas()).filter((f) => f.serie === serie);
    m.innerHTML = "";
    m.append(h("h1", null, serie ? "S\xE9ries" : "Filmes"));
    if (!todos.length) return m.append(h("div", { class: "vazio" }, "Cat\xE1logo n\xE3o carregou. Confira a internet."));
    const gn = arg && arg.gen || "Todos", lt = arg && arg.letra || "";
    const gens = {};
    todos.forEach((f) => f.genres.forEach((g) => gens[g] = (gens[g] || 0) + 1));
    const topg = Object.keys(gens).sort((a, b) => gens[b] - gens[a]).slice(0, 14);
    const re = (a) => go(serie ? "series" : "filmes", __spreadValues({ gen: gn, letra: lt }, a), { push: false });
    m.append(
      h("div", { class: "chips" }, ["Todos", ...topg].map((g) => h("div", { class: "chip f" + (g === gn ? " sel" : ""), onclick: () => re({ gen: g }) }, g))),
      h("div", { class: "chips" }, ["", ..."#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")].map((l2) => h("div", { class: "chip f" + (l2 === lt ? " sel" : ""), onclick: () => re({ letra: l2 }) }, l2 || "A\u2013Z")))
    );
    let l = todos;
    if (gn !== "Todos") l = l.filter((f) => f.genres.includes(gn));
    if (lt) l = l.filter((f) => f.letra === lt);
    l = l.slice().sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
    const grid = h("div", { class: "grid" });
    m.append(grid);
    let n = 0;
    const mais = () => {
      l.slice(n, n + CAP).forEach((it) => grid.append(card(it, () => abre(it))));
      n += CAP;
    };
    mais();
    if (!l.length) grid.append(h("div", { class: "vazio" }, "Nada nessa sele\xE7\xE3o."));
    m.addEventListener("scroll", () => {
      if (n < l.length && m.scrollTop + m.clientHeight > m.scrollHeight - 600) mais();
    });
    grid.addEventListener("focusin", () => {
    });
    new MutationObserver(() => {
      const on = document.querySelector(".card.f.on");
      if (on && n < l.length && [...grid.children].indexOf(on) > n - 12) mais();
    }).observe(grid, { subtree: true, attributes: true, attributeFilter: ["class"] });
    focus(m.querySelector(".chip.sel"));
  }

  // src/style.css
  var style_default = ':root{--bg:#0b0d12;--bg2:#141821;--card:#1b2030;--tx:#eef1f6;--mu:#9aa3b5;--ac:#7c5cff;--ac2:#2ee6a6;--rd:#ff5d6c}\n*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}\nhtml,body{width:100%;height:100%;overflow:hidden;background:#000;color:var(--tx);font-family:"Segoe UI",Roboto,Arial,sans-serif}\n#app{position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0;overflow:hidden;background:var(--bg)}\nhtml.exo #app,html.exo body{background:transparent}\n#vl{position:absolute;inset:0;background:#000;display:none}#vl video{width:100%;height:100%;object-fit:contain;background:#000}\nhtml.assistindo #vl{display:block}html.assistindo #ui{display:none}html.exo.assistindo #vl{background:transparent}html.exo.assistindo #vl video{visibility:hidden}\n#ui{position:absolute;inset:0;display:flex}\n#rail{width:110px;background:var(--bg2);display:flex;flex-direction:column;align-items:center;padding:36px 0;gap:10px;flex:none}\n#rail .logo{font-weight:800;font-size:22px;color:var(--ac);margin-bottom:24px;letter-spacing:1px}\n.nb{width:86px;height:86px;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--mu);font-size:15px;cursor:pointer;border:3px solid transparent}\n.nb svg{width:34px;height:34px;fill:currentColor}.nb.sel{color:var(--tx);background:#222a3e}\n#main{flex:1;min-width:0;height:100%;overflow-y:auto;overflow-x:hidden;padding:40px 56px 80px;scrollbar-width:none}\n#main::-webkit-scrollbar{display:none}\nh1{font-size:44px;font-weight:700;margin-bottom:26px}h2{font-size:30px;font-weight:600;margin:30px 0 16px}\n.f{outline:none;border:3px solid transparent;transition:transform .12s,border-color .12s,background .12s}\n.f.on{border-color:var(--ac2);transform:scale(1.05)}\n.rail{display:flex;gap:22px;overflow-x:auto;padding:10px 8px 14px;margin:0 -8px;scrollbar-width:none}.rail::-webkit-scrollbar{display:none}\n.card{flex:none;width:210px;cursor:pointer;border-radius:14px;background:var(--card);overflow:hidden}\n.card .pi{width:100%;height:315px;background:#222 center/cover no-repeat}\n.card .ti{font-size:17px;padding:10px 10px 12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.card .bar{height:6px;background:#333}.card .bar i{display:block;height:100%;background:var(--ac2)}\n.grid{display:grid;grid-template-columns:repeat(auto-fill,210px);gap:26px 22px;padding:8px}\n.chips{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:18px}\n.chip{padding:10px 22px;border-radius:30px;background:var(--card);font-size:19px;cursor:pointer;color:var(--mu)}\n.chip.sel{background:var(--ac);color:#fff}\n.chs{display:grid;grid-template-columns:repeat(auto-fill,300px);gap:20px;padding:8px}\n.ch{height:112px;background:var(--card);border-radius:16px;display:flex;align-items:center;gap:16px;padding:0 18px;cursor:pointer;overflow:hidden}\n.ch img{width:76px;height:76px;object-fit:contain;flex:none}.ch .n{font-size:20px;line-height:1.2}.ch small{color:var(--mu);font-size:15px;display:block;margin-top:4px}\n.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 34px;border-radius:14px;background:var(--card);font-size:22px;cursor:pointer;margin-right:14px;min-width:70px}\n.btn.pri{background:var(--ac);color:#fff}\n.det{position:relative;min-height:880px}.det .bg{position:absolute;inset:-40px -56px;background:center/cover;opacity:.25}\n.det .in{position:relative;display:flex;gap:44px}.det .po{width:340px;height:510px;border-radius:16px;background:#222 center/cover;flex:none}\n.det .tx{flex:1;min-width:0}.det h1{margin-bottom:10px}.det .meta{color:var(--mu);font-size:22px;margin-bottom:18px}.det p{font-size:22px;line-height:1.45;max-width:1000px;margin-bottom:26px;color:#d6dbe8}\n.eps{display:grid;grid-template-columns:repeat(auto-fill,150px);gap:14px;margin-top:10px}.ep{padding:16px 0;text-align:center;background:var(--card);border-radius:12px;font-size:21px;cursor:pointer;position:relative;overflow:hidden}\n.ep.vis{color:var(--ac2)}.ep .bar{position:absolute;left:0;bottom:0;height:5px;background:var(--ac2)}\n.kb{display:grid;grid-template-columns:repeat(7,62px);gap:8px;margin-right:36px}.kb .k{height:62px;background:var(--card);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer}\n.sb{display:flex;gap:30px;align-items:flex-start}.sb input{width:100%;font-size:30px;padding:14px 20px;border-radius:14px;border:3px solid transparent;background:var(--card);color:var(--tx);margin-bottom:20px}\n.row{display:flex;justify-content:space-between;align-items:center;padding:22px 26px;margin-bottom:12px;background:var(--card);border-radius:14px;font-size:24px;cursor:pointer;max-width:900px}.row small{color:var(--mu);font-size:18px;display:block;margin-top:4px}.row b{color:var(--ac2)}\n#pl{position:absolute;inset:0;display:none;z-index:20}html.assistindo #pl{display:block}\n#pl .top{position:absolute;left:0;right:0;top:0;padding:34px 50px 90px;background:linear-gradient(#000c,#0000);font-size:34px;font-weight:600;opacity:0;transition:opacity .2s}\n#pl .bot{position:absolute;left:0;right:0;bottom:0;padding:90px 60px 40px;background:linear-gradient(#0000,#000d);opacity:0;transition:opacity .2s}\n#pl.osd .top,#pl.osd .bot{opacity:1}\n#pl .pb{height:8px;background:#fff3;border-radius:4px;margin-bottom:10px}#pl .pb i{display:block;height:100%;background:var(--ac2);border-radius:4px;width:0}\n#pl .tm{display:flex;justify-content:space-between;font-size:22px;color:#ccd;margin-bottom:18px}\n#pl .ctl{display:flex;gap:12px;flex-wrap:wrap}#pl .ctl .btn{background:#ffffff22;padding:14px 26px;font-size:22px}\n#pl .sp{position:absolute;left:50%;top:50%;width:70px;height:70px;margin:-35px;border:6px solid #fff4;border-top-color:#fff;border-radius:50%;animation:sp 1s linear infinite;display:none}\n#pl.buf .sp{display:block}@keyframes sp{to{transform:rotate(360deg)}}\n#gv{position:absolute;left:0;top:0;bottom:0;width:560px;background:#0b0d12ee;padding:26px;overflow-y:auto;display:none;scrollbar-width:none}#gv.on2{display:block}\n#gv .ch{width:100%;margin-bottom:12px;height:90px}#gv .ch img{width:56px;height:56px}\n#toast{position:absolute;left:50%;bottom:90px;transform:translateX(-50%);background:#000c;border:2px solid #fff3;padding:16px 34px;border-radius:30px;font-size:24px;z-index:99;display:none}\n#modal{position:absolute;inset:0;background:#000b;z-index:50;display:none;align-items:center;justify-content:center}\n#modal .box{background:var(--bg2);border-radius:22px;padding:34px 40px;min-width:620px;max-width:1100px;max-height:900px;overflow-y:auto}\n#modal h3{font-size:32px;margin-bottom:20px}#modal .row{max-width:none}\n.vazio{color:var(--mu);font-size:24px;padding:30px 8px}\n';

  // src/main.js
  function escala() {
    const app = $("#app"), w = innerWidth, hh = innerHeight, fill = /[?&]fill=1/.test(location.search);
    const s = Math.min(w / 1920, hh / 1080), W = fill ? w / s : 1920, H = fill ? hh / s : 1080;
    app.style.width = W + "px";
    app.style.height = H + "px";
    const x = fill ? 0 : (w - 1920 * s) / 2, y = fill ? 0 : (hh - 1080 * s) / 2;
    app.style.transform = "translate(" + x + "px," + y + "px) scale(" + s + ")";
  }
  var MENU = [["inicio", "In\xEDcio", "home"], ["tv", "TV", "tv"], ["filmes", "Filmes", "movie"], ["series", "S\xE9ries", "serie"], ["busca", "Busca", "search"], ["ajustes", "Ajustes", "cfg"]];
  var MARKUP = '<div id="app"><div id="vl"><video id="v" playsinline></video></div><div id="ui"><nav id="rail"></nav><main id="main"></main></div><div id="pl"></div><div id="toast"></div><div id="modal"></div></div>';
  function dom() {
    if (!document.getElementById("d2css")) {
      const st = document.createElement("style");
      st.id = "d2css";
      st.textContent = style_default;
      document.head.appendChild(st);
    }
    if (!document.getElementById("ui")) {
      const old = document.getElementById("app");
      old && old.remove();
      document.body.insertAdjacentHTML("beforeend", MARKUP);
    }
  }
  function boot() {
    dom();
    escala();
    addEventListener("resize", escala);
    const rail2 = $("#rail");
    rail2.append(h("div", { class: "logo" }, "DREKZ"));
    MENU.forEach(([n, t, i]) => rail2.append(h(
      "div",
      { class: "nb f", "data-n": n, onclick: () => go(n, null, { push: false }) },
      h("span", { html: '<svg viewBox="0 0 24 24"><path d="' + SVG[i] + '"/></svg>', style: "display:flex" }),
      t
    )));
    initWatch();
    initKeys((e) => assistindo() ? playerKey(e) : false);
    onBack(() => {
      if (!voltar()) {
      }
    });
    addEventListener("drekz-voltou", () => {
      reabrir();
    });
    go("inicio", null, { push: false });
    window.__drekz = { go, pl: initWatch.pl };
    try {
      localStorage.setItem("drekz_boot", JSON.stringify({ build: window.__DREKZ && window.__DREKZ.build || 1, tries: 0 }));
    } catch (e) {
    }
    iniciarUpd();
  }
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", boot) : boot();
})();
