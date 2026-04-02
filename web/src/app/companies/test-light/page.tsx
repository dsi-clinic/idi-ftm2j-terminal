"use client";

import { useState, useEffect } from "react";
import { Footer } from "@/components/footer";

// ── 1. LOCAL TYPES ────────────────────────────────────────────────────────────

type LonglivedEntity = { from: string; to: string | null };
type SnapshotEntity = { asOf: string };
type CitedEntity = { sources: { name: string; url: string }[] };
type CompanyRef = { name: string; permId: string | null };

type HistoricLeader = CitedEntity & LonglivedEntity & { fullName: string; title: string };
type HistoricSector = CitedEntity & LonglivedEntity & { name: string; code: string; system: string };
type HistoricAddress = CitedEntity &
  LonglivedEntity & {
    street1: string; street2: string | null; city: string; stateOrCountry: string;
    zipCode: string | null; country: string; countryCode: string;
    isForeignLocation: boolean; foreignStateTerritory: string | null;
  };
type CorporateRelationship = CitedEntity &
  LonglivedEntity & { parent: CompanyRef; child: CompanyRef; relationshipType: string; ownershipPercent: number | null };
type Shareholder = CitedEntity & SnapshotEntity & CompanyRef & { sharesOwned: number; sharesMarketValue: number };
type EquitySnapshot = CitedEntity & SnapshotEntity & { outstandingShares: number; shareholders: Shareholder[] };
type EquitySecurity = CitedEntity & LonglivedEntity & { symbol: string; class: string; history: EquitySnapshot[] };
type DebtHolder = CitedEntity & SnapshotEntity & CompanyRef & { debtMarketValue: number };
type DebtSnapshot = CitedEntity & SnapshotEntity & { principalAmount: number; debtHolders: DebtHolder[] };
type DebtSecurity = CitedEntity & LonglivedEntity & { symbol: string; class: string; jurisdiction?: string; history: DebtSnapshot[] };
type CommercialDebt = CitedEntity &
  LonglivedEntity & {
    instrumentName: string; debtHolder: CompanyRef; amount: number; interestRate: number;
    maturityDate: string; jurisdiction: string | null; type: string;
  };
type HistoricName = CitedEntity & LonglivedEntity & { value: string; changeReason: string | null };
type Company = CitedEntity & {
  permId: string; cik: string | null; ein: string | null; lei: string | null;
  name: string; aliases: string[]; description: string; foundedOn: string | null; website: string | null;
  historicNames: HistoricName[]; historicLeadership: HistoricLeader[]; historicSectors: HistoricSector[];
  historicIncorporationAddresses: HistoricAddress[]; historicDomicileAddresses: HistoricAddress[];
  historicCorporateRelationships: CorporateRelationship[]; historicCommercialDebt: CommercialDebt[];
  historicSecurities: (EquitySecurity | DebtSecurity)[];
};

function isEquity(s: EquitySecurity | DebtSecurity): s is EquitySecurity {
  return (s as EquitySecurity).history?.length > 0 && "outstandingShares" in (s as EquitySecurity).history[0];
}

// ── 2. MOCK DATA ──────────────────────────────────────────────────────────────

