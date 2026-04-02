"use client";

import { useState } from "react";
import { Footer } from "../../../components/footer";
import { Treemap, hierarchy, treemapSquarify } from "@visx/hierarchy";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Text } from "@visx/text";
import { LinePath } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";

// ── 1. LOCAL TYPES ────────────────────────────────────────────────────────────

type LonglivedEntity = { from: string; to: string | null };
type SnapshotEntity = { asOf: string };
type CitedEntity = { sources: { name: string; url: string }[] };
type CompanyRef = { name: string; permId: string | null };

type HistoricLeader = CitedEntity &
  LonglivedEntity & { fullName: string; title: string };
type HistoricSector = CitedEntity &
  LonglivedEntity & { name: string; code: string; system: string };
type HistoricAddress = CitedEntity &
  LonglivedEntity & {
    street1: string;
    street2: string | null;
    city: string;
    stateOrCountry: string;
    zipCode: string | null;
    country: string;
    countryCode: string;
    isForeignLocation: boolean;
    foreignStateTerritory: string | null;
  };
type CorporateRelationship = CitedEntity &
  LonglivedEntity & {
    parent: CompanyRef;
    child: CompanyRef;
    relationshipType: string;
    ownershipPercent: number | null;
  };
type Shareholder = CitedEntity &
  SnapshotEntity &
  CompanyRef & { sharesOwned: number; sharesMarketValue: number };
type EquitySnapshot = CitedEntity &
  SnapshotEntity & { outstandingShares: number; shareholders: Shareholder[] };
type EquitySecurity = CitedEntity &
  LonglivedEntity & {
    symbol: string;
    class: string;
    history: EquitySnapshot[];
  };
type DebtHolder = CitedEntity &
  SnapshotEntity &
  CompanyRef & { debtMarketValue: number };
type DebtSnapshot = CitedEntity &
  SnapshotEntity & { principalAmount: number; debtHolders: DebtHolder[] };
type DebtSecurity = CitedEntity &
  LonglivedEntity & {
    symbol: string;
    class: string;
    jurisdiction?: string;
    history: DebtSnapshot[];
  };
type CommercialDebt = CitedEntity &
  LonglivedEntity & {
    instrumentName: string;
    debtHolder: CompanyRef;
    amount: number;
    interestRate: number;
    maturityDate: string;
    jurisdiction: string | null;
    type: string;
  };
type HistoricName = CitedEntity &
  LonglivedEntity & { value: string; changeReason: string | null };
type Company = CitedEntity & {
  permId: string;
  cik: string | null;
  ein: string | null;
  lei: string | null;
  name: string;
  aliases: string[];
  description: string;
  foundedOn: string | null;
  website: string | null;
  historicNames: HistoricName[];
  historicLeadership: HistoricLeader[];
  historicSectors: HistoricSector[];
  historicIncorporationAddresses: HistoricAddress[];
  historicDomicileAddresses: HistoricAddress[];
  historicCorporateRelationships: CorporateRelationship[];
  historicCommercialDebt: CommercialDebt[];
  historicSecurities: (EquitySecurity | DebtSecurity)[];
};

function isEquity(s: EquitySecurity | DebtSecurity): s is EquitySecurity {
  return (
    (s as EquitySecurity).history?.length > 0 &&
    "outstandingShares" in (s as EquitySecurity).history[0]
  );
}

// ── 2. MOCK DATA ──────────────────────────────────────────────────────────────

