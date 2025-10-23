# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Essential Build Commands
```bash
# Install dependencies
npm install

# Compile TypeScript (development)
npm run compile

# Watch mode for development
npm run watch

# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check

# Package extension (.vsix file)
npm run package

# Clean build artifacts
npm run clean

# Full build pipeline
npm run prebuild && npm run build
```

### Testing Commands
```bash
# Run tests (currently placeholder)
npm test

# Manual testing checklist available in PROJECT_SUMMARY.md
```

### Publishing Commands
```bash
# Publish to Open VSX Registry
npm run publish:ovsx

# Publish to VS Code Marketplace  
npm run publish:vsce
```

## Architecture Overview

### Core Structure
This is a VS Code extension (`any-launcher-plus`) written in TypeScript that provides shortcut management functionality for launching applications, running scripts, and opening documents.

**Single-file Architecture**: The entire extension logic is contained in `src/extension.ts` (~700 lines), making it straightforward to understand and modify.

### Key Components

#### 1. Shortcut Type System
- **Primary Type**: `Shortcut` interface with properties for `id`, `label`, `program`, `args`, `cwd`, `env`, `platform`, `icon`, `sequence`, `profile`, etc.
- **Multi-Editor Support**: Automatically detects VS Code variants (Cursor, Windsurf, Kiro) and loads appropriate settings files
- **Context Variables**: Dynamic resolution of `${file}`, `${workspaceFolder}`, `${relativeFile}`, `${lineNumber}`, `${selectedText}`

#### 2. Configuration Management
- **Settings Loading**: Combines VS Code settings (`launcher.shortcuts`) with editor-specific JSON files
- **Editor-Specific Files**: 
  - VS Code: `.vscode/launcher-putra.json`
  - Cursor: `.cursor/launcher-putra.json`
  - Windsurf: `.windsurf/launcher-putra.json`
  - Kiro: `.kiro/launcher-putra.json`

#### 3. Execution Engine
- **Double-click Prevention**: 1-second cooldown system with global state tracking
- **Program Verification**: Built-in validation with Windows program location database
- **Auto-fix Suggestions**: Intelligent path correction for common applications
- **Sequence Support**: Serial and parallel execution of multiple commands

#### 4. User Interface Components
- **Tree View Provider**: Explorer sidebar integration showing shortcuts hierarchy
- **Quick Pick Interface**: Command palette integration (Ctrl+Alt+L)
- **Webview Editor**: Visual shortcut configuration interface
- **Validation Reports**: Webview-based program verification results

### Platform Support Strategy
- **Windows-First**: Extensive Windows program location database (`WINDOWS_PROGRAM_LOCATIONS`)
- **Cross-Platform**: Conditional platform checks for macOS and Linux
- **OS Default Handler**: Empty program field uses OS default application

## Development Guidelines

### Code Patterns
- **Configuration Loading**: Always check both settings and editor-specific JSON files
- **Variable Resolution**: Use `resolveVars()` function for all dynamic content
- **Platform Checks**: Use `platformOk()` for conditional shortcuts
- **Error Handling**: Graceful degradation with user-friendly messages

### Adding New Features
1. **Extend Shortcut Type**: Add new properties to the `Shortcut` interface
2. **Update Settings Schema**: Modify `package.json` configuration section
3. **Handle in Execution**: Update `runShortcut()` function for new behavior
4. **UI Integration**: Add to tree view, quick pick, or webview as needed

### Editor Variant Detection
The extension automatically detects the running editor variant using `detectVariant()` and adjusts behavior accordingly. When adding new editor support:
1. Add detection logic in the variant detection function
2. Update folder mapping in `loadEditorSpecificShortcuts()`
3. Add to `getEditorSettingsPath()` function

### Testing Strategy
- **Manual Testing**: Comprehensive checklist in `PROJECT_SUMMARY.md`
- **Multi-Editor**: Test in VS Code, Cursor, and Windsurf
- **Cross-Platform**: Windows, macOS, Linux validation
- **Configuration Loading**: Test both settings and JSON file sources

## Important Files

### Configuration Files
- **package.json**: Extension manifest with commands, settings, and UI contributions
- **tsconfig.json**: TypeScript configuration (ES2020 target, strict mode)
- **eslint.config.js**: ESLint configuration with TypeScript support

### Documentation
- **README.md**: Comprehensive user documentation with examples
- **PROJECT_SUMMARY.md**: Detailed project overview and development guide
- **QUICKSTART.md**: 5-minute getting started guide
- **CONTRIBUTING.md**: Contribution guidelines and development setup

### Examples
- **examples/windows_basic.json**: Basic Windows shortcut examples
- **examples/profiles_ops_dev.json**: Profile-based shortcut examples
- **examples/nested_sequence_mix.json**: Complex sequence execution examples

## Key Implementation Details

### Variable Resolution System
Context variables are resolved through `pickContext()` which gathers:
- Current file path and workspace information
- Selected text and cursor position
- Relative file paths for workspace-aware operations

### Program Verification Cache
- **Performance**: 1-minute cache for program existence checks
- **Fallback Strategy**: Optimistic approach - assumes programs exist if verification fails
- **Auto-fix Database**: Comprehensive Windows program location mappings

### Multi-Command Execution
- **Sequence Mode**: Serial (default) or parallel execution
- **Nested Support**: Shortcuts can reference other shortcuts by ID
- **Error Handling**: Individual command failures don't stop sequence execution

## Security Considerations
- **Admin Elevation**: `runAsAdmin` flag shows warning but doesn't implement elevation
- **Path Validation**: Always verify program paths before execution
- **Workspace Trust**: Be cautious with shortcuts from untrusted workspaces
- **Environment Variables**: Secure handling of custom environment variables

## Extension Points for WARP
- **Configuration Files**: Focus on JSON files in editor-specific folders (`.cursor/`, `.windsurf/`, etc.)
- **Main Logic**: Single TypeScript file makes the codebase easy to understand and modify
- **Settings Integration**: VS Code settings system for user preferences
- **Command System**: Rich command palette integration with 12+ registered commands