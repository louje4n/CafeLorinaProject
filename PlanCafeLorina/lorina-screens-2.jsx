
// ─── Map ─────────────────────────────────────────────────────────
function MapScreen({T, navigate, selectCafe}) {
  const [heatmap, setHeatmap] = React.useState(true);
  const [sel, setSel] = React.useState(null);
  const cafes = window.CAFES;
  const hCol = h => h<0.3 ? "#4A9E6A" : h<0.65 ? "#C0882A" : "#B84848";

  return (
    <div style={{height:"100%", position:"relative", overflow:"hidden"}}>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 402 740" preserveAspectRatio="xMidYMid slice">
        {/* Map base */}
        <rect width="402" height="740" fill={T.dark?"#181210":"#EEE8E0"}/>
        {/* Blocks */}
        {[[60,80,82,60],[162,60,102,80],[280,80,102,54],[38,180,122,90],[190,170,92,90],[300,160,92,100],[38,300,102,120],[168,290,112,120],[298,290,92,120],[38,450,122,90],[180,440,92,90],[298,440,92,80]].map(([x,y,w,h],i)=>(
          <rect key={i} x={x} y={y} width={w} height={h} rx="5" fill={T.dark?"#201810":"#E4DDD4"} opacity="0.75"/>
        ))}
        {/* Roads */}
        <rect x="0" y="152" width="402" height="20" fill={T.dark?"#2A1E14":"#D0C8BE"}/>
        <rect x="0" y="272" width="402" height="16" fill={T.dark?"#2A1E14":"#D0C8BE"}/>
        <rect x="0" y="432" width="402" height="14" fill={T.dark?"#2A1E14":"#D0C8BE"}/>
        <rect x="0" y="558" width="402" height="18" fill={T.dark?"#2A1E14":"#D0C8BE"}/>
        <rect x="28" y="0" width="20" height="740" fill={T.dark?"#2A1E14":"#D0C8BE"}/>
        <rect x="154" y="0" width="14" height="740" fill={T.dark?"#2A1E14":"#D0C8BE"}/>
        <rect x="284" y="0" width="14" height="740" fill={T.dark?"#2A1E14":"#D0C8BE"}/>
        {/* Road labels */}
        <text x="76" y="148" fontSize="7" fill={T.dark?"#7A6858":"#A09080"} fontFamily="DM Sans,sans-serif" fontWeight="500">Flinders St</text>
        <text x="76" y="268" fontSize="7" fill={T.dark?"#7A6858":"#A09080"} fontFamily="DM Sans,sans-serif" fontWeight="500">Collins St</text>
        {/* Park block */}
        <rect x="30" y="153" width="116" height="18" fill={T.dark?"#162010":"#C8DCC0"} opacity="0.5"/>
        <text x="58" y="165" fontSize="7" fill="#4A9E6A" fontFamily="DM Sans,sans-serif">Flagstaff Gardens</text>

        {/* Heatmap */}
        {heatmap && cafes.map(c=>{
          const cx=c.mapX/100*402, cy=c.mapY/100*600+60;
          return <React.Fragment key={c.id+"h"}>
            <circle cx={cx} cy={cy} r={52} fill={hCol(c.heat)} opacity={0.12}/>
            <circle cx={cx} cy={cy} r={26} fill={hCol(c.heat)} opacity={0.18}/>
          </React.Fragment>;
        })}
        {/* Pins */}
        {cafes.map(c=>{
          const cx=c.mapX/100*402, cy=c.mapY/100*600+60;
          const isSel=sel?.id===c.id;
          return (
            <g key={c.id} onClick={()=>setSel(isSel?null:c)} style={{cursor:"pointer"}}>
              <circle cx={cx} cy={cy} r={isSel?16:11} fill={isSel?T.primary:T.card} stroke={T.primary} strokeWidth={isSel?2:1.5} filter="drop-shadow(0 1px 3px rgba(0,0,0,0.15))"/>
              <circle cx={cx} cy={cy} r={isSel?5:4} fill={isSel?"#fff":T.primary}/>
            </g>
          );
        })}
      </svg>

      {/* Top bar */}
      <div style={{position:"absolute",top:14,left:14,right:14,display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:20}}>
        <div style={{background:T.card,borderRadius:8,padding:"9px 14px",fontFamily:"Playfair Display,serif",fontSize:17,fontWeight:700,color:T.text,boxShadow:"0 1px 8px rgba(0,0,0,0.08)",border:`1px solid ${T.border}`}}>
          Map
        </div>
        <button onClick={()=>setHeatmap(h=>!h)} style={{
          background:heatmap?T.primary:T.card, color:heatmap?"#fff":T.text,
          border:`1px solid ${heatmap?T.primary:T.border}`, borderRadius:8,
          padding:"9px 14px", fontFamily:"DM Sans,sans-serif", fontSize:11, fontWeight:600,
          cursor:"pointer", boxShadow:"0 1px 8px rgba(0,0,0,0.08)",
        }}>Heatmap {heatmap?"On":"Off"}</button>
      </div>

      {/* Legend */}
      {heatmap && (
        <div style={{position:"absolute",top:56,right:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 12px",zIndex:20}}>
          {[["Quiet","#4A9E6A"],["Moderate","#C0882A"],["Busy","#B84848"]].map(([l,c])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:c}}/>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:T.text}}>{l}</span>
            </div>
          ))}
        </div>
      )}

      {/* Bottom sheet */}
      {sel && (
        <div style={{position:"absolute",bottom:0,left:0,right:0,background:T.card,borderRadius:"16px 16px 0 0",padding:"16px 18px 20px",boxShadow:"0 -4px 20px rgba(0,0,0,0.1)",border:`1px solid ${T.border}`,zIndex:30}}>
          <div style={{width:32,height:3,borderRadius:2,background:T.border,margin:"0 auto 14px"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:T.text}}>{sel.name}</div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:T.sub,marginTop:2}}>{sel.suburb} · {sel.distance}</div>
            </div>
            <BusynessChip level={sel.busyness}/>
          </div>
          <SeatBar avail={sel.seatsAvail} total={sel.seatsTotal} T={T}/>
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button onClick={()=>{selectCafe(sel);navigate("cafe");}} style={{flex:1,height:42,borderRadius:8,border:"none",background:T.primary,color:"#fff",cursor:"pointer",fontFamily:"DM Sans,sans-serif",fontSize:13,fontWeight:600}}>
              View Café
            </button>
            <button onClick={()=>setSel(null)} style={{width:42,height:42,borderRadius:8,border:`1px solid ${T.border}`,background:T.surf,cursor:"pointer",color:T.sub,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Cafe Profile ─────────────────────────────────────────────────
function CafeProfileScreen({T, navigate, cafe}) {
  const c = cafe || window.CAFES[0];
  const reviews = (window.REVIEWS||[]).filter(r => r.cafeId===c.id);

  const amenityRows = [
    {label:"WiFi",              value:c.wifi ? "Available" : "Not available"},
    {label:"Power outlets",     value:c.power ? "Available" : "Not available"},
    {label:"Study score",       value:`${c.studyScore} / 5`},
    {label:"Opening hours",     value:c.hours},
    {label:"Price range",       value:c.price},
  ];

  return (
    <div style={{height:"100%", background:T.bg, display:"flex", flexDirection:"column", overflow:"hidden"}}>
      {/* Header band */}
      <div style={{height:108, background:T.surf, position:"relative", flexShrink:0, borderBottom:`1px solid ${T.border}`}}>
        <button onClick={()=>navigate("home")} style={{position:"absolute",top:12,left:14,background:T.card,border:`1px solid ${T.border}`,borderRadius:7,padding:"7px 13px",cursor:"pointer",fontFamily:"DM Sans,sans-serif",fontSize:12,color:T.text,fontWeight:500}}>
          ← Back
        </button>
        <div style={{position:"absolute",bottom:12,left:18,right:18,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:22,fontWeight:700,color:T.text,lineHeight:1.2}}>{c.name}</div>
          <BusynessChip level={c.busyness}/>
        </div>
      </div>

      <div style={{flex:1, overflow:"auto", padding:"14px 18px 82px"}}>
        {/* Rating row */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <Stars rating={c.rating}/>
          <span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:700,color:T.text}}>{c.rating}</span>
          <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:T.sub}}>({c.reviewCount} reviews)</span>
        </div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:T.sub,marginBottom:14,letterSpacing:0.1}}>{c.suburb} · {c.price} · {c.hours}</div>

        {/* Known for */}
        <div style={{borderLeft:`2px solid ${T.primary}`,paddingLeft:12,marginBottom:16}}>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:0.8,marginBottom:3}}>Known for</div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:13,color:T.text}}>{c.specialty}</div>
        </div>

        {/* Live seats */}
        <div style={{background:T.card,borderRadius:10,border:`1px solid ${T.border}`,padding:"14px 16px",marginBottom:12}}>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:0.9,marginBottom:10}}>Live Seat Availability</div>
          <SeatBar avail={c.seatsAvail} total={c.seatsTotal} T={T}/>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:T.sub,marginTop:6,letterSpacing:0.2}}>Updated 3 min ago · community sourced</div>
        </div>

        {/* Amenities */}
        <div style={{background:T.card,borderRadius:10,border:`1px solid ${T.border}`,marginBottom:12,overflow:"hidden"}}>
          {amenityRows.map((a,i) => (
            <div key={a.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:i<amenityRows.length-1?`1px solid ${T.border}`:""}}>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:T.sub}}>{a.label}</span>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,color:T.text}}>{a.value}</span>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          {c.tags.map(t => <Tag key={t} label={t} T={T}/>)}
        </div>

        {/* Reviews preview */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:0.9}}>Reviews</div>
          <button onClick={()=>navigate("reviews")} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"DM Sans,sans-serif",fontSize:12,color:T.primary,fontWeight:600}}>See all</button>
        </div>
        {reviews.slice(0,2).map(r => (
          <div key={r.id} style={{background:T.card,borderRadius:10,border:`1px solid ${T.border}`,padding:"13px",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:8}}>
              <Avi initials={r.avatar} size={30} color={T.primary}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:700,color:T.text}}>@{r.user}</div>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  <Stars rating={r.rating} size={10}/>
                  <span style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:T.sub}}>{r.time}</span>
                </div>
              </div>
            </div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:T.text,lineHeight:1.6}}>{r.text}</div>
          </div>
        ))}

        {/* Actions */}
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <button onClick={()=>navigate("community")} style={{flex:1,height:44,borderRadius:8,border:`1px solid ${T.border}`,background:"none",color:T.text,cursor:"pointer",fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600}}>
            Check In
          </button>
          <button onClick={()=>navigate("reviews")} style={{flex:1,height:44,borderRadius:8,border:"none",background:T.primary,color:"#fff",cursor:"pointer",fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600}}>
            Write Review
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reviews ──────────────────────────────────────────────────────
function ReviewsScreen({T, navigate, cafe}) {
  const [showForm, setShowForm] = React.useState(false);
  const [rat, setRat] = React.useState(0);
  const [txt, setTxt] = React.useState("");
  const c = cafe || window.CAFES[0];
  const reviews = (window.REVIEWS||[]).filter(r => r.cafeId===c.id);
  const avg = reviews.reduce((s,r) => s+r.rating, 0) / (reviews.length||1);

  return (
    <div style={{height:"100%", background:T.bg, display:"flex", flexDirection:"column"}}>
      {/* Nav */}
      <div style={{padding:"68px 18px 12px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <button onClick={()=>navigate("cafe")} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:T.text,lineHeight:1,padding:0}}>←</button>
        <div>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:16,fontWeight:700,color:T.text}}>{c.name}</div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:T.sub,letterSpacing:0.2}}>Reviews</div>
        </div>
      </div>

      {/* Summary */}
      <div style={{padding:"14px 18px",background:T.card,borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:16,flexShrink:0}}>
        <div style={{textAlign:"center",minWidth:56}}>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:30,fontWeight:700,color:T.text,lineHeight:1}}>{avg.toFixed(1)}</div>
          <Stars rating={avg} size={12}/>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:T.sub,marginTop:3}}>{reviews.length} reviews</div>
        </div>
        <div style={{flex:1}}>
          {[5,4,3,2,1].map(s => {
            const pct = reviews.length ? reviews.filter(r=>r.rating===s).length/reviews.length : 0;
            return (
              <div key={s} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                <span style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:T.sub,width:7,textAlign:"right"}}>{s}</span>
                <div style={{flex:1,height:4,borderRadius:2,background:T.border,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct*100}%`,background:T.primary,borderRadius:2}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{flex:1,overflow:"auto",padding:"12px 18px 82px"}}>
        {/* Write review */}
        {!showForm ? (
          <button onClick={()=>setShowForm(true)} style={{width:"100%",height:44,borderRadius:8,border:`1px dashed ${T.border}`,background:"none",color:T.sub,cursor:"pointer",fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,marginBottom:12}}>
            + Write a review
          </button>
        ) : (
          <div style={{background:T.card,borderRadius:10,border:`1px solid ${T.border}`,padding:"14px",marginBottom:12}}>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Your review</div>
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={()=>setRat(s)} style={{width:32,height:32,borderRadius:6,border:`1px solid ${s<=rat?"#C0882A":T.border}`,background:s<=rat?"#C0882A14":T.surf,cursor:"pointer",fontSize:15,color:s<=rat?"#C0882A":T.sub}}>★</button>
              ))}
            </div>
            <textarea value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Share your experience..." style={{width:"100%",border:`1px solid ${T.border}`,borderRadius:8,background:T.surf,padding:"10px 12px",color:T.text,fontFamily:"DM Sans,sans-serif",fontSize:13,resize:"none",height:76,outline:"none",boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <button onClick={()=>{setShowForm(false);setRat(0);setTxt("");}} style={{flex:1,height:38,borderRadius:7,border:`1px solid ${T.border}`,background:"none",color:T.sub,cursor:"pointer",fontFamily:"DM Sans,sans-serif",fontSize:12}}>Cancel</button>
              <button onClick={()=>{setShowForm(false);setRat(0);setTxt("");}} style={{flex:2,height:38,borderRadius:7,border:"none",background:T.primary,color:"#fff",cursor:"pointer",fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600}}>Post review</button>
            </div>
          </div>
        )}

        {reviews.map(r => (
          <div key={r.id} style={{background:T.card,borderRadius:10,border:`1px solid ${T.border}`,padding:"13px",marginBottom:9}}>
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}>
              <Avi initials={r.avatar} size={34} color={T.primary}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:700,color:T.text}}>@{r.user}</div>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  <Stars rating={r.rating}/>
                  <span style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:T.sub}}>{r.time}</span>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:3,color:T.sub}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                <span style={{fontFamily:"DM Sans,sans-serif",fontSize:10}}>{r.likes}</span>
              </div>
            </div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:T.text,lineHeight:1.65}}>{r.text}</div>
            {r.studyVibe && <div style={{marginTop:8,fontFamily:"DM Sans,sans-serif",fontSize:10,color:T.primary,fontWeight:600,letterSpacing:0.2}}>Great for studying</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Community ────────────────────────────────────────────────────
function CommunityScreen({T}) {
  const [selCafe, setSelCafe] = React.useState(null);
  const [busyness, setBusyness] = React.useState(null);
  const [posted, setPosted] = React.useState(false);
  const posts = window.COMMUNITY_POSTS;
  const cafes = window.CAFES;
  const bOpts = [
    {key:"quiet",    label:"Quiet",    sub:"Plenty of seats",  col:"#4A9E6A"},
    {key:"moderate", label:"Moderate", sub:"Getting busy",     col:"#C0882A"},
    {key:"busy",     label:"Busy",     sub:"Almost full",      col:"#B84848"},
  ];

  return (
    <div style={{height:"100%", background:T.bg, display:"flex", flexDirection:"column"}}>
      <div style={{padding:"14px 20px 12px", borderBottom:`1px solid ${T.border}`, flexShrink:0}}>
        <div style={{fontFamily:"Playfair Display,serif", fontSize:21, fontWeight:700, color:T.text}}>Live Updates</div>
        <div style={{fontFamily:"DM Sans,sans-serif", fontSize:11, color:T.sub, marginTop:2, letterSpacing:0.2}}>Community-sourced café status</div>
      </div>

      <div style={{flex:1, overflow:"auto", padding:"12px 18px 82px"}}>
        {/* Report card */}
        <div style={{background:T.card, borderRadius:10, border:`1px solid ${T.border}`, padding:"14px", marginBottom:16}}>
          <div style={{fontFamily:"DM Sans,sans-serif", fontSize:10, fontWeight:700, color:T.sub, textTransform:"uppercase", letterSpacing:0.9, marginBottom:10}}>Report a café</div>
          {/* Café selector */}
          <div style={{display:"flex", gap:6, overflowX:"auto", marginBottom:12, paddingBottom:2}}>
            {cafes.map(c => {
              const isSel = selCafe?.id===c.id;
              return (
                <button key={c.id} onClick={()=>setSelCafe(isSel?null:c)} style={{
                  flexShrink:0, padding:"6px 12px", borderRadius:6, cursor:"pointer",
                  border:`1px solid ${isSel?T.primary:T.border}`,
                  background:isSel?T.primary:T.surf,
                  color:isSel?"#fff":T.text,
                  fontFamily:"DM Sans,sans-serif", fontSize:11, fontWeight:isSel?600:400,
                  whiteSpace:"nowrap",
                }}>{c.name}</button>
              );
            })}
          </div>
          {/* Busyness selector */}
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7, marginBottom:12}}>
            {bOpts.map(opt => {
              const isSel = busyness===opt.key;
              return (
                <button key={opt.key} onClick={()=>setBusyness(isSel?null:opt.key)} style={{
                  padding:"11px 6px", borderRadius:8, cursor:"pointer",
                  border:`1px solid ${isSel?opt.col:T.border}`,
                  background:isSel?opt.col+"14":T.surf,
                }}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginBottom:3}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:opt.col}}/>
                    <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,fontWeight:700,color:isSel?opt.col:T.text}}>{opt.label}</span>
                  </div>
                  <div style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:T.sub,textAlign:"center"}}>{opt.sub}</div>
                </button>
              );
            })}
          </div>
          {posted ? (
            <div style={{height:38,borderRadius:8,background:T.surf,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,color:T.primary}}>
              Update shared — thank you
            </div>
          ) : (
            <button onClick={()=>{if(selCafe&&busyness){setPosted(true);setTimeout(()=>{setPosted(false);setBusyness(null);setSelCafe(null);},2500);}}} style={{
              width:"100%",height:38,borderRadius:8,border:"none",cursor:"pointer",
              background:selCafe&&busyness?T.primary:T.border, color:"#fff",
              fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,
              opacity:selCafe&&busyness?1:0.5, transition:"all 0.2s",
            }}>Share update</button>
          )}
        </div>

        {/* Feed */}
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Recent</div>
        {posts.map(p => (
          <div key={p.id} style={{background:T.card,borderRadius:10,border:`1px solid ${T.border}`,padding:"12px 14px",marginBottom:9}}>
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}>
              <Avi initials={p.avatar} size={32} color={T.primary}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:700,color:T.text}}>@{p.user}</div>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:T.sub}}>at {p.cafeName} · {p.time}</div>
              </div>
              <BusynessChip level={p.busyness} mini/>
            </div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:T.text,lineHeight:1.6}}>{p.text}</div>
            <div style={{display:"flex",alignItems:"center",gap:14,marginTop:10}}>
              <button style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",color:T.sub,fontFamily:"DM Sans,sans-serif",fontSize:11}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
                Helpful · {p.likes}
              </button>
              <button style={{background:"none",border:"none",cursor:"pointer",color:T.sub,fontFamily:"DM Sans,sans-serif",fontSize:11}}>Reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window,{MapScreen,CafeProfileScreen,ReviewsScreen,CommunityScreen});
