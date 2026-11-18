/* ==========================================================================
   playground.js — editor R kecil dengan penafsir subset yang berjalan di
   browser. Tidak ada permintaan jaringan: kode tidak pernah meninggalkan
   perangkat pengguna.
   ========================================================================== */

import { esc, icon, copyText, toast } from '../ui.js';
import { highlightR } from '../highlight.js';
import { runR } from '../r/interpreter.js';

const KEY = 'alpro-lh-playground-code';
const HANDOFF = 'alpro-lh-handoff-code';

const EXAMPLES = [
  {
    label: 'Vektor & indeks',
    code: `x <- c(3, 4, 5, 9)
x[3]
x[-2]
x[x > 4]
length(x)`,
  },
  {
    label: 'Faktor & prima',
    code: `myFaktor <- function(a) {
  faktor <- c()
  for (i in 1:a) {
    if (a %% i == 0) faktor <- c(faktor, i)
  }
  faktor
}

myFaktor(12)
myFaktor(25)`,
  },
  {
    label: 'Penilaian soal',
    code: `multiIf <- function(jawab, kunci) {
  if (jawab == kunci) return(4)
  if (jawab == " ")   return(0)
  if (kunci == " ")   return(4)
  return(-1)
}

jawaban <- c("a", "x", " ", "d", "e")
kunci   <- c("a", "b", "c", "d", " ")

total <- 0
for (i in seq_along(kunci)) {
  total <- total + multiIf(jawaban[i], kunci[i])
}
total`,
  },
  {
    label: 'Iterasi numerik',
    code: `x0 <- 0
i <- 1
repeat {
  x1 <- -exp(x0)
  d <- abs(x1 - x0)
  x0 <- x1
  if (d < 0.00001) break
  i <- i + 1
}
cat("ulangan:", i, "\\n")
cat("akar:", x1, "\\n")`,
  },
  {
    label: 'Matriks',
    code: `A <- matrix(c(3, 2, 2, 1, 1, 3), nrow = 2)
C <- matrix(c(2, 3, 4, 1, 1, 3, 1, 2, 2), nrow = 3)

A
A %*% C
A * A`,
  },
  {
    label: 'Data frame',
    code: `df <- data.frame(
  Nama = c("Heri", "Bambang", "Sumanto"),
  GajiPokok = c(5000000, 6000000, 6500000),
  Tunjangan = rep(1000000, 3)
)
df$Jumlah <- df$GajiPokok + df$Tunjangan
df`,
  },
];

/* Kode prasyarat dari halaman materi. Dijalankan diam-diam sebelum kode
   pengguna, sehingga panel keluaran hanya menampilkan hasil blok yang
   benar-benar dibuka. */
let initialPrelude = null;

function initialState() {
  try {
    const handoff = sessionStorage.getItem(HANDOFF);
    if (handoff) {
      sessionStorage.removeItem(HANDOFF);
      const parsed = JSON.parse(handoff);
      if (parsed && typeof parsed.code === 'string') {
        return { code: parsed.code, prelude: parsed.prelude || null };
      }
    }
    return {
      code: sessionStorage.getItem(KEY) || EXAMPLES[0].code,
      prelude: null,
    };
  } catch {
    return { code: EXAMPLES[0].code, prelude: null };
  }
}

