import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useConnectionRequests, useConnectedStudents, useAlumniNetwork, useAcceptConnectionRequest, useRejectConnectionRequest, useSendAlumniConnectionRequest, useRemoveConnection } from "@/hooks/use-api";
import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Mail, Check, X, Users, Briefcase, GraduationCap, Loader2, UserPlus } from "lucide-react";

export default function Connections() {
  // All hooks at the top in consistent order
  const [searchQuery, setSearchQuery] = useState("");
    const [pendingAlumniId, setPendingAlumniId] = useState(null);
    const [requestedAlumni, setRequestedAlumni] = useState(() => {
      const saved = localStorage.getItem('requestedAlumniConnections');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    });
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { data: requests = [], isLoading: requestsLoading } = useConnectionRequests();
  const { data: students = [], isLoading: studentsLoading } = useConnectedStudents();
  const { data: alumniNetwork = [], isLoading: alumniLoading } = useAlumniNetwork();
  const acceptMutation = useAcceptConnectionRequest();
  const rejectMutation = useRejectConnectionRequest();
  const sendConnectionMutation = useSendAlumniConnectionRequest({
    onSuccess: (data, alumniId) => {
      if (pendingAlumniId === alumniId) {
        setRequestedAlumni(prev => {
          const newSet = new Set([...prev, alumniId]);
          localStorage.setItem('requestedAlumniConnections', JSON.stringify([...newSet]));
          return newSet;
        });
        toast({ 
          title: "Connection Request Sent", 
          description: "Your request has been sent" 
        });
        setPendingAlumniId(null);
      }
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to send request", 
        variant: "destructive" 
      });
      setPendingAlumniId(null);
    }
  });
  const removeConnection = useRemoveConnection("alumni");

  // useMemo hooks must be called before any early returns
  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.role !== 'alumni' && (
        !searchQuery || 
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.department?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [students, searchQuery]);

  const filteredAlumni = useMemo(() => {
    return alumniNetwork.filter(alum => 
      !searchQuery || 
      alum.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alum.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alum.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alum.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [alumniNetwork, searchQuery]);

  const connectedAlumni = useMemo(() => {
    return students.filter(conn => conn.role === 'alumni');
  }, [students]);

  const handleAcceptRequest = (studentId) => {
    acceptMutation.mutate(studentId, {
      onSuccess: () => {
        toast({ title: "Connection Accepted", description: "You are now connected" });
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message || "Failed to accept", variant: "destructive" });
      },
    });
  };

  const handleRejectRequest = (studentId) => {
    rejectMutation.mutate(studentId, {
      onSuccess: () => {
        toast({ title: "Request Declined", description: "Connection request declined" });
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message || "Failed to decline", variant: "destructive" });
      },
    });
  };

  const isLoading = requestsLoading || studentsLoading || alumniLoading;

  if (isLoading) {
    return (
      <Layout role="alumni">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="alumni">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Connections</h1>
          <p className="text-gray-600 mt-1">Manage your mentorship connections</p>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-gray-100">
            <TabsTrigger value="requests" className="data-[state=active]:bg-[#800000] data-[state=active]:text-white">
              Requests {requests.length > 0 && (
                <Badge className="ml-2 bg-red-500">{requests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-[#800000] data-[state=active]:text-white">
              Students ({filteredStudents.length})
            </TabsTrigger>
            <TabsTrigger value="connected-alumni" className="data-[state=active]:bg-[#800000] data-[state=active]:text-white">
              Alumni ({connectedAlumni.length})
            </TabsTrigger>
            <TabsTrigger value="alumni-network" className="data-[state=active]:bg-[#800000] data-[state=active]:text-white">
              Network ({filteredAlumni.length})
            </TabsTrigger>
          </TabsList>

          {/* Connection Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            {requests.length > 0 ? (
              <>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>{requests.length} students</strong> want to connect with you for mentorship.
                  </p>
                </div>

                {requests.map((request) => {
                  const studentName = request.email ? 
                    request.email.split('@')[0].replace(/\./g, ' ').split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ') : 'Student';
                  
                  const skillsList = request.skills ? 
                    (Array.isArray(request.skills) ? request.skills : request.skills.split(',').map(s => s.trim())) : 
                    [];
                  
                  return (
                    <Card key={request.id} className="border border-gray-200 hover:shadow-md transition-shadow flex flex-col min-h-[280px]">
                      <CardContent className="p-6 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <Avatar className="h-14 w-14">
                              <AvatarFallback className="bg-[#800000] text-white font-semibold">
                                {studentName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 space-y-3">
                              <div>
                                <h3 className="font-bold text-lg text-gray-900">{studentName}</h3>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <GraduationCap className="h-3 w-3" />
                                  {request.department || 'Computer Science'}
                                </p>
                              </div>

                              {skillsList.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {skillsList.map((skill) => (
                                    <Badge key={skill} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 mt-auto">
                            <Button 
                              className="bg-[#800000] hover:bg-[#600000]"
                              onClick={() => handleAcceptRequest(request.user_id ?? request.id)}
                              disabled={acceptMutation.isPending}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => handleRejectRequest(request.user_id ?? request.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            ) : (
              <Card className="border border-gray-200">
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-semibold text-gray-900 mb-2">No Pending Requests</h3>
                  <p className="text-gray-500">You don't have any connection requests at the moment.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Connected Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search connected students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => {
                  const studentName = student.email ? 
                    student.email.split('@')[0].replace(/\./g, ' ').split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ') : 'Student';
                  
                  const skillsList = student.skills ? 
                    (Array.isArray(student.skills) ? student.skills : student.skills.split(',').map(s => s.trim())) : 
                    [];
                  
                  return (
                    <Card 
                      key={student.id} 
                      className="border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer flex flex-col min-h-[280px]"
                      onClick={() => navigate(`/alumni/student/${student.user_id || student.id}`)}
                    >
                      <CardContent className="p-5 flex flex-col flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-[#800000] text-white font-semibold">
                              {studentName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{studentName}</h3>
                          <p className="text-xs text-gray-600 flex items-center gap-1 mb-2">
                            <GraduationCap className="h-3 w-3" />
                            {student.department || 'Computer Science'}
                          </p>
                        </div>

                        {skillsList.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {skillsList.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            className="flex-1" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/alumni/messages?peer=${student.user_id || student.id}`);
                            }}
                          >
                            <Mail className="h-3 w-3 mr-2" />
                            Message
                          </Button>
                          <Button
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Remove connection with ${studentName}?`)) {
                                removeConnection.mutate(student.user_id || student.id, {
                                  onSuccess: () => toast({ title: "Removed", description: "Connection removed" }),
                                  onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" })
                                });
                              }
                            }}
                            disabled={removeConnection.isPending}
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border border-gray-200">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">No connected students found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Connected Alumni Tab */}
          <TabsContent value="connected-alumni" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search connected alumni..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {connectedAlumni.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectedAlumni.map((alumni) => {
                  const alumniName = alumni.name || (alumni.email ? 
                    alumni.email.split('@')[0].replace(/\./g, ' ').split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ') : 'Alumni');
                  
                  return (
                    <Card 
                      key={alumni.id} 
                      className="border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer flex flex-col min-h-[280px]"
                      onClick={() => navigate(`/alumni/alumni/${alumni.user_id}`)}
                    >
                      <CardContent className="p-5 flex flex-col flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-[#800000] text-white font-semibold">
                              {alumniName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{alumniName}</h3>
                          {alumni.info && (
                            <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                              <Briefcase className="h-3 w-3" />
                              {alumni.info}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">{alumni.email}</p>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            className="flex-1" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/alumni/messages?peer=${alumni.user_id}`);
                            }}
                          >
                            <Mail className="h-3 w-3 mr-2" />
                            Message
                          </Button>
                          <Button
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Remove connection with ${alumniName}?`)) {
                                removeConnection.mutate(alumni.user_id, {
                                  onSuccess: () => toast({ title: "Removed", description: "Connection removed" }),
                                  onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" })
                                });
                              }
                            }}
                            disabled={removeConnection.isPending}
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border border-gray-200">
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-semibold text-gray-900 mb-2">No Connected Alumni</h3>
                  <p className="text-gray-500">You haven't connected with any alumni yet. Browse the network to send requests.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="alumni-network" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search alumni network..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredAlumni.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAlumni.map((alum) => {
                  const alumName = alum.name || (alum.email ? 
                    alum.email.split('@')[0].replace(/\./g, ' ').split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ') : 'Alumni');
                  
                  const expertiseList = alum.expertise ? 
                    (Array.isArray(alum.expertise) ? alum.expertise : alum.expertise.split(',').map(s => s.trim())) : 
                    [];
                  
                  return (
                    <Card 
                      key={alum.id} 
                      className="border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1"
                    >
                      <CardContent className="p-5 space-y-4">
                        <div 
                          className="flex items-start justify-between cursor-pointer"
                          onClick={() => navigate(`/alumni/alumni/${alum.id}`)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-[#800000] text-white font-semibold">
                              {alumName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div 
                          className="cursor-pointer"
                          onClick={() => navigate(`/alumni/alumni/${alum.id}`)}
                        >
                          <h3 className="font-bold text-gray-900 mb-1">{alumName}</h3>
                          {alum.company && (
                            <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                              <Briefcase className="h-3 w-3" />
                              {alum.role} at {alum.company}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">{alum.email}</p>
                        </div>

                        {expertiseList.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {expertiseList.slice(0, 3).map((exp) => (
                              <Badge key={exp} variant="outline" className="text-xs">
                                {exp}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            className={`flex-1 font-semibold smooth-transition ${
                              requestedAlumni.has(alum.id)
                                ? 'bg-[#800000] text-white hover:bg-[#800000]/90 cursor-not-allowed disabled:opacity-100'
                                : 'bg-[#800000] text-white hover:bg-[#800000]/90'
                            }`}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!requestedAlumni.has(alum.id)) {
                                  setPendingAlumniId(alum.id);
                                  sendConnectionMutation.mutate(alum.id);
                                }
                            }}
                            disabled={(pendingAlumniId === alum.id && sendConnectionMutation.isPending)}
                          >
                              {pendingAlumniId === alum.id && sendConnectionMutation.isPending ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                  Connecting...
                                </>
                              ) : requestedAlumni.has(alum.id) ? (
                                <>
                                  <Check className="h-3 w-3 mr-2" />
                                  Requested
                                </>
                              ) : (
                                <>
                                  <UserPlus className="h-3 w-3 mr-2" />
                                  Connect
                                </>
                              )}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/alumni/messages?peer=${alum.user_id || alum.id}`);
                            }}
                          >
                            <Mail className="h-3 w-3 mr-2" />
                            Message
                          </Button>
                          {alum.status === 'connected' && (
                            <Button
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Remove connection with ${alumName}?`)) {
                                  removeConnection.mutate(alum.user_id || alum.id, {
                                    onSuccess: () => toast({ title: "Removed", description: "Connection removed" }),
                                    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" })
                                  });
                                }
                              }}
                              disabled={removeConnection.isPending}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border border-gray-200">
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-semibold text-gray-900 mb-2">No Alumni Found</h3>
                  <p className="text-gray-500">No alumni in the network yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
