/* ==========================================================================
   blocks.js — perender blok konten materi
   Setiap blok adalah objek kecil { t: '...' } yang dihasilkan dari file
   content/moduleN.js, sehingga menambah materi tidak perlu menyentuh HTML.
   ========================================================================== */

import { esc, inline, icon, copyText, toast } from '../ui.js';
import { highlightR } from '../highlight.js';

/* ---- Blok kode --------------------------------------------------------- */

/* Blok yang aman dijadikan kode prasyarat di playground: bukan pseudocode,
   tidak ditandai mati, dan tidak berakhir dengan galat yang disengaja
   (misalnya contoh A %*% B yang memang tidak terdefinisi). */
export function isContextBlock(b) {
  return (
    b &&
    b.t === 'code' &&
    !b.plain &&
    b.run !== false &&
    !/\bError\b/.test(String(b.out || ''))
  );
}
export function renderCode({
  code,
  label = 'R',
  out = '',
  outLabel = 'Keluaran',
  plain = false,
  before = '',
  runnable = true,
}) {
  const body = plain ? esc(code) : highlightR(code);
  const hasOut = out && String(out).trim().length > 0;
  const showRun = !plain && runnable;
  // Kode prasyarat dari blok-blok sebelumnya ikut dikirim ke playground agar
  // contoh yang memakai variabel lama tetap bisa dijalankan. Disimpan di
  // <template> supaya tidak ikut terlihat maupun tersalin.
  const payload = JSON.stringify({ prelude: before || null, code });
  return `
    <div class="code${plain ? ' code--plain' : ''}">
      <div class="code__head">
        <span class="code__label">${esc(label)}</span>
        ${showRun ? `<template data-handoff>${esc(payload)}</template>` : ''}
        ${showRun ? `<button class="icon-btn" type="button" data-run-code aria-label="Jalankan kode ini di playground">
          ${icon('play')}<span>Jalankan</span>
        </button>` : ''}
        <button class="icon-btn" type="button" data-copy-code aria-label="Salin kode ke papan klip">
          ${icon('copy')}<span>Salin</span>
        </button>
      </div>
      <div class="code__body"><pre><code>${body}</code></pre></div>
      ${
        hasOut
          ? `<div class="code__out">
               <div class="code__out-head">${icon('terminal')}${esc(outLabel || 'Keluaran')}</div>
               <pre>${esc(out)}</pre>
             </div>`
          : ''
      }
    </div>`;
}

/* ---- Tabel ------------------------------------------------------------- */
function renderTable({ head = [], rows = [], caption = '' }) {
  const th = head.map((h) => `<th scope="col">${inline(h)}</th>`).join('');
  const tr = rows
    .map(
      (r) =>
        `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`
    )
    .join('');
  return `
    <div>
      <div class="table-wrap">
        <table class="tbl">
          <thead><tr>${th}</tr></thead>
          <tbody>${tr}</tbody>
        </table>
      </div>
      ${caption ? `<p class="dim" style="font-size:0.8125rem;margin-top:8px;max-width:64ch">${inline(caption)}</p>` : ''}
    </div>`;
}

/* ---- Langkah ----------------------------------------------------------- */
function renderSteps({ items = [] }) {
  const li = items
    .map(
      (s, i) => `
      <li class="steps__item">
        <span class="steps__n">${i + 1}</span>
        <div>
          <div class="steps__title">${inline(s.title)}</div>
          <div class="steps__text">${inline(s.text)}</div>
        </div>
      </li>`
    )
    .join('');
  return `<ol class="steps">${li}</ol>`;
}

/* ---- Callout ----------------------------------------------------------- */
const CALLOUT_ICON = {
  note: 'info',
  warm: 'alert',
  danger: 'alert',
  plain: 'info',
};

function renderCallout({ tone = 'note', title = '', text = '', items = [] }) {
  const cls = tone === 'note' ? '' : ` callout--${tone}`;
  const body = items.length
    ? items.map((p) => `<p>${inline(p)}</p>`).join('')
    : `<p>${inline(text)}</p>`;
  return `
    <div class="callout${cls}" role="note">
      ${icon(CALLOUT_ICON[tone] || 'info', 'callout__icon')}
      <div>
        ${title ? `<div class="callout__title">${inline(title)}</div>` : ''}
        ${body}
      </div>
    </div>`;
}

/* ---- Visualisasi vektor ------------------------------------------------ */
function renderVizVec({ values = [], caption = '', label = 'x' }) {
  const cells = values
    .map(
      (v, i) => `
      <button type="button" class="vcell" data-idx="${i + 1}" aria-pressed="false">
        <span class="vcell__val">${esc(v)}</span>
        <span class="vcell__idx">${i + 1}</span>
      </button>`
    )
    .join('');
  return `
    <div class="viz" data-vizvec data-name="${esc(label)}">
      <div class="vizvec__cells">${cells}</div>
      <p class="vizvec__read" data-viz-read>Pilih sebuah elemen untuk melihat nilainya.</p>
      ${caption ? `<p class="viz__cap">${inline(caption)}</p>` : ''}
    </div>`;
}

