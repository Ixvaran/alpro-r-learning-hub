/* ==========================================================================
   app.js — titik masuk: memuat kerangka, merutekan halaman, dan mengaktifkan
   interaksi setelah setiap render.
   ========================================================================== */

import { store } from './store.js';
import { startRouter, initAnchorScroll } from './router.js';
import { initTheme } from './theme.js';
import { renderNav, renderNavSheet, renderFooter, syncNav } from './components/shell.js';
import { activateBlocks } from './components/blocks.js';
import { activateExercises } from './components/exercise.js';
import { modules, lessonById } from '../../content/curriculum.js';
import { exercises } from '../../content/exercises.js';

import { renderHome } from './pages/home.js';
import { renderPeta } from './pages/peta.js';
import {
  renderModule,
  renderLesson,
  resolveModuleRoute,
} from './pages/module.js';
import { renderLatihan, activateLatihan } from './pages/latihan.js';
import { renderPlayground, mountPlayground } from './pages/playground.js';
import { renderProgres, mountProgres } from './pages/progres.js';
import { renderGlosarium, mountGlosarium } from './pages/glosarium.js';
import { renderTentang } from './pages/tentang.js';

const APP_NAME = 'ALPRO R Learning Hub';

const nav = document.getElementById('nav');
const sheet = document.getElementById('navSheet');
const main = document.getElementById('main');
const foot = document.getElementById('foot');
const announcer = document.getElementById('announcer');

/* ---- Kerangka ---------------------------------------------------------- */
function buildShell() {
  nav.innerHTML = renderNav();
  sheet.innerHTML = renderNavSheet();
  foot.innerHTML = renderFooter();
  initTheme();

  /* Garis rambut navbar muncul hanya setelah konten lewat di bawahnya. */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      nav.dataset.scrolled = String(window.scrollY > 6);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Menu seluler */
  const toggle = nav.querySelector('.nav__toggle');
  toggle.addEventListener('click', () => {
    const open = sheet.dataset.open === 'true';
    sheet.dataset.open = String(!open);
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.innerHTML = open
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
    document.body.style.overflow = open ? '' : 'hidden';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sheet.dataset.open === 'true') {
      toggle.click();
      toggle.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-sheet-link]') && sheet.dataset.open === 'true') {
      toggle.click();
    }
    /* Tautan lewati ke konten tidak boleh mengubah hash rute. */
    const skip = e.target.closest('[data-skip]');
    if (skip) {
      e.preventDefault();
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
      window.scrollTo({ top: 0 });
    }
  });

  initAnchorScroll();
}

/* ---- Halaman ----------------------------------------------------------- */
function notFound(what) {
  return {
    title: 'Halaman tidak ditemukan',
    html: `
      <div class="wrap wrap--wide">
        <div class="empty" style="margin-top:48px">
          <svg class="empty__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>
          </svg>
          <div class="empty__title">Halaman tidak ditemukan</div>
          <p class="empty__text">Alamat "${what}" tidak ada di situs ini. Mungkin tautannya salah ketik atau materi sudah dipindahkan.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
            <a class="btn btn--sm" href="#/peta">Peta materi</a>
            <a class="btn btn--ghost btn--sm" href="#/">Beranda</a>
          </div>
        </div>
      </div>`,
  };
}

function resolve(route) {
  const [head, ...rest] = route.parts;

  if (!head) return { title: 'Beranda', html: renderHome() };

  if (head === 'peta') return { title: 'Peta materi', html: renderPeta() };

  if (head === 'modul') {
    const found = resolveModuleRoute(rest);
    if (!found) return notFound(route.path);
    if (found.kind === 'lesson') {
      const { module: mod, lesson, index } = found;
      return {
        title: lesson.title,
        html: renderLesson(mod, lesson, index),
        kind: 'lesson',
        moduleId: mod.id,
        lessonId: lesson.id,
      };
    }
    return { title: `Modul ${found.module.num}`, html: renderModule(found.module) };
  }

  if (head === 'latihan') {
    return {
      title: 'Latihan & bank soal',
      html: renderLatihan(),
      mount: (root) => activateLatihan(root, { activateExercises }),
    };
  }

  if (head === 'playground') {
    return { title: 'Playground', html: renderPlayground(), mount: mountPlayground };
  }

  if (head === 'progres') {
    return { title: 'Progres saya', html: renderProgres(), mount: mountProgres };
  }

  if (head === 'glosarium') {
    return { title: 'Glosarium', html: renderGlosarium(), mount: mountGlosarium };
  }

  if (head === 'tentang') {
    return { title: 'Tentang', html: renderTentang() };
  }

  return notFound(route.path);
}

/* ---- Render rute ------------------------------------------------------- */
function render(route) {
  const page = resolve(route);

  main.innerHTML = page.html;

  if (sheet.dataset.open === 'true') {
    sheet.dataset.open = 'false';
    const toggle = nav.querySelector('.nav__toggle');
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  syncNav(route);

  activateBlocks(main);
  activateExercises(main, exercises);
  if (typeof page.mount === 'function') page.mount(main);

  bindPageEvents();

  window.scrollTo(0, 0);
  document.title = `${page.title} · ${APP_NAME}`;
  if (announcer) announcer.textContent = `${page.title} dimuat`;

  const heading = main.querySelector('h1');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    try {
      heading.focus({ preventScroll: true });
    } catch {
      /* fokus tidak wajib berhasil di semua browser */
    }
  }

  if (page.kind === 'lesson') store.setLast(page.moduleId, page.lessonId);
}

/* ---- Interaksi khusus halaman ----------------------------------------- */
function bindPageEvents() {
  /* Tombol "tandai selesai" */
  main.querySelectorAll('[data-done-toggle]').forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      const moduleId = btn.dataset.module;
      const lessonId = btn.dataset.lesson;
      const nowDone = btn.dataset.done !== 'true';
      store.setLessonDone(moduleId, lessonId, nowDone);

      btn.dataset.done = String(nowDone);
      btn.className = `btn${nowDone ? ' btn--quiet' : ''}`;
      btn.innerHTML = nowDone
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6.5L9.5 17 4 11.5"/></svg> Sudah selesai'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 21V4"/><path d="M5.5 5h11l-1.6 3.5L16.5 12h-11"/></svg> Tandai selesai';

      const note = main.querySelector('.donebar__text');
      if (note) {
        note.textContent = nowDone
          ? 'Pelajaran ini sudah kamu tandai selesai.'
          : 'Sudah paham? Tandai pelajaran ini selesai agar progresmu tercatat di perangkat ini.';
      }

      /* Titik penanda di sidebar untuk pelajaran ini. */
      const link = main.querySelector(
        `.sidebar__link[href="#/modul/${moduleId}/${lessonId}"]`
      );
      if (link) {
        const dot = link.querySelector('.sidebar__dot');
        const label = link.lastElementChild;
        if (nowDone && !dot) {
          const span = document.createElement('span');
          span.className = 'sidebar__dot';
          span.title = 'Selesai';
          label.appendChild(span);
        } else if (!nowDone && dot) {
          dot.remove();
        }
      }
      syncNav({ parts: ['modul'], path: '/modul' });
    });
  });

  /* Sidebar seluler */
  const sidebarToggle = main.querySelector('[data-sidebar-toggle]');
  if (sidebarToggle && !sidebarToggle.dataset.bound) {
    sidebarToggle.dataset.bound = '1';
    const sidebar = sidebarToggle.closest('.sidebar');
    sidebarToggle.addEventListener('click', () => {
      const open = sidebarToggle.getAttribute('aria-expanded') === 'true';
      sidebarToggle.setAttribute('aria-expanded', String(!open));
      if (sidebar) sidebar.dataset.open = String(!open);
    });
  }
}

/* ---- Mulai ------------------------------------------------------------- */
function boot() {
  store.load();
  buildShell();

  startRouter((route) => {
    try {
      render(route);
    } catch (err) {
      console.error(err);
      main.innerHTML = `
        <div class="wrap wrap--wide">
          <div class="empty" style="margin-top:48px">
            <div class="empty__title">Terjadi kesalahan saat memuat halaman</div>
            <p class="empty__text">${String(err?.message || err)}</p>
            <a class="btn btn--sm" href="#/">Kembali ke beranda</a>
          </div>
        </div>`;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
