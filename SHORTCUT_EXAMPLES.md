# 📝 Contoh Shortcuts - Launcher Plus

## 🎯 Best Practices

### ✅ RECOMMENDED: Program Kosong untuk Development Commands

Untuk command development (npm, node, yarn, go, dotnet, dll), gunakan `program: ""` (kosong):

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

**Keuntungan:**
- ✅ Berjalan di internal terminal VS Code
- ✅ Terminal tetap terbuka
- ✅ Error handling otomatis
- ✅ Kompatibel dengan PowerShell & CMD
- ✅ Tidak perlu `echo.`, `pause`, atau parameter tambahan

### ❌ TIDAK DISARANKAN: Menggunakan cmd.exe dengan parameter kompleks

```json
{
  "id": "npm-compile-bad",
  "label": "npm run compile",
  "program": "cmd.exe",
  "args": ["/c", "npm", "run", "compile", "||", "echo.", "&&", "echo", "[Error]", "&&", "pause"],
  "cwd": "${workspaceFolder}"
}
```

**Masalah:**
- ❌ Parameter terlalu kompleks
- ❌ `echo.` tidak work di PowerShell
- ❌ Sulit di-maintain
- ❌ Error handling manual

## 📦 NPM/Yarn/PNPM Commands

```json
[
  {
    "id": "npm-install",
    "label": "📦 npm install",
    "program": "",
    "args": ["npm", "install"],
    "cwd": "${workspaceFolder}",
    "icon": "package"
  },
  {
    "id": "npm-dev",
    "label": "🚀 npm run dev",
    "program": "",
    "args": ["npm", "run", "dev"],
    "cwd": "${workspaceFolder}",
    "icon": "play"
  },
  {
    "id": "npm-build",
    "label": "🔨 npm run build",
    "program": "",
    "args": ["npm", "run", "build"],
    "cwd": "${workspaceFolder}",
    "icon": "tools"
  },
  {
    "id": "npm-test",
    "label": "🧪 npm test",
    "program": "",
    "args": ["npm", "test"],
    "cwd": "${workspaceFolder}",
    "icon": "beaker"
  },
  {
    "id": "yarn-install",
    "label": "📦 yarn install",
    "program": "",
    "args": ["yarn", "install"],
    "cwd": "${workspaceFolder}",
    "icon": "package"
  },
  {
    "id": "pnpm-install",
    "label": "📦 pnpm install",
    "program": "",
    "args": ["pnpm", "install"],
    "cwd": "${workspaceFolder}",
    "icon": "package"
  }
]
```

## 🚀 Go Commands

```json
[
  {
    "id": "go-run",
    "label": "🚀 go run main.go",
    "program": "",
    "args": ["go", "run", "main.go"],
    "cwd": "${workspaceFolder}",
    "icon": "play"
  },
  {
    "id": "go-build",
    "label": "🔨 go build",
    "program": "",
    "args": ["go", "build"],
    "cwd": "${workspaceFolder}",
    "icon": "tools"
  },
  {
    "id": "go-test",
    "label": "🧪 go test",
    "program": "",
    "args": ["go", "test", "./..."],
    "cwd": "${workspaceFolder}",
    "icon": "beaker"
  }
]
```

## ⚡ .NET Commands

```json
[
  {
    "id": "dotnet-run",
    "label": "⚡ dotnet run",
    "program": "",
    "args": ["dotnet", "run"],
    "cwd": "${workspaceFolder}",
    "icon": "play"
  },
  {
    "id": "dotnet-build",
    "label": "🔨 dotnet build",
    "program": "",
    "args": ["dotnet", "build"],
    "cwd": "${workspaceFolder}",
    "icon": "tools"
  },
  {
    "id": "dotnet-test",
    "label": "🧪 dotnet test",
    "program": "",
    "args": ["dotnet", "test"],
    "cwd": "${workspaceFolder}",
    "icon": "beaker"
  }
]
```

## 🐍 Python Commands

```json
[
  {
    "id": "python-main",
    "label": "🐍 python main.py",
    "program": "",
    "args": ["python", "main.py"],
    "cwd": "${workspaceFolder}",
    "icon": "play"
  },
  {
    "id": "python-test",
    "label": "🧪 pytest",
    "program": "",
    "args": ["pytest"],
    "cwd": "${workspaceFolder}",
    "icon": "beaker"
  },
  {
    "id": "pip-install",
    "label": "📦 pip install -r requirements.txt",
    "program": "",
    "args": ["pip", "install", "-r", "requirements.txt"],
    "cwd": "${workspaceFolder}",
    "icon": "package"
  }
]
```

