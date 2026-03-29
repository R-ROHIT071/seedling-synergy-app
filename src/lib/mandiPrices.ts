export interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

interface MandiApiResponse {
  total: number;
  count: number;
  records: MandiRecord[];
}

export interface MandiFilters {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  grade?: string;
}

export interface PriceForecastPoint {
  date: string;
  day: string;
  predictedModalPrice: number;
}

export interface PriceForecastResult {
  predictions: PriceForecastPoint[];
  bestDay: PriceForecastPoint;
  recommendation: string;
  currentModalPrice: number;
  latestDataDate: string;
}

const API_URL = '/api/mandi-prices';

export function parseArrivalDate(dateString: string): Date | null {
  if (!dateString) {
    return null;
  }

  // API commonly returns DD/MM/YYYY for Arrival_Date.
  const ddmmyyyyMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = Number(ddmmyyyyMatch[1]);
    const month = Number(ddmmyyyyMatch[2]);
    const year = Number(ddmmyyyyMatch[3]);
    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day
    ) {
      return parsed;
    }
    return null;
  }

  const fallback = new Date(dateString);
  if (Number.isNaN(fallback.getTime())) {
    return null;
  }

  return fallback;
}

function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

function formatDisplayDay(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

function numberOrNull(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildParams(filters: MandiFilters, limit: number, offset: number): URLSearchParams {
  const params = new URLSearchParams({
    'api-key': '579b464db66ec23bdd0000018f03a9b54e8a43dd5041ec76b9c97e3a',
    format: 'json',
    limit: String(limit),
    offset: String(offset),
  });

  // Add filters with correct parameter names for data.gov.in API
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      // Convert to lowercase for API parameter names
      const paramKey = key.toLowerCase();
      params.set(`filters[${paramKey}]`, value);
    }
  }

  return params;
}

async function fetchMandiPriceHistory(
  filters: MandiFilters,
  maxRecords = 1000,
  pageSize = 100,
): Promise<MandiRecord[]> {
  const all: MandiRecord[] = [];
  let offset = 0;

  while (all.length < maxRecords) {
    const limit = Math.min(pageSize, maxRecords - all.length);
    const params = buildParams(filters, limit, offset);
    const response = await fetch(`${API_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch mandi prices history: ${response.status}`);
    }

    const data: MandiApiResponse = await response.json();
    const page = data.records ?? [];
    if (page.length === 0) {
      break;
    }

    all.push(...page);
    if (page.length < limit) {
      break;
    }

    offset += page.length;
  }

  return all;
}

