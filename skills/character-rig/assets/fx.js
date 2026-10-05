// fx.js — music-video helpers: beat grid, camera, lyric pops, karaoke, transitions, backgrounds, props.
'use strict';
const BEAT = 60 / 88, B0 = .605; // set to the track: 60/BPM and the first downbeat (s)
const bt = k => B0 + BEAT * k;
const bpos = T => (T - B0) / BEAT;
const bidx = T => Math.floor(bpos(T));
const bfrac = T => bpos(T) - bidx(T);
const kick = T => Math.exp(-bfrac(T) * BEAT * 7);
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const LYR = [
  // [startSec, endSec, "lyric line"] in ORIGINAL song time; word k of line i starts at WT(i, k)
];
const HIDE = new Set(); // lyric indices cut from the audio: hide them without shifting WT() indices
const WT = (li, wi) => { const [a, b, s] = LYR[li]; return a + (b - a) * wi / s.split(' ').length; };
// fake lip-sync: open on the first 60% of each word slot
function sing(T) {
  for (const [a, b, s] of LYR) if (T >= a && T < b) { const n = s.split(' ').length, u = (T - a) / (b - a) * n; return u - Math.floor(u) < .6 ? 'open' : 'smile'; }
  return 'smile';
}

// ---------- camera ----------
function cam(z, x, y, rot, fn) { push(W / 2 + (x || 0), H / 2 + (y || 0), z, 1, rot || 0); C.translate(-W / 2, -H / 2); fn(); pop(); }
const punch = (T, a, amt = .14, d = .28) => 1 + amt * (1 - eout(seg(T, a, a + d)));
const shake = (T, t0, amp = 14) => T < t0 ? 0 : Math.exp(-(T - t0) * 12) * Math.sin((T - t0) * 70) * amp;

// ---------- lettering ----------
const GF = (cols, w = 5) => (c, x, y, s) => { const g = c.createLinearGradient(x - s * w * .5, y - s, x + s * w * .5, y); cols.forEach((k, i) => g.addColorStop(i / (cols.length - 1), k)); return g; };
const G_COOL = GF(['#38C2F8', '#1C8FE3', '#6A5BD0', '#B04FE6']);
const G_WARM = GF(['#FFB16A', '#F7738A', '#E4569A', '#B04FE6']);
const G_SUN = GF(['#F7C51E', '#FFB16A', '#F7738A']);
const G_RIB = GF(['#38C2F8', '#1C8FE3', '#4DB57A', '#F7C51E', '#FFB16A', '#F7738A', '#B04FE6'], 7);
function wobbleText(txt, x, y, size, T, o = {}) {
  C.save(); C.font = `${o.weight || ''} ${size}px ${o.font || MARKER}`; const ch = [...txt], ws = ch.map(c => C.measureText(c).width); C.restore();
  let cx = x - ws.reduce((a, b) => a + b, 0) / 2;
  ch.forEach((c, i) => { letters(c, cx + ws[i] / 2, y + Math.sin(T * 6 + i * .8) * size * .07, size, { ...o, align: 'center', rot: Math.sin(T * 5 + i * 1.3) * (o.wa ?? 6) }); cx += ws[i]; });
}
// word pop: backOut scale-in at t0
function wpop(txt, x, y, size, t0, T, o = {}) {
  if (T < t0 || (o.until && T > o.until)) return;
  const k = seg(T, t0, t0 + (o.dur || .2)), sc = backOut(k, 2.4) * (o.pulse ? 1 + o.pulse * kick(T) : 1);
  if (sc < .01) return;
  push(x, y, sc, 1, (o.rot || 0) + (o.wig ? Math.sin(T * 17) * o.wig : 0));
  if (o.wob) wobbleText(txt, 0, 0, size, T, o);
  else if (o.glitch) {
    const g = o.glitch * (.4 + kick(T));
    letters(txt, -g, 0, size, { ...o, rot: 0, align: 'center', shadow: false, fill: 'rgba(56,194,248,.85)' });
    letters(txt, g, g * .3, size, { ...o, rot: 0, align: 'center', shadow: false, fill: 'rgba(240,88,46,.85)' });
    letters(txt, 0, 0, size, { ...o, rot: 0, align: 'center', shadow: false });
  } else letters(txt, 0, 0, size, { ...o, rot: 0, align: 'center' });
  pop();
}
function stamp(txt, x, y, size, t0, T, rot = -8, col = PAL.cpRed) {
  if (T < t0) return;
  const k = seg(T, t0, t0 + .12), a = clamp(k * 1.6);
  push(x, y, mix(2.3, 1, eout(k)), 1, rot);
  C.save(); C.font = `${size}px ${MARKER}`; const tw = C.measureText(txt).width; C.restore();
  C.save(); C.globalAlpha = a * .92;
  C.fillStyle = 'rgba(255,245,226,.55)'; path(rrPts(-tw / 2 - size * .28, -size * .98, tw + size * .56, size * 1.3, size * .12)); C.fill();
  ink(rrPts(-tw / 2 - size * .28, -size * .98, tw + size * .56, size * 1.3, size * .12), { w: 8, col, op: a * .92 });
  letters(txt, 0, 0, size, { align: 'center', fill: col, shadow: false });
  C.restore(); pop();
}

