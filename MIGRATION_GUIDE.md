# Migration Guide: Moving to Built-in Default Shortcuts

## What Changed?

Starting from version **1.4.0**, Launcher Plus includes **built-in default shortcuts**. You no longer need to maintain a large JSON file with all the common shortcuts.

## Benefits

✅ **Cleaner config files** - Only store your custom shortcuts  
✅ **Automatic updates** - Default shortcuts get updated with the extension  
✅ **No duplicates** - Smart merging prevents ID conflicts  
✅ **Faster loading** - Less file I/O operations  

## Migration Steps

### Step 1: Backup Your Current Config

Before making changes, backup your existing configuration:

**Windows:**
```cmd
copy .vscode\launcher-putra.json .vscode\launcher-putra.json.backup
```

**macOS/Linux:**
```bash
cp .vscode/launcher-putra.json .vscode/launcher-putra.json.backup
```

### Step 2: Identify Your Custom Shortcuts

Open your `.vscode/launcher-putra.json` and identify which shortcuts are:
- ✅ **Custom** (created by you)
- ❌ **Default** (standard commands like npm, git, docker)

### Step 3: Remove Default Shortcuts

Remove these default shortcut IDs from your JSON file:

#### Terminal & Shell
- `cmd`, `powershell`, `wsl`, `git-bash`

#### System Tools
- `explorer-here`, `task-manager`

#### NPM Commands
- `npm-install`, `npm-start`, `npm-test`, `npm-run-dev`, `npm-run-build`

#### Yarn Commands
- `yarn-install`

#### Git Commands
- `git-status`, `git-log`

#### Browsers & Dev Tools
- `chrome-dev`, `localhost-3000`, `localhost-8080`

#### Docker
- `docker-desktop`, `docker-compose-up`, `docker-compose-down`

#### Python
- `python-main`, `python-repl`, `django-runserver`

#### Go
- `go-run-main`, `go-build`, `go-test`

#### Rust
- `cargo-run`, `cargo-build`, `cargo-test`

#### Java
- `mvn-clean-install`, `mvn-test`, `gradle-build`, `gradle-test`

#### .NET
- `dotnet-run`, `dotnet-build`, `dotnet-test`

#### Make
- `make`, `make-clean`

#### Network
- `port-check`

### Step 4: Keep Only Custom Shortcuts

Your final JSON should only contain shortcuts that are:
- Specific to your project
- Custom commands you created
- Modified versions of defaults (with same ID to override)

**Example Before:**
```json
[
  {
    "id": "npm-start",
    "label": "npm start",
    "program": "cmd.exe",
    "args": ["/c", "npm", "start"],
    ...
  },
  {
    "id": "my-deploy-script",
    "label": "Deploy to Production",
    "program": "cmd.exe",
    "args": ["/c", "deploy.bat"],
    ...
  },
  {
    "id": "git-status",
    "label": "Git Status",
    ...
  }
]
```

**Example After:**
```json
[
  {
    "id": "my-deploy-script",
    "label": "Deploy to Production",
    "program": "cmd.exe",
    "args": ["/c", "deploy.bat"],
    "cwd": "${workspaceFolder}",
    "platform": "win",
    "icon": "rocket"
  }
]
```

### Step 5: Test Your Configuration

1. Reload VS Code window (`Ctrl+Shift+P` → "Reload Window")
2. Open Launcher Plus (`Ctrl+Alt+L`)
3. Verify:
   - ✅ All default shortcuts are available
   - ✅ Your custom shortcuts appear
   - ✅ No duplicate warnings in console

## Overriding Default Shortcuts

If you want to customize a default shortcut, keep it in your JSON with the **same ID**:

```json
[
  {
    "id": "npm-start",
    "label": "🚀 Start Dev Server (Custom)",
    "program": "cmd.exe",
    "args": ["/c", "npm", "run", "dev:custom"],
    "cwd": "${workspaceFolder}",
    "platform": "win",
    "icon": "rocket"
  }
]
```

This will **replace** the default `npm-start` with your version.

## Automated Migration Script

For large configurations, you can use this Node.js script to automatically remove defaults:

```javascript
const fs = require('fs');

const DEFAULT_IDS = [
  'cmd', 'powershell', 'wsl', 'git-bash',
  'explorer-here', 'task-manager',
  'node-repl', 'python-repl',
  'npm-install', 'npm-start', 'npm-test', 'npm-run-dev', 'npm-run-build',
  'yarn-install',
  'git-status', 'git-log',
  'chrome-dev', 'localhost-3000', 'localhost-8080',
  'docker-desktop', 'docker-compose-up', 'docker-compose-down',
  'python-main', 'django-runserver',
  'go-run-main', 'go-build', 'go-test',
  'cargo-run', 'cargo-build', 'cargo-test',
  'mvn-clean-install', 'mvn-test', 'gradle-build', 'gradle-test',
  'dotnet-run', 'dotnet-build', 'dotnet-test',
  'make', 'make-clean',
  'port-check'
];

const configPath = '.vscode/launcher-putra.json';
const shortcuts = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const customShortcuts = shortcuts.filter(s => !DEFAULT_IDS.includes(s.id));

fs.writeFileSync(configPath, JSON.stringify(customShortcuts, null, 2));
console.log(`✅ Migrated! Kept ${customShortcuts.length} custom shortcuts.`);
```

Save as `migrate-shortcuts.js` and run:
```bash
node migrate-shortcuts.js
```

## Troubleshooting

### "I don't see my shortcuts anymore"
- Check if you accidentally removed custom shortcuts
- Restore from backup: `launcher-putra.json.backup`

### "I see duplicate shortcuts"
- Check console for warnings about duplicate IDs
- Ensure your custom shortcuts have unique IDs

### "Default shortcuts are missing"
- Verify extension version is 1.4.0 or higher
- Reload VS Code window
- Check extension is activated (look for "Launcher Plus" in sidebar)

## Rollback

If you want to go back to the old way:

1. Restore your backup:
   ```cmd
   copy .vscode\launcher-putra.json.backup .vscode\launcher-putra.json
   ```

2. Downgrade extension to version 1.3.0 or earlier

## Questions?

- 📖 Read [CUSTOM_SHORTCUTS_GUIDE.md](./CUSTOM_SHORTCUTS_GUIDE.md)
- 🐛 Report issues on [GitHub](https://github.com/PutraAdiJaya/any-launcher-plus/issues)
- 💬 Ask questions in Discussions
