# Deployment Checklist

This document outlines the steps to prepare and deploy Launcher Plus to production.

## Pre-Release Checklist

### Code Quality
- [x] All TypeScript compiles without errors
- [x] ESLint passes with no errors
- [x] Code is formatted with Prettier
- [x] No console.log statements in production code
- [x] All TODO comments addressed or documented

### Testing
- [ ] Extension loads successfully in VS Code
- [ ] Extension loads successfully in Cursor
- [ ] Extension loads successfully in Windsurf
- [ ] All commands work as expected
- [ ] Tree view displays correctly
- [ ] Quick pick interface functions properly
- [ ] Shortcuts execute correctly
- [ ] Import/Export functionality works
- [ ] Profile switching works
- [ ] Sequence execution (serial and parallel) works
- [ ] Auto-discovery detects installed apps
- [ ] Visual editor saves configurations correctly
- [ ] Task generation creates valid tasks.json

### Documentation
- [x] README.md is complete and accurate
- [x] CHANGELOG.md is updated
- [x] All examples are tested and working
- [x] API documentation is current
- [x] Security considerations documented
- [x] Contributing guidelines are clear

### Package Configuration
- [x] package.json version is correct
- [x] Repository URL is set
- [x] Keywords are relevant
- [x] Categories are appropriate
- [x] Icon is included and displays correctly
- [x] License file exists
- [x] .vscodeignore excludes unnecessary files

### Platform Testing
- [ ] Tested on Windows 10/11
- [ ] Tested on macOS (latest)
- [ ] Tested on Linux (Ubuntu/Debian)
- [ ] Path separators work on all platforms
- [ ] Default app opening works on all platforms

## Release Process

### 1. Version Update

```bash
# Update version in package.json
npm version patch  # or minor, or major

# Update CHANGELOG.md with release notes
# Add date and version number
```

### 2. Final Build

```bash
# Clean previous builds
npm run clean

# Install fresh dependencies
rm -rf node_modules package-lock.json
npm install

# Run full build pipeline
npm run lint
npm run format:check
npm run compile
npm run package
```

### 3. Local Testing

```bash
# Install the packaged extension
code --install-extension any-launcher-plus-0.1.0.vsix

# Test in a clean VS Code instance
code --disable-extensions --user-data-dir=/tmp/vscode-test
```

### 4. Create Git Tag

```bash
# Commit all changes
git add .
git commit -m "chore: prepare release v0.1.0"

# Create and push tag
git tag -a v0.1.0 -m "Release version 0.1.0"
git push origin main
git push origin v0.1.0
```

### 5. GitHub Release

The GitHub Actions workflow will automatically:
- Build the extension
- Run tests and linting
- Create a GitHub release
- Upload the .vsix file
- Publish to Open VSX (if token is set)
- Publish to VS Code Marketplace (if token is set)

### 6. Manual Publishing (if needed)

#### Open VSX Registry

```bash
# Set token
export OVSX_TOKEN=your_token_here

# Publish
npm run publish:ovsx
```

#### VS Code Marketplace

```bash
# Set token
export VSCE_PAT=your_token_here

# Publish
npm run publish:vsce
```

## Post-Release

### Verification
- [ ] Extension appears in VS Code Marketplace
- [ ] Extension appears in Open VSX Registry
- [ ] GitHub release is created with .vsix file
- [ ] Version number is correct everywhere
- [ ] Download and install from marketplace works

### Communication
- [ ] Update repository README badges
- [ ] Announce release on relevant channels
- [ ] Update documentation site (if applicable)
- [ ] Respond to user feedback

### Monitoring
- [ ] Check for installation errors
- [ ] Monitor GitHub issues
- [ ] Review marketplace ratings/reviews
- [ ] Track download statistics

## Rollback Procedure

If critical issues are discovered:

1. **Unpublish from Marketplaces**
   ```bash
   # VS Code Marketplace
   vsce unpublish PutraAdiJaya.any-launcher-plus

   # Open VSX
   ovsx unpublish PutraAdiJaya.any-launcher-plus
   ```

2. **Delete GitHub Release**
   - Go to GitHub Releases
   - Delete the problematic release
   - Delete the git tag

3. **Fix Issues**
   - Create hotfix branch
   - Fix critical issues
   - Test thoroughly
   - Release patch version

## Secrets Configuration

### GitHub Secrets Required

1. **OVSX_TOKEN**
   - Get from: https://open-vsx.org/user-settings/tokens
   - Scope: Publish extensions
   - Add to: Repository Settings > Secrets > Actions

2. **VSCE_PAT** (Optional)
   - Get from: https://dev.azure.com/
   - Scope: Marketplace (publish)
   - Add to: Repository Settings > Secrets > Actions

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Clear node_modules and reinstall
- Check for TypeScript errors
- Verify all dependencies are installed

### Publishing Fails
- Verify tokens are valid and not expired
- Check marketplace status pages
- Ensure version number is incremented
- Verify package.json is valid

### Extension Doesn't Load
- Check VS Code version compatibility
- Verify activation events
- Check for runtime errors in Developer Tools
- Test in clean VS Code instance

## Version Strategy

We follow Semantic Versioning (semver):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, backwards compatible

## Support Channels

- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Questions and community support
- Email: Direct support for security issues

---

Last updated: 2025-01-18
