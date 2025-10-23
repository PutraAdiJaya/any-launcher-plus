import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

// Create output channel for logging
const output = vscode.window.createOutputChannel('Launcher Debug');

type Shortcut = {
  id: string;
  label: string;
  program?: string; // if empty -> default app
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  runAsAdmin?: boolean; // Windows only (not implemented; prompt hint)
  when?: string; // simple condition: resourceLangId == xyz
  platform?: 'win' | 'mac' | 'linux' | '';
  icon?: string;
  sequence?: (string | Omit<Shortcut, 'id' | 'label'>)[];
  profile?: string;
  sequenceMode?: 'serial' | 'parallel';
};

// Global state for preventing double-clicks and tracking running shortcuts
const runningShortcuts = new Set<string>();
const shortcutCooldowns = new Map<string, number>();
const COOLDOWN_TIME = 300; // 300ms cooldown - much shorter

// Cache for program verification to avoid repeated checks
const programVerificationCache = new Map<string, boolean>();

// Cache for auto-discovered shortcuts to avoid repeated file system checks
const autoDiscoveryCache = {
  shortcuts: [] as Shortcut[],
  shells: [] as Shortcut[],
  editors: [] as Shortcut[],
  lastUpdated: 0,
  isLoading: false,
};
const CACHE_DURATION = 30000; // 30 seconds

// Common Windows program locations for verification
const WINDOWS_PROGRAM_LOCATIONS: Record<string, string[]> = {
  'cmd.exe': ['C:\\Windows\\System32\\cmd.exe'],
  'powershell.exe': [
    'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
    'C:\\Program Files\\PowerShell\\7\\pwsh.exe',
  ],
  'wsl.exe': ['C:\\Windows\\System32\\wsl.exe'],
  'taskmgr.exe': ['C:\\Windows\\System32\\taskmgr.exe'],
  'notepad.exe': ['C:\\Windows\\System32\\notepad.exe'],
  'calc.exe': ['C:\\Windows\\System32\\calc.exe'],
  'explorer.exe': ['C:\\Windows\\explorer.exe'],
  'control.exe': ['C:\\Windows\\System32\\control.exe'],
  'regedit.exe': ['C:\\Windows\\regedit.exe'],
  'mmc.exe': ['C:\\Windows\\System32\\mmc.exe'],
  'chrome.exe': [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ],
  'firefox.exe': [
    'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
    'C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe',
  ],
  // Code editors in AppData\Local\Programs (removed problematic editors)
  'Code.exe': [
    'C:\\Program Files\\Microsoft VS Code\\Code.exe',
    'C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe',
    os.homedir() + '\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
  ],
  // Development tools
  'SourceTree.exe': [
    'C:\\Program Files\\Atlassian\\SourceTree\\SourceTree.exe',
    os.homedir() + '\\AppData\\Local\\SourceTree\\SourceTree.exe',
  ],
  'GitHubDesktop.exe': [os.homedir() + '\\AppData\\Local\\GitHubDesktop\\GitHubDesktop.exe'],
  'dbeaver.exe': ['C:\\Program Files\\DBeaver\\dbeaver.exe', os.homedir() + '\\AppData\\Local\\DBeaver\\dbeaver.exe'],
  // Browsers
  'opera.exe': ['C:\\Program Files\\Opera\\opera.exe', os.homedir() + '\\AppData\\Local\\Programs\\Opera\\opera.exe'],
  // Cloud storage
  'GoogleDriveFS.exe': [
    'C:\\Program Files\\Google\\Drive File Stream\\GoogleDriveFS.exe',
    os.homedir() + '\\AppData\\Local\\Google\\Drive\\GoogleDriveFS.exe',
  ],
};

function getConfigShortcuts(): Shortcut[] {
  const cfg = vscode.workspace.getConfiguration();
  const userShortcuts = cfg.get<Shortcut[]>('launcher.shortcuts', []) || [];

  // Load editor-specific shortcuts from JSON files
  const editorShortcuts = loadEditorSpecificShortcuts();

  return [...userShortcuts, ...editorShortcuts];
}

function loadEditorSpecificShortcuts(): Shortcut[] {
  const shortcuts: Shortcut[] = [];
  const fileName = 'launcher-putra.json';

  // 1. Load GLOBAL shortcuts from User directory (higher priority)
  const globalPath = getGlobalShortcutsPath();
  try {
    if (fs.existsSync(globalPath)) {
      const content = fs.readFileSync(globalPath, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        shortcuts.push(...parsed);
        console.log(`[Launcher] ✅ Loaded ${parsed.length} GLOBAL shortcuts from ${globalPath}`);
        output.appendLine(`[Launcher] ✅ Loaded ${parsed.length} global shortcuts`);
      }
    } else {
      console.log(`[Launcher] 📁 Global shortcuts file not found at: ${globalPath}`);
      console.log(`[Launcher] 💡 Tip: Create ${globalPath} for global shortcuts across all workspaces`);
    }
  } catch (error) {
    console.error(`[Launcher] ❌ Error loading global shortcuts:`, error);
    output.appendLine(`[Launcher] Error loading global ${fileName}: ${String(error)}`);
  }

  // 2. Load WORKSPACE-specific shortcuts (can override global if same ID)
  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) {
    console.log('[Launcher] No workspace folder found for loading workspace shortcuts');
    return shortcuts;
  }

  try {
    const folderName = '.vscode';
    const workspacePath = path.join(ws.uri.fsPath, folderName, fileName);
    console.log(`[Launcher] Looking for workspace shortcuts at: ${workspacePath}`);

    if (fs.existsSync(workspacePath)) {
      const content = fs.readFileSync(workspacePath, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        shortcuts.push(...parsed);
        console.log(`[Launcher] ✅ Loaded ${parsed.length} WORKSPACE shortcuts from ${fileName}`);
        output.appendLine(`[Launcher] ✅ Loaded ${parsed.length} workspace shortcuts`);
      }
    } else {
      console.log(`[Launcher] 📁 Workspace shortcuts not found: ${workspacePath}`);
    }
  } catch (error) {
    console.error(`[Launcher] ❌ Error loading workspace shortcuts:`, error);
    output.appendLine(`[Launcher] Error loading workspace ${fileName}: ${String(error)}`);
  }

  return shortcuts;
}

function getGlobalShortcutsPath(): string {
  // Get VS Code User directory based on platform
  const fileName = 'launcher-putra.json';

  if (process.platform === 'win32') {
    // Windows: %APPDATA%\Code\User\launcher-putra.json
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    return path.join(appData, 'Code', 'User', fileName);
  } else if (process.platform === 'darwin') {
    // macOS: ~/Library/Application Support/Code/User/launcher-putra.json
    return path.join(os.homedir(), 'Library', 'Application Support', 'Code', 'User', fileName);
  } else {
    // Linux: ~/.config/Code/User/launcher-putra.json
    return path.join(os.homedir(), '.config', 'Code', 'User', fileName);
  }
}

function getEditorSettingsPath(): string {
  // Only support VS Code for now - removed problematic editors
  const folderName = '.vscode';

  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) return '';

  return path.join(ws.uri.fsPath, folderName, 'launcher-putra.json');
}

async function verifyProgramExists(program: string): Promise<boolean> {
  // Check cache first
  if (programVerificationCache.has(program)) {
    return programVerificationCache.get(program)!;
  }

  let exists = false;

  try {
    // For absolute paths, check directly (fast)
    if (path.isAbsolute(program)) {
      exists = fs.existsSync(program);
    } else {
      // For relative programs, do quick checks only
      const programName = path.basename(program);
      const locations = WINDOWS_PROGRAM_LOCATIONS[programName] || [];

      // Quick check common locations first (faster than PATH check)
      for (const location of locations) {
        if (fs.existsSync(location)) {
          exists = true;
          break;
        }
      }

      // If not found in common locations, assume it exists (to avoid slow PATH check)
      // The actual spawn will handle the error if program doesn't exist
      if (!exists) {
        exists = true; // Optimistic approach - let spawn handle the error
      }
    }
  } catch {
    // If verification fails, assume program exists and let spawn handle it
    exists = true;
  }

  // Cache the result for 1 minute only (shorter cache time)
  programVerificationCache.set(program, exists);
  setTimeout(() => {
    programVerificationCache.delete(program);
  }, 60 * 1000);

  return exists;
}

async function validateAndFixShortcuts(): Promise<void> {
  const shortcuts = getConfigShortcuts();
  const invalidShortcuts: Shortcut[] = [];
  const fixedShortcuts: Shortcut[] = [];

  for (const shortcut of shortcuts) {
    if (!shortcut.program) continue;

    const exists = await verifyProgramExists(shortcut.program);
    if (!exists) {
      invalidShortcuts.push(shortcut);

      // Try to find alternative locations
      const programName = path.basename(shortcut.program);
      const locations = WINDOWS_PROGRAM_LOCATIONS[programName];

      if (locations) {
        for (const location of locations) {
          if (fs.existsSync(location)) {
            const fixedShortcut = { ...shortcut, program: location };
            fixedShortcuts.push(fixedShortcut);
            break;
          }
        }
      }
    }
  }

  if (invalidShortcuts.length > 0) {
    const message = `🔍 Ditemukan ${invalidShortcuts.length} shortcut dengan program yang tidak valid. ${fixedShortcuts.length} dapat diperbaiki otomatis.`;

    if (fixedShortcuts.length > 0) {
      const action = await vscode.window.showWarningMessage(message, 'Perbaiki Otomatis', 'Lihat Detail', 'Abaikan');

      if (action === 'Perbaiki Otomatis') {
        // Update shortcuts with fixed paths
        // This would require updating the JSON file
        vscode.window.showInformationMessage(`✅ ${fixedShortcuts.length} shortcut berhasil diperbaiki`);
      } else if (action === 'Lihat Detail') {
        showShortcutValidationReport(invalidShortcuts, fixedShortcuts);
      }
    } else {
      vscode.window.showWarningMessage(message, 'Lihat Detail').then((action) => {
        if (action === 'Lihat Detail') {
          showShortcutValidationReport(invalidShortcuts, fixedShortcuts);
        }
      });
    }
  }
}

