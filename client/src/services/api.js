import axios from "axios";
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const authHeader = (t)=>({ headers:{ Authorization:`Bearer ${t}` } });
export const register = async (b)=>(await axios.post(`${BASE}/api/auth/register`,b)).data;
export const login = async (b)=>(await axios.post(`${BASE}/api/auth/login`,b)).data;
export const getMe = async (t)=>(await axios.get(`${BASE}/api/auth/whoami`,authHeader(t))).data;
export const listUsers = async (t)=>(await axios.get(`${BASE}/api/users`,authHeader(t))).data;
export const listMyChats = async (t)=>(await axios.get(`${BASE}/api/chats`,authHeader(t))).data;
export const createDM = async (t,b)=>(await axios.post(`${BASE}/api/chats/dm`,b,authHeader(t))).data;
export const getRoomMessages = async (t,id,o={})=>{
  const params=new URLSearchParams(); if(o.before) params.set("before",o.before); if(o.limit) params.set("limit",o.limit);
  const url=params.toString()?`${BASE}/api/messages/room/${id}?${params}`:`${BASE}/api/messages/room/${id}`;
  return (await axios.get(url,authHeader(t))).data;
};
