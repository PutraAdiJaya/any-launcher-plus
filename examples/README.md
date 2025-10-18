# Example Configurations

This folder contains example shortcut configurations for Launcher Plus. Use these as templates or import them directly into your settings.

## 📁 Available Examples

### 1. windows_basic.json
**Basic Windows shortcuts for common tasks**

Features:
- Open file in default app
- Open Downloads folder in Explorer
- Open current file in Chrome

Perfect for: Windows users getting started with Launcher Plus

### 2. profiles_ops_dev.json
**Profile-based shortcuts for different work contexts**

Features:
- Development profile shortcuts (Docker, npm, VS Code)
- Operations profile shortcuts (htop, PowerShell, system tools)
- Demonstrates profile switching
- Shows parallel execution

Perfect for: Users who switch between different work modes

### 3. nested_sequence_mix.json
**Advanced sequence execution with nested steps**

Features:
- Morning routine with multiple apps
- Nested sequences (serial and parallel)
- Complex workflow automation
- Demonstrates all sequence features

Perfect for: Power users who want to automate complex workflows

## 🚀 How to Use

### Method 1: Visual Editor (Recommended)

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run `Launcher: Open Shortcut Editor`
3. Copy the content from an example file
4. Paste into the editor
5. Click "Save"

### Method 2: Import Command

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run `Launcher: Import Shortcuts (JSON)`
3. Select an example file
4. Shortcuts are imported to your User settings

### Method 3: Manual Copy

1. Open an example file
2. Copy the JSON array
3. Open Settings (`Ctrl+,`)
4. Search for "launcher.shortcuts"
5. Click "Edit in settings.json"
6. Paste the shortcuts

## 📝 Customization Tips

### Update Paths
Replace example paths with your actual program locations:

**Before:**
```json
"program": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
```

**After:**
```json
"program": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
```

### Change Icons
Use any VS Code icon name:
```json
"icon": "rocket"      // Rocket icon
"icon": "terminal"    // Terminal icon
"icon": "browser"     // Browser icon
"icon": "folder"      // Folder icon
```

Or use custom image paths:
```json
"icon": "C:\\Users\\YourName\\Pictures\\custom-icon.png"
```

### Add Variables
Use context variables for dynamic paths:
```json
"args": ["${file}"]              // Current file
"args": ["${workspaceFolder}"]   // Workspace root
"args": ["${relativeFile}"]      // Relative path
"cwd": "${workspaceFolder}"      // Working directory
```

### Platform-Specific
Make shortcuts platform-specific:
```json
"platform": "win"    // Windows only
"platform": "mac"    // macOS only
"platform": "linux"  // Linux only
```

## 🎯 Common Use Cases

### Open Current File in Browser
```json
{
  "id": "open-browser",
  "label": "Open in Browser",
  "icon": "browser",
  "program": "",
  "args": ["${file}"]
}
```

### Open Terminal in Workspace
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

### Morning Routine
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

## 🔧 Advanced Features

### Serial Execution
Run commands one after another:
```json
{
  "sequenceMode": "serial",
  "sequence": [
    {"program": "git", "args": ["pull"]},
    {"program": "npm", "args": ["install"]},
    {"program": "npm", "args": ["run", "dev"]}
  ]
}
```

### Parallel Execution
Run commands simultaneously:
```json
{
  "sequenceMode": "parallel",
  "sequence": [
    {"program": "docker-compose", "args": ["up"]},
    {"program": "npm", "args": ["run", "watch"]}
  ]
}
```

### Profile-Based
Filter shortcuts by profile:
```json
{
  "profile": "dev",
  "label": "Development Tools"
}
```

Then set active profile:
```json
{
  "launcher.activeProfile": "dev"
}
```

### Conditional Execution
Run only for specific file types:
```json
{
  "when": "resourceLangId == python",
  "label": "Run Python Script"
}
```

## 📚 More Examples

For more examples and use cases, see:
- [README.md](../README.md) - Main documentation
- [QUICKSTART.md](../QUICKSTART.md) - Quick start guide
- [GitHub Issues](https://github.com/PutraAdiJaya/any-launcher-plus/issues) - Community examples

## 💡 Contributing Examples

Have a great configuration to share? We'd love to include it!

1. Create a new JSON file with your configuration
2. Add a descriptive comment at the top
3. Test it thoroughly
4. Submit a Pull Request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

## ⚠️ Security Note

Before using any example configuration:
- Review all program paths
- Verify arguments are safe
- Remove or update any personal paths
- Test in a safe environment first

See [SECURITY.md](../SECURITY.md) for security best practices.

---

**Need Help?**
- [Quick Start Guide](../QUICKSTART.md)
- [Full Documentation](../README.md)
- [GitHub Issues](https://github.com/PutraAdiJaya/any-launcher-plus/issues)
