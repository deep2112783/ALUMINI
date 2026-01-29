import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  MapPin, 
  Briefcase, 
  Calendar, 
  MessageCircle, 
  UserPlus, 
  CheckCircle, 
  Award,
  BookOpen,
  TrendingUp
} from "lucide-react";
import { useAlumniProfile, useSendConnectionRequest } from "@/hooks/use-api";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function AlumniProfile() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: alumni, isLoading, error } = useAlumniProfile(id);
  const sendConnectionMutation = useSendConnectionRequest();

  useEffect(() => {
    console.log("[AlumniProfile] Alumni data:", alumni);
    console.log("[AlumniProfile] Alumni ID:", id);
    if (alumni) {
      console.log("[AlumniProfile] Alumni details - company:", alumni.company, "role:", alumni.role, "batch:", alumni.batch);
    }
  }, [alumni, id]);

  const handleConnect = async () => {
    try {
      await sendConnectionMutation.mutateAsync(id);
      toast({
        title: "Connection Request Sent",
        description: `Your request has been sent to ${alumni.name}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to send connection request",
        variant: "destructive",
      });
    }
  };

  const handleMessage = () => {
    navigate(`/student/messages?userId=${id}`);
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
          Failed to load profile: {error.message}
        </div>
      </Layout>
    );
  }

  if (!alumni) {
    return (
      <Layout role="student">
        <div className="text-center py-12">
          <p className="text-gray-500">Alumni profile not found</p>
        </div>
      </Layout>
    );
  }

  const expertiseList = alumni.expertise ? alumni.expertise.split(',').map(s => s.trim()) : [];
  
  return (
    <Layout role="student">
      <div className="space-y-6 fade-in-up">
        {/* Header Card */}
        <Card className="border-t-4 border-t-primary">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center md:items-start gap-4">
                <Avatar className="h-32 w-32 border-4 border-gray-100 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white text-3xl font-bold">
                    {alumni.name?.split(' ').map(n => n[0]).join('') || 'A'}
                  </AvatarFallback>
                </Avatar>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  {alumni.connectionStatus === 'connected' ? (
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleMessage}
                        className="flex-1 md:flex-none bg-primary hover:bg-primary/90"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Badge variant="outline" className="flex items-center gap-1 px-3 border-green-200 bg-green-50 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Connected
                      </Badge>
                    </div>
                  ) : alumni.connectionStatus === 'pending' ? (
                    <Button 
                      disabled
                      variant="outline"
                      className="flex-1 md:flex-none cursor-not-allowed opacity-70"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Request Pending
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button 
                        onClick={handleConnect}
                        disabled={sendConnectionMutation.isPending}
                        className="w-full md:w-auto bg-primary hover:bg-primary/90"
                      >
                        {sendConnectionMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        Connect
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{alumni.name}</h1>
                  {alumni.batch && (
                    <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary font-semibold text-sm px-3 py-1">
                      Batch {alumni.batch}
                    </Badge>
                  )}
                  <p className="text-lg text-gray-600 mt-2">{alumni.role || 'Alumni'}</p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {alumni.company && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span className="font-medium">{alumni.company}</span>
                    </div>
                  )}
                  
                  {alumni.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{alumni.location}</span>
                    </div>
                  )}
                  
                  {alumni.graduationYear && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>Graduated {alumni.graduationYear}</span>
                    </div>
                  )}
                </div>

                {alumni.bio && (
                  <p className="text-gray-700 leading-relaxed">{alumni.bio}</p>
                )}

                {/* Connection Status Info */}
                {alumni.connectionStatus !== 'connected' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                    <p className="text-sm text-blue-800">
                      {alumni.connectionStatus === 'pending' ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Connection request pending. You'll be able to send messages once {alumni.name.split(' ')[0]} accepts.
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Connect with {alumni.name.split(' ')[0]} to unlock messaging and networking features.
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Expertise Section */}
            {expertiseList.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {expertiseList.map((skill, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Insights */}
            {alumni.recentInsights && alumni.recentInsights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Recent Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alumni.recentInsights.map((insight, i) => (
                    <div key={i} className="border-l-4 border-primary/30 pl-4 py-2 hover:border-primary transition-colors">
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{insight.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(insight.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            
            {/* Career Highlights */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Career Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(alumni.role || alumni.company) && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Current</p>
                    <p className="text-sm text-gray-600">
                      {alumni.role ? alumni.role : ''}{alumni.role && alumni.company ? ' @ ' : ''}{alumni.company ? alumni.company : ''}
                    </p>
                  </div>
                )}

                {(alumni.location || alumni.graduationYear || alumni.batch) && <Separator />}

                {(alumni.location) && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Location</p>
                    <p className="text-sm text-gray-600">{alumni.location}</p>
                  </div>
                )}

                {(alumni.graduationYear || alumni.batch) && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Graduation</p>
                    <p className="text-sm text-gray-600">
                      {alumni.graduationYear ? `Year ${alumni.graduationYear}` : ''}
                      {alumni.graduationYear && alumni.batch ? ' • ' : ''}
                      {alumni.batch ? `Batch ${alumni.batch}` : ''}
                    </p>
                  </div>
                )}

                {(alumni.experience || (alumni.previousCompanies && alumni.previousCompanies.length > 0)) && <Separator />}

                {alumni.experience && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Experience</p>
                    <p className="text-sm text-gray-600">{alumni.experience}</p>
                  </div>
                )}
                
                {alumni.previousCompanies && alumni.previousCompanies.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Previously at</p>
                    <div className="space-y-1">
                      {(Array.isArray(alumni.previousCompanies) ? alumni.previousCompanies : []).map((company, i) => (
                        <p key={i} className="text-sm text-gray-600">• {company}</p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Willing to Help With */}
            {alumni.willingToHelp && alumni.willingToHelp.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Can Help With</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(Array.isArray(alumni.willingToHelp) ? alumni.willingToHelp : []).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
