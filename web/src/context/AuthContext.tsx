import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type User, api, getStoredToken, setStoredToken } from "../api/client";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    woa_player_id: string;
    discord_username?: string;
    age_confirmed: boolean;
  }) => Promise<void>;
  logout: () => void;
  updateWoaId: (woaId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      const stored = getStoredToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.auth.me();
        setUser(res.user);
      } catch {
        setStoredToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();

    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener("woa-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("woa-unauthorized", handleUnauthorized);
  }, []);

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    closeAuthModal();
  };

  const register = async (data: {
    email: string;
    password: string;
    woa_player_id: string;
    discord_username?: string;
    age_confirmed: boolean;
  }) => {
    const res = await api.auth.register(data);
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    closeAuthModal();
  };

  const logout = () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  };

  const updateWoaId = async (woaPlayerId: string) => {
    const res = await api.user.updateWoaId(woaPlayerId);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        updateWoaId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
