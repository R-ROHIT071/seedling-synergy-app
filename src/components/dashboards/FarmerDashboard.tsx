import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingBag, Users, BookOpen, ShieldCheck, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ orders: 0, groupBuys: 0, verifications: 0 });
  const [profile, setProfile] = useState<{ full_name: string | null }>({ full_name: null });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [ordersRes, gbRes, verRes, profileRes] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("group_buy_participants").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("verifications").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle(),
      ]);
      setStats({
        orders: ordersRes.count ?? 0,
        groupBuys: gbRes.count ?? 0,
        verifications: verRes.count ?? 0,
      });
      if (profileRes.data) setProfile(profileRes.data);
    };
    fetchData();
  }, [user]);

  const cards = [
    { icon: ShoppingBag, label: "My Orders", value: stats.orders, color: "text-primary" },
    { icon: Users, label: "Group Buys", value: stats.groupBuys, color: "text-accent-foreground" },
    { icon: ShieldCheck, label: "Verifications", value: stats.verifications, color: "text-primary" },
  ];

  const quickLinks = [
    { to: "/price-prediction", icon: TrendingUp, label: "Price Prediction" },
    { to: "/group-buy", icon: Users, label: "Join Group Buy" },
    { to: "/verify", icon: ShieldCheck, label: "Upload Verification" },
    { to: "/learn", icon: BookOpen, label: "Learning Hub" },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
          Welcome, {profile.full_name || "Farmer"} 👋
        </h1>
        <p className="text-muted-foreground mb-8">Here's your farm overview</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-6 rounded-xl bg-card border border-border shadow-card">
            <card.icon className={`h-8 w-8 ${card.color} mb-3`} />
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.to} to={link.to}>
            <div className="p-4 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-shadow text-center">
              <link.icon className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">{link.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FarmerDashboard;
