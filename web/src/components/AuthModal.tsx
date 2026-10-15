import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Plane, AlertCircle } from "lucide-react";

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(authModalMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [woaPlayerId, setWoaPlayerId] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync mode with context
  useEffect(() => {
    setMode(authModalMode);
    setError(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (!ageConfirmed) {
          throw new Error("You must confirm you are at least 13 years of age.");
        }
        await register({
          email,
          password,
          discord_username: discordUsername,
          woa_player_id: woaPlayerId || undefined,
          age_confirmed: ageConfirmed,
        });
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141A1F]/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] shadow-2xl p-7 text-[#141A1F] animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-[#5E6366] hover:text-[#141A1F] hover:bg-[#F0EBDE] transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#1240C7] flex items-center justify-center text-white">
            <Plane className="w-4 h-4 -rotate-45" />
          </div>
          <span className="text-xs font-mono tracking-widest uppercase font-bold text-[#1240C7]">
            WOA FLIGHT NETWORK
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#141A1F]">
          {mode === "login" ? "Welcome Back, Pilot" : "Register Pilot Dossier"}
        </h2>
        <p className="text-sm text-[#5E6366] mt-1 mb-5">
          {mode === "login"
            ? "Sign in to claim flight contracts and dispatch aircraft."
            : "Connect your Discord handle and WoA player ID to start trading flights."}
        </p>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-[#F0EBDE] p-1 rounded-full mb-5 border border-[#C9C7BA]">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition cursor-pointer ${
              mode === "login"
                ? "bg-[#141A1F] text-white shadow-xs"
                : "text-[#5E6366] hover:text-[#141A1F]"
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-full transition cursor-pointer ${
              mode === "register"
                ? "bg-[#141A1F] text-white shadow-xs"
                : "text-[#5E6366] hover:text-[#141A1F]"
            }`}
          >
            NEW PILOT
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#F25E24]/10 border border-[#F25E24]/30 text-[#F25E24] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-[#5E6366] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pilot@airline.com"
              className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFA] border border-[#C9C7BA] text-sm text-[#141A1F] placeholder:text-[#5E6366]/60 focus:outline-none focus:border-[#1240C7] focus:ring-1 focus:ring-[#1240C7] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-[#5E6366] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFA] border border-[#C9C7BA] text-sm text-[#141A1F] placeholder:text-[#5E6366]/60 focus:outline-none focus:border-[#1240C7] focus:ring-1 focus:ring-[#1240C7] transition"
            />
          </div>

          {mode === "register" && (
            <>
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-[#5E6366] mb-1">
                  Discord Username
                </label>
                <input
                  type="text"
                  required
                  value={discordUsername}
                  onChange={(e) => setDiscordUsername(e.target.value)}
                  placeholder="e.g. CaptainFlyboy"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFA] border border-[#C9C7BA] text-sm text-[#141A1F] placeholder:text-[#5E6366]/60 focus:outline-none focus:border-[#1240C7] focus:ring-1 focus:ring-[#1240C7] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-[#5E6366] mb-1">
                  World of Airports Player ID <span className="text-[#5E6366] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={woaPlayerId}
                  onChange={(e) => setWoaPlayerId(e.target.value)}
                  placeholder="e.g. WOA-94821"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFA] border border-[#C9C7BA] text-sm text-[#141A1F] placeholder:text-[#5E6366]/60 focus:outline-none focus:border-[#1240C7] focus:ring-1 focus:ring-[#1240C7] transition"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#5E6366]">
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-[#C9C7BA] text-[#1240C7] focus:ring-[#1240C7]"
                  />
                  <span>
                    I confirm that I am at least 13 years old (Discord Developer Policy compliance).
                  </span>
                </label>
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-full bg-[#1240C7] text-white font-bold text-sm hover:bg-[#0E339E] active:scale-[0.99] transition disabled:opacity-50 cursor-pointer shadow-md shadow-[#1240C7]/20 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>CONTACTING RADAR...</span>
              ) : mode === "login" ? (
                "SIGN IN TO FLIGHT DECK"
              ) : (
                "CREATE PILOT ACCOUNT"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
