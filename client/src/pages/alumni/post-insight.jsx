import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { usePostInsight } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lightbulb, Send, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function PostInsight() {
  const postMutation = usePostInsight();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({ 
    title: "", 
    content: "", 
    category: "" 
  });

  const categories = [
    { value: "career", label: "Career Advice", color: "bg-blue-100 text-blue-700" },
    { value: "technical", label: "Technical Skills", color: "bg-purple-100 text-purple-700" },
    { value: "interview", label: "Interview Preparation", color: "bg-green-100 text-green-700" },
    { value: "industry", label: "Industry Insights", color: "bg-orange-100 text-orange-700" },
    { value: "study", label: "Higher Studies", color: "bg-pink-100 text-pink-700" },
    { value: "general", label: "General Advice", color: "bg-gray-100 text-gray-700" },
  ];

  const handlePost = () => {
    if (!formData.content) {
      toast({
        title: "Error",
        description: "Please write your insight",
        variant: "destructive"
      });
      return;
    }
    
    postMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Your insight has been published!"
        });
        setFormData({ title: "", content: "", category: "" });
        setLocation('/alumni/home');
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

  return (
    <Layout role="alumni">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-[#800000] to-[#600000] p-3 rounded-xl">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Share Your Insights</h1>
            <p className="text-gray-600">Help students learn from your experience</p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="border-l-4 border-l-[#800000] bg-[#800000]/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-[#800000] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Tips for writing great insights:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Share practical, actionable advice</li>
                  <li>Use real examples from your experience</li>
                  <li>Be specific about technologies, companies, or situations</li>
                  <li>Consider what would have helped you as a student</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card className="border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle>Your Insight</CardTitle>
            <CardDescription>Share career advice, industry experiences, or technical knowledge</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">Title (Optional)</Label>
              <input
                id="title"
                type="text"
                placeholder="Give your insight a descriptive title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-gray-500">Leave blank to auto-generate from content</p>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold">Category (Optional)</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.category && (
                <Badge className={categories.find(c => c.value === formData.category)?.color}>
                  {categories.find(c => c.value === formData.category)?.label}
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-semibold">Your Insight *</Label>
              <Textarea
                id="content"
                placeholder="Share your experience, advice, or insights with students. Be specific and practical. 

For example:
- How you transitioned from college to your first job
- Technical skills that are most valuable in your field
- How to prepare for specific types of interviews
- Common mistakes to avoid in your industry
- Resources that helped you grow professionally"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-64 text-base leading-relaxed"
              />
              <p className="text-xs text-gray-500">{formData.content.length} characters</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setLocation('/alumni/home')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePost}
                disabled={postMutation.isPending || !formData.content.trim()}
                className="flex-1 bg-[#800000] hover:bg-[#600000]"
              >
                {postMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Publish Insight
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {formData.content && (
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.title && (
                <h3 className="text-xl font-bold text-gray-900 mb-2">{formData.title}</h3>
              )}
              {formData.category && (
                <Badge className={categories.find(c => c.value === formData.category)?.color}>
                  {categories.find(c => c.value === formData.category)?.label}
                </Badge>
              )}
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{formData.content}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