const COMPANY: Company = {
  sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }],
  permId: "4295896494",
  cik: null,
  ein: null,
  lei: "549300S9XF92D1X8ME43",
  name: "Anglo American PLC",
  aliases: ["Anglo American International", "Anglo American Inc."],
  description:
    "Anglo American PLC is a Mining and Natural Resources company headquartered in United Kingdom.",
  foundedOn: "1962-01-01",
  website: "https://www.angloamerican.com/",
  historicNames: [
    { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], value: "Anglo American Corporation", changeReason: "Rebrand", from: "1970-01-01", to: "2010-01-01" },
    { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], value: "Anglo American PLC", changeReason: null, from: "2010-01-01", to: null },
  ],
  historicLeadership: [
    { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], fullName: "Jonathan Taylor", title: "Chief Executive Officer", from: "2015-01-01", to: null },
    { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], fullName: "Samuel Kowalski", title: "Chief Financial Officer", from: "2015-01-01", to: null },
    { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], fullName: "Ana Kowalski", title: "Chief Operating Officer", from: "2015-01-01", to: null },
    { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], fullName: "Chiara Ito", title: "Chief Executive Officer", from: "1970-01-01", to: "2014-12-31" },
  ],
  historicSectors: [
    { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], name: "Mining", code: "1000", system: "SIC", from: "1970-01-01", to: null },
    { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], name: "Natural Resources", code: "1400", system: "SIC", from: "1970-01-01", to: null },
  ],
  historicIncorporationAddresses: [
    { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], street1: "864 Commerce Park", street2: null, city: "Manchester", stateOrCountry: "GB", zipCode: null, isForeignLocation: true, foreignStateTerritory: null, country: "United Kingdom", countryCode: "GB", from: "1970-01-01", to: "2015-01-01" },
    { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], street1: "877 Business Park", street2: null, city: "London", stateOrCountry: "GB", zipCode: null, isForeignLocation: true, foreignStateTerritory: null, country: "United Kingdom", countryCode: "GB", from: "2015-01-01", to: null },
  ],
  historicDomicileAddresses: [
    { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], street1: "864 Commerce Park", street2: null, city: "Manchester", stateOrCountry: "GB", zipCode: null, isForeignLocation: true, foreignStateTerritory: null, country: "United Kingdom", countryCode: "GB", from: "1970-01-01", to: "2015-01-01" },
    { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], street1: "877 Business Park", street2: null, city: "London", stateOrCountry: "GB", zipCode: null, isForeignLocation: true, foreignStateTerritory: null, country: "United Kingdom", countryCode: "GB", from: "2015-01-01", to: null },
  ],
  historicCorporateRelationships: [
    { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], from: "1970-01-01", to: null, parent: { name: "Anglo American PLC", permId: "4295896494" }, child: { name: "De Beers", permId: null }, relationshipType: "Subsidiary", ownershipPercent: null },
    { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], from: "1970-01-01", to: null, parent: { name: "Anglo American PLC", permId: "4295896494" }, child: { name: "Anglo American Platinum", permId: null }, relationshipType: "Subsidiary", ownershipPercent: null },
    { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], from: "1970-01-01", to: null, parent: { name: "Anglo American PLC", permId: "4295896494" }, child: { name: "Kumba Iron Ore", permId: null }, relationshipType: "Subsidiary", ownershipPercent: null },
  ],
  historicCommercialDebt: [
    { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], from: "2020-01-01", to: null, instrumentName: "Senior Secured Term Loan", debtHolder: { name: "HSBC Holdings PLC", permId: "4295907285" }, amount: 750000000, interestRate: 8.5, maturityDate: "2029-12-31", jurisdiction: "United States", type: "Credit Facility" },
    { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], from: "2020-01-01", to: null, instrumentName: "Revolving Credit Facility", debtHolder: { name: "Goldman Sachs Group Inc.", permId: "4295906067" }, amount: 600000000, interestRate: 2.75, maturityDate: "2026-12-31", jurisdiction: "United States", type: "Bond" },
  ],
  historicSecurities: [
    {
      sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }],
      from: "1970-01-01", to: null, symbol: "NGLOY", class: "Common Stock",
      history: [
        {
          sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }],
          asOf: "2022-12-31", outstandingShares: 540000000,
          shareholders: [
            { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], asOf: "2022-12-31", name: "Capital Group Companies", permId: "4295905732", sharesOwned: 37800000, sharesMarketValue: 907200000 },
            { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], asOf: "2022-12-31", name: "Wellington Management Group LLP", permId: "4295907122", sharesOwned: 21600000, sharesMarketValue: 540000000 },
          ],
        },
        {
          sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }],
          asOf: "2023-12-31", outstandingShares: 545000000,
          shareholders: [
            { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], asOf: "2023-12-31", name: "Franklin Templeton Investments", permId: "4295905890", sharesOwned: 38150000, sharesMarketValue: 915600000 },
            { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], asOf: "2023-12-31", name: "Vanguard Group Inc.", permId: "4295906971", sharesOwned: 21800000, sharesMarketValue: 545000000 },
            { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], asOf: "2023-12-31", name: "T. Rowe Price Group Inc.", permId: "4295906812", sharesOwned: 59950000, sharesMarketValue: 1558700000 },
          ],
        },
      ],
    },
    {
      sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }],
      from: "2020-01-01", to: null, symbol: "AAP2032", class: "Subordinated Notes", jurisdiction: "United States",
      history: [
        {
          sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }],
          asOf: "2022-12-31", principalAmount: 1900000000,
          debtHolders: [
            { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], asOf: "2022-12-31", name: "Franklin Templeton Investments", permId: "4295905890", debtMarketValue: 323000000 },
            { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], asOf: "2022-12-31", name: "Wellington Management Group LLP", permId: "4295907122", debtMarketValue: 285000000 },
          ],
        },
        {
          sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }],
          asOf: "2023-12-31", principalAmount: 1890000000,
          debtHolders: [
            { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], asOf: "2023-12-31", name: "BlackRock Inc.", permId: "4295903645", debtMarketValue: 228000000 },
            { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], asOf: "2023-12-31", name: "Vanguard Group Inc.", permId: "4295906971", debtMarketValue: 190000000 },
            { sources: [{ name: "Company Website", url: "https://www.angloamerican.com/" }], asOf: "2023-12-31", name: "State Street Corporation", permId: "4295906529", debtMarketValue: 152000000 },
          ],
        },
      ],
    },
  ],
};

// ── 3. HELPER FUNCTIONS ───────────────────────────────────────────────────────

const TODAY = "2026-03-23";

function fmtDate(s: string | null): string {
  if (!s) return "—";
  const d = new Date(s + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}
function fmtYear(s: string | null): string { return s ? s.slice(0, 4) : "Present"; }
function fmtCurrency(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}
function fmtShares(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return `${n}`;
}
function fmtPct(n: number | null): string { return n === null ? "Undisclosed" : `${n.toFixed(1)}%`; }
function isActive(e: LonglivedEntity): boolean { return e.to === null; }
function currentOf<T extends LonglivedEntity>(arr: T[]): T[] { return arr.filter((e) => e.to === null); }
function blendedRate(debts: CommercialDebt[]): string {
  const active = debts.filter(isActive);
  if (!active.length) return "—";
  const totalAmt = active.reduce((s, d) => s + d.amount, 0);
  const weighted = active.reduce((s, d) => s + d.interestRate * d.amount, 0);
  return `${(weighted / totalAmt).toFixed(2)}%`;
}
function nextMaturity(debts: CommercialDebt[]): string {
  const active = debts.filter(isActive).filter((d) => d.maturityDate > TODAY).sort((a, b) => a.maturityDate.localeCompare(b.maturityDate));
  return active.length ? fmtDate(active[0].maturityDate) : "—";
}
function totalDebt(debts: CommercialDebt[]): string {
  return fmtCurrency(debts.filter(isActive).reduce((s, d) => s + d.amount, 0));
}

// ── 4. DESIGN TOKENS ─────────────────────────────────────────────────────────

const BG        = "#0d0d0d";
const SURFACE   = "#141414";
const SURF_LOW  = "#1a1a1a";
const SURF_CARD = "#1f1f1f";
const BORDER    = "rgba(255,255,255,0.06)";
const BORDER_MD = "rgba(255,255,255,0.1)";
const GREEN     = "#00e639";
const GREEN_DIM = "#10b981";
const GREEN_FNT = "rgba(0,230,57,0.07)";
const TEXT      = "#d1d5db";
const TEXT_DIM  = "#818c9a";
const TEXT_MUT  = "#4b5563";
const AMBER     = "#fbbf24";

const BEBAS = "'Bebas Neue', sans-serif";
const MONO  = "'DM Mono', monospace";
const SYNE  = "'Syne', sans-serif";

const µLabel: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: "0.58rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  color: TEXT_MUT,
};

