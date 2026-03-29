import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    crops,
    locations,
    predictPrice,
    type CropKey,
    type LocationKey,
    type PredictionResult,
} from "@/lib/priceData";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Brain,
    ChevronRight,
    Clock,
    Lightbulb,
    LineChart as LineChartIcon,
    Loader2,
    Star,
    Target,
    TrendingUp,
    Zap
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

/* ─── Typing animation hook ─── */
const phrases = [
  "Price Forecasting",
  "Market Analysis",
  "Profit Maximization",
  "AI Insights",
];

function useTypingAnimation() {
  const [text, setText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    const speed = deleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!deleting) {
        setText(current.slice(0, charIdx + 1));
        if (charIdx + 1 === current.length) {
          setTimeout(() => setDeleting(true), 1500);
        } else {
          setCharIdx(charIdx + 1);
        }
      } else {
        setText(current.slice(0, charIdx));
        if (charIdx === 0) {
          setDeleting(false);
          setPhraseIdx((phraseIdx + 1) % phrases.length);
        } else {
          setCharIdx(charIdx - 1);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [charIdx, deleting, phraseIdx]);

  return text;
}

/* ─── Animated counter ─── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 1500;
          const step = (ts: number) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-bold text-primary">
      {count}
      {suffix}
    </div>
  );
}

/* ─── Main Page ─── */
const PricePrediction = () => {
  const typedText = useTypingAnimation();
  const [crop, setCrop] = useState<CropKey | "">("");
  const [location, setLocation] = useState<LocationKey | "">("");
  const [quantity, setQuantity] = useState("");
  const [forecastDate, setForecastDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const handlePredict = useCallback(async () => {
    if (!crop || !location || !quantity || !forecastDate) return;
    setLoading(true);
    setResult(null);
    try {
      const prediction = await predictPrice(crop, location);
      setResult(prediction);
    } catch (error) {
      console.error("Prediction failed", error);
      // Could set an error state here
    } finally {
      setLoading(false);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [crop, location, quantity, forecastDate]);

  const formValid = crop && location && quantity && forecastDate;

  return (
    <PageLayout>
      {/* ─── Hero Section ─── */}
      <section className="relative py-20 md:py-28 bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/20 text-sm font-medium mb-6">
              🤖 AI-Powered Agriculture
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Smart{" "}
              <span className="inline-block min-w-[280px] text-left">
                {typedText}
                <span className="animate-pulse">|</span>
              </span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-10">
              Make informed selling decisions with our AI-powered price forecasting engine built for Indian farmers.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { target: 92, suffix: "%", label: "Accuracy" },
              { target: 42, suffix: "+", label: "Crops" },
              { target: 15, suffix: " Day", label: "Forecast" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <AnimatedCounter target={s.target} suffix={s.suffix} />
                <div className="text-sm opacity-80 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Prediction Dashboard ─── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Price Prediction Dashboard
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Enter your crop details below and let our AI analyze market trends.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto p-6 md:p-8 rounded-2xl bg-card border border-border shadow-elevated"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="crop">Select Crop</Label>
                <Select value={crop} onValueChange={(v) => setCrop(v as CropKey)}>
                  <SelectTrigger id="crop">
                    <SelectValue placeholder="Choose a crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Select Location</Label>
                <Select value={location} onValueChange={(v) => setLocation(v as LocationKey)}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Choose a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (kg)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  placeholder="e.g. 500"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Forecast Date</Label>
                <Input
                  id="date"
                  type="date"
                  min={minDate}
                  value={forecastDate}
                  onChange={(e) => setForecastDate(e.target.value)}
                />
              </div>
            </div>

            <Button
              className="w-full mt-6 h-12 text-base"
              size="lg"
              disabled={!formValid || loading}
              onClick={handlePredict}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5 mr-2" />
                  Get Price Prediction
                </>
              )}
            </Button>
          </motion.div>

          {/* ─── Results ─── */}
          <AnimatePresence>
            {result && (
              <motion.div
                ref={resultsRef}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-12 space-y-8"
              >
                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    {
                      label: "Current Price",
                      value: `₹${result.currentPrice}/kg`,
                      icon: <BarChart3 className="h-5 w-5" />,
                      color: "text-foreground",
                    },
                    {
                      label: "Predicted Price",
                      value: `₹${result.predictedPrice}/kg`,
                      icon: <TrendingUp className="h-5 w-5" />,
                      color: "text-primary",
                    },
                    {
                      label: "Price Change",
                      value: `${result.priceChange >= 0 ? "+" : ""}${result.priceChange}%`,
                      icon: result.priceChange >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />,
                      color: result.priceChange >= 0 ? "text-primary" : "text-destructive",
                    },
                    {
                      label: "Best Time to Sell",
                      value: `${result.bestTime} day${result.bestTime > 1 ? "s" : ""}`,
                      icon: <Clock className="h-5 w-5" />,
                      color: "text-accent-foreground",
                    },
                  ].map((card) => (
                    <div
                      key={card.label}
                      className="p-5 rounded-xl bg-card border border-border shadow-card"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                        {card.icon}
                        {card.label}
                      </div>
                      <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="p-6 rounded-xl bg-card border border-border shadow-card">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5 text-primary" />
                    Price Trend &amp; Prediction
                  </h3>
                  <ResponsiveContainer width="100%" height={380}>
                    <LineChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} unit="/kg" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`₹${value}/kg`, "Price"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          if (payload.type === "predicted") {
                            return (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={6}
                                fill="hsl(var(--accent))"
                                stroke="hsl(var(--accent))"
                                strokeWidth={2}
                              />
                            );
                          }
                          return <circle cx={cx} cy={cy} r={3} fill="hsl(var(--primary))" />;
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-primary inline-block" /> Historical
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-accent inline-block" /> Predicted
                    </span>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="p-6 rounded-xl bg-card border border-border shadow-card">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-accent" />
                    AI Insights
                  </h3>
                  <p className="text-muted-foreground mb-5">{result.insight}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Confidence Level</span>
                      <span className="font-semibold text-primary">{result.confidence}%</span>
                    </div>
                    <Progress value={result.confidence} className="h-3" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">How It Works</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Our AI engine processes multiple data sources to generate accurate predictions.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: <Target className="h-7 w-7" />, title: "Select Crop", desc: "Choose your crop and location from our database of 42+ crops." },
              { icon: <Brain className="h-7 w-7" />, title: "AI Analysis", desc: "Our model analyzes historical prices, weather, and market demand." },
              { icon: <BarChart3 className="h-7 w-7" />, title: "Get Forecast", desc: "Receive a detailed price forecast with confidence scores." },
              { icon: <Zap className="h-7 w-7" />, title: "Take Action", desc: "Sell at the optimal time to maximize your profits." },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-xl bg-card border border-border shadow-card"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="text-xs font-semibold text-primary mb-1">Step {i + 1}</div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              What Farmers Say
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Rajesh Kumar",
                location: "Punjab",
                text: "KrishiMitra's price prediction helped me sell my wheat at 18% higher than the local mandi rate. The AI insights were spot-on!",
              },
              {
                name: "Sunita Devi",
                location: "Maharashtra",
                text: "I used the forecast tool for my onion crop and timed my sale perfectly. I saved nearly ₹15,000 on a single harvest.",
              },
              {
                name: "Mohan Patel",
                location: "Gujarat",
                text: "The accuracy of predictions is impressive. It helped me decide when to sell cotton and I got the best rate in my village.",
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border shadow-card"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm mb-4">"{t.text}"</p>
                <div className="font-semibold text-foreground text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.location}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 md:py-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Making Smarter Selling Decisions
            </h2>
            <p className="opacity-90 max-w-xl mx-auto mb-8">
              Join 8,500+ farmers already using KrishiMitra's AI to maximize their crop profits.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="h-12 px-8 text-base"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Try Price Prediction Now
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default PricePrediction;
