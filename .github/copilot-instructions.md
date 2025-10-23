# Copilot instructions — any-launcher-plus

Goal: Help an AI coding agent be productive quickly in this repo (VS Code/Cursor/Windsurf extension that manages shortcuts and launch workflows).

- Project type: TypeScript VS Code extension. Entrypoint: `src/extension.ts` → compiled to `out/extension.js` by `tsc`.
- Build files: `package.json` (scripts), `tsconfig.json`. Packaging helpers in `scripts/build-manifests.js`.

Quick dev commands (use in repo root):
```bash
# install deps
npm install

# compile once
npm run compile

# watch during development (recommended)
npm run watch

# package a .vsix
npm run package

# lint / format checks
npm run lint
npm run format:check
```

Key architecture & components
- Shortcuts model: see `type Shortcut` in `src/extension.ts`. Important fields: `id, label, program, args, cwd, env, platform, when, profile, icon, sequence, sequenceMode`.
- Tree provider: `ShortcutsProvider` populates the Explorer view (`launcher.shortcutsView`) from 3 sources: user settings (`launcher.shortcuts`), editor-specific files (examples: `.vscode/launcher-putra.json`, `.cursor/launcher-putra.json`, `.windsurf/launcher-putra.json`) and auto-discovered shortcuts (OS/app probes).
- Execution engine: `runShortcut` (handles variable resolution, cooldowns, program verification, spawn strategies) and `runSequence` (supports string-referenced steps and inline step objects; `serial` and `parallel`).
- Auto-discovery & caching: `autoDiscoveredShortcuts()`, `autoDiscoveredShells()`, `autoDiscoveredEditors()` with short caches: `autoDiscoveryCache` (30s) and `programVerificationCache` (1m). Be aware of optimistic verification: if not found in known locations, the code often assumes existence and lets spawn fail instead.
- UI helpers: Shortcut editor webview (`ShortcutEditorPanel`) reads/writes `launcher.shortcuts` in User settings and includes a JSON textarea for quick edits.
- Tasks generation: `generateTasksFromShortcuts()` writes/merges `.vscode/tasks.json` with labels prefixed `launcher:{id}`.

Important code patterns & gotchas (copyable examples in repo)
- Variable resolution: `resolveVars(t, ctx)` replaces `${file}`, `${workspaceFolder}`, `${relativeFile}`, `${lineNumber}`, `${selectedText}`. Always use `pickContext()` to build the `ctx` object before resolving.
- Platform-specific launch logic: Windows-only handling for `.msc`/`.cpl` and `ms-settings:` URIs. Admin elevation uses PowerShell `Start-Process -Verb RunAs` (best-effort, may fallback).
- Program verification is intentionally optimistic; many discovery helpers call `fs.existsSync` on known locations, then set cache and push shortcuts. Expect spawn errors (ENOENT) to be handled at runtime; fix paths in settings or editor file.
- When-clause parsing is minimal: `when` supports patterns like `resourceLangId == python` only. Don’t expect full VS Code when-clause support.
- Cooldown & running state: `shortcutCooldowns` and `runningShortcuts` prevent rapid double-launches; cooldowns are short (300ms) and cleared after ~1s.

Files to inspect when working on features / bugs
- `src/extension.ts` — everything lives here (Tree provider, commands, run logic, auto-discovery, editor webview). Start here for runtime behavior and logs.
- `package.json` — contributed commands, activation events (`onStartupFinished`), scripts (compile/watch/package/publish), config schema (`launcher.shortcuts`) and default keybinding `ctrl+alt+L`.
- `scripts/build-manifests.js` — generates `manifest-vscode.json` and `manifest-openvsx.json` from `package.json`.
- `examples/` — sample shortcut JSONs useful for integration/QA (use these for unit test fixtures or manual imports).

Developer debugging checklist
- Run `npm run watch` and open the Extension Development Host in VS Code to iterate quickly.
- Inspect console logs in the Extension Host (the extension extensively logs spawn/strategy details). Search for `[Launcher]` prefixes.
- Use the command palette to run diagnostic helpers present in the extension (e.g. `Launcher Plus: Diagnose App Paths`, `Launcher Plus: Test Launch Strategies`) — these help reproduce platform-specific spawning issues.
- To reproduce launch failures, add a shortcut with a deliberate bad `program` path in `launcher.shortcuts` or in an editor file and use `Launcher: Validate Shortcuts` to trigger validation UI and the webview report.

Small contract / expectations for code changes
- Inputs: `launcher.shortcuts` (User or Workspace), editor-specific JSON files, OS environment (PATH, LOCALAPPDATA).
- Outputs: spawned processes (detached), `.vscode/tasks.json` (optional), UI messages & webview content.
- Error modes: spawn ENOENT / exit codes from child processes; many errors are surfaced to users via `vscode.window.showErrorMessage` and logs.

Examples to copy (from repo)
- Editor-specific settings path: `getEditorSettingsPath()` builds `.vscode|.cursor|.windsurf/launcher-putra.json` depending on detected variant.
- Default shortcut (open with default handler):
```json
{ "id": "open-default", "label": "Open in Default App", "program": "", "args": ["${file}"] }
```

Testing & CI notes
- There are no unit tests in the repo (package.json `test` is a placeholder). Add small integration tests that execute `resolveVars`, `platformOk`, and sequence parsing to gain confidence. Keep tests fast and avoid spawning real GUI apps.
- The repository uses ESLint + Prettier. Run `npm run lint` and `npm run format:check` before PRs.

If something is missing
- Ask for clarification about desired coverage: more examples, CI test harness, or expansion of the `when` parser. I can expand this file with debug patterns, recommended mocks for unit tests, or a short checklist for PR reviewers.

---
Please review and tell me which areas you want expanded (examples, test harness, or CI steps) or any project-internal rules I missed.
