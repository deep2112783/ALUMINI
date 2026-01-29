import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";

const API = "/api";

// Session user storage (in-memory, persists per tab)
let currentUser = null;

export function setCurrentUser(user) {
  currentUser = user;
  if (user) {
    sessionStorage.setItem("role", user.role);
    sessionStorage.setItem("userId", user.userId);
    sessionStorage.setItem("email", user.email);
  } else {
    sessionStorage.clear();
  }
}

export function getCurrentUser() {
  if (!currentUser && sessionStorage.getItem("userId")) {
    currentUser = {
      role: sessionStorage.getItem("role"),
      userId: parseInt(sessionStorage.getItem("userId")),
      email: sessionStorage.getItem("email"),
    };
  }
  return currentUser;
}

function getUserIdFromSession() {
  const user = getCurrentUser();
  return user?.userId || null;
}

async function parseApiError(res, fallbackMessage) {
  try {
    const body = await res.json();
    const detail = body?.message || body?.error;
    if (detail) return `${fallbackMessage}: ${detail}`;
  } catch (_err) {
    // Ignore JSON parse errors and fall back to status-based message
  }
  return `${fallbackMessage} (status ${res.status})`;
}

// Auth hooks
export function useCheckEmail() {
  return useMutation({
    mutationFn: async ({ email }) => {
      const res = await fetch(`${API}/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to check email");
      }
      return res.json();
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      console.log("[LOGIN] Calling:", `${API}/auth/login`);
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      console.log("[LOGIN] Response status:", res.status, res.statusText);
      if (!res.ok) {
        const err = await res.json();
        console.log("[LOGIN] Error response:", err);
        throw new Error(err.message || "Login failed");
      }
      const data = await res.json();
      console.log("[LOGIN] Success data:", data);
      return data;
    },
  });
}

export function useCreatePassword() {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const res = await fetch(`${API}/auth/create-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create password");
      }
      return res.json();
    },
  });
}

export function useSearchAlumni(query) {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["search-alumni", query],
    queryFn: async () => {
      if (!query || query.trim().length < 2) return [];
      const res = await fetch(`${API}/student/search-alumni?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to search alumni");
      return res.json();
    },
    enabled: !!token && query.trim().length >= 2,
  });
}

export function useAlumniProfile(id) {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["alumni-profile", id],
    queryFn: async () => {
      const res = await fetch(`${API}/student/alumni/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(await parseApiError(res, "Failed to fetch alumni profile"));
      return res.json();
    },
    enabled: !!token && !!id,
  });
}

export function useSendConnectionRequest() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async (alumniId) => {
      console.log(`[useSendConnectionRequest] Sending request for alumniId: ${alumniId}`);
      const res = await fetch(`${API}/student/connections/${alumniId}/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`[useSendConnectionRequest] Response status: ${res.status}`);
      if (!res.ok) {
        const errBody = await res.json();
        console.error(`[useSendConnectionRequest] Error response:`, errBody);
        throw new Error(errBody?.message || "Failed to send connection request");
      }
      const data = await res.json();
      console.log(`[useSendConnectionRequest] Success:`, data);
      return data;
    },
    onSuccess: (_, alumniId) => {
      queryClient.invalidateQueries({ queryKey: ["alumni-profile", alumniId] });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}

// Student hooks
export function useStudentHome() {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["student-home"],
    queryFn: async () => {
      console.log("[useStudentHome] Fetching with token:", token ? "✓ Present" : "✗ Missing");
      const res = await fetch(`${API}/student/home`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("[useStudentHome] Response status:", res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[useStudentHome] Error response:", errorText);
        throw new Error("Failed to fetch home data");
      }
      const data = await res.json();
      console.log("[useStudentHome] Success:", data);
      return data;
    },
    enabled: !!token,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
}

export function useStudentProfile() {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["student-profile"],
    queryFn: async () => {
      const res = await fetch(`${API}/student/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!token,
  });
}

export function useUpdateProfile() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${API}/student/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
  });
}

function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id || null;
  } catch {
    return null;
  }
}

export function useCommunities() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "student";
  const userId = getUserIdFromToken(); // Extract from JWT
  
  return useQuery({
    queryKey: ["communities", role, userId], // User-specific cache key
    queryFn: async () => {
      const res = await fetch(`${API}/${role}/communities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorMsg = await parseApiError(res, "Failed to fetch communities");
        throw new Error(errorMsg);
      }
      return res.json();
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });
}

export function useJoinCommunity() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "student";
  const userId = getUserIdFromToken(); // Extract from JWT
  
  return useMutation({
    mutationFn: async (communityId) => {
      const res = await fetch(`${API}/${role}/communities/${communityId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorMsg = await parseApiError(res, "Failed to join community");
        throw new Error(errorMsg);
      }
      return res.json();
    },
    onSuccess: (data, communityId) => {
      // Invalidate only this user's community queries
      queryClient.invalidateQueries({ queryKey: ["communities", role, userId] });
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
    },
  });
}

