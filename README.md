# Panduan Akademik

Aplikasi mobile untuk mahasiswa Teknik Informatika Universitas Islam Riau (UIR) dalam mengelola mata kuliah, memantau IPK, dan mengakses informasi akademik kampus.

Dibangun dengan **React Native (Expo SDK 54)** dan **TypeScript**.

---

## Fitur Utama

### Mata Kuliah
- Tambah, edit, dan hapus mata kuliah (CRUD penuh)
- Field: nama, kode, SKS, dosen, hari, jam, ruangan, catatan
- Pemilihan hari kuliah dengan chip interaktif (Senin–Sabtu)
- Swipe kiri untuk hapus cepat dengan konfirmasi
- Pencarian real-time berdasarkan nama, kode, atau dosen
- Filter berdasarkan jumlah SKS (2 / 3 / 4 SKS)
- Sortir: Terbaru, Terlama, Nama A–Z, Nama Z–A, SKS Terbanyak, SKS Tersedikit

### Nilai & IPK
- Input nilai per mata kuliah (A, A-, B+, B, B-, C+, C, C-, D, E, F)
- Warna nilai dinamis — hijau gelap (A) hingga merah gelap (F)
- Kalkulasi IPK otomatis: `Σ(SKS × Poin Nilai) / Σ(SKS)` hanya dari MK yang sudah dinilai
- Tampil di header Home Screen (stat strip)

### Profil Mahasiswa
- Data: Nama, NIM, Semester, Program Studi
- Edit profil langsung dari aplikasi
- Foto profil

### Pengaturan
- Toggle Mode Gelap / Terang
- Toggle Notifikasi Harian (pengingat akademik pukul 08.00 via `expo-notifications`)
- Hapus semua data aplikasi
- Info versi & developer

### Informasi Kampus
- Kontak kampus: WhatsApp, Email, Telepon
- Navigasi ke lokasi kampus (Google Maps)
- Website kampus UIR
- Info akademik umum

### Intent & Sharing
- Bagikan info mata kuliah via Share API native
- Buka WhatsApp langsung dengan pesan pre-fill
- Buka email client dengan subject & body otomatis
- Buka Google Maps ke lokasi kampus UIR

### Networking & Sinkronisasi
- Tombol **Sync from Server** (ikon cloud di pojok kanan atas halaman Mata Kuliah) — mengambil data dari API publik dan **merge** ke data lokal tanpa menimpa hasil edit
- **Pull-to-refresh** pada daftar Mata Kuliah — re-read storage lokal + sync server dalam satu gestur
- **POST** simulasi saat menambah mata kuliah baru — menampilkan ID yang dikembalikan server
- Axios instance terpusat dengan timeout 10s, retry otomatis (2x, delay 1s), dan error message yang sudah dinormalisasi ke Bahasa Indonesia
- Indikator **Online/Offline** real-time (NetInfo) — saat offline, tombol sync nonaktif dan daftar tetap tampil dari cache lokal

### Background Process
- Pengecekan mata kuliah baru dari server secara periodik (±30 menit) lewat `expo-task-manager` + `expo-background-fetch`
- **Auto-sync saat app dibuka kembali** (foreground) lewat `AppState` — tanpa perlu menunggu interval background
- Notifikasi lokal otomatis saat: (a) ditemukan mata kuliah baru dari sync, (b) total SKS melebihi 24 (asumsi batas registrasi)
- Toggle "Sinkronisasi Latar Belakang" di halaman Pengaturan

---

## Stack Teknologi

| Kategori | Library / Tool |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Bahasa | TypeScript |
| Navigasi | React Navigation v7 (Bottom Tabs + Native Stack) |
| UI Components | React Native Paper v5 (Material Design 3) |
| Penyimpanan Utama | `@react-native-async-storage/async-storage` |
| Cache Cepat | `react-native-mmkv` v3 (in-memory fallback di Expo Go) |
| State Management | React Context + Custom Hooks |
| Gesture | `react-native-gesture-handler` v2 (Swipeable) |
| Safe Area | `react-native-safe-area-context` (Dynamic Island iPhone 14 Pro Max) |
| Notifikasi | `expo-notifications` (lazy-loaded) |
| Icons | `@expo/vector-icons` (MaterialCommunityIcons) |
| Animasi | React Native `Animated` API |
| HTTP Client | `axios` (instance terpusat + interceptor) |
| Status Jaringan | `@react-native-community/netinfo` |
| Background Task | `expo-task-manager` + `expo-background-fetch` (lazy-loaded) |
| API Simulasi | JSONPlaceholder (`/posts`, dipetakan ke model Mata Kuliah) |

