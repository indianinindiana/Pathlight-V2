import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DebtProvider } from "@/context/DebtContext";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import OnboardingClara from "./pages/OnboardingClara";
import DebtEntry from "./pages/DebtEntry";
import Dashboard from "./pages/Dashboard";
import Scenarios from "./pages/Scenarios";
import WhatIfScenarios from "./pages/WhatIfScenarios";
import ProfileSettings from "./pages/ProfileSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DebtProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/onboarding-clara" element={<OnboardingClara />} />
            <Route path="/debt-entry" element={<DebtEntry />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scenarios" element={<Scenarios />} />
            <Route path="/what-if" element={<WhatIfScenarios />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DebtProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;