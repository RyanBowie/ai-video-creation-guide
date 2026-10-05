// sofia.js — cast looks, office set and Microsoft 365 UI props for "Copilot Quest Ep.1: Enter Copilot".
'use strict';
const UI = '"Segoe UI", sans-serif';

// ---------- cast ----------
LOOKS.sofia = { ...LOOKS.idol, hair: 'topbun', hairCol: '#2A1A14', top: '#1F2A4A', jacket: '#1F2A4A', trim: '#2E3D66', bottom: 'pants', pants: '#2B2F3A', boots: '#2A2024', sole: '#7A5A48', shoe: true, soft: true, skin: '#D9A37E', iris: '#5A3A22', clip: false, mic: false, puff: false, logo: null, hoops: true, necklace: true };
LOOKS.sofiaBeach = { ...LOOKS.sofia, swim: true, top: '#F2617A', trim: '#FFE08A', necklace: false };
LOOKS.raj = { ...LOOKS.idol, hair: 'short', hairCol: '#1C1612', top: '#F4F1EA', jacket: '#3C5A86', trim: '#A9C3E8', bottom: 'pants', pants: '#2C3442', boots: '#3A2618', sole: '#1E140C', shoe: true, soft: true, cpTee: true, skin: '#B98264', iris: '#3B2418', clip: false, mic: false, puff: false, logo: null };
LOOKS.maya = { ...LOOKS.idol, hair: 'pony', hairCol: '#C77A3A', top: '#FFF5E2', jacket: '#3E8E7E', trim: '#BFE6DA', bottom: 'pants', pants: '#3A3550', boots: '#F4F1EA', sole: '#3E8E7E', shoe: true, soft: true, cpTee: true, skin: '#F2CBB0', iris: '#3E8E7E', clip: false, mic: false, puff: false, logo: null };
LOOKS.leo = { ...LOOKS.idol, hair: 'spiky', hairCol: '#5A3E2B', top: '#C9CED6', jacket: '#E07B3C', trim: '#FFD2B0', hoodie: true, bottom: 'pants', pants: '#2E3446', boots: '#F4F4F4', sole: '#E07B3C', shoe: true, cpTee: true, skin: '#EBC09E', iris: '#5A3E2B', glasses: true, clip: false, mic: false, puff: false, logo: null };

// talking mouth while a clip plays (fake lip-sync); returns null when silent
const sfTalk = (T, t0, dur, alt = 'smile') => T >= t0 && T < t0 + dur - .1 ? (Math.sin((T - t0) * 24) + Math.sin((T - t0) * 9.3) > .1 ? 'open' : alt) : null;
// gentle idle sway pose
const sfIdle = (T, ph = 0, extra = {}) => ({ lSh: 10 + Math.sin(T * 1.6 + ph) * 3, lEl: 8, rSh: 10 - Math.sin(T * 1.6 + ph) * 3, rEl: 8, tilt: Math.sin(T * 1.1 + ph) * 3, bob: Math.sin(T * 2.2 + ph) * .04, ...extra });
// softened walk cycle
function sfWalk(T, rate = 1.7) {
  const P = run(T, rate);
  for (const k of ['lSh', 'rSh', 'lEl', 'rEl', 'lHip', 'rHip', 'lKn', 'rKn']) P[k] *= .5;
  P.lean = 3; P.bob *= .45; return P;
}
const sfBlink = (T, ph = 0) => ((T + ph) % 3.1) < .1 ? 'closed' : null;

