import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { crop, location, acreage, soilType, irrigationType, season } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert agricultural yield prediction system for India. Given crop details, provide yield forecasts.
Return a JSON object with:
- predicted_yield_per_acre: number (in quintals)
- total_yield: number (predicted_yield_per_acre * acreage)
- confidence_low: number (lower bound in quintals/acre)
- confidence_high: number (upper bound in quintals/acre)
- confidence_percent: number (0-100)
- risk_level: string ("low", "medium", "high")
- risk_factors: string[] (list of risk factors)
- recommendations: string[] (list of actionable tips)
- estimated_revenue_per_acre: number (in INR)
- optimal_harvest_window: string (e.g., "Mid March to Early April")
- insurance_recommendation: string (brief insurance advice)
- monthly_forecast: array of {month: string, expected_growth: string, key_action: string}
Return ONLY the JSON, no markdown.`
          },
          {
            role: "user",
            content: `Predict yield for: Crop: ${crop}, Location: ${location}, Acreage: ${acreage} acres, Soil: ${soilType}, Irrigation: ${irrigationType}, Season: ${season}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = { error: "Could not parse prediction", raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("yield-prediction error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
