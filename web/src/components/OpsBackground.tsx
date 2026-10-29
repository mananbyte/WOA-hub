/**
 * OpsBackground — Ambient aviation atmosphere layer.
 *
 * Renders subtle, non-distracting ATC radar sweep + runway lighting effects
 * as a fixed full-viewport background. Respects prefers-reduced-motion
 * by disabling all animations when the user prefers reduced motion.
 *
 * Visual effect: very low opacity (8–12%) so it never competes with content.
 */

import { useEffect, useState } from "react";

export function OpsBackground() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  if (reduced) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      {/* Ambient radar rings — top-right corner */}
      <svg
        viewBox="0 0 600 600"
        className="absolute -top-64 -right-64 w-[600px] h-[600px] opacity-[0.04]"
        fill="none"
      >
        <circle cx="300" cy="300" r="100" stroke="#1240C7" strokeWidth="1" />
        <circle cx="300" cy="300" r="180" stroke="#1240C7" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx="300" cy="300" r="260" stroke="#1240C7" strokeWidth="1" />
        <circle cx="300" cy="300" r="340" stroke="#1240C7" strokeWidth="0.75" strokeDasharray="3 12" />
        {/* Rotating sweep sector */}
        <path
          d="M300 300 L300 200 A100 100 0 0 1 350 290 Z"
          fill="#1240C7"
          opacity="0.4"
          style={{
            transformOrigin: "300px 300px",
            animation: "radar-spin 8s linear infinite",
          }}
        />
        <line x1="300" y1="0" x2="300" y2="600" stroke="#1240C7" strokeWidth="0.5" opacity="0.3" />
        <line x1="0" y1="300" x2="600" y2="300" stroke="#1240C7" strokeWidth="0.5" opacity="0.3" />
        <line x1="88" y1="88" x2="512" y2="512" stroke="#1240C7" strokeWidth="0.5" opacity="0.2" />
        <line x1="512" y1="88" x2="88" y2="512" stroke="#1240C7" strokeWidth="0.5" opacity="0.2" />
      </svg>

      {/* Runway edge lights — bottom */}
      <div className="absolute bottom-0 inset-x-0 flex justify-center gap-16 pb-2 opacity-[0.07]">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="w-1 h-6 rounded-full bg-[#A8C229]"
            style={{
              animation: `runway-blink 1.8s ease-in-out infinite`,
              animationDelay: `${i * 0.13}s`,
            }}
          />
        ))}
      </div>

      {/* Left-side approach light bar */}
      <div className="absolute left-0 top-1/3 flex flex-col gap-12 pl-4 opacity-[0.06]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#F25E24]"
            style={{
              animation: `runway-blink 2.4s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes radar-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes runway-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
