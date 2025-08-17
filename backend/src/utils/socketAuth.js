import jwt from "jsonwebtoken";
export const verifySocketToken = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No auth token for socket"));
    const data = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = data;
    next();
  } catch (e) { next(new Error("Invalid socket token")); }
};
