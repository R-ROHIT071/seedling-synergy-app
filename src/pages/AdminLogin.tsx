import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Sprout } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    // Default admin credentials
    const defaultEmail = "admin@gmail.com";
    const defaultPassword = "Admin@123";

    if (email === defaultEmail && password === defaultPassword) {
      // For default admin, just try sign in
      setLoading(true);
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        toast({ 
          title: "Default Admin Not Set Up", 
          description: "The default admin account is not configured. Please create it manually in Supabase Dashboard or contact the administrator.", 
          variant: "destructive" 
        });
      } else {
        toast({ title: "Logged in!", description: "Welcome back, Admin." });
        navigate("/dashboard");
      }
    } else {
      // Regular admin login
      setLoading(true);
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Logged in!", description: "Welcome back." });
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-foreground">Krishi</span>
            <span className="text-primary">Mitra</span>
          </Link>
          <p className="text-muted-foreground mt-2">Admin Login - Authorized Personnel Only</p>
          <p className="text-xs text-muted-foreground mt-1">Default: admin@gmail.com / Admin@123</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-elevated border border-border">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Login as Admin"}
          </Button>

          <div className="text-center mt-6">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Back to User Login
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;