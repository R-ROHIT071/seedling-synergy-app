import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, BookOpen, Check, Eye, Package, Settings, ShieldCheck, ShoppingBag, Trash2, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

const AdminDashboard = () => {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({
    users: 0, products: 0, orders: 0, groupBuys: 0, verifications: 0, resources: 0,
  });
  const [recentVerifications, setRecentVerifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [u, p, o, g, v, r, rv, us, pr, ve, ord] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("products").select("id", { count: "exact", head: true }),
          supabase.from("orders").select("id", { count: "exact", head: true }),
          supabase.from("group_buys").select("id", { count: "exact", head: true }),
          supabase.from("verifications").select("id", { count: "exact", head: true }),
          supabase.from("learning_resources").select("id", { count: "exact", head: true }),
          supabase.from("verifications").select("*").order("created_at", { ascending: false }).limit(5),
          supabase.from("profiles").select("*, user_roles(role)").order("created_at", { ascending: false }).limit(20),
          supabase.from("products").select("*").order("created_at", { ascending: false }).limit(20),
          supabase.from("verifications").select("*").order("created_at", { ascending: false }).limit(20),
          supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(20),
        ]);
        setStats({
          users: u.count ?? 0, products: p.count ?? 0, orders: o.count ?? 0,
          groupBuys: g.count ?? 0, verifications: v.count ?? 0, resources: r.count ?? 0,
        });
        setRecentVerifications(rv.data ?? []);
        setUsers(us.data ?? []);
        setProducts(pr.data ?? []);
        setVerifications(ve.data ?? []);
        setOrders(ord.data ?? []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetch();
  }, []);

  const handleVerification = async (id: string, status: string) => {
    const { error } = await supabase.from("verifications").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to update verification", variant: "destructive" });
    } else {
      setVerifications(verifications.map(v => v.id === id ? { ...v, status } : v));
      toast({ title: "Success", description: "Verification updated" });
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("user_roles").upsert({ user_id: userId, role: newRole });
    if (error) {
      toast({ title: "Error", description: "Failed to update user role", variant: "destructive" });
    } else {
      setUsers(users.map(u => u.id === userId ? { ...u, user_roles: { role: newRole } } : u));
      toast({ title: "Success", description: "User role updated" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    } else {
      setUsers(users.filter(u => u.id !== userId));
      toast({ title: "Success", description: "User deleted" });
    }
  };

  const handleProductStatusChange = async (productId: string, status: string) => {
    const { error } = await supabase.from("products").update({ status }).eq("id", productId);
    if (error) {
      toast({ title: "Error", description: "Failed to update product status", variant: "destructive" });
    } else {
      setProducts(products.map(p => p.id === productId ? { ...p, status } : p));
      toast({ title: "Success", description: "Product status updated" });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    } else {
      setProducts(products.filter(p => p.id !== productId));
      toast({ title: "Success", description: "Product deleted" });
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      toast({ title: "Error", description: "Failed to update order status", variant: "destructive" });
    } else {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      toast({ title: "Success", description: "Order status updated" });
    }
  };

  const statCards = [
    { icon: Users, label: "Total Users", value: stats.users },
    { icon: Package, label: "Products", value: stats.products },
    { icon: ShoppingBag, label: "Orders", value: stats.orders },
    { icon: Users, label: "Group Buys", value: stats.groupBuys },
    { icon: ShieldCheck, label: "Verifications", value: stats.verifications },
    { icon: BookOpen, label: "Resources", value: stats.resources },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users, products, and platform operations</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <p className="font-semibold">{user?.email}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statCards.map((card, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <div className="p-2 bg-primary/10 rounded-md">
                  <card.icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Management Tabs */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Platform Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="verifications" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="verifications" className="flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verifications</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Products</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center space-x-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Orders</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="verifications" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Pending Verifications</h3>
                  <Badge variant="secondary">{verifications.filter(v => v.status === 'pending').length} pending</Badge>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">User</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verifications.map((v) => (
                        <TableRow key={v.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{v.user_id}</TableCell>
                          <TableCell>{v.verification_type}</TableCell>
                          <TableCell>
                            <Badge variant={v.status === 'approved' ? 'default' : v.status === 'rejected' ? 'destructive' : 'secondary'}>
                              {v.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleVerification(v.id, 'approved')} className="text-green-600 hover:text-green-700">
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleVerification(v.id, 'rejected')} className="text-red-600 hover:text-red-700">
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">User Management</h3>
                  <Badge variant="secondary">{users.length} total users</Badge>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{u.email}</TableCell>
                          <TableCell>{u.full_name}</TableCell>
                          <TableCell>
                            <Badge variant={u.user_roles?.role === 'admin' ? 'default' : u.user_roles?.role === 'vendor' ? 'secondary' : 'outline'}>
                              {u.user_roles?.role || 'none'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <select 
                                value={u.user_roles?.role || ''} 
                                onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                                className="border rounded px-2 py-1 text-sm"
                              >
                                <option value="">None</option>
                                <option value="farmer">Farmer</option>
                                <option value="vendor">Vendor</option>
                                <option value="admin">Admin</option>
                              </select>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="products" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Product Management</h3>
                  <Badge variant="secondary">{products.length} total products</Badge>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Price</TableHead>
                        <TableHead className="font-semibold">Vendor</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((p) => (
                        <TableRow key={p.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>${p.price}</TableCell>
                          <TableCell>{p.vendor_id}</TableCell>
                          <TableCell>
                            <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>
                              {p.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <select 
                                value={p.status} 
                                onChange={(e) => handleProductStatusChange(p.id, e.target.value)}
                                className="border rounded px-2 py-1 text-sm"
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                              </select>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(p.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Order Management</h3>
                  <Badge variant="secondary">{orders.length} total orders</Badge>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Order ID</TableHead>
                        <TableHead className="font-semibold">User</TableHead>
                        <TableHead className="font-semibold">Total</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((o) => (
                        <TableRow key={o.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium font-mono text-sm">{o.id.slice(0, 8)}...</TableCell>
                          <TableCell>{o.user_id.slice(0, 8)}...</TableCell>
                          <TableCell className="font-semibold">${o.total_amount}</TableCell>
                          <TableCell>
                            <Badge variant={o.status === 'completed' ? 'default' : o.status === 'cancelled' ? 'destructive' : 'secondary'}>
                              {o.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <select 
                                value={o.status} 
                                onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                                className="border rounded px-2 py-1 text-sm"
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