// ---------- karaoke strip ----------
function karaoke(T) {
  const L = LYR.find(([a, b], i) => !HIDE.has(i) && T >= a - .15 && T < b + .35); if (!L) return;
  const [a, b, s] = L, al = seg(T, a - .15, a) * (1 - seg(T, b + .15, b + .35)), pr = seg(T, a, b);
  const size = 40, y = 1036;
  C.save(); C.font = `700 ${size}px ${HAND}`; const tw = C.measureText(s).width; C.restore();
  const x0 = W / 2 - tw / 2;
  C.save(); C.globalAlpha = al;
  push(W / 2, y - 14, 1, 1, -.6); C.translate(-W / 2, -(y - 14));
  C.fillStyle = 'rgba(255,245,226,.94)'; path(rrPts(x0 - 70, y - 50, tw + 110, 72, 16)); C.fill();
  ink(rrPts(x0 - 70, y - 50, tw + 110, 72, 16), { w: 2.6, op: al });
  mark(x0 - 36, y - 14, 38, { sw: 1.4 });
  letters(s, x0, y, size, { font: HAND, weight: 700, fill: 'rgba(43,34,51,.28)', shadow: false });
  C.save(); C.beginPath(); C.rect(x0 - 4, y - 60, (tw + 8) * pr, 90); C.clip();
  letters(s, x0, y, size, { font: HAND, weight: 700, fill: (c, x, yy) => { const g = c.createLinearGradient(x, 0, x + tw, 0); g.addColorStop(0, PAL.cpDeep); g.addColorStop(.5, PAL.cpPurple); g.addColorStop(1, PAL.cpPink); return g; }, shadow: false });
  C.restore();
  pop(); C.restore();
}

// ---------- offscreen layer + transitions ----------
let OFF, OFFC;
function layer(fn) {
  if (!OFF) { OFF = document.createElement('canvas'); OFF.width = W; OFF.height = H; OFFC = OFF.getContext('2d'); }
  const sc = C, su = U; C = OFFC; U = 1; C.setTransform(1, 0, 0, 1, 0, 0); C.__u = []; C.clearRect(0, 0, W, H);
  try { fn(); } finally { C = sc; U = su; }
}
function blob(cx, cy, r, n = 44, sd = 0) {
  const p = []; for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, q = r * (1 + .1 * Math.sin(k * 3.7 + sd) + .09 * (hash(k + sd * 13) - .5)); p.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } return p;
}
function composite(tr, e) {
  C.save();
  if (tr.type === 'splat') {
    const r = eio(e) * 1450 + 1, p = blob(tr.x ?? W / 2, tr.y ?? H / 2, r, 44, tr.sd || 1);
    path(p); C.clip(); C.drawImage(OFF, 0, 0); C.restore();
    ink(p, { w: 6, op: 1 - e * .6 });
    for (let k = 0; k < 7; k++) { const a = hash(k + 5) * 6.28, d = r * (1.08 + hash(k + 9) * .25); dot((tr.x ?? W / 2) + Math.cos(a) * d, (tr.y ?? H / 2) + Math.sin(a) * d, 8 + hash(k) * 18, PAL.ink); }
    return;
  }
  if (tr.type === 'tear') {
    const ex = mix(W + 120, -120, eio(e)), edge = [];
    for (let y = -40, i = 0; y <= H + 40; y += 36, i++) edge.push([ex + (hash(i + 3) - .5) * 60 + Math.sin(y * .02) * 20, y]);
    const reg = [[W + 200, -40], ...edge, [W + 200, H + 40]];
    C.save(); C.globalAlpha = .35; C.translate(-10, 6); path(reg); C.fillStyle = PAL.ink; C.fill(); C.restore();
    path(reg); C.clip(); C.drawImage(OFF, 0, 0); C.restore();
    C.save(); C.lineWidth = 14; C.strokeStyle = PAL.cream; C.lineJoin = 'round'; path(edge, false); C.stroke(); C.restore();
    ink(edge, { closed: false, raw: true, w: 3 });
    return;
  }
  if (tr.type === 'wipe') {
    const x = mix(-600, W + 600, eio(e)), p = [[-800, -40], [x + 300, -40], [x - 300, H + 40], [-800, H + 40]];
    path(p); C.clip(); C.drawImage(OFF, 0, 0); C.restore();
    ink([[x + 300, -40], [x - 300, H + 40]], { closed: false, w: 7 });
    return;
  }
  C.drawImage(OFF, 0, 0); C.restore();
}

