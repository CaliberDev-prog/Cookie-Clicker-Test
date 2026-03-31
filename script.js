
// ═══════════════════════════════════════════════════════════════════════════════
// COOKIE CLICKER v3.1 — Improved Global Bakery
// ═══════════════════════════════════════════════════════════════════════════════

// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
// HOW TO SET UP (free, works on GitHub Pages, no server needed):
// 1. Go to https://console.firebase.google.com
// 2. Create a project → Build → Realtime Database → Create Database
// 3. Choose "Start in TEST mode" (allows public read/write — fine for a game)
// 4. Copy the URL shown (e.g. https://my-game-abc12-default-rtdb.firebaseio.com)
// 5. Paste it below replacing "YOUR-APP-default-rtdb"
const FIREBASE_URL = "https://cookie-clicker-7cc1f-default-rtdb.firebaseio.com/"; // ← REPLACE THIS
const LB_PATH      = "/leaderboard";

// ─── DEV LOG ──────────────────────────────────────────────────────────────────
const DEV_LOG = {
  show:    true,
  version: "v3.1",
  text:    `v3.1 — Quality & Leaderboard Overhaul\n\n• Real Firebase global leaderboard — works on GitHub Pages!\n• Fixed: Cookie Curse now requires actual clicks to break (was auto-breaking)\n• Fixed: curseClickCount resets properly between curses\n• Leaderboard: shows 🟢 online dot, last-seen time, CPS stat\n• Export/Import save game added to Settings\n• Notifications queue so they don't overlap\n• Prestige confirmation shows your new multiplier before you commit\n• Meteor click window extended (3–5s based on upgrades)\n• Mobile layout fixes\n• Sync on tab focus restored\n\nHappy baking! 🍪`
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SAVE_KEY = "cc_v100";

// ─── FORMAT ──────────────────────────────────────────────────────────────────
function fmt(n) {
  if (!isFinite(n) || n < 0) n = 0;
  if (n >= 1e18) return (n / 1e18).toFixed(2) + " Qi";
  if (n >= 1e15) return (n / 1e15).toFixed(2) + " Qa";
  if (n >= 1e12) return (n / 1e12).toFixed(2) + " T";
  if (n >= 1e9)  return (n / 1e9).toFixed(2)  + " B";
  if (n >= 1e6)  return (n / 1e6).toFixed(2)  + " M";
  if (n >= 1e3)  return (n / 1e3).toFixed(1)  + " K";
  return Math.floor(n).toLocaleString();
}

function fmtTime(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60)  return s + "s ago";
  const m = Math.floor(s / 60);
  if (m < 60)  return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24)  return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}

