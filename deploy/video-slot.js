/* <video-slot> — drop-in video placeholder the user fills themselves.
 *
 * Drop an .mp4/.webm file on it (or click to browse), or paste a link
 * (direct file / YouTube / VK / Rutube). The pick is kept per-slot id in
 * IndexedDB, so it survives reloads in this browser. Files are NOT written
 * into the project — for a permanent embed the file has to be added to the
 * project's uploads/ folder and set as src.
 *
 * Attributes:
 *   id           persistence key (required for the pick to survive reload)
 *   src          optional initial video URL
 *   height       frame height (default 420px)
 *   radius       corner radius in px (default 6)
 *   placeholder  empty-state caption
 *   watermark    URL of a mark image overlaid on the playing video
 */
(function () {
  if (window.customElements && customElements.get('video-slot')) return;

  const DB = 'mtu-video-slots';
  const STORE = 'picks';
  let dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE); };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }).catch(() => null);
    return dbp;
  }
  async function put(id, val) {
    const d = await db(); if (!d || !id) return;
    try {
      await new Promise((res, rej) => {
        const tx = d.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(val, id);
        tx.oncomplete = res; tx.onerror = () => rej(tx.error);
      });
    } catch (e) {}
  }
  async function get(id) {
    const d = await db(); if (!d || !id) return null;
    try {
      return await new Promise((res, rej) => {
        const tx = d.transaction(STORE, 'readonly');
        const q = tx.objectStore(STORE).get(id);
        q.onsuccess = () => res(q.result || null);
        q.onerror = () => rej(q.error);
      });
    } catch (e) { return null; }
  }
  async function del(id) {
    const d = await db(); if (!d || !id) return;
    try {
      await new Promise((res) => {
        const tx = d.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = res; tx.onerror = res;
      });
    } catch (e) {}
  }

  function embedUrl(url) {
    let m = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/i.exec(url);
    if (m) return 'https://www.youtube.com/embed/' + m[1] + '?rel=0';
    m = /vk\.com\/video(-?\d+)_(\d+)/i.exec(url);
    if (m) return 'https://vk.com/video_ext.php?oid=' + m[1] + '&id=' + m[2];
    m = /rutube\.ru\/video\/([\w]+)/i.exec(url);
    if (m) return 'https://rutube.ru/play/embed/' + m[1] + '/';
    return null;
  }

  const AMBER = '#E3A93B';
  const LIGHT = 'rgba(244,245,247,';

  class VideoSlot extends HTMLElement {
    constructor() {
      super();
      this._url = null;      // object URL or remote URL currently shown
      this._blobUrl = null;
      this._embed = null;
      this._over = false;
      this._askLink = false;
    }

    connectedCallback() {
      this.style.display = 'block';
      this.style.position = 'relative';
      this._build();
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => this.addEventListener(e, this));
      this._restore();
    }
    disconnectedCallback() {
      if (this._blobUrl) { URL.revokeObjectURL(this._blobUrl); this._blobUrl = null; }
    }

    async _restore() {
      const stored = await get(this.id);
      if (stored && stored.blob) {
        this._blobUrl = URL.createObjectURL(stored.blob);
        this._url = this._blobUrl; this._embed = null;
      } else if (stored && stored.url && !/^blob:/i.test(stored.url)) {
        this._embed = embedUrl(stored.url);
        this._url = stored.url;
      } else if (this.getAttribute('src') || this.getAttribute('fallback-src')) {
        if (stored && stored.url) put(this.id, {});
        const rid = this.getAttribute('resource-id');
        const res = rid && window.__resources && window.__resources[rid];
        this._url = res || this.getAttribute('src') || this.getAttribute('fallback-src'); this._embed = null;
      }
      this._render();
    }

    handleEvent(ev) {
      if (ev.type === 'dragenter' || ev.type === 'dragover') {
        ev.preventDefault(); ev.stopPropagation();
        if (!this._over) { this._over = true; this._render(); }
      } else if (ev.type === 'dragleave') {
        if (this.contains(ev.relatedTarget)) return;
        this._over = false; this._render();
      } else if (ev.type === 'drop') {
        ev.preventDefault(); ev.stopPropagation();
        this._over = false;
        const f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
        if (f) this._take(f); else this._render();
      }
    }

    async _take(file) {
      if (!/^video\//i.test(file.type)) {
        this._err = 'Нужен видеофайл (.mp4 или .webm)';
        this._render();
        return;
      }
      this._err = null;
      if (this._blobUrl) URL.revokeObjectURL(this._blobUrl);
      this._blobUrl = URL.createObjectURL(file);
      this._url = this._blobUrl; this._embed = null;
      this._render();
      await put(this.id, { blob: file, name: file.name });
    }

    async _takeLink(url) {
      url = (url || '').trim();
      if (!url) return;
      this._err = null;
      if (this._blobUrl) { URL.revokeObjectURL(this._blobUrl); this._blobUrl = null; }
      this._embed = embedUrl(url);
      this._url = url;
      this._askLink = false;
      this._render();
      if (!/^blob:/i.test(url)) await put(this.id, { url: url });
    }

    async _clear() {
      if (this._blobUrl) { URL.revokeObjectURL(this._blobUrl); this._blobUrl = null; }
      this._url = null; this._embed = null; this._err = null;
      await del(this.id);
      this._render();
    }

    _build() {
      const h = this.getAttribute('height') || '420px';
      const bare = this.hasAttribute('bare');
      const r = (bare ? '0' : (this.getAttribute('radius') || '6')) + 'px';
      this._frame = document.createElement('div');
      this._frame.style.cssText = 'position:relative;width:100%;height:' + h +
        ';border-radius:' + r + ';overflow:hidden;background:#14171B;line-height:0;';
      this.appendChild(this._frame);
      this._file = document.createElement('input');
      this._file.type = 'file';
      this._file.accept = 'video/mp4,video/webm,video/quicktime';
      this._file.style.display = 'none';
      this._file.addEventListener('change', () => {
        const f = this._file.files && this._file.files[0];
        if (f) this._take(f);
        this._file.value = '';
      });
      this.appendChild(this._file);
    }

    _render() {
      const f = this._frame;
      if (!f) return;
      f.innerHTML = '';
      const wm = this.getAttribute('watermark');

      if (this._url && this._embed) {
        const fr = document.createElement('iframe');
        fr.src = this._embed + (this._embed.indexOf('?') < 0 ? '?' : '&') + 'mute=1';
        fr.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
        fr.allowFullscreen = true;
        fr.style.cssText = 'display:block;width:100%;height:100%;border:0;';
        f.appendChild(fr);
        f.appendChild(this._tools(true));
        return;
      }

      if (this._url) {
        const v = document.createElement('video');
        v.src = this._url;
        v.controls = !this.hasAttribute('bare'); v.muted = true; v.defaultMuted = true; v.volume = 0; v.loop = true; v.playsInline = true;
        // Звук выключен жёстко: даже если зритель нажмёт unmute в плеере.
        v.addEventListener('volumechange', () => { if (!v.muted || v.volume > 0) { v.muted = true; v.volume = 0; } });
        v.autoplay = true; v.preload = 'auto'; v.disablePictureInPicture = true;
        // без мигания: свой луп чуть раньше конца + отдельный GPU-слой (маска родителя не перерисовывает кадр)
        v.loop = false;
        v.addEventListener('ended', () => { v.currentTime = 0; v.play().catch(() => {}); });
        v.addEventListener('timeupdate', () => { if (v.duration && v.currentTime > v.duration - 0.12) { v.currentTime = 0.01; v.play().catch(() => {}); } });
        v.style.cssText = 'display:block;width:100%;height:100%;object-fit:cover;background:#14171B;transform:translateZ(0);backface-visibility:hidden;will-change:transform;';
        v.play && v.play().catch(() => {});
        v.addEventListener('loadedmetadata', () => { if (!this.hasAttribute('bare') && v.videoWidth && v.videoHeight) { this._frame.style.height = 'auto'; v.style.height = 'auto'; v.style.aspectRatio = v.videoWidth + '/' + v.videoHeight; v.style.objectFit = 'contain'; } });
        f.appendChild(v);
        if (wm) {
          const m = document.createElement('img');
          m.src = wm; m.alt = '';
          m.style.cssText = 'position:absolute;right:18px;top:18px;width:84px;height:84px;box-sizing:border-box;padding:17px;object-fit:contain;' +
            'border-radius:50%;background:rgba(20,26,38,.78);border:1px solid rgba(120,150,200,.35);' +
            'box-shadow:0 6px 24px rgba(0,0,0,.35);pointer-events:none;';
          f.appendChild(m);
        }
        f.appendChild(this._tools(true));
        return;
      }

      // empty state
      const z = document.createElement('div');
      z.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;' +
        'align-items:center;justify-content:center;gap:14px;line-height:1.4;cursor:pointer;' +
        (this.hasAttribute('bare')
          ? 'border:none;box-shadow:' + (this._over ? 'inset 0 0 0 2px ' + AMBER : 'none') + ';'
          : 'border:1px dashed ' + (this._over ? AMBER : LIGHT + '0.28)') + ';') + 'border-radius:inherit;' +
        'background:' + (this._over ? 'rgba(227,169,59,0.10)' : 'rgba(255,255,255,0.02)') + ';' +
        'transition:background 150ms ease-out,border-color 150ms ease-out;padding:24px;text-align:center;';
      z.addEventListener('click', (e) => { if (e.target === z || e.target.dataset.pick) this._file.click(); });

      const icon = document.createElement('div');
      icon.innerHTML = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="' + AMBER +
        '" stroke-width="1.6"><rect x="2.5" y="5.5" width="13" height="13" rx="2"/><path d="M15.5 10.5 21.5 7v10l-6-3.5z"/></svg>';
      icon.style.cssText = 'line-height:0;opacity:.9;';
      z.appendChild(icon);

      const cap = document.createElement('div');
      cap.textContent = this.getAttribute('placeholder') || 'Перетащите видео сюда';
      cap.style.cssText = 'font-family:"IBM Plex Sans",sans-serif;font-size:15px;font-weight:500;color:' + LIGHT + '0.9);';
      z.appendChild(cap);

      const hint = document.createElement('div');
      hint.textContent = this._err || 'mp4 или webm · или вставьте ссылку на YouTube / VK / Rutube';
      hint.style.cssText = 'font-family:"IBM Plex Mono",monospace;font-size:11.5px;letter-spacing:.05em;' +
        'text-transform:uppercase;color:' + (this._err ? '#E58C74' : LIGHT + '0.5)') + ';';
      z.appendChild(hint);

      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;';
      const pick = this._btn('Выбрать файл', true);
      pick.dataset.pick = '1';
      pick.addEventListener('click', (e) => { e.stopPropagation(); this._file.click(); });
      row.appendChild(pick);

      if (this._askLink) {
        const inp = document.createElement('input');
        inp.type = 'url';
        inp.placeholder = 'https://…';
        inp.style.cssText = 'font-family:"IBM Plex Sans",sans-serif;font-size:14px;color:#F4F5F7;' +
          'background:rgba(0,0,0,.35);border:1px solid ' + LIGHT + '0.28);border-radius:4px;' +
          'padding:8px 10px;width:260px;outline:none;';
        inp.addEventListener('click', (e) => e.stopPropagation());
        inp.addEventListener('keydown', (e) => {
          e.stopPropagation();
          if (e.key === 'Enter') this._takeLink(inp.value);
          if (e.key === 'Escape') { this._askLink = false; this._render(); }
        });
        row.appendChild(inp);
        const ok = this._btn('Вставить', false);
        ok.addEventListener('click', (e) => { e.stopPropagation(); this._takeLink(inp.value); });
        row.appendChild(ok);
        setTimeout(() => inp.focus(), 0);
      } else {
        const link = this._btn('Вставить ссылку', false);
        link.addEventListener('click', (e) => { e.stopPropagation(); this._askLink = true; this._render(); });
        row.appendChild(link);
      }
      z.appendChild(row);
      f.appendChild(z);
    }

    _btn(label, primary) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.style.cssText = 'font-family:"IBM Plex Sans",sans-serif;font-size:13.5px;font-weight:500;' +
        'padding:9px 14px;min-height:38px;border-radius:4px;cursor:pointer;line-height:1;' +
        'transition:background 150ms ease-out,border-color 150ms ease-out;' +
        (primary
          ? 'background:' + AMBER + ';color:#22262C;border:1px solid ' + AMBER + ';'
          : 'background:transparent;color:' + LIGHT + '0.86);border:1px solid ' + LIGHT + '0.28);');
      b.addEventListener('mouseenter', () => {
        b.style.background = primary ? '#D19B31' : 'rgba(255,255,255,0.07)';
      });
      b.addEventListener('mouseleave', () => {
        b.style.background = primary ? AMBER : 'transparent';
      });
      return b;
    }

    _tools() {
      const wrap = document.createElement('div');
      if (!(window.omelette && window.omelette.writeFile)) { wrap.style.display = 'none'; return wrap; }
      wrap.style.cssText = 'position:absolute;left:12px;top:12px;display:flex;gap:8px;z-index:2;';
      const rep = this._miniBtn('Заменить');
      rep.addEventListener('click', (e) => { e.stopPropagation(); this._file.click(); });
      const clr = this._miniBtn('Убрать');
      clr.addEventListener('click', (e) => { e.stopPropagation(); this._clear(); });
      wrap.appendChild(rep); wrap.appendChild(clr);
      wrap.style.opacity = '0';
      wrap.style.transition = 'opacity 150ms ease-out';
      this._frame.addEventListener('pointerenter', () => { wrap.style.opacity = '1'; });
      this._frame.addEventListener('pointerleave', () => { wrap.style.opacity = '0'; });
      return wrap;
    }

    _miniBtn(label) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.style.cssText = 'font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.05em;' +
        'text-transform:uppercase;padding:7px 10px;min-height:32px;border-radius:4px;cursor:pointer;' +
        'color:#F4F5F7;background:rgba(20,23,27,.78);border:1px solid rgba(244,245,247,.3);line-height:1;';
      b.addEventListener('mouseenter', () => { b.style.background = 'rgba(20,23,27,.94)'; });
      b.addEventListener('mouseleave', () => { b.style.background = 'rgba(20,23,27,.78)'; });
      return b;
    }
  }

  customElements.define('video-slot', VideoSlot);
})();
