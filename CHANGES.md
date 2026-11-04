# Overnight upgrade: what changed

Branch: `overnight-upgrade`. Work date: 4 Nov 2026.

**Result:** 55 programmes (was 27): 29 added, 1 removed. `npm run validate-data`, `npm test` (46 tests) and `npm run build` all pass. The visual design (palette, fonts, ledger layout) is unchanged apart from the small fixes listed below.

---

## Read this first: how the research was verified

The cloud environment's network policy **blocked direct page fetches** of official sites: ethz.ch, mpg.de, ellis.eu and others returned "host not allowed". Search did work, so every fact was checked with web searches **restricted to the programme's official domain** (for example `allowed_domains: ["oist.jp"]`), reading the official pages' text through the search tool.

As a result:

- Every entry's `source` is an official URL and `verifiedOn` is `2026-11-04`. But nobody opened those pages in a browser, so **spot-check the high-stakes ones** before promoting the site. The ones flagged as uncertain are listed below.
- When an official page gave no clear date, the entry is marked `expected: true` and the note says so.
- Amounts that couldn't be confirmed say "check official page". None were invented.
- Where an official page's time of day wasn't stated, the note says "time not stated" and I used 23:59 local time. For Finnish deadlines I used the earlier 15:00, and the note says to confirm.

---

## Phase 1: restructure

- Converted the single `index.html` into a **Vite + vanilla TypeScript** project. No framework: plain DOM rendering was simple enough for compare mode.
- Data moved to `src/data/scholarships.json`. The type is in `src/types.ts`.
- `npm run validate-data` (`scripts/validate-data.ts` → `src/validate.ts`) checks:
  - required fields and types, and rejects unknown fields (catches typos)
  - ISO 8601 deadlines with an explicit time zone, and real calendar dates
  - `opens` falls before `deadline`
  - https URLs
  - `id` format and no duplicate ids
  - valid levels, regions and field categories

  It exits 1 with a list of problems. `npm run build` runs it first.
- Modules: `status.ts` (status and countdown), `filters.ts` (filters, sort, URL hash), `storage.ts` (all localStorage), `checklist.ts`, `ics.ts`, `backup.ts`, and `ui/` (list, strip, compare, DOM helpers).
- **Vitest**: 46 tests with a fixed "now" (`2026-11-04T12:00Z`). They cover every status (open, closing soon at exactly 30 days, upcoming, expected, varies, closed), time-zone edge cases, countdown formatting, sorting, filters, URL hash round-trip, .ics output (UTC conversion, escaping, line folding, reminders), checklists, export/import and the validator. One test also validates the shipped dataset.
- `vite.config.ts` uses `base: "./"`, so the build works from any GitHub Pages sub-path.

**New fields added to every entry:** `region`, `fieldCats`, `hec`, optional `nomination`, `source`, `verifiedOn`, optional `checklist`. The existing fields (`abroad`, `work`, `expected`, `varies`, `nextText`, …) keep their meaning.

**Bugs fixed while porting:**
- A deadline that passed a few hours ago used to show "0 days left / Open", because `Math.ceil` rounded up. It now shows Closed as soon as the deadline passes.
- Countdowns weren't live: they were only computed on page load. They now refresh every 30 s without re-rendering, so focus and typing aren't disturbed. The final 48 hours show hours and minutes, and a full re-render every 10 minutes rolls statuses over.
- The page had no `<!doctype>`, `lang` or viewport meta, which hurt mobile scaling. Added.
- The search field's label had a `hidden` attribute, so screen readers couldn't see it. Fixed.

## Phase 2: features

- **Add to calendar.** Every non-closed card has a button that downloads an `.ics` file:
  - The deadline is written in UTC, so any calendar shows it in the user's own time zone correctly.
  - The event runs from 30 minutes before the deadline to the deadline itself.
  - Two reminders: 14 days and 3 days before.
  - Estimated dates say "(estimated)" in the title.
  - If applications open in the future, a second all-day "Applications open" event is added.
- **Export shortlist to calendar** puts every non-closed shortlisted programme into one `.ics` file.
- **Application checklist** on each card (expandable):
  - Default items: transcripts, CV, statement of purpose / motivation letter, references, English test, passport. The English test item is dropped when the tags say "No IELTS needed", and uses the specific score when one is tagged.
  - Items derived from data: HEC portal (when `hec`), GRE, proof of work experience, nomination, host-professor letter, application fee, screening exam, both applications, loan guarantor.
  - Extra per-programme items from the `checklist` field (e.g. Chevening essays, Australia Awards Development Impact Plan).
  - Users can add and remove their own items. Progress shows as e.g. "4/7" with a bar, and everything is saved in localStorage.
