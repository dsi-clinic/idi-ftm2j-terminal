"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

import { useSiteSearch } from "@/hooks/use-site-search";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Company {
  permId: string;
  lei: string;
  companyName: string;
  countryName: string;
  countryCode: string;
  tickers: string[];
  sectors: string[];
  subsidiaries: string[];
  url: string;
}

const DISPLAY_LIMIT = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toCompany(raw: Record<string, string>): Company {
  return {
    ...raw,
    tickers: JSON.parse(raw.tickers ?? "[]"),
    sectors: JSON.parse(raw.sectors ?? "[]"),
    subsidiaries: JSON.parse(raw.subsidiaries ?? "[]"),
  } as Company;
}

function highlight(text: string, query: string): React.ReactNode {
  console.log("Text:", text);
  console.log("Query:", query);
  if (!text) return "";
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
  onMouseLeave,
  onClick,
}: {
  company: Company;
  query: string;
  active: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}) {
  const shownSubs = company.subsidiaries.slice(0, 2);
  const extraSubs = company.subsidiaries.length - shownSubs.length;
  console.log(company);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        padding: "9px 18px 9px 20px",
        cursor: "pointer",
        background: active ? "rgba(16,185,129,0.06)" : "transparent",
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
          {highlight(company.companyName, query)}
          {company.countryCode && (
            <span
              style={{
                fontSize: "0.62rem",
                color: "rgba(52,211,153,0.38)",
                marginLeft: 6,
              }}
            >
              ({highlight(company.countryCode, query)})
            </span>
          )}
        </span>

        <div
          style={{
            display: "flex",
            gap: 6,
            flexShrink: 0,
          }}
        >
          {company.tickers.map((ticker) => (
            <span
              key={ticker}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.72rem",
                letterSpacing: "0.12em",
                color: active ? "#34d399" : "#10b981",
                textShadow: active ? "0 0 10px rgba(52,211,153,0.45)" : "none",
                transition: "color 0.12s, text-shadow 0.12s",
                whiteSpace: "nowrap",
                border: "1px solid",
                borderColor: active
                  ? "rgba(52,211,153,0.4)"
                  : "rgba(16,185,129,0.25)",
                padding: "1px 6px",
              }}
            >
              {highlight(ticker, query)}
            </span>
          ))}
        </div>
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
            Direct Subsidaries:
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
  const router = useRouter();
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

  const { handleSearch, results } =
    useSiteSearch<Record<string, string>>(DISPLAY_LIMIT);
  const shown = results.map(toCompany).slice(0, DISPLAY_LIMIT);
  const overflow = results.length - DISPLAY_LIMIT;
  const isOpen = focused && query.trim().length > 0 && results.length > 0;

  // Trigger search when query changes
  useEffect(() => {
    handleSearch(query);
  }, [query]);

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
        !containerRef.current.contains(e.target as Node) &&
        dropdownElRef.current &&
        !dropdownElRef.current.contains(e.target as Node)
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
        setQuery(shown[activeIdx].companyName);
        setFocused(false);
      }
    },
    [isOpen, shown, overflow, activeIdx],
  );

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
                  onMouseLeave={() => setActiveIdx(-1)}
                  onClick={() => router.push(`/companies/${company.permId}`)}
                />
              </div>
            ))}

            {/* Footer */}
            {overflow > 0 && (
              <div style={{ borderTop: "1px solid rgba(16,185,129,0.08)" }}>
                <a
                  href="#"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "rgba(16,185,129,0.06)";
                    el.style.color = "#c3ffe7";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "transparent";
                    el.style.color = "#10b981";
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "9px 18px 9px 20px",
                    background: "transparent",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#10b981",
                    textDecoration: "none",
                    textAlign: "right",
                    transition: "background 0.12s, color 0.12s",
                    boxSizing: "border-box",
                  }}
                  onClick={() => router.push("/companies")}
                >
                  View all {results.length} matches
                </a>
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
