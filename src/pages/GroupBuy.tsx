import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const defaultGroups = [
  { id: "1", title: "Hybrid Tomato Seeds", category: "Seeds", original_price: 850, group_price: 599, discount: 30, target_qty: 10, current_qty: 7, deadline: "2026-03-15", location: "Maharashtra, Karnataka", specs: "500g packet", image: null, creator_id: "" },
  { id: "2", title: "Organic NPK Fertilizer", category: "Fertilizer", original_price: 1200, group_price: 840, discount: 30, target_qty: 20, current_qty: 14, deadline: "2026-03-20", location: "Punjab, Haryana", specs: "25kg bag", image: null, creator_id: "" },
  { id: "3", title: "Drip Irrigation Kit", category: "Equipment", original_price: 2800, group_price: 1960, discount: 30, target_qty: 15, current_qty: 9, deadline: "2026-04-01", location: "Gujarat, Rajasthan", specs: "1 acre kit", image: null, creator_id: "" },
  { id: "4", title: "Neem Pesticide 5L", category: "Pesticide", original_price: 550, group_price: 385, discount: 30, target_qty: 30, current_qty: 22, deadline: "2026-03-10", location: "Tamil Nadu, AP", specs: "5 litre can", image: null, creator_id: "" },
  { id: "5", title: "Solar Water Pump", category: "Equipment", original_price: 15000, group_price: 10500, discount: 30, target_qty: 8, current_qty: 3, deadline: "2026-04-15", location: "UP, MP", specs: "2HP pump", image: null, creator_id: "" },
  { id: "6", title: "Bio Compost Pack", category: "Fertilizer", original_price: 400, group_price: 280, discount: 30, target_qty: 25, current_qty: 18, deadline: "2026-03-25", location: "Maharashtra", specs: "50kg pack", image: null, creator_id: "" },
];

const categories = ["All", "Seeds", "Fertilizer", "Equipment", "Pesticide"];

const GroupBuy = () => {
  const [filter, setFilter] = useState("All");
  const [groups, setGroups] = useState(defaultGroups);
  const [joining, setJoining] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchGroups = async () => {
      const { data } = await supabase.from("group_buys").select("*").order("created_at", { ascending: false });
      if (data && data.length > 0) setGroups(data);
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    // if (user) {
    //   const checkVerification = async () => {
    //     const { data } = await supabase.from("verifications").select("status").eq("user_id", user.id).eq("type", "farmer").maybeSingle();
    //     if (data && "status" in data) {
    //       setVerified(data.status === "approved");
    //     }
    //   };
    //   checkVerification();
    // }
  }, [user]);

  const filtered = filter === "All" ? groups : groups.filter((g) => g.category === filter);

  const handleJoin = async (groupId: string) => {
    if (!user) {
      toast({ title: "Please log in", description: "You need to be logged in to join a group buy.", variant: "destructive" });
      return;
    }
    if (!verified) {
      toast({ title: "Verification required", description: "Please verify your account to join group buys.", variant: "destructive" });
      return;
    }
    setJoining(groupId);
    const { error } = await supabase.from("group_buy_participants").insert({ group_buy_id: groupId, user_id: user.id, quantity: 1 });
    setJoining(null);
    if (error?.code === "23505") {
      toast({ title: "Already joined!", description: "You're already part of this group buy." });
    } else if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Joined! 🎉", description: "You've successfully joined this group buy." });
    }
  };

  return (
    <PageLayout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Save Together</span>
            <h1 className="text-3xl md:text-5xl font-bold mt-2 text-foreground">Group Buying</h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Join other farmers to buy seeds, fertilizers, and equipment at bulk discount prices.
            </p>
            {!verified && user && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">⚠️ Verification required to join group buys. <a href="/verify" className="underline">Verify now</a></p>
              </div>
            )}
          </motion.div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <Button key={cat} variant={filter === cat ? "default" : "outline"} size="sm" onClick={() => setFilter(cat)}>{cat}</Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => {
              const progress = (item.current_qty / item.target_qty) * 100;
              const daysLeft = Math.max(0, Math.ceil((new Date(item.deadline).getTime() - Date.now()) / 86400000));
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-shadow">
                  {item.image && <img src={item.image} alt={item.title} className="w-full h-32 object-cover rounded-md mb-3" />}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">{item.category}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {daysLeft}d left</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  {item.location && <p className="text-xs text-muted-foreground mb-2">{item.location}</p>}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-primary">₹{item.group_price}</span>
                    <span className="text-sm text-muted-foreground line-through">₹{item.original_price}</span>
                    <span className="text-xs text-primary font-medium">{item.discount}% off</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.current_qty}/{item.target_qty} members</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{item.specs}</span>
                    <Button size="sm" onClick={() => handleJoin(item.id)} disabled={joining === item.id}>
                      {joining === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join Now"}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default GroupBuy;