// ---------- office set ----------
function sfOffice(T, o = {}) {
  paper(); tint('#E3EEF8', .55);
  const fy = o.floor ?? 900;
  // floor
  paint([[-40, fy], [W + 40, fy], [W + 40, H + 40], [-40, H + 40]], { fill: '#D6DEE8', sw: 2.6, shade: false, smooth: false });
  for (let i = 0; i < 9; i++) line([i * 240 - 60, fy + 4], [i * 300 - 380, H + 20], { w: 1.6, op: .25 });
  // big window with city
  const [wx, wy, ww, wh] = o.win || [1150, 110, 640, 470];
  paint(rrPts(wx - 14, wy - 14, ww + 28, wh + 28, 10), { fill: '#F8FAFD', sw: 3, shade: false });
  C.save(); path(rrPts(wx, wy, ww, wh, 4)); C.clip();
  C.fillStyle = lg(0, wy, 0, wy + wh, ['#BFE3FA', '#E4F3FC', '#FFF3E0']); C.fillRect(wx, wy, ww, wh);
  for (let i = 0; i < 9; i++) {
    const bw = 60 + hash(i + 3) * 70, bh = 120 + hash(i + 11) * 260, bx = wx + i * (ww / 8) - 20;
    C.fillStyle = i % 2 ? '#A9C7E4' : '#C3D8EE'; C.fillRect(bx, wy + wh - bh, bw, bh);
    C.fillStyle = 'rgba(255,255,255,.55)';
    for (let r = 0; r < bh / 34 - 1; r++) for (let c = 0; c < 3; c++) C.fillRect(bx + 10 + c * (bw - 20) / 3, wy + wh - bh + 14 + r * 34, 9, 14);
  }
  // drifting cloud
  C.fillStyle = 'rgba(255,255,255,.85)'; const cx = wx + ((T * 18) % (ww + 300)) - 150;
  path(ellPts(cx, wy + 90, 80, 26, 16)); C.fill(); path(ellPts(cx + 40, wy + 70, 50, 26, 16)); C.fill();
  C.restore();
  ink(rrPts(wx, wy, ww, wh, 4), { w: 3 });
  line([wx + ww / 2, wy], [wx + ww / 2, wy + wh], { w: 7, col: '#F8FAFD' }); line([wx, wy + wh * .55], [wx + ww, wy + wh * .55], { w: 7, col: '#F8FAFD' });
  // wall clock
  if (o.clock !== false) {
    const [kx, ky] = o.clockAt || [880, 170];
    paint(ellPts(kx, ky, 58, 58, 28), { fill: '#FBFCFE', sw: 3, shade: false });
    const hA = T * 30, mA = T * 360 / 4;
    line([kx, ky], [kx + Math.sin(hA * D2R) * 28, ky - Math.cos(hA * D2R) * 28], { w: 5 });
    line([kx, ky], [kx + Math.sin(mA * D2R) * 42, ky - Math.cos(mA * D2R) * 42], { w: 3.4 });
    dot(kx, ky, 5);
  }
  // plant
  if (o.plant !== false) sfPlant(o.plantAt ?? 120, fy + 20, T);
  // corkboard with travel postcards
  if (o.board) sfBoard(...o.board, T);
}
function sfPlant(x, y, T) {
  for (let i = 0; i < 7; i++) {
    const a = -70 + i * 23 + Math.sin(T * 1.3 + i) * 3, L = 150 + hash(i + 2) * 90;
    const tip = [x + Math.sin(a * D2R) * L, y - 120 - Math.cos(a * D2R) * L];
    paint(ribbon([[x, y - 110], [mix(x, tip[0], .5), mix(y - 110, tip[1], .6) - 20], tip], 3, 16, .9), { fill: i % 2 ? '#4DB57A' : '#3C9A64', sw: 2.4 });
  }
  paint([[x - 70, y - 130], [x + 70, y - 130], [x + 52, y], [x - 52, y]], { fill: '#E9D9C3', sw: 3 });
}
function sfBoard(x, y, w, h, T) {
  paint(rrPts(x, y, w, h, 8), { fill: '#D9B98E', sw: 3,   hatch: { ang: 30, gap: 9, op: .12 } });
  const pcs = [['ROMA', '#F7C51E'], ['TOKYO', '#F7738A'], ['LIMA', '#4DB57A'], ['OSLO', '#38C2F8'], ['CAIRO', '#FFB16A'], ['BALI', '#B04FE6']];
  pcs.forEach(([t, c], i) => {
    const px = x + 30 + (i % 3) * (w - 60) / 3, py = y + 30 + Math.floor(i / 3) * (h - 50) / 2;
    sfPostcard(px + 50, py + 40, 110, 76, (hash(i + 4) - .5) * 14, t, c);
  });
}
function sfPostcard(x, y, w, h, rot, label, col) {
  push(x, y, 1, 1, rot);
  paint(rrPts(-w / 2, -h / 2, w, h, 6), { fill: PAL.cream, sw: 2.4, shade: false });
  C.save(); C.fillStyle = col; C.globalAlpha = .75; C.fillRect(-w / 2 + 8, -h / 2 + 8, w * .55, h - 16); C.restore();
  ink([[-w / 2 + 12, h * .18], [-w / 2 + w * .3, -h * .15], [-w / 2 + w * .45, h * .1], [-w / 2 + w * .6, -h * .25]], { closed: false, w: 2 });
  paint(rrPts(w / 2 - w * .3, -h / 2 + 8, w * .2, h * .3, 2), { fill: col, sw: 1.6, shade: false });
  letters(label, w * .12, h * .3, h * .2, { font: HAND, weight: 700, align: 'center', shadow: false });
  dot(0, -h / 2 + 4, 6, PAL.cpRed);
  pop();
}
function sfDesk(x0, y, w) {
  paint(rrPts(x0 + 26, y + 20, w - 52, H - y + 40, 6), { fill: '#E9EDF3', sw: 3, shade: false });
  line([x0 + 60, y + 90], [x0 + w - 60, y + 90], { w: 2, op: .35 });
  paint(rrPts(x0, y - 4, w, 30, 10), { fill: '#FBFCFE', sw: 3, shade: false });
}
function sfMug(x, y, s, T) {
  push(x, y, s);
  paint([[-.5, -1.1], [.5, -1.1], [.45, 0], [-.45, 0]], { fill: '#F7738A', sw: 2.6, shade: false });
  ink(arcPts(.55, -.6, .26, .3, -90, 90, 10), { closed: false, w: 3 });
  mark(0, -.55, .55, { sw: 1 });
  C.save(); C.globalAlpha = .5;
  for (let i = 0; i < 2; i++) { const u = (T * .6 + i * .5) % 1; ink([[-.15 + i * .3, -1.2 - u * 1.2], [-.05 + i * .3 + Math.sin(T * 3 + i) * .12, -1.5 - u * 1.2], [-.15 + i * .3, -1.8 - u * 1.2]], { closed: false, w: 2.2, op: 1 - u }); }
  C.restore();
  pop();
}
function sfBackpack(x, y, s) {
  push(x, y, s);
  paint(rrPts(-1, -2.4, 2, 2.4, .5), { fill: '#C96B3C', sw: 3 });
  paint(rrPts(-.75, -1.1, 1.5, .9, .25), { fill: '#B25A30', sw: 2.4, shade: false });
  ink(arcPts(0, -2.4, .5, .45, 180, 360, 10), { closed: false, w: 3 });
  // travel stickers
  [['#F7C51E', -.55, -1.85, .3], ['#38C2F8', .45, -1.95, .26], ['#F7738A', .55, -.6, .24], ['#4DB57A', -.5, -.55, .22]].forEach(([c, sx, sy, r], i) => {
    if (i % 2) paint(starPts(sx, sy, r, r * .5, 5, i * 10), { fill: c, sw: 1.8, shade: false, smooth: false });
    else paint(ellPts(sx, sy, r, r, 14), { fill: c, sw: 1.8, shade: false });
  });
  pop();
}
// monitor on a desk; fn(x, y, w, h) draws the screen contents (clipped)
function sfMonitor(cx, by, w, h, fn) {
  const top = by - 70 - h;
  paint([[cx - 24, by - 74], [cx + 24, by - 74], [cx + 30, by - 6], [cx - 30, by - 6]], { fill: '#C9CED6', sw: 2.6, shade: false, smooth: false });
  paint(ellPts(cx, by - 4, 90, 12, 16), { fill: '#AEB4C2', sw: 2.6, shade: false });
  paint(rrPts(cx - w / 2 - 16, top - 16, w + 32, h + 32, 16), { fill: '#2E3240', sw: 3, shade: false });
  C.save(); path(rrPts(cx - w / 2, top, w, h, 6)); C.clip();
  C.fillStyle = '#F7F9FC'; C.fillRect(cx - w / 2, top, w, h);
  fn && fn(cx - w / 2, top, w, h);
  C.restore();
}
// generic app window
function sfWin(x, y, w, h, title, col, o = {}) {
  paint(rrPts(x, y, w, h, 18), { fill: o.bg || '#FBFCFE', sw: 3.2, shade: false, base: 1 });
  C.save(); path(rrPts(x, y, w, h, 18)); C.clip(); C.fillStyle = col; C.fillRect(x, y, w, o.bar ?? 58); C.restore();
  ink(rrPts(x, y, w, h, 18), { w: 3.2 });
  if (o.icon) o.icon(x + 40, y + (o.bar ?? 58) / 2);
  letters(title, x + (o.icon ? 72 : 26), y + (o.bar ?? 58) * .68, (o.bar ?? 58) * .5, { font: UI, weight: 700, fill: '#fff', shadow: false });
  for (let i = 0; i < 3; i++) dot(x + w - 34 - i * 30, y + (o.bar ?? 58) / 2, 7, 'rgba(255,255,255,.75)');
}
const sfOutlookIcon = (x, y, s = 1) => { paint(rrPts(x - 18 * s, y - 16 * s, 36 * s, 32 * s, 6 * s), { fill: '#fff', sw: 1.6, shade: false }); C.save(); C.fillStyle = MSC.out; C.font = `800 ${24 * s}px ${UI}`; C.textAlign = 'center'; C.fillText('O', x, y + 9 * s); C.restore(); };
// one inbox row
const SENDERS = ['HR Team', 'IT Service Desk', 'All Staff', 'Finance', 'Client: Contoso', 'Hannah (Mgr)', 'Raj', 'Maya', 'Leo', 'Travel Desk', 'Newsletter', 'Facilities', 'Security', 'Project Atlas', 'Comms'];
const SUBJECTS = ['Action required: policy update', 'RE: RE: FW: Q3 numbers', 'Reminder!! Timesheets', 'Urgent: client deck v12', 'Re-org announcement', 'Can you review by EOD?', 'Mandatory training', 'Please read: new tools', 'Budget sign-off', 'FW: Kick-off notes', 'Weekly digest #24', 'Desk move', 'Password expiry', 'Status update', 'Town hall recap'];
function sfMail(x, y, w, i, o = {}) {
  const h = o.h ?? 62, hi = o.hi; i = ((i % 600) + 600) % 600;
  C.save(); C.fillStyle = hi ? 'rgba(247,197,30,.28)' : (i % 2 ? 'rgba(15,108,189,.04)' : 'rgba(255,255,255,0)'); C.fillRect(x, y, w, h); C.restore();
  line([x + 10, y + h], [x + w - 10, y + h], { w: 1.2, op: .2 });
  const c = ['#0F6CBD', '#F7738A', '#4DB57A', '#B04FE6', '#FFB16A', '#38C2F8'][i % 6];
  paint(ellPts(x + 34, y + h / 2, 20, 20, 14), { fill: c, sw: 1.8, shade: false });
  letters((o.from || SENDERS[i % SENDERS.length])[0], x + 34, y + h / 2 + 8, 22, { font: UI, weight: 700, align: 'center', fill: '#fff', shadow: false });
  letters(o.from || SENDERS[i % SENDERS.length], x + 68, y + h * .44, h * .3, { font: UI, weight: 700, shadow: false, fill: '#1B1A28' });
  letters(o.subj || SUBJECTS[(i * 7) % SUBJECTS.length], x + 68, y + h * .82, h * .27, { font: UI, shadow: false, fill: '#5A5A6E' });
  if (o.flag !== false) { // red high-importance "!"
    paint(rrPts(x + w - 54, y + h / 2 - 17, 34, 34, 8), { fill: '#E3243B', sw: 1.8, shade: false });
    letters('!', x + w - 37, y + h / 2 + 11, 28, { font: UI, weight: 900, align: 'center', fill: '#fff', shadow: false });
  }
  if (o.tick) { paint(ellPts(x + w - 37, y + h / 2, 17, 17, 14), { fill: '#4DB57A', sw: 1.8, shade: false }); ink([[x + w - 46, y + h / 2], [x + w - 39, y + h / 2 + 7], [x + w - 28, y + h / 2 - 7]], { closed: false, w: 3.4, col: '#fff' }); }
}
// calendar event block
function sfEvent(x, y, w, h, col, label, o = {}) {
  C.save(); C.globalAlpha = o.op ?? 1;
  paint(rrPts(x, y, w, h, 8), { fill: col, sw: 2, shade: false, base: .95, hatch: o.tent ? { ang: 45, gap: .25, op: .35, col: '#fff' } : null });
  C.fillStyle = 'rgba(0,0,0,.18)'; C.fillRect(x + 3, y + 4, 6, h - 8);
  letters(label, x + 16, y + Math.min(30, h * .6), Math.min(20, h * .42), { font: UI, weight: 700, fill: '#fff', shadow: false });
  if (o.rec) letters('↻', x + w - 24, y + Math.min(30, h * .6), 20, { font: UI, weight: 700, fill: '#fff', shadow: false, align: 'center' });
  if (o.q) letters('?', x + w - 22, y + h - 10, 26, { font: UI, weight: 900, fill: '#fff', shadow: false, align: 'center' });
  C.restore();
}
// Copilot-drafted email reply card; k = body typing progress, rk = "ready for review" badge
function sfDraft(x, y, w, h, to, subj, k, rk) {
  paint(rrPts(x, y, w, h, 14), { fill: '#fff', sw: 2.4, shade: false, base: 1 });
  paint(rrPts(x + 18, y + 16, 92, 32, 16), { fill: '#F7C51E', sw: 1.6, shade: false });
  letters('DRAFT', x + 64, y + 40, 20, { font: UI, weight: 800, align: 'center', fill: '#2B2233', shadow: false });
  letters('To: ' + to, x + 124, y + 40, 22, { font: UI, weight: 600, fill: '#5A5A6E', shadow: false });
  letters(subj, x + 18, y + 84, 26, { font: UI, weight: 700, fill: '#1B1A28', shadow: false });
  C.save(); C.fillStyle = 'rgba(90,90,110,.28)';
  [.92, .78, .55].forEach((f, i) => { const q = clamp(k * 3 - i); if (q > 0) C.fillRect(x + 18, y + 104 + i * 22, (w - 36) * f * q, 10); });
  C.restore();
  const by = y + h - 52;
  paint(rrPts(x + w - 250, by, 104, 38, 10), { fill: '#fff', sw: 1.8, shade: false });
  letters('Edit', x + w - 198, by + 27, 22, { font: UI, weight: 700, align: 'center', fill: '#0F6CBD', shadow: false });
  paint(rrPts(x + w - 132, by, 110, 38, 10), { fill: '#0F6CBD', sw: 1.8, shade: false });
  letters('Send', x + w - 77, by + 27, 22, { font: UI, weight: 700, align: 'center', fill: '#fff', shadow: false });
  if (rk > .02) {
    push(x + 120, by + 19, backOut(clamp(rk), 2.2), 1, -4);
    paint(rrPts(-104, -18, 208, 36, 18), { fill: '#E3F6EA', sw: 1.8, shade: false });
    letters('✓ Ready for review', 0, 8, 20, { font: UI, weight: 700, align: 'center', fill: '#21A366', shadow: false });
    pop();
  }
}
// Planner task card
function sfTask(x, y, w, h, title, due, col, done) {
  paint(rrPts(x, y, w, h, 12), { fill: '#fff', sw: 2.2, shade: false, base: 1 });
  C.save(); C.fillStyle = col; C.fillRect(x + 4, y + 10, 8, h - 20); C.restore();
  paint(ellPts(x + 46, y + h / 2, 16, 16, 14), { fill: done ? '#4DB57A' : '#fff', sw: 2, shade: false });
  if (done) ink([[x + 38, y + h / 2], [x + 45, y + h / 2 + 7], [x + 55, y + h / 2 - 7]], { closed: false, w: 3, col: '#fff' });
  letters(title, x + 78, y + h * .45, 24, { font: UI, weight: 700, fill: '#1B1A28', shadow: false });
  paint(rrPts(x + 78, y + h * .58, 150, 28, 14), { fill: '#FDECEC', sw: 0, ink: false, shade: false });
  letters(due, x + 153, y + h * .58 + 20, 17, { font: UI, weight: 700, align: 'center', fill: '#C4314B', shadow: false });
}
// speech bubble; tail points to (tx, ty)
function sfBubble(x, y, w, h, lines, tx, ty, o = {}) {
  const col = o.col || '#FFFFFF', sz = o.size || 34;
  const bx = clamp(tx, x + 40, x + w - 40), by = ty < y ? y : y + h, side = ty < y ? -1 : 1;
  paint([[bx - 24, by - side * 4], [tx, ty], [bx + 24, by - side * 4]], { fill: col, sw: 2.8, shade: false, smooth: false });
  paint(rrPts(x, y, w, h, 26), { fill: col, sw: 3, shade: false, base: 1 });
  C.save(); C.fillStyle = col; C.fillRect(bx - 20, by - side * 8 - 4, 40, 10); C.restore();
  lines.forEach((t, i) => letters(t, x + w / 2, y + h / 2 + sz * .36 + (i - (lines.length - 1) / 2) * sz * 1.18, sz, { font: HAND, weight: 700, align: 'center', shadow: false, fill: o.ink || PAL.ink }));
}
function sfThought(x, y, rx, ry, fx, fy, k, inner) {
  if (k <= 0) return;
  for (let i = 0; i < 3; i++) { const q = seg(k, i * .12, i * .12 + .3, eout); if (q > 0) paint(ellPts(mix(fx, x, .2 + i * .22), mix(fy, y + ry, .2 + i * .22), (10 + i * 8) * q, (10 + i * 8) * q, 12), { fill: '#fff', sw: 2.4, shade: false }); }
  const q = seg(k, .35, .8, x => backOut(x, 2)); if (q <= 0) return;
  push(x, y, q);
  const p = []; for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; const b = 1 + .08 * Math.abs(Math.sin(a * 5)); p.push([Math.cos(a) * rx * b, Math.sin(a) * ry * b]); }
  paint(p, { fill: '#fff', sw: 3, shade: false, base: 1 });
  inner && inner();
  pop();
}
function sfSticky(x, y, s, rot, lines, col = '#FFE873') {
  push(x, y, s, 1, rot);
  paint(rrPts(-1, -1, 2, 2, .06), { fill: col, sw: 2.4, shade: false, base: 1 });
  C.save(); C.fillStyle = 'rgba(0,0,0,.07)'; C.fillRect(-1, -1, 2, .3); C.restore();
  lines.forEach(([t, sz, c], i) => letters(t, 0, -.35 + i * .55, sz, { font: MARKER, align: 'center', shadow: false, fill: c || PAL.ink }));
  pop();
}
// gamified XP bar
function sfXP(x, y, w, k, label, T) {
  paint(rrPts(x, y, w, 34, 17), { fill: '#2B2233', sw: 2.6, shade: false, base: 1 });
  if (k > .01) { C.save(); path(rrPts(x + 5, y + 5, (w - 10) * clamp(k), 24, 12)); C.fillStyle = lg(x, 0, x + w, 0, ['#38C2F8', '#1C8FE3', '#4DB57A', '#F7C51E', '#FFB16A', '#F7738A', '#B04FE6']); C.fill(); C.globalAlpha = .35; C.fillStyle = '#fff'; C.fillRect(x + 5, y + 7, (w - 10) * clamp(k), 6); C.restore(); }
  letters(label, x, y - 12, 28, { font: HAND, weight: 700, shadow: false });
  letters(Math.round(clamp(k) * 1000) + ' / 1000 XP', x + w, y - 12, 26, { font: HAND, weight: 700, shadow: false, align: 'right', fill: '#5A5A6E' });
}
function sfXPpop(txt, x, y, t0, T, col = '#4DB57A') {
  if (T < t0 || T > t0 + 1.3) return;
  const u = (T - t0) / 1.3, k = seg(T, t0, t0 + .2);
  C.save(); C.globalAlpha = 1 - seg(u, .7, 1);
  letters(txt, x, y - u * 70, 44 * backOut(k, 2.4), { font: MARKER, align: 'center', fill: col, stroke: true });
  C.restore();
}
function sfBadge(x, y, s, top, mid, k, T) {
  if (k <= 0) return;
  push(x, y, s * backOut(k, 2), 1, Math.sin(T * 2) * 3);
  paint(starPts(0, 0, 1.25, 1.02, 14, T * 20), { fill: '#F7C51E', sw: 2.6, shade: false, smooth: false });
  paint(ellPts(0, 0, .92, .92, 30), { fill: '#FFF5E2', sw: 2.6, shade: false });
  mark(0, -.28, .62, { sw: 1 });
  letters(top, 0, .33, .2, { font: HAND, weight: 700, align: 'center', shadow: false });
  letters(mid, 0, .6, .22, { font: MARKER, align: 'center', shadow: false, fill: PAL.cpPink });
  pop();
}
function sfWatch(x, y, r, k, label) {
  paint(rrPts(x - 14, y - r - 26, 28, 18, 4), { fill: '#AEB4C2', sw: 2.2, shade: false });
  paint(ellPts(x, y, r, r, 30), { fill: '#fff', sw: 3, shade: false });
  C.save(); C.fillStyle = 'rgba(77,181,122,.45)'; C.beginPath(); C.moveTo(x, y); C.arc(x, y, r * .86, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(k)); C.closePath(); C.fill(); C.restore();
  const a = -90 + 360 * k; line([x, y], [x + Math.cos(a * D2R) * r * .8, y + Math.sin(a * D2R) * r * .8], { w: 4 });
  dot(x, y, 6); if (label) letters(label, x, y + r + 44, 36, { font: MARKER, align: 'center', shadow: false });
}
// Copilot buddy: floating mark with orbiting sparkles
function sfBuddy(x, y, s, T, k = 1) {
  if (k <= 0) return;
  C.save(); C.globalAlpha = .35 * k; C.fillStyle = rg(x, y, s * 1.1, ['rgba(56,194,248,.8)', 'rgba(176,79,230,.25)', 'rgba(176,79,230,0)']); path(ellPts(x, y, s * 1.1, s * 1.1, 30)); C.fill(); C.restore();
  mark(x, y + Math.sin(T * 3) * s * .06, s * backOut(k, 2), { rot: Math.sin(T * 2) * 6, sw: 2 });
  for (let i = 0; i < 3; i++) { const a = T * 1.8 + i * 2.09; spark(x + Math.cos(a) * s * .85, y + Math.sin(a) * s * .55, s * .09 * k, [PAL.cpYellow, PAL.cpSky, PAL.cpPink][i], T * 90); }
}
// typed prompt chip
function sfPrompt(x, y, w, txt, k, T) {
  paint(rrPts(x, y, w, 64, 32), { fill: '#FFFFFF', sw: 2.6, shade: false, base: 1 });
  mark(x + 36, y + 32, 34, { sw: .8 });
  const n = Math.floor(txt.length * clamp(k));
  letters(txt.slice(0, n) + (k < 1 && (T * 3) % 1 < .5 ? '|' : ''), x + 66, y + 42, 28, { font: UI, shadow: false, fill: '#2B2233' });
  paint(ellPts(x + w - 34, y + 32, 22, 22, 14), { fill: k >= 1 ? '#1C8FE3' : '#C9CED6', sw: 1.8, shade: false });
  ink([[x + w - 42, y + 32], [x + w - 26, y + 32], [x + w - 33, y + 24]], { closed: false, w: 3, col: '#fff' });
}
// Teams chat ping
function sfPing(x, y, s, who, txt, k) {
  if (k <= 0) return;
  push(x, y, s * backOut(k, 2.2));
  paint(rrPts(-170, -46, 340, 92, 18), { fill: '#FFFFFF', sw: 2.6, shade: false, base: 1 });
  C.save(); C.fillStyle = PAL.teams; C.fillRect(-170, -46, 10, 92); C.restore();
  appTile('teams', -124, 0, 50);
  letters(who, -86, -8, 22, { font: UI, weight: 700, shadow: false });
  letters(txt, -86, 24, 20, { font: UI, shadow: false, fill: '#5A5A6E' });
  pop();
}
// laptop/tablet held up by a colleague, screen content callback
function sfScreenProp(x, y, w, h, rot, fn) {
  push(x, y, 1, 1, rot);
  paint(rrPts(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24, 14), { fill: '#2E3240', sw: 3, shade: false });
  C.save(); path(rrPts(-w / 2, -h / 2, w, h, 6)); C.clip(); C.fillStyle = '#FFFFFF'; C.fillRect(-w / 2, -h / 2, w, h); fn && fn(-w / 2, -h / 2, w, h); C.restore();
  pop();
}
// mini PowerPoint slide
function sfSlide(x, y, w, h, title, k = 1, T = 0) {
  C.save(); C.fillStyle = '#FFFFFF'; C.fillRect(x, y, w, h);
  C.fillStyle = '#C43E1C'; C.fillRect(x, y, w, h * .2);
  letters(title, x + w * .05, y + h * .15, h * .11, { font: UI, weight: 700, fill: '#fff', shadow: false });
  const bars = [.45, .62, .54, .8, .95];
  bars.forEach((v, i) => { const q = seg(k, i * .12, i * .12 + .35, eout); C.fillStyle = ['#38C2F8', '#1C8FE3', '#4DB57A', '#F7C51E', '#F7738A'][i]; const bh = h * .55 * v * q; C.fillRect(x + w * (.08 + i * .1), y + h * .9 - bh, w * .07, bh); });
  for (let i = 0; i < 3; i++) { C.fillStyle = 'rgba(43,34,51,.25)'; C.fillRect(x + w * .62, y + h * (.36 + i * .16), w * .32 * seg(k, .3 + i * .15, .6 + i * .15), h * .06); }
  C.restore();
}
function sfDoc(x, y, w, h, k = 1, hi = false) {
  C.save(); C.fillStyle = '#FFFFFF'; C.fillRect(x, y, w, h);
  C.fillStyle = '#185ABD'; C.fillRect(x, y, w, h * .14);
  for (let i = 0; i < 7; i++) { C.fillStyle = hi && i < 3 ? 'rgba(247,197,30,.55)' : 'rgba(43,34,51,.22)'; C.fillRect(x + w * .08, y + h * (.24 + i * .1), w * (i % 3 === 2 ? .6 : .84) * seg(k, i * .08, i * .08 + .3), h * .05); }
  C.restore();
}

