import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, MapPin, Loader2 } from "lucide-react";
import { useAlumniEvents, useVolunteerEvent } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import { useRoute } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export default function AlumniEvents() {
  const [match, params] = useRoute("/alumni/events/:id");
  const highlightedEventId = params?.id ? Number(params.id) : null;
  const { data: events = [], isLoading, refetch } = useAlumniEvents();
  const volunteerMutation = useVolunteerEvent();
  const { toast } = useToast();
  const eventRefs = useRef({});
  const [loadingEventId, setLoadingEventId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("[AlumniEvents] Events data:", events);
    events.forEach((event) => {
      console.log(`[AlumniEvents] Event ${event.id}:`, {
        title: event.title,
        is_volunteered: event.is_volunteered,
        type: typeof event.is_volunteered
      });
    });
  }, [events]);

  useEffect(() => {
    // Scroll to highlighted event after events are loaded
    if (highlightedEventId && eventRefs.current[highlightedEventId]) {
      setTimeout(() => {
        eventRefs.current[highlightedEventId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [highlightedEventId, events]);

  const handleVolunteer = async (eventId, isCurrentlyVolunteered) => {
    setLoadingEventId(eventId);
    try {
      await volunteerMutation.mutateAsync(eventId);
      // Invalidate and refetch
      await queryClient.invalidateQueries(["alumni-events"]);
      await queryClient.refetchQueries(["alumni-events"]);
      setLoadingEventId(null);
      if (isCurrentlyVolunteered) {
        toast({ title: "Success", description: "You've unvolunteered from this event!" });
      } else {
        toast({ title: "Success", description: "You've volunteered for this event!" });
      }
    } catch (error) {
      setLoadingEventId(null);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Layout role="alumni">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  return (
    <Layout role="alumni">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alumni Events</h1>
          <p className="text-muted-foreground">Stay connected with your alma mater through these events.</p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming events at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card 
                key={event.id} 
                ref={el => eventRefs.current[event.id] = el}
                className={`flex flex-col transition-all duration-300 ${
                  highlightedEventId === event.id ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
              >
                <div className="h-32 bg-primary/10 w-full relative">
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-md text-center shadow-sm">
                    <span className="block text-xs text-gray-500 uppercase font-semibold">Event</span>
                    <span className="block text-xl font-bold text-primary">{event.id}</span>
                  </div>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{event.description || 'No description available'}</p>
                  </div>
                  
                  <div className="space-y-2 mt-auto text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location || 'Location TBA'}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    {event.is_volunteered === true || event.is_volunteered === 'true' ? (
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleVolunteer(event.id, true)}
                        disabled={loadingEventId === event.id}
                      >
                        {loadingEventId === event.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "✓ Volunteered"
                        )}
                      </Button>
                    ) : (
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => handleVolunteer(event.id, false)}
                        disabled={loadingEventId === event.id}
                      >
                        {loadingEventId === event.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Volunteer"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
