# v5 "data": what changed

Branch: `v5-data`, started from `main` (after v4 and the README update). Work dates: **21–22 Nov 2026**. Each new or re-checked entry's `verifiedOn` is the day it was checked (`2026-11-21` for batches 1–4 and the deadline pass, `2026-11-22` for batches 5–9).

## Status: ✅ all targets met (741 programmes)

| | v4 | **v5** | Change | Target |
| --- | --- | --- | --- | --- |
| Total programmes | 561 | **741** | +180 | 720+ ✅ |
| Undergraduate | 135 | **181** | +46 | +40 ✅ |
| Master's | 211 | **285** | +74 | +55 ✅ |
| PhD | 203 | **291** | +88 | +45 ✅ |
| Internships / summer research | 125 | **145** | +20 | +20 ✅ |

Some programmes count toward more than one level.

* **Regions:** Europe 280 · East & Southeast Asia 160 · North America 118 · Global 78 · UK 37 · Middle East 34 · Oceania 27 · Türkiye 7.
* **Funding:** fully funded 378 · partial 187 · paid internship 137 · salaried 39.
* **Dates:** 171 entries use estimated (`expected`) dates, 227 are `rolling`, 52 `varies`, and 238 use `check` eligibility.

Final checks: `npm run validate-data` ✔ (68 files, 741 programmes) · `npm test` ✔ 113 tests · `npm run build` ✔.

### Host countries, before → after

Counted with the new canonical names (`npm run count-hosts`). A programme in several countries counts once for each, so the column doesn't add up to the total. The host-country filter now has **80 countries and territories** (was 64) plus "Multiple / any country".

| Host | v4 → v5 | | Host | v4 → v5 |
| --- | --- | --- | --- | --- |
| United States | 85 → 100 | | Thailand | 5 → 15 |
| Multiple / any country | 52 → 53 | | Austria | 13 → 14 |
| Germany | 39 → 45 | | Belgium | 12 → 12 |
| United Kingdom | 36 → 39 | | Poland | 3 → 11 |
| Italy | 19 → 35 | | Spain | 5 → 11 |
| Japan | 22 → 32 | | Saudi Arabia | 8 → 10 |
| Switzerland | 24 → 28 | | United Arab Emirates | 8 → 9 |
| China | 25 → 25 | | Czechia | 1 → 7 |
| South Korea | 21 → 24 | | Denmark | 4 → 7 |
| **Ireland** | **1 → 20** | | Malaysia | 1 → 7 |
| Netherlands | 20 → 20 | | Norway | 2 → 6 |
| Australia | 17 → 19 | | Finland | 5 → 6 |
| Canada | 16 → 18 | | Lithuania, Qatar, Slovakia, Indonesia, Chile | 1–2 → 4 |
| Hong Kong | 14 → 18 | | Estonia, Hungary, Brunei, Kenya | 1 → 3 |
| Singapore | 18 → 18 | | Portugal, Iceland, Colombia, Vietnam | 0 → 2 |
| **Sweden** | **8 → 18** | | New: Cyprus, Malta, Latvia, Slovenia, Oman, Peru, Macao, Ethiopia, Malawi, Tanzania, Uganda, Burkina Faso | 0 → 1 |
| France | 14 → 16 | | Greece | 0 → 0 (no qualifying current call) |
| Taiwan | 10 → 15 | | | |

## App changes

* **Canonical host-country names** (`src/hosts.ts`). `country` must be a name from `countries.json` (except "Hong Kong" and "Macao"), several joined with " / ", optionally with one "(qualifier)", or "Any (…)". `npm run validate-data` now flags non-canonical text and suggests the canonical name ("UK" → "United Kingdom", "UAE" → "United Arab Emirates").
* **Data fixes:** `mbzuai`, `mbzuai-ug` (UAE), `embl-eipp` (UK), `afdb-internship` (straight apostrophe in Côte d’Ivoire), `wbg-pioneers` (qualifier), `erasmus`, `ellis-phd` ("Europe (multi-country)" → "Any (European countries)").
* **Host-country filter:** lists each country once. Multi-country programmes appear under each host, and "Any (…)" programmes are grouped as "Multiple / any country". Old `host=` links are mapped to canonical names (`host=UAE` → United Arab Emirates).
* **`npm run count-hosts`:** prints counts by level and by host country (`-- --json` for JSON).
* **Tests:** +6 (canonical names, aliases, parsing, legacy links, filter and counts, validator messages). The validator tests now use a real country instead of "Testland".

## Deadlines that passed since 4 Nov 2026 (re-verified 21 Nov)

| Entry | Action |
| --- | --- |
| `jds` | Rolled to the next country round: Mongolia 25 Nov 2026, 14:00; Laos 27 Dec 2026 |
| `ntu-research-scholarship` | Rolled to 31 Dec 2026 (schools with later dates) |
| `mastercard-scholars` | Rolled to Berkeley MDP priority deadline 1 Dec 2026 |
| `nagoya-g30-ug-scholarship` | Rolled to 2nd round 21 Jan 2027 (`varies`, some programmes) |
| `ntu-tw-outstanding-intl-grad` | Rolled to 2nd round 19 Jan 2027, 16:00 (admission guidelines; the admissions site says 28 Jan) |
| `cactus-tuebingen`, `grips-mext`, `imprs-is`, `oist-phd` | Closed; next round estimated in `nextText` |
| `padua` | Closed; Call Two (1 Dec–1 Mar) only exceptionally gets scholarships, so this is in `nextText` |
| `imprs-ufast`, `pasteur-ppu`, `trudeau-phd`, `jane-street-grf`, `ubc-wehrung`, `pearson-uoft` | Already closed with next-round info; no change |

## What each batch added

Each batch ran as a subagent with about 40 web searches, writing to its own `v5-bN-*.json` files. I merged, reviewed and validated each batch, then committed and pushed it. Batches 5–7 were interrupted by a usage limit and resumed with their earlier searches intact; none had written files before the interruption.

