# Release Notes - v1.4.0

## 🎉 Major Update: Built-in Default Shortcuts

**Release Date:** January 15, 2024

### 🔥 What's New

#### Built-in Default Shortcuts
The biggest change in this release! Launcher Plus now includes **50+ pre-configured shortcuts** built directly into the extension code.

**Benefits:**
- ✅ **Zero Configuration** - Start using common shortcuts immediately
- ✅ **Cleaner Config Files** - Only store YOUR custom shortcuts
- ✅ **Automatic Updates** - Default shortcuts update with the extension
- ✅ **No Duplicates** - Smart merging prevents ID conflicts
- ✅ **Faster Loading** - Less file I/O operations

**Included Default Shortcuts:**

##### Terminal & Shell (4)
- Command Prompt, PowerShell, WSL, Git Bash

##### System Tools (2)
- Explorer (Current Folder), Task Manager

##### REPL (2)
- Node.js REPL, Python REPL

##### NPM Commands (5)
- npm install, npm start, npm test, npm run dev, npm run build

##### Yarn Commands (1)
- yarn install

##### Git Commands (2)
- Git Status, Git Log (Graph)

##### Browsers & Dev Tools (3)
- Chrome (Dev Mode), localhost:3000, localhost:8080

##### Docker (3)
- Docker Desktop, docker-compose up, docker-compose down

##### Python (2)
- python main.py, Django runserver

##### Go (3)
- go run main.go, go build, go test

##### Rust (3)
- cargo run, cargo build, cargo test

##### Java (4)
- mvn clean install, mvn test, gradle build, gradle test

##### .NET (3)
- dotnet run, dotnet build, dotnet test

##### Make (2)
- make, make clean

##### VS Code Extension Development (10)
- npm run compile, watch, package, lint, format
- npm run publish:ovsx, publish:vsce
- vsce package, vsce publish
- ovsx publish

##### Network (1)
- Check Port 3000

### 📝 Configuration Changes

#### Before (v1.3.0 and earlier)
```json
// .vscode/launcher-putra.json - Large file with all shortcuts
[
  {
    "id": "npm-start",
    "label": "npm start",
    "program": "cmd.exe",
    "args": ["/c", "npm", "start"],
    ...
  },
  {
    "id": "my-custom-command",
    "label": "My Custom Command",
    ...
  },
  // ... 50+ more default shortcuts
]
```

#### After (v1.4.0)
```json
// .vscode/launcher-putra.json - Only custom shortcuts!
[
  {
    "id": "my-custom-command",
    "label": "My Custom Command",
    "program": "cmd.exe",
    "args": ["/c", "echo", "Hello!"],
    "icon": "star"
  }
]
```

### 🔄 Migration Guide

**For Existing Users:**

1. **Backup** your current `.vscode/launcher-putra.json`
2. **Remove** all default shortcuts (npm, git, docker, etc.)
3. **Keep** only your custom shortcuts
4. **Reload** VS Code window

**Automated Migration:**
```javascript
// Run this script to automatically clean your config
node migrate-shortcuts.js
```

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for detailed instructions.

### 🎯 Override Default Shortcuts

Want to customize a default shortcut? Just use the same ID:

```json
[
  {
    "id": "npm-start",
    "label": "🚀 My Custom NPM Start",
    "program": "cmd.exe",
    "args": ["/c", "npm", "run", "start:custom"],
    "icon": "rocket"
  }
]
```

Your version will **replace** the default!

### 🛠️ Technical Changes

- Added `DEFAULT_SHORTCUTS` constant with 50+ built-in shortcuts
- Modified `getConfigShortcuts()` to merge defaults with user shortcuts
- Implemented duplicate ID detection and prevention
- User shortcuts take priority over defaults
- Improved logging for shortcut loading

### 📚 New Documentation

- **[CUSTOM_SHORTCUTS_GUIDE.md](CUSTOM_SHORTCUTS_GUIDE.md)** - Complete guide for custom shortcuts
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Step-by-step migration instructions
- **[examples/custom-shortcuts-template.json](examples/custom-shortcuts-template.json)** - Template with examples

### 🐛 Bug Fixes

- Fixed duplicate shortcut warnings
- Improved shortcut loading performance
- Better error handling for missing programs

### 🔧 Breaking Changes

**None!** This is a backward-compatible update. Your existing configuration will continue to work, but you can clean it up to only include custom shortcuts.

### 📊 Performance Improvements

- **Faster startup** - Less JSON parsing
- **Reduced memory** - Smaller config files
- **Better caching** - Built-in shortcuts are pre-loaded

### 🎨 Examples

See the new [examples/custom-shortcuts-template.json](examples/custom-shortcuts-template.json) for:
- Custom commands
- Script execution
- Browser shortcuts
- SSH connections
- Docker commands
- Environment variables
- Overriding defaults

### 🙏 Acknowledgments

Thanks to all users who requested this feature! This update makes Launcher Plus more user-friendly and maintainable.

### 📝 Upgrade Instructions

1. **Update** the extension to v1.4.0
2. **Read** the [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
3. **Clean** your config file (optional but recommended)
4. **Enjoy** the cleaner configuration!

### 🔗 Links

- [GitHub Repository](https://github.com/PutraAdiJaya/any-launcher-plus)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=PutraAdiJaya.any-launcher-plus)
- [Report Issues](https://github.com/PutraAdiJaya/any-launcher-plus/issues)

---

**Full Changelog:** [v1.3.0...v1.4.0](https://github.com/PutraAdiJaya/any-launcher-plus/compare/v1.3.0...v1.4.0)
