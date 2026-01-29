import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { 
  createEvent, 
  editEvent, 
  cancelEvent, 
  inviteAlumni, 
  getEventInvitations,
  getEventDetails, 
  getInvitationStats, 
  manageCommunity, 
  listEvents, 
  listAlumni, 
  getFacultyProfile, 
  updateFacultyProfile,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from "../controllers/faculty.controller.js";
import {
  listCommunities,
  joinCommunity,
  getCommunityDetails,
  postQuestion,
  replyQuestion,
  likeQuestion,
  unlikeQuestion,
} from "../controllers/student.controller.js";

const router = Router();

router.use(requireAuth, requireRole("faculty"));

router.get("/profile", getFacultyProfile);
router.put("/profile", updateFacultyProfile);
router.get("/alumni", listAlumni);
router.get("/events", listEvents);
router.post("/events", createEvent);
router.get("/events/:id/invitations", getEventInvitations);
router.get("/events/:id", getEventDetails);
router.put("/events/:id", editEvent);
router.delete("/events/:id", cancelEvent);
router.post("/events/:id/invite", inviteAlumni);
router.get("/invitations/stats", getInvitationStats);
// Notifications routes
router.get("/notifications", getNotifications);
router.put("/notifications/:id/read", markNotificationAsRead);
router.put("/notifications/mark-all-read", markAllNotificationsAsRead);
router.delete("/notifications/:id", deleteNotification);


// Communities management (create, edit, archive)
router.post("/communities", manageCommunity); // create
router.put("/communities/:id", manageCommunity); // edit
router.delete("/communities/:id", manageCommunity); // archive

// Communities access (view, join, participate)
router.get("/communities", listCommunities);
router.post("/communities/:id/join", joinCommunity);
router.get("/communities/:id", getCommunityDetails);
router.post("/communities/:id/questions", postQuestion);
router.post("/questions/:id/answers", replyQuestion);
router.post("/questions/:id/like", likeQuestion);
router.delete("/questions/:id/like", unlikeQuestion);

export default router;
