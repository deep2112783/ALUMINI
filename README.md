# RGUKT RKV Alumni–Student Platform Backend

This project includes a production-style Express backend under `server/src` that implements authentication, role-based access, and REST APIs aligned with the routes in `ROUTES_DOCUMENTATION.md`.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

- Copy `server/.env.example` to `server/.env` and set values for `DATABASE_URL`, `JWT_SECRET`, etc.

3. Start backend:

```bash
npm run server:dev
```

Backend runs on `http://localhost:4000`.

4. Start frontend (optional):

```bash
npm run dev
```

Frontend runs on `http://localhost:5000`.

## API Overview

- Auth: `/api/auth/login`, `/api/auth/create-password`, `/api/auth/logout`
- Student: communities, insights, connections, messages, events, profile
- Alumni: post insights, reply to questions, manage requests, events, students
- Faculty: events management, alumni invitations, communities management

All non-auth routes require `Authorization: Bearer <token>`.

## Notes

- Backend uses PostgreSQL (`pg`) and assumes tables exist in Supabase.
- Passwords hashed with `bcryptjs`. JWTs signed with `JWT_SECRET`.
- Add a proxy in `vite.config.js` if you want frontend `/api` calls to hit backend automatically in dev.
