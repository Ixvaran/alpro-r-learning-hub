/* ==========================================================================
   tools/verify.mjs — pemeriksaan otomatis lewat Chrome DevTools Protocol.
   Jalankan: node tools/verify.mjs http://localhost:8811
   ========================================================================== */

import { launch } from './browser.mjs';

const BASE = process.argv[2] || 'http://localhost:8811';
const results = [];

function check(name, pass, detail = '') {
  results.push({ name, pass, detail });
  const mark = pass ? 'PASS' : 'FAIL';
  console.log(`${mark}  ${name}${detail ? ` — ${detail}` : ''}`);
}

const ROUTES = [
  ['#/', 'Belajar R'],
  ['#/peta', 'Empat modul, urutan yang sengaja'],
  ['#/modul/r-dasar', 'R dan Fungsi Dasar'],
  ['#/modul/r-dasar/tipe-atomik', 'Enam tipe data atomik'],
  ['#/modul/vektor/operasi-vektor', 'Operasi vektor'],
  ['#/modul/kendali/while-repeat', 'while, repeat'],
  ['#/modul/matriks/kali-matriks', 'Perkalian matriks'],
  ['#/latihan', 'soal, dari membaca sampai membangun'],
  ['#/playground', 'Jalankan R di browser'],
  ['#/progres', 'Progres saya'],
  ['#/glosarium', 'istilah yang dipakai'],
  ['#/tentang', 'Media pendamping'],
];

