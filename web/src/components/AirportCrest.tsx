/**
 * AirportCrest — Premium heraldic SVG emblems for all 18 WoA playable hubs.
 *
 * Each crest uses a 40×40 viewBox with a coloured circular badge and layered
 * geographic / cultural motifs unique to its airport city.  Pure JSX — no
 * dangerouslySetInnerHTML.
 */

import React from "react";

interface AirportCrestProps {
  code: string;
  /** Rendered size in pixels (width = height). Default: 40 */
  size?: number;
  className?: string;
}

/* ─── Individual crest definitions ───────────────────────────────────────── */

function CrestINN() {
  // Innsbruck — Alpine peak with snow cap and golden city spire
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="inn-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1B4D9C" />
          <stop offset="100%" stopColor="#0C2D6B" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#inn-bg)" />
      {/* Outer mountain range */}
      <path d="M4 31 L10 18 L14 24 L20 9 L26 22 L30 14 L36 31 Z" fill="#FFFFFF" opacity="0.15" />
      {/* Main Nordkette peak */}
      <path d="M20 8 L29 28 L11 28 Z" fill="white" opacity="0.92" />
      {/* Snow cap */}
      <path d="M20 8 L24 17 L16 17 Z" fill="#E8F4FF" />
      {/* City Inn River line */}
      <path d="M4 30 Q12 27 20 29 Q28 31 36 28" stroke="#A8D4F0" strokeWidth="1" fill="none" opacity="0.6" />
      {/* Golden Stadtturm spire */}
      <rect x="18.5" y="26" width="3" height="4" fill="#F0C040" />
      <polygon points="20,22 17.5,26 22.5,26" fill="#F0C040" />
      {/* Snowflake crystals */}
      <circle cx="9" cy="24" r="0.9" fill="white" opacity="0.5" />
      <circle cx="31" cy="22" r="0.9" fill="white" opacity="0.5" />
      {/* Thin accent ring */}
      <circle cx="20" cy="20" r="19" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3" />
    </svg>
  );
}

function CrestBRI() {
  // Bari — Romanesque Basilica arches + Adriatic wave + olive branch
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bri-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C0622E" />
          <stop offset="100%" stopColor="#8B3A18" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#bri-bg)" />
      {/* Basilica façade */}
      <rect x="9" y="20" width="22" height="11" fill="#F5DEB3" opacity="0.85" />
      {/* Three Romanesque arches */}
      <path d="M10 31 L10 24 Q13 20 16 24 L16 31" fill="#C0622E" opacity="0.7" />
      <path d="M17 31 L17 24 Q20 20 23 24 L23 31" fill="#C0622E" opacity="0.7" />
      <path d="M24 31 L24 24 Q27 20 30 24 L30 31" fill="#C0622E" opacity="0.7" />
      {/* Rose window */}
      <circle cx="20" cy="17" r="3.5" fill="none" stroke="#F5DEB3" strokeWidth="1" opacity="0.9" />
      <circle cx="20" cy="17" r="1.5" fill="#F0C040" opacity="0.8" />
      {/* Bell tower */}
      <rect x="28" y="12" width="4" height="8" fill="#F5DEB3" opacity="0.7" />
      <polygon points="30,9 27.5,13 32.5,13" fill="#F0C040" />
      {/* Adriatic waves */}
      <path d="M5 33 Q10 31 15 33 Q20 35 25 33 Q30 31 35 33" stroke="#6BAEDC" strokeWidth="1.5" fill="none" opacity="0.8" />
      {/* Olive branch */}
      <path d="M8 26 Q12 22 14 18" stroke="#6B9A40" strokeWidth="1" fill="none" />
      <ellipse cx="12" cy="22" rx="2" ry="1" fill="#6B9A40" transform="rotate(-30 12 22)" />
      <ellipse cx="14" cy="18" rx="2" ry="1" fill="#6B9A40" transform="rotate(-20 14 18)" />
      <circle cx="20" cy="20" r="19" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25" />
    </svg>
  );
}

