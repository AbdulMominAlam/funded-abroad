# v4 "data": what changed

Branch: `v4-data`, started from `v3-global`. Work date: **4 Nov 2026**, used for every `verifiedOn`.

## Status: PARTIAL. The 550-programme target was not reached

| | v3 | **v4 now** | Target |
| --- | --- | --- | --- |
| Total programmes | 106 | **251** | 550+ |
| Internships / summer research | 6 | **54** | 120+ |
| Undergraduate | 36 | **72** | 130+ |
| Master's | 61 | **89** | 160+ |
| PhD | 48 | **97** | 140+ |

Some programmes count toward more than one level.

* **Regions:** Europe 82 · East & Southeast Asia 57 · North America 45 · Global 34 · UK 14 · Middle East 8 · Türkiye 7 · Oceania 4.
* **Funding:** fully funded 126 · partial 62 · paid internship 48 · salaried 15.
* **Dates:** 70 entries use estimated (`expected`) dates, 64 are `rolling`, and 61 use `check` eligibility.

**Why it stopped at 251:** the research ran as 16 parallel subagent batches, as requested. This environment allows **200 web searches per turn, shared by every agent**. That budget was gone after each batch had done roughly 4–18 searches. A test search afterwards confirmed it (*"this turn's web search budget is used up"*). No batch made up data to fill the gap, and each one stopped once its searches were refused. **The search budget resets in a new session or turn.** To continue, see "How to resume" below.

`npm run validate-data` ✔ (37 files, 251 programmes) · `npm test` ✔ **107 tests** · `npm run build` ✔ · axe: 0 violations (light and dark, 400/1200 px, with the new controls open).

## App changes for scale

* **Split data:** `src/data/programmes/<level>/<file>.json` (the first 106 entries are in `<level>/<region>.json`, the new ones in `<level>/bNN-<topic>.json`).
  * The site merges the files at build time with `import.meta.glob`; Node scripts use `scripts/lib/programmes.ts`.
  * `npm run validate-data` checks every file, or just the files you name (`npm run validate-data -- path.json`). It also checks for **duplicate ids and duplicate name+host across files**.
  * `npm run list-programmes` prints every programme, for avoiding duplicates.
* **Optional `funding` field:** `full | partial | salaried | paid-internship`. Without it, the type comes from `full`.
* **Pagination:** 30 cards at a time with **Show N more (M left)**. Keyboard focus moves to the first new card.
* **Speed:** search text is cached per programme, so search stays instant (under 100 ms in a headless test with 251 entries). The six-month strip renders when the browser is idle.
* **New filters (all in the URL hash):**
  * **Host country** multi-select, with search and counts (`host=Germany|Japan`).
  * **Funding type** (`funding=`). This replaces the old "Fully funded only" chip; old `full=1` links map to `funding=full`.
  * **Deadline within 30/60/90 days** (`within=`).
  * **Rolling / no fixed deadline** (`nofixed=1`).
* **Stats line:** "Showing X of Y matching · Z programmes you can apply for as a citizen of …".
* **Tests:** host, funding, within, rolling, hash round-trip and legacy links, pagination, applicable count, host list. The dataset tests now load all files.

## What each batch added (all 16 ran; all are partial)

