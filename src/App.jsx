import React, { useState, useRef, useEffect } from "react";
import estesLogo from "./assets/logos/ESTES.jpg";
import londonLogo from "./assets/logos/LONDON.jpg";
import miamiLogo from "./assets/logos/MIAMI.jpg";
import assamLogo from "./assets/logos/ASSAM.jpg";

/* ============================================================
   CUSTOMER BUTTCHEEKS: GRIDIRON CARD BATTLE — ARENA EDITION
   3-card commit & reveal: OFF = Blocker + QB + Skill (QB/RB/WR/TE)
                           DEF = Lineman + Linebacker + DB (CB/SS/FS)
   Simultaneous reveal, MTG-Arena/Clash-style presentation.
   Engine: Rookie Edition reconciled · V6 constants.
   ============================================================ */

const d = (n) => 1 + Math.floor(Math.random() * n);
const d100 = () => d(100);
const OFF_EDGE = 10, TAKEAWAY_MARGIN = 25, PURSUIT = 6, FIELD = 110, TO_GAIN = 10, STACK_CAP = 25;

/* ---------- portrait + flavor helpers ---------- */
const POS_EMOJI = { QB1: "🎯", QB2: "🧠", RB1: "🏃", WR1: "🙌", WR2: "👐", TE1: "🪝", FB1: "🐗", OL: "🧱", DE: "🦈", NT: "🗿", ILB: "🐺", OLB: "⚡", CB1: "🦊", CB2: "🦊", SS: "🔨", FS: "🦅" };
const portrait = (card, teamId) => {
  if (card.name.startsWith("S.") || card.name.startsWith("S ") || teamId === "estes" && card.name.includes("Jemineye") === false && card.name.startsWith("S")) return "🤖";
  if (card.name.includes("Jemineye")) return "👯‍♀️";
  if (card.name.startsWith("R.") || /^(WR|TE) \d+/.test(card.name)) return "⚒️";
  if (teamId === "assam" && card.pos === "RB1") return "🐍";
  return POS_EMOJI[card.pos] || "🏈";
};
const FLAVOR = {
  "Bud Grimsby": "Has never heard of the sideline. Refuses to learn.",
  "Cassandra Jemineye": "Sees the whole field. Also sees your browser history.",
  "Helga Jemineye": "The other twin. Somehow ALSO the better one.",
  "Saxby Lawless": "One more ring. Then he'll stop. He will not stop.",
  "Sample Wong": "Statistically, a miracle. Contractually, employee #00001.",
  "R. Lenin IV": "Redistributes the ball. Occasionally to the other team.",
  "Hardeep Tanaka": "Refused the field goal. Became a hymn.",
  "WR 919": "His name is a number. His routes are poetry.",
  "WR 884": "Not to be confused with WR 883. HE knows what he did.",
  "Larry Awl": "The Gentry's invoice for touching their quarterback.",
  "Deacon Patel": "The people's sack artist. Seizes the means of protection.",
  "Bishnu Baruah": "The Creep. You will hear the grass whisper first.",
};
const FLAVOR_POOL = {
  QB: ["Throws darts. Occasionally at teammates.", "Reads defenses like a menu."],
  RB: ["Legs powered by pure spite.", "Contact is a suggestion."],
  WR: ["One foot down is ALL feet down.", "Catches things. Feelings, mostly."],
  TE: ["A wall that runs routes.", "Blocks, catches, apologizes for neither."],
  FB: ["The tip of the spear. Also the spear.", "His hobbies include: forward."],
  OL: ["The pancake breakfast is self-serve.", "Paid by the bruise."],
  D: ["Files tackles under 'correspondence.'", "The end zone is a members-only club. He checks IDs.", "Runs a small toll booth at the line of scrimmage.", "Interceptions are just aggressive borrowing."],
};
const flavorOf = (c) => FLAVOR[c.name] || (FLAVOR_POOL[c.pos.replace(/\d/g, "").replace("ILB", "D").replace("OLB", "D").replace("CB", "D").replace("SS", "D").replace("FS", "D").replace("DE", "D").replace("NT", "D")] || FLAVOR_POOL.D)[c.name.length % 2];
const rarity = (diff) => diff >= 25 ? { label: "LEGENDARY", frame: "linear-gradient(135deg,#FFB347,#FF6B1A,#FFD700)", glow: "#FF9C33" } : diff >= 15 ? { label: "RARE", frame: "linear-gradient(135deg,#F5D06A,#B8860B,#F5E5A0)", glow: "#E3B23C" } : diff >= 10 ? { label: "UNCOMMON", frame: "linear-gradient(135deg,#C0C8D0,#7E8B99,#DDE4EA)", glow: "#9FB2C4" } : { label: "COMMON", frame: "linear-gradient(135deg,#8A7B63,#5E523F,#A79878)", glow: "#8A7B63" };

