import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { 
  getProfile, 
  listAlumni,
  updateProfile, 
  postInsight,
  getMyInsights,
  deleteInsight,
  getInsightComments,
  replyToComment,
  replyForumQuestion, 
  listEvents, 
  volunteerEvent, 
  listStudents, 
  manageRequest,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  sendMessage,
  getMessages
} from "../controllers/alumni.controller.js";
import {
  getStudentProfile,
  getAlumniProfile,
  listCommunities,
  joinCommunity,
  leaveCommunity,
  getCommunityDetails,
  postQuestion,
  replyQuestion,
  likeQuestion,
  unlikeQuestion,
  listConnections,
  getPendingRequests,
  sendConnectionRequest,
  acceptConnection,
  rejectConnection,
  cancelConnectionRequest,
  removeConnection,
} from "../controllers/student.controller.js";

const router = Router();

router.use(requireAuth, requireRole("alumni"));

router.get("/profile", getProfile);
router.get("/alumni", listAlumni);
router.put("/profile", updateProfile);
router.post("/insights", postInsight);
router.get("/my-insights", getMyInsights);
router.delete("/insights/:id", deleteInsight);
router.get("/insights/:insightId/comments", getInsightComments);
router.post("/insights/:insightId/comments/:commentId/reply", replyToComment);
router.post("/questions/:id/answers", replyForumQuestion);
router.get("/events", listEvents);
router.post("/events/:id/volunteer", volunteerEvent);
router.get("/students", listStudents);
router.get("/students/:id", getStudentProfile);
router.get("/alumni/:id", getAlumniProfile);
router.post("/requests/:id/:action", manageRequest); // action: accept | reject
// Connections (reusing student controller handlers)
router.get("/connections", listConnections);
router.get("/connections/pending", getPendingRequests);
router.post("/connections/:id/request", sendConnectionRequest);
router.post("/connections/:id/accept", acceptConnection);
router.post("/connections/:id/reject", rejectConnection);
router.post("/connections/:id/cancel", cancelConnectionRequest);
router.delete("/connections/:id", removeConnection);
// Notifications routes
router.get("/notifications", getNotifications);
router.put("/notifications/:id/read", markNotificationAsRead);
router.put("/notifications/mark-all-read", markAllNotificationsAsRead);
router.delete("/notifications/:id", deleteNotification);

// Messages routes
router.get("/messages", getMessages);
router.post("/messages/send", sendMessage);


// Communities routes
router.get("/communities", listCommunities);
router.post("/communities/:id/join", joinCommunity);
router.delete("/communities/:id/leave", leaveCommunity);
router.get("/communities/:id", getCommunityDetails);
router.post("/communities/:id/questions", postQuestion);
router.post("/questions/:id/answers", replyQuestion);
router.post("/questions/:id/like", likeQuestion);
router.delete("/questions/:id/like", unlikeQuestion);

export default router;