function esc(s) {
  return String(s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

// ─── BUILDINGS ───────────────────────────────────────────────────────────────
const BUILDINGS = [
  { key:"cursor",      icon:"👆", name:"Cursor",              baseCost:15,             cps:0.3,      cpcMult:0.05, desc:"Auto-clicks the cookie for you."          },
  { key:"grandma",     icon:"👵", name:"Grandma",             baseCost:100,            cps:1.5,      cpcMult:0.05, desc:"A gentle grandma baking cookies."         },
  { key:"bakery",      icon:"🧁", name:"Bakery",              baseCost:500,            cps:5,        cpcMult:0.05, desc:"A small local bakery, smells amazing."    },
  { key:"farm",        icon:"🌾", name:"Cookie Farm",         baseCost:1100,           cps:8,        cpcMult:0.04, desc:"Grows cookie plants from magic seeds."    },
  { key:"mine",        icon:"⛏️", name:"Chocolate Mine",      baseCost:12000,          cps:25,       cpcMult:0.04, desc:"Mines raw chocolate chips underground."   },
  { key:"factory",     icon:"🏭", name:"Factory",             baseCost:130000,         cps:100,      cpcMult:0.03, desc:"Mass-produces cookies around the clock."  },
  { key:"bank",        icon:"🏦", name:"Cookie Bank",         baseCost:1400000,        cps:400,      cpcMult:0.03, desc:"Invests cookies to yield passive returns." },
  { key:"temple",      icon:"🔮", name:"Cookie Temple",       baseCost:20000000,       cps:1500,     cpcMult:0.02, desc:"Prays to the cookie gods for daily gifts." },
  { key:"wizard",      icon:"🧙", name:"Wizard Tower",        baseCost:330000000,      cps:5000,     cpcMult:0.02, desc:"Conjures cookies from thin air."           },
  { key:"chocriver",   icon:"🍫", name:"Chocolate River",     baseCost:2000000000,     cps:12000,    cpcMult:0.02, desc:"A river of pure liquid chocolate."         },
  { key:"shipment",    icon:"🚀", name:"Shipment",            baseCost:5100000000,     cps:18000,    cpcMult:0.02, desc:"Imports cookies from the Cookie Planet."   },
  { key:"alchemy",     icon:"⚗️", name:"Alchemy Lab",         baseCost:75000000000,    cps:55000,    cpcMult:0.01, desc:"Transmutes gold into delicious cookies."   },
  { key:"portal",      icon:"🌀", name:"Portal",              baseCost:1e12,           cps:180000,   cpcMult:0.01, desc:"Opens rifts to cookie-rich dimensions."    },
  { key:"timemachine", icon:"⏱️", name:"Time Machine",        baseCost:14e12,          cps:550000,   cpcMult:0.01, desc:"Brings cookies from the future."           },
  { key:"antimatter",  icon:"🌌", name:"Antimatter Condenser",baseCost:1.7e14,         cps:1200000,  cpcMult:0.01, desc:"Condenses matter into pure cookie energy." },
  { key:"prism",       icon:"🌈", name:"Prism",               baseCost:2.1e14,         cps:1800000,  cpcMult:0.01, desc:"Converts pure light into cookies."         },
  { key:"chancemaker", icon:"🍀", name:"Chancemaker",         baseCost:3.3e15,         cps:6000000,  cpcMult:0.01, desc:"Harnesses luck to generate cookies."       },
  { key:"cookiedim",   icon:"🪐", name:"Cookie Dimension",    baseCost:5.1e16,         cps:22000000, cpcMult:0.01, desc:"An entire dimension made of cookies."      },
  { key:"idleverse",   icon:"🌠", name:"Idleverse",           baseCost:7.5e17,         cps:80000000, cpcMult:0.01, desc:"A parallel universe dedicated to baking."  },
];

// ─── UPGRADES ────────────────────────────────────────────────────────────────
const UPGRADES = [
  { id:1, icon:"⚡", name:"Nimble Fingers",  bonus:5,       cpsBonus:0.005, baseCost:50,          costMult:2.0 },
  { id:2, icon:"🔥", name:"Hot Oven",        bonus:30,      cpsBonus:0.01,  baseCost:500,         costMult:2.2 },
  { id:3, icon:"✨", name:"Magic Dough",     bonus:150,     cpsBonus:0.02,  baseCost:5000,        costMult:2.5 },
  { id:4, icon:"🤖", name:"Robot Baker",     bonus:800,     cpsBonus:0.03,  baseCost:50000,       costMult:2.8 },
  { id:5, icon:"🌟", name:"Cookie God",      bonus:5000,    cpsBonus:0.05,  baseCost:600000,      costMult:3.0 },
  { id:6, icon:"🪄", name:"Reality Bender",  bonus:35000,   cpsBonus:0.08,  baseCost:10000000,    costMult:3.5 },
  { id:7, icon:"💎", name:"Diamond Oven",    bonus:200000,  cpsBonus:0.12,  baseCost:500000000,   costMult:4.0 },
  { id:8, icon:"🌀", name:"Quantum Mixer",   bonus:1000000, cpsBonus:0.18,  baseCost:25000000000, costMult:4.5 },
];

// ─── SPECIAL ITEMS ────────────────────────────────────────────────────────────
const SPECIALS = [
  {
    id:"golden_cursor", icon:"✨", name:"Golden Cursor", style:"special-gold", cost:5000,
    desc:"+10% global CPC permanently.",
    effect: s => { s.spec_cpc_bonus = (s.spec_cpc_bonus||0) + 0.10; }
  },
  {
    id:"grandma_army", icon:"👵", name:"Grandma Army", style:"special-glow", cost:50000,
    desc:"Each grandma produces +50% more.",
    effect: s => { s.spec_grandma_mult = (s.spec_grandma_mult||1) * 1.5; }
  },
  {
    id:"lucky_cookie", icon:"🍀", name:"Fortune Cookie", style:"special-green", cost:200000,
    desc:"Golden cookies appear 2× as often and give bigger bonuses.",
    effect: s => { s.spec_golden_freq=(s.spec_golden_freq||1)*0.5; s.spec_golden_bonus=(s.spec_golden_bonus||1)*2; }
  },
  {
    id:"turbo_click", icon:"⚡", name:"Turbo Fingers", style:"special-gold", cost:1000000,
    desc:"5% chance per click to trigger a mini-frenzy (3× for 5s).",
    effect: s => { s.spec_turbo_click = true; }
  },
  {
    id:"offline_boost", icon:"💤", name:"Lazy Baker", style:"special-glow", cost:5000000,
    desc:"Earn 50% of your CPS while closed (up to 4h).",
    effect: s => { s.spec_offline = true; }
  },
  {
    id:"cookie_storm", icon:"🌪️", name:"Cookie Storm", style:"special-glow", cost:25000000,
    desc:"Instantly gain 30 minutes of your CPS.",
    repeatable: true,
    effect: s => {
      const bonus = calcCPS(s) * 1800;
      s.score += bonus; s.life += bonus;
      showNotif("🌪️ Cookie Storm! +" + fmt(bonus) + " cookies!");
    }
  },
  {
    id:"sugar_rush", icon:"🍬", name:"Sugar Rush", style:"special-gold", cost:100000000,
    desc:"Permanently adds 25% of CPS to click power.",
    effect: s => { s.spec_cps_to_cpc = (s.spec_cps_to_cpc||0) + 0.25; }
  },
  {
    id:"oracle_cookie", icon:"🔮", name:"Oracle Cookie", style:"special-glow", cost:1000000000,
    desc:"Prestige bonus multiplied by 1.5×.",
    effect: s => { s.spec_prestige_mult=(s.spec_prestige_mult||1)*1.5; recalcPrestige(s); }
  },
  {
    id:"quantum_bakery", icon:"🌌", name:"Quantum Bakery", style:"special-glow", cost:100000000000,
    desc:"+100% global CPS across all timelines.",
    effect: s => { s.spec_global_cps = (s.spec_global_cps||1) * 2; }
  },
  {
    id:"infinity_chip", icon:"♾️", name:"Infinity Chip", style:"special-gold", cost:1e15,
    desc:"Every 60s, gain a bonus equal to 120s of CPS.",
    effect: s => { s.spec_infinity = true; startInfinityTimer(); }
  },
  {
    id:"meteor_magnet", icon:"☄️", name:"Meteor Magnet", style:"special-gold", cost:3000000,
    desc:"Meteors appear 2× as often, stay longer, and give double cookies.",
    effect: s => { s.spec_meteor_freq=(s.spec_meteor_freq||1)*0.5; s.spec_meteor_bonus=(s.spec_meteor_bonus||1)*2; }
  },
  {
    id:"curse_ward", icon:"🛡️", name:"Curse Ward", style:"special-green", cost:8000000,
    desc:"Cookie Curse lasts 50% shorter.",
    effect: s => { s.spec_curse_ward = true; }
  },
  {
    id:"chain_master", icon:"🔗", name:"Chain Master", style:"special-gold", cost:500000,
    desc:"Click combo decays 30% slower.",
    effect: s => { s.spec_chain_slow = true; }
  },
];

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────
const ACH = [
  { id:"b100",    icon:"🍪", name:"First Batch",        cond: s => s.life >= 100          },
  { id:"b1k",     icon:"🍪", name:"Cookie Amateur",     cond: s => s.life >= 1e3          },
  { id:"b10k",    icon:"🍪", name:"Cookie Baker",       cond: s => s.life >= 1e4          },
  { id:"b100k",   icon:"🍪", name:"Cookie Chef",        cond: s => s.life >= 1e5          },
  { id:"b1m",     icon:"🍪", name:"Cookie Master",      cond: s => s.life >= 1e6          },
  { id:"b100m",   icon:"🍪", name:"Cookie Tycoon",      cond: s => s.life >= 1e8          },
  { id:"b1b",     icon:"🍪", name:"Cookie Legend",      cond: s => s.life >= 1e9          },
  { id:"b1t",     icon:"🍪", name:"Cookie Deity",       cond: s => s.life >= 1e12         },
  { id:"b1qa",    icon:"🍪", name:"Cookie Universe",    cond: s => s.life >= 1e15         },
  { id:"bld1",    icon:"🏗️", name:"First Building",     cond: s => totalBld(s) >= 1       },
  { id:"bld10",   icon:"🏗️", name:"Workforce",          cond: s => totalBld(s) >= 10      },
  { id:"bld50",   icon:"🏗️", name:"Empire",             cond: s => totalBld(s) >= 50      },
  { id:"bld100",  icon:"🏗️", name:"Megacorp",           cond: s => totalBld(s) >= 100     },
  { id:"bld200",  icon:"🏗️", name:"Industrial God",     cond: s => totalBld(s) >= 200     },
  { id:"bld500",  icon:"🏗️", name:"The Bakening",       cond: s => totalBld(s) >= 500     },
  { id:"allbld",  icon:"🌐", name:"Diversified",        cond: s => BUILDINGS.every(b => (s.bld[b.key]||0) >= 1) },
  { id:"cps10",   icon:"⏱️", name:"Passive Income",     cond: s => calcCPS(s) >= 10       },
  { id:"cps100",  icon:"⏱️", name:"Cookie Factory",     cond: s => calcCPS(s) >= 100      },
  { id:"cps1k",   icon:"⏱️", name:"Industrial Baker",   cond: s => calcCPS(s) >= 1000     },
  { id:"cps10k",  icon:"⏱️", name:"Cookie Titan",       cond: s => calcCPS(s) >= 10000    },
  { id:"cps1m",   icon:"⏱️", name:"Cosmic Baker",       cond: s => calcCPS(s) >= 1000000  },
  { id:"upg1",    icon:"⚡", name:"Upgraded!",          cond: s => s.upgrades.some(v => v > 0)  },
  { id:"upg_all", icon:"⚡", name:"Min-Maxer",          cond: s => s.upgrades.every(v => v > 0) },
  { id:"upg10",   icon:"⚡", name:"Power User",         cond: s => s.upgrades.reduce((a,b)=>a+b,0) >= 10 },
  { id:"pres1",   icon:"✨", name:"Born Again",          cond: s => s.prestige >= 1        },
  { id:"pres5",   icon:"✨", name:"Veteran Baker",       cond: s => s.prestige >= 5        },
  { id:"pres10",  icon:"✨", name:"Eternal Baker",       cond: s => s.prestige >= 10       },
  { id:"cpc1k",   icon:"👆", name:"Power Click",        cond: () => calcCPC() >= 1000     },
  { id:"cpc1m",   icon:"👆", name:"Mega Click",         cond: () => calcCPC() >= 1e6      },
  { id:"cpc1b",   icon:"👆", name:"Galaxy Click",       cond: () => calcCPC() >= 1e9      },
  { id:"clk100",  icon:"👆", name:"Dedicated",          cond: s => s.totalClicks >= 100   },
  { id:"clk1k",   icon:"👆", name:"Clicker",            cond: s => s.totalClicks >= 1000  },
  { id:"clk10k",  icon:"👆", name:"Click Addict",       cond: s => s.totalClicks >= 10000 },
  { id:"clk100k", icon:"👆", name:"Carpal Tunnel",      cond: s => s.totalClicks >= 100000},
  { id:"spec1",   icon:"🎁", name:"Special Treatment",  cond: s => Object.keys(s.specials||{}).length >= 1 },
  { id:"spec5",   icon:"🎁", name:"Special Collector",  cond: s => Object.keys(s.specials||{}).length >= 5 },
  { id:"golden1", icon:"🌟", name:"Lucky!",             cond: s => (s.goldenCollected||0) >= 1   },
  { id:"golden10",icon:"🌟", name:"Fortune Favors You", cond: s => (s.goldenCollected||0) >= 10  },
  { id:"golden50",icon:"🌟", name:"Golden Touch",       cond: s => (s.goldenCollected||0) >= 50  },
  { id:"frenzy1", icon:"🔥", name:"On Fire!",           cond: s => (s.frenziesHad||0) >= 1       },
  { id:"frenzy5", icon:"🔥", name:"Frenzy Master",      cond: s => (s.frenziesHad||0) >= 5       },
  { id:"meteor1", icon:"☄️", name:"Meteorite!",         cond: s => (s.meteorsCollected||0) >= 1  },
  { id:"meteor10",icon:"☄️", name:"Meteor Shower",      cond: s => (s.meteorsCollected||0) >= 10 },
  { id:"bliz1",   icon:"❄️", name:"First Snowfall",     cond: s => (s.blizzardsHad||0) >= 1      },
  { id:"combo5",  icon:"🔗", name:"Combo Starter",      cond: s => (s.maxCombo||0) >= 5          },
  { id:"combo20", icon:"🔗", name:"Combo Master",       cond: s => (s.maxCombo||0) >= 20         },
  { id:"curse1",  icon:"💀", name:"Cursed!",            cond: s => (s.cursesHad||0) >= 1         },
  { id:"curse5",  icon:"💀", name:"Curse Survivor",     cond: s => (s.cursesHad||0) >= 5         },
  { id:"midnight",icon:"🌙", name:"Night Baker",        cond: s => (s.midnightBonus||0) >= 1     },
];

// ─── PATCH NOTES ─────────────────────────────────────────────────────────────
const PATCH_NOTES = [
  {
    version:"v3.1", date:"Quality & Leaderboard Fix",
    text:"Real Firebase global leaderboard (GitHub Pages compatible). Fixed curse-break requiring actual clicks. Export/Import save. Queued notifications. Better prestige confirm dialog."
  },
  {
    version:"v3.0", date:"The Global Bakery Update",
    text:"Global leaderboard. Bakery naming. Meteor Cookies, Cookie Blizzard, Cookie Curse, Midnight Bonus. Chain click combos. 8 new achievements."
  },
  {
    version:"v2.0", date:"The Big Bakery Update",
    text:"Golden Cookies, Frenzy, Special Items, 6 new buildings, 8 upgrades, mobile nav, offline earnings."
  },
  {
    version:"v1.0", date:"Launch",
    text:"Initial release! 14 buildings, 6 upgrades, 24 achievements, prestige system."
  }
];

// ─── STATE ───────────────────────────────────────────────────────────────────
let S = {
  score:0, life:0,
  upgrades: new Array(UPGRADES.length).fill(0),
  bld:{}, ach:{}, specials:{},
  prestige:0, pmult:1,
  totalClicks:0,
  goldenCollected:0, meteorsCollected:0,
  frenziesHad:0, blizzardsHad:0, cursesHad:0,
  midnightBonus:0, maxCombo:0,
  lastSave: Date.now(),
  spec_cpc_bonus:0, spec_grandma_mult:1,
  spec_golden_freq:1, spec_golden_bonus:1,
  spec_global_cps:1, spec_cps_to_cpc:0,
  spec_prestige_mult:1,
  spec_turbo_click:false, spec_offline:false, spec_infinity:false,
  spec_meteor_freq:1, spec_meteor_bonus:1,
  spec_curse_ward:false, spec_chain_slow:false,
};
BUILDINGS.forEach(b => { S.bld[b.key] = 0; });

// ─── AUDIO ───────────────────────────────────────────────────────────────────
let AUDIO = { sfxOn:true, sfxVol:0.6 };
let audioCtx = null;
let audioUnlocked = false;

function initAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
}

function getAudioCtx() {
  if (!audioCtx) return null;
  if (audioCtx.state === "suspended") audioCtx.resume().catch(()=>{});
  return audioCtx;
}

function toggleSFX() {
  AUDIO.sfxOn = !AUDIO.sfxOn;
  const btn = document.getElementById("sfx-toggle");
  if (btn) { btn.textContent = AUDIO.sfxOn ? "ON" : "OFF"; btn.classList.toggle("off", !AUDIO.sfxOn); }
  saveAudioPrefs();
}

function setSFXVol(v) {
  AUDIO.sfxVol = v / 100;
  const valEl = document.getElementById("sfx-vol-val");
  if (valEl) valEl.textContent = v + "%";
  saveAudioPrefs();
}

function saveAudioPrefs() {
  try { localStorage.setItem("cc_audio", JSON.stringify(AUDIO)); } catch(e) {}
}

function loadAudioPrefs() {
  try {
    const raw = localStorage.getItem("cc_audio");
    if (raw) {
      const p = JSON.parse(raw);
      if (typeof p.sfxOn  === "boolean") AUDIO.sfxOn  = p.sfxOn;
      if (typeof p.sfxVol === "number")  AUDIO.sfxVol = p.sfxVol;
    }
  } catch(e) {}
  const sToggle = document.getElementById("sfx-toggle");
  const sVol    = document.getElementById("sfx-vol");
  const sVal    = document.getElementById("sfx-vol-val");
  if (sToggle) { sToggle.textContent = AUDIO.sfxOn?"ON":"OFF"; sToggle.classList.toggle("off",!AUDIO.sfxOn); }
  const svPct = Math.round(AUDIO.sfxVol * 100);
  if (sVol) sVol.value = svPct;
  if (sVal) sVal.textContent = svPct + "%";
}

function playSFX(type) {
  if (!AUDIO.sfxOn) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const vol = AUDIO.sfxVol;
  try {
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === "click") {
      const osc = ctx.createOscillator(); osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(900, now+0.04);
      gain.gain.setValueAtTime(vol*0.15, now); gain.gain.linearRampToValueAtTime(0, now+0.08);
      osc.connect(gain); osc.start(now); osc.stop(now+0.1);
    } else if (type === "buy") {
      [0,0.07].forEach((t,i) => {
        const o = ctx.createOscillator(); o.type="sine"; o.frequency.value=440+i*220;
        gain.gain.setValueAtTime(vol*0.12,now+t); gain.gain.linearRampToValueAtTime(0,now+t+0.12);
        o.connect(gain); o.start(now+t); o.stop(now+t+0.15);
      });
    } else if (type === "upgrade") {
      [0,0.1,0.2].forEach((t,i) => {
        const o = ctx.createOscillator(); o.type="triangle"; o.frequency.value=523+i*262;
        gain.gain.setValueAtTime(vol*0.13,now+t); gain.gain.linearRampToValueAtTime(0,now+t+0.15);
        o.connect(gain); o.start(now+t); o.stop(now+t+0.2);
      });
    } else if (type === "golden") {
      const osc = ctx.createOscillator(); osc.type="sine";
      osc.frequency.setValueAtTime(880,now); osc.frequency.linearRampToValueAtTime(1760,now+0.3);
      gain.gain.setValueAtTime(vol*0.2,now); gain.gain.linearRampToValueAtTime(0,now+0.4);
      osc.connect(gain); osc.start(now); osc.stop(now+0.45);
    } else if (type === "meteor") {
      [0,0.1,0.2].forEach((t,i) => {
        const o = ctx.createOscillator(); o.type="sawtooth"; o.frequency.value=300-i*80;
        gain.gain.setValueAtTime(vol*0.18,now+t); gain.gain.linearRampToValueAtTime(0,now+t+0.2);
        o.connect(gain); o.start(now+t); o.stop(now+t+0.25);
      });
    } else if (type === "curse") {
      const osc = ctx.createOscillator(); osc.type="sawtooth";
      osc.frequency.setValueAtTime(200,now); osc.frequency.linearRampToValueAtTime(80,now+0.5);
      gain.gain.setValueAtTime(vol*0.15,now); gain.gain.linearRampToValueAtTime(0,now+0.55);
      osc.connect(gain); osc.start(now); osc.stop(now+0.6);
    } else if (type === "combo") {
      const osc = ctx.createOscillator(); osc.type="sine";
      const pitch = Math.min(440 + comboCount * 25, 1200);
      osc.frequency.setValueAtTime(pitch,now); osc.frequency.linearRampToValueAtTime(pitch*2,now+0.06);
      gain.gain.setValueAtTime(vol*0.1,now); gain.gain.linearRampToValueAtTime(0,now+0.1);
      osc.connect(gain); osc.start(now); osc.stop(now+0.12);
    }
  } catch(e) {}
}

