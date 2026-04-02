# Standard library imports
import json
import logging
import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

FALLBACK_FROM_DATE = "1970-01-01"
LAST_ACCESSED_DATE = "2026-03-23"

# Maps free-text sector strings to (code, system) tuples.
# SIC codes used for traditional industries; NAICS for tech/modern sectors.
SECTOR_TO_SIC_MAP: dict[str, tuple[str, str]] = {
    "Aerospace": ("3728", "SIC"),
    "Aerospace & Defense": ("3812", "SIC"),
    "Agriculture": ("0100", "SIC"),
    "Aircraft Leasing": ("7359", "SIC"),
    "Airlines": ("4512", "SIC"),
    "Alcoholic Beverages": ("2080", "SIC"),
    "Aluminum Production": ("3334", "SIC"),
    "Apparel": ("2300", "SIC"),
    "Artificial Intelligence": ("511210", "NAICS"),
    "Asset Management": ("6282", "SIC"),
    "Auto Parts": ("5013", "SIC"),
    "Automotive": ("5511", "SIC"),
    "Automotive Retail": ("5511", "SIC"),
    "Aviation": ("4512", "SIC"),
    "Banking": ("6020", "SIC"),
    "Beverages": ("2080", "SIC"),
    "Biotechnology": ("2836", "SIC"),
    "Brewing": ("2082", "SIC"),
    "Building Materials": ("5031", "SIC"),
    "Building Products": ("3490", "SIC"),
    "Business Development Company": ("6726", "SIC"),
    "Business Services": ("7389", "SIC"),
    "CRM": ("511210", "NAICS"),
    "Car Rental": ("7514", "SIC"),
    "Chemicals": ("2819", "SIC"),
    "Childcare Services": ("8351", "SIC"),
    "Clean Energy": ("4911", "SIC"),
    "Cloud Communications": ("517311", "NAICS"),
    "Cloud Computing": ("518210", "NAICS"),
    "Coal": ("1220", "SIC"),
    "Coal Mining": ("1220", "SIC"),
    "Commercial Property": ("6512", "SIC"),
    "Commodities": ("5159", "SIC"),
    "Conglomerate": ("6719", "SIC"),
    "Conglomerates": ("6719", "SIC"),
    "Construction": ("1500", "SIC"),
    "Construction Materials": ("3290", "SIC"),
    "Consulting": ("7389", "SIC"),
    "Consumer Electronics": ("3651", "SIC"),
    "Consumer Finance": ("6141", "SIC"),
    "Consumer Goods": ("5900", "SIC"),
    "Convenience Stores": ("5411", "SIC"),
    "Credit Cards": ("6141", "SIC"),
    "Data Centers": ("518210", "NAICS"),
    "Defense": ("3812", "SIC"),
    "Diagnostics": ("2835", "SIC"),
    "Display Technology": ("334419", "NAICS"),
    "Diversified Financials": ("6199", "SIC"),
    "E-commerce": ("454110", "NAICS"),
    "Education Services": ("8200", "SIC"),
    "Electric Aviation": ("4512", "SIC"),
    "Electric Power": ("4911", "SIC"),
    "Electric Utilities": ("4911", "SIC"),
    "Electric Vehicles": ("3711", "SIC"),
    "Electrical Equipment": ("3600", "SIC"),
    "Electronic Design Automation": ("511210", "NAICS"),
    "Electronics": ("3679", "SIC"),
    "Electronics Manufacturing": ("334419", "NAICS"),
    "Electronics Manufacturing Services": ("334419", "NAICS"),
    "Energy": ("1311", "SIC"),
    "Energy Infrastructure": ("4922", "SIC"),
    "Energy Services": ("1389", "SIC"),
    "Engineering": ("8711", "SIC"),
    "Engineering Simulation": ("511210", "NAICS"),
    "Entertainment": ("7812", "SIC"),
    "Environmental Services": ("8711", "SIC"),
    "Equipment Distribution": ("5084", "SIC"),
    "Facilities Management": ("7349", "SIC"),
    "Financial Services": ("6199", "SIC"),
    "Financial Technology": ("522320", "NAICS"),
    "Food & Beverage": ("2099", "SIC"),
    "Food Processing": ("2099", "SIC"),
    "Food Products": ("2099", "SIC"),
    "Food Services": ("5812", "SIC"),
    "Fuel Cell Technology": ("3559", "SIC"),
    "Gaming": ("7993", "SIC"),
    "Gaming & Casinos": ("7993", "SIC"),
    "Glass": ("3211", "SIC"),
    "Gold Mining": ("1040", "SIC"),
    "Gold Production": ("1040", "SIC"),
    "Health Insurance": ("6321", "SIC"),
    "Healthcare": ("8099", "SIC"),
    "Healthcare Equipment": ("3841", "SIC"),
    "Home Appliances": ("3630", "SIC"),
    "Home Improvement": ("5211", "SIC"),
    "Homebuilding": ("1520", "SIC"),
    "Hospitality": ("7011", "SIC"),
    "Hospitality & Leisure": ("7011", "SIC"),
    "Human Resources": ("7363", "SIC"),
    "Identification Solutions": ("3579", "SIC"),
    "Industrial": ("3559", "SIC"),
    "Industrial Conglomerate": ("6719", "SIC"),
    "Industrial Gases": ("2813", "SIC"),
    "Industrial Machinery": ("3559", "SIC"),
    "Industrial Manufacturing": ("3490", "SIC"),
    "Industrial Technology": ("3559", "SIC"),
    "Information Technology Services": ("541512", "NAICS"),
    "Infrastructure": ("1600", "SIC"),
    "Insurance": ("6311", "SIC"),
    "Insurance Brokerage": ("6411", "SIC"),
    "Internet Services": ("519130", "NAICS"),
    "Investment Banking": ("6211", "SIC"),
    "Investment Management": ("6282", "SIC"),
    "Investment Research": ("6282", "SIC"),
    "Investment Trust": ("6726", "SIC"),
    "Life Sciences": ("2836", "SIC"),
    "Life Sciences Tools & Services": ("2836", "SIC"),
    "Logistics": ("4731", "SIC"),
    "Manufacturing": ("3490", "SIC"),
    "Manufacturing Equipment": ("3559", "SIC"),
    "Materials": ("2819", "SIC"),
    "Materials Science": ("2819", "SIC"),
    "Meat Processing": ("2011", "SIC"),
    "Media": ("7812", "SIC"),
    "Medical Devices": ("3841", "SIC"),
    "Medical Technology": ("3841", "SIC"),
    "Metals & Minerals": ("1400", "SIC"),
    "Metals & Mining": ("1040", "SIC"),
    "Mining": ("1000", "SIC"),
    "Mobile Communications": ("517210", "NAICS"),
    "Natural Resources": ("1400", "SIC"),
    "Networking Equipment": ("334210", "NAICS"),
    "Nutrition": ("2099", "SIC"),
    "Oil & Gas": ("1311", "SIC"),
    "Oil & Gas Equipment": ("3533", "SIC"),
    "Oil & Gas Exploration": ("1311", "SIC"),
    "Oil & Gas Services": ("1389", "SIC"),
    "Online Dating": ("519130", "NAICS"),
    "Online Travel": ("561510", "NAICS"),
    "Packaging": ("2650", "SIC"),
    "Payment Processing": ("522320", "NAICS"),
    "Petroleum Refining": ("2911", "SIC"),
    "Pharmaceuticals": ("2836", "SIC"),
    "Power Generation": ("4911", "SIC"),
    "Private Equity": ("6726", "SIC"),
    "Property Investment": ("6512", "SIC"),
    "Public Safety Equipment": ("3812", "SIC"),
    "REIT": ("6798", "SIC"),
    "REITs": ("6798", "SIC"),
    "Rail Transportation": ("4011", "SIC"),
    "Railroads": ("4011", "SIC"),
    "Real Estate": ("6512", "SIC"),
    "Real Estate Development": ("1500", "SIC"),
    "Real Estate Investment Trust": ("6798", "SIC"),
    "Real Estate Investment Trusts (REITs)": ("6798", "SIC"),
    "Retail": ("5900", "SIC"),
    "Risk Management": ("6411", "SIC"),
    "Rubber": ("3069", "SIC"),
    "Safety Products": ("5047", "SIC"),
    "Security Services": ("7382", "SIC"),
    "Semiconductor Equipment": ("3559", "SIC"),
    "Semiconductors": ("334413", "NAICS"),
    "Silver Production": ("1044", "SIC"),
    "Social Media": ("519130", "NAICS"),
    "Software": ("511210", "NAICS"),
    "Sporting Goods": ("5941", "SIC"),
    "Steel": ("3312", "SIC"),
    "Steel Manufacturing": ("3312", "SIC"),
    "Stock Exchange": ("6231", "SIC"),
    "Stock Exchanges": ("6231", "SIC"),
    "Supply Chain Management": ("4731", "SIC"),
    "Technology": ("7372", "SIC"),
    "Telecommunications": ("4813", "SIC"),
    "Telecommunications Equipment": ("3661", "SIC"),
    "Tires": ("3011", "SIC"),
    "Tobacco": ("2111", "SIC"),
    "Toll Roads": ("1600", "SIC"),
    "Trading & Distribution": ("5159", "SIC"),
    "Trading Companies": ("5159", "SIC"),
    "Transportation": ("4731", "SIC"),
    "Travel": ("4724", "SIC"),
    "Travel Services": ("4724", "SIC"),
    "Unmanned Systems": ("3812", "SIC"),
    "Utilities": ("4911", "SIC"),
    "Vehicle Dealerships": ("5511", "SIC"),
    "Waste Management": ("4953", "SIC"),
    "Wealth Management": ("6282", "SIC"),
}

