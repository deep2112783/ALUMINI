# Backend Setup

## Quick Start

```bash
cd server
npm install
npm start
```

Server runs on **http://localhost:4000**

## Development
x
```bash
cd server
npm install
npm run dev
```

## Configuration

Create `server/.env` with:

```
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=your-secret-key
COLLEGE_DOMAIN=@rguktrkv.ac.in
PGSSLMODE=require
```

## Schema & Seed

Run the SQL files from `server/sql/` in your Supabase database editor:
1. `schema.sql` - Creates all tables
2. `seed.sql` - Inserts test data

## API Documentation

See [ROUTES_DOCUMENTATION.md](../ROUTES_DOCUMENTATION.md) for all endpoints.

- Auth: `/api/auth/login`, `/api/auth/create-password`, `/api/auth/logout`
- Student: `/api/student/*`
- Alumni: `/api/alumni/*`
- Faculty: `/api/faculty/*`

All endpoints (except auth) require JWT in `Authorization: Bearer <token>` header.
