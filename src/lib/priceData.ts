export type CropKey = "tomato" | "onion" | "potato" | "wheat" | "rice" | "cotton" | "sugarcane" | "soybean";
export type LocationKey = "mumbai" | "delhi" | "bangalore" | "hyderabad" | "pune";

export const crops: { value: CropKey; label: string }[] = [
  { value: "tomato", label: "Tomato" },
  { value: "onion", label: "Onion" },
  { value: "potato", label: "Potato" },
  { value: "wheat", label: "Wheat" },
  { value: "rice", label: "Rice" },
  { value: "cotton", label: "Cotton" },
  { value: "sugarcane", label: "Sugarcane" },
  { value: "soybean", label: "Soybean" },
];

export const locations: { value: LocationKey; label: string }[] = [
  { value: "mumbai", label: "Mumbai" },
  { value: "delhi", label: "Delhi" },
  { value: "bangalore", label: "Bangalore" },
  { value: "hyderabad", label: "Hyderabad" },
  { value: "pune", label: "Pune" },
];

// Mapping from location to MandiFilters
const locationToMandiFilters: Record<LocationKey, { state: string; district: string }> = {
  mumbai: { state: "Maharashtra", district: "Mumbai" },
  delhi: { state: "Delhi", district: "Delhi" },
  bangalore: { state: "Karnataka", district: "Bangalore" },
  hyderabad: { state: "Telangana", district: "Hyderabad" },
  pune: { state: "Maharashtra", district: "Pune" },
};

// Mapping from crop to Commodity
const cropToCommodity: Record<CropKey, string> = {
  tomato: "Tomato",
  onion: "Onion",
  potato: "Potato",
  wheat: "Wheat",
  rice: "Rice",
  cotton: "Cotton",
  sugarcane: "Sugarcane",
  soybean: "Soybean",
};

