"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface Company {
  ticker: string;
  name: string;
  country: string;
  countryCode: string;
  sectors: string[];
  permId: string;
  subsidiaries: string[];
}

const MOCK_COMPANIES: Company[] = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    country: "United States",
    countryCode: "US",
    sectors: ["Technology", "Consumer Electronics"],
    permId: "4295905573",
    subsidiaries: [
      "Apple Retail LLC",
      "Beats Electronics LLC",
      "Shazam Entertainment Ltd.",
      "Intel Mobile Communications",
    ],
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    country: "United States",
    countryCode: "US",
    sectors: ["Technology", "Cloud Services"],
    permId: "4295907168",
    subsidiaries: [
      "LinkedIn Corporation",
      "GitHub Inc.",
      "Activision Blizzard Inc.",
      "Nuance Communications",
    ],
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    country: "United States",
    countryCode: "US",
    sectors: ["E-Commerce", "Cloud Services"],
    permId: "4295904174",
    subsidiaries: [
      "Amazon Web Services Inc.",
      "Whole Foods Market Inc.",
      "Twitch Interactive Inc.",
      "Zappos.com LLC",
    ],
  },
  {
    ticker: "TSLA",
    name: "Tesla, Inc.",
    country: "United States",
    countryCode: "US",
    sectors: ["Automotive", "Clean Energy"],
    permId: "4297091700",
    subsidiaries: [
      "Tesla Motors Ltd.",
      "SolarCity Corporation",
      "Maxwell Technologies Inc.",
    ],
  },
  {
    ticker: "GOOG",
    name: "Alphabet Inc.",
    country: "United States",
    countryCode: "US",
    sectors: ["Technology", "Digital Advertising"],
    permId: "5030853586",
    subsidiaries: [
      "Google LLC",
      "YouTube LLC",
      "DeepMind Technologies Ltd.",
      "Waymo LLC",
      "Verily Life Sciences LLC",
    ],
  },
  {
    ticker: "META",
    name: "Meta Platforms Inc.",
    country: "United States",
    countryCode: "US",
    sectors: ["Social Media", "Technology"],
    permId: "4298007433",
    subsidiaries: ["Instagram LLC", "WhatsApp Inc.", "Oculus VR LLC"],
  },
  {
    ticker: "BHP",
    name: "BHP Group Limited",
    country: "Australia",
    countryCode: "AU",
    sectors: ["Mining", "Natural Resources"],
    permId: "4295402839",
    subsidiaries: [
      "BHP Billiton Coal Pty Ltd.",
      "BHP Iron Ore Pty Ltd.",
      "Olympic Dam Corporation Pty Ltd.",
    ],
  },
  {
    ticker: "RIO",
    name: "Rio Tinto plc",
    country: "United Kingdom",
    countryCode: "GB",
    sectors: ["Mining", "Natural Resources"],
    permId: "4295402660",
    subsidiaries: [
      "Rio Tinto Alcan Inc.",
      "Rio Tinto Iron Ore Pty Ltd.",
      "Turquoise Hill Resources Ltd.",
      "Energy Resources of Australia Ltd.",
    ],
  },
  {
    ticker: "NESN",
    name: "Nestlé S.A.",
    country: "Switzerland",
    countryCode: "CH",
    sectors: ["Food & Beverage", "Consumer Staples"],
    permId: "4295860809",
    subsidiaries: [
      "Nespresso S.A.",
      "Purina PetCare Company",
      "Gerber Products Company",
      "San Pellegrino S.p.A.",
    ],
  },
  {
    ticker: "TM",
    name: "Toyota Motor Corporation",
    country: "Japan",
    countryCode: "JP",
    sectors: ["Automotive", "Manufacturing"],
    permId: "4295866664",
    subsidiaries: [
      "Lexus International Co.",
      "Daihatsu Motor Co. Ltd.",
      "Hino Motors Ltd.",
      "Toyota Financial Services Corporation",
    ],
  },
  {
    ticker: "VALE",
    name: "Vale S.A.",
    country: "Brazil",
    countryCode: "BR",
    sectors: ["Mining", "Iron Ore"],
    permId: "4295404590",
    subsidiaries: [
      "Vale Canada Limited",
      "Vale International S.A.",
      "Companhia Coreano-Brasileira de Pelotização",
    ],
  },
  {
    ticker: "GLEN",
    name: "Glencore plc",
    country: "United Kingdom",
    countryCode: "GB",
    sectors: ["Mining", "Trading"],
    permId: "5037808688",
    subsidiaries: [
      "Glencore Coal Pty Ltd.",
      "Prodeco S.A.",
      "Katanga Mining Limited",
      "Mutanda Mining SARL",
    ],
  },
  {
    ticker: "SHEL",
    name: "Shell plc",
    country: "United Kingdom",
    countryCode: "GB",
    sectors: ["Oil & Gas", "Energy"],
    permId: "4295861685",
    subsidiaries: [
      "Shell Oil Company",
      "Shell International Trading and Shipping",
      "BG Group Limited",
    ],
  },
  {
    ticker: "BP",
    name: "BP p.l.c.",
    country: "United Kingdom",
    countryCode: "GB",
    sectors: ["Oil & Gas", "Energy"],
    permId: "4295402095",
    subsidiaries: [
      "BP America Inc.",
      "BP Exploration Operating Company Ltd.",
      "Castrol Limited",
    ],
  },
  {
    ticker: "CVX",
    name: "Chevron Corporation",
    country: "United States",
    countryCode: "US",
    sectors: ["Oil & Gas", "Energy"],
    permId: "4295904689",
    subsidiaries: [
      "Chevron U.S.A. Inc.",
      "Texaco Inc.",
      "Chevron Phillips Chemical Company LLC",
    ],
  },
  {
    ticker: "XOM",
    name: "ExxonMobil Corporation",
    country: "United States",
    countryCode: "US",
    sectors: ["Oil & Gas", "Energy"],
    permId: "4295899836",
    subsidiaries: [
      "Esso Petroleum Company Ltd.",
      "ExxonMobil Chemical Company",
      "XTO Energy Inc.",
    ],
  },
  {
    ticker: "WMT",
    name: "Walmart Inc.",
    country: "United States",
    countryCode: "US",
    sectors: ["Retail", "Consumer Staples"],
    permId: "4295907296",
    subsidiaries: [
      "Sam's Club",
      "Walmart Canada Corp.",
      "Flipkart Private Limited",
      "Asda Group Limited",
    ],
  },
  {
    ticker: "SAMSUNG",
    name: "Samsung Electronics Co. Ltd.",
    country: "South Korea",
    countryCode: "KR",
    sectors: ["Technology", "Semiconductors"],
    permId: "4295897580",
    subsidiaries: [
      "Samsung Semiconductor Inc.",
      "Samsung Display Co. Ltd.",
      "Harman International Industries Inc.",
    ],
  },
  {
    ticker: "LVMH",
    name: "LVMH Moët Hennessy Louis Vuitton SE",
    country: "France",
    countryCode: "FR",
    sectors: ["Luxury Goods", "Consumer Discretionary"],
    permId: "4295906816",
    subsidiaries: [
      "Louis Vuitton Malletier",
      "Christian Dior Couture S.A.",
      "Moët & Chandon",
      "Sephora S.A.",
      "Bulgari S.p.A.",
    ],
  },
  {
    ticker: "SAP",
    name: "SAP SE",
    country: "Germany",
    countryCode: "DE",
    sectors: ["Technology", "Enterprise Software"],
    permId: "4295906819",
    subsidiaries: [
      "SAP America Inc.",
      "Qualtrics International Inc.",
      "Concur Technologies Inc.",
    ],
  },
  {
    ticker: "ASML",
    name: "ASML Holding N.V.",
    country: "Netherlands",
    countryCode: "NL",
    sectors: ["Semiconductors", "Technology"],
    permId: "4295906833",
    subsidiaries: ["Cymer LLC", "Brion Technologies Inc.", "HMI Holdings B.V."],
  },
  {
    ticker: "BABA",
    name: "Alibaba Group Holding Limited",
    country: "China",
    countryCode: "CN",
    sectors: ["E-Commerce", "Technology"],
    permId: "5065509496",
    subsidiaries: [
      "Taobao Marketplace",
      "Tmall.com",
      "AliExpress",
      "Ant Group Co. Ltd.",
      "Lazada Group",
    ],
  },
  {
    ticker: "NVO",
    name: "Novo Nordisk A/S",
    country: "Denmark",
    countryCode: "DK",
    sectors: ["Pharmaceuticals", "Healthcare"],
    permId: "4295861396",
    subsidiaries: [
      "Novo Nordisk Inc.",
      "Novo Nordisk Pharma Ltd.",
      "Emisphere Technologies Inc.",
    ],
  },
  {
    ticker: "NOVN",
    name: "Novartis AG",
    country: "Switzerland",
    countryCode: "CH",
    sectors: ["Pharmaceuticals", "Healthcare"],
    permId: "4295861469",
    subsidiaries: [
      "Sandoz International GmbH",
      "Alcon Laboratories Inc.",
      "Advanced Accelerator Applications S.A.",
    ],
  },
  {
    ticker: "TCEHY",
    name: "Tencent Holdings Limited",
    country: "China",
    countryCode: "CN",
    sectors: ["Technology", "Social Media"],
    permId: "4297151714",
    subsidiaries: [
      "WeChat (Weixin)",
      "Riot Games Inc.",
      "Epic Games Inc.",
      "Supercell Oy",
      "Tencent Music Entertainment",
    ],
  },
];