## 🦀 Rust Commands

```json
[
  {
    "id": "cargo-run",
    "label": "🦀 cargo run",
    "program": "",
    "args": ["cargo", "run"],
    "cwd": "${workspaceFolder}",
    "icon": "play"
  },
  {
    "id": "cargo-build",
    "label": "🔨 cargo build",
    "program": "",
    "args": ["cargo", "build"],
    "cwd": "${workspaceFolder}",
    "icon": "tools"
  },
  {
    "id": "cargo-test",
    "label": "🧪 cargo test",
    "program": "",
    "args": ["cargo", "test"],
    "cwd": "${workspaceFolder}",
    "icon": "beaker"
  }
]
```

## 🐳 Docker Commands

```json
[
  {
    "id": "docker-compose-up",
    "label": "🐳 docker-compose up",
    "program": "",
    "args": ["docker-compose", "up"],
    "cwd": "${workspaceFolder}",
    "icon": "server-process"
  },
  {
    "id": "docker-compose-down",
    "label": "🛑 docker-compose down",
    "program": "",
    "args": ["docker-compose", "down"],
    "cwd": "${workspaceFolder}",
    "icon": "debug-stop"
  },
  {
    "id": "docker-ps",
    "label": "📋 docker ps",
    "program": "",
    "args": ["docker", "ps"],
    "cwd": "${workspaceFolder}",
    "icon": "list-unordered"
  }
]
```

## 🔧 Git Commands

```json
[
  {
    "id": "git-status",
    "label": "📊 git status",
    "program": "",
    "args": ["git", "status"],
    "cwd": "${workspaceFolder}",
    "icon": "git-branch"
  },
  {
    "id": "git-pull",
    "label": "⬇️ git pull",
    "program": "",
    "args": ["git", "pull"],
    "cwd": "${workspaceFolder}",
    "icon": "cloud-download"
  },
  {
    "id": "git-push",
    "label": "⬆️ git push",
    "program": "",
    "args": ["git", "push"],
    "cwd": "${workspaceFolder}",
    "icon": "cloud-upload"
  }
]
```

## 🖥️ Terminal & Shell Commands

Untuk membuka terminal/shell, gunakan program spesifik:

```json
[
  {
    "id": "cmd",
    "label": "Command Prompt",
    "program": "cmd.exe",
    "args": [],
    "cwd": "${workspaceFolder}",
    "platform": "win",
    "icon": "terminal"
  },
  {
    "id": "powershell",
    "label": "PowerShell",
    "program": "powershell.exe",
    "args": [],
    "cwd": "${workspaceFolder}",
    "platform": "win",
    "icon": "terminal-powershell"
  },
  {
    "id": "wsl",
    "label": "WSL",
    "program": "wsl.exe",
    "args": [],
    "cwd": "${workspaceFolder}",
    "platform": "win",
    "icon": "terminal-linux"
  }
]
```

## 🌐 Browser & GUI Apps

Untuk aplikasi GUI, gunakan path lengkap:

```json
[
  {
    "id": "chrome-localhost",
    "label": "🌐 Open localhost:3000",
    "program": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "args": ["http://localhost:3000"],
    "platform": "win",
    "icon": "browser"
  },
  {
    "id": "explorer-here",
    "label": "📁 Explorer (Current Folder)",
    "program": "explorer.exe",
    "args": ["${workspaceFolder}"],
    "platform": "win",
    "icon": "folder-opened"
  }
]
```

## 💡 Tips

1. **Gunakan `program: ""`** untuk semua development commands (npm, go, dotnet, dll)
2. **Jangan tambahkan** `||`, `echo.`, `pause`, atau parameter error handling manual
3. **Extension otomatis handle** error dan keep terminal open
4. **Gunakan icon** untuk visual yang lebih baik (lihat [VS Code Icons](https://code.visualstudio.com/api/references/icons-in-labels))
5. **Gunakan emoji** di label untuk kategori yang jelas (📦 package, 🚀 run, 🔨 build, 🧪 test)

## 🔄 Reload Extension

Setelah edit shortcuts:
1. Save file `.vscode/launcher-putra.json`
2. Klik tombol **Refresh** (🔄) di Launcher Plus tree view
3. Atau reload window: `Ctrl+Shift+P` → "Developer: Reload Window"