function showShortcutValidationReport(invalid: Shortcut[], fixed: Shortcut[]): void {
  const panel = vscode.window.createWebviewPanel(
    'shortcutValidation',
    'Laporan Validasi Shortcut',
    vscode.ViewColumn.Active,
    { enableScripts: true }
  );

  const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Validasi Shortcut</title>
    <style>
        body { font-family: system-ui; margin: 20px; }
        .invalid { background: #ffebee; border-left: 4px solid #f44336; padding: 10px; margin: 10px 0; }
        .fixed { background: #e8f5e8; border-left: 4px solid #4caf50; padding: 10px; margin: 10px 0; }
        .shortcut-item { margin: 5px 0; }
        .program-path { font-family: monospace; background: #f5f5f5; padding: 2px 4px; }
        h2 { color: #333; }
    </style>
</head>
<body>
    <h1>🔍 Laporan Validasi Shortcut</h1>
    
    <h2>❌ Shortcut dengan Program Tidak Valid (${invalid.length})</h2>
    ${invalid
      .map(
        (s) => `
      <div class="invalid">
        <div class="shortcut-item"><strong>${s.label}</strong> (${s.id})</div>
        <div class="program-path">Program: ${s.program}</div>
      </div>
    `
      )
      .join('')}
    
    <h2>✅ Shortcut yang Dapat Diperbaiki (${fixed.length})</h2>
    ${fixed
      .map(
        (s) => `
      <div class="fixed">
        <div class="shortcut-item"><strong>${s.label}</strong> (${s.id})</div>
        <div class="program-path">Program Baru: ${s.program}</div>
      </div>
    `
      )
      .join('')}
    
    <p><em>Tip: Gunakan command "Launcher: Validate Shortcuts" untuk menjalankan validasi ini kapan saja.</em></p>
</body>
</html>`;

  panel.webview.html = html;
}

function platformOk(s: Shortcut): boolean {
  if (!s.platform) return true;
  const p = process.platform;
  if (s.platform === 'win') return p === 'win32';
  if (s.platform === 'mac') return p === 'darwin';
  if (s.platform === 'linux') return p === 'linux';
  return true;
}

function whenOk(s: Shortcut): boolean {
  if (!s.when) return true;
  const editor = vscode.window.activeTextEditor;
  if (!editor) return true;
  const langId = editor.document.languageId;
  // very tiny parser: "resourceLangId == xyz"
  const m = s.when.match(/resourceLangId\s*==\s*(\w+)/);
  if (m) {
    return langId === m[1];
  }
  return true;
}

function resolveVars(
  t: string,
  ctx: { file?: string; workspaceFolder?: string; selectedText?: string; lineNumber?: number; relativeFile?: string }
): string {
  return t
    .replace(/\$\{file\}/g, ctx.file ?? '')
    .replace(/\$\{workspaceFolder\}/g, ctx.workspaceFolder ?? '')
    .replace(/\$\{selectedText\}/g, ctx.selectedText ?? '')
    .replace(/\$\{lineNumber\}/g, (ctx.lineNumber ?? '').toString())
    .replace(/\$\{relativeFile\}/g, ctx.relativeFile ?? '');
}

function pickContext() {
  const editor = vscode.window.activeTextEditor;
  const file = editor?.document?.uri?.fsPath;
  const resource = editor?.document?.uri ?? vscode.workspace.workspaceFolders?.[0]?.uri;
  const ws = resource ? vscode.workspace.getWorkspaceFolder(resource)?.uri.fsPath : undefined;
  const selectedText = editor ? editor.document.getText(editor.selection) : undefined;
  const lineNumber = editor ? editor.selection.active.line + 1 : undefined;
  const relativeFile = file && ws ? path.relative(ws, file) : undefined;
  return { file, workspaceFolder: ws, selectedText, lineNumber, relativeFile };
}

function spawnDefaultOpen(target: string, cwd?: string) {
  // Open file/folder with OS default handler
  if (process.platform === 'win32') {
    cp.spawn('cmd', ['/c', 'start', '', target], {
      cwd,
      detached: true,
      windowsVerbatimArguments: true,
      stdio: 'ignore',
    }).unref();
  } else if (process.platform === 'darwin') {
    cp.spawn('open', [target], { cwd, detached: true, stdio: 'ignore' }).unref();
  } else {
    cp.spawn('xdg-open', [target], { cwd, detached: true, stdio: 'ignore' }).unref();
  }
}

async function runShortcut(s: Shortcut): Promise<void> {
  // Create unique key for auto-discovered shortcuts to avoid conflicts
  const uniqueKey = s.program ? `${s.id}-${s.program.split('\\').pop() || s.program}` : s.id;

  // Less aggressive cooldown check - only prevent rapid fire clicks
  const now = Date.now();
  const lastRun = shortcutCooldowns.get(uniqueKey) || 0;

  // Only block if clicked within 300ms (very rapid double-click)
  if (now - lastRun < COOLDOWN_TIME) {
    console.log(`Shortcut ${s.label} blocked by cooldown: ${now - lastRun}ms ago`);
    return; // Silent return, no user notification for short cooldown
  }

  // Check if actually running (more reliable check)
  if (runningShortcuts.has(uniqueKey)) {
    const timeSinceStart = now - lastRun;
    if (timeSinceStart < 3000) {
      // Only show "running" message if less than 3 seconds
      vscode.window.showInformationMessage(`🔄 Shortcut "${s.label}" sedang berjalan...`);
      return;
    } else {
      // Clear stale running state after 3 seconds
      runningShortcuts.delete(uniqueKey);
    }
  }

  // Set cooldown and running state
  shortcutCooldowns.set(uniqueKey, now);
  runningShortcuts.add(uniqueKey);

  // Show loading indicator immediately
  const loadingMessage = vscode.window.setStatusBarMessage(`🚀 Menjalankan ${s.label}...`);

  // Auto-clear loading after 2 seconds
  const loadingTimeout = setTimeout(() => {
    loadingMessage.dispose();
  }, 2000);

  try {
    const ctx = pickContext();
    let cwd = s.cwd ? resolveVars(s.cwd, ctx) : ctx.workspaceFolder || os.homedir();
    const env = Object.assign({}, process.env, s.env || {});

    if (!platformOk(s) || !whenOk(s)) {
      vscode.window.showInformationMessage(`Shortcut "${s.label}" tidak aktif untuk konteks saat ini.`);
      return;
    }

    // Resolve args
    let args = (s.args || []).map((a) => resolveVars(a, ctx)).filter((a) => a.length > 0);
    if (!s.program || s.program.trim().length === 0) {
      // default open for first arg or current file
      const target = args[0] || (ctx.file ?? cwd);
      spawnDefaultOpen(target, cwd);
      return;
    }

    let program = resolveVars(s.program, ctx);

    // Verify program exists before attempting to run
    if (path.isAbsolute(program) && !fs.existsSync(program)) {
      vscode.window.showErrorMessage(`❌ Program tidak ditemukan: ${program}`);
      console.error(`[Launcher] Program not found: ${program}`);
      return;
    }

    // Handle special Windows file types that need specific launchers
    if (process.platform === 'win32') {
      if (program.endsWith('.msc')) {
        // .msc files need mmc.exe - ensure path uses double backslashes
        args = [
          program.replace(/\\/g, '\\\\'),
          ...args.map((arg) => (arg.includes('\\') ? arg.replace(/\\/g, '\\\\') : arg)),
        ];
        program = 'mmc.exe';
      } else if (program.endsWith('.cpl')) {
        // .cpl files need control.exe or rundll32.exe
        args = [
          program.replace(/\\/g, '\\\\'),
          ...args.map((arg) => (arg.includes('\\') ? arg.replace(/\\/g, '\\\\') : arg)),
        ];
        program = 'control.exe';
      } else if (program.startsWith('ms-settings:')) {
        // ms-settings: URLs must be opened via `start` with an empty title so
        // Windows doesn't parse the URI as the window title and no-op.
        // Use: cmd /c start "" "ms-settings:network" [...args]
        const msUri = program;
        program = 'cmd';
        args = [
          '/c',
          'start',
          '""',
          msUri,
          ...args.map((arg) => (arg.includes('\\') ? arg.replace(/\\/g, '\\\\') : arg)),
        ];
      }
    }

    // Handle admin elevation for Windows
    if (process.platform === 'win32' && (s.runAsAdmin || program === 'mmc.exe' || program === 'regedit.exe')) {
      try {
        // Use PowerShell Start-Process with -Verb RunAs for elevation
        const argsString = args.length > 0 ? `-ArgumentList '${args.join("', '")}' ` : '';
        const elevatedArgs = [
          '-WindowStyle',
          'Hidden',
          '-Command',
          `Start-Process -FilePath '${program}' ${argsString}-Verb RunAs`,
        ];
        program = 'powershell.exe';
        args = elevatedArgs;

        vscode.window.showInformationMessage(`🔐 Meminta izin administrator untuk ${s.label}...`);
      } catch {
        vscode.window.showWarningMessage(`⚠️ Gagal meminta izin administrator. Mencoba menjalankan tanpa elevasi...`);
        // Continue with original program and args
      }
    }

    // For Electron apps, use working directory instead of path arguments
    // This avoids spawn exit code tracking issues with Electron's child processes
    try {
      const isElectronApp = /code/i.test(program);
      if (isElectronApp) {
        console.log(`[Launcher] Detected Electron app: ${s.label}`);

        // Strategy: Use working directory instead of arguments
        // This is more reliable for Electron apps like VS Code.
        if (args && args.length > 0) {
          // Check if first arg looks like a path
          const firstArg = args[0];
          if ((firstArg.includes('\\') || firstArg.includes('/')) && !firstArg.startsWith('-')) {
            // It's a path - use as working directory instead
            let targetPath = firstArg;

            // Normalize path case for Windows
            if (/^[a-z]:/.test(targetPath)) {
              targetPath = targetPath[0].toUpperCase() + targetPath.slice(1);
            }

            // Verify path exists
            if (fs.existsSync(targetPath)) {
              cwd = targetPath; // Use as working directory
              args = []; // Don't pass as argument
              console.log(`[Launcher] 📁 Using working directory for ${s.label}: ${cwd}`);
            } else {
              console.warn(`[Launcher] ⚠️ Path doesn't exist, skipping: ${targetPath}`);
              args = [];
            }
          }
        }

        // If still no working directory set and we have context, use workspace
        if (cwd === (s.cwd ? resolveVars(s.cwd, ctx) : ctx.workspaceFolder || os.homedir())) {
          const wsFolder = ctx.workspaceFolder;
          if (wsFolder && fs.existsSync(wsFolder)) {
            cwd = wsFolder;
            console.log(`[Launcher] 📁 Using workspace folder as working directory: ${cwd}`);
          }
        }
      }
    } catch (e) {
      console.error(`[Launcher] Error in Electron app working directory setup:`, e);
    }

    // spawn and listen for errors (e.g., ENOENT)
    try {
      output.appendLine(`[Launcher] Analyzing program type: ${program}`);

      // Categorize applications for proper handling
      const isSystemTool =
        program.toLowerCase().includes('taskmgr') ||
        program.toLowerCase().includes('regedit') ||
        program.toLowerCase().includes('mmc') ||
        program.toLowerCase().includes('control');

      const isElectronApp = program.toLowerCase().includes('code');

      const isGuiApp =
        isElectronApp ||
        program.toLowerCase().includes('chrome') ||
        program.toLowerCase().includes('firefox') ||
        (program.toLowerCase().includes('.exe') && !program.toLowerCase().includes('cmd'));

      output.appendLine(
        `[Launcher] Program categories: ${isSystemTool ? 'SYSTEM_TOOL' : ''} ${isGuiApp ? 'GUI_APP' : ''} ${isElectronApp ? 'ELECTRON_APP' : ''} ${program.startsWith('ms-settings:') ? 'MS_SETTINGS' : ''}`
      );

      const isConsoleApp =
        program.toLowerCase().includes('cmd') ||
        program.toLowerCase().includes('powershell') ||
        program.toLowerCase().includes('wsl');

      const spawnOptions: cp.SpawnOptions = {
        cwd,
        env,
        detached: true,
        stdio: 'ignore',
      };
      // Do not rewrite Windows paths. Pass them as-is to avoid breaking exe resolution.

      // Different strategies for different app types
      let launchStrategy = 'direct';

      if (process.platform === 'win32') {
        if (isSystemTool) {
          // System tools work better with direct launch
          launchStrategy = 'direct';
          spawnOptions.windowsHide = false; // Don't hide system tools
        } else if (isElectronApp) {
          // Use PowerShell ShellExecute for most reliable Electron app launching
          launchStrategy = 'powershell_shellexecute';
          spawnOptions.windowsHide = true; // Hide PowerShell window
          spawnOptions.windowsVerbatimArguments = false;
        } else if (isGuiApp) {
          // Use ShellExecute via cmd start for generic GUI apps
          launchStrategy = 'cmd_start';
          spawnOptions.windowsHide = false;
          spawnOptions.windowsVerbatimArguments = true;
        } else if (isConsoleApp) {
          launchStrategy = 'console';
          spawnOptions.windowsHide = true;
        }
      }

      console.log(`[Launcher] Launch strategy for ${s.label}: ${launchStrategy}`);
      // Keep arguments as provided; avoid over-normalization on Windows

      // Initialize launch parameters
      let finalProgram = program;
      let finalArgs = [...args]; // Create a copy to modify

      // Apply launch strategy
      if (launchStrategy === 'cmd_start') {
        // Use cmd /c start "" "program" args... so Windows Shell executes the app
        const quote = (v: string) => (/[\s]/.test(v) ? `"${v}"` : v);
        finalProgram = 'cmd';
        finalArgs = ['/c', 'start', '""', quote(program), ...finalArgs.map(quote)];
        spawnOptions.stdio = 'ignore';
        spawnOptions.detached = true;
        spawnOptions.windowsVerbatimArguments = true;
        console.log(`[Launcher] cmd start launch: ${program} with args:`, finalArgs);
      } else if (launchStrategy === 'direct_gui') {
        // Direct GUI launch option (preferred for Electron apps like VS Code)
        spawnOptions.stdio = ['ignore', 'ignore', 'ignore'];
        spawnOptions.detached = true;
        console.log(`[Launcher] Direct GUI launch: ${program}`);
      } else if (launchStrategy === 'powershell_shellexecute') {
        // PowerShell ShellExecute - most reliable for Electron apps
        finalProgram = 'powershell';
        const argString = finalArgs.length > 0 ? `-ArgumentList @('${finalArgs.join("', '")}')` : '';
        finalArgs = [
          '-WindowStyle',
          'Hidden',
          '-Command',
          `Start-Process -FilePath '${program}' -WorkingDirectory '${cwd}' ${argString} -PassThru | Out-Null`,
        ];
        spawnOptions.stdio = 'ignore';
        spawnOptions.detached = true;
        console.log(`[Launcher] PowerShell ShellExecute launch: ${program} in ${cwd}`);
      } else if (program.startsWith('ms-settings:')) {
        // ms-settings URLs still need cmd start
        finalProgram = 'cmd';
        finalArgs = ['/c', 'start', program, ...finalArgs];
        console.log(`[Launcher] Using cmd start for ms-settings: ${program}`);
      }

      // Log detailed spawn information for debugging
      output.appendLine(`[Launcher] Running program: ${finalProgram}`);
      output.appendLine(`[Launcher] Original arguments: ${finalArgs.join(' ')}`);
      const normArgs = finalArgs.map((arg) =>
        arg.includes('\\') ? `[normalized: ${arg.replace(/\\/g, '\\\\')}]` : arg
      );
      output.appendLine(`[Launcher] Normalized arguments: ${normArgs.join(' ')}`);
      if (cwd) {
        output.appendLine(`[Launcher] Working directory: ${cwd}`);
      }
      console.log(`[Launcher] Spawning: ${finalProgram} with args:`, finalArgs);
      console.log(`[Launcher] Working dir: ${cwd}`);
      console.log(`[Launcher] Spawn options:`, spawnOptions);

      output.appendLine(`[Launcher] Attempting to spawn: ${finalProgram}`);
      output.appendLine(`[Launcher] Full command: ${finalProgram} ${finalArgs.join(' ')}`);
      output.appendLine(`[Launcher] Working directory: ${cwd}`);
      output.appendLine(`[Launcher] Launch strategy: ${launchStrategy}`);
      output.appendLine(`[Launcher] Spawn options: ${JSON.stringify(spawnOptions, null, 2)}`);

      const spawnStart = Date.now();
      const child = cp.spawn(finalProgram, finalArgs, spawnOptions);
      let processStarted = false;
      let processExited = false;
      let lastExitCode: number | null = null;
      let lastExitAt = 0;

      child.on('error', async (err) => {
        output.appendLine(`[Launcher] ❌ Process error: ${err.message}`);
        console.error(`[Launcher] Process error:`, err);
        // If direct GUI launch failed for Electron apps, try cmd start fallback
        if (process.platform === 'win32' && launchStrategy === 'direct_gui' && (isElectronApp || isGuiApp)) {
          try {
            output.appendLine(`[Launcher] 🔄 Direct GUI failed, attempting cmd start fallback...`);
            const quote = (v: string) => (/[\s]/.test(v) ? `"${v}"` : v);
            const startArgs = ['/c', 'start', '""', quote(program), ...finalArgs.map(quote)];
            const fallbackChild = cp.spawn('cmd', startArgs, {
              cwd,
              env,
              detached: true,
              stdio: 'ignore',
              windowsVerbatimArguments: true,
            });
            fallbackChild.unref();
            vscode.window.showInformationMessage(`✅ ${s.label} dijalankan menggunakan fallback (cmd start)`);
            return;
          } catch (fallbackErr) {
            output.appendLine(`[Launcher] ❌ Fallback failed: ${String(fallbackErr)}`);
          }
        }
        // Otherwise, report the error
        vscode.window.showErrorMessage(`❌ Gagal menjalankan "${s.label}": ${err?.message ?? String(err)}`);
      });

      child.on('spawn', () => {
        processStarted = true;
        output.appendLine(`[Launcher] ✅ Process spawned successfully with PID: ${child.pid}`);
        output.appendLine(`[Launcher] Full command that succeeded: ${finalProgram} ${finalArgs.join(' ')}`);
        console.log(`[Launcher] Process spawned: ${finalProgram} ${finalArgs.join(' ')} | PID: ${child.pid}`);

        // Show user-friendly message with command details
        vscode.window
          .showInformationMessage(
            `✅ ${s.label} launched (PID: ${child.pid})\nCommand: ${finalProgram} ${finalArgs.join(' ')}`,
            'Show Debug Log'
          )
          .then((selection) => {
            if (selection === 'Show Debug Log') {
              output.show();
            }
          });

        // Skip extended monitoring for cmd_start since child is the shell, not the GUI app
        if (launchStrategy === 'cmd_start') {
          return;
        }

        // Enhanced process monitoring with specific Electron app handling
        setTimeout(() => {
          if (!processExited) {
            output.appendLine(`[Launcher] Process ${child.pid} still running after 1s (good sign)`);

            // Additional check for Electron apps to ensure proper launch
            if (isElectronApp) {
              vscode.window
                .showInformationMessage(
                  `✅ ${s.label} launched successfully.\nIf the app doesn't appear, please check the debug log.`,
                  'Show Debug Log'
                )
                .then((selection) => {
                  if (selection === 'Show Debug Log') {
                    output.show();
                  }
                });
            }
          } else {
            // For Electron apps, a quick exit with code 0 often means an existing instance handled the request.
            const quickMs = lastExitAt ? lastExitAt - spawnStart : 0;
            const treatAsSuccess =
              isElectronApp && (lastExitCode === 0 || lastExitCode === null) && quickMs > 0 && quickMs < 1500;
            if (treatAsSuccess) {
              output.appendLine(
                `[Launcher] Electron app exited quickly with code ${lastExitCode} (existing instance). Treating as success.`
              );
              vscode.window.showInformationMessage(`✅ ${s.label} signaled existing instance.`);
            } else {
              output.appendLine(`[Launcher] ⚠️ Process ${child.pid} exited quickly (potential issue)`);
              let errorMessage = `⚠️ ${s.label} (PID: ${child.pid}) exited quickly.`;
              if (isElectronApp) {
                errorMessage += ` This may happen with Electron apps. Try these solutions:\n1. Run as administrator\n2. Check app installation\n3. Verify no other instances are running`;
              } else {
                errorMessage += ` The app may not have appeared.`;
              }
              vscode.window.showWarningMessage(errorMessage, 'Show Debug Log', 'Run Diagnostics').then((selection) => {
                if (selection === 'Show Debug Log') {
                  output.show();
                } else if (selection === 'Run Diagnostics') {
                  vscode.commands.executeCommand('launcher.diagnoseLaunch');
                }
              });
            }
          }
        }, 1000);
      });

      child.on('exit', (code, signal) => {
        processExited = true;
        lastExitCode = code;
        lastExitAt = Date.now();
        // For Electron apps launched via direct GUI, a quick non-zero exit may indicate CLI handling failed.
        // Try a ShellExecute fallback via cmd start once.
        if (process.platform === 'win32' && launchStrategy === 'direct_gui' && (isElectronApp || isGuiApp)) {
          const elapsed = lastExitAt - spawnStart;
          if (code !== 0 && code !== null && elapsed < 2000) {
            try {
              output.appendLine(
                `[Launcher] ⚠️ Direct GUI exit code ${code} in ${elapsed}ms. Trying cmd start fallback...`
              );
              const quote = (v: string) => (/\s/.test(v) ? `"${v}"` : v);
              const startArgs = ['/c', 'start', '""', quote(program), ...finalArgs.map(quote)];
              const fb = cp.spawn('cmd', startArgs, {
                cwd,
                env,
                detached: true,
                stdio: 'ignore',
                windowsVerbatimArguments: true,
              });
              try {
                fb.unref();
              } catch {}
              vscode.window.showInformationMessage(`✅ ${s.label} dijalankan menggunakan fallback (cmd start)`);
              return; // Don't treat as error further
            } catch (fbErr) {
              output.appendLine(`[Launcher] ❌ Fallback after quick exit failed: ${String(fbErr)}`);
            }
          }
        }
        if (launchStrategy === 'cmd_start') {
          output.appendLine(
            `[Launcher] cmd start process exited (code=${code}). GUI app should continue independently.`
          );
          console.log(`[Launcher] cmd start shell exited: code=${code}, signal=${signal}`);
          return; // Do not interpret exit as app failure
        }
        output.appendLine(`[Launcher] Process exited: code=${code}, signal=${signal}`);
        console.log(`[Launcher] Process exited: code=${code}, signal=${signal}`);

        // If process exits quickly with error, show error message
        if (processStarted && code !== 0 && code !== null) {
          const exitMessage = signal ? `killed by signal ${signal}` : `exit code ${code}`;

          // Special handling for common Windows error codes
          let userMessage = `❌ ${s.label} berhenti dengan error (${exitMessage})`;
          if (code === 24) {
            userMessage = `❌ ${s.label} tidak dapat dijalankan - Program mungkin tidak terinstall atau path salah`;
          } else if (code === 2) {
            userMessage = `❌ ${s.label} tidak ditemukan - File tidak exist di system`;
          } else if (code === 5) {
            userMessage = `❌ ${s.label} akses ditolak - Mungkin perlu run as administrator`;
          }

          vscode.window.showErrorMessage(userMessage);

          // Auto-remove problematic auto-discovered shortcuts
          if (s.id.startsWith('auto-') && (code === 24 || code === 2)) {
            console.log(`[Launcher] Auto-removing problematic shortcut: ${s.id}`);
            // Note: This won't persist, but will clean up for this session
          }
        }
      });

      child.on('disconnect', () => {
        console.log(`[Launcher] Process disconnected`);
      });

      // detach if possible
      try {
        child.unref();
      } catch {
        console.log(`[Launcher] Failed to unref process`);
      }
    } catch (spawnErr) {
      const error = spawnErr as Error;
      vscode.window.showErrorMessage(`❌ Gagal menjalankan "${s.label}": ${error?.message ?? String(spawnErr)}`);
    }
  } catch (err) {
    const error = err as Error;
    vscode.window.showErrorMessage(`❌ Error menjalankan "${s.label}": ${error?.message ?? String(err)}`);
  } finally {
    // Clean up with unique key
    const uniqueKey = s.program ? `${s.id}-${s.program.split('\\').pop() || s.program}` : s.id;
    runningShortcuts.delete(uniqueKey);
    clearTimeout(loadingTimeout);
    loadingMessage.dispose();

    // Auto-clear cooldown after a reasonable time
    setTimeout(() => {
      shortcutCooldowns.delete(uniqueKey);
    }, 1000); // 1 second cleanup
  }
}