/* ---------------- TEAM DATA (PolySCHEDULE, curated) ---------------- */
const TEAMS = {
  estes: {
    id: "estes", city: "Estes Park", name: "Simulacra", conf: "THE HAVES · Prime",
    color: "#8E7CC3", color2: "#C9C4D4", dark: "#241C38", glyph: "◈",
    logo: estesLogo, logoBg: "#2BD229",
    identity: "Clone-perfect precision. Elite twins at QB.",
    tendency: { run: 0.45, deep: 0.4 },
    offense: [
      { pos: "QB1", name: "Cassandra Jemineye", diff: 30, pct: [91, 72, 60], ab: { deadEye: 10 } },
      { pos: "QB2", name: "Helga Jemineye", diff: 27, pct: [88, 70, 58], ab: { osrRun: 8 } },
      { pos: "RB1", name: "Bud Grimsby", diff: 33, pct: [59, 40, 20], ab: { osr11: 8 } },
      { pos: "WR1", name: "S. Solomon Moss", diff: 20, pct: [88, 77, 66], ab: { osrPass: 9 } },
      { pos: "WR2", name: "Xi Zhou Liu", diff: 9, pct: [76, 80, 74], ab: { dsrPen: 6 } },
      { pos: "TE1", name: "S. Ingmar Shockey", diff: 18, pct: [63, 70, 80], ab: { dsrPen: 4 } },
      { pos: "FB1", name: "S. Green Grange", diff: 8, pct: [34, 30, 20], ab: {} },
      { pos: "OL", name: "S. Roy Canasta", diff: 15, pct: null, ab: { osrRun: 8 } },
      { pos: "OL", name: "S. Ronald Crump", diff: 9, pct: null, ab: { osrPass: 8 } },
    ],
    defense: [
      { pos: "DE", name: "S. Dagny Vault", diff: 27, ab: { sackB: 10 } },
      { pos: "NT", name: "Clennell Washington", diff: 15, ab: { dsrRun: 6 } },
      { pos: "ILB", name: "S. Wendell Knort", diff: 11, ab: { intB: 8 } },
      { pos: "OLB", name: "S. Mitchell Towers", diff: 9, ab: { dsrPass: 5 } },
      { pos: "CB1", name: "S. Wes Allen", diff: 15, ab: { dsrPass: 3 } },
      { pos: "CB2", name: "S. Eric Hopkins", diff: 10, ab: { dsrPass: 4 } },
      { pos: "SS", name: "S. Ingmar Stork", diff: 14, ab: { intB: 6 } },
      { pos: "FS", name: "S. Merton Reedis", diff: 9, ab: { dsrPass: 2 } },
    ],
  },
  london: {
    id: "london", city: "London", name: "Amplified Gentry", conf: "THE HAVES · Nova",
    color: "#1F3A93", color2: "#E3B23C", dark: "#0E1B3A", glyph: "♛",
    logo: londonLogo, logoBg: "#F0BC00",
    identity: "Old money, new arms. Saxby hunts one last title.",
    tendency: { run: 0.5, deep: 0.5 },
    offense: [
      { pos: "QB1", name: "Saxby Lawless", diff: 26, pct: [84, 80, 73], ab: { osrPass: 4 } },
      { pos: "QB2", name: "Orkis Fung-Yick", diff: 20, pct: [92, 34, 15], ab: { osrRun: 10 } },
      { pos: "RB1", name: "Boris Talc", diff: 10, pct: [30, 60, 73], ab: { osr11: 6 } },
      { pos: "WR1", name: "S. Gerson Rice", diff: 22, pct: [90, 80, 76], ab: { osrPass: 9 } },
      { pos: "WR2", name: "Gwendolin Jones", diff: 11, pct: [40, 62, 75], ab: { osr11: 6 } },
      { pos: "TE1", name: "Sunil Lazenby", diff: 16, pct: [50, 69, 83], ab: { dsrPen: 4 } },
      { pos: "FB1", name: "George Causeway", diff: 8, pct: [20, 25, 34], ab: {} },
      { pos: "OL", name: "Robert T. Bruce", diff: 15, pct: null, ab: { osrRun: 8 } },
      { pos: "OL", name: "Ralph Poole", diff: 10, pct: null, ab: { osrPass: 10 } },
    ],
    defense: [
      { pos: "DE", name: "Larry Awl", diff: 27, ab: { sackB: 8 } },
      { pos: "NT", name: "S. Albin Nowak", diff: 10, ab: { dsrPass: 2 } },
      { pos: "ILB", name: "S. Jarold Klim", diff: 10, ab: { dsrRun: 4 } },
      { pos: "OLB", name: "S. Terrence Fillian", diff: 10, ab: { sackB: 4 } },
      { pos: "CB1", name: "S. Hollis Grim", diff: 15, ab: { dsrPass: 3 } },
      { pos: "CB2", name: "Marchbanks Tulle", diff: 10, ab: { dsrPass: 4 } },
      { pos: "SS", name: "Wembley Cross", diff: 14, ab: { intB: 6 } },
      { pos: "FS", name: "Pimlico Rhodes", diff: 9, ab: { dsrPass: 4 } },
    ],
  },
  miami: {
    id: "miami", city: "Miami", name: "United Workers Party", conf: "THE HAVE NOTS · Plebian",
    color: "#B3202C", color2: "#E3B23C", dark: "#33090D", glyph: "☭",
    logo: miamiLogo, logoBg: "#FFFFFF",
    identity: "Seize the meters of production.",
    tendency: { run: 0.4, deep: 0.25 },
    offense: [
      { pos: "QB1", name: "Sample Wong", diff: 33, pct: [80, 52, 28], ab: { deadEye: 6 } },
      { pos: "QB2", name: "R. Lenin IV", diff: 17, pct: [70, 35, 22], ab: { quick: true } },
      { pos: "RB1", name: "R. Vittorio Bevelacqua", diff: 13, pct: [11, 20, 45], ab: { osr11: 5 } },
      { pos: "WR1", name: "WR 919", diff: 10, pct: [22, 54, 70], ab: { osrPass: 7 } },
      { pos: "WR2", name: "WR 884", diff: 7, pct: [28, 40, 60], ab: { dsrPen: 3 } },
      { pos: "TE1", name: "TE 427", diff: 8, pct: [18, 50, 60], ab: { dsrPen: 3 } },
      { pos: "FB1", name: "Ashok Basu", diff: 6, pct: [10, 15, 28], ab: {} },
      { pos: "OL", name: "Marshall Sweeney", diff: 12, pct: null, ab: { osrRun: 8 } },
      { pos: "OL", name: "Morton Diehl", diff: 10, pct: null, ab: { osrPass: 8 } },
    ],
    defense: [
      { pos: "DE", name: "Deacon Patel", diff: 16, ab: { sackB: 6 } },
      { pos: "NT", name: "Goro Kuniyoshi", diff: 14, ab: { dsrRun: 6 } },
      { pos: "ILB", name: "Sanjay Singh", diff: 11, ab: { dsrPass: 4 } },
      { pos: "OLB", name: "Lukasz Tomacek", diff: 10, ab: { sackB: 8 } },
      { pos: "CB1", name: "Sirhan Sharma", diff: 10, ab: { dsrPass: 2 } },
      { pos: "CB2", name: "Mo Cid", diff: 9, ab: { dsrPass: 2 } },
      { pos: "SS", name: "Sreedevi Ganga", diff: 9, ab: { dsrPass: 2 } },
      { pos: "FS", name: "Ana Gautami", diff: 7, ab: { intB: 4 } },
    ],
  },
  assam: {
    id: "assam", city: "Assam", name: "Creeping Death", conf: "THE HAVE NOTS · Prole",
    color: "#2E7D32", color2: "#9BB53C", dark: "#0C1F0E", glyph: "〇",
    logo: assamLogo, logoBg: "#F41515",
    identity: "The serpent runs and runs and runs.",
    tendency: { run: 0.72, deep: 0.15 },
    offense: [
      { pos: "QB1", name: "Iqbal Kohli", diff: 15, pct: [65, 43, 28], ab: { quick: true } },
      { pos: "QB2", name: "Junichiro Sato", diff: 13, pct: [40, 22, 16], ab: { dsrPen: 3 } },
      { pos: "RB1", name: "Bishnu Baruah", diff: 22, pct: [59, 30, 12], ab: { osr11: 8 } },
      { pos: "WR1", name: "Hardeep Tanaka", diff: 14, pct: [84, 65, 43], ab: { osrPass: 6 } },
      { pos: "WR2", name: "Martin Castillo", diff: 9, pct: [31, 43, 65], ab: {} },
      { pos: "TE1", name: "Praxad Mbatha", diff: 12, pct: [58, 68, 77], ab: { dsrPen: 3 } },
      { pos: "FB1", name: "Amjad Tendulkar", diff: 6, pct: [10, 12, 20], ab: { osrRun: 4 } },
      { pos: "OL", name: "Ranjit Duarah", diff: 12, pct: null, ab: { osrRun: 8 } },
      { pos: "OL", name: "Orkis Steptoe", diff: 8, pct: null, ab: { osrRun: 4 } },
    ],
    defense: [
      { pos: "DE", name: "Bhaskar Rahang", diff: 16, ab: { dsrRun: 2 } },
      { pos: "NT", name: "Rohit Sambal", diff: 10, ab: { dsrRun: 8 } },
      { pos: "ILB", name: "Aung Robik", diff: 8, ab: { dsrRun: 4 } },
      { pos: "OLB", name: "Dalbir Singh", diff: 9, ab: { sackB: 6 } },
      { pos: "CB1", name: "Tijo Thanantavali", diff: 10, ab: { dsrRun: 6 } },
      { pos: "CB2", name: "Cam Huk", diff: 4, ab: {} },
      { pos: "SS", name: "Chandan Pegu", diff: 9, ab: { dsrRun: 4 } },
      { pos: "FS", name: "Mira Kalita", diff: 7, ab: { intB: 4 } },
    ],
  },
};

const CHITS = [
  { id: 8, name: "Jets", desc: "WR1: +10 extra meters on won 1:1s", tag: "jets" },
  { id: 12, name: "Trough O' Chowder", desc: "Your D-Line +10 all game", tag: "trough" },
  { id: 13, name: "Can O' Chowder", desc: "Your QB1 +10 all game", tag: "can" },
  { id: 14, name: "Keg O' Chowder", desc: "Your O-Line +10 all game", tag: "keg" },
  { id: 15, name: "Weaver", desc: "Pass completions +10", tag: "weaver" },
  { id: 16, name: "Dozer", desc: "Your FB +20 on runs", tag: "dozer" },
  { id: 19, name: "Golden Toe", desc: "All kicks good (no clutch bonus)", tag: "toe" },
];
const METER_WHEEL = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 90];
const YARD_WHEEL = [25, 30, 30, 35, 35, 40, 40, 45, 10, 105];

function contest(oB, dB) { let o, dv; do { o = d100() + oB; dv = d100() + dB; } while (o === dv); return { win: o > dv, o, d: dv }; }
function takeaway(dB, oB) { const dr = d100() + dB, or = d100() + oB; return { taken: dr - or >= TAKEAWAY_MARGIN, dr, or }; }
const shortGain = () => d(10), longGain = () => d(10) + d(10);