const DISPLAY_LIMIT = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: "transparent",
          color: "#34d399",
          fontWeight: 700,
          textShadow: "0 0 8px rgba(52,211,153,0.5)",
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function filterCompanies(q: string): Company[] {
  const term = q.toLowerCase().trim();
  if (!term) return [];
  return MOCK_COMPANIES.filter(
    (c) =>
      c.ticker.toLowerCase().includes(term) ||
      c.name.toLowerCase().includes(term) ||
      c.country.toLowerCase().includes(term) ||
      c.countryCode.toLowerCase().includes(term) ||
      c.sectors.some((s) => s.toLowerCase().includes(term)) ||
      c.permId.includes(term) ||
      c.subsidiaries.some((s) => s.toLowerCase().includes(term)),
  );
}

// ─── Sector Pill ──────────────────────────────────────────────────────────────

function SectorPill({ label }: { label: string }) {
  return (
    <span
      style={{
        fontSize: "0.56rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "rgba(52,211,153,0.55)",
        border: "1px solid rgba(52,211,153,0.2)",
        padding: "1px 6px",
        whiteSpace: "nowrap",
        fontFamily: "'DM Mono', monospace",
        lineHeight: 1.8,
      }}
    >
      {label}
    </span>
  );
}

// ─── Result Row ───────────────────────────────────────────────────────────────

