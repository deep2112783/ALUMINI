import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  getHome,
  searchPeople,
  searchAlumni,
  getAlumniProfile,
  getStudentProfile,
  listCommunities,
  joinCommunity,
  leaveCommunity,
  getCommunityDetails,
  postQuestion,
  replyQuestion,
  likeQuestion,
  unlikeQuestion,
  listInsights,
  commentInsight,
  reactInsight,
  unreactInsight,
  getInsightComments,
  deleteInsightComment,
  listConnections,
  getPendingRequests,
  sendConnectionRequest,
  acceptConnection,
  rejectConnection,
  cancelConnectionRequest,
  removeConnection,
  getMessages,
  sendMessage,
  listEvents,
  registerEvent,
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/student.controller.js";

const router = Router();

// Auth is required for all student routes, but profile view is shared
router.use(requireAuth);

// Allow both students and alumni to view student profiles
router.get("/view/:id", getStudentProfile);

// The rest of the routes are student-only
router.use(requireRole("student"));

router.get("/home", getHome);
router.get("/search", searchPeople);
router.get("/search-alumni", searchAlumni);
router.get("/alumni/:id", getAlumniProfile);
router.get("/communities", listCommunities);
router.post("/communities/:id/join", joinCommunity);
router.delete("/communities/:id/leave", leaveCommunity);
router.get("/communities/:id", getCommunityDetails);
router.post("/communities/:id/questions", postQuestion);
router.post("/questions/:id/answers", replyQuestion);
router.post("/questions/:id/like", likeQuestion);
router.delete("/questions/:id/like", unlikeQuestion);
router.get("/insights", listInsights);
router.get("/insights/:id/comments", getInsightComments);
router.post("/insights/:id/comments", commentInsight);
router.delete("/insights/:id/comments/:commentId", deleteInsightComment);
router.post("/insights/:id/reactions", reactInsight);
router.delete("/insights/:id/reactions", unreactInsight);
router.get("/connections", listConnections);
router.get("/connections/pending", getPendingRequests);
router.post("/connections/:id/request", sendConnectionRequest);
router.post("/connections/:id/accept", acceptConnection);
router.post("/connections/:id/reject", rejectConnection);
router.post("/connections/:id/cancel", cancelConnectionRequest);
router.delete("/connections/:id", removeConnection);
router.get("/messages", getMessages);
router.post("/messages/send", sendMessage);
router.get("/events", listEvents);
router.post("/events/:id/register", registerEvent);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/notifications", getNotifications);
router.put("/notifications/mark-all-read", markAllNotificationsAsRead);
router.put("/notifications/:id/read", markNotificationAsRead);
router.delete("/notifications/:id", deleteNotification);

export default router;
