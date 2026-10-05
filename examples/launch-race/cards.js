// cards.js - three taped "paper print" vignettes drawn in boiling ink over the chart (screen space).
// Fig. 1 R-7 + Sputnik 1 (cold open), Fig. 2 Apollo 11 Eagle, Fig. 3 the first Falcon 9 booster landing.
// Uses engine.js globals (CTX, COL, HAND, MONO, prog, eio, eout, rnd, lerp, clamp, revealText, ink, wobLine, strokePoly, W, H, T).
'use strict';
const CR = 'rgb(233,217,166)', GD = 'rgb(217,164,65)', RU = 'rgb(196,98,45)', NV = '#1b2137', NV2 = '#283152', INK2 = '#14182a';
const crA = a => `rgba(233,217,166,${a})`;
const jit = (F, s, a) => rnd(-a, a, Math.floor(F / 4) * 7919 + s * 131);
function shape(P, F, seed, o = {}) {
  const { fill = null, stroke = CR, lw = 2.4, close = true, a = 1.2, dash = null } = o, k = CTX;
  k.save(); k.beginPath();
  P.forEach((p, i) => { const x = p[0] + jit(F, seed + i * 2, a), y = p[1] + jit(F, seed + i * 2 + 1, a); i ? k.lineTo(x, y) : k.moveTo(x, y); });
  if (close) k.closePath();
  if (fill) { k.fillStyle = fill; k.fill(); }
  if (stroke) { k.strokeStyle = stroke; k.lineWidth = lw; k.lineJoin = 'round'; k.lineCap = 'round'; if (dash) k.setLineDash(dash); k.stroke(); }
  k.restore();
}
const ellP = (x, y, rx, ry, n = 28) => Array.from({ length: n }, (_, i) => [x + Math.cos(i / n * 6.2832) * rx, y + Math.sin(i / n * 6.2832) * ry]);
const circ = (x, y, r, F, seed, o) => shape(ellP(x, y, r, r, Math.max(14, Math.min(64, Math.round(r / 2)))), F, seed, o);
const seg = (x1, y1, x2, y2, F, seed, col = CR, lw = 2) => shape([[x1, y1], [x2, y2]], F, seed, { stroke: col, lw, close: false });
function stars(F, pw, ph, n, seed) {
  const k = CTX;
  for (let i = 0; i < n; i++) {
    const x = rnd(0, pw, seed + i * 3), y = rnd(0, ph, seed + i * 3 + 1), r = rnd(.7, 2.3, seed + i * 3 + 2);
    k.fillStyle = crA(.35 + .4 * (.5 + .5 * Math.sin(F * .09 + i * 1.7))); k.beginPath(); k.arc(x, y, r, 0, 7); k.fill();
  }
}
// hand-written caption inside a print, underlined in rust once written
function cardText(txt, F, w, x, y, size = 38, col = CR) {
  if (F < w[0]) return; const k = CTX, font = `${size}px ${HAND}`; k.font = font; const wd = k.measureText(txt).width;
  revealText(txt, font, x, y, wd, prog(F, w[0], w[1]), col);
  const p = eout(prog(F, w[1], w[1] + 10)); if (p > 0) strokePoly(wobLine(x, y + 14, x + wd * p + .1, y + 14, 3, 1.4), 1, RU, 3);
}
function monoNote(txt, F, a, x, y, col = crA(.75)) { const p = prog(F, a, a + 12); if (p <= 0) return; const k = CTX; k.save(); k.globalAlpha = p; ink(`16px ${MONO}`, col); k.textAlign = 'left'; k.fillText(txt, x, y + 6 * (1 - eout(p))); k.restore(); }
function flame(F, x, y, s) {
  if (s <= 0) return; const L = (80 + 25 * Math.sin(F * 1.9) + 15 * Math.sin(F * 3.1 + 1)) * s, w = 24 * Math.min(1.3, .6 + s * .4);
  [[RU, 1], [GD, .72], [CR, .42]].forEach(([c, m], i) => shape([[x - w * m, y], [x - w * m * .85, y + L * m * .35], [x, y + L * m], [x + w * m * .85, y + L * m * .35], [x + w * m, y]], F, 900 + i * 13, { fill: c, stroke: null, a: 2.5 }));
}
function puffs(F, x, y, t0, n, spread, seed, life = 150) {
  const k = CTX;
  for (let i = 0; i < n; i++) {
    const age = F - (t0 + i * 2); if (age < 0) continue; const dir = i % 2 ? 1 : -1, sp = rnd(2.4, 5.5, seed + i);
    const px = x + dir * (10 + Math.min(age, 90) * sp * spread), py = y - rnd(0, 26, seed + 40 + i) - age * rnd(.15, .5, seed + 80 + i), r = Math.min(26 + age * 1.5, 120);
    const al = .5 * (1 - clamp(age / life)); if (al <= 0) continue;
    circ(px, py, r, F, seed + i * 7, { fill: crA(al), stroke: crA(al * .8), lw: 1.4, a: 2.4 });
  }
}

