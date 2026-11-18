/* ==========================================================================
   Modul 1 — R dan fungsi dasar
   Sumber: "Pertemuan 8 2026.pdf" (R sebagai bahasa pemrograman dan perangkat
   lunak komputer; data atomik; operator; fungsi buatan sendiri).
   Semua keluaran kode di bawah ini diambil dari R 4.5 dan sudah diuji ulang.
   ========================================================================== */

export const module1 = {
  id: 'r-dasar',
  num: 1,
  title: 'R dan Fungsi Dasar',
  short: 'R & fungsi',
  tagline: 'Bahasa, tipe data, operator, dan fungsi pertamamu',
  source: 'Pertemuan 8 2026.pdf',
  duration: 55,
  desc:
    'Mengenal R sebagai bahasa statistika, membedakan enam tipe data dasar, menghitung dengan modulo, lalu menulis fungsi pertama yang menerima input dan mengembalikan hasil.',
  goals: [
    'Menjelaskan posisi R sebagai bahasa statistika dan mengenali fungsi bawaannya.',
    'Membedakan enam tipe data atomik, termasuk double dan integer.',
    'Memakai operator aritmetika, modulo, dan pembagian bulat dengan tepat.',
    'Menulis fungsi sendiri yang lengkap: input, proses, dan output.',
  ],
  prereq: ['Belum ada. Modul ini adalah titik mulai.'],
  lessons: [
    /* ------------------------------------------------------------------ */
    {
      id: 'mengenal-r',
      title: 'Kenapa R, dan apa sebenarnya yang kamu pelajari',
      desc: 'Posisi R di statistika, ekosistem paketnya, dan mengapa program di R selalu berupa fungsi.',
      duration: 12,
      level: 1,
      objectives: [
        'Menjelaskan alasan R menjadi bahasa standar di statistika.',
        'Menyebutkan tujuh library yang dimuat otomatis saat R dijalankan.',
        'Membuka, menyimpan, dan menjalankan fungsi di workspace.',
      ],
      prereq: ['Tidak ada.'],
      blocks: [
        {
          t: 'lead',
          text:
            'Sebagian besar pekerjaan seorang ahli data bukan menulis program panjang, melainkan mengubah tabel angka menjadi keputusan. R dibuat persis untuk pekerjaan itu.',
        },
        {
          t: 'p',
          text:
            'Mata kuliah pemrograman di perguruan tinggi tidak lagi hanya berorientasi pada pembangunan perangkat lunak konvensional. Arahnya sudah bergeser ke pemecahan masalah berbasis data, dan R memegang peranan penting di sana. Dalam lingkup statistika, R adalah salah satu bahasa pemrograman dan perangkat lunak standar untuk analisis data, komputasi ilmiah, dan visualisasi.',
        },
        {
          t: 'p',
          text:
            'R punya karakter yang membedakannya dari bahasa umum seperti C++ atau Java. R dirancang oleh statistisi untuk statistisi, sehingga sintaksnya dekat dengan cara statistisi berpikir tentang data. Di C++ kamu harus mengurus tipe variabel, alokasi memori, dan struktur program yang panjang sebelum bisa menghitung satu rata-rata. Di R, satu baris sudah cukup.',
        },
        {
          t: 'h2',
          text: 'Ekosistem: CRAN dan tidyverse',
        },
        {
          t: 'p',
          text:
            'Kekuatan R terletak pada dukungan **CRAN** (*Comprehensive R Archive Network*), yaitu repositori global berisi puluhan ribu paket siap pakai — dari pemodelan ekonometrika sampai bioinformatika. Sebagian pekerjaan awal seorang ahli data juga difasilitasi **tidyverse**, kumpulan paket untuk pembersihan, transformasi, dan visualisasi data, dengan `ggplot2` untuk grafik dan `dplyr` untuk manipulasi tabel.',
        },
        {
          t: 'callout',
          tone: 'note',
          title: 'Kita tidak memakai tidyverse di mata kuliah ini',
          text:
            'Itu keputusan sadar. Seluruh latihan dikerjakan dengan R dasar, memakai loop dan fungsi yang kamu tulis sendiri. Alasannya sederhana: kamu perlu melihat bagaimana pekerjaan itu dilakukan sebelum memakai alat yang menyembunyikannya. Setelah paham, `dplyr` akan terasa seperti jalan pintas yang masuk akal, bukan kotak hitam.',
        },
        {
          t: 'h2',
          text: 'Harga yang harus dibayar',
        },
        {
          t: 'p',
          text:
            'R bukan tanpa kelemahan, dan jujur menyebutkannya lebih baik daripada menemukannya sendiri di tengah tugas. Belajar R di awal bisa terasa rumit bagi orang tanpa latar belakang statistika, karena banyak istilah statistika muncul langsung di nama fungsi. R juga dikenal boros memori (RAM): ia memuat seluruh data ke memori kerja, bukan membacanya sepotong-sepotong dari disk. Untuk data yang jauh lebih besar daripada RAM, tantangan ini diatasi dengan integrasi ke kerangka kerja Big Data seperti Apache Spark — di luar cakupan mata kuliah ini.',
        },
        {
          t: 'h2',
          text: 'Program di R lebih dikenal sebagai fungsi',
        },
        {
          t: 'p',
          text:
            'Ini perbedaan cara berpikir yang paling sering dilewati pemula. Di C atau Java, ada satu titik masuk bernama `main()` yang dijalankan dari atas ke bawah. Di R, tidak ada `main()`. Satuan pekerjaan terkecil yang bisa dipanggil adalah **fungsi**: bungkus bernama yang menerima masukan (*argumen*), menjalankan urutan perintah, dan mengembalikan satu nilai. Belajar pemrograman R berarti belajar membuat fungsi yang dapat dijalankan di platform R.',
        },
        {
          t: 'p',
          text:
            'R sudah membawa banyak fungsi bawaan yang siap dipakai. Fungsi-fungsi itu terhimpun dalam **library**. Tujuh library dimuat otomatis setiap kali R diaktifkan, dan kamu bisa memeriksanya dengan `sessionInfo()`:',
        },
        {
          t: 'code',
          label: 'R',
          run: false,
          code: `sessionInfo()$basePkgs`,
          out: `[1] "stats"     "graphics"  "grDevices" "utils"     "datasets"  "methods"  
[7] "base"`,
          outLabel: 'Keluaran di R',
        },
        {
          t: 'p',
          text:
            'Dari ketujuhnya, yang paling sering kamu pakai adalah `base`, yaitu library yang menyimpan fungsi untuk perhitungan matematika, logika, kontrol alur, dan manipulasi data. Karena itu seluruh latihan di situs ini dibuat dengan **meniru** kerja fungsi yang sudah ada di `base`. Hasilnya bisa diuji: jalankan fungsimu dan fungsi bawaan pada masukan yang sama, lalu bandingkan.',
        },
        {
          t: 'table',
          head: ['Library', 'Isi pokok'],
          rows: [
            ['base', 'Aritmetika, logika, kontrol alur, struktur data — fondasi semuanya'],
            ['stats', 'Fungsi statistik: distribusi, uji, regresi'],
            ['graphics', 'Grafik dasar'],
            ['grDevices', 'Perangkat grafis dan format ekspor gambar'],
            ['utils', 'Alat bantu: membaca berkas, `head()`, `help()`'],
            ['datasets', 'Kumpulan data contoh bawaan'],
            ['methods', 'Sistem objek S3/S4 yang dipakai di balik layar'],
          ],
          caption: 'Tujuh library yang dimuat otomatis. Kamu tidak perlu memanggil salah satunya secara manual.',
        },
        {
          t: 'h2',
          text: 'Workspace dan perintah fix()',
        },
        {
          t: 'p',
          text:
            'Fungsi yang kamu buat hidup di **workspace**, yaitu kumpulan objek yang tersimpan di sesi R saat itu. Perintah `fix(nama_fungsi)` membuka jendela editor teks untuk menulis isi fungsi, lalu menyimpannya kembali ke workspace begitu jendela ditutup. Contoh klasik dari materi kuliah:',
        },
        {
          t: 'code',
          label: 'R',
          run: false,
          code: `fix(myfun1)

# Jendela editor terbuka. Isinya:
# function ()
# {
#   print("Belajar Pemrograman R")
# }`,
          out: '',
          outLabel: '',
        },
        {
          t: 'p',
          text:
            'Perhatikan bahwa `fix` menampilkan fungsi **tanpa nama**. Nama `myfun1` hidup di workspace sebagai nama objek, bukan sebagai teks di dalam fungsi. Untuk menjalankannya, cukup panggil namanya diikuti tanda kurung:',
        },
        {
          t: 'code',
          label: 'R',
          run: false,
          code: `myfun1()`,
          out: `[1] "Belajar Pemrograman R"`,
          outLabel: 'Keluaran',
        },
        {
          t: 'callout',
          tone: 'warm',
          title: 'fix() untuk latihan saja',
          text:
            '`fix()` membuka editor sementara. Ia tidak membuat berkas, tidak bisa dijalankan ulang di komputer lain, dan isinya hilang begitu R ditutup. Di kelas, `fix()` berguna untuk mendemonstrasikan isi sebuah fungsi. Untuk pekerjaan sungguhan, kamu akan menulis fungsi di berkas `.R` lalu memanggilnya dengan `source()`.',
        },
        {
          t: 'callout',
          tone: 'plain',
          title: 'Kesalahan yang paling sering terjadi',
          text:
            'Di dalam jendela `fix`, tulis **hanya** `function (...)` — tanpa nama dan tanpa tanda `<-`. Kalau kamu menulis `myfun1 <- function(...)` di dalam editor, kamu membuat fungsi yang isinya fungsi. Akibatnya `myfun1()` akan mengembalikan sebuah fungsi, bukan menjalankan perintahnya.',
        },
      ],
      summary: [
        'R adalah bahasa statistika yang dirancang untuk pengolahan data, bukan pembangunan perangkat lunak umum.',
        'Kekuatannya ada pada ekosistem paket; tujuh library dimuat otomatis, dan `base` adalah fondasi semua latihan kita.',
        'Program di R berupa fungsi yang hidup di workspace, menerima argumen, dan mengembalikan nilai.',
      ],
      mistakes: [
        'Mengira R punya `main()` seperti C atau Java.',
        'Menulis `nama <- function()` di dalam jendela `fix()`, sehingga menghasilkan fungsi bersarang.',
        'Mengira `library` adalah folder berkas; `library` adalah kumpulan fungsi yang sudah dimuat.',
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'tipe-atomik',
      title: 'Enam tipe data atomik',
      desc: 'Kenapa 5 dan 5L berbeda, dan bagaimana R memeriksa serta mengubah tipe data.',
      duration: 14,
      level: 1,
      objectives: [
        'Menyebutkan enam tipe data atomik beserta contohnya.',
        'Memeriksa tipe sebuah nilai dengan fungsi `is.…()`.',
        'Menjelaskan mengapa R membedakan double dan integer.',
        'Memprediksi hasil konversi otomatis ketika tipe bercampur.',
      ],
      prereq: ['Menjalankan perintah di R (Modul 1, Pelajaran 1).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Sebelum bisa mengolah data, R harus tahu data itu apa. Enam tipe atomik adalah jawaban R atas pertanyaan sederhana: nilai ini angka, teks, atau benar-salah?',
        },
        {
          t: 'p',
          text:
            '**Data atomik** adalah nilai tunggal yang tidak bisa dipecah lagi. Ia menjadi fondasi bagi struktur yang lebih kompleks — vektor, matriks, array, dan data frame — karena semua struktur itu pada akhirnya dibangun dari tumpukan nilai atomik. Ada enam tipe: karakter, numerik real (*double*), numerik bulat (*integer*), logika, bilangan kompleks, dan *raw*.',
        },
        {
          t: 'table',
          head: ['Tipe', 'Contoh', 'Pemeriksa', 'Dipakai untuk'],
          rows: [
            ['character', '`"5"`', '`is.character()`', 'Teks, label, nama'],
            ['double', '`5`', '`is.double()`', 'Hampir semua angka hitungan'],
            ['integer', '`5L`', '`is.integer()`', 'Cacah, indeks, nomor'],
            ['logical', '`TRUE`', '`is.logical()`', 'Kondisi pada `if`, `while`'],
            ['complex', '`5+3i`', '`is.complex()`', 'Bilangan dengan bagian imajiner'],
            ['raw', '`charToRaw("5")`', '`is.raw()`', 'Data bita mentah'],
          ],
          caption: 'Akhiran L pada 5L berasal dari kata long integer dan merupakan satu-satunya cara menulis bilangan bulat secara eksplisit.',
        },
        {
          t: 'code',
          label: 'R',
          run: false,
          code: `x  <- 5
y  <- 5L
x1 <- "5"
x2 <- TRUE
x3 <- 5 + 3i
x4 <- charToRaw("5")

is.double(x)     # TRUE
is.integer(y)    # TRUE
is.character(x1) # TRUE
is.logical(x2)   # TRUE
is.complex(x3)   # TRUE
is.raw(x4)       # TRUE`,
          out: '',
          outLabel: '',
        },
        {
          t: 'h2',
          text: 'Kenapa 5 dan 5L dibedakan',
        },
        {
          t: 'p',
          text:
            'Sekilas keduanya sama-sama lima. Perbedaannya bukan kosmetik: `5` disimpan sebagai pecahan dengan presisi terbatas, sedangkan `5L` disimpan sebagai bilangan bulat sejati. Kamu bisa membuktikannya dengan dua fungsi yang berbeda jawabannya:',
        },
        {
          t: 'code',
          label: 'R',
          code: `typeof(5)
typeof(5L)
class(5)
is.double(5)
is.integer(5)`,
          out: `[1] "double"
[1] "integer"
[1] "numeric"
[1] TRUE
[1] FALSE`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Perhatikan baris ketiga: `class(5)` menjawab `"numeric"`, bukan `"double"`. Ini bukan kontradiksi. `class` melaporkan kategori yang dipakai sistem objek (dan `numeric` adalah kategori untuk semua angka), sedangkan `typeof` melaporkan cara penyimpanan yang sebenarnya. Untuk membedakan double dan integer, pakai `typeof` atau `is.integer`.',
        },
        {
          t: 'callout',
          tone: 'note',
          title: 'Kapan perbedaan ini penting',
          text:
            'Saat menghitung cacah, indeks, atau jumlah baris, R kadang mengembalikan double meskipun nilainya bulat. Fungsi yang menuntut bilangan bulat — misalnya indeks vektor, atau `times` pada `rep()` — akan menolak double pecahan. Kalau muncul pesan aneh tentang tipe, periksa dulu dengan `typeof()`.',
        },
        {
          t: 'h2',
          text: 'Konversi otomatis: R memilih tipe terlonggar',
        },
        {
          t: 'p',
          text:
            'Ketika nilai berbeda tipe digabung dalam satu vektor, R tidak menolak. Ia mengubah semuanya ke tipe yang paling longgar menurut urutan `logical → integer → double → complex → character`. Urutan ini perlu diingat karena akibatnya sering mengejutkan:',
        },
        {
          t: 'code',
          label: 'R',
          code: `c(1, "a")      # angka dipaksa menjadi teks
TRUE + 1      # logical dihitung sebagai 1
c(1, TRUE)    # semuanya menjadi angka`,
          out: `[1] "1" "a"
[1] 2
[1] 1 1`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Baris pertama menjelaskan mengapa sebuah vektor tidak bisa memuat angka dan teks sekaligus. Begitu ada satu teks, seluruh isinya menjadi teks, dan angka `1` berubah menjadi `"1"` yang tidak bisa dijumlahkan. Baris kedua menjelaskan mengapa `TRUE` bisa dipakai dalam perhitungan: ia bernilai 1, sedangkan `FALSE` bernilai 0.',
        },
        {
          t: 'h2',
          text: 'T dan F bukan konstanta',
        },
        {
          t: 'p',
          text:
            'Materi kuliah memakai `T` sebagai contoh nilai logika. Itu sah, karena `T` adalah singkatan bawaan untuk `TRUE`. Tetapi ada jebakan: `T` hanyalah **variabel biasa**, bukan konstanta yang dilindungi. Perintah berikut berhasil tanpa peringatan apa pun:',
        },
        {
          t: 'code',
          label: 'R',
          code: `T <- 7
T`,
          out: `[1] 7`,
          outLabel: 'Keluaran',
        },
        {
          t: 'callout',
          tone: 'warm',
          title: 'Selalu tulis TRUE dan FALSE',
          text:
            'Setelah `T <- 7`, setiap `if (T)` di sesi itu akan berperilaku lain. `TRUE` tidak bisa ditimpa seperti itu, sehingga lebih aman. Menulis tiga huruf tambahan jauh lebih murah daripada mencari bug yang muncul hanya karena ada variabel bernama `T` di suatu tempat.',
        },
        {
          t: 'h2',
          text: 'Dua tipe yang jarang, tetapi tetap perlu dikenal',
        },
        {
          t: 'p',
          text:
            '**Complex** dipakai untuk bilangan dengan bagian imajiner, ditulis dengan akhiran `i`. Bagiannya bisa dipisahkan dengan `Re()` dan `Im()`: `Re(5+3i)` bernilai 5 dan `Im(5+3i)` bernilai 3. **Raw** menyimpan deretan bita mentah; `charToRaw("5")` menghasilkan `35`, yaitu kode heksadesimal untuk karakter `"5"`, dan `rawToChar()` mengembalikannya menjadi teks. Keduanya jarang muncul di analisis statistika, tetapi kamu akan bertemu `raw` saat membaca berkas biner.',
        },
      ],
      summary: [
        'Ada enam tipe atomik: character, double, integer, logical, complex, dan raw.',
        '`5` adalah double, `5L` adalah integer; `typeof()` membedakan keduanya dengan jelas.',
        'Saat tipe bercampur, R mengonversi ke tipe terlonggar — satu teks mengubah seluruh vektor menjadi teks.',
      ],
      mistakes: [
        'Mengira `class(5)` mengembalikan `"double"`; yang benar `"numeric"`.',
        'Memakai `T` dan `F` sebagai nilai logika padahal keduanya bisa ditimpa.',
        'Mengira `c(1, "a")` menghasilkan galat; R diam-diam mengubah angka menjadi teks.',
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'operator',
      title: 'Operator, modulo, dan pembagian bulat',
      desc: 'Menghitung dengan R, lalu membuktikan bahwa %% dan %/% bukan kotak hitam.',
      duration: 13,
      level: 2,
      objectives: [
        'Menggunakan operator `+`, `-`, `*`, `/`, `^`, `%%`, dan `%/%` dengan tepat.',
        'Menjelaskan perbedaan `/`, `%%`, dan `%/%` pada contoh nyata.',
        'Menulis algoritma pembagian bulat dengan pengurangan berulang.',
        'Memprediksi hasil operasi campuran berdasarkan urutan prioritas.',
      ],
      prereq: ['Enam tipe atomik (Modul 1, Pelajaran 2).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Tiga operator pembagian di R terlihat mirip dan sering tertukar. Bedanya jelas begitu kamu melihat sisanya.',
        },
        {
          t: 'p',
          text:
            'Operator aritmetika di R bekerja seperti di kalkulator, dengan tambahan dua operator yang jarang ada di bahasa lain: `%%` untuk sisa hasil bagi (**modulo**) dan `%/%` untuk hasil bagi bulat. Keduanya menerima dua angka dan mengembalikan satu angka.',
        },
        {
          t: 'table',
          head: ['Operator', 'Nama', 'Contoh', 'Hasil'],
          rows: [
            ['`+` `-` `*`', 'Tambah, kurang, kali', '`6 * 7`', '`42`'],
            ['`/`', 'Bagi (selalu pecahan)', '`7 / 2`', '`3.5`'],
            ['`^`', 'Pangkat', '`2 ^ 10`', '`1024`'],
            ['`%%`', 'Sisa hasil bagi', '`25 %% 7`', '`4`'],
            ['`%/%`', 'Hasil bagi bulat', '`25 %/% 7`', '`3`'],
          ],
          caption: 'Semua operator ini juga bekerja pada vektor, bukan hanya pada satu angka.',
        },
        {
          t: 'code',
          label: 'R',
          code: `25 / 7
25 %/% 7
25 %% 7`,
          out: `[1] 3.571429
[1] 3
[1] 4`,
          outLabel: 'Keluaran',
        },
        {
          t: 'h2',
          text: 'Membaca hasilnya sebagai pembagian bersisa',
        },
        {
          t: 'p',
          text:
            'Hubungan ketiganya satu kalimat: **yang dibagi = pembagi × hasil bagi + sisa**. Untuk 25 dan 7, hasil bagi bulatnya 3, sisanya 4, dan memang 7 × 3 + 4 = 25. Karena itu `%/%` dan `%%` selalu dipakai berpasangan ketika kamu perlu memecah sebuah bilangan.',
        },
        {
          t: 'p',
          text:
            'Contoh yang dekat dengan kuliah: menentukan bilangan genap atau ganjil. Bilangan genap adalah bilangan yang sisanya nol ketika dibagi 2, jadi `x %% 2 == 0` adalah pertanyaannya. Untuk 7, `7 %% 2` bernilai 1, sehingga 7 bukan genap.',
        },
        {
          t: 'callout',
          tone: 'note',
          title: 'Kenapa %/% bukan pembulatan',
          text:
            '`%/%` membuang bagian pecahan, bukan membulatkan ke bawah secara umum. Itu sebabnya untuk bilangan positif keduanya tampak sama, tetapi pada bilangan negatif hasilnya berbeda dari dugaan. Materi kuliah membatasi algoritmanya pada `a >= b`, dan di wilayah itulah `myBagi` di bawah berlaku persis.',
        },
        {
          t: 'h2',
          text: 'Membuktikan %% dan %/% dengan pengurangan berulang',
        },
        {
          t: 'p',
          text:
            'Materi kuliah tidak berhenti pada pemakaian operator. Kamu diminta membuat fungsi buatan sendiri yang menghasilkan nilai sama, memakai algoritma berikut.',
        },
        {
          t: 'steps',
          items: [
            { title: 'Siapkan dua wadah', text: '`hasil` diisi 0 untuk menghitung berapa kali pengurangan berhasil, dan `sisa` diisi `a` sebagai nilai yang akan dikurangi terus-menerus.' },
            { title: 'Kurangi selama masih bisa', text: 'Selama `sisa >= b`, kurangi `sisa` dengan `b` dan tambah `hasil` dengan 1. Setiap pengurangan yang berhasil berarti satu kali pembagian.' },
            { title: 'Berhenti ketika tidak bisa lagi', text: 'Ketika `sisa < b`, pengurangan tidak bisa dilanjutkan. Nilai `sisa` saat itu adalah sisa pembagian, dan `hasil` adalah hasil bagi bulat.' },
            { title: 'Kembalikan keduanya', text: 'Fungsi mengembalikan dua nilai sekaligus, karena sisa dan hasil bagi sama-sama dibutuhkan.' },
          ],
        },
        {
          t: 'code',
          label: 'myBagi.R',
          code: `myBagi <- function(a, b) {
  hasil <- 0
  sisa  <- a
  while (sisa >= b) {
    sisa  <- sisa - b
    hasil <- hasil + 1
  }
  return(list(SISA = sisa, HASIL = hasil))
}

myBagi(25, 7)`,
          out: `$SISA
[1] 4

$HASIL
[1] 3`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Perintah `while` di dalamnya akan dibahas penuh di Modul 3. Untuk sekarang, cukup baca sebagai "ulangi selama `sisa >= b`". Hasilnya sama dengan `25 %% 7` dan `25 %/% 7`, dan itulah gunanya: fungsi buatan sendiri bisa diuji terhadap fungsi bawaan karena keduanya menjawab pertanyaan yang sama.',
        },
        {
          t: 'h2',
          text: 'Fungsi matematika dasar',
        },
        {
          t: 'code',
          label: 'R',
          code: `sqrt(16)
abs(-7)
log2(8)
log10(1000)
exp(0)`,
          out: `[1] 4
[1] 7
[1] 3
[1] 3
[1] 1`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            '`log()` tanpa argumen kedua adalah logaritma natural, jadi `log(exp(1))` bernilai 1. Kalau kamu ingin basis lain, tulis eksplisit: `log(8, base = 2)` juga bernilai 3. Membiasakan diri menulis basis secara eksplisit mencegah kebingungan saat membaca kode orang lain.',
        },
        {
          t: 'h2',
          text: 'Urutan pengerjaan',
        },
        {
          t: 'p',
          text:
            'R mengikuti urutan yang sama dengan matematika: pangkat lebih dulu, lalu kali dan bagi, terakhir tambah dan kurang. Operator perbandingan (`==`, `<`) dikerjakan setelah aritmetika, dan logika (`&`, `|`) paling akhir. Tanda kurung selalu menang, dan menambahkannya adalah cara termurah untuk membuat maksudmu jelas bagi pembaca lain — termasuk dirimu enam bulan nanti.',
        },
        {
          t: 'code',
          label: 'R',
          code: `2 + 3 * 4
(2 + 3) * 4
2 ^ 3 ^ 2`,
          out: `[1] 14
[1] 20
[1] 512`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Baris terakhir menunjukkan bahwa `^` dikerjakan dari kanan: `2^(3^2)` = `2^9` = 512, bukan `(2^3)^2` = 64. Ini satu-satunya operator aritmetika R yang berasosiasi ke kanan, dan pertanyaan tentangnya sering muncul di kuis.',
        },
      ],
      summary: [
        '`/` menghasilkan pecahan, `%/%` membuang pecahan, `%%` mengambil sisanya.',
        'Ketiganya terhubung oleh satu identitas: yang dibagi = pembagi × hasil bagi + sisa.',
        'Operator pangkat berasosiasi ke kanan; tanda kurung menghilangkan semua keraguan.',
      ],
      mistakes: [
        'Memakai `/` padahal yang dibutuhkan cacah pembagian bulat.',
        'Mengira `%/%` sama dengan pembulatan; keduanya berbeda pada bilangan negatif.',
        'Menulis `2^3^2` dan mengira hasilnya 64.',
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'fungsi-sendiri',
      title: 'Menulis fungsi pertamamu',
      desc: 'Input, proses, output — dan mengapa algoritma ditulis sebelum kode.',
      duration: 16,
      level: 2,
      objectives: [
        'Menulis fungsi dengan `function()` yang menerima argumen dan mengembalikan nilai.',
        'Menjelaskan peran `return()` dan kapan boleh dihilangkan.',
        'Menyusun pseudocode INPUT–PROSES–OUTPUT sebelum menulis kode.',
        'Menambahkan pemeriksaan prasyarat agar fungsi tidak memberi hasil menyesatkan.',
      ],
      prereq: ['Tipe data dan operator (Modul 1, Pelajaran 2–3).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Fungsi yang baik menjawab satu pertanyaan. Nama fungsinya adalah pertanyaannya, dan nilai yang dikembalikan adalah jawabannya.',
        },
        {
          t: 'p',
          text:
            'Materi kuliah menekankan satu kebiasaan yang membedakan penulis kode pemula dari yang sudah terbiasa: analisis **input, proses, dan output** sebaiknya sudah tersedia dalam bentuk algoritma sebelum diterjemahkan ke bahasa pemrograman. Untuk program yang sangat kecil, menulis kode langsung memang masih memungkinkan. Untuk masalah yang lebih besar, melompat ke kode hampir selalu berakhir dengan menulis ulang.',
        },
        {
          t: 'h2',
          text: 'Anatomi sebuah fungsi',
        },
        {
          t: 'p',
          text:
            'Fungsi di R ditulis dengan kata kunci `function`, daftar argumen di dalam tanda kurung, lalu badan fungsi di dalam kurung kurawal. Mari mulai dari yang paling sederhana: menghitung luas persegi panjang.',
        },
        {
          t: 'code',
          label: 'luas.R',
          code: `luas <- function(panjang, lebar) {
  hasil <- panjang * lebar
  return(hasil)
}

luas(10, 5)`,
          out: `[1] 50`,
          outLabel: 'Keluaran',
        },
        {
          t: 'steps',
          items: [
            { title: 'Nama', text: '`luas` adalah nama objek di workspace. Nama yang baik menjelaskan apa yang dihitung, bukan bagaimana caranya.' },
            { title: 'Argumen', text: '`panjang` dan `lebar` adalah input. Keduanya hanya ada di dalam fungsi, dan tidak mengubah variabel bernama sama di luar.' },
            { title: 'Badan fungsi', text: 'Bagian di antara kurung kurawal berisi proses. Di sini satu perhitungan disimpan ke `hasil`.' },
            { title: 'Nilai kembali', text: '`return(hasil)` menutup fungsi dan mengirim 50 ke pemanggilnya. Tanpa `return`, R mengembalikan nilai pernyataan terakhir.' },
          ],
        },
        {
          t: 'h2',
          text: 'Kapan return boleh dihilangkan',
        },
        {
          t: 'p',
          text:
            'R mengembalikan nilai dari ekspresi terakhir di badan fungsi secara otomatis. Jadi dua fungsi berikut memberi hasil yang sama:',
        },
        {
          t: 'code',
          label: 'R',
          code: `dengan_return <- function(x) {
  return(x * 2)
}

tanpa_return <- function(x) {
  x * 2
}

dengan_return(21)
tanpa_return(21)`,
          out: `[1] 42
[1] 42`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Meski begitu, biasakan menulis `return()` secara eksplisit. Alasannya bukan gaya: ketika fungsi tumbuh dan punya beberapa cabang, `return()` memberi tahu pembaca dengan jelas di mana fungsi berhenti dan apa yang dibawanya. Ia juga satu-satunya cara keluar lebih awal dari tengah fungsi, yang akan kamu pakai di Modul 3.',
        },
        {
          t: 'callout',
          tone: 'warm',
          title: 'Fungsi tanpa return bisa mengembalikan NULL',
          text:
            'Kalau pernyataan terakhir adalah `if` yang kondisinya salah dan tidak punya `else`, nilai terakhirnya adalah `NULL`. Fungsi tetap "berhasil" dijalankan, tetapi mengembalikan nilai kosong yang panjangnya 0. Ini penyebab hasil aneh yang sulit dilacak, dan akan kita bedah di Modul 3.',
        },
        {
          t: 'h2',
          text: 'Algoritma lebih dulu, kode kemudian',
        },
        {
          t: 'p',
          text:
            'Perhatikan latihan wajib dari materi: membuat `cek_Faktor(a, b)` yang memeriksa apakah `b` adalah faktor dari `a`, dengan prasyarat `a > b`. Sebelum menulis R, tulis dulu algoritmanya.',
        },
        {
          t: 'code',
          label: 'Pseudocode',
          plain: true,
          code: `INPUT   : a, b  (bilangan bulat, a > b)
PROSES  : hitung sisa a dibagi b
          jika sisa = 0 maka b adalah faktor a
OUTPUT  : TRUE atau FALSE`,
          out: '',
          outLabel: '',
        },
        {
          t: 'p',
          text:
            'Pseudocode di atas tidak menyebut R sama sekali. Ia bisa diterjemahkan ke bahasa apa pun, dan itu tanda bahwa algoritmanya sudah benar. Terjemahan ke R menjadi pekerjaan mekanis:',
        },
        {
          t: 'code',
          label: 'cek_Faktor.R',
          code: `cek_Faktor <- function(a, b) {
  if (a <= b) {
    stop("Prasyarat dilanggar: a harus lebih besar dari b.")
  }
  myBagi(a, b)$SISA == 0
}

cek_Faktor(12, 3)
cek_Faktor(12, 5)`,
          out: `[1] TRUE
[1] FALSE`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Fungsi ini memakai `myBagi` dari pelajaran sebelumnya, dan itulah pola yang diharapkan materi: fungsi kecil disusun menjadi fungsi yang lebih besar. Baris `stop()` adalah tambahan dari situs ini, bukan dari dokumen dosen. Gunanya menjaga prasyarat: tanpa pemeriksaan itu, `cek_Faktor(3, 12)` akan menjawab `FALSE` dengan tenang, padahal pertanyaannya sendiri tidak sah.',
        },
        {
          t: 'callout',
          tone: 'note',
          title: 'Prasyarat adalah bagian dari jawaban',
          text:
            'Fungsi yang menerima input di luar prasyaratnya bukan sekadar "kurang akurat" — ia memberi jawaban yang salah tanpa memberi tahu siapa pun. Menuliskan prasyarat di komentar, lalu memeriksanya dengan `stop()`, adalah dua kebiasaan kecil yang membuat kode orang lain bisa dipercaya.',
        },
        {
          t: 'h2',
          text: 'Faktorial: fungsi kedua yang wajib kamu buat',
        },
        {
          t: 'p',
          text:
            'Latihan wajib berikutnya adalah faktorial, yaitu `n! = 1 × 2 × 3 × … × n`. Pola yang dipakai sama seperti `myBagi`: satu wadah yang diperbarui berulang kali. Bedanya, wadah itu dikalikan, bukan ditambah, dan karena itu nilai awalnya harus 1 — bukan 0, sebab mengalikan apa pun dengan 0 menghapus segalanya.',
        },
        {
          t: 'code',
          label: 'faktorial.R',
          code: `faktorial <- function(n) {
  hasil <- 1
  for (i in 1:n) {
    hasil <- hasil * i
  }
  return(hasil)
}

faktorial(5)`,
          out: `[1] 120`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Baris `for (i in 1:n)` dibaca "untuk setiap i dari 1 sampai n". Perulangan dibahas penuh di Modul 3; untuk sekarang cukup perhatikan bahwa badan perulangan dijalankan n kali, dan setiap kali `hasil` dikalikan dengan bilangan berikutnya.',
        },
        {
          t: 'callout',
          tone: 'warm',
          title: 'Jebakan 1:0',
          text:
            'Kalau `n` bernilai 0, `1:0` **bukan** vektor kosong — R menghasilkan `c(1, 0)`, sehingga perulangan berjalan dua kali dan hasilnya 0. Secara matematika `0! = 1`. Perbaikannya `for (i in seq_len(n))`, yang menghasilkan vektor kosong ketika `n = 0`, ditambah pemeriksaan `if (n == 0) return(1)`.',
        },
      ],
      summary: [
        'Fungsi ditulis dengan `function()`, menerima argumen, dan mengembalikan satu nilai.',
        '`return()` boleh dihilangkan karena R mengembalikan ekspresi terakhir, tetapi menuliskannya lebih jelas.',
        'Algoritma INPUT–PROSES–OUTPUT ditulis sebelum kode, dan prasyarat diperiksa agar hasil tidak menyesatkan.',
      ],
      mistakes: [
        'Memulai akumulator perkalian dari 0, sehingga semua hasil menjadi 0.',
        'Memakai `1:n` ketika `n` mungkin nol.',
        'Mengira argumen fungsi mengubah variabel di luar fungsi yang namanya sama.',
      ],
    },
  ],
};
