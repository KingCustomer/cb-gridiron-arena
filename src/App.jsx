import React, { useState, useRef, useEffect } from "react";

/* ============================================================
   CUSTOMER BUTTCHEEKS: GRIDIRON CARD BATTLE — ARENA EDITION v3
   Authored fresh in-session. Full Players-sheet rosters for the
   4 playable teams; green-highlighted players = SUPERSTARS.
   3-card commit & reveal · dice tray · Help menu · Coming Soon.
   Rules: Rookie Edition reconciled · V6 engine constants.
   ============================================================ */

const d = (n) => 1 + Math.floor(Math.random() * n);
const d100 = () => d(100);
const OFF_EDGE = 10, TAKEAWAY_MARGIN = 25, PURSUIT = 6, FIELD = 110, TO_GAIN = 10, STACK_CAP = 40;

/* ---------- portraits & flavor ---------- */
const POS_EMOJI = { QB1: "🎯", QB2: "🧠", RB1: "🏃", RB2: "🏃", WR1: "🙌", WR2: "👐", WR3: "👐", WR4: "👐", TE1: "🪝", TE2: "🪝", FB1: "🐗", FB2: "🐗", LT: "🧱", LG: "🧱", C: "🧱", RG: "🧱", RT: "🧱", DE: "🦈", NT: "🗿", ILB: "🐺", OLB: "⚡", CB1: "🦊", CB2: "🦊", CB3: "🦊", CB4: "🦊", SS: "🔨", FS: "🦅" };
const portrait = (card, teamId) => {
  if (/^S[. ]/.test(card.name)) return "🤖";
  if (card.name.includes("Jemineye")) return "👯‍♀️";
  if (/^R\./.test(card.name) || /^(WR|TE|LB|Back|Safety|Guard|Tackle|Center|Nose Tackle|End) \d+/.test(card.name)) return "⚒️";
  if (teamId === "assam" && card.pos === "RB1") return "🐍";
  return POS_EMOJI[card.pos] || "🏈";
};
const FLAVOR = {
  "Bud Grimsby": "Has never heard of the sideline. Refuses to learn.",
  "Cassandra Jemineye": "Sees the whole field. Also sees your browser history.",
  "Helga Jemineye": "The other twin. Somehow ALSO the better one.",
  "Saxby Lawless": "One more ring. Then he'll stop. He will not stop.",
  "Sample Wong": "Statistically, a miracle. Contractually, employee #00001.",
  "R.Lenin IV": "Redistributes the ball. Occasionally to the other team.",
  "Hardeep Tanaka": "Refused the field goal. Became a hymn.",
  "WR 919": "His name is a number. His routes are poetry.",
  "WR 884": "Not to be confused with WR 883. HE knows what he did.",
  "Lawrence Awl": "The Simulacra's invoice for touching their quarterback.",
  "Deacon Patel": "The Creeping Death's collections department.",
  "Tremendous Ben": "The name is a legal ruling. The nose tackle is a fact.",
  "Hercule Breadsalt": "Solves exactly one mystery: where the QB went.",
  "Leopold Haystacks": "Needles fear him.",
  "Tackle 909": "Union-certified pancake artist.",
  "Center 434": "Snaps the ball. Snaps expectations.",
  "Sreedevi Ganga": "The river takes what the river wants.",
  "Timothy Bentley": "Reads quarterbacks like overdue library books.",
};
const FLAVOR_POOL = {
  QB: ["Throws darts. Occasionally at teammates.", "Reads defenses like a menu."],
  RB: ["Legs powered by pure spite.", "Contact is a suggestion."],
  WR: ["One foot down is ALL feet down.", "Catches things. Feelings, mostly."],
  TE: ["A wall that runs routes.", "Blocks, catches, apologizes for neither."],
  FB: ["The tip of the spear. Also the spear.", "His hobbies include: forward."],
  OL: ["The pancake breakfast is self-serve.", "Paid by the bruise."],
  D: ["Files tackles under 'correspondence.'", "The end zone is a members-only club. He checks IDs.", "Runs a toll booth at the line of scrimmage.", "Interceptions are just aggressive borrowing."],
};
const famOf = (pos) => pos.startsWith("QB") ? "QB" : pos.startsWith("RB") ? "RB" : pos.startsWith("WR") ? "WR" : pos.startsWith("TE") ? "TE" : pos.startsWith("FB") ? "FB" : ["LT", "LG", "C", "RG", "RT"].includes(pos) ? "OL" : "D";
const flavorOf = (c) => FLAVOR[c.name] || FLAVOR_POOL[famOf(c.pos)][c.name.length % FLAVOR_POOL[famOf(c.pos)].length];
const rarity = (c) => c.elite
  ? { label: "⭐ SUPERSTAR", frame: "linear-gradient(135deg,#3DDC84,#0E8A4A,#B7F5D0,#FFD86B)", glow: "#3DDC84" }
  : c.diff >= 25 ? { label: "LEGENDARY", frame: "linear-gradient(135deg,#FFB347,#FF6B1A,#FFD700)", glow: "#FF9C33" }
  : c.diff >= 15 ? { label: "RARE", frame: "linear-gradient(135deg,#F5D06A,#B8860B,#F5E5A0)", glow: "#E3B23C" }
  : c.diff >= 10 ? { label: "UNCOMMON", frame: "linear-gradient(135deg,#C0C8D0,#7E8B99,#DDE4EA)", glow: "#9FB2C4" }
  : { label: "COMMON", frame: "linear-gradient(135deg,#8A7B63,#5E523F,#A79878)", glow: "#8A7B63" };

