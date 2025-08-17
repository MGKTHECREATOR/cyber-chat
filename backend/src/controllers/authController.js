import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (user) => jwt.sign({ _id: user._id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message:"All fields required" });
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ message:"User exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    const token = signToken(user);
    res.status(201).json({ token, user: { _id: user._id, username, email } });
  } catch (e) { res.status(500).json({ message:e.message }); }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message:"Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message:"Invalid credentials" });
    const token = signToken(user);
    res.json({ token, user: { _id: user._id, username: user.username, email: user.email } });
  } catch (e) { res.status(500).json({ message:e.message }); }
};

export const whoami = async (req, res) => res.json(req.user);
