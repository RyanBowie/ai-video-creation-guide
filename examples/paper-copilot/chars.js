// chars.js — the cast, drawn as flat paper parts inside sticker sheets (see sheet() in paper.js).
'use strict';
const CP_A = new Path2D('M70 325 L160 325 Q173 325 181 300 L216 185 Q224 155 250 155 L385 155 C350 155 348 110 340 82 C330 50 315 40 290 40 L150 40 Q115 40 105 75 L40 290 Q28 325 70 325 Z');
const CP_FOLD = new Path2D('M262 40 L290 40 C315 40 330 50 340 82 C348 110 350 155 385 155 L250 155 Q224 155 220 170 Q232 90 262 40 Z');
function cpHalf(warm) {
  const a = warm ? ['#FFB16A', '#F7738A', '#E4569A', '#B04FE6'] : ['#38C2F8', '#1C8FE3', '#4DB57A', '#F7C51E'];
  const f = warm ? ['#C92E1C', '#F0582E', '#FF9A5A'] : ['#0B2BA8', '#1552D6', '#1E7BEA'];
  X.fillStyle = lgr(150, 40, 110, 325, [[0, a[0]], [.3, a[1]], [.62, a[2]], [1, a[3]]]); X.fill(CP_A);
  X.fillStyle = lgr(250, 60, 380, 150, f); X.fill(CP_FOLD);
  X.save(); X.clip(CP_A); X.fillStyle = rgr(170, 110, 0, 170, ['rgba(255,255,245,.45)', 'rgba(255,255,245,0)']); X.fillRect(0, 0, 480, 480); X.restore();
  X.lineWidth = 9; X.strokeStyle = INK; X.lineJoin = 'round'; X.stroke(CP_A);
}
// the Copilot mark, centred, `size` px wide
function cpMark(size) {
  X.save(); X.scale(size / 480, size / 480); X.translate(-240, -240);
  X.save(); X.translate(-7, -7); cpHalf(false); X.restore();
  X.save(); X.translate(7, 7); X.translate(240, 240); X.rotate(Math.PI); X.translate(-240, -240); cpHalf(true); X.restore();
  X.restore();
}
function eyes(x, y, sp, r, o = {}) {
  for (const s of [-1, 1]) {
    const ex = x + s * sp;
    if (o.closed) { X.beginPath(); X.arc(ex, y + 2, r, Math.PI * 1.1, Math.PI * 1.9); X.lineWidth = 5; X.strokeStyle = INK; X.lineCap = 'round'; X.stroke(); continue; }
    shape(ell(ex, y, r * .8, r * (o.tall || 1.15)), INK, { sw: 0 });
    shape(circ(ex - r * .25 + (o.lx || 0), y - r * .45, r * .32), '#fff', { sw: 0 });
    if (o.brow) line(ex - r * 1.1, y - r * 1.9 + s * o.brow * r * .5, ex + r * 1.1, y - r * 1.9 - s * o.brow * r * .5, INK, 5);
  }
}

