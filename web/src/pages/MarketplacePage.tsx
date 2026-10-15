import { useState, useEffect } from "react";
import { HeroRadarWidget } from "../components/HeroRadarWidget";
import { FilterBar } from "../components/FilterBar";
import { ContractCard } from "../components/ContractCard";
import { api, type Listing, type FilterParams } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Plane, Plus, AlertCircle, ArrowUpRight, BarChart3, Users, Clock } from "lucide-react";

interface MarketplacePageProps {
  onNavigate: (tab: "marketplace" | "new-contract" | "dashboard" | "profile", param?: string) => void;
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
      // Navigate to operations room
      onNavigate("dashboard", id);
    } catch (err: any) {
      alert(err?.message || "Failed to claim contract connection.");
    } finally {
      setClaimingId(null);
      fetchListings();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Editorial Hero Section matching SVG */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Hero Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#F25E24] animate-pulse" />
            <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#F25E24]">
              THE SHARED MARKETPLACE
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-[#141A1F] leading-[1.05]">
            AIRPORT FLEET EXCHANGE
          </h1>

          <p className="text-base text-[#5E6366] max-w-xl leading-relaxed">
            Coordinated flight contract dispatching for World of Airports players. Post your
            outgoing aircraft or claim incoming turnarounds across all 18 playable WoA hubs with zero game API
            bottlenecks.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal("login");
                } else {
                  onNavigate("new-contract");
                }
              }}
              className="h-12 px-7 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] active:scale-95 transition cursor-pointer shadow-md shadow-[#1240C7]/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>POST FLIGHT CONTRACT</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById("exchange-board");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="h-12 px-6 rounded-full bg-[#FFFFFA] text-[#141A1F] border border-[#C9C7BA] text-xs font-mono font-bold tracking-wider hover:bg-[#F0EBDE] transition cursor-pointer flex items-center gap-2"
            >
              <span>EXPLORE ACTIVE HUBS</span>
              <ArrowUpRight className="w-4 h-4 text-[#5E6366]" />
            </button>
          </div>
        </div>

        {/* Right Hero Column: Soft Ice-Blue Radar Widget */}
        <div className="lg:col-span-5">
          <HeroRadarWidget />
        </div>
      </section>

      {/* Hairline Divider */}
      <div className="border-t border-[#C9C7BA]" />

      {/* Filter and Discovery Board */}
      <section id="exchange-board" className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-mono text-[#141A1F] tracking-tight">
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

        {/* Seamless Pill Filter Bar */}
        <FilterBar
          filters={filters}
          onChange={(newFilters) => setFilters(newFilters)}
          onRefresh={fetchListings}
          isLoading={loading}
        />

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-[#F25E24]/10 border border-[#F25E24]/30 text-[#F25E24] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-56 bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] animate-pulse p-6"
              />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#F0EBDE] border border-[#C9C7BA] flex items-center justify-center mx-auto text-[#5E6366] mb-4">
              <Plane className="w-6 h-6 -rotate-45" />
            </div>
            <h3 className="text-base font-bold font-mono text-[#141A1F]">
              NO FLIGHTS MATCH CURRENT CRITERIA
            </h3>
            <p className="text-xs text-[#5E6366] mt-2 mb-6">
              Be the first pilot to open a contract route for this airport or class.
            </p>
            <button
              onClick={() => {
                if (!isAuthenticated) openAuthModal("login");
                else onNavigate("new-contract");
              }}
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

      {/* Bottom Summary Stat Tiles */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <div className="bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E0E8FA] border border-[#1240C7]/20 flex items-center justify-center text-[#1240C7]">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase text-[#5E6366] font-bold">
              ACTIVE CONNECTIONS
            </p>
            <p className="text-2xl font-black font-mono text-[#141A1F]">
              {listings.length} FLIGHTS
            </p>
          </div>
        </div>

        <div className="bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EBDE] border border-[#C9C7BA] flex items-center justify-center text-[#F25E24]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase text-[#5E6366] font-bold">
              AVG CLAIM VELOCITY
            </p>
            <p className="text-2xl font-black font-mono text-[#141A1F]">
              ~12 MINUTES
            </p>
          </div>
        </div>

        <div className="bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E0E8FA] border border-[#1240C7]/20 flex items-center justify-center text-[#A8C229]">
            <Users className="w-6 h-6 text-[#141A1F]" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase text-[#5E6366] font-bold">
              OFFICIAL WOA HUBS
            </p>
            <p className="text-2xl font-black font-mono text-[#141A1F]">
              10 ONLINE
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
