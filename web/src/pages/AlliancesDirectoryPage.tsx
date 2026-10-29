import { useState, useEffect } from "react";
import { api, type Alliance, type AirportModel } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Plus, Search, Shield, ArrowRight, X, AlertCircle } from "lucide-react";

interface AlliancesDirectoryPageProps {
  onNavigate: (tab: "marketplace" | "new-contract" | "dashboard" | "profile" | "alliances", param?: string) => void;
}

export const AlliancesDirectoryPage = ({ onNavigate }: AlliancesDirectoryPageProps) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [alliancesList, setAlliancesList] = useState<Alliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<"ALL" | AirportModel>("ALL");
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New alliance form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [model, setModel] = useState<AirportModel>("assigned");
  const [joinPolicy, setJoinPolicy] = useState<"open" | "approval" | "invite_only">("approval");
  const [discordUrl, setDiscordUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlliances = async () => {
    setLoading(true);
    try {
      const res = await api.alliances.list({
        model: selectedModel === "ALL" ? undefined : selectedModel,
        search: search.trim() || undefined,
      });
      setAlliancesList(res.alliances);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlliances();
  }, [selectedModel, search]);

  const handleCreateAlliance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return openAuthModal("login");

    setError(null);
    setSubmitting(true);
    try {
      const res = await api.alliances.create({
        name,
        slug: slug.toLowerCase().trim(),
        description: description.trim() || undefined,
        airport_model: model,
        join_policy: joinPolicy,
        discord_url: discordUrl.trim() || undefined,
      });
      setCreateModalOpen(false);
      onNavigate("alliances", res.alliance.slug);
    } catch (err: any) {
      setError(err?.message || "Failed to create alliance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-4 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#1240C7]">
              ALLIANCE SPACES & FLEET CONSORTIUMS
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-mono tracking-tight text-[#141A1F] mt-1">
            GLOBAL AIRPORT ALLIANCES
          </h1>
          <p className="text-xs sm:text-sm text-[#5E6366] max-w-xl mt-1 leading-relaxed">
            Organized player groups coordinating assigned airport hubs, private member contracts, and scheduled fleet networks across World of Airports.
          </p>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) openAuthModal("login");
            else setCreateModalOpen(true);
          }}
          className="h-11 sm:h-12 px-5 sm:px-6 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] active:scale-95 transition cursor-pointer flex items-center gap-2 self-start md:self-auto shadow-md shadow-[#1240C7]/20 shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>REGISTER AN ALLIANCE</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="w-full bg-[#FFFFFA] rounded-2xl sm:rounded-full border border-[#C9C7BA] shadow-xs px-3 sm:px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3 min-h-[57px]">
        <div className="flex items-center gap-2.5 w-full md:w-64 pl-2">
          <Search className="w-4 h-4 text-[#5E6366] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH ALLIANCES..."
            className="w-full bg-transparent text-xs font-mono font-bold uppercase text-[#141A1F] placeholder:text-[#5E6366]/60 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {(["ALL", "assigned", "flexible", "hybrid"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedModel(m)}
              className={`h-8 px-3.5 rounded-full text-xs font-mono font-bold uppercase transition cursor-pointer ${
                selectedModel === m
                  ? "bg-[#141A1F] text-white shadow-xs"
                  : "bg-[#F0EBDE] text-[#5E6366] hover:text-[#141A1F] border border-[#C9C7BA]"
              }`}
            >
              {m === "ALL" ? "ALL MODELS" : `${m.toUpperCase()} MODEL`}
            </button>
          ))}
        </div>
      </div>

      {/* Alliance Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] animate-pulse p-6" />
          ))}
        </div>
      ) : alliancesList.length === 0 ? (
        <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-12 text-center max-w-md mx-auto shadow-xs">
          <Shield className="w-12 h-12 text-[#C9C7BA] mx-auto mb-3" />
          <h3 className="text-base font-bold font-mono text-[#141A1F]">NO ALLIANCES FOUND</h3>
          <p className="text-xs text-[#5E6366] mt-1 mb-5">
            Be the first founder to establish an alliance consortium on the hub.
          </p>
          <button
            onClick={() => {
              if (!isAuthenticated) openAuthModal("login");
              else setCreateModalOpen(true);
            }}
            className="h-10 px-5 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] cursor-pointer"
          >
            REGISTER ALLIANCE
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {alliancesList.map((alliance) => (
            <div
              key={alliance.id}
              className="bg-[#FFFFFA] rounded-2xl border border-[#C9C7BA] p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between group hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="h-6 px-3 rounded-full text-[11px] font-mono font-bold uppercase bg-[#F0EBDE] text-[#141A1F] border border-[#C9C7BA]">
                    {alliance.airportModel.toUpperCase()} MODEL
                  </span>
                  <span className="h-6 px-2.5 rounded-full text-[11px] font-mono font-bold bg-[#A8C229] text-[#141A1F]">
                    {alliance.activeMembersCount || 1} PILOTS
                  </span>
                </div>

                <div className="flex items-center gap-3 my-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#141A1F] text-white flex items-center justify-center font-mono font-bold text-lg shadow-2xs">
                    {alliance.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold font-mono text-[#141A1F] truncate group-hover:text-[#1240C7] transition">
                      {alliance.name}
                    </h3>
                    <p className="text-xs font-mono text-[#5E6366] truncate">
                      /{alliance.slug}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#5E6366] line-clamp-2 mt-2">
                  {alliance.description || "Active World of Airports fleet alliance coordinating flights and handling."}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#C9C7BA] flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[#5E6366] uppercase">
                  JOIN: {alliance.joinPolicy}
                </span>

                <button
                  onClick={() => onNavigate("alliances", alliance.slug)}
                  className="h-9 px-4 rounded-full bg-[#141A1F] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#252E36] transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>ALLIANCE LOUNGE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Alliance Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141A1F]/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] shadow-2xl p-5 sm:p-7 max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-mono text-[#141A1F]">
                REGISTER NEW ALLIANCE
              </h2>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-full text-[#5E6366] hover:bg-[#F0EBDE] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#F25E24]/10 border border-[#F25E24]/30 text-[#F25E24] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateAlliance} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#5E6366] mb-1">
                  Alliance Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                  }}
                  placeholder="e.g. Skyline Skyways"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFA] border border-[#C9C7BA] text-sm text-[#141A1F] focus:outline-none focus:border-[#1240C7]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#5E6366] mb-1">
                  Unique Slug
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="e.g. skyline-skyways"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFA] border border-[#C9C7BA] text-sm font-mono text-[#141A1F] focus:outline-none focus:border-[#1240C7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#5E6366] mb-1">
                    Airport Model
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl bg-[#F0EBDE] border border-[#C9C7BA] text-xs font-mono font-bold text-[#141A1F] focus:outline-none"
                  >
                    <option value="assigned">Assigned Hubs</option>
                    <option value="flexible">Flexible Exchange</option>
                    <option value="hybrid">Hybrid Consortium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#5E6366] mb-1">
                    Join Policy
                  </label>
                  <select
                    value={joinPolicy}
                    onChange={(e) => setJoinPolicy(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl bg-[#F0EBDE] border border-[#C9C7BA] text-xs font-mono font-bold text-[#141A1F] focus:outline-none"
                  >
                    <option value="open">Open Join</option>
                    <option value="approval">Application Review</option>
                    <option value="invite_only">Invite Link Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#5E6366] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Alliance mission, route operations, and recruitment requirements."
                  className="w-full p-3 rounded-xl bg-[#FFFFFA] border border-[#C9C7BA] text-xs text-[#141A1F] focus:outline-none focus:border-[#1240C7]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#5E6366] mb-1">
                  Community Discord Server URL <span className="font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={discordUrl}
                  onChange={(e) => setDiscordUrl(e.target.value)}
                  placeholder="https://discord.gg/..."
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFA] border border-[#C9C7BA] text-xs text-[#141A1F] focus:outline-none focus:border-[#1240C7]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-full bg-[#1240C7] text-white font-mono font-bold text-xs tracking-wider hover:bg-[#0E339E] cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "REGISTERING ALLIANCE..." : "ESTABLISH ALLIANCE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