// ---------- backgrounds ----------
function sunburst(cx, cy, n, cols, rot, op = .32) {
  C.save(); C.globalCompositeOperation = 'multiply'; C.globalAlpha = op;
  for (let i = 0; i < n; i++) {
    const a0 = (rot + i * 360 / n) * D2R, a1 = (rot + (i + .5) * 360 / n) * D2R;
    C.fillStyle = cols[i % cols.length]; C.beginPath(); C.moveTo(cx, cy);
    C.lineTo(cx + Math.cos(a0) * 3200, cy + Math.sin(a0) * 3200); C.lineTo(cx + Math.cos(a1) * 3200, cy + Math.sin(a1) * 3200); C.fill();
  }
  C.restore();
}
function tint(col, op = 1) { C.save(); C.globalCompositeOperation = 'multiply'; C.globalAlpha = op; C.fillStyle = col; C.fillRect(-50, -50, W + 100, H + 100); C.restore(); }
function spark(x, y, r, col = PAL.cpYellow, rot = 0) { paint(starPts(x, y, r, r * .3, 4, rot), { fill: col, sw: 2.6, shade: false, smooth: false }); }
function shadowE(x, y, rx) { C.save(); C.globalAlpha = .18; C.fillStyle = PAL.ink; path(ellPts(x, y, rx, rx * .16, 20)); C.fill(); C.restore(); }
function speedLines(T, col = PAL.ink, n = 20, sp = 2600) {
  for (let i = 0; i < n; i++) {
    const y = hash(i) * H, L = 180 + hash(i + 40) * 380, span = W + L + 200, x = W + 100 - ((hash(i + 80) * span + T * sp) % span);
    line([x, y], [x + L, y], { w: 3 + hash(i + 7) * 3, col, op: .55 });
  }
}
function circuits(T, col = '#38C2F8') {
  for (let i = 0; i < 26; i++) {
    const x0 = hash(i) * W, y0 = hash(i + 100) * H, d1 = 120 + hash(i + 200) * 300, dg = 60 + hash(i + 300) * 140, sx = hash(i + 400) < .5 ? -1 : 1, sy = hash(i + 500) < .5 ? -1 : 1, d2 = 100 + hash(i + 600) * 260;
    const p = [[x0, y0], [x0 + sx * d1, y0], [x0 + sx * (d1 + dg), y0 + sy * dg], [x0 + sx * (d1 + dg + d2), y0 + sy * dg]];
    C.save(); C.globalAlpha = .55; C.strokeStyle = col; C.lineWidth = 3; C.lineJoin = 'round'; path(p, false); C.stroke(); C.restore();
    dot(p[0][0], p[0][1], 7, col); ink(ellPts(p[3][0], p[3][1], 9, 9, 10), { w: 2.4, col });
    const u = (T * .5 + hash(i + 700)) % 1, L = [d1, dg * 1.414, d2], tot = L[0] + L[1] + L[2]; let d = u * tot, k = 0; while (k < 2 && d > L[k]) { d -= L[k]; k++; }
    const q = [mix(p[k][0], p[k + 1][0], d / L[k]), mix(p[k][1], p[k + 1][1], d / L[k])];
    C.save(); C.fillStyle = rg(q[0], q[1], 22, ['rgba(255,255,230,.95)', 'rgba(56,194,248,0)']); C.fillRect(q[0] - 22, q[1] - 22, 44, 44); C.restore();
  }
}
function neuralNet(T, x0, y0, w, h) {
  const Ls = [3, 5, 5, 4, 2], nodes = Ls.map((n, i) => Array.from({ length: n }, (_, j) => [x0 + w * i / (Ls.length - 1), y0 + h * (j + .5) / n]));
  C.save(); C.globalAlpha = .35; C.strokeStyle = PAL.cpBlue; C.lineWidth = 2;
  for (let i = 0; i < nodes.length - 1; i++) for (const a of nodes[i]) for (const b of nodes[i + 1]) { C.beginPath(); C.moveTo(a[0], a[1]); C.lineTo(b[0], b[1]); C.stroke(); }
  C.restore();
  const k = kick(T), cols = [PAL.cpSky, PAL.cpBlue, PAL.cpPurple, PAL.cpPink, PAL.cpPeach];
  nodes.forEach((L, i) => L.forEach(([x, y], j) => { const r = 16 + 8 * k * ((i + j + bidx(T)) % 2); paint(ellPts(x, y, r, r, 14), { fill: cols[i], sw: 2.4, shade: false }); }));
}
function teethRow(y, dir, col = PAL.cream, n = 12) {
  const w = W / n, p = [[-20, y - dir * 400]];
  for (let i = 0; i <= n; i++) { p.push([i * w, y]); if (i < n) p.push([i * w + w / 2, y + dir * (70 + hash(i) * 30)]); }
  p.push([W + 20, y - dir * 400]);
  C.save(); C.fillStyle = '#3A1022'; path([[-20, y - dir * 1400], [W + 20, y - dir * 1400], [W + 20, y - dir * 380], [-20, y - dir * 380]]); C.fill(); C.restore();
  paint(p, { fill: col, sw: 3.4, smooth: false, shade: false });
}

