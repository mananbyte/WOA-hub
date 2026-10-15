import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api, type Listing } from "../api/client";
import { Plane, Plus, ArrowRight } from "lucide-react";

interface DashboardPageProps {
  onNavigate: (tab: "marketplace" | "new-contract" | "dashboard" | "profile", param?: string) => void;
}

export const DashboardPage = ({ onNavigate }: DashboardPageProps) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<"outgoing" | "incoming">("outgoing");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        // Fetch all listings (open + active) to filter for user's flights
        const res = await api.listings.list({});
        setListings(res.listings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-8 shadow-xs">
        <Plane className="w-12 h-12 text-[#1240C7] mx-auto mb-4 -rotate-45" />
        <h2 className="text-2xl font-bold font-mono text-[#141A1F]">PILOT ACCESS ONLY</h2>
        <p className="text-sm text-[#5E6366] mt-2 mb-6">
          Sign in to view your personal flight deck and active aircraft dispatch desks.
        </p>
        <button
          onClick={() => openAuthModal("login")}
          className="h-11 px-6 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] cursor-pointer"
        >
          SIGN IN / REGISTER
        </button>
      </div>
    );
  }

  // Filter user's outgoing listings vs incoming
  const userListings = listings.filter((l) => l.creator.id === user.id);
  const outgoingFlights = userListings.filter((l) => l.contractType === "outgoing");
  const incomingFlights = userListings.filter((l) => l.contractType === "incoming");

  const displayedListings = activeTab === "outgoing" ? outgoingFlights : incomingFlights;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Pilot Deck Banner */}
      <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#1240C7]">
              PILOT OPERATIONS DECK
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-mono tracking-tight text-[#141A1F] mt-1">
            COMMAND CENTER: {user.discordUsername.toUpperCase()}
          </h1>
          <p className="text-sm text-[#5E6366] mt-0.5 font-mono">
            WOA ID: {user.woaPlayerId || "UNLINKED"} • REPUTATION SCORE: {user.reputationScore}%
          </p>
        </div>

        <button
          onClick={() => onNavigate("new-contract")}
          className="h-11 px-6 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] transition cursor-pointer flex items-center gap-2 self-start md:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>NEW FLIGHT CONTRACT</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] p-5 shadow-xs">
          <p className="text-xs font-mono font-bold text-[#5E6366] uppercase">
            MY ACTIVE FLIGHTS
          </p>
          <p className="text-3xl font-black font-mono text-[#141A1F] mt-1">
            {userListings.length}
          </p>
        </div>

        <div className="bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] p-5 shadow-xs">
          <p className="text-xs font-mono font-bold text-[#5E6366] uppercase">
            COMPLETED CONTRACTS
          </p>
          <p className="text-3xl font-black font-mono text-[#A8C229] mt-1">
            {user.totalCompletedContracts}
          </p>
        </div>

        <div className="bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] p-5 shadow-xs">
          <p className="text-xs font-mono font-bold text-[#5E6366] uppercase">
            REPUTATION RATING
          </p>
          <p className="text-3xl font-black font-mono text-[#1240C7] mt-1">
            {user.reputationScore}%
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-[#FFFFFA] p-1.5 rounded-full border border-[#C9C7BA] max-w-md shadow-2xs">
        <button
          onClick={() => setActiveTab("outgoing")}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-full transition cursor-pointer ${
            activeTab === "outgoing"
              ? "bg-[#141A1F] text-white shadow-xs"
              : "text-[#5E6366] hover:text-[#141A1F]"
          }`}
        >
          MY OUTGOING FLIGHTS ({outgoingFlights.length})
        </button>
        <button
          onClick={() => setActiveTab("incoming")}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-full transition cursor-pointer ${
            activeTab === "incoming"
              ? "bg-[#141A1F] text-white shadow-xs"
              : "text-[#5E6366] hover:text-[#141A1F]"
          }`}
        >
          INCOMING TURNAROUNDS ({incomingFlights.length})
        </button>
      </div>

      {/* Flight Operations Table / Cards */}
      <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-6 shadow-xs">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-3 border-[#1240C7] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-mono text-[#5E6366]">SYNCING FLIGHT DECK...</p>
          </div>
        ) : displayedListings.length === 0 ? (
          <div className="py-12 text-center max-w-sm mx-auto">
            <Plane className="w-10 h-10 text-[#C9C7BA] mx-auto mb-3 -rotate-45" />
            <h3 className="text-sm font-bold font-mono text-[#141A1F]">
              NO ACTIVE {activeTab.toUpperCase()} CONTRACTS
            </h3>
            <p className="text-xs text-[#5E6366] mt-1 mb-4">
              Open a new flight connection to begin scheduling aircraft with community partners.
            </p>
            <button
              onClick={() => onNavigate("new-contract")}
              className="h-9 px-5 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] cursor-pointer"
            >
              POST CONTRACT
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#C9C7BA]/50">
            {displayedListings.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F0EBDE]/30 -mx-4 px-4 rounded-xl transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F0EBDE] border border-[#C9C7BA] flex items-center justify-center text-[#1240C7] font-mono font-bold text-sm">
                    {item.aircraftClass}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black font-mono text-[#141A1F]">
                        {item.originAirport} ➔ {item.destinationAirport}
                      </span>
                      {item.isCargo && (
                        <span className="px-2 py-0.5 rounded-full bg-[#141A1F] text-white text-[10px] font-mono font-bold">
                          CARGO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5E6366] font-mono mt-0.5">
                      STATUS: <span className="font-bold text-[#141A1F] uppercase">{item.status}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onNavigate("dashboard", item.id)}
                    className="h-9 px-5 rounded-full bg-[#141A1F] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#252E36] transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>ENTER OPS ROOM</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
