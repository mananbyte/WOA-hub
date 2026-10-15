import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api, type ContractType, type AircraftClass } from "../api/client";
import { Plane, ArrowRight, ArrowLeft, CheckCircle2, Package, Clock, AlertCircle } from "lucide-react";

interface NewContractPageProps {
  onNavigate: (tab: "marketplace" | "new-contract" | "dashboard" | "profile", param?: string) => void;
}

const AIRPORTS = [
  { code: "PRG", name: "Prague (PRG)", region: "Europe" },
  { code: "INN", name: "Innsbruck (INN)", region: "Europe" },
  { code: "BRI", name: "Bari (BRI)", region: "Europe" },
  { code: "SAN", name: "San Diego (SAN)", region: "North America" },
  { code: "IAD", name: "Washington Dulles (IAD)", region: "North America" },
  { code: "MCT", name: "Muscat (MCT)", region: "Middle East" },
  { code: "NGO", name: "Nagoya (NGO)", region: "Asia" },
  { code: "LEJ", name: "Leipzig/Halle (LEJ)", region: "Europe" },
  { code: "SXM", name: "Princess Juliana (SXM)", region: "Caribbean" },
  { code: "HKG", name: "Hong Kong (HKG)", region: "Asia" },
];

const CLASSES: { code: AircraftClass; label: string; examples: string }[] = [
  { code: "A", label: "Class A (Light)", examples: "Cessna, DHC-6" },
  { code: "B", label: "Class B (Regional)", examples: "ATR-72, CRJ-700" },
  { code: "C", label: "Class C (Narrowbody)", examples: "A320, B737-800" },
  { code: "D", label: "Class D (Mid-Size)", examples: "B757, B767-300" },
  { code: "E", label: "Class E (Widebody)", examples: "A350, B777, B787" },
  { code: "F", label: "Class F (Super Heavy)", examples: "A380, AN-225" },
];

const WINDOWS = [
  { hours: 6, label: "6 Hours", desc: "Fast turnaround" },
  { hours: 12, label: "12 Hours", desc: "Standard dispatch" },
  { hours: 24, label: "24 Hours", desc: "Full day window" },
  { hours: 48, label: "48 Hours", desc: "Long-range contract" },
];

