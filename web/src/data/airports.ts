export interface AirportHub {
  code: string;
  name: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
}

/**
 * All 18 Official Playable World of Airports (WoA) Hubs
 * Coordinates are WGS-84 decimal degrees (airport reference point).
 */
export const WOA_AIRPORTS: AirportHub[] = [
  { code: "INN", name: "Innsbruck Airport",                             country: "Austria",      region: "Europe",        lat: 47.2602,  lng:  11.3440  },
  { code: "BRI", name: "Bari-Karol Wojtyła Airport",                   country: "Italy",        region: "Europe",        lat: 41.1389,  lng:  16.7606  },
  { code: "PRG", name: "Václav Havel Airport Prague",                   country: "Czech Republic",region: "Europe",       lat: 50.1008,  lng:  14.2600  },
  { code: "IAD", name: "Washington Dulles International Airport",       country: "USA",          region: "North America", lat: 38.9531,  lng: -77.4565  },
  { code: "NGO", name: "Chubu Centrair International Airport",          country: "Japan",        region: "Asia",          lat: 34.8584,  lng: 136.8053  },
  { code: "SAN", name: "San Diego International Airport",               country: "USA",          region: "North America", lat: 32.7338,  lng: -117.1933 },
  { code: "MCT", name: "Muscat International Airport",                  country: "Oman",         region: "Middle East",   lat: 23.5933,  lng:  58.2844  },
  { code: "LEJ", name: "Leipzig-Halle International Airport",           country: "Germany",      region: "Europe",        lat: 51.4239,  lng:  12.2364  },
  { code: "SXM", name: "Princess Juliana International Airport",        country: "Sint Maarten", region: "Caribbean",     lat: 18.0410,  lng: -63.1089  },
  { code: "LHR", name: "London Heathrow International Airport",         country: "UK",           region: "Europe",        lat: 51.4700,  lng:  -0.4543  },
  { code: "SYD", name: "Sydney Kingsford Smith Airport",                country: "Australia",    region: "Oceania",       lat: -33.9461, lng: 151.1772  },
  { code: "BKK", name: "Suvarnabhumi Airport",                          country: "Thailand",     region: "Asia",          lat: 13.6900,  lng: 100.7501  },
  { code: "MSY", name: "Louis Armstrong New Orleans International Airport", country: "USA",      region: "North America", lat: 29.9934,  lng: -90.2580  },
  { code: "HKG", name: "Hong Kong International Airport",               country: "Hong Kong",    region: "Asia",          lat: 22.3080,  lng: 113.9185  },
  { code: "ZRH", name: "Zurich Airport",                                country: "Switzerland",  region: "Europe",        lat: 47.4582,  lng:   8.5555  },
  { code: "CNN", name: "Kannur International Airport",                  country: "India",        region: "Asia",          lat: 11.9174,  lng:  75.5484  },
  { code: "GRU", name: "São Paulo/Guarulhos International Airport",     country: "Brazil",       region: "South America", lat: -23.4356, lng: -46.4731  },
  { code: "SCL", name: "Arturo Merino Benítez International Airport",   country: "Chile",        region: "South America", lat: -33.3930, lng: -70.7858  },
];

export const AIRPORT_MAP = new Map<string, AirportHub>(
  WOA_AIRPORTS.map((ap) => [ap.code, ap])
);

export function getAirportLabel(code: string): string {
  const ap = AIRPORT_MAP.get(code.toUpperCase());
  if (!ap) return code;
  return `${ap.code} – ${ap.name} (${ap.country})`;
}
