import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb, Loader2, Clock, BookOpen, Heart, MessageCircle, Send, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useInsights, useAddInsightComment, useReactToInsight, useUnreactToInsight, useInsightComments, useDeleteInsightComment } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";

// Comments sub-component
function InsightComments({ insightId, onDeleteComment }) {
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
    return (
      <div className="text-center py-4 text-sm text-gray-500">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
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
  );
}

export default function AlumniInsights() {
  const [location] = useLocation();
  const role = location.split("/")[1];
  const { data: insights = [], isLoading } = useInsights();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedInsights, setExpandedInsights] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const { toast } = useToast();
  const addCommentMutation = useAddInsightComment();
  const deleteCommentMutation = useDeleteInsightComment();
  const reactMutation = useReactToInsight();
  const unreactMutation = useUnreactToInsight();

  const categories = useMemo(() => {
    const cats = ["all"];
    insights.forEach(insight => {
      if (insight.category && !cats.includes(insight.category)) {
        cats.push(insight.category);
      }
    });
    return cats;
  }, [insights]);

  const filteredInsights = useMemo(() => {
    if (selectedCategory === "all") return insights;
    return insights.filter(insight => insight.category === selectedCategory);
  }, [insights, selectedCategory]);

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

  const handleAddComment = async (insightId) => {
    const comment = commentInputs[insightId];
    if (!comment || !comment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
        duration: 2000
      });
      return;
    }

    try {
      await addCommentMutation.mutateAsync({ insightId, content: comment });

      setCommentInputs(prev => ({
        ...prev,
        [insightId]: ""
      }));

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

  const handleDeleteComment = async (insightId, commentId) => {
    try {
      await deleteCommentMutation.mutateAsync({ insightId, commentId });
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

  const toggleExpanded = (insightId) => {
    setExpandedInsights(prev => ({
      ...prev,
      [insightId]: !prev[insightId]
    }));
  };

  const toggleComments = (insightId) => {
    setExpandedComments(prev => ({
      ...prev,
      [insightId]: !prev[insightId]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
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
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Alumni Insights</h1>
          <p className="text-gray-600">Learn from the experiences and wisdom of your seniors</p>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat === "all" ? "All Insights" : cat}
              </button>
            ))}
          </div>
        )}

        {/* Insights List */}
        <div className="space-y-6">
          {filteredInsights.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No insights available yet</p>
                <p className="text-gray-400 text-sm mt-1">Check back soon for valuable content from alumni</p>
              </CardContent>
            </Card>
          ) : (
            filteredInsights.map((insight) => (
              <Card 
                key={insight.id} 
                className="hover:shadow-md transition-all border-l-4 border-l-primary/20 hover:border-l-primary/50"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <Avatar className="h-11 w-11 border-2 border-primary/10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {(insight.author_email || insight.author_name || "A").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">
                          {insight.author_name || insight.author_email || "Alumni"}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(insight.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    {insight.category && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 shrink-0">
                        {insight.category}
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                        {insight.title}
                      </h2>
                    </div>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {expandedInsights[insight.id] || insight.content.length <= 300 ? (
                        <p>{insight.content}</p>
                      ) : (
                        <>
                          <p className="line-clamp-4">{insight.content}</p>
                          <button 
                            onClick={() => toggleExpanded(insight.id)}
                            className="text-sm text-primary font-medium hover:underline mt-2"
                          >
                            Read more →
                          </button>
                        </>
                      )}
                      {expandedInsights[insight.id] && insight.content.length > 300 && (
                        <button 
                          onClick={() => toggleExpanded(insight.id)}
                          className="text-sm text-primary font-medium hover:underline mt-2"
                        >
                          Show less
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Engagement Section */}
                  <div className="pt-4 border-t space-y-4">
                    <div className="flex gap-6">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInsightLike(insight);
                        }}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                        disabled={reactMutation.isPending || unreactMutation.isPending}
                      >
                        <Heart 
                          className={`h-5 w-5 ${insight.liked_by_user ? 'fill-primary text-primary' : ''}`} 
                        />
                        <span className="text-sm font-medium">
                          {insight.like_count} Like{insight.like_count !== 1 ? 's' : ''}
                        </span>
                      </button>
                      <button 
                        onClick={() => toggleComments(insight.id)}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          {insight.comment_count} Comment{insight.comment_count !== 1 ? 's' : ''}
                        </span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {expandedComments[insight.id] && (
                      <div className="space-y-3">
                        <InsightComments insightId={insight.id} onDeleteComment={(commentId) => handleDeleteComment(insight.id, commentId)} />
                        <div className="flex gap-2 pt-2 border-t">
                          <Input
                            placeholder="Write a comment..."
                            value={commentInputs[insight.id] || ""}
                            onChange={(e) => setCommentInputs(prev => ({
                              ...prev,
                              [insight.id]: e.target.value
                            }))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment(insight.id);
                              }
                            }}
                            className="flex-1"
                            disabled={addCommentMutation.isPending}
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleAddComment(insight.id)}
                            className="bg-primary hover:bg-primary/90"
                            disabled={addCommentMutation.isPending}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