- **Compare mode.** Tick Compare on 2–3 cards, then press Compare in the floating bar. A `<dialog>` table compares funding, amount, levels, deadline and countdown, opening date, fields, eligibility flags, requirements, your checklist progress, notes and the link. On phones it scrolls sideways with a sticky label column. Esc or the backdrop closes it, and focus returns to the bar.
- **Export / import.** "Export my data" downloads a JSON backup (`app`, `version`, `exportedAt`, `shortlist`, `checklists`). "Import data" **merges** it into what's there and never deletes: shortlists are combined, ticks added, custom items de-duplicated, unknown ids skipped. *Assumption:* merging is safer than replacing.
- **Shareable filter links.** Search, level, status, field, region, sort and the toggles are reflected in the URL hash (e.g. `#field=cs-ai&region=europe&full=1`). The address updates with `history.replaceState`, so it doesn't flood the back button. "Copy link to this view" copies it, and the page reacts to `hashchange`.
- **Storage safety.** Every localStorage access goes through `storage.ts` with try/catch. If storage is blocked, the page still works and shows a notice suggesting Export. Tested with a `localStorage` getter that throws.
- **Extras:**
  - A theme button (auto → light → dark). The old page had the `data-theme` CSS hooks but no control.
  - A new "Closing in 30 days" status option.
  - A "Clear filters" chip.
  - "Checked <date> against <domain>" on every card.

## Phase 3: database

### Added (29)

| id | Programme | Notes |
| --- | --- | --- |
| imprs-is | IMPRS for Intelligent Systems PhD | 15 Nov 2026 AoE |
| ellis-phd | ELLIS PhD Program | Closed 31 Oct 2026 AoE. Entered as partial (`full: false`) because funding comes from the advisor's institution |
| cs-maxplanck | CS@max planck | **Expected** 15 Dec: the official page says "Dec 15 of the previous year" but is undated |
| epfl-edic | EPFL EDIC CS PhD | 1 Dec 2026 (moved from 15 Dec this year) |
| ista-phd | ISTA PhD (Austria) | 8 Jan 2027, 15:00 CET |
| oist-phd | OIST PhD | 15 Nov 2026 JST |
| nus-soc-phd | NUS Computing PhD Research Scholarship | 15 Dec 2026; stipend amount unconfirmed |
| singa | SINGA (A*STAR) | **Expected** ~1 Dec: the official page was not reached; date from earlier cycles |
| kaist | KAIST Scholarship | **Expected**: Fall 2027 dates "TBA"; estimated from 2026 (regular track 3–17 Mar) |
| tsinghua | Tsinghua graduate scholarships (university CGS route) | Varies; mid-Dec first round |
| schwarzman | Schwarzman Scholars | Closed 9 Sep 2026 |
| mila | Mila supervision request | 15 Oct – 1 Dec 2026; funding amount not stated, so entered as partial |
| imperial-presidents | Imperial President's PhD Scholarships | Round 2: 11 Jan 2027 |
| ucl-res | UCL Research Excellence Scholarships | 8 Jan 2027 |
| edinburgh-informatics | Edinburgh Informatics PhD studentships | 30 Nov 2026 |
| leiden-lexs | Leiden Excellence Scholarship | 1 Dec 2026 per the official page; it may be an older page, so confirm |
| nl-scholarship | NL Scholarship (formerly Holland Scholarship) | Varies by programme |
| helsinki | University of Helsinki fee waiver | 5–19 Jan 2027 |
| aalto | Aalto Excellence Scholarship | 7 Dec 2026 – 5 Jan 2027 |
| polimi | Politecnico di Milano merit scholarships | Exact application deadline not found; English certificate due 4 Mar 2027 used as the date (varies) |
| padua | Padua International Excellence | Call One closes 15 Nov 2026 |
| kuleuven-science | Science@Leuven | **Expected** 15 Feb 2027 |
| google-phd | Google PhD Fellowship | Nomination-based; closed. Universities in Pakistan are not in an eligible region, so it only helps Pakistanis already doing a PhD abroad |
| daad-rise | DAAD RISE Germany | 30 Nov 2026. Only for undergraduates at US/Canada/UK/Ireland universities, which is flagged on the card |
| summer-epfl | Summer@EPFL | 29 Nov 2026, 23:39 AoE (as published) |
| eth-ssrf | ETH Student Summer Research Fellowship | 16 Dec 2026, 13:00 CET |
| mitacs-gri | Mitacs Globalink Research Internship | Pakistan is eligible for 2027, but the call is closed. The exact 2026 closing date wasn't shown, so the stored date is approximate (`expected`) |
| koc | Koç University graduate scholarships | **Expected**: Fall 2027 dates not posted; includes the HEC–Koç PhD partnership |
| bilkent | Bilkent graduate scholarships | **Expected** ~1 Jun 2027 |

