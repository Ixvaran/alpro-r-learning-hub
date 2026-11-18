/* ==========================================================================
   latihan.js — bank soal dengan penyaring modul, jenis, tingkat, dan pencarian
   ========================================================================== */

import { esc, icon, TYPE_LABEL } from '../ui.js';
import { modules } from '../../../content/curriculum.js';
import { exercises, counts, isAutoGraded } from '../../../content/exercises.js';
import { renderExercise } from '../components/exercise.js';
import { emptyState } from '../components/cards.js';
import { store } from '../store.js';

const state = { modul: 'all', jenis: 'all', level: 'all', q: '' };

const TYPE_ORDER = ['choice', 'predict', 'short', 'debug', 'code'];

function filterExercises() {
  const q = state.q.trim().toLowerCase();
  return exercises.filter((e) => {
    if (state.modul !== 'all' && e.module !== state.modul) return false;
    if (state.jenis !== 'all' && e.type !== state.jenis) return false;
    if (state.level !== 'all' && String(e.level) !== String(state.level)) return false;
    if (q) {
      const hay = `${e.prompt} ${e.explanation} ${(e.hints || []).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function chip(group, value, label, count, active) {
  return `<button class="chip" type="button" data-f="${group}" data-v="${value}"
            aria-pressed="${active}">${esc(label)}${
    count != null ? ` <span class="chip__count">${count}</span>` : ''
  }</button>`;
}

function listHtml() {
  const list = filterExercises();
  if (!list.length) {
    return emptyState({
      icon: 'search',
      title: 'Tidak ada latihan yang cocok',
      text: 'Coba longgarkan penyaring: pilih "Semua" pada modul, jenis, atau tingkat.',
      action: '<button class="btn btn--quiet btn--sm" type="button" data-reset-filter>Atur ulang penyaring</button>',
    });
  }
  return `<div class="exlist">${list
    .map((ex, i) => renderExercise(ex, i + 1, list.length))
    .join('')}</div>`;
}

export function renderLatihan() {
  const c = counts();
  const solved = store.totals(modules).solved;

  const modChips =
    chip('modul', 'all', 'Semua', c.total, state.modul === 'all') +
    modules
      .map((m) =>
        chip('modul', m.id, `Modul ${m.num}`, c.byModule[m.id] || 0, state.modul === m.id)
      )
      .join('');

  const typeChips =
    chip('jenis', 'all', 'Semua', c.total, state.jenis === 'all') +
    TYPE_ORDER.map((t) =>
      chip('jenis', t, TYPE_LABEL[t], c.byType[t] || 0, state.jenis === t)
    ).join('');

  const levelChips =
    chip('level', 'all', 'Semua', c.total, state.level === 'all') +
    [1, 2, 3, 4]
      .map((l) => chip('level', String(l), `Tingkat ${l}`, c.byLevel[l] || 0, state.level === String(l)))
      .join('');

  return `
    <div class="wrap wrap--wide">
      <div class="page-head">
        <span class="eyebrow">${icon('puzzle')} Latihan &amp; bank soal</span>
        <h1>${c.total} soal, dari membaca sampai membangun</h1>
        <p>
          Penyaring di bawah membantumu fokus. Soal pilihan ganda, prediksi
          output, dan debugging dinilai otomatis; soal menulis kode dibandingkan
          dengan solusi rujukan karena banyak bentuk jawaban yang sama-sama benar.
        </p>
      </div>

      <div class="filters" data-filters>
        <div class="filters__row">
          <span class="filters__label">Modul</span>
          ${modChips}
        </div>
        <div class="filters__row">
          <span class="filters__label">Jenis</span>
          ${typeChips}
        </div>
        <div class="filters__row">
          <span class="filters__label">Tingkat</span>
          ${levelChips}
        </div>
        <div class="filters__row">
          <span class="filters__label">Cari</span>
          <input class="ex__input" type="search" data-search
                 placeholder="Cari kata di dalam soal, misalnya: modulo, drop, prima"
                 value="${esc(state.q)}"
                 style="font-family:var(--font-text);max-width:420px" />
          <span class="dim" style="font-size:0.8125rem;margin-left:auto" data-count>
            ${solved > 0 ? `${solved} soal sudah kamu jawab benar` : ''}
          </span>
        </div>
      </div>

      <div data-list>${listHtml()}</div>
    </div>`;
}

/* ---- Aktivasi ---------------------------------------------------------- */
export function activateLatihan(root, { activateExercises }) {
  const filters = root.querySelector('[data-filters]');
  const list = root.querySelector('[data-list]');
  if (!filters || !list) return;

  let lastList = filterExercises();

  const repaint = () => {
    filters.querySelectorAll('[data-f]').forEach((btn) => {
      const g = btn.dataset.f;
      btn.setAttribute('aria-pressed', String(state[g] === btn.dataset.v));
    });
    list.innerHTML = listHtml();
    lastList = filterExercises();
    activateExercises(list, lastList);
    const counter = filters.querySelector('[data-count]');
    const solved = store.totals(modules).solved;
    if (counter) {
      counter.textContent = `${lastList.length} soal ditampilkan${
        solved > 0 ? ` · ${solved} sudah benar` : ''
      }`;
    }
  };

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-f]');
    if (btn) {
      state[btn.dataset.f] = btn.dataset.v;
      repaint();
      return;
    }
    if (e.target.closest('[data-reset-filter]')) {
      state.modul = 'all';
      state.jenis = 'all';
      state.level = 'all';
      state.q = '';
      const search = filters.querySelector('[data-search]');
      if (search) search.value = '';
      repaint();
    }
  });

  list.addEventListener('click', (e) => {
    if (e.target.closest('[data-reset-filter]')) {
      state.modul = 'all';
      state.jenis = 'all';
      state.level = 'all';
      state.q = '';
      const search = filters.querySelector('[data-search]');
      if (search) search.value = '';
      repaint();
    }
  });

  let timer = 0;
  filters.querySelector('[data-search]')?.addEventListener('input', (e) => {
    state.q = e.target.value;
    clearTimeout(timer);
    timer = setTimeout(repaint, 180);
  });

  repaint();
  activateExercises(list, lastList);
}

export function totalExercises() {
  return exercises.length;
}

export function autoGradedCount() {
  return exercises.filter(isAutoGraded).length;
}