// a taped print: slides in from below, peels away up-left; content drawn in print-local coords by fn(F, pw, ph)
function withCard(F, s, fn) {
  const ai = eout(prog(F, s.in[0], s.in[1])), ao = eio(prog(F, s.out[0], s.out[1]));
  if (ai <= 0 || ao >= 1) return; const k = CTX, vis = ai * (1 - ao), m = 16, mb = 44, w = s.w, h = s.h, pw = w - 2 * m, ph = h - m - mb;
  k.save(); k.fillStyle = `rgba(42,30,18,${.22 * vis})`; k.fillRect(0, 0, W, H); k.restore();
  k.save(); k.translate(s.cx - ao * 160, s.cy + (1 - ai) * 1000 - ao * 1150); k.rotate(s.rot + (1 - ai) * .08 - ao * .16);
  k.fillStyle = 'rgba(40,25,10,.28)'; k.fillRect(-w / 2 + 12, -h / 2 + 16, w, h);
  k.fillStyle = '#fbf5e6'; k.fillRect(-w / 2, -h / 2, w, h); k.strokeStyle = 'rgba(42,36,32,.35)'; k.lineWidth = 1.2; k.strokeRect(-w / 2, -h / 2, w, h);
  k.save(); k.beginPath(); k.rect(-w / 2 + m, -h / 2 + m, pw, ph); k.clip(); k.translate(-w / 2 + m, -h / 2 + m);
  k.fillStyle = s.bg || NV; k.fillRect(0, 0, pw, ph);
  const z = 1 + .035 * prog(F, s.in[0], s.out[1]); k.translate(pw / 2, ph / 2); k.scale(z, z); k.translate(-pw / 2, -ph / 2);
  fn(F, pw, ph);
  k.restore();
  ink(`15px ${MONO}`, COL.muted); k.textAlign = 'left'; k.fillText(s.fig, -w / 2 + m, h / 2 - 16);
  ink(`15px ${MONO}`, COL.red); k.textAlign = 'right'; k.fillText('GCAT \u00b7 SPACE RACE', w / 2 - m, h / 2 - 16); k.textAlign = 'left';
  [[-w / 2 + 46, -h / 2 + 2, -.55], [w / 2 - 46, -h / 2 + 2, .55]].forEach(([x, y, r]) => { k.save(); k.translate(x, y); k.rotate(r); k.fillStyle = 'rgba(232,220,180,.8)'; k.fillRect(-58, -15, 116, 30); k.strokeStyle = 'rgba(120,100,60,.22)'; k.lineWidth = 1; k.strokeRect(-58, -15, 116, 30); k.restore(); });
  k.restore();
}

