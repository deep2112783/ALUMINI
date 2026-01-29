import { pool } from "../config/db.js";
import { createError } from "../utils/error.js";

export async function getHome(req, res, next) {
  try {
    const userId = req.user.id;
    console.log("[GET /student/home] User ID:", userId);
    
    const [notifications, events, suggested] = await Promise.all([
      pool.query(
        `SELECT id, type, content, read_status, created_at 
         FROM notifications 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 10`, 
        [userId]
      ),
      pool.query(
        `SELECT 
          e.id, 
          e.title, 
          e.date, 
          e.location, 
          e.description, 
          e.organizer_id,
          u.email as organizer_email,
          COALESCE(NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''), 'Organizer') as organizer_name
         FROM events e
         LEFT JOIN users u ON e.organizer_id = u.id
         WHERE e.date >= NOW() 
         ORDER BY e.id DESC 
         LIMIT 3`
      ),
      pool.query(
        `SELECT u.id, 
                COALESCE(NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''), 'Alumni') as name
         FROM users u 
         WHERE u.is_active = true AND u.role = 'alumni'
         ORDER BY RANDOM() 
         LIMIT 6`
      ),
    ]);

    // Get current student's skills to drive student suggestions
    const studentProfile = await pool.query(
      `SELECT skills FROM students WHERE user_id = $1`,
      [userId]
    );

    const currentSkills = studentProfile.rows[0]?.skills
      ? studentProfile.rows[0].skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // Suggest students based on overlapping skills; fallback to random students
    // Exclude already connected students
    let suggestedStudents = [];
    try {
      if (currentSkills.length > 0) {
        const skillConditions = currentSkills.map((_, idx) => `s.skills ILIKE $${idx + 2}`);
        const params = [userId, ...currentSkills.map((skill) => `%${skill}%`)];
        const query = `SELECT 
            u.id,
            COALESCE(NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''), 'Student') as name,
            s.department,
            s.year,
            s.skills
          FROM students s
          JOIN users u ON s.user_id = u.id
          WHERE u.is_active = true 
            AND u.role = 'student'
            AND u.id != $1
            AND u.id NOT IN (
              SELECT connected_user_id FROM connections
              WHERE user_id = $1 AND status = 'accepted'
              UNION
              SELECT user_id FROM connections
              WHERE connected_user_id = $1 AND status = 'accepted'
            )
            AND (${skillConditions.join(' OR ')})
          ORDER BY RANDOM()
          LIMIT 6`;
        const result = await pool.query(query, params);
        suggestedStudents = result.rows;
      } else {
        const fallback = await pool.query(
          `SELECT 
            u.id,
            COALESCE(NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''), 'Student') as name,
            s.department,
            s.year,
            s.skills
           FROM students s 
           JOIN users u ON s.user_id = u.id
           WHERE u.is_active = true 
             AND u.role = 'student' 
             AND u.id != $1
             AND u.id NOT IN (
               SELECT connected_user_id FROM connections
               WHERE user_id = $1 AND status = 'accepted'
               UNION
               SELECT user_id FROM connections
               WHERE connected_user_id = $1 AND status = 'accepted'
             )
           ORDER BY RANDOM() 
           LIMIT 6`,
          [userId]
        );
        suggestedStudents = fallback.rows;
      }
    } catch (err) {
      console.log("[GET /student/home] Suggested students query failed:", err.message);
      suggestedStudents = [];
    }
    
    // Enhance suggested alumni with details from alumni table
    const suggestedAlumniWithDetails = await Promise.all(
      suggested.rows.map(async (alum) => {
        try {
          const detailsResult = await pool.query(
            `SELECT company, role, expertise, graduation_year FROM alumni WHERE user_id = $1`,
            [alum.id]
          );
          if (detailsResult.rows.length > 0) {
            const details = detailsResult.rows[0];
            return { 
              ...alum, 
              company: details.company || '',
              role: details.role || '',
              expertise: details.expertise || '',
              graduationYear: details.graduation_year || null,
              batch: details.graduation_year ? `R${String(details.graduation_year).slice(-2)}` : ''
            };
          }
        } catch (err) {
          console.log(`[GET /student/home] Failed to get details for alumni ${alum.id}`);
        }
        return { ...alum, company: '', role: '', expertise: '', graduationYear: null, batch: '' };
      })
    );
    
    console.log("[GET /student/home] Suggested Alumni rows:", suggestedAlumniWithDetails.length);
    console.log("[GET /student/home] Sample alumni data:", JSON.stringify(suggestedAlumniWithDetails[0], null, 2));
    
    res.json({ 
      notifications: notifications.rows.map(n => ({
        id: n.id,
        title: n.content || n.type,
        message: n.content,
        type: n.type,
        read: n.read_status,
        created_at: n.created_at
      })),
      events: events.rows, 
      suggestedAlumni: suggestedAlumniWithDetails,
      suggestedStudents: suggestedStudents.map((s) => ({
        ...s,
        department: s.department || '',
        year: s.year || '',
        skills: s.skills
          ? s.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
          : [],
      })),
    });
  } catch (err) {
    console.error("[GET /student/home] Error:", err.message);
    next(err);
  }
}

