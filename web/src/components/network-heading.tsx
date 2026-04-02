"use client";

import { useRef, useEffect } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  col: string;
  glow: boolean;
}

const COLORS = ["#10b981", "#34d399", "#6ee7b7"];
const NODE_COUNT = 100;
const SPEED = 0.42;
const LINK_DIST = 115;

type Ctx2D = CanvasRenderingContext2D & { letterSpacing: string };

export function NetworkHeading({
  style,
  className,
}: {
  style?: React.CSSProperties;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const h1 = h1Ref.current;
    if (!wrap || !canvas || !h1) return;

    const ctx = canvas.getContext("2d")! as Ctx2D;
    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d")!;

    let W = 0, H = 0, fontSize = 96, lh = 0, dpr = 1;
    // Cached Justice word geometry (recomputed on resize)
    let justiceCX = 0;
    let nodes: Node[] = [];
    let rafId: number;
    let alive = true;

    const setFont = (c: CanvasRenderingContext2D) => {
      (c as Ctx2D).letterSpacing = `${(fontSize * 0.04).toFixed(1)}px`;
      c.font = `400 ${fontSize}px "Bebas Neue", sans-serif`;
      c.textBaseline = "top";
    };

    const init = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = wrap.getBoundingClientRect();
      W = Math.max(rect.width, 1);
      H = Math.max(rect.height, 1);

      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      off.width = W * dpr;
      off.height = H * dpr;
      offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      fontSize = parseFloat(getComputedStyle(h1).fontSize) || 96;
      lh = fontSize * 0.95;

      // Measure Justice center-x for emphasis pass
      setFont(ctx);
      ctx.textAlign = "left";
      const line2W = ctx.measureText("to Justice Terminal").width;
      const toW   = ctx.measureText("to ").width;
      const jW    = ctx.measureText("Justice").width;
      justiceCX   = W / 2 - line2W / 2 + toW + jW / 2;

      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: Math.random() * 2 + 0.6,
        col: COLORS[Math.floor(Math.random() * 3)],
        glow: Math.random() > 0.72,
      }));
    };

    const tick = () => {
      if (!alive) return;

      // ── 1. Render network to offscreen ──────────────────────────
      offCtx.clearRect(0, 0, W, H);

      // Dark-emerald interior — clearly distinct from the hero's pure black.
      // Letters will read as dark-green shapes against the black hero.
      offCtx.fillStyle = "rgba(0, 44, 26, 0.96)";
      offCtx.fillRect(0, 0, W, H);

      // Soft centre brightening so nodes near the middle pop more
      const grd = offCtx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.6);
      grd.addColorStop(0, "rgba(16,185,129,0.14)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      offCtx.fillStyle = grd;
      offCtx.fillRect(0, 0, W, H);

      // Move nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      // Edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            offCtx.beginPath();
            offCtx.moveTo(a.x, a.y);
            offCtx.lineTo(b.x, b.y);
            offCtx.strokeStyle = `rgba(52,211,153,${(1 - dist / LINK_DIST) * 0.65})`;
            offCtx.lineWidth = 1.1;
            offCtx.stroke();
          }
        }
      }

      // Node halos + dots
      for (const n of nodes) {
        if (n.glow) {
          const g = offCtx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 9);
          g.addColorStop(0, "rgba(52,211,153,0.52)");
          g.addColorStop(1, "rgba(52,211,153,0)");
          offCtx.beginPath();
          offCtx.arc(n.x, n.y, n.r * 9, 0, Math.PI * 2);
          offCtx.fillStyle = g;
          offCtx.fill();
        }
        offCtx.beginPath();
        offCtx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        offCtx.fillStyle = n.col;
        offCtx.shadowColor = n.col;
        offCtx.shadowBlur = n.glow ? 12 : 5;
        offCtx.fill();
        offCtx.shadowBlur = 0;
      }

      // ── 2. Clip network to letter shapes ────────────────────────
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
      setFont(ctx);
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.fillText("Follow the Money", W / 2, 0);
      ctx.fillText("to Justice Terminal", W / 2, lh);

      ctx.globalCompositeOperation = "source-in";
      ctx.drawImage(off, 0, 0, W, H);

      // ── 3. Letter stroke outlines for legibility ────────────────
      // A thin, bright outline around every glyph prevents the dark-emerald
      // interior from disappearing into the hero background.
      ctx.globalCompositeOperation = "source-over";
      setFont(ctx);
      ctx.textAlign = "center";
      ctx.strokeStyle = "rgba(52, 211, 153, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.strokeText("Follow the Money", W / 2, 0);
      ctx.strokeText("to Justice Terminal", W / 2, lh);

      // ── 4. "Justice" green re-emphasis ──────────────────────────
      // (a) Green tint over the network inside Justice's letter shapes only
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = "rgba(52, 211, 153, 0.35)";
      ctx.textAlign = "center";
      ctx.fillText("Justice", justiceCX, lh);

      // (b) Brighter stroke on Justice letters
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 2;
      ctx.strokeText("Justice", justiceCX, lh);

      // (c) Outer glow — drawn source-over so shadow bleeds past the
      //     letter clip, matching the original textShadow feel.
      ctx.globalCompositeOperation = "source-over";
      ctx.shadowColor = "rgba(52, 211, 153, 0.7)";
      ctx.shadowBlur = 32;
      ctx.fillStyle = "rgba(52, 211, 153, 0.06)";
      ctx.fillText("Justice", justiceCX, lh);
      ctx.shadowBlur = 0;

      ctx.globalCompositeOperation = "source-over";
      rafId = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(init);
    ro.observe(wrap);

    document.fonts.ready.then(() => {
      init();
      tick();
    });

    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  const titleStyle: React.CSSProperties = {
    fontFamily: "'Bebas Neue', sans-serif",
    fontWeight: 400,
    fontSize: "clamp(4rem, 11vw, 6rem)",
    lineHeight: 0.95,
    letterSpacing: "0.04em",
    margin: 0,
    color: "transparent",
    WebkitTextFillColor: "transparent",
    userSelect: "none",
  };

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", ...style }}
      className={className}
    >
      {/* Invisible h1: owns layout, a11y label, drives canvas sizing */}
      <h1
        ref={h1Ref}
        aria-label="Follow the Money to Justice Terminal"
        style={titleStyle}
      >
        Follow the Money
        <br />
        to{" "}
        <span style={{ color: "transparent", WebkitTextFillColor: "transparent" }}>
          Justice
        </span>{" "}
        Terminal
      </h1>

      {/* Canvas renders the network-filled letterforms */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