const b = await launch({ width: 1440, height: 1000 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- 1. Rute ---------- */
for (const [hash, expect] of ROUTES) {
  await b.goto(`${BASE}/${hash}`, { theme: 'light', wait: 700 });
  const text = await b.evaluate('document.getElementById("main").innerText');
  const h1 = await b.evaluate('document.querySelector("#main h1")?.innerText || ""');
  const err = await b.evaluate('window.__err || ""');
  check(
    `Rute ${hash}`,
    text.toLowerCase().includes(String(expect).toLowerCase()) && h1.length > 0,
    h1 ? `h1: ${h1.slice(0, 42)}` : 'h1 kosong'
  );
}

/* ---------- 2. Tidak ada galat konsol ---------- */
const errs = [];
b.send('Runtime.enable');
await b.goto(`${BASE}/#/modul/vektor/operasi-vektor`, { theme: 'light', wait: 800 });
const r = await b.goto(`${BASE}/#/latihan`, { theme: 'light', wait: 800 });
check('Tidak ada galat konsol', r.errors.length === 0, r.errors.join(' | ').slice(0, 200));

/* ---------- 3. Latihan pilihan ganda: benar dan salah ---------- */
await b.goto(`${BASE}/#/modul/r-dasar/mengenal-r`, { theme: 'light', wait: 800 });
const exExists = await b.evaluate(
  'document.querySelectorAll("[data-ex]").length'
);
check('Kartu latihan dirender', exExists >= 3, `${exExists} kartu`);

// Jawab salah dulu (opsi A)
await b.evaluate(`(() => {
  const card = document.querySelector('[data-ex="m1-l1-e1"]');
  card.querySelector('[data-opt="0"]').click();
  card.querySelector('[data-check]').click();
  return true;
})()`);
await sleep(200);
const wrongState = await b.evaluate(`(() => {
  const card = document.querySelector('[data-ex="m1-l1-e1"]');
  return {
    fb: card.querySelector('[data-feedback]').innerText.slice(0, 60),
    markedCorrect: card.querySelector('[data-opt="1"]').dataset.state,
    markedWrong: card.querySelector('[data-opt="0"]').dataset.state,
    disabled: card.querySelector('[data-check]').disabled
  };
})()`);
check(
  'Umpan balik jawaban salah',
  wrongState.fb.includes('Belum tepat') && wrongState.markedWrong === 'wrong',
  JSON.stringify(wrongState).slice(0, 120)
);
check(
  'Kunci ditandai tanpa membuka pembahasan',
  wrongState.markedCorrect === 'correct' && wrongState.disabled !== true,
  `kunci=${wrongState.markedCorrect}`
);

// Ulangi lalu jawab benar
await b.evaluate(`(() => {
  const card = document.querySelector('[data-ex="m1-l1-e1"]');
  card.querySelector('[data-retry]').click();
  card.querySelector('[data-opt="1"]').click();
  card.querySelector('[data-check]').click();
})()`);
await sleep(200);
const okState = await b.evaluate(`(() => {
  const card = document.querySelector('[data-ex="m1-l1-e1"]');
  return {
    fb: card.querySelector('[data-feedback]').innerText.slice(0, 40),
    disabled: card.querySelector('[data-check]').disabled
  };
})()`);
check('Umpan balik jawaban benar', okState.fb.includes('Tepat'), okState.fb);
check('Tombol periksa nonaktif setelah benar', okState.disabled === true);

/* ---------- 4. Latihan prediksi output ---------- */
await b.goto(`${BASE}/#/modul/vektor/membuat-vektor`, { theme: 'light', wait: 800 });
const predictRes = await b.evaluate(`(() => {
  const card = document.querySelector('[data-ex="m2-l1-e1"]');
  const input = card.querySelector('.ex__input');
  input.value = '2, 2, 2';
  card.querySelector('[data-check]').click();
  return card.querySelector('[data-feedback]').innerText.slice(0, 40);
})()`);
check('Prediksi output menerima format longgar', predictRes.includes('Tepat'), predictRes);

/* ---------- 5. Tandai selesai + penyimpanan ---------- */
await b.evaluate(`(() => {
  const btn = document.querySelector('[data-done-toggle]');
  if (btn.dataset.done !== 'true') btn.click();
})()`);
await sleep(250);
const stored = await b.evaluate(
  `JSON.parse(localStorage.getItem('alpro-lh-progress-v1') || '{}').lessons || {}`
);
check(
  'Progres tersimpan di localStorage',
  Object.keys(stored).some((k) => k.startsWith('vektor/membuat-vektor')),
  JSON.stringify(Object.keys(stored))
);
const navChip = await b.evaluate('document.querySelector("[data-nav-progress]").innerText');
check('Chip progres navbar ikut berubah', /1\/20/.test(navChip), navChip.trim());

/* ---------- 6. Playground benar-benar menjalankan kode ---------- */
await b.goto(`${BASE}/#/playground`, { theme: 'light', wait: 900 });
const runOut = await b.evaluate(`(() => {
  const ta = document.querySelector('[data-pg-input]');
  ta.value = 'x <- c(3, 4, 5, 9)\\nlength(x)\\n25 %% 7\\nsum(c(1,2,3) * c(4,5,6))\\nmyFaktor <- function(a){ f <- c(); for(i in 1:a) if (a %% i == 0) f <- c(f,i); f }\\nmyFaktor(12)';
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('[data-pg-run]').click();
  return document.querySelector('[data-pg-out]').innerText;
})()`);
check(
  'Playground menjalankan subset R',
  /\b4\b/.test(runOut) && runOut.includes('32') &&
    runOut.replace(/\s+/g, ' ').includes('1 2 3 4 6 12'),
  runOut.replace(/\\n/g, ' / ').slice(0, 120)
);

/* ---------- 7. Galat R ditampilkan ramah ---------- */
const errOut = await b.evaluate(`(() => {
  const ta = document.querySelector('[data-pg-input]');
  ta.value = 'x <- 1\\ny';
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('[data-pg-run]').click();
  return document.querySelector('[data-pg-out]').innerText;
})()`);
check(
  'Galat objek tidak ditemukan ditampilkan',
  /tidak ditemukan/i.test(errOut),
  errOut.replace(/\\n/g, ' / ').slice(0, 100)
);

/* ---------- 8. Loop tak berujung tidak membekukan browser ---------- */
const guard = await b.evaluate(`(() => {
  const ta = document.querySelector('[data-pg-input]');
  ta.value = 'repeat { x <- 1 }';
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  const t0 = Date.now();
  document.querySelector('[data-pg-run]').click();
  return { ms: Date.now() - t0, out: document.querySelector('[data-pg-out]').innerText };
})()`);
check(
  'Pengaman loop tak berujung',
  guard.ms < 8000 && /batas|langkah/i.test(guard.out),
  `${guard.ms} ms — ${guard.out.slice(0, 60)}`
);

/* ---------- 8b. Tombol Jalankan pada blok materi ---------- */
await b.goto(`${BASE}/#/modul/r-dasar/operator`, { theme: 'light', wait: 800 });
const handoff = await b.evaluate(`(() => {
  const btn = document.querySelector('[data-run-code]');
  if (!btn) return { found: false };
  btn.click();
  return { found: true };
})()`);
await sleep(500);
const handoffState = await b.evaluate(`(() => ({
  hash: location.hash,
  code: document.querySelector('[data-pg-input]')?.value || '',
}))()`);
check(
  'Tombol Jalankan membawa kode ke playground',
  handoff.found &&
    handoffState.hash === '#/playground' &&
    handoffState.code.includes('%/%'),
  handoffState.code.slice(0, 60).replace(/\n/g, ' / ')
);

/* ---------- 9. Penyaring bank soal ---------- */
await b.goto(`${BASE}/#/latihan`, { theme: 'light', wait: 800 });
const before = await b.evaluate('document.querySelectorAll("[data-ex]").length');
await b.evaluate(`document.querySelector('[data-f="modul"][data-v="matriks"]').click()`);
await sleep(300);
const after = await b.evaluate('document.querySelectorAll("[data-ex]").length');
check('Penyaring modul mempersempit daftar', after > 0 && after < before, `${before} → ${after}`);

const searchRes = await b.evaluate(`(() => {
  const input = document.querySelector('[data-search]');
  input.value = 'drop';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
})()`);
await sleep(400);
const searchCount = await b.evaluate('document.querySelectorAll("[data-ex]").length');
check('Pencarian teks pada bank soal', searchCount > 0 && searchCount <= after, `${searchCount} hasil`);

/* ---------- 10. Filter tidak menghasilkan galat saat kosong ---------- */
const emptyState = await b.evaluate(`(() => {
  const input = document.querySelector('[data-search]');
  input.value = 'zzzzz';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
})()`);
await sleep(400);
const emptyText = await b.evaluate('document.querySelector("[data-list]").innerText');
check('Keadaan kosong tampil saat pencarian nihil', /Tidak ada latihan/.test(emptyText));

/* ---------- 11. Glosarium ---------- */
await b.goto(`${BASE}/#/glosarium`, { theme: 'light', wait: 700 });
const glossBefore = await b.evaluate('document.querySelectorAll(".gloss__item").length');
await b.evaluate(`(() => {
  const i = document.querySelector('[data-gloss-search]');
  i.value = 'akumulator';
  i.dispatchEvent(new Event('input', { bubbles: true }));
})()`);
await sleep(300);
const glossAfter = await b.evaluate('document.querySelectorAll(".gloss__item").length');
check('Pencarian glosarium', glossBefore > 20 && glossAfter >= 1 && glossAfter <= 2, `${glossBefore} → ${glossAfter}`);

/* ---------- 12. Footer ---------- */
await b.goto(`${BASE}/#/`, { theme: 'light', wait: 700 });
const footText = await b.evaluate(
  'document.querySelector(".foot").innerText'
);
check(
  'Footer berisi tautan materi',
  footText.includes('Modul 4') && footText.includes('Glosarium'),
  footText.split('\\n').length + ' baris'
);

/* ---------- 13. Tema gelap ---------- */
await b.goto(`${BASE}/#/modul/matriks/membentuk-matriks`, { theme: 'dark', wait: 800 });
const bg = await b.evaluate(
  'getComputedStyle(document.body).backgroundColor'
);
check('Tema gelap aktif', /8, 9, 12|rgb\(8/.test(bg.replace(/\s/g, ' ')), bg);

/* ---------- 13b. Tema terang / gelap ---------- */
await b.goto(`${BASE}/#/`, { theme: 'light', wait: 700 });
const themeStart = await b.evaluate(`(() => ({
  theme: document.documentElement.dataset.theme,
  mode: document.documentElement.dataset.themeMode,
}))()`);
check(
  'Tema awal mengikuti sistem atau pilihan tersimpan',
  ['light', 'dark'].includes(themeStart.theme) &&
    ['auto', 'light', 'dark'].includes(themeStart.mode),
  JSON.stringify(themeStart)
);

const themeSwitch = await b.evaluate(`(() => {
  const trigger = document.querySelector('[data-theme-trigger]');
  trigger.click();
  const items = document.querySelectorAll('.theme-menu [data-theme-mode]');
  document.querySelector('[data-theme-mode="dark"]').click();
  return {
    items: items.length,
    theme: document.documentElement.dataset.theme,
    stored: localStorage.getItem('alpro-lh-theme'),
    bg: getComputedStyle(document.body).backgroundColor,
  };
})()`);
check(
  'Menu tema berisi tiga pilihan dan mengganti ke gelap',
  themeSwitch.items === 3 &&
    themeSwitch.theme === 'dark' &&
    themeSwitch.stored === 'dark' &&
    /8, 9, 12/.test(themeSwitch.bg),
  JSON.stringify(themeSwitch)
);

await b.goto(`${BASE}/#/peta`, { theme: 'light', wait: 700 });
const themePersist = await b.evaluate(
  `document.documentElement.dataset.theme`
);
check('Pilihan tema bertahan setelah muat ulang', themePersist === 'dark', themePersist);

// Kembalikan ke mode otomatis agar pemeriksaan berikutnya netral.
await b.evaluate(`(() => {
  document.querySelector('[data-theme-trigger]').click();
  document.querySelector('[data-theme-mode="auto"]').click();
})()`);

/* ---------- 14. Tidak ada luapan horizontal ---------- */
for (const w of [1440, 1024, 768, 390]) {
  await b.goto(`${BASE}/#/modul/kendali/for`, { theme: 'light', wait: 600, width: w, height: 900 });
  const overflow = await b.evaluate(
    'document.documentElement.scrollWidth - document.documentElement.clientWidth'
  );
  check(`Tidak ada luapan horizontal @${w}px`, overflow <= 1, `selisih ${overflow}px`);
}

/* ---------- 15. Menu seluler ---------- */
await b.goto(`${BASE}/#/`, { theme: 'light', wait: 700, width: 390, height: 844 });
const menu = await b.evaluate(`(() => {
  const t = document.querySelector('.nav__toggle');
  const visible = getComputedStyle(t).display !== 'none';
  t.click();
  const open = document.getElementById('navSheet').dataset.open === 'true';
  const links = document.querySelectorAll('#navSheet a').length;
  return { visible, open, links };
})()`);
check('Menu seluler terbuka', menu.visible && menu.open && menu.links >= 6, JSON.stringify(menu));

/* ---------- 16. Angka kunci jawaban konsisten ---------- */
const answers = await b.evaluate(`(() => {
  const cards = document.querySelectorAll('[data-ex]');
  return cards.length;
})()`);
check('Kartu latihan pada halaman beranda tidak dobel-bind', answers === 0, `${answers} kartu`);

/* ---------- Ringkasan ---------- */
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} pemeriksaan lulus`);
if (failed.length) {
  console.log('GAGAL:');
  failed.forEach((f) => console.log(' -', f.name, '|', f.detail));
  process.exitCode = 1;
}

await b.close();
