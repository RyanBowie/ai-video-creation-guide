// engine.js - "One rocket breaks the chart": a hand-annotated bar race of orbital launches per year (GCAT data).
// Data-storytelling look: warm paper, ink, one blue annotation pen, one red pen for the story beat. render(F) is deterministic.
'use strict';
const W = 1920, H = 1080, FPS = 30, TOTAL = 1140;
let CTX;
const T = { sputnik: 12, beep: 123, tear: 676, flip: 690, taps: [710, 718, 726, 734], silenceA: 840, silenceB: 870, endCard: 1040 };
const COL = { paper: '#f3ead6', ink: '#2a2420', muted: '#6b5f52', blue: '#2b4a8b', red: '#b3261e', hole: '#d8c9a8', flap: '#fbf5e6' };
const HAND = "'Ink Free','Segoe Print',cursive", SERIF = 'Georgia,Cambria,serif', MONO = "'Cascadia Mono',Consolas,monospace";
const D = window.DATA, GROUPS = Object.keys(D.series), NY = D.years.length, Y0 = D.years[0];
const SHORT = { 'United States': 'United States', 'USSR / Russia': 'USSR / Russia', China: 'China', Europe: 'Europe', Japan: 'Japan', India: 'India', 'New Zealand': 'New Zealand' };

// ---- helpers
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (F, a, b) => clamp((F - a) / (b - a));
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eout = t => 1 - Math.pow(1 - t, 3);
const esine = t => -(Math.cos(Math.PI * t) - 1) / 2;
const hash = n => { n = (n | 0) ^ 0x9e3779b9; n = Math.imul(n ^ n >>> 16, 0x85ebca6b); n = Math.imul(n ^ n >>> 13, 0xc2b2ae35); return ((n ^ n >>> 16) >>> 0) / 4294967296; };
const rnd = (a, b, s) => lerp(a, b, hash(s));

// ---- time -> year index (fractional)
const KF = [[0, 0], [190, 0], [262, 10], [300, 10], [360, 25], [384, 25], [420, 34], [450, 34], [532, 59], [540, 60], [548, 61], [600, 61], [612, 62], [624, 63], [636, 64], [648, 65], [660, 66], [696, 67, 'lin'], [742, 67], [770, 68]];
function yearPos(F) {
  if (F <= KF[0][0]) return KF[0][1];
  for (let i = 1; i < KF.length; i++) {
    const [f1, y1, m] = KF[i], [f0, y0] = KF[i - 1];
    if (F <= f1) { const t = (F - f0) / (f1 - f0); return lerp(y0, y1, m === 'lin' ? t : esine(t)); }
  }
  return KF[KF.length - 1][1];
}
const valOf = (arr, yp) => { const i = Math.floor(yp), t = yp - i; return lerp(arr[i], arr[Math.min(i + 1, NY - 1)], t); };
const RANKS = D.years.map((_, i) => { const r = {}; GROUPS.map((g, k) => [g, D.series[g][i], k]).sort((a, b) => b[1] - a[1] || a[2] - b[2]).forEach(([g], s) => r[g] = s); return r; });
const slotOf = (g, yp) => { const i = Math.floor(yp), t = yp - i; return lerp(RANKS[i][g], RANKS[Math.min(i + 1, NY - 1)][g], eio(t)); };

// ---- bar scale: 120 until the red pen ratchets the frame out to 200 (springy)
const spring = t => t <= 0 ? 0 : 1 - Math.exp(-t / 2.2) * Math.cos(.75 * t);
const scaleAt = F => 120 + T.taps.reduce((s, f) => s + 20 * spring(F - f), 0);
const BX = 400, BR = 1700, BW = 1300, ROW0 = 222, ROWH = 48, BH = 32;
const barX = (v, S) => BX + v * BW / S;

// ---- timeline strip (world totals)
const TB = 860, TK = .56, colX = y => 200 + 21 * (y - Y0), colCx = y => colX(y) + 7.5, colTop = y => TB - Math.max(3, D.world[y - Y0] * TK);

