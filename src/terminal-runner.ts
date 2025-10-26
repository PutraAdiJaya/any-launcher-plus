import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';

// Tipe yang diimpor dari extension.ts
type Shortcut = {
  id: string;
  label: string;
  program?: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  runAsAdmin?: boolean;
  when?: string;
  platform?: 'win' | 'mac' | 'linux' | '';
  icon?: string;
  sequence?: (string | Omit<Shortcut, 'id' | 'label'>)[];
  profile?: string;
  sequenceMode?: 'serial' | 'parallel';
};

// Konteks untuk resolusi variabel
interface Context {
  file?: string;
  workspaceFolder?: string;
  relativeFile?: string;
  lineNumber?: number;
  selectedText?: string;
}

/**
 * Terminal Runner untuk menjalankan shortcut di terminal internal VS Code
 */
export class TerminalRunner {
  private terminals: Map<string, vscode.Terminal> = new Map();
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    
    // Hapus terminal yang sudah ditutup
    vscode.window.onDidCloseTerminal(terminal => {
      this.terminals.forEach((value, key) => {
        if (value === terminal) {
          this.terminals.delete(key);
        }
      });
    });
  }

  /**
   * Menjalankan shortcut di terminal internal VS Code
   */
  public async runInTerminal(shortcut: Shortcut, ctx: Context): Promise<void> {
    // Jika shortcut tidak memiliki program, tidak bisa dijalankan di terminal
    if (!shortcut.program || shortcut.program.trim().length === 0) {
      vscode.window.showErrorMessage('Shortcut tidak memiliki program untuk dijalankan di terminal');
      return;
    }

    // Resolve variabel
    const program = this.resolveVars(shortcut.program, ctx);
    const args = (shortcut.args || []).map(arg => this.resolveVars(arg, ctx)).filter(arg => arg.length > 0);
    const cwd = shortcut.cwd ? this.resolveVars(shortcut.cwd, ctx) : ctx.workspaceFolder || os.homedir();

    // Tentukan nama terminal
    const terminalName = `Launcher: ${shortcut.label}`;

    // Buat atau gunakan kembali terminal
    let terminal = this.terminals.get(shortcut.id);
    if (!terminal) {
      terminal = vscode.window.createTerminal({
        name: terminalName,
        cwd: cwd,
        env: shortcut.env
      });
      this.terminals.set(shortcut.id, terminal);
    }

    // Tampilkan terminal
    terminal.show();

    // Buat perintah lengkap
    let command = '';

    // Periksa jenis perintah dan platform
    if (this.isDevCommand(program, args)) {
      // Perintah development (npm, yarn, etc.)
      command = `${program} ${args.join(' ')}`;
    } else if (process.platform === 'win32') {
      if (shortcut.runAsAdmin) {
        // Untuk Windows dengan admin, gunakan PowerShell Start-Process
        const argsString = args.length > 0 ? `-ArgumentList '${args.join("', '")}' ` : '';
        command = `Start-Process -FilePath '${program}' ${argsString}-Verb RunAs`;
      } else {
        // Perintah Windows biasa
        command = `${program} ${args.join(' ')}`;
      }
    } else {
      // Perintah Unix
      command = `${program} ${args.join(' ')}`;
    }

    // Jalankan perintah di terminal
    terminal.sendText(command);

    return Promise.resolve();
  }

  /**
   * Memeriksa apakah perintah adalah perintah development
   */
  private isDevCommand(program: string, args: string[]): boolean {
    const devCommands = ['npm', 'yarn', 'pnpm', 'node', 'python', 'go', 'cargo', 'dotnet', 'mvn', 'gradle', 'make'];
    const devArgs = ['run', 'start', 'build', 'test', 'dev', 'serve', 'compile', 'watch', 'clean', 'install'];
    
    return devCommands.includes(program) || 
           (args.length > 0 && devArgs.some(arg => args.includes(arg)));
  }

  /**
   * Resolve variabel dalam string
   */
  private resolveVars(input: string, ctx: Context): string {
    if (!input) return '';
    
    return input
      .replace(/\${file}/g, ctx.file || '')
      .replace(/\${workspaceFolder}/g, ctx.workspaceFolder || '')
      .replace(/\${relativeFile}/g, ctx.relativeFile || '')
      .replace(/\${lineNumber}/g, String(ctx.lineNumber || 1))
      .replace(/\${selectedText}/g, ctx.selectedText || '');
  }

  /**
   * Mendapatkan konteks dari editor aktif
   */
  public static getContext(): Context {
    const editor = vscode.window.activeTextEditor;
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    
    if (!editor) {
      return { workspaceFolder };
    }
    
    const document = editor.document;
    const file = document.uri.fsPath;
    const relativeFile = workspaceFolder ? path.relative(workspaceFolder, file) : file;
    const lineNumber = editor.selection.active.line + 1;
    const selectedText = editor.selection.isEmpty ? '' : document.getText(editor.selection);
    
    return {
      file,
      workspaceFolder,
      relativeFile,
      lineNumber,
      selectedText
    };
  }
}
