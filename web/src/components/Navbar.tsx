import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Plus, LogOut, ShieldCheck, ChevronDown, LayoutDashboard, Globe, Menu, X } from "lucide-react";

interface NavbarProps {
  activeTab: "marketplace" | "new-contract" | "dashboard" | "profile" | "alliances";
  onNavigate: (
    tab: "marketplace" | "new-contract" | "dashboard" | "profile" | "alliances",
    param?: string
  ) => void;
}

/** SkyLink WoA brand crest — twin-jet departure silhouette with electric-lime contrails */
function SkyLinkCrest({ size = 44 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      aria-label="SkyLink WoA brand crest"
    >
      {/* Outer dark ring */}
      <circle cx="22" cy="22" r="21" fill="#141A1F" stroke="#1240C7" strokeWidth="1.5" />
      {/* Inner subtle cobalt ring */}
      <circle cx="22" cy="22" r="17" fill="none" stroke="#1240C7" strokeWidth="0.5" opacity="0.35" />
      {/* Aircraft fuselage + wings — angled departure (nose upper-right) */}
      <path
        d="M11 27 L27 16 L34 18 L28 21 L33 29 L29 28 L27 23 L19 25 L21 29 L17 28 Z"
        fill="#1240C7"
      />
      {/* Electric lime contrail streaks */}
      <line x1="10" y1="25" x2="4" y2="26.5" stroke="#A8C229" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="10" y1="28" x2="3"  y2="30"   stroke="#A8C229" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
      <line x1="10" y1="31" x2="6"  y2="33"   stroke="#A8C229" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
      {/* Lime nav beacon */}
      <circle cx="34" cy="18" r="2.2" fill="#A8C229" />
    </svg>
  );
}

export const Navbar = ({ activeTab, onNavigate }: NavbarProps) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F0EBDE] border-b border-[#C9C7BA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[76px] sm:h-[86px] flex items-center justify-between gap-3 lg:gap-6">

        {/* ── Left: SkyLink WoA brand ── */}
        <div
          onClick={() => {
            setMobileMenuOpen(false);
            onNavigate("marketplace");
          }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
        >
          {/* Premium twin-jet crest */}
          <div className="group-hover:scale-105 transition-transform duration-200 shrink-0">
            <SkyLinkCrest size={38} />
          </div>

          {/* Wordmark */}
          <div className="flex flex-col shrink-0">
            <div className="flex items-baseline gap-1.5 sm:gap-2 whitespace-nowrap shrink-0">
              <span
                className="font-black text-[#141A1F] text-lg sm:text-[1.25rem] leading-none tracking-tight"
                style={{ fontFamily: "Inter, system-ui, sans-serif", letterSpacing: "-0.025em" }}
              >
                Sky<span className="text-[#1240C7]">Link</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-[#5E6366] tracking-widest uppercase leading-none">
                WOA
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#1240C7]/10 text-[#1240C7] tracking-wide leading-none">
                BETA
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-[0.08em] uppercase text-[#5E6366] mt-0.5 hidden xl:block whitespace-nowrap">
              Connect Your Fleets · Expand Your Reach
            </span>
          </div>
        </div>

        {/* ── Center: Desktop Navigation pill tabs ── */}
        <nav className="hidden md:flex items-center gap-1 bg-[#FFFFFA] p-1 lg:p-1.5 rounded-full border border-[#C9C7BA] shadow-xs shrink-0">
          <button
            onClick={() => onNavigate("marketplace")}
            className={`px-3 py-1.5 lg:px-4 lg:py-2 xl:px-5 xl:py-2 rounded-full text-[11px] lg:text-xs font-mono font-bold tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "marketplace"
                ? "bg-[#141A1F] text-white shadow-xs"
                : "text-[#5E6366] hover:text-[#141A1F] hover:bg-[#F0EBDE]"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            MARKETPLACE
          </button>
          <button
            onClick={() => onNavigate("alliances")}
            className={`px-3 py-1.5 lg:px-4 lg:py-2 xl:px-5 xl:py-2 rounded-full text-[11px] lg:text-xs font-mono font-bold tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "alliances"
                ? "bg-[#141A1F] text-white shadow-xs"
                : "text-[#5E6366] hover:text-[#141A1F] hover:bg-[#F0EBDE]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            ALLIANCES
          </button>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal("login");
              } else {
                onNavigate("new-contract");
              }
            }}
            className={`px-3 py-1.5 lg:px-4 lg:py-2 xl:px-5 xl:py-2 rounded-full text-[11px] lg:text-xs font-mono font-bold tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "new-contract"
                ? "bg-[#141A1F] text-white shadow-xs"
                : "text-[#5E6366] hover:text-[#141A1F] hover:bg-[#F0EBDE]"
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-[#F25E24]" />
            NEW CONTRACT
          </button>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal("login");
              } else {
                onNavigate("dashboard");
              }
            }}
            className={`px-3 py-1.5 lg:px-4 lg:py-2 xl:px-5 xl:py-2 rounded-full text-[11px] lg:text-xs font-mono font-bold tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "dashboard"
                ? "bg-[#141A1F] text-white shadow-xs"
                : "text-[#5E6366] hover:text-[#141A1F] hover:bg-[#F0EBDE]"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            PILOT DECK
          </button>
        </nav>

        {/* ── Right: Auth state + Mobile toggle ── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="h-10 sm:h-11 px-3 sm:px-4 rounded-full bg-[#141A1F] text-white flex items-center gap-2 text-xs font-mono hover:bg-[#252E36] transition cursor-pointer shadow-sm"
              >
                {/* Avatar */}
                <div className="w-6 h-6 rounded-full bg-[#1240C7] flex items-center justify-center font-mono font-bold text-[10px] text-white shrink-0">
                  {(user.discordUsername || user.woaPlayerId || "WOA").slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight max-w-[120px] truncate">
                  <span className="font-bold text-white tracking-wide truncate">{user.discordUsername || user.woaPlayerId}</span>
                  <span className="text-[10px] text-[#C9C7BA] truncate">{user.discordUsername ? user.woaPlayerId : "WOA PILOT"}</span>
                </div>
                {/* Reputation badge */}
                <div className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#A8C229] text-[#141A1F] font-bold text-[10px]">
                  {user.reputationScore}%
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#C9C7BA]" />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] shadow-xl py-2 z-50 text-[#141A1F] animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-[#C9C7BA]/50">
                    <p className="text-[11px] font-mono text-[#5E6366]">SIGNED IN AS</p>
                    <p className="text-xs font-bold font-mono text-[#141A1F] truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { setDropdownOpen(false); onNavigate("profile", user.id); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[#F0EBDE] flex items-center gap-2 transition cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#1240C7]" />
                    Pilot Reputation Dossier
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); onNavigate("dashboard"); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[#F0EBDE] flex items-center gap-2 transition cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#F25E24]" />
                    Active Flight Deck
                  </button>
                  <div className="my-1 border-t border-[#C9C7BA]/50" />
                  <button
                    onClick={() => { setDropdownOpen(false); logout(); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#F25E24] hover:bg-[#F25E24]/10 flex items-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-[#F25E24]" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                onClick={() => openAuthModal("login")}
                className="text-xs font-mono font-bold uppercase tracking-wider text-[#141A1F] hover:text-[#1240C7] transition cursor-pointer px-2 py-1"
              >
                SIGN IN
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className="h-9 sm:h-11 px-3.5 sm:px-5 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] active:scale-95 transition cursor-pointer shadow-md shadow-[#1240C7]/20 flex items-center gap-1.5"
              >
                <span>JOIN</span>
              </button>
            </div>
          )}

          {/* Mobile Navigation Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-[#FFFFFA] border border-[#C9C7BA] text-[#141A1F] hover:bg-[#F0EBDE] transition cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* ── Mobile Expandable Navigation Panel ── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFFFA] border-b border-[#C9C7BA] px-4 py-4 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate("marketplace");
            }}
            className={`w-full px-4 py-3 rounded-2xl text-xs font-mono font-bold tracking-wider transition cursor-pointer flex items-center gap-3 ${
              activeTab === "marketplace"
                ? "bg-[#141A1F] text-white shadow-xs"
                : "text-[#5E6366] hover:bg-[#F0EBDE] hover:text-[#141A1F]"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>MARKETPLACE</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate("alliances");
            }}
            className={`w-full px-4 py-3 rounded-2xl text-xs font-mono font-bold tracking-wider transition cursor-pointer flex items-center gap-3 ${
              activeTab === "alliances"
                ? "bg-[#141A1F] text-white shadow-xs"
                : "text-[#5E6366] hover:bg-[#F0EBDE] hover:text-[#141A1F]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ALLIANCES</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (!isAuthenticated) openAuthModal("login");
              else onNavigate("new-contract");
            }}
            className={`w-full px-4 py-3 rounded-2xl text-xs font-mono font-bold tracking-wider transition cursor-pointer flex items-center gap-3 ${
              activeTab === "new-contract"
                ? "bg-[#141A1F] text-white shadow-xs"
                : "text-[#5E6366] hover:bg-[#F0EBDE] hover:text-[#141A1F]"
            }`}
          >
            <Plus className="w-4 h-4 text-[#F25E24]" />
            <span>NEW CONTRACT</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (!isAuthenticated) openAuthModal("login");
              else onNavigate("dashboard");
            }}
            className={`w-full px-4 py-3 rounded-2xl text-xs font-mono font-bold tracking-wider transition cursor-pointer flex items-center gap-3 ${
              activeTab === "dashboard"
                ? "bg-[#141A1F] text-white shadow-xs"
                : "text-[#5E6366] hover:bg-[#F0EBDE] hover:text-[#141A1F]"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>PILOT DECK</span>
          </button>
        </div>
      )}
    </header>
  );
};
