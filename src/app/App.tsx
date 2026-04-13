import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, MessageCircle, Bell, BellOff, Zap, Users } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────── */
interface FlashHang {
  id: string; memberId: string; location: string; duration: string;
  time: string; locEmoji: string; joined?: boolean; vibe?: string;
  note?: string; joiners: string[]; minutesLeft: number; notifyMe?: boolean;
}
interface Member { id: string; name: string; initials: string; }

/* ─── Static Data ────────────────────────────────────────── */
const MEMBERS: Member[] = [
  { id:"m1",  name:"Alex Reid",   initials:"AR" }, { id:"m2",  name:"Sara Chen",   initials:"SC" },
  { id:"m3",  name:"Jake Morris", initials:"JM" }, { id:"m4",  name:"Priya Nair",  initials:"PN" },
  { id:"m5",  name:"Tom Wells",   initials:"TW" }, { id:"m6",  name:"Lena Park",   initials:"LP" },
  { id:"m7",  name:"Omar Faris",  initials:"OF" }, { id:"m8",  name:"Nina Rossi",  initials:"NR" },
  { id:"m9",  name:"Felix Braun", initials:"FB" }, { id:"m10", name:"Yuki Tanaka", initials:"YT" },
  { id:"m11", name:"Cleo Vance",  initials:"CV" },
];
const MEMBER_GRADIENTS: Record<string, string> = {
  m1:"linear-gradient(135deg,#6366f1,#8b5cf6)", m2:"linear-gradient(135deg,#ec4899,#f43f5e)",
  m3:"linear-gradient(135deg,#14b8a6,#06b6d4)", m4:"linear-gradient(135deg,#f59e0b,#f97316)",
  m5:"linear-gradient(135deg,#10b981,#84cc16)", m6:"linear-gradient(135deg,#e879f9,#a855f7)",
  m7:"linear-gradient(135deg,#38bdf8,#818cf8)", m8:"linear-gradient(135deg,#fb7185,#f43f5e)",
  m9:"linear-gradient(135deg,#a3e635,#4ade80)", m10:"linear-gradient(135deg,#c084fc,#818cf8)",
  m11:"linear-gradient(135deg,#67e8f9,#a78bfa)",
};
const VIBES = [
  { label:"Chill",      emoji:"😌", bg:"rgba(59,130,246,0.2)",  border:"rgba(59,130,246,0.35)",  text:"#93c5fd", accent:"#3b82f6" },
  { label:"Networking", emoji:"🤝", bg:"rgba(74,222,128,0.18)", border:"rgba(74,222,128,0.35)",  text:"#86efac", accent:"#4ade80" },
  { label:"Creative",   emoji:"🎨", bg:"rgba(234,179,8,0.18)",  border:"rgba(234,179,8,0.35)",   text:"#fcd34d", accent:"#eab308" },
  { label:"Deep Talk",  emoji:"💬", bg:"rgba(168,85,247,0.2)",  border:"rgba(168,85,247,0.4)",   text:"#c084fc", accent:"#a855f7" },
  { label:"Energy",     emoji:"🔥", bg:"rgba(239,68,68,0.18)",  border:"rgba(239,68,68,0.35)",   text:"#fca5a5", accent:"#ef4444" },
];
const LOCATIONS = [
  { label:"🌿 Garden",    value:"Festival Garden" }, { label:"☕ Coffee Bar", value:"Coffee Bar" },
  { label:"🎯 Studio A",  value:"Studio A"        }, { label:"🎪 Main Stage", value:"Main Stage" },
  { label:"🍕 Food Court",value:"Food Court"      }, { label:"🛋️ Chill Zone", value:"Chill Zone" },
];
const DURATIONS = ["10 min","20 min","30 min","1 hr"];
const INITIAL_HANGS: FlashHang[] = [
  { id:"fh1", memberId:"m11", location:"Festival Garden", duration:"20 min", time:"2m ago",  locEmoji:"🌿", vibe:"Chill",      joiners:["m3","m7"], minutesLeft:18, note:"Near the water feature, come chill 💦" },
  { id:"fh2", memberId:"m9",  location:"Coffee Bar",      duration:"15 min", time:"5m ago",  locEmoji:"☕", vibe:"Energy",     joiners:["m1"],      minutesLeft:10, note:"" },
  { id:"fh3", memberId:"m4",  location:"Main Stage",      duration:"30 min", time:"11m ago", locEmoji:"🎪", vibe:"Networking", joiners:[],          minutesLeft:19, note:"Watching the lineup rundown, great to chat!" },
];

/* ─── Helpers ────────────────────────────────────────────── */
function getMember(id: string): Member {
  return MEMBERS.find(m => m.id === id) ?? { id, name:"You", initials:"ME" };
}
function getMemberGradient(id: string): string {
  return MEMBER_GRADIENTS[id] ?? "linear-gradient(135deg,#475569,#334155)";
}
function getVibe(label?: string) { return VIBES.find(v => v.label === label); }
function getLocEmoji(location: string): string {
  return LOCATIONS.find(l => l.value === location)?.label.split(" ")[0] ?? "📍";
}
function durationToMinutes(d: string): number {
  if (d === "10 min") return 10; if (d === "20 min") return 20;
  if (d === "30 min") return 30; return 60;
}

/* ─── Perf flag ──────────────────────────────────────────── */
const IS_LOW_PERF = typeof window !== "undefined" && (
  window.innerWidth <= 640 || window.matchMedia("(prefers-reduced-motion: reduce)").matches
);

