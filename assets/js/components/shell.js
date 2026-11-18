/* ==========================================================================
   shell.js — navbar, lembar navigasi seluler, footer, dan penanda aktif
   ========================================================================== */

import { icon, esc } from '../ui.js';
import { store } from '../store.js';
import { modules, totalLessons } from '../../../content/curriculum.js';

const LINKS = [
  { href: '#/', label: 'Beranda', key: 'home' },
  { href: '#/peta', label: 'Materi', key: 'peta' },
  { href: '#/latihan', label: 'Latihan', key: 'latihan' },
  { href: '#/playground', label: 'Playground', key: 'playground' },
  { href: '#/progres', label: 'Progres', key: 'progres' },
  { href: '#/glosarium', label: 'Glosarium', key: 'glosarium' },
];

export const BRAND_MARK = `
  <svg class="brand__mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2.5" y="2.5" width="8.5" height="8.5" rx="2.2" fill="currentColor" opacity="0.9"/>
    <rect x="13" y="2.5" width="8.5" height="8.5" rx="2.2" stroke="currentColor" stroke-width="1.6"/>
    <rect x="2.5" y="13" width="8.5" height="8.5" rx="2.2" stroke="currentColor" stroke-width="1.6"/>
    <rect x="13" y="13" width="8.5" height="8.5" rx="2.2" fill="currentColor" opacity="0.4"/>
  </svg>`;

export function renderNav() {
  const links = LINKS.map(
    (l) => `<li><a class="nav__link" href="${l.href}" data-nav="${l.key}">${l.label}</a></li>`
  ).join('');

  return `
    <div class="nav__inner">
      <a class="brand" href="#/" aria-label="ALPRO R Learning Hub, ke beranda">
        ${BRAND_MARK}
        <span class="brand__text">ALPRO R<small>Learning Hub</small></span>
      </a>
      <ul class="nav__links">${links}</ul>
      <span class="nav__progress" data-nav-progress></span>

      <div class="theme" data-theme-widget>
        <button class="nav__icon" type="button" data-theme-trigger
                aria-haspopup="true" aria-expanded="false" aria-controls="themeMenu"
                aria-label="Pilih tema tampilan">
          <span data-theme-icon>${icon('sun')}</span>
        </button>
        <div class="theme-menu" id="themeMenu" role="menu" aria-label="Tema tampilan" hidden>
          <button type="button" role="menuitemradio" aria-checked="false" data-theme-mode="auto">
            ${icon('monitor')}<span>Ikut sistem</span>${icon('check', 'theme-menu__check')}
          </button>
          <button type="button" role="menuitemradio" aria-checked="false" data-theme-mode="light">
            ${icon('sun')}<span>Terang</span>${icon('check', 'theme-menu__check')}
          </button>
          <button type="button" role="menuitemradio" aria-checked="false" data-theme-mode="dark">
            ${icon('moon')}<span>Gelap</span>${icon('check', 'theme-menu__check')}
          </button>
        </div>
      </div>
      <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="navSheet"
              aria-label="Buka menu navigasi">
        ${icon('menu')}
      </button>
    </div>`;
}

export function renderNavSheet() {
  const items = LINKS.map(
    (l) =>
      `<li><a href="${l.href}" data-sheet-link data-nav="${l.key}">${l.label}
        <span class="nav-sheet__meta" data-sheet-meta="${l.key}"></span></a></li>`
  ).join('');
  return `<nav aria-label="Navigasi seluler"><ul>${items}</ul></nav>`;
}

export function renderFooter() {
  const modLinks = modules
    .map(
      (m) =>
        `<li><a href="#/modul/${m.id}">Modul ${m.num} — ${esc(m.title)}</a></li>`
    )
    .join('');

  return `
    <div class="wrap wrap--wide">
      <div class="foot__grid">
        <div>
          <a class="brand" href="#/" style="margin-bottom:12px">
            ${BRAND_MARK}
            <span class="brand__text">ALPRO R<small>Learning Hub</small></span>
          </a>
          <p style="max-width:38ch;color:var(--ink-3);font-size:0.875rem;line-height:1.6">
            Media pendamping belajar Algoritma dan Pemrograman dengan R untuk
            mahasiswa Statistika angkatan 2026.
          </p>
        </div>
        <div>
          <div class="foot__title">Materi</div>
          <ul>${modLinks}</ul>
        </div>
        <div>
          <div class="foot__title">Belajar</div>
          <ul>
            <li><a href="#/latihan">Latihan &amp; bank soal</a></li>
            <li><a href="#/playground">Playground R</a></li>
            <li><a href="#/progres">Progres saya</a></li>
            <li><a href="#/glosarium">Glosarium</a></li>
            <li><a href="#/tentang">Tentang situs</a></li>
          </ul>
        </div>
      </div>
      <div class="foot__note">
        <span>Materi disusun mengikuti empat dokumen kuliah dosen. Situs ini bukan pengganti kuliah.</span>
        <span>Dibangun sebagai media asistensi · ${totalLessons} pelajaran</span>
      </div>
    </div>`;
}

/* ---- Penanda aktif ------------------------------------------------------ */
export function syncNav(route) {
  const { parts } = route;
  let key = 'home';
  if (parts[0] === 'peta') key = 'peta';
  else if (parts[0] === 'modul') key = 'peta';
  else if (parts[0] === 'latihan') key = 'latihan';
  else if (parts[0] === 'playground') key = 'playground';
  else if (parts[0] === 'progres') key = 'progres';
  else if (parts[0] === 'glosarium') key = 'glosarium';
  else if (parts[0] === 'tentang') key = 'tentang';
  else if (parts[0] === '') key = 'home';

  document.querySelectorAll('[data-nav]').forEach((a) => {
    if (a.dataset.nav === key) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  const chip = document.querySelector('[data-nav-progress]');
  const t = store.totals(modules);
  if (chip) {
    chip.innerHTML = t.done > 0
      ? `${icon('flag')} ${t.done}/${t.lessons} pelajaran`
      : `${icon('flag')} ${t.lessons} pelajaran`;
  }

  // Ringkasan kecil di lembar seluler.
  const metas = {
    peta: `${modules.length} modul`,
    latihan: 'Bank soal',
    playground: 'Jalankan kode',
    progres: t.done > 0 ? `${t.percent}% selesai` : 'Belum mulai',
    glosarium: 'Istilah',
  };
  document.querySelectorAll('[data-sheet-meta]').forEach((el) => {
    el.textContent = metas[el.dataset.sheetMeta] || '';
  });
}