export async function getAlumniProfile(req, res, next) {
  try {
    const alumniId = Number(req.params.id);
    if (!Number.isInteger(alumniId) || alumniId <= 0) {
      return next(createError(400, "Invalid alumni id"));
    }
    const studentId = req.user.id;

    console.log("[GET /student/alumni/:id] Fetching alumni profile for ID:", alumniId);

    // Get alumni profile from users table ONLY
    const alumniResult = await pool.query(
      `SELECT 
        id,
        COALESCE(NULLIF(TRIM(SPLIT_PART(email, '@', 1)), ''), 'Alumni') as name,
        email
       FROM users
       WHERE id = $1 AND is_active = true AND role = 'alumni'`,
      [alumniId]
    );

    if (alumniResult.rows.length === 0) {
      console.log("[GET /student/alumni/:id] No alumni found for ID:", alumniId);
      return next(createError(404, "Alumni not found"));
    }

    console.log("[GET /student/alumni/:id] Alumni found successfully");
    
    const alumni = alumniResult.rows[0];
    
    // Try to get alumni details from alumni table - query by user_id
    try {
      const detailsQuery = await pool.query(
        `SELECT company, role, expertise, bio, location, graduation_year, experience, previous_companies, willing_to_help 
         FROM alumni WHERE user_id = $1`,
        [alumniId]
      );
      if (detailsQuery.rows.length > 0) {
        const details = detailsQuery.rows[0];
        alumni.company = details.company || '';
        alumni.role = details.role || '';
        alumni.expertise = details.expertise || '';
        alumni.bio = details.bio || '';
        alumni.location = details.location || '';
        alumni.graduationYear = details.graduation_year || null;
        alumni.batch = details.graduation_year ? `R${String(details.graduation_year).slice(-2)}` : '';
        alumni.experience = details.experience || null;
        // Parse comma-separated strings into arrays
        alumni.previousCompanies = details.previous_companies 
          ? details.previous_companies.split(',').map(c => c.trim()).filter(c => c)
          : [];
        alumni.willingToHelp = details.willing_to_help 
          ? details.willing_to_help.split(',').map(h => h.trim()).filter(h => h)
          : [];
      } else {
        alumni.company = '';
        alumni.role = '';
        alumni.expertise = '';
        alumni.bio = '';
        alumni.location = '';
        alumni.graduationYear = null;
        alumni.batch = '';
        alumni.experience = null;
        alumni.previousCompanies = [];
        alumni.willingToHelp = [];
      }
    } catch (err) {
      console.log("[GET /student/alumni/:id] Alumni details query failed:", err.message);
      alumni.company = '';
      alumni.role = '';
      alumni.expertise = '';
      alumni.bio = '';
      alumni.location = '';
      alumni.graduationYear = null;
      alumni.batch = '';
      alumni.experience = null;
      alumni.previousCompanies = [];
      alumni.willingToHelp = [];
    }

    // Try to get connection status
    try {
      const connectionResult = await pool.query(
        `SELECT status FROM connections 
         WHERE (user_id = $1 AND connected_user_id = $2) 
            OR (user_id = $2 AND connected_user_id = $1)`,
        [studentId, alumniId]
      );
      alumni.connectionStatus = connectionResult.rows.length > 0 
        ? connectionResult.rows[0].status 
        : 'none';
    } catch (err) {
      console.log("[GET /student/alumni/:id] Connection status query failed:", err.message);
      alumni.connectionStatus = 'none';
    }

    // Try to get recent insights
    try {
      const insightsResult = await pool.query(
        `SELECT id, title, content, created_at
         FROM alumni_insights
         WHERE author_id = $1
         ORDER BY created_at DESC
         LIMIT 3`,
        [alumniId]
      );
      alumni.recentInsights = insightsResult.rows;
    } catch (err) {
      console.log("[GET /student/alumni/:id] Insights query failed:", err.message);
      alumni.recentInsights = [];
    }

    console.log("[GET /student/alumni/:id] Returning alumni profile:", JSON.stringify({
      id: alumni.id,
      name: alumni.name,
      batch: alumni.batch,
      company: alumni.company,
      role: alumni.role,
      expertise: alumni.expertise
    }, null, 2));

    res.json(alumni);
  } catch (err) {
    console.error("[GET /student/alumni/:id] Error:", err.message);
    console.error("[GET /student/alumni/:id] Stack:", err.stack);
    next(err);
  }
}

