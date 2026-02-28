import { motion } from "framer-motion";
import { Users, Package, ShoppingBag, ShieldCheck, BookOpen, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0, products: 0, orders: 0, groupBuys: 0, verifications: 0, resources: 0,
  });
  const [recentVerifications, setRecentVerifications] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [u, p, o, g, v, r, rv] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("group_buys").select("id", { count: "exact", head: true }),
        supabase.from("verifications").select("id", { count: "exact", head: true }),
        supabase.from("learning_resources").select("id", { count: "exact", head: true }),
        supabase.from("verifications").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({
        users: u.count ?? 0, products: p.count ?? 0, orders: o.count ?? 0,
        groupBuys: g.count ?? 0, verifications: v.count ?? 0, resources: r.count ?? 0,
      });
      setRecentVerifications(rv.data ?? []);
    };
    fetch();
  }, []);

  const statCards = [
    { icon: Users, label: "Total Users", value: stats.users },
    { icon: Package, label: "Products", value: stats.products },
    { icon: ShoppingBag, label: "Orders", value: stats.orders },
    { icon: Users, label: "Group Buys", value: stats.groupBuys },
    { icon: ShieldCheck, label: "Verifications", value: stats.verifications },
    { icon: BookOpen, label: "Resources", value: stats.resources },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">Platform overview and management</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl bg-card border border-border shadow-card text-center">
            <card.icon className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-4">Recent Verifications</h2>
      {recentVerifications.length === 0 ? (
        <p className="text-muted-foreground text-sm">No verifications yet.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left text-foreground font-medium">ID</th>
                <th className="px-4 py-3 text-left text-foreground font-medium">Status</th>
                <th className="px-4 py-3 text-left text-foreground font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentVerifications.map((v) => (
                <tr key={v.id} className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{v.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${v.status === "approved" ? "bg-primary/10 text-primary" : v.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-secondary text-secondary-foreground"}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
