"use client";

import { useState, useRef } from "react";
import { useNetworkCanvas } from "../hooks/use-network-canvas";

const FOOTER_LINKS = [
  {
    heading: "IDI Tool Suite",
    links: [
      "DeBIT",
      "Shareholder Tracker",
      "Commercial Debt Tracker",
      "Follow the Money Toolkit",
    ],
  },
  {
    heading: "Site Map",
    links: ["Home", "Company Search", "About/Methodology", "FAQ", "Downloads"],
  },
  {
    heading: "Acknowledgments",
    links: [],
    text: "This project was built by Inclusive Development International in collaboration with the University of Chicago Data Science Institute, with support from the Charles Stewart Mott Foundation.",
  },
];

interface FooterLinkProps {
  label: string;
}

function FooterLink({ label }: FooterLinkProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="#"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: "none",
        fontSize: "0.78rem",
        color: hovered ? "#6ee7b7" : "rgba(110,231,179,0.55)",
        letterSpacing: "0.02em",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        transition: "color 0.2s",
        textShadow: hovered ? "0 0 12px rgba(110,231,179,0.4)" : "none",
      }}
    >
      <span
        style={{
          color: hovered ? "#10b981" : "#065f46",
          fontSize: "1rem",
          transition: "color 0.2s, transform 0.2s",
          transform: hovered ? "translateX(3px)" : "translateX(0)",
          display: "inline-block",
        }}
      >
        ›
      </span>
      {label}
    </a>
  );
}

interface SocialBtnProps {
  path: React.ReactNode;
}

function SocialBtn({ path }: SocialBtnProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32,
        height: 32,
        border: `1px solid ${hovered ? "#10b981" : "rgba(52,211,153,0.18)"}`,
        borderRadius: 2,
        background: hovered ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: hovered ? "0 0 12px rgba(16,185,129,0.25)" : "none",
        transition: "all 0.2s",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        style={{
          width: 14,
          height: 14,
          fill: hovered ? "#34d399" : "rgba(52,211,153,0.55)",
          transition: "fill 0.2s",
        }}
      >
        {path}
      </svg>
    </div>
  );
}

export function Footer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useNetworkCanvas(canvasRef, {
    nodeCount: 60,
    speed: 0.35,
    linkDist: 140,
    mouseDist: 160,
    edgeAlpha: 0.55,
    vignette: ["rgba(2,44,34,0)", "rgba(2,28,18,0.55)"],
  });

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "#000000", fontFamily: "'DM Mono', monospace" }}
    >
      {/* Top border glow */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, #10b981 30%, #6ee7b7 50%, #10b981 70%, transparent 100%)",
          zIndex: 10,
        }}
      />

      {/* Main grid */}
      <div
        className="relative mx-auto"
        style={{
          zIndex: 5,
          padding: "64px 72px 40px",
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
          gap: "48px",
          maxWidth: "1280px",
        }}
      >
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "1.4rem",
                color: "#6ee7b7",
                letterSpacing: "-0.02em",
                textShadow: "0 0 20px rgba(110,231,179,0.4)",
              }}
            >
              FTM2J
            </span>
          </div>
          <p
            style={{
              fontSize: "0.72rem",
              color: "rgba(52,211,153,0.55)",
              lineHeight: 1.7,
              maxWidth: 240,
              letterSpacing: "0.03em",
            }}
          >
            Exposing hidden financial networks. Mapping the money. Demanding
            accountability.
          </p>
          <div
            className="inline-flex items-center gap-2 mt-6"
            style={{
              padding: "6px 14px",
              border: "1px solid rgba(52,211,153,0.18)",
              borderRadius: 2,
              background: "rgba(16,185,129,0.08)",
              fontSize: "0.65rem",
              color: "#34d399",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 8px #10b981",
                animation: "pulse 2.4s ease-in-out infinite",
              }}
            />
            Last Updated Mar 6, 2026 09:30AM CT
          </div>
        </div>

        {/* Link columns */}
        {FOOTER_LINKS.map(({ heading, links, text }) => (
          <div key={heading}>
            <h4
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: "0.65rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#10b981",
                marginBottom: 20,
                paddingBottom: 10,
                borderBottom: "1px solid rgba(52,211,153,0.18)",
              }}
            >
              {heading}
            </h4>
            {text ? (
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "rgba(110,231,179,0.55)",
                  lineHeight: 1.8,
                  letterSpacing: "0.03em",
                }}
              >
                {text}
              </p>
            ) : (
              <ul className="flex flex-col gap-2 list-none">
                {links.map((link) => (
                  <li key={link}>
                    <FooterLink label={link} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        className="relative mx-auto"
        style={{ zIndex: 5, maxWidth: 1280, padding: "0 72px" }}
      >
        <hr
          style={{
            border: "none",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(52,211,153,0.18) 20%, rgba(52,211,153,0.18) 80%, transparent)",
          }}
        />
      </div>

      {/* Bottom bar */}
      <div
        className="relative mx-auto flex flex-wrap items-center justify-between"
        style={{
          zIndex: 5,
          maxWidth: 1280,
          padding: "24px 72px 36px",
          gap: 16,
        }}
      >
        <span
          style={{
            fontSize: "0.68rem",
            color: "rgba(52,211,153,0.75)",
            letterSpacing: "0.06em",
          }}
        >
          © 2026 Inclusive Development International. All rights reserved.
        </span>
        <div className="flex gap-3">
          {[
            <path d="M12 .3C5.37.3 0 5.67 0 12.3c0 5.3 3.44 9.8 8.2 11.39.6.1.83-.25.83-.56v-2c-3.34.72-4.04-1.6-4.04-1.6-.54-1.4-1.33-1.77-1.33-1.77-1.08-.74.08-.72.08-.72 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.5 1 .1-.78.41-1.31.74-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.3.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.92 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .31.21.67.82.56C20.56 22.1 24 17.6 24 12.3 24 5.67 18.63.3 12 .3z" />,
            <path d="M18.24 2h3.28L13.88 9.63 22.5 22h-6.88l-5.44-7.11L4.36 22H1.08l8.2-9.38L.5 2h7.05l4.9 6.48L18.24 2zm-1.15 18h1.82L7.07 3.9H5.12L17.09 20z" />,
            <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.59 0 4.25 2.36 4.25 5.44v6.3zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM3.56 20.45h3.56V9H3.56v11.45z" />,
          ].map((path, i) => (
            <SocialBtn key={i} path={path} />
          ))}
        </div>
        <div className="flex gap-5">
          {["Privacy", "Terms & Conditions"].map((l) => (
            <a
              key={l}
              href="#"
              style={{
                fontSize: "0.65rem",
                color: "rgba(52,211,153,0.7)",
                textDecoration: "none",
                letterSpacing: "0.08em",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.color = "#34d399")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.color =
                  "rgba(52,211,153,0.7)")
              }
            >
              {l}
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.75); }
        }
      `}</style>
    </footer>
  );
}