// ---- camera
function cam(F) {
  const pi = eio(prog(F, 128, 170));
  let z = lerp(2.4, 1, pi), cx = lerp(300, 960, pi), cy = lerp(800, 540, pi);
  const pp = F < 700 ? eout(prog(F, 676, 684)) : 1 - eio(prog(F, 700, 745));
  z *= lerp(1, 1.1, pp); cx = lerp(cx, 1065, pp); cy = lerp(cy, 440, pp);
  const rot = (-2 * Math.PI / 180) * (esine(prog(F, 636, 676)) - esine(prog(F, 950, 1010)));
  const sh = F >= T.tear ? 9 * Math.exp(-(F - T.tear) / 9) : 0;
  return { z, cx, cy, rot, sx: sh * rnd(-1, 1, F * 7 + 1), sy: sh * rnd(-1, 1, F * 7 + 2) };
}
const applyCam = (c, k) => { k.translate(W / 2 + c.sx, H / 2 + c.sy); k.rotate(c.rot); k.scale(c.z, c.z); k.translate(-c.cx, -c.cy); };
function w2s(c, x, y) {
  const dx = (x - c.cx) * c.z, dy = (y - c.cy) * c.z, cs = Math.cos(c.rot), sn = Math.sin(c.rot);
  return [W / 2 + c.sx + dx * cs - dy * sn, H / 2 + c.sy + dx * sn + dy * cs];
}

// ---- polylines
function wobLine(x1, y1, x2, y2, seed, amp = 1.1, step = 18) {
  const L = Math.hypot(x2 - x1, y2 - y1), n = Math.max(2, Math.ceil(L / step)), nx = -(y2 - y1) / (L || 1), ny = (x2 - x1) / (L || 1), P = [];
  for (let i = 0; i <= n; i++) { const t = i / n, o = (i === 0 || i === n) ? 0 : rnd(-amp, amp, seed * 131 + i); P.push([lerp(x1, x2, t) + nx * o, lerp(y1, y2, t) + ny * o]); }
  return P;
}
function polyLen(P) { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; }
function polyAt(P, q) { // point at fraction q of length
  const L = polyLen(P) * clamp(q); let acc = 0;
  for (let i = 1; i < P.length; i++) { const s = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); if (acc + s >= L) { const t = s ? (L - acc) / s : 0; return [lerp(P[i - 1][0], P[i][0], t), lerp(P[i - 1][1], P[i][1], t)]; } acc += s; }
  return P[P.length - 1];
}
function strokePoly(P, q = 1, color = COL.ink, lw = 2.4, dash = null) {
  if (q <= 0) return; const k = CTX, L = polyLen(P) * clamp(q); let acc = 0;
  k.save(); k.strokeStyle = color; k.lineWidth = lw; k.lineCap = 'round'; k.lineJoin = 'round'; if (dash) k.setLineDash(dash);
  k.beginPath(); k.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length; i++) {
    const s = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    if (acc + s >= L) { const t = s ? (L - acc) / s : 0; k.lineTo(lerp(P[i - 1][0], P[i][0], t), lerp(P[i - 1][1], P[i][1], t)); break; }
    k.lineTo(P[i][0], P[i][1]); acc += s;
  }
  k.stroke(); k.restore();
}
function quadPoly(a, c, b, n = 24) { const P = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; P.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]); } return P; }
function ringPoly(cx, cy, r, a0, sweep = Math.PI * 1.82, seed = 1) {
  const P = [], n = 40; for (let i = 0; i <= n; i++) { const a = a0 + sweep * i / n, rr = r * (1 + .06 * Math.sin(i * .7 + seed) + .04 * i / n); P.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .92]); } return P;
}

// ---- annotation notes (blue pen) on the timeline
const NOTES = [
  { txt: 'Sputnik \u00b7 1957', x: 215, y: 720, size: 32, w: [30, 100], l: [100, 114], tgt: [207.5, 857], r: 13 },
  { txt: 'USSR ahead', x: 430, y: 660, size: 30, w: [268, 296], l: [296, 306], year: 1967 },
  { txt: 'USSR peak \u00b7 108', x: 690, y: 705, size: 30, w: [364, 386], l: [386, 394], year: 1982 },
  { txt: 'USSR ends \u00b7 1991', x: 940, y: 655, size: 30, w: [424, 446], l: [446, 454], year: 1991 },
  { txt: 'China leads \u00b7 2018', x: 1470, y: 705, size: 30, w: [556, 596], l: [596, 606], year: 2018, right: true },
];
const HEAD = { txt: 'Orbital launch attempts per year, by country', x: 160, y: 150, font: `600 54px ${SERIF}`, w: [192, 236] };
const RED = {
  bracket: [770, 785], by: 262, note: { txt: '\u224892% one rocket: Falcon 9', x: 1080, y: 360, size: 34, w: [785, 828], l: [828, 838], to: [1242, 266] },
  hold: [865, 870], ring: [870, 886], ringC: [colCx(2025), colTop(2025)], ringR: 20,
  big: { txt: '324', x: 1600, y: 640, size: 44, w: [886, 900] },
  cell: [975, 995], q: [995, 1008], ghost: [1000, 1015],
};
const CELL = { x0: colX(2026), x1: colX(2026) + 15, y0: TB - D.world[2026 - Y0] * TK, y1: TB };

