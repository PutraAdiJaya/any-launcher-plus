# Terminal Integration - Launcher Plus

## 🎯 Fitur Baru

### 1. Tombol Play untuk Favorites
- Setiap shortcut di **Favorites** sekarang memiliki tombol **Play** (▶️) untuk menjalankan langsung
- Tombol **Pin/Unpin** tetap tersedia untuk mengelola favorites

### 2. Auto-detect Development Commands
Extension sekarang otomatis mendeteksi dan menjalankan development commands di **internal terminal VS Code**.

#### Commands yang Otomatis Dijalankan di Terminal:

**Development Tools:**
- `npm`, `yarn`, `pnpm`
- `node`
- `python`, `py`
- `go`
- `cargo` (Rust)
- `dotnet` (.NET)
- `mvn`, `gradle` (Java)
- `make`
- `vsce`, `ovsx` (VS Code extensions)
- `tsc`, `webpack`, `vite`, `rollup` (Build tools)

**CLI Tools:**
- `git`
- `docker`, `docker-compose`
- `kubectl`
- `ssh`, `scp`
- `curl`, `wget`
- `pip`, `composer`

## 📝 Cara Penggunaan

### Shortcut dengan Program Kosong
Untuk command yang ingin dijalankan langsung di terminal, gunakan `program: ""` (kosong):

```json
{
  "id": "npm-compile",
  "label": "🔧 npm run compile",
  "program": "",
  "args": ["npm", "run", "compile"],
  "cwd": "${workspaceFolder}",
  "icon": "tools"
}
```

### Shortcut dengan Program Spesifik
Untuk command yang perlu dijalankan via cmd/powershell:

```json
{
  "id": "npm-start",
  "label": "npm start",
  "program": "cmd.exe",
  "args": ["/c", "npm", "start"],
  "cwd": "${workspaceFolder}",
  "icon": "play"
}
```

## ✨ Keuntungan

1. **Terminal Tetap Terbuka**: Terminal tidak langsung close setelah command selesai
2. **Error Handling**: Menampilkan pesan error jika command gagal (kompatibel dengan PowerShell & CMD)
3. **Status Indicator**: Menampilkan status di status bar
4. **Named Terminal**: Setiap command punya terminal dengan nama yang jelas
5. **Working Directory**: Command dijalankan di working directory yang benar
6. **PowerShell Compatible**: Otomatis deteksi shell type (PowerShell/CMD) dan gunakan syntax yang tepat

## 🔧 Contoh Shortcuts

Lihat file `.vscode/launcher-putra.json` untuk contoh lengkap shortcuts development commands.

### Contoh Populer:

```json
[
  {
    "id": "npm-install",
    "label": "📦 npm install",
    "program": "",
    "args": ["npm", "install"],
    "cwd": "${workspaceFolder}"
  },
  {
    "id": "npm-dev",
    "label": "🚀 npm run dev",
    "program": "",
    "args": ["npm", "run", "dev"],
    "cwd": "${workspaceFolder}"
  },
  {
    "id": "go-run",
    "label": "🚀 go run main.go",
    "program": "",
    "args": ["go", "run", "main.go"],
    "cwd": "${workspaceFolder}"
  },
  {
    "id": "dotnet-run",
    "label": "⚡ dotnet run",
    "program": "",
    "args": ["dotnet", "run"],
    "cwd": "${workspaceFolder}"
  }
]
```

## 🎮 Keyboard Shortcuts

- `Ctrl+Alt+L` (Windows/Linux) atau `Cmd+Alt+L` (Mac): Buka quick pick shortcuts
- Klik tombol **Play** (▶️) di tree view untuk menjalankan shortcut
- Klik tombol **Pin** (📌) untuk menambahkan ke favorites

## 🔄 Reload Extension

Setelah update, reload VS Code window:
1. Press `Ctrl+Shift+P` (atau `Cmd+Shift+P` di Mac)
2. Ketik "Developer: Reload Window"
3. Enter

Atau restart VS Code.
