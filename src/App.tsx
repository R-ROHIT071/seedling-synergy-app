import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatBot from "./components/ChatBot";
import ProtectedRoute from "./components/ProtectedRoute";

const AdvancedAnalytics = lazy(() => import("./pages/AdvancedAnalytics"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Cart = lazy(() => import("./pages/Cart"));
const Community = lazy(() => import("./pages/Community"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FAQ = lazy(() => import("./pages/FAQ"));
const GroupBuy = lazy(() => import("./pages/GroupBuy"));
const Index = lazy(() => import("./pages/Index"));
const Learn = lazy(() => import("./pages/Learn"));
const Login = lazy(() => import("./pages/Login"));
const MandiPrices = lazy(() => import("./pages/MandiPrices"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const Orders = lazy(() => import("./pages/Orders"));
const PricePrediction = lazy(() => import("./pages/PricePrediction"));
const Signup = lazy(() => import("./pages/Signup"));
const SmartRecommendations = lazy(() => import("./pages/SmartRecommendations"));
const Verify = lazy(() => import("./pages/Verify"));
const VendorVerify = lazy(() => import("./pages/VendorVerify"));
const Weather = lazy(() => import("./pages/Weather"));
const YieldPrediction = lazy(() => import("./pages/YieldPrediction"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div>Loading...</div></div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/price-prediction" element={<PricePrediction />} />
              <Route path="/group-buy" element={<GroupBuy />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/vendor-verify" element={<ProtectedRoute allowedRoles={["vendor"]}><VendorVerify /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/mandi-prices" element={<MandiPrices />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/community" element={<Community />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/notification-settings" element={<NotificationSettings />} />
              <Route path="/yield-prediction" element={<YieldPrediction />} />
              <Route path="/smart-recommendations" element={<SmartRecommendations />} />
              <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <ChatBot />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