function CrestPRG() {
  // Prague — Gothic spire + astronomical clock face + Vltava river
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="prg-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1A2B6B" />
          <stop offset="100%" stopColor="#0D1840" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#prg-bg)" />
      {/* Astronomical clock face */}
      <circle cx="20" cy="21" r="10" fill="none" stroke="#C8A84B" strokeWidth="1" opacity="0.8" />
      <circle cx="20" cy="21" r="7" fill="#0D1840" opacity="0.6" />
      <circle cx="20" cy="21" r="4" fill="none" stroke="#C8A84B" strokeWidth="0.5" opacity="0.5" />
      {/* Clock hands */}
      <line x1="20" y1="21" x2="20" y2="14" stroke="#C8A84B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="21" x2="25" y2="23" stroke="#C8A84B" strokeWidth="1" strokeLinecap="round" />
      {/* Cardinal markers */}
      <circle cx="20" cy="12" r="0.8" fill="#C8A84B" />
      <circle cx="29" cy="21" r="0.8" fill="#C8A84B" />
      <circle cx="20" cy="30" r="0.8" fill="#C8A84B" />
      <circle cx="11" cy="21" r="0.8" fill="#C8A84B" />
      {/* Gothic spire of St. Vitus Cathedral */}
      <line x1="20" y1="4" x2="20" y2="12" stroke="#C8A84B" strokeWidth="1.5" />
      <polygon points="20,3 18,8 22,8" fill="#C8A84B" />
      <polygon points="20,6 18.5,9 21.5,9" fill="#0D1840" opacity="0.6" />
      {/* Vltava River arc */}
      <path d="M5 34 Q12 30 20 33 Q28 36 35 32" stroke="#5BA4D4" strokeWidth="1.5" fill="none" opacity="0.7" />
      {/* Charles Bridge pillars */}
      <rect x="13" y="29" width="2" height="4" fill="#C8A84B" opacity="0.5" />
      <rect x="25" y="29" width="2" height="4" fill="#C8A84B" opacity="0.5" />
      <circle cx="20" cy="20" r="19" stroke="#C8A84B" strokeWidth="0.5" fill="none" opacity="0.3" />
    </svg>
  );
}

function CrestIAD() {
  // Washington Dulles — Soaring Saarinen terminal + eagle silhouette + stars
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="iad-bg" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#1C3A7A" />
          <stop offset="100%" stopColor="#0A1C45" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#iad-bg)" />
      {/* Stars (5 stars for five points of DC star) */}
      {([
        [11, 9], [20, 7], [29, 9], [15, 13], [25, 13],
      ] as [number, number][]).map(([x, y], i) => (
        <polygon
          key={i}
          points={`${x},${y - 2} ${x + 0.7},${y} ${x + 2},${y} ${x + 1},${y + 1.2} ${x + 1.3},${y + 3} ${x},${y + 1.8} ${x - 1.3},${y + 3} ${x - 1},${y + 1.2} ${x - 2},${y} ${x - 0.7},${y}`}
          fill="#C8A84B"
          opacity="0.9"
        />
      ))}
      {/* Dulles terminal swooping roof — iconic Saarinen hyperbolic paraboloid */}
      <path d="M6 28 Q20 18 34 28 L34 32 Q20 30 6 32 Z" fill="white" opacity="0.88" />
      {/* Terminal control tower */}
      <rect x="18.5" y="20" width="3" height="8" fill="white" opacity="0.7" />
      <rect x="17" y="19" width="6" height="2" fill="white" opacity="0.7" />
      {/* Eagle wingspan */}
      <path d="M6 20 Q13 15 20 19 Q27 15 34 20" stroke="#C8A84B" strokeWidth="1.5" fill="none" opacity="0.8" />
      <polygon points="20,16 18,20 22,20" fill="#C8A84B" opacity="0.8" />
      {/* Runway stripes */}
      <line x1="10" y1="35" x2="30" y2="35" stroke="white" strokeWidth="0.75" strokeDasharray="3 2" opacity="0.4" />
      <circle cx="20" cy="20" r="19" stroke="#C8A84B" strokeWidth="0.5" fill="none" opacity="0.3" />
    </svg>
  );
}

function CrestNGO() {
  // Nagoya — Mt. Fuji silhouette + cherry blossom + rising sun rays
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ngo-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#B22222" />
          <stop offset="100%" stopColor="#7A1515" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#ngo-bg)" />
      {/* Rising sun rays */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={20}
            y1={20}
            x2={20 + 18 * Math.cos(angle)}
            y2={20 + 18 * Math.sin(angle)}
            stroke="#FFCC00"
            strokeWidth="0.75"
            opacity="0.3"
          />
        );
      })}
      {/* Mt. Fuji silhouette */}
      <path d="M4 30 L14 14 L18 19 L20 13 L22 19 L26 14 L36 30 Z" fill="white" opacity="0.9" />
      {/* Snow cap */}
      <path d="M20 13 L22.5 19 L17.5 19 Z" fill="#D6EEFF" />
      <path d="M20 13 L14 14 L18 19 L20 17 Z" fill="#E8F4FF" opacity="0.6" />
      {/* Cherry blossoms — 5 petals each */}
      {([
        [10, 10], [30, 10], [7, 22], [33, 22],
      ] as [number, number][]).map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="2" fill="#FFB7C5" opacity="0.9" />
          <circle cx={cx - 2} cy={cy - 1} r="1.2" fill="#FFB7C5" opacity="0.7" />
          <circle cx={cx + 2} cy={cy - 1} r="1.2" fill="#FFB7C5" opacity="0.7" />
          <circle cx={cx - 1} cy={cy + 2} r="1.2" fill="#FFB7C5" opacity="0.7" />
          <circle cx={cx + 1} cy={cy + 2} r="1.2" fill="#FFB7C5" opacity="0.7" />
          <circle cx={cx} cy={cy} r="0.8" fill="#FF6B6B" opacity="0.9" />
        </g>
      ))}
      {/* Pacific horizon */}
      <path d="M4 32 Q12 29 20 31 Q28 33 36 30" stroke="#5BA4D4" strokeWidth="1.5" fill="none" opacity="0.5" />
      <circle cx="20" cy="20" r="19" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25" />
    </svg>
  );
}