let TEX = null;
function makeTextures() {
  const k = CTX; TEX = {};
  // paper
  const pc = document.createElement('canvas'); pc.width = 2400; pc.height = 1500; const p = pc.getContext('2d');
  p.fillStyle = COL.paper; p.fillRect(0, 0, 2400, 1500);
  for (let i = 0; i < 140; i++) { const x = rnd(0, 2400, i * 3 + 1), y = rnd(0, 1500, i * 3 + 2), r = rnd(80, 320, i * 3 + 3), g = p.createRadialGradient(x, y, 0, x, y, r); const d = hash(i * 11) < .5; g.addColorStop(0, d ? 'rgba(150,120,70,.06)' : 'rgba(255,250,235,.10)'); g.addColorStop(1, 'rgba(0,0,0,0)'); p.fillStyle = g; p.fillRect(x - r, y - r, r * 2, r * 2); }
  p.lineCap = 'round';
  for (let i = 0; i < 2600; i++) { const x = rnd(0, 2400, i * 5 + 7), y = rnd(0, 1500, i * 5 + 8), a = rnd(0, Math.PI, i * 5 + 9), l = rnd(3, 14, i * 5 + 10); p.strokeStyle = hash(i * 5 + 11) < .5 ? 'rgba(110,85,50,.10)' : 'rgba(255,255,245,.20)'; p.lineWidth = rnd(.4, 1.1, i * 5 + 12); p.beginPath(); p.moveTo(x, y); p.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); p.stroke(); }
  p.fillStyle = 'rgba(80,100,140,.10)';
  for (let x = 240 % 32; x < 2400; x += 32) for (let y = 210 % 32; y < 1500; y += 32) { p.beginPath(); p.arc(x, y, 1.1, 0, 7); p.fill(); }
  TEX.paper = pc;
  // hatch patterns
  const hatch = (color, cross) => { const c = document.createElement('canvas'); c.width = c.height = 12; const h = c.getContext('2d'); h.strokeStyle = color; h.lineWidth = 1.3; h.beginPath(); h.moveTo(-2, 14); h.lineTo(14, -2); h.moveTo(-8, 8); h.lineTo(8, -8); h.moveTo(4, 20); h.lineTo(20, 4); if (cross) { h.moveTo(-2, -2); h.lineTo(14, 14); h.moveTo(-8, 4); h.lineTo(8, 20); h.moveTo(4, -8); h.lineTo(20, 8); } h.stroke(); return k.createPattern(c, 'repeat'); };
  TEX.hatch = hatch('rgba(42,36,32,.28)', false);
  TEX.red = hatch('rgba(179,38,30,.85)', true);
  // vignette
  const v = document.createElement('canvas'); v.width = W; v.height = H; const vg = v.getContext('2d'), g = vg.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05);
  g.addColorStop(0, 'rgba(60,40,20,0)'); g.addColorStop(1, 'rgba(60,40,20,.28)'); vg.fillStyle = g; vg.fillRect(0, 0, W, H); TEX.vig = v;
  // measure notes + leaders
  const meas = (txt, font) => { k.font = font; return k.measureText(txt).width; };
  NOTES.forEach((n, i) => {
    n.font = `${n.size}px ${HAND}`; n.wd = meas(n.txt, n.font); n.x0 = n.right ? n.x - n.wd : n.x;
    const t = n.tgt || [colCx(n.year), colTop(n.year)], r = n.r || 15, below = t[1] > n.y;
    const sx = clamp(t[0], n.x0 + 10, n.x0 + n.wd - 10), sy = below ? n.y + 12 : n.y - n.size - 4;
    const ang = Math.atan2(sy - t[1], sx - t[0]), e = [t[0] + Math.cos(ang) * r, t[1] + Math.sin(ang) * r * .92];
    const c = [lerp(sx, e[0], .5) + (i % 2 ? 26 : -26), lerp(sy, e[1], .5)];
    n.lead = quadPoly([sx, sy], c, e).concat(ringPoly(t[0], t[1], r, ang, Math.PI * 1.82, i).slice(1));
  });
  HEAD.wd = meas(HEAD.txt, HEAD.font);
  const rn = RED.note; rn.font = `${rn.size}px ${HAND}`; rn.wd = meas(rn.txt, rn.font); rn.x0 = rn.x;
  const s0 = [rn.x0 + rn.wd * .45, rn.y - rn.size - 2]; rn.lead = quadPoly(s0, [s0[0] + 70, s0[1] - 20], rn.to);
  const big = RED.big; big.font = `${big.size}px ${HAND}`; big.wd = meas(big.txt, big.font); big.x0 = big.x - big.wd;
  const [rx, ry] = RED.ringC; RED.ringP = ringPoly(rx, ry, RED.ringR, -Math.PI * .75, Math.PI * 1.85, 9);
  RED.bracketP = [[BX, RED.by - 7], [BX, RED.by]].concat(wobLine(BX, RED.by, barX(D.falcon9['2025'], 200), RED.by, 77, .8).slice(1), [[barX(D.falcon9['2025'], 200), RED.by - 7]]);
  const c0 = CELL; RED.cellP = [[c0.x0, c0.y1], [c0.x0, c0.y0], [c0.x1, c0.y0], [c0.x1, c0.y1]];
  TEX.base = wobLine(190, TB, 1680, TB, 5, .9, 30); TEX.axis = wobLine(BX, 560, BX, 215, 6, .8);
}

