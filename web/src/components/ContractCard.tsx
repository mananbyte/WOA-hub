import { Plane, Clock, ShieldCheck, ArrowRight, Package, RotateCw } from "lucide-react";
import { type Listing } from "../api/client";
import { useAuth } from "../context/AuthContext";

interface ContractCardProps {
  listing: Listing;
  onSelect: (id: string) => void;
  onClaim?: (id: string) => void;
  isClaiming?: boolean;
}

export const ContractCard = ({
  listing,
  onSelect,
  onClaim,
  isClaiming = false,
}: ContractCardProps) => {
  const { user } = useAuth();
  const isCreator = user?.id === listing.creator.id;

  // Format time remaining
  const getTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "EXPIRED";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m REMAINING`;
  };

  const isOutgoing = listing.contractType === "outgoing";

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "open":
        return { label: "● OPEN", color: "text-[#A8C229]" };
      case "claimed":
        return { label: "● WAITING FOR APPROVAL", color: "text-[#E67E22]" };
      case "in_progress":
        return { label: "● APPROVED / IN FLIGHT", color: "text-[#1240C7]" };
      case "partially_dispatched":
        return { label: "● PARTIALLY DISPATCHED", color: "text-[#D35400]" };
      case "dispatched":
        return { label: "● DISPATCHED", color: "text-[#2980B9]" };
      case "completed":
        return { label: "● COMPLETED", color: "text-[#27AE60]" };
      case "cancelled":
        return { label: "● CANCELLED", color: "text-[#C0392B]" };
      case "expired":
        return { label: "● EXPIRED", color: "text-[#7F8C8D]" };
      default:
        return { label: `● ${status.toUpperCase()}`, color: "text-[#5E6366]" };
    }
  };

  const statusInfo = getStatusDisplay(listing.status);

  return (
    <div className="bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:-translate-y-0.5">
      {/* Top Header: Tag Badge + Class Tag */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center flex-wrap gap-1.5">
            <span
              className={`h-[22px] px-3 rounded-full text-[11px] font-mono font-bold uppercase inline-flex items-center tracking-wider text-white shadow-2xs ${
                isOutgoing ? "bg-[#F25E24]" : "bg-[#1240C7]"
              }`}
            >
              {isOutgoing ? "OUTGOING FLIGHT" : "INCOMING TURNAROUND"}
            </span>

            {listing.renewal && (
              <span
                title="This contract is marked for recurring renewal upon completion"
                className="h-[22px] px-2.5 rounded-full text-[10px] font-mono font-extrabold uppercase bg-[#A8C229] text-[#141A1F] inline-flex items-center gap-1 border border-[#8FA81F] shadow-2xs"
              >
                <RotateCw className="w-3 h-3 text-[#141A1F]" />
                ↻ RENEWAL
              </span>
            )}

            {listing.isCargo && (
              <span className="h-[22px] px-2.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#141A1F] text-white inline-flex items-center gap-1">
                <Package className="w-3 h-3" />
                CARGO
              </span>
            )}
          </div>

          <span className="h-[22px] px-2.5 rounded-full text-[11px] font-mono font-bold bg-[#F0EBDE] text-[#141A1F] border border-[#C9C7BA]">
            CLASS {listing.aircraftClass}
          </span>
        </div>

        {/* Route Row: Airport Codes */}
        <div
          onClick={() => onSelect(listing.id)}
          className="flex items-center justify-between my-2 cursor-pointer group-hover:text-[#1240C7] transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold font-mono tracking-tight text-[#141A1F]">
              {listing.originAirport}
            </span>
            <div className="flex items-center gap-1 text-[#5E6366]">
              <div className="w-4 h-0.5 bg-[#C9C7BA]" />
              <Plane className="w-4 h-4 text-[#1240C7] -rotate-45" />
              <div className="w-4 h-0.5 bg-[#C9C7BA]" />
            </div>
            <span className="text-2xl font-extrabold font-mono tracking-tight text-[#141A1F]">
              {listing.destinationAirport}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#5E6366] block">
              STATUS
            </span>
            <span className={`text-xs font-mono font-bold uppercase ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Notes if available */}
        {listing.notes && (
          <p className="text-xs text-[#5E6366] line-clamp-1 italic mb-2">
            "{listing.notes}"
          </p>
        )}

        {/* Expiry Pill */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#5E6366] mt-2">
          <Clock className="w-3.5 h-3.5 text-[#5E6366]" />
          <span>{getTimeRemaining(listing.expiresAt)}</span>
        </div>
      </div>

      {/* Hairline Divider */}
      <div className="my-3.5 border-t border-[#C9C7BA]" />

      {/* Card Footer: Creator Profile + Claim Button */}
      <div className="flex items-center justify-between gap-3">
        {/* Creator Info */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#F0EBDE] border border-[#C9C7BA] flex items-center justify-center font-mono font-bold text-xs text-[#141A1F] shrink-0">
            {listing.creator.discordUsername.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold font-mono text-[#141A1F] truncate leading-tight">
              {listing.creator.discordUsername}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-[#5E6366] font-mono leading-tight">
              <ShieldCheck className="w-3 h-3 text-[#A8C229]" />
              <span>{listing.creator.reputationScore}% REP</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {isCreator ? (
          <button
            onClick={() => onSelect(listing.id)}
            className="h-9 px-4 rounded-full bg-[#141A1F] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#252E36] transition cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>OPS ROOM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : listing.status === "open" ? (
          <button
            onClick={() => {
              if (onClaim) onClaim(listing.id);
              else onSelect(listing.id);
            }}
            disabled={isClaiming}
            className="h-9 px-4 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] active:scale-95 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shrink-0 shadow-xs"
          >
            <span>{isClaiming ? "CLAIMING..." : "CLAIM"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => onSelect(listing.id)}
            className="h-9 px-4 rounded-full bg-[#F0EBDE] text-[#141A1F] border border-[#C9C7BA] text-xs font-mono font-bold tracking-wider hover:bg-[#FFFFFA] transition cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>VIEW OPS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
