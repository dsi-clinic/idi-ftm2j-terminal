"use client";

import { useRef } from "react";
import { useNetworkCanvas } from "../hooks/use-network-canvas";
import { ImageBanner } from "./image-banner";
import { SearchAutocomplete } from "./search-autocomplete";
import { NetworkHeading } from "./network-heading";

const STATS = [
  { num: "4.2M+", label: "SEC documents indexed" },
  { num: "25K+", label: "Companies searchable" },
  { num: "$91B", label: "Funds traced" },
  { num: "100K+", label: "Projects linked" },
];

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useNetworkCanvas(canvasRef, {
    nodeCount: 250,
    speed: 0.25,
    linkDist: 300,
    mouseDist: 200,
    edgeAlpha: 0.2,
    vignette: ["rgba(0,0,0,0)", "rgba(0,0,0,0.75)"],
  });

  return (
    <section
      className="relative w-full min-h-screen flex flex-col items-center justify-start overflow-hidden bg-black"
      style={{ padding: "120px 24px 80px" }}
    >
      {/* <ImageBanner /> */}

      {/* Emerald tint */}
      <div
        className="absolute inset-0 h-full block"
        style={{
          zIndex: 2,
          background:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0.55) 0%, rgba(2,20,14,0.35) 40%, rgba(8, 7, 7, 0.55) 100%), radial-gradient(ellipse at 50% 60%, rgba(16,185,129,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Network canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ zIndex: 3 }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 4,
          background:
            "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0, 0, 0, 0.61) 3px, rgba(0,0,0,0.18) 4px)",
        }}
      />

      {/* Content */}
      <div
        className="relative flex flex-col items-center text-center gap-7 w-full max-w-4xl"
        style={{ zIndex: 5 }}
      >
        {/* Eyebrow */}
        <span
          className="font-black"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.8rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#10b981",
            border: "1px solid rgba(16,185,129,0.8)",
            padding: "5px 16px",
            animation: "fadeSlideDown 0.8s ease both",
          }}
        >
          Inclusive Development International
        </span>

        {/* Title */}
        {/* <NetworkHeading
          style={{ animation: "fadeSlideDown 0.9s 0.1s ease both" }}
        /> */}
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontWeight: 400,
            fontSize: "clamp(4rem, 11vw, 6rem)",
            lineHeight: 0.95,
            letterSpacing: "0.04em",
            color: "#fff",
            animation: "fadeSlideDown 0.9s 0.1s ease both",
          }}
        >
          Follow the Money
          <br />
          to{" "}
          <span
            style={{
              color: "#34d399",
              textShadow: "0 0 40px rgba(52,211,153,0.5)",
            }}
          >
            Justice
          </span>{" "}
          Terminal
        </h1>

        {/* Tagline */}
        <p
          className="font-extrabold uppercase"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "clamp(0.75rem, 1.5vw, 0.95rem)",
            // color: "white",
            color: "rgba(129, 245, 195, 0.8)",
            letterSpacing: "0.06em",
            animation: "fadeSlideDown 1s 0.2s ease both",
          }}
        >
          Trace the investors, suppliers, and subsidiaries of publicly-traded
          companies.
          <br />
          Uncover pressure points to supercharge human rights advocacy.
        </p>

        {/* Search */}
        <div
          className="w-full"
          style={{
            animation: "fadeSlideDown 1s 0.35s ease both",
            position: "relative",
            zIndex: 10,
          }}
        >
          <SearchAutocomplete />
        </div>

        {/* Stats */}
        <div
          className="flex flex-wrap gap-12 justify-center w-full pt-7"
          style={{
            borderTop: "1px solid rgba(16,185,129,0.12)",
            animation: "fadeSlideDown 1s 0.5s ease both",
          }}
        >
          {STATS.map(({ num, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.6rem",
                  color: "#34d399",
                  textShadow: "0 0 20px rgba(52,211,153,0.4)",
                  letterSpacing: "-0.02em",
                }}
              >
                {num}
              </span>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 600,
                  fontSize: "0.6rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(52,211,153,0.6)",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
