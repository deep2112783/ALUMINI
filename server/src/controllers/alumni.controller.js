import { pool } from "../config/db.js";
import { createError } from "../utils/error.js";

export async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      `SELECT u.id, u.email, a.name, a.company, a.role, a.expertise, a.location, 
              a.graduation_year, a.bio, a.linkedin, a.github, a.portfolio, 
              a.profile_image, a.cover_image
       FROM users u 
       JOIN alumni a ON a.user_id = u.id 
       WHERE u.id = $1`,
      [userId],
    );
    if (rows.length === 0) throw createError(404, "Profile not found");
    const profile = rows[0];
    // Parse expertise if it's a string
    if (profile.expertise && typeof profile.expertise === 'string') {
      profile.expertise = profile.expertise.split(',').map(e => e.trim()).filter(Boolean);
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
}
export async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      `SELECT id, type, content, read_status, created_at 
       FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );

    // Normalize response for consistency
    const normalized = rows.map((n) => ({
      id: n.id,
      type: n.type,
      content: n.content,
      message: n.content,
      title: n.content || n.type || "Notification",
      read_status: n.read_status,
      read: n.read_status,
      created_at: n.created_at,
    }));

    res.json(normalized);
  } catch (err) {
    next(err);
  }
}

export async function markNotificationAsRead(req, res, next) {
  try {
    const userId = req.user.id;
    const notificationId = Number(req.params.id);
    await pool.query(
      "UPDATE notifications SET read_status = true WHERE id = $1 AND user_id = $2",
      [notificationId, userId]
    );
    res.json({ status: "marked" });
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsAsRead(req, res, next) {
  try {
    const userId = req.user.id;
    await pool.query(
      "UPDATE notifications SET read_status = true WHERE user_id = $1 AND read_status = false",
      [userId]
    );
    res.json({ status: "all marked" });
  } catch (err) {
    next(err);
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const userId = req.user.id;
    const notificationId = Number(req.params.id);
    await pool.query(
      "DELETE FROM notifications WHERE id = $1 AND user_id = $2",
      [notificationId, userId]
    );
    res.json({ status: "deleted" });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const senderId = req.user.id;
    const { receiver_id, content } = req.body;
    if (!receiver_id || !content) throw createError(400, "receiver_id and content required");
    
    await pool.query(
      "INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES ($1, $2, $3, NOW())",
      [senderId, receiver_id, content]
    );
    
    // Get sender's email for notification
    const senderResult = await pool.query(
      "SELECT email FROM users WHERE id = $1",
      [senderId]
    );
    const senderEmail = senderResult.rows[0]?.email || "Someone";
    const senderName = senderEmail.split("@")[0];
    
    // Create notification for receiver
    await pool.query(
      `INSERT INTO notifications (user_id, type, content, read_status, created_at)
       VALUES ($1, $2, $3, false, NOW())`,
      [receiver_id, "message", `New message from ${senderName}: "${content.substring(0, 50)}${content.length > 50 ? "..." : ""}"`]
    );
    
    res.status(201).json({ status: "sent" });
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req, res, next) {
  try {
    const userId = req.user.id;
    const peerId = Number(req.query.peer_id);
    if (!peerId) throw createError(400, "peer_id required");
    const { rows } = await pool.query(
      "SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY created_at ASC",
      [userId, peerId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function listAlumni(req, res, next) {
  try {
    const currentUserId = req.user.id;
    const { rows } = await pool.query(
      `SELECT 
        u.id, 
        u.email,
        COALESCE(NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''), 'Alumni') as name,
        a.company,
        a.role,
        a.expertise,
        a.graduation_year,
        u.is_active
       FROM users u
       LEFT JOIN alumni a ON u.id = a.user_id
       WHERE u.role = 'alumni' AND u.id != $1
       ORDER BY u.is_active DESC, u.email ASC`,
      [currentUserId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { 
      name, company, role, expertise, location, graduation_year, bio, 
      linkedin, github, portfolio, profile_image, cover_image 
    } = req.body;
    
    console.log("[Alumni updateProfile] UserId:", userId);
    console.log("[Alumni updateProfile] Received data:", {
      name, company, role, expertise, location, graduation_year, bio, 
      linkedin, github, portfolio, 
      profile_image: profile_image ? "[BASE64 STRING]" : null,
      cover_image: cover_image ? "[BASE64 STRING]" : null
    });
    
    // Build dynamic query based on provided fields
    const updates = [];
    const values = [];
    let paramCounter = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramCounter++}`);
      values.push(name);
    }
    if (company !== undefined) {
      updates.push(`company = $${paramCounter++}`);
      values.push(company);
    }
    if (role !== undefined) {
      updates.push(`role = $${paramCounter++}`);
      values.push(role);
    }
    if (expertise !== undefined) {
      updates.push(`expertise = $${paramCounter++}`);
      values.push(Array.isArray(expertise) ? expertise.join(',') : expertise);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramCounter++}`);
      values.push(location);
    }
    if (graduation_year !== undefined) {
      updates.push(`graduation_year = $${paramCounter++}`);
      values.push(graduation_year);
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramCounter++}`);
      values.push(bio);
    }
    if (linkedin !== undefined) {
      updates.push(`linkedin = $${paramCounter++}`);
      values.push(linkedin);
    }
    if (github !== undefined) {
      updates.push(`github = $${paramCounter++}`);
      values.push(github);
    }
    if (portfolio !== undefined) {
      updates.push(`portfolio = $${paramCounter++}`);
      values.push(portfolio);
    }
    if (profile_image !== undefined) {
      updates.push(`profile_image = $${paramCounter++}`);
      values.push(profile_image);
    }
    if (cover_image !== undefined) {
      updates.push(`cover_image = $${paramCounter++}`);
      values.push(cover_image);
    }
    
    if (updates.length === 0) {
      console.log("[Alumni updateProfile] No updates provided");
      return res.json({ status: "no changes" });
    }
    
    values.push(userId);
    const query = `UPDATE alumni SET ${updates.join(', ')} WHERE user_id = $${paramCounter}`;
    
    console.log("[Alumni updateProfile] Executing query with", values.length - 1, "updates");
    const result = await pool.query(query, values);
    console.log("[Alumni updateProfile] Update result:", result.rowCount, "rows affected");
    
    // Fetch and return updated profile
    const { rows } = await pool.query(
      `SELECT user_id, name, company, role, expertise, location, graduation_year, bio, 
              linkedin, github, portfolio, profile_image, cover_image
       FROM alumni WHERE user_id = $1`,
      [userId]
    );
    
    if (rows.length === 0) {
      console.error("[Alumni updateProfile] Profile not found after update for userId:", userId);
      return res.status(404).json({ message: "Profile not found" });
    }
    
    const profile = rows[0];
    // Parse expertise if it's a string
    if (profile.expertise && typeof profile.expertise === 'string') {
      profile.expertise = profile.expertise.split(',').map(e => e.trim()).filter(Boolean);
    }
    
    console.log("[Alumni updateProfile] Success, returning updated profile");
    res.json(profile);
  } catch (err) {
    console.error("[Alumni updateProfile] Error:", err.message, err.stack);
    next(err);
  }
}