---

## Struktur Folder

```
Mobile/
├── App.tsx                          # Entry point — provider tree
├── assets/
│   ├── icon.png
│   └── profil.jpg
└── src/
    ├── types/
    │   └── index.ts                 # Course, Student, GradeValue, AppSettings, dll
    ├── constants/
    │   ├── theme.ts                 # Warna, tema MD3, DEFAULT_STUDENT, URL kampus
    │   └── seedData.ts              # Data awal 6 mata kuliah + nilai semester 6
    ├── storage/
    │   ├── storageKeys.ts           # Konstanta key AsyncStorage & MMKV
    │   ├── asyncStorage.ts          # Wrapper AsyncStorage (get/set/clear)
    │   └── mmkvStorage.ts           # Wrapper MMKV dengan fallback Map
    ├── contexts/
    │   ├── SettingsContext.tsx      # darkMode, notifikasi, backgroundSync
    │   ├── StudentContext.tsx       # Profil mahasiswa
    │   ├── CourseContext.tsx        # CRUD + seed awal + syncFromServer/postCourseToServer
    │   ├── GradeContext.tsx         # Nilai per mata kuliah + seed awal
    │   └── NetworkContext.tsx       # Status online/offline (NetInfo)
    ├── hooks/
    │   ├── useSettings.ts
    │   ├── useStudent.ts
    │   ├── useCourses.ts            # useCourses, useCourseStats, useFilteredAndSortedCourses
    │   ├── useGrades.ts             # useGrades, useIPK
    │   ├── useNetwork.ts            # status online/offline
    │   ├── useBackgroundSync.ts     # register/unregister task sesuai toggle setting
    │   └── useForegroundSync.ts     # AppState listener — auto-sync saat app dibuka kembali
    ├── services/
    │   ├── notificationService.ts   # Notifikasi harian + notifyNewCourses + notifySksDeadline
    │   ├── api/
    │   │   ├── apiClient.ts         # Axios instance: baseURL, timeout, interceptor error
    │   │   ├── courseApi.ts         # fetchRemoteCourses, postNewCourseToServer + mapping
    │   │   └── retry.ts             # withRetry() — retry generik dengan delay
    │   └── sync/
    │       └── mergeCourses.ts      # Merge lokal+server, local edits tidak pernah ditimpa
    ├── tasks/
    │   └── backgroundSyncTask.ts    # TaskManager.defineTask + register/unregister BackgroundFetch
    ├── navigation/
    │   ├── types.ts                 # RootStackParamList, BottomTabParamList
    │   ├── AppNavigator.tsx         # Root stack (Splash → Main)
    │   └── BottomTabNavigator.tsx   # Tab bar modern (Home, Matkul, Profil, Pengaturan)
    ├── components/
    │   ├── CourseCard.tsx           # Card MK dengan swipe-delete + badge nilai + entrance anim
    │   ├── AddCourseModal.tsx       # Bottom sheet tambah MK
    │   ├── OfflineBanner.tsx        # Banner kecil — tampil hanya saat offline
    │   ├── EmptyState.tsx
    │   └── LoadingIndicator.tsx
    └── screens/
        ├── SplashScreen.tsx         # Animasi pembuka (ring expand, logo bounce, loading dots)
        ├── HomeScreen.tsx           # Dashboard — stat strip, quick menu, pengumuman
        ├── CoursesScreen.tsx        # Daftar MK dengan search, filter, sort
        ├── CourseDetailScreen.tsx   # Detail MK + grade picker inline
        ├── EditCourseScreen.tsx     # Form edit MK
        ├── ProfileScreen.tsx        # Profil mahasiswa
        ├── SettingsScreen.tsx       # Pengaturan aplikasi
        └── AcademicInfoScreen.tsx   # Informasi kampus UIR
```

