import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar as CalendarIcon, MapPin, ArrowLeft, Users, UserCheck, Loader2, Briefcase, GraduationCap } from "lucide-react";
import { useEventDetails } from "@/hooks/use-api";
import { useLocation, useRoute } from "wouter";

export default function EventDetails() {
  const [match, params] = useRoute("/faculty/events/:id");
  const eventId = params?.id;
  const [, setLocation] = useLocation();
  const { data, isLoading, error } = useEventDetails(eventId);

  console.log("Event Details Debug:", { match, eventId, data, isLoading, error });

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Layout role="faculty">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!data || !data.event) {
    return (
      <Layout role="faculty">
        <div className="text-center py-12">
          <p className="text-gray-500">Event not found</p>
          {error && <p className="text-red-500 text-sm mt-2">Error: {error.message}</p>}
          <p className="text-xs text-gray-400 mt-2">Event ID: {eventId || 'none'}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setLocation('/faculty/events')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
          </Button>
        </div>
      </Layout>
    );
  }

  const { event, registrations = [], volunteers = [], stats } = data;

  return (
    <Layout role="faculty">
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation('/faculty/events')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Event Details</h1>
            <p className="text-muted-foreground">View registrations and volunteers</p>
          </div>
        </div>

        {/* Event Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{event.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.total_registrations}</div>
                  <div className="text-xs text-gray-500">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.total_volunteers}</div>
                  <div className="text-xs text-gray-500">Volunteers</div>
                </div>
              </div>
            </div>
          </CardHeader>
          {event.description && (
            <CardContent>
              <p className="text-gray-700">{event.description}</p>
            </CardContent>
          )}
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Registered Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Registered Students ({stats.total_registrations})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {registrations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No students registered yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {registrations.map((reg) => (
                    <div 
                      key={reg.user_id} 
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {reg.name?.charAt(0) || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{reg.name}</p>
                        <p className="text-sm text-gray-500 truncate">{reg.email}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {reg.branch && (
                            <Badge variant="outline" className="text-xs">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              {reg.branch}
                            </Badge>
                          )}
                          {reg.year && (
                            <Badge variant="outline" className="text-xs">
                              Year {reg.year}
                            </Badge>
                          )}
                          {reg.status && (
                            <Badge 
                              variant={reg.status === 'registered' ? 'default' : 'secondary'} 
                              className="text-xs"
                            >
                              {reg.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Volunteer Alumni */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                Volunteer Alumni ({stats.total_volunteers})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {volunteers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No alumni volunteers yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {volunteers.map((volunteer) => (
                    <div 
                      key={volunteer.user_id} 
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {volunteer.name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{volunteer.name}</p>
                        <p className="text-sm text-gray-500 truncate">{volunteer.email}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {volunteer.role && volunteer.company && (
                            <Badge variant="outline" className="text-xs">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {volunteer.role} @ {volunteer.company}
                            </Badge>
                          )}
                          {volunteer.expertise && (
                            <Badge variant="secondary" className="text-xs">
                              {volunteer.expertise}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