| Batch | File | Added | Notes |
| --- | --- | --- | --- |
| 1 Internships Europe | internships/b01-europe-institutes.json | 4 | CERN openlab, Technical and Doctoral studentships; ESA YGT |
| 2 Internships Asia/Middle East | internships/b02-asia-mideast.json | 7 | UTRIP, Amgen Tokyo/Kyoto, KAUST VSRP, Weizmann Kupcinet-Getz, A*STAR SIPGA, KAIST KAI-X |
| 3 Internships N. America/Oceania | internships/b03-americas-oceania.json | 8 | Caltech SURF and LIGO SURF, CSHL URP, WHOI SSF, Vector, ANU FRT (India, Indonesia) |
| 4 Industry internships | internships/b04-industry.json | 12 | Google, DeepMind, MSR, MSRA (×2), Microsoft, Meta, Apple, NVIDIA, Amazon, Adobe, ByteDance Seed |
| 5 International organisations | internships/b05-intl-orgs.json | 18 | EU Blue Book, EP Schuman, Council, ECB, EIB (×2), UNDP, UNICEF, WHO, UNHCR, WFP, FAO, ILO, World Bank, IMF, OECD, WTO, IAEA |
| 6 UG government | undergraduate/b06-government.json | 6 | Brazil PEC-G, ICCR (×3), Islamic University of Madinah, Morocco AMCI |
| 7a US college aid | undergraduate/b07a-universities-americas.json | 18 | Williams, Swarthmore, Pomona, Wesleyan, Grinnell, Vassar, Colby, Middlebury, Davidson, Wellesley, Smith, Bryn Mawr, Stanford, Columbia, UChicago, Duke, Brown, Penn |
| 7b World UG awards | undergraduate/b07b-universities-world.json | 9 | Reach Oxford, Cambridge, LSE, UCL, Sciences Po, Constructor, Bocconi, NUS, NTU |
| 8 UG foundations | undergraduate/b08-foundations.json | 1 | Davis UWC Scholars |
| 9 Master's government | masters/b09-government.json | 7 | KNB Indonesia, VLIR-UOS, ARES, Fundación Carolina, JICA SDGs, CSC university programme, MAECI Italy |
| 10a Master's Europe/UK | masters/b10a-universities-europe-uk.json | 8 | TU Delft, UvA, Groningen, Maastricht, Uppsala, KTH, Chalmers, Stockholm |
| 10b Master's Asia etc. | masters/b10b-universities-asia-oceania-americas.json | 5 | SNU, UNIST, GIST, DGIST, POSTECH (graduate) |
| 11 Foundations + EMJMs | masters/b11-foundations-emjm.json | 3 | EMJM DEAI, Copernicus Digital Earth, IMLEX |
| 12 PhD Europe | phd/b12-europe.json | 18 | IMPRS schools, EMBL, INPhINIT, Göttingen, Oxford–MPG and more |
| 13 PhD Asia | phd/b13-asia-oceania-mideast.json | 10 | NUS, NTU, A*STAR ARAP, SUTD, SMU, HKU, CUHK, HKUST, PolyU, CityU |
| 14 PhD N. America + fellowships | phd/b14-north-america.json | 11 | Trudeau, Ontario Trillium, NVIDIA, Apple, MSR, Bloomberg, Two Sigma, Jane Street, Hertz, NSF GRFP, AAUW |

**Re-verifying the existing 106:** they were all re-checked on official sources earlier the same day (v2 and v3 passes, 4 Nov 2026). No searches were left for a third pass, and no changes were needed.

## Least-certain entries (spot-check first)

* **Deadlines not confirmed on an official page** (marked `expected`): 14 US colleges in batch 7a, where the dates came from earlier cycles, not an official 2027 page (Williams, Pomona, Wesleyan, Grinnell, Vassar, Middlebury, Wellesley, Smith, Stanford, Columbia, UChicago, Duke, Brown, Penn). Also:

  | Entry | Estimate |
  | --- | --- |
  | `colby-aid`, `davidson-aid` | 2027 date not confirmed |
  | `council-eu-traineeship` | closing date |
  | `ep-schuman` | deadline (standing rule) |
  | `kaist-kai-x` | deadline |
  | `esa-egt`, `cern-openlab-summer` | deadline |
  | `imprs-cms`, `imprs-genome-goettingen` | deadline |
  | `knb-indonesia` | from the 2025 cycle |
  | `msr-fellowship` | date came from a community Q&A, so marked `expected` |
  | `lse-uss`, `ucl-global-ug` | from 2026 |
  | `cityu-studentship` | deadline |
  | `stockholm-uni-scholarship` | deadline |
* **Amounts not confirmed** ("check official page"): MSRA programmes, A*STAR SIPGA, KTH, Göttingen, INPhINIT, all IMPRS entries, CERN Doctoral and openlab, ESA YGT, ARES, CSC university programme, Brazil PEC-G.
* **Conflicting official sources:**
  * `sutd-phd-fellowship`: 30 Sep vs 30 Oct
  * `ntu-research-scholarship`: S$2,000 vs S$2,200
  * `imprs-trust`: 15 Dec vs 31 Dec
  * `tudelft-van-effen`: about €60k vs €75k
  * `unist-grad`: funding rules
  * `ep-schuman`: €1,889 vs €1,647
* **Eligibility set to `check`** because the official list wasn't confirmed: IAEA, Council of the EU, EP Schuman, CSHL URP, Weizmann, ICCR Vajpayee (ICCR Maitri uses the African Union group as an approximation), SNU, AAUW (originally inferred from general knowledge, now `check`).
* **Representative pages:** `meta-research-scientist-intern` uses a single job posting as its url, because Meta has no programme page. `deepmind-student-researcher` partly overlaps `google-student-researcher`.
* **Coordinator fixes:** I softened a few facts that subagents had taken from general knowledge to "check official page", or marked them as estimates:
  * EMJM DEAI/IMLEX stipend wording;
  * Brazil PEC-G terms;
  * CSC university programme coverage;
  * ARES "full" flag;
  * AAUW eligibility;
  * MSR fellowship date.

## Dropped (with reason)

