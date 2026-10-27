/* ГК «МТУ» — общий слой: адаптив, действия кнопок, квиз-подбор, заявки, история переходов, мобильное меню */
(function () {
  if (window.MTUUI) return;
  var BOT = "https://t.me/gkmtu_bot", WA = "https://wa.me/79167656565", TEL = "tel:+79167656565";
  var RED = "#FF3B30", GOLD = "#E3A93B", INK = "#22262C";
  var U = window.MTUUI = { nav: null, onPage: null, hist: [], silent: false, homeY: 0 };

  /* ---------- CSS ---------- */
  var css = [
    "html{-webkit-text-size-adjust:100%}body{overflow-x:hidden}",
    "img,video,canvas{max-width:100%}",
    "a,button{-webkit-tap-highlight-color:transparent}",
    "a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #E3A93B;outline-offset:2px}",
    "[data-burger],[data-back]{display:none}",
    /* большие мониторы: масштабируем страницу целиком */
    "@media (min-width:1500px){body{zoom:1.1}}",
    "@media (min-width:1800px){body{zoom:1.25}}",
    "@media (min-width:2300px){body{zoom:1.6}}",
    "@media (min-width:3000px){body{zoom:2.1}}",
    /* планшет / узкий ноутбук */
    "@media (max-width:1280px){nav{padding:12px 16px!important;gap:12px!important}nav>div:nth-child(2){gap:12px!important}nav>div:nth-child(2) button,nav>div:nth-child(2)>a{font-size:13px!important}nav a[href^='https://wa.me']{display:none!important}nav>a:first-child span{display:none}}",
    "@media (max-width:1000px){nav [data-nav-links]{display:none!important}[data-burger]{display:inline-flex!important}}",
    "@media (max-width:900px){",
    " section [style*='grid-template-columns']:not([data-keep]):not([data-tbl] *){grid-template-columns:minmax(0,1fr)!important}",
    " section [style*='repeat(3']:not([data-tbl] *),section [style*='repeat(4']:not([data-tbl] *){grid-template-columns:repeat(2,minmax(0,1fr))!important}",
    " section,footer>div{padding-left:18px!important;padding-right:18px!important}",
    " h1{font-size:clamp(28px,7.4vw,44px)!important;line-height:1.16!important}",
    " h2{font-size:clamp(25px,6.4vw,36px)!important;line-height:1.18!important}",
    " [style*='padding: 52px'],[style*='padding: 56px'],[style*='padding: 40px']{padding:24px!important}",
    " [data-hero-media]{min-height:300px!important}",
    "}",
    "@media (max-width:600px){",
    " section [style*='repeat(3']:not([data-tbl] *),section [style*='repeat(4']:not([data-tbl] *){grid-template-columns:minmax(0,1fr)!important}",
    " nav{padding:10px 14px!important;gap:10px!important}",
    " nav a[href^='https://wa.me']{display:none!important}",
    " nav a[href^='tel:']{padding:9px 12px!important;font-size:13px!important}",
    " nav>a:first-child span{font-size:14px!important}",
    " [style*='font-size: 19px'],[style*='font-size: 20px']{font-size:17px!important}",
    " a[style*='padding: 14px 14px 14px 26px'],a[style*='padding: 12px 12px 12px 24px'],a[style*='padding: 15px 15px 15px 28px']{width:100%;box-sizing:border-box;justify-content:space-between}",
    " [data-float-cta]{display:none!important}",
    "}",
    "@media (max-width:420px){h1{font-size:27px!important}h2{font-size:24px!important}}",
    /* модальные окна */
    ".mtu-ov{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(14,16,19,.82);backdrop-filter:blur(8px);overflow-y:auto}",
    ".mtu-md{position:relative;width:100%;max-width:640px;max-height:calc(100vh - 32px);overflow-y:auto;box-sizing:border-box;padding:32px;border-radius:10px;background:#2B2F36;border:1px solid rgba(255,255,255,.16);box-shadow:0 30px 80px rgba(0,0,0,.6);color:#fff;font-family:'IBM Plex Sans',sans-serif}",
    ".mtu-md h3{margin:0 0 8px;font-size:26px;font-weight:600;letter-spacing:-.02em;line-height:1.2;color:#fff}",
    ".mtu-md p{margin:0 0 16px;font-size:16px;line-height:1.6;color:rgba(255,255,255,.75)}",
    ".mtu-x{position:absolute;top:12px;right:12px;width:44px;height:44px;border-radius:6px;background:transparent;border:0;color:#fff;font-size:26px;cursor:pointer}",
    ".mtu-x:hover{background:rgba(255,255,255,.1)}",
    ".mtu-opt{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:52px;box-sizing:border-box;padding:12px 16px;margin:0 0 10px;border-radius:6px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);color:#fff;font:500 16px 'IBM Plex Sans',sans-serif;text-align:left;cursor:pointer;transition:background .15s,border-color .15s}",
    ".mtu-opt:hover{background:rgba(227,169,59,.16);border-color:rgba(227,169,59,.7)}",
    ".mtu-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:52px;box-sizing:border-box;padding:12px 22px;border-radius:6px;border:0;background:#E3A93B;color:#22262C;font:600 17px 'IBM Plex Sans',sans-serif;cursor:pointer;text-decoration:none;transition:transform .15s,box-shadow .15s}",
    ".mtu-btn:hover{transform:translateY(-1px);box-shadow:0 10px 26px rgba(227,169,59,.4);color:#22262C}",
    ".mtu-btn.sec{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.22);color:#fff}",
    ".mtu-btn.sec:hover{background:rgba(255,255,255,.15);color:#fff;box-shadow:none}",
    ".mtu-btn:not(.sec){position:relative;overflow:hidden;gap:26px;padding:14px 0 14px 28px;box-shadow:0 14px 28px -12px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.28)}",
    ".mtu-btn:not(.sec)::after{content:'';align-self:stretch;width:84px;margin:-14px 0;background:linear-gradient(180deg,#3E434B,#1B1E23);clip-path:polygon(0 0,62% 0,100% 50%,62% 100%,0 100%,34% 50%);transition:transform .22s ease}",
    ".mtu-btn:not(.sec):hover::after{transform:translateX(8px)}",
    ".mtu-in{width:100%;box-sizing:border-box;min-height:52px;padding:13px 16px;margin:0 0 12px;border-radius:6px;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.2);color:#fff;font:400 16px 'IBM Plex Sans',sans-serif}",
    ".mtu-in:focus{border-color:#E3A93B;outline:none}",
    ".mtu-red{color:#FF3B30;font-weight:700}",
    ".mtu-steps{display:flex;gap:6px;margin:0 0 20px}.mtu-steps i{flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,.16)}.mtu-steps i.on{background:#E3A93B}",
    ".mtu-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px}",
    ".mtu-row>*{flex:1 1 220px}",
    ".mtu-res{padding:18px;margin:0 0 16px;border-radius:8px;background:rgba(227,169,59,.12);border:1px solid rgba(227,169,59,.5)}",
    ".mtu-res b{display:block;font-size:26px;font-weight:600;color:#E3A93B;margin:2px 0 6px}",
    ".mtu-menu{position:fixed;inset:0;z-index:1500;background:rgba(20,23,27,.97);backdrop-filter:blur(18px);overflow-y:auto;padding:76px 20px 32px;color:#fff;font-family:'IBM Plex Sans',sans-serif}",
    ".mtu-menu h4{margin:22px 0 8px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#E3A93B;font-weight:500}",
    ".mtu-menu button.i{display:block;width:100%;min-height:44px;padding:10px 4px;background:transparent;border:0;border-bottom:1px solid rgba(255,255,255,.08);color:#fff;font:500 17px 'IBM Plex Sans',sans-serif;text-align:left;cursor:pointer}"
  ].join("\n");
  var st = document.createElement("style"); st.id = "mtu-enhance-css"; st.textContent = css; document.head.appendChild(st);

  /* ---------- утилиты DOM ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  var rub = function (n) { return n.toLocaleString("ru-RU").replace(/\u00A0/g, " ") + " ₽"; };
  var overlay = null, lastFocus = null;
  function close() {
    if (overlay) { overlay.remove(); overlay = null; document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {} }
  }
  function onKey(e) { if (e.key === "Escape") close(); }
  function open(build) {
    if (!overlay) {
      lastFocus = document.activeElement;
      overlay = el("div", { class: "mtu-ov", role: "dialog", "aria-modal": "true" });
      overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) close(); });
      document.body.appendChild(overlay); document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onKey);
    }
    overlay.innerHTML = "";
    var box = el("div", { class: "mtu-md" });
    box.appendChild(el("button", { class: "mtu-x", type: "button", "aria-label": "Закрыть", onclick: close }, ["×"]));
    build(box);
    overlay.appendChild(box);
    var f = box.querySelector("input,button.mtu-opt,a.mtu-btn,button.mtu-btn"); if (f) try { f.focus({ preventScroll: true }); } catch (e) {}
  }

  /* ---------- отправка заявок ---------- */
  function send(kind, data) {
    var rec = Object.assign({ kind: kind, at: new Date().toISOString(), page: (U.cur || location.hash || "home") }, data);
    try { var a = JSON.parse(localStorage.getItem("mtu_leads") || "[]"); a.push(rec); localStorage.setItem("mtu_leads", JSON.stringify(a)); } catch (e) {}
    if (window.MTU_LEAD_ENDPOINT) { try { fetch(window.MTU_LEAD_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rec) }); } catch (e) {} }
  }
  function thanks(title, note) {
    open(function (b) {
      b.appendChild(el("h3", null, [title]));
      b.appendChild(el("p", { html: note }));
      b.appendChild(el("div", { class: "mtu-row" }, [
        el("a", { class: "mtu-btn", href: BOT, target: "_blank", rel: "noopener" }, ["Продолжить в Telegram-боте"]),
        el("button", { class: "mtu-btn sec", type: "button", onclick: close }, ["Закрыть"])
      ]));
    });
  }
  var RESP = '<span class="mtu-red">Ответим в течение 10 минут</span>';

  /* ---------- форма контакта (общая) ---------- */
  function contactForm(box, opts) {
    var name = el("input", { class: "mtu-in", type: "text", placeholder: "Имя", autocomplete: "name" });
    var contact = el("input", { class: "mtu-in", type: "text", placeholder: opts.contactPh || "Телефон или @telegram", autocomplete: "tel", inputmode: "text" });
    var how = el("select", { class: "mtu-in" }, [
      el("option", { value: "call" }, ["Удобно: позвоните мне"]),
      el("option", { value: "msg" }, ["Удобно: напишите в мессенджер"]),
      el("option", { value: "mail" }, ["Удобно: только письменно"])
    ]);
    var err = el("p", { style: "color:#FF6B60;margin:0 0 10px;min-height:0" });
    var go = el("button", { class: "mtu-btn", type: "button" }, [opts.submit || "Отправить заявку"]);
    go.addEventListener("click", function () {
      var c = contact.value.trim();
      if (c.replace(/[^\d@a-zA-Zа-яА-Я]/g, "").length < 5) { err.textContent = "Укажите телефон, e-mail или @telegram — чтобы мы могли ответить."; contact.focus(); return; }
      send(opts.kind, Object.assign({ name: name.value.trim(), contact: c, how: how.value }, opts.payload || {}));
      thanks("Заявка принята", opts.thanks || ("Инженер МТУ свяжется с вами. " + RESP));
    });
    box.appendChild(name); box.appendChild(contact); if (!opts.noHow) box.appendChild(how); box.appendChild(err);
    box.appendChild(el("div", { class: "mtu-row" }, [go]));
    box.appendChild(el("p", { style: "margin:14px 0 0;font-size:13px;color:rgba(255,255,255,.5)" }, ["Нажимая кнопку, вы соглашаетесь на обработку контактных данных для ответа на заявку."]));
  }

  /* ---------- квиз-подбор: 3 вопроса ---------- */
  var OBJ = [
    ["Частный дом, дача, баня","house","частного дома"],
    ["Коттеджный посёлок","village","коттеджного посёлка"],
    ["Магазин, офис, автосервис","shop","магазина, офиса или автосервиса"],
    ["Застройщик, ЖК, многоквартирный дом","developer","многоквартирного дома"],
    ["Школа, больница, соцобъект","soc","социального объекта"],
    ["Склад, логистика","warehouse","склада"],
    ["Производство, промышленность","prod","производства"],
    ["Теплица, агрокомплекс","green","теплицы"],
    ["Стройплощадка, прогрев бетона","build","стройплощадки"]
  ];
  var AREA = [["до 150 м²", 150], ["150–400 м²", 400], ["400–1 200 м²", 1200], ["1 200–2 700 м²", 2700], ["2 700–5 000 м²", 5000], ["больше 5 000 м²", 9000]];
  var GAS = [["Магистральный газ уже есть", "main"], ["Нет — будет газгольдер", "tank"], ["Пока не знаю", "unk"]];
  var GVS = [["Да, нужна горячая вода", "y"], ["Нет, только отопление", "n"], ["Не знаю", "u"]];
  var TIERS = [
    [400, "МТУ 10–40 кВт", "до 400 м²", 301162, "model-40"],
    [500, "МТУ 40–50 кВт", "до 500 м²", 668326, ""],
    [1200, "МТУ 60–120 кВт", "до 1 200 м²", 857980, "mtu-40-120"],
    [1800, "МТУ 150–180 кВт", "до 1 800 м²", 1683060, ""],
    [2700, "МТУ 210–270 кВт", "до 2 700 м²", 1936542, ""],
    [5000, "МТУ 300–350 кВт", "до 5 000 м²", 2689785, ""]
  ];
  function calc(a) {
    var area = AREA[a[1]][1], t;
    if (area > 5000) t = { name: "Каскад из двух МТУ 300–350 кВт", cover: "от 5 000 м²", from: TIERS[5][3] * 2, cascade: true };
    else { var r = TIERS.filter(function (x) { return area <= x[0]; })[0] || TIERS[5]; t = { name: r[1], cover: r[2], from: r[3], key: r[4] }; }
    return t;
  }
  function quiz(pre) {
    var a = pre || [];
    function stepsBar(n) { var d = el("div", { class: "mtu-steps" }); for (var i = 0; i < 3; i++) d.appendChild(el("i", { class: i <= n ? "on" : "" })); return d; }
    function ask(n, title, list) {
      open(function (b) {
        b.appendChild(stepsBar(n));
        b.appendChild(el("p", { style: "margin:0 0 6px;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.5)" }, ["Вопрос " + (n + 1) + " из 3"]));
        b.appendChild(el("h3", { style: "margin-bottom:18px" }, [title]));
        list.forEach(function (o, i) {
          b.appendChild(el("button", { class: "mtu-opt", type: "button", onclick: function () { a[n] = i; n < 2 ? next(n + 1) : result(); } }, [el("span", null, [o[0]]), el("span", { style: "color:#E3A93B" }, ["→"])]));
        });
        if (n > 0) b.appendChild(el("button", { class: "mtu-btn sec", type: "button", style: "min-height:44px;margin-top:6px", onclick: function () { next(n - 1); } }, ["← Назад"]));
      });
    }
    function next(n) {
      if (n === 0) ask(0, "Что нужно отапливать?", OBJ);
      if (n === 1) ask(1, "Какая площадь объекта?", AREA);
      if (n === 2) ask(2, "Есть ли на участке магистральный газ?", GAS);
    }
    function result() {
      var t = calc(a), obj = OBJ[a[0]][2], gas = GAS[a[2]][1];
      var gasTxt = gas === "main" ? "Работает от магистрального газа." : gas === "tank" ? "Работает от газгольдера (СОГ) — магистраль не нужна." : "Газ: магистральный или газгольдер — инженер подскажет, что выгоднее на вашем участке.";
      var summary = OBJ[a[0]][0] + "; " + AREA[a[1]][0] + "; газ: " + GAS[a[2]][0] + "; результат: " + t.name;
      open(function (b) {
        b.appendChild(stepsBar(2));
        b.appendChild(el("h3", null, ["Вам нужна МТУ для " + obj]));
        b.appendChild(el("div", { class: "mtu-res" }, [
          el("span", { style: "font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.6)" }, ["Подойдёт"]),
          el("b", null, [t.name]),
          el("span", { style: "font-size:16px;line-height:1.55;color:rgba(255,255,255,.9)" }, ["Ориентир по цене: от " + rub(t.from) + " — базовая установка без монтажа и опций. " + gasTxt])
        ]));
        b.appendChild(el("p", { style: "font-size:14px" }, ["Установка ставится снаружи здания: отдельное помещение не нужно — в отличие от блочно-модульной котельной (БМК). Точную мощность и цену с монтажом подтвердит инженер."]));
        b.appendChild(el("div", { class: "mtu-row" }, [
          el("button", { class: "mtu-btn", type: "button", onclick: function () { lead(summary); } }, ["Оставить заявку на подбор от инженера"]),
          el("a", { class: "mtu-btn sec", href: BOT + "?start=quiz_" + a.join(""), target: "_blank", rel: "noopener", onclick: function () { send("quiz-bot", { summary: summary }); } }, ["Получить больше информации в Telegram-боте"])
        ]));
        b.appendChild(el("button", { class: "mtu-btn sec", type: "button", style: "min-height:44px;margin-top:12px", onclick: function () { a = []; next(0); } }, ["Пройти заново"]));
      });
    }
    function lead(summary) {
      open(function (b) {
        b.appendChild(el("h3", null, ["Заявка на подбор от инженера"]));
        b.appendChild(el("p", { html: "Ваши ответы уже приложены. Оставьте, как с вами связаться. " + RESP }));
        contactForm(b, { kind: "quiz-lead", payload: { summary: summary } });
      });
    }
    next(pre && pre.length === 4 ? 0 : 0);
  }

  /* ---------- заявка на звонок / вопрос инженеру ---------- */
  function callback(title) {
    open(function (b) {
      b.appendChild(el("h3", null, [title || "Задать вопрос инженеру МТУ"]));
      b.appendChild(el("p", { html: "Оставьте контакт и коротко опишите задачу — необязательно. " + RESP }));
      var q = el("textarea", { class: "mtu-in", rows: "3", placeholder: "Что нужно отапливать, какая площадь (по желанию)", style: "min-height:88px;resize:vertical" });
      b.appendChild(q);
      contactForm(b, { kind: "callback", payload: { title: title || "" }, submit: "Отправить" });
      var orig = b.querySelector(".mtu-btn");
      var prev = orig.onclick; // текст задачи добавляется в заявку
      orig.addEventListener("click", function () { try { var a = JSON.parse(localStorage.getItem("mtu_leads") || "[]"); if (a.length) { a[a.length - 1].task = q.value; localStorage.setItem("mtu_leads", JSON.stringify(a)); } } catch (e) {} }, true);
      b.appendChild(el("div", { class: "mtu-row", style: "margin-top:14px" }, [
        el("a", { class: "mtu-btn sec", href: TEL }, ["Позвонить сейчас"]),
        el("a", { class: "mtu-btn sec", href: WA, target: "_blank", rel: "noopener" }, ["WhatsApp"]),
        el("a", { class: "mtu-btn sec", href: BOT, target: "_blank", rel: "noopener" }, ["Telegram-бот"])
      ]));
    });
  }

  /* ---------- скачивание документа ---------- */
  window.MTU_FILES = window.MTU_FILES || []; /* [{ re: /паспорт/i, href: "assets/passport.pdf" }] — подключить, когда будут файлы */
  function download(label) {
    var f = window.MTU_FILES.filter(function (x) { return x.re.test(label); })[0];
    if (f) { window.open(f.href, "_blank"); return; }
    open(function (b) {
      b.appendChild(el("h3", null, [label.replace(/\s*\(PDF\)\s*/i, " ").trim()]));
      b.appendChild(el("p", { html: 'Файл ещё готовится к публикации. Оставьте e-mail или Telegram — пришлём сразу, как загрузим. <span class="mtu-red">[нужен PDF-файл]</span>' }));
      contactForm(b, { kind: "download", payload: { doc: label }, contactPh: "E-mail или @telegram", noHow: true, submit: "Прислать файл", thanks: "Отправим файл на указанный контакт, как только он будет опубликован." });
    });
  }

  /* ---------- маршрутизация ---------- */
  function parseHash() { var m = /^#\/(.+)$/.exec(location.hash || ""); return m ? decodeURIComponent(m[1]) : ""; }
  U.push = function (key) {
    if (U.silent) { U.silent = false; U.cur = key; render(); return; }
    if (U.cur === key) return;
    U.cur = key; U.hist.push(key);
    try { history.pushState({ mtu: key }, "", "#/" + encodeURIComponent(key)); } catch (e) {}
    if (U.onPage) U.onPage(key);
    render();
  };
  U.reset = function () { U.hist = []; U.cur = ""; try { history.replaceState({}, "", location.pathname + location.search); } catch (e) {} render(); };
  U.go = function (key) { closeMenu(); if (U.nav) U.nav(key); };
  U.back = function () {
    closeMenu();
    if (U.hist.length > 1) { U.hist.pop(); var k = U.hist[U.hist.length - 1]; U.silent = true; U.cur = k; if (U.nav) U.nav(k, true); setTimeout(function () { U.silent = false; }, 400); }
    else { U.hist = []; U.cur = ""; U.silent = true; if (U.nav) U.nav("", true); setTimeout(function () { U.silent = false; }, 400); }
    try { history.replaceState({}, "", U.cur ? "#/" + encodeURIComponent(U.cur) : location.pathname + location.search); } catch (e) {}
    render();
  };
  window.addEventListener("popstate", function () {
    var k = parseHash(); if (k === U.cur) return;
    if (!k) U.hist = []; else if (U.hist[U.hist.length - 1] !== k) U.hist.push(k);
    U.silent = true; U.cur = k; if (U.nav) U.nav(k, true); setTimeout(function () { U.silent = false; }, 400); render();
  });
  U.initial = parseHash;

  /* ---------- мобильное меню, кнопка «Назад» ---------- */
  var menuEl = null;
  function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; document.body.style.overflow = ""; } }
  function openMenu() {
    if (menuEl) return closeMenu();
    var pages = window.MTU_PAGES || [], groups = [];
    pages.forEach(function (p) { if (p.key === "case") return; var g = groups.filter(function (x) { return x.t === p.group; })[0]; if (!g) { g = { t: p.group, i: [] }; groups.push(g); } g.i.push(p); });
    menuEl = el("div", { class: "mtu-menu" });
    menuEl.appendChild(el("button", { class: "mtu-x", type: "button", style: "position:fixed;top:12px;right:12px", "aria-label": "Закрыть меню", onclick: closeMenu }, ["×"]));
    menuEl.appendChild(el("button", { class: "i", type: "button", onclick: function () { closeMenu(); if (U.nav) U.nav("", false, true); } }, ["Главная"]));
    groups.forEach(function (g) {
      menuEl.appendChild(el("h4", null, [g.t]));
      g.i.forEach(function (p) { menuEl.appendChild(el("button", { class: "i", type: "button", onclick: function () { U.go(p.key); } }, [p.crumb || p.nav])); });
    });
    menuEl.appendChild(el("div", { class: "mtu-row", style: "margin-top:24px" }, [
      el("a", { class: "mtu-btn", href: TEL }, ["+7 (916) 765-65-65"]),
      el("button", { class: "mtu-btn sec", type: "button", onclick: function () { closeMenu(); callback(); } }, ["Задать вопрос инженеру"])
    ]));
    document.body.appendChild(menuEl); document.body.style.overflow = "hidden";
  }
  function footerForms() {
    document.querySelectorAll("footer").forEach(function (f) {
      if (f.parentNode.querySelector(":scope > [data-mtu-form]") || f.closest("[data-mtu-form]")) return;
      var sec = el("section", { "data-mtu-form": "1", style: "position:relative;max-width:1180px;margin:0 auto;padding:40px 24px 72px;box-sizing:border-box" });
      var box = el("div", { style: "max-width:640px;margin:0 auto;padding:36px;border-radius:8px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);box-shadow:0 1px 2px rgba(0,0,0,.25),0 10px 28px -10px rgba(0,0,0,.4);color:#fff;font-family:'IBM Plex Sans',sans-serif" });
      box.appendChild(el("h3", { style: "margin:0 0 8px;font-size:28px;font-weight:600;letter-spacing:-.02em;color:#fff" }, ["Остались вопросы? Напишите нам"]));
      box.appendChild(el("p", { html: "Оставьте контакт и коротко опишите задачу — необязательно. " + RESP, style: "margin:0 0 18px;font-size:16px;line-height:1.6;color:rgba(255,255,255,.75)" }));
      var q = el("textarea", { class: "mtu-in", rows: "3", placeholder: "Что нужно отапливать, какая площадь (по желанию)", style: "min-height:88px;resize:vertical" });
      box.appendChild(q);
      contactForm(box, { kind: "footer-form", payload: {}, submit: "Отправить заявку" });
      sec.appendChild(box);
      f.parentNode.insertBefore(sec, f);
    });
  }
  function render() {
    footerForms();
    var navs = document.querySelectorAll("nav");
    navs.forEach(function (n) {
      if (n.closest && n.closest(".mtu-menu")) return;
      if (!n.querySelector("[data-burger]")) {
        n.appendChild(el("button", { "data-burger": "1", type: "button", "aria-label": "Меню", style: "align-items:center;justify-content:center;width:44px;height:44px;border-radius:6px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);color:#fff;cursor:pointer;flex-shrink:0", onclick: openMenu, html: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>' }));
      }
      var b = n.querySelector("[data-back]");
      if (!b) {
        b = el("button", { "data-back": "1", type: "button", style: "align-items:center;gap:6px;min-height:40px;padding:8px 14px;border-radius:4px;background:transparent;border:none;color:#fff;font:500 14px 'IBM Plex Sans',sans-serif;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background 150ms ease", onclick: U.back, onmouseenter: function () { this.style.background = 'rgba(227,169,59,0.16)'; }, onmouseleave: function () { this.style.background = 'transparent'; }, html: "← Назад" });
        var logo = n.querySelector("a"); if (logo && logo.nextSibling) n.insertBefore(b, logo.nextSibling); else n.appendChild(b);
      }
      b.style.display = (U.hist.length > 0) ? "inline-flex" : "none";
    });
  }
  U.render = render;
  new MutationObserver(function () { if (!U._t) U._t = setTimeout(function () { U._t = 0; render(); }, 80); }).observe(document.documentElement, { childList: true, subtree: true });

  /* ---------- делегирование кликов по кнопкам ---------- */
  var DL = /скачать|pdf|пакет документов|сертификат|типовые схемы|опросн|чек-лист|описание объекта|схему и спецификацию|получить типовые|сравнение/i;
  var CALL = /звонок|вопрос инженеру|консультаци|сравнить два варианта с инженером|обсудить|позвонить инженеру|оставить заявку|заявк/i;
  var ROUTE = [
    [/смотреть каталог|перейти к каталогу|открыть каталог/i, "catalog"],
    [/карточку мту 40|карточка мту 40/i, "model-40"],
    [/смотреть объекты|фильтр|все объекты/i, "cases"]
  ];
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey) return;
    var a = e.target.closest && e.target.closest("a");
    if (!a) return;
    var href = a.getAttribute("href");
    if (href === null || !(href === "" || href === "#" || href === "#final" || href === "#callback" || href === "#quiz")) return;
    var text = (a.textContent || "").replace(/\s+/g, " ").trim();
    e.preventDefault();
    if (a.closest("nav")) { if (U.nav) U.nav("", false, true); else window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (/ai-помощник/i.test(text)) return void window.open(BOT, "_blank");
    if (/whatsapp/i.test(text)) return void window.open(WA, "_blank");
    for (var i = 0; i < ROUTE.length; i++) if (ROUTE[i][0].test(text) && U.nav) return void U.go(ROUTE[i][1]);
    if (DL.test(text) && !/подобрать|рассчитать/i.test(text)) return download(text);
    if (href === "#callback" || CALL.test(text)) return callback(/консультаци|вопрос/i.test(text) ? text : "Заказать обратный звонок");
    quiz();
  });
  window.MTUQuiz = quiz; window.MTUCallback = callback;
  render();
})();
