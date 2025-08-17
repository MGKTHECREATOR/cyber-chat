import { Router } from "express";
import { register, login, whoami } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/whoami", authMiddleware, whoami);
export default router;
