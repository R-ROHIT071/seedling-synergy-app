import { Mail, MapPin, Phone, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import NewsletterForm from "./NewsletterForm";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Sprout className="h-7 w-7 text-primary" />
              <span>KrishiMitra</span>
            </Link>
            <p className="text-sm opacity-70">
              Empowering farmers with AI-powered solutions for a sustainable agricultural future.
            </p>
            <div className="pt-2">
              <p className="text-sm font-medium mb-2">Subscribe to our newsletter</p>
              <NewsletterForm />
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <div className="space-y-2 text-sm opacity-70">
              <Link to="/price-prediction" className="block hover:opacity-100 transition-opacity">AI Price Prediction</Link>
              <Link to="/group-buy" className="block hover:opacity-100 transition-opacity">Group Buying</Link>
              <Link to="/verify" className="block hover:opacity-100 transition-opacity">Verification</Link>
              <Link to="/learn" className="block hover:opacity-100 transition-opacity">Learning Hub</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <div className="space-y-2 text-sm opacity-70">
              <a href="#" className="block hover:opacity-100 transition-opacity">About Us</a>
              <a href="#" className="block hover:opacity-100 transition-opacity">Careers</a>
              <Link to="/faq" className="block hover:opacity-100 transition-opacity">FAQ</Link>
              <a href="#" className="block hover:opacity-100 transition-opacity">Privacy Policy</a>
              <a href="#" className="block hover:opacity-100 transition-opacity">Terms of Service</a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-sm opacity-70">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>support@krishimitra.in</span></div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>+91 1800-XXX-XXXX</span></div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>New Delhi, India</span></div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 text-center text-sm opacity-50">
          <p>© {new Date().getFullYear()} KrishiMitra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
