# Release Commands - Quick Reference

## 🔨 Build Commands

### Clean Build
```bash
npm run clean
```

### Compile TypeScript
```bash
npm run compile
```

### Watch Mode (Development)
```bash
npm run watch
```

### Package Extension
```bash
npm run package
```
**Output**: `any-launcher-plus-1.4.0.vsix`

---

## 🚀 Publishing Commands

### Publish to VS Code Marketplace
```bash
npm run publish:vsce
```

**Or manually**:
```bash
vsce publish
```

### Publish to OpenVSX
```bash
npm run publish:ovsx
```

**Or manually**:
```bash
ovsx publish any-launcher-plus-1.4.0.vsix
```

---

## 📦 Installation Commands

### Install from VSIX (Local Testing)
```bash
code --install-extension any-launcher-plus-1.4.0.vsix
```

### Install from VS Code Marketplace
```bash
code --install-extension PutraAdiJaya.any-launcher-plus
```

### Install from OpenVSX
```bash
code --install-extension PutraAdiJaya.any-launcher-plus --marketplace https://open-vsx.org
```

### Uninstall
```bash
code --uninstall-extension PutraAdiJaya.any-launcher-plus
```

---

## 🔍 Verification Commands

### List Installed Extensions
```bash
code --list-extensions | findstr launcher
```

### Check Extension Info
```bash
code --list-extensions --show-versions | findstr launcher
```

### View Package Contents
```bash
vsce ls --tree
```

---

## 🐛 Debugging Commands

### Run Extension in Debug Mode
1. Open VS Code
2. Press F5
3. Extension Development Host opens

### View Extension Logs
1. Open Command Palette (Ctrl+Shift+P)
2. Type "Developer: Show Logs"
3. Select "Extension Host"

### Clear Extension Cache
```bash
# Windows
rmdir /s /q "%USERPROFILE%\.vscode\extensions\putraadijaya.any-launcher-plus-*"

# Then reinstall
code --install-extension any-launcher-plus-1.4.0.vsix
```

---

## 📊 Statistics Commands

### Count Lines of Code
```bash
# PowerShell
(Get-Content src\extension.ts).Count
```

### Package Size
```bash
# PowerShell
(Get-Item any-launcher-plus-1.4.0.vsix).Length / 1KB
```

### File Count
```bash
vsce ls | Measure-Object -Line
```

---

## 🔄 Git Commands

### Create Release Tag
```bash
git tag -a v1.4.0 -m "Release v1.4.0 - Built-in Default Shortcuts"
git push origin v1.4.0
```

### Create Release Branch
```bash
git checkout -b release/v1.4.0
git push origin release/v1.4.0
```

### Merge to Main
```bash
git checkout main
git merge release/v1.4.0
git push origin main
```

---

## 📝 Documentation Commands

### Generate Markdown TOC
```bash
# Using markdown-toc (if installed)
markdown-toc README.md
```

### Count Documentation Lines
```bash
# PowerShell
Get-ChildItem *.md | ForEach-Object { (Get-Content $_).Count } | Measure-Object -Sum
```

---

## 🧪 Testing Commands

### Run Linter
```bash
npm run lint
```

### Fix Linting Issues
```bash
npm run lint:fix
```

### Format Code
```bash
npm run format
```

### Check Formatting
```bash
npm run format:check
```

---

## 🔧 Maintenance Commands

### Update Dependencies
```bash
npm update
```

### Check for Outdated Packages
```bash
npm outdated
```

### Audit Security
```bash
npm audit
```

### Fix Security Issues
```bash
npm audit fix
```

---

## 📦 Complete Release Workflow

### Full Release Process
```bash
# 1. Clean and build
npm run clean
npm run compile

# 2. Package
npm run package

# 3. Test locally
code --install-extension any-launcher-plus-1.4.0.vsix

# 4. Publish to VS Code Marketplace
npm run publish:vsce

# 5. Publish to OpenVSX
npm run publish:ovsx

# 6. Create Git tag
git tag -a v1.4.0 -m "Release v1.4.0"
git push origin v1.4.0

# 7. Done!
```

---

## 🚨 Emergency Rollback

### If Release Has Critical Issues

```bash
# 1. Unpublish from marketplace (contact support)
# VS Code Marketplace: https://marketplace.visualstudio.com/manage

# 2. Delete Git tag
git tag -d v1.4.0
git push origin :refs/tags/v1.4.0

# 3. Revert to previous version
git revert HEAD
git push origin main

# 4. Publish hotfix
# Increment to v1.4.1
# Fix issues
# Repeat release process
```

---

## 📞 Support Commands

### Open GitHub Issues
```bash
start https://github.com/PutraAdiJaya/any-launcher-plus/issues
```

### Open Marketplace Page
```bash
start https://marketplace.visualstudio.com/items?itemName=PutraAdiJaya.any-launcher-plus
```

### Open OpenVSX Page
```bash
start https://open-vsx.org/extension/PutraAdiJaya/any-launcher-plus
```

---

**Version**: 1.4.0  
**Status**: Ready for Release  
**Date**: January 15, 2024