/* ============ CARD COMPONENTS ============ */
function TeamLogo({ t, size = 44, radius = 10, fit = "contain", style }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, overflow: "hidden", flexShrink: 0,
      background: t.logoBg || t.dark, border: `2px solid ${t.color2}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      ...style,
    }}>
      <img
        src={t.logo}
        alt={`${t.city} ${t.name} logo`}
        style={{ width: "100%", height: "100%", objectFit: fit, objectPosition: "center", display: "block" }}
      />
    </div>
  );
}

function ArenaCard({ card, teamId, size = 1, faceDown, slam, dimmed, chosen, onClick, roleTag }) {
  const t = TEAMS[teamId];
  const r = rarity(card ? card.diff : 0);
  const W = 150 * size, H = 214 * size;
  if (faceDown) {
    return (
      <div style={{ width: W, height: H, borderRadius: 12 * size, flexShrink: 0, background: `repeating-linear-gradient(45deg, ${t.dark}, ${t.dark} 8px, #0A0F0B 8px, #0A0F0B 16px)`, border: `3px solid ${t.color2}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(0,0,0,.6)" }}>
        <TeamLogo t={t} size={54 * size} radius={10 * size} style={{ boxShadow: "0 4px 10px #0008" }} />
        <div style={{ fontFamily: "Impact, sans-serif", fontSize: 11 * size, letterSpacing: 2, color: t.color2, marginTop: 6 }}>COMMITTED</div>
        <div style={{ fontSize: 7 * size, color: "#8FA08F", marginTop: 4, fontFamily: "Courier New, monospace" }}>PROPERTY OF THE STORE</div>
      </div>
    );
  }
  return (
    <div onClick={onClick} className={slam ? "cb-slam" : ""} style={{
      width: W, height: H, borderRadius: 12 * size, flexShrink: 0, cursor: onClick ? "pointer" : "default",
      padding: 3, background: r.frame, position: "relative",
      boxShadow: chosen ? `0 0 24px ${r.glow}, 0 0 6px #fff` : `0 6px 16px rgba(0,0,0,.55)`,
      transform: chosen ? "translateY(-8px) scale(1.03)" : dimmed ? "scale(.97)" : "none",
      opacity: dimmed ? 0.5 : 1, transition: "all .18s",
    }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 9 * size, overflow: "hidden", background: `linear-gradient(175deg, ${t.dark}, #090D0A)`, display: "flex", flexDirection: "column" }}>
        {/* name bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${4 * size}px ${7 * size}px`, background: `linear-gradient(90deg, ${t.color}, ${t.dark})` }}>
          <span style={{ fontFamily: "Impact, sans-serif", fontSize: 11 * size, color: "#fff", letterSpacing: 1 }}>{card.pos}</span>
          <span style={{ fontFamily: "Impact, sans-serif", fontSize: 15 * size, color: "#FFE28A", textShadow: "0 1px 0 #000" }}>+{card.diff}</span>
        </div>
        {/* art window */}
        <div style={{ height: 74 * size, background: `radial-gradient(circle at 50% 35%, ${t.color}66, ${t.dark} 75%)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", borderBottom: `2px solid ${t.color2}88` }}>
          <div style={{ fontSize: 40 * size, filter: "drop-shadow(0 4px 4px #000)" }}>{portrait(card, teamId)}</div>
          <TeamLogo t={t} size={22 * size} radius={4 * size} style={{ position: "absolute", bottom: 3, right: 6, border: `1px solid ${t.color2}` }} />
          {roleTag && <div style={{ position: "absolute", top: 3, left: 5, fontSize: 7.5 * size, fontFamily: "Impact, sans-serif", letterSpacing: 1, background: "#000A", color: "#FFE28A", padding: "2px 5px", borderRadius: 4 }}>{roleTag}</div>}
        </div>
        {/* name */}
        <div style={{ padding: `${4 * size}px ${7 * size}px 0`, fontSize: 10.5 * size, fontWeight: "bold", color: "#F2EFE2", fontFamily: "Verdana, sans-serif", lineHeight: 1.15, minHeight: 24 * size }}>{card.name}</div>
        {/* depth pills */}
        {card.pct ? (
          <div style={{ display: "flex", gap: 3, padding: `${3 * size}px ${6 * size}px` }}>
            {["10", "20", "20+"].map((lb, i) => (
              <div key={lb} style={{ flex: 1, textAlign: "center", background: "#00000066", borderRadius: 4, padding: `${2 * size}px 0`, border: "1px solid #ffffff18" }}>
                <span style={{ fontSize: 7 * size, color: "#8FA08F" }}>{lb} </span>
                <span style={{ fontSize: 9.5 * size, color: "#FFE28A", fontFamily: "Impact, sans-serif" }}>{card.pct[i]}%</span>
              </div>
            ))}
          </div>
        ) : <div style={{ height: 6 * size }} />}
        {/* flavor */}
        <div style={{ padding: `${2 * size}px ${7 * size}px`, fontSize: 7.5 * size, color: "#AFBBA9", fontStyle: "italic", lineHeight: 1.3, flex: 1, fontFamily: "Georgia, serif" }}>{flavorOf(card)}</div>
        <div style={{ padding: `0 ${7 * size}px ${4 * size}px`, fontSize: 6.5 * size, letterSpacing: 1.5, color: r.glow, fontFamily: "Impact, sans-serif" }}>{r.label}</div>
      </div>
    </div>
  );
}

function Btn({ children, onClick, big, small, disabled, gold }) {
  return (
    <button onClick={onClick} disabled={disabled} className="cb-btn" style={{
      fontFamily: "Impact, sans-serif", letterSpacing: 1.5,
      fontSize: big ? 19 : small ? 11 : 14,
      padding: big ? "14px 30px" : small ? "5px 10px" : "10px 18px",
      background: disabled ? "linear-gradient(180deg,#3a3a3a,#262626)" : gold ? "linear-gradient(180deg,#FFD86B,#C89019)" : "linear-gradient(180deg,#3C9663,#1E5236)",
      color: disabled ? "#777" : gold ? "#3A2703" : "#F6F3E6",
      border: `2px solid ${disabled ? "#444" : gold ? "#FFEBAE" : "#7ACB98"}`,
      borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : gold ? "0 4px 0 #7A5608, 0 6px 14px #0008" : "0 4px 0 #0D2B1C, 0 6px 14px #0008",
      textShadow: gold ? "0 1px 0 #FFEFC0" : "0 1px 2px #000",
    }}>{children}</button>
  );
}

const CSS = `
@keyframes cbSlam { 0% { transform: scale(1.6) rotate(-4deg); opacity: 0; } 60% { transform: scale(.96) rotate(1deg); opacity: 1; } 100% { transform: scale(1) rotate(0); } }
.cb-slam { animation: cbSlam .45s cubic-bezier(.2,1.4,.4,1); }
.cb-btn:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); }
.cb-btn:active:not(:disabled) { transform: translateY(2px); box-shadow: none !important; }
@keyframes cbPulse { 0%,100% { box-shadow: 0 0 14px #E3B23C55; } 50% { box-shadow: 0 0 30px #E3B23CBB; } }
.cb-pulse { animation: cbPulse 1.6s infinite; }
@media (prefers-reduced-motion: reduce) { .cb-slam, .cb-pulse { animation: none; } }
`;

/* ============================ APP ============================ */
export default function App() {
  const [screen, setScreen] = useState("title");
  const [playerTeam, setPlayerTeam] = useState(null);
  const [aiTeam, setAiTeam] = useState(null);
  const [mode, setMode] = useState("quick");
  const [staked, setStaked] = useState([]);
  const [aiStaked, setAiStaked] = useState([]);
  const [g, setG] = useState(null);
  const [sel, setSel] = useState({}); // slot selections during commit
  const logRef = useRef(null);
  useEffect(() => { const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s); return () => s.remove(); }, []);

  const drivesPerQtr = mode === "quick" ? 2 : 4;
  const T = (id) => TEAMS[id];

  function newGame() {
    const first = Math.random() < 0.5 ? playerTeam : aiTeam;
    setG({
      score: { [playerTeam]: 0, [aiTeam]: 0 }, qtr: 1, driveNum: 1, halfDrive: 0,
      possession: first, other: first === playerTeam ? aiTeam : playerTeam,
      spot: 0, line: 0, down: 1, phase: "spin",
      reveal: null, aiCommit: null, chase: null,
      chits: { [playerTeam]: [...staked], [aiTeam]: [...aiStaked] }, usedChits: [],
      ot: false, otPoss: 0, playerRuns: 1, playerPasses: 1,
      driveReason: null, driveOpts: null,
      log: [{ t: "sys", m: `COIN FLIP — ${T(first).city} receives. The machine is already studying your habits.` }],
      stats: { plays: 0, tds: 0, tos: 0 },
    });
    setSel({});
    setScreen("game");
  }

  if (screen === "title") return <Title onPlay={() => setScreen("select")} />;
  if (screen === "select") return <Select {...{ playerTeam, setPlayerTeam, aiTeam, setAiTeam, mode, setMode }} onNext={() => { const pool = CHITS.map((c) => c.tag); const ai = []; while (ai.length < 2) { const p = pool[Math.floor(Math.random() * pool.length)]; if (!ai.includes(p)) ai.push(p); } setAiStaked(ai); setScreen("stake"); }} />;
  if (screen === "stake") return <Stake {...{ staked, setStaked, aiTeam }} onStart={newGame} />;
  if (screen === "final") return <Final {...{ g, playerTeam, aiTeam }} onAgain={() => { setStaked([]); setScreen("select"); }} />;

  const isPlayerOff = g.possession === playerTeam;
  const offT = T(g.possession), defT = T(g.other);
  const log = (m, t = "play") => g.log.unshift({ t, m });
  const hasChit = (team, tag) => g.chits[team].includes(tag);
  const markUsed = (team, tag) => { if (!g.usedChits.find((u) => u.team === team && u.tag === tag)) g.usedChits.push({ team, tag }); };
  const push = () => setG({ ...g });

  /* ---------- trio helpers ---------- */
  const offSlots = (t) => ({
    BLOCKER: t.offense.filter((c) => c.pos === "OL" || c.pos === "FB1"),
    QB: t.offense.filter((c) => c.pos === "QB1" || c.pos === "QB2"),
    SKILL: t.offense.filter((c) => ["QB1", "QB2", "RB1", "WR1", "WR2", "TE1"].includes(c.pos)),
  });
  const defSlots = (t) => ({
    LINE: t.defense.filter((c) => ["DE", "NT"].includes(c.pos)),
    BACKER: t.defense.filter((c) => ["OLB", "ILB"].includes(c.pos)),
    BACK: t.defense.filter((c) => ["CB1", "CB2", "SS", "FS"].includes(c.pos)),
  });

  function offBonus(trio, play) {
    const [blk, qb, sk] = trio;
    let add = blk.diff + qb.diff + (sk === qb ? 0 : sk.diff);
    if (play.type === "run") { add += (sk.ab.osrRun || 0) + (blk.ab.osrRun || 0) + (qb.ab.osrRun && sk === qb ? qb.ab.osrRun : 0); }
    else { add += (qb.ab.osrPass || 0) + (blk.ab.osrPass || 0) + (sk.ab.osrPass || 0); }
    if (hasChit(g.possession, "keg") && blk.pos === "OL") { add += 10; markUsed(g.possession, "keg"); }
    if (hasChit(g.possession, "can") && (qb.pos === "QB1" || sk.pos === "QB1")) { add += 10; markUsed(g.possession, "can"); }
    if (hasChit(g.possession, "dozer") && play.type === "run" && sk.pos === "FB1") { add += 20; markUsed(g.possession, "dozer"); }
    return OFF_EDGE + Math.min(STACK_CAP + 15, add); // generous arena cap
  }
  function defBonus(trio, play, offTrio) {
    let add = trio.reduce((s, c) => s + c.diff, 0);
    trio.forEach((c) => { add += play.type === "run" ? (c.ab.dsrRun || 0) : (c.ab.dsrPass || 0); });
    offTrio.forEach((c) => { add -= c.ab.dsrPen || 0; });
    if (play.type === "pass") { const qb = offTrio[1]; add -= qb.ab.deadEye || 0; }
    if (hasChit(g.other, "trough")) { add += 10; markUsed(g.other, "trough"); }
    return Math.min(STACK_CAP + 15, add);
  }

  /* ---------- AI commits ---------- */
  function aiPickDef() {
    const s = defSlots(defT);
    const runProb = g.playerRuns / (g.playerRuns + g.playerPasses);
    const expectRun = Math.random() < runProb;
    const by = (arr, key) => [...arr].sort((a, b) => (b.diff + (b.ab[key] || 0) * 1.5) - (a.diff + (a.ab[key] || 0) * 1.5))[0];
    return { trio: [by(s.LINE, expectRun ? "dsrRun" : "sackB"), by(s.BACKER, expectRun ? "dsrRun" : "dsrPass"), by(s.BACK, expectRun ? "dsrRun" : "dsrPass")], guess: expectRun ? "RUN" : "PASS" };
  }
  function aiPickOff() {
    const t = offT, s = offSlots(t);
    const run = Math.random() < t.tendency.run;
    const qb = s.QB[Math.random() < 0.75 ? 0 : 1];
    let sk, play;
    if (run) { sk = t.offense.find((c) => c.pos === "RB1"); play = { type: "run" }; }
    else {
      const depth = Math.random() < t.tendency.deep ? (Math.random() < 0.5 ? 2 : 1) : 0;
      const recvs = s.SKILL.filter((c) => c !== qb && c.pct);
      sk = recvs.sort((a, b) => b.pct[depth] - a.pct[depth])[Math.floor(Math.random() * 2)] || recvs[0];
      play = { type: "pass", depth, target: sk };
    }
    const blk = play.type === "run" ? s.BLOCKER.sort((a, b) => (b.ab.osrRun || 0) - (a.ab.osrRun || 0))[0] : s.BLOCKER.sort((a, b) => (b.ab.osrPass || 0) - (a.ab.osrPass || 0))[0];
    return { trio: [blk, qb, sk], play };
  }

  /* ---------- resolve snap with trios ---------- */
  function resolveSnap(offTrio, play, defTrio) {
    g.stats.plays++;
    if (isPlayerOff) { play.type === "run" ? g.playerRuns++ : g.playerPasses++; }
    const oB = offBonus(offTrio, play), dB = defBonus(defTrio, play, offTrio);
    const c = contest(oB, dB);
    g.reveal = { offTrio, defTrio, play, rolls: c, oB, dB };
    const [blk, qb, sk] = offTrio;
    const primaryDef = play.type === "run" ? defTrio[0] : defTrio[2];

    if (c.win) {
      if (play.type === "run") {
        const rod = d(8);
        if (rod === 1) {
          const tk = takeaway(primaryDef.diff + (primaryDef.ab.intB || 0), sk.diff);
          if (tk.taken) { g.stats.tos++; log(`ROD 1 — FUMBLE! ${defT.city} rips it out (${tk.dr} vs ${tk.or})! The crowd makes a sound like a kettle.`, "bad"); endDrive("fumble"); return; }
          log(`Fumble scare — ${sk.name} hugs the ball like it owes him money. No gain.`, "play");
          advanceDown(0); return;
        }
        let gain = [0, 0, shortGain(), shortGain(), longGain(), shortGain(), shortGain(), longGain(), longGain()][rod];
        const note = ["", "", "short gain", "BROKEN TACKLE", "LONG GAIN", "STIFF-ARM", "short gain", "LONG GAIN", "HURDLE"][rod];
        if (sk.ab.quick && (rod === 2 || rod === 6)) { const ex = shortGain(); gain += ex; log(`QUICK! Bonus burst +${ex}m.`, "good"); }
        log(`${sk.name} behind ${blk.name} — ${note}, +${gain}m!`, "good");
        startChase(sk, gain);
      } else {
        const pod = d(8);
        if (pod === 1) {
          const tk = takeaway(primaryDef.diff + (primaryDef.ab.intB || 0), qb.diff);
          if (tk.taken) { g.stats.tos++; log(`POD 1 — INTERCEPTED by ${primaryDef.name}! ${qb.name} would like a word with his arm.`, "bad"); endDrive("int"); return; }
          log(`The ball hangs… and DROPS. ${primaryDef.name} will see that one at 3 a.m. Incomplete.`, "play");
          advanceDown(0); return;
        }
        if (pod === 6) {
          const c2 = contest(oB, dB);
          if (!c2.win) { log(`CONTESTED BALL — broken up (${c2.o} vs ${c2.d})! Both players file complaints.`, "play"); advanceDown(0); return; }
          log(`CONTESTED BALL — ${sk.name} RIPS IT AWAY (${c2.o} vs ${c2.d})!`, "good");
        }
        let compl = sk.pct ? sk.pct[play.depth] : 30;
        if (hasChit(g.possession, "weaver")) { compl += 10; markUsed(g.possession, "weaver"); }
        const cr = d100();
        if (cr > compl) { log(`${qb.name} → ${sk.name} (${["10m", "20m", "20+m"][play.depth]}): ${cr} vs ${compl}% — INCOMPLETE. The ball had other plans.`, "play"); advanceDown(0); return; }
        let gain = play.depth === 0 ? shortGain() : play.depth === 1 ? longGain() : longGain() + 10;
        const bonus = pod === 5 ? " STIFF-ARM!" : pod === 7 ? " SPECTACULAR CATCH!" : pod === 8 ? " HURDLE!" : "";
        log(`${qb.name} → ${sk.name}: ${cr} vs ${compl}% — CAUGHT, +${gain}m!${bonus}`, "good");
        if (hasChit(g.possession, "jets") && sk.pos === "WR1") { gain += 10; markUsed(g.possession, "jets"); log("JETS! +10 bonus meters. He left a vapor trail.", "good"); }
        startChase(sk, gain);
      }
    } else {
      const dd = d(6);
      if (dd === 1) { const loss = play.type === "pass" ? d(10) + (primaryDef.ab.sackB ? 2 : 0) : 5; log(play.type === "pass" ? `SACK! ${defTrio[0].name} arrives with paperwork. -${loss}m.` : `Swallowed in the backfield. -5m.`, "bad2"); advanceDown(-loss); return; }
      if (dd === 2 || dd === 6) { log(`STUFFED at the line. The wall files this under 'correspondence.'`, "bad2"); advanceDown(0); return; }
      if (dd === 3) {
        const tk = takeaway(dB + (primaryDef.ab.intB || 0), oB - OFF_EDGE);
        if (tk.taken) { g.stats.tos++; log(`TAKEAWAY! ${primaryDef.name} ${play.type === "pass" ? "INTERCEPTS" : "FORCES THE FUMBLE"} (${tk.dr} vs ${tk.or})! The Dragonfly saw it coming.`, "bad"); endDrive("int"); return; }
        log(`Takeaway chance — batted down (${tk.dr} vs ${tk.or}). Merely a stop.`, "bad2"); advanceDown(0); return;
      }
      if (dd === 4) {
        if (play.type === "pass") {
          const loc = -d(10);
          const tk = takeaway(dB, oB - OFF_EDGE);
          if (tk.taken) { g.stats.tos++; log(`STRIP SACK! ${defT.city} recovers at ${loc}m! Somebody alert the hymnal.`, "bad"); endDrive("fumble", { move: loc }); return; }
          log(`STRIP SACK — scramble! Offense falls on it at ${loc}m. Everyone screams appropriately.`, "bad2"); advanceDown(loc); return;
        }
        log(`Stuffed on the run. Nothing there but regret.`, "bad2"); advanceDown(0); return;
      }
      log(`Dragged down for -3m by ${defTrio[1].name}.`, "bad2"); advanceDown(-3); return;
    }
  }

  /* ---------- chase ---------- */
  function startChase(carrier, gain) {
    g.chase = { carrier, gain, steps: 0 };
    if (g.spot + gain >= FIELD) { finishChase(true); return; }
    if (isPlayerOff) { g.phase = "chase"; return; }
    let alive = true;
    while (alive && g.spot + g.chase.gain < FIELD && g.chase.steps < 6) {
      if (PURSUIT * (g.chase.steps + 1) > 14 && Math.random() < 0.6) break;
      alive = chaseStep();
      if (alive === null) return;
    }
    finishChase(g.spot + g.chase.gain >= FIELD);
  }
  function chaseStep() {
    const ch = g.chase; ch.steps++;
    const defd = defT.defense[Math.floor(Math.random() * defT.defense.length)];
    const c = contest(ch.carrier.diff + (ch.carrier.ab.osr11 || 0) + OFF_EDGE / 2, defd.diff + PURSUIT * ch.steps);
    if (!c.win) {
      if (ch.steps === 1 && d(6) === 3) {
        const tk = takeaway(defd.diff + (defd.ab.intB || 0), ch.carrier.diff);
        if (tk.taken) { g.stats.tos++; log(`BIG HIT by ${defd.name} — FORCED FUMBLE, ${defT.city} ball!`, "bad"); g.spot = Math.min(FIELD - 1, g.spot + ch.gain); endDrive("fumble"); return null; }
        log(`${defd.name} goes for the strip — ${ch.carrier.name} holds on! Down after +${ch.gain}m.`, "play");
      } else log(`${defd.name} drags him down (pursuit +${PURSUIT * ch.steps}). Total +${ch.gain}m.`, "play");
      finishChase(false); return false;
    }
    const rod = d(8);
    if (rod === 1) { log(`${ch.carrier.name} dragged down mid-juke. +${ch.gain}m total.`, "play"); finishChase(false); return false; }
    const extra = [0, 0, shortGain(), shortGain() + 2, longGain(), shortGain(), shortGain(), longGain(), longGain()][rod];
    ch.gain += extra;
    log(`${ch.carrier.name} BREAKS FREE (+${extra}m)!${FIELD - g.spot - ch.gain > 0 ? ` ${FIELD - g.spot - ch.gain}m to glory…` : ""}`, "good");
    if (g.spot + ch.gain >= FIELD) { finishChase(true); return null; }
    return true;
  }
  function finishChase(td) {
    g.spot = Math.min(FIELD, Math.max(1, g.spot + g.chase.gain));
    g.chase = null;
    if (td || g.spot >= FIELD) { scoreTD(); return; }
    advanceDown(0, true);
  }

  const lastHalf = () => g.qtr === 2 && g.driveNum === drivesPerQtr;
  const lastGame = () => g.qtr === 4 && g.driveNum === drivesPerQtr;

  function scoreTD() {
    g.stats.tds++;
    let pts = 6;
    if (!g.ot && lastHalf()) pts = 8;
    if (!g.ot && lastGame()) pts = 10;
    g.score[g.possession] += pts;
    log(`TOUCHDOWN ${offT.city.toUpperCase()}! ${pts} POINTS${pts > 6 ? " — CLUTCH!" : ""} Lavish celebrations are encouraged and, in fact, occurring.`, "score");
    g.phase = "pat"; g.reveal = null;
    if (!isPlayerOff) { const diff = g.score[g.other] - g.score[g.possession]; doPAT(Math.abs(diff) === 2 || Math.random() < 0.12 ? 2 : 1); }
  }
  function doPAT(kind) {
    if (kind === 1) {
      const good = hasChit(g.possession, "toe") ? (markUsed(g.possession, "toe"), true) : Math.random() < 0.85;
      good ? (g.score[g.possession] += 1, log("Extra point is GOOD.", "score")) : log("XP is WIDE. The kicker eats the Staff Meal tonight.", "bad2");
    } else {
      Math.random() < 0.45 ? (g.score[g.possession] += 2, log("TWO-POINT CONVERSION — GOOD!", "score")) : log("Two-point try FAILS. Bold. Wrong, but bold.", "bad2");
    }
    endDrive("td");
  }

  function advanceDown(delta, fromChase = false) {
    g.spot = Math.max(1, Math.min(FIELD - 1, g.spot + delta));
    if (g.spot <= 1 && delta < 0) { g.score[g.other] += 2; log(`SAFETY! ${defT.city} scores 2! Cha-Ching!`, "score"); endDrive("safety"); return; }
    if (g.spot - g.line >= TO_GAIN) { g.down = 1; g.line = g.spot; log(`FIRST DOWN ${offT.city}!`, "sys"); }
    else g.down += 1;
    if (g.down > 4) { log(`TURNOVER ON DOWNS at ${g.spot}m. The dice giveth…`, "bad2"); endDrive("downs"); return; }
    g.phase = "postReveal";
  }
  function endDrive(reason, opts = {}) { g.driveReason = reason; g.driveOpts = opts; g.phase = "driveOver"; g.chase = null; }

  function heroBlocks() {
    const lead = g.score[g.possession] - g.score[g.other];
    return (lastGame() || g.ot) && lead <= 0 && lead + 3 > 0;
  }
  function tryFG() {
    const dist = FIELD - g.spot;
    let make = Math.max(0.2, 0.9 - 0.012 * dist);
    if (hasChit(g.possession, "toe")) { make = 1; markUsed(g.possession, "toe"); }
    if (Math.random() < make) {
      const pts = !g.ot && lastGame() && !hasChit(g.possession, "toe") ? 5 : 3;
      g.score[g.possession] += pts;
      log(`FIELD GOAL (${dist}m) is GOOD — ${pts} points${pts === 5 ? ", CLUTCH KICK!" : "."}`, "score");
      endDrive("fg");
    } else { g.score[g.other] += 1; log(`The ${dist}m kick sails wide — ROUGE! One free, humiliating point for ${defT.city}.`, "bad"); endDrive("fgmiss"); }
  }
  function tryPunt() {
    const s1 = YARD_WHEEL[Math.floor(Math.random() * 10)], s2 = YARD_WHEEL[Math.floor(Math.random() * 10)];
    let dist, note = "";
    if (s1 === 105 || s2 === 105) { note = " COFFIN CORNER!"; dist = FIELD - 5 - g.spot; }
    else { dist = s1 + s2; if (s1 === 10 || s2 === 10) note = " (a light SHANK)"; }
    log(`PUNT — wheel spins ${s1 === 105 ? "CC" : s1} + ${s2 === 105 ? "CC" : s2}: ${Math.max(10, dist)}m.${note}`, "play");
    endDrive("punt", { puntTo: Math.min(FIELD - 5, g.spot + Math.max(10, dist)) });
  }

  function nextDrive() {
    if (g.ot) {
      g.otPoss++;
      if (g.otPoss % 2 === 0 && g.score[playerTeam] !== g.score[aiTeam]) { setScreen("final"); return; }
      if (g.otPoss % 2 === 0) log("— Still tied. ANOTHER OT. Ad infinitum. —", "sys");
      [g.possession, g.other] = [g.other, g.possession];
      g.down = 1; g.spot = 75; g.line = 75; g.reveal = null;
      startSnapPhase(); return;
    }
    [g.possession, g.other] = [g.other, g.possession];
    if (g.halfDrive === 1) { g.halfDrive = 0; g.driveNum++; } else g.halfDrive = 1;
    if (g.driveNum > drivesPerQtr) {
      g.driveNum = 1; g.qtr++;
      if (g.qtr === 5) { if (g.score[playerTeam] !== g.score[aiTeam]) { setScreen("final"); return; } g.ot = true; log("— TIED! OVERTIME. There must be a winner. That is the law. —", "sys"); g.spot = 75; g.line = 75; g.down = 1; g.reveal = null; startSnapPhase(); return; }
      log(`— END OF QUARTER ${g.qtr - 1} —`, "sys");
    }
    g.down = 1; g.reveal = null;
    const r = g.driveReason;
    if (r === "punt" && g.driveOpts?.puntTo) { const sp = Math.max(5, Math.min(90, FIELD - g.driveOpts.puntTo)); g.spot = sp; g.line = sp; log(`${T(g.possession).city} fields the punt at ${sp}m.`, "sys"); startSnapPhase(); return; }
    if (["int", "fumble", "downs"].includes(r)) { const sp = Math.max(5, Math.min(95, FIELD - g.spot)); g.spot = sp; g.line = sp; log(`${T(g.possession).city} takes over at ${sp}m.`, "sys"); startSnapPhase(); return; }
    g.phase = "spin";
  }
  function spinWheel() {
    const idx = Math.floor(Math.random() * METER_WHEEL.length);
    g.spot = METER_WHEEL[idx]; g.line = g.spot; g.down = 1;
    log(`METER WHEEL: ${offT.city} starts at ${g.spot}m${idx === 14 ? " — LUCKY BOUNCE! The wheel loves you today." : ""}. Drive ${g.driveNum}, Q${g.qtr}${g.ot ? " OT" : ""}.`, "sys");
    startSnapPhase();
  }
  function startSnapPhase() {
    setSel({});
    const isPO = g.possession === playerTeam;
    if (isPO) {
      g.aiCommit = aiPickDef();
      g.phase = "commitOff";
    } else {
      // AI offense: 4th-down decisions first
      if (g.down === 4) {
        const dist = FIELD - g.spot;
        if (dist <= 35 && !heroBlocks() && Math.random() < 0.65) { tryFG(); return; }
        if (dist > 55 && Math.random() < 0.7) { tryPunt(); return; }
      }
      g.aiCommit = aiPickOff();
      g.phase = "commitDef";
    }
  }

  /* ---------- player actions ---------- */
  const act = (fn) => (...a) => { fn(...a); push(); };
  const snapReady = g.phase === "commitOff"
    ? sel.BLOCKER && sel.QB && sel.SKILL && (sel.play?.type === "run" || (sel.play?.type === "pass" && sel.play.depth != null))
    : g.phase === "commitDef" ? sel.LINE && sel.BACKER && sel.BACK : false;

  function doSnap() {
    if (g.phase === "commitOff") {
      const trio = [sel.BLOCKER, sel.QB, sel.SKILL];
      const play = sel.play.type === "run" ? { type: "run" } : { type: "pass", depth: sel.play.depth, target: sel.SKILL };
      log(`${offT.city} lines up… the machine reveals its ${g.aiCommit.guess}-stopping look!`, "sys");
      resolveSnap(trio, play, g.aiCommit.trio);
    } else {
      const defTrio = [sel.LINE, sel.BACKER, sel.BACK];
      const { trio, play } = g.aiCommit;
      log(`${offT.city} declares ${play.type === "run" ? "a RUN" : `a PASS (${["10m", "20m", "20+m"][play.depth]})`} — cards on the table!`, "sys");
      resolveSnap(trio, play, defTrio);
    }
    push();
  }
  function afterReveal() {
    g.reveal = null;
    if (g.phase === "postReveal") {
      if (isPlayerOff && g.down === 4) { g.phase = "fourth"; }
      else startSnapPhase();
    }
    push();
  }

  /* ---------- render ---------- */
  const pT = T(playerTeam), aT = T(aiTeam);
  const trioSlots = isPlayerOff ? offSlots(offT) : defSlots(defT);
  const slotOrder = isPlayerOff ? ["BLOCKER", "QB", "SKILL"] : ["LINE", "BACKER", "BACK"];
  const slotLabels = isPlayerOff ? { BLOCKER: "BLOCKER (OL/FB)", QB: "QUARTERBACK", SKILL: "SKILL (QB/RB/WR/TE)" } : { LINE: "LINEMAN (DE/NT)", BACKER: "LINEBACKER (OLB/ILB)", BACK: "BACK (CB/SS/FS)" };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 50% -10%, #17402C 0%, #0B1F16 45%, #050D08 100%)", color: "#E9E4D3", fontFamily: "Verdana, sans-serif", padding: "10px 12px 30px" }}>
      {/* SCOREBOARD */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(180deg,#0C1810,#070D09)", border: "2px solid #C89019", borderRadius: 14, padding: "8px 16px", boxShadow: "inset 0 0 24px #000, 0 4px 18px #0009" }}>
        <ScoreCell t={pT} s={g.score[playerTeam]} poss={g.possession === playerTeam} label="YOU" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "Impact, sans-serif", fontSize: 14, letterSpacing: 3, color: "#FFD86B" }}>{g.ot ? "☠ OVERTIME ☠" : `QUARTER ${g.qtr}`}</div>
          <div style={{ fontFamily: "Courier New, monospace", fontSize: 10, color: "#8FA08F" }}>DRIVE {g.driveNum}/{drivesPerQtr} · DOWN {g.down} · {Math.max(0, TO_GAIN - (g.spot - g.line))} TO GO</div>
          {(lastHalf() || lastGame()) && !g.ot && <div style={{ fontSize: 9, color: "#FFD86B", fontFamily: "Courier New, monospace" }} className="cb-pulse">★ CLUTCH DRIVE — BONUS SCORING ★</div>}
        </div>
        <ScoreCell t={aT} s={g.score[aiTeam]} poss={g.possession === aiTeam} right label="THE MACHINE" />
      </div>

      {/* FIELD BAR */}
      <FieldBar spot={g.spot} line={g.line} possession={g.possession} teams={[playerTeam, aiTeam]} />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 560px", minWidth: 340 }}>
          {/* ====== THE TABLE (reveal or commit) ====== */}
          <div style={{ background: "linear-gradient(180deg,#0F1D14,#0A130D)", border: "1px solid #2C5A44", borderRadius: 14, padding: 14, minHeight: 330 }}>
            {g.reveal ? (
              <div>
                <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", letterSpacing: 2, fontSize: 13, color: "#FFD86B", marginBottom: 10 }}>
                  {g.reveal.play.type === "run" ? "RUN PLAY" : `PASS — ${["10m", "20m", "20+m"][g.reveal.play.depth]}`} · CARDS REVEALED
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {g.reveal.offTrio.map((c, i) => <ArenaCard key={"o" + i} card={c} teamId={g.possession} size={0.85} slam roleTag={["BLOCKER", "QB", "SKILL"][i]} chosen={g.reveal.rolls.win} />)}
                  <div style={{ textAlign: "center", minWidth: 96 }}>
                    <div style={{ fontFamily: "Impact, sans-serif", fontSize: 30, color: g.reveal.rolls.win ? "#9BD53C" : "#FF8A70", textShadow: "0 2px 0 #000" }}>{g.reveal.rolls.o}</div>
                    <div style={{ fontSize: 9, color: "#8FA08F", fontFamily: "Courier New, monospace" }}>+{g.reveal.oB} total</div>
                    <div style={{ fontFamily: "Impact, sans-serif", fontSize: 18, color: "#FFD86B", margin: "2px 0" }}>⚔</div>
                    <div style={{ fontFamily: "Impact, sans-serif", fontSize: 30, color: !g.reveal.rolls.win ? "#9BD53C" : "#FF8A70", textShadow: "0 2px 0 #000" }}>{g.reveal.rolls.d}</div>
                    <div style={{ fontSize: 9, color: "#8FA08F", fontFamily: "Courier New, monospace" }}>+{g.reveal.dB} total</div>
                  </div>
                  {g.reveal.defTrio.map((c, i) => <ArenaCard key={"d" + i} card={c} teamId={g.possession === playerTeam ? aiTeam : playerTeam} size={0.85} slam roleTag={["LINE", "LB", "DB"][i]} chosen={!g.reveal.rolls.win} />)}
                </div>
              </div>
            ) : g.phase === "commitOff" || g.phase === "commitDef" ? (
              <div>
                <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", letterSpacing: 2, fontSize: 13, color: "#FFD86B", marginBottom: 8 }}>
                  {g.phase === "commitOff" ? "BUILD YOUR ATTACK — PICK 3 CARDS" : "BUILD YOUR WALL — PICK 3 CARDS"}
                </div>
                {/* enemy face-down commit */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
                  {[0, 1, 2].map((i) => <ArenaCard key={i} faceDown teamId={g.phase === "commitOff" ? aiTeam === g.other ? g.other : g.other : g.possession} card={null} size={0.55} />)}
                </div>
                <div style={{ textAlign: "center", fontSize: 10, color: "#8FA08F", fontFamily: "Courier New, monospace", marginBottom: 10 }}>
                  {g.phase === "commitOff" ? `${defT.city} has committed its 3 defenders… face down. Rude.` : `${offT.city} has committed its attack… face down. Typical.`}
                </div>
                {/* slot pickers */}
                {slotOrder.map((slot) => (
                  <div key={slot} style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: "Courier New, monospace", fontSize: 10, letterSpacing: 1, color: sel[slot] ? "#9BD53C" : "#FFD86B", marginBottom: 4 }}>
                      {slotLabels[slot]} {sel[slot] ? `— ${sel[slot].name} ✓` : "— choose:"}
                    </div>
                    <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                      {trioSlots[slot].map((c) => {
                        const takenElsewhere = slotOrder.some((s2) => s2 !== slot && sel[s2] === c);
                        return <ArenaCard key={c.name + slot} card={c} teamId={isPlayerOff ? g.possession : g.other} size={0.62}
                          chosen={sel[slot] === c} dimmed={takenElsewhere}
                          onClick={() => { if (!takenElsewhere) setSel({ ...sel, [slot]: sel[slot] === c ? null : c }); }} />;
                      })}
                    </div>
                  </div>
                ))}
                {g.phase === "commitOff" && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 4 }}>
                    <span style={{ fontFamily: "Courier New, monospace", fontSize: 10, color: "#FFD86B" }}>PLAY CALL:</span>
                    <Btn small onClick={() => setSel({ ...sel, play: { type: "run" } })} gold={sel.play?.type === "run"}>RUN</Btn>
                    {[0, 1, 2].map((dp) => (
                      <Btn key={dp} small gold={sel.play?.type === "pass" && sel.play.depth === dp}
                        onClick={() => setSel({ ...sel, play: { type: "pass", depth: dp } })}>
                        PASS {["10m", "20m", "20+"][dp]}{sel.SKILL?.pct ? ` (${sel.SKILL.pct[dp]}%)` : ""}
                      </Btn>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#5E7263", fontFamily: "Courier New, monospace", fontSize: 12 }}>
                {g.phase === "spin" ? "The Meter Wheel awaits its spin…" : "The table is being cleared…"}
              </div>
            )}
          </div>

          {/* ====== CONTROLS ====== */}
          <div style={{ marginTop: 10, background: "#0E1A13", border: "1px solid #2C5A44", borderRadius: 14, padding: 12, textAlign: "center" }}>
            {g.phase === "spin" && <Btn big gold onClick={act(spinWheel)}>🎡 SPIN THE METER WHEEL</Btn>}
            {(g.phase === "commitOff" || g.phase === "commitDef") && (
              <Btn big gold disabled={!snapReady} onClick={act(doSnap)}>{snapReady ? "🏈 SNAP — REVEAL THE CARDS!" : "PICK YOUR 3 CARDS" + (g.phase === "commitOff" ? " + PLAY CALL" : "")}</Btn>
            )}
            {g.phase === "postReveal" && <Btn big onClick={act(afterReveal)}>CONTINUE ➤</Btn>}
            {g.phase === "chase" && g.chase && (
              <div>
                <div style={{ fontFamily: "Courier New, monospace", fontSize: 11, color: "#FFD86B", marginBottom: 8 }}>
                  {g.chase.carrier.name} IS LOOSE — +{g.chase.gain}m! NEXT STEP: PURSUIT +{PURSUIT * (g.chase.steps + 1)}
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <Btn gold onClick={act(() => { chaseStep(); })}>🔥 PUSH UPFIELD</Btn>
                  <Btn onClick={act(() => finishChase(false))}>🛡 GO DOWN SAFE</Btn>
                </div>
              </div>
            )}
            {g.phase === "fourth" && (
              <div>
                <div style={{ fontFamily: "Courier New, monospace", fontSize: 11, color: "#FFD86B", marginBottom: 8 }}>4TH DOWN — {FIELD - g.spot}m TO THE END ZONE</div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <Btn onClick={act(() => startSnapPhase())}>GO FOR IT</Btn>
                  <Btn onClick={act(tryFG)} disabled={heroBlocks()}>{heroBlocks() ? "FG — HERO RULE!" : `FIELD GOAL (~${Math.round(Math.max(20, 90 - 1.2 * (FIELD - g.spot)))}%)`}</Btn>
                  <Btn onClick={act(tryPunt)}>PUNT</Btn>
                </div>
              </div>
            )}
            {g.phase === "pat" && isPlayerOff && (
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <Btn onClick={act(() => doPAT(1))}>KICK XP (+1, 85%)</Btn>
                <Btn gold onClick={act(() => doPAT(2))}>2-POINT TRY (+2, 45%)</Btn>
              </div>
            )}
            {g.phase === "driveOver" && <Btn big onClick={act(nextDrive)}>NEXT DRIVE ➤</Btn>}
          </div>
        </div>

        {/* PLAY-BY-PLAY */}
        <div style={{ flex: "1 1 280px", minWidth: 260 }}>
          <div style={{ background: "#0A120D", border: "1px solid #2C5A44", borderRadius: 14, padding: 12, height: 520, display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Impact, sans-serif", letterSpacing: 2, fontSize: 13, color: "#FFD86B", marginBottom: 8 }}>📡 2151 BROADCAST</div>
            <div ref={logRef} style={{ overflowY: "auto", flex: 1, fontFamily: "Courier New, monospace", fontSize: 11.5, lineHeight: 1.5 }}>
              {g.log.map((e, i) => (
                <div key={i} style={{
                  padding: "4px 6px", borderRadius: 4, marginBottom: 3,
                  color: e.t === "score" ? "#FFD86B" : e.t === "bad" ? "#FF8A70" : e.t === "bad2" ? "#D6A15E" : e.t === "good" ? "#9BD53C" : e.t === "flag" ? "#FFD34D" : "#B9C4B4",
                  background: e.t === "score" ? "#3A2E0E" : e.t === "bad" ? "#3A160E" : "transparent",
                  opacity: i === 0 ? 1 : 0.85,
                }}>{e.m}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function ScoreCell({ t, s, poss, right, label }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: right ? "row-reverse" : "row" }}>
        <TeamLogo t={t} size={48} radius={10} style={{ border: `2px solid ${poss ? "#FFD86B" : t.color2}`, boxShadow: poss ? `0 0 16px ${t.color}` : "none" }} />
        <div style={{ textAlign: right ? "right" : "left" }}>
          <div style={{ fontSize: 8, color: "#8FA08F", fontFamily: "Courier New, monospace", letterSpacing: 1 }}>{label}</div>
          <div style={{ fontFamily: "Impact, sans-serif", fontSize: 13, letterSpacing: 1, color: poss ? "#FFD86B" : "#E9E4D3" }}>{t.city.toUpperCase()} {poss ? "●" : ""}</div>
          <div style={{ fontFamily: "Impact, sans-serif", fontSize: 32, color: "#FFD86B", lineHeight: 1, textShadow: "0 2px 0 #3A2E0E" }}>{s}</div>
        </div>
      </div>
    );
  }
}

function FieldBar({ spot, line, possession, teams }) {
  const pct = Math.max(0, Math.min(100, (spot / FIELD) * 100));
  const fdPct = Math.max(0, Math.min(100, ((line + TO_GAIN) / FIELD) * 100));
  const tA = TEAMS[teams[0]], tB = TEAMS[teams[1]], offT = TEAMS[possession];
  return (
    <div style={{ margin: "8px 0 12px" }}>
      <div style={{ position: "relative", height: 28, background: "repeating-linear-gradient(90deg,#17362A 0,#17362A 9.09%,#1C4234 9.09%,#1C4234 18.18%)", borderRadius: 8, border: "1px solid #2C5A44", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "5%", background: tA.color + "77" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "5%", background: tB.color + "77" }} />
        <div style={{ position: "absolute", left: `${fdPct}%`, top: 0, bottom: 0, width: 2, background: "#FFD86B" }} />
        <div style={{ position: "absolute", left: `calc(${pct}% - 9px)`, top: 3, width: 18, height: 22, background: `linear-gradient(160deg, ${offT.color}, ${offT.dark})`, border: "2px solid #FFD86B", borderRadius: 4, transition: "left .5s ease", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>🏈</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#8FA08F", marginTop: 2, fontFamily: "Courier New, monospace" }}>
        <span>OWN GOAL</span><span>BALL AT {spot}m · {FIELD - spot} TO PAY DIRT</span><span>END ZONE</span>
      </div>
    </div>
  );
}

/* ---------------- SCREENS ---------------- */
function Title({ onPlay }) {
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 50% 15%, #1A4530 0%, #0B1F16 55%, #040A06 100%)", color: "#E9E4D3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Verdana, sans-serif", padding: 20, textAlign: "center" }}>
      <div style={{ fontSize: 54 }}>🏈</div>
      <div style={{ fontFamily: "Courier New, monospace", color: "#8FA08F", letterSpacing: 4, fontSize: 12, marginTop: 8 }}>THE POLYMATIC FOOTBALL LEAGUE · SEASON 27 · 2151</div>
      <h1 style={{ fontFamily: "Impact, sans-serif", fontSize: "clamp(42px, 9vw, 92px)", margin: "10px 0 0", color: "#FFD86B", letterSpacing: 3, textShadow: "0 6px 0 #3A2E0E, 0 12px 24px #000" }}>CUSTOMER BUTTCHEEKS</h1>
      <div style={{ fontFamily: "Impact, sans-serif", fontSize: 24, color: "#9BB53C", letterSpacing: 6, marginTop: 4 }}>GRIDIRON CARD BATTLE — ARENA EDITION</div>
      <p style={{ maxWidth: 540, color: "#B9C4B4", fontSize: 13, lineHeight: 1.7, marginTop: 16 }}>
        Commit <b style={{ color: "#FFD86B" }}>three cards</b> in secret. Your opponent does the same.
        SNAP — and everything is revealed. Blocker, QB, and playmaker against Line, Backer, and Back.
        Best dice with the best math wins the down. <b style={{ color: "#FFD86B" }}>No game may be decided by a field goal.</b>
      </p>
      <div style={{ marginTop: 22 }}><Btn big gold onClick={onPlay}>ENTER THE ARENA ➤</Btn></div>
    </div>
  );
}

function Select({ playerTeam, setPlayerTeam, aiTeam, setAiTeam, mode, setMode, onNext }) {
  const ids = Object.keys(TEAMS);
  return (
    <div style={{ minHeight: "100vh", background: "#0B1F16", color: "#E9E4D3", fontFamily: "Verdana, sans-serif", padding: 24 }}>
      <div style={{ fontFamily: "Impact, sans-serif", fontSize: 28, color: "#FFD86B", letterSpacing: 2, textAlign: "center" }}>CHOOSE YOUR FRANCHISE</div>
      <div style={{ textAlign: "center", fontSize: 11, color: "#8FA08F", fontFamily: "Courier New, monospace", marginBottom: 18 }}>first tap = your team · second tap = the machine's team</div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        {ids.map((id) => {
          const t = TEAMS[id]; const isP = playerTeam === id, isA = aiTeam === id;
          return (
            <div key={id} onClick={() => { if (isP) { setPlayerTeam(null); return; } if (isA) { setAiTeam(null); return; } if (!playerTeam) setPlayerTeam(id); else if (!aiTeam && id !== playerTeam) setAiTeam(id); }}
              style={{ width: 235, cursor: "pointer", borderRadius: 14, overflow: "hidden", border: `3px solid ${isP ? "#FFD86B" : isA ? "#D6482F" : t.color2}`, background: `linear-gradient(170deg, ${t.dark}, #0A0F0B)`, transform: isP || isA ? "translateY(-5px)" : "none", transition: "all .2s", boxShadow: isP ? "0 0 22px #FFD86B66" : isA ? "0 0 22px #D6482F66" : "0 6px 14px #0007" }}>
              <div style={{ height: 130, background: t.logoBg || t.dark, borderBottom: `1px solid ${t.color2}`, overflow: "hidden" }}>
                <img src={t.logo} alt={`${t.city} ${t.name} logo`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
              </div>
              <div style={{ background: `linear-gradient(90deg, ${t.color}, ${t.dark})`, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "Impact, sans-serif", fontSize: 16, color: "#fff", letterSpacing: 1 }}>{t.city.toUpperCase()}</span>
                <TeamLogo t={t} size={30} radius={6} style={{ border: "1px solid #FFFFFFAA" }} />
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontFamily: "Impact, sans-serif", fontSize: 18, color: t.color2 }}>{t.name}</div>
                <div style={{ fontSize: 9, color: "#8FA08F", fontFamily: "Courier New, monospace", margin: "4px 0 8px" }}>{t.conf}</div>
                <div style={{ fontSize: 11, color: "#B9C4B4", lineHeight: 1.5, minHeight: 34 }}>{t.identity}</div>
                <div style={{ marginTop: 8, fontSize: 10, color: "#8FA08F" }}>
                  ⭐ <b style={{ color: "#E9E4D3" }}>{t.offense[0].name}</b> (+{t.offense[0].diff}) · <b style={{ color: "#E9E4D3" }}>{t.offense[2].name}</b> (+{t.offense[2].diff})
                </div>
                {(isP || isA) && <div style={{ marginTop: 8, fontFamily: "Impact, sans-serif", color: isP ? "#FFD86B" : "#D6482F", letterSpacing: 2, fontSize: 13 }}>{isP ? "★ YOUR TEAM" : "✦ THE MACHINE"}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 22, display: "flex", gap: 10, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
        <Btn small onClick={() => setMode(mode === "quick" ? "full" : "quick")}>MODE: {mode === "quick" ? "QUICK (2 drives/side/qtr)" : "FULL RULES (4)"}</Btn>
        <Btn big gold onClick={onNext} disabled={!playerTeam || !aiTeam}>STAKE YOUR CHITS ➤</Btn>
      </div>
    </div>
  );
}

function Stake({ staked, setStaked, aiTeam, onStart }) {
  const toggle = (tag) => setStaked(staked.includes(tag) ? staked.filter((t) => t !== tag) : staked.length < 3 ? [...staked, tag] : staked);
  return (
    <div style={{ minHeight: "100vh", background: "#0B1F16", color: "#E9E4D3", fontFamily: "Verdana, sans-serif", padding: 24 }}>
      <div style={{ fontFamily: "Impact, sans-serif", fontSize: 28, color: "#FFD86B", letterSpacing: 2, textAlign: "center" }}>STAKE YOUR CHITS</div>
      <div style={{ textAlign: "center", fontSize: 11, color: "#8FA08F", fontFamily: "Courier New, monospace", marginBottom: 4 }}>Up to 3. Winner takes every chit staked or used. That is the law of the Store.</div>
      <div style={{ textAlign: "center", fontSize: 11, color: "#D6A15E", fontFamily: "Courier New, monospace", marginBottom: 16 }}>{TEAMS[aiTeam].city} has quietly staked 2 of its own…</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", maxWidth: 900, margin: "0 auto" }}>
        {CHITS.map((c) => {
          const on = staked.includes(c.tag);
          return (
            <div key={c.id} onClick={() => toggle(c.tag)} className={on ? "cb-pulse" : ""} style={{ width: 200, padding: 12, borderRadius: 12, cursor: "pointer", border: `2px solid ${on ? "#FFD86B" : "#2C5A44"}`, background: on ? "linear-gradient(170deg,#2A3618,#141B0C)" : "#0E1A13", transition: "all .15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "Impact, sans-serif", color: "#FFD86B", fontSize: 14 }}>#{c.id} {c.name}</span>
                {on && <span style={{ color: "#FFD86B" }}>★</span>}
              </div>
              <div style={{ fontSize: 10.5, color: "#B9C4B4", marginTop: 6, lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 22 }}><Btn big gold onClick={onStart}>🎡 KICKOFF ➤</Btn></div>
    </div>
  );
}

function Final({ g, playerTeam, aiTeam, onAgain }) {
  const pS = g.score[playerTeam], aS = g.score[aiTeam];
  const won = pS > aS; const winner = won ? playerTeam : aiTeam;
  const pot = [...new Set([...(g.chits[playerTeam] || []), ...(g.chits[aiTeam] || [])])];
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 50% 30%, #1A4530, #040A06)", color: "#E9E4D3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Verdana, sans-serif", padding: 20, textAlign: "center" }}>
      <div style={{ fontSize: 50 }}>{won ? "🏆" : "🍛"}</div>
      <div style={{ fontFamily: "Impact, sans-serif", fontSize: 18, letterSpacing: 4, color: "#8FA08F", marginTop: 6 }}>FINAL — SEASON 27</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
        <TeamLogo t={TEAMS[playerTeam]} size={74} radius={12} style={{ border: `2px solid ${TEAMS[playerTeam].color2}` }} />
        <div style={{ fontFamily: "Impact, sans-serif", fontSize: 18, color: "#FFD86B", letterSpacing: 2 }}>VS</div>
        <TeamLogo t={TEAMS[aiTeam]} size={74} radius={12} style={{ border: `2px solid ${TEAMS[aiTeam].color2}` }} />
      </div>
      <div style={{ fontFamily: "Impact, sans-serif", fontSize: "clamp(36px,8vw,76px)", color: "#FFD86B", margin: "8px 0", textShadow: "0 4px 0 #3A2E0E" }}>
        {TEAMS[playerTeam].city.toUpperCase()} {pS} — {aS} {TEAMS[aiTeam].city.toUpperCase()}
      </div>
      <div style={{ fontFamily: "Impact, sans-serif", fontSize: 26, color: won ? "#9BD53C" : "#FF8A70", letterSpacing: 2 }}>
        {won ? "VICTORY! ISN'T THAT LOVERLY?" : "DEFEAT. THE STAFF MEAL AWAITS. (It's beans.)"}
      </div>
      <div style={{ marginTop: 14, fontFamily: "Courier New, monospace", fontSize: 12, color: "#B9C4B4" }}>Plays: {g.stats.plays} · TDs: {g.stats.tds} · Turnovers: {g.stats.tos}</div>
      {pot.length > 0 && (
        <div style={{ marginTop: 14, padding: 14, border: "2px solid #C89019", borderRadius: 12, maxWidth: 440, background: "#141B0C" }}>
          <div style={{ fontFamily: "Impact, sans-serif", color: "#FFD86B", letterSpacing: 2, fontSize: 14 }}>💰 THE POT GOES TO {TEAMS[winner].city.toUpperCase()} — CHA-CHING!</div>
          <div style={{ fontSize: 11, color: "#B9C4B4", marginTop: 6 }}>{pot.map((t) => CHITS.find((c) => c.tag === t)?.name).filter(Boolean).join(" · ") || "—"}</div>
        </div>
      )}
      <div style={{ marginTop: 22 }}><Btn big gold onClick={onAgain}>RUN IT BACK ➤</Btn></div>
    </div>
  );
}