// ── 5. PRIMITIVE COMPONENTS ───────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
      <div style={{ width: 2, height: 18, background: GREEN, flexShrink: 0 }} />
      <span style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", color: GREEN }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span style={{
      fontFamily: MONO, fontSize: "0.57rem", letterSpacing: "0.18em", textTransform: "uppercase",
      padding: "3px 10px",
      background: active ? GREEN_FNT : "rgba(255,255,255,0.03)",
      color: active ? GREEN : TEXT_MUT,
      border: `1px solid ${active ? "rgba(0,230,57,0.25)" : BORDER}`,
    }}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function PermIdBadge({ permId }: { permId: string | null }) {
  return (
    <span style={{
      fontFamily: MONO, fontSize: "0.57rem", letterSpacing: "0.08em",
      padding: "2px 7px",
      border: `1px solid ${permId ? "rgba(0,230,57,0.2)" : "rgba(251,191,36,0.25)"}`,
      color: permId ? GREEN_DIM : AMBER,
      background: permId ? "rgba(0,230,57,0.04)" : "rgba(251,191,36,0.04)",
    }}>
      {permId ? "Resolved" : "Unresolved"}
    </span>
  );
}

function SourceLink({ source }: { source: { name: string; url: string } }) {
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer" style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontFamily: MONO, fontSize: "0.57rem", color: TEXT_MUT, textDecoration: "none", letterSpacing: "0.06em", transition: "color 0.15s",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.color = GREEN_DIM)}
      onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_MUT)}
    >
      {source.name}
      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
        <path d="M3 3h5v5M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </a>
  );
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: MONO, fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase",
      padding: "5px 14px",
      border: `1px solid ${active ? "rgba(0,230,57,0.3)" : BORDER}`,
      background: active ? GREEN_FNT : "transparent",
      color: active ? GREEN : TEXT_MUT,
      cursor: "pointer", transition: "all 0.15s",
    }}>
      {label}
    </button>
  );
}

function TypePill({ type }: { type: string }) {
  const map: Record<string, { bg: string; border: string; color: string }> = {
    Bond:             { bg: "rgba(96,165,250,0.07)",  border: "rgba(96,165,250,0.3)",  color: "#60a5fa" },
    Convertible:      { bg: "rgba(167,139,250,0.07)", border: "rgba(167,139,250,0.3)", color: "#a78bfa" },
    "Credit Facility":{ bg: "rgba(251,191,36,0.07)",  border: "rgba(251,191,36,0.3)",  color: AMBER },
  };
  const s = map[type] ?? { bg: GREEN_FNT, border: "rgba(0,230,57,0.25)", color: GREEN_DIM };
  return (
    <span style={{ fontFamily: MONO, fontSize: "0.57rem", letterSpacing: "0.1em", padding: "2px 8px", border: `1px solid ${s.border}`, background: s.bg, color: s.color }}>
      {type}
    </span>
  );
}

function InfoTooltip({ text }: { text: string }) {
  const [vis, setVis] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "help" }}
      onMouseEnter={() => setVis(true)} onMouseLeave={() => setVis(false)}>
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ color: TEXT_MUT }}>
        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
        <line x1="6" y1="5.2" x2="6" y2="8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="6" cy="3.6" r="0.65" fill="currentColor" />
      </svg>
      {vis && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          width: 230, background: "#091a0f", border: "1px solid rgba(0,230,57,0.18)",
          padding: "10px 13px", fontFamily: SYNE, fontSize: "0.68rem", color: "#a7f3d0",
          lineHeight: 1.65, zIndex: 400, pointerEvents: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
        }}>
          <span style={{ position: "absolute", top: -5, left: "50%", transform: "translateX(-50%)", width: 8, height: 5, background: "#091a0f", borderTop: "1px solid rgba(0,230,57,0.18)", borderLeft: "1px solid rgba(0,230,57,0.18)", rotate: "45deg", display: "block" }} />
          {text}
        </div>
      )}
    </span>
  );
}

// ── 6. COMPANY HEADER ─────────────────────────────────────────────────────────

