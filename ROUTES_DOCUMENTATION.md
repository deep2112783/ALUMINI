# RGUKT RKV Alumni Platform - Routes Documentation

This document specifies all frontend routes and their backend requirements.

## Authentication Routes
- **Path**: `/auth/login`
  - **Description**: Login page for all users (Student, Alumni, Faculty)
  - **Backend Required**: YES
    - Validate email ends with `@rguktrkv.ac.in`
    - Query database for user credentials
    - Check user role (student/alumni/faculty)
    - Create session/JWT token
  - **Database Tables Needed**: users, roles, authentication_logs
  - **Validation**: Email format + domain, password hashing (bcrypt)

- **Path**: `/auth/create-password`
  - **Description**: First-time password creation for new users
  - **Backend Required**: YES
    - Verify user is first-time login
    - Update password in database
    - Hash and store securely
  - **Database Tables Needed**: users, password_history

---

## Student Routes
- **Path**: `/student/home`
  - **Description**: Student dashboard with greeting, search, notifications, and events
  - **Backend Required**: YES
    - Fetch notifications (replies, insights, event updates)
    - Fetch upcoming events
    - Fetch suggested alumni
  - **Database Tables Needed**: notifications, events, alumni_profiles, connections

- **Path**: `/student/communities`
  - **Description**: List of all communities
  - **Backend Required**: YES
    - Fetch communities list
    - Show join status for each community
  - **Database Tables Needed**: communities, community_members

- **Path**: `/student/communities/:id`
  - **Description**: Community detail - forum-style Q&A
  - **Backend Required**: YES
    - Fetch questions in this community
    - Fetch answers/replies with alumni highlighting
    - Post new question
    - Reply to questions
  - **Database Tables Needed**: communities, questions, answers, community_members

- **Path**: `/student/insights`
  - **Description**: Feed of alumni insights articles
  - **Backend Required**: YES
    - Fetch insights by category/filter
    - Like/react functionality
    - Comment on insights
  - **Database Tables Needed**: insights, reactions, comments, alumni_profiles

- **Path**: `/student/connections`
  - **Description**: Find and connect with alumni/students
  - **Backend Required**: YES
    - Search alumni by name, company, domain
    - Show connection status (Connect/Pending/Connected)
    - Handle connection requests
  - **Database Tables Needed**: alumni_profiles, student_profiles, connections, connection_requests

- **Path**: `/student/messages`
  - **Description**: One-to-one messaging with connected users
  - **Backend Required**: YES
    - Fetch conversation list
    - Load chat history
    - Send messages (only after mutual connection)
    - Real-time message delivery (WebSocket)
  - **Database Tables Needed**: conversations, messages, connections

- **Path**: `/student/events`
  - **Description**: Browse and register for events
  - **Backend Required**: YES
    - Fetch all events
    - Register for event
    - Mark as interested
  - **Database Tables Needed**: events, event_registrations, event_interested

- **Path**: `/student/profile`
  - **Description**: Student profile - editable
  - **Backend Required**: YES
    - Fetch user profile data
    - Update profile (name, bio, skills, links)
    - Email is read-only
  - **Database Tables Needed**: student_profiles

---

## Alumni Routes
- **Path**: `/alumni/home`
  - **Description**: Alumni dashboard with quick actions
  - **Backend Required**: YES
    - Fetch mentorship stats (students mentored, insights posted)
    - Fetch pending student questions
    - Fetch upcoming events they can volunteer for
  - **Database Tables Needed**: alumni_profiles, connections, questions, events

- **Path**: `/alumni/post-insight`
  - **Description**: Create and publish insights
  - **Backend Required**: YES
    - Save insight to database
    - Attach category/domain
    - Set visibility/target audience
  - **Database Tables Needed**: insights

- **Path**: `/alumni/communities`
  - **Description**: Communities (shared with student view)
  - **Backend Required**: YES (same as student)
    - Alumni can answer questions (marked with 🎓 badge)

- **Path**: `/alumni/connections`
  - **Description**: Manage connection requests and student connections
  - **Backend Required**: YES
    - Fetch pending connection requests
    - Accept/reject requests
    - View connected students
  - **Database Tables Needed**: connections, connection_requests, student_profiles

- **Path**: `/alumni/messages`
  - **Description**: One-to-one messaging (shared with student)
  - **Backend Required**: YES (same as student)

