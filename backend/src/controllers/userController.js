import User from "../models/User.js";
export const listUsers = async (_req, res) => {
  const users = await User.find().select("_id username email avatar");
  res.json(users);
};
