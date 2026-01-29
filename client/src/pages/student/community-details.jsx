import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  TrendingUp,
  Clock,
  ArrowLeft
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { useCommunityDetails, usePostQuestion, useReplyQuestion, useLikeQuestion, useLeaveCommunity } from "@/hooks/use-api";
import { useCallback } from "react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CommunityDetails({ id }) {
  const [location] = useLocation();
  const role = location.split("/")[1];
  const communityId = id || location.split("/").pop();
  const { data: communityData, isLoading } = useCommunityDetails(communityId);
  const community = communityData?.community || {};
  const questions = communityData?.questions || [];
  const answers = communityData?.answers || [];
  const members = communityData?.members || [];
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { mutate: postQuestion, isPending, error } = usePostQuestion(communityId);
  const { mutate: replyQuestion, isPending: isReplying } = useReplyQuestion(communityId);
  const { mutate: likeQuestion } = useLikeQuestion(communityId);
  const [replyText, setReplyText] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [showAllMembers, setShowAllMembers] = useState(false);
  const { toast } = useToast();
  const { mutate: leaveCommunity, isPending: isLeaving } = useLeaveCommunity();

  const handleMemberClick = useCallback((member) => {
    const currentRole = location.split("/")[1];
    
    if (member.role === 'alumni') {
      // Navigate to alumni profile
      setLocation(`/${currentRole}/alumni/${member.id}`);
    } else if (member.role === 'student' && currentRole === 'alumni') {
      // Alumni can click to view student profile
      setLocation(`/alumni/student/${member.id}`);
    } else if (member.role === 'student' && currentRole === 'student') {
      // Student can click to view another student's profile
      setLocation(`/student/student/${member.id}`);
    } else if (member.role === 'student' && currentRole === 'faculty') {
      // Faculty can click to view student profile
      setLocation(`/faculty/student/${member.id}`);
    } else if (member.role === 'faculty') {
      // Can view faculty profile (if route exists)
      setLocation(`/${currentRole}/profile`);
    }
  }, [location, setLocation]);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and content for your question.",
        variant: "destructive",
      });
      return;
    }
    postQuestion(
      { title: title.trim(), content: content.trim() },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          toast({
            title: "Success",
            description: "Your question has been posted successfully!",
          });
        },
        onError: (err) => {
          toast({
            title: "Error",
            description: err.message || "Failed to post question",
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleReply = (questionId) => {
    const replyContent = replyText[questionId]?.trim();
    if (!replyContent) return;
    
    replyQuestion(
      { questionId, content: replyContent },
      {
        onSuccess: () => {
          setReplyText({ ...replyText, [questionId]: "" });
          toast({
            title: "Success",
            description: "Your reply has been posted!",
          });
        },
        onError: (err) => {
          toast({
            title: "Error",
            description: err.message || "Failed to post reply",
            variant: "destructive",
          });
        },
      },
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <Layout role={role}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout role={role}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="space-y-4">
          <Link href={`/${role}/communities`}>
            <Button variant="ghost" className="hover:bg-gray-100 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Communities
            </Button>
          </Link>
          
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-3xl font-bold text-gray-900">{community.name || "Community"}</h1>
                    <Badge variant="outline" className="bg-white">{community.domain || "General"}</Badge>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {community.description || "Join the conversation and connect with your peers."}
                  </p>
                </div>
                
                {/* Removed member and discussion summary chips per request */}
              </div>
              
              {/* Leave Community Button */}
              {community.isJoined && (
                <div className="mt-4 pt-4 border-t border-primary/10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to leave this community?")) {
                        leaveCommunity(communityId, {
                          onSuccess: () => {
                            toast({
                              title: "Left Community",
                              description: `You have left ${community.name}`,
                            });
                            setLocation(`/${role}/communities`);
                          },
                          onError: (error) => {
                            toast({
                              title: "Error",
                              description: error.message || "Failed to leave community",
                              variant: "destructive",
                            });
                          },
                        });
                      }
                    }}
                    disabled={isLeaving}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {isLeaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Leaving...
                      </>
                    ) : (
                      "Leave Community"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Members Section */}
        {members && members.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Members ({members.length})
                </div>
                {members.length > 6 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAllMembers(!showAllMembers)}
                  >
                    {showAllMembers ? 'Show Less' : 'Show All'}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(showAllMembers ? members : members.slice(0, 6)).map((member) => (
                  <div 
                    key={member.id} 
                    onClick={() => handleMemberClick(member)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary/50 hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {(member.name || member.email.split('@')[0]).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {member.name || member.email.split('@')[0]}
                      </p>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {member.role}
                        </Badge>
                      </div>
                      {member.affiliation && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {member.affiliation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Input Section */}
        <Card className="border-2 border-dashed border-gray-200 shadow-sm hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Start a Discussion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Question Title</label>
                <Input
                  placeholder="What's your question about?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{title.length}/200 characters</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Details</label>
                <Textarea
                  placeholder="Provide more context and details for your question..."
                  className="bg-white min-h-[100px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500 mt-1">{content.length}/2000 characters</p>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error.message}</p>
                </div>
              )}
              
              <Button 
                size="default" 
                disabled={isPending || !title.trim() || !content.trim()} 
                onClick={handleSubmit}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post Question
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Discussions Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Discussions
            </h2>
            <p className="text-sm text-gray-500">{questions.length} {questions.length === 1 ? 'discussion' : 'discussions'}</p>
          </div>
          
          {questions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg font-medium">No discussions yet</p>
                <p className="text-gray-400 text-sm mt-1">Be the first to start a conversation!</p>
              </CardContent>
            </Card>
          ) : (
            questions.map((q) => {
              const questionAnswers = answers.filter((a) => a.question_id === q.id);
              const isExpanded = expandedReplies[q.id];
              
              return (
                <Card key={q.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 flex-1">
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {(q.author_name || q.title || "?").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{q.author_name || "Anonymous"}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(q.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        Discussion
                      </Badge>
                    </div>

                    {/* Question Content */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-gray-900 leading-tight">{q.title}</h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{q.content}</p>
                    </div>

                    <Separator />

                    {/* Actions Bar */}
                    <div className="flex gap-3 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`${q.liked_by_user ? "text-primary bg-primary/10" : "text-gray-600"} hover:bg-primary/10`}
                        onClick={() => likeQuestion({ questionId: q.id, liked: q.liked_by_user })}
                      >
                        <ThumbsUp className={`h-4 w-4 mr-2 ${q.liked_by_user ? 'fill-current' : ''}`} />
                        <span className="font-medium">{q.like_count || 0}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:bg-gray-100"
                        onClick={() => setExpandedReplies({ ...expandedReplies, [q.id]: !isExpanded })}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        )}
                        <span className="font-medium">{questionAnswers.length} {questionAnswers.length === 1 ? 'Reply' : 'Replies'}</span>
                      </Button>
                    </div>

                    {/* Replies Section */}
                    {isExpanded && (
                      <div className="space-y-4 pt-4 border-t">
                        {/* Existing Replies */}
                        {questionAnswers.length > 0 && (
                          <div className="space-y-3">
                            {questionAnswers.map((a) => (
                              <div key={a.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                <Avatar className="h-8 w-8 border">
                                  <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                                    {(a.author_name || a.content || "?").slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium text-gray-900">{a.author_name || "Anonymous"}</p>
                                    <span className="text-xs text-gray-500">• {formatDate(a.created_at)}</span>
                                  </div>
                                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{a.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Input */}
                        <div className="space-y-2 pt-2">
                          <Textarea
                            placeholder="Write your reply..."
                            value={replyText[q.id] || ""}
                            onChange={(e) => setReplyText({ ...replyText, [q.id]: e.target.value })}
                            className="bg-white min-h-[80px]"
                            maxLength={1000}
                          />
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">{(replyText[q.id] || "").length}/1000 characters</p>
                            <Button
                              size="sm"
                              disabled={!replyText[q.id]?.trim() || isReplying}
                              onClick={() => handleReply(q.id)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              {isReplying ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Reply
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
