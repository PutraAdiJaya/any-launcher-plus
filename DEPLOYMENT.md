# 🚀 Deployment Guide - Launcher Plus

This guide is for maintainers who need to deploy Launcher Plus to various marketplaces.

## 📋 Prerequisites

### Required Tools

- **Node.js** (v16+)
- **npm** (v8+)
- **vsce** (VS Code Extension Manager)
- **ovsx** (OpenVSX CLI)

### Install CLI Tools

```bash
# Install vsce for VS Code Marketplace
npm install -g vsce

# Install ovsx for OpenVSX
npm install -g ovsx
```

### Required Tokens

1. **VS Code Marketplace Token**:
   - Go to [Azure DevOps](https://dev.azure.com/)
   - Create Personal Access Token with Marketplace scope
   - Set environment variable: `VSCE_PAT=your_token`

2. **OpenVSX Token**:
   - Go to [OpenVSX](https://open-vsx.org/)
   - Sign in with GitHub
   - Generate Personal Access Token
   - Set environment variable: `OVSX_TOKEN=your_token`

## 🔧 Pre-Deployment Checklist

### 1. Version Management

- [ ] Update version in `package.json`
- [ ] Update version badge in `README.md`
- [ ] Update `CHANGELOG.md` with new features
- [ ] Update `SECURITY.md` supported versions

### 2. Code Quality

```bash
# Run all quality checks
npm run lint
npm run format:check
npm run compile

# Fix any issues
npm run lint:fix
npm run format
```

### 3. Testing

- [ ] Test on Windows
- [ ] Test on macOS  
- [ ] Test on Linux
- [ ] Test in VS Code
- [ ] Test in Cursor
- [ ] Test in Windsurf
- [ ] Verify auto-discovery works
- [ ] Test color grouping
- [ ] Test play buttons

### 4. Documentation

- [ ] README.md is up to date
- [ ] QUICKSTART.md reflects current features
- [ ] Examples are working
- [ ] Screenshots are current

## 📦 Build Process

### 1. Clean Build

```bash
# Clean previous builds
npm run clean

# Fresh install
rm -rf node_modules package-lock.json
npm install

# Compile TypeScript
npm run compile
```

### 2. Package Extension

```bash
# Create .vsix package
npm run package

# Verify package contents
vsce ls
```

### 3. Test Package

```bash
# Install locally for testing
code --install-extension any-launcher-plus-1.1.0.vsix

# Test in clean VS Code instance
code --user-data-dir /tmp/vscode-test --extensions-dir /tmp/vscode-ext
```

## 🚀 Deployment Steps

### Option 1: Automated Deployment

```bash
# Deploy to both marketplaces
npm run publish:ovsx
npm run publish:vsce
```

### Option 2: Manual Deployment

#### Deploy to OpenVSX

```bash
# Login to OpenVSX
ovsx create-namespace PutraAdiJaya

# Publish extension
ovsx publish any-launcher-plus-1.1.0.vsix -p $OVSX_TOKEN
```

#### Deploy to VS Code Marketplace

```bash
# Login to VS Code Marketplace
vsce login PutraAdiJaya

# Publish extension
vsce publish -p $VSCE_PAT
```

## 🏷️ Release Management

### 1. Create Git Tag

```bash
# Create and push tag
git tag v1.1.0
git push origin v1.1.0
```

### 2. GitHub Release

1. Go to [GitHub Releases](https://github.com/PutraAdiJaya/any-launcher-plus/releases)
2. Click "Create a new release"
3. Select the tag `v1.1.0`
4. Title: `Launcher Plus v1.1.0 - Smart Color Grouping`
5. Description: Copy from `CHANGELOG.md`
6. Attach the `.vsix` file
7. Publish release

### 3. Update Documentation

- [ ] Update marketplace descriptions
- [ ] Update GitHub repository description
- [ ] Update social media links
- [ ] Announce on relevant channels

## 📊 Post-Deployment

### 1. Verification

- [ ] Extension appears in VS Code Marketplace
- [ ] Extension appears in OpenVSX
- [ ] Installation works from marketplace
- [ ] All features work in installed version
- [ ] No errors in extension host

### 2. Monitoring

- [ ] Check marketplace analytics
- [ ] Monitor GitHub issues
- [ ] Watch for user feedback
- [ ] Check error reports

### 3. Communication

- [ ] Update README badges
- [ ] Announce on social media
- [ ] Notify contributors
- [ ] Update project status

## 🔄 Rollback Procedure

If issues are discovered after deployment:

### 1. Immediate Actions

```bash
# Unpublish from marketplaces (if critical)
vsce unpublish
ovsx unpublish PutraAdiJaya.any-launcher-plus
```

### 2. Fix and Redeploy

```bash
# Fix the issue
git checkout -b hotfix/critical-fix

# Make minimal fix
# Test thoroughly
# Update version (patch)

# Redeploy
npm run package
npm run publish:ovsx
npm run publish:vsce
```

## 📋 Deployment Environments

### Production

- **VS Code Marketplace**: Primary distribution
- **OpenVSX**: Alternative for VS Code variants
- **GitHub Releases**: Manual downloads

### Staging

- **Local VSIX**: Testing before publication
- **Development Host**: VS Code F5 debugging

## 🔐 Security Considerations

### 1. Token Management

- Store tokens securely (environment variables)
- Rotate tokens regularly
- Use minimal required permissions
- Never commit tokens to repository

### 2. Package Integrity

- Verify package contents before publishing
- Check for sensitive information in package
- Validate all dependencies
- Review auto-generated files

### 3. Access Control

- Limit who can deploy
- Use protected branches
- Require reviews for releases
- Audit deployment activities

## 📈 Analytics & Metrics

### Key Metrics to Track

- **Downloads**: Total and daily downloads
- **Ratings**: User ratings and reviews
- **Issues**: Bug reports and feature requests
- **Usage**: Telemetry data (if implemented)

### Marketplace Analytics

- **VS Code Marketplace**: [Publisher dashboard](https://marketplace.visualstudio.com/manage)
- **OpenVSX**: [Publisher page](https://open-vsx.org/user-settings/namespaces)

## 🆘 Troubleshooting

### Common Issues

#### Publishing Fails

```bash
# Check token validity
vsce verify-pat $VSCE_PAT
ovsx verify-pat $OVSX_TOKEN

# Check package validity
vsce package --allow-star-activation
```

#### Version Conflicts

```bash
# Check existing versions
vsce show PutraAdiJaya.any-launcher-plus
ovsx show PutraAdiJaya.any-launcher-plus
```

#### Package Too Large

```bash
# Check package size
vsce ls

# Exclude unnecessary files in .vscodeignore
echo "*.log" >> .vscodeignore
echo "test/" >> .vscodeignore
```

## 📞 Support Contacts

### Marketplace Support

- **VS Code Marketplace**: [Support](https://aka.ms/vscode-support)
- **OpenVSX**: [GitHub Issues](https://github.com/eclipse/openvsx/issues)

### Internal Contacts

- **Lead Developer**: [@PutraAdiJaya](https://github.com/PutraAdiJaya)
- **Repository**: [any-launcher-plus](https://github.com/PutraAdiJaya/any-launcher-plus)

---

**Last Updated**: 2025-01-24  
**Version**: 1.1.0