- **Path**: `/alumni/events`
  - **Description**: View events and volunteer for them
  - **Backend Required**: YES
    - Fetch events
    - Register as volunteer
    - Mark as interested
  - **Database Tables Needed**: events, event_volunteers

- **Path**: `/alumni/profile`
  - **Description**: Alumni professional profile
  - **Backend Required**: YES
    - Fetch alumni profile
    - Update company, role, expertise, links
    - Mentorship availability toggle
  - **Database Tables Needed**: alumni_profiles

---

## Faculty Routes
- **Path**: `/faculty/home`
  - **Description**: Faculty dashboard with event coordination stats
  - **Backend Required**: YES
    - Fetch event coordination status
    - Fetch active alumni count
    - Fetch pending requests
  - **Database Tables Needed**: events, alumni_profiles, community_requests

- **Path**: `/faculty/events`
  - **Description**: Create, edit, and manage events
  - **Backend Required**: YES
    - Create new event
    - Edit event details
    - Cancel event
    - Fetch registrations
  - **Database Tables Needed**: events, event_registrations

- **Path**: `/faculty/communities`
  - **Description**: Create and manage communities
  - **Backend Required**: YES
    - Create community
    - Edit community
    - Archive community
  - **Database Tables Needed**: communities

- **Path**: `/faculty/coordination`
  - **Description**: Alumni management and invitations
  - **Backend Required**: YES
    - Fetch all alumni
    - Filter by domain
    - Send invitations to events
    - Send emails
  - **Database Tables Needed**: alumni_profiles, events, invitations, email_logs

- **Path**: `/faculty/profile`
  - **Description**: Faculty profile
  - **Backend Required**: YES
    - Fetch faculty details
    - Update bio and contact info
  - **Database Tables Needed**: faculty_profiles

---

## Summary: Backend Requirements

### Core Tables Needed:
1. **users** - All user data (email, password_hash, role, created_at)
2. **student_profiles** - Student-specific data (department, skills, bio, year)
3. **alumni_profiles** - Alumni-specific data (company, role, expertise, mentorship_status)
4. **faculty_profiles** - Faculty-specific data (department, bio, office_location)
5. **communities** - Community info (name, domain, description, creator_id)
6. **questions** - Q&A in communities (title, content, asked_by, community_id)
7. **answers** - Replies to questions (content, answered_by, question_id)
8. **insights** - Alumni articles (title, content, author_id, category)
9. **events** - Events (title, date, location, description, organizer_id)
10. **connections** - User connections (user1_id, user2_id, status)
11. **connection_requests** - Pending connections (from_id, to_id, status)
12. **conversations** - Chat conversations (user1_id, user2_id)
13. **messages** - Chat messages (conversation_id, sender_id, content)
14. **notifications** - User notifications (user_id, type, content, read_status)
15. **reactions** - Likes/reactions on insights (user_id, insight_id, reaction_type)
16. **comments** - Comments on insights (user_id, insight_id, content)
17. **event_registrations** - Event registrations (user_id, event_id, status)
18. **community_members** - Community membership (user_id, community_id, joined_at)

### Authentication Strategy:
- Use JWT tokens or session-based auth
- Implement password hashing (bcrypt)
- Email verification for RGUKT domain
- Role-based access control (RBAC)

### APIs Needed:
- POST `/api/auth/login` - User authentication
- POST `/api/auth/logout` - Logout
- POST `/api/auth/create-password` - First-time password
- GET `/api/profile` - Get current user profile
- PUT `/api/profile` - Update profile
- GET `/api/communities` - List communities
- GET `/api/communities/:id` - Community details
- POST `/api/communities/:id/questions` - Post question
- POST `/api/questions/:id/answers` - Answer question
- GET `/api/insights` - Fetch insights
- POST `/api/insights` - Create insight
- GET `/api/connections` - List connections
- POST `/api/connections/:id/request` - Send connection
- GET `/api/messages` - Fetch conversations
- POST `/api/messages/send` - Send message
- GET `/api/events` - List events
- POST `/api/events/:id/register` - Register for event

---

## Current Status:
✅ **Frontend UI Complete** - All pages are designed and interactive (mockup mode)
⚠️ **Backend Required** - To go live, implement all the APIs and database tables above
⚠️ **Authentication Required** - Login currently accepts any `@rgukt.ac.in` email (mock)

---

## Notes:
- All pages currently use mock data stored in React state
- No persistence across page refreshes
- To convert to full-stack: implement backend APIs and database
- Each API endpoint needs proper authorization and validation