const COMPANY: Company = {
  sources: [
    {
      name: "Company Website",
      url: "https://www.angloamerican.com/",
    },
  ],
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
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      value: "Anglo American Corporation",
      changeReason: "Rebrand",
      from: "1970-01-01",
      to: "2010-01-01",
    },
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      value: "Anglo American PLC",
      changeReason: null,
      from: "2010-01-01",
      to: null,
    },
  ],
  historicLeadership: [
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      fullName: "Jonathan Taylor",
      title: "Chief Executive Officer",
      from: "2015-01-01",
      to: null,
    },
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      fullName: "Samuel Kowalski",
      title: "Chief Financial Officer",
      from: "2015-01-01",
      to: null,
    },
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      fullName: "Ana Kowalski",
      title: "Chief Operating Officer",
      from: "2015-01-01",
      to: null,
    },
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      fullName: "Chiara Ito",
      title: "Chief Executive Officer",
      from: "1970-01-01",
      to: "2014-12-31",
    },
  ],
  historicSectors: [
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      name: "Mining",
      code: "1000",
      system: "SIC",
      from: "1970-01-01",
      to: null,
    },
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      name: "Natural Resources",
      code: "1400",
      system: "SIC",
      from: "1970-01-01",
      to: null,
    },
  ],
  historicIncorporationAddresses: [
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      street1: "864 Commerce Park",
      street2: null,
      city: "Manchester",
      stateOrCountry: "GB",
      zipCode: null,
      isForeignLocation: true,
      foreignStateTerritory: null,
      country: "United Kingdom",
      countryCode: "GB",
      from: "1970-01-01",
      to: "2015-01-01",
    },
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      street1: "877 Business Park",
      street2: null,
      city: "London",
      stateOrCountry: "GB",
      zipCode: null,
      isForeignLocation: true,
      foreignStateTerritory: null,
      country: "United Kingdom",
      countryCode: "GB",
      from: "2015-01-01",
      to: null,
    },
  ],
  historicDomicileAddresses: [
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      street1: "864 Commerce Park",
      street2: null,
      city: "Manchester",
      stateOrCountry: "GB",
      zipCode: null,
      isForeignLocation: true,
      foreignStateTerritory: null,
      country: "United Kingdom",
      countryCode: "GB",
      from: "1970-01-01",
      to: "2015-01-01",
    },
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      street1: "877 Business Park",
      street2: null,
      city: "London",
      stateOrCountry: "GB",
      zipCode: null,
      isForeignLocation: true,
      foreignStateTerritory: null,
      country: "United Kingdom",
      countryCode: "GB",
      from: "2015-01-01",
      to: null,
    },
  ],
  historicCorporateRelationships: [
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      from: "1970-01-01",
      to: null,
      parent: { name: "Anglo American PLC", permId: "4295896494" },
      child: { name: "De Beers", permId: null },
      relationshipType: "Subsidiary",
      ownershipPercent: null,
    },
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      from: "1970-01-01",
      to: null,
      parent: { name: "Anglo American PLC", permId: "4295896494" },
      child: { name: "Anglo American Platinum", permId: null },
      relationshipType: "Subsidiary",
      ownershipPercent: null,
    },
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      from: "1970-01-01",
      to: null,
      parent: { name: "Anglo American PLC", permId: "4295896494" },
      child: { name: "Kumba Iron Ore", permId: null },
      relationshipType: "Subsidiary",
      ownershipPercent: null,
    },
  ],
  historicCommercialDebt: [
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      from: "2020-01-01",
      to: null,
      instrumentName: "Senior Secured Term Loan",
      debtHolder: { name: "HSBC Holdings PLC", permId: "4295907285" },
      amount: 750000000,
      interestRate: 8.5,
      maturityDate: "2029-12-31",
      jurisdiction: "United States",
      type: "Credit Facility",
    },
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      from: "2020-01-01",
      to: null,
      instrumentName: "Revolving Credit Facility",
      debtHolder: { name: "Goldman Sachs Group Inc.", permId: "4295906067" },
      amount: 600000000,
      interestRate: 2.75,
      maturityDate: "2026-12-31",
      jurisdiction: "United States",
      type: "Bond",
    },
  ],
  historicSecurities: [
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      from: "1970-01-01",
      to: null,
      symbol: "NGLOY",
      class: "Common Stock",
      history: [
        {
          sources: [
            { name: "Company Website", url: "https://www.angloamerican.com/" },
          ],
          asOf: "2022-12-31",
          outstandingShares: 540000000,
          shareholders: [
            {
              sources: [
                {
                  name: "Company Website",
                  url: "https://www.angloamerican.com/",
                },
              ],
              asOf: "2022-12-31",
              name: "Capital Group Companies",
              permId: "4295905732",
              sharesOwned: 37800000,
              sharesMarketValue: 907200000,
            },
            {
              sources: [
                {
                  name: "Company Website",
                  url: "https://www.angloamerican.com/",
                },
              ],
              asOf: "2022-12-31",
              name: "Wellington Management Group LLP",
              permId: "4295907122",
              sharesOwned: 21600000,
              sharesMarketValue: 540000000,
            },
          ],
        },
        {
          sources: [
            { name: "Company Website", url: "https://www.angloamerican.com/" },
          ],
          asOf: "2023-12-31",
          outstandingShares: 545000000,
          shareholders: [
            {
              sources: [
                {
                  name: "Company Website",
                  url: "https://www.angloamerican.com/",
                },
              ],
              asOf: "2023-12-31",
              name: "Franklin Templeton Investments",
              permId: "4295905890",
              sharesOwned: 38150000,
              sharesMarketValue: 915600000,
            },
            {
              sources: [
                {
                  name: "Company Website",
                  url: "https://www.angloamerican.com/",
                },
              ],
              asOf: "2023-12-31",
              name: "Vanguard Group Inc.",
              permId: "4295906971",
              sharesOwned: 21800000,
              sharesMarketValue: 545000000,
            },
            {
              sources: [
                {
                  name: "Company Website",
                  url: "https://www.angloamerican.com/",
                },
              ],
              asOf: "2023-12-31",
              name: "T. Rowe Price Group Inc.",
              permId: "4295906812",
              sharesOwned: 59950000,
              sharesMarketValue: 1558700000,
            },
          ],
        },
      ],
    },
    {
      sources: [
        { name: "Company Website", url: "https://www.angloamerican.com/" },
      ],
      from: "2020-01-01",
      to: null,
      symbol: "AAP2032",
      class: "Subordinated Notes",
      jurisdiction: "United States",
      history: [
        {
          sources: [
            { name: "Company Website", url: "https://www.angloamerican.com/" },
          ],
          asOf: "2022-12-31",
          principalAmount: 1900000000,
          debtHolders: [
            {
              sources: [
                {
                  name: "Company Website",
                  url: "https://www.angloamerican.com/",
                },
              ],
              asOf: "2022-12-31",
              name: "Franklin Templeton Investments",
              permId: "4295905890",
              debtMarketValue: 323000000,
            },
            {
              sources: [
                {
                  name: "Company Website",
                  url: "https://www.angloamerican.com/",
                },
              ],
              asOf: "2022-12-31",
              name: "Wellington Management Group LLP",
              permId: "4295907122",
              debtMarketValue: 285000000,
            },
          ],
        },
        {
          sources: [
            { name: "Company Website", url: "https://www.angloamerican.com/" },
          ],
          asOf: "2023-12-31",
          principalAmount: 1890000000,
          debtHolders: [
            {
              sources: [
                {
                  name: "Company Website",
                  url: "https://www.angloamerican.com/",
                },
              ],
              asOf: "2023-12-31",
              name: "BlackRock Inc.",
              permId: "4295903645",
              debtMarketValue: 228000000,
            },
            {
              sources: [
                {
                  name: "Company Website",
                  url: "https://www.angloamerican.com/",
                },
              ],
              asOf: "2023-12-31",
              name: "Vanguard Group Inc.",
              permId: "4295906971",
              debtMarketValue: 190000000,
            },
            {
              sources: [
                {
                  name: "Company Website",
                  url: "https://www.angloamerican.com/",
                },
              ],
              asOf: "2023-12-31",
              name: "State Street Corporation",
              permId: "4295906529",
              debtMarketValue: 152000000,
            },
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
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function fmtYear(s: string | null): string {
  if (!s) return "Present";
  return s.slice(0, 4);
}

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

function fmtPct(n: number | null): string {
  if (n === null) return "Undisclosed";
  return `${n.toFixed(1)}%`;
}

function isActive(e: LonglivedEntity): boolean {
  return e.to === null;
}

function currentOf<T extends LonglivedEntity>(arr: T[]): T[] {
  return arr.filter((e) => e.to === null);
}

function blendedRate(debts: CommercialDebt[]): string {
  const active = debts.filter(isActive);
  if (!active.length) return "—";
  const totalAmt = active.reduce((s, d) => s + d.amount, 0);
  const weighted = active.reduce((s, d) => s + d.interestRate * d.amount, 0);
  return `${(weighted / totalAmt).toFixed(2)}%`;
}

function nextMaturity(debts: CommercialDebt[]): string {
  const active = debts
    .filter(isActive)
    .filter((d) => d.maturityDate > TODAY)
    .sort((a, b) => a.maturityDate.localeCompare(b.maturityDate));
  if (!active.length) return "—";
  return fmtDate(active[0].maturityDate);
}

function totalDebt(debts: CommercialDebt[]): string {
  const sum = debts.filter(isActive).reduce((s, d) => s + d.amount, 0);
  return fmtCurrency(sum);
}

// ── 4. PRIMITIVE COMPONENTS ───────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        borderLeft: "4px solid #10b981",
        paddingLeft: 14,
        padding: "8px 12px 8px 16px",
        background: "rgba(16,185,129,0.03)",
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "1.65rem",
        letterSpacing: "0.08em",
        color: "#fff",
        marginBottom: 20,
      }}
    >
      {label}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: "0.62rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase" as const,
        padding: "3px 10px",
        background: active ? "#10b981" : "rgba(148,163,184,0.15)",
        color: active ? "#000" : "#94a3b8",
      }}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function PermIdBadge({ permId }: { permId: string | null }) {
  const resolved = permId !== null;
  return (
    <span
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: "0.6rem",
        letterSpacing: "0.1em",
        padding: "2px 7px",
        border: `1px solid ${resolved ? "rgba(16,185,129,0.5)" : "rgba(245,158,11,0.5)"}`,
        color: resolved ? "#34d399" : "#fcd34d",
        background: resolved
          ? "rgba(16,185,129,0.06)"
          : "rgba(245,158,11,0.06)",
        whiteSpace: "nowrap" as const,
      }}
    >
      {resolved ? "Resolved" : "Unresolved"}
    </span>
  );
}

function BannerActionBtn({ title, label, children }: { title: string; label?: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        border: "none",
        background: "none",
        color: hovered ? "#34d399" : "rgba(255,255,255,0.75)",
        cursor: "pointer",
        filter: hovered ? "drop-shadow(0 0 6px rgba(52,211,153,0.7))" : "none",
        transition: "all 0.2s",
      }}
    >
      {children}
      {label && (
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "0.9rem",
          letterSpacing: "0.1em",
          lineHeight: 1,
        }}>
          {label}
        </span>
      )}
    </button>
  );
}

function SectorTag({
  name,
  overlay = false,
}: {
  name: string;
  overlay?: boolean;
}) {
  return (
    <span
      style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 600,
        fontSize: "0.65rem",
        letterSpacing: "0.06em",
        padding: overlay ? "4px 12px" : "3px 10px",
        border: overlay
          ? "1px solid rgba(16,185,129,0.7)"
          : "1px solid rgba(16,185,129,0.3)",
        color: overlay ? "#6ee7b7" : "#34d399",
        background: overlay ? "rgba(0,0,0,0.72)" : "rgba(16,185,129,0.05)",
        backdropFilter: overlay ? "blur(8px)" : undefined,
        WebkitBackdropFilter: overlay ? "blur(8px)" : undefined,
      }}
    >
      {name}
    </span>
  );
}