### Removed (1)

- **Swedish Institute Scholarships for Global Professionals.** The official 2027/28 list of 34 eligible countries does not include Pakistan (Bangladesh is on it).

### Fixed in existing entries

- **MBZUAI:** the stipend for international students is now **AED 8,000/month (MSc) and 10,000 (PhD)** (was 15,500/17,500). Added the Master in Applied AI and Computational Biology deadlines.
- **Commonwealth (HEC):** the HEC portal closed **20 Oct 2026, 16:00 PKT**, earlier than the CSC's 16:00 BST. Added "HAT score ≥ 60".
- **Swiss Government Excellence:** the Pakistan window was 20 Aug – **31 Oct 2026**, so it's now **closed** (it was shown as open until 30 Nov).
- **Australia Awards:** the 2028-intake dates aren't published, so it's now `expected`. The old entry stated 1 Feb – 30 Apr 2027 as fact.
- **Fulbright:** removed the invented 20 Feb opening date. It's now "expected early 2027, closing ~1 Apr".
- **MEXT:** the note no longer suggests the university-recommendation route. The University of Tokyo says the general university-recommendation route is discontinued from AY2027.
- **Rhodes:** the residency rule is now stated precisely (studied in Pakistan for at least 4 of the last 10 years).
- **Clarendon:** marked `varies` (the date is course-specific).
- **ETH ESOP:** amount stated as CHF 13,500/semester from autumn 2027, the thesis pre-proposal requirement added, and `opens: 2026-11-01`.
- **KAUST, Gates, Eiffel, HKPFS, OIST internship, CERN, CGS, GKS, Aga Khan, Stipendium Hungaricum, Chevening, Knight-Hennessy:** deadlines confirmed. Notes and sources updated (e.g. HKPFS amount labelled "2026/27 rates", Gates "about 70 awards", KAUST "Round 2, tentative").
- Every entry got a `source` URL and `verifiedOn: 2026-11-04`.

### Candidates investigated and not added (with reason)

