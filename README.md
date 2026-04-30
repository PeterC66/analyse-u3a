# Analyse u3a

A **local-only desktop analysis tool** for u3a membership data from the Beacon system.

## Overview

Analyse u3a helps u3a treasurers and membership secretaries gain insights from their Beacon backup files (`.xlsx`). Load your backup once and generate analyses on:

- **Membership patterns** — growth/decline trends, demographics by class
- **Group popularity** — subscription levels, trends over time
- **Attendance patterns** — inferred from group membership and Calendar data
- **Member churn** — joiners, leavers, and lapsed renewals
- **Renewal payments** — income totals, counts, and trends by year/class

## Data Privacy

**Your data never leaves your machine.** This app:

- Runs **locally only** — no cloud uploads or telemetry
- Makes **no external HTTP calls** with your member data
- Binds to `localhost` only
- Keeps data in memory while loaded — nothing is persisted to disk (except optional config files)

The backup file contains personal data (names, addresses, phone numbers, emails) and must be protected accordingly.

## Getting Started

### For End Users

Download the latest installer for your operating system:

- **Windows:** `Analyse-u3a-0.0.1.exe` from [Releases](https://github.com/peterc66/analyse-u3a/releases)
- **macOS:** `Analyse-u3a-0.0.1.dmg` from [Releases](https://github.com/peterc66/analyse-u3a/releases)

Run the installer and follow the prompts. The app will check for updates automatically.

> **First run note:** Windows may show a "SmartScreen" warning since the app is unsigned.
> Click "More info" → "Run anyway" to proceed. Future signed releases will skip this step.

### For Developers

#### Prerequisites

- **Node.js** (LTS) with npm
- **Git**

#### Setup

```bash
git clone https://github.com/peterc66/analyse-u3a.git
cd analyse-u3a
npm install
```

> **Don't run `npm audit fix --force`.** It will upgrade Vite past
> major-version compatibility with the React plugin and break the build.
> The two reported audit warnings (`fast-csv`, `tmp`) are in dead code
> paths inside `exceljs` that this app never exercises — they're safe
> to ignore. See the *Dependency hygiene* section in `CLAUDE.md`.

#### Development Server

```bash
npm run dev
```

This starts a Vite dev server bound to `127.0.0.1:5173`. Open it in your browser, then:

1. Drag your Beacon backup (`.xlsx`) onto the page, or click **"Open File..."**
2. The app extracts the backup date/time from the filename (pattern: `YYYYMMDDHHMM_*.xlsx`).
   If the filename doesn't match, you'll be prompted to enter the date manually.
3. The file is validated against the schemas — structural problems halt the load;
   individual bad rows are reported and skipped.
4. Once loaded, you'll see a summary panel and a menu of analyses to choose from.

#### Building the Desktop App (Electron)

To build installers for Windows and macOS:

```bash
npm run build:electron
```

This compiles the React app, bundles it with Electron, and creates:
- `dist/Analyse-u3a-0.0.1.exe` (Windows)
- `dist/Analyse-u3a-0.0.1.dmg` (macOS)

> **Status:** ingestion + UI scaffold are working. The five analysis areas are
> shown as "Coming Soon" placeholders and will be implemented in follow-up work.

## Data Structure

The Beacon backup contains 23 sheets; this app uses 15 of them:

- **Members** — member records, status, membership class
- **Member Statuses, Membership Classes, Membership Fees** — reference data
- **Groups, Group members, Group Ledgers, Calendar** — group and attendance data
- **Finance Accounts, Finance Categories, Ledger, Detail** — financial records and renewal payments
- **Faculties, Venues** — organizational structure
- **u3a Officers** — contact information

For a complete data reference, see:

- `BEACON-DATA-STRUCTURE.md` — entity diagram and ingestion order
- `BEACON-DATA-MEMBERS.md` — member-related tables
- `BEACON-DATA-GROUPS.md` — group-related tables
- `BEACON-DATA-FINANCE.md` — financial tables and renewal payment identification
- `BEACON-DATA-CONTACTS.md` — officers

The Zod schemas in `schemas/zod/index.ts` are the runtime source of truth for data validation.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Desktop App | Electron + electron-updater | Native Windows/macOS apps with auto-updates |
| Runtime | Node.js (LTS) | Cross-platform, ships with Electron |
| Language | TypeScript | Strict type safety; schemas are TS-native |
| Excel parsing | exceljs | Battle-tested, same library as Beacon2 |
| Validation | Zod | Schemas already authored as Zod |
| UI | Vite + React | Fast dev loop, locally-bundled |
| Packaging | electron-builder | Creates .exe (Windows) and .dmg (macOS) installers |
| Charts | recharts or chart.js | Both work locally without external resources |
| Storage | In-memory or SQLite | SQLite optional for snapshot comparisons |

## Important Limitations

The Beacon backup **does not include**:

- **Per-event attendance** — Beacon records group membership but not who attended which meetings
- **Left-on dates** — inferred from status (lapsed/resigned) and renewal dates, not explicit
- **Email engagement** — no open/click tracking
- **Login history** — out of scope

The UI surfaces these limitations rather than producing misleading charts.

## Renewal Payment Configuration

Beacon does not have an explicit "renewal" flag. Renewal income is identified by **transaction category**:

1. The app scans `Finance Categories` for a default match against `/subscr|renew|member.*fee/i`
2. You can override the selection in the UI — different u3as use different category names
3. Your choice is saved as a config file (no member data)
4. Renewal rows are pulled from the `Detail` sheet and matched to their parent `Ledger` record for date and payment method

See `BEACON-DATA-FINANCE.md` for the full recipe.

## Development

### Project Structure

```
analyse-u3a/
├── index.html               — Vite entry point
├── package.json             — includes electron-builder config
├── vite.config.ts           — dev server bound to 127.0.0.1
├── electron/
│   ├── main.ts              — Electron main process
│   ├── preload.ts           — context-isolated preload script
│   └── tsconfig.json        — TypeScript config for Electron
├── src/
│   ├── main.tsx             — React entry
│   ├── App.tsx              — top-level state machine + layout
│   ├── ingest/
│   │   ├── parseFilename.ts — YYYYMMDDHHMM_*.xlsx → date + time
│   │   ├── sheetToObjects.ts— ExcelJS worksheet → array of plain objects
│   │   └── loadBackup.ts    — orchestrator (structural + row-level validation)
│   ├── components/
│   │   ├── FileDropzone.*       — drag-and-drop + file picker
│   │   ├── ManualDatePrompt.*   — fallback when filename doesn't match pattern
│   │   ├── SummaryPanel.*       — counts + validation status
│   │   ├── AnalysisMenu.*       — five analysis placeholders
│   │   └── ValidationDetails.*  — modal listing skipped rows
│   └── state/
│       └── types.ts         — Snapshot type (designed for future multi-file mode)
├── .github/workflows/
│   └── release.yml          — GitHub Actions: build & publish installers
├── assets/
│   └── icon.png             — application icon
└── schemas/
    ├── json/                — JSON Schema (Draft 2020-12), one per sheet
    └── zod/                 — Zod schemas + TypeScript types per sheet
```

### Coding Conventions

- ES modules (`import`/`export`) — all relative imports use `.js` extensions
  because of `moduleResolution: NodeNext`
- TypeScript strict mode — no `any` unless commented
- "u3a" is always lowercase
- Validate at the boundary (Zod runs when the file is read; trust the parsed types
  everywhere else)
- Dates internally as `YYYY-MM-DD` strings
- No `localStorage` for member data
- No backward-compatibility shims

For the full set of architectural decisions (stack, validation strategy, privacy
invariants), see the **Architecture decisions** section of `CLAUDE.md`.

### Type-checking

```bash
npm run typecheck
```

### Building for Production

**Web build (development/testing only):**

```bash
npm run build
```

Output is in `dist/`. This creates a static bundle but is not used in distribution.

**Desktop app build (for distribution):**

```bash
npm run build:electron
```

This creates platform-specific installers:
- `dist/Analyse-u3a-0.0.1.exe` (Windows NSIS installer)
- `dist/Analyse-u3a-0.0.1.dmg` (macOS disk image)
- `dist/Analyse-u3a-0.0.1.zip` (macOS portable)

### Releasing to Users

1. Update `package.json` version (e.g., `0.0.2`)
2. Commit and push to `main`
3. Create a git tag: `git tag v0.0.2 && git push origin v0.0.2`
4. GitHub Actions automatically builds and publishes installers to [Releases](https://github.com/peterc66/analyse-u3a/releases)
5. Users will see an update notification the next time they open the app

See `RELEASES.md` for detailed release workflow.

## Contributing

Contributions should maintain the privacy-first design and follow the coding conventions above. All member data operations must remain local.

## License

[Add your license here]