// ================= Fig. 1 - Baikonur, 4 Oct 1957: R-7 lifts Sputnik 1 (0-292, peels off 268-292)
const OPEN = { in: [-30, 0], out: [268, 292], cx: 960, cy: 462, w: 1840, h: 900, rot: -.004, fig: 'FIG. 1 \u00b7 R-7 \u00b7 SPUTNIK 1' };
function r7(F, x, y, lift, tilt) {
  const k = CTX; k.save(); k.translate(x, y); k.rotate(tilt);
  [-1, 1].forEach((d, j) => { // strap-on boosters (conical tops, flared skirts)
    shape([[d * 14, -190], [d * 40, -46], [d * 50, 0], [d * 18, 0]], F, 300 + j * 40, { fill: NV2, stroke: CR, lw: 2.2 });
    seg(d * 22, -120, d * 40, -40, F, 330 + j * 9, crA(.5), 1.4);
  });
  shape([[-17, 0], [-17, -360], [-12, -395], [-6, -430], [6, -430], [12, -395], [17, -360], [17, 0]], F, 360, { fill: NV2, stroke: CR, lw: 2.4 });
  [-300, -212, -110].forEach((yy, j) => seg(-17, yy, 17, yy, F, 380 + j * 5, crA(.6), 1.6));
  shape([[-6, -430], [0, -452], [6, -430]], F, 395, { fill: GD, stroke: CR, lw: 1.8 });
  ink(`bold 15px ${MONO}`, crA(.85)); k.save(); k.translate(5, -170); k.rotate(-Math.PI / 2); k.textAlign = 'center'; k.fillText('\u0421\u0421\u0421\u0420', 0, 0); k.restore();
  const ig = prog(F, T.ignite, T.ignite + 10) * (1 + .15 * Math.sin(F * 2.3));
  [-34, 0, 34].forEach((ox, j) => flame(F + j * 3, ox, 2, ig * (j === 1 ? 1.25 : 1) * (1 + .5 * lift)));
  k.restore();
}
function drawOpenGround(F, pw, ph, oy) {
  const k = CTX, gy = 690 + oy, rx = 904;
  k.save(); k.translate(0, oy);
  stars(F, pw, 640, 120, 11);
  shape([[0, 690], [pw, 690], [pw, ph + 40], [0, ph + 40]], F, 210, { fill: INK2, stroke: CR, lw: 2.2, a: 1.6 });
  for (let i = 0; i < 9; i++) seg(rnd(0, pw, 230 + i), rnd(712, 820, 240 + i), rnd(0, pw, 230 + i) + rnd(40, 160, 250 + i), rnd(712, 820, 240 + i), F, 260 + i, crA(.35), 1.3);
  // service tower: lattice that stays behind
  shape([[700, 690], [700, 320], [744, 320], [744, 690]], F, 270, { stroke: CR, lw: 2 });
  for (let yy = 690; yy > 330; yy -= 46) { seg(700, yy, 744, yy - 46, F, 280 + yy, crA(.55), 1.3); seg(744, yy, 700, yy - 46, F, 281 + yy, crA(.4), 1.1); }
  seg(744, 360, 800, 360, F, 299, CR, 2);
  const lt = .5 + .5 * Math.sin(F * .21); k.fillStyle = `rgba(196,98,45,${.4 + .5 * lt})`; k.beginPath(); k.arc(722, 312, 6, 0, 7); k.fill();
  k.restore();
  // launch: rocket rises with t^2, support arms swing open on lift
  const tl = Math.max(0, F - T.lift), up = .26 * tl * tl, lift = clamp(tl / 30);
  const open = eout(prog(F, T.lift - 4, T.lift + 16)) * .75;
  [-1, 1].forEach((d, j) => { const bx = rx + d * 72; k.save(); k.translate(bx, gy); k.rotate(d * open); shape([[0, 0], [-d * 24, -210], [-d * 16, -214], [d * 8, 0]], F, 310 + j * 17, { fill: INK2, stroke: CR, lw: 2 }); k.restore(); });
  puffs(F, rx, gy - 8, T.ignite + 2, 28, 1, 600, 180);
  if (F < T.ignite) for (let i = 0; i < 4; i++) { const ph2 = ((F + i * 22) % 88) / 88; circ(rx + 26 + ph2 * 60, gy - 300 - ph2 * 50, 8 + ph2 * 26, F, 640 + i * 9, { fill: crA(.22 * (1 - ph2)), stroke: crA(.3 * (1 - ph2)), lw: 1.2, a: 2 }); }
  r7(F, rx, gy - up, lift, jit(F, 5, .004) * lift);
  cardText('Baikonur \u00b7 4 October 1957', F, [20, 60], 70, 110 + oy, 46);
  monoNote('R-7 \u00b7 SITE 1 \u00b7 22:28 MOSCOW TIME', F, 52, 72, 152 + oy);
  if (F >= T.ignite) monoNote('IGNITION', F, T.ignite, rx + 150, gy - 230, 'rgba(217,164,65,.95)');
}
function drawOpenOrbit(F, pw, ph, oy) {
  const k = CTX, ex = 904, ey = 1858 + oy, R = 1050, OR = 1450;
  k.save(); k.translate(0, oy);
  stars(F, pw, ph, 170, 77);
  k.restore();
  for (let i = 0; i < 4; i++) circ(ex, ey, R + 14 + i * 9, F, 700 + i * 5, { stroke: `rgba(120,160,220,${.28 - i * .06})`, lw: 6 - i, a: 1.6 });
  circ(ex, ey, R, F, 720, { fill: '#22315a', stroke: CR, lw: 2.6, a: 1.4 });
  for (let i = 0; i < 6; i++) { const a0 = -1.95 + i * .14; shape(Array.from({ length: 6 }, (_, j) => [ex + Math.cos(a0 + j * .02 + rnd(0, .02, 730 + i * 9 + j)) * (R - 22 - j * 18), ey + Math.sin(a0 + j * .03) * (R - 22 - j * 18)]), F, 740 + i * 13, { stroke: crA(.3), lw: 1.4, close: false }); }
  const A = a => [ex + Math.cos(a) * OR, ey + Math.sin(a) * OR], a0 = -110 * Math.PI / 180, a1 = -70 * Math.PI / 180;
  const orbit = Array.from({ length: 49 }, (_, i) => A(lerp(a0 - .08, a1 + .08, i / 48)));
  strokePoly(orbit, eio(prog(F, 200, 250)), crA(.55), 2, [8, 10]);
  const sp = lerp(a0, a1, prog(F, 172, 300, t => t)), [sx, sy] = A(sp);
  // radio beeps: rings expand from the satellite on each beep
  [...T.beeps, T.dot].forEach((b, j) => { const p = prog(F, b, b + 34); if (p <= 0 || p >= 1) return; for (let r = 0; r < 3; r++) { const q = clamp(p * 1.25 - r * .14); if (q <= 0) continue; circ(sx, sy, 24 + q * 150, F, 760 + j * 11 + r, { stroke: `rgba(217,164,65,${.85 * (1 - q)})`, lw: 2.6 - r * .5, a: 1.2 }); } });
  k.save(); k.translate(sx, sy); k.rotate(sp + Math.PI / 2 + .2 * Math.sin(F * .05));
  for (let j = 0; j < 4; j++) { const an = Math.PI * .72 + (j - 1.5) * .17; seg(0, 0, Math.cos(an) * 92, Math.sin(an) * 92, F, 790 + j, CR, 1.8); }
  circ(0, 0, 19, F, 800, { fill: '#c9c6bd', stroke: CR, lw: 2.2, a: .8 });
  k.fillStyle = 'rgba(255,255,255,.55)'; k.beginPath(); k.arc(-6, -6, 6, 0, 7); k.fill();
  k.restore();
  cardText('Sputnik 1 \u00b7 beep \u2026 beep \u2026', F, [205, 240], 70, 110 + oy, 46);
  monoNote('83.6 KG \u00b7 ONE ORBIT EVERY 96 MIN', F, 236, 72, 152 + oy);
  monoNote('20.005 MHZ', F, 196, sx + 34, sy - 40, 'rgba(217,164,65,.9)');
}
function drawOpening(F) {
  if (F >= OPEN.out[1]) return;
  withCard(F, OPEN, (F, pw, ph) => {
    const t = eio(prog(F, T.whip, T.whip + 16)), D = ph * 1.25;
    if (t < 1) drawOpenGround(F, pw, ph, t * D);
    if (t > 0) drawOpenOrbit(F, pw, ph, (t - 1) * D);
    const s = Math.sin(Math.PI * t); if (s > .02) for (let i = 0; i < 40; i++) { const x = rnd(0, pw, 880 + i), y = rnd(-200, ph, 920 + i) + (F % 7) * 30; seg(x, y, x, y + 140 + rnd(0, 180, 960 + i), F, 990 + i, crA(.5 * s), 1.6); }
  });
}