// ---- pencil track: actions in world space; pencil is drawn in screen space over everything
const OFF = [2150, 1300];
const writeAt = (n, F, size) => { const p = prog(F, n.w[0], n.w[1]); return [n.x0 + n.wd * p, n.y - .3 * size + Math.sin(2.3 * F) * .22 * size]; };
function buildActions() {
  const A = [];
  const pole = (a, b, pos, lead, lift, snd) => A.push({ a, b, pos, lead, lift: lift || (() => 0), snd });
  NOTES.forEach((n, i) => {
    pole(n.w[0], n.w[1], F => writeAt(n, F, n.size), 'blue', null, 'scratch');
    pole(n.l[0], n.l[1], F => polyAt(n.lead, prog(F, n.l[0], n.l[1])), 'blue', null, 'line');
    if (i === 0) {
      pole(118, 128, () => [207.5, 857], 'blue', F => clamp(Math.abs(F - T.beep) / 5));
      pole(140, 166, F => polyAt(TEX.base, eio(prog(F, 140, 166))), 'blue', null, 'ruler');
      pole(174, 186, F => polyAt(TEX.axis, eio(prog(F, 174, 186))), 'blue', null, 'ruler');
      pole(HEAD.w[0], HEAD.w[1], F => [HEAD.x + HEAD.wd * prog(F, HEAD.w[0], HEAD.w[1]), HEAD.y - 16 + Math.sin(2.3 * F) * 10], 'blue', null, 'scratch');
    }
  });
  pole(706, 742, () => [BR, 214], 'red', F => (1 - Math.cos(2 * Math.PI * (F - 710) / 8)) / 2);
  pole(RED.bracket[0], RED.bracket[1], F => polyAt(RED.bracketP, prog(F, ...RED.bracket)), 'red', null, 'line');
  const rn = RED.note;
  pole(rn.w[0], rn.w[1], F => writeAt(rn, F, rn.size), 'red', null, 'scratch');
  pole(rn.l[0], rn.l[1], F => polyAt(rn.lead, prog(F, ...rn.l)), 'red', null, 'line');
  pole(RED.hold[0], RED.hold[1], () => RED.ringP[0], 'red', F => .4 * (1 - prog(F, ...RED.hold)));
  pole(RED.ring[0], RED.ring[1], F => polyAt(RED.ringP, eio(prog(F, ...RED.ring))), 'red', null, 'line');
  pole(RED.big.w[0], RED.big.w[1], F => writeAt(RED.big, F, RED.big.size), 'red', null, 'scratch');
  pole(RED.cell[0], RED.cell[1], F => polyAt(RED.cellP, prog(F, ...RED.cell)), 'red', null, 'line');
  pole(RED.q[0], RED.q[1], F => { const p = prog(F, ...RED.q); return [1656 + Math.sin(p * 5) * 8, 722 - 26 + p * 30]; }, 'red', null, 'scratch');
  return A.sort((p, q) => p.a - q.a);
}
let ACTIONS = null;
function pencilAt(F, c) {
  const A = ACTIONS, S = (a, F) => w2s(c, ...a.pos(F));
  for (let i = 0; i < A.length; i++) {
    const a = A[i], nx = A[i + 1], pv = A[i - 1];
    if (F >= a.a && F <= a.b) return { p: S(a, F), lift: a.lift(F), lead: a.lead };
    if (nx && F > a.b && F < nx.a) {
      if (nx.a - a.b <= 60) { const t = eio((F - a.b) / (nx.a - a.b)), p0 = S(a, a.b), p1 = S(nx, nx.a); return { p: [lerp(p0[0], p1[0], t), lerp(p0[1], p1[1], t) - 40 * Math.sin(Math.PI * t)], lift: Math.sin(Math.PI * t), lead: t < .5 ? a.lead : nx.lead }; }
      if (F < a.b + 20) { const t = eio((F - a.b) / 20), p0 = S(a, a.b); return { p: [lerp(p0[0], OFF[0], t), lerp(p0[1], OFF[1], t)], lift: 1, lead: a.lead }; }
      if (F > nx.a - 20) { const t = eio((nx.a - F) / 20), p1 = S(nx, nx.a); return { p: [lerp(p1[0], OFF[0], t), lerp(p1[1], OFF[1], t)], lift: 1, lead: nx.lead }; }
      return null;
    }
    if (!pv && F < a.a && F > a.a - 20) { const t = eio((a.a - F) / 20), p1 = S(a, a.a); return { p: [lerp(p1[0], OFF[0], t), lerp(p1[1], OFF[1], t)], lift: 1, lead: a.lead }; }
    if (!nx && F > a.b && F < a.b + 20) { const t = eio((F - a.b) / 20), p0 = S(a, a.b); return { p: [lerp(p0[0], OFF[0], t), lerp(p0[1], OFF[1], t)], lift: 1, lead: a.lead }; }
  }
  return null;
}
function drawPencil(st) {
  if (!st) return; const k = CTX, lift = clamp(st.lift), raise = 24 * lift, [x, y] = st.p, body = st.lead === 'red' ? ['#d8574a', '#c0392b', '#962c21'] : ['#4a76c4', '#2f5aa8', '#22437f'];
  const shape = (ox, oy, fill) => {
    k.save(); k.translate(x + ox, y + oy); k.rotate(.62);
    if (fill) { k.fillStyle = fill; k.beginPath(); k.moveTo(0, 0); k.lineTo(52, -15); k.lineTo(560, -15); k.lineTo(560, 15); k.lineTo(52, 15); k.closePath(); k.fill(); k.restore(); return; }
    k.fillStyle = '#e9c99a'; k.beginPath(); k.moveTo(8, -2.3); k.lineTo(52, -15); k.lineTo(52, 15); k.lineTo(8, 2.3); k.closePath(); k.fill();
    k.strokeStyle = 'rgba(120,80,40,.35)'; k.lineWidth = 1; k.beginPath(); k.moveTo(20, -5); k.lineTo(52, -5); k.moveTo(24, 5); k.lineTo(52, 5); k.stroke();
    k.fillStyle = st.lead === 'red' ? COL.red : '#3a3633'; k.beginPath(); k.moveTo(0, 0); k.lineTo(12, -3.4); k.lineTo(12, 3.4); k.closePath(); k.fill();
    [[-15, -5, body[0]], [-5, 5, body[1]], [5, 15, body[2]]].forEach(([a, b, c]) => { k.fillStyle = c; k.beginPath(); k.moveTo(52 - Math.abs(a) * .12, a); k.lineTo(52 - Math.abs(b) * .12, b); k.lineTo(510, b); k.lineTo(510, a); k.closePath(); k.fill(); });
    k.fillStyle = '#b9b2a6'; k.fillRect(510, -15, 22, 30); k.strokeStyle = 'rgba(60,50,40,.35)'; k.beginPath(); for (let s = 514; s < 532; s += 5) { k.moveTo(s, -15); k.lineTo(s, 15); } k.stroke();
    k.fillStyle = '#e59a9a'; k.beginPath(); k.moveTo(532, -15); k.lineTo(554, -15); k.quadraticCurveTo(562, 0, 554, 15); k.lineTo(532, 15); k.closePath(); k.fill();
    k.restore();
  };
  k.save(); k.globalAlpha = .16; shape(6 + 16 * lift, 6 + 16 * lift, '#2a1a0a'); k.restore();
  shape(0, -raise);
}