function SourceLink({ source }: { source: { name: string; url: string } }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: "'DM Mono', monospace",
        fontSize: "0.62rem",
        color: "#34d399",
        textDecoration: "none",
        letterSpacing: "0.04em",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#34d399")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#34d399")}
    >
      {source.name}
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
        <path
          d="M3 3h5v5M8 2L2 8"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </a>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: "0.65rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase" as const,
        padding: "5px 14px",
        border: `1px solid ${active ? "#10b981" : "rgba(16,185,129,0.2)"}`,
        background: active ? "rgba(16,185,129,0.12)" : "transparent",
        color: active ? "#6ee7b7" : "#34d399",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

function TypePill({ type }: { type: string }) {
  const styles: Record<string, { bg: string; border: string; color: string }> =
    {
      Bond: {
        bg: "rgba(59,130,246,0.08)",
        border: "rgba(59,130,246,0.4)",
        color: "#93c5fd",
      },
      Convertible: {
        bg: "rgba(139,92,246,0.08)",
        border: "rgba(139,92,246,0.4)",
        color: "#c4b5fd",
      },
      "Credit Facility": {
        bg: "rgba(245,158,11,0.08)",
        border: "rgba(245,158,11,0.4)",
        color: "#fcd34d",
      },
    };
  const s = styles[type] ?? {
    bg: "rgba(52,211,153,0.06)",
    border: "#34d399",
    color: "#6ee7b7",
  };
  return (
    <span
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: "0.6rem",
        letterSpacing: "0.08em",
        padding: "2px 8px",
        border: `1px solid ${s.border}`,
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap" as const,
      }}
    >
      {type}
    </span>
  );
}

// ── 5a. COMPANY HEADER ────────────────────────────────────────────────────────

function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        cursor: "help",
      }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {/* ⓘ icon */}
      <svg
        width="11"
        height="11"
        viewBox="0 0 12 12"
        fill="none"
        style={{ color: "#34d399", flexShrink: 0 }}
      >
        <circle cx="6" cy="6" r="5.25" stroke="currentColor" strokeWidth="1" />
        <line
          x1="6"
          y1="5.2"
          x2="6"
          y2="8.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="6" cy="3.6" r="0.65" fill="currentColor" />
      </svg>

      {visible && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: 230,
            background: "#091a12",
            border: "1px solid rgba(16,185,129,0.3)",
            padding: "10px 13px",
            fontFamily: "'Syne', sans-serif",
            fontWeight: 500,
            fontSize: "0.7rem",
            color: "#a7f3d0",
            lineHeight: 1.65,
            zIndex: 300,
            pointerEvents: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            textTransform: "none",
            letterSpacing: "0.01em",
          }}
        >
          {/* Arrow */}
          <span
            style={{
              position: "absolute",
              top: -5,
              left: "50%",
              transform: "translateX(-50%)",
              width: 8,
              height: 5,
              background: "#091a12",
              borderTop: "1px solid rgba(16,185,129,0.3)",
              borderLeft: "1px solid rgba(16,185,129,0.3)",
              rotate: "45deg",
              display: "block",
            }}
          />
          {text}
        </div>
      )}
    </span>
  );
}

const microLabel: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontWeight: 700,
  fontSize: "0.62rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#34d399",
};