export function renderPlayground() {
  const { code, prelude } = initialState();
  initialPrelude = prelude;

  return `
    <div class="wrap wrap--wide">
      <div class="page-head">
        <span class="eyebrow">${icon('terminal')} Playground</span>
        <h1>Jalankan R di browser</h1>
        <p>
          Tulis atau tempel kode R, lalu tekan <kbd>⌘</kbd> + <kbd>Enter</kbd>
          (atau <kbd>Ctrl</kbd> + <kbd>Enter</kbd>). Tidak ada server yang
          dihubungi.
        </p>
      </div>

      <div class="honest" style="margin-bottom:24px">
        ${icon('alert')}
        <div>
          <b>Ini penafsir subset R, bukan R yang sebenarnya.</b>
          Ia menjalankan sebagian besar sintaks yang dipakai di keempat modul —
          vektor, fungsi, percabangan, loop, matriks, dan data frame sederhana —
          tetapi tidak memuat seluruh paket R, tidak bisa membaca berkas, dan
          tidak menggambar grafik. Untuk pekerjaan sungguhan, gunakan R atau
          RStudio. Semua keluaran di halaman materi diambil dari R 4.5 dan
          terpisah dari simulator ini.
        </div>
      </div>

      <p class="dim" style="font-size:0.8125rem;margin:-8px 0 20px;max-width:70ch">
        Tombol <b>Jalankan</b> pada halaman materi mengirim potongan kode beserta
        contoh sebelumnya. Kalau tetap muncul pesan seperti
        <code>Objek 'X3' tidak ditemukan</code>, itu berarti potongan tersebut
        memakai variabel dari modul lain — jalankan dulu bagian yang
        mendefinisikannya, persis seperti di R.
      </p>

      <div class="pg" data-pg>
        <div class="pg__pane">
          <div class="pg__head">
            <span class="pg__title">Editor</span>
            <span class="tag tag--accent" data-pg-prelude hidden
                  title="Kode dari contoh sebelumnya dijalankan lebih dulu, tanpa ditampilkan">
              + kode prasyarat
            </span>
            <button class="icon-btn" type="button" data-pg-run>${icon('play')} Jalankan</button>
            <button class="icon-btn" type="button" data-pg-reset>${icon('reset')} Reset</button>
            <button class="icon-btn" type="button" data-pg-copy>${icon('copy')} Salin</button>
          </div>
          <div class="pg__editor">
            <div class="pg__gutter" data-pg-gutter aria-hidden="true">1</div>
            <pre aria-hidden="true"><code data-pg-highlight>${highlightR(code)}</code></pre>
            <textarea data-pg-input spellcheck="false" autocapitalize="off"
              autocomplete="off" autocorrect="off" aria-label="Editor kode R"
              wrap="off">${esc(code)}</textarea>
          </div>
        </div>

        <div class="pg__pane">
          <div class="pg__head">
            <span class="pg__title">Keluaran</span>
            <span class="pg__status" data-pg-status><b>siap</b></span>
          </div>
          <pre class="pg__out" data-pg-out aria-live="polite"><span class="o-idle">Tekan Jalankan untuk melihat keluaran.</span></pre>
        </div>
      </div>

      <div class="pg__examples">
        ${EXAMPLES.map(
          (ex, i) =>
            `<button class="chip" type="button" data-pg-example="${i}">${esc(ex.label)}</button>`
        ).join('')}
      </div>

      <p class="dim" style="font-size:0.8125rem;margin-top:16px;max-width:62ch">
        Kodemu hanya disimpan di penyimpanan sesi browsermu, tidak dikirim ke
        mana pun, dan hilang ketika tab ditutup. Tidak ada akun, tidak ada
        pelacakan.
      </p>
    </div>`;
}

