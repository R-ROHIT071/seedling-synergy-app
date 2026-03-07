import AdminDashboard from "@/components/dashboards/AdminDashboard";
import FarmerDashboard from "@/components/dashboards/FarmerDashboard";
import VendorDashboard from "@/components/dashboards/VendorDashboard";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { user, role, loading, roleLoading } = useAuth();

  if (loading || roleLoading) {
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
