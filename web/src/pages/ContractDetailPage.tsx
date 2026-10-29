import { useState, useEffect } from "react";
import { api, type ListingDetail } from "../api/client";
import { useAuth } from "../context/AuthContext";
import confetti from "canvas-confetti";
import {
  Plane,
  ArrowLeft,
  AlertTriangle,
  History,
  Sparkles,
  RotateCw,
} from "lucide-react";
import { AirportCrest } from "../components/AirportCrest";


interface ContractDetailPageProps {
  contractId: string;
  onNavigate: (tab: "marketplace" | "new-contract" | "dashboard" | "profile", param?: string) => void;
}

export const ContractDetailPage = ({ contractId, onNavigate }: ContractDetailPageProps) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [details, setDetails] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listings.get(contractId);
      setDetails(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load contract details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [contractId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="w-10 h-10 border-4 border-[#1240C7] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-mono font-bold text-[#5E6366]">INITIALIZING FLIGHT OPERATIONS ROOM...</p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-8 shadow-xs">
        <AlertTriangle className="w-12 h-12 text-[#F25E24] mx-auto mb-4" />
        <h2 className="text-xl font-bold font-mono text-[#141A1F]">OPERATIONS ROOM UNAVAILABLE</h2>
        <p className="text-xs text-[#5E6366] mt-2 mb-6">{error || "Contract listing could not be found."}</p>
        <button
          onClick={() => onNavigate("marketplace")}
          className="h-10 px-6 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] cursor-pointer"
        >
          RETURN TO MARKETPLACE
        </button>
      </div>
    );
  }

  const { listing, claims, events } = details;
  const isCreator = user?.id === listing.creatorId;
  const activeClaim = claims.find((c) => c.status === "accepted" || c.status === "pending");
  const isClaimant = user?.id === activeClaim?.claimantId;

  // Determine sender and receiver roles
  // Outgoing: Creator is sender, Claimant is receiver
  // Incoming: Claimant is sender, Creator is receiver
  const isSender = listing.contractType === "outgoing" ? isCreator : isClaimant;
  const isReceiver = listing.contractType === "outgoing" ? isClaimant : isCreator;

  const handleClaim = async () => {
    if (!isAuthenticated) return openAuthModal("login");
    setActionLoading(true);
    try {
      await api.listings.claim(contractId);
      await fetchDetails();
    } catch (err: any) {
      alert(err?.message || "Failed to claim connection");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.listings.approve(contractId);
      await fetchDetails();
    } catch (err: any) {
      alert(err?.message || "Failed to approve claimant");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePartialDispatch = async () => {
    setActionLoading(true);
    try {
      await api.listings.partialDispatch(contractId);
      await fetchDetails();
    } catch (err: any) {
      alert(err?.message || "Failed to report partial dispatch");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispatch = async () => {
    setActionLoading(true);
    try {
      await api.listings.dispatch(contractId);
      await fetchDetails();
    } catch (err: any) {
      alert(err?.message || "Failed to report dispatch");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      const res = await api.listings.accept(contractId);
      if (res.listing.status === "completed") {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#1240C7", "#A8C229", "#F25E24", "#FFFFFA"],
        });
      }
      await fetchDetails();
    } catch (err: any) {
      alert(err?.message || "Failed to report turnaround");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert("A cancellation reason is required for audit tracking.");
      return;
    }
    setActionLoading(true);
    try {
      await api.listings.cancel(contractId, cancelReason.trim());
      setCancelModalOpen(false);
      await fetchDetails();
    } catch (err: any) {
      alert(err?.message || "Failed to cancel contract");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Back button */}
      <button
        onClick={() => onNavigate("marketplace")}
        className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#5E6366] hover:text-[#141A1F] transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO MARKETPLACE</span>
      </button>

      {/* Hero Flight Room Header */}
      <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`h-6 px-3 rounded-full text-xs font-mono font-bold uppercase inline-flex items-center text-white ${
                listing.contractType === "outgoing" ? "bg-[#F25E24]" : "bg-[#1240C7]"
              }`}
            >
              {listing.contractType === "outgoing" ? "OUTGOING FLIGHT" : "INCOMING TURNAROUND"}
            </span>

            {listing.renewal && (
              <span className="h-6 px-3 rounded-full text-xs font-mono font-extrabold uppercase bg-[#A8C229] text-[#141A1F] inline-flex items-center gap-1.5 border border-[#8FA81F] shadow-2xs">
                <RotateCw className="w-3.5 h-3.5 text-[#141A1F]" />
                ↻ RENEWABLE CONTRACT
              </span>
            )}

            <span className="h-6 px-3 rounded-full text-xs font-mono font-bold bg-[#F0EBDE] text-[#141A1F] border border-[#C9C7BA]">
              CLASS {listing.aircraftClass} {listing.isCargo ? "(CARGO)" : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#5E6366]">LIFECYCLE STATUS:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                listing.status === "completed"
                  ? "bg-[#A8C229] text-[#141A1F]"
                  : listing.status === "cancelled"
                  ? "bg-[#F25E24] text-white"
                  : listing.status === "partially_dispatched"
                  ? "bg-[#D35400] text-white"
                  : listing.status === "claimed"
                  ? "bg-[#E67E22] text-white"
                  : "bg-[#141A1F] text-white"
              }`}
            >
              ● {listing.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Route Banner */}
        <div className="py-6 border-y border-[#C9C7BA] my-4 flex flex-col sm:flex-row items-center justify-around gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <AirportCrest code={listing.originAirport} size={56} />
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold uppercase text-[#5E6366]">
                ORIGIN AIRPORT
              </span>
              <p className="text-3xl sm:text-4xl font-black font-mono text-[#141A1F]">
                {listing.originAirport}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 text-[#1240C7]">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
              BILATERAL FLIGHT DISPATCH
            </span>
            <div className="flex items-center gap-2">
              <div className="w-12 h-0.5 bg-[#C9C7BA]" />
              <Plane className="w-6 h-6 -rotate-45" />
              <div className="w-12 h-0.5 bg-[#C9C7BA]" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <AirportCrest code={listing.destinationAirport} size={56} />
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold uppercase text-[#5E6366]">
                DESTINATION AIRPORT
              </span>
              <p className="text-3xl sm:text-4xl font-black font-mono text-[#141A1F]">
                {listing.destinationAirport}
              </p>
            </div>
          </div>
        </div>

        {/* Creator & Claimant Dossiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#F0EBDE] border border-[#C9C7BA]">
            <span className="text-[10px] font-mono font-bold text-[#5E6366] uppercase">
              CONTRACT CREATOR (HOST)
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold font-mono text-[#141A1F]">
                {listing.creator.discordUsername || listing.creator.woaPlayerId}
              </span>
              <span className="text-xs font-mono font-bold text-[#1240C7]">
                {listing.creator.reputationScore}% REP
              </span>
            </div>
            <p className="text-[11px] text-[#5E6366] font-mono mt-0.5">
              WOA ID: {listing.creator.woaPlayerId} {listing.creator.discordUsername ? `• DISCORD: ${listing.creator.discordUsername}` : ""}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F0EBDE] border border-[#C9C7BA]">
            <span className="text-[10px] font-mono font-bold text-[#5E6366] uppercase">
              CLAIMED COUNTERPARTY (PARTNER)
            </span>
            {activeClaim ? (
              <>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold font-mono text-[#141A1F]">
                    {activeClaim.claimant.discordUsername || activeClaim.claimant.woaPlayerId}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1240C7]">
                    {activeClaim.claimant.reputationScore}% REP
                  </span>
                </div>
                <p className="text-[11px] text-[#5E6366] font-mono mt-0.5">
                  WOA ID: {activeClaim.claimant.woaPlayerId} {activeClaim.claimant.discordUsername ? `• DISCORD: ${activeClaim.claimant.discordUsername}` : ""}
                </p>
              </>
            ) : (
              <p className="text-xs text-[#5E6366] italic mt-2">
                Awaiting partner pilot claim...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Completion Banner */}
      {listing.status === "completed" && (
        <div className="p-6 rounded-3xl bg-[#A8C229]/20 border border-[#A8C229] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#A8C229] text-[#141A1F] flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-[#141A1F]">
              FLIGHT CONTRACT SUCCESSFULLY COMPLETED
            </h3>
            <p className="text-xs text-[#5E6366] mt-0.5">
              Both sender dispatch and receiver turnaround were confirmed. Reputation metrics have been credited!
            </p>
          </div>
        </div>
      )}

      {/* Bilateral Action Operations Desk */}
      <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold font-mono text-[#141A1F]">
          BILATERAL OPERATIONS ACTION DESK
        </h3>

        {/* State: Open & Not Creator */}
        {listing.status === "open" && !isCreator && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#E0E8FA] border border-[#1240C7]/30">
            <div>
              <p className="text-xs font-bold font-mono text-[#141A1F]">
                READY TO FLY THIS ROUTE?
              </p>
              <p className="text-[11px] text-[#5E6366]">
                Claim this flight contract to coordinate dispatch with {listing.creator.discordUsername || listing.creator.woaPlayerId}.
              </p>
            </div>
            <button
              onClick={handleClaim}
              disabled={actionLoading}
              className="h-11 px-6 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? "CLAIMING..." : "CLAIM CONNECTION"}
            </button>
          </div>
        )}

        {/* State: Claimed -> Needs Creator Approval */}
        {listing.status === "claimed" && isCreator && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#E0E8FA] border border-[#1240C7]/30">
            <div>
              <p className="text-xs font-bold font-mono text-[#141A1F]">
                CLAIMANT AWAITING YOUR APPROVAL
              </p>
              <p className="text-[11px] text-[#5E6366]">
                Pilot {activeClaim?.claimant.discordUsername || activeClaim?.claimant.woaPlayerId} requested this connection.
              </p>
            </div>
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="h-11 px-6 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? "APPROVING..." : "APPROVE CLAIM"}
            </button>
          </div>
        )}

        {/* State: In Progress / Partially Dispatched / Dispatched -> Sender and Receiver Bilateral Controls */}
        {(listing.status === "in_progress" || listing.status === "partially_dispatched" || listing.status === "dispatched") && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sender Action Box */}
              <div className="p-4 rounded-2xl border border-[#C9C7BA] bg-[#F0EBDE]/60 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#5E6366]">
                  PHASE 1: SENDER DISPATCH IN WOA
                </span>
                <p className="text-xs text-[#141A1F] font-bold">
                  {listing.status === "dispatched"
                    ? "✓ Flight Fully Dispatched in WoA"
                    : listing.status === "partially_dispatched"
                    ? "⚡ Partially Dispatched (Fleet in Flight)"
                    : "Awaiting In-Game Aircraft Departure"}
                </p>
                {isSender && (listing.status === "in_progress" || listing.status === "partially_dispatched") && (
                  <div className="space-y-2 pt-1">
                    {listing.status === "in_progress" && (
                      <button
                        onClick={handlePartialDispatch}
                        disabled={actionLoading}
                        className="w-full h-10 rounded-full bg-[#D35400] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#B34500] cursor-pointer"
                      >
                        REPORT PARTIAL DISPATCH
                      </button>
                    )}
                    <button
                      onClick={handleDispatch}
                      disabled={actionLoading}
                      className="w-full h-10 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] cursor-pointer"
                    >
                      CONFIRM FULL IN-GAME DISPATCH
                    </button>
                  </div>
                )}
              </div>

              {/* Receiver Action Box */}
              <div className="p-4 rounded-2xl border border-[#C9C7BA] bg-[#F0EBDE]/60 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#5E6366]">
                  PHASE 2: RECEIVER TURNAROUND IN WOA
                </span>
                <p className="text-xs text-[#141A1F] font-bold">
                  {listing.status === "dispatched" || listing.status === "partially_dispatched"
                    ? "Aircraft En Route — Handle on Gate"
                    : "Pending Sender Dispatch First"}
                </p>
                {isReceiver && (listing.status === "dispatched" || listing.status === "partially_dispatched") && (
                  <button
                    onClick={handleAccept}
                    disabled={actionLoading}
                    className="w-full h-10 rounded-full bg-[#A8C229] text-[#141A1F] text-xs font-mono font-bold tracking-wider hover:bg-[#96ad24] cursor-pointer mt-2"
                  >
                    CONFIRM IN-GAME TURNAROUND
                  </button>
                )}
              </div>
            </div>

            {/* Cancel Option */}
            {(isCreator || isClaimant) && (
              <div className="pt-2 text-right">
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="text-xs font-mono font-bold text-[#F25E24] hover:underline cursor-pointer"
                >
                  Cancel Contract Connection
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Immutable Audit Event Timeline */}
      <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-[#1240C7]" />
          <h3 className="text-base font-bold font-mono text-[#141A1F]">
            IMMUTABLE AUDIT TIMELINE
          </h3>
        </div>

        <div className="space-y-4">
          {events.map((ev, idx) => (
            <div key={ev.id} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#F0EBDE] border border-[#C9C7BA] flex items-center justify-center text-xs font-mono font-bold text-[#141A1F] shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-[#141A1F]">
                    {ev.eventType} ({ev.fromStatus || "START"} ➔ {ev.toStatus})
                  </span>
                  <span className="text-[10px] font-mono text-[#5E6366]">
                    {new Date(ev.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                {ev.notes && (
                  <p className="text-xs text-[#5E6366] mt-0.5 font-mono">
                    {ev.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141A1F]/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] shadow-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold font-mono text-[#F25E24]">
              CONFIRM CONTRACT CANCELLATION
            </h3>
            <p className="text-xs text-[#5E6366]">
              A reason is mandatory for audit logging. Unilateral cancellations may affect your reputation score.
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. In-game maintenance or partner unresponsive."
              className="w-full p-3 rounded-2xl bg-[#F0EBDE] border border-[#C9C7BA] text-xs font-mono focus:outline-none focus:border-[#F25E24]"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="h-9 px-4 rounded-full bg-[#F0EBDE] text-[#141A1F] text-xs font-mono font-bold hover:bg-[#FFFFFA] cursor-pointer"
              >
                CLOSE
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="h-9 px-5 rounded-full bg-[#F25E24] text-white text-xs font-mono font-bold hover:bg-[#d64f1d] cursor-pointer disabled:opacity-50"
              >
                CONFIRM CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