| Candidate | Reason |
| --- | --- |
| Jardine Oxford/Cambridge UG | No new awards from the 2027 intake |
| IsDB non-member communities scheme | Interest-free loan for study at home, not study abroad |
| Ashinaga Africa Initiative | No 2027 open cycle; selection now goes through partner schools |
| ESO studentship | Stipend and next deadline unconfirmed |
| Technion SURP | 2027 funding unconfirmed |
| POSTECH summer | Unclear eligibility, no deadline |
| Tohoku T-SRIP, RIKEN R-IH, Osaka FrontierLab | No deadline found; need home-university nomination |
| Nagoya NUSIP | Fee-paying course |
| UNIST summer | No funding |
| Caltech WAVE, Stanford SSRP-Amgen | US citizens/PR only |
| MIT MSRP | Only students at US universities |
| JAX summer | International eligibility not stated |
| Fields FUSRP | No deadline or stipend |
| UQ/Monash summer research | Only their own or Australian/NZ students |
| U of T SREP | Outbound programme |
| Google STEP | 2027 status unknown |
| IBM Extreme Blue | Status unknown |
| Bosch Industry Sabbatical | Not an internship |
| UN Secretariat internship | Unpaid; stipend proposal not confirmed |
| BDMA EMJM | Replaced by DEAI |
| LCT | No 2026 intake |
| SE4GD, JEMARO 2027, EMAI windows | Self-funded only |
| SpaceMaster | No scholarships confirmed |
| CYBERUS, MIR | Only old intakes found |
| MESD | No 2027 call |
| Twente UTS | ≥50% of tuition not confirmed |
| Erasmus Holland High Potential | No official page |
| Edinburgh, Glasgow, King's, Leiden/Utrecht UG | No ≥50% award confirmed |
| Orange Tulip | No current call |
| Schulich Leader | Canadians only |
| Qualcomm Innovation Fellowship NA | No deadline yet |
| IBM PhD Fellowship | Paused |
| Meta PhD Fellowship | No cycle since 2022 |
| JPMorgan AI PhD Fellowship | Not on official pages |
| IMPRS-QST/MCQST, IMPRS-PKS | No closing date found |

## How to resume (next session)

1. `git checkout v4-data && git log --oneline | head`, then read this section.
2. The brief for research agents is in `docs/research-brief.md`. `npm run -s list-programmes` lists what already exists.
3. Re-run the batches below, appending to the **same files**. Each needs roughly 1–2 official-domain searches per entry. With 200 searches per turn, run about 3–4 batches per turn rather than 16 at once.
4. After each batch: `npm run validate-data -- <file>`, then commit and push.

**Still to research, per batch:**

| Batch | Remaining candidates |
| --- | --- |
| 1 | DESY, European XFEL, GSI, JSC, ISTA ISTernship, MPI-INF/SWS, DAAD WISE, VBC, IRB Barcelona, ICFO, Biozentrum, Amgen Europe, Inria, EMBL |
| 2 | NUS/NTU summer, Hong Kong, mainland China, MBZUAI UGRIP, QCRI, India, Türkiye, Taiwan |
| 3 | CMU RISS, Janelia, CITA, Purdue SURF, UTSW SURF, St. Jude |
| 4 | Sony AI, Qualcomm, Intel Labs, Spotify, Samsung, Ericsson, Siemens, SAP, ASML, Philips, Booking, Huawei |
| 5 | ADB, AfDB, IsDB, IFAD, WIPO, ITU, UNESCO |
| 6 | Al-Azhar, KSU, KAU, Umm Al-Qura, Algeria, Tunisia, Cuba ELAM, Indonesia KNB (UG), Kazakhstan, Azerbaijan, Uzbekistan, Serbia, Poland Kalinowski, Mauritius-Africa, Manaaki Pacific, Allama Iqbal, Kuwait University, Chinese provincial schemes |
| 7a | Northwestern, Vanderbilt, Rice, WashU, Carleton, Hamilton, Haverford, Colgate, Bates, Macalester, Trinity, Berea, Soka; McGill, UBC IMES, U of T Scholars, Waterloo, York, Carleton U, Concordia |
| 7b | SMU, CUHK, HKUST, Japan, Korea, China, KFUPM, Khalifa, NYUAD, DKU, Australia/NZ, ALU, Ashesi, Italian DSU, Türkiye extras |
| 8 | Thai King's, Tata/Cornell, Zawadi, Higher Life, Inlaks, Said, Beit Trust, Mandela Rhodes, Khazanah, Hani Qaddumi, Jardine–HKU |
| 9 | Fulbright country commissions, NAWA, Estonia, Lithuania, AMCI master's, AMEXCID, AGCID, PEC-PG, ICCR PG, Manaaki other regions |
| 10a | DTU, Copenhagen, Aarhus, Finland, Switzerland, Italy, France, UK |
| 10b | GRIPS, Hitotsubashi, APU, Japanese universities, Yonsei, Korea University, Chinese universities, HK MPhil, NUS/NTU research master's, Taiwan, Khalifa, KFUPM, HBKU, QU, Adelaide, Melbourne, Auckland, Otago, Waterloo, Toronto, UBC, Concordia |
| 11 | Marshall, Mitchell, EIT Digital, IHE Delft, AIT, IsDB, AfDB-Japan, KAS, FES, RLS, HSS, KAAD, more EMJMs |
| 12 | UK CDTs, Oxford/Cambridge scholarships, national salaried-PhD portals, ETH/UZH/Basel, Vienna/VBC, Italy, Inria/CNRS/Pasteur/Polytechnique, FNR, Research Ireland, Helmholtz, Leibniz |
| 13 | Japan, Korea, China, Taiwan, Australia, NZ, Middle East |
| 14 | US and Canada explainer entries, university funding guarantees, Vanier successor, Ford, Open Philanthropy, Qualcomm |