// ─── PLAYER IDENTITY ─────────────────────────────────────────────────────────
let bakeryName = "";
let playerId   = "";

function generateId() {
  return Math.random().toString(36).substr(2,10) + Date.now().toString(36);
}

function initPlayerIdentity() {
  bakeryName = localStorage.getItem("cc_bakery_name") || "";
  playerId   = localStorage.getItem("cc_player_id")   || generateId();
  localStorage.setItem("cc_player_id", playerId);
}

// ─── BAKERY NAME MODAL ────────────────────────────────────────────────────────
function showBakeryNameModal() {
  const modal = document.getElementById("bakery-name-modal");
  if (modal) modal.classList.remove("hidden");
  const input = document.getElementById("bakery-name-input");
  if (!input) return;
  input.focus();
  const charEl = document.getElementById("bakery-name-char");
  input.oninput = () => { if (charEl) charEl.textContent = 28 - input.value.length; };
  input.onkeydown = e => { if (e.key === "Enter") confirmBakeryName(); };
}

function confirmBakeryName() {
  const input = document.getElementById("bakery-name-input");
  const raw   = input ? input.value.trim() : "";
  bakeryName  = sanitizeName(raw) || "Anonymous Bakery";
  localStorage.setItem("cc_bakery_name", bakeryName);
  document.getElementById("bakery-name-modal")?.classList.add("hidden");
  updateBakeryLogoName();
  initAudio();
  showDevlog();
  setTimeout(() => syncLeaderboard(), 1500);
}

