import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Loader2, Package, Plus, ShoppingBag, TrendingUp, Truck, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  image: string | null;
  vendor_id: string;
  created_at: string;
}

interface Order {
  id: string;
  product_id: string;
  quantity: number;
  total: number;
  status: string;
  payment_status: string | null;
  payment_method: string | null;
  transaction_id: string | null;
  shipping_address: any;
  tracking_number: string | null;
  delivery_date: string | null;
  created_at: string;
  products: { name: string; price: number; category: string; vendor_id: string };
}

interface GroupBuy {
  id: string;
  title: string;
  description: string;
  target_qty: number;
  group_price: number;
  original_price: number;
  discount: number;
  deadline: string;
  category: string;
  location: string | null;
  specs: string | null;
  current_qty: number;
  image: string | null;
  creator_id: string;
  created_at: string;
}

interface GroupBuyParticipant {
  id: string;
  group_buy_id: string;
  user_id: string;
  quantity: number;
  created_at: string;
  users?: { email: string };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const VendorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [groupBuys, setGroupBuys] = useState<GroupBuy[]>([]);
  const [groupBuyParticipants, setGroupBuyParticipants] = useState<Record<string, GroupBuyParticipant[]>>({});
  const [selectedGroupBuy, setSelectedGroupBuy] = useState<GroupBuy | null>(null);
  const [gbDetailsOpen, setGbDetailsOpen] = useState(false);
  const [editGbOpen, setEditGbOpen] = useState(false);
  const [editingGroupBuy, setEditingGroupBuy] = useState<GroupBuy | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", price: "", category: "Seeds", stock: "", description: "" });
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [gbForm, setGbForm] = useState({ 
    title: "", 
    description: "", 
    target_qty: "", 
    group_price: "",
    original_price: "",
    discount: "",
    deadline: "",
    category: "Seeds",
    location: "",
    specs: ""
  });
  const [gbOpen, setGbOpen] = useState(false);
  const [creatingGb, setCreatingGb] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [gbSelectedImage, setGbSelectedImage] = useState<File | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    const [prodRes, orderRes, gbRes] = await Promise.all([
      supabase.from("products").select("*").eq("vendor_id", user.id).order("created_at", { ascending: false }),
      supabase.from("orders").select("*, products!inner(name, price, category, vendor_id)").eq("products.vendor_id", user.id).order("created_at", { ascending: false }),
      supabase.from("group_buys").select("*").eq("creator_id", user.id).order("created_at", { ascending: false }),
    ]);
    setProducts(prodRes.data as Product[] ?? []);
    setOrders(orderRes.data as Order[] ?? []);
    setGroupBuys(gbRes.data as GroupBuy[] ?? []);

    // Fetch participants for each group buy
    if (gbRes.data) {
      const participantsData: Record<string, GroupBuyParticipant[]> = {};
      for (const gb of gbRes.data) {
        const { data: participants } = await supabase
          .from("group_buy_participants")
          .select("*")
          .eq("group_buy_id", gb.id);
        participantsData[gb.id] = (participants ?? []).map(p => ({ ...p, users: { email: "Unknown" } }));
      }
      setGroupBuyParticipants(participantsData);
    }