---

## Sinkronisasi dengan Server (Simulasi)

API akademik sungguhan tidak tersedia untuk keperluan latihan ini, jadi dipakai **JSONPlaceholder** (`GET/POST /posts`) sebagai pengganti. Karena `/posts` hanya punya field `title`/`body`/`userId`, field mata kuliah lain (`sks`, `dosen`, `hari`, `jam`, `ruangan`) **diturunkan secara deterministik** dari `id`/`userId` post tersebut (lihat `services/api/courseApi.ts`) — supaya data yang sama selalu menghasilkan mata kuliah yang sama, dan terlihat seperti data akademik asli (bukan teks lorem ipsum).

**Strategi merge** (`services/sync/mergeCourses.ts`):
1. Setiap mata kuliah yang berasal dari server diberi `serverId` (dari `post.id`).
2. Saat sync, mata kuliah server dengan `serverId` yang **belum pernah ada lokal** → ditambahkan sebagai mata kuliah baru.
3. Mata kuliah server dengan `serverId` yang **sudah ada lokal** → **tidak disentuh sama sekali**, walaupun field lain di server "berubah". Ini memastikan hasil edit manual pengguna tidak pernah tertimpa oleh sync.
4. Mata kuliah yang dibuat manual oleh pengguna (tanpa `serverId`) tidak pernah diproses oleh merge — sepenuhnya aman.

---

## Background Process & Notifikasi — Catatan Penting

> **`expo-task-manager` dan `expo-background-fetch` TIDAK berfungsi penuh di Expo Go** (sejak SDK 51, Expo Go tidak lagi menyertakan native module untuk background task). Begitu juga eksekusi background fetch sungguhan oleh OS hanya bisa diuji di **development build**.

Yang sudah ditangani dengan aman:
- Semua pemanggilan `expo-task-manager`/`expo-background-fetch` dibungkus `try/catch` + lazy `require()` (pola yang sama dengan `notificationService` dan `mmkvStorage`) — kalau modul native tidak ada, aplikasi **tidak crash**, hanya mencatat warning di console dan `registerBackgroundSync()` mengembalikan `false`.
- Di Expo Go, toggle "Sinkronisasi Latar Belakang" di Pengaturan tetap bisa di-klik tanpa error, tapi task tidak benar-benar terdaftar ke OS.
- **Auto-sync saat app dibuka kembali** (`useForegroundSync`, via `AppState`) **berfungsi normal di Expo Go** karena tidak memerlukan native background module — ini jalur paling mudah untuk mendemokan "sinkronisasi otomatis" tanpa development build.

### Cara testing penuh (development build)

```bash
# 1. Install expo-dev-client
npx expo install expo-dev-client

# 2. Generate project native + build
npx expo prebuild
npx expo run:android   # atau: npx expo run:ios

# 3. Jalankan dev server seperti biasa, dev client akan connect otomatis
npx expo start
```

Setelah berjalan di development build:
- Toggle "Sinkronisasi Latar Belakang" akan benar-benar memanggil `BackgroundFetch.registerTaskAsync`.
- iOS men-jadwalkan background fetch atas kebijakan OS sendiri (hanya *hint*, bukan garansi interval pasti) — untuk memaksa trigger saat development, gunakan Xcode: **Debug → Simulate Background Fetch** (perlu menjalankan dari Xcode, bukan dari Expo CLI).
- Android lebih konsisten menghormati `minimumInterval` (30 menit) dibanding iOS.
- Notifikasi "Mata Kuliah Baru" / "Batas SKS Terlampaui" akan muncul sebagai push notification lokal segera setelah task background berhasil menemukan data baru.

### Asumsi yang diambil
- **"Deadline SKS"** diinterpretasikan sebagai notifikasi peringatan ketika total SKS seluruh mata kuliah melebihi **24 SKS** (`MAX_SKS_THRESHOLD` di `constants/theme.ts`) — bukan tanggal jatuh tempo kalender, karena tidak ada sumber data deadline akademik nyata yang tersedia.
- Interval background diset 30 menit (`minimumInterval`), sesuai batas bawah yang diminta — namun ini hanya *hint*, OS (terutama iOS) bisa menjalankannya lebih jarang.

---

