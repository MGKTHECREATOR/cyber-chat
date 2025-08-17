//cd backend cp .env.example .env npm install npm run dev
// cd client npm install npm rundev
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import { verifySocketToken } from "./src/utils/socketAuth.js";
import Message from "./src/models/Message.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error("Missing MONGO_URI"); process.exit(1); }
mongoose.connect(MONGO_URI).then(()=>console.log("MongoDB connected"))
.catch(e=>{ console.error("MongoDB error:", e.message); process.exit(1); });

app.get("/", (_req,res)=>res.send("Cyber Chat backend running"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: CLIENT_ORIGIN, credentials:true } });
io.use(verifySocketToken);

const userSockets = new Map(); // userId -> socketId

io.on("connection", async (socket) => {
  const user = socket.user; // from verifySocketToken
  userSockets.set(user._id, socket.id);
  io.emit("onlineUsers", Array.from(userSockets.keys()));

  socket.on("joinChat", ({ roomId }) => {
    if (!roomId) return;
    socket.join(roomId);
  });

  socket.on("leaveChat", ({ roomId }) => {
    if (!roomId) return;
    socket.leave(roomId);
  });

  socket.on("typing", ({ roomId, isTyping }) => {
    if (!roomId) return;
    socket.to(roomId).emit("typing", { roomId, userId: user._id, username: user.username, isTyping: !!isTyping });
  });

  socket.on("sendMessage", async ({ roomId, text }, ack) => {
    try {
      if (!roomId || !text?.trim()) return ack && ack({ ok:false, error:"roomId and text required" });
      const msg = await Message.create({ roomId, senderId: user._id, text });
      io.to(roomId).emit("receiveMessage", { _id: msg._id, roomId, senderId: user._id, text: msg.text, createdAt: msg.createdAt, reactions: [] });
      ack && ack({ ok:true, id: msg._id });
    } catch (e) { ack && ack({ ok:false, error:e.message }); }
  });

  socket.on("reactMessage", async ({ messageId, emoji }, ack) => {
    try {
      const msg = await Message.findById(messageId);
      if (!msg) return ack && ack({ ok:false, error:"Message not found" });
      const existing = msg.reactions.find(r => r.userId.toString() === user._id && r.emoji === emoji);
      if (existing) {
        msg.reactions = msg.reactions.filter(r => !(r.userId.toString() === user._id && r.emoji === emoji));
      } else {
        msg.reactions.push({ userId: user._id, emoji });
      }
      await msg.save();
      io.to(msg.roomId.toString()).emit("messageReaction", { messageId, reactions: msg.reactions });
      ack && ack({ ok:true });
    } catch (e) { ack && ack({ ok:false, error:e.message }); }
  });

  socket.on("disconnect", () => {
    userSockets.delete(user._id);
    io.emit("onlineUsers", Array.from(userSockets.keys()));
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log("Server listening on port", PORT));
