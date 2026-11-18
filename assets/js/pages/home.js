/* ==========================================================================
   home.js — beranda: sapaan, titik mulai, peta modul, dan cara belajar
   ========================================================================== */

import { esc, icon } from '../ui.js';
import { modules, totalLessons, totalMinutes, firstUnfinishedLesson, lessonById } from '../../../content/curriculum.js';
import { moduleCard, progressStrip } from '../components/cards.js';
import { renderCode } from '../components/blocks.js';
import { store } from '../store.js';

const HERO_CODE = `myFaktor <- function(a) {
  faktor <- c()
  for (i in 1:a) {
    if (a %% i == 0) {
      faktor <- c(faktor, i)
    }
  }
  return(faktor)
}

myFaktor(12)`;

function continueBlock() {
  const totals = store.totals(modules);
  const last = store.lastLesson();
  const target = last
    ? lessonById(last.moduleId, last.lessonId)
    : null;

  if (!target && totals.done === 0) return '';

  const found = target || (() => {
    const f = firstUnfinishedLesson(store);
    return lessonById(f.moduleId, f.lessonId);
  })();

  if (!found) return '';
  const { module: mod, lesson } = found;
  const isDone = store.isLessonDone(mod.id, lesson.id);

  return `
    <div class="continue rise">
      <div>
        <div class="continue__label">${isDone ? 'Terakhir dibaca' : 'Lanjutkan'}</div>
        <a class="continue__title" href="#/modul/${mod.id}/${lesson.id}"
           style="color:inherit;text-decoration:none">${esc(lesson.title)}</a>
        <div class="continue__meta">Modul ${mod.num} · ${esc(mod.title)} · ${lesson.duration} menit</div>
      </div>
      <a class="btn" href="#/modul/${mod.id}/${lesson.id}">
        ${isDone ? 'Buka lagi' : 'Lanjutkan'} ${icon('arrow-right', 'btn__arrow')}
      </a>
    </div>`;
}

export function renderHome() {
  const start = firstUnfinishedLesson(store);
  const startMod = modules.find((m) => m.id === start.moduleId);
  const hours = (Math.round(totalMinutes / 6) / 10).toFixed(1).replace('.', ',');

  return `
    <section class="hero">
      <div class="wrap wrap--wide">
        <div class="hero__grid">
          <div class="hero__copy">
            <span class="eyebrow">${icon('book')} Statistika 2026 · Algoritma dan Pemrograman</span>
            <h1>Belajar R,<br><span class="soft">dari nol sampai matriks.</span></h1>
            <p class="hero__sub">
              Empat modul yang mengikuti dokumen kuliah dosen. Setiap konsep
              dijelaskan dari intuisi, ditelusuri langkah demi langkah, lalu
              diuji dengan latihan yang tidak membocorkan jawaban.
            </p>
            <div class="hero__cta">
              <a class="btn btn--lg" href="#/modul/${startMod.id}/${start.lessonId}">
                Mulai belajar ${icon('arrow-right', 'btn__arrow')}
              </a>
              <a class="btn btn--ghost btn--lg" href="#/peta">Lihat peta materi</a>
            </div>
            <div class="hero__meta">
              <span>${icon('grid')} ${modules.length} modul</span>
              <span>${icon('list')} ${totalLessons} pelajaran</span>
              <span>${icon('clock')} ±${hours} jam baca</span>
              <span>${icon('check')} Tanpa akun</span>
            </div>
          </div>

          <div class="hero__demo">
            ${renderCode({
              code: HERO_CODE,
              label: 'myFaktor.R',
              out: `[1] 1 2 3 4 6 12`,
              outLabel: 'Keluaran di R 4.5',
            })}
            <p class="hero__caption">
              ${icon('check')} Keluaran di atas dijalankan dan diperiksa di R, bukan dikarang.
            </p>
          </div>
        </div>
      </div>
    </section>

    <div class="wrap wrap--wide">
      ${continueBlock()}
    </div>

    <section class="section">
      <div class="wrap wrap--wide">
        <div class="section__head">
          <div>
            <h2>Empat modul, satu jalur</h2>
            <p>Urutannya penting: vektor membutuhkan fungsi, dan matriks membutuhkan hasil kali titik dari vektor.</p>
          </div>
          <a class="btn btn--quiet btn--sm" href="#/peta">Peta lengkap ${icon('chevron-right', 'btn__arrow')}</a>
        </div>
        <div class="grid grid--2">
          ${modules.map((m) => moduleCard(m)).join('')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap wrap--wide">
        <div class="section__head">
          <div>
            <h2>Cara belajar di sini</h2>
            <p>Setiap pelajaran mengikuti urutan yang sama, sehingga kamu tahu apa yang harus dilakukan berikutnya.</p>
          </div>
        </div>
        <div class="path">
          <a class="path__step" href="#/modul/${modules[0].id}">
            <span class="path__n">01</span>
            <span class="path__t">Baca konsep dan contoh</span>
            <span class="path__d">Mulai dari masalah nyata, lalu masuk ke definisi dan kode yang sudah diuji.</span>
          </a>
          <div class="path__step">
            <span class="path__n">02</span>
            <span class="path__t">Telusuri langkahnya</span>
            <span class="path__d">Tabel tracing menunjukkan nilai setiap variabel di setiap putaran loop.</span>
          </div>
          <a class="path__step" href="#/playground">
            <span class="path__n">03</span>
            <span class="path__t">Jalankan dan ubah</span>
            <span class="path__d">Playground mengeksekusi subset R langsung di browser, tanpa server.</span>
          </a>
          <a class="path__step" href="#/latihan">
            <span class="path__n">04</span>
            <span class="path__t">Uji dengan latihan</span>
            <span class="path__d">Petunjuk bertahap dan pembahasan terbuka setelah kamu mencoba.</span>
          </a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap wrap--wide">
        <div class="section__head">
          <div>
            <h2>Yang membedakan situs ini</h2>
          </div>
        </div>
        <div class="grid grid--3">
          <div class="card card--quiet">
            <span class="tag tag--accent">Tracing</span>
            <h3 class="modcard__title" style="margin-top:12px;font-size:1rem">Nilai variabel terlihat</h3>
            <p class="modcard__desc" style="margin-top:6px">
              Loop dipecah menjadi tabel langkah demi langkah. Kamu bisa melihat
              nilai sebelum dan sesudah setiap perubahan, bukan hanya hasil akhir.
            </p>
          </div>
          <div class="card card--quiet">
            <span class="tag tag--accent">Latihan</span>
            <h3 class="modcard__title" style="margin-top:12px;font-size:1rem">Jawaban tidak langsung terbuka</h3>
            <p class="modcard__desc" style="margin-top:6px">
              Jawaban salah mendapat arahan konsep, bukan solusi. Pembahasan
              tersedia, tetapi kamu yang memutuskan kapan membukanya.
            </p>
          </div>
          <div class="card card--quiet">
            <span class="tag tag--accent">Playground</span>
            <h3 class="modcard__title" style="margin-top:12px;font-size:1rem">Jujur soal batasnya</h3>
            <p class="modcard__desc" style="margin-top:6px">
              Kode dijalankan oleh penafsir R-subset di browsermu, dan halaman
              itu menyebutkan dengan jelas apa yang didukung dan apa yang tidak.
            </p>
          </div>
        </div>
      </div>
    </section>

    ${store.totals(modules).done > 0 ? `<section class="section"><div class="wrap wrap--wide">${progressStrip(modules)}</div></section>` : ''}
  `;
}
