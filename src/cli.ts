import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
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

/**
 * CLI handler untuk any-launcher-plus
 * Memungkinkan menjalankan shortcut langsung dari terminal
 */
export class LauncherCLI {
  private context: vscode.ExtensionContext;
  private terminal: vscode.Terminal | undefined;
  private shortcuts: Shortcut[] = [];

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * Inisialisasi CLI dan mendaftarkan perintah
   */
  public initialize(): void {
    // Mendaftarkan perintah CLI
    this.registerCommands();
    
    // Load shortcuts
    this.loadShortcuts();
  }

  /**
   * Mendaftarkan perintah CLI untuk VS Code
   */
  private registerCommands(): void {
    // Perintah untuk menjalankan CLI di terminal terintegrasi
    this.context.subscriptions.push(
      vscode.commands.registerCommand('launcher.openCLI', () => {
        this.openCLITerminal();
      })
    );

    // Perintah untuk menjalankan shortcut dari CLI
    this.context.subscriptions.push(
      vscode.commands.registerCommand('launcher.runFromCLI', async (id?: string) => {
        if (!id) {
          const items = this.shortcuts.map(s => ({
            label: s.label,
            description: s.id,
            shortcut: s
          }));
          
          const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Pilih shortcut untuk dijalankan'
          });
          
          if (selected) {
            await this.executeShortcut(selected.shortcut);
          }
        } else {
          const shortcut = this.shortcuts.find(s => s.id === id);
          if (shortcut) {
            await this.executeShortcut(shortcut);
          } else {
            vscode.window.showErrorMessage(`Shortcut dengan ID "${id}" tidak ditemukan`);
          }
        }
      })
    );

    // Perintah untuk deploy aplikasi
    this.context.subscriptions.push(
      vscode.commands.registerCommand('launcher.deploy', async () => {
        await this.runDeploymentTool();
      })
    );
  }

  /**
   * Membuka terminal CLI terintegrasi
   */
  public openCLITerminal(): void {
    if (this.terminal) {
      this.terminal.dispose();
    }

    this.terminal = vscode.window.createTerminal({
      name: 'Launcher Plus CLI',
      shellPath: this.getDefaultShellPath(),
      shellArgs: this.getShellArgs(),
      env: {
        LAUNCHER_PLUS_CLI: 'true'
      }
    });

    this.terminal.show();

    // Menampilkan banner dan bantuan
    setTimeout(() => {
      if (this.terminal) {
        this.terminal.sendText('echo "🚀 Launcher Plus CLI v1.2.0"');
        this.terminal.sendText('echo "Ketik \'launcher help\' untuk bantuan"');
        this.terminal.sendText('');
        
        // Setup command alias untuk PowerShell
        if (this.isPowerShell()) {
          this.terminal.sendText('function launcher { param($cmd, $id) if ($cmd -eq "run") { $vsCommand = "launcher.runFromCLI"; if ($id) { $vsCommand += " $id" }; code --command $vsCommand } elseif ($cmd -eq "list") { code --command "launcher.listShortcuts" } elseif ($cmd -eq "deploy") { code --command "launcher.deploy" } elseif ($cmd -eq "help") { echo "Perintah yang tersedia:"; echo "  launcher run [id]  - Menjalankan shortcut (atau menampilkan daftar)"; echo "  launcher list      - Menampilkan semua shortcut"; echo "  launcher deploy    - Menjalankan deployment tool"; echo "  launcher help      - Menampilkan bantuan ini"; } else { echo "Perintah tidak dikenal. Ketik \'launcher help\' untuk bantuan" } }');
        } else {
          // Setup untuk bash/cmd
          this.terminal.sendText('alias launcher="code --command launcher.runFromCLI"');
        }
      }
    }, 500);
  }

  /**
   * Menjalankan shortcut dari CLI
   */
  private async executeShortcut(shortcut: Shortcut): Promise<void> {
    try {
      // Menampilkan informasi eksekusi
      vscode.window.setStatusBarMessage(`🚀 Menjalankan ${shortcut.label}...`, 2000);
      
      // Eksekusi shortcut menggunakan command yang ada
      await vscode.commands.executeCommand('launcher.run', shortcut.id);
      
      return Promise.resolve();
    } catch (error) {
      vscode.window.showErrorMessage(`Gagal menjalankan shortcut: ${error}`);
      return Promise.reject(error);
    }
  }

  /**
   * Memuat daftar shortcut dari konfigurasi
   */
  private loadShortcuts(): void {
    const config = vscode.workspace.getConfiguration('launcher');
    this.shortcuts = config.get<Shortcut[]>('shortcuts', []);
  }

  /**
   * Menjalankan deployment tool
   */
  private async runDeploymentTool(): Promise<void> {
    // Membuat terminal khusus untuk deployment
    const deployTerminal = vscode.window.createTerminal({
      name: 'Launcher Plus Deployment',
      shellPath: this.getDefaultShellPath()
    });
    
    deployTerminal.show();
    
    // Menampilkan menu deployment
    const deployOptions = [
      { label: '📦 Build & Package', value: 'build' },
      { label: '🚀 Publish to VS Code Marketplace', value: 'publish-vscode' },
      { label: '🌐 Publish to OpenVSX', value: 'publish-ovsx' },
      { label: '🧹 Clean Project', value: 'clean' }
    ];
    
    const selected = await vscode.window.showQuickPick(deployOptions, {
      placeHolder: 'Pilih operasi deployment'
    });
    
    if (selected) {
      switch (selected.value) {
        case 'build':
          deployTerminal.sendText('npm run build');
          break;
        case 'publish-vscode':
          deployTerminal.sendText('npm run publish:vsce');
          break;
        case 'publish-ovsx':
          deployTerminal.sendText('npm run publish:ovsx');
          break;
        case 'clean':
          deployTerminal.sendText('npm run clean');
          break;
      }
    }
  }

  /**
   * Mendapatkan path default shell berdasarkan platform
   */
  private getDefaultShellPath(): string {
    if (process.platform === 'win32') {
      // Prioritaskan PowerShell Core (pwsh) jika tersedia
      const pwshPath = 'C:\\Program Files\\PowerShell\\7\\pwsh.exe';
      if (fs.existsSync(pwshPath)) {
        return pwshPath;
      }
      return 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
    } else if (process.platform === 'darwin') {
      return '/bin/zsh';
    } else {
      return '/bin/bash';
    }
  }

  /**
   * Mendapatkan argumen shell berdasarkan platform
   */
  private getShellArgs(): string[] {
    if (process.platform === 'win32') {
      if (this.isPowerShell()) {
        return ['-NoLogo', '-NoExit'];
      }
      return [];
    } else {
      return ['-l'];
    }
  }

  /**
   * Memeriksa apakah shell default adalah PowerShell
   */
  private isPowerShell(): boolean {
    const shellPath = this.getDefaultShellPath().toLowerCase();
    return shellPath.includes('powershell') || shellPath.includes('pwsh');
  }
}