// ================= Fig. 2 - Apollo 11, Eagle touches down (715-900)
const MOON = { in: [715, 737], out: [878, 900], cx: 960, cy: 470, w: 1280, h: 720, rot: -.026, fig: 'FIG. 2 \u00b7 APOLLO 11 \u00b7 LUNAR MODULE' };
function lm(F, x, y, burn, legs = 1) {
  const k = CTX; k.save(); k.translate(x, y);
  [-1, 1].forEach((d, j) => { // legs + footpads
    seg(d * 40, -52, d * (40 + 44 * legs), 0, F, 1100 + j, CR, 2.4); seg(d * 30, -26, d * (40 + 44 * legs), -2, F, 1104 + j, crA(.7), 1.6);
    shape(ellP(d * (40 + 44 * legs), 2, 14, 4, 12), F, 1110 + j * 9, { fill: GD, stroke: CR, lw: 1.6 });
  });
  shape([[-50, -40], [-40, -78], [40, -78], [50, -40], [40, -20], [-40, -20]], F, 1130, { fill: GD, stroke: CR, lw: 2.2 }); // descent stage foil
  for (let i = 0; i < 5; i++) seg(-36 + i * 18, -74, -40 + i * 18 + rnd(-4, 4, 1140 + i), -24, F, 1145 + i, 'rgba(120,80,30,.55)', 1.2);
  shape([[-34, -78], [-38, -116], [-18, -140], [22, -140], [38, -112], [34, -78]], F, 1160, { fill: '#d9d4c4', stroke: CR, lw: 2.2 }); // ascent stage
  shape([[-16, -122], [-4, -128], [-2, -112], [-14, -108]], F, 1170, { fill: NV, stroke: CR, lw: 1.4 });
  seg(18, -140, 34, -170, F, 1175, CR, 1.6); circ(36, -174, 7, F, 1176, { stroke: CR, lw: 1.6 });
  seg(-38, -100, -56, -100, F, 1178, CR, 1.6); shape([[-56, -106], [-62, -100], [-56, -94]], F, 1179, { fill: CR, stroke: null });
  if (burn > 0) flame(F, 0, -18, burn * .45);
  k.restore();
}
function drawMoon(F) {
  if (F < MOON.in[0] || F >= MOON.out[1]) return;
  withCard(F, MOON, (F, pw, ph) => {
    const k = CTX, gy = 520, td = T.moonTouch;
    stars(F, pw, gy, 90, 501);
    circ(1040, 130, 46, F, 1200, { fill: '#2a3a6e', stroke: CR, lw: 2, a: .8 }); // Earth, half lit
    k.save(); k.beginPath(); k.arc(1040, 130, 46, -Math.PI / 2, Math.PI / 2); k.closePath(); k.fillStyle = 'rgba(120,160,220,.75)'; k.fill(); k.restore();
    shape([[0, gy + 6], [180, gy - 8], [420, gy + 4], [700, gy - 10], [960, gy + 2], [pw, gy - 8], [pw, ph + 40], [0, ph + 40]], F, 1210, { fill: '#3a3d4d', stroke: CR, lw: 2.2, a: 1.4 });
    [[150, 590, 70, 14], [420, 640, 110, 20], [980, 600, 90, 16], [1160, 560, 40, 8], [760, 570, 34, 7]].forEach(([x, y, rx, ry], i) => { shape(ellP(x, y, rx, ry, 20), F, 1220 + i * 7, { fill: '#30333f', stroke: crA(.6), lw: 1.6 }); shape(ellP(x, y + ry * .3, rx * .8, ry * .55, 16).slice(0, 9), F, 1260 + i * 5, { stroke: crA(.3), lw: 1.2, close: false }); });
    const p = prog(F, 737, td), lx = lerp(560, 640, eio(p)), ly = lerp(-60, gy, 1 - Math.pow(1 - p, 1.8)) + (F > td ? 4 * Math.exp(-(F - td) / 4) * Math.sin((F - td) * 1.3) : 0);
    if (F >= 805 && F < td + 60) { const dp = prog(F, 805, td + 60); for (let i = 0; i < 16; i++) { const d = i % 2 ? 1 : -1, q = clamp(dp * 1.3 - i * .02); if (q <= 0) continue; const xx = lx + d * (30 + q * rnd(120, 300, 1300 + i)), yy = gy - 6 - q * rnd(4, 30, 1320 + i) * (1 - q); seg(xx, yy, xx + d * 34 * (1 - q), yy, F, 1340 + i, crA(.55 * (1 - q)), 2); } }
    lm(F, lx, ly, F < td ? prog(F, 737, 752) : 0, eout(prog(F, 745, 790)));
    if (F >= 842) { const fp = eout(prog(F, 842, 856)), fx = lx + 170; seg(fx, gy, fx, gy - 120 * fp, F, 1400, CR, 2.6); if (fp > .6) { const fw = 64 * eout(prog(F, 850, 862)); k.save(); k.translate(fx, gy - 120); for (let i = 0; i < 5; i++) shape([[0, i * 8], [fw, i * 8 + .5], [fw, i * 8 + 8], [0, i * 8 + 8]], F, 1410 + i, { fill: i % 2 ? '#e9e1cc' : COL.red, stroke: null, a: .4 }); shape([[0, 0], [fw * .42, 0], [fw * .42, 22], [0, 22]], F, 1420, { fill: '#2b4a8b', stroke: null, a: .4 }); seg(0, 0, fw, 0, F, 1421, CR, 1.6); k.restore(); } }
    if (F >= td + 2) for (let i = 0; i < 3; i++) shape([[lx + 84 + i * 26, gy + 26 + i * 6], [lx + 96 + i * 26, gy + 24 + i * 6], [lx + 98 + i * 26, gy + 32 + i * 6], [lx + 84 + i * 26, gy + 34 + i * 6]], F, 1430 + i, { fill: 'rgba(20,20,30,.5)', stroke: null, a: .5 });
    cardText('Apollo 11 \u00b7 Eagle \u00b7 20 July 1969', F, [832, 852], 60, 92, 42);
    monoNote('SEA OF TRANQUILLITY \u00b7 0.67\u00b0N 23.47\u00b0E', F, 756, 62, 132);
    if (F >= td) monoNote('"THE EAGLE HAS LANDED."', F, td + 4, lx + 70, ly - 196, 'rgba(217,164,65,.95)');
  });
}

