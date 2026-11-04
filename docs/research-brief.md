# Research brief for Funded Abroad data batches (read fully before starting)

You are adding scholarship / fellowship / paid-internship programmes to the repo at /home/user/funded-abroad
(a static scholarship finder for students of ANY nationality). Use today's date as `verifiedOn`.
Programmes target the next intake (2027 at the time of writing).

## Your output
- Write ONLY to the single JSON file you were assigned (a JSON array of entries). Create it if missing. Do not edit any other file.
- Do NOT run git commands (no commit/push). The coordinator commits.
- After writing, run: `npm run validate-data -- <your file>` from /home/user/funded-abroad and fix every error until it prints ✔.
  (It also checks your ids/names against all other files: if it reports a duplicate, drop or rename your entry.)
- Existing programmes (do NOT add these again): list them with `npm run -s list-programmes`
  Other batches run in parallel on other topics; stay inside your batch's scope to avoid duplicates.
- Your final reply to the coordinator must be SHORT (max ~200 words): number of entries written, the 5–10 least-certain
  entries (id + why), and candidates you dropped (name + one-line reason). Do not paste JSON in the reply.

## How to research (important constraint)
- Direct page fetching (WebFetch) is BLOCKED by the network policy. Use **WebSearch with `allowed_domains` set to the
  official domain(s)** (e.g. ["oist.jp"], ["daad.de"], ["un.org","undp.org"]). Standard mode is fine; use extended only when needed.
  You can run several searches in parallel.
- Facts (deadline, amount, eligibility) must come from OFFICIAL sources (programme, government, university, organisation
  sites, or official embassy pages). Aggregator/blog sites may be used only to DISCOVER programme names, never as `source`.
- Never invent deadlines, amounts or eligibility. Unknown amount → "check official page". Unknown eligibility detail → use
  `{"type":"check","note":"..."}` or say so in the note.
- 2027 date not published → estimate from the last cycle, set `"expected": true`, and say "estimated from 2026 cycle" in `dlText`/`note`.
- Rolling or set per department/position → `"rolling": true` (and omit `deadline`) OR `"varies": true` with a representative real date. Prefer `rolling` when there is no single date at all.
- Include only: fully funded; or large partial (≥50% tuition, or a living stipend); or salaried positions; or PAID internships. Skip unpaid internships and tiny one-off grants.
- Quality over quantity, but aim for your target count. ~1–2 searches per entry is typical; batch related ones.

## Entry schema (all keys except optional ones are REQUIRED; unknown keys are rejected)
```json
{
  "id": "lowercase-hyphen-id-unique",           // short, unique across the whole repo
  "name": "Official programme name",
  "host": "Organisation / university",
  "country": "Host country name (e.g. Germany) or 'Any (…)'",
  "region": "europe | uk | east-asia | middle-east | north-america | oceania | turkiye | global",
  "levels": ["Undergraduate" | "Master's" | "PhD" | "Internship"],   // only levels it genuinely funds
  "full": true,                                   // fully funded? (paid internships/salaried PhDs with a living wage: true)
  "funding": "full | partial | salaried | paid-internship",   // optional; use salaried / paid-internship where they apply
  "amount": "Human text, e.g. '€1,300/month + travel' or 'check official page'",
  "opens": "2026-12-01",                          // optional, YYYY-MM-DD or ISO with offset
  "deadline": "2027-01-15T23:59:00+01:00",        // ISO 8601 WITH time zone; omit only when rolling
  "dlText": "15 Jan 2027, 23:59 CET",             // human text; say 'time not stated' if unknown
  "expected": true,                                // optional (estimated date)
  "varies": true,                                  // optional (depends on course/country; deadline is representative)
  "rolling": true,                                 // optional (no single date; then NO deadline key)
  "nextText": "Next round ~Oct 2027",             // optional, shown when closed
  "tags": ["Short requirement facts", "Max ~4"],
  "eligibility": {"type":"all"} | {"type":"list","countries":["IN","PK"]} | {"type":"exclude","countries":["US"]}
               | {"type":"group","group":"african-union"} | {"type":"check","note":"Who can apply, in words"},
  "residencyRequired": false,                     // must live in home country when applying
  "work": false,                                  // work experience required
  "nominationBody": null,                         // or "Your university" / "Your national agency" etc.
  "countryNotes": {"IN": "…"},                    // optional, nationality-specific notes keyed by ISO code
  "fields": "Fields in words",
  "fieldCats": ["cs-ai" | "engineering" | "sciences" | "social" | "any"],
  "note": "1–2 plain sentences of the most useful facts.",
  "url": "https://official programme page",
  "source": "https://official page you verified against",
  "verifiedOn": "YYYY-MM-DD"
}
```
Country codes: ISO 3166-1 alpha-2 (XK = Kosovo). Groups available: commonwealth, eu-eea, asean, african-union, oic
(use a group only when the official source defines eligibility that way). Host nationals are often excluded from
"international" schemes → use exclude. Time zones: use the correct offset for that date (DST!). AoE = -12:00.
`expected`, `varies` and `rolling` are mutually exclusive. If the 2027 round already closed, keep the past deadline
and add `nextText`.

Write the file with Python or the Write tool, e.g. build a Python list of dicts and `json.dump(..., indent=2, ensure_ascii=False)`.
