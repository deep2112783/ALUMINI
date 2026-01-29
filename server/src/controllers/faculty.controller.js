import { pool } from "../config/db.js";
import { createError } from "../utils/error.js";

export async function getFacultyProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      `SELECT 
        u.id,
        u.email,
        u.role,
        f.department,
        f.designation,
        f.office_location,
        f.phone_extension,
        f.bio,
        f.profile_image,
        f.cover_image
       FROM users u
       LEFT JOIN faculty f ON u.id = f.user_id
       WHERE u.id = $1`,
      [userId]
    );
    if (rows.length === 0) throw createError(404, "Profile not found");
    res.json(rows[0]);
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

export async function updateFacultyProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { department, designation, office_location, phone_extension, bio, profile_image, cover_image } = req.body;
    
    console.log("[Faculty updateProfile] UserId:", userId);
    console.log("[Faculty updateProfile] Received data:", {
      department, designation, office_location, phone_extension, bio,
      profile_image: profile_image ? "[BASE64 STRING]" : null,
      cover_image: cover_image ? "[BASE64 STRING]" : null
    });
    
    // Check if faculty record exists
    const { rows: existing } = await pool.query(
      "SELECT user_id FROM faculty WHERE user_id = $1",
      [userId]
    );
    
    if (existing.length === 0) {
      // Insert new faculty record
      await pool.query(
        `INSERT INTO faculty (user_id, department, designation, office_location, phone_extension, bio, profile_image, cover_image)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, department ?? null, designation ?? null, office_location ?? null, phone_extension ?? null, bio ?? null, profile_image ?? null, cover_image ?? null]
      );
    } else {
      // Build dynamic update query to only update provided fields
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (department !== undefined) {
        updates.push(`department = $${paramCount++}`);
        values.push(department);
      }
      if (designation !== undefined) {
        updates.push(`designation = $${paramCount++}`);
        values.push(designation);
      }
      if (office_location !== undefined) {
        updates.push(`office_location = $${paramCount++}`);
        values.push(office_location);
      }
      if (phone_extension !== undefined) {
        updates.push(`phone_extension = $${paramCount++}`);
        values.push(phone_extension);
      }
      if (bio !== undefined) {
        updates.push(`bio = $${paramCount++}`);
        values.push(bio);
      }
      if (profile_image !== undefined) {
        updates.push(`profile_image = $${paramCount++}`);
        values.push(profile_image);
      }
      if (cover_image !== undefined) {
        updates.push(`cover_image = $${paramCount++}`);
        values.push(cover_image);
      }

      if (updates.length > 0) {
        values.push(userId);
        const query = `UPDATE faculty SET ${updates.join(', ')} WHERE user_id = $${paramCount}`;
        console.log("[Faculty updateProfile] Executing query:", query);
        console.log("[Faculty updateProfile] Values being sent:");
        values.forEach((v, i) => {
          if (typeof v === 'string' && v.startsWith('data:image')) {
            console.log(`  [$${i+1}]: [BASE64 IMAGE - ${v.length} bytes]`);
          } else {
            console.log(`  [$${i+1}]: ${v}`);
          }
        });
        const result = await pool.query(query, values);
        console.log("[Faculty updateProfile] Update result:", result.rowCount, "rows affected");
      } else {
        console.log("[Faculty updateProfile] No updates to perform (all fields undefined)");
      }
    }

    // Fetch and return updated profile
    const { rows } = await pool.query(
      `SELECT u.id, u.email, f.department, f.designation, f.office_location, f.phone_extension, f.bio, f.profile_image, f.cover_image
       FROM users u
       LEFT JOIN faculty f ON u.id = f.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      console.error("[Faculty updateProfile] Profile not found after update for userId:", userId);
      return res.status(404).json({ message: "Profile not found" });
    }

    console.log("[Faculty updateProfile] Success, returning updated profile");
    res.json(rows[0]);
  } catch (err) {
    console.error("[Faculty updateProfile] Error:", err.message, err.stack);
    next(err);
  }
}

