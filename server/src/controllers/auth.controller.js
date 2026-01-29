import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { createError } from "../utils/error.js";

const ALLOWED_DOMAIN_RAW = (process.env.COLLEGE_DOMAIN || "@rguktrkv.ac.in").trim().toLowerCase();
const ALLOWED_DOMAIN = ALLOWED_DOMAIN_RAW.startsWith("@")
  ? ALLOWED_DOMAIN_RAW.slice(1)
  : ALLOWED_DOMAIN_RAW; // compare domain without leading @ to avoid mismatch on input formats

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw createError(400, "Email and password required");

    const normalizedEmail = email.trim().toLowerCase();
    const domain = normalizedEmail.split("@").pop();
    if (!domain || domain !== ALLOWED_DOMAIN) throw createError(400, "Only college emails allowed");

    const { rows } = await pool.query("SELECT id, email, password, role, is_first_login, is_active FROM users WHERE email = $1", [normalizedEmail]);
    const user = rows[0];
    if (!user) throw createError(401, "Invalid credentials");
    if (!user.is_active) throw createError(403, "Account inactive");

    // If no password, force initial password setup. If password exists but flag is stuck, clear it.
    if (user.password == null) {
      return res.status(200).json({ status: "FIRST_LOGIN_REQUIRED" });
    }

    if (user.is_first_login && user.password) {
      await pool.query("UPDATE users SET is_first_login = false WHERE id = $1", [user.id]);
      user.is_first_login = false;
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw createError(401, "Invalid credentials");

    // Store user info in session
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.email = user.email;

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    const response = { token, role: user.role, userId: user.id, email: user.email };
    console.log("[LOGIN] Sending response:", { role: user.role, userId: user.id });
    return res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function createPassword(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw createError(400, "Email and password required");

    const normalizedEmail = email.trim().toLowerCase();
    const domain = normalizedEmail.split("@").pop();
    if (!domain || domain !== ALLOWED_DOMAIN) throw createError(400, "Only college emails allowed");

    const { rows } = await pool.query("SELECT id, role, is_first_login FROM users WHERE email = $1", [normalizedEmail]);
    const user = rows[0];
    if (!user) throw createError(404, "User not found");

    const hash = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password = $1, is_first_login = false WHERE id = $2", [hash, user.id]);

    // Store user info in session
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.email = normalizedEmail;

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: normalizedEmail, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    return res.json({ token, role: user.role, userId: user.id, email: normalizedEmail });
  } catch (err) {
    next(err);
  }
}

export async function checkEmail(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) throw createError(400, "Email required");

    const normalizedEmail = email.trim().toLowerCase();
    const domain = normalizedEmail.split("@").pop();
    if (!domain || domain !== ALLOWED_DOMAIN) throw createError(400, "Only college emails allowed");

    const { rows } = await pool.query("SELECT id, password IS NOT NULL as has_password, is_active FROM users WHERE email = $1", [normalizedEmail]);
    const user = rows[0];
    if (!user) throw createError(404, "User not found");
    if (!user.is_active) throw createError(403, "Account inactive");

    return res.json({ hasPassword: user.has_password });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, _next) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    return res.json({ status: "ok" });
  });
}