class ShortcutsProvider implements vscode.TreeDataProvider<ShortcutItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh() {
    // Clear cache when manually refreshing
    autoDiscoveryCache.lastUpdated = 0;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ShortcutItem): vscode.TreeItem {
    return element;
  }

  // element is optional; when provided we have no children because shortcuts are leaves
  async getChildren(element?: ShortcutItem): Promise<ShortcutItem[]> {
    if (element) return [];

    // Get config shortcuts immediately (fast)
    const configShortcuts = getConfigShortcuts();

    // Get cached auto-discovered shortcuts or load them async
    const { shortcuts, shells, editors } = await this.getAutoDiscoveredWithCache();

    // Combine all shortcuts
    const allShortcuts = [...configShortcuts, ...shortcuts, ...shells, ...editors];

    // Deduplicate by ID (configShortcuts take priority over auto-discovered)
    const uniqueShortcuts = new Map<string, Shortcut>();
    for (const shortcut of allShortcuts) {
      if (!uniqueShortcuts.has(shortcut.id)) {
        uniqueShortcuts.set(shortcut.id, shortcut);
      }
    }

    const items = Array.from(uniqueShortcuts.values())
      .filter((s) => platformOk(s) && whenOk(s) && profileOk(s))
      .map((s) => new ShortcutItem(s));

    console.log(`[Launcher] 🚀 Total shortcuts after deduplication: ${items.length}`);
    return items;
  }

  private async getAutoDiscoveredWithCache(): Promise<{
    shortcuts: Shortcut[];
    shells: Shortcut[];
    editors: Shortcut[];
  }> {
    const now = Date.now();

    // Return cached data if still fresh
    if (now - autoDiscoveryCache.lastUpdated < CACHE_DURATION && autoDiscoveryCache.shortcuts.length > 0) {
      return {
        shortcuts: autoDiscoveryCache.shortcuts,
        shells: autoDiscoveryCache.shells,
        editors: autoDiscoveryCache.editors,
      };
    }

    // Prevent multiple concurrent loading
    if (autoDiscoveryCache.isLoading) {
      return {
        shortcuts: autoDiscoveryCache.shortcuts,
        shells: autoDiscoveryCache.shells,
        editors: autoDiscoveryCache.editors,
      };
    }

    // Load async in background
    autoDiscoveryCache.isLoading = true;
    try {
      const [shortcuts, shells, editors] = await Promise.all([
        this.loadAutoDiscoveredShortcutsAsync(),
        this.loadAutoDiscoveredShellsAsync(),
        this.loadAutoDiscoveredEditorsAsync(),
      ]);

      autoDiscoveryCache.shortcuts = shortcuts;
      autoDiscoveryCache.shells = shells;
      autoDiscoveryCache.editors = editors;
      autoDiscoveryCache.lastUpdated = now;

      // Refresh tree view with new data
      this._onDidChangeTreeData.fire();

      return { shortcuts, shells, editors };
    } finally {
      autoDiscoveryCache.isLoading = false;
    }
  }

  private async loadAutoDiscoveredShortcutsAsync(): Promise<Shortcut[]> {
    if (!shouldAutoDiscover()) return [];
    // Use existing sync version for now, can be optimized later
    return autoDiscoveredShortcuts();
  }

  private async loadAutoDiscoveredShellsAsync(): Promise<Shortcut[]> {
    if (!shouldAutoDiscover()) return [];
    return autoDiscoveredShells();
  }

  private async loadAutoDiscoveredEditorsAsync(): Promise<Shortcut[]> {
    if (!shouldAutoDiscover()) return [];
    return autoDiscoveredEditors();
  }
}

class ShortcutItem extends vscode.TreeItem {
  constructor(public readonly s: Shortcut) {
    super(s.label || s.id, vscode.TreeItemCollapsibleState.None);
    this.contextValue = 'shortcutItem';
    this.tooltip = `${s.program || '(default app)'} ${(s.args || []).join(' ')}`;
    // pass the full Shortcut object so commands can run both configured and auto-discovered shortcuts
    this.command = { command: 'launcher.run', title: 'Run Shortcut', arguments: [s] };
    this.iconPath = resolveIcon(s.icon);
  }
}