function aggregateDailyModal(records: MandiRecord[]): Array<{ date: Date; value: number }> {
  const grouped = new Map<string, { date: Date; values: number[] }>();

  for (const record of records) {
    const date = parseArrivalDate(record.arrival_date);
    const price = numberOrNull(record.modal_price);
    if (!date || price === null) {
      continue;
    }

    const key = dayKey(date);
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, { date: new Date(date.getFullYear(), date.getMonth(), date.getDate()), values: [price] });
    } else {
      existing.values.push(price);
    }
  }

  return [...grouped.values()]
    .map((item) => ({
      date: item.date,
      value: item.values.reduce((sum, v) => sum + v, 0) / item.values.length,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function fillMissingDailyValues(series: Array<{ date: Date; value: number }>): Array<{ date: Date; value: number }> {
  if (series.length === 0) {
    return [];
  }

  const valueByDay = new Map(series.map((item) => [dayKey(item.date), item.value]));
  const start = series[0].date;
  const end = series[series.length - 1].date;

  const allDates: Date[] = [];
  for (let cursor = new Date(start.getTime()); cursor.getTime() <= end.getTime(); cursor = addDays(cursor, 1)) {
    allDates.push(new Date(cursor.getTime()));
  }

  const knownValues = series.map((item) => item.value);
  const globalMean = knownValues.reduce((sum, v) => sum + v, 0) / knownValues.length;

  const filled: Array<{ date: Date; value: number | null }> = allDates.map((date) => ({
    date,
    value: valueByDay.get(dayKey(date)) ?? null,
  }));

  let lastKnown: number | null = null;
  for (const item of filled) {
    if (item.value !== null) {
      lastKnown = item.value;
    } else if (lastKnown !== null) {
      item.value = lastKnown;
    }
  }

  let nextKnown: number | null = null;
  for (let i = filled.length - 1; i >= 0; i--) {
    const item = filled[i];
    if (item.value !== null) {
      nextKnown = item.value;
    } else if (nextKnown !== null) {
      item.value = nextKnown;
    }
  }

  return filled.map((item) => ({
    date: item.date,
    value: item.value ?? globalMean,
  }));
}

function seasonalPriceLookup(targetDate: Date, dailyMap: Map<string, number>): number | null {
  const previousYear = new Date(targetDate.getFullYear() - 1, targetDate.getMonth(), targetDate.getDate());

  for (let delta = 0; delta <= 10; delta++) {
    const sameDay = dayKey(addDays(previousYear, delta));
    if (dailyMap.has(sameDay)) {
      return dailyMap.get(sameDay) ?? null;
    }

    if (delta > 0) {
      const backDay = dayKey(addDays(previousYear, -delta));
      if (dailyMap.has(backDay)) {
        return dailyMap.get(backDay) ?? null;
      }
    }
  }

  return null;
}

interface ModelArtifacts {
  means: number[];
  stds: number[];
  weights: number[];
  bias: number;
}

function trainLinearRegression(features: number[][], targets: number[]): ModelArtifacts {
  const featureCount = features[0].length;
  const means = new Array<number>(featureCount).fill(0);
  const stds = new Array<number>(featureCount).fill(1);

  for (let j = 0; j < featureCount; j++) {
    const col = features.map((row) => row[j]);
    const mean = col.reduce((sum, v) => sum + v, 0) / col.length;
    const variance = col.reduce((sum, v) => sum + (v - mean) ** 2, 0) / col.length;
    means[j] = mean;
    stds[j] = Math.sqrt(variance) || 1;
  }

  const normalized = features.map((row) => row.map((v, j) => (v - means[j]) / stds[j]));
  const weights = new Array<number>(featureCount).fill(0);
  let bias = 0;

  const learningRate = 0.03;
  const epochs = 900;
  const n = normalized.length;

  for (let epoch = 0; epoch < epochs; epoch++) {
    const gradW = new Array<number>(featureCount).fill(0);
    let gradB = 0;

    for (let i = 0; i < n; i++) {
      const prediction = normalized[i].reduce((sum, v, j) => sum + v * weights[j], bias);
      const error = prediction - targets[i];

      for (let j = 0; j < featureCount; j++) {
        gradW[j] += (2 / n) * error * normalized[i][j];
      }
      gradB += (2 / n) * error;
    }

    for (let j = 0; j < featureCount; j++) {
      weights[j] -= learningRate * gradW[j];
    }
    bias -= learningRate * gradB;
  }

  return { means, stds, weights, bias };
}

function predictWithModel(model: ModelArtifacts, row: number[]): number {
  const normalized = row.map((v, i) => (v - model.means[i]) / model.stds[i]);
  return normalized.reduce((sum, v, j) => sum + v * model.weights[j], model.bias);
}

export async function buildMandiPriceForecast(
  filters: MandiFilters = {},
): Promise<PriceForecastResult> {
  const historyRecords = await fetchMandiPriceHistory(filters, 1000, 100);
  const dailyRaw = aggregateDailyModal(historyRecords);
  const daily = fillMissingDailyValues(dailyRaw);

  if (daily.length < 30) {
    throw new Error('Not enough historical data to generate reliable predictions.');
  }

  const dailyMap = new Map(daily.map((item) => [dayKey(item.date), item.value]));
  const values = daily.map((item) => item.value);

  const features: number[][] = [];
  const targets: number[] = [];

  for (let i = 7; i < daily.length; i++) {
    const date = daily[i].date;
    const lag1 = values[i - 1];
    const lag3 = values[i - 3];
    const lag7 = values[i - 7];
    const recentMean = (values[i - 1] + values[i - 2] + values[i - 3] + values[i - 4] + values[i - 5] + values[i - 6] + values[i - 7]) / 7;
    const dow = date.getDay();
    const month = date.getMonth() + 1;
    const seasonal = seasonalPriceLookup(date, dailyMap) ?? recentMean;

    features.push([lag1, lag3, lag7, recentMean, dow, month, seasonal]);
    targets.push(values[i]);
  }

  const model = trainLinearRegression(features, targets);

  const workingValues = [...values];
  const lastDate = daily[daily.length - 1].date;
  const predictions: PriceForecastPoint[] = [];

  for (let step = 1; step <= 7; step++) {
    const date = addDays(lastDate, step);
    const i = workingValues.length;
    const lag1 = workingValues[i - 1];
    const lag3 = workingValues[i - 3];
    const lag7 = workingValues[i - 7];
    const recentMean = (
      workingValues[i - 1] +
      workingValues[i - 2] +
      workingValues[i - 3] +
      workingValues[i - 4] +
      workingValues[i - 5] +
      workingValues[i - 6] +
      workingValues[i - 7]
    ) / 7;
    const dow = date.getDay();
    const month = date.getMonth() + 1;
    const seasonal = seasonalPriceLookup(date, dailyMap) ?? recentMean;

    const modelPrediction = predictWithModel(model, [lag1, lag3, lag7, recentMean, dow, month, seasonal]);
    const blended = (0.7 * modelPrediction) + (0.3 * seasonal);
    const predicted = Math.max(1, blended);

    workingValues.push(predicted);
    predictions.push({
      date: dayKey(date),
      day: formatDisplayDay(date),
      predictedModalPrice: Math.round(predicted),
    });
  }

  const bestDay = predictions.reduce((best, current) => (
    current.predictedModalPrice > best.predictedModalPrice ? current : best
  ));

  const latestDataDate = dayKey(lastDate);
  const currentModalPrice = Math.round(daily[daily.length - 1].value);
  const recommendation = bestDay.predictedModalPrice > currentModalPrice
    ? `Wait until ${bestDay.day} for higher price.`
    : 'Sell today';

  return {
    predictions,
    bestDay,
    recommendation,
    currentModalPrice,
    latestDataDate,
  };
}

export async function fetchMandiPrices(
  filters: MandiFilters = {},
  limit = 10,
): Promise<MandiRecord[]> {
  // If no filters provided, use default filters to get some data
  const effectiveFilters: MandiFilters = Object.keys(filters).length === 0
    ? { state: "Maharashtra" } // Default to Maharashtra to get some data
    : filters;

  const params = buildParams(effectiveFilters, limit, 0);

  console.log("Fetching mandi prices with URL:", `${API_URL}?${params}`);

  try {
    const response = await fetch(`${API_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error("API Response status:", response.status, response.statusText);
      // Try to get response text for more details
      const responseText = await response.text();
      console.error("API Response text:", responseText);
      throw new Error(`Failed to fetch mandi prices: ${response.status} ${response.statusText}`);
    }

    const data: MandiApiResponse = await response.json();
    console.log("API Response data:", data);

    const records = data.records ?? [];
    if (records.length === 0) {
      console.log("No records found in API response for filters:", effectiveFilters);

      // Only try fallback if no specific filters were provided
      if (Object.keys(filters).length === 0) {
        console.log("No filters provided, trying with default Maharashtra filter");

        const maharashtraParams = buildParams({ state: "Maharashtra" }, limit, 0);
        console.log("Trying with Maharashtra:", `${API_URL}?${maharashtraParams}`);

        const maharashtraResponse = await fetch(`${API_URL}?${maharashtraParams}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (maharashtraResponse.ok) {
          const maharashtraData: MandiApiResponse = await maharashtraResponse.json();
          console.log("Maharashtra fallback data:", maharashtraData.records?.length || 0, "records");
          return maharashtraData.records ?? [];
        }
      } else {
        // If specific filters were provided and no data found, return empty array
        // Let the calling code handle the fallback by filtering existing data
        console.log("Specific filters provided but no data found, returning empty array");
        return [];
      }
    }

    return records;
  } catch (error) {
    console.error("Error fetching mandi prices:", error);

    // Return mock data as fallback
    console.log("Returning mock data as fallback");
    return [
      {
        state: "Maharashtra",
        district: "Mumbai",
        market: "Vashi",
        commodity: "Tomato",
        variety: "Local",
        grade: "A",
        arrival_date: "28/03/2026",
        min_price: "20",
        max_price: "25",
        modal_price: "22"
      },
      {
        state: "Maharashtra",
        district: "Pune",
        market: "Pune",
        commodity: "Onion",
        variety: "Red",
        grade: "A",
        arrival_date: "28/03/2026",
        min_price: "15",
        max_price: "18",
        modal_price: "16"
      },
      {
        state: "Delhi",
        district: "Delhi",
        market: "Azadpur",
        commodity: "Potato",
        variety: "Local",
        grade: "A",
        arrival_date: "28/03/2026",
        min_price: "12",
        max_price: "15",
        modal_price: "13"
      }
    ];
  }
}
