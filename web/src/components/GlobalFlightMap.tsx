/**
 * GlobalFlightMap — Immersive SVG-based flight arc world map for the hero section.
 *
 * Renders an equirectangular world-map projection with:
 *  • Animated bezier flight arcs between WoA hubs
 *  • Pulsing radar rings on active hubs
 *  • Hub telemetry cards that cycle through airports
 *  • No external dependencies — pure React + SVG + CSS animations
 *  • Respects prefers-reduced-motion
 *  • Mobile-safe (no scroll hijacking)
 */

import { useState, useEffect, useRef } from "react";
import { WOA_AIRPORTS } from "../data/airports";
import { AirportCrest } from "./AirportCrest";

/* ─── Projection helper ───────────────────────────────────────────────────── */

const MAP_W = 800;
const MAP_H = 400;

/** Convert WGS-84 lat/lng to SVG equirectangular pixel coordinates */
function project(lat: number, lng: number): [number, number] {
  const x = ((lng + 180) / 360) * MAP_W;
  const y = ((90 - lat) / 180) * MAP_H;
  return [x, y];
}

/* ─── Flight arc data ─────────────────────────────────────────────────────── */

// Curated high-traffic routes between WoA hubs
const FLIGHT_ROUTES: Array<[string, string]> = [
  ["PRG", "IAD"], ["LHR", "HKG"], ["SYD", "BKK"], ["IAD", "SAN"],
  ["INN", "LHR"], ["NGO", "HKG"], ["GRU", "IAD"], ["SCL", "GRU"],
  ["LEJ", "MCT"], ["MSY", "IAD"], ["ZRH", "LHR"], ["BKK", "MCT"],
  ["HKG", "SYD"], ["PRG", "LEJ"], ["CNN", "BKK"], ["SXM", "MSY"],
];

interface FlightArc {
  id: string;
  from: [number, number];
  to: [number, number];
  control: [number, number];
  fromCode: string;
  toCode: string;
  pathLength: number;
}

function buildArcs(): FlightArc[] {
  const airportMap = new Map(WOA_AIRPORTS.map((a) => [a.code, a]));
  return FLIGHT_ROUTES.flatMap(([fromCode, toCode]) => {
    const from = airportMap.get(fromCode);
    const to = airportMap.get(toCode);
    if (!from || !to) return [];
    const [fx, fy] = project(from.lat, from.lng);
    const [tx, ty] = project(to.lat, to.lng);
    // Arc control point — lifted above midpoint for bezier curvature
    const cx = (fx + tx) / 2;
    const cy = (fy + ty) / 2 - Math.hypot(tx - fx, ty - fy) * 0.3;
    return [{
      id: `${fromCode}-${toCode}`,
      from: [fx, fy],
      to: [tx, ty],
      control: [cx, cy],
      fromCode,
      toCode,
      pathLength: Math.hypot(tx - fx, ty - fy) * 1.4, // approx arc length
    }];
  });
}

const ARCS = buildArcs();

/* ─── Hub telemetry data ──────────────────────────────────────────────────── */

const TELEMETRY = WOA_AIRPORTS.map((ap, i) => ({
  ...ap,
  activeFlights: [12, 7, 15, 9, 11, 8, 4, 6, 5, 14, 13, 10, 8, 16, 7, 3, 9, 6][i % 18],
  status: (["active", "busy", "active", "busy", "active", "standby"] as const)[i % 6],
}));

const STATUS_COLORS: Record<string, string> = {
  active: "#A8C229",
  busy:   "#F25E24",
  standby:"#1240C7",
};

/* ─── Animated aircraft dot along an arc ─────────────────────────────────── */

interface AircraftDotProps {
  arc: FlightArc;
  delay: number;
  duration: number;
  reduced: boolean;
}

