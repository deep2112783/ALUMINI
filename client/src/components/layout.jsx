import { Link, useLocation, useRoute } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Network,
  MessageSquare,
  Calendar,
  User,
  Bell,
  Search,
  LogOut,
  PenTool,
  BookOpen,
  Menu,
  X,
  CheckCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification } from "@/hooks/use-api";
import { useState } from "react";

const Sidebar = ({ role, className, onClose }) => {
  const [location] = useLocation();

  const studentLinks = [
    { href: "/student/home", icon: LayoutDashboard, label: "Home" },
    { href: "/student/communities", icon: Users, label: "Communities" },
    { href: "/student/insights", icon: GraduationCap, label: "Alumni Insights" },
    { href: "/student/connections", icon: Network, label: "Connections" },
    { href: "/student/messages", icon: MessageSquare, label: "Messages" },
    { href: "/student/notifications", icon: Bell, label: "Notifications" },
    { href: "/student/events", icon: Calendar, label: "Events" },
    { href: "/student/profile", icon: User, label: "Profile" },
  ];

  const alumniLinks = [
    { href: "/alumni/home", icon: LayoutDashboard, label: "Home" },
    { href: "/alumni/insights", icon: BookOpen, label: "Insights" },
    { href: "/alumni/communities", icon: Users, label: "Communities" },
    { href: "/alumni/connections", icon: Network, label: "Connections" },
    { href: "/alumni/messages", icon: MessageSquare, label: "Messages" },
      { href: "/alumni/notifications", icon: Bell, label: "Notifications" },
    { href: "/alumni/events", icon: Calendar, label: "Events" },
    { href: "/alumni/profile", icon: User, label: "Profile" },
  ];

  const facultyLinks = [
    { href: "/faculty/home", icon: LayoutDashboard, label: "Home" },
    { href: "/faculty/events", icon: Calendar, label: "Events" },
    { href: "/faculty/communities", icon: Users, label: "Communities" },
    { href: "/faculty/coordination", icon: Network, label: "Alumni Coordination" },
    { href: "/faculty/notifications", icon: Bell, label: "Notifications" },
    { href: "/faculty/profile", icon: User, label: "Profile" },
  ];

  const links =
    role === "student"
      ? studentLinks
      : role === "alumni"
      ? alumniLinks
      : facultyLinks;

  return (
    <div className={cn("flex flex-col h-full bg-sidebar text-sidebar-foreground", className)}>
      <div className="p-6 border-b border-sidebar-border/50 bg-gradient-to-br from-sidebar via-sidebar to-black/5">
        <h1 className="text-2xl font-bold tracking-tighter text-white">RGUKT</h1>
        <p className="text-xs text-sidebar-foreground/60 mt-0.5 font-medium">Alumni Connect</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const isActive = location === link.href || location.startsWith(`${link.href}/`);
          return (
            <Link key={link.href} href={link.href} onClick={onClose}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg scale-[1.02] pl-5"
                    : "hover:bg-sidebar-accent/40 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:pl-5",
                )}
              >
                <link.icon className={cn("h-4 w-4 transition-transform", isActive && "scale-110")}/>
                <span className="flex-1">{link.label}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-sidebar-primary-foreground" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border/50 bg-black/10">
        <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-sidebar-foreground/50 font-medium">
          <div className="w-1 h-1 rounded-full bg-sidebar-foreground/30" />
          <span>RGUKT RKV © 2026</span>
        </div>
      </div>
    </div>
  );
};