function CrestSAN() {
  // San Diego — Pacific wave + Coronado Bridge arc + sun + surf
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="san-bg" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#0B7A9E" />
          <stop offset="100%" stopColor="#055470" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#san-bg)" />
      {/* Sun */}
      <circle cx="20" cy="13" r="5" fill="#FFD700" opacity="0.9" />
      {/* Sun rays */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={20 + 6 * Math.cos(angle)}
            y1={13 + 6 * Math.sin(angle)}
            x2={20 + 9 * Math.cos(angle)}
            y2={13 + 9 * Math.sin(angle)}
            stroke="#FFD700"
            strokeWidth="1"
            opacity="0.7"
          />
        );
      })}
      {/* Coronado Bridge iconic curve */}
      <path d="M4 25 Q20 15 36 25" stroke="white" strokeWidth="2" fill="none" opacity="0.8" />
      {/* Bridge support pillars */}
      <line x1="12" y1="23" x2="12" y2="30" stroke="white" strokeWidth="1" opacity="0.6" />
      <line x1="20" y1="20" x2="20" y2="30" stroke="white" strokeWidth="1" opacity="0.6" />
      <line x1="28" y1="23" x2="28" y2="30" stroke="white" strokeWidth="1" opacity="0.6" />
      {/* Pacific wave */}
      <path d="M3 30 Q8 27 12 30 Q16 33 20 30 Q24 27 28 30 Q32 33 37 30" stroke="white" strokeWidth="2" fill="none" opacity="0.85" />
      {/* Foam / surf */}
      <path d="M3 33 Q8 31 12 33 Q16 35 20 33 Q24 31 28 33 Q32 35 37 33" stroke="#C8F0FF" strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="20" cy="20" r="19" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25" />
    </svg>
  );
}

function CrestMCT() {
  // Muscat — Arabian crescent and star + fort battlements + desert dunes
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="mct-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C8860A" />
          <stop offset="100%" stopColor="#8B5E00" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#mct-bg)" />
      {/* Desert dune silhouette */}
      <path d="M2 32 Q10 25 20 28 Q30 31 38 26 L38 38 L2 38 Z" fill="#6B4500" opacity="0.5" />
      {/* Muscat Fort Al-Jalali battlements */}
      <rect x="7" y="22" width="12" height="8" fill="#F5E4B0" opacity="0.8" />
      {/* Battlements */}
      {[7, 9, 11, 13, 15].map((x, i) => (
        <rect key={i} x={x} y="19" width="1.5" height="3" fill="#F5E4B0" opacity="0.8" />
      ))}
      {/* Fort tower */}
      <rect x="6" y="17" width="4" height="5" fill="#E8D498" opacity="0.8" />
      <polygon points="8,14 6,18 10,18" fill="#E8D498" opacity="0.8" />
      {/* Crescent moon */}
      <path d="M26 8 A8 8 0 1 1 26 24 A6 6 0 1 0 26 8" fill="white" opacity="0.95" />
      {/* Star */}
      <polygon
        points="33,13 33.8,15.8 36.6,15.8 34.4,17.4 35.2,20.2 33,18.6 30.8,20.2 31.6,17.4 29.4,15.8 32.2,15.8"
        fill="white"
        opacity="0.9"
      />
      {/* Palm silhouette */}
      <line x1="21" y1="38" x2="21" y2="28" stroke="#2D5A00" strokeWidth="1.5" />
      <path d="M21 28 Q18 24 14 26" stroke="#3A7A00" strokeWidth="1" fill="none" />
      <path d="M21 28 Q24 24 27 26" stroke="#3A7A00" strokeWidth="1" fill="none" />
      <path d="M21 28 Q17 25 15 22" stroke="#3A7A00" strokeWidth="1" fill="none" />
      <circle cx="20" cy="20" r="19" stroke="white" strokeWidth="0.5" fill="none" opacity="0.2" />
    </svg>
  );
}

