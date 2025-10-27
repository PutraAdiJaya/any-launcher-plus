# My Shortcuts Group Feature

## Overview

The **"My Shortcuts"** group is a special category that automatically displays all your custom shortcuts (shortcuts that are not part of the built-in defaults).

## Features

### 🎨 Visual Design
- **Position**: Appears right below "Favorites" group
- **Icon**: ✨ Sparkle icon
- **Color**: Strong pink/magenta color for high visibility
- **Auto-detection**: Automatically identifies custom shortcuts

### 📍 Location in Tree View

```
🚀 Launcher Plus
├── ⭐ Favorites (if any pinned)
├── ✨ My Shortcuts (your custom shortcuts)
├── 🚀 Deployment
├── 🔧 Development
├── 🔀 Git & Version Control
├── 🐳 Docker & Containers
└── ... (other categories)
```

## How It Works

### Automatic Detection
The extension automatically detects which shortcuts are custom by comparing against the built-in `DEFAULT_SHORTCUTS`:

```typescript
// Custom shortcuts = All shortcuts - Default shortcuts
const customShortcuts = shortcuts.filter(s => !defaultIds.has(s.id));
```

### What Counts as Custom?
A shortcut is considered "custom" if:
- ✅ It's defined in `.vscode/launcher-putra.json`
- ✅ It's defined in global `launcher-putra.json`
- ✅ It's defined in VS Code settings (`launcher.shortcuts`)
- ✅ Its ID is NOT in the built-in defaults list

### What's NOT Custom?
- ❌ Built-in shortcuts (npm, git, docker, etc.)
- ❌ Auto-discovered shortcuts (Chrome, Edge, Explorer, etc.)
- ❌ Even if auto-discovered shortcuts are not in defaults, they won't appear in "My Shortcuts"

**Important**: Only shortcuts from **user JSON files** appear in "My Shortcuts", not auto-discovered applications.

## Examples

### Example 1: Simple Custom Shortcut
```json
// .vscode/launcher-putra.json
[
  {
    "id": "my-deploy",
    "label": "Deploy to Production",
    "program": "cmd.exe",
    "args": ["/c", "deploy.bat"],
    "icon": "rocket"
  }
]
```
**Result**: Appears in "My Shortcuts" group with pink sparkle icon

### Example 2: Override Default Shortcut
```json
[
  {
    "id": "npm-start",
    "label": "🚀 Custom NPM Start",
    "program": "cmd.exe",
    "args": ["/c", "npm", "run", "dev:custom"],
    "icon": "rocket"
  }
]
```
**Result**: 
- Replaces the default `npm-start` shortcut
- Still appears in "Development" category (not "My Shortcuts")
- Because it has the same ID as a default

### Example 3: Multiple Custom Shortcuts
```json
[
  {
    "id": "custom-build",
    "label": "Custom Build Script",
    "program": "",
    "args": ["node", "scripts/build.js"],
    "icon": "tools"
  },
  {
    "id": "open-docs",
    "label": "Open Documentation",
    "program": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "args": ["http://localhost:4000/docs"],
    "icon": "book"
  },
  {
    "id": "ssh-staging",
    "label": "SSH to Staging Server",
    "program": "cmd.exe",
    "args": ["/c", "ssh", "user@staging.example.com"],
    "icon": "lock"
  }
]
```
**Result**: All three appear in "My Shortcuts" group

## Visual Appearance

### Group Header
```
✨ My Shortcuts                    3 items
```
- Pink sparkle icon
- Shows count of custom shortcuts
- Collapsed by default (click to expand)

### Individual Shortcuts
Each custom shortcut in the group displays:
- Pink sparkle icon (if no custom icon specified)
- Shortcut label
- Play button (▶️) to execute
- Pin button (📌) to add to favorites

## Benefits

### 1. Easy Identification
Quickly see which shortcuts are yours vs built-in defaults

### 2. Organization
All your custom shortcuts in one place

### 3. Visual Distinction
Strong pink color makes them stand out