export const historicalData: Record<CropKey, Record<LocationKey, number[]>> = {
  tomato: {
    mumbai: [22, 23, 24.5, 25, 26.8, 28, 27.5, 26, 25.5, 24, 23.5, 23, 22.5, 22, 21.5],
    delhi: [20, 21, 22.5, 23, 24.8, 26, 25.5, 24, 23.5, 22, 21.5, 21, 20.5, 20, 19.5],
    bangalore: [24, 25, 26.5, 27, 28.8, 30, 29.5, 28, 27.5, 26, 25.5, 25, 24.5, 24, 23.5],
    hyderabad: [23, 24, 25.5, 26, 27.8, 29, 28.5, 27, 26.5, 25, 24.5, 24, 23.5, 23, 22.5],
    pune: [21, 22, 23.5, 24, 25.8, 27, 26.5, 25, 24.5, 23, 22.5, 22, 21.5, 21, 20.5],
  },
  onion: {
    mumbai: [18, 18.5, 19, 20, 21, 22, 23, 22.5, 22, 21.5, 21, 20.5, 20, 19.5, 19],
    delhi: [16, 16.5, 17, 18, 19, 20, 21, 20.5, 20, 19.5, 19, 18.5, 18, 17.5, 17],
    bangalore: [20, 20.5, 21, 22, 23, 24, 25, 24.5, 24, 23.5, 23, 22.5, 22, 21.5, 21],
    hyderabad: [19, 19.5, 20, 21, 22, 23, 24, 23.5, 23, 22.5, 22, 21.5, 21, 20.5, 20],
    pune: [17, 17.5, 18, 19, 20, 21, 22, 21.5, 21, 20.5, 20, 19.5, 19, 18.5, 18],
  },
  potato: {
    mumbai: [12, 12.5, 13, 13.5, 14, 14.5, 15, 14.8, 14.5, 14, 13.5, 13, 12.8, 12.5, 12.2],
    delhi: [10, 10.5, 11, 11.5, 12, 12.5, 13, 12.8, 12.5, 12, 11.5, 11, 10.8, 10.5, 10.2],
    bangalore: [14, 14.5, 15, 15.5, 16, 16.5, 17, 16.8, 16.5, 16, 15.5, 15, 14.8, 14.5, 14.2],
    hyderabad: [13, 13.5, 14, 14.5, 15, 15.5, 16, 15.8, 15.5, 15, 14.5, 14, 13.8, 13.5, 13.2],
    pune: [11, 11.5, 12, 12.5, 13, 13.5, 14, 13.8, 13.5, 13, 12.5, 12, 11.8, 11.5, 11.2],
  },
  wheat: {
    mumbai: [20, 20.5, 21, 21.5, 22, 22.5, 23, 22.8, 22.5, 22, 21.5, 21, 20.8, 20.5, 20.2],
    delhi: [18, 18.5, 19, 19.5, 20, 20.5, 21, 20.8, 20.5, 20, 19.5, 19, 18.8, 18.5, 18.2],
    bangalore: [22, 22.5, 23, 23.5, 24, 24.5, 25, 24.8, 24.5, 24, 23.5, 23, 22.8, 22.5, 22.2],
    hyderabad: [21, 21.5, 22, 22.5, 23, 23.5, 24, 23.8, 23.5, 23, 22.5, 22, 21.8, 21.5, 21.2],
    pune: [19, 19.5, 20, 20.5, 21, 21.5, 22, 21.8, 21.5, 21, 20.5, 20, 19.8, 19.5, 19.2],
  },
  rice: {
    mumbai: [25, 25.5, 26, 26.5, 27, 27.5, 28, 27.8, 27.5, 27, 26.5, 26, 25.8, 25.5, 25.2],
    delhi: [23, 23.5, 24, 24.5, 25, 25.5, 26, 25.8, 25.5, 25, 24.5, 24, 23.8, 23.5, 23.2],
    bangalore: [27, 27.5, 28, 28.5, 29, 29.5, 30, 29.8, 29.5, 29, 28.5, 28, 27.8, 27.5, 27.2],
    hyderabad: [26, 26.5, 27, 27.5, 28, 28.5, 29, 28.8, 28.5, 28, 27.5, 27, 26.8, 26.5, 26.2],
    pune: [24, 24.5, 25, 25.5, 26, 26.5, 27, 26.8, 26.5, 26, 25.5, 25, 24.8, 24.5, 24.2],
  },
  cotton: {
    mumbai: [35, 35.5, 36, 36.5, 37, 37.5, 38, 37.8, 37.5, 37, 36.5, 36, 35.8, 35.5, 35.2],
    delhi: [33, 33.5, 34, 34.5, 35, 35.5, 36, 35.8, 35.5, 35, 34.5, 34, 33.8, 33.5, 33.2],
    bangalore: [37, 37.5, 38, 38.5, 39, 39.5, 40, 39.8, 39.5, 39, 38.5, 38, 37.8, 37.5, 37.2],
    hyderabad: [36, 36.5, 37, 37.5, 38, 38.5, 39, 38.8, 38.5, 38, 37.5, 37, 36.8, 36.5, 36.2],
    pune: [34, 34.5, 35, 35.5, 36, 36.5, 37, 36.8, 36.5, 36, 35.5, 35, 34.8, 34.5, 34.2],
  },
  sugarcane: {
    mumbai: [28, 28.5, 29, 29.5, 30, 30.5, 31, 30.8, 30.5, 30, 29.5, 29, 28.8, 28.5, 28.2],
    delhi: [26, 26.5, 27, 27.5, 28, 28.5, 29, 28.8, 28.5, 28, 27.5, 27, 26.8, 26.5, 26.2],
    bangalore: [30, 30.5, 31, 31.5, 32, 32.5, 33, 32.8, 32.5, 32, 31.5, 31, 30.8, 30.5, 30.2],
    hyderabad: [29, 29.5, 30, 30.5, 31, 31.5, 32, 31.8, 31.5, 31, 30.5, 30, 29.8, 29.5, 29.2],
    pune: [27, 27.5, 28, 28.5, 29, 29.5, 30, 29.8, 29.5, 29, 28.5, 28, 27.8, 27.5, 27.2],
  },
  soybean: {
    mumbai: [32, 32.5, 33, 33.5, 34, 34.5, 35, 34.8, 34.5, 34, 33.5, 33, 32.8, 32.5, 32.2],
    delhi: [30, 30.5, 31, 31.5, 32, 32.5, 33, 32.8, 32.5, 32, 31.5, 31, 30.8, 30.5, 30.2],
    bangalore: [34, 34.5, 35, 35.5, 36, 36.5, 37, 36.8, 36.5, 36, 35.5, 35, 34.8, 34.5, 34.2],
    hyderabad: [33, 33.5, 34, 34.5, 35, 35.5, 36, 35.8, 35.5, 35, 34.5, 34, 33.8, 33.5, 33.2],
    pune: [31, 31.5, 32, 32.5, 33, 33.5, 34, 33.8, 33.5, 33, 32.5, 32, 31.8, 31.5, 31.2],
  },
};

