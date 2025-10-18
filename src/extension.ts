import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

type Shortcut = {
  id: string;
  label: string;
  program?: string;           // if empty -> default app
  args?: string[];
  cwd?: string;
  env?: Record<string,string>;
  runAsAdmin?: boolean;       // Windows only (not implemented; prompt hint)
  when?: string;              // simple condition: resourceLangId == xyz
  platform?: 'win'|'mac'|'linux'|'';
  icon?: string;
  sequence?: (string | Omit<Shortcut,'id'|'label'>)[];
  profile?: string;
  sequenceMode?: 'serial'|'parallel';
};

function getConfigShortcuts(): Shortcut[] {
  const cfg = vscode.workspace.getConfiguration();
  return cfg.get<Shortcut[]>('launcher.shortcuts', []) || [];
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

function resolveVars(t: string, ctx: {file?: string, workspaceFolder?: string, selectedText?: string, lineNumber?: number, relativeFile?: string}): string {
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
  return {file, workspaceFolder: ws, selectedText, lineNumber, relativeFile};
}

function spawnDefaultOpen(target: string, cwd?: string) {
  // Open file/folder with OS default handler
  if (process.platform === 'win32') {
    cp.spawn('cmd', ['/c', 'start', '', target], { cwd, detached: true, windowsVerbatimArguments: true, stdio: 'ignore' }).unref();
  } else if (process.platform === 'darwin') {
    cp.spawn('open', [target], { cwd, detached: true, stdio: 'ignore' }).unref();
  } else {
    cp.spawn('xdg-open', [target], { cwd, detached: true, stdio: 'ignore' }).unref();
  }
}

function runShortcut(s: Shortcut): void {
  const ctx = pickContext();
  const cwd = s.cwd ? resolveVars(s.cwd, ctx) : ctx.workspaceFolder || os.homedir();
  const env = Object.assign({}, process.env, s.env || {});
  try {
    if (!platformOk(s) || !whenOk(s)) {
      vscode.window.showInformationMessage(`Shortcut "${s.label}" tidak aktif untuk konteks saat ini.`);
      return;
    }
    // Resolve args
    const args = (s.args || []).map(a => resolveVars(a, ctx)).filter(a => a.length > 0);
    if (!s.program || s.program.trim().length === 0) {
      // default open for first arg or current file
      const target = args[0] || (ctx.file ?? cwd);
      spawnDefaultOpen(target, cwd);
      return;
    }
    const program = resolveVars(s.program, ctx);
    if (process.platform === 'win32' && s.runAsAdmin) {
      vscode.window.showWarningMessage('Run as Admin belum diimplementasikan otomatis. Jalankan VS Code sebagai Administrator untuk shortcut ini.');
    }
    // spawn and listen for errors (e.g., ENOENT)
    try {
      const child = cp.spawn(program, args, { cwd, env, detached: true, stdio: 'ignore', windowsHide: true });
      child.on('error', (err) => {
        vscode.window.showErrorMessage(`Failed to start "${s.label}": ${err?.message ?? String(err)}`);
      });
      // detach if possible
      try { child.unref(); } catch {}
    } catch (spawnErr: any) {
      vscode.window.showErrorMessage(`Gagal menjalankan "${s.label}": ${spawnErr?.message ?? String(spawnErr)}`);
    }
  } catch (err: any) {
    vscode.window.showErrorMessage(`Gagal menjalankan "${s.label}": ${err?.message ?? String(err)}`);
  }
}

class ShortcutsProvider implements vscode.TreeDataProvider<ShortcutItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh() { this._onDidChangeTreeData.fire(); }

  getTreeItem(element: ShortcutItem): vscode.TreeItem {
    return element;
  }

  // element is optional; when provided we have no children because shortcuts are leaves
  getChildren(element?: ShortcutItem): Thenable<ShortcutItem[]> {
    if (element) return Promise.resolve([]);
    const items = [...getConfigShortcuts(), ...autoDiscoveredShortcuts(), ...autoDiscoveredShells(), ...autoDiscoveredEditors()]
      .filter(s => platformOk(s) && whenOk(s) && profileOk(s))
      .map(s => new ShortcutItem(s));
    return Promise.resolve(items);
  }
}