export async function getStudentProfile(req, res, next) {
  try {
    const studentId = Number(req.params.id);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return next(createError(400, "Invalid student id"));
    }
    const currentUserId = req.user.id;

    console.log("[GET /student/view/:id] Fetching student profile for ID:", studentId);

    // Get student profile from users table
    const studentResult = await pool.query(
      `SELECT 
        id,
        COALESCE(NULLIF(TRIM(SPLIT_PART(email, '@', 1)), ''), 'Student') as name,
        email
       FROM users
       WHERE id = $1 AND is_active = true AND role = 'student'`,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      console.log("[GET /student/view/:id] No student found for ID:", studentId);
      return next(createError(404, "Student not found"));
    }

    console.log("[GET /student/view/:id] Student found successfully");
    
    const student = studentResult.rows[0];
    
    // Get student details from students table
    try {
      const detailsQuery = await pool.query(
        `SELECT name, department, year, cgpa, skills, bio, profile_image, cover_image, linkedin, github, portfolio 
         FROM students WHERE user_id = $1`,
        [studentId]
      );
      if (detailsQuery.rows.length > 0) {
        const details = detailsQuery.rows[0];
        student.name = details.name || student.name;
        student.department = details.department || '';
        student.year = details.year || '';
        student.cgpa = details.cgpa || null;
        student.skills = details.skills 
          ? details.skills.split(',').map(s => s.trim()).filter(s => s)
          : [];
        student.bio = details.bio || '';
        student.profileImage = details.profile_image || '';
        student.coverImage = details.cover_image || '';
        student.linkedin = details.linkedin || '';
        student.github = details.github || '';
        student.portfolio = details.portfolio || '';
      } else {
        student.department = '';
        student.year = '';
        student.cgpa = null;
        student.skills = [];
        student.bio = '';
        student.profileImage = '';
        student.coverImage = '';
        student.linkedin = '';
        student.github = '';
        student.portfolio = '';
      }
    } catch (err) {
      console.log("[GET /student/view/:id] Student details query failed:", err.message);
      student.department = '';
      student.year = '';
      student.cgpa = null;
      student.skills = [];
      student.bio = '';
      student.profileImage = '';
      student.coverImage = '';
      student.linkedin = '';
      student.github = '';
      student.portfolio = '';
    }

    // Get connection status
    try {
      const connectionResult = await pool.query(
        `SELECT status FROM connections 
         WHERE (user_id = $1 AND connected_user_id = $2) 
            OR (user_id = $2 AND connected_user_id = $1)`,
        [currentUserId, studentId]
      );
      student.connectionStatus = connectionResult.rows.length > 0 
        ? connectionResult.rows[0].status 
        : 'none';
    } catch (err) {
      console.log("[GET /student/view/:id] Connection status query failed:", err.message);
      student.connectionStatus = 'none';
    }

    console.log("[GET /student/view/:id] Returning student profile:", JSON.stringify({
      id: student.id,
      name: student.name,
      department: student.department,
      year: student.year,
      skills: student.skills
    }, null, 2));

    res.json(student);
  } catch (err) {
    console.error("[GET /student/view/:id] Error:", err.message);
    console.error("[GET /student/view/:id] Stack:", err.stack);
    next(err);
  }
}

export async function searchPeople(req, res, next) {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ students: [], alumni: [] });

    const students = await pool.query(
      "SELECT s.user_id AS id, u.email, s.department, s.skills FROM students s JOIN users u ON s.user_id = u.id WHERE u.is_active = true AND (u.email ILIKE $1 OR s.skills ILIKE $1)",
      ["%" + q + "%"],
    );
    const alumni = await pool.query(
      `SELECT u.id, u.email, a.company, a.role, a.expertise 
       FROM users u 
       LEFT JOIN alumni a ON u.id = a.user_id 
       WHERE u.is_active = true AND u.role = 'alumni' 
       AND (u.email ILIKE $1 OR a.company ILIKE $1 OR a.role ILIKE $1 OR a.expertise ILIKE $1)`,
      ["%" + q + "%"],
    );
    res.json({ students: students.rows, alumni: alumni.rows });
  } catch (err) {
    next(err);
  }
}

