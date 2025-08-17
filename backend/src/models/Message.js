import mongoose from "mongoose";
const reactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  emoji: { type: String, required: true }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  reactions: { type: [reactionSchema], default: [] }
}, { timestamps: true });
export default mongoose.model("Message", messageSchema);
