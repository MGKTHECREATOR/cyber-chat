import Message from "../models/Message.js";
import Room from "../models/Room.js";

export const getRoomMessages = async (req, res) => {
  const { roomId } = req.params;
  const limit = Math.max(1, Math.min(parseInt(req.query.limit || "50", 10), 100));
  const before = req.query.before ? new Date(req.query.before) : null;
  const q = { roomId };
  if (before) q.createdAt = { $lt: before };
  const msgs = await Message.find(q).sort({ createdAt: -1 }).limit(limit);
  res.json(msgs.reverse());
};
