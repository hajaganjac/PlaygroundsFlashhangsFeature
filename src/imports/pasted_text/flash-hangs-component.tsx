# ⚡ Flash Hangs — Standalone Component

Paste this prompt into a **new Figma Make** project. It tells the AI exactly what to build.

---

## Prompt to paste

```
Build a standalone Flash Hangs board — a real-time festival meetup widget — as a single self-contained React component using Tailwind CSS and the "motion" package for animations. No router, no external context, no imports from other files needed.

Design system:
- Background: #050505
- Accent: fuchsia/purple gradient (#a855f7 → #d946ef)
- Font: use system sans-serif (Inter if available via @import in CSS)
- Mobile-first, max-width 430px, centered on screen

The entire app should be one file: src/app/App.tsx

Here is the full component code to use as the implementation — wire it up so FlashHangBoard renders centered on a #050505 background page:

---

TYPES & DATA (put at top of file, outside component):

interface FlashHang {
  id: string;
  memberId: string;
  location: string;
  duration: string;
  time: string;
  locEmoji: string;
  joined?: boolean;
  vibe?: string;
  note?: string;
  joiners: string[];
  minutesLeft: number;
  notifyMe?: boolean;
}

interface Member {
  id: string;
  name: string;
  initials: string;
}

const MEMBERS: Member[] = [
  { id: "m1",  name: "Alex Reid",     initials: "AR" },
  { id: "m2",  name: "Sara Chen",     initials: "SC" },
  { id: "m3",  name: "Jake Morris",   initials: "JM" },
  { id: "m4",  name: "Priya Nair",    initials: "PN" },
  { id: "m5",  name: "Tom Wells",     initials: "TW" },
  { id: "m6",  name: "Lena Park",     initials: "LP" },
  { id: "m7",  name: "Omar Faris",    initials: "OF" },
  { id: "m8",  name: "Nina Rossi",    initials: "NR" },
  { id: "m9",  name: "Felix Braun",   initials: "FB" },
  { id: "m10", name: "Yuki Tanaka",   initials: "YT" },
  { id: "m11", name: "Cleo Vance",    initials: "CV" },
];

const VIBES = [
  { label: "Chill",      emoji: "😌", bg: "rgba(96,165,250,0.12)",  text: "#93c5fd" },
  { label: "Networking", emoji: "🤝", bg: "rgba(74,222,128,0.11)",  text: "#86efac" },
  { label: "Creative",   emoji: "🎨", bg: "rgba(251,191,36,0.11)",  text: "#fcd34d" },
  { label: "Deep Talk",  emoji: "💬", bg: "rgba(168,85,247,0.14)",  text: "#c084fc" },
  { label: "Energy",     emoji: "🔥", bg: "rgba(248,113,113,0.11)", text: "#fca5a5" },
];

const LOCATIONS = [
  { label: "🌿 Garden",    value: "Festival Garden" },
  { label: "☕ Coffee Bar", value: "Coffee Bar"      },
  { label: "🎯 Studio A",  value: "Studio A"        },
  { label: "🎪 Main Stage",value: "Main Stage"      },
  { label: "🍕 Food Court",value: "Food Court"      },
  { label: "🛋️ Chill Zone",value: "Chill Zone"      },
];

const DURATIONS = ["10 min", "20 min", "30 min", "1 hr"];

const INITIAL_HANGS: FlashHang[] = [
  { id: "fh1", memberId: "m11", location: "Festival Garden", duration: "20 min", time: "2m ago",  locEmoji: "🌿", vibe: "Chill",      joiners: ["m3","m7"], minutesLeft: 18, note: "Near the water feature, come chill 💦" },
  { id: "fh2", memberId: "m9",  location: "Coffee Bar",      duration: "15 min", time: "5m ago",  locEmoji: "☕", vibe: "Energy",     joiners: ["m1"],      minutesLeft: 10, note: "" },
  { id: "fh3", memberId: "m4",  location: "Main Stage",      duration: "30 min", time: "11m ago", locEmoji: "🎪", vibe: "Networking", joiners: [],          minutesLeft: 19, note: "Watching the lineup rundown, great to chat!" },
];

---

COMPONENT (FlashHangBoard) — implement exactly as described:

Features to implement:

1. SECTION HEADER
   - Title "Flash Hangs." in large italic display font, white
   - Subtitle "drop in · show up · connect" in tiny uppercase faded text
   - Right side: if user has no active hang → "＋ Drop" pill button (fuchsia border)
                  if user has an active hang → pulsing green dot + "You're live!" text

2. CREATION FORM (animated expand/collapse below header, hidden by default)
   - Appears when "+ Drop" is clicked, disappears when "Cancel" is clicked
   - Section: "📍 Where are you?" — pill buttons for each LOCATION, selected = purple gradient
   - Section: "⏱️ For how long?" — pill buttons for each DURATION, selected = purple gradient
   - Section: "🎭 What's the vibe?" — horizontally scrollable coloured pill buttons for each VIBE
   - Section: "✏️ Note — optional" — single-line text input, max 60 chars, dark glass style
   - Submit button "⚡ Drop my Flash Hang" — full width, purple gradient when location+duration selected, greyed out otherwise
   - On submit: add new hang to top of list with memberId="me", close form, set myHangActive=true, start 4s timer to simulate someone (m5) joining with a toast notification

3. HANG CARDS (one per hang in state, space-y-3)
   Each card:
   - Rounded-[20px], dark glass background, fuchsia border if isMe
   - Main row (clickable to toggle expanded detail panel):
     * Left: circular avatar with initials (fuchsia style if isMe, grey if other)
     * Middle info column:
       - Row 1: location text + optional vibe coloured badge
       - Row 2: live countdown progress bar (green→amber→red based on % remaining) + "Xm left" label (red if ≤5)
       - Row 3: stacked joiner mini-avatars (overlapping circles, max 3 shown + overflow count) + "X joining" or "Be first to join!"  · timestamp
     * Right: "Join 🙌" button (fuchsia) or "✓ In!" (green) for other hangs; animated ChevronDown that rotates 180° when expanded
   - Pulsing red warning strip below main row if minutesLeft ≤ 5: "⚠️ Expiring soon — join before it's gone!"
   - Animated expand panel (height: 0 → auto) on click, separated by a subtle border:
     * If note exists: italic quoted note in a glass pill
     * If joiners exist: "Who's joining" label + pill badges with each joiner's name+initial
     * If isMe: two buttons side by side → "⚡ Boost +10 min" (adds 10 to minutesLeft, shows toast) + "Cancel hang" (red, removes hang, resets myHangActive)
     * If not isMe: "Quick message to host" label + 4 quick-reply chips ("On my way! 🏃", "Save me a spot! 💜", "5 min away 👋", "Sounds fun! 🎉") that show a toast when tapped + "Message [firstname]" button (fuchsia) that shows a toast "Opening chat with [name]..." + 🔔/🔕 notify toggle button

4. EMPTY STATE
   - Shown when hangs array is empty
   - Centered ⚡ icon + "No active hangs right now. Be the first to drop one!" in faded text

5. GLOBAL TOAST
   - Fixed top-center pill, z-index 200, purple gradient, animates in/out with Motion
   - Used for: "🙌 Someone's joining your hang!", "⚡ +10 min added!", "Opening chat with X...", quick reply confirmations

6. COUNTDOWN TIMER
   - useEffect with setInterval every 60 seconds, decrements minutesLeft for all hangs (min 0)

7. SIMULATE JOIN NOTIFICATION
   - useEffect watching myHangActive: 4 seconds after going live, add m5 to my hang's joiners array and show toast "🙌 Someone's joining your hang!"

ANIMATIONS (use motion from "motion/react"):
- Cards: initial opacity 0 + y 12 → animate in with staggered delay
- Form: height 0/opacity 0 ↔ auto/1 with 0.28s ease
- Detail panel: same height animation as form
- ChevronDown: rotate 0 ↔ 180 on expand
- Pulsing green dot on "You're live!": scale 1→1.25→1, opacity 0.6→1→0.6, loop
- Warning strip: opacity pulse 0.55→1→0.55, loop
- Toast: scale + y spring in, scale + y out

INSTALL PACKAGES NEEDED: motion, lucide-react

The default export should be App which renders:
<div style={{ background: "#050505", minHeight: "100dvh", display: "flex", justifyContent: "center" }}>
  <div style={{ width: "100%", maxWidth: 430, paddingTop: 48, paddingBottom: 80 }}>
    <FlashHangBoard />
  </div>
</div>
```

---

## What you'll get

| Feature | Details |
|---|---|
| ⚡ Drop a hang | Pick location, duration, vibe tag, optional note |
| 📍 Vibe badges | Chill / Networking / Creative / Deep Talk / Energy — colour-coded |
| ⏱️ Live countdown bar | Green → amber → red as time runs out |
| 👥 Joiner avatars | Overlapping mini-circles showing who's attending |
| 🔽 Expand cards | Tap any card to reveal note, full joiner list, action buttons |
| 💬 Quick replies | One-tap "On my way!" etc. sends a toast to host |
| ⚡ Boost +10 min | Extend your own hang's timer |
| ❌ Cancel hang | Remove your hang cleanly |
| 🔔 Notify toggle | Bell on/off per hang |
| 🙌 Simulated join | 4s after you go live, someone joins with a toast notification |
| ⚠️ Expiry warning | Pulsing red strip when ≤5 minutes remain |

## Packages needed

Figma Make will install these automatically when you include them in the code:
- `motion` (for animations)  
- `lucide-react` (for ChevronDown, MessageCircle icons)

No router. No context. No external data files. Fully self-contained.
