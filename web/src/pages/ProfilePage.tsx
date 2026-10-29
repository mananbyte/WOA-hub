import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api, type PublicProfile } from "../api/client";
import { ShieldCheck, CheckCircle2, XCircle, Edit3, Save, ArrowLeft, AlertCircle } from "lucide-react";

interface ProfilePageProps {
  userId?: string;
  onNavigate: (tab: "marketplace" | "new-contract" | "dashboard" | "profile", param?: string) => void;
}

export const ProfilePage = ({ userId, onNavigate }: ProfilePageProps) => {
  const { user: currentUser, updateWoaId } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingWoaId, setEditingWoaId] = useState(false);
  const [newWoaId, setNewWoaId] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const targetId = userId || currentUser?.id;
  const isOwnProfile = currentUser && currentUser.id === targetId;

  useEffect(() => {
    async function loadProfile() {
      if (!targetId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.user.getProfile(targetId);
        setProfile(res.profile);
        setNewWoaId(res.profile.woaPlayerId || "");
      } catch (err: any) {
        setError(err?.message || "Failed to load pilot dossier");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [targetId]);

  const handleSaveWoaId = async () => {
    if (!newWoaId.trim()) return;
    setUpdating(true);
    setError(null);
    setSuccess(null);
    try {
      await updateWoaId(newWoaId.trim());
      setSuccess("WoA Player ID updated successfully.");
      setEditingWoaId(false);
      if (profile) {
        setProfile({ ...profile, woaPlayerId: newWoaId.trim() });
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update WoA Player ID");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-8 h-8 border-3 border-[#1240C7] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono text-[#5E6366]">ACCESSING PILOT DOSSIER...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-8 shadow-xs">
        <AlertCircle className="w-12 h-12 text-[#F25E24] mx-auto mb-4" />
        <h2 className="text-xl font-bold font-mono text-[#141A1F]">PILOT DOSSIER NOT FOUND</h2>
        <p className="text-xs text-[#5E6366] mt-2 mb-6">{error || "Could not retrieve user record."}</p>
        <button
          onClick={() => onNavigate("marketplace")}
          className="h-10 px-6 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] cursor-pointer"
        >
          RETURN TO MARKETPLACE
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <button
        onClick={() => onNavigate("marketplace")}
        className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#5E6366] hover:text-[#141A1F] transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO MARKETPLACE</span>
      </button>

      {/* Main Dossier Card */}
      <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#C9C7BA]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#141A1F] text-white flex items-center justify-center font-mono font-bold text-2xl shadow-sm">
              {(profile.discordUsername || profile.woaPlayerId || "WOA").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-extrabold uppercase text-[#1240C7]">
                  OFFICIAL PILOT RECORD
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#A8C229] text-[#141A1F] text-[10px] font-mono font-bold">
                  VERIFIED
                </span>
              </div>
              <h1 className="text-2xl font-black font-mono text-[#141A1F] mt-0.5">
                {profile.discordUsername || profile.woaPlayerId}
              </h1>
              <p className="text-xs text-[#5E6366] font-mono">
                MEMBER SINCE {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Reputation Badge */}
          <div className="p-4 rounded-2xl bg-[#E0E8FA] border border-[#1240C7]/20 flex items-center gap-3 self-start sm:self-auto">
            <ShieldCheck className="w-8 h-8 text-[#1240C7]" />
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-[#5E6366]">
                COMMUNITY REPUTATION
              </span>
              <p className="text-2xl font-black font-mono text-[#1240C7] leading-none">
                {profile.reputationScore}%
              </p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {success && (
          <div className="p-3.5 rounded-2xl bg-[#A8C229]/20 border border-[#A8C229] text-[#141A1F] text-xs font-mono">
            {success}
          </div>
        )}

        {/* WoA Player ID Section */}
        <div className="p-5 rounded-2xl bg-[#F0EBDE] border border-[#C9C7BA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#5E6366]">
              WORLD OF AIRPORTS PLAYER ID
            </span>
            {editingWoaId ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={newWoaId}
                  onChange={(e) => setNewWoaId(e.target.value)}
                  placeholder="e.g. WOA-84920"
                  className="h-10 px-3 rounded-xl bg-[#FFFFFA] border border-[#C9C7BA] text-xs font-mono font-bold text-[#141A1F] focus:outline-none focus:border-[#1240C7]"
                />
                <button
                  onClick={handleSaveWoaId}
                  disabled={updating}
                  className="h-10 px-4 rounded-xl bg-[#1240C7] text-white text-xs font-mono font-bold hover:bg-[#0E339E] cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>SAVE</span>
                </button>
              </div>
            ) : (
              <p className="text-base font-bold font-mono text-[#141A1F] mt-0.5">
                {profile.woaPlayerId || "NO WOA ID LINKED"}
              </p>
            )}
          </div>

          {isOwnProfile && !editingWoaId && (
            <button
              onClick={() => setEditingWoaId(true)}
              className="h-9 px-4 rounded-full bg-[#FFFFFA] text-[#141A1F] border border-[#C9C7BA] text-xs font-mono font-bold hover:bg-[#F0EBDE] transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>EDIT ID</span>
            </button>
          )}
        </div>

        {/* Flight Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#FFFFFA] border border-[#C9C7BA] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#A8C229]/20 flex items-center justify-center text-[#141A1F]">
              <CheckCircle2 className="w-6 h-6 text-[#A8C229]" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-[#5E6366] uppercase">
                COMPLETED FLIGHTS
              </p>
              <p className="text-2xl font-black font-mono text-[#141A1F]">
                {profile.totalCompletedContracts}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFFFA] border border-[#C9C7BA] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F25E24]/10 flex items-center justify-center text-[#F25E24]">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-[#5E6366] uppercase">
                CANCELLED CONTRACTS
              </p>
              <p className="text-2xl font-black font-mono text-[#141A1F]">
                {profile.totalCancelledContracts}
              </p>
            </div>
          </div>
        </div>

        {/* Discord Developer Policy Notice */}
        <div className="p-4 rounded-2xl bg-[#F0EBDE]/60 border border-[#C9C7BA] text-[11px] font-mono text-[#5E6366] space-y-1">
          <p className="font-bold text-[#141A1F] uppercase">DISCORD POLICY & PRIVACY COMPLIANCE</p>
          <p>
            • Age verified (13+ compliance).
            • All notifications are opt-in and rate-limited.
            • Passwords securely hashed with bcrypt.
          </p>
        </div>
      </div>
    </div>
  );
};
