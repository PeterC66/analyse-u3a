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

### Prerequisites

- **Node.js** (LTS) with npm

### Installation

```bash
npm install
```

### Running the App

```bash
npm start
```

This starts a Vite dev server at `http://localhost:5173`. Open it in your browser, then:

1. Use the file picker to select your Beacon backup (`.xlsx`)
2. Wait for validation and parsing
3. Explore the analyses

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
| Runtime | Node.js (LTS) | Cross-platform, ships with npm |
| Language | TypeScript | Strict type safety; schemas are TS-native |
| Excel parsing | exceljs | Battle-tested, same library as Beacon2 |
| Validation | Zod | Schemas already authored as Zod |
| UI | Vite + React | Fast dev loop, widely understood |
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
src/
├── components/      — React components
├── schemas/         — Zod validation schemas
├── utils/           — Utility functions
└── App.tsx          — Main application

schemas/
├── json/            — JSON Schema files (Draft 2020-12)
└── zod/             — Zod schemas and TypeScript types
```

### Coding Conventions

- ES modules (`import`/`export`)
- TypeScript strict mode — no `any` unless commented
- "u3a" is always lowercase
- Validate at the boundary (use Zod when reading files)
- Dates internally as `YYYY-MM-DD` strings
- No `localStorage` for member data
- No backward-compatibility shims

### Building for Production

```bash
npm run build
```

Output is in `dist/`. To package as a standalone executable (Electron or `pkg`), see the respective tool docs.

## Contributing

Contributions should maintain the privacy-first design and follow the coding conventions above. All member data operations must remain local.

## License

[Add your license here]