class ShortcutItem extends vscode.TreeItem {
  constructor(public readonly s: Shortcut) {
    super(s.label || s.id, vscode.TreeItemCollapsibleState.None);
    this.contextValue = 'shortcutItem';
    this.tooltip = `${s.program || '(default app)'} ${(s.args||[]).join(' ')}`;
    // pass the full Shortcut object so commands can run both configured and auto-discovered shortcuts
    this.command = { command: 'launcher.run', title: 'Run Shortcut', arguments: [s] };
    this.iconPath = resolveIcon(s.icon);
  }
}



function resolveIcon(icon?: string): any {
  if (!icon) return new vscode.ThemeIcon('rocket');
  // If looks like a path, try use file icon
  if (/[\\/]/.test(icon) || icon.startsWith('.')) {
    try {
      return vscode.Uri.file(icon);
    } catch { /* ignore */ }
  }
  return new vscode.ThemeIcon(icon);
}

function shouldAutoDiscover(): boolean {
  const cfg = vscode.workspace.getConfiguration();
  return cfg.get<boolean>('launcher.enableAutoDiscover', true);
}

function autoDiscoveredShortcuts(): Shortcut[] {
  if (!shouldAutoDiscover()) return [];
  const plat = process.platform;
  const list: Shortcut[] = [];
  function pushIfExists(label: string, program: string, args?: string[]) {
    try {
      if (fs.existsSync(program)) {
        list.push({ id: `auto-${label.toLowerCase().replace(/\\s+/g,'-')}`, label, program, args, platform: undefined });
      }
    } catch {}
  }
  if (plat === 'win32') {
    pushIfExists('Notepad', 'C:\\\\Windows\\\\system32\\\\notepad.exe');
    pushIfExists('Explorer (Downloads)', 'C:\\\\Windows\\\\explorer.exe', [os.homedir() + '\\\\Downloads']);
    pushIfExists('Chrome', 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe');
    pushIfExists('Word', 'C:\\\\Program Files\\\\Microsoft Office\\\\root\\\\Office16\\\\WINWORD.EXE');
    pushIfExists('Excel', 'C:\\\\Program Files\\\\Microsoft Office\\\\root\\\\Office16\\\\EXCEL.EXE');
    pushIfExists('PowerPoint', 'C:\\\\Program Files\\\\Microsoft Office\\\\root\\\\Office16\\\\POWERPNT.EXE');
    // add more if needed
  } else if (plat === 'darwin') {
    pushIfExists('Safari', '/Applications/Safari.app');
    pushIfExists('Chrome', '/Applications/Google Chrome.app');
  } else {
    // Linux common
    // Can't reliably fs.exists on commands; skip for now.
  }
  return list;
}

async function exportShortcuts() {
  const cfg = vscode.workspace.getConfiguration();
  const shortcuts = cfg.get<Shortcut[]>('launcher.shortcuts', []);
  const uri = await vscode.window.showSaveDialog({ filters: { 'JSON': ['json'] }, saveLabel: 'Export Shortcuts' });
  if (!uri) return;
  await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(shortcuts, null, 2), 'utf8'));
  vscode.window.showInformationMessage('Shortcuts exported.');
}

async function importShortcuts() {
  const cfg = vscode.workspace.getConfiguration();
  const pick = await vscode.window.showOpenDialog({ canSelectMany: false, filters: { 'JSON': ['json'] }, openLabel: 'Import Shortcuts' });
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
  } catch (e:any) {
    vscode.window.showErrorMessage('Import failed: ' + (e?.message ?? String(e)));
  }
}

