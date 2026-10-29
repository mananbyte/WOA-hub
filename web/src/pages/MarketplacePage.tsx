import { useState, useEffect } from "react";
import { FilterBar } from "../components/FilterBar";
import { ContractCard } from "../components/ContractCard";
import { AirportCrest } from "../components/AirportCrest";
import { api, type Listing, type FilterParams } from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  Plane, Plus, AlertCircle, ArrowUpRight,
  BarChart3, Users, Clock, Zap,
} from "lucide-react";
import { WOA_AIRPORTS } from "../data/airports";

interface MarketplacePageProps {
  onNavigate: (tab: "marketplace" | "new-contract" | "dashboard" | "profile", param?: string) => void;
}

/** Animated number counter */
function StatNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <span className="text-2xl font-black font-mono text-[#141A1F] tabular-nums">
      {value}
      {suffix}
    </span>
  );
}

export const MarketplacePage = ({ onNavigate }: MarketplacePageProps) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filters, setFilters] = useState<FilterParams>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listings.list(filters);
      setListings(res.listings);
    } catch (err: any) {
      setError(err?.message || "Failed to load contract marketplace listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const handleClaim = async (id: string) => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    setClaimingId(id);
    try {
      await api.listings.claim(id);
      onNavigate("dashboard", id);
    } catch (err: any) {
      alert(err?.message || "Failed to claim contract connection.");
    } finally {
      setClaimingId(null);
      fetchListings();
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">

      {/* ── Hero Section ── */}
      <section className="space-y-6">
        {/* Top copy block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#F25E24]" style={{ animation: "pulse 2s infinite" }} />
              <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#F25E24]">
                THE SHARED MARKETPLACE
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-[#141A1F] leading-[1.02]">
              AIRPORT FLEET<br />EXCHANGE
            </h1>

            <p className="text-base text-[#5E6366] max-w-lg leading-relaxed">
              Coordinated flight contract dispatching for World of Airports players.
              Post your outgoing aircraft or claim incoming turnarounds across all{" "}
              <strong className="text-[#141A1F]">18 playable WoA hubs</strong>{" "}
              — no game API bottlenecks.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (!isAuthenticated) openAuthModal("login");
                  else onNavigate("new-contract");
                }}
                className="h-12 px-7 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] active:scale-95 transition cursor-pointer shadow-md shadow-[#1240C7]/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>POST FLIGHT CONTRACT</span>
              </button>

              <button
                onClick={() => document.getElementById("exchange-board")?.scrollIntoView({ behavior: "smooth" })}
                className="h-12 px-6 rounded-full bg-[#FFFFFA] text-[#141A1F] border border-[#C9C7BA] text-xs font-mono font-bold tracking-wider hover:bg-[#F0EBDE] transition cursor-pointer flex items-center gap-2"
              >
                <span>EXPLORE ACTIVE HUBS</span>
                <ArrowUpRight className="w-4 h-4 text-[#5E6366]" />
              </button>
            </div>
          </div>

          {/* Quick stat pills */}
          <div className="lg:col-span-5 flex flex-wrap gap-2 justify-start lg:justify-end items-end">
            <div className="flex items-center gap-2 bg-[#FFFFFA] border border-[#C9C7BA] rounded-full px-4 py-2 shadow-xs">
              <Zap className="w-3.5 h-3.5 text-[#A8C229]" />
              <span className="text-[11px] font-mono font-bold text-[#141A1F]">~12 MIN AVG CLAIM</span>
            </div>
            <div className="flex items-center gap-2 bg-[#FFFFFA] border border-[#C9C7BA] rounded-full px-4 py-2 shadow-xs">
              <Users className="w-3.5 h-3.5 text-[#1240C7]" />
              <span className="text-[11px] font-mono font-bold text-[#141A1F]">18 WOA HUBS</span>
            </div>
            <div className="flex items-center gap-2 bg-[#A8C229] border border-[#8FA81F] rounded-full px-4 py-2 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#141A1F]" style={{ animation: "pulse 2s infinite" }} />
              <span className="text-[11px] font-mono font-bold text-[#141A1F]">LIVE DISPATCH</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hub Crest Strip ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#5E6366]">
            18 OFFICIAL WOA HUBS
          </h3>
          <div className="flex-1 h-px bg-[#C9C7BA]" />
        </div>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto sm:flex-wrap pb-2 sm:pb-0">
          {WOA_AIRPORTS.map((ap) => (
            <button
              key={ap.code}
              onClick={() => setFilters((f) => ({ ...f, airport: f.airport === ap.code ? undefined : ap.code }))}
              title={`${ap.code} — ${ap.name}`}
              className={`group flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono font-bold transition cursor-pointer shrink-0 ${
                filters.airport === ap.code
                  ? "bg-[#1240C7] border-[#0E339E] text-white shadow-md"
                  : "bg-[#FFFFFA] border-[#C9C7BA] text-[#141A1F] hover:border-[#1240C7]/40 hover:bg-[#F0EBDE]"
              }`}
            >
              <AirportCrest code={ap.code} size={24} />
              <span>{ap.code}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Hairline Divider ── */}
      <div className="border-t border-[#C9C7BA]" />

      {/* ── Exchange Board ── */}
      <section id="exchange-board" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold font-mono text-[#141A1F] tracking-tight">
              LIVE FLIGHT EXCHANGE BOARD
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#141A1F] text-white text-xs font-mono font-bold">
              {listings.length} LISTED
            </span>
          </div>
          <span className="text-xs font-mono text-[#5E6366] hidden sm:block">
            REAL-TIME DISPATCH MARKETPLACE
          </span>
        </div>

        <FilterBar filters={filters} onChange={(f) => setFilters(f)} onRefresh={fetchListings} isLoading={loading} />

        {error && (
          <div className="p-4 rounded-2xl bg-[#F25E24]/10 border border-[#F25E24]/30 text-[#F25E24] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#F0EBDE] border border-[#C9C7BA] flex items-center justify-center mx-auto text-[#5E6366] mb-4">
              <Plane className="w-6 h-6 -rotate-45" />
            </div>
            <h3 className="text-base font-bold font-mono text-[#141A1F]">NO FLIGHTS MATCH CURRENT CRITERIA</h3>
            <p className="text-xs text-[#5E6366] mt-2 mb-6">
              Be the first pilot to open a contract route for this airport or class.
            </p>
            <button
              onClick={() => { if (!isAuthenticated) openAuthModal("login"); else onNavigate("new-contract"); }}
              className="h-10 px-5 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] cursor-pointer"
            >
              POST NEW CONTRACT
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((item) => (
              <ContractCard
                key={item.id}
                listing={item}
                onSelect={(id) => onNavigate("dashboard", id)}
                onClaim={handleClaim}
                isClaiming={claimingId === item.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Bottom Stat Tiles ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <div className="bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E0E8FA] border border-[#1240C7]/20 flex items-center justify-center text-[#1240C7]">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase text-[#5E6366] font-bold">ACTIVE CONNECTIONS</p>
            <StatNumber value={listings.length} suffix=" FLIGHTS" />
          </div>
        </div>

        <div className="bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EBDE] border border-[#C9C7BA] flex items-center justify-center text-[#F25E24]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase text-[#5E6366] font-bold">AVG CLAIM VELOCITY</p>
            <StatNumber value={12} suffix=" MIN" />
          </div>
        </div>

        <div className="bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] border border-[#A8C229]/30 flex items-center justify-center text-[#A8C229]">
            <Users className="w-6 h-6 text-[#141A1F]" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase text-[#5E6366] font-bold">OFFICIAL WOA HUBS</p>
            <StatNumber value={WOA_AIRPORTS.length} suffix=" ONLINE" />
          </div>
        </div>
      </section>
    </div>
  );
};
