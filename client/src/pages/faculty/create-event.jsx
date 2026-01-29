import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Loader2, ArrowLeft } from "lucide-react";
import { useCreateEvent } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLocation } from "wouter";

export default function CreateEvent() {
  const createEventMutation = useCreateEvent();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    description: ""
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date) {
      toast({ 
        title: "Error", 
        description: "Title and date are required", 
        variant: "destructive" 
      });
      return;
    }
    
    createEventMutation.mutate(formData, {
      onSuccess: () => {
        toast({ 
          title: "Success", 
          description: "Event created successfully" 
        });
        setLocation("/faculty/events");
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
    <Layout role="faculty">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/faculty/events")}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
            <p className="text-gray-500 mt-1">Fill in the details to create an alumni event</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5 text-primary" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Event Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Annual Alumni Meet 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-base h-12"
                  required
                />
                <p className="text-sm text-gray-500">Choose a clear and descriptive title</p>
              </div>

              {/* Date & Location Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-base font-semibold">
                    Event Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="text-base h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base font-semibold">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="Main Auditorium, Building A"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="text-base h-12"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Event Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the event, agenda, and what attendees can expect..."
                  className="min-h-[150px] text-base"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <p className="text-sm text-gray-500">
                  Provide details about the event schedule, speakers, and activities
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/faculty/events")}
                  className="flex-1 h-12"
                  disabled={createEventMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-primary hover:bg-primary/90"
                  disabled={createEventMutation.isPending}
                >
                  {createEventMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-5 w-5 mr-2" />
                      Create Event
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Helper Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for Creating Events</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use clear, descriptive titles that indicate the event's purpose</li>
              <li>• Include the full date and location for better attendance</li>
              <li>• Add a detailed description with agenda and expected outcomes</li>
              <li>• After creating, you can invite specific alumni from the coordination page</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
