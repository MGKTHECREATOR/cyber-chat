import React from "react";
const EMOJIS = ["👍","❤️","😂","🔥","😮","🎉"];
export default function EmojiBar({ onPick }){
  return (
    <div className="flex gap-2 bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/10 rounded-full px-2 py-1 shadow-soft">
      {EMOJIS.map(e=> <button key={e} onClick={()=>onPick(e)} className="hover:scale-110 transition">{e}</button>)}
    </div>
  );
}