// ---- drawing pieces (world space)
function ink(font, color = COL.ink) { CTX.font = font; CTX.fillStyle = color; }
function revealText(txt, font, x0, y, wd, p, color, align = 'left') {
  if (p <= 0) return; const k = CTX; k.save(); k.beginPath(); k.rect(x0 - 6, y - 120, wd * p + 6, 160); k.clip(); ink(font, color); k.textAlign = 'left'; k.fillText(txt, x0, y); k.restore();
}
function drawTimeline(F, yp) {
  const k = CTX;
  if (F >= 200) { // gridlines + title fade in with the race
    const a = prog(F, 200, 230); k.save(); k.globalAlpha = a;
    k.strokeStyle = 'rgba(42,36,32,.35)'; k.lineWidth = 1.2; k.setLineDash([2, 6]);
    [[100, 804], [200, 748]].forEach(([v, y]) => { k.beginPath(); k.moveTo(195, y); k.lineTo(1680, y); k.stroke(); ink(`14px ${MONO}`, COL.muted); k.textAlign = 'right'; k.fillText(v, 182, y + 5); });
    k.setLineDash([]); ink(`15px ${MONO}`, COL.muted); k.textAlign = 'left'; k.fillText('WORLD TOTAL \u00b7 ALL COUNTRIES', 190, 612);
    k.textAlign = 'center'; for (let y = 1960; y <= 2020; y += 10) k.fillText(String(y), colCx(y), 884);
    k.restore();
  }
  // columns
  for (let i = 0; i < NY - 1; i++) {
    const g = clamp(yp - i + 1); if (g <= 0) break;
    const v = D.world[i] * g, h = i === 0 ? Math.max(3, v * TK) : v * TK, x = colX(Y0 + i);
    k.fillStyle = i === Math.round(yp) && F < 800 ? '#c4622d' : 'rgba(42,36,32,.72)'; k.fillRect(x, TB - h, 15, h);
  }
  // baseline: stub before, ruled 140-166
  strokePoly(TEX.base, F < 140 ? 35 / 1490 : Math.max(35 / 1490, eio(prog(F, 140, 166))), COL.ink, 2.2);
}
function drawNotes(F) {
  NOTES.forEach(n => {
    revealText(n.txt, n.font, n.x0, n.y, n.wd, prog(F, n.w[0], n.w[1]), COL.blue);
    strokePoly(n.lead, prog(F, n.l[0], n.l[1]), COL.blue, 2.2);
  });
}
function drawTear(F) {
  if (F < T.tear) return; const k = CTX, o = eout(prog(F, T.tear, T.tear + 5)), gw = 7 * o, y0 = 210, y1 = 210 + 58 * o;
  const edge = side => { const P = []; for (let i = 0; i <= 8; i++) { const y = lerp(y0, y1, i / 8); P.push([BR + side * (gw * (1 - i / 8 * .7)) + rnd(-2.5, 2.5, i * 3 + (side > 0 ? 50 : 90)) * o, y]); } return P; };
  const L = edge(-1), R = edge(1);
  k.fillStyle = COL.hole; k.beginPath(); k.moveTo(L[0][0], L[0][1]); L.forEach(p => k.lineTo(p[0], p[1])); R.slice().reverse().forEach(p => k.lineTo(p[0], p[1])); k.closePath(); k.fill();
  k.strokeStyle = 'rgba(42,36,32,.55)'; k.lineWidth = 1.2; [L, R].forEach(P => { k.beginPath(); P.forEach((p, i) => i ? k.lineTo(p[0], p[1]) : k.moveTo(p[0], p[1])); k.stroke(); });
  // curled flap flips over (681-692)
  const f = eio(prog(F, 681, 692)), fx = BR + gw, fy = y0 + 4, fw = lerp(6, 22, f), fh = lerp(18, 30, f);
  k.fillStyle = 'rgba(60,40,20,.18)'; k.beginPath(); k.moveTo(fx, fy); k.lineTo(fx + fw + 4, fy + fh * .4 + 3); k.lineTo(fx, fy + fh + 3); k.closePath(); k.fill();
  k.fillStyle = COL.flap; k.strokeStyle = 'rgba(42,36,32,.5)'; k.beginPath(); k.moveTo(fx, fy); k.quadraticCurveTo(fx + fw, fy - 2, fx + fw, fy + fh * .4); k.quadraticCurveTo(fx + fw * .5, fy + fh * .8, fx, fy + fh); k.closePath(); k.fill(); k.stroke();
}
function rampColor(v) {
  const s = [[233, 217, 166], [217, 164, 65], [196, 98, 45]], t = clamp(v / 180) * 2, i = Math.min(1, Math.floor(t)), u = t - i;
  return `rgb(${s[0].map((_, c) => Math.round(lerp(s[i][c], s[i + 1][c], u))).join(',')})`;
}
function drawBarZone(F, yp) {
  const k = CTX, S = scaleAt(F), on = prog(F, 186, 204);
  if (on <= 0) { if (F >= 174) strokePoly(TEX.axis, prog(F, 174, 186), COL.ink, 2.4); return; }
  // ticks + dotted grid
  k.save(); k.globalAlpha = on;
  for (let v = 0; v <= S + .01; v += 20) {
    const x = barX(v, S); if (x > BR + 2) break;
    ink(`16px ${MONO}`, COL.muted); k.textAlign = 'center'; k.fillText(String(v), x, 200);
    if (v) { k.strokeStyle = 'rgba(42,36,32,.22)'; k.lineWidth = 1; k.setLineDash([2, 6]); k.beginPath(); k.moveTo(x, 216); k.lineTo(x, 560); k.stroke(); k.setLineDash([]); }
  }
  // frame rule (split by the tear)
  k.strokeStyle = COL.ink; k.lineWidth = 2;
  const ty = F >= T.tear ? 210 + 58 * eout(prog(F, T.tear, T.tear + 5)) : 210;
  k.beginPath(); k.moveTo(BR, ty); k.lineTo(BR, 560); k.stroke();
  // year watermark
  ink(`bold 150px ${SERIF}`, 'rgba(42,36,32,.12)'); k.textAlign = 'right'; k.fillText(String(Y0 + Math.round(yp)), 1690, 555);
  k.restore();
  strokePoly(TEX.axis, prog(F, 174, 186), COL.ink, 2.4);
  drawTear(F);
  // bars
  const grow = eout(on);
  GROUPS.forEach((g, gi) => {
    const v = valOf(D.series[g], yp) * grow, slot = slotOf(g, yp), y = ROW0 + slot * ROWH, xe = barX(v, S);
    k.save(); k.globalAlpha = on;
    ink(`27px ${HAND}`, COL.ink); k.textAlign = 'right'; k.fillText(SHORT[g], 382, y + BH / 2 + 9);
    if (xe > BX + .5) {
      const top = [[BX, y]], bot = [];
      for (let x = BX + 60; x < xe; x += 60) { top.push([x, y + rnd(-1.1, 1.1, gi * 997 + x)]); bot.push([x, y + BH + rnd(-1.1, 1.1, gi * 991 + x)]); }
      top.push([xe, y + rnd(-.8, .8, gi * 13)]);
      const P = top.concat([[xe + rnd(-.8, .8, gi * 17), y + BH]], bot.reverse(), [[BX, y + BH]]);
      k.beginPath(); P.forEach((p, i) => i ? k.lineTo(p[0], p[1]) : k.moveTo(p[0], p[1])); k.closePath();
      k.fillStyle = rampColor(v); k.fill(); k.fillStyle = TEX.hatch; k.fill();
      k.strokeStyle = COL.ink; k.lineWidth = 2; k.lineJoin = 'round'; k.stroke();
    }
    ink(`18px ${MONO}`, COL.ink); k.textAlign = 'left'; k.fillText(String(Math.round(v)), Math.max(xe, BX) + 10, y + BH / 2 + 6);
    k.restore();
  });
  return S;
}
function drawFalcon(F, S) {
  const k = CTX, p = eio(prog(F, ...RED.bracket)); if (p <= 0) return;
  const us = 'United States', yp = yearPos(F), y = ROW0 + slotOf(us, yp) * ROWH, f9 = D.falcon9['2025'], tot = D.series[us][NY - 2];
  const xf = barX(f9, S), xe = barX(tot, S);
  k.save(); k.beginPath(); k.rect(BX, y - 2, (xf - BX) * p, BH + 4); k.clip(); k.fillStyle = TEX.red; k.fillRect(BX, y, xf - BX, BH); k.restore();
  k.save(); k.globalAlpha = .55 * p; k.fillStyle = COL.flap; k.fillRect(xf, y + 1, xe - xf - 1, BH - 2); k.restore();
  strokePoly(RED.bracketP, p, COL.red, 2.6);
  const rn = RED.note; revealText(rn.txt, rn.font, rn.x0, rn.y, rn.wd, prog(F, ...rn.w), COL.red);
  strokePoly(rn.lead, prog(F, ...rn.l), COL.red, 2.4);
}
function drawEnd(F) {
  const k = CTX;
  strokePoly(RED.ringP, eio(prog(F, ...RED.ring)), COL.red, 3);
  const b = RED.big; revealText(b.txt, b.font, b.x0, b.y, b.wd, prog(F, ...b.w), COL.red);
  strokePoly(RED.cellP, prog(F, ...RED.cell), COL.red, 2, [5, 5]);
  const q = prog(F, ...RED.q); if (q > 0) { k.save(); k.beginPath(); k.rect(1630, 600, 60, 130 * q); k.clip(); ink(`34px ${HAND}`, COL.red); k.textAlign = 'center'; k.fillText('?', 1656, 722); k.restore(); }
  const g = prog(F, ...RED.ghost); if (g > 0) {
    const L1 = '2026 so far:', L2 = `236 (to ${D.lastLaunch.replace(/^\d+\s+(\w+)\s+(\d+).*$/, '$2 $1')})`, n = Math.round((L1.length + L2.length) * g);
    ink(`17px ${MONO}`, 'rgba(42,36,32,.6)'); k.textAlign = 'left'; k.fillText(L1.slice(0, n), 1690, 820); k.fillText(L2.slice(0, Math.max(0, n - L1.length)), 1690, 842);
  }
}

