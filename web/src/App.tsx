import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { AuthModal } from "./components/AuthModal";
import { OpsBackground } from "./components/OpsBackground";
import { MarketplacePage } from "./pages/MarketplacePage";
import { NewContractPage } from "./pages/NewContractPage";
import { ContractDetailPage } from "./pages/ContractDetailPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AlliancesDirectoryPage } from "./pages/AlliancesDirectoryPage";
import { AllianceDetailPage } from "./pages/AllianceDetailPage";
import { AllianceOperationsDeckPage } from "./pages/AllianceOperationsDeckPage";


const queryClient = new QueryClient();

export function App() {
  const [activeTab, setActiveTab] = useState<
    "marketplace" | "new-contract" | "dashboard" | "profile" | "alliances"
  >("marketplace");
  const [activeParam, setActiveParam] = useState<string | undefined>(undefined);

  const handleNavigate = (
    tab: "marketplace" | "new-contract" | "dashboard" | "profile" | "alliances",
    param?: string
  ) => {
    setActiveTab(tab);
    setActiveParam(param);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-[#F0EBDE] text-[#141A1F] flex flex-col font-sans selection:bg-[#1240C7] selection:text-white">
          <OpsBackground />
          <Navbar activeTab={activeTab} onNavigate={handleNavigate} />


          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === "marketplace" && (
              <MarketplacePage onNavigate={handleNavigate} />
            )}

            {activeTab === "new-contract" && (
              <NewContractPage onNavigate={handleNavigate} />
            )}

            {activeTab === "dashboard" && (
              activeParam ? (
                <ContractDetailPage contractId={activeParam} onNavigate={handleNavigate} />
              ) : (
                <DashboardPage onNavigate={handleNavigate} />
              )
            )}

            {activeTab === "profile" && (
              <ProfilePage userId={activeParam} onNavigate={handleNavigate} />
            )}

            {activeTab === "alliances" && (
              !activeParam ? (
                <AlliancesDirectoryPage onNavigate={handleNavigate} />
              ) : activeParam.endsWith("/deck") ? (
                <AllianceOperationsDeckPage
                  slug={activeParam.replace(/\/deck$/, "")}
                  onNavigate={handleNavigate}
                />
              ) : (
                <AllianceDetailPage slug={activeParam} onNavigate={handleNavigate} />
              )
            )}
          </main>

          <footer className="w-full bg-[#F0EBDE] border-t border-[#C9C7BA] py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#5E6366]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#141A1F]">WOA CONTRACT HUB</span>
                <span>•</span>
                <span>COMMUNITY FLIGHT LOGISTICS</span>
              </div>
              <p>
                NOT AFFILIATED WITH FLYBOYS GAMES. AIRPORT TELEMETRY IS MANUAL & REPUTATION-VERIFIED.
              </p>
            </div>
          </footer>

          <AuthModal />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
