import { useEffect, useRef, useState } from "react";

type NetworkNode = {
  id: number;
  x: number; // px
  y: number; // px
  vx: number; // velocity x
  vy: number; // velocity y
  r: number; // radius
};

// Rain column definition
type RainColumn = {
  id: number;
  x: number; // percentage from left
  delay: number; // ms
  duration: number; // seconds
  chars: string[]; // characters in the column
};

export const Background = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [rainColumns, setRainColumns] = useState<RainColumn[]>([]);
  const [isDark, setIsDark] = useState<boolean>(() =>
    document.documentElement.classList.contains("dark")
  );
  const cursorRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  useEffect(() => {
    initNetwork();
    generateRainColumns();

    window.addEventListener("resize", handleResize);
    const onMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
      cursorRef.current.active = true;
    };
    const onLeave = () => {
      cursorRef.current.active = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    const handler = (e: Event) => {
      const detailTheme = (e as CustomEvent).detail?.theme;
      const nextIsDark = detailTheme
        ? detailTheme === "dark"
        : document.documentElement.classList.contains("dark");
      // When switching into dark after initial mount, regenerate rain columns
      if (nextIsDark && !isDark) {
        generateRainColumns();
      }
      setIsDark(nextIsDark);
    };
    window.addEventListener("theme-changed", handler as EventListener);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("theme-changed", handler as EventListener);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const handleResize = () => {
    initNetwork();
    // Re-draw immediately on resize
    draw();
  };

  const initNetwork = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const densityBase = 13000; // higher -> fewer nodes
    const target = Math.min(140, Math.floor((width * height) / densityBase));
    const newNodes: NetworkNode[] = [];
    for (let i = 0; i < target; i++) {
      newNodes.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        // Revert to original smaller radius range
        r: Math.random() * 1.6 + 0.6, // 0.6 – 2.2
      });
    }
    setNodes(newNodes);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
  };

  const RAIN_CHARS = "01<>[]{}/\\=+*:-_.#$&@";

  const generateRainColumns = () => {
    // Further reduced density & keep slow fall: fewer columns overall
    const base = Math.floor(window.innerWidth / 240); // increased divisor (was 140)
    const count = Math.min(base, 16); // lower cap (was 24)
    const cols: RainColumn[] = [];
    for (let i = 0; i < count; i++) {
      const length = Math.floor(Math.random() * 10) + 6; // 6-15 chars instead of 8-22
      const chars = Array.from(
        { length },
        () => RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)]
      );
      cols.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 7000, // more spread: 0-7s (was 0-5s)
        duration: Math.random() * 8 + 9, // slower: 9-17s (was 5-11s)
        chars,
      });
    }
    setRainColumns(cols);
  };

  // Drawing logic for network (kept outside JSX for performance)
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = (canvas.width = window.innerWidth); // keep in sync
    const height = (canvas.height = window.innerHeight);
    ctx.clearRect(0, 0, width, height);

    // Update node positions
    for (const node of nodes) {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < 0) node.x = width;
      if (node.x > width) node.x = 0;
      if (node.y < 0) node.y = height;
      if (node.y > height) node.y = 0;
    }

    // Theme-aware palette
    const lineRGB = isDark ? "160,170,190" : "80,90,120";
    const cursorLineRGB = isDark ? "190,200,215" : "90,100,140";
    const cursorPulseRGB = isDark ? "180,190,205" : "100,110,150";
    const cursorDotRGB = isDark ? "210,220,235" : "60,70,110";
    const nodeGlowRGB = isDark ? "200,210,225" : "100,110,150";
    const nodeCoreRGB = isDark ? "220,230,240" : "80,90,130";

    // Draw connections (subtle neutral)
    const maxDist = 140; // link distance px
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = 1 - dist / maxDist;
          ctx.strokeStyle = `rgba(${lineRGB},${alpha * 0.25})`;
          ctx.lineWidth = alpha * 1.6 + 0.4;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Cursor connections
    if (cursorRef.current.active) {
      const { x: cx, y: cy } = cursorRef.current;
      const cursorMax = 200;
      for (const node of nodes) {
        const dx = node.x - cx;
        const dy = node.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < cursorMax) {
          const alpha = 1 - dist / cursorMax;
          const width = alpha * 2 + 0.3;
          ctx.strokeStyle = `rgba(${cursorLineRGB},${alpha * 0.4})`;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();
        }
      }

      const pulseRadius = 14;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseRadius * 2.4);
      grd.addColorStop(0, `rgba(${cursorPulseRGB},0.22)`);
      grd.addColorStop(1, `rgba(${cursorPulseRGB},0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseRadius * 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${cursorDotRGB},0.65)`;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw nodes after lines for crisp glow overlay
    for (const node of nodes) {
      const glowRadius = node.r * 3.5;
      const gradient = ctx.createRadialGradient(
        node.x,
        node.y,
        0,
        node.x,
        node.y,
        glowRadius
      );
      gradient.addColorStop(0, `rgba(${nodeGlowRGB},0.55)`);
      gradient.addColorStop(1, `rgba(${nodeGlowRGB},0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${nodeCoreRGB},0.55)`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  useEffect(() => {
    let raf: number;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, isDark]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {isDark && <canvas ref={canvasRef} className="absolute inset-0" />}
      {isDark &&
        rainColumns.map((col) => (
          <div
            key={col.id}
            className="meteor"
            style={{
              left: col.x + "%",
              top: "-5%",
              animationDelay: col.delay + "ms",
              ["--fall-duration" as any]: col.duration + "s",
            }}
          >
            {col.chars.map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </div>
        ))}
    </div>
  );
};