export async function listAlumni(req, res, next) {
  try {
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
       WHERE u.role = 'alumni'
       ORDER BY u.is_active DESC, u.email ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function listEvents(_req, res, next) {
  try {
    const { rows } = await pool.query("SELECT id, title, date, location, description, organizer_id FROM events ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function createEvent(req, res, next) {
  try {
    const organizerId = req.user.id;
    const { title, date, location, description } = req.body;
    if (!title || !date) throw createError(400, "title and date required");
    const { rows } = await pool.query(
      "INSERT INTO events (title, date, location, description, organizer_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [title, date, location ?? null, description ?? null, organizerId],
    );
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    next(err);
  }
}

export async function editEvent(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { title, date, location, description } = req.body;
    await pool.query(
      "UPDATE events SET title = COALESCE($1, title), date = COALESCE($2, date), location = COALESCE($3, location), description = COALESCE($4, description) WHERE id = $5",
      [title ?? null, date ?? null, location ?? null, description ?? null, id],
    );
    res.json({ status: "updated" });
  } catch (err) {
    next(err);
  }
}

export async function cancelEvent(req, res, next) {
  try {
    const id = Number(req.params.id);
    await pool.query("DELETE FROM events WHERE id = $1", [id]);
    res.json({ status: "cancelled" });
  } catch (err) {
    next(err);
  }
}

export async function inviteAlumni(req, res, next) {
  try {
    const eventId = Number(req.params.id);
    const { alumni_id } = req.body;
    if (!alumni_id) throw createError(400, "alumni_id required");
    
    // Get event name for notification
    const eventRes = await pool.query("SELECT title FROM events WHERE id = $1", [eventId]);
    const eventTitle = eventRes.rows[0]?.title || "Event";
    
    // Insert invitation
    await pool.query(
      "INSERT INTO invitations (event_id, user_id, created_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING",
      [eventId, alumni_id],
    );
    
    // Create notification for the alumni with event_id for navigation
    const notificationContent = JSON.stringify({
      message: `You have been invited to ${eventTitle}`,
      event_id: eventId
    });
    await pool.query(
      "INSERT INTO notifications (user_id, type, content, created_at) VALUES ($1, $2, $3, NOW())",
      [alumni_id, "event_invitation", notificationContent],
    );
    
    res.json({ status: "invited" });
  } catch (err) {
    next(err);
  }
}

export async function getEventDetails(req, res, next) {
  try {
    const eventId = Number(req.params.id);
    console.log('Fetching event details for ID:', eventId);
    
    // Get event details
    const { rows: eventRows } = await pool.query(
      `SELECT e.*, u.email as organizer_email
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       WHERE e.id = $1`,
      [eventId]
    );
    
    console.log('Event rows:', eventRows);
    
    if (eventRows.length === 0) {
      throw createError(404, "Event not found");
    }
    
    const event = eventRows[0];
    
    // Get registered students
    const { rows: registrations } = await pool.query(
      `SELECT 
        er.user_id,
        u.email,
        COALESCE(SUBSTRING(u.email FROM '^([^@]+)'), 'Student') as name,
        s.department AS branch,
        s.year,
        er.status,
        er.created_at as registered_at
       FROM event_registrations er
       JOIN users u ON er.user_id = u.id
       LEFT JOIN students s ON u.id = s.user_id
       WHERE er.event_id = $1
       ORDER BY er.created_at DESC`,
      [eventId]
    );
    
    console.log('Registrations:', registrations.length);
    
    // Get volunteer alumni
    const { rows: volunteers } = await pool.query(
      `SELECT 
        ev.user_id,
        u.email,
        COALESCE(SUBSTRING(u.email FROM '^([^@]+)'), 'Alumni') as name,
        a.company,
        a.role,
        a.expertise,
        ev.created_at as volunteered_at
       FROM event_volunteers ev
       JOIN users u ON ev.user_id = u.id
       LEFT JOIN alumni a ON u.id = a.user_id
       WHERE ev.event_id = $1
       ORDER BY ev.created_at DESC`,
      [eventId]
    );
    
    console.log('Volunteers:', volunteers.length);
    
    res.json({
      event,
      registrations,
      volunteers,
      stats: {
        total_registrations: registrations.length,
        total_volunteers: volunteers.length
      }
    });
  } catch (err) {
    console.error('Error in getEventDetails:', err);
    next(err);
  }
}

export async function getEventInvitations(req, res, next) {
  try {
    const eventId = Number(req.params.id);
    const { rows } = await pool.query(
      `SELECT 
        i.id as invitation_id,
        i.user_id,
        u.email,
        COALESCE(NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''), 'Alumni') as name,
        a.company,
        a.role,
        a.expertise,
        i.created_at as invited_at,
        CASE WHEN ev.user_id IS NOT NULL THEN true ELSE false END as volunteered
       FROM invitations i
       JOIN users u ON i.user_id = u.id
       LEFT JOIN alumni a ON u.id = a.user_id
       LEFT JOIN event_volunteers ev ON i.event_id = ev.event_id AND i.user_id = ev.user_id
       WHERE i.event_id = $1
       ORDER BY i.created_at DESC`,
      [eventId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getInvitationStats(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT 
        COUNT(DISTINCT i.id) as total_invitations,
        COUNT(DISTINCT CASE WHEN ev.user_id IS NOT NULL THEN i.id END) as volunteers,
        COUNT(DISTINCT i.event_id) as events_with_invitations
       FROM invitations i
       LEFT JOIN event_volunteers ev ON i.event_id = ev.event_id AND i.user_id = ev.user_id`
    );
    res.json(rows[0] || { total_invitations: 0, volunteers: 0, events_with_invitations: 0 });
  } catch (err) {
    next(err);
  }
}

export async function manageCommunity(req, res, next) {
  try {
    if (req.method === "POST") {
      const { name, domain, description } = req.body;
      if (!name) throw createError(400, "name required");
      const { rows } = await pool.query(
        "INSERT INTO communities (name, domain, description) VALUES ($1, $2, $3) RETURNING id",
        [name, domain ?? null, description ?? null],
      );
      return res.status(201).json({ id: rows[0].id });
    }
    if (req.method === "PUT") {
      const id = Number(req.params.id);
      const { name, domain, description } = req.body;
      await pool.query(
        "UPDATE communities SET name = COALESCE($1, name), domain = COALESCE($2, domain), description = COALESCE($3, description) WHERE id = $4",
        [name ?? null, domain ?? null, description ?? null, id],
      );
      return res.json({ status: "updated" });
    }
    if (req.method === "DELETE") {
      const id = Number(req.params.id);
      await pool.query("UPDATE communities SET archived = true WHERE id = $1", [id]);
      return res.json({ status: "archived" });
    }
    throw createError(405, "method not allowed");
  } catch (err) {
    next(err);
  }
}
