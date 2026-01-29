import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Mail, MapPin, Calendar, GraduationCap, Loader2, ArrowLeft } from "lucide-react";

export default function AlumniProfileView() {
  const [match, params] = useRoute("/alumni/alumni/:id");
  const alumniId = params?.id;
  const [, navigate] = useLocation();

  const { data: alumni, isLoading } = useQuery({
    queryKey: ["alumni-profile", alumniId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/alumni/alumni/${alumniId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch alumni profile");
      return res.json();
    },
    enabled: !!alumniId,
  });

  if (isLoading) {
    return (
      <Layout role="alumni">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
        </div>
      </Layout>
    );
  }

  if (!alumni) {
    return (
      <Layout role="alumni">
        <div className="text-center py-12">
          <p className="text-gray-500">Alumni not found</p>
        </div>
      </Layout>
    );
  }

  const alumniName = alumni.name || (alumni.email ? 
    alumni.email.split('@')[0].replace(/\./g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') : 'Alumni');

  const expertiseList = alumni.expertise ? 
    (Array.isArray(alumni.expertise) ? alumni.expertise : alumni.expertise.split(',').map(s => s.trim())) : 
    [];

  const messagePeerId = alumni.user_id || alumni.id;

  return (
    <Layout role="alumni">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          className="px-0 text-gray-700 hover:text-gray-900"
          onClick={() => navigate("/alumni/connections")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to connections
        </Button>

        {/* Header Card */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24 border-4 border-[#800000]/20">
                <AvatarFallback className="text-2xl bg-[#800000] text-white font-bold">
                  {alumniName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{alumniName}</h1>
                  {alumni.company && alumni.role && (
                    <p className="text-lg text-gray-600 flex items-center gap-2 mt-2">
                      <Briefcase className="h-5 w-5" />
                      {alumni.role} at {alumni.company}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">{alumni.email}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    className="bg-[#800000] hover:bg-[#600000]"
                    onClick={() => messagePeerId && navigate(`/alumni/messages?peer=${messagePeerId}`)}
                    disabled={!messagePeerId}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Info */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Work Experience */}
          {(alumni.company || alumni.role) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900">{alumni.role || 'Professional'}</p>
                  <p className="text-gray-600">{alumni.company || 'Company'}</p>
                  {alumni.location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {alumni.location}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-semibold text-gray-900">RGUKT RK Valley</p>
                <p className="text-gray-600">{alumni.department || 'Engineering'}</p>
                {alumni.graduation_year && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    Graduated {alumni.graduation_year}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expertise */}
        {expertiseList.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Expertise & Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {expertiseList.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bio */}
        {alumni.bio && (
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{alumni.bio}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