/* ─── Global Styles ──────────────────────────────────────── */
function GlobalStyles() {
  return (
    <style>{`
      @keyframes orb1{0%,100%{transform:translate3d(0,0,0)}25%{transform:translate3d(55px,-45px,0)}50%{transform:translate3d(-30px,70px,0)}75%{transform:translate3d(20px,-20px,0)}}
      @keyframes orb2{0%,100%{transform:translate3d(0,0,0)}25%{transform:translate3d(-65px,55px,0)}50%{transform:translate3d(35px,-50px,0)}75%{transform:translate3d(-15px,30px,0)}}
      @keyframes orb3{0%,100%{transform:translate3d(0,0,0)}25%{transform:translate3d(40px,-35px,0)}50%{transform:translate3d(-55px,25px,0)}75%{transform:translate3d(25px,-45px,0)}}
      @keyframes orb4{0%,100%{transform:translate3d(0,0,0)}25%{transform:translate3d(-30px,40px,0)}50%{transform:translate3d(50px,-30px,0)}75%{transform:translate3d(-10px,20px,0)}}
      @keyframes ticker-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      @keyframes me-glow{0%,100%{opacity:0.32}50%{opacity:0.82}}
      @keyframes hint-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
      @keyframes hint-float-h{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
      .fh-ticker{animation:ticker-scroll 30s linear infinite;white-space:nowrap;display:inline-block}
      .fh-me-glow{animation:me-glow 2.8s ease-in-out infinite}
      .fh-hint-float{animation:hint-float-h 2.4s ease-in-out infinite}
      .fh-hint-float-v{animation:hint-float 2.4s ease-in-out infinite}
      @media(prefers-reduced-motion:reduce){.fh-orb,.fh-ticker,.fh-me-glow,.fh-hint-float,.fh-hint-float-v{animation:none!important}}
      @media(max-width:640px){.fh-main-card{backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important}.fh-hang-card{backdrop-filter:none!important}}
      *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
      input,button{font-family:inherit}
    `}</style>
  );
}

/* ─── Floating Orbs — CSS-compositor, zero JS per frame ─── */
function FloatingOrbs() {
  if (IS_LOW_PERF) return null;
  const base: React.CSSProperties = { position:"absolute", borderRadius:"50%", filter:"blur(12px)", willChange:"transform" };
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      <div style={{ ...base, top:-140, left:-100, width:520, height:520,
        background:"radial-gradient(circle,rgba(124,58,237,0.32) 0%,transparent 70%)",
        animationName:"orb1", animationDuration:"22s", animationTimingFunction:"ease-in-out", animationIterationCount:"infinite" }}/>
      <div style={{ ...base, bottom:-100, right:-80, width:460, height:460,
        background:"radial-gradient(circle,rgba(217,70,239,0.26) 0%,transparent 70%)",
        animationName:"orb2", animationDuration:"28s", animationTimingFunction:"ease-in-out", animationIterationCount:"infinite", animationDelay:"4s" }}/>
      <div style={{ ...base, top:"38%", left:"55%", width:320, height:320,
        background:"radial-gradient(circle,rgba(56,189,248,0.14) 0%,transparent 70%)",
        animationName:"orb3", animationDuration:"34s", animationTimingFunction:"ease-in-out", animationIterationCount:"infinite", animationDelay:"9s" }}/>
      <div style={{ ...base, top:"15%", right:"-5%", width:280, height:280,
        background:"radial-gradient(circle,rgba(168,85,247,0.16) 0%,transparent 70%)",
        animationName:"orb4", animationDuration:"40s", animationTimingFunction:"ease-in-out", animationIterationCount:"infinite", animationDelay:"15s" }}/>
    </div>
  );
}

/* ─── Festival Ticker ────────────────────────────────────── */
function FestivalTicker() {
  const items = ["⚡ SIGNAL FEST 2026","4 hangs live","247 people at the festival",
    "drop in · show up · connect","spontaneous meetups, zero planning","your people are nearby"];
  const t = items.join("   ·   ");
  return (
    <div style={{ overflow:"hidden", borderBottom:"1px solid rgba(255,255,255,0.05)",
      padding:"9px 0", background:"rgba(0,0,0,0.22)" }}>
      <div className="fh-ticker" style={{ fontSize:10, fontWeight:700, color:"#4b5563",
        letterSpacing:"0.1em", textTransform:"uppercase" }}>
        {t + "   ·   " + t}
      </div>
    </div>
  );
}