## Cara Menjalankan

### Prasyarat

- Node.js >= 18
- Expo CLI: `npm install -g expo-cli`
- Expo Go app di iPhone/Android (untuk development)

### Instalasi

```bash
# Clone / buka folder project
cd "Mobile"

# Install dependensi
npm install

# Jalankan dev server
npx expo start
```

Scan QR code dengan **Expo Go** di iPhone untuk langsung melihat hasilnya.

### Build Native (opsional)

```bash
# Generate native project
npx expo prebuild

# iOS
npx expo run:ios

# Android
npx expo run:android
```

> **Catatan:** `react-native-mmkv` membutuhkan native build untuk performa penuh. Di Expo Go, otomatis menggunakan in-memory Map sebagai fallback.

---

## Data Awal (Seed)

Saat pertama kali dijalankan, aplikasi otomatis mengisi 6 mata kuliah Semester 6 beserta nilai:

| Kode | Mata Kuliah | SKS | Nilai |
|---|---|---|---|
| STI2546142 | Pemrograman Mobile | 3 | C |
| STI2545250 | Pemrosesan Bahasa Alami | 3 | B |
| STI2545251 | Implementasi dan Pengujian PL | 3 | C |
| STI2546143 | Switching Routing dan Jar. Nirkabel | 3 | B |
| STI2545252 | Big Data | 3 | F |
| STI2546141 | Pembelajaran Mesin | 3 | D |

IPK awal yang terhitung: **1.83** (18 SKS total).

---

## Arsitektur

```
GestureHandlerRootView
└── NetworkProvider (status online/offline — NetInfo)
    └── SettingsProvider
        └── StudentProvider
            └── CourseProvider (+ syncFromServer, postCourseToServer)
                └── GradeProvider
                    └── PaperProvider (tema MD3 light/dark)
                        └── NavigationContainer (tema nav terpisah — lihat catatan fonts)
                            └── AppNavigator (Stack)
                                ├── SplashScreen
                                └── BottomTabNavigator
                                    ├── HomeScreen
                                    ├── CoursesScreen → CourseDetail → EditCourse
                                    ├── ProfileScreen
                                    └── SettingsScreen → AcademicInfo

useBackgroundSync() & useForegroundSync() dipanggil di AppContent (App.tsx),
di dalam CourseProvider sehingga punya akses ke syncFromServer/refreshCourses.
```

> **Catatan teknis:** `CustomLightTheme`/`CustomDarkTheme` (untuk `PaperProvider`) memakai `fonts` ber-shape MD3 typescale, sedangkan `NavigationContainer` butuh shape `{regular,medium,bold,heavy}` yang berbeda — karena itu ada `AppNavigationLightTheme`/`AppNavigationDarkTheme` terpisah di `constants/theme.ts` yang berbagi palet warna yang sama tapi `fonts` yang sesuai untuk masing-masing library.

### Strategi Penyimpanan & Sinkronisasi

```
Read:   MMKV cache (sync, <1ms) → AsyncStorage (async, ~5ms)
Write:  setState → MMKV set → AsyncStorage set (keduanya selalu diperbarui)
Seed:   Otomatis saat AsyncStorage kosong pada first launch
Sync:   fetchRemoteCourses() → mergeCourses(local, remote) → persist hanya jika ada data baru
Cache:  Saat offline, semua read tetap dari MMKV/AsyncStorage — fetch ke server
        di-skip sejak awal (cek isOnline) atau gagal dengan pesan yang jelas
```

---

## Kompatibilitas

| Platform | Status |
|---|---|
| iOS (iPhone 14 Pro Max) | ✅ Termasuk Dynamic Island safe area |
| iOS (iPhone lain) | ✅ |
| Android | ✅ |
| Expo Go | ✅ MMKV fallback in-memory; ⚠️ background fetch/task tidak aktif (lihat catatan di atas) |
| Development Build | ✅ Semua fitur termasuk background fetch sungguhan |
| Mode Offline | ✅ Tampil dari cache lokal, indikator "Mode Offline" otomatis |
| Dark Mode | ✅ |

---

## Developer

**Bintang Hendriska Valen**  
Teknik Informatika — Universitas Islam Riau (UIR)  
NIM: 233510676