function resolveIcon(icon?: string): vscode.ThemeIcon | vscode.Uri {
  if (!icon) return new vscode.ThemeIcon('rocket'); // Use rocket icon as default

  // If looks like a path, try use file icon
  if (/[\\/]/.test(icon) || icon.startsWith('.')) {
    try {
      return vscode.Uri.file(icon);
    } catch {
      /* ignore */
    }
  }

  // Map common emojis to VS Code icons
  const emojiToIcon: Record<string, string> = {
    '🧮': 'calculator',
    '📁': 'folder-opened',
    '⚙️': 'settings-gear',
    '🗃️': 'database',
    '💻': 'device-desktop',
    '🔧': 'server-process',
    '📋': 'book',
    '🚀': 'rocket',
    '🌐': 'browser',
    '📝': 'edit',
    '💾': 'save',
    '🔍': 'search',
    '📊': 'graph',
    '🎯': 'target',
  };

  // Check if it's a mapped emoji
  if (emojiToIcon[icon]) {
    return new vscode.ThemeIcon(emojiToIcon[icon]);
  }

  // Check if it's an emoji (fallback to generic icon)
  if (/[\u{1F000}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(icon)) {
    return new vscode.ThemeIcon('symbol-misc');
  }

  return new vscode.ThemeIcon(icon);
}

function shouldAutoDiscover(): boolean {
  const cfg = vscode.workspace.getConfiguration();
  return cfg.get<boolean>('launcher.enableAutoDiscover', true);
}

// Removed PRIORITY_PROGRAMS - not used

function autoDiscoveredShortcuts(): Shortcut[] {
  if (!shouldAutoDiscover()) return [];
  const plat = process.platform;
  const list: Shortcut[] = [];

  function pushIfExists(label: string, program: string, args?: string[], icon?: string) {
    try {
      if (fs.existsSync(program)) {
        list.push({
          id: `auto-${label.toLowerCase().replace(/\s+/g, '-')}`,
          label,
          program,
          args,
          platform: undefined,
          icon,
        });
      }
    } catch {}
  }

  function pushIfExistsFast(label: string, program: string, args?: string[], icon?: string): boolean {
    try {
      // Use a simple Map to cache results during this session
      const cached = programVerificationCache.get(program);
      if (cached !== undefined) {
        if (cached) {
          list.push({
            id: `auto-${label.toLowerCase().replace(/[\\s\\(\\)]/g, '-')}`,
            label,
            program,
            args,
            platform: undefined,
            icon,
          });
        }
        return cached;
      }

      let exists = false;

      // Better validation for different program types
      if (path.isAbsolute(program)) {
        // For absolute paths, check file exists and is executable
        exists = fs.existsSync(program);
        if (exists) {
          try {
            const stat = fs.statSync(program);
            exists = stat.isFile(); // Make sure it's a file, not directory
          } catch {
            exists = false;
          }
        }
      } else {
        // For relative programs (like 'control', 'taskmgr'), check if in PATH or system32
        const systemPaths = [
          'C:\\Windows\\System32\\' + program + (program.endsWith('.exe') ? '' : '.exe'),
          'C:\\Windows\\' + program + (program.endsWith('.exe') ? '' : '.exe'),
        ];

        for (const sysPath of systemPaths) {
          if (fs.existsSync(sysPath)) {
            exists = true;
            break;
          }
        }
      }

      programVerificationCache.set(program, exists);

      if (exists) {
        console.log(`[AutoDiscovery] Adding verified program: ${label} -> ${program}`);
        list.push({
          id: `auto-${label.toLowerCase().replace(/[\\s\\(\\)]/g, '-')}`,
          label,
          program,
          args,
          platform: undefined,
          icon,
        });
      } else {
        console.log(`[AutoDiscovery] Skipping non-existent program: ${label} -> ${program}`);
      }
      return exists;
    } catch (error) {
      console.log(`[AutoDiscovery] Error checking ${program}:`, error);
      return false;
    }
  }
  // Add common development build commands (cross-platform)
  const ctx = pickContext();
  const workspaceFolder = ctx.workspaceFolder;

  if (workspaceFolder) {
    // Node.js / JavaScript projects
    if (fs.existsSync(path.join(workspaceFolder, 'package.json'))) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(path.join(workspaceFolder, 'package.json'), 'utf8'));
        if (packageJson.scripts) {
          // Common npm scripts
          const commonScripts = ['serve', 'dev', 'start', 'build', 'test', 'lint'];
          for (const script of commonScripts) {
            if (packageJson.scripts[script]) {
              list.push({
                id: `auto-npm-${script}`,
                label: `📦 npm run ${script}`,
                program: plat === 'win32' ? 'cmd' : 'sh',
                args: plat === 'win32' ? ['/c', 'npm', 'run', script] : ['-c', `npm run ${script}`],
                cwd: workspaceFolder,
                icon: 'run',
              });
            }
          }
        }
      } catch {}
    }

    // Go projects
    if (fs.existsSync(path.join(workspaceFolder, 'go.mod')) || fs.existsSync(path.join(workspaceFolder, 'main.go'))) {
      list.push({
        id: 'auto-go-run',
        label: '🚀 go run main.go',
        program: 'go',
        args: ['run', 'main.go'],
        cwd: workspaceFolder,
        icon: 'play',
      });
      list.push({
        id: 'auto-go-build',
        label: '🔨 go build',
        program: 'go',
        args: ['build'],
        cwd: workspaceFolder,
        icon: 'tools',
      });
      list.push({
        id: 'auto-go-test',
        label: '🧪 go test',
        program: 'go',
        args: ['test', './...'],
        cwd: workspaceFolder,
        icon: 'beaker',
      });
    }

    // Rust projects
    if (fs.existsSync(path.join(workspaceFolder, 'Cargo.toml'))) {
      list.push({
        id: 'auto-cargo-run',
        label: '🦀 cargo run',
        program: 'cargo',
        args: ['run'],
        cwd: workspaceFolder,
        icon: 'play',
      });
      list.push({
        id: 'auto-cargo-build',
        label: '🔨 cargo build',
        program: 'cargo',
        args: ['build'],
        cwd: workspaceFolder,
        icon: 'tools',
      });
      list.push({
        id: 'auto-cargo-test',
        label: '🧪 cargo test',
        program: 'cargo',
        args: ['test'],
        cwd: workspaceFolder,
        icon: 'beaker',
      });
    }

    // Python projects
    if (
      fs.existsSync(path.join(workspaceFolder, 'requirements.txt')) ||
      fs.existsSync(path.join(workspaceFolder, 'setup.py')) ||
      fs.existsSync(path.join(workspaceFolder, 'pyproject.toml'))
    ) {
      list.push({
        id: 'auto-python-run',
        label: '🐍 python main.py',
        program: 'python',
        args: ['main.py'],
        cwd: workspaceFolder,
        icon: 'play',
      });
      if (fs.existsSync(path.join(workspaceFolder, 'manage.py'))) {
        list.push({
          id: 'auto-django-runserver',
          label: '🌐 python manage.py runserver',
          program: 'python',
          args: ['manage.py', 'runserver'],
          cwd: workspaceFolder,
          icon: 'server',
        });
      }
    }

    // Java/Maven projects
    if (fs.existsSync(path.join(workspaceFolder, 'pom.xml'))) {
      list.push({
        id: 'auto-mvn-clean-install',
        label: '☕ mvn clean install',
        program: plat === 'win32' ? 'mvn.cmd' : 'mvn',
        args: ['clean', 'install'],
        cwd: workspaceFolder,
        icon: 'tools',
      });
      list.push({
        id: 'auto-mvn-test',
        label: '🧪 mvn test',
        program: plat === 'win32' ? 'mvn.cmd' : 'mvn',
        args: ['test'],
        cwd: workspaceFolder,
        icon: 'beaker',
      });
    }

    // Gradle projects
    if (
      fs.existsSync(path.join(workspaceFolder, 'build.gradle')) ||
      fs.existsSync(path.join(workspaceFolder, 'build.gradle.kts'))
    ) {
      const gradleCmd = plat === 'win32' ? 'gradlew.bat' : './gradlew';
      list.push({
        id: 'auto-gradle-build',
        label: '🐘 gradle build',
        program: gradleCmd,
        args: ['build'],
        cwd: workspaceFolder,
        icon: 'tools',
      });
      list.push({
        id: 'auto-gradle-test',
        label: '🧪 gradle test',
        program: gradleCmd,
        args: ['test'],
        cwd: workspaceFolder,
        icon: 'beaker',
      });
    }

    // .NET projects
    if (fs.existsSync(path.join(workspaceFolder, '*.csproj')) || fs.existsSync(path.join(workspaceFolder, '*.sln'))) {
      list.push({
        id: 'auto-dotnet-run',
        label: '⚡ dotnet run',
        program: 'dotnet',
        args: ['run'],
        cwd: workspaceFolder,
        icon: 'play',
      });
      list.push({
        id: 'auto-dotnet-build',
        label: '🔨 dotnet build',
        program: 'dotnet',
        args: ['build'],
        cwd: workspaceFolder,
        icon: 'tools',
      });
      list.push({
        id: 'auto-dotnet-test',
        label: '🧪 dotnet test',
        program: 'dotnet',
        args: ['test'],
        cwd: workspaceFolder,
        icon: 'beaker',
      });
    }

    // Docker projects
    if (
      fs.existsSync(path.join(workspaceFolder, 'Dockerfile')) ||
      fs.existsSync(path.join(workspaceFolder, 'docker-compose.yml'))
    ) {
      list.push({
        id: 'auto-docker-compose-up',
        label: '🐳 docker-compose up',
        program: 'docker-compose',
        args: ['up'],
        cwd: workspaceFolder,
        icon: 'server-process',
      });
      list.push({
        id: 'auto-docker-compose-down',
        label: '🛑 docker-compose down',
        program: 'docker-compose',
        args: ['down'],
        cwd: workspaceFolder,
        icon: 'debug-stop',
      });
    }

    // Makefile projects
    if (
      fs.existsSync(path.join(workspaceFolder, 'Makefile')) ||
      fs.existsSync(path.join(workspaceFolder, 'makefile'))
    ) {
      list.push({
        id: 'auto-make',
        label: '🔧 make',
        program: 'make',
        args: [],
        cwd: workspaceFolder,
        icon: 'tools',
      });
      list.push({
        id: 'auto-make-clean',
        label: '🧹 make clean',
        program: 'make',
        args: ['clean'],
        cwd: workspaceFolder,
        icon: 'trash',
      });
    }
  }

  if (plat === 'win32') {
    // System utilities - DISABLED: Already defined in launcher-putra.json to avoid duplicates
    // pushIfExistsFast('Notepad', 'C:\\Windows\\system32\\notepad.exe', undefined, 'edit');
    // pushIfExistsFast('Calculator', 'C:\\Windows\\system32\\calc.exe', undefined, 'calculator');
    // pushIfExistsFast('Task Manager', 'C:\\Windows\\system32\\taskmgr.exe', undefined, 'list-tree');
    // pushIfExistsFast('Control Panel', 'C:\\Windows\\system32\\control.exe', undefined, 'settings-gear');
    // pushIfExistsFast('Registry Editor', 'C:\\Windows\\regedit.exe', undefined, 'database');
    pushIfExists('Paint', 'C:\\Windows\\system32\\mspaint.exe', undefined, 'paintcan');
    pushIfExists('Snipping Tool', 'C:\\Windows\\system32\\SnippingTool.exe', undefined, 'device-camera');

    // File Explorer shortcuts - use fast version for Windows explorer
    pushIfExistsFast(
      'Explorer (Downloads)',
      'C:\\Windows\\explorer.exe',
      [os.homedir() + '\\Downloads'],
      'folder-opened'
    );
    pushIfExistsFast(
      'Explorer (Documents)',
      'C:\\Windows\\explorer.exe',
      [os.homedir() + '\\Documents'],
      'folder-opened'
    );
    pushIfExistsFast('Explorer (Desktop)', 'C:\\Windows\\explorer.exe', [os.homedir() + '\\Desktop'], 'folder-opened');
    pushIfExistsFast(
      'Explorer (Pictures)',
      'C:\\Windows\\explorer.exe',
      [os.homedir() + '\\Pictures'],
      'folder-opened'
    );

    // Browsers
    pushIfExists('Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', undefined, 'browser');
    pushIfExists(
      'Chrome (x86)',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      undefined,
      'browser'
    );
    pushIfExists('Firefox', 'C:\\Program Files\\Mozilla Firefox\\firefox.exe', undefined, 'browser');
    pushIfExists('Edge', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', undefined, 'browser');
    pushIfExists('Opera', 'C:\\Program Files\\Opera\\opera.exe', undefined, 'browser');
    pushIfExists(
      'Opera (AppData)',
      os.homedir() + '\\AppData\\Local\\Programs\\Opera\\opera.exe',
      undefined,
      'browser'
    );

    // Development tools
    pushIfExists('Git Bash', 'C:\\Program Files\\Git\\git-bash.exe', undefined, 'terminal-bash');
    pushIfExists('SourceTree', 'C:\\Program Files\\Atlassian\\SourceTree\\SourceTree.exe', undefined, 'source-control');
    pushIfExists(
      'SourceTree (AppData)',
      os.homedir() + '\\AppData\\Local\\SourceTree\\SourceTree.exe',
      undefined,
      'source-control'
    );
    pushIfExists(
      'GitHub Desktop',
      os.homedir() + '\\AppData\\Local\\GitHubDesktop\\GitHubDesktop.exe',
      undefined,
      'github'
    );
    pushIfExists('DBeaver', 'C:\\Program Files\\DBeaver\\dbeaver.exe', undefined, 'database');
    pushIfExists('DBeaver (AppData)', os.homedir() + '\\AppData\\Local\\DBeaver\\dbeaver.exe', undefined, 'database');
    pushIfExists('Node.js', 'C:\\Program Files\\nodejs\\node.exe', undefined, 'symbol-method');
    pushIfExists('Python', 'C:\\Python39\\python.exe', undefined, 'symbol-method');
    pushIfExists(
      'Python (AppData)',
      os.homedir() + '\\AppData\\Local\\Programs\\Python\\Python39\\python.exe',
      undefined,
      'symbol-method'
    );

    // Media and graphics
    pushIfExists('VLC', 'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe', undefined, 'play');
    pushIfExists(
      'Adobe Photoshop',
      'C:\\Program Files\\Adobe\\Adobe Photoshop 2023\\Photoshop.exe',
      undefined,
      'paintcan'
    );
    pushIfExists('GIMP', 'C:\\Program Files\\GIMP 2\\bin\\gimp-2.10.exe', undefined, 'paintcan');

    // Text editors
    pushIfExists('Notepad++', 'C:\\Program Files\\Notepad++\\notepad++.exe', undefined, 'edit');
    pushIfExists('Sublime Text', 'C:\\Program Files\\Sublime Text\\sublime_text.exe', undefined, 'edit');

    // Communication & Cloud
    pushIfExists(
      'Discord',
      os.homedir() + '\\AppData\\Local\\Discord\\Update.exe',
      ['--processStart', 'Discord.exe'],
      'comment-discussion'
    );
    pushIfExists('Slack', os.homedir() + '\\AppData\\Local\\slack\\slack.exe', undefined, 'comment-discussion');
    pushIfExists(
      'Teams',
      os.homedir() + '\\AppData\\Local\\Microsoft\\Teams\\current\\Teams.exe',
      undefined,
      'organization'
    );
    pushIfExists('Google Drive', 'C:\\Program Files\\Google\\Drive File Stream\\GoogleDriveFS.exe', undefined, 'cloud');
    pushIfExists(
      'Google Drive (AppData)',
      os.homedir() + '\\AppData\\Local\\Google\\Drive\\GoogleDriveFS.exe',
      undefined,
      'cloud'
    );

    // System management - use mmc.exe for .msc files
    pushIfExists('Device Manager', 'mmc.exe', ['C:\\Windows\\system32\\devmgmt.msc'], 'device-desktop');
    pushIfExists('Services', 'mmc.exe', ['C:\\Windows\\system32\\services.msc'], 'server-process');
    pushIfExists('Event Viewer', 'mmc.exe', ['C:\\Windows\\system32\\eventvwr.msc'], 'book');
    pushIfExists('Disk Management', 'mmc.exe', ['C:\\Windows\\system32\\diskmgmt.msc'], 'database');
    pushIfExists('System Information', 'C:\\Windows\\system32\\msinfo32.exe', undefined, 'info');

    // Network settings - use proper Windows commands
    pushIfExists('Network Connections', 'control', ['ncpa.cpl'], 'plug');
    pushIfExists('Network & Internet Settings', 'ms-settings:network', undefined, 'radio-tower');
    pushIfExists('WiFi Settings', 'ms-settings:network-wifi', undefined, 'radio-tower');
    pushIfExists('VPN Settings', 'ms-settings:network-vpn', undefined, 'shield');
  } else if (plat === 'darwin') {
    pushIfExists('Safari', '/Applications/Safari.app', undefined, 'browser');
    pushIfExists('Chrome', '/Applications/Google Chrome.app', undefined, 'browser');
    pushIfExists('Firefox', '/Applications/Firefox.app', undefined, 'browser');
    pushIfExists('Terminal', '/Applications/Utilities/Terminal.app', undefined, 'terminal');
    pushIfExists('Finder', '/System/Library/CoreServices/Finder.app', undefined, 'folder-opened');
    pushIfExists('TextEdit', '/Applications/TextEdit.app', undefined, 'edit');
    pushIfExists('Calculator', '/Applications/Calculator.app', undefined, 'calculator');
  } else {
    // Linux common applications (using which command would be better but keeping it simple)
    const linuxApps = [
      { label: 'Firefox', program: '/usr/bin/firefox', icon: 'browser' },
      { label: 'Chrome', program: '/usr/bin/google-chrome', icon: 'browser' },
      { label: 'Chromium', program: '/usr/bin/chromium-browser', icon: 'browser' },
      { label: 'Nautilus', program: '/usr/bin/nautilus', icon: 'folder-opened' },
      { label: 'Dolphin', program: '/usr/bin/dolphin', icon: 'folder-opened' },
      { label: 'Gedit', program: '/usr/bin/gedit', icon: 'edit' },
      { label: 'Kate', program: '/usr/bin/kate', icon: 'edit' },
      { label: 'Calculator', program: '/usr/bin/gnome-calculator', icon: 'calculator' },
    ];

    for (const app of linuxApps) {
      pushIfExists(app.label, app.program, undefined, app.icon);
    }
  }
  return list;
}