### 4. Quick Access
Located near the top (below Favorites)

### 5. No Configuration
Automatically detected and grouped

## Use Cases

### Project-Specific Commands
```json
{
  "id": "run-migrations",
  "label": "Run Database Migrations",
  "program": "",
  "args": ["npm", "run", "migrate"],
  "icon": "database"
}
```

### Deployment Scripts
```json
{
  "id": "deploy-staging",
  "label": "Deploy to Staging",
  "program": "cmd.exe",
  "args": ["/c", "scripts\\deploy-staging.bat"],
  "icon": "cloud-upload"
}
```

### Custom Tools
```json
{
  "id": "open-figma",
  "label": "Open Figma Design",
  "program": "C:\\Program Files\\Figma\\Figma.exe",
  "args": [],
  "icon": "paintcan"
}
```

### Team Workflows
```json
{
  "id": "team-standup",
  "label": "Open Team Standup Board",
  "program": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "args": ["https://team.example.com/standup"],
  "icon": "organization"
}
```

## Tips

### 1. Use Descriptive Labels
```json
// ✅ Good
"label": "Deploy to Production Server"

// ❌ Less clear
"label": "Deploy"
```

### 2. Add Custom Icons
```json
{
  "id": "my-command",
  "label": "My Command",
  "icon": "star"  // Use VS Code icon names
}
```

### 3. Group Related Commands
Create multiple related custom shortcuts:
```json
[
  {"id": "test-unit", "label": "Run Unit Tests", ...},
  {"id": "test-integration", "label": "Run Integration Tests", ...},
  {"id": "test-e2e", "label": "Run E2E Tests", ...}
]
```

### 4. Pin Frequently Used
Pin your most-used custom shortcuts to Favorites for even quicker access

## Troubleshooting

### My custom shortcut doesn't appear in "My Shortcuts"
**Possible reasons**:
1. The shortcut ID matches a default shortcut
   - **Solution**: Use a unique ID
2. The shortcut is filtered by platform/profile
   - **Solution**: Check `platform` and `profile` settings
3. The JSON file has syntax errors
   - **Solution**: Validate JSON syntax

### Custom shortcut appears in wrong category
If your custom shortcut has an ID that matches a default:
```json
// This will appear in "Development", not "My Shortcuts"
{
  "id": "npm-start",  // Same as default
  "label": "Custom Start",
  ...
}
```
**Solution**: Use a unique ID like `custom-npm-start`

### Group doesn't appear
The "My Shortcuts" group only appears if you have at least one custom shortcut.

**Solution**: Add a custom shortcut to `.vscode/launcher-putra.json`

## Technical Details

### Detection Algorithm
```typescript
// 1. Get all default shortcut IDs
const defaultIds = new Set(DEFAULT_SHORTCUTS.map(s => s.id));

// 2. Filter shortcuts not in defaults
const customShortcuts = shortcuts.filter(s => !defaultIds.has(s.id));

// 3. Create group if any custom shortcuts found
if (customShortcuts.length > 0) {
  groups.push(new GroupItem('My Shortcuts', customShortcuts, 'custom'));
}
```

### Group Properties
- **Type**: `custom`
- **Icon**: `sparkle`
- **Color**: `charts.pink`
- **Collapse State**: `Collapsed` (by default)
- **Position**: After "Favorites", before other categories

## Related Features

- **Favorites**: Pin any shortcut (custom or default) to Favorites
- **Default Shortcuts**: 50+ built-in shortcuts
- **Override System**: Replace defaults with custom versions
- **Smart Categorization**: Automatic grouping by type

## See Also

- [CUSTOM_SHORTCUTS_GUIDE.md](CUSTOM_SHORTCUTS_GUIDE.md) - Complete guide
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick lookup
- [examples/custom-shortcuts-template.json](examples/custom-shortcuts-template.json) - Examples

---

**Version**: 1.4.0+  
**Feature**: My Shortcuts Group  
**Status**: ✅ Active
