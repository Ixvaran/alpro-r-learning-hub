/* ==========================================================================
   tentang.js — tujuan situs, sumber materi, batasan, dan catatan koreksi
   ========================================================================== */

import { esc, icon } from '../ui.js';
import { modules, totalLessons, totalMinutes } from '../../../content/curriculum.js';
import { exercises } from '../../../content/exercises.js';
import { glossary } from '../../../content/glossary.js';

export function renderTentang() {
  const hours = (Math.round(totalMinutes / 6) / 10).toFixed(1).replace('.', ',');

  return `
    <div class="wrap wrap--wide">
      <div class="page-head">
        <span class="eyebrow">${icon('info')} Tentang</span>
        <h1>Media pendamping, bukan pengganti kuliah</h1>
        <p>
          Situs ini dibuat untuk membantu mahasiswa Statistika angkatan 2026
          memahami materi Algoritma dan Pemrograman, dan untuk memberi asisten
          bahan demonstrasi yang siap pakai.
        </p>
      </div>

      <div class="about">
        <div class="prose" style="max-width:none">
          <h2 style="margin-top:0">Dari mana materinya</h2>
          <p>
            Seluruh cakupan materi mengikuti empat dokumen kuliah yang diberikan
            dosen. Tidak ada topik kurikulum yang ditambahkan di luar itu:
            urutan, istilah, dan latihan wajibnya dipertahankan.
          </p>
          <ul>
            <li><code>Pertemuan 8 2026.pdf</code> — R sebagai bahasa pemrograman, data atomik, operator, dan pengantar vektor.</li>
            <li><code>Pert 9 Vektor.pdf</code> — vektor, indexing, aljabar vektor, dan hasil kali titik.</li>
            <li><code>Pernyataan Pengendali Program.pdf</code> — sembilan pernyataan kendali, penilaian pilihan ganda, iterasi numerik.</li>
            <li><code>Kuliah 11 2026 Pemrograman untuk Matriks.pdf</code> — matriks, array, dan data frame.</li>
          </ul>

          <h2>Yang ditambahkan situs ini</h2>
          <p>
            Beberapa hal bukan berasal dari dokumen dosen, melainkan keputusan
            pengembangan agar materi lebih mudah dipelajari. Semuanya ditandai
            di tempatnya:
          </p>
          <ul>
            <li>Tabel tracing langkah demi langkah untuk loop dan algoritma.</li>
            <li>Visualisasi vektor dan matriks yang bisa diklik.</li>
            <li>Petunjuk bertahap dan pembahasan pada setiap latihan.</li>
            <li>Penanda progres di perangkat, glosarium, dan playground.</li>
            <li>Pemeriksaan prasyarat seperti <code>a &gt; b</code> pada <code>cek_Faktor</code>.</li>
          </ul>

          <h2>Catatan koreksi</h2>
          <p>
            Dua hal di dokumen sumber tampak tidak konsisten. Keduanya tidak
            diubah diam-diam, melainkan dijelaskan di pelajaran terkait:
          </p>
          <ul>
            <li>
              Rumus iterasi ditulis <code>x(k+1) = e^x(k)</code> tanpa tanda
              minus, padahal kodenya memakai <code>-exp(x0)</code>. Kode itulah
              yang benar, dan situs ini mengikuti kode.
            </li>
            <li>
              Nama kolom pada contoh data frame ditulis <code>GaPok</code> dan
              <code>Gapok</code>, padahal kolomnya <code>GajiPokok</code>.
              Akibatnya muncul galat penggantian nol baris.
            </li>
          </ul>

          <h2 id="privasi">Privasi</h2>
          <p>
            Situs ini tidak meminta akun, tidak memakai analitik, dan tidak
            mengirim kode atau jawabanmu ke mana pun. Progres belajar disimpan
            di penyimpanan lokal browsermu, dan kode di playground hanya
            bertahan selama tab terbuka. Menghapus data situs di browser akan
            menghapus progres secara permanen.
          </p>

          <h2 id="batasan">Batasan yang perlu diketahui</h2>
          <p>
            Playground memakai penafsir subset R yang ditulis khusus untuk situs
            ini. Ia menjalankan sebagian besar sintaks keempat modul, tetapi
            bukan R yang sebenarnya: tidak ada paket, tidak ada grafik, dan
            tidak ada akses berkas. Semua keluaran yang ditampilkan di halaman
            materi diambil dari R 4.5 dan diperiksa terpisah dari simulator.
          </p>
          <p>
            Situs ini juga belum memiliki akun, papan peringkat, atau forum.
            Itu keputusan sadar: kualitas materi dan ketepatan latihan lebih
            penting daripada fitur sosial, dan fitur tersebut baru berguna
            setelah materinya teruji di kelas.
          </p>
        </div>

        <aside>
          <div class="factlist">
            <div class="factlist__row">
              <span class="factlist__k">Untuk</span>
              <span class="factlist__v">Mahasiswa Statistika angkatan 2026, Program Studi Statistika</span>
            </div>
            <div class="factlist__row">
              <span class="factlist__k">Mata kuliah</span>
              <span class="factlist__v">Algoritma dan Pemrograman (R)</span>
            </div>
            <div class="factlist__row">
              <span class="factlist__k">Cakupan</span>
              <span class="factlist__v">${modules.length} modul · ${totalLessons} pelajaran · ±${hours} jam baca</span>
            </div>
            <div class="factlist__row">
              <span class="factlist__k">Latihan</span>
              <span class="factlist__v">${exercises.length} soal · ${glossary.length} istilah glosarium</span>
            </div>
            <div class="factlist__row">
              <span class="factlist__k">Peran</span>
              <span class="factlist__v">Media pendamping asistensi; bukan pengganti kuliah dan bukan sumber nilai resmi</span>
            </div>
            <div class="factlist__row">
              <span class="factlist__k">Kode contoh</span>
              <span class="factlist__v">Diuji di R 4.5.2</span>
            </div>
          </div>

          <div class="card" style="margin-top:24px">
            <div class="panel__title">Mulai dari sini</div>
            <div style="display:grid;gap:8px">
              <a class="btn btn--quiet btn--block" href="#/peta">Peta materi</a>
              <a class="btn btn--quiet btn--block" href="#/latihan">Bank soal</a>
              <a class="btn btn--quiet btn--block" href="#/glosarium">Glosarium</a>
            </div>
          </div>
        </aside>
      </div>
    </div>`;
}
