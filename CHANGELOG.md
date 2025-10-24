# Changelog

All notable changes to the "Launcher Plus (Shortcuts)" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-24

### Added
- **Play Button**: Added inline play button (▶️) for each shortcut item in tree view
- **Group-Based Icons**: 17 distinct groups with unique colored icons and smart detection
- **Clean Interface**: Focused on colored icons only for better visual clarity
- **Extension Development Shortcuts**: Auto-detected shortcuts for VS Code extension projects
  - 🔧 Compile Extension (npm run compile)
  - 📦 Package Extension (.vsix) (npm run package)
  - 🚀 Publish to OpenVSX (npm run publish:ovsx)
  - 🏪 Publish to VS Code Marketplace (npm run publish:vsce)
  - 👀 Watch & Compile (npm run watch)
  - 🧹 Clean Build (npm run clean)
  - 🔍 Lint Extension Code (npm run lint)
  - ✨ Format Code (npm run format)
  - 🔐 **SSH/Remote**: Bright Red lock icon (ssh, scp, sftp, putty, remote connections)
  - 🟢 **Node.js**: Green method icon (npm, yarn, node, webpack, vite, rollup)
  - 🔵 **Go**: Cyan go-to-file icon (go run, go build, go test)
  - 🟠 **Rust**: Orange gear icon (cargo, rust tools)
  - 🟣 **.NET**: Purple class icon (dotnet, C#, msbuild)
  - 🟡 **Java**: Yellow object icon (maven, gradle, java tools)
  - 🔷 **Python**: Blue snake icon (python, pip, django, flask)
  - 🔶 **Docker**: Bright Cyan package icon (docker, kubernetes, containers)
  - 🟪 **Database**: Bright Purple database icon (mysql, postgres, mongodb, redis, dbeaver)
  - ⭐ **Git**: Bright Yellow source-control icon (git, github, gitlab, sourcetree)
  - 💻 **Terminal**: Bright Blue terminal icon (cmd, powershell, bash, wsl)
  - 🌐 **Browser**: Green browser icon (chrome, firefox, edge, opera)
  - 📝 **Editor**: Bright Purple code icon (vscode, notepad, sublime, vim, emacs)
  - 📁 **File**: Bright Yellow folder icon (explorer, downloads, documents)
  - 🎨 **Media**: Bright Red play icon (photoshop, gimp, vlc, paint)
  - 💬 **Communication**: Bright Green chat icon (discord, slack, teams, zoom)
  - ⚙️ **System**: White settings icon (task manager, registry, control panel)
  - 🔧 **Build**: Orange tools icon (generic build, make, compile)
  - 🧩 **Extension**: Orange extensions icon (VS Code extension development)
- **Improved UX**: Removed click-to-run from tree items, now only play button triggers execution

### Changed
- **Reduced Notifications**: Disabled success notifications when programs launch (only console logging)
- **Selective Error Notifications**: Only show error notifications for "not found" errors, other errors are logged silently
- **Version**: Incremented to 1.1.0

### Fixed
- Better user experience with less intrusive notifications
- Cleaner tree view interaction model
- Fixed package.json colors configuration error (VS Code compliance)
- Improved group detection logic for better color categorization
- Enhanced pattern matching for shortcut grouping (id, label, and program path analysis)
- Removed crowded emoji descriptions - now uses clean colored icons only

## [1.0.0] - 2025-01-24

### Added
- Professional rocket icon and banner design
- Enhanced README with visual diagrams and professional styling
- Improved marketplace presentation

## [0.1.0] - 2025-01-18

### Added
- Initial release of Launcher Plus
- Tree view panel in Explorer sidebar for quick access to shortcuts
- Quick Pick interface with keyboard shortcut (`Ctrl+Alt+L` / `Cmd+Alt+L`)
- Context variable support: `${file}`, `${workspaceFolder}`, `${relativeFile}`, `${lineNumber}`, `${selectedText}`
- Default application handler for opening files with OS default apps
- Recent items tracking with configurable limit
- Custom icon support (codicons and file paths)
- Sequence execution (serial and parallel modes)
- Profile management for filtering shortcuts by context
- Auto-discovery of common applications (Chrome, Office, Git Bash, WSL, etc.)
- Import/Export functionality for sharing configurations
- Visual shortcut editor with webview interface
- Task generation from shortcuts to VS Code tasks.json
- Cross-platform support (Windows, macOS, Linux)
- Compatibility with VS Code variants (Cursor, Windsurf, etc.)
- Status bar integration with variant detection
- Workspace-level and user-level configuration support
- Platform-specific shortcuts with `platform` property
- Conditional execution with `when` clauses
- Environment variable support in shortcuts
- Working directory configuration per shortcut

### Security
- Added warnings for admin elevation on Windows
- Implemented platform checks before execution
- Added condition validation for `when` clauses

### Documentation
- Comprehensive README with examples and usage guide
- Example configurations in `/examples` folder
- Inline code documentation