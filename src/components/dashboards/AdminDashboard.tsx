import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, BookOpen, Check, Edit, Eye, FileText, Package, Plus, RefreshCw, Settings, ShieldCheck, ShoppingBag, Trash2, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, groupBuys: 0, verifications: 0, resources: 0 });

  // Editing states
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100),
      ]);
      setStats({
        users: u.count ?? 0, products: p.count ?? 0, orders: o.count ?? 0,
        groupBuys: g.count ?? 0, verifications: v.count ?? 0, resources: r.count ?? 0,
      });
      setUsers(us.data ?? []);
      setProducts(pr.data ?? []);
      setVerifications(ve.data ?? []);
      setOrders(ord.data ?? []);
      setAdminLogs([]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleVerification = async (id: string, status: string) => {
    const verification = verifications.find(v => v.id === id);
    const { error } = await supabase.from("verifications").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to update verification", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Verification updated" });
      await logAction('update', 'verification', id, { status: verification?.status }, { status }, verification?.user_id);
      fetchData();
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    const user = users.find(u => u.id === userId);
    const oldRole = user?.user_roles?.role;
    const { error } = await supabase.from("user_roles").upsert({ user_id: userId, role: newRole as "farmer" | "vendor" | "admin" });
    if (error) {
      toast({ title: "Error", description: "Failed to update user role", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "User role updated" });
      await logAction('update', 'user_role', userId, { role: oldRole }, { role: newRole }, userId);
      fetchData();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const user = users.find(u => u.id === userId);
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "User deleted" });
      await logAction('delete', 'user', userId, user, null, userId);
      fetchData();
    }
  };

  const handleProductStatusChange = async (productId: string, status: string) => {
    const product = products.find(p => p.id === productId);
    // Status field not available in products schema, skipping update
    toast({ title: "Info", description: "Product status update not supported", variant: "default" });
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const product = products.find(p => p.id === productId);
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Product deleted" });
      await logAction('delete', 'product', productId, product, null, product?.vendor_id);
      fetchData();
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    const user = users.find(u => u.id === userId);
    const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
    if (error) {
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "User updated" });
      await logAction('update', 'user', userId, user, updates, userId);
      setEditingUser(null);
      fetchData();
    }
  };

  const handleUpdateProduct = async (productId: string, updates: any) => {
    const product = products.find(p => p.id === productId);
    const { error } = await supabase.from("products").update(updates).eq("id", productId);
    if (error) {
      toast({ title: "Error", description: "Failed to update product", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Product updated" });
      await logAction('update', 'product', productId, product, updates, product?.vendor_id);
      setEditingProduct(null);
      fetchData();
    }
  };

  const handleUpdateOrder = async (orderId: string, updates: any) => {
    const order = orders.find(o => o.id === orderId);
    const { error } = await supabase.from("orders").update(updates).eq("id", orderId);
    if (error) {
      toast({ title: "Error", description: "Failed to update order", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Order updated" });
      await logAction('update', 'order', orderId, order, updates, order?.user_id);
      setEditingOrder(null);
      fetchData();
    }
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Order status updated to ${newStatus}` });
      await logAction('update', 'order', orderId, { status: order.status }, { status: newStatus }, order.user_id);
      fetchData();
    }
  };

  const handleCreateUser = async (userData: any) => {
    // Note: Creating users might require auth admin functions
    toast({ title: "Info", description: "User creation not implemented yet", variant: "default" });
  };

  const handleCreateProduct = async (productData: any) => {
    const { error, data } = await supabase.from("products").insert(productData).select();
    if (error) {
      toast({ title: "Error", description: "Failed to create product", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Product created" });
      await logAction('create', 'product', data?.[0]?.id, null, productData, productData.vendor_id);
      setCreatingProduct(false);
      fetchData();
    }
  };

  const handleCreateOrder = async (orderData: any) => {
    const { error, data } = await supabase.from("orders").insert(orderData).select();
    if (error) {
      toast({ title: "Error", description: "Failed to create order", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Order created" });
      await logAction('create', 'order', data?.[0]?.id, null, orderData, orderData.user_id);
      setCreatingOrder(false);
      fetchData();
    }
  };

  const logAction = async (actionType: string, entityType: string, entityId?: string, oldValues?: any, newValues?: any, affectedUserId?: string) => {
    try {
      // Admin logs table not yet implemented in database
      console.log("Action logged:", {
        user_id: affectedUserId || null,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId || null,
        old_values: oldValues || null,
        new_values: newValues || null,
        performed_by: user?.id,
        metadata: {
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
        }
      });
    } catch (error) {
      console.error("Error logging action:", error);
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
              <TabsList className="grid w-full grid-cols-5 mb-6">
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
                <TabsTrigger value="logs" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Activity Logs</span>
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
                  <div className="flex items-center space-x-2">
                    <Button size="sm" onClick={() => setCreatingUser(true)} className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Create User</span>
                    </Button>
                    <Button size="sm" variant="outline" onClick={fetchData}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Badge variant="secondary">{users.length} total users</Badge>
                  </div>
                </div>
                {creatingUser && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Create New User</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="newUserEmail">Email</Label>
                          <Input id="newUserEmail" type="email" placeholder="user@example.com" />
                        </div>
                        <div>
                          <Label htmlFor="newUserName">Full Name</Label>
                          <Input id="newUserName" placeholder="Full Name" />
                        </div>
                        <div>
                          <Label htmlFor="newUserRole">Role</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="farmer">Farmer</SelectItem>
                              <SelectItem value="vendor">Vendor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={() => handleCreateUser({})}>Create</Button>
                        <Button variant="outline" onClick={() => setCreatingUser(false)}>Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {editingUser && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit User</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editUserEmail">Email</Label>
                          <Input id="editUserEmail" type="email" defaultValue={editingUser.email} />
                        </div>
                        <div>
                          <Label htmlFor="editUserName">Full Name</Label>
                          <Input id="editUserName" defaultValue={editingUser.full_name} />
                        </div>
                        <div>
                          <Label htmlFor="editUserAvatar">Avatar URL</Label>
                          <Input id="editUserAvatar" defaultValue={editingUser.avatar_url} />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={() => handleUpdateUser(editingUser.id, {
                          full_name: (document.getElementById('editUserName') as HTMLInputElement)?.value,
                          avatar_url: (document.getElementById('editUserAvatar') as HTMLInputElement)?.value,
                        })}>Update</Button>
                        <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                              <Button size="sm" variant="outline" onClick={() => setEditingUser(u)}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
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
                  <div className="flex items-center space-x-2">
                    <Button size="sm" onClick={() => setCreatingProduct(true)} className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Create Product</span>
                    </Button>
                    <Button size="sm" variant="outline" onClick={fetchData}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Badge variant="secondary">{products.length} total products</Badge>
                  </div>
                </div>
                {creatingProduct && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Create New Product</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="newProductName">Name</Label>
                          <Input id="newProductName" placeholder="Product Name" />
                        </div>
                        <div>
                          <Label htmlFor="newProductPrice">Price</Label>
                          <Input id="newProductPrice" type="number" placeholder="0.00" />
                        </div>
                        <div>
                          <Label htmlFor="newProductDescription">Description</Label>
                          <Textarea id="newProductDescription" placeholder="Product description" />
                        </div>
                        <div>
                          <Label htmlFor="newProductCategory">Category</Label>
                          <Input id="newProductCategory" placeholder="Category" />
                        </div>
                        <div>
                          <Label htmlFor="newProductVendor">Vendor ID</Label>
                          <Input id="newProductVendor" placeholder="Vendor ID" />
                        </div>
                        <div>
                          <Label htmlFor="newProductStock">Stock</Label>
                          <Input id="newProductStock" type="number" placeholder="0" />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={() => handleCreateProduct({
                          name: (document.getElementById('newProductName') as HTMLInputElement)?.value,
                          price: parseFloat((document.getElementById('newProductPrice') as HTMLInputElement)?.value || '0'),
                          description: (document.getElementById('newProductDescription') as HTMLTextAreaElement)?.value,
                          category: (document.getElementById('newProductCategory') as HTMLInputElement)?.value,
                          vendor_id: (document.getElementById('newProductVendor') as HTMLInputElement)?.value,
                          stock_quantity: parseInt((document.getElementById('newProductStock') as HTMLInputElement)?.value || '0'),
                          status: 'active'
                        })}>Create</Button>
                        <Button variant="outline" onClick={() => setCreatingProduct(false)}>Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {editingProduct && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit Product</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editProductName">Name</Label>
                          <Input id="editProductName" defaultValue={editingProduct.name} />
                        </div>
                        <div>
                          <Label htmlFor="editProductPrice">Price</Label>
                          <Input id="editProductPrice" type="number" defaultValue={editingProduct.price} />
                        </div>
                        <div>
                          <Label htmlFor="editProductDescription">Description</Label>
                          <Textarea id="editProductDescription" defaultValue={editingProduct.description} />
                        </div>
                        <div>
                          <Label htmlFor="editProductCategory">Category</Label>
                          <Input id="editProductCategory" defaultValue={editingProduct.category} />
                        </div>
                        <div>
                          <Label htmlFor="editProductStock">Stock</Label>
                          <Input id="editProductStock" type="number" defaultValue={editingProduct.stock} />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={() => handleUpdateProduct(editingProduct.id, {
                          name: (document.getElementById('editProductName') as HTMLInputElement)?.value,
                          price: parseFloat((document.getElementById('editProductPrice') as HTMLInputElement)?.value || '0'),
                          description: (document.getElementById('editProductDescription') as HTMLTextAreaElement)?.value,
                          category: (document.getElementById('editProductCategory') as HTMLInputElement)?.value,
                          stock: parseInt((document.getElementById('editProductStock') as HTMLInputElement)?.value || '0'),
                        })}>Update</Button>
                        <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                              <Button size="sm" variant="outline" onClick={() => setEditingProduct(p)}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
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
                  <div className="flex items-center space-x-2">
                    <Button size="sm" onClick={() => setCreatingOrder(true)} className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Create Order</span>
                    </Button>
                    <Button size="sm" variant="outline" onClick={fetchData}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Badge variant="secondary">{orders.length} total orders</Badge>
                  </div>
                </div>
                {creatingOrder && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Create New Order</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="newOrderUser">User ID</Label>
                          <Input id="newOrderUser" placeholder="User ID" />
                        </div>
                        <div>
                          <Label htmlFor="newOrderProduct">Product ID</Label>
                          <Input id="newOrderProduct" placeholder="Product ID" />
                        </div>
                        <div>
                          <Label htmlFor="newOrderQuantity">Quantity</Label>
                          <Input id="newOrderQuantity" type="number" placeholder="1" />
                        </div>
                        <div>
                          <Label htmlFor="newOrderTotal">Total</Label>
                          <Input id="newOrderTotal" type="number" placeholder="0.00" />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={() => handleCreateOrder({
                          user_id: (document.getElementById('newOrderUser') as HTMLInputElement)?.value,
                          product_id: (document.getElementById('newOrderProduct') as HTMLInputElement)?.value,
                          quantity: parseInt((document.getElementById('newOrderQuantity') as HTMLInputElement)?.value || '1'),
                          total: parseFloat((document.getElementById('newOrderTotal') as HTMLInputElement)?.value || '0'),
                          status: 'pending'
                        })}>Create</Button>
                        <Button variant="outline" onClick={() => setCreatingOrder(false)}>Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {editingOrder && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit Order</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editOrderProduct">Product ID</Label>
                          <Input id="editOrderProduct" defaultValue={editingOrder.product_id} />
                        </div>
                        <div>
                          <Label htmlFor="editOrderQuantity">Quantity</Label>
                          <Input id="editOrderQuantity" type="number" defaultValue={editingOrder.quantity} />
                        </div>
                        <div>
                          <Label htmlFor="editOrderTotal">Total Amount</Label>
                          <Input id="editOrderTotal" type="number" defaultValue={editingOrder.total} />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={() => handleUpdateOrder(editingOrder.id, {
                          product_id: (document.getElementById('editOrderProduct') as HTMLInputElement)?.value,
                          quantity: parseInt((document.getElementById('editOrderQuantity') as HTMLInputElement)?.value || '1'),
                          total: parseFloat((document.getElementById('editOrderTotal') as HTMLInputElement)?.value || '0'),
                        })}>Update</Button>
                        <Button variant="outline" onClick={() => setEditingOrder(null)}>Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                          <TableCell className="font-semibold">${o.total}</TableCell>
                          <TableCell>
                            <Badge variant={o.status === 'completed' ? 'default' : o.status === 'cancelled' ? 'destructive' : 'secondary'}>
                              {o.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => setEditingOrder(o)}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
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

              <TabsContent value="logs" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Activity Logs</h3>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={fetchData}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Badge variant="secondary">{adminLogs.length} total logs</Badge>
                  </div>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Timestamp</TableHead>
                        <TableHead className="font-semibold">Action</TableHead>
                        <TableHead className="font-semibold">Entity</TableHead>
                        <TableHead className="font-semibold">User</TableHead>
                        <TableHead className="font-semibold">Performed By</TableHead>
                        <TableHead className="font-semibold">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminLogs.map((log: any) => (
                        <TableRow key={log.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium text-sm">
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              log.action_type === 'create' ? 'default' :
                              log.action_type === 'update' ? 'secondary' :
                              log.action_type === 'delete' ? 'destructive' : 'outline'
                            }>
                              {log.action_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)}...)` : ''}
                          </TableCell>
                          <TableCell>
                            {log.profiles?.full_name || log.user_id?.slice(0, 8) || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {log.performed_by === user?.id ? 'You' : 'Admin'}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {log.new_values ? JSON.stringify(log.new_values).slice(0, 50) + '...' : 'N/A'}
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
