const { contextBridge, ipcRenderer } = require('electron');

// Inject a small script into the page context to observe title changes & wrap Notification
const injected = `
(() => {
  const send = (channel, payload) => {
    window.postMessage({ __wa_bridge: true, channel, payload }, '*');
  };

  // Unread count from title like "(12) WhatsApp"
  function extractCount(title) {
    const m = /^\\((\\d+)\\)\\s+/.exec(title || '');
    return m ? parseInt(m[1], 10) : 0;
  }

  const report = () => send('unread-count', extractCount(document.title));

  // Observe title changes
  const titleEl = document.querySelector('title') || (() => {
    const t = document.createElement('title');
    document.head.appendChild(t);
    return t;
  })();
  const obs = new MutationObserver(report);
  obs.observe(titleEl, { childList: true });
  // Initial
  report();

  // Optional: hook Notification to mirror info to main (not necessary for popups)
  const OriginalNotification = window.Notification;
  function WrappedNotification(title, options) {
    try {
      send('notify', { title, body: options && options.body });
    } catch {}
    return new OriginalNotification(title, options);
  }
  WrappedNotification.requestPermission = (...args) => OriginalNotification.requestPermission(...args);
  Object.defineProperty(WrappedNotification, 'permission', {
    get: () => OriginalNotification.permission
  });
  window.Notification = WrappedNotification;
})();
`;

window.addEventListener('DOMContentLoaded', () => {
  // Inject into page world
  const s = document.createElement('script');
  s.textContent = injected;
  document.documentElement.appendChild(s);
  s.remove();
});

// Bridge page -> preload -> main
window.addEventListener('message', (e) => {
  const data = e.data || {};
  if (!data.__wa_bridge) return;
  if (data.channel === 'unread-count') {
    ipcRenderer.send('unread-count', data.payload || 0);
  } else if (data.channel === 'notify') {
    ipcRenderer.send('notify', data.payload || {});
  }
});

contextBridge.exposeInMainWorld('waDesktop', { /* reserved for future */ });

