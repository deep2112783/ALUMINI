import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Loader2, Clock, Heart, MessageCircle, Trash2, Reply, Send } from "lucide-react";
import { useMyInsights, useInsightComments, useDeleteInsight, useReplyToComment } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { usePostInsight } from "@/hooks/use-api";

function InsightComments({ insightId, onReply }) {
  const { data: comments = [], isLoading, error } = useInsightComments(insightId);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

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

  const handleReply = (commentId) => {
    if (!replyContent.trim()) return;
    onReply(commentId, replyContent);
    setReplyContent("");
    setReplyingTo(null);
  };

  const parentComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-sm text-red-500">
        Error loading comments: {error.message}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-gray-500">
        No comments yet
      </div>
    );
  }

  return (
    <div className="space-y-4 pl-4 border-l-2 border-gray-200">
      {parentComments.map((comment) => {
        const replies = getReplies(comment.id);
        
        return (
          <div key={comment.id} className="space-y-2">
            <div className="space-y-1 group">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{comment.author_name}</span>
                  <span className="text-xs text-gray-400">
                    {formatCommentDate(comment.created_at)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(comment.id)}
                className="text-xs text-[#800000] hover:text-[#600000] h-auto p-1"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            </div>

            {replies.length > 0 && (
              <div className="ml-6 space-y-2 border-l-2 border-gray-100 pl-3">
                {replies.map((reply) => (
                  <div key={reply.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#800000]">{reply.author_name}</span>
                      <Badge variant="outline" className="text-xs">Alumni</Badge>
                      <span className="text-xs text-gray-400">
                        {formatCommentDate(reply.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            {replyingTo === comment.id && (
              <div className="ml-6 flex gap-2">
                <Input
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  className="text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReply(comment.id);
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => handleReply(comment.id)}
                  disabled={!replyContent.trim()}
                  className="bg-[#800000] hover:bg-[#600000]"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AlumniInsights() {
  const { data: insights = [], isLoading: insightsLoading, refetch } = useMyInsights();
  const deleteInsightMutation = useDeleteInsight();
  const replyMutation = useReplyToComment();
  const postMutation = usePostInsight();
  const { toast } = useToast();
  const [expandedInsights, setExpandedInsights] = useState({});
  const [showCommentsFor, setShowCommentsFor] = useState({});
  const [isPostingForm, setIsPostingForm] = useState(false);

  const form = useForm({
    defaultValues: {
      title: "",
      content: "",
      category: "technical",
    },
  });

  const categories = {
    career: { label: "Career Advice", color: "bg-blue-100 text-blue-700" },
    technical: { label: "Technical Skills", color: "bg-purple-100 text-purple-700" },
    interview: { label: "Interview Prep", color: "bg-green-100 text-green-700" },
    industry: { label: "Industry Insights", color: "bg-orange-100 text-orange-700" },
    study: { label: "Higher Studies", color: "bg-pink-100 text-pink-700" },
    general: { label: "General Advice", color: "bg-gray-100 text-gray-700" },
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleDelete = (insightId) => {
    if (!confirm("Are you sure you want to delete this insight?")) return;
    
    deleteInsightMutation.mutate(insightId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Insight deleted successfully"
        });
        refetch();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const handleReplyToComment = (insightId, commentId, content) => {
    replyMutation.mutate(
      { insightId, commentId, content },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Reply posted successfully"
          });
          refetch();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    );
  };

  const onSubmit = (data) => {
    postMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Insight posted successfully"
        });
        form.reset();
        setIsPostingForm(false);
        refetch();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const toggleComments = (insightId) => {
    setShowCommentsFor(prev => ({
      ...prev,
      [insightId]: !prev[insightId]
    }));
  };

  const toggleExpand = (insightId) => {
    setExpandedInsights(prev => ({
      ...prev,
      [insightId]: !prev[insightId]
    }));
  };

  return (
    <Layout role="alumni">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#800000] to-[#600000] p-3 rounded-xl">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Insights</h1>
              <p className="text-gray-600">Share knowledge and engage with students</p>
            </div>
          </div>
          {!isPostingForm && (
            <Button 
              onClick={() => setIsPostingForm(true)}
              className="bg-[#800000] hover:bg-[#600000]"
              size="sm"
            >
              Post New Insight
            </Button>
          )}
        </div>

        {/* Post Form Section - Only shows when clicking Post button */}
        {isPostingForm && (
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Give your insight a descriptive title..."
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">Leave blank to auto-generate from content</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Share your insights, experiences, and advice..."
                              rows={6}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <select {...field} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                              {Object.entries(categories).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={postMutation.isPending}
                        className="bg-[#800000] hover:bg-[#600000]"
                      >
                        {postMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          "Post Insight"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsPostingForm(false);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insights List */}
        {insightsLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
          </div>
        ) : insights.length === 0 ? (
          <Card className="border border-gray-200">
            <CardContent className="p-12 text-center">
              <Lightbulb className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No insights yet</h3>
              <p className="text-gray-600">Start sharing your knowledge and experience with students</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {insights.map((insight) => {
              const isExpanded = expandedInsights[insight.id];
              const showComments = showCommentsFor[insight.id];
              const categoryInfo = categories[insight.category] || categories.general;
              const needsExpansion = insight.content.length > 300;
              const displayContent = needsExpansion && !isExpanded 
                ? insight.content.substring(0, 300) + "..."
                : insight.content;

              return (
                <Card key={insight.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {insight.category && (
                            <Badge className={categoryInfo.color}>
                              {categoryInfo.label}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(insight.created_at)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{insight.title}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(insight.id)}
                        className="text-gray-400 hover:text-red-600"
                        disabled={deleteInsightMutation.isPending}
                      >
                        {deleteInsightMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Content */}
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {displayContent}
                    </p>

                    {needsExpansion && (
                      <Button
                        variant="link"
                        onClick={() => toggleExpand(insight.id)}
                        className="text-[#800000] p-0 h-auto font-semibold"
                      >
                        {isExpanded ? "Show less" : "Read more"}
                      </Button>
                    )}

                    {/* Engagement Stats */}
                    <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Heart className="h-4 w-4 text-pink-500" />
                        <span className="text-sm font-medium">{insight.like_count || 0} likes</span>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => toggleComments(insight.id)}
                        className="flex items-center gap-2 text-gray-600 hover:text-[#800000] p-0 h-auto"
                      >
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {insight.comment_count || 0} comments
                        </span>
                      </Button>
                    </div>

                    {/* Comments Section */}
                    {showComments && (
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Student Comments & Replies</h4>
                        <InsightComments 
                          insightId={insight.id} 
                          onReply={(commentId, content) => handleReplyToComment(insight.id, commentId, content)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
