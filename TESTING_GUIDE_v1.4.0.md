# Testing Guide: v1.4.0 Built-in Default Shortcuts

## Overview

This guide provides comprehensive testing procedures for the v1.4.0 release featuring built-in default shortcuts.

---

## 🧪 Test Categories

### 1. Unit Tests
### 2. Integration Tests
### 3. User Acceptance Tests
### 4. Performance Tests
### 5. Regression Tests

---

## 1️⃣ Unit Tests

### Test 1.1: Default Shortcuts Loading
**Objective**: Verify DEFAULT_SHORTCUTS constant is properly defined

**Steps**:
1. Open `src/extension.ts`
2. Locate `DEFAULT_SHORTCUTS` constant
3. Verify it contains 50+ shortcuts
4. Check each shortcut has required fields: `id`, `label`

**Expected Result**:
- ✅ Constant exists
- ✅ Contains 50+ shortcuts
- ✅ All shortcuts have valid structure

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test 1.2: Duplicate Detection
**Objective**: Verify duplicate ID detection works

**Steps**:
1. Create test shortcuts with duplicate IDs
2. Call `getConfigShortcuts()`
3. Check console for warnings
4. Verify only first occurrence is kept

**Expected Result**:
- ✅ Warning logged for duplicates
- ✅ Only first occurrence in final list
- ✅ No crashes or errors

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test 1.3: Priority System
**Objective**: Verify user shortcuts override defaults

**Steps**:
1. Create custom shortcut with ID `npm-start`
2. Load shortcuts
3. Verify custom version is used, not default

**Expected Result**:
- ✅ Custom shortcut appears
- ✅ Default shortcut is skipped
- ✅ No duplicate in final list

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 2️⃣ Integration Tests

### Test 2.1: Tree View Display
**Objective**: Verify all shortcuts appear in tree view

**Steps**:
1. Open VS Code
2. Activate Launcher Plus extension
3. Open tree view in Explorer sidebar
4. Verify default shortcuts appear
5. Verify custom shortcuts appear

**Expected Result**:
- ✅ Tree view loads successfully
- ✅ All default shortcuts visible
- ✅ Custom shortcuts visible
- ✅ Proper categorization

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test 2.2: Quick Pick Integration
**Objective**: Verify shortcuts work in Quick Pick

**Steps**:
1. Press `Ctrl+Alt+L`
2. Verify Quick Pick opens
3. Check default shortcuts appear
4. Check custom shortcuts appear
5. Search for specific shortcut

**Expected Result**:
- ✅ Quick Pick opens
- ✅ All shortcuts listed
- ✅ Search works correctly
- ✅ Icons display properly

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test 2.3: Shortcut Execution
**Objective**: Verify shortcuts execute correctly

**Test Cases**:

#### 2.3.1: Terminal Shortcuts
- [ ] `cmd` - Opens Command Prompt
- [ ] `powershell` - Opens PowerShell
- [ ] `wsl` - Opens WSL
- [ ] `git-bash` - Opens Git Bash

#### 2.3.2: NPM Shortcuts
- [ ] `npm-install` - Runs npm install
- [ ] `npm-start` - Runs npm start
- [ ] `npm-test` - Runs npm test
- [ ] `npm-run-dev` - Runs npm run dev
- [ ] `npm-run-build` - Runs npm run build

#### 2.3.3: Git Shortcuts
- [ ] `git-status` - Shows git status
- [ ] `git-log` - Shows git log

#### 2.3.4: Docker Shortcuts
- [ ] `docker-desktop` - Opens Docker Desktop
- [ ] `docker-compose-up` - Runs docker-compose up
- [ ] `docker-compose-down` - Runs docker-compose down

#### 2.3.5: System Tools
- [ ] `explorer-here` - Opens Explorer
- [ ] `task-manager` - Opens Task Manager

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test 2.4: Custom Shortcuts
**Objective**: Verify custom shortcuts work

