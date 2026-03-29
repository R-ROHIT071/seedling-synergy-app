import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchMandiPrices, MandiFilters } from "@/lib/mandiPrices";
import { Loader2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface MandiPricesWidgetProps {
  filters?: MandiFilters;
  title?: string;
}

export default function MandiPricesWidget({ filters = {}, title = "Current Mandi Prices" }: MandiPricesWidgetProps) {
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPrices = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Loading mandi prices with filters:", filters);

        // If no filters provided, try to get some default data
        const defaultFilters: MandiFilters = Object.keys(filters).length === 0
          ? { State: "Maharashtra" } as MandiFilters // Try with a default state
          : filters;

        const data = await fetchMandiPrices(defaultFilters, 10);
        console.log("Mandi prices loaded:", data);
        setPrices(data);
      } catch (err) {
        console.error("Failed to load mandi prices:", err);
        setError("Failed to load mandi prices. Showing sample data instead.");
        // The API function now returns mock data on error, so we don't need to set sample data here
      } finally {
        setLoading(false);
      }
    };

    loadPrices();
  }, [filters]);

  // For now, show a simple message instead of complex UI to debug
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading mandi prices...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Showing sample data instead.
          </p>
          {/* Show sample data when API fails */}
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium">Tomato</p>
                <p className="text-sm text-muted-foreground">
                  Vashi, Mumbai
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">₹22/kg</p>
                <Badge variant="outline" className="text-xs">
                  Sample Data
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium">Onion</p>
                <p className="text-sm text-muted-foreground">
                  Pune, Pune
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">₹16/kg</p>
                <Badge variant="outline" className="text-xs">
                  Sample Data
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (prices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No price data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prices.slice(0, 3).map((price, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium">{price.commodity}</p>
                <p className="text-sm text-muted-foreground">
                  {price.market}, {price.district}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">₹{price.modal_price}/kg</p>
                <Badge variant="outline" className="text-xs">
                  {price.arrival_date}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}