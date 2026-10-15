export interface User {
  id: string;
  email: string;
  discordUsername: string;
  woaPlayerId: string | null;
  reputationScore: number;
  totalCompletedContracts: number;
  totalCancelledContracts: number;
  createdAt: string;
}

export interface PublicProfile {
  id: string;
  discordUsername: string;
  woaPlayerId: string | null;
  reputationScore: number;
  totalCompletedContracts: number;
  totalCancelledContracts: number;
  createdAt: string;
}

export type ContractType = "outgoing" | "incoming";
export type AircraftClass = "A" | "B" | "C" | "D" | "E" | "F";
export type ListingStatus =
  | "open"
  | "claimed"
  | "in_progress"
  | "dispatched"
  | "accepted"
  | "completed"
  | "cancelled"
  | "expired";

export type AirportModel = "assigned" | "flexible" | "hybrid";
export type JoinPolicy = "open" | "approval" | "invite_only";
export type AllianceRole = "owner" | "admin" | "member" | "guest";
export type MembershipStatus = "active" | "pending" | "rejected";

export interface Alliance {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  discordUrl: string | null;
  airportModel: AirportModel;
  joinPolicy: JoinPolicy;
  maxEscalationDelayHours: number;
  activeMembersCount?: number;
  createdAt: string;
  creator?: {
    id: string;
    discordUsername: string;
    reputationScore?: number;
  };
}

export interface AllianceMembership {
  id: string;
  allianceId: string;
  userId: string;
  role: AllianceRole;
  status: MembershipStatus;
  applicationNote: string | null;
  createdAt: string;
}

export interface HubCoverage {
  code: string;
  name: string;
  region: string;
  pilots: {
    id: string;
    discordUsername: string;
    woaPlayerId: string | null;
    reputationScore: number;
  }[];
  outgoingCount: number;
  incomingNeedCount: number;
  status: "covered" | "unassigned" | "bottleneck";
  hasGap: boolean;
}

export interface RouteMatrixData {
  alliance: Alliance;
  matrix: HubCoverage[];
  totalCoveredHubs: number;
  totalOfficialHubs: number;
  uncoveredGaps: string[];
}