| Candidate | Reason |
| --- | --- |
| Invest Your Talent in Italy (MAECI) | Pakistan isn't on the 2026/27 eligible-country list |
| Italian Government (MAECI) scholarships | 2027/28 call not out; Pakistan eligibility couldn't be confirmed |
| Utrecht Excellence Scholarship | Discontinued from 2026/27 (Utrecht's NL Scholarship is covered by `nl-scholarship`) |
| Amsterdam Excellence Scholarship | Only old pages found; no 2027/28 information |
| Bocconi International Awards | No 2027/28 information found |
| Vector Scholarship in AI | International eligibility not confirmed; nominated by Ontario programmes |
| University of Toronto / UBC | No programme-level funding deadline found (only the Connaught top-up, which needs a department nomination) |
| Microsoft Research Fellowship | Last call closed Nov 2025; eligible regions exclude Pakistan; no 2027 call |
| Meta PhD Fellowship | Nothing current found on official Meta sites |
| Apple Scholars in AI/ML | Invited institutions only; no public deadline |
| KAUST VSRP | Rolling admissions with no deadline, which the current data model can't represent (see next steps) |
| NTU (Singapore) | Nanyang President's Graduate Scholarship is nomination-only; no computing deadline confirmed |
| Sabancı University | No Fall 2027 or engineering deadline published |
| YTB Başarı Bursu | No call for students already in Türkiye found |
| TÜBİTAK 2215 | Officially repealed |
| Manaaki New Zealand | Pakistan eligibility not confirmed; round closed |
| University of Tokyo / Kyoto MEXT university recommendation | General route discontinued from AY2027 (the embassy route stays as `mext`) |
| SJTU | Not reached in the time available |
| Manchester | Not reached in the time available |
| DTU, OeAD, Norway | Not reached in the time available. Norway and Denmark PhDs are salaried jobs with rolling deadlines, which don't fit the model |
| MBZUAI internships, Amgen Scholars, MLSS / OxML / EEML | Not added: Amgen is biology-focused; the summer schools charge fees and their dates weren't checked |

### Things I could not fully verify (please spot-check)

- **SINGA**: dates and amounts come from earlier cycles; the official page was not reached.
- **CS@max planck**: the 15 Dec date is from an undated official page.
- **Leiden LExS**: the page shows 1 Dec 2026, but the search metadata suggests the page may be older.
- **NUS Computing**: stipend amount unconfirmed.
- **Summer@EPFL**: the stipend (CHF 1,800/month) is from an older page.
- **Imperial**: the £27,036 stipend is from the central page, while a department page quotes a lower 2026-27 rate.
- **Mitacs GRI**: the stored closing date is approximate. It doesn't change the status (closed).
- **Koç and Bilkent**: dates estimated from the Fall 2026 cycle.
- **ELLIS and Mila**: funding exists but the amount isn't published centrally, so both are entered as `full: false`.

## Phase 4: quality, docs and CI

- **Accessibility:** axe-core (WCAG 2 A/AA plus best-practice) reports **0 violations** in light and dark mode at both 1200 px and 400 px, including with the compare dialog open. Fixes made:
  - The "Closed" badge colour was darkened slightly in light mode (`--closed` `#7b8580` → `#5c6661`) and lightened in dark mode (`#7f8a85` → `#949f9a`) to reach 4.5:1. This is the only palette change.
  - The unselected ☆ star now uses `--muted` instead of the near-invisible `--line` colour.
  - Select boxes use `aria-label`.
  - Added a skip link, landmarks (`main`, `aside` for the compare bar) and a scrollable-region label on the deadline strip.
  - Every icon button has a descriptive label (e.g. "Add to shortlist: ETH …").
  - Visible focus outlines on all interactive elements.
- **Keyboard:** tab order, Enter/Space on stars, checklists, compare and the dialog (Esc closes, focus returns) were checked with Playwright. After a re-render, focus stays on the same star or compare box.
- **Phones:**
  - No horizontal scroll at 400 px (checked with `scrollWidth`).
  - Selects sit two per row, and card actions move into a row under the content.
  - *Decision:* the filter bar is **no longer sticky on phones**. With five selects it covered half the screen. It stays sticky on larger screens.
- **README** rewritten: overview, how to run, data format with a JSON example and a field table, tests and validation, and GitHub Pages deployment.
- **CI:** `.github/workflows/ci.yml` runs `npm ci`, `validate-data`, `test` and `build` on every push and pull request. The Pages deploy job is included but **commented out**. On `main` it also uploads the `dist` artifact, which is harmless and ready for the deploy job.

## Other decisions and assumptions

- **Commits:** Phases 1 and 2 share one commit. `main.ts` was written once with all features, and splitting it would have produced a commit that doesn't build.
- **Branch:** the session started on a `claude/…` branch, but as instructed, all work is on `overnight-upgrade`. `main` was not touched.
- **Regions:** there's no "South-East Asia" in the requested list, so Singapore is in `east-asia`, which is labelled "East & Southeast Asia". Programmes not tied to one country (Aga Khan, Google) use the extra region `global`.
- **Field filter:** choosing a specific field (e.g. CS/AI) also shows programmes open to *any* field. Choosing "Open to any field" shows only those.
- **Status filter:** "Open now" includes closing-soon and varies; "Opens soon / expected" covers upcoming and expected. "Closing in 30 days" is new.
- **"Can apply while living outside Pakistan"** keeps its old meaning (`abroad`). Mitacs is `abroad: false` because the Pakistan quota is for students enrolled at Pakistani universities.
- **The deadline strip uses the device's local date.** An AoE deadline on 15 Nov shows as 16 in UTC+ time zones, which matches what the countdown means for that user.
- **Dependencies:** dev-only (vite, vitest, typescript, tsx, @types/node). The runtime has no dependencies apart from the Google Fonts stylesheet the original already used.

## Suggested next steps

1. Spot-check the "could not fully verify" list above in a normal browser, especially SINGA, Leiden and CS@max planck.
2. Turn on GitHub Pages (see README), then share a link such as `#field=cs-ai&abroad=1`.
3. Add a `rolling: true` deadline type for programmes without fixed deadlines (KAUST VSRP, Norwegian and Danish PhD jobs, MBZUAI internships).
4. Re-run the research in January 2027, when several "expected" calls publish (Stipendium Hungaricum, CGS, GKS, Australia Awards, Fulbright). Also add SJTU, Manchester, DTU and OeAD.
5. Optional: a "stale data" banner when `verifiedOn` is more than 60 days old, and a small script that lists entries whose deadline passed but have no `nextText`.
6. Consider self-hosting the fonts so the site has no third-party requests at all.