async function runSequence(seq: (string | Omit<Shortcut,'id'|'label'>)[], all: Shortcut[], mode: 'serial'|'parallel' = 'serial') {
  if (mode === 'parallel') {
    const proms: Promise<void>[] = [];
    for (const step of seq) {
      proms.push((async () => {
    let s: Shortcut | undefined;
    if (typeof step === 'string') {
      s = all.find(x => x.id === step);
    } else {
      // inline step: allow program/args/cwd/env/platform/when/runAsAdmin
      s = { id: 'inline', label: 'inline', ...step };
    }
    if (s) {
        if (isGroupStep(step)) {
          const grp:any = step as any;
          await runSequence(grp.sequence, all, (grp.sequenceMode || 'serial'));
        } else {
          runShortcut(s);
        }
      }
      })());
    }
    await Promise.all(proms);
  } else {
    for (const step of seq) {
      let s: Shortcut | undefined;
      if (typeof step === 'string') {
        s = all.find(x => x.id === step);
      } else {
        s = { id: 'inline', label: 'inline', ...step } as Shortcut;
      }
      if (s) {
        if (isGroupStep(step)) {
          const grp:any = step as any;
          await runSequence(grp.sequence, all, (grp.sequenceMode || 'serial'));
        } else {
          runShortcut(s);
        }
        await new Promise(res => setTimeout(res, 200));
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
  try { await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(ws.uri, '.vscode')); } catch {}

  // build tasks
  const shortcuts = [...getConfigShortcuts()].filter(s => platformOk(s) && whenOk(s) && profileOk(s));
  const tasks = shortcuts.map(s => shortcutToTask(s));
  let final = { version: '2.0.0', tasks: [] as any[] };
  try {
    const raw = await vscode.workspace.fs.readFile(tasksUri);
    final = JSON.parse(Buffer.from(raw).toString('utf8'));
    if (!final.tasks) final.tasks = [];
  } catch { /* ignore */ }
  // merge: replace existing launcher:* tasks
  final.tasks = (final.tasks || []).filter((t:any) => !(typeof t.label === 'string' && t.label.startsWith('launcher:')));
  final.tasks.push(...tasks);
  await vscode.workspace.fs.writeFile(tasksUri, Buffer.from(JSON.stringify(final, null, 2), 'utf8'));
  vscode.window.showInformationMessage('tasks.json generated/updated from shortcuts.');
}

function shortcutToTask(s: Shortcut) {
  // Build shell command approximating the spawn
  const ctx = pickContext();
  const cwd = s.cwd ? resolveVars(s.cwd, ctx) : ctx.workspaceFolder || require('os').homedir();
  const args = (s.args || []).map(a => resolveVars(a, ctx));
  let command = '';
  let shellArgs: string[] = [];
  if (!s.program || s.program.trim() === '') {
    if (process.platform === 'win32') {
  command = 'cmd';
  shellArgs = ['/c', 'start', '""'].concat(args.length ? args : [cwd]);
      // join for display only; tasks will handle args array
    } else if (process.platform === 'darwin') {
      command = 'open';
      shellArgs = args.length? args:[cwd];
    } else {
      command = 'xdg-open';
      shellArgs = args.length? args:[cwd];
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
    problemMatcher: []
  };
}

// --- Workspace Import/Export ---
async function exportShortcutsWorkspace() {
  const cfg = vscode.workspace.getConfiguration();
  const shortcuts = cfg.get<Shortcut[]>('launcher.shortcuts', []);
  const wsCfgTarget = vscode.ConfigurationTarget.Workspace;
  const uri = await vscode.window.showSaveDialog({ filters: { 'JSON': ['json'] }, saveLabel: 'Export Shortcuts (Workspace)' });
  if (!uri) return;
  await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(shortcuts, null, 2), 'utf8'));
  vscode.window.showInformationMessage('Workspace shortcuts exported.');
}

async function importShortcutsWorkspace() {
  const cfg = vscode.workspace.getConfiguration();
  const pick = await vscode.window.showOpenDialog({ canSelectMany: false, filters: { 'JSON': ['json'] }, openLabel: 'Import Shortcuts (Workspace)' });
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
  } catch (e:any) {
    vscode.window.showErrorMessage('Import failed: ' + (e?.message ?? String(e)));
  }
}

// --- Auto-discover: add WSL, Git Bash, PowerShell Core ---
function autoDiscoveredShells(): Shortcut[] {
  const list: Shortcut[] = [];
  if (process.platform === 'win32') {
    const candidates = [
      { label: 'WSL', program: 'C:\\\\Windows\\\\System32\\\\wsl.exe', args: [] },
      { label: 'Git Bash', program: 'C:\\\\Program Files\\\\Git\\\\bin\\\\bash.exe', args: [] },
    ];
    // find PowerShell Core (pwsh.exe) under Program Files\\PowerShell\\*\\pwsh.exe
    const pf = process.env['ProgramFiles'] || 'C:\\\\Program Files';
    const pwshGlob = require('path').join(pf, 'PowerShell');
    try {
      const versions = require('fs').readdirSync(pwshGlob, { withFileTypes: true })
        .filter((d:any) => d.isDirectory())
        .map((d:any) => require('path').join(pwshGlob, d.name, 'pwsh.exe'));
      for (const p of versions) {
        if (require('fs').existsSync(p)) {
          candidates.push({ label: 'PowerShell (pwsh)', program: p, args: [] } as any);
          break;
        }
      }
    } catch {}
    for (const c of candidates) {
      try { if (fs.existsSync(c.program)) list.push({ id: `auto-${c.label.replace(/\\s+/g,'-').toLowerCase()}`, label: c.label, program: c.program, args: c.args }); } catch {}
    }
  }
  return list;
}



