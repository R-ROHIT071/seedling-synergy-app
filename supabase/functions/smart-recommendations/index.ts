import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userId, location, cropTypes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's order history and available products
    const [ordersRes, productsRes] = await Promise.all([
      userId ? supabase.from("orders").select("product_id, quantity, total").eq("user_id", userId).limit(20) : Promise.resolve({ data: [] }),
      supabase.from("products").select("id, name, category, price, description").limit(50),
    ]);

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
            content: `You are an agricultural product recommendation engine for Indian farmers. Based on the user's profile, purchase history, and available products, generate personalized recommendations.
Return a JSON object with:
- product_recommendations: array of {name: string, reason: string, category: string, priority: "high"|"medium"|"low"}
- seasonal_tips: string[] (3-5 seasonal farming tips)
- market_insights: string[] (2-3 current market trend insights)
- cost_saving_tips: string[] (2-3 ways to reduce costs)
Return ONLY the JSON, no markdown.`
          },
          {
            role: "user",
            content: `User location: ${location || "India"}, Crops grown: ${cropTypes?.join(", ") || "various"}, Purchase history: ${JSON.stringify(ordersRes.data?.slice(0, 10) || [])}, Available products: ${JSON.stringify(productsRes.data?.slice(0, 20) || [])}, Current month: ${new Date().toLocaleString("en-IN", { month: "long" })}`
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
      parsed = { product_recommendations: [], seasonal_tips: [], market_insights: [], cost_saving_tips: [] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("smart-recommendations error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
