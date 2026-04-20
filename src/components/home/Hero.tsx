import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-farm.jpg";
import { useState } from "react";

const Hero = () => {
  const [showDemoModal, setShowDemoModal] = useState(false);
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Lush green farmland at sunrise"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-foreground/60" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              🌾 AI-Powered Agriculture Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-primary-foreground"
          >
            Empowering Farmers with{" "}
            <span className="text-primary">AI Technology</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-xl"
          >
            KrishiMitra connects farmers with modern farming solutions — from
            AI price prediction to group buying, making agriculture smarter and
            more profitable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-wrap gap-4"
          >
            <Button size="lg" className="text-base px-8" asChild>
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setShowDemoModal(true)}
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg"
          >
            {[
              { value: "8,500+", label: "Farmers" },
              { value: "42+", label: "Crops Tracked" },
              { value: "₹1.2Cr+", label: "Savings" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
              {/* Demo Video Modal */}
          {showDemoModal && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4">
              <div className="max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h3 className="text-xl font-semibold text-gray-900">Krishi Mitra Demo</h3>
                  <button
                    onClick={() => setShowDemoModal(false)}
                    className="text-4xl leading-none text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Video Player */}
                <div className="aspect-video bg-black">
                  <video
                    controls
                    autoPlay
                    className="w-full h-full"
                    src="/videos/demo-video.mp4"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          )}</section>
  );
};

export default Hero;