function CrestLEJ() {
  // Leipzig — Book of Knowledge + Baroque organ pipes + Bach treble clef
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lej-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1B5E20" />
          <stop offset="100%" stopColor="#0A3A0A" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#lej-bg)" />
      {/* Open book */}
      <path d="M8 15 L20 12 L32 15 L32 28 L20 25 L8 28 Z" fill="#F5E4B0" opacity="0.85" />
      <line x1="20" y1="12" x2="20" y2="25" stroke="#8B6500" strokeWidth="1" opacity="0.7" />
      {/* Book text lines */}
      {[16, 18, 20, 22].map((y, i) => (
        <line key={i} x1={i % 2 === 0 ? 10 : 22} y1={y} x2={i % 2 === 0 ? 18 : 30} y2={y}
          stroke="#8B6500" strokeWidth="0.75" opacity="0.5" />
      ))}
      {/* Organ pipes — Baroque */}
      {[12, 14.5, 17, 23, 25.5, 28].map((x, i) => (
        <rect key={i} x={x} y={30 - [8, 6, 4, 4, 6, 8][i]} width="1.8" height={[8, 6, 4, 4, 6, 8][i]}
          fill="#C8A84B" opacity="0.85" rx="0.5" />
      ))}
      {/* Treble clef (simplified) */}
      <path d="M20 8 Q22 10 21 13 Q20 15 20 17 Q22 17 22 19 Q22 22 20 23" stroke="#C8A84B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="22" r="1.5" fill="#C8A84B" opacity="0.8" />
      {/* Torch of knowledge */}
      <line x1="35" y1="30" x2="35" y2="20" stroke="#C8A84B" strokeWidth="1.5" />
      <path d="M33 20 Q35 15 37 20 Q35 18 33 20" fill="#FF6600" opacity="0.9" />
      <circle cx="20" cy="20" r="19" stroke="#C8A84B" strokeWidth="0.5" fill="none" opacity="0.3" />
    </svg>
  );
}

function CrestSXM() {
  // St. Maarten — Caribbean sun + palm + famous Maho Beach approach path
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sxm-bg" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#00A3C8" />
          <stop offset="100%" stopColor="#006A8A" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#sxm-bg)" />
      {/* Tropical sky gradient overlay */}
      <path d="M0 0 A20 20 0 0 1 40 0 L40 18 Q20 12 0 18 Z" fill="#FF8C00" opacity="0.25" />
      {/* Radiant sun */}
      <circle cx="20" cy="12" r="6" fill="#FFD700" opacity="0.95" />
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i * 36 * Math.PI) / 180;
        return (
          <line key={i}
            x1={20 + 7 * Math.cos(angle)} y1={12 + 7 * Math.sin(angle)}
            x2={20 + 10 * Math.cos(angle)} y2={12 + 10 * Math.sin(angle)}
            stroke="#FFD700" strokeWidth="1" opacity="0.6"
          />
        );
      })}
      {/* Palm trunk */}
      <path d="M28 38 Q30 32 28 28 Q26 24 28 20" stroke="#5A3A00" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Palm fronds */}
      <path d="M28 20 Q22 16 18 18" stroke="#2D6A00" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M28 20 Q25 14 22 14" stroke="#2D6A00" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M28 20 Q30 14 32 15" stroke="#2D6A00" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M28 20 Q34 18 36 20" stroke="#2D6A00" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Maho Beach wave */}
      <path d="M3 28 Q8 25 12 28 Q16 31 20 28 Q24 25 28 28" stroke="white" strokeWidth="2" fill="none" opacity="0.8" />
      {/* Aircraft approach path line */}
      <path d="M5 22 L18 29" stroke="white" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
      <polygon points="18,29 15,27 16,30" fill="white" opacity="0.6" />
      {/* Sea sparkles */}
      <circle cx="8" cy="32" r="0.8" fill="white" opacity="0.5" />
      <circle cx="14" cy="34" r="0.8" fill="white" opacity="0.4" />
      <circle cx="22" cy="33" r="0.8" fill="white" opacity="0.5" />
      <circle cx="20" cy="20" r="19" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25" />
    </svg>
  );
}

