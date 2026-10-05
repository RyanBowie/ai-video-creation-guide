// core.js — papery watercolour + boiling-ink Canvas2D engine (no dependencies).
// Every frame is a pure function of time: call boil(T) before drawing so line jitter is deterministic.
'use strict';
const W = 1920, H = 1080;
const PAL = {
  paper: '#F3EBDC', ink: '#2B2233', cream: '#FFF5E2', skin: '#F7D6BF', skinDk: '#E3A98C', blush: '#F28CA0',
  night: '#1F2550', indigo: '#2F3C7A', rose: '#E27A92', ochre: '#E8AA38', sap: '#6E9F58', teal: '#3A9C98', violet: '#7B5CA8', sky: '#8EC3E6',
  // M365 Copilot ribbon colours
  cpSky: '#38C2F8', cpBlue: '#1C8FE3', cpDeep: '#1552D6', cpGreen: '#4DB57A', cpYellow: '#F7C51E',
  cpPeach: '#FFB16A', cpCoral: '#F7738A', cpPink: '#E4569A', cpPurple: '#B04FE6', cpRed: '#F0582E',
  word: '#2B7CD3', excel: '#21A366', ppt: '#E0592A', teams: '#6264A7', steel: '#AEB4C2',
};

// ---------- deterministic randomness ----------
let _s = 1;
function seed(n) { _s = (n * 2654435761) >>> 0 || 1; }
function rnd() { _s ^= _s << 13; _s >>>= 0; _s ^= _s >>> 17; _s ^= _s << 5; _s >>>= 0; return _s / 4294967296; }
const rr = (a, b) => a + (b - a) * rnd();
const jit = a => (rnd() * 2 - 1) * a;
function gauss() { return (rnd() + rnd() + rnd() - 1.5) / 1.5; }
let BOIL = 0;                                     // current boil step
function boil(T, fps = 12) { BOIL = Math.floor(T * fps); seed(1000 + BOIL); }

// ---------- math helpers ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const mix = (a, b, t) => a + (b - a) * t;
const D2R = Math.PI / 180;
const eio = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const eout = t => 1 - Math.pow(1 - t, 3);
const backOut = (t, s = 1.7) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
const elasticOut = t => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * 2 * Math.PI / 3) + 1;
const seg = (t, a, b, e = x => x) => e(clamp((t - a) / (b - a)));

