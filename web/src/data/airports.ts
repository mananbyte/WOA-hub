export interface AirportHub {
  code: string;
  name: string;
  country: string;
  region: string;
}

/**
 * All 18 Official Playable World of Airports (WoA) Hubs
 */
export const WOA_AIRPORTS: AirportHub[] = [
  { code: "INN", name: "Innsbruck Airport", country: "Austria", region: "Europe" },
  { code: "BRI", name: "Bari-Karol Wojtyła Airport", country: "Italy", region: "Europe" },
  { code: "PRG", name: "Václav Havel Airport Prague", country: "Czech Republic", region: "Europe" },
  { code: "IAD", name: "Washington Dulles International Airport", country: "USA", region: "North America" },
  { code: "NGO", name: "Chubu Centrair International Airport", country: "Japan", region: "Asia" },
  { code: "SAN", name: "San Diego International Airport", country: "USA", region: "North America" },
  { code: "MCT", name: "Muscat International Airport", country: "Oman", region: "Middle East" },
  { code: "LEJ", name: "Leipzig-Halle International Airport", country: "Germany", region: "Europe" },
  { code: "SXM", name: "Princess Juliana International Airport", country: "Sint Maarten", region: "Caribbean" },
  { code: "LHR", name: "London Heathrow International Airport", country: "UK", region: "Europe" },
  { code: "SYD", name: "Sydney Kingsford Smith Airport", country: "Australia", region: "Oceania" },
  { code: "BKK", name: "Suvarnabhumi Airport", country: "Thailand", region: "Asia" },
  { code: "MSY", name: "Louis Armstrong New Orleans International Airport", country: "USA", region: "North America" },
  { code: "HKG", name: "Hong Kong International Airport", country: "Hong Kong", region: "Asia" },
  { code: "ZRH", name: "Zurich Airport", country: "Switzerland", region: "Europe" },
  { code: "CNN", name: "Kannur International Airport", country: "India", region: "Asia" },
  { code: "GRU", name: "São Paulo/Guarulhos International Airport", country: "Brazil", region: "South America" },
  { code: "SCL", name: "Arturo Merino Benítez International Airport", country: "Chile", region: "South America" },
];

export const AIRPORT_MAP = new Map<string, AirportHub>(
  WOA_AIRPORTS.map((ap) => [ap.code, ap])
);

export function getAirportLabel(code: string): string {
  const ap = AIRPORT_MAP.get(code.toUpperCase());
  if (!ap) return code;
  return `${ap.code} – ${ap.name} (${ap.country})`;
}
