import { app, BrowserWindow, Menu, dialog, session, shell } from 'electron';
import electronUpdater, { type UpdateInfo, type ProgressInfo } from 'electron-updater';
import log from 'electron-log/main.js';
import path from 'path';
import { fileURLToPath } from 'url';

const { autoUpdater } = electronUpdater;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;

log.initialize();
log.transports.file.level = 'info';
autoUpdater.logger = log;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

let mainWindow: BrowserWindow | null = null;
let manualUpdateCheck = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  if (isDev) {
    mainWindow.loadURL('http://127.0.0.1:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (!isDev) {
    autoUpdater.checkForUpdates().catch((err) => {
      log.error('Initial update check failed:', err);
    });
  }
}

function registerAutoUpdaterEvents() {
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update…');
  });

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    log.info(`Update available: ${info.version}`);
    if (manualUpdateCheck) {
      dialog.showMessageBox({
        type: 'info',
        title: 'Update available',
        message: `A new version (${info.version}) is being downloaded. You'll be notified when it's ready to install.`,
        buttons: ['OK'],
      });
    }
  });

  autoUpdater.on('update-not-available', (info: UpdateInfo) => {
    log.info(`No update available. Current: ${app.getVersion()}, latest: ${info.version}`);
    if (manualUpdateCheck) {
      dialog.showMessageBox({
        type: 'info',
        title: 'No update available',
        message: `You're already on the latest version (${app.getVersion()}).`,
        buttons: ['OK'],
      });
      manualUpdateCheck = false;
    }
  });

  autoUpdater.on('download-progress', (progress: ProgressInfo) => {
    log.info(`Download progress: ${progress.percent.toFixed(1)}%`);
  });

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    log.info(`Update downloaded: ${info.version}`);
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Update ready to install',
        message: `Version ${info.version} has been downloaded.`,
        detail: 'Restart the app now to install the update, or it will be installed the next time you quit.',
        buttons: ['Restart now', 'Later'],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  autoUpdater.on('error', (err) => {
    log.error('autoUpdater error:', err);
    if (manualUpdateCheck) {
      dialog.showMessageBox({
        type: 'error',
        title: 'Update check failed',
        message: 'Could not check for updates.',
        detail: `${err?.message ?? err}\n\nLogs: ${log.transports.file.getFile().path}`,
        buttons: ['OK'],
      });
      manualUpdateCheck = false;
    }
  });
}

function checkForUpdatesManual() {
  if (isDev) {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update check disabled',
      message: 'Auto-update is disabled in development mode.',
      buttons: ['OK'],
    });
    return;
  }
  manualUpdateCheck = true;
  autoUpdater.checkForUpdates().catch((err) => {
    log.error('Manual update check failed:', err);
  });
}

app.on('ready', () => {
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => {
    callback(false);
  });
  session.defaultSession.setPermissionCheckHandler(() => false);

  registerAutoUpdaterEvents();
  createWindow();
  createMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for Updates…',
          click: () => checkForUpdatesManual(),
        },
        {
          label: 'Open Log Folder',
          click: () => {
            shell.openPath(path.dirname(log.transports.file.getFile().path));
          },
        },
        { type: 'separator' },
        {
          label: `Version ${app.getVersion()}`,
          enabled: false,
        },
      ],
    },
  ];

  if (isDev) {
    template.push({
      label: 'Developer',
      submenu: [
        { role: 'toggleDevTools' },
      ],
    });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