/* ---- Aktivasi ---------------------------------------------------------- */
export function mountPlayground(root) {
  const pg = root.querySelector('[data-pg]');
  if (!pg || pg.dataset.bound) return;
  pg.dataset.bound = '1';

  let prelude = initialPrelude;
  const preludeTag = pg.querySelector('[data-pg-prelude]');
  const paintPrelude = () => {
    if (preludeTag) preludeTag.hidden = !prelude;
  };

  const ta = pg.querySelector('[data-pg-input]');
  const hl = pg.querySelector('[data-pg-highlight]');
  const gutter = pg.querySelector('[data-pg-gutter]');
  const pre = hl.parentElement;
  const out = pg.querySelector('[data-pg-out]');
  const status = pg.querySelector('[data-pg-status]');

  const remember = () => {
    try {
      sessionStorage.setItem(KEY, ta.value);
    } catch {
      /* penyimpanan penuh atau diblokir: abaikan, editor tetap berfungsi */
    }
  };

  const paintLines = () => {
    const n = ta.value.split('\n').length;
    gutter.textContent = Array.from({ length: n }, (_, i) => i + 1).join('\n');
  };

  const paintCode = () => {
    hl.innerHTML = highlightR(ta.value) + '\n';
    paintLines();
  };

  const syncScroll = () => {
    pre.scrollTop = ta.scrollTop;
    pre.scrollLeft = ta.scrollLeft;
    gutter.scrollTop = ta.scrollTop;
  };

  ta.addEventListener('input', () => {
    paintCode();
    remember();
  });
  ta.addEventListener('scroll', syncScroll);
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: en, value } = ta;
      ta.value = `${value.slice(0, s)}  ${value.slice(en)}`;
      ta.selectionStart = ta.selectionEnd = s + 2;
      paintCode();
      remember();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      run();
    }
  });

  function setStatus(text, ok = true) {
    status.innerHTML = ok ? `<b>${esc(text)}</b>` : `<span style="color:var(--danger)">${esc(text)}</span>`;
  }

  function render(lines, error, warnings = []) {
    if (!lines.length && !error && !warnings.length) {
      out.innerHTML = '<span class="o-idle">Tidak ada keluaran.</span>';
      return;
    }
    const html = lines
      .map((l) => {
        const cls =
          l.kind === 'error'
            ? 'o-err'
            : l.kind === 'warning' || l.kind === 'message'
            ? 'o-warn'
            : l.kind === 'cat'
            ? 'o-cat'
            : 'o-val';
        return `<span class="${cls}">${esc(l.text)}</span>`;
      })
      .join('\n');
    const warnHtml = warnings
      .map((w) => `\n<span class="o-warn">Peringatan: ${esc(w)}</span>`)
      .join('');
    // Galat sudah muncul sebagai baris keluaran; jangan dicetak dua kali.
    const errorAlreadyShown = lines.some((l) => l.kind === 'error');
    out.innerHTML =
      html +
      warnHtml +
      (error && !errorAlreadyShown ? `\n<span class="o-err">${esc(error)}</span>` : '');
  }

  function run() {
    const started = performance.now();
    setStatus('menjalankan…');
    let result;
    try {
      result = runR(ta.value, { maxSteps: 200000, prelude });
    } catch (err) {
      out.innerHTML = `<span class="o-err">Penafsir gagal dimuat: ${esc(
        err?.message || 'kesalahan tidak diketahui'
      )}</span>`;
      setStatus('gagal', false);
      return;
    }
    const ms = Math.round(performance.now() - started);
    const lines = Array.isArray(result?.lines) ? result.lines : [];
    render(lines, result?.error || null, result?.warnings || []);
    if (result?.ok) {
      setStatus(`selesai dalam ${ms} ms`);
    } else {
      // Ubah galat "tidak ditemukan/tidak dikenal" menjadi petunjuk langkah
      // berikutnya, karena penyebabnya hampir selalu potongan kode yang
      // dijalankan tanpa contoh sebelumnya.
      const missing = /(?:Objek|Fungsi) '([^']+)'/.exec(result?.error || '');
      if (missing) {
        out.innerHTML +=
          `\n<span class="o-idle">Petunjuk: '${esc(missing[1])}' belum ` +
          'didefinisikan di sesi ini. Jalankan dulu contoh yang membuatnya, ' +
          'atau tulis definisinya di atas.</span>';
      }
      setStatus('ada kesalahan', false);
    }
  }

  pg.querySelector('[data-pg-run]').addEventListener('click', run);
  pg.querySelector('[data-pg-reset]').addEventListener('click', () => {
    prelude = null;
    paintPrelude();
    ta.value = EXAMPLES[0].code;
    paintCode();
    remember();
    out.innerHTML = '<span class="o-idle">Editor direset ke contoh pertama.</span>';
    setStatus('siap');
  });
  pg.querySelector('[data-pg-copy]').addEventListener('click', async () => {
    if (await copyText(ta.value)) toast('Kode disalin');
    else toast('Tidak bisa menyalin', 'alert');
  });

  root.querySelectorAll('[data-pg-example]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ex = EXAMPLES[Number(btn.dataset.pgExample)];
      if (!ex) return;
      prelude = null;
      paintPrelude();
      ta.value = ex.code;
      paintCode();
      remember();
      ta.focus();
      out.innerHTML = '<span class="o-idle">Tekan Jalankan untuk melihat keluaran.</span>';
      setStatus('siap');
    });
  });

  paintCode();
  paintPrelude();
  syncScroll();
}