// ---------- props ----------
function crown(x, y, s) {
  push(x, y, s);
  paint([[-1, 0], [1, 0], [1.1, -1], [.55, -.45], [0, -1.25], [-.55, -.45], [-1.1, -1]], { fill: lg(0, -1.2, 0, 0, ['#FFE27A', '#F7C51E', '#E8AA38']), sw: 3, smooth: false });
  dot(0, -1.25, .15, PAL.cpPink); dot(-1.1, -1, .12, PAL.cpSky); dot(1.1, -1, .12, PAL.cpSky); dot(0, -.3, .16, PAL.cpPurple);
  pop();
}
function maw(x, y, s, open, T) {
  push(x, y, s);
  const o = .25 + open * 1.25;
  paint(ellPts(0, 0, 3, 2.5, 28), { fill: lg(0, -2.5, 0, 2.5, ['#27C49A', '#10A37F', '#0B6E57']), sw: 4, hatch: { ang: 30, gap: .22, op: .12 } });
  const m = ellPts(.2, .5, 2.3, o, 26);
  paint(m, { fill: '#3A1022', sw: 3.4, shade: false });
  C.save(); path(smooth(m, true, 3)); C.clip();
  paint(ellPts(.2, .5 + o * .75, 1.3, .55, 16), { fill: PAL.cpPink, sw: 2.4, shade: false });
  for (let i = 0; i < 7; i++) { const tx = -1.9 + i * .66; paint([[tx - .26, .5 - o - .1], [tx + .26, .5 - o - .1], [tx, .5 - o + .55]], { fill: PAL.cream, sw: 2.2, smooth: false, shade: false }); paint([[tx + .07, .5 + o + .1], [tx + .59, .5 + o + .1], [tx + .33, .5 + o - .5]], { fill: PAL.cream, sw: 2.2, smooth: false, shade: false }); }
  C.restore();
  for (const ex of [-1.1, 1.2]) { paint(ellPts(ex, -1.5, .5, .42, 16), { fill: '#FFF7D8', sw: 2.8, shade: false }); dot(ex + .12, -1.42, .2, '#1A1230'); line([ex - .55, -2.1 + (ex < 0 ? -.15 : .15)], [ex + .55, -2.1 + (ex < 0 ? .15 : -.15)], { w: 6 }); }
  pop();
}
function card(x, y, s, glyph, rot = 0, col = PAL.cpRed) {
  push(x, y, s, 1, rot);
  paint(rrPts(-.6, -.45, 1.2, .9, .1), { fill: PAL.cream, sw: 2.4, shade: false });
  C.save(); C.fillStyle = col; C.font = `700 .62px "Microsoft YaHei","Segoe UI",sans-serif`; C.textAlign = 'center'; C.fillText(glyph, 0, .22); C.restore();
  pop();
}
function bag(x, y, s, T) {
  push(x, y, s, 1, Math.sin(T * 4) * 3);
  for (let i = 0; i < 4; i++) {
    const mx = -1.1 + i * .75, my = -4 - .3 * hash(i) + Math.sin(T * 5 + i) * .15, cw = .55 + hash(i + 3) * .25;
    paint(capsule([[mx, my + .9], [mx, my]], .17, .2), { fill: PAL.cream, sw: 2.4, shade: false });
    const cap = [...arcPts(mx, my, cw, cw * .85, 180, 360, 12), [mx + cw, my + .05], [mx - cw, my + .05]];
    paint(cap, { fill: i % 2 ? '#D9403A' : '#B04FE6', sw: 2.6, smooth: false });
    for (let k = 0; k < 3; k++) dot(mx + (k - 1) * cw * .5, my - cw * (.35 + .2 * (k % 2)), .08, '#FFF5E2');
  }
  paint([[-2, 0], [2, 0], [1.75, -3.9], [-1.75, -3.9]], { fill: '#C99C6B', sw: 3.2, smooth: false, hatch: { ang: 80, gap: .3, op: .12 } });
  paint([[-1.75, -3.9], [1.75, -3.9], [1.72, -3.45], [-1.72, -3.45]], { fill: '#B5875A', sw: 2.4, smooth: false, shade: false });
  C.save(); C.fillStyle = PAL.ink; C.font = `700 .7px ${HAND}`; C.textAlign = 'center'; C.fillText('shrooms', 0, -1.7); C.font = `.32px ${HAND}`; C.fillText('(for research)', 0, -1.2); C.restore();
  pop();
}
function gauge(cx, cy, r, v, T) {
  const cols = ['#4DB57A', '#A6C94A', '#F7C51E', '#FFB16A', '#F7738A', '#F0582E'];
  for (let i = 0; i < 6; i++) { C.save(); C.globalAlpha = .9; C.strokeStyle = cols[i]; C.lineWidth = r * .24; C.beginPath(); C.arc(cx, cy, r, Math.PI + i * Math.PI / 6, Math.PI + (i + 1) * Math.PI / 6); C.stroke(); C.restore(); }
  ink(arcPts(cx, cy, r * 1.12, r * 1.12, 180, 360, 30), { closed: false, raw: true, w: 4 });
  ink(arcPts(cx, cy, r * .88, r * .88, 180, 360, 30), { closed: false, raw: true, w: 3 });
  for (let i = 0; i <= 10; i++) { const a = (180 + i * 18) * D2R; line([cx + Math.cos(a) * r * .72, cy + Math.sin(a) * r * .72], [cx + Math.cos(a) * r * .82, cy + Math.sin(a) * r * .82], { w: 3 }); }
  const a = (182 + v * 176 + Math.sin(T * 40) * v * 1.5) * D2R, tip = [cx + Math.cos(a) * r * .95, cy + Math.sin(a) * r * .95];
  paint([[cx + Math.cos(a + 1.57) * 14, cy + Math.sin(a + 1.57) * 14], tip, [cx + Math.cos(a - 1.57) * 14, cy + Math.sin(a - 1.57) * 14]], { fill: PAL.ink, sw: 2, smooth: false, shade: false });
  paint(ellPts(cx, cy, 30, 30, 16), { fill: PAL.cpPurple, sw: 3, shade: false });
  letters(`${Math.round(mix(2, 99, v))}%`, cx, cy + 80, 64, { align: 'center', fill: v > .7 ? PAL.cpRed : PAL.ink });
}
