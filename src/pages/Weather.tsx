import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { AlertTriangle, Cloud, Droplets, Info, Loader2, RefreshCw, Sun, Thermometer, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface WeatherData {
  current: { temp: number; humidity: number; condition: string; wind_speed: number; rainfall_mm: number };
  forecast: { day: string; temp_high: number; temp_low: number; condition: string; rainfall_chance: number; humidity: number }[];
  alerts: { type: string; title: string; message: string }[];
  crop_advice: { crop: string; advice: string; urgency: string }[];
  historical_pattern: string;
}

const conditionIcon = (c: string) => {
  const l = c.toLowerCase();
  if (l.includes("rain") || l.includes("shower")) return <Droplets className="h-6 w-6 text-blue-500" />;
  if (l.includes("cloud") || l.includes("overcast")) return <Cloud className="h-6 w-6 text-muted-foreground" />;
  return <Sun className="h-6 w-6 text-accent" />;
};

const alertIcon = (type: string) => {
  if (type === "warning") return <AlertTriangle className="h-4 w-4 text-destructive" />;
  if (type === "advisory") return <AlertTriangle className="h-4 w-4 text-accent-foreground" />;
  return <Info className="h-4 w-4 text-primary" />;
};

const urgencyColor: Record<string, string> = { high: "border-destructive/30 bg-destructive/5", medium: "border-accent/30 bg-accent/5", low: "border-border bg-card" };

const Weather = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useState("Delhi, India");
  const [cropTypes, setCropTypes] = useState("Wheat, Rice");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WeatherData | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      // Call OpenWeather API directly from frontend
      const locationQuery = location || "Delhi, India";

      // Get coordinates
      const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationQuery)}&limit=1&appid=48ba05804bd0e1314635da04368a7c7c`);
      if (!geoResponse.ok) throw new Error("Failed to find location");
      const geoData = await geoResponse.json();
      if (!geoData.length) throw new Error("Location not found");

      const { lat, lon } = geoData[0];

      // Get current weather
      const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=48ba05804bd0e1314635da04368a7c7c&units=metric`);
      if (!currentResponse.ok) throw new Error("Failed to fetch weather data");
      const currentData = await currentResponse.json();

      // Get forecast
      const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=48ba05804bd0e1314635da04368a7c7c&units=metric`);
      if (!forecastResponse.ok) throw new Error("Failed to fetch forecast data");
      const forecastData = await forecastResponse.json();

      // Process data
      const current = {
        temp: Math.round(currentData.main.temp),
        humidity: currentData.main.humidity,
        condition: currentData.weather[0].main,
        wind_speed: Math.round(currentData.wind.speed * 3.6),
        rainfall_mm: currentData.rain ? currentData.rain['1h'] || 0 : 0
      };

      // Process forecast
      const forecast = [];
      const dailyData = {};
      forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { temps: [], conditions: [], rain: [] };
        }
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].conditions.push(item.weather[0].main);
        dailyData[date].rain.push(item.rain ? item.rain['3h'] || 0 : 0);
      });

      Object.keys(dailyData).slice(0, 7).forEach(date => {
        const data = dailyData[date];
        forecast.push({
          day: new Date(date).toLocaleDateString('en-IN', { weekday: 'short' }),
          temp_high: Math.round(Math.max(...data.temps)),
          temp_low: Math.round(Math.min(...data.temps)),
          condition: data.conditions[0],
          rainfall_chance: data.rain.reduce((a, b) => a + b, 0) > 0 ? Math.min(100, Math.round(data.rain.reduce((a, b) => a + b, 0) * 10)) : 0,
          humidity: Math.round(60)
        });
      });

      // Generate alerts
      const alerts = [];
      if (current.temp > 35) alerts.push({ type: "warning", title: "Heat Alert", message: "High temperatures may affect crop growth." });
      if (current.rainfall_mm > 10) alerts.push({ type: "advisory", title: "Heavy Rain", message: "Heavy rainfall detected." });
      if (current.wind_speed > 30) alerts.push({ type: "warning", title: "Strong Winds", message: "High winds may damage crops." });

      // Generate crop advice
      const crops = cropTypes.split(",").map(s => s.trim().toLowerCase());
      const crop_advice = crops.map(crop => {
        let advice = "Monitor weather conditions regularly.";
        let urgency = "low";
        if (current.temp > 30) {
          advice = "High temperatures detected. Increase irrigation.";
          urgency = "medium";
        }
        return { crop: crop.charAt(0).toUpperCase() + crop.slice(1), advice, urgency };
      });

      const result = {
        current,
        forecast,
        alerts,
        crop_advice,
        historical_pattern: "Monitor seasonal weather patterns for optimal farming."
      };

      setData(result);
    } catch (err: any) {
      toast({ title: "Failed to fetch weather", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchWeather();
  }, [user]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <PageLayout>
      <section className="relative py-20 bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/20 text-sm font-medium mb-4">🌦️ Smart Weather</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Weather Advisory</h1>
            <p className="text-lg opacity-90 max-w-xl mx-auto">AI-powered weather insights with crop-specific recommendations for your farm.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="p-5 rounded-xl bg-card border border-border shadow-card mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5"><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Crops</Label><Input value={cropTypes} onChange={(e) => setCropTypes(e.target.value)} /></div>
              <Button onClick={fetchWeather} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}Update
              </Button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-16"><Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" /><p className="text-muted-foreground">Fetching weather data...</p></div>
          )}

          {data && !loading && (
            <div className="space-y-8">
              {/* Current Weather */}
              {data.current && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-card border border-border shadow-elevated">
                  <h2 className="font-bold text-lg text-foreground mb-4">Current Conditions — {location}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <Thermometer className="h-8 w-8 text-destructive mx-auto mb-1" />
                      <p className="text-2xl font-bold text-foreground">{data.current.temp}°C</p>
                      <p className="text-xs text-muted-foreground">Temperature</p>
                    </div>
                    <div className="text-center">
                      <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-foreground">{data.current.humidity}%</p>
                      <p className="text-xs text-muted-foreground">Humidity</p>
                    </div>
                    <div className="text-center">
                      <Wind className="h-8 w-8 text-muted-foreground mx-auto mb-1" />
                      <p className="text-2xl font-bold text-foreground">{data.current.wind_speed} km/h</p>
                      <p className="text-xs text-muted-foreground">Wind</p>
                    </div>
                    <div className="text-center">
                      <Droplets className="h-8 w-8 text-primary mx-auto mb-1" />
                      <p className="text-2xl font-bold text-foreground">{data.current.rainfall_mm} mm</p>
                      <p className="text-xs text-muted-foreground">Rainfall</p>
                    </div>
                    <div className="text-center">
                      {conditionIcon(data.current.condition)}
                      <p className="text-lg font-bold text-foreground mt-1">{data.current.condition}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Alerts */}
              {data.alerts?.length > 0 && (
                <div className="space-y-3">
                  <h2 className="font-bold text-lg text-foreground">Weather Alerts</h2>
                  {data.alerts.map((a, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${a.type === "warning" ? "border-destructive/30 bg-destructive/5" : a.type === "advisory" ? "border-accent/30 bg-accent/5" : "border-primary/20 bg-primary/5"}`}>
                      <div className="flex items-center gap-2 mb-1">{alertIcon(a.type)}<h3 className="font-semibold text-foreground">{a.title}</h3></div>
                      <p className="text-sm text-muted-foreground">{a.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 7 Day Forecast */}
              {data.forecast?.length > 0 && (
                <div>
                  <h2 className="font-bold text-lg text-foreground mb-4">7-Day Forecast</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {data.forecast.map((d, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="p-3 rounded-xl bg-card border border-border shadow-card text-center">
                        <p className="text-xs font-medium text-muted-foreground mb-2">{d.day}</p>
                        {conditionIcon(d.condition)}
                        <p className="text-sm font-bold text-foreground mt-1">{d.temp_high}° / {d.temp_low}°</p>
                        <p className="text-xs text-muted-foreground">{d.rainfall_chance}% rain</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Crop Advice */}
              {data.crop_advice?.length > 0 && (
                <div>
                  <h2 className="font-bold text-lg text-foreground mb-4">Crop-Specific Advice</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.crop_advice.map((c, i) => (
                      <div key={i} className={`p-4 rounded-xl border ${urgencyColor[c.urgency] || urgencyColor.low}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{c.crop}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.urgency === "high" ? "bg-destructive/10 text-destructive" : c.urgency === "medium" ? "bg-accent/20 text-accent-foreground" : "bg-secondary text-secondary-foreground"}`}>{c.urgency}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{c.advice}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historical Pattern */}
              {data.historical_pattern && (
                <div className="p-5 rounded-xl bg-secondary border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Historical Weather Pattern</h3>
                  <p className="text-sm text-muted-foreground">{data.historical_pattern}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Weather;