// ---------- Pip, the office hero. feet at (0,0), ~360 tall. o: {expr, walk, armL, armR, mug, sweat, jump}
function pip(F, o = {}) {
  const ex = o.expr || 'smile', ph = o.walk || 0, sw = Math.sin(ph) * .5, bob = Math.abs(Math.sin(ph)) * -6 + Math.sin(F * .12) * 2;
  // legs
  for (const s of [-1, 1]) {
    X.save(); X.translate(s * 26, -118); X.rotate(s * sw);
    shape(rr(-17, 0, 34, 100, 14), '#3B4A6B'); shape(ell(4 * s, 106, 30, 15), '#4A2E22'); X.restore();
  }
  X.save(); X.translate(0, bob);
  const arm = (s, ang) => { X.save(); X.translate(s * 62, -200); X.rotate(ang); shape(rr(-15, 0, 30, 92, 15), '#9FD3F5'); shape(circ(0, 98, 17), '#FFD7B8');
    if (o.mug && s === -1) { shape(() => X.arc(-24, 112, 12, Math.PI - 1.3, Math.PI + 1.3), null); shape(rr(-20, 92, 40, 44, 7), '#F3EEE4'); shape(rr(-20, 92, 40, 11, 5), '#2E6FD6', { sw: 3 }); }
    X.restore(); };
  arm(-1, o.armL ?? (-sw * .9 + .12)); 
  // body + shirt
  shape(rr(-66, -232, 132, 128, 40), '#9FD3F5');
  shape(poly([[-24, -232], [0, -205], [24, -232]]), '#fff', { sw: 3.5 });
  shape(poly([[0, -210], [-11, -196], [0, -142], [11, -196]]), lgr(0, -210, 0, -142, ['#1C8FE3', '#4DB57A', '#F7738A', '#B04FE6']), { sw: 3.5 });
  line(-30, -228, -14, -160, '#E4569A', 4); shape(rr(-30, -168, 24, 30, 5), '#fff', { sw: 3 });
  X.save(); X.translate(-18, -153); X.scale(.04, .04); cpMark(480); X.restore();
  arm(1, o.armR ?? (sw * .9 - .12));
  // head
  X.save(); X.translate(0, -300); X.rotate(Math.sin(F * .07) * .03 + (o.tilt || 0));
  shape(circ(0, 0, 80), '#FFD7B8');
  shape(() => { X.moveTo(-82, -6); X.bezierCurveTo(-90, -86, 70, -110, 84, -14); X.bezierCurveTo(60, -50, 20, -62, -6, -46); X.bezierCurveTo(-30, -40, -56, -30, -82, -6); X.closePath(); }, '#6B3E26');
  shape(() => { X.moveTo(-4, -62); X.quadraticCurveTo(-2, -104, 26, -112); X.quadraticCurveTo(10, -88, 20, -64); X.closePath(); }, '#6B3E26');
  shape(ell(-50, 26, 15, 9), 'rgba(247,115,138,.45)', { sw: 0 }); shape(ell(50, 26, 15, 9), 'rgba(247,115,138,.45)', { sw: 0 });
  const blink = (F % 97) < 4;
  if (ex === 'shock') { eyes(0, 4, 28, 13, { tall: 1.4 }); shape(ell(0, 44, 12, 16), '#7A2430'); }
  else if (ex === 'worried') { eyes(0, 6, 28, 10, { brow: -1, closed: blink }); shape(() => { X.moveTo(-16, 44); X.quadraticCurveTo(0, 32, 16, 44); }, null); }
  else if (ex === 'grin') { eyes(0, 4, 28, 10, { closed: true }); shape(() => { X.moveTo(-26, 26); X.quadraticCurveTo(0, 64, 26, 26); X.closePath(); }, '#7A2430'); }
  else { eyes(0, 6, 28, 10, { closed: blink }); shape(() => { X.moveTo(-18, 32); X.quadraticCurveTo(0, 50, 18, 32); }, null); }
  if (o.sweat) { const y = (F * 2) % 30; shape(() => { X.moveTo(82, -30 + y); X.quadraticCurveTo(96, -6 + y, 84, 2 + y); X.quadraticCurveTo(70, -6 + y, 82, -30 + y); }, '#9ED8FF', { sw: 3 }); }
  X.restore(); X.restore();
}

// ---------- Copilot buddy: the mark with eyes, a cheek blush and a hover bob. centred.
function buddy(F, o = {}) {
  const s = o.size || 230;
  X.save(); X.translate(0, Math.sin(F * .14) * 6); X.rotate(Math.sin(F * .09) * .05);
  cpMark(s);
  const k = s / 230;
  X.save(); X.scale(k, k);
  shape(rr(-50, -28, 100, 52, 26), 'rgba(255,253,247,.94)', { sw: 3.5 });
  eyes(0, -2, 20, 10, { closed: o.happy || (F % 83) < 4 });
  if (o.happy) shape(() => { X.moveTo(-10, 12); X.quadraticCurveTo(0, 22, 10, 12); }, null, { sw: 3.5 });
  X.restore(); X.restore();
}

// ---------- Inbox Goblin: an angry envelope with teeth and a 999+ badge. centred. o.count, o.dizzy, o.hurt
function goblin(F, o = {}) {
  const sq = 1 + Math.sin(F * .3) * .03 - (o.hurt || 0) * .12;
  X.save(); X.scale(1 / sq, sq);
  for (const s of [-1, 1]) { X.save(); X.translate(s * 70, 92); X.rotate(Math.sin(F * .3 + s) * .2); shape(rr(-14, 0, 28, 44, 10), '#E8DCC0'); X.restore(); }
  shape(rr(-130, -90, 260, 190, 18), '#F4EEDC');
  shape(poly([[-130, 100], [0, 10], [130, 100]]), '#E8DFC6', { sw: 3.5 });
  shape(poly([[-130, -90], [0, 20], [130, -90]]), '#EADFC2');
  if (o.dizzy) { for (const s of [-1, 1]) { X.save(); X.translate(s * 42, -20); X.rotate(F * .3 * s); shape(() => { for (let i = 0; i < 30; i++) { const a = i / 4, r = i * .55; X.lineTo(Math.cos(a) * r, Math.sin(a) * r); } }, null, { sw: 4 }); X.restore(); } }
  else { line(-80, -52, -22, -28, INK, 8); line(80, -52, 22, -28, INK, 8); shape(circ(-44, -16, 11), INK, { sw: 0 }); shape(circ(44, -16, 11), INK, { sw: 0 }); }
  const n = o.count ?? 999;
  if (n <= 0) shape(() => { X.moveTo(-40, 44); X.quadraticCurveTo(0, 84, 40, 44); X.closePath(); }, '#7A2430');
  else shape(() => { X.moveTo(-60, 40); for (let i = 0; i <= 8; i++) X.lineTo(-60 + i * 15, 40 + (i % 2 ? 14 : -4)); X.lineTo(60, 62); X.quadraticCurveTo(0, 82, -60, 62); X.closePath(); }, '#7A2430');
  const lbl = n >= 999 ? '999+' : String(Math.max(0, Math.round(n)));
  X.save(); X.translate(112, -98); X.rotate(.15); shape(rr(-56, -30, 112, 60, 30), n > 0 ? '#E8402F' : '#3DAA5C'); txt(lbl, 0, 2, 36, '#fff'); X.restore();
  X.restore();
}

