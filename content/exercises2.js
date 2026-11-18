/* ==========================================================================
   exercises2.js — bank soal Modul 3 dan Modul 4
   ========================================================================== */

export const exercises34 = [
  /* ==================== MODUL 3 ==================== */
  {
    id: 'm3-l1-e1',
    module: 'kendali',
    lesson: 'percabangan',
    type: 'choice',
    level: 2,
    prompt: 'Apa yang dikembalikan fungsi berikut ketika dipanggil `contohIf(3)`?',
    code: `contohIf <- function(x) {
  if (x %% 2 == 0) {
    paste(x, "bilangan genap")
  }
}`,
    options: ['`NULL`', '`"3 bilangan genap"`', 'Galat karena tidak ada `else`', '`NA`'],
    answer: 0,
    hints: [
      '`3 %% 2` bernilai 1, jadi kondisinya `FALSE`.',
      'Tidak ada pernyataan lain setelah blok `if`.',
    ],
    explanation:
      'R mengembalikan nilai ekspresi terakhir, dan nilai `if` yang tidak terpenuhi tanpa `else` adalah `NULL`. Fungsi tetap berjalan tanpa galat, tetapi mengembalikan nilai kosong berpanjang 0 — yang menyebar tanpa suara bila dipakai berhitung. Setiap `if` yang bertujuan menghasilkan nilai sebaiknya punya `else`.',
  },
  {
    id: 'm3-l1-e2',
    module: 'kendali',
    lesson: 'percabangan',
    type: 'choice',
    level: 2,
    prompt: 'Apa perbedaan pokok antara `if` dan `ifelse()`?',
    options: [
      '`if` untuk angka, `ifelse()` untuk teks',
      '`if` adalah pernyataan kendali alur dan kondisinya harus tunggal; `ifelse()` adalah fungsi yang mengembalikan nilai dan bisa menerima kondisi berupa vektor',
      '`ifelse()` adalah versi singkat dari `if … else` tanpa perbedaan perilaku',
      '`if` tidak bisa dipakai di dalam fungsi',
    ],
    answer: 1,
    hints: [
      'Salah satunya mengendalikan alur, yang lain mengembalikan nilai.',
      'Coba beri kondisi berupa vektor kepada keduanya.',
    ],
    explanation:
      '`if` mengarahkan alur program dan menuntut kondisi bernilai tunggal. `ifelse()` adalah fungsi biasa dengan tiga argumen yang mengembalikan nilai, dan nilainya boleh berupa vektor sepanjang kondisi yang diuji. Itu sebabnya `ifelse(c(1,2,3,4) %% 2 == 0, "genap", "ganjil")` bekerja, sedangkan `if` dengan kondisi yang sama gagal.',
  },
  {
    id: 'm3-l1-e3',
    module: 'kendali',
    lesson: 'percabangan',
    type: 'debug',
    level: 3,
    prompt: 'Fungsi berikut menghasilkan galat ketika dipanggil. Di mana kesalahannya?',
    code: `cekGenap <- function(x) {
  if (x %% 2 = 0) {
    "genap"
  } else {
    "ganjil"
  }
}`,
    options: [
      '`=` seharusnya `==`; satu tanda sama dengan adalah penugasan, bukan perbandingan',
      '`else` seharusnya `else if`',
      '`x %% 2` seharusnya `x %/% 2`',
      'Fungsi perlu `return()`',
    ],
    answer: 0,
    hints: [
      'Untuk membandingkan dua nilai, R memakai dua tanda sama dengan.',
      'Di dalam `if`, `=` juga bisa dipakai untuk menamai argumen, sehingga R bingung.',
    ],
    explanation:
      '`if (x %% 2 = 0)` mencoba memberi nama argumen `0` pada pemanggilan `x %% 2`, sehingga muncul galat. Perbandingan memakai `==`. Ini kesalahan yang mudah dihindari tetapi sulit ditemukan saat terburu-buru, karena mata membaca "sama dengan" apa adanya.',
  },
  {
    id: 'm3-l1-e4',
    module: 'kendali',
    lesson: 'percabangan',
    type: 'predict',
    level: 2,
    prompt: 'Apa keluaran baris berikut? Tulis keempat hasilnya.',
    code: `ifelse(c(1, 2, 3, 4) %% 2 == 0, "genap", "ganjil")`,
    answer: ['ganjil genap ganjil genap'],
    hints: [
      '`c(1,2,3,4) %% 2` menghasilkan `1 0 1 0`.',
      'Kondisi `== 0` benar untuk posisi 2 dan 4.',
    ],
    explanation:
      'Hasilnya `"ganjil" "genap" "ganjil" "genap"`. `ifelse` menilai keempat elemen sekaligus dan mengembalikan vektor sepanjang input — inilah yang tidak bisa dilakukan `if`, karena kondisinya harus tunggal.',
  },
  {
    id: 'm3-l1-e5',
    module: 'kendali',
    lesson: 'percabangan',
    type: 'choice',
    level: 3,
    prompt: 'Mengapa `ifelse(x > 0, log(x), 0)` tetap memunculkan peringatan `NaNs produced` walaupun ada elemen `x` yang negatif dan seharusnya memakai nilai 0?',
    options: [
      'Karena R salah menghitung `x > 0`',
      'Karena `ifelse()` mengevaluasi kedua cabangnya untuk seluruh elemen, baru memilih',
      'Karena `log()` tidak bisa dipakai di dalam `ifelse()`',
      'Karena vektor `x` mengandung `NA`',
    ],
    answer: 1,
    hints: [
      'Kapan `log(x)` dihitung? Sebelum atau sesudah pemilihan?',
      'Cabang yang tidak "dipakai" tetap dijalankan.',
    ],
    explanation:
      '`ifelse()` menghitung argumen kedua dan ketiga sepenuhnya, lalu memilih berdasarkan kondisi. Jadi `log(x)` dijalankan untuk semua elemen, termasuk yang negatif, dan peringatan `NaNs produced` muncul. Ini batas keberlakuan `ifelse` yang perlu diketahui: ia memilih nilai, bukan mengendalikan alur.',
  },
  {
    id: 'm3-l2-e1',
    module: 'kendali',
    lesson: 'multi-if',
    type: 'choice',
    level: 3,
    prompt: 'Aturan penilaian: benar = 4, salah = −1, jawaban kosong = 0, kunci kosong = 4. Mana urutan kondisi yang benar dalam rantai `if … else if … else`?',
    options: [
      '`jawab != kunci` → `jawab == " "` → `kunci == " "` → `else`',
      '`jawab == kunci` → `jawab == " "` → `kunci == " "` → `else`',
      '`jawab == " "` → `jawab != kunci` → `jawab == kunci` → `else`',
      '`kunci == " "` → `jawab != kunci` → `jawab == " "` → `else`',
    ],
    answer: 1,
    hints: [
      'Kasus "salah" secara harfiah juga mencakup jawaban kosong dan kunci kosong.',
      'Kasus yang paling umum harus menjadi `else` terakhir.',
    ],
    explanation:
      'Urutan yang benar memeriksa kesamaan lebih dulu, lalu jawaban kosong, lalu kunci kosong, dan terakhir menjadikan "salah" sebagai `else`. Kalau `jawab != kunci` diuji lebih dulu, jawaban kosong langsung dinilai −1 sebelum aturan kosong sempat diperiksa. Prinsipnya: kasus paling khusus lebih dulu, komplemennya terakhir.',
  },
  {
    id: 'm3-l2-e2',
    module: 'kendali',
    lesson: 'multi-if',
    type: 'predict',
    level: 2,
    prompt: 'Apa keluaran baris terakhir?',
    code: `multiIf <- function(jawab, kunci) {
  if (jawab == kunci) return(4)
  if (jawab == " ")   return(0)
  if (kunci == " ")   return(4)
  return(-1)
}
multiIf(" ", "a")`,
    answer: ['0'],
    hints: [
      '`" "` tidak sama dengan `"a"`, jadi kondisi pertama `FALSE`.',
      'Kondisi kedua memeriksa apakah jawaban kosong.',
    ],
    explanation:
      'Jawabannya 0: mahasiswa tidak menjawab, dan kuncinya ada, sehingga aturan "jawaban kosong = 0" berlaku. Bandingkan dengan `multiIf("a", " ")` yang bernilai 4, karena kunci kosong berarti soal tidak dipakai dan semua jawaban mendapat nilai penuh.',
  },
  {
    id: 'm3-l2-e3',
    module: 'kendali',
    lesson: 'multi-if',
    type: 'debug',
    level: 4,
    prompt: 'Fungsi berikut memberi nilai −1 kepada jawaban kosong, padahal seharusnya 0. Mengapa?',
    code: `nilai <- function(jawab, kunci) {
  if (jawab != kunci) return(-1)
  if (jawab == " ")   return(0)
  if (kunci == " ")   return(4)
  return(4)
}`,
    options: [
      'Kondisi `jawab != kunci` diuji lebih dulu sehingga menelan kasus jawaban kosong',
      '`return(-1)` seharusnya `return(0)`',
      'Kondisi `kunci == " "` tidak pernah benar',
      '`" "` seharusnya `""`',
    ],
    answer: 0,
    hints: [
      'Apakah `" "` sama dengan `"a"`?',
      'Kalau tidak sama, kondisi mana yang terpenuhi lebih dulu?',
    ],
    explanation:
      'Untuk `jawab = " "` dan `kunci = "a"`, kondisi pertama `jawab != kunci` bernilai `TRUE`, sehingga fungsi langsung mengembalikan −1 dan aturan kosong tidak pernah tercapai. Kasus "salah" harus menjadi `else` terakhir karena ia komplemen dari semua kasus lain — bukan kondisi yang diuji paling awal.',
  },
  {
    id: 'm3-l2-e4',
    module: 'kendali',
    lesson: 'multi-if',
    type: 'choice',
    level: 1,
    prompt: 'Bagaimana cara menulis cabang kedua pada rantai `if` di R?',
    options: ['`elseif (…)`', '`else if (…)`', '`elif (…)`', '`elseIf (…)`'],
    answer: 1,
    hints: [
      'R tidak punya kata kunci khusus untuk ini.',
      'Ia memakai dua kata yang dipisah spasi.',
    ],
    explanation:
      'R menulis `else if`, dengan spasi — bukan `elseif` seperti Python atau `elif`. Kesalahan ini sering muncul bagi mahasiswa yang punya pengalaman bahasa lain, dan pesan galatnya (`unexpected else`) tidak menunjuk langsung ke penyebabnya.',
  },
  {
    id: 'm3-l3-e1',
    module: 'kendali',
    lesson: 'for',
    type: 'predict',
    level: 2,
    prompt: 'Apa keluaran terakhir?',
    code: `x <- c(10, 20, 30)
total <- 0
for (i in seq_along(x)) {
  total <- total + x[i]
}
total`,
    answer: ['60'],
    hints: [
      '`seq_along(x)` menghasilkan `1 2 3`.',
      'Akumulasikan 10, lalu 20, lalu 30.',
    ],
    explanation:
      'Totalnya 60. `total` dimulai dari 0, lalu bertambah 10 (menjadi 10), 20 (30), dan 30 (60). Perhatikan bahwa `total <- 0` berada **sebelum** loop; kalau di dalam, nilainya selalu kembali nol dan hasil akhirnya hanya 30.',
  },
  {
    id: 'm3-l3-e2',
    module: 'kendali',
    lesson: 'for',
    type: 'debug',
    level: 3,
    prompt: 'Fungsi berikut bermaksud menjumlahkan seluruh elemen, tetapi untuk `x = c(10, 20, 30)` hasilnya 30. Mengapa?',
    code: `jumlah <- function(x) {
  for (i in seq_along(x)) {
    total <- 0
    total <- total + x[i]
  }
  return(total)
}`,
    options: [
      '`total <- 0` berada di dalam loop sehingga di-reset setiap iterasi',
      '`seq_along(x)` seharusnya `length(x)`',
      '`total <- total + x[i]` seharusnya `x[i] <- total`',
      'Loop seharusnya memakai `while`',
    ],
    answer: 0,
    hints: [
      'Berapa nilai `total` setiap kali loop dimulai?',
      'Nilai akumulator harus dibawa dari iterasi sebelumnya.',
    ],
    explanation:
      'Karena `total <- 0` ada di dalam badan loop, nilai lama dihapus setiap kali. Hasil akhirnya hanya elemen terakhir, 30. Inisialisasi harus berada sebelum loop. Kesalahan yang sama muncul lagi pada loop bersarang, dengan akibat yang lebih rumit.',
  },
  {
    id: 'm3-l3-e3',
    module: 'kendali',
    lesson: 'for',
    type: 'code',
    level: 3,
    prompt: 'Buat fungsi `nilaiFor(jawaban, kunci)` yang menjumlahkan nilai seluruh butir, memakai `multiIf()`. Kedua argumen berupa vektor teks sepanjang sama.',
    hints: [
      'Siapkan akumulator `nilai <- 0` sebelum loop.',
      'Gunakan `for (i in seq_along(kunci))` lalu tambahkan `multiIf(jawaban[i], kunci[i])`.',
    ],
    solution: `nilaiFor <- function(jawaban, kunci) {
  nilai <- 0
  for (i in seq_along(kunci)) {
    nilai <- nilai + multiIf(jawaban[i], kunci[i])
  }
  return(nilai)
}`,
    explanation:
      'Ini pola akumulator yang sama seperti `mySum`, hanya saja yang ditambahkan bukan angka dari vektor, melainkan hasil pemanggilan fungsi lain. Perhatikan bahwa `multiIf` harus sudah didefinisikan sebelum `nilaiFor` dipanggil; R mencari fungsinya saat dijalankan, bukan saat ditulis.',
  },
  {
    id: 'm3-l3-e4',
    module: 'kendali',
    lesson: 'for',
    type: 'choice',
    level: 3,
    prompt: 'Mengapa `for (i in seq_along(x))` lebih aman daripada `for (i in 1:length(x))`?',
    options: [
      'Karena `seq_along` lebih cepat',
      'Karena `1:0` berisi dua angka, sehingga vektor kosong tetap membuat loop berjalan dua kali',
      'Karena `length()` tidak bisa dipakai di dalam `for`',
      'Karena `seq_along` menghasilkan indeks mulai dari 0',
    ],
    answer: 1,
    hints: [
      'Apa hasil `length(character(0))`?',
      'Lalu apa hasil `1:0`?',
    ],
    explanation:
      '`1:0` bukan vektor kosong — R menghasilkannya dengan berjalan mundur, yaitu `c(1, 0)`. Akibatnya loop berjalan dua kali untuk vektor yang tidak punya anggota, dan `x[i]` menghasilkan `NA`. `seq_along(x)` menghasilkan vektor kosong ketika `x` kosong, sehingga loop tidak berjalan sama sekali.',
  },
  {
    id: 'm3-l3-e5',
    module: 'kendali',
    lesson: 'for',
    type: 'code',
    level: 4,
    prompt: 'Buat fungsi `nilaiSemua(df, kunci)` yang mengisi kolom `NILAI` pada data frame `df` untuk setiap peserta. Kolom `JAWABAN` berisi teks sepanjang `length(kunci)`.',
    hints: [
      'Loop luar berjalan pada baris peserta, loop dalam pada nomor butir.',
      'Reset akumulator untuk setiap peserta, di dalam loop luar tetapi di luar loop dalam.',
      'Gunakan `substr(jwb, i, i)` untuk mengambil satu karakter.',
    ],
    solution: `nilaiSemua <- function(df, kunci) {
  for (j in seq_len(nrow(df))) {
    nilai <- 0
    jwb <- df$JAWABAN[j]
    for (i in seq_along(kunci)) {
      nilai <- nilai + multiIf(substr(jwb, i, i), kunci[i])
    }
    df$NILAI[j] <- nilai
  }
  return(df)
}`,
    explanation:
      'Titik paling rawan adalah posisi `nilai <- 0`: ia harus di dalam loop peserta (agar setiap peserta mulai dari nol) tetapi di luar loop butir (agar nilai butir menumpuk). Kalau diletakkan di luar keduanya, nilai peserta menumpuk; kalau di dalam loop butir, hanya butir terakhir yang terhitung. `substr(jwb, i, i)` mengambil satu karakter karena awal dan akhirnya sama.',
  },
  {
    id: 'm3-l4-e1',
    module: 'kendali',
    lesson: 'while-repeat',
    type: 'choice',
    level: 3,
    prompt: 'Apa perbedaan pokok antara `repeat` dan `while`?',
    options: [
      '`repeat` tidak bisa memakai `break`',
      '`repeat` memeriksa kondisi setelah badan loop dijalankan, `while` memeriksa sebelum',
      '`while` selalu berjalan minimal sekali, `repeat` tidak',
      'Keduanya identik, hanya berbeda penulisan',
    ],
    answer: 1,
    hints: [
      'Pada `repeat`, di mana `break` biasanya diletakkan?',
      'Kalau kondisi `while` salah sejak awal, berapa kali badannya berjalan?',
    ],
    explanation:
      '`while` memeriksa kondisi di awal, sehingga badannya bisa tidak berjalan sama sekali. `repeat` menjalankan badan lebih dulu dan keluar lewat `break` di dalamnya, sehingga dijamin berjalan minimal satu kali. Konsekuensi praktisnya: `while` menuntut variabel kondisinya sudah punya nilai sebelum loop dimulai.',
  },
  {
    id: 'm3-l4-e2',
    module: 'kendali',
    lesson: 'while-repeat',
    type: 'debug',
    level: 4,
    prompt: 'Kode berikut mengubah `repeat` menjadi `while`, tetapi menghasilkan galat. Apa yang hilang?',
    code: `iterasi2 <- function(x0) {
  i <- 1
  while (d > 0.00001) {
    x1 <- -exp(x0)
    d  <- abs(x1 - x0)
    x0 <- x1
    i  <- i + 1
  }
  x1
}`,
    options: [
      '`d` belum punya nilai saat kondisi `while` pertama kali diperiksa',
      '`i` seharusnya dimulai dari 0',
      '`exp` seharusnya `expm1`',
      '`while` seharusnya `repeat`',
    ],
    answer: 0,
    hints: [
      'Kapan `d` pertama kali dihitung? Sebelum atau sesudah pemeriksaan kondisi?',
      'Pada `repeat`, urutannya berbeda.',
    ],
    explanation:
      '`while (d > 0.00001)` diperiksa sebelum badan loop dijalankan, padahal `d` baru dihitung di dalam badan. Hasilnya galat `object "d" not found`. Perbaikannya menambahkan `d <- 1` sebelum loop. Ini pertanyaan yang hampir selalu muncul saat mengubah `repeat` menjadi `while`: kedua bentuk setara secara hasil, tetapi tidak setara secara persiapan.',
  },
  {
    id: 'm3-l4-e3',
    module: 'kendali',
    lesson: 'while-repeat',
    type: 'choice',
    level: 3,
    prompt: 'Pada contoh iterasi numerik, mengapa baris `x0 <- x1` harus berada **setelah** `d <- abs(x1 - x0)`?',
    options: [
      'Karena R membaca kode dari bawah ke atas',
      'Karena kalau `x0` diperbarui lebih dulu, selisihnya selalu nol dan loop berhenti di iterasi pertama dengan jawaban salah',
      'Karena `x0` tidak boleh diubah di dalam loop',
      'Karena urutan tidak berpengaruh',
    ],
    answer: 1,
    hints: [
      '`d` adalah selisih antara tebakan baru dan tebakan lama.',
      'Kalau `x0` sudah sama dengan `x1`, berapa selisihnya?',
    ],
    explanation:
      '`d <- abs(x1 - x0)` membutuhkan `x0` yang masih berisi tebakan **lama**. Kalau `x0 <- x1` dijalankan lebih dulu, selisihnya selalu nol, kondisinya langsung terpenuhi, dan loop berhenti di iterasi pertama — dengan nilai yang masih jauh dari akar. Urutan pernyataan di dalam loop adalah bagian dari logika, bukan gaya.',
  },
  {
    id: 'm3-l4-e4',
    module: 'kendali',
    lesson: 'while-repeat',
    type: 'code',
    level: 4,
    prompt: 'Tulis ulang proses iterasi x₍ₙ₊₁₎ = −exp(xₙ) memakai `while`, dengan kriteria berhenti |x₍ₙ₊₁₎ − xₙ| < 0.00001.',
    hints: [
      'Inisialisasi `d` sebelum loop agar kondisinya bisa diperiksa.',
      'Di dalam loop: hitung `x1`, hitung `d`, lalu perbarui `x0`.',
    ],
    solution: `iterasi2 <- function(x0) {
  i <- 1
  d <- 1
  while (d > 0.00001) {
    x1 <- -exp(x0)
    d  <- abs(x1 - x0)
    x0 <- x1
    i  <- i + 1
  }
  x1
}

iterasi2(0)   # -0.5671408`,
    explanation:
      'Hasilnya sama dengan versi `repeat`: sekitar −0,5671408, dicapai setelah 22 ulangan. Perhatikan bahwa `d <- 1` wajib ada sebelum loop, dan urutan tiga baris di dalam badan loop tidak boleh ditukar. Untuk pekerjaan sungguhan, tambahkan pembatas seperti `if (i > 1000) stop("Tidak konvergen")` agar kesalahan tidak membekukan R.',
  },
  {
    id: 'm3-l5-e1',
    module: 'kendali',
    lesson: 'next-return',
    type: 'choice',
    level: 2,
    prompt: 'Apa yang dicetak oleh loop berikut?',
    code: `for (i in 1:5) {
  if (i == 3) next
  print(i)
}`,
    options: ['`1 2 3 4 5`', '`1 2 4 5`', '`1 2`', '`1 2 3`'],
    answer: 1,
    hints: [
      '`next` melewati sisa badan loop pada iterasi itu saja.',
      'Loop tetap berlanjut ke i = 4 dan 5.',
    ],
    explanation:
      '`next` melewati sisa badan loop ketika `i == 3`, sehingga 3 tidak dicetak, tetapi loop berlanjut ke 4 dan 5. Hasilnya `1 2 4 5`. Kalau yang dipakai `break`, hasilnya `1 2` karena loop berhenti sepenuhnya.',
  },
  {
    id: 'm3-l5-e2',
    module: 'kendali',
    lesson: 'next-return',
    type: 'choice',
    level: 2,
    prompt: 'Pernyataan mana yang menghentikan **seluruh fungsi**, bukan hanya loop?',
    options: ['`break`', '`next`', '`return()`', '`stop()`'],
    answer: 2,
    hints: [
      '`break` dan `next` bekerja pada loop.',
      'Satu di antara pilihan itu membawa nilai kembali ke pemanggil.',
    ],
    explanation:
      '`return()` keluar dari fungsi dan membawa nilai kembali ke pemanggil, sehingga seluruh loop dan pernyataan setelahnya tidak dijalankan. `break` hanya menghentikan loop, dan pernyataan setelah loop tetap berjalan. `next` hanya melewati satu iterasi.',
  },
  {
    id: 'm3-l5-e3',
    module: 'kendali',
    lesson: 'next-return',
    type: 'debug',
    level: 3,
    prompt: 'Fungsi berikut bermaksud melewati nilai nol saja, tetapi ia berhenti pada nilai nol dan tidak memproses sisanya. Apa yang salah?',
    code: `proses <- function(x) {
  for (nilai in x) {
    if (nilai == 0) break
    cat(nilai, "\\n")
  }
}`,
    options: [
      '`break` seharusnya `next`',
      '`next` seharusnya `return()`',
      'Kondisi seharusnya `nilai != 0`',
      'Loop seharusnya memakai `while`',
    ],
    answer: 0,
    hints: [
      'Yang diinginkan adalah melewati satu nilai, bukan menghentikan semuanya.',
      '`break` menghentikan loop; `next` hanya melewati iterasi itu.',
    ],
    explanation:
      '`break` menghentikan seluruh loop, sehingga nilai setelah nol tidak pernah diproses. Untuk melewati satu kasus khusus dan melanjutkan, gunakan `next`. Perbedaan `break` dan `next` sering dianggap sepele, padahal akibatnya berlawanan: satu menghentikan, satu melanjutkan.',
  },

  /* ==================== MODUL 4 ==================== */
  {
    id: 'm4-l1-e1',
    module: 'matriks',
    lesson: 'membentuk-matriks',
    type: 'predict',
    level: 2,
    prompt: 'Apa isi baris pertama matriks berikut?',
    code: `matrix(1:6, nrow = 2)[1, ]`,
    answer: ['1 3 5'],
    hints: [
      'Tanpa `byrow`, R mengisi per kolom.',
      'Dua baris berarti kolom pertama berisi 1 dan 2.',
    ],
    explanation:
      'Baris pertamanya `1 3 5`. Karena R mengisi per kolom, kolom pertama berisi 1 dan 2, kolom kedua 3 dan 4, kolom ketiga 5 dan 6. Jadi baris pertama mengambil elemen pertama dari setiap kolom. Untuk mendapat `1 2 3`, tambahkan `byrow = TRUE`.',
  },
  {
    id: 'm4-l1-e2',
    module: 'matriks',
    lesson: 'membentuk-matriks',
    type: 'predict',
    level: 2,
    prompt: 'Apa isi baris pertama matriks berikut?',
    code: `matrix(1:6, nrow = 2, byrow = TRUE)[1, ]`,
    answer: ['1 2 3'],
    hints: [
      '`byrow = TRUE` mengisi menurut baris.',
      'Dua baris, tiga kolom: baris pertama berisi tiga angka pertama.',
    ],
    explanation:
      'Dengan `byrow = TRUE`, angka diisi menurut baris, sehingga baris pertama berisi `1 2 3` dan baris kedua `4 5 6`. Tanpa argumen itu, hasilnya akan `1 3 5`. Perbedaan satu argumen ini mengubah seluruh isi matriks, bukan hanya urutannya.',
  },
  {
    id: 'm4-l1-e3',
    module: 'matriks',
    lesson: 'membentuk-matriks',
    type: 'choice',
    level: 3,
    prompt: 'Mengapa `matrix()` secara default mengisi data per kolom?',
    options: [
      'Karena R menganggap kolom lebih penting daripada baris',
      'Karena matriks di R adalah vektor yang diberi atribut `dim`, dan vektor dibaca menurut urutannya — sehingga elemen awal mengisi kolom pertama lebih dulu',
      'Karena `byrow` baru ditambahkan pada versi R yang lebih baru',
      'Karena `matrix()` selalu menerima input berupa kolom',
    ],
    answer: 1,
    hints: [
      'Ingat `X4 <- 1:27; dim(X4) <- c(3, 9)`.',
      'Apakah ada data yang disalin saat `dim` diberikan?',
    ],
    explanation:
      'Matriks di R bukan struktur baru — ia vektor yang diberi atribut `dim`. Karena vektor disimpan sebagai satu urutan memanjang, R membaca urutan itu menuruni kolom lebih dulu. Pengisian per kolom adalah akibat langsung dari fakta itu, bukan pilihan desain yang berdiri sendiri.',
  },
  {
    id: 'm4-l1-e4',
    module: 'matriks',
    lesson: 'membentuk-matriks',
    type: 'choice',
    level: 3,
    prompt: 'Apa yang dilakukan `dim(X4) <- c(3, 9)` terhadap `X4`?',
    code: `X4 <- 1:27
dim(X4) <- c(3, 9)`,
    options: [
      'Memotong `X4` menjadi 3 baris pertama',
      'Menambahkan atribut dimensi sehingga vektor yang sama dibaca sebagai matriks 3×9',
      'Menyalin 27 angka menjadi 27 matriks',
      'Mengubah isi `X4` menjadi nol',
    ],
    answer: 1,
    hints: [
      'Berapa `length(X4)` sebelum dan sesudahnya?',
      'Apakah ada angka yang hilang atau bertambah?',
    ],
    explanation:
      'Tidak ada data yang disalin atau berubah: `length(X4)` tetap 27. Yang ditambahkan hanya atribut `dim`, sehingga R membaca 27 angka yang sama sebagai matriks 3×9. Inilah alasan `length()` pada matriks mengembalikan cacah total elemen, bukan cacah baris atau kolom.',
  },
  {
    id: 'm4-l2-e1',
    module: 'matriks',
    lesson: 'mengindeks-matriks',
    type: 'predict',
    level: 1,
    prompt: 'Dengan `X3` berisi 1 sampai 27 yang diisi per baris (9×3), apa keluaran baris berikut?',
    code: `X3[3, 2]`,
    answer: ['8'],
    hints: [
      'Baris ketiga berisi 7, 8, 9.',
      'Kolom kedua dari baris itu adalah …',
    ],
    explanation:
      'Baris ketiga `X3` berisi 7, 8, 9, sehingga kolom keduanya adalah 8. Contoh ini diambil langsung dari materi kuliah, dan penting bahwa yang dipakai `X3` (diisi per baris) — dengan `X1` yang diisi per kolom, hasilnya akan berbeda.',
  },
  {
    id: 'm4-l2-e2',
    module: 'matriks',
    lesson: 'mengindeks-matriks',
    type: 'predict',
    level: 2,
    prompt: 'Apa keluaran baris berikut? Tulis kesembilan angkanya.',
    code: `X3[, 2]`,
    answer: ['2 5 8 11 14 17 20 23 26'],
    hints: [
      'Koma yang dibiarkan kosong berarti "semua baris".',
      'Ambil kolom kedua dari setiap baris.',
    ],
    explanation:
      '`X3[, 2]` mengambil seluruh kolom kedua: 2, 5, 8, 11, 14, 17, 20, 23, 26. Perhatikan bahwa hasilnya **vektor**, bukan matriks 9×1, karena aturan drop membuang dimensi yang tersisa satu.',
  },
  {
    id: 'm4-l2-e3',
    module: 'matriks',
    lesson: 'mengindeks-matriks',
    type: 'choice',
    level: 3,
    prompt: 'Apa perbedaan hasil `X3[2]` dan `X3[2, ]`?',
    options: [
      'Keduanya sama, yaitu baris kedua',
      '`X3[2]` mengambil elemen linear kedua (kolom-mayor), sedangkan `X3[2, ]` mengambil seluruh baris kedua',
      '`X3[2]` menghasilkan galat',
      '`X3[2, ]` mengambil kolom kedua',
    ],
    answer: 1,
    hints: [
      'Satu indeks pada matriks memakai penomoran linear.',
      'Dua indeks dengan koma memisahkan baris dan kolom.',
    ],
    explanation:
      '`X3[2]` memakai penomoran linear yang menyusuri kolom lebih dulu, sehingga hasilnya elemen kedua — yaitu 4. `X3[2, ]` mengambil seluruh baris kedua: 4, 5, 6. Hanya satu koma yang membedakan, tetapi bentuk hasilnya sama sekali lain.',
  },
  {
    id: 'm4-l2-e4',
    module: 'matriks',
    lesson: 'mengindeks-matriks',
    type: 'choice',
    level: 3,
    prompt: 'Apa yang dimaksud dengan aturan *drop* pada pengambilan elemen matriks?',
    options: [
      'R membuang elemen yang bernilai nol',
      'R membuang dimensi yang tersisa satu sehingga hasilnya menjadi vektor biasa',
      'R membuang nama baris dan kolom',
      'R membuang indeks yang di luar jangkauan',
    ],
    answer: 1,
    hints: [
      'Perhatikan `class(X3[, 2])`.',
      'Apakah ia `"matrix"` atau `"integer"`?',
    ],
    explanation:
      'Ketika satu dimensi hasil hanya bernilai satu, R membuang dimensi itu dan mengembalikan vektor. Karena itu `A[i, ]` menghasilkan vektor, bukan matriks 1×n. Untuk sebagian besar pekerjaan ini menguntungkan — misalnya saat memanggil `myProd(A[i, ], C[, j])` — tetapi untuk fungsi yang harus selalu mengembalikan matriks, tambahkan `drop = FALSE`.',
  },
  {
    id: 'm4-l3-e1',
    module: 'matriks',
    lesson: 'jumlah-matriks',
    type: 'choice',
    level: 1,
    prompt: 'Apa syarat agar dua matriks dapat dijumlahkan?',
    options: [
      'Cacah kolom matriks pertama sama dengan cacah baris matriks kedua',
      'Ukuran kedua matriks sama persis',
      'Keduanya harus matriks persegi',
      'Jumlah elemennya harus sama',
    ],
    answer: 1,
    hints: [
      'Penjumlahan bekerja seposisi, jadi setiap sel harus punya pasangan.',
      'Bandingkan dengan syarat perkalian matriks yang "menyilang".',
    ],
    explanation:
      'Penjumlahan matriks mensyaratkan ukuran kedua matriks sama persis, karena setiap sel dijumlahkan dengan sel yang seposisi. Syarat "kolom pertama = baris kedua" adalah syarat perkalian matriks, dan "matriks persegi" tidak diperlukan untuk penjumlahan.',
  },
  {
    id: 'm4-l3-e2',
    module: 'matriks',
    lesson: 'jumlah-matriks',
    type: 'code',
    level: 3,
    prompt: 'Buat fungsi `myAdd(A, B)` yang menjumlahkan dua matriks memakai dua loop bersarang, tanpa memakai operator `+` pada matriksnya.',
    hints: [
      'Siapkan `hasil <- matrix(0, nrow = nrow(A), ncol = ncol(A))`.',
      'Isi setiap sel dengan `A[i, j] + B[i, j]` di dalam dua loop.',
    ],
    solution: `myAdd <- function(A, B) {
  if (!all(dim(A) == dim(B))) {
    stop("Ukuran kedua matriks harus sama.")
  }
  hasil <- matrix(0, nrow = nrow(A), ncol = ncol(A))
  for (i in seq_len(nrow(A))) {
    for (j in seq_len(ncol(A))) {
      hasil[i, j] <- A[i, j] + B[i, j]
    }
  }
  return(hasil)
}`,
    explanation:
      'Dua loop itu tidak ada padanannya di matematika; ia hanya cara menyusuri seluruh sel satu per satu, karena komputer tidak bisa menjumlahkan tabel sekaligus. Perhatikan bahwa matriks hasil harus disiapkan berisi nol dengan ukuran yang benar sebelum diisi — sama seperti menyiapkan vektor kosong pada `myFaktor`, hanya bentuknya dua dimensi.',
  },
  {
    id: 'm4-l3-e3',
    module: 'matriks',
    lesson: 'jumlah-matriks',
    type: 'choice',
    level: 3,
    prompt: 'Apa yang terjadi pada `matrix(1:4, 2) + matrix(1:6, 2)`?',
    options: [
      'Galat karena ukurannya berbeda',
      'R mendaur ulang elemen matriks yang lebih pendek dan hasilnya keluar, mungkin dengan peringatan',
      'R mengabaikan kolom yang tidak punya pasangan',
      'Hasilnya matriks 3×2',
    ],
    answer: 1,
    hints: [
      'Matriks di R adalah vektor berlabel.',
      'Aturan pendaurulangan pada vektor juga berlaku.',
    ],
    explanation:
      'Karena matriks pada dasarnya vektor, aturan pendaurulangan tetap berlaku: R mendaur ulang elemen matriks yang lebih pendek dan hasilnya keluar — bukan penjumlahan matriks. Inilah alasan `myAdd` memeriksa `all(dim(A) == dim(B))` secara eksplisit, bukan mengandalkan R untuk menolak.',
  },
  {
    id: 'm4-l4-e1',
    module: 'matriks',
    lesson: 'kali-matriks',
    type: 'choice',
    level: 2,
    prompt: 'Apa syarat agar A·C terdefinisi, dan berapa ukuran hasilnya?',
    options: [
      'Ukuran A sama dengan C; hasilnya berukuran sama',
      '`ncol(A) == nrow(C)`; hasilnya berukuran `nrow(A) × ncol(C)`',
      '`nrow(A) == nrow(C)`; hasilnya berukuran `nrow(A) × ncol(C)`',
      'Keduanya harus persegi; hasilnya persegi',
    ],
    answer: 1,
    hints: [
      'Syaratnya mencocokkan kolom kiri dengan baris kanan.',
      'Ukuran hasil diambil dari baris kiri dan kolom kanan.',
    ],
    explanation:
      'Perkalian matriks mensyaratkan cacah kolom A sama dengan cacah baris C, dan hasilnya berukuran baris A × kolom C. Syarat ini muncul secara alami dari definisinya: setiap elemen hasil adalah hasil kali titik antara satu baris A dan satu kolom C, sehingga kedua vektor itu harus sama panjang.',
  },
  {
    id: 'm4-l4-e2',
    module: 'matriks',
    lesson: 'kali-matriks',
    type: 'predict',
    level: 3,
    prompt: 'Apa nilai elemen baris 1 kolom 1 dari `A %*% C`? Tulis satu angka.',
    code: `A <- matrix(c(3, 2, 2, 1, 1, 3), nrow = 2)
C <- matrix(c(2, 3, 4, 1, 1, 3, 1, 2, 2), nrow = 3)
(A %*% C)[1, 1]`,
    answer: ['16'],
    hints: [
      'Ambil baris pertama A: 3, 2, 1.',
      'Ambil kolom pertama C: 2, 3, 4. Lalu jumlahkan hasil kalinya.',
    ],
    explanation:
      'Baris 1 A adalah 3, 2, 1 dan kolom 1 C adalah 2, 3, 4, sehingga 3(2) + 2(3) + 1(4) = 6 + 6 + 4 = 16. Inilah hasil kali titik antara satu baris dan satu kolom — fungsi `myProd` yang kamu tulis di Modul 2 melakukan tepat perhitungan ini.',
  },
  {
    id: 'm4-l4-e3',
    module: 'matriks',
    lesson: 'kali-matriks',
    type: 'choice',
    level: 3,
    prompt: 'Apa yang terjadi jika kamu menulis `A * C` padahal A berukuran 2×3 dan C berukuran 3×3?',
    options: [
      'Galat, karena ukurannya tidak cocok',
      'Hasilnya matriks 2×3 berisi perkalian seposisi, dengan elemen yang didaur ulang',
      'Hasilnya sama dengan `A %*% C`',
      'R mengabaikan perintah dan mengembalikan `NULL`',
    ],
    answer: 1,
    hints: [
      '`*` bekerja elemen per elemen.',
      'Cacah elemen A adalah 6, C adalah 9.',
    ],
    explanation:
      '`*` bekerja elemen per elemen, jadi R mendaur ulang A dan mengembalikan matriks 2×3 yang semua angkanya bukan hasil perkalian matriks. Tidak ada galat dan tidak ada peringatan, karena `*` memang terdefinisi begitu. Ini kesalahan paling mahal di modul ini: hasilnya keluar dan terlihat masuk akal.',
  },
  {
    id: 'm4-l4-e4',
    module: 'matriks',
    lesson: 'kali-matriks',
    type: 'debug',
    level: 4,
    prompt: 'Fungsi berikut bermaksud mengalikan dua matriks, tetapi hasilnya salah tanpa memunculkan galat. Mengapa?',
    code: `kaliSalah <- function(A, C) {
  hasil <- matrix(0, nrow = nrow(A), ncol = ncol(C))
  for (i in seq_len(nrow(A))) {
    for (j in seq_len(ncol(C))) {
      hasil[i, j] <- sum(A[i, ] * C[j, ])
    }
  }
  return(hasil)
}`,
    options: [
      'Seharusnya `sum(A[i, ] * C[, j])` — yang dipasangkan adalah baris A dan kolom C, bukan baris C',
      'Seharusnya memakai `%*%`',
      'Matriks hasil seharusnya berukuran `nrow(A) × ncol(A)`',
      '`sum` seharusnya `prod`',
    ],
    answer: 0,
    hints: [
      'Elemen hasil adalah hasil kali titik baris A dengan kolom C.',
      'Perhatikan `C[j, ]` — itu mengambil baris, bukan kolom.',
    ],
    explanation:
      '`C[j, ]` mengambil baris ke-j dari C, sedangkan yang dibutuhkan adalah kolom ke-j, yaitu `C[, j]`. Kode ini tetap berjalan dan menghasilkan matriks berukuran benar, sehingga terlihat sukses — tetapi setiap elemennya salah. Ini contoh mengapa dimensi hasil yang benar tidak menjamin isi yang benar.',
  },
  {
    id: 'm4-l4-e5',
    module: 'matriks',
    lesson: 'kali-matriks',
    type: 'code',
    level: 4,
    prompt: 'Buat fungsi `myKali(A, C)` yang mengalikan dua matriks memakai dua loop bersarang dan `myProd()` sebagai hasil kali titik baris-kolom.',
    hints: [
      'Siapkan `hasil <- matrix(0, nrow = nrow(A), ncol = ncol(C))`.',
      'Isi `hasil[i, j]` dengan `myProd(A[i, ], C[, j])`.',
      'Periksa syarat `ncol(A) == nrow(C)` di awal.',
    ],
    solution: `myKali <- function(A, C) {
  if (ncol(A) != nrow(C)) {
    stop("Cacah kolom A harus sama dengan cacah baris C.")
  }
  hasil <- matrix(0, nrow = nrow(A), ncol = ncol(C))
  for (i in seq_len(nrow(A))) {
    for (j in seq_len(ncol(C))) {
      hasil[i, j] <- myProd(A[i, ], C[, j])
    }
  }
  return(hasil)
}`,
    explanation:
      'Di sini seluruh rantai modul bertemu: `myProd` dari Modul 2 dipanggil di dalam dua loop dari Modul 3, dan hasilnya matriks dari Modul 4. Perhatikan juga bahwa `A[i, ]` dan `C[, j]` menghasilkan vektor karena aturan drop — di sini drop justru yang membuat `myProd` menerima dua vektor, bukan dua matriks.',
  },
  {
    id: 'm4-l5-e1',
    module: 'matriks',
    lesson: 'array-dataframe',
    type: 'choice',
    level: 2,
    prompt: 'Apa aturan tipe data pada data frame?',
    options: [
      'Seluruh kolom harus bertipe sama',
      'Setiap kolom harus satu tipe, tetapi kolom berbeda boleh berbeda tipe',
      'Setiap sel boleh bertipe berbeda',
      'Hanya boleh memuat numerik dan karakter',
    ],
    answer: 1,
    hints: [
      'Data pegawai memuat nama (teks), NIP (angka), dan gaji (angka).',
      'Bandingkan dengan aturan matriks.',
    ],
    explanation:
      'Data frame menampung tipe yang sama pada setiap kolom, tetapi boleh berbeda tipe antar kolom. Itulah yang membedakannya dari matriks, array, dan vektor yang hanya boleh memuat satu tipe untuk seluruh objek. Konsekuensinya, data frame bukan matriks: operasi seperti `%*%` tidak berlaku padanya.',
  },
  {
    id: 'm4-l5-e2',
    module: 'matriks',
    lesson: 'array-dataframe',
    type: 'predict',
    level: 2,
    prompt: 'Setelah kolom `Jumlah` diisi, berapa nilai baris pertama? Tulis satu angka.',
    code: `myFrame <- data.frame(
  Nama = c("Heri", "Bambang", "Sumanto"),
  GajiPokok = c(5000000, 6000000, 6500000),
  Tunjangan = rep(1000000, 3),
  Jumlah = 0
)
myFrame$Jumlah <- myFrame$GajiPokok + myFrame$Tunjangan
myFrame$Jumlah[1]`,
    answer: ['6000000'],
    hints: [
      '`$` mengambil satu kolom sebagai vektor.',
      'Penjumlahan bekerja elemen per elemen.',
    ],
    explanation:
      'Baris pertama adalah 5.000.000 + 1.000.000 = 6.000.000. Karena `myFrame$GajiPokok` mengembalikan vektor, penjumlahan bekerja elemen per elemen seperti pada Modul 2, dan hasilnya menjadi kolom baru yang menimpa kolom `Jumlah` berisi nol.',
  },
  {
    id: 'm4-l5-e3',
    module: 'matriks',
    lesson: 'array-dataframe',
    type: 'debug',
    level: 3,
    prompt: 'Baris berikut gagal dengan pesan `replacement has 0 rows, data has 3`. Mengapa?',
    code: `myFrame$Jumlah <- myFrame$Gapok + myFrame$Tunjangan`,
    options: [
      'Nama kolomnya `GajiPokok`, bukan `Gapok`; R peka huruf besar-kecil sehingga `$Gapok` bernilai `NULL`',
      'Kolom `Jumlah` belum ada',
      '`Tunjangan` harus berupa vektor',
      'Sebuah data frame tidak bisa ditambahi kolom',
    ],
    answer: 0,
    hints: [
      'Periksa nama kolom yang sebenarnya dengan `names(myFrame)`.',
      'Berapa panjang `NULL`?',
    ],
    explanation:
      '`myFrame$Gapok` bernilai `NULL` karena "Gapok" bukan awalan dari "GajiPokok" dan R peka huruf besar-kecil. `NULL + vektor` menghasilkan vektor berpanjang 0, sehingga R mengeluh bahwa penggantinya tidak punya baris. Ini salah ketik di materi kuliah, bukan kesalahan konsep — tetapi pesan galatnya mudah menyesatkan.',
  },
  {
    id: 'm4-l5-e4',
    module: 'matriks',
    lesson: 'array-dataframe',
    type: 'choice',
    level: 2,
    prompt: 'Berapa banyak dimensi yang dimiliki `array(1:24, dim = c(2, 3, 4))`?',
    options: ['1', '2', '3', '24'],
    answer: 2,
    hints: [
      '`dim` berisi tiga angka.',
      'Jumlah dimensi sama dengan panjang vektor `dim`.',
    ],
    explanation:
      'Array itu berdimensi tiga, dengan ukuran 2×3×4 — totalnya 24 elemen. Karena itu mengaksesnya membutuhkan tiga indeks, misalnya `ar[1, 2, 3]` yang bernilai 15. Perhatikan bahwa 24 adalah cacah elemen (`length`), bukan cacah dimensi.',
  },
];
