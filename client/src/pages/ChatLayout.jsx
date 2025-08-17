import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { listMyChats, getRoomMessages, listUsers, createDM } from "../services/api.js";
import { FiLogOut, FiSearch } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Avatar from "../components/Avatar.jsx";
import EmojiBar from "../components/EmojiBar.jsx";

export default function ChatLayout({ me, socket }){
  const token=localStorage.getItem("token")||"";
  const [chats,setChats]=useState([]);
  const [users,setUsers]=useState([]);
  const [active,setActive]=useState(null);
  const [messages,setMessages]=useState([]);
  const [text,setText]=useState("");
  const [typingUsers,setTypingUsers]=useState({});
  const [online,setOnline]=useState([]);
  const [query,setQuery]=useState("");
  const [loadingMore,setLoadingMore]=useState(false);
  const [oldest,setOldest]=useState(null);

  useEffect(()=>{ (async()=>{
    const cs=await listMyChats(token).catch(()=>[]); setChats(cs);
    const us=await listUsers(token).catch(()=>[]); setUsers(us);
    if(cs.length) setActive(cs[0]);
  })(); },[]);

  useEffect(()=>{
    if(!socket) return;
    const onRecv=(msg)=>{ if(msg.roomId===active?._id) setMessages(m=>[...m,msg]); };
    const onTyping=({ roomId, userId, username, isTyping })=>{
      if(roomId!==active?._id || userId===me._id) return;
      setTypingUsers(prev=>({ ...prev, [username]: isTyping }));
      if(!isTyping) setTimeout(()=>setTypingUsers(prev=>{const p={...prev}; delete p[username]; return p;}),800);
    };
    const onOnline=(arr)=>setOnline(arr);
    const onReact=({ messageId, reactions })=> setMessages(ms=>ms.map(m=> m._id===messageId ? {...m, reactions} : m ));
    socket.on("receiveMessage",onRecv); socket.on("typing",onTyping); socket.on("onlineUsers",onOnline); socket.on("messageReaction",onReact);
    return ()=>{ socket.off("receiveMessage",onRecv); socket.off("typing",onTyping); socket.off("onlineUsers",onOnline); socket.off("messageReaction",onReact); };
  },[socket,active?._id]);

  useEffect(()=>{
    if(!active) return;
    socket.emit("joinChat",{roomId:active._id});
    (async()=>{
      const msgs=await getRoomMessages(token,active._id).catch(()=>[]);
      setMessages(msgs);
      if(msgs.length) setOldest(new Date(msgs[0].createdAt).toISOString());
    })();
    return ()=>{ socket.emit("leaveChat",{roomId:active._id}); setMessages([]); };
  },[active?._id]);

  const send=()=>{
    if(!text.trim()||!active) return;
    socket.emit("sendMessage",{roomId:active._id,text},(ack)=>{ if(ack?.ok) setText(""); else alert(ack?.error||"Failed"); });
  };
  const react=(messageId,emoji)=> socket.emit("reactMessage",{messageId,emoji});

  const startChat=async(uid)=>{ const r=await createDM(token,{otherUserId:uid}).catch(()=>null); if(r){ if(!chats.find(x=>x._id===r._id)) setChats(p=>[r,...p]); setActive(r); } };

  const filteredChats = chats.filter(c=>{
    const other = c.participants.find(p=>p._id!==me._id);
    return (other?.username||"").toLowerCase().includes(query.toLowerCase());
  });

  const loadOlder=async()=>{
    if(!active||!oldest) return; setLoadingMore(true);
    const older=await getRoomMessages(token,active._id,{before:oldest}).catch(()=>[]);
    if(older.length){ setMessages(prev=>[...older,...prev]); setOldest(new Date(older[0].createdAt).toISOString()); }
    setLoadingMore(false);
  };

  return (<div className="h-screen grid grid-cols-[340px_1fr] dark:text-white">
    <aside className="border-r border-black/5 dark:border-white/10 bg-gradient-to-b from-white to-emerald-50 dark:from-night dark:to-night relative">
      <div className="absolute inset-x-0 -top-16 h-40 bg-brand blur-3xl opacity-20 pointer-events-none"></div>
      <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-white/50 dark:bg-white/5 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-brand shadow-glow"></div>
          <div>
            <div className="text-lg font-bold">Couple chat</div>
            <div className="text-xs text-gray-500">Hi, {me.username}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle/>
          <button onClick={()=>{ localStorage.removeItem('token'); location.href='/login'; }} className="px-3 py-2 rounded-2xl border border-white/20 bg-white/40 dark:bg-white/5 hover:scale-105 transition">Logout</button>
        </div>
      </div>

      <div className="p-3">
        <div className="text-xs uppercase text-gray-500 mb-2">People</div>
        <div className="flex gap-2">
          {users.filter(u=>u._id!==me._id).map(u=>(
            <button key={u._id} onClick={()=>startChat(u._id)} className="flex flex-col items-center gap-1 group">
              <div className="p-[2px] rounded-full bg-brand/60 shadow-glow group-hover:scale-105 transition">
                <div className="bg-white dark:bg-night rounded-full p-1"><Avatar name={u.username} size={56}/></div>
              </div>
              <div className="text-xs w-16 truncate">{u.username}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="px-3">
        <div className="relative mb-3">
          <FiSearch className="absolute left-3 top-3 text-gray-400"/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search contacts…" className="w-full pl-9 pr-3 py-2 rounded-2xl border bg-white/70 dark:bg-white/10 dark:border-white/10"/>
        </div>
        <div className="px-1 text-xs uppercase text-gray-500">Recent chats</div>
        <ul className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-360px)]">
          {filteredChats.map(r=>{
            const other = r.participants.find(p=>p._id!==me._id) || { username:"Unknown" };
            return (
              <li key={r._id}>
                <button onClick={()=>setActive(r)} className={`w-full text-left px-3 py-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 ${active?._id===r._id?"bg-black/5 dark:bg-white/10":""}`}>
                  <div className="flex items-center gap-2">
                    <Avatar name={other.username}/>
                    <div>
                      <div className="font-medium">{other.username}</div>
                      <div className="text-xs text-gray-500">Direct chat</div>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>

    <main className="flex flex-col bg-gradient-to-br from-white to-emerald-50 dark:from-night dark:to-night">
      <div className="px-4 py-3 border-b border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur sticky top-0">
        <div className="font-semibold">
          {active ? (active.participants.find(p=>p._id!==me._id)?.username || "Chat") : "—"}
        </div>
        <div className="text-xs text-gray-500">
          {Object.keys(typingUsers).length>0 ? `${Object.keys(typingUsers).join(", ")} typing…` : "\u00A0"}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="flex justify-center">
          <button onClick={loadOlder} className="text-xs px-3 py-1 border rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            {loadingMore?"Loading…":"Load older messages"}
          </button>
        </div>

        {messages.map(m=>(
          <div key={m._id} className={`group relative flex ${m.senderId===me._id?"justify-end":"justify-start"}`}>
            <div className={`px-4 py-2 rounded-3xl shadow-soft max-w-[75%] ${m.senderId===me._id
              ?"bg-brand/90 text-black border border-brand/60 shadow-glow"
              :"bg-white/90 dark:bg-white/10 border border-black/5 dark:border-white/10"}`}>
              <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
              <div className="text-[10px] opacity-70 mt-1">{dayjs(m.createdAt||Date.now()).format("HH:mm")}</div>
              {m.reactions?.length>0 && (
                <div className="mt-1 flex gap-1 flex-wrap">
                  {Object.entries(m.reactions.reduce((acc,r)=>{const k=r.emoji; acc[k]=(acc[k]||0)+1; return acc; },{}))
                    .map(([emoji,count])=>(<span key={emoji} className="text-xs px-2 py-0.5 rounded-full bg-white/70 dark:bg-white/10 border border-black/5 dark:border-white/10">{emoji} {count}</span>))}
                </div>
              )}
            </div>
            <div className={`absolute ${m.senderId===me._id?"left-0":"right-0"} -translate-y-1/2 top-1/2 opacity-0 group-hover:opacity-100 transition`}>
              <EmojiBar onPick={(e)=>react(m._id,e)}/>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur flex gap-2">
        <input value={text} onChange={e=>{setText(e.target.value); if(active) socket.emit("typing",{roomId:active._id,isTyping:!!e.target.value});}} placeholder="Message…" className="flex-1 border rounded-2xl px-4 py-3 bg-white/80 dark:bg-white/10 dark:border-white/10" onKeyDown={e=>{ if(e.key==="Enter") { socket.emit("typing",{roomId:active._id,isTyping:false}); send(); } }} />
        <button onClick={()=>{ socket.emit("typing",{roomId:active._id,isTyping:false}); send(); }} className="px-4 rounded-2xl bg-brand hover:bg-brand/90 text-black shadow-glow flex items-center gap-2"><IoSend/> Send</button>
      </div>
    </main>
  </div>);
}