**Steps**:
1. Create `.vscode/launcher-putra.json`
2. Add custom shortcut
3. Reload VS Code
4. Verify custom shortcut appears
5. Execute custom shortcut

**Expected Result**:
- ✅ Custom shortcut loads
- ✅ Appears in tree view
- ✅ Executes correctly
- ✅ No conflicts with defaults

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test 2.5: Override Mechanism
**Objective**: Verify overriding defaults works

**Steps**:
1. Create custom shortcut with ID `npm-start`
2. Modify label and command
3. Reload VS Code
4. Verify custom version appears
5. Execute and verify custom command runs

**Expected Result**:
- ✅ Custom version appears
- ✅ Default version not shown
- ✅ Custom command executes
- ✅ No duplicate warnings

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 3️⃣ User Acceptance Tests

### Test 3.1: First-Time User Experience
**Objective**: Verify zero-configuration experience

**Steps**:
1. Install extension fresh
2. Open VS Code (no workspace)
3. Open Launcher Plus
4. Verify default shortcuts available

**Expected Result**:
- ✅ Extension activates
- ✅ 50+ shortcuts available
- ✅ No configuration needed
- ✅ All shortcuts work

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test 3.2: Migration from v1.3.0
**Objective**: Verify smooth migration

**Steps**:
1. Start with v1.3.0 config (large JSON)
2. Update to v1.4.0
3. Verify all shortcuts still work
4. Follow migration guide
5. Remove default shortcuts from JSON
6. Verify shortcuts still work

**Expected Result**:
- ✅ Backward compatible
- ✅ No data loss
- ✅ Migration guide works
- ✅ Cleaner config after migration

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test 3.3: Documentation Clarity
**Objective**: Verify documentation is helpful

**Steps**:
1. Read CUSTOM_SHORTCUTS_GUIDE.md
2. Follow examples
3. Read MIGRATION_GUIDE.md
4. Follow migration steps
5. Check QUICK_REFERENCE.md

**Expected Result**:
- ✅ Documentation clear
- ✅ Examples work
- ✅ Migration successful
- ✅ Quick reference helpful

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 4️⃣ Performance Tests

### Test 4.1: Loading Time
**Objective**: Measure extension activation time

**Steps**:
1. Close VS Code
2. Open VS Code with extension
3. Measure time to activation
4. Compare with v1.3.0

**Expected Result**:
- ✅ Faster than v1.3.0
- ✅ < 100ms activation time
- ✅ No noticeable delay

**Metrics**:
- v1.3.0: _____ ms
- v1.4.0: _____ ms
- Improvement: _____ %

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test 4.2: Memory Usage
**Objective**: Measure memory footprint

**Steps**:
1. Open VS Code
2. Activate extension
3. Check memory usage
4. Compare with v1.3.0

**Expected Result**:
- ✅ Lower than v1.3.0
- ✅ < 10MB memory
- ✅ No memory leaks

**Metrics**:
- v1.3.0: _____ MB
- v1.4.0: _____ MB
- Improvement: _____ %

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test 4.3: Large Configuration
**Objective**: Test with many custom shortcuts

**Steps**:
1. Create 100+ custom shortcuts
2. Load extension
3. Measure loading time
4. Verify all shortcuts work

**Expected Result**:
- ✅ Handles large configs
- ✅ No performance degradation
- ✅ All shortcuts accessible

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 5️⃣ Regression Tests

### Test 5.1: Existing Features
**Objective**: Verify no features broken

**Features to Test**:
- [ ] Pin/Unpin shortcuts
- [ ] Favorites group
- [ ] Smart categorization
- [ ] Terminal integration
- [ ] Auto-discovery
- [ ] Import/Export
- [ ] Visual editor
- [ ] Profile management
- [ ] Sequence execution
- [ ] Context variables

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test 5.2: Platform Compatibility
**Objective**: Verify works on all platforms

