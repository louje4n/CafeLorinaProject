
// ─── Splash ──────────────────────────────────────────────────────
function SplashScreen({T, onDone}) {
  const [vis, setVis] = React.useState(false);
  React.useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 100);
    const t2 = setTimeout(() => onDone(), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div style={{height:"100%", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16}}>
      <div style={{transform:vis?"scale(1)":"scale(0.7)", opacity:vis?1:0, transition:"all 0.6s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <LorinaLogo size={64} color={T.primary}/>
      </div>
      <div style={{opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(12px)", transition:"all 0.5s ease 0.25s", textAlign:"center"}}>
        <div style={{fontFamily:"Playfair Display,serif", fontSize:34, fontWeight:700, color:T.text, letterSpacing:-1}}>Lorina</div>
        <div style={{fontFamily:"DM Sans,sans-serif", fontSize:13, color:T.sub, marginTop:4, letterSpacing:0.3}}>Your café, your community</div>
      </div>
    </div>
  );
}

// ─── Onboarding ──────────────────────────────────────────────────
function OnboardingScreen({T, navigate}) {
  const [step, setStep] = React.useState(0);
  const [prefs, setPrefs] = React.useState([]);
  const opts = ["Study Spots","Specialty Coffee","Quiet Spaces","Matcha","Pastries","Late Hours","Outdoor Seating","Power Outlets"];

  const Field = ({label, placeholder}) => (
    <div>
      <div style={{fontFamily:"DM Sans,sans-serif", fontSize:11, color:T.sub, fontWeight:600, letterSpacing:0.8, textTransform:"uppercase", marginBottom:6}}>{label}</div>
      <div style={{border:`1px solid ${T.border}`, borderRadius:10, background:T.card, padding:"13px 14px", fontFamily:"DM Sans,sans-serif", fontSize:14, color:T.sub}}>{placeholder}</div>
    </div>
  );

  if (step === 0) return (
    <div style={{height:"100%", display:"flex", flexDirection:"column", background:T.bg}}>
      <div style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"72px 32px 28px"}}>
        <LorinaLogo size={56} color={T.primary}/>
        <div style={{fontFamily:"Playfair Display,serif", fontSize:28, fontWeight:700, color:T.text, marginTop:20, textAlign:"center", lineHeight:1.25}}>
          Find your perfect<br/>study café
        </div>
        <div style={{fontFamily:"DM Sans,sans-serif", fontSize:14, color:T.sub, marginTop:10, textAlign:"center", lineHeight:1.7, maxWidth:240}}>
          Discover cafés, check live busyness and connect with your community.
        </div>
      </div>
      <div style={{padding:"0 24px 32px", background:T.card, borderRadius:"20px 20px 0 0", paddingTop:24}}>
        <button onClick={() => setStep(1)} style={{width:"100%", height:50, borderRadius:10, border:"none", background:T.primary, color:"#fff", fontFamily:"DM Sans,sans-serif", fontSize:15, fontWeight:600, cursor:"pointer", letterSpacing:0.2}}>
          Get Started
        </button>
        <div style={{textAlign:"center", marginTop:14, fontFamily:"DM Sans,sans-serif", fontSize:13, color:T.sub}}>
          Have an account?{" "}
          <span style={{color:T.primary, fontWeight:600, cursor:"pointer"}} onClick={() => navigate("home")}>Sign in</span>
        </div>
      </div>
    </div>
  );

  if (step === 1) return (
    <div style={{height:"100%", background:T.bg, display:"flex", flexDirection:"column", padding:"20px 22px 0"}}>
      <button onClick={() => setStep(0)} style={{background:"none", border:"none", cursor:"pointer", color:T.sub, fontFamily:"DM Sans,sans-serif", fontSize:13, textAlign:"left", padding:0, marginBottom:16, marginTop:52}}>← Back</button>
      <div style={{fontFamily:"Playfair Display,serif", fontSize:26, fontWeight:700, color:T.text}}>Create account</div>
      <div style={{fontFamily:"DM Sans,sans-serif", fontSize:13, color:T.sub, marginTop:4, marginBottom:24}}>Join the Lorina community</div>
      <div style={{display:"flex", flexDirection:"column", gap:14}}>
        <Field label="Name" placeholder="Your name"/>
        <Field label="Email" placeholder="you@email.com"/>
        <Field label="Password" placeholder="At least 8 characters"/>
      </div>
      <button onClick={() => setStep(2)} style={{width:"100%", height:50, borderRadius:10, border:"none", background:T.primary, color:"#fff", fontFamily:"DM Sans,sans-serif", fontSize:15, fontWeight:600, cursor:"pointer", marginTop:24}}>
        Continue
      </button>
      <div style={{display:"flex", alignItems:"center", gap:12, margin:"16px 0"}}>
        <div style={{flex:1, height:1, background:T.border}}/>
        <span style={{fontFamily:"DM Sans,sans-serif", fontSize:11, color:T.sub}}>or</span>
        <div style={{flex:1, height:1, background:T.border}}/>
      </div>
      <button onClick={() => navigate("home")} style={{width:"100%", height:46, borderRadius:10, border:`1px solid ${T.border}`, background:T.card, color:T.text, fontFamily:"DM Sans,sans-serif", fontSize:13, fontWeight:500, cursor:"pointer"}}>
        Continue with Google
      </button>
    </div>
  );

  return (
    <div style={{height:"100%", background:T.bg, display:"flex", flexDirection:"column", padding:"20px 22px 0"}}>
      <button onClick={() => setStep(1)} style={{background:"none", border:"none", cursor:"pointer", color:T.sub, fontFamily:"DM Sans,sans-serif", fontSize:13, textAlign:"left", padding:0, marginBottom:16, marginTop:52}}>← Back</button>
      <div style={{fontFamily:"Playfair Display,serif", fontSize:26, fontWeight:700, color:T.text}}>Your interests</div>
      <div style={{fontFamily:"DM Sans,sans-serif", fontSize:13, color:T.sub, marginTop:4, marginBottom:22}}>Help us personalise your feed</div>
      <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
        {opts.map(o => {
          const sel = prefs.includes(o);
          return (
            <button key={o} onClick={() => setPrefs(p => sel ? p.filter(x => x!==o) : [...p, o])} style={{
              padding:"9px 16px", borderRadius:8, cursor:"pointer", transition:"all 0.15s",
              border:`1px solid ${sel ? T.primary : T.border}`,
              background:sel ? T.primary : T.card,
              color:sel ? "#fff" : T.text,
              fontFamily:"DM Sans,sans-serif", fontSize:13, fontWeight:500,
            }}>{o}</button>
          );
        })}
      </div>
      <div style={{flex:1}}/>
      <button onClick={() => navigate("home")} style={{
        width:"100%", height:50, borderRadius:10, border:"none", cursor:"pointer",
        background:T.primary, color:"#fff",
        fontFamily:"DM Sans,sans-serif", fontSize:15, fontWeight:600,
        marginBottom:24, opacity:prefs.length>0?1:0.45, transition:"opacity 0.2s",
      }}>
        {prefs.length > 0 ? "Continue" : "Select at least one"}
      </button>
    </div>
  );
}

// ─── Home ────────────────────────────────────────────────────────
function HomeScreen({T, navigate, selectCafe}) {
  const [tab, setTab] = React.useState("nearby");
  const [popIdx, setPopIdx] = React.useState(0);
  const cafes = window.CAFES;
  const cafe = cafes[popIdx % cafes.length];

  if (tab === "trending") return (
    <div style={{height:"100%", position:"relative", overflow:"hidden", background:T.bg}}>
      {/* Muted color wash */}
      <div style={{position:"absolute", inset:0, background:`linear-gradient(180deg, ${T.surf} 0%, ${T.bg} 100%)`}}/>
      {/* Top tabs */}
      <div style={{position:"relative", zIndex:10, padding:"68px 20px 10px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div style={{display:"flex", gap:6}}>
          {[["nearby","Nearby"],["trending","Trending"]].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding:"7px 16px", borderRadius:6, border:"none", cursor:"pointer",
              background:tab===k ? T.primary : "transparent",
              color:tab===k ? "#fff" : T.sub,
              fontFamily:"DM Sans,sans-serif", fontSize:12, fontWeight:600,
            }}>{l}</button>
          ))}
        </div>
        <LorinaLogo size={28} color={T.primary}/>
      </div>
      {/* Card */}
      <div style={{position:"absolute", bottom:86, left:0, right:0, padding:"0 20px", zIndex:10}}>
        {/* Placeholder image area */}
        <div style={{height:180, borderRadius:"14px 14px 0 0", background:T.surf, display:"flex", alignItems:"center", justifyContent:"center"}}>
          <div style={{fontFamily:"DM Sans,sans-serif", fontSize:10, color:T.sub, letterSpacing:1, textTransform:"uppercase"}}>café image</div>
        </div>
        <div style={{background:T.card, borderRadius:"0 0 14px 14px", padding:"16px 18px", borderTop:`1px solid ${T.border}`}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6}}>
            <div>
              <div style={{fontFamily:"Playfair Display,serif", fontSize:20, fontWeight:700, color:T.text}}>{cafe.name}</div>
              <div style={{fontFamily:"DM Sans,sans-serif", fontSize:11, color:T.sub, marginTop:1}}>{cafe.suburb} · {cafe.distance} · {cafe.price}</div>
            </div>
            <BusynessChip level={cafe.busyness}/>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12}}>
            <Stars rating={cafe.rating} size={11}/>
            <span style={{fontFamily:"DM Sans,sans-serif", fontSize:11, color:T.sub}}>{cafe.rating} ({cafe.reviewCount})</span>
          </div>
          <SeatBar avail={cafe.seatsAvail} total={cafe.seatsTotal} T={T}/>
          <div style={{display:"flex", gap:8, marginTop:14}}>
            <button onClick={() => setPopIdx(i => i+1)} style={{height:42, paddingInline:18, borderRadius:8, border:`1px solid ${T.border}`, background:"none", color:T.text, cursor:"pointer", fontFamily:"DM Sans,sans-serif", fontSize:12, fontWeight:600}}>
              Next
            </button>
            <button onClick={() => { selectCafe(cafe); navigate("cafe"); }} style={{flex:1, height:42, borderRadius:8, border:"none", background:T.primary, color:"#fff", cursor:"pointer", fontFamily:"DM Sans,sans-serif", fontSize:12, fontWeight:600}}>
              View Café
            </button>
          </div>
        </div>
        <div style={{textAlign:"center", marginTop:10, fontFamily:"DM Sans,sans-serif", fontSize:10, color:T.sub, letterSpacing:0.3}}>
          {popIdx % cafes.length + 1} / {cafes.length}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{height:"100%", background:T.bg, display:"flex", flexDirection:"column"}}>
      {/* Header — pushed below status bar (62px) + dynamic island */}
      <div style={{padding:"70px 20px 0", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0}}>
        <div>
          <div style={{fontFamily:"Playfair Display,serif", fontSize:22, fontWeight:700, color:T.text}}>Sydney, NSW</div>
          <div style={{fontFamily:"DM Sans,sans-serif", fontSize:11, color:T.sub, marginTop:1, letterSpacing:0.2}}>Cafés near you</div>
        </div>
        <LorinaLogo size={30} color={T.primary}/>
      </div>
      {/* Tabs */}
      <div style={{display:"flex", gap:0, padding:"14px 20px 0", flexShrink:0, borderBottom:`1px solid ${T.border}`}}>
        {[["nearby","Nearby"],["trending","Trending"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            marginRight:20, paddingBottom:10, border:"none", background:"none", cursor:"pointer",
            fontFamily:"DM Sans,sans-serif", fontSize:13, fontWeight:tab===k?700:400,
            color:tab===k?T.text:T.sub,
            borderBottom:`2px solid ${tab===k?T.primary:"transparent"}`,
          }}>{l}</button>
        ))}
      </div>
      {/* Cafe list */}
      <div style={{flex:1, overflow:"auto", padding:"12px 20px 82px"}}>
        {cafes.map(c => (
          <button key={c.id} onClick={() => { selectCafe(c); navigate("cafe"); }} style={{
            width:"100%", background:T.card, borderRadius:10, border:`1px solid ${T.border}`,
            padding:0, cursor:"pointer", textAlign:"left", overflow:"hidden", marginBottom:10, display:"block",
            boxShadow:T.dark ? "0 1px 8px rgba(0,0,0,0.2)" : "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            {/* Image placeholder */}
            <div style={{height:60, background:T.surf, display:"flex", alignItems:"center", justifyContent:"center", borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontFamily:"DM Sans,sans-serif", fontSize:9, color:T.sub, letterSpacing:1, textTransform:"uppercase"}}>{c.name}</span>
            </div>
            <div style={{padding:"11px 14px 13px"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4}}>
                <div style={{fontFamily:"DM Sans,sans-serif", fontSize:14, fontWeight:700, color:T.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", flex:1, marginRight:8}}>{c.name}</div>
                <BusynessChip level={c.busyness} mini/>
              </div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
                <span style={{fontFamily:"DM Sans,sans-serif", fontSize:10, color:T.sub}}>{c.suburb} · {c.distance} · {c.price}</span>
                <div style={{display:"flex", alignItems:"center", gap:4}}>
                  <Stars rating={c.rating} size={10}/>
                  <span style={{fontFamily:"DM Sans,sans-serif", fontSize:10, fontWeight:600, color:T.text}}>{c.rating}</span>
                </div>
              </div>
              <SeatBar avail={c.seatsAvail} total={c.seatsTotal} T={T}/>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Search ───────────────────────────────────────────────────────
function SearchScreen({T, navigate, selectCafe}) {
  const [q, setQ] = React.useState("");
  const [filters, setFilters] = React.useState([]);
  const cafes = window.CAFES;
  const fOpts = ["WiFi","Power Outlets","Quiet","Study Friendly","Open Now","CBD","Inner West","Under $20"];
  const res = cafes.filter(c =>
    q==="" || c.name.toLowerCase().includes(q.toLowerCase()) || c.suburb.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div style={{height:"100%", background:T.bg, display:"flex", flexDirection:"column"}}>
      <div style={{padding:"14px 20px 12px", borderBottom:`1px solid ${T.border}`, flexShrink:0}}>
        <div style={{fontFamily:"Playfair Display,serif", fontSize:21, fontWeight:700, color:T.text, marginBottom:12}}>Search</div>
        <div style={{display:"flex", alignItems:"center", gap:10, background:T.card, borderRadius:8, padding:"10px 14px", border:`1px solid ${T.border}`}}>
          <SearchIco color={T.sub}/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cafés, suburbs..." style={{flex:1, border:"none", background:"transparent", outline:"none", fontFamily:"DM Sans,sans-serif", fontSize:14, color:T.text}}/>
          {q && <button onClick={() => setQ("")} style={{background:"none", border:"none", cursor:"pointer", color:T.sub, fontSize:16, lineHeight:1}}>×</button>}
        </div>
        <div style={{display:"flex", gap:6, marginTop:10, overflowX:"auto", paddingBottom:2}}>
          {fOpts.map(f => {
            const sel = filters.includes(f);
            return (
              <button key={f} onClick={() => setFilters(p => sel ? p.filter(x => x!==f) : [...p, f])} style={{
                flexShrink:0, padding:"6px 12px", borderRadius:6,
                border:`1px solid ${sel ? T.primary : T.border}`,
                background:sel ? T.primary : T.card,
                color:sel ? "#fff" : T.sub,
                fontFamily:"DM Sans,sans-serif", fontSize:11, fontWeight:500,
                cursor:"pointer", whiteSpace:"nowrap",
              }}>{f}</button>
            );
          })}
        </div>
      </div>
      <div style={{flex:1, overflow:"auto", padding:"10px 20px 82px"}}>
        <div style={{fontFamily:"DM Sans,sans-serif", fontSize:10, color:T.sub, marginBottom:8, letterSpacing:0.5, textTransform:"uppercase"}}>{res.length} results</div>
        {res.map(c => (
          <button key={c.id} onClick={() => { selectCafe(c); navigate("cafe"); }} style={{
            width:"100%", background:T.card, borderRadius:10, border:`1px solid ${T.border}`,
            padding:"13px 14px", cursor:"pointer", textAlign:"left",
            display:"flex", gap:12, alignItems:"center", marginBottom:8,
          }}>
            <div style={{width:44, height:44, borderRadius:8, background:T.surf, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
              <div style={{fontFamily:"Playfair Display,serif", fontSize:18, fontWeight:700, color:T.sub}}>{c.name[0]}</div>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                <div style={{fontFamily:"DM Sans,sans-serif", fontSize:13, fontWeight:700, color:T.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{c.name}</div>
                <BusynessChip level={c.busyness} mini/>
              </div>
              <div style={{fontFamily:"DM Sans,sans-serif", fontSize:10, color:T.sub, marginTop:2}}>{c.suburb} · {c.distance} · {c.price}</div>
              <div style={{display:"flex", alignItems:"center", gap:4, marginTop:5}}>
                <Stars rating={c.rating} size={10}/>
                <span style={{fontFamily:"DM Sans,sans-serif", fontSize:10, color:T.sub}}>{c.rating}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────
function ProfileScreen({T}) {
  const stats = [{l:"Check-ins",v:"47"},{l:"Reviews",v:"23"},{l:"Followers",v:"184"}];
  const badges = [
    {l:"Study Regular", c:T.primary},
    {l:"Matcha Fan",    c:"#4A9E6A"},
    {l:"Early Riser",  c:"#C0882A"},
    {l:"Café Hopper",  c:T.secondary},
  ];
  return (
    <div style={{height:"100%", background:T.bg, overflow:"auto"}}>
      <div style={{background:T.card, borderBottom:`1px solid ${T.border}`, padding:"70px 20px 20px"}}>
        <div style={{display:"flex", alignItems:"center", gap:14}}>
          <div style={{width:62, height:62, borderRadius:"50%", background:T.surf, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Playfair Display,serif", fontSize:24, fontWeight:700, color:T.primary}}>S</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"Playfair Display,serif", fontSize:19, fontWeight:700, color:T.text}}>Sofia R.</div>
            <div style={{fontFamily:"DM Sans,sans-serif", fontSize:11, color:T.sub, marginTop:1}}>@sofiaR · UTS Sydney</div>
          </div>
          <button style={{background:"none", border:`1px solid ${T.border}`, borderRadius:7, padding:"7px 13px", fontFamily:"DM Sans,sans-serif", fontSize:11, color:T.text, cursor:"pointer", fontWeight:600}}>Edit</button>
        </div>
        <div style={{display:"flex", marginTop:18, paddingTop:16, borderTop:`1px solid ${T.border}`}}>
          {stats.map((s,i) => (
            <div key={s.l} style={{flex:1, textAlign:"center", borderRight:i<2?`1px solid ${T.border}`:""}}>
              <div style={{fontFamily:"Playfair Display,serif", fontSize:20, fontWeight:700, color:T.text}}>{s.v}</div>
              <div style={{fontFamily:"DM Sans,sans-serif", fontSize:10, color:T.sub, marginTop:1, letterSpacing:0.2}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"16px 20px 82px"}}>
        <div style={{fontFamily:"DM Sans,sans-serif", fontSize:10, fontWeight:700, color:T.sub, textTransform:"uppercase", letterSpacing:1, marginBottom:10}}>Badges</div>
        <div style={{display:"flex", gap:7, flexWrap:"wrap", marginBottom:20}}>
          {badges.map(b => (
            <div key={b.l} style={{background:b.c+"14", border:`1px solid ${b.c}28`, borderRadius:6, padding:"7px 12px"}}>
              <span style={{fontFamily:"DM Sans,sans-serif", fontSize:11, fontWeight:600, color:b.c}}>{b.l}</span>
            </div>
          ))}
        </div>
        <div style={{fontFamily:"DM Sans,sans-serif", fontSize:10, fontWeight:700, color:T.sub, textTransform:"uppercase", letterSpacing:1, marginBottom:10}}>Saved Cafés</div>
        {window.CAFES.slice(0,3).map(c => (
          <div key={c.id} style={{background:T.card, borderRadius:10, border:`1px solid ${T.border}`, padding:"11px 14px", marginBottom:8, display:"flex", alignItems:"center", gap:12}}>
            <div style={{width:38, height:38, borderRadius:7, background:T.surf, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
              <div style={{fontFamily:"Playfair Display,serif", fontSize:15, fontWeight:700, color:T.sub}}>{c.name[0]}</div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"DM Sans,sans-serif", fontSize:13, fontWeight:600, color:T.text}}>{c.name}</div>
              <div style={{fontFamily:"DM Sans,sans-serif", fontSize:10, color:T.sub, marginTop:1}}>{c.suburb}</div>
            </div>
            <Stars rating={c.rating} size={11}/>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window,{SplashScreen,OnboardingScreen,HomeScreen,SearchScreen,ProfileScreen});
