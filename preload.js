// preload.js
// Intentionally minimal: notifications + unread badge are handled in main.
// Keep this file so webPreferences.preload stays valid and you can add bridges later.

const { contextBridge } = require('electron');

// Expose an empty API surface for future use without giving page access to Node.
contextBridge.exposeInMainWorld('waDesktop', Object.freeze({}));

