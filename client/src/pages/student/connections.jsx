import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useConnections, usePendingRequests, useAcceptConnection, useRejectConnection, useRemoveConnection } from "@/hooks/use-api";
import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Loader2, UserCheck, UserPlus, Users, CheckCircle, X, Briefcase, GraduationCap } from "lucide-react";

export default function Connections() {
  // All hooks must be called in the same order every render
  const [searchQuery, setSearchQuery] = useState("");
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { data: connections = [], isLoading } = useConnections();
  const { data: pendingRequests = [], isLoading: requestsLoading } = usePendingRequests();
  const acceptConnection = useAcceptConnection();
  const rejectConnection = useRejectConnection();
  const role = location.split("/")[1];
  const removeConnection = useRemoveConnection(role);

  const filteredConnections = useMemo(() => {
    if (!searchQuery) return connections;
    return connections.filter(conn => 
      conn.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.info?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [connections, searchQuery]);

  const alumniConnections = useMemo(() => 
    filteredConnections.filter(c => c.role === 'alumni'),
    [filteredConnections]
  );
  
  const studentConnections = useMemo(() => 
    filteredConnections.filter(c => c.role === 'student'),
    [filteredConnections]
  );

  const handleAccept = (requestId, userName) => {
    acceptConnection.mutate(requestId, {
      onSuccess: () => {
        toast({
          title: "Connection Accepted",
          description: `You are now connected with ${userName}`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to accept connection",
          variant: "destructive",
        });
      },
    });
  };

  const handleReject = (requestId, userName) => {
    rejectConnection.mutate(requestId, {
      onSuccess: () => {
        toast({
          title: "Request Rejected",
          description: `Rejected connection request from ${userName}`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to reject connection",
          variant: "destructive",
        });
      },
    });
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
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Connections</h1>
          <p className="text-gray-600">Build your professional network with alumni and peers</p>
        </div>

        <Tabs defaultValue="alumni" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="alumni">
              Alumni ({alumniConnections.length})
            </TabsTrigger>
            <TabsTrigger value="students">
              Students ({studentConnections.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
            </TabsTrigger>
          </TabsList>

          <div className="my-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by name, company, or department..." 
              className="pl-9 bg-white" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <TabsContent value="alumni" className="space-y-4">
            {alumniConnections.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">No alumni connections yet</p>
                  <p className="text-gray-400 text-sm mt-1">Connect with alumni for mentorship and guidance</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alumniConnections.map((alum) => (
                  <Card 
                    key={alum.id} 
                    className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30" 
                    onClick={() => navigate(`/student/alumni/${alum.user_id}`)}
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                      <Avatar className="h-20 w-20 border-4 border-primary/10">
                        <AvatarFallback className="text-xl bg-primary text-white font-semibold">
                          {alum.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="w-full">
                        <h3 className="font-semibold text-lg text-gray-900">{alum.name || 'Alumni'}</h3>
                        {alum.info && (
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <Briefcase className="h-3 w-3 text-gray-500" />
                            <p className="text-sm text-gray-600">{alum.info}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{alum.email}</p>
                      </div>
                      <Button
                        size="sm"
                        className="mt-2 bg-green-600 hover:bg-green-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove connection with ${alum.name || 'this user'}?`)) {
                            console.log('[Remove] Removing connection with user_id:', alum.user_id);
                            removeConnection.mutate(alum.user_id, {
                              onSuccess: () => {
                                console.log('[Remove] Successfully removed');
                                toast({ title: "Removed", description: "Connection removed" });
                              },
                              onError: (error) => {
                                console.error('[Remove] Error:', error);
                                toast({ 
                                  title: "Failed to remove connection", 
                                  description: error?.message || "Unknown error", 
                                  variant: "destructive" 
                                });
                              }
                            });
                          }
                        }}
                        disabled={removeConnection.isPending}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="students">
            {studentConnections.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">No student connections yet</p>
                  <p className="text-gray-400 text-sm mt-1">Connect with peers for collaboration</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentConnections.map((student) => (
                  <Card key={student.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                      <Avatar className="h-20 w-20 border-4 border-blue-50">
                        <AvatarFallback className="text-xl bg-blue-100 text-blue-700 font-semibold">
                          {student.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="w-full">
                        <h3 className="font-semibold text-lg text-gray-900">{student.name || 'Student'}</h3>
                        {student.info && (
                          <p className="text-sm text-gray-600 mt-1">{student.info}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{student.email}</p>
                      </div>
                      <Button
                        size="sm"
                        className="mt-2 bg-green-600 hover:bg-green-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove connection with ${student.name || 'this user'}?`)) {
                            console.log('[Remove] Removing connection with user_id:', student.user_id);
                            removeConnection.mutate(student.user_id, {
                              onSuccess: () => {
                                console.log('[Remove] Successfully removed');
                                toast({ title: "Removed", description: "Connection removed" });
                              },
                              onError: (error) => {
                                console.error('[Remove] Error:', error);
                                toast({ 
                                  title: "Failed to remove connection", 
                                  description: error?.message || "Unknown error", 
                                  variant: "destructive" 
                                });
                              }
                            });
                          }
                        }}
                        disabled={removeConnection.isPending}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="requests">
            {requestsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pendingRequests.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">No pending connection requests</p>
                  <p className="text-gray-400 text-sm mt-1">New requests will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRequests.map((request) => (
                  <Card key={request.id} className="border-orange-200 hover:shadow-md transition-all">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                      <Avatar className="h-20 w-20 border-4 border-orange-50">
                        <AvatarFallback className="text-xl bg-orange-100 text-orange-700 font-semibold">
                          {request.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="w-full">
                        <h3 className="font-semibold text-lg text-gray-900">{request.name || 'User'}</h3>
                        {request.info && (
                          <p className="text-sm text-gray-600 mt-1">{request.info}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{request.email}</p>
                        <Badge variant="outline" className="mt-2 bg-orange-50 text-orange-700 border-orange-200">
                          {request.role === 'alumni' ? 'Alumni' : 'Student'}
                        </Badge>
                      </div>
                      <div className="flex gap-2 w-full mt-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-primary hover:bg-primary/90"
                          onClick={() => handleAccept(request.user_id, request.name)}
                          disabled={acceptConnection.isPending}
                        >
                          {acceptConnection.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleReject(request.user_id, request.name)}
                          disabled={rejectConnection.isPending}
                        >
                          {rejectConnection.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