| Batch | Added | Entries |
| --- | --- | --- |
| 1 Ireland | +19 | UCD Global Excellence (UG, PG); Ireland Fellows Programme (Africa, Asia, SIDS, Latin America); Teagasc Walsh; Trinity Research Doctorate Awards; UCD Ad Astra; Galway Hardiman; Maynooth Hume; RCSI StAR; PhD vacancy schemes at Insight, ADAPT, Lero, CONNECT, AMBER, Tyndall; Tyndall Summer Fellowship |
| 2 Nordics & Baltics | +25 | Linköping, Gothenburg Axel Adler (×2), Umeå (×2), KI Global, Örebro, SSE waivers, American Friends of SSE; AAU, SDU, ITU; NTNU, UiO, UiB, UiT salaried PhDs; Tartu, TalTech; Latvia state scholarships; Vilnius master's waiver, VU and KTU state-funded PhDs; Icelandic Government Scholarship, University of Iceland Doctoral Grants Fund; Aalto AScI summer research |
| (coordinator) | +1 | Swedish Institute Scholarship for Global Professionals (missing from the dataset; spotted by batch 2) |
| 3 Southern Europe | +26 | Italy (16): SNS and Sant'Anna ordinary courses, EDISU Piemonte, DSU Toscana, Padua regional grant, Bologna International Talents, Ca' Foscari Honours, Siena, PoliTo (math eng., PhD), Sant'Anna, Bocconi, EUI, PoliMi, Sapienza, Turin PhDs. Spain (6): UC3M, Navarra, CRG, IRB Barcelona, ICFO, FPI. Portugal: Champalimaud, GIMM. Malta ISSI; Cyprus Institute |
| 4 Central & Eastern Europe | +18 | Hungarian Diaspora; NAWA Polonista; Visegrad Scholarship; Slovakia NSP (students, PhD); Lane Kirkland; Slovenia Western Balkans; CEU PhD; Charles, Masaryk, CTU, CTU PICTUS, IOCB; Warsaw, Jagiellonian, Warsaw Tech, AGH doctoral schools; Warsaw-4-PhD |
| 5 Asia | +30 | Thailand: KMUTT (×5), SIIT (×2), VISTEC, Chiang Mai. Malaysia: UM GRA, Monash Malaysia (×2), Taylor's, Sunway. VinUni, Fulbright University Vietnam; Darmasiswa, TIAS; SEARCA; Science Tokyo IGPA; NII; JSPS Summer; UST Korea; Ewha EGPP; Nazarbayev; UBD, UTB; University of Macau; NTUST, NCU |
| 6 Middle East, Africa & Latin America | +15 | CMU Qatar; Pacific Alliance mobility; E-JUST TICAD9; DAAD In-Region (sub-Saharan Africa); AGCID Nelson Mandela; ICETEX; GCUB-MOB Brazil; Sultan Qaboos; OAS Academic; HBKU, Khalifa, KFUPM, King Saud PhD; OAS–ANID Chile; icipe |
| 7 Big-country gap check | +17 | Notre Dame, Cornell, Johns Hopkins, Caltech, Tufts aid; W&L Johnson; Deakin, Griffith VC; DAAD Study Scholarships; ENS International Selection; Oxford Ertegun; Felix; Princeton SPIA MPA; Humphrey; Naumann (FNF); Max Planck Schools; Manchester PDS |
| 8 Paid internships top-up | +16 | Preferred Networks, NIMS, RIKEN (R-CCS, RIH, IMS), KEK; EPFL (E3, ERIP, SV), UNIL SUR; MPIIB, MPI-PKS, MPL; Ai2, MERL; Cohere |
| 9 Undergraduate top-up | +13 | PolyU, CityUHK, HKBU, Lingnan; NTHU, NTU Taiwan; uOttawa; Polytechnique Bachelor (olympiad); Claremont McKenna, Lafayette, Barnard, Harvey Mudd, Mount Holyoke |

Batches 8 and 9 were added because, after batches 1–7, internships (+4) and undergraduate (+31) were behind their targets.

**Coordinator fixes:**
* Removed `ceepus-mobility`: exchange only, not a funded degree (consistent with earlier exchange drops).
* Removed `visegrad-fellowship`: a short research visit, under the "tiny one-off grants" rule.
* Removed `fields-usrp`: covers expenses but pays no stipend (also dropped in session 2).
* Removed `nyuad-need-based-aid`: no official page says NYUAD meets full need (also dropped in session 3).
* Removed `utokyo-peak-scholarship`: the official September 2026 guidelines say PEAK admissions end with that intake.
* `champalimaud-indp`: marked `expected`. The official page says "16 Nov–30 Dec 2027", apparently a typo for 2026.
* `harvey-mudd-aid`: the amount now says full need is met for only about 3–4 international students a year (need-aware).
* `cityu-intl-entrance-ug`: eligibility changed to `check`. The batch had added a mainland-China exclusion that the source doesn't state.
* `kmutt-ppjk-masters` and `kmutt-ppjk-phd` kept as two entries: separate announcements with different GPA bars and benefits.
* EPFL E3, EPFL SV, UNIL SUR, MPL IMPRS internships: their 2027 rounds closed in Nov 2026, so each now has `nextText`.

## Least-certain entries (spot-check first)

