import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, cropTypes } = await req.json();
    const OPENWEATHER_API_KEY = Deno.env.get("OPENWEATHER_API_KEY");
    if (!OPENWEATHER_API_KEY) {
      console.error("OPENWEATHER_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Weather service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get coordinates for location
    const geoResponse = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location || "Delhi, India")}&limit=1&appid=${OPENWEATHER_API_KEY}`);
    if (!geoResponse.ok) throw new Error("Failed to geocode location");
    const geoData = await geoResponse.json();
    if (!geoData.length) throw new Error("Location not found");
    const { lat, lon } = geoData[0];

    // Get current weather
    const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`);
    if (!currentResponse.ok) throw new Error("Failed to fetch current weather");
    const currentData = await currentResponse.json();

    // Get forecast
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`);
    if (!forecastResponse.ok) throw new Error("Failed to fetch forecast");
    const forecastData = await forecastResponse.json();

    // Process current weather
    const current = {
      temp: Math.round(currentData.main.temp),
      humidity: currentData.main.humidity,
      condition: currentData.weather[0].main,
      wind_speed: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
      rainfall_mm: currentData.rain ? currentData.rain['1h'] || 0 : 0
    };

    // Process forecast (next 7 days, taking one reading per day)
    const forecast = [];
    const dailyData = {};
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          temps: [],
          conditions: [],
          rain: []
        };
      }
      dailyData[date].temps.push(item.main.temp);
      dailyData[date].conditions.push(item.weather[0].main);
      dailyData[date].rain.push(item.rain ? item.rain['3h'] || 0 : 0);
    });

    Object.keys(dailyData).slice(0, 7).forEach(date => {
      const data = dailyData[date];
      const avgTemp = data.temps.reduce((a, b) => a + b, 0) / data.temps.length;
      const condition = data.conditions[0]; // Take first condition
      const rainfall = data.rain.reduce((a, b) => a + b, 0);
      forecast.push({
        day: new Date(date).toLocaleDateString('en-IN', { weekday: 'short' }),
        temp_high: Math.round(Math.max(...data.temps)),
        temp_low: Math.round(Math.min(...data.temps)),
        condition,
        rainfall_chance: rainfall > 0 ? Math.min(100, Math.round(rainfall * 10)) : 0,
        humidity: Math.round(data.temps.length > 0 ? 60 : 50) // Approximate
      });
    });

    // Generate basic alerts based on weather
    const alerts = [];
    if (current.temp > 35) {
      alerts.push({ type: "warning", title: "Heat Alert", message: "High temperatures may affect crop growth. Ensure adequate irrigation." });
    }
    if (current.rainfall_mm > 10) {
      alerts.push({ type: "advisory", title: "Heavy Rain", message: "Heavy rainfall detected. Check for waterlogging in fields." });
    }
    if (current.wind_speed > 30) {
      alerts.push({ type: "warning", title: "Strong Winds", message: "High winds may damage crops. Secure loose structures." });
    }

    // Generate crop advice based on crops and weather
    const crops = cropTypes ? cropTypes.split(",").map(s => s.trim().toLowerCase()) : ["wheat"];
    const crop_advice = crops.map(crop => {
      let advice = "Monitor weather conditions regularly.";
      let urgency = "low";

      if (current.temp > 30 && ["wheat", "rice", "maize"].includes(crop)) {
        advice = "High temperatures detected. Increase irrigation frequency.";
        urgency = "medium";
      }
      if (current.rainfall_mm > 5 && ["wheat", "rice"].includes(crop)) {
        advice = "Recent rainfall may require drainage management.";
        urgency = "medium";
      }
      if (current.condition.toLowerCase().includes("rain") && crop === "rice") {
        advice = "Favorable conditions for rice cultivation.";
        urgency = "low";
      }

      return { crop: crop.charAt(0).toUpperCase() + crop.slice(1), advice, urgency };
    });

    // Basic historical pattern
    const historical_pattern = `Based on current season, ${location} typically experiences moderate temperatures with occasional rainfall. Monitor for seasonal changes.`;

    const result = {
      current,
      forecast,
      alerts,
      crop_advice,
      historical_pattern
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weather error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
