
// ─── Theme System ───────────────────────────────────────────────
// Three variations of the same earthy Melbourne palette — warm, considered, minimal.
const THEMES = {
  1: {
    name:"Oat",
    primary:"#7C5230", primaryDark:"#5E3C22",
    secondary:"#B48C6C", accent:"#D4BEA4",
    bg:{light:"#F6F2ED",dark:"#130D08"},
    surf:{light:"#EDE8E1",dark:"#1E160F"},
    card:{light:"#FFFFFF",dark:"#271D14"},
    text:{light:"#1A120A",dark:"#EDE8E1"},
    sub:{light:"#7A6A5C",dark:"#A09080"},
    border:{light:"#DDD5CB",dark:"#362818"},
    chip:{light:"#EDE8E1",dark:"#271D14"},
  },
  2: {
    name:"Parchment",
    primary:"#6B5040", primaryDark:"#503C30",
    secondary:"#A89080", accent:"#CCC0B4",
    bg:{light:"#F4F0EC",dark:"#110E0A"},
    surf:{light:"#EAE6E0",dark:"#1C1610"},
    card:{light:"#FFFFFF",dark:"#241C14"},
    text:{light:"#18100A",dark:"#EAE6E0"},
    sub:{light:"#72645A",dark:"#988880"},
    border:{light:"#D8D0C8",dark:"#302418"},
    chip:{light:"#EAE6E0",dark:"#241C14"},
  },
  3: {
    name:"Dusk",
    primary:"#5C4434", primaryDark:"#3E2E22",
    secondary:"#9C8070", accent:"#BEB0A4",
    bg:{light:"#F0EBE5",dark:"#0E0A07"},
    surf:{light:"#E6E0D8",dark:"#181209"},
    card:{light:"#FFFFFF",dark:"#211810"},
    text:{light:"#160E08",dark:"#E6E0D8"},
    sub:{light:"#6A5C50",dark:"#908070"},
    border:{light:"#D0C8BF",dark:"#2A1E14"},
    chip:{light:"#E6E0D8",dark:"#211810"},
  },
};

function getT(theme, dark) {
  const t = THEMES[theme];
  return {
    primary:t.primary, primaryDark:t.primaryDark,
    secondary:t.secondary, accent:t.accent,
    bg:dark?t.bg.dark:t.bg.light,
    surf:dark?t.surf.dark:t.surf.light,
    card:dark?t.card.dark:t.card.light,
    text:dark?t.text.dark:t.text.light,
    sub:dark?t.sub.dark:t.sub.light,
    border:dark?t.border.dark:t.border.light,
    chip:dark?t.chip.dark:t.chip.light,
    name:t.name, dark,
  };
}

// ─── Logo ───────────────────────────────────────────────────────
function LorinaLogo({size=32, color="#7C5230"}) {
  return (
    <svg width={size} height={size*1.1} viewBox="0 0 40 44" fill="none">
      <path d="M15 7 Q16.5 3.5 15 1" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M20 6 Q21.5 2.5 20 0" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M25 7 Q26.5 3.5 25 1" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="7" y="7" width="26" height="5" rx="2.5" fill={color}/>
      <rect x="16.5" y="4.5" width="7" height="3.5" rx="1.75" fill={color}/>
      <path d="M9.5 12 L30.5 12 L27.5 40 L12.5 40 Z" fill={color}/>
      <path d="M11.5 22 L28.5 22 L27 32 L13 32 Z" fill="rgba(0,0,0,0.1)"/>
      <text x="20" y="35" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily="Georgia,serif">L</text>
    </svg>
  );
}

// ─── Shared Components ───────────────────────────────────────────

// Busyness: minimal dot + label only
function BusynessChip({level, mini=false}) {
  const map = {
    quiet:    {label:"Quiet",    dot:"#4A9E6A"},
    moderate: {label:"Moderate", dot:"#C0882A"},
    busy:     {label:"Busy",     dot:"#B84848"},
  };
  const m = map[level]||map.quiet;
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:5,
      fontSize:mini?10:11, color:m.dot,
      fontFamily:"DM Sans,sans-serif", fontWeight:600, flexShrink:0,
      letterSpacing:0.1,
    }}>
      <div style={{width:6, height:6, borderRadius:"50%", background:m.dot, flexShrink:0}}/>
      {!mini && m.label}
    </div>
  );
}

