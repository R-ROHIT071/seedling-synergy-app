import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Package, ShoppingBag, BarChart3, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const VendorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", category: "Seeds", stock: "", description: "" });
  const [adding, setAdding] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    const [prodRes, orderRes] = await Promise.all([
      supabase.from("products").select("*").eq("vendor_id", user.id).order("created_at", { ascending: false }),
      supabase.from("orders").select("id, product_id, products!inner(vendor_id)").eq("products.vendor_id", user.id),
    ]);
    setProducts(prodRes.data ?? []);
    setOrderCount(orderRes.data?.length ?? 0);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name || !form.price) return;
    setAdding(true);
    const { error } = await supabase.from("products").insert({
      name: form.name,
      price: parseFloat(form.price),
      category: form.category,
      stock: parseInt(form.stock) || 0,
      description: form.description,
      vendor_id: user.id,
    });
    setAdding(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product added!" });
      setForm({ name: "", price: "", category: "Seeds", stock: "", description: "" });
      setAddOpen(false);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "Product deleted" });
    fetchData();
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Manage your products and orders</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Category</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {["Seeds", "Fertilizer", "Equipment", "Pesticide"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={adding}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-xl bg-card border border-border shadow-card">
          <Package className="h-8 w-8 text-primary mb-3" />
          <p className="text-2xl font-bold text-foreground">{products.length}</p>
          <p className="text-sm text-muted-foreground">Products</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border shadow-card">
          <ShoppingBag className="h-8 w-8 text-primary mb-3" />
          <p className="text-2xl font-bold text-foreground">{orderCount}</p>
          <p className="text-sm text-muted-foreground">Orders</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border shadow-card">
          <BarChart3 className="h-8 w-8 text-primary mb-3" />
          <p className="text-2xl font-bold text-foreground">₹{products.reduce((s, p) => s + (p.price * p.stock), 0).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Inventory Value</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-4">Your Products</h2>
      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No products yet. Click "Add Product" to get started.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-card border border-border shadow-card">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-foreground">{p.name}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">{p.category}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{p.description}</p>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-bold text-primary">₹{p.price}</span>
                  <span className="text-xs text-muted-foreground ml-2">Stock: {p.stock}</span>
                </div>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
