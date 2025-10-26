# 🔧 Troubleshooting - Launcher Plus

## ❓ Masalah Umum

### 1. Padding/Indentation Sub-items Tidak Terlihat

**Masalah:** Items di bawah group tidak memiliki indentation yang jelas.

**Solusi:** 
- ✅ Sudah diperbaiki dengan menambahkan spacing di label (`  ${label}`)
- Reload VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"

**Catatan:** VS Code tree view memang tidak menampilkan indentation visual seperti file explorer. Spacing di label adalah cara terbaik untuk memberikan visual hierarchy.

---

### 2. Error `echo.` Tidak Dikenali di PowerShell

**Error:**
```
echo.: The term 'echo.' is not recognized as a name of a cmdlet, function, script file, or executable program.
```

**Penyebab:** 
- `echo.` adalah syntax CMD, tidak work di PowerShell
- VS Code default terminal di Windows adalah PowerShell

**Solusi:**
- ✅ Sudah diperbaiki - extension otomatis deteksi shell type
- Gunakan `program: ""` untuk development commands
- Extension akan handle error secara otomatis

**Contoh BENAR:**
```json
{
  "id": "vsce-package",
  "label": "📦 vsce package",
  "program": "",
  "args": ["vsce", "package"],
  "cwd": "${workspaceFolder}"
}
```

**Contoh SALAH (jangan gunakan):**
```json
{
  "id": "vsce-package-bad",
  "label": "vsce package",
  "program": "cmd.exe",
  "args": ["/c", "vsce", "package", "||", "echo.", "&&", "pause"]
}
```

---

### 3. Error Icon Tidak Ditemukan Saat Package

**Error:**
```
ERROR  The specified icon 'extension/icon-256x256.png' wasn't found in the extension.
```

**Penyebab:** 
- Error ini dari project LAIN yang sedang di-package (bukan dari Launcher Plus)
- Icon path di `package.json` tidak valid

**Solusi:**
1. Periksa `package.json` di project yang error
2. Cari field `icon`:
   ```json
   {
     "icon": "extension/icon-256x256.png"
   }
   ```
3. Pastikan file icon ada di path tersebut
4. Atau ubah ke path yang benar, contoh:
   ```json
   {
     "icon": "media/icon.png"
   }
   ```

---

### 4. Shortcut Tidak Muncul di Tree View

**Masalah:** Shortcut yang sudah ditambahkan tidak muncul.

**Solusi:**
1. Periksa file `.vscode/launcher-putra.json` valid JSON
2. Klik tombol **Refresh** (🔄) di Launcher Plus tree view
3. Atau reload window: `Ctrl+Shift+P` → "Developer: Reload Window"
4. Periksa `platform` field - pastikan sesuai dengan OS Anda:
   ```json
   {
     "platform": "win"  // untuk Windows
   }
   ```

---

### 5. Terminal Tidak Terbuka Saat Run Shortcut

**Masalah:** Klik play button tapi terminal tidak muncul.

**Solusi:**
1. Periksa apakah command valid:
   ```json
   {
     "program": "",
     "args": ["npm", "run", "dev"]  // pastikan npm terinstall
   }
   ```
2. Test command di terminal manual dulu
3. Periksa `cwd` (working directory) valid:
   ```json
   {
     "cwd": "${workspaceFolder}"  // pastikan ada workspace folder
   }
   ```

---

### 6. Command Gagal dengan Error

**Error di terminal:**
```
[Error] Command failed.
```

**Solusi:**
1. **Command tidak ditemukan:**
   - Pastikan program terinstall (npm, go, dotnet, dll)
   - Test di terminal: `npm --version`

2. **Working directory salah:**
   - Periksa `cwd` di shortcut
   - Pastikan path valid

3. **Permission denied:**
   - Jalankan VS Code as Administrator (untuk Windows)
   - Atau ubah permission file/folder

---

### 7. Tombol Play Tidak Muncul

**Masalah:** Tidak ada tombol play (▶️) di shortcut item.

**Solusi:**
1. Pastikan extension sudah di-reload
2. Periksa `contextValue` di code (sudah otomatis)
3. Reload window: `Ctrl+Shift+P` → "Developer: Reload Window"

---

### 8. Favorites Tidak Tersimpan

**Masalah:** Pin shortcut tapi hilang setelah reload.

**Solusi:**
- Extension otomatis save ke `globalState`
- Jika masih hilang, coba:
  1. Unpin semua shortcuts
  2. Reload window
  3. Pin lagi

---

## 🐛 Melaporkan Bug

Jika masalah masih terjadi:

1. Buka **Output** panel: `View` → `Output`
2. Pilih **Launcher Debug** dari dropdown
3. Copy log error
4. Buat issue di: https://github.com/PutraAdiJaya/any-launcher-plus/issues

Include informasi:
- OS & version (Windows 10/11, macOS, Linux)
- VS Code version
- Extension version
- Shortcut configuration yang error
- Screenshot jika perlu

---

## 💡 Tips

1. **Gunakan `program: ""`** untuk semua development commands
2. **Test command di terminal** sebelum buat shortcut
3. **Gunakan absolute path** untuk GUI apps:
   ```json
   {
     "program": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
   }
   ```
4. **Gunakan variables** untuk flexibility:
   - `${workspaceFolder}` - workspace root
   - `${file}` - current file
   - `${selectedText}` - selected text
5. **Reload window** setelah edit shortcuts

---

## 📚 Dokumentasi Lainnya

- [TERMINAL_INTEGRATION.md](TERMINAL_INTEGRATION.md) - Terminal integration guide
- [SHORTCUT_EXAMPLES.md](SHORTCUT_EXAMPLES.md) - Contoh shortcuts lengkap
- [README.md](README.md) - Dokumentasi utama
