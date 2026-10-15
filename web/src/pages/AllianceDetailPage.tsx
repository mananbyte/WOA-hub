import { useState, useEffect } from "react";
import {
  api,
  type Alliance,
  type AllianceRole,
  type MembershipStatus,
  type RouteMatrixData,
} from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  Shield,
  Plane,
  ArrowLeft,
  ExternalLink,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle,
  UserCheck,
} from "lucide-react";

interface AllianceDetailPageProps {
  slug: string;
  onNavigate: (
    tab: "marketplace" | "new-contract" | "dashboard" | "profile" | "alliances",
    param?: string
  ) => void;
}

export const AllianceDetailPage = ({ slug, onNavigate }: AllianceDetailPageProps) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [alliance, setAlliance] = useState<Alliance | null>(null);
  const [activeMembersCount, setActiveMembersCount] = useState<number>(0);
  const [userMembership, setUserMembership] = useState<{
    role: AllianceRole;
    status: MembershipStatus;
  } | null>(null);
  const [matrixData, setMatrixData] = useState<RouteMatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applicationNote, setApplicationNote] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAllianceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [detailRes, matrixRes] = await Promise.all([
        api.alliances.get(slug),
        api.alliances.getMatrix(slug).catch(() => null),
      ]);
      setAlliance(detailRes.alliance);
      setActiveMembersCount(detailRes.activeMembersCount);
      setUserMembership(detailRes.userMembership);
      if (matrixRes) setMatrixData(matrixRes);
    } catch (err: any) {
      setError(err?.message || "Failed to load alliance lounge dossier");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllianceData();
  }, [slug]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return openAuthModal("login");

    setActionError(null);
    setSubmitting(true);
    try {
      const res = await api.alliances.join(
        slug,
        applicationNote.trim() || undefined,
        inviteCode.trim() || undefined
      );
      setApplyModalOpen(false);
      if (res.membership.status === "active") {
        setSuccessMessage("Welcome aboard! You have joined the alliance as an active member.");
      } else {
        setSuccessMessage("Your membership application has been submitted and is pending review.");
      }
      fetchAllianceData();
    } catch (err: any) {
      setActionError(
        err?.message || "Failed to submit membership application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterGuest = async () => {
    if (!isAuthenticated) return openAuthModal("login");

    setActionError(null);
    setSubmitting(true);
    try {
      await api.alliances.registerGuest(slug);
      setSuccessMessage("You are now registered as an Alliance Guest Host! You can handle turnarounds.");
      fetchAllianceData();
    } catch (err: any) {
      setActionError(err?.message || "Failed to register as guest host.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-[#1240C7] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-sm uppercase tracking-wider text-[#5E6366]">
          Loading Alliance Public Lounge...
        </p>
      </div>
    );
  }

  if (error || !alliance) {
    return (
      <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-12 text-center max-w-xl mx-auto shadow-xs">
        <AlertCircle className="w-12 h-12 text-[#F25E24] mx-auto mb-4" />
        <h2 className="text-xl font-mono font-bold text-[#141A1F] mb-2">
          Alliance Dossier Not Found
        </h2>
        <p className="text-sm text-[#5E6366] mb-6">
          {error || "The requested alliance could not be located."}
        </p>
        <button
          onClick={() => onNavigate("alliances")}
          className="h-10 px-5 rounded-full bg-[#141A1F] text-white text-xs font-mono font-bold hover:bg-[#252E36] transition cursor-pointer"
        >
          BACK TO ALLIANCES DIRECTORY
        </button>
      </div>
    );
  }

  const isMemberOrGuest =
    userMembership && userMembership.status === "active";
  const isPending = userMembership && userMembership.status === "pending";

  const getModelBadge = (m: string) => {
    switch (m) {
      case "assigned":
        return {
          label: "ASSIGNED HUBS",
          sub: "Dedicated airport bases and fixed turnaround gates",
          cls: "bg-[#1240C7]/10 text-[#1240C7] border-[#1240C7]/20",
        };
      case "hybrid":
        return {
          label: "HYBRID SYSTEM",
          sub: "Core assigned hub leads with flexible community turnarounds",
          cls: "bg-[#A8C229]/20 text-[#2D5A06] border-[#A8C229]/40",
        };
      case "flexible":
      default:
        return {
          label: "FLEXIBLE ROUTES",
          sub: "Open turnaround coordination across all unlocked airports",
          cls: "bg-[#5E6366]/10 text-[#5E6366] border-[#C9C7BA]",
        };
    }
  };

  const modelBadge = getModelBadge(alliance.airportModel);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate("alliances")}
          className="h-9 px-3.5 rounded-full bg-[#FFFFFA] border border-[#C9C7BA] text-xs font-mono font-bold text-[#5E6366] hover:text-[#141A1F] hover:bg-[#F0EBDE] transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>ALL ALLIANCES</span>
        </button>
        <span className="text-xs font-mono text-[#5E6366]">/</span>
        <span className="text-xs font-mono font-bold text-[#141A1F] uppercase">
          {alliance.name} LOUNGE
        </span>
      </div>

      {/* Success banner if any */}
      {successMessage && (
        <div className="bg-[#A8C229]/20 border border-[#A8C229]/50 rounded-2xl p-4 flex items-center gap-3 text-sm text-[#2D5A06] font-mono">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Action Error banner if any */}
      {actionError && (
        <div className="bg-[#F25E24]/10 border border-[#F25E24]/40 rounded-2xl p-4 flex items-center gap-3 text-sm text-[#D3410B] font-mono">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Hero Dossier Card */}
      <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[11px] font-mono font-extrabold uppercase px-3 py-1 rounded-full border ${modelBadge.cls}`}
              >
                {modelBadge.label}
              </span>
              <span className="text-[11px] font-mono uppercase px-3 py-1 rounded-full bg-[#F0EBDE] text-[#5E6366] font-bold">
                POLICY: {alliance.joinPolicy.replace("_", " ").toUpperCase()}
              </span>
              {alliance.discordUrl && (
                <a
                  href={alliance.discordUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/20 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3" />
                  DISCORD SERVER
                </a>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-[#141A1F]">
              {alliance.name}
            </h1>
            <p className="text-xs font-mono text-[#5E6366] tracking-wider uppercase">
              CALL-SIGN / IDENTIFIER: /{alliance.slug}
            </p>

            <p className="text-sm text-[#5E6366] leading-relaxed pt-2">
              {alliance.description ||
                "No public charter provided. Contact the alliance leadership for flight schedules and turnaround assignments."}
            </p>

            {/* Metrics Chips */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-mono text-[#5E6366]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1240C7]" />
                <span className="font-bold text-[#141A1F]">{activeMembersCount}</span> ACTIVE PILOTS
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F25E24]" />
                <span>ESCALATION WINDOW:</span>
                <span className="font-bold text-[#141A1F]">{alliance.maxEscalationDelayHours}H</span>
              </div>
              {alliance.creator && (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#A8C229]" />
                  <span>FOUNDER:</span>
                  <span className="font-bold text-[#141A1F]">
                    {alliance.creator.discordUsername}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Desk Box */}
          <div className="bg-[#F0EBDE]/50 border border-[#C9C7BA] rounded-2xl p-6 lg:w-80 shrink-0 space-y-4">
            <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#141A1F]">
              COMMAND DESK ACCESS
            </h3>

            {isMemberOrGuest ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#A8C229]/20 border border-[#A8C229]/40 rounded-xl text-xs font-mono text-[#2D5A06] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    YOU ARE ACTIVE: <b className="uppercase">{userMembership.role}</b>
                  </span>
                </div>
                <button
                  onClick={() => onNavigate("alliances", `${slug}/deck`)}
                  className="w-full h-12 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#1240C7]/20"
                >
                  <Plane className="w-4 h-4 text-white" />
                  <span>ENTER OPERATIONS DECK</span>
                </button>
              </div>
            ) : isPending ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#F25E24]/10 border border-[#F25E24]/30 rounded-xl text-xs font-mono text-[#D3410B] flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>APPLICATION PENDING REVIEW</span>
                </div>
                <p className="text-[11px] text-[#5E6366] leading-tight">
                  Your application is under review by alliance leadership. In the meantime, you may register as a Guest Host below.
                </p>
                <button
                  onClick={handleRegisterGuest}
                  disabled={submitting}
                  className="w-full h-10 rounded-full bg-[#141A1F] text-white text-xs font-mono font-bold hover:bg-[#252E36] transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#A8C229]" />
                  <span>REGISTER AS GUEST HOST</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[#5E6366] leading-relaxed">
                  Join as an official member to coordinate assigned hubs, or register as a guest host for open turnaround support.
                </p>

                <button
                  onClick={() => {
                    if (!isAuthenticated) openAuthModal("login");
                    else setApplyModalOpen(true);
                  }}
                  className="w-full h-11 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Users className="w-4 h-4 text-white" />
                  <span>APPLY TO JOIN ALLIANCE</span>
                </button>

                <button
                  onClick={() => {
                    if (!isAuthenticated) openAuthModal("login");
                    else handleRegisterGuest();
                  }}
                  disabled={submitting}
                  className="w-full h-10 rounded-full bg-[#FFFFFA] border border-[#C9C7BA] text-[#141A1F] text-xs font-mono font-bold hover:bg-[#F0EBDE] transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#1240C7]" />
                  <span>REGISTER AS GUEST HOST</span>
                </button>
                <p className="text-[10px] text-[#5E6366] text-center">
                  * Guest hosts can join unlimited alliances simultaneously.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 10-Hub Coverage Overview Dossier */}
      <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#1240C7]" />
              <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#1240C7]">
                OFFICIAL AIRPORT NETWORK
              </span>
            </div>
            <h2 className="text-2xl font-extrabold font-mono tracking-tight text-[#141A1F] mt-1">
              10-HUB COVERAGE MATRIX
            </h2>
            <p className="text-xs text-[#5E6366] mt-0.5">
              Airport bases staffed by alliance pilots for incoming fleet turnarounds.
            </p>
          </div>

          {matrixData && (
            <div className="flex items-center gap-3 bg-[#F0EBDE] px-4 py-2 rounded-full border border-[#C9C7BA] text-xs font-mono">
              <span className="font-bold text-[#141A1F]">
                {matrixData.totalCoveredHubs} / {matrixData.totalOfficialHubs} HUBS COVERED
              </span>
              <span>•</span>
              <span className="text-[#F25E24] font-bold">
                {matrixData.uncoveredGaps.length} GAPS
              </span>
            </div>
          )}
        </div>

        {/* Hubs Grid */}
        {matrixData && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {matrixData.matrix.map((hub) => {
              const isCovered = hub.pilots.length > 0;
              return (
                <div
                  key={hub.code}
                  className={`rounded-2xl border p-4 flex flex-col justify-between h-32 transition ${
                    isCovered
                      ? "bg-[#FFFFFA] border-[#A8C229]/60 shadow-2xs"
                      : "bg-[#F0EBDE]/40 border-dashed border-[#C9C7BA]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-xl text-[#141A1F]">
                      {hub.code}
                    </span>
                    {isCovered ? (
                      <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#A8C229]/20 text-[#2D5A06]">
                        {hub.pilots.length} PILOT{hub.pilots.length > 1 ? "S" : ""}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#F25E24]/10 text-[#D3410B]">
                        GAP
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#141A1F] truncate">{hub.name}</p>
                    <p className="text-[10px] font-mono text-[#5E6366] truncate">{hub.region}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Operating Philosophy Info Card */}
      <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-6 sm:p-8 shadow-xs">
        <h3 className="text-sm font-mono font-bold text-[#141A1F] uppercase tracking-wider mb-2">
          HOW THIS ALLIANCE OPERATES IN WORLD OF AIRPORTS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#5E6366] leading-relaxed pt-2">
          <div className="space-y-1">
            <p className="font-mono font-bold text-[#141A1F] uppercase">1. SENDER-DOMINANT FLEETS</p>
            <p>
              Alliance members operate large aircraft fleets and schedule flights outwards to partner hubs. Full gates are handled by turnaround hosts without crowding alliance runways.
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-mono font-bold text-[#141A1F] uppercase">2. PRIVATE ALLIANCE TIMERS</p>
            <p>
              Internal contract postings remain visible strictly to members and registered guest hosts during the initial {alliance.maxEscalationDelayHours}-hour priority window.
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-mono font-bold text-[#141A1F] uppercase">3. AUTOMATIC ESCALATION</p>
            <p>
              If no alliance member or guest claims the flight before the delay timer expires, it smoothly escalates to the public marketplace to ensure no flight is left grounded.
            </p>
          </div>
        </div>
      </div>

      {/* Membership Application Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#141A1F]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#C9C7BA]/50 pb-4">
              <div>
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#1240C7]">
                  PRIMARY MEMBERSHIP APPLICATION
                </span>
                <h3 className="text-xl font-mono font-extrabold text-[#141A1F]">
                  JOIN {alliance.name.toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F0EBDE] hover:bg-[#C9C7BA] text-[#141A1F] flex items-center justify-center transition cursor-pointer font-mono font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div className="p-3 bg-[#F0EBDE]/60 rounded-xl border border-[#C9C7BA] text-xs text-[#5E6366] leading-relaxed">
                <span className="font-bold text-[#141A1F]">Policy Reminder: </span>
                A WoA pilot may only be a full Member or Admin of <b>one primary alliance</b> at a time. If you already belong to an alliance, you must leave it first or join as a Guest Host instead.
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#141A1F] uppercase mb-1">
                  APPLICATION NOTE (OPTIONAL)
                </label>
                <textarea
                  value={applicationNote}
                  onChange={(e) => setApplicationNote(e.target.value)}
                  placeholder="Introduce yourself, your fleet capacity, or your main airport hubs..."
                  rows={3}
                  className="w-full bg-[#FFFFFA] border border-[#C9C7BA] rounded-xl p-3 text-xs font-mono text-[#141A1F] placeholder-[#5E6366]/60 focus:border-[#1240C7] focus:outline-none"
                />
              </div>

              {alliance.joinPolicy === "invite_only" && (
                <div>
                  <label className="block text-xs font-mono font-bold text-[#141A1F] uppercase mb-1">
                    INVITE CODE (REQUIRED)
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Enter invite code provided by alliance leadership"
                    className="w-full bg-[#FFFFFA] border border-[#C9C7BA] rounded-xl px-3 py-2 text-xs font-mono text-[#141A1F] focus:border-[#1240C7] focus:outline-none"
                  />
                </div>
              )}

              {actionError && (
                <div className="p-3 bg-[#F25E24]/10 border border-[#F25E24]/30 rounded-xl text-xs font-mono text-[#D3410B]">
                  {actionError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#C9C7BA] text-xs font-mono font-bold text-[#5E6366] hover:bg-[#F0EBDE] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold hover:bg-[#0E339E] cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  {submitting && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>SUBMIT APPLICATION</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