## Decisions

* **File layout:** files are per level + topic (`bNN-<topic>.json`) rather than strictly level + region, so each research batch owns exactly one file and parallel agents never write the same file. The region is still a field on every entry.
* **Funding filter:** the "Fully funded only" chip became the "Funding type" select, which covers it.
* **Industry internships:** most use `rolling`, since postings open and close per role.
* **Reported counts** are entry counts per level; a programme funding two levels counts in both.

---

# v3 "global": what changed

Branch: `v3-global` (started from `overnight-upgrade`, which hadn't been merged yet). Work date: **4 Nov 2026**, used for every `verifiedOn`.

**Result:**
* **106 programmes**, up from 55: 51 added, none removed. 36 cover undergraduate, 61 master's, 48 PhD and 6 internships (some cover several levels).
* `npm run validate-data` ✔ · `npm test`: **101 tests** ✔ · `npm run build` ✔ · Deno type-check of the Edge Functions ✔ · the SQL migration was run on a local Postgres 16 and its permissions checked (details below).
* The visual design is unchanged. New UI (pickers, alerts panel, greyed-out cards) reuses the existing palette and fonts.
* axe-core reports 0 WCAG A/AA violations in light and dark mode at 400 px and 1200 px, with alerts both on and off, and on the Privacy page.

## What the owner must do manually

1. **Review and merge** `v3-global` (it contains `overnight-upgrade`, so merging it brings both).
2. **To turn on alerts, follow [SETUP.md](SETUP.md).** In short:
   * Create free Supabase, Resend and Cloudflare accounts.
   * Run the SQL migration and deploy the three Edge Functions with `--no-verify-jwt`.
   * Set the function secrets (`RESEND_API_KEY`, `SITE_URL`, `ADMIN_EMAIL`, `NOTIFY_ADMIN_ON_CONFIRM`, `EMAIL_FROM`, `HASH_SALT`).
   * Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Cloudflare.
   * Add the GitHub Actions secrets `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `SITE_URL`, `EMAIL_FROM`.
3. **Sending to real subscribers needs a verified domain in Resend.** The free test sender `onboarding@resend.dev` only delivers to your own Resend address.
4. The daily alert workflow only runs on the default branch, so it starts after the merge to `main`.
5. Spot-check the entries listed under "Not fully verified" below.

## Phase 1: nationality-aware data model

* **Nationality picker**:
  * Searchable (a text input with a list of all countries), covering 243 nationalities. `countries.json` is generated from ISO 3166-1 alpha-2 codes with English names (`scripts/gen-countries.ts`).
  * Kosovo (`XK`) is included. 7 uninhabited territories with no citizens (Antarctica, Bouvet, Heard & McDonald, South Georgia, French Southern Territories, US Minor Outlying Islands, British Indian Ocean Territory) are left out.
  * Remembered in localStorage (`fa-nat`) and in the URL hash (`nat=PK`).
* **Study-level picker**:
  * Options: Undergraduate, Master's (default), PhD & research (PhD + internships), and an extra **All levels** option so nothing is ever unreachable.
  * Stored as `lvl=` in the hash and `fa-lvl` in localStorage.
  * Old v2 links (`level=PhD`) still work.
  * The old level dropdown in the filter bar was removed; the new picker replaces it.
* **Data model** (`src/types.ts`):
  * `eligibility` is one of `all`, `list`, `exclude` or `group`, as specified, plus one extra type, **`check`**.
    *Decision:* many government schemes (Chevening, Stipendium Hungaricum, GKS, Swiss Excellence, Commonwealth, JDS, KOICA, ICDF…) have long official lists of 40–160 countries that change every year and that I couldn't reproduce exactly. `check` keeps these programmes visible for every nationality with an amber **"Check your country is eligible"** tag and the reason, rather than guessing a list.
  * `residencyRequired`, `nominationBody` and `countryNotes` replace the Pakistan-only `abroad`, `hec` and `nomination` fields.
* **Country groups** (`src/data/country-groups.json`), each with an official source URL and its member count checked in the tests:
  * Commonwealth (56), EU/EEA (30), ASEAN (11, including Timor-Leste), African Union (55), OIC (57).
  * Only the African Union group is used by a programme (Mastercard Foundation: "young people from Africa"). The others are there for future entries.
  * I didn't add a DAC-list group because I couldn't verify the exact current list. Programmes that use the DAC list are marked `check`.
* **Migration** (`scripts/migrate-v3.py`, kept for review):
  * All 55 entries were migrated and each eligibility re-checked. A test checks that none of them is "ineligible" for Pakistan, since all were verified as open to Pakistanis.
  * Pakistan-specific text moved to `countryNotes.PK` (16 programmes now have one, including new entries).
* **Programmes generalised** from their Pakistan-only versions (same ids, so existing shortlists keep working):

  | v2 entry | v3 entry |
  | --- | --- |
  | Fulbright (USEFP) | Fulbright Foreign Student Program |
  | Australia Awards Pakistan | Australia Awards Scholarships (exact 2027 country list from DFAT) |
  | Rhodes (Pakistan) | Rhodes Scholarship |
  | CGS (HEC Type A) | Chinese Government Scholarship (Bilateral), now also undergraduate |
  | Commonwealth via HEC | Commonwealth Master's & PhD |
  | Stipendium Hungaricum (via HEC) | Stipendium Hungaricum, now also undergraduate |
  | MEXT | MEXT via Japanese embassies |
  | Türkiye Bursları | now also undergraduate |
* **Exclusions:** host-country nationals are excluded where the official page says the scheme is for international students (e.g. Türkiye Bursları excludes TR, MEXT excludes JP, Gates excludes GB). Where it's "non-EU/EEA fee-payers" (Leiden, Helsinki, Aalto, NL Scholarship, Lund) the EEA (plus CH where stated) is excluded.
* **UI changes:**
  * Ineligible programmes are hidden by default. The count line says how many were hidden.
  * **Show programmes I'm not eligible for** shows them greyed out (dashed border, tinted background; no opacity, for contrast) and sorted last, with "Not eligible: Not open to citizens of X (…)".
  * Cards show "Who can apply" for restricted programmes, "Nomination: …" and "Must live in your home country" tags, and the selected nationality's country note. With no nationality chosen, all country notes are shown, labelled by country.
  * The compare table gained rows for eligibility for your nationality, residency, nomination and your country's notes.
  * The checklist adds "HEC portal application" only when the note for your nationality mentions HEC. It also adds nomination and proof-of-residence items when relevant.
  * The six-month strip follows your nationality and level.
  * The "Can apply while living outside Pakistan" chip is now "No need to live in my home country".
* **Validator:** checks eligibility shape, country codes, group names, `countryNotes` keys and `nominationBody`, and also validates `country-groups.json`.

## Phase 2: 51 new programmes

Research method (same constraint as v2): the environment's network policy **blocks direct page fetches**, so every fact was checked with web searches **restricted to the programme's official domain** (government, university or programme sites). A few deadlines came only from official embassy notices or other official mirrors; those are flagged below. When a 2027 date wasn't published, it was estimated from the last cycle and marked `expected: true`. Unknown amounts say "check official page".

**New `rolling` deadline type:** some programmes have no single date: rolling admission, or dates set by each university, country or office. These have `rolling: true` and no `deadline`. They show "No fixed date", sort after dated programmes, aren't in the strip or calendar exports, and are skipped by alert reminders. (This was "next step 3" in v2.)

### Undergraduate (33 new; 36 programmes cover undergraduate in total)

| id | Programme | Eligibility | Deadline |
| --- | --- | --- | --- |
| mext-ug | MEXT Undergraduate (embassy) | all except JP | 2027 round closed (embassies May–Jun 2026); varies |
| gks-ug | Global Korea Scholarship – Undergraduate | check | embassy track closed ~30 Sep 2026 (`expected`: date from embassy notices) |
| brunei-bdgs | Brunei Darussalam Government Scholarship | check (ASEAN/Commonwealth/OIC "not limited to") | expected 15 Dec 2026 – 15 Feb 2027 |
| pearson-uoft | Lester B. Pearson (U of Toronto) | all except CA; school nomination | 6 Nov 2026 |
| ubc-kmilot | Karen McKellin (UBC) | all except CA | expected ~1 Dec 2026 |
| yale-aid, harvard-aid, mit-aid, princeton-aid, amherst-aid, dartmouth-aid, bowdoin-aid | Need-blind, full-need aid for international students | all | Yale 2 Jan and Bowdoin 5 Jan confirmed; the others `expected` early Jan |
| nus-asean-ug, ntu-asean-ug | NUS / NTU ASEAN Undergraduate Scholarships | ASEAN except Singapore (list) | NUS 1 Feb – 19 Mar 2027; NTU same as its admission window |
| kaist-ug | KAIST undergraduate scholarship | all except KR | 10 Nov 2026 – 14 Jan 2027 |
| postech-ug | POSTECH international | all except KR | expected Mar–Apr 2027 |
| hku-entrance, hk-belt-road, hku-honping | HKU entrance / Belt and Road / Hon Ping | all / check / **Nigeria only** | 25 Nov 2026 / 31 Jan 2027 / rolling |
| qatar-univ | Qatar University International Students Scholarship | all except QA | expected 1–25 Mar 2027 |
| mbzuai-ug | MBZUAI undergraduate | all | 1 Feb 2027 |
| mastercard-scholars | Mastercard Foundation Scholars (UG + master's) | **African Union group** | varies by partner (e.g. Edinburgh 19 Nov 2026) |
| sabanci-ug, koc-ug, bilkent-ug, metu-ug | Turkish universities' international scholarships | all | expected / rolling (Koç) |
| romania-mfa, russia-quota, taiwan-icdf, taiwan-moe, taiwan-mofa, slovak-gov, saudi-gov | Government schemes (UG + master's + PhD) | exclude EU / exclude RU / check / check / check / check / exclude SA | see data |

### Master's (26 new)

| id | Programme | Eligibility |
| --- | --- | --- |
| commonwealth-shared | Commonwealth Shared Scholarships, 10 Nov – 8 Dec 2026 | **exact 43-country list** from the CSC page; residency required |
| jds | JDS (Japan) | check (target countries); civil servants; work experience |
| adb-jsp | ADB–Japan Scholarship | check; rolling (per university) |
| koica | KOICA | check; government nomination; rolling |
| czech-gov | Czech Government (developing countries) | 2026/27 list of 12 countries; the 2027/28 round probably closed ~30 Sep 2026 |
| ireland-goi-ies | Government of Ireland International Education Scholarship | exclude EEA, CH, GB, RU, BY |
| malaysia-mis | Malaysia International Scholarship | exclude MY; rolling (next round not announced) |
| thailand-tipp | Thailand TIPP | check; National Focal Point nomination |
| manaaki-asia | Manaaki New Zealand (Asia) | exact 9-country list |
| italy-iyt | Invest Your Talent in Italy | **exact 23-country list (Pakistan not included)** |
| daad-helmut-schmidt | DAAD Helmut-Schmidt (public policy) | check (DAC list) |
| jj-wbgsp | Joint Japan/World Bank | check; 18 Jan – 26 Feb 2027 |
| rotary-peace | Rotary Peace Fellowship | all; district endorsement |
| great-scholarships | GREAT Scholarships (UK) | exact 19-country list (2027 call); rolling per university |
| unige-excellence, kdi-school, paris-saclay-ims, lund-global | University awards | all / except KR / check / except EEA+CH |

Plus master's-level programmes already counted above: Mastercard Foundation, Romania, Russia, Taiwan ICDF/MOE/MOFA, Slovakia and Saudi.

### Investigated and not added (with reason)

| Candidate | Reason |
| --- | --- |
| University of Tokyo PEAK | Official site says the last intake has been recruited; no 2027 round |
| NAWA Ignacy Łukasiewicz (Poland) | No current call or deadline found |
| OPEC Fund scholarship | Official page says it's paused for restructuring |
| University of Westminster Full International Scholarship | Not found on the official site for 2027 |
| NYU Abu Dhabi | Need-based aid confirmed, but "meets full need" and the 2027 deadline weren't |
| MAECI Italian Government scholarships (general call) | 2027-28 call not published; eligible countries not confirmed (IYT, a MAECI programme, was added instead) |
| Netherlands Orange Knowledge successor | Not researched in the time available |
| UWC-related options | UWC national-committee scholarships are pre-university (IB), not undergraduate; not added |
| Aga Khan (undergraduate) | The AKF scheme is postgraduate; the existing entry covers it |

### Existing deadlines

All 55 existing entries were re-checked on official sources earlier the same day (4 Nov 2026; see the v2 section below). No date changed between the two passes.

### Not fully verified (please spot-check)

* **Deadlines from embassy notices** (`expected`): GKS-U (~30 Sep 2026); Brunei, Romania, Slovakia, Czechia, Taiwan MOE/MOFA, Qatar University, Lund, Geneva, POSTECH, Sabancı, Bilkent and METU 2027 windows are estimated from 2026.
* **US colleges:** Harvard, MIT, Princeton, Amherst and Dartmouth Regular Decision dates are marked `expected` because the exact 2027 date wasn't on the page found. Their need-blind/full-need policies *were* confirmed on the official pages.
* **KAIST UG** amounts are from a 2023 guide; **HKU entrance** amounts from the 2026 guide.
* **Russia quota:** the only 2027/28 information was a Russian House (Rossotrudnichestvo) page with inconsistent dates, so it's marked rolling. The card advises checking your government's travel and study advice.
* **"check" eligibility entries** list example countries only where the official page named them.

## Phase 3: email sign-up and deadline alerts

* **Database:** `supabase/migrations/20261104000000_deadline_alerts.sql` creates three tables: `subscribers`, `sent_notifications` (unique per subscriber + dedupe key) and `subscribe_attempts` (hashed IP and email for rate limiting). RLS is on, there are **no public policies**, and table and sequence privileges are **revoked from `anon` and `authenticated`**.
  * *Decision:* the spec says "anon key can only insert via a secure function". I made the Edge Function `subscribe` the only public write path: it validates input and writes with the service role. The anon key can't touch the tables at all, which is stricter.
  * *Verified* on a local Postgres 16 with Supabase-style default grants:
    * anon can't read, insert or run the cleanup function;
    * the email/level checks reject bad values;
    * duplicate dedupe keys are ignored;
    * deleting a subscriber cascades to their history.
  * An `alerts_cleanup()` function deletes unconfirmed sign-ups after 7 days and attempt records after 2 days. The daily job calls it.
* **Edge Functions** (`supabase/functions/`):
  * `subscribe`:
    * validation, plus a honeypot field;
    * rate limits: 5 attempts per hashed IP per hour, and 3 confirmation emails per address per day (the email limit is silent);
    * one generic reply, so it never reveals whether an address is already subscribed;
    * stores the subscriber unconfirmed and sends the double opt-in email.
  * `confirm`: 7-day single-use link. It notifies `ADMIN_EMAIL` on the first confirmation when `NOTIFY_ADMIN_ON_CONFIRM` isn't `false`. The notice says only "New subscriber: <country>, <level>", with no email address.
  * `unsubscribe`: GET from the email link, or POST from mail apps' one-click button (RFC 8058). It **deletes** the subscriber and their history.
  * *Decision:* if a confirmed address signs up again, the new settings are stored as `pending` and only applied after another email confirmation, so nobody can change someone else's alerts.
  * The logic lives in `_shared/handlers.ts`, written against small interfaces, so it's unit-tested in Node. The `index.ts` files are thin Deno wrappers, type-checked with Deno 2.9.
  * All three are deployed with `verify_jwt = false`. They're opened from email links, and Supabase's newer publishable keys aren't JWTs.
* **Email:** an `EmailSender` interface with a `ResendSender` (plain `fetch`) and a `MemorySender` for tests and dry runs. The templates come in HTML (inline styles, site palette, 600 px) and plain-text versions. They show:
  * the programme name and host;
  * the deadline **in the programme's own time zone** (e.g. "30 Nov 2026, 11:59 (UTC+01:00)"; AoE is labelled);
  * days left, whether the date is estimated, and the official link;
  * a one-click **Unsubscribe and delete my data** link, plus `List-Unsubscribe` headers.
* **Daily job:** `scripts/alerts/send-alerts.ts`, run by `.github/workflows/alerts.yml` at 06:17 UTC. Manual runs default to a dry run.
  * **Weekly digest:** on the subscriber's weekday (UTC, Monday by default), once per ISO week. It lists programmes they're eligible for (the same eligibility code as the site; "check" programmes are included) at their level, with deadlines in the next 30 days. Nothing is sent if the list is empty.
  * **Shortlist reminders:** one when 14 or fewer days remain (but more than 3), and one when 3 or fewer remain. Several due on the same day are grouped into one email. The dedupe keys include the deadline, so next year's round gets reminders again. Someone who signs up inside the last 3 days gets only the 3-day reminder.
  * **Dedupe:** each send is claimed in `sent_notifications` *before* sending (an insert that ignores duplicates, so two runs can't both send). If sending fails, the claim is released so the next day retries.
  * **Options:**
    * `--dry-run` reads real subscribers and sends nothing.
    * `--sample` uses a made-up subscriber and needs no accounts.
    * `--sample --to=you@x` really sends the sample emails to you.
    * `--now=` pretends it's another date.
  * If the secrets aren't set, the job prints "not configured" and exits successfully, so the cron stays green before setup.
* **Front end:**
  * A collapsible **Get deadline alerts** panel. Email, nationality, level, digest weekday and "Also remind me about my shortlist" are prefilled from the pickers and the current shortlist.
  * It includes a privacy note.
  * Without `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` the panel is disabled and says "Alerts coming soon"; it never throws an error.
  * After confirming or unsubscribing, the site shows a banner (`?alerts=confirmed|updated|unsubscribed|expired|invalid`).
* **Privacy page:** `privacy.html` explains what's stored, why, who processes it (Supabase, Resend), double opt-in, 7-day deletion of unconfirmed sign-ups, and how to unsubscribe or delete.
* **Secrets:** nothing is committed. `.env.example` lists every variable, and `.gitignore` covers `.env*` files.
* **Tests (27 new, in `tests/alerts.test.ts`, with an in-memory store in `tests/memory-store.ts`):**
  * planning: weekday, ISO week, eligibility/level filtering, 30-day window, 14/3-day reminders, late sign-ups, dedupe;
  * `runAlerts`: sends once, no duplicates on a second run, releases claims on failure, dry run sends nothing;
  * tokens and input validation;
  * the full subscribe → confirm → re-subscribe → unsubscribe flow with an in-memory store, including rate limits, expiry and the owner notice toggle;
  * templates: escaping, time zones, unsubscribe links;
  * Resend and Supabase REST clients with a mocked `fetch`.

  No real network calls.

## Phase 4: deploy-readiness and docs

* **Cloudflare Pages:**
  * Dashboard settings: build command `npm run build`, output `dist`, `NODE_VERSION=22`.
  * `wrangler.toml` (`pages_build_output_dir = "dist"`) for `npx wrangler pages deploy`.
  * `public/_headers` adds security headers and long cache for `/assets/*`.
* The build is still a plain static site with a relative base, so GitHub Pages keeps working. It now has two pages (`index.html`, `privacy.html`).
* **CI** (`ci.yml`): validate → test → build → alert-job smoke test (`npm run alerts:sample`), plus a separate job that type-checks the Edge Functions with Deno. The GitHub Pages deploy job stays commented out.
* **SETUP.md:** a plain-language, step-by-step guide covering:
  * creating the Supabase, Resend and Cloudflare accounts;
  * the SQL migration (pasted in the SQL editor, or via the CLI);
  * deploying the functions;
  * every secret by exact name, and where to paste it;
  * Resend's test sender vs. verifying a domain;
  * testing: sample → real test email → sign-up flow → dry run → real run;
  * troubleshooting, and free-tier limits.
* **README** rewritten for the global version: data format, eligibility types, alert architecture, deploy options.

## Other decisions and assumptions

* **Levels:** "PhD & research" = PhD + Internship. Partly funded programmes are kept, marked "Partial funding", e.g. tuition-waiver schemes like Sabancı and METU that the brief asked for.
* **Weekday:** the digest weekday is in **UTC**. The job runs at 06:17 UTC, which is the same day for most time zones from UTC−6 to UTC+14.
* **Shortlist reminders** go out even for programmes the subscriber isn't eligible for, since they chose them.
* **Shortlist sync:** the subscription stores the shortlist from sign-up time. To change it later, sign up again from the site; the change is applied after email confirmation.
* **Unsubscribe:** truly one click (GET), as requested. The trade-off is that a corporate link scanner could unsubscribe someone; re-subscribing takes a minute.
* **`Rolling` vs `varies`:** `varies` keeps a real representative deadline, while `rolling` has none.
* **Data scripts:** `scripts/migrate-v3.py` and `scripts/add-v3-programmes.py` are kept for review. They were run once, and re-running them on the current JSON will fail on purpose (duplicate ids).

## Suggested next steps

1. After the merge, follow SETUP.md, then sign up with your own address to test the full flow.
2. Re-check the `expected` dates in January–February 2027, when many 2027 calls are published (GKS-G, MEXT 2028, Stipendium Hungaricum, Australia Awards, Fulbright, Türkiye Bursları).
3. Replace some `check` entries with exact lists when the official lists are easy to copy (e.g. the Commonwealth Master's list, likely identical to the Shared Scholarships list).
4. Add a "manage my alerts" link (a signed token) so subscribers can change settings without signing up again.
5. Consider a DAC-list country group once the official OECD list can be imported reliably.

---

# v2 "overnight upgrade": what changed (earlier)

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
