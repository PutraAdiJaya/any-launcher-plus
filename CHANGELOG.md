# Changelog

## [1.4.0] - 2024-01-15

### 🔥 Major Features

#### Built-in Default Shortcuts
- **60+ pre-configured shortcuts** built directly into the extension
- Zero configuration needed for common development tasks
- Includes: Terminal, NPM, Git, Docker, Python, Go, Rust, Java, .NET, VS Code Extension Development, and more
- Smart merging with user shortcuts (no duplicates)
- User shortcuts take priority over defaults

#### My Shortcuts Group
- **New "My Shortcuts" group** for custom user shortcuts
- Automatically detects shortcuts not in defaults
- Positioned below Favorites with strong pink color
- Sparkle icon (✨) for easy identification
- Makes custom shortcuts stand out visually

#### Cleaner Configuration
- JSON config files now only need YOUR custom shortcuts
- Default shortcuts are maintained in extension code
- Automatic updates to defaults with extension updates
- Faster loading with less file I/O

#### Override System
- Override any default shortcut by using the same ID
- Custom shortcuts automatically replace defaults
- Duplicate ID detection and warnings

### 📚 Documentation
- Added **CUSTOM_SHORTCUTS_GUIDE.md** - Complete guide for custom shortcuts
- Added **MIGRATION_GUIDE.md** - Step-by-step migration from v1.3.0
- Added **examples/custom-shortcuts-template.json** - Template with 10+ examples
- Updated README with new features section

### 🛠️ Technical Improvements
- Added `DEFAULT_SHORTCUTS` constant with 50+ shortcuts
- Modified `getConfigShortcuts()` for smart merging
- Improved duplicate detection algorithm
- Better logging for shortcut loading
- Performance optimizations

### 🐛 Bug Fixes
- Fixed duplicate shortcut warnings
- Improved shortcut loading performance
- Better error handling for missing programs

### 🔄 Migration
- Backward compatible - existing configs still work
- Optional cleanup to remove default shortcuts from JSON
- Automated migration script available

---

## [1.3.0] - 2025-10-27

### 🎉 Major Features

#### Smart Categorization System
- Auto-categorization of shortcuts into 10 intelligent categories
- Smart detection based on ID, label, and program path
- Categories: Deployment, Development, Git, Docker, Shells, Editors, Browsers, System Tools, Other
- No manual grouping required

#### Enhanced Favorites
- Pin/Unpin shortcuts with one click
- Persistent favorites across sessions
- Auto-expanded Favorites group
- Play button on all favorite items

#### Visual Improvements
- Unique colors for each category (10 distinct colors)
- All groups collapsed by default (except Favorites)
- Professional icons for each category
- Clean UI without emoji in group titles
- Consistent styling across all groups

#### Terminal Integration Enhancements
- Auto-detect development commands (npm, yarn, go, dotnet, etc.)
- PowerShell compatible (fixed `echo.` errors)
- Run commands in internal terminal
- Better error handling
- Terminal stays open after execution

#### Auto-Discovery Improvements
- Re-enabled shells auto-discovery (CMD, PowerShell, WSL, Git Bash)
- Build tools detection from package.json
- VS Code extension development shortcuts
- Smart caching for performance

### 🐛 Bug Fixes
- Fixed duplicate icons (emoji + icon field)
- Fixed inconsistent padding between groups
- Fixed tree line characters appearing incorrectly
- Fixed PowerShell compatibility issues
- Fixed command execution with empty program field
- Improved auto-discovery cache
- Better shortcut deduplication

### 🔧 Breaking Changes
- Removed "Configuration Shortcuts" group (replaced with smart categories)
- Removed emoji from group titles
- All groups collapsed by default (except Favorites)

### 📚 Documentation
- Added ICON_GUIDE.md
- Added SHORTCUT_EXAMPLES.md
- Added TERMINAL_INTEGRATION.md
- Added TROUBLESHOOTING.md

## [1.2.0] - 2025-10-26

### Ditambahkan
- Fitur CLI untuk menjalankan shortcut langsung dari terminal
- Integrasi dengan PowerShell terminal di VS Code
- Terminal terintegrasi untuk perintah development (npm, yarn, dll)
- Deteksi otomatis perintah yang harus berjalan di terminal
- Perintah `launcher.openCLI` untuk membuka terminal CLI terintegrasi
- Perintah `launcher.runFromCLI` untuk menjalankan shortcut dari CLI
- Perintah `launcher.deploy` untuk menjalankan deployment tool
- Dukungan untuk menjalankan perintah deployment langsung dari terminal
- Alias `launcher` untuk PowerShell dan bash
- Toast/flash info di status bar tanpa notification popup yang mengganggu
- Feedback visual saat menjalankan shortcut (3 jenis pesan berbeda)

### Diubah
- Peningkatan versi dari 1.1.1 ke 1.2.0
- Deskripsi ekstensi diperbarui untuk mencerminkan fitur baru
- Kata kunci diperbarui untuk mencakup CLI, terminal, dan deployment

### Diperbaiki
- Perbaikan minor pada integrasi terminal
- Optimasi performa untuk eksekusi shortcut

## [1.1.1] - 2025-09-15

### Diperbaiki
- Perbaikan bug pada auto-discovery di Windows
- Perbaikan masalah dengan path program yang mengandung spasi
- Peningkatan stabilitas untuk Electron apps

## [1.1.0] - 2025-08-20

### Ditambahkan
- Play Button Interface - Tombol play inline untuk UX yang lebih baik
- Smart Color Grouping - 17 kategori dengan warna unik
- Extension Development - Shortcuts otomatis untuk proyek ekstensi VS Code
- Reduced Notifications - Eksekusi silent dengan pesan error yang esensial
- Improved Detection - Pattern matching yang lebih baik untuk kategorisasi

### Diubah
- Peningkatan UI untuk tree view
- Optimasi performa untuk auto-discovery

## [1.0.0] - 2025-07-01

### Ditambahkan
- Global Shortcuts - Definisikan shortcut sekali, gunakan di semua workspace
- Auto-Initialization - Shortcut default dibuat otomatis saat pertama kali install
- Auto-Recovery - File shortcut yang terhapus akan dipulihkan otomatis
- Double-Click Prevention - Cooldown 300ms untuk mencegah eksekusi ganda
- Loading Indicators - Feedback visual real-time dengan pesan status bar
- Smart Validation - Verifikasi otomatis path program dengan laporan detail
- Auto-Fix Engine - Deteksi dan perbaikan cerdas path program yang tidak valid
- Duplicate Prevention - Deduplikasi ID untuk memastikan daftar shortcut yang bersih
- SSH Shortcuts - Template SSH/SCP bawaan untuk localhost dan koneksi remote
- Build Commands - Shortcut terkonfigurasi untuk npm, go, cargo, docker, dll

### Diubah
- Peningkatan mayor dari versi beta
- Arsitektur kode yang lebih modular
- Performa yang lebih baik untuk eksekusi shortcut

### Diperbaiki
- Berbagai bug pada versi beta
- Masalah kompatibilitas lintas platform