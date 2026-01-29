import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, MapPin, Loader2, Check, X, Heart, MessageCircle, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEvents, useRegisterEvent, useAddEventComment, useReactToEvent, useUnreactToEvent, useEventComments } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";

function EventCommentSection({ eventId, isOpen }) {
  const { data: comments = [], isLoading, refetch } = useEventComments(eventId);
  const addCommentMutation = useAddEventComment();
  const { toast } = useToast();
  const [commentInput, setCommentInput] = useState("");
  const userEmail = localStorage.getItem("email") || "Student";
  const userName = userEmail.split("@")[0];

  const handleAddComment = async () => {
    if (!commentInput.trim()) {
      toast({ title: "Error", description: "Please enter a comment", variant: "destructive" });
      return;
    }

    try {
      await addCommentMutation.mutateAsync({ eventId, content: commentInput });
      setCommentInput("");
      refetch();
      toast({ title: "Success", description: "Comment added!", duration: 2000 });
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to add comment", variant: "destructive" });
    }
  };

  const formatCommentDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="mt-6 pt-6 border-t space-y-4">
      <h4 className="text-sm font-semibold text-gray-900">Comments ({comments.length})</h4>
      
      {/* Comment Input */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-primary/20 text-primary font-semibold">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Add a comment..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={addCommentMutation.isPending || !commentInput.trim()}
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs bg-primary/20 text-primary font-semibold">
                  {comment.author_name?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <p className="text-sm font-semibold text-gray-900">{comment.author_name}</p>
                  <p className="text-sm text-gray-700 break-words">{comment.content}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{formatCommentDate(comment.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Events() {
  const { data: events = [], isLoading } = useEvents();
  const registerMutation = useRegisterEvent();
  const reactMutation = useReactToEvent();
  const unreactMutation = useUnreactToEvent();
  const { toast } = useToast();
  const [registeredEvents, setRegisteredEvents] = useState(() => {
    const saved = localStorage.getItem('registeredEvents');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [match, params] = useRoute("/student/events/:id");
  const [, navigate] = useLocation();
  const [loadingEventId, setLoadingEventId] = useState(null);

  const handleRegister = async (eventId, isCurrentlyRegistered) => {
    setLoadingEventId(eventId);
    registerMutation.mutate(eventId, {
      onSuccess: () => {
        setRegisteredEvents(prev => {
          let newSet;
          if (isCurrentlyRegistered) {
            // Unregister
            newSet = new Set([...prev].filter(id => id !== eventId));
            localStorage.setItem('registeredEvents', JSON.stringify([...newSet]));
            toast({
              title: "Unregistered",
              description: "You have been unregistered from this event.",
            });
          } else {
            // Register
            newSet = new Set([...prev, eventId]);
            localStorage.setItem('registeredEvents', JSON.stringify([...newSet]));
            toast({
              title: "Registration Successful",
              description: "You have been registered for this event.",
            });
          }
          setLoadingEventId(null);
          return newSet;
        });
      },
      onError: (error) => {
        setLoadingEventId(null);
        toast({
          title: "Failed",
          description: error.message || "Failed to update registration.",
          variant: "destructive",
        });
      },
    });
  };

  const handleEventLike = async (event) => {
    try {
      if (event.liked_by_user) {
        await unreactMutation.mutateAsync(event.id);
        toast({ title: "Success", description: "Removed like", duration: 2000 });
      } else {
        await reactMutation.mutateAsync({ eventId: event.id, reactionType: "like" });
        toast({ title: "Success", description: "Liked this event!", duration: 2000 });
      }
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to update like", variant: "destructive", duration: 2000 });
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

  // Handle URL-based event selection
  useEffect(() => {
    if (match && params?.id && events.length > 0) {
      const eventId = parseInt(params.id);
      const event = events.find(e => e.id === eventId);
      if (event) {
        setSelectedEvent(event);
      }
    }
  }, [match, params, events]);

  if (isLoading) {
    return (
      <Layout role="student">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upcoming Events</h1>
          <p className="text-muted-foreground">Workshops, webinars, and meetups organized by the college.</p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming events at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event) => (
              <div key={event.id} onClick={() => setSelectedEvent(event)} className="cursor-pointer">
                <Card className="flex flex-col hover:shadow-lg transition-shadow h-full">
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

                    <div className="mt-6">
                      {registeredEvents.has(event.id) ? (
                        <Button 
                          className="w-full bg-green-600 hover:bg-red-600 gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegister(event.id, true);
                          }}
                          disabled={loadingEventId === event.id}
                        >
                          {loadingEventId === event.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              Registered
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegister(event.id, false);
                          }}
                          disabled={loadingEventId === event.id}
                        >
                          {loadingEventId === event.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Register Now"
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Event Detail Modal */}
        <Dialog open={!!selectedEvent} onOpenChange={(open) => {
          if (!open) {
            setSelectedEvent(null);
            setShowComments(false);
            if (match) navigate("/student/events");
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedEvent && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedEvent.title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 uppercase font-semibold">Event ID</p>
                      <p className="font-medium text-gray-900">#{selectedEvent.id}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 uppercase font-semibold">Date</p>
                      <div className="flex items-center gap-3 text-gray-900">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        <p className="font-medium">{formatDate(selectedEvent.date)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 uppercase font-semibold">Location</p>
                      <div className="flex items-center gap-3 text-gray-900">
                        <MapPin className="h-5 w-5 text-primary" />
                        <p className="font-medium">{selectedEvent.location || 'Location TBA'}</p>
                      </div>
                    </div>

                    {selectedEvent.organizer_name && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 uppercase font-semibold">Organized By</p>
                        <p className="font-medium text-gray-900">{selectedEvent.organizer_name}</p>
                        {selectedEvent.organizer_email && (
                          <p className="text-xs text-gray-500">{selectedEvent.organizer_email}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 uppercase font-semibold">About This Event</p>
                      {selectedEvent.description ? (
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
                      ) : (
                        <p className="text-gray-500 italic">No description available for this event yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Like and Comment Actions */}
                  <div className="flex gap-4 py-4 border-y border-gray-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => handleEventLike(selectedEvent)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${selectedEvent.liked_by_user ? "fill-red-500 text-red-500" : ""}`}
                      />
                      <span className="text-sm">{selectedEvent.reaction_count || 0}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => setShowComments(!showComments)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">Comment</span>
                    </Button>
                  </div>

                  {/* Comment Section */}
                  <EventCommentSection eventId={selectedEvent.id} isOpen={showComments} />

                  <div className="flex gap-3 pt-4 border-t">
                    {registeredEvents.has(selectedEvent.id) ? (
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-red-600 gap-2"
                        onClick={() => {
                          handleRegister(selectedEvent.id, true);
                        }}
                        disabled={loadingEventId === selectedEvent.id}
                      >
                        {loadingEventId === selectedEvent.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            You are Registered
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => {
                          handleRegister(selectedEvent.id, false);
                        }}
                        disabled={loadingEventId === selectedEvent.id}
                      >
                        {loadingEventId === selectedEvent.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Register Now"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
