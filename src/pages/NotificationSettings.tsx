import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PageLayout from "@/components/PageLayout";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, Package, Users, ShieldCheck, TrendingUp, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Preferences {
  order_notifications: boolean;
  group_buy_notifications: boolean;
  verification_notifications: boolean;
  price_alerts: boolean;
  system_notifications: boolean;
}

const defaultPrefs: Preferences = {
  order_notifications: true,
  group_buy_notifications: true,
  verification_notifications: true,
  price_alerts: true,
  system_notifications: true,
};

const prefItems = [
  { key: "order_notifications" as const, label: "Order Updates", desc: "Order placed, status changes, delivery confirmations", icon: Package },
  { key: "group_buy_notifications" as const, label: "Group Buy Alerts", desc: "New group buys, member joins, deadline warnings", icon: Users },
  { key: "verification_notifications" as const, label: "Verification Updates", desc: "Submission confirmations, approval or rejection status", icon: ShieldCheck },
  { key: "price_alerts" as const, label: "Price Alerts", desc: "Price threshold alerts, market trend notifications", icon: TrendingUp },
  { key: "system_notifications" as const, label: "System Messages", desc: "Platform updates, new features, maintenance notices", icon: Info },
];

const NotificationSettings = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setPrefs({
          order_notifications: data.order_notifications,
          group_buy_notifications: data.group_buy_notifications,
          verification_notifications: data.verification_notifications,
          price_alerts: data.price_alerts,
          system_notifications: data.system_notifications,
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({ user_id: user.id, ...prefs }, { onConflict: "user_id" });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to save preferences", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Notification preferences updated" });
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <PageLayout>
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <Bell className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Notification Settings</h1>
              <p className="text-sm text-muted-foreground">Choose which notifications you'd like to receive</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Types</CardTitle>
              <CardDescription>Toggle on or off the types of notifications you want</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <>
                  {prefItems.map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <item.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <Label htmlFor={item.key} className="font-medium text-foreground">{item.label}</Label>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      <Switch
                        id={item.key}
                        checked={prefs[item.key]}
                        onCheckedChange={(checked) => setPrefs((p) => ({ ...p, [item.key]: checked }))}
                      />
                    </div>
                  ))}
                  <div className="pt-4 border-t border-border">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Save Preferences
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </PageLayout>
  );
};

export default NotificationSettings;