export function useLeaveCommunity() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "student";
  const userId = getUserIdFromToken(); // Extract from JWT
  
  return useMutation({
    mutationFn: async (communityId) => {
      const res = await fetch(`${API}/${role}/communities/${communityId}/leave`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorMsg = await parseApiError(res, "Failed to leave community");
        throw new Error(errorMsg);
      }
      return res.json();
    },
    onSuccess: (data, communityId) => {
      // Invalidate only this user's community queries
      queryClient.invalidateQueries({ queryKey: ["communities", role, userId] });
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
    },
  });
}

export function useCommunityDetails(id) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "student";
  return useQuery({
    queryKey: ["community", id],
    queryFn: async () => {
      const res = await fetch(`${API}/${role}/communities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorMsg = await parseApiError(res, "Failed to fetch community details");
        throw new Error(errorMsg);
      }
      return res.json();
    },
    enabled: !!token && !!id,
    refetchInterval: 30000, // Reduced to 30 seconds instead of 5
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function usePostQuestion(communityId) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "student";
  return useMutation({
    mutationFn: async ({ title, content }) => {
      const res = await fetch(`${API}/${role}/communities/${communityId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) {
        const errorMsg = await parseApiError(res, "Failed to post question");
        throw new Error(errorMsg);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
    },
  });
}

export function useReplyQuestion(communityId) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "student";
  return useMutation({
    mutationFn: async ({ questionId, content }) => {
      const res = await fetch(`${API}/${role}/questions/${questionId}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const errorMsg = await parseApiError(res, "Failed to post reply");
        throw new Error(errorMsg);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
    },
  });
}

export function useLikeQuestion(communityId) {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async ({ questionId, liked }) => {
      const res = await fetch(`${API}/student/questions/${questionId}/like`, {
        method: liked ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorMsg = await parseApiError(res, "Failed to update like");
        throw new Error(errorMsg);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
    },
  });
}

export function useInsights() {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      const res = await fetch(`${API}/student/insights`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorMsg = await parseApiError(res, "Failed to fetch insights");
        throw new Error(errorMsg);
      }
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 20000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useInsightComments(insightId) {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["insight-comments", insightId],
    queryFn: async () => {
      const res = await fetch(`${API}/student/insights/${insightId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorMsg = await parseApiError(res, "Failed to fetch comments");
        throw new Error(errorMsg);
      }
      return res.json();
    },
    enabled: !!token && !!insightId,
  });
}

export function useAddInsightComment() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async ({ insightId, content }) => {
      const res = await fetch(`${API}/student/insights/${insightId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      return res.json();
    },
    onSuccess: (_, { insightId }) => {
      queryClient.invalidateQueries({ queryKey: ["insights"] });
      queryClient.invalidateQueries({ queryKey: ["insight-comments", insightId] });
    },
  });
}

export function useReactToInsight() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async ({ insightId, reactionType }) => {
      const res = await fetch(`${API}/student/insights/${insightId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reaction_type: reactionType }),
      });
      if (!res.ok) throw new Error("Failed to react to insight");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });
}

export function useUnreactToInsight() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async (insightId) => {
      const res = await fetch(`${API}/student/insights/${insightId}/reactions`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to unreact to insight");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });
}

export function useNotifications() {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch(`${API}/student/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationAsRead() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async (notificationId) => {
      const res = await fetch(`${API}/student/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to mark notification as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API}/student/notifications/mark-all-read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to mark all notifications as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async (notificationId) => {
      const res = await fetch(`${API}/student/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Delete notification error:", res.status, errorData);
        throw new Error(errorData.message || "Failed to delete notification");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useConnections() {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const res = await fetch(`${API}/student/connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorMsg = await parseApiError(res, "Failed to fetch connections");
        throw new Error(errorMsg);
      }
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function usePendingRequests() {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["pendingRequests"],
    queryFn: async () => {
      const res = await fetch(`${API}/student/connections/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorMsg = await parseApiError(res, "Failed to fetch pending requests");
        throw new Error(errorMsg);
      }
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useAcceptConnection() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`${API}/student/connections/${userId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorMsg = await parseApiError(res, "Failed to accept connection");
        throw new Error(errorMsg);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
  });
}

export function useRejectConnection() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`${API}/student/connections/${userId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorMsg = await parseApiError(res, "Failed to reject connection");
        throw new Error(errorMsg);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
  });
}

export function useMessages(peerId, options = {}) {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["messages", peerId],
    queryFn: async () => {
      const res = await fetch(`${API}/student/messages?peer_id=${peerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorMsg = await parseApiError(res, "Failed to fetch messages");
        throw new Error(errorMsg);
      }
      return res.json();
    },
    enabled: !!token && !!peerId && (options.enabled !== false),
    refetchInterval: 3000, // Auto-refresh every 3 seconds
    staleTime: 0, // Always fetch fresh data
  });
}

