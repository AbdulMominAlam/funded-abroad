"""One-off migration of src/data/scholarships.json from the Pakistan-specific v2 model to the v3 global model.

Kept in the repo so the transformation is reviewable. Run with: python3 scripts/migrate-v3.py
v2 fields removed: abroad, hec, nomination. v3 fields added: eligibility, residencyRequired, nominationBody, countryNotes.
"""
import json

P = "src/data/scholarships.json"
data = json.load(open(P))

EEA = "AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO".split()
AUS_AWARDS = ("DZ AO BW CI CD EG ET GH GN GM KE MG MW MU MA MZ NA NG RW SL ZA TZ UG ZM ZW "
              "BD BT BN KH FM PF FJ ID KI LA MV MN MM NP NC NU PK PW PG PH MH WS SG SB LK TL TO TV VU VN WF NR TH").split()
AGA_KHAN = "AF AU BD EG IN KE KG MG MZ NZ PK SY TJ TZ UG".split()

ALL = {"type": "all"}
def excl(*c): return {"type": "exclude", "countries": sorted(c)}
def lst(c): return {"type": "list", "countries": sorted(set(c))}
def check(note): return {"type": "check", "note": note}

# id -> dict of v3 fields + optional overrides of existing fields
M = {
 "eth": dict(eligibility=ALL),
 "yenching": dict(eligibility=ALL),
 "hkpfs": dict(eligibility=ALL),
 "gates": dict(eligibility=excl("GB")),
 "mbzuai": dict(eligibility=ALL),
 "epfl": dict(eligibility=ALL),
 "clarendon": dict(eligibility=ALL),
 "eiffel": dict(eligibility=excl("FR"), nominationBody="A French higher-education institution (you can't apply directly)"),
 "kaust": dict(eligibility=ALL),
 "erasmus": dict(eligibility=ALL),
 "hungary": dict(
   name="Stipendium Hungaricum",
   host="Government of Hungary (Tempus Public Foundation)",
   eligibility=check("Only citizens of Stipendium Hungaricum sending-partner countries (about 90, incl. Pakistan); check the partners list"),
   nominationBody="Your country's sending partner (e.g. HEC in Pakistan)",
   tags=["Sending-partner nomination", "Two portals"],
   note="Apply on the Stipendium Hungaricum portal and through your country's sending partner, which nominates candidates. Each sending partner sets its own extra rules and dates.",
   countryNotes={"PK": "Pakistan's sending partner is HEC: apply on both the Stipendium Hungaricum portal and the HEC portal. HEC shortlists with a written test."},
   levels=["Undergraduate", "Master's", "PhD"]),
 "cern": dict(eligibility=ALL,
   note="For BSc/MSc students (not PhD) in physics, engineering, CS or maths. Applications usually open in November and close at the end of January. Students from non-member states can apply too (funded via the CERN & Society Foundation).",
   countryNotes={"PK": "Pakistan is a CERN Associate Member State, so use the Member/Associate track."}),
 "turkiye": dict(eligibility=excl("TR"), levels=["Undergraduate", "Master's", "PhD"],
   name="Türkiye Bursları (Türkiye Scholarships)",
   note="One application per cycle covers undergraduate, master's and PhD. Not open to students already enrolled in Türkiye at the level they apply for (a bachelor's student there can still apply for a master's). Turkish citizens are not eligible."),
 "gks": dict(eligibility=check("Only citizens of countries in the GKS graduate guideline (about 150; Pakistan included); check the list in the official guideline"),
   countryNotes={"PK": "Embassy track: watch the Korean Embassy in Islamabad for the graduate call."},
   note="Last cycle was announced in February with embassy applications in Feb–Mar. Apply through a Korean embassy (embassy track) or directly to a designated university (university track). Korean citizens are not eligible."),
 "aga": dict(eligibility=lst(AGA_KHAN), residencyRequired=True,
   note="For students with no other way to finance study. Apply through the Aga Khan Foundation office in your country; only these 15 countries take part: Afghanistan, Australia, Bangladesh, Egypt, India, Kenya, Kyrgyz Republic, Madagascar, Mozambique, New Zealand, Pakistan, Syria, Tajikistan, Tanzania, Uganda."),
 "fulbright": dict(
   name="Fulbright Foreign Student Program",
   host="US Government (Fulbright commissions / US embassies)",
   eligibility=excl("US"), residencyRequired=True, varies=True, expected=None,
   nominationBody="The Fulbright commission or US embassy in your country",
   dlText="Set by each country's Fulbright commission (often Feb–Oct) · Pakistan (USEFP): next round expected early 2027, closing ~1 Apr 2027",
   tags=["Apply in your home country", "GRE often required"],
   note="Runs in about 160 countries, each with its own dates, quotas and rules; most require you to live in your home country when you apply. Clinical medicine is generally excluded.",
   countryNotes={"PK": "Run by USEFP. The 2027-entry round closed 1 Apr 2026; the next one is expected early 2027 with a ~1 Apr deadline. GRE required; master's needs 16 years of education, PhD 18. About 100 awards per cycle."}),
 "oist": dict(eligibility=ALL),
 "aus": dict(
   name="Australia Awards Scholarships",
   host="Australian Government (DFAT)",
   eligibility=lst(AUS_AWARDS), residencyRequired=True, varies=True, expected=None,
   dlText="Set per country · most Asia-Pacific countries: ~Feb – 30 Apr 2027 (2028 intake, expected); Africa differs",
   tags=["Must reside in your home country", "Work experience required", "Development priority fields"],
   note="Only for citizens of participating countries in Asia, the Pacific and Africa (list taken from DFAT's 2027-intake tables; it changes yearly). Each country sets its own priority fields, age and work rules.",
   url="https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships-opening-and-closing-dates",
   countryNotes={"PK": "Pakistan round: last one ran 1 Feb – 30 Apr 2026, 14:00 AEST; expected to reopen early 2027 (2028 intake). Master's only, age ≤ 45, and you need a Development Impact and Linkages Plan showing how your degree helps Pakistan. Details: australiaawardspakistan.org"}),
 "mext": dict(
   name="MEXT Research Scholarship (Embassy Recommendation)",
   eligibility=excl("JP"), residencyRequired=True, varies=True, expected=None,
   nominationBody="The Japanese embassy or consulate in your country",
   dlText="Set by each Japanese embassy (most screen Apr–Jun) · Pakistan: expected Apr–May 2027",
   note="Apply through the Japanese embassy in your country, which runs the exams and interviews. The university-recommendation (general) route is being discontinued from AY2027 at several universities, so plan on the embassy route.",
   countryNotes={"PK": "Via the Embassy in Islamabad or the Consulate in Karachi; written exams are held in Pakistan. The 2027 round closed 26 May 2026."}),
 "daad": dict(eligibility=check("Applicants from developing countries (DAC list); each course states which nationalities qualify")),
 "chevening": dict(eligibility=check("Only citizens of Chevening-eligible countries (about 160, incl. Pakistan); check the country list")),
 "cw": dict(
   name="Commonwealth Master's & PhD Scholarships",
   host="Commonwealth Scholarship Commission in the UK",
   eligibility=check("Only citizens of the 43 low- and middle-income Commonwealth countries on the CSC list for 2027/28 (incl. Pakistan, India, Bangladesh, Nigeria, Kenya, Ghana, South Africa)"),
   residencyRequired=True,
   nominationBody="Your national nominating agency (e.g. HEC in Pakistan) or an approved university/NGO nominator",
   dlText="Closed 20 Oct 2026 (CSC portal 16:00 BST; national agencies set earlier dates)",
   tags=["National nomination", "Must reside in an eligible country", "Dual nationals may be ineligible"],
   note="Taught master's (no MBA) and PhD in the UK. You apply on the CSC portal and through a national nominating agency, which has its own (earlier) deadline and rules.",
   countryNotes={"PK": "Nominated by HEC: the HEC portal closed 20 Oct 2026, 16:00 PKT. HAT score ≥ 60 and a first division in a 16-year bachelor's are required; HEC had 26 master's and 30 PhD nominations. Dual nationals ineligible."}),
 "kh": dict(eligibility=ALL),
 "rhodes": dict(
   name="Rhodes Scholarship",
   eligibility=ALL, varies=True,
   dlText="Set by constituency (country/region); most close Jul – Oct · Pakistan closed 5 Aug 2026",
   nextText="Next rounds open ~Jun 2027",
   tags=["Constituency rules", "Age limit"],
   note="Each constituency (country or region) has its own deadline and residency rules; applicants from countries without one can apply for the Global Rhodes Scholarships. Fully funded study at Oxford.",
   url="https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/",
   countryNotes={"PK": "Pakistan constituency: two scholarships a year, 1 Jun – 5 Aug (23:59 PKT), no fee. You must have studied in Pakistan for at least 4 of the last 10 years and finished school in Pakistan."}),
 "cgs": dict(
   name="Chinese Government Scholarship (Bilateral Program)",
   host="China Scholarship Council (via your country's dispatching authority)",
   eligibility=excl("CN"), varies=True, expected=None,
   levels=["Undergraduate", "Master's", "PhD"],
   nominationBody="Your country's dispatching authority (e.g. HEC in Pakistan) or the Chinese embassy",
   dlText="Set by each dispatching authority (often Jan – Apr) · Pakistan (HEC): expected ~early Jan 2027",
   tags=["Two portals", "Dual nationals often ineligible"],
   note="Apply through the scholarship agency or Chinese embassy in your country and on the CSC portal. Direct university (Type B) applications run separately.",
   countryNotes={"PK": "Via HEC (Type A). Last cycle closed 5 Jan 2026, 16:00 PKT with 75 seats (35 bachelor's, 25 master's, 15 PhD). Apply on both the HEC and CSC portals or you'll be disqualified."}),
 "swiss": dict(eligibility=check("Citizens of about 180 countries, each with its own quota and deadline; check your country's page"),
   residencyRequired=True, varies=True,
   dlText="Set per country (mostly Aug – Dec 2026) · Pakistan closed 31 Oct 2026",
   nominationBody="The Swiss embassy in your country (pre-selection)",
   note="Research stays (6–12 months) and PhD scholarships, not taught master's. Apply through the Swiss embassy for your nationality.",
   countryNotes={"PK": "Pakistan window was 20 Aug – 31 Oct 2026; contact islamabad.scholarships@eda.admin.ch."}),
 # added in v2
 "imprs-is": dict(eligibility=ALL), "ellis-phd": dict(eligibility=ALL), "cs-maxplanck": dict(eligibility=ALL),
 "nus-soc-phd": dict(eligibility=ALL), "singa": dict(eligibility=excl("SG")), "kaist": dict(eligibility=excl("KR")),
 "tsinghua": dict(eligibility=excl("CN"),
   countryNotes={"PK": "This is separate from the HEC-nominated Chinese Government Scholarship; you can apply directly."}),
 "schwarzman": dict(eligibility=ALL), "oist-phd": dict(eligibility=ALL), "mila": dict(eligibility=ALL),
 "imperial-presidents": dict(eligibility=ALL, nominationBody="Your prospective Imperial department"),
 "ucl-res": dict(eligibility=ALL), "edinburgh-informatics": dict(eligibility=ALL),
 "leiden-lexs": dict(eligibility=excl(*EEA, "CH"), tags=["Non-EEA/EFTA students", "~25 awards"]),
 "nl-scholarship": dict(eligibility=excl(*EEA)),
 "helsinki": dict(eligibility=excl(*EEA, "CH")), "aalto": dict(eligibility=excl(*EEA, "CH")),
 "polimi": dict(eligibility=excl("IT")), "padua": dict(eligibility=excl("IT")),
 "kuleuven-science": dict(eligibility=check("Check the nationality conditions on the official page")),
 "google-phd": dict(eligibility=ALL, nominationBody="Your university (up to 3–4 nominees)",
   tags=["University nominates you", "For current PhD students", "University must be in an eligible region"],
   note="Your university, not your nationality, decides eligibility: it must be in an eligible region (e.g. Europe, US, Canada, East Asia, Middle East, Africa, Australia, India, Latin America, Southeast Asia).",
   countryNotes={"PK": "Universities in Pakistan are not in an eligible region; this helps Pakistanis already doing a PhD abroad."}),
 "daad-rise": dict(eligibility=ALL), "summer-epfl": dict(eligibility=ALL), "eth-ssrf": dict(eligibility=ALL),
 "mitacs-gri": dict(eligibility=check("Students enrolled at universities in Mitacs partner countries for 2027 (Pakistan included); the list changes yearly"),
   tags=["Undergraduates only", "Min. GPA set per country", "Enrolled at a university in a partner country"],
   note="12-week research internship in Canada. Eligibility depends on where you study, and Mitacs changes partner countries each year. Last cycle's deadline was 17 Sep 2025.",
   countryNotes={"PK": "All Pakistani universities are eligible for 2027, all disciplines, minimum cumulative GPA 80%."}),
 "koc": dict(eligibility=ALL,
   note="Admitted thesis-based MS/PhD students are considered automatically. A good option if you're already in Türkiye.",
   countryNotes={"PK": "HEC scholars can get 100% PhD tuition through the Koç–HEC partnership (apply to both)."}),
 "bilkent": dict(eligibility=ALL), "epfl-edic": dict(eligibility=ALL), "ista-phd": dict(eligibility=ALL),
}

