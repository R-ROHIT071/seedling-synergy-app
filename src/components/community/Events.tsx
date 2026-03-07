import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Plus, Search, Users } from "lucide-react";
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
  profiles?: { full_name: string | null; avatar_url: string | null };
  user_rsvp?: string;
}

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<FarmerEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const eventTypes = [
    { value: "meetup", label: "Meetup", color: "bg-blue-100 text-blue-800" },
    { value: "workshop", label: "Workshop", color: "bg-green-100 text-green-800" },
    { value: "market-visit", label: "Market Visit", color: "bg-yellow-100 text-yellow-800" },
  ];

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from("farmer_events")
        .select(`
          *,
          profiles:organizer_id (
            full_name,
            avatar_url
          )
        `)
        .order("event_date", { ascending: true });

      if (user) {
        // Also fetch user's RSVP status
        query = query.select(`
          *,
          profiles:organizer_id (
            full_name,
            avatar_url
          ),
          event_attendees!inner(rsvp_status)
        `);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process RSVP status
      const processedEvents = data?.map(event => ({
        ...event,
        user_rsvp: event.event_attendees?.[0]?.rsvp_status || null
      })) || [];

      setEvents(processedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (formData: {
    title: string;
    description: string;
    event_date: string;
    location: string;
    max_attendees: number;
    event_type: string;
    is_free: boolean;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("farmer_events")
        .insert({
          title: formData.title,
          description: formData.description,
          event_date: formData.event_date,
          location: formData.location,
          max_attendees: formData.max_attendees,
          event_type: formData.event_type,
          is_free: formData.is_free,
          organizer_id: user.id,
        });

      if (error) throw error;

      toast.success("Event created successfully!");
      setIsCreateEventOpen(false);
      fetchEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    }
  };

  const rsvpToEvent = async (eventId: string, rsvpStatus: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("event_attendees")
        .upsert({
          event_id: eventId,
          user_id: user.id,
          rsvp_status: rsvpStatus,
        });

      if (error) throw error;

      toast.success(`RSVP ${rsvpStatus} confirmed!`);
      fetchEvents();
    } catch (error) {
      console.error("Error RSVPing to event:", error);
      toast.error("Failed to RSVP");
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || event.event_type === selectedType;
    return matchesSearch && matchesType;
  });

  const upcomingEvents = filteredEvents.filter(event =>
    new Date(event.event_date) > new Date()
  );
  const pastEvents = filteredEvents.filter(event =>
    new Date(event.event_date) <= new Date()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            {eventTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {user && (
          <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
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
                  Organize a meetup, workshop, or market visit for fellow farmers.
                </DialogDescription>
              </DialogHeader>
              <CreateEventForm onSubmit={createEvent} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6 text-green-600" />
          Upcoming Events
        </h2>
        {upcomingEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
              <p className="text-gray-600">Be the first to organize an event for farmers!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRsvp={rsvpToEvent}
                user={user}
                isUpcoming={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-gray-600" />
            Past Events
          </h2>
          <div className="grid gap-4">
            {pastEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRsvp={rsvpToEvent}
                user={user}
                isUpcoming={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const EventCard = ({ event, onRsvp, user, isUpcoming }: {
  event: FarmerEvent;
  onRsvp: (eventId: string, status: string) => void;
  user: any;
  isUpcoming: boolean;
}) => {
  const eventType = event.event_type ? {
    meetup: { label: "Meetup", color: "bg-blue-100 text-blue-800" },
    workshop: { label: "Workshop", color: "bg-green-100 text-green-800" },
    "market-visit": { label: "Market Visit", color: "bg-yellow-100 text-yellow-800" },
  }[event.event_type] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-xl">{event.title}</CardTitle>
                {eventType && (
                  <Badge className={eventType.color}>
                    {eventType.label}
                  </Badge>
                )}
                {!event.is_free && (
                  <Badge variant="outline">Paid Event</Badge>
                )}
              </div>
              <CardDescription className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(event.event_date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-700">{event.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {event.current_attendees}
                {event.max_attendees && `/${event.max_attendees}`} attending
              </div>
              <span>Organized by {event.profiles?.full_name || "Anonymous"}</span>
            </div>

            {user && isUpcoming && (
              <div className="flex gap-2">
                {event.user_rsvp === 'attending' ? (
                  <Button variant="outline" disabled>
                    ✓ Attending
                  </Button>
                ) : event.user_rsvp === 'maybe' ? (
                  <Button variant="outline" disabled>
                    ? Maybe
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRsvp(event.id, 'attending')}
                    >
                      Attend
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRsvp(event.id, 'maybe')}
                    >
                      Maybe
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CreateEventForm = ({ onSubmit }: {
  onSubmit: (data: {
    title: string;
    description: string;
    event_date: string;
    location: string;
    max_attendees: number;
    event_type: string;
    is_free: boolean;
  }) => void
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    max_attendees: 50,
    event_type: "meetup",
    is_free: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: "",
      description: "",
      event_date: "",
      location: "",
      max_attendees: 50,
      event_type: "meetup",
      is_free: true
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Event Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter event title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the event, what farmers will learn or do..."
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Event Date & Time</label>
          <Input
            type="datetime-local"
            value={formData.event_date}
            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="City, Venue"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Event Type</label>
          <select
            value={formData.event_type}
            onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="meetup">Meetup</option>
            <option value="workshop">Workshop</option>
            <option value="market-visit">Market Visit</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Max Attendees</label>
          <Input
            type="number"
            value={formData.max_attendees}
            onChange={(e) => setFormData({ ...formData, max_attendees: parseInt(e.target.value) || 50 })}
            min="1"
            max="500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Event Type</label>
          <select
            value={formData.is_free ? "free" : "paid"}
            onChange={(e) => setFormData({ ...formData, is_free: e.target.value === "free" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      <Button type="submit" className="w-full">Create Event</Button>
    </form>
  );
};

export default Events;