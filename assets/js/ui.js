/* ==========================================================================
   ui.js — pembantu DOM, teks kaya, ikon, dan notifikasi
   ========================================================================== */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* Teks kaya ringan: **tebal**, `kode`, *miring*.
   Semua segmen di-escape sebelum dibungkus tag, jadi isi materi tidak bisa
   menyuntikkan HTML. */
export function inline(text) {
  if (text == null) return '';
  const src = String(text);
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*(?!\s)[^*\n]+?(?<!\s)\*)/g;
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(src))) {
    if (m.index > last) out += esc(src.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) out += `<strong>${esc(tok.slice(2, -2))}</strong>`;
    else if (tok.startsWith('`')) out += `<code>${esc(tok.slice(1, -1))}</code>`;
    else out += `<em>${esc(tok.slice(1, -1))}</em>`;
    last = m.index + tok.length;
  }
  out += esc(src.slice(last));
  return out;
}

/* ---- Ikon (stroke 1.75, 24×24) ----------------------------------------- */
const PATHS = {
  'arrow-right': '<path d="M4 12h15M13 6l6 6-6 6"/>',
  'arrow-left': '<path d="M20 12H5M11 18l-6-6 6-6"/>',
  'chevron-right': '<path d="M9 6l6 6-6 6"/>',
  'chevron-down': '<path d="M6 9l6 6 6-6"/>',
  check: '<path d="M20 6.5L9.5 17 4 11.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.6v.6"/>',
  alert:
    '<path d="M12 3.6L21 19H3l9-15.4z"/><path d="M12 9.5v4.2"/><path d="M12 16.5v.6"/>',
  bulb:
    '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 1 3.5 10.9c-.4.3-.5.7-.5 1.1v.5H9v-.5c0-.4-.1-.8-.5-1.1A6 6 0 0 1 12 3z"/>',
  copy:
    '<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M15 6.5A2.5 2.5 0 0 0 12.5 4H6.5A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15"/>',
  play: '<path d="M8 5.5l10 6.5-10 6.5z"/>',
  reset: '<path d="M3.5 12a8.5 8.5 0 1 0 2.7-6.2"/><path d="M3.5 4.5V10h5.4"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v16.5H6.5A2.5 2.5 0 0 0 4 22V5.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H19"/>',
  target:
    '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/>',
  terminal: '<path d="M4 6.5l5.2 5.2L4 17"/><path d="M12.5 17.5H20"/>',
  grid:
    '<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
  chart:
    '<path d="M4 20h16"/><rect x="6" y="11" width="3" height="6" rx="1"/><rect x="11" y="7" width="3" height="10" rx="1"/><rect x="16" y="13" width="3" height="4" rx="1"/>',
  list: '<path d="M8.5 7h12M8.5 12h12M8.5 17h12"/><circle cx="4.5" cy="7" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="17" r="1"/>',
  layer:
    '<path d="M12 3.5l8.5 4.5-8.5 4.5L3.5 8z"/><path d="M3.5 13L12 17.5 20.5 13"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  flag: '<path d="M5.5 21V4"/><path d="M5.5 5h11l-1.6 3.5L16.5 12h-11"/>',
  light: '<path d="M3 12h2.5M18.5 12H21M12 3v2.5M12 18.5V21"/><circle cx="12" cy="12" r="4.2"/>',
  spark:
    '<path d="M12 3.5l1.7 5.1 5.1 1.7-5.1 1.7L12 17.1l-1.7-5.1-5.1-1.7 5.1-1.7z"/>',
  code: '<path d="M8.5 8l-4 4 4 4"/><path d="M15.5 8l4 4-4 4"/><path d="M13.5 5l-3 14"/>',
  puzzle:
    '<path d="M10 4.5a1.8 1.8 0 0 1 3.6 0V6h2.4a1.5 1.5 0 0 1 1.5 1.5V10h1.5a1.8 1.8 0 0 1 0 3.6H17.5v2.4a1.5 1.5 0 0 1-1.5 1.5H13.6V19a1.8 1.8 0 0 1-3.6 0v-1.5H7.6a1.5 1.5 0 0 1-1.5-1.5V13.6H4.6a1.8 1.8 0 0 1 0-3.6H6V7.5A1.5 1.5 0 0 1 7.5 6H10z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
  sun:
    '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z"/>',
  monitor:
    '<rect x="3" y="4.5" width="18" height="12.5" rx="2"/><path d="M9 21h6M12 17v4"/>',
};

export function icon(name, cls = '') {
  const body = PATHS[name] || PATHS.info;
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}

/* ---- Notifikasi ringan -------------------------------------------------- */
let toastEl = null;
let toastTimer = 0;

export function toast(message, iconName = 'check') {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }
  toastEl.innerHTML = `${icon(iconName)}<span>${esc(message)}</span>`;
  // Dua frame agar transisi tetap berjalan saat toast dipakai berulang.
  requestAnimationFrame(() => {
    toastEl.dataset.show = 'true';
  });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.dataset.show = 'false';
  }, 2200);
}

/* ---- Salin ke papan klip ------------------------------------------------ */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Jalur cadangan untuk konteks non-secure (file:// atau http biasa).
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

/* ---- Format kecil ------------------------------------------------------- */
export function plural(n, word, suffix = '') {
  return `${n} ${word}${n === 1 ? '' : suffix}`;
}

export function levelDots(level) {
  let out = '<span class="levels" aria-hidden="true">';
  for (let i = 1; i <= 4; i += 1) out += `<i data-on="${i <= level}"></i>`;
  return `${out}</span>`;
}

export const LEVEL_LABEL = {
  1: 'Dasar',
  2: 'Penerapan',
  3: 'Analisis',
  4: 'Tantangan',
};

export const TYPE_LABEL = {
  choice: 'Pilihan ganda',
  predict: 'Prediksi output',
  short: 'Jawaban singkat',
  debug: 'Debugging',
  code: 'Menulis kode',
};
