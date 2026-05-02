# Installing Analyse u3a

This guide is for non-technical users installing Analyse u3a on Windows or Mac.

## System Requirements

- **Windows 10/11** (64-bit) OR **macOS 10.13+**
- Approximately 300 MB free disk space
- No additional software required (Node.js is bundled)

## Installation Steps

### Windows

1. Go to [https://github.com/peterc66/analyse-u3a/releases](https://github.com/peterc66/analyse-u3a/releases)
2. Find the latest release and download `Analyse-u3a-X.X.X.exe`
3. Double-click the `.exe` file
4. You may see a Windows security warning:
   - Click "More info"
   - Click "Run anyway"
   - (This warning appears because we don't have a paid code-signing certificate)
5. Follow the installer prompts
6. A desktop shortcut will be created automatically
7. Double-click the shortcut to launch the app

### macOS

1. Go to [https://github.com/peterc66/analyse-u3a/releases](https://github.com/peterc66/analyse-u3a/releases)
2. Find the latest release and download the `.dmg` that matches your Mac:
   - Apple Silicon (M1/M2/M3/M4): `Analyse-u3a-X.X.X-arm64.dmg`
   - Intel: `Analyse-u3a-X.X.X.dmg` (no `-arm64` suffix)
3. Double-click the `.dmg` file to mount it
4. Drag "Analyse u3a" to the Applications folder
5. Wait for the copy to complete
6. Open **Applications** folder
7. **Right-click** "Analyse u3a" and choose **Open** (do **not** double-click the first time)
8. In the dialog that appears, click **Open** again to confirm

The right-click step is only required the first time you launch the app.
After that, double-click works as normal.

## Running the App

After installation:
- **Windows:** Look for "Analyse u3a" in your Start menu or double-click the desktop shortcut
- **macOS:** Open Applications folder and double-click "Analyse u3a"

The app will launch with a window ready for you to open your Beacon backup file.

## Updates

The app checks for updates automatically. If an update is available:
1. A notification will appear
2. You can choose to update immediately or later
3. Updates are downloaded automatically and installed on next launch
4. No action needed from you — updates happen seamlessly

## Troubleshooting

**App won't start?**
- Make sure you downloaded from the official GitHub releases page
- Try restarting your computer
- Try reinstalling the app

**Windows says "Windows protected your PC"?**
- This is normal for unsigned apps
- Click "More info" → "Run anyway"
- The app is safe — it's just not from a paid certificate authority

**macOS says "Analyse u3a is damaged and can't be opened" or "cannot be opened because the developer cannot be verified"?**
- This is normal for unsigned apps downloaded from the internet — the file is **not** actually corrupted. macOS adds a "quarantine" flag to anything downloaded by Safari/Chrome and refuses to run unsigned apps until you tell it to trust this one.
- **First, try this:** open the **Applications** folder, **right-click** (or Control-click) "Analyse u3a", choose **Open**, and then click **Open** in the dialog. After that, double-clicking will work normally.
- **If you still see "damaged"**, open the **Terminal** app (Applications → Utilities → Terminal) and paste this single line, then press Return:
  ```
  xattr -cr "/Applications/Analyse u3a.app"
  ```
  This removes the quarantine flag. You can then launch the app normally.
- If you downloaded the wrong architecture (e.g. the Intel `.dmg` on an Apple Silicon Mac), uninstall and download the correct one — see step 2 of the macOS install steps above.

**Can't find the app after installing?**
- **Windows:** Search for "Analyse u3a" in the Start menu
- **macOS:** Open Applications folder (use Cmd+Shift+A in Finder)

**Need help?**
- Check the GitHub repository: [https://github.com/peterc66/analyse-u3a](https://github.com/peterc66/analyse-u3a)
- Contact your u3a administrator

## Uninstalling

**Windows:**
- Go to Settings → Apps → Apps & features
- Find "Analyse u3a"
- Click "Uninstall"

**macOS:**
- Open Applications folder
- Drag "Analyse u3a" to Trash
- Empty Trash
