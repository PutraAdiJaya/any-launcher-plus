# 🤝 Contributing to Launcher Plus

Thank you for your interest in contributing to Launcher Plus! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Setup](#-development-setup)
- [Project Structure](#-project-structure)
- [Coding Standards](#-coding-standards)
- [Testing](#-testing)
- [Pull Request Process](#-pull-request-process)
- [Release Process](#-release-process)

## 📜 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code:

- **Be respectful** and inclusive
- **Be collaborative** and constructive
- **Be patient** with newcomers
- **Focus on the issue**, not the person
- **Use welcoming language**

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **VS Code** (for development and testing)
- **Git** (for version control)

### Quick Setup

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/any-launcher-plus.git
   cd any-launcher-plus
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Open** in VS Code:
   ```bash
   code .
   ```

## 🛠️ Development Setup

### Building the Extension

```bash
# Compile TypeScript
npm run compile

# Watch mode (auto-compile on changes)
npm run watch

# Package extension
npm run package

# Clean build artifacts
npm run clean
```

### Testing the Extension

1. **Press F5** in VS Code to launch Extension Development Host
2. **Test features** in the new VS Code window
3. **Check console** for errors and logs
4. **Reload** the extension host when making changes

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## 📁 Project Structure

```
any-launcher-plus/
├── src/
│   └── extension.ts          # Main extension code
├── media/                    # Icons and images
│   ├── icon.png             # Extension icon
│   ├── banner.png           # README banner
│   └── features-diagram.png # Feature diagram
├── examples/                 # Example configurations
├── .vscode/                 # VS Code settings
├── package.json             # Extension manifest
├── README.md               # Main documentation
├── QUICKSTART.md           # Quick start guide
├── CONTRIBUTING.md         # This file
├── SECURITY.md             # Security policy
└── changelog.md            # Version history
```

### Key Files

- **`src/extension.ts`** - Main extension logic
- **`package.json`** - Extension manifest and configuration
- **`README.md`** - User documentation
- **`QUICKSTART.md`** - Getting started guide

## 📝 Coding Standards

### TypeScript Guidelines

- **Use TypeScript** for all code
- **Enable strict mode** in tsconfig.json
- **Add type annotations** for public APIs
- **Use meaningful variable names**
- **Add JSDoc comments** for complex functions

### Code Style

- **Use Prettier** for formatting (configured in `.prettierrc`)
- **Use ESLint** for linting (configured in `.eslintrc`)
- **2 spaces** for indentation
- **Single quotes** for strings
- **Trailing commas** where valid

### Example Code Style

```typescript
/**
 * Detects the group category for a shortcut
 * @param shortcut The shortcut to categorize
 * @returns The group name
 */
private detectGroup(shortcut: Shortcut): string {
  const id = shortcut.id.toLowerCase();
  const label = (shortcut.label || '').toLowerCase();
  
  if (id.includes('ssh') || label.includes('ssh')) {
    return 'ssh';
  }
  
  return 'default';
}
```

### Commit Message Format

Use conventional commits:

```
type(scope): description

feat(shortcuts): add SSH connection shortcuts
fix(ui): resolve color grouping issue
docs(readme): update installation instructions
style(format): apply prettier formatting
refactor(core): simplify shortcut detection logic
test(unit): add tests for group detection
chore(deps): update dependencies
```

## 🧪 Testing

### Manual Testing

1. **Install** the extension in development mode
2. **Test core features**:
   - Tree view display
   - Play button functionality
   - Quick pick (`Ctrl+Alt+L`)
   - Auto-discovery
   - Color grouping
3. **Test edge cases**:
   - Invalid program paths
   - Missing dependencies
   - Different project types
4. **Test cross-platform** (Windows, Mac, Linux)

### Test Scenarios

- [ ] Extension loads without errors
- [ ] Tree view shows shortcuts with correct colors
- [ ] Play buttons execute shortcuts
- [ ] Auto-discovery detects project types
- [ ] Settings files are created/loaded correctly
- [ ] Import/export functionality works
- [ ] Error handling is graceful

## 🔄 Pull Request Process

### Before Submitting

1. **Create feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes** following coding standards

3. **Test thoroughly** on multiple platforms if possible

4. **Update documentation** if needed

5. **Run quality checks**:
   ```bash
   npm run lint
   npm run format:check
   npm run compile
   ```

### PR Requirements

- [ ] **Clear description** of changes
- [ ] **Link to related issue** (if applicable)
- [ ] **Screenshots/GIFs** for UI changes
- [ ] **Testing instructions** for reviewers
- [ ] **Documentation updates** (if needed)
- [ ] **No linting errors**
- [ ] **Builds successfully**

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Windows
- [ ] Tested on macOS
- [ ] Tested on Linux
- [ ] Manual testing completed
- [ ] No regressions found

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings/errors
```

## 🚀 Release Process

### Version Numbering

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0) - Breaking changes
- **MINOR** (1.1.0) - New features (backward compatible)
- **PATCH** (1.1.1) - Bug fixes (backward compatible)

### Release Steps

1. **Update version** in `package.json`
2. **Update changelog** with new features/fixes
3. **Create release tag**:
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```
4. **Build and test** final package
5. **Publish to marketplaces**:
   ```bash
   npm run publish:ovsx
   npm run publish:vsce
   ```

## 🎯 Areas for Contribution

### High Priority

- **🐛 Bug fixes** - Fix reported issues
- **📚 Documentation** - Improve guides and examples
- **🧪 Testing** - Add automated tests
- **🌍 Localization** - Add language support

### Medium Priority

- **✨ New features** - Add requested functionality
- **🎨 UI improvements** - Enhance visual design
- **⚡ Performance** - Optimize speed and memory
- **🔧 Configuration** - Add more customization options

### Ideas for New Features

- **Keyboard shortcuts** for categories
- **Custom themes** for color groups
- **Shortcut templates** library
- **Cloud sync** for configurations
- **Macro recording** functionality
- **Integration** with external tools

## 💬 Getting Help

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and community support
- **Pull Request Reviews** - Code feedback and suggestions

### Questions?

- Check existing [issues](https://github.com/PutraAdiJaya/any-launcher-plus/issues)
- Read the [documentation](README.md)
- Ask in [discussions](https://github.com/PutraAdiJaya/any-launcher-plus/discussions)

## 🙏 Recognition

Contributors will be:

- **Listed** in the README
- **Mentioned** in release notes
- **Credited** in the extension description
- **Appreciated** by the community! 🎉

---

**Thank you for contributing to Launcher Plus!** 

Your efforts help make development workflows better for everyone. 🚀