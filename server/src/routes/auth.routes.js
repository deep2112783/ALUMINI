import { Router } from "express";
import { login, createPassword, logout, checkEmail } from "../controllers/auth.controller.js";

const router = Router();

router.post("/check-email", checkEmail);
router.post("/login", login);
router.post("/create-password", createPassword);
router.post("/logout", logout);

export default router;