| Entry | Issue |
| --- | --- |
| `ntu-tw-outstanding-intl-grad` | 2nd-round deadline: guidelines say 19 Jan, the admissions site says 28 Jan (used 19 Jan) |
| `champalimaud-indp` | deadline inferred from an apparent typo on the official page |
| `nims-internship` | deadline estimated from "opens Dec 2026 for about a month" |
| `lero-phd`, `connect-centre-phd`, `amber-centre-phd`, `adapt-centre-phd` | no stipend amount; no posts open when checked |
| `ireland-fellows-latin-america`, `ireland-fellows-sids` | country lists from search excerpts (embassy page returned 403) / partly confirmed |
| `teagasc-walsh-scholars` | deadline estimated; non-EU eligibility not stated |
| `tyndall-summer-fellowship`, `mpi-pks-biophys-internship` | paid, but no amount published |
| `vu-state-funded-phd`, `ktu-state-funded-phd` | not confirmed whether non-EU applicants get state-funded places |
| `vu-masters-tuition-waiver` | official page 404; source is a VU news article |
| `itu-state-scholarship` | 2027 MSc deadline not found (rolling) |
| `unibo-international-talents` | no call after 2025/26; amount and date from that cycle |
| `irb-barcelona-phd`, `spain-fpi-predoctoral` | salary and nationality rules not verified |
| `cyi-deans-distinguished` | indicative deadlines; no stipend amount |
| `lane-kirkland-scholarship` | two official amounts (PLN 22,500 vs 25,200); date estimated |
| `ctu-phd`, `wut-doctoral-school`, `agh-doctoral-school` | stipend rates for 2026/27 not confirmed |
| `fulbright-uv-scholarships` | 10–100% tiers; need-based aid may be for Vietnamese nationals only |
| `vinuni-merit-scholarships`, `sunway-pg-research-scholarship`, `vistec-scholarship`, `ust-korea-stipend` | international eligibility not confirmed (`check`) |
| `nu-abay-kunanbayev` | date estimated; stipend figures conflict |
| `darmasiswa`, `humphrey-fellowship`, `ens-international-selection` | non-degree or non-standard programmes filed under the nearest level |
| `oas-academic-scholarship` | capped at US$10k/year, may be under 50% of tuition; date estimated |
| `agcid-nelson-mandela`, `daad-in-region-ssa` | tuition cover or amount not confirmed |
| `icetex-beca-colombia-extranjeros` | two official deadlines (5 vs 19 Jun 2026) |
| `ksu-phd-initiative`, `icipe-phd-scholarships` | no current application phase published |
| `fnf-international-scholarship` | amounts and windows differ between Naumann pages; date estimated |
| `daad-study-masters-all` | deadline differs by country; stipend rate not confirmed |
| `caltech-aid`, `tufts-aid` | "need-aware" from secondary pages |
| `uottawa-dtfe-ug`, `polytechnique-bachelor-olympiad`, `polyu-nonlocal-entry-ug` | values from older or partly loaded pages |
| `cohere-internships`, `ai2-research-internship` | pay "competitive", not published; Cohere offers no visa sponsorship |
| `pfn-summer-internship` | needs residency and work rights in Japan; date estimated |

## Dropped (with reason)

| Candidate | Reason |
| --- | --- |
| Research Ireland GOI Postgraduate | Folded into the institution-only Empower call; no individual 2027 call |
| Research Ireland Enterprise Partnership / Employment-Based | No call since 2025 |
| Research Ireland Centres for Research Training | "Likely to relaunch end 2026" only |
| George Mitchell Scholarship | Paused; no Class of 2027 |
| TCD, UCC, UL, DCU, TU Dublin merit awards | €2k–€5k or 20%, below the bar |
| EDUFI Fellowship, Finland Scholarship | Ended (2025, 2024) |
| Turku, Oulu, LUT, UEF, Åbo, Jyväskylä | No first-year award of 50% or more |
| Danish Cultural Agreements scholarships | Latest official information from 2020 |
| Copenhagen Bioscience PhD, DDSA, WASP | No current open call for new applicants |
| Greece: IKY for foreigners, Onassis, HFRI | No current call |
| FCT PhD studentships, GABBA (Portugal) | Require permanent residence in Portugal |
| Cyprus government scholarships | Cypriot citizens or specific nationalities only |
| Unimi European Futures, Sapienza "Wanted the best" | EU-only / for graduates of other Italian universities |
| NAWA Łukasiewicz, Hungary Christian Young People | Closed / no new students |
| AUA (Armenia) | Up to 50% only; no deadline |
| Queen Jadwiga Fund | One-off PLN 2,100 |
| UTM International Doctoral Fellowship | RM2,000 tuition waiver only |
| Study in India (SII), ASEAN-India IIT PhD | Contradictory or outdated official pages |
| Hokkaido President's Fellowship, Waseda, Fudan, Osaka Σ | Suspended or small awards |
| Hanyang, Kyung Hee, Tsinghua UG | First semester or first year only |
| QCRI, Qatar University GA, TAMUQ | Unpaid / no tuition cover / loans |
| SECIHTI (Mexico) | Mexican nationals only |
| TWAS-CNPq, NRF-TWAS, OWSD | No current call |
| UM6P, Stellenbosch, UGHE, Doha Institute | Funding terms unclear |
| Utrecht Excellence, Amsterdam Excellence | Discontinued |
| Melbourne International UG | Now 20% |
| Glasgow LKAS, Obama Scholars, Wellcome PhD | Paused / no 2027 cycle / closed |
| Emory, Harvey Mudd (batch 7) | No full-need promise for internationals (Harvey Mudd was later re-added by batch 9 with the "handful a year" wording) |
| IBM Great Minds, Naver Labs Europe, Bosch CAI, Disney Research | Paused or no pay stated |
| HKUST, CUHK, UNIST summer research | Allowance not guaranteed / Korean students only |
| CEU undergraduate, Westminster Full International | Capped at 50% / €4,000; page out of date |

---

# v4 "data": what changed

Branch: `v4-data`, started from `v3-global`. Work date: **4 Nov 2026**, used for every `verifiedOn`.

## Status: ✅ all targets met (561 programmes after session 6)

| | v3 | **v4 now** | Target |
| --- | --- | --- | --- |
| Total programmes | 106 | **561** ✅ | 550+ |
| Internships / summer research | 6 | **125** ✅ | 120+ |
| Undergraduate | 36 | **135** ✅ | 130+ |
| Master's | 61 | **211** ✅ | 160+ |
| PhD | 48 | **203** ✅ | 140+ |

Some programmes count toward more than one level.

