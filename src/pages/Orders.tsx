import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { Loader2, Package, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

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
  product: { name: string; price: number; category: string };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("*, products(name, price, category)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const mapped = (data ?? []).map((o: any) => ({
      ...o,
      product: o.products,
    }));
    setOrders(mapped);
    setLoading(false);
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <PageLayout>
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Orders</h1>
              <p className="text-muted-foreground">Track your purchases and order history</p>
            </div>
            <Link to="/marketplace"><Button variant="outline">Continue Shopping</Button></Link>
          </div>

          {loading ? (
            <div className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-4">No orders yet</p>
              <Link to="/marketplace"><Button>Start Shopping</Button></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl bg-card border border-border shadow-card overflow-hidden"
                >
                  <button
                    className="w-full p-4 flex items-center gap-4 text-left hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{order.product.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), "dd MMM yyyy, hh:mm a")} · Qty: {order.quantity}
                      </p>
                    </div>
                    <Badge className={statusColors[order.status] || "bg-secondary text-secondary-foreground"}>
                      {order.status}
                    </Badge>
                    <span className="font-bold text-foreground">₹{order.total.toLocaleString()}</span>
                    {expandedOrder === order.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>

                  <AnimatePresence>
                    {expandedOrder === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0 border-t border-border">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Payment</p>
                              <p className="font-medium text-foreground capitalize">{order.payment_method || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Payment Status</p>
                              <p className="font-medium text-foreground capitalize">{order.payment_status || "pending"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Transaction ID</p>
                              <p className="font-medium text-foreground text-xs">{order.transaction_id || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Tracking</p>
                              <p className="font-medium text-foreground">{order.tracking_number || "Not shipped yet"}</p>
                            </div>
                          </div>
                          {order.shipping_address && (
                            <div className="text-sm">
                              <p className="text-muted-foreground mb-1">Shipping Address</p>
                              <p className="text-foreground">
                                {order.shipping_address.name}, {order.shipping_address.street}, {order.shipping_address.city}{order.shipping_address.state ? `, ${order.shipping_address.state}` : ""} {order.shipping_address.pincode}
                              </p>
                              {order.shipping_address.phone && <p className="text-muted-foreground">Phone: {order.shipping_address.phone}</p>}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Orders;