export default function Layout({ children, role = "student" }) {
  const [location, navigate] = useLocation();
  const { data: notifications = [], isLoading: notificationsLoading } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [hiddenNotificationIds, setHiddenNotificationIds] = useState(new Set());

  const unreadCount = notifications.filter(n => !n.read_status).length;

  // Get user info from localStorage
  const userEmail = localStorage.getItem("email") || "user@rgukt.ac.in";
  const userName = userEmail.split("@")[0];
  const userInitials = userName.slice(0, 2).toUpperCase();

  const getPageTitle = () => {
    const parts = location.split("/").filter(Boolean);
    if (parts.length === 0) return "Dashboard";

    // Prefer the last non-numeric segment (avoid showing IDs like 71, 10, etc.)
    let slug = parts[parts.length - 1];
    if (/^\d+$/.test(slug) && parts.length > 1) {
      slug = parts[parts.length - 2];
    }

    const prettyMap = {
      home: "Home",
      notifications: "Notifications",
      events: "Events",
      event: "Events",
      communities: "Communities",
      connections: "Connections",
      messages: "Messages",
      insights: "Insights",
      profile: "Profile",
      coordination: "Alumni Coordination",
    };

    const pretty = prettyMap[slug];
    if (pretty) return pretty;

    return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
  };

  const getNotificationHref = (notification) => {
    switch (notification.type) {
      case "connection":
        return `/${role}/connections`;
      case "message":
        return `/${role}/messages`;
      case "event":
      case "event_invitation":
        // Try to parse event_id from notification content
        try {
          const content = JSON.parse(notification.content);
          if (content.event_id) {
            return `/${role}/events/${content.event_id}`;
          }
        } catch (e) {
          // If parsing fails, just go to events page
        }
        return `/${role}/events`;
      case "volunteer_event":
        // Faculty gets volunteer notifications - go to event details
        try {
          const content = JSON.parse(notification.content);
          if (content.event_id) {
            return `/${role}/events/${content.event_id}`;
          }
        } catch (e) {
          // If parsing fails, just go to events page
        }
        return `/${role}/events`;
      case "community_question":
      case "community_reply":
        // Go to community details
        try {
          const content = JSON.parse(notification.content);
          if (content.community_id) {
            return `/${role}/communities/${content.community_id}`;
          }
        } catch (e) {
          // If parsing fails, just go to communities page
        }
        return `/${role}/communities`;
      case "insight":
        return `/${role}/insights`;
      default:
        return `/${role}/notifications/${notification.id}`;
    }
  };

  const hideNotificationLocally = (id) => {
    setHiddenNotificationIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read_status) {
      await markAsRead.mutateAsync(notification.id);
      hideNotificationLocally(notification.id);
    }
    setNotificationOpen(false);
    // Navigate to notifications page
    navigate(`/${role}/notifications`);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
    setHiddenNotificationIds(new Set());
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification.mutateAsync(notificationId);
    hideNotificationLocally(notificationId);
  };

  const handleMarkSingleAsRead = async (e, notificationId) => {
    e.stopPropagation();
    await markAsRead.mutateAsync(notificationId);
    hideNotificationLocally(notificationId);
  };

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "connection":
        return <Network className="h-4 w-4 text-blue-500" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case "event":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case "insight":
        return <BookOpen className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
        <Sidebar role={role} />
      </div>

      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 shadow-sm backdrop-blur-sm bg-white/95">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-gray-100 smooth-transition">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-sidebar border-r-0 text-sidebar-foreground w-64">
                <Sidebar role={role} />
              </SheetContent>
            </Sheet>
            <h2 className="text-base font-semibold text-gray-700">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary hover:bg-gray-100 relative smooth-transition">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500 hover:bg-red-600 border-2 border-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs text-primary hover:text-primary/80"
                      onClick={handleMarkAllAsRead}
                    >
                      <CheckCheck className="h-3 w-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[400px]">
                  {notificationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : notifications.filter(n => !hiddenNotificationIds.has(n.id)).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <Bell className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500">No notifications yet</p>
                      <p className="text-xs text-gray-400 mt-1">We'll notify you when something happens</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications
                        .filter((n) => !hiddenNotificationIds.has(n.id))
                        .map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={cn(
                            "p-4 hover:bg-gray-50 cursor-pointer transition-colors relative group",
                            !notification.read_status && "bg-blue-50/50"
                          )}
                        >
                          <button
                            onClick={(e) => handleDeleteNotification(e, notification.id)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                          >
                            <X className="h-3 w-3 text-gray-500" />
                          </button>
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm leading-relaxed",
                                !notification.read_status ? "font-medium text-gray-900" : "text-gray-700"
                              )}>
                                {(() => {
                                  try {
                                    const parsed = JSON.parse(notification.content);
                                    return parsed.message || notification.content;
                                  } catch {
                                    return notification.content;
                                  }
                                })()}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatNotificationTime(notification.created_at)}
                              </p>
                            </div>
                            {!notification.read_status && (
                              <div className="flex-shrink-0 flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={(e) => handleMarkSingleAsRead(e, notification.id)}
                                  title="Mark as read"
                                >
                                  <CheckCheck className="h-4 w-4 text-gray-500" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar-placeholder.png" alt="Profile" />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none capitalize">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/auth/login">
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
