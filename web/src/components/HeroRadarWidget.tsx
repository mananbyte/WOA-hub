import { useState, useEffect } from "react";
import { Radio } from "lucide-react";

interface HubPin {
  code: string;
  name: string;
  x: number; // percentage
  y: number; // percentage
  status: "active" | "busy" | "standby";
  activeFlights: number;
}

const HUBS: HubPin[] = [
  { code: "PRG", name: "Prague", x: 48, y: 35, status: "active", activeFlights: 12 },
  { code: "INN", name: "Innsbruck", x: 44, y: 44, status: "active", activeFlights: 7 },
  { code: "BRI", name: "Bari", x: 52, y: 56, status: "standby", activeFlights: 3 },
  { code: "SAN", name: "San Diego", x: 22, y: 48, status: "active", activeFlights: 9 },
  { code: "IAD", name: "Washington Dulles", x: 30, y: 40, status: "busy", activeFlights: 15 },
  { code: "MCT", name: "Muscat", x: 65, y: 52, status: "standby", activeFlights: 4 },
  { code: "NGO", name: "Nagoya", x: 80, y: 42, status: "active", activeFlights: 8 },
  { code: "LEJ", name: "Leipzig", x: 49, y: 30, status: "busy", activeFlights: 11 },
  { code: "SXM", name: "St. Maarten", x: 33, y: 62, status: "standby", activeFlights: 5 },
  { code: "HKG", name: "Hong Kong", x: 74, y: 50, status: "active", activeFlights: 14 },
];

export const HeroRadarWidget = () => {
  const [activeHubIndex, setActiveHubIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHubIndex((prev: number) => (prev + 1) % HUBS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const selectedHub = HUBS[activeHubIndex];

  return (
    <div className="relative w-full h-[300px] bg-[#E0E8FA] rounded-3xl border border-[#1240C7]/20 overflow-hidden shadow-inner flex flex-col justify-between p-6">
      {/* Background Radar Vector Grid */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        viewBox="0 0 580 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="290" cy="150" r="45" stroke="#1240C7" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="290" cy="150" r="95" stroke="#1240C7" strokeWidth="1" />
        <circle cx="290" cy="150" r="145" stroke="#1240C7" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="290" cy="150" r="195" stroke="#1240C7" strokeWidth="1" />
        <line x1="290" y1="0" x2="290" y2="300" stroke="#1240C7" strokeWidth="0.75" />
        <line x1="0" y1="150" x2="580" y2="150" stroke="#1240C7" strokeWidth="0.75" />
      </svg>

      {/* Sweeping Radar Scanner Line */}
      <div
        className="absolute w-[340px] h-[340px] top-[150px] left-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none opacity-25 animate-spin"
        style={{
          background: "conic-gradient(from 0deg, rgba(18, 64, 199, 0.4) 0deg, rgba(18, 64, 199, 0) 90deg)",
          animationDuration: "6s",
        }}
      />

      {/* Airport Radar Blips */}
      <div className="absolute inset-0 pointer-events-none">
        {HUBS.map((hub, idx) => {
          const isSelected = idx === activeHubIndex;
          const color =
            hub.status === "active" ? "#A8C229" : hub.status === "busy" ? "#F25E24" : "#1240C7";

          return (
            <div
              key={hub.code}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
              style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
            >
              <div className="relative flex items-center justify-center">
                {isSelected && (
                  <div
                    className="absolute w-8 h-8 rounded-full animate-ping opacity-75"
                    style={{ backgroundColor: color }}
                  />
                )}
                <div
                  className="w-3 h-3 rounded-full border-2 border-white shadow-xs"
                  style={{ backgroundColor: color }}
                />
                <span
                  className={`absolute top-3.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase transition ${
                    isSelected
                      ? "bg-[#141A1F] text-white shadow-xs"
                      : "bg-[#FFFFFA]/90 text-[#141A1F] border border-[#C9C7BA]"
                  }`}
                >
                  {hub.code}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1240C7] flex items-center justify-center text-white">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1240C7]">
              LIVE RADAR COORDINATION
            </span>
            <p className="text-[10px] text-[#5E6366] font-mono">10 OFFICIAL HUBS MONITORED</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#A8C229] text-[#141A1F]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#141A1F] animate-ping" />
            LIVE TELEMETRY
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#F25E24] text-white">
            SYNC READY
          </span>
        </div>
      </div>

      {/* Floating Hub Telemetry Card */}
      <div className="relative z-10 self-start max-w-xs bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] p-3 shadow-md backdrop-blur-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#F0EBDE] flex items-center justify-center text-[#1240C7] font-mono font-bold text-sm shrink-0 border border-[#C9C7BA]">
          {selectedHub.code}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold font-mono text-[#141A1F] truncate">
              {selectedHub.name}
            </p>
            <span className="text-[10px] font-mono font-bold text-[#1240C7]">
              {selectedHub.activeFlights} FLIGHTS
            </span>
          </div>
          <p className="text-[10px] text-[#5E6366] truncate mt-0.5">
            Class B–F Turnarounds Available
          </p>
        </div>
      </div>
    </div>
  );
};
