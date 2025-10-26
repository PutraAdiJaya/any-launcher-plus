# Release Notes - Launcher Plus v1.2.0

## 🚀 Fitur Baru

### 🖥️ Terminal Internal Integration

**FITUR UTAMA**: Perintah development seperti `npm run compile` sekarang berjalan langsung di terminal internal VS Code, bukan di jendela terpisah!

Ketika Anda menjalankan shortcut development:

- Terminal baru otomatis dibuat di dalam VS Code
- Perintah dijalankan langsung di terminal tersebut
- Tidak ada jendela CMD/PowerShell eksternal yang muncul
- Semua output terlihat di terminal VS Code

```json
{
  "id": "npm-compile",
  "label": "🔧 npm run compile",
  "program": "cmd",
  "args": ["/c", "npm", "run", "compile"]
}
```

Saat dijalankan, akan membuka terminal baru bernama `Launcher: 🔧 npm run compile` dan menjalankan perintah di dalamnya.

### 🔄 Deteksi Otomatis

Launcher Plus secara otomatis mendeteksi perintah yang harus berjalan di terminal internal:

- **Development Commands**: npm, yarn, pnpm, node, python, go, cargo, dotnet, mvn, gradle, make
- **CLI Commands**: git, docker, kubectl, ssh, scp, curl, wget
- **Build Arguments**: run, start, build, test, dev, serve, compile, watch, clean, install

### 💬 Toast/Flash Info (Status Bar Messages)

Feedback visual yang tidak mengganggu saat menjalankan shortcut:

- **🖥️ "Menjalankan [nama] di terminal..."** - Saat perintah development dijalankan di terminal (3 detik)
- **✅ "[nama] - Terminal aktif"** - Konfirmasi terminal sudah aktif (2 detik)
- **✅ "[nama] berhasil dijalankan"** - Saat aplikasi GUI berhasil diluncurkan (2 detik)

Tidak ada notification popup yang mengganggu, hanya pesan singkat di status bar!

### 🛡️ Error Handling di Terminal

Terminal sekarang tetap terbuka saat terjadi error, sehingga Anda bisa membaca pesan error:

- **Windows CMD**: Menampilkan "[Error] Command failed. Press any key to close..." dan menunggu input
- **PowerShell**: Menampilkan pesan error merah dan menunggu input dengan Read-Host
- **Unix/Linux**: Menampilkan error dan menunggu Enter untuk close
- Tidak ada lagi terminal yang flash dan langsung close!

### 🔄 Terminal Mode

Terminal terintegrasi VS Code memungkinkan Anda menjalankan shortcut dan perintah deployment tanpa meninggalkan editor. Buka dengan perintah `Launcher Plus: Open CLI Terminal` dari Command Palette.

### 🚀 Deployment Tools

Alat deployment terintegrasi memudahkan build, publish, dan clean project Anda. Akses dengan perintah `launcher deploy` di terminal CLI atau melalui Command Palette.

### ⚡ PowerShell Support

Dukungan penuh untuk PowerShell dengan alias dan fungsi kustom. CLI Launcher Plus terintegrasi dengan baik dengan PowerShell di VS Code.

## 📋 Perintah Baru

| Perintah | Deskripsi |
|---------|------------|
| `launcher.openCLI` | Membuka terminal CLI terintegrasi |
| `launcher.runFromCLI` | Menjalankan shortcut dari CLI |
| `launcher.deploy` | Menjalankan deployment tool |

## 🔧 Peningkatan

- Integrasi yang lebih baik dengan VS Code terminal
- Alias perintah untuk PowerShell dan bash
- Antarmuka deployment yang lebih intuitif
- Dukungan untuk menjalankan perintah deployment langsung dari terminal

## 📚 Dokumentasi

Dokumentasi lengkap tentang penggunaan CLI tersedia di [CLI_USAGE.md](CLI_USAGE.md).

## 🔍 Contoh Penggunaan

### Menjalankan Shortcut dari CLI

```powershell
# Menjalankan shortcut dengan ID
launcher run open-chrome

# Menampilkan daftar shortcut untuk dipilih
launcher run

# Menampilkan bantuan
launcher help
```

### Menggunakan Deployment Tool

```powershell
# Membuka deployment tool
launcher deploy

# Kemudian pilih operasi dari menu:
# - Build & Package
# - Publish to VS Code Marketplace
# - Publish to OpenVSX
# - Clean Project
```

## 🔮 Fitur yang Akan Datang

- Dukungan untuk argumen tambahan saat menjalankan shortcut
- Integrasi dengan task runner VS Code
- Fitur pencarian dan filter yang lebih canggih
- Dukungan untuk profil deployment

## 🐞 Bug Fixes

- Perbaikan minor pada integrasi terminal
- Optimasi performa untuk eksekusi shortcut

## 📦 Instalasi

1. Update dari versi sebelumnya:
   - VS Code: Klik tombol update di panel Extensions
   - Manual: Download `.vsix` terbaru dan install melalui `Extensions: Install from VSIX...`

2. Instalasi baru:
   - Cari "Launcher Plus" di panel Extensions VS Code
   - Atau download dari [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=PutraAdiJaya.any-launcher-plus)

## 🙏 Terima Kasih

Terima kasih kepada semua pengguna yang telah memberikan masukan dan dukungan untuk pengembangan Launcher Plus. Kami terus berkomitmen untuk meningkatkan produktivitas Anda dengan fitur-fitur baru yang bermanfaat.
