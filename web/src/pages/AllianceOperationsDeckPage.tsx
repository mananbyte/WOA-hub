import { useState, useEffect } from "react";
import {
  api,
  type Alliance,
  type AllianceRole,
  type MembershipStatus,
  type RouteMatrixData,
  type Listing,
  type AircraftClass,
  type AirportModel,
  type JoinPolicy,
} from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  Shield,
  Plane,
  ArrowLeft,
  Compass,
  CheckCircle2,
  AlertCircle,
  Plus,
  Settings,
  Star,
} from "lucide-react";

interface AllianceOperationsDeckPageProps {
  slug: string;
  onNavigate: (
    tab: "marketplace" | "new-contract" | "dashboard" | "profile" | "alliances",
    param?: string
  ) => void;
}

export const AllianceOperationsDeckPage = ({
  slug,
  onNavigate,
}: AllianceOperationsDeckPageProps) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<"flights" | "matrix" | "roster" | "settings">("flights");

  const [alliance, setAlliance] = useState<Alliance | null>(null);
  const [userMembership, setUserMembership] = useState<{
    role: AllianceRole;
    status: MembershipStatus;
  } | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [matrixData, setMatrixData] = useState<RouteMatrixData | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New contract modal inside deck
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [contractType, setContractType] = useState<"outgoing" | "incoming">("outgoing");
  const [originAirport, setOriginAirport] = useState("PRG");
  const [destinationAirport, setDestinationAirport] = useState("IAD");
  const [aircraftClass, setAircraftClass] = useState<AircraftClass>("C");
  const [isCargo, setIsCargo] = useState(false);
  const [delayHours, setDelayHours] = useState(12);
  const [notes, setNotes] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // Settings form state
  const [settingsName, setSettingsName] = useState("");
  const [settingsDesc, setSettingsDesc] = useState("");
  const [settingsDiscord, setSettingsDiscord] = useState("");
  const [settingsModel, setSettingsModel] = useState<AirportModel>("flexible");
  const [settingsPolicy, setSettingsPolicy] = useState<JoinPolicy>("approval");
  const [settingsDelay, setSettingsDelay] = useState(24);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

  const fetchDeckData = async () => {
    setLoading(true);
    setError(null);
    try {
      const detailRes = await api.alliances.get(slug);
      setAlliance(detailRes.alliance);
      setUserMembership(detailRes.userMembership);

      // Populate settings form defaults
      setSettingsName(detailRes.alliance.name);
      setSettingsDesc(detailRes.alliance.description || "");
      setSettingsDiscord(detailRes.alliance.discordUrl || "");
      setSettingsModel(detailRes.alliance.airportModel);
      setSettingsPolicy(detailRes.alliance.joinPolicy);
      setSettingsDelay(detailRes.alliance.maxEscalationDelayHours);

      // Concurrently fetch matrix, listings, and roster
      const [matrixRes, listingsRes, membersRes] = await Promise.all([
        api.alliances.getMatrix(slug).catch(() => null),
        api.listings.list({ alliance_id: detailRes.alliance.id }).catch(() => ({ listings: [] })),
        api.alliances.getMembers(slug).catch(() => ({ members: [] })),
      ]);

      if (matrixRes) setMatrixData(matrixRes);
      if (listingsRes) setListings(listingsRes.listings);
      if (membersRes) setMembers(membersRes.members);
    } catch (err: any) {
      setError(err?.message || "Failed to load operations command deck");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeckData();
  }, [slug]);

  const handlePostContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alliance) return;

    setPostError(null);
    setPosting(true);
    try {
      await api.listings.create({
        contract_type: contractType,
        origin_airport: originAirport.toUpperCase(),
        destination_airport: destinationAirport.toUpperCase(),
        aircraft_class: aircraftClass,
        is_cargo: isCargo,
        expires_in_hours: 24,
        alliance_id: alliance.id,
        visibility: "alliance_only",
        auto_escalate_delay_hours: delayHours,
        notes: notes.trim() || undefined,
      });
      setPostModalOpen(false);
      setNotes("");
      fetchDeckData();
    } catch (err: any) {
      setPostError(err?.message || "Failed to post contract to internal deck");
    } finally {
      setPosting(false);
    }
  };

  const handleAssignAirport = async (airportCode: string) => {
    try {
      await api.alliances.assignAirport(slug, airportCode);
      fetchDeckData();
    } catch (err: any) {
      alert(err?.message || "Failed to assign airport");
    }
  };

  const handleRemoveAirport = async (airportCode: string) => {
    try {
      await api.alliances.removeAirport(slug, airportCode);
      fetchDeckData();
    } catch (err: any) {
      alert(err?.message || "Failed to remove airport");
    }
  };

  const handleReviewMember = async (
    targetUserId: string,
    status: "active" | "rejected",
    role?: AllianceRole
  ) => {
    try {
      await api.alliances.reviewMember(slug, targetUserId, status, role);
      fetchDeckData();
    } catch (err: any) {
      alert(err?.message || "Failed to update member status");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage(null);
    try {
      await api.alliances.update(slug, {
        name: settingsName,
        description: settingsDesc.trim() || undefined,
        discord_url: settingsDiscord.trim() || undefined,
        airport_model: settingsModel,
        join_policy: settingsPolicy,
        max_escalation_delay_hours: settingsDelay,
      });
      setSettingsMessage("Group settings updated successfully!");
      fetchDeckData();
    } catch (err: any) {
      alert(err?.message || "Failed to update group settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleClaimFlight = async (listingId: string) => {
    if (!isAuthenticated) return openAuthModal("login");
    try {
      await api.listings.claim(listingId);
      fetchDeckData();
    } catch (err: any) {
      alert(err?.message || "Failed to claim flight");
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-[#1240C7] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-sm uppercase tracking-wider text-[#5E6366]">
          INITIALIZING OPERATIONS COMMAND DECK...
        </p>
      </div>
    );
  }

  if (error || !alliance) {
    return (
      <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-12 text-center max-w-xl mx-auto shadow-xs">
        <AlertCircle className="w-12 h-12 text-[#F25E24] mx-auto mb-4" />
        <h2 className="text-xl font-mono font-bold text-[#141A1F] mb-2">
          Unable to Access Operations Deck
        </h2>
        <p className="text-sm text-[#5E6366] mb-6">
          {error || "Alliance deck unavailable."}
        </p>
        <button
          onClick={() => onNavigate("alliances", slug)}
          className="h-10 px-5 rounded-full bg-[#141A1F] text-white text-xs font-mono font-bold hover:bg-[#252E36] transition cursor-pointer"
        >
          VIEW PUBLIC LOUNGE
        </button>
      </div>
    );
  }

  const isMemberOrGuest =
    userMembership && userMembership.status === "active";
  const isAdminOrOwner =
    isMemberOrGuest && (userMembership.role === "owner" || userMembership.role === "admin");

  if (!isMemberOrGuest) {
    return (
      <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
        <Shield className="w-12 h-12 text-[#1240C7] mx-auto" />
        <h2 className="text-xl font-mono font-extrabold text-[#141A1F]">
          RESTRICTED OPERATIONS DECK
        </h2>
        <p className="text-xs text-[#5E6366] leading-relaxed">
          The internal flight deck, assigned airport dispatch matrix, and pilot roster of <b>{alliance.name}</b> are restricted to active members and registered turnaround guest hosts.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => onNavigate("alliances", slug)}
            className="h-10 px-5 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold hover:bg-[#0E339E] transition cursor-pointer"
          >
            VIEW ALLIANCE LOUNGE & APPLY
          </button>
        </div>
      </div>
    );
  }

  // Find user's currently assigned airports
  const currentMemberRecord = members.find((m) => m.id === user?.id);
  const myAssignedAirports: string[] = currentMemberRecord?.assignedAirports || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("alliances", slug)}
            className="h-9 px-3.5 rounded-full bg-[#FFFFFA] border border-[#C9C7BA] text-xs font-mono font-bold text-[#5E6366] hover:text-[#141A1F] hover:bg-[#F0EBDE] transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>LOUNGE</span>
          </button>
          <span className="text-xs font-mono text-[#5E6366]">/</span>
          <span className="text-xs font-mono font-bold text-[#141A1F] uppercase">
            {alliance.name} OPERATIONS DECK
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#1240C7]/10 text-[#1240C7]">
            YOUR ROLE: {userMembership.role.toUpperCase()}
          </span>
          {myAssignedAirports.length > 0 && (
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#A8C229]/20 text-[#2D5A06]">
              MY BASES: {myAssignedAirports.join(", ")}
            </span>
          )}
        </div>
      </div>

      {/* Operations Deck Header */}
      <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#1240C7]">
            CONSORTIUM COMMAND DECK
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-[#141A1F] mt-1">
            {alliance.name}
          </h1>
          <p className="text-xs font-mono text-[#5E6366] tracking-wider uppercase mt-1">
            MODEL: {alliance.airportModel.toUpperCase()} • ESCALATION: {alliance.maxEscalationDelayHours}H DELAY
          </p>
        </div>

        <button
          onClick={() => setPostModalOpen(true)}
          className="h-12 px-6 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] active:scale-95 transition cursor-pointer flex items-center gap-2 self-start md:self-auto shadow-md shadow-[#1240C7]/20"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>DISPATCH ALLIANCE CONTRACT</span>
        </button>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 bg-[#FFFFFA] p-1.5 rounded-full border border-[#C9C7BA] shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab("flights")}
          className={`px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider transition cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === "flights"
              ? "bg-[#141A1F] text-white shadow-xs"
              : "text-[#5E6366] hover:text-[#141A1F] hover:bg-[#F0EBDE]"
          }`}
        >
          <Plane className="w-3.5 h-3.5" />
          <span>INTERNAL FLIGHT DECK ({listings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("matrix")}
          className={`px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider transition cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === "matrix"
              ? "bg-[#141A1F] text-white shadow-xs"
              : "text-[#5E6366] hover:text-[#141A1F] hover:bg-[#F0EBDE]"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>AIRPORT ROUTE MATRIX</span>
        </button>

        <button
          onClick={() => setActiveTab("roster")}
          className={`px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider transition cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === "roster"
              ? "bg-[#141A1F] text-white shadow-xs"
              : "text-[#5E6366] hover:text-[#141A1F] hover:bg-[#F0EBDE]"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>PILOT ROSTER ({members.length})</span>
        </button>

        {isAdminOrOwner && (
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider transition cursor-pointer shrink-0 flex items-center gap-2 ${
              activeTab === "settings"
                ? "bg-[#141A1F] text-white shadow-xs"
                : "text-[#5E6366] hover:text-[#141A1F] hover:bg-[#F0EBDE]"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>GROUP SETTINGS</span>
          </button>
        )}
      </div>

      {/* TAB 1: INTERNAL FLIGHT DECK */}
      {activeTab === "flights" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-mono font-extrabold text-[#141A1F]">
              INTERNAL ALLIANCE CONTRACTS
            </h2>
            <span className="text-xs font-mono text-[#5E6366]">
              Showing private listings awaiting member or guest turnaround
            </span>
          </div>

          {listings.length === 0 ? (
            <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-12 text-center shadow-xs">
              <Plane className="w-12 h-12 text-[#C9C7BA] mx-auto mb-3" />
              <h3 className="font-mono font-bold text-lg text-[#141A1F] mb-1">
                No Active Internal Contracts
              </h3>
              <p className="text-xs text-[#5E6366] max-w-md mx-auto mb-6">
                All scheduled alliance flights are currently claimed or dispatched. Use the button above to dispatch a new flight for member turnarounds.
              </p>
              <button
                onClick={() => setPostModalOpen(true)}
                className="h-10 px-5 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold hover:bg-[#0E339E] transition cursor-pointer"
              >
                DISPATCH FIRST FLIGHT
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map((item) => {
                const isCreator = user?.id === item.creator.id;
                return (
                  <div
                    key={item.id}
                    className={`bg-[#FFFFFA] rounded-2xl border p-5 shadow-2xs space-y-4 transition ${
                      item.partnerPriority
                        ? "border-[#1240C7] ring-2 ring-[#1240C7]/15"
                        : "border-[#C9C7BA]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            item.contractType === "outgoing"
                              ? "bg-[#1240C7]/10 text-[#1240C7]"
                              : "bg-[#A8C229]/20 text-[#2D5A06]"
                          }`}
                        >
                          {item.contractType.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#F0EBDE] text-[#5E6366] font-bold">
                          CLASS {item.aircraftClass} {item.isCargo ? "• CARGO" : "• PAX"}
                        </span>
                        {item.partnerPriority && (
                          <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#1240C7] text-white flex items-center gap-1 shadow-2xs">
                            <Star className="w-3 h-3 fill-white" />
                            PARTNER PRIORITY HUB
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          item.status === "open"
                            ? "bg-[#A8C229]/20 text-[#2D5A06]"
                            : "bg-[#F0EBDE] text-[#5E6366]"
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Flight Path */}
                    <div className="flex items-center gap-4 py-1">
                      <div className="flex flex-col">
                        <span className="text-2xl font-mono font-black text-[#141A1F]">
                          {item.originAirport}
                        </span>
                        <span className="text-[10px] font-mono text-[#5E6366] uppercase">
                          DEPARTURE
                        </span>
                      </div>
                      <div className="flex-1 flex items-center gap-2 px-2">
                        <div className="h-0.5 flex-1 bg-[#C9C7BA]" />
                        <Plane className="w-4 h-4 text-[#1240C7] shrink-0" />
                        <div className="h-0.5 flex-1 bg-[#C9C7BA]" />
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-2xl font-mono font-black text-[#141A1F]">
                          {item.destinationAirport}
                        </span>
                        <span className="text-[10px] font-mono text-[#5E6366] uppercase">
                          DESTINATION
                        </span>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-[#5E6366] italic bg-[#F0EBDE]/40 p-2.5 rounded-xl border border-[#C9C7BA]/50">
                        "{item.notes}"
                      </p>
                    )}

                    {/* Pilot & Action Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#C9C7BA]/50 text-xs font-mono">
                      <div className="flex items-center gap-1.5 text-[#5E6366]">
                        <span>PILOT:</span>
                        <span className="font-bold text-[#141A1F]">
                          {item.creator.discordUsername}
                        </span>
                      </div>

                      {item.status === "open" && !isCreator && (
                        <button
                          onClick={() => handleClaimFlight(item.id)}
                          className="h-8 px-4 rounded-full bg-[#1240C7] text-white text-[11px] font-mono font-bold hover:bg-[#0E339E] cursor-pointer shadow-2xs"
                        >
                          CLAIM TURNAROUND
                        </button>
                      )}

                      {isCreator && (
                        <span className="text-[11px] text-[#5E6366] font-bold">
                          YOUR LISTING
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AIRPORT ROUTE MATRIX */}
      {activeTab === "matrix" && matrixData && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-mono font-extrabold text-[#141A1F]">
                10-HUB AIRPORT ROUTE MATRIX
              </h2>
              <p className="text-xs text-[#5E6366] mt-0.5">
                Staff official World of Airports bases to ensure incoming flights receive guaranteed partner turnarounds. Each pilot can operate up to 3 hubs.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[#FFFFFA] px-4 py-2 rounded-full border border-[#C9C7BA] text-xs font-mono shadow-2xs">
              <span className="font-bold text-[#141A1F]">
                {matrixData.totalCoveredHubs} / {matrixData.totalOfficialHubs} COVERED
              </span>
              <span>•</span>
              <span className="text-[#F25E24] font-bold">
                {matrixData.uncoveredGaps.length} GAPS
              </span>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {matrixData.matrix.map((hub) => {
              const isAssignedToMe = myAssignedAirports.includes(hub.code);
              const isCovered = hub.pilots.length > 0;

              return (
                <div
                  key={hub.code}
                  className={`bg-[#FFFFFA] rounded-2xl border p-5 flex flex-col justify-between space-y-4 shadow-2xs transition ${
                    isAssignedToMe
                      ? "border-[#1240C7] ring-2 ring-[#1240C7]/20"
                      : isCovered
                      ? "border-[#A8C229]"
                      : "border-dashed border-[#C9C7BA]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-2xl text-[#141A1F]">
                        {hub.code}
                      </span>
                      {isCovered ? (
                        <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#A8C229]/20 text-[#2D5A06]">
                          COVERED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#F25E24]/10 text-[#D3410B]">
                          GAP
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-[#141A1F] truncate mt-1">{hub.name}</p>
                    <p className="text-[10px] font-mono text-[#5E6366] uppercase">{hub.region}</p>
                  </div>

                  {/* Assigned Pilots */}
                  <div className="space-y-1.5 py-1">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#5E6366]">
                      ASSIGNED PILOTS ({hub.pilots.length}):
                    </p>
                    {hub.pilots.length === 0 ? (
                      <p className="text-xs text-[#F25E24] italic">No active pilots stationed</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {hub.pilots.map((p) => (
                          <span
                            key={p.id}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                              p.id === user?.id
                                ? "bg-[#1240C7] text-white"
                                : "bg-[#F0EBDE] text-[#141A1F]"
                            }`}
                          >
                            {p.discordUsername}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Self-assignment button */}
                  <div>
                    {isAssignedToMe ? (
                      <button
                        onClick={() => handleRemoveAirport(hub.code)}
                        className="w-full h-8 rounded-full bg-[#F25E24]/10 text-[#D3410B] hover:bg-[#F25E24]/20 text-[10px] font-mono font-bold transition cursor-pointer"
                      >
                        UNASSIGN MY HUB
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAssignAirport(hub.code)}
                        disabled={myAssignedAirports.length >= 3}
                        className={`w-full h-8 rounded-full text-[10px] font-mono font-bold transition cursor-pointer ${
                          myAssignedAirports.length >= 3
                            ? "bg-[#F0EBDE] text-[#5E6366] cursor-not-allowed"
                            : "bg-[#141A1F] text-white hover:bg-[#252E36]"
                        }`}
                      >
                        {myAssignedAirports.length >= 3 ? "MAX 3 HUBS REACHED" : "+ ASSIGN TO MY HUBS"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PILOT ROSTER */}
      {activeTab === "roster" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-mono font-extrabold text-[#141A1F]">
              PILOT ROSTER & GATE STATIONS
            </h2>
            <span className="text-xs font-mono text-[#5E6366]">
              {members.length} registered pilots
            </span>
          </div>

          <div className="bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#F0EBDE] border-b border-[#C9C7BA] text-[#5E6366] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Pilot</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Assigned Hubs</th>
                    <th className="py-3 px-4">Reputation</th>
                    <th className="py-3 px-4">Status</th>
                    {isAdminOrOwner && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C9C7BA]/50">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F0EBDE]/30 transition">
                      <td className="py-3.5 px-4 font-bold text-[#141A1F]">
                        <div>{m.discordUsername}</div>
                        <div className="text-[10px] font-normal text-[#5E6366]">
                          {m.woaPlayerId || "NO WOA ID"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            m.role === "owner"
                              ? "bg-[#1240C7] text-white"
                              : m.role === "admin"
                              ? "bg-[#141A1F] text-white"
                              : m.role === "guest"
                              ? "bg-[#F0EBDE] text-[#5E6366]"
                              : "bg-[#1240C7]/10 text-[#1240C7]"
                          }`}
                        >
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {m.assignedAirports && m.assignedAirports.length > 0 ? (
                          <div className="flex gap-1">
                            {m.assignedAirports.map((ap: string) => (
                              <span
                                key={ap}
                                className="px-2 py-0.5 bg-[#F0EBDE] border border-[#C9C7BA] rounded font-bold text-[10px]"
                              >
                                {ap}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#5E6366] italic text-[10px]">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-[#A8C229]/20 text-[#2D5A06] font-bold">
                          {m.reputationScore}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            m.status === "active" ? "text-[#2D5A06]" : "text-[#D3410B]"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      {isAdminOrOwner && (
                        <td className="py-3.5 px-4 text-right">
                          {m.status === "pending" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleReviewMember(m.id, "active")}
                                className="h-7 px-2.5 rounded-full bg-[#2D5A06] text-white text-[10px] font-bold hover:bg-[#234505] cursor-pointer"
                              >
                                APPROVE
                              </button>
                              <button
                                onClick={() => handleReviewMember(m.id, "rejected")}
                                className="h-7 px-2.5 rounded-full bg-[#F25E24] text-white text-[10px] font-bold hover:bg-[#D3410B] cursor-pointer"
                              >
                                REJECT
                              </button>
                            </div>
                          ) : m.role !== "owner" && user?.id !== m.id ? (
                            <button
                              onClick={() =>
                                handleReviewMember(
                                  m.id,
                                  "active",
                                  m.role === "admin" ? "member" : "admin"
                                )
                              }
                              className="text-[10px] text-[#1240C7] hover:underline cursor-pointer"
                            >
                              {m.role === "admin" ? "Demote to Member" : "Promote to Admin"}
                            </button>
                          ) : null}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GROUP SETTINGS (ADMIN / OWNER) */}
      {activeTab === "settings" && isAdminOrOwner && (
        <div className="max-w-2xl bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-mono font-extrabold text-[#141A1F]">
              ALLIANCE GROUP SETTINGS
            </h2>
            <p className="text-xs text-[#5E6366] mt-0.5">
              Update consortium policies, operating models, and escalation timeouts.
            </p>
          </div>

          {settingsMessage && (
            <div className="p-3 bg-[#A8C229]/20 border border-[#A8C229]/40 rounded-xl text-xs font-mono text-[#2D5A06] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{settingsMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block font-bold text-[#141A1F] uppercase mb-1">
                ALLIANCE NAME
              </label>
              <input
                type="text"
                required
                value={settingsName}
                onChange={(e) => setSettingsName(e.target.value)}
                className="w-full bg-[#FFFFFA] border border-[#C9C7BA] rounded-xl px-3 py-2 text-xs font-mono text-[#141A1F] focus:border-[#1240C7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#141A1F] uppercase mb-1">
                DESCRIPTION & CHARTER
              </label>
              <textarea
                value={settingsDesc}
                onChange={(e) => setSettingsDesc(e.target.value)}
                rows={3}
                className="w-full bg-[#FFFFFA] border border-[#C9C7BA] rounded-xl p-3 text-xs font-mono text-[#141A1F] focus:border-[#1240C7] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#141A1F] uppercase mb-1">
                  OPERATING MODEL
                </label>
                <select
                  value={settingsModel}
                  onChange={(e) => setSettingsModel(e.target.value as AirportModel)}
                  className="w-full bg-[#FFFFFA] border border-[#C9C7BA] rounded-xl px-3 py-2 text-xs font-mono text-[#141A1F] focus:border-[#1240C7] focus:outline-none"
                >
                  <option value="assigned">Assigned Hubs (Fixed Bases)</option>
                  <option value="flexible">Flexible Routes (Open Turnarounds)</option>
                  <option value="hybrid">Hybrid Consortium</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#141A1F] uppercase mb-1">
                  JOIN POLICY
                </label>
                <select
                  value={settingsPolicy}
                  onChange={(e) => setSettingsPolicy(e.target.value as JoinPolicy)}
                  className="w-full bg-[#FFFFFA] border border-[#C9C7BA] rounded-xl px-3 py-2 text-xs font-mono text-[#141A1F] focus:border-[#1240C7] focus:outline-none"
                >
                  <option value="open">Open (Instant Join)</option>
                  <option value="approval">Approval Required</option>
                  <option value="invite_only">Invite Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#141A1F] uppercase mb-1">
                MAX ESCALATION DELAY: {settingsDelay} HOURS
              </label>
              <input
                type="range"
                min={2}
                max={48}
                step={1}
                value={settingsDelay}
                onChange={(e) => setSettingsDelay(Number(e.target.value))}
                className="w-full accent-[#1240C7] cursor-pointer"
              />
              <p className="text-[10px] text-[#5E6366] mt-1">
                Internal listings that remain unclaimed will automatically escalate to the public marketplace after this window.
              </p>
            </div>

            <div>
              <label className="block font-bold text-[#141A1F] uppercase mb-1">
                DISCORD SERVER INVITE URL
              </label>
              <input
                type="url"
                value={settingsDiscord}
                onChange={(e) => setSettingsDiscord(e.target.value)}
                placeholder="https://discord.gg/your-alliance"
                className="w-full bg-[#FFFFFA] border border-[#C9C7BA] rounded-xl px-3 py-2 text-xs font-mono text-[#141A1F] focus:border-[#1240C7] focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="h-10 px-6 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold hover:bg-[#0E339E] transition cursor-pointer flex items-center gap-2"
              >
                {savingSettings && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>SAVE SETTINGS</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dispatch Contract Modal */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#141A1F]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#C9C7BA]/50 pb-4">
              <div>
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#1240C7]">
                  INTERNAL ALLIANCE DISPATCH
                </span>
                <h3 className="text-xl font-mono font-extrabold text-[#141A1F]">
                  DISPATCH TO {alliance.name.toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setPostModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F0EBDE] hover:bg-[#C9C7BA] text-[#141A1F] flex items-center justify-center transition cursor-pointer font-mono font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostContract} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#141A1F] uppercase mb-1">
                    CONTRACT TYPE
                  </label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as any)}
                    className="w-full bg-[#FFFFFA] border border-[#C9C7BA] rounded-xl px-3 py-2 text-xs font-mono text-[#141A1F]"
                  >
                    <option value="outgoing">Outgoing (Sending Plane)</option>
                    <option value="incoming">Incoming (Seeking Plane)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#141A1F] uppercase mb-1">
                    AIRCRAFT CLASS
                  </label>
                  <select
                    value={aircraftClass}
                    onChange={(e) => setAircraftClass(e.target.value as AircraftClass)}
                    className="w-full bg-[#FFFFFA] border border-[#C9C7BA] rounded-xl px-3 py-2 text-xs font-mono text-[#141A1F]"
                  >
                    <option value="A">Class A (Light)</option>
                    <option value="B">Class B (Regional)</option>
                    <option value="C">Class C (Narrowbody)</option>
                    <option value="D">Class D (Mid-Size)</option>
                    <option value="E">Class E (Widebody)</option>
                    <option value="F">Class F (Super Heavy)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="alliance-cargo-check"
                  checked={isCargo}
                  onChange={(e) => setIsCargo(e.target.checked)}
                  className="rounded accent-[#1240C7]"
                />
                <label
                  htmlFor="alliance-cargo-check"
                  className="text-xs font-bold font-mono text-[#141A1F] uppercase cursor-pointer"
                >
                  CARGO FREIGHT AIRCRAFT
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#141A1F] uppercase mb-1">
                    ORIGIN AIRPORT
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={originAirport}
                    onChange={(e) => setOriginAirport(e.target.value.toUpperCase())}
                    className="w-full bg-[#FFFFFA] border border-[#C9C7BA] rounded-xl px-3 py-2 text-xs font-mono text-[#141A1F]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#141A1F] uppercase mb-1">
                    DESTINATION AIRPORT
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={destinationAirport}
                    onChange={(e) => setDestinationAirport(e.target.value.toUpperCase())}
                    className="w-full bg-[#FFFFFA] border border-[#C9C7BA] rounded-xl px-3 py-2 text-xs font-mono text-[#141A1F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#141A1F] uppercase mb-1">
                  AUTO-ESCALATION DELAY: {delayHours} HOURS
                </label>
                <input
                  type="range"
                  min={2}
                  max={alliance.maxEscalationDelayHours}
                  value={delayHours}
                  onChange={(e) => setDelayHours(Number(e.target.value))}
                  className="w-full accent-[#1240C7] cursor-pointer"
                />
                <p className="text-[10px] text-[#5E6366] mt-0.5">
                  Contract remains exclusive to {alliance.name} for {delayHours}h before escalating publicly.
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#141A1F] uppercase mb-1">
                  NOTES (OPTIONAL)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Gate specifications, turnaround turnaround request..."
                  rows={2}
                  className="w-full bg-[#FFFFFA] border border-[#C9C7BA] rounded-xl p-3 text-xs font-mono text-[#141A1F] focus:border-[#1240C7] focus:outline-none"
                />
              </div>

              {postError && (
                <div className="p-3 bg-[#F25E24]/10 border border-[#F25E24]/30 rounded-xl text-xs font-mono text-[#D3410B]">
                  {postError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPostModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#C9C7BA] text-xs font-mono font-bold text-[#5E6366] hover:bg-[#F0EBDE] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="px-6 py-2 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold hover:bg-[#0E339E] cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  {posting && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>DISPATCH FLIGHT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