/* ─── Fixed Hint Bubble ──────────────────────────────────── */
// Renders via portal, positioned in the dark space OUTSIDE the glass card.
// On wide screens → full horizontal calligraphy label to the side.
// On narrow screens → vertical handwritten text peeking from viewport edge.
function FixedHintBubble({ text, side, topPx, show, vw, cardLeft, cardRight }: {
  text: string; side: "left" | "right"; topPx: number; show: boolean;
  vw: number; cardLeft: number; cardRight: number;
}) {
  const sideRoom = side === "left" ? cardLeft : vw - cardRight;
  // Enough room for full label when >= 100px available beside the card
  const hasRoom = sideRoom >= 100;
  const slideX = side === "left" ? -36 : 36;
  const GAP = 14;

  // Positioned styles
  const fixedPos: React.CSSProperties = {
    position: "fixed",
    top: topPx,
    zIndex: 9990,
    pointerEvents: "none",
    ...(hasRoom
      ? side === "left"
        ? { right: vw - cardLeft + GAP }   // label sits to the left of the card
        : { left: cardRight + GAP }         // label sits to the right of the card
      : side === "left"
        ? { left: 3 }                       // peek from left viewport edge
        : { right: 3 }                      // peek from right viewport edge
    ),
  };

  // Curved SVG arrows — hand-drawn feel, strokeLinecap round
  const ArrowRight = () => (
    <svg width={hasRoom ? 54 : 22} height={hasRoom ? 26 : 14} viewBox="0 0 54 26" fill="none">
      <path d="M4,13 C14,6 32,20 48,13" stroke="#fef08a" strokeWidth={hasRoom ? 2.5 : 2} strokeLinecap="round"/>
      <path d="M48,13 L40,8 M48,13 L40,18" stroke="#fef08a" strokeWidth={hasRoom ? 2.5 : 2} strokeLinecap="round"/>
    </svg>
  );
  const ArrowLeft = () => (
    <svg width={hasRoom ? 54 : 22} height={hasRoom ? 26 : 14} viewBox="0 0 54 26" fill="none">
      <path d="M50,13 C40,6 22,20 6,13" stroke="#fef08a" strokeWidth={hasRoom ? 2.5 : 2} strokeLinecap="round"/>
      <path d="M6,13 L14,8 M6,13 L14,18" stroke="#fef08a" strokeWidth={hasRoom ? 2.5 : 2} strokeLinecap="round"/>
    </svg>
  );
  const Arrow = side === "left" ? <ArrowRight/> : <ArrowLeft/>;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity:0, x:slideX }}
          animate={{ opacity:1, x:0 }}
          exit={{ opacity:0, x:slideX, transition:{ duration:0.22 } }}
          transition={{ duration:0.55, ease:[0.22,1,0.36,1], delay:0.9 }}
          style={fixedPos}
        >
          {hasRoom ? (
            /* ── Desktop: horizontal label, gently floating ── */
            <div className="fh-hint-float" style={{
              display:"flex", alignItems:"center", gap:8,
              flexDirection: side === "left" ? "row" : "row-reverse",
            }}>
              <span style={{
                fontFamily:"'Caveat', cursive",
                fontSize:20, fontWeight:700,
                color:"#fef08a",
                textShadow:"0 0 28px rgba(254,240,138,0.45), 0 1px 14px rgba(0,0,0,0.95)",
                whiteSpace:"nowrap",
                letterSpacing:"0.01em",
              }}>
                {text}
              </span>
              {Arrow}
            </div>
          ) : (
            /* ── Mobile: vertical margin annotation ── */
            <div className="fh-hint-float-v" style={{
              display:"flex",
              flexDirection: side === "left" ? "row" : "row-reverse",
              alignItems:"center",
              gap:3,
            }}>
              <span style={{
                fontFamily:"'Caveat', cursive",
                fontSize:12, fontWeight:700,
                color:"#fef08a",
                textShadow:"0 1px 8px rgba(0,0,0,0.95), 0 0 12px rgba(254,240,138,0.35)",
                // Vertical text: left side reads bottom→top (rotated), right reads top→bottom
                writingMode:"vertical-rl",
                transform: side === "left" ? "rotate(180deg)" : "none",
                letterSpacing:"0.05em",
                lineHeight:1.15,
              }}>
                {text}
              </span>
              {Arrow}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Toast ──────────────────────────────────────────────── */
function Toast({ message, onDone }: { message:string; onDone:()=>void }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return ()=>clearTimeout(t); }, [onDone]);
  const el = typeof document !== "undefined" ? document.body : null;
  if (!el) return null;
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ scale:0.82, y:-20, opacity:0 }} animate={{ scale:1, y:0, opacity:1 }}
        exit={{ scale:0.82, y:-16, opacity:0 }} transition={{ type:"spring", stiffness:420, damping:28 }}
        style={{ position:"fixed", top:24, left:"50%", transform:"translateX(-50%)",
          zIndex:99999, background:"linear-gradient(135deg,#7c3aed,#d946ef)",
          color:"#fff", padding:"11px 24px", borderRadius:999, fontSize:13, fontWeight:700,
          boxShadow:"0 8px 40px rgba(168,85,247,0.55), 0 0 0 1px rgba(255,255,255,0.1)",
          whiteSpace:"nowrap", pointerEvents:"none", letterSpacing:"0.01em" }}>
        {message}
      </motion.div>
    </AnimatePresence>,
    el
  );
}

/* ─── Section Divider ────────────────────────────────────── */
function SectionDivider({ label }: { label:string }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0 2px" }}>
      <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.07))" }}/>
      <span style={{ fontSize:9, fontWeight:800, color:"#374151", letterSpacing:"0.14em",
        textTransform:"uppercase", display:"flex", alignItems:"center", gap:5 }}>
        <Users size={9} color="#374151"/> {label}
      </span>
      <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(255,255,255,0.07),transparent)" }}/>
    </motion.div>
  );
}

/* ─── Vibe Badge ─────────────────────────────────────────── */
function VibeBadge({ label }: { label:string }) {
  const v = getVibe(label);
  if (!v) return null;
  return (
    <span style={{ background:v.bg, color:v.text, border:`1px solid ${v.border}`,
      fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:999,
      display:"inline-flex", alignItems:"center", gap:4 }}>
      {v.emoji} {v.label}
    </span>
  );
}

