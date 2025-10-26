# 🎨 Icon Guide - Launcher Plus

## ⚠️ Masalah Icon Duplicate

### Penyebab:
Jika Anda melihat **2 icon** untuk setiap shortcut, itu karena:
1. **Emoji di label** (contoh: `"label": "📦 npm install"`)
2. **Icon field** (contoh: `"icon": "package"`)

VS Code menampilkan **KEDUANYA**, sehingga terlihat duplicate!

### ❌ SALAH - Akan Menampilkan 2 Icon:
```json
{
  "id": "npm-install",
  "label": "📦 npm install",  // ← Emoji 📦
  "icon": "package"            // ← Icon package
}
```

**Hasil:** 📦 📦 npm install (duplicate!)

---

## ✅ Solusi

### Pilihan 1: Gunakan Icon Field (RECOMMENDED)

Hapus emoji dari label, gunakan icon field saja:

```json
{
  "id": "npm-install",
  "label": "npm install",      // ← Tanpa emoji
  "icon": "package"            // ← Hanya icon
}
```

**Keuntungan:**
- ✅ Konsisten dengan VS Code UI
- ✅ Icon berwarna sesuai group
- ✅ Lebih professional
- ✅ Tidak ada duplicate

### Pilihan 2: Gunakan Emoji Saja

Hapus icon field, gunakan emoji di label:

```json
{
  "id": "npm-install",
  "label": "📦 npm install"    // ← Hanya emoji
  // Tidak ada icon field
}
```

**Keuntungan:**
- ✅ Colorful dengan emoji
- ✅ Mudah dibaca
- ✅ Tidak perlu cari icon name

**Kekurangan:**
- ❌ Tidak konsisten dengan VS Code theme
- ❌ Emoji bisa berbeda di OS lain

---

## 📋 VS Code Icon Names

Berikut icon yang tersedia di VS Code:

### Development & Build
- `package` - Package/install
- `tools` - Build/compile
- `play` - Run/start
- `beaker` - Test
- `search` - Lint/search
- `eye` - Watch
- `rocket` - Deploy/publish
- `debug-start` - Debug
- `debug-stop` - Stop

### Files & Folders
- `folder-opened` - Folder
- `file` - File
- `files` - Multiple files
- `json` - JSON file
- `markdown` - Markdown file

### Git & Version Control
- `git-branch` - Git branch
- `git-commit` - Git commit
- `git-pull-request` - Pull request
- `source-control` - Source control
- `cloud-upload` - Upload/push
- `cloud-download` - Download/pull

### Terminal & Shell
- `terminal` - Terminal
- `terminal-powershell` - PowerShell
- `terminal-linux` - Linux/WSL
- `terminal-cmd` - Command Prompt

### Server & Network
- `server` - Server
- `server-process` - Running server
- `database` - Database
- `globe` - Web/network
- `browser` - Browser
- `preview` - Preview

### Misc
- `list-tree` - Tree/list
- `list-unordered` - Unordered list
- `symbol-method` - Method/function
- `symbol-event` - Event
- `key` - Key/password
- `lock` - Security
- `person` - User
- `plug` - Plugin/connection

**Lihat semua icon:** https://code.visualstudio.com/api/references/icons-in-labels

---

## 🎨 Icon dengan Warna Custom

Jika ingin icon dengan warna spesifik, gunakan file path:

```json
{
  "id": "my-app",
  "label": "My App",
  "icon": "C:\\path\\to\\icon.png"  // Absolute path
}
```

Atau relative path:
```json
{
  "id": "my-app",
  "label": "My App",
  "icon": "./media/icon.png"  // Relative to workspace
}
```

---

## 📝 Best Practices

### ✅ DO:
1. **Gunakan icon field** untuk konsistensi
2. **Pilih icon yang sesuai** dengan fungsi
3. **Gunakan label yang jelas** tanpa emoji
4. **Test di theme berbeda** (dark/light)

### ❌ DON'T:
1. **Jangan gunakan emoji + icon** bersamaan
2. **Jangan gunakan emoji yang ambigu**
3. **Jangan gunakan path yang tidak valid**
4. **Jangan lupa test setelah edit**

---

## 🔄 Cara Update Shortcuts

1. Edit file `.vscode/launcher-putra.json`
2. Hapus emoji dari label ATAU hapus icon field
3. Save file
4. Klik tombol **Refresh** (🔄) di Launcher Plus tree view
5. Atau reload window: `Ctrl+Shift+P` → "Developer: Reload Window"

---

## 📚 Contoh Lengkap

Lihat file `.vscode/launcher-putra-clean.json` untuk contoh shortcuts yang sudah diperbaiki (tanpa duplicate icon).

### Contoh Clean Shortcuts:

```json
[
  {
    "id": "npm-install",
    "label": "npm install",
    "program": "",
    "args": ["npm", "install"],
    "cwd": "${workspaceFolder}",
    "icon": "package"
  },
  {
    "id": "npm-dev",
    "label": "npm run dev",
    "program": "",
    "args": ["npm", "run", "dev"],
    "cwd": "${workspaceFolder}",
    "icon": "play"
  },
  {
    "id": "git-status",
    "label": "git status",
    "program": "",
    "args": ["git", "status"],
    "cwd": "${workspaceFolder}",
    "icon": "git-branch"
  },
  {
    "id": "docker-up",
    "label": "docker-compose up",
    "program": "",
    "args": ["docker-compose", "up"],
    "cwd": "${workspaceFolder}",
    "icon": "server-process"
  }
]
```

---

## 💡 Tips

1. **Copy dari clean file**: Gunakan `.vscode/launcher-putra-clean.json` sebagai template
2. **Konsisten**: Pilih satu style (icon atau emoji) dan stick dengan itu
3. **Group by type**: Gunakan icon yang sama untuk shortcuts sejenis
4. **Test visual**: Reload dan lihat hasilnya sebelum commit

---

## 🐛 Troubleshooting

**Q: Icon masih duplicate setelah edit?**
A: Reload window: `Ctrl+Shift+P` → "Developer: Reload Window"

**Q: Icon tidak muncul?**
A: Periksa icon name valid. Lihat list di atas atau dokumentasi VS Code.

**Q: Icon path tidak work?**
A: Gunakan absolute path atau pastikan relative path benar dari workspace root.

**Q: Ingin icon berwarna?**
A: Extension otomatis apply warna berdasarkan group detection. Atau gunakan custom icon file.
