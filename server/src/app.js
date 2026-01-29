import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import alumniRoutes from "./routes/alumni.routes.js";
import facultyRoutes from "./routes/faculty.routes.js";
import { errorHandler } from "./utils/error.js";

const app = express();
const PgSession = connectPg(session);

app.use(cors({ 
  origin: process.env.CLIENT_URL || "http://localhost:5000", 
  credentials: true 
}));
// Increase JSON body size limit to handle base64 images for profiles
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

// Session middleware with PostgreSQL store
app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || "fallback-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/faculty", facultyRoutes);

app.use(errorHandler);

export default app;