function sanitizeName(str) {
  return str.replace(/[<>"'&]/g,"").substring(0,28).trim();
}

function updateBakeryLogoName() {
  const el = document.getElementById("bakery-logo-name");
  if (el) el.textContent = bakeryName || "My Bakery";
  const ni = document.getElementById("lb-name-input");
  if (ni) ni.value = bakeryName;
}

// ─── EVENT STATE ──────────────────────────────────────────────────────────────
let buyQty            = 1;
let frenzyActive      = false;
let frenzyMult        = 1;
let frenzyTimeoutId   = null;
let goldenVisible     = false;
let goldenTimeoutId   = null;
let meteorVisible     = false;
let meteorTimeoutId   = null;
let blizzardActive    = false;
let blizzardTimeoutId = null;
let blizzardIntervalId= null;
let curseActive       = false;
let curseTimeoutId    = null;
let curseClickCount   = 0;   // ← Only incremented by real player clicks (bug fixed)
let infinityIntervalId= null;

// ─── CHAIN COMBO ─────────────────────────────────────────────────────────────
let comboCount = 0;
let comboTimer = null;

function getComboMult() {
  if (comboCount <= 1) return 1;
  return Math.min(1 + (comboCount - 1) * 0.1, 5);
}

function updateCombo() {
  comboCount++;
  if (comboCount > (S.maxCombo||0)) S.maxCombo = comboCount;
  clearTimeout(comboTimer);
  comboTimer = setTimeout(() => { comboCount = 0; }, S.spec_chain_slow ? 1300 : 1000);
  if (comboCount >= 5) playSFX("combo");
}

// ─── CORE CALCULATIONS ───────────────────────────────────────────────────────
function totalBld(s) {
  return BUILDINGS.reduce((t,b) => t + (s.bld[b.key]||0), 0);
}

function calcCPS(s) {
  let raw = BUILDINGS.reduce((t,b) => {
    let cps = b.cps;
    if (b.key === "grandma") cps *= (s.spec_grandma_mult||1);
    return t + (s.bld[b.key]||0) * cps;
  }, 0);
  let result = raw * s.pmult * (s.spec_global_cps||1);
  if (curseActive) result *= 0.5;
  return result;
}

function calcCPC() {
  const cps = calcCPS(S);
  let flatBonus=0, cpsScale=0, bldBoost=0;
  UPGRADES.forEach((u,i) => {
    flatBonus += (S.upgrades[i]||0) * u.bonus;
    cpsScale  += (S.upgrades[i]||0) * u.cpsBonus;
  });
  BUILDINGS.forEach(b => { bldBoost += (S.bld[b.key]||0) * b.cps * b.cpcMult; });
  const cpsToCpc = cps * (S.spec_cps_to_cpc||0);
  const base = (1 + flatBonus + cps * cpsScale + bldBoost + cpsToCpc) * S.pmult;
  return base * (1 + (S.spec_cpc_bonus||0));
}

function getUpgCost(i) {
  return Math.floor(UPGRADES[i].baseCost * Math.pow(UPGRADES[i].costMult, S.upgrades[i]||0));
}

function getBldCostN(key, n) {
  const b = BUILDINGS.find(x => x.key === key);
  return Math.floor(b.baseCost * Math.pow(1.15, (S.bld[key]||0) + n));
}

function getBldCostBulk(key, qty) {
  let total = 0;
  for (let i=0; i<qty; i++) total += getBldCostN(key, i);
  return total;
}

function maxAffordable(key) {
  let count=0, total=0;
  while (count < 2000) {
    const next = getBldCostN(key, count);
    if (total + next > S.score) break;
    total += next; count++;
  }
  return count;
}

function recalcPrestige(s) {
  s.pmult = Math.pow(1.05, s.prestige) * (s.spec_prestige_mult||1);
}

// ─── PURCHASING ───────────────────────────────────────────────────────────────
function setBuyQty(qty, btn) {
  buyQty = qty;
  document.querySelectorAll(".qty-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderBuildings();
}

function buyBld(key) {
  let purchased = 0;
  if (buyQty === "max") {
    while (true) {
      const cost = getBldCostN(key, 0);
      if (S.score < cost) break;
      S.score -= cost; S.bld[key]=(S.bld[key]||0)+1; purchased++;
    }
  } else {
    const qty  = parseInt(buyQty);
    const cost = getBldCostBulk(key, qty);
    if (S.score < cost) return;
    S.score -= cost; S.bld[key]=(S.bld[key]||0)+qty; purchased=qty;
  }
  if (purchased > 0) { playSFX("buy"); save(); scheduleDisplay(); }
}

function addUpgrade(idx) {
  const i    = idx - 1;
  const cost = getUpgCost(i);
  if (S.score < cost) return;
  S.score -= cost; S.upgrades[i]=(S.upgrades[i]||0)+1;
  playSFX("upgrade"); save(); scheduleDisplay();
}

function buySpecial(id) {
  const sp = SPECIALS.find(s => s.id === id);
  if (!sp || (!sp.repeatable && S.specials[id]) || S.score < sp.cost) return;
  S.score -= sp.cost;
  if (!sp.repeatable) S.specials[id] = true;
  sp.effect(S);
  playSFX("upgrade"); save(); scheduleDisplay(); renderSpecials();
}

// ─── CLICK HANDLING ──────────────────────────────────────────────────────────
let lastTouchTime = 0;

function handleClickTouch(e) {
  e.preventDefault();
  const now = Date.now();
  if (now - lastTouchTime < 40) return;
  lastTouchTime = now;
  doClick(e.touches ? e.touches[0] : e);
  initAudio();
}

function handleClick(e) {
  if (Date.now() - lastTouchTime < 100) return;
  doClick(e);
  initAudio();
}

function doClick(e) {
  updateCombo();
  const combo   = getComboMult();
  const frenzyM = frenzyActive ? frenzyMult : 1;
  let cpc = calcCPC() * frenzyM * combo;

  if (S._clickStormBonus && S._clickStormEnd > Date.now()) cpc += S._clickStormBonus;

  S.score += cpc; S.life += cpc;
  S.totalClicks = (S.totalClicks||0) + 1;

  const cls = frenzyActive ? "frenzy-float" : (combo >= 3 ? "golden-float" : "");
  if (e) spawnFloat(e.clientX, e.clientY, cpc, cls);
  if (comboCount >= 3) spawnComboLabel(e ? e.clientX : window.innerWidth/2, e ? e.clientY : window.innerHeight/2);

  const btn = document.getElementById("cookie-btn");
  if (btn) { btn.classList.remove("clicked"); void btn.offsetWidth; btn.classList.add("clicked"); }

  // ✅ FIXED: Curse break only by actual clicks (removed from passive tick)
  if (curseActive) {
    curseClickCount++;
    const needed = 20;
    // Show progress hint every 5 clicks
    if (curseClickCount % 5 === 0 && curseClickCount < needed) {
      showNotif(`💀 Curse: ${curseClickCount}/${needed} clicks to break!`);
    }
    if (curseClickCount >= needed) {
      curseClickCount = 0;
      clearTimeout(curseTimeoutId);
      curseActive = false;
      playSFX("upgrade");
      showNotif("💪 Curse broken! CPS restored!");
      scheduleCurse();
    }
  }

  if (S.spec_turbo_click && Math.random() < 0.05) {
    startFrenzy(3, 5000, "⚡ Turbo Click! 3× for 5s!");
  }

  playSFX("click");
  scheduleDisplay();
}

function spawnFloat(x, y, n, cls) {
  const el = document.createElement("div");
  el.className   = "float-txt" + (cls ? " " + cls : "");
  el.textContent = "+" + fmt(n);
  el.style.left  = (x - 20 + (Math.random()*30-15)) + "px";
  el.style.top   = (y - 12) + "px";
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove(), { once:true });
}

function spawnComboLabel(x, y) {
  const el = document.createElement("div");
  el.className   = "float-txt golden-float combo-label";
  el.textContent = `${comboCount}× COMBO`;
  el.style.left  = (x - 30 + Math.random()*20) + "px";
  el.style.top   = (y - 30) + "px";
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove(), { once:true });
}

// ─── FRENZY ──────────────────────────────────────────────────────────────────
function startFrenzy(mult, duration, label) {
  frenzyActive  = true;
  frenzyMult    = mult;
  S.frenziesHad = (S.frenziesHad||0) + 1;

  const banner = document.getElementById("frenzy-banner");
  const text   = document.getElementById("frenzy-text");
  const prog   = document.getElementById("frenzy-progress");
  if (banner) banner.classList.remove("hidden");
  if (text)   text.textContent = label || ("🔥 Frenzy! " + mult + "× cookies!");
  if (prog) {
    prog.style.transition = "none";
    prog.style.width = "100%";
    requestAnimationFrame(() => {
      prog.style.transition = "width " + (duration/1000) + "s linear";
      prog.style.width = "0%";
    });
  }

  clearTimeout(frenzyTimeoutId);
  frenzyTimeoutId = setTimeout(() => {
    frenzyActive = false; frenzyMult = 1;
    if (banner) banner.classList.add("hidden");
  }, duration);
}

// ─── GOLDEN COOKIE ────────────────────────────────────────────────────────────
function scheduleGolden() {
  if (goldenVisible) return;
  const delay = 30000 * (S.spec_golden_freq||1) * (0.5 + Math.random());
  setTimeout(spawnGolden, delay);
}

function spawnGolden() {
  if (goldenVisible) return;
  goldenVisible = true;
  const el = document.getElementById("golden-cookie");
  if (!el) { goldenVisible=false; scheduleGolden(); return; }
  const pad = 80;
  el.style.left = (pad + Math.random()*(window.innerWidth -pad*2-70))  + "px";
  el.style.top  = (pad + Math.random()*(window.innerHeight-pad*2-100)) + "px";
  el.classList.remove("hidden");
  clearTimeout(goldenTimeoutId);
  goldenTimeoutId = setTimeout(() => {
    goldenVisible = false; el.classList.add("hidden"); scheduleGolden();
  }, 15000);
}

function collectGolden() {
  if (!goldenVisible) return;
  goldenVisible = false;
  clearTimeout(goldenTimeoutId);
  document.getElementById("golden-cookie")?.classList.add("hidden");
  S.goldenCollected = (S.goldenCollected||0) + 1;

  const bonus = S.spec_golden_bonus || 1;
  const roll  = Math.random();
  if (roll < 0.4) {
    const gained = calcCPS(S) * 900 * bonus;
    S.score += gained; S.life += gained;
    showNotif("🌟 Lucky! +" + fmt(gained) + " cookies!");
    spawnFloat(window.innerWidth/2, window.innerHeight/2, gained, "golden-float");
  } else if (roll < 0.7) {
    const mult = Math.max(7, Math.floor(7 * bonus));
    startFrenzy(mult, 30000, "🌟 Golden Frenzy! " + mult + "× for 30s!");
    showNotif("🌟 Golden Frenzy! " + mult + "×!");
  } else {
    const clickBonus = Math.floor(777 * bonus);
    S._clickStormBonus = clickBonus;
    S._clickStormEnd   = Date.now() + 13000;
    showNotif("🌟 Click Storm! +" + fmt(clickBonus) + " per click for 13s!");
    setTimeout(() => { S._clickStormBonus=0; S._clickStormEnd=0; }, 13000);
  }
  playSFX("golden");
  scheduleGolden();
}

// ─── METEOR ──────────────────────────────────────────────────────────────────
function scheduleMeteor() {
  if (meteorVisible) return;
  const delay = 120000 * (S.spec_meteor_freq||1) * (0.5 + Math.random());
  setTimeout(spawnMeteor, delay);
}

function spawnMeteor() {
  if (meteorVisible) return;
  meteorVisible = true;
  const el = document.getElementById("meteor-cookie");
  if (!el) { meteorVisible=false; scheduleMeteor(); return; }
  el.style.left = (Math.random() * window.innerWidth * 0.5) + "px";
  el.style.top  = (-60 + Math.random()*40) + "px";
  el.classList.remove("hidden");
  // Extended click window with meteor magnet
  const windowMs = (S.spec_meteor_bonus||1) > 1 ? 5000 : 3000;
  clearTimeout(meteorTimeoutId);
  meteorTimeoutId = setTimeout(() => {
    meteorVisible=false; el.classList.add("hidden"); scheduleMeteor();
  }, windowMs);
}

function collectMeteor() {
  if (!meteorVisible) return;
  meteorVisible = false;
  clearTimeout(meteorTimeoutId);
  document.getElementById("meteor-cookie")?.classList.add("hidden");
  S.meteorsCollected = (S.meteorsCollected||0) + 1;
  const gained = calcCPS(S) * 3600 * (S.spec_meteor_bonus||1);
  S.score += gained; S.life += gained;
  playSFX("meteor");
  showNotif("☄️ Meteor! +" + fmt(gained) + " cookies (1hr CPS)!");
  spawnFloat(window.innerWidth*0.3, window.innerHeight*0.3, gained, "meteor-float");
  scheduleMeteor();
}

// ─── BLIZZARD ─────────────────────────────────────────────────────────────────
function scheduleBlizzard() {
  setTimeout(startBlizzard, 180000 + Math.random()*180000);
}

function startBlizzard() {
  if (blizzardActive || frenzyActive) { scheduleBlizzard(); return; }
  blizzardActive = true;
  S.blizzardsHad = (S.blizzardsHad||0) + 1;
  const dur = 20000;

  const banner = document.getElementById("blizzard-banner");
  const text   = document.getElementById("blizzard-text");
  const prog   = document.getElementById("blizzard-progress");
  if (banner) banner.classList.remove("hidden");
  if (text)   text.textContent = "❄️ Cookie Blizzard! Cookies are raining!";
  if (prog) {
    prog.style.transition = "none"; prog.style.width = "100%";
    requestAnimationFrame(() => { prog.style.transition="width "+(dur/1000)+"s linear"; prog.style.width="0%"; });
  }
  showNotif("❄️ Cookie Blizzard started!");

  blizzardIntervalId = setInterval(() => {
    const rain = calcCPS(S) * (2 + Math.random()*3);
    S.score += rain; S.life += rain;
    spawnFloat(80+Math.random()*(window.innerWidth-160), 80+Math.random()*(window.innerHeight*0.5), rain, "blizzard-float");
  }, 1000);

  clearTimeout(blizzardTimeoutId);
  blizzardTimeoutId = setTimeout(() => {
    blizzardActive = false;
    clearInterval(blizzardIntervalId);
    document.getElementById("blizzard-banner")?.classList.add("hidden");
    scheduleBlizzard();
  }, dur);
}

// ─── CURSE ───────────────────────────────────────────────────────────────────
function scheduleCurse() {
  if (calcCPS(S) < 10) { setTimeout(scheduleCurse, 60000); return; }
  setTimeout(startCurse, 240000 + Math.random()*240000);
}

function startCurse() {
  if (curseActive) { scheduleCurse(); return; }
  curseActive     = true;
  curseClickCount = 0;   // ← reset on each new curse
  S.cursesHad     = (S.cursesHad||0) + 1;
  const dur = S.spec_curse_ward ? 15000 : 30000;

  playSFX("curse");
  showNotif(`💀 Cookie Curse! CPS halved for ${dur/1000}s — click 20× to break it!`);
  if (S.spec_curse_ward) showNotif("🛡️ Curse Ward: duration halved!");

  clearTimeout(curseTimeoutId);
  curseTimeoutId = setTimeout(() => {
    curseActive     = false;
    curseClickCount = 0;
    showNotif("✨ Curse lifted! CPS restored.");
    scheduleCurse();
  }, dur);
}

// ─── MIDNIGHT BONUS ──────────────────────────────────────────────────────────
function checkMidnightBonus() {
  const hour = new Date().getHours();
  if (hour < 0 || hour >= 2) return;
  const key = "cc_midnight_" + new Date().toDateString();
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, "1");
  S.midnightBonus = (S.midnightBonus||0) + 1;
  const bonus = calcCPS(S) * 7200;
  S.score += bonus; S.life += bonus;
  playSFX("golden");
  showNotif("🌙 Midnight Bonus! +" + fmt(bonus) + " cookies!");
}

