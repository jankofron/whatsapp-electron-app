# WhatsApp Desktop (Electron)

A lightweight Electron wrapper for `https://web.whatsapp.com/`, focused on Linux desktop usage (including XFCE).

## Features

- System tray icon with unread indicator.
- Minimize-to-tray behavior on window close.
- External links open in the default browser.
- Hardened Electron defaults (`contextIsolation`, `sandbox`, no Node integration in renderer).

## Dependency Baseline

Updated on February 20, 2026:

- `electron`: `^40.6.0`
- `@electron/asar`: `^4.0.1`
- Node.js: `>=22.12.0`

## Requirements

- Linux desktop environment with tray support (XFCE works).
- For local development: `nodejs`, `npm`.
- For packaged runtime: `electron` (>=40.6.0), `libappindicator-gtk3`, `hicolor-icon-theme`.

## Development

Install dependencies and run:

```bash
npm install
npm start
```

## Packaging (No electron-builder)

This project does not use `electron-builder`.

Build an `app.asar` archive:

```bash
npm run pack:asar
```

Output: `dist/app.asar`

## Arch Linux / AUR Packaging

A `PKGBUILD` is included and is suitable for AUR-style packaging.

It:

- Builds `app.asar` with `asar`.
- Installs app files under `/usr/lib/whatsapp-electron-app/`.
- Installs `/usr/bin/whatsapp-electron-app` launcher using system Electron.
- Installs desktop entry and icon.

Build and install locally:

```bash
makepkg -si
```

## Project Layout

```text
.
├─ assets/icons/       # App + tray icons
├─ main.js             # Electron main process
├─ preload.js          # Preload bridge
├─ package.json        # Scripts + dependency versions
├─ PKGBUILD            # Arch/AUR package recipe
└─ README.md
```

## License

LGPL-2.1-only (see `LICENSE`).