/* ─── Hang Card ──────────────────────────────────────────── */
interface HangCardProps {
  hang: FlashHang; index: number;
  onJoin:(id:string)=>void; onBoost:(id:string)=>void;
  onCancel:(id:string)=>void; onToast:(msg:string)=>void;
  onNotifyToggle:(id:string)=>void;
  onDismissJoin?:()=>void; onDismissExpand?:()=>void;
}
function HangCard({ hang, index, onJoin, onBoost, onCancel, onToast, onNotifyToggle,
  onDismissJoin, onDismissExpand }: HangCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isMe = hang.memberId === "me";
  const member = isMe ? { name:"You", initials:"ME" } : getMember(hang.memberId);
  const totalMin = durationToMinutes(hang.duration);
  const pct = Math.max(0, Math.min(100, (hang.minutesLeft / totalMin) * 100));
  const barColor = pct > 50 ? "#4ade80" : pct > 20 ? "#fbbf24" : "#ef4444";
  const barGlow  = pct > 50 ? "rgba(74,222,128,0.6)" : pct > 20 ? "rgba(251,191,36,0.6)" : "rgba(239,68,68,0.6)";
  const expiring = hang.minutesLeft <= 5;
  const expired  = hang.minutesLeft === 0;
  const visibleJoiners = hang.joiners.slice(0, 3);
  const overflow = hang.joiners.length - 3;
  const isHot = hang.joiners.length >= 2 && !isMe;
  const vibe = getVibe(hang.vibe);
  const avatarGradient = isMe ? "linear-gradient(135deg,#7c3aed,#d946ef)" : getMemberGradient(hang.memberId);

  const handleExpand = () => {
    if (!expanded) onDismissExpand?.();
    setExpanded(e => !e);
  };

  const card = (
    <motion.div
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, y:-10, scale:0.97 }}
      transition={{ delay:index*0.06, duration:0.35, ease:[0.22,1,0.36,1] }}
      whileHover={{ y:-3, transition:{ duration:0.16 } }}
      className="fh-hang-card"
      style={{ borderRadius:20,
        background: isMe ? "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(217,70,239,0.08))" : "rgba(255,255,255,0.04)",
        border: isMe ? "1px solid rgba(168,85,247,0.45)" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: isMe ? "0 0 0 1px rgba(168,85,247,0.1),0 8px 32px rgba(124,58,237,0.15)" : "0 2px 12px rgba(0,0,0,0.25)",
        overflow:"hidden", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", willChange:"transform" }}>

      {/* Vibe accent strip */}
      {vibe ? (
        <div style={{ height:2, background:`linear-gradient(90deg,transparent 0%,${vibe.accent}99 40%,${vibe.accent}99 60%,transparent 100%)` }}/>
      ) : isMe ? (
        <div className="fh-me-glow" style={{ height:2,
          background:"linear-gradient(90deg,transparent,rgba(168,85,247,0.9),rgba(217,70,239,0.9),transparent)" }}/>
      ) : null}

      {/* Main row */}
      <div onClick={handleExpand} style={{ padding:"14px 16px 12px", userSelect:"none", cursor:"pointer" }}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>

          {/* Avatar */}
          <div style={{ width:44, height:44, borderRadius:"50%", flexShrink:0,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:avatarGradient,
            border: isMe ? "2px solid rgba(217,70,239,0.5)" : "2px solid rgba(255,255,255,0.09)",
            fontSize:12, fontWeight:800, color:"#fff", letterSpacing:"-0.02em",
            boxShadow: isMe ? "0 0 20px rgba(168,85,247,0.5)" : "0 0 10px rgba(0,0,0,0.3)" }}>
            {isMe ? "ME" : member.initials}
          </div>

          {/* Info */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
              <span style={{ color:"#f1f5f9", fontSize:14, fontWeight:700 }}>
                {hang.locEmoji} {hang.location}
              </span>
              {hang.vibe && <VibeBadge label={hang.vibe}/>}
              {isHot && (
                <motion.span initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }}
                  transition={{ type:"spring", stiffness:500, damping:20 }}
                  style={{ fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:999,
                    background:"rgba(239,68,68,0.18)", color:"#fca5a5",
                    border:"1px solid rgba(239,68,68,0.3)" }}>
                  🔥 Hot
                </motion.span>
              )}
            </div>

            {/* Progress bar */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8 }}>
              <div style={{ flex:1, height:4, borderRadius:999, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
                <motion.div animate={{ width:`${pct}%` }} transition={{ duration:0.7, ease:"easeOut" }}
                  style={{ height:"100%", background:barColor, borderRadius:999, boxShadow:`0 0 8px ${barGlow}` }}/>
              </div>
              <span style={{ fontSize:11, fontWeight:700, whiteSpace:"nowrap",
                color: expired ? "#ef4444" : expiring ? "#f87171" : "#64748b" }}>
                {expired ? "Expired" : `${hang.minutesLeft}m left`}
              </span>
            </div>

            {/* Joiner stack */}
            <div style={{ marginTop:6, display:"flex", alignItems:"center", gap:6 }}>
              {visibleJoiners.length > 0 && (
                <div style={{ display:"flex", alignItems:"center" }}>
                  {visibleJoiners.map((jid, i) => (
                    <motion.div key={jid} initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }}
                      transition={{ type:"spring", stiffness:500, damping:22, delay:0.05*i }}
                      style={{ marginLeft:i===0?0:-8, zIndex:visibleJoiners.length-i,
                        width:22, height:22, borderRadius:"50%",
                        border:"2px solid rgba(12,10,20,1)", background:getMemberGradient(jid),
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:7, fontWeight:800, color:"#fff" }}>
                      {getMember(jid).initials.slice(0,1)}
                    </motion.div>
                  ))}
                  {overflow > 0 && (
                    <div style={{ marginLeft:-8, zIndex:0, width:22, height:22, borderRadius:"50%",
                      border:"2px solid rgba(12,10,20,1)", background:"rgba(255,255,255,0.08)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:7, fontWeight:800, color:"#64748b" }}>+{overflow}</div>
                  )}
                </div>
              )}
              <span style={{ fontSize:11, color:"#475569" }}>
                {hang.joiners.length > 0
                  ? <><motion.span key={hang.joiners.length} initial={{ opacity:0, y:-6 }}
                      animate={{ opacity:1, y:0 }}>{hang.joiners.length}</motion.span> joining</>
                  : "Be first to join!"}
                {" · "}{hang.time}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:7, flexShrink:0 }}>
            {!isMe && (
              <motion.button
                id={onDismissJoin ? "fh-target-join" : undefined}
                whileTap={{ scale:0.88 }} whileHover={{ scale:1.06 }}
                onClick={e => { e.stopPropagation(); onJoin(hang.id); onDismissJoin?.(); }}
                style={{ padding:"7px 14px", borderRadius:999, border:"none",
                  cursor:"pointer", fontSize:12, fontWeight:700,
                  background: hang.joined ? "rgba(74,222,128,0.15)" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                  color: hang.joined ? "#4ade80" : "#fff",
                  boxShadow: hang.joined ? "0 0 0 1px rgba(74,222,128,0.25)"
                    : "0 3px 14px rgba(124,58,237,0.5),inset 0 1px 0 rgba(255,255,255,0.15)",
                  transition:"all 0.2s", whiteSpace:"nowrap" }}>
                {hang.joined ? "✓ In!" : "Join 🙌"}
              </motion.button>
            )}
            <motion.div
              id={onDismissExpand ? "fh-target-expand" : undefined}
              animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration:0.26, ease:[0.22,1,0.36,1] }}>
              <ChevronDown size={15} color={expanded ? "#a78bfa" : "#475569"}/>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expiring strip */}
      <AnimatePresence>
        {expiring && !expired && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:[0.6,1,0.6] }}
            transition={{ duration:1.3, repeat:Infinity }}
            style={{ background:"linear-gradient(90deg,rgba(239,68,68,0.06),rgba(239,68,68,0.12),rgba(239,68,68,0.06))",
              borderTop:"1px solid rgba(239,68,68,0.2)", padding:"5px 16px",
              fontSize:11, fontWeight:600, color:"#fca5a5", textAlign:"center" }}>
            ⚠️ Expiring soon — join before it's gone!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded panel */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div key="panel" initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
            exit={{ height:0, opacity:0 }} transition={{ duration:0.26, ease:[0.22,1,0.36,1] }}
            style={{ overflow:"hidden" }}>
            <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)",
              padding:"12px 16px 14px", display:"flex", flexDirection:"column", gap:10 }}>
              {hang.note && (
                <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)",
                  borderRadius:12, padding:"9px 13px", color:"#94a3b8", fontSize:13, fontStyle:"italic" }}>
                  "{hang.note}"
                </div>
              )}
              {hang.joiners.length > 0 && (
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:"#475569", marginBottom:6 }}>Who's joining</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {hang.joiners.map(jid => {
                      const m = getMember(jid);
                      return (
                        <span key={jid} style={{ background:getMemberGradient(jid), color:"#fff",
                          fontSize:12, fontWeight:700, padding:"4px 10px", borderRadius:999,
                          boxShadow:"0 2px 8px rgba(0,0,0,0.25)" }}>
                          {m.initials} {m.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              {isMe ? (
                <div style={{ display:"flex", gap:8 }}>
                  <motion.button whileTap={{ scale:0.93 }} whileHover={{ scale:1.02 }}
                    onClick={() => onBoost(hang.id)}
                    style={{ flex:1, padding:"10px 0", borderRadius:12,
                      border:"1px solid rgba(168,85,247,0.35)", background:"rgba(168,85,247,0.1)",
                      color:"#c084fc", fontSize:13, fontWeight:700, cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                    <Zap size={13}/> Boost +10 min
                  </motion.button>
                  <motion.button whileTap={{ scale:0.93 }} whileHover={{ scale:1.02 }}
                    onClick={() => onCancel(hang.id)}
                    style={{ flex:1, padding:"10px 0", borderRadius:12,
                      border:"1px solid rgba(239,68,68,0.25)", background:"rgba(239,68,68,0.07)",
                      color:"#f87171", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                    Cancel hang
                  </motion.button>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#475569" }}>Quick message to host</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {["On my way! 🏃","Save me a spot! 💜","5 min away 👋","Sounds fun! 🎉"].map(qr => (
                      <motion.button key={qr} whileTap={{ scale:0.92 }} whileHover={{ scale:1.04 }}
                        onClick={() => onToast(`Sent: "${qr}" 📨`)}
                        style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)",
                          color:"#cbd5e1", fontSize:12, fontWeight:600, padding:"6px 12px",
                          borderRadius:999, cursor:"pointer" }}>
                        {qr}
                      </motion.button>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:2 }}>
                    <motion.button whileTap={{ scale:0.93 }} whileHover={{ scale:1.02 }}
                      onClick={() => onToast(`Opening chat with ${getMember(hang.memberId).name}...`)}
                      style={{ flex:1, padding:"10px 0", borderRadius:12,
                        background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none", color:"#fff",
                        fontSize:13, fontWeight:700, cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                        boxShadow:"0 3px 16px rgba(124,58,237,0.4)" }}>
                      <MessageCircle size={14}/> Message {getMember(hang.memberId).name.split(" ")[0]}
                    </motion.button>
                    <motion.button whileTap={{ scale:0.9 }} whileHover={{ scale:1.05 }}
                      onClick={() => onNotifyToggle(hang.id)}
                      style={{ width:42, height:42, borderRadius:12,
                        border:"1px solid rgba(255,255,255,0.08)",
                        background: hang.notifyMe ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.04)",
                        color: hang.notifyMe ? "#fbbf24" : "#475569",
                        cursor:"pointer", display:"flex", alignItems:"center",
                        justifyContent:"center", flexShrink:0, transition:"all 0.2s" }}>
                      {hang.notifyMe ? <Bell size={15}/> : <BellOff size={15}/>}
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Outer wrapper keeps "me" glow outside the overflow:hidden card
  return (
    <div style={{ position:"relative" }}>
      {isMe && (
        <div className="fh-me-glow" style={{ position:"absolute", inset:-1, borderRadius:21,
          pointerEvents:"none", zIndex:0,
          boxShadow:"0 0 28px rgba(168,85,247,0.35),0 0 60px rgba(124,58,237,0.18)" }}/>
      )}
      <div style={{ position:"relative", zIndex:1 }}>{card}</div>
    </div>
  );
}

/* ─── Creation Form ──────────────────────────────────────��─ */
function CreationForm({ onSubmit, onCancel, onDismissLocation }: {
  onSubmit:(data:Partial<FlashHang>)=>void;
  onCancel:()=>void;
  onDismissLocation?:()=>void;
}) {
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [vibe, setVibe]         = useState("");
  const [note, setNote]         = useState("");
  const canSubmit = !!(location && duration);

  return (
    <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
      exit={{ height:0, opacity:0 }} transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}
      style={{ overflow:"hidden" }}>
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(168,85,247,0.2)",
        borderRadius:20, padding:"18px 16px 16px", display:"flex", flexDirection:"column", gap:18,
        boxShadow:"inset 0 1px 0 rgba(255,255,255,0.04),0 0 40px rgba(168,85,247,0.06)" }}>

        {/* Location */}
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:"#6b7280", letterSpacing:"0.12em", marginBottom:10 }}>
            📍 WHERE ARE YOU?
          </div>
          <div id="fh-target-location" style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
            {LOCATIONS.map(loc => {
              const active = location === loc.value;
              return (
                <motion.button key={loc.value} whileTap={{ scale:0.91 }} whileHover={{ scale:1.03 }}
                  onClick={() => { setLocation(loc.value); onDismissLocation?.(); }}
                  style={{ padding:"8px 13px", borderRadius:12,
                    border: active ? "1px solid rgba(168,85,247,0.55)" : "1px solid rgba(255,255,255,0.08)",
                    background: active ? "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(168,85,247,0.2))" : "rgba(255,255,255,0.04)",
                    color: active ? "#e9d5ff" : "#94a3b8",
                    fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.18s",
                    boxShadow: active ? "0 0 16px rgba(168,85,247,0.2),inset 0 1px 0 rgba(255,255,255,0.1)" : "none" }}>
                  {loc.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Duration */}
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:"#6b7280", letterSpacing:"0.12em", marginBottom:10 }}>
            ⏱️ FOR HOW LONG?
          </div>
          <div style={{ display:"flex", gap:7 }}>
            {DURATIONS.map(d => {
              const active = duration === d;
              return (
                <motion.button key={d} whileTap={{ scale:0.91 }} whileHover={{ scale:1.04 }}
                  onClick={() => setDuration(d)}
                  style={{ flex:1, padding:"10px 0", borderRadius:12,
                    border: active ? "1px solid rgba(168,85,247,0.55)" : "1px solid rgba(255,255,255,0.08)",
                    background: active ? "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(168,85,247,0.2))" : "rgba(255,255,255,0.04)",
                    color: active ? "#e9d5ff" : "#94a3b8",
                    fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.18s",
                    boxShadow: active ? "0 0 16px rgba(168,85,247,0.2),inset 0 1px 0 rgba(255,255,255,0.1)" : "none" }}>
                  {d}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Vibe */}
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:"#6b7280", letterSpacing:"0.12em", marginBottom:10 }}>
            🎭 WHAT'S THE VIBE?
          </div>
          <div style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:3, scrollbarWidth:"none" } as React.CSSProperties}>
            {VIBES.map(v => {
              const active = vibe === v.label;
              return (
                <motion.button key={v.label} whileTap={{ scale:0.91 }} whileHover={{ scale:1.04 }}
                  onClick={() => setVibe(active ? "" : v.label)}
                  style={{ flexShrink:0, padding:"8px 14px", borderRadius:999,
                    border:`1px solid ${active ? v.border : "rgba(255,255,255,0.08)"}`,
                    background: active ? v.bg : "rgba(255,255,255,0.04)",
                    color: active ? v.text : "#64748b",
                    fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.18s" }}>
                  {v.emoji} {v.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:"#6b7280", letterSpacing:"0.12em", marginBottom:10 }}>
            ✏️ NOTE — OPTIONAL
          </div>
          <input maxLength={60} value={note} onChange={e => setNote(e.target.value)}
            placeholder="e.g. Near the red umbrella 🌂, look for me!"
            style={{ width:"100%", background:"rgba(255,255,255,0.04)",
              border:"1px solid rgba(255,255,255,0.08)", borderRadius:12,
              padding:"11px 14px", color:"#e2e8f0", fontSize:13, outline:"none",
              transition:"border-color 0.18s,box-shadow 0.18s" }}
            onFocus={e => { e.target.style.borderColor="rgba(168,85,247,0.5)"; e.target.style.boxShadow="0 0 0 3px rgba(168,85,247,0.1)"; }}
            onBlur={e => { e.target.style.borderColor="rgba(255,255,255,0.08)"; e.target.style.boxShadow="none"; }}
          />
        </div>

        {/* Submit */}
        <motion.button
          whileTap={canSubmit ? { scale:0.97 } : {}} whileHover={canSubmit ? { scale:1.01 } : {}}
          onClick={() => { if (!canSubmit) return;
            onSubmit({ location, duration, vibe:vibe||undefined, note, locEmoji:getLocEmoji(location) }); }}
          style={{ width:"100%", padding:"13px 0", borderRadius:14, border:"none",
            cursor: canSubmit ? "pointer" : "default", fontSize:14, fontWeight:700,
            background: canSubmit ? "linear-gradient(135deg,#7c3aed,#a855f7,#d946ef)" : "rgba(255,255,255,0.06)",
            color: canSubmit ? "#fff" : "#334155",
            boxShadow: canSubmit ? "0 4px 24px rgba(124,58,237,0.45),inset 0 1px 0 rgba(255,255,255,0.15)" : "none",
            transition:"all 0.22s" }}>
          ⚡ Drop my Flash Hang
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─── Flash Hang Board ───────────────────────────────────── */
function FlashHangBoard({ onDismissHint }: {
  onDismissHint: (k:"location"|"join"|"expand") => void;
}) {
  const [hangs, setHangs]               = useState<FlashHang[]>(INITIAL_HANGS);
  const [showForm, setShowForm]         = useState(true);
  const [myHangActive, setMyHangActive] = useState(false);
  const [toast, setToast]               = useState<string|null>(null);
  const notifyTimer = useRef<ReturnType<typeof setTimeout>[]>([]);

  const showToast = (msg:string) => { setToast(null); requestAnimationFrame(()=>setToast(msg)); };

  useEffect(() => {
    const iv = setInterval(() => {
      setHangs(prev => prev.map(h => ({ ...h, minutesLeft:Math.max(0, h.minutesLeft-1) })));
    }, 60_000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!myHangActive) return;
    const WAVE = [
      { id:"m5", delay:2500 }, { id:"m3", delay:5500 },
      { id:"m2", delay:8000 }, { id:"m8", delay:11000 }, { id:"m10", delay:14000 },
    ];
    notifyTimer.current = WAVE.map(({ id, delay }) =>
      setTimeout(() => {
        const member = getMember(id);
        setHangs(prev => prev.map(h =>
          h.memberId==="me" && !h.joiners.includes(id) ? { ...h, joiners:[...h.joiners,id] } : h
        ));
        showToast(`🙌 ${member.name} is joining your hang!`);
      }, delay)
    );
    return () => { notifyTimer.current.forEach(clearTimeout); };
  }, [myHangActive]);

  const handleDrop = (data:Partial<FlashHang>) => {
    setHangs(prev => [{
      id:`fh-${Date.now()}`, memberId:"me",
      location:data.location!, duration:data.duration!,
      time:"just now", locEmoji:data.locEmoji??"📍",
      vibe:data.vibe, note:data.note, joiners:[],
      minutesLeft:durationToMinutes(data.duration!),
    }, ...prev]);
    setShowForm(false); setMyHangActive(true);
  };
  const handleJoin = (id:string) =>
    setHangs(prev => prev.map(h => h.id===id
      ? { ...h, joined:!h.joined, joiners:h.joined?h.joiners.filter(j=>j!=="me-join"):[...h.joiners,"me-join"] } : h));
  const handleBoost = (id:string) => {
    setHangs(prev => prev.map(h => h.id===id ? { ...h, minutesLeft:h.minutesLeft+10 } : h));
    showToast("⚡ +10 min added!");
  };
  const handleCancel = (id:string) => {
    setHangs(prev => prev.filter(h => h.id!==id));
    setMyHangActive(false);
    notifyTimer.current.forEach(clearTimeout);
  };
  const handleNotifyToggle = (id:string) =>
    setHangs(prev => prev.map(h => h.id===id ? { ...h, notifyMe:!h.notifyMe } : h));

  const myHang = hangs.find(h => h.memberId==="me");
  const otherHangs = hangs.filter(h => h.memberId!=="me");

  return (
    <div style={{ padding:"0 20px", fontFamily:"Inter,system-ui,sans-serif" }}>
      <AnimatePresence mode="wait">
        {toast && <Toast key={toast+Date.now()} message={toast} onDone={()=>setToast(null)}/>}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:22 }}>
        <div>
          <h1 style={{ margin:0, fontSize:"clamp(28px,9vw,38px)", fontWeight:900, fontStyle:"italic",
            letterSpacing:"-0.04em", lineHeight:1.05,
            background:"linear-gradient(135deg,#ffffff 10%,#c084fc 55%,#f0abfc 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
            Flash Hangs.
          </h1>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6, flexWrap:"wrap" }}>
            <p style={{ margin:0, color:"#374151", fontSize:10, fontWeight:700,
              textTransform:"uppercase", letterSpacing:"0.14em" }}>
              Drop in · Show up · Connect
            </p>
            <motion.span key={hangs.length} initial={{ scale:0.7, opacity:0 }} animate={{ scale:1, opacity:1 }}
              transition={{ type:"spring", stiffness:400, damping:22 }}
              style={{ display:"inline-flex", alignItems:"center", gap:4,
                background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.22)",
                color:"#4ade80", fontSize:9, fontWeight:800, padding:"3px 8px", borderRadius:999,
                letterSpacing:"0.06em", textTransform:"uppercase" }}>
              <motion.div animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:1.4, repeat:Infinity }}
                style={{ width:5, height:5, borderRadius:"50%", background:"#4ade80", flexShrink:0 }}/>
              {hangs.length} live
            </motion.span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {myHangActive ? (
            <motion.div key="live" initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
              exit={{ opacity:0, scale:0.85 }} transition={{ duration:0.22 }}
              style={{ display:"flex", alignItems:"center", gap:7, paddingTop:6, flexShrink:0 }}>
              <motion.div animate={{ scale:[1,1.35,1], opacity:[0.5,1,0.5] }} transition={{ duration:1.4, repeat:Infinity }}
                style={{ width:9, height:9, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 10px #4ade80" }}/>
              <span style={{ fontSize:13, fontWeight:700, color:"#4ade80" }}>You're live!</span>
            </motion.div>
          ) : showForm ? (
            <motion.button key="cancel" initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
              exit={{ opacity:0, scale:0.85 }} whileTap={{ scale:0.92 }}
              onClick={() => setShowForm(false)} transition={{ duration:0.2 }}
              style={{ padding:"9px 18px", borderRadius:999, marginTop:4, flexShrink:0,
                border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)",
                color:"#94a3b8", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              Cancel
            </motion.button>
          ) : (
            <motion.button key="drop" initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
              exit={{ opacity:0, scale:0.85 }} whileTap={{ scale:0.92 }}
              onClick={() => setShowForm(true)} transition={{ duration:0.2 }}
              style={{ padding:"9px 18px", borderRadius:999, marginTop:4, flexShrink:0,
                border:"1.5px solid rgba(168,85,247,0.5)", background:"rgba(168,85,247,0.08)",
                color:"#c084fc", fontSize:13, fontWeight:700, cursor:"pointer",
                boxShadow:"0 0 20px rgba(168,85,247,0.15)" }}>
              ＋ Drop
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Form */}
      <AnimatePresence initial={false}>
        {showForm && !myHangActive && (
          <motion.div key="form" style={{ marginBottom:16 }}>
            <CreationForm
              onSubmit={handleDrop}
              onCancel={() => setShowForm(false)}
              onDismissLocation={() => onDismissHint("location")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <AnimatePresence initial={false}>
          {myHang && (
            <HangCard key={myHang.id} hang={myHang} index={0}
              onJoin={handleJoin} onBoost={handleBoost}
              onCancel={handleCancel} onToast={showToast}
              onNotifyToggle={handleNotifyToggle}/>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {myHang && otherHangs.length > 0 && <SectionDivider key="div" label="Others nearby"/>}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {otherHangs.length === 0 && !myHang ? (
            <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ textAlign:"center", padding:"60px 0" }}>
              <motion.div animate={{ scale:[1,1.15,1], rotate:[0,10,-10,0] }}
                transition={{ duration:2.5, repeat:Infinity }}
                style={{ fontSize:44, marginBottom:12, display:"inline-block" }}>⚡</motion.div>
              <div style={{ fontSize:14, fontWeight:700, color:"#374151" }}>No active hangs right now.</div>
              <div style={{ fontSize:13, color:"#1f2937", marginTop:4 }}>Be the first to drop one!</div>
            </motion.div>
          ) : (
            otherHangs.map((hang, i) => (
              <HangCard key={hang.id} hang={hang} index={myHang ? i+1 : i}
                onJoin={handleJoin} onBoost={handleBoost}
                onCancel={handleCancel} onToast={showToast}
                onNotifyToggle={handleNotifyToggle}
                onDismissJoin={i===0 ? () => onDismissHint("join") : undefined}
                onDismissExpand={i===0 ? () => onDismissHint("expand") : undefined}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── App ────────────────────────────────────────────────── */
export default function App() {
  /* Hint state lives here so we can render hints via portal,
     completely outside the glass card's overflow:hidden context */
  const [hints, setHints] = useState({ location:true, join:true, expand:true });
  const dismissHint = (k:"location"|"join"|"expand") =>
    setHints(p => ({ ...p, [k]:false }));

  // Auto-dismiss ALL hints after 15 seconds
  useEffect(() => {
    const t = setTimeout(() => setHints({ location:false, join:false, expand:false }), 15_000);
    return () => clearTimeout(t);
  }, []);

  // Track viewport width so hints re-position on resize
  const [vw, setVw] = useState(() => typeof window !== "undefined" ? window.innerWidth : 430);
  useEffect(() => {
    const fn = () => setVw(window.innerWidth);
    window.addEventListener("resize", fn, { passive:true });
    return () => window.removeEventListener("resize", fn);
  }, []);

  // ── Scroll-locked hint positions ──────────────────────────
  // Read the live viewport rect of each labelled target element
  // on every scroll / resize so hints stay pinned to their features.
  const [hintTops, setHintTops] = useState({
    location: 230,
    join:     typeof window !== "undefined" && window.innerWidth >= 600 ? 658 : 490,
    expand:   typeof window !== "undefined" && window.innerWidth >= 600 ? 716 : 548,
  });

  useEffect(() => {
    const update = () => {
      const mid = (id: string, fallback: number) => {
        const el = document.getElementById(id);
        if (!el) return fallback;
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2 - 13; // centre hint on element midpoint
      };
      setHintTops(prev => ({
        location: mid("fh-target-location", prev.location),
        join:     mid("fh-target-join",     prev.join),
        expand:   mid("fh-target-expand",   prev.expand),
      }));
    };

    // Run after initial paint and again after the form open-animation
    const t1 = setTimeout(update, 280);
    const t2 = setTimeout(update, 1_100);

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Card geometry — mirrors App's CSS layout
  // Card: width=min(430, vw-24), centered via flex, outer padding=12px each side
  const cardWidth  = Math.min(430, vw - 24);
  const cardLeft   = Math.max(12, (vw - cardWidth) / 2);
  const cardRight  = cardLeft + cardWidth;

  const blur = IS_LOW_PERF ? "blur(14px)" : "blur(28px)";
  const bg   = IS_LOW_PERF ? "rgba(12,8,20,0.96)" : "rgba(12,8,20,0.85)";

  return (
    <div style={{ background:"#060409", minHeight:"100dvh",
      display:"flex", alignItems:"flex-start", justifyContent:"center",
      padding:"24px 12px 60px", position:"relative", overflow:"hidden" }}>

      <GlobalStyles/>
      <FloatingOrbs/>

      {/* Noise grain overlay — skipped on low-perf */}
      {!IS_LOW_PERF && (
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
          backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundRepeat:"repeat", backgroundSize:"128px 128px", opacity:0.35 }}/>
      )}

      {/* ── Outside hints via portal ───────────────────────
          Rendered into document.body, position:fixed, completely
          outside the glass card so they truly come "from outside". */}
      {typeof document !== "undefined" && createPortal(
        <>
          {/* ① Location — LEFT side, pointing RIGHT into form */}
          <FixedHintBubble
            text="Start here! ✨"
            side="left"
            topPx={hintTops.location}
            show={hints.location}
            vw={vw} cardLeft={cardLeft} cardRight={cardRight}
          />
          {/* ② Join — RIGHT side, pointing LEFT toward Join button */}
          <FixedHintBubble
            text="Join someone! 🙌"
            side="right"
            topPx={hintTops.join}
            show={hints.join}
            vw={vw} cardLeft={cardLeft} cardRight={cardRight}
          />
          {/* ③ Expand — RIGHT side, pointing LEFT toward chevron */}
          <FixedHintBubble
            text="Tap to peek inside"
            side="right"
            topPx={hintTops.expand}
            show={hints.expand}
            vw={vw} cardLeft={cardLeft} cardRight={cardRight}
          />
        </>,
        document.body
      )}

      {/* Main glass card */}
      <motion.div
        className="fh-main-card"
        initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.48, ease:[0.22,1,0.36,1] }}
        style={{ position:"relative", zIndex:1, width:"100%", maxWidth:430,
          background:bg, border:"1px solid rgba(168,85,247,0.18)", borderRadius:28,
          backdropFilter:blur, WebkitBackdropFilter:blur,
          boxShadow:[
            "0 0 0 1px rgba(255,255,255,0.04)",
            "0 24px 80px rgba(0,0,0,0.75)",
            "0 0 100px rgba(124,58,237,0.14)",
            "inset 0 1px 0 rgba(255,255,255,0.07)",
            "inset 0 -1px 0 rgba(0,0,0,0.3)",
          ].join(", "),
          overflow:"hidden", willChange:"transform" }}>

        {/* Shimmer top line */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1, pointerEvents:"none",
          background:"linear-gradient(90deg,transparent,rgba(168,85,247,0.6),rgba(217,70,239,0.6),transparent)" }}/>

        <FestivalTicker/>

        <div style={{ paddingTop:28, paddingBottom:28 }}>
          <FlashHangBoard onDismissHint={dismissHint}/>
        </div>

        {/* Bottom fade */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:40, pointerEvents:"none",
          background:"linear-gradient(to top,rgba(12,8,20,0.6),transparent)" }}/>
      </motion.div>
    </div>
  );
}
