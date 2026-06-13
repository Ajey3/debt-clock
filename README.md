# The Debt Clock 🇺🇸

A real-time, browser-based U.S. National Debt tracker with live interpolated estimates, key economic indicators, historical milestones, and a decade-by-decade bar chart — all rendered in a high-contrast terminal aesthetic.

## Features

- **Live Debt Counter** — Interpolates continuously from a known baseline at approximately $3.8M/minute (the approximate federal borrowing rate), updating every 100ms
- **Per-Citizen / Per-Taxpayer Breakdown** — Divides the running total against U.S. population (335M) and taxpayer count (150M)
- **Debt-to-GDP Ratio** — Live percentage calculated against 2024 GDP ($29.2T)
- **Key Economic Indicators Grid** — FY2024 deficit, interest payments, federal revenue vs. spending, 10-yr Treasury yield, unemployment
- **Historical Bar Chart** — Debt by decade from 1980 to present, with the current figure animating in as a live bar
- **Debt Milestones Timeline** — Major inflection points from the first $1T (1981) through the COVID-era surge and beyond
- **No dependencies, no build step** — Pure HTML, CSS, and vanilla JavaScript; opens directly in any browser

## Tech Stack

| Layer | Details |
|---|---|
| Markup | Semantic HTML5 |
| Styling | Pure CSS with custom properties, scanline/noise texture overlays, CSS Grid & Flexbox |
| Logic | Vanilla JavaScript — time-anchored interpolation, DOM updates via `setInterval` |
| Fonts | Google Fonts — Share Tech Mono, Bebas Neue, IBM Plex Sans |

## How the Counter Works

The debt figure is not fetched from a live API. Instead, it uses a **time-anchored interpolation** approach:

```js
const BASE_DEBT   = 36_220_000_000_000;   // ~$36.2T as of Jan 1, 2025
const RATE_PER_MS = 3_800_000 / 60 / 1000; // $3.8M/min → $/ms
const ANCHOR_TIME = new Date('2025-01-01T00:00:00Z').getTime();

function currentDebt() {
  const elapsed = Date.now() - ANCHOR_TIME;
  return BASE_DEBT + elapsed * RATE_PER_MS;
}
```

This produces a plausible real-time estimate without any server or API dependency. The counter flashes red whenever the debt crosses a new billion-dollar threshold.

## Usage

No installation required. Just open `index.html` in a browser.

```bash
# Clone or download, then:
open index.html
```

To update the baseline figures (e.g. when the published debt total changes), edit the constants at the top of the `<script>` block:

```js
const BASE_DEBT   = /* new published figure */;
const ANCHOR_TIME = /* corresponding UTC timestamp */;
```

Official published totals are available from the [U.S. Treasury Fiscal Data portal](https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/).

## Data Sources

| Metric | Source |
|---|---|
| Total Public Debt | U.S. Department of the Treasury |
| GDP & Growth Rate | Bureau of Economic Analysis (BEA) |
| Deficit & Spending | Congressional Budget Office (CBO) |
| Unemployment | Bureau of Labor Statistics (BLS) |
| Treasury Yield | Federal Reserve / FRED |

> **Disclaimer:** This is an interpolated estimate for informational and educational purposes. It is not official government data.

## Design Notes

The visual language draws from mission control dashboards and cold-war-era telemetry readouts: monospace type, scanline overlays, a near-black background, and a red/amber/green alert color system. The intent is to frame fiscal data with the same weight it deserves — not as an abstraction, but as a live system with real stakes.

## License

MIT — free to use, adapt, or build on.
