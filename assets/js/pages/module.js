/* ==========================================================================
   module.js — halaman modul (ikhtisar) dan halaman pelajaran
   ========================================================================== */

import { esc, inline, icon, levelDots, LEVEL_LABEL } from '../ui.js';
import { modules, moduleById, lessonById, neighbours, nextInPath } from '../../../content/curriculum.js';
import { forLesson } from '../../../content/exercises.js';
import { renderBlocks, isContextBlock } from '../components/blocks.js';
import { renderExercise } from '../components/exercise.js';
import { emptyState } from '../components/cards.js';
import { store } from '../store.js';

/* ---- Sidebar ----------------------------------------------------------- */
export function renderSidebar(module, activeLessonId = null) {
  const groups = modules
    .map((m) => {
      const active = m.id === module.id;
      const pct = store.modulePercent(m);
      const lessons = active
        ? `<ul class="sidebar__list">${m.lessons
            .map(
              (l, i) => `
              <li>
                <a class="sidebar__link" href="#/modul/${m.id}/${l.id}"
                   ${l.id === activeLessonId ? 'aria-current="page"' : ''}>
                  <span class="sidebar__num">${String(i + 1).padStart(2, '0')}</span>
                  <span>${esc(l.title)}${
                    store.isLessonDone(m.id, l.id)
                      ? '<span class="sidebar__dot" title="Selesai"></span>'
                      : ''
                  }</span>
                </a>
              </li>`
            )
            .join('')}</ul>`
        : `<ul class="sidebar__list">
             <li>
               <a class="sidebar__link" href="#/modul/${m.id}">
                 <span class="sidebar__num"></span>
                 <span>${esc(m.title)}${pct === 100 ? ' · selesai' : ''}</span>
               </a>
             </li>
           </ul>`;

      return `
        <div class="sidebar__group">
          <div class="sidebar__group-title">
            <span>Modul ${m.num}</span>
            <span>${pct > 0 ? `${pct}%` : ''}</span>
          </div>
          ${lessons}
        </div>`;
    })
    .join('');

  return `
    <aside class="sidebar" aria-label="Daftar materi">
      <div class="sidebar__head">
        <span class="sidebar__label">Materi</span>
        <button class="sidebar__toggle" type="button" data-sidebar-toggle
                aria-expanded="false" aria-controls="sidebarNav">Daftar ${icon('chevron-down')}</button>
      </div>
      <div class="sidebar__nav" id="sidebarNav">
        <a class="sidebar__back" href="#/peta">${icon('arrow-left')} Peta materi</a>
        ${groups}
      </div>
    </aside>`;
}

function crumbs(items) {
  return `<nav class="crumbs" aria-label="Breadcrumb">${items
    .map((it, i) =>
      i === items.length - 1
        ? `<span aria-current="page">${esc(it.label)}</span>`
        : `<a href="${it.href}">${esc(it.label)}</a><span aria-hidden="true">/</span>`
    )
    .join('')}</nav>`;
}