# Fallback sector pairs used when source data has no sector information.
FALLBACK_SECTOR_PAIRS: list[tuple[str, str]] = [
    ("Financial Services", "Banking"),
    ("Technology", "Software"),
    ("Energy", "Oil & Gas"),
    ("Healthcare", "Pharmaceuticals"),
    ("Manufacturing", "Industrial"),
    ("Real Estate", "Commercial Property"),
    ("Telecommunications", "Media"),
    ("Retail", "Consumer Goods"),
    ("Mining", "Natural Resources"),
    ("Transportation", "Logistics"),
    ("Insurance", "Asset Management"),
    ("Chemicals", "Materials"),
    ("Construction", "Infrastructure"),
    ("Food & Beverage", "Agriculture"),
    ("Automotive", "Manufacturing"),
]

# Top financial/business city per country
COUNTRY_CITIES: dict[str, str] = {
    "Argentina": "Buenos Aires",
    "Australia": "Sydney",
    "Austria": "Vienna",
    "Belgium": "Brussels",
    "Bermuda": "Hamilton",
    "Brazil": "São Paulo",
    "Canada": "Toronto",
    "Cayman Islands": "George Town",
    "Chile": "Santiago",
    "China": "Shanghai",
    "Colombia": "Bogotá",
    "Denmark": "Copenhagen",
    "Finland": "Helsinki",
    "France": "Paris",
    "Germany": "Frankfurt",
    "Greece": "Athens",
    "Hong Kong": "Hong Kong",
    "Hungary": "Budapest",
    "India": "Mumbai",
    "Indonesia": "Jakarta",
    "Ireland": "Dublin",
    "Israel": "Tel Aviv",
    "Italy": "Milan",
    "Japan": "Tokyo",
    "Jersey": "St Helier",
    "Liberia": "Monrovia",
    "Luxembourg": "Luxembourg City",
    "Malaysia": "Kuala Lumpur",
    "Marshall Islands": "Majuro",
    "Mexico": "Mexico City",
    "Netherlands": "Amsterdam",
    "New Zealand": "Auckland",
    "Norway": "Oslo",
    "Panama": "Panama City",
    "Peru": "Lima",
    "Philippines": "Manila",
    "Poland": "Warsaw",
    "Portugal": "Lisbon",
    "Russia": "Moscow",
    "Singapore": "Singapore",
    "South Africa": "Johannesburg",
    "South Korea": "Seoul",
    "Spain": "Madrid",
    "Sweden": "Stockholm",
    "Switzerland": "Zurich",
    "Taiwan": "Taipei",
    "Thailand": "Bangkok",
    "Turkey": "Istanbul",
    "United Arab Emirates": "Dubai",
    "United Kingdom": "London",
    "United States": "New York",
}