export function useSendMessage() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async ({ receiver_id, content }) => {
      const res = await fetch(`${API}/student/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiver_id, content }),
      });
      if (!res.ok) {
        const errorMsg = await parseApiError(res, "Failed to send message");
        throw new Error(errorMsg);
      }
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.receiver_id] });
    },
  });
}

export function useEvents() {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch(`${API}/student/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
}

export function useRegisterEvent() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async (eventId) => {
      const res = await fetch(`${API}/student/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to register for event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

// Alumni hooks
export function usePostInsight() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${API}/alumni/insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to post insight");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });
}

export function useCurrentAlumniProfile() {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["alumni-profile"],
    queryFn: async () => {
      const res = await fetch(`${API}/alumni/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await parseApiError(res, "Failed to fetch alumni profile"));
      return res.json();
    },
    enabled: !!token,
  });
}

export function useUpdateAlumniProfile() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${API}/alumni/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-profile"] });
    },
  });
}

// Alumni Students and Connections Hooks
export function useAlumniStudents() {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["alumni-students"],
    queryFn: async () => {
      const res = await fetch(`${API}/alumni/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
}

export function useRecentQuestions() {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["recent-questions"],
    queryFn: async () => {
      const res = await fetch(`${API}/alumni/communities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch communities");
      const communities = await res.json();
      
      // Fetch questions from all communities
      const questionsPromises = communities.map(async (community) => {
        const qRes = await fetch(`${API}/alumni/communities/${community.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!qRes.ok) return [];
        const details = await qRes.json();
        return (details.questions || []).map(q => ({
          ...q,
          communityId: community.id,
          communityName: community.name
        }));
      });
      
      const allQuestions = await Promise.all(questionsPromises);
      return allQuestions.flat().sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, 5);
    },
    enabled: !!token,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
}

export function useManageConnectionRequest() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async ({ requestId, action }) => {
      const res = await fetch(`${API}/alumni/requests/${requestId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to ${action} connection request`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-students"] });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}

export function useReplyForumQuestion() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async ({ questionId, content }) => {
      const res = await fetch(`${API}/alumni/questions/${questionId}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to post reply");
      return res.json();
    },
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ["community-details"] });
      queryClient.invalidateQueries({ queryKey: ["question", questionId] });
    },
  });
}

// Alumni Events Hooks
export function useAlumniEvents() {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["alumni-events"],
    queryFn: async () => {
      const res = await fetch(`${API}/alumni/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
    enabled: !!token,
  });
}

export function useVolunteerEvent() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async (eventId) => {
      const res = await fetch(`${API}/alumni/events/${eventId}/volunteer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to volunteer for event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-events"] });
    },
  });
}

// Faculty Hooks
export function useFacultyProfile() {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["faculty-profile"],
    queryFn: async () => {
      const res = await fetch(`${API}/faculty/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await parseApiError(res, "Failed to fetch faculty profile"));
      return res.json();
    },
    enabled: !!token,
  });
}

export function useUpdateFacultyProfile() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${API}/faculty/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty-profile"] });
    },
  });
}

export function useFacultyAlumni() {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["faculty-alumni"],
    queryFn: async () => {
      const res = await fetch(`${API}/faculty/alumni`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch alumni");
      return res.json();
    },
    enabled: !!token,
  });
}

export function useInviteAlumniToEvent() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async ({ eventId, alumniId }) => {
      const res = await fetch(`${API}/faculty/events/${eventId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ alumni_id: alumniId }),
      });
      if (!res.ok) throw new Error("Failed to invite alumni");
      return res.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["event-invitations", Number(variables.eventId)] });
      queryClient.invalidateQueries({ queryKey: ["faculty-invitation-stats"] });
    },
  });
}

export function useFacultyEvents() {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["faculty-events"],
    queryFn: async () => {
      const res = await fetch(`${API}/faculty/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
    enabled: !!token,
  });
}

export function useCreateEvent() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${API}/faculty/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEvent() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await fetch(`${API}/faculty/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEvent() {
  const token = localStorage.getItem("token");
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API}/faculty/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useAlumniList() {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["alumni-list"],
    queryFn: async () => {
      const res = await fetch(`${API}/alumni/alumni`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch alumni");
      return res.json();
    },
    enabled: !!token,
  });
}

export function useFacultyInvitationStats() {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["faculty-invitation-stats"],
    queryFn: async () => {
      const res = await fetch(`${API}/faculty/invitations/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch invitation stats");
      return res.json();
    },
    enabled: !!token,
  });
}

export function useEventInvitations(eventId) {
  const token = localStorage.getItem("token");
  return useQuery({
    queryKey: ["event-invitations", eventId],
    queryFn: async () => {
      const res = await fetch(`${API}/faculty/events/${eventId}/invitations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch invitations");
      return res.json();
    },
    enabled: !!token && !!eventId,
  });
}