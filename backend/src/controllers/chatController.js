import Room from "../models/Room.js";

export const listMyChats = async (req, res) => {
  const me = req.user._id;
  const rooms = await Room.find({ isDM: true, participants: me }).populate("participants","_id username email avatar").sort({ updatedAt: -1 });
  res.json(rooms);
};

export const getOrCreateDM = async (req, res) => {
  const { otherUserId } = req.body;
  const me = req.user._id;
  if (!otherUserId) return res.status(400).json({ message:"otherUserId required" });
  let room = await Room.findOne({ isDM: true, participants: { $all: [me, otherUserId], $size: 2 } });
  if (!room) room = await Room.create({ isDM: true, participants: [me, otherUserId] });
  res.json(room);
};
