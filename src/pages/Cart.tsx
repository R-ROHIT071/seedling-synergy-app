import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    image: string | null;
  };
}

const Cart = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState({ name: "", phone: "", street: "", city: "", state: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const logAction = async (actionType: string, entityType: string, entityId?: string, oldValues?: Record<string, unknown>, newValues?: Record<string, unknown>) => {
    try {
      await supabase.from("admin_logs").insert({
        user_id: user?.id,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId || null,
        old_values: oldValues || null,
        new_values: newValues || null,
        performed_by: user?.id,
        metadata: {
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          role: 'farmer' // Assuming cart is used by farmers
        }
      });
    } catch (error) {
      console.error("Error logging action:", error);
    }
  };

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity, products(id, name, price, stock, category, image)")
      .eq("user_id", user.id);

    const mapped = (data ?? []).map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      product: item.products,
    }));
    setItems(mapped);
    setLoading(false);
  };

  const updateQty = async (id: string, qty: number) => {
    if (qty < 1) return removeItem(id);
    await supabase.from("cart_items").update({ quantity: qty }).eq("id", id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  };

  const removeItem = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Item removed" });
  };

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!user || !address.name || !address.phone || !address.street || !address.city) {
      toast({ title: "Please fill shipping details", variant: "destructive" });
      return;
    }
    setCheckingOut(true);

    // Create orders for each cart item
    const txnId = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    for (const item of items) {
      const { data } = await supabase.from("orders").insert({
        user_id: user.id,
        product_id: item.product_id,
        quantity: item.quantity,
        total: item.product.price * item.quantity,
        status: "confirmed",
        payment_status: "paid",
        payment_method: paymentMethod,
        transaction_id: txnId,
        shipping_address: address,
      }).select();

      // Log the order creation
      await logAction('create', 'order', data?.[0]?.id, null, {
        user_id: user.id,
        product_id: item.product_id,
        quantity: item.quantity,
        total: item.product.price * item.quantity,
        status: "confirmed",
        payment_status: "paid",
        payment_method: paymentMethod,
        transaction_id: txnId,
        shipping_address: address,
      });
    }

    // Clear cart
    await supabase.from("cart_items").delete().eq("user_id", user.id);

    // Create notification
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "order",
      title: "Order Placed Successfully!",
      message: `Your order of ₹${total.toLocaleString()} has been confirmed. Transaction: ${txnId}`,
      data: { transaction_id: txnId, total },
    });

    setCheckingOut(false);
    toast({ title: "Order placed successfully!", description: `Transaction ID: ${txnId}` });
    navigate("/orders");
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <PageLayout>
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/marketplace">
              <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {showCheckout ? "Checkout" : "Shopping Cart"}
            </h1>
          </div>

          {loading ? (
            <div className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-4">Your cart is empty</p>
              <Link to="/marketplace"><Button>Browse Products</Button></Link>
            </div>
          ) : !showCheckout ? (
            <div className="space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border shadow-card"
                >
                  <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover rounded-lg" />
                    ) : (
                      <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.product.category} · ₹{item.product.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQty(item.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQty(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="font-bold text-foreground w-24 text-right">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}

              <div className="p-6 rounded-xl bg-card border border-border shadow-card">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-foreground">Total ({items.length} items)</span>
                  <span className="text-2xl font-bold text-primary">₹{total.toLocaleString()}</span>
                </div>
                <Button className="w-full" size="lg" onClick={() => setShowCheckout(true)}>
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-card border border-border shadow-card space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Shipping Address</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Full Name</Label><Input value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} required /></div>
                    <div className="space-y-2"><Label>Phone</Label><Input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} required /></div>
                  </div>
                  <div className="space-y-2"><Label>Street Address</Label><Input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} required /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>City</Label><Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required /></div>
                    <div className="space-y-2"><Label>State</Label><Input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} /></div>
                    <div className="space-y-2"><Label>PIN Code</Label><Input value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} /></div>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border shadow-card space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Payment Method</h2>
                  {["upi", "card", "netbanking", "cod"].map((method) => (
                    <label key={method} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${paymentMethod === method ? "border-primary bg-secondary" : "border-border hover:bg-muted"}`}>
                      <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-primary" />
                      <span className="text-sm font-medium text-foreground capitalize">
                        {method === "upi" ? "UPI" : method === "card" ? "Credit/Debit Card" : method === "netbanking" ? "Net Banking" : "Cash on Delivery"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="p-6 rounded-xl bg-card border border-border shadow-card sticky top-24 space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.product.name} × {item.quantity}</span>
                      <span className="text-foreground font-medium">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Subtotal</span><span>₹{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Shipping</span><span className="text-primary">Free</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
                      <span>Total</span><span className="text-primary">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button className="w-full" size="lg" onClick={handleCheckout} disabled={checkingOut}>
                    {checkingOut ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {checkingOut ? "Processing..." : `Pay ₹${total.toLocaleString()}`}
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => setShowCheckout(false)}>
                    Back to Cart
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Cart;
