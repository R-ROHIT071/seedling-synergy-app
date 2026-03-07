import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/hooks/useAuth";
import { ReactNode } from "react";

const PageLayout = ({ children }: { children: ReactNode }) => {
  const { role } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="pt-16">{children}</main>
      {role !== "admin" && <Footer />}
    </div>
  );
};

export default PageLayout;
