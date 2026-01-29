import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Lazy load all pages for better initial load performance
const Login = lazy(() => import("@/pages/auth/login"));
const CreatePassword = lazy(() => import("@/pages/auth/create-password"));
const StudentHome = lazy(() => import("@/pages/student/home"));
const NotificationsPage = lazy(() => import("@/pages/student/notifications"));
const NotificationDetail = lazy(() => import("@/pages/student/notification-detail"));
const Communities = lazy(() => import("@/pages/student/communities"));
const CommunityDetails = lazy(() => import("@/pages/student/community-details"));
const Insights = lazy(() => import("@/pages/student/insights"));
const Connections = lazy(() => import("@/pages/student/connections"));
const Messages = lazy(() => import("@/pages/student/messages"));
const Events = lazy(() => import("@/pages/student/events"));
const Profile = lazy(() => import("@/pages/student/profile"));
const StudentAlumniProfile = lazy(() => import("@/pages/student/alumni-profile"));
const StudentProfileView = lazy(() => import("@/pages/student/student-profile"));
const AlumniHome = lazy(() => import("@/pages/alumni/home"));
const AlumniInsights = lazy(() => import("@/pages/alumni/insights"));
const AlumniProfile = lazy(() => import("@/pages/alumni/profile"));
const AlumniStudentProfile = lazy(() => import("@/pages/alumni/student-profile"));
const AlumniProfileView = lazy(() => import("@/pages/alumni/alumni-profile"));
const AlumniEvents = lazy(() => import("@/pages/alumni/events"));
const AlumniCoordination = lazy(() => import("@/pages/alumni/coordination"));
const AlumniCommunities = lazy(() => import("@/pages/alumni/communities"));
const AlumniConnections = lazy(() => import("@/pages/alumni/connections"));
const FacultyHome = lazy(() => import("@/pages/faculty/home"));
const FacultyCoordination = lazy(() => import("@/pages/faculty/coordination"));
const FacultyProfile = lazy(() => import("@/pages/faculty/profile"));
const FacultyEvents = lazy(() => import("@/pages/faculty/events"));
const FacultyEventDetails = lazy(() => import("@/pages/faculty/event-details"));
const CreateEvent = lazy(() => import("@/pages/faculty/create-event"));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
  </div>
);

function Router() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (location === "/") {
      setLocation("/auth/login");
    }
  }, [location, setLocation]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        {/* Auth */}
        <Route path="/auth/login" component={Login} />
        <Route path="/auth/create-password" component={CreatePassword} />

        {/* Student Routes */}
        <Route path="/student/home" component={StudentHome} />
        <Route path="/student/notifications" component={NotificationsPage} />
        <Route path="/student/notifications/:id" component={NotificationDetail} />
        <Route path="/student/communities" component={Communities} />
        <Route path="/student/communities/:id" component={CommunityDetails} />
        <Route path="/student/insights" component={Insights} />
        <Route path="/student/connections" component={Connections} />
        <Route path="/student/messages" component={Messages} />
        <Route path="/student/events/:id" component={Events} />
        <Route path="/student/events" component={Events} />
        <Route path="/student/profile" component={Profile} />
        <Route path="/student/alumni/:id" component={StudentAlumniProfile} />
        <Route path="/student/student/:id" component={StudentProfileView} />

        {/* Alumni Routes */}
        <Route path="/alumni/home" component={AlumniHome} />
        <Route path="/alumni/insights" component={AlumniInsights} />
        <Route path="/alumni/communities" component={AlumniCommunities} />
        <Route path="/alumni/communities/:id" component={CommunityDetails} />
        <Route path="/alumni/connections" component={AlumniConnections} />
        <Route path="/alumni/coordination" component={AlumniCoordination} />
        <Route path="/alumni/messages" component={Messages} />
        <Route path="/alumni/notifications" component={NotificationsPage} />
        <Route path="/alumni/notifications/:id" component={NotificationDetail} />
        <Route path="/alumni/events/:id" component={AlumniEvents} />
        <Route path="/alumni/events" component={AlumniEvents} />
        <Route path="/alumni/profile" component={AlumniProfile} />
        <Route path="/alumni/student/:id" component={AlumniStudentProfile} />
        <Route path="/alumni/alumni/:id" component={AlumniProfileView} />

        {/* Faculty Routes */}
        <Route path="/faculty/home" component={FacultyHome} />
        <Route path="/faculty/coordination" component={FacultyCoordination} />
        <Route path="/faculty/profile" component={FacultyProfile} />
        <Route path="/faculty/notifications" component={NotificationsPage} />
        <Route path="/faculty/notifications/:id" component={NotificationDetail} />
        <Route path="/faculty/events/:id" component={FacultyEventDetails} />
        <Route path="/faculty/events" component={FacultyEvents} />
        <Route path="/faculty/create-event" component={CreateEvent} />
        <Route path="/faculty/communities" component={Communities} />
        <Route path="/faculty/communities/:id" component={CommunityDetails} />

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
