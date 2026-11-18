/* ==========================================================================
   Modul 2 — Vektor
   Sumber: "Pertemuan 8 2026.pdf" (2.2 Data Vektor) dan
   "Pert 9 Vektor.pdf" (aljabar vektor: penjumlahan dan hasil kali titik).
   ========================================================================== */

export const module2 = {
  id: 'vektor',
  num: 2,
  title: 'Vektor',
  short: 'Vektor',
  tagline: 'Struktur data pertama, dan jebakan terbesarnya',
  source: 'Pertemuan 8 2026.pdf · Pert 9 Vektor.pdf',
  duration: 70,
  desc:
    'Membuat dan mengindeks vektor, mengukur panjangnya, lalu membedakan perkalian elemen per elemen dari hasil kali titik — perbedaan yang menentukan seluruh Modul 4.',
  goals: [
    'Membuat vektor dengan `c()`, `rep()`, `seq()`, dan operator `:`.',
    'Mengambil elemen dengan indeks positif, negatif, dan logika.',
    'Menghitung panjang vektor dengan `length()` dan dengan loop sendiri.',
    'Membedakan operasi elemen per elemen dari hasil kali titik.',
    'Menulis algoritma jumlah, maksimum, minimum, pengurutan, dan pencarian faktor.',
  ],
  prereq: ['Modul 1: tipe data, operator, dan penulisan fungsi.'],
  lessons: [
    /* ------------------------------------------------------------------ */
    {
      id: 'membuat-vektor',
      title: 'Membuat vektor',
      desc: 'Empat cara menyusun deretan nilai, dan kapan memakai yang mana.',
      duration: 12,
      level: 1,
      objectives: [
        'Membuat vektor dengan `c()`, `rep()`, `seq()`, dan operator `:`.',
        'Menjelaskan perbedaan hasil `seq()` dan operator `:`.',
        'Mengetahui bahwa vektor R ditulis mendatar meskipun matematika menulisnya menurun.',
      ],
      prereq: ['Tipe data atomik (Modul 1, Pelajaran 2).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Satu nilai jarang berguna. Yang selalu kamu punya adalah deretan nilai: nilai ujian seluruh kelas, pengamatan selama sebulan, sisa galat sebuah model.',
        },
        {
          t: 'p',
          text:
            '**Vektor** adalah data dalam dimensi satu. Ia dibangun dari data atomik, dan menjadi bahan dasar bagi semua struktur yang lebih besar. Di R, vektor dibentuk dengan beberapa cara, dan keempatnya punya tempat masing-masing.',
        },
        {
          t: 'table',
          head: ['Cara', 'Contoh', 'Kapan dipakai'],
          rows: [
            ['`c()`', '`c(3, 4, 5, 9)`', 'Nilai sedikit dan tidak berpola'],
            ['`rep()`', '`rep(3, 10)`', 'Nilai yang diulang'],
            ['`seq()`', '`seq(0, 1, by = 0.25)`', 'Barisan dengan langkah tertentu'],
            ['`:`', '`3:10`', 'Barisan bilangan bulat berlangkah 1'],
          ],
        },
        {
          t: 'code',
          label: 'R',
          code: `x5 <- c(3, 4, 5, 9)
x6 <- rep(3, 10)
x7 <- seq(0, 1, by = 0.25)
x8 <- 3:10

x5
x6
x7
x8`,
          out: `[1] 3 4 5 9
 [1] 3 3 3 3 3 3 3 3 3 3
[1] 0.00 0.25 0.50 0.75 1.00
[1]  3  4  5  6  7  8  9 10`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Perhatikan tiga hal pada keluaran di atas. Angka `[1]` di awal setiap baris adalah nomor posisi elemen pertama pada baris itu, bukan bagian dari nilai. Spasi di antara angka hanya perataan agar kolom rapi. Dan `seq()` menampilkan dua angka di belakang koma karena salah satu anggotanya pecahan, sementara `:` menampilkan bilangan bulat.',
        },
        {
          t: 'h2',
          text: 'seq() dan : tidak selalu bisa saling menggantikan',
        },
        {
          t: 'p',
          text:
            'Operator `:` hanya menerima langkah 1 dan arahnya mengikuti urutan kedua ujungnya. `10:1` berjalan mundur, sedangkan `1:10` maju. Untuk langkah selain 1, kamu harus memakai `seq()`.',
        },
        {
          t: 'code',
          label: 'R',
          code: `1:5
10:1
seq(1, 10, by = 0.5)
seq(10, 1, by = -3)`,
          out: `[1] 1 2 3 4 5
 [1] 10  9  8  7  6  5  4  3  2  1
 [1]  1.0  1.5  2.0  2.5  3.0  3.5  4.0  4.5  5.0  5.5  6.0  6.5  7.0  7.5  8.0
[16]  8.5  9.0  9.5 10.0
[1] 10  7  4  1`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Baris ketiga juga memperlihatkan perilaku penting: ketika isi vektor lebih panjang daripada muat satu baris, R melanjutkannya di baris baru dan memberi nomor posisi elemen pertama baris itu, di sini `[11]`. Jadi `[11]` menandakan bahwa angka 6.0 adalah elemen kesebelas, bukan bahwa ada sebelas angka sebelumnya yang hilang.',
        },
        {
          t: 'callout',
          tone: 'note',
          title: 'Bentuk baku vektor di matematika berbeda arah',
          text:
            'Di matematika, vektor baku ditulis menurun sebagai kolom: (3, 5, 1)ᵀ. Di R, vektor ditulis mendatar sebagai baris. `c(3, 5, 1)` **adalah** vektor kolom itu. Perbedaan penulisan ini penting di Modul 4, karena hasil kali titik didefinisikan sebagai aᵀb — baris dikali kolom — dan R sudah menyimpan semuanya sebagai vektor mendatar.',
        },
        {
          t: 'h2',
          text: 'Menyusun dari potongan yang sudah ada',
        },
        {
          t: 'p',
          text:
            '`c()` menerima vektor sebagai argumen, bukan hanya angka. Artinya kamu bisa menyusun vektor baru dari vektor lama, dan inilah cara kamu nanti menambahkan hasil satu per satu ke dalam wadah.',
        },
        {
          t: 'code',
          label: 'R',
          code: `x9 <- c(9, 5, 6, 1:4, rep(10, 5))
x9`,
          out: ` [1]  9  5  6  1  2  3  4 10 10 10 10 10`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Vektor `x9` memuat tiga angka, lalu barisan `1:4`, lalu lima angka 10 — total 12 elemen. Contoh ini diambil langsung dari materi kuliah karena akan dipakai berulang: ia punya nilai berulang (10 muncul lima kali) dan urutan yang tidak teratur (9, 5, 6 muncul sebelum 1), sehingga cocok untuk menguji algoritma pengurutan dan pencarian maksimum.',
        },
      ],
      summary: [
        'Vektor adalah data berdimensi satu yang dibangun dari data atomik.',
        '`c()` menempelkan nilai, `rep()` mengulang, `seq()` membuat barisan berlangkah, `:` membuat barisan bulat berlangkah 1.',
        'Penulisan R mendatar, meskipun matematika menulis vektor sebagai kolom.',
      ],
      mistakes: [
        'Memakai `:` padahal butuh langkah selain 1.',
        'Mengira `[11]` pada keluaran adalah bagian dari nilai.',
        'Mengira `c(3,5,1)` adalah vektor baris yang berbeda dari vektor kolom di buku.',
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'mengindeks',
      title: 'Mengambil elemen',
      desc: 'Indeks positif, rentang, negatif, dan logika — semuanya dimulai dari 1.',
      duration: 14,
      level: 2,
      objectives: [
        'Mengambil satu elemen, beberapa elemen, dan rentang elemen.',
        'Menggunakan indeks negatif untuk membuang elemen.',
        'Memakai vektor logika sebagai indeks.',
        'Menjelaskan hasil `NA` dan vektor kosong ketika indeks di luar jangkauan.',
      ],
      prereq: ['Membuat vektor (Modul 2, Pelajaran 1).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Indeks di R dimulai dari 1. Bukan 0 seperti di C, Java, atau Python — dan perbedaan satu angka ini adalah sumber galat paling umum bagi mahasiswa yang pernah belajar bahasa lain.',
        },
        {
          t: 'p',
          text:
            'Nilai elemen diambil dengan rumus `nama[index]`. Kurung siku di sini adalah **operator**, bukan tanda baca: ia melakukan pekerjaan yang sama pentingnya dengan `+` atau `*`. Isi kurung siku disebut indeks, dan boleh berupa satu angka, deretan angka, atau kondisi logika.',
        },
        {
          t: 'vizvec',
          values: [3, 4, 5, 9],
          caption: 'Klik salah satu kotak untuk melihat indeks dan nilainya. Perhatikan bahwa indeks pertama adalah 1, bukan 0.',
        },
        {
          t: 'code',
          label: 'R',
          code: `x5 <- c(3, 4, 5, 9)

x5[1]
x5[3]
x5[c(2, 4)]
x5[2:3]`,
          out: `[1] 3
[1] 5
[1] 4 9
[1] 4 5`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Indeks boleh berupa vektor. `x5[c(2, 4)]` mengambil elemen kedua dan keempat, dan hasilnya vektor baru berisi dua nilai. Ini yang membuat R terasa ringkas: tidak perlu menulis dua baris untuk mengambil dua posisi.',
        },
        {
          t: 'h2',
          text: 'Indeks yang dihitung dari nilai lain',
        },
        {
          t: 'p',
          text:
            'Karena indeks hanyalah angka, ia boleh berasal dari perhitungan. Materi kuliah memberi contoh yang tampak rumit tetapi sebenarnya sederhana:',
        },
        {
          t: 'code',
          label: 'R',
          code: `x5 <- c(3, 4, 5, 9)
x7 <- seq(0, 1, by = 0.25)

x5[2]
x7[x5[2]]`,
          out: `[1] 4
[1] 0.75`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Baca dari dalam ke luar. `x5[2]` bernilai 4. Jadi `x7[x5[2]]` sama dengan `x7[4]`, yaitu elemen keempat dari `x7`. Urutan membacanya penting: selesaikan dulu isi kurung siku, baru gunakan hasilnya sebagai nomor posisi.',
        },
        {
          t: 'h2',
          text: 'Indeks negatif berarti membuang',
        },
        {
          t: 'p',
          text:
            'Ini salah satu jebakan yang paling sering disalahpahami. Indeks negatif **bukan** berarti "menghitung dari belakang". Ia berarti "semua kecuali posisi ini".',
        },
        {
          t: 'code',
          label: 'R',
          code: `x5 <- c(3, 4, 5, 9)

x5[-2]
x5[-c(1, 4)]`,
          out: `[1] 3 5 9
[1] 4 5`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Untuk mengambil elemen terakhir, jangan pakai indeks negatif. Pakai posisi terakhir yang dihitung dari panjang vektor: `x5[length(x5)]`. Cara ini bekerja untuk vektor sepanjang apa pun, sedangkan `x5[-1]` akan selalu membuang elemen pertama, bukan mengambil yang terakhir.',
        },
        {
          t: 'h2',
          text: 'Indeks logika: memilih berdasarkan kondisi',
        },
        {
          t: 'p',
          text:
            'Kalau isi kurung siku adalah pernyataan benar-salah, R mengambil posisi yang bernilai `TRUE`. Panjang vektor logika akan didaur ulang mengikuti panjang vektor yang diindeks, sehingga biasanya kamu menulis kondisi yang panjangnya sama.',
        },
        {
          t: 'code',
          label: 'R',
          code: `x5 <- c(3, 4, 5, 9)

x5 > 4
x5[x5 > 4]
x5[x5 %% 2 == 1]`,
          out: `[1] FALSE FALSE  TRUE  TRUE
[1] 5 9
[1] 3 5 9`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Baris kedua adalah pola yang akan kamu pakai terus: buat kondisi, lalu jadikan kondisi itu indeks. Baris ketiga menyaring bilangan ganjil, karena sisa bagi 2 sama dengan 1.',
        },
        {
          t: 'h2',
          text: 'Dua perilaku di luar jangkauan',
        },
        {
          t: 'code',
          label: 'R',
          code: `x5 <- c(3, 4, 5, 9)

x5[0]
x5[10]
length(x5[0])`,
          out: `numeric(0)
[1] NA
[1] 0`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Indeks nol mengembalikan vektor **kosong**, bukan galat. Indeks di luar jangkauan mengembalikan `NA` (*not available*), juga bukan galat. Keduanya berbahaya justru karena tidak ada peringatan: vektor kosong membuat `for` tidak berjalan sama sekali, dan `NA` menyebar ke setiap perhitungan berikutnya tanpa suara.',
        },
        {
          t: 'callout',
          tone: 'warm',
          title: 'R tidak menjaga batas indeks untukmu',
          text:
            'Banyak bahasa lain menghentikan program dengan galat ketika indeks melewati batas. R tidak. Kalau hasil perhitunganmu tiba-tiba `NA` atau kosong, periksa dulu apakah ada indeks yang keluar jangkauan — terutama di dalam loop yang indeksnya dihitung dari panjang vektor lain.',
        },
      ],
      summary: [
        'Indeks R dimulai dari 1, dan kurung siku adalah operator pengambilan elemen.',
        'Indeks negatif membuang posisi, bukan menghitung dari belakang.',
        'Vektor logika sebagai indeks menyaring elemen; indeks 0 memberi vektor kosong dan indeks terlalu besar memberi `NA`.',
      ],
      mistakes: [
        'Menulis `x[0]` untuk elemen pertama, karena terbawa bahasa lain.',
        'Mengira `x[-1]` mengambil elemen terakhir.',
        'Mengira indeks di luar jangkauan menghasilkan galat, lalu bingung ketika hasilnya `NA`.',
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'panjang-vektor',
      title: 'Mengukur panjang dengan length() dan dengan loop',
      desc: 'Membuat myLength, dan belajar mengulang atas nilai alih-alih atas indeks.',
      duration: 13,
      level: 2,
      objectives: [
        'Memakai `length()` untuk menghitung cacah elemen.',
        'Menulis `myLength()` memakai `for` atas nilai.',
        'Membedakan `for (i in x)` dari `for (i in 1:length(x))`.',
        'Menjelaskan mengapa loop atas nilai lebih tepat untuk menghitung panjang.',
      ],
      prereq: ['Mengindeks vektor (Modul 2, Pelajaran 2).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Latihan pertama yang terlihat sepele justru mengajarkan satu ide besar: kamu bisa mengulang atas isi vektor tanpa pernah tahu panjangnya.',
        },
        {
          t: 'p',
          text:
            'Cara mengukur panjang vektor — banyaknya anggota — adalah `length(x)`. Contoh dari materi kuliah memakai `x9` yang sudah kita susun sebelumnya:',
        },
        {
          t: 'code',
          label: 'R',
          code: `x9 <- c(9, 5, 6, 1:4, rep(10, 5))
length(x9)`,
          out: `[1] 12`,
          outLabel: 'Keluaran',
        },
        {
          t: 'h2',
          text: 'Menulis ulang length() dengan loop',
        },
        {
          t: 'p',
          text:
            'Materi kuliah meminta kamu membuat `myLength()` yang menghasilkan nilai sama tanpa memakai `length()`. Idenya: siapkan penghitung nol, lalu tambah satu untuk setiap anggota vektor.',
        },
        {
          t: 'code',
          label: 'myLength.R',
          code: `myLength <- function(x) {
  n <- 0
  for (nilai in x) {
    n <- n + 1
  }
  return(n)
}

myLength(x9)`,
          out: `[1] 12`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Perhatikan bentuk `for (nilai in x)`. Variabel `nilai` berjalan pada **isi** vektor: 9, lalu 5, lalu 6, dan seterusnya. Isi vektor itu sendiri tidak pernah dipakai di dalam badan loop — yang dipakai hanya kenyataan bahwa loop berjalan sekali untuk setiap anggota. Itu sudah cukup untuk menghitung.',
        },
        {
          t: 'trace',
          title: 'myLength(c(4, 7, 2))',
          cols: ['Langkah', 'nilai', 'n sebelum', 'n sesudah'],
          rows: [
            ['awal', '—', '—', '0'],
            ['ke-1', '4', '0', '1'],
            ['ke-2', '7', '1', '2'],
            ['ke-3', '2', '2', '3'],
            ['selesai', '—', '—', '3'],
          ],
          note:
            'Nilai 4, 7, dan 2 tidak memengaruhi apa pun. Yang menentukan hasil hanya berapa kali loop berjalan.',
        },
        {
          t: 'h2',
          text: 'Dua cara mengulang, dua cara berpikir',
        },
        {
          t: 'p',
          text:
            'Bentuk lain yang sering dipakai adalah `for (i in 1:length(x))`. Keduanya sah, tetapi tidak setara. Bentuk dengan `1:length(x)` menuntut kamu mengetahui panjang vektor sebelum loop dimulai — dan itu justru hal yang sedang ingin kamu hitung. Kalau `x` kosong, `1:0` menghasilkan `c(1, 0)`, sehingga loop berjalan dua kali untuk vektor yang tidak punya anggota sama sekali.',
        },
        {
          t: 'table',
          head: ['Bentuk', 'Variabel berjalan pada', 'Aman untuk vektor kosong?'],
          rows: [
            ['`for (nilai in x)`', 'Isi vektor', 'Ya — loop tidak berjalan'],
            ['`for (i in 1:length(x))`', 'Nomor posisi', 'Tidak — `1:0` berisi dua angka'],
            ['`for (i in seq_along(x))`', 'Nomor posisi', 'Ya — `seq_along()` kosong'],
          ],
          caption: 'Ketiganya sama-sama benar untuk vektor berisi. Bedanya muncul di kasus tepi.',
        },
        {
          t: 'p',
          text:
            'Kesimpulannya bukan bahwa satu bentuk selalu lebih baik. Kalau kamu perlu **nomor posisi** — misalnya untuk membandingkan `x[i]` dengan `x[i+1]`, atau untuk mengisi matriks pada posisi tertentu — kamu harus memakai bentuk indeks. Kalau kamu hanya perlu menyusuri isi, bentuk nilai lebih jujur dan lebih aman.',
        },
        {
          t: 'callout',
          tone: 'note',
          title: 'Mengapa latihan ini ada',
          text:
            'Menulis `myLength` tidak berguna dalam pekerjaan nyata; `length()` sudah ada dan jauh lebih cepat. Latihan ini ada untuk membuktikan bahwa fungsi bawaan bukan sihir. Kebiasaan yang sama akan kamu pakai sepanjang mata kuliah: tiru fungsi bawaan dengan loop, lalu bandingkan hasilnya untuk memastikan logikamu benar.',
        },
      ],
      summary: [
        '`length(x)` menghitung cacah elemen; `myLength()` menirunya dengan penghitung.',
        '`for (nilai in x)` berjalan pada isi vektor tanpa perlu tahu panjangnya.',
        '`1:length(x)` gagal pada vektor kosong karena `1:0` berisi dua angka; `seq_along(x)` aman.',
      ],
      mistakes: [
        'Memulai penghitung dari 1, sehingga hasilnya kelebihan satu.',
        'Memakai `1:length(x)` lalu bingung ketika `x` kosong.',
        'Mengira variabel loop harus dipakai di dalam badan loop.',
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'operasi-vektor',
      title: 'Operasi vektor: elemen per elemen versus hasil kali titik',
      desc: 'Perbedaan yang menentukan seluruh Modul 4. a * b bukan hasil kali titik.',
      duration: 16,
      level: 3,
      objectives: [
        'Menjelaskan bahwa `+` dan `*` di R bekerja elemen per elemen.',
        'Mendefinisikan hasil kali titik sesuai notasi matematika.',
        'Membedakan `a * b` dari `sum(a * b)` dan `a %*% b`.',
        'Memprediksi perilaku pendaurulangan ketika panjang vektor berbeda.',
      ],
      prereq: ['Indeks dan panjang vektor (Modul 2, Pelajaran 2–3).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Ini pelajaran paling penting di Modul 2. Di sini satu bintang berbeda arti dari dua bintang, dan salah memilih akan membuat perkalian matriksmu salah tanpa satu pun pesan galat.',
        },
        {
          t: 'h2',
          text: 'Penjumlahan: aman, karena definisinya memang sama',
        },
        {
          t: 'p',
          text:
            'Di matematika, penjumlahan dua vektor didefinisikan dengan menjumlahkan elemen yang bersesuaian:',
        },
        {
          t: 'p',
          text:
            '(a₁, a₂, …, aₚ) + (b₁, b₂, …, bₚ) = (a₁+b₁, a₂+b₂, …, aₚ+bₚ)',
        },
        {
          t: 'p',
          text:
            'R melakukan hal yang persis sama dengan `+`. Tidak ada yang perlu diwaspadai di sini — untuk penjumlahan, notasi matematika dan perilaku R sejalan.',
        },
        {
          t: 'h2',
          text: 'Perkalian: di sinilah keduanya berpisah',
        },
        {
          t: 'p',
          text:
            '**Hasil kali titik** (*dot product*) dua vektor didefinisikan sebagai jumlah dari hasil kali pasangan elemen yang bersesuaian:',
        },
        {
          t: 'p',
          text: 'a · b = aᵀb = a₁b₁ + a₂b₂ + … + aₚbₚ',
        },
        {
          t: 'p',
          text:
            'Hasilnya **satu angka**, bukan vektor. Sementara itu, `a * b` di R melakukan perkalian elemen per elemen dan mengembalikan **vektor** sepanjang input. Keduanya berbeda, dan hanya salah satunya yang merupakan hasil kali titik.',
        },
        {
          t: 'code',
          label: 'R',
          code: `a <- c(1, 2, 3)
b <- c(4, 5, 6)

a * b
sum(a * b)
a %*% b`,
          out: `[1]  4 10 18
[1] 32
     [,1]
[1,]   32`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Baris pertama adalah perkalian elemen per elemen: 1×4, 2×5, 3×6. Baris kedua menjumlahkan hasil itu menjadi 32 — inilah hasil kali titik. Baris ketiga memakai operator `%*%`, yang melakukan hal yang sama tetapi mengembalikan **matriks 1×1**, bukan angka telanjang. Karena 1×4 + 2×5 + 3×6 = 4 + 10 + 18 = 32, ketiganya konsisten; yang berbeda hanya bentuk hasilnya.',
        },
        {
          t: 'table',
          head: ['Ekspresi', 'Arti', 'Bentuk hasil'],
          rows: [
            ['`a + b`', 'Jumlah elemen yang bersesuaian', 'Vektor sepanjang `a`'],
            ['`a * b`', 'Kali elemen yang bersesuaian', 'Vektor sepanjang `a`'],
            ['`sum(a * b)`', 'Hasil kali titik', 'Satu angka'],
            ['`a %*% b`', 'Hasil kali titik, versi matriks', 'Matriks 1×1'],
          ],
          caption: 'Tiga baris terakhir menghasilkan angka yang sama untuk vektor yang sama panjang. Pilih bentuk yang sesuai dengan tempat hasilnya akan dipakai.',
        },
        {
          t: 'callout',
          tone: 'danger',
          title: 'Kesalahan yang tidak memunculkan galat',
          text:
            'Menulis `a * b` padahal maksudmu hasil kali titik tidak akan menghasilkan pesan kesalahan. Ia menghasilkan vektor, dan vektor itu akan mengalir ke perhitungan berikutnya dengan tenang. Di Modul 4, kesalahan ini membuat perkalian matriks menghasilkan matriks dengan angka yang salah, tanpa R mengeluh sekali pun. Selalu tanyakan: hasilnya seharusnya satu angka atau vektor?',
        },
        {
          t: 'h2',
          text: 'Panjang berbeda: pendaurulangan',
        },
        {
          t: 'p',
          text:
            'Apa yang terjadi kalau panjang kedua vektor tidak sama? R tidak langsung menolak. Ia **mendaur ulang** (*recycle*) vektor yang lebih pendek sampai panjangnya cukup, dan hanya memberi peringatan kalau panjang yang lebih panjang bukan kelipatan yang lebih pendek.',
        },
        {
          t: 'code',
          label: 'R',
          code: `c(1, 2, 3, 4) + c(10, 20)
c(1, 2, 3) + c(10, 20)`,
          out: `[1] 11 22 13 24
[1] 11 22 13
Warning message:
In c(1, 2, 3) + c(10, 20) :
  longer object length is not a multiple of shorter object length`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Pada baris pertama, `c(10, 20)` didaur ulang menjadi `c(10, 20, 10, 20)`, sehingga hasilnya 11, 22, 13, 24. Pada baris kedua, `c(10, 20)` didaur ulang menjadi `c(10, 20, 10)` — tidak pas — sehingga muncul peringatan. Perhatikan bahwa hasilnya tetap keluar. Peringatan bukan galat: program berjalan terus membawa kemungkinan salah hitung yang senyap.',
        },
        {
          t: 'callout',
          tone: 'note',
          title: 'Untuk hasil kali titik, panjang wajib sama',
          text:
            'Definisi hasil kali titik menuntut kedua vektor sama panjang: tidak ada pasangan keempat untuk a₁b₁ + a₂b₂ + a₃b₃. Karena itu fungsi `myProd` yang akan kamu tulis di pelajaran berikutnya sebaiknya memeriksa panjang kedua vektor dan berhenti dengan pesan jelas kalau berbeda.',
        },
      ],
      summary: [
        '`+` dan `*` di R bekerja elemen per elemen dan mengembalikan vektor.',
        'Hasil kali titik menghasilkan satu angka: jumlah dari hasil kali pasangan elemen.',
        '`sum(a * b)` dan `a %*% b` sama-sama hasil kali titik; `%*%` mengembalikan matriks 1×1.',
      ],
      mistakes: [
        'Mengira `a * b` adalah hasil kali titik karena hasilnya terlihat mirip untuk vektor panjang 1.',
        'Menjumlahkan vektor berbeda panjang tanpa sadar telah terjadi pendaurulangan.',
        'Mengira peringatan pendaurulangan menghentikan perhitungan.',
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'algoritma-vektor',
      title: 'Menulis algoritma untuk vektor',
      desc: 'Jumlah, hasil kali titik, maksimum, minimum, dan pengurutan — dari nol.',
      duration: 18,
      level: 3,
      objectives: [
        'Menulis `mySum()` dan `myProd()` dengan pola akumulator.',
        'Menjelaskan mengapa nilai awal akumulator menentukan kebenaran hasil.',
        'Menulis `myMax()` dan `myMin()` yang benar untuk semua bilangan.',
        'Mengimplementasikan pengurutan sederhana dengan pertukaran elemen.',
      ],
      prereq: ['Operasi vektor (Modul 2, Pelajaran 4).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Empat dari lima latihan di sini memakai pola yang sama: satu wadah, satu loop, satu pembaruan. Kuasai polanya sekali, dan keempatnya selesai bersamaan.',
        },
        {
          t: 'h2',
          text: 'Pola akumulator',
        },
        {
          t: 'p',
          text:
            '**Akumulator** adalah variabel yang menampung hasil sementara dan diperbarui setiap kali loop berjalan. Ia selalu punya dua bagian: nilai awal sebelum loop, dan cara memperbaruinya di dalam loop. Nilai awal itu bukan pilihan bebas — ia harus menjadi nilai identitas untuk operasi yang dipakai. Untuk penjumlahan, identitasnya 0. Untuk perkalian, identitasnya 1.',
        },
        {
          t: 'code',
          label: 'mySum.R',
          code: `mySum <- function(x) {
  total <- 0
  for (nilai in x) {
    total <- total + nilai
  }
  return(total)
}

mySum(x9)`,
          out: `[1] 80`,
          outLabel: 'Keluaran',
        },
        {
          t: 'trace',
          title: 'mySum(c(4, 7, 2, 9))',
          cols: ['Langkah', 'nilai', 'total sebelum', 'total sesudah'],
          rows: [
            ['awal', '—', '—', '0'],
            ['ke-1', '4', '0', '4'],
            ['ke-2', '7', '4', '11'],
            ['ke-3', '2', '11', '13'],
            ['ke-4', '9', '13', '22'],
            ['selesai', '—', '—', '22'],
          ],
          note:
            'Nilai awal 0 membuat total pada langkah pertama menjadi 4, bukan 4 ditambah sesuatu yang tidak diketahui. Kalau nilai awalnya salah, semua langkah setelahnya ikut salah.',
        },
        {
          t: 'h2',
          text: 'Hasil kali titik',
        },
        {
          t: 'p',
          text:
            '`myProd()` adalah hasil kali titik, bukan perkalian elemen per elemen. Karena itu ia menerima **dua** vektor, memeriksa panjangnya, lalu mengakumulasikan `a[i] * b[i]`. Fungsi ini akan dipakai lagi di Modul 4 untuk membangun perkalian matriks.',
        },
        {
          t: 'code',
          label: 'myProd.R',
          code: `myProd <- function(a, b) {
  if (length(a) != length(b)) {
    stop("Panjang kedua vektor harus sama.")
  }
  hasil <- 0
  for (i in seq_along(a)) {
    hasil <- hasil + a[i] * b[i]
  }
  return(hasil)
}

myProd(c(3, 4, 5, 9), c(1, 2, 3, 4))`,
          out: `[1] 62`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Periksa hasilnya dengan tangan: 3×1 + 4×2 + 5×3 + 9×4 = 3 + 8 + 15 + 36 = 62. Angka ini akan muncul lagi di Modul 4 sebagai elemen sebuah matriks hasil perkalian.',
        },
        {
          t: 'h2',
          text: 'Maksimum dan minimum',
        },
        {
          t: 'p',
          text:
            'Di sini nilai awal akumulator tidak bisa sembarang. Untuk mencari nilai terbesar, wadah harus dimulai dari **elemen pertama** vektor, bukan dari 0. Kalau dimulai dari 0, vektor yang seluruh anggotanya negatif akan memberi hasil 0 — angka yang tidak pernah ada di dalam vektor itu.',
        },
        {
          t: 'code',
          label: 'myMax.R',
          code: `myMax <- function(x) {
  terbesar <- x[1]
  for (nilai in x) {
    if (nilai > terbesar) {
      terbesar <- nilai
    }
  }
  return(terbesar)
}

myMax(c(3, 9, 2))
myMax(c(-5, -2, -8))`,
          out: `[1] 9
[1] -2`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Fungsi yang sama dengan tanda ketidaksamaan dibalik menjadi `myMin()`. Perhatikan kasus `c(-5, -2, -8)`: kalau `terbesar` dimulai dari 0, hasilnya akan 0 dan kelihatan benar hanya karena kamu tidak memeriksa. Ujilah fungsimu dengan data negatif, bukan hanya data positif.',
        },
        {
          t: 'h2',
          text: 'Pengurutan: di sini akumulator tidak cukup',
        },
        {
          t: 'p',
          text:
            'Mengurutkan berbeda sifatnya. Kamu tidak sedang menghitung satu nilai, melainkan **memindahkan** nilai antarposisi. Karena itu yang dibutuhkan bukan akumulator, melainkan indeks — agar kamu bisa membandingkan dua posisi dan menukarnya.',
        },
        {
          t: 'p',
          text:
            'Algoritma yang paling mudah ditelusuri adalah *selection sort*: cari nilai terkecil di sisa vektor, tukar ke posisi paling depan, lalu ulangi untuk sisa berikutnya. Materi kuliah menyebut *bubble sort* sebagai alternatif; keduanya sama-sama benar sebagai latihan.',
        },
        {
          t: 'code',
          label: 'mySort.R',
          code: `mySort <- function(x) {
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

mySort(c(4, 1, 3, 2))`,
          out: `[1] 1 2 3 4`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Tiga baris pertukaran itu perlu variabel `sementara`. Tanpa variabel perantara, `x[i] <- x[k]` akan menimpa nilai lama `x[i]` sebelum sempat disalin, sehingga satu nilai hilang dan muncul dua nilai kembar. Ini kesalahan pemula yang paling sering pada soal pengurutan.',
        },
        {
          t: 'callout',
          tone: 'note',
          title: 'Kenapa (n - 1) dan (i + 1)',
          text:
            'Loop luar berhenti di `n - 1` karena setelah `n - 1` posisi terisi, posisi terakhir pasti sudah benar. Loop dalam mulai dari `i + 1` karena membandingkan sebuah posisi dengan dirinya sendiri tidak ada gunanya, dan bagian sebelum `i` sudah terurut. Detail batas seperti ini adalah tempat bug bersembunyi; telusuri `mySort(c(3, 1, 2))` dengan tangan untuk memastikan.',
        },
      ],
      summary: [
        'Pola akumulator: satu wadah dengan nilai identitas, diperbarui setiap iterasi.',
        'Nilai awal akumulator menentukan kebenaran: 0 untuk jumlah, 1 untuk hasil kali, `x[1]` untuk maksimum dan minimum.',
        'Pengurutan butuh indeks dan variabel sementara untuk menukar dua nilai.',
      ],
      mistakes: [
        'Memulai `myMax` dari 0 sehingga vektor negatif memberi hasil salah.',
        'Menukar dua nilai tanpa variabel sementara.',
        'Memakai `1:length(x)` ketika `x` mungkin kosong.',
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'faktor-prima',
      title: 'Faktor dan bilangan prima',
      desc: 'Dua fungsi yang saling bergantung, dan satu syarat yang mudah terlupa.',
      duration: 14,
      level: 4,
      objectives: [
        'Menulis `myFaktor()` yang mengumpulkan semua pembagi positif.',
        'Menurunkan `cekPrima()` dari definisi bilangan prima.',
        'Menjelaskan mengapa bilangan 1 perlu ditangani terpisah.',
        'Menilai kelayakan algoritma untuk bilangan besar.',
      ],
      prereq: ['Algoritma vektor (Modul 2, Pelajaran 5).'],
      blocks: [
        {
          t: 'lead',
          text:
            'Dua latihan terakhir Modul 2 saling bergantung: yang kedua tidak mungkin ditulis tanpa yang pertama. Itu bukan kebetulan — begitulah kode tumbuh.',
        },
        {
          t: 'h2',
          text: 'myFaktor: mengumpulkan pembagi',
        },
        {
          t: 'p',
          text:
            'Faktor dari sebuah bilangan adalah bilangan yang membaginya habis. Karena kita sudah punya `myBagi()` dari Modul 1, pertanyaannya menjadi sederhana: untuk setiap bilangan dari 1 sampai `a`, apakah sisanya nol?',
        },
        {
          t: 'p',
          text:
            'Perhatikan pola baru di sini. Sejauh ini akumulator kita selalu berupa satu angka. Kali ini akumulatornya berupa **vektor kosong** yang tumbuh: setiap kali menemukan faktor, nilai itu ditempelkan dengan `c()`.',
        },
        {
          t: 'code',
          label: 'myFaktor.R',
          code: `myFaktor <- function(a) {
  faktor <- c()
  for (i in 1:a) {
    if (myBagi(a, i)$SISA == 0) {
      faktor <- c(faktor, i)
    }
  }
  return(faktor)
}

myFaktor(12)
myFaktor(25)`,
          out: `[1]  1  2  3  4  6 12
[1]  1  5 25`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Untuk 12, faktornya 1, 2, 3, 4, 6, dan 12. Untuk 25, hanya 1, 5, dan 25. Perhatikan bahwa hasilnya selalu memuat 1 dan bilangan itu sendiri, karena setiap bilangan habis dibagi 1 dan habis dibagi dirinya sendiri. Pengamatan kecil inilah yang menjadi kunci fungsi berikutnya.',
        },
        {
          t: 'callout',
          tone: 'warm',
          title: 'Menempel berulang itu mahal',
          text:
            'Setiap `c(faktor, i)` membuat vektor baru dan menyalin seluruh isinya. Untuk `a` kecil tidak terasa, tetapi untuk `a` ratusan ribu, biayanya tumbuh kuadratik. R punya idiomatika yang lebih baik, yaitu menyiapkan vektor berukuran tetap lalu mengisinya per posisi. Untuk latihan ini, cara di atas sudah benar dan lebih mudah dibaca.',
        },
        {
          t: 'h2',
          text: 'cekPrima: satu baris, satu syarat',
        },
        {
          t: 'p',
          text:
            'Bilangan prima adalah bilangan bulat **lebih besar dari 1** yang punya **tepat dua** faktor positif: 1 dan dirinya sendiri. Karena `myFaktor()` sudah mengembalikan semua faktor, definisi itu bisa diterjemahkan hampir kata per kata.',
        },
        {
          t: 'code',
          label: 'cekPrima.R',
          code: `cekPrima <- function(a) {
  faktor <- myFaktor(a)
  if (a > 1 && length(faktor) == 2) {
    return(TRUE)
  }
  return(FALSE)
}

cekPrima(7)
cekPrima(9)
cekPrima(1)`,
          out: `[1] TRUE
[1] FALSE
[1] FALSE`,
          outLabel: 'Keluaran',
        },
        {
          t: 'p',
          text:
            'Untuk 7, `myFaktor(7)` berisi `c(1, 7)` — dua anggota, jadi prima. Untuk 9, berisi `c(1, 3, 9)` — tiga anggota, jadi bukan prima. Untuk 1, `myFaktor(1)` berisi `c(1)` — hanya satu anggota.',
        },
        {
          t: 'p',
          text:
            'Sekarang bagian yang menarik. Tanpa syarat `a > 1`, `cekPrima(1)` akan menjawab `FALSE` karena panjangnya 1, bukan 2. Jadi hasilnya **kebetulan** benar. Tetapi alasannya salah: kalau kamu mengubah syarat menjadi `length(faktor) <= 2`, angka 1 akan langsung berubah menjadi prima. Syarat `a > 1` bukan hiasan; ia adalah definisi bilangan prima yang harus berdiri sendiri.',
        },
        {
          t: 'callout',
          tone: 'note',
          title: 'Soal efisiensi',
          text:
            '`myFaktor(a)` memeriksa setiap bilangan sampai `a`, jadi untuk `a` sejuta diperlukan sejuta iterasi. Secara matematis cukup sampai `sqrt(a)`, karena setiap faktor yang lebih besar dari akar selalu berpasangan dengan faktor yang lebih kecil. Untuk latihan di mata kuliah ini, batas `1:a` adalah pilihan yang benar karena mudah ditelusuri; efisiensi adalah diskusi terpisah.',
        },
      ],
      summary: [
        '`myFaktor()` mengumpulkan pembagi dengan menguji sisa bagi untuk setiap bilangan 1 sampai `a`.',
        '`cekPrima()` dibangun di atas `myFaktor()`: prima berarti `a > 1` dan tepat dua faktor.',
        'Syarat `a > 1` adalah bagian dari definisi, bukan tambahan opsional.',
      ],
      mistakes: [
        'Lupa menempelkan faktor pertama karena memulai akumulator dari 0, bukan dari vektor kosong.',
        'Menghitung 1 sebagai prima karena panjang faktornya satu.',
        'Mengira hasil yang kebetulan benar berarti alasannya juga benar.',
      ],
    },
  ],
};