// ================= Fig. 3 - LZ-1, 21 Dec 2015: the first orbital booster lands (1262-1470)
const LAND = { in: [1262, 1284], out: [1450, 1470], cx: 960, cy: 470, w: 1280, h: 720, rot: .021, fig: 'FIG. 3 \u00b7 FALCON 9 \u00b7 ORBCOMM-2' };
function booster(F, x, y, tilt, burn, legs) {
  const k = CTX; k.save(); k.translate(x, y); k.rotate(tilt);
  [-1, 1].forEach((d, j) => { const th = lerp(.04, 1.71, legs), hx = d * 15, hy = -8, fx = hx + d * Math.sin(th) * 72, fy = hy - Math.cos(th) * 72; shape([[hx, hy], [fx, fy]], F, 1500 + j, { stroke: '#2a2b33', lw: 6, close: false }); shape([[hx, hy], [fx, fy]], F, 1502 + j, { stroke: CR, lw: 1.4, close: false }); if (legs > .5) seg(d * 15, -60, (hx + fx) / 2, (hy + fy) / 2, F, 1505 + j, crA(.7), 1.4); });
  shape([[-15, 0], [-15, -300], [15, -300], [15, 0]], F, 1520, { fill: '#e9e3d4', stroke: CR, lw: 2.2 });
  shape([[-15, -40], [-15, -120], [15, -150], [15, -40]], F, 1525, { fill: 'rgba(60,50,40,.55)', stroke: null, a: 1.6 }); // soot
  shape([[-15, -300], [-15, -340], [15, -340], [15, -300]], F, 1530, { fill: '#1d1e24', stroke: CR, lw: 2 });
  [-1, 1].forEach((d, j) => { shape([[d * 15, -330], [d * 34, -334], [d * 34, -318], [d * 15, -314]], F, 1540 + j * 4, { fill: '#2a2b33', stroke: CR, lw: 1.4 }); seg(d * 20, -332, d * 28, -316, F, 1550 + j, crA(.6), 1); });
  ink(`bold 13px ${MONO}`, '#2a2420'); k.save(); k.translate(5, -210); k.rotate(-Math.PI / 2); k.textAlign = 'center'; k.fillText('FALCON 9', 0, 0); k.restore();
  if (burn > 0) flame(F, 0, 2, burn);
  k.restore();
}
function drawLanding(F) {
  if (F < LAND.in[0] || F >= LAND.out[1]) return;
  withCard(F, LAND, (F, pw, ph) => {
    const k = CTX, gy = 560, px = 640;
    stars(F, pw, gy, 80, 1601);
    for (let i = 0; i < 26; i++) { const x = 820 + i * 16 + rnd(-5, 5, 1610 + i); k.fillStyle = `rgba(217,164,65,${.35 + .35 * Math.sin(F * .13 + i)})`; k.fillRect(x, gy - 18 - rnd(0, 16, 1640 + i), 3, 3); } // distant Cape lights
    shape([[0, gy], [pw, gy], [pw, ph + 40], [0, ph + 40]], F, 1660, { fill: INK2, stroke: CR, lw: 2.2, a: 1.4 });
    for (let i = 0; i < 5; i++) seg(rnd(0, pw, 1670 + i), gy + 40 + i * 18, rnd(0, pw, 1670 + i) + 140, gy + 40 + i * 18, F, 1680 + i, crA(.25), 1.2);
    shape(ellP(px, gy + 10, 130, 22, 30), F, 1690, { fill: '#2e3346', stroke: CR, lw: 2.2 });
    seg(px - 70, gy + 2, px + 70, gy + 18, F, 1695, crA(.85), 3); seg(px + 70, gy + 2, px - 70, gy + 18, F, 1696, crA(.85), 3);
    for (let i = 0; i < 6; i++) { const on = (Math.floor(F / 8) + i) % 3 === 0, a = i / 6 * 6.283; k.fillStyle = on ? 'rgba(196,98,45,.95)' : 'rgba(196,98,45,.35)'; k.beginPath(); k.arc(px + Math.cos(a) * 150, gy + 10 + Math.sin(a) * 28, 4, 0, 7); k.fill(); }
    const tA = 1290, tB = T.landBurn, tC = T.landTouch;
    let by, bx, tilt;
    if (F < tB) { const p = prog(F, tA, tB); by = lerp(-40, 300, esine(p)); bx = lerp(520, 630, esine(p)); tilt = lerp(.22, .05, p); }
    else { const p = prog(F, tB, tC); by = lerp(300, gy, eout(p)); bx = lerp(630, px, eout(p)); tilt = lerp(.05, 0, eout(p)); }
    if (F > tC) by = gy + 3 * Math.exp(-(F - tC) / 4) * Math.sin((F - tC) * 1.4);
    if (F >= tA - 4) {
      const entry = F >= 1300 && F < 1322 ? Math.sin(Math.PI * prog(F, 1300, 1322)) : 0, land = F >= tB && F < tC + 4 ? eout(prog(F, tB, tB + 5)) * (1 - prog(F, tC, tC + 4)) : 0;
      if (F < tB) for (let i = 0; i < 10; i++) { const tr = F - i * 3; if (tr < tA) break; const q = prog(tr, tA, tB), tx = lerp(520, 630, esine(q)) - 24, ty = lerp(-40, 300, esine(q)) - 330; seg(tx, ty - 40, tx, ty, F, 1700 + i, crA(.25 * (1 - i / 10)), 2); }
      if (F >= tB - 4) puffs(F, px, gy - 4, tB + 18, 22, .9, 1720, 120);
      booster(F, bx, by, tilt, Math.max(entry * 1.2, land * 1.35), eout(prog(F, T.legs, T.legs + 12)));
    }
    if (F >= T.boom) { const p = prog(F, T.boom, T.boom + 34); if (p < 1) for (let r = 0; r < 3; r++) { const q = clamp(p * 1.3 - r * .15); if (q > 0) circ(px, gy - 200, 40 + q * 420, F, 1760 + r, { stroke: `rgba(233,217,166,${.7 * (1 - q)})`, lw: 3 - r * .6, a: 2 }); } monoNote('SONIC BOOM', F, T.boom + 2, px + 150, gy - 250, 'rgba(217,164,65,.95)'); }
    cardText('LZ-1 \u00b7 21 Dec 2015 \u00b7 first orbital booster landing', F, [1403, 1428], 54, 92, 38);
    monoNote('CAPE CANAVERAL \u00b7 LANDING ZONE 1 \u00b7 20:38 EST', F, 1292, 56, 132);
    if (F >= T.landBurn) monoNote('LANDING BURN', F, T.landBurn, bx + 70, Math.min(by, gy) - 150, 'rgba(217,164,65,.95)');
  });
}
function drawCards(F) { drawOpening(F); drawMoon(F); drawLanding(F); }
