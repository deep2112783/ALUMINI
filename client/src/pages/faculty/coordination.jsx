import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Mail, Calendar, Loader2, UserPlus } from "lucide-react";
import { useFacultyAlumni, useFacultyEvents, useInviteAlumniToEvent } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";

export default function FacultyCoordination() {
  const { data: alumni = [], isLoading: loadingAlumni } = useFacultyAlumni();
  const { data: events = [] } = useFacultyEvents();
  const inviteAlumniMutation = useInviteAlumniToEvent();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  
  const filteredAlumni = alumni.filter(alum => {
    const matchesSearch = 
      alum.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alum.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alum.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alum.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alum.expertise?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDomain = filterDomain === "all" || alum.expertise?.toLowerCase().includes(filterDomain.toLowerCase());
    
    return matchesSearch && matchesDomain;
  });

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(eventSearchQuery.toLowerCase())
  );
  
  const handleInviteToEvent = () => {
    if (!selectedEvent || !selectedAlumni) {
      toast({ title: "Error", description: "Please select an event", variant: "destructive" });
      return;
    }
    
    inviteAlumniMutation.mutate(
      { eventId: selectedEvent, alumniId: selectedAlumni.id },
      {
        onSuccess: () => {
          toast({ title: "Success", description: `Invited ${selectedAlumni.name} to the event` });
          // Invalidate the event invitations cache to refresh the invitations dialog
          queryClient.invalidateQueries({ queryKey: ["event-invitations", Number(selectedEvent)] });
          // Also invalidate invitation stats
          queryClient.invalidateQueries({ queryKey: ["faculty-invitation-stats"] });
          setInviteDialogOpen(false);
          setSelectedAlumni(null);
          setSelectedEvent("");
          setEventSearchQuery("");
        },
        onError: (error) => {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
      }
    );
  };
  
  const openInviteDialog = (alum) => {
    setSelectedAlumni(alum);
    setEventSearchQuery("");
    setInviteDialogOpen(true);
  };
  
  if (loadingAlumni) {
    return (
      <Layout role="faculty">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  return (
    <Layout role="faculty">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alumni Coordination</h1>
            <p className="text-muted-foreground">Manage and invite alumni for college events.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search alumni by name, company, or expertise..." 
              className="pl-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterDomain} onValueChange={setFilterDomain}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              <SelectItem value="software">Software/Tech</SelectItem>
              <SelectItem value="data">Data Science/AI</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4">Expertise</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAlumni.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No alumni found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredAlumni.map((alum) => (
                  <tr key={alum.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {alum.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-gray-900 block">{alum.name}</span>
                          <span className="text-xs text-gray-500">{alum.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {alum.role && alum.company ? `${alum.role} at ${alum.company}` : alum.company || "Not specified"}
                    </td>
                    <td className="px-6 py-4">
                      {alum.expertise ? (
                        <Badge variant="outline" className="bg-white">
                          {alum.expertise.split(',')[0].trim()}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">No expertise listed</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${alum.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {alum.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Send Email"
                          onClick={() => window.location.href = `mailto:${alum.email}`}
                        >
                          <Mail className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Invite to Event"
                          onClick={() => openInviteDialog(alum)}
                        >
                          <Calendar className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Invite Alumni Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Alumni to Event</DialogTitle>
            </DialogHeader>
            {selectedAlumni && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedAlumni.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{selectedAlumni.name}</p>
                    <p className="text-sm text-gray-500">{selectedAlumni.company || selectedAlumni.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search & Select Event</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search events by name or location..." 
                      className="pl-9"
                      value={eventSearchQuery}
                      onChange={(e) => setEventSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an event" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      {filteredEvents.length === 0 ? (
                        <div className="px-2 py-6 text-center text-sm text-gray-500">
                          {events.length === 0 ? "No events available" : "No events match your search"}
                        </div>
                      ) : (
                        filteredEvents.map((event) => (
                          <SelectItem key={event.id} value={event.id.toString()}>
                            {event.title} - {new Date(event.date).toLocaleDateString()}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteToEvent} disabled={inviteAlumniMutation.isPending || !selectedEvent}>
                {inviteAlumniMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
