import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Sprout } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showResendButton, setShowResendButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, confirmEmailForDev, forceConfirmEmail, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
        duration: 8000
      });

      // If email confirmation error, show resend button
      if (error.message.includes('confirmation link')) {
        setShowResendButton(true);
      }
    } else {
      toast({ title: "Welcome back!" });
      // Role-based redirect will happen after role is fetched
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({ title: "Error", description: "Please enter your email address first.", variant: "destructive" });
      return;
    }

    const result = await confirmEmailForDev(email);
    if (result.success) {
      toast({
        title: "Confirmation email sent!",
        description: result.message,
        duration: 5000
      });
    } else {
      toast({
        title: "Failed to resend",
        description: result.error || "Could not resend confirmation email.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-foreground">Krishi</span>
            <span className="text-primary">Mitra</span>
          </Link>
          <p className="text-muted-foreground mt-2">Welcome back! Sign in to your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-elevated border border-border">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
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
            <Button className="w-full" size="lg" type="submit" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : "Sign In"}
            </Button>

            {showResendButton && (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendConfirmation}
                  disabled={loading}
                >
                  Resend Confirmation Email
                </Button>

                {import.meta.env.DEV && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={async () => {
                      const result = await forceConfirmEmail(email);
                      toast({
                        title: result.success ? "Development Helper" : "Error",
                        description: result.message || result.error,
                        variant: result.success ? "default" : "destructive"
                      });
                    }}
                    disabled={loading || !email}
                  >
                    🔧 Dev: Force Confirm Email
                  </Button>
                )}
              </div>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