function CompanyHeader({ company }: { company: Company }) {
  const currentDomicile = currentOf(company.historicDomicileAddresses)[0];
  const currentSectors  = currentOf(company.historicSectors);
  const aliases         = company.aliases.filter((a) => a !== company.name);
  const [copied, setCopied] = useState<string | null>(null);

  function handleCopy(label: string, value: string) {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }

  const identifiers = [
    { label: "PERM ID", value: company.permId,  info: "Permanent Identifier (PermID) — a globally unique, stable ID assigned to financial entities by LSEG (formerly Refinitiv / Thomson Reuters)." },
    { label: "LEI",     value: company.lei,      info: "Legal Entity Identifier — a 20-character ISO 17442 code uniquely identifying legal entities in financial transactions, issued by GLEIS." },
    { label: "CIK",     value: company.cik,      info: "Central Index Key — a unique number assigned by the U.S. SEC to every company filing disclosures through EDGAR." },
    { label: "EIN",     value: company.ein,      info: "Employer Identification Number — a 9-digit tax ID assigned by the IRS to identify a business entity for federal tax purposes." },
  ];

  return (
    <div>
      {/* ── PHOTO BANNER ─────────────────────────────────────────────────── */}
      <div style={{ position: "relative", height: 440, overflow: "hidden", margin: "0 -48px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/london.jpg" alt="" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center 40%",
          filter: "brightness(0.32) saturate(0.6)",
        }} />
        {/* Overlays */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 35%, ${BG} 100%)` }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 55%)" }} />
        {/* Green scan line at top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent 0%, ${GREEN} 35%, transparent 100%)`, opacity: 0.5 }} />

        {/* Action buttons — top right */}
        <div style={{ position: "absolute", top: 22, right: 48, display: "flex", gap: 10, zIndex: 4 }}>
          {[
            { title: "Download", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
            { title: "Share",    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> },
            { title: "Feedback", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
          ].map(({ title, icon }) => (
            <button key={title} title={title} style={{
              display: "flex", alignItems: "center", gap: 6,
              border: `1px solid ${BORDER_MD}`, background: "rgba(0,0,0,0.55)",
              color: TEXT_DIM, cursor: "pointer", padding: "6px 14px",
              backdropFilter: "blur(10px)", fontFamily: MONO,
              fontSize: "0.57rem", letterSpacing: "0.14em", transition: "all 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = GREEN; e.currentTarget.style.borderColor = "rgba(0,230,57,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_DIM; e.currentTarget.style.borderColor = BORDER_MD; }}
            >
              {icon}
              <span style={{ textTransform: "uppercase" }}>{title}</span>
            </button>
          ))}
        </div>

        {/* Company identity — bottom */}
        <div style={{ position: "absolute", bottom: 44, left: 48, right: 48, zIndex: 4 }}>
          {/* Eyebrow row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <span style={{
              fontFamily: MONO, fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase",
              color: "#000", background: GREEN, padding: "3px 10px",
            }}>
              Active Intelligence
            </span>
            <span style={{ fontFamily: MONO, fontSize: "0.56rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>
              [REF: {company.permId}]
            </span>
            {company.foundedOn && (
              <span style={{ fontFamily: MONO, fontSize: "0.56rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>
                EST. {fmtYear(company.foundedOn)}
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h1 style={{
                fontFamily: BEBAS, fontSize: "clamp(3rem, 6vw, 5.8rem)", fontWeight: 400,
                lineHeight: 0.88, color: "#ffffff", margin: "0 0 14px",
                letterSpacing: "0.02em", textShadow: "0 2px 40px rgba(0,0,0,0.95)",
              }}>
                {company.name}
              </h1>
              {aliases.length > 0 && (
                <div style={{ fontFamily: MONO, fontSize: "0.68rem", color: "rgba(0,230,57,0.55)", marginBottom: 12, letterSpacing: "0.04em" }}>
                  AKA: {aliases.join("  ·  ")}
                </div>
              )}
              {currentSectors.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {currentSectors.map((s, i) => (
                    <span key={i} style={{
                      fontFamily: MONO, fontSize: "0.57rem", letterSpacing: "0.1em",
                      padding: "4px 12px", border: "1px solid rgba(0,230,57,0.35)",
                      color: "rgba(0,230,57,0.75)", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
                    }}>
                      {s.name}  ·  {s.system} {s.code}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0, marginBottom: 4 }}>
              <StatusBadge active={true} />
              {currentDomicile && (
                <span style={{ fontFamily: MONO, fontSize: "0.62rem", color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em" }}>
                  {currentDomicile.city}, {currentDomicile.country}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── IDENTIFIERS STRIP ────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", margin: "0 -48px", background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
        {identifiers.filter(({ value }) => value !== null).map(({ label, value, info }, i) => (
          <div key={i} style={{ padding: `14px 24px 14px ${i === 0 ? 48 : 24}px`, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={µLabel}>{label}</span>
              <InfoTooltip text={info} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: "0.74rem", color: GREEN_DIM, letterSpacing: "0.04em" }}>{value}</span>
              <button onClick={() => handleCopy(label, value!)} title="Copy"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", color: copied === label ? GREEN : TEXT_MUT, transition: "color 0.15s" }}
                onMouseEnter={(e) => { if (copied !== label) e.currentTarget.style.color = TEXT_DIM; }}
                onMouseLeave={(e) => { if (copied !== label) e.currentTarget.style.color = TEXT_MUT; }}
              >
                {copied === label
                  ? <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><polyline points="2,6.5 5,9.5 10,3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  : <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="4" y="1" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1" /><path d="M2 3h1.5v7.5H8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>
                }
              </button>
            </div>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        {company.website && (
          <div style={{ padding: "14px 48px 14px 24px", borderLeft: `1px solid ${BORDER}`, display: "flex", alignItems: "center" }}>
            <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ fontFamily: MONO, fontSize: "0.7rem", color: TEXT_DIM, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = GREEN_DIM)}
              onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_DIM)}
            >
              {company.website.replace(/^https?:\/\//, "")}
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M3 3h5v5M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
            </a>
          </div>
        )}
      </div>

      {/* ── DESCRIPTION + KEY FACTS ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 48, padding: "44px 0 56px" }}>
        <div>
          <p style={{ fontFamily: SYNE, fontWeight: 500, fontSize: "0.92rem", lineHeight: 1.85, color: TEXT_DIM, margin: "0 0 32px" }}>
            {company.description}
          </p>
          {company.historicNames.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ ...µLabel, marginBottom: 12 }}>Name History</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {company.historicNames.map((n, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ fontFamily: SYNE, fontWeight: 600, fontSize: "0.82rem", color: TEXT, minWidth: 220 }}>{n.value}</span>
                    <span style={{ fontFamily: MONO, fontSize: "0.6rem", color: TEXT_MUT }}>{fmtYear(n.from)} – {fmtYear(n.to)}</span>
                    {n.changeReason && (
                      <span style={{ fontFamily: MONO, fontSize: "0.53rem", padding: "1px 7px", border: `1px solid ${BORDER}`, color: TEXT_MUT, letterSpacing: "0.1em" }}>{n.changeReason}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span style={µLabel}>Sources</span>
            {company.sources.map((src, i) => <SourceLink key={i} source={src} />)}
          </div>
        </div>

        {/* Key facts card */}
        <div style={{ background: SURF_LOW, alignSelf: "start", border: `1px solid ${BORDER}` }}>
          <div style={{ padding: "12px 20px", background: SURF_CARD }}>
            <span style={µLabel}>Company Facts</span>
          </div>
          {[
            { label: "Founded", value: company.foundedOn ? fmtDate(company.foundedOn) : null },
            { label: "Domicile", value: currentDomicile ? `${currentDomicile.city}, ${currentDomicile.country}` : null },
          ].filter(({ value }) => value).map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 20px", borderBottom: `1px solid ${BORDER}`, gap: 16 }}>
              <span style={µLabel}>{label}</span>
              <span style={{ fontFamily: MONO, fontSize: "0.7rem", color: TEXT, textAlign: "right" }}>{value}</span>
            </div>
          ))}
          <div style={{ padding: "14px 20px 16px" }}>
            <div style={{ ...µLabel, marginBottom: 10 }}>Sectors</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {currentSectors.map((s, i) => (
                <span key={i} style={{ fontFamily: MONO, fontSize: "0.58rem", letterSpacing: "0.08em", padding: "4px 10px", border: `1px solid ${BORDER}`, color: TEXT_DIM, display: "inline-block" }}>
                  {s.name} · {s.system} {s.code}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 7. LEADERSHIP GANTT ───────────────────────────────────────────────────────

const CHART_L = 225, CHART_R = 990, CHART_W = CHART_R - CHART_L;
const AXIS_H = 36, ROW_H = 42;

function leaderColor(title: string): string {
  if (/chief exec|ceo/i.test(title)) return GREEN;
  if (/chief fin|cfo/i.test(title)) return "#60a5fa";
  if (/chief oper|coo/i.test(title)) return AMBER;
  if (/general counsel|legal/i.test(title)) return "#a78bfa";
  return GREEN_DIM;
}

function LeadershipGantt({ leaders }: { leaders: HistoricLeader[] }) {
  const minMs    = Math.min(...leaders.map((l) => new Date(l.from).getTime()));
  const minDate  = new Date(minMs);
  const maxDate  = new Date(TODAY);
  const totalMs  = maxDate.getTime() - minDate.getTime();

  function dateToX(s: string): number {
    return CHART_L + ((new Date(s).getTime() - minDate.getTime()) / totalMs) * CHART_W;
  }

  const years: number[] = [];
  for (let y = minDate.getFullYear(); y <= maxDate.getFullYear(); y++) years.push(y);

  const sorted      = [...leaders].sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());
  const totalHeight = AXIS_H + sorted.length * ROW_H + 20;
  const todayX      = dateToX(TODAY);

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ background: SURF_LOW }}>
        <svg viewBox={`0 0 1000 ${totalHeight}`} preserveAspectRatio="xMinYMid meet" style={{ width: "100%", height: "auto", display: "block" }}>
          {years.map((y) => {
            const x = dateToX(`${y}-01-01`);
            if (x < CHART_L) return null;
            return (
              <g key={y}>
                <line x1={x} y1={AXIS_H - 8} x2={x} y2={totalHeight - 16} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                {y % 5 === 0 && <text x={x + 2} y={AXIS_H - 12} fontSize="7" fill={TEXT_MUT} fontFamily="monospace">{y}</text>}
              </g>
            );
          })}
          <line x1={todayX} y1={AXIS_H} x2={todayX} y2={totalHeight - 10} stroke="rgba(0,230,57,0.35)" strokeWidth="1" strokeDasharray="4 3" />
          <text x={todayX + 3} y={AXIS_H + 9} fontSize="6" fill="rgba(0,230,57,0.55)" fontFamily="monospace">TODAY</text>
          {sorted.map((leader, i) => {
            const rowY  = AXIS_H + i * ROW_H;
            const barY  = rowY + 12;
            const barH  = ROW_H - 22;
            const barX  = Math.max(dateToX(leader.from), CHART_L);
            const barW  = Math.max(dateToX(leader.to ?? TODAY) - barX, 2);
            const color = leaderColor(leader.title);
            const clip  = `clip-${i}`;
            return (
              <g key={i}>
                <line x1={0} y1={rowY} x2={1000} y2={rowY} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                <text x={CHART_L - 8} y={barY + barH / 2 + 1} textAnchor="end" fontSize="8.5" fill={TEXT} fontFamily="monospace" dominantBaseline="middle">{leader.fullName}</text>
                <text x={CHART_L - 8} y={barY + barH / 2 + 11} textAnchor="end" fontSize="6" fill={TEXT_MUT} fontFamily="monospace" dominantBaseline="middle">{leader.title}</text>
                <clipPath id={clip}><rect x={barX} y={barY} width={barW} height={barH} /></clipPath>
                <rect x={barX} y={barY} width={barW} height={barH} fill={color} opacity="0.65">
                  <title>{`${leader.fullName} — ${leader.title}\n${fmtDate(leader.from)} → ${leader.to ? fmtDate(leader.to) : "Present"}`}</title>
                </rect>
                {barW > 60 && (
                  <text x={barX + 6} y={barY + barH / 2} fontSize="6.5" fill="#000" fontFamily="monospace" dominantBaseline="middle" clipPath={`url(#${clip})`} opacity="0.8">
                    {fmtYear(leader.from)}–{fmtYear(leader.to)}
                  </text>
                )}
              </g>
            );
          })}
          <line x1={CHART_L} y1={AXIS_H} x2={CHART_R} y2={AXIS_H} stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
        </svg>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
        {[{ label: "CEO / Exec", color: GREEN }, { label: "CFO", color: "#60a5fa" }, { label: "COO", color: AMBER }, { label: "Other", color: GREEN_DIM }].map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: "0.57rem", color: TEXT_MUT }}>
            <div style={{ width: 12, height: 7, background: color, opacity: 0.7 }} />{label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 8. SUBSIDIARIES TABLE ─────────────────────────────────────────────────────

function SubsidiariesTable({ relationships, companyPermId }: { relationships: CorporateRelationship[]; companyPermId: string }) {
  const [filter, setFilter] = useState<"active" | "all">("active");
  const rows = relationships.filter((r) => r.parent.permId === companyPermId).filter((r) => filter === "all" || r.to === null);

  const TH: React.CSSProperties = { fontFamily: MONO, fontWeight: 400, fontSize: "0.57rem", letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT_MUT, padding: "9px 12px", textAlign: "left", borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap", background: SURF_CARD };
  const TD: React.CSSProperties = { fontFamily: SYNE, fontWeight: 500, fontSize: "0.8rem", padding: "10px 12px", borderBottom: `1px solid ${BORDER}`, verticalAlign: "middle", color: TEXT };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <TabBtn label="Active" active={filter === "active"} onClick={() => setFilter("active")} />
        <TabBtn label="All"    active={filter === "all"}    onClick={() => setFilter("all")} />
      </div>
      {rows.length === 0 ? (
        <div style={{ fontFamily: MONO, fontSize: "0.72rem", color: TEXT_MUT, padding: "24px 0" }}>No relationships found.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["#", "Name", "Type", "Since", "Status", "Ownership", "PermID", "Source"].map((h) => <th key={h} style={TH}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="hover-row">
                  <td style={{ ...TD, color: TEXT_MUT, fontSize: "0.6rem", fontFamily: MONO }}>{String(i + 1).padStart(2, "0")}</td>
                  <td style={TD}>{r.child.name}</td>
                  <td style={{ ...TD, color: TEXT_MUT, fontSize: "0.63rem", fontFamily: MONO, letterSpacing: "0.06em" }}>{r.relationshipType}</td>
                  <td style={{ ...TD, fontFamily: MONO, fontSize: "0.68rem", color: TEXT_DIM }}>{fmtDate(r.from)}</td>
                  <td style={TD}><StatusBadge active={isActive(r)} /></td>
                  <td style={{ ...TD, fontFamily: MONO, fontSize: "0.7rem", color: r.ownershipPercent === null ? AMBER : TEXT_DIM }}>{fmtPct(r.ownershipPercent)}</td>
                  <td style={TD}><PermIdBadge permId={r.child.permId} /></td>
                  <td style={TD}>{r.sources[0] && <SourceLink source={r.sources[0]} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── 9. ADDRESSES PANEL ────────────────────────────────────────────────────────

function AddressesPanel({ inc, dom }: { inc: HistoricAddress[]; dom: HistoricAddress[] }) {
  const [tab, setTab] = useState<"incorporation" | "domicile">("incorporation");
  const [idx, setIdx] = useState(0);
  const addresses = tab === "incorporation" ? inc : dom;
  const sorted    = [...addresses].sort((a, b) => { if (a.to === null) return -1; if (b.to === null) return 1; return b.to.localeCompare(a.to); });
  const selected  = sorted[idx];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <TabBtn label="Incorporation" active={tab === "incorporation"} onClick={() => { setTab("incorporation"); setIdx(0); }} />
        <TabBtn label="Domicile"      active={tab === "domicile"}      onClick={() => { setTab("domicile");      setIdx(0); }} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {sorted.map((addr, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{
            fontFamily: MONO, fontSize: "0.58rem", letterSpacing: "0.08em",
            padding: "6px 14px", border: `1px solid ${i === idx ? "rgba(0,230,57,0.3)" : BORDER}`,
            background: i === idx ? GREEN_FNT : "transparent", color: i === idx ? GREEN : TEXT_MUT, cursor: "pointer", position: "relative",
          }}>
            {fmtYear(addr.from)} – {fmtYear(addr.to)}
            {addr.to === null && <span style={{ position: "absolute", top: -6, right: -4, fontSize: "0.46rem", background: GREEN, color: "#000", padding: "1px 4px", letterSpacing: "0.1em" }}>NOW</span>}
          </button>
        ))}
      </div>
      {selected && (
        <div style={{ background: SURF_LOW, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", border: `1px solid ${BORDER}` }}>
          <div>
            <div style={{ fontFamily: SYNE, fontWeight: 600, fontSize: "0.88rem", color: TEXT, lineHeight: 1.8 }}>
              <div>{selected.street1}</div>
              {selected.street2 && <div>{selected.street2}</div>}
              <div>{selected.city}{selected.stateOrCountry && selected.stateOrCountry !== selected.city ? `, ${selected.stateOrCountry}` : ""}{selected.zipCode ? `  ${selected.zipCode}` : ""}</div>
              <div>{selected.country}</div>
            </div>
            <div style={{ fontFamily: MONO, fontSize: "0.58rem", color: TEXT_MUT, marginTop: 10 }}>
              {fmtDate(selected.from)} → {selected.to ? fmtDate(selected.to) : "Present"}
            </div>
          </div>
          <div>{selected.sources[0] && <SourceLink source={selected.sources[0]} />}</div>
        </div>
      )}
    </div>
  );
}

// ── 10. SECURITIES SECTION ────────────────────────────────────────────────────

function Sparkline({ history, isEq, selectedDate }: { history: (EquitySnapshot | DebtSnapshot)[]; isEq: boolean; selectedDate: string }) {
  if (!history.length) return null;
  const W = 400, H = 52;
  const vals  = history.map((h) => isEq ? (h as EquitySnapshot).outstandingShares : (h as DebtSnapshot).principalAmount);
  const minV  = Math.min(...vals), maxV = Math.max(...vals), range = maxV - minV || 1;
  const pts   = history.map((h, i) => {
    const x = history.length === 1 ? W / 2 : (i / (history.length - 1)) * W;
    const v = isEq ? (h as EquitySnapshot).outstandingShares : (h as DebtSnapshot).principalAmount;
    return { x, y: H - 4 - ((v - minV) / range) * (H - 8), date: h.asOf };
  });
  const poly  = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const fill  = `0,${H} ${poly} ${W},${H}`;
  const selPt = pts.find((p) => p.date === selectedDate);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: `${H}px`, display: "block" }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={GREEN} stopOpacity="0.18" />
          <stop offset="100%" stopColor={GREEN} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <polygon points={fill} fill="url(#sg)" />
      {history.length > 1 && <polyline points={poly} fill="none" stroke={GREEN_DIM} strokeWidth="1.5" />}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.date === selectedDate ? 3.5 : 2.5}
          fill={p.date === selectedDate ? GREEN : GREEN_DIM}
          stroke={p.date === selectedDate ? "rgba(0,230,57,0.4)" : "none"} strokeWidth="2" />
      ))}
      {selPt && <line x1={selPt.x} y1={0} x2={selPt.x} y2={H} stroke="rgba(0,230,57,0.18)" strokeWidth="1" strokeDasharray="3 2" />}
    </svg>
  );
}

function SecuritiesSection({ securities }: { securities: (EquitySecurity | DebtSecurity)[] }) {
  const [secIdx, setSecIdx]   = useState(0);
  const [snapDate, setSnap]   = useState<string>(() => securities[0]?.history?.[0]?.asOf ?? "");

  useEffect(() => { setSnap(securities[secIdx]?.history?.[0]?.asOf ?? ""); }, [secIdx, securities]);

  if (!securities.length) return null;
  const sec  = securities[secIdx];
  const eq   = isEquity(sec);
  const snap = sec.history.find((h) => h.asOf === snapDate);

  const TH: React.CSSProperties = { fontFamily: MONO, fontWeight: 400, fontSize: "0.57rem", letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT_MUT, padding: "9px 12px", textAlign: "left", borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap", background: SURF_CARD };
  const TD: React.CSSProperties = { fontFamily: SYNE, fontWeight: 500, fontSize: "0.8rem", padding: "10px 12px", borderBottom: `1px solid ${BORDER}`, verticalAlign: "middle", color: TEXT };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {securities.map((s, i) => <TabBtn key={i} label={s.symbol} active={secIdx === i} onClick={() => setSecIdx(i)} />)}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontFamily: BEBAS, fontSize: "2.8rem", color: TEXT, letterSpacing: "0.04em", lineHeight: 1 }}>{sec.symbol}</span>
        <span style={{ fontFamily: SYNE, fontWeight: 600, fontSize: "0.8rem", color: TEXT_DIM }}>{sec.class}</span>
        {"jurisdiction" in sec && sec.jurisdiction && <span style={{ fontFamily: MONO, fontSize: "0.62rem", color: TEXT_MUT }}>{sec.jurisdiction}</span>}
        <span style={{ fontFamily: MONO, fontSize: "0.6rem", color: TEXT_MUT }}>{fmtYear(sec.from)} – {fmtYear(sec.to)}</span>
      </div>
      <div style={{ background: SURF_LOW, padding: "10px 0", marginBottom: 12, border: `1px solid ${BORDER}` }}>
        <Sparkline history={sec.history} isEq={eq} selectedDate={snapDate} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {sec.history.map((h, i) => (
          <button key={i} onClick={() => setSnap(h.asOf)} style={{ fontFamily: MONO, fontSize: "0.58rem", letterSpacing: "0.1em", padding: "4px 12px", border: `1px solid ${h.asOf === snapDate ? "rgba(0,230,57,0.3)" : BORDER}`, background: h.asOf === snapDate ? GREEN_FNT : "transparent", color: h.asOf === snapDate ? GREEN : TEXT_MUT, cursor: "pointer" }}>
            {h.asOf.slice(0, 7)}
          </button>
        ))}
      </div>
      {snap && (
        <div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: BEBAS, fontSize: "2.2rem", color: TEXT, lineHeight: 1.1 }}>
              {eq ? fmtShares((snap as EquitySnapshot).outstandingShares) : fmtCurrency((snap as DebtSnapshot).principalAmount)}
            </div>
            <div style={{ ...µLabel, marginTop: 4 }}>
              {eq ? "Shares Outstanding" : "Principal Outstanding"} · as of {fmtDate(snap.asOf)}
            </div>
          </div>
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, background: SURF_CARD, zIndex: 1 }}>
                <tr>
                  <th style={TH}>#</th>
                  <th style={TH}>Name</th>
                  <th style={TH}>PermID</th>
                  {eq && <th style={TH}>Shares Owned</th>}
                  <th style={TH}>Market Value</th>
                  <th style={TH}>Source</th>
                </tr>
              </thead>
              <tbody>
                {eq
                  ? (snap as EquitySnapshot).shareholders.map((sh, i) => (
                    <tr key={i} className="hover-row">
                      <td style={{ ...TD, color: TEXT_MUT, fontSize: "0.6rem" }}>{i + 1}</td>
                      <td style={TD}>
                        {sh.permId ? <a href={`/companies/${sh.permId}`} style={{ color: TEXT, textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.color = GREEN_DIM)} onMouseLeave={(e) => (e.currentTarget.style.color = TEXT)}>{sh.name}</a> : sh.name}
                      </td>
                      <td style={TD}><PermIdBadge permId={sh.permId} /></td>
                      <td style={{ ...TD, fontFamily: MONO, fontSize: "0.7rem", color: TEXT_DIM }}>{fmtShares(sh.sharesOwned)}</td>
                      <td style={{ ...TD, fontFamily: MONO, fontSize: "0.7rem", color: TEXT_DIM }}>{fmtCurrency(sh.sharesMarketValue)}</td>
                      <td style={TD}>{sh.sources[0] && <SourceLink source={sh.sources[0]} />}</td>
                    </tr>
                  ))
                  : (snap as DebtSnapshot).debtHolders.map((dh, i) => (
                    <tr key={i} className="hover-row">
                      <td style={{ ...TD, color: TEXT_MUT, fontSize: "0.6rem" }}>{i + 1}</td>
                      <td style={TD}>
                        {dh.permId ? <a href={`/companies/${dh.permId}`} style={{ color: TEXT, textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.color = GREEN_DIM)} onMouseLeave={(e) => (e.currentTarget.style.color = TEXT)}>{dh.name}</a> : dh.name}
                      </td>
                      <td style={TD}><PermIdBadge permId={dh.permId} /></td>
                      <td style={{ ...TD, fontFamily: MONO, fontSize: "0.7rem", color: TEXT_DIM }}>{fmtCurrency(dh.debtMarketValue)}</td>
                      <td style={TD}>{dh.sources[0] && <SourceLink source={dh.sources[0]} />}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 11. COMMERCIAL DEBT SECTION ───────────────────────────────────────────────

function CommercialDebtSection({ debts }: { debts: CommercialDebt[] }) {
  const TH: React.CSSProperties = { fontFamily: MONO, fontWeight: 400, fontSize: "0.57rem", letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT_MUT, padding: "9px 12px", textAlign: "left", borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap", background: SURF_CARD };
  const TD: React.CSSProperties = { fontFamily: SYNE, fontWeight: 500, fontSize: "0.8rem", padding: "10px 12px", borderBottom: `1px solid ${BORDER}`, verticalAlign: "middle", color: TEXT };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: SURF_LOW, marginBottom: 28, border: `1px solid ${BORDER}` }}>
        {[
          { label: "Total Outstanding", value: totalDebt(debts) },
          { label: "Next Maturity",     value: nextMaturity(debts) },
          { label: "Blended Rate",      value: blendedRate(debts) },
        ].map(({ label, value }, i) => (
          <div key={i} style={{ padding: "22px 28px", borderRight: i < 2 ? `1px solid ${BORDER}` : undefined }}>
            <div style={µLabel}>{label}</div>
            <div style={{ fontFamily: BEBAS, fontSize: "2.2rem", color: TEXT, lineHeight: 1.15, marginTop: 8 }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Instrument", "Holder", "Amount", "Rate", "Type", "Maturity", "Status", "Source"].map((h) => <th key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {debts.map((d, i) => (
              <tr key={i} className="hover-row">
                <td style={TD}>{d.instrumentName}</td>
                <td style={TD}>
                  {d.debtHolder.permId ? <a href={`/companies/${d.debtHolder.permId}`} style={{ color: TEXT, textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.color = GREEN_DIM)} onMouseLeave={(e) => (e.currentTarget.style.color = TEXT)}>{d.debtHolder.name}</a> : d.debtHolder.name}
                </td>
                <td style={{ ...TD, fontFamily: MONO, fontSize: "0.7rem", color: TEXT_DIM }}>{fmtCurrency(d.amount)}</td>
                <td style={{ ...TD, fontFamily: MONO, fontSize: "0.7rem", color: AMBER }}>{d.interestRate.toFixed(2)}%</td>
                <td style={TD}><TypePill type={d.type} /></td>
                <td style={{ ...TD, fontFamily: MONO, fontSize: "0.68rem", color: d.maturityDate < TODAY ? "rgba(255,255,255,0.18)" : TEXT_DIM, textDecoration: d.maturityDate < TODAY ? "line-through" : undefined }}>{fmtDate(d.maturityDate)}</td>
                <td style={TD}><StatusBadge active={isActive(d)} /></td>
                <td style={TD}>{d.sources[0] && <SourceLink source={d.sources[0]} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 12. STICKY NAV ────────────────────────────────────────────────────────────

function StickyNav({ company }: { company: Company }) {
  const currentEquity = company.historicSecurities.find(
    (s) => s.to === null && isEquity(s as EquitySecurity | DebtSecurity)
  );
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 200,
      background: "rgba(13,13,13,0.96)",
      borderBottom: `1px solid ${BORDER}`,
      backdropFilter: "blur(16px)",
      display: "flex", alignItems: "center",
      padding: "0 48px", height: 50,
    }}>
      <a href="/" style={{ fontFamily: BEBAS, fontSize: "1.2rem", color: GREEN, textDecoration: "none", letterSpacing: "0.08em", textShadow: "0 0 20px rgba(0,230,57,0.3)", marginRight: 0, paddingRight: 32 }}>
        FTM2J
      </a>
      {[
        { label: "Overview",           href: "#header" },
        { label: "Corporate Structure",href: "#corporate-structure" },
        { label: "Securities",         href: "#securities" },
        { label: "Commercial Debt",    href: "#commercial-debt" },
      ].map(({ label, href }) => (
        <a key={href} href={href} style={{
          fontFamily: MONO, fontSize: "0.57rem", letterSpacing: "0.12em", textTransform: "uppercase",
          color: TEXT_MUT, textDecoration: "none", padding: "0 18px", height: "100%",
          display: "flex", alignItems: "center", transition: "color 0.15s",
          borderLeft: `1px solid ${BORDER}`,
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = TEXT)}
          onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_MUT)}
        >
          {label}
        </a>
      ))}
      <div style={{ flex: 1 }} />
      {currentEquity && (
        <span style={{ fontFamily: MONO, fontSize: "0.58rem", color: GREEN_DIM, border: "1px solid rgba(0,230,57,0.18)", padding: "3px 10px", letterSpacing: "0.1em", marginRight: 14 }}>
          {(currentEquity as EquitySecurity).symbol}
        </span>
      )}
      <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: "0.57rem", color: GREEN, padding: "3px 10px", border: "1px solid rgba(0,230,57,0.22)", background: GREEN_FNT, letterSpacing: "0.16em" }}>
        <span style={{ width: 5, height: 5, background: GREEN, borderRadius: "50%", boxShadow: `0 0 6px ${GREEN}` }} />
        LIVE
      </span>
    </nav>
  );
}

// ── 13. PAGE SHELL ────────────────────────────────────────────────────────────

export default function CompanyTestLightPage() {
  return (
    <div style={{ background: BG, minHeight: "100vh", color: TEXT }}>
      <StickyNav company={COMPANY} />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px 80px" }}>
        <section id="header">
          <CompanyHeader company={COMPANY} />
        </section>

        <section id="corporate-structure" style={{ marginTop: 72 }}>
          <SectionLabel label="Corporate Structure" />

          <div style={{ marginTop: 36 }}>
            <SectionLabel label="Forensic Leadership Tenure" />
            <LeadershipGantt leaders={COMPANY.historicLeadership} />
          </div>

          <div style={{ marginTop: 60 }}>
            <SectionLabel label="Subsidiary Network" />
            <SubsidiariesTable relationships={COMPANY.historicCorporateRelationships} companyPermId={COMPANY.permId} />
          </div>

          <div style={{ marginTop: 60 }}>
            <SectionLabel label="Registered Addresses" />
            <AddressesPanel inc={COMPANY.historicIncorporationAddresses} dom={COMPANY.historicDomicileAddresses} />
          </div>
        </section>

        <section id="securities" style={{ marginTop: 72 }}>
          <SectionLabel label="Securities" />
          <SecuritiesSection securities={COMPANY.historicSecurities} />
        </section>

        <section id="commercial-debt" style={{ marginTop: 72 }}>
          <SectionLabel label="Commercial Debt" />
          <CommercialDebtSection debts={COMPANY.historicCommercialDebt} />
        </section>
      </main>

      <Footer />

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,230,57,0.18); }
        .hover-row { transition: background 0.1s; }
        .hover-row:hover { background: rgba(0,230,57,0.03) !important; }
        .hover-row:nth-child(even) { background: rgba(255,255,255,0.012); }
      `}</style>
    </div>
  );
}
