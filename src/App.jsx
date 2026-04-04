import { useState, useEffect, useCallback } from "react";

// ── JSONBIN CONFIG ─────────────────────────────────────────────────────────────
// 1. Go to jsonbin.io and create a free account
// 2. Click "New Bin" — create one bin and copy the BIN ID (looks like 64abc123...)
// 3. Go to API Keys tab — copy your Master Key (starts with $2b$...)
// 4. Paste both below:
const JSONBIN_BIN_ID  = "69d136b6aaba882197c49d9f";
const JSONBIN_API_KEY = "$2a$10$gaQ/znDxjqdCxyU694NX0u5dPY50G9ehO7rTBbZMFrUgPlgpn8xlW";
const JSONBIN_URL     = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

const ADMIN_PASSWORD = "golf2026";

// ── LOGOS (base64 from PDF) ──────────────────────────────────────────────────
const LOGO_MAIN   = "";
const LOGO_SHIELD = "";

// ── REAL DATA FROM PDF ──────────────────────────────────────────────────────
const PLAYERS = [
  { id:"allan",  name:"Allan",  lastName:"Maymin",    team:"Shields", hcp:{ thu:13, fri:17, sat:16 }, tees:"IV" },
  { id:"rahim",  name:"Rahim",  lastName:"Ibrahim",   team:"Shields", hcp:{ thu:17, fri:21, sat:20 }, tees:"IV" },
  { id:"silva",  name:"Silva",  lastName:"",          team:"Shields", hcp:{ thu:16, fri:20, sat:19 }, tees:"IV" },
  { id:"travis", name:"Travis", lastName:"Goldammer", team:"Shields", hcp:{ thu:16, fri:20, sat:19 }, tees:"IV" },
  { id:"geraud", name:"Geraud", lastName:"Gonzales",  team:"Swords",  hcp:{ thu:11, fri:15, sat:14 }, tees:"IV" },
  { id:"sean",   name:"Sean",   lastName:"Gatz",      team:"Swords",  hcp:{ thu:3,  fri:5,  sat:4  }, tees:"III/Blue" },
  { id:"luke",   name:"Luke",   lastName:"Booth",     team:"Swords",  hcp:{ thu:6,  fri:11, sat:10 }, tees:"IV" },
  { id:"marco",  name:"Marco",  lastName:"Ramirez",   team:"Swords",  hcp:{ thu:17, fri:21, sat:20 }, tees:"IV" },
];

const INITIAL_MATCHES = [
  // THURSDAY — 4 pts morning 1v1, 1 pt afternoon scramble
  { id:"thu1", day:"Thursday", label:"Match 1",    format:"1v1 Match Play Net", course:"PGA Frisco Fields Ranch East",
    sideA:["rahim"], sideB:["geraud"], points:1, status:"upcoming", grossA:"", grossB:"", netA:"", netB:"", pointsA:0, pointsB:0 },
  { id:"thu2", day:"Thursday", label:"Match 2",    format:"1v1 Match Play Net", course:"PGA Frisco Fields Ranch East",
    sideA:["allan"], sideB:["sean"],   points:1, status:"upcoming", grossA:"", grossB:"", netA:"", netB:"", pointsA:0, pointsB:0 },
  { id:"thu3", day:"Thursday", label:"Match 3",    format:"1v1 Match Play Net", course:"PGA Frisco Fields Ranch East",
    sideA:["silva"], sideB:["luke"],   points:1, status:"upcoming", grossA:"", grossB:"", netA:"", netB:"", pointsA:0, pointsB:0 },
  { id:"thu4", day:"Thursday", label:"Match 4",    format:"1v1 Match Play Net", course:"PGA Frisco Fields Ranch East",
    sideA:["travis"],sideB:["marco"],  points:1, status:"upcoming", grossA:"", grossB:"", netA:"", netB:"", pointsA:0, pointsB:0 },
  { id:"thu5", day:"Thursday", label:"Team Scramble", format:"4v4 Scramble Gross", course:"The Swing",
    sideA:["rahim","allan","silva","travis"], sideB:["geraud","sean","luke","marco"],
    points:1, status:"upcoming", grossA:"", grossB:"", netA:"", netB:"", pointsA:0, pointsB:0 },
  // FRIDAY — 2 pts morning best ball, 2 pts afternoon pods
  { id:"fri1", day:"Friday", label:"Morning Match 1", format:"2v2 Best Ball Net", course:"SBCC Members Course",
    sideA:["",""], sideB:["",""], points:1, status:"upcoming", grossA:"", grossB:"", netA:"", netB:"", pointsA:0, pointsB:0 },
  { id:"fri2", day:"Friday", label:"Morning Match 2", format:"2v2 Best Ball Net", course:"SBCC Members Course",
    sideA:["",""], sideB:["",""], points:1, status:"upcoming", grossA:"", grossB:"", netA:"", netB:"", pointsA:0, pointsB:0 },
  { id:"fri3", day:"Friday", label:"Pod A", format:"Scramble Gross", course:"SBCC Fazio",
    sideA:["",""], sideB:["",""], points:1, status:"upcoming", grossA:"", grossB:"", netA:"", netB:"", pointsA:0, pointsB:0 },
  { id:"fri4", day:"Friday", label:"Pod B", format:"Scramble Gross", course:"SBCC Fazio",
    sideA:["",""], sideB:["",""], points:0.5, status:"upcoming", grossA:"", grossB:"", netA:"", netB:"", pointsA:0, pointsB:0 },
  { id:"fri5", day:"Friday", label:"Pod C", format:"Scramble Gross", course:"SBCC Fazio",
    sideA:["",""], sideB:["",""], points:0.5, status:"upcoming", grossA:"", grossB:"", netA:"", netB:"", pointsA:0, pointsB:0 },
  { id:"fri6", day:"Friday", label:"Pod D", format:"Scramble Gross", course:"SBCC Fazio",
    sideA:["",""], sideB:["",""], points:1, status:"upcoming", grossA:"", grossB:"", netA:"", netB:"", pointsA:0, pointsB:0 },
  // SATURDAY — 4 pts morning 1v1, 4 pts afternoon alt/scramble
  { id:"sat1", day:"Saturday", label:"Morning Match 1", format:"1v1 Net Stroke Play", course:"SBCC Fazio",
    sideA:[""], sideB:[""], points:1, status:"upcoming", grossA:"", grossB:"", netA:"", netB:"", pointsA:0, pointsB:0 },
  { id:"sat2", day:"Saturday", label:"Morning Match 2", format:"1v1 Net Stroke Play", course:"SBCC Fazio",
    sideA:[""], sideB:[""], points:1, status:"upcoming", grossA:"", grossB:"", netA:"", netB:"", pointsA:0, pointsB:0 },
  { id:"sat3", day:"Saturday", label:"Morning Match 3", format:"1v1 Net Stroke Play", course:"SBCC Fazio",
    sideA:[""], sideB:[""], points:1, status:"upcoming", grossA:"", grossB:"", netA:"", netB:"", pointsA:0, pointsB:0 },
  { id:"sat4", day:"Saturday", label:"Morning Match 4", format:"1v1 Net Stroke Play", course:"SBCC Fazio",
    sideA:[""], sideB:[""], points:1, status:"upcoming", grossA:"", grossB:"", netA:"", netB:"", pointsA:0, pointsB:0 },
  { id:"sat5", day:"Saturday", label:"Afternoon Match 1", format:"2v2 Alt Shot + Scramble Net", course:"SBCC Members",
    sideA:["",""], sideB:["",""], points:2, status:"upcoming", grossA:"", grossB:"", netA:"", netB:"", pointsA:0, pointsB:0 },
  { id:"sat6", day:"Saturday", label:"Afternoon Match 2", format:"2v2 Alt Shot + Scramble Net", course:"SBCC Members",
    sideA:["",""], sideB:["",""], points:2, status:"upcoming", grossA:"", grossB:"", netA:"", netB:"", pointsA:0, pointsB:0 },
];

const INITIAL_AWARDS = {
  bestShot:"", worstBeat:"", puttOfDay:"", cartPathMVP:"", hangoverHero:"",
  closestPin:"", longDrive:"", lowGross:"", lowNet:"", moneyLeader:"",
};

const INITIAL_BETS = [
  { id:1, desc:"Rahim beats Geraud net on Thursday", amount:"$20", settled:false, winner:"", involvedA:"rahim", involvedB:"geraud" },
  { id:2, desc:"Team Shields wins the overall trip",  amount:"$50", settled:false, winner:"", involvedA:"shields_team", involvedB:"swords_team" },
  { id:3, desc:"Silva shoots under 80 gross",         amount:"$10", settled:false, winner:"", involvedA:"silva", involvedB:"" },
  { id:4, desc:"Marco 3-putts on 18 any day",         amount:"$10", settled:false, winner:"", involvedA:"marco", involvedB:"" },
  { id:5, desc:"Sean wins low net overall",            amount:"$25", settled:false, winner:"", involvedA:"sean",  involvedB:"" },
];

