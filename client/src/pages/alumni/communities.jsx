import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, Loader2, CheckCircle, Search, Filter, ArrowRight, Sparkles, Globe, Zap, GraduationCap } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCommunities, useJoinCommunity } from "@/hooks/use-api";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AlumniCommunities() {
  const [location] = useLocation();
  const role = "alumni";
  const { data: communities = [], isLoading, error } = useCommunities();
  const joinCommunity = useJoinCommunity();
  const { toast } = useToast();
  const [joiningId, setJoiningId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [activeTab, setActiveTab] = useState("joined");

  const handleJoinCommunity = (communityId, communityName) => {
    setJoiningId(communityId);
    joinCommunity.mutate(communityId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: `Successfully joined ${communityName}!`,
        });
        setJoiningId(null);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to join community",
          variant: "destructive",
        });
        setJoiningId(null);
      },
    });
  };

  // Get unique domains for filtering
  const domains = useMemo(() => {
    const uniqueDomains = [...new Set(communities.map(c => c.domain))].filter(Boolean);
    return uniqueDomains.sort();
  }, [communities]);

  // Filter communities based on search and domain
  const filteredCommunities = useMemo(() => {
    return communities.filter(community => {
      const matchesSearch = searchQuery === "" || 
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDomain = selectedDomain === "all" || community.domain === selectedDomain;
      
      return matchesSearch && matchesDomain;
    });
  }, [communities, searchQuery, selectedDomain]);

  // Split communities into joined and available
  const joinedCommunities = useMemo(() => 
    filteredCommunities.filter(c => c.isJoined), [filteredCommunities]
  );
  
  const availableCommunities = useMemo(() => 
    filteredCommunities.filter(c => !c.isJoined), [filteredCommunities]
  );

  if (isLoading) {
    return (
      <Layout role={role}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role={role}>
        <div className="max-w-4xl mx-auto p-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Communities</h3>
              <p className="text-gray-600 mb-2">{error.message}</p>
              <p className="text-sm text-gray-500">Please try refreshing the page or contact support if the issue persists.</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!isLoading && communities.length === 0) {
    return (
      <Layout role={role}>
        <div className="max-w-4xl mx-auto p-8">
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-16 text-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Communities Available</h3>
              <p className="text-gray-600 mb-2">There are currently no communities in the system.</p>
              <p className="text-sm text-gray-500">Communities will appear here once they are created by administrators.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const CommunityCard = ({ community }) => (
    <Card key={community.id} className="flex flex-col hover:shadow-xl hover:border-primary/50 transition-all duration-300 group bg-white overflow-hidden">
      <CardHeader className="pb-3 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500"></div>
        
        <div className="flex justify-between items-start mb-3">
          <Badge 
            variant="outline" 
            className="bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary border-primary/30 font-semibold shadow-sm"
          >
            <Globe className="h-3 w-3 mr-1" />
            {community.domain}
          </Badge>
          {community.isJoined && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 flex items-center gap-1 shadow-md">
              <CheckCircle className="h-3 w-3" />
              Joined
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl text-gray-900 group-hover:text-primary transition-colors leading-tight">
          {community.name}
        </CardTitle>
        <CardDescription className="line-clamp-2 mt-2 text-gray-600 text-sm leading-relaxed">
          {community.description || "Join this community to help students and share your expertise."}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-md">
              <Users className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <span className="font-medium">{community.memberCount || 0} members</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-50 rounded-md">
              <MessageSquare className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <span className="font-medium">{community.postCount || 0} questions</span>
          </div>
        </div>
        <div className="flex gap-2">
          {community.isJoined ? (
            <Link href={`/${role}/communities/${community.id}`} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-md hover:shadow-lg transition-all group">
                View Community
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <>
              <Button
                onClick={() => handleJoinCommunity(community.id, community.name)}
                disabled={joiningId === community.id && joinCommunity.isPending}
                className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-md hover:shadow-lg transition-all"
              >
                {joiningId === community.id && joinCommunity.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Join Now
                  </>
                )}
              </Button>
              <Link href={`/${role}/communities/${community.id}`}>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm transition-all">
                  Preview
                </Button>
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout role={role}>
      <div className="max-w-7xl mx-auto space-y-8 fade-in-up">
        {/* Hero Header Section */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-purple-600 rounded-2xl p-8 md:p-10 text-white shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-6 w-6" />
                <span className="text-sm font-semibold uppercase tracking-wider opacity-90">Give Back & Mentor</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
                Communities
              </h1>
              <p className="text-lg text-white/90 max-w-2xl leading-relaxed">
                Share your experience, answer student questions, and help the next generation of professionals grow in their careers.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <div>
                      <p className="text-2xl font-bold">{communities.length}</p>
                      <p className="text-xs opacity-90">Total Communities</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <div>
                      <p className="text-2xl font-bold">{joinedCommunities.length}</p>
                      <p className="text-xs opacity-90">Communities Joined</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Create Community Button */}
            <Button 
              onClick={() => toast({
                title: "Coming Soon",
                description: "Community creation feature will be available soon!",
              })}
              className="bg-white text-primary hover:bg-white/90 shadow-lg"
              size="sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Create Community
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card className="shadow-lg border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search communities by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors text-base"
                />
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="pl-10 pr-8 py-3 h-12 border border-gray-200 rounded-md bg-gray-50 hover:bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer min-w-[160px]"
                  >
                    <option value="all">All Domains</option>
                    {domains.map(domain => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communities Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg h-12 bg-gray-100 p-1">
            <TabsTrigger value="joined" className="font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md">
              My Communities ({joinedCommunities.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md">
              All Communities ({filteredCommunities.length})
            </TabsTrigger>
            <TabsTrigger value="available" className="font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md">
              Discover ({availableCommunities.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-8">
            {filteredCommunities.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-200">
                <CardContent className="p-16 text-center">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery || selectedDomain !== "all" 
                      ? "No communities match your filters" 
                      : "No communities available"}
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {searchQuery || selectedDomain !== "all"
                      ? "Try adjusting your search terms or filters to discover more communities"
                      : "Communities will appear here once they are created"}
                  </p>
                  {(searchQuery || selectedDomain !== "all") && (
                    <Button 
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedDomain("all");
                      }}
                      variant="outline"
                      className="mt-4"
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCommunities.map((community) => <CommunityCard key={community.id} community={community} />)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="joined" className="mt-8">
            {joinedCommunities.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-200">
                <CardContent className="p-16 text-center">
                  <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">You haven't joined any communities yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Join communities to start helping students and sharing your experience
                  </p>
                  <Button 
                    onClick={() => setActiveTab("all")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Explore Communities
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {joinedCommunities.map((community) => <CommunityCard key={community.id} community={community} />)}
                </div>
                
                {availableCommunities.length > 0 && (
                  <Card className="mt-8 border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5 hover:border-primary/50 transition-all duration-300">
                    <CardContent className="p-8 text-center">
                      <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Discover More Communities</h3>
                      <p className="text-gray-600 max-w-md mx-auto mb-6">
                        {availableCommunities.length} more {availableCommunities.length === 1 ? 'community' : 'communities'} available to join
                      </p>
                      <Button 
                        onClick={() => setActiveTab("all")}
                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-md hover:shadow-lg"
                        size="lg"
                      >
                        <Globe className="h-5 w-5 mr-2" />
                        View All Communities
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="available" className="mt-8">
            {availableCommunities.length === 0 ? (
              <Card className="border-2 border-dashed border-green-200 bg-green-50/30">
                <CardContent className="p-16 text-center">
                  <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">You've joined all available communities!</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Fantastic! You're now part of all communities. Keep engaging and helping students!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {availableCommunities.map((community) => <CommunityCard key={community.id} community={community} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