function CrestLHR() {
  // London Heathrow — St Edward's Crown + Thames/Tower Bridge silhouette
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lhr-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4B0082" />
          <stop offset="100%" stopColor="#2A004A" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#lhr-bg)" />
      {/* Crown base */}
      <rect x="10" y="20" width="20" height="5" fill="#C8A84B" rx="1" />
      {/* Crown band detail */}
      <rect x="10" y="21.5" width="20" height="2" fill="#8B6500" opacity="0.5" />
      {/* Crown jewels */}
      {[13, 17, 23, 27].map((x, i) => (
        <circle key={i} cx={x} cy="22.5" r="1.2" fill={["#FF4444", "#44AAFF", "#FF4444", "#44AAFF"][i]} />
      ))}
      {/* Crown points */}
      <polygon points="12,20 13,14 14,20" fill="#C8A84B" />
      <polygon points="16,20 17,12 18,20" fill="#C8A84B" />
      <polygon points="20,20 21,11 22,20" fill="#C8A84B" />
      <polygon points="22,20 23,12 24,20" fill="#C8A84B" />
      <polygon points="26,20 27,14 28,20" fill="#C8A84B" />
      {/* Orb on top */}
      <circle cx="21" cy="10" r="2" fill="#C8A84B" />
      <circle cx="21" cy="10" r="1" fill="#44AAFF" opacity="0.8" />
      <line x1="19" y1="10" x2="23" y2="10" stroke="#C8A84B" strokeWidth="0.8" />
      <line x1="21" y1="8" x2="21" y2="12" stroke="#C8A84B" strokeWidth="0.8" />
      {/* Tower Bridge silhouette */}
      <rect x="8" y="27" width="3" height="8" fill="#C8A84B" opacity="0.6" />
      <rect x="29" y="27" width="3" height="8" fill="#C8A84B" opacity="0.6" />
      {/* Bridge cables */}
      <path d="M9 27 Q20 31 31 27" stroke="#C8A84B" strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M9 28.5 Q20 33 31 28.5" stroke="#C8A84B" strokeWidth="0.5" fill="none" opacity="0.35" />
      {/* Thames */}
      <rect x="5" y="35" width="30" height="3" fill="#5BA4D4" opacity="0.4" rx="1" />
      <circle cx="20" cy="20" r="19" stroke="#C8A84B" strokeWidth="0.5" fill="none" opacity="0.3" />
    </svg>
  );
}

function CrestSYD() {
  // Sydney — Opera House sails + Harbour Bridge arc + Southern Cross stars
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="syd-bg" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#005B8E" />
          <stop offset="100%" stopColor="#002D50" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#syd-bg)" />
      {/* Southern Cross constellation */}
      {([
        [30, 8], [33, 11], [29, 14], [32, 17], [27, 11],
      ] as [number, number][]).map(([x, y], i) => (
        <polygon key={i}
          points={`${x},${y - 1.5} ${x + 0.6},${y + 0.5} ${x + 1.8},${y + 0.5} ${x + 0.9},${y + 1.5} ${x + 1.2},${y + 2.8} ${x},${y + 2} ${x - 1.2},${y + 2.8} ${x - 0.9},${y + 1.5} ${x - 1.8},${y + 0.5} ${x - 0.6},${y + 0.5}`}
          fill="white"
          opacity="0.85"
        />
      ))}
      {/* Sydney Opera House — iconic shell sails */}
      <path d="M8 28 Q12 18 16 28" fill="white" opacity="0.9" />
      <path d="M11 28 Q17 14 22 28" fill="white" opacity="0.85" />
      <path d="M15 28 Q22 10 27 28" fill="white" opacity="0.8" />
      {/* Base platform */}
      <rect x="6" y="28" width="22" height="2" fill="white" opacity="0.7" rx="0.5" />
      {/* Sydney Harbour Bridge arc */}
      <path d="M4 30 Q20 16 36 30" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7" />
      <line x1="4" y1="25" x2="4" y2="30" stroke="white" strokeWidth="1.5" opacity="0.6" />
      <line x1="36" y1="25" x2="36" y2="30" stroke="white" strokeWidth="1.5" opacity="0.6" />
      {/* Harbour */}
      <path d="M2 33 Q10 31 20 33 Q30 35 38 32" stroke="#5BA4D4" strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="20" cy="20" r="19" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25" />
    </svg>
  );
}

function CrestBKK() {
  // Bangkok — Golden pagoda stupa + lotus flower + Chao Phraya river
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bkk-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C06000" />
          <stop offset="100%" stopColor="#7A3A00" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#bkk-bg)" />
      {/* Pagoda tiers (bottom to top) */}
      <rect x="11" y="26" width="18" height="5" fill="#FFD700" opacity="0.9" rx="1" />
      <rect x="13" y="21" width="14" height="5" fill="#FFD700" opacity="0.9" rx="1" />
      <rect x="15" y="17" width="10" height="4" fill="#FFD700" opacity="0.9" rx="1" />
      <rect x="17" y="14" width="6" height="3" fill="#FFD700" opacity="0.9" rx="1" />
      {/* Spire */}
      <line x1="20" y1="6" x2="20" y2="14" stroke="#FFD700" strokeWidth="1.5" />
      <circle cx="20" cy="6" r="1.5" fill="#FFD700" />
      <circle cx="20" cy="9" r="1" fill="#FFD700" />
      <circle cx="20" cy="12" r="0.8" fill="#FFD700" />
      {/* Roof upturned eaves */}
      <path d="M9 27 L11 26 L11 27" stroke="#8B4500" strokeWidth="1" fill="none" />
      <path d="M31 27 L29 26 L29 27" stroke="#8B4500" strokeWidth="1" fill="none" />
      {/* Lotus petals in foreground */}
      {[-2, 0, 2].map((offset, i) => (
        <ellipse key={i} cx={20 + offset * 3} cy={35} rx="2" ry="3.5"
          fill="#FF85A2" opacity="0.8" transform={`rotate(${offset * 10} ${20 + offset * 3} 35)`} />
      ))}
      <circle cx="20" cy="34" r="1.5" fill="#FFD700" opacity="0.9" />
      {/* Chao Phraya river */}
      <path d="M2 31 Q8 29 14 31 Q20 33 26 31 Q32 29 38 31" stroke="#5BA4D4" strokeWidth="1.5" fill="none" opacity="0.55" />
      <circle cx="20" cy="20" r="19" stroke="#FFD700" strokeWidth="0.5" fill="none" opacity="0.3" />
    </svg>
  );
}