# Secondary cities used for the "past" address entry
COUNTRY_SECONDARY_CITIES: dict[str, str] = {
    "Argentina": "Córdoba",
    "Australia": "Melbourne",
    "Austria": "Graz",
    "Belgium": "Antwerp",
    "Bermuda": "St. George's",
    "Brazil": "Rio de Janeiro",
    "Canada": "Montreal",
    "Cayman Islands": "West Bay",
    "Chile": "Valparaíso",
    "China": "Beijing",
    "Colombia": "Medellín",
    "Denmark": "Aarhus",
    "Finland": "Tampere",
    "France": "Lyon",
    "Germany": "Munich",
    "Greece": "Thessaloniki",
    "Hong Kong": "Kowloon",
    "Hungary": "Debrecen",
    "India": "Delhi",
    "Indonesia": "Surabaya",
    "Ireland": "Cork",
    "Israel": "Jerusalem",
    "Italy": "Rome",
    "Japan": "Osaka",
    "Jersey": "St Brelade",
    "Liberia": "Buchanan",
    "Luxembourg": "Esch-sur-Alzette",
    "Malaysia": "Penang",
    "Marshall Islands": "Ebeye",
    "Mexico": "Monterrey",
    "Netherlands": "Rotterdam",
    "New Zealand": "Wellington",
    "Norway": "Bergen",
    "Panama": "Colón",
    "Peru": "Arequipa",
    "Philippines": "Cebu",
    "Poland": "Kraków",
    "Portugal": "Porto",
    "Russia": "St. Petersburg",
    "Singapore": "Jurong East",
    "South Africa": "Cape Town",
    "South Korea": "Busan",
    "Spain": "Barcelona",
    "Sweden": "Gothenburg",
    "Switzerland": "Geneva",
    "Taiwan": "Kaohsiung",
    "Thailand": "Chiang Mai",
    "Turkey": "Ankara",
    "United Arab Emirates": "Abu Dhabi",
    "United Kingdom": "Manchester",
    "United States": "Chicago",
}

