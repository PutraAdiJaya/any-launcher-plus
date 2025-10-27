# Custom Shortcuts Guide

## Overview

Launcher Plus now comes with **built-in default shortcuts** for common development tasks. You only need to add your custom shortcuts to the JSON configuration file.

## How It Works

### 1. Default Shortcuts (Built-in)
All default shortcuts are now defined in the extension code. These include:
- **Terminal & Shell**: cmd, PowerShell, WSL, Git Bash
- **System Tools**: Explorer, Task Manager
- **NPM Commands**: install, start, test, dev, build
- **Git Commands**: status, log
- **Docker**: Docker Desktop, docker-compose
- **Language-specific**: Python, Go, Rust, Java, .NET, etc.
- **Browsers**: Chrome with dev tools, localhost shortcuts
- **Network**: Port checking utilities

### 2. Custom Shortcuts (User-defined)
You can add your own shortcuts in two locations:

#### Workspace-specific (`.vscode/launcher-putra.json`)
```json
[
  {
    "id": "my-custom-command",
    "label": "🎯 My Custom Command",
    "program": "cmd.exe",
    "args": ["/c", "echo", "Hello World!", "&", "pause"],
    "cwd": "${workspaceFolder}",
    "platform": "win",
    "icon": "star"
  }
]
```

#### Global (User-level)
- **Windows**: `%APPDATA%\Code\User\launcher-putra.json`
- **macOS**: `~/Library/Application Support/Code/User/launcher-putra.json`
- **Linux**: `~/.config/Code/User/launcher-putra.json`

## Duplicate Prevention

The extension automatically prevents duplicate shortcut IDs:
- **User shortcuts take priority** over default shortcuts
- If you define a shortcut with the same ID as a default, your version will be used
- Duplicate IDs within user shortcuts are detected and warned

## Example: Override Default Shortcut

To customize a default shortcut, create one with the same ID:

```json
[
  {
    "id": "npm-start",
    "label": "🚀 My Custom NPM Start",
    "program": "cmd.exe",
    "args": ["/c", "npm", "run", "start:dev", "&", "pause"],
    "cwd": "${workspaceFolder}",
    "platform": "win",
    "icon": "rocket"
  }
]
```

This will replace the default `npm-start` shortcut with your custom version.

## Shortcut Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| `id` | string | Unique identifier | ✅ Yes |
| `label` | string | Display name | ✅ Yes |
| `program` | string | Executable path (empty = default handler) | No |
| `args` | string[] | Command arguments | No |
| `cwd` | string | Working directory | No |
| `platform` | string | Platform filter: `win`, `mac`, `linux` | No |
| `icon` | string | VS Code icon name | No |
| `env` | object | Environment variables | No |
| `when` | string | Condition (e.g., `resourceLangId == python`) | No |

## Variables

You can use these variables in `program`, `args`, and `cwd`:

- `${workspaceFolder}` - Current workspace folder
- `${file}` - Current file path
- `${relativeFile}` - Relative file path
- `${selectedText}` - Selected text in editor
- `${lineNumber}` - Current line number

## Example Custom Shortcuts

### Run Python Script
```json
{
  "id": "run-my-script",
  "label": "Run My Script",
  "program": "",
  "args": ["python", "scripts/my_script.py"],
  "cwd": "${workspaceFolder}",
  "icon": "play"
}
```

### Open Project in Browser
```json
{
  "id": "open-project-browser",
  "label": "Open Project in Browser",
  "program": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "args": ["http://localhost:5000"],
  "icon": "browser"
}
```

### Custom Git Command
```json
{
  "id": "git-push-force",
  "label": "Git Push Force",
  "program": "cmd.exe",
  "args": ["/c", "git", "push", "--force-with-lease", "&", "pause"],
  "cwd": "${workspaceFolder}",
  "icon": "git-commit"
}
```

### SSH to Server
```json
{
  "id": "ssh-production",
  "label": "SSH to Production",
  "program": "cmd.exe",
  "args": ["/c", "ssh", "user@production-server.com"],
  "icon": "lock"
}
```

## Tips

1. **Start with defaults**: Try the built-in shortcuts first
2. **Only add what you need**: Keep your JSON file minimal
3. **Use meaningful IDs**: Make them descriptive and unique
4. **Test your shortcuts**: Use the "Launcher Plus: Open Shortcuts" command
5. **Check for duplicates**: The extension will warn you about duplicate IDs

## Migration from Old Config

If you have an existing `.vscode/launcher-putra.json` with all the default shortcuts:

1. **Backup your file** (just in case)
2. **Remove all default shortcuts** that match the built-in ones
3. **Keep only your custom shortcuts**
4. The extension will automatically merge them with defaults

## Need Help?

- Check the [README.md](./README.md) for general usage
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- Open an issue on GitHub for bugs or feature requests
