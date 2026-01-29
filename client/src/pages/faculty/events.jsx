import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar as CalendarIcon, MapPin, Edit, Trash2, Plus, Loader2, Users } from "lucide-react";
import { useFacultyEvents, useDeleteEvent, useUpdateEvent, useEventInvitations } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLocation } from "wouter";

export default function FacultyEvents() {
  const { data: events = [], isLoading } = useFacultyEvents();
  const deleteEventMutation = useDeleteEvent();
  const updateEventMutation = useUpdateEvent();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [invitationsDialogOpen, setInvitationsDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const { data: invitations = [], isLoading: invitationsLoading } = useEventInvitations(selectedEventId);
  
  const handleEditEvent = () => {
    if (!editingEvent.title || !editingEvent.date) {
      toast({ title: "Error", description: "Title and date are required", variant: "destructive" });
      return;
    }
    
    updateEventMutation.mutate(editingEvent, {
      onSuccess: () => {
        toast({ title: "Success", description: "Event updated successfully" });
        setEditDialogOpen(false);
        setEditingEvent(null);
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };
  
  const openEditDialog = (event) => {
    setEditingEvent({
      id: event.id,
      title: event.title,
      date: event.date.split('T')[0],
      location: event.location || "",
      description: event.description || ""
    });
    setEditDialogOpen(true);
  };

  const openInvitationsDialog = (eventId) => {
    setSelectedEventId(eventId);
    setInvitationsDialogOpen(true);
  };

  const handleDelete = (eventId, eventTitle) => {
    if (!confirm(`Are you sure you want to cancel "${eventTitle}"?`)) return;
    
    deleteEventMutation.mutate(eventId, {
      onSuccess: () => {
        toast({ title: "Success", description: "Event cancelled successfully" });
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
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
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
            <p className="text-muted-foreground">Create and manage college events involving alumni.</p>
          </div>
          <Button onClick={() => setLocation('/faculty/create-event')}>
            <Plus className="mr-2 h-4 w-4" /> Create New Event
          </Button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No events created yet. Create your first event!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card 
                key={event.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setLocation(`/faculty/events/${event.id}`)}
              >
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-4 w-full">
                     <div className="bg-primary/10 p-3 rounded-lg text-center min-w-[60px]">
                        <span className="block text-xs font-bold uppercase text-primary\">Event</span>
                        <span className="block text-xl font-bold text-primary\">{event.id}</span>
                     </div>
                     <div className="flex-1">
                       <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                       </div>
                       <p className="text-sm text-gray-500 mb-2\">{formatDate(event.date)} • {event.location || 'Location TBA'}</p>
                       {event.description && (
                         <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                       )}
                     </div>
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex-1 md:flex-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInvitationsDialog(event.id);
                      }}
                    >
                      <Users className="h-4 w-4 mr-2" /> Invitations
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 md:flex-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(event);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1 md:flex-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(event.id, event.title);
                      }}
                      disabled={deleteEventMutation.isPending}
                    >
                      {deleteEventMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" /> Cancel
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Edit Event Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            {editingEvent && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Event Title *</Label>
                  <Input
                    id="edit-title"
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Event Date *</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    className="min-h-[100px]"
                    value={editingEvent.description}
                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditEvent} disabled={updateEventMutation.isPending}>
                {updateEventMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invitations Dialog */}
        <Dialog open={invitationsDialogOpen} onOpenChange={setInvitationsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Event Invitations</DialogTitle>
            </DialogHeader>
            {invitationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No invitations sent for this event yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {invitations.map((invitation) => (
                  <div key={invitation.invitation_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{invitation.name?.charAt(0) || "A"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{invitation.name || invitation.email}</p>
                        <p className="text-sm text-gray-500 truncate">{invitation.company || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {invitation.role && (
                        <Badge variant="outline" className="text-xs">{invitation.role}</Badge>
                      )}
                      {invitation.volunteered ? (
                        <Badge className="bg-green-100 text-green-800">✓ Interested</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Invited</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setInvitationsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