export async function postInsight(req, res, next) {
  try {
    const authorId = req.user.id;
    let { title, content, category } = req.body;
    if (!content) throw createError(400, "content required");
    
    // Auto-generate title from content if not provided
    if (!title || title.trim() === '') {
      title = content.substring(0, 100).trim();
      if (content.length > 100) title += '...';
    }
    
    const { rows } = await pool.query(
      "INSERT INTO alumni_insights (author_id, title, content, category, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id",
      [authorId, title, content, category ?? null],
    );
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    next(err);
  }
}

export async function getMyInsights(req, res, next) {
  try {
    const authorId = req.user.id;
    const { rows } = await pool.query(
      `SELECT i.id, i.title, i.content, i.category, i.created_at,
              COUNT(DISTINCT ir.user_id)::int as like_count,
              COUNT(DISTINCT ic.id)::int as comment_count
       FROM alumni_insights i 
       LEFT JOIN insight_reactions ir ON i.id = ir.insight_id
       LEFT JOIN insight_comments ic ON i.id = ic.insight_id
       WHERE i.author_id = $1
       GROUP BY i.id, i.title, i.content, i.category, i.created_at
       ORDER BY i.created_at DESC`,
      [authorId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function deleteInsight(req, res, next) {
  try {
    const authorId = req.user.id;
    const insightId = Number(req.params.id);
    
    // Verify ownership
    const { rows } = await pool.query(
      "SELECT author_id FROM alumni_insights WHERE id = $1",
      [insightId]
    );
    
    if (rows.length === 0) throw createError(404, "Insight not found");
    if (rows[0].author_id !== authorId) throw createError(403, "Not authorized to delete this insight");
    
    // Delete related comments and reactions first
    await pool.query("DELETE FROM insight_comments WHERE insight_id = $1", [insightId]);
    await pool.query("DELETE FROM insight_reactions WHERE insight_id = $1", [insightId]);
    await pool.query("DELETE FROM alumni_insights WHERE id = $1", [insightId]);
    
    res.json({ status: "deleted" });
  } catch (err) {
    next(err);
  }
}

export async function getInsightComments(req, res, next) {
  try {
    const insightId = Number(req.params.insightId);
    
    // Just verify the insight exists
    const insight = await pool.query(
      "SELECT id FROM alumni_insights WHERE id = $1",
      [insightId]
    );
    
    if (insight.rows.length === 0) throw createError(404, "Insight not found");
    
    // Get all comments for this insight
    const { rows } = await pool.query(
      `SELECT ic.id, ic.content, ic.created_at, ic.parent_id,
              u.email,
              COALESCE(s.name, a.company || ' Alumni') as author_name
       FROM insight_comments ic
       JOIN users u ON ic.user_id = u.id
       LEFT JOIN students s ON s.user_id = u.id
       LEFT JOIN alumni a ON a.user_id = u.id
       WHERE ic.insight_id = $1
       ORDER BY ic.created_at ASC`,
      [insightId]
    );
    
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function replyToComment(req, res, next) {
  try {
    const authorId = req.user.id;
    const insightId = Number(req.params.insightId);
    const commentId = Number(req.params.commentId);
    const { content } = req.body;
    
    if (!content) throw createError(400, "content required");
    
    // Verify the insight belongs to this alumni
    const insight = await pool.query(
      "SELECT author_id FROM alumni_insights WHERE id = $1",
      [insightId]
    );
    
    if (insight.rows.length === 0) throw createError(404, "Insight not found");
    if (insight.rows[0].author_id !== authorId) throw createError(403, "Not authorized");
    
    // Verify the parent comment exists
    const parentComment = await pool.query(
      "SELECT id FROM insight_comments WHERE id = $1 AND insight_id = $2",
      [commentId, insightId]
    );
    
    if (parentComment.rows.length === 0) throw createError(404, "Comment not found");
    
    // Insert the reply
    const { rows } = await pool.query(
      "INSERT INTO insight_comments (insight_id, user_id, content, parent_id, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id",
      [insightId, authorId, content, commentId]
    );
    
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    next(err);
  }
}

export async function replyForumQuestion(req, res, next) {
  try {
    const authorId = req.user.id;
    const questionId = Number(req.params.id);
    const { content } = req.body;
    if (!content) throw createError(400, "content required");
    const { rows } = await pool.query(
      "INSERT INTO forum_answers (question_id, user_id, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id",
      [questionId, authorId, content],
    );
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    next(err);
  }
}

export async function listEvents(req, res, next) {
  try {
    const userId = req.user.id;
    console.log("[listEvents] userId:", userId);
    const { rows } = await pool.query(
      `SELECT e.id, e.title, e.date, e.location, e.description,
              CASE WHEN ev.user_id IS NOT NULL THEN true ELSE false END as is_volunteered
       FROM events e
       LEFT JOIN event_volunteers ev ON e.id = ev.event_id AND ev.user_id = $1
       ORDER BY e.date ASC`,
      [userId]
    );
    console.log("[listEvents] Events returned:", rows.length, "events");
    rows.forEach(row => {
      console.log(`  Event ${row.id}: is_volunteered=${row.is_volunteered}`);
    });
    res.json(rows);
  } catch (err) {
    console.error("[listEvents] Error:", err);
    next(err);
  }
}

export async function volunteerEvent(req, res, next) {
  try {
    const userId = req.user.id;
    const eventId = Number(req.params.id);
    console.log(`[volunteerEvent] userId=${userId}, eventId=${eventId}`);
    
    // Check if already volunteered
    const checkResult = await pool.query(
      "SELECT * FROM event_volunteers WHERE user_id = $1 AND event_id = $2",
      [userId, eventId]
    );
    
    const isAlreadyVolunteered = checkResult.rows.length > 0;
    
    if (isAlreadyVolunteered) {
      // Unvolunteer - delete the record
      await pool.query(
        "DELETE FROM event_volunteers WHERE user_id = $1 AND event_id = $2",
        [userId, eventId]
      );
      console.log(`[volunteerEvent] User ${userId} unvolunteered from event ${eventId}`);
      res.json({ status: "unvolunteered" });
    } else {
      // Volunteer - insert the record
      await pool.query(
        "INSERT INTO event_volunteers (user_id, event_id, created_at) VALUES ($1, $2, NOW())",
        [userId, eventId]
      );
      
      // Get volunteer name and event details
      const volunteerResult = await pool.query(
        "SELECT email FROM users WHERE id = $1",
        [userId]
      );
      const volunteerEmail = volunteerResult.rows[0]?.email || "Someone";
      const volunteerName = volunteerEmail.split("@")[0];
      
      const eventResult = await pool.query(
        "SELECT title, organizer_id FROM events WHERE id = $1",
        [eventId]
      );
      const eventTitle = eventResult.rows[0]?.title || "Event";
      const organizerId = eventResult.rows[0]?.organizer_id;
      
      console.log(`[volunteerEvent] eventTitle=${eventTitle}, organizerId=${organizerId}`);
      
      // Create notification for faculty organizer
      if (organizerId) {
        const notificationContent = JSON.stringify({
          message: `${volunteerName} has volunteered for ${eventTitle}`,
          event_id: eventId,
          volunteer_id: userId,
          volunteer_name: volunteerName
        });
        await pool.query(
          "INSERT INTO notifications (user_id, type, content, created_at) VALUES ($1, $2, $3, NOW())",
          [organizerId, "volunteer_event", notificationContent]
        );
        console.log(`[volunteerEvent] Notification created for organizer ${organizerId}`);
      } else {
        console.warn(`[volunteerEvent] No organizer_id for event ${eventId}`);
      }
      
      console.log(`[volunteerEvent] User ${userId} volunteered for event ${eventId}`);
      res.json({ status: "volunteered" });
    }
  } catch (err) {
    console.error(`[volunteerEvent] Error:`, err.message);
    next(err);
  }
}

export async function listStudents(_req, res, next) {
  try {
    const { rows } = await pool.query(
      "SELECT s.user_id AS id, u.email, s.department, s.skills FROM students s JOIN users u ON u.id = s.user_id ORDER BY u.email ASC",
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function manageRequest(req, res, next) {
  try {
    const alumniId = req.user.id;
    const studentId = Number(req.params.id);
    const action = req.params.action;
    if (!["accept", "reject"].includes(action)) throw createError(400, "invalid action");
    await pool.query("UPDATE connection_requests SET status = $1 WHERE from_id = $2 AND to_id = $3", [action === "accept" ? "accepted" : "rejected", studentId, alumniId]);
    if (action === "accept") {
      await pool.query(
        "INSERT INTO connections (user1_id, user2_id, status, created_at) VALUES ($1, $2, 'connected', NOW()) ON CONFLICT DO NOTHING",
        [studentId, alumniId],
      );
    }
    res.json({ status: action });
  } catch (err) {
    next(err);
  }
}