// ---------- Meeting Clash: a calendar with binder-ring horns, red header and overlapping meeting blocks. o.tidy 0..1
function clash(F, o = {}) {
  const t = o.tidy || 0;
  X.save(); X.rotate(Math.sin(F * .25) * .04 * (1 - t));
  for (const x of [-60, 60]) shape(() => { X.moveTo(x - 10, -110); X.quadraticCurveTo(x - 30, -170, x + 6, -176); }, null, { sw: 9, ink: '#8C8C99' });
  shape(rr(-120, -120, 240, 230, 16), '#FBF7EE');
  shape(rr(-120, -120, 240, 62, 16), '#D7393A');
  if (o.dizzy) eyes(0, -88, 40, 9, { closed: true }); else { line(-66, -104, -24, -88, '#fff', 7); line(66, -104, 24, -88, '#fff', 7); shape(circ(-40, -80, 8), '#fff', { sw: 0 }); shape(circ(40, -80, 8), '#fff', { sw: 0 }); }
  const cols = ['#4C8DF0', '#F2A93B', '#9B6BE0', '#3DB37A'];
  for (let i = 0; i < 4; i++) {
    const mx = lerp(-70 + (i % 2) * 34 + pmNoise(i * 3) * 18, -96 + i * 50, t), my = lerp(-30 + i * 22, -36, t), rot = lerp(pmNoise(i * 5 + 1) * .4, 0, t);
    X.save(); X.translate(mx + 40 * (1 - t), my + 40 * t); X.rotate(rot); shape(rr(0, 0, lerp(110, 42, t), lerp(40, 110, t), 8), cols[i], { sw: 3.5 }); X.restore();
  }
  X.restore();
}

// ---------- Clippy (cameo). centred around the loop
function clippy(F, o = {}) {
  X.save(); X.rotate(Math.sin(F * .1) * .06);
  X.lineCap = 'round'; X.lineJoin = 'round';
  const wire = () => { X.beginPath(); X.moveTo(-18, 90); X.lineTo(-18, -60); X.arc(8, -60, 26, Math.PI, 0); X.lineTo(34, 70); X.arc(14, 70, 20, 0, Math.PI); X.lineTo(-6, -40); X.arc(8, -40, 14, Math.PI, 0); X.lineTo(22, 50); };
  wire(); X.lineWidth = 15; X.strokeStyle = INK; X.stroke(); wire(); X.lineWidth = 9; X.strokeStyle = '#B9C3CF'; X.stroke();
  for (const ex of [-8, 26]) { shape(ell(ex, -22, 11, 14), '#fff', { sw: 3.5 }); shape(circ(ex + 2, -20, 5), INK, { sw: 0 }); }
  line(-20, -46, 2, -40, INK, 4.5); line(14, -42, 38, -48, INK, 4.5);
  X.restore();
}

// ---------- props
function envelope(F, o = {}) { X.save(); X.rotate(o.r || 0); shape(rr(-44, -30, 88, 60, 6), '#F4EEDC'); shape(poly([[-44, -30], [0, 6], [44, -30]]), '#E8DFC6', { sw: 3.5 }); shape(circ(0, 4, 8), '#E8402F', { sw: 3 }); X.restore(); }
function plane() { shape(poly([[-60, 0], [60, -24], [-20, 26]]), '#F4EEDC'); shape(poly([[-60, 0], [60, -24], [-10, 6]]), '#E3D8BE', { sw: 3.5 }); }
function star(r, col = '#FFD23F') { shape(() => { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * .45 : r; X.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } X.closePath(); }, col); }
function heart(r, col = '#F25C7A') { shape(() => { X.moveTo(0, r * .9); X.bezierCurveTo(-r * 1.6, -r * .2, -r * .6, -r * 1.2, 0, -r * .4); X.bezierCurveTo(r * .6, -r * 1.2, r * 1.6, -r * .2, 0, r * .9); }, col); }
function summaryCard() { shape(rr(-70, -46, 140, 92, 10), '#FFFDF7'); X.save(); X.translate(-40, -16); X.scale(.06, .06); cpMark(480); X.restore(); for (let i = 0; i < 3; i++) line(-14, -24 + i * 22, 52 - i * 14, -24 + i * 22, '#7B8BA8', 7); line(-52, 26, 52, 26, '#4DB57A', 7); }
