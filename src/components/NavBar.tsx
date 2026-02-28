import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Sprout, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/price-prediction", label: "Price Prediction" },
  { to: "/group-buy", label: "Group Buy" },
  { to: "/learn", label: "Learn" },
  { to: "/verify", label: "Verify" },
];

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Sprout className="h-7 w-7 text-primary" />
          <span className="text-foreground">Krishi</span>
          <span className="text-primary">Mitra</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === link.to ? "text-primary bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >{link.label}</Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" asChild><Link to="/dashboard">Dashboard</Link></Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}><LogOut className="h-4 w-4 mr-1" />Logout</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild><Link to="/login">Log in</Link></Button>
              <Button asChild><Link to="/signup">Get Started</Link></Button>
            </>
          )}
        </div>

        <button className="md:hidden p-2 text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === link.to ? "text-primary bg-secondary" : "text-muted-foreground hover:text-foreground"}`}
                >{link.label}</Link>
              ))}
              <div className="pt-3 flex flex-col gap-2">
                {user ? (
                  <>
                    <Button variant="ghost" asChild><Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link></Button>
                    <Button variant="outline" onClick={() => { handleSignOut(); setIsOpen(false); }}>Logout</Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild><Link to="/login" onClick={() => setIsOpen(false)}>Log in</Link></Button>
                    <Button asChild><Link to="/signup" onClick={() => setIsOpen(false)}>Get Started</Link></Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavBar;
