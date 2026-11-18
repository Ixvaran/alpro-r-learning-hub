/* ==========================================================================
   theme.js — tema terang / gelap / ikut sistem
   Atribut data-theme pada <html> dipasang lebih dulu oleh skrip kecil di
   index.html agar tidak ada kedipan tema. Modul ini menyinkronkan sisa UI:
   ikon, menu, dan warna bilah peramban.
   ========================================================================== */

import { icon, toast } from './ui.js';

const KEY = 'alpro-lh-theme';
const MODES = new Set(['auto', 'light', 'dark']);
const LABEL = { auto: 'Ikut sistem', light: 'Terang', dark: 'Gelap' };

export function readMode() {
  try {
    const value = localStorage.getItem(KEY);
    return MODES.has(value) ? value : 'auto';
  } catch {
    return 'auto';
  }
}

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function effectiveTheme(mode = readMode()) {
  return mode === 'dark' || (mode === 'auto' && systemPrefersDark())
    ? 'dark'
    : 'light';
}

export function applyMode(mode) {
  const theme = effectiveTheme(mode);
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.themeMode = mode;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#08090c' : '#fbfbfd');

  const iconSlot = document.querySelector('[data-theme-icon]');
  if (iconSlot) iconSlot.innerHTML = icon(theme === 'dark' ? 'moon' : 'sun');

  const trigger = document.querySelector('[data-theme-trigger]');
  if (trigger) {
    trigger.setAttribute(
      'aria-label',
      `Tema ${theme === 'dark' ? 'gelap' : 'terang'}. Ubah tema tampilan`
    );
  }

  document.querySelectorAll('.theme-menu [data-theme-mode]').forEach((btn) => {
    btn.setAttribute('aria-checked', String(btn.dataset.themeMode === mode));
  });

  return theme;
}

export function setMode(mode) {
  if (!MODES.has(mode)) return;
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* penyimpanan diblokir: tema tetap berlaku untuk sesi ini */
  }
  applyMode(mode);
}

function mountWidget() {
  const widget = document.querySelector('[data-theme-widget]');
  if (!widget || widget.dataset.bound) return;
  widget.dataset.bound = '1';

  const trigger = widget.querySelector('[data-theme-trigger]');
  const menu = widget.querySelector('.theme-menu');
  const items = [...menu.querySelectorAll('[data-theme-mode]')];

  const open = () => {
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    const current = items.find((i) => i.dataset.themeMode === readMode());
    (current || items[0]).focus();
  };

  const close = (returnFocus = false) => {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus();
  };

  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    if (menu.hidden) open();
    else close(true);
  });

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const mode = item.dataset.themeMode;
      const already = readMode() === mode;
      setMode(mode);
      close(true);
      if (!already) toast(`Tema: ${LABEL[mode]}`, 'check');
    });
  });

  document.addEventListener('click', (event) => {
    if (!menu.hidden && !widget.contains(event.target)) close();
  });

  document.addEventListener('keydown', (event) => {
    if (menu.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const at = items.indexOf(document.activeElement);
      const next =
        event.key === 'ArrowDown'
          ? (at + 1 + items.length) % items.length
          : (at - 1 + items.length) % items.length;
      items[next].focus();
    }
  });
}

export function initTheme() {
  applyMode(readMode());
  mountWidget();

  // Selama mode "ikut sistem", perubahan tema OS langsung diikuti.
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemChange = () => {
    if (readMode() === 'auto') applyMode('auto');
  };
  if (media.addEventListener) media.addEventListener('change', onSystemChange);
  else media.addListener(onSystemChange);
}
