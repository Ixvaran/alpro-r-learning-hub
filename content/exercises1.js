/* ==========================================================================
   exercises1.js — bank soal Modul 1 dan Modul 2
   Jenis: choice, predict, short, debug, code
   Untuk predict/short, `answer` berisi daftar jawaban yang diterima
   (perbandingan tidak peka spasi, koma, dan tanda kutip).
   ========================================================================== */

export const exercises12 = [
  /* ==================== MODUL 1 ==================== */
  {
    id: 'm1-l1-e1',
    module: 'r-dasar',
    lesson: 'mengenal-r',
    type: 'choice',
    level: 1,
    prompt: 'Di R tidak ada fungsi `main()` seperti di C atau Java. Apa yang menjadi satuan pekerjaan terkecil yang bisa dipanggil di R?',
    options: ['Baris perintah di jendela R', 'Fungsi', 'Berkas `.R`', 'Paket (package)'],
    answer: 1,
    hints: [
      'Pikirkan apa yang kamu tulis dengan `nama <- function(...)` lalu jalankan dengan `nama()`.',
      'Materi kuliah menyebutnya "program dalam R lebih dikenal sebagai …".',
    ],
    explanation:
      'Di R, satuan pekerjaan terkecil adalah fungsi. Berkas `.R` adalah wadah, paket adalah kumpulan fungsi, dan baris perintah hanyalah cara memanggil. Karena itu belajar pemrograman R berarti belajar membuat fungsi yang dapat dijalankan di platform R.',
  },
  {
    id: 'm1-l1-e2',
    module: 'r-dasar',
    lesson: 'mengenal-r',
    type: 'choice',
    level: 1,
    prompt: 'Library mana yang menyimpan fungsi untuk perhitungan matematika, logika, kontrol alur, dan manipulasi data?',
    options: ['`stats`', '`base`', '`utils`', '`graphics`'],
    answer: 1,
    hints: [
      'Library ini menyimpan `sum()`, `length()`, `matrix()`, dan kata kunci `if` serta `for`.',
      'Namanya paling dasar di antara ketujuh library.',
    ],
    explanation:
      '`base` adalah library dasar tempat semua fungsi inti hidup. Itulah sebabnya latihan-latihan di mata kuliah dibuat dengan meniru fungsi yang sudah ada di `base`: hasilnya bisa diuji langsung terhadap aslinya.',
  },
  {
    id: 'm1-l1-e3',
    module: 'r-dasar',
    lesson: 'mengenal-r',
    type: 'predict',
    level: 2,
    prompt: 'Ada berapa library yang dimuat otomatis ketika R dijalankan? Tulis jawabannya sebagai satu angka.',
    code: `length(sessionInfo()$basePkgs)`,
    answer: ['7'],
    hints: [
      'Materi menyebut "terdapat 7 library yang otomatis dimuat".',
      '`length()` menghitung cacah elemen.',
    ],
    explanation:
      'Jawabannya 7: `stats`, `graphics`, `grDevices`, `utils`, `datasets`, `methods`, dan `base`. `sessionInfo()$basePkgs` mengembalikan nama ketujuhnya sebagai vektor teks, dan `length()` menghitungnya.',
  },
  {
    id: 'm1-l2-e1',
    module: 'r-dasar',
    lesson: 'tipe-atomik',
    type: 'predict',
    level: 1,
    prompt: 'Apa keluaran baris berikut? Tulis `TRUE` atau `FALSE`.',
    code: `is.integer(5)`,
    answer: ['FALSE'],
    hints: [
      'Angka `5` tanpa akhiran adalah numerik real (double).',
      'Untuk mendapat integer, perlu ditulis `5L`.',
    ],
    explanation:
      '`is.integer(5)` bernilai `FALSE` karena `5` bertipe double. Bandingkan dengan `is.integer(5L)` yang bernilai `TRUE`. Ini contoh mengapa `typeof()` dan `is.integer()` lebih dapat dipercaya daripada melihat angka di layar.',
  },
  {
    id: 'm1-l2-e2',
    module: 'r-dasar',
    lesson: 'tipe-atomik',
    type: 'predict',
    level: 1,
    prompt: 'Apa keluaran `typeof()` berikut? Tulis tanpa tanda kutip.',
    code: `typeof(5L)`,
    answer: ['integer'],
    hints: [
      'Akhiran `L` bukan bagian dari nilai, melainkan penanda tipe.',
      'Kebalikannya, `typeof(5)` menghasilkan `"double"`.',
    ],
    explanation:
      'Akhiran `L` (dari *long integer*) memaksa R menyimpan 5 sebagai bilangan bulat sejati. Karena itu `typeof(5L)` menghasilkan `"integer"`, sedangkan `typeof(5)` menghasilkan `"double"`.',
  },
  {
    id: 'm1-l2-e3',
    module: 'r-dasar',
    lesson: 'tipe-atomik',
    type: 'choice',
    level: 2,
    prompt: 'Mengapa `c(1, "a")` menghasilkan `"1" "a"` dan bukan galat?',
    options: [
      'Karena R mengabaikan angka yang tidak bisa dibaca',
      'Karena R mengonversi seluruh isi vektor ke tipe terlonggar, yaitu character',
      'Karena `c()` selalu mengubah semua argumen menjadi teks',
      'Karena `1` dikutip secara otomatis oleh R',
    ],
    answer: 1,
    hints: [
      'Ada urutan tipe: logical → integer → double → complex → character.',
      'Tipe character adalah tipe "terlonggar" dalam urutan itu.',
    ],
    explanation:
      'R mengikuti aturan konversi otomatis: ketika tipe bercampur, semuanya diubah ke tipe terlonggar menurut urutan logical → integer → double → complex → character. Karena ada satu teks, seluruh vektor menjadi character. Inilah alasan satu vektor tidak bisa memuat angka dan teks sekaligus — dan alasan data frame ada.',
  },
  {
    id: 'm1-l2-e4',
    module: 'r-dasar',
    lesson: 'tipe-atomik',
    type: 'debug',
    level: 3,
    prompt: 'Fungsi berikut bermaksud memberi tahu apakah `x` bilangan bulat, tetapi memberi jawaban salah untuk `5L`. Apa masalahnya?',
    code: `cekBulat <- function(x) {
  if (is.double(x)) {
    "bilangan bulat"
  } else {
    "bukan bilangan bulat"
  }
}

cekBulat(5L)`,
    options: [
      '`is.double()` seharusnya `is.integer()`; kebalikannya terbalik',
      '`if` seharusnya `ifelse()`',
      '`5L` harus ditulis `5`',
      'Fungsi tidak memakai `return()`',
    ],
    answer: 0,
    hints: [
      'Perhatikan 5L: apakah ia double?',
      'Kalau `is.double(5L)` bernilai `FALSE`, cabang mana yang dijalankan?',
    ],
    explanation:
      'Label dan kondisinya tertukar. Untuk `5L`, `is.double(5L)` bernilai `FALSE`, sehingga fungsi menjawab "bukan bilangan bulat" — padahal `5L` justru bilangan bulat sejati. Perbaikannya memakai `is.integer(x)`. Kesalahan seperti ini lolos karena kalimatnya terdengar benar; satu-satunya cara menangkapnya adalah menguji dengan input yang sebenarnya.',
  },
  {
    id: 'm1-l2-e5',
    module: 'r-dasar',
    lesson: 'tipe-atomik',
    type: 'choice',
    level: 2,
    prompt: 'Mengapa menulis `TRUE` lebih aman daripada menulis `T` sebagai nilai logika?',
    options: [
      'Karena `T` tidak dikenali R',
      'Karena `T` hanyalah variabel biasa yang bisa ditimpa, sedangkan `TRUE` tidak',
      'Karena `T` bertipe character',
      'Karena `T` hanya berlaku di dalam fungsi',
    ],
    answer: 1,
    hints: [
      'Coba jalankan `T <- 7` di R.',
      'Apakah perintah itu berhasil? Kalau ya, apa akibatnya pada `if (T)`?',
    ],
    explanation:
      '`T` dan `F` adalah variabel bawaan, bukan konstanta yang dilindungi. `T <- 7` berhasil tanpa peringatan, dan setelah itu setiap `if (T)` berperilaku lain karena 7 dianggap `TRUE`. `TRUE` tidak bisa ditimpa, sehingga kode lebih tahan terhadap kecelakaan seperti ini.',
  },
  {
    id: 'm1-l3-e1',
    module: 'r-dasar',
    lesson: 'operator',
    type: 'predict',
    level: 1,
    prompt: 'Apa keluaran baris berikut?',
    code: `25 %% 7`,
    answer: ['4'],
    hints: [
      '`%%` berarti sisa hasil bagi.',
      '7 × 3 = 21, dan 25 − 21 = …',
    ],
    explanation:
      '`25 %% 7` bernilai 4, karena 7 masuk ke 25 sebanyak 3 kali (21) dan sisanya 4. Pasangannya `25 %/% 7` bernilai 3. Keduanya memenuhi 7 × 3 + 4 = 25.',
  },
  {
    id: 'm1-l3-e2',
    module: 'r-dasar',
    lesson: 'operator',
    type: 'predict',
    level: 1,
    prompt: 'Apa keluaran baris berikut?',
    code: `25 %/% 7`,
    answer: ['3'],
    hints: [
      '`%/%` berarti hasil bagi bulat, tanpa pecahan.',
      'Bandingkan dengan `25 / 7` yang bernilai 3.571429.',
    ],
    explanation:
      '`25 %/% 7` bernilai 3 karena ia membuang bagian pecahan, bukan membulatkan. Perhatikan bahwa `25 / 7` bernilai 3.571429 — operator yang berbeda memberi jawaban yang berbeda untuk pertanyaan yang berbeda.',
  },
  {
    id: 'm1-l3-e3',
    module: 'r-dasar',
    lesson: 'operator',
    type: 'predict',
    level: 3,
    prompt: 'Apa keluaran baris berikut?',
    code: `2 ^ 3 ^ 2`,
    answer: ['512'],
    hints: [
      'Operator pangkat dikerjakan dari kanan, bukan dari kiri.',
      'Hitung `3 ^ 2` lebih dulu.',
    ],
    explanation:
      'Pangkat berasosiasi ke kanan, jadi ini `2^(3^2)` = `2^9` = 512, bukan `(2^3)^2` = 64. Ini satu-satunya operator aritmetika R yang berasosiasi ke kanan, dan tanda kurung adalah cara termurah untuk menghilangkan keraguan.',
  },
  {
    id: 'm1-l3-e4',
    module: 'r-dasar',
    lesson: 'operator',
    type: 'short',
    level: 2,
    prompt: 'Diketahui 25 = 7 × 3 + 4. Operator R mana yang menghasilkan angka 4 dari 25 dan 7? Tulis operatornya saja.',
    answer: ['%%', '% %'],
    hints: [
      'Yang menghasilkan 3 adalah `%/%`.',
      'Yang menghasilkan 4 adalah sisa pembagian.',
    ],
    explanation:
      '`25 %% 7` bernilai 4 — sisa hasil bagi. Hubungan ketiga operator pembagian bisa diingat dengan satu identitas: yang dibagi = pembagi × hasil bagi + sisa. Kalau salah satu komponen hilang, kamu bisa menghitungnya dari yang lain.',
  },
  {
    id: 'm1-l3-e5',
    module: 'r-dasar',
    lesson: 'operator',
    type: 'debug',
    level: 3,
    prompt: 'Fungsi berikut bermaksud menghitung cacah pengurangan yang berhasil, seperti `%/%`. Tetapi `myBagi(25, 7)` mengembalikan hasil yang salah. Di mana kesalahannya?',
    code: `myBagi <- function(a, b) {
  hasil <- 0
  sisa  <- a
  while (sisa >= b) {
    sisa  <- sisa / b
    hasil <- hasil + 1
  }
  return(hasil)
}`,
    options: [
      '`sisa <- sisa / b` seharusnya `sisa <- sisa - b`',
      '`hasil <- 0` seharusnya `hasil <- 1`',
      '`while` seharusnya `for`',
      '`return(hasil)` seharusnya mengembalikan `sisa`',
    ],
    answer: 0,
    hints: [
      'Pembagian bulat bisa dihitung dengan pengurangan berulang: kurangi terus sampai tidak bisa lagi.',
      'Dengan `sisa / b`, nilai `sisa` menyusut terlalu cepat dan loop berhenti terlalu awal.',
    ],
    explanation:
      'Pembagian bulat sebagai pengurangan berulang berarti mengurangkan `b` dari `sisa`, bukan membaginya. Dengan `sisa <- sisa / b`, untuk 25 dan 7 urutannya 25 → 3.57 → berhenti, sehingga `hasil` hanya 1. Versi yang benar memakai `sisa <- sisa - b` dan menghasilkan `HASIL = 3` serta `SISA = 4`.',
  },
  {
    id: 'm1-l4-e1',
    module: 'r-dasar',
    lesson: 'fungsi-sendiri',
    type: 'predict',
    level: 1,
    prompt: 'Apa keluaran baris terakhir?',
    code: `luas <- function(panjang, lebar) {
  hasil <- panjang * lebar
  return(hasil)
}
luas(6, 7)`,
    answer: ['42'],
    hints: [
      'Argumen pertama menjadi `panjang`, kedua menjadi `lebar`.',
      '6 × 7 = …',
    ],
    explanation:
      '`luas(6, 7)` mengikat `panjang = 6` dan `lebar = 7`, sehingga `hasil` bernilai 42 dan `return()` mengirimnya kembali. Argumen diikat berdasarkan urutan, kecuali kamu menulis namanya secara eksplisit seperti `luas(lebar = 7, panjang = 6)`.',
  },
  {
    id: 'm1-l4-e2',
    module: 'r-dasar',
    lesson: 'fungsi-sendiri',
    type: 'code',
    level: 3,
    prompt: 'Buat fungsi `cek_Faktor(a, b)` yang mengembalikan `TRUE` bila `b` adalah faktor dari `a`, dan `FALSE` bila bukan. Prasyaratnya `a > b`.',
    hints: [
      '`b` faktor dari `a` bila `a` habis dibagi `b`, yaitu sisanya nol.',
      'Gunakan `a %% b == 0`, lalu bandingkan hasilnya dengan cara manual untuk `cek_Faktor(12, 3)` dan `cek_Faktor(12, 5)`.',
    ],
    solution: `cek_Faktor <- function(a, b) {
  if (a <= b) {
    stop("Prasyarat dilanggar: a harus lebih besar dari b.")
  }
  a %% b == 0
}

cek_Faktor(12, 3)   # TRUE
cek_Faktor(12, 5)   # FALSE`,
    explanation:
      'Inti jawabannya satu baris: `a %% b == 0`. Pemeriksaan `a <= b` bukan keharusan dari dosen, tetapi tambahan yang menjaga prasyarat: tanpa itu, `cek_Faktor(3, 12)` menjawab `FALSE` dengan tenang padahal pertanyaannya sendiri tidak sah. Perhatikan juga bahwa hasil perbandingan sudah berupa `TRUE`/`FALSE`, sehingga `return()` tidak wajib.',
  },
  {
    id: 'm1-l4-e3',
    module: 'r-dasar',
    lesson: 'fungsi-sendiri',
    type: 'code',
    level: 3,
    prompt: 'Buat fungsi `faktorial(n)` untuk bilangan bulat positif, dengan definisi n! = 1 × 2 × 3 × … × n.',
    hints: [
      'Siapkan wadah bernilai 1 (bukan 0), lalu kalikan dengan setiap bilangan dari 1 sampai n.',
      'Uji dengan `faktorial(5)`: hasilnya harus 120.',
    ],
    solution: `faktorial <- function(n) {
  hasil <- 1
  for (i in seq_len(n)) {
    hasil <- hasil * i
  }
  return(hasil)
}

faktorial(5)   # 120`,
    explanation:
      'Nilai awal harus 1 karena 1 adalah identitas perkalian. Kalau dimulai dari 0, semua hasilnya 0 — dan kesalahan itu tidak akan terlihat sampai kamu memeriksa hasilnya. `seq_len(n)` dipakai alih-alih `1:n` agar `n = 0` menghasilkan vektor kosong, sehingga `faktorial(0)` bernilai 1 sesuai konvensi matematika.',
  },
  {
    id: 'm1-l4-e4',
    module: 'r-dasar',
    lesson: 'fungsi-sendiri',
    type: 'debug',
    level: 3,
    prompt: 'Fungsi berikut bermaksud menghitung n!, tetapi `faktorial(5)` menghasilkan 0. Mengapa?',
    code: `faktorial <- function(n) {
  hasil <- 0
  for (i in 1:n) {
    hasil <- hasil * i
  }
  return(hasil)
}`,
    options: [
      '`hasil <- 0` seharusnya `hasil <- 1`',
      '`for (i in 1:n)` seharusnya `for (i in n:1)`',
      '`return(hasil)` seharusnya `return(i)`',
      'Perulangan tidak boleh dimulai dari 1',
    ],
    answer: 0,
    hints: [
      'Berapa hasil 0 × 1? Lalu 0 × 1 × 2?',
      'Nilai awal akumulator harus identitas operasinya.',
    ],
    explanation:
      'Akumulator perkalian harus dimulai dari 1, karena 1 × apa pun = apa pun. Dimulai dari 0, hasilnya tetap 0 berapa kali pun dikalikan. Bandingkan dengan penjumlahan, yang justru harus dimulai dari 0. Nilai awal akumulator selalu ditentukan oleh operasi yang dipakai, bukan oleh kebiasaan.',
  },
  {
    id: 'm1-l4-e5',
    module: 'r-dasar',
    lesson: 'fungsi-sendiri',
    type: 'choice',
    level: 2,
    prompt: 'Apa yang dikembalikan fungsi berikut ketika dipanggil `f(3)`?',
    code: `f <- function(x) {
  if (x %% 2 == 0) {
    "genap"
  }
}`,
    options: ['`"ganjil"`', '`NULL`', 'Galat karena tidak ada `else`', '`FALSE`'],
    answer: 1,
    hints: [
      '`3 %% 2` bernilai 1, jadi kondisinya `FALSE`.',
      'Tidak ada `else` dan tidak ada pernyataan lain setelah `if`.',
    ],
    explanation:
      'R mengembalikan nilai ekspresi terakhir. Ketika kondisinya `FALSE` dan tidak ada `else`, nilai ekspresi `if` adalah `NULL`, sehingga `f(3)` mengembalikan `NULL` dengan panjang 0. Ini bukan galat — dan justru itu yang berbahaya, karena `NULL` menyebar ke perhitungan berikutnya tanpa suara.',
  },

  /* ==================== MODUL 2 ==================== */
  {
    id: 'm2-l1-e1',
    module: 'vektor',
    lesson: 'membuat-vektor',
    type: 'predict',
    level: 1,
    prompt: 'Apa keluaran baris berikut?',
    code: `rep(2, 3)`,
    answer: ['2 2 2'],
    hints: [
      'Argumen pertama adalah nilai yang diulang, kedua adalah cacah ulangan.',
      'Jadi angka 2 muncul tiga kali.',
    ],
    explanation:
      '`rep(2, 3)` menghasilkan `2 2 2`. Argumen pertama adalah nilai, kedua adalah `times`. Kalau yang diulang adalah vektor, seluruh vektor diulang: `rep(c(1, 2), 3)` menghasilkan `1 2 1 2 1 2`.',
  },
  {
    id: 'm2-l1-e2',
    module: 'vektor',
    lesson: 'membuat-vektor',
    type: 'choice',
    level: 2,
    prompt: 'Mana yang menghasilkan vektor `0.0 0.5 1.0`?',
    options: [
      '`0:1`',
      '`seq(0, 1, by = 0.5)`',
      '`seq(0, 1)`',
      '`rep(0:1, 2)`',
    ],
    answer: 1,
    hints: [
      '`:` hanya bisa berlangkah 1.',
      '`seq(from, to, by)` menerima langkah berupa pecahan.',
    ],
    explanation:
      '`seq(0, 1, by = 0.5)` menghasilkan `0.0 0.5 1.0`. Operator `:` tidak bisa dipakai karena langkahnya selalu 1, dan `seq(0, 1)` tanpa `by` juga berlangkah 1 sehingga hanya memberi `0 1`.',
  },
  {
    id: 'm2-l1-e3',
    module: 'vektor',
    lesson: 'membuat-vektor',
    type: 'predict',
    level: 2,
    prompt: 'Berapa panjang vektor `3:10`? Tulis satu angka.',
    code: `length(3:10)`,
    answer: ['8'],
    hints: [
      'Angka 3, 4, 5, 6, 7, 8, 9, 10.',
      'Hitung cacahnya, bukan selisihnya.',
    ],
    explanation:
      'Vektornya berisi 3, 4, 5, 6, 7, 8, 9, 10 — delapan angka. Perhatikan bahwa 10 − 3 = 7, bukan 8. Cacah anggota berbeda dari selisih ujung, dan kesalahan ini sering muncul saat menentukan batas loop.',
  },
  {
    id: 'm2-l1-e4',
    module: 'vektor',
    lesson: 'membuat-vektor',
    type: 'choice',
    level: 2,
    prompt: 'Apa yang dihasilkan `10:1`?',
    options: [
      'Galat, karena awal lebih besar dari akhir',
      '`10 9 8 7 6 5 4 3 2 1`',
      '`1 2 3 4 5 6 7 8 9 10`',
      'Vektor kosong',
    ],
    answer: 1,
    hints: [
      'Operator `:` mengikuti arah dari ujung pertama ke ujung kedua.',
      'Ia tidak memaksa urutan menaik.',
    ],
    explanation:
      '`10:1` menghasilkan `10 9 8 7 6 5 4 3 2 1`. Operator `:` berjalan dari nilai pertama ke nilai kedua, apa pun arahnya — tidak seperti `seq()` yang butuh `by` negatif untuk berjalan mundur secara eksplisit.',
  },
  {
    id: 'm2-l2-e1',
    module: 'vektor',
    lesson: 'mengindeks',
    type: 'predict',
    level: 1,
    prompt: 'Apa keluaran baris berikut?',
    code: `c(3, 4, 5, 9)[3]`,
    answer: ['5'],
    hints: [
      'Indeks R dimulai dari 1.',
      'Elemen pertama adalah 3, kedua 4, ketiga …',
    ],
    explanation:
      'Elemen ketiga adalah 5, karena indeks 1 adalah 3, indeks 2 adalah 4, dan indeks 3 adalah 5. Kalau kamu terbiasa dengan bahasa yang mulai dari 0, jawaban yang muncul akan 4 — dan itulah galat off-by-one yang paling umum.',
  },
  {
    id: 'm2-l2-e2',
    module: 'vektor',
    lesson: 'mengindeks',
    type: 'predict',
    level: 2,
    prompt: 'Apa keluaran baris terakhir?',
    code: `x <- c(3, 4, 5, 9)
x[-2]`,
    answer: ['3 5 9'],
    hints: [
      'Indeks negatif berarti "buang posisi ini", bukan "hitung dari belakang".',
      'Yang dibuang adalah elemen kedua, yaitu 4.',
    ],
    explanation:
      '`x[-2]` mengembalikan semua elemen kecuali posisi kedua, yaitu `3 5 9`. Ini bukan pengambilan dari belakang. Untuk mengambil elemen terakhir, pakai `x[length(x)]` — cara itu bekerja untuk vektor sepanjang apa pun.',
  },
  {
    id: 'm2-l2-e3',
    module: 'vektor',
    lesson: 'mengindeks',
    type: 'choice',
    level: 2,
    prompt: 'Apa yang terjadi ketika kamu menjalankan `c(3, 4, 5, 9)[0]`?',
    options: [
      'Galat: indeks tidak boleh nol',
      'Mengembalikan `NA`',
      'Mengembalikan vektor kosong `numeric(0)`',
      'Mengembalikan elemen pertama, yaitu 3',
    ],
    answer: 2,
    hints: [
      'R tidak menjaga batas indeks dengan galat.',
      'Indeks nol berarti tidak ada posisi yang diminta.',
    ],
    explanation:
      'R mengembalikan vektor kosong `numeric(0)` tanpa galat. Ini berbahaya karena vektor kosong membuat `for` tidak berjalan sama sekali tanpa pesan apa pun. Untuk elemen pertama, tulis `x[1]` — bukan `x[0]` seperti di bahasa lain.',
  },
  {
    id: 'm2-l2-e4',
    module: 'vektor',
    lesson: 'mengindeks',
    type: 'predict',
    level: 2,
    prompt: 'Apa keluaran baris terakhir?',
    code: `x <- c(3, 4, 5, 9)
x[x > 4]`,
    answer: ['5 9'],
    hints: [
      '`x > 4` menghasilkan vektor logika sepanjang `x`.',
      'Posisi yang bernilai `TRUE` yang diambil.',
    ],
    explanation:
      '`x > 4` bernilai `FALSE FALSE TRUE TRUE`, sehingga `x[x > 4]` mengambil posisi ketiga dan keempat: `5 9`. Pola "buat kondisi, lalu jadikan kondisi sebagai indeks" akan kamu pakai terus, termasuk untuk menyaring baris matriks dan data frame.',
  },
  {
    id: 'm2-l2-e5',
    module: 'vektor',
    lesson: 'mengindeks',
    type: 'debug',
    level: 3,
    prompt: 'Fungsi berikut bermaksud mengembalikan elemen pertama dari sebuah vektor, tetapi `pertama(c(7, 8, 9))` mengembalikan vektor kosong. Mengapa?',
    code: `pertama <- function(x) {
  x[0]
}`,
    options: [
      'Indeks R dimulai dari 1, jadi seharusnya `x[1]`',
      '`x[0]` seharusnya `x[[0]]`',
      'Fungsi perlu `return()`',
      'Vektor tidak boleh diindeks dengan angka',
    ],
    answer: 0,
    hints: [
      'Di R, elemen pertama berindeks 1.',
      'Indeks 0 menghasilkan vektor kosong, bukan elemen pertama.',
    ],
    explanation:
      'Ini galat off-by-one khas mahasiswa yang terbiasa dengan C, Java, atau Python. Di R, elemen pertama adalah `x[1]`; `x[0]` mengembalikan `numeric(0)`. Karena vektor kosong tidak menimbulkan galat, bug ini bisa lolos jauh ke dalam perhitungan sebelum ketahuan.',
  },
  {
    id: 'm2-l3-e1',
    module: 'vektor',
    lesson: 'panjang-vektor',
    type: 'choice',
    level: 3,
    prompt: 'Sebuah vektor kosong disimpan di `x`. Apa yang terjadi pada `for (i in 1:length(x))`?',
    options: [
      'Loop tidak berjalan sama sekali',
      'Loop berjalan dua kali, karena `1:0` berisi `1` dan `0`',
      'Muncul galat karena panjangnya nol',
      'Loop berjalan satu kali dengan `i = 0`',
    ],
    answer: 1,
    hints: [
      '`length(x)` bernilai 0, jadi ekspresinya menjadi `1:0`.',
      'Coba jalankan `1:0` di R. Apakah hasilnya vektor kosong?',
    ],
    explanation:
      '`1:0` **tidak** menghasilkan vektor kosong — R menghasilkannya dengan berjalan mundur, yaitu `c(1, 0)`. Akibatnya loop berjalan dua kali untuk vektor yang tidak punya anggota. Gantinya `seq_along(x)`, yang menghasilkan vektor kosong ketika `x` kosong.',
  },
  {
    id: 'm2-l3-e2',
    module: 'vektor',
    lesson: 'panjang-vektor',
    type: 'code',
    level: 2,
    prompt: 'Buat fungsi `myLength(x)` yang mengembalikan cacah elemen `x` tanpa memakai `length()`.',
    hints: [
      'Siapkan penghitung `n <- 0`.',
      'Gunakan `for (nilai in x)` lalu tambah `n` dengan 1 setiap iterasi.',
    ],
    solution: `myLength <- function(x) {
  n <- 0
  for (nilai in x) {
    n <- n + 1
  }
  return(n)
}

myLength(c(9, 5, 6, 1, 2, 3, 4, 10, 10, 10, 10, 10))   # 12`,
    explanation:
      'Perhatikan bahwa `nilai` tidak pernah dipakai di dalam badan loop. Yang menentukan hasil hanya berapa kali loop berjalan. Inilah sebabnya `for (nilai in x)` lebih jujur untuk kasus ini: kamu tidak perlu tahu panjang vektor sebelum menghitungnya — sesuatu yang mustahil kalau justru panjang itulah yang dicari.',
  },
  {
    id: 'm2-l3-e3',
    module: 'vektor',
    lesson: 'panjang-vektor',
    type: 'predict',
    level: 2,
    prompt: 'Apa keluaran baris terakhir?',
    code: `myLength <- function(x) {
  n <- 0
  for (nilai in x) n <- n + 1
  return(n)
}
myLength(c(5, 5, 5))`,
    answer: ['3'],
    hints: [
      'Nilai 5 yang berulang tidak mengubah cacah.',
      'Loop berjalan sekali untuk setiap anggota.',
    ],
    explanation:
      'Jawabannya 3, karena vektornya punya tiga anggota. Perhatikan bahwa ketiga nilainya sama, dan itu tidak berpengaruh apa pun: `myLength` mengukur cacah posisi, bukan cacah nilai yang berbeda. Untuk nilai berbeda, fungsi yang tepat adalah `length(unique(x))`.',
  },
  {
    id: 'm2-l4-e1',
    module: 'vektor',
    lesson: 'operasi-vektor',
    type: 'predict',
    level: 1,
    prompt: 'Apa keluaran baris berikut?',
    code: `c(1, 2, 3) * 2`,
    answer: ['2 4 6'],
    hints: [
      'Perkalian dengan satu angka berlaku untuk setiap elemen.',
      '1×2, 2×2, 3×2.',
    ],
    explanation:
      'R mendaur ulang angka 2 menjadi sepanjang vektor, lalu mengalikan elemen per elemen: `2 4 6`. Perilaku ini disebut operasi vektorisasi, dan inilah yang membuat R ringkas — tetapi juga yang membuat `*` berbeda arti dari perkalian matriks.',
  },
  {
    id: 'm2-l4-e2',
    module: 'vektor',
    lesson: 'operasi-vektor',
    type: 'predict',
    level: 2,
    prompt: 'Apa keluaran baris berikut? Ini hasil kali titik, bukan perkalian elemen per elemen.',
    code: `sum(c(1, 2, 3) * c(4, 5, 6))`,
    answer: ['32'],
    hints: [
      'Hitung dulu `c(1,2,3) * c(4,5,6)`.',
      'Lalu jumlahkan ketiga hasilnya: 4 + 10 + 18.',
    ],
    explanation:
      'Perkalian elemen per elemen memberi `4 10 18`, lalu `sum()` menjumlahkannya menjadi 32. Ini definisi hasil kali titik: jumlah dari hasil kali pasangan elemen yang bersesuaian. `c(1,2,3) %*% c(4,5,6)` memberi angka yang sama, tetapi dalam bentuk matriks 1×1.',
  },
  {
    id: 'm2-l4-e3',
    module: 'vektor',
    lesson: 'operasi-vektor',
    type: 'choice',
    level: 2,
    prompt: 'Manakah yang merupakan hasil kali titik (dot product) dari `a` dan `b`?',
    options: ['`a * b`', '`a + b`', '`sum(a * b)`', '`length(a * b)`'],
    answer: 2,
    hints: [
      'Hasil kali titik menghasilkan satu angka, bukan vektor.',
      'Definisinya adalah jumlah dari hasil kali pasangan elemen.',
    ],
    explanation:
      '`sum(a * b)` adalah hasil kali titik: ia menjumlahkan hasil kali pasangan elemen menjadi satu angka. `a * b` hanya mengalikan elemen per elemen dan mengembalikan vektor. `a %*% b` juga benar, tetapi mengembalikan matriks 1×1, bukan angka telanjang.',
  },
  {
    id: 'm2-l4-e4',
    module: 'vektor',
    lesson: 'operasi-vektor',
    type: 'debug',
    level: 3,
    prompt: 'Fungsi berikut bermaksud mengembalikan hasil kali titik dua vektor, tetapi `dot(c(1,2,3), c(4,5,6))` mengembalikan `4 10 18`. Mengapa?',
    code: `dot <- function(a, b) {
  a * b
}`,
    options: [
      '`a * b` melakukan perkalian elemen per elemen, bukan hasil kali titik',
      'Seharusnya `a + b`',
      'Fungsi perlu `return()`',
      'Argumen harus diberi nama',
    ],
    answer: 0,
    hints: [
      'Perhatikan bentuk hasilnya: vektor atau satu angka?',
      'Definisi hasil kali titik memuat penjumlahan.',
    ],
    explanation:
      '`a * b` mengembalikan vektor `4 10 18`. Hasil kali titik adalah **jumlah** dari perkalian itu, sehingga yang benar `sum(a * b)` yang bernilai 32. Ini kesalahan paling berbahaya di modul ini karena R tidak mengeluh: hasilnya keluar, terlihat masuk akal, dan baru ketahuan salah ketika dipakai menghitung matriks di Modul 4.',
  },
  {
    id: 'm2-l4-e5',
    module: 'vektor',
    lesson: 'operasi-vektor',
    type: 'predict',
    level: 3,
    prompt: 'Apa keluaran baris berikut? Vektor yang lebih pendek didaur ulang.',
    code: `c(1, 2, 3, 4) + c(10, 20)`,
    answer: ['11 22 13 24'],
    hints: [
      '`c(10, 20)` diulang menjadi `10 20 10 20`.',
      'Jumlahkan seposisi.',
    ],
    explanation:
      '`c(10, 20)` didaur ulang menjadi `10 20 10 20`, sehingga hasilnya `11 22 13 24`. Pendaurulangan hanya memberi peringatan bila panjang yang lebih panjang bukan kelipatan yang lebih pendek — dan meskipun ada peringatan, hasilnya tetap keluar. Ini sumber salah hitung yang senyap.',
  },
  {
    id: 'm2-l5-e1',
    module: 'vektor',
    lesson: 'algoritma-vektor',
    type: 'code',
    level: 2,
    prompt: 'Buat fungsi `mySum(x)` yang menjumlahkan seluruh elemen vektor tanpa memakai `sum()`.',
    hints: [
      'Gunakan pola akumulator: satu wadah, satu loop, satu pembaruan.',
      'Nilai awal wadah untuk penjumlahan adalah 0.',
    ],
    solution: `mySum <- function(x) {
  total <- 0
  for (nilai in x) {
    total <- total + nilai
  }
  return(total)
}

mySum(c(9, 5, 6, 1, 2, 3, 4, 10, 10, 10, 10, 10))   # 80`,
    explanation:
      'Pola ini akan muncul berkali-kali: nilai awal, loop, pembaruan. Untuk penjumlahan nilai awalnya 0 karena 0 adalah identitas penjumlahan. Bandingkan dengan `myProd`, yang butuh 1 karena 1 adalah identitas perkalian — nilai awal akumulator selalu ditentukan oleh operasinya.',
  },
  {
    id: 'm2-l5-e2',
    module: 'vektor',
    lesson: 'algoritma-vektor',
    type: 'code',
    level: 3,
    prompt: 'Buat fungsi `myMax(x)` yang mencari nilai terbesar dalam vektor tanpa memakai `max()`. Pastikan fungsi benar untuk vektor yang seluruh anggotanya negatif.',
    hints: [
      'Inisialisasi wadah dengan elemen pertama, yaitu `x[1]`.',
      'Bandingkan setiap elemen dengan wadah, dan ganti bila lebih besar.',
    ],
    solution: `myMax <- function(x) {
  terbesar <- x[1]
  for (nilai in x) {
    if (nilai > terbesar) {
      terbesar <- nilai
    }
  }
  return(terbesar)
}

myMax(c(3, 9, 2))        # 9
myMax(c(-5, -2, -8))     # -2`,
    explanation:
      'Kunci jawabannya ada pada nilai awal: `x[1]`, bukan 0. Kalau dimulai dari 0, `myMax(c(-5, -2, -8))` akan mengembalikan 0 — angka yang tidak pernah ada di dalam vektor. Ujilah selalu dengan data negatif, karena data positif menyembunyikan kesalahan ini.',
  },
  {
    id: 'm2-l5-e3',
    module: 'vektor',
    lesson: 'algoritma-vektor',
    type: 'debug',
    level: 3,
    prompt: 'Fungsi berikut benar untuk data positif, tetapi `cariTerbesar(c(-5, -2, -8))` mengembalikan 0. Mengapa?',
    code: `cariTerbesar <- function(x) {
  hasil <- 0
  for (nilai in x) {
    if (nilai > hasil) hasil <- nilai
  }
  return(hasil)
}`,
    options: [
      '`hasil <- 0` seharusnya `hasil <- x[1]`',
      'Pembanding `>` seharusnya `>=`',
      'Loop seharusnya memakai indeks',
      'Fungsi perlu `max()`',
    ],
    answer: 0,
    hints: [
      'Kalau semua nilai negatif, apakah ada yang lebih besar dari 0?',
      'Nilai awal harus berasal dari dalam vektor itu sendiri.',
    ],
    explanation:
      'Dengan `hasil <- 0`, tidak ada nilai negatif yang lebih besar dari 0, sehingga hasilnya tetap 0 — nilai yang tidak pernah ada dalam vektor. Inisialisasi dengan `x[1]` menjamin wadah selalu berisi nilai yang benar-benar ada. Kesalahan ini lolos pada data uji positif, dan itulah sebabnya kasus tepi perlu diuji.',
  },
  {
    id: 'm2-l5-e4',
    module: 'vektor',
    lesson: 'algoritma-vektor',
    type: 'predict',
    level: 3,
    prompt: 'Fungsi berikut salah menempatkan inisialisasi. Apa keluarannya?',
    code: `jumlahSalah <- function(x) {
  for (nilai in x) {
    total <- 0
    total <- total + nilai
  }
  return(total)
}
jumlahSalah(c(1, 2, 3))`,
    answer: ['3'],
    hints: [
      '`total <- 0` ada di dalam loop, jadi dijalankan setiap iterasi.',
      'Setiap iterasi memulai dari nol lagi.',
    ],
    explanation:
      'Karena `total <- 0` berada di dalam loop, nilai lama selalu dihapus sebelum ditambah. Hasil akhirnya hanya elemen terakhir, yaitu 3. Inisialisasi harus berada **sebelum** loop. Kesalahan yang sama, dengan akibat berbeda, muncul pada loop bersarang di Modul 3.',
  },
  {
    id: 'm2-l5-e5',
    module: 'vektor',
    lesson: 'algoritma-vektor',
    type: 'code',
    level: 4,
    prompt: 'Buat fungsi `mySort(x)` yang mengurutkan vektor dari kecil ke besar tanpa memakai `sort()`. Gunakan algoritma pertukaran sederhana.',
    hints: [
      'Cari nilai terkecil di sisa vektor, tukar ke posisi paling depan, lalu ulangi.',
      'Pertukaran butuh variabel sementara agar satu nilai tidak hilang.',
    ],
    solution: `mySort <- function(x) {
  n <- length(x)
  for (i in 1:(n - 1)) {
    k <- i
    for (j in (i + 1):n) {
      if (x[j] < x[k]) k <- j
    }
    if (k != i) {
      sementara <- x[i]
      x[i] <- x[k]
      x[k] <- sementara
    }
  }
  return(x)
}

mySort(c(4, 1, 3, 2))   # 1 2 3 4`,
    explanation:
      'Algoritma ini disebut *selection sort*: setiap putaran memilih nilai terkecil dari bagian yang belum terurut, lalu menukarnya ke depan. Tiga baris pertukaran membutuhkan `sementara`; tanpa itu `x[i] <- x[k]` menimpa nilai lama sebelum sempat disalin, sehingga satu nilai hilang dan muncul nilai kembar.',
  },
  {
    id: 'm2-l6-e1',
    module: 'vektor',
    lesson: 'faktor-prima',
    type: 'code',
    level: 3,
    prompt: 'Buat fungsi `myFaktor(a)` yang mengembalikan vektor berisi semua faktor positif dari `a`.',
    hints: [
      'Siapkan wadah berupa vektor kosong: `faktor <- c()`.',
      'Untuk setiap `i` dari 1 sampai `a`, tempelkan `i` bila `a %% i == 0`.',
    ],
    solution: `myFaktor <- function(a) {
  faktor <- c()
  for (i in 1:a) {
    if (a %% i == 0) {
      faktor <- c(faktor, i)
    }
  }
  return(faktor)
}

myFaktor(12)   # 1 2 3 4 6 12
myFaktor(25)   # 1 5 25`,
    explanation:
      'Pola baru di sini: akumulatornya bukan angka, melainkan vektor kosong yang tumbuh dengan `c()`. Hasilnya selalu memuat 1 dan `a` sendiri, karena setiap bilangan habis dibagi 1 dan dirinya sendiri — pengamatan kecil inilah yang menjadi dasar `cekPrima`.',
  },
  {
    id: 'm2-l6-e2',
    module: 'vektor',
    lesson: 'faktor-prima',
    type: 'choice',
    level: 3,
    prompt: 'Mengapa `cekPrima` memerlukan syarat `a > 1`, padahal untuk `a = 1` hasilnya sudah `FALSE` meski tanpa syarat itu?',
    options: [
      'Karena R tidak bisa menghitung `myFaktor(1)`',
      'Karena tanpa syarat itu, hasil `FALSE` untuk 1 hanya kebetulan benar dan bisa berubah bila syaratnya diubah',
      'Karena 1 sebenarnya bilangan prima',
      'Karena `a > 1` mempercepat perhitungan',
    ],
    answer: 1,
    hints: [
      '`myFaktor(1)` berisi satu anggota, yaitu `1`.',
      'Kalau syarat panjang diubah menjadi `<= 2`, apa yang terjadi pada angka 1?',
    ],
    explanation:
      'Untuk `a = 1`, `myFaktor(1)` hanya berisi `c(1)`, sehingga panjangnya 1 dan bukan 2 — hasil `FALSE` keluar tanpa memerlukan syarat `a > 1`. Tetapi itu kebetulan. Definisi bilangan prima mensyaratkan "lebih besar dari 1", jadi syarat itu harus berdiri sendiri agar logikanya benar, bukan karena hasilnya kebetulan cocok.',
  },
  {
    id: 'm2-l6-e3',
    module: 'vektor',
    lesson: 'faktor-prima',
    type: 'predict',
    level: 2,
    prompt: 'Jika `myFaktor(1)` mengembalikan `c(1)`, apa keluaran `cekPrima(1)` pada implementasi yang benar?',
    code: `cekPrima <- function(a) {
  faktor <- myFaktor(a)
  if (a > 1 && length(faktor) == 2) return(TRUE)
  return(FALSE)
}
cekPrima(1)`,
    answer: ['FALSE'],
    hints: [
      'Syarat pertama adalah `a > 1`, dan 1 tidak memenuhinya.',
      'Bilangan prima terkecil adalah 2.',
    ],
    explanation:
      '`cekPrima(1)` bernilai `FALSE`, sesuai definisi: bilangan prima adalah bilangan bulat lebih besar dari 1 dengan tepat dua faktor positif. Angka 2 adalah prima terkecil, dengan faktor 1 dan 2.',
  },
  {
    id: 'm2-l6-e4',
    module: 'vektor',
    lesson: 'faktor-prima',
    type: 'code',
    level: 4,
    prompt: 'Membuat `cekPrima(a)` yang memanfaatkan `myFaktor(a)` untuk memastikan sebuah bilangan bulat prima atau bukan.',
    hints: [
      'Bilangan prima punya tepat dua faktor positif.',
      'Jangan lupa syarat `a > 1`.',
    ],
    solution: `cekPrima <- function(a) {
  faktor <- myFaktor(a)
  if (a > 1 && length(faktor) == 2) {
    return(TRUE)
  }
  return(FALSE)
}

cekPrima(7)    # TRUE
cekPrima(9)    # FALSE
cekPrima(1)    # FALSE`,
    explanation:
      'Fungsi ini tidak menulis loop sendiri — ia memakai `myFaktor` yang sudah ada. Itulah pola yang ditekankan materi: fungsi kecil disusun menjadi fungsi yang lebih besar. Perhatikan juga bahwa hasilnya bisa ditulis lebih ringkas sebagai `a > 1 && length(myFaktor(a)) == 2`, karena perbandingan dan `&&` sudah mengembalikan `TRUE`/`FALSE`.',
  },
];
