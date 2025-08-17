import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getRoomMessages } from "../controllers/messageController.js";

const router = Router();
router.get("/room/:roomId", authMiddleware, getRoomMessages);
export default router;