STREET_NAMES = [
    "Commerce Drive", "Financial Boulevard", "Corporate Way", "Market Street",
    "Industry Lane", "Enterprise Avenue", "Trade Center Road", "Business Park",
    "Innovation Drive", "Capital Plaza", "Harbor Boulevard", "Exchange Place",
    "Technology Parkway", "Gateway Drive", "Commerce Park", "Industrial Way",
    "Executive Boulevard", "Global Center Drive", "Meridian Avenue", "Summit Road",
]

FIRST_NAMES = [
    "James", "Maria", "David", "Sarah", "Robert", "Chen", "Elena", "Michael",
    "Jennifer", "William", "Yuki", "Carlos", "Amara", "François", "Priya",
    "Thomas", "Mei", "Richard", "Fatima", "John", "Ingrid", "Samuel",
    "Nora", "Patrick", "Laila", "Andrew", "Hana", "Daniel", "Aisha",
    "Christopher", "Lena", "Peter", "Yasmin", "Mark", "Chiara", "Paul",
    "Zoe", "George", "Leila", "Steven", "Camille", "Kevin", "Mia",
    "Brian", "Sophie", "Jonathan", "Clara", "Scott", "Diana", "Eric",
    "Isabel", "Ryan", "Vera", "Adam", "Natasha", "Alan", "Giulia",
    "Nathan", "Ana", "Kenneth", "Miriam",
]

LAST_NAMES = [
    "Anderson", "Chen", "Müller", "Okafor", "Nakamura", "Patel", "Williams",
    "García", "Kim", "Johnson", "Singh", "Rossi", "Tanaka", "Nguyen",
    "Brown", "Fernandez", "Park", "Andersen", "Sato", "Martínez",
    "Thompson", "Johansson", "Yamamoto", "Ali", "Wilson", "Dubois",
    "Watanabe", "Robinson", "Santos", "Taylor", "Kowalski", "Ito",
    "Martin", "Chakraborty", "Walker", "Hoffmann", "Davis", "Petrov",
    "Evans", "Nielsen", "Harris", "Larsson", "Clark", "Suzuki",
    "Lewis", "Schmidt", "Lee", "Moreau", "Young", "Kumar",
    "Allen", "Eriksson", "King", "Hernández", "Wright", "Ivanova",
    "Scott", "Lombardi", "Torres", "Green", "Olsen", "Nkosi",
    "Adams", "Mäkinen", "Nelson", "Osei", "Baker", "Reyes",
    "Hill", "Lindqvist", "Ramirez", "Svensson", "Campbell", "Yılmaz",
    "Mitchell", "Iversen", "Carter", "Alves", "Roberts", "Björk",
]

HISTORIC_NAME_PATTERNS = [
    ("{base} Industries", "Rebrand"),
    ("{base} Corporation", "Rebrand"),
    ("{base} Enterprises", "Merger"),
    ("{base} International Holdings", "Acquisition"),
    ("{base} Resources Inc.", "Spinoff"),
    ("{base} Global", "Rebrand"),
    ("{base} Partners", "Rebrand"),
]

ALIAS_SUFFIXES = [" Corp.", " Group", " Holdings", " International", " Inc.", " Limited"]

SUBSIDIARY_SUFFIXES = [
    " Capital", " Ventures", " International", " Holdings", " Services",
    " Solutions", " Labs", " Technologies", " Properties", " Finance",
    " Asset Management", " Leasing",
]

DEBT_INSTRUMENTS = [
    "Senior Secured Term Loan",
    "Revolving Credit Facility",
    "Senior Notes",
    "Convertible Senior Notes",
    "Senior Unsecured Notes",
    "Term Loan B",
]

DEBT_SECURITY_CLASSES = [
    "Senior Notes",
    "Senior Secured Notes",
    "Subordinated Notes",
    "Convertible Notes",
]

