/* ==========================================================================
   Modul 3 — Pernyataan pengendali program
   Sumber: "Pernyataan Pengendali Program.pdf" (sembilan pernyataan kendali R,
   studi kasus penilaian pilihan ganda, dan iterasi numerik).
   ========================================================================== */

export const module3 = {
  id: 'kendali',
  num: 3,
  title: 'Pernyataan Kendali',
  short: 'Kendali',
  tagline: 'Memilih, mengulang, dan berhenti di saat yang tepat',
  source: 'Pernyataan Pengendali Program.pdf',
  duration: 85,
  desc:
    'Sembilan alat untuk mengarahkan alur program: percabangan, pengulangan, dan lompatan. Ditutup dengan dua studi kasus nyata — penilaian 40 soal pilihan ganda dan pencarian akar secara iteratif.',
  goals: [
    'Memilih antara `if`, `ifelse`, dan rantai `if … else if … else` sesuai kebutuhan.',
    'Menyusun urutan kondisi yang benar ketika beberapa aturan bisa tumpang tindih.',
    'Menggunakan `for`, `for` bersarang, `while`, dan `repeat … break` dengan tepat.',
    'Melakukan tracing terhadap perubahan variabel selama loop berjalan.',
    'Membedakan `break`, `next`, dan `return`.',
  ],
  prereq: ['Modul 1–2: fungsi, vektor, dan loop sederhana.'],
  lessons: [
    /* ------------------------------------------------------------------ */
    {
      id: 'percabangan',
      title: 'Membuat program memilih: if, if…else, dan ifelse',
      desc: 'Tiga cara memilih, dan satu jebakan yang tidak memunculkan galat.',
      duration: 14,
      level: 2,
      objectives: [
        'Menulis percabangan dengan `if` dan dengan `if … else`.',
        'Menjelaskan mengapa `if` tanpa `else` bisa mengembalikan `NULL`.',
        'Membedakan `ifelse()` sebagai fungsi dari `if` sebagai pernyataan.',
        'Memilih bentuk yang tepat untuk satu nilai versus banyak nilai.',
      ],
      prereq: ['Fungsi dan operator (Modul 1).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Pernyataan kendali mengarahkan alur program ketika ia bertemu sebuah kondisi. Tanpa percabangan, program hanya bisa berjalan lurus dari atas ke bawah.',
        },
        {
          t: 'p',
          text:
            'Materi kuliah menyebut sembilan jenis pernyataan kendali di R: `if`, `ifelse`, multi `if`, `for`, multi `for`, `while`, `repeat … break`, `return`, dan `next`. Setiap bahasa punya alat yang sama dengan penulisan yang berbeda; yang khas di R adalah `ifelse()` sebagai fungsi, dan tidak adanya kata kunci `elseif` seperti di Python.',
        },
        {
          t: 'h2',
          text: 'if: satu kondisi, satu pilihan',
        },
        {
          t: 'p',
          text:
            '`if` menjalankan blok perintah bila kondisi bernilai `TRUE`, dan melewatkannya bila `FALSE`. Kondisi harus berupa nilai logika tunggal — bukan vektor. Contoh dari materi kuliah memeriksa apakah sebuah bilangan genap:',
        },
        {
          t: 'code',
          label: 'R',
          code: `contohIf <- function(x) {
  sisa <- x %% 2
  if (sisa == 0) {
    paste(x, "bilangan genap")
  }
}

contohIf(4)`,
          out: `[1] "4 bilangan genap"`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Sekarang perhatikan apa yang terjadi kalau `x` ganjil. Kondisinya `FALSE`, blok tidak dijalankan, dan fungsi selesai tanpa pernah menghasilkan nilai. Mari kita periksa isinya:',
        },
        {
          t: 'code',
          label: 'R',
          code: `contohIf(3)
length(contohIf(3))`,
          out: `[1] 0`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Perhatikan bahwa baris pertama **tidak mencetak apa pun**. R mengembalikan `NULL` dari blok `if` yang tidak terpenuhi, dan nilai itu bersifat tak terlihat sehingga tidak ditampilkan di konsol. Baris kedua membuktikan isinya memang kosong: panjangnya 0.',
        },
        {
          t: 'callout',
          tone: 'warm',
          title: 'NULL bukan galat, dan itu yang berbahaya',
          text:
            'Fungsi di atas tidak rusak. Ia mengembalikan `NULL` — nilai kosong dengan panjang 0. Program berjalan terus. Tetapi bila hasilnya dipakai untuk berhitung, `NULL` akan menyebar tanpa suara dan menghasilkan vektor kosong atau angka yang membingungkan. Kebiasaan yang baik: setiap `if` yang bertujuan menghasilkan nilai harus punya `else`.',
        },
        {
          t: 'h2',
          text: 'if … else: dua pilihan yang lengkap',
        },
        {
          t: 'code',
          label: 'R',
          code: `contohIfElse <- function(x) {
  sisa <- x %% 2
  if (sisa == 0) {
    paste(x, "bilangan genap")
  } else {
    paste(x, "bilangan ganjil")
  }
}

contohIfElse(7)`,
          out: `[1] "7 bilangan ganjil"`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Dengan `else`, satu dari dua cabang **selalu** dijalankan, sehingga fungsi selalu mengembalikan nilai. Ini bentuk yang paling sering kamu butuhkan.',
        },
        {
          t: 'h2',
          text: 'ifelse: sebuah fungsi, bukan pernyataan',
        },
        {
          t: 'p',
          text:
            '`ifelse()` adalah fungsi biasa dengan tiga argumen: kondisi, nilai bila benar, nilai bila salah. Karena ia fungsi, ia **mengembalikan nilai** — dan nilainya boleh berupa vektor sepanjang kondisi yang diuji. Inilah bedanya dengan `if`, yang mengendalikan alur program.',
        },
        {
          t: 'code',
          label: 'R',
          code: `contohIfelse <- function(x) {
  ifelse(x %% 2 == 0, paste(x, "genap"), paste(x, "ganjil"))
}

contohIfelse(7)
contohIfelse(c(1, 2, 3, 4))`,
          out: `[1] "7 ganjil"
[1] "1 ganjil" "2 genap"  "3 ganjil" "4 genap" `,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Baris kedua memamerkan kekuatan `ifelse`: satu pemanggilan menilai empat nilai sekaligus. `if` tidak bisa melakukan itu, karena kondisinya harus tunggal.',
        },
        {
          t: 'callout',
          tone: 'danger',
          title: 'Kedua cabang ifelse selalu dievaluasi',
          text:
            '`ifelse()` menghitung nilai pada argumen kedua dan ketiga untuk **seluruh** elemen, baru memilih. Akibatnya `ifelse(x > 0, log(x), 0)` tetap memunculkan peringatan `NaNs produced` bila ada `x` negatif, meskipun cabang `log` tidak "dipakai" untuk elemen itu. Ini batas keberlakuan yang jarang disebut, dan sering membuat mahasiswa mengira ada bug di kodenya.',
        },
        {
          t: 'table',
          head: ['', '`if` / `if … else`', '`ifelse()`'],
          rows: [
            ['Jenis', 'Pernyataan kendali', 'Fungsi'],
            ['Kondisi', 'Harus tunggal (panjang 1)', 'Boleh vektor'],
            ['Hasil', 'Menjalankan atau melewati blok', 'Mengembalikan nilai'],
            ['Cabang tidak terpakai', 'Tidak dijalankan', 'Tetap dievaluasi'],
            ['Dipakai untuk', 'Bercabang dalam algoritma', 'Memilih nilai pada banyak elemen'],
          ],
          caption: 'Bacalah tabel ini sebagai pertanyaan: apakah yang saya butuhkan adalah "jalankan blok ini atau itu", atau "hasilkan nilai ini atau itu"?',
        },
        {
          t: 'callout',
          tone: 'note',
          title: 'Masalah else di jendela R',
          text:
            'Kalau kamu mengetik langsung di jendela R (bukan menjalankan berkas), `else` harus berada di baris yang sama dengan penutup `}`. Menekan Enter setelah `}` membuat R mengira pernyataan `if` sudah selesai, sehingga `else` di baris berikutnya memunculkan galat `unexpected else`. Di dalam berkas skrip, aturan ini tidak berlaku.',
        },
      ],
      summary: [
        '`if` menjalankan atau melewati blok; tanpa `else` ia bisa mengembalikan `NULL`.',
        '`if … else` menjamin satu cabang selalu dijalankan.',
        '`ifelse()` adalah fungsi yang mengembalikan nilai dan bisa bekerja pada vektor.',
      ],
      mistakes: [
        'Menulis `if` tanpa `else` pada fungsi yang seharusnya selalu mengembalikan nilai.',
        'Memberi kondisi berupa vektor kepada `if`, lalu mendapat galat "condition has length > 1".',
        'Mengira `ifelse()` hanya mengevaluasi cabang yang terpakai.',
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'multi-if',
      title: 'Rantai if … else if … else dan urutan prioritas',
      desc: 'Studi kasus penilaian pilihan ganda, tempat urutan kondisi menentukan kebenaran.',
      duration: 20,
      level: 3,
      objectives: [
        'Menulis rantai `if … else if … else` untuk tiga pilihan atau lebih.',
        'Menyusun urutan kondisi dari yang paling khusus ke paling umum.',
        'Menjelaskan mengapa kasus "salah" harus menjadi `else` terakhir.',
        'Menerapkan aturan penilaian pilihan ganda pada jawaban dan kunci kosong.',
      ],
      prereq: ['Percabangan `if` dan `ifelse` (Modul 3, Pelajaran 1).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Ketika pilihannya tiga atau lebih, `if` bersarang menjadi tidak terbaca. Rantai `else if` menyelesaikannya — tetapi memindahkan kesulitan ke tempat lain: urutan.',
        },
        {
          t: 'p',
          text:
            'Materi kuliah memberi skenario yang sangat konkret: penilaian soal pilihan ganda dengan lima alternatif jawaban. Aturannya empat, dan keempatnya berlaku bersamaan.',
        },
        {
          t: 'table',
          head: ['Kondisi', 'Nilai'],
          rows: [
            ['Jawaban sama dengan kunci', '4'],
            ['Jawaban salah', '−1'],
            ['Jawaban kosong', '0'],
            ['Kunci kosong (soal tidak dipakai)', '4'],
          ],
          caption: 'Aturan ini diambil langsung dari materi kuliah. Perhatikan bahwa tiga di antaranya bisa tumpang tindih pada satu jawaban.',
        },
        {
          t: 'h2',
          text: 'Mengapa urutan menentukan segalanya',
        },
        {
          t: 'p',
          text:
            'Rantai `if … else if … else` dievaluasi dari atas ke bawah, dan **hanya satu cabang yang dijalankan**. Begitu satu kondisi bernilai `TRUE`, sisanya dilewati. Artinya urutan kondisi bukan soal selera: ia menentukan aturan mana yang menang ketika dua aturan sama-sama berlaku.',
        },
        {
          t: 'p',
          text:
            'Perhatikan bahwa "jawaban salah" secara harfiah juga mencakup jawaban kosong, dan mencakup kasus kunci kosong tetapi jawaban tidak. Kalau kamu menaruh `jawab != kunci` di depan, jawaban kosong akan langsung dinilai −1 sebelum aturan "kosong dapat 0" sempat diperiksa. Hasilnya salah untuk kasus yang justru sengaja diatur materi.',
        },
        {
          t: 'callout',
          tone: 'note',
          title: 'Prinsipnya satu kalimat',
          text:
            'Periksa kasus yang paling khusus lebih dulu, dan jadikan kasus yang paling umum sebagai `else` terakhir. Kata "salah" adalah komplemen dari semua kasus lain — ia tidak boleh diuji sebagai kondisi positif di awal rantai.',
        },
        {
          t: 'code',
          label: 'multiIf.R',
          code: `multiIf <- function(jawab, kunci) {
  if (jawab == kunci) {
    return(4)      # benar
  }
  if (jawab == " ") {
    return(0)      # jawaban kosong
  }
  if (kunci == " ") {
    return(4)      # kunci kosong
  }
  return(-1)       # sisanya pasti salah
}

multiIf("a", "a")
multiIf("b", "a")
multiIf(" ", "a")
multiIf("a", " ")`,
          out: `[1] 4
[1] -1
[1] 0
[1] 4`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Kode di atas memakai `return()` bertingkat, bukan `else if`. Keduanya sama-sama benar dan menghasilkan nilai identik; `return()` lebih ringkas ketika setiap cabang hanya mengembalikan satu nilai. Materi kuliah menampilkan kerangka `if … else if … else` yang sengaja dikosongkan sebagai tugas. Kerangka itu setara dengan kode di atas, hanya berbeda gaya penulisan.',
        },
        {
          t: 'p',
          text:
            'Perhatikan pula: **tidak ada kata kunci `elseif` di R**. Yang ditulis adalah `else if`, dengan spasi. Perbedaan kecil ini sering menghasilkan galat bagi mahasiswa yang terbiasa dengan Python.',
        },
        {
          t: 'h2',
          text: 'Dua aturan yang sering tertukar',
        },
        {
          t: 'p',
          text:
            'Jawaban kosong dan kunci kosong adalah dua hal berbeda, dan keduanya muncul di aturan yang berbeda. Jawaban kosong berarti mahasiswa tidak menjawab; ia mendapat 0. Kunci kosong berarti soal tidak dipakai; setiap jawaban mendapat 4. Karena itu `jawab == " "` dan `kunci == " "` tidak boleh digabung menjadi satu kondisi.',
        },
        {
          t: 'callout',
          tone: 'warm',
          title: 'Spasi adalah karakter',
          text:
            '`" "` berisi satu spasi, bukan string kosong `""`. Kalau data jawabanmu memakai string kosong untuk soal yang tidak dijawab, perbandingan `jawab == " "` tidak akan pernah benar dan seluruh aturan kosong gagal. Periksa data aslinya sebelum menulis kondisi.',
        },
      ],
      summary: [
        'Rantai `else if` memilih tepat satu cabang; kondisi yang lebih khusus harus diperiksa lebih dulu.',
        'Kasus "salah" adalah komplemen semua kasus lain sehingga harus menjadi `else` terakhir.',
        'Jawaban kosong dan kunci kosong adalah dua kondisi berbeda dengan nilai berbeda.',
      ],
      mistakes: [
        'Menaruh `jawab != kunci` di awal rantai sehingga menelan kasus kosong.',
        'Menulis `elseif` alih-alih `else if`.',
        'Mengira `" "` sama dengan `""`.',
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'for',
      title: 'for: mengulang sejumlah yang sudah diketahui',
      desc: 'Akumulator, loop bersarang, dan menilai 40 soal dalam satu perulangan.',
      duration: 20,
      level: 3,
      objectives: [
        'Menulis `for` atas vektor nilai dan atas nomor posisi.',
        'Menggunakan pola akumulator untuk menjumlahkan hasil per iterasi.',
        'Menulis `for` bersarang dan menjelaskan mengapa akumulator di-reset di loop luar.',
        'Memakai `substr()` untuk mengambil satu karakter dari sebuah teks.',
      ],
      prereq: ['Percabangan dan algoritma vektor (Modul 2–3).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Kalau jumlah ulangan sudah diketahui, `for` adalah alat yang tepat. Kalau belum, kamu akan memerlukan `while` atau `repeat` di pelajaran berikutnya.',
        },
        {
          t: 'p',
          text:
            'Bentuk dasarnya `for (variabel in urutan) { … }`. Variabel loop mengambil setiap nilai dari urutan, satu per satu, dan badan loop dijalankan sekali untuk setiap nilai. Materi kuliah memakai `for` untuk menjumlahkan isi vektor:',
        },
        {
          t: 'code',
          label: 'R',
          code: `x <- c(10, 20, 30)
total <- 0
for (i in seq_along(x)) {
  total <- total + x[i]
}
total`,
          out: `[1] 60`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            '`seq_along(x)` menghasilkan `1 2 3` — nomor posisi setiap elemen. Ini bentuk yang aman ketika kamu perlu indeks, karena ia menghasilkan vektor kosong untuk vektor kosong, berbeda dari `1:length(x)`.',
        },
        {
          t: 'trace',
          title: 'total pada x = c(10, 20, 30)',
          cols: ['Langkah', 'i', 'x[i]', 'total sebelum', 'total sesudah'],
          rows: [
            ['awal', '—', '—', '—', '0'],
            ['ke-1', '1', '10', '0', '10'],
            ['ke-2', '2', '20', '10', '30'],
            ['ke-3', '3', '30', '30', '60'],
            ['selesai', '—', '—', '—', '60'],
          ],
          note:
            'Baris "total sebelum" pada langkah ke-2 adalah 10, yaitu hasil langkah ke-1. Itulah arti akumulasi: nilai lama dibawa ke langkah berikutnya.',
        },
        {
          t: 'h2',
          text: 'Menilai 40 soal',
        },
        {
          t: 'p',
          text:
            'Dengan `multiIf()` yang sudah benar, menilai satu peserta adalah pekerjaan satu loop. Materi kuliah menyediakan 40 jawaban dan 40 kunci; setiap butir dinilai, lalu nilainya diakumulasikan.',
        },
        {
          t: 'code',
          label: 'nilaiFor.R',
          run: false,
          code: `nilaiFor <- function(jawaban, kunci) {
  nilai <- 0
  for (i in seq_along(kunci)) {
    nilai <- nilai + multiIf(jawaban[i], kunci[i])
  }
  return(nilai)
}

nilaiFor(jawaban, kunci)`,
          out: `[1] 7`,
          outLabel: 'Keluaran (data 40 soal dari materi kuliah)',
        },
        {
          t: 'p',
          text:
            'Angka 7 itu terlihat mengejutkan rendah, jadi mari kita bedah. Dari 40 butir, jawaban peserta itu benar 9 kali (+36), kosong 2 kali (0), dan salah 29 kali (−29). Totalnya 36 − 29 = 7. Jadi nilainya kecil bukan karena ada bug, melainkan karena aturan penalti −1 memang mahal: satu jawaban benar hanya menutup empat jawaban salah.',
        },
        {
          t: 'callout',
          tone: 'note',
          title: 'Nilai awal akumulator, sekali lagi',
          text:
            '`nilai <- 0` harus berada **sebelum** loop. Kalau diletakkan di dalam loop, nilainya kembali nol setiap iterasi dan hasil akhirnya hanya nilai butir terakhir. Ini kesalahan yang berbeda dari kesalahan di Modul 2, tetapi sumbernya sama: salah menempatkan inisialisasi.',
        },
        {
          t: 'h2',
          text: 'for bersarang: banyak peserta',
        },
        {
          t: 'p',
          text:
            'Kalau data berisi banyak peserta, dibutuhkan loop kedua di luar. Setiap baris data frame adalah satu peserta; setiap karakternya adalah satu jawaban. Fungsi `substr(jwb, i, i)` mengambil satu karakter pada posisi `i` — awal dan akhirnya sama, sehingga yang diambil tepat satu huruf.',
        },
        {
          t: 'code',
          label: 'nilaiSemua.R',
          run: false,
          code: `nilaiSemua <- function(df, kunci) {
  for (j in seq_len(nrow(df))) {
    nilai <- 0                    # reset untuk setiap peserta
    jwb <- df$JAWABAN[j]
    for (i in seq_along(kunci)) {
      nilai <- nilai + multiIf(substr(jwb, i, i), kunci[i])
    }
    df$NILAI[j] <- nilai
  }
  return(df)
}`,
          out: '',
          outLabel: '',
        },
        {
          t: 'p',
          text:
            'Perhatikan posisi `nilai <- 0`. Ia berada **di dalam** loop peserta tetapi **di luar** loop butir. Kalau diletakkan di luar keduanya, nilai peserta pertama akan terbawa ke peserta kedua, dan hasilnya menumpuk seperti piramida. Kalau diletakkan di dalam loop butir, nilainya kembali nol setiap soal. Hanya satu posisi yang benar, dan hanya tracing yang bisa menunjukkan mengapa.',
        },
        {
          t: 'table',
          head: ['Peserta', 'Jawaban (5 soal)', 'Perhitungan', 'Nilai'],
          rows: [
            ['A', '`abcde`', '4 + 4 + 4 + 4 + 4', '20'],
            ['B', '`abx  `', '4 + 4 − 1 + 0 + 4', '11'],
            ['C', '`b    `', '−1 + 0 + 0 + 0 + 4', '3'],
          ],
          caption: 'Kunci untuk tabel ini adalah a, b, c, d, dan spasi. Soal kelima berkunci kosong, sehingga setiap jawaban mendapat 4 — termasuk jawaban A yang mengisi "e".',
        },
        {
          t: 'p',
          text:
            'Contoh kecil di atas sengaja dipakai agar bisa ditelusuri dengan tangan. Pada data sesungguhnya, materi kuliah memakai 40 soal dan enam peserta; panjang setiap jawaban harus sama dengan panjang kunci, karena `substr` yang membaca melewati akhir teks akan menghasilkan string kosong — dan string kosong itu akan dinilai −1 karena tidak sama dengan `" "`.',
        },
        {
          t: 'callout',
          tone: 'warm',
          title: 'Periksa panjang sebelum menilai',
          text:
            'Tambahkan `if (nchar(jwb) != length(kunci)) warning("Panjang jawaban tidak sama dengan kunci")` sebelum penilaian. Satu baris ini mengubah kesalahan data yang senyap menjadi peringatan yang terlihat.',
        },
      ],
      summary: [
        '`for` dipakai ketika cacah ulangan sudah diketahui; `seq_along()` lebih aman daripada `1:length()`.',
        'Pola akumulator: inisialisasi sebelum loop, perbarui di dalam loop.',
        'Pada loop bersarang, akumulator per peserta di-reset di loop luar dan di luar loop dalam.',
      ],
      mistakes: [
        'Meletakkan `nilai <- 0` di dalam loop sehingga hasilnya hanya butir terakhir.',
        'Meletakkan reset di luar loop bersarang sehingga nilai peserta menumpuk.',
        'Mengira `substr()` yang melewati akhir teks menghasilkan galat.',
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'while-repeat',
      title: 'while, repeat, dan pencarian akar secara iteratif',
      desc: 'Ketika jumlah ulangan tidak bisa ditentukan di awal — dan kriteria berhenti yang harus dibuktikan.',
      duration: 20,
      level: 4,
      objectives: [
        'Menulis `while` dan menjelaskan bahwa kondisinya diperiksa sebelum iterasi.',
        'Menulis `repeat … break` dan menjelaskan bedanya dengan `while`.',
        'Menerjemahkan proses iteratif matematika menjadi loop dengan kriteria berhenti.',
        'Menambahkan pengaman agar loop tidak berjalan selamanya.',
      ],
      prereq: ['`for` dan percabangan (Modul 3, Pelajaran 3).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Sebagian persoalan tidak memberi tahu berapa kali harus diulang. Yang diketahui hanya kapan boleh berhenti — dan itu justru cukup.',
        },
        {
          t: 'p',
          text:
            'Materi kuliah memberi contoh yang tepat: mencari titik potong kurva y = x + eˣ dengan sumbu-x. Titik potong itu adalah nilai x yang membuat y = 0, yaitu penyelesaian dari x + eˣ = 0. Persamaan ini tidak punya bentuk tertutup yang sederhana, sehingga dicari secara numerik: tebak, perbaiki, ulangi sampai cukup dekat.',
        },
        {
          t: 'p',
          text:
            'Persamaan x + eˣ = 0 diubah menjadi x = −eˣ. Bentuk itu memberi resep langsung: tebakan berikutnya dihitung dari tebakan sekarang, xₖ₊₁ = −eˣᵏ. Kalau tebakan awalnya 0, maka tebakan berikutnya −e⁰ = −1, lalu −e⁻¹ ≈ −0,368, dan seterusnya.',
        },
        {
          t: 'table',
          head: ['Iterasi', 'x'],
          rows: [
            ['0', '0,0000000'],
            ['1', '−1,0000000'],
            ['2', '−0,3678794'],
            ['3', '−0,6922006'],
            ['4', '−0,5004735'],
            ['5', '−0,6062435'],
            ['22', '−0,5671408'],
          ],
          caption: 'Nilai berayun naik-turun sambil makin rapat ke satu angka. Perhatikan bahwa tiap nilai bergantung pada nilai sebelumnya, bukan pada nomor iterasinya.',
        },
        {
          t: 'p',
          text:
            'Karena berayun, selisih dua tebakan berturut-turut mengecil. Itulah kriteria berhentinya: proses dihentikan ketika |xₖ₊₁ − xₖ| < ε, dengan ε kecil — materi memakai ε = 0,00001.',
        },
        {
          t: 'callout',
          tone: 'warm',
          title: 'Koreksi kecil pada teks materi',
          text:
            'Dokumen kuliah menuliskan rumusnya sebagai xₖ₊₁ = eˣᵏ, tanpa tanda minus. Kodenya sendiri memakai `x1 <- -exp(x0)`, dan kode itulah yang benar: tanpa minus, barisannya tidak menuju akar x + eˣ = 0. Tanda minus hilang saat penyuntingan dokumen, bukan salah paham. Di situs ini kode dan rumusnya disamakan pada bentuk yang bertanda minus.',
        },
        {
          t: 'h2',
          text: 'repeat: dijalankan dulu, diperiksa kemudian',
        },
        {
          t: 'code',
          label: 'iterasi.R',
          code: `iterasi <- function(x0) {
  i <- 1
  repeat {
    x1 <- -exp(x0)
    d  <- abs(x1 - x0)
    x0 <- x1
    if (d < 0.00001) break
    i <- i + 1
  }
  cat("Konvergen setelah", i, "ulangan\n")
  cat("x =", x1, "\n")
}

iterasi(0)`,
          out: `Konvergen setelah 22 ulangan
x = -0.5671408`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            '`repeat` menjalankan badannya lebih dulu, baru memeriksa kondisi di dalamnya. Karena itu ia dijamin berjalan minimal satu kali. Satu-satunya jalan keluar adalah `break`, dan itulah sebabnya `repeat` hampir selalu muncul berpasangan dengan `if (…) break`.',
        },
        {
          t: 'p',
          text:
            'Perhatikan urutan tiga baris pertama di badan loop. `x1` dihitung dari `x0` yang lama, `d` dihitung sebagai selisih keduanya, lalu `x0` diperbarui menjadi `x1`. Kalau baris `x0 <- x1` dipindah ke atas, selisihnya akan selalu nol dan loop berhenti di iterasi pertama dengan jawaban yang salah.',
        },
        {
          t: 'h2',
          text: 'while: diperiksa dulu, baru dijalankan',
        },
        {
          t: 'p',
          text:
            '`while` memeriksa kondisi di awal. Konsekuensinya dua: badannya bisa saja tidak berjalan sama sekali, dan variabel yang dipakai di kondisinya harus sudah punya nilai sebelum loop dimulai.',
        },
        {
          t: 'code',
          label: 'iterasi2.R',
          code: `iterasi2 <- function(x0) {
  i <- 1
  d <- 1                 # wajib: dipakai di kondisi sebelum dihitung
  while (d > 0.00001) {
    x1 <- -exp(x0)
    d  <- abs(x1 - x0)
    x0 <- x1
    i  <- i + 1
  }
  cat("Konvergen setelah", i - 1, "ulangan\n")
  cat("x =", x1, "\\n")
}

iterasi2(0)`,
          out: `Konvergen setelah 22 ulangan
x = -0.5671408`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Baris `d <- 1` bukan hiasan. Tanpa itu, `while (d > 0.00001)` akan memeriksa variabel yang belum ada dan menghasilkan galat `object "d" not found`. Ini pertanyaan yang hampir selalu muncul ketika mahasiswa mengubah `repeat` menjadi `while`: kedua bentuk memang setara secara hasil, tetapi tidak setara secara persiapan.',
        },
        {
          t: 'callout',
          tone: 'danger',
          title: 'Selalu pasang pengaman',
          text:
            'Kalau kriteria berhenti tidak pernah tercapai — karena salah rumus, salah tanda, atau data yang tidak konvergen — `repeat` akan berputar selamanya dan R membeku. Tambahkan pembatas: `if (i > 1000) stop("Tidak konvergen setelah 1000 iterasi")`. Satu baris ini mengubah pembekuan menjadi pesan yang bisa dibaca.',
        },
        {
          t: 'h2',
          text: 'Kapan memilih yang mana',
        },
        {
          t: 'table',
          head: ['', '`for`', '`while`', '`repeat … break`'],
          rows: [
            ['Jumlah ulangan', 'Diketahui', 'Tidak diketahui', 'Tidak diketahui'],
            ['Kondisi diperiksa', '—', 'Sebelum badan', 'Setelah badan'],
            ['Minimal berjalan', '0 kali', '0 kali', '1 kali'],
            ['Khas dipakai untuk', 'Menyusuri data', 'Iterasi sampai konvergen', 'Iterasi dengan pemeriksaan di tengah'],
          ],
          caption: 'Ketiganya bisa saling menggantikan secara teknis. Pilih yang paling jujur menggambarkan apa yang kamu ketahui tentang jumlah ulangan.',
        },
      ],
      summary: [
        '`while` memeriksa kondisi sebelum iterasi; `repeat` menjalankan badan dulu dan keluar lewat `break`.',
        'Iterasi numerik berhenti ketika perubahan antar-tebakan lebih kecil dari toleransi.',
        'Variabel yang dipakai di kondisi `while` harus diinisialisasi sebelum loop dimulai.',
      ],
      mistakes: [
        'Lupa `d <- 1` saat mengubah `repeat` menjadi `while`.',
        'Memindahkan `x0 <- x1` ke atas sehingga selisih selalu nol.',
        'Membuat `repeat` tanpa `break`, lalu membekukan R.',
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'next-return',
      title: 'next dan return: melewati satu iterasi, keluar dari fungsi',
      desc: 'Dua lompatan dengan arah yang berlawanan, dan cara membedakannya.',
      duration: 10,
      level: 2,
      objectives: [
        'Memakai `next` untuk melewati sisa badan loop pada satu iterasi.',
        'Memakai `return()` untuk keluar dari fungsi lebih awal.',
        'Membedakan efek `break`, `next`, dan `return`.',
      ],
      prereq: ['Loop dan percabangan (Modul 3, Pelajaran 1–4).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Kadang satu kasus khusus perlu dilewati, bukan dihentikan. Di sinilah `next` dipakai.',
        },
        {
          t: 'p',
          text:
            'Materi kuliah memberi contoh pembagian 1/x untuk x dari −2 sampai 2. Ketika x = 0, pembagiannya tidak terdefinisi, dan R mengembalikan `Inf`. Perilaku itu sah, tetapi kalau kamu ingin menanganinya secara eksplisit, `next` melewati sisa badan loop dan langsung ke iterasi berikutnya.',
        },
        {
          t: 'code',
          label: 'R',
          code: `for (x in c(-2, -1, 0, 1, 2)) {
  if (x == 0) {
    cat("x = 0 -> 1/x = Inf\\n")
    next
  }
  cat("x =", x, " 1/x =", 1/x, "\\n")
}`,
          out: `x = -2  1/x = -0.5 
x = -1  1/x = -1 
x = 0 -> 1/x = Inf
x = 1  1/x = 1 
x = 2  1/x = 0.5 `,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Tanpa `next`, baris terakhir akan tetap dijalankan untuk x = 0 dan mencetak dua kali. Dengan `next`, baris itu dilewati — tetapi loop tetap berlanjut ke x = 1. Itu bedanya dengan `break`, yang akan menghentikan loop sepenuhnya.',
        },
        {
          t: 'h2',
          text: 'Tiga lompatan, tiga akibat',
        },
        {
          t: 'table',
          head: ['Pernyataan', 'Akibat', 'Sisa iterasi', 'Iterasi berikutnya'],
          rows: [
            ['`break`', 'Keluar dari loop', 'Dilewati', 'Tidak dijalankan'],
            ['`next`', 'Lewati sisa iterasi ini', 'Dilewati', 'Dijalankan'],
            ['`return(nilai)`', 'Keluar dari fungsi', 'Dilewati', 'Tidak dijalankan'],
          ],
          caption: 'break dan next bekerja pada loop; return bekerja pada fungsi. Di dalam loop, return tetap keluar dari seluruh fungsi.',
        },
        {
          t: 'p',
          text:
            'Perbedaan `break` dan `return` mudah terlihat kalau keduanya dipakai di tempat yang sama. `break` hanya menghentikan loop, sehingga pernyataan setelah loop tetap berjalan. `return` menghentikan seluruh fungsi, sehingga apa pun setelahnya tidak dijalankan.',
        },
        {
          t: 'code',
          label: 'R',
          code: `lewatBreak <- function() {
  for (i in 1:5) {
    if (i == 3) break
  }
  "loop berhenti, fungsi lanjut"
}

lewatReturn <- function() {
  for (i in 1:5) {
    if (i == 3) return("fungsi keluar di i = 3")
  }
  "baris ini hanya jalan tanpa return"
}

lewatBreak()
lewatReturn()`,
          out: `[1] "loop berhenti, fungsi lanjut"
[1] "fungsi keluar di i = 3"`,
          outLabel: 'Keluaran',
        },
        {
          t: 'callout',
          tone: 'note',
          title: 'next di dalam fungsi bersarang',
          text:
            '`next` hanya melewati iterasi loop tempat ia berada. Kalau kamu punya loop bersarang dan menaruh `next` di loop dalam, loop luar tetap berjalan penuh. Kalau yang kamu inginkan adalah melewati seluruh peserta, `next` harus diletakkan di loop luar.',
        },
      ],
      summary: [
        '`next` melewati sisa satu iterasi dan melanjutkan ke iterasi berikutnya.',
        '`break` menghentikan loop; `return()` keluar dari fungsi.',
        'Letak `next` menentukan loop mana yang dilewati pada loop bersarang.',
      ],
      mistakes: [
        'Memakai `next` padahal maksudnya menghentikan loop (`break`).',
        'Mengira `break` juga menghentikan fungsi.',
        'Menaruh `next` di loop dalam padahal ingin melewati satu peserta utuh.',
      ],
    },
  ],
};
