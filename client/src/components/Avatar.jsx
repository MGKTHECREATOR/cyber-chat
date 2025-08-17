import React from "react";
export default function Avatar({ name, size=44 }){
  const initials = name?.split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase() || "?";
  const style = { width:size, height:size };
  return (
    <div className="p-[2px] rounded-full bg-brand/60 shadow-glow" style={{display:"inline-block"}}>
      <div className="rounded-full bg-white dark:bg-night grid place-items-center text-sm text-black dark:text-white" style={style}>
        <span className="font-semibold">{initials}</span>
      </div>
    </div>
  );
}
