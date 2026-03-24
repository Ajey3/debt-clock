/* ============================================================
   THE DEBT CLOCK — script.js
   All JavaScript logic for the national debt tracker.
 
   HOW THE COUNTER WORKS:
   We don't call a live API on every tick — that would be slow
   and rate-limited. Instead we use a math-based approach:
     1. Anchor to a known debt value at a known date (BASE_DEBT)
     2. Calculate how many milliseconds have passed since then
     3. Multiply elapsed time by the known rate of increase
   This gives a smooth, always-accurate running estimate.
   ============================================================ */
 
 
/* ============================================================
   CONFIGURATION CONSTANTS
   Update BASE_DEBT and ANCHOR_TIME periodically to stay
   accurate. See "DATA SOURCES" section at the bottom of
   this file for where to get fresh numbers.
   ============================================================ */
 
// U.S. total public debt as of Jan 1, 2025 (in USD)
// Source: U.S. Treasury Fiscal Data — treasuryfiscaldata.gov
const BASE_DEBT = 36_220_000_000_000;
 
// The exact moment BASE_DEBT was valid (ISO 8601 UTC)
// JavaScript Date.getTime() returns Unix milliseconds
const ANCHOR_TIME = new Date('2025-01-01T00:00:00Z').getTime();
 
// Rate of debt increase in dollars per millisecond
// Derived from: ~$83,000,000 net new debt per day ÷ 86,400,000 ms/day
// ≈ $3,800,000 per minute ÷ 60,000 ms/min ≈ $0.0633/ms
const RATE_PER_MS = 3_800_000 / 60 / 1000;
 
// U.S. population (Census Bureau estimate, 2024)
const US_POPULATION = 335_000_000;
 
// Number of individual taxpayers (IRS Statistics of Income)
const US_TAXPAYERS = 150_000_000;
 
// U.S. GDP (Bureau of Economic Analysis, 2024 estimate, in USD)
const US_GDP = 29_200_000_000_000;
 
 
/* ============================================================
   DECADE BAR CHART DATA
   Historical debt at key dates.
   Max is 40T — sets the 100% width reference for bar scaling.
   ============================================================ */
const DECADE_DATA = [
  { year: '1980', amount: 0.908 },
  { year: '1990', amount: 3.23  },
  { year: '2000', amount: 5.67  },
  { year: '2008', amount: 10.0  },
  { year: '2016', amount: 19.9  },
  { year: '2020', amount: 27.8  },
  { year: '2023', amount: 33.0  },
  { year: 'NOW',  amount: null, live: true }, // filled dynamically
];
 
const BAR_MAX = 40; // $40T = 100% bar width
 
 
/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */
 
/**
 * Returns the current estimated U.S. national debt in dollars.
 * Formula: BASE_DEBT + (milliseconds elapsed × rate per ms)
 */
function currentDebt() {
  const elapsed = Date.now() - ANCHOR_TIME;
  return BASE_DEBT + elapsed * RATE_PER_MS;
}
 
/**
 * Formats a large dollar number with commas.
 * e.g. 36220000000000 → "$36,220,000,000,000"
 */
function formatDebt(n) {
  const s = Math.floor(n).toString();
  let result = '';
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) result += ',';
    result += s[i];
  }
  return '$' + result;
}
 
/**
 * Formats a number as a short dollar string with T/B/M suffix.
 * e.g. 108955 → "$108,955"
 * e.g. 36220000000000 → "$36.22T"
 */
function formatShort(n) {
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(1)  + 'B';
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(0)  + 'M';
  return '$' + Math.floor(n).toLocaleString();
}
 
 
/* ============================================================
   DOM ELEMENT REFERENCES
   Grab all the elements we'll update on each tick.
   Doing this once at startup is more efficient than calling
   getElementById() inside the tick loop every 100ms.
   ============================================================ */
