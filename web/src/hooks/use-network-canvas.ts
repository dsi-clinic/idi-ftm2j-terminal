import { useEffect, RefObject } from "react";

interface NetworkCanvasOpts {
  nodeCount?: number;
  speed?: number;
  linkDist?: number;
  mouseDist?: number;
  edgeAlpha?: number;
  vignette?: [string, string];
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  col: string;
  glow: boolean;
}

export function useNetworkCanvas(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  opts: NetworkCanvasOpts,
): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const COLORS = ["#10b981", "#e4ede9", "#6ee7b7"];
    const {
      nodeCount = 45,
      speed = 0.35,
      linkDist = 200,
      mouseDist = 160,
      edgeAlpha = 0.55,
      vignette,
    } = opts;
    let W: number, H: number, nodes: Node[], rafId: number;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
      init();
    };

    const init = () => {
      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: Math.random() * 2.2 + 0.8,
        col: COLORS[Math.floor(Math.random() * 3)],
        glow: Math.random() > 0.82,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      if (vignette) {
        const v = ctx.createRadialGradient(
          W / 2,
          H / 2,
          H * 0.15,
          W / 2,
          H / 2,
          H * 0.85,
        );
        v.addColorStop(0, vignette[0]);
        v.addColorStop(1, vignette[1]);
        ctx.fillStyle = v;
        ctx.fillRect(0, 0, W, H);
      }
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i],
            b = nodes[j];
          const dx = a.x - b.x,
            dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(216,185,129,${(1 - dist / linkDist) * edgeAlpha})`;
            ctx.lineWidth = 1.6;
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        const dx = n.x - mouse.x,
          dy = n.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseDist) {
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(110,231,179,${(1 - dist / mouseDist) * 0.9})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }
      }
      for (const n of nodes) {
        if (n.glow) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 7);
          g.addColorStop(0, "rgba(235, 241, 238, 0.35)");
          g.addColorStop(1, "rgba(110,231,179,0)");
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 7, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.col;
        ctx.shadowColor = n.col;
        ctx.shadowBlur = n.glow ? 10 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      rafId = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);
}
