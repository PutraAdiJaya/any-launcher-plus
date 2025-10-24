# 🚀 Quick Start Guide - Launcher Plus

Get up and running with Launcher Plus in under 5 minutes!

## 📦 Installation

### Option 1: VS Code Marketplace (Recommended)
1. Open VS Code/Cursor/Windsurf
2. Go to Extensions panel (`Ctrl+Shift+X`)
3. Search for "Launcher Plus"
4. Click Install on the extension by **PutraAdiJaya**

### Option 2: OpenVSX (Alternative)
1. Open your VS Code variant
2. Search "Launcher Plus" in Extensions
3. Install from OpenVSX registry

## 🎯 First Steps

### 1. Open Launcher Plus Panel
- Look for **🚀Launcher Plus** in the Explorer sidebar
- If not visible, enable it: `View` → `Explorer` → Check `Launcher Plus`

### 2. Try the Quick Pick
- Press `Ctrl+Alt+L` (or `Cmd+Alt+L` on Mac)
- See all available shortcuts in a searchable list

### 3. Use Play Buttons
- Click the **▶️ play button** next to any shortcut to run it
- No more accidental clicks - only play buttons execute shortcuts!

## 🎨 Understanding Color Groups

Shortcuts are automatically color-coded by category:

| Color | Category | Examples |
|:---:|:---|:---|
| 🧩 Orange | Extension Dev | Compile, Package, Publish |
| 🔐 Red | SSH/Remote | SSH connections, SCP transfers |
| 🟢 Green | Node.js | npm, yarn, webpack |
| 🔵 Cyan | Go | go run, go build |
| 🐍 Blue | Python | python, pip, django |
| 🐳 Bright Cyan | Docker | docker, kubernetes |
| 💻 Bright Blue | Terminal | cmd, powershell, bash |
| 🌐 Green | Browser | chrome, firefox, edge |

## ⚡ Auto-Discovered Shortcuts

Launcher Plus automatically detects and creates shortcuts based on your project:

### For VS Code Extension Projects
- 🔧 **Compile Extension** - `npm run compile`
- 📦 **Package Extension** - `npm run package`
- 🚀 **Publish to OpenVSX** - `npm run publish:ovsx`
- 🏪 **Publish to Marketplace** - `npm run publish:vsce`

### For Node.js Projects
- 📦 **npm run dev** - Development server
- 🔨 **npm run build** - Production build
- 🧪 **npm run test** - Run tests

### For Go Projects
- 🚀 **go run main.go** - Run Go application
- 🔨 **go build** - Build executable
- 🧪 **go test** - Run tests

### For Docker Projects
- 🐳 **docker-compose up** - Start containers
- 🛑 **docker-compose down** - Stop containers

## 🔧 Basic Configuration

### Global vs Workspace Shortcuts

**Global Shortcuts** (Recommended):
- Available in ALL workspaces
- Location: `%APPDATA%\Code\User\launcher-putra.json` (Windows)
- Auto-created with 100+ default shortcuts

**Workspace Shortcuts** (Project-specific):
- Only for current project
- Location: `.vscode/launcher-putra.json`

### Opening Settings Files

1. Click the `{}` icon in Launcher Plus panel
2. Choose **Global** or **Workspace**
3. File opens automatically (created if doesn't exist)

### Adding Custom Shortcuts

```json
{
  "id": "my-shortcut",
  "label": "My Custom Shortcut",
  "program": "notepad.exe",
  "args": ["${file}"],
  "icon": "edit"
}
```

## 🎯 Common Use Cases

### 1. Quick File Operations
- **Explorer (Downloads)** - Open Downloads folder
- **Explorer (Documents)** - Open Documents folder

### 2. Development Workflow
- **Chrome** - Open browser for testing
- **Git Status** - Check repository status
- **Terminal** - Open command prompt

### 3. SSH Connections
- **SSH to localhost** - Connect to local server
- **SCP Upload** - Transfer files via SCP

### 4. Build & Deploy
- **npm run build** - Build project
- **Package Extension** - Create .vsix file
- **Publish to OpenVSX** - Deploy extension

## 🔍 Tips & Tricks

### 1. Search Shortcuts
- Use `Ctrl+Alt+L` and type to filter shortcuts
- Search by name, category, or command

### 2. Organize by Profile
- Set active profile: `Launcher Plus: Set Active Profile`
- Filter shortcuts by context (dev, ops, test)

### 3. Import/Export
- Share configurations between machines
- `Launcher Plus: Export Shortcuts (JSON)`
- `Launcher Plus: Import Shortcuts (JSON)`

### 4. Validation & Cleanup
- `Launcher Plus: Validate Shortcuts` - Check for broken paths
- `Launcher Plus: Clean Invalid Shortcuts` - Remove broken ones

## 🆘 Troubleshooting

### Shortcuts Not Appearing?
1. Check if `launcher.enableAutoDiscover` is enabled
2. Reload window: `Developer: Reload Window`
3. Rescan: Click refresh button in Launcher Plus panel

### Program Not Found Error?
1. Check if program is installed and in PATH
2. Use full path in shortcut configuration
3. Run `Launcher Plus: Validate Shortcuts` for diagnosis

### Extension Development Shortcuts Missing?
1. Ensure `package.json` has `engines.vscode` field
2. Check for `vsce` or `ovsx` in devDependencies
3. Verify scripts exist: `compile`, `package`, `publish:ovsx`

## 🎉 You're Ready!

That's it! You now have:
- ✅ 100+ auto-discovered shortcuts
- ✅ Smart color grouping
- ✅ Play button interface
- ✅ Extension development workflow
- ✅ Cross-platform compatibility

**Happy coding!** 🚀

---

**Need more help?** Check the [full README](README.md) or [report issues](https://github.com/PutraAdiJaya/any-launcher-plus/issues).