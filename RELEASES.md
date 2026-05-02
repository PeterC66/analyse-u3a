# Releasing Analyse u3a

This guide explains how to create releases and distribute them to users.

## How to Create a Release

1. **Update the version in `package.json`:**
   ```bash
   # Edit package.json and update "version": "0.0.X" to the new version
   # Semantic versioning: major.minor.patch
   ```

2. **Commit the version change:**
   ```bash
   git add package.json
   git commit -m "Release v0.0.X"
   ```

3. **Create a git tag:**
   ```bash
   git tag v0.0.X
   git push origin main
   git push origin v0.0.X
   ```

   This will automatically trigger GitHub Actions to build installers for Windows and Mac.

4. **Wait for the build to complete:**
   - Go to **Settings → Actions → All workflows** (or click the Actions tab)
   - Watch the "Build and Release" workflow complete
   - Once complete, installers will be attached to the GitHub release

5. **Download and test the installers locally** before sharing with users

## Pre-release tags

Tags whose version contains a SemVer pre-release suffix (e.g. `v0.1.1-alpha`,
`v0.2.0-beta.1`, `v1.0.0-rc.1`) are automatically published as GitHub
**pre-releases** and **will not be delivered to existing users** by
auto-update. electron-builder writes them to a separate channel
(`alpha.yml` / `beta.yml`) rather than `latest.yml`, so installations on the
stable channel keep ignoring them until a stable `vX.Y.Z` tag is pushed.

Use this when you want to share a build with a small group of testers via
a direct download link from the GitHub release page.

## What Gets Built

GitHub Actions automatically builds:
- **Windows:** `Analyse-u3a-0.0.X.exe` (signed with self-signed cert, Windows may warn)
- **macOS:** `Analyse-u3a-0.0.X.dmg` (disk image installer)

## Sharing with Users

### Option A: Website Download (Recommended)
Create a simple website with download links pointing to the GitHub releases:
```
https://github.com/peterc66/analyse-u3a/releases/download/v0.0.X/Analyse-u3a-0.0.X.exe
https://github.com/peterc66/analyse-u3a/releases/download/v0.0.X/Analyse-u3a-0.0.X.dmg
```

### Option B: Direct GitHub Releases
Users can download directly from:
```
https://github.com/peterc66/analyse-u3a/releases
```

## Auto-Updates

Once a user installs the app:
1. The app checks for updates automatically on startup
2. If a new version exists, users are notified
3. Users can choose to update immediately or later

This happens seamlessly — no manual downloads needed after the first install.

## Notes for Windows Users

Windows SmartScreen may warn users that the app is unsigned (because we're not paying for a code-signing certificate). They can safely dismiss the warning:
1. Click "More info"
2. Click "Run anyway"

This is a one-time warning per version.

## Troubleshooting

### Build failed?
Check the GitHub Actions workflow logs:
1. Go to **Actions** tab on GitHub
2. Click "Build and Release" 
3. Click the failed run to see error details
4. Common issues:
   - Missing Node.js version (check `.node-version` or use v20)
   - `npm ci` failed due to network (retry manually)

### Need to cancel a release?
- Delete the tag: `git tag -d v0.0.X && git push origin :v0.0.X`
- Delete the GitHub release in the web UI

### Need to re-release the same version?
- Delete the tag and release, make changes, and push the tag again

## Development

To test the app locally:
```bash
npm run dev:electron
```

This starts Vite dev server + opens Electron window.
