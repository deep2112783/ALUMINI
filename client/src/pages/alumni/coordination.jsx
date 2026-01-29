import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Mail, MessageSquare, Loader2, UserPlus } from "lucide-react";
import { useAlumniList, useSendMessage } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function AlumniCoordination() {
  const { data: alumni = [], isLoading: loadingAlumni } = useAlumniList();
  const sendMessageMutation = useSendMessage();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [messageText, setMessageText] = useState("");
  
  const filteredAlumni = alumni.filter(alum => {
    // Don't show current user in the list
    const matchesSearch = 
      alum.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alum.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alum.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alum.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alum.expertise?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDomain = filterDomain === "all" || alum.expertise?.toLowerCase().includes(filterDomain.toLowerCase());
    
    return matchesSearch && matchesDomain;
  });
  
  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast({ title: "Error", description: "Message cannot be empty", variant: "destructive" });
      return;
    }
    
    if (!selectedAlumni) {
      toast({ title: "Error", description: "Please select an alumni", variant: "destructive" });
      return;
    }
    
    sendMessageMutation.mutate(
      { recipientId: selectedAlumni.id, content: messageText },
      {
        onSuccess: () => {
          toast({ title: "Success", description: `Message sent to ${selectedAlumni.name}` });
          setMessageDialogOpen(false);
          setSelectedAlumni(null);
          setMessageText("");
        },
        onError: (error) => {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
      }
    );
  };
  
  const openMessageDialog = (alum) => {
    setSelectedAlumni(alum);
    setMessageDialogOpen(true);
  };
  
  if (loadingAlumni) {
    return (
      <Layout role="alumni">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="alumni">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alumni Network</h1>
            <p className="text-muted-foreground">Connect and collaborate with fellow alumni.</p>
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
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Expertise</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAlumni.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No alumni found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredAlumni.map((alum) => (
                  <tr key={alum.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{alum.name?.charAt(0) || "A"}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-900">{alum.name || alum.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{alum.role || "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{alum.company || "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      {alum.expertise ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {alum.expertise}
                        </Badge>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Dialog open={messageDialogOpen && selectedAlumni?.id === alum.id} onOpenChange={(open) => {
                        if (!open) {
                          setMessageDialogOpen(false);
                          setSelectedAlumni(null);
                          setMessageText("");
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openMessageDialog(alum)}
                            className="gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Message
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Send Message to {selectedAlumni?.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea 
                              placeholder="Write your message..." 
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              className="min-h-32"
                            />
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => {
                              setMessageDialogOpen(false);
                              setSelectedAlumni(null);
                              setMessageText("");
                            }}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleSendMessage}
                              disabled={sendMessageMutation.isPending}
                            >
                              {sendMessageMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Sending...
                                </>
                              ) : (
                                "Send Message"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
