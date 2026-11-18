/* ==========================================================================
   exercise.js — kartu latihan dengan penilaian, petunjuk bertahap, pembahasan
   Aturan umpan balik: jangan hanya menulis "benar/salah". Jawaban salah
   menerima arahan konsep, bukan langsung solusi lengkap.
   ========================================================================== */

import { esc, inline, icon, levelDots, LEVEL_LABEL, TYPE_LABEL } from '../ui.js';
import { renderCode } from './blocks.js';
import { store } from '../store.js';
import { checkChoice, checkText, isAutoGraded } from '../../../content/exercises.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function feedbackOk(explanation) {
  return `
    <div class="fb fb--ok" role="status">
      ${icon('check')}
      <div>
        <div class="fb__title">Tepat.</div>
        <p>${inline(explanation)}</p>
      </div>
    </div>`;
}

function feedbackNo() {
  return `
    <div class="fb fb--no" role="status">
      ${icon('bulb')}
      <div>
        <div class="fb__title">Belum tepat.</div>
        <p>Baca kembali petunjuk di bawah, lalu coba lagi. Pembahasan lengkap ada di bagian akhir — buka hanya setelah kamu benar-benar mencoba.</p>
      </div>
    </div>`;
}

function feedbackReveal(exercise) {
  return `
    <div class="fb fb--info" role="status">
      ${icon('info')}
      <div>
        <div class="fb__title">Pembahasan</div>
        <p>${inline(exercise.explanation)}</p>
      </div>
    </div>`;
}

export function renderExercise(ex, number, total) {
  const rec = store.exercise(ex.id);
  const typeLabel = TYPE_LABEL[ex.type] || ex.type;
  const auto = isAutoGraded(ex);

  let body = '';
  if (ex.code) body += renderCode({ code: ex.code, label: 'R', out: '', outLabel: '' });

  if (ex.type === 'choice' || ex.type === 'debug') {
    body += `<div class="ex__options" role="radiogroup" aria-label="Pilihan jawaban">${ex.options
      .map(
        (o, i) => `
        <button type="button" class="opt" role="radio" aria-checked="false" data-opt="${i}">
          <span class="opt__mark">${LETTERS[i] || i + 1}</span>
          <span>${inline(o)}</span>
        </button>`
      )
      .join('')}</div>`;
  } else if (ex.type === 'code') {
    body += `
      <div class="callout callout--plain" style="margin-top:12px">
        ${icon('info', 'callout__icon')}
        <div>
          <div class="callout__title">Latihan menulis kode</div>
          <p>Tulis jawabanmu di R, jalankan, lalu bandingkan dengan solusi. Latihan jenis ini tidak dinilai otomatis karena banyak jawaban benar yang berbeda bentuk.</p>
        </div>
      </div>`;
  } else {
    body += `
      <label class="visually-hidden" for="ans-${ex.id}">Jawabanmu</label>
      <input class="ex__input" id="ans-${ex.id}" type="text" autocomplete="off"
             spellcheck="false" placeholder="Tulis jawabanmu di sini" />`;
  }

  const actions = auto
    ? `<button class="btn btn--sm" type="button" data-check>Periksa jawaban</button>
       <button class="btn btn--ghost btn--sm" type="button" data-retry>Ulangi</button>`
    : `<button class="btn btn--sm" type="button" data-check>Bandingkan dengan solusi</button>`;

  const hints = (ex.hints || []).length
    ? `<details class="acc acc--hint">
         <summary class="acc__sum">${icon('bulb')}Petunjuk <span class="acc__chev">${icon('chevron-right', 'acc__chev')}</span></summary>
         <div class="acc__body">
           <ol style="padding-left:1.1em;display:grid;gap:8px">
             ${ex.hints.map((h) => `<li>${inline(h)}</li>`).join('')}
           </ol>
         </div>
       </details>`
    : '';

  const solution = ex.solution
    ? `<details class="acc" data-solution>
         <summary class="acc__sum">${icon('code')}Solusi rujukan <span class="acc__chev">${icon('chevron-right', 'acc__chev')}</span></summary>
         <div class="acc__body">
           ${renderCode({ code: ex.solution, label: 'Solusi', out: '', outLabel: '' })}
         </div>
       </details>`
    : '';

  const explanationAcc = ex.explanation
    ? `<details class="acc" data-explain>
         <summary class="acc__sum">${icon('book')}Pembahasan <span class="acc__chev">${icon('chevron-right', 'acc__chev')}</span></summary>
         <div class="acc__body"><p>${inline(ex.explanation)}</p></div>
       </details>`
    : '';

  const attempts = rec?.attempts
    ? `<span class="muted">${rec.correct > 0 ? 'Sudah kamu jawab benar' : `Sudah dicoba ${rec.attempts} kali`}</span>`
    : '';

  return `
    <article class="ex" data-ex="${esc(ex.id)}" data-type="${esc(ex.type)}">
      <div class="ex__head">
        <span class="ex__id">Latihan ${number} dari ${total}</span>
        <span class="tag">${esc(typeLabel)}</span>
        <span class="tag" title="Tingkat ${ex.level} — ${LEVEL_LABEL[ex.level] || ''}">
          ${levelDots(ex.level)} Tingkat ${ex.level}
        </span>
      </div>
      <div class="ex__body">
        <p class="ex__prompt">${inline(ex.prompt)}</p>
        ${body}
        <div class="ex__actions">
          ${actions}
          ${attempts}
        </div>
        <div data-feedback></div>
        ${solution}
        ${hints}
        ${explanationAcc}
      </div>
    </article>`;
}

