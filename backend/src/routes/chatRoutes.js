import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { listMyChats, getOrCreateDM } from "../controllers/chatController.js";

const router = Router();
router.get("/", authMiddleware, listMyChats);
router.post("/dm", authMiddleware, getOrCreateDM);
export default router;