// ---- captions (screen space)
const CAPS = [
  [0, '1957', 'One beep from orbit: Sputnik 1 opens the space age.'],
  [250, '1957\u20131967', 'Within ten years the Soviet Union is launching more than anyone.'],
  [390, '1967\u20131991', 'Soviet launches peak at 108 in 1982, then fall with the USSR.'],
  [534, '1991\u20132018', 'After a quiet decade, China takes the lead in 2018.'],
  [645, '2018\u20132025', 'Then one rocket breaks the chart: Falcon 9 flies nine in ten US launches.'],
  [860, '2025 \u00b7 2026?', '324 orbital launch attempts in 2025. 2026 so far: 236 (to 28 Sep).'],
  [1040, 'SOURCE', 'Data: GCAT, Jonathan C. McDowell (CC BY 4.0). Made with GitHub Copilot and Opus 5.5.'],
];
const SCENE_T = CAPS.map(c => [c[1], c[0] / FPS]);
function capText(c) { const k = CTX; ink(`17px ${MONO}`, COL.red); k.textAlign = 'left'; k.fillText(c[1].toUpperCase(), 160, 958); ink(`32px ${SERIF}`, COL.ink); k.fillText(c[2], 160, 1000); }
function drawCaptions(F) {
  const k = CTX; let i = 0; while (i + 1 < CAPS.length && F >= CAPS[i + 1][0]) i++;
  const a0 = i === 0 ? 14 : CAPS[i][0], p = eio(prog(F, a0, a0 + (i === 0 ? 20 : 16))), ex = lerp(160, 1760, p);
  k.save(); k.globalAlpha = .55; k.strokeStyle = COL.ink; k.lineWidth = 1; k.beginPath(); k.moveTo(160, 935); k.lineTo(1760, 935); k.stroke(); k.restore();
  if (i > 0 && p < 1) { k.save(); k.beginPath(); k.rect(ex, 936, W, 100); k.clip(); capText(CAPS[i - 1]); k.restore(); }
  k.save(); k.beginPath(); k.rect(0, 936, ex, 100); k.clip(); capText(CAPS[i]); k.restore();
  if (p > 0 && p < 1) { k.strokeStyle = COL.ink; k.lineWidth = 2.5; k.beginPath(); k.moveTo(ex, 940); k.lineTo(ex + 3, 1012); k.stroke(); }
  if (F >= 200) { k.save(); k.globalAlpha = prog(F, 200, 230); ink(`14px ${MONO}`, COL.muted); k.textAlign = 'left'; k.fillText('Source: GCAT (J. McDowell), CC BY 4.0 \u00b7 counts are orbital launch attempts, including failures', 160, 1066); k.restore(); }
}

