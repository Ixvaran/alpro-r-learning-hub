/* ==========================================================================
   progres.js — ringkasan belajar, per modul, topik yang perlu diulang
   ========================================================================== */

import { esc, icon } from '../ui.js';
import { modules, lessonById } from '../../../content/curriculum.js';
import { exercises } from '../../../content/exercises.js';
import { store } from '../store.js';
import { emptyState } from '../components/cards.js';

export function renderProgres() {
  const t = store.totals(modules);
  const attempted = Object.entries(store.state.exercises);
  const wrongOnly = attempted.filter(([, v]) => !v.correct);

  const modRows = modules
    .map((m) => {
      const done = store.countDone(m);
      const pct = store.modulePercent(m);
      return `
        <div class="modstat">
          <div class="modstat__top">
            <span class="modstat__t">
              <span class="tag" style="margin-right:8px">Modul ${m.num}</span>
              ${esc(m.title)}
            </span>
            <span class="modstat__n">${done}/${m.lessons.length} · ${pct}%</span>
          </div>
          <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
               aria-label="Progres ${esc(m.title)}">
            <div class="bar__fill" style="width:${pct}%"></div>
          </div>
        </div>`;
    })
    .join('');

  const reviewRows = wrongOnly.length
    ? `<div class="exlist" style="grid-template-columns:1fr">${wrongOnly
        .slice(0, 8)
        .map(([id, rec]) => {
          const ex = exercises.find((e) => e.id === id);
          if (!ex) return '';
          const found = lessonById(ex.module, ex.lesson);
          return `
            <div class="card" style="padding:16px">
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
                <span class="tag tag--warm">Perlu diulang</span>
                <span class="dim" style="font-size:0.75rem">
                  ${found ? `Modul ${found.module.num} · ${esc(found.lesson.title)}` : ''}
                </span>
                <span class="dim" style="font-size:0.75rem;margin-left:auto">dicoba ${rec.attempts}×</span>
              </div>
              <p style="font-size:0.9375rem;margin-bottom:12px">${esc(ex.prompt)}</p>
              <a class="btn btn--quiet btn--sm"
                 href="#/modul/${ex.module}/${ex.lesson}">
                Buka pelajarannya ${icon('arrow-right', 'btn__arrow')}
              </a>
            </div>`;
        })
        .join('')}</div>`
    : emptyState({
        icon: 'check',
        title: 'Tidak ada soal yang tertinggal',
        text:
          t.attempted > 0
            ? 'Semua soal yang sudah kamu coba berhasil dijawab benar.'
            : 'Belum ada soal yang dicoba. Mulai dari latihan di akhir setiap pelajaran.',
        action: '<a class="btn btn--quiet btn--sm" href="#/latihan">Buka bank soal</a>',
      });

  return `
    <div class="wrap wrap--wide">
      <div class="page-head">
        <span class="eyebrow">${icon('chart')} Progres saya</span>
        <h1>${t.done === 0 ? 'Belum ada yang tercatat' : `${t.percent}% perjalanan selesai`}</h1>
        <p>
          Progres disimpan di perangkat ini saja, memakai penyimpanan lokal
          browser. Tidak ada akun dan tidak ada data yang dikirim ke server.
        </p>
      </div>

      ${
        store.memoryOnly
          ? `<div class="callout callout--warm" style="margin-bottom:24px">
               ${icon('alert', 'callout__icon')}
               <div>
                 <div class="callout__title">Progres tidak bisa disimpan</div>
                 <p>Browser ini menolak penyimpanan lokal (mungkin mode privat). Situs tetap berjalan, tetapi progres akan hilang saat halaman ditutup.</p>
               </div>
             </div>`
          : ''
      }

      <div class="statgrid">
        <div class="stat">
          <div class="stat__n">${t.done}<span class="dim" style="font-size:1rem">/${t.lessons}</span></div>
          <div class="stat__l">Pelajaran selesai</div>
        </div>
        <div class="stat">
          <div class="stat__n">${t.percent}%</div>
          <div class="stat__l">Progres keseluruhan</div>
        </div>
        <div class="stat">
          <div class="stat__n">${t.attempted}</div>
          <div class="stat__l">Soal dicoba</div>
        </div>
        <div class="stat">
          <div class="stat__n">${t.solved}</div>
          <div class="stat__l">Soal dijawab benar</div>
        </div>
      </div>

      <section class="section" style="padding-top:0;border-top:0">
        <div class="section__head">
          <div><h2 style="font-size:1.375rem">Per modul</h2></div>
        </div>
        <div class="card">${modRows}</div>
      </section>

      <section class="section">
        <div class="section__head">
          <div>
            <h2 style="font-size:1.375rem">Yang perlu diulang</h2>
            <p>Soal yang sudah kamu coba tetapi belum dijawab benar.</p>
          </div>
        </div>
        ${reviewRows}
      </section>

      <div class="danger-zone">
        <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:space-between">
          <div>
            <div style="font-weight:var(--fw-semibold);margin-bottom:4px">Atur ulang progres</div>
            <p class="dim" style="font-size:0.875rem;max-width:52ch">
              Menghapus catatan pelajaran selesai dan jawaban latihan di perangkat ini.
              Tindakan ini tidak bisa dibatalkan.
            </p>
          </div>
          <button class="btn btn--ghost" type="button" data-reset-progress>
            ${icon('reset')} Atur ulang
          </button>
        </div>
      </div>
    </div>`;
}

export function mountProgres(root) {
  const btn = root.querySelector('[data-reset-progress]');
  if (!btn) return;
  let armed = false;

  btn.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      btn.innerHTML = `${icon('alert')} Yakin? Klik lagi`;
      btn.style.borderColor = 'var(--danger-line)';
      btn.style.color = 'var(--danger)';
      setTimeout(() => {
        if (!armed) return;
        armed = false;
        btn.innerHTML = `${icon('reset')} Atur ulang`;
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 5000);
      return;
    }
    armed = false;
    store.reset();
    // Render ulang rute yang sama agar semua angka kembali ke nol.
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}