/* ---- Ikhtisar modul ---------------------------------------------------- */
export function renderModule(mod) {
  const done = store.countDone(mod);
  const pct = store.modulePercent(mod);
  const first = mod.lessons[0];

  const rows = mod.lessons
    .map((l, i) => {
      const isDone = store.isLessonDone(mod.id, l.id);
      return `
        <a class="lessonrow" href="#/modul/${mod.id}/${l.id}">
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
    <div class="shell">
      ${renderSidebar(mod)}
      <div class="shell__main">
        ${crumbs([{ label: 'Materi', href: '#/peta' }, { label: `Modul ${mod.num}` }])}

        <header class="modhead">
          <div class="modhead__top">
            <span class="modcard__num" data-mod="${mod.num}">${String(mod.num).padStart(2, '0')}</span>
            <span class="tag">Modul ${mod.num}</span>
            <span class="tag">${mod.lessons.length} pelajaran</span>
            <span class="tag">${mod.duration} menit</span>
          </div>
          <h1>${esc(mod.title)}</h1>
          <p class="modhead__sub">${esc(mod.desc)}</p>

          <div class="modhead__grid">
            <div class="panel">
              <div class="panel__title">Setelah modul ini</div>
              <ul>
                ${mod.goals.map((g) => `<li>${icon('check')}<span>${inline(g)}</span></li>`).join('')}
              </ul>
            </div>
            <div class="panel panel--warm">
              <div class="panel__title">Prasyarat</div>
              <ul>
                ${mod.prereq.map((g) => `<li>${icon('info')}<span>${inline(g)}</span></li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="progress-strip" style="margin-top:20px">
            ${icon('chart')}
            <span>${done === 0 ? 'Belum dimulai' : `${done} dari ${mod.lessons.length} pelajaran selesai`}</span>
            <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
                 aria-label="Progres modul ${mod.num}">
              <div class="bar__fill" style="width:${pct}%"></div>
            </div>
            <b>${pct}%</b>
          </div>

          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
            <a class="btn" href="#/modul/${mod.id}/${first.id}">
              ${done > 0 ? 'Lanjutkan modul' : 'Mulai modul ini'} ${icon('arrow-right', 'btn__arrow')}
            </a>
            <span class="dim" style="font-size:0.8125rem;align-self:center">
              Sumber: ${esc(mod.source)}
            </span>
          </div>
        </header>

        <ul class="lessonlist">${rows}</ul>
      </div>
    </div>`;
}

/* Kode dari pelajaran sebelumnya, termasuk modul terdahulu, agar contoh yang
   memakai fungsi lama (misalnya myBagi di Modul 1 yang dipakai Modul 2) tetap
   dapat dijalankan di playground. Pemangkasan panjangnya dilakukan di
   renderBlocks dengan mengutamakan blok definisi fungsi. */
function priorCode(mod, index) {
  const out = [];
  const stopId = mod.lessons[index]?.id;
  for (const m of modules) {
    for (const l of m.lessons) {
      if (m.id === mod.id && l.id === stopId) return out;
      for (const b of l.blocks) {
        if (isContextBlock(b)) out.push(b.code);
      }
    }
  }
  return out;
}

/* ---- Halaman pelajaran ------------------------------------------------- */
export function renderLesson(mod, lesson, index) {
  const exercises = forLesson(mod.id, lesson.id);
  const { prev, next } = neighbours(mod.id, lesson.id);
  const isDone = store.isLessonDone(mod.id, lesson.id);
  const upcoming = nextInPath(mod.id, lesson.id);

  const exerciseBlock = exercises.length
    ? `
      <section class="section" id="latihan">
        <div class="section__head">
          <div>
            <h2>Latihan</h2>
            <p>Kerjakan tanpa membuka petunjuk lebih dulu. Pembahasan terbuka setelah kamu mencoba.</p>
          </div>
        </div>
        <div class="exlist">
          ${exercises
            .map((ex, i) => renderExercise(ex, i + 1, exercises.length))
            .join('')}
        </div>
      </section>`
    : `
      <section class="section">
        ${emptyState({
          icon: 'puzzle',
          title: 'Belum ada latihan untuk pelajaran ini',
          text: 'Latihan untuk pelajaran ini sedang disiapkan. Sementara itu, coba contoh kode di Playground.',
          action: '<a class="btn btn--quiet btn--sm" href="#/playground">Buka Playground</a>',
        })}
      </section>`;

  const recap = `
    <section class="recap">
      <div class="recap__block">
        <div class="recap__title">${icon('check')} Rangkuman</div>
        <ul>
          ${lesson.summary
            .map((s) => `<li>${icon('check', 'ok')}<span>${inline(s)}</span></li>`)
            .join('')}
        </ul>
      </div>
      <div class="recap__block">
        <div class="recap__title">${icon('alert')} Kesalahan umum</div>
        <ul>
          ${lesson.mistakes
            .map((s) => `<li>${icon('x', 'bad')}<span>${inline(s)}</span></li>`)
            .join('')}
        </ul>
      </div>
    </section>`;

  const pager = `
    <nav class="pager" aria-label="Navigasi antar pelajaran">
      ${
        prev
          ? `<a class="pager__link" href="#/modul/${mod.id}/${prev.lesson.id}">
               <span class="pager__dir">${icon('arrow-left')} Sebelumnya</span>
               <span class="pager__t">${esc(prev.lesson.title)}</span>
             </a>`
          : `<a class="pager__link" href="#/modul/${mod.id}">
               <span class="pager__dir">${icon('arrow-left')} Kembali</span>
               <span class="pager__t">Ikhtisar modul</span>
             </a>`
      }
      ${
        next
          ? `<a class="pager__link pager__link--next" href="#/modul/${mod.id}/${next.lesson.id}">
               <span class="pager__dir">Berikutnya ${icon('arrow-right')}</span>
               <span class="pager__t">${esc(next.lesson.title)}</span>
             </a>`
          : upcoming
          ? `<a class="pager__link pager__link--next" href="#/modul/${upcoming.moduleId}/${upcoming.lessonId}">
               <span class="pager__dir">Modul berikutnya ${icon('arrow-right')}</span>
               <span class="pager__t">${esc(upcoming.lessonTitle)}</span>
             </a>`
          : `<a class="pager__link pager__link--next" href="#/latihan">
               <span class="pager__dir">Selesai ${icon('check')}</span>
               <span class="pager__t">Kerjakan latihan seluruh modul</span>
             </a>`
      }
    </nav>`;

  return `
    <div class="shell">
      ${renderSidebar(mod, lesson.id)}
      <div class="shell__main">
        ${crumbs([
          { label: 'Materi', href: '#/peta' },
          { label: `Modul ${mod.num}`, href: `#/modul/${mod.id}` },
          { label: lesson.title },
        ])}

        <header class="lesson__head">
          <span class="eyebrow">Modul ${mod.num} · ${esc(mod.short)}</span>
          <h1 class="lesson__title" tabindex="-1">${esc(lesson.title)}</h1>
          <div class="lesson__meta">
            <span>${icon('clock')} ${lesson.duration} menit</span>
            <span>${icon('target')} Pelajaran ${index + 1} dari ${mod.lessons.length}</span>
            <span>${levelDots(lesson.level)} ${LEVEL_LABEL[lesson.level] || ''}</span>
          </div>
        </header>

        <div class="objectives">
          <div class="objectives__title">${icon('target')} Tujuan belajar</div>
          <ul>
            ${lesson.objectives
              .map((o) => `<li>${icon('check')}<span>${inline(o)}</span></li>`)
              .join('')}
          </ul>
        </div>

        ${
          lesson.prereq?.length
            ? `<p class="dim" style="font-size:0.875rem;margin-bottom:24px">
                 <strong style="color:var(--ink-2)">Prasyarat:</strong> ${inline(lesson.prereq.join(' · '))}
               </p>`
            : ''
        }

        ${renderBlocks(lesson.blocks, priorCode(mod, index))}

        ${recap}

        <div class="donebar">
          <span class="donebar__text">
            ${
              isDone
                ? 'Pelajaran ini sudah kamu tandai selesai.'
                : 'Sudah paham? Tandai pelajaran ini selesai agar progresmu tercatat di perangkat ini.'
            }
          </span>
          <button class="btn ${isDone ? 'btn--quiet' : ''}" type="button"
                  data-done-toggle data-module="${mod.id}" data-lesson="${lesson.id}"
                  data-done="${isDone}">
            ${icon(isDone ? 'check' : 'flag')} ${isDone ? 'Sudah selesai' : 'Tandai selesai'}
          </button>
        </div>

        ${exerciseBlock}
        ${pager}
      </div>
    </div>`;
}

/* Dipakai app.js untuk memutuskan halaman mana yang dirender. */
export function resolveModuleRoute(parts) {
  const mod = moduleById(parts[0]);
  if (!mod) return null;
  if (parts[1]) {
    const found = lessonById(parts[0], parts[1]);
    if (!found) return null;
    return { kind: 'lesson', ...found };
  }
  return { kind: 'module', module: mod };
}