export async function searchAlumni(req, res, next) {
  try {
    const q = (req.query.q || "").trim();
    if (!q || q.length < 2) return res.json([]);

    const { rows } = await pool.query(
      `SELECT 
        u.id,
        COALESCE(NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''), 'Alumni') as name,
        u.email,
        COALESCE(a.company, '') as company, 
        COALESCE(a.role, '') as role, 
        COALESCE(a.expertise, '') as expertise,
        a.graduation_year
       FROM users u 
       LEFT JOIN alumni a ON u.id = a.user_id
       WHERE u.is_active = true AND u.role = 'alumni'
         AND (
           u.email ILIKE $1
           OR a.company ILIKE $1
           OR a.role ILIKE $1
           OR a.expertise ILIKE $1
         )
       ORDER BY u.email
       LIMIT 20`,
      ["%" + q + "%"],
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function listCommunities(req, res, next) {
  try {
    const userId = req.user.id;
    console.log('Fetching communities for user:', userId);
    const { rows } = await pool.query(
      `SELECT c.id, c.name, c.domain, c.description,
              CASE WHEN cm.user_id IS NOT NULL THEN true ELSE false END as "isJoined",
              COUNT(DISTINCT cm_all.user_id)::int as "memberCount",
              COUNT(DISTINCT fq.id)::int as "postCount"
       FROM communities c
       LEFT JOIN community_members cm ON c.id = cm.community_id AND cm.user_id = $1
       LEFT JOIN community_members cm_all ON c.id = cm_all.community_id
       LEFT JOIN forum_questions fq ON c.id = fq.community_id
       WHERE c.archived = false
       GROUP BY c.id, c.name, c.domain, c.description, cm.user_id
       ORDER BY c.name ASC`,
      [userId]
    );
    console.log('Communities fetched:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('Error in listCommunities:', err);
    next(err);
  }
}

export async function joinCommunity(req, res, next) {
  try {
    const userId = req.user.id;
    const communityId = Number(req.params.id);
    
    // Check if already joined
    const checkExisting = await pool.query(
      "SELECT user_id FROM community_members WHERE user_id = $1 AND community_id = $2",
      [userId, communityId]
    );
    
    if (checkExisting.rows.length > 0) {
      return res.json({ status: "already_joined", message: "Already a member of this community" });
    }
    
    const result = await pool.query(
      "INSERT INTO community_members (user_id, community_id, joined_at) VALUES ($1, $2, NOW()) RETURNING user_id",
      [userId, communityId]
    );
    
    res.status(201).json({ status: "joined", message: "Successfully joined community" });
  } catch (err) {
    next(err);
  }
}

export async function leaveCommunity(req, res, next) {
  try {
    const userId = req.user.id;
    const communityId = Number(req.params.id);
    
    const result = await pool.query(
      "DELETE FROM community_members WHERE user_id = $1 AND community_id = $2 RETURNING user_id",
      [userId, communityId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Not a member of this community" });
    }
    
    res.json({ status: "left", message: "Successfully left community" });
  } catch (err) {
    next(err);
  }
}

export async function getCommunityDetails(req, res, next) {
  try {
    const communityId = Number(req.params.id);
    const userId = req.user.id;
    const community = await pool.query(
      `SELECT c.id, c.name, c.domain, c.description,
              COUNT(DISTINCT cm.user_id)::int as "memberCount",
              CASE WHEN cm_user.user_id IS NOT NULL THEN true ELSE false END as "isJoined"
       FROM communities c
       LEFT JOIN community_members cm ON c.id = cm.community_id
       LEFT JOIN community_members cm_user ON c.id = cm_user.community_id AND cm_user.user_id = $2
       WHERE c.id = $1
       GROUP BY c.id, c.name, c.domain, c.description, cm_user.user_id`,
      [communityId, userId]
    );
    if (!community.rows[0]) throw createError(404, "Community not found");

    // Get community members
    const members = await pool.query(
      `SELECT u.id, u.email, u.role, cm.joined_at,
              CASE 
                WHEN u.role = 'student' THEN s.name
                WHEN u.role = 'alumni' THEN COALESCE(NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''), 'Alumni')
                WHEN u.role = 'faculty' THEN COALESCE(NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''), 'Faculty')
              END as name,
              CASE 
                WHEN u.role = 'student' THEN s.department
                WHEN u.role = 'alumni' THEN a.company
                WHEN u.role = 'faculty' THEN f.department
              END as affiliation
       FROM community_members cm
       JOIN users u ON cm.user_id = u.id
       LEFT JOIN students s ON u.id = s.user_id
       LEFT JOIN alumni a ON u.id = a.user_id
       LEFT JOIN faculty f ON u.id = f.user_id
       WHERE cm.community_id = $1
       ORDER BY cm.joined_at DESC
       LIMIT 20`,
      [communityId]
    );

    const questions = await pool.query(
      `SELECT q.id, q.title, q.content, q.user_id, q.created_at,
              COALESCE(NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''), 'User') as author_name,
              u.email as author_email
       FROM forum_questions q
       JOIN users u ON q.user_id = u.id
       WHERE q.community_id = $1
       ORDER BY q.created_at DESC`,
      [communityId],
    );

    const answers = await pool.query(
      `SELECT a.id, a.content, a.user_id, a.question_id, a.created_at,
              COALESCE(NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''), 'User') as author_name,
              u.email as author_email
       FROM forum_answers a
       JOIN users u ON a.user_id = u.id
       WHERE a.question_id = ANY($1)
       ORDER BY a.created_at ASC`,
      [questions.rows.map((q) => q.id)],
    );

    const likes = await pool.query(
      "SELECT question_id, COUNT(*)::int AS like_count FROM question_likes WHERE question_id = ANY($1) GROUP BY question_id",
      [questions.rows.map((q) => q.id)],
    );

    const userLikes = await pool.query(
      "SELECT question_id FROM question_likes WHERE user_id = $1 AND question_id = ANY($2)",
      [userId, questions.rows.map((q) => q.id)],
    );

    const likesMap = {};
    likes.rows.forEach((l) => { likesMap[l.question_id] = l.like_count; });
    const userLikesSet = new Set(userLikes.rows.map((l) => l.question_id));

    const questionsWithLikes = questions.rows.map((q) => ({
      ...q,
      like_count: likesMap[q.id] || 0,
      liked_by_user: userLikesSet.has(q.id),
    }));

    res.json({ 
      community: community.rows[0], 
      members: members.rows,
      questions: questionsWithLikes, 
      answers: answers.rows 
    });
  } catch (err) {
    next(err);
  }
}

export async function postQuestion(req, res, next) {
  try {
    const communityId = Number(req.params.id);
    const userId = req.user.id;
    const { title, content } = req.body;
    if (!title || !content) throw createError(400, "title and content required");
    
    const { rows } = await pool.query(
      "INSERT INTO forum_questions (community_id, user_id, title, content, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id",
      [communityId, userId, title, content],
    );
    const questionId = rows[0].id;
    
    // Get question poster name
    const posterResult = await pool.query(
      "SELECT email FROM users WHERE id = $1",
      [userId]
    );
    const posterEmail = posterResult.rows[0]?.email || "Someone";
    const posterName = posterEmail.split("@")[0];
    
    // Get community members to notify
    const membersResult = await pool.query(
      `SELECT DISTINCT cm.user_id FROM community_members cm 
       WHERE cm.community_id = $1 AND cm.user_id != $2`,
      [communityId, userId]
    );
    
    // Create notifications for all community members
    if (membersResult.rows.length > 0) {
      const notificationContent = JSON.stringify({
        message: `${posterName} asked: ${title}`,
        community_id: communityId,
        question_id: questionId
      });
      
      for (const member of membersResult.rows) {
        await pool.query(
          "INSERT INTO notifications (user_id, type, content, created_at) VALUES ($1, $2, $3, NOW())",
          [member.user_id, "community_question", notificationContent]
        );
      }
    }
    
    res.status(201).json({ id: questionId });
  } catch (err) {
    next(err);
  }
}

export async function replyQuestion(req, res, next) {
  try {
    const questionId = Number(req.params.id);
    const userId = req.user.id;
    const { content } = req.body;
    if (!content) throw createError(400, "content required");
    
    const { rows } = await pool.query(
      "INSERT INTO forum_answers (question_id, user_id, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id",
      [questionId, userId, content],
    );
    
    // Get the question to find the asker and community
    const questionResult = await pool.query(
      "SELECT user_id, community_id, title FROM forum_questions WHERE id = $1",
      [questionId]
    );
    const questionAsker = questionResult.rows[0]?.user_id;
    const communityId = questionResult.rows[0]?.community_id;
    const questionTitle = questionResult.rows[0]?.title;
    
    // Get replier name
    const replierResult = await pool.query(
      "SELECT email FROM users WHERE id = $1",
      [userId]
    );
    const replierEmail = replierResult.rows[0]?.email || "Someone";
    const replierName = replierEmail.split("@")[0];
    
    // Create notification for question asker
    if (questionAsker && questionAsker !== userId) {
      const notificationContent = JSON.stringify({
        message: `${replierName} replied to: ${questionTitle}`,
        community_id: communityId,
        question_id: questionId
      });
      await pool.query(
        "INSERT INTO notifications (user_id, type, content, created_at) VALUES ($1, $2, $3, NOW())",
        [questionAsker, "community_reply", notificationContent]
      );
    }
    
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    next(err);
  }
}

export async function likeQuestion(req, res, next) {
  try {
    const questionId = Number(req.params.id);
    const userId = req.user.id;
    await pool.query(
      "INSERT INTO question_likes (question_id, user_id, created_at) VALUES ($1, $2, NOW()) ON CONFLICT (question_id, user_id) DO NOTHING",
      [questionId, userId],
    );
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function unlikeQuestion(req, res, next) {
  try {
    const questionId = Number(req.params.id);
    const userId = req.user.id;
    await pool.query(
      "DELETE FROM question_likes WHERE question_id = $1 AND user_id = $2",
      [questionId, userId],
    );
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function listInsights(req, res, next) {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      `SELECT i.id, i.title, i.content, i.category, i.created_at, u.email AS author_email,
              COALESCE(NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''), 'Alumni') as author_name,
              COUNT(DISTINCT ir.user_id)::int as like_count,
              COUNT(DISTINCT ic.id)::int as comment_count,
              CASE WHEN user_like.user_id IS NOT NULL THEN true ELSE false END as liked_by_user
       FROM alumni_insights i 
       JOIN users u ON i.author_id = u.id
       LEFT JOIN insight_reactions ir ON i.id = ir.insight_id
       LEFT JOIN insight_comments ic ON i.id = ic.insight_id
       LEFT JOIN insight_reactions user_like ON i.id = user_like.insight_id AND user_like.user_id = $1
       GROUP BY i.id, i.title, i.content, i.category, i.created_at, u.email, user_like.user_id
       ORDER BY i.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function commentInsight(req, res, next) {
  try {
    const userId = req.user.id;
    const insightId = Number(req.params.id);
    const { content } = req.body;
    if (!content) throw createError(400, "content required");
    await pool.query(
      "INSERT INTO insight_comments (insight_id, user_id, content, created_at) VALUES ($1, $2, $3, NOW())",
      [insightId, userId, content],
    );
    res.status(201).json({ status: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function reactInsight(req, res, next) {
  try {
    const userId = req.user.id;
    const insightId = Number(req.params.id);
    const { reaction_type } = req.body;
    if (!reaction_type) throw createError(400, "reaction_type required");
    await pool.query(
      "INSERT INTO insight_reactions (insight_id, user_id, reaction_type, created_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (insight_id, user_id) DO UPDATE SET reaction_type = EXCLUDED.reaction_type",
      [insightId, userId, reaction_type],
    );
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function unreactInsight(req, res, next) {
  try {
    const userId = req.user.id;
    const insightId = Number(req.params.id);
    await pool.query(
      "DELETE FROM insight_reactions WHERE insight_id = $1 AND user_id = $2",
      [insightId, userId],
    );
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function getInsightComments(req, res, next) {
  try {
    const insightId = Number(req.params.id);
    const { rows } = await pool.query(
      `SELECT ic.id, ic.content, ic.created_at, ic.parent_id,
              u.id as user_id,
              COALESCE(NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''), 'User') as author_name,
              u.email as author_email
       FROM insight_comments ic
       JOIN users u ON ic.user_id = u.id
       WHERE ic.insight_id = $1
       ORDER BY ic.created_at ASC`,
      [insightId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function deleteInsightComment(req, res, next) {
  try {
    const userId = req.user.id;
    const insightId = Number(req.params.id);
    const commentId = Number(req.params.commentId);
    
    // Check if comment exists and belongs to the user
    const { rows } = await pool.query(
      "SELECT user_id FROM insight_comments WHERE id = $1 AND insight_id = $2",
      [commentId, insightId]
    );
    
    if (rows.length === 0) {
      throw createError(404, "Comment not found");
    }
    
    if (rows[0].user_id !== userId) {
      throw createError(403, "You can only delete your own comments");
    }
    
    // Delete the comment
    await pool.query(
      "DELETE FROM insight_comments WHERE id = $1",
      [commentId]
    );
    
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function listConnections(req, res, next) {
  try {
    const userId = req.user.id;
    // Get all connections (both directions) where status is 'connected'
    const { rows } = await pool.query(
      `SELECT 
        c.id,
        c.status,
        c.created_at,
        u.id as user_id,
        COALESCE(NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''), 'User') as name,
        u.email,
        u.role,
        COALESCE(a.company, s.department) as info
       FROM connections c
       JOIN users u ON (c.connected_user_id = u.id)
       LEFT JOIN alumni a ON u.id = a.user_id
       LEFT JOIN students s ON u.id = s.user_id
       WHERE c.user_id = $1 AND c.status = 'connected'
       UNION
       SELECT 
        c.id,
        c.status,
        c.created_at,
        u.id as user_id,
        COALESCE(NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''), 'User') as name,
        u.email,
        u.role,
        COALESCE(a.company, s.department) as info
       FROM connections c
       JOIN users u ON (c.user_id = u.id)
       LEFT JOIN alumni a ON u.id = a.user_id
       LEFT JOIN students s ON u.id = s.user_id
       WHERE c.connected_user_id = $1 AND c.status = 'connected'
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getPendingRequests(req, res, next) {
  try {
    const userId = req.user.id;
    // Get all pending connection requests WHERE the current user is the RECEIVER
    const { rows } = await pool.query(
      `SELECT 
        c.id,
        c.status,
        c.created_at,
        u.id as user_id,
        COALESCE(NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''), 'User') as name,
        u.email,
        u.role,
        COALESCE(a.company, s.department, s.name) as info
       FROM connections c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN alumni a ON u.id = a.user_id
       LEFT JOIN students s ON u.id = s.user_id
       WHERE c.connected_user_id = $1 AND c.status = 'pending'
       ORDER BY c.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function sendConnectionRequest(req, res, next) {
  try {
    const fromId = req.user.id;
    const toId = Number(req.params.id);
    
    console.log(`[sendConnectionRequest] From: ${fromId}, To: ${toId}`);
    
    // Validate IDs
    if (!toId || toId <= 0 || !fromId || fromId <= 0) {
      console.error(`[sendConnectionRequest] Invalid IDs - fromId: ${fromId}, toId: ${toId}`);
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    // Prevent self-connection
    if (fromId === toId) {
      console.log(`[sendConnectionRequest] User trying to connect to self`);
      return res.status(400).json({ message: "Cannot connect to yourself" });
    }
    
    // Check if connection already exists
    const checkExisting = await pool.query(
      `SELECT id, status FROM connections 
       WHERE (user_id = $1 AND connected_user_id = $2) 
          OR (user_id = $2 AND connected_user_id = $1)`,
      [fromId, toId]
    );
    
    if (checkExisting.rows.length > 0) {
      const existing = checkExisting.rows[0];
      console.log(`[sendConnectionRequest] Connection already exists with status: ${existing.status}`);
      return res.status(200).json({ 
        status: existing.status, 
        message: `Connection already exists (${existing.status})` 
      });
    }
    
    // Get sender's email for notification
    const senderResult = await pool.query(
      "SELECT email FROM users WHERE id = $1",
      [fromId]
    );
    
    if (!senderResult.rows[0]) {
      console.error(`[sendConnectionRequest] Sender not found: ${fromId}`);
      return res.status(401).json({ message: "User not authenticated properly" });
    }
    
    const senderEmail = senderResult.rows[0].email;
    const senderName = senderEmail.split("@")[0];
    
    // Insert connection request
    const insertResult = await pool.query(
      `INSERT INTO connections (user_id, connected_user_id, status, created_at) 
       VALUES ($1, $2, 'pending', NOW()) 
       RETURNING id, status, created_at`,
      [fromId, toId]
    );
    
    console.log(`[sendConnectionRequest] Connection created successfully:`, insertResult.rows[0]);
    
    // Create notification for recipient
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, type, content, read_status, created_at)
         VALUES ($1, $2, $3, false, NOW())`,
        [toId, "connection_request", `${senderName} sent you a connection request`]
      );
      console.log(`[sendConnectionRequest] Notification created for user ${toId}`);
    } catch (notifErr) {
      console.warn(`[sendConnectionRequest] Failed to create notification:`, notifErr.message);
      // Don't fail the request if notification fails
    }
    
    res.status(201).json({ 
      status: "pending",
      id: insertResult.rows[0].id,
      message: "Connection request sent successfully"
    });
    
  } catch (err) {
    console.error(`[sendConnectionRequest] Unexpected error:`, err.message, err.stack);
    res.status(500).json({ 
      message: `Server error: ${err.message}`,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

export async function acceptConnection(req, res, next) {
  try {
    const toId = req.user.id;
    const fromId = Number(req.params.id);
    console.log(`[acceptConnection] toId=${toId} fromId=${fromId}`);
    
    // Update the connection status to connected
    const updateResult = await pool.query(
      "UPDATE connections SET status = 'connected' WHERE user_id = $1 AND connected_user_id = $2",
      [fromId, toId]
    );
    console.log(`[acceptConnection] Updated rows: ${updateResult.rowCount}`);
    
    // Get recipient's info for notification
    const recipientResult = await pool.query(
      "SELECT email FROM users WHERE id = $1",
      [toId]
    );
    const recipientEmail = recipientResult.rows[0]?.email || "Someone";
    const recipientName = recipientEmail.split("@")[0];
    
    // Create notification for student who sent the original request
    await pool.query(
      `INSERT INTO notifications (user_id, type, content, read_status, created_at)
       VALUES ($1, $2, $3, false, NOW())`,
      [fromId, "connection_accepted", `${recipientName} accepted your connection request`]
    );
    
    res.json({ status: "connected" });
  } catch (err) {
    next(err);
  }
}

export async function rejectConnection(req, res, next) {
  try {
    const toId = req.user.id;
    const fromId = Number(req.params.id);
    await pool.query(
      "DELETE FROM connections WHERE user_id = $1 AND connected_user_id = $2 AND status = 'pending'",
      [fromId, toId]
    );
    
    // Get recipient's info for notification
    const recipientResult = await pool.query(
      "SELECT email FROM users WHERE id = $1",
      [toId]
    );
    const recipientEmail = recipientResult.rows[0]?.email || "Someone";
    const recipientName = recipientEmail.split("@")[0];
    
    // Create notification for student who sent the original request
    await pool.query(
      `INSERT INTO notifications (user_id, type, content, read_status, created_at)
       VALUES ($1, $2, $3, false, NOW())`,
      [fromId, "connection_rejected", `${recipientName} declined your connection request`]
    );
    
    res.json({ status: "rejected" });
  } catch (err) {
    next(err);
  }
}

// Sender cancels their own pending request
export async function cancelConnectionRequest(req, res, next) {
  try {
    const userId = req.user.id;
    const targetId = Number(req.params.id);
    console.log(`[cancelConnectionRequest] userId=${userId} targetId=${targetId}`);
    const del = await pool.query(
      "DELETE FROM connections WHERE user_id = $1 AND connected_user_id = $2 AND status = 'pending'",
      [userId, targetId]
    );
    if (del.rowCount > 0) {
      return res.json({ status: "cancelled" });
    }
    return res.status(404).json({ message: "No pending request found to cancel" });
  } catch (err) {
    next(err);
  }
}

// Either side removes an existing connection
export async function removeConnection(req, res, next) {
  try {
    const userId = req.user.id;
    const targetId = Number(req.params.id);
    console.log(`[removeConnection] userId=${userId} targetId=${targetId}`);
    
    // First, check what connections exist
    const checkExisting = await pool.query(
      `SELECT id, user_id, connected_user_id, status FROM connections 
       WHERE ((user_id = $1 AND connected_user_id = $2) OR (user_id = $2 AND connected_user_id = $1))`,
      [userId, targetId]
    );
    console.log(`[removeConnection] Found connections:`, checkExisting.rows);
    
    if (checkExisting.rows.length === 0) {
      console.warn(`[removeConnection] No connections found between userId=${userId} and targetId=${targetId}`);
      return res.status(404).json({ message: "No connection found to remove" });
    }
    
    const del1 = await pool.query(
      "DELETE FROM connections WHERE ((user_id = $1 AND connected_user_id = $2) OR (user_id = $2 AND connected_user_id = $1)) AND status = 'connected'",
      [userId, targetId]
    );
    if (del1.rowCount > 0) {
      console.log(`[removeConnection] removed connected rows: ${del1.rowCount}`);
      return res.json({ status: "removed", removed: del1.rowCount });
    }
    // Fallback: some code paths may have used 'accepted' status
    const del2 = await pool.query(
      "DELETE FROM connections WHERE ((user_id = $1 AND connected_user_id = $2) OR (user_id = $2 AND connected_user_id = $1)) AND status = 'accepted'",
      [userId, targetId]
    );
    if (del2.rowCount > 0) {
      console.log(`[removeConnection] removed accepted rows (fallback): ${del2.rowCount}`);
      return res.json({ status: "removed", removed: del2.rowCount });
    }
    // Remove ANY status
    const del3 = await pool.query(
      "DELETE FROM connections WHERE ((user_id = $1 AND connected_user_id = $2) OR (user_id = $2 AND connected_user_id = $1))",
      [userId, targetId]
    );
    if (del3.rowCount > 0) {
      console.log(`[removeConnection] removed any status rows: ${del3.rowCount}`);
      return res.json({ status: "removed", removed: del3.rowCount });
    }
    console.warn(`[removeConnection] Failed to delete any rows`);
    return res.status(404).json({ message: "Failed to remove connection - unexpected state" });
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
      [userId, peerId],
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const senderId = req.user.id;
    const { receiver_id, content } = req.body;
    if (!receiver_id || !content) throw createError(400, "receiver_id and content required");
    
    // Insert message
    await pool.query(
      "INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES ($1, $2, $3, NOW())",
      [senderId, receiver_id, content],
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

export async function listEvents(_req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT 
        e.id, 
        e.title, 
        e.date, 
        e.location, 
        e.description, 
        e.organizer_id,
        u.email as organizer_email,
        COALESCE(NULLIF(TRIM(SPLIT_PART(u.email, '@', 1)), ''), 'Organizer') as organizer_name
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       ORDER BY e.id DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function registerEvent(req, res, next) {
  try {
    const userId = req.user.id;
    const eventId = Number(req.params.id);
    
    // Check if already registered
    const checkResult = await pool.query(
      "SELECT * FROM event_registrations WHERE user_id = $1 AND event_id = $2",
      [userId, eventId]
    );
    
    const isAlreadyRegistered = checkResult.rows.length > 0;
    
    if (isAlreadyRegistered) {
      // Unregister - delete the record
      await pool.query(
        "DELETE FROM event_registrations WHERE user_id = $1 AND event_id = $2",
        [userId, eventId]
      );
      console.log(`[registerEvent] User ${userId} unregistered from event ${eventId}`);
      res.json({ status: "unregistered" });
    } else {
      // Register - insert the record
      await pool.query(
        "INSERT INTO event_registrations (user_id, event_id, status, created_at) VALUES ($1, $2, 'registered', NOW())",
        [userId, eventId]
      );
      console.log(`[registerEvent] User ${userId} registered for event ${eventId}`);
      res.json({ status: "registered" });
    }
  } catch (err) {
    console.error(`[registerEvent] Error:`, err.message);
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    console.log("[GET /student/profile] Fetching profile for user ID:", userId);
    
    const { rows } = await pool.query(
      `SELECT u.id, u.email, 
              s.name, s.department, s.year, s.cgpa,
              s.skills, s.bio, 
              s.profile_image, s.cover_image,
              s.linkedin, s.github, s.portfolio 
       FROM users u 
       JOIN students s ON s.user_id = u.id 
       WHERE u.id = $1`, 
      [userId]
    );
    
    if (!rows[0]) {
      console.log("[GET /student/profile] Profile not found for user ID:", userId);
      throw createError(404, "Profile not found");
    }
    
    console.log("[GET /student/profile] Returning profile:", JSON.stringify(rows[0], (key, val) => {
      if (typeof val === 'string' && val.length > 100) {
        return val.substring(0, 100) + "...";
      }
      return val;
    }));
    
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, department, year, cgpa, skills, bio, profile_image, cover_image, linkedin, github, portfolio } = req.body;
    
    console.log('[UPDATE PROFILE] User ID:', userId);
    console.log('[UPDATE PROFILE] Data received:', { name, department, year, cgpa, skills, bio, linkedin, github, portfolio, hasProfileImage: !!profile_image, hasCoverImage: !!cover_image });
    
    // Validate if user exists and get current profile
    const existing = await pool.query(`SELECT * FROM students WHERE user_id = $1`, [userId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Student profile not found" });
    }
    
    const current = existing.rows[0];
    
    // Build update data - only update fields that are explicitly provided
    const updateData = {};
    
    // Text fields - only update if provided and not empty
    if (name !== undefined && name && name.trim()) updateData.name = name.trim();
    if (department !== undefined && department && department.trim()) updateData.department = department.trim();
    if (year !== undefined && year && year.trim()) updateData.year = year.trim();
    if (cgpa !== undefined && cgpa !== '' && cgpa !== null) updateData.cgpa = Number(cgpa);
    if (bio !== undefined && bio && bio.trim()) updateData.bio = bio.trim();
    if (linkedin !== undefined && linkedin && linkedin.trim()) updateData.linkedin = linkedin.trim();
    if (github !== undefined && github && github.trim()) updateData.github = github.trim();
    if (portfolio !== undefined && portfolio && portfolio.trim()) updateData.portfolio = portfolio.trim();
    
    // Skills - only update if it's an array with values
    if (skills !== undefined && Array.isArray(skills) && skills.length > 0) {
      updateData.skills = skills.map(s => s.trim()).filter(Boolean).join(',');
    }
    
    // Images - only if they're new base64 strings
    if (profile_image && typeof profile_image === 'string' && profile_image.startsWith('data:image')) {
      if (profile_image.length <= 1024 * 1024) {
        updateData.profile_image = profile_image;
      }
    }
    
    if (cover_image && typeof cover_image === 'string' && cover_image.startsWith('data:image')) {
      if (cover_image.length <= 2 * 1024 * 1024) {
        updateData.cover_image = cover_image;
      }
    }
    
    console.log('[UPDATE PROFILE] Fields to update:', Object.keys(updateData));
    
    if (Object.keys(updateData).length === 0) {
      console.log('[UPDATE PROFILE] No changes to update');
      // Return current profile instead of error
      const skills_array = current.skills ? current.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
      return res.json({ 
        status: "no changes",
        name: current.name,
        department: current.department,
        year: current.year,
        cgpa: current.cgpa,
        bio: current.bio,
        skills: skills_array,
        profile_image: current.profile_image,
        cover_image: current.cover_image,
        linkedin: current.linkedin,
        github: current.github,
        portfolio: current.portfolio
      });
    }
    
    // Build dynamic UPDATE query
    const fields = Object.keys(updateData);
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const values = fields.map(field => updateData[field]);
    values.push(userId);
    
    const query = `UPDATE students SET ${setClause} WHERE user_id = $${fields.length + 1} RETURNING user_id, name, department, year, cgpa, bio, skills, profile_image, cover_image, linkedin, github, portfolio`;
    
    console.log('[UPDATE PROFILE] Query:', query);
    console.log('[UPDATE PROFILE] Values:', values.slice(0, -1)); // Don't log images or userId
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(500).json({ error: "Failed to update profile" });
    }
    
    const profile = result.rows[0];
    const skills_array = profile.skills ? profile.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    console.log('[UPDATE PROFILE] Update successful');
    res.json({ 
      status: "updated",
      name: profile.name,
      department: profile.department,
      year: profile.year,
      cgpa: profile.cgpa,
      bio: profile.bio,
      skills: skills_array,
      profile_image: profile.profile_image,
      cover_image: profile.cover_image,
      linkedin: profile.linkedin,
      github: profile.github,
      portfolio: profile.portfolio
    });
  } catch (err) {
    console.error('[UPDATE PROFILE] Error:', err.message);
    console.error('[UPDATE PROFILE] Stack:', err.stack);
    res.status(500).json({ error: err.message });
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

    // Normalize response so clients consistently get human-friendly fields
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
    const result = await pool.query(
      "UPDATE notifications SET read_status = true WHERE id = $1 AND user_id = $2",
      [notificationId, userId]
    );
    if (result.rowCount === 0) {
      return next(createError(404, "Notification not found"));
    }
    res.json({ status: "ok" });
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
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const userId = req.user.id;
    const notificationId = Number(req.params.id);
    console.log(`Deleting notification ${notificationId} for user ${userId}`);
    const result = await pool.query(
      "DELETE FROM notifications WHERE id = $1 AND user_id = $2",
      [notificationId, userId]
    );
    console.log(`Delete result: rowCount = ${result.rowCount}`);
    if (result.rowCount === 0) {
      return next(createError(404, "Notification not found"));
    }
    res.json({ status: "deleted" });
  } catch (err) {
    console.error("Delete notification error:", err);
    next(err);
  }
}