// ---------- holiday props ----------
// front-facing laptop on a desk; fn(x, y, w, h) draws the screen
function sfLaptop(cx, by, w, h, fn) {
  paint([[cx - w / 2 - 34, by - 8], [cx + w / 2 + 34, by - 8], [cx + w / 2 + 46, by + 8], [cx - w / 2 - 46, by + 8]], { fill: '#C9CED6', sw: 2.6, shade: false, smooth: false });
  paint(rrPts(cx - w / 2 - 12, by - 14 - h - 12, w + 24, h + 24, 12), { fill: '#2E3240', sw: 3, shade: false });
  C.save(); path(rrPts(cx - w / 2, by - 14 - h, w, h, 5)); C.clip(); C.fillStyle = '#FFFFFF'; C.fillRect(cx - w / 2, by - 14 - h, w, h); fn && fn(cx - w / 2, by - 14 - h, w, h); C.restore();
}
function sfSun(x, y, r, T) {
  C.save();
  C.fillStyle = rg(x, y, r * 3.2, ['rgba(255,236,150,.75)', 'rgba(255,200,110,.35)', 'rgba(255,190,110,0)']); C.fillRect(x - r * 3.3, y - r * 3.3, r * 6.6, r * 6.6);
  C.globalAlpha = .35; C.strokeStyle = '#FFFFFF'; C.lineWidth = 5;
  for (let k = 0; k < 2; k++) { const rr = r * (1.95 + k * .45) + Math.sin(T * 2 + k) * 6; C.beginPath(); C.arc(x, y, rr, 0, 7); C.stroke(); }
  C.restore();
  const rot = T * 9;
  for (let i = 0; i < 16; i++) {
    const a = (rot + i * 22.5) * D2R, long = i % 2 === 0, L = r * (long ? 1.75 : 1.42) + Math.sin(T * 4 + i) * r * .06, w = long ? .17 : .12;
    const p = (ang, rad) => [x + Math.cos(ang) * rad, y + Math.sin(ang) * rad];
    paint([p(a - w, r * 1.05), p(a, L), p(a + w, r * 1.05)], { fill: long ? '#FFB16A' : '#FFD45A', sw: 2.2, shade: false, smooth: false });
  }
  paint(ellPts(x, y, r * 1.08, r * 1.08, 34), { fill: '#FFB34A', sw: 2.6, shade: false });
  paint(ellPts(x, y, r, r, 34), { fill: '#F7C51E', sw: 0, shade: false });
  C.save(); path(ellPts(x, y, r, r, 34)); C.clip();
  C.fillStyle = rg(x - r * .35, y - r * .4, r * 1.3, ['rgba(255,250,210,.95)', 'rgba(255,230,120,.3)', 'rgba(255,170,60,.35)']); C.fillRect(x - r, y - r, r * 2, r * 2);
  C.restore();
  // happy face
  const blink = (T % 3.7) > 3.55;
  for (const sx of [-1, 1]) {
    if (blink) ink([[x + sx * r * .34 - r * .1, y - r * .12], [x + sx * r * .34 + r * .1, y - r * .12]], { closed: false, w: 4 });
    else ink(arcPts(x + sx * r * .34, y - r * .08, r * .13, r * .11, 200, 340, 8), { closed: false, w: 4.2 });
    paint(ellPts(x + sx * r * .52, y + r * .18, r * .15, r * .09, 14), { fill: 'rgba(247,115,138,.55)', sw: 0, shade: false });
  }
  ink(arcPts(x, y + r * .12, r * .3, r * .24, 20, 160, 12), { closed: false, w: 4.2 });
  paint(ellPts(x - r * .45, y - r * .5, r * .16, r * .09, 12, 0, -30), { fill: 'rgba(255,255,255,.8)', sw: 0, shade: false });
}
// reclining wooden sun lounger; (x, y) = where the sitter's hips rest; back = recline angle (deg from vertical)
function sfLounger(x, y, back = 55) {
  paint(ellPts(x + 60, y + 128, 330, 26, 24), { fill: 'rgba(150,110,60,.28)', sw: 0, shade: false });
  const wood = '#B9824E', leg = (a, b) => paint(ribbon([a, b], 9, 8, 0), { fill: '#9C6A3C', sw: 2.4 });
  leg([x - 150, y + 40], [x - 175, y + 125]); leg([x + 300, y + 40], [x + 320, y + 125]);
  leg([x - 20, y + 40], [x + 10, y + 125]);
  // back strut
  leg([x - 250, y - 30], [x - 130, y + 40]);
  // seat frame + striped cushion
  paint(rrPts(x - 190, y + 26, 520, 22, 10), { fill: wood, sw: 2.6, shade: false });
  paint(rrPts(x - 40, y - 4, 360, 34, 14), { fill: '#FFFFFF', sw: 2.6, shade: false });
  C.save(); path(rrPts(x - 40, y - 4, 360, 34, 14)); C.clip(); C.fillStyle = '#38C2F8';
  for (let i = 0; i < 10; i++) C.fillRect(x - 40 + i * 40, y - 6, 20, 40);
  C.restore(); ink(rrPts(x - 40, y - 4, 360, 34, 14), { w: 2.6 });
  // backrest
  push(x - 10, y + 22, 1, 1, -back);
  paint(rrPts(-82, -410, 22, 430, 10), { fill: wood, sw: 2.6, shade: false });
  paint(rrPts(-62, -400, 44, 420, 18), { fill: '#FFFFFF', sw: 2.6, shade: false });
  C.save(); path(rrPts(-62, -400, 44, 420, 18)); C.clip(); C.fillStyle = '#38C2F8';
  for (let i = 0; i < 11; i++) C.fillRect(-64, -400 + i * 40, 48, 20);
  C.restore(); ink(rrPts(-62, -400, 44, 420, 18), { w: 2.6 });
  pop();
}
function sfCocktail(x, y, T) {
  paint([[x - 38, y - 90], [x + 38, y - 90], [x, y - 40]], { fill: '#FFB16A', sw: 2.4, shade: false, smooth: false });
  paint([[x - 30, y - 84], [x + 30, y - 84], [x, y - 50]], { fill: '#F7738A', sw: 0, shade: false, smooth: false });
  line([x, y - 40], [x, y - 4], { w: 3.4 }); paint(ellPts(x, y - 2, 24, 7, 12), { fill: '#FFFFFF', sw: 2.4, shade: false });
  line([x + 10, y - 92], [x + 26, y - 128], { w: 3 });
  paint(arcPts(x - 22, y - 96, 26, 18, 180, 360, 10), { fill: PAL.cpPink, sw: 2, shade: false });
  paint(ellPts(x + 30, y - 92, 9, 9, 10), { fill: '#4DB57A', sw: 2, shade: false });
}function sfPalm(x, y, s, T, lean = 1) {
  push(x, y, s, lean);
  const top = [60 + Math.sin(T * 1.2) * 4, -420];
  paint(ribbon([[0, 0], [30, -200], top], 30, 22, .2), { fill: '#B98A5A', sw: 2.6, hatch: { ang: 0, gap: 22, op: .25 } });
  for (let i = 0; i < 6; i++) {
    const a = -170 + i * 40 + Math.sin(T * 1.6 + i) * 4, L = 190;
    const tip = [top[0] + Math.cos(a * D2R) * L, top[1] + Math.sin(a * D2R) * L * .55 + 70];
    paint(ribbon([top, [mix(top[0], tip[0], .5), mix(top[1], tip[1], .5) - 50], tip], 4, 30, .5), { fill: i % 2 ? '#4DB57A' : '#3C9A64', sw: 2.4 });
  }
  [[-14, 6], [18, 10], [2, 22]].forEach(([dx, dy]) => paint(ellPts(top[0] + dx, top[1] + dy, 16, 16, 12), { fill: '#7A5230', sw: 2, shade: false }));
  pop();
}
function sfSea(y, T, col = '#38C2F8') {
  paint([[-40, y], [W + 40, y], [W + 40, y + 200], [-40, y + 200]], { fill: col, sw: 2.4, shade: false, smooth: false });
  C.save(); C.globalAlpha = .6;
  for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) { const wx = ((i * 260 + T * (30 + r * 14) + r * 90) % (W + 300)) - 150; ink(arcPts(wx, y + 40 + r * 50, 40, 10, 200, 340, 8), { closed: false, w: 2.2, col: '#FFFFFF' }); }
  C.restore();
}
function sfColosseum(x, y, s) {
  push(x, y, s);
  paint([[-1.4, 0], [-1.4, -.95], [-.9, -1.15], [.6, -1.3], [1.4, -1.0], [1.4, 0]], { fill: '#E9C99A', sw: 2.4, smooth: false, hatch: { ang: 0, gap: .3, op: .18 } });
  for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) paint(rrPts(-1.25 + i * .37, -.9 + r * .3, .2, .22, .1), { fill: '#9C6B3E', sw: 1.2, shade: false });
  pop();
}
function sfFuji(x, y, s) {
  push(x, y, s);
  paint([[-1.6, 0], [-.35, -1.2], [.35, -1.2], [1.6, 0]], { fill: '#6F8FC9', sw: 2.4, smooth: false });
  paint([[-.35, -1.2], [.35, -1.2], [.62, -.92], [.3, -.82], [.05, -.95], [-.25, -.8], [-.62, -.92]], { fill: '#FFFFFF', sw: 2, smooth: false, shade: false });
  paint([[-1.3, 0], [-1.25, -.55], [-1.15, -.55], [-1.1, 0]], { fill: '#E3243B', sw: 1.6, shade: false, smooth: false });
  paint([[1.1, 0], [1.15, -.55], [1.25, -.55], [1.3, 0]], { fill: '#E3243B', sw: 1.6, shade: false, smooth: false });
  paint(rrPts(-1.42, -.66, .44, .1, .03), { fill: '#E3243B', sw: 1.4, shade: false });
  paint(rrPts(.98, -.66, .44, .1, .03), { fill: '#E3243B', sw: 1.4, shade: false });
  pop();
}
function sfMachu(x, y, s) {
  push(x, y, s);
  paint([[-1.6, 0], [-.9, -.7], [-.4, -.55], [.3, -1.5], [.75, -1.1], [1.0, -1.25], [1.6, 0]], { fill: '#4DB57A', sw: 2.4 });
  for (let i = 0; i < 4; i++) line([-1.2 + i * .12, -.15 - i * .14], [-.2 - i * .05, -.15 - i * .14], { w: 1.6, op: .5 });
  for (let i = 0; i < 4; i++) paint(rrPts(-.95 + i * .2, -.42, .14, .12, .02), { fill: '#C9B79A', sw: 1.2, shade: false });
  pop();
}
// circular passport stamp
function sfStampMark(x, y, r, label, col, rot, k) {
  if (k <= 0) return;
  push(x, y, mix(2, 1, eout(k)), 1, rot);
  C.save(); C.globalAlpha = clamp(k * 1.6) * .85;
  ink(ellPts(0, 0, r, r * .72, 24), { w: 3.4, col }); ink(ellPts(0, 0, r * .8, r * .55, 24), { w: 1.8, col });
  letters(label, 0, r * .13, r * .38, { font: MARKER, align: 'center', fill: col, shadow: false });
  C.restore(); pop();
}
// hammock between two points; returns the lowest point
function sfHammock(x1, y1, x2, y2, sag) {
  const mid = [(x1 + x2) / 2, Math.max(y1, y2) + sag];
  const top = [], bot = [];
  for (let i = 0; i <= 16; i++) { const u = i / 16, yy = mix(y1, y2, u) + Math.sin(u * Math.PI) * sag; top.push([mix(x1, x2, u), yy]); bot.unshift([mix(x1, x2, u), yy + Math.sin(u * Math.PI) * 46]); }
  paint([...top, ...bot], { fill: '#F7738A', sw: 2.6, shade: false, hatch: { ang: 90, gap: 18, op: .25 } });
  return mid;
}
