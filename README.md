# Funded Abroad

A free scholarship finder for Pakistani students: fully and partly funded master's, PhD and research-internship programmes for the **2027 intake**, with live deadline countdowns, eligibility flags and links to the official pages.

It's a static site with no backend, accounts, API keys or tracking. Your shortlist and checklists stay in your browser.

## What it looks like

- **Header** with the date the deadlines were last checked and a theme button (auto/light/dark).
- **"Next six months" strip**: one column per month, listing every upcoming deadline. Estimated dates are marked with `~`, and dates within 30 days are shown in orange. Click a name to jump to its card.
- **Filter bar**: search, level, status, field (CS/AI, engineering…), region, sort, plus quick toggles for *Fully funded*, *Can apply while living outside Pakistan*, *No work experience needed* and *★ Shortlist*.
- **Toolbar**: export the shortlist to your calendar, export or import your data, and copy a link to the current filtered view.
- **One card per programme** showing:
  - status badge (Open, Closing soon, Opens…, Expected, Varies or Closed) and a live countdown
  - host, country, fields, deadline with its time zone, amount, requirement tags and a short note
  - when the entry was last checked, and against which official page
  - an expandable application checklist with a progress count
  - star (shortlist), *Add to calendar*, *Compare* and *Official page* actions
- **Compare**: tick 2–3 programmes, then press *Compare* in the bar at the bottom. They open side by side in a dialog, which scrolls sideways on phones.

The layout is built to work at 400 px wide and in both light and dark mode.

## Run it locally

You need Node.js 20 or later.

```bash
npm install
```

```bash
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run validate-data` | Checks `src/data/scholarships.json` and fails loudly on bad data |
| `npm test` | Runs the Vitest unit tests (status/countdown logic, filters, URL hash, .ics, checklists, import/export, validator) |
| `npm run build` | Validates data, type-checks, and builds the static site into `dist/` |
| `npm run preview` | Serves the built `dist/` folder locally |

## Project layout

```
index.html                 page shell (Vite entry)
src/
  main.ts                  wiring: state, events, rendering
  types.ts                 Scholarship type, regions, field categories
  status.ts                open / closing soon / upcoming / expected / varies / closed + countdown
  filters.ts               filtering, sorting, URL-hash (shareable links)
  storage.ts               all localStorage access (wrapped in try/catch)
  checklist.ts             default + programme-specific checklist items
  ics.ts                   calendar (.ics) generation
  backup.ts                JSON export / import
  validate.ts              data validator (used by the script and tests)
  data/scholarships.json   ← all programme data
  data/load.ts             typed import of the JSON
  ui/                      list, deadline strip, compare table, DOM helpers
  styles.css
scripts/validate-data.ts   CLI wrapper for the validator
tests/                     Vitest tests
```

## Add or update a scholarship

Edit `src/data/scholarships.json`, then run `npm run validate-data`. Each entry looks like this:

```json
{
  "id": "eth",
  "name": "ETH Zurich Excellence Scholarship (ESOP)",
  "host": "ETH Zurich",
  "country": "Switzerland",
  "region": "europe",
  "levels": ["Master's"],
  "full": true,
  "amount": "CHF 13,500 per semester (from autumn 2027) plus tuition waiver",
  "opens": "2026-11-01",
  "deadline": "2026-11-30T11:59:00+01:00",
  "dlText": "30 Nov 2026, 11:59 CET (noon, not midnight)",
  "tags": ["Top 10% of class", "Apply via eApply in the Nov window"],
  "abroad": true,
  "work": false,
  "hec": false,
  "fields": "Engineering, CS, natural sciences",
  "fieldCats": ["cs-ai", "engineering", "sciences"],
  "note": "About 60 awards for 2027/28; decisions end of March.",
  "url": "https://ethz.ch/en/studies/financial/scholarships/excellencescholarship.html",
  "source": "https://ethz.ch/en/studies/master/application/dates.html",
  "verifiedOn": "2026-11-04",
  "checklist": ["Master's thesis pre-proposal"]
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Unique; lowercase letters, digits and hyphens. Used in shortlists and backups, so don't rename existing ids. |
| `name`, `host`, `country` | yes | Display text. |
| `region` | yes | One of `europe`, `uk`, `east-asia` (East & Southeast Asia), `middle-east`, `north-america`, `oceania`, `turkiye`, `global`. |
| `levels` | yes | Any of `"Master's"`, `"PhD"`, `"Internship"`. |
| `full` | yes | `true` = fully funded, `false` = partial. |
| `amount` | yes | Never guess. Write "check official page" if the amount is unknown. |
| `opens` | no | `YYYY-MM-DD` or an ISO date-time with offset. If it's in the future, the card shows "Opens …". |
| `deadline` | yes | ISO 8601 **with a time zone**, e.g. `2026-11-30T23:59:00+01:00`. Use `-12:00` for "Anywhere on Earth". For closed rounds, use the past deadline. |
| `dlText` | yes | Human-readable deadline shown on the card. |
| `expected` | no | `true` if the date is estimated from the last cycle. Say so in `dlText`/`note`. |
| `varies` | no | `true` if the deadline depends on the course or university; `deadline` is then a representative date. |
| `nextText` | no | Shown instead of the countdown once closed, e.g. "Next round ~Aug 2027". |
| `tags` | yes | Short requirement facts. Tags mentioning residency, work experience, age, "only" and similar are highlighted. |
| `abroad` | yes | `true` if you can apply while living outside Pakistan. |
| `work` | yes | `true` if work experience is required. |
| `hec` | yes | `true` if HEC nomination is required. |
| `nomination` | no | `true` if a university, department or supervisor must nominate you. |
| `fields`, `fieldCats` | yes | Free text plus categories: `cs-ai`, `engineering`, `sciences`, `social`, `any`. |
| `note` | yes | One or two plain sentences. |
| `url` | yes | Official programme page (https). |
| `source` | yes | The official page you checked the dates and amounts against (https). |
| `verifiedOn` | yes | `YYYY-MM-DD` when you checked. |
| `checklist` | no | Extra checklist items specific to this programme. |

The validator rejects missing fields, unknown fields (to catch typos), deadlines without a time zone, impossible dates, non-https URLs, duplicate ids, and `opens` dates after the deadline.

## Deploy to GitHub Pages

The build uses a relative `base` (`./`), so `dist/` works from any sub-path such as `https://<user>.github.io/funded-abroad/`.

**Option A: GitHub Actions (recommended)**

1. In the repository go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. In `.github/workflows/ci.yml`, uncomment the `deploy` job at the bottom (and the `permissions`/`concurrency` lines it mentions).
3. Push to `main`. Every push will validate the data, run the tests, build, and publish `dist/`.

**Option B: by hand**

```bash
npm run build
```

Then publish the contents of `dist/` to a `gh-pages` branch, or to any static host.

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request: `npm ci`, `npm run validate-data`, `npm test` and `npm run build`. The Pages deploy job is included but commented out, so nothing is published until you turn it on.

## Privacy and storage

- The shortlist, checklists and theme are stored in `localStorage` on your device only.
- If your browser blocks storage, the page still works and shows a warning. Use **Export my data** to keep a copy.
- **Import data** merges a backup into what's already there: shortlists are combined and checklist ticks added. It never deletes anything.

## Disclaimer

This is an unofficial guide. Deadlines and amounts change, so always confirm on the official page (linked on every card) before you apply.
