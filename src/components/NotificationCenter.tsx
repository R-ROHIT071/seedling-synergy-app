import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, Package, Users, ShieldCheck, TrendingUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

const typeIcons: Record<string, React.ReactNode> = {
  order: <Package className="h-4 w-4 text-primary" />,
  group_buy: <Users className="h-4 w-4 text-accent" />,
  verification: <ShieldCheck className="h-4 w-4 text-primary" />,
  price_alert: <TrendingUp className="h-4 w-4 text-destructive" />,
  system: <Info className="h-4 w-4 text-muted-foreground" />,
};

const NotificationItem = ({
  notification,
  onRead,
  onDelete,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => (
  <div
    className={`flex items-start gap-3 p-3 border-b border-border last:border-0 transition-colors cursor-pointer ${
      notification.read ? "opacity-60" : "bg-secondary/30"
    }`}
    onClick={() => !notification.read && onRead(notification.id)}
  >
    <div className="mt-0.5 shrink-0">
      {typeIcons[notification.type] || typeIcons.system}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground leading-tight">
        {notification.title}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
        {notification.message}
      </p>
      <p className="text-[10px] text-muted-foreground mt-1">
        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
      </p>
    </div>
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 shrink-0"
      onClick={(e) => {
        e.stopPropagation();
        onDelete(notification.id);
      }}
    >
      <Trash2 className="h-3 w-3" />
    </Button>
  </div>
);

const NotificationCenter = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center bg-destructive text-destructive-foreground border-2 border-background">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