**Platforms**:
- [ ] Windows 10
- [ ] Windows 11
- [ ] macOS (Intel)
- [ ] macOS (Apple Silicon)
- [ ] Linux (Ubuntu)
- [ ] Linux (Fedora)

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test 5.3: VS Code Versions
**Objective**: Verify compatibility

**Versions**:
- [ ] VS Code 1.84.0 (minimum)
- [ ] VS Code 1.85.0
- [ ] VS Code 1.86.0
- [ ] VS Code Insiders

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 🐛 Bug Testing

### Known Issues to Verify Fixed
1. [ ] Duplicate icons (emoji + icon field)
2. [ ] PowerShell compatibility
3. [ ] Empty program field handling
4. [ ] Auto-discovery cache issues

---

## 📊 Test Results Summary

### Overall Status
- Total Tests: 25
- Passed: ___
- Failed: ___
- Not Tested: ___
- Pass Rate: ___%

### Critical Issues
List any critical issues found:
1. 
2. 
3. 

### Minor Issues
List any minor issues found:
1. 
2. 
3. 

### Recommendations
List any recommendations:
1. 
2. 
3. 

---

## 🔍 Manual Testing Checklist

### Pre-Release Checklist
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Documentation reviewed
- [ ] Examples tested
- [ ] Migration guide verified
- [ ] Performance acceptable
- [ ] No regressions found
- [ ] Platform compatibility verified
- [ ] VS Code version compatibility verified

### Release Checklist
- [ ] Version updated in package.json
- [ ] CHANGELOG.md updated
- [ ] README.md updated
- [ ] Release notes created
- [ ] GitHub release created
- [ ] VS Code Marketplace published
- [ ] OpenVSX published

---

## 📝 Test Report Template

```markdown
## Test Report: v1.4.0

**Date**: ___________
**Tester**: ___________
**Environment**: ___________

### Summary
- Total Tests: ___
- Passed: ___
- Failed: ___
- Pass Rate: ___%

### Critical Issues
1. 
2. 

### Minor Issues
1. 
2. 

### Performance Metrics
- Loading Time: ___ ms
- Memory Usage: ___ MB
- Activation Time: ___ ms

### Recommendations
1. 
2. 

### Conclusion
[ ] Ready for Release
[ ] Needs More Work
[ ] Blocked by Issues

**Signature**: ___________
```

---

## 🚀 Automated Testing (Future)

### Unit Tests (Jest/Mocha)
```typescript
describe('DEFAULT_SHORTCUTS', () => {
  it('should contain 50+ shortcuts', () => {
    expect(DEFAULT_SHORTCUTS.length).toBeGreaterThanOrEqual(50);
  });

  it('should have unique IDs', () => {
    const ids = DEFAULT_SHORTCUTS.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have required fields', () => {
    DEFAULT_SHORTCUTS.forEach(shortcut => {
      expect(shortcut.id).toBeDefined();
      expect(shortcut.label).toBeDefined();
    });
  });
});

describe('getConfigShortcuts', () => {
  it('should merge defaults with custom', () => {
    // Test implementation
  });

  it('should detect duplicates', () => {
    // Test implementation
  });

  it('should prioritize user shortcuts', () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
describe('Extension Integration', () => {
  it('should activate successfully', async () => {
    // Test implementation
  });

  it('should load all shortcuts', async () => {
    // Test implementation
  });

  it('should execute shortcuts', async () => {
    // Test implementation
  });
});
```

---

## 📞 Support

If you encounter issues during testing:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review [CUSTOM_SHORTCUTS_GUIDE.md](CUSTOM_SHORTCUTS_GUIDE.md)
3. Report on [GitHub Issues](https://github.com/PutraAdiJaya/any-launcher-plus/issues)

---

**Version**: 1.4.0  
**Last Updated**: TBD  
**Status**: 🔄 In Progress