// --- VS Code family autodiscovery (Windows) ---
function autoDiscoveredEditors(): Shortcut[] {
  const list: Shortcut[] = [];
  if (process.platform === 'win32') {
    const local = process.env['LOCALAPPDATA'] || (require('os').homedir() + '\\\\AppData\\\\Local');
    const candidates = [
      { label: 'VS Code', program: 'C:\\\\Program Files\\\\Microsoft VS Code\\\\Code.exe' },
      { label: 'VS Code Insiders', program: 'C:\\\\Program Files\\\\Microsoft VS Code Insiders\\\\Code - Insiders.exe' },
      { label: 'Cursor', program: (local + '\\\\Programs\\\\cursor\\\\Cursor.exe') },
      { label: 'Windsurf', program: (local + '\\\\Programs\\\\Windsurf\\\\Windsurf.exe') }
    ];
    for (const c of candidates) {
      try { if (fs.existsSync(c.program)) list.push({ id: `auto-${c.label.replace(/\\s+/g,'-').toLowerCase()}`, label: c.label, program: c.program }); } catch {}
    }
  }
  return list;
}

// --- Run nested sequence groups ---
function isGroupStep(step: any): boolean {
  return typeof step === 'object' && Array.isArray(step.sequence);
}


class ShortcutEditorPanel {
  public static current: ShortcutEditorPanel | undefined;
  public static readonly viewType = 'launcher.shortcutEditor';

  private constructor(private readonly panel: vscode.WebviewPanel, private readonly context: vscode.ExtensionContext) {
    this.update();
    panel.onDidDispose(() => { ShortcutEditorPanel.current = undefined; });
    this.panel.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === 'save') {
        try {
          const arr = JSON.parse(msg.text);
          if (!Array.isArray(arr)) throw new Error('JSON must be an array');
          await vscode.workspace.getConfiguration().update('launcher.shortcuts', arr, vscode.ConfigurationTarget.Global);
          vscode.window.showInformationMessage('Shortcuts saved to User settings.');
        } catch (e:any) {
          vscode.window.showErrorMessage('Save failed: ' + (e?.message ?? String(e)));
        }
      } else if (msg.type === 'close') {
        this.panel.dispose();
      }
    });
  }

  public static show(context: vscode.ExtensionContext) {
    if (ShortcutEditorPanel.current) {
      ShortcutEditorPanel.current.panel.reveal();
      return;
    }
    const panel = vscode.window.createWebviewPanel(this.viewType, 'Shortcut Editor', vscode.ViewColumn.Active, {
      enableScripts: true
    });
    ShortcutEditorPanel.current = new ShortcutEditorPanel(panel, context);
  }

  private update() {
    const cfg = vscode.workspace.getConfiguration();
    const current = cfg.get('launcher.shortcuts', [] as any[]);
    
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
  const env = process.env;
  try {
    if (env.WINDSURF_HOME || env.WINDSURF_DATA_DIR) return 'Windsurf';
    if (env.CURSOR_PATH || env.CURSOR_DATA_DIR) return 'Cursor';
    if (env.KIRO_HOME || env.KIRO_APPDATA) return 'Kiro';
    if (env.QODER_HOME) return 'Qoder';
    if (env.TRAE_HOME) return 'Trae';
    if (env.VSCODE_PORTABLE) return 'VSCode Portable';
  } catch {}
  return 'VS Code';
}

function variantAccent(): string | undefined {
  const v = detectVariant();
  switch (v) {
    case 'Cursor': return '#8A85FF';
    case 'Windsurf': return '#2EC6F8';
    case 'Qoder': return '#FFD166';
    case 'Trae': return '#FF6B6B';
    default: return undefined;
  }
}

