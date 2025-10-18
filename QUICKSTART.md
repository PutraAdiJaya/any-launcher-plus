# Quick Start Guide

Get up and running with Launcher Plus in 5 minutes!

## Installation

### From VSIX File
1. Download `any-launcher-plus-0.1.0.vsix`
2. Open VS Code/Cursor/Windsurf
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "Install from VSIX"
5. Select the downloaded file

### From Marketplace (Coming Soon)
1. Open Extensions view (`Ctrl+Shift+X`)
2. Search for "Launcher Plus"
3. Click Install

## First Steps

### 1. Open Settings

Press `Ctrl+Shift+P` and run:
```
Launcher: Open Settings
```

Or manually edit your `settings.json`:
```
Ctrl+Shift+P > Preferences: Open Settings (JSON)
```

### 2. Add Your First Shortcut

Add this to your settings:

```json
{
  "launcher.shortcuts": [
    {
      "id": "open-browser",
      "label": "Open in Browser",
      "icon": "browser",
      "program": "",
      "args": ["${file}"]
    }
  ]
}
```

This creates a shortcut to open the current file in your default browser.

### 3. Use the Shortcut

**Method 1: Quick Pick**
- Press `Ctrl+Alt+L` (or `Cmd+Alt+L` on Mac)
- Select "Open in Browser"

**Method 2: Tree View**
- Look for "Shortcuts" in the Explorer sidebar
- Click on "Open in Browser"

**Method 3: Command Palette**
- Press `Ctrl+Shift+P`
- Type "Launcher: Open Shortcuts"
- Select your shortcut

## Common Use Cases

### Open Folder in File Explorer

**Windows:**
```json
{
  "id": "open-explorer",
  "label": "Open in Explorer",
  "icon": "folder-opened",
  "program": "explorer.exe",
  "args": ["${workspaceFolder}"],
  "platform": "win"
}
```

**macOS:**
```json
{
  "id": "open-finder",
  "label": "Open in Finder",
  "icon": "folder-opened",
  "program": "open",
  "args": ["${workspaceFolder}"],
  "platform": "mac"
}
```

**Linux:**
```json
{
  "id": "open-files",
  "label": "Open in Files",
  "icon": "folder-opened",
  "program": "xdg-open",
  "args": ["${workspaceFolder}"],
  "platform": "linux"
}
```

### Open Terminal in Current Directory

```json
{
  "id": "open-terminal",
  "label": "Open Terminal Here",
  "icon": "terminal",
  "program": "wt.exe",
  "args": ["-d", "${workspaceFolder}"]
}
```

### Run npm Commands

```json
{
  "id": "npm-install",
  "label": "npm install",
  "icon": "package",
  "program": "npm",
  "args": ["install"],
  "cwd": "${workspaceFolder}"
}
```

### Open Documentation

```json
{
  "id": "open-docs",
  "label": "Open Documentation",
  "icon": "book",
  "program": "",
  "args": ["https://your-docs-url.com"]
}
```

## Advanced Features

### Sequence Execution

Run multiple commands in order:

```json
{
  "id": "morning-routine",
  "label": "Morning Startup",
  "icon": "rocket",
  "sequence": [
    {"program": "chrome.exe", "args": ["https://mail.google.com"]},
    {"program": "slack.exe"},
    {"program": "code", "args": ["C:\\Projects"]}
  ]
}
```

### Profile-Based Shortcuts

Create shortcuts for different contexts:

```json
{
  "launcher.shortcuts": [
    {
      "id": "dev-tools",
      "label": "Development Tools",
      "profile": "dev",
      "sequence": [
        {"program": "docker-compose", "args": ["up"], "cwd": "${workspaceFolder}"}
      ]
    },
    {
      "id": "prod-tools",
      "label": "Production Tools",
      "profile": "prod",
      "sequence": [
        {"program": "kubectl", "args": ["get", "pods"]}
      ]
    }
  ],
  "launcher.activeProfile": "dev"
}
```

Switch profiles:
```
Ctrl+Shift+P > Launcher: Set Active Profile
```

### Using the Visual Editor

1. Press `Ctrl+Shift+P`
2. Run `Launcher: Open Shortcut Editor`
3. Edit your shortcuts in the visual interface
4. Click "Save" to apply changes

### Import/Export

**Export your shortcuts:**
```
Ctrl+Shift+P > Launcher: Export Shortcuts (JSON)
```

**Import shortcuts:**
```
Ctrl+Shift+P > Launcher: Import Shortcuts (JSON)
```

## Tips & Tricks

### 1. Use Icons
Make shortcuts easier to identify with icons:
```json
{
  "icon": "browser"  // VS Code icon name
}
```

Common icons: `browser`, `terminal`, `folder`, `file`, `rocket`, `gear`, `book`, `package`

### 2. Platform-Specific Shortcuts
Create shortcuts that only appear on specific platforms:
```json
{
  "platform": "win"  // Only on Windows
}
```

### 3. Context Variables
Use variables for dynamic paths:
- `${file}` - Current file
- `${workspaceFolder}` - Project root
- `${relativeFile}` - Relative path
- `${lineNumber}` - Current line
- `${selectedText}` - Selected text

### 4. Custom Keybindings
Add keyboard shortcuts in `keybindings.json`:
```json
{
  "key": "ctrl+alt+b",
  "command": "launcher.run",
  "args": "open-browser"
}
```

### 5. Auto-Discovery
Enable automatic detection of installed apps:
```json
{
  "launcher.enableAutoDiscover": true
}
```

This automatically adds shortcuts for Chrome, Office, Git Bash, and more!

## Troubleshooting

### Shortcut Doesn't Appear
- Check if `platform` matches your OS
- Verify `when` condition is met
- Check if `profile` matches active profile
- Refresh tree view: `Launcher: Rescan Auto-Discovered Apps`

### Program Not Found
- Use absolute paths: `C:\\Program Files\\...`
- Check if program is in PATH
- Verify program name and location

### Variables Not Working
- Ensure file is open for `${file}`
- Check workspace is open for `${workspaceFolder}`
- Variables are case-sensitive

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [examples/](examples/) folder for more configurations
- Join discussions on [GitHub](https://github.com/PutraAdiJaya/any-launcher-plus)
- Report issues or request features

## Getting Help

- **Documentation**: See README.md
- **Examples**: Check examples/ folder
- **Issues**: https://github.com/PutraAdiJaya/any-launcher-plus/issues
- **Discussions**: https://github.com/PutraAdiJaya/any-launcher-plus/discussions

---

Happy launching! 🚀