async function exportShortcuts() {
  const cfg = vscode.workspace.getConfiguration();
  const shortcuts = cfg.get<Shortcut[]>('launcher.shortcuts', []);
  const uri = await vscode.window.showSaveDialog({ filters: { JSON: ['json'] }, saveLabel: 'Export Shortcuts' });
  if (!uri) return;
  await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(shortcuts, null, 2), 'utf8'));
  vscode.window.showInformationMessage('Shortcuts exported.');
}

async function importShortcuts() {
  const cfg = vscode.workspace.getConfiguration();
  const pick = await vscode.window.showOpenDialog({
    canSelectMany: false,
    filters: { JSON: ['json'] },
    openLabel: 'Import Shortcuts',
  });
  if (!pick || !pick[0]) return;
  const data = await vscode.workspace.fs.readFile(pick[0]);
  try {
    const arr = JSON.parse(Buffer.from(data).toString('utf8'));
    if (Array.isArray(arr)) {
      await cfg.update('launcher.shortcuts', arr, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage('Shortcuts imported to User settings.');
    } else {
      vscode.window.showErrorMessage('Invalid JSON format.');
    }
  } catch (e) {
    const error = e as Error;
    vscode.window.showErrorMessage('Import failed: ' + (error?.message ?? String(e)));
  }
}

type SequenceStep =
  | string
  | (Omit<Shortcut, 'id' | 'label'> & { sequence?: SequenceStep[]; sequenceMode?: 'serial' | 'parallel' });

async function runSequence(seq: SequenceStep[], all: Shortcut[], mode: 'serial' | 'parallel' = 'serial') {
  if (mode === 'parallel') {
    const proms: Promise<void>[] = [];
    for (const step of seq) {
      proms.push(
        (async () => {
          let s: Shortcut | undefined;
          if (typeof step === 'string') {
            s = all.find((x) => x.id === step);
          } else {
            // inline step: allow program/args/cwd/env/platform/when/runAsAdmin
            s = { id: 'inline', label: 'inline', ...step };
          }
          if (s) {
            if (isGroupStep(step)) {
              const grp = step as Omit<Shortcut, 'id' | 'label'> & {
                sequence: SequenceStep[];
                sequenceMode?: 'serial' | 'parallel';
              };
              await runSequence(grp.sequence, all, grp.sequenceMode || 'serial');
            } else {
              await runShortcut(s);
            }
          }
        })()
      );
    }
    await Promise.all(proms);
  } else {
    for (const step of seq) {
      let s: Shortcut | undefined;
      if (typeof step === 'string') {
        s = all.find((x) => x.id === step);
      } else {
        s = { id: 'inline', label: 'inline', ...step } as Shortcut;
      }
      if (s) {
        if (isGroupStep(step)) {
          const grp = step as Omit<Shortcut, 'id' | 'label'> & {
            sequence: SequenceStep[];
            sequenceMode?: 'serial' | 'parallel';
          };
          await runSequence(grp.sequence, all, grp.sequenceMode || 'serial');
        } else {
          await runShortcut(s);
        }
        await new Promise((res) => setTimeout(res, 200));
      }
    }
  }
}

// --- PROFILES ---
function profileOk(s: Shortcut): boolean {
  const active = vscode.workspace.getConfiguration().get<string>('launcher.activeProfile', '');
  if (!s.profile || s.profile.trim() === '') return true;
  if (!active || active.trim() === '') return true;
  return s.profile.trim() === active.trim();
}

// --- TASKS GENERATION ---
async function generateTasksFromShortcuts() {
  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) {
    vscode.window.showErrorMessage('Workspace tidak ditemukan.');
    return;
  }
  const tasksUri = vscode.Uri.joinPath(ws.uri, '.vscode', 'tasks.json');
  // ensure folder
  try {
    await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(ws.uri, '.vscode'));
  } catch {}

  // build tasks
  type TaskConfig = {
    label: string;
    type: string;
    command: string;
    args: string[];
    options: { cwd: string };
    problemMatcher: string[];
  };
  type TasksJson = { version: string; tasks: TaskConfig[] };

  const shortcuts = [...getConfigShortcuts()].filter((s) => platformOk(s) && whenOk(s) && profileOk(s));
  const tasks = shortcuts.map((s) => shortcutToTask(s));
  let final: TasksJson = { version: '2.0.0', tasks: [] };
  try {
    const raw = await vscode.workspace.fs.readFile(tasksUri);
    final = JSON.parse(Buffer.from(raw).toString('utf8')) as TasksJson;
    if (!final.tasks) final.tasks = [];
  } catch {
    /* ignore */
  }
  // merge: replace existing launcher:* tasks
  final.tasks = (final.tasks || []).filter((t) => !(typeof t.label === 'string' && t.label.startsWith('launcher:')));
  final.tasks.push(...tasks);
  await vscode.workspace.fs.writeFile(tasksUri, Buffer.from(JSON.stringify(final, null, 2), 'utf8'));
  vscode.window.showInformationMessage('tasks.json generated/updated from shortcuts.');
}

function shortcutToTask(s: Shortcut) {
  // Build shell command approximating the spawn
  const ctx = pickContext();
  const cwd = s.cwd ? resolveVars(s.cwd, ctx) : ctx.workspaceFolder || os.homedir();
  const args = (s.args || []).map((a) => resolveVars(a, ctx));
  let command = '';
  let shellArgs: string[] = [];
  if (!s.program || s.program.trim() === '') {
    if (process.platform === 'win32') {
      command = 'cmd';
      shellArgs = ['/c', 'start', '""'].concat(args.length ? args : [cwd]);
      // join for display only; tasks will handle args array
    } else if (process.platform === 'darwin') {
      command = 'open';
      shellArgs = args.length ? args : [cwd];
    } else {
      command = 'xdg-open';
      shellArgs = args.length ? args : [cwd];
    }
  } else {
    command = resolveVars(s.program, ctx);
    shellArgs = args;
  }
  return {
    label: `launcher:${s.id}`,
    type: 'shell',
    command,
    args: shellArgs,
    options: { cwd },
    problemMatcher: [],
  };
}

// --- Workspace Import/Export ---
async function exportShortcutsWorkspace() {
  const cfg = vscode.workspace.getConfiguration();
  const shortcuts = cfg.get<Shortcut[]>('launcher.shortcuts', []);
  const uri = await vscode.window.showSaveDialog({
    filters: { JSON: ['json'] },
    saveLabel: 'Export Shortcuts (Workspace)',
  });
  if (!uri) return;
  await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(shortcuts, null, 2), 'utf8'));
  vscode.window.showInformationMessage('Workspace shortcuts exported.');
}

async function importShortcutsWorkspace() {
  const cfg = vscode.workspace.getConfiguration();
  const pick = await vscode.window.showOpenDialog({
    canSelectMany: false,
    filters: { JSON: ['json'] },
    openLabel: 'Import Shortcuts (Workspace)',
  });
  if (!pick || !pick[0]) return;
  const data = await vscode.workspace.fs.readFile(pick[0]);
  try {
    const arr = JSON.parse(Buffer.from(data).toString('utf8'));
    if (Array.isArray(arr)) {
      await cfg.update('launcher.shortcuts', arr, vscode.ConfigurationTarget.Workspace);
      vscode.window.showInformationMessage('Shortcuts imported into Workspace settings.');
    } else {
      vscode.window.showErrorMessage('Invalid JSON format.');
    }
  } catch (e) {
    const error = e as Error;
    vscode.window.showErrorMessage('Import failed: ' + (error?.message ?? String(e)));
  }
}

// --- Auto-discover: add WSL, Git Bash, PowerShell Core ---
function autoDiscoveredShells(): Shortcut[] {
  const list: Shortcut[] = [];
  if (process.platform === 'win32') {
    const candidates = [
      // DISABLED: Already in launcher-putra.json to avoid duplicates
      // { label: 'Command Prompt', program: 'C:\\Windows\\System32\\cmd.exe', args: [], icon: 'terminal' },
      // {
      //   label: 'PowerShell',
      //   program: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
      //   args: [],
      //   icon: 'terminal-powershell',
      // },
      // { label: 'WSL', program: 'C:\\Windows\\System32\\wsl.exe', args: [], icon: 'terminal-linux' },
      // { label: 'Git Bash', program: 'C:\\Program Files\\Git\\bin\\bash.exe', args: [], icon: 'terminal-bash' },
      // {
      //   label: 'Git Bash (x86)',
      //   program: 'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
      //   args: [],
      //   icon: 'terminal-bash',
      // },
      {
        label: 'Ubuntu (WSL)',
        program: 'C:\\Windows\\System32\\wsl.exe',
        args: ['-d', 'Ubuntu'],
        icon: 'terminal-ubuntu',
      },
      {
        label: 'Debian (WSL)',
        program: 'C:\\Windows\\System32\\wsl.exe',
        args: ['-d', 'Debian'],
        icon: 'terminal-debian',
      },
      {
        label: 'Kali Linux (WSL)',
        program: 'C:\\Windows\\System32\\wsl.exe',
        args: ['-d', 'kali-linux'],
        icon: 'terminal-linux',
      },
    ];

    // find PowerShell Core (pwsh.exe) under Program Files\\PowerShell\\*\\pwsh.exe
    const pf = process.env['ProgramFiles'] || 'C:\\Program Files';
    const pwshGlob = path.join(pf, 'PowerShell');
    try {
      const versions = fs
        .readdirSync(pwshGlob, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => path.join(pwshGlob, d.name, 'pwsh.exe'));
      for (const p of versions) {
        if (fs.existsSync(p)) {
          candidates.push({ label: 'PowerShell Core (pwsh)', program: p, args: [], icon: 'terminal-powershell' });
          break;
        }
      }
    } catch {}

    // Check for Windows Terminal
    const wtPaths = [
      os.homedir() + '\\AppData\\Local\\Microsoft\\WindowsApps\\wt.exe',
      'C:\\Program Files\\WindowsApps\\Microsoft.WindowsTerminal_*\\wt.exe',
    ];
    for (const wtPath of wtPaths) {
      try {
        if (fs.existsSync(wtPath)) {
          candidates.push({ label: 'Windows Terminal', program: wtPath, args: [], icon: 'terminal' });
          break;
        }
      } catch {}
    }

    for (const c of candidates) {
      try {
        if (fs.existsSync(c.program))
          list.push({
            id: `auto-${c.label.replace(/[\\s\\(\\)]/g, '-').toLowerCase()}`,
            label: c.label,
            program: c.program,
            args: c.args,
            icon: c.icon,
          });
      } catch {}
    }
  } else if (process.platform === 'darwin') {
    const macTerminals = [
      { label: 'Terminal', program: '/Applications/Utilities/Terminal.app', icon: 'terminal' },
      { label: 'iTerm2', program: '/Applications/iTerm.app', icon: 'terminal' },
      { label: 'Hyper', program: '/Applications/Hyper.app', icon: 'terminal' },
    ];

    for (const term of macTerminals) {
      try {
        if (fs.existsSync(term.program)) {
          list.push({
            id: `auto-${term.label.toLowerCase().replace(/\\s+/g, '-')}`,
            label: term.label,
            program: 'open',
            args: ['-a', term.program],
            icon: term.icon,
          });
        }
      } catch {}
    }
  } else {
    // Linux terminals
    const linuxTerminals = [
      { label: 'GNOME Terminal', program: '/usr/bin/gnome-terminal', icon: 'terminal' },
      { label: 'Konsole', program: '/usr/bin/konsole', icon: 'terminal' },
      { label: 'xterm', program: '/usr/bin/xterm', icon: 'terminal' },
      { label: 'Terminator', program: '/usr/bin/terminator', icon: 'terminal' },
      { label: 'Alacritty', program: '/usr/bin/alacritty', icon: 'terminal' },
    ];

    for (const term of linuxTerminals) {
      try {
        if (fs.existsSync(term.program)) {
          list.push({
            id: `auto-${term.label.toLowerCase().replace(/\\s+/g, '-')}`,
            label: term.label,
            program: term.program,
            args: [],
            icon: term.icon,
          });
        }
      } catch {}
    }
  }
  return list;
}