const mainDebtEl   = document.getElementById('mainDebt');
const perCitizenEl = document.getElementById('perCitizen');
const perTaxEl     = document.getElementById('perTaxpayer');
const debtGDPEl    = document.getElementById('debtGDP');
const tsEl         = document.getElementById('clockTs');
const milestoneEl  = document.getElementById('milestoneNow');
 
 
/* ============================================================
   TICK FUNCTION
   Called every 100ms by setInterval().
   Updates all live numbers on the page.
   ============================================================ */
let lastDebt = 0; // used to detect when debt crosses a billion
 
function tick() {
  const debt = currentDebt();
 
  // Update the main counter display
  mainDebtEl.textContent = formatDebt(debt);
 
  // Flash red briefly when the number crosses a new billion
  // Math.floor(debt / 1e9) changes each time we pass a billion
  if (Math.floor(debt / 1e9) !== Math.floor(lastDebt / 1e9)) {
    mainDebtEl.classList.add('flash');
    setTimeout(() => mainDebtEl.classList.remove('flash'), 120);
  }
  lastDebt = debt;
 
  // Update derived figures
  perCitizenEl.textContent = formatShort(debt / US_POPULATION);
  perTaxEl.textContent     = formatShort(debt / US_TAXPAYERS);
  debtGDPEl.textContent    = ((debt / US_GDP) * 100).toFixed(1) + '%';
 
  // Update the "NOW" milestone row
  if (milestoneEl) {
    milestoneEl.textContent = (debt / 1e12).toFixed(2) + 'T';
  }
 
  // UTC clock in the footer
  const now = new Date();
  tsEl.textContent = now.toISOString().replace('T', ' ').split('.')[0] + ' UTC';
}
 
 
/* ============================================================
   BUILD DECADE BAR CHART
   Creates bar rows dynamically and injects them into #barChart.
   Bars start at width:0 and animate to their real width after
   a short delay (lets the browser paint first).
   ============================================================ */
function buildBarChart() {
  const barChart = document.getElementById('barChart');
 
  DECADE_DATA.forEach(d => {
    // Calculate bar width as % of BAR_MAX
    const pct = d.live ? 0 : (d.amount / BAR_MAX * 100);
 
    // Build the row HTML
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <div class="bar-decade">${d.year}</div>
      <div class="bar-track">
        <div class="bar-fill ${d.live ? 'amber' : ''}"
             data-pct="${pct}"
             style="width: 0%">
        </div>
      </div>
      <div class="bar-label" id="blabel-${d.year}">
        ${d.live ? '...' : '$' + d.amount.toFixed(2) + 'T'}
      </div>
    `;
 
    barChart.appendChild(row);
  });
 
  // Animate all static bars in after 300ms
  // requestAnimationFrame ensures the browser has painted before we animate
  setTimeout(() => {
    document.querySelectorAll('.bar-fill').forEach(el => {
      const pct = parseFloat(el.dataset.pct);
      el.style.width = pct + '%';
    });
  }, 300);
}
 
 
/* ============================================================
   UPDATE LIVE BAR
   The "NOW" bar updates every 500ms to reflect the current debt.
   ============================================================ */
function updateLiveBar() {
  const debt = currentDebt();
  const pct  = Math.min((debt / 1e12) / BAR_MAX * 100, 100);
 
  const liveBar   = document.querySelector('.bar-fill.amber');
  const liveLabel = document.getElementById('blabel-NOW');
 
  if (liveBar)   liveBar.style.width    = pct + '%';
  if (liveLabel) liveLabel.textContent  = '$' + (debt / 1e12).toFixed(2) + 'T';
}
 
 
/* ============================================================
   INITIALISE
   Run everything on page load.
   ============================================================ */
function init() {
  buildBarChart();  // build the bar chart HTML
  tick();           // run the first tick immediately (no 100ms wait)
 
  // Set live bar to correct width after the static bars animate
  setTimeout(() => updateLiveBar(), 350);
 
  // Main counter ticks every 100ms — fast enough to feel live
  setInterval(tick, 100);
 
  // Live bar updates every 500ms — no need to update faster
  setInterval(updateLiveBar, 500);
}
 
// Kick everything off
init();