// ---------- geometry (local units) ----------
function ellPts(cx, cy, rx, ry, n = 36, j = 0, a0 = 0) {
  const p = []; for (let i = 0; i < n; i++) { const a = a0 + i / n * Math.PI * 2; p.push([cx + Math.cos(a) * rx + jit(j), cy + Math.sin(a) * ry + jit(j)]); } return p;
}
function arcPts(cx, cy, rx, ry, a0, a1, n = 16) { const p = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * D2R; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
function rrPts(x, y, w, h, r, n = 5) {
  const p = [], cs = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]];
  for (const [cx, cy, a] of cs) for (let i = 0; i <= n; i++) { const t = (a + 90 * i / n) * D2R; p.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]); }
  return p;
}
function starPts(cx, cy, r1, r2, k = 5, rot = -90) { const p = []; for (let i = 0; i < k * 2; i++) { const a = (rot + i * 180 / k) * D2R, r = i % 2 ? r2 : r1; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; }
// Catmull-Rom smoothing so hand-placed control points become soft curves
function smooth(pts, closed = true, seg = 6) {
  const n = pts.length, out = []; if (n < 3) return pts.slice();
  const g = i => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
  const lim = closed ? n : n - 1;
  for (let i = 0; i < lim; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    for (let k = 0; k < seg; k++) {
      const t = k / seg, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(d => .5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
    }
  }
  if (!closed) out.push(pts[n - 1].slice());
  return out;
}
function bez(p0, p1, p2, p3, n = 14) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([0, 1].map(d => u * u * u * p0[d] + 3 * u * u * t * p1[d] + 3 * u * t * t * p2[d] + t * t * t * p3[d])); } return o; }
function limb(a, len, ang) { return [a[0] + Math.sin(ang * D2R) * len, a[1] + Math.cos(ang * D2R) * len]; }
// capsule outline around a 2-3 joint chain (tapered)
// joint chain a-b-c with a filleted (rounded) bend at b; dense so tubes read as one smooth limb
function bend(a, b, c, r = .35, n = 6) {
  const d1 = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, d2 = Math.hypot(c[0] - b[0], c[1] - b[1]) || 1;
  r = Math.min(r, d1 * .45, d2 * .45);
  const p = [b[0] + (a[0] - b[0]) / d1 * r, b[1] + (a[1] - b[1]) / d1 * r], q = [b[0] + (c[0] - b[0]) / d2 * r, b[1] + (c[1] - b[1]) / d2 * r];
  const o = []; for (let i = 0; i < 4; i++) o.push([mix(a[0], p[0], i / 4), mix(a[1], p[1], i / 4)]);
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * p[0] + 2 * u * t * b[0] + t * t * q[0], u * u * p[1] + 2 * u * t * b[1] + t * t * q[1]]); }
  for (let i = 1; i <= 4; i++) o.push([mix(q[0], c[0], i / 4), mix(q[1], c[1], i / 4)]);
  return o;
}
function capsule(chain, w0, w1, caps = true) {
  const L = [], R = [], n = chain.length;
  for (let i = 0; i < n; i++) {
    const a = chain[Math.max(0, i - 1)], b = chain[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const w = mix(w0, w1, i / (n - 1));
    L.push([chain[i][0] - dy * w, chain[i][1] + dx * w]); R.push([chain[i][0] + dy * w, chain[i][1] - dx * w]);
  }
  if (!caps) return [...R, ...L.reverse()];
  const e = chain[n - 1], s = chain[0];
  const ea = Math.atan2(chain[n - 1][1] - chain[n - 2][1], chain[n - 1][0] - chain[n - 2][0]);
  const sa = Math.atan2(chain[0][1] - chain[1][1], chain[0][0] - chain[1][0]);
  const capE = [], capS = [];
  for (let k = 1; k < 6; k++) { const t = ea - Math.PI / 2 + k / 6 * Math.PI; capE.push([e[0] + Math.cos(t) * w1, e[1] + Math.sin(t) * w1]); }
  for (let k = 1; k < 6; k++) { const t = sa - Math.PI / 2 + k / 6 * Math.PI; capS.push([s[0] + Math.cos(t) * w0, s[1] + Math.sin(t) * w0]); }
  return [...R, ...capE, ...L.reverse(), ...capS];
}
function interp(pts, maxd) { // densify a polyline so deformation has vertices to push
  const o = []; for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length]; o.push(a);
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.floor(d / maxd);
    for (let j = 1; j < k; j++) o.push([mix(a[0], b[0], j / k), mix(a[1], b[1], j / k)]);
  } return o;
}

// ---------- canvas + unit scale ----------
let cv, C, U = 1; // U = pixels per local unit (so ink widths stay constant in screen px)
function setup(canvas) { cv = canvas; cv.width = W; cv.height = H; C = cv.getContext('2d'); }
function push(x, y, s, flip = 1, rot = 0) { C.save(); C.translate(x, y); if (rot) C.rotate(rot * D2R); C.scale(s * flip, s); C.__u = (C.__u || []); C.__u.push(s); U = Math.max(1e-3, C.__u.reduce((a, k) => a * k, 1)); }
function pop() { C.restore(); C.__u.pop(); U = Math.max(1e-3, C.__u.reduce((a, s) => a * s, 1)); } // recompute (avoids 0/0 = NaN after zero-scale push)
function path(pts, closed = true) { C.beginPath(); C.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) C.lineTo(pts[i][0], pts[i][1]); if (closed) C.closePath(); }

// ---------- paper + grain ----------
let PAPER, GRAIN;
function makePaper() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  seed(7); g.fillStyle = PAL.paper; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) {
    const x = rr(0, W), y = rr(0, H), r = rr(60, 380), gr = g.createRadialGradient(x, y, 0, x, y, r);
    const dk = rnd() < .6; gr.addColorStop(0, dk ? 'rgba(150,112,70,0.07)' : 'rgba(255,250,240,0.10)'); gr.addColorStop(1, 'rgba(150,112,70,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.lineCap = 'round';
  for (let i = 0; i < 1600; i++) {
    const x = rr(0, W), y = rr(0, H), a = rr(0, Math.PI * 2), l = rr(4, 16);
    g.strokeStyle = `rgba(${rnd() < .5 ? '120,95,70' : '255,255,250'},${rr(.05, .16)})`; g.lineWidth = rr(.4, 1.1);
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 1) * l * .5, y + Math.sin(a + 1) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  PAPER = c;
  const q = document.createElement('canvas'); q.width = W; q.height = H; const k = q.getContext('2d');
  const id = k.createImageData(W, H), d = id.data;
  for (let i = 0; i < W * H; i++) {
    const x = i % W, y = (i / W) | 0, vx = (x - W / 2) / (W / 2), vy = (y - H / 2) / (H / 2), v = 1 - .22 * Math.pow(vx * vx * .8 + vy * vy, 1.3);
    const n = 236 + rnd() * 19; const val = clamp(n * v / 255, 0, 1) * 255;
    d[i * 4] = val; d[i * 4 + 1] = val * .985; d[i * 4 + 2] = val * .955; d[i * 4 + 3] = 255;
  }
  k.putImageData(id, 0, 0); GRAIN = q;
}
function paper(tint) { C.drawImage(PAPER, 0, 0); if (tint) { C.save(); C.globalCompositeOperation = 'multiply'; C.fillStyle = tint; C.fillRect(0, 0, W, H); C.restore(); } }
function grain() { C.save(); C.globalCompositeOperation = 'multiply'; C.drawImage(GRAIN, 0, 0); C.restore(); }

// ---------- watercolour ----------
function deform(pts, depth, v) { // midpoint displacement (Tyler Hobbs style)
  let p = pts; for (let d = 0; d < depth; d++) {
    const o = []; for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length]; o.push(a);
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]), m = gauss() * len * v;
      o.push([(a[0] + b[0]) / 2 + m * rr(-.5, .5), (a[1] + b[1]) / 2 + m * rr(-.5, .5)]);
    } p = o;
  } return p;
}
// layered translucent fill; col may be a CanvasGradient. bleed in local units.
function wc(pts, col, op = .9, bleed = .06, layers = 7) {
  const base = deform(pts, 1, .15);
  C.save(); C.fillStyle = col;
  for (let i = 0; i < layers; i++) {
    const p = deform(base, 2, .45).map(q => [q[0] + jit(bleed), q[1] + jit(bleed)]);
    C.globalAlpha = op / layers * 1.7; path(p); C.fill();
  }
  // edge darkening (pigment pooling at the rim)
  C.globalAlpha = .18 * op; C.strokeStyle = col; C.lineWidth = 2.2 / U; path(base); C.stroke();
  C.restore();
}
// light pool upper-left + dark settle bottom-right inside the shape
function shade(pts, o = {}) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const w = x1 - x0, h = y1 - y0, r = Math.max(w, h);
  C.save(); path(pts); C.clip();
  const lx = x0 + w * (o.lx ?? .3), ly = y0 + h * (o.ly ?? .25);
  let g = C.createRadialGradient(lx, ly, 0, lx, ly, r * .7); g.addColorStop(0, `rgba(255,252,240,${o.light ?? .35})`); g.addColorStop(1, 'rgba(255,252,240,0)');
  C.fillStyle = g; C.fillRect(x0, y0, w, h);
  g = C.createLinearGradient(0, y0 + h * .45, 0, y1); g.addColorStop(0, 'rgba(43,34,51,0)'); g.addColorStop(1, `rgba(43,34,51,${o.dark ?? .22})`);
  C.fillStyle = g; C.fillRect(x0, y0, w, h);
  C.restore();
}
function hatch(pts, ang = 35, gap = .18, op = .25, col = PAL.ink) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  C.save(); path(pts); C.clip(); C.strokeStyle = col; C.globalAlpha = op; C.lineWidth = 1.3 / U; C.lineCap = 'round';
  const r = Math.hypot(x1 - x0, y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, a = ang * D2R;
  C.beginPath();
  for (let d = -r; d < r; d += gap) {
    const ox = cx + Math.cos(a + Math.PI / 2) * d, oy = cy + Math.sin(a + Math.PI / 2) * d;
    C.moveTo(ox - Math.cos(a) * r + jit(gap * .3), oy - Math.sin(a) * r); C.lineTo(ox + Math.cos(a) * r, oy + Math.sin(a) * r + jit(gap * .3));
  }
  C.stroke();
  C.restore();
}

// ---------- ink ----------
// tapered, pressure-varying, slightly wobbly single stroke. w in screen px.
function ink(pts, o = {}) {
  const w = (o.w ?? 3.2) / U, closed = o.closed ?? true, j = (o.j ?? 1.1) / U;
  let p = o.raw ? pts : smooth(pts, closed, o.seg ?? 4);
  if (closed) p = [...p, p[0], p[1]];
  const n = p.length; if (n < 2) return;
  const ph = rnd() * 10, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const t = i / (n - 1), taper = closed ? .85 + .15 * Math.sin(t * 9 + ph) : Math.pow(Math.sin(Math.PI * clamp(t * .92 + .04)), .55);
    const press = (o.press ? o.press(t) : 1) * (1 + .22 * Math.sin(t * 23 + ph * 3));
    const ww = w * taper * press * .5, off = jit(j) * .5;
    const x = p[i][0] - dy * off, y = p[i][1] + dx * off;
    L.push([x - dy * ww, y + dx * ww]); R.push([x + dy * ww, y - dx * ww]);
  }
  C.save(); C.fillStyle = o.col || PAL.ink; C.globalAlpha = o.op ?? 1;
  path([...L, ...R.reverse()]); C.fill();
  C.restore();
}
function line(a, b, o = {}) { ink([a, [mix(a[0], b[0], .5) + jit(.02), mix(a[1], b[1], .5) + jit(.02)], b], { closed: false, ...o }); }
function dot(x, y, r, col = PAL.ink) { C.save(); C.fillStyle = col; path(ellPts(x, y, r, r, 14, r * .08)); C.fill(); C.restore(); }

// paint = wash + watercolour fill + shading + ink outline (the house primitive)
function paint(pts, o = {}) {
  const P = o.smooth === false ? pts : smooth(pts, true, o.seg ?? 3);
  if (o.fill) {
    // solid-ish base (so shapes are opaque over what's behind), then pigment layers
    C.save(); C.globalAlpha = o.base ?? .88; C.fillStyle = o.under || o.fill; path(P); C.fill(); C.restore();
    wc(P, o.fill, o.fillOp ?? .55, o.bleed ?? .03 / (U / 60 || 1), o.layers ?? 6);
    if (o.shade !== false) shade(P, o.shadeO || {});
  }
  if (o.hatch) hatch(P, o.hatch.ang, o.hatch.gap, o.hatch.op, o.hatch.col);
  if (o.ink !== false) ink(P, { w: o.sw ?? 3.2, closed: true, raw: true, col: o.inkCol, j: o.j });
}
function lg(x0, y0, x1, y1, stops) { const g = C.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => g.addColorStop(Array.isArray(c) ? c[0] : i / (stops.length - 1), Array.isArray(c) ? c[1] : c)); return g; }
function rg(x, y, r, stops) { const g = C.createRadialGradient(x, y, 0, x, y, r); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; }

// ---------- lettering ----------
const MARKER = '"PMarker", "Ink Free", Impact, sans-serif', HAND = '"Shantell", "Segoe Print", "Ink Free", sans-serif';
function letters(txt, x, y, size, o = {}) {
  C.save(); C.font = `${o.weight || ''} ${size}px ${o.font || MARKER}`; C.textAlign = o.align || 'left'; C.textBaseline = 'alphabetic';
  if (o.rot) { C.translate(x, y); C.rotate(o.rot * D2R); x = 0; y = 0; }
  if (o.shadow !== false) { C.fillStyle = PAL.ink; C.globalAlpha = .9; C.fillText(txt, x + size * .045, y + size * .055); C.globalAlpha = 1; }
  if (o.stroke) { C.lineJoin = 'round'; C.strokeStyle = PAL.ink; C.lineWidth = size * .06; C.strokeText(txt, x, y); }
  C.fillStyle = typeof o.fill === 'function' ? o.fill(C, x, y, size) : (o.fill || PAL.ink); C.fillText(txt, x, y);
  C.restore();
}
