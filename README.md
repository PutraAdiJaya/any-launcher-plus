# Launcher Plus (Shortcuts)

**Tujuan:** membuat *shortcut list* di VS Code / Cursor / Windsurf untuk membuka aplikasi Windows/Mac/Linux, menjalankan skrip, atau membuka dokumen (Word/PDF/dll) dengan cepat.

## Fitur
- Panel **Shortcuts** (TreeView) di Explorer.
- **QuickPick** (Command Palette): cari & jalankan shortcut.
- **Variables**: `${file}`, `${workspaceFolder}`, `${relativeFile}`, `${lineNumber}`, `${selectedText}`.
- **Default open**: kalau `program` kosong, file/arg pertama dibuka dengan *default app* OS (start/open/xdg-open).
- **Recent items** (disimpan di `globalState`, limit di pengaturan).
- **Keybinding** default: `Ctrl+Alt+L` (`Cmd+Alt+L` di macOS) membuka QuickPick.
- Konfigurasi bisa global atau per-workspace.

## Instalasi
1. Ekstrak ZIP ini.
2. Jalankan `npm install` (opsional untuk build).
3. `npm run compile` untuk membangun ke `out/`.
4. **F5** di VS Code untuk start *Extension Development Host*, atau `vsce package` untuk `.vsix` lalu *Install from VSIX* (VS Code/Cursor/Windsurf).

## Konfigurasi
Tambahkan ke **Settings (JSON)**:
```json
{
  "launcher.shortcuts": [
    {
      "id": "open-doc-default",
      "label": "Open in Default App",
      "program": "",
      "args": ["${file}"],
      "cwd": "${workspaceFolder}",
      "env": {},
      "runAsAdmin": false,
      "when": "",
      "platform": "win"
    },
    {
      "id": "open-downloads",
      "label": "Open Downloads Folder",
      "program": "explorer.exe",
      "args": ["C:\\\\Users\\\\%USERNAME%\\\\Downloads"],
      "platform": "win"
    },
    {
      "id": "open-chrome",
      "label": "Google Chrome (this file URL)",
      "program": "C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
      "args": ["${file}"]
    }
  ]
}
```

### Keybindings (opsional)
```json
[
  { "key": "ctrl+alt+shift+1", "command": "launcher.run", "args": "open-doc-default" },
  { "key": "ctrl+alt+shift+2", "command": "launcher.run", "args": "open-downloads" }
]
```

## Catatan
- **Run as Admin**: saat ini menampilkan peringatan. Jalankan VS Code sebagai Administrator jika perlu.
- **Keamanan**: periksa path/args sebelum menjalankan shortcut dari workspace publik.
- **Kompatibilitas**: Dirancang agar bekerja di VS Code, Cursor, dan Windsurf (gunakan **Open VSX** atau file `.vsix`).

## Roadmap
- Elevasi admin (Windows) terotomasi.
- Import/Export profil shortcut.
- Auto-discover aplikasi umum (Chrome/Office/Git Bash/WSL).
- Multi-target (jalankan beberapa shortcut paralel/serial).

Lisensi: MIT

## Fitur baru (improvisasi)
- **Auto-discover apps** (opsional): Chrome, Office, Notepad, Explorer, dll → muncul di QuickPick & TreeView jika aplikasi terpasang.
- **Import/Export Shortcuts**: simpan/restore konfigurasi ke/dari JSON.
- **Multi-target (sequence)**: jalankan beberapa target berurutan (id shortcut lain atau langkah inline).
- **Icon per item**: gunakan codicon (mis. `rocket`, `terminal`, `file-pdf`) atau path ikon PNG/SVG lokal.

### Contoh shortcut dengan `sequence` dan `icon`
```json
{
  "id": "daily-start",
  "label": "Daily Start (Chrome + Downloads)",
  "icon": "rocket",
  "sequence": [
    {"program": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "args": ["https://inbox.google.com"]},
    {"program": "explorer.exe", "args": ["C:\\Users\\%USERNAME%\\Downloads"]}
  ]
}
```


## Fitur tambahan
- **Profiles**: tambahkan `"profile"` pada shortcut, dan set `launcher.activeProfile` untuk memfilter.
- **Parallel sequence**: set `"sequenceMode": "parallel"` agar langkah-langkah dieksekusi bersamaan.
- **Generate tasks.json**: perintah *Launcher: Generate tasks.json from Shortcuts* membuat task `shell` untuk setiap shortcut.
- **Workspace import/export**: simpan/ambil shortcuts ke **Workspace Settings**.

### Contoh shortcut dengan profile & parallel
```json
{
  "id": "ops-start",
  "label": "Ops Start",
  "profile": "ops",
  "sequenceMode": "parallel",
  "sequence": [
    {"program": "C:\\Program Files\\Git\\bin\\bash.exe", "args": ["-lc", "htop"]},
    {"program": "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe", "args": ["-NoLogo"]}
  ]
}
```


## Editor (Webview)
Gunakan **Launcher: Open Shortcut Editor** untuk mengedit daftar shortcuts via form berbasis JSON textarea (validasi sederhana) dan simpan langsung ke Settings.

## CI Publish (Open VSX / VSCE)
Workflow GitHub Actions disertakan di `.github/workflows/release.yml`. Siapkan secrets:
- `OVSX_TOKEN` untuk publish ke Open VSX
- `VSCE_PAT` untuk publish ke VS Code Marketplace (opsional; jika kamu ingin dual publish)

Jalankan manual:
```bash
npm run compile
npx vsce package
npm run publish:ovsx   # butuh OVSX_TOKEN
```


## Contoh Konfigurasi (Examples)
Lihat folder **/examples**:
- `windows_basic.json` – shortcut dasar Windows (default app, Explorer Downloads, Chrome).  
- `profiles_ops_dev.json` – contoh penggunaan **profile** (`ops` vs `dev`) + parallel sequence.  
- `nested_sequence_mix.json` – contoh **nested sequence** (gabungan serial & parallel) untuk rutinitas pagi.

Cara pakai:
1. Buka **Launcher: Open Shortcut Editor** → paste isi file example ke editor → **Save**.  
   atau
2. **Launcher: Import Shortcuts (User/Workspace)** → pilih file example.


## Universal Variant (v0.6)
- **Deteksi varian**: VS Code / Windsurf / Cursor / Kiro / Qoder / Trae (heuristik env var).
- **Status bar**: tombol `Launcher Plus` untuk QuickPick + tooltip varian yang terdeteksi.
- **Dual manifest**: `npm run build:manifests` menghasilkan `manifest-vscode.json` dan `manifest-openvsx.json`.
- **Package keduanya**: `npm run package:both` → `.vsix` untuk Marketplace & Open VSX.