* **Regions:** Europe 179 · East & Southeast Asia 119 · North America 101 · Global 69 · UK 34 · Middle East 27 · Oceania 25 · Türkiye 7.
* **Funding:** fully funded 277 · partial 141 · paid internship 117 · salaried 26.
* **Dates:** 132 entries use estimated (`expected`) dates, 168 are `rolling`, 42 `varies`, and 173 use `check` eligibility (the official country list wasn't reproduced).

Final checks: `npm run validate-data` ✔ (41 files, 561 programmes) · `npm test` ✔ 107 tests · `npm run build` ✔.

**History:** session 1 stopped at 251 because of the shared search budget (below). Sessions 2–6 each ran at most 4 batches of about 40 searches.

**Why session 1 stopped at 251:** the research ran as 16 parallel subagent batches, as requested. This environment allows **200 web searches per turn, shared by every agent**. That budget was gone after each batch had done roughly 4–18 searches. A test search afterwards confirmed it (*"this turn's web search budget is used up"*). No batch made up data to fill the gap, and each one stopped once its searches were refused. **The search budget resets in a new session or turn.** To continue, see "How to resume" below.

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

## Session 2 (resumed): internships

Four batches ran in parallel this time, each capped at about 40 searches. They used about 132 of the 200-search budget, and none ran out.

| Batch | Added | Highlights |
| --- | --- | --- |
| 1 Europe | +18 (file now 22) | DESY, GSI/FAIR, Jülich, HZDR, PSI, Amgen Scholars Europe hosts (only students enrolled at a European university), Max Planck CS internship, MPI-CBG, VBC, ICFO, ISTA year-round internships |
| 2 Asia/Middle East | +10 (file now 17) | MBZUAI MGRIP, Westlake (summer research, WIRE), Academia Sinica TIIP, NUS (IRIS, SoC SRI, MBI MUST), NTU Global Connect, HKU summer research, HUJI Einstein REU |
| 3 N. America/Oceania | +3 (file now 11) | Purdue SURF, Perimeter PSI Start, CMU RISS |
| 4 Industry | +12 (file now 24) | Sony AI, Qualcomm, Intel Labs, Spotify, Samsung Research America, Ericsson, SAP iXp, ASML, Booking.com, Toyota Research Institute, Honda RI, NEC Labs |
| 5 International organisations | +15 (file now 33) | ADB, AfDB, IFAD, WIPO, UNFPA, IOM, UNIDO, OPCW, Council of Europe, CJEU, ECA, NATO, IDB, BIS, EFTA |

**Total now 309:** internships 112, undergraduate 72, master's 89, PhD 97.

**Coordinator removals:**
* IBM Extreme Blue: no current cohort confirmed.
* HKUST IVISP: allowance "may be provided", so not guaranteed paid.

**Least certain (session 2):**

| Entry | Issue |
| --- | --- |
| `vbc-summer-school` | 11 Jan date from a page with no year |
| `mpi-cbg-internship` | the 2027 call has closed; the next one is estimated from 2025 |
| `hzdr-summer-student` | official pages say 24 Jan or 22 Feb; used 24 Jan |
| `psi-summer-student`, `cactus-tuebingen` | stipend not stated |
| `qualcomm-research-intern` | the source is a past event page |
| `samsung-research-america-intern` | page looks dated |
| `spotify-summer-intern` | 2027 not posted; not research-only |
| `ericsson-summer-intern-sweden` | may need enrolment in Sweden |
| `hku-summer-research` | estimated date |
| `huji-einstein-reu` | small stipend, estimated date |
| `nus-iris` | rolling |
| `westlake-wire` | degree level unknown |
| `cmu-riss` | international students only via partner pathways |
| `efta-traineeship` | amount from an old page; rolling |
| `bis-graduate-programme` | a graduate contract rather than an internship |
| `cjeu-traineeship` | nationality rule unverified |
| `iom-internship` | some posts unpaid (the note says so) |

**Dropped in session 2:**

| Candidate | Reason |
| --- | --- |
| European XFEL | No summer programme |
| ISTernship | Paused |
| DAAD WISE | Inactive |
| IRB Barcelona | €250/month |
| EMBL, Inria | Pay not set |
| DKFZ | No paid undergraduate scheme |
| Erasmus+ (non-European) | No grant for students enrolled outside Europe |
| ICFO Summer Fellows | Spanish priority |
| HKUST UROP, CUHK SURP, SUSTech, SJTU, Tohoku T-SRIP, Koç KUSRP, Technion summer | Fee-charging or unpaid |
| ZJU GRIPS, NTHU | Funding not guaranteed |
| QCRI | Online only, no stipend |
| KAUST Gifted Student Program | Saudi nationals only |
| IISc, TÜBİTAK, SNU, UNIST | No paid scheme for foreign students |
| Osaka FrontierLab | Exchange only |
| Google STEP | No page |
| Siemens, Philips, Bosch, Huawei, Tencent, Baidu, Alibaba | No programme page |
| Sony CSL | Not taking interns |
| Jane Street, Citadel | Finance; visa rules vary by office |
| Janelia Undergraduate Scholars | No sessions since 2022 |
| UTSW SURF, St. Jude, Harvard and Princeton programmes | US-only or US-enrolled only |
| CITA | No current information |
| UNSW, Sydney, Melbourne, Monash, UQ, UBC, McGill summer research | Own or local students only |
| IsDB | Payment not confirmed |
| ITU, UNESCO, UNEP, OSCE | Unpaid |

**Next session:** internships are near target (112/120). Prioritise **undergraduate** next (batches 6, 7a, 7b, 8), then master's (9, 10a, 10b, 11), at most 4 batches and about 40 searches each.

## Session 3 (resumed): undergraduate

Four batches ran in parallel, each capped at about 40 searches. They used about 123 searches in total. After every batch, `npm run validate-data` and `npm test` (107 tests) passed before the commit and push.

| Batch | Added | Highlights |
| --- | --- | --- |
| 6 UG government | +19 (file now 25) | Al-Azhar, King Saud University, King Abdulaziz University, Algeria, Cuba ELAM, Study in Kazakhstan, Azerbaijan Heydar Aliyev, World in Serbia, Kalinowski (Poland), Mauritius-Africa, Manaaki Pacific, HEC Allama Iqbal (×2), Kuwait University, Beijing / Shanghai / Jiangsu government scholarships, Bulgaria Decree 103, Croatia |
| 7a US/Canada UG aid | +14 (file now 32) | Northwestern, Vanderbilt, Rice, WashU, Carleton College, Hamilton, Haverford, Colgate, Bates, Macalester, Trinity (Hartford), Berea, UBC Wehrung, York PISE |
| 7b UG outside N. America | +20 (file now 29) | SMU, CUHK, HKUST, Ritsumeikan APU, Yonsei UIC, KFUPM, Khalifa, Korea University, UNIST, SNU, Duke Kunshan, Monash, UNSW, Sydney, ANU, ER.GO and DiSCo Lazio regional grants, SJTU, Ashesi, ALU |
| 8 Foundations | +11 (file now 12) | Tata at Cornell, Thai King's Scholarship, Zawadi Africa, Jardine (postgraduate), Rise, Khazanah, Inlaks, Said Foundation, Beit Trust, Mandela Rhodes, Swire at St Antony's |

**Total now 373:** undergraduate **130 (target met)**, internships 112, master's 112, PhD 110. Master's and PhD went up because several foundation schemes fund those levels.

**Coordinator fixes:**
* `berea-intl`: the official page gives no year, so the date is marked `expected`.
* `jardine-oxbridge`: kept as master's/PhD only and marked rolling. Two research passes disagreed about whether undergraduate awards continue after 2026.
* `ksu-external`: set to partial, because only a stipend was confirmed.
* `jiangsu-jasmine`: the amount was softened, because the only source is a provincial study site of unclear official status.

**Least certain (session 3):**

| Entry | Issue |
| --- | --- |
| `colgate-aid`, `trinity-hartford-aid` | two official dates (15 vs 22 Jan, 15 vs 17 Jan); used 15 Jan, `expected` |
| `vanderbilt-aid` | application date estimated (aid date official) |
| `ubc-wehrung` | "full tuition and living" wording from a 2024–25 Board report |
| `kfupm-intl-ug` | international page says full scholarship; an older page says non-Saudis pay tuition |
| `smu-lkcsp` | international eligibility only implied (`check`) |
| `cuhk-admission-ug` | HK$5,000 to full tuition, so many awards are under 50% |
| `anu-chancellors-intl-ug` | 50% tier from 2023–25 pages |
| `alu-mandela` | mainly tuition; Africans only |
| `al-azhar-intl` | old pages; benefits unknown |
| `kuwait-univ-cultural` | amount and window unknown |
| `azerbaijan-heydar-aliyev` | levels unclear |
| `rise-global` | date estimated from the 2023–24 cycle |
| `thai-kings-scholarship` | date estimated from Oct 2024; probably closed |
| `khazanah-global` | official pages disagree on direct undergraduate entry |
| `zawadi-africa` | amount not stated; date estimated |

**Dropped (session 3):**

| Candidate | Reason |
| --- | --- |
| Umm Al-Qura | No current scheme for international students |
| Tunisia, Uzbekistan | No government scheme for incoming foreign students |
| HKSAR Government Scholarship | HK$80k is under 50% of non-local tuition |
| KNB undergraduate | Duplicate of `knb-indonesia` |
| Soka | Full-need policy for international students not confirmed |
| McGill, UBC IMES, U of T Scholars, Waterloo, Carleton U | Awards under 50% of tuition |
| Concordia | PhD only |
| NYU Abu Dhabi | Full need not stated on an official page |
| Waseda | Small awards |
| UTokyo PEAK | Ended |
| Tsinghua | Only CSC, already listed |
| Zhejiang | Tuition-only, unclear |
| SMU Global Impact | Singaporeans only |
| Boğaziçi | No international aid |
| Özyeğin | No 100% tier |
| Melbourne | No fitting award |
| Auckland | Now a master's award |
| ESU Padova | No current call |
| HKUST Global Learners | Amount unclear |
| Hani Qaddumi | No official site found |
| Higherlife | Funds study at home |
| Jardine–HKU | Local students only |
| K.C. Mahindra | Loan |
| Ashinaga | No current open cycle |

**Next session:** master's (batches 9, 10a, 10b, 11) are 112 of 160, then PhD (12, 13, 14) at 110 of 140. Run at most 4 batches of about 40 searches each.

## Session 4 (resumed): master's

Four batches ran in parallel, each capped at about 40 searches. They used about 133 searches in total. `npm run validate-data` and `npm test` (107 tests) passed before each commit and push.

| Batch | Added | Highlights |
| --- | --- | --- |
| 9 Government | +17 (file now 24) | Fulbright commissions: Indonesia (AMINEF), Mexico (COMEXUS), Türkiye, Argentina, Colombia, Japan, Philippines (PAEF), Vietnam, Korea, Bangladesh. Others: NAWA Banach, NAWA Poland My First Choice, Estonia, Lithuania, AMEXCID, AGCID, Brazil PEC-PG |
| 10a Europe/UK universities | +14 (file now 22) | DTU, Copenhagen, Aarhus, Tampere, Lausanne, Geneva Graduate Institute, Sciences Po Boutmy (master's), Oxford Weidenfeld-Hoffmann and Pershing Square, Cambridge Trust, UCL Global Masters, Milano-Bicocca, Trento, Grenoble IDEX |
| 10b Asia/Middle East/Oceania universities | +16 (file now 21) | Khalifa, KFUPM, HBKU, Adelaide, Melbourne research master's, GRIPS MEXT, HKUST and HKU MPhil studentships, NUS research master's, Yonsei, Korea University, NTHU, NYCU, Peking University, Otago, Tohoku |
| 11 Foundations + EMJMs | +17 (file now 20) | Marshall (US only), EIT Digital, AIT HM King, IsDB, AfDB-JADS, KAS, FES, Rosa Luxemburg, Hanns Seidel, KAAD, Böll; EMJMs Europhotonics, MAPP, EMLE, SSI2, MESPOM, Choreomundus |

**Total now 437:** master's **176 (target met)**, undergraduate 130, internships 112, PhD 118.

**Coordinator fixes:**
* `grips-mext`: the "work experience required" flag was the agent's assumption, so I removed it and the note now says to check.
* `emjm-emship`: removed, because 2027 scholarships aren't stated (consistent with other EMJMs dropped for the same reason).

**Least certain (session 4):**

| Entry | Issue |
| --- | --- |
| `fulbright-comexus-mexico` | conflicting call dates |
| `fulbright-turkiye` | amount unconfirmed |
| `agcid-republica-de-chile` | amount and invited countries not found |
| `nawa-banach` | amount not found; country list as `check` |
| `lithuania-state-masters` | 2026 country list |
| `kfupm-grad-ms` | 15 Dec date not tied to an intake; only some programmes funded |
| `hbku-grad-scholarship` | stipend from an 18-month-old page |
| `korea-univ-grad-intl` | dated and conflicting tiers |
| `nycu-intl-grad` | NT$33,000 may be the top case only |
| `tampere-tuition-scholarship` | 15:00 EET closing time assumed |
| `unitn-intl-scholarship` | amount and date estimated; two official pages disagree |
| `bicocca-international-scholarship` | date inferred from 2026 |
| `ucl-global-masters` | £15k, needs-based, probably under 50% of tuition, but supports living costs |
| `unil-masters-grant` | monthly amount not stated |
| `boell-international-scholarship` | one page says only first-cycle programmes from 1 Mar 2027 |
| `emjm-ssi2` | scholarships depend on an EU grant agreement due mid-Nov 2026 |
| `ait-hm-king-scholarship` | estimated deadline; country lists differ |
| `isdb-msc-scholarship` | deadline from an old FAQ |

**Dropped (session 4):**

| Candidate | Reason |
| --- | --- |
| Qatar University graduate assistantships | Students pay their own tuition |
| Waterloo | CA$12k minimum, not full funding |
| Turku, Oulu | 100%/50% waivers ended |
| Åbo Akademi, LUT | Waivers unclear or for one year only |
| LSE GSS, Manchester, HEC, Polytechnique | Awards under 50% of tuition |
| Bocconi | No 2027-28 page |
| Unibo, TOPoliTO, Sapienza, Pavia, Lyon | No current call |
| Mitchell | Paused |
| IHE Delft | Country-specific awards only |
| Nuclear Physics EMJM | Last intake 2023–25 |
| MIR, JEMARO | No EM scholarships; JEMARO self-funded |
| FIPDes, IMBRSea, QuanTEEM | No recent EM scholarships |
| CYBERUS | Relaunching under a new name |
| SpaceMaster, IMRD, GEMMA, WACOMA | Scholarships unconfirmed |
| Fulbright India, Egypt, Nepal, Sri Lanka, Morocco, Thailand, Peru, Chile, Brazil | No 2027 dates |
| Fulbright Germany | Contradictory deadline |
| Manaaki Africa/LatAm/Caribbean | No dates |

**Next session:** PhD batches (12, 13, 14) are 118 of 140. Internships are 112 of 120 (a small top-up batch would finish them).

## Session 5 (resumed): PhD

Three batches ran in parallel, each capped at about 40 searches. They used about 97 searches in total. `npm run validate-data` and `npm test` (107 tests) passed before each commit and push.

| Batch | Added | Entries |
| --- | --- | --- |
| 12 Europe/UK | +23 (file now 41) | Oxford AIMS CDT, Oxford–DeepMind (CS), Cambridge International Scholarship, Bristol ProAI CDT, LSGNT CDT, Edinburgh AI4BI CDT, Edinburgh Doctoral College; salaried-PhD explainers for the Netherlands, Denmark, Norway, Sweden and Finland; ETH Zurich doctoral; University of Vienna praedoc; Inria; Biozentrum Basel; VBC; SISSA, GSSI, IMT Lucca, SNS, Bologna; Institut Pasteur PPU |
| 13 Asia/Oceania/Middle East | +26 (file now 36) | RIKEN IPA and JRA, UTokyo fellowship, Kyoto DoGS SPRING, Tohoku AGS RISE, CAS-ANSO Scholarship, ANSO-CAS-TWAS/UNESCO, Westlake, SUSTech, Academia Sinica TIGP, Australian RTP (international), Sydney, ANU, UQ, Monash, Melbourne, UWA, Adelaide, Auckland, Otago, Wellington, Canterbury, Weizmann Feinberg, Technion, UAEU, Sharjah |
| 14 North America | +17 (file now 28) | US and Canada funded-PhD explainers; funding guarantees at Princeton, Harvard GSAS, MIT EECS, Stanford, Caltech, CMU SCS, Berkeley EECS, Yale, Columbia, U of T CS, UBC 4YF, McGill, Waterloo; CGRS doctoral; Paul & Daisy Soros |

**Total now 503:** PhD **184 (target met)**, master's 177, undergraduate 130, internships 112.

**Coordinator fixes:**
* `imperial-aeronautics-phd` removed: funding not stated.
* `coefficient-cdtf` removed: amount unknown, status from a page about a year old, and "budget constraints limit new grants".
* `cgrs-doctoral`: kept. CIHR's official page says registered international doctoral students qualify. The date is worked out from NSERC's standing 17 Oct / next-business-day rule, and the entry is `varies` because universities set earlier internal deadlines.
* `cas-anso-scholarship-phd` and `anso-cas-twas-phd` both kept: they're separate schemes (the ANSO Scholarship vs the TWAS/UNESCO fellowship for developing countries).

**Least certain (session 5):**

| Entry | Issue |
| --- | --- |
| `pasteur-ppu` | 12 Nov 2026 estimated from 2025 |
| `vbc-phd` | newest call details from 2024; rolling |
| `oxford-deepmind-cs` | nationality rules not confirmed (`check`) |
| `sissa-phd`, `sns-phd`, `bologna-phd`, `imt-lucca-phd` | dates estimated from 2026 |
| `melbourne-research-scholarship-phd` | no amount; Engineering & IT may be local-only |
| `kyoto-dogs-spring` | amounts from 2024; programme reviewed Jul 2026 |
| `tohoku-ags-rise` | international eligibility not confirmed (`check`) |
| `westlake-phd-fellowship` | 2023 brochure; no stipend figure |
| `sharjah-phd-ra-ta`, `uaeu-phd-scholarship` | stipends unknown |
| `uq-grss` | tuition cover for internationals not confirmed |
| `cas-anso-scholarship-phd`, `anso-cas-twas-phd` | 2027 dates estimated |
| `stanford-phd-funding` | pieced together from department pages; no single guarantee page |
| `caltech-phd-funding` | most sources need US work authorisation |
| `columbia-gsas-phd-funding` | deadline page about 11 months old |

**Dropped (session 5):**

| Candidate | Reason |
| --- | --- |
| UCL Foundational AI CDT | Only old pages; international funding unclear |
| Cambridge AI4ER | No longer recruiting |
| Edinburgh Quantum Informatics / ML Systems / AGQ CDTs | Funding, deadline or international eligibility unclear |
| Manchester, Southampton CDTs | International full funding not confirmed |
| FNR | AFR discontinued; successor needs a Luxembourg link |
| Research Ireland GOI | Closed for 2027 |
| Polytechnique AMX | No dates |
| Helmholtz, Leibniz | No single programme page |
| UZH | Covered in the ETH note |
| UNSW Scientia | Domestic only |
| Qatar University PhD | No tuition cover |
| Tel Aviv | No stipend figure |
| Hebrew University | Funding split by faculty |
| NTU Taiwan | No university-wide scheme confirmed |
| Osaka | No data |
| SOKENDAI | 2027 MEXT amounts not fixed |
| UTokyo SPRING GX | Drops to ¥90k/month for internationals from FY2027 |
| Cornell | "Nearly 97–99%" funded, not all |
| Ford Foundation | Ended |
| Qualcomm Innovation Fellowship NA | No 2027 deadline |
| Open Philanthropy AI Fellowship | Status unconfirmed |
| IBM PhD Fellowship | Paused |
| Schmidt Science Fellows | Postdoc |

**Where things stand:** undergraduate, master's and PhD are all past their targets. Internships are at 112 of 120, and the total is 503 of 550. One more turn could close both gaps:
* an internship top-up of ~10 (remaining ideas: Biozentrum Basel summer, Heidelberg HGS, UN-Habitat, Kenya/Nigeria-hosted organisations);
* ~40 more entries spread across levels (e.g. Fulbright Kenya and Nigeria, UZH/USI/Glasgow/Warwick master's awards, Fudan/SJTU/ZJU graduate scholarships, Keio, Fudan and İTÜ undergraduate awards).

## Session 6: internship top-up and extra entries

Four new batches ran, each in its own file and capped at about 40 searches. They used about 144 searches in total. `npm run validate-data` and `npm test` passed before each commit and push.

| Batch | File | Added | Entries |
| --- | --- | --- | --- |
| 15 Internship top-up | internships/b15-topup.json | +13 | ITER, IRENA, AIIB, UNOPS, UN Women, IIASA YSSP, Gavi, GGGI, CTBTO, ILRI graduate fellowship, EFSA, ICRC, IUCN |
| 16 Extra Europe/UK | masters/b16-extra-europe.json | +16 | Warwick Chancellor's International (PhD), St Andrews St Leonard's (master's) and World-Leading PhD, CEU master's aid, Flanders Master Mind, KU Leuven Inspiring the Outstanding, Radboud, Tilburg waiver, VU Amsterdam VUFP, Erasmus School of Economics Trustfonds and Franses, Wageningen Excellence and Africa scholarships, TU/e Excellence (microchip), Ghent BOF-DOS Global South, Bocconi Graduate Merit Award |
| 17 Extra Asia | masters/b17-extra-asia.json | +17 | Chinese, Japanese, Korean, Taiwanese and Thai university schemes, incl. SJTU graduate, Chulalongkorn, Mahidol, Hanyang, NCKU Veritas |
| 18 Africa/Middle East/Oceania | masters/b18-extra-misc.json | +12 | Fulbright Kenya, Ghana, South Africa, Uganda, Tanzania; Pan African University; AIMS master's; AUC international and African graduate fellowships; Wellington master's by thesis; Intra-Africa Mobility; Israel MFA |

**Coordinator fixes:**
* `gggi-internship`: amount reworded to "check each vacancy", since the only figure is from a 2022 posting.
* Removed `cuni-mff-cs-tuition-scholarship`: ≥50% of tuition not confirmed.
* Removed `guq-qf-merit`: may be for returning students only, consistent with TAMU-Q being dropped.
* Removed `aus-graduate-assistantship`: award size not guaranteed.

**Least certain (session 6):**

| Entry | Issue |
| --- | --- |
| `aiib-global-internship` | date estimated; whether non-member nationals can apply not confirmed |
| `efsa-traineeship` | dates estimated from 2026; grant amount not published |
| `iucn-internship` | pay set per office; only Washington DC figures found |
| `ilri-graduate-fellowship` | a thesis-research stipend rather than a classic internship |
| `tue-excellence-microchip` | amount not published |
| `wur-africa-scholarship` | amount not stated; eligibility as a note |
| `flanders-master-mind` | scheme under review for 2027-28; deadlines per university |
| `vu-amsterdam-vufp` | an older page says tuition only; current terms not confirmed |
| `sjtu-grad-scholarship` | date estimated; master's awards may be partial |
| `chula-asean-nonasean-grad` | date estimated; amounts from 2022–24 |
| `mahidol-postgrad-intl` | amount not published |
| `hanyang-eng-sci-grad` | 50% figure from the 2024 guideline; no Fall 2027 date |
| `ncku-veritas-phd` | stipend cap NT$25k vs 30k on different pages |
| `aims-masters` | 15 vs 31 Mar on official pages; used 15 Mar, `expected` |
| `pau-scholarship` | dates estimated |
| `israel-mfa-scholarship` | eligible-country list not seen |

**Dropped (session 6):**

| Candidate | Reason |
| --- | --- |
| Janelia | No sessions since 2022 |
| Technion SURP | Housing only |
| NDB, Global Fund, Kavli IPMU, IFPRI, EPO | No stipend information |
| ITU, UNEP, UN-Habitat, UNRWA | Unpaid |
| IRRI | Funding depends on the sponsor |
| IBS | Only group-level postings |
| ECDC, EMA, EUIPO, ESMA, EUMETSAT | EU/EEA or member-state nationals only |
| UZH Excellence | Internal pilot |
| USI | CHF 4,000 |
| Tartu | Non-EU waivers ended |
| Paris Cité, Sorbonne, TSE | Eiffel already covered; small waivers |
| Durham | Already covered by Commonwealth/GREAT |
| Glasgow Humanitarian | No deadline |
| Antwerp, VUB, Ghent top-up | Covered by Master Mind / VLIR, or may no longer exist |
| IKY | Closed |
| Unimi, PoliTo | Small awards or EU-only |
| Linköping | No 2027 deadline |
| Fudan | Amount unpublished |
| Zhejiang gov | RMB 30k only |
| Nanjing, Wuhan | CSC routes duplicate `csc-university-program`; Wuhan's own award is small |
| Osaka, Science Tokyo | MEXT university-recommendation route ending |
| Hitotsubashi, Waseda | Aid only after enrolment |
| UTM, UM | Small waivers or RA posts |
| Fulbright Nigeria | No 2027 call |
| Fulbright Ethiopia | Not offered |
| Auckland, Canterbury, Lincoln, Tongarewa | Under 50% of tuition |
| UCT | Partial awards only |
| Tullow | No sign it still runs |
| UM6P, NYUAD, AUB | Full funding not confirmed |
| Doha Institute | "No Scholarships" |
| OAS | US$10k/yr |
| Qatar University assistantship | No tuition cover |
| TAMU-Q | Returning students only |
| UAlberta | No university-wide master's funding |
| CMU-Africa | Via Mastercard, already listed |
| Ashinaga | Rules changed and unclear |
| EARTH | No current details |

## How to resume (optional further growth)

1. `git checkout v4-data && git log --oneline | head`, then read this section.
2. The brief for research agents is in `docs/research-brief.md`. `npm run -s list-programmes` lists what already exists.
3. Re-run the batches below, appending to the **same files**. Each needs roughly 1–2 official-domain searches per entry. With 200 searches per turn, run about 3–4 batches per turn rather than 16 at once.
4. After each batch: `npm run validate-data -- <file>`, then commit and push.

**Still to research, per batch:**

| Batch | Remaining candidates |
| --- | --- |
| 1 | ✅ Resumed in session 2 (see below). Left: Biozentrum Basel, Heidelberg HGS |
| 2 | ✅ Resumed in session 2. Left: none worth retrying (see drops) |
| 3 | ✅ Resumed in session 2. Left: a few more open-to-international US/Canadian programmes, if any can be found |
| 4 | ✅ Resumed in session 2. Left: none with official programme pages |
| 5 | ✅ Resumed in session 2. Left: UN-Habitat, UNEP (unpaid), ITU/UNESCO (unpaid) |
| 6 | ✅ Resumed in session 3. Left: none (Umm Al-Qura, Tunisia, Uzbekistan dropped) |
| 7a | ✅ Resumed in session 3. Left: none |
| 7b | ✅ Resumed in session 3. Left: Keio, Science Tokyo, Fudan, İTÜ, Canterbury (not searched) |
| 8 | ✅ Resumed in session 3. Left: Tullow, Hope for Haiti, Sir Ratan Tata (not searched) |
| 9 | ✅ Resumed in session 4. Left: Fulbright Kenya, Nigeria (not searched); India, Egypt, Nepal, Sri Lanka, Morocco, Thailand, Peru, Chile, Brazil, Germany (no 2027 dates) |
| 10a | ✅ Resumed in session 4. Left: UZH, USI, Paris Cité, Sorbonne, Toulouse, Glasgow, Warwick, Durham, St Andrews (not searched) |
| 10b | ✅ Resumed in session 4. Left: UBC, Toronto, Concordia, Auckland, Hitotsubashi, APU, Fudan/SJTU/ZJU/USTC, NCKU, Kyushu/Kyoto/Osaka (not searched) |
| 11 | ✅ Resumed in session 4. Left: more EMJMs once 2027 scholarships are confirmed (SpaceMaster, IMRD, GEMMA, WACOMA, EMship) |
| 12 | ✅ Resumed in session 5. Left: CNRS, Polytechnique AMX (no dates), Helmholtz/Leibniz (no single programme page), more UK CDTs once their international funding is confirmed |
| 13 | ✅ Resumed in session 5. Left: Osaka (no data) |
| 14 | ✅ Resumed in session 5. Left: Qualcomm NA (once a deadline is posted) |

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


## Update: separate Internships option

- The study-level picker now has five options: Undergraduate, Master's, PhD, Internships and All levels. "PhD & research" was split into **PhD** and **Internships**.
- Old links with `lvl=internship` or `lvl=research` now open the Internships view.
- Email alerts accept the new `intern` level (Supabase check constraint, edge-function validation and email labels updated). The migration hasn't been applied anywhere yet, so the original migration file was edited directly.
