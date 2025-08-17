import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { getMe } from "../services/api.js";
import { getSocket } from "../services/socket.js";
import ChatLayout from "./ChatLayout.jsx";
export default function App(){
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const token = localStorage.getItem("token")||"";
  const socket = useMemo(()=>getSocket(token), [token]);
  useEffect(()=>{ (async ()=>{ try{ const profile = await getMe(token); setMe(profile); }catch{ localStorage.removeItem("token"); navigate("/login"); } })(); },[]);
  if(!me) return null;
  return (<Routes><Route path="/*" element={<ChatLayout me={me} socket={socket} />} /></Routes>);
}
