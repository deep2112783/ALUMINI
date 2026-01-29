import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Trash2, Reply } from "lucide-react";
import { useNotifications, useMarkNotificationAsRead } from "@/hooks/use-api";
import { useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";

export default function NotificationDetailPage() {
  const [location, navigate] = useLocation();
  const { id } = useParams();
  
  // Detect role from URL path
  const role = location.includes("/alumni/") ? "alumni" : location.includes("/faculty/") ? "faculty" : "student";
  
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const hasMarkedRef = useRef(false);

  if (isLoading) {
    return (
      <Layout role={role}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const notificationId = Number(id);
  const notif = notifications.find((n) => n.id === notificationId);

  useEffect(() => {
    if (!notif || hasMarkedRef.current) return;
    hasMarkedRef.current = true;
    markAsRead.mutate(notificationId);
  }, [notif, markAsRead, notificationId]);

  if (!notif) {
    return (
      <Layout role={role}>
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <p className="text-red-800 text-lg font-semibold">Notification not found</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate(`/${role}/notifications`)}
            >
              Back to Notifications
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout role={role}>
      <div className="space-y-6 fade-in-up max-w-2xl mx-auto">
        
        {/* Back Button */}
        <Button
          variant="ghost"
          className="text-primary hover:text-primary/80 -ml-4"
          onClick={() => navigate(`/${role}/notifications`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Notifications
        </Button>

        {/* Notification Detail Card */}
        <Card className="border border-primary/20">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-primary" />
                  <CardTitle className="text-2xl text-gray-900">
                    {notif.title || notif.message}
                  </CardTitle>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  {notif.created_at 
                    ? new Date(notif.created_at).toLocaleString()
                    : "Recently"}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
              <p className="text-gray-700 leading-relaxed">
                {(() => {
                  try {
                    const parsed = JSON.parse(notif.content || '{}');
                    return parsed.message || notif.content || notif.description || notif.message || "No additional details provided";
                  } catch {
                    return notif.description || notif.message || notif.content || "No additional details provided";
                  }
                })()}
              </p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 font-medium">Type</p>
                <p className="text-sm text-gray-900 mt-1">{notif.type || "Update"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Status</p>
                <p className="text-sm text-gray-900 mt-1 capitalize">
                  {notif.read ? "Read" : "Unread"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => {
                  // Navigate based on notification type
                  if (notif.type === "message") {
                    navigate(`/${role}/messages`);
                  } else if (notif.type === "connection_request" || notif.type === "connection_accepted" || notif.type === "connection_rejected") {
                    navigate(`/${role}/connections`);
                  } else if (notif.type === "event" || notif.type === "event_invitation" || notif.type === "volunteer_event") {
                    // Try to parse event_id from notification content
                    try {
                      const content = JSON.parse(notif.content);
                      if (content.event_id) {
                        navigate(`/${role}/events/${content.event_id}`);
                      } else {
                        navigate(`/${role}/events`);
                      }
                    } catch {
                      navigate(`/${role}/events`);
                    }
                  } else if (notif.type === "community_question" || notif.type === "community_reply") {
                    // Try to parse community_id from notification content
                    try {
                      const content = JSON.parse(notif.content);
                      if (content.community_id) {
                        navigate(`/${role}/communities/${content.community_id}`);
                      } else {
                        navigate(`/${role}/communities`);
                      }
                    } catch {
                      navigate(`/${role}/communities`);
                    }
                  } else {
                    // Mark as read and navigate back for other notification types
                    markAsRead.mutate(notificationId);
                    navigate(`/${role}/notifications`);
                  }
                }}
              >
                <Reply className="h-4 w-4 mr-2" />
                {notif.type === "message" ? "View Message" : notif.type?.includes("connection") ? "View Connections" : notif.type === "event_invitation" || notif.type === "event" || notif.type === "volunteer_event" ? "View Event" : notif.type === "community_question" || notif.type === "community_reply" ? "View Community" : "Take Action"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  navigate(`/${role}/notifications`);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Related Notifications */}
        {notifications && notifications.length > 1 && (
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-4">Recent Notifications</h3>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((n) => (
                <Card
                  key={n.id}
                  className="border border-gray-100 hover:shadow-md cursor-pointer transition-all"
                  onClick={() => navigate(`/student/notifications/${n.id}`)}
                >
                  <CardContent className="p-4">
                    <p className="font-medium text-gray-900 text-sm">
                      {n.title || n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {n.created_at 
                        ? new Date(n.created_at).toLocaleDateString()
                        : "Recently"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
