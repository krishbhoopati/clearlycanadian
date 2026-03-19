"use client";
import Image from "next/image";
import type { Persona } from "@/lib/types";

const BUBBLES = [
  { size: 6, left: "15%", dur: 4.2, delay: 0.0, drift: "15px",  op: 0.20 },
  { size: 4, left: "25%", dur: 3.5, delay: 0.3, drift: "-10px", op: 0.15 },
  { size: 8, left: "35%", dur: 5.0, delay: 0.7, drift: "20px",  op: 0.25 },
  { size: 3, left: "42%", dur: 3.8, delay: 1.0, drift: "-8px",  op: 0.20 },
  { size: 5, left: "48%", dur: 4.5, delay: 0.2, drift: "12px",  op: 0.18 },
  { size: 7, left: "55%", dur: 3.3, delay: 1.5, drift: "-18px", op: 0.22 },
  { size: 4, left: "62%", dur: 4.8, delay: 0.5, drift: "8px",   op: 0.15 },
  { size: 6, left: "70%", dur: 3.6, delay: 1.2, drift: "-14px", op: 0.20 },
  { size: 5, left: "78%", dur: 4.0, delay: 0.8, drift: "10px",  op: 0.18 },
  { size: 3, left: "85%", dur: 3.4, delay: 1.8, drift: "-6px",  op: 0.12 },
  { size: 5, left: "20%", dur: 4.6, delay: 2.0, drift: "16px",  op: 0.16 },
  { size: 7, left: "30%", dur: 3.2, delay: 2.3, drift: "-12px", op: 0.20 },
  { size: 4, left: "40%", dur: 5.2, delay: 1.4, drift: "9px",   op: 0.14 },
  { size: 6, left: "52%", dur: 3.9, delay: 2.6, drift: "-20px", op: 0.22 },
  { size: 3, left: "65%", dur: 4.3, delay: 0.9, drift: "7px",   op: 0.13 },
  { size: 8, left: "38%", dur: 3.7, delay: 3.0, drift: "-15px", op: 0.18 },
  { size: 4, left: "58%", dur: 4.1, delay: 2.8, drift: "11px",  op: 0.16 },
  { size: 5, left: "73%", dur: 3.5, delay: 1.6, drift: "-9px",  op: 0.20 },
  { size: 6, left: "45%", dur: 4.7, delay: 3.2, drift: "13px",  op: 0.15 },
  { size: 3, left: "82%", dur: 3.8, delay: 2.1, drift: "-7px",  op: 0.12 },
];

const SPARKLES = [
  { top: "25%", left: "30%",  right: undefined, delay: "0s"   },
  { top: "35%", left: undefined, right: "28%",  delay: "0.7s" },
  { top: "20%", left: "55%",  right: undefined, delay: "1.4s" },
  { top: "40%", left: "38%",  right: undefined, delay: "0.3s" },
  { top: "30%", left: undefined, right: "35%",  delay: "1.0s" },
];

interface Props {
  visible: boolean;
  personas?: Persona[];
}

export default function LoadingOverlay({ visible, personas }: Props) {
  if (!visible) return null;

  const names = personas?.slice(0, 4).map(p => p.name).join(", ") ?? "your panel";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {BUBBLES.map((b, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: b.size,
              height: b.size,
              left: b.left,
              bottom: "-10%",
              borderRadius: "50%",
              background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), rgba(255,255,255,0.05))",
              border: "1px solid rgba(255,255,255,0.1)",
              opacity: b.op,
              ["--drift" as string]: b.drift,
              animation: `loading-bubble-rise ${b.dur}s ${b.delay}s linear infinite`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Sparkles */}
      {SPARKLES.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "white",
            top: s.top,
            left: s.left,
            right: s.right,
            animation: `loading-sparkle 2s ${s.delay} ease-in-out infinite`,
          }}
        />
      ))}

      {/* Bottles */}
      <div className="flex flex-col items-center">
        <div className="relative flex items-end justify-center mb-10" style={{ height: 280 }}>
          {/* Glow */}
          <div style={{
            position: "absolute",
            width: 200, height: 200,
            background: "radial-gradient(circle, rgba(120,180,230,0.15) 0%, transparent 70%)",
            top: "50%", left: "50%",
            animation: "loading-glow-pulse 3s ease-in-out infinite",
            transform: "translate(-50%,-50%)",
            zIndex: 0,
          }} />
          {/* Left bottle */}
          <div style={{ height: 260, zIndex: 1, marginRight: -80, filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))", animation: "loading-float-left 4s ease-in-out infinite" }}>
            <Image src="/bottles/bottle-left.png" alt="" width={100} height={260} style={{ height: "100%", width: "auto", objectFit: "contain" }} />
          </div>
          {/* Center bottle */}
          <div style={{ height: 260, zIndex: 3, filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))", animation: "loading-float-center 3.5s ease-in-out infinite" }}>
            <Image src="/bottles/bottle-center.png" alt="" width={100} height={260} style={{ height: "100%", width: "auto", objectFit: "contain" }} />
          </div>
          {/* Right bottle */}
          <div style={{ height: 260, zIndex: 1, marginLeft: -80, filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))", animation: "loading-float-right 4.2s ease-in-out infinite" }}>
            <Image src="/bottles/bottle-right.png" alt="" width={100} height={260} style={{ height: "100%", width: "auto", objectFit: "contain" }} />
          </div>
        </div>

        {/* Status text */}
        <div className="text-center relative z-10">
          <p className="text-white/90 text-2xl font-bold mb-3 font-manrope">Consulting your consumer panel…</p>
          <div className="relative h-6 font-manrope text-[15px] font-bold text-white tracking-wider">
            <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", opacity: 0, animation: "loading-status-step 5s ease-in-out infinite" }}>
              Analyzing question…
            </span>
            <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", opacity: 0, animation: "loading-status-step 5s 1.6s ease-in-out infinite" }}>
              Asking {names}…
            </span>
            <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", opacity: 0, animation: "loading-status-step 5s 3.2s ease-in-out infinite" }}>
              Generating insights…
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-48 h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div
            key={visible ? "active" : "idle"}
            style={{
              height: "100%",
              borderRadius: 10,
              background: "linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.7))",
              animation: "loading-progress 5s ease-out infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}