function ResultRow({
  company,
  query,
  active,
  onMouseEnter,
  onClick,
}: {
  company: Company;
  query: string;
  active: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}) {
  const shownSubs = company.subsidiaries.slice(0, 2);
  const extraSubs = company.subsidiaries.length - shownSubs.length;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      style={{
        padding: "9px 18px 9px 20px",
        cursor: "pointer",
        background: active ? "rgba(16,185,129,0.06)" : "transparent",
        borderLeft: active ? "2px solid #10b981" : "2px solid transparent",
        transition: "background 0.12s, border-color 0.12s",
      }}
    >
      {/* ── Primary row: name (country) | ticker ── */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.78rem",
            color: active ? "#c3ffe7" : "rgba(110,231,179,0.85)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            transition: "color 0.12s",
          }}
        >
          {highlight(company.name, query)}
          <span
            style={{
              fontSize: "0.62rem",
              color: "rgba(52,211,153,0.38)",
              marginLeft: 6,
            }}
          >
            ({highlight(company.countryCode, query)})
          </span>
        </span>

        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.72rem",
            letterSpacing: "0.12em",
            color: active ? "#34d399" : "#10b981",
            textShadow: active ? "0 0 10px rgba(52,211,153,0.45)" : "none",
            transition: "color 0.12s, text-shadow 0.12s",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {highlight(company.ticker, query)}
        </span>
      </div>

      {/* ── Subsidiary row ── */}
      <div
        style={{
          marginTop: 5,
          paddingTop: 5,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.52rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(16,185,129,0.35)",
              flexShrink: 0,
            }}
          >
            Subs
          </span>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.62rem",
              color: active
                ? "rgba(110,231,179,0.5)"
                : "rgba(110,231,179,0.32)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              transition: "color 0.12s",
            }}
          >
            {shownSubs.map((s, i) => (
              <span key={s}>
                {highlight(s, query)}
                {i < shownSubs.length - 1 && (
                  <span
                    style={{ color: "rgba(16,185,129,0.2)", margin: "0 5px" }}
                  >
                    ·
                  </span>
                )}
              </span>
            ))}
            {extraSubs > 0 && (
              <span style={{ color: "rgba(52,211,153,0.4)", marginLeft: 6 }}>
                +{extraSubs}
              </span>
            )}
          </span>
        </div>

        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {company.sectors.slice(0, 2).map((s) => (
            <SectorPill key={s} label={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SearchAutocomplete() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [dropdownRect, setDropdownRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRowRef = useRef<HTMLDivElement>(null);

  const allResults = filterCompanies(query);
  const shown = allResults.slice(0, DISPLAY_LIMIT);
  const overflow = allResults.length - DISPLAY_LIMIT;
  const isOpen = focused && query.trim().length > 0 && allResults.length > 0;

  // Reset active index when results change
  useEffect(() => {
    setActiveIdx(-1);
  }, [query]);

  const dropdownElRef = useRef<HTMLDivElement>(null);

  const updateRect = useCallback(() => {
    if (!inputRowRef.current) return;
    const r = inputRowRef.current.getBoundingClientRect();
    setDropdownRect({ top: r.bottom, left: r.left, width: r.width });
  }, []);

  const updateRectImperative = useCallback(() => {
    if (!inputRowRef.current || !dropdownElRef.current) return;
    const r = inputRowRef.current.getBoundingClientRect();
    dropdownElRef.current.style.top = `${r.bottom}px`;
    dropdownElRef.current.style.left = `${r.left}px`;
    dropdownElRef.current.style.width = `${r.width}px`;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", updateRectImperative, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRectImperative, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [updateRect, updateRectImperative]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;
      const total = shown.length + (overflow > 0 ? 1 : 0); // +1 for "more" row
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => (i + 1) % total);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => (i - 1 + total) % total);
      } else if (e.key === "Escape") {
        setFocused(false);
        inputRef.current?.blur();
      } else if (
        e.key === "Enter" &&
        activeIdx >= 0 &&
        activeIdx < shown.length
      ) {
        setQuery(shown[activeIdx].name);
        setFocused(false);
      }
    },
    [isOpen, shown, overflow, activeIdx],
  );

  const selectCompany = (c: Company) => {
    setQuery(c.name);
    setFocused(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* ── Input Row ────────────────────────────────────────────────────── */}
      <div
        ref={inputRowRef}
        style={{
          display: "flex",
          alignItems: "center",
          borderStyle: "solid",
          borderWidth: "1px",
          borderTopColor: focused ? "#10b981" : "rgba(16,185,129,0.4)",
          borderRightColor: focused ? "#10b981" : "rgba(16,185,129,0.4)",
          borderLeftColor: focused ? "#10b981" : "rgba(16,185,129,0.4)",
          borderBottomColor: isOpen
            ? "rgba(16,185,129,0.15)"
            : focused
              ? "#10b981"
              : "rgba(16,185,129,0.4)",
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(12px)",
          boxShadow: focused
            ? "0 0 0 1px #10b981, 0 0 40px rgba(16,185,129,0.15)"
            : "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      >
        {/* Search icon */}
        <span
          style={{
            padding: "0 20px",
            color: "#10b981",
            borderRight: "1px solid rgba(16,185,129,0.25)",
            height: "58px",
            display: "flex",
            alignItems: "center",
            userSelect: "none",
            filter: "drop-shadow(0 0 6px rgba(16,185,129,0.5))",
            flexShrink: 0,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: 18, height: 18 }}
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="22" y2="22" />
          </svg>
        </span>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            updateRect();
            setFocused(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search by company name, ticker, PermID, sector, or country"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            padding: "0 24px",
            height: "58px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.95rem",
            color: "#6ee7b7",
            caretColor: "#10b981",
          }}
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 12px",
              color: "rgba(52,211,153,0.4)",
              fontSize: "1.1rem",
              lineHeight: 1,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = "rgba(52,211,153,0.9)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "rgba(52,211,153,0.4)")
            }
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* ── Dropdown (portal) ────────────────────────────────────────────── */}
      {isOpen &&
        dropdownRect &&
        createPortal(
          <div
            ref={dropdownElRef}
            style={{
              position: "fixed",
              top: dropdownRect.top,
              left: dropdownRect.left,
              width: dropdownRect.width,
              background: "rgb(0,6,3)",
              borderStyle: "solid",
              borderWidth: "1px",
              borderTopWidth: 0,
              borderColor: "rgba(16,185,129,0.4)",
              boxShadow:
                "0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(16,185,129,0.1)",
              zIndex: 9999,
              overflow: "hidden",
            }}
          >
            {/* Results */}
            {shown.map((company, i) => (
              <div key={company.permId}>
                {i > 0 && (
                  <div
                    style={{
                      height: "1px",
                      background: "rgba(16,185,129,0.08)",
                      margin: "0 18px",
                    }}
                  />
                )}
                <ResultRow
                  company={company}
                  query={query}
                  active={activeIdx === i}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => selectCompany(company)}
                />
              </div>
            ))}

            {/* Footer */}
            {overflow > 0 && (
              <div style={{ borderTop: "1px solid rgba(16,185,129,0.12)" }}>
                <a
                  href="#"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "#34d399";
                    el.style.boxShadow = "0 0 24px rgba(16,185,129,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "#10b981";
                    el.style.boxShadow = "none";
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0 28px",
                    height: "44px",
                    lineHeight: "44px",
                    background: "#10b981",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#000",
                    textDecoration: "none",
                    textAlign: "right",
                    transition: "background 0.2s, box-shadow 0.2s",
                    boxSizing: "border-box",
                  }}
                >
                  View all {allResults.length} matches
                </a>
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