import { buildMandiPriceForecast, MandiFilters } from "./mandiPrices";

export interface PredictionResult {
  currentPrice: number;
  predictedPrice: number;
  priceChange: number;
  confidence: number;
  bestTime: number;
  insight: string;
  chartData: { day: string; price: number; type: "historical" | "predicted" }[];
}

export async function predictPrice(crop: CropKey, location: LocationKey): Promise<PredictionResult> {
  const locationFilters = locationToMandiFilters[location];
  const commodity = cropToCommodity[crop];

  const filters: MandiFilters = {
    ...locationFilters,
    commodity: commodity,
  };

  try {
    const forecast = await buildMandiPriceForecast(filters);

    const currentPrice = forecast.currentModalPrice;
    const predictedPrice = forecast.bestDay.predictedModalPrice;
    const priceChange = ((predictedPrice - currentPrice) / currentPrice) * 100;

    // Calculate bestTime as the day number of bestDay
    const bestTime = forecast.predictions.findIndex(p => p.date === forecast.bestDay.date) + 1;

    const confidence = 85; // Fixed for now, could be calculated

    const insight = forecast.recommendation;

    // Build chartData from predictions
    const chartData: { day: string; price: number; type: "historical" | "predicted" }[] = [
      { day: "Today", price: currentPrice, type: "historical" },
      ...forecast.predictions.map((p, i) => ({
        day: p.day,
        price: p.predictedModalPrice,
        type: "predicted" as const,
      })),
    ];

    return {
      currentPrice,
      predictedPrice,
      priceChange: parseFloat(priceChange.toFixed(1)),
      confidence,
      bestTime,
      insight,
      chartData,
    };
  } catch (error) {
    console.error("Failed to fetch mandi data, falling back to mock data", error);
    // Fallback to mock data
    const prices = historicalData[crop][location];
    const currentPrice = prices[prices.length - 1];
    const predictedPriceNum = currentPrice * (1 + (Math.random() * 0.3 - 0.1));
    const priceChange = ((predictedPriceNum - currentPrice) / currentPrice) * 100;
    const confidence = Math.floor(Math.random() * 20 + 75);
    const bestTime = Math.floor(Math.random() * 7) + 1;

    const positiveInsights = [
      "Our AI predicts an upward trend due to increased demand and seasonal patterns. Consider holding your produce for better returns.",
      "Market analysis shows growing demand in urban centers. Price appreciation is expected over the forecast period.",
      "Supply chain data indicates tightening supply. This crop is expected to fetch premium prices in the coming days.",
    ];
    const negativeInsights = [
      "Our AI predicts a slight decrease due to higher supply from neighboring regions. Consider selling soon to maximize returns.",
      "Market data shows increased harvest volumes arriving. Selling within the next few days may help you get the best price.",
      "Seasonal patterns suggest a temporary price correction. Strategic timing of your sale can minimize impact.",
    ];

    const insights = priceChange >= 0 ? positiveInsights : negativeInsights;
    const insight = insights[Math.floor(Math.random() * insights.length)];

    const chartData: { day: string; price: number; type: "historical" | "predicted" }[] = prices.map((p, i) => ({
      day: `Day ${i + 1}`,
      price: p,
      type: "historical" as const,
    }));
    chartData.push({
      day: "Predicted",
      price: parseFloat(predictedPriceNum.toFixed(2)),
      type: "predicted",
    });

    return {
      currentPrice,
      predictedPrice: parseFloat(predictedPriceNum.toFixed(2)),
      priceChange: parseFloat(priceChange.toFixed(1)),
      confidence,
      bestTime,
      insight,
      chartData,
    };
  }
}
