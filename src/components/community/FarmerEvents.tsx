import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, Clock, MapPin, Plus, Users, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface FarmerEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  coordinates: any;
  max_attendees: number | null;
  current_attendees: number;
  event_type: string | null;
  is_free: boolean;
  created_at: string;
  organizer_id: string;
  profiles?: {
    full_name: string | null;
  };
  user_rsvp?: {
    rsvp_status: string;
  };
}

const FarmerEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<FarmerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    max_attendees: "",
    event_type: "meetup",
    is_free: true
  });

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from("farmer_events")
        .select(`
          *,
          profiles(full_name)
        `)
        .order("event_date", { ascending: true });

      if (user) {
        query = query.select(`
          *,
          profiles(full_name),
          event_attendees!inner(rsvp_status)
        `);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("farmer_events")
        .insert({
          title: newEvent.title,
          description: newEvent.description,
          event_date: new Date(newEvent.event_date).toISOString(),
          location: newEvent.location,
          max_attendees: newEvent.max_attendees ? parseInt(newEvent.max_attendees) : null,
          event_type: newEvent.event_type,
          is_free: newEvent.is_free,
          organizer_id: user.id
        });

      if (error) throw error;

      toast.success("Event created successfully!");
      setIsCreateDialogOpen(false);
      setNewEvent({
        title: "",
        description: "",
        event_date: "",
        location: "",
        max_attendees: "",
        event_type: "meetup",
        is_free: true
      });
      fetchEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    }
  };

  const handleRSVP = async (eventId: string, status: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("event_attendees")
        .upsert({
          event_id: eventId,
          user_id: user.id,
          rsvp_status: status
        });

      if (error) throw error;

      toast.success(`RSVP ${status === 'attending' ? 'confirmed' : status === 'maybe' ? 'marked as maybe' : 'cancelled'}`);
      fetchEvents();
    } catch (error) {
      console.error("Error updating RSVP:", error);
      toast.error("Failed to update RSVP");
    }
  };

  const upcomingEvents = events.filter(event => new Date(event.event_date) > new Date());
  const pastEvents = events.filter(event => new Date(event.event_date) <= new Date());

  const eventTypes = [
    { value: "meetup", label: "Meetup", color: "bg-blue-100 text-blue-800" },
    { value: "workshop", label: "Workshop", color: "bg-green-100 text-green-800" },
    { value: "market-visit", label: "Market Visit", color: "bg-yellow-100 text-yellow-800" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Farmer Events</h2>
          <p className="text-muted-foreground">Connect with fellow farmers at meetups and workshops</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Organize a meetup, workshop, or market visit for the farming community.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Organic Farming Workshop"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the event, what attendees will learn, etc."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event_date">Event Date & Time</Label>
                  <Input
                    id="event_date"
                    type="datetime-local"
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, event_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Community Center, Delhi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="event_type">Event Type</Label>
                  <Select value={newEvent.event_type} onValueChange={(value) => setNewEvent(prev => ({ ...prev, event_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="max_attendees">Max Attendees</Label>
                  <Input
                    id="max_attendees"
                    type="number"
                    value={newEvent.max_attendees}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, max_attendees: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_free"
                    checked={newEvent.is_free}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, is_free: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is_free">Free Event</Label>
                </div>
              </div>

              <Button onClick={createEvent} className="w-full">
                Create Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Events */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-600" />
          Upcoming Events
        </h3>
        <div className="grid gap-4">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} onRSVP={handleRSVP} />
          ))}
        </div>

        {upcomingEvents.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No upcoming events</h3>
            <p className="text-muted-foreground">
              Be the first to organize a farmer meetup or workshop!
            </p>
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Past Events
          </h3>
          <div className="grid gap-4">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} onRSVP={handleRSVP} isPast />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const EventCard = ({ event, onRSVP, isPast = false }: {
  event: FarmerEvent;
  onRSVP: (eventId: string, status: string) => void;
  isPast?: boolean;
}) => {
  const { user } = useAuth();
  const eventTypeInfo = [
    { value: "meetup", label: "Meetup", color: "bg-blue-100 text-blue-800" },
    { value: "workshop", label: "Workshop", color: "bg-green-100 text-green-800" },
    { value: "market-visit", label: "Market Visit", color: "bg-yellow-100 text-yellow-800" }
  ].find(type => type.value === event.event_type);

  const userRSVP = event.user_rsvp?.rsvp_status;
  const isAttending = userRSVP === 'attending';
  const isMaybe = userRSVP === 'maybe';
  const isDeclined = userRSVP === 'declined';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {isPast && (
        <Badge className="absolute -top-2 -right-2 bg-gray-500">
          Past Event
        </Badge>
      )}

      <Card className={`overflow-hidden ${isPast ? 'opacity-75' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{event.title}</CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2">
                <span>Organized by {event.profiles?.full_name || "Anonymous"}</span>
                <Badge className={eventTypeInfo?.color}>
                  {eventTypeInfo?.label}
                </Badge>
                {!event.is_free && <Badge variant="destructive">Paid Event</Badge>}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-foreground">{event.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(event.event_date).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {event.current_attendees}{event.max_attendees ? `/${event.max_attendees}` : ''} attending
              </span>
            </div>

            {!isPast && user && (
              <div className="flex gap-2">
                {!isAttending && !isDeclined && (
                  <Button
                    size="sm"
                    variant={isMaybe ? "default" : "outline"}
                    onClick={() => onRSVP(event.id, isMaybe ? 'attending' : 'maybe')}
                  >
                    {isMaybe ? <CheckCircle className="h-4 w-4 mr-1" /> : null}
                    {isMaybe ? 'Going' : 'Maybe'}
                  </Button>
                )}
                {!isDeclined && (
                  <Button
                    size="sm"
                    variant={isAttending ? "default" : "outline"}
                    onClick={() => onRSVP(event.id, isAttending ? 'declined' : 'attending')}
                  >
                    {isAttending ? <CheckCircle className="h-4 w-4 mr-1" /> : null}
                    {isAttending ? 'Going' : 'Attend'}
                  </Button>
                )}
                {(isAttending || isMaybe) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRSVP(event.id, 'declined')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FarmerEvents;