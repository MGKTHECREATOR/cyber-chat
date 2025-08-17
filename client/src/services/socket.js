import { io } from "socket.io-client";
let socket=null;
export const getSocket=(token)=>{ if(!token) return null; if(!socket){ socket=io(import.meta.env.VITE_API_BASE||"http://localhost:5000",{ auth:{ token } }); } return socket; };
