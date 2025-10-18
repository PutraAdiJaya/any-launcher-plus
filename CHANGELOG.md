# Changelog

All notable changes to the "Launcher Plus (Shortcuts)" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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