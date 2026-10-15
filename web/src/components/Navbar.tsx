import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Plane, Plus, User as UserIcon, LogOut, ShieldCheck, ChevronDown } from "lucide-react";

interface NavbarProps {
  activeTab: "marketplace" | "new-contract" | "dashboard" | "profile";
  onNavigate: (tab: "marketplace" | "new-contract" | "dashboard" | "profile", param?: string) => void;
}

export const Navbar = ({ activeTab, onNavigate }: NavbarProps) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F0EBDE] border-b border-[#C9C7BA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[86px] flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div
          onClick={() => onNavigate("marketplace")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-[#1240C7] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-[#141A1F] text-lg font-mono leading-none">
                WOA CONTRACT HUB
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#1240C7]/10 text-[#1240C7]">
                DISPATCH v1.0
              </span>
            </div>
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#5E6366] mt-0.5">
              WORLD OF AIRPORTS COMMUNITY EXCHANGE
            </span>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#FFFFFA] p-1.5 rounded-full border border-[#C9C7BA] shadow-xs">
          <button
            onClick={() => onNavigate("marketplace")}
            className={`px-5 py-2 rounded-full text-xs font-mono font-bold tracking-wider transition cursor-pointer ${
              activeTab === "marketplace"
                ? "bg-[#141A1F] text-white shadow-xs"
                : "text-[#5E6366] hover:text-[#141A1F] hover:bg-[#F0EBDE]"
            }`}
          >
            MARKETPLACE
          </button>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal("login");
              } else {
                onNavigate("new-contract");
              }
            }}
            className={`px-5 py-2 rounded-full text-xs font-mono font-bold tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
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
            className={`px-5 py-2 rounded-full text-xs font-mono font-bold tracking-wider transition cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-[#141A1F] text-white shadow-xs"
                : "text-[#5E6366] hover:text-[#141A1F] hover:bg-[#F0EBDE]"
            }`}
          >
            PILOT DECK
          </button>
        </nav>

        {/* Right: User State / CTA */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="h-11 px-4 rounded-full bg-[#141A1F] text-white flex items-center gap-2.5 text-xs font-mono hover:bg-[#252E36] transition cursor-pointer shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-[#FFFFFA]/15 flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-bold text-white tracking-wide">
                    {user.discordUsername}
                  </span>
                  <span className="text-[10px] text-[#C9C7BA]">
                    {user.woaPlayerId || "NO WOA ID"}
                  </span>
                </div>
                {/* Reputation Badge */}
                <div className="ml-1 px-2 py-0.5 rounded-full bg-[#A8C229] text-[#141A1F] font-bold text-[10px]">
                  {user.reputationScore}%
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#C9C7BA]" />
              </button>

              {/* Profile Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] shadow-xl py-2 z-50 text-[#141A1F] animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-[#C9C7BA]/50">
                    <p className="text-[11px] font-mono text-[#5E6366]">SIGNED IN AS</p>
                    <p className="text-xs font-bold font-mono text-[#141A1F] truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigate("profile", user.id);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[#F0EBDE] flex items-center gap-2 transition cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#1240C7]" />
                    Pilot Reputation Dossier
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigate("dashboard");
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[#F0EBDE] flex items-center gap-2 transition cursor-pointer"
                  >
                    <Plane className="w-4 h-4 text-[#F25E24]" />
                    Active Flight Deck
                  </button>
                  <div className="my-1 border-t border-[#C9C7BA]/50" />
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#F25E24] hover:bg-[#F25E24]/10 flex items-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-[#F25E24]" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => openAuthModal("login")}
                className="text-xs font-mono font-bold uppercase tracking-wider text-[#141A1F] hover:text-[#1240C7] transition cursor-pointer px-2 py-1"
              >
                SIGN IN
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className="h-11 px-5 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] active:scale-95 transition cursor-pointer shadow-md shadow-[#1240C7]/20 flex items-center gap-1.5"
              >
                <span>OPEN A ROOM / POST</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
