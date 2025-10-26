# Penggunaan CLI Launcher Plus

Launcher Plus v1.2.0 memperkenalkan antarmuka baris perintah (CLI) yang terintegrasi dengan terminal VS Code, memungkinkan Anda menjalankan shortcut dan alat deployment langsung dari terminal tanpa perlu membuka jendela terpisah.

## Fitur Utama

- **Terminal Terintegrasi**: Perintah development seperti `npm run compile` kini berjalan di terminal internal VS Code
- **Instance Terminal Baru**: Setiap shortcut membuka instance terminal baru di dalam VS Code
- **Deteksi Otomatis**: Secara otomatis mendeteksi perintah development dan menjalankannya di terminal

## Cara Menggunakan CLI

### Membuka Terminal CLI Terintegrasi

1. Tekan `Ctrl+Shift+P` untuk membuka Command Palette
2. Ketik `Launcher Plus: Open CLI Terminal`
3. Terminal baru akan terbuka dengan CLI Launcher Plus yang sudah diinisialisasi

### Perintah CLI yang Tersedia

Setelah terminal CLI terbuka, Anda dapat menggunakan perintah berikut:

```
launcher run [id]    - Menjalankan shortcut (atau menampilkan daftar jika ID tidak disediakan)
launcher list        - Menampilkan semua shortcut yang tersedia
launcher deploy      - Menjalankan deployment tool
launcher help        - Menampilkan bantuan
```

### Contoh Penggunaan

#### Menjalankan Shortcut dengan ID

```powershell
launcher run open-chrome
```

#### Menampilkan Daftar Shortcut untuk Dipilih

```powershell
launcher run
```

#### Menjalankan Deployment Tool

```powershell
launcher deploy
```

## Integrasi dengan PowerShell

CLI Launcher Plus terintegrasi dengan baik dengan PowerShell di VS Code. Saat Anda membuka terminal CLI, fungsi `launcher` akan otomatis didefinisikan untuk memudahkan akses ke semua fitur.

### Fitur PowerShell Khusus

- Alias fungsi otomatis
- Dukungan untuk parameter
- Integrasi dengan VS Code Command API

### Contoh Skrip PowerShell

```powershell
# Menjalankan serangkaian shortcut secara berurutan
launcher run build-project
launcher run run-tests
launcher run deploy-staging
```

## Menggunakan CLI untuk Deployment

Launcher Plus v1.2.0 menyediakan alat deployment terintegrasi yang dapat diakses melalui CLI:

1. Jalankan `launcher deploy` di terminal
2. Pilih operasi deployment dari menu:
   - 📦 Build & Package
   - 🚀 Publish to VS Code Marketplace
   - 🌐 Publish to OpenVSX
   - 🧹 Clean Project

## Perintah Development di Terminal Internal

Launcher Plus v1.2.0 secara otomatis mendeteksi dan menjalankan perintah development di terminal internal VS Code:

```bash
# Perintah ini akan berjalan di terminal internal VS Code
launcher run npm-compile    # npm run compile
launcher run yarn-build     # yarn build
launcher run go-run         # go run main.go
launcher run cargo-build    # cargo build
```

### Jenis Perintah yang Berjalan di Terminal Internal

- **Development**: npm, yarn, pnpm, node, python, go, cargo, dotnet, mvn, gradle, make
- **CLI**: git, docker, kubectl, ssh, scp, curl, wget, az, aws, gcloud
- **Shell**: cmd, powershell, bash, sh, zsh
- **Argumen Development**: run, start, build, test, dev, serve, compile, watch, clean, install

### Menggunakan CLI dari Terminal Eksternal

Anda juga dapat menggunakan CLI Launcher Plus dari terminal eksternal (di luar VS Code) dengan menginstal ekstensi VS Code CLI:

```bash
# Menjalankan shortcut dari terminal eksternal
code --command launcher.runFromCLI open-chrome

# Membuka CLI terintegrasi
code --command launcher.openCLI
```

## Tips dan Trik

- **Tab Completion**: Di PowerShell, gunakan Tab untuk melengkapi perintah dan ID shortcut
- **Skrip Otomatisasi**: Buat skrip PowerShell yang menjalankan serangkaian shortcut untuk workflow yang kompleks
- **Alias Kustom**: Buat alias untuk shortcut yang sering digunakan

```powershell
# Membuat alias untuk shortcut yang sering digunakan
function chrome { launcher run open-chrome }
function deploy-prod { launcher run deploy-production }
```

## Pemecahan Masalah

Jika Anda mengalami masalah dengan CLI:

1. Pastikan ekstensi Launcher Plus diaktifkan
2. Coba restart VS Code
3. Buka terminal baru dengan `Launcher Plus: Open CLI Terminal`
4. Periksa output konsol untuk pesan error

## Fitur yang Akan Datang

- Dukungan untuk argumen tambahan saat menjalankan shortcut
- Integrasi dengan task runner VS Code
- Fitur pencarian dan filter yang lebih canggih
- Dukungan untuk profil deployment