export const NewContractPage = ({ onNavigate }: NewContractPageProps) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [contractType, setContractType] = useState<ContractType>("outgoing");
  const [originAirport, setOriginAirport] = useState("PRG");
  const [destinationAirport, setDestinationAirport] = useState("IAD");
  const [aircraftClass, setAircraftClass] = useState<AircraftClass>("E");
  const [isCargo, setIsCargo] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-8 shadow-sm">
        <Plane className="w-12 h-12 text-[#1240C7] mx-auto mb-4 -rotate-45" />
        <h2 className="text-2xl font-bold font-mono text-[#141A1F]">AUTHENTICATION REQUIRED</h2>
        <p className="text-sm text-[#5E6366] mt-2 mb-6">
          You must be signed in with a verified pilot dossier to post flight contracts.
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

  const handleSubmit = async () => {
    if (originAirport === destinationAirport) {
      setError("Origin and destination airports must be different.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await api.listings.create({
        contract_type: contractType,
        aircraft_class: aircraftClass,
        is_cargo: isCargo,
        origin_airport: originAirport,
        destination_airport: destinationAirport,
        notes: notes.trim() || undefined,
        expires_in_hours: expiresInHours,
      });

      // Navigate to operations room
      onNavigate("dashboard", res.listing.id);
    } catch (err: any) {
      setError(err?.message || "Failed to create contract listing.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C9C7BA] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#F25E24]">
              FLIGHT CREATION STUDIO
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-mono tracking-tight text-[#141A1F] mt-1">
            OPEN A NEW FLIGHT CONTRACT
          </h1>
          <p className="text-sm text-[#5E6366] mt-0.5">
            Configure your route, aircraft category, and operational window.
          </p>
        </div>

        {/* Step Indicator Pills */}
        <div className="flex items-center gap-2 bg-[#FFFFFA] p-1.5 rounded-full border border-[#C9C7BA] shadow-2xs self-start">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition ${
                step === s
                  ? "bg-[#141A1F] text-white shadow-xs"
                  : step > s
                  ? "bg-[#A8C229] text-[#141A1F]"
                  : "text-[#5E6366]"
              }`}
            >
              STEP 0{s}
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-[#F25E24]/10 border border-[#F25E24]/30 text-[#F25E24] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Studio Wizard Cards */}
      <div className="bg-[#FFFFFA] rounded-3xl border border-[#C9C7BA] p-6 sm:p-8 shadow-xs">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold font-mono text-[#141A1F]">
                STEP 1: SELECT FLIGHT TYPE & ROUTE
              </h2>
              <p className="text-xs text-[#5E6366] mt-1">
                Choose whether you are sending an aircraft out or offering turnaround handling for
                incoming arrivals.
              </p>
            </div>

            {/* Flight Type Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setContractType("outgoing")}
                className={`p-5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  contractType === "outgoing"
                    ? "border-[#F25E24] bg-[#F25E24]/5 shadow-sm"
                    : "border-[#C9C7BA] hover:border-[#141A1F]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="h-6 px-3 rounded-full text-xs font-mono font-bold bg-[#F25E24] text-white inline-flex items-center">
                    OUTGOING FLIGHT
                  </span>
                  {contractType === "outgoing" && (
                    <CheckCircle2 className="w-5 h-5 text-[#F25E24]" />
                  )}
                </div>
                <p className="text-xs text-[#5E6366]">
                  You have an aircraft stationed at your airport that you want to dispatch to a
                  partner airport for handling.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setContractType("incoming")}
                className={`p-5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  contractType === "incoming"
                    ? "border-[#1240C7] bg-[#1240C7]/5 shadow-sm"
                    : "border-[#C9C7BA] hover:border-[#141A1F]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="h-6 px-3 rounded-full text-xs font-mono font-bold bg-[#1240C7] text-white inline-flex items-center">
                    INCOMING TURNAROUND
                  </span>
                  {contractType === "incoming" && (
                    <CheckCircle2 className="w-5 h-5 text-[#1240C7]" />
                  )}
                </div>
                <p className="text-xs text-[#5E6366]">
                  You have empty gate capacity at your airport and want to receive and handle planes
                  from other players.
                </p>
              </button>
            </div>

            {/* Airport Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-[#5E6366] mb-2">
                  ORIGIN AIRPORT
                </label>
                <select
                  value={originAirport}
                  onChange={(e) => setOriginAirport(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-[#F0EBDE] border border-[#C9C7BA] text-sm font-mono font-bold text-[#141A1F] focus:outline-none focus:border-[#1240C7] cursor-pointer"
                >
                  {AIRPORTS.map((ap) => (
                    <option key={ap.code} value={ap.code}>
                      {ap.code} — {ap.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-[#5E6366] mb-2">
                  DESTINATION AIRPORT
                </label>
                <select
                  value={destinationAirport}
                  onChange={(e) => setDestinationAirport(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-[#F0EBDE] border border-[#C9C7BA] text-sm font-mono font-bold text-[#141A1F] focus:outline-none focus:border-[#1240C7] cursor-pointer"
                >
                  {AIRPORTS.map((ap) => (
                    <option key={ap.code} value={ap.code}>
                      {ap.code} — {ap.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visual Route Preview Banner */}
            <div className="p-4 rounded-2xl bg-[#F0EBDE] border border-[#C9C7BA] flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#5E6366]">COORDINATED ROUTE:</span>
              <div className="flex items-center gap-3">
                <span className="text-xl font-black font-mono text-[#141A1F]">
                  {originAirport}
                </span>
                <Plane className="w-4 h-4 text-[#1240C7] -rotate-45" />
                <span className="text-xl font-black font-mono text-[#141A1F]">
                  {destinationAirport}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  if (originAirport === destinationAirport) {
                    setError("Origin and destination airports must be different.");
                    return;
                  }
                  setError(null);
                  setStep(2);
                }}
                className="h-11 px-6 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] cursor-pointer flex items-center gap-2"
              >
                <span>CONTINUE TO AIRCRAFT CLASS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold font-mono text-[#141A1F]">
                STEP 2: AIRCRAFT CLASS & FREIGHT MODE
              </h2>
              <p className="text-xs text-[#5E6366] mt-1">
                Select the aircraft category supported by your fleet and gates.
              </p>
            </div>

            {/* Class Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {CLASSES.map((cls) => {
                const isSelected = aircraftClass === cls.code;
                return (
                  <button
                    key={cls.code}
                    type="button"
                    onClick={() => setAircraftClass(cls.code)}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                      isSelected
                        ? "border-[#1240C7] bg-[#1240C7]/5 shadow-sm"
                        : "border-[#C9C7BA] hover:border-[#141A1F]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-black font-mono text-[#141A1F]">
                        {cls.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1240C7]" />}
                    </div>
                    <p className="text-[11px] text-[#5E6366] font-mono mt-1">
                      {cls.examples}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Cargo Toggle */}
            <div className="p-4 rounded-2xl bg-[#F0EBDE] border border-[#C9C7BA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#141A1F] text-white flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold font-mono text-[#141A1F]">
                    DEDICATED CARGO FREIGHTER FLIGHT
                  </p>
                  <p className="text-[11px] text-[#5E6366]">
                    Toggle ON if this contract requires dedicated cargo stands/loaders.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCargo(!isCargo)}
                className={`w-12 h-7 rounded-full p-1 transition cursor-pointer ${
                  isCargo ? "bg-[#1240C7]" : "bg-[#C9C7BA]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isCargo ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-11 px-5 rounded-full bg-[#F0EBDE] text-[#141A1F] border border-[#C9C7BA] text-xs font-mono font-bold tracking-wider hover:bg-[#FFFFFA] cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>BACK</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="h-11 px-6 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] cursor-pointer flex items-center gap-2"
              >
                <span>CONTINUE TO TIMING</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold font-mono text-[#141A1F]">
                STEP 3: OPERATIONAL WINDOW & NOTES
              </h2>
              <p className="text-xs text-[#5E6366] mt-1">
                Set how long this listing stays active for claims before automatic expiration.
              </p>
            </div>

            {/* Expiry Window Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {WINDOWS.map((win) => {
                const isSelected = expiresInHours === win.hours;
                return (
                  <button
                    key={win.hours}
                    type="button"
                    onClick={() => setExpiresInHours(win.hours)}
                    className={`p-3.5 rounded-2xl border text-center transition cursor-pointer ${
                      isSelected
                        ? "border-[#1240C7] bg-[#1240C7]/5 shadow-sm"
                        : "border-[#C9C7BA] hover:border-[#141A1F]"
                    }`}
                  >
                    <Clock className="w-4 h-4 text-[#1240C7] mx-auto mb-1" />
                    <p className="text-xs font-bold font-mono text-[#141A1F]">{win.label}</p>
                    <p className="text-[10px] text-[#5E6366]">{win.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Flight Notes */}
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-[#5E6366] mb-2">
                DISPATCH NOTES / SPECIAL REQUESTS <span className="font-normal">(OPTIONAL)</span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Ready for immediate turnaround handling on Gate 14. Livery: WoA Gold."
                className="w-full p-4 rounded-2xl bg-[#F0EBDE] border border-[#C9C7BA] text-sm text-[#141A1F] placeholder:text-[#5E6366]/60 focus:outline-none focus:border-[#1240C7]"
              />
            </div>

            {/* Summary Review */}
            <div className="p-5 rounded-2xl bg-[#E0E8FA]/60 border border-[#1240C7]/30 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase text-[#1240C7]">
                CONTRACT MANIFEST SUMMARY
              </span>
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <div>
                  <span className="text-[#5E6366]">ROUTE: </span>
                  <span className="font-bold text-[#141A1F]">
                    {originAirport} ➔ {destinationAirport}
                  </span>
                </div>
                <div>
                  <span className="text-[#5E6366]">TYPE: </span>
                  <span className="font-bold uppercase text-[#141A1F]">{contractType}</span>
                </div>
                <div>
                  <span className="text-[#5E6366]">CLASS: </span>
                  <span className="font-bold text-[#141A1F]">
                    {aircraftClass} {isCargo ? "(CARGO)" : ""}
                  </span>
                </div>
                <div>
                  <span className="text-[#5E6366]">PILOT: </span>
                  <span className="font-bold text-[#141A1F]">{user?.discordUsername}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-11 px-5 rounded-full bg-[#F0EBDE] text-[#141A1F] border border-[#C9C7BA] text-xs font-mono font-bold tracking-wider hover:bg-[#FFFFFA] cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>BACK</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="h-12 px-8 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] cursor-pointer flex items-center gap-2 shadow-md shadow-[#1240C7]/20 disabled:opacity-50"
              >
                <span>{submitting ? "PUBLISHING TO EXCHANGE..." : "SUBMIT & PUBLISH CONTRACT"}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