// ─── INFINITY CHIP ────────────────────────────────────────────────────────────
function startInfinityTimer() {
  if (infinityIntervalId) return;
  infinityIntervalId = setInterval(() => {
    if (!S.spec_infinity) { clearInterval(infinityIntervalId); infinityIntervalId=null; return; }
    const bonus = calcCPS(S) * 120;
    S.score += bonus; S.life += bonus;
    showNotif("♾️ Infinity Chip: +" + fmt(bonus) + " cookies!");
  }, 60000);
}

// ─── PRESTIGE ─────────────────────────────────────────────────────────────────
function doPrestige() {
  if (S.life < 1e9) return;
  const nextMult = (Math.pow(1.05, S.prestige+1) * (S.spec_prestige_mult||1)).toFixed(3);
  if (!confirm(`Prestige #${S.prestige+1}?\n\nNew global multiplier: ${nextMult}×\n\nCookies, buildings & upgrades reset.\nSpecial items & achievements kept.`)) return;
  S.prestige++;
  recalcPrestige(S);
  S.score    = 0; S.life = 0;
  S.upgrades = new Array(UPGRADES.length).fill(0);
  BUILDINGS.forEach(b => { S.bld[b.key] = 0; });
  playSFX("upgrade");
  showNotif(`✨ Prestige! ${S.pmult.toFixed(3)}× global bonus active!`);
  save(); scheduleDisplay();
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
function showTab(name, el) {
  document.querySelectorAll(".pane").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById("tab-" + name)?.classList.add("active");
  el.classList.add("active");
  if (name === "leaderboard") loadLeaderboard();
}

// ─── MOBILE NAV ───────────────────────────────────────────────────────────────
function mobileShowPanel(panel, btn) {
  document.querySelectorAll(".mnav-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const left  = document.getElementById("left-panel");
  const right = document.getElementById("right-panel");
  if (panel === "bake") {
    if (left)  { left.style.display="flex";  left.classList.add("mobile-active"); }
    if (right) { right.style.display="none"; right.classList.remove("mobile-active"); }
  } else {
    if (left)  { left.style.display="none";  left.classList.remove("mobile-active"); }
    if (right) { right.style.display="flex"; right.classList.add("mobile-active"); }
    const tabMap = { more:"achievements", buildings:"buildings", upgrades:"upgrades", leaderboard:"leaderboard" };
    const tabBtn = document.getElementById("tab-btn-" + (tabMap[panel]||panel));
    if (tabBtn) showTab(tabMap[panel]||panel, tabBtn);
  }
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function openSettings() {
  document.getElementById("settings-modal")?.classList.remove("hidden");
  const ni = document.getElementById("lb-name-input");
  if (ni) ni.value = bakeryName;
}

function closeSettings() {
  document.getElementById("settings-modal")?.classList.add("hidden");
}

function saveLeaderboardName() {
  const input = document.getElementById("lb-name-input");
  if (!input) return;
  const val = sanitizeName(input.value.trim()) || "Anonymous Bakery";
  bakeryName = val;
  localStorage.setItem("cc_bakery_name", val);
  updateBakeryLogoName();
  showNotif("✅ Bakery name saved: " + val);
  setTimeout(() => syncLeaderboard(), 500);
}

// ─── EXPORT / IMPORT ──────────────────────────────────────────────────────────
function exportSave() {
  try {
    const data    = localStorage.getItem(SAVE_KEY) || "{}";
    const encoded = btoa(unescape(encodeURIComponent(data)));
    const el = document.getElementById("save-export-box");
    if (el) { el.value = encoded; el.select(); document.execCommand("copy"); }
    showNotif("📋 Save exported & copied to clipboard!");
  } catch(e) { showNotif("❌ Export failed."); }
}

function importSave() {
  const el = document.getElementById("save-export-box");
  if (!el || !el.value.trim()) { showNotif("⚠️ Paste your save code first."); return; }
  try {
    const decoded = decodeURIComponent(escape(atob(el.value.trim())));
    JSON.parse(decoded); // validate — throws if invalid
    localStorage.setItem(SAVE_KEY, decoded);
    showNotif("✅ Save imported! Reloading...");
    setTimeout(() => location.reload(), 1200);
  } catch(e) { showNotif("❌ Invalid save code. Check your paste."); }
}

// ─── GLOBAL LEADERBOARD (Firebase Realtime Database REST API) ─────────────────
// No SDK needed — works on any static host including GitHub Pages!
// Free tier: 1GB storage, 10GB/month transfer (plenty for a game leaderboard)
let lbCache     = null;
let lbLastFetch = 0;
let lbSyncing   = false;

function isFirebaseReady() {
  return FIREBASE_URL && !FIREBASE_URL.includes("YOUR-APP");
}

async function syncLeaderboard() {
  if (lbSyncing) return;
  if (!isFirebaseReady()) { syncLocalLeaderboard(); return; }
  lbSyncing = true;
  try {
    // Write our entry using PUT (idempotent, keyed by playerId)
    const entry = {
      id:        playerId,
      name:      bakeryName || "Anonymous Bakery",
      score:     Math.floor(S.life),
      prestige:  S.prestige || 0,
      buildings: totalBld(S),
      cps:       Math.floor(calcCPS(S)),
      ts:        Date.now(),
    };
    await fetch(`${FIREBASE_URL}${LB_PATH}/${playerId}.json`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(entry),
    });

    // Read top 100 sorted by score descending
    const res  = await fetch(`${FIREBASE_URL}${LB_PATH}.json?orderBy=%22score%22&limitToLast=100`);
    const data = res.ok ? await res.json() : null;

    lbCache = data
      ? Object.values(data).filter(e=>e&&isFinite(e.score)).sort((a,b)=>b.score-a.score).slice(0,50)
      : [];
    lbLastFetch = Date.now();

    if (document.getElementById("tab-leaderboard")?.classList.contains("active")) {
      renderLeaderboard(lbCache);
    }
  } catch(e) {
    console.warn("[LB] Firebase error:", e.message);
    syncLocalLeaderboard();
  } finally {
    lbSyncing = false;
  }
}

function syncLocalLeaderboard() {
  try {
    let scores = JSON.parse(localStorage.getItem("cc_leaderboard") || "[]");
    const entry = { id:playerId, name:bakeryName||"Anonymous Bakery", score:Math.floor(S.life), prestige:S.prestige||0, buildings:totalBld(S), cps:Math.floor(calcCPS(S)), ts:Date.now() };
    const idx   = scores.findIndex(s=>s.id===playerId);
    if (idx>=0) scores[idx]=entry; else scores.push(entry);
    scores.sort((a,b)=>b.score-a.score);
    if (scores.length>100) scores=scores.slice(0,100);
    localStorage.setItem("cc_leaderboard", JSON.stringify(scores));
    lbCache=scores; lbLastFetch=Date.now();
  } catch(e) {}
}

async function loadLeaderboard() {
  const listEl = document.getElementById("lb-list");
  const loadEl = document.getElementById("lb-loading");
  if (!listEl) return;

  if (lbCache && Date.now()-lbLastFetch < 15000) { renderLeaderboard(lbCache); return; }

  if (loadEl) loadEl.classList.remove("hidden");
  listEl.innerHTML = "";

  if (!isFirebaseReady()) {
    if (loadEl) loadEl.classList.add("hidden");
    listEl.innerHTML = `
      <div class="lb-setup-msg">
        <div style="font-size:2rem">🔥</div>
        <div style="font-weight:700;margin:6px 0">Set up Firebase for Global Scores</div>
        <div style="font-size:0.78rem;opacity:0.7;line-height:1.6">
          1. Visit <strong>console.firebase.google.com</strong><br>
          2. New project → Realtime Database → Start in Test Mode<br>
          3. Copy the DB URL into <code>FIREBASE_URL</code> in game.js<br>
          4. Redeploy — leaderboard goes live instantly!
        </div>
      </div>`;
    try { lbCache=JSON.parse(localStorage.getItem("cc_leaderboard")||"[]"); } catch(e){lbCache=[];}
    if (lbCache.length) renderLeaderboard(lbCache);
    return;
  }

  try {
    const res  = await fetch(`${FIREBASE_URL}${LB_PATH}.json?orderBy=%22score%22&limitToLast=100`);
    const data = res.ok ? await res.json() : null;
    lbCache = data
      ? Object.values(data).filter(e=>e&&isFinite(e.score)).sort((a,b)=>b.score-a.score).slice(0,50)
      : [];
    lbLastFetch = Date.now();
  } catch(e) {
    try { lbCache=JSON.parse(localStorage.getItem("cc_leaderboard")||"[]"); } catch(e2){lbCache=[];}
  }

  if (loadEl) loadEl.classList.add("hidden");
  renderLeaderboard(lbCache);
}

function renderLeaderboard(scores) {
  const listEl = document.getElementById("lb-list");
  const loadEl = document.getElementById("lb-loading");
  if (!listEl) return;
  if (loadEl) loadEl.classList.add("hidden");

  if (!scores || scores.length === 0) {
    listEl.innerHTML = `<div class="lb-empty">No scores yet — you could be #1! 🍪</div>`;
    return;
  }

  const medals = ["🥇","🥈","🥉"];
  const now    = Date.now();
  const ONLINE = 5 * 60 * 1000; // 5 min = online

  listEl.innerHTML = scores.map((s,i) => {
    const isMe    = s.id === playerId;
    const online  = s.ts && (now-s.ts) < ONLINE;
    const rankCls = ["top1","top2","top3"][i] || "";
    const timeLbl = s.ts ? fmtTime(now-s.ts) : "";
    return `<div class="lb-entry${isMe?" is-me":""}">
      <div class="lb-rank ${rankCls}">${medals[i]||(i+1)}</div>
      <div class="lb-name-col">
        <div class="lb-player-name">
          ${online?'<span class="lb-online-dot" title="Active in last 5 min"></span>':""}
          ${esc(s.name)}${isMe?" 🍪":""}
        </div>
        <div class="lb-player-sub">P${s.prestige||0} · ${s.buildings||0} bldgs · ${fmt(s.cps||0)}/s${timeLbl?" · "+timeLbl:""}</div>
      </div>
      <div class="lb-score-col">
        <div class="lb-score-val">${fmt(s.score)}</div>
        <div class="lb-score-lbl">lifetime</div>
      </div>
    </div>`;
  }).join("");
}

// ─── NOTIFICATIONS (queued, no overlap) ──────────────────────────────────────
const notifQueue = [];
let notifBusy    = false;

function showNotif(msg) {
  // Don't stack identical back-to-back messages
  if (notifQueue[notifQueue.length-1] === msg) return;
  notifQueue.push(msg);
  drainNotif();
}

function drainNotif() {
  if (notifBusy || notifQueue.length === 0) return;
  notifBusy = true;
  const msg    = notifQueue.shift();
  const toast  = document.getElementById("achievement-toast");
  const nameEl = document.getElementById("toast-name");
  if (!toast || !nameEl) { notifBusy=false; return; }
  const ico = toast.querySelector(".toast-ico");
  const eye = toast.querySelector(".toast-eyebrow");
  if (eye) eye.textContent = "Event";
  if (ico) ico.textContent = "🍪";
  nameEl.textContent = msg;
  toast.classList.remove("hidden","hiding");
  const bar = toast.querySelector(".toast-bar");
  if (bar) { bar.style.animation="none"; void bar.offsetWidth; bar.style.animation=""; }
  setTimeout(() => {
    toast.classList.add("hiding");
    setTimeout(() => { toast.classList.add("hidden"); notifBusy=false; drainNotif(); }, 280);
  }, 2500);
}

// ─── PASSIVE TICK ─────────────────────────────────────────────────────────────
let lastTick = Date.now();

setInterval(() => {
  const now     = Date.now();
  const elapsed = (now - lastTick) / 1000;
  lastTick      = now;
  const gained  = calcCPS(S) * elapsed;
  if (gained > 0) { S.score += gained; S.life += gained; }
  // NOTE: curse break is handled in doClick(), NOT here
}, 100);

setInterval(() => { checkAch(); save(); },         3000);
setInterval(() => { syncLeaderboard(); },          30000);
setInterval(() => { scheduleDisplay(); },          100);

// ─── DISPLAY ─────────────────────────────────────────────────────────────────
let displayScheduled = false;

function scheduleDisplay() {
  if (!displayScheduled) {
    displayScheduled = true;
    requestAnimationFrame(updateDisplay);
  }
}

function updateDisplay() {
  displayScheduled = false;
  const cps = calcCPS(S);
  const cpc = calcCPC();

  document.getElementById("score").textContent          = fmt(S.score);
  document.getElementById("cpc").textContent            = fmt(cpc);
  document.getElementById("cps").textContent            = fmt(cps);
  document.getElementById("stat-lifetime").textContent  = fmt(S.life);
  document.getElementById("stat-buildings").textContent = totalBld(S);
  document.getElementById("stat-prestige").textContent  = S.prestige;

  // Visual indicator when cursed
  document.getElementById("cps")?.classList.toggle("cursed", curseActive);

  const pz = document.getElementById("prestige-zone");
  if (pz) {
    if (S.life >= 1e9) {
      pz.classList.remove("hidden");
      const el = document.getElementById("prestige-mult-display");
      if (el) el.textContent = (Math.pow(1.05,S.prestige+1)*(S.spec_prestige_mult||1)).toFixed(3)+"×";
    } else pz.classList.add("hidden");
  }

  const ap = document.getElementById("active-pres");
  if (ap) {
    if (S.prestige > 0) {
      ap.classList.remove("hidden");
      ap.textContent = `✨ Prestige ${S.prestige} — ${S.pmult.toFixed(3)}× global bonus`;
    } else ap.classList.add("hidden");
  }

  UPGRADES.forEach((u,i) => {
    const card = document.getElementById("upg-"+u.id);
    if (!card) return;
    const cost = getUpgCost(i);
    card.className = "upg-card" + (S.score<cost?" cant-afford":"");
    card.querySelector(".upg-meta").textContent = `+${fmt(u.bonus)} flat, +${fmt(cps*u.cpsBonus)}/s · Lv ${S.upgrades[i]||0}`;
    card.querySelector(".upg-cost").textContent = "🍪 " + fmt(cost);
  });

  renderBuildings();

  const unlocked = Object.values(S.ach).filter(Boolean).length;
  const achEl = document.getElementById("ach-progress");
  if (achEl) achEl.textContent = `${unlocked} / ${ACH.length} unlocked`;
}

function renderBuildings() {
  BUILDINGS.forEach(b => {
    const card   = document.getElementById("bld-"+b.key);
    const costEl = document.getElementById("bld-cost-"+b.key);
    const qcEl   = document.getElementById("bld-qcost-"+b.key);
    const ownEl  = document.getElementById("bld-owned-"+b.key);
    if (!card) return;
    const single = getBldCostN(b.key, 0);
    if (buyQty === "max") {
      const n = maxAffordable(b.key);
      card.className = "bld-card"+(n===0?" cant-afford":"");
      if (costEl) costEl.textContent = "🍪 "+fmt(single);
      if (qcEl)  qcEl.textContent   = n>0 ? `Buy ${n} for 🍪 ${fmt(getBldCostBulk(b.key,n))}` : "";
    } else {
      const qty=parseInt(buyQty), bulk=getBldCostBulk(b.key,qty);
      card.className = "bld-card"+(S.score<bulk?" cant-afford":"");
      if (costEl) costEl.textContent = "🍪 "+fmt(single);
      if (qcEl)  qcEl.textContent   = qty>1 ? `${qty}× for 🍪 ${fmt(bulk)}` : "";
    }
    const owned = S.bld[b.key]||0;
    if (ownEl) ownEl.textContent = owned>0 ? owned+" owned" : "";
  });
}

// ─── BUILD UI ────────────────────────────────────────────────────────────────
function buildUpgCards() {
  const grid = document.getElementById("upgrades-grid");
  if (!grid) return;
  grid.innerHTML = "";
  UPGRADES.forEach(u => {
    const card = document.createElement("button");
    card.id=      "upg-"+u.id;
    card.className="upg-card cant-afford";
    card.onclick = () => addUpgrade(u.id);
    card.innerHTML=`<span class="upg-icon">${u.icon}</span><span class="upg-name">${u.name}</span><span class="upg-meta">+${fmt(u.bonus)} flat & CPS boost · Lv 0</span><span class="upg-cost">🍪 ${fmt(u.baseCost)}</span>`;
    grid.appendChild(card);
  });
}

function buildBldButtons() {
  const list = document.getElementById("buildings-list");
  if (!list) return;
  list.innerHTML = "";
  BUILDINGS.forEach(b => {
    const card = document.createElement("button");
    card.id=      "bld-"+b.key;
    card.className="bld-card cant-afford";
    card.onclick = () => buyBld(b.key);
    card.innerHTML=`<span class="bld-icon">${b.icon}</span><span class="bld-body"><span class="bld-name">${b.name}</span><span class="bld-meta">${b.desc} · +${fmt(b.cps)}/s</span><span id="bld-owned-${b.key}" class="bld-owned"></span></span><span class="bld-right"><span id="bld-cost-${b.key}" class="bld-cost">🍪 ${fmt(b.baseCost)}</span><span id="bld-qcost-${b.key}" class="bld-qty-cost"></span></span>`;
    list.appendChild(card);
  });
}

function renderSpecials() {
  const grid = document.getElementById("specials-grid");
  if (!grid) return;
  grid.innerHTML = "";
  SPECIALS.forEach(sp => {
    const owned     = S.specials[sp.id];
    const canAfford = S.score >= sp.cost;
    const card      = document.createElement("div");
    card.className  = ["spec-card", sp.style||"",
      !canAfford&&!owned?"cant-afford":"",
      owned&&!sp.repeatable?"purchased":""
    ].filter(Boolean).join(" ");
    if (owned&&!sp.repeatable) card.innerHTML=`<div class="spec-owned-badge">✓ OWNED</div>`;
    card.innerHTML+=`<span class="spec-icon">${sp.icon}</span><span class="spec-name">${sp.name}</span><span class="spec-desc">${sp.desc}</span><span class="spec-cost">🍪 ${fmt(sp.cost)}</span>`;
    if (!owned||sp.repeatable) { card.onclick=()=>buySpecial(sp.id); card.style.cursor="pointer"; }
    grid.appendChild(card);
  });
}

function buildAchUI() {
  const grid = document.getElementById("achievements-grid");
  if (!grid) return;
  grid.innerHTML = "";
  ACH.forEach(a => {
    const d = document.createElement("div");
    d.id=      "ach-"+a.id;
    d.className="ach-card"+(S.ach[a.id]?" unlocked":"");
    d.title=   a.name;
    d.innerHTML=`<span class="ach-ico">${S.ach[a.id]?a.icon:"🔒"}</span><span class="ach-nm">${a.name}</span>`;
    grid.appendChild(d);
  });
}

function renderPatchNotes() {
  const feed=document.getElementById("patch-feed");
  if (!feed) return;
  feed.innerHTML="";
  PATCH_NOTES.forEach(p => {
    const d=document.createElement("div");
    d.className="patch-entry";
    d.innerHTML=`<div class="patch-version">${esc(p.version)}</div><div class="patch-date">${esc(p.date)}</div><div class="patch-body">${esc(p.text)}</div>`;
    feed.appendChild(d);
  });
}

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────
let achQueue=[], achBusy=false;

function checkAch() {
  ACH.forEach(a => {
    if (!S.ach[a.id] && a.cond(S)) {
      S.ach[a.id]=true; achQueue.push(a);
      const el=document.getElementById("ach-"+a.id);
      if (el) { el.className="ach-card unlocked"; el.querySelector(".ach-ico").textContent=a.icon; }
    }
  });
  drainAchToast();
}

function drainAchToast() {
  if (achBusy||achQueue.length===0) return;
  achBusy=true;
  const a    =achQueue.shift();
  const toast=document.getElementById("achievement-toast");
  const nameEl=document.getElementById("toast-name");
  if (!toast||!nameEl) { achBusy=false; return; }
  const ico=toast.querySelector(".toast-ico");
  const eye=toast.querySelector(".toast-eyebrow");
  if (eye) eye.textContent="Achievement Unlocked!";
  if (ico) ico.textContent="🏆";
  nameEl.textContent=a.name;
  toast.classList.remove("hidden","hiding");
  const bar=toast.querySelector(".toast-bar");
  if (bar) { bar.style.animation="none"; void bar.offsetWidth; bar.style.animation=""; }
  setTimeout(() => {
    toast.classList.add("hiding");
    setTimeout(() => { toast.classList.add("hidden"); achBusy=false; drainAchToast(); }, 280);
  }, 2800);
}

// ─── DEV LOG ─────────────────────────────────────────────────────────────────
function showDevlog() {
  if (!DEV_LOG.show) return;
  const seenKey="cc_devlog_seen_"+DEV_LOG.version;
  if (sessionStorage.getItem(seenKey)) return;
  sessionStorage.setItem(seenKey,"1");
  const badge=document.getElementById("modal-version-badge");
  const body =document.getElementById("modal-body");
  const modal=document.getElementById("devlog-modal");
  if (!badge||!body||!modal) return;
  badge.textContent="Dev Log · "+DEV_LOG.version;
  body.textContent =DEV_LOG.text;
  modal.classList.remove("hidden");
}

function closeDevlog() {
  document.getElementById("devlog-modal")?.classList.add("hidden");
}

// ─── SAVE / LOAD ─────────────────────────────────────────────────────────────
function save() {
  S.lastSave=Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch(e) { console.warn("Save failed:",e); }
}

function load() {
  ["cc_v3","cc_v4","cc_v5","cc_v6"].forEach(k=>{try{localStorage.removeItem(k);}catch(e){}});
  try {
    const raw=localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const d=JSON.parse(raw);
    const num =(v,df=0)=>isFinite(v)?v:df;
    const bool=(v,df=false)=>typeof v==="boolean"?v:df;

    S.score           =num(d.score);
    S.life            =num(d.life);
    S.prestige        =num(d.prestige);
    S.pmult           =num(d.pmult,1);
    S.totalClicks     =num(d.totalClicks);
    S.goldenCollected =num(d.goldenCollected);
    S.meteorsCollected=num(d.meteorsCollected);
    S.frenziesHad     =num(d.frenziesHad);
    S.blizzardsHad    =num(d.blizzardsHad);
    S.cursesHad       =num(d.cursesHad);
    S.midnightBonus   =num(d.midnightBonus);
    S.maxCombo        =num(d.maxCombo);
    S.lastSave        =num(d.lastSave,Date.now());
    S.ach             =(d.ach&&typeof d.ach==="object")?d.ach:{};
    S.specials        =(d.specials&&typeof d.specials==="object")?d.specials:{};

    ["spec_cpc_bonus","spec_grandma_mult","spec_golden_freq","spec_golden_bonus",
     "spec_global_cps","spec_cps_to_cpc","spec_prestige_mult","spec_meteor_freq","spec_meteor_bonus"]
    .forEach(k=>{if(isFinite(d[k]))S[k]=d[k];});
    ["spec_turbo_click","spec_offline","spec_infinity","spec_curse_ward","spec_chain_slow"]
    .forEach(k=>{S[k]=bool(d[k]);});

    S.upgrades=UPGRADES.map((_,i)=>Math.max(0,Math.floor((Array.isArray(d.upgrades)?d.upgrades[i]:0)||0)));
    BUILDINGS.forEach(b=>{S.bld[b.key]=(d.bld&&isFinite(d.bld[b.key]))?Math.max(0,Math.floor(d.bld[b.key])):0;});

    recalcPrestige(S);

    if (S.spec_offline) {
      const offSec=Math.min((Date.now()-S.lastSave)/1000,4*3600);
      if (offSec>30) {
        const earned=calcCPS(S)*offSec*0.5;
        if (earned>0) {
          S.score+=earned; S.life+=earned;
          setTimeout(()=>showNotif(`💤 Offline: +${fmt(earned)} cookies (${Math.round(offSec/60)}m)`),1500);
        }
      }
    }
  } catch(e) { console.error("Load failed:",e); }
}

// ─── HARD RESET ──────────────────────────────────────────────────────────────
function hardReset() {
  if (!confirm("HARD RESET: Delete ALL progress including prestiges?\nThis CANNOT be undone!")) return;
  [SAVE_KEY,"cc_bakery_name","cc_leaderboard","cc_v3","cc_v4","cc_v5","cc_v6"]
    .forEach(k=>{try{localStorage.removeItem(k);}catch(e){}});
  sessionStorage.clear();
  location.reload();
}

// ─── INIT ────────────────────────────────────────────────────────────────────
(function init() {
  initPlayerIdentity();
  load();
  loadAudioPrefs();
  buildUpgCards();
  buildBldButtons();
  renderSpecials();
  buildAchUI();
  renderPatchNotes();
  updateDisplay();

  if (S.spec_infinity) startInfinityTimer();

  if (!bakeryName) {
    showBakeryNameModal();
  } else {
    updateBakeryLogoName();
    showDevlog();
    setTimeout(()=>syncLeaderboard(), 2000);
  }

  checkMidnightBonus();
  scheduleGolden();
  scheduleMeteor();
  scheduleBlizzard();
  scheduleCurse();

  if (window.innerWidth <= 768) {
    const left =document.getElementById("left-panel");
    const right=document.getElementById("right-panel");
    if (left)  left.style.display ="flex";
    if (right) right.style.display="none";
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      const left =document.getElementById("left-panel");
      const right=document.getElementById("right-panel");
      if (left)  { left.style.display="";  left.classList.remove("mobile-active"); }
      if (right) { right.style.display=""; right.classList.remove("mobile-active"); }
    }
  });

  // Re-sync when player returns to the tab
  document.addEventListener("visibilitychange", ()=>{
    if (!document.hidden) syncLeaderboard();
  });
})();
