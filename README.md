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
    │   ├── SettingsContext.tsx      # darkMode, notifikasi
    │   ├── StudentContext.tsx       # Profil mahasiswa
    │   ├── CourseContext.tsx        # CRUD mata kuliah + seed awal
    │   └── GradeContext.tsx         # Nilai per mata kuliah + seed awal
    ├── hooks/
    │   ├── useSettings.ts
    │   ├── useStudent.ts
    │   ├── useCourses.ts            # useCourses, useCourseStats, useFilteredAndSortedCourses
    │   └── useGrades.ts             # useGrades, useIPK
    ├── services/
    │   └── notificationService.ts   # Notifikasi harian via expo-notifications
    ├── navigation/
    │   ├── types.ts                 # RootStackParamList, BottomTabParamList
    │   ├── AppNavigator.tsx         # Root stack (Splash → Main)
    │   └── BottomTabNavigator.tsx   # Tab bar modern (Home, Matkul, Profil, Pengaturan)
    ├── components/
    │   ├── CourseCard.tsx           # Card MK dengan swipe-delete + badge nilai + entrance anim
    │   ├── AddCourseModal.tsx       # Bottom sheet tambah MK
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
└── SettingsProvider
    └── StudentProvider
        └── CourseProvider
            └── GradeProvider
                └── PaperProvider (tema MD3 light/dark)
                    └── NavigationContainer
                        └── AppNavigator (Stack)
                            ├── SplashScreen
                            └── BottomTabNavigator
                                ├── HomeScreen
                                ├── CoursesScreen → CourseDetail → EditCourse
                                ├── ProfileScreen
                                └── SettingsScreen → AcademicInfo
```

### Strategi Penyimpanan

```
Read:  MMKV cache (sync, <1ms) → AsyncStorage (async, ~5ms)
Write: setState → MMKV set → AsyncStorage set (keduanya selalu diperbarui)
Seed:  Otomatis saat AsyncStorage kosong pada first launch
```

---

## Kompatibilitas

| Platform | Status |
|---|---|
| iOS (iPhone 14 Pro Max) | ✅ Termasuk Dynamic Island safe area |
| iOS (iPhone lain) | ✅ |
| Android | ✅ |
| Expo Go | ✅ (MMKV fallback ke in-memory) |
| Dark Mode | ✅ |

---

## Developer

**Bintang Hendriska Valen**  
Teknik Informatika — Universitas Islam Riau (UIR)  
NIM: 233510676