# Well-known institutional investors used as mock shareholders and debt holders.
INSTITUTIONAL_INVESTORS = [
    {"name": "BlackRock Inc.", "permId": "4295903645"},
    {"name": "Vanguard Group Inc.", "permId": "4295906971"},
    {"name": "State Street Corporation", "permId": "4295906529"},
    {"name": "Fidelity Management & Research", "permId": "4295904201"},
    {"name": "Capital Group Companies", "permId": "4295905732"},
    {"name": "Norges Bank Investment Management", "permId": "4295908155"},
    {"name": "T. Rowe Price Group Inc.", "permId": "4295906812"},
    {"name": "Invesco Ltd.", "permId": "4295907641"},
    {"name": "Franklin Templeton Investments", "permId": "4295905890"},
    {"name": "Wellington Management Group LLP", "permId": "4295907122"},
    {"name": "Legal & General Investment Management", "permId": "4295908201"},
    {"name": "Dimensional Fund Advisors LP", "permId": "4295907823"},
]

DEBT_HOLDERS = [
    {"name": "JPMorgan Chase & Co.", "permId": "4295907168"},
    {"name": "Goldman Sachs Group Inc.", "permId": "4295906067"},
    {"name": "Bank of America Corp.", "permId": "4295904399"},
    {"name": "Citigroup Inc.", "permId": "4295905640"},
    {"name": "HSBC Holdings PLC", "permId": "4295907285"},
    {"name": "Wells Fargo & Company", "permId": "4295905578"},
    {"name": "Morgan Stanley", "permId": "4295904846"},
    {"name": "Barclays PLC", "permId": "4295906524"},
    {"name": "Deutsche Bank AG", "permId": "4295906441"},
    {"name": "UBS Group AG", "permId": "4295907309"},
]

DEBT_TYPES = ["Credit Facility", "Bond", "Convertible"]

# Two annual snapshot dates used for all historic value arrays.
SNAPSHOT_DATES = ["2022-12-31", "2023-12-31"]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _seed(perm_id: str, offset: int = 0) -> int:
    """Return a deterministic integer seed from a permId."""
    return (int(perm_id) + offset) % 10_000