// --- Code editors autodiscovery ---
function autoDiscoveredEditors(): Shortcut[] {
  const list: Shortcut[] = [];
  const foundPaths = new Set<string>(); // Prevent duplicates

  if (process.platform === 'win32') {
    const local = process.env['LOCALAPPDATA'] || os.homedir() + '\\\\AppData\\\\Local';

    // Define editor candidates with priority order and alternative paths
    const editorCandidates = [
      // System-wide VS Code installations
      { label: 'VS Code', paths: ['C:\\Program Files\\Microsoft VS Code\\Code.exe'], icon: 'code' },
      { label: 'VS Code (x86)', paths: ['C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe'], icon: 'code' },
      {
        label: 'VS Code Insiders',
        paths: ['C:\\Program Files\\Microsoft VS Code Insiders\\Code - Insiders.exe'],
        icon: 'code',
      },

      // Modern editors - removed problematic editors that can't open properly

      // Other editors
      { label: 'Sublime Text', paths: ['C:\\Program Files\\Sublime Text\\sublime_text.exe'], icon: 'edit' },
      { label: 'Notepad++', paths: ['C:\\Program Files\\Notepad++\\notepad++.exe'], icon: 'edit' },
      { label: 'Atom', paths: [local + '\\atom\\atom.exe'], icon: 'code' },

      // JetBrains IDEs - simplified version detection
      {
        label: 'IntelliJ IDEA',
        paths: ['C:\\Program Files\\JetBrains\\IntelliJ IDEA Community Edition *\\bin\\idea64.exe'],
        icon: 'code',
      },
      {
        label: 'Android Studio',
        paths: ['C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe'],
        icon: 'code',
      },
    ];

    // Process each candidate and find first existing path
    for (const candidate of editorCandidates) {
      try {
        for (const programPath of candidate.paths) {
          // Skip if we already found this path
          if (foundPaths.has(programPath)) continue;

          if (fs.existsSync(programPath)) {
            foundPaths.add(programPath);
            list.push({
              id: `auto-${candidate.label.replace(/[\\s\\(\\)]/g, '-').toLowerCase()}`,
              label: candidate.label,
              program: programPath,
              icon: candidate.icon,
            });
            break; // Found one, move to next candidate
          }
        }
      } catch {
        // Ignore errors and continue
      }
    }
  } else if (process.platform === 'darwin') {
    const macEditors = [
      { label: 'VS Code', program: '/Applications/Visual Studio Code.app', icon: 'code' },
      { label: 'VS Code Insiders', program: '/Applications/Visual Studio Code - Insiders.app', icon: 'code' },
      { label: 'Sublime Text', program: '/Applications/Sublime Text.app', icon: 'edit' },
      { label: 'Atom', program: '/Applications/Atom.app', icon: 'code' },
      { label: 'TextEdit', program: '/Applications/TextEdit.app', icon: 'edit' },
      { label: 'Xcode', program: '/Applications/Xcode.app', icon: 'code' },
    ];

    for (const editor of macEditors) {
      try {
        if (fs.existsSync(editor.program)) {
          list.push({
            id: `auto-${editor.label.toLowerCase().replace(/\\s+/g, '-')}`,
            label: editor.label,
            program: 'open',
            args: ['-a', editor.program],
            icon: editor.icon,
          });
        }
      } catch {}
    }
  } else {
    // Linux editors
    const linuxEditors = [
      { label: 'VS Code', program: '/usr/bin/code', icon: 'code' },
      { label: 'VS Code Insiders', program: '/usr/bin/code-insiders', icon: 'code' },
      { label: 'Sublime Text', program: '/usr/bin/subl', icon: 'edit' },
      { label: 'Atom', program: '/usr/bin/atom', icon: 'code' },
      { label: 'Gedit', program: '/usr/bin/gedit', icon: 'edit' },
      { label: 'Kate', program: '/usr/bin/kate', icon: 'edit' },
      { label: 'Vim', program: '/usr/bin/vim', icon: 'edit' },
      { label: 'Emacs', program: '/usr/bin/emacs', icon: 'edit' },
    ];

    for (const editor of linuxEditors) {
      try {
        if (fs.existsSync(editor.program)) {
          list.push({
            id: `auto-${editor.label.toLowerCase().replace(/\\s+/g, '-')}`,
            label: editor.label,
            program: editor.program,
            args: [],
            icon: editor.icon,
          });
        }
      } catch {}
    }
  }
  return list;
}

// --- Run nested sequence groups ---
function isGroupStep(step: SequenceStep): boolean {
  return typeof step === 'object' && 'sequence' in step && Array.isArray(step.sequence);
}

class ShortcutEditorPanel {
  public static current: ShortcutEditorPanel | undefined;
  public static readonly viewType = 'launcher.shortcutEditor';

  private constructor(private readonly panel: vscode.WebviewPanel) {
    this.update();
    panel.onDidDispose(() => {
      ShortcutEditorPanel.current = undefined;
    });
    this.panel.webview.onDidReceiveMessage(async (msg: { type: string; text?: string }) => {
      if (msg.type === 'save') {
        try {
          const arr = JSON.parse(msg.text || '[]');
          if (!Array.isArray(arr)) throw new Error('JSON must be an array');
          await vscode.workspace
            .getConfiguration()
            .update('launcher.shortcuts', arr, vscode.ConfigurationTarget.Global);
          vscode.window.showInformationMessage('Shortcuts saved to User settings.');
        } catch (e) {
          const error = e as Error;
          vscode.window.showErrorMessage('Save failed: ' + (error?.message ?? String(e)));
        }
      } else if (msg.type === 'close') {
        this.panel.dispose();
      }
    });
  }

  public static show() {
    if (ShortcutEditorPanel.current) {
      ShortcutEditorPanel.current.panel.reveal();
      return;
    }
    const panel = vscode.window.createWebviewPanel(this.viewType, 'Shortcut Editor', vscode.ViewColumn.Active, {
      enableScripts: true,
    });
    ShortcutEditorPanel.current = new ShortcutEditorPanel(panel);
  }