/* ---- Visualisasi matriks ----------------------------------------------- */
function renderVizMat({ rows = [], caption = '', label = 'X3' }) {
  const nCol = rows[0]?.length || 0;
  const head =
    `<tr><th></th>` +
    Array.from({ length: nCol }, (_, j) => `<th scope="col">[,${j + 1}]</th>`).join('') +
    `</tr>`;
  const body = rows
    .map(
      (r, i) =>
        `<tr><th scope="row">[${i + 1},]</th>` +
        r
          .map(
            (v, j) =>
              `<td><button type="button" data-i="${i + 1}" data-j="${j + 1}"
                 aria-label="Baris ${i + 1} kolom ${j + 1}, nilai ${v}">${esc(v)}</button></td>`
          )
          .join('') +
        `</tr>`
    )
    .join('');
  return `
    <div class="viz" data-vizmat data-name="${esc(label)}">
      <div class="vizmat__scroll">
        <table class="vizmat">
          <thead>${head}</thead>
          <tbody>${body}</tbody>
        </table>
      </div>
      <p class="vizvec__read" data-viz-read>Pilih sebuah sel untuk melihat indeksnya.</p>
      ${caption ? `<p class="viz__cap">${inline(caption)}</p>` : ''}
    </div>`;
}

/* ---- Tracing loop ------------------------------------------------------ */
function renderTrace({ title = '', cols = [], rows = [], note = '', out = '' }) {
  const head = cols.map((c) => `<th scope="col">${inline(c)}</th>`).join('');
  const body = rows
    .map(
      (r, i) =>
        `<tr data-row="${i}">${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`
    )
    .join('');
  return `
    <div class="trace" data-trace>
      <div class="trace__bar">
        <span class="trace__title">${esc(title)}</span>
        <button class="icon-btn" type="button" data-trace-prev aria-label="Langkah sebelumnya">${icon('arrow-left')}</button>
        <span class="trace__step" data-trace-step>1 / ${rows.length}</span>
        <button class="icon-btn" type="button" data-trace-next aria-label="Langkah berikutnya">${icon('arrow-right')}</button>
      </div>
      <div class="trace__scroll">
        <table>
          <thead><tr>${head}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>
      ${note ? `<div class="trace__out">${inline(note)}</div>` : ''}
      ${out ? `<div class="trace__out">Keluaran akhir: <b>${esc(out)}</b></div>` : ''}
    </div>`;
}

/* ---- Perender utama ---------------------------------------------------- */
export function renderBlock(b) {
  switch (b.t) {
    case 'lead':
      return `<p class="lead">${inline(b.text)}</p>`;
    case 'p':
      return `<p>${inline(b.text)}</p>`;
    case 'h2':
      return `<h2 id="${slug(b.text)}">${inline(b.text)}</h2>`;
    case 'h3':
      return `<h3>${inline(b.text)}</h3>`;
    case 'ul':
      return `<ul>${b.items.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`;
    case 'ol':
      return `<ol>${b.items.map((i) => `<li>${inline(i)}</li>`).join('')}</ol>`;
    case 'code':
      return renderCode({ ...b, runnable: b.run !== false });
    case 'table':
      return renderTable(b);
    case 'steps':
      return renderSteps(b);
    case 'callout':
      return renderCallout(b);
    case 'vizvec':
      return renderVizVec(b);
    case 'vizmat':
      return renderVizMat(b);
    case 'trace':
      return renderTrace(b);
    case 'quote':
      return `<blockquote class="muted" style="border-left:2px solid var(--line-strong);padding-left:16px;margin:0">${inline(b.text)}</blockquote>`;
    default:
      return '';
  }
}