function CompanyHeader({ company }: { company: Company }) {
  const currentDomicile = currentOf(company.historicDomicileAddresses)[0];
  const currentSectors = currentOf(company.historicSectors);
  const aliases = company.aliases.filter((a) => a !== company.name);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  function handleCopy(label: string, value: string) {
    navigator.clipboard.writeText(value);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 1500);
  }

  const identifiers = [
    {
      label: "PERM ID",
      value: company.permId,
      info: "Permanent Identifier (PermID) — a globally unique, stable ID assigned to financial entities and instruments by LSEG (formerly Refinitiv / Thomson Reuters).",
    },
    {
      label: "LEI",
      value: company.lei,
      info: "Legal Entity Identifier — a 20-character ISO 17442 code that uniquely identifies legal entities participating in financial transactions, issued by the Global LEI System (GLEIS).",
    },
    {
      label: "CIK",
      value: company.cik,
      info: "Central Index Key — a unique number assigned by the U.S. Securities and Exchange Commission (SEC) to every company and individual that files disclosures through EDGAR.",
    },
    {
      label: "EIN",
      value: company.ein,
      info: "Employer Identification Number — a 9-digit tax ID assigned by the U.S. Internal Revenue Service (IRS) to identify a business entity for federal tax purposes.",
    },
  ];

  return (
    <div style={{ borderBottom: "1px solid rgba(16,185,129,0.1)" }}>
      {/* ── ZONE 1: PHOTO BANNER ──────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          height: 360,
          overflow: "hidden",
          // Break out of the 48px container padding so the image is edge-to-edge
          margin: "0 -48px",
        }}
      >
        {/* Background photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/protest-ii.jpg"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 35%",
          }}
        />

        {/* Overlays — layered for depth */}
        {/* 1. Base darkening */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.52)",
          }}
        />
        {/* 2. Emerald radial glow from bottom-left corner */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 15% 110%, rgba(16,185,129,0.22) 0%, transparent 55%)",
          }}
        />
        {/* 3. Bottom-to-black gradient so it blends into the page */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.6) 70%, #000 100%)",
          }}
        />
        {/* 4. Left-edge vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(0,0,0,0.45) 0%, transparent 35%)",
          }}
        />
        {/* 5. Top-edge scrim for action button legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 40%)",
          }}
        />

        {/* Action buttons — top right */}
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 40,
            display: "flex",
            gap: 16,
          }}
        >
          {[
            {
              title: "Download",
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              ),
            },
            {
              title: "Share",
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              ),
            },
            {
              title: "Feedback",
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              ),
            },
          ].map(({ title, icon }) => (
            <BannerActionBtn key={title} title={title} label={title}>{icon}</BannerActionBtn>
          ))}
        </div>

        {/* Company name + badge — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: 48,
            right: 48,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            {/* Eyebrow: founded year */}
            {company.foundedOn && (
              <div
                style={{
                  ...microLabel,
                  color: "#6ee7b7",
                  marginBottom: 8,
                  letterSpacing: "0.2em",
                }}
              >
                Est. {fmtYear(company.foundedOn)}
              </div>
            )}
            <h1
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(2.8rem, 5vw, 4.8rem)",
                fontWeight: 400,
                lineHeight: 0.9,
                color: "#fff",
                margin: 0,
                letterSpacing: "0.02em",
                textShadow: "0 2px 24px rgba(0,0,0,0.9)",
              }}
            >
              {company.name}
            </h1>
            {aliases.length > 0 && (
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 400,
                  fontSize: "0.8rem",
                  color: "#6ee7b7",
                  marginTop: 8,
                  letterSpacing: "0.02em",
                  textShadow: "0 1px 8px rgba(0,0,0,0.8)",
                }}
              >
                <span style={{ marginRight: 8 }}>Aliases:</span>
                {aliases.join("  ·  ")}
              </div>
            )}
            {currentSectors.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginTop: 12 }}>
                {currentSectors.map((s, i) => (
                  <SectorTag
                    key={i}
                    name={`${s.name} · ${s.system} ${s.code}`}
                    overlay
                  />
                ))}
              </div>
            )}
          </div>

          {/* Status + current domicile pinned to bottom-right */}
          <div
            style={{
              display: "flex",
              flexDirection: "column" as const,
              alignItems: "flex-end",
              gap: 8,
              flexShrink: 0,
              marginBottom: 4,
            }}
          >
            <StatusBadge active={true} />
            {currentDomicile && (
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.72rem",
                  color: "#6ee7b7",
                  letterSpacing: "0.06em",
                }}
              >
                {currentDomicile.city}, {currentDomicile.country}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── ZONE 2: IDENTIFIERS STRIP ─────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap" as const,
          margin: "0 -48px",
          borderBottom: "1px solid rgba(16,185,129,0.1)",
          background: "rgba(16,185,129,0.025)",
        }}
      >
        {identifiers
          .filter(({ value }) => value !== null)
          .map(({ label, value, info }, i) => (
            <div
              key={i}
              style={{
                padding: `14px 24px 14px ${i === 0 ? 48 : 24}px`,
                borderRight: "1px solid rgba(16,185,129,0.08)",
                display: "flex",
                flexDirection: "column" as const,
                gap: 5,
              }}
            >
              {/* Label row: text + info tooltip */}
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={microLabel}>{label}</span>
                <InfoTooltip text={info} />
              </div>

              {/* Value row: monospace value + copy button */}
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.78rem",
                    color: "#6ee7b7",
                    letterSpacing: "0.04em",
                  }}
                >
                  {value}
                </span>
                <button
                  onClick={() => handleCopy(label, value!)}
                  title="Copy to clipboard"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                    color: copiedLabel === label ? "#10b981" : "#34d399",
                    transition: "color 0.15s ease",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (copiedLabel !== label)
                      e.currentTarget.style.color = "rgba(52,211,153,0.7)";
                  }}
                  onMouseLeave={(e) => {
                    if (copiedLabel !== label)
                      e.currentTarget.style.color = "#34d399";
                  }}
                >
                  {copiedLabel === label ? (
                    /* Checkmark */
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <polyline
                        points="2,6.5 5,9.5 10,3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    /* Clipboard */
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <rect
                        x="4"
                        y="1"
                        width="6"
                        height="8"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                      <path
                        d="M2 3h1.5v7.5H8.5"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}

        <div style={{ flex: 1 }} />

        {/* Website far right */}
        {company.website && (
          <div
            style={{
              padding: "14px 24px",
              borderLeft: "1px solid rgba(16,185,129,0.08)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 600,
                fontSize: "0.78rem",
                color: "#34d399",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#6ee7b7")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#34d399")}
            >
              {company.website.replace(/^https?:\/\//, "")}
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path
                  d="M3 3h5v5M8 2L2 8"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* ── ZONE 3: TWO-COLUMN BODY ───────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 48,
          padding: "36px 0 44px",
        }}
      >
        {/* LEFT: description, aliases, name history, sources */}
        <div>
          <p
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 500,
              fontSize: "0.95rem",
              lineHeight: 1.75,
              color: "#a7f3d0",
              margin: "0 0 28px",
            }}
          >
            {company.description}
          </p>

          {company.historicNames.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ ...microLabel, marginBottom: 10 }}>
                Name History
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: 7,
                }}
              >
                {company.historicNames.map((n, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "center",
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                    }}
                  >
                    <span style={{ color: "#6ee7b7", minWidth: 230 }}>
                      {n.value}
                    </span>
                    <span style={{ color: "#34d399" }}>
                      {fmtYear(n.from)} – {fmtYear(n.to)}
                    </span>
                    {n.changeReason && (
                      <span
                        style={{
                          fontSize: "0.58rem",
                          padding: "1px 7px",
                          border: "1px solid rgba(52,211,153,0.2)",
                          color: "#34d399",
                        }}
                      >
                        {n.changeReason}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap" as const,
            }}
          >
            <span style={microLabel}>Sources</span>
            {company.sources.map((src, i) => (
              <SourceLink key={i} source={src} />
            ))}
          </div>
        </div>

        {/* RIGHT: key facts card */}
        <div
          style={{
            border: "1px solid rgba(16,185,129,0.12)",
            background: "rgba(16,185,129,0.02)",
            alignSelf: "start",
          }}
        >
          {/* Card header */}
          <div
            style={{
              borderBottom: "1px solid rgba(16,185,129,0.1)",
              padding: "12px 20px",
            }}
          >
            <span style={microLabel}>Company Facts</span>
          </div>

          {/* Fact rows */}
          <div style={{ padding: "4px 0" }}>
            {[
              {
                label: "Founded",
                value: company.foundedOn ? fmtDate(company.foundedOn) : null,
              },
              {
                label: "Domicile",
                value: currentDomicile
                  ? `${currentDomicile.city}, ${currentDomicile.country}`
                  : null,
              },
            ]
              .filter((row) => row.value)
              .map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    padding: "11px 20px",
                    borderBottom: "1px solid rgba(16,185,129,0.06)",
                    gap: 16,
                  }}
                >
                  <span style={microLabel}>{label}</span>
                  <span
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      color: "#6ee7b7",
                      textAlign: "right" as const,
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}

            {/* Sectors subsection */}
            <div style={{ padding: "14px 20px 6px" }}>
              <div style={{ ...microLabel, marginBottom: 10 }}>Sectors</div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: 7,
                }}
              >
                {currentSectors.map((s, i) => (
                  <SectorTag
                    key={i}
                    name={`${s.name} · ${s.system} ${s.code}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 5b. LEADERSHIP GANTT ──────────────────────────────────────────────────────

const CHART_L = 225;
const CHART_R = 990;
const CHART_W = CHART_R - CHART_L;
const AXIS_H = 36;
const ROW_H = 42;

function leaderColor(title: string): string {
  if (/chief exec|ceo/i.test(title)) return "#10b981";
  if (/chief fin|cfo/i.test(title)) return "#3b82f6";
  if (/chief oper|coo/i.test(title)) return "#f59e0b";
  if (/general counsel|legal/i.test(title)) return "#8b5cf6";
  return "#34d399";
}

function LeadershipGantt({ leaders }: { leaders: HistoricLeader[] }) {
  const minMs = Math.min(...leaders.map((l) => new Date(l.from).getTime()));
  const minDate = new Date(minMs);
  const maxDate = new Date(TODAY);
  const totalMs = maxDate.getTime() - minDate.getTime();

  function dateToX(s: string): number {
    const ms = new Date(s).getTime() - minDate.getTime();
    return CHART_L + (ms / totalMs) * CHART_W;
  }

  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();
  const years: number[] = [];
  for (let y = minYear; y <= maxYear; y++) years.push(y);

  // One row per leader (in order of first appearance)
  const sorted = [...leaders].sort(
    (a, b) => new Date(a.from).getTime() - new Date(b.from).getTime(),
  );
  const totalHeight = AXIS_H + sorted.length * ROW_H + 20;
  const todayX = dateToX(TODAY);

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg
        viewBox={`0 0 1000 ${totalHeight}`}
        preserveAspectRatio="xMinYMid meet"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        {/* Year gridlines + labels */}
        {years.map((y) => {
          const x = dateToX(`${y}-01-01`);
          if (x < CHART_L) return null;
          return (
            <g key={y}>
              <line
                x1={x}
                y1={AXIS_H - 8}
                x2={x}
                y2={totalHeight - 16}
                stroke="rgba(16,185,129,0.08)"
                strokeWidth="0.5"
              />
              {y % 5 === 0 && (
                <text
                  x={x + 2}
                  y={AXIS_H - 12}
                  fontSize="7"
                  fill="#34d399"
                  fontFamily="monospace"
                >
                  {y}
                </text>
              )}
            </g>
          );
        })}

        {/* TODAY marker */}
        <line
          x1={todayX}
          y1={AXIS_H}
          x2={todayX}
          y2={totalHeight - 10}
          stroke="#10b981"
          strokeWidth="1"
          strokeDasharray="4 3"
          opacity="0.7"
        />
        <text
          x={todayX + 3}
          y={AXIS_H + 9}
          fontSize="6"
          fill="#10b981"
          fontFamily="monospace"
          opacity="0.8"
        >
          TODAY
        </text>

        {/* Leader rows */}
        {sorted.map((leader, i) => {
          const rowY = AXIS_H + i * ROW_H;
          const barY = rowY + 12;
          const barH = ROW_H - 22;
          const barX = Math.max(dateToX(leader.from), CHART_L);
          const barEnd = dateToX(leader.to ?? TODAY);
          const barW = Math.max(barEnd - barX, 2);
          const color = leaderColor(leader.title);
          const clipId = `clip-${i}`;

          return (
            <g key={i}>
              {/* Row separator */}
              <line
                x1={0}
                y1={rowY}
                x2={1000}
                y2={rowY}
                stroke="rgba(16,185,129,0.05)"
                strokeWidth="0.5"
              />

              {/* Name label */}
              <text
                x={CHART_L - 8}
                y={barY + barH / 2 + 1}
                textAnchor="end"
                fontSize="9"
                fill="#6ee7b7"
                fontFamily="monospace"
                dominantBaseline="middle"
              >
                {leader.fullName}
              </text>

              {/* Role sublabel */}
              <text
                x={CHART_L - 8}
                y={barY + barH / 2 + 10}
                textAnchor="end"
                fontSize="6.5"
                fill="#34d399"
                fontFamily="monospace"
                dominantBaseline="middle"
              >
                {leader.title}
              </text>

              {/* Bar */}
              <clipPath id={clipId}>
                <rect x={barX} y={barY} width={barW} height={barH} />
              </clipPath>
              <rect
                x={barX}
                y={barY}
                width={barW}
                height={barH}
                rx="2"
                fill={color}
                opacity="0.75"
              >
                <title>{`${leader.fullName} — ${leader.title}\n${fmtDate(leader.from)} → ${leader.to ? fmtDate(leader.to) : "Present"}`}</title>
              </rect>

              {/* Bar label (if wide enough) */}
              {barW > 60 && (
                <text
                  x={barX + 6}
                  y={barY + barH / 2}
                  fontSize="6.5"
                  fill="#000"
                  fontFamily="monospace"
                  dominantBaseline="middle"
                  clipPath={`url(#${clipId})`}
                  opacity="0.8"
                >
                  {fmtYear(leader.from)}–{fmtYear(leader.to)}
                </text>
              )}
            </g>
          );
        })}

        {/* Axis baseline */}
        <line
          x1={CHART_L}
          y1={AXIS_H}
          x2={CHART_R}
          y2={AXIS_H}
          stroke="rgba(16,185,129,0.15)"
          strokeWidth="0.5"
        />
      </svg>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 12,
          flexWrap: "wrap" as const,
        }}
      >
        {[
          { label: "CEO / Exec", color: "#10b981" },
          { label: "CFO", color: "#3b82f6" },
          { label: "COO", color: "#f59e0b" },
          { label: "Other", color: "#34d399" },
        ].map(({ label, color }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.62rem",
              color: "#6ee7b7",
            }}
          >
            <div
              style={{
                width: 12,
                height: 8,
                background: color,
                opacity: 0.75,
                borderRadius: 1,
              }}
            />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 5c. SUBSIDIARIES TABLE ────────────────────────────────────────────────────

function SubsidiariesTable({
  relationships,
  companyPermId,
}: {
  relationships: CorporateRelationship[];
  companyPermId: string;
}) {
  const [filter, setFilter] = useState<"active" | "all">("active");

  const rows = relationships
    .filter((r) => r.parent.permId === companyPermId)
    .filter((r) => filter === "all" || r.to === null);

  const thStyle: React.CSSProperties = {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: "0.6rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#34d399",
    padding: "8px 12px",
    textAlign: "left",
    borderBottom: "1px solid rgba(16,185,129,0.12)",
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 500,
    fontSize: "0.82rem",
    padding: "10px 12px",
    borderBottom: "1px solid rgba(16,185,129,0.06)",
    verticalAlign: "middle",
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <TabButton
          label="Active"
          active={filter === "active"}
          onClick={() => setFilter("active")}
        />
        <TabButton
          label="All"
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
      </div>

      {rows.length === 0 ? (
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.75rem",
            color: "#34d399",
            padding: "24px 0",
          }}
        >
          No relationships found.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Since</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Ownership</th>
                <th style={thStyle}>PermID</th>
                <th style={thStyle}>Source</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="hover-row">
                  <td style={{ ...tdStyle, color: "#6ee7b7" }}>
                    {r.child.name}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      color: "#34d399",
                      fontSize: "0.68rem",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {r.relationshipType}
                  </td>
                  <td style={{ ...tdStyle, color: "#6ee7b7" }}>
                    {fmtDate(r.from)}
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge active={isActive(r)} />
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      color:
                        r.ownershipPercent === null
                          ? "rgba(245,158,11,0.6)"
                          : "#a7f3d0",
                    }}
                  >
                    {fmtPct(r.ownershipPercent)}
                  </td>
                  <td style={tdStyle}>
                    <PermIdBadge permId={r.child.permId} />
                  </td>
                  <td style={tdStyle}>
                    {r.sources[0] && <SourceLink source={r.sources[0]} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── 5d. ADDRESSES PANEL ───────────────────────────────────────────────────────

function AddressesPanel({
  inc,
  dom,
}: {
  inc: HistoricAddress[];
  dom: HistoricAddress[];
}) {
  const [tab, setTab] = useState<"incorporation" | "domicile">("incorporation");
  const [idx, setIdx] = useState(0);

  const addresses = tab === "incorporation" ? inc : dom;
  const sorted = [...addresses].sort((a, b) => {
    if (a.to === null) return -1;
    if (b.to === null) return 1;
    return b.to.localeCompare(a.to);
  });
  const selected = sorted[idx];

  return (
    <div>
      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <TabButton
          label="Incorporation"
          active={tab === "incorporation"}
          onClick={() => {
            setTab("incorporation");
            setIdx(0);
          }}
        />
        <TabButton
          label="Domicile"
          active={tab === "domicile"}
          onClick={() => {
            setTab("domicile");
            setIdx(0);
          }}
        />
      </div>

      {/* Period blocks */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap" as const,
          gap: 8,
          marginBottom: 20,
        }}
      >
        {sorted.map((addr, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.06em",
              padding: "6px 14px",
              border: `1px solid ${i === idx ? "#10b981" : "rgba(16,185,129,0.2)"}`,
              background: i === idx ? "rgba(16,185,129,0.1)" : "transparent",
              color: i === idx ? "#6ee7b7" : "#34d399",
              cursor: "pointer",
              position: "relative" as const,
            }}
          >
            {fmtYear(addr.from)} – {fmtYear(addr.to)}
            {addr.to === null && (
              <span
                style={{
                  position: "absolute" as const,
                  top: -6,
                  right: -4,
                  fontSize: "0.5rem",
                  background: "#10b981",
                  color: "#000",
                  padding: "1px 4px",
                  letterSpacing: "0.08em",
                }}
              >
                NOW
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Address card */}
      {selected && (
        <div
          style={{
            border: "1px solid rgba(16,185,129,0.15)",
            background: "rgba(16,185,129,0.03)",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#6ee7b7",
                lineHeight: 1.8,
              }}
            >
              <div>{selected.street1}</div>
              {selected.street2 && <div>{selected.street2}</div>}
              <div>
                {selected.city}
                {selected.stateOrCountry &&
                selected.stateOrCountry !== selected.city
                  ? `, ${selected.stateOrCountry}`
                  : ""}
                {selected.zipCode ? `  ${selected.zipCode}` : ""}
              </div>
              <div>{selected.country}</div>
            </div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.62rem",
                color: "#34d399",
                marginTop: 10,
              }}
            >
              {fmtDate(selected.from)} →{" "}
              {selected.to ? fmtDate(selected.to) : "Present"}
            </div>
          </div>
          <div>
            {selected.sources[0] && <SourceLink source={selected.sources[0]} />}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 5e. SECURITIES SECTION ────────────────────────────────────────────────────

type TreeMapNode = {
  name: string;
  permId: string | null;
  size: number;
  changePct: number;
};

function buildTreeMapData(
  sec: EquitySecurity | DebtSecurity,
): TreeMapNode[] {
  const eq = isEquity(sec);
  const history = sec.history;
  if (history.length === 0) return [];

  const first = history[0];
  const last = history[history.length - 1];

  const firstMap = new Map<string, number>();
  const lastMap = new Map<string, { name: string; permId: string | null; value: number }>();

  if (eq) {
    for (const sh of (first as EquitySnapshot).shareholders) {
      firstMap.set(sh.permId ?? sh.name, sh.sharesOwned);
    }
    for (const sh of (last as EquitySnapshot).shareholders) {
      lastMap.set(sh.permId ?? sh.name, { name: sh.name, permId: sh.permId, value: sh.sharesOwned });
    }
  } else {
    for (const dh of (first as DebtSnapshot).debtHolders) {
      firstMap.set(dh.permId ?? dh.name, dh.debtMarketValue);
    }
    for (const dh of (last as DebtSnapshot).debtHolders) {
      lastMap.set(dh.permId ?? dh.name, { name: dh.name, permId: dh.permId, value: dh.debtMarketValue });
    }
  }

  const singleSnapshot = history.length === 1;
  const nodes: TreeMapNode[] = [];

  // Holders in the latest snapshot
  for (const [key, { name, permId, value }] of lastMap) {
    const firstVal = firstMap.get(key);
    let changePct = 0;
    if (!singleSnapshot) {
      if (firstVal == null) changePct = 1; // new investor
      else if (firstVal > 0) changePct = Math.max(-1, Math.min(1, (value - firstVal) / firstVal));
    }
    nodes.push({ name, permId, size: value, changePct });
  }

  // Holders that divested (in first but not last)
  if (!singleSnapshot) {
    const maxSize = Math.max(...nodes.map((n) => n.size), 1);
    for (const [key] of firstMap) {
      if (!lastMap.has(key)) {
        // Reconstruct name from first snapshot
        let name = key;
        let permId: string | null = null;
        if (eq) {
          const sh = (first as EquitySnapshot).shareholders.find(
            (s) => (s.permId ?? s.name) === key,
          );
          if (sh) { name = sh.name; permId = sh.permId; }
        } else {
          const dh = (first as DebtSnapshot).debtHolders.find(
            (d) => (d.permId ?? d.name) === key,
          );
          if (dh) { name = dh.name; permId = dh.permId; }
        }
        nodes.push({ name, permId, size: maxSize * 0.02, changePct: -1 });
      }
    }
  }

  return nodes;
}

type HolderTimeSeries = {
  name: string;
  permId: string | null;
  dataPoints: { date: string; value: number }[];
  latestValue: number;
  latestMarketValue: number;
  sources: { name: string; url: string }[];
  divested: boolean;
};

function buildHolderTimeSeries(
  sec: EquitySecurity | DebtSecurity,
): HolderTimeSeries[] {
  const eq = isEquity(sec);
  const history = sec.history;
  const map = new Map<string, HolderTimeSeries>();

  for (const snap of history) {
    if (eq) {
      for (const sh of (snap as EquitySnapshot).shareholders) {
        const key = sh.permId ?? sh.name;
        let entry = map.get(key);
        if (!entry) {
          entry = {
            name: sh.name,
            permId: sh.permId,
            dataPoints: [],
            latestValue: 0,
            latestMarketValue: 0,
            sources: sh.sources,
            divested: false,
          };
          map.set(key, entry);
        }
        entry.dataPoints.push({ date: snap.asOf, value: sh.sharesOwned });
        entry.latestValue = sh.sharesOwned;
        entry.latestMarketValue = sh.sharesMarketValue;
        entry.sources = sh.sources;
      }
    } else {
      for (const dh of (snap as DebtSnapshot).debtHolders) {
        const key = dh.permId ?? dh.name;
        let entry = map.get(key);
        if (!entry) {
          entry = {
            name: dh.name,
            permId: dh.permId,
            dataPoints: [],
            latestValue: 0,
            latestMarketValue: 0,
            sources: dh.sources,
            divested: false,
          };
          map.set(key, entry);
        }
        entry.dataPoints.push({ date: snap.asOf, value: dh.debtMarketValue });
        entry.latestValue = dh.debtMarketValue;
        entry.latestMarketValue = dh.debtMarketValue;
        entry.sources = dh.sources;
      }
    }
  }

  // Mark holders not in the last snapshot as divested
  if (history.length > 0) {
    const lastSnap = history[history.length - 1];
    const lastKeys = new Set<string>();
    if (eq) {
      for (const sh of (lastSnap as EquitySnapshot).shareholders)
        lastKeys.add(sh.permId ?? sh.name);
    } else {
      for (const dh of (lastSnap as DebtSnapshot).debtHolders)
        lastKeys.add(dh.permId ?? dh.name);
    }
    for (const [key, entry] of map) {
      if (!lastKeys.has(key)) entry.divested = true;
    }
  }

  return Array.from(map.values()).sort((a, b) => b.latestValue - a.latestValue);
}

// ── Holder Sparkline (visx) ──────────────────────────────────────────────────

function HolderSparkline({
  values,
  width = 80,
  height = 24,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  if (values.length === 0) return null;
  if (values.length === 1) {
    return (
      <svg width={width} height={height}>
        <circle cx={width / 2} cy={height / 2} r={2.5} fill="#10b981" />
      </svg>
    );
  }

  const xScale = scaleLinear<number>({
    domain: [0, values.length - 1],
    range: [4, width - 4],
  });
  const yMin = Math.min(...values);
  const yMax = Math.max(...values);
  const yScale = scaleLinear<number>({
    domain: [yMin, yMax === yMin ? yMin + 1 : yMax],
    range: [height - 4, 4],
  });

  return (
    <svg width={width} height={height}>
      <LinePath
        data={values}
        x={(_, i) => xScale(i) ?? 0}
        y={(d) => yScale(d) ?? 0}
        stroke="#10b981"
        strokeWidth={1.5}
        curve={curveMonotoneX}
      />
    </svg>
  );
}

// ── Security Tree Map (visx) ─────────────────────────────────────────────────

function SecurityTreeMap({
  security,
  width,
  height,
}: {
  security: EquitySecurity | DebtSecurity;
  width: number;
  height: number;
}) {
  const nodes = buildTreeMapData(security);
  if (nodes.length === 0) return null;

  const colorScale = scaleLinear<string>({
    domain: [-1, 0, 1],
    range: ["#ef4444", "#374151", "#10b981"],
  });

  type TreeMapDatum = TreeMapNode | { name: string; children: TreeMapNode[] };

  const rootData: TreeMapDatum = {
    name: "root",
    children: nodes,
  };

  const root = hierarchy<TreeMapDatum>(rootData)
    .sum((d) => ("size" in d ? (d as TreeMapNode).size : 0))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  return (
    <svg width={width} height={height}>
      <Treemap
        root={root}
        size={[width, height]}
        tile={treemapSquarify}
        padding={2}
        round
      >
        {(treemap) => (
          <Group>
            {treemap
              .descendants()
              .filter((d) => d.depth === 1)
              .map((node, i) => {
                const nw = node.x1 - node.x0;
                const nh = node.y1 - node.y0;
                const datum = node.data as unknown as TreeMapNode;
                const clampedFontSize = Math.max(9, Math.min(14, nw / 8));
                return (
                  <Group key={i} top={node.y0} left={node.x0}>
                    <rect
                      width={nw}
                      height={nh}
                      fill={colorScale(datum.changePct) ?? "#374151"}
                      fillOpacity={0.85}
                      stroke="rgba(0,0,0,0.6)"
                      strokeWidth={1}
                    >
                      <title>
                        {datum.name}
                        {"\n"}
                        {datum.changePct > 0 ? "+" : ""}
                        {(datum.changePct * 100).toFixed(1)}% change
                      </title>
                    </rect>
                    {nw > 60 && nh > 30 && (
                      <Text
                        x={nw / 2}
                        y={nh / 2 - 6}
                        textAnchor="middle"
                        verticalAnchor="middle"
                        fill="#fff"
                        fontFamily="'Syne', sans-serif"
                        fontWeight={600}
                        fontSize={clampedFontSize}
                        width={nw - 8}
                      >
                        {datum.name}
                      </Text>
                    )}
                    {nw > 60 && nh > 44 && (
                      <Text
                        x={nw / 2}
                        y={nh / 2 + 10}
                        textAnchor="middle"
                        verticalAnchor="middle"
                        fill="rgba(255,255,255,0.7)"
                        fontFamily="'DM Mono', monospace"
                        fontSize={9}
                      >
                        {`${datum.changePct > 0 ? "+" : ""}${(datum.changePct * 100).toFixed(1)}%`}
                      </Text>
                    )}
                  </Group>
                );
              })}
          </Group>
        )}
      </Treemap>
    </svg>
  );
}

// ── Security Holders Table ───────────────────────────────────────────────────

function SecurityHoldersTable({
  security,
}: {
  security: EquitySecurity | DebtSecurity;
}) {
  const eq = isEquity(security);
  const holders = buildHolderTimeSeries(security);

  const thStyle: React.CSSProperties = {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: "0.6rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#34d399",
    padding: "8px 12px",
    textAlign: "left",
    borderBottom: "1px solid rgba(16,185,129,0.12)",
    whiteSpace: "nowrap",
  };
  const tdStyle: React.CSSProperties = {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 500,
    fontSize: "0.82rem",
    padding: "10px 12px",
    borderBottom: "1px solid rgba(16,185,129,0.06)",
    verticalAlign: "middle",
  };

  return (
    <div style={{ maxHeight: 420, overflowY: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead
          style={{
            position: "sticky",
            top: 0,
            background: "#0a0a0a",
            zIndex: 1,
          }}
        >
          <tr>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>PermID</th>
            <th style={thStyle}>Trend</th>
            {eq && <th style={thStyle}>Shares Owned</th>}
            <th style={thStyle}>Market Value</th>
            <th style={thStyle}>Source</th>
          </tr>
        </thead>
        <tbody>
          {holders.map((h, i) => (
            <tr
              key={h.permId ?? h.name}
              className="hover-row"
              style={{ opacity: h.divested ? 0.4 : 1 }}
            >
              <td
                style={{
                  ...tdStyle,
                  color: "#34d399",
                  fontSize: "0.65rem",
                }}
              >
                {i + 1}
              </td>
              <td style={{ ...tdStyle, color: "#6ee7b7" }}>
                {h.permId ? (
                  <a
                    href={`/companies/${h.permId}`}
                    style={{ color: "#6ee7b7", textDecoration: "none" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#34d399")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#6ee7b7")
                    }
                  >
                    {h.name}
                  </a>
                ) : (
                  h.name
                )}
                {h.divested && (
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.55rem",
                      color: "#ef4444",
                      marginLeft: 8,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Divested
                  </span>
                )}
              </td>
              <td style={tdStyle}>
                <PermIdBadge permId={h.permId} />
              </td>
              <td style={tdStyle}>
                <HolderSparkline values={h.dataPoints.map((d) => d.value)} />
              </td>
              {eq && (
                <td
                  style={{
                    ...tdStyle,
                    fontFamily: "'Syne', sans-serif",
                    color: "#34d399",
                  }}
                >
                  {fmtShares(h.latestValue)}
                </td>
              )}
              <td
                style={{
                  ...tdStyle,
                  fontFamily: "'Syne', sans-serif",
                  color: "#34d399",
                }}
              >
                {fmtCurrency(h.latestMarketValue)}
              </td>
              <td style={tdStyle}>
                {h.sources[0] && <SourceLink source={h.sources[0]} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Securities Section (revised) ─────────────────────────────────────────────

function SecuritiesSection({
  securities,
}: {
  securities: (EquitySecurity | DebtSecurity)[];
}) {
  const [secIdx, setSecIdx] = useState(0);
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  if (securities.length === 0) return null;
  const sec = securities[secIdx];
  const eq = isEquity(sec);
  const lastSnap = sec.history[sec.history.length - 1];

  return (
    <div style={{ display: "flex", gap: 24 }}>
      {/* Sidebar */}
      <div
        style={{
          width: 180,
          flexShrink: 0,
          borderRight: "1px solid rgba(16,185,129,0.1)",
          paddingRight: 16,
        }}
      >
        {securities.map((s, i) => {
          const active = secIdx === i;
          return (
            <button
              key={i}
              onClick={() => setSecIdx(i)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "12px 14px",
                marginBottom: 4,
                border: "none",
                borderLeft: active
                  ? "3px solid #10b981"
                  : "3px solid transparent",
                background: active ? "rgba(16,185,129,0.08)" : "transparent",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  color: active ? "#6ee7b7" : "#34d399",
                  fontWeight: active ? 700 : 500,
                }}
              >
                {s.symbol}
              </div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "0.6rem",
                  color: active ? "#34d399" : "rgba(52,211,153,0.5)",
                  marginTop: 2,
                }}
              >
                {s.class}
              </div>
              {"jurisdiction" in s && s.jurisdiction && (
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "0.55rem",
                    color: "rgba(110,231,179,0.5)",
                    marginTop: 1,
                  }}
                >
                  {s.jurisdiction}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Chart / Table tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <TabButton
            label="Chart"
            active={viewMode === "chart"}
            onClick={() => setViewMode("chart")}
          />
          <TabButton
            label="Table"
            active={viewMode === "table"}
            onClick={() => setViewMode("table")}
          />
        </div>

        {/* Security header */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            marginBottom: 16,
            flexWrap: "wrap" as const,
          }}
        >
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "2.5rem",
              color: "#34d399",
              letterSpacing: "0.04em",
              lineHeight: 1,
            }}
          >
            {sec.symbol}
          </span>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 600,
              fontSize: "0.82rem",
              color: "#34d399",
            }}
          >
            {sec.class}
          </span>
          {"jurisdiction" in sec && sec.jurisdiction && (
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 500,
                fontSize: "0.75rem",
                color: "#6ee7b7",
              }}
            >
              {sec.jurisdiction}
            </span>
          )}
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.65rem",
              color: "#34d399",
            }}
          >
            {fmtYear(sec.from)} – {fmtYear(sec.to)}
          </span>
        </div>

        {/* Key stat from latest snapshot */}
        {lastSnap && (
          <div style={{ marginBottom: 24 }}>
            {eq ? (
              <div>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "2rem",
                    color: "#34d399",
                    lineHeight: 1.1,
                  }}
                >
                  {fmtShares((lastSnap as EquitySnapshot).outstandingShares)}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.58rem",
                    color: "#34d399",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase" as const,
                    marginTop: 4,
                  }}
                >
                  Shares Outstanding · as of {fmtDate(lastSnap.asOf)}
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "2rem",
                    color: "#34d399",
                    lineHeight: 1.1,
                  }}
                >
                  {fmtCurrency((lastSnap as DebtSnapshot).principalAmount)}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.58rem",
                    color: "#34d399",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase" as const,
                    marginTop: 4,
                  }}
                >
                  Principal Outstanding · as of {fmtDate(lastSnap.asOf)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* View content */}
        {viewMode === "chart" ? (
          <SecurityTreeMap security={sec} width={780} height={400} />
        ) : (
          <SecurityHoldersTable security={sec} />
        )}
      </div>
    </div>
  );
}

// ── 5f. COMMERCIAL DEBT SECTION ───────────────────────────────────────────────

function CommercialDebtSection({ debts }: { debts: CommercialDebt[] }) {
  const thStyle: React.CSSProperties = {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: "0.6rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#34d399",
    padding: "8px 12px",
    textAlign: "left",
    borderBottom: "1px solid rgba(16,185,129,0.12)",
    whiteSpace: "nowrap",
  };
  const tdStyle: React.CSSProperties = {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 500,
    fontSize: "0.82rem",
    padding: "10px 12px",
    borderBottom: "1px solid rgba(16,185,129,0.06)",
    verticalAlign: "middle",
  };

  const statLabel: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.58rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#34d399",
    marginBottom: 6,
  };
  const statVal: React.CSSProperties = {
    fontFamily: "'Syne', sans-serif",
    fontSize: "1.8rem",
    color: "#34d399",
    lineHeight: 1.1,
  };

  return (
    <div>
      {/* Summary banner */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          border: "1px solid rgba(16,185,129,0.12)",
          background: "rgba(16,185,129,0.03)",
          marginBottom: 28,
        }}
      >
        {[
          { label: "Total Outstanding", value: totalDebt(debts) },
          { label: "Next Maturity", value: nextMaturity(debts) },
          { label: "Blended Rate", value: blendedRate(debts) },
        ].map(({ label, value }, i) => (
          <div
            key={i}
            style={{
              padding: "20px 24px",
              borderRight:
                i < 2 ? "1px solid rgba(16,185,129,0.12)" : undefined,
            }}
          >
            <div style={statLabel}>{label}</div>
            <div style={statVal}>{value}</div>
          </div>
        ))}
      </div>

      {/* Instruments table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Instrument</th>
              <th style={thStyle}>Holder</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Rate</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Maturity</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Source</th>
            </tr>
          </thead>
          <tbody>
            {debts.map((d, i) => (
              <tr key={i} className="hover-row">
                <td style={{ ...tdStyle, color: "#6ee7b7" }}>
                  {d.instrumentName}
                </td>
                <td style={{ ...tdStyle, color: "#a7f3d0" }}>
                  {d.debtHolder.permId ? (
                    <a
                      href={`/companies/${d.debtHolder.permId}`}
                      style={{ color: "#6ee7b7", textDecoration: "none" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#34d399")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#6ee7b7")
                      }
                    >
                      {d.debtHolder.name}
                    </a>
                  ) : (
                    d.debtHolder.name
                  )}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    fontFamily: "'Syne', sans-serif",
                    color: "#34d399",
                  }}
                >
                  {fmtCurrency(d.amount)}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    fontFamily: "'Syne', sans-serif",
                    color: "#fcd34d",
                  }}
                >
                  {d.interestRate.toFixed(2)}%
                </td>
                <td style={tdStyle}>
                  <TypePill type={d.type} />
                </td>
                <td
                  style={{
                    ...tdStyle,
                    color:
                      d.maturityDate < TODAY
                        ? "rgba(110,231,179,0.3)"
                        : "#6ee7b7",
                    textDecoration:
                      d.maturityDate < TODAY ? "line-through" : undefined,
                  }}
                >
                  {fmtDate(d.maturityDate)}
                </td>
                <td style={tdStyle}>
                  <StatusBadge active={isActive(d)} />
                </td>
                <td style={tdStyle}>
                  {d.sources[0] && <SourceLink source={d.sources[0]} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 6. STICKY NAV ─────────────────────────────────────────────────────────────

function StickyNav({ company }: { company: Company }) {
  const currentEquity = company.historicSecurities.find(
    (s) => s.to === null && isEquity(s as EquitySecurity | DebtSecurity),
  );

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.92)",
        borderBottom: "1px solid rgba(16,185,129,0.15)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        padding: "0 48px",
        height: 48,
        gap: 32,
      }}
    >
      <a
        href="/"
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "1.1rem",
          color: "#10b981",
          textDecoration: "none",
          letterSpacing: "0.06em",
          marginRight: 8,
        }}
      >
        FTM2J
      </a>

      <div
        style={{
          width: "1px",
          height: 20,
          background: "rgba(16,185,129,0.2)",
        }}
      />

      {[
        { label: "Overview", href: "#header" },
        { label: "Corporate Structure", href: "#corporate-structure" },
        { label: "Securities", href: "#securities" },
        { label: "Commercial Debt", href: "#commercial-debt" },
      ].map(({ label, href }) => (
        <a
          key={href}
          href={href}
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.62rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            color: "#34d399",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#34d399")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#34d399")}
        >
          {label}
        </a>
      ))}

      <div style={{ flex: 1 }} />

      {currentEquity && (
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.65rem",
            color: "#10b981",
            border: "1px solid rgba(16,185,129,0.3)",
            padding: "2px 10px",
            letterSpacing: "0.08em",
          }}
        >
          {(currentEquity as EquitySecurity).symbol}
        </span>
      )}
    </nav>
  );
}

// ── PAGE SHELL ────────────────────────────────────────────────────────────────

export default function CompanyTestPage() {
  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#fff" }}>
      {/* Scanlines overlay */}
      {/* <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 9999,
          background:
            "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.22) 3px, rgba(0,0,0,0.06) 4px)",
        }}
      /> */}

      <StickyNav company={COMPANY} />

      <main
        style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px 80px" }}
      >
        <section id="header">
          <CompanyHeader company={COMPANY} />
        </section>

        <section id="corporate-structure" style={{ marginTop: 64 }}>
          <SectionLabel label="Corporate Structure" />

          <div style={{ marginTop: 32 }}>
            <SectionLabel label="Leadership" />
            <LeadershipGantt leaders={COMPANY.historicLeadership} />
          </div>

          <div style={{ marginTop: 52 }}>
            <SectionLabel label="Subsidiaries & Corporate Relationships" />
            <SubsidiariesTable
              relationships={COMPANY.historicCorporateRelationships}
              companyPermId={COMPANY.permId}
            />
          </div>

          <div style={{ marginTop: 52 }}>
            <SectionLabel label="Addresses" />
            <AddressesPanel
              inc={COMPANY.historicIncorporationAddresses}
              dom={COMPANY.historicDomicileAddresses}
            />
          </div>
        </section>

        <section id="securities" style={{ marginTop: 64 }}>
          <SectionLabel label="Securities" />
          <SecuritiesSection securities={COMPANY.historicSecurities} />
        </section>

        <section id="commercial-debt" style={{ marginTop: 64 }}>
          <SectionLabel label="Commercial Debt" />
          <CommercialDebtSection debts={COMPANY.historicCommercialDebt} />
        </section>
      </main>

      <Footer />

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; background: rgba(0,0,0,0.3); }
        ::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.35); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(16,185,129,0.6); }
        .hover-row:hover { background: rgba(16,185,129,0.05) !important; }
        .hover-row:nth-child(even) { background: rgba(16,185,129,0.02); }
      `}</style>
    </div>
  );
}