def _name_from_seed(perm_id: str, offset: int) -> str:
    s = _seed(perm_id, offset)
    first = FIRST_NAMES[s % len(FIRST_NAMES)]
    last = LAST_NAMES[(s // len(FIRST_NAMES)) % len(LAST_NAMES)]
    return f"{first} {last}"


def _strip_corporate_suffix(name: str) -> str:
    """Return the base company name with common legal suffixes removed."""
    base = name.rstrip(".")
    for suffix in (" Corp", " Group", " Holdings", " International", " Inc",
                   " Limited", " Ltd", " SA", " AG", " PLC", " LLC", " LP",
                   " Co", " NV", " BV", " SE", " SPA", " AB"):
        if base.upper().endswith(suffix.upper()):
            return base[: -len(suffix)].rstrip(" ,")
    return base


def build_source(url: str) -> dict | None:
    if not url:
        return None
    return {"name": "Company Website", "url": url, "lastAccessed": LAST_ACCESSED_DATE}


def build_description(name: str, sectors: list[str], country: str) -> str:
    if sectors and country:
        return f"{name} is a {' and '.join(sectors[:2])} company headquartered in {country}."
    if sectors:
        return f"{name} is a {' and '.join(sectors[:2])} company."
    if country:
        return f"{name} is a company headquartered in {country}."
    return f"{name} is a publicly traded company."


# ---------------------------------------------------------------------------
# Mock generators — all deterministic and seeded from permId
# ---------------------------------------------------------------------------

def mock_aliases(perm_id: str, name: str) -> list[str]:
    """Always returns exactly 2 alternate name variants."""
    base = _strip_corporate_suffix(name)
    aliases = []
    for i in range(2):
        suffix = ALIAS_SUFFIXES[_seed(perm_id, i + 1) % len(ALIAS_SUFFIXES)]
        candidate = base + suffix
        if candidate != name and candidate not in aliases:
            aliases.append(candidate)
        else:
            # Fallback: use a different suffix index
            suffix = ALIAS_SUFFIXES[_seed(perm_id, i + 10) % len(ALIAS_SUFFIXES)]
            fallback = base + suffix
            if fallback != name and fallback not in aliases:
                aliases.append(fallback)
    return aliases[:2]


def mock_founded_on(perm_id: str) -> str:
    year = 1850 + (_seed(perm_id, 42) % 146)  # 1850–1995
    return f"{year}-01-01"


def build_historic_names(perm_id: str, name: str, sources: list) -> list[dict]:
    """Returns a past name (to 2010) followed by the current name (from 2010)."""
    s = _seed(perm_id, 500)
    base = _strip_corporate_suffix(name)
    pattern, reason = HISTORIC_NAME_PATTERNS[s % len(HISTORIC_NAME_PATTERNS)]
    past_value = pattern.format(base=base)
    return [
        {
            "sources": sources,
            "value": past_value,
            "changeReason": reason,
            "from": FALLBACK_FROM_DATE,
            "to": "2010-01-01",
        },
        {
            "sources": sources,
            "value": name,
            "changeReason": None,
            "from": "2010-01-01",
            "to": None,
        },
    ]


def mock_leaders(perm_id: str, sources: list) -> list[dict]:
    """Always returns at least 3 leaders: current CEO + CFO, plus a past CEO."""
    s = _seed(perm_id, 100)

    # Current leadership: always CEO + CFO, optionally + COO
    current_titles = ["Chief Executive Officer", "Chief Financial Officer"]
    if s % 3 == 0:
        current_titles.append("Chief Operating Officer")

    leaders = []
    for slot, title in enumerate(current_titles):
        leaders.append({
            "sources": sources,
            "fullName": _name_from_seed(perm_id, 200 + slot * 37),
            "title": title,
            "from": "2015-01-01",
            "to": None,
        })

    # Past CEO
    leaders.append({
        "sources": sources,
        "fullName": _name_from_seed(perm_id, 200 + len(current_titles) * 37),
        "title": "Chief Executive Officer",
        "from": FALLBACK_FROM_DATE,
        "to": "2014-12-31",
    })

    return leaders


def build_historic_sectors(
    perm_id: str,
    sectors: list[str],
    sources: list,
    logger: logging.Logger,
) -> list[dict]:
    """Maps sectors to SIC/NAICS codes. Falls back to a mock pair if source is empty."""
    if not sectors:
        s = _seed(perm_id, 550)
        pair = FALLBACK_SECTOR_PAIRS[s % len(FALLBACK_SECTOR_PAIRS)]
        sectors = list(pair)

    result = []
    for name in sectors:
        code, system = SECTOR_TO_SIC_MAP.get(name, ("", "SIC"))
        if not code:
            logger.warning("Unmapped sector: %r — defaulting to empty code", name)
        result.append({
            "sources": sources,
            "name": name,
            "code": code,
            "system": system,
            "from": FALLBACK_FROM_DATE,
            "to": None,
        })

    # Ensure minimum 2 entries
    if len(result) == 1:
        s = _seed(perm_id, 551)
        pair = FALLBACK_SECTOR_PAIRS[s % len(FALLBACK_SECTOR_PAIRS)]
        extra_name = pair[1] if pair[0] == result[0]["name"] else pair[0]
        code, system = SECTOR_TO_SIC_MAP.get(extra_name, ("", "SIC"))
        result.append({
            "sources": sources,
            "name": extra_name,
            "code": code,
            "system": system,
            "from": FALLBACK_FROM_DATE,
            "to": None,
        })

    return result


def mock_addresses(perm_id: str, country: str, country_code: str, sources: list) -> list[dict]:
    """Always returns 2 address entries: a past address (to 2015) and a current one."""
    # Fall back to United States if no location data is available
    if not country and not country_code:
        country = "United States"
        country_code = "US"

    s = _seed(perm_id, 300)
    is_foreign = bool(country_code) and country_code != "US"
    current_city = COUNTRY_CITIES.get(country, country)
    past_city = COUNTRY_SECONDARY_CITIES.get(country, current_city)

    def _make_address(city: str, street_offset: int, from_date: str, to_date: str | None) -> dict:
        sv = _seed(perm_id, 300 + street_offset)
        return {
            "sources": sources,
            "street1": f"{10 + sv % 990} {STREET_NAMES[sv % len(STREET_NAMES)]}",
            "street2": None,
            "city": city,
            "stateOrCountry": country_code or country,
            "zipCode": None,
            "isForeignLocation": is_foreign,
            "foreignStateTerritory": None,
            "country": country,
            "countryCode": country_code,
            "from": from_date,
            "to": to_date,
        }

    return [
        _make_address(past_city, 0, FALLBACK_FROM_DATE, "2015-01-01"),
        _make_address(current_city, 13, "2015-01-01", None),
    ]


def build_corporate_relationships(
    perm_id: str,
    parent_name: str,
    subsidiaries: list[str],
    sources: list,
) -> list[dict]:
    """Builds subsidiary relationships, padding to at least 2 with mock entries."""
    subs = list(subsidiaries)
    base = _strip_corporate_suffix(parent_name).split()[0]
    slot = 0
    while len(subs) < 2:
        s = _seed(perm_id, 600 + slot * 13)
        suffix = SUBSIDIARY_SUFFIXES[s % len(SUBSIDIARY_SUFFIXES)]
        candidate = base + suffix
        if candidate not in subs:
            subs.append(candidate)
        slot += 1

    return [
        {
            "sources": sources,
            "from": FALLBACK_FROM_DATE,
            "to": None,
            "parent": {"name": parent_name, "permId": perm_id},
            "child": {"name": sub, "permId": None},
            "relationshipType": "Subsidiary",
            "ownershipPercent": None,
        }
        for sub in subs
    ]


def mock_debt(perm_id: str, sources: list) -> list[dict]:
    """Always returns exactly 2 commercial debt instruments."""
    instruments = []
    for slot in range(2):
        ds = _seed(perm_id, 400 + slot * 97)
        amount = ((ds % 20) + 1) * 50_000_000  # $50M–$1B
        rate = round(2.5 + (ds % 30) * 0.25, 2)  # 2.5%–10.0%
        maturity_year = 2025 + (ds % 10)
        instruments.append({
            "sources": sources,
            "from": "2020-01-01",
            "to": None,
            "instrumentName": DEBT_INSTRUMENTS[ds % len(DEBT_INSTRUMENTS)],
            "debtHolder": DEBT_HOLDERS[ds % len(DEBT_HOLDERS)],
            "amount": amount,
            "interestRate": rate,
            "maturityDate": f"{maturity_year}-12-31",
            "jurisdiction": "United States",
            "type": DEBT_TYPES[ds % len(DEBT_TYPES)],
        })
    return instruments


def _mock_equity_history(perm_id: str, ticker: str, sources: list) -> list[dict]:
    """Generates 2 annual equity value snapshots with shareholders."""
    s = _seed(perm_id, 700)
    outstanding_base = (s % 50 + 10) * 10_000_000  # 100M–600M shares
    snapshots = []
    for i, date in enumerate(SNAPSHOT_DATES):
        outstanding = outstanding_base + i * 5_000_000
        num_holders = 2 + (_seed(perm_id, 700 + i) % 2)  # 2–3 shareholders
        shareholders = []
        for j in range(num_holders):
            hs = _seed(perm_id, 710 + i * 100 + j * 17)
            investor = INSTITUTIONAL_INVESTORS[hs % len(INSTITUTIONAL_INVESTORS)]
            pct = (hs % 10 + 3) / 100  # 3–12% ownership
            shares_owned = int(outstanding * pct)
            share_price = 10 + (_seed(perm_id, 720 + j) % 40)  # $10–$50
            shareholders.append({
                "sources": sources,
                "asOf": date,
                "name": investor["name"],
                "permId": investor["permId"],
                "sharesOwned": shares_owned,
                "sharesMarketValue": shares_owned * share_price,
            })
        snapshots.append({
            "sources": sources,
            "asOf": date,
            "outstandingShares": outstanding,
            "shareholders": shareholders,
        })
    return snapshots


def _mock_debt_security(perm_id: str, name: str, sources: list) -> dict:
    """Generates a single HistoricDebtSecurity with 2 value snapshots."""
    s = _seed(perm_id, 800)
    # Build a bond-style symbol from the company's initials
    initials = "".join(w[0] for w in name.split()[:4] if w[0].isalpha()).upper() or "XX"
    maturity_year = 2026 + (s % 8)
    symbol = f"{initials}{maturity_year}"
    principal = ((s % 20) + 5) * 100_000_000  # $500M–$2.5B

    history = []
    for i, date in enumerate(SNAPSHOT_DATES):
        num_holders = 2 + (_seed(perm_id, 800 + i) % 2)
        debt_holders = []
        for j in range(num_holders):
            hs = _seed(perm_id, 810 + i * 100 + j * 13)
            investor = INSTITUTIONAL_INVESTORS[hs % len(INSTITUTIONAL_INVESTORS)]
            mkt_val = int(principal * ((hs % 15 + 3) / 100))  # 3–18% of principal
            debt_holders.append({
                "sources": sources,
                "asOf": date,
                "name": investor["name"],
                "permId": investor["permId"],
                "debtMarketValue": mkt_val,
            })
        history.append({
            "sources": sources,
            "asOf": date,
            "principalAmount": principal - i * 10_000_000,
            "debtHolders": debt_holders,
        })

    return {
        "sources": sources,
        "from": "2020-01-01",
        "to": None,
        "symbol": symbol,
        "class": DEBT_SECURITY_CLASSES[s % len(DEBT_SECURITY_CLASSES)],
        "jurisdiction": "United States",
        "history": history,
    }


def build_historic_securities(perm_id: str, name: str, tickers: list[str], sources: list) -> list[dict]:
    """Builds equity securities (one per ticker, with history) plus one debt security."""
    securities = []

    # Equity securities from tickers — each with 2 annual snapshots
    for ticker in tickers:
        securities.append({
            "sources": sources,
            "from": FALLBACK_FROM_DATE,
            "to": None,
            "symbol": ticker,
            "class": "Common Stock",
            "history": _mock_equity_history(perm_id, ticker, sources),
        })

    # Debt security (bond) — always present
    securities.append(_mock_debt_security(perm_id, name, sources))

    return securities


# ---------------------------------------------------------------------------
# Main transform
# ---------------------------------------------------------------------------

def transform_company(raw: dict, logger: logging.Logger) -> dict:
    perm_id: str = raw["permId"]
    name: str = raw["name"]
    url: str = raw.get("url", "")
    lei: str | None = raw.get("lei") or None
    country: str = raw.get("country", "")
    country_code: str = raw.get("countryCode", "")
    sectors: list[str] = raw.get("sectors", [])
    subsidiaries: list[str] = raw.get("subsidiaries", [])
    tickers: list[str] = raw.get("tickers", [])

    sources = [build_source(url)] if url else []
    # Use mocked sectors for description if source has none
    display_sectors = sectors or list(FALLBACK_SECTOR_PAIRS[_seed(perm_id, 550) % len(FALLBACK_SECTOR_PAIRS)])

    return {
        # CitedEntity
        "sources": sources,

        # Stable identifiers
        "permId": perm_id,
        "cik": None,
        "ein": None,
        "lei": lei,

        # Core identity
        "name": name,
        "aliases": mock_aliases(perm_id, name),
        "description": build_description(name, display_sectors, country or "United States"),
        "foundedOn": mock_founded_on(perm_id),
        "website": url or None,

        # History arrays
        "historicNames": build_historic_names(perm_id, name, sources),
        "historicLeadership": mock_leaders(perm_id, sources),
        "historicSectors": build_historic_sectors(perm_id, sectors, sources, logger),
        "historicIncorporationAddresses": mock_addresses(perm_id, country, country_code, sources),
        "historicDomicileAddresses": mock_addresses(perm_id, country, country_code, sources),
        "historicCorporateRelationships": build_corporate_relationships(
            perm_id, name, subsidiaries, sources
        ),
        "historicCommercialDebt": mock_debt(perm_id, sources),
        "historicSecurities": build_historic_securities(perm_id, name, tickers, sources),
        "historicProjectAffiliations": [],
    }


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main(logger: logging.Logger) -> None:
    """Transforms the flat companies dataset into the richer Company type shape.

    Reads the flat companies.json produced by build_dataset.py and writes
    companies2.json conforming to the Company TypeScript type defined in
    web/src/types/domain.ts. Missing fields are populated with deterministic
    mock data seeded from each company's permId.

    Environment variables:
        INPUT_FILE_PATH: Path to the source companies.json file.
        OUTPUT_FILE_PATH: Path to write the output companies2.json file.
    """
    logger.info("Parsing environment variables.")
    try:
        input_fpath = os.environ["INPUT_FILE_PATH"]
        output_fpath = os.environ["OUTPUT_FILE_PATH"]
    except KeyError as e:
        raise RuntimeError(f'Missing required environment variable "{e}".') from e

    logger.info("Loading source companies.")
    try:
        with open(input_fpath, encoding="utf-8") as f:
            companies = json.load(f)
    except FileNotFoundError as e:
        raise RuntimeError("Input file not found at the given path.") from e
    except json.JSONDecodeError as e:
        raise RuntimeError("Input file could not be parsed as JSON.") from e

    logger.info("Transforming %d companies.", len(companies))
    transformed = [transform_company(c, logger) for c in companies]

    logger.info("Writing output to %s.", output_fpath)
    Path(output_fpath).parent.mkdir(parents=True, exist_ok=True)
    with open(output_fpath, "w", encoding="utf-8") as f:
        json.dump(transformed, f, ensure_ascii=False, indent=2)

    logger.info("Done. Wrote %d records.", len(transformed))


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO, format="%(name)s - %(levelname)s - %(message)s"
    )
    logger = logging.getLogger("TRANSFORM COMPANIES")
    try:
        main(logger)
    except Exception as e:
        logger.error("An unexpected error occurred: %s.", e)
        raise SystemExit(1) from e