ORDER = ["id","name","host","country","region","levels","full","amount","opens","deadline","dlText","expected","varies","nextText",
         "tags","eligibility","residencyRequired","work","nominationBody","countryNotes","fields","fieldCats","note","url","source","verifiedOn","checklist"]

out = []
seen = set()
for s in data:
    m = M[s["id"]]; seen.add(s["id"])
    abroad, hec, nom = s.pop("abroad"), s.pop("hec"), s.pop("nomination", False)
    s["residencyRequired"] = not abroad
    s["nominationBody"] = None
    if hec: s["nominationBody"] = "HEC (Pakistan)"
    if nom: s["nominationBody"] = "Your university"
    for k, v in m.items():
        if v is None: s.pop(k, None)
        else: s[k] = v
    # Drop Pakistan-only wording from tags that is now covered by structured fields
    s["tags"] = [t for t in s["tags"] if t not in ("HEC nomination", "Must reside in Pakistan")]
    r = {k: s[k] for k in ORDER if k in s}
    assert set(r) == set(s), (s["id"], set(s) - set(r))
    out.append(r)
assert seen == set(M), set(M) - seen
json.dump(out, open(P, "w"), indent=2, ensure_ascii=False); open(P, "a").write("\n")
print(f"migrated {len(out)} entries")