function AircraftDot({ arc, delay, duration, reduced }: AircraftDotProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const animRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (reduced) return;

    let started = false;
    const totalMs = duration * 1000;
    const delayMs = delay * 1000;

    const tick = (ts: number) => {
      if (!started) {
        startRef.current = ts + delayMs;
        started = true;
      }
      const elapsed = Math.max(0, ts - startRef.current);
      const t = (elapsed % totalMs) / totalMs;

      if (pathRef.current && dotRef.current) {
        const len = pathRef.current.getTotalLength();
        const pt = pathRef.current.getPointAtLength(t * len);
        dotRef.current.setAttribute("cx", String(pt.x));
        dotRef.current.setAttribute("cy", String(pt.y));
        dotRef.current.setAttribute("opacity", t < 0.05 || t > 0.95 ? String(1 - Math.abs(t - (t < 0.5 ? 0 : 1)) * 20) : "0.9");
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [delay, duration, reduced]);

  const d = `M ${arc.from[0]} ${arc.from[1]} Q ${arc.control[0]} ${arc.control[1]} ${arc.to[0]} ${arc.to[1]}`;

  return (
    <g>
      <path ref={pathRef} d={d} fill="none" stroke="none" />
      <circle ref={dotRef} cx={arc.from[0]} cy={arc.from[1]} r="2.5" fill="#A8C229" />
    </g>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */

export function GlobalFlightMap() {
  const [activeTelemetryIdx, setActiveTelemetryIdx] = useState(0);
  const [hoveredHub, setHoveredHub] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Auto-cycle telemetry cards
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => {
      setActiveTelemetryIdx((p) => (p + 1) % TELEMETRY.length);
    }, 3000);
    return () => clearInterval(t);
  }, [reduced]);

  const activeHub = TELEMETRY[activeTelemetryIdx];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#C9C7BA] shadow-xl bg-[#0A1628]">
      {/* Header bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-3 bg-gradient-to-b from-[#0A1628] to-transparent">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full bg-[#A8C229]"
            style={reduced ? {} : { animation: "pulse 2s infinite" }}
          />
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#A8C229]">
            LIVE GLOBAL NETWORK
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#C9C7BA]">
            {WOA_AIRPORTS.length} HUBS · {ARCS.length} ROUTES
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#F25E24] text-white text-[10px] font-mono font-bold">
            DISPATCH READY
          </span>
        </div>
      </div>

      {/* SVG World Map */}
      <div className="w-full" style={{ aspectRatio: "800/400" }}>
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
          style={{ display: "block" }}
        >
          <defs>
            {/* Glow filter for arcs */}
            <filter id="arc-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Hub pulse glow */}
            <filter id="hub-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Gradient for ocean */}
            <radialGradient id="ocean-grad" cx="40%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#0D2240" />
              <stop offset="100%" stopColor="#060F1E" />
            </radialGradient>
          </defs>

          {/* Ocean background */}
          <rect width={MAP_W} height={MAP_H} fill="url(#ocean-grad)" />

          {/* Latitude grid lines */}
          {[-60, -30, 0, 30, 60].map((lat) => {
            const [, y] = project(lat, 0);
            return (
              <line
                key={lat}
                x1="0" y1={y} x2={MAP_W} y2={y}
                stroke="#1240C7" strokeWidth={lat === 0 ? 0.75 : 0.4}
                opacity={lat === 0 ? 0.4 : 0.15}
                strokeDasharray={lat === 0 ? "" : "4 8"}
              />
            );
          })}
          {/* Longitude grid lines */}
          {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lng) => {
            const [x] = project(0, lng);
            return (
              <line
                key={lng}
                x1={x} y1="0" x2={x} y2={MAP_H}
                stroke="#1240C7" strokeWidth="0.4"
                opacity="0.12"
                strokeDasharray="4 8"
              />
            );
          })}

          {/* ── Flight arcs ── */}
          {ARCS.map((arc, i) => {
            const d = `M ${arc.from[0]} ${arc.from[1]} Q ${arc.control[0]} ${arc.control[1]} ${arc.to[0]} ${arc.to[1]}`;
            const isActive = hoveredHub === arc.fromCode || hoveredHub === arc.toCode;
            return (
              <g key={arc.id}>
                {/* Glow shadow */}
                <path
                  d={d}
                  fill="none"
                  stroke="#1240C7"
                  strokeWidth="3"
                  opacity={isActive ? 0.5 : 0.15}
                  filter="url(#arc-glow)"
                  strokeLinecap="round"
                />
                {/* Main arc */}
                <path
                  d={d}
                  fill="none"
                  stroke={isActive ? "#A8C229" : "#1240C7"}
                  strokeWidth={isActive ? 1.5 : 0.8}
                  opacity={isActive ? 0.9 : 0.5}
                  strokeLinecap="round"
                  strokeDasharray={reduced ? "" : `${arc.pathLength} ${arc.pathLength}`}
                  style={
                    reduced
                      ? {}
                      : {
                          strokeDashoffset: arc.pathLength,
                          animation: `dash-draw ${2 + i * 0.1}s ease-out forwards`,
                          animationDelay: `${i * 0.05}s`,
                        }
                  }
                />
                {/* Animated aircraft dot */}
                {!reduced && (
                  <AircraftDot
                    arc={arc}
                    delay={(i * 1.7) % 12}
                    duration={8 + (i % 5) * 2}
                    reduced={reduced}
                  />
                )}
              </g>
            );
          })}

          {/* ── Hub nodes ── */}
          {TELEMETRY.map((hub) => {
            const [x, y] = project(hub.lat, hub.lng);
            const color = STATUS_COLORS[hub.status];
            const isHovered = hoveredHub === hub.code;
            const isActive = activeHub.code === hub.code;

            return (
              <g
                key={hub.code}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredHub(hub.code)}
                onMouseLeave={() => setHoveredHub(null)}
                onClick={() => setActiveTelemetryIdx(TELEMETRY.findIndex((t) => t.code === hub.code))}
              >
                {/* Outer pulse ring */}
                {!reduced && (
                  <circle
                    cx={x} cy={y} r={isActive ? 14 : 10}
                    fill="none"
                    stroke={color}
                    strokeWidth="0.8"
                    opacity="0.4"
                    style={{ animation: `ping ${2 + Math.random() * 2}s ease-out infinite` }}
                  />
                )}
                {/* Glow disc */}
                <circle
                  cx={x} cy={y} r={isHovered || isActive ? 8 : 5}
                  fill={color}
                  opacity="0.15"
                  filter="url(#hub-glow)"
                />
                {/* Core dot */}
                <circle
                  cx={x} cy={y} r={isHovered || isActive ? 4 : 3}
                  fill={color}
                  stroke="white"
                  strokeWidth="1"
                  style={{ transition: "r 0.2s ease" }}
                />
                {/* IATA label */}
                <text
                  x={x}
                  y={y + 12}
                  textAnchor="middle"
                  fill="white"
                  fontSize="7"
                  fontWeight="700"
                  fontFamily="monospace"
                  opacity={isHovered || isActive ? 1 : 0.65}
                >
                  {hub.code}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Telemetry card overlay */}
      <div className="absolute left-4 bottom-4 z-10">
        <div className="flex items-center gap-3 bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] px-4 py-3 shadow-lg min-w-[220px]">
          <AirportCrest code={activeHub.code} size={36} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-extrabold font-mono text-[#141A1F] leading-tight">{activeHub.code}</p>
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: STATUS_COLORS[activeHub.status] }}
              />
            </div>
            <p className="text-[10px] font-mono text-[#5E6366] truncate">{activeHub.name}</p>
            <p className="text-[10px] font-mono font-bold text-[#1240C7] mt-0.5">
              {activeHub.activeFlights} ACTIVE FLIGHTS
            </p>
          </div>
        </div>
      </div>

      {/* Region legend */}
      <div className="absolute right-4 bottom-4 z-10 flex flex-col gap-1.5">
        {(["active", "busy", "standby"] as const).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
            <span className="text-[9px] font-mono uppercase text-[#C9C7BA] tracking-wider">{s}</span>
          </div>
        ))}
      </div>

      {/* CSS keyframes (injected inline via a style tag as a static string — no dangerouslySetInnerHTML on SVG) */}
      <style>{`
        @keyframes dash-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes ping {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.8); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ping-animation { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