/* ---- Aktivasi ---------------------------------------------------------- */
export function activateExercises(root, exerciseList = []) {
  root.querySelectorAll('[data-ex]').forEach((card) => {
    const id = card.dataset.ex;
    const ex = exerciseList.find((e) => e.id === id);
    if (!ex || card.dataset.bound) return;
    card.dataset.bound = '1';

    const fb = card.querySelector('[data-feedback]');
    const options = [...card.querySelectorAll('[data-opt]')];
    const input = card.querySelector('.ex__input');
    const checkBtn = card.querySelector('[data-check]');
    const retryBtn = card.querySelector('[data-retry]');
    let picked = null;

    options.forEach((opt) => {
      opt.addEventListener('click', () => {
        picked = Number(opt.dataset.opt);
        options.forEach((o) => {
          o.dataset.state = o === opt ? 'selected' : '';
          o.setAttribute('aria-checked', o === opt ? 'true' : 'false');
        });
        fb.innerHTML = '';
      });
    });

    /* ---- Latihan menulis kode: bandingkan, lalu nilai sendiri ---- */
    if (ex.type === 'code') {
      checkBtn.addEventListener('click', () => {
        const sol = card.querySelector('[data-solution]');
        const exp = card.querySelector('[data-explain]');
        if (sol) sol.open = true;
        if (exp) exp.open = true;
        store.recordExercise(ex.id, { correct: null, revealed: true });
        fb.innerHTML = feedbackReveal(ex);
        checkBtn.textContent = 'Sudah dibandingkan';
        checkBtn.disabled = true;
        if (retryBtn) retryBtn.hidden = false;
      });
      return;
    }

    /* ---- Pilihan ganda dan debugging ---- */
    if (ex.type === 'choice' || ex.type === 'debug') {
      checkBtn.addEventListener('click', () => {
        if (picked === null) {
          fb.innerHTML = `
            <div class="fb fb--info" role="status">${icon('info')}
              <div><div class="fb__title">Pilih satu jawaban dulu.</div></div>
            </div>`;
          return;
        }
        const ok = checkChoice(ex, picked);
        options.forEach((o) => {
          const i = Number(o.dataset.opt);
          // Setelah dinilai: kunci selalu ditandai benar, pilihan keliru
          // ditandai salah, sisanya diredupkan. Ini memberi tahu jawaban
          // yang benar tanpa menyembunyikan di mana letak kesalahannya.
          if (i === Number(ex.answer)) o.dataset.state = 'correct';
          else if (i === picked) o.dataset.state = 'wrong';
          else o.dataset.state = 'muted';
          o.setAttribute('aria-checked', i === picked ? 'true' : 'false');
        });
        store.recordExercise(ex.id, { correct: ok });
        fb.innerHTML = ok ? feedbackOk(ex.explanation) : feedbackNo();
        if (ok) {
          checkBtn.disabled = true;
          const acc = card.querySelector('[data-explain]');
          if (acc) acc.open = true;
        }
      });
    } else {
      /* ---- Prediksi output / jawaban singkat ---- */
      checkBtn.addEventListener('click', () => {
        const value = input.value.trim();
        if (!value) {
          fb.innerHTML = `
            <div class="fb fb--info" role="status">${icon('info')}
              <div><div class="fb__title">Tulis jawabanmu dulu.</div></div>
            </div>`;
          return;
        }
        const ok = checkText(ex, value);
        input.dataset.state = ok ? 'correct' : 'wrong';
        store.recordExercise(ex.id, { correct: ok });
        fb.innerHTML = ok ? feedbackOk(ex.explanation) : feedbackNo();
        if (ok) {
          checkBtn.disabled = true;
          const acc = card.querySelector('[data-explain]');
          if (acc) acc.open = true;
        }
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') checkBtn.click();
      });
    }

    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        picked = null;
        options.forEach((o) => {
          o.dataset.state = '';
          o.setAttribute('aria-checked', 'false');
        });
        if (input) {
          input.value = '';
          input.dataset.state = '';
        }
        fb.innerHTML = '';
        checkBtn.disabled = false;
        card.querySelectorAll('[data-explain]').forEach((d) => {
          d.open = false;
        });
      });
    }
  });
}
