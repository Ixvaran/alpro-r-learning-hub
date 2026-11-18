/* ==========================================================================
   Modul 4 — Matriks, array, dan data frame
   Sumber: "Kuliah 11 2026 Pemrograman untuk Matriks.pdf" dan bagian 2.3–2.5
   pada "Pernyataan Pengendali Program.pdf".
   ========================================================================== */

export const module4 = {
  id: 'matriks',
  num: 4,
  title: 'Matriks dan Struktur Data',
  short: 'Matriks',
  tagline: 'Dua dimensi, dua syarat, satu operator yang berbeda',
  source: 'Kuliah 11 2026 Pemrograman untuk Matriks.pdf',
  duration: 80,
  desc:
    'Membentuk matriks dan memahami pengisian per kolom, mengambil submatriks, lalu menjumlahkan dan mengalikan matriks dengan loop — memakai kembali hasil kali titik dari Modul 2.',
  goals: [
    'Membentuk matriks dengan `matrix()` dan menjelaskan peran `byrow`.',
    'Mengambil elemen, baris, kolom, dan submatriks dengan `A[i, j]`.',
    'Menjelaskan syarat penjumlahan dan perkalian matriks.',
    'Menulis algoritma penjumlahan dan perkalian matriks dengan loop bersarang.',
    'Membedakan array dan data frame dari matriks.',
  ],
  prereq: ['Modul 2 (vektor dan hasil kali titik) serta Modul 3 (loop bersarang).'],
  lessons: [
    /* ------------------------------------------------------------------ */
    {
      id: 'membentuk-matriks',
      title: 'Membentuk matriks, dan rahasia pengisian per kolom',
      desc: 'Kenapa matriks pertamamu tidak terlihat seperti yang kamu bayangkan.',
      duration: 14,
      level: 2,
      objectives: [
        'Membentuk matriks dengan `matrix()` dan argumen `nrow`, `ncol`, `byrow`.',
        'Menjelaskan bahwa matriks di R adalah vektor yang diberi atribut `dim`.',
        'Memprediksi hasil `matrix()` dengan dan tanpa `byrow = TRUE`.',
      ],
      prereq: ['Vektor (Modul 2).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Hampir setiap mahasiswa pernah membuat matriks pertama mereka, melihat hasilnya, dan mengira R salah. R tidak salah. Ia mengisi menurut kolom.',
        },
        {
          t: 'p',
          text:
            '**Matriks** adalah data dalam dimensi dua. Di R, matriks dibangun dari data atomik atau vektor dengan fungsi `matrix()`. Materi kuliah memakai satu vektor `1:27` untuk mendemonstrasikan beberapa cara pembentukan yang berbeda.',
        },
        {
          t: 'code',
          label: 'R',
          code: `x10 <- 1:27

X1 <- matrix(x10, ncol = 3)
X2 <- matrix(x10, nrow = 3)
X3 <- matrix(x10, ncol = 3, byrow = TRUE)

dim(X1)
dim(X2)
dim(X3)`,
          out: `[1] 9 3
[1] 3 9
[1] 9 3`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Ketiga matriks memakai data yang sama, tetapi bentuknya berbeda. `X1` dan `X3` sama-sama 9×3, sedangkan `X2` menjadi 3×9 karena `nrow` menentukan cacah baris dan sisanya dihitung otomatis. Perhatikan bahwa `ncol` dan `nrow` tidak boleh bertentangan: `matrix(1:27, nrow = 4)` akan memberi peringatan karena 27 bukan kelipatan 4.',
        },
        {
          t: 'h2',
          text: 'Isi yang berbeda, ukuran yang sama',
        },
        {
          t: 'code',
          label: 'R',
          code: `X1 <- matrix(1:27, ncol = 3)
X1[1:2, ]`,
          out: `     [,1] [,2] [,3]
[1,]    1   10   19
[2,]    2   11   20`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Baris pertama `X1` berisi 1, 10, dan 19 — bukan 1, 2, 3. Inilah pengisian **per kolom**: R mengambil sembilan angka pertama untuk kolom 1, sembilan berikutnya untuk kolom 2, dan sembilan terakhir untuk kolom 3. Untuk mendapatkan baris yang berurutan, tambahkan `byrow = TRUE`.',
        },
        {
          t: 'code',
          label: 'R',
          code: `X3 <- matrix(1:27, ncol = 3, byrow = TRUE)
X3`,
          out: `      [,1] [,2] [,3]
 [1,]    1    2    3
 [2,]    4    5    6
 [3,]    7    8    9
 [4,]   10   11   12
 [5,]   13   14   15
 [6,]   16   17   18
 [7,]   19   20   21
 [8,]   22   23   24
 [9,]   25   26   27`,
          outLabel: 'Keluaran',
        },
        {
          t: 'callout',
          tone: 'note',
          title: 'Seluruh contoh di materi memakai X3',
          text:
            'Contoh pengambilan elemen di dokumen kuliah memakai `X3`, bukan `X1`. Itu penting: `X3[3, 2]` bernilai 8, sedangkan `X1[3, 2]` bernilai 12. Kalau kamu mencoba contoh itu pada matriks yang salah, hasilnya akan berbeda dan terlihat seolah ada yang keliru.',
        },
        {
          t: 'h2',
          text: 'Mengapa bisa begitu: matriks adalah vektor berlabel dimensi',
        },
        {
          t: 'p',
          text:
            'Materi kuliah menunjukkan sesuatu yang tampak seperti trik, padahal justru menjelaskan seluruh perilaku di atas:',
        },
        {
          t: 'code',
          label: 'R',
          code: `X4 <- x10
dim(X4) <- c(3, 9)
X4[1:2, 1:3]`,
          out: `     [,1] [,2] [,3]
[1,]    1    4    7
[2,]    2    5    8`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Tidak ada data yang disalin, tidak ada isi yang berubah. Yang terjadi hanya penambahan **atribut** `dim`. Sebelumnya `X4` adalah vektor 27 angka; sesudahnya ia dibaca sebagai matriks 3×9 dari 27 angka yang sama. Inilah sebabnya matriks di R selalu terisi per kolom: yang sebenarnya terjadi hanyalah angka-angka vektor itu ditata mengikuti urutan aslinya, dan urutan itu dibaca menuruni kolom lebih dulu.',
        },
        {
          t: 'callout',
          tone: 'warm',
          title: 'Konsekuensi yang akan kamu temui terus',
          text:
            'Karena matriks adalah vektor, `length(X3)` bernilai 27, bukan 9 atau 3. Dan `X3[5]` dengan satu indeks mengambil elemen kelima menurut urutan kolom, yaitu 13 — bukan elemen baris kelima kolom pertama seperti dugaan banyak orang. Ini akan dibahas di pelajaran berikutnya.',
        },
      ],
      summary: [
        '`matrix(data, nrow, ncol, byrow)` membentuk matriks dari vektor; `nrow` atau `ncol` cukup salah satu.',
        'Tanpa `byrow = TRUE`, R mengisi per kolom — akibat langsung dari cara vektor dibaca.',
        'Matriks di R adalah vektor yang diberi atribut `dim`, bukan struktur data terpisah.',
      ],
      mistakes: [
        'Mengira `matrix(1:9, nrow = 3)` menghasilkan baris 1, 2, 3.',
        'Memakai `X1` padahal contoh materi memakai `X3`.',
        'Mengira `dim()` menyalin atau mengubah data.',
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'mengindeks-matriks',
      title: 'Mengambil elemen matriks',
      desc: 'Dua indeks, satu koma, dan aturan drop yang mengubah hasil menjadi vektor.',
      duration: 15,
      level: 2,
      objectives: [
        'Mengambil satu elemen, satu baris, satu kolom, dan submatriks.',
        'Memakai vektor sebagai indeks baris maupun kolom.',
        'Menjelaskan mengapa `A[, j]` menghasilkan vektor biasa, bukan matriks.',
      ],
      prereq: ['Membentuk matriks (Modul 4, Pelajaran 1).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Mengambil elemen matriks membutuhkan dua nomor, bukan satu: baris dulu, lalu kolom, dipisahkan koma.',
        },
        {
          t: 'p',
          text:
            'Rumusnya `nama[baris, kolom]`. Koma itu bukan hiasan — ia yang membedakan "baris 3 kolom 2" dari "elemen ke-3 dan ke-2". Materi kuliah memberi lima contoh lengkap dengan `X3`:',
        },
        {
          t: 'vizmat',
          rows: [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
            [10, 11, 12],
            [13, 14, 15],
            [16, 17, 18],
            [19, 20, 21],
            [22, 23, 24],
            [25, 26, 27],
          ],
          caption:
            'Klik sebuah sel untuk melihat indeks baris dan kolomnya. Angka-angka ini sama dengan isi X3 dari pelajaran sebelumnya.',
        },
        {
          t: 'code',
          label: 'R',
          code: `X3[3, 2]              # satu nilai
X3[3, c(1, 3)]        # dua nilai dari baris yang sama
X3[c(3, 7), c(1, 3)]  # submatriks 2 x 2
X3[ , 2]              # seluruh kolom 2
X3[3, ]               # seluruh baris 3`,
          out: `[1] 8
[1] 7 9
     [,1] [,2]
[1,]    7    9
[2,]   19   21
[1]  2  5  8 11 14 17 20 23 26
[1] 7 8 9`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Baris pertama sampai ketiga mengembalikan bentuk yang berbeda-beda. Satu elemen menjadi skalar. Dua elemen dari baris yang sama menjadi vektor. Dua baris dan dua kolom menjadi matriks 2×2. R menyesuaikan bentuk hasil dengan bentuk permintaannya, dan itu perilaku yang perlu kamu antisipasi ketika hasilnya dipakai di perhitungan berikutnya.',
        },
        {
          t: 'h2',
          text: 'Koma yang dibiarkan kosong',
        },
        {
          t: 'p',
          text:
            '`X3[ , 2]` dibaca "semua baris, kolom 2". Koma tetap ditulis, dan bagian yang kosong berarti "semua". Ini bukan detail gaya: `X3[, 2]` mengambil kolom, sedangkan `X3[2]` mengambil elemen linear kedua. Dua ekspresi yang hanya berbeda satu koma memberi hasil yang sama sekali berbeda.',
        },
        {
          t: 'code',
          label: 'R',
          code: `X3[, 2]
X3[2]`,
          out: `[1]  2  5  8 11 14 17 20 23 26
[1] 4`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Indeks tunggal pada matriks memakai penomoran **linear**, yang mengikuti urutan kolom. Elemen kedua adalah 4, karena kolom pertama berisi 1, 2, 3, 4, 5, 6, 7, 8, 9 — jadi elemen ke-2 adalah 4. Ini konsekuensi langsung dari fakta bahwa matriks adalah vektor.',
        },
        {
          t: 'h2',
          text: 'Aturan drop: hasilnya bisa berubah bentuk',
        },
        {
          t: 'p',
          text:
            'Ketika salah satu dimensi yang tersisa hanya satu, R membuang dimensi itu dan mengembalikan vektor biasa, bukan matriks 1×n atau n×1. Perilaku ini disebut **drop**.',
        },
        {
          t: 'code',
          label: 'R',
          code: `class(X3[, 2])
class(X3[, 2, drop = FALSE])
dim(X3[, 2, drop = FALSE])`,
          out: `[1] "integer"
[1] "matrix" "array" 
[1] 9 1`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Untuk sebagian besar pekerjaan, drop justru menguntungkan: `A[i, ]` memberi vektor baris, dan itulah tepatnya yang dibutuhkan `myProd()` ketika mengalikan matriks. Tetapi kalau kamu menulis fungsi yang harus selalu mengembalikan matriks, drop akan merusaknya pada kasus satu kolom. Di situ tambahkan `drop = FALSE`.',
        },
        {
          t: 'callout',
          tone: 'warm',
          title: 'Indeks matriks tidak memakai pendaurulangan yang sama',
          text:
            'Pada vektor, indeks logika didaur ulang mengikuti panjang vektor. Pada matriks dengan dua indeks, aturannya lebih rumit dan mudah menyesatkan. Untuk keperluan mata kuliah ini, pakai vektor logika hanya pada satu dimensi sekaligus, misalnya `X3[X3 > 10, ]` untuk menyaring baris.',
        },
      ],
      summary: [
        '`A[i, j]` mengambil satu elemen; koma memisahkan baris dari kolom.',
        'Bagian yang dikosongkan berarti "semua", sehingga `A[, j]` mengambil kolom.',
        'Drop mengubah hasil menjadi vektor ketika satu dimensi bernilai satu; `drop = FALSE` mencegahnya.',
      ],
      mistakes: [
        'Menulis `A[3 2]` tanpa koma.',
        'Mengira `A[2]` sama dengan `A[2, ]`.',
        'Menulis fungsi yang mengasumsikan hasil selalu matriks, lalu gagal pada satu kolom.',
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'jumlah-matriks',
      title: 'Penjumlahan matriks dan algoritmanya',
      desc: 'Satu syarat mutlak, dan dua loop yang menyusuri setiap sel.',
      duration: 15,
      level: 3,
      objectives: [
        'Menyebutkan syarat dua matriks dapat dijumlahkan.',
        'Menulis algoritma penjumlahan matriks dengan dua loop bersarang.',
        'Memeriksa hasil algoritma terhadap operator `+` bawaan R.',
      ],
      prereq: ['Mengindeks matriks (Modul 4, Pelajaran 2).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Penjumlahan matriks adalah operasi paling sederhana di modul ini, dan justru karena itu paling cocok untuk melihat bagaimana sebuah algoritma diterjemahkan menjadi loop.',
        },
        {
          t: 'p',
          text:
            'Syaratnya satu dan tidak bisa ditawar: **ukuran kedua matriks harus sama**. Dua matriks 2×3 hanya bisa dijumlahkan dengan matriks 2×3. Hasilnya berukuran sama, dan setiap elemen adalah jumlah elemen yang seposisi.',
        },
        {
          t: 'code',
          label: 'R',
          code: `A <- matrix(c(3, 2, 2, 1, 1, 3), nrow = 2)
B <- matrix(c(4, 3, 3, 1, 2, 2), nrow = 2)

A
B
A + B`,
          out: `     [,1] [,2] [,3]
[1,]    3    2    1
[2,]    2    1    3
     [,1] [,2] [,3]
[1,]    4    3    2
[2,]    3    1    2
     [,1] [,2] [,3]
[1,]    7    5    3
[2,]    5    2    5`,
          outLabel: 'Keluaran',
        },
        {
          t: 'h2',
          text: 'Menerjemahkan algoritma menjadi loop',
        },
        {
          t: 'p',
          text:
            'Materi kuliah menuliskan urutan langkahnya begini: siapkan matriks hasil berisi nol dengan ukuran yang sama, lalu untuk setiap baris dan setiap kolom, isi sel hasil dengan jumlah kedua sel yang seposisi. Dua loop itu tidak ada di matematika; ia hanya cara menyusuri seluruh sel tabel satu per satu, karena komputer tidak bisa menjumlahkan tabel sekaligus.',
        },
        {
          t: 'code',
          label: 'myAdd.R',
          code: `myAdd <- function(A, B) {
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
}

myAdd(A, B)`,
          out: `     [,1] [,2] [,3]
[1,]    7    5    3
[2,]    5    2    5`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Hasilnya identik dengan `A + B`. Perhatikan baris `hasil <- matrix(0, ...)`: matriks hasil harus disiapkan lebih dulu dengan ukuran yang benar, karena pengisian `hasil[i, j]` hanya bekerja pada posisi yang sudah ada. Ini sama seperti menyiapkan vektor kosong pada `myFaktor`, hanya bentuknya dua dimensi.',
        },
        {
          t: 'p',
          text:
            'Pemeriksaan `all(dim(A) == dim(B))` adalah tambahan dari situs ini. Tanpa itu, R akan tetap mencoba menjumlahkan dan — karena matriks adalah vektor — mendaur ulang elemen dari matriks yang lebih pendek. Hasilnya keluar tanpa galat, tetapi bukan penjumlahan matriks. Lebih baik berhenti dengan pesan yang jelas.',
        },
        {
          t: 'callout',
          tone: 'note',
          title: 'Mengapa hasilnya bisa "berhasil" padahal salah',
          text:
            'Coba `matrix(1:4, 2) + matrix(1:6, 2)`. R tidak menolak; ia mendaur ulang dan memberi peringatan tentang panjang yang bukan kelipatan. Inilah alasan syarat ukuran ditulis sebagai pemeriksaan eksplisit, bukan diandalkan pada R.',
        },
      ],
      summary: [
        'Penjumlahan matriks mensyaratkan ukuran kedua matriks sama persis.',
        'Algoritmanya dua loop bersarang yang mengisi setiap sel hasil dari sel yang seposisi.',
        'Matriks hasil harus disiapkan berisi nol dengan ukuran yang benar sebelum diisi.',
      ],
      mistakes: [
        'Menjumlahkan matriks berbeda ukuran dan mengira R akan menolak.',
        'Lupa menyiapkan matriks hasil, lalu mengisi posisi yang belum ada.',
        'Menukar `nrow` dan `ncol` saat menyiapkan matriks hasil.',
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'kali-matriks',
      title: 'Perkalian matriks: di sinilah dot product kembali',
      desc: 'Syarat menyilang, hasil kali titik, dan satu bintang yang berbahaya.',
      duration: 20,
      level: 4,
      objectives: [
        'Menyebutkan syarat perkalian matriks dan menentukan ukuran hasilnya.',
        'Menghitung satu elemen hasil perkalian dengan tangan.',
        'Menulis algoritma perkalian matriks memakai `myProd()` dari Modul 2.',
        'Membedakan `A * B` dari `A %*% B`.',
      ],
      prereq: ['Penjumlahan matriks (Modul 4, Pelajaran 3) dan hasil kali titik (Modul 2, Pelajaran 4).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Perkalian matriks terlihat rumit sampai kamu menyadari bahwa setiap elemennya hanyalah hasil kali titik — fungsi yang sudah kamu tulis sendiri di Modul 2.',
        },
        {
          t: 'p',
          text:
            'Syaratnya berbeda dari penjumlahan dan sering disebut "menyilang": **cacah kolom matriks pertama harus sama dengan cacah baris matriks kedua**. Untuk A berukuran m×n dan C berukuran n×k, hasilnya berukuran m×k. Perhatikan bahwa ukuran hasil diambil dari baris kiri dan kolom kanan, sedangkan syaratnya mencocokkan kolom kiri dengan baris kanan.',
        },
        {
          t: 'p',
          text:
            'Alasannya baru terlihat setelah tahu cara menghitungnya. Elemen pada baris i kolom j dari hasil adalah **hasil kali titik antara baris i matriks A dan kolom j matriks C**. Karena `myProd()` menuntut dua vektor sama panjang, dan yang dipasokkan adalah satu baris A (panjangnya = cacah kolom A) serta satu kolom C (panjangnya = cacah baris C), maka kedua cacah itu wajib sama.',
        },
        {
          t: 'h2',
          text: 'Menghitung satu elemen dengan tangan',
        },
        {
          t: 'code',
          label: 'R',
          code: `A <- matrix(c(3, 2, 2, 1, 1, 3), nrow = 2)
C <- matrix(c(2, 3, 4, 1, 1, 3, 1, 2, 2), nrow = 3)

A
C
A %*% C`,
          out: `     [,1] [,2] [,3]
[1,]    3    2    1
[2,]    2    1    3
     [,1] [,2] [,3]
[1,]    2    1    1
[2,]    3    1    2
[3,]    4    3    2
     [,1] [,2] [,3]
[1,]   16    8    9
[2,]   19   12   10`,
          outLabel: 'Keluaran',
        },
        {
          t: 'table',
          head: ['Posisi', 'Baris A', 'Kolom C', 'Perhitungan', 'Hasil'],
          rows: [
            ['(1,1)', '3, 2, 1', '2, 3, 4', '3(2) + 2(3) + 1(4)', '16'],
            ['(1,2)', '3, 2, 1', '1, 1, 3', '3(1) + 2(1) + 1(3)', '8'],
            ['(1,3)', '3, 2, 1', '1, 2, 2', '3(1) + 2(2) + 1(2)', '9'],
            ['(2,1)', '2, 1, 3', '2, 3, 4', '2(2) + 1(3) + 3(4)', '19'],
            ['(2,2)', '2, 1, 3', '1, 1, 3', '2(1) + 1(1) + 3(3)', '12'],
            ['(2,3)', '2, 1, 3', '1, 2, 2', '2(1) + 1(2) + 3(2)', '10'],
          ],
          caption: 'Bacalah tabel ini baris per baris: baris matriks A tetap, kolom matriks C berjalan. Pola itulah yang ditulis sebagai dua loop bersarang di algoritmanya.',
        },
        {
          t: 'h2',
          text: 'Algoritmanya, memakai fungsi buatanmu sendiri',
        },
        {
          t: 'code',
          label: 'myKali.R',
          code: `myKali <- function(A, C) {
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
}

myKali(A, C)`,
          out: `     [,1] [,2] [,3]
[1,]   16    8    9
[2,]   19   12   10`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Sekarang perhatikan betapa rapi rantainya. `myProd()` dari Modul 2 dipanggil di dalam dua loop dari Modul 3, dan hasilnya sebuah matriks dari Modul 4. Tidak ada logika baru di dalam loop itu — hanya pemanggilan fungsi yang sudah kamu tulis dan uji sebelumnya. Begitulah program tumbuh: bagian yang lebih kecil disusun menjadi bagian yang lebih besar.',
        },
        {
          t: 'p',
          text:
            'Perhatikan juga baris `A[i, ]` dan `C[, j]`. Keduanya menghasilkan **vektor biasa** karena aturan drop yang dibahas di Pelajaran 2. Di sini drop justru yang membuat semuanya bekerja: kalau R mengembalikan matriks 1×3, `myProd()` akan menerima dua matriks, bukan dua vektor.',
        },
        {
          t: 'h2',
          text: 'A * B bukan perkalian matriks',
        },
        {
          t: 'code',
          label: 'R',
          code: `A * B
A %*% B`,
          out: `     [,1] [,2] [,3]
[1,]   12    6    2
[2,]    6    1    6
Error in A %*% B : non-conformable arguments`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Baris pertama **berhasil** dan menghasilkan matriks berisi 12, 6, 2, 6, 1, 6 — yaitu perkalian elemen per elemen. Ini bukan perkalian matriks, dan R tidak memberi peringatan apa pun karena `*` memang didefinisikan untuk elemen per elemen. Baris kedua gagal karena A berukuran 2×3 dan B berukuran 2×3, sehingga kolom A (3) tidak sama dengan baris B (2).',
        },
        {
          t: 'callout',
          tone: 'danger',
          title: 'Satu bintang adalah jebakan',
          text:
            'Ini kesalahan paling mahal di modul ini, karena hasilnya keluar dan terlihat masuk akal. Kalau kamu menulis `A * C` padahal maksudmu `A %*% C`, R akan menjawab dengan matriks yang semua angkanya salah, tanpa satu pun peringatan. Kebiasaan yang menyelamatkan: setiap kali menulis perkalian, ucapkan dalam hati apakah yang kamu mau "kali seposisi" atau "kali matriks".',
        },
        {
          t: 'callout',
          tone: 'note',
          title: 'Hasil %*% pada dua vektor',
          text:
            'Kalau kamu memakai `%*%` pada dua vektor, hasilnya matriks 1×1, bukan angka. Karena itu `a %*% b` cocok dipakai di tempat yang mengharapkan matriks, sedangkan `sum(a * b)` cocok dipakai di tempat yang mengharapkan angka. Di dalam `myKali()`, `myProd()` dipakai karena ia mengembalikan angka, sehingga bisa langsung disimpan ke satu sel matriks.',
        },
      ],
      summary: [
        'Perkalian A·C terdefinisi bila cacah kolom A sama dengan cacah baris C; hasilnya berukuran baris A × kolom C.',
        'Setiap elemen hasil adalah hasil kali titik antara satu baris A dan satu kolom C.',
        '`*` adalah perkalian elemen per elemen dan tidak pernah menolak; `%*%` adalah perkalian matriks.',
      ],
      mistakes: [
        'Memakai `*` untuk perkalian matriks karena hasilnya tetap keluar.',
        'Menyiapkan matriks hasil dengan ukuran yang salah (misalnya nrow A × ncol A).',
        'Mengira `%*%` pada dua vektor menghasilkan angka biasa.',
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'array-dataframe',
      title: 'Array dan data frame',
      desc: 'Tiga dimensi, dan tabel yang boleh memuat tipe berbeda per kolom.',
      duration: 14,
      level: 2,
      objectives: [
        'Menjelaskan array sebagai tumpukan matriks dan cara mengaksesnya.',
        'Menjelaskan aturan tipe data pada array versus data frame.',
        'Membuat data frame, mengakses kolom, dan menambah kolom hasil hitungan.',
      ],
      prereq: ['Matriks dan pengindeksannya (Modul 4, Pelajaran 1–2).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Matriks menambah satu dimensi. Array menambah lagi. Data frame justru melanggar aturan yang selama ini berlaku, dan itulah gunanya.',
        },
        {
          t: 'h2',
          text: 'Array: tumpukan matriks',
        },
        {
          t: 'p',
          text:
            '**Array** adalah data berdimensi tiga atau lebih. Materi kuliah mengilustrasikannya dengan array berukuran 5×4×3, yang paling mudah dibayangkan sebagai tiga matriks 5×4 yang ditumpuk. Cara mengaksesnya menambah satu nomor lagi di dalam kurung siku.',
        },
        {
          t: 'code',
          label: 'R',
          code: `ar <- array(1:24, dim = c(2, 3, 4))

dim(ar)
ar[1, 2, 3]
length(ar)`,
          out: `[1] 2 3 4
[1] 15
[1] 24`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Sama seperti matriks adalah vektor berlabel `dim`, array juga vektor berlabel `dim` — hanya saja labelnya tiga angka. `length(ar)` bernilai 24 karena 2 × 3 × 4 = 24, dan seluruh 24 angka itu tersimpan dalam satu urutan memanjang. Pengisiannya pun mengikuti aturan yang sama: dimensi pertama berubah paling cepat, lalu kedua, lalu ketiga.',
        },
        {
          t: 'h2',
          text: 'Data frame: ketika satu tipe tidak cukup',
        },
        {
          t: 'p',
          text:
            'Vektor, matriks, dan array hanya boleh memuat **satu tipe data**. Ini konsekuensi langsung dari tangga yang kita bahas di awal: karena matriks adalah vektor berlabel, dan vektor hanya punya satu tipe, matriks pun begitu. Padahal data nyata hampir selalu bercampur: nama berupa teks, nomor induk berupa angka, gaji berupa angka.',
        },
        {
          t: 'p',
          text:
            '**Data frame** memutus batasan itu dengan aturan yang berbeda: setiap kolom harus satu tipe, tetapi kolom yang berbeda boleh berbeda tipe. Ia bisa dibayangkan sebagai tabel data penelitian, bukan sebagai matriks matematika. Materi kuliah mencontohkannya dengan data pegawai:',
        },
        {
          t: 'code',
          label: 'R',
          code: `options(scipen = 99)   # matikan notasi ilmiah pada tampilan

nama       <- c("Heri", "Bambang", "Sumanto")
nip        <- c(1, 2, 3)
gajiPokok  <- c(5000000, 6000000, 6500000)
tunjangan  <- rep(1000000, 3)

myFrame <- data.frame(
  Nama = nama, NIP = nip,
  GajiPokok = gajiPokok, Tunjangan = tunjangan,
  Jumlah = 0
)

myFrame`,
          out: `     Nama NIP GajiPokok Tunjangan Jumlah
1    Heri   1   5000000   1000000      0
2 Bambang   2   6000000   1000000      0
3 Sumanto   3   6500000   1000000      0`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Baris `options(scipen = 99)` mematikan notasi ilmiah sehingga `1000000` tidak tampil sebagai `1e+06`. Perintah ini hanya mengubah tampilan, bukan nilainya — dan pengaturannya bertahan untuk sisa sesi R.',
        },
        {
          t: 'h2',
          text: 'Mengakses dan mengisi kolom',
        },
        {
          t: 'code',
          label: 'R',
          code: `myFrame$Nama
myFrame$Jumlah <- myFrame$GajiPokok + myFrame$Tunjangan
myFrame`,
          out: `[1] "Heri"    "Bambang" "Sumanto"
     Nama NIP GajiPokok Tunjangan  Jumlah
1    Heri   1   5000000   1000000 6000000
2 Bambang   2   6000000   1000000 7000000
3 Sumanto   3   6500000   1000000 7500000`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Tanda `$` mengambil satu kolom sebagai vektor biasa. Itulah sebabnya penjumlahan `GajiPokok + Tunjangan` bekerja elemen per elemen, seperti pada Modul 2 — hasilnya vektor tiga angka, yang lalu disimpan menjadi kolom baru. Kolom `Jumlah` yang tadinya berisi nol sekarang tertimpa hasil hitungan.',
        },
        {
          t: 'callout',
          tone: 'warm',
          title: 'Nama kolom peka huruf besar-kecil',
          text:
            'Materi kuliah menulis `myFrame$GaPok` dan `myFrame$Gapok`, padahal kolomnya bernama `GajiPokok`. R peka huruf besar-kecil, dan pencocokan sebagian hanya berlaku bila nama yang diketik adalah awalan dari nama kolom — `"Gapok"` bukan awalan dari `"GajiPokok"`. Hasilnya `NULL`, dan penjumlahan berikutnya gagal dengan pesan `replacement has 0 rows, data has 3`. Ini salah ketik, bukan konsep, tetapi pesan galatnya membingungkan.',
        },
        {
          t: 'table',
          head: ['Struktur', 'Dimensi', 'Tipe data', 'Cocok untuk'],
          rows: [
            ['Vektor', '1', 'Satu tipe', 'Deretan nilai sejenis'],
            ['Matriks', '2', 'Satu tipe', 'Aljabar matriks'],
            ['Array', '3 atau lebih', 'Satu tipe', 'Data berdimensi banyak'],
            ['Data frame', '2 (tabel)', 'Satu tipe per kolom', 'Data penelitian nyata'],
          ],
          caption: 'Tiga baris pertama tunduk pada aturan "satu tipe untuk seluruh objek". Baris terakhir sengaja melanggar aturan itu.',
        },
        {
          t: 'p',
          text:
            'Karena bukan matriks, data frame tidak bisa dipakai dengan `%*%` atau operasi aljabar matriks lainnya. Dan karena setiap kolomnya bertipe sendiri, penjumlahan dua data frame hanya masuk akal bila semua kolomnya numerik. Kedua batasan ini penting supaya kamu tidak mengira data frame hanyalah matriks yang lebih fleksibel — ia struktur yang berbeda untuk tujuan yang berbeda.',
        },
      ],
      summary: [
        'Array adalah vektor berlabel `dim` dengan tiga angka atau lebih; aksesnya menambah satu indeks.',
        'Data frame memuat satu tipe per kolom tetapi boleh berbeda antar kolom.',
        '`$` mengambil kolom sebagai vektor, sehingga operasi elemen per elemen bekerja seperti biasa.',
      ],
      mistakes: [
        'Mengira data frame bisa dikalikan dengan `%*%`.',
        'Salah menulis nama kolom lalu mendapat `NULL` tanpa galat.',
        'Mengira `options(scipen = 99)` mengubah nilai, padahal hanya tampilan.',
      ],
    },
  ],
};