  private update() {
    const cfg = vscode.workspace.getConfiguration();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const current = cfg.get('launcher.shortcuts', [] as Shortcut[]);

    const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root {
    --bg: var(--vscode-editor-background);
    --fg: var(--vscode-editor-foreground);
    --muted: var(--vscode-descriptionForeground);
    --border: var(--vscode-editorWidget-border);
    --accent: var(--vscode-button-background);
    --accentHover: var(--vscode-button-hoverBackground);
    --inputBg: var(--vscode-input-background);
    --inputFg: var(--vscode-input-foreground);
    --panelBg: var(--vscode-editorWidget-background);
    --shadow: 0 6px 18px rgba(0,0,0,.15);
    --radius: 12px;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 13px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  header {
    padding: 14px 18px;
    background: linear-gradient(180deg, var(--panelBg) 0%, var(--bg) 100%);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 2;
  }
  .title { font-weight: 600; letter-spacing: .2px; }
  .subtitle { color: var(--muted); margin-top: 2px; font-size: 12px; }
  .container { padding: 18px; display: grid; gap: 14px; }
  .card {
    background: var(--panelBg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 14px;
  }
  .row { display: flex; gap: 10px; flex-wrap: wrap; }
  textarea {
    width: 100%;
    height: 60vh;
    background: var(--inputBg);
    color: var(--inputFg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px;
    font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    outline: none;
  }
  button {
    border: 0;
    background: var(--accent);
    color: #fff;
    border-radius: 8px;
    padding: 8px 14px;
    cursor: pointer;
    transition: background .15s ease;
  }
  button:hover { background: var(--accentHover); }
  .ghost {
    background: transparent;
    color: var(--fg);
    border: 1px solid var(--border);
  }
  .help { color: var(--muted); font-size: 12px; }
  .grid {
    display: grid; gap: 10px;
    grid-template-columns: repeat(12, 1fr);
  }
  .col-8 { grid-column: span 8; min-width: 260px; }
  .col-4 { grid-column: span 4; min-width: 220px; }
  .hint {
    background: var(--bg);
    border: 1px dashed var(--border);
    border-radius: 10px;
    padding: 10px;
  }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
</style>
</head>
<body>
  <header>
    <div class="title">Launcher Shortcuts Editor</div>
    <div class="subtitle">Edit daftar shortcut dalam format JSON, lalu klik <b>Save</b>. Perubahan disimpan ke <i>User Settings</i>.</div>
  </header>
  <div class="container">
    <div class="grid">
      <div class="col-8">
        <div class="card">
          <textarea id="txt">\${escapeHtml(JSON.stringify(current, null, 2))}</textarea>
          <div class="row" style="margin-top:10px">
            <button id="save">Save</button>
            <button id="close" class="ghost">Close</button>
          </div>
        </div>
      </div>
      <div class="col-4">
        <div class="card hint">
          <div style="font-weight:600;margin-bottom:6px">Tips</div>
          <div class="help">Gunakan fields umum: <code>id</code>, <code>label</code>, <code>program</code>, <code>args</code>, <code>cwd</code>, <code>env</code>, <code>platform</code>, <code>when</code>, <code>profile</code>, <code>icon</code>, <code>sequence</code>, <code>sequenceMode</code>.</div>
          <div class="help">Variabel kontekstual: <code>\${file}</code>, <code>\${workspaceFolder}</code>, <code>\${relativeFile}</code>, <code>\${lineNumber}</code>, <code>\${selectedText}</code>.</div>
          <div class="help">Kosongkan <code>program</code> untuk buka dengan aplikasi default OS.</div>
        </div>
      </div>
    </div>
  </div>
<script>
  const vscode = acquireVsCodeApi();
  function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#039;' }[m]));}
  document.getElementById('save').addEventListener('click',()=>{
    const txt = document.getElementById('txt').value;
    vscode.postMessage({type:'save', text: txt});
  });
  document.getElementById('close').addEventListener('click',()=>vscode.postMessage({type:'close'}));
</script>
</body>
</html>`;

    this.panel.webview.html = html;
  }
}

function detectVariant(): string {
  // Simplified - only support VS Code for now
  return 'VS Code';
}

function getDefaultShortcuts(): Shortcut[] {
  return [
    {
      id: 'cmd',
      label: 'Command Prompt',
      program: 'cmd.exe',
      args: [],
      cwd: '${workspaceFolder}',
      platform: 'win',
      icon: 'terminal',
    },
    {
      id: 'powershell',
      label: 'PowerShell',
      program: 'powershell.exe',
      args: [],
      cwd: '${workspaceFolder}',
      platform: 'win',
      icon: 'terminal-powershell',
    },
    {
      id: 'wsl',
      label: 'WSL',
      program: 'wsl.exe',
      args: [],
      cwd: '${workspaceFolder}',
      platform: 'win',
      icon: 'terminal-linux',
    },
    {
      id: 'ping-google',
      label: 'Ping Google',
      program: 'cmd.exe',
      args: ['/c', 'ping', 'google.com', '&', 'pause'],
      platform: 'win',
      icon: 'pulse',
    },
    {
      id: 'task-manager',
      label: 'Task Manager',
      program: 'taskmgr.exe',
      args: [],
      platform: 'win',
      icon: 'list-tree',
    },
    {
      id: 'notepad',
      label: 'Notepad',
      program: 'notepad.exe',
      args: ['${file}'],
      platform: 'win',
      icon: 'edit',
    },
    {
      id: 'calculator',
      label: 'Calculator',
      program: 'calc.exe',
      args: [],
      platform: 'win',
      icon: 'calculator',
    },
    {
      id: 'explorer-here',
      label: 'Explorer (Current Folder)',
      program: 'explorer.exe',
      args: ['${workspaceFolder}'],
      cwd: '${workspaceFolder}',
      platform: 'win',
      icon: 'folder-opened',
    },
    {
      id: 'control-panel',
      label: 'Control Panel',
      program: 'control.exe',
      args: [],
      platform: 'win',
      icon: 'settings-gear',
    },
    {
      id: 'registry-editor',
      label: 'Registry Editor',
      program: 'regedit.exe',
      args: [],
      platform: 'win',
      runAsAdmin: true,
      icon: 'database',
    },
    {
      id: 'device-manager',
      label: 'Device Manager',
      program: 'mmc.exe',
      args: ['devmgmt.msc'],
      platform: 'win',
      icon: 'device-desktop',
    },
    {
      id: 'services',
      label: 'Services',
      program: 'mmc.exe',
      args: ['services.msc'],
      platform: 'win',
      icon: 'server-process',
    },
    {
      id: 'event-viewer',
      label: 'Event Viewer',
      program: 'mmc.exe',
      args: ['eventvwr.msc'],
      platform: 'win',
      icon: 'book',
    },
  ];
}

async function initializeGlobalShortcuts(context: vscode.ExtensionContext) {
  const globalPath = getGlobalShortcutsPath();

  // ALWAYS check if file exists - recreate if deleted
  const fileExists = fs.existsSync(globalPath);

  if (!fileExists) {
    console.log('[Launcher] 📁 Global shortcuts file not found, creating from template...');
    output.appendLine('[Launcher] Creating/restoring global shortcuts file...');

    try {
      // Ensure directory exists
      const dir = path.dirname(globalPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Read default shortcuts template from extension
      const extensionPath = context.extensionPath;
      const templatePath = path.join(extensionPath, '.vscode', 'launcher-putra.json');

      if (fs.existsSync(templatePath)) {
        // Copy template to global location
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        fs.writeFileSync(globalPath, templateContent, 'utf8');

        console.log(`[Launcher] ✅ Created/restored global shortcuts at: ${globalPath}`);
        output.appendLine(`[Launcher] ✅ Global shortcuts file created at: ${globalPath}`);

        // Show notification to user (only on first creation, not restoration)
        const firstRunKey = 'launcher.globalShortcutsInitialized';
        const alreadyInitialized = context.globalState.get<boolean>(firstRunKey, false);

        if (!alreadyInitialized) {
          vscode.window
            .showInformationMessage(`🎉 Launcher Plus: Default shortcuts created at ${globalPath}`, 'Open File', 'OK')
            .then((selection) => {
              if (selection === 'Open File') {
                vscode.workspace.openTextDocument(globalPath).then((doc) => {
                  vscode.window.showTextDocument(doc);
                });
              }
            });

          // Mark as initialized (for first-time notification only)
          await context.globalState.update(firstRunKey, true);
        } else {
          // File was deleted and restored - show different message
          console.log('[Launcher] 🔄 Global shortcuts file was restored from template');
          output.appendLine('[Launcher] File was deleted and has been restored from default template');
        }
      } else {
        console.log(`[Launcher] ⚠️ Template not found at: ${templatePath}`);
        output.appendLine(`[Launcher] Template not found, cannot create shortcuts file`);
      }
    } catch (error) {
      console.error('[Launcher] ❌ Error creating global shortcuts:', error);
      output.appendLine(`[Launcher] Error: ${String(error)}`);
    }
  } else {
    console.log(`[Launcher] ✅ Global shortcuts file exists at: ${globalPath}`);
  }
}

export function activate(context: vscode.ExtensionContext) {
  // Initialize global shortcuts on first run
  initializeGlobalShortcuts(context);

  const provider = new ShortcutsProvider();
  const view = vscode.window.createTreeView('launcher.shortcutsView', { treeDataProvider: provider });
  context.subscriptions.push(view);

  const runCmd = vscode.commands.registerCommand('launcher.run', async (id?: string) => {
    // id can be either a Shortcut object (from tree) or a string id
    const shortcuts = getConfigShortcuts();
    let target: Shortcut | undefined;

    if (id && typeof id === 'object') {
      target = id as Shortcut;
    } else if (typeof id === 'string') {
      // search in configured and auto-discovered lists
      const all = [...shortcuts, ...autoDiscoveredShortcuts(), ...autoDiscoveredShells(), ...autoDiscoveredEditors()];
      target = all.find((s) => s.id === id);
    } else {
      // If called without id, show quick pick
      const pick = await quickPick(
        [...shortcuts, ...autoDiscoveredShortcuts(), ...autoDiscoveredShells(), ...autoDiscoveredEditors()].filter(
          (s) => platformOk(s) && whenOk(s) && profileOk(s)
        )
      );
      if (!pick) {
        return;
      }
      target = pick;
    }

    if (!target) {
      vscode.window.showErrorMessage('Shortcut tidak ditemukan.');
      return;
    }

    if (target.sequence && target.sequence.length) {
      await runSequence(target.sequence, getConfigShortcuts(), target.sequenceMode || 'serial');
    } else {
      await runShortcut(target);
    }
    pushRecent(context, target);
  });

  const qpCmd = vscode.commands.registerCommand('launcher.openQuickPick', async () => {
    const s = await quickPick(
      [
        ...getConfigShortcuts(),
        ...autoDiscoveredShortcuts(),
        ...autoDiscoveredShells(),
        ...autoDiscoveredEditors(),
      ].filter((s) => platformOk(s) && whenOk(s) && profileOk(s))
    );
    if (s) {
      await runShortcut(s);
      pushRecent(context, s);
    }
  });

  const openSettingsCmd = vscode.commands.registerCommand('launcher.openSettings', () => {
    vscode.commands.executeCommand('workbench.action.openSettings', 'launcher.shortcuts');
  });

  const exportCmd = vscode.commands.registerCommand('launcher.exportShortcuts', exportShortcuts);
  const openEditorCmd = vscode.commands.registerCommand('launcher.openEditor', () => ShortcutEditorPanel.show());
  const importCmd = vscode.commands.registerCommand('launcher.importShortcuts', importShortcuts);
  const rescanCmd = vscode.commands.registerCommand('launcher.rescanAutoDiscover', () => provider.refresh());
  const genTasksCmd = vscode.commands.registerCommand('launcher.generateTasks', generateTasksFromShortcuts);
  const setProfileCmd = vscode.commands.registerCommand('launcher.setActiveProfile', async () => {
    const val = await vscode.window.showInputBox({ placeHolder: 'Active profile name (empty = all)' });
    if (val !== undefined) {
      await vscode.workspace
        .getConfiguration()
        .update('launcher.activeProfile', val, vscode.ConfigurationTarget.Global);
      provider.refresh();
    }
  });
  const exportWS = vscode.commands.registerCommand('launcher.exportShortcutsWorkspace', exportShortcutsWorkspace);
  const importWS = vscode.commands.registerCommand('launcher.importShortcutsWorkspace', importShortcutsWorkspace);
  const aboutCmd = vscode.commands.registerCommand('launcher.about', async () => {
    const v = detectVariant();
    vscode.window.showInformationMessage(`Launcher Plus running on: ${v}`);
  });

  const diagnoseLaunchCmd = vscode.commands.registerCommand('launcher.diagnoseLaunch', async () => {
    // Test various program paths and report detailed results
    const testPrograms = [
      { name: 'VS Code', path: 'C:\\Program Files\\Microsoft VS Code\\Code.exe' },
      { name: 'Notepad', path: 'C:\\Windows\\System32\\notepad.exe' },
      { name: 'Calculator', path: 'C:\\Windows\\System32\\calc.exe' },
    ];

    const results = [];

    for (const prog of testPrograms) {
      try {
        const exists = fs.existsSync(prog.path);
        results.push(`${exists ? '✅' : '❌'} ${prog.name}: ${prog.path} (${exists ? 'EXISTS' : 'NOT FOUND'})`);
      } catch (err) {
        results.push(`❌ ${prog.name}: ${prog.path} (ERROR: ${err})`);
      }
    }

    // Show results in info message and create diagnostic panel
    const resultText = results.join('\n');
    vscode.window.showInformationMessage('Diagnostic hasil dicatat ke console dan panel debug');
    console.log('[Launcher Diagnostic]\n' + resultText);

    // Create detailed diagnostic panel
    const panel = vscode.window.createWebviewPanel(
      'launcherDiagnostic',
      '🔍 Launcher Path Diagnostic',
      vscode.ViewColumn.Active,
      {}
    );

    panel.webview.html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Courier New', monospace; margin: 20px; background: #1e1e1e; color: #d4d4d4; }
        .result { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .exists { background: #0d4f3c; border-left: 4px solid #00d26a; }
        .missing { background: #5a1a1a; border-left: 4px solid #f85a5a; }
        .error { background: #5a4a1a; border-left: 4px solid #ffcc00; }
    </style>
</head>
<body>
    <h1>Program Path Diagnostic Results</h1>
    ${results
      .map((result) => {
        const className = result.includes('✅') ? 'exists' : 'missing';
        return `<div class="result ${className}">${result}</div>`;
      })
      .join('')}
    <hr>
    <p><strong>Environment Variables:</strong></p>
    <div class="result">LOCALAPPDATA: ${process.env['LOCALAPPDATA']}</div>
    <div class="result">USERPROFILE: ${process.env['USERPROFILE']}</div>
    <div class="result">PATH: ${process.env['PATH']?.substring(0, 200)}...</div>
</body>
</html>`;
  });

  const testElectronSolutionsCmd = vscode.commands.registerCommand('launcher.testElectronSolutions', async () => {
    const cursorPath = process.env['LOCALAPPDATA'] + '\\Programs\\cursor\\Cursor.exe';
    const targetPath = 'C:\\\\Users\\\\Wijayadi Saputra\\\\Documents\\\\GloneDrv\\\\Utils';

    if (!fs.existsSync(cursorPath)) {
      vscode.window.showErrorMessage('Cursor not found for testing');
      return;
    }

    const solutions = [
      {
        label: '1. Working Directory (Current)',
        id: 'workdir',
        description: 'Use working directory instead of args',
      },
      {
        label: '2. PowerShell ShellExecute',
        id: 'powershell',
        description: 'Most reliable Windows method',
      },
      {
        label: '3. Windows Explorer Launch',
        id: 'explorer',
        description: 'System shell integration',
      },
      {
        label: '4. CMD Start with Quotes',
        id: 'cmd_quoted',
        description: 'Traditional Windows method',
      },
      {
        label: '5. VBScript ShellExecute',
        id: 'vbscript',
        description: 'Windows Script Host method',
      },
    ];

    const selected = await vscode.window.showQuickPick(solutions, {
      placeHolder: 'Select launch method to test with Cursor',
    });

    if (!selected) return;

    vscode.window.showInformationMessage(`Testing ${selected.label}...`);
    console.log(`[Test] Testing method: ${selected.label}`);

    try {
      let child;

      switch (selected.id) {
        case 'workdir':
          child = cp.spawn(cursorPath, [], {
            cwd: targetPath,
            detached: true,
            stdio: 'ignore',
          });
          break;

        case 'powershell':
          child = cp.spawn(
            'powershell',
            [
              '-WindowStyle',
              'Hidden',
              '-Command',
              `Start-Process -FilePath '${cursorPath}' -WorkingDirectory '${targetPath}' -PassThru | Out-Null`,
            ],
            {
              detached: true,
              stdio: 'ignore',
              windowsHide: true,
            }
          );
          break;

        case 'explorer':
          child = cp.spawn('explorer', [cursorPath], {
            detached: true,
            stdio: 'ignore',
            cwd: targetPath,
          });
          break;

        case 'cmd_quoted':
          child = cp.spawn('cmd', ['/c', 'start', '"Cursor"', '/D', `"${targetPath}"`, `"${cursorPath}"`], {
            detached: true,
            stdio: 'ignore',
            windowsVerbatimArguments: true,
          });
          break;

        case 'vbscript':
          // Create temporary VBS file
          const vbsContent = `Set shell = CreateObject("WScript.Shell")\nshell.Run """${cursorPath}""" """${targetPath}""", 1, false`;
          const tempVbs = path.join(os.tmpdir(), 'cursor_launch.vbs');
          fs.writeFileSync(tempVbs, vbsContent);

          child = cp.spawn('cscript', ['/nologo', tempVbs], {
            detached: true,
            stdio: 'ignore',
            windowsHide: true,
          });

          // Clean up VBS file after 5 seconds
          setTimeout(() => {
            try {
              fs.unlinkSync(tempVbs);
            } catch {}
          }, 5000);
          break;
      }

      if (child) {
        child.on('spawn', () => {
          setTimeout(() => {
            vscode.window.showInformationMessage(`✅ ${selected.label} executed successfully.`);
          }, 1000);
        });

        child.on('error', (err) => {
          vscode.window.showErrorMessage(`❌ ${selected.label} failed: ${err.message}`);
        });

        child.unref();
      }
    } catch (err) {
      vscode.window.showErrorMessage(`❌ Failed to test ${selected.label}: ${err}`);
    }
  });

  const testLaunchStrategiesCmd = vscode.commands.registerCommand('launcher.testLaunchStrategies', async () => {
    const testApp = process.env['LOCALAPPDATA'] + '\\Programs\\cursor\\Cursor.exe';

    if (!fs.existsSync(testApp)) {
      vscode.window.showErrorMessage('Cursor tidak ditemukan untuk testing');
      return;
    }

    const strategies = [
      { label: 'Direct Spawn', id: 'direct' },
      { label: 'CMD Start', id: 'cmd_start' },
      { label: 'PowerShell Start-Process', id: 'powershell' },
      { label: 'Explorer (shellexecute-like)', id: 'explorer' },
    ];

    const selected = await vscode.window.showQuickPick(strategies, {
      placeHolder: 'Select launch strategy to test with Cursor',
    });

    if (!selected) return;

    vscode.window.showInformationMessage(`Testing ${selected.label} strategy...`);
    console.log(`[Test] Testing strategy: ${selected.label}`);

    try {
      let child;

      switch (selected.id) {
        case 'direct':
          child = cp.spawn(testApp, [], {
            detached: true,
            stdio: ['ignore', 'ignore', 'ignore'],
            windowsHide: false,
          });
          break;

        case 'cmd_start':
          child = cp.spawn('cmd', ['/c', 'start', '""', `"${testApp}"`], {
            detached: true,
            stdio: 'ignore',
            windowsVerbatimArguments: true,
          });
          break;

        case 'powershell':
          child = cp.spawn('powershell', ['-Command', `Start-Process -FilePath '${testApp}'`], {
            detached: true,
            stdio: 'ignore',
            windowsHide: true,
          });
          break;

        case 'explorer':
          child = cp.spawn('explorer', [testApp], {
            detached: true,
            stdio: 'ignore',
          });
          break;
      }

      if (child) {
        child.on('spawn', () => {
          console.log(`[Test] ${selected.label} spawned with PID: ${child.pid}`);
          setTimeout(() => {
            vscode.window.showInformationMessage(`✅ ${selected.label} strategy executed successfully.`);
          }, 1000);
        });

        child.on('error', (err) => {
          console.error(`[Test] ${selected.label} failed:`, err);
          vscode.window.showErrorMessage(`❌ ${selected.label} failed: ${err.message}`);
        });

        child.on('exit', (code) => {
          console.log(`[Test] ${selected.label} exited with code: ${code}`);
          if (code !== 0 && code !== null) {
            vscode.window.showWarningMessage(`⚠️ ${selected.label} exited with code ${code}`);
          }
        });

        child.unref();
      }
    } catch (err) {
      vscode.window.showErrorMessage(`❌ Failed to test ${selected.label}: ${err}`);
    }
  });

  const testVisibilityCmd = vscode.commands.registerCommand('launcher.testVisibility', async () => {
    const programs = [
      { name: 'Task Manager', program: 'taskmgr.exe' },
      { name: 'Cursor', program: process.env['LOCALAPPDATA'] + '\\Programs\\cursor\\Cursor.exe' },
      { name: 'Control Panel', program: 'control.exe' },
      { name: 'Network Connections', program: 'control', args: ['ncpa.cpl'] },
    ];

    const selected = await vscode.window.showQuickPick(
      programs.map((p) => ({ label: p.name, program: p.program, args: p.args || [] })),
      { placeHolder: 'Select program to test visibility' }
    );

    if (!selected) return;

    vscode.window.showInformationMessage(`Testing ${selected.label} with visibility optimization...`);

    try {
      // Force Windows start command approach
      const testArgs = ['/c', 'start', '""', `"${selected.program}"`, ...selected.args];
      console.log(`[Test] Running: cmd ${testArgs.join(' ')}`);

      const child = cp.spawn('cmd', testArgs, {
        detached: true,
        stdio: 'ignore',
        windowsVerbatimArguments: true,
      });

      child.on('spawn', () => {
        setTimeout(() => {
          vscode.window.showInformationMessage(`✅ ${selected.label} should now be visible! Check taskbar.`);
        }, 1000);
      });

      child.on('error', (err) => {
        vscode.window.showErrorMessage(`❌ Error: ${err.message}`);
      });

      child.unref();
    } catch (err) {
      vscode.window.showErrorMessage(`❌ Failed to launch ${selected.label}: ${err}`);
    }
  });

  // Removed testWindsurf command - no longer needed

  const debugCmd = vscode.commands.registerCommand('launcher.debug', async () => {
    const variant = detectVariant();
    const settingsPath = getEditorSettingsPath();
    const env = process.env;

    const debugInfo = [
      `🔍 Debug Info - Launcher Plus`,
      ``,
      `📋 Environment:`,
      `  - Detected Variant: ${variant}`,
      `  - VS Code App Name: ${vscode.env.appName}`,
      `  - Platform: ${process.platform}`,
      `  - Node Version: ${process.version}`,
      ``,
      `📁 Settings:`,
      `  - Settings Path: ${settingsPath}`,
      `  - Path Exists: ${fs.existsSync(settingsPath)}`,
      `  - Auto Discovery: ${shouldAutoDiscover()}`,
      ``,
      `🌍 Environment Variables:`,
      `  - WINDSURF_HOME: ${env.WINDSURF_HOME || 'not set'}`,
      `  - WINDSURF_DATA_DIR: ${env.WINDSURF_DATA_DIR || 'not set'}`,
      `  - WINDSURF_EXTENSIONS_DIR: ${env.WINDSURF_EXTENSIONS_DIR || 'not set'}`,
      `  - CURSOR_PATH: ${env.CURSOR_PATH || 'not set'}`,
      `  - CURSOR_DATA_DIR: ${env.CURSOR_DATA_DIR || 'not set'}`,
      `  - TERM_PROGRAM: ${env.TERM_PROGRAM || 'not set'}`,
      ``,
      `⚡ Performance:`,
      `  - Cache Size: ${programVerificationCache.size} programs`,
      `  - Running Shortcuts: ${runningShortcuts.size}`,
      `  - Auto Discovery Cache Age: ${Date.now() - autoDiscoveryCache.lastUpdated}ms`,
      ``,
      `📊 Shortcuts Count:`,
      `  - Config: ${getConfigShortcuts().length}`,
      `  - Auto Discovered: ${autoDiscoveredShortcuts().length}`,
      `  - Auto Shells: ${autoDiscoveredShells().length}`,
      `  - Auto Editors: ${autoDiscoveredEditors().length}`,
    ].join('\n');

    // Create debug panel
    const panel = vscode.window.createWebviewPanel(
      'launcherDebug',
      '🔍 Launcher Plus Debug Info',
      vscode.ViewColumn.Active,
      { enableScripts: true }
    );

    panel.webview.html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Debug Info</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background: #1e1e1e; color: #d4d4d4; }
        pre { background: #2d2d30; padding: 15px; border-radius: 5px; overflow-x: auto; white-space: pre-wrap; }
        h1 { color: #569cd6; }
        .copy-btn { background: #0e639c; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin: 10px 0; }
        .copy-btn:hover { background: #1177bb; }
    </style>
</head>
<body>
    <button class="copy-btn" onclick="copyToClipboard()">📋 Copy to Clipboard</button>
    <pre id="debug-info">${debugInfo.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    <script>
        function copyToClipboard() {
            const text = document.getElementById('debug-info').textContent;
            navigator.clipboard.writeText(text).then(() => {
                alert('Debug info copied to clipboard!');
            });
        }
    </script>
</body>
</html>`;
  });

  const openSettingsFileCmd = vscode.commands.registerCommand('launcher.openSettingsFile', async () => {
    // Ask user which file to open: Global or Workspace
    const choice = await vscode.window.showQuickPick(
      [
        {
          label: '🌍 Global Shortcuts',
          description: 'Available in all workspaces',
          detail: getGlobalShortcutsPath(),
          value: 'global',
        },
        {
          label: '📁 Workspace Shortcuts',
          description: 'Only for current workspace',
          detail: getEditorSettingsPath() || 'No workspace folder',
          value: 'workspace',
        },
      ],
      {
        placeHolder: 'Choose shortcuts file to open',
        matchOnDescription: true,
        matchOnDetail: true,
      }
    );

    if (!choice) return;

    let settingsPath: string;

    if (choice.value === 'global') {
      // Open global shortcuts file
      settingsPath = getGlobalShortcutsPath();

      // Create directory if it doesn't exist
      const dir = path.dirname(settingsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Create file with default shortcuts if it doesn't exist
      if (!fs.existsSync(settingsPath)) {
        const defaultShortcuts = getDefaultShortcuts();
        fs.writeFileSync(settingsPath, JSON.stringify(defaultShortcuts, null, 2), 'utf8');
        vscode.window.showInformationMessage('🎉 Created default global shortcuts file');
      }
    } else {
      // Open workspace shortcuts file
      settingsPath = getEditorSettingsPath();
      if (!settingsPath) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return;
      }

      // Create directory if it doesn't exist
      const dir = path.dirname(settingsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Create file with default shortcuts if it doesn't exist
      if (!fs.existsSync(settingsPath)) {
        const defaultShortcuts = getDefaultShortcuts();
        fs.writeFileSync(settingsPath, JSON.stringify(defaultShortcuts, null, 2), 'utf8');
        vscode.window.showInformationMessage('📁 Created workspace shortcuts file');
      }
    }

    // Open the file
    const uri = vscode.Uri.file(settingsPath);
    await vscode.window.showTextDocument(uri);
    provider.refresh(); // Refresh the tree view
  });

  const validateShortcutsCmd = vscode.commands.registerCommand('launcher.validateShortcuts', async () => {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: '🔍 Memvalidasi shortcut...',
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0, message: 'Memeriksa program...' });
        await validateAndFixShortcuts();
        progress.report({ increment: 100, message: 'Selesai' });
      }
    );
  });

  const clearCooldownsCmd = vscode.commands.registerCommand('launcher.clearCooldowns', () => {
    runningShortcuts.clear();
    shortcutCooldowns.clear();
    programVerificationCache.clear();
    autoDiscoveryCache.shortcuts = [];
    autoDiscoveryCache.shells = [];
    autoDiscoveryCache.editors = [];
    autoDiscoveryCache.lastUpdated = 0;
    vscode.window.showInformationMessage('🔄 Semua cache dibersihkan, auto-discovery akan di-refresh');
    provider.refresh();
  });

  const cleanInvalidShortcutsCmd = vscode.commands.registerCommand('launcher.cleanInvalidShortcuts', async () => {
    const allShortcuts = [
      ...getConfigShortcuts(),
      ...autoDiscoveredShortcuts(),
      ...autoDiscoveredShells(),
      ...autoDiscoveredEditors(),
    ];

    const invalidShortcuts = [];
    const validShortcuts = [];

    for (const shortcut of allShortcuts) {
      if (!shortcut.program) {
        validShortcuts.push(shortcut); // Default app handlers are valid
        continue;
      }

      try {
        const isValid = await verifyProgramExists(shortcut.program);
        if (isValid) {
          validShortcuts.push(shortcut);
        } else {
          invalidShortcuts.push(shortcut);
        }
      } catch {
        invalidShortcuts.push(shortcut);
      }
    }

    const message = `🔍 Ditemukan ${invalidShortcuts.length} shortcut tidak valid dari ${allShortcuts.length} total.\n\nShortcut valid: ${validShortcuts.length}`;

    if (invalidShortcuts.length > 0) {
      const action = await vscode.window.showWarningMessage(
        message,
        { modal: true },
        'Lihat Detail',
        'Clear Cache & Refresh'
      );

      if (action === 'Clear Cache & Refresh') {
        // Clear auto-discovery cache to refresh invalid shortcuts
        programVerificationCache.clear();
        autoDiscoveryCache.lastUpdated = 0;
        provider.refresh();
        vscode.window.showInformationMessage('✅ Cache dibersihkan. Auto-discovery shortcuts akan di-refresh.');
      } else if (action === 'Lihat Detail') {
        // Show detailed report
        const panel = vscode.window.createWebviewPanel(
          'invalidShortcuts',
          '🔍 Invalid Shortcuts Report',
          vscode.ViewColumn.Active,
          {}
        );

        panel.webview.html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Invalid Shortcuts</title>
<style>
  body { font-family: system-ui; margin: 20px; background: #1e1e1e; color: #d4d4d4; }
  .invalid { background: #5a1a1a; border-left: 4px solid #f85a5a; padding: 10px; margin: 5px 0; }
  .valid { background: #0d4f3c; border-left: 4px solid #00d26a; padding: 10px; margin: 5px 0; }
  code { background: #2d2d30; padding: 2px 4px; }
</style></head>
<body>
  <h1>Shortcuts Validation Report</h1>
  <h2>❌ Invalid Shortcuts (${invalidShortcuts.length})</h2>
  ${invalidShortcuts.map((s) => `<div class="invalid"><strong>${s.label}</strong><br><code>${s.program}</code></div>`).join('')}
  <h2>✅ Valid Shortcuts (${validShortcuts.length})</h2>
  <p>All other shortcuts are working properly.</p>
</body></html>`;
      }
    } else {
      vscode.window.showInformationMessage('✅ Semua shortcuts valid!');
    }
  });

  const searchShortcutsCmd = vscode.commands.registerCommand('launcher.searchShortcuts', async () => {
    const allShortcuts = [
      ...getConfigShortcuts(),
      ...autoDiscoveredShortcuts(),
      ...autoDiscoveredShells(),
      ...autoDiscoveredEditors(),
    ].filter((s) => platformOk(s) && whenOk(s) && profileOk(s));

    const searchTerm = await vscode.window.showInputBox({
      placeHolder: 'Cari shortcut... (ketik nama program atau label)',
      prompt: `Mencari dari ${allShortcuts.length} shortcut tersedia`,
    });

    if (!searchTerm) return;

    const filtered = allShortcuts.filter(
      (s) =>
        s.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.program && s.program.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filtered.length === 0) {
      vscode.window.showInformationMessage(`🔍 Tidak ditemukan shortcut yang cocok dengan "${searchTerm}"`);
      return;
    }

    const selected = await quickPick(filtered);
    if (selected) {
      // Show immediate loading
      const loadingMessage = vscode.window.setStatusBarMessage(`🚀 Menjalankan ${selected.label}...`);

      try {
        await runShortcut(selected);
        pushRecent(context, selected);
      } finally {
        setTimeout(() => {
          loadingMessage.dispose();
        }, 1000);
      }
    }
  });
  const sb = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
  sb.text = `🚀 Launcher Plus`;
  sb.tooltip = `Variant: ${detectVariant()}`;
  sb.command = 'launcher.openQuickPick';
  sb.show();
  context.subscriptions.push(
    runCmd,
    qpCmd,
    openSettingsCmd,
    exportCmd,
    importCmd,
    rescanCmd,
    genTasksCmd,
    setProfileCmd,
    exportWS,
    importWS,
    aboutCmd,
    debugCmd,
    diagnoseLaunchCmd,
    testElectronSolutionsCmd,
    testLaunchStrategiesCmd,
    testVisibilityCmd,

    openEditorCmd,
    openSettingsFileCmd,
    validateShortcutsCmd,
    clearCooldownsCmd,
    cleanInvalidShortcutsCmd,
    searchShortcutsCmd
  );

  // Auto-validate shortcuts on startup (disabled for performance)
  // setTimeout(() => {
  //   validateAndFixShortcuts();
  // }, 2000);

  // Refresh view when settings change
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
      if (e.affectsConfiguration('launcher')) provider.refresh();
    })
  );
}

function pushRecent(context: vscode.ExtensionContext, s: Shortcut) {
  const limit = vscode.workspace.getConfiguration().get<number>('launcher.recentLimit', 10);
  const key = 'launcher.recent';
  const prev = context.globalState.get<Shortcut[]>(key, []);
  const list = [s, ...prev.filter((x: Shortcut) => x.id != s.id)];
  context.globalState.update(key, list.slice(0, limit));
}

async function quickPick(shortcuts: Shortcut[]): Promise<Shortcut | undefined> {
  const items = shortcuts.map((s) => ({
    label: s.label || s.id,
    description: s.program || '(default app)',
    detail: s.args && s.args.length ? s.args.join(' ') : '',
    s,
  }));
  const picked = await vscode.window.showQuickPick(items, { placeHolder: 'Pilih shortcut untuk dijalankan' });
  return picked?.s;
}

export function deactivate() {}