export function renderBlocks(blocks = [], prior = []) {
  // Akumulasi kode sebelumnya untuk konteks playground. Blok pseudocode dan
  // blok yang tidak dapat dijalankan tidak ikut diakumulasi. Ukurannya
  // dibatasi agar halaman tidak membengkak.
  const LIMIT = 6000;
  const context = [...prior];
  // Saat memangkas, blok yang bukan definisi fungsi dibuang lebih dulu agar
  // fungsi pendukung tetap tersedia di playground.
  const trim = () => {
    while (context.length > 1 && context.join('\n\n').length > LIMIT) {
      const idx = context.findIndex((c) => !/<-[\s\S]*function\s*\(/.test(c));
      context.splice(idx === -1 ? 0 : idx, 1);
    }
  };
  trim();

  const parts = [];
  for (const b of blocks) {
    if (b.t === 'code' && !b.plain) {
      parts.push(renderBlock({ ...b, before: context.join('\n\n') }));
      if (isContextBlock(b)) {
        context.push(b.code);
        trim();
      }
    } else {
      parts.push(renderBlock(b));
    }
  }
  return `<div class="prose">${parts.join('\n')}</div>`;
}

function slug(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* ---- Aktivasi interaksi di dalam blok ---------------------------------- */
export function activateBlocks(root = document) {
  /* Salin kode */
  root.querySelectorAll('[data-copy-code]').forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', async () => {
      const box = btn.closest('.code');
      const codeEl = box?.querySelector('.code__body code');
      if (!codeEl) return;
      const ok = await copyText(codeEl.textContent);
      if (ok) {
        btn.dataset.done = 'true';
        btn.querySelector('span').textContent = 'Tersalin';
        toast('Kode disalin');
        setTimeout(() => {
          btn.dataset.done = 'false';
          btn.querySelector('span').textContent = 'Salin';
        }, 1800);
      } else {
        toast('Tidak bisa menyalin', 'alert');
      }
    });
  });

  /* Jalankan di playground */
  root.querySelectorAll('[data-run-code]').forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      const box = btn.closest('.code');
      const codeEl = box?.querySelector('.code__body code');
      if (!codeEl) return;
      const tpl = box.querySelector('template[data-handoff]');
      const payload = tpl ? tpl.content.textContent : codeEl.textContent;
      try {
        sessionStorage.setItem('alpro-lh-handoff-code', payload);
      } catch {
        /* penyimpanan sesi diblokir: playground tetap bisa dibuka manual */
      }
      window.location.hash = '#/playground';
    });
  });

  /* Visualisasi vektor */
  root.querySelectorAll('[data-vizvec]').forEach((viz) => {
    const read = viz.querySelector('[data-viz-read]');
    const name = viz.dataset.name || 'x';
    viz.querySelectorAll('.vcell').forEach((cell) => {
      cell.addEventListener('click', () => {
        const idx = cell.dataset.idx;
        const val = cell.querySelector('.vcell__val').textContent;
        viz.querySelectorAll('.vcell').forEach((c) => {
          c.dataset.active = 'false';
          c.setAttribute('aria-pressed', 'false');
        });
        cell.dataset.active = 'true';
        cell.setAttribute('aria-pressed', 'true');
        read.innerHTML = `<b>${esc(name)}[${esc(idx)}]</b> = ${esc(val)} — indeks ${esc(idx)} menunjuk elemen ke-${esc(idx)}.`;
      });
    });
  });

  /* Visualisasi matriks */
  root.querySelectorAll('[data-vizmat]').forEach((viz) => {
    const read = viz.querySelector('[data-viz-read]');
    const name = viz.dataset.name || 'A';
    viz.querySelectorAll('button[data-i]').forEach((cell) => {
      cell.addEventListener('click', () => {
        const { i, j } = cell.dataset;
        viz.querySelectorAll('button[data-i]').forEach((c) => {
          c.dataset.on = 'false';
          c.dataset.dim = 'true';
        });
        // Sorot seluruh baris dan kolom yang terlibat.
        viz.querySelectorAll(`button[data-i="${i}"]`).forEach((c) => {
          c.dataset.dim = 'false';
        });
        viz.querySelectorAll(`button[data-j="${j}"]`).forEach((c) => {
          c.dataset.dim = 'false';
        });
        cell.dataset.on = 'true';
        read.innerHTML = `<b>${esc(name)}[${esc(i)}, ${esc(j)}]</b> = ${esc(cell.textContent.trim())} — baris ${esc(i)}, kolom ${esc(j)}.`;
      });
    });
  });

  /* Tracing */
  root.querySelectorAll('[data-trace]').forEach((box) => {
    if (box.dataset.bound) return;
    box.dataset.bound = '1';
    const rows = [...box.querySelectorAll('tbody tr')];
    const stepEl = box.querySelector('[data-trace-step]');
    let at = 0;

    const paint = () => {
      rows.forEach((tr, i) => {
        tr.dataset.state = i === at ? 'current' : i < at ? 'done' : 'future';
      });
      if (stepEl) stepEl.textContent = `${at + 1} / ${rows.length}`;
      box.querySelector('[data-trace-prev]').disabled = at === 0;
      box.querySelector('[data-trace-next]').disabled = at === rows.length - 1;
    };

    box.querySelector('[data-trace-prev]').addEventListener('click', () => {
      at = Math.max(0, at - 1);
      paint();
    });
    box.querySelector('[data-trace-next]').addEventListener('click', () => {
      at = Math.min(rows.length - 1, at + 1);
      paint();
    });
    paint();
  });
}
