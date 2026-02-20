# Maintainer: Jan Kofron <jan.kofron@gmail.com>
pkgname=whatsapp-electron-app
pkgver=1.1.0
pkgrel=1
pkgdesc="WhatsApp Web wrapper for Linux desktop (Electron)"
arch=('x86_64')
url="https://github.com/jankofron/whatsapp-electron-app"
license=('LGPL-2.1-only')
depends=('electron>=40.6.0' 'hicolor-icon-theme' 'libappindicator-gtk3')
makedepends=('asar')
source=("${pkgname}-${pkgver}.tar.gz::https://github.com/jankofron/whatsapp-electron-app/archive/refs/tags/v${pkgver}.tar.gz")
sha256sums=('19d8e32a92a866a1ed2288275553ba85bf25cd3cd58cbb826a51ea23859f29cc')

# App install dir (where we put app.asar and resources)
_appdir="usr/lib/${pkgname}"

build() {
  cd "${srcdir}/${pkgname}-${pkgver}"
  local _builddir="${srcdir}/${pkgname}-build"

  # Stage only runtime files into the asar archive.
  rm -rf "${_builddir}"
  install -d "${_builddir}"
  cp -r main.js preload.js package.json assets "${_builddir}/"

  # Build app.asar (no bundled Electron runtime).
  asar pack "${_builddir}" "${srcdir}/app.asar"
}

package() {
  cd "${srcdir}/${pkgname}-${pkgver}"

  # App resources
  install -d "${pkgdir}/${_appdir}"
  install -m644 "${srcdir}/app.asar" "${pkgdir}/${_appdir}/app.asar"

  # Icons
  install -Dm644 assets/icons/icon.png \
    "${pkgdir}/usr/share/icons/hicolor/512x512/apps/${pkgname}.png"

  # Desktop launcher uses system electron to run our asar
  install -Dm755 /dev/stdin "${pkgdir}/usr/bin/${pkgname}" <<'EOF'
#!/bin/sh
exec /usr/bin/electron /usr/lib/whatsapp-electron-app/app.asar "$@"
EOF

  # .desktop file
  install -Dm644 /dev/stdin "${pkgdir}/usr/share/applications/${pkgname}.desktop" <<'EOF'
[Desktop Entry]
Name=WhatsApp
Comment=WhatsApp Web desktop wrapper
Exec=whatsapp-electron-app
Terminal=false
Type=Application
Categories=Network;InstantMessaging;
Icon=whatsapp-electron-app
EOF

  # License if you have one
  [[ -f LICENSE ]] && install -Dm644 LICENSE "${pkgdir}/usr/share/licenses/${pkgname}/LICENSE"
}
