import { RotateCw, Package, PlaneTakeoff, PlaneLanding } from "lucide-react";
import { type FilterParams, type AircraftClass } from "../api/client";
import { WOA_AIRPORTS } from "../data/airports";

interface FilterBarProps {
  filters: FilterParams;
  onChange: (newFilters: FilterParams) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const CLASSES: ("ALL" | AircraftClass)[] = ["ALL", "A", "B", "C", "D", "E", "F"];

export const FilterBar = ({
  filters,
  onChange,
  onRefresh,
  isLoading = false,
}: FilterBarProps) => {
  const handleAirportChange = (ap: string) => {
    onChange({
      ...filters,
      airport: ap === "ALL AIRPORTS" ? undefined : ap,
    });
  };

  const handleClassChange = (cls: "ALL" | AircraftClass) => {
    onChange({
      ...filters,
      class: cls === "ALL" ? undefined : cls,
    });
  };

  const handleTypeChange = (type: string) => {
    onChange({
      ...filters,
      type: type === "ALL" ? undefined : (type.toLowerCase() as any),
    });
  };

  const handleCargoToggle = () => {
    onChange({
      ...filters,
      cargo: filters.cargo ? undefined : true,
    });
  };

  return (
    <div className="w-full bg-[#FFFFFA] rounded-full border border-[#C9C7BA] shadow-xs px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 min-h-[57px]">
      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        {/* Airport Select */}
        <div className="flex items-center gap-1.5">
          <select
            value={filters.airport || "ALL AIRPORTS"}
            onChange={(e) => handleAirportChange(e.target.value)}
            className="h-8 px-3 rounded-full text-xs font-mono font-bold uppercase bg-[#F0EBDE] text-[#141A1F] border border-[#C9C7BA] focus:outline-none focus:border-[#1240C7] cursor-pointer"
          >
            <option value="ALL AIRPORTS">ALL AIRPORTS (18)</option>
            {WOA_AIRPORTS.map((ap) => (
              <option key={ap.code} value={ap.code}>
                {ap.code} – {ap.name}
              </option>
            ))}
          </select>

          {filters.airport && (
            <span
              title={
                filters.type === "incoming"
                  ? `Filtering incoming contracts landing at ${filters.airport} (Destination)`
                  : filters.type === "outgoing"
                  ? `Filtering outgoing contracts departing from ${filters.airport} (Origin)`
                  : `Filtering all contracts touching ${filters.airport} (Origin or Destination)`
              }
              className="h-6 px-2 rounded-full text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1 bg-[#141A1F] text-white shadow-2xs"
            >
              {filters.type === "incoming" ? (
                <>
                  <PlaneLanding className="w-3 h-3 text-[#1240C7]" />
                  DEST: {filters.airport}
                </>
              ) : filters.type === "outgoing" ? (
                <>
                  <PlaneTakeoff className="w-3 h-3 text-[#F25E24]" />
                  ORIG: {filters.airport}
                </>
              ) : (
                <>HUB: {filters.airport}</>
              )}
            </span>
          )}
        </div>

        {/* Aircraft Class Select */}
        <select
          value={filters.class || "ALL"}
          onChange={(e) => handleClassChange(e.target.value as any)}
          className="h-8 px-3 rounded-full text-xs font-mono font-bold uppercase bg-[#F0EBDE] text-[#141A1F] border border-[#C9C7BA] focus:outline-none focus:border-[#1240C7] cursor-pointer"
        >
          {CLASSES.map((cls) => (
            <option key={cls} value={cls}>
              CLASS: {cls}
            </option>
          ))}
        </select>

        {/* Flight Type Pill Toggle */}
        <div className="flex bg-[#F0EBDE] p-0.5 rounded-full border border-[#C9C7BA]">
          <button
            type="button"
            onClick={() => handleTypeChange("ALL")}
            className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition cursor-pointer ${
              !filters.type
                ? "bg-[#141A1F] text-white shadow-xs"
                : "text-[#5E6366] hover:text-[#141A1F]"
            }`}
          >
            ALL
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("OUTGOING")}
            className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition cursor-pointer ${
              filters.type === "outgoing"
                ? "bg-[#F25E24] text-white shadow-xs"
                : "text-[#5E6366] hover:text-[#141A1F]"
            }`}
          >
            OUTGOING
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("INCOMING")}
            className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition cursor-pointer ${
              filters.type === "incoming"
                ? "bg-[#1240C7] text-white shadow-xs"
                : "text-[#5E6366] hover:text-[#141A1F]"
            }`}
          >
            INCOMING
          </button>
        </div>

        {/* Cargo Toggle */}
        <button
          type="button"
          onClick={handleCargoToggle}
          className={`h-8 px-3 rounded-full text-[11px] font-mono font-bold uppercase flex items-center gap-1.5 transition border cursor-pointer shrink-0 ${
            filters.cargo
              ? "bg-[#141A1F] text-white border-[#141A1F]"
              : "bg-[#FFFFFA] text-[#5E6366] border-[#C9C7BA] hover:text-[#141A1F]"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          CARGO
        </button>
      </div>

      {/* Action / Refresh Button */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="h-6 w-px bg-[#C9C7BA] hidden sm:block shrink-0" />
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-9 px-4 rounded-full bg-[#1240C7] text-white text-xs font-mono font-bold tracking-wider hover:bg-[#0E339E] active:scale-95 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs shrink-0"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>REFRESH</span>
        </button>
      </div>
    </div>
  );
};