const QUOTES = [
  "The match is never over until the last putt drops.",
  "Golf is a good walk spoiled — but a great story told.",
  "Every shot makes somebody happy.",
  "The most important shot in golf is the next one.",
  "Golf is the closest game to the game we call life.",
  "A bad day of golf still beats a good day at work.",
];

const SCHEDULE = [
  {
    date:"Wed, May 20", day:"Arrival Day", emoji:"✈️",
    items:[
      "Practice round — SBCC Members Course (~1:30/2 PM)",
      "Dinner at the Clubhouse (Casual, dress appropriately)",
    ]
  },
  {
    date:"Thu, May 21", day:"Day 1 — Match Play", emoji:"⚔️",
    items:[
      "Morning: PGA Frisco Fields Ranch East · 1v1 Net Match Play (4 pts)",
      "Group 1: Rahim v Geraud · Allan v Sean",
      "Group 2: Silva v Luke · Travis v Marco",
      "Afternoon: The Swing · 4v4 Scramble Gross (1 pt)",
      "Dinner: PGA Frisco Ice House (Casual)",
    ]
  },
  {
    date:"Fri, May 22", day:"Day 2 — Stroke Play", emoji:"🏌️",
    items:[
      "Gym & range open 5:30 AM · Cold plunge / sauna available",
      "Morning 9 AM: SBCC Members · 2v2 Best Ball Net (2 pts)",
      "Afternoon 2:20 PM: SBCC Fazio · 2v2v2v2 Scramble Gross (2 pts)",
      "Dinner: La Hacienda Ranch, Frisco · 7 PM (Very Casual)",
    ]
  },
  {
    date:"Sat, May 23", day:"Day 3 — Final Day", emoji:"🏆",
    items:[
      "Gym & range open 5:30 AM · Stretch coach 7:30–8:30 AM (tip him!)",
      "Morning 9 AM: SBCC Fazio · 1v1 Net Stroke Play (4 pts)",
      "Afternoon 2:20 PM: SBCC Members · 2v2 Alt Shot + Scramble Net (4 pts)",
      "Front 9: Modified Alt Shot NET · Back 9: Scramble NET",
      "Closing Dinner at the Clubhouse",
    ]
  },
];

const RULES_BY_DAY = {
  Thursday: [
    { title:"Format", body:"1v1 Match Play — net per hole vs direct opponent. No rollovers; halved if tied NET." },
    { title:"Course", body:"PGA Frisco Fields Ranch East · Everyone IV tees · Sean: III tees" },
    { title:"Max Score", body:"Double par NET per hole (Par 3 = 6, Par 4 = 8, Par 5 = 10). Pick up after." },
    { title:"OB / Penalty", body:"All OB and penalty areas = 1 stroke penalty." },
    { title:"Gimmes", body:"Within putter grip or at opponent's discretion. Be reasonable." },
    { title:"Extras", body:"Breakfast ball · 1 mulligan per nine · 1 throw per round. No throws on greens. No mulligan on throws." },
    { title:"Caddies", body:"Walking course — wear comfortable shoes and hydrate. Tip $40–$60 per bag." },
    { title:"Afternoon", body:"The Swing · 4v4 Scramble Gross · 1 team throw." },
  ],
  Friday: [
    { title:"Morning Format", body:"2v2 Best Ball Net — each team takes the better NET score of the two players. Each player MUST contribute 8 holes." },
    { title:"Course", body:"SBCC Members Course · White tees · Sean: Blue tees" },
    { title:"Max Score", body:"Double par NET per hole. Pick up after." },
    { title:"OB / Penalty", body:"All OB and penalty areas = 1 stroke penalty." },
    { title:"Gimmes", body:"Within putter grip or at opponent's discretion." },
    { title:"Extras", body:"Breakfast ball · 1 mulligan per nine · 1 throw per round." },
    { title:"Afternoon Format", body:"SBCC Fazio · 2v2v2v2 Scramble Gross · Top team 1 pt · 2nd & 3rd = 0.5 pts." },
    { title:"Afternoon Extras", body:"Team gets 1 mulligan per nine · 1 team throw · White tees · Sean: Black tees." },
    { title:"Caddies", body:"Tip $40 per bag." },
  ],
  Saturday: [
    { title:"Morning Format", body:"1v1 Net Stroke Play — net strokes vs direct opponent over 18 holes." },
    { title:"Course", body:"SBCC Fazio · White tees · Sean: Blue tees" },
    { title:"Max Score", body:"Double par NET per hole. Pick up after." },
    { title:"Afternoon Format", body:"2v2 Modified Alt Shot + Scramble NET. Front 9: Alt Shot NET (Player A 35% / Player B 25%). Back 9: Scramble NET (Player A 35% / Player B 25%)." },
    { title:"Alt Shot Rules", body:"Both players hit drives. Choose best drive. The OTHER player hits next. Alternate until holed." },
    { title:"Afternoon Course", body:"SBCC Members Course · White tees · Sean: Black tees" },
    { title:"Extras", body:"Per player: breakfast ball · 1 mulligan per nine · 1 throw per round. No throws on greens." },
    { title:"Caddies", body:"Tip $40 per bag." },
  ],
};

// ── SHARED SYNC STORE ─────────────────────────────────────────────────────────
let _store = {};
let _storeLoaded = false;
const _listeners = [];
const JSONBIN_CONFIGURED = JSONBIN_BIN_ID !== "REPLACE_WITH_YOUR_BIN_ID";

async function loadStore() {
  if (!JSONBIN_CONFIGURED) {
    _storeLoaded = true;
    _listeners.forEach(fn => fn());
    return;
  }
  try {
    const res = await fetch(JSONBIN_URL + "/latest", {
      headers: { "X-Master-Key": JSONBIN_API_KEY }
    });
    if (res.ok) {
      const data = await res.json();
      _store = data.record || {};
    }
  } catch(e) { console.error("JSONBin load error:", e); }
  _storeLoaded = true;
  _listeners.forEach(fn => fn());
}

async function saveStore() {
  if (!JSONBIN_CONFIGURED) return;
  try {
    await fetch(JSONBIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_API_KEY,
        "X-Bin-Versioning": "false",
      },
      body: JSON.stringify(_store),
    });
  } catch(e) { console.error("JSONBin save error:", e); }
}

loadStore();
setInterval(() => { if (JSONBIN_CONFIGURED) loadStore(); }, 10000);