    setLoading(false);
  }, [user?.id]);





  useEffect(() => { 
    if (user?.id) {
      fetchData();
    }
  }, [user?.id, fetchData]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast({ title: "Error", description: "User not authenticated", variant: "destructive" });
      return;
    }
    setAdding(true);
    try {
      let imageUrl = null;
      if (selectedImage) {
        try {
          imageUrl = await uploadImage(selectedImage, 'products');
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Continue without image if upload fails
        }
      }

      const { error, data } = await supabase.from("products").insert({
        name: form.name,
        price: parseFloat(form.price),
        category: form.category,
        stock: parseInt(form.stock) || 0,
        description: form.description,
        image: imageUrl as string | null || null,
        vendor_id: user.id,
      }).select();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Product added!" });
        setForm({ name: "", price: "", category: "Seeds", stock: "", description: "" });
        setSelectedImage(null);
        setAddOpen(false);
        fetchData();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
    setAdding(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setAdding(true);
    try {
      let imageUrl = editingProduct.image as string | null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage, 'products');
      }

      const { error } = await supabase.from("products").update({
        name: form.name,
        price: parseFloat(form.price),
        category: form.category,
        stock: parseInt(form.stock) || 0,
        description: form.description,
        image: imageUrl,
      }).eq("id", editingProduct.id as string);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Product updated!" });
        setForm({ name: "", price: "", category: "Seeds", stock: "", description: "" });
        setSelectedImage(null);
        setEditOpen(false);
        setEditingProduct(null);
        fetchData();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
    setAdding(false);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      description: product.description || "",
    });
    setSelectedImage(null);
    setEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "Product deleted" });
    fetchData();
  };

  const openEditGb = (groupBuy: GroupBuy) => {
    setEditingGroupBuy(groupBuy);
    setGbForm({
      title: groupBuy.title,
      description: groupBuy.description,
      target_qty: groupBuy.target_qty.toString(),
      group_price: groupBuy.group_price.toString(),
      original_price: groupBuy.original_price.toString(),
      discount: groupBuy.discount.toString(),
      deadline: groupBuy.deadline.split('T')[0], // Format for date input
      category: groupBuy.category,
      location: groupBuy.location || "",
      specs: groupBuy.specs || ""
    });
    setGbSelectedImage(null);
    setEditGbOpen(true);
  };

  const handleEditGb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroupBuy) return;
    setCreatingGb(true);
    try {
      let imageUrl = editingGroupBuy.image;
      if (gbSelectedImage) {
        imageUrl = await uploadImage(gbSelectedImage, 'group-buys');
      }

      const { error } = await supabase.from("group_buys").update({
        title: gbForm.title,
        description: gbForm.description,
        target_qty: parseInt(gbForm.target_qty),
        group_price: parseFloat(gbForm.group_price),
        original_price: parseFloat(gbForm.original_price),
        discount: parseInt(gbForm.discount),
        deadline: gbForm.deadline,
        category: gbForm.category,
        location: gbForm.location || null,
        specs: gbForm.specs || null,
        image: imageUrl as string | null,
      }).eq("id", editingGroupBuy.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Group buy updated!" });
        setGbForm({ 
          title: "", 
          description: "", 
          target_qty: "", 
          group_price: "",
          original_price: "",
          discount: "",
          deadline: "",
          category: "Seeds",
          location: "",
          specs: ""
        });
        setGbSelectedImage(null);
        setEditGbOpen(false);
        setEditingGroupBuy(null);
        fetchData();
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setCreatingGb(false);
  };

  const handleDeleteGb = async (id: string) => {
    const { error } = await supabase.from("group_buys").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting group buy", variant: "destructive" });
    } else {
      toast({ title: "Group buy deleted" });
      fetchData();
    }
  };

  const uploadImage = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleCreateGb = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingGb(true);
    try {
      let imageUrl = null;
      if (gbSelectedImage) {
        imageUrl = await uploadImage(gbSelectedImage, 'group-buys');
      }

      const { error, data } = await supabase.from("group_buys").insert({
        title: gbForm.title,
        description: gbForm.description,
        target_qty: parseInt(gbForm.target_qty),
        group_price: parseFloat(gbForm.group_price),
        original_price: parseFloat(gbForm.original_price),
        discount: parseInt(gbForm.discount),
        deadline: gbForm.deadline,
        category: gbForm.category,
        location: gbForm.location || null,
        specs: gbForm.specs || null,
        current_qty: 0,
        image: imageUrl,
        creator_id: user?.id,
      }).select();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Group buy created!" });
        setGbForm({ 
          title: "", 
          description: "", 
          target_qty: "", 
          group_price: "",
          original_price: "",
          discount: "",
          deadline: "",
          category: "Seeds",
          location: "",
          specs: ""
        });
        setGbSelectedImage(null);
        setGbOpen(false);
        fetchData();
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setCreatingGb(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Order ${newStatus}!` });
      fetchData();
    }
  };

  const revenue = orders.filter(o => o.payment_status === "paid").reduce((s, o) => s + Number(o.total), 0);
  const lowStockProducts = products.filter(p => p.stock < 10);
  const pendingOrders = orders.filter(o => o.status === "confirmed");
  const completedOrders = orders.filter(o => o.status === "delivered");

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
          <DialogContent className="max-h-[80vh] overflow-y-auto">
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
              <div className="space-y-2"><Label>Product Image</Label>
                <Input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} />
                {selectedImage && <p className="text-sm text-muted-foreground">Selected: {selectedImage.name}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={adding}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
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
              <div className="space-y-2"><Label>Product Image</Label>
                <Input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} />
                {selectedImage && <p className="text-sm text-muted-foreground">Selected: {selectedImage.name}</p>}
                {editingProduct?.image && !selectedImage && <p className="text-sm text-muted-foreground">Current image will be kept</p>}
              </div>
              <Button type="submit" className="w-full" disabled={adding}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={editGbOpen} onOpenChange={setEditGbOpen}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Group Buy</DialogTitle></DialogHeader>
            <form onSubmit={handleEditGb} className="space-y-3">
              <div className="space-y-2"><Label>Title</Label><Input value={gbForm.title} onChange={(e) => setGbForm({ ...gbForm, title: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={gbForm.description} onChange={(e) => setGbForm({ ...gbForm, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Target Quantity</Label><Input type="number" value={gbForm.target_qty} onChange={(e) => setGbForm({ ...gbForm, target_qty: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Group Price (₹)</Label><Input type="number" step="0.01" value={gbForm.group_price} onChange={(e) => setGbForm({ ...gbForm, group_price: e.target.value })} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Original Price (₹)</Label><Input type="number" step="0.01" value={gbForm.original_price} onChange={(e) => setGbForm({ ...gbForm, original_price: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Discount (%)</Label><Input type="number" value={gbForm.discount} onChange={(e) => setGbForm({ ...gbForm, discount: e.target.value })} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Deadline</Label><Input type="date" value={gbForm.deadline} onChange={(e) => setGbForm({ ...gbForm, deadline: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Category</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={gbForm.category} onChange={(e) => setGbForm({ ...gbForm, category: e.target.value })}>
                    {["Seeds", "Fertilizer", "Equipment", "Pesticide"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2"><Label>Location</Label><Input value={gbForm.location} onChange={(e) => setGbForm({ ...gbForm, location: e.target.value })} /></div>
              <div className="space-y-2"><Label>Specifications</Label><Input value={gbForm.specs} onChange={(e) => setGbForm({ ...gbForm, specs: e.target.value })} /></div>
              <div className="space-y-2"><Label>Group Buy Image</Label>
                <Input type="file" accept="image/*" onChange={(e) => setGbSelectedImage(e.target.files?.[0] || null)} />
                {gbSelectedImage && <p className="text-sm text-muted-foreground">Selected: {gbSelectedImage.name}</p>}
                {editingGroupBuy?.image && !gbSelectedImage && <p className="text-sm text-muted-foreground">Current image will be kept</p>}
              </div>
              <Button type="submit" className="w-full" disabled={creatingGb}>
                {creatingGb ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Group Buy"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-6 rounded-xl bg-card border border-border shadow-card">
          <Package className="h-8 w-8 text-primary mb-3" />
          <p className="text-2xl font-bold text-foreground">{products.length}</p>
          <p className="text-sm text-muted-foreground">Total Products</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border shadow-card">
          <ShoppingBag className="h-8 w-8 text-primary mb-3" />
          <p className="text-2xl font-bold text-foreground">{orders.length}</p>
          <p className="text-sm text-muted-foreground">Total Orders</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border shadow-card">
          <TrendingUp className="h-8 w-8 text-primary mb-3" />
          <p className="text-2xl font-bold text-foreground">₹{revenue.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border shadow-card">
          <Users className="h-8 w-8 text-primary mb-3" />
          <p className="text-2xl font-bold text-foreground">{groupBuys.length}</p>
          <p className="text-sm text-muted-foreground">Active Group Buys</p>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="mb-8 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Low Stock Alert</h3>
          </div>
          <p className="text-sm text-yellow-700">
            {lowStockProducts.length} product(s) have low stock (less than 10): {lowStockProducts.map(p => p.name).join(", ")}
          </p>
        </div>
      )}

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="groupbuys">Group Buys ({groupBuys.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          {loading ? (
            <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No orders yet.</div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="p-4 rounded-xl bg-card border border-border shadow-card">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{o.products?.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(o.created_at), "dd MMM yyyy")} · Qty: {o.quantity} · ₹{Number(o.total).toLocaleString()}
                      </p>
                      {o.shipping_address && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Ship to: {o.shipping_address.name}, {o.shipping_address.city}
                        </p>
                      )}
                    </div>
                    <Badge className={statusColors[o.status] || ""}>{o.status}</Badge>
                    <div className="flex gap-1">
                      {o.status === "confirmed" && (
                        <Button size="sm" variant="outline" onClick={() => updateOrderStatus(o.id, "shipped")}>
                          <Truck className="h-3 w-3 mr-1" /> Ship
                        </Button>
                      )}
                      {o.status === "shipped" && (
                        <Button size="sm" variant="outline" onClick={() => updateOrderStatus(o.id, "delivered")}>
                          <CheckCircle className="h-3 w-3 mr-1" /> Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="products">
          {loading ? (
            <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No products yet. Click "Add Product" to get started.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {products.map((p) => (
                <div key={p.id} className="p-3 rounded-lg bg-card border border-border shadow-sm">
                  {p.image && <img src={p.image} alt={p.name} className="w-full h-24 object-cover rounded-md mb-2" />}
                  <div className="space-y-1">
                    <h3 className="font-medium text-foreground text-sm leading-tight">{p.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-bold text-primary">₹{p.price}</span>
                        <span className="text-xs text-muted-foreground ml-1">({p.stock})</span>
                      </div>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">{p.category}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => openEdit(p)}>Edit</Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs px-2" onClick={() => handleDelete(p.id)}>Del</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="groupbuys">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Group Buys</h3>
            <Dialog open={gbOpen} onOpenChange={setGbOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Create Group Buy</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Create Group Buy</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateGb} className="space-y-3">
                  <div className="space-y-2"><Label>Title</Label><Input value={gbForm.title} onChange={(e) => setGbForm({ ...gbForm, title: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Description</Label><Textarea value={gbForm.description} onChange={(e) => setGbForm({ ...gbForm, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Target Quantity</Label><Input type="number" value={gbForm.target_qty} onChange={(e) => setGbForm({ ...gbForm, target_qty: e.target.value })} required /></div>
                    <div className="space-y-2"><Label>Group Price (₹)</Label><Input type="number" step="0.01" value={gbForm.group_price} onChange={(e) => setGbForm({ ...gbForm, group_price: e.target.value })} required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Original Price (₹)</Label><Input type="number" step="0.01" value={gbForm.original_price} onChange={(e) => setGbForm({ ...gbForm, original_price: e.target.value })} required /></div>
                    <div className="space-y-2"><Label>Discount (%)</Label><Input type="number" value={gbForm.discount} onChange={(e) => setGbForm({ ...gbForm, discount: e.target.value })} required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Deadline</Label><Input type="date" value={gbForm.deadline} onChange={(e) => setGbForm({ ...gbForm, deadline: e.target.value })} required /></div>
                    <div className="space-y-2"><Label>Category</Label>
                      <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={gbForm.category} onChange={(e) => setGbForm({ ...gbForm, category: e.target.value })}>
                        {["Seeds", "Fertilizer", "Equipment", "Pesticide"].map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2"><Label>Location</Label><Input value={gbForm.location} onChange={(e) => setGbForm({ ...gbForm, location: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Specifications</Label><Input value={gbForm.specs} onChange={(e) => setGbForm({ ...gbForm, specs: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Group Buy Image</Label>
                    <Input type="file" accept="image/*" onChange={(e) => setGbSelectedImage(e.target.files?.[0] || null)} />
                    {gbSelectedImage && <p className="text-sm text-muted-foreground">Selected: {gbSelectedImage.name}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={creatingGb}>
                    {creatingGb ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Group Buy"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={gbDetailsOpen} onOpenChange={setGbDetailsOpen}>
              <DialogContent className="max-h-[80vh] overflow-y-auto max-w-2xl">
                <DialogHeader><DialogTitle>Group Buy Details</DialogTitle></DialogHeader>
                {selectedGroupBuy && (
                  <div className="space-y-4">
                    {selectedGroupBuy.image && (
                      <img src={selectedGroupBuy.image} alt={selectedGroupBuy.title} className="w-full h-48 object-cover rounded-md" />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold">{selectedGroupBuy.title}</h3>
                      <p className="text-muted-foreground mt-1">{selectedGroupBuy.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Pricing</p>
                        <div className="text-sm">
                          <p>Group Price: ₹{selectedGroupBuy.group_price}</p>
                          <p>Original Price: ₹{selectedGroupBuy.original_price}</p>
                          <p>Discount: {selectedGroupBuy.discount}%</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Progress</p>
                        <div className="text-sm">
                          <p>Target Quantity: {selectedGroupBuy.target_qty}</p>
                          <p>Current Members: {groupBuyParticipants[selectedGroupBuy.id]?.length || 0}</p>
                          <p>Progress: {Math.round(((groupBuyParticipants[selectedGroupBuy.id]?.length || 0) / selectedGroupBuy.target_qty) * 100)}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Additional Details</p>
                      <div className="text-sm space-y-1">
                        <p>Category: {selectedGroupBuy.category}</p>
                        <p>Location: {selectedGroupBuy.location || 'Not specified'}</p>
                        <p>Specifications: {selectedGroupBuy.specs || 'Not specified'}</p>
                        <p>Deadline: {format(new Date(selectedGroupBuy.deadline), "dd MMM yyyy")}</p>
                        <p>Created: {format(new Date(selectedGroupBuy.created_at), "dd MMM yyyy")}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Participants ({groupBuyParticipants[selectedGroupBuy.id]?.length || 0})</p>
                      {groupBuyParticipants[selectedGroupBuy.id]?.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                          {groupBuyParticipants[selectedGroupBuy.id].map((participant: any, index: number) => (
                            <div key={participant.id} className="flex justify-between items-center py-1 text-sm">
                              <span>{index + 1}. {participant.users?.email || 'Unknown user'}</span>
                              <span>Qty: {participant.quantity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No participants yet</p>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
          {loading ? (
            <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
          ) : groupBuys.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No group buys yet. Create one to get started.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {groupBuys.map((gb) => (
                <div key={gb.id} className="p-3 rounded-lg bg-card border border-border shadow-sm">
                  {gb.image && <img src={gb.image} alt={gb.title} className="w-full h-24 object-cover rounded-md mb-2" />}
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-foreground text-sm leading-tight">{gb.title}</h3>
                      <Badge variant={gb.current_qty >= gb.target_qty ? "default" : "secondary"} className="text-xs px-1 py-0">
                        {gb.current_qty >= gb.target_qty ? "Active" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{gb.description}</p>
                    <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <div>Target: {gb.target_qty}</div>
                      <div>Joined: {groupBuyParticipants[gb.id]?.length || 0}</div>
                      <div>₹{gb.group_price}</div>
                      <div>{gb.discount}% off</div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs px-2 flex-1" onClick={() => { setSelectedGroupBuy(gb); setGbDetailsOpen(true); }}>
                        Details
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => openEditGb(gb)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs px-2" onClick={() => handleDeleteGb(gb.id)}>
                        Del
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-card border border-border shadow-card">
              <h3 className="font-semibold mb-4">Order Status Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Pending</span>
                  <span>{pendingOrders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed</span>
                  <span>{completedOrders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>{orders.length}</span>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border shadow-card">
              <h3 className="font-semibold mb-4">Revenue Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Revenue</span>
                  <span>₹{revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Order Value</span>
                  <span>₹{orders.length > 0 ? (revenue / orders.length).toFixed(2) : 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conversion Rate</span>
                  <span>{orders.length > 0 ? ((completedOrders.length / orders.length) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorDashboard;