export interface Listing {
  id: string;
  contractType: ContractType;
  status: ListingStatus;
  visibility?: "public" | "alliance_only";
  aircraftClass: AircraftClass;
  isCargo: boolean;
  originAirport: string;
  destinationAirport: string;
  notes: string | null;
  expiresAt: string;
  autoEscalateDelayHours?: number;
  escalatedAt?: string;
  createdAt: string;
  creator: {
    id: string;
    discordUsername: string;
    woaPlayerId: string | null;
    reputationScore: number;
  };
  partnerPriority?: boolean;
  alliance?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface ListingClaim {
  id: string;
  claimantId: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: string;
  claimant: {
    id: string;
    discordUsername: string;
    woaPlayerId: string | null;
    reputationScore: number;
  };
}

export interface StatusEvent {
  id: string;
  listingId: string;
  actorId: string | null;
  fromStatus: string | null;
  toStatus: string;
  eventType: string;
  notes: string | null;
  createdAt: string;
}

export interface ListingDetail {
  listing: Listing & { creatorId: string; updatedAt: string };
  claims: ListingClaim[];
  events: StatusEvent[];
}

export interface CreateListingInput {
  contract_type: ContractType;
  aircraft_class: AircraftClass;
  is_cargo: boolean;
  origin_airport: string;
  destination_airport: string;
  notes?: string;
  expires_in_hours?: number;
  alliance_id?: string;
  visibility?: "public" | "alliance_only";
  auto_escalate_delay_hours?: number;
}

export interface FilterParams {
  airport?: string;
  class?: string;
  type?: string;
  cargo?: boolean;
  status?: string;
  alliance_id?: string;
}

const TOKEN_KEY = "woa_auth_token";

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Clear invalid token
    setStoredToken(null);
    window.dispatchEvent(new CustomEvent("woa-unauthorized"));
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  get: <T>(url: string) => request<T>(url, { method: "GET" }),
  post: <T>(url: string, body?: any) =>
    request<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(url: string, body?: any) =>
    request<T>(url, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(url: string) => request<T>(url, { method: "DELETE" }),

  auth: {
    login: (credentials: { email: string; password: string }) =>
      api.post<{ user: User; token: string }>("/api/auth/login", credentials),
    register: (credentials: {
      email: string;
      password: string;
      discord_username: string;
      woa_player_id?: string;
      age_confirmed: boolean;
    }) =>
      api.post<{ user: User; token: string }>("/api/auth/register", credentials),
    me: () => api.get<{ user: User }>("/api/auth/me"),
  },

  user: {
    updateWoaId: (woaPlayerId: string) =>
      api.patch<{ user: User }>("/api/users/me", { woa_player_id: woaPlayerId }),
    getProfile: (userId: string) =>
      api.get<{ profile: PublicProfile }>(`/api/users/${userId}`),
  },

  listings: {
    list: (filters: FilterParams = {}) => {
      const params = new URLSearchParams();
      if (filters.airport) params.append("airport", filters.airport);
      if (filters.class) params.append("class", filters.class);
      if (filters.type) params.append("type", filters.type);
      if (filters.cargo !== undefined) params.append("cargo", String(filters.cargo));
      if (filters.status) params.append("status", filters.status);
      if (filters.alliance_id) params.append("alliance_id", filters.alliance_id);
      const query = params.toString();
      return api.get<{ listings: Listing[] }>(`/api/listings${query ? `?${query}` : ""}`);
    },
    get: (id: string) => api.get<ListingDetail>(`/api/listings/${id}`),
    create: (data: CreateListingInput) =>
      api.post<{ listing: Listing }>("/api/listings", data),
    claim: (id: string) =>
      api.post<{ claim: ListingClaim }>(`/api/listings/${id}/claim`, {}),
    approve: (id: string) =>
      api.post<{ message: string; listing: Listing }>(`/api/listings/${id}/approve`, {}),
    dispatch: (id: string) =>
      api.post<{ message: string; listing: Listing }>(`/api/listings/${id}/dispatch`, {}),
    accept: (id: string) =>
      api.post<{ message: string; listing: Listing }>(`/api/listings/${id}/accept`, {}),
    cancel: (id: string, reason: string) =>
      api.post<{ message: string; listing: Listing }>(`/api/listings/${id}/cancel`, { reason }),
  },

  alliances: {
    list: (filters: { model?: string; search?: string } = {}) => {
      const params = new URLSearchParams();
      if (filters.model) params.append("model", filters.model);
      if (filters.search) params.append("search", filters.search);
      const query = params.toString();
      return api.get<{ alliances: Alliance[] }>(`/api/alliances${query ? `?${query}` : ""}`);
    },
    get: (slug: string) =>
      api.get<{
        alliance: Alliance;
        activeMembersCount: number;
        userMembership: { role: AllianceRole; status: MembershipStatus } | null;
      }>(`/api/alliances/${slug}`),
    create: (data: {
      name: string;
      slug: string;
      description?: string;
      logo_url?: string;
      discord_url?: string;
      airport_model: AirportModel;
      join_policy: JoinPolicy;
      max_escalation_delay_hours?: number;
    }) => api.post<{ alliance: Alliance }>("/api/alliances", data),
    join: (slug: string, note?: string, inviteCode?: string) =>
      api.post<{ membership: AllianceMembership }>(`/api/alliances/${slug}/join`, {
        application_note: note,
        invite_code: inviteCode,
      }),
    registerGuest: (slug: string) =>
      api.post<{ membership: AllianceMembership }>(`/api/alliances/${slug}/guest`, {}),
    getMembers: (slug: string) =>
      api.get<{ members: any[] }>(`/api/alliances/${slug}/members`),
    reviewMember: (slug: string, userId: string, status: "active" | "rejected", role?: AllianceRole) =>
      api.patch<{ membership: AllianceMembership }>(`/api/alliances/${slug}/members/${userId}`, {
        status,
        role,
      }),
    assignAirport: (slug: string, airportCode: string, userId?: string) =>
      api.post<{ assignment: any }>(`/api/alliances/${slug}/airports`, {
        airport_code: airportCode,
        user_id: userId,
      }),
    removeAirport: (slug: string, airportCode: string, userId?: string) => {
      const q = userId ? `?user_id=${userId}` : "";
      return api.del<{ message: string }>(`/api/alliances/${slug}/airports/${airportCode}${q}`);
    },
    getMatrix: (slug: string) =>
      api.get<RouteMatrixData>(`/api/alliances/${slug}/matrix`),
    update: (
      slug: string,
      data: Partial<{
        name: string;
        description: string;
        logo_url: string;
        discord_url: string;
        airport_model: AirportModel;
        join_policy: JoinPolicy;
        max_escalation_delay_hours: number;
      }>
    ) => api.patch<{ alliance: Alliance }>(`/api/alliances/${slug}`, data),
  },
};

