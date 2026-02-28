import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import FarmerDashboard from "@/components/dashboards/FarmerDashboard";
import VendorDashboard from "@/components/dashboards/VendorDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import PageLayout from "@/components/PageLayout";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <PageLayout>
      <section className="py-8">
        <div className="container mx-auto px-4">
          {role === "admin" && <AdminDashboard />}
          {role === "vendor" && <VendorDashboard />}
          {(role === "farmer" || !role) && <FarmerDashboard />}
        </div>
      </section>
    </PageLayout>
  );
};

export default Dashboard;
