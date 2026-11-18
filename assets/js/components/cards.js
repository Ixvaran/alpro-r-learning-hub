/* ==========================================================================
   cards.js — kartu modul dan elemen ringkasan yang dipakai beberapa halaman
   ========================================================================== */

import { esc, icon } from '../ui.js';
import { store } from '../store.js';

export function moduleCard(m, { showProgress = true } = {}) {
  const done = store.countDone(m);
  const pct = store.modulePercent(m);
  const started = done > 0;
  const status = pct === 100 ? 'Selesai' : started ? `${pct}% selesai` : 'Belum mulai';

  return `
    <a class="card modcard" href="#/modul/${m.id}">
      <div class="modcard__top">
        <span class="modcard__num" data-mod="${m.num}">${String(m.num).padStart(2, '0')}</span>
        <span class="tag">${m.lessons.length} pelajaran</span>
      </div>
      <div>
        <h3 class="modcard__title">${esc(m.title)}</h3>
        <p class="modcard__desc" style="margin-top:6px">${esc(m.desc)}</p>
      </div>
      <div class="modcard__foot">
        <span>${icon('clock')} ${m.duration} menit</span>
        <span${pct === 100 ? ' style="color:var(--success)"' : ''}>${showProgress ? status : 'Mulai'}</span>
      </div>
      ${showProgress && started
        ? `<div class="bar" aria-hidden="true"><div class="bar__fill" style="width:${pct}%"></div></div>`
        : ''}
    </a>`;
}

export function progressStrip(modules) {
  const t = store.totals(modules);
  return `
    <div class="progress-strip">
      ${icon('chart')}
      <span>Progres keseluruhan</span>
      <div class="bar" role="progressbar" aria-valuenow="${t.percent}" aria-valuemin="0"
           aria-valuemax="100" aria-label="Progres belajar">
        <div class="bar__fill" style="width:${t.percent}%"></div>
      </div>
      <b>${t.done}/${t.lessons}</b>
    </div>`;
}

export function emptyState({ icon: ic = 'search', title, text, action }) {
  return `
    <div class="empty">
      ${icon(ic, 'empty__icon')}
      <div class="empty__title">${esc(title)}</div>
      <p class="empty__text">${esc(text)}</p>
      ${action || ''}
    </div>`;
}
