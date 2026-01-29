import Layout from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, MapPin, Calendar, ArrowRight, ThumbsUp, MessageCircle, Loader2, Users, Heart, Check, X, Send, Trash2, Code2, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStudentHome, useSearchAlumni, useSendConnectionRequest, useCancelConnectionRequest, useRegisterEvent, useInsights, useAddInsightComment, useReactToInsight, useUnreactToInsight, useInsightComments, useDeleteInsightComment } from "@/hooks/use-api";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Comments display component for cards
function CardCommentSection({ insightId, onDeleteComment }) {
  const { data: comments = [], isLoading } = useInsightComments(insightId);
  const userEmail = localStorage.getItem("email") || "Student";
  const userName = userEmail.split("@")[0];

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-2 mt-2">
        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
      </div>
    );
  }

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mt-3 pt-2 border-t border-gray-100 max-h-40 overflow-y-auto">
      {comments.map((comment) => (
        <div key={comment.id} className="text-xs space-y-1 group">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{comment.author_name}</span>
              <span className="text-gray-400">{formatCommentDate(comment.created_at)}</span>
            </div>
            <button
              onClick={() => onDeleteComment(comment.id)}
              className="opacity-0 group-hover:opacity-100 smooth-transition text-gray-400 hover:text-red-600"
              title="Delete comment"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
          <p className="text-gray-700 text-xs break-words">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}

// Comments sub-component for modal
function InsightCommentsModal({ insightId, onDeleteComment }) {
  const { data: comments = [], isLoading } = useInsightComments(insightId);

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 pt-4 border-t">
      <h4 className="text-sm font-semibold text-gray-900">Comments</h4>
      <div className="space-y-3 pl-4 border-l-2 border-gray-200">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-1 group">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{comment.author_name}</span>
                <span className="text-xs text-gray-400">
                  {formatCommentDate(comment.created_at)}
                </span>
              </div>
              <button
                onClick={() => onDeleteComment(comment.id)}
                className="opacity-0 group-hover:opacity-100 smooth-transition text-gray-400 hover:text-red-600"
                title="Delete comment"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-sm text-gray-700">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StudentHome() {
  const [location, navigate] = useLocation();
  const { data: homeData, isLoading, error } = useStudentHome();
  const { data: insights = [] } = useInsights();
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingAlumniId, setPendingAlumniId] = useState(null);
  const [pendingStudentId, setPendingStudentId] = useState(null);
  const [requestedAlumni, setRequestedAlumni] = useState(() => {
    const saved = localStorage.getItem('requestedAlumni');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [requestedStudents, setRequestedStudents] = useState(() => {
    const saved = localStorage.getItem('requestedStudents');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [openToComment, setOpenToComment] = useState(false);
  const [showModalComments, setShowModalComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [showCommentInput, setShowCommentInput] = useState({});
  const [insightComments, setInsightComments] = useState({});
  const [registeredEvents, setRegisteredEvents] = useState(() => {
    const saved = localStorage.getItem('registeredEvents');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const { data: searchResults, isLoading: isSearching } = useSearchAlumni(searchQuery);
  const sendConnectionRequest = useSendConnectionRequest({
    onSuccess: (data, alumniId) => {
      if (pendingAlumniId === alumniId) {
        setRequestedAlumni(prev => {
          const newSet = new Set([...prev, alumniId]);
          localStorage.setItem('requestedAlumni', JSON.stringify([...newSet]));
          return newSet;
        });
        toast({
          title: "Success",
          description: "Connection request sent!",
        });
        setPendingAlumniId(null);
      } else if (pendingStudentId === alumniId) {
        setRequestedStudents(prev => {
          const newSet = new Set([...prev, alumniId]);
          localStorage.setItem('requestedStudents', JSON.stringify([...newSet]));
          return newSet;
        });
        toast({
          title: "Success",
          description: "Connection request sent!",
        });
        setPendingStudentId(null);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to send connection request",
        variant: "destructive",
      });
      setPendingAlumniId(null);
      setPendingStudentId(null);
    }
  });
  const cancelRequestMutation = useCancelConnectionRequest();
  const registerEventMutation = useRegisterEvent();
  const addCommentMutation = useAddInsightComment();
  const deleteCommentMutation = useDeleteInsightComment();
  const reactMutation = useReactToInsight();
  const unreactMutation = useUnreactToInsight();
  const { toast } = useToast();
  const userEmail = localStorage.getItem("email") || "Student";
  const userName = userEmail.split("@")[0];

  useEffect(() => {
    if (homeData?.suggestedAlumni) {
      console.log("[StudentHome] Suggested Alumni Data:", homeData.suggestedAlumni);
      console.log("[StudentHome] First alumni:", homeData.suggestedAlumni[0]);
    }
  }, [homeData]);

  useEffect(() => {
    if (selectedInsight && openToComment) {
      setTimeout(() => {
        const commentSection = document.getElementById('insight-comment-input');
        if (commentSection) {
          commentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          commentSection.querySelector('input')?.focus();
        }
        setOpenToComment(false);
      }, 100);
    }
  }, [selectedInsight, openToComment]);

  const handleRegisterEvent = (eventId) => {
    registerEventMutation.mutate(eventId, {
      onSuccess: () => {
        setRegisteredEvents(prev => {
          const newSet = new Set([...prev, eventId]);
          localStorage.setItem('registeredEvents', JSON.stringify([...newSet]));
          return newSet;
        });
        toast({ title: "Success", description: "Registered for event!" });
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const handleInsightLike = async (insight) => {
    try {
      if (insight.liked_by_user) {
        await unreactMutation.mutateAsync(insight.id);
        toast({ 
          title: "Success", 
          description: "Removed like",
          duration: 2000
        });
      } else {
        await reactMutation.mutateAsync({ insightId: insight.id, reactionType: "like" });
        toast({ 
          title: "Success", 
          description: "Liked this insight!",
          duration: 2000
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update like",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  const handleAddComment = async (insightId, commentText) => {
    const textToUse = commentText !== undefined ? commentText : commentInput;
    if (!textToUse || !textToUse.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
        duration: 2000
      });
      return;
    }

    try {
      await addCommentMutation.mutateAsync({ insightId, content: textToUse });

      if (commentText !== undefined) {
        setInsightComments(prev => ({ ...prev, [insightId]: "" }));
        setShowCommentInput(prev => ({ ...prev, [insightId]: false }));
      } else {
        setCommentInput("");
      }

      toast({
        title: "Success",
        description: "Comment added!",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!selectedInsight) return;
    try {
      await deleteCommentMutation.mutateAsync({ insightId: selectedInsight.id, commentId });
      toast({
        title: "Success",
        description: "Comment deleted!",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  if (isLoading) {
    return (
      <Layout role="student">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role="student">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          Failed to load data: {error.message}
        </div>
      </Layout>
    );
  }
  return (
    <Layout role="student">
      <div className="space-y-8 fade-in-up">
        
        {/* 1. Greeting & Search Section */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#800000] to-[#600000] text-white p-8 rounded-xl shadow-lg">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white">Hi, {userName}</h1>
              <p className="text-white/90 mt-2 font-medium">Ready to connect and learn today?</p>
            </div>
          </div>
          
          <div className="relative max-w-2xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary smooth-transition" />
            <Input 
              className="pl-11 h-12 text-base shadow-sm border-gray-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent rounded-lg smooth-transition" 
              placeholder="Search students, alumni, skills, or companies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {/* Search Results Dropdown */}
            {searchQuery && (
              <Card className="absolute top-full mt-2 w-full z-50 shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {searchResults.map((alumni, i) => (
                      <div 
                        key={i} 
                        className="p-4 hover:bg-gray-50 cursor-pointer smooth-transition"
                        onClick={() => {
                          navigate(`/student/alumni/${alumni.id}`);
                          setSearchQuery("");
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-gray-100">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-bold text-sm">
                              {alumni.name?.split(' ').map(n => n[0]).join('') || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-gray-900">{alumni.name}</h4>
                            <p className="text-xs text-gray-600">{alumni.role} @ {alumni.company}</p>
                            {alumni.expertise && (
                              <p className="text-xs text-gray-400 mt-1 line-clamp-1">{alumni.expertise}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Feed Area - Left 2 Columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Latest Alumni Insights Section */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-lg">Latest Alumni Insights</h3>
                <Button 
                  variant="link" 
                  className="text-primary text-sm h-auto p-0 font-semibold hover:text-primary/80"
                  onClick={() => navigate("/student/insights")}
                >
                  View all →
                </Button>
              </div>
              <div className="space-y-3">
                {insights && insights.length > 0 ? (
                  insights.slice(0, 3).map((insight, i) => (
                    <Card 
                      key={i}
                      className="border border-gray-100 hover:border-primary/30 hover:shadow-md smooth-transition overflow-hidden bg-gradient-to-r from-white to-gray-50/30"
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-3 items-start">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-2 w-2 rounded-full bg-primary/60" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div 
                              className="cursor-pointer group/title"
                              onClick={() => setSelectedInsight(insight)}
                            >
                              <p className="text-sm font-semibold text-gray-900 group-hover/title:text-primary smooth-transition line-clamp-2">
                                {insight.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">
                                {insight.content}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {insight.author_email ? insight.author_email.split('@')[0] : 'Alumni'} · {new Date(insight.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInsightLike(insight);
                                }}
                                disabled={reactMutation.isPending || unreactMutation.isPending}
                                className="text-xs text-gray-500 hover:text-primary smooth-transition flex items-center gap-1"
                              >
                                <Heart className={`h-3.5 w-3.5 ${insight.liked_by_user ? 'fill-primary text-primary' : ''}`} />
                                <span className="text-xs">{insight.like_count || 0}</span>
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowCommentInput(prev => ({ ...prev, [insight.id]: !prev[insight.id] }));
                                }}
                                className="text-xs text-gray-500 hover:text-primary smooth-transition flex items-center gap-1"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span className="text-xs">{insight.comment_count || 0}</span>
                              </button>
                            </div>
                            {showCommentInput[insight.id] && (
                              <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                                <CardCommentSection insightId={insight.id} onDeleteComment={handleDeleteComment} />
                                <div className="flex gap-2 mt-2">
                                  <Input
                                    placeholder="Write a comment..."
                                    value={insightComments[insight.id] || ""}
                                    onChange={(e) => setInsightComments(prev => ({ ...prev, [insight.id]: e.target.value }))}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddComment(insight.id, insightComments[insight.id]);
                                      }
                                    }}
                                    className="flex-1 h-8 text-xs"
                                    disabled={addCommentMutation.isPending}
                                  />
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleAddComment(insight.id, insightComments[insight.id])}
                                    className="h-8 px-3 bg-primary hover:bg-primary/90"
                                    disabled={addCommentMutation.isPending}
                                  >
                                    <Send className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  [
                    {
                      title: "How I Cracked the Google Interview",
                      author: "Priya Singh",
                      preview: "Tips and tricks from my interview experience at Google...",
                      date: "2 days ago"
                    },
                    {
                      title: "Career Transition from Engineering to Product Management",
                      author: "Rahul Verma",
                      preview: "My journey from being an engineer to a successful PM...",
                      date: "4 days ago"
                    },
                    {
                      title: "Building Your Personal Brand as a Developer",
                      author: "Karthik R",
                      preview: "How to stand out in the tech industry with your personal brand...",
                      date: "1 week ago"
                    }
                  ].map((item, i) => (
                    <Card 
                      key={i}
                      onClick={() => setSelectedInsight(item)}
                      className="border border-gray-100 hover:border-primary/30 hover:shadow-md smooth-transition cursor-pointer overflow-hidden group bg-gradient-to-r from-white to-gray-50/30"
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-3 items-start">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-2 w-2 rounded-full bg-primary/60 group-hover:bg-primary group-hover:scale-150 smooth-transition" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-primary smooth-transition line-clamp-2">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">
                              {item.preview}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {item.author} · {item.date}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <button className="text-xs text-gray-500 hover:text-primary smooth-transition flex items-center gap-1">
                                <Heart className="h-3.5 w-3.5" />
                                <span className="text-xs">0</span>
                              </button>
                              <button className="text-xs text-gray-500 hover:text-primary smooth-transition flex items-center gap-1">
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span className="text-xs">0</span>
                              </button>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary flex-shrink-0 smooth-transition opacity-0 group-hover:opacity-100" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>
            <section>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-900 text-lg">Suggested Alumni to Connect</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {homeData?.suggestedAlumni && homeData.suggestedAlumni.length > 0 ? (
                  homeData.suggestedAlumni.slice(0, 4).map((alum, i) => (
                    <Card 
                      key={i} 
                      className="border border-gray-100 hover-lift overflow-hidden group"
                    >
                      <CardContent className="p-5 flex flex-col gap-4 bg-gradient-to-br from-white to-gray-50/30">
                        <div 
                          className="cursor-pointer"
                          onClick={() => navigate(`/student/alumni/${alum.id}`)}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14 border-3 border-gray-100 shadow-md group-hover:border-primary/50 smooth-transition">
                              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-bold text-base">
                                {alum.name?.split(' ').map(n => n[0]).join('') || 'A'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-900 text-base group-hover:text-primary smooth-transition">{alum.name}</h4>
                              </div>
                              <p className="text-sm text-gray-600 font-medium">{alum.role || 'Alumni'}</p>
                              {alum.company && (
                                <p className="text-xs text-gray-400 mt-1.5">@ {alum.company}</p>
                              )}
                              {alum.expertise && (
                                <p className="text-xs text-primary/70 mt-2 line-clamp-2">{alum.expertise}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button 
                          className={`w-full font-semibold shadow-md hover:shadow-lg smooth-transition ${
                            requestedAlumni.has(alum.id) 
                              ? 'bg-primary text-white hover:bg-primary/90 cursor-not-allowed disabled:opacity-100' 
                              : 'bg-primary hover:bg-primary/90 text-white'
                          }`}
                          onClick={() => {
                            if (!requestedAlumni.has(alum.id)) {
                              setPendingAlumniId(alum.id);
                              sendConnectionRequest.mutate(alum.id);
                            }
                          }}
                          disabled={(pendingAlumniId === alum.id && sendConnectionRequest.isPending)}
                        >
                          {pendingAlumniId === alum.id && sendConnectionRequest.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Connecting...
                            </>
                          ) : requestedAlumni.has(alum.id) ? (
                            <span
                              className="flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Cancel this connection request?")) {
                                  cancelRequestMutation.mutate(alum.id, {
                                    onSuccess: () => {
                                      setRequestedAlumni(prev => {
                                        const next = new Set(prev);
                                        next.delete(alum.id);
                                        localStorage.setItem('requestedAlumni', JSON.stringify([...next]));
                                        return next;
                                      });
                                      toast({ title: "Cancelled", description: "Connection request cancelled" });
                                    },
                                    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" })
                                  });
                                }
                              }}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Requested
                            </span>
                          ) : (
                            <>
                              <Users className="h-4 w-4 mr-2" />
                              Connect
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  [
                    {
                      id: 1,
                      name: "Arjun Mehta",
                      role: "Software Engineer",
                      company: "Google",
                      expertise: "Full Stack Development, System Design, Microservices, React, Go"
                    },
                    {
                      id: 2,
                      name: "Divya Singh",
                      role: "Data Scientist",
                      company: "Amazon",
                      expertise: "Machine Learning, NLP, Python, AWS SageMaker, Deep Learning"
                    },
                    {
                      id: 3,
                      name: "Rahul Verma",
                      role: "DevOps Engineer",
                      company: "Microsoft",
                      expertise: "Kubernetes, Docker, CI/CD, Cloud Infrastructure"
                    },
                    {
                      id: 4,
                      name: "Anjali Nair",
                      role: "Product Manager",
                      company: "Netflix",
                      expertise: "Product Strategy, User Research, Analytics"
                    }
                  ].map((alum, i) => (
                    <Card 
                      key={i} 
                      className="border border-gray-100 hover-lift overflow-hidden group"
                    >
                      <CardContent className="p-5 flex flex-col gap-4 bg-gradient-to-br from-white to-gray-50/30">
                        <div 
                          className="cursor-pointer"
                          onClick={() => navigate(`/student/alumni/${alum.id}`)}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14 border-3 border-gray-100 shadow-md group-hover:border-primary/50 smooth-transition">
                              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-bold text-base">
                                {alum.name?.split(' ').map(n => n[0]).join('') || 'A'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 text-base group-hover:text-primary smooth-transition">{alum.name}</h4>
                              <p className="text-sm text-gray-600 font-medium">{alum.role}</p>
                              <p className="text-xs text-gray-400 mt-1.5">@ {alum.company}</p>
                              {alum.expertise && (
                                <p className="text-xs text-primary/70 mt-2 line-clamp-2">{alum.expertise}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button 
                          className={`w-full font-semibold shadow-md hover:shadow-lg smooth-transition ${
                            requestedAlumni.has(alum.id) 
                              ? 'bg-primary text-white hover:bg-primary/90 cursor-not-allowed disabled:opacity-100' 
                              : 'bg-primary hover:bg-primary/90 text-white'
                          }`}
                          onClick={() => {
                            if (!requestedAlumni.has(alum.id)) {
                              setPendingAlumniId(alum.id);
                              sendConnectionRequest.mutate(alum.id);
                            }
                          }}
                          disabled={(pendingAlumniId === alum.id && sendConnectionRequest.isPending)}
                        >
                          {pendingAlumniId === alum.id && sendConnectionRequest.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Connecting...
                            </>
                          ) : requestedAlumni.has(alum.id) ? (
                            <span
                              className="flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Cancel this connection request?")) {
                                  cancelRequestMutation.mutate(alum.id, {
                                    onSuccess: () => {
                                      setRequestedAlumni(prev => {
                                        const next = new Set(prev);
                                        next.delete(alum.id);
                                        localStorage.setItem('requestedAlumni', JSON.stringify([...next]));
                                        return next;
                                      });
                                      toast({ title: "Cancelled", description: "Connection request cancelled" });
                                    },
                                    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" })
                                  });
                                }
                              }}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Requested
                            </span>
                          ) : (
                            <>
                              <Users className="h-4 w-4 mr-2" />
                              Connect
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>

            {/* Suggested Students Section */}
            <section>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-900 text-lg">Suggested Students to Connect</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {false ? (
                  homeData.suggestedStudents.slice(0, 4).map((student, i) => (
                    <Card 
                      key={i} 
                      className="border border-gray-100 hover-lift overflow-hidden group"
                    >
                      <CardContent className="p-5 flex flex-col gap-4 bg-gradient-to-br from-white to-gray-50/30">
                        <div 
                          className="cursor-pointer"
                          onClick={() => navigate(`/student/student/${student.id}`)}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14 border-3 border-gray-100 shadow-md group-hover:border-primary/50 smooth-transition">
                              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-bold text-base">
                                {student.name?.split(' ').map(n => n[0]).join('') || 'S'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-900 text-base group-hover:text-primary smooth-transition">{student.name}</h4>
                                {student.department && (
                                  <Badge variant="secondary" className="bg-primary/10 text-primary text-xs px-2 py-0.5">
                                    {student.year}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 font-medium">{student.department || 'Student'}</p>
                              {student.skills && student.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {student.skills.slice(0, 2).map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="bg-primary/5 border-primary/30 text-primary text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {student.skills.length > 2 && (
                                    <Badge variant="outline" className="bg-primary/5 border-primary/30 text-primary text-xs">
                                      +{student.skills.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button 
                          className={`w-full font-semibold shadow-md hover:shadow-lg smooth-transition ${
                            requestedStudents.has(student.id) 
                              ? 'bg-primary text-white hover:bg-primary/90 cursor-not-allowed disabled:opacity-100' 
                              : 'bg-primary hover:bg-primary/90 text-white'
                          }`}
                          onClick={() => {
                            if (!requestedStudents.has(student.id)) {
                              setPendingStudentId(student.id);
                              sendConnectionRequest.mutate(student.id);
                            }
                          }}
                          disabled={(pendingStudentId === student.id && sendConnectionRequest.isPending)}
                        >
                          {pendingStudentId === student.id && sendConnectionRequest.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Connecting...
                            </>
                          ) : requestedStudents.has(student.id) ? (
                            <span
                              className="flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Cancel this connection request?")) {
                                  cancelRequestMutation.mutate(student.id, {
                                    onSuccess: () => {
                                      setRequestedStudents(prev => {
                                        const next = new Set(prev);
                                        next.delete(student.id);
                                        localStorage.setItem('requestedStudents', JSON.stringify([...next]));
                                        return next;
                                      });
                                      toast({ title: "Cancelled", description: "Connection request cancelled" });
                                    },
                                    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" })
                                  });
                                }
                              }}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Requested
                            </span>
                          ) : (
                            <>
                              <Users className="h-4 w-4 mr-2" />
                              Connect
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  [
                    {
                      id: 188,
                      name: "Rajiv Kumar",
                      department: "Mechanical Engineering",
                      year: "E4",
                      skills: ["CAD", "SOLIDWORKS", "MATLAB", "Thermodynamics"]
                    },
                    {
                      id: 189,
                      name: "Neha Singh",
                      department: "Civil Engineering",
                      year: "E3",
                      skills: ["AutoCAD", "Revit", "Structural Analysis", "STAAD Pro"]
                    },
                    {
                      id: 190,
                      name: "Rohan Patel",
                      department: "Electrical Engineering",
                      year: "E2",
                      skills: ["Circuit Design", "MATLAB", "PLC Programming", "Power Systems"]
                    },
                    {
                      id: 191,
                      name: "Anjali Verma",
                      department: "Computer Science",
                      year: "E4",
                      skills: ["Python", "Machine Learning", "TensorFlow", "Data Analysis"]
                    }
                  ].map((student, i) => (
                    <Card 
                      key={i} 
                      className="border border-gray-100 hover-lift overflow-hidden group"
                    >
                      <CardContent className="p-5 flex flex-col gap-4 bg-gradient-to-br from-white to-gray-50/30">
                        <div 
                          className="cursor-pointer"
                          onClick={() => navigate(`/student/student/${student.id}`)}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14 border-3 border-gray-100 shadow-md group-hover:border-primary/50 smooth-transition">
                              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-bold text-base">
                                {student.name?.split(' ').map(n => n[0]).join('') || 'S'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-900 text-base group-hover:text-primary smooth-transition">{student.name}</h4>
                              </div>
                              <p className="text-sm text-gray-600 font-medium">{student.department || 'Student'}</p>
                              {student.skills && student.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {student.skills.slice(0, 2).map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="bg-primary/5 border-primary/30 text-primary text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {student.skills.length > 2 && (
                                    <Badge variant="outline" className="bg-primary/5 border-primary/30 text-primary text-xs">
                                      +{student.skills.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button 
                          className={`w-full font-semibold shadow-md hover:shadow-lg smooth-transition ${
                            requestedStudents.has(student.id) 
                              ? 'bg-primary text-white hover:bg-primary/90 cursor-not-allowed disabled:opacity-100' 
                              : 'bg-primary hover:bg-primary/90 text-white'
                          }`}
                          onClick={() => {
                            if (!requestedStudents.has(student.id)) {
                              setPendingStudentId(student.id);
                              sendConnectionRequest.mutate(student.id);
                            }
                          }}
                          disabled={(pendingStudentId === student.id && sendConnectionRequest.isPending)}
                        >
                          {pendingStudentId === student.id && sendConnectionRequest.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Connecting...
                            </>
                          ) : requestedStudents.has(student.id) ? (
                            <span
                              className="flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Cancel this connection request?")) {
                                  cancelRequestMutation.mutate(student.id, {
                                    onSuccess: () => {
                                      setRequestedStudents(prev => {
                                        const next = new Set(prev);
                                        next.delete(student.id);
                                        localStorage.setItem('requestedStudents', JSON.stringify([...next]));
                                        return next;
                                      });
                                      toast({ title: "Cancelled", description: "Connection request cancelled" });
                                    },
                                    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" })
                                  });
                                }
                              }}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Requested
                            </span>
                          ) : (
                            <>
                              <Users className="h-4 w-4 mr-2" />
                              Connect
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>

          </div>

          {/* Right Sidebar - 1 Column */}
          <div className="space-y-6">
            
            {/* 4. Upcoming Events */}
            <Card className="shadow-sm border border-primary/20 bg-gradient-to-br from-primary/8 to-primary/3 hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {homeData?.events && homeData.events.length > 0 ? (
                  homeData.events.map((event, i) => (
                    <div 
                      key={i} 
                      className="bg-white p-3.5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 smooth-transition group cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm text-gray-900 group-hover:text-primary smooth-transition flex-1">{event.title}</p>
                        {registeredEvents.has(event.id) && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] px-2 py-0.5">
                            <Check className="h-3 w-3 mr-1" />
                            Registered
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2.5 text-xs text-gray-500">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>{event.date ? formatDate(event.date) : 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>{event.location || 'Location TBA'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  [
                    { title: "Alumni Meet & Greet", date: "Dec 24, 10:00 AM", location: "Auditorium" },
                    { title: "Resume Building Workshop", date: "Dec 28, 2:00 PM", location: "Online" }
                  ].map((event, i) => (
                    <div 
                      key={i} 
                      className="bg-white p-3.5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md smooth-transition group cursor-pointer"
                      onClick={() => navigate("/student/events")}
                    >
                      <p className="font-semibold text-sm text-gray-900 group-hover:text-primary smooth-transition">{event.title}</p>
                      <div className="flex items-center gap-2 mt-2.5 text-xs text-gray-500">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  ))
                )}
                <Button 
                  variant="ghost" 
                  className="w-full text-primary text-sm font-semibold hover:text-primary/80 hover:bg-primary/10 smooth-transition"
                  onClick={() => navigate("/student/events")}
                >
                  View all events →
                </Button>
              </CardContent>
            </Card>

            {/* Quick Community Stats/Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Communities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["Computer Science", "Competitive Coding", "Higher Education"].map((comm, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-2 hover:bg-gray-50 hover:border-l-2 hover:border-primary rounded-md cursor-pointer transition-colors"
                    onClick={() => navigate(`/student/communities/${comm.toLowerCase().replace(/\s+/g, "-")}`)}
                  >
                    <span className="text-sm font-medium text-gray-700">{comm}</span>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[10px] hover:bg-primary/10">2 New</Badge>
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full text-primary text-sm font-semibold mt-3 hover:text-primary/80 hover:bg-primary/10"
                  onClick={() => navigate("/student/communities")}
                >
                  View all communities <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Event Detail Modal */}
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
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
                        <Calendar className="h-5 w-5 text-primary" />
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

                  <div className="flex gap-3 pt-4 border-t">
                    {registeredEvents.has(selectedEvent.id) ? (
                      <Button disabled className="flex-1 bg-green-600 hover:bg-green-600 gap-2">
                        <Check className="h-4 w-4" />
                        You are Registered
                      </Button>
                    ) : (
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => handleRegisterEvent(selectedEvent.id)}
                        disabled={registerEventMutation.isPending}
                      >
                        {registerEventMutation.isPending ? (
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

        {/* Insight Detail Modal */}
        <Dialog open={!!selectedInsight} onOpenChange={(open) => {
          if (!open) {
            setShowModalComments(false);
            setCommentInput("");
          }
          setSelectedInsight(open ? selectedInsight : null);
        }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedInsight && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    {selectedInsight.title}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Author Info */}
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {selectedInsight.author_email ? selectedInsight.author_email.charAt(0).toUpperCase() : 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedInsight.author_email ? selectedInsight.author_email.split('@')[0] : 'Alumni'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedInsight.created_at ? new Date(selectedInsight.created_at).toLocaleDateString() : selectedInsight.date}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                      {selectedInsight.content || selectedInsight.preview}
                    </p>
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex gap-6 pt-4 border-t">
                    <button 
                      onClick={() => handleInsightLike(selectedInsight)}
                      className="flex items-center gap-2 text-gray-600 hover:text-primary smooth-transition"
                      disabled={reactMutation.isPending || unreactMutation.isPending}
                    >
                      <Heart 
                        className={`h-5 w-5 ${selectedInsight.liked_by_user ? 'fill-primary text-primary' : ''}`} 
                      />
                      <span className="text-sm font-medium">
                        {selectedInsight.like_count || 0} Like{selectedInsight.like_count !== 1 ? 's' : ''}
                      </span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowModalComments(true);
                        setTimeout(() => {
                          const commentSection = document.getElementById('insight-comment-input');
                          if (commentSection) {
                            commentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            commentSection.querySelector('input')?.focus();
                          }
                        }, 100);
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-primary smooth-transition"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        {selectedInsight.comment_count || 0} Comment{selectedInsight.comment_count !== 1 ? 's' : ''}
                      </span>
                    </button>
                  </div>

                  {/* Comments Section and Input */}
                  {showModalComments && (
                    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                      {/* Comment History */}
                      {selectedInsight.id && (
                        <div className="pt-4 border-t">
                          <CardCommentSection insightId={selectedInsight.id} onDeleteComment={handleDeleteComment} />
                        </div>
                      )}

                      {/* Comment Input */}
                      <div 
                        id="insight-comment-input" 
                        className="flex gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Input
                          placeholder="Write a comment..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(selectedInsight.id);
                            }
                          }}
                          className="flex-1"
                          disabled={addCommentMutation.isPending}
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleAddComment(selectedInsight.id)}
                          className="bg-primary hover:bg-primary/90"
                          disabled={addCommentMutation.isPending}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Click outside to close comments */}
                  {showModalComments && (
                    <div 
                      className="fixed inset-0 -z-10" 
                      onClick={() => setShowModalComments(false)}
                    />
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
