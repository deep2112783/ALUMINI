import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  GraduationCap, 
  Code2, 
  MessageCircle, 
  Mail,
  Lightbulb,
  Github,
  Linkedin,
  Globe
} from "lucide-react";
import { useStudentProfileById } from "@/hooks/use-api";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function StudentProfile() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: student, isLoading, error } = useStudentProfileById(id);

  useEffect(() => {
    console.log("[StudentProfile] Student data:", student);
    console.log("[StudentProfile] Student ID:", id);
  }, [student, id]);

  const handleMessage = () => {
    navigate(`/student/messages?studentId=${id}`);
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

  if (!student) {
    return (
      <Layout role="student">
        <div className="text-center py-12">
          <p className="text-gray-500">Student profile not found</p>
        </div>
      </Layout>
    );
  }

  const skillsList = student.skills ? (Array.isArray(student.skills) ? student.skills : student.skills.split(',').map(s => s.trim())) : [];
  
  return (
    <Layout role="student">
      <div className="space-y-6 fade-in-up">
        {/* Header Card */}
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center md:items-start gap-4">
                <Avatar className="h-32 w-32 border-4 border-gray-100 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-400 text-white text-3xl font-bold">
                    {student.name?.split(' ').map(n => n[0]).join('') || 'S'}
                  </AvatarFallback>
                </Avatar>
                
                {/* Action Button */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <Button 
                    onClick={handleMessage}
                    className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {student.name || student.email?.split('@')[0]}
                  </h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className="bg-blue-100 text-blue-800 border-0">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      Student
                    </Badge>
                    {student.department && (
                      <Badge variant="outline" className="text-gray-600">
                        {student.department}
                      </Badge>
                    )}
                    {student.year && (
                      <Badge variant="outline" className="text-gray-600">
                        {student.year}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Bio */}
                {student.bio && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Bio</h3>
                    <p className="text-gray-600">{student.bio}</p>
                  </div>
                )}

                {/* Contact */}
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{student.email}</span>
                </div>

                {/* Social Links */}
                {(student.linkedin || student.github || student.portfolio) && (
                  <div className="flex items-center gap-3 pt-2">
                    {student.linkedin && (
                      <a 
                        href={student.linkedin.startsWith('http') ? student.linkedin : `https://${student.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {student.github && (
                      <a 
                        href={student.github.startsWith('http') ? student.github : `https://${student.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {student.portfolio && (
                      <a 
                        href={student.portfolio.startsWith('http') ? student.portfolio : `https://${student.portfolio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Card */}
        {skillsList.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Code2 className="h-5 w-5 text-blue-500" />
                Skills & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, idx) => (
                  <Badge 
                    key={idx} 
                    className="bg-blue-50 text-blue-700 border border-blue-200 font-medium hover:bg-blue-100 transition-colors"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Academic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-500" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.department && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Department</h4>
                  <p className="text-gray-600">{student.department}</p>
                </div>
              )}
              {student.year && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Year</h4>
                  <p className="text-gray-600">{student.year}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
