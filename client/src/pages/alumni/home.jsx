import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PenTool, MessageSquare, Calendar, Users, Loader2, Bell, TrendingUp, Clock, GraduationCap } from "lucide-react";
import { useRecentQuestions, useAlumniEvents, useVolunteerEvent } from "@/hooks/use-api";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function AlumniHome() {
  const { data: questions, isLoading: questionsLoading, error: questionsError } = useRecentQuestions();
  const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useAlumniEvents();
  const volunteerMutation = useVolunteerEvent();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const userName = localStorage.getItem("email")?.split("@")[0] || "Alumni";
  const [loadingEventId, setLoadingEventId] = useState(null);
  const queryClient = useQueryClient();
  
  // Log errors for debugging
  if (questionsError) {
    console.error("[Alumni Home] Questions error:", questionsError);
  }

  const getGreeting = () => {
    return "Hi";
  };

  const handleVolunteer = async (eventId, isCurrentlyVolunteered) => {
    setLoadingEventId(eventId);
    try {
      await volunteerMutation.mutateAsync(eventId);
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

  return (
    <Layout role="alumni">
      <div className="space-y-6">
        
        {/* Greeting Section */}
        <div className="bg-gradient-to-r from-[#800000] to-[#600000] text-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-2 text-white">{getGreeting()}, {userName}</h1>
          <p className="text-white/90">Thank you for contributing to the RGUKT RKV community</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation('/alumni/post-insight')}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-[#800000]/10 p-3 rounded-lg">
                  <PenTool className="h-6 w-6 text-[#800000]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">Share Your Insights</h3>
                  <p className="text-sm text-gray-600">Post career advice and industry experiences to guide students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation('/alumni/communities')}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">View Communities</h3>
                  <p className="text-sm text-gray-600">Browse forums to post questions and replies with students</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Questions Waiting */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Questions Waiting for You</h2>
              <Button variant="link" className="text-[#800000] font-semibold" onClick={() => setLocation('/alumni/communities')}>
                View all →
              </Button>
            </div>

            {questionsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-[#800000]" />
              </div>
            ) : questionsError ? (
              <Card className="border border-red-200 bg-red-50">
                <CardContent className="p-8 text-center">
                  <p className="text-red-600 font-semibold">Failed to load questions</p>
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
            ) : questions && questions.length > 0 ? (
              questions.slice(0, 3).map((question) => {
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
                    className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => setLocation(`/alumni/communities/${question.communityId}`)}
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-[#800000]/10 text-[#800000] hover:bg-[#800000]/10">
                          {question.communityName}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeText}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 group-hover:text-[#800000] transition-colors">
                        {question.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {question.content}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {question.author_name}
                        </span>
                        {question.answerCount > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {question.answerCount} answer{question.answerCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="border border-gray-200">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No questions at the moment. Check back later!</p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Upcoming Events */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
              <Button variant="link" className="text-[#800000] font-semibold" onClick={() => setLocation('/alumni/events')}>
                View all →
              </Button>
            </div>

            {eventsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-[#800000]" />
              </div>
            ) : events.length > 0 ? (
              events.slice(0, 2).map((event) => (
                <Card key={event.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#800000]" />
                          <span className="text-sm font-semibold text-gray-900">{formatDate(event.date)}</span>
                        </div>
                        <h4 className="font-bold text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{event.description || 'No description available'}</p>
                        {event.location && (
                          <p className="text-xs text-gray-500">{event.location}</p>
                        )}
                      </div>
                    </div>
                    {event.is_volunteered === true || event.is_volunteered === 'true' ? (
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleVolunteer(event.id, true)}
                        disabled={loadingEventId === event.id}
                      >
                        {loadingEventId === event.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          '✓ Volunteered'
                        )}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-[#800000] hover:bg-[#600000]"
                        onClick={() => handleVolunteer(event.id, false)}
                        disabled={loadingEventId === event.id}
                      >
                        {loadingEventId === event.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Volunteer for Event'
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border border-gray-200">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">No upcoming events at the moment</p>
                  <p className="text-xs text-gray-400 mt-1">Check back later for new opportunities</p>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}
