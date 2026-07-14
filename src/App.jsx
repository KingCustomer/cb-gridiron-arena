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
const OFF_EDGE = 10, TAKEAWAY_MARGIN = 25, PURSUIT = 6, FIELD = 110, TO_GAIN = 10, STACK_CAP = 60; // v3.1: cap raised 40->60 (6,000-game sim: lets superstar differentials breathe; Haves now favored 55-75%, all matchups upsettable)
const OPEN_RECEIVER = 5, BURN_MARGIN = 25; // v3.1 sim tuning: +5 to completions; snap won by 25+ = coverage BURNED, auto-catch

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
  "Sample Wong": "Employee #00001. The Lake calls it; the sky delivers it. (Project Wiselake sends its regards.)",
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
  "Elliot Eagan": "Makes the catch, then audits the coverage.",
  "Limsong": "Sings cadence. Opponents wish he'd lip-sync.",
  "Pu Hoontrakul": "A pass rush with vowels and consequences.",
  "Sumatra Lamsam": "DE2 only because bureaucracy fears poetry.",
  "Anubis Re": "Judges your soul, then lowers his shoulder.",
  "Hannibal Babafemi": "Crossed the line, then moved it backward.",
  "Ibrahim Imhotep": "Ancient architecture, modern pocket collapse.",
  "Emerson Tynes": "Occupies two gaps and one philosophical crisis.",
  "Everett Gold": "Has a motor, a mortgage, and no chill.",
  "Keith Stump": "Short range, long memory.",
  "Rodney Page": "Turns the corner like he wrote it.",
  "Rory Orr": "Pass rush by name, recurring symptom by nature.",
  "Ingmar Stork": "Delivers bad news in the secondary.",
  "S.Freddy Frawley": "Pulls so fast the defense files a missing-person report.",
  "S.Jarold Klim": "Finds the ball with the weary certainty of a landlord.",
  "S.Solomon Moss": "Makes catches that feel legally inadmissible.",
  "S.Vladimir Markov": "When he pass-blocks, time becomes a managed service.",
  "DeAngelo Bell": "Arrives before the pass. Raises rent when he gets there.",
  "Maria Dos Santos": "Covers receivers so closely they start sharing memories.",
  "Ozcoc Tupac": "Plays linebacker like the empire still has receipts.",
  "Smoke Monkey": "You saw him? That was his decoy.",
  "Ralph Poole": "Left tackle. Right answer.",
  "Robert T. Bruce": "Snaps with honor. Blocks with historical resentment.",
  "S.Gerson Rice": "Every route has footnotes. All of them say 'open.'",
  "Stanley Quim": "A guard in the classical sense: immovable, irritated, underpaid.",
  "Sunil Lazenby": "Blocks like a gentleman. Hits like the apology got lost.",
  "Blackburn Fitzpatrick": "Throws lasers, apologizes to none of the furniture.",
  "E.G. Shapiro": "QB2 on paper. Plaintiff in every comeback.",
  "Julek Wroclaw": "A nose tackle with pierogi gravity.",
  "Keyshawn Mingo": "Always open, especially when covered.",
  "Mukesh Singh": "Reads the run, the pass, and your weak excuses.",
  "El Oso": "Spanish for bear. Football for problem.",
  "Hidalgo Villa": "QB2, revolution pending.",
  "Luz Fuentes": "Sees the ball first. Lets the receiver know eventually.",
  "Pancho Sepulveda": "Runs like someone stole his cape.",
  "Quinterrius Durie": "Protects the blind side and several family secrets.",
  "Guard 756": "Not a name. More of a warning label.",
  "R.Raul Martinez- Wang": "Hyphenated name. Unhyphenated violence.",
  "Ekaterina Romanov": "Threads needles like the monarchy depends on it.",
  "Lev Ivanov": "Blocks, releases, and makes linebackers reconsider night school.",
  "Semyon Prostakov": "Never blitzes. Still appears in your backfield.",
  "Vadim Nikolaev": "Blocks like winter has a deadline.",
  "Vasily Molotov": "Coverage so sticky it comes with a warning label.",
  "Ashok Ghandi": "Runs through contact, peacefully in theory.",
  "Babu Kohli": "CB2 with CB1 self-esteem.",
  "Srinivasa Bose": "Does the math mid-play. Still rounds up to touchdown.",
  "Gustav Schmitz": "Right guard. Wrong person to annoy.",
  "Isaac Shurmur": "Snaps quietly, ruins loudly.",
  "Jörn Fuchs": "The umlaut does half the blocking.",
  "Peters Huber": "Island corner. No ferry service.",
  "Shuji Kimura": "Runs through creases accountants would miss.",
  "Cerberus": "Three heads. One blocking assignment. Somehow a committee.",
  "Mr. Rose": "Smells sweet until the safety wakes up sideways.",
  "Mr. Zeus": "Brings thunder, lightning, and a very specific HR complaint.",
  "Tall Fellow": "Scouting report: tall. Counterpoint: extremely tall.",
  "The Larch": "A tree with a depth chart.",
  "Eleanor Motch": "Protects the edge and several nearby neighborhoods.",
  "Lucien LaFlamme": "Burns routes down so receivers can start over.",
  "Omar Mung": "Fullback body. Running back feet. Insurance adjuster smile.",
  "Remy LeFleur": "Pancakes politely. Canada notices.",
  "Charlemagne Arceneaux-Wang": "Conquered twelve meters and one human resources department.",
  "Napolean Bonaparte": "Short king. Long drives. Bad history with winter games.",
  "Yves Dauphin": "Royal nose tackle. Peasant work ethic.",
  "Carlo Bianco": "Blitzes with the elegance of a thrown piano.",
  "Lawson Taylorous": "Runs the defense like it owes him rent.",
  "Maximiliano Sforza": "A Renaissance man, assuming the Renaissance had roughing calls.",
  "Ottavio Izzo": "The second linebacker, because apparently one problem wasn't enough.",
  "Primo Ventura": "Centers the ball and, briefly, society.",
  "Dang-Quang Phan": "A tight end with airport-security hands.",
  "Jimmy Lo": "Keeps it low. Except the interception totals, sadly.",
  "Van-Lang Vo": "Nose tackle. Cultural landmark. Very poor detour.",
  "Conrad Atwater": "Safety by position. Public hazard by practice.",
  "Mick Christmas": "Comes once a year. The sack count says otherwise.",
  "Rocky Cosby": "The offense is calm because he has made panic illegal.",
  "Ronin Nixon": "A tight end wandering alone through your zone coverage.",
  "S.Randy Rice": "The S stands for 'somehow,' as in somehow open again.",
  "Early Boolgoo": "Arrives early, leaves cleat marks.",
  "Hieronymous Baldwin": "WR3, patron saint of busted coverage.",
  "Jack-Jack Jadira": "Double the name. Half the quarterback.",
  "Neville Namatjira": "Backup quarterback, starting-level optimism.",
  "Otis McMath": "Calculates pursuit angles with his forehead.",
  "Bostwick Bykov": "Runs downhill like gravity signed a sponsorship deal.",
  "Gorky Gusev": "Centers the line and lowers the room temperature.",
  "Ibroxhim Csonka": "Fullback: the last honest job in a dishonest sport.",
  "Mansur Morris": "Designed to scramble. Emotionally, also yes.",
  "Sultan Orozov": "Rules the deep middle by decree and mild contempt.",
  "Daisuke Koizumi": "Open by profession. Dramatic by hobby.",
  "Hanzo Takahashi": "The pass rush appears, bows, and ruins dinner.",
  "Kenji Raiden": "Thunder in the middle. Weather delay optional.",
  "Masafumi Hana": "Blooms late. Lands early.",
  "Ryuzo Nishioka": "Tackles with the warm bedside manner of a tax audit.",
  "Bola Nkemediche": "Keeps the pocket clean by making everyone else leave.",
  "Fausto Amaral": "Catches everything except accountability.",
  "Medard Meir": "Sets the edge, then questions why there was ever an edge.",
  "Tommy Nakamura": "TE2, which in this league means 'surprise felony receiver.'",
  "Wing-Fu Chin": "A tight end with soft hands and litigation energy.",
  "Bill Taft": "A presidential body type with cabinet-level disruption.",
  "Chuck Maplethorpe": "The center of gravity and several bad conversations.",
  "Geronimo Goyathlay": "Comes downhill like history has unfinished business.",
  "Teddy Roosevelt": "Speaks softly. Carries twelve audibles and a grudge.",
};
const FLAVOR_POOL = {
  QB: ["Throws darts. Occasionally at teammates.", "Reads defenses like a menu.", "Audibles in cursive.", "The pocket is a state of mind. He is the landlord."],
  RB: ["Legs powered by pure spite.", "Contact is a suggestion.", "Runs angry. Files the paperwork later.", "The stiff-arm has its own agent."],
  WR: ["One foot down is ALL feet down.", "Catches things. Feelings, mostly.", "Separation is a lifestyle.", "Drops? Never been introduced."],
  TE: ["A wall that runs routes.", "Blocks, catches, apologizes for neither.", "Half tackle, half poem.", "Seam routes and steamrolls, in that order."],
  FB: ["The tip of the spear. Also the spear.", "His hobbies include: forward.", "Job description: doorway remover.", "Leads the way. The way apologizes."],
  OL: ["The pancake breakfast is self-serve.", "Paid by the bruise.", "Holding is such a strong word.", "Moves people for a living. No boxes required."],
  D: ["Files tackles under 'correspondence.'", "The end zone is a members-only club. He checks IDs.", "Runs a toll booth at the line of scrimmage.", "Interceptions are just aggressive borrowing.", "Tackling is a love language.", "Personal space enforcement, meters 0 through 110."],
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
    color: "#30D12B", color2: "#8E7CC3", dark: "#0F2A0D", glyph: "◈", logo: "/logos/ESTES.jpg", logoImg: false,
    ovr: 92, identity: "Clone-perfect precision. Elite twins at QB.",
    tendency: { run: 0.45, deep: 0.4 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Cassandra Jemineye", kind: "F", diff: 30, pct: [91, 72, 60], ab: { deadEye: 10 }, elite: true },
      { pos: "QB2", slot: "QB", name: "Helga Jemineye", kind: "F", diff: 27, pct: [88, 70, 58], ab: { osrRun: 8 }, elite: true },
      { pos: "RB1", slot: "SKL", name: "S.Finley Allen", kind: "SIM", diff: 15, pct: [48, 40, 18], ab: {  } },
      { pos: "WR1", slot: "SKL", name: "S.Solomon Moss", kind: "SIM", diff: 20, pct: [88, 77, 66], ab: { osrPass: 9 }, elite: true },
      { pos: "WR2", slot: "SKL", name: "Xi Zhou Liu", kind: "M", diff: 9, pct: [76, 80, 74], ab: { dsrPen: 6 } },
      { pos: "WR3", slot: "SKL", name: "Grisham Locke", kind: "M", diff: 11, pct: [83, 74, 53], ab: {  } },
      { pos: "WR4", slot: "SKL", name: "S.Avery Broom", kind: "SIM", diff: 14, pct: [85, 62, 60], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "S.Ingmar Shockey", kind: "SIM", diff: 18, pct: [63, 70, 80], ab: { dsrPen: 4 } },
      { pos: "TE2", slot: "SKL", name: "Cenk Suleiman", kind: "M", diff: 18, pct: [67, 72, 75], ab: { dsrPen: 3 } },
      { pos: "FB1", slot: "BLK", name: "Green Grange", kind: "M", diff: 8, pct: [22, 18, 15], ab: { osrRun: 3 } },
      { pos: "LT", slot: "BLK", name: "S.Vladimir Markov", kind: "SIM", diff: 24, pct: null, ab: { osrPass: 10 }, elite: true },
      { pos: "LG", slot: "BLK", name: "S.Freddy Frawley", kind: "SIM", diff: 22, pct: null, ab: { osrRun: 8 }, elite: true },
      { pos: "C", slot: "BLK", name: "S.Roy Canasta", kind: "SIM", diff: 17, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Jimmy Stanback", kind: "M", diff: 8, pct: null, ab: { osrPass: 6 } },
      { pos: "RT", slot: "BLK", name: "S.Ronald Crump", kind: "SIM", diff: 18, pct: null, ab: { osrPass: 6 } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Lawrence Awl", kind: "M", diff: 27, ab: { sackB: 8 }, elite: true },
      { pos: "DE2", slot: "LINE", name: "Björn Mikkelson", kind: "M", diff: 8, ab: { sackB: 4 } },
      { pos: "NT1", slot: "LINE", name: "S.Albin Nowak", kind: "SIM", diff: 8, ab: { dsrRun: 4 } },
      { pos: "NT2", slot: "LINE", name: "Clennell Washington", kind: "M", diff: 12, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Terrence Fillian", kind: "M", diff: 16, ab: { dsrRun: 3 } },
      { pos: "ILB2", slot: "LB", name: "S.Jarold Klim", kind: "SIM", diff: 22, ab: { dsrRun: 6 }, elite: true },
      { pos: "OLB1", slot: "LB", name: "S.Mitchell Towers", kind: "SIM", diff: 17, ab: { sackB: 4 } },
      { pos: "OLB2", slot: "LB", name: "S.Wendell Knort", kind: "SIM", diff: 15, ab: {  } },
      { pos: "CB1", slot: "DB", name: "S.Wes Allen", kind: "SIM", diff: 15, ab: { dsrPass: 3 } },
      { pos: "CB2", slot: "DB", name: "S. Eric Hopkins", kind: "SIM", diff: 16, ab: {  } },
      { pos: "CB3", slot: "DB", name: "S.Nolan Boykin", kind: "SIM", diff: 13, ab: { osrPass: 6 } },
      { pos: "CB4", slot: "DB", name: "S.Jaylen Maragos", kind: "SIM", diff: 11, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Ingmar Stork", kind: "M", diff: 24, ab: { intB: 6 }, elite: true },
      { pos: "SS2", slot: "DB", name: "S.Vaughn Wyatt", kind: "SIM", diff: 9, ab: { dsrRun: 3 } },
      { pos: "FS1", slot: "DB", name: "S.Merton Reedis", kind: "SIM", diff: 6, ab: { dsrPass: 3 } },
    ],
  },
  london: {
    id: "london", city: "London", name: "Amplified Gentry", conf: "THE HAVES · Nova",
    color: "#1F3A93", color2: "#E3B23C", dark: "#0E1B3A", glyph: "🎩", logo: "/logos/LONDON.jpg", logoImg: false,
    ovr: 87, identity: "Old money, new arms. Saxby hunts one last title.",
    tendency: { run: 0.5, deep: 0.5 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Saxby Lawless", kind: "M", diff: 26, pct: [84, 80, 73], ab: { osrPass: 4 }, elite: true },
      { pos: "QB2", slot: "QB", name: "Orkis Fung-Yick", kind: "M", diff: 20, pct: [92, 34, 15], ab: { osrRun: 10 } },
      { pos: "RB1", slot: "SKL", name: "Boris Talc", kind: "M", diff: 10, pct: [30, 60, 73], ab: { osr11: 6 } },
      { pos: "WR1", slot: "SKL", name: "S.Gerson Rice", kind: "SIM", diff: 22, pct: [90, 80, 76], ab: { osrPass: 9 }, elite: true },
      { pos: "WR2", slot: "SKL", name: "Gwendolin Jones", kind: "F", diff: 11, pct: [40, 62, 75], ab: { osr11: 6 } },
      { pos: "TE1", slot: "SKL", name: "Sunil Lazenby", kind: "M", diff: 24, pct: [50, 69, 83], ab: { dsrPen: 4 }, elite: true },
      { pos: "TE2", slot: "SKL", name: "S.Ditka Winslow", kind: "SIM", diff: 8, pct: [60, 68, 77], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "George Causeway", kind: "M", diff: 10, pct: [25, 14, 11], ab: { osrRun: 3 } },
      { pos: "LT", slot: "BLK", name: "Ralph Poole", kind: "M", diff: 22, pct: null, ab: { osrPass: 10 }, elite: true },
      { pos: "LG", slot: "BLK", name: "Stanley Quim", kind: "M", diff: 22, pct: null, ab: { osrRun: 6 }, elite: true },
      { pos: "C", slot: "BLK", name: "Robert T. Bruce", kind: "M", diff: 23, pct: null, ab: { osrRun: 8 }, elite: true },
      { pos: "RG", slot: "BLK", name: "Duke York", kind: "M", diff: 10, pct: null, ab: { osrPass: 6 } },
      { pos: "RT", slot: "BLK", name: "Earl Hastings", kind: "M", diff: 15, pct: null, ab: { osrPass: 6 } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Hercule Breadsalt", kind: "M", diff: 25, ab: { sackB: 8 }, elite: true },
      { pos: "DE2", slot: "LINE", name: "Leopold Haystacks", kind: "M", diff: 23, ab: { sackB: 6 }, elite: true },
      { pos: "NT1", slot: "LINE", name: "Tremendous Ben", kind: "M", diff: 24, ab: { dsrRun: 8 }, elite: true },
      { pos: "NT2", slot: "LINE", name: "Arjun Srinigar", kind: "M", diff: 15, ab: { dsrRun: 4 } },
      { pos: "ILB1", slot: "LB", name: "Nigel Pickwick", kind: "M", diff: 13, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "Chester Fields", kind: "M", diff: 17, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Bill Burns", kind: "M", diff: 17, ab: { sackB: 4 } },
      { pos: "OLB2", slot: "LB", name: "Ernest Mobley", kind: "M", diff: 9, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Lorenzo Talib", kind: "M", diff: 8, ab: { osrPass: 6 } },
      { pos: "CB2", slot: "DB", name: "Chris Roby", kind: "M", diff: 9, ab: { osrPass: 6 } },
      { pos: "CB3", slot: "DB", name: "Josh Webster", kind: "M", diff: 7, ab: { osrPass: 6 } },
      { pos: "CB4", slot: "DB", name: "Shiloh Ward", kind: "M", diff: 12, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Jason Braxton", kind: "M", diff: 13, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Timothy Bentley", kind: "M", diff: 22, ab: { intB: 8 }, elite: true },
    ],
  },
  miami: {
    id: "miami", city: "Miami", name: "United Workers Party", conf: "THE HAVE NOTS · Plebian",
    color: "#B3202C", color2: "#E3B23C", dark: "#33090D", glyph: "☭", logo: "/logos/MIAMI.jpg", logoImg: false,
    ovr: 90, identity: "Seize the meters of production.",
    tendency: { run: 0.4, deep: 0.25 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Sample Wong", kind: "M", diff: 33, pct: [44, 66, 82], ab: { skyDrop: true }, elite: true },
      { pos: "QB2", slot: "QB", name: "R.Lenin IV", kind: "BOT", diff: 17, pct: [70, 35, 22], ab: { quick: true } },
      { pos: "RB1", slot: "SKL", name: "R.Vittorio Bevelacqua", kind: "BOT", diff: 13, pct: [11, 20, 45], ab: { osr11: 5 } },
      { pos: "WR1", slot: "SKL", name: "WR 919", kind: "BOT", diff: 10, pct: [22, 54, 70], ab: { osrPass: 7 } },
      { pos: "WR2", slot: "SKL", name: "WR 884", kind: "BOT", diff: 7, pct: [28, 40, 60], ab: { dsrPen: 3 } },
      { pos: "WR3", slot: "SKL", name: "WR 327", kind: "BOT", diff: 12, pct: [56, 52, 30], ab: { dsrPen: 3 } },
      { pos: "TE1", slot: "SKL", name: "TE 427", kind: "BOT", diff: 8, pct: [18, 50, 60], ab: { dsrPen: 3 } },
      { pos: "TE2", slot: "SKL", name: "R.Vincent Hoxha", kind: "BOT", diff: 14, pct: [53, 55, 66], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "R.Pavel Tong", kind: "BOT", diff: 18, pct: [17, 17, 6], ab: { osrRun: 3 } },
      { pos: "LT", slot: "BLK", name: "Tackle 909", kind: "BOT", diff: 23, pct: null, ab: { osrPass: 8 }, elite: true },
      { pos: "LG", slot: "BLK", name: "Guard 756", kind: "BOT", diff: 22, pct: null, ab: { osrRun: 8 }, elite: true },
      { pos: "C", slot: "BLK", name: "Center 434", kind: "BOT", diff: 22, pct: null, ab: { osrRun: 6 }, elite: true },
      { pos: "RG", slot: "BLK", name: "Guard 732", kind: "BOT", diff: 16, pct: null, ab: { osrPass: 6 } },
      { pos: "RT", slot: "BLK", name: "Tackle 287", kind: "BOT", diff: 13, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "End 997", kind: "BOT", diff: 11, ab: { sackB: 4 } },
      { pos: "DE2", slot: "LINE", name: "R.Clark Stumpf", kind: "BOT", diff: 15, ab: { sackB: 4 } },
      { pos: "NT1", slot: "LINE", name: "Nose Tackle 290", kind: "BOT", diff: 16, ab: { dsrRun: 4 } },
      { pos: "NT2", slot: "LINE", name: "Nose Tackle 087", kind: "BOT", diff: 10, ab: { dsrRun: 4 } },
      { pos: "ILB1", slot: "LB", name: "LB 653", kind: "BOT", diff: 7, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "LB 770", kind: "BOT", diff: 11, ab: { dsrRun: 3 } },
      { pos: "OLB1", slot: "LB", name: "R.Enver Castro", kind: "BOT", diff: 10, ab: { sackB: 4 } },
      { pos: "OLB2", slot: "LB", name: "LB 448", kind: "BOT", diff: 16, ab: { sackB: 4 } },
      { pos: "CB1", slot: "DB", name: "Back 909", kind: "BOT", diff: 16, ab: { osrPass: 6 } },
      { pos: "CB2", slot: "DB", name: "Back 720", kind: "BOT", diff: 17, ab: { osrPass: 6 } },
      { pos: "CB3", slot: "DB", name: "R.Jefferson Jackson", kind: "BOT", diff: 16, ab: {  } },
      { pos: "SS1", slot: "DB", name: "R.Raul Martinez- Wang", kind: "BOT", diff: 23, ab: { intB: 8 }, elite: true },
      { pos: "SS2", slot: "DB", name: "Safety 652", kind: "BOT", diff: 10, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Safety 872", kind: "BOT", diff: 9, ab: {  } },
    ],
  },
  assam: {
    id: "assam", city: "Assam", name: "Creeping Death", conf: "THE HAVE NOTS · Prole",
    color: "#FA0807", color2: "#9BB53C", dark: "#2B0404", glyph: "☠", logo: "/logos/ASSAM.jpg", logoImg: false,
    ovr: 92, identity: "The serpent runs. Grimsby wears the 99.",
    tendency: { run: 0.72, deep: 0.15 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Iqbal Kohli", kind: "M", diff: 15, pct: [65, 43, 28], ab: { quick: true } },
      { pos: "QB2", slot: "QB", name: "Junichiro Sato", kind: "M", diff: 13, pct: [40, 22, 16], ab: { dsrPen: 3 } },
      { pos: "RB1", slot: "SKL", name: "Bud Grimsby", kind: "M", diff: 33, pct: [59, 40, 20], ab: { osr11: 8 }, elite: true },
      { pos: "WR1", slot: "SKL", name: "Hardeep Tanaka", kind: "M", diff: 14, pct: [84, 65, 43], ab: { osrPass: 6 } },
      { pos: "WR2", slot: "SKL", name: "Martin Castillo", kind: "M", diff: 9, pct: [31, 43, 65], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Tijo Thanantavali", kind: "M", diff: 10, pct: [56, 42, 35], ab: { dsrRun: 6 } },
      { pos: "TE1", slot: "SKL", name: "Praxad Mbatha", kind: "F", diff: 12, pct: [58, 68, 77], ab: { dsrPen: 3 } },
      { pos: "TE2", slot: "SKL", name: "Farbod Gul", kind: "M", diff: 7, pct: [52, 64, 65], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Ashok Basu", kind: "M", diff: 6, pct: [10, 15, 28], ab: {  } },
      { pos: "FB2", slot: "BLK", name: "Dalbir Huq", kind: "M", diff: 8, pct: [19, 14, 10], ab: {  } },
      { pos: "LT", slot: "BLK", name: "Morton Diehl", kind: "M", diff: 10, pct: null, ab: { osrPass: 8 } },
      { pos: "LG", slot: "BLK", name: "Randall Bohr", kind: "M", diff: 8, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Mardell Sweeney", kind: "M", diff: 12, pct: null, ab: { osrRun: 8 } },
      { pos: "RG", slot: "BLK", name: "Ming Zhou-Lou", kind: "M", diff: 9, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Orkis Steptoe", kind: "M", diff: 8, pct: null, ab: { osrRun: 4 } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Deacon Patel", kind: "M", diff: 24, ab: { sackB: 8 }, elite: true },
      { pos: "DE2", slot: "LINE", name: "Manmohan B.B.", kind: "M", diff: 10, ab: {  } },
      { pos: "NT1", slot: "LINE", name: "Rohit Sambal", kind: "M", diff: 10, ab: { dsrRun: 8 } },
      { pos: "NT2", slot: "LINE", name: "Goro Kuniyoshi", kind: "M", diff: 14, ab: { dsrRun: 6 } },
      { pos: "ILB1", slot: "LB", name: "Lukasz Tomacek", kind: "M", diff: 10, ab: { sackB: 8 } },
      { pos: "ILB2", slot: "LB", name: "Sanjay Singh", kind: "M", diff: 11, ab: { dsrPass: 4 } },
      { pos: "OLB1", slot: "LB", name: "Dalbir Singh", kind: "M", diff: 9, ab: { sackB: 6 } },
      { pos: "OLB2", slot: "LB", name: "Aung Robik", kind: "M", diff: 8, ab: { dsrRun: 4 } },
      { pos: "CB1", slot: "DB", name: "Sirhan Sharma", kind: "M", diff: 10, ab: { dsrPass: 2 } },
      { pos: "CB2", slot: "DB", name: "Mo Cid", kind: "M", diff: 9, ab: { dsrPass: 2 } },
      { pos: "CB3", slot: "DB", name: "Cam Huk", kind: "M", diff: 4, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Sreedevi Ganga", kind: "F", diff: 22, ab: { intB: 8 }, elite: true },
      { pos: "FS1", slot: "DB", name: "Ana Gautami", kind: "F", diff: 7, ab: { intB: 4 } },
    ],
  },
  la: {
    id: "la", city: "Los Angeles", name: "Firm of Pheir, Payne & Suffering", conf: "THE HAVES · Prime",
    color: "#C9A227", color2: "#D9D9D9", dark: "#3A2F0A", glyph: "⚖️", logo: "/logos/LA.jpg", logoImg: false,
    ovr: 90, identity: "Objection sustained. Blitz overruled. They bill by the sack.",
    tendency: { run: 0.45, deep: 0.3 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Blackburn Fitzpatrick", kind: "M", diff: 28, pct: [86, 63, 50], ab: { deadEye: 9 }, elite: true },
      { pos: "QB2", slot: "QB", name: "E.G. Shapiro", kind: "M", diff: 19, pct: [83, 58, 44], ab: { osrPass: 7 }, elite: true },
      { pos: "RB1", slot: "SKL", name: "Kingdom Foxx", kind: "M", diff: 19, pct: [52, 42, 20], ab: {  } },
      { pos: "WR1", slot: "SKL", name: "Keyshawn Mingo", kind: "M", diff: 26, pct: [88, 77, 66], ab: { osrPass: 9 }, elite: true },
      { pos: "WR2", slot: "SKL", name: "Othello Dior", kind: "M", diff: 17, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Demetrius Shaw", kind: "M", diff: 13, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "Orville Skinner", kind: "M", diff: 17, pct: [66, 72, 74], ab: {  } },
      { pos: "TE2", slot: "SKL", name: "Wang Hongwen", kind: "M", diff: 13, pct: [62, 66, 68], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Walt Wyman", kind: "M", diff: 10, pct: null, ab: {  } },
      { pos: "LT", slot: "BLK", name: "Clarence Timmons", kind: "M", diff: 19, pct: null, ab: {  } },
      { pos: "LG", slot: "BLK", name: "Mykal Willis", kind: "M", diff: 16, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Bjorn Braun", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Roger Saw", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Omar Chancellor", kind: "M", diff: 17, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Declan White", kind: "M", diff: 21, ab: {  } },
      { pos: "DE2", slot: "LINE", name: "Kingsley Turk", kind: "M", diff: 14, ab: {  } },
      { pos: "NT1", slot: "LINE", name: "Julek Wroclaw", kind: "M", diff: 21, ab: { sackB: 1 }, elite: true },
      { pos: "NT2", slot: "LINE", name: "Feodor Timshel", kind: "M", diff: 12, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Mukesh Singh", kind: "M", diff: 24, ab: { dsrRun: 9 }, elite: true },
      { pos: "ILB2", slot: "LB", name: "Arthur Trowel", kind: "M", diff: 15, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Corey Tyler", kind: "M", diff: 12, ab: {  } },
      { pos: "OLB2", slot: "LB", name: "Woody Wells", kind: "M", diff: 11, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Corey Trevathan", kind: "M", diff: 19, ab: {  } },
      { pos: "CB2", slot: "DB", name: "Kyle Lattimer", kind: "M", diff: 15, ab: {  } },
      { pos: "CB3", slot: "DB", name: "DeMarcus Jamb", kind: "M", diff: 12, ab: {  } },
      { pos: "CB4", slot: "DB", name: "Andre Clady", kind: "M", diff: 10, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Marcellus Reid", kind: "M", diff: 17, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Edwin Kotch", kind: "M", diff: 17, ab: {  } },
    ],
  },
  rome: {
    id: "rome", city: "Rome", name: "The Roman Legion", conf: "THE HAVES · Prime",
    color: "#8E1B1B", color2: "#D9D9D9", dark: "#2A0808", glyph: "🏛️", logo: "/logos/ROME.jpg", logoImg: false,
    ovr: 88, identity: "All roads lead to fourth-and-inches.",
    tendency: { run: 0.55, deep: 0.25 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Nero", kind: "M", diff: 23, pct: [85, 62, 48], ab: {  } },
      { pos: "QB2", slot: "QB", name: "M.A. Commodus", kind: "M", diff: 14, pct: [82, 56, 42], ab: {  } },
      { pos: "RB1", slot: "SKL", name: "Festus-Santino Axius", kind: "M", diff: 18, pct: [52, 42, 20], ab: {  } },
      { pos: "WR1", slot: "SKL", name: "Sergius Pallus", kind: "M", diff: 21, pct: [88, 77, 66], ab: {  } },
      { pos: "WR2", slot: "SKL", name: "Vivaldo Conti", kind: "M", diff: 16, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Roberto Stangellini", kind: "M", diff: 13, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "Balbinus Clovius", kind: "M", diff: 17, pct: [66, 72, 74], ab: {  } },
      { pos: "TE2", slot: "SKL", name: "Martina Valentino", kind: "M", diff: 13, pct: [62, 66, 68], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Nerva Sotoportego", kind: "M", diff: 10, pct: null, ab: {  } },
      { pos: "LT", slot: "BLK", name: "Alvaro Caruso", kind: "M", diff: 18, pct: null, ab: {  } },
      { pos: "LG", slot: "BLK", name: "Mauro Deluca", kind: "M", diff: 15, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Primo Ventura", kind: "M", diff: 18, pct: null, ab: { osrPass: 7 }, elite: true },
      { pos: "RG", slot: "BLK", name: "Telemaco Palumbo", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Ovidio D'Agostino", kind: "M", diff: 16, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Maximiliano Sforza", kind: "M", diff: 24, ab: { sackB: 8 }, elite: true },
      { pos: "NT1", slot: "LINE", name: "Mario Stromboli", kind: "M", diff: 16, ab: {  } },
      { pos: "NT2", slot: "LINE", name: "Alfonso Napolitano", kind: "M", diff: 12, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Lawson Taylorous", kind: "M", diff: 23, ab: { dsrRun: 8 }, elite: true },
      { pos: "ILB2", slot: "LB", name: "Ottavio Izzo", kind: "M", diff: 19, ab: { dsrRun: 7 }, elite: true },
      { pos: "OLB1", slot: "LB", name: "Carlo Bianco", kind: "M", diff: 16, ab: { dsrRun: 7 }, elite: true },
      { pos: "OLB2", slot: "LB", name: "Donny Ambrose", kind: "M", diff: 10, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Trajan Apuzzo", kind: "M", diff: 18, ab: {  } },
      { pos: "CB2", slot: "DB", name: "Leandro Belifiore", kind: "M", diff: 15, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Italo Lanza", kind: "M", diff: 12, ab: {  } },
      { pos: "CB4", slot: "DB", name: "Piero Zattale", kind: "M", diff: 10, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Ugo Longo", kind: "M", diff: 17, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Sisto Fiore", kind: "M", diff: 16, ab: {  } },
    ],
  },
  un: {
    id: "un", city: "United Nations", name: "Global Alliance", conf: "THE HAVES · Prime",
    color: "#3B7DD8", color2: "#D9D9D9", dark: "#0E2545", glyph: "🌐", logo: "/logos/UN.jpg", logoImg: false,
    ovr: 90, identity: "27 nations. One playbook. Endless subcommittees.",
    tendency: { run: 0.5, deep: 0.28 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Bola Nkemediche", kind: "M", diff: 28, pct: [86, 63, 50], ab: { deadEye: 9 }, elite: true },
      { pos: "QB2", slot: "QB", name: "Atiqtalik Yazzie", kind: "M", diff: 15, pct: [83, 58, 44], ab: {  } },
      { pos: "RB1", slot: "SKL", name: "Miguel Rosales", kind: "M", diff: 19, pct: [52, 42, 20], ab: {  } },
      { pos: "WR1", slot: "SKL", name: "Fausto Amaral", kind: "M", diff: 26, pct: [88, 77, 66], ab: { osrPass: 9 }, elite: true },
      { pos: "WR2", slot: "SKL", name: "Pavel Tarng", kind: "M", diff: 17, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Maxwell Reedus", kind: "M", diff: 13, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "Wing-Fu Chin", kind: "M", diff: 21, pct: [66, 72, 74], ab: { osrPass: 8 }, elite: true },
      { pos: "TE2", slot: "SKL", name: "Tommy Nakamura", kind: "M", diff: 17, pct: [62, 66, 68], ab: { osrPass: 7 }, elite: true },
      { pos: "FB1", slot: "BLK", name: "Gautam Dutt", kind: "M", diff: 10, pct: null, ab: {  } },
      { pos: "LT", slot: "BLK", name: "Oshimane Okereke", kind: "M", diff: 19, pct: null, ab: {  } },
      { pos: "LG", slot: "BLK", name: "Muntu Bantha", kind: "M", diff: 16, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Israel La'akea", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Solosolo Māhoe", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Abdul Esfahani", kind: "M", diff: 17, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Medard Meir", kind: "M", diff: 25, ab: { sackB: 1 }, elite: true },
      { pos: "DE2", slot: "LINE", name: "Olaf Swennson", kind: "M", diff: 14, ab: {  } },
      { pos: "NT1", slot: "LINE", name: "Gorm Eriksson", kind: "M", diff: 17, ab: {  } },
      { pos: "NT2", slot: "LINE", name: "Monkbhat Huuchid", kind: "M", diff: 12, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Anatoli Confetti", kind: "M", diff: 20, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "Fritz Lindemann", kind: "M", diff: 15, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Torvald Miku", kind: "M", diff: 12, ab: {  } },
      { pos: "OLB2", slot: "LB", name: "Baldar Grels", kind: "M", diff: 11, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Zoltan Biev", kind: "M", diff: 19, ab: {  } },
      { pos: "CB2", slot: "DB", name: "Greko Smoot", kind: "M", diff: 15, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Timo Nygren", kind: "M", diff: 12, ab: {  } },
      { pos: "CB4", slot: "DB", name: "Samuel Bibi", kind: "M", diff: 10, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Ygor Klim", kind: "M", diff: 17, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Gretel Gul", kind: "F", diff: 17, ab: {  } },
    ],
  },
  dc: {
    id: "dc", city: "Washington DC", name: "Old Glory", conf: "THE HAVES · Nova",
    color: "#1F3A93", color2: "#D9D9D9", dark: "#0A1330", glyph: "⭐", logo: "/logos/DC.jpg", logoImg: false,
    ovr: 80, identity: "Filibusters the clock. Vetoes your screen game.",
    tendency: { run: 0.5, deep: 0.28 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Teddy Roosevelt", kind: "M", diff: 21, pct: [81, 54, 40], ab: { deadEye: 9 }, elite: true },
      { pos: "QB2", slot: "QB", name: "Tasquantum Lightfoot", kind: "M", diff: 11, pct: [78, 48, 33], ab: {  } },
      { pos: "RB1", slot: "SKL", name: "Purcell Gonzalez", kind: "M", diff: 14, pct: [52, 42, 20], ab: {  } },
      { pos: "WR1", slot: "SKL", name: "Woodrow Wilson", kind: "M", diff: 16, pct: [88, 77, 66], ab: {  } },
      { pos: "WR2", slot: "SKL", name: "Cleetus McCoy", kind: "M", diff: 12, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Allan Crom", kind: "M", diff: 9, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "Abe Lincoln", kind: "M", diff: 12, pct: [66, 72, 74], ab: {  } },
      { pos: "TE2", slot: "SKL", name: "Tecumseh Thorpe", kind: "M", diff: 9, pct: [62, 66, 68], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Orland Tarver", kind: "M", diff: 7, pct: null, ab: {  } },
      { pos: "LT", slot: "BLK", name: "Ricky Solder", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "LG", slot: "BLK", name: "Alex Walsh", kind: "M", diff: 11, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Chuck Maplethorpe", kind: "M", diff: 14, pct: null, ab: { osrPass: 6 }, elite: true },
      { pos: "RG", slot: "BLK", name: "Tyler Pierce", kind: "M", diff: 10, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Zachary Harrison", kind: "M", diff: 12, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Santiago Soto", kind: "M", diff: 15, ab: {  } },
      { pos: "DE2", slot: "LINE", name: "Lamarr Washington", kind: "M", diff: 10, ab: {  } },
      { pos: "NT1", slot: "LINE", name: "Bill Taft", kind: "M", diff: 16, ab: { sackB: 1 }, elite: true },
      { pos: "NT2", slot: "LINE", name: "Weston Boothe", kind: "M", diff: 9, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "King Rucker", kind: "M", diff: 14, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "Cassius Del Mar", kind: "M", diff: 11, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Marty Burris", kind: "M", diff: 9, ab: {  } },
      { pos: "OLB2", slot: "LB", name: "Syndey Burns", kind: "M", diff: 7, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Weeping Crow", kind: "M", diff: 14, ab: {  } },
      { pos: "CB2", slot: "DB", name: "Mister Loeffler", kind: "M", diff: 11, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Harley Hart", kind: "M", diff: 8, ab: {  } },
      { pos: "CB4", slot: "DB", name: "Wendell Cunningham", kind: "M", diff: 7, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Geronimo Goyathlay", kind: "M", diff: 16, ab: { intB: 7 }, elite: true },
      { pos: "FS1", slot: "DB", name: "Casper Blackwood", kind: "M", diff: 12, ab: {  } },
    ],
  },
  tokyo: {
    id: "tokyo", city: "Tokyo", name: "TASC Masters", conf: "THE HAVES · Nova",
    color: "#D92B7A", color2: "#D9D9D9", dark: "#3A0A20", glyph: "⛩️", logo: "/logos/TOKYO.jpg", logoImg: false,
    ovr: 84, identity: "The playbook is 900 pages. They memorized 901.",
    tendency: { run: 0.45, deep: 0.3 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Inejiro Tokugawa", kind: "M", diff: 20, pct: [83, 58, 44], ab: {  } },
      { pos: "QB2", slot: "QB", name: "Susumu Nobunaga", kind: "M", diff: 12, pct: [80, 52, 37], ab: {  } },
      { pos: "RB1", slot: "SKL", name: "Hideki Otani", kind: "M", diff: 16, pct: [52, 42, 20], ab: {  } },
      { pos: "WR1", slot: "SKL", name: "Daisuke Koizumi", kind: "M", diff: 22, pct: [88, 77, 66], ab: { osrPass: 9 }, elite: true },
      { pos: "WR2", slot: "SKL", name: "Gento Watanabe", kind: "M", diff: 14, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Satoshi Ginoza", kind: "M", diff: 11, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "Masato Noda", kind: "M", diff: 14, pct: [66, 72, 74], ab: {  } },
      { pos: "TE2", slot: "SKL", name: "Hiro Tojo", kind: "M", diff: 11, pct: [62, 66, 68], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Endo Hachimura", kind: "M", diff: 8, pct: null, ab: {  } },
      { pos: "LT", slot: "BLK", name: "Cedric Croston", kind: "M", diff: 16, pct: null, ab: {  } },
      { pos: "LG", slot: "BLK", name: "Marcus Ghoulston", kind: "M", diff: 13, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Eero Koski", kind: "M", diff: 12, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Masayoshi Okamoto", kind: "M", diff: 12, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Tyrod Seltzer-Coe", kind: "M", diff: 14, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Jiro Midori", kind: "M", diff: 17, ab: {  } },
      { pos: "DE2", slot: "LINE", name: "Hanzo Takahashi", kind: "M", diff: 16, ab: { sackB: 1 }, elite: true },
      { pos: "NT1", slot: "LINE", name: "Kenji Raiden", kind: "M", diff: 18, ab: { sackB: 1 }, elite: true },
      { pos: "NT2", slot: "LINE", name: "Masafumi Hana", kind: "M", diff: 14, ab: { sackB: 1 }, elite: true },
      { pos: "ILB1", slot: "LB", name: "Ryuzo Nishioka", kind: "M", diff: 20, ab: { dsrRun: 8 }, elite: true },
      { pos: "ILB2", slot: "LB", name: "Toru Fukudome", kind: "M", diff: 13, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Yofuo Aki", kind: "M", diff: 10, ab: {  } },
      { pos: "OLB2", slot: "LB", name: "Shinji Yamada", kind: "M", diff: 9, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Natsume Ando", kind: "F", diff: 16, ab: {  } },
      { pos: "CB2", slot: "DB", name: "Eric Tolzien", kind: "M", diff: 13, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Sato Hanabusa", kind: "M", diff: 10, ab: {  } },
      { pos: "CB4", slot: "DB", name: "Funa Iwamoto", kind: "M", diff: 8, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Ieyasu Ishii", kind: "M", diff: 14, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Sanjiro Fujimoto", kind: "M", diff: 14, ab: {  } },
    ],
  },
  inca: {
    id: "inca", city: "Inca", name: "Obsidian Pumas", conf: "THE HAVES · Nova",
    color: "#3C2A4D", color2: "#D9D9D9", dark: "#150E1C", glyph: "🐆", logo: "/logos/INCA.jpg", logoImg: false,
    ovr: 86, identity: "Altitude-born. Your lungs tap out in the second quarter.",
    tendency: { run: 0.55, deep: 0.25 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Atoc Nyunyuma", kind: "M", diff: 21, pct: [84, 60, 46], ab: {  } },
      { pos: "QB2", slot: "QB", name: "Stanis Kowalski", kind: "M", diff: 13, pct: [81, 54, 40], ab: {  } },
      { pos: "RB1", slot: "SKL", name: "Smoke Monkey", kind: "M", diff: 21, pct: [52, 42, 20], ab: { osrRun: 8 }, elite: true },
      { pos: "WR1", slot: "SKL", name: "Gordon Ilyapa", kind: "M", diff: 19, pct: [88, 77, 66], ab: {  } },
      { pos: "WR2", slot: "SKL", name: "Myra Supay", kind: "F", diff: 15, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Abel Paricia", kind: "M", diff: 12, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "Nina Quilla", kind: "M", diff: 15, pct: [66, 72, 74], ab: {  } },
      { pos: "TE2", slot: "SKL", name: "Jorge Axomamma", kind: "M", diff: 12, pct: [62, 66, 68], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Marcos Gonzalez", kind: "M", diff: 9, pct: null, ab: {  } },
      { pos: "LT", slot: "BLK", name: "Domingo Santana", kind: "M", diff: 17, pct: null, ab: {  } },
      { pos: "LG", slot: "BLK", name: "Marcelo Copacati", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Herbert Huanca", kind: "M", diff: 13, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Norberto Slim", kind: "M", diff: 13, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Honore Cuca", kind: "M", diff: 15, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "DeAngelo Bell", kind: "M", diff: 22, ab: { sackB: 8 }, elite: true },
      { pos: "NT1", slot: "LINE", name: "Sergio Mantequilla", kind: "M", diff: 15, ab: {  } },
      { pos: "NT2", slot: "LINE", name: "Luyes Luyes", kind: "M", diff: 11, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Ozcoc Tupac", kind: "M", diff: 21, ab: { dsrRun: 8 }, elite: true },
      { pos: "ILB2", slot: "LB", name: "Cayo-Topa Marquez", kind: "M", diff: 13, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Yasiel Colòn", kind: "M", diff: 11, ab: {  } },
      { pos: "OLB2", slot: "LB", name: "Huachuri Del Mar", kind: "M", diff: 9, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Maria Dos Santos", kind: "M", diff: 21, ab: { intB: 8 }, elite: true },
      { pos: "CB2", slot: "DB", name: "Zope Nusta", kind: "M", diff: 13, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Karl Kline", kind: "M", diff: 10, ab: {  } },
      { pos: "CB4", slot: "DB", name: "Quilaco Auqui", kind: "M", diff: 9, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Chunchos Coya", kind: "M", diff: 15, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Quizo Yupanqui", kind: "M", diff: 15, ab: {  } },
    ],
  },
  sf: {
    id: "sf", city: "San Francisco", name: "Mitsune-Gumi Ronin", conf: "THE HAVES · Alpha",
    color: "#B34700", color2: "#D9D9D9", dark: "#331400", glyph: "🏯", logo: "/logos/SF.jpg", logoImg: false,
    ovr: 86, identity: "Masterless. Merciless. Meticulous about gap discipline.",
    tendency: { run: 0.4, deep: 0.33 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Rocky Cosby", kind: "M", diff: 25, pct: [84, 60, 46], ab: { deadEye: 9 }, elite: true },
      { pos: "QB2", slot: "QB", name: "Masato Funaki", kind: "M", diff: 13, pct: [81, 54, 40], ab: {  } },
      { pos: "RB1", slot: "SKL", name: "Frank Montana", kind: "M", diff: 17, pct: [52, 42, 20], ab: {  } },
      { pos: "WR1", slot: "SKL", name: "S.Randy Rice", kind: "M", diff: 23, pct: [88, 77, 66], ab: { osrPass: 8 }, elite: true },
      { pos: "WR2", slot: "SKL", name: "Owen Bolden", kind: "M", diff: 15, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Brock Norwood", kind: "M", diff: 12, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "Ronin Nixon", kind: "M", diff: 19, pct: [66, 72, 74], ab: { osrPass: 7 }, elite: true },
      { pos: "TE2", slot: "SKL", name: "Virgil Swank", kind: "M", diff: 12, pct: [62, 66, 68], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Earl Monroe", kind: "M", diff: 9, pct: null, ab: {  } },
      { pos: "LT", slot: "BLK", name: "John Cross", kind: "M", diff: 17, pct: null, ab: {  } },
      { pos: "LG", slot: "BLK", name: "Randy Ayers", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Bubba Cooper", kind: "M", diff: 13, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Kerwin Lum", kind: "M", diff: 13, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Guy Lott", kind: "M", diff: 15, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Mick Christmas", kind: "M", diff: 22, ab: { sackB: 1 }, elite: true },
      { pos: "DE2", slot: "LINE", name: "Jerry Mix", kind: "M", diff: 13, ab: {  } },
      { pos: "NT1", slot: "LINE", name: "Ezekiel Huston", kind: "M", diff: 15, ab: {  } },
      { pos: "NT2", slot: "LINE", name: "Worrell Smith", kind: "M", diff: 11, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Lyndale Hamm", kind: "M", diff: 17, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "Wilbur Thompson", kind: "M", diff: 13, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Vincent Spain", kind: "M", diff: 11, ab: {  } },
      { pos: "OLB2", slot: "LB", name: "Karl Swanson", kind: "M", diff: 9, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Benson Chow", kind: "M", diff: 17, ab: {  } },
      { pos: "CB2", slot: "DB", name: "Mansoor Timany", kind: "M", diff: 13, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Stanley Lal", kind: "M", diff: 10, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Conrad Atwater", kind: "M", diff: 19, ab: { intB: 7 }, elite: true },
      { pos: "FS1", slot: "DB", name: "Clarence Fujimoto", kind: "M", diff: 15, ab: {  } },
    ],
  },
  cairo: {
    id: "cairo", city: "Cairo", name: "Twice-Risen Pharaohs", conf: "THE HAVES · Alpha",
    color: "#C9A227", color2: "#D9D9D9", dark: "#3A2F0A", glyph: "☥", logo: "/logos/CAIRO.jpg", logoImg: false,
    ovr: 90, identity: "Died twice. Punted never.",
    tendency: { run: 0.7, deep: 0.17 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Rameses Al-Masri", kind: "M", diff: 24, pct: [86, 63, 50], ab: {  } },
      { pos: "QB2", slot: "QB", name: "Hassan Latakia", kind: "M", diff: 15, pct: [83, 58, 44], ab: {  } },
      { pos: "FB1", slot: "SKL", name: "Anubis Re", kind: "M", diff: 23, pct: [52, 42, 20], ab: { canonball: 1 }, elite: true },
      { pos: "WR1", slot: "SKL", name: "Ali", kind: "M", diff: 22, pct: [88, 77, 66], ab: {  } },
      { pos: "WR2", slot: "SKL", name: "Isis Abrax", kind: "M", diff: 17, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Seth Musa", kind: "M", diff: 13, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "Ammon Bast", kind: "M", diff: 17, pct: [66, 72, 74], ab: {  } },
      { pos: "TE2", slot: "SKL", name: "Babu Oba", kind: "M", diff: 13, pct: [62, 66, 68], ab: {  } },
      { pos: "RB1", slot: "SKL", name: "Mustafa Ebo", kind: "M", diff: 16, pct: [58, 46, 24], ab: { osr11: 6 } },
      { pos: "LT", slot: "BLK", name: "Abolfazil Atum", kind: "M", diff: 19, pct: null, ab: {  } },
      { pos: "LG", slot: "BLK", name: "Henry Lo", kind: "M", diff: 16, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Nigel Carberry", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Udo Mir", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Teimuraz Gagam", kind: "M", diff: 17, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Hannibal Babafemi", kind: "M", diff: 25, ab: { sackB: 8 }, elite: true },
      { pos: "DE2", slot: "LINE", name: "Simeon Kloot", kind: "M", diff: 14, ab: {  } },
      { pos: "NT1", slot: "LINE", name: "Ibrahim Imhotep", kind: "M", diff: 21, ab: { sackB: 1 }, elite: true },
      { pos: "NT2", slot: "LINE", name: "Shailash Ibn-Mohammed", kind: "M", diff: 12, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Emir Ibn-Farsi", kind: "M", diff: 20, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "Troy Dye", kind: "M", diff: 15, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Easton St. Laurent", kind: "M", diff: 12, ab: {  } },
      { pos: "OLB2", slot: "LB", name: "Parvez Khan", kind: "M", diff: 11, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Rakeem DeJardin", kind: "M", diff: 19, ab: {  } },
      { pos: "CB2", slot: "DB", name: "Romond Macron", kind: "M", diff: 15, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Sean McTavish", kind: "M", diff: 12, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Karl Hapsburg", kind: "M", diff: 17, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Eliphaz Nasser", kind: "M", diff: 17, ab: {  } },
    ],
  },
  sydney: {
    id: "sydney", city: "Sydney", name: "Copper Locusts", conf: "THE HAVES · Alpha",
    color: "#B87333", color2: "#D9D9D9", dark: "#331A0A", glyph: "🦗", logo: "/logos/SYDNEY.jpg", logoImg: false,
    ovr: 83, identity: "A plague with a two-minute drill.",
    tendency: { run: 0.5, deep: 0.28 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Stanley Livingston", kind: "M", diff: 19, pct: [82, 57, 43], ab: {  } },
      { pos: "QB2", slot: "QB", name: "Neville Namatjira", kind: "M", diff: 16, pct: [79, 51, 36], ab: { osrPass: 7 }, elite: true },
      { pos: "RB1", slot: "SKL", name: "Early Boolgoo", kind: "M", diff: 19, pct: [52, 42, 20], ab: { osrRun: 7 }, elite: true },
      { pos: "WR1", slot: "SKL", name: "Bruce Largent", kind: "M", diff: 17, pct: [88, 77, 66], ab: {  } },
      { pos: "WR2", slot: "SKL", name: "Charlie Castor", kind: "M", diff: 13, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Hieronymous Baldwin", kind: "M", diff: 14, pct: [78, 66, 48], ab: { osrPass: 6 }, elite: true },
      { pos: "TE1", slot: "SKL", name: "Byron Warner", kind: "M", diff: 14, pct: [66, 72, 74], ab: {  } },
      { pos: "TE2", slot: "SKL", name: "Neddy Doss", kind: "M", diff: 10, pct: [62, 66, 68], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Samson Djaru", kind: "M", diff: 8, pct: null, ab: {  } },
      { pos: "LT", slot: "BLK", name: "Keith Nash", kind: "M", diff: 15, pct: null, ab: {  } },
      { pos: "LG", slot: "BLK", name: "Ashleigh Jones", kind: "M", diff: 13, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Gouda Ithu", kind: "M", diff: 11, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Glenn Powers", kind: "M", diff: 11, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Billy Munson", kind: "M", diff: 13, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Jack-Jack Jadira", kind: "M", diff: 20, ab: { sackB: 8 }, elite: true },
      { pos: "DE2", slot: "LINE", name: "Lewis Mitchum", kind: "M", diff: 11, ab: {  } },
      { pos: "NT1", slot: "LINE", name: "Tom Howard", kind: "M", diff: 13, ab: {  } },
      { pos: "NT2", slot: "LINE", name: "Otis McMath", kind: "M", diff: 14, ab: { sackB: 1 }, elite: true },
      { pos: "ILB1", slot: "LB", name: "Cedric Ghoulsby", kind: "M", diff: 16, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "Elijah Selters", kind: "M", diff: 12, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Bruno Ott", kind: "M", diff: 10, ab: {  } },
      { pos: "OLB2", slot: "LB", name: "LaMichael Yanda", kind: "M", diff: 8, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Leveon Swell", kind: "M", diff: 15, ab: {  } },
      { pos: "CB2", slot: "DB", name: "Roger Fitzgerald", kind: "M", diff: 12, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Wallis Kelly", kind: "M", diff: 10, ab: {  } },
      { pos: "CB4", slot: "DB", name: "Preston Ngarkat", kind: "M", diff: 8, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Sekope Timani", kind: "M", diff: 14, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Rory Phipps", kind: "M", diff: 13, ab: {  } },
    ],
  },
  paris: {
    id: "paris", city: "Paris", name: "Reign of Terror", conf: "THE HAVES · Alpha",
    color: "#4B1E6B", color2: "#D9D9D9", dark: "#160A20", glyph: "⚜️", logo: "/logos/PARIS.jpg", logoImg: false,
    ovr: 80, identity: "The committee has voted. It's a blitz.",
    tendency: { run: 0.25, deep: 0.41 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Napolean Bonaparte", kind: "M", diff: 21, pct: [81, 54, 40], ab: { deadEye: 9 }, elite: true },
      { pos: "QB2", slot: "QB", name: "Joachim Murat", kind: "M", diff: 11, pct: [78, 48, 33], ab: {  } },
      { pos: "RB1", slot: "SKL", name: "Charlemagne Arceneaux-Wang", kind: "M", diff: 18, pct: [52, 42, 20], ab: { osrRun: 7 }, elite: true },
      { pos: "WR1", slot: "SKL", name: "Legedu Tsotsi", kind: "M", diff: 16, pct: [88, 77, 66], ab: {  } },
      { pos: "WR2", slot: "SKL", name: "Guillame Tussaud", kind: "M", diff: 12, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Toulouse Martel", kind: "M", diff: 9, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "Pierre Cong-Diep", kind: "M", diff: 12, pct: [66, 72, 74], ab: {  } },
      { pos: "TE2", slot: "SKL", name: "Armand St. Michel", kind: "M", diff: 9, pct: [62, 66, 68], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Lydell Fontain", kind: "M", diff: 7, pct: null, ab: {  } },
      { pos: "LT", slot: "BLK", name: "Jacques C'est-Bonn", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "LG", slot: "BLK", name: "Raphael Toulin", kind: "M", diff: 11, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Hugo Loire", kind: "M", diff: 10, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Sacha Perault", kind: "M", diff: 10, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Enzo Bisset", kind: "M", diff: 12, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Étienne de Vignolles", kind: "M", diff: 15, ab: {  } },
      { pos: "DE2", slot: "LINE", name: "Mboye Sartre", kind: "M", diff: 10, ab: {  } },
      { pos: "NT1", slot: "LINE", name: "Yves Dauphin", kind: "M", diff: 16, ab: { sackB: 1 }, elite: true },
      { pos: "NT2", slot: "LINE", name: "Louis Bédard", kind: "M", diff: 9, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Rene Cote-L’Enfant", kind: "M", diff: 14, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "Sherderius Caver", kind: "M", diff: 11, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Renaud Le Boef", kind: "M", diff: 9, ab: {  } },
      { pos: "OLB2", slot: "LB", name: "Chukwe Nkoro", kind: "M", diff: 7, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Hervey Côté", kind: "M", diff: 14, ab: {  } },
      { pos: "CB2", slot: "DB", name: "Ja'Gred DeCloux", kind: "M", diff: 11, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Monty St. Croix", kind: "M", diff: 8, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Jeanne D'Arc", kind: "F", diff: 12, ab: {  } },
      { pos: "SS2", slot: "DB", name: "Levesque DuBois", kind: "M", diff: 9, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Fred Chagnon", kind: "M", diff: 12, ab: {  } },
    ],
  },
  munich: {
    id: "munich", city: "Munich", name: "Teutonic Machine", conf: "THE HAVE NOTS · Hoi Polloi",
    color: "#4A4A4A", color2: "#D9D9D9", dark: "#151515", glyph: "⚙️", logo: "/logos/MUNICH.jpg", logoImg: false,
    ovr: 79, identity: "Precision-engineered. Some assembly of the secondary required.",
    tendency: { run: 0.45, deep: 0.3 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Rudolph Vogelsong", kind: "M", diff: 17, pct: [80, 53, 38], ab: {  } },
      { pos: "QB2", slot: "QB", name: "Til Durndl", kind: "M", diff: 11, pct: [77, 47, 32], ab: {  } },
      { pos: "RB1", slot: "SKL", name: "Shuji Kimura", kind: "M", diff: 18, pct: [52, 42, 20], ab: { osrPass: 9 }, elite: true },
      { pos: "WR1", slot: "SKL", name: "Sterling Kessler", kind: "M", diff: 16, pct: [88, 77, 66], ab: {  } },
      { pos: "WR2", slot: "SKL", name: "Fritz Daimler", kind: "M", diff: 12, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Detlef Lange", kind: "M", diff: 9, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "Lindsay Tomlin", kind: "M", diff: 12, pct: [66, 72, 74], ab: {  } },
      { pos: "TE2", slot: "SKL", name: "Ludwig Kuhn", kind: "M", diff: 9, pct: [62, 66, 68], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Kurleigh Glass", kind: "M", diff: 7, pct: null, ab: {  } },
      { pos: "LT", slot: "BLK", name: "Gunnar Kaiser", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "LG", slot: "BLK", name: "Hartmut Berger", kind: "M", diff: 11, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Isaac Shurmur", kind: "M", diff: 14, pct: null, ab: { osrPass: 6 }, elite: true },
      { pos: "RG", slot: "BLK", name: "Gustav Schmitz", kind: "M", diff: 14, pct: null, ab: { osrPass: 6 }, elite: true },
      { pos: "RT", slot: "BLK", name: "Jörn Fuchs", kind: "M", diff: 16, pct: null, ab: { osrPass: 7 }, elite: true },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Cloyce Dietrich", kind: "M", diff: 15, ab: {  } },
      { pos: "DE2", slot: "LINE", name: "Eberhard Richter", kind: "M", diff: 10, ab: {  } },
      { pos: "NT1", slot: "LINE", name: "Reinhardt Tannenbaum", kind: "M", diff: 12, ab: {  } },
      { pos: "NT2", slot: "LINE", name: "Krispus Munt", kind: "M", diff: 9, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Albrecht Krüger", kind: "M", diff: 14, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "Engel Stein", kind: "M", diff: 11, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Arnold Pfeiffer", kind: "M", diff: 9, ab: {  } },
      { pos: "OLB2", slot: "LB", name: "Otto Sommer", kind: "M", diff: 7, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Peters Huber", kind: "M", diff: 18, ab: { intB: 7 }, elite: true },
      { pos: "CB2", slot: "DB", name: "Lorenz Winkler", kind: "M", diff: 11, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Trudy Ott", kind: "M", diff: 8, ab: {  } },
      { pos: "CB4", slot: "DB", name: "Simon Brandt", kind: "M", diff: 7, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Felix Von Koln", kind: "M", diff: 12, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Florian Krausse", kind: "M", diff: 12, ab: {  } },
    ],
  },
  saigon: {
    id: "saigon", city: "Saigon", name: "Amalgamated Clanship", conf: "THE HAVE NOTS · Hoi Polloi",
    color: "#C0392B", color2: "#D9D9D9", dark: "#360F0A", glyph: "🐉", logo: "/logos/SAIGON.jpg", logoImg: false,
    ovr: 82, identity: "Twelve cousins, one huddle, zero secrets.",
    tendency: { run: 0.45, deep: 0.3 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Jimmy Lo", kind: "M", diff: 23, pct: [82, 56, 42], ab: { deadEye: 9 }, elite: true },
      { pos: "QB2", slot: "QB", name: "Pham Nguyen", kind: "M", diff: 12, pct: [79, 50, 35], ab: {  } },
      { pos: "RB1", slot: "SKL", name: "Minh-Quan Vu", kind: "M", diff: 15, pct: [52, 42, 20], ab: {  } },
      { pos: "WR1", slot: "SKL", name: "Xao Vu Xa", kind: "M", diff: 17, pct: [88, 77, 66], ab: {  } },
      { pos: "WR2", slot: "SKL", name: "Van Vien Nguyen", kind: "M", diff: 13, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Harold Reynolds", kind: "M", diff: 10, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "Dang-Quang Phan", kind: "M", diff: 18, pct: [66, 72, 74], ab: { osrPass: 7 }, elite: true },
      { pos: "TE2", slot: "SKL", name: "Thinh Duong", kind: "M", diff: 10, pct: [62, 66, 68], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Chi Dan Nguyen", kind: "M", diff: 8, pct: null, ab: {  } },
      { pos: "LT", slot: "BLK", name: "Gus Branch", kind: "M", diff: 15, pct: null, ab: {  } },
      { pos: "LG", slot: "BLK", name: "Clarence Diehl", kind: "M", diff: 13, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Ryan Boothe", kind: "M", diff: 11, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Brandon Mills", kind: "M", diff: 11, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Kevin Baker", kind: "M", diff: 13, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Marshall Railsback", kind: "M", diff: 16, ab: {  } },
      { pos: "DE2", slot: "LINE", name: "Johnny Van", kind: "M", diff: 11, ab: {  } },
      { pos: "NT1", slot: "LINE", name: "Van-Lang Vo", kind: "M", diff: 17, ab: { sackB: 1 }, elite: true },
      { pos: "NT2", slot: "LINE", name: "Paul Tuttle", kind: "M", diff: 10, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Quoc Bui", kind: "M", diff: 16, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "Minh Phuc Nguyen", kind: "M", diff: 12, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Noah Mitchell", kind: "M", diff: 10, ab: {  } },
      { pos: "OLB2", slot: "LB", name: "Aroldis Guzman", kind: "M", diff: 8, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Luong Dang", kind: "M", diff: 15, ab: {  } },
      { pos: "CB2", slot: "DB", name: "Duc Giang Nguyen", kind: "M", diff: 12, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Leonard Cox", kind: "M", diff: 10, ab: {  } },
      { pos: "CB4", slot: "DB", name: "Floyd Gathers", kind: "M", diff: 8, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Pin Dinh", kind: "M", diff: 14, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Nhat-Vu Ngo", kind: "M", diff: 13, ab: {  } },
    ],
  },
  bangkok: {
    id: "bangkok", city: "Bangkok", name: "Royal Mass Hysteria", conf: "THE HAVE NOTS · Hoi Polloi",
    color: "#7A1FA2", color2: "#D9D9D9", dark: "#220A2E", glyph: "🐘", logo: "/logos/BANGKOK.jpg", logoImg: false,
    ovr: 80, identity: "The crowd never stops. Neither does the motion shift.",
    tendency: { run: 0.35, deep: 0.36 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Limsong", kind: "M", diff: 21, pct: [81, 54, 40], ab: { deadEye: 9 }, elite: true },
      { pos: "QB2", slot: "QB", name: "Isinthon Jitjang", kind: "M", diff: 11, pct: [78, 48, 33], ab: {  } },
      { pos: "RB1", slot: "SKL", name: "Tong Suprija", kind: "M", diff: 14, pct: [52, 42, 20], ab: {  } },
      { pos: "WR1", slot: "SKL", name: "Elliot Eagan", kind: "M", diff: 20, pct: [88, 77, 66], ab: { osrPass: 8 }, elite: true },
      { pos: "WR2", slot: "SKL", name: "Sarawong Bidaya", kind: "M", diff: 12, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Noklek Pramoj", kind: "M", diff: 9, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "Poon Serawongchai", kind: "M", diff: 12, pct: [66, 72, 74], ab: {  } },
      { pos: "TE2", slot: "SKL", name: "Mok Khadpo", kind: "M", diff: 9, pct: [62, 66, 68], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Nopjira Ongkara", kind: "M", diff: 7, pct: null, ab: {  } },
      { pos: "LT", slot: "BLK", name: "Ngam Jaidee", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "LG", slot: "BLK", name: "Braxton Crofts", kind: "M", diff: 11, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Suda Kessawai", kind: "M", diff: 10, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Kyle Pronger", kind: "M", diff: 10, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Sujin Plaphol", kind: "M", diff: 12, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Pu Hoontrakul", kind: "M", diff: 19, ab: { sackB: 1 }, elite: true },
      { pos: "DE2", slot: "LINE", name: "Sumatra Lamsam", kind: "M", diff: 14, ab: { sackB: 1 }, elite: true },
      { pos: "NT1", slot: "LINE", name: "Pibil Disatha", kind: "M", diff: 12, ab: {  } },
      { pos: "NT2", slot: "LINE", name: "Loomis Brent", kind: "M", diff: 9, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Thomas Barr", kind: "M", diff: 14, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "Hiran Duchanee", kind: "M", diff: 11, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Matt Van Elm", kind: "M", diff: 9, ab: {  } },
      { pos: "OLB2", slot: "LB", name: "Grigorio Zacateca", kind: "M", diff: 7, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Zack Mueller", kind: "M", diff: 14, ab: {  } },
      { pos: "CB2", slot: "DB", name: "Ira Clasp", kind: "M", diff: 11, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Mo Dinh", kind: "M", diff: 8, ab: {  } },
      { pos: "CB4", slot: "DB", name: "Kusa Somboon", kind: "M", diff: 7, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Thamrong Cheosakul", kind: "M", diff: 12, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Bryce Collier", kind: "M", diff: 12, ab: {  } },
    ],
  },
  tashkent: {
    id: "tashkent", city: "Tashkent", name: "Miasmatic Plague", conf: "THE HAVE NOTS · Hoi Polloi",
    color: "#5B7F2B", color2: "#D9D9D9", dark: "#1A250C", glyph: "☣️", logo: "/logos/TASHKENT.jpg", logoImg: false,
    ovr: 91, identity: "The ground game is airborne. Cover your mouth.",
    tendency: { run: 0.65, deep: 0.19 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Mansur Morris", kind: "M", diff: 29, pct: [87, 64, 51], ab: { osrRun: 8 }, elite: true },
      { pos: "QB2", slot: "QB", name: "Farbod Warfield", kind: "M", diff: 16, pct: [83, 59, 45], ab: {  } },
      { pos: "RB1", slot: "SKL", name: "Bostwick Bykov", kind: "M", diff: 24, pct: [52, 42, 20], ab: { osrRun: 9 }, elite: true },
      { pos: "WR1", slot: "SKL", name: "Marcel Crusan", kind: "M", diff: 23, pct: [88, 77, 66], ab: {  } },
      { pos: "WR2", slot: "SKL", name: "Rustam Sadykov", kind: "M", diff: 18, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Kiril Mengiz", kind: "M", diff: 14, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "Muazzam", kind: "M", diff: 18, pct: [66, 72, 74], ab: {  } },
      { pos: "TE2", slot: "SKL", name: "Mahmud Drozdov", kind: "M", diff: 14, pct: [62, 66, 68], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Ibroxhim Csonka", kind: "M", diff: 14, pct: null, ab: { osrPass: 6 }, elite: true },
      { pos: "LT", slot: "BLK", name: "Lyndon Swann", kind: "M", diff: 20, pct: null, ab: {  } },
      { pos: "LG", slot: "BLK", name: "Costas Papadopolous", kind: "M", diff: 16, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Gorky Gusev", kind: "M", diff: 19, pct: null, ab: { osrPass: 7 }, elite: true },
      { pos: "RG", slot: "BLK", name: "Karl Straussman", kind: "M", diff: 15, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Reginald Kamenev", kind: "M", diff: 18, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Chingiz Akayev", kind: "M", diff: 22, ab: {  } },
      { pos: "DE2", slot: "LINE", name: "Nurbek Beg", kind: "M", diff: 15, ab: {  } },
      { pos: "NT1", slot: "LINE", name: "Antonin Alexeev", kind: "M", diff: 18, ab: {  } },
      { pos: "NT2", slot: "LINE", name: "Hubert Winkler", kind: "M", diff: 13, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Bolot Mamytov", kind: "M", diff: 20, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "Devin Kunstler", kind: "M", diff: 16, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Michael Wimbush", kind: "M", diff: 13, ab: {  } },
      { pos: "OLB2", slot: "LB", name: "Eddie Fant", kind: "M", diff: 11, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Preston Hamms", kind: "M", diff: 20, ab: {  } },
      { pos: "CB2", slot: "DB", name: "Suleimon Plisk", kind: "M", diff: 16, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Timurbek Kasymov", kind: "M", diff: 12, ab: {  } },
      { pos: "CB4", slot: "DB", name: "Gopal Atta", kind: "M", diff: 10, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Sultan Orozov", kind: "M", diff: 22, ab: { intB: 8 }, elite: true },
      { pos: "FS1", slot: "DB", name: "Yajub Alimov", kind: "M", diff: 18, ab: {  } },
    ],
  },
  mumbai: {
    id: "mumbai", city: "Mumbai", name: "Federation of Scientists", conf: "THE HAVE NOTS · Plebian",
    color: "#0E7490", color2: "#D9D9D9", dark: "#04222B", glyph: "⚛️", logo: "/logos/MUMBAI.jpg", logoImg: false,
    ovr: 83, identity: "Peer-reviewed play-action. The results replicate.",
    tendency: { run: 0.35, deep: 0.36 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Srinivasa Bose", kind: "M", diff: 23, pct: [82, 57, 43], ab: { deadEye: 9 }, elite: true },
      { pos: "QB2", slot: "QB", name: "Satnam Virk", kind: "M", diff: 12, pct: [79, 51, 36], ab: {  } },
      { pos: "RB1", slot: "SKL", name: "Ashok Ghandi", kind: "M", diff: 19, pct: [52, 42, 20], ab: { osrRun: 7 }, elite: true },
      { pos: "WR1", slot: "SKL", name: "Gilgit Ramayya", kind: "M", diff: 17, pct: [88, 77, 66], ab: {  } },
      { pos: "WR2", slot: "SKL", name: "Ishant Kahn", kind: "M", diff: 13, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Varsha Dum", kind: "M", diff: 10, pct: [78, 66, 48], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Reza Khan", kind: "M", diff: 8, pct: null, ab: {  } },
      { pos: "LT", slot: "BLK", name: "Utkarsh Iqbal", kind: "M", diff: 15, pct: null, ab: {  } },
      { pos: "LG", slot: "BLK", name: "Sunjit Das", kind: "M", diff: 13, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Harmit Bhatt", kind: "M", diff: 11, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Upender Aurobindo", kind: "M", diff: 11, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Terrell Mitchum", kind: "M", diff: 13, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Harjinder O", kind: "M", diff: 16, ab: {  } },
      { pos: "DE2", slot: "LINE", name: "Naresh Arshdeep", kind: "M", diff: 11, ab: {  } },
      { pos: "NT1", slot: "LINE", name: "Gajraj Dev", kind: "M", diff: 13, ab: {  } },
      { pos: "NT2", slot: "LINE", name: "Suraj Joydeep", kind: "M", diff: 10, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Anoop Dharma", kind: "M", diff: 16, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "Indirpreet Ghosh", kind: "M", diff: 12, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Shad Yadav", kind: "M", diff: 10, ab: {  } },
      { pos: "OLB2", slot: "LB", name: "Manvinder Joshi", kind: "M", diff: 8, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Anil Bosle", kind: "M", diff: 15, ab: {  } },
      { pos: "CB2", slot: "DB", name: "Babu Kohli", kind: "M", diff: 16, ab: { intB: 7 }, elite: true },
      { pos: "CB3", slot: "DB", name: "Rohit Patel", kind: "M", diff: 10, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Puinit Agarwal", kind: "M", diff: 14, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Rajvir Arora", kind: "M", diff: 13, ab: {  } },
    ],
  },
  chicago: {
    id: "chicago", city: "Chicago", name: "Organized Labor", conf: "THE HAVE NOTS · Plebian",
    color: "#8A4B08", color2: "#D9D9D9", dark: "#291602", glyph: "⚒️", logo: "/logos/CHICAGO.jpg", logoImg: false,
    ovr: 87, identity: "The pass rush is unionized. Overtime rates apply.",
    tendency: { run: 0.6, deep: 0.22 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Quintavious Lawler", kind: "M", diff: 22, pct: [85, 61, 47], ab: {  } },
      { pos: "QB2", slot: "QB", name: "Brandon McQuarters", kind: "M", diff: 14, pct: [81, 55, 41], ab: {  } },
      { pos: "RB1", slot: "SKL", name: "Rodney Page", kind: "M", diff: 22, pct: [52, 42, 20], ab: { osrRun: 8 }, elite: true },
      { pos: "WR1", slot: "SKL", name: "Dick McMahon", kind: "M", diff: 20, pct: [88, 77, 66], ab: {  } },
      { pos: "WR2", slot: "SKL", name: "Mike Snead", kind: "M", diff: 15, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Carlos Peña", kind: "M", diff: 12, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "Chuck Bucks", kind: "M", diff: 16, pct: [66, 72, 74], ab: {  } },
      { pos: "TE2", slot: "SKL", name: "Robert Losman", kind: "M", diff: 12, pct: [62, 66, 68], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Brick O'Leary", kind: "M", diff: 9, pct: null, ab: {  } },
      { pos: "LT", slot: "BLK", name: "Isaac Times", kind: "M", diff: 18, pct: null, ab: {  } },
      { pos: "LG", slot: "BLK", name: "Saul Oshea", kind: "M", diff: 15, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Stavros Ypremian", kind: "M", diff: 13, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Trevor Lyle", kind: "M", diff: 13, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Philip Doggett", kind: "M", diff: 15, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Everett Gold", kind: "M", diff: 23, ab: { sackB: 8 }, elite: true },
      { pos: "DE2", slot: "LINE", name: "Rory Orr", kind: "M", diff: 17, ab: { sackB: 1 }, elite: true },
      { pos: "NT1", slot: "LINE", name: "Emerson Tynes", kind: "M", diff: 19, ab: { sackB: 1 }, elite: true },
      { pos: "NT2", slot: "LINE", name: "Ricardo Tyson", kind: "M", diff: 11, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Reginald Howzer", kind: "M", diff: 18, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "Olan Loomis", kind: "M", diff: 14, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Keith Stump", kind: "M", diff: 15, ab: { dsrRun: 6 }, elite: true },
      { pos: "OLB2", slot: "LB", name: "Jim Cork", kind: "M", diff: 10, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Orville Hilliard", kind: "M", diff: 18, ab: {  } },
      { pos: "CB2", slot: "DB", name: "Jason Greene", kind: "M", diff: 14, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Dexter Spellman", kind: "M", diff: 11, ab: {  } },
      { pos: "CB4", slot: "DB", name: "John St. Claire", kind: "M", diff: 9, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Wallis Overbay", kind: "M", diff: 16, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Antoine Steele", kind: "M", diff: 15, ab: {  } },
    ],
  },
  mexico: {
    id: "mexico", city: "Mexico City", name: "V2 Immortals", conf: "THE HAVE NOTS · Plebian",
    color: "#0F7B4A", color2: "#D9D9D9", dark: "#052316", glyph: "💀", logo: "/logos/MEXICO.jpg", logoImg: false,
    ovr: 89, identity: "They've died before. It didn't take.",
    tendency: { run: 0.4, deep: 0.33 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Sancho Zapata", kind: "M", diff: 23, pct: [86, 63, 49], ab: {  } },
      { pos: "QB2", slot: "QB", name: "Hidalgo Villa", kind: "M", diff: 18, pct: [82, 57, 43], ab: { osrPass: 7 }, elite: true },
      { pos: "RB1", slot: "SKL", name: "Pancho Sepulveda", kind: "M", diff: 22, pct: [52, 42, 20], ab: { osrPass: 9 }, elite: true },
      { pos: "WR1", slot: "SKL", name: "Leonel De La Cruz", kind: "M", diff: 21, pct: [88, 77, 66], ab: {  } },
      { pos: "WR2", slot: "SKL", name: "Ramon Arcega", kind: "M", diff: 16, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Tito Mora", kind: "M", diff: 13, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "Cortez Villapiano", kind: "M", diff: 17, pct: [66, 72, 74], ab: {  } },
      { pos: "TE2", slot: "SKL", name: "Antonio Cooper", kind: "M", diff: 13, pct: [62, 66, 68], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Diego Montoya", kind: "M", diff: 10, pct: null, ab: {  } },
      { pos: "LT", slot: "BLK", name: "Quinterrius Durie", kind: "M", diff: 22, pct: null, ab: { osrPass: 7 }, elite: true },
      { pos: "LG", slot: "BLK", name: "Esteban Luper", kind: "M", diff: 15, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Gonzalo Lopez", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Tobit Levenson", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Cruz Aguila", kind: "M", diff: 16, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Vicente Paz", kind: "M", diff: 20, ab: {  } },
      { pos: "DE2", slot: "LINE", name: "Octavio Guerra", kind: "M", diff: 14, ab: {  } },
      { pos: "NT1", slot: "LINE", name: "El Oso", kind: "M", diff: 20, ab: { bearhug: 1 }, elite: true },
      { pos: "NT2", slot: "LINE", name: "Carlos Trujillo", kind: "M", diff: 12, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Jorge Trigueros", kind: "M", diff: 19, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "Ricardo Gallo", kind: "M", diff: 15, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Andres Fajardo", kind: "M", diff: 12, ab: {  } },
      { pos: "OLB2", slot: "LB", name: "Lance Epps", kind: "M", diff: 10, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Luz Fuentes", kind: "F", diff: 22, ab: { intB: 9 }, elite: true },
      { pos: "CB2", slot: "DB", name: "Fabian Fantuz", kind: "M", diff: 15, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Cody Fera", kind: "M", diff: 12, ab: {  } },
      { pos: "CB4", slot: "DB", name: "Antonio Maldito", kind: "M", diff: 10, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Cid Quixote", kind: "M", diff: 17, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Enrique Fox", kind: "M", diff: 16, ab: {  } },
    ],
  },
  ny: {
    id: "ny", city: "New York", name: "Illuminati", conf: "THE HAVE NOTS · Prole",
    color: "#101010", color2: "#D9D9D9", dark: "#000000", glyph: "👁️", logo: "/logos/NY.jpg", logoImg: false,
    ovr: 80, identity: "The route tree is a pyramid. Wake up, sheeple.",
    tendency: { run: 0.35, deep: 0.36 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Tall Fellow", kind: "M", diff: 21, pct: [81, 54, 40], ab: { deadEye: 9 }, elite: true },
      { pos: "QB2", slot: "QB", name: "Mr. Cardholder", kind: "M", diff: 11, pct: [78, 48, 33], ab: {  } },
      { pos: "RB1", slot: "SKL", name: "The Larch", kind: "M", diff: 18, pct: [52, 42, 20], ab: { osrRun: 7 }, elite: true },
      { pos: "WR1", slot: "SKL", name: "Mr. Rose", kind: "M", diff: 20, pct: [88, 77, 66], ab: { quick: 1 }, elite: true },
      { pos: "WR2", slot: "SKL", name: "Mr. Peony", kind: "M", diff: 12, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Mr. Daffodil", kind: "M", diff: 9, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "John Doe", kind: "M", diff: 12, pct: [66, 72, 74], ab: {  } },
      { pos: "TE2", slot: "SKL", name: "Mr. Nametag", kind: "M", diff: 9, pct: [62, 66, 68], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Cerberus", kind: "M", diff: 11, pct: null, ab: { osrRun: 4 }, elite: true },
      { pos: "LT", slot: "BLK", name: "Mr. Amythest", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "LG", slot: "BLK", name: "Mr. Opal", kind: "M", diff: 11, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Mr. Lapis", kind: "M", diff: 10, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Mr. Quartz", kind: "M", diff: 10, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Mr. Granite", kind: "M", diff: 12, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Mr. Kraken", kind: "M", diff: 15, ab: {  } },
      { pos: "DE2", slot: "LINE", name: "St. George", kind: "M", diff: 10, ab: {  } },
      { pos: "NT1", slot: "LINE", name: "Mr. Zeus", kind: "M", diff: 16, ab: { sackB: 1 }, elite: true },
      { pos: "NT2", slot: "LINE", name: "Mr. Haphestos", kind: "M", diff: 9, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Mr. Medusa", kind: "M", diff: 14, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "Mr. Cygnus", kind: "M", diff: 11, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Mr. Saturn", kind: "M", diff: 9, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Ms. Minerva", kind: "F", diff: 14, ab: {  } },
      { pos: "CB2", slot: "DB", name: "Ms. Hera", kind: "F", diff: 11, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Ms. Persephone", kind: "F", diff: 8, ab: {  } },
      { pos: "CB4", slot: "DB", name: "Ms. Athena", kind: "F", diff: 7, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Mr. Minotaur", kind: "M", diff: 12, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Mr. Susano'o", kind: "M", diff: 12, ab: {  } },
    ],
  },
  ottowa: {
    id: "ottowa", city: "Ottawa", name: "Iron Maples", conf: "THE HAVE NOTS · Prole",
    color: "#A61C1C", color2: "#D9D9D9", dark: "#300808", glyph: "🍁", logo: "/logos/OTTOWA.jpg", logoImg: false,
    ovr: 88, identity: "Polite until the whistle. The whistle is a suggestion.",
    tendency: { run: 0.45, deep: 0.3 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Linus Fouts", kind: "M", diff: 23, pct: [85, 62, 48], ab: {  } },
      { pos: "QB2", slot: "QB", name: "Cornelius Patch", kind: "M", diff: 14, pct: [82, 56, 42], ab: {  } },
      { pos: "RB1", slot: "SKL", name: "Louis De La Croix", kind: "M", diff: 18, pct: [52, 42, 20], ab: {  } },
      { pos: "WR1", slot: "SKL", name: "R.J. McMichael", kind: "M", diff: 21, pct: [88, 77, 66], ab: {  } },
      { pos: "WR2", slot: "SKL", name: "Brayden Hill", kind: "M", diff: 16, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Cameron Lye", kind: "M", diff: 13, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "Marcus Stave", kind: "M", diff: 17, pct: [66, 72, 74], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Omar Mung", kind: "M", diff: 14, pct: null, ab: { osrRun: 4 }, elite: true },
      { pos: "LT", slot: "BLK", name: "Eleanor Motch", kind: "M", diff: 22, pct: null, ab: { osrPass: 8 }, elite: true },
      { pos: "LG", slot: "BLK", name: "Remy LeFleur", kind: "M", diff: 19, pct: null, ab: { osrRun: 4 }, elite: true },
      { pos: "C", slot: "BLK", name: "Boodro Brown", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Wes Webb", kind: "M", diff: 14, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Marvin Harper", kind: "M", diff: 16, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Kenny Edmonds", kind: "M", diff: 20, ab: {  } },
      { pos: "DE2", slot: "LINE", name: "Gary White", kind: "M", diff: 14, ab: {  } },
      { pos: "NT1", slot: "LINE", name: "Dennis Beauchamp", kind: "M", diff: 16, ab: {  } },
      { pos: "NT2", slot: "LINE", name: "Frank Chateau", kind: "M", diff: 12, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Hal Horton", kind: "M", diff: 19, ab: {  } },
      { pos: "ILB2", slot: "LB", name: "Ralph Burson", kind: "M", diff: 15, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Walter McLaren", kind: "M", diff: 12, ab: {  } },
      { pos: "OLB2", slot: "LB", name: "P.T. Thrush", kind: "M", diff: 10, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Lucien LaFlamme", kind: "M", diff: 22, ab: { intB: 9 }, elite: true },
      { pos: "CB2", slot: "DB", name: "Olivier Theroux", kind: "M", diff: 15, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Carles DuPlessy", kind: "M", diff: 12, ab: {  } },
      { pos: "CB4", slot: "DB", name: "Herman Duquesne", kind: "M", diff: 10, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Clovis Gagnon", kind: "M", diff: 17, ab: {  } },
      { pos: "FS1", slot: "DB", name: "Logan Cote", kind: "M", diff: 16, ab: {  } },
    ],
  },
  moscow: {
    id: "moscow", city: "Moscow", name: "Atomic Energy Federation", conf: "THE HAVE NOTS · Prole",
    color: "#B8860B", color2: "#D9D9D9", dark: "#111111", glyph: "☢️", logo: "/logos/MOSCOW.jpg", logoImg: false,
    ovr: 75, identity: "Half-life of a lead: two drives.",
    tendency: { run: 0.5, deep: 0.28 },
    offense: [
      { pos: "QB1", slot: "QB", name: "Feodor Stalin", kind: "M", diff: 14, pct: [78, 49, 34], ab: {  } },
      { pos: "QB2", slot: "QB", name: "Ekaterina Romanov", kind: "F", diff: 13, pct: [75, 44, 28], ab: { thread: 1 }, elite: true },
      { pos: "RB1", slot: "SKL", name: "Oleg Zolotov", kind: "M", diff: 11, pct: [52, 42, 20], ab: {  } },
      { pos: "WR1", slot: "SKL", name: "Anatoli Orlov", kind: "M", diff: 13, pct: [88, 77, 66], ab: {  } },
      { pos: "WR2", slot: "SKL", name: "Pyotor Biandov", kind: "M", diff: 10, pct: [80, 72, 55], ab: {  } },
      { pos: "WR3", slot: "SKL", name: "Arseni Sokolov", kind: "M", diff: 8, pct: [78, 66, 48], ab: {  } },
      { pos: "TE1", slot: "SKL", name: "Lev Ivanov", kind: "M", diff: 14, pct: [66, 72, 74], ab: { blockGo: 1 }, elite: true },
      { pos: "TE2", slot: "SKL", name: "Spiridon Chernov", kind: "M", diff: 8, pct: [62, 66, 68], ab: {  } },
      { pos: "FB1", slot: "BLK", name: "Nikita Sorokin", kind: "M", diff: 6, pct: null, ab: {  } },
      { pos: "LT", slot: "BLK", name: "Vadim Nikolaev", kind: "M", diff: 15, pct: null, ab: { osrPass: 8 }, elite: true },
      { pos: "LG", slot: "BLK", name: "Jamari Glenn", kind: "M", diff: 9, pct: null, ab: {  } },
      { pos: "C", slot: "BLK", name: "Timofei Plotnikov", kind: "M", diff: 8, pct: null, ab: {  } },
      { pos: "RG", slot: "BLK", name: "Vaslav Plotnikov", kind: "M", diff: 8, pct: null, ab: {  } },
      { pos: "RT", slot: "BLK", name: "Ruslan Morozov", kind: "M", diff: 10, pct: null, ab: {  } },
    ],
    defense: [
      { pos: "DE1", slot: "LINE", name: "Sasha Gorky", kind: "M", diff: 12, ab: {  } },
      { pos: "DE2", slot: "LINE", name: "Kiril Drozdov", kind: "M", diff: 8, ab: {  } },
      { pos: "NT1", slot: "LINE", name: "Ivan 'The Terror'", kind: "M", diff: 10, ab: {  } },
      { pos: "NT2", slot: "LINE", name: "Mikhail Nym", kind: "M", diff: 7, ab: {  } },
      { pos: "ILB1", slot: "LB", name: "Semyon Prostakov", kind: "M", diff: 15, ab: { dsrRun: 4 }, elite: true },
      { pos: "ILB2", slot: "LB", name: "Fyodor Lagunov", kind: "M", diff: 9, ab: {  } },
      { pos: "OLB1", slot: "LB", name: "Eitan Popov", kind: "M", diff: 7, ab: {  } },
      { pos: "OLB2", slot: "LB", name: "Artur Sobolev", kind: "M", diff: 6, ab: {  } },
      { pos: "CB1", slot: "DB", name: "Leonid Rasputin", kind: "M", diff: 11, ab: {  } },
      { pos: "CB2", slot: "DB", name: "Kazimir Golubev", kind: "M", diff: 9, ab: {  } },
      { pos: "CB3", slot: "DB", name: "Foka Kozlov", kind: "M", diff: 7, ab: {  } },
      { pos: "SS1", slot: "DB", name: "Vasily Molotov", kind: "M", diff: 14, ab: { dsrPass: 4 }, elite: true },
      { pos: "FS1", slot: "DB", name: "Nikolai Medvedev", kind: "M", diff: 10, ab: {  } },
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
const COMING_SOON = []; // all teams activated

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
  PEN: { bg: "#E6C229", fg: "#3A2E03", edge: "#A8890F", shape: "d20", label: "PENALTY d20" },
};
function Die({ kind, val, sub, i = 0 }) {
  const s = DIE_STYLE[kind] || DIE_STYLE.OSD;
  const sz = 46, diamond = s.shape === "d8" || s.shape === "d20";
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
/* ============================================================
   CUSTOMER BUTTCHEEKS · 32-BIT RUN / THROW / CATCH ACTION SPRITES
   (integrated from cb_action_sprites_dropin_snippet.jsx in the project folder)

   ATLAS v2 (CB_action_atlas_v2_field_ready_package): 784x2352
   TRANSPARENT, 8 frames x 24 team rows @ 98px — run 0-3, throw 4-5,
   catch 6-7. All 24 teams present; background alpha verified, so the
   same art now runs on cards AND floats directly on the field.
   Embedded below at FULL resolution (98px frames) for sheet-quality
   art on cards and field alike. PC build: the same PNG can be served
   from /public/sprites/ with identical geometry.
   ============================================================ */
const CB_ACTION_SPRITE_SHEET = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAxAAAAkwCAMAAAAj+ym3AAADAFBMVEUAAAAFBggAAADp6unY2NimZTxpPCZ7PhXPpSkUFRQeOZJRGnByFBQXKm2WeBzisTxJSUn5CAcOc487KUy3czJafiqNGhoOekl6H6GzICu3hQsw0SulGxvAOSuyRgA6fNeJSgjYKnnWiz03NzcsHjg3FU+PKiCJZAiGNQALWzYKV2xDXiCGGCG6BgUkmyCKViYsXaKiIFuatDuNe8LFxcUvCgv///8kJCYsFweZmZoOFy00Kgy1trYPJRD///+GhodZWlulpaZ1dXYpCytoaGm6lShKNxOshydRFREWCiEHIi0RJkxyWhVVRRSHdrkpTsboKDD/2jTFmixvRg5ICwxsJw4VNlQ1NBRvHJR+f4CYeCiLojavNCcSnMIUpmNROGdPqP9A/zplKJB6qzqkKdq6ZQr/OqT/TDrxXwD4m0T4tA5NKQg9OExPRm4JNClRZyQyabWmHikSRhIbMnmIHU4Na4UKRixeX2BMEi5BF1pvRyFmWYxxhC2OBwcKRVUuyCk2SBtyWyFtBwiKZycpsiYlTIIdfBw/QEB3aKO5JWiidgvZCAcpVpUPNxAjR3oQHUUghx54YhoNZX6bIFl4GUZ8YyQWVBV3GCoLTmE1b8BCO1xGUh9yY5yBlzO/v8CCKB8oqSQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAecMSQAAAA4HRSTlMA/1r///////////////////////////////////////////////////////////////////+M/////////3j//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4gh30AAQAASURBVHja7P0Lr13Hdt+JrrE11+HepEgRoiTQIEiCpKQWjgBJByIXKUqinraPpMQHpxvHj8CGn/ADSboN20HHDpB0kKS7A3Sn0+97Ly7uvR/1rvmqWY9RNUeNx9prUVUHlsjtrfrPMap+Y9Rr1txsWmmllVZaaaWVVlpppZVWWmmllVZaaaWVVlpppZWXt8BYmiNaacXh0JBopZURhytjaUi00nhwOExINJe08uMGogfhleF/AxHH/8RdX+AlkDGVsH/+U1GomhFM+cEBcexE9GaNXjJNZgeQMZWwf/4TUsgDgQDXA/Hwlbk8PHIgBqvOByvOwbavGsuYStg//0kpTFx1UR04cAMQLkMcORCDj84nL52fWxFxABlTCfvnPy0FFIgscAMRDwcgHh4/D+fnnpcGP52kjKmE/fOfmAIGRB64cZXpYV+OfJVpdpLnpXOb4G0tYyph//xUBf7elq4NCBAl4E5mH2J2ku+lcwsgzGVMJeyfn6Yg2e7VtWEBAmjAAZzCXrVz0mzF+E/90Yy5jKmE/fOTFERhVtkGDwggAedgSCbiDYgGBEtBtt2rDsRctkCpf/972+PPEIsRoRVWoxk7GVMJ++enKIBou1fbBh8IWAei56EB0YBQUwA3XGJu9xrY0PfxofRVlOsHAO93j3rNNVdOTMZUwv751xRgAoK/3WtgAyxErAABwa8eORCvpMUCCGMZUwn7519RmAYcku1eCxv8FFECDi4jQbCAb0CcBBBTdxJt97JsWOlRXtyHUv2XkSCgAfHSAjF3J9F2L8OG9S7lR/58/T4PcEAY0MNW6//pT9JicarCWsZUwv758woQxmHBPkSdDb7YhpYjVoGw58Ff+2ICgVuh/pjWMqYS9s9f6E5brwimwlQb3LTF2/TY0FIEDpw9D+7AuY8fD4hNxgp9cM1lTCXsnz/bnVAawMgGX8Jb493QiFhB2u4Ytdsz99zFAQKyWOunMVsZU4kDPT8ORIiDgUIM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";

const CB_ACTION_ATLAS = {
  frameW: 98,
  frameH: 98,
  cols: 8,
  rows: 24,
  sheetW: 784,
  sheetH: 2352,
  actionStart: { run: 0, throw: 4, catch: 6 },
  actionFrames: { run: 4, throw: 2, catch: 2 },
};

const CB_TEAM_ACTION_ROWS = {
  la: 0, rome: 1, un: 2, estes: 3,
  dc: 4, london: 5, inca: 6, tokyo: 7,
  sf: 8, paris: 9, cairo: 10, sydney: 11,
  munich: 12, bangkok: 13, tashkent: 14, saigon: 15,
  mumbai: 16, miami: 17, mexico: 18, chicago: 19,
  assam: 20, moscow: 21, ottowa: 22, ny: 23,
  // Friendly aliases (from the v2 drop-in).
  ottawa: 22, chicagoland: 19, mexico_city: 18, mexicocity: 18, sfk: 8,
};

function actionForCard(card) {
  if (!card || !card.pos) return "run";
  if (String(card.pos).startsWith("QB")) return "throw";
  if (String(card.pos).startsWith("WR") || String(card.pos).startsWith("TE")) return "catch";
  if (String(card.pos).startsWith("RB") || String(card.pos).startsWith("FB")) return "run";
  return "run";
}

function TeamActionSprite({ teamId, card, action, frame = 0, size = 1, animate = false, speed = 450, className = "", style = {} }) {
  const key = String(teamId || "la").toLowerCase();
  const row = CB_TEAM_ACTION_ROWS[key];
  const selectedAction = action || actionForCard(card);
  const nFrames = CB_ACTION_ATLAS.actionFrames[selectedAction] || 4;
  const startCol = CB_ACTION_ATLAS.actionStart[selectedAction] ?? 0;
  const [tick, setTick] = useState(frame);
  useEffect(() => {
    if (!animate) { setTick(frame); return; }
    const id = setInterval(() => setTick((n) => n + 1), speed);
    return () => clearInterval(id);
  }, [animate, frame, speed]);
  if (row == null) {
    // Unknown team id — crest fallback (all 24 league teams have rows).
    return <Crest t={TEAMS[key] || TEAMS.la} size={40 * size} />;
  }
  const activeFrame = animate ? tick : frame;
  const col = startCol + (activeFrame % nFrames);
  const scale = 0.72 * size;
  return (
    <span
      aria-hidden="true"
      title={`${key} ${selectedAction} frame ${activeFrame % nFrames}`}
      className={`cb-action-sprite ${className}`}
      style={{
        display: "inline-block",
        width: CB_ACTION_ATLAS.frameW * scale,
        height: CB_ACTION_ATLAS.frameH * scale,
        backgroundImage: `url(${CB_ACTION_SPRITE_SHEET})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${CB_ACTION_ATLAS.sheetW * scale}px ${CB_ACTION_ATLAS.sheetH * scale}px`,
        backgroundPosition: `-${col * CB_ACTION_ATLAS.frameW * scale}px -${row * CB_ACTION_ATLAS.frameH * scale}px`,
        filter: "drop-shadow(0 3px 5px #00000088)",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

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
          <TeamActionSprite teamId={teamId} card={card} size={size} animate />
          <div style={{ position: "absolute", bottom: 3, right: 6, fontSize: 12 * size, color: t.color2, opacity: 0.8 }}>{t.glyph}</div>
          {roleTag && <div style={{ position: "absolute", top: 3, left: 5, fontSize: 7.5 * size, fontFamily: "Impact, sans-serif", letterSpacing: 1, background: "#000A", color: "#FFE28A", padding: "2px 5px", borderRadius: 4 }}>{roleTag}</div>}
          {card.kind && <div title={{ M: "Male", F: "Female", BOT: "Robot", SIM: "Simulacrum" }[card.kind]} style={{ position: "absolute", top: 3, right: 4, width: 15 * size, height: 15 * size, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5 * size, background: { M: "#3E6D8E", F: "#B03A6E", BOT: "#5A5F66", SIM: "#6C4FA0" }[card.kind], color: "#fff", border: "1px solid #ffffff55", fontFamily: "Verdana, sans-serif" }}>{{ M: "♂", F: "♀", BOT: "⚙", SIM: "◈" }[card.kind]}</div>}
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
    ["p", "UNIQUE PLAYERS exist: Miami's Sample Wong does not throw — Project Wiselake, the brain in the lake, DROPS the ball out of the sky. His passes cannot be intercepted on the outcome die, defenders can't read the trajectory, and his deep ball (82%) is the finest in the league. His short game is, charitably, experimental."],
    ["p", "The corner badge tells you WHO is under the helmet: ♂ male, ♀ female, ⚙ Robot, ◈ Simulacrum. Men, women, robots, and simulacra are ALL eligible — it is the law of the league."],
    ["b", "Every snap, both sides secretly commit exactly three cards."],
    ["p", "ON OFFENSE: a Blocker (any lineman or fullback) + a Quarterback + a Skill player (QB, RB, WR, or TE — your ball carrier or target). Then call your play: RUN, or PASS at 10m / 20m / 20+ depth."],
    ["p", "ON DEFENSE: a Lineman (DE/NT) + a Linebacker (OLB/ILB) + a Back (CB/SS/FS). Guess run and stack the box — or guess wrong and watch the highlight from the ground."],
    ["p", "⭐ Green-framed SUPERSTARS are your elites — the biggest differentials and signature abilities. The machine studies your habits, so don't get predictable."],
  ]},
  { id: "dice", label: "The Dice", body: [
    ["p", "YOU roll your own dice: after the snap, tap your glowing die — the white OSD on offense, the red DSD on defense — and tap your outcome dice too (orange RUN, blue PASS, green CATCH on offense; the dark-red DEFENSE die when you hold the wall). The machine rolls its dice itself, instantly, because it is a machine."],
    ["p", "THE YELLOW d20: before kickoff each coach rolls a yellow d20 to set their secret PENALTY NUMBER. Every snap, both sidelines roll yellow d20s — if either lands on either number, laundry flies: offense flags kill the play and cost meters; defense flags hand over free meters (Pass Interference is an automatic first down)."],
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
      <a href="https://a.co/d/0c1A8XNp" target="_blank" rel="noopener noreferrer" aria-label="Buy the book" style={{
        position: "fixed", bottom: 24, right: 82, zIndex: 60, textDecoration: "none",
        display: "flex", alignItems: "center", gap: 7, padding: "9px 14px 9px 11px", borderRadius: 24,
        background: "linear-gradient(180deg,#FFD86B,#C89019)", border: "2px solid #FFEBAE",
        boxShadow: "0 4px 0 #7A5608, 0 8px 20px #000A",
      }} className="cb-bookfab">
        <span style={{ fontSize: 18, lineHeight: 1 }}>📖</span>
        <span style={{ fontFamily: "Impact, sans-serif", fontSize: 13, letterSpacing: 1, color: "#3A2703", textShadow: "0 1px 0 #FFEFC0", whiteSpace: "nowrap" }}>BUY THE BOOK!</span>
      </a>
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

/* ---------- GAME LOGO (embedded) ---------- */
const LOGO = "data:image/jpeg;base64,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";

/* ---------- YOUR TEAM LOGOS GO HERE ----------
   Two ways to show real team logos instead of glyphs:
   A) IN THIS ARTIFACT: convert a logo to base64 (search "png to base64"),
      then paste it below as  estes: "data:image/png;base64,AAAA...",
   B) ON THE PC BUILD: put the .jpg/.png files in public/logos/ and set
      logoImg: true on the team (paths are already wired, e.g. /logos/ESTES.jpg).
   Crests everywhere (scoreboard, select, coming-soon) update automatically. */
const TEAM_LOGO_OVERRIDES = {
  estes: "data:image/jpeg;base64,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",
  london: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCABgAGADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDrqKKK/Lj3wooooAKKK8o8T+Idfs9bvbMalMiRSkIIwF+U8joPQiu7A4GeMm4QaVtdTKrVVJXZ6vRXiA8Ra3nI1a9z/wBdjXqngyW6uPDlrcX1y9xNNufe/UDJAH6V0Y7KZ4OmqkpJ3diKWIVSVkjboooryToCiiigAooooAKKKKACvHPHxB8WX2PVP/QBXb/ETW7nStOhgsmaOW6LAyr1RRjOPc5rzuaXTrzZPcSXcVxsVZFSNXDlRjcCWGMgDgjrX1GQ4WdP/aZbNNL7/wDgHDi6ifuLoZle0+CwR4V0zII/c9x7mvKbPM04g0bT3lnPR5B5rj3AxtX64P1r0Dwd4Xv9NuzqOqXj+e6kGBZCw57uehPsK6s9dOdC05crWqXV/L9TPCXU7pXOwooor409IKKKKACiiigAooooAyNdtY9Xkg0aPTRqN3ODKkTSeWsSrwZGfqo5xxyelYo8E2WlalBZ69o3lvc5+zSxXjywyMBkp0BDY5wetdNBfNoHiRdYktprizmtfs1x5Cb3hw25XC9SvJBxz0NL4l1mDxhPYWmnwXQ0+1n+0z3UsbwFmCkKiZw2ctye2K+swcaEMtclUaeuzej9L/8ADnn1XN17ct/kVdItb65+0QeFNHsxaWzmKSeaXyUeQdVXAJbHQk8ZqzYXkk8lxbXds9pe2rhLi3chthIyCCOCpHINSeFPEVt4TsJNH1eC7WKKaR7W5hgeZZkdi2DtBIcEkc9etQwTy6preo61LbSWsd0scUEMow/loD8zDsSWPHYYrDH4TBRwSqwleWmt9X3/AK6FUalV1eVrQu0UUV80dwUUUUAFFFFABQeAeM+1I7bUZuuATXGw+P7f/hGRrE9k6ySXDW8NrG+4yMAD1xwOfSt6OGq1v4avql9//DEynGO7G+JfHX9n77Wys547wcFrqPaE9wM/N/Kue8PeJfE19rMMcNzJeb3HmRSAFAueSSB8ox3rpNM8WLqGo/2V4k0Q2Fw0ZlhWdd6uoBJ6jg4B/Kq/hvxvBeatbWMeifYrO9dltpkIG8r6gAD246V71OKo0JRWGTaV220111X3PRdjkb5pJ85zuqeKfE9nqkq3N3LayI5/cBQEA7YGOR711vhrxsuq7LaaxuGvOhNsm5D7nn5fxrJbx8LuGS5vfC7z6fBL5clwCJAh/Fcdx3Fauo+MLeymtLHw3pZ1G5uYVnWKAbFVCMgnA64/KniYKpTVN4ZKXdNJK3dr8mKD5W2p6HYUVxsfxAtD4fvNQms5YruzkWKWzZuQ7ZA5x04PbIxV/wAI+KH1+S8trqwaxvLQrviLbgQenbrXiTwOIhCU5Rso77eX+a1OpVYNpJ7nR0UUVyGgUUUUAIyhlKnoQRXmkXgTW49IkshPbLLZXn2mwkB4kJ+8G9PuoRnvmvTKK6sNjKuHvyW1t+H/AA7RnOlGe5wlroHiLV9aTVvEn2WFrW3eO3ggI+ZmUjJwTgZOetVdC8H6vZXPhuSeOELp80rz4lBwGbIx616LRW/9p1rOKSSta1ttGtPvZPsI7/1/Wh5lbeFfFcOj3GjQfYobW9nZ7iRpAxCnbjGPp0xWhdeFNX0PUbTUvCzQTyR2i2s0NzgbwABu6jrgHGeMV3tFVLNa8neys73VtHfuJYeC7nmtz4I1m50LUpLh4JdX1G6jmkRXCoiruOM9M5auh8NaHfad4k1m/uljEF2EERVwScdcjtXU0VnUzGtUhKErWf8AwP8AJDjQjFpr+v6uFFFFcBsFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf/9k=",
  miami: "data:image/jpeg;base64,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",
  assam: "data:image/jpeg;base64,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",
  LA: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCABgAGADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCnRRRQMKKKWgBKKz11e3N29syTI6IzEuuM7eoXn5j9KjTxBYOsZUzfO4UDyjn+Hn6fMv50AalFY/8AwkNs0iGMMLf955krqRtCgcgd85xVy31WyuXijimzJKm9F2kHHvxx0NAFyioDe2onaA3EYlXG5S3TPTPv7VPQAUUUUAFRz+b5L/Zwhl2nYHzgn3xUlFAHLtq+oXlrAmnbmusF5wFBKtkjbjoADjrzg1p6RZXVtdXs0zEJM2VR33nOTzn07AelaUUUcKbIkVF9FGKfQBirodpbGO4uLgo0Ts3mDagy3UEnPHaqd3p+jRIZVvIhBCpbyY5VLthR0O7OflGPpWvrUYuLQ2xOA/zMfQAj+pFQ6lDA2h3jm3hWQW8gbEajDAEHt6igRBHBoFxaoQ1uiSISFNxgqGwSPvcdBVy1061+1JexTyTFFKxnzQyqMYIGOv4mo7CGBdFtHFvCZGgjC5jU5YgAdvU1LosYt7QWw6R8qT3Uk/1zQMqR6fNZO6xxLcwzXZuG5w2cZUHPHBHX9Kihmv21WdLi5EO6VlhQnhUXnO3GGDA9c8Gt+mSwxTBRNGrhTkBhnFAElJS0lABRRRQAUUUUAYmqavaWclwl2ZY5G2qmYmwVBByD065/KkuL+C+0vVZLQSmFrd2DtGVG7aQQM9egNal/dwWVv510WEe4Lwhbk+w+lc9reupdW7W1jMqRyIVkaWCTOCMYAC/rQIvRX8Fhp2lyXYlWFYFbesZYbtoABx06k0aVq9peSW6WnmyOAyyYiYAKcnJPTrj86paLryW1utvfzK6RoFjaKCTOAMYIK/rW/p99b38LSWhYorbTuQrz9DQBZooooGFFFFABRRRQAUUUUAIw3KynIBBHBxXE3vlW1zcRL9qYRSSICbt+dse6u3rhdX/5CF9/13n/APRBoESWYiuLyCBjdKJZEQkXb8bo91dsowoGScDHJrh9JBOq2WB0uIv/AESK7igAooooGFFFFABRRijFAAKKKKACuJvoXudYuYIsb5LqZFycDJhwK7aq1tYxW09zMpLNcSeY24D5TjHFAEOj6cthACc+dIkfm/NkblUDir9FFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQACiiigD//2Q==",
  Rome: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCABgAGADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDz6iiiuE+sCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKUgjGQRnpSUAFFFFABRRRQAUUUUAFWNPlhhvYZLlS0St82BkjjqB3x1/Cq9PhkMT7gqtwQQ4yDkVMldNCext2MM8N/blrlbi3eKfyplYkH5DnOeQQcZB6VFatBNbAttmubS1lk3kcMcrtBz97bkn/wDVVKDUJbdk8pIwqB9qEEjLjDHr1xxVaCV4JBJE21hkevHQg+oxWPspPV/1v/mTysvaOzXWpQ21wzSRTtskDHPBHX2I659q0dNBNvppLiRUS4LQdTOob7oHQ8f/AFqzbe6s0hcGCWG4II8yFwQQeow33fqKg+3TKlqse2M2rFomX7wJOeT9aU4Sm9NP+Gf+YnFsrUVJcSmeZ5SiIXYsVQYUE+g7VHXQjQKKKKYBRRRQAVqabbNcWEhhtoprgXMaoHA5BVsjr7CsurMd0I7CS3CsHaZJRIGxtKgj+v6VnUTa0FK9tC5cW9rGt/d2w8yCO4ENurZI5BOT64A4z+NQWsa3kF2GVVlhhMyuoAyFIyDj2P6U651IXDTF4cLcBWnUN1kH8a+hOTke5qutwsUEsVuGBmXa7sRnbnOBj1IGfpURUra76EpOxbvrWN4LOeBFjDDypgvQOoBLfipz+BpNSt4zqiRW8QSNoo3CqOxQMfx61C18RFdQxpiKcqcMclSoxkfUEj6Glu7yOdiwjdW8hIQdwP3QAT07gURjNP8AryBJi6xAsVykkUXlRXESypHjGzPBX8GBqjVmS5WSwhtmQl4pGZXz/C2Mrj6jP4mq1aQTUbMpbBRRRVjCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9k=",
  "The UN": "data:image/jpeg;base64,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",
  DC: "data:image/jpeg;base64,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",
  "Incan Empire": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCABgAGADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDw2iitXwzb6ddazDDq8hjtXDBmDbecHbzg98CpnLli5PoNK5lUV6LceEvD76p9ktricFrcDbv3GKViNpY7cYwR9c8HtSW/h/wvJp32iWK+jkWBpJEWYHDKhYqOOvH6jNcf1+na9n9xXs2ed0V3CeGdLF5pHyXMsF0DDMu/awl2BlI+XgNnoR261p23hnwjPeRW6yXe+aMNGrTY3fOyHHHONpz+GKcsfTj0f3f12BU2zzSivRIvD3hiYwG2W6uFmu3gjaO4GGAUsD93Oc8U7/hGvDLTBoVvZIjCrjMwVfvsCc4zwFP6etL6/TXR/cHs2ec0V6JJ4c8NwWE00kF8ZIluCB5wG7yucEY4JyP19qWHQPCs0ulIkV9nUSSv+kDCKOueOTkjA9jR9fp72f8AXz8g9mzzqit/xdYabYXFmNKW4WOa2ErLM4YglmGOntWBXXTmqkVJEtWdgqW2na2uI5kVGKMG2uuVPsR3FRUVbVxHQjxddgy/6Dp22VVRl+z8bVxgdemVB/AUDxXqkoeGOG0JnkclUthli7KSB9doXHpxXPqpZgqgkk4AHeuujsYfDkgkhWS61SMmPzdyrFbyYwSozuYqc4JwMjPPFZRwlNvSJXMzTNx4njYSf2bo6hGQPIfL2xNGMKjMX+VlBHy9apA62L6G7SPQpjBH5agTweWnzl843DDbiTmsePTLhdolngtA54Dkl2z3PcfpWffPdWt3JA9wS0bbSUbANU8FSgruIczOhbUNb0K1hd9LsPIWQOtysKyIWGcfOpIyM/XFUF8VXgdGaz05wiKiq9qpAAJPA9yxJ9ah0/X5rIll3BjwwQgB19HBBDj2at6wltNRjlU6baQwyQzGRxaKrDbGzbgcnGCAeAB270PCUndpJi5mYT+J9Se0vIHaFmvGYzTGIeYdxywB7A/y46UyXxBcv9jIgtENqxZSkIG8nGd3rnArIoqVQpraIczL2sarc6vdi4uvLBVAiJGm1UUdAB+f51RoorSMVFWWwtwooopgX9Esmv8AUoYQQsYPmSuW2hI15Zie2ADW9rcceoXd1cwBXkurh5Y9oESxKe7epwBn0JPesbw7fw2N64utwtriFoJWQZZFb+IDvggHHfGO9d2ugKmn3FzJdPLJ5DTFLO2M2IkHDb2ZQFOQwGDwfY41pcmrkF2cYL5rcSWmonz0dvMdgc+ZxwOgNVbXTBdxNJ9ogi7gvIMfQ9wfwq/rWnRWzJc2sv2mGRIdwaLaQ7ruZT6YPGe/Wsa6tvI2sGBR2YL64BxSjKDu0ro0qqorKfbS/YZcwPbTvDJjcpxwcg/StzTLxtPvGgnk8ueEgQXBGRGcfdYdCpBwQevesq1uYIWWaWNp5lA2K3CDHTPc/TirekBr66vWuMuHgdpD79Qfzq6dr2XUzNK70SHUsNYw/Yr9yf8AQy2Ypm7iJjyG9Ebr2J6Vy7qyMVcFWBwQRgg10VjqKvpMMF2dyed5LHuqkZVh7g07xPbtcWialPgXqTfZbsjpM23cso9yv3vcZ71NSCSUo7Ac1RRRWQBRRRQAV0/hTxHrto39maYI7kTgxpFMoO0Z3EBiRhTg5GcdfrXMVNaXM1ncxXNtIY5omDI47EUAehT2McbSWMSbWZAYo5ZBhV2h8B2wGC/MA3cDjNcRbxpLfrHeBvJgRt4HBwoJx+J/nXQyarpWtiO6u9TudJvUAEii3+0Rvjp5fOUH+wcgdqp+INNg0pbsQTyXPnLbyJcSLtZ0kTfnGTjnj8KdGnGDdnvqdOIxMq6gmvhVjm5X8yRn2hcnO1RwPat3w3cxQuYVAJdHedyOigHAH9ayLOyur6XyrK2muJP7sSFj+lbEWiT2Uci6neWenBwA4kl3y7fQRpkj8cVdOfJLmOYwkDyMsUYZizDai8kntgetb3iqcxLBpjMDNCzzXe05AmfAKe+xVVfruqMarZaUpXQY5TckYOoXAAkX18tBkJ9clvQisMkk5PWou7WASiiikAUUUUAFaFpoupXtlLeWtlNLbxZ3yKuQMDJ+tZ9dz4M12zsdMEN5eRQLDMJSjKxdwN2QoAwSdwAyRjnNYYipOnDmgrsqKTepzs/hnW4IYp5NOn8qUqI3UBgxbp09a6o2eoy6dYW934Ymu9Ts4WiQyTDyniVvlLIpBZl3YxnGCM5qzb63YxaVHbtq1khWLy1CeaxYmRSMgphFAB3YyfSlGs6a00LHWbQSbZt/+t2KsigZzsyXJGcY6d81xfW8R/L36P5F8ke5g6nB4wkihhuILiC1nYJFDAFihJPQYTC/nWJPoWqwG7EtjMps1Vrgbf8AVhuQT7V2jaxpyaZHby6pZyS+QlvEE8xlVhJvEjZUbQBjOMnPsKlj1HTPt1/PJrVkyXki+ZGWk2hChRx/q8kgHjnHXNP63XV7x/B91+lw5I9zi5fDGtRWRvX0+X7MI/NMgII2evB6VkV3mo6nZw+GpLCDV7efFiIdkYcGRxKpU8qAPkByM/nXB114epUqJuatrpo1+ZEklsFFFFdBIUUUUAFFFFAHeab4P0q/0KHUFnvo3EfmT7tvlgDqA2OCe3U57VNdeEfDsE8cX2rUizSNGR8nBEYf09x+tcjeazJc2FrZrawQrbtvDx78u2AMkFiP4R0A6VoHxhcsbcPYWLRwg/IRJhmKhdxO7P3VAxnGO1ebKlib3UnbXTT5Gl49jTvfC2iwahpsS3t2IJ45HlZ9ucLwu36nse1O0/wdYN9qhv7q6E0Ny8IaNQFCgcN3JzxwPX61nDxnMsiyLpVgGUSAENNn5xhufM6EE8dOaRfGdwkqSxaXpySxqBG4EhKlQAp5cgkYGM57elJwxfLa7/DuO8DmaSlJJOT1NJXpmQUUUUAf/9k=",
  Cairo: "data:image/jpeg;base64,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",
  Paris: "data:image/jpeg;base64,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",
  Munich: "data:image/jpeg;base64,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",
  Saigon: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCABgAGADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDkbiYQDjlj0FZzK1w20guzH8c01JGuWyMs7HGO+andhCpjjILkYdx/If1PevNSsfZTqdvh/L/gfl+VKcC1BhjO5mGHkHcf3R7evr9KdAv2wBHOJF4Vz/EP7p/ofwqxFbfaTtPCjqfSklgMB2Ecdj61ftNDL6pZ8z2CMtA/ygqV4wa0oJVmG7uOq+lUlIuAFY4mHCsf4/Y+/oartO1s2Rw442n+tQ1fY2hU6y+Ff1f/ACNO4mEA4wWPQVnMrXL7SCzMaSORrl8jLOxxjvUzssSmOMgseHcd/Ye386ErCnU7fD+X/A/IpT4tlMMZ3Fh88g/i9h7fzp0K/bcI5xKvCuf4x6H39DViO2Nydp4Xu3pTXhMB8sjp096v2mhj9Vs+boLCzW7jYMEcEGtOGRZl3D8vSqIP2kBWP74cKT/H7H396g+0NatuH3um09/rUNXN6dTrL4V/VyDzPsmUiIMp4kcdAP7o/qf8mzaJ9pPy8KPvH0qCNDfHjicdf+mn/wBl/Op7dzbkGPgDqPWtKljDCXWstjUVREuFHy0kkYmXD9O1EUizLuHT0ps0ogXJ5z0FY/mdmlrv+H/X4f1sZl2DbHa/JPT3qDJvSFbm46Kf+ensff0NTyhrlsMCzMeMf0rU8I6V9t8SWdhgON3mXDjoI15Kj68An3xVupGlTlOXRXOHGXvfoYhk+y5jiIMh4kcf+gj+p/ybNohuj8vAH3vatTxhpH2XxLeWirtJfzYT2dG5A+o5HvisqBjbkeXxjqD3pKpGrTjOPVXHg293saqKIlAUfLTZYhOuG49D6UsUizLuHT0pJpRAuTznoKn8zt0td/w/6/D+tjKuc25Kv17e9RZN8QDzc9F/6ae31/n9amnBuW+bJY9MVBIPseYwczkYZh/APQe/qfwranY4cXe+mxYaE27bMYx0Pr71MR9pGR/rx1H/AD09/r/Ors0QnXB49DWXPm2b58hh0x3rNO501IX1+z+f/A/MFuDbHcOSf4fWl803Dbh8zE4x/SoGZrtvMXi5HJC/x+49/bv1rt/DXj5tPMdnryC6QcG4RAXj9j/f9z1+tZ4n2tKHNThzPte33aHLLGST0V12OVYi3UohBlPDsP4fYf1Neh/CnTNlrdanIvzSt5MR/wBkct+uB+FdnYz2OoWqXNi0E8D/AHXjAI/+sfarSqFGFAA9AMV8tj84lXpOjycr66/8A46mJcoOCVkcF8VtN8y0tdTjX5om8mQj+6eVP55/OvPP+Pkf9N//AEZ/9f8An9a+gGUMMMAR6EZqrfT2On2z3N60EECfedwAB/ifalgM4lh6So8nN21/4AU8S4xUGrpHgQuDbHeDz02+tL5xuG38knjHp7V2PiXx62oCW08Pxi3Xp57xgSSjvt/u/wAz7VxCyGzYkNuuG+8c52f/AGXv2r6rDe1qQ5qkOV9r3/TQ7I4yTdmrIuE/ZgVU/vjwxH8HsPf+VQrbG5OwcY/i9KLZTcECP8T6VqRIIV2r09a0bsdVOmktfh/L/gfl+SSyiFctz6Csu4zctlvvHpjtTnmNw2/Oc9AO3tUpP2YYH+v7n/nn/wDX/lQlYKk1bl+z/X4fkUXBsiVB/wBI7sP+WfsPf37Uqx/bMtGAJhy6gcMPUe/qPxqYW5uTsXr6+lCxNbttGVZTnI9fWtPaaHP9UfNfodb8LYrr+3ittNIlskRe4UH5X7KCPqf0r1uuI8DG00bw3Jq2oMkDXjFs93VcgbV6nPJwK57xJ8Qbq8LRaerW1n0Jz+8kH1/hHsPzr5HGYWrmGMl7NaLS/pv6s5KlN16nu6RXU9YryT4pQ3X9vKtxNI9u8Ye3Un5U7MAPqP1p/hrx/d2JWLUA13Z9Af8AlpGPY9x7H866Hxw1rrHhxdU02RJXsnySPvRq2A2R2I4PNGEwtXL8ZH2i916X9dvRhCk6NVc2qfU8nZTZHB/4+P8A0X/9l/L69FVPtv3RicfeH98ev1/nU32c3J2Dr6+lAhNu2zkMOc+vvX13tNDr+qPmv0FtXNsRs6dx61qRuJl3KflqiR9pBZR++HLAfx+49/aoo7g2x3547j1rNo6adRNWfw/1+H5/nBG5sT6znqP+ef8A9l/L61PApnIEfOe/pVUxC4BkgGCOZE/u+49v5Vas3+ynA5U/e960qWOfCXektjThjWFdo/P1ps8InXHQjoaerCVQVPymkeQQqS/TtWJ26Ncr+D+vw/rbeje3lyzo11M5aFQkYz9wDoFHYVRmP2sGVABIoy8Y6Y/vD+oqe7JuTubgj7vtUCg2RDni56qP+efuff0FbUlFKyODFXTsth0Tmx+Y8zH+H/nmPU/7X8quWFzco7mzldfNQpJg8Mp6hh3FUTH9qzJEMSdZEH/oQ9vUdqs2b/ZT8vIP3velVjFrUeFvLSWxpQxLAu0c57+tJPCJxjpjoaerCVQVPy0O4iUlz8o6VkduluX7H9fh/Wxkyk27fPlWU8Y/pUMrfbMyKMTAZZB/EPUe/qPxqa8JuTluMfd9qgVTaESSD991jT+76Mf6Ctqdjixd07LYniVrV/l+V16mppEV0MsQwB99B/D7j2/lVy5gE4yoww6H1rO8xrd9xO1l9f5Vmnc3nT6L4fzHw3P2Y5b7ncUks5nbfn5ew9Kq3OJl86LhR96PP3D/AIf/AKqdbuLQB5MM7coh/h/2j/QVfs9LmX1tP3fslxQLcB2GZTyqn+H3Pv6CqzwNctgcuecn+tPTdO/ykszc59a04IhAMYyT1b1qG7bG0Kd9JfC+v6f5f1fKiRrZuMq6nr71O6rKhkiADDl0Hb3Ht/KrlxCJxkcMOh/pWcXa3fcSUZTQncU6fRfD+Y+G5+zksT8ncUk05uDuz8vYelVbgi4UzRALt+/GP4fce38qW3YWyiWUBi3KRn/0I+3t3q/Z6X6mX1pP3fslxVEKiSQAuRlEP8z/AEHeoJImun7mQnO4/wBaepa4fIJdmOc+taNvCIBjqT1aobtsbQp9JfC/6t/kz//Z",
  Bangkok: "data:image/jpeg;base64,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",
  Mumbai: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCABgAGADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3GiiigAoqlrbMmjX7ISrC2kIIOCDtNeZDXr4ab/Zu+XyjIGzvbft6Y3ddm7nOevy114fCSrpuL2OrD4SVdNxZ61RXl0F5Kp1AS3coaSwiVA0zctth6c9eT055NRQa1eabdWlzHK8mLaPcJZGKFdpzu9AePm9cVt/Z0mtGb/2dJrRnq1FeRtf3c9tcyy3FwHaeMvudhziXtngcDj2Faljq89lo2r2z3Exm3rHErMXMe7cGIPsFPTjIyOtE8ulFaPX/AIb/ADFLL5RW+v8Awx6RRXmEmp3EvhKW1eSVJYLlSCspzsbdxuzkgMCOvpXoulsW0y0ZiSTChJPf5RXPXwzoq7fWxhXwzoq7fWxaooormOYKKKKAGTxJPDJDKu6ORSrL6gjBFZ48P6WLD7D9kX7PjG3cc43bsbs5689a06KqM5R2ZUZyjszHufDGj3LRmW05jjWMbZGXKqMAHB5wOOanGh6YtybgWcfmGIQ99uwADbt6YwB2q7cTxW0Ek9xIscUalndzgKB1JNeKfEX4rXc1rZzeDpWW0jmDT3RHLMDwhXsp7561tGVaadm7I1jKtNOzdkesS+GtImeZ5LTLTSebIRIwy3PPXj7x6etVrnw/o1usEcemCVvOBChzxngs2TyAB3z6d65rQ/inY6z4fiuLeEjUz8k1sfuxtj7xP909qXw5Lq+qa017C7ttbDyyfcK+gx29BXLWxtalJRV383tt8zjr5hVoTUFeW3V7bfP/AC9DpI/D+g6j50i6fhGbY3341bb6DI49x1rdijSGJI4xtRFCqPQDpUdtA0LSs9xLKXbID4wo9BgdKnrapUlLRttHTUqSlo22gooorMzCiiigAoorM8TL5mg30YvVsWkhZVuD/ASODjvQrdXZBp1dkeQ/FP4i2eoX9z4VVGXT/uXF0CQS4PQf7I9e/wBK8zEE3hedjeRG4tpyAE3ARzxkdfr/ACq5d2nnzNpGvssF+v8Ax6X/APyzkHox9D69qr6XeXcRPh3U0kaMtiJl5eE+qn+7+ldkZc0lCltffZ6ryOqM+aShS2vvs9V3Whn6bqcWmap9s02WWEZ/1Mq7lZf7pIPI/Cvp34deKdH8S6SRosDW4tQizRFNoRiM4B79DzXhGn6BDHC41ER3UjNwxQDA7e9erfBnSIrCPUJ7OVY4JGVXtgcncBwxz04yB681tWy+dKk6srL77/qjetl8qVJ1ZJL8/wBT02iiivNPOCiiigAooooAK4fxjp2sX+rJHDDJNasFEYB+RPUn3ruKKzq01UVmzGvRVaPK2cTL8OdKv9JW31ZfPuhhlnGf3bAdgeo9Qeteb61os+j6o0F7ConRcJKB99Ceqn0r36s/VtGsNYWJdQgWUROHTPBHt9D3Fell+LWE91q8T08uxUcJ7lvdPB2UqcMCDjPIxxW14Q1xtC1iOdyfs0nyTj/Z9fqOv512HxM8PiW1TVrSMB4FCTKo6x9j+H8vpXn+n6ZfalJssLSWc9yi5A+p6Cvoadeli8O3LRPR+R9BTrUsVQblono/I99RldA6EMrDII6EUtYXg201Ow0WO01by98RxHtfcQnYE+38q3a+TqRUJuKd7dT5WpFQm4p3t1CiiioICiiigBCcDJrm4vGNlJZT3f2a4EaSiKMYBMrEZwOeOOua6RuQQDj3rkk8FsRPLPqTG6eRZEljiCBWBPJAPJOe2K6aCotP2r7HRQVFp+1fYsyeL4YQn2jTryF2jd9rqoOF+p70L4ysgsbTW88SyKzKz7ccdO/f/wDXUNz4Tu70rJfauZpRE8e4wDo3Tv2qIeB43WNJ70MsauAFgC8noevJHfPWuhRwdtX+Z0KODtq/zJm8YW0yCN9Mu2SWIvtZVIZMHJ68jg5ot/F9iiJHb6fOkYh8zagQBFwT0z7VKnhTaYCb3/VWUlqcRdd275uvbd09qitfBkUSyedcrMTbeTGTD/q2wRvHPXmj/ZLP/gh/sln/AMElPjC3cQC2sby4kkjErxxICYwfXnr/AIiukByAcEZ7GuVi8JXFp5T6dq8ltMIhFM6xAh8dwM8V1SghQGOSBycda5q6oq3sv1OeuqKt7L9RaKKK5znCiiigDlvGN1fxXum22nTzI8/mDZEyguRt9ePWucl1vVFW+P8AaM4ZJNqjevH7wDpjPtkcV6Q8MUkiSSRIzx/cZlBK/Q9qhOnWJLE2duS33iYl55zzx6120sVThFRlC9v8ztpYmnCKjKF7f5nn11r2p+UI4tSkkhS4ZEukCoZRtHHPHHXJ9eans/EF+mvpG+oM0P2gK6SMpTy8ZPPrgdvb1rvHsbSSNY3tYGjT7qtGCF+gxTW06xYENZ25BO7BiXr0z0q/rdG1uT8i/rdK1uT8jibLxBe6gmqo15JAxja4tipGVCZJQexGPyJquutavaiCVL6W4MuntcbHAIUliM9OcAZr0D7FafL/AKLB8ilV/djhT1A9qVLS2RkZLeFWRdikIAVX0HoPal9apK9oaC+tUle0NDz6TXL+3guEt9WkvIzbLK8u3aYG3DIBP5fj7VueDdUv9Rvr7+0HbKJHiI4AQ8gnHbOM10a2FkkTxJaW6xyffQRKA31GOalSCKORpI4kV3ADMqgE46ZNTUxNOUHFQ1fXTyJqYmnKDioavr9xJRRRXEcR/9k=",
  Chicagoland: "data:image/jpeg;base64,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",
  "Mexico City": "data:image/jpeg;base64,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",
  NY: "data:image/jpeg;base64,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",
  Ottawa: "data:image/jpeg;base64,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",
  Moscow: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCABgAGADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCpRRRXjn6QFFFFABRRS4PoaAEopaSgAooooAKKKKACiiigBHYIjO2cKCTgZP5Vzr+K4GuIVt4CYWYeZJIdpVSwGQPxro6yYNDhWO+glVDBcMfL2r88ankjPpnkVpDk+0cmJWIdlRdv60KI1C+8hdQNzkLe+RJabFwF3bcZ67uhp2ltZtdTf2hdn7ZHeuiLJcsM4b5cLnH6VpfZdLivVdxbfaxjBdhvJA4OM9feovEV/wD2Rp7XcVujylwoLL0J7nv2q730S3Od03TTqVJXUd938/J+XQyYJ70okDSGK1n1J4zOsh3gbjhfYHGM5pv9paiFnnhluCJLsxW4dUaEjdgKSfmHeptL1XVNTsHvUt7No4W+aDY26QgZJU9AfSta30/TLjyL6C1jDMBLG6jHJHBx0zzVSai/eRhSpyrRTpTfzutNtPTX57kc2txx6mtmsEki+YsLTIRtWQ87ffgc+latY0egQW93ZTW7MFhdnl3uSZWIOCe2cnrWzWM+XTlPSw/tve9r309AoooqDoCiiigAoOcHb97HH1opk80dvE008ixxoMszHgUCbSV2Y+h6ZZTaTBLc2sU08ylpXlQMxbJzkmpJrGIMY0KmzhwWgnfMbMewz0wOfTJHFS2ply4UNbWzs0iF1+c55bjovc8889qztU1K30Sygne3E93cEuPMOSO+SfYEDit1zOWh5cvY06KckkktX/Wru9ddzWs7qySIR2y7VT/llHGTt/ADH+NVrC+trOxSOXzY0RnUM0L4A3HHOKr6HrC64jyIgt7u3xkZyrKex9v5da1dNkD2iMMhjncvcEnOP1qZLlumjajU9ryypyVrO2np0uSwTw3MQlt5UljPRkbIqSsmwVDrl7JaKFtxGqSlfutNnJx7gcGtaokrM6qM3ON35r7goooqTUKKKKACsTWp4YNVsX1BtlkiPICRlTKOmfoMke9bdVtTsYtRsZbSYkJIOo6gjkGqg0nqYYmEp02ob7+TtrZlVdRs9V02d7OXeB8p4IKk8Dg/WoNc0ePWYUglfyLiDJRwMhl78enA+lVYtDh0PSrqRZpZX+V3bJUYUg9AfrW9LawSrhlLd1YsSR7jNaNqLvFnJGFSvBwrxV2ldX82Yuj6Vb6JazpHObi6mwpKL09AB2696l1a5Wx8ua5kNrbSEROsZzIwA4PHTHTjnB61a+1GGQiVC0EBwZYUyA2P4lHTA7jI57VkeKW03VrBBDepJcof3EcTBmdjxtx19Oe1Uryn73UyqKFLDtUrJx2W3r5vr6nQae9q9lE1js+zFfk2DAxViqmk2Cabp8NpGSQg5J7k8mrdYStd2PTpc3s48ys7bBRRRSNAqsmoWcmdt1EcEj7w6jrVms1NDsk3YEm47vm38gHsKpcvUyqOqmuRL5lv7daf8/MPb+Md+lO+1W/P7+Pg4PzDg1UGjWi9PNyTljv5bqME/jSPotk4IIlAYksBIfm+tO0DPmxHZfeWjJa3sckAkjlV0IZVYHKnisaI38KLZf2pZLAmVFxz520dsHjIHete1sLa0kL28exioXqen+RTU021RGRVbDFifnOecZ/kKakkTUpVJ2b0fk3sFrPYwxJBb3EWEXIHmAnHXJ/nmlW5sjcII2iaaQkBkAJJHbNRf2Lp5OTBuY9WLEk/WnRaXaRTpMiN5ifdLOTil7vmNKsrK0bL12LLXECuY2mjDryVLcjvTPttp/z8w9/4x261HPplpcTNLNGXdgActx+VRro9opGFfaARs3nHPf8AWl7pbde+iViwb21HW5hHGeXHSp6oz6RZTzPNLEWkdtzHceTjFXqTt0Lh7S757eVgooopGgUUUUAFFFFABRRRQAUUUUAFFFFAH//Z",
  Tokyo: "data:image/jpeg;base64,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",
  "San Fu-Kuo": "data:image/jpeg;base64,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",
  Sydney: "data:image/jpeg;base64,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",
  Tashkent: "data:image/jpeg;base64,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",
};
function OvrBadge({ ovr }) {
  if (!ovr) return null;
  const tier = ovr >= 90
    ? { ring: "#FFD700", grad: "linear-gradient(150deg,#FFF3B0,#FFD700 45%,#B8860B)", ink: "#3A2703", label: "GOLD" }
    : ovr >= 80
    ? { ring: "#E8E8F0", grad: "linear-gradient(150deg,#FFFFFF,#C9CDD6 45%,#8E96A3)", ink: "#23262B", label: "SILVER" }
    : ovr >= 70
    ? { ring: "#D89058", grad: "linear-gradient(150deg,#F0C9A8,#C87F3F 45%,#8A4E1E)", ink: "#2E1503", label: "BRONZE" }
    : { ring: "#7A8578", grad: "linear-gradient(150deg,#9AA598,#6A756A 45%,#454E45)", ink: "#101410", label: "IRON" };
  return (
    <span title={`Overall ${ovr} — ${tier.label}`} style={{
      width: 30, height: 30, borderRadius: "50%", background: tier.grad,
      border: `2px solid ${tier.ring}`, boxShadow: `0 0 8px ${tier.ring}88, inset 0 1px 2px #FFFFFF88, inset 0 -2px 3px #00000055`,
      display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0,
    }}>
      <span style={{ fontFamily: "Impact, sans-serif", fontSize: 13, color: tier.ink, textShadow: "0 1px 0 #FFFFFF66" }}>{ovr}</span>
      <span style={{ fontSize: 5, letterSpacing: 1, color: tier.ink, fontFamily: "Verdana, sans-serif", fontWeight: "bold" }}>OVR</span>
    </span>
  );
}
function Crest({ t, size = 32 }) {
  const ov = TEAM_LOGO_OVERRIDES[t.id] || TEAM_LOGO_OVERRIDES[t.city];
  if (ov) return <img src={ov} alt={t.city} style={{ width: "100%", height: "100%", objectFit: "contain" }} />;
  if (t.logoImg && t.logo) return <img src={t.logo} alt={t.city} style={{ width: "100%", height: "100%", objectFit: "contain" }} />;
  return <span style={{ fontSize: size, filter: "drop-shadow(0 3px 3px #000)" }}>{t.glyph}</span>;
}

const CSS = `
@keyframes cbSlam { 0% { transform: scale(1.6) rotate(-4deg); opacity: 0; } 60% { transform: scale(.96) rotate(1deg); opacity: 1; } 100% { transform: scale(1) rotate(0); } }
.cb-slam { animation: cbSlam .45s cubic-bezier(.2,1.4,.4,1); }
@keyframes cbTumble { 0% { transform: rotate(-200deg) scale(.15); opacity: 0; } 70% { transform: rotate(14deg) scale(1.15); opacity: 1; } 100% { transform: rotate(0) scale(1); } }
.cb-die { animation: cbTumble .55s cubic-bezier(.2,1.3,.4,1) both; }
@keyframes cbBeg { 0%,100% { transform: scale(1); box-shadow: 0 0 12px #FFD86B66; } 50% { transform: scale(1.08); box-shadow: 0 0 30px #FFD86BEE; } }
.cb-tapdie { animation: cbBeg 1.1s infinite; cursor: pointer; }
.cb-bookfab { transition: transform .15s ease, filter .15s ease; }
.cb-bookfab:hover { transform: translateY(-2px); filter: brightness(1.1); }
.cb-bookfab:active { transform: translateY(2px); box-shadow: none !important; }
@keyframes cbBloom { 0% { text-shadow: 0 0 20px currentColor, 0 0 40px currentColor; filter: brightness(2.1); } 60% { text-shadow: 0 0 12px currentColor; filter: brightness(1.4); } 100% { text-shadow: 0 0 7px currentColor; filter: brightness(1); } }
.cb-bloom { animation: cbBloom 1.1s ease-out; }
@keyframes cbBanner { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
.cb-banner { animation: cbBanner .5s steps(2) infinite; }
@keyframes cbShake { 0%,100% { transform: translate(0,0); } 20% { transform: translate(-4px,2px); } 40% { transform: translate(4px,-2px); } 60% { transform: translate(-3px,-2px); } 80% { transform: translate(3px,2px); } }
.cb-shake { animation: cbShake .38s linear 2; }
@keyframes cbConfetti { 0% { transform: translateY(0) rotate(0); opacity: 1; } 100% { transform: translateY(200px) rotate(540deg); opacity: .2; } }
.cb-confetti { animation: cbConfetti 1.15s ease-in forwards; }
@keyframes cbSparkle { 0% { opacity: 0; transform: scale(.4); } 40% { opacity: 1; transform: scale(1.25); } 100% { opacity: 0; transform: scale(.6) translateY(-8px); } }
.cb-sparkle { animation: cbSparkle .9s ease-out infinite; }
@keyframes cbSpiral { from { filter: brightness(1); } 50% { filter: brightness(1.35); } to { filter: brightness(1); } }
.cb-spiral { animation: cbSpiral .22s linear infinite; }
@keyframes cbTrailFade { 0% { opacity: .95; } 65% { opacity: .85; } 100% { opacity: 0; } }
.cb-trail { animation: cbTrailFade 1.8s ease-out forwards; }
@keyframes cbHop { 0% { transform: translate(-50%,-50%) scale(1); } 35% { transform: translate(-50%,-62%) scale(1.18); } 100% { transform: translate(-50%,-50%) scale(1); } }
.cb-hop { animation: cbHop .55s ease; transform: translate(-50%,-50%); }
.cb-btn:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); }
.cb-btn:active:not(:disabled) { transform: translateY(2px); box-shadow: none !important; }
@keyframes cbPulse { 0%,100% { box-shadow: 0 0 14px #E3B23C55; } 50% { box-shadow: 0 0 30px #E3B23CBB; } }
.cb-pulse { animation: cbPulse 1.6s infinite; }
@media (prefers-reduced-motion: reduce) { .cb-slam, .cb-pulse, .cb-die, .cb-banner, .cb-shake, .cb-confetti, .cb-sparkle, .cb-spiral, .cb-bloom { animation: none; } }
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
  const [expandedSlot, setExpandedSlot] = useState(null);
  const logRef = useRef(null);
  useEffect(() => { const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s); return () => s.remove(); }, []);

  const drivesPerQtr = mode === "quick" ? 2 : 4;
  const T = (id) => TEAMS[id];

  function newGame() {
    const first = Math.random() < 0.5 ? playerTeam : aiTeam;
    setG({
      score: { [playerTeam]: 0, [aiTeam]: 0 }, qtr: 1, driveNum: 1, halfDrive: 0,
      possession: first, other: first === playerTeam ? aiTeam : playerTeam,
      spot: 0, line: 0, down: 1, phase: "penroll",
      penNums: {}, sctx: null,
      reveal: null, aiCommit: null, chase: null,
      chits: { [playerTeam]: [...staked], [aiTeam]: [...aiStaked] }, usedChits: [],
      ot: false, otPoss: 0, playerRuns: 1, playerPasses: 1,
      driveReason: null, driveOpts: null,
      log: [{ t: "sys", m: `COIN FLIP — ${T(first).city} receives. The machine is already studying your habits.` }],
      stats: { plays: 0, tds: 0, tos: 0,
        passAtt: 0, passComp: 0, passYds: 0, passTD: 0, incompletions: 0,
        wrYds: 0, yac: 0, rbYds: 0, sacksTaken: 0, intThrown: 0 },
    });
    setSel({}); setExpandedSlot(null);
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
  const setAnim = (type, extra = {}) => { g.fieldAnim = { id: Date.now() + Math.random(), type, from: g.spot, to: g.spot, ...extra }; };

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
    // NEW · Block And Go — TE credited +10 osrPass when deployed in the blocker slot
    if (blk.ab.blockGo) add += 10;
    if (hasChit(g.possession, "keg") && blk.slot === "BLK" && !blk.pos.startsWith("FB")) { add += 10; markUsed(g.possession, "keg"); }
    if (hasChit(g.possession, "can") && (qb.pos === "QB1" || sk.pos === "QB1")) { add += 10; markUsed(g.possession, "can"); }
    if (hasChit(g.possession, "dozer") && play.type === "run" && sk.pos.startsWith("FB")) { add += 20; markUsed(g.possession, "dozer"); }
    return OFF_EDGE + Math.min(STACK_CAP, add);
  }
  function defBonus(trio, play, offTrio) {
    let add = trio.reduce((s, c) => s + c.diff, 0);
    const orbital = play.type === "pass" && offTrio[1].ab.skyDrop; // WISELAKE UPLINK: you cannot read a ball that comes from space
    trio.forEach((c) => { add += play.type === "run" ? (c.ab.dsrRun || 0) : (orbital ? 0 : (c.ab.dsrPass || 0)); });
    offTrio.forEach((c) => { add -= c.ab.dsrPen || 0; });
    if (play.type === "pass") add -= offTrio[1].ab.deadEye || 0;
    // NEW · Thread The Needle — 1st-half passer halves DB (CB/SS/FS) contribution
    if (play.type === "pass" && offTrio[1].ab.thread && g.qtr <= 2 && !g.ot) {
      trio.forEach((c) => { if (c.slot === "DB") add -= Math.floor(c.diff / 2); });
    }
    // NEW · Bearhug — El Oso in the wall shaves the run
    if (play.type === "run") trio.forEach((c) => { if (c.ab.bearhug) add -= 4; });
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

  /* ---------- resolve: v3.1 tap-to-roll state machine ----------
     beginSnap: penalty d20 check -> reveal cards -> player TAPS their own
     percentile die (OSD on offense / DSD on defense); AI die auto-rolls.
     Outcome dice (ROD/POD/CATCH offense-owned, DOD defense-owned) are tapped
     when yours, auto-rolled when the machine's. */
  function beginSnap(offTrio, play, defTrio) {
    g.stats.plays++;
    if (isPlayerOff) { play.type === "run" ? g.playerRuns++ : g.playerPasses++; }
    // --- yellow d20 penalty check (both sidelines roll every snap) ---
    const yo = d(20), yd = d(20);
    const nums = [g.penNums[playerTeam], g.penNums[aiTeam]];
    const oB = offBonus(offTrio, play), dB = defBonus(defTrio, play, offTrio);
    g.reveal = { offTrio, defTrio, play, rolls: null, oB, dB, dice: [] };
    if (nums.includes(yo)) {
      g.reveal.dice.push({ k: "PEN", v: yo, sub: "OFF FLAG" });
      const k = d(3);
      const pen = k === 1 ? ["False Start", -5] : k === 2 ? ["Holding", -10] : ["Pass Interference", -15];
      log(`FLAG! Yellow d20 lands ${yo} — ${pen[0]} on ${offT.city}, ${pen[1]}m. The play is dead. The crowd boos in cursive.`, "flag");
      advanceDown(pen[1]); push(); return;
    }
    if (nums.includes(yd)) {
      g.reveal.dice.push({ k: "PEN", v: yd, sub: "DEF FLAG" });
      const k = d(3);
      const pen = k === 1 ? ["Offside", 5, false] : k === 2 ? ["Holding", 10, false] : ["Pass Interference", 15, true];
      log(`FLAG! Yellow d20 lands ${yd} — ${pen[0]} on ${defT.city}, +${pen[1]}m free${pen[2] ? " and an AUTOMATIC FIRST DOWN" : ""}.`, "flag");
      if (pen[2]) { g.spot = Math.min(FIELD - 1, g.spot + pen[1]); g.down = 1; g.line = g.spot; g.phase = "postReveal"; push(); return; }
      advanceDown(pen[1]); push(); return;
    }
    g.sctx = { offTrio, play, defTrio, oB, dB, stage: "SNAP" };
    g.phase = "tapRoll";
  }
  const dieOwnedByPlayer = (stage) => {
    if (stage === "SNAP") return true; // you always hold a percentile die at the snap
    if (stage === "DOD") return !isPlayerOff;
    return isPlayerOff; // ROD / POD / CATCH belong to the offense
  };
  const stageDieKind = (stage) => stage === "SNAP" ? (isPlayerOff ? "OSD" : "DSD") : stage;
  function tapRoll() {
    const s = g.sctx; if (!s) return;
    if (s.stage === "SNAP") {
      let ro = d100(), rd = d100();
      while (ro + s.oB === rd + s.dB) { ro = d100(); rd = d100(); }
      s.ro = ro; s.rd = rd; s.o = ro + s.oB; s.d = rd + s.dB; s.win = s.o > s.d;
      g.reveal.rolls = { win: s.win, o: s.o, d: s.d };
      g.reveal.dice.push({ k: "OSD", v: ro, sub: `+${s.oB}` }, { k: "DSD", v: rd, sub: `+${s.dB}` });
      log(s.win ? `Snap won ${s.o}–${s.d} — the play is ALIVE!` : `Snap lost ${s.o}–${s.d} — the wall answers.`, s.win ? "good" : "bad2");
      s.stage = s.win ? (s.play.type === "run" ? "ROD" : "POD") : "DOD";
      if (!dieOwnedByPlayer(s.stage)) { autoOutcome(); return; }
      return; // wait for next tap
    }
    rollOutcome(s.stage);
  }
  function autoOutcome() { rollOutcome(g.sctx.stage); }
  function rollOutcome(stage) {
    const s = g.sctx;
    if (stage === "ROD") { s.rod = d(8); g.reveal.dice.push({ k: "ROD", v: s.rod }); finishSnap(); return; }
    if (stage === "POD") { s.pod = d(8); g.reveal.dice.push({ k: "POD", v: s.pod }); afterPod(); return; }
    if (stage === "DOD") { s.dd = d(6); g.reveal.dice.push({ k: "DOD", v: s.dd }); finishSnap(); return; }
    if (stage === "CATCH") { s.cr = d100(); g.reveal.dice.push({ k: "CATCH", v: s.cr, sub: `vs ${s.compl}%` }); finishSnap(); return; }
  }
  function afterPod() {
    const s = g.sctx;
    const { offTrio, play } = s; const qb = offTrio[1], sk = offTrio[2];
    const primaryDef = play.type === "run" ? s.defTrio[0] : s.defTrio[2];
    if (s.pod === 1 && qb.ab.skyDrop) {
      log(`POD 1 — but this ball came from ORBIT. It simply thuds down out of the sky, unpickable, five meters from anyone. The Lake recalibrates. Incomplete.`, "play");
      setAnim("incomplete", { to: Math.min(FIELD, g.spot + 14), sky: true });
      g.sctx = null; advanceDown(0); return;
    }
    if (s.pod === 1) {
      const tk = takeaway(primaryDef.diff + (primaryDef.ab.intB || 0), qb.diff);
      if (tk.taken) { g.stats.tos++; if (isPlayerOff) g.stats.intThrown++, g.stats.passAtt++; log(`POD 1 — INTERCEPTED by ${primaryDef.name}! ${qb.name} would like a word with his arm.`, "bad"); setAnim("int", { to: Math.min(FIELD, g.spot + 14) }); g.sctx = null; endDrive("int"); return; }
      log(`The ball hangs… and DROPS. ${primaryDef.name} will see that one at 3 a.m. Incomplete.`, "play");
      setAnim("incomplete", { to: Math.min(FIELD, g.spot + 14) });
      if (isPlayerOff) g.stats.incompletions++, g.stats.passAtt++;
      g.sctx = null; advanceDown(0); return;
    }
    if (s.pod === 6) {
      const c2 = contest(s.oB, s.dB);
      if (!c2.win) { log(`CONTESTED BALL — broken up (${c2.o} vs ${c2.d})! Both players file complaints.`, "play"); g.sctx = null; advanceDown(0); return; }
      log(`CONTESTED BALL — ${sk.name} RIPS IT AWAY (${c2.o} vs ${c2.d})!`, "good");
    }
    let compl = (sk.pct ? sk.pct[play.depth] : 30) + OPEN_RECEIVER;
    if (hasChit(g.possession, "weaver")) { compl += 10; markUsed(g.possession, "weaver"); }
    if ((s.o - s.d) >= BURN_MARGIN) {
      log(`COVERAGE BURNED (won by ${s.o - s.d})! ${sk.name} is ALONE out there. Automatic catch.`, "good");
      compl = 999;
    }
    s.compl = compl; s.stage = "CATCH";
    if (!dieOwnedByPlayer("CATCH")) { autoOutcome(); }
  }
  function finishSnap() {
    const s = g.sctx; g.sctx = null;
    const { offTrio, play, defTrio } = s;
    const [blk, qb, sk] = offTrio;
    const primaryDef = play.type === "run" ? defTrio[0] : defTrio[2];
    if (s.win) {
      if (play.type === "run") {
        const rod = s.rod;
        if (rod === 1) {
          const tk = takeaway(primaryDef.diff + (primaryDef.ab.intB || 0), sk.diff);
          if (tk.taken) { g.stats.tos++; log(`ROD 1 — FUMBLE! ${defT.city} rips it out (${tk.dr} vs ${tk.or})! The crowd makes a sound like a kettle.`, "bad"); setAnim("fumble"); endDrive("fumble"); return; }
          log(`Fumble scare — ${sk.name} hugs the ball like it owes him money. No gain.`, "play");
          advanceDown(0); return;
        }
        let gain = [0, 0, shortGain(), shortGain(), longGain(), shortGain(), shortGain(), longGain(), longGain()][rod];
        const note = ["", "", "short gain", "BROKEN TACKLE", "LONG GAIN", "STIFF-ARM", "short gain", "LONG GAIN", "HURDLE"][rod];
        if (sk.ab.quick && (rod === 2 || rod === 6)) { const ex = shortGain(); gain += ex; log(`QUICK! Bonus burst +${ex}m.`, "good"); }
        if (isPlayerOff && sk.pos && sk.pos.startsWith("RB")) g.stats.rbYds += gain;
        log(`${sk.name} behind ${blk.name} — ${note}, +${gain}m!`, "good");
        setAnim("run", { from: g.spot, to: Math.min(FIELD, g.spot + gain), margin: s.o - s.d, star: !!sk.elite });
        startChase(sk, gain, "run");
      } else {
        const pod = s.pod, compl = s.compl, cr = s.cr;
        if (cr > compl) { if (isPlayerOff) g.stats.incompletions++, g.stats.passAtt++; log(`${qb.name} → ${sk.name} (${["10m", "20m", "20+m"][play.depth]}): ${cr} vs ${compl}% — INCOMPLETE. The ball had other plans.`, "play"); setAnim("incomplete", { to: Math.min(FIELD, g.spot + 14) }); advanceDown(0); return; }
        let gain = play.depth === 0 ? shortGain() : play.depth === 1 ? longGain() : longGain() + 10;
        const bonus = pod === 5 ? " STIFF-ARM!" : pod === 7 ? " SPECTACULAR CATCH!" : pod === 8 ? " HURDLE!" : "";
        log(`${qb.name} → ${sk.name}: ${cr} vs ${compl}% — CAUGHT, +${gain}m!${bonus}`, "good");
        setAnim("pass", { from: g.spot, to: Math.min(FIELD, g.spot + gain), margin: s.o - s.d, star: !!sk.elite, burned: compl > 100, sky: !!qb.ab.skyDrop });
        if (hasChit(g.possession, "jets") && sk.pos === "WR1") { gain += 10; markUsed(g.possession, "jets"); log("JETS! +10 bonus meters. He left a vapor trail.", "good"); }
        if (isPlayerOff) {
          g.stats.passAtt++; g.stats.passComp++; g.stats.passYds += gain;
          if (sk.pos && sk.pos.startsWith("WR")) g.stats.wrYds += gain;
        }
        startChase(sk, gain, "pass");
      }
    } else {
      const dd = s.dd;
      if (dd === 1) { const loss = play.type === "pass" ? d(10) + (primaryDef.ab.sackB ? 2 : 0) : 5; if (isPlayerOff && play.type === "pass") g.stats.sacksTaken++, g.stats.passAtt++; log(play.type === "pass" ? `SACK! ${defTrio[0].name} arrives with paperwork. -${loss}m.` : `Swallowed in the backfield. -5m.`, "bad2"); setAnim("sack", { margin: s.d - s.o }); advanceDown(-loss); return; }
      if (dd === 2 || dd === 6) { log(`STUFFED at the line. The wall files this under 'correspondence.'`, "bad2"); advanceDown(0); return; }
      if (dd === 3) {
        const tk = takeaway(s.dB + (primaryDef.ab.intB || 0), s.oB - OFF_EDGE);
        if (tk.taken) { g.stats.tos++; if (isPlayerOff && play.type === "pass") g.stats.intThrown++, g.stats.passAtt++; log(`TAKEAWAY! ${primaryDef.name} ${play.type === "pass" ? "INTERCEPTS" : "FORCES THE FUMBLE"} (${tk.dr} vs ${tk.or})! The Dragonfly saw it coming.`, "bad"); setAnim(play.type === "pass" ? "int" : "fumble", { to: Math.min(FIELD, g.spot + 10) }); endDrive("int"); return; }
        log(`Takeaway chance — batted down (${tk.dr} vs ${tk.or}). Merely a stop.`, "bad2"); advanceDown(0); return;
      }
      if (dd === 4) {
        if (play.type === "pass") {
          const loc = -d(10);
          const tk = takeaway(s.dB, s.oB - OFF_EDGE);
          if (tk.taken) { g.stats.tos++; log(`STRIP SACK! ${defT.city} recovers at ${loc}m! Somebody alert the hymnal.`, "bad"); setAnim("fumble"); endDrive("fumble", { move: loc }); return; }
          log(`STRIP SACK — scramble! Offense falls on it at ${loc}m. Everyone screams appropriately.`, "bad2"); advanceDown(loc); return;
        }
        log(`Stuffed on the run. Nothing there but regret.`, "bad2"); advanceDown(0); return;
      }
      log(`Dragged down for -3m by ${defTrio[1].name}.`, "bad2"); advanceDown(-3); return;
    }
  }

  /* ---------- chase ---------- */
  function startChase(carrier, gain, kind) {
    g.chase = { carrier, gain, steps: 0, kind: kind || null, baseGain: gain };
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
    // NEW · CANONBALL — carrier bowls over the wall, every pursuer is -8 in the 1:1
    const canon = ch.carrier.ab.canonball ? 8 : 0;
    const c = contest(ch.carrier.diff + (ch.carrier.ab.osr11 || 0) + OFF_EDGE / 2, defd.diff + PURSUIT * ch.steps - canon);
    if (canon && ch.steps === 1) log(`CANONBALL! ${ch.carrier.name} lowers the shoulder — the whole pursuit gives way.`, "good");
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
    if (isPlayerOff && extra > 0) {
      if (ch.kind === "pass") { g.stats.yac += extra; g.stats.passYds += extra; if (ch.carrier.pos && ch.carrier.pos.startsWith("WR")) g.stats.wrYds += extra; }
      else if (ch.kind === "run" && ch.carrier.pos && ch.carrier.pos.startsWith("RB")) g.stats.rbYds += extra;
    }
    log(`${ch.carrier.name} BREAKS FREE (+${extra}m)!${FIELD - g.spot - ch.gain > 0 ? ` ${FIELD - g.spot - ch.gain}m to glory…` : ""}`, "good");
    setAnim("run", { from: Math.max(1, g.spot + ch.gain - extra), to: Math.min(FIELD, g.spot + ch.gain), star: !!(ch.carrier && ch.carrier.elite) });
    if (g.spot + ch.gain >= FIELD) { finishChase(true); return null; }
    return true;
  }
  function finishChase(td) {
    if (!g.chase) return;
    if (td && isPlayerOff && g.chase.kind === "pass") g.stats.passTD++;
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
    setAnim("td", { from: Math.max(1, g.spot - 14), to: FIELD - 3, star: true });
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
      setAnim("kick", { good: true });
      endDrive("fg");
    } else { g.score[g.other] += 1; log(`The ${dist}m kick sails wide — ROUGE! One free, humiliating point for ${defT.city}.`, "bad"); setAnim("kick", { good: false }); endDrive("fgmiss"); }
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
    setSel({}); setExpandedSlot(null);
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
      beginSnap(trio, play, g.aiCommit.trio);
    } else {
      const defTrio = [sel.LINE, sel.BACKER, sel.BACK];
      const { trio, play } = g.aiCommit;
      log(`${offT.city} declares ${play.type === "run" ? "a RUN" : `a PASS (${["10m", "20m", "20+m"][play.depth]})`} — cards on the table!`, "sys");
      beginSnap(trio, play, defTrio);
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
          <div style={{ fontFamily: "Impact, sans-serif", fontSize: 16, letterSpacing: 3, color: "#FFD86B" }}>{g.ot ? "☠ OVERTIME ☠" : `QUARTER ${g.qtr}`}</div>
          <div style={{ fontFamily: "Courier New, monospace", fontSize: 12, color: "#8FA08F" }}>DRIVE {g.driveNum}/{drivesPerQtr} · DOWN {g.down} · {Math.max(0, TO_GAIN - (g.spot - g.line))} TO GO</div>
          {(lastHalf() || lastGame()) && !g.ot && <div style={{ fontSize: 11, color: "#FFD86B", fontFamily: "Courier New, monospace" }} className="cb-pulse">★ CLUTCH DRIVE — BONUS SCORING ★</div>}
        </div>
        <ScoreCell t={aT} s={g.score[aiTeam]} poss={g.possession === aiTeam} right label="THE MACHINE" />
      </div>

      {/* 2151 BROADCAST — full-width strip under the scoreboard */}
      <div style={{ marginTop: 10, background: "#0A120D", border: "1px solid #2C5A44", borderRadius: 14, padding: "10px 14px" }}>
        <div style={{ fontFamily: "Impact, sans-serif", letterSpacing: 2, fontSize: 15, color: "#FFD86B", marginBottom: 6 }}>{"📡"} 2151 BROADCAST</div>
        <div ref={logRef} style={{ overflowY: "auto", maxHeight: 128, fontFamily: "Courier New, monospace", fontSize: 13.5, lineHeight: 1.5 }}>
          {g.log.map((e, i) => (
            <div key={i} className={(e.t === "score" || e.t === "good") && i === 0 ? "cb-bloom" : ""} style={{
              padding: "4px 8px", borderRadius: 4, marginBottom: 3,
              color: e.t === "score" ? "#FFD86B" : e.t === "bad" ? "#FF8A70" : e.t === "bad2" ? "#D6A15E" : e.t === "good" ? "#9BD53C" : e.t === "flag" ? "#FFD34D" : "#B9C4B4",
              textShadow: (e.t === "score" || e.t === "good") ? "0 0 7px currentColor" : "none",
              background: e.t === "score" ? "#3A2E0E" : e.t === "bad" ? "#3A160E" : "transparent",
              opacity: i === 0 ? 1 : 0.85,
            }}>{e.m}</div>
          ))}
        </div>
      </div>

      <RetroField spot={g.spot} line={g.line} possession={g.possession} teams={[playerTeam, aiTeam]} anim={g.fieldAnim} />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 560px", minWidth: 340 }}>
          <div style={{ background: "linear-gradient(180deg,#0F1D14,#0A130D)", border: "1px solid #2C5A44", borderRadius: 14, padding: 14, minHeight: 330 }}>
            {g.reveal ? (
              <div>
                <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", letterSpacing: 2, fontSize: 15, color: "#FFD86B", marginBottom: 10 }}>
                  {g.reveal.play.type === "run" ? "RUN PLAY" : `PASS — ${["10m", "20m", "20+m"][g.reveal.play.depth]}`} · CARDS REVEALED
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {g.reveal.offTrio.map((c, i) => <ArenaCard key={"o" + i} card={c} teamId={g.possession} size={0.85} slam roleTag={["BLOCKER", "QB", "SKILL"][i]} chosen={g.reveal.rolls ? g.reveal.rolls.win : false} />)}
                  <div style={{ textAlign: "center", minWidth: 96 }}>
                    <div style={{ fontFamily: "Impact, sans-serif", fontSize: 30, color: !g.reveal.rolls ? "#5E7263" : g.reveal.rolls.win ? "#9BD53C" : "#FF8A70", textShadow: "0 2px 0 #000" }}>{g.reveal.rolls ? g.reveal.rolls.o : "—"}</div>
                    <div style={{ fontSize: 11, color: "#8FA08F", fontFamily: "Courier New, monospace" }}>total</div>
                    <div style={{ fontFamily: "Impact, sans-serif", fontSize: 18, color: "#FFD86B", margin: "2px 0" }}>⚔</div>
                    <div style={{ fontFamily: "Impact, sans-serif", fontSize: 30, color: !g.reveal.rolls ? "#5E7263" : !g.reveal.rolls.win ? "#9BD53C" : "#FF8A70", textShadow: "0 2px 0 #000" }}>{g.reveal.rolls ? g.reveal.rolls.d : "—"}</div>
                    <div style={{ fontSize: 9, color: "#8FA08F", fontFamily: "Courier New, monospace" }}>total</div>
                  </div>
                  {g.reveal.defTrio.map((c, i) => <ArenaCard key={"d" + i} card={c} teamId={g.possession === playerTeam ? aiTeam : playerTeam} size={0.85} slam roleTag={["LINE", "LB", "DB"][i]} chosen={g.reveal.rolls ? !g.reveal.rolls.win : false} />)}
                </div>
                <DiceTray dice={g.reveal.dice} />
              </div>
            ) : g.phase === "commitOff" || g.phase === "commitDef" ? (
              <div>
                <div style={{ textAlign: "center", fontFamily: "Impact, sans-serif", letterSpacing: 2, fontSize: 15, color: "#FFD86B", marginBottom: 6 }}>
                  {g.phase === "commitOff" ? "BUILD YOUR ATTACK — PICK 3 CARDS" : "BUILD YOUR WALL — PICK 3 CARDS"}
                </div>
                <div style={{ textAlign: "center", fontSize: 12, color: "#8FA08F", fontFamily: "Courier New, monospace", marginBottom: 12 }}>
                  {g.phase === "commitOff" ? `${defT.city} has committed its 3 defenders… face down. Rude.` : `${offT.city} has committed its attack… face down. Typical.`}
                </div>

                {/* THREE SLOTS — tap to expand & pick, mirroring the opponent's 3-card layout */}
                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                  {slotOrder.map((slot) => {
                    const picked = sel[slot];
                    const isOpen = expandedSlot === slot;
                    const shortLabel = { BLOCKER: "BLOCKER", QB: "QB", SKILL: "SKILL", LINE: "LINEMAN", BACKER: "LINEBACKER", BACK: "BACK" }[slot];
                    return (
                      <div key={slot} onClick={() => setExpandedSlot(isOpen ? null : slot)}
                        style={{ cursor: "pointer", width: 128, height: 182, borderRadius: 12, flexShrink: 0, position: "relative",
                          transition: "all .18s", transform: isOpen ? "translateY(-4px)" : "none" }}>
                        {picked ? (
                          <div style={{ transform: "scale(0.82)", transformOrigin: "top center" }}>
                            <ArenaCard card={picked} teamId={isPlayerOff ? g.possession : g.other} size={1} roleTag={shortLabel}
                              chosen={isOpen} />
                          </div>
                        ) : (
                          <div style={{ width: "100%", height: "100%", borderRadius: 12, border: `3px dashed ${isOpen ? "#FFD86B" : "#2C5A44"}`,
                            background: isOpen ? "#122017" : "#0C160F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            boxShadow: isOpen ? "0 0 18px #FFD86B55" : "none" }}>
                            <div style={{ fontSize: 30, color: isOpen ? "#FFD86B" : "#3C6B50" }}>{isOpen ? "▾" : "＋"}</div>
                            <div style={{ fontFamily: "Impact, sans-serif", fontSize: 13, letterSpacing: 1, color: isOpen ? "#FFD86B" : "#6C8574", marginTop: 6 }}>{shortLabel}</div>
                            <div style={{ fontFamily: "Courier New, monospace", fontSize: 9, color: "#5E7263", marginTop: 4 }}>{isOpen ? "PICKING…" : "TAP TO PICK"}</div>
                          </div>
                        )}
                        {picked && <div style={{ position: "absolute", top: -6, right: -6, background: "#0E8A4A", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, border: "2px solid #04220F" }}>✓</div>}
                      </div>
                    );
                  })}
                </div>

                {/* EXPANDED PICKER — shows available cards for the open slot */}
                {expandedSlot && (
                  <div style={{ background: "#0C160F", border: "1px solid #2C5A44", borderRadius: 12, padding: "10px 10px 6px", marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ fontFamily: "Courier New, monospace", fontSize: 12, letterSpacing: 1, color: "#FFD86B" }}>
                        {slotLabels[expandedSlot]} {sel[expandedSlot] ? `— ${sel[expandedSlot].name} ✓` : "— choose one:"}
                      </div>
                      <span onClick={() => setExpandedSlot(null)} style={{ cursor: "pointer", fontFamily: "Courier New, monospace", fontSize: 11, color: "#8FA08F" }}>close ✕</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                      {trioSlots[expandedSlot].map((c) => {
                        const takenElsewhere = slotOrder.some((s2) => s2 !== expandedSlot && sel[s2] === c);
                        return <ArenaCard key={c.name + expandedSlot} card={c} teamId={isPlayerOff ? g.possession : g.other} size={0.7}
                          chosen={sel[expandedSlot] === c} dimmed={takenElsewhere}
                          onClick={() => { if (!takenElsewhere) { setSel({ ...sel, [expandedSlot]: sel[expandedSlot] === c ? null : c }); setExpandedSlot(null); } }} />;
                      })}
                    </div>
                  </div>
                )}

                {g.phase === "commitOff" && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginTop: 4 }}>
                    <span style={{ fontFamily: "Courier New, monospace", fontSize: 12, color: "#FFD86B" }}>PLAY CALL:</span>
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
              <div style={{ textAlign: "center", padding: "60px 0", color: "#5E7263", fontFamily: "Courier New, monospace", fontSize: 14 }}>
                {g.phase === "spin" ? "The Meter Wheel awaits its spin…" : "The table is being cleared…"}
              </div>
            )}
          </div>

          <div style={{ marginTop: 10, background: "#0E1A13", border: "1px solid #2C5A44", borderRadius: 14, padding: 12, textAlign: "center" }}>
            {g.phase === "penroll" && (
              <div>
                <div style={{ fontFamily: "Courier New, monospace", fontSize: 11, color: "#FFD86B", marginBottom: 8 }}>
                  {g.penNums[playerTeam] == null
                    ? "BEFORE KICKOFF: roll the yellow d20 to set YOUR Penalty Number. Any snap where a sideline d20 hits either number = FLAG."
                    : `YOUR PENALTY NUMBER: ${g.penNums[playerTeam]} — the machine has rolled its own, in secret, smugly.`}
                </div>
                {g.penNums[playerTeam] == null ? (
                  <div className="cb-tapdie" onClick={act(() => {
                    g.penNums[playerTeam] = d(20);
                    g.penNums[aiTeam] = d(20);
                    log(`${TEAMS[playerTeam].city} rolls the yellow d20… PENALTY NUMBER ${g.penNums[playerTeam]}. The machine rolls in secret.`, "flag");
                  })} style={{ display: "inline-block" }}>
                    <Die kind="PEN" val="?" sub="TAP TO ROLL" />
                  </div>
                ) : (
                  <Btn big gold onClick={act(() => { g.phase = "spin"; })}>TO THE METER WHEEL ➤</Btn>
                )}
              </div>
            )}
            {g.phase === "tapRoll" && g.sctx && (
              <div>
                <div style={{ fontFamily: "Courier New, monospace", fontSize: 11, color: "#FFD86B", marginBottom: 8 }}>
                  {g.sctx.stage === "SNAP"
                    ? `THE BALL IS SNAPPED — tap YOUR ${isPlayerOff ? "WHITE OSD" : "RED DSD"} to roll the 1:1!`
                    : `YOUR OUTCOME DIE — tap the ${g.sctx.stage === "ROD" ? "ORANGE RUN die" : g.sctx.stage === "POD" ? "BLUE PASS die" : g.sctx.stage === "CATCH" ? "GREEN CATCH die" : "DARK-RED DEFENSE die"}!`}
                </div>
                <div className="cb-tapdie" onClick={act(tapRoll)} style={{ display: "inline-block" }}>
                  <Die kind={stageDieKind(g.sctx.stage)} val="?" sub="TAP TO ROLL" />
                </div>
              </div>
            )}
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
                <div style={{ fontFamily: "Courier New, monospace", fontSize: 13, color: "#FFD86B", marginBottom: 8 }}>4TH DOWN — {FIELD - g.spot}m TO THE END ZONE</div>
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

        <div style={{ flex: "1 1 300px", minWidth: 280 }}>
          <StatsPanel g={g} pT={pT} aT={aT} playerTeam={playerTeam} aiTeam={aiTeam} drivesPerQtr={drivesPerQtr} />
        </div>
      </div>
      <HelpFab />
    </div>
  );

  function ScoreCell({ t, s, poss, right, label }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: right ? "row-reverse" : "row" }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: `linear-gradient(160deg, ${t.color}, ${t.dark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff", border: `2px solid ${t.color2}`, boxShadow: poss ? `0 0 14px ${t.color}` : "none", overflow: "hidden" }}><Crest t={t} size={24} /></div>
        <div style={{ textAlign: right ? "right" : "left" }}>
          <div style={{ fontSize: 10, color: "#8FA08F", fontFamily: "Courier New, monospace", letterSpacing: 1 }}>{label}</div>
          <div style={{ fontFamily: "Impact, sans-serif", fontSize: 15, letterSpacing: 1, color: poss ? "#FFD86B" : "#E9E4D3" }}>{t.city.toUpperCase()} {poss ? "●" : ""}</div>
          <div style={{ fontFamily: "Impact, sans-serif", fontSize: 38, color: "#FFD86B", lineHeight: 1, textShadow: "0 2px 0 #3A2E0E" }}>{s}</div>
        </div>
      </div>
    );
  }
}


/* ================= RETRO FIELD v2 — original 16-bit-style sprites =================
   Tecmo-Bowl-inspired, original pixel art tinted by team hex colors. 3v3 on field.
   Choreography reflects the cards' outcome: distance-scaled runs, QB dropbacks,
   routes, pursuit, pancakes, dizzy-star sacks, pick-six returns, confetti TDs,
   superstar sparkle trails, burned-coverage separation, and screen shake. */

function FieldSprite({ team, action = "run", animate = false, frameIdx = 0, facing = 1, flat = false, style = {}, dur = 0.5, size = 1.3 }) {
  const w = CB_ACTION_ATLAS.frameW * 0.72 * size, h = CB_ACTION_ATLAS.frameH * 0.72 * size;
  return (
    <div style={{ position: "absolute", width: w, height: h, transition: `left ${dur}s cubic-bezier(.3,.9,.4,1), top .35s ease`, ...style }}>
      <div style={{ position: "absolute", left: "10%", right: "10%", bottom: -2, height: 7, borderRadius: "50%", background: "radial-gradient(ellipse, #000000A0, transparent 68%)" }} />
      {flat && <div style={{ position: "absolute", top: -12, left: 10, fontSize: 12, color: "#FFE28A", textShadow: "0 1px 0 #000", zIndex: 2 }}>✶✶</div>}
      <div style={{ transform: `scaleX(${facing}) ${flat ? "rotate(90deg)" : ""}`, transition: "transform .25s ease", width: w, height: h }}>
        <TeamActionSprite teamId={team} action={action} frame={frameIdx} animate={animate} size={size} speed={160}
          style={{ filter: "contrast(1.06) saturate(1.08) drop-shadow(0 3px 4px #00000088)" }} />
      </div>
    </div>
  );
}

function RetroField({ spot, line, possession, teams, anim }) {
  const offT = TEAMS[possession];
  const defId = teams[0] === possession ? teams[1] : teams[0];
  const defT = TEAMS[defId];
  const pc = (m) => Math.max(1, Math.min(99, (m / FIELD) * 100));
  const [scene, setScene] = useState(null);
  const animRef = useRef(null);
  useEffect(() => {
    if (!anim || anim.id === animRef.current) return;
    animRef.current = anim.id;
    setScene({ ...anim, step: 0 });
    const ts = [setTimeout(() => setScene((sc) => sc && { ...sc, step: 1 }), 380),
                setTimeout(() => setScene((sc) => sc && { ...sc, step: 2 }), 950),
                setTimeout(() => setScene((sc) => sc && { ...sc, step: 3 }), 1650),
                setTimeout(() => setScene(null), 2650)];
    return () => ts.forEach(clearTimeout);
  }, [anim]);

  const losPct = pc(spot), fdPct = pc(line + TO_GAIN);
  const sc = scene, st = sc ? sc.step : -1;
  const fromPct = sc ? pc(sc.from ?? spot) : losPct;
  const toPct = sc ? pc(sc.to ?? spot) : losPct;
  const dist = Math.abs(toPct - fromPct);
  const runDur = Math.max(0.45, Math.min(1.25, dist * 0.02 + 0.3));
  const T = sc ? sc.type : null;
  const moving = T === "run" || T === "td";
  const passing = T === "pass" || T === "incomplete" || T === "int";
  const sacked = T === "sack";
  const fumb = T === "fumble";
  const pancake = T === "run" && sc && (sc.margin || 0) >= 25;
  const burned = sc && sc.burned;

  // --- choreography positions ---
  const qbBase = Math.max(losPct - 6, 1);
  const qbPct = passing || sacked ? (st >= 0 ? Math.max(qbBase - 3, 1) : qbBase) : qbBase; // dropback
  const routePct = passing ? (st === 0 ? Math.min(fromPct + dist * 0.55 + 4, 97) : toPct) : null; // receiver route
  const carrierPct = moving ? (st === 0 ? fromPct : toPct)
    : T === "pass" ? (st <= 1 ? routePct : Math.min(toPct + 3, 98))
    : passing ? routePct
    : losPct;
  // ball
  const sky = sc && sc.sky;
  const ballLeft = T === "kick" ? (st === 0 ? losPct : 96)
    : sky && passing ? toPct
    : passing ? (st === 0 ? qbPct + 2 : toPct)
    : (carrierPct ?? losPct);
  const ballTop = T === "kick" ? (st === 0 ? 101 : sc.good ? 13 : 0)
    : sky && passing ? (st === 0 ? -23 : st === 1 ? 57 : T === "incomplete" ? 172 : 114)
    : passing ? (st === 0 ? 94 : st === 1 ? 39 : T === "incomplete" ? 172 : T === "int" ? 127 : 114)
    : fumb ? (st === 0 ? 109 : st === 1 ? 44 : 159)
    : 114;
  // defenders: pursuit tracks the action
  const dlPct = sacked && st >= 1 ? qbPct + 1 : Math.min(losPct + 3, 96);
  const lbPct = moving && st >= 1 ? Math.max(toPct - 6, 3) : Math.min(losPct + 8, 97);
  const dbBase = Math.min(losPct + 14, 97);
  const dbPct = T === "int" && st >= 2 ? Math.max(toPct - 14, 2)
    : passing ? (burned ? Math.min(toPct + 11, 98) : st >= 1 ? toPct + 2 : dbBase)
    : moving && st >= 1 ? Math.max(toPct - 3, 4) : dbBase;
  const shake = (sacked || fumb) && st >= 1;

  const banner = sc && st >= 1 ? ({
    run: pancake && st >= 1 ? "PANCAKE!" : null,
    pass: sc.sky && st === 1 ? "FROM THE SKY!" : burned && st === 1 ? "BURNED!" : null,
    incomplete: st >= 2 ? "INCOMPLETE!" : null,
    sack: "SACK!", int: st >= 2 ? "PICKED OFF!" : null, fumble: "FUMBLE!",
    td: st >= 2 ? "TOUCHDOWN!" : null,
    kick: sc.good ? "IT'S GOOD!" : "WIDE LEFT!",
  })[T] : null;

  return (
    <div style={{ margin: "8px 0 12px" }}>
      <div className={shake ? "cb-shake" : ""} style={{ position: "relative", height: 221, borderRadius: 10, border: "3px solid #1B1B1B", overflow: "hidden", imageRendering: "pixelated", background: "#249039" }}>
        {/* arcade crowd band */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 16, background: "repeating-linear-gradient(90deg,#3A2E52 0 3px,#52341E 3px 6px,#24425A 6px 9px,#5A2430 9px 12px,#2E4A28 12px 15px)", borderBottom: "3px solid #101010", filter: "saturate(.8)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 4, height: 3, background: "repeating-linear-gradient(90deg,#E8D8A0 0 2px, transparent 2px 7px)", opacity: .5 }} />
        {/* high-contrast checkered turf */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 16, bottom: 0,
          background: "repeating-linear-gradient(90deg,#2FA653 0,#2FA653 4.545%,#1E7C3B 4.545%,#1E7C3B 9.09%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 16, bottom: 0,
          background: "repeating-linear-gradient(0deg, transparent 0 12px, #00000022 12px 24px)" }} />
        {/* bold chalk lines + 5m ticks */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 16, bottom: 0, background: "repeating-linear-gradient(90deg, transparent 0, transparent calc(9.09% - 2px), #FFFFFF calc(9.09% - 2px), #FFFFFF 9.09%)", opacity: .92 }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: "52%", height: 3, background: "repeating-linear-gradient(90deg, #FFFFFF88 0 4px, transparent 4px calc(4.545% + 0px))" }} />
        {/* sideline framing */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 16, height: 3, background: "#FFFFFF", opacity: .9 }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "#FFFFFF", opacity: .9 }} />
        <div style={{ position: "absolute", left: 0, top: 16, bottom: 0, width: "5%", background: `repeating-linear-gradient(45deg, ${offT.color} 0 6px, ${offT.dark} 6px 12px)`, borderRight: "3px solid #FFFFFF", boxShadow: "inset -4px 0 8px #00000066" }} />
        <div style={{ position: "absolute", right: 0, top: 16, bottom: 0, width: "5%", background: `repeating-linear-gradient(45deg, ${defT.color} 0 6px, ${defT.dark} 6px 12px)`, borderLeft: "3px solid #FFFFFF", boxShadow: "inset 4px 0 8px #00000066" }} />
        <div style={{ position: "absolute", left: `${losPct}%`, top: 16, bottom: 0, width: 3, background: "#5EC3E8", boxShadow: "0 0 0 1px #00000066, 0 0 8px #5EC3E877" }} />
        <div style={{ position: "absolute", left: `${fdPct}%`, top: 16, bottom: 0, width: 3, background: "#FFD86B", boxShadow: "0 0 0 1px #00000066, 0 0 10px #FFD86B" }} />

        {/* DEFENSE 3 */}
        <FieldSprite team={defId} facing={-1} dur={0.45} action="run"
          animate={!!((sacked && st >= 1) || (sc && sc.type === "run" && st >= 1 && !pancake))}
          frameIdx={0}
          flat={(fumb && st >= 2) || (pancake && st >= 1)}
          style={{ left: `calc(${sacked && st >= 1 ? qbPct + 2 : dlPct}% - 46px)`, top: 76 }} />
        <FieldSprite team={defId} facing={-1} dur={runDur} action="run"
          animate={!!(moving && st >= 1)} frameIdx={0}
          style={{ left: `calc(${lbPct}% - 46px)`, top: 30 }} />
        <FieldSprite team={defId} facing={-1} dur={runDur}
          action={T === "int" && st >= 1 ? (st === 1 ? "catch" : "run") : passing && st >= 1 && !burned ? "catch" : "run"}
          animate={!!((T === "int" && st >= 2) || (moving && st >= 1))}
          frameIdx={passing && st >= 1 && !burned ? 1 : 0}
          style={{ left: `calc(${dbPct}% - 46px)`, top: 122 }} />

        {/* OFFENSE 3 */}
        <FieldSprite team={possession} facing={1} dur={0.4} action="run"
          animate={!!sc} frameIdx={0} flat={sacked && st >= 1}
          style={{ left: `calc(${Math.max(losPct - 2, 2) + (sc && st >= 0 ? 1 : 0)}% - 46px)`, top: 76 }} />
        <FieldSprite team={possession} facing={1} dur={0.4}
          action={passing && st === 0 ? "throw" : "run"} animate={!!(passing && st === 0)}
          frameIdx={0} flat={sacked && st >= 2}
          style={{ left: `calc(${sacked && st >= 2 ? Math.max(qbPct - (sc.margin >= 25 ? 4 : 1), 1) : qbPct}% - 46px)`, top: 86 }} />
        <FieldSprite team={possession} facing={T === "int" && st >= 2 ? -1 : 1} dur={runDur}
          action={passing && st === 1 ? "catch" : T === "td" && st >= 2 ? "catch" : "run"}
          animate={!!(moving || (T === "pass" && st >= 2) || (T === "td" && st >= 2) || (passing && st === 1))}
          frameIdx={0}
          style={{ left: `calc(${carrierPct ?? losPct}% - 46px)`, top: T === "td" && st >= 2 ? 52 : 114 }} />

        {/* superstar sparkle trail */}
        {sc && sc.star && st >= 1 && [7, 13, 19].map((off, i) => (
          <span key={i} className="cb-sparkle" style={{ position: "absolute", left: `calc(${Math.max((carrierPct ?? losPct) - off * 0.9, 1)}% - 4px)`, top: 120 + (i % 2) * 18, color: "#FFD86B", fontSize: 12 + i * 2, animationDelay: `${i * 0.12}s`, textShadow: "0 0 6px #FFD86B" }}>✦</span>
        ))}

        {/* THE BALL */}
        <div style={{ position: "absolute", left: `calc(${ballLeft}% - 5px)`, top: ballTop,
          width: 10, height: 7, borderRadius: "50%", background: "#8B4513", border: "1px solid #4A2508", zIndex: 3,
          transition: `left ${passing || T === "kick" ? 0.55 : runDur}s ${st === 1 ? "cubic-bezier(.2,.7,.5,1)" : "cubic-bezier(.5,0,.8,.4)"}, top .5s ${st === 1 ? "cubic-bezier(.2,-0.6,.6,1)" : "ease-in"}` }}
          className={T === "kick" || (passing && st === 1) ? "cb-spiral" : ""}>
          <div style={{ position: "absolute", left: 2, top: 2, width: 5, height: 1, background: "#F2EFE2" }} />
        </div>

        {/* TD confetti */}
        {T === "td" && st >= 2 && Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="cb-confetti" style={{ position: "absolute", left: `${70 + (i * 17) % 28}%`, top: -6,
            width: 5, height: 5, background: i % 3 === 0 ? offT.color : i % 3 === 1 ? offT.color2 : "#FFD86B",
            animationDelay: `${(i % 6) * 0.13}s` }} />
        ))}

        {banner && (
          <div className="cb-banner" style={{ position: "absolute", left: 0, right: 0, top: 80, textAlign: "center", zIndex: 5,
            fontFamily: "'Courier New', monospace", fontWeight: "bold", fontSize: 26, letterSpacing: 4,
            color: ["TOUCHDOWN!", "IT'S GOOD!", "PANCAKE!", "BURNED!"].includes(banner) ? "#FFE28A" : "#FF6B4A",
            textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 0 14px #000" }}>
            {banner}
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#8FA08F", marginTop: 2, fontFamily: "Courier New, monospace" }}>
        <span>◄ OWN GOAL</span><span>{offT.glyph} BALL AT {spot}m · {FIELD - spot} TO PAY DIRT ⟶</span><span>END ZONE ►</span>
      </div>
    </div>
  );
}


function StatsPanel({ g, pT, aT, playerTeam, aiTeam, drivesPerQtr }) {
  const runs = g.playerRuns - 1, passes = g.playerPasses - 1; // seeded at 1
  const callTotal = Math.max(1, runs + passes);
  const runPct = Math.round((runs / callTotal) * 100);
  const toGo = Math.max(0, TO_GAIN - (g.spot - g.line));
  const st = g.stats;
  const tdRate = st.passAtt ? Math.round((st.passTD / st.passAtt) * 100) : 0;
  const incRate = st.passAtt ? Math.round((st.incompletions / st.passAtt) * 100) : 0;
  const row = (label, val, color) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0", borderBottom: "1px solid #ffffff10" }}>
      <span style={{ fontFamily: "Courier New, monospace", fontSize: 12, color: "#8FA08F", letterSpacing: 1 }}>{label}</span>
      <span style={{ fontFamily: "Impact, sans-serif", fontSize: 18, color: color || "#F2EFE2" }}>{val}</span>
    </div>
  );
  return (
    <div style={{ background: "#0A120D", border: "1px solid #2C5A44", borderRadius: 14, padding: 14, minHeight: 330, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontFamily: "Impact, sans-serif", letterSpacing: 2, fontSize: 15, color: "#FFD86B", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
        <span>📊</span> PLAYER STATS
      </div>

      {/* scoreline */}
      <div style={{ display: "flex", justifyContent: "space-between", background: "#0E1A13", borderRadius: 10, padding: "8px 12px", marginBottom: 6, border: "1px solid #2C5A44" }}>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontFamily: "Courier New, monospace", fontSize: 10, color: "#8FA08F", letterSpacing: 1 }}>{pT.city.toUpperCase()}</div>
          <div style={{ fontFamily: "Impact, sans-serif", fontSize: 30, color: g.possession === playerTeam ? "#FFD86B" : "#E9E4D3" }}>{g.score[playerTeam]}</div>
        </div>
        <div style={{ alignSelf: "center", fontFamily: "Impact, sans-serif", fontSize: 14, color: "#5E7263" }}>vs</div>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontFamily: "Courier New, monospace", fontSize: 10, color: "#8FA08F", letterSpacing: 1 }}>{aT.city.toUpperCase()}</div>
          <div style={{ fontFamily: "Impact, sans-serif", fontSize: 30, color: g.possession === aiTeam ? "#FFD86B" : "#E9E4D3" }}>{g.score[aiTeam]}</div>
        </div>
      </div>

      {/* game situation */}
      <div style={{ fontFamily: "Courier New, monospace", fontSize: 10, color: "#FFD86B", letterSpacing: 1, marginTop: 2, marginBottom: 2 }}>SITUATION</div>
      {row(g.ot ? "OVERTIME" : "QUARTER", g.ot ? "☠" : g.qtr, "#FFD86B")}
      {row("DRIVE", `${g.driveNum}/${drivesPerQtr}`)}
      {row("DOWN", g.down)}
      {row("YARDS TO GO", `${toGo}m`)}
      {row("BALL ON", `${g.spot}m`)}
      {row("POSSESSION", g.possession === playerTeam ? "YOU ●" : "MACHINE", g.possession === playerTeam ? "#9BD53C" : "#FF8A70")}

      {/* box score */}
      <div style={{ fontFamily: "Courier New, monospace", fontSize: 10, color: "#FFD86B", letterSpacing: 1, marginTop: 8, marginBottom: 2 }}>BOX SCORE</div>
      {row("PLAYS RUN", g.stats.plays)}
      {row("TOUCHDOWNS", g.stats.tds, "#9BD53C")}
      {row("TURNOVERS", g.stats.tos, g.stats.tos > 0 ? "#FF8A70" : "#F2EFE2")}

      {/* play-calling tendency */}
      <div style={{ fontFamily: "Courier New, monospace", fontSize: 10, color: "#FFD86B", letterSpacing: 1, marginTop: 8, marginBottom: 4 }}>YOUR TENDENCY</div>
      <div style={{ display: "flex", height: 20, borderRadius: 6, overflow: "hidden", border: "1px solid #2C5A44" }}>
        <div style={{ width: `${runPct}%`, background: "linear-gradient(90deg,#3C9663,#2A6B45)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Impact, sans-serif", fontSize: 10, color: "#F6F3E6" }}>{runPct >= 18 ? `RUN ${runPct}%` : ""}</div>
        <div style={{ flex: 1, background: "linear-gradient(90deg,#2E5A8E,#1E3E63)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Impact, sans-serif", fontSize: 10, color: "#F6F3E6" }}>{100 - runPct >= 18 ? `PASS ${100 - runPct}%` : ""}</div>
      </div>
      <div style={{ fontFamily: "Courier New, monospace", fontSize: 9, color: "#5E7263", marginTop: 4 }}>{runs + passes} offensive calls tracked · the Machine reads this.</div>

      {/* individual stat lines */}
      <div style={{ fontFamily: "Courier New, monospace", fontSize: 10, color: "#FFD86B", letterSpacing: 1, marginTop: 10, marginBottom: 2 }}>INDIVIDUAL STATS</div>
      {row("WR YARDS", `${st.wrYds}m`, "#7FC7F0")}
      {row("WR YAC", `${st.yac}m`, "#7FC7F0")}
      {row("RB YARDS", `${st.rbYds}m`, "#9BD53C")}
      {row("SACKS TAKEN", st.sacksTaken, st.sacksTaken > 0 ? "#FF8A70" : "#F2EFE2")}
      {row("INTs THROWN", st.intThrown, st.intThrown > 0 ? "#FF8A70" : "#F2EFE2")}
      {row("PASS TD / INC", `${st.passTD} / ${st.incompletions}`)}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0" }}>
        <span style={{ fontFamily: "Courier New, monospace", fontSize: 12, color: "#8FA08F", letterSpacing: 1 }}>TD / INC RATE</span>
        <span style={{ fontFamily: "Impact, sans-serif", fontSize: 15, color: "#FFD86B" }}>
          {tdRate}% <span style={{ color: "#5E7263", fontSize: 11 }}>td</span> · {incRate}% <span style={{ color: "#5E7263", fontSize: 11 }}>inc</span>
        </span>
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
      <img src={LOGO} alt="Customer Buttcheeks — The PolyMatic Football Card Game" style={{ width: "min(440px, 82vw)", margin: "8px 0 4px", filter: "drop-shadow(0 10px 30px #000)" }} />
      <p style={{ maxWidth: 540, color: "#B9C4B4", fontSize: 13, lineHeight: 1.7, marginTop: 16 }}>
        Commit <b style={{ color: "#FFD86B" }}>three cards</b> in secret. Your opponent does the same.
        SNAP — and everything is revealed. Full rosters from the league books, with the
        <b style={{ color: "#3DDC84" }}> green-lit SUPERSTARS</b> leading every franchise.
        Tap the <b style={{ color: "#FFD86B" }}>?</b> any time to learn the ropes.
      </p>
      <div style={{ marginTop: 22 }}><Btn big gold onClick={onPlay}>ENTER THE ARENA ➤</Btn></div>
      <div style={{ marginTop: 26, maxWidth: 560, border: "2px solid #C89019", borderRadius: 12, background: "linear-gradient(170deg,#141B0C,#0A0F0B)", padding: "14px 18px" }}>
        <div style={{ fontFamily: "Impact, sans-serif", fontSize: 13, letterSpacing: 3, color: "#FFD86B" }}>📖 FROM THE PAGES OF EPISODE 8</div>
        <div style={{ fontSize: 11.5, color: "#B9C4B4", lineHeight: 1.6, margin: "8px 0 10px", fontStyle: "italic" }}>
          Mid-tackle, star athlete Charlemagne Arceneaux-Wang gets yanked into a hundred-year-old version
          of his own sport. He has no idea why. The answer has something to do with an organization
          called Customer Buttcheeks.
        </div>
        <a href="https://a.co/d/0c1A8XNp" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
          <Btn gold onClick={() => {}}>BUY THE BOOK — CUSTOMER BUTTCHEEKS ➤</Btn>
        </a>
        <div style={{ fontSize: 8.5, color: "#5E7263", fontFamily: "Courier New, monospace", marginTop: 8 }}>
          OUR AMPLIFIED EARTH · ACT I OF THE SPORTS-SATIRE TRILOGY · PATRICK FRANCIS WATERS — CROWN & COFFIN LTD / THE LUXARIUM
        </div>
      </div>
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
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <OvrBadge ovr={t.ovr} />
                  <span style={{ width: 30, height: 30, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Crest t={t} size={22} /></span>
                </span>
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
                <Crest t={t} size={32} />
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
