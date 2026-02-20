// preload.js
// Intentionally minimal: notifications + unread badge are handled in main.
// Keep this file so webPreferences.preload stays valid and you can add bridges later.

const { contextBridge, ipcRenderer } = require('electron');

// Expose a tiny bridge so renderer notification clicks can ask main to show/focus.
contextBridge.exposeInMainWorld('waDesktop', Object.freeze({
  showMainWindow: () => ipcRenderer.send('show-main-window')
}));