function CrestMSY() {
  // New Orleans — Fleur-de-lis + Jazz trumpet + Mississippi River crescent
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="msy-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5B0EA6" />
          <stop offset="100%" stopColor="#35006A" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#msy-bg)" />
      {/* Mardi Gras sparkles */}
      {([
        [8, 8, "#FFD700"], [32, 8, "#00CC44"], [6, 30, "#FFD700"],
        [34, 28, "#00CC44"], [12, 16, "#FF6600"], [28, 14, "#FF6600"],
      ] as [number, number, string][]).map(([x, y, color], i) => (
        <circle key={i} cx={x} cy={y} r={0.8} fill={color} opacity={0.7} />
      ))}
      {/* Fleur-de-lis — central motif */}
      {/* Center petal */}
      <path d="M20 8 Q22 12 22 15 Q20 17 18 15 Q18 12 20 8" fill="#C8A84B" />
      {/* Left petal */}
      <path d="M20 15 Q16 14 14 16 Q14 19 17 19 Q19 18 20 15" fill="#C8A84B" />
      {/* Right petal */}
      <path d="M20 15 Q24 14 26 16 Q26 19 23 19 Q21 18 20 15" fill="#C8A84B" />
      {/* Base */}
      <path d="M17 19 Q18 23 20 25 Q22 23 23 19" fill="#C8A84B" />
      <path d="M15 20 Q14 24 16 25 Q18 24 17 19" fill="#C8A84B" opacity="0.7" />
      <path d="M25 20 Q26 24 24 25 Q22 24 23 19" fill="#C8A84B" opacity="0.7" />
      <circle cx="20" cy="19" r="1.5" fill="#8B6500" />
      {/* Jazz trumpet (simplified bell) */}
      <path d="M25 27 Q28 25 31 22 Q33 20 36 21 Q35 24 32 25 Q30 26 28 29 Z" fill="white" opacity="0.75" />
      <line x1="25" y1="27" x2="24" y2="30" stroke="white" strokeWidth="1" opacity="0.7" />
      {/* Mississippi River crescent */}
      <path d="M4 33 Q12 28 20 30 Q28 32 36 27" stroke="#5BA4D4" strokeWidth="2" fill="none" opacity="0.7" />
      <circle cx="20" cy="20" r="19" stroke="#C8A84B" strokeWidth="0.5" fill="none" opacity="0.3" />
    </svg>
  );
}

function CrestHKG() {
  // Hong Kong — Bauhinia flower + Victoria Harbour skyline + junk silhouette
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="hkg-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#B20000" />
          <stop offset="100%" stopColor="#700000" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#hkg-bg)" />
      {/* Bauhinia flower — 5 petals with stamens */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i * 72 - 90) * (Math.PI / 180);
        const px = 20 + 8 * Math.cos(angle);
        const py = 20 + 8 * Math.sin(angle);
        const nextAngle = ((i + 1) * 72 - 90) * (Math.PI / 180);
        const nx = 20 + 8 * Math.cos(nextAngle);
        const ny = 20 + 8 * Math.sin(nextAngle);
        return (
          <path key={i}
            d={`M 20 20 Q ${(px + nx) / 2 + 2 * Math.cos(angle)} ${(py + ny) / 2 + 2 * Math.sin(angle)} ${px} ${py}`}
            fill="white"
            opacity="0.9"
          />
        );
      })}
      <circle cx="20" cy="20" r="3" fill="#B20000" />
      <circle cx="20" cy="20" r="1.5" fill="white" opacity="0.8" />
      {/* Victoria Harbour skyline silhouette */}
      {([
        [6, 30, 3, 10], [10, 32, 2, 8], [13, 28, 3, 12], [17, 31, 2, 9],
        [22, 29, 3, 11], [26, 32, 2, 8], [29, 27, 3, 13], [33, 31, 2, 9],
      ] as [number, number, number, number][]).map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="white" opacity={0.6 - i * 0.03} rx="0.5" />
      ))}
      {/* Traditional junk */}
      <path d="M5 33 Q8 30 11 33 L11 36 L5 36 Z" fill="#C8A84B" opacity="0.7" />
      <line x1="8" y1="30" x2="8" y2="25" stroke="#C8A84B" strokeWidth="1" opacity="0.7" />
      <path d="M8 25 L12 29 L8 30" fill="#C8A84B" opacity="0.6" />
      {/* Harbour water */}
      <path d="M2 35 Q10 33 20 35 Q30 37 38 34" stroke="#5BA4D4" strokeWidth="1.5" fill="none" opacity="0.5" />
      <circle cx="20" cy="20" r="19" stroke="white" strokeWidth="0.5" fill="none" opacity="0.2" />
    </svg>
  );
}

