"use client";

import { useState } from "react";

interface NavLinkProps {
  label: string;
}

function NavLink({ label }: NavLinkProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="#"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: "0.72rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: hovered ? "#6ee7b7" : "rgba(110,231,179,0.6)",
        textDecoration: "none",
        textShadow: hovered ? "0 0 10px rgba(110,231,179,0.35)" : "none",
        transition: "color 0.2s, text-shadow 0.2s",
        position: "relative",
        paddingBottom: "4px",
      }}
    >
      {label}
      <span
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "1px",
          background: "#10b981",
          transform: hovered ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 0.2s ease",
        }}
      />
    </a>
  );
}

export function Navbar() {
  const links = ["Browse", "About", "FAQ", "Downloads"];
  return (
    <nav
      style={{ fontFamily: "'DM Mono', monospace" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 h-16 bg-transparent"
    >
      <a
        href="#"
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "1.5rem",
          letterSpacing: "0.1em",
          color: "#34d399",
          textShadow: "0 0 16px rgba(52,211,153,0.45)",
          textDecoration: "none",
        }}
      >
        FTM2J
      </a>
      <ul className="flex items-center gap-9 list-none">
        {links.map((l) => (
          <li key={l}>
            <NavLink label={l} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