/* ---------------- TEAM DATA (full Players-sheet rosters; elite = green) ---------------- */
const TEAMS = {
  estes: {
    id: "estes", city: "Estes Park", name: "Simulacra", conf: "THE HAVES · Prime",
    color: "#8E7CC3", color2: "#C9C4D4", dark: "#241C38", glyph: "◈", logo: "/logos/ESTES.jpg", logoImg: false,
    identity: "Clone-perfect precision. Elite twins at QB.",
    tendency: { run: 0.45, deep: 0.4 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Cassandra Jemineye", diff: 30, pct: [91, 72, 60], ab: { deadEye: 10 }, elite: true },
      { pos: "QB2", slot: "QB", name: "Helga Jemineye", diff: 27, pct: [88, 70, 58], ab: { osrRun: 8 }, elite: true },
      { pos: "RB1", slot: "SKL", name: "S.Finley Allen", diff: 15, pct: [48, 40, 18], ab: {  } },
      { pos: "WR1", slot: "SKL", name: "S.Solomon Moss", diff: 20, pct: [88, 77, 66], ab: { osrPass: 9 }, elite: true },
      { pos: "WR2", slot: "SKL", name: "Xi Zhou Liu", diff: 9, pct: [76, 80, 74], ab: { dsrPen: 6 } },
      { pos: "WR3", slot: "SKL", name: "Grisham Locke", diff: 11, pct: [83, 74, 53], ab: {  } },
      { pos: "WR4", slot: "SKL", name: "S.Avery Broom", diff: 14, pct: [85, 62, 60], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "S.Ingmar Shockey", diff: 18, pct: [63, 70, 80], ab: { dsrPen: 4 } },
      { pos: "TE2", slot: "SKL", name: "Cenk Suleiman", diff: 18, pct: [67, 72, 75], ab: { dsrPen: 3 } },
      { pos: "FB1", slot: "BLK", name: "Green Grange", diff: 8, pct: [22, 18, 15], ab: { osrRun: 3 } },
      { pos: "LT", slot: "BLK", name: "S.Vladimir Markov", diff: 24, pct: null, ab: { osrPass: 10 }, elite: true },
      { pos: "LG", slot: "BLK", name: "S.Freddy Frawley", diff: 22, pct: null, ab: { osrRun: 8 }, elite: true },
      { pos: "C", slot: "BLK", name: "S.Roy Canasta", diff: 17, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Jimmy Stanback", diff: 8, pct: null, ab: { osrPass: 6 } },
      { pos: "RT", slot: "BLK", name: "S.Ronald Crump", diff: 18, pct: null, ab: { osrPass: 6 } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Lawrence Awl", diff: 27, ab: { sackB: 8 }, elite: true },
      { pos: "DE2", slot: "LINE", name: "Björn Mikkelson", diff: 8, ab: { sackB: 4 } },
      { pos: "NT1", slot: "LINE", name: "S.Albin Nowak", diff: 8, ab: { dsrRun: 4 } },
      { pos: "NT2", slot: "LINE", name: "Clennell Washington", diff: 12, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Terrence Fillian", diff: 16, ab: { dsrRun: 3 } },
      { pos: "ILB2", slot: "LB", name: "S.Jarold Klim", diff: 22, ab: { dsrRun: 6 }, elite: true },
      { pos: "OLB1", slot: "LB", name: "S.Mitchell Towers", diff: 17, ab: { sackB: 4 } },
      { pos: "OLB2", slot: "LB", name: "S.Wendell Knort", diff: 15, ab: {  } },
      { pos: "CB1", slot: "DB", name: "S.Wes Allen", diff: 15, ab: { dsrPass: 3 } },
      { pos: "CB2", slot: "DB", name: "S. Eric Hopkins", diff: 16, ab: {  } },
      { pos: "CB3", slot: "DB", name: "S.Nolan Boykin", diff: 13, ab: { osrPass: 6 } },
      { pos: "CB4", slot: "DB", name: "S.Jaylen Maragos", diff: 11, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Ingmar Stork", diff: 24, ab: { intB: 6 }, elite: true },
      { pos: "SS2", slot: "DB", name: "S.Vaughn Wyatt", diff: 9, ab: { dsrRun: 3 } },
      { pos: "FS1", slot: "DB", name: "S.Merton Reedis", diff: 6, ab: { dsrPass: 3 } },
    ],
  },
  london: {
    id: "london", city: "London", name: "Amplified Gentry", conf: "THE HAVES · Nova",
    color: "#1F3A93", color2: "#E3B23C", dark: "#0E1B3A", glyph: "♛", logo: "/logos/LONDON.jpg", logoImg: false,
    identity: "Old money, new arms. Saxby hunts one last title.",
    tendency: { run: 0.5, deep: 0.5 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Saxby Lawless", diff: 26, pct: [84, 80, 73], ab: { osrPass: 4 }, elite: true },
      { pos: "QB2", slot: "QB", name: "Orkis Fung-Yick", diff: 20, pct: [92, 34, 15], ab: { osrRun: 10 } },
      { pos: "RB1", slot: "SKL", name: "Boris Talc", diff: 10, pct: [30, 60, 73], ab: { osr11: 6 } },
      { pos: "WR1", slot: "SKL", name: "S.Gerson Rice", diff: 22, pct: [90, 80, 76], ab: { osrPass: 9 }, elite: true },
      { pos: "WR2", slot: "SKL", name: "Gwendolin Jones", diff: 11, pct: [40, 62, 75], ab: { osr11: 6 } },
      { pos: "TE1", slot: "SKL", name: "Sunil Lazenby", diff: 24, pct: [50, 69, 83], ab: { dsrPen: 4 }, elite: true },
      { pos: "TE2", slot: "SKL", name: "S.Ditka Winslow", diff: 8, pct: [60, 68, 77], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "George Causeway", diff: 10, pct: [25, 14, 11], ab: { osrRun: 3 } },
      { pos: "LT", slot: "BLK", name: "Ralph Poole", diff: 22, pct: null, ab: { osrPass: 10 }, elite: true },
      { pos: "LG", slot: "BLK", name: "Stanley Quim", diff: 22, pct: null, ab: { osrRun: 6 }, elite: true },
      { pos: "C", slot: "BLK", name: "Robert T. Bruce", diff: 23, pct: null, ab: { osrRun: 8 }, elite: true },
      { pos: "RG", slot: "BLK", name: "Duke York", diff: 10, pct: null, ab: { osrPass: 6 } },
      { pos: "RT", slot: "BLK", name: "Earl Hastings", diff: 15, pct: null, ab: { osrPass: 6 } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Hercule Breadsalt", diff: 25, ab: { sackB: 8 }, elite: true },
      { pos: "DE2", slot: "LINE", name: "Leopold Haystacks", diff: 23, ab: { sackB: 6 }, elite: true },
      { pos: "NT1", slot: "LINE", name: "Tremendous Ben", diff: 24, ab: { dsrRun: 8 }, elite: true },
      { pos: "NT2", slot: "LINE", name: "Arjun Srinigar", diff: 15, ab: { dsrRun: 4 } },
      { pos: "ILB1", slot: "LB", name: "Nigel Pickwick", diff: 13, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "Chester Fields", diff: 17, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Bill Burns", diff: 17, ab: { sackB: 4 } },
      { pos: "OLB2", slot: "LB", name: "Ernest Mobley", diff: 9, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Lorenzo Talib", diff: 8, ab: { osrPass: 6 } },
      { pos: "CB2", slot: "DB", name: "Chris Roby", diff: 9, ab: { osrPass: 6 } },
      { pos: "CB3", slot: "DB", name: "Josh Webster", diff: 7, ab: { osrPass: 6 } },
      { pos: "CB4", slot: "DB", name: "Shiloh Ward", diff: 12, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Jason Braxton", diff: 13, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Timothy Bentley", diff: 22, ab: { intB: 8 }, elite: true },
    ],
  },
  miami: {
    id: "miami", city: "Miami", name: "United Workers Party", conf: "THE HAVE NOTS · Plebian",
    color: "#B3202C", color2: "#E3B23C", dark: "#33090D", glyph: "☭", logo: "/logos/MIAMI.jpg", logoImg: false,
    identity: "Seize the meters of production.",
    tendency: { run: 0.4, deep: 0.25 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Sample Wong", diff: 33, pct: [80, 52, 28], ab: { deadEye: 6 }, elite: true },
      { pos: "QB2", slot: "QB", name: "R.Lenin IV", diff: 17, pct: [70, 35, 22], ab: { quick: true } },
      { pos: "RB1", slot: "SKL", name: "R.Vittorio Bevelacqua", diff: 13, pct: [11, 20, 45], ab: { osr11: 5 } },
      { pos: "WR1", slot: "SKL", name: "WR 919", diff: 10, pct: [22, 54, 70], ab: { osrPass: 7 } },
      { pos: "WR2", slot: "SKL", name: "WR 884", diff: 7, pct: [28, 40, 60], ab: { dsrPen: 3 } },
      { pos: "WR3", slot: "SKL", name: "WR 327", diff: 12, pct: [56, 52, 30], ab: { dsrPen: 3 } },
      { pos: "TE1", slot: "SKL", name: "TE 427", diff: 8, pct: [18, 50, 60], ab: { dsrPen: 3 } },
      { pos: "TE2", slot: "SKL", name: "R.Vincent Hoxha", diff: 14, pct: [53, 55, 66], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "R.Pavel Tong", diff: 18, pct: [17, 17, 6], ab: { osrRun: 3 } },
      { pos: "LT", slot: "BLK", name: "Tackle 909", diff: 23, pct: null, ab: { osrPass: 8 }, elite: true },
      { pos: "LG", slot: "BLK", name: "Guard 756", diff: 22, pct: null, ab: { osrRun: 8 }, elite: true },
      { pos: "C", slot: "BLK", name: "Center 434", diff: 22, pct: null, ab: { osrRun: 6 }, elite: true },
      { pos: "RG", slot: "BLK", name: "Guard 732", diff: 16, pct: null, ab: { osrPass: 6 } },
      { pos: "RT", slot: "BLK", name: "Tackle 287", diff: 13, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "End 997", diff: 11, ab: { sackB: 4 } },
      { pos: "DE2", slot: "LINE", name: "R.Clark Stumpf", diff: 15, ab: { sackB: 4 } },
      { pos: "NT1", slot: "LINE", name: "Nose Tackle 290", diff: 16, ab: { dsrRun: 4 } },
      { pos: "NT2", slot: "LINE", name: "Nose Tackle 087", diff: 10, ab: { dsrRun: 4 } },
      { pos: "ILB1", slot: "LB", name: "LB 653", diff: 7, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "LB 770", diff: 11, ab: { dsrRun: 3 } },
      { pos: "OLB1", slot: "LB", name: "R.Enver Castro", diff: 10, ab: { sackB: 4 } },
      { pos: "OLB2", slot: "LB", name: "LB 448", diff: 16, ab: { sackB: 4 } },
      { pos: "CB1", slot: "DB", name: "Back 909", diff: 16, ab: { osrPass: 6 } },
      { pos: "CB2", slot: "DB", name: "Back 720", diff: 17, ab: { osrPass: 6 } },
      { pos: "CB3", slot: "DB", name: "R.Jefferson Jackson", diff: 16, ab: {  } },
      { pos: "SS1", slot: "DB", name: "R.Raul Martinez- Wang", diff: 23, ab: { intB: 8 }, elite: true },
      { pos: "SS2", slot: "DB", name: "Safety 652", diff: 10, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Safety 872", diff: 9, ab: {  } },
    ],
  },
  assam: {
    id: "assam", city: "Assam", name: "Creeping Death", conf: "THE HAVE NOTS · Prole",
    color: "#2E7D32", color2: "#9BB53C", dark: "#0C1F0E", glyph: "〇", logo: "/logos/ASSAM.jpg", logoImg: false,
    identity: "The serpent runs. Grimsby wears the 99.",
    tendency: { run: 0.72, deep: 0.15 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Iqbal Kohli", diff: 15, pct: [65, 43, 28], ab: { quick: true } },
      { pos: "QB2", slot: "QB", name: "Junichiro Sato", diff: 13, pct: [40, 22, 16], ab: { dsrPen: 3 } },
      { pos: "RB1", slot: "SKL", name: "Bud Grimsby", diff: 33, pct: [59, 40, 20], ab: { osr11: 8 }, elite: true },
      { pos: "WR1", slot: "SKL", name: "Hardeep Tanaka", diff: 14, pct: [84, 65, 43], ab: { osrPass: 6 } },
      { pos: "WR2", slot: "SKL", name: "Martin Castillo", diff: 9, pct: [31, 43, 65], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Tijo Thanantavali", diff: 10, pct: [56, 42, 35], ab: { dsrRun: 6 } },
      { pos: "TE1", slot: "SKL", name: "Praxad Mbatha", diff: 12, pct: [58, 68, 77], ab: { dsrPen: 3 } },
      { pos: "TE2", slot: "SKL", name: "Farbod Gul", diff: 7, pct: [52, 64, 65], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Ashok Basu", diff: 6, pct: [10, 15, 28], ab: {  } },
      { pos: "FB2", slot: "BLK", name: "Dalbir Huq", diff: 8, pct: [19, 14, 10], ab: {  } },
      { pos: "LT", slot: "BLK", name: "Morton Diehl", diff: 10, pct: null, ab: { osrPass: 8 } },
      { pos: "LG", slot: "BLK", name: "Randall Bohr", diff: 8, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Mardell Sweeney", diff: 12, pct: null, ab: { osrRun: 8 } },
      { pos: "RG", slot: "BLK", name: "Ming Zhou-Lou", diff: 9, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Orkis Steptoe", diff: 8, pct: null, ab: { osrRun: 4 } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Deacon Patel", diff: 24, ab: { sackB: 8 }, elite: true },
      { pos: "DE2", slot: "LINE", name: "Manmohan B.B.", diff: 10, ab: {  } },
      { pos: "NT1", slot: "LINE", name: "Rohit Sambal", diff: 10, ab: { dsrRun: 8 } },
      { pos: "NT2", slot: "LINE", name: "Goro Kuniyoshi", diff: 14, ab: { dsrRun: 6 } },
      { pos: "ILB1", slot: "LB", name: "Lukasz Tomacek", diff: 10, ab: { sackB: 8 } },
      { pos: "ILB2", slot: "LB", name: "Sanjay Singh", diff: 11, ab: { dsrPass: 4 } },
      { pos: "OLB1", slot: "LB", name: "Dalbir Singh", diff: 9, ab: { sackB: 6 } },
      { pos: "OLB2", slot: "LB", name: "Aung Robik", diff: 8, ab: { dsrRun: 4 } },
      { pos: "CB1", slot: "DB", name: "Sirhan Sharma", diff: 10, ab: { dsrPass: 2 } },
      { pos: "CB2", slot: "DB", name: "Mo Cid", diff: 9, ab: { dsrPass: 2 } },
      { pos: "CB3", slot: "DB", name: "Cam Huk", diff: 4, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Sreedevi Ganga", diff: 22, ab: { intB: 8 }, elite: true },
      { pos: "FS1", slot: "DB", name: "Ana Gautami", diff: 7, ab: { intB: 4 } },
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

/* ---- The 20 franchises still in the tunnel (names/logos from CB_Assets; stars = green rows) ---- */
const COMING_SOON = [
  { city: "LA", name: "Firm of Pheir, Payne & Suffering", color: "#C9A227", glyph: "⚖️", logo: "/logos/LA.jpg", logoImg: false, conf: "HAVES · Prime", stars: ["Blackburn Fitzpatrick", "Julek Wroclaw", "E.G. Shapiro", "Keyshawn Mingo", "Mukesh Singh"] },
  { city: "Rome", name: "The Roman Legion", color: "#8E1B1B", glyph: "🏛️", logo: "/logos/ROME.jpg", logoImg: false, conf: "HAVES · Prime", stars: ["Maximiliano Sforza", "Lawson Taylorous", "Ottavio Izzo", "Carlo Bianco", "Primo Ventura"] },
  { city: "The UN", name: "Global Alliance", color: "#3B7DD8", glyph: "🌐", logo: "/logos/UN.jpg", logoImg: false, conf: "HAVES · Prime", stars: ["Bola Nkemediche", "Wing-Fu Chin", "Tommy Nakamura", "Medard Meir", "Fausto Amaral"] },
  { city: "DC", name: "Old Glory", color: "#1F3A93", glyph: "⭐", logo: "/logos/DC.jpg", logoImg: false, conf: "HAVES · Nova", stars: ["Teddy Roosevelt", "Bill Taft", "Geronimo Goyathlay", "Chuck Maplethorpe"] },
  { city: "Tokyo", name: "TASC Masters", color: "#D92B7A", glyph: "⛩️", logo: "/logos/TOKYO.jpg", logoImg: false, conf: "HAVES · Nova", stars: ["Kenji Raiden", "Masafumi Hana", "Hanzo Takahashi", "Daisuke Koizumi", "Ryuzo Nishioka"] },
  { city: "Incan Empire", name: "Obsidian Pumas", color: "#3C2A4D", glyph: "🐆", logo: "/logos/INCA.jpg", logoImg: false, conf: "HAVES · Nova", stars: ["DeAngelo Bell", "Ozcoc Tupac", "Smoke Monkey", "Maria Dos Santos"] },
  { city: "San Fu-Kuo", name: "Mitsune-Gumi Ronin", color: "#B34700", glyph: "🏯", logo: "/logos/SF.jpg", logoImg: false, conf: "HAVES · Alpha", stars: ["Rocky Cosby", "Ronin Nixon", "Mick Christmas", "S.Randy Rice", "Conrad Atwater"] },
  { city: "Cairo", name: "Twice-Risen Pharaohs", color: "#C9A227", glyph: "☥", logo: "/logos/CAIRO.jpg", logoImg: false, conf: "HAVES · Alpha", stars: ["Ibrahim Imhotep", "Hannibal Babafemi", "Anubis Re"] },
  { city: "Sydney", name: "Copper Locusts", color: "#B87333", glyph: "🦗", logo: "/logos/SYDNEY.jpg", logoImg: false, conf: "HAVES · Alpha", stars: ["Neville Namatjira", "Otis McMath", "Jack-Jack Jadira", "Hieronymous Baldwin", "Early Boolgoo"] },
  { city: "Paris", name: "Reign of Terror", color: "#4B1E6B", glyph: "⚜️", logo: "/logos/PARIS.jpg", logoImg: false, conf: "HAVES · Alpha", stars: ["Napolean Bonaparte", "Yves Dauphin", "Charlemagne Arceneaux-Wang"] },
  { city: "Munich", name: "Teutonic Machine", color: "#4A4A4A", glyph: "⚙️", logo: "/logos/MUNICH.jpg", logoImg: false, conf: "HAVE NOTS · Hoi Polloi", stars: ["Shuji Kimura", "Peters Huber", "Isaac Shurmur", "Gustav Schmitz", "Jörn Fuchs"] },
  { city: "Saigon", name: "Amalgamated Clanship", color: "#C0392B", glyph: "🐉", logo: "/logos/SAIGON.jpg", logoImg: false, conf: "HAVE NOTS · Hoi Polloi", stars: ["Jimmy Lo", "Van-Lang Vo", "Dang-Quang Phan"] },
  { city: "Bangkok", name: "Royal Mass Hysteria", color: "#7A1FA2", glyph: "🐘", logo: "/logos/BANGKOK.jpg", logoImg: false, conf: "HAVE NOTS · Hoi Polloi", stars: ["Limsong", "Pu Hoontrakul", "Sumatra Lamsam", "Elliot Eagan"] },
  { city: "Tashkent", name: "Miasmatic Plague", color: "#5B7F2B", glyph: "☣️", logo: "/logos/TASHKENT.jpg", logoImg: false, conf: "HAVE NOTS · Hoi Polloi", stars: ["Mansur Morris", "Bostwick Bykov", "Ibroxhim Csonka", "Sultan Orozov", "Gorky Gusev"] },
  { city: "Mumbai", name: "Federation of Scientists", color: "#0E7490", glyph: "⚛️", logo: "/logos/MUMBAI.jpg", logoImg: false, conf: "HAVE NOTS · Plebian", stars: ["Srinivasa Bose", "Karishma Kumar-L'Fluer", "Ashok Ghandi", "Babu Kohli"] },
  { city: "Chicagoland", name: "Organized Labor", color: "#8A4B08", glyph: "⚒️", logo: "/logos/CHICAGO.jpg", logoImg: false, conf: "HAVE NOTS · Plebian", stars: ["Emerson Tynes", "Everett Gold", "Rory Orr", "Keith Stump", "Rodney Page"] },
  { city: "Mexico City", name: "V2 Immortals", color: "#0F7B4A", glyph: "💀", logo: "/logos/MEXICO.jpg", logoImg: false, conf: "HAVE NOTS · Plebian", stars: ["El Oso", "Hidalgo Villa", "Pancho Sepulveda", "Quinterrius Durie", "Luz Fuentes"] },
  { city: "NY", name: "Illuminati", color: "#101010", glyph: "👁️", logo: "/logos/NY.jpg", logoImg: false, conf: "HAVE NOTS · Prole", stars: ["Tall Fellow", "Mr. Zeus", "Mr. Rose", "The Larch", "Cerberus"] },
  { city: "Ottawa", name: "Iron Maples", color: "#A61C1C", glyph: "🍁", logo: "/logos/OTTOWA.jpg", logoImg: false, conf: "HAVE NOTS · Prole", stars: ["Omar Mung", "Eleanor Motch", "Remy LeFleur", "Lucien LaFlamme"] },
  { city: "Moscow", name: "Atomic Energy Federation", color: "#B8860B", glyph: "☢️", logo: "/logos/MOSCOW.jpg", logoImg: false, conf: "HAVE NOTS · Prole", stars: ["Ekaterina Romanov", "Lev Ivanov", "Semyon Prostakov", "Vasily Molotov", "Vadim Nikolaev"] },
];

function contest(oB, dB) { let o, dv, ro, rd; do { ro = d100(); rd = d100(); o = ro + oB; dv = rd + dB; } while (o === dv); return { win: o > dv, o, d: dv, ro, rd }; }
function takeaway(dB, oB) { const dr = d100() + dB, or = d100() + oB; return { taken: dr - or >= TAKEAWAY_MARGIN, dr, or }; }
const shortGain = () => d(10), longGain = () => d(10) + d(10);

/* ============ DICE ============ */
const DIE_STYLE = {
  OSD: { bg: "#F2EFE2", fg: "#1B2A1B", edge: "#B9B4A2", shape: "d100", label: "OSD" },
  DSD: { bg: "#B3202C", fg: "#FFF", edge: "#7A1119", shape: "d100", label: "DSD" },
  POD: { bg: "#1D4ED8", fg: "#FFF", edge: "#0F2E8F", shape: "d8", label: "POD" },
  ROD: { bg: "#EA580C", fg: "#FFF", edge: "#9A3806", shape: "d8", label: "ROD" },
  DOD: { bg: "#7A1119", fg: "#FFD86B", edge: "#4A0A0F", shape: "d6", label: "DOD" },
  CATCH: { bg: "#15803D", fg: "#FFF", edge: "#0B4A22", shape: "d100", label: "CATCH" },
};
function Die({ kind, val, sub, i = 0 }) {
  const s = DIE_STYLE[kind] || DIE_STYLE.OSD;
  const sz = 46, diamond = s.shape === "d8";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: sz + 14 }}>
      <div className="cb-die" style={{ width: sz, height: sz, animationDelay: `${i * 0.12}s` }}>
        <div style={{
          width: "100%", height: "100%",
          background: `linear-gradient(155deg, ${s.bg}, ${s.edge})`,
          border: `2px solid ${s.edge}`, borderRadius: s.shape === "d100" ? "50%" : 8,
          transform: diamond ? "rotate(45deg) scale(.82)" : "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 10px #000A, inset 0 2px 3px #FFFFFF44",
        }}>
          <span style={{ transform: diamond ? "rotate(-45deg)" : "none", fontFamily: "Impact, sans-serif", fontSize: 19, color: s.fg, textShadow: "0 1px 1px #0007" }}>{val}</span>
        </div>
      </div>
      <div style={{ fontFamily: "Courier New, monospace", fontSize: 8, letterSpacing: 1, color: "#8FA08F" }}>{s.label}{sub ? ` ${sub}` : ""}</div>
    </div>
  );
}
function DiceTray({ dice }) {
  if (!dice || !dice.length) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 10, marginTop: 12, padding: "10px 12px", background: "#00000055", border: "1px dashed #2C5A44", borderRadius: 10, flexWrap: "wrap" }}>
      {dice.map((d0, i) => <Die key={i} kind={d0.k} val={d0.v} sub={d0.sub} i={i} />)}
    </div>
  );
}

/* ============ CARD ============ */
function ArenaCard({ card, teamId, size = 1, faceDown, slam, dimmed, chosen, onClick, roleTag }) {
  const t = TEAMS[teamId];
  if (faceDown) {
    return (
      <div style={{ width: 150 * size, height: 214 * size, borderRadius: 12 * size, flexShrink: 0, background: `repeating-linear-gradient(45deg, ${t.dark}, ${t.dark} 8px, #0A0F0B 8px, #0A0F0B 16px)`, border: `3px solid ${t.color2}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(0,0,0,.6)" }}>
        <div style={{ fontSize: 34 * size, color: t.color2 }}>{t.glyph}</div>
        <div style={{ fontFamily: "Impact, sans-serif", fontSize: 11 * size, letterSpacing: 2, color: t.color2, marginTop: 6 }}>COMMITTED</div>
        <div style={{ fontSize: 7 * size, color: "#8FA08F", marginTop: 4, fontFamily: "Courier New, monospace" }}>PROPERTY OF THE STORE</div>
      </div>
    );
  }
  const r = rarity(card);
  const W = 150 * size, H = 214 * size;
  return (
    <div onClick={onClick} className={slam ? "cb-slam" : ""} style={{
      width: W, height: H, borderRadius: 12 * size, flexShrink: 0, cursor: onClick ? "pointer" : "default",
      padding: 3, background: r.frame, position: "relative",
      boxShadow: chosen ? `0 0 24px ${r.glow}, 0 0 6px #fff` : card.elite ? `0 0 14px ${r.glow}88` : "0 6px 16px rgba(0,0,0,.55)",
      transform: chosen ? "translateY(-8px) scale(1.03)" : dimmed ? "scale(.97)" : "none",
      opacity: dimmed ? 0.5 : 1, transition: "all .18s",
    }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 9 * size, overflow: "hidden", background: `linear-gradient(175deg, ${t.dark}, #090D0A)`, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${4 * size}px ${7 * size}px`, background: `linear-gradient(90deg, ${t.color}, ${t.dark})` }}>
          <span style={{ fontFamily: "Impact, sans-serif", fontSize: 11 * size, color: "#fff", letterSpacing: 1 }}>{card.pos}</span>
          <span style={{ fontFamily: "Impact, sans-serif", fontSize: 15 * size, color: "#FFE28A", textShadow: "0 1px 0 #000" }}>+{card.diff}</span>
        </div>
        <div style={{ height: 72 * size, background: `radial-gradient(circle at 50% 35%, ${t.color}66, ${t.dark} 75%)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", borderBottom: `2px solid ${card.elite ? "#3DDC84" : t.color2}88` }}>
          <div style={{ fontSize: 38 * size, filter: "drop-shadow(0 4px 4px #000)" }}>{portrait(card, teamId)}</div>
          <div style={{ position: "absolute", bottom: 3, right: 6, fontSize: 12 * size, color: t.color2, opacity: 0.8 }}>{t.glyph}</div>
          {roleTag && <div style={{ position: "absolute", top: 3, left: 5, fontSize: 7.5 * size, fontFamily: "Impact, sans-serif", letterSpacing: 1, background: "#000A", color: "#FFE28A", padding: "2px 5px", borderRadius: 4 }}>{roleTag}</div>}
          {card.elite && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(90deg,#0E8A4Acc,#3DDC84cc,#0E8A4Acc)", textAlign: "center", fontFamily: "Impact, sans-serif", fontSize: 8 * size, letterSpacing: 2, color: "#04220F", padding: "1px 0" }}>⭐ SUPERSTAR</div>}
        </div>
        <div style={{ padding: `${4 * size}px ${7 * size}px 0`, fontSize: 10.5 * size, fontWeight: "bold", color: "#F2EFE2", fontFamily: "Verdana, sans-serif", lineHeight: 1.15, minHeight: 24 * size }}>{card.name}</div>
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

/* ============ HELP MENU (self-contained; drop anywhere) ============ */
const HELP_SECTIONS = [
  { id: "goal", label: "The Goal", body: [
    ["b", "Score more points than the machine across 4 quarters."],
    ["p", "Each team gets a set number of drives per quarter (2 in Quick, 4 in Full Rules). A drive starts where the Meter Wheel says, and you get 4 downs to gain 10 meters at a time, all the way to the end zone — 110 meters of trouble."],
    ["p", "Touchdowns are 6 points — but 8 on the last drive of the first half and a mighty 10 on the last drive of the game. Field goals are 3 (5 in the clutch). Miss a kick and the enemy gets a free ROUGE point, and they will not be gracious about it."],
  ]},
  { id: "cards", label: "Your 3 Cards", body: [
    ["b", "Every snap, both sides secretly commit exactly three cards."],
    ["p", "ON OFFENSE: a Blocker (any lineman or fullback) + a Quarterback + a Skill player (QB, RB, WR, or TE — your ball carrier or target). Then call your play: RUN, or PASS at 10m / 20m / 20+ depth."],
    ["p", "ON DEFENSE: a Lineman (DE/NT) + a Linebacker (OLB/ILB) + a Back (CB/SS/FS). Guess run and stack the box — or guess wrong and watch the highlight from the ground."],
    ["p", "⭐ Green-framed SUPERSTARS are your elites — the biggest differentials and signature abilities. The machine studies your habits, so don't get predictable."],
  ]},
  { id: "dice", label: "The Dice", body: [
    ["b", "SNAP! Both trios flip face-up and the dice decide."],
    ["p", "WHITE d100 (OSD) + your cards' differentials + a +10 offense edge, versus the RED d100 (DSD) + their differentials. Highest total wins the down."],
    ["p", "Offense wins a RUN → the ORANGE d8 (ROD) says how: short gains, long gains, broken tackles, hurdles — or a fumble scare on a 1. Offense wins a PASS → the BLUE d8 (POD) rules the sky (1 risks a pick, 6 is a contested ball), then the GREEN catch roll must land under your receiver's depth percentage."],
    ["p", "Defense wins → the dark-red d6 (DOD): sacks, stuffs, strip sacks, and takeaway chances."],
    ["p", "THE TAKEAWAY CHECK: every interception, fumble, or strip only counts if the defense wins one more contest by 25 OR MORE. Turnovers are earned, not gifted."],
  ]},
  { id: "chase", label: "The Chase", body: [
    ["b", "Gained yards and still standing? Push your luck."],
    ["p", "Each extra step is a fresh contest — but the pursuit gets +6 stronger every time (+6, +12, +18…). Break away for a house call, or get chopped down and maybe stripped on the first big hit. GO DOWN SAFE is always allowed. Cowardice is legal; it is merely remembered."],
  ]},
  { id: "kicks", label: "Kicks & The Hero Rule", body: [
    ["b", "4th down: GO, KICK, or PUNT."],
    ["p", "Field goals get harder with distance; a miss hands over a ROUGE point plus the ball. Punts spin the Yardage Wheel twice (beware the SHANK; pray for the COFFIN CORNER)."],
    ["p", "THE HERO RULE: a field goal may NOT take the lead or break a tie on the final drive of the game or overtime. Want to win at the end? Score a touchdown like a hero. Kicking one while already ahead is just showing off, and showing off is allowed."],
  ]},
  { id: "chits", label: "Chits & Winning", body: [
    ["b", "Chits are one-use power-ups — and the stakes."],
    ["p", "Before kickoff, each side stakes up to 3 chits. The winner takes every chit staked or used. That is the law of the Store. Chowder buffs your lines, Weaver sharpens your passes, Golden Toe makes every kick true (but forfeits clutch kick bonuses — the Toe is reliable, not dramatic)."],
    ["p", "Tie at the end? OVERTIME: alternating possessions from the enemy 35 until somebody blinks. There must be a winner. That is also the law."],
  ]},
];
function HelpFab() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("goal");
  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="How to play" style={{
        position: "fixed", bottom: 18, right: 18, zIndex: 60, width: 52, height: 52, borderRadius: "50%",
        background: "linear-gradient(180deg,#FFD86B,#C89019)", border: "2px solid #FFEBAE",
        fontFamily: "Georgia, serif", fontSize: 26, fontWeight: "bold", color: "#3A2703",
        boxShadow: "0 4px 0 #7A5608, 0 8px 20px #000A", cursor: "pointer",
      }}>?</button>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 61, background: "#000B", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 640, maxHeight: "84vh", display: "flex", flexDirection: "column", background: "linear-gradient(180deg,#10231A,#0A130D)", border: "2px solid #C89019", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px #000" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "linear-gradient(90deg,#14532D,#0A130D)", borderBottom: "1px solid #C89019" }}>
              <div style={{ fontFamily: "Impact, sans-serif", letterSpacing: 2, fontSize: 17, color: "#FFD86B" }}>🏈 HOW TO PLAY</div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "1px solid #7ACB98", color: "#F6F3E6", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontFamily: "Impact, sans-serif" }}>CLOSE</button>
            </div>
            <div style={{ display: "flex", gap: 6, padding: "10px 14px", flexWrap: "wrap", borderBottom: "1px solid #2C5A44" }}>
              {HELP_SECTIONS.map((s) => (
                <button key={s.id} onClick={() => setTab(s.id)} style={{
                  fontFamily: "Impact, sans-serif", fontSize: 11, letterSpacing: 1, padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                  background: tab === s.id ? "linear-gradient(180deg,#FFD86B,#C89019)" : "#0E1A13",
                  color: tab === s.id ? "#3A2703" : "#B9C4B4", border: `1px solid ${tab === s.id ? "#FFEBAE" : "#2C5A44"}`,
                }}>{s.label}</button>
              ))}
            </div>
            <div style={{ overflowY: "auto", padding: "14px 18px", fontFamily: "Verdana, sans-serif" }}>
              {HELP_SECTIONS.find((s) => s.id === tab).body.map(([kind, text], i) => (
                <p key={i} style={{ fontSize: kind === "b" ? 14 : 12.5, fontWeight: kind === "b" ? "bold" : "normal", color: kind === "b" ? "#FFD86B" : "#D8D3C2", lineHeight: 1.65, margin: "0 0 10px" }}>{text}</p>
              ))}
              <p style={{ fontSize: 10, color: "#5E7263", fontFamily: "Courier New, monospace", marginTop: 14 }}>Rules: CB Rookie Edition (reconciled). No game may be decided by a cowardly kick.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const CSS = `
@keyframes cbSlam { 0% { transform: scale(1.6) rotate(-4deg); opacity: 0; } 60% { transform: scale(.96) rotate(1deg); opacity: 1; } 100% { transform: scale(1) rotate(0); } }
.cb-slam { animation: cbSlam .45s cubic-bezier(.2,1.4,.4,1); }
@keyframes cbTumble { 0% { transform: rotate(-200deg) scale(.15); opacity: 0; } 70% { transform: rotate(14deg) scale(1.15); opacity: 1; } 100% { transform: rotate(0) scale(1); } }
.cb-die { animation: cbTumble .55s cubic-bezier(.2,1.3,.4,1) both; }
.cb-btn:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); }
.cb-btn:active:not(:disabled) { transform: translateY(2px); box-shadow: none !important; }
@keyframes cbPulse { 0%,100% { box-shadow: 0 0 14px #E3B23C55; } 50% { box-shadow: 0 0 30px #E3B23CBB; } }
.cb-pulse { animation: cbPulse 1.6s infinite; }
@media (prefers-reduced-motion: reduce) { .cb-slam, .cb-pulse, .cb-die { animation: none; } }
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
  const [sel, setSel] = useState({});
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

  if (screen === "title") return <><Title onPlay={() => setScreen("select")} /><HelpFab /></>;
  if (screen === "select") return <><Select {...{ playerTeam, setPlayerTeam, aiTeam, setAiTeam, mode, setMode }} onNext={() => { const pool = CHITS.map((c) => c.tag); const ai = []; while (ai.length < 2) { const p = pool[Math.floor(Math.random() * pool.length)]; if (!ai.includes(p)) ai.push(p); } setAiStaked(ai); setScreen("stake"); }} /><HelpFab /></>;
  if (screen === "stake") return <><Stake {...{ staked, setStaked, aiTeam }} onStart={newGame} /><HelpFab /></>;
  if (screen === "final") return <><Final {...{ g, playerTeam, aiTeam }} onAgain={() => { setStaked([]); setScreen("select"); }} /><HelpFab /></>;

  const isPlayerOff = g.possession === playerTeam;
  const offT = T(g.possession), defT = T(g.other);
  const log = (m, t = "play") => g.log.unshift({ t, m });
  const hasChit = (team, tag) => g.chits[team].includes(tag);
  const markUsed = (team, tag) => { if (!g.usedChits.find((u) => u.team === team && u.tag === tag)) g.usedChits.push({ team, tag }); };
  const push = () => setG({ ...g });

  /* ---------- slots (slot field on every card) ---------- */
  const offSlots = (t) => ({
    BLOCKER: t.offense.filter((c) => c.slot === "BLK"),
    QB: t.offense.filter((c) => c.slot === "QB"),
    SKILL: t.offense.filter((c) => c.slot === "SKL" || c.slot === "QB"),
  });
  const defSlots = (t) => ({
    LINE: t.defense.filter((c) => c.slot === "LINE"),
    BACKER: t.defense.filter((c) => c.slot === "LB"),
    BACK: t.defense.filter((c) => c.slot === "DB"),
  });

  function offBonus(trio, play) {
    const [blk, qb, sk] = trio;
    let add = blk.diff + qb.diff + (sk === qb ? 0 : sk.diff);
    if (play.type === "run") add += (sk.ab.osrRun || 0) + (blk.ab.osrRun || 0);
    else add += (qb.ab.osrPass || 0) + (blk.ab.osrPass || 0) + (sk.ab.osrPass || 0);
    if (hasChit(g.possession, "keg") && blk.slot === "BLK" && !blk.pos.startsWith("FB")) { add += 10; markUsed(g.possession, "keg"); }
    if (hasChit(g.possession, "can") && (qb.pos === "QB1" || sk.pos === "QB1")) { add += 10; markUsed(g.possession, "can"); }
    if (hasChit(g.possession, "dozer") && play.type === "run" && sk.pos.startsWith("FB")) { add += 20; markUsed(g.possession, "dozer"); }
    return OFF_EDGE + Math.min(STACK_CAP, add);
  }
  function defBonus(trio, play, offTrio) {
    let add = trio.reduce((s, c) => s + c.diff, 0);
    trio.forEach((c) => { add += play.type === "run" ? (c.ab.dsrRun || 0) : (c.ab.dsrPass || 0); });
    offTrio.forEach((c) => { add -= c.ab.dsrPen || 0; });
    if (play.type === "pass") add -= offTrio[1].ab.deadEye || 0;
    if (hasChit(g.other, "trough")) { add += 10; markUsed(g.other, "trough"); }
    return Math.min(STACK_CAP, add);
  }

  /* ---------- AI ---------- */
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
    const qbs = [...s.QB].sort((a, b) => b.diff - a.diff);
    const qb = qbs[Math.random() < 0.78 ? 0 : Math.min(1, qbs.length - 1)];
    let sk, play;
    if (run) {
      sk = t.offense.find((c) => c.pos === "RB1") || s.SKILL.find((c) => c.slot === "SKL");
      play = { type: "run" };
    } else {
      const depth = Math.random() < t.tendency.deep ? (Math.random() < 0.5 ? 2 : 1) : 0;
      const recvs = s.SKILL.filter((c) => c !== qb && c.pct);
      const top = [...recvs].sort((a, b) => b.pct[depth] - a.pct[depth]);
      sk = top[Math.floor(Math.random() * Math.min(3, top.length))] || recvs[0];
      play = { type: "pass", depth, target: sk };
    }
    const blk = [...s.BLOCKER].sort((a, b) => (b.diff + (play.type === "run" ? (b.ab.osrRun || 0) : (b.ab.osrPass || 0))) - (a.diff + (play.type === "run" ? (a.ab.osrRun || 0) : (a.ab.osrPass || 0))))[0];
    return { trio: [blk, qb, sk], play };
  }

  /* ---------- resolve ---------- */
  function resolveSnap(offTrio, play, defTrio) {
    g.stats.plays++;
    if (isPlayerOff) { play.type === "run" ? g.playerRuns++ : g.playerPasses++; }
    const oB = offBonus(offTrio, play), dB = defBonus(defTrio, play, offTrio);
    const c = contest(oB, dB);
    g.reveal = { offTrio, defTrio, play, rolls: c, oB, dB, dice: [{ k: "OSD", v: c.ro, sub: `+${oB}` }, { k: "DSD", v: c.rd, sub: `+${dB}` }] };
    const [blk, qb, sk] = offTrio;
    const primaryDef = play.type === "run" ? defTrio[0] : defTrio[2];

    if (c.win) {
      if (play.type === "run") {
        const rod = d(8);
        g.reveal.dice.push({ k: "ROD", v: rod });
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
        g.reveal.dice.push({ k: "POD", v: pod });
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
        g.reveal.dice.push({ k: "CATCH", v: cr, sub: `vs ${compl}%` });
        if (cr > compl) { log(`${qb.name} → ${sk.name} (${["10m", "20m", "20+m"][play.depth]}): ${cr} vs ${compl}% — INCOMPLETE. The ball had other plans.`, "play"); advanceDown(0); return; }
        let gain = play.depth === 0 ? shortGain() : play.depth === 1 ? longGain() : longGain() + 10;
        const bonus = pod === 5 ? " STIFF-ARM!" : pod === 7 ? " SPECTACULAR CATCH!" : pod === 8 ? " HURDLE!" : "";
        log(`${qb.name} → ${sk.name}: ${cr} vs ${compl}% — CAUGHT, +${gain}m!${bonus}`, "good");
        if (hasChit(g.possession, "jets") && sk.pos === "WR1") { gain += 10; markUsed(g.possession, "jets"); log("JETS! +10 bonus meters. He left a vapor trail.", "good"); }
        startChase(sk, gain);
      }
    } else {
      const dd = d(6);
      g.reveal.dice.push({ k: "DOD", v: dd });
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
    if (g.chase) finishChase(g.spot + g.chase.gain >= FIELD);
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
    if (!g.chase) return;
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
      if (g.qtr === 5) {
        if (g.score[playerTeam] !== g.score[aiTeam]) { setScreen("final"); return; }
        g.ot = true; log("— TIED! OVERTIME. There must be a winner. That is the law. —", "sys");
        g.spot = 75; g.line = 75; g.down = 1; g.reveal = null; startSnapPhase(); return;
      }
      log(`— END OF QUARTER ${g.qtr - 1} —`, "sys");
    }
    g.down = 1; g.reveal = null;
    const r = g.driveReason;
    if (r === "punt" && g.driveOpts && g.driveOpts.puntTo) { const sp = Math.max(5, Math.min(90, FIELD - g.driveOpts.puntTo)); g.spot = sp; g.line = sp; log(`${T(g.possession).city} fields the punt at ${sp}m.`, "sys"); startSnapPhase(); return; }
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
    if (isPO) { g.aiCommit = aiPickDef(); g.phase = "commitOff"; }
    else {
      if (g.down === 4) {
        const dist = FIELD - g.spot;
        if (dist <= 35 && !heroBlocks() && Math.random() < 0.65) { tryFG(); return; }
        if (dist > 55 && Math.random() < 0.7) { tryPunt(); return; }
      }
      g.aiCommit = aiPickOff(); g.phase = "commitDef";
    }
  }

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
      if (isPlayerOff && g.down === 4) g.phase = "fourth";
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(180deg,#0C1810,#070D09)", border: "2px solid #C89019", borderRadius: 14, padding: "8px 16px", boxShadow: "inset 0 0 24px #000, 0 4px 18px #0009" }}>
        <ScoreCell t={pT} s={g.score[playerTeam]} poss={g.possession === playerTeam} label="YOU" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "Impact, sans-serif", fontSize: 14, letterSpacing: 3, color: "#FFD86B" }}>{g.ot ? "☠ OVERTIME ☠" : `QUARTER ${g.qtr}`}</div>
          <div style={{ fontFamily: "Courier New, monospace", fontSize: 10, color: "#8FA08F" }}>DRIVE {g.driveNum}/{drivesPerQtr} · DOWN {g.down} · {Math.max(0, TO_GAIN - (g.spot - g.line))} TO GO</div>
          {(lastHalf() || lastGame()) && !g.ot && <div style={{ fontSize: 9, color: "#FFD86B", fontFamily: "Courier New, monospace" }} className="cb-pulse">★ CLUTCH DRIVE — BONUS SCORING ★</div>}
        </div>
        <ScoreCell t={aT} s={g.score[aiTeam]} poss={g.possession === aiTeam} right label="THE MACHINE" />
      </div>

      <FieldBar spot={g.spot} line={g.line} possession={g.possession} teams={[playerTeam, aiTeam]} />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 560px", minWidth: 340 }}>
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
                    <div style={{ fontSize: 9, color: "#8FA08F", fontFamily: "Courier New, monospace" }}>total</div>
                    <div style={{ fontFamily: "Impact, sans-serif", fontSize: 18, color: "#FFD86B", margin: "2px 0" }}>⚔</div>
                    <div style={{ fontFamily: "Impact, sans-serif", fontSize: 30, color: !g.reveal.rolls.win ? "#9BD53C" : "#FF8A70", textShadow: "0 2px 0 #000" }}>{g.reveal.rolls.d}</div>
                    <div style={{ fontSize: 9, color: "#8FA08F", fontFamily: "Courier New, monospace" }}>total</div>
                  </div>
                  {g.reveal.defTrio.map((c, i) => <ArenaCard key={"d" + i} card={c} teamId={g.possession === playerTeam ? aiTeam : playerTeam} size={0.85} slam roleTag={["LINE", "LB", "DB"][i]} chosen={!g.reveal.rolls.win} />)}
                </div>
                <DiceTray dice={g.reveal.dice} />
              </div>
            ) : g.phase === "commitOff" || g.phase === "commitDef" ? (
              <div>
                <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", letterSpacing: 2, fontSize: 13, color: "#FFD86B", marginBottom: 8 }}>
                  {g.phase === "commitOff" ? "BUILD YOUR ATTACK — PICK 3 CARDS" : "BUILD YOUR WALL — PICK 3 CARDS"}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
                  {[0, 1, 2].map((i) => <ArenaCard key={i} faceDown teamId={g.phase === "commitOff" ? g.other : g.possession} card={null} size={0.55} />)}
                </div>
                <div style={{ textAlign: "center", fontSize: 10, color: "#8FA08F", fontFamily: "Courier New, monospace", marginBottom: 10 }}>
                  {g.phase === "commitOff" ? `${defT.city} has committed its 3 defenders… face down. Rude.` : `${offT.city} has committed its attack… face down. Typical.`}
                </div>
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

          <div style={{ marginTop: 10, background: "#0E1A13", border: "1px solid #2C5A44", borderRadius: 14, padding: 12, textAlign: "center" }}>
            {g.phase === "spin" && <Btn big gold onClick={act(spinWheel)}>{"🎡"} SPIN THE METER WHEEL</Btn>}
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
                  <Btn gold onClick={act(() => { chaseStep(); })}>{"🔥"} PUSH UPFIELD</Btn>
                  <Btn onClick={act(() => finishChase(false))}>{"🛡"} GO DOWN SAFE</Btn>
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

        <div style={{ flex: "1 1 280px", minWidth: 260 }}>
          <div style={{ background: "#0A120D", border: "1px solid #2C5A44", borderRadius: 14, padding: 12, height: 520, display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Impact, sans-serif", letterSpacing: 2, fontSize: 13, color: "#FFD86B", marginBottom: 8 }}>{"📡"} 2151 BROADCAST</div>
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
      <HelpFab />
    </div>
  );

  function ScoreCell({ t, s, poss, right, label }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: right ? "row-reverse" : "row" }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: `linear-gradient(160deg, ${t.color}, ${t.dark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff", border: `2px solid ${t.color2}`, boxShadow: poss ? `0 0 14px ${t.color}` : "none" }}>{t.glyph}</div>
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
        <div style={{ position: "absolute", left: `calc(${pct}% - 9px)`, top: 3, width: 18, height: 22, background: `linear-gradient(160deg, ${offT.color}, ${offT.dark})`, border: "2px solid #FFD86B", borderRadius: 4, transition: "left .5s ease", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{"🏈"}</div>
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
      <div style={{ fontSize: 54 }}>{"🏈"}</div>
      <div style={{ fontFamily: "Courier New, monospace", color: "#8FA08F", letterSpacing: 4, fontSize: 12, marginTop: 8 }}>THE POLYMATIC FOOTBALL LEAGUE · SEASON 27 · 2151</div>
      <h1 style={{ fontFamily: "Impact, sans-serif", fontSize: "clamp(42px, 9vw, 92px)", margin: "10px 0 0", color: "#FFD86B", letterSpacing: 3, textShadow: "0 6px 0 #3A2E0E, 0 12px 24px #000" }}>CUSTOMER BUTTCHEEKS</h1>
      <div style={{ fontFamily: "Impact, sans-serif", fontSize: 24, color: "#9BB53C", letterSpacing: 6, marginTop: 4 }}>GRIDIRON CARD BATTLE — ARENA EDITION</div>
      <p style={{ maxWidth: 540, color: "#B9C4B4", fontSize: 13, lineHeight: 1.7, marginTop: 16 }}>
        Commit <b style={{ color: "#FFD86B" }}>three cards</b> in secret. Your opponent does the same.
        SNAP — and everything is revealed. Full rosters from the league books, with the
        <b style={{ color: "#3DDC84" }}> green-lit SUPERSTARS</b> leading every franchise.
        Tap the <b style={{ color: "#FFD86B" }}>?</b> any time to learn the ropes.
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
          const stars = t.offense.concat(t.defense).filter((c) => c.elite);
          return (
            <div key={id} onClick={() => { if (isP) { setPlayerTeam(null); return; } if (isA) { setAiTeam(null); return; } if (!playerTeam) setPlayerTeam(id); else if (!aiTeam && id !== playerTeam) setAiTeam(id); }}
              style={{ width: 240, cursor: "pointer", borderRadius: 14, overflow: "hidden", border: `3px solid ${isP ? "#FFD86B" : isA ? "#D6482F" : t.color2}`, background: `linear-gradient(170deg, ${t.dark}, #0A0F0B)`, transform: isP || isA ? "translateY(-5px)" : "none", transition: "all .2s", boxShadow: isP ? "0 0 22px #FFD86B66" : isA ? "0 0 22px #D6482F66" : "0 6px 14px #0007" }}>
              <div style={{ background: `linear-gradient(90deg, ${t.color}, ${t.dark})`, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "Impact, sans-serif", fontSize: 16, color: "#fff", letterSpacing: 1 }}>{t.city.toUpperCase()}</span>
                <span style={{ fontSize: 22, color: "#fff" }}>{t.glyph}</span>
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontFamily: "Impact, sans-serif", fontSize: 18, color: t.color2 }}>{t.name}</div>
                <div style={{ fontSize: 9, color: "#8FA08F", fontFamily: "Courier New, monospace", margin: "4px 0 8px" }}>{t.conf} · {t.offense.length + t.defense.length} CARDS</div>
                <div style={{ fontSize: 11, color: "#B9C4B4", lineHeight: 1.5, minHeight: 34 }}>{t.identity}</div>
                <div style={{ marginTop: 8, fontSize: 9.5, color: "#3DDC84", lineHeight: 1.5 }}>
                  ⭐ {stars.slice(0, 3).map((c) => c.name).join(" · ")}{stars.length > 3 ? ` +${stars.length - 3} more` : ""}
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

      {/* ======== THE REST OF THE LEAGUE — COMING SOON ======== */}
      <div style={{ marginTop: 34, textAlign: "center" }}>
        <div style={{ fontFamily: "Impact, sans-serif", fontSize: 18, letterSpacing: 3, color: "#8FA08F" }}>THE REST OF THE LEAGUE</div>
        <div style={{ fontSize: 10, color: "#5E7263", fontFamily: "Courier New, monospace", marginBottom: 14 }}>20 franchises in the tunnel · superstars already under contract · logos pre-wired for the PC build</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", maxWidth: 1080, margin: "0 auto" }}>
          {COMING_SOON.map((t) => (
            <div key={t.city} title={`${t.city} ${t.name} — coming soon`} style={{
              width: 158, borderRadius: 12, overflow: "hidden", position: "relative",
              border: "2px solid #3A4A3E", background: "linear-gradient(170deg, #131B14, #0A0F0B)",
              filter: "saturate(.45)", cursor: "not-allowed",
            }}>
              <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "center", background: `radial-gradient(circle at 50% 40%, ${t.color}44, #0A0F0B 78%)`, borderBottom: `2px solid ${t.color}55` }}>
                {t.logoImg ? <img src={t.logo} alt={t.city} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: 32, filter: "drop-shadow(0 3px 3px #000)" }}>{t.glyph}</span>}
              </div>
              <div style={{ padding: "7px 8px 26px" }}>
                <div style={{ fontFamily: "Impact, sans-serif", fontSize: 12.5, letterSpacing: 1, color: "#C9CFC4" }}>{t.city.toUpperCase()}</div>
                <div style={{ fontSize: 9, color: t.color, fontWeight: "bold", lineHeight: 1.25, minHeight: 22 }}>{t.name}</div>
                <div style={{ fontSize: 7.5, color: "#5E7263", fontFamily: "Courier New, monospace", marginTop: 2 }}>{t.conf}</div>
                {t.stars && t.stars.length > 0 && (
                  <div style={{ fontSize: 7.5, color: "#3DDC84", lineHeight: 1.4, marginTop: 3 }}>⭐ {t.stars.slice(0, 2).join(" · ")}{t.stars.length > 2 ? ` +${t.stars.length - 2}` : ""}</div>
                )}
              </div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "repeating-linear-gradient(45deg,#C89019,#C89019 10px,#A46F0C 10px,#A46F0C 20px)", padding: "3px 0", textAlign: "center" }}>
                <span style={{ fontFamily: "Impact, sans-serif", fontSize: 10, letterSpacing: 2, color: "#241A02", textShadow: "0 1px 0 #F5D06A" }}>{"🔒"} COMING SOON!</span>
              </div>
            </div>
          ))}
        </div>
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
      <div style={{ textAlign: "center", marginTop: 22 }}><Btn big gold onClick={onStart}>{"🎡"} KICKOFF ➤</Btn></div>
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
      <div style={{ fontFamily: "Impact, sans-serif", fontSize: "clamp(36px,8vw,76px)", color: "#FFD86B", margin: "8px 0", textShadow: "0 4px 0 #3A2E0E" }}>
        {TEAMS[playerTeam].city.toUpperCase()} {pS} — {aS} {TEAMS[aiTeam].city.toUpperCase()}
      </div>
      <div style={{ fontFamily: "Impact, sans-serif", fontSize: 26, color: won ? "#9BD53C" : "#FF8A70", letterSpacing: 2 }}>
        {won ? "VICTORY! ISN'T THAT LOVERLY?" : "DEFEAT. THE STAFF MEAL AWAITS. (It's beans.)"}
      </div>
      <div style={{ marginTop: 14, fontFamily: "Courier New, monospace", fontSize: 12, color: "#B9C4B4" }}>Plays: {g.stats.plays} · TDs: {g.stats.tds} · Turnovers: {g.stats.tos}</div>
      {pot.length > 0 && (
        <div style={{ marginTop: 14, padding: 14, border: "2px solid #C89019", borderRadius: 12, maxWidth: 440, background: "#141B0C" }}>
          <div style={{ fontFamily: "Impact, sans-serif", color: "#FFD86B", letterSpacing: 2, fontSize: 14 }}>{"💰"} THE POT GOES TO {TEAMS[winner].city.toUpperCase()} — CHA-CHING!</div>
          <div style={{ fontSize: 11, color: "#B9C4B4", marginTop: 6 }}>{pot.map((t) => CHITS.find((c) => c.tag === t)?.name).filter(Boolean).join(" · ") || "—"}</div>
        </div>
      )}
      <div style={{ marginTop: 22 }}><Btn big gold onClick={onAgain}>RUN IT BACK ➤</Btn></div>
    </div>
  );
}
