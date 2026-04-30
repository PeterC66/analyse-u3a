# App Icons

This directory should contain:

- **icon.png** (256x256 or larger) — App icon for Electron
- **icon.ico** (optional) — Windows icon
- **icon.icns** (optional) — macOS icon

For now, the build will work with just a placeholder PNG. To create proper icons:

1. Design or find a 256x256 PNG image for your app
2. Place it as `icon.png` in this directory
3. electron-builder can auto-generate platform-specific formats

You can use free icon generators like:
- https://www.favicon-generator.org/
- https://icoconvert.com/