function useStorage(key, fallback) {
  const [val, setVal]       = useState(fallback);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const sync = () => {
      setVal(_store[key] !== undefined ? _store[key] : fallback);
      setLoaded(true);
    };
    _listeners.push(sync);
    if (_storeLoaded) sync();
    // Always unblock after 3 seconds no matter what
    const timer = setTimeout(() => setLoaded(true), 3000);
    return () => {
      const i = _listeners.indexOf(sync);
      if (i > -1) _listeners.splice(i, 1);
      clearTimeout(timer);
    };
  }, [key]);

  const save = useCallback(async (v) => {
    setVal(v);
    _store[key] = v;
    await saveStore();
  }, [key]);

  return [val, save, loaded];
}
// ── SMALL COMPONENTS ─────────────────────────────────────────────────────────
const Badge = ({ children, color="#b45309" }) => (
  <span style={{ background:color+"18", color, border:`1px solid ${color}40`, borderRadius:4, padding:"2px 8px", fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase" }}>
    {children}
  </span>
);

const Pill = ({ children, active, onClick }) => (
  <button onClick={onClick} style={{
    padding:"6px 14px", borderRadius:20, border:`1px solid ${active?"#b45309":"#d1d5db"}`,
    cursor:"pointer", fontSize:11, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase", transition:"all .15s",
    background:active?"#b45309":"#fff", color:active?"#fff":"#6b7280",
  }}>{children}</button>
);

const Inp = ({ value, onChange, placeholder, style={} }) => (
  <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{ background:"#fff", border:"1px solid #d1d5db", borderRadius:6, color:"#111827", padding:"7px 10px", fontSize:13, width:"100%", ...style }} />
);

const Sel = ({ value, onChange, options, style={} }) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{ background:"#fff", border:"1px solid #d1d5db", borderRadius:6, color:"#111827", padding:"7px 10px", fontSize:13, width:"100%", ...style }}>
    {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ── MASTERS LEADERBOARD ──────────────────────────────────────────────────────
function MastersBoard({ matches, heater, lastUpdated, isAdmin, onMatchChange }) {
  const [editOpen, setEditOpen] = useState(false);

  const shields = matches.reduce((a,m)=>a+Number(m.pointsA||0),0);
  const swords  = matches.reduce((a,m)=>a+Number(m.pointsB||0),0);
  const diff    = shields - swords;
  const liveNow = matches.filter(m=>m.status==="live");
  const done    = matches.filter(m=>m.status==="complete").length;

  const days = ["Thursday","Friday","Saturday"];
  const dayPts = days.map(day => {
    const dm = matches.filter(m=>m.day===day);
    return {
      day, short: day.slice(0,3).toUpperCase(),
      S: dm.reduce((a,m)=>a+Number(m.pointsA||0),0),
      W: dm.reduce((a,m)=>a+Number(m.pointsB||0),0),
      live: dm.some(m=>m.status==="live"),
    };
  });

  const totalPossible = 17;
  const clinchS = swords  + (totalPossible - shields - swords) < 9;
  const clinchW = shields + (totalPossible - shields - swords) < 9;

  const nameOf = id => {
    const p = PLAYERS.find(p=>p.id===id);
    return p ? p.name : (id||"TBD");
  };

  const ScoreInput = ({ mid, field, color }) => {
    const m = matches.find(x=>x.id===mid);
    return (
      <input
        type="number"
        value={m?.[field] ?? ""}
        onChange={e => onMatchChange(mid, field, e.target.value === "" ? "" : Number(e.target.value))}
        style={{
          width:38, background:"#0f2d22", border:`1px solid ${color}55`,
          borderRadius:4, color, padding:"3px 4px", fontSize:13,
          fontWeight:700, textAlign:"center",
        }}
      />
    );
  };

  return (
    <div style={{ marginBottom:20, fontFamily:"'Georgia','Times New Roman',serif" }}>
      <style>{`
        @keyframes liveDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.7)} }
        @keyframes scoreIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── TOP BANNER ── */}
      <div style={{
        background:"linear-gradient(180deg,#1b4332 0%,#0f2d22 50%,#091f18 100%)",
        borderRadius:"16px 16px 0 0",
        borderTop:"4px solid #d4a017",
        borderLeft:"1px solid #2d6a4f", borderRight:"1px solid #2d6a4f",
        padding:"16px 20px 12px",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 18px,rgba(255,255,255,.015) 18px,rgba(255,255,255,.015) 19px)", pointerEvents:"none" }} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"relative" }}>
          <div>
            <div style={{ color:"#d4a017", fontSize:8, letterSpacing:5, textTransform:"uppercase", fontWeight:700, marginBottom:3 }}>Golf Trip 2026 · Frisco + SBCC</div>
            <div style={{ color:"#f0e6c8", fontSize:20, fontWeight:700, letterSpacing:0.5, lineHeight:1.1 }}>Tournament</div>
            <div style={{ color:"#d4a017", fontSize:20, fontWeight:700, letterSpacing:0.5 }}>Leaderboard</div>
            <div style={{ color:"#6aad88", fontSize:10, marginTop:5, letterSpacing:1 }}>May 20–23, 2026 · {done}/{matches.length} complete</div>
          </div>
          <div style={{ textAlign:"right", display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5 }}>
            {liveNow.length > 0 && (
              <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"#c0392b", borderRadius:5, padding:"3px 9px" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#fff", animation:"liveDot 1.2s infinite" }} />
                <span style={{ color:"#fff", fontSize:9, fontWeight:800, letterSpacing:2 }}>LIVE</span>
              </div>
            )}
            {isAdmin && (
              <button onClick={()=>setEditOpen(v=>!v)} style={{
                background: editOpen ? "#d4a017" : "#1b4332",
                border:`1px solid ${editOpen?"#d4a017":"#2d6a4f"}`,
                borderRadius:6, padding:"4px 10px", color: editOpen?"#000":"#d4a017",
                fontSize:10, fontWeight:700, cursor:"pointer", letterSpacing:1,
              }}>
                {editOpen ? "✓ DONE" : "✏ EDIT"}
              </button>
            )}
            {lastUpdated && <div style={{ color:"#4a7a5a", fontSize:8, letterSpacing:1 }}>UPDATED {lastUpdated}</div>}
          </div>
        </div>
      </div>

      {/* ── COLUMN HEADERS ── */}
      <div style={{ background:"#0a1f14", borderLeft:"1px solid #2d6a4f", borderRight:"1px solid #2d6a4f", padding:"5px 20px", display:"grid", gridTemplateColumns:"28px 1fr 44px 44px 44px 48px" }}>
        {["","TEAM","THU","FRI","SAT","TOTAL"].map((h,i)=>(
          <div key={i} style={{ color:"#4a7a5a", fontSize:8, fontWeight:700, letterSpacing:2, textAlign:i===0||i===1?"left":"center", fontFamily:"'Georgia',serif" }}>{h}</div>
        ))}
      </div>

      {/* ── TEAM ROWS ── */}
      {[
        { id:"shields", name:"SHIELDS", sub:"Allan · Rahim · Silva · Travis", icon:"🛡", pts:shields, color:"#d4a017" },
        { id:"swords",  name:"SWORDS",  sub:"Geraud · Sean · Luke · Marco",   icon:"⚔️",  pts:swords,  color:"#7c6fcd" },
      ].map((team, ti) => {
        const isShields = team.id === "shields";
        const rowPts = dayPts.map(d => isShields ? d.S : d.W);
        const isWinning = isShields ? diff > 0 : diff < 0;
        const position = isShields ? (diff > 0 ? 1 : diff < 0 ? 2 : "T1") : (diff < 0 ? 1 : diff > 0 ? 2 : "T1");

        return (
          <div key={team.id} style={{
            background: isWinning
              ? `linear-gradient(90deg,${isShields?"#1e3d20":"#1a1a40"} 0%,#0d1f14 55%)`
              : "#0d1f14",
            borderLeft:"1px solid #2d6a4f", borderRight:"1px solid #2d6a4f",
            borderTop: ti===0 ? "none" : "1px solid #1a3a2a",
            transition:"background 0.6s",
          }}>
            <div style={{ display:"grid", gridTemplateColumns:"28px 1fr 44px 44px 44px 48px", alignItems:"center", padding:"15px 20px", gap:2 }}>
              <div style={{ color: isWinning ? "#d4a017" : "#2d6a4f", fontSize:13, fontWeight:700 }}>{position}</div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {isWinning && <div style={{ width:3, height:32, background:team.color, borderRadius:2, flexShrink:0 }} />}
                <div>
                  <div style={{ color:"#f0e6c8", fontSize:15, fontWeight:700, letterSpacing:1 }}>{team.name}</div>
                  <div style={{ color:team.color, fontSize:9, marginTop:1, letterSpacing:0.5 }}>{team.sub}</div>
                </div>
              </div>
              {rowPts.map((p, di) => (
                <div key={di} style={{ textAlign:"center", position:"relative" }}>
                  <div style={{ fontSize:18, fontWeight:700, color: p > 0 ? team.color : "#1a3a2a", animation:"scoreIn .4s ease" }}>
                    {p > 0 ? p : "—"}
                  </div>
                  {dayPts[di].live && <div style={{ position:"absolute", top:0, right:6, width:5, height:5, borderRadius:"50%", background:"#c0392b", animation:"liveDot 1s infinite" }} />}
                </div>
              ))}
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:26, fontWeight:700, color: isWinning ? team.color : "#f0e6c8", lineHeight:1 }}>{team.pts}</div>
              </div>
            </div>
          </div>
        );
      })}

      {/* ── PROGRESS BAR ── */}
      <div style={{ background:"#091812", borderLeft:"1px solid #2d6a4f", borderRight:"1px solid #2d6a4f", padding:"10px 20px 8px" }}>
        <div style={{ fontSize:8, color:"#3d6e52", letterSpacing:2, marginBottom:6 }}>POINTS RACE · 17 TOTAL · FIRST TO 9 WINS</div>
        <div style={{ position:"relative", height:10, background:"#0f2d22", borderRadius:5, overflow:"hidden" }}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:`${(shields/17)*100}%`, background:"linear-gradient(90deg,#d4a017,#f0c040)", borderRadius:"5px 0 0 5px", transition:"width 0.8s cubic-bezier(.4,0,.2,1)" }} />
          <div style={{ position:"absolute", right:0, top:0, bottom:0, width:`${(swords/17)*100}%`, background:"linear-gradient(270deg,#7c6fcd,#a89ede)", borderRadius:"0 5px 5px 0", transition:"width 0.8s cubic-bezier(.4,0,.2,1)" }} />
          <div style={{ position:"absolute", left:"50%", top:0, bottom:0, width:1, background:"#2d6a4f" }} />
          <div style={{ position:"absolute", left:`${(9/17)*100}%`, top:-2, bottom:-2, width:2, background:"#c0392b", opacity:.7 }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
          <span style={{ fontSize:9, color:"#d4a017", fontWeight:700 }}>🛡️ SHIELDS {shields}</span>
          <span style={{ fontSize:8, color:"#3d6e52" }}>{Math.max(0,9-Math.max(shields,swords))} to clinch</span>
          <span style={{ fontSize:9, color:"#7c6fcd", fontWeight:700 }}>SWORDS {swords} ⚔️</span>
        </div>
      </div>

      {/* ── STATUS FOOTER ── */}
      <div style={{
        background:"linear-gradient(180deg,#091812,#061008)",
        borderLeft:"1px solid #2d6a4f", borderRight:"1px solid #2d6a4f",
        borderBottom: editOpen ? "none" : "1px solid #2d6a4f",
        borderRadius: editOpen ? "0" : "0 0 16px 16px",
        padding:"10px 20px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
      }}>
        <div>
          {diff === 0 && <span style={{ color:"#d4a017", fontSize:13, fontWeight:700 }}>🤝 All Square</span>}
          {diff > 0  && <span style={{ color:"#d4a017", fontSize:13, fontWeight:700 }}>Shields lead by {diff}</span>}
          {diff < 0  && <span style={{ color:"#7c6fcd", fontSize:13, fontWeight:700 }}>Swords lead by {Math.abs(diff)}</span>}
          {heater.streak > 1 && <span style={{ marginLeft:10, color:"#e67e22", fontSize:11 }}>🔥 {heater.team} {heater.streak}-match run</span>}
        </div>
        <div style={{ textAlign:"right" }}>
          {clinchS && <div style={{ color:"#27ae60", fontSize:10, fontWeight:700 }}>✓ Shields clinch</div>}
          {clinchW && <div style={{ color:"#7c6fcd", fontSize:10, fontWeight:700 }}>✓ Swords clinch</div>}
          <div style={{ color:"#3d6e52", fontSize:9 }}>{Math.max(0,17-shields-swords)} pts remain</div>
        </div>
      </div>

      {/* ── ADMIN SCORE EDITOR ── */}
      {editOpen && (
        <div style={{
          background:"#061008",
          border:"1px solid #2d6a4f", borderTop:"1px solid #d4a01733",
          borderRadius:"0 0 16px 16px",
          padding:"12px 16px 16px",
        }}>
          <div style={{ fontSize:8, color:"#d4a017", letterSpacing:3, fontWeight:700, marginBottom:12 }}>✏ EDIT MATCH POINTS</div>
          {days.map(day => {
            const dm = matches.filter(m=>m.day===day);
            return (
              <div key={day} style={{ marginBottom:14 }}>
                <div style={{ fontSize:9, color:"#4a7a5a", letterSpacing:2, fontWeight:700, marginBottom:8, paddingBottom:4, borderBottom:"1px solid #1a3a2a" }}>
                  {day.toUpperCase()}
                </div>
                {dm.map(m => {
                  const sideALabel = m.sideA.map(nameOf).filter(Boolean).join(" + ") || "Shields";
                  const sideBLabel = m.sideB.map(nameOf).filter(Boolean).join(" + ") || "Swords";
                  return (
                    <div key={m.id} style={{ marginBottom:8, background:"#0a1f14", borderRadius:8, padding:"8px 10px", border:"1px solid #1a3a2a" }}>
                      <div style={{ fontSize:10, color:"#6aad88", marginBottom:6, fontWeight:600 }}>{m.label} · <span style={{ color:"#4a7a5a", fontWeight:400 }}>{m.format}</span></div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", gap:6 }}>
                        {/* Shields side */}
                        <div>
                          <div style={{ fontSize:9, color:"#d4a017", marginBottom:3 }}>🛡️ {sideALabel}</div>
                          <div style={{ display:"flex", gap:4 }}>
                            {[["Pts","pointsA","#d4a017"],["Net","netA","#6aad88"],["Gross","grossA","#4a7a5a"]].map(([lbl,fld,col])=>(
                              <div key={fld} style={{ textAlign:"center" }}>
                                <div style={{ fontSize:7, color:"#3d6e52", marginBottom:2 }}>{lbl}</div>
                                <ScoreInput mid={m.id} field={fld} color={col} />
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Status dot */}
                        <div style={{ textAlign:"center" }}>
                          <select value={m.status} onChange={e=>onMatchChange(m.id,"status",e.target.value)}
                            style={{ background:"#061008", border:"1px solid #2d6a4f", borderRadius:4, color:"#6aad88", padding:"2px 4px", fontSize:9, cursor:"pointer" }}>
                            <option value="upcoming">⬜ Up</option>
                            <option value="live">🟢 Live</option>
                            <option value="complete">✓ Done</option>
                          </select>
                        </div>
                        {/* Swords side */}
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:9, color:"#7c6fcd", marginBottom:3 }}>{sideBLabel} ⚔️</div>
                          <div style={{ display:"flex", gap:4, justifyContent:"flex-end" }}>
                            {[["Gross","grossB","#4a7a5a"],["Net","netB","#6aad88"],["Pts","pointsB","#7c6fcd"]].map(([lbl,fld,col])=>(
                              <div key={fld} style={{ textAlign:"center" }}>
                                <div style={{ fontSize:7, color:"#3d6e52", marginBottom:2 }}>{lbl}</div>
                                <ScoreInput mid={m.id} field={fld} color={col} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* ── LIVE TICKER ── */}
      {liveNow.length > 0 && (
        <div style={{ marginTop:8, background:"#1a0505", border:"1px solid #c0392b44", borderRadius:8, padding:"8px 14px" }}>
          <div style={{ color:"#c0392b", fontSize:8, letterSpacing:2, marginBottom:5, fontWeight:700 }}>● IN PROGRESS</div>
          {liveNow.map(m=>(
            <div key={m.id} style={{ display:"flex", justifyContent:"space-between", padding:"3px 0", fontSize:12, color:"#f0e6c8", borderBottom:"1px solid #3a0505" }}>
              <span>{m.label} · {m.format}</span>
              <span style={{ color:"#d4a017" }}>{m.netA||"—"} · {m.netB||"—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ── MATCH CARD ───────────────────────────────────────────────────────────────
const PLAYER_OPTIONS = [
  {value:"",label:"— TBD —"},
  ...PLAYERS.filter(p=>p.team==="Shields").map(p=>({value:p.id,label:`🛡️ ${p.name}`})),
  ...PLAYERS.filter(p=>p.team==="Swords").map(p=>({value:p.id,label:`⚔️ ${p.name}`})),
];

function MatchCard({ match, isAdmin, onChange }) {
  const nameOf = id => PLAYERS.find(p=>p.id===id)?.name || (id ? id : "TBD");
  const sideANames = match.sideA.map(nameOf).filter(Boolean).join(" + ") || "TBD";
  const sideBNames = match.sideB.map(nameOf).filter(Boolean).join(" + ") || "TBD";
  const STATUS_DOT = { upcoming:"#9ca3af", live:"#10b981", complete:"#3b82f6" };
  const dot = STATUS_DOT[match.status] || "#9ca3af";

  const PlayerSlot = ({ idx, side }) => {
    const key = side === "A" ? "sideA" : "sideB";
    const arr = match[key];
    const val = arr[idx] || "";
    const color = side === "A" ? "#b45309" : "#4f46e5";
    return (
      <select value={val} onChange={e => {
        const newArr = [...arr];
        newArr[idx] = e.target.value;
        onChange(match.id, key, newArr);
      }} style={{ background:"#fff", border:`1px solid ${color}44`, borderRadius:6, color, padding:"5px 8px", fontSize:12, fontWeight:700, width:"100%", cursor:"pointer" }}>
        {PLAYER_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  };

  return (
    <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", marginBottom:10, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
      <div style={{ background:"#f9fafb", borderBottom:"1px solid #f3f4f6", padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <span style={{ fontWeight:700, color:"#111827", fontSize:13 }}>{match.label}</span>
          <span style={{ marginLeft:8, fontSize:10, color:"#9ca3af" }}>{match.format}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          {match.course && <span style={{ fontSize:9, color:"#9ca3af", marginRight:4 }}>{match.course}</span>}
          <div style={{ width:6, height:6, borderRadius:"50%", background:dot }} />
          <span style={{ fontSize:10, color:dot, textTransform:"uppercase", fontWeight:700 }}>{match.status}</span>
        </div>
      </div>
      <div style={{ padding:"12px 14px" }}>
        {isAdmin ? (
          <div style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:9, color:"#b45309", letterSpacing:1, fontWeight:700, marginBottom:5 }}>🛡️ SHIELDS</div>
              {match.sideA.map((_,i) => <div key={i} style={{ marginBottom:4 }}><PlayerSlot idx={i} side="A" /></div>)}
            </div>
            <div style={{ color:"#d1d5db", fontWeight:700, fontSize:13, padding:"18px 4px 0" }}>vs</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:9, color:"#4f46e5", letterSpacing:1, fontWeight:700, marginBottom:5 }}>⚔️ SWORDS</div>
              {match.sideB.map((_,i) => <div key={i} style={{ marginBottom:4 }}><PlayerSlot idx={i} side="B" /></div>)}
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:"#b45309", fontWeight:700 }}>{sideANames}</div>
              <div style={{ fontSize:10, color:"#9ca3af" }}>🛡️ Shields</div>
            </div>
            <div style={{ color:"#d1d5db", fontWeight:700, fontSize:13, padding:"0 10px" }}>vs</div>
            <div style={{ flex:1, textAlign:"right" }}>
              <div style={{ fontSize:13, color:"#4f46e5", fontWeight:700 }}>{sideBNames}</div>
              <div style={{ fontSize:10, color:"#9ca3af" }}>⚔️ Swords</div>
            </div>
          </div>
        )}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
          {[["Gross","grossA","grossB"],["Net","netA","netB"],["Pts","pointsA","pointsB"]].map(([lbl,kA,kB])=>(
            <div key={lbl} style={{ background:"#f9fafb", borderRadius:8, padding:"7px 6px", textAlign:"center", border:"1px solid #f3f4f6" }}>
              <div style={{ color:"#9ca3af", fontSize:9, marginBottom:3, letterSpacing:1 }}>{lbl}</div>
              {isAdmin ? (
                <div style={{ display:"flex", gap:3 }}>
                  <input value={match[kA]} onChange={e=>onChange(match.id,kA,e.target.value)}
                    style={{ width:"100%", background:"#fff", border:"1px solid #d1d5db", borderRadius:4, color:"#b45309", padding:"3px 2px", fontSize:12, textAlign:"center", fontWeight:700 }} />
                  <input value={match[kB]} onChange={e=>onChange(match.id,kB,e.target.value)}
                    style={{ width:"100%", background:"#fff", border:"1px solid #d1d5db", borderRadius:4, color:"#4f46e5", padding:"3px 2px", fontSize:12, textAlign:"center", fontWeight:700 }} />
                </div>
              ) : (
                <div style={{ display:"flex", gap:6, justifyContent:"center", fontSize:13, fontWeight:700 }}>
                  <span style={{ color:"#b45309" }}>{match[kA]||"—"}</span>
                  <span style={{ color:"#e5e7eb" }}>·</span>
                  <span style={{ color:"#4f46e5" }}>{match[kB]||"—"}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        {isAdmin && (
          <div style={{ marginTop:8 }}>
            <Sel value={match.status} onChange={v=>onChange(match.id,"status",v)}
              options={[{value:"upcoming",label:"Upcoming"},{value:"live",label:"🟢 Live"},{value:"complete",label:"✓ Complete"}]} />
          </div>
        )}
      </div>
    </div>
  );
}
// ── AWARDS ────────────────────────────────────────────────────────────────────
function AwardsPanel({ awards, isAdmin, onChange }) {
  const sections = [
    { title:"DAILY AWARDS", color:"#b45309", items:[
      ["bestShot","🏌️ Best Shot"],["worstBeat","💀 Worst Beat"],["puttOfDay","🎯 Putt of Day"],
      ["cartPathMVP","🛻 Cart Path MVP"],["hangoverHero","🍺 Hangover Hero"],
    ]},
    { title:"SIDE GAME LEADERS", color:"#4f46e5", items:[
      ["closestPin","📍 Closest to Pin"],["longDrive","💨 Long Drive"],["lowGross","📊 Low Gross"],
      ["lowNet","📉 Low Net"],["moneyLeader","💰 Money Leader"],
    ]},
  ];
  return (
    <div style={{ display:"grid", gap:12 }}>
      {sections.map(s=>(
        <div key={s.title} style={{ background:"#fff", borderRadius:12, padding:16, border:"1px solid #e5e7eb", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, color:s.color, marginBottom:12 }}>{s.title}</div>
          {s.items.map(([key,label])=>(
            <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #f3f4f6" }}>
              <span style={{ fontSize:13, color:"#6b7280" }}>{label}</span>
              {isAdmin
                ? <Inp value={awards[key]} onChange={v=>onChange(key,v)} placeholder="Player…" style={{ width:150 }} />
                : <span style={{ fontSize:13, color:s.color, fontWeight:700 }}>{awards[key]||"—"}</span>
              }
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── BETS ──────────────────────────────────────────────────────────────────────
const BET_PERSON_OPTIONS = [
  { value:"", label:"— None —" },
  ...PLAYERS.map(p => ({ value:p.id, label:`${p.team==="Shields"?"🛡️":"⚔️"} ${p.name}` })),
  { value:"shields_team", label:"🛡️ Team Shields" },
  { value:"swords_team",  label:"⚔️ Team Swords"  },
];

const nameLabel = (val) => {
  if (!val) return null;
  return BET_PERSON_OPTIONS.find(o => o.value === val)?.label || val;
};

function BetsPanel({ bets, isAdmin, onChange, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ desc:"", amount:"", involvedA:"", involvedB:"", winner:"", settled:false });

  const handleAdd = () => {
    if (!draft.desc.trim()) return;
    onAdd({ ...draft, id: Date.now(), settled: false, winner: "" });
    setDraft({ desc:"", amount:"", involvedA:"", involvedB:"", winner:"", settled:false });
    setShowForm(false);
  };

  const inputStyle = {
    background:"#fff", border:"1px solid #d1d5db", borderRadius:8,
    color:"#111827", padding:"9px 12px", fontSize:13, width:"100%",

  };
  const selectStyle = { ...inputStyle };
  const labelStyle = { fontSize:10, fontWeight:700, color:"#6b7280", letterSpacing:1, marginBottom:4, display:"block" };

  return (
    <div style={{ display:"grid", gap:12 }}>

      {/* ── ADD BET button (admin only) ── */}
      {isAdmin && (
        <button onClick={() => setShowForm(!showForm)} style={{
          background: showForm ? "#f3f4f6" : "#b45309", color: showForm ? "#6b7280" : "#fff",
          border:"none", borderRadius:10, padding:"11px 16px", fontSize:13, fontWeight:700,
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6,
        }}>
          {showForm ? "✕ Cancel" : "+ Add New Bet"}
        </button>
      )}

      {/* ── NEW BET FORM ── */}
      {isAdmin && showForm && (
        <div style={{ background:"#fff", borderRadius:12, padding:16, border:"2px solid #b45309", boxShadow:"0 2px 8px rgba(180,83,9,0.1)" }}>
          <div style={{ fontSize:11, fontWeight:800, color:"#b45309", letterSpacing:2, marginBottom:14 }}>NEW BET</div>

          <div style={{ marginBottom:12 }}>
            <label style={labelStyle}>DESCRIPTION</label>
            <textarea value={draft.desc} onChange={e => setDraft({...draft, desc:e.target.value})}
              placeholder="What's the bet? Be specific…"
              rows={2}
              style={{ ...inputStyle, resize:"vertical", fontFamily:"inherit", lineHeight:1.5 }} />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            <div>
              <label style={labelStyle}>AMOUNT</label>
              <input value={draft.amount} onChange={e => setDraft({...draft, amount:e.target.value})}
                placeholder="$20" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>PLAYER / TEAM A</label>
              <select value={draft.involvedA} onChange={e => setDraft({...draft, involvedA:e.target.value})} style={selectStyle}>
                {BET_PERSON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={labelStyle}>PLAYER / TEAM B (optional)</label>
            <select value={draft.involvedB} onChange={e => setDraft({...draft, involvedB:e.target.value})} style={selectStyle}>
              {BET_PERSON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <button onClick={handleAdd} style={{
            background:"#b45309", color:"#fff", border:"none", borderRadius:8,
            padding:"11px 16px", fontSize:13, fontWeight:700, cursor:"pointer", width:"100%",
          }}>
            Save Bet
          </button>
        </div>
      )}

      {/* ── BET CARDS ── */}
      {bets.map(bet => {
        const labelA = nameLabel(bet.involvedA);
        const labelB = nameLabel(bet.involvedB);
        const winnerLabel = nameLabel(bet.winner);
        const pA = PLAYERS.find(p => p.id === bet.involvedA);
        const pB = PLAYERS.find(p => p.id === bet.involvedB);

        return (
          <div key={bet.id} style={{
            background:"#fff", borderRadius:12, border:`1px solid ${bet.settled?"#a5b4fc":"#e5e7eb"}`,
            overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
          }}>
            {/* Card header */}
            <div style={{
              background: bet.settled ? "#f5f3ff" : "#f9fafb",
              borderBottom:"1px solid #f3f4f6", padding:"10px 14px",
              display:"flex", justifyContent:"space-between", alignItems:"center",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {bet.amount && (
                  <span style={{ background:"#ecfdf5", color:"#059669", borderRadius:6, padding:"3px 9px", fontSize:13, fontWeight:800, border:"1px solid #d1fae5" }}>
                    {bet.amount}
                  </span>
                )}
                {bet.settled
                  ? <span style={{ background:"#ede9fe", color:"#4f46e5", borderRadius:6, padding:"3px 9px", fontSize:11, fontWeight:700 }}>✓ Settled</span>
                  : <span style={{ background:"#fff7ed", color:"#b45309", borderRadius:6, padding:"3px 9px", fontSize:11, fontWeight:700 }}>Open</span>
                }
              </div>
              {isAdmin && (
                <button onClick={() => onDelete(bet.id)} style={{ background:"none", border:"none", color:"#d1d5db", fontSize:16, cursor:"pointer", padding:"0 2px" }}>✕</button>
              )}
            </div>

            <div style={{ padding:"12px 14px" }}>
              {/* Description */}
              {isAdmin ? (
                <textarea value={bet.desc} onChange={e => onChange(bet.id, "desc", e.target.value)}
                  rows={2} style={{ ...inputStyle, marginBottom:12, resize:"vertical", fontFamily:"inherit", lineHeight:1.5, fontSize:13 }} />
              ) : (
                <div style={{ fontSize:14, color:"#111827", fontWeight:600, marginBottom:12, lineHeight:1.5 }}>{bet.desc}</div>
              )}

              {/* Players involved */}
              <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
                {isAdmin ? (
                  <>
                    <div style={{ flex:1, minWidth:120 }}>
                      <label style={labelStyle}>PLAYER / TEAM A</label>
                      <select value={bet.involvedA||""} onChange={e => onChange(bet.id,"involvedA",e.target.value)} style={selectStyle}>
                        {BET_PERSON_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div style={{ flex:1, minWidth:120 }}>
                      <label style={labelStyle}>PLAYER / TEAM B</label>
                      <select value={bet.involvedB||""} onChange={e => onChange(bet.id,"involvedB",e.target.value)} style={selectStyle}>
                        {BET_PERSON_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    {labelA && (
                      <span style={{ background: pA?.team==="Shields"||bet.involvedA==="shields_team"?"#fef3c7":"#ede9fe", color: pA?.team==="Shields"||bet.involvedA==="shields_team"?"#b45309":"#4f46e5", borderRadius:6, padding:"3px 10px", fontSize:12, fontWeight:700 }}>
                        {labelA}
                      </span>
                    )}
                    {labelB && (
                      <>
                        <span style={{ color:"#d1d5db", fontSize:12, alignSelf:"center" }}>vs</span>
                        <span style={{ background: pB?.team==="Shields"||bet.involvedB==="shields_team"?"#fef3c7":"#ede9fe", color: pB?.team==="Shields"||bet.involvedB==="shields_team"?"#b45309":"#4f46e5", borderRadius:6, padding:"3px 10px", fontSize:12, fontWeight:700 }}>
                          {labelB}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Amount row (admin editable) */}
              {isAdmin && (
                <div style={{ marginBottom:12 }}>
                  <label style={labelStyle}>AMOUNT</label>
                  <input value={bet.amount||""} onChange={e => onChange(bet.id,"amount",e.target.value)}
                    placeholder="$20" style={{ ...inputStyle, maxWidth:120 }} />
                </div>
              )}

              {/* Winner + Settle */}
              {bet.settled && winnerLabel && !isAdmin && (
                <div style={{ background:"#f5f3ff", borderRadius:8, padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:13 }}>🏆</span>
                  <span style={{ fontSize:13, fontWeight:700, color:"#4f46e5" }}>Winner: {winnerLabel}</span>
                </div>
              )}

              {isAdmin && (
                <div style={{ borderTop:"1px solid #f3f4f6", paddingTop:12, display:"flex", flexDirection:"column", gap:8 }}>
                  <div>
                    <label style={labelStyle}>WINNER</label>
                    <select value={bet.winner||""} onChange={e => onChange(bet.id,"winner",e.target.value)} style={selectStyle}>
                      {BET_PERSON_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <button onClick={() => onChange(bet.id,"settled",!bet.settled)} style={{
                    background: bet.settled?"#e5e7eb":"#b45309",
                    color: bet.settled?"#6b7280":"#fff",
                    border:"none", borderRadius:8, padding:"10px 14px",
                    fontSize:13, fontWeight:700, cursor:"pointer",
                  }}>
                    {bet.settled ? "↩ Reopen Bet" : "✓ Settle Bet"}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ── PLAYERS ───────────────────────────────────────────────────────────────────
function PlayersPanel({ matches, isAdmin, handicaps, onHcpChange }) {
  const stats = PLAYERS.map(p => {
    const wins = matches.filter(m =>
      (m.sideA.includes(p.id) && Number(m.pointsA)>Number(m.pointsB)) ||
      (m.sideB.includes(p.id) && Number(m.pointsB)>Number(m.pointsA))
    ).length;
    // Use overridden handicap if available, else fall back to PDF defaults
    const hcp = {
      thu: handicaps[p.id]?.thu ?? p.hcp.thu,
      fri: handicaps[p.id]?.fri ?? p.hcp.fri,
      sat: handicaps[p.id]?.sat ?? p.hcp.sat,
    };
    return { ...p, hcp, wins };
  });
  const shields = stats.filter(p=>p.team==="Shields");
  const swords  = stats.filter(p=>p.team==="Swords");

  const hcpInput = (pid, day, val, color) => isAdmin ? (
    <input
      type="number"
      value={val}
      onChange={e => onHcpChange(pid, day, e.target.value)}
      style={{
        width:36, background:"#fff", border:`1px solid ${color}66`,
        borderRadius:4, color, padding:"2px 4px", fontSize:12,
        fontWeight:700, textAlign:"center",
      }}
    />
  ) : (
    <div style={{ fontSize:12, fontWeight:700, color }}>{val}</div>
  );

  const TeamBlock = ({ players, label, color, border }) => (
    <div style={{ background:"#fff", borderRadius:12, padding:16, border:`1px solid ${border}`, boxShadow:"0 1px 3px rgba(0,0,0,0.05)", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <div style={{ width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🛡️</div>
        <div>
          <div style={{ fontSize:12, fontWeight:800, letterSpacing:2, color }}>{label}</div>
          {isAdmin && <div style={{ fontSize:9, color:"#9ca3af", marginTop:1 }}>Tap handicaps to edit</div>}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {players.map(p=>(
          <div key={p.id} style={{ background:"#f9fafb", borderRadius:8, padding:"10px", border:"1px solid #f3f4f6" }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#111827" }}>{p.name}</div>
            <div style={{ fontSize:10, color, marginTop:1 }}>{p.lastName}</div>
            <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap", alignItems:"center" }}>
              {[["Thu","thu"],["Fri","fri"],["Sat","sat"]].map(([label, day])=>(
                <div key={day} style={{ background:"#fff", borderRadius:4, padding:"3px 6px", border:`1px solid ${isAdmin?color+"44":"#e5e7eb"}`, textAlign:"center", minWidth:36 }}>
                  <div style={{ fontSize:8, color:"#9ca3af" }}>{label}</div>
                  {hcpInput(p.id, day, p.hcp[day], color)}
                </div>
              ))}
              <div style={{ background:"#fff", borderRadius:4, padding:"3px 6px", border:"1px solid #e5e7eb", textAlign:"center" }}>
                <div style={{ fontSize:8, color:"#9ca3af" }}>Wins</div>
                <div style={{ fontSize:12, fontWeight:700, color:"#059669" }}>{p.wins}</div>
              </div>
            </div>
            <div style={{ marginTop:6, fontSize:9, color:"#9ca3af" }}>Tees: {p.tees}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <TeamBlock players={shields} label="TEAM SHIELDS" color="#b45309" border="#fcd34d" />
      <TeamBlock players={swords}  label="TEAM SWORDS"  color="#4f46e5" border="#a5b4fc" />
    </>
  );
}


// ── SCHEDULE ──────────────────────────────────────────────────────────────────
function SchedulePanel() {
  return (
    <div style={{ display:"grid", gap:10 }}>
      {SCHEDULE.map(d=>(
        <div key={d.date} style={{ background:"#fff", borderRadius:12, padding:14, border:"1px solid #e5e7eb", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:18 }}>{d.emoji}</span>
              <div>
                <div style={{ fontWeight:800, color:"#111827", fontSize:14 }}>{d.day}</div>
                <div style={{ fontSize:10, color:"#9ca3af" }}>{d.date}</div>
              </div>
            </div>
          </div>
          {d.items.map((item,i)=>(
            <div key={i} style={{ fontSize:12, color:"#6b7280", padding:"5px 0 5px 8px", borderLeft:`2px solid ${i===0?"#b45309":"#e5e7eb"}`, marginBottom:3, borderRadius:1 }}>
              {item}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── RULES ─────────────────────────────────────────────────────────────────────
function RulesPanel() {
  const [activeDay, setActiveDay] = useState("Thursday");
  return (
    <>
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        {["Thursday","Friday","Saturday"].map(d=>(
          <Pill key={d} active={activeDay===d} onClick={()=>setActiveDay(d)}>{d}</Pill>
        ))}
      </div>
      <div style={{ display:"grid", gap:8 }}>
        {(RULES_BY_DAY[activeDay]||[]).map(r=>(
          <div key={r.title} style={{ background:"#fff", borderRadius:10, padding:14, border:"1px solid #e5e7eb", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize:11, fontWeight:800, color:"#b45309", marginBottom:4, letterSpacing:0.5 }}>{r.title}</div>
            <div style={{ fontSize:13, color:"#4b5563", lineHeight:1.5 }}>{r.body}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── WEATHER PANEL ─────────────────────────────────────────────────────────────
const FORECAST_DATA = [
  {
    date:"Wed, May 20", day:"Arrival Day", icon:"⛅", condition:"Partly Cloudy",
    high:81, low:60, precip:20, wind:12, golfRating:"Good",
    note:"Practice round day — pleasant conditions, light south breeze.",
  },
  {
    date:"Thu, May 21", day:"Day 1 · PGA Frisco", icon:"🌤️", condition:"Mostly Sunny",
    high:81, low:60, precip:15, wind:14, golfRating:"Good",
    note:"Match Play day at Fields Ranch East. Warm and mostly clear, south winds 10–15 mph.",
  },
  {
    date:"Fri, May 22", day:"Day 2 · SBCC", icon:"☀️", condition:"Sunny",
    high:80, low:61, precip:10, wind:16, golfRating:"Perfect",
    note:"Best day of the trip. Full sun, low humidity. Morning best ball, afternoon scramble.",
  },
  {
    date:"Sat, May 23", day:"Day 3 · SBCC Fazio", icon:"🌤️", condition:"Mostly Sunny",
    high:85, low:63, precip:20, wind:13, golfRating:"Perfect",
    note:"Final day, warmest of the trip. Alt Shot + Scramble in beautiful conditions.",
  },
  {
    date:"Sun, May 24", day:"Departure", icon:"☀️", condition:"Sunny",
    high:84, low:65, precip:10, wind:10, golfRating:"Good",
    note:"Travel home day — safe flights.",
  },
];

const RATING_COLORS = {
  "Perfect":     "#059669",
  "Good":        "#16a34a",
  "Playable":    "#0284c7",
  "Windy":       "#7c3aed",
  "Rain Likely": "#d97706",
  "Tough":       "#ea580c",
  "Skip It":     "#dc2626",
};

const GOLF_DAYS = ["Thu","Fri","Sat"];

function WeatherPanel() {
  const [activeVenue, setActiveVenue] = useState("pga");

  const VENUES = {
    pga:  { label:"PGA Frisco",    subtitle:"Fields Ranch East", icon:"🏌️" },
    sbcc: { label:"Stonebriar CC", subtitle:"Members + Fazio",   icon:"🌿" },
  };

  // Venue note overrides for SBCC days
  const SBCC_NOTES = {
    "Fri, May 22": "SBCC Members (morning) + Fazio (afternoon). Perfect day — full sun, calm winds.",
    "Sat, May 23": "SBCC Fazio (morning) + Members (afternoon). Warmest day, ideal finishing conditions.",
  };

  return (
    <div>
      {/* Source note */}
      <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, padding:"8px 12px", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:14 }}>📍</span>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:"#059669" }}>Frisco, TX · May 20–24, 2026</div>
          <div style={{ fontSize:10, color:"#6b7280" }}>Forecast sourced from AccuWeather · Updated Apr 2026</div>
        </div>
      </div>

      {/* Venue tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {Object.entries(VENUES).map(([key, v]) => (
          <button key={key} onClick={() => setActiveVenue(key)} style={{
            flex:1, padding:"10px 8px", borderRadius:10,
            border:`2px solid ${activeVenue===key?"#b45309":"#e5e7eb"}`,
            background:activeVenue===key?"#fff8f0":"#fff",
            cursor:"pointer", textAlign:"left",
          }}>
            <div style={{ fontSize:18 }}>{v.icon}</div>
            <div style={{ fontSize:12, fontWeight:700, color:activeVenue===key?"#b45309":"#111827", marginTop:2 }}>{v.label}</div>
            <div style={{ fontSize:10, color:"#9ca3af" }}>{v.subtitle}</div>
          </button>
        ))}
      </div>

      {/* Forecast cards */}
      <div style={{ display:"grid", gap:10 }}>
        {FORECAST_DATA.map((day, i) => {
          const ratingColor = RATING_COLORS[day.golfRating] || "#6b7280";
          const isGolf = GOLF_DAYS.some(d => day.date.startsWith(d));
          const note = activeVenue === "sbcc" && SBCC_NOTES[day.date] ? SBCC_NOTES[day.date] : day.note;

          return (
            <div key={i} style={{
              background:"#fff", borderRadius:12, padding:14,
              border: isGolf ? "2px solid #b4530966" : "1px solid #e5e7eb",
              boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
            }}>
              {/* Top row */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ fontSize:42, lineHeight:1 }}>{day.icon}</div>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:2 }}>
                      <div style={{ fontSize:13, fontWeight:800, color:"#111827" }}>{day.date}</div>
                      {isGolf && (
                        <span style={{ background:"#b4530918", color:"#b45309", fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:4, letterSpacing:1 }}>
                          ⛳ GOLF DAY
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize:11, color:"#6b7280", marginBottom:6 }}>{day.day} · {day.condition}</div>
                    <div style={{ display:"inline-block", background:ratingColor+"18", borderRadius:5, padding:"3px 9px", border:`1px solid ${ratingColor}33` }}>
                      <span style={{ fontSize:11, fontWeight:700, color:ratingColor }}>{day.golfRating}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:28, fontWeight:800, color:"#111827", lineHeight:1 }}>{day.high}°</div>
                  <div style={{ fontSize:13, color:"#9ca3af", marginTop:2 }}>{day.low}°</div>
                  <div style={{ fontSize:9, color:"#9ca3af", marginTop:2 }}>Hi / Lo °F</div>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display:"flex", gap:8, marginTop:12 }}>
                {[
                  ["💧", `${day.precip}%`,   "Rain"],
                  ["💨", `${day.wind} mph`,  "Wind"],
                ].map(([ico, val, lbl]) => (
                  <div key={lbl} style={{ background:"#f9fafb", borderRadius:6, padding:"5px 12px", display:"flex", alignItems:"center", gap:6, border:"1px solid #f3f4f6" }}>
                    <span style={{ fontSize:14 }}>{ico}</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:"#111827" }}>{val}</div>
                      <div style={{ fontSize:9, color:"#9ca3af" }}>{lbl}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div style={{ marginTop:10, fontSize:11, color:"#6b7280", lineHeight:1.5, borderTop:"1px solid #f3f4f6", paddingTop:8, fontStyle:"italic" }}>
                {note}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop:12, fontSize:10, color:"#9ca3af", textAlign:"center" }}>
        Source: AccuWeather long-range · Frisco, TX 75033
      </div>
    </div>
  );
}


// ── MAIN APP ──────────────────────────────────────────────────────────────────
function GolfTripApp() {
  const [tab, setTab]       = useState("home");
  const [resultDay, setResultDay] = useState("Thursday");
  const [isAdmin, setIsAdmin]   = useState(false);
  const [pwInput, setPwInput]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [pwError, setPwError]   = useState(false);
  const [quote]                 = useState(QUOTES[Math.floor(Math.random()*QUOTES.length)]);

  const [matches, setMatches, matchesLoaded] = useStorage("matches", INITIAL_MATCHES);
  const [awards,  setAwards,  awardsLoaded]  = useStorage("awards",  INITIAL_AWARDS);
  const [bets,    setBets,    betsLoaded]    = useStorage("bets",    INITIAL_BETS);
  const [heater,  setHeater,  heaterLoaded]  = useStorage("heater",  { team:"Shields", streak:0 });
  const [lastUpdated, setLastUpdated]        = useState(null);
  const [handicaps, setHandicaps, hcpLoaded]   = useStorage("hcp", {});

  const loaded = matchesLoaded && awardsLoaded && betsLoaded && heaterLoaded && hcpLoaded;

  // Update lastUpdated timestamp whenever matches change
  useEffect(() => {
    if (!loaded) return;
    const now = new Date();
    setLastUpdated(`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`);
  }, [matches, loaded]);

  const onMatchChange = (id, field, value) => setMatches(matches.map(m=>m.id===id?{...m,[field]:value}:m));
  const onAwardChange = (key, value) => setAwards({...awards,[key]:value});
  const onBetChange  = (id, field, value) => setBets(bets.map(b=>b.id===id?{...b,[field]:value}:b));
  const onHcpChange  = (pid, day, val) => {
    const updated = { ...handicaps, [pid]: { ...(handicaps[pid]||{}), [day]: Number(val) } };
    setHandicaps(updated);
  };
  const onBetAdd    = (newBet) => setBets([...bets, newBet]);
  const onBetDelete = (id) => setBets(bets.filter(b=>b.id!==id));

  const tryUnlock = () => {
    if (pwInput === ADMIN_PASSWORD) { setIsAdmin(true); setShowPw(false); setPwInput(""); setPwError(false); }
    else setPwError(true);
  };

  const shieldsTotal = matches.reduce((a,m)=>a+Number(m.pointsA||0),0);
  const swordsTotal  = matches.reduce((a,m)=>a+Number(m.pointsB||0),0);
  const dayMatches   = matches.filter(m=>m.day===resultDay);

  if (!loaded) return (
    <div style={{ minHeight:"100vh", background:"#f0f4f0", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
      <div style={{ fontSize:48 }}>⛳</div>
      <div style={{ color:"#4a7a5a", fontFamily:"'Georgia',serif", fontSize:12, letterSpacing:3 }}>LOADING…</div>
    </div>
  );

  const TABS = [
    { key:"home",     icon:"🏠", label:"Home"     },
    { key:"results",  icon:"⛳", label:"Results"  },
    { key:"awards",   icon:"🏆", label:"Awards"   },
    { key:"bets",     icon:"💰", label:"Bets"     },
    { key:"players",  icon:"👥", label:"Players"  },
    { key:"schedule", icon:"📅", label:"Schedule" },
    { key:"rules",    icon:"📋", label:"Rules"    },
    { key:"weather",  icon:"🌤️", label:"Weather"  },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#eef2ee", fontFamily:"'Georgia',serif", color:"#111827", maxWidth:480, margin:"0 auto", position:"relative", paddingBottom:80 }}>

      {/* HEADER */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"14px 18px 12px", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 6px rgba(0,0,0,0.07)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:46, height:46, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>⛳</div>
            <div>
              <div style={{ fontSize:9, letterSpacing:3, color:"#9ca3af", textTransform:"uppercase" }}>Golf Trip 2026</div>
              <div style={{ fontSize:17, fontWeight:900, color:"#111827", letterSpacing:-0.3, lineHeight:1.1 }}>Shields v Swords</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ textAlign:"right", fontFamily:"'Georgia',serif" }}>
              <span style={{ color:"#b45309", fontWeight:800, fontSize:16 }}>{shieldsTotal}</span>
              <span style={{ color:"#d1d5db", margin:"0 5px" }}>·</span>
              <span style={{ color:"#4f46e5", fontWeight:800, fontSize:16 }}>{swordsTotal}</span>
            </div>
            <button onClick={()=>{ if(isAdmin) setIsAdmin(false); else setShowPw(!showPw); }}
              style={{ background:isAdmin?"#b45309":"#f3f4f6", border:"none", borderRadius:8, padding:"6px 11px", color:isAdmin?"#fff":"#6b7280", fontSize:10, fontWeight:700, cursor:"pointer" }}>
              {isAdmin?"🔓 ADMIN":"🔒"}
            </button>
          </div>
        </div>
        {showPw && !isAdmin && (
          <div style={{ marginTop:10, display:"flex", gap:8 }}>
            <input type="password" value={pwInput} onChange={e=>{setPwInput(e.target.value);setPwError(false);}}
              onKeyDown={e=>e.key==="Enter"&&tryUnlock()} placeholder="Password…"
              style={{ flex:1, background:"#f9fafb", border:`1px solid ${pwError?"#ef4444":"#d1d5db"}`, borderRadius:6, color:"#111827", padding:"7px 10px", fontSize:13 }} />
            <button onClick={tryUnlock} style={{ background:"#b45309", border:"none", borderRadius:6, padding:"7px 14px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>Go</button>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div style={{ padding:"14px 14px 6px" }}>

        {/* HOME */}
        {tab==="home" && (
          <>
            <MastersBoard matches={matches} heater={heater} lastUpdated={lastUpdated} isAdmin={isAdmin} onMatchChange={onMatchChange} />

            <div style={{ background:"#fff", borderRadius:10, padding:"11px 14px", marginBottom:14, border:"1px solid #e5e7eb", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize:9, color:"#9ca3af", letterSpacing:2, marginBottom:3 }}>CLUBHOUSE QUOTE</div>
              <div style={{ fontSize:13, color:"#6b7280", fontStyle:"italic" }}>"{quote}"</div>
            </div>

            {isAdmin && (
              <div style={{ background:"#fff", borderRadius:12, padding:14, border:"1px solid #e5e7eb", marginBottom:14, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, color:"#b45309", marginBottom:10 }}>🔥 HEATER CONTROLS</div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <Sel value={heater.team} onChange={v=>setHeater({...heater,team:v})}
                    options={[{value:"Shields",label:"Shields"},{value:"Swords",label:"Swords"}]} />
                  <button onClick={()=>setHeater({...heater,streak:Math.max(0,heater.streak-1)})}
                    style={{ background:"#f3f4f6", border:"1px solid #e5e7eb", borderRadius:6, color:"#374151", width:32, height:32, cursor:"pointer", fontSize:16, flexShrink:0 }}>−</button>
                  <span style={{ fontWeight:700, fontSize:18, minWidth:20, textAlign:"center", color:"#111827" }}>{heater.streak}</span>
                  <button onClick={()=>setHeater({...heater,streak:heater.streak+1})}
                    style={{ background:"#f3f4f6", border:"1px solid #e5e7eb", borderRadius:6, color:"#374151", width:32, height:32, cursor:"pointer", fontSize:16, flexShrink:0 }}>+</button>
                </div>
              </div>
            )}

            <div style={{ fontSize:9, color:"#9ca3af", letterSpacing:2, marginBottom:10 }}>QUICK AWARDS</div>
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:14, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              {[["🏌️ Best Shot",awards.bestShot],["🎯 Putt of Day",awards.puttOfDay],["📍 Closest to Pin",awards.closestPin],["💰 Money Leader",awards.moneyLeader]].map(([label,val])=>(
                <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f9fafb" }}>
                  <span style={{ fontSize:12, color:"#6b7280" }}>{label}</span>
                  <span style={{ fontSize:12, color:"#b45309", fontWeight:700 }}>{val||"—"}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* RESULTS */}
        {tab==="results" && (
          <>
            <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
              {["Thursday","Friday","Saturday"].map(d=>(
                <Pill key={d} active={resultDay===d} onClick={()=>setResultDay(d)}>{d}</Pill>
              ))}
            </div>
            <div style={{ fontSize:9, color:"#9ca3af", marginBottom:10, letterSpacing:2 }}>{resultDay.toUpperCase()} RESULTS</div>
            {dayMatches.map(m=>(
              <MatchCard key={m.id} match={m} isAdmin={isAdmin} onChange={onMatchChange} />
            ))}
          </>
        )}

        {/* AWARDS */}
        {tab==="awards" && (
          <>
            <div style={{ fontSize:9, color:"#9ca3af", marginBottom:10, letterSpacing:2 }}>AWARDS & SIDE GAMES</div>
            <AwardsPanel awards={awards} isAdmin={isAdmin} onChange={onAwardChange} />
          </>
        )}

        {/* BETS */}
        {tab==="bets" && (
          <>
            <div style={{ fontSize:9, color:"#9ca3af", marginBottom:10, letterSpacing:2 }}>TRIP BETS</div>
            <BetsPanel bets={bets} isAdmin={isAdmin} onChange={onBetChange} onAdd={onBetAdd} onDelete={onBetDelete} />
          </>
        )}

        {/* PLAYERS */}
        {tab==="players" && (
          <>
            <div style={{ fontSize:9, color:"#9ca3af", marginBottom:10, letterSpacing:2 }}>PLAYERS & HANDICAPS</div>
            <PlayersPanel matches={matches} isAdmin={isAdmin} handicaps={handicaps} onHcpChange={onHcpChange} />
          </>
        )}

        {/* SCHEDULE */}
        {tab==="schedule" && (
          <>
            <div style={{ fontSize:9, color:"#9ca3af", marginBottom:10, letterSpacing:2 }}>TRIP SCHEDULE</div>
            <SchedulePanel />
          </>
        )}

        {/* RULES */}
        {tab==="rules" && (
          <>
            <div style={{ fontSize:9, color:"#9ca3af", marginBottom:10, letterSpacing:2 }}>RULES BY DAY</div>
            <RulesPanel />
          </>
        )}

        {/* WEATHER */}
        {tab==="weather" && (
          <>
            <div style={{ fontSize:9, color:"#9ca3af", marginBottom:10, letterSpacing:2 }}>5-DAY FORECAST · FRISCO TX</div>
            <WeatherPanel />
          </>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:"#fff", borderTop:"1px solid #e5e7eb", display:"flex", zIndex:200, boxShadow:"0 -2px 10px rgba(0,0,0,0.07)" }}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{ flex:1, background:"none", border:"none", padding:"9px 2px 11px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, borderTop:tab===t.key?"2.5px solid #b45309":"2.5px solid transparent" }}>
            <span style={{ fontSize:15 }}>{t.icon}</span>
            <span style={{ fontSize:8, fontWeight:700, letterSpacing:0.5, color:tab===t.key?"#b45309":"#9ca3af", textTransform:"uppercase" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default GolfTripApp;
