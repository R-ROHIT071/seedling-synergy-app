import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import PricePrediction from "./pages/PricePrediction";
import GroupBuy from "./pages/GroupBuy";
import Learn from "./pages/Learn";
import Verify from "./pages/Verify";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import NotificationSettings from "./pages/NotificationSettings";
import CropHealth from "./pages/CropHealth";
import YieldPrediction from "./pages/YieldPrediction";
import SmartRecommendations from "./pages/SmartRecommendations";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import Weather from "./pages/Weather";
import NotFound from "./pages/NotFound";
import ChatBot from "./components/ChatBot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/price-prediction" element={<PricePrediction />} />
            <Route path="/group-buy" element={<GroupBuy />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/notification-settings" element={<NotificationSettings />} />
            <Route path="/crop-health" element={<CropHealth />} />
            <Route path="/yield-prediction" element={<YieldPrediction />} />
            <Route path="/smart-recommendations" element={<SmartRecommendations />} />
            <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBot />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