function CrestZRH() {
  // Zurich — Swiss cross + Lindwurm dragon + alpine snowflake
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="zrh-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#CC0000" />
          <stop offset="100%" stopColor="#880000" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#zrh-bg)" />
      {/* Swiss cross */}
      <rect x="14" y="9" width="12" height="22" fill="white" opacity="0.95" rx="1" />
      <rect x="9" y="14" width="22" height="12" fill="white" opacity="0.95" rx="1" />
      {/* Inner cross cutout to make it look layered */}
      <rect x="15" y="10" width="10" height="20" fill="white" />
      <rect x="10" y="15" width="20" height="10" fill="white" />
      {/* Swiss edelweiss / snowflake overlay */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i * 60 * Math.PI) / 180;
        return (
          <line key={i}
            x1={20} y1={20}
            x2={20 + 5 * Math.cos(angle)} y2={20 + 5 * Math.sin(angle)}
            stroke="#CC0000" strokeWidth="1.2"
          />
        );
      })}
      <circle cx="20" cy="20" r="2" fill="#CC0000" />
      {/* Thin accent ring */}
      <circle cx="20" cy="20" r="19" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3" />
    </svg>
  );
}

function CrestCNN() {
  // Kannur — Kerala mural lotus + spice leaf (pepper vine) + Malabar coastline
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cnn-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1A6600" />
          <stop offset="100%" stopColor="#0A3D00" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#cnn-bg)" />
      {/* Kerala mural style lotus — saffron petals */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        return (
          <ellipse key={i}
            cx={20 + 7 * Math.cos(angle)}
            cy={20 + 7 * Math.sin(angle)}
            rx="3" ry="5"
            fill="#FF8C00"
            opacity="0.85"
            transform={`rotate(${i * 45} ${20 + 7 * Math.cos(angle)} ${20 + 7 * Math.sin(angle)})`}
          />
        );
      })}
      <circle cx="20" cy="20" r="5" fill="#FFD700" opacity="0.9" />
      <circle cx="20" cy="20" r="3" fill="#FF6600" opacity="0.9" />
      {/* Black pepper vine (spice heritage) */}
      <path d="M7 38 Q10 32 12 26 Q14 20 12 14" stroke="#A8D48A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Leaf clusters */}
      {[[12, 14], [11, 19], [12, 25]].map(([x, y], i) => (
        <ellipse key={i} cx={x + 3} cy={y} rx="3" ry="2" fill="#4CAF50" opacity="0.8"
          transform={`rotate(-30 ${x + 3} ${y})`} />
      ))}
      {/* Pepper berries */}
      {[[14, 13], [13, 18], [14, 24]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1" fill="#3D7A00" opacity="0.8" />
      ))}
      {/* Malabar coast */}
      <path d="M20 38 Q28 34 36 36" stroke="#5BA4D4" strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="20" cy="20" r="19" stroke="#FFD700" strokeWidth="0.5" fill="none" opacity="0.3" />
    </svg>
  );
}

function CrestGRU() {
  // São Paulo — Obelisk Anhangabaú + coffee bean + Southern Cross
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gru-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#006633" />
          <stop offset="100%" stopColor="#003D1A" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#gru-bg)" />
      {/* Brazilian flag diamond */}
      <polygon points="20,4 36,20 20,36 4,20" fill="#FFD700" opacity="0.25" />
      {/* Southern Cross stars (5) */}
      {([
        [26, 12], [29, 16], [25, 19], [28, 22], [23, 15],
      ] as [number, number][]).map(([x, y], i) => (
        <polygon key={i}
          points={`${x},${y - 1.5} ${x + 0.6},${y + 0.5} ${x + 1.8},${y + 0.5} ${x + 0.9},${y + 1.5} ${x + 1.2},${y + 2.8} ${x},${y + 2} ${x - 1.2},${y + 2.8} ${x - 0.9},${y + 1.5} ${x - 1.8},${y + 0.5} ${x - 0.6},${y + 0.5}`}
          fill="white"
          opacity="0.8"
        />
      ))}
      {/* Coffee bean */}
      <ellipse cx="13" cy="18" rx="5" ry="7" fill="#6B3A00" opacity="0.85" />
      <path d="M13 11 Q15 18 13 25" stroke="#C8A84B" strokeWidth="1" fill="none" opacity="0.7" />
      {/* Guarulhos Airport obelisk monument */}
      <polygon points="20,8 22,30 18,30" fill="#C8A84B" opacity="0.7" />
      <rect x="17" y="28" width="6" height="2" fill="#C8A84B" opacity="0.7" rx="0.5" />
      {/* Amazon river / Tietê */}
      <path d="M2 34 Q10 31 20 33 Q30 35 38 32" stroke="#5BA4D4" strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="20" cy="20" r="19" stroke="#FFD700" strokeWidth="0.5" fill="none" opacity="0.3" />
    </svg>
  );
}

function CrestSCL() {
  // Santiago — Andean condor in flight + Andes peak + copper sun
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="scl-bg" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#8B4513" />
          <stop offset="100%" stopColor="#5A2800" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#scl-bg)" />
      {/* Andes mountain range */}
      <path d="M2 30 L8 18 L13 24 L18 10 L23 22 L27 14 L33 20 L38 28 L38 38 L2 38 Z" fill="white" opacity="0.8" />
      {/* Snow caps */}
      <path d="M18 10 L21.5 18 L14.5 18 Z" fill="#D6EEFF" />
      <path d="M27 14 L30 20 L24 20 Z" fill="#D6EEFF" opacity="0.7" />
      {/* Copper sun (Chilean national symbol) */}
      <circle cx="28" cy="11" r="6" fill="#B87333" opacity="0.9" />
      {/* Condor wingspan — soaring above Andes */}
      <path d="M4 16 Q10 10 18 16" fill="#1A0A00" opacity="0.85" />
      <path d="M22 16 Q30 10 36 16" fill="#1A0A00" opacity="0.85" />
      {/* Condor body + head */}
      <ellipse cx="20" cy="17" rx="3" ry="2" fill="#1A0A00" opacity="0.9" />
      <circle cx="20" cy="14" r="2" fill="#1A0A00" opacity="0.9" />
      {/* Condor white collar */}
      <path d="M17 16 Q20 14 23 16" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8" />
      {/* Wing feathers */}
      {[-6, -4, -2].map((offset, i) => (
        <line key={i} x1={14 + i * 2} y1={16} x2={14 + i * 2 + offset} y2={19}
          stroke="#1A0A00" strokeWidth="1" opacity="0.7" />
      ))}
      {[2, 4, 6].map((offset, i) => (
        <line key={i} x1={22 + i * 2} y1={16} x2={22 + i * 2 + offset} y2={19}
          stroke="#1A0A00" strokeWidth="1" opacity="0.7" />
      ))}
      {/* Pacific Ocean */}
      <path d="M2 34 Q8 32 14 34" stroke="#5BA4D4" strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="20" cy="20" r="19" stroke="#B87333" strokeWidth="0.5" fill="none" opacity="0.4" />
    </svg>
  );
}

/* ─── Fallback crest ──────────────────────────────────────────────────────── */

function CrestFallback({ code }: { code: string }) {
  // Deterministic color from IATA code
  const colors = ["#1240C7", "#A8C229", "#F25E24", "#141A1F", "#5E6366"];
  const colorIndex = code.charCodeAt(0) % colors.length;
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill={colors[colorIndex]} />
      <circle cx="20" cy="20" r="17" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <text
        x="20" y="24"
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="800"
        fontFamily="monospace"
        opacity="0.95"
      >
        {code.slice(0, 3).toUpperCase()}
      </text>
    </svg>
  );
}

/* ─── Crest registry ─────────────────────────────────────────────────────── */

const CREST_MAP: Record<string, () => React.ReactElement> = {
  INN: CrestINN,
  BRI: CrestBRI,
  PRG: CrestPRG,
  IAD: CrestIAD,
  NGO: CrestNGO,
  SAN: CrestSAN,
  MCT: CrestMCT,
  LEJ: CrestLEJ,
  SXM: CrestSXM,
  LHR: CrestLHR,
  SYD: CrestSYD,
  BKK: CrestBKK,
  MSY: CrestMSY,
  HKG: CrestHKG,
  ZRH: CrestZRH,
  CNN: CrestCNN,
  GRU: CrestGRU,
  SCL: CrestSCL,
};

/* ─── Public component ───────────────────────────────────────────────────── */

export function AirportCrest({ code, size = 40, className }: AirportCrestProps) {
  const CrestComponent = CREST_MAP[code.toUpperCase()];
  return (
    <span
      className={className}
      style={{ display: "inline-block", width: size, height: size, flexShrink: 0 }}
      title={code.toUpperCase()}
    >
      {CrestComponent ? <CrestComponent /> : <CrestFallback code={code} />}
    </span>
  );
}