function Stars({rating, size=12}) {
  return (
    <div style={{display:"flex", gap:1, alignItems:"center"}}>
      {[1,2,3,4,5].map(i=>(
        <svg key={i} width={size} height={size} viewBox="0 0 12 12">
          <path d="M6 1l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8.8l-3 1.3.6-3.3L1.2 4.5 4.5 4z"
            fill={i<=Math.round(rating)?"#C0882A":"#E0D8CE"}/>
        </svg>
      ))}
    </div>
  );
}

function Avi({initials, size=36, color="#7C5230"}) {
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      background:color+"18", border:`1px solid ${color}30`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*0.32, fontWeight:700, color:color,
      fontFamily:"DM Sans,sans-serif", flexShrink:0, letterSpacing:-0.3,
    }}>{initials}</div>
  );
}

function SeatBar({avail, total, T}) {
  const pct = avail/total;
  const col = pct>0.5?"#4A9E6A":pct>0.2?"#C0882A":"#B84848";
  return (
    <div>
      <div style={{height:3, borderRadius:2, background:T.border, overflow:"hidden"}}>
        <div style={{height:"100%", width:`${pct*100}%`, background:col, borderRadius:2, transition:"width 0.5s"}}/>
      </div>
      <div style={{fontSize:10, color:T.sub, marginTop:4, fontFamily:"DM Sans,sans-serif", letterSpacing:0.1}}>
        {avail} of {total} seats available
      </div>
    </div>
  );
}

function Tag({label, T}) {
  return (
    <span style={{
      background:T.chip, color:T.sub, borderRadius:4,
      padding:"3px 9px", fontSize:10, fontFamily:"DM Sans,sans-serif",
      fontWeight:500, flexShrink:0, letterSpacing:0.2,
    }}>{label}</span>
  );
}

// ─── Bottom Nav ──────────────────────────────────────────────────
function BottomNav({screen, navigate, T}) {
  const tabs=[
    {id:"home",    label:"Home",      Icon:HomeIco},
    {id:"map",     label:"Map",       Icon:MapIco},
    {id:"community",label:"Live",     Icon:CommIco},
    {id:"search",  label:"Search",    Icon:SearchIco},
    {id:"profile", label:"Profile",   Icon:ProfileIco},
  ];
  return (
    <div style={{
      position:"absolute", bottom:0, left:0, right:0, height:76,
      background:T.card, borderTop:`0.5px solid ${T.border}`,
      display:"flex", alignItems:"flex-start", paddingTop:10, zIndex:200,
    }}>
      {tabs.map(tab=>{
        const active = screen===tab.id;
        return (
          <button key={tab.id} onClick={()=>navigate(tab.id)} style={{
            flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4,
            background:"none", border:"none", cursor:"pointer",
            color:active?T.primary:T.sub, padding:"2px 0",
          }}>
            <tab.Icon active={active} color={active?T.primary:T.sub}/>
            <span style={{fontSize:9, fontWeight:active?700:400, fontFamily:"DM Sans,sans-serif", letterSpacing:0.3}}>
              {tab.label}
            </span>
            {active && <div style={{width:3, height:3, borderRadius:"50%", background:T.primary, marginTop:-2}}/>}
          </button>
        );
      })}
    </div>
  );
}

// SVG Icons — clean, consistent stroke style
function HomeIco({active, color}) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill={active?"currentColor":"none"} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>;
}
function MapIco({color}) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2 1,6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
}
function CommIco({active, color}) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill={active?"currentColor":"none"} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
}
function SearchIco({color}) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function ProfileIco({active, color}) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill={active?"currentColor":"none"} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

// Expose SearchIco for screens-1
Object.assign(window,{THEMES,getT,LorinaLogo,BusynessChip,Stars,Avi,SeatBar,Tag,BottomNav,SearchIco});
