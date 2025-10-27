# Quick Reference: Default Shortcuts

## 📋 All Built-in Shortcuts (50+)

### 🖥️ Terminal & Shell
| ID | Label | Command |
|---|---|---|
| `cmd` | Command Prompt | `cmd.exe` |
| `powershell` | PowerShell | `powershell.exe` |
| `wsl` | WSL | `wsl.exe` |
| `git-bash` | Git Bash | `git-bash.exe` |

### 🛠️ System Tools
| ID | Label | Command |
|---|---|---|
| `explorer-here` | Explorer (Current Folder) | `explorer.exe` |
| `task-manager` | Task Manager | `taskmgr.exe` |

### 🔄 REPL
| ID | Label | Command |
|---|---|---|
| `node-repl` | Node.js REPL | `node` |
| `python-repl` | Python REPL | `python` |

### 📦 NPM Commands
| ID | Label | Command |
|---|---|---|
| `npm-install` | npm install | `npm install` |
| `npm-start` | npm start | `npm start` |
| `npm-test` | npm test | `npm test` |
| `npm-run-dev` | npm run dev | `npm run dev` |
| `npm-run-build` | npm run build | `npm run build` |

### 🧶 Yarn Commands
| ID | Label | Command |
|---|---|---|
| `yarn-install` | yarn install | `yarn install` |

### 🔀 Git Commands
| ID | Label | Command |
|---|---|---|
| `git-status` | Git Status | `git status` |
| `git-log` | Git Log (Graph) | `git log --oneline --graph --all` |

### 🌐 Browsers & Dev Tools
| ID | Label | Command |
|---|---|---|
| `chrome-dev` | Chrome (Dev Mode) | Chrome with DevTools |
| `localhost-3000` | Open localhost:3000 | `http://localhost:3000` |
| `localhost-8080` | Open localhost:8080 | `http://localhost:8080` |

### 🐳 Docker
| ID | Label | Command |
|---|---|---|
| `docker-desktop` | Docker Desktop | Docker Desktop.exe |
| `docker-compose-up` | docker-compose up | `docker-compose up` |
| `docker-compose-down` | docker-compose down | `docker-compose down` |

### 🐍 Python
| ID | Label | Command |
|---|---|---|
| `python-main` | python main.py | `python main.py` |
| `django-runserver` | Django runserver | `python manage.py runserver` |

### 🔵 Go
| ID | Label | Command |
|---|---|---|
| `go-run-main` | go run main.go | `go run main.go` |
| `go-build` | go build | `go build` |
| `go-test` | go test | `go test ./...` |

### 🦀 Rust
| ID | Label | Command |
|---|---|---|
| `cargo-run` | cargo run | `cargo run` |
| `cargo-build` | cargo build | `cargo build` |
| `cargo-test` | cargo test | `cargo test` |

### ☕ Java
| ID | Label | Command |
|---|---|---|
| `mvn-clean-install` | mvn clean install | `mvn clean install` |
| `mvn-test` | mvn test | `mvn test` |
| `gradle-build` | gradle build | `gradlew.bat build` |
| `gradle-test` | gradle test | `gradlew.bat test` |

### 🔷 .NET
| ID | Label | Command |
|---|---|---|
| `dotnet-run` | dotnet run | `dotnet run` |
| `dotnet-build` | dotnet build | `dotnet build` |
| `dotnet-test` | dotnet test | `dotnet test` |

### 🔨 Make
| ID | Label | Command |
|---|---|---|
| `make` | make | `make` |
| `make-clean` | make clean | `make clean` |

### 🧩 VS Code Extension Development
| ID | Label | Command |
|---|---|---|
| `npm-run-compile` | npm run compile | `npm run compile` |
| `npm-run-watch` | npm run watch | `npm run watch` |
| `npm-run-package` | npm run package | `npm run package` |
| `npm-run-lint` | npm run lint | `npm run lint` |
| `npm-run-format` | npm run format | `npm run format` |
| `npm-publish-ovsx` | npm run publish:ovsx | `npm run publish:ovsx` |
| `npm-publish-vsce` | npm run publish:vsce | `npm run publish:vsce` |
| `vsce-package` | vsce package | `vsce package` |
| `vsce-publish` | vsce publish | `vsce publish` |
| `ovsx-publish` | ovsx publish | `ovsx publish` |

### 🔌 Network
| ID | Label | Command |
|---|---|---|
| `port-check` | Check Port 3000 | `netstat -an \| findstr :3000` |

---

## 🎯 How to Use

### 1. Use Default Shortcuts
Just open Launcher Plus (`Ctrl+Alt+L`) and all these shortcuts are ready to use!

### 2. Add Custom Shortcuts
Create `.vscode/launcher-putra.json`:
```json
[
  {
    "id": "my-command",
    "label": "My Custom Command",
    "program": "cmd.exe",
    "args": ["/c", "echo", "Hello!"],
    "icon": "star"
  }
]
```

### 3. Override Default Shortcuts
Use the same ID to replace a default:
```json
[
  {
    "id": "npm-start",
    "label": "🚀 Custom NPM Start",
    "program": "cmd.exe",
    "args": ["/c", "npm", "run", "start:custom"],
    "icon": "rocket"
  }
]
```

---

## 📝 Variables

Use these in `program`, `args`, and `cwd`:

| Variable | Description | Example |
|---|---|---|
| `${workspaceFolder}` | Current workspace | `C:\Projects\my-app` |
| `${file}` | Current file | `C:\Projects\my-app\src\index.ts` |
| `${relativeFile}` | Relative file path | `src\index.ts` |
| `${selectedText}` | Selected text | `console.log` |
| `${lineNumber}` | Current line | `42` |

---

## 🔧 Common Patterns

### Run Script
```json
{
  "id": "run-script",
  "program": "",
  "args": ["node", "scripts/build.js"],
  "cwd": "${workspaceFolder}"
}
```

### Open Browser
```json
{
  "id": "open-app",
  "program": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "args": ["http://localhost:4200"]
}
```

### SSH Connection
```json
{
  "id": "ssh-server",
  "program": "cmd.exe",
  "args": ["/c", "ssh", "user@server.com"]
}
```

### With Environment Variables
```json
{
  "id": "run-dev",
  "program": "",
  "args": ["npm", "start"],
  "env": {
    "NODE_ENV": "development",
    "PORT": "3000"
  }
}
```

---

## 🚀 Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Alt+L` | Open Launcher Plus |
| Click Play Button | Run shortcut |
| Click Pin Icon | Add to favorites |

---

## 📚 More Info

- [Custom Shortcuts Guide](CUSTOM_SHORTCUTS_GUIDE.md)
- [Migration Guide](MIGRATION_GUIDE.md)
- [Examples](examples/custom-shortcuts-template.json)
- [Full README](README.md)
