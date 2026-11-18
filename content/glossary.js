/* ==========================================================================
   glossary.js — istilah teknis yang muncul di keempat modul
   Setiap entri: istilah, padanan/penjelasan singkat, dan contoh ringkas.
   ========================================================================== */

export const glossary = [
  {
    term: 'Akumulator',
    en: 'accumulator',
    def: 'Variabel yang menampung hasil sementara dan diperbarui setiap kali loop berjalan. Nilai awalnya harus berupa identitas operasi: 0 untuk penjumlahan, 1 untuk perkalian.',
    ex: 'total <- 0; for (x in v) total <- total + x',
  },
  {
    term: 'Argumen',
    en: 'argument',
    def: 'Nilai yang diberikan kepada fungsi saat dipanggil. Di dalam fungsi, argumen menjadi variabel lokal yang hanya hidup selama fungsi berjalan.',
    ex: 'luas(10, 5)  # 10 dan 5 adalah argumen',
  },
  {
    term: 'Array',
    en: 'array',
    def: 'Struktur data berdimensi tiga atau lebih. Paling mudah dibayangkan sebagai tumpukan matriks berukuran sama, dan hanya boleh memuat satu tipe data.',
    ex: 'array(1:24, dim = c(2, 3, 4))',
  },
  {
    term: 'Atomic',
    en: 'data atomik',
    def: 'Nilai tunggal yang tidak bisa dipecah lagi. Ada enam: character, double, integer, logical, complex, dan raw. Semua struktur data yang lebih besar dibangun dari tipe ini.',
    ex: '5, 5L, "lima", TRUE',
  },
  {
    term: 'Assignment',
    en: 'penugasan',
    def: 'Menyimpan nilai ke sebuah nama dengan operator <-. Nama itu lalu hidup di workspace sebagai objek.',
    ex: 'x <- 5',
  },
  {
    term: 'byrow',
    en: 'per baris',
    def: 'Argumen matrix() yang mengubah urutan pengisian dari per kolom menjadi per baris. Tanpa argumen ini, R mengisi menuruni kolom lebih dulu.',
    ex: 'matrix(1:6, nrow = 2, byrow = TRUE)',
  },
  {
    term: 'Coercion',
    en: 'konversi otomatis',
    def: 'Perubahan tipe yang dilakukan R tanpa diminta ketika tipe berbeda digabung. Urutannya logical → integer → double → complex → character.',
    ex: 'c(1, "a")  # menjadi "1" "a"',
  },
  {
    term: 'Data frame',
    en: 'tabel data',
    def: 'Struktur dua dimensi yang setiap kolomnya satu tipe, tetapi kolom berbeda boleh berbeda tipe. Berbeda dari matriks, jadi tidak bisa dipakai dengan %*%.',
    ex: 'data.frame(nama = c("A"), nilai = 80)',
  },
  {
    term: 'Dot product',
    en: 'hasil kali titik',
    def: 'Jumlah dari hasil kali pasangan elemen yang bersesuaian pada dua vektor sama panjang. Hasilnya satu angka, bukan vektor.',
    ex: 'sum(c(1,2,3) * c(4,5,6))  # 32',
  },
  {
    term: 'drop',
    en: 'pembuangan dimensi',
    def: 'Perilaku R membuang dimensi yang tersisa satu. A[i, ] menghasilkan vektor biasa, bukan matriks 1×n. Dicegah dengan drop = FALSE.',
    ex: 'class(m[, 2])            # "numeric"',
  },
  {
    term: 'Indeks',
    en: 'index',
    def: 'Nomor posisi elemen di dalam vektor atau matriks. Di R selalu dimulai dari 1, bukan 0. Indeks negatif berarti membuang posisi, bukan menghitung dari belakang.',
    ex: 'x[1], x[-1], x[x > 4]',
  },
  {
    term: 'Integer',
    en: 'bilangan bulat',
    def: 'Tipe bilangan bulat sejati, ditulis dengan akhiran L. Berbeda dari double yang menyimpan pecahan meskipun nilainya tampak bulat.',
    ex: '5L',
  },
  {
    term: 'Iterasi',
    en: 'iteration',
    def: 'Satu putaran penuh di dalam loop. Pada algoritma numerik, iterasi adalah satu perbaikan tebakan menuju jawaban.',
    ex: 'x1 <- -exp(x0) di dalam repeat',
  },
  {
    term: 'Kolom-mayor',
    en: 'column-major',
    def: 'Urutan penyimpanan yang mengisi dimensi pertama paling cepat. Inilah sebabnya matrix() mengisi per kolom dan A[i] memakai penomoran linear menuruni kolom.',
    ex: 'matrix(1:9, nrow = 3)[1, ]  # 1 4 7',
  },
  {
    term: 'Library',
    en: 'kepustakaan',
    def: 'Kumpulan fungsi yang termuat di R. Tujuh library dimuat otomatis; base berisi fungsi dasar aritmetika, logika, dan kontrol alur.',
    ex: 'sessionInfo()$basePkgs',
  },
  {
    term: 'Loop',
    en: 'perulangan',
    def: 'Blok perintah yang dijalankan berulang. for dipakai ketika cacah ulangan diketahui; while dan repeat ketika ditentukan oleh kondisi.',
    ex: 'for (i in seq_along(x)) { ... }',
  },
  {
    term: 'Matriks',
    en: 'matrix',
    def: 'Struktur dua dimensi yang dibentuk dari vektor ditambah atribut dim. Karena berasal dari vektor, ia hanya boleh memuat satu tipe data.',
    ex: 'matrix(1:9, nrow = 3)',
  },
  {
    term: 'Modulo',
    en: 'sisa hasil bagi',
    def: 'Sisa pembagian, ditulis %%. Berpasangan dengan %/% (hasil bagi bulat) memenuhi: yang dibagi = pembagi × hasil bagi + sisa.',
    ex: '25 %% 7   # 4',
  },
  {
    term: 'NA',
    en: 'not available',
    def: 'Penanda nilai yang tidak tersedia. Berbeda dari NULL: NA menempati satu posisi, sedangkan NULL berarti tidak ada objek sama sekali.',
    ex: 'x[10]   # NA bila panjang x kurang dari 10',
  },
  {
    term: 'Nested',
    en: 'bersarang',
    def: 'Struktur yang berada di dalam struktur sejenis, misalnya for di dalam for atau if di dalam if. Akumulator pada loop bersarang biasanya perlu di-reset di loop luar.',
    ex: 'for (i in ...) { for (j in ...) { ... } }',
  },
  {
    term: 'NULL',
    en: 'kosong',
    def: 'Nilai kosong dengan panjang 0. Muncul ketika if tanpa else tidak terpenuhi. Bukan galat, tetapi menyebar tanpa suara bila dipakai berhitung.',
    ex: 'length(NULL)   # 0',
  },
  {
    term: 'Pseudocode',
    en: 'kode semu',
    def: 'Algoritma yang ditulis dengan bahasa sehari-hari dan struktur terkendali, tanpa terikat sintaks bahasa pemrograman tertentu. Ditulis sebelum kode.',
    ex: 'INPUT a, b; PROSES sisa <- a %% b; OUTPUT sisa',
  },
  {
    term: 'Recycling',
    en: 'pendaurulangan',
    def: 'R mengulang vektor yang lebih pendek agar panjangnya cukup saat beroperasi dengan vektor yang lebih panjang. Hanya memberi peringatan bila panjangnya bukan kelipatan.',
    ex: 'c(1,2,3,4) + c(10,20)   # 11 22 13 24',
  },
  {
    term: 'Return',
    en: 'nilai kembali',
    def: 'Pernyataan yang mengakhiri fungsi dan mengembalikan nilai kepada pemanggil. Tanpa return, R mengembalikan hasil ekspresi terakhir.',
    ex: 'return(hasil)',
  },
  {
    term: 'Tracing',
    en: 'penelusuran',
    def: 'Menjalankan program secara manual langkah demi langkah sambil mencatat nilai setiap variabel, untuk membuktikan bahwa logika loop benar.',
    ex: 'Tabel: langkah, i, nilai sebelum, nilai sesudah',
  },
  {
    term: 'Vektor',
    en: 'vector',
    def: 'Data berdimensi satu yang dibangun dari data atomik. Menjadi bahan dasar matriks, array, dan kolom pada data frame.',
    ex: 'c(3, 4, 5, 9)',
  },
  {
    term: 'Workspace',
    en: 'ruang kerja',
    def: 'Kumpulan objek yang hidup selama sesi R berjalan. Fungsi yang baru dibuat harus tersimpan di sini sebelum bisa dipanggil.',
    ex: 'myfun1()   # berhasil bila myfun1 ada di workspace',
  },
];
