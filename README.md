# WhatsApp Desktop (Electron)

An Electron-based desktop wrapper for the WhatsApp Web app with tray support and notification handling, targeting Linux.
It embeds `https://web.whatsapp.com/` in a hardened Electron window and provides a system tray icon with an unread
badge.

This app was initially scaffolded with the help of ChatGPT and then customized. It aims to provide a simple, working
Linux desktop client when distro packages are lagging or unavailable.

---

## Overview

- Tech stack: Node.js + Electron
- Package manager: npm (see `package-lock.json`)
- Builder: `electron-builder` (Linux target: AppImage)
- Entry points:
    - Main process: `main.js`
    - Preload script: `preload.js`
- App ID: `com.github.jankofron.whatsapp-desktop`
- Platform focus: Linux (arch) + XFCE (tested); other OS targets are not configured.

### Key features

- System tray icon with unread indicator.
- Opens external links in the default browser; keeps WhatsApp links inside the app.
- Forces a modern Chrome user-agent for better WhatsApp Web compatibility.
- Minimizes to tray instead of quitting on window close.
- Basic notification click handling to bring the window to the front.

### Security notes

- `contextIsolation: true`, `sandbox: true`, and `nodeIntegration: false` in the BrowserWindow.
- A dedicated persistent partition is used: `persist:whatsapp`.
- Permission requests are restricted to allow notifications only on `https://web.whatsapp.com`.

---

## Requirements

- OS: Linux (desktop environment with system tray support)
- Node.js: Recent LTS recommended. Electron 38 typically works with Node.js >= 18 (>= 20 preferred).
- npm
- Build tooling (for packaging): `electron-builder` downloads most dependencies automatically. On some distros you may
  need additional system packages for AppImage packaging.
- Optional: Arch Linux packaging via the included `PKGBUILD`.

---

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the app in development:
   ```bash
   npm start
   ```

The app will open WhatsApp Web. On close, it minimizes to the tray; use the tray menu to quit.

---

## Scripts

Defined in `package.json`:

- `start`: launches Electron in development.
- `dist`: builds a Linux AppImage using `electron-builder`.

Examples:

```bash
# Development
npm start

# Build AppImage (artifacts in dist/)
npm run dist
```

> Note: Only Linux AppImage target is configured at the moment.

---

## Environment variables

There are currently no required environment variables for normal use or build.


---

## Tests

There are no automated tests in this repository yet.

---

## Project structure

```
.
├─ assets/
│  └─ icons/           # App and tray icons (e.g., wa.png, wa-unread.png)
├─ main.js             # Electron main process (window, tray, permissions)
├─ preload.js          # Preload script (notification click bridge)
├─ package.json        # Scripts, electron-builder config
├─ package-lock.json   # npm lockfile
├─ PKGBUILD            # Arch Linux packaging (optional)
├─ LICENSE             # Project license
└─ README.md           # This file
```

Other files in the root may include prebuilt artifacts or packaging outputs.

---

## Packaging

This project uses `electron-builder` with an AppImage target:

- Configure options under the `build` key in `package.json`.
- Run `npm run dist` to produce an AppImage under `dist/`.

Arch Linux (`PKGBUILD`):

- A `PKGBUILD` is included for AUR-style packaging.
- Adjust metadata and version as needed before building.

> TODO: Add step-by-step Arch packaging instructions and any required dependencies.

---

## How it works (notes for developers)

- Unread count: The app inspects the window title for a leading number like `(3)` and updates the tray icon accordingly.
- External links: `setWindowOpenHandler` allows only `https://web.whatsapp.com/*` inside the app and opens others via
  `shell.openExternal`.
- User agent: A modern Chrome UA is forced for the window and via `app.userAgentFallback`.
- Single instance lock: Prevents opening multiple instances; subsequent launches focus the existing one.

---

## License

This software is provided under the LGPL 2.1 license.