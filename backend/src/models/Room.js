import mongoose from "mongoose";
const roomSchema = new mongoose.Schema({
  isDM: { type: Boolean, default: true }, // only DMs in this app
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }]
}, { timestamps: true });
roomSchema.index({ participants: 1 });
export default mongoose.model("Room", roomSchema);