export function activate(context: vscode.ExtensionContext) {
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
      target = all.find(s => s.id === id);
    } else {
      // If called without id, show quick pick
      const pick = await quickPick([...shortcuts, ...autoDiscoveredShortcuts(), ...autoDiscoveredShells(), ...autoDiscoveredEditors()].filter(s => platformOk(s) && whenOk(s) && profileOk(s)));
      if (!pick) { return; }
      target = pick;
    }
    if (!target) {
      vscode.window.showErrorMessage('Shortcut tidak ditemukan.');
      return;
    }
    if (target.sequence && target.sequence.length) {
      await runSequence(target.sequence, getConfigShortcuts(), target.sequenceMode || 'serial');
    } else {
      runShortcut(target);
    }
    pushRecent(context, target);
  });

  const qpCmd = vscode.commands.registerCommand('launcher.openQuickPick', async () => {
    const s = await quickPick([...getConfigShortcuts(), ...autoDiscoveredShortcuts(), ...autoDiscoveredShells(), ...autoDiscoveredEditors()].filter(s => platformOk(s) && whenOk(s) && profileOk(s)));
    if (s) {
      runShortcut(s);
      pushRecent(context, s);
    }
  });

  const openSettingsCmd = vscode.commands.registerCommand('launcher.openSettings', () => {
    vscode.commands.executeCommand('workbench.action.openSettings', 'launcher.shortcuts');
  });

  const exportCmd = vscode.commands.registerCommand('launcher.exportShortcuts', exportShortcuts);
  const openEditorCmd = vscode.commands.registerCommand('launcher.openEditor', () => ShortcutEditorPanel.show(context));
  const importCmd = vscode.commands.registerCommand('launcher.importShortcuts', importShortcuts);
  const rescanCmd = vscode.commands.registerCommand('launcher.rescanAutoDiscover', () => provider.refresh());
  const genTasksCmd = vscode.commands.registerCommand('launcher.generateTasks', generateTasksFromShortcuts);
  const setProfileCmd = vscode.commands.registerCommand('launcher.setActiveProfile', async () => {
    const val = await vscode.window.showInputBox({ placeHolder: 'Active profile name (empty = all)' });
    if (val !== undefined) {
      await vscode.workspace.getConfiguration().update('launcher.activeProfile', val, vscode.ConfigurationTarget.Global);
      provider.refresh();
    }
  });
  const exportWS = vscode.commands.registerCommand('launcher.exportShortcutsWorkspace', exportShortcutsWorkspace);
  const importWS = vscode.commands.registerCommand('launcher.importShortcutsWorkspace', importShortcutsWorkspace);
  const aboutCmd = vscode.commands.registerCommand('launcher.about', async () => {
    const v = detectVariant();
    vscode.window.showInformationMessage(`Launcher Plus running on: ${v}`);
  });
  const sb = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
  sb.text = `$(rocket) Launcher Plus`;
  sb.tooltip = `Variant: ${detectVariant()}`;
  sb.command = 'launcher.openQuickPick';
  sb.show();
  context.subscriptions.push(runCmd, qpCmd, openSettingsCmd, exportCmd, importCmd, rescanCmd, genTasksCmd, setProfileCmd, exportWS, importWS, openEditorCmd, aboutCmd, sb);

  // Refresh view when settings change
  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('launcher')) provider.refresh();
  }));
}

function pushRecent(context: vscode.ExtensionContext, s: Shortcut) {
  const limit = vscode.workspace.getConfiguration().get<number>('launcher.recentLimit', 10);
  const key = 'launcher.recent';
  const prev = context.globalState.get<Shortcut[]>(key, []);
  const list = [s, ...prev.filter(x => x.id != s.id)];
  context.globalState.update(key, list.slice(0, limit));
}

async function quickPick(shortcuts: Shortcut[]): Promise<Shortcut | undefined> {
  const items = shortcuts.map(s => ({
    label: s.label || s.id,
    description: s.program || '(default app)',
    detail: (s.args && s.args.length) ? s.args.join(' ') : '',
    s
  }));
  const picked = await vscode.window.showQuickPick(items, { placeHolder: 'Pilih shortcut untuk dijalankan' });
  return picked?.s;
}

export function deactivate() {}
