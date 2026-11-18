/* ==========================================================================
   peta.js — peta materi: empat modul, urutan, dan status setiap pelajaran
   ========================================================================== */

import { esc, icon } from '../ui.js';
import { modules } from '../../../content/curriculum.js';
import { store } from '../store.js';

export function renderPeta() {
  const t = store.totals(modules);

  const blocks = modules
    .map((m) => {
      const pct = store.modulePercent(m);
      const done = store.countDone(m);
      const rows = m.lessons
        .map((l, i) => {
          const isDone = store.isLessonDone(m.id, l.id);
          return `
            <a class="lessonrow" href="#/modul/${m.id}/${l.id}">
              <span class="lessonrow__n">${String(i + 1).padStart(2, '0')}</span>
              <div>
                <div class="lessonrow__t">
                  ${esc(l.title)}
                  ${isDone ? `<span class="tag tag--success">${icon('check')} Selesai</span>` : ''}
                </div>
                <div class="lessonrow__d">${esc(l.desc)}</div>
              </div>
              <div class="lessonrow__meta">
                <span>${l.duration} mnt</span>
                ${icon('chevron-right', 'lessonrow__arrow')}
              </div>
            </a>`;
        })
        .join('');

      return `
        <section class="modblock" aria-labelledby="mod-${m.id}">
          <div class="modblock__head">
            <span class="modcard__num" data-mod="${m.num}">${String(m.num).padStart(2, '0')}</span>
            <div class="modblock__titlewrap">
              <h2 id="mod-${m.id}" class="modblock__title">
                <a href="#/modul/${m.id}">${esc(m.title)}</a>
              </h2>
              <p class="modblock__tag">${esc(m.tagline)}</p>
            </div>
            <div class="modblock__meta">
              <span>${m.lessons.length} pelajaran</span>
              <span aria-hidden="true">·</span>
              <span>${m.duration} menit</span>
              ${done > 0 ? `<span aria-hidden="true">·</span><span>${pct}% selesai</span>` : ''}
            </div>
          </div>
          <ul class="lessonlist">${rows}</ul>
        </section>`;
    })
    .join('');

  return `
    <div class="wrap wrap--wide">
      <div class="page-head">
        <span class="eyebrow">${icon('grid')} Peta materi</span>
        <h1>Empat modul, urutan yang sengaja</h1>
        <p>
          Materi mengikuti urutan dokumen kuliah. Setiap modul memakai hasil
          modul sebelumnya, jadi jangan mulai dari tengah.
        </p>
      </div>

      <div class="progress-strip" style="margin-bottom:32px">
        ${icon('chart')}
        <span>${t.done > 0 ? `${t.done} dari ${t.lessons} pelajaran selesai` : 'Belum ada pelajaran yang ditandai selesai'}</span>
        <div class="bar" role="progressbar" aria-valuenow="${t.percent}" aria-valuemin="0" aria-valuemax="100">
          <div class="bar__fill" style="width:${t.percent}%"></div>
        </div>
        <b>${t.percent}%</b>
      </div>

      ${blocks}
    </div>`;
}
