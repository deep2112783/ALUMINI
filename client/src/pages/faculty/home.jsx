import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Megaphone, CheckCircle, Loader2, Plus, Send, ArrowRight, Clock, MapPin, UserPlus, MessageSquare } from "lucide-react";
import { useFacultyEvents, useFacultyAlumni, useRecentQuestions } from "@/hooks/use-api";
import { useLocation } from "wouter";

export default function FacultyHome() {
  const { data: events = [], isLoading: loadingEvents } = useFacultyEvents();
  const { data: alumni = [] } = useFacultyAlumni();
  const { data: questions = [], isLoading: questionsLoading, error: questionsError } = useRecentQuestions();
  const [, setLocation] = useLocation();
  
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
  const pastEvents = events.filter(e => new Date(e.date) < new Date()).sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Get user info
  const userEmail = localStorage.getItem("email") || "";
  const userName = userEmail.split("@")[0].split(".").map(n => 
    n.charAt(0).toUpperCase() + n.slice(1)
  ).join(" ");
  
  return (
    <Layout role="faculty">
      <div className="space-y-8 fade-in-up max-w-7xl mx-auto">
        
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-purple-500/10 rounded-2xl p-8 border border-primary/20">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">
                Hi, {userName}
              </h1>
              <p className="text-gray-600 text-lg">Faculty Coordinator • Alumni Relations</p>
              <p className="text-sm text-gray-500 mt-2">Manage events, coordinate with alumni, and strengthen community connections</p>
            </div>
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg hover:shadow-xl smooth-transition"
              onClick={() => setLocation('/faculty/create-event')}
            >
              <Plus className="mr-2 h-5 w-5" /> New Event
            </Button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="border border-gray-200 hover:border-primary/50 hover:shadow-lg smooth-transition cursor-pointer group"
            onClick={() => setLocation('/faculty/create-event')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 smooth-transition">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 smooth-transition" />
              </div>
              <h3 className="font-bold text-gray-900 mt-4 mb-1">Create Event</h3>
              <p className="text-sm text-gray-500">Schedule new alumni events</p>
            </CardContent>
          </Card>
          
          <Card 
            className="border border-gray-200 hover:border-primary/50 hover:shadow-lg smooth-transition cursor-pointer group"
            onClick={() => setLocation('/faculty/coordination')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 smooth-transition">
                  <UserPlus className="h-6 w-6 text-green-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 smooth-transition" />
              </div>
              <h3 className="font-bold text-gray-900 mt-4 mb-1">Send Invitations</h3>
              <p className="text-sm text-gray-500">Invite alumni to events</p>
            </CardContent>
          </Card>
          
          <Card 
            className="border border-gray-200 hover:border-primary/50 hover:shadow-lg smooth-transition cursor-pointer group"
            onClick={() => setLocation('/faculty/coordination')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 smooth-transition">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 smooth-transition" />
              </div>
              <h3 className="font-bold text-gray-900 mt-4 mb-1">Alumni Directory</h3>
              <p className="text-sm text-gray-500">View and manage alumni</p>
            </CardContent>
          </Card>
        </div>

        {/* Student Questions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Recent Student Questions</h2>
            <Button 
              variant="outline"
              onClick={() => setLocation('/faculty/communities')}
              className="font-semibold"
            >
              View All Communities <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {questionsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : questionsError ? (
            <Card className="border border-red-200 bg-red-50">
              <CardContent className="p-8 text-center">
                <p className="text-red-600 font-semibold">Failed to load student questions</p>
                <p className="text-sm text-red-500 mt-1">{questionsError.message}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : questions.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-12 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions yet</h3>
                <p className="text-gray-500">Students haven't posted any questions in communities</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questions.slice(0, 6).map((question) => {
                const timeAgo = new Date(question.created_at);
                const now = new Date();
                const diffMs = now - timeAgo;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);
                
                let timeText = '';
                if (diffMins < 60) timeText = `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
                else if (diffHours < 24) timeText = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                else timeText = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

                return (
                  <Card 
                    key={question.id} 
                    className="border border-gray-200 hover:shadow-lg smooth-transition cursor-pointer group"
                    onClick={() => setLocation(`/faculty/communities/${question.communityId}`)}
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                          {question.communityName}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeText}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 group-hover:text-primary smooth-transition line-clamp-2">
                        {question.title}
                      </h4>
                      {question.content && (
                        <p className="text-sm text-gray-600 line-clamp-3">{question.content}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {question.answer_count || 0} {(question.answer_count || 0) === 1 ? 'answer' : 'answers'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Events Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Your Events</h2>
            <Button 
              variant="outline"
              onClick={() => setLocation('/faculty/events')}
              className="font-semibold"
            >
              View All Events <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {loadingEvents ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : events.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-12 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
                <p className="text-gray-500 mb-6">Start by creating your first event to connect with alumni</p>
                <Button 
                  onClick={() => setLocation('/faculty/create-event')}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" /> Create First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Upcoming Events
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingEvents.slice(0, 4).map((event) => (
                      <Card 
                        key={event.id} 
                        className="border border-gray-200 hover:shadow-lg smooth-transition cursor-pointer group"
                        onClick={() => setLocation('/faculty/events')}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wide">
                              Upcoming
                            </span>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 smooth-transition" />
                          </div>
                          <h4 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2">{event.title}</h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{new Date(event.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="line-clamp-1">{event.location}</span>
                              </div>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-500 mt-3 line-clamp-2">{event.description}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-gray-500" />
                    Recent Past Events
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pastEvents.slice(0, 2).map((event) => (
                      <Card 
                        key={event.id} 
                        className="border border-gray-200 hover:shadow-lg smooth-transition cursor-pointer group opacity-75 hover:opacity-100"
                        onClick={() => setLocation('/faculty/events')}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wide">
                              Completed
                            </span>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 smooth-transition" />
                          </div>
                          <h4 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2">{event.title}</h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{new Date(event.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
