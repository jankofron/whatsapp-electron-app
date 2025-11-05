const { app, BrowserWindow, Tray, Menu, nativeImage, shell, ipcMain, session } = require('electron');
const path = require('path');
const MODERN_CHROME_UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';


const START_URL = 'https://web.whatsapp.com/';
const PARTITION = 'persist:whatsapp';
let win, tray, unread = 0;

function extractUnreadFromTitle(title = '') {
  const m = /^\((\d+)\)\s+/.exec(title);
  return m ? parseInt(m[1], 10) : 0;
}

function setUnread(count) {
  count = Math.max(0, count | 0);
  const iconName = count > 0 ? 'wa-unread.png' : 'wa.png';
  tray?.setImage(nativeImage.createFromPath(path.join(__dirname, 'assets/icons', iconName)));
}


function allowWhatsAppPermissions() {
  const ses = session.fromPartition(PARTITION);
  // Auto-allow notifications for web.whatsapp.com
  try {
    ses.setPermissionRequestHandler((wc, permission, callback, details) => {
      const origin = (details && details.requestingUrl) || (wc && wc.getURL && wc.getURL()) || '';
      if (origin.startsWith('https://web.whatsapp.com') && permission === 'notifications') {
        return callback(true);
      }
      return callback(false);
    });
  } catch {}
}


function createWindow() {
  // Create the window
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    icon: path.join(__dirname, 'assets/icons/wa.png'),
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      partition: PARTITION
    }
  });
  
  win.on('page-title-updated', (e, title) => {
  // Prevent the OS from showing the changing title as a notification tooltip (optional)
    e.preventDefault();
    setUnread(extractUnreadFromTitle(title));
  });


  // No menu bar
  win.setMenu(null);

  // External links open in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://web.whatsapp.com')) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });



  // Force the UA on this window (most reliable)
  win.webContents.setUserAgent(MODERN_CHROME_UA);
  
  // Load WhatsApp
  win.loadURL(START_URL);
  win.once('ready-to-show', () => win.show());

  // Save last URL (optional, to restore to the last chat)
  win.webContents.on('did-navigate', (_e, url) => saveLastUrl(url));
  win.webContents.on('did-navigate-in-page', (_e, url) => saveLastUrl(url));

  // Minimize to tray on close
  win.on('close', (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      win.hide();
    }
  });

  // Clear tray badge when focused
  win.on('focus', () => setUnread(0));
}

function saveLastUrl(url) {
  // Keep it simple: only keep WhatsApp origin (they route internally)
  if (url && url.startsWith('https://web.whatsapp.com')) {
    // If you already use electron-store elsewhere, plug it in here.
    // For WhatsApp, restoring START_URL is typically enough.
  }
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets/icons/wa.png');
  tray = new Tray(nativeImage.createFromPath(iconPath));
  tray.setToolTip('WhatsApp');

  const menu = Menu.buildFromTemplate([
    { label: 'Show', click: () => { win.show(); win.focus(); } },
    { label: 'Hide', click: () => win.hide() },
    { type: 'separator' },
    { label: 'Reload', click: () => win.webContents.reload() },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuiting = true; app.quit(); } }
  ]);
  tray.setContextMenu(menu);

  tray.on('click', () => {
    if (!win) return;
    if (win.isVisible()) win.hide(); else { win.show(); win.focus(); }
  });
}

function setUnread(count) {
  unread = Math.max(0, count|0);
  // Change tray icon
  const icon = unread > 0 ? 'wa-unread.png' : 'wa.png';
  tray.setImage(nativeImage.createFromPath(path.join(__dirname, 'assets/icons', icon)));

  // Badge count (works on some Linux DEs; harmless elsewhere)
  try { app.setBadgeCount(unread); } catch {}

  // (Optional) flash on unread if window hidden
  if (unread > 0 && win && !win.isVisible()) {
    win.flashFrame(true);
    setTimeout(() => win && win.flashFrame(false), 1500);
  }
}

// IPC from preload: unread count and notification mirroring
ipcMain.on('unread-count', (_evt, count) => setUnread(count));
ipcMain.on('notify', (_evt, payload) => {
  // You normally don’t need to relay notifications: site already shows native ones.
  // Kept here in case you later want to route them via main or do OS-native fallbacks.
});

// (Optional but nice) make it global for workers too:
app.userAgentFallback = MODERN_CHROME_UA;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();
else {
  app.whenReady().then(() => {
    allowWhatsAppPermissions();
    createWindow();
    createTray();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}

app.on('window-all-closed', () => {
  // Keep running in tray
});