function render(F) {
  F = clamp(Math.round(F), 0, TOTAL - 1);
  if (!ACTIONS) ACTIONS = buildActions();
  const k = CTX, c = cam(F), yp = yearPos(F);
  k.setTransform(1, 0, 0, 1, 0, 0); k.fillStyle = '#2b2118'; k.fillRect(0, 0, W, H);
  k.save(); applyCam(c, k);
  k.drawImage(TEX.paper, -240, -210);
  drawTimeline(F, yp);
  drawNotes(F);
  ink(`15px ${MONO}`, COL.red); k.textAlign = 'left'; k.fillText('SPACE RACE \u00b7 1957\u20132025 \u00b7 GCAT', 160, 92);
  const S = drawBarZone(F, yp) || 120;
  revealText(HEAD.txt, HEAD.font, HEAD.x, HEAD.y, HEAD.wd, prog(F, ...HEAD.w), COL.ink);
  drawFalcon(F, S);
  drawEnd(F);
  k.restore();
  k.drawImage(TEX.vig, 0, 0);
  // during the Falcon push-in the timeline drops into the caption strip: lay a paper wash behind the captions
  const wash = F >= 600 ? clamp((c.z - 1) / .025) : 0;
  if (wash > 0) { const g = k.createLinearGradient(0, 890, 0, 932); g.addColorStop(0, 'rgba(232,222,200,0)'); g.addColorStop(1, 'rgba(232,222,200,1)'); k.save(); k.globalAlpha = wash; k.fillStyle = g; k.fillRect(0, 890, W, 42); k.fillStyle = 'rgb(232,222,200)'; k.fillRect(0, 932, W, H - 932); k.drawImage(TEX.vig, 0, 0); k.restore(); }
  drawCaptions(F);
  drawPencil(pencilAt(F, c));
}
