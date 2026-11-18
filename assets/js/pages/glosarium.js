/* ==========================================================================
   glosarium.js — istilah teknis dengan pencarian dan pengelompokan abjad
   ========================================================================== */

import { esc, icon } from '../ui.js';
import { glossary } from '../../../content/glossary.js';
import { emptyState } from '../components/cards.js';

const sorted = [...glossary].sort((a, b) =>
  a.term.localeCompare(b.term, 'id', { sensitivity: 'base' })
);

function groups(query = '') {
  const q = query.trim().toLowerCase();
  const list = q
    ? sorted.filter((g) =>
        `${g.term} ${g.en} ${g.def} ${g.ex}`.toLowerCase().includes(q)
      )
    : sorted;

  if (!list.length) {
    return emptyState({
      icon: 'search',
      title: 'Istilah tidak ditemukan',
      text: `Tidak ada istilah yang cocok dengan "${query}". Coba kata lain.`,
    });
  }

  const byLetter = new Map();
  for (const g of list) {
    const letter = g.term[0].toUpperCase();
    if (!byLetter.has(letter)) byLetter.set(letter, []);
    byLetter.get(letter).push(g);
  }

  return [...byLetter.entries()]
    .map(
      ([letter, items]) => `
      <div>
        <div class="gloss__letter" id="huruf-${letter}">${letter}</div>
        <div class="gloss">
          ${items
            .map(
              (g) => `
            <div class="gloss__item">
              <div class="gloss__term">${esc(g.term)}<small>${esc(g.en)}</small></div>
              <div class="gloss__def">
                ${esc(g.def)}
                <div style="margin-top:8px"><code>${esc(g.ex)}</code></div>
              </div>
            </div>`
            )
            .join('')}
        </div>
      </div>`
    )
    .join('');
}

export function renderGlosarium() {
  return `
    <div class="wrap wrap--wide">
      <div class="page-head">
        <span class="eyebrow">${icon('book')} Glosarium</span>
        <h1>${glossary.length} istilah yang dipakai di keempat modul</h1>
        <p>
          Definisi singkat beserta contoh satu baris. Kalau sebuah istilah
          muncul di materi dan kamu lupa artinya, halaman ini tempat pertama
          yang sebaiknya dibuka.
        </p>
      </div>

      <div class="filters" style="margin-bottom:28px">
        <div class="filters__row">
          <span class="filters__label">Cari</span>
          <input class="ex__input" type="search" data-gloss-search
                 placeholder="Misalnya: akumulator, drop, modulo"
                 style="font-family:var(--font-text);max-width:420px" />
        </div>
      </div>

      <div data-gloss-list>${groups()}</div>
    </div>`;
}

export function mountGlosarium(root) {
  const input = root.querySelector('[data-gloss-search]');
  const list = root.querySelector('[data-gloss-list]');
  if (!input || !list) return;
  let timer = 0;
  input.addEventListener('input', (e) => {
    const value = e.target.value;
    clearTimeout(timer);
    timer = setTimeout(() => {
      list.innerHTML = groups(value);
    }, 140);
  });
}
