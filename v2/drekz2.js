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
  async function get(url3, { timeout = 15e3, text = true, cache: cache2 } = {}) {
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const t = setTimeout(() => ctl && ctl.abort(), timeout);
    try {
      const r = await fetch(url3, { signal: ctl && ctl.signal, cache: cache2 });
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
    BACK: [10009, 27, 8, 4, 461],
    UP: [38],
    DOWN: [40],
    LEFT: [37],
    RIGHT: [39],
    CHUP: [427, 33, 166],
    CHDOWN: [428, 34, 167],
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
    el.dispatchEvent(new Event("drekzfoco"));
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

  // src/store.js
  var P = "drekz2_";
  var avisa = () => {
    try {
      dispatchEvent(new Event("drekz-prog"));
    } catch (e) {
    }
  };
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
  var nativo = () => window.DrekzExo && window.DrekzExo.setProg ? window.DrekzExo : null;
  var progress = {
    all() {
      return rd("prog", {});
    },
    mergeIn(o) {
      const a = rd("prog", {});
      let n = 0;
      for (const k in o || {}) {
        const x = o[k];
        if (x && typeof x === "object" && x.title && (!a[k] || (x.updatedAt || 0) > (a[k].updatedAt || 0))) {
          a[k] = x;
          n++;
        }
      }
      if (n) {
        wr("prog", a);
        espelha(a);
      }
      return n;
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
      espelha(a);
      avisa();
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
  function espelha(a) {
    const N = nativo();
    try {
      N && N.setProg(JSON.stringify(a));
    } catch (e) {
    }
  }
  function sincNativo() {
    const N = nativo();
    if (!N || !N.getProg) return;
    try {
      progress.mergeIn(JSON.parse(N.getProg() || "{}"));
    } catch (e) {
    }
  }
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
      const t = rd("favt", {});
      t[id] = { t: Date.now(), on: i < 0 ? 1 : 0 };
      wr("favt", t);
      avisa();
      return i < 0;
    },
    // para sincronizar: {id:{t:quando mudou,on:1|0}} (favoritos antigos, sem data, entram com t=1)
    mapa() {
      const a = rd("favs", []), o = __spreadValues({}, rd("favt", {}));
      a.forEach((id) => {
        if (!o[id]) o[id] = { t: 1, on: 1 };
      });
      return o;
    },
    mergeIn(m) {
      const t = rd("favt", {}), a = rd("favs", []);
      let n = 0;
      for (const id in m || {}) {
        const x = m[id];
        if (!x || typeof x.t !== "number") continue;
        const cur2 = t[id] || (a.includes(id) ? { t: 1, on: 1 } : null);
        if (!cur2 || x.t > cur2.t) {
          t[id] = { t: x.t, on: x.on ? 1 : 0 };
          n++;
        }
      }
      if (!n) return 0;
      wr("favt", t);
      const s = new Set(a);
      for (const id in t) t[id].on ? s.add(id) : s.delete(id);
      wr("favs", [...s]);
      return n;
    }
  };
  var fonteOk = { get(k) {
    return rd("fok", {})[k];
  }, set(k, u) {
    const a = rd("fok", {});
    if (a[k] === u) return;
    a[k] = u;
    const ks = Object.keys(a);
    if (ks.length > 400) delete a[ks[0]];
    wr("fok", a);
  } };
  var hostRep = {
    nota(h2) {
      const a = rd("hrep", {})[h2] || [0, 0];
      return (a[1] + 1) / (a[0] + a[1] + 2);
    },
    // 0 = ótima, 1 = péssima, 0.5 = sem dados
    marca(h2, ok) {
      if (!h2) return;
      const a = rd("hrep", {}), x = a[h2] || [0, 0];
      x[ok ? 0 : 1]++;
      if (x[0] + x[1] > 24) {
        x[0] = Math.floor(x[0] / 2);
        x[1] = Math.floor(x[1] / 2);
      }
      a[h2] = x;
      const ks = Object.keys(a);
      if (ks.length > 150) delete a[ks[0]];
      wr("hrep", a);
    }
  };
  var cache = { get: rd, set: wr };

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
  var tx = {};
  function txt(u) {
    const e = tx[u];
    if (e && Date.now() - e.t < 18e5) return e.p;
    const p = get(u, { timeout: 2e4 });
    tx[u] = { t: Date.now(), p };
    p.catch(() => {
      delete tx[u];
    });
    return p;
  }
  function parseCanais(txt2) {
    const out = [];
    let c = null, v = null, n = 1;
    for (let l of txt2.split(/\r?\n/)) {
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
    const ts = await Promise.all(["bases.txt", "indice.txt"].map((f) => txt(base("f") + f).catch(() => "")));
    for (const t of ts) for (const l of t.split(/\r?\n/)) {
      const m = /^\s*(?:base\s*:)?\s*(\d+)\s*[\s:=]\s*(https?:\/\/\S+)/i.exec(l);
      if (m && !b[+m[1]]) b[+m[1]] = m[2].trim();
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
    const [B, t] = await Promise.all([bases(), txt(base("f") + "filmes-" + letra(it) + ".txt")]);
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
    const L = letra(it), bp = bases();
    const idx = await txt(base("f") + "series-" + L + ".txt");
    let k = 0;
    for (const l of idx.split(/\r?\n/)) {
      const c = l.split("	");
      if (c.length >= 3 && c[0].trim() === it.title) {
        k = parseInt(c[2].trim(), 10) || 0;
        break;
      }
    }
    const [B, t] = await Promise.all([bp, txt(base("f") + "series-" + L + "-" + k + ".txt")]);
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
  var PROV = [
    { n: "Netflix", id: "8", c: "#e50914" },
    { n: "Prime Video", id: "119|9", c: "#00a8e1" },
    { n: "Disney+", id: "337", c: "#2b59ff" },
    { n: "Max", id: "1899|384", c: "#8b5cf6" },
    { n: "Paramount+", id: "531", c: "#1e7bff" },
    { n: "Apple TV+", id: "350|2", c: "#9aa0a6" },
    { n: "Globoplay", id: "307", c: "#ff5a1f" },
    { n: "Crunchyroll", id: "283", c: "#f47521" }
  ];
  async function porTipo(chave, serie) {
    const [ds, f] = await Promise.all([destaques(), fichas()]), by = new Map(f.map((x) => [x.id, x])), seen = /* @__PURE__ */ new Set(), out = [];
    ds.filter((r) => norm(r.titulo).includes(chave)).forEach((r) => r.itens.forEach((it) => {
      if (it.serie !== serie || seen.has(it.id)) return;
      seen.add(it.id);
      out.push(by.get(it.id) || it);
    }));
    f.forEach((x) => {
      if (x.serie === serie && !seen.has(x.id) && x.genres.some((g) => norm(g).includes(chave))) {
        seen.add(x.id);
        out.push(x);
      }
    });
    return out;
  }
  async function porProvedor(p, serie) {
    const K2 = "prov_" + p.id + (serie ? "t" : "m"), c = cache.get(K2, null);
    let ids;
    if (c && Date.now() - c.t < 432e5) ids = c.ids;
    else {
      const ty = serie ? "tv" : "movie", get1 = async (pg) => {
        try {
          const j = await get("".concat(TMDB, "/discover/").concat(ty, "?api_key=").concat(KEY2, "&language=pt-BR&watch_region=BR&with_watch_providers=").concat(encodeURIComponent(p.id), "&with_watch_monetization_types=flatrate&sort_by=popularity.desc&page=").concat(pg), { text: false, timeout: 1e4 });
          return (j.results || []).map((x) => x.id);
        } catch (e) {
          return [];
        }
      };
      ids = (await Promise.all([1, 2, 3, 4, 5, 6].map(get1))).flat();
      if (ids.length) cache.set(K2, { t: Date.now(), ids });
    }
    const pos = new Map(ids.map((id, i) => [id, i])), f = await fichas();
    return f.filter((x) => x.serie === serie && x.tmdb && pos.has(x.tmdb)).sort((a, b) => pos.get(a.tmdb) - pos.get(b.tmdb));
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
  var aquece = 0;
  var card = (it, fn, pct) => {
    const c = h(
      "div",
      { class: "card f", onclick: fn },
      h("div", { class: "pi", style: it.poster ? "background-image:url('" + it.poster + "')" : "" }),
      pct != null ? h("div", { class: "bar" }, h("i", { style: "width:" + Math.round(pct * 100) + "%" })) : null,
      h("div", { class: "ti" }, it.title)
    );
    c.addEventListener("drekzfoco", () => {
      clearTimeout(aquece);
      aquece = setTimeout(() => {
        if (!c.classList.contains("on") || !it.title) return;
        try {
          (it.serie ? temporadas(it) : fontesFilme(it)).catch(() => {
          });
        } catch (e) {
        }
      }, 500);
    });
    return c;
  };
  var SVG = {
    home: "M10,20v-6h4v6h5v-8h3L12,3 2,12h3v8z",
    tv: "M21,6h-7.59l3.29-3.29L16,2l-4,4-4-4-.71.71L10.59,6H3c-1.1,0-2,.89-2,2v12c0,1.1.9,2 2,2h18c1.1,0 2-.9 2-2V8c0-1.11-.9-2-2-2zM21,20H3V8h18v12zM9,10v8l7-4z",
    movie: "M18,4l2,4h-3l-2-4h-2l2,4h-3l-2-4H8l2,4H7L5,4H4c-1.1,0-1.99.9-1.99,2L2,18c0,1.1.9,2 2,2h16c1.1,0 2-.9 2-2V4h-4z",
    serie: "M21,3H3c-1.1,0-2,.9-2,2v12c0,1.1.9,2 2,2h5v2h8v-2h5c1.1,0 1.99-.9 1.99-2L23,5c0-1.1-.9-2-2-2zm0,14H3V5h18v12z",
    search: "M15.5,14h-.79l-.28-.27C15.41,12.59 16,11.11 16,9.5 16,5.91 13.09,3 9.5,3S3,5.91 3,9.5 5.91,16 9.5,16c1.61,0 3.09-.59 4.23-1.57l.27.28v.79l5,4.99L20.49,19l-4.99-5zM9.5,14C7.01,14 5,11.99 5,9.5S7.01,5 9.5,5 14,7.01 14,9.5 11.99,14 9.5,14z",
    cfg: "M19.14,12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24,0-.43.17-.47.41l-.36,2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47,0-.59.22L2.74,8.87c-.12.21-.08.47.12.61l2.03,1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03,1.58c-.18.14-.23.41-.12.61l1.92,3.32c.12.22.37.29.59.22l2.39-.96c.5.38,1.03.7,1.62.94l.36,2.54c.05.24.24.41.48.41h3.84c.24,0,.44-.17.47-.41l.36-2.54c.59-.24,1.13-.56,1.62-.94l2.39.96c.22.08.47,0,.59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6 3.6,1.62 3.6,3.6-1.62,3.6-3.6,3.6z"
  };

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
      let url3 = s.url;
      document.documentElement.classList.add("nat");
      if (/\.txt(\?|$)/i.test(url3) && !/\|COMPONENT=/.test(url3)) url3 += "|COMPONENT=HLS";
      try {
        ap.open(url3);
        ap.setDisplayRect(...this.r);
        ap.setDisplayMethod("PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO");
        const b = s.live ? BUF[prefs.get().buffer] || BUF.normal : [3, 8];
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
          const t0 = Date.now(), lim = s.live ? s.manual ? 3e4 : 12e3 : s.manual ? 6e4 : 25e3, iv = setInterval(() => {
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
              try {
                if (!s.audio) {
                  const ti = ap.getTotalTrackInfo() || [];
                  if (ti.length && !ti.some((x) => x.type === "VIDEO")) {
                    this.ok = false;
                    return rej(new Error("Sem faixa de v\xEDdeo (" + host(s.url) + ")"));
                  }
                }
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
    stop(go2) {
      this.tk++;
      this.ok = false;
      document.documentElement.classList.remove("nat");
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
        }, tm = setTimeout(() => done(rej, new Error("Tempo esgotado (" + host(s.url) + ")")), s.live ? s.manual ? 3e4 : 15e3 : s.manual ? 6e4 : 25e3);
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
        }, s.webT || (s.live ? s.manual ? 3e4 : 15e3 : s.manual ? 6e4 : 25e3));
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
      const msg2 = this.ev.msg || (() => {
      });
      if (sempre) try {
        await this.try1(this.ponteUrl(s));
        return;
      } catch (e) {
        if (e.message === CANCEL) throw e;
        msg2("Pela ponte falhou, tentando direto...");
      }
      try {
        await this.try1(s);
      } catch (e) {
        if (e.message === CANCEL) throw e;
        if (!usaPonte || sempre) throw e;
        msg2("Tentando pela ponte do celular...");
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
      await this.web.open(plat.avplay ? __spreadProps(__spreadValues({}, s), { webT: 6e3 }) : s);
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

  // src/upd.js
  var VER = "2.2.0";
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
    setTimeout(() => verificarApk(manual), 1500);
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
  var EXO = () => window.DrekzExo && window.DrekzExo.versaoCode && window.DrekzExo.baixarApk ? window.DrekzExo : null;
  var apkNovo = null;
  var apkEst = "idle";
  var apkMostrando = false;
  var snoozeApk = () => {
    try {
      return +localStorage.getItem("drekz2_snooze_apk") || 0;
    } catch (e) {
      return 0;
    }
  };
  async function verificarApk(manual) {
    const x = EXO(), d = D();
    if (!x || !d || apkEst === "baixando") return;
    try {
      const j = JSON.parse(await get(d.base + "apk/box.json?t=" + Date.now(), { cache: "no-store", timeout: 1e4 }));
      if (j.codigo > x.versaoCode()) {
        apkNovo = j;
        if (apkEst === "idle") apkEst = "novo";
        if (!mostrando && (manual || Date.now() > snoozeApk() && !assistindo())) perguntaApk();
      } else {
        apkNovo = null;
        apkEst = "idle";
      }
    } catch (e) {
    }
  }
  function perguntaApk() {
    if (!apkNovo || apkMostrando) return;
    apkMostrando = true;
    const pronto = apkEst === "pronto";
    modal(
      "Nova vers\xE3o do app " + (apkNovo.versao || ""),
      [
        { t: pronto ? "Instalar agora" : "Baixar e instalar", s: (apkNovo.notas || "Melhorias e corre\xE7\xF5es") + " \xB7 o Android vai pedir para confirmar", fn: () => {
          const x = EXO();
          if (!x) return;
          if (pronto) {
            x.instalarApk();
            return;
          }
          apkEst = "baixando";
          toast("Baixando atualiza\xE7\xE3o...", 3e4);
          x.baixarApk(new URL(apkNovo.arquivo, D().base).href);
        } },
        { t: "Depois", s: "Pergunto de novo em 30 minutos", fn: () => {
          try {
            localStorage.setItem("drekz2_snooze_apk", String(Date.now() + 18e5));
          } catch (e) {
          }
        } }
      ],
      { onClose: () => {
        apkMostrando = false;
      } }
    );
  }
  window.__apkEv = function(ev, d) {
    if (ev === "prog") toast("Baixando atualiza\xE7\xE3o... " + d + "%", 4e3);
    else if (ev === "ok") {
      apkEst = "pronto";
      toast("Baixada. Confirme a instala\xE7\xE3o no Android.", 6e3);
    } else if (ev === "perm") {
      apkEst = "pronto";
      toast('Ative "Permitir desta fonte", volte ao app e escolha Instalar agora.', 9e3);
    } else if (ev === "erro") {
      apkEst = apkNovo ? "novo" : "idle";
      toast("Falha ao baixar: " + d, 6e3);
    }
  };

  // src/track.js
  var K = "drekz2_trk";
  var rd2 = (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  };
  var wr2 = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
    }
  };
  var trk = {
    ligado() {
      return rd2(K + "_on", null);
    },
    // null = ainda não perguntou
    set(v) {
      wr2(K + "_on", !!v);
      if (!v) wr2(K + "_q", []);
    },
    id() {
      let i = rd2(K + "_id", null);
      if (!i) {
        i = Array.from({ length: 10 }, () => "abcdefghjkmnpqrstuvwxyz23456789"[Math.random() * 31 | 0]).join("");
        wr2(K + "_id", i);
      }
      return i;
    }
  };
  var fila = rd2(K + "_q", []);
  var url2 = null;
  var urlT = 0;
  var envT = 0;
  var sessao = Date.now().toString(36);
  var cut = (s, n) => String(s == null ? "" : s).slice(0, n);
  function track(tipo, d) {
    if (trk.ligado() !== true) return;
    const e = { t: Date.now(), k: tipo };
    if (d) for (const k in d) e[k] = typeof d[k] === "number" || typeof d[k] === "boolean" ? d[k] : cut(d[k], 200);
    fila.push(e);
    if (fila.length > 300) fila = fila.slice(-200);
    wr2(K + "_q", fila);
    if (fila.length >= 15 || tipo === "js_erro") envia();
  }
  var host2 = (u) => {
    try {
      return String(u).split("/")[2] || "?";
    } catch (e) {
      return "?";
    }
  };
  function aparelho() {
    const d = window.__DREKZ || {}, ua = navigator.userAgent || "";
    const tz = /Tizen[ \/]([\d.]+)/.exec(ua), ch = /Chrom(?:e|ium)\/(\d+)/.exec(ua);
    return {
      app: "drekz2",
      ver: VER,
      build: d.build || 0,
      plat: window.webapis && window.webapis.avplay ? "tizen" : window.DrekzExo ? "android" : "web",
      tizen: tz ? tz[1] : "",
      chrome: ch ? ch[1] : "",
      tela: screen.width + "x" + screen.height,
      modelo: (() => {
        try {
          return window.webapis.productinfo.getRealModel();
        } catch (e) {
          return "";
        }
      })(),
      fw: (() => {
        try {
          return window.webapis.productinfo.getFirmware();
        } catch (e) {
          return "";
        }
      })()
    };
  }
  async function endpoint() {
    if (url2 && Date.now() - urlT < 36e5) return url2;
    const d = window.__DREKZ;
    if (!d) return null;
    try {
      const j = JSON.parse(await get(d.base + "v2/config.json?t=" + Date.now(), { timeout: 8e3, cache: "no-store" }));
      url2 = j.tracker || null;
      urlT = Date.now();
    } catch (e) {
    }
    return url2;
  }
  async function envia() {
    if (trk.ligado() !== true || !fila.length || Date.now() - envT < 5e3) return;
    envT = Date.now();
    const u = await endpoint();
    if (!u) return;
    const lote = fila.slice(0, 40);
    try {
      const r = await fetch(u, { method: "POST", headers: { "content-type": "text/plain" }, body: JSON.stringify({ id: trk.id(), sessao, dev: aparelho(), ev: lote }) });
      if (r.ok) {
        fila = fila.slice(lote.length);
        wr2(K + "_q", fila);
        if (fila.length) setTimeout(envia, 6e3);
      }
    } catch (e) {
    }
  }
  function iniciarTrack() {
    window.addEventListener("error", (e) => track("js_erro", { msg: e.message, onde: (e.filename || "").split("/").pop() + ":" + e.lineno }));
    window.addEventListener("unhandledrejection", (e) => track("js_erro", { msg: "promise: " + (e.reason && e.reason.message || e.reason) }));
    track("abriu");
    setInterval(envia, 6e4);
    document.addEventListener("visibilitychange", () => document.hidden && envia());
  }

  // src/guia.js
  var M = /* @__PURE__ */ new Map();
  var carregando = 0;
  var aviso = 0;
  try {
    const c = cache.get("guia", null);
    if (c && Date.now() - c.t < 6 * 36e5) for (const k in c.d) M.set(k, c.d[k]);
  } catch (e) {
  }
  function lerMeuGuia(html) {
    const br = new Date(Date.now() - 108e5);
    let y = br.getUTCFullYear(), mo = br.getUTCMonth() + 1, d = br.getUTCDate();
    const r = [];
    for (const l of html.split("<li")) {
      if (l.includes("subheader")) {
        const u = /,\s*(\d+)\/(\d+)/.exec(l);
        if (u) {
          d = +u[1];
          mo = +u[2];
        }
        continue;
      }
      const c = /lileft time['"]>\s*(\d+):(\d+)/.exec(l), t = /<h2>([^<]*)<\/h2>/.exec(l);
      if (!c || !t) continue;
      const ta = document.createElement("textarea");
      ta.innerHTML = t[1];
      r.push({ t: ta.value.trim(), i: Date.UTC(y, mo - 1, d, +c[1] + 3, +c[2]) });
    }
    const n = Date.now();
    return r.map((x, k) => ({ t: x.t, i: x.i, f: k + 1 < r.length ? r[k + 1].i : x.i + 36e5 })).filter((x) => x.f > n).slice(0, 10);
  }
  function avisa2() {
    if (aviso) return;
    aviso = setTimeout(() => {
      aviso = 0;
      dispatchEvent(new Event("drekz-guia"));
    }, 800);
  }
  async function carregaGuia() {
    if (carregando) return;
    carregando = 1;
    try {
      const base2 = prefs.get().urlCanais || "https://canais-saimo.pages.dev/";
      const q = (await get(base2 + "guia.txt", { timeout: 15e3 })).split(/\r?\n/).map((l) => l.trim().split("	")).filter((a) => a[0] === "meuguia" && a.length >= 3);
      const w = async () => {
        for (let a = q.shift(); a; a = q.shift()) {
          try {
            const l = lerMeuGuia(await get("https://meuguia.tv/programacao/canal/" + a[2], { timeout: 12e3 }));
            if (l.length) {
              M.set(norm(a[1]), l);
              avisa2();
            }
          } catch (e) {
          }
        }
      };
      await Promise.all([w(), w(), w(), w()]);
      const d = {};
      M.forEach((v, k) => {
        d[k] = v.slice(0, 6);
      });
      cache.set("guia", { t: Date.now(), d });
      avisa2();
    } catch (e) {
    } finally {
      carregando = 0;
    }
  }
  function agora(nome) {
    const L = M.get(norm(nome));
    if (!L) return null;
    const n = Date.now(), k = L.findIndex((x) => n >= x.i && n < x.f);
    if (k < 0) return null;
    const c = L[k];
    return { cur: c, next: L[k + 1] || null, rest: Math.max(0, Math.round((c.f - n) / 6e4)), pct: Math.max(0, Math.min(100, Math.round((n - c.i) / (c.f - c.i) * 100))) };
  }
  function proximos(nome, qtd) {
    const L = M.get(norm(nome)) || [], n = Date.now();
    return L.filter((x) => x.f > n).slice(0, qtd || 8);
  }
  var hhmm = (ms) => {
    const d = new Date(ms), p = (x) => String(x).padStart(2, "0");
    return p(d.getHours()) + ":" + p(d.getMinutes());
  };
  function pintaTile(el) {
    const a = agora(el.getAttribute("data-ch")), g = el.querySelector(".ag"), b = el.querySelector(".pg");
    if (g) g.textContent = a ? "\u25B6 " + a.cur.t : "";
    if (b) {
      b.style.width = a ? a.pct + "%" : "0";
      b.style.display = a ? "" : "none";
    }
  }
  var pintaGuia = (r) => $$(".ch[data-ch]", r || document).forEach(pintaTile);
  function iniciaGuia() {
    addEventListener("drekz-guia", () => pintaGuia());
    setTimeout(carregaGuia, 3e3);
    setInterval(carregaGuia, 12e5);
    setInterval(() => dispatchEvent(new Event("drekz-guia")), 6e4);
  }

  // src/watch.js
  var bufT = 0;
  var stallT = 0;
  var pl;
  var P2;
  var S = null;
  var osdT = 0;
  var saveT = 0;
  var root = () => document.documentElement;
  function initWatch() {
    addEventListener("drekz-guia", pintaOsdGuia);
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
      buf: (b) => {
        $("#pl").classList.toggle("buf", !!b);
        clearTimeout(stallT);
        if (b) {
          bufT = Date.now();
          if (S && S.kind === "live" && S.up && !S.restart) {
            const my = S.tok, lim = prefs.get().buffer === "maximo" ? 18e3 : 12e3;
            stallT = setTimeout(() => {
              if (S && S.tok === my && S.up && !S.restart) erroLive("Travou por mais de " + Math.round(lim / 1e3) + " s");
            }, lim);
          }
        } else if (bufT && S) {
          const ms = Date.now() - bufT;
          bufT = 0;
          if (ms > 1500) {
            const o = { ms, tipo: S.kind, eng: pl.act === pl.nat ? "nativo" : "web" };
            if (S.kind === "live" && S.ch) {
              o.canal = S.ch.name;
              o.fonte = S.vi + 1;
              o.host = host2(S.ch.variants[S.vi] && S.ch.variants[S.vi].url);
            } else if (S.srcs) {
              o.fonte = S.si + 1;
              o.host = host2(S.srcs[S.si]);
            }
            track("trava", o);
          }
        }
      },
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
  var estadoWatch = () => S ? { kind: S.kind, ch: S.ch || null } : null;
  function irParaCanal(c, L) {
    if (S && S.kind === "live") {
      const ix = S.lista.findIndex((x) => x.id === c.id);
      if (ix < 0) S.lista = L;
      prefs.set({ ultimoCanal: c.id });
      sintoniza(c, 0, false);
      monta();
      osd(true);
      return;
    }
    if (S) sair();
    abrirLive(L, L.findIndex((x) => x.id === c.id));
  }
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
        B("\u25B2 Canal", () => zap(1)),
        B("\u25BC Canal", () => zap(-1)),
        B("\u2630 Canais", gaveta, { first: 1, keep: 1 }),
        B("\u2699 Fontes", fontes, { keep: 1 }),
        B("Programa\xE7\xE3o", programacao, { keep: 1 }),
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
      h("div", { class: "top" }, h("span", { class: "tt" }, S.titulo || ""), h("div", { class: "ag2" })),
      h("div", { class: "sp" }),
      h("div", { class: "bot" }, live ? null : h("div", { class: "pb" }, h("i")), live ? null : h("div", { class: "tm" }, h("span", { class: "t1" }, "00:00"), h("span", { class: "t2" }, "00:00")), ctl),
      h("div", { id: "gv" })
    );
    pintaOsdGuia();
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
  async function sintoniza(ch, vi, manual, ult) {
    const my = ++S.tok;
    S.ch = ch;
    S.vi = vi;
    S.manual = !!manual;
    S.rt = 0;
    S.restart = false;
    S.up = false;
    S.rf = false;
    clearTimeout(stallT);
    $("#pl .tt").textContent = ch.num + " \xB7 " + ch.name + (ch.variants.length > 1 ? "  (fonte " + (vi + 1) + "/" + ch.variants.length + ")" : "");
    osd(true);
    $("#pl").classList.add("buf");
    const n = ch.variants.length;
    if (!manual && ult == null && vi === 0) {
      const u = fonteOk.get("c:" + ch.id), ix = ch.variants.findIndex((x) => x.url === u);
      if (ix > 0) vi = ix;
    }
    const ord = manual ? [...Array(n).keys()].map((k) => (vi + k) % n) : ordena(ch, vi, ult);
    for (let k = 0; k < n; k++) {
      const i = ord[k], v = ch.variants[i], t0 = Date.now();
      try {
        await pl.open({ url: v.url, live: true, manual, ua: v.userAgent, ref: v.referer, clearKey: v.clearKey });
        if (!S || my !== S.tok) return;
        S.vi = i;
        S.okT = Date.now();
        S.up = true;
        hostRep.marca(host2(v.url), true);
        fonteOk.set("c:" + ch.id, v.url);
        track("live_ok", { canal: ch.name, fonte: i + 1, ms: Date.now() - t0, eng: pl.act === pl.nat ? "nativo" : "web", host: host2(v.url) });
        $("#pl").classList.remove("buf");
        $("#pl .tt").textContent = ch.num + " \xB7 " + ch.name + (n > 1 ? "  (fonte " + (i + 1) + "/" + n + ")" : "");
        osd(true);
        return;
      } catch (e) {
        if (!S || my !== S.tok || e.message === "cancelado") return;
        hostRep.marca(host2(v.url), false);
        track("live_falha", { canal: ch.name, fonte: i + 1, ms: Date.now() - t0, host: host2(v.url), msg: e.message, manual });
        if (manual) {
          $("#pl").classList.remove("buf");
          toast("Essa fonte n\xE3o abriu. Escolha outra em Fontes.");
          return;
        }
        if (k < n - 1) toast("Fonte " + (i + 1) + " falhou, tentando a pr\xF3xima...", 2e3);
      }
    }
    $("#pl").classList.remove("buf");
    track("live_sem_fonte", { canal: ch.name, n });
    toast("Nenhuma fonte abriu esse canal agora.");
  }
  function ordena(ch, vi, ult) {
    const n = ch.variants.length, nt = (i) => hostRep.nota(host2(ch.variants[i].url));
    const rest = [...Array(n).keys()].filter((i) => i !== vi && i !== ult).sort((a, b) => nt(a) - nt(b) || a - b);
    return ult != null && ult !== vi ? [vi, ...rest, ult] : [vi, ...rest];
  }
  function erroLive(m, rf) {
    if (!S || S.kind !== "live" || S.restart) return;
    clearTimeout(stallT);
    if (!rf && Date.now() - S.okT > 3e4) S.rt = 0;
    const ch = S.ch, vi = S.vi, my = S.tok, n = ch.variants.length, max = n > 1 ? 1 : 1e9, est = Math.round((Date.now() - S.okT) / 1e3);
    S.up = false;
    track("live_queda", { canal: ch.name, fonte: vi + 1, tent: S.rt + 1, msg: m, estavel_s: est });
    if (est < 120) hostRep.marca(host2(ch.variants[vi].url), false);
    if (S.rt < max) {
      S.rt++;
      S.restart = true;
      toast(n > 1 ? "A fonte caiu. Reiniciando..." : "Reconectando... (tentativa " + S.rt + ")", 2500);
      $("#pl").classList.add("buf");
      setTimeout(async () => {
        if (!S || S.tok !== my) return;
        S.restart = false;
        const v = ch.variants[vi];
        $("#pl").classList.add("buf");
        try {
          await pl.open({ url: v.url, live: true, manual: S.manual, ua: v.userAgent, ref: v.referer, clearKey: v.clearKey });
          if (S && S.tok === my) {
            S.okT = Date.now();
            S.up = true;
            $("#pl").classList.remove("buf");
            track("live_reinicio_ok", { canal: ch.name, fonte: vi + 1 });
          }
        } catch (e) {
          if (S && S.tok === my && e.message !== "cancelado") {
            track("live_reinicio_falha", { canal: ch.name, fonte: vi + 1, msg: e.message });
            S.restart = false;
            erroLive(e.message, true);
          }
        }
      }, n > 1 ? 1500 : Math.min(1500 * Math.pow(2, S.rt - 1), 8e3));
    } else {
      S.rt = 0;
      if (S.manual) toast("A fonte caiu. Abra Fontes e escolha outra.");
      else {
        toast("A fonte n\xE3o voltou. Trocando de fonte...");
        sintoniza(ch, ordena(ch, vi)[1], false, vi);
      }
    }
  }
  function pintaOsdGuia() {
    const el = $("#pl .ag2");
    if (!el) return;
    el.innerHTML = "";
    if (!S || S.kind !== "live") return;
    const a = agora(S.ch.name);
    if (!a) return;
    el.append(h("div", { class: "a1" }, "No ar: " + a.cur.t), h("div", { class: "a2" }, hhmm(a.cur.i) + " \u2013 " + hhmm(a.cur.f) + " \xB7 faltam " + a.rest + " min" + (a.next ? "   \xB7   A seguir: " + a.next.t : "")));
  }
  function programacao() {
    const L = proximos(S.ch.name, 8);
    clearTimeout(osdT);
    if (!L.length) {
      toast("Sem programa\xE7\xE3o dispon\xEDvel para este canal agora.");
      return;
    }
    modal("Programa\xE7\xE3o \xB7 " + S.ch.name, L.map((x) => ({ t: hhmm(x.i) + "   " + x.t, s: Date.now() >= x.i ? "No ar agora \xB7 faltam " + Math.max(0, Math.round((x.f - Date.now()) / 6e4)) + " min" : "At\xE9 " + hhmm(x.f) })));
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
      h("div", { class: "n" }, c.num + " \xB7 " + c.name, h("small", { class: "ag" })),
      h("i", { class: "pg" })
    )));
    g.querySelectorAll(".ch").forEach((el, i) => {
      el.setAttribute("data-ch", S.lista[i].name);
      pintaTile(el);
    });
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
    const n = S.srcs.length, fk = "v:" + S.it.id + ":" + (S.s || 0) + ":" + (S.e || 0);
    if (!manual && i === 0) {
      const ix = S.srcs.indexOf(fonteOk.get(fk));
      if (ix > 0) i = ix;
    }
    for (let k = 0; k < n; k++) {
      const j = (i + k) % n, t0 = Date.now();
      try {
        await pl.open({ url: S.srcs[j], live: false, manual: !!manual, start });
        if (!S || my !== S.tok) return;
        S.si = j;
        fonteOk.set(fk, S.srcs[j]);
        track("vod_ok", { tipo: S.serie ? "serie" : "filme", fonte: j + 1, ms: Date.now() - t0, eng: pl.act === pl.nat ? "nativo" : "web", host: host2(S.srcs[j]) });
        $("#pl").classList.remove("buf");
        osd(true);
        return;
      } catch (e) {
        if (!S || my !== S.tok || e.message === "cancelado") return;
        track("vod_falha", { tipo: S.serie ? "serie" : "filme", fonte: j + 1, ms: Date.now() - t0, host: host2(S.srcs[j]), msg: e.message });
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
    track("vod_queda", { tipo: S.serie ? "serie" : "filme", fonte: S.si + 1, msg: m, pos: Math.round(S.t) });
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
    progress.set(it.id, { t: S.t, d: S.d, title: it.title, poster: it.poster, serie: it.serie, s: S.s, e: S.e, season: S.s, episode: S.e, done: done && !it.serie ? true : false, letra: it.letra, tmdb: it.tmdb });
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
    progress.set(it.id, { t: 0, d: 0, title: it.title, poster: it.poster, serie: true, s: n.s, e: n.ep.n, season: n.s, episode: n.ep.n, letra: it.letra, tmdb: it.tmdb });
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
    clearTimeout(stallT);
    pl.stop();
    S = null;
    off && off();
    clearTimeout(osdT);
    root().classList.remove("assistindo");
    $("#pl").classList.remove("osd", "buf");
    setScope(() => $("#ui"));
    window.dispatchEvent(new Event("drekz-voltou"));
  }
  var dig = "";
  var digT = 0;
  function digito(d) {
    dig = (dig + d).slice(-4);
    toast("Canal " + dig, 1600);
    clearTimeout(digT);
    digT = setTimeout(() => {
      const n = +dig;
      dig = "";
      if (!S || S.kind !== "live") return;
      const l = S.lista, c = l.find((x) => x.num === n);
      c ? (prefs.set({ ultimoCanal: c.id }), sintoniza(c, 0, false), monta(), osd(true)) : toast("N\xE3o existe o canal " + n, 2e3);
    }, 1600);
  }
  function playerKey(e) {
    if (!S) return false;
    if (S.kind === "live" && !$("#gv").classList.contains("on2") && document.getElementById("modal").style.display !== "flex") {
      const k = e.keyCode, d = k >= 48 && k <= 57 ? k - 48 : k >= 96 && k <= 105 ? k - 96 : -1;
      if (d >= 0) {
        digito(d);
        return true;
      }
    }
    const pe = $("#pl"), vis = pe.classList.contains("osd"), g = $("#gv").classList.contains("on2");
    if (is(e, "CHUP") && S.kind === "live") {
      zap(1);
      return true;
    }
    if (is(e, "CHDOWN") && S.kind === "live") {
      zap(-1);
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
          zap(is(e, "UP") ? 1 : -1);
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
  async function buscar(texto2) {
    const q = norm(texto2);
    if (q.length < 2) return [];
    const lista = await fichas(), qt = q.split(" ");
    let r = lista.map((it) => ({ it, s: score(q, qt, it) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.it);
    if (r.length < 6) {
      const ids = await tmdbBusca(texto2);
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

  // src/connect.js
  var sha256 = function(s) {
    const u = new TextEncoder().encode(s), n = u.length, l = n + 9 + 63 >> 6 << 6, b = new Uint8Array(l);
    b.set(u), b[n] = 128;
    const dv = new DataView(b.buffer);
    dv.setUint32(l - 4, n * 8 >>> 0), dv.setUint32(l - 8, Math.floor(n * 8 / 4294967296));
    const K2 = [], H = [];
    let p = 2, c = 0;
    const fr = (x) => (x - Math.floor(x)) * 4294967296 | 0;
    for (; c < 64; p++) {
      let pr = true;
      for (let d = 2; d * d <= p; d++) if (p % d == 0) {
        pr = false;
        break;
      }
      pr && (c < 8 && (H[c] = fr(Math.sqrt(p))), K2[c] = fr(Math.cbrt(p)), c++);
    }
    const W = new Int32Array(64), R = (x, k) => x >>> k | x << 32 - k;
    for (let o = 0; o < l; o += 64) {
      for (let i = 0; i < 16; i++) W[i] = dv.getInt32(o + i * 4);
      for (let i = 16; i < 64; i++) {
        const a2 = W[i - 15], d = W[i - 2];
        W[i] = W[i - 16] + (R(a2, 7) ^ R(a2, 18) ^ a2 >>> 3) + W[i - 7] + (R(d, 17) ^ R(d, 19) ^ d >>> 10) | 0;
      }
      let [a, b2, c2, d2, e, f, g, h2] = H;
      for (let i = 0; i < 64; i++) {
        const t1 = h2 + (R(e, 6) ^ R(e, 11) ^ R(e, 25)) + (e & f ^ ~e & g) + K2[i] + W[i] | 0, t2 = (R(a, 2) ^ R(a, 13) ^ R(a, 22)) + (a & b2 ^ a & c2 ^ b2 & c2) | 0;
        h2 = g, g = f, f = e, e = d2 + t1 | 0, d2 = c2, c2 = b2, b2 = a, a = t1 + t2 | 0;
      }
      H[0] = H[0] + a | 0, H[1] = H[1] + b2 | 0, H[2] = H[2] + c2 | 0, H[3] = H[3] + d2 | 0, H[4] = H[4] + e | 0, H[5] = H[5] + f | 0, H[6] = H[6] + g | 0, H[7] = H[7] + h2 | 0;
    }
    return H.map((x) => (x >>> 0).toString(16).padStart(8, "0")).join("");
  };
  var PORTA = 8765;
  var KEYS = { up: 38, down: 40, left: 37, right: 39, ok: 13, back: 27, red: 403, green: 404, yellow: 405, blue: 406, play: 415, pause: 19, stop: 413, ff: 417, rw: 412, info: 457 };
  var S2 = { ws: null, par: null, ligado: false, cod: "", achados: [], varrendo: false, falhas: 0, pr: "", nomeTela: null, iv: 0, rv: null, ui: null };
  var cfg = () => {
    try {
      return JSON.parse(localStorage.getItem("drekz_connect") || "{}");
    } catch (e) {
      return {};
    }
  };
  var salva = (c) => {
    try {
      localStorage.setItem("drekz_connect", JSON.stringify(c));
    } catch (e) {
    }
  };
  var meuId = () => {
    const c = cfg();
    if (!c.id) {
      c.id = "tv" + Math.random().toString(36).slice(2, 10);
      salva(c);
    }
    return c.id;
  };
  var nomeTv = () => cfg().nome || "TV Drekz";
  var codigoTv = () => {
    const c = cfg();
    if (!/^\d{8}$/.test(c.rv || "")) {
      c.rv = String(Math.floor(1e7 + Math.random() * 9e7));
      salva(c);
    }
    return c.rv;
  };
  var ocupado = () => !!estadoWatch();
  var estado = () => S2.ligado && S2.par ? "Conectado: " + (S2.par.nome || S2.par.ip) : Object.keys(cfg().par || {}).length ? "Pareado (abra o app no celular)" : "Nenhum celular";
  var msg = (t) => {
    S2.msgT = t;
    S2.ui && S2.ui.msg && S2.ui.msg(t);
  };
  var redesenha = () => S2.ui && S2.ui.desenha && S2.ui.desenha();
  function meuIp() {
    try {
      const n = window.webapis && window.webapis.network;
      if (n && n.getIp) {
        const ip = n.getIp();
        if (/^\d+\.\d+\.\d+\.\d+$/.test(ip) && ip !== "0.0.0.0") return ip;
      }
    } catch (e) {
    }
    try {
      if (window.DrekzNative && window.DrekzNative.getIp) {
        const ip = window.DrekzNative.getIp();
        if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return ip;
      }
    } catch (e) {
    }
    return "";
  }
  function ipRtc() {
    return new Promise((res) => {
      let pc, fin = false;
      const ok = (x) => {
        if (fin) return;
        fin = true;
        try {
          pc && pc.close();
        } catch (e) {
        }
        res(x);
      };
      try {
        pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel("");
        pc.onicecandidate = (e) => {
          if (!e.candidate) {
            ok("");
            return;
          }
          const m = /(\d+\.\d+\.\d+\.\d+)/.exec(e.candidate.candidate);
          m && !/^(0\.|127\.|169\.254)/.test(m[1]) && ok(m[1]);
        };
        pc.createOffer().then((o) => pc.setLocalDescription(o)).catch(() => ok(""));
        setTimeout(() => ok(""), 1500);
      } catch (e) {
        ok("");
      }
    });
  }
  function sonda(ip, ms) {
    ms = ms || 1800;
    return new Promise((res) => {
      let w, ok = false;
      const fim = (r) => {
        if (ok) return;
        ok = true;
        clearTimeout(tm);
        try {
          w && w.close();
        } catch (e) {
        }
        res(r);
      }, tm = setTimeout(() => fim(null), ms);
      try {
        w = new WebSocket("ws://" + ip + ":" + PORTA + "/");
      } catch (e) {
        fim(null);
        return;
      }
      w.onopen = () => {
        try {
          w.send(JSON.stringify({ t: "hello", id: meuId(), nome: nomeTv(), kind: "tv", sonda: 1 }));
        } catch (e) {
          fim(null);
        }
      };
      w.onmessage = (m) => {
        try {
          const d = JSON.parse(m.data);
          d.t === "hello" && fim({ ip, id: d.id, nome: d.nome });
        } catch (e) {
        }
      };
      w.onerror = () => fim(null);
      w.onclose = () => fim(null);
    });
  }
  async function bases2() {
    const out = [], add = (ip) => {
      const m = /^(\d+\.\d+\.\d+)\.\d+$/.exec(ip || "");
      m && !out.some((o) => o.b === m[1]) && out.push({ b: m[1], me: ip });
    };
    add(meuIp());
    add(cfg().ult);
    add(await ipRtc());
    return out;
  }
  async function varrer(silencio) {
    if (S2.varrendo) return;
    S2.varrendo = true;
    S2.achados = [];
    redesenha();
    const known = await bases2(), eu = meuIp(), ult = cfg().ult, comuns = silencio ? [] : ["192.168.0", "192.168.1", "192.168.15", "192.168.100", "192.168.2", "10.0.0", "192.168.18", "192.168.3"].filter((b) => !known.some((o) => o.b === b)), grupos = [];
    known.length && grupos.push({ bs: known.map((o) => o.b), ms: 1800 });
    comuns.length && grupos.push({ bs: comuns, ms: 900, extra: true });
    for (const g of grupos) {
      if (!S2.varrendo) break;
      g.extra && !silencio && msg("Procurando em outras redes comuns...");
      let hs = [];
      g.bs.forEach((b) => {
        for (let i = 1; i < 255; i++) {
          const x = b + "." + i;
          x !== eu && hs.push(x);
        }
      });
      ult && (hs = hs.filter((x) => x !== ult), hs.unshift(ult));
      let k = 0, f = 0;
      const w = async () => {
        for (; k < hs.length && S2.varrendo; ) {
          const x = hs[k++], r = await sonda(x, g.ms);
          f++;
          r && !S2.achados.some((a) => a.id === r.id) && (S2.achados.push(r), redesenha());
          silencio || f % 8 || msg("Procurando celulares... " + f + "/" + hs.length);
        }
      };
      await Promise.all(Array.from({ length: silencio ? 12 : 48 }, w));
      if (S2.achados.length) break;
    }
    S2.varrendo = false;
    silencio || msg(S2.achados.length ? "Escolha o celular:" : "Nenhum celular encontrado. Confira se o celular e a TV est\xE3o no mesmo Wi-Fi e se o app Drekz est\xE1 aberto na tela Connect (ou digite o IP).");
    redesenha();
    return S2.achados;
  }
  function conectar(a) {
    desconectar(true);
    const c = cfg(), tok = (c.par || {})[a.id] && c.par[a.id].tok || "";
    msg("Conectando a " + (a.nome || a.ip) + "...");
    let w;
    try {
      w = new WebSocket("ws://" + a.ip + ":" + PORTA + "/");
    } catch (e) {
      msg("Falha ao conectar.");
      return;
    }
    S2.ws = w;
    S2.par = a;
    S2.ligado = false;
    w.onopen = () => w.send(JSON.stringify({ t: "hello", id: meuId(), nome: nomeTv(), kind: "tv", tok }));
    w.onmessage = (m) => recebe(m, a, w);
    w.onclose = () => {
      if (S2.ws === w) {
        S2.ws = null;
        S2.ligado = false;
        S2.cod = "";
        clearInterval(S2.iv);
        msg("Celular desconectado.");
        redesenha();
      }
    };
  }
  function desconectar(silencio) {
    window.__ponte = null;
    clearInterval(S2.iv);
    const w = S2.ws;
    S2.ws = null;
    S2.ligado = false;
    S2.cod = "";
    try {
      w && w.close();
    } catch (e) {
    }
    silencio || (msg("Desconectado."), redesenha());
  }
  function esquecer(id) {
    const c = cfg();
    c.par && delete c.par[id];
    salva(c);
    S2.par && S2.par.id === id && desconectar(true);
    redesenha();
  }
  var env = (o) => {
    try {
      S2.ws && S2.ws.readyState === 1 && S2.ws.send(JSON.stringify(o));
    } catch (e) {
    }
  };
  function recebe(m, a, w) {
    let d;
    try {
      d = JSON.parse(m.data);
    } catch (e) {
      return;
    }
    if (d.t === "hello" && d.id && a.id !== d.id) a.id = d.id;
    if (d.t === "hello") {
      if (d.auth) ligou(a);
      else {
        S2.cod = String(Math.floor(1e3 + Math.random() * 9e3));
        msg("C\xF3digo " + S2.cod + "  \u2014  confirme no celular");
        w.send(JSON.stringify({ t: "pair", code: S2.cod }));
        redesenha();
      }
    } else if (d.t === "paired") {
      const c = cfg();
      c.par = c.par || {};
      c.par[a.id] = { nome: a.nome, tok: d.tok, ip: a.ip };
      c.ult = a.ip;
      salva(c);
      S2.cod = "";
      ligou(a);
    } else if (d.t === "denied") {
      S2.cod = "";
      msg("O celular recusou a conex\xE3o.");
      desconectar(true);
    } else if (d.t === "key") tecla(d.k);
    else if (d.t === "vol") volume(d.v);
    else if (d.t === "chan") canal(d.id);
    else if (d.t === "text") texto(d.v);
    else if (d.t === "open") abrir(d.id);
    else if (d.t === "getstate") enviarTudo();
    else if (d.t === "prog") {
      d.ok && mescla(d.d);
    } else if (d.t === "ponte") {
      window.__ponte = { ip: a.ip, porta: d.porta || 8766 };
      prefs.set({ ponteSempre: !!d.sempre });
    }
  }
  function ligou(a) {
    S2.ligado = true;
    S2.falhas = 0;
    const c = cfg();
    c.ult = a.ip;
    salva(c);
    msg("Conectado a " + (a.nome || a.ip) + ". Use o celular como controle.");
    toast("Celular conectado: " + (a.nome || a.ip), 3e3);
    enviarTudo();
    clearInterval(S2.iv);
    S2.iv = setInterval(enviarEstado, 3e3);
    redesenha();
  }
  function volume(v) {
    let n = null;
    try {
      const tz = window.tizen && window.tizen.tvaudiocontrol;
      if (tz) {
        if (v === "up") tz.setVolumeUp();
        else if (v === "down") tz.setVolumeDown();
        else if (v === "mute") tz.setMute(!tz.isMute());
        n = tz.isMute() ? 0 : tz.getVolume();
      } else if (window.DrekzNative && window.DrekzNative.vol) {
        n = +window.DrekzNative.vol(v);
      }
    } catch (e) {
    }
    if (n === 0) toast("Mudo", 1200);
    else if (n !== null && n > 0) toast("Volume " + n, 1200);
  }
  function tecla(k) {
    if (k === "chup" || k === "chdn") {
      fake(k === "chup" ? 427 : 428);
      return;
    }
    let n = KEYS[k];
    if (n === void 0 && /^[0-9]$/.test(k)) n = 48 + +k;
    if (n === void 0) return;
    fake(n);
  }
  function fake(n) {
    const ev = new KeyboardEvent("keydown", { bubbles: true, cancelable: true });
    try {
      Object.defineProperty(ev, "keyCode", { get: () => n });
      Object.defineProperty(ev, "which", { get: () => n });
    } catch (e) {
    }
    (document.activeElement || document.body).dispatchEvent(ev);
  }
  async function canal(id) {
    const L = await canais(), c = L.find((x) => String(x.id) === String(id));
    if (c) {
      irParaCanal(c, L);
      setTimeout(enviarEstado, 600);
    }
  }
  function texto(v) {
    const go2 = window.__drekz && window.__drekz.go;
    const poe = () => {
      const el = document.querySelector(".sb input");
      if (el) {
        el.value = v;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    };
    if (document.querySelector(".sb input")) poe();
    else if (!ocupado() && go2) {
      go2("busca", null);
      setTimeout(poe, 400);
    }
  }
  async function abrir(id) {
    const ds = await destaques(), f = await fichas();
    let it = null;
    for (const r of ds) for (const x of r.itens) if (x.id === id) it = x;
    it = it || f.find((x) => x.id === id);
    if (it && !ocupado() && window.__drekz) window.__drekz.go("detalhe", it);
  }
  var raw = () => JSON.stringify(progress.all());
  function enviarProg(f) {
    const r = raw();
    if (!f && r === S2.pr) return;
    S2.pr = r;
    env({ t: "prog", d: progress.all() });
  }
  function mescla(o) {
    const n = progress.mergeIn(o);
    if (n) {
      S2.pr = raw();
      toast("Epis\xF3dios sincronizados com o celular (" + n + ")", 3500);
    }
  }
  addEventListener("drekz-guia", () => {
    try {
      S2.ligado && enviarEstado();
    } catch (e) {
    }
  });
  function enviarTudo() {
    S2.cn = -1;
    S2.dn = -1;
    enviarProg(true);
    enviarEstado();
  }
  async function enviarEstado() {
    enviarProg();
    const L = await canais();
    const lista = L.map((x) => {
      const a = agora(x.name);
      return { id: x.id, n: x.name, num: x.num, a: a ? a.cur.t : "" };
    }), sg = lista.map((x) => x.a).join("|");
    if (L.length !== S2.cn || sg !== S2.cs) {
      S2.cn = L.length;
      S2.cs = sg;
      env({ t: "canais", lista });
    }
    try {
      const F = await destaques(), n = F.reduce((a, f) => a + f.itens.length, 0);
      if (n !== S2.dn) {
        S2.dn = n;
        env({ t: "destaques", filas: F.slice(0, 8).map((f) => ({ t: f.titulo, i: f.itens.slice(0, 24).map((x) => ({ id: x.id, n: x.title, p: x.poster, s: x.serie ? 1 : 0, y: x.year })) })) });
      }
    } catch (e) {
    }
    const w = estadoWatch(), tela = w ? w.kind === "live" ? "live" : "player" : { inicio: "home", tv: "live", filmes: "ondemand", series: "ondemand", busca: "search", ajustes: "settings", conectar: "connect", detalhe: "ficha" }[window.__drekz && window.__drekz.tela && window.__drekz.tela() || "inicio"] || "home";
    env({ t: "state", tela, canal: w && w.kind === "live" ? { id: w.ch.id, n: w.ch.name } : null });
  }
  function auto() {
    const c = cfg();
    if (S2.autoOn || !Object.keys(c.par || {}).length) return;
    S2.autoOn = true;
    const tenta = async () => {
      if (!S2.ligado && !S2.varrendo && !ocupado()) {
        const par = cfg().par || {}, u = cfg().ult;
        let r = u ? await sonda(u, 1500) : null;
        if (r && !par[r.id]) r = null;
        if (!r && ++S2.falhas >= 2 && Date.now() - (S2._ls || 0) > 3e5) {
          S2._ls = Date.now();
          const l = await varrer(true);
          r = (l || []).find((a) => par[a.id]) || null;
          S2.falhas = 0;
        }
        r && conectar(r);
      }
      setTimeout(tenta, 15e3);
    };
    setTimeout(tenta, 4e3);
  }
  var topico = (c) => "drekz-" + sha256(c + "drekz-connect-v1").slice(0, 32);
  var rvBase = () => {
    let b = "https://ntfy.sh/";
    try {
      b = localStorage.getItem("drekz_rv_base") || b;
    } catch (e) {
    }
    return b.replace(/\/?$/, "/");
  };
  function rvIniciar() {
    if (S2.rv || typeof EventSource === "undefined") return;
    const t = topico(codigoTv()), vistos = S2.rvv || (S2.rvv = /* @__PURE__ */ new Set());
    const abre2 = () => {
      let es;
      try {
        es = new EventSource(rvBase() + t + "/sse?since=15s");
      } catch (e) {
        setTimeout(abre2, 6e4);
        return;
      }
      S2.rv = es;
      es.onmessage = (ev) => {
        try {
          const m = JSON.parse(ev.data);
          if (m.event !== "message" || vistos.has(m.id)) return;
          vistos.add(m.id);
          rvMsg(JSON.parse(m.message));
        } catch (e) {
        }
      };
      es.onerror = () => {
        try {
          es.close();
        } catch (e) {
        }
        S2.rv = null;
        setTimeout(() => {
          S2.rv || abre2();
        }, 15e3);
      };
    };
    abre2();
  }
  function rvMsg(d) {
    if (!d || d.t !== "ola" || !/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(String(d.ip)) || Math.abs(Date.now() - (d.ts || 0)) > 12e4 || S2.ligado) return;
    toast("O celular " + (d.nome || "") + " chamou esta TV. Conectando...", 3e3);
    conectar({ ip: d.ip, id: d.id || d.ip, nome: d.nome || "Celular" });
  }
  function iniciarConnect() {
    if (/[?&]fill=1/.test(location.search)) return;
    auto();
    rvIniciar();
  }
  function telaConectar(m) {
    const cd = codigoTv(), par = () => cfg().par || {};
    const st = h("div", { class: "vazio", style: "padding:6px 8px 14px" }, S2.msgT || estado()), ls = h("div"), pr = h("div");
    const ip = h("input", { class: "f", placeholder: "IP do celular (ex.: 192.168.1.23)", style: "width:520px;font-size:26px;padding:14px 20px;border-radius:14px;border:3px solid transparent;background:var(--card);color:var(--tx);margin:10px 0" });
    const btn2 = (t, fn, x) => h("div", { class: "btn f" + (x ? " pri" : ""), onclick: fn }, t);
    const desenha = () => {
      ls.innerHTML = "";
      pr.innerHTML = "";
      if (S2.ligado && S2.par) ls.append(btn2("Desconectar de " + (S2.par.nome || S2.par.ip), () => desconectar()));
      S2.achados.forEach((a) => {
        (!S2.ligado || !S2.par || S2.par.id !== a.id) && ls.append(btn2((a.nome || "Celular") + "  \xB7  " + a.ip + (par()[a.id] ? "  \xB7  pareado" : ""), () => conectar(a), 1));
      });
      Object.keys(par()).forEach((id) => pr.append(btn2("Esquecer " + (par()[id].nome || id), () => esquecer(id))));
    };
    S2.ui = { msg: (t) => {
      if (st.isConnected) st.textContent = t;
    }, desenha: () => {
      if (ls.isConnected) desenha();
    } };
    m.append(
      h("h1", null, "Conectar celular"),
      h("div", { class: "vazio", style: "padding:0 8px 10px" }, "Abra o app Drekz Connect no celular (mesmo Wi-Fi) e escolha a TV, ou use o c\xF3digo abaixo."),
      h("div", { class: "row", style: "cursor:default" }, h("div", null, "C\xF3digo desta TV", h("small", null, "No celular: aba TVs, digite o c\xF3digo e toque em Chamar TV")), h("b", { style: "font-size:34px;letter-spacing:4px" }, cd.slice(0, 4) + " " + cd.slice(4))),
      st,
      ls,
      btn2("Procurar de novo", () => {
        msg("Procurando celulares...");
        varrer();
      }, 1),
      ip,
      btn2("Conectar pelo IP", async () => {
        const v = ip.value.trim();
        if (!/^\d+\.\d+\.\d+\.\d+$/.test(v)) return msg("Digite o IP assim: 192.168.1.23");
        const r = await sonda(v, 2500);
        r ? conectar(r) : msg("N\xE3o achei o app nesse IP. Ele est\xE1 aberto na tela Connect?");
      }),
      pr
    );
    desenha();
    focusFirst(m);
    if (!S2.ligado) {
      msg("Procurando celulares...");
      varrer();
    }
  }

  // src/qr.js
  var TAB = [null, [26, 10, 1], [44, 16, 1], [70, 26, 1], [100, 18, 2], [134, 24, 2], [172, 16, 4]];
  var ALIN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34]];
  var EXP = new Array(512);
  var LOG = new Array(256);
  (function() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 256) x ^= 285;
    }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();
  var mul = (a, b) => a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
  function rs(data, n) {
    let g = [1];
    for (let i = 0; i < n; i++) {
      const ng = new Array(g.length + 1).fill(0);
      for (let j = 0; j < g.length; j++) {
        ng[j] ^= g[j];
        ng[j + 1] ^= mul(g[j], EXP[i]);
      }
      g = ng;
    }
    const r = new Array(n).fill(0);
    for (const d of data) {
      const f = d ^ r[0];
      r.shift();
      r.push(0);
      for (let i = 0; i < n; i++) r[i] ^= mul(g[i + 1], f);
    }
    return r;
  }
  function codewords(bytes, v) {
    const [tot, ec, nb] = TAB[v], dcw = tot - ec * nb, bits = [];
    const put = (val, len) => {
      for (let i = len - 1; i >= 0; i--) bits.push(val >>> i & 1);
    };
    put(4, 4);
    put(bytes.length, 8);
    bytes.forEach((b) => put(b, 8));
    for (let i = 0; i < 4 && bits.length < dcw * 8; i++) bits.push(0);
    while (bits.length % 8) bits.push(0);
    const d = [];
    for (let i = 0; i < bits.length; i += 8) {
      let x = 0;
      for (let j = 0; j < 8; j++) x = x << 1 | bits[i + j];
      d.push(x);
    }
    for (let p = 0; d.length < dcw; p ^= 1) d.push(p ? 17 : 236);
    const per = dcw / nb, blocks = [], ecs = [];
    for (let i = 0; i < nb; i++) {
      const b = d.slice(i * per, (i + 1) * per);
      blocks.push(b);
      ecs.push(rs(b, ec));
    }
    const out = [];
    for (let i = 0; i < per; i++) for (let b = 0; b < nb; b++) out.push(blocks[b][i]);
    for (let i = 0; i < ec; i++) for (let b = 0; b < nb; b++) out.push(ecs[b][i]);
    return out;
  }
  function utf8(s) {
    return Array.from(unescape(encodeURIComponent(s)), (c) => c.charCodeAt(0));
  }
  function qrMatrix(text) {
    const bytes = utf8(text), cap = [0, 14, 26, 42, 62, 84, 106];
    let v = 1;
    while (v <= 6 && bytes.length > cap[v]) v++;
    if (v > 6) throw new Error("QR: texto longo demais");
    const size = 17 + 4 * v, cw = codewords(bytes, v);
    const M2 = [], F = [];
    for (let i = 0; i < size; i++) {
      M2.push(new Array(size).fill(false));
      F.push(new Array(size).fill(false));
    }
    const setF = (x, y, d) => {
      if (x >= 0 && y >= 0 && x < size && y < size) {
        M2[y][x] = d;
        F[y][x] = true;
      }
    };
    for (let i = 0; i < size; i++) {
      setF(6, i, i % 2 === 0);
      setF(i, 6, i % 2 === 0);
    }
    const finder = (cx, cy) => {
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        setF(cx + dx, cy + dy, d !== 2 && d !== 4);
      }
    };
    finder(3, 3);
    finder(size - 4, 3);
    finder(3, size - 4);
    const al = ALIN[v];
    for (let i = 0; i < al.length; i++) for (let j = 0; j < al.length; j++) {
      if (i === 0 && j === 0 || i === 0 && j === al.length - 1 || i === al.length - 1 && j === 0) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) setF(al[i] + dx, al[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
    const formato = (mask) => {
      const data = mask;
      let rem = data;
      for (let i = 0; i < 10; i++) rem = rem << 1 ^ (rem >>> 9) * 1335;
      const bits = (data << 10 | rem) ^ 21522, bit = (i) => (bits >>> i & 1) !== 0;
      for (let i = 0; i <= 5; i++) setF(8, i, bit(i));
      setF(8, 7, bit(6));
      setF(8, 8, bit(7));
      setF(7, 8, bit(8));
      for (let i = 9; i < 15; i++) setF(14 - i, 8, bit(i));
      for (let i = 0; i < 8; i++) setF(size - 1 - i, 8, bit(i));
      for (let i = 8; i < 15; i++) setF(8, size - 15 + i, bit(i));
      setF(8, size - 8, true);
    };
    formato(0);
    let k = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
        const x = right - j, up = (right + 1 & 2) === 0, y = up ? size - 1 - vert : vert;
        if (!F[y][x] && k < cw.length * 8) {
          M2[y][x] = (cw[k >>> 3] >>> 7 - (k & 7) & 1) !== 0;
          k++;
        }
      }
    }
    const cond = [
      (x, y) => (x + y) % 2 === 0,
      (x, y) => y % 2 === 0,
      (x) => x % 3 === 0,
      (x, y) => (x + y) % 3 === 0,
      (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
      (x, y) => x * y % 2 + x * y % 3 === 0,
      (x, y) => (x * y % 2 + x * y % 3) % 2 === 0,
      (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0
    ];
    const aplica = (m) => {
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!F[y][x] && cond[m](x, y)) M2[y][x] = !M2[y][x];
    };
    const penal = () => {
      let p = 0, claros = 0;
      const linha = (get2) => {
        for (let a = 0; a < size; a++) {
          let run = 1, s = "";
          for (let b = 0; b < size; b++) {
            const c = get2(a, b);
            s += c ? "1" : "0";
            if (b > 0) {
              if (c === get2(a, b - 1)) {
                run++;
                if (run === 5) p += 3;
                else if (run > 5) p++;
              } else run = 1;
            }
          }
          for (let i = 0; i + 11 <= size; i++) {
            const w = s.substr(i, 11);
            if (w === "10111010000" || w === "00001011101") p += 40;
          }
        }
      };
      linha((a, b) => M2[a][b]);
      linha((a, b) => M2[b][a]);
      for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) {
        const c = M2[y][x];
        if (c === M2[y][x + 1] && c === M2[y + 1][x] && c === M2[y + 1][x + 1]) p += 3;
      }
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (M2[y][x]) claros++;
      p += Math.floor(Math.abs(claros * 20 - size * size * 10) / (size * size)) * 10;
      return p;
    };
    let melhor = 0, pm = 1e9;
    for (let m = 0; m < 8; m++) {
      aplica(m);
      formato(m);
      const p = penal();
      if (p < pm) {
        pm = p;
        melhor = m;
      }
      aplica(m);
    }
    aplica(melhor);
    formato(melhor);
    return M2;
  }
  function qrCanvas(text, px) {
    const m = qrMatrix(text), n = m.length + 8, s = Math.max(2, Math.floor((px || 320) / n)), c = document.createElement("canvas");
    c.width = c.height = n * s;
    const g = c.getContext("2d");
    g.fillStyle = "#fff";
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#000";
    for (let y = 0; y < m.length; y++) for (let x = 0; x < m.length; x++) if (m[y][x]) g.fillRect((x + 4) * s, (y + 4) * s, s, s);
    return c;
  }

  // src/conta.js
  var conta = () => cache.get("conta", {});
  var salva2 = (o) => {
    const c = __spreadValues(__spreadValues({}, conta()), o);
    if (o === null) return cache.set("conta", {});
    cache.set("conta", c);
  };
  var contaEstado = () => {
    const c = conta();
    return c.token ? c.u : "Entrar";
  };
  var contaAtiva = () => !!conta().token || !!cache.get("conta_ativa", false);
  var cfgJ = null;
  var cfgT = 0;
  async function cfg2() {
    if (cfgJ && Date.now() - cfgT < 36e5) return cfgJ;
    const d = window.__DREKZ;
    if (!d) {
      cfgJ = {};
      cfgT = Date.now();
      return cfgJ;
    }
    try {
      cfgJ = JSON.parse(await get(d.base + "v2/config.json?t=" + Date.now(), { timeout: 8e3, cache: "no-store" }));
    } catch (e) {
      cfgJ = cfgJ || {};
    }
    cfgT = Date.now();
    cache.set("conta_ativa", !!(cfgJ && cfgJ.sync));
    return cfgJ;
  }
  var baseSite = () => window.__DREKZ && window.__DREKZ.base || "https://jogadorum.github.io/drekz-updates/";
  async function api(rota, corpo) {
    const c = await cfg2();
    if (!c.sync) throw new Error("O servi\xE7o de contas ainda n\xE3o foi ativado.");
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : null, tm = setTimeout(() => ctl && ctl.abort(), 15e3);
    try {
      const r = await fetch(c.sync.replace(/\/+$/, "") + rota, { method: "POST", headers: { "content-type": "text/plain" }, body: JSON.stringify(corpo || {}), signal: ctl && ctl.signal });
      let j;
      try {
        j = await r.json();
      } catch (e) {
        throw new Error("Sem resposta do servidor (" + r.status + ").");
      }
      if (!j.ok) {
        const e = new Error(j.erro || "Erro");
        e.st = r.status;
        throw e;
      }
      return j;
    } catch (e) {
      if (e.name === "AbortError") throw new Error("O servidor demorou demais. Tente de novo.");
      if (/Failed to fetch|NetworkError|Load failed/i.test(e.message)) throw new Error("Sem conex\xE3o com o servidor.");
      throw e;
    } finally {
      clearTimeout(tm);
    }
  }
  var ocupado2 = false;
  async function sincroniza(manual) {
    const c = conta();
    if (!c.token || ocupado2) return false;
    ocupado2 = true;
    try {
      const prog = {}, p = progress.all();
      for (const k in p) if (/^[fs]_/.test(k) && p[k] && p[k].title) prog[k] = p[k];
      const r = await api("/sync", { token: c.token, prog, fav: favs.mapa() });
      const a = progress.mergeIn(r.prog), b = favs.mergeIn(r.fav);
      salva2({ ult: Date.now() });
      if (manual) toast(a || b ? "Sincronizado: dados de outros aparelhos chegaram." : "Tudo sincronizado.");
      try {
        dispatchEvent(new Event("drekz-conta"));
      } catch (e) {
      }
      return true;
    } catch (e) {
      if (e.st === 401) {
        salva2(null);
        toast("Sua sess\xE3o expirou. Entre na conta de novo.", 5e3);
      } else if (manual) toast(e.message, 4e3);
      return false;
    } finally {
      ocupado2 = false;
    }
  }
  function iniciaConta() {
    setTimeout(() => cfg2(), 3e3);
    setTimeout(() => sincroniza(false), 6e3);
    setInterval(() => sincroniza(false), 6e5);
    let t = 0;
    addEventListener("drekz-prog", () => {
      if (!conta().token) return;
      clearTimeout(t);
      t = setTimeout(() => sincroniza(false), 45e3);
    });
  }
  var btn = (t, fn, x) => h("div", { class: "btn f" + (x ? " pri" : ""), onclick: fn }, t);
  var aleat = (n) => {
    const A = "abcdefghjkmnpqrstuvwxyz23456789";
    let s = "";
    const b = new Uint8Array(n);
    (window.crypto || window.msCrypto).getRandomValues(b);
    for (let i = 0; i < n; i++) s += A[b[i] % A.length];
    return s;
  };
  var agrupa = (c) => String(c).replace(/(.{3})(?=.)/g, "$1 ");
  function telaConta(m) {
    m.innerHTML = "";
    m.append(h("h1", null, "Conta"));
    const corpo = h("div"), msg2 = h("div", { class: "vazio", style: "padding:6px 8px 14px;min-height:34px" });
    m.append(msg2, corpo);
    const aviso2 = (t) => {
      msg2.textContent = t || "";
    };
    let parar = null;
    const limpa = () => {
      if (parar) {
        parar();
        parar = null;
      }
      corpo.innerHTML = "";
    };
    const foco = () => focus(corpo.querySelector("[data-first]") || corpo.querySelector(".f"));
    async function inicio() {
      limpa();
      aviso2("");
      const c = await cfg2();
      if (!c.sync) {
        corpo.append(h("div", { class: "vazio" }, "O servi\xE7o de contas ainda n\xE3o foi ativado nesta vers\xE3o do Drekz."));
        return;
      }
      const u = conta();
      if (u.token) {
        aviso2("Conectado como " + u.u + (u.ult ? " \xB7 \xFAltima sincroniza\xE7\xE3o " + new Date(u.ult).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""));
        corpo.append(
          h("div", { class: "vazio", style: "max-width:900px" }, 'Seus favoritos e o "Continuar assistindo" s\xE3o sincronizados com os outros aparelhos que entrarem nesta conta.'),
          btn("Sincronizar agora", async () => {
            aviso2("Sincronizando...");
            await sincroniza(true);
            inicio();
          }, 1),
          btn("Sair deste aparelho", () => {
            salva2(null);
            toast("Voc\xEA saiu da conta.");
            inicio();
          }),
          btn("Apagar minha conta", () => formulario("apagar"))
        );
      } else {
        corpo.append(
          h("div", { class: "vazio", style: "max-width:900px" }, 'Entre para levar seus favoritos e o "Continuar assistindo" para a TV, o celular e outros aparelhos. \xC9 opcional.'),
          btn("Entrar com o celular (QR code)", () => qr(), 1),
          btn("Entrar com usu\xE1rio e senha", () => formulario("entrar")),
          btn("Criar conta", () => formulario("criar")),
          btn("Esqueci a senha", () => formulario("recuperar"))
        );
      }
      foco();
    }
    async function qr() {
      limpa();
      aviso2("Gerando c\xF3digo...");
      const seg = aleat(24);
      let r;
      try {
        r = await api("/vinc/novo", { s: seg });
      } catch (e) {
        aviso2(e.message);
        corpo.append(btn("Voltar", inicio));
        foco();
        return;
      }
      const url3 = baseSite() + "conta/?c=" + r.c;
      let cv;
      try {
        cv = qrCanvas(url3, 420);
      } catch (e) {
        cv = h("div", { class: "vazio" }, "N\xE3o foi poss\xEDvel desenhar o QR code.");
      }
      cv.style.cssText = "border-radius:14px;flex:none";
      aviso2("");
      corpo.append(
        h(
          "div",
          { style: "display:flex;gap:44px;align-items:center;margin-bottom:22px" },
          cv,
          h(
            "div",
            { style: "font-size:26px;line-height:1.45;max-width:760px" },
            h("div", null, "1. Aponte a c\xE2mera do celular para o QR code."),
            h("div", null, "2. Entre (ou crie a conta) e toque em ", h("b", null, "Vincular TV"), "."),
            h("div", { style: "margin-top:16px;color:var(--mu);font-size:22px" }, "Sem c\xE2mera? Abra ", h("b", { style: "color:var(--tx)" }, url3.replace(/^https?:\/\//, "").replace(/\?.*/, "")), " e digite o c\xF3digo:"),
            h("div", { style: "font-size:56px;font-weight:800;letter-spacing:6px;margin-top:6px" }, agrupa(r.c)),
            h("div", { style: "color:var(--mu);font-size:20px;margin-top:6px" }, "O c\xF3digo vale 5 minutos.")
          )
        ),
        btn("Gerar outro c\xF3digo", qr),
        btn("Voltar", inicio)
      );
      foco();
      let vivo = true;
      parar = () => {
        vivo = false;
      };
      const t0 = Date.now();
      const volta = async () => {
        if (!vivo || !cv.isConnected) return;
        if (Date.now() - t0 > 3e5) {
          aviso2("O c\xF3digo expirou.");
          return;
        }
        try {
          const v = await api("/vinc/ver", { c: r.c, s: seg });
          if (v.st === "ok") {
            salva2({ u: v.u, token: v.token, ult: 0 });
            toast("Conectado como " + v.u, 3500);
            await sincroniza(true);
            if (vivo) inicio();
            return;
          }
          if (v.st === "expirou") {
            aviso2("O c\xF3digo expirou.");
            return;
          }
        } catch (e) {
        }
        setTimeout(volta, 3e3);
      };
      setTimeout(volta, 3e3);
    }
    function formulario(modo) {
      limpa();
      aviso2("");
      const campos = {
        entrar: [["u", "Usu\xE1rio", 0], ["p", "Senha", 1]],
        criar: [["u", "Usu\xE1rio (3 a 20: letras min\xFAsculas, n\xFAmeros . _ -)", 0], ["p", "Senha (m\xEDnimo 6)", 1], ["e", "E-mail de recupera\xE7\xE3o (opcional)", 0]],
        recuperar: [["u", "Usu\xE1rio", 0], ["r", "C\xF3digo de recupera\xE7\xE3o (12 caracteres)", 0], ["n", "Nova senha (m\xEDnimo 6)", 1]],
        apagar: [["p", "Digite sua senha para apagar a conta", 1]]
      }[modo];
      const titulo = { entrar: "Entrar", criar: "Criar conta", recuperar: "Recuperar senha", apagar: "Apagar conta" }[modo];
      const ins = {};
      let alvo = null;
      const linhas = campos.map(([k, ph, sn], i) => {
        const inp = h("input", { class: "f", type: sn ? "password" : "text", placeholder: ph, autocomplete: "off", autocapitalize: "off", spellcheck: "false", style: "width:100%;max-width:720px;font-size:26px;padding:12px 18px;border-radius:14px;border:3px solid transparent;background:var(--card);color:var(--tx);margin-bottom:12px;display:block" });
        if (i === 0) inp.setAttribute("data-first", "1");
        ins[k] = inp;
        inp.addEventListener("drekzfoco", () => {
          alvo = inp;
        });
        inp.addEventListener("click", () => {
          alvo = inp;
        });
        return inp;
      });
      alvo = linhas[0];
      let up = false;
      const kb = h("div", { class: "kb" }), teclas = "abcdefghijklmnopqrstuvwxyz0123456789._-@!#$%&*".split("").concat(["Aa", "\u232B"]);
      const desenhaKb = () => {
        kb.innerHTML = "";
        teclas.forEach((t) => kb.append(h("div", { class: "k f", onclick: () => {
          if (!alvo) return;
          if (t === "\u232B") alvo.value = alvo.value.slice(0, -1);
          else if (t === "Aa") {
            up = !up;
            desenhaKb();
            return;
          } else alvo.value += up ? t.toUpperCase() : t;
        } }, t === "Aa" || t === "\u232B" ? t : up ? t.toUpperCase() : t)));
      };
      desenhaKb();
      const enviar = async () => {
        const v = (k) => ins[k] ? ins[k].value : "";
        aviso2("Aguarde...");
        try {
          if (modo === "entrar") {
            const r = await api("/entrar", { u: v("u").trim(), p: v("p") });
            salva2({ u: r.u, token: r.token, ult: 0 });
            toast("Conectado como " + r.u, 3500);
            await sincroniza(true);
            inicio();
          } else if (modo === "criar") {
            const r = await api("/registrar", { u: v("u").trim().toLowerCase(), p: v("p"), e: v("e").trim() });
            salva2({ u: r.u, token: r.token, ult: 0 });
            codigoRec(r.recuperacao);
          } else if (modo === "recuperar") {
            const r = await api("/recuperar", { u: v("u").trim(), p: v("r"), n: v("n") });
            salva2({ u: r.u, token: r.token, ult: 0 });
            toast("Senha alterada. Conectado como " + r.u, 4e3);
            await sincroniza(true);
            inicio();
          } else if (modo === "apagar") {
            await api("/apagar", { token: conta().token, p: v("p") });
            salva2(null);
            toast("Conta apagada.");
            inicio();
          }
        } catch (e) {
          aviso2(e.message);
        }
      };
      const col = h("div", { style: "flex:none" });
      col.append(kb);
      corpo.append(h("h2", { style: "margin:0 0 12px" }, titulo), h("div", { style: "display:flex;gap:30px;align-items:flex-start" }, col, h(
        "div",
        { style: "flex:1;min-width:0" },
        ...linhas,
        btn(titulo, enviar, 1),
        btn("Cancelar", inicio),
        modo === "recuperar" ? h("div", { class: "vazio", style: "font-size:20px" }, "Perdeu o c\xF3digo tamb\xE9m? Fale com o suporte do Drekz pelo e-mail que voc\xEA cadastrou.") : null
      )));
      foco();
    }
    function codigoRec(rec) {
      limpa();
      aviso2("");
      const g = String(rec).replace(/(.{4})(?=.)/g, "$1-");
      corpo.append(
        h("div", { style: "font-size:26px;max-width:900px;line-height:1.5" }, "Conta criada! Anote seu ", h("b", null, "c\xF3digo de recupera\xE7\xE3o"), ". Ele aparece s\xF3 desta vez e serve para criar uma senha nova se voc\xEA esquecer a atual."),
        h("div", { style: "font-size:58px;font-weight:800;letter-spacing:5px;margin:22px 0" }, g),
        btn("J\xE1 anotei", () => {
          toast("Conectado como " + conta().u, 3e3);
          sincroniza(true);
          inicio();
        }, 1)
      );
      foco();
    }
    inicio();
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
  var telaAtual = () => cur && cur.nome;
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
      const pr = progress.get(it.id);
      const bg = h("div", { class: "bg", style: it.fundo ? "background-image:url('" + it.fundo + "')" : "" });
      const metaTxt = () => [it.ano, it.serie ? "S\xE9rie" : "Filme", it.genres && it.genres.join(" \xB7 "), it.nota ? "\u2605 " + it.nota.toFixed(1) : ""].filter(Boolean).join("  \xB7  ");
      const metaEl = h("div", { class: "meta" }, metaTxt()), sinEl = h("p", null, it.sinopse || "");
      const tx2 = h("div", { class: "tx" }, h("h1", null, it.title), metaEl, sinEl);
      const btns = h("div", { style: "margin-bottom:28px" });
      tx2.append(btns);
      m.append(h("div", { class: "det" }, bg, h("div", { class: "in" }, h("div", { class: "po", style: it.poster ? "background-image:url('" + it.poster + "')" : "" }), tx2)));
      detalhes(it).then(() => {
        if (!metaEl.isConnected) return;
        metaEl.textContent = metaTxt();
        sinEl.textContent = it.sinopse || "";
        if (it.fundo) bg.style.backgroundImage = "url('" + it.fundo + "')";
        const po = m.querySelector(".po");
        if (po && it.poster && !po.style.backgroundImage) po.style.backgroundImage = "url('" + it.poster + "')";
      }).catch(() => {
      });
      if (!it.serie) fontesFilme(it).catch(() => {
      });
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
        tx2.append(h("div", { class: "vazio", id: "epl" }, "Carregando epis\xF3dios..."));
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
    conectar(m) {
      telaConectar(m);
    },
    conta(m) {
      telaConta(m);
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
      const lin = (t, s, val, fn, nav) => {
        const r = h("div", { class: "row f", onclick: () => {
          fn();
          if (!nav) reabrirAj();
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
      m.append(...[
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
        contaAtiva() ? lin("Conta", 'Entre para sincronizar favoritos e "Continuar assistindo" entre TV, celular e outros aparelhos', contaEstado(), () => go("conta"), 1) : null,
        lin("Conectar celular", "Usar o celular como controle, trocar canal pelo app e sincronizar epis\xF3dios", estado(), () => go("conectar"), 1),
        lin("Relat\xF3rios de erro (Pre-Alpha)", "Envia s\xF3 dados t\xE9cnicos para eu corrigir problemas. Sem nome, IP ou o que voc\xEA assiste. ID do aparelho: " + trk.id(), trk.ligado() ? "Ligado" : "Desligado", () => {
          trk.set(!trk.ligado());
          if (trk.ligado()) envia();
        }),
        lin("Verificar atualiza\xE7\xE3o", "Procura uma vers\xE3o nova do Drekz TV 2", "", () => verificar(true)),
        window.__DREKZ ? lin("Voltar ao Drekz TV anterior (0.7.x)", "Desinstala o n\xFAcleo novo e volta ao app antigo embutido", "", () => voltarAntigo()) : null,
        h("div", { class: "vazio" }, "Drekz TV " + VERSAO)
      ].filter(Boolean));
      focus(m.querySelector(".f"));
    }
  };
  function chTile(c, lista) {
    const t = h(
      "div",
      { class: "ch f", "data-ch": c.name, onclick: () => abrirLive(lista, lista.indexOf(c)) },
      c.logo ? h("img", { src: c.logo, loading: "lazy", onerror: (e) => e.target.style.display = "none" }) : null,
      h("div", { class: "n" }, c.name, h("small", null, c.num + " \xB7 " + c.cat), h("small", { class: "ag" })),
      h("i", { class: "pg" })
    );
    pintaTile(t);
    return t;
  }
  var CAP = 60;
  async function catalogo(m, arg, serie) {
    m.append(h("h1", null, serie ? "S\xE9ries" : "Filmes"));
    aguarda(m);
    const todos = (await fichas()).filter((f) => f.serie === serie);
    m.innerHTML = "";
    m.append(h("h1", null, serie ? "S\xE9ries" : "Filmes"));
    if (!todos.length) return m.append(h("div", { class: "vazio" }, "Cat\xE1logo n\xE3o carregou. Confira a internet."));
    const cat = arg && arg.cat || "Tudo", gn = arg && arg.gen || "Todos", lt = arg && arg.letra || "";
    const re = (a) => go(serie ? "series" : "filmes", __spreadValues({ cat, gen: gn, letra: lt }, a), { push: false });
    const cats = [{ n: "Tudo" }, { n: "Animes", k: "anime", c: "#FFB454" }, { n: "Doramas", k: "dorama", c: "#FF7EB6" }, ...PROV];
    m.append(h("div", { class: "chips" }, cats.map((c) => h(
      "div",
      { class: "chip f" + (c.n === cat ? " sel" : ""), style: c.n === cat && c.c ? "background:" + c.c + ";color:#0a0612" : "", onclick: () => c.n === cat ? null : re({ cat: c.n, gen: "Todos", letra: "" }) },
      c.c && c.n !== cat ? h("span", { style: "display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:10px;background:" + c.c }) : null,
      c.n
    ))));
    const grid = h("div", { class: "grid" });
    let l = [], n = 0;
    const mais = () => {
      l.slice(n, n + CAP).forEach((it) => grid.append(card(it, () => abre(it))));
      n += CAP;
    };
    const mostra = () => {
      n = 0;
      grid.innerHTML = "";
      mais();
      if (!l.length) grid.append(h("div", { class: "vazio" }, "Nenhum t\xEDtulo encontrado nessa sele\xE7\xE3o."));
    };
    if (cat === "Tudo") {
      const gens = {};
      todos.forEach((f) => f.genres.forEach((g) => gens[g] = (gens[g] || 0) + 1));
      const topg = Object.keys(gens).sort((a, b) => gens[b] - gens[a]).slice(0, 14);
      m.append(
        h("div", { class: "chips" }, ["Todos", ...topg].map((g) => h("div", { class: "chip f" + (g === gn ? " sel" : ""), onclick: () => re({ gen: g }) }, g))),
        h("div", { class: "chips" }, ["", ..."#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")].map((x) => h("div", { class: "chip f" + (x === lt ? " sel" : ""), onclick: () => re({ letra: x }) }, x || "A\u2013Z")))
      );
      l = todos;
      if (gn !== "Todos") l = l.filter((f) => f.genres.includes(gn));
      if (lt) l = l.filter((f) => f.letra === lt);
      l = l.slice().sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
      m.append(grid);
      mostra();
    } else {
      const c = cats.find((x) => x.n === cat);
      m.append(grid);
      grid.append(h("div", { class: "vazio" }, "Buscando " + cat + "..."));
      (c.k ? porTipo(c.k, serie) : porProvedor(c, serie)).then((r) => {
        if (!grid.isConnected) return;
        l = r;
        mostra();
      }).catch(() => {
        grid.innerHTML = "";
        grid.append(h("div", { class: "vazio" }, "N\xE3o consegui carregar agora."));
      });
    }
    m.addEventListener("scroll", () => {
      if (n < l.length && m.scrollTop + m.clientHeight > m.scrollHeight - 600) mais();
    });
    new MutationObserver(() => {
      const on = document.querySelector(".card.f.on");
      if (on && n < l.length && [...grid.children].indexOf(on) > n - 12) mais();
    }).observe(grid, { subtree: true, attributes: true, attributeFilter: ["class"] });
    focus(m.querySelector(".chip.sel"));
  }

  // src/style.css
  var style_default = ':root{--bg:#0b0d12;--bg2:#141821;--card:#1b2030;--tx:#eef1f6;--mu:#9aa3b5;--ac:#7c5cff;--ac2:#2ee6a6;--rd:#ff5d6c}\n*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}\nhtml,body{height:100%;overflow:hidden;background:#000;color:var(--tx);font-family:"Segoe UI",Roboto,Arial,sans-serif}\n#app{position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0;overflow:hidden;background:var(--bg)}\nhtml.exo #app,html.exo body{background:transparent}\n#vl{position:absolute;inset:0;background:#000;display:none}#vl video{width:100%;height:100%;object-fit:contain;background:#000}\nhtml.assistindo #vl{display:block}html.assistindo #ui{display:none}html.exo.assistindo #vl{background:transparent}html.exo.assistindo #vl video{visibility:hidden}\n#ui{position:absolute;inset:0;display:flex}\n#rail{width:110px;background:var(--bg2);display:flex;flex-direction:column;align-items:center;padding:36px 0;gap:10px;flex:none}\n#rail .logo{font-weight:800;font-size:22px;color:var(--ac);margin-bottom:24px;letter-spacing:1px}\n.nb{width:86px;height:86px;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--mu);font-size:15px;cursor:pointer;border:3px solid transparent}\n.nb svg{width:34px;height:34px;fill:currentColor}.nb.sel{color:var(--tx);background:#222a3e}\n#main{flex:1;min-width:0;height:100%;overflow-y:auto;overflow-x:hidden;padding:40px 56px 80px;scrollbar-width:none}\n#main::-webkit-scrollbar{display:none}\nh1{font-size:44px;font-weight:700;margin-bottom:26px}h2{font-size:30px;font-weight:600;margin:30px 0 16px}\n.f{outline:none;border:3px solid transparent;transition:transform .12s,border-color .12s,background .12s}\n.f.on{border-color:var(--ac2);transform:scale(1.05)}\n.rail{display:flex;gap:22px;overflow-x:auto;padding:10px 8px 14px;margin:0 -8px;scrollbar-width:none}.rail::-webkit-scrollbar{display:none}\n.card{flex:none;width:210px;cursor:pointer;border-radius:14px;background:var(--card);overflow:hidden}\n.card .pi{width:100%;height:315px;background:#222 center/cover no-repeat}\n.card .ti{font-size:17px;padding:10px 10px 12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.card .bar{height:6px;background:#333}.card .bar i{display:block;height:100%;background:var(--ac2)}\n.grid{display:grid;grid-template-columns:repeat(auto-fill,210px);gap:26px 22px;padding:8px}\n.chips{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:18px}\n.chip{padding:10px 22px;border-radius:30px;background:var(--card);font-size:19px;cursor:pointer;color:var(--mu)}\n.chip.sel{background:var(--ac);color:#fff}\n.chs{display:grid;grid-template-columns:repeat(auto-fill,300px);gap:20px;padding:8px}\n.ch{height:112px;background:var(--card);border-radius:16px;display:flex;align-items:center;gap:16px;padding:0 18px;cursor:pointer;overflow:hidden}\n.ch{position:relative}.ch .n{min-width:0;flex:1}.ch small.ag{color:#d9ccff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ch small.ag:empty{display:none}.ch .pg{position:absolute;left:0;bottom:0;height:5px;background:var(--ac2);border-radius:0 3px 3px 0;width:0}\n.ch img{width:76px;height:76px;object-fit:contain;flex:none}.ch .n{font-size:20px;line-height:1.2}.ch small{color:var(--mu);font-size:15px;display:block;margin-top:4px}\n.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 34px;border-radius:14px;background:var(--card);font-size:22px;cursor:pointer;margin-right:14px;min-width:70px}\n.btn.pri{background:var(--ac);color:#fff}\n.det{position:relative;min-height:880px}.det .bg{position:absolute;inset:-40px -56px;background:center/cover;opacity:.25}\n.det .in{position:relative;display:flex;gap:44px}.det .po{width:340px;height:510px;border-radius:16px;background:#222 center/cover;flex:none}\n.det .tx{flex:1;min-width:0}.det h1{margin-bottom:10px}.det .meta{color:var(--mu);font-size:22px;margin-bottom:18px}.det p{font-size:22px;line-height:1.45;max-width:1000px;margin-bottom:26px;color:#d6dbe8}\n.eps{display:grid;grid-template-columns:repeat(auto-fill,150px);gap:14px;margin-top:10px}.ep{padding:16px 0;text-align:center;background:var(--card);border-radius:12px;font-size:21px;cursor:pointer;position:relative;overflow:hidden}\n.ep.vis{color:var(--ac2)}.ep .bar{position:absolute;left:0;bottom:0;height:5px;background:var(--ac2)}\n.kb{display:grid;grid-template-columns:repeat(7,62px);gap:8px;margin-right:36px}.kb .k{height:62px;background:var(--card);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer}\n.sb{display:flex;gap:30px;align-items:flex-start}.sb input{width:100%;font-size:30px;padding:14px 20px;border-radius:14px;border:3px solid transparent;background:var(--card);color:var(--tx);margin-bottom:20px}\n.row{display:flex;justify-content:space-between;align-items:center;padding:22px 26px;margin-bottom:12px;background:var(--card);border-radius:14px;font-size:24px;cursor:pointer;max-width:900px}.row small{color:var(--mu);font-size:18px;display:block;margin-top:4px}.row b{color:var(--ac2)}\n#pl{position:absolute;inset:0;display:none;z-index:20}html.assistindo #pl{display:block}\n#pl .top{position:absolute;left:0;right:0;top:0;padding:34px 50px 90px;background:linear-gradient(#000c,#0000);font-size:34px;font-weight:600;opacity:0;transition:opacity .2s}\n#pl .bot{position:absolute;left:0;right:0;bottom:0;padding:90px 60px 40px;background:linear-gradient(#0000,#000d);opacity:0;transition:opacity .2s}\n#pl.osd .top,#pl.osd .bot{opacity:1}\n#pl .ag2 .a1{font-size:26px;font-weight:600;margin-top:8px;color:#fff}#pl .ag2 .a2{font-size:21px;font-weight:400;color:#ccd;margin-top:2px}\n#pl .pb{height:8px;background:#fff3;border-radius:4px;margin-bottom:10px}#pl .pb i{display:block;height:100%;background:var(--ac2);border-radius:4px;width:0}\n#pl .tm{display:flex;justify-content:space-between;font-size:22px;color:#ccd;margin-bottom:18px}\n#pl .ctl{display:flex;gap:12px;flex-wrap:wrap}#pl .ctl .btn{background:#ffffff22;padding:14px 26px;font-size:22px}\n#pl .sp{position:absolute;left:50%;top:50%;width:70px;height:70px;margin:-35px;border:6px solid #fff4;border-top-color:#fff;border-radius:50%;animation:sp 1s linear infinite;display:none}\n#pl.buf .sp{display:block}@keyframes sp{to{transform:rotate(360deg)}}\n#gv{position:absolute;left:0;top:0;bottom:0;width:560px;background:#0b0d12ee;padding:26px;overflow-y:auto;display:none;scrollbar-width:none}#gv.on2{display:block}\n#gv .ch{width:100%;margin-bottom:12px;height:90px}#gv .ch img{width:56px;height:56px}\n#toast{position:absolute;left:50%;bottom:90px;transform:translateX(-50%);background:#000c;border:2px solid #fff3;padding:16px 34px;border-radius:30px;font-size:24px;z-index:99;display:none}\n#modal{position:absolute;inset:0;background:#000b;z-index:50;display:none;align-items:center;justify-content:center}\n#modal .box{background:var(--bg2);border-radius:22px;padding:34px 40px;min-width:620px;max-width:1100px;max-height:900px;overflow-y:auto}\n#modal h3{font-size:32px;margin-bottom:20px}#modal .row{max-width:none}\n.vazio{color:var(--mu);font-size:24px;padding:30px 8px}\n\nhtml.nat.assistindo,html.nat.assistindo body,html.nat.assistindo #app,html.nat.assistindo #vl{background:transparent!important}\nhtml.nat.assistindo #vl video{visibility:hidden}\n';

  // src/main.js
  function escala() {
    const app = $("#app");
    if (document.getElementById("drk-fill")) {
      app.style.transform = "none";
      app.style.left = "0";
      app.style.top = "0";
      app.style.height = "1080px";
      document.documentElement.style.height = "1080px";
      document.body.style.height = "1080px";
      return;
    }
    const w = innerWidth, hh = innerHeight, fill = /[?&]fill=1/.test(location.search);
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
    try {
      const t = window.tizen && window.tizen.tvinputdevice;
      t && t.registerKeyBatch(["MediaPlay", "MediaPause", "MediaPlayPause", "MediaStop", "MediaFastForward", "MediaRewind", "ChannelUp", "ChannelDown", "Info", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    } catch (e) {
    }
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
    window.__drekz = { go, pl: initWatch.pl, tela: telaAtual, vol: volume };
    sincNativo();
    iniciarConnect();
    try {
      localStorage.setItem("drekz_boot", JSON.stringify({ build: window.__DREKZ && window.__DREKZ.build || 1, tries: 0 }));
    } catch (e) {
    }
    iniciarUpd();
    iniciarTrack();
    iniciaGuia();
    iniciaConta();
    if (trk.ligado() === null) setTimeout(() => modal("Ajude a melhorar o Drekz TV", [
      { t: "Permitir relat\xF3rios de erro", s: "Envia s\xF3 dados t\xE9cnicos (modelo da TV, vers\xE3o, erros de canal). Sem nome, sem IP e sem o que voc\xEA assiste. D\xE1 para desligar em Ajustes.", fn: () => {
        trk.set(true);
      } },
      { t: "N\xE3o permitir", s: "O app funciona igual, nada \xE9 enviado.", fn: () => {
        trk.set(false);
      } }
    ]), 1800);
  }
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", boot) : boot();
})();
