import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bell, Check, Trash2, Search, CheckCheck } from "lucide-react";
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification } from "@/hooks/use-api";
import { useState } from "react";
import { useLocation } from "wouter";

// Single Tick Icon Component
function SingleTick() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
    </svg>
  );
}

// Double Tick Icon Component
function DoubleTick() {
  return (
    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" opacity="0.5" transform="translate(-3, -3)" />
    </svg>
  );
}

export default function NotificationsPage() {
  const [location, navigate] = useLocation();
  const role = location.includes("/alumni/") ? "alumni" : location.includes("/faculty/") ? "faculty" : "student";
  const { data: notifications = [], isLoading, refetch } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const getNotificationHref = (notification) => {
    try {
      switch (notification.type) {
        case "connection":
          return `/${role}/connections`;
        case "message":
          return `/${role}/messages`;
        case "event":
        case "event_invitation": {
          try {
            const content = JSON.parse(notification.content);
            if (content?.event_id) return `/${role}/events/${content.event_id}`;
          } catch (_) {}
          return `/${role}/events`;
        }
        case "volunteer_event": {
          try {
            const content = JSON.parse(notification.content);
            if (content?.event_id) return `/${role}/events/${content.event_id}`;
          } catch (_) {}
          return `/${role}/events`;
        }
        case "community_question":
        case "community_reply": {
          try {
            const content = JSON.parse(notification.content);
            if (content?.community_id) return `/${role}/communities/${content.community_id}`;
          } catch (_) {}
          return `/${role}/communities`;
        }
        case "insight":
          return `/${role}/insights`;
        default:
          return `/${role}/notifications/${notification.id}`;
      }
    } catch (_) {
      return `/${role}/notifications/${notification.id}`;
    }
  };

  const openNotification = async (notif) => {
    try {
      if (!notif.read) {
        await markAsRead.mutateAsync(notif.id);
      }
    } catch (err) {
      console.error("Failed to mark as read on open:", err);
    } finally {
      const href = getNotificationHref(notif);
      navigate(href);
    }
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

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch = notif.content?.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === "unread") return matchesSearch && !notif.read;
    if (filter === "read") return matchesSearch && notif.read;
    return matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationText = (notif) => {
    if (!notif?.content) return "Notification";
    try {
      const parsed = JSON.parse(notif.content);
      return parsed.message || parsed.title || parsed.text || notif.content;
    } catch {
      return notif.content;
    }
  };

  const handleMarkAsRead = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await markAsRead.mutateAsync(notificationId);
      await refetch();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      await refetch();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await deleteNotification.mutateAsync(notificationId);
      await refetch();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  return (
    <Layout role={role}>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  {unreadCount > 0 
                    ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                    : 'You are all caught up!'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button onClick={handleMarkAllAsRead} size="sm" variant="outline">
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-50 border-gray-200"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                Unread
              </Button>
              <Button
                variant={filter === "read" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("read")}
              >
                Read
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-lg border shadow-sm transition-all hover:shadow-md cursor-pointer ${
                  !notif.read ? "border-l-4 border-l-primary" : ""
                }`}
                onClick={() => openNotification(notif)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 flex-shrink-0 ${!notif.read ? "text-primary" : "text-gray-300"}`}>
                          {notif.read ? <DoubleTick /> : <SingleTick />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-base ${!notif.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                            {getNotificationText(notif)}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-500">
                              {new Date(notif.created_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                            {notif.type && (
                              <Badge variant="secondary" className="text-xs">
                                {notif.type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notif.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleMarkAsRead(e, notif.id)}
                          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(e, notif.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-12 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {notifications.length === 0 ? "No notifications" : "No results found"}
                </h3>
                <p className="text-sm text-gray-500">
                  {notifications.length === 0 
                    ? "You don't have any notifications yet"
                    : "Try adjusting your search or filter"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
