// anime.js - 80s/90s cel-anime character rig for "Copilot Quest".
// head80() and its helpers are ported from lemomo-ai/lemo-opuscar styles/cel-anime-80s/demo/head80.js (MIT licence),
// with Sofia-specific changes: optional ponytail/headset, swappable hair, bun, ear + hoop earring, happy eyes, own top.
// Exported on window.A.
(() => {
'use strict';
const { cel, path, poly, ribbon, flutter, line, TAU, rgba, mix, LWK, limb, hex } = window.R;

const LW = 1.5;
const LS = LW * .78, LH = LW * 1.05, LP = LW * 1.25;

const EXPR = {
  neutral: { open: 1, lid: 0, brow: [0, 0, 2], mouth: 'closed' },
  determined: { open: .95, lid: .34, brow: [6, -3, 1], mouth: 'set', look: [.3, 0] },
  panting: { open: .55, lid: .5, brow: [-6, 5, 1.5], mouth: 'pant', look: [0, .25], sweat: true, blush: .45, shoulders: -10 },
  smile: { open: .72, lid: .1, brow: [-3, -1, 3], mouth: 'smile', smileEyes: true },
  smileopen: { open: .74, lid: .08, brow: [-4, -2, 3.5], mouth: 'smileopen', smileEyes: true },
  surprised: { open: 1.12, lid: -.25, brow: [-9, -7, 4.5], mouth: 'oh', iris: .78 },
  talk: { open: 1, lid: .1, brow: [0, 0, 2], mouth: 'talk' },
  closed: { open: 0, lid: 0, brow: [0, 0, 2], mouth: 'closed' },
};

function eye(g, P, cx, cy, w, h, dir, fs, E, detail) {
  const open = Math.max(0, E.open ?? 1), lid = E.lid || 0, W2 = w / 2, lash = P.lash || P.hair.l;
  const X = u => cx + dir * u * W2;
  if (E.happy) { const t = h * .2, ay = cy + h * .12; cel(g, [[X(-1), ay, 1], [X(0), ay - h * .42], [X(1.05), ay - h * .02, 1], [X(1.12), ay - h * .02 + t * .6, 1], [X(0), ay - h * .42 + t], [X(-.98), ay + t * .6, 1]], { f: lash }); return; }
  const inY = cy + h * .1, outY = cy - h * .08 - (E.smileEyes ? h * .06 : 0);
  const topY = cy - h * .5 * open + lid * h * .32;
  const botY = cy + h * .47 * Math.min(1, open + .25) - (E.smileEyes ? h * .3 : 0);
  if (open > .08) {
    const WP = path([[X(-1), inY, 1], [X(-.4), topY + h * .05], [X(.3), topY], [X(1), outY, 1], [X(.45), botY], [X(-.4), botY - h * .02]], true);
    g.save(); g.clip(WP);
    g.fillStyle = P.white_eye; g.fill(WP);
    g.fillStyle = mix(P.white_eye, P.skin.s, .55); g.fillRect(cx - w, topY - 6, w * 2, h * .22 + 6);
    const sc = E.iris || 1, iw = w * .25 * sc * (fs < 1 ? .92 : 1), ih = h * .46 * sc;
    const ix = cx + dir * W2 * .04 + (E.look?.[0] || 0) * w * .15, iy = cy + h * .08 + (E.look?.[1] || 0) * h * .14;
    const IR = new Path2D(); IR.ellipse(ix, iy, iw, ih, 0, 0, TAU);
    g.fillStyle = P.eye.f; g.fill(IR);
    g.save(); g.clip(IR);
    g.fillStyle = P.eye.s; g.fillRect(ix - iw, iy - ih, iw * 2, ih * .95);
    g.fillStyle = mix(P.eye.s, lash, .5); g.fillRect(ix - iw, iy - ih, iw * 2, ih * .38);
    g.fillStyle = mix(P.eye.l, lash, .3); g.beginPath(); g.ellipse(ix, iy - ih * .02, iw * .46, ih * .52, 0, 0, TAU); g.fill();
    g.fillStyle = P.eye.h; g.beginPath(); g.ellipse(ix, iy + ih * .9, iw * 1.05, ih * .52, 0, 0, TAU); g.fill();
    g.fillStyle = mix(P.eye.h, '#ffffff', .45); g.beginPath(); g.ellipse(ix, iy + ih * 1.05, iw * .7, ih * .32, 0, 0, TAU); g.fill();
    if (E.reflect) { g.strokeStyle = rgba(E.reflect, .85); g.lineWidth = iw * .18; g.beginPath(); g.arc(ix, iy, ih * .72, .3, 1.3); g.stroke(); }
    g.restore();
    g.strokeStyle = mix(P.eye.l, lash, .5); g.lineWidth = LW * .75 * LWK.k; g.stroke(IR);
    g.fillStyle = '#ffffff';
    g.beginPath(); g.ellipse(ix - dir * iw * .34, iy - ih * .34, iw * .42, ih * .27, -.5 * dir, 0, TAU); g.fill();
    g.beginPath(); g.arc(ix + dir * iw * .42, iy + ih * .34, iw * .2, 0, TAU); g.fill();
    g.restore();
    line(g, [[X(.95), outY + h * .12], [X(.5), botY + 1], [X(.05), botY + 1.5]], mix(P.skin.l, P.skin.f, .35), LS * .8);
  }
  const t = h * .19;
  if (open > .08) {
    cel(g, [[X(-1.03), inY + 1, 1], [X(-.4), topY + h * .05 - t * .6], [X(.3), topY - t * .75], [X(.95), outY - t], [X(1.25), outY - t * 2.1, 1],
      [X(1.03), outY + t * .5], [X(.3), topY + t * .45], [X(-.4), topY + h * .05 + t * .35], [X(-.98), inY + t * .6, 1]], { f: lash });
    for (let k = 0; k < 3; k++) {
      const u = .55 + k * .2, bx = X(u), by = topY + (outY - topY) * ((u - .3) / .7) - t * .5;
      cel(g, [[bx - dir * 2, by, 1], [bx + dir * (4 + k * 3), by - h * (.16 + k * .05), 1], [bx + dir * 3, by + 1, 1]], { f: lash });
    }
    line(g, [[X(-.25), topY - h * .22], [X(.45), topY - h * .25], [X(1), outY - h * .3]], mix(P.skin.l, P.skin.f, .3), LS * .85);
  } else {
    cel(g, [[X(-1), inY, 1], [X(0), cy + h * .22], [X(1.05), outY + h * .04], [X(1.22), outY - t, 1], [X(1), outY + t * .8], [X(0), cy + h * .22 + t * .8], [X(-.98), inY + t * .5, 1]], { f: lash });
  }
}
function eyeSide(g, P, cx, cy, w, h, E) {
  const open = Math.max(0, E.open ?? 1), lid = E.lid || 0, lash = P.lash || P.hair.l;
  const topY = cy - h * .5 * open + lid * h * .32, front = cx + w * .5, back = cx - w * .5;
  const botY = cy + h * .46 - (E.smileEyes ? h * .26 : 0);
  if (open > .08) {
    const WP = path([[back, cy - h * .12, 1], [cx - w * .1, topY], [front, cy + h * .06, 1], [cx, botY]], true);
    g.save(); g.clip(WP); g.fillStyle = P.white_eye; g.fill(WP);
    const ix = cx + w * .2, iy = cy + h * .1, iw = w * .24, ih = h * .46;
    g.fillStyle = P.eye.f; g.beginPath(); g.ellipse(ix, iy, iw, ih, 0, 0, TAU); g.fill();
    g.fillStyle = P.eye.s; g.fillRect(ix - iw, iy - ih, iw * 2, ih * .95);
    g.fillStyle = mix(P.eye.s, lash, .5); g.fillRect(ix - iw, iy - ih, iw * 2, ih * .38);
    g.fillStyle = P.eye.h; g.beginPath(); g.ellipse(ix, iy + ih * .9, iw, ih * .5, 0, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ix - iw * .15, iy - ih * .32, iw * .45, ih * .24, 0, 0, TAU); g.fill();
    g.restore();
    const t = h * .17;
    cel(g, [[back - w * .35, cy - h * .3 - t, 1], [cx - w * .1, topY - t * .6], [front + w * .04, cy + h * .02, 1], [cx - w * .1, topY + t * .5], [back, cy - h * .06, 1]], { f: lash });
    cel(g, [[back - w * .1, cy - h * .2, 1], [back - w * .5, cy - h * .45, 1], [back - w * .05, cy - h * .12, 1]], { f: lash });
    line(g, [[cx - w * .15, botY], [front - w * .1, cy + h * .26]], mix(P.skin.l, P.skin.f, .3), LS * .8);
    line(g, [[back + w * .05, topY - h * .12], [cx + w * .2, topY - h * .2]], mix(P.skin.l, P.skin.f, .3), LS * .8);
  } else cel(g, [[back - w * .3, cy - h * .12, 1], [cx, cy + h * .2], [front, cy + h * .08, 1], [cx, cy + h * .28], [back, cy + h * .02, 1]], { f: lash });
}
function brow(g, P, ix, iy, ox, oy, B) {
  const a = [ix, iy + B[0]], c = [ox, oy + B[1]], m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2 - B[2]];
  const col = P.lash || P.hair.l;
  cel(g, [[a[0], a[1] - 1.4, 1], [m[0], m[1] - 1.6], [c[0], c[1] - .2, 1], [m[0], m[1] + 1.2], [a[0], a[1] + 1.4, 1]], { f: col });
}

function mouth(g, P, cx, cy, w, type, fs = 1) {
  const L = cx - w / 2, R = cx + w / 2 * fs;
  const lc = P.skin.l, lip = rgba(P.mouth, .22);
  const lowerLip = (y, ww) => { line(g, [[cx - ww * .6, y], [cx + ww * .5, y]], mix(lc, P.skin.f, .5), LS * .75); };
  if (type === 'closed' || type === 'set') {
    const dn = type === 'set' ? 1.6 : 0;
    line(g, [[L, cy + dn], [cx - w * .12, cy - .6], [cx + w * .06, cy + .2], [R, cy + dn]], lc, LS * 1.05);
    lowerLip(cy + 5.5, w * .2);
  } else if (type === 'smile') {
    line(g, [[L - 1, cy - 3], [cx - w * .15, cy + 1.6], [cx + w * .1, cy + 1.6], [R + 1, cy - 3]], lc, LS * 1.05);
    lowerLip(cy + 6.5, w * .16);
  } else {
    let pts, teeth = 0, tongue = 0, bot;
    if (type === 'smileopen') { pts = [[L - 1, cy - 3, 1], [cx, cy - 2], [R + 1, cy - 3, 1], [cx + w * .2, cy + 6], [cx, cy + 10], [cx - w * .22, cy + 6]]; teeth = 1; tongue = 1; bot = cy + 10; }
    else if (type === 'pant') { pts = [[L + 1, cy + 1, 1], [cx, cy - 2], [R - 1, cy + 1, 1], [cx + w * .2, cy + 14], [cx, cy + 17], [cx - w * .22, cy + 14]]; teeth = 1; tongue = 1; bot = cy + 17; }
    else if (type === 'oh') { pts = [[cx - w * .24, cy + 3], [cx, cy - 4], [cx + w * .22, cy + 3], [cx + w * .16, cy + 14], [cx - w * .16, cy + 14]]; bot = cy + 14; }
    else { pts = [[L + 3, cy, 1], [cx, cy - 1], [R - 3, cy, 1], [cx + w * .08, cy + 7], [cx - w * .1, cy + 7]]; tongue = .8; bot = cy + 7; }   // talk
    const MP = path(pts, true);
    g.save(); g.clip(MP); g.fillStyle = '#5a1a2a'; g.fill(MP);
    if (tongue) { g.fillStyle = '#e0707a'; g.beginPath(); g.ellipse(cx, bot + 1, w * .28, 6, 0, 0, TAU); g.fill(); }
    if (teeth) { g.fillStyle = '#ffffff'; g.fillRect(cx - w, cy - 8, w * 2, 10.5); }
    g.restore();
    g.strokeStyle = lc; g.lineWidth = LS * 1.05 * LWK.k; g.lineJoin = 'round'; g.stroke(MP);
    lowerLip(bot + 4.5, w * .14);
  }
}

function lock(x0, y0, x1, y1, tx, ty, bend = 0) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = tx - mx, dy = ty - my, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  return [[x0, y0], [x0 + dx * .55 + nx * bend, y0 + dy * .55 + ny * bend], [tx, ty, 1], [x1 + dx * .5 + nx * bend * .7, y1 + dy * .5 + ny * bend * .7], [x1, y1]];
}
function halo(g, P, cx, cy, rx, ry, a0, a1, th, teeth, tilt = 0) {
  const up = [], dn = [];
  for (let i = 0; i <= teeth * 2; i++) {
    const u = i / (teeth * 2), a = a0 + (a1 - a0) * u;
    const env = Math.sin(u * Math.PI) * .7 + .3;
    up.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry + Math.sin(a) * tilt]);
    const depth = th * env * (i % 2 ? 1.9 : .55);
    dn.push([cx + Math.cos(a) * (rx - depth * .15), cy + Math.sin(a) * ry + depth + Math.sin(a) * tilt]);
  }
  g.fillStyle = mix(P.hair.h, '#ffffff', .3);
  g.beginPath(); up.forEach((p, i) => g[i ? 'lineTo' : 'moveTo'](p[0], p[1])); for (let i = dn.length - 1; i >= 0; i--) g.lineTo(dn[i][0], dn[i][1]); g.closePath(); g.fill();
}

const VIEWS = {
  front: {
    face: [[-66, -40], [-67, 4], [-64, 36], [-57, 64], [-44, 88], [-24, 105], [0, 114], [24, 105], [44, 88], [57, 64], [64, 36], [67, 4], [66, -40], [36, -64], [-36, -64]],
    neck: [[-27, 76], [27, 76], [30, 138], [-30, 138]],
    chinShadow: [[-40, 74], [40, 74], [40, 92], [24, 105], [0, 115], [-24, 105], [-40, 92]],
    farShade: [[90, 26], [90, 120], [26, 108], [44, 92], [54, 70], [60, 46], [64, 26]],
    eyes: [{ x: -38, y: 22, w: 40, h: 36, dir: -1, fs: 1 }, { x: 38, y: 22, w: 40, h: 36, dir: 1, fs: 1 }],
    brows: [[-16, -6, -56, -4], [16, -6, 56, -4]],
    nose: P => g => { g.fillStyle = P.skin.s; g.beginPath(); g.moveTo(3, 40); g.lineTo(7, 53); g.lineTo(1, 55); g.closePath(); g.fill(); line(g, [[-3, 55], [3, 55.5]], P.skin.l, LS); },
    mouth: { x: 0, y: 74, w: 24, fs: 1 },
    blush: [[-42, 48, 13, 4.5], [42, 48, 13, 4.5]],
    cup: [-72, 26],
  },
  q: {
    face: [[-64, -44], [-67, -4], [-66, 30], [-60, 60], [-46, 86], [-24, 104], [4, 114], [24, 108], [38, 94], [46, 78], [48, 64], [53, 46], [55, 30], [50, 16], [53, 0], [54, -40], [18, -64], [-36, -64]],
    neck: [[-36, 66], [12, 90], [16, 138], [-40, 138]],
    chinShadow: [[-46, 64], [20, 64], [20, 96], [4, 115], [-24, 104], [-46, 86]],
    farShade: [[90, 30], [90, 120], [18, 112], [34, 98], [41, 82], [44, 68], [47, 54], [51, 42], [55, 30]],
    eyes: [{ x: -21, y: 22, w: 44, h: 38, dir: -1, fs: 1 }, { x: 35, y: 20, w: 26, h: 35, dir: 1, fs: .6 }],
    brows: [[0, -4, -42, -2], [24, -6, 48, -1]],
    nose: P => g => { g.fillStyle = P.skin.s; g.beginPath(); g.moveTo(42, 42); g.lineTo(45, 51); g.lineTo(39, 55); g.lineTo(39, 49); g.closePath(); g.fill(); line(g, [[38, 55.5], [44, 53]], P.skin.l, LS); },
    mouth: { x: 24, y: 75, w: 22, fs: .7 },
    blush: [[-30, 48, 14, 4.5], [44, 46, 6, 3.5]],
    cup: [-60, 26],
  },
  side: {
    face: [[60, -50], [72, -24], [75, -2], [70, 14], [75, 30], [83, 47, 1], [77, 52], [78, 59], [80, 64], [75, 69], [78, 74], [72, 84], [76, 98, 1], [62, 111], [30, 106], [4, 90], [-8, 60], [-10, 20], [18, -52]],
    neck: [[-12, 60], [16, 100], [12, 126], [-36, 126]],
    chinShadow: [[-20, 58], [50, 58], [62, 111], [30, 106], [4, 90]],
    farShade: [[-40, -60], [8, -60], [2, 0], [-4, 40], [0, 70], [-40, 90]],
    eyes: [{ x: 58, y: 22, w: 26, h: 36, side: true }],
    brows: [[52, -4, 72, -3]],
    nose: P => g => { line(g, [[72, 49], [76, 50]], P.skin.l, LS); },
    mouth: null,
    blush: [[58, 50, 9, 3.5]],
    cup: [-4, 26],
  },
};

const HAIR = {
  front: {
    back: [[-80, -20], [-84, 30], [-74, 70], [-40, 84], [40, 84], [74, 70], [84, 30], [80, -20], [0, -60]],
    cap: [[-84, 8], [-90, -40], [-68, -84], [-26, -102], [26, -102], [68, -84], [90, -40], [84, 8], [66, -26], [0, -54], [-66, -26]],
    locks: [[-52, -82, -20, -90, -38, -10, 0], [20, -90, 52, -82, 40, -8, 0], [-90, -52, -52, -72, -76, 6, -5], [-70, -74, -26, -86, -52, -2, -3], [-44, -86, -2, -92, -24, -12, 3], [-16, -92, 20, -90, 0, 14, 0], [4, -90, 44, -86, 22, -14, -3], [28, -82, 70, -70, 50, -2, 3], [52, -70, 90, -52, 78, 6, 5]],
    strays: [[-6, -90, -16, 6, 6], [30, -84, 36, 0, -5]],
    side: [[-76, -40, -58, -54, -70, 104, -8], [76, -40, 58, -54, 70, 104, 8]],
    halo: [0, -8, 74, 58, Math.PI * 1.1, Math.PI * 1.9, 8, 9],
    goggles: [[-22, -96, 20], [22, -96, 20]],
  },
  q: {
    back: [[-78, -30], [-92, 20], [-86, 70], [-56, 88], [-18, 80], [36, 62], [56, 20], [56, -20], [-10, -60]],
    cap: [[-88, 4], [-94, -44], [-70, -88], [-24, -104], [24, -100], [58, -78], [66, -46], [60, -8], [46, -30], [0, -54], [-58, -34]],
    locks: [[-56, -86, -24, -94, -40, -8, 0], [0, -96, 28, -90, 18, -10, 0], [-96, -50, -60, -72, -84, 10, -6], [-76, -76, -34, -88, -58, -4, -4], [-50, -88, -6, -94, -28, -14, 2], [-20, -94, 18, -94, 8, 12, 2], [4, -94, 42, -86, 26, -12, 4], [26, -86, 62, -70, 46, -2, 5], [46, -72, 70, -52, 60, 4, 5]],
    strays: [[-20, -92, -34, 4, 5], [20, -92, 30, -2, -4]],
    side: [[-78, -44, -58, -58, -76, 106, -10], [56, -40, 62, -30, 58, 72, 8]],
    halo: [-12, -10, 72, 58, Math.PI * 1.12, Math.PI * 1.85, 8, 8],
    goggles: [[-12, -100, 20], [30, -96, 13]],
  },
  side: {
    back: [[-20, -60], [-60, -40], [-62, 10], [-46, 36], [-16, 42], [-12, 20], [0, -40]],
    cap: [[-64, 18], [-74, -30], [-58, -78], [-18, -100], [30, -96], [64, -74], [76, -46], [64, -40], [30, -58], [-4, -40], [-12, 0], [-38, 28]],
    locks: [[10, -96, 40, -88, 60, -4, 4], [30, -90, 58, -76, 78, 0, 6], [42, -80, 76, -60, 86, -6, 8], [52, -66, 80, -46, 82, 6, 6]],
    strays: [[40, -86, 70, 10, 6]],
    side: [[2, -60, 22, -50, 16, 64, 10]],
    halo: [0, -10, 66, 58, Math.PI * 1.1, Math.PI * 1.82, 8, 8],
    goggles: [[56, -84, 12]],
  },
};

function head80(g, P, o = {}) {
  const view = o.view || 'q', V = VIEWS[view], Hh = (o.hair || HAIR)[view];
  const E = { ...EXPR[o.expr || 'neutral'], ...(o.E || {}) };
  if (o.reflect) E.reflect = o.reflect;
  if (o.look) E.look = o.look;
  if (o.open != null) E.open = o.open;
  if (o.mouth) E.mouth = o.mouth;
  if (o.lid != null) E.lid = o.lid;
  const ph = o.ph || 0, wind = o.wind ?? .4;
  const lx = o.light?.[0] ?? -1, ly = o.light?.[1] ?? -.8;
  // o.rim is a colour string: a thin back-light sliver on the shadow side (same direction as SO)
  const rim = o.rim ? { c: o.rim, d: [lx * 4, ly * 3] } : null;
  const hairSt = { f: P.hair.f, s: P.hair.s, h: P.hair.h, l: P.hair.l, lw: LH, rim };
  const SO = k => [lx * k, ly * k];
  if (o.ponytail === true) {
    const px = view === 'front' ? 0 : view === 'q' ? -54 : -50, py = view === 'front' ? -40 : -80;
    for (let k = 0; k < 4; k++) {
      let ang;
      if (view === 'front') ang = Math.PI / 2 + (k < 2 ? 1 : -1) * (.28 + (k % 2) * .16) - Math.sin(ph * TAU + k) * .05 * wind;
      else ang = (Math.PI + .25 - k * .12) * wind + (Math.PI / 2 + .45 - k * .1) * (1 - wind);
      const len = view === 'front' ? 200 - (k % 2) * 30 : 300 - k * 40;
      const sp = flutter(px + (view === 'front' ? (k < 2 ? -44 : 44) : (k - 1.5) * 6), py + k * 5, ang, len, 14, (10 + k * 5) * wind + 3, 1, ph * TAU + k * 1.9, (view === 'front' ? 0 : -(10 + k * 20)) * wind);
      cel(g, ribbon(sp, u => Math.pow(1 - u, .85) * (view === 'front' ? 46 : 60 - k * 8) + 1), { ...hairSt, f: k === 2 || k === 1 ? P.hair.s : P.hair.f, so: SO(8) });
    }
  }
  if (o.bun) bun(g, P, view, hairSt, SO);
  cel(g, Hh.back, { ...hairSt, f: P.hair.s, so: SO(10), s: mix(P.hair.s, '#000000', .25) });
  if (o.body !== false) (o.bodyFn || sofiaTop)(g, P, view, E, o);
  if (o.neck !== false) {
    // fill + chin shadow only; outline just the two side edges so no line crosses the bare skin where the neck meets the chest
    const NK = V.neck.map(([x, y]) => [x, Math.min(y, o.neckEnd ?? 999)]);
    cel(g, poly(NK), { f: P.skin.f, s: P.skin.s, sh: [V.chinShadow] });
    const edge = (a, b) => [a, [a[0] + (b[0] - a[0]) * .88, a[1] + (b[1] - a[1]) * .88]];
    line(g, edge(NK[0], NK[3]), P.skin.l, LS); line(g, edge(NK[1], NK[2]), P.skin.l, LS);
  }
  if (o.scarf) scarf(g, P, view, E);
  cel(g, V.face, { f: P.skin.f, s: P.skin.s, l: P.skin.l, lw: LS, h: P.skin.h, sh: o.light ? [] : [V.farShade], so: o.light ? SO(12) : null,
    rim: o.skinRim ? { c: o.skinRim, d: [-lx * 2.5, -ly * 2] } : o.rim ? { c: o.rim, d: [lx * 2.5, ly * 2] } : null,
    clipFn: gg => {
      gg.fillStyle = mix(P.skin.f, P.skin.s, .7);
      for (const L of Hh.locks) { const [x0, y0, x1, y1, tx, ty, b] = L; gg.fill(path(lock(x0 - 4, y0 + 8, x1 + 6, y1 + 8, tx + 3, ty + 9, b))); }
      gg.fillRect(-120, -120, 240, view === 'side' ? 58 : 62);
    } });
  for (const [x, y, rx, ry] of V.blush) { g.fillStyle = rgba(P.blush, (o.blush ?? E.blush ?? .2)); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); }
  V.nose(P)(g);
  if (V.mouth) mouth(g, P, V.mouth.x, V.mouth.y, V.mouth.w, E.mouth, V.mouth.fs);
  else sideMouth(g, P, E.mouth);
  for (const ey of V.eyes) { if (ey.side) eyeSide(g, P, ey.x, ey.y, ey.w, ey.h, E); else eye(g, P, ey.x, ey.y, ey.w, ey.h, ey.dir, ey.fs, E, o.detail); }
  cel(g, Hh.cap, { ...hairSt, so: SO(10) });
  if (view !== 'front' && o.ponytail === true) { const px = view === 'q' ? -54 : -50; cel(g, [[px - 14, -92], [px + 6, -96], [px + 12, -72], [px - 8, -66]], { f: P.magenta.f, s: P.magenta.s, so: SO(3), l: P.magenta.l, lw: LS }); }
  if (o.headset === true) { const [cx, cy] = V.cup; line(g, [[cx + 2, cy - 12], [cx + 8, -64], [cx + 34, -100]], P.phone.f, 5); }
  for (const L of Hh.side) { const [x0, y0, x1, y1, tx, ty, b] = L; const sw = Math.sin(ph * TAU) * 4 * wind; cel(g, lock(x0, y0, x1, y1, tx - 10 * wind + sw, ty, b), { ...hairSt, so: SO(7) }); }
  if (o.hoop !== false) hoop(g, P, view, SO);
  const lf = Math.sin(ph * TAU) * 2 * wind;
  g.save(); g.fillStyle = P.hair.s; for (const L of Hh.locks) { const [x0, y0, x1, y1, tx, ty, b] = L; g.fill(path(lock(x0 - 10, y0, x1 + 10, y1, tx, ty + 3 + lf, b))); } g.restore();
  const lockSt = { ...hairSt, l: mix(P.hair.l, P.hair.s, .45), lw: LH * .6 };
  for (const L of Hh.locks) { const [x0, y0, x1, y1, tx, ty, b] = L; cel(g, lock(x0, y0, x1, y1, tx, ty + lf, b), { ...lockSt, so: SO(6) }); }
  for (const [x0, y0, tx, ty, b] of Hh.strays) cel(g, lock(x0 - 2, y0, x0 + 2, y0, tx, ty + lf, b), { f: P.hair.f, l: mix(P.hair.l, P.hair.s, .3), lw: LH * .6 });
  const hz = Hh.halo;
  g.save(); const HC = new Path2D(); HC.addPath(path(Hh.cap)); for (const L of Hh.locks) { const [x0, y0, x1, y1, tx, ty, b] = L; HC.addPath(path(lock(x0, y0, x1, y1, tx, ty + lf, b))); }
  g.clip(HC); halo(g, P, hz[0], hz[1], hz[2], hz[3], hz[4], hz[5], hz[6], hz[7]);
  g.restore();
  for (const b of V.brows) brow(g, P, b[0], b[1], b[2], b[3], E.brow || [0, 0, 2]);
  if (E.sweat) { const sx = view === 'side' ? 40 : view === 'q' ? -58 : -62; cel(g, [[sx, -16, 1], [sx + 7, 0], [sx, 6], [sx - 7, 0]], { f: '#e8f8ff', l: '#4a6a98', lw: LS, h: '#ffffff', hi: [[[sx - 3, -2], [sx - 1, -6], [sx - 4, 2]]] }); }
  for (const [x, y, rw] of Hh.goggles) {
    const L = new Path2D(); L.ellipse(x, y, rw, rw * .66, 0, 0, TAU);
    cel(g, L, { f: P.lens.f, s: P.lens.s, sh: [[[x - rw, y], [x + rw, y - 4], [x + rw, y + rw], [x - rw, y + rw]]], l: '#141420', lw: LP, h: P.lens.h, hi: [[[x - rw * .6, y - rw * .35], [x - rw * .1, y - rw * .5], [x - rw * .4, y]]] });
    g.strokeStyle = P.chrome.s; g.lineWidth = 2.6 * LWK.k; g.beginPath(); g.ellipse(x, y, rw + 2.5, rw * .66 + 2.5, 0, 0, TAU); g.stroke();
  }
  if (Hh.goggles.length === 2) { const [a, b] = Hh.goggles; cel(g, poly([[a[0] + a[2], a[1] - 4], [b[0] - b[2], b[1] - 4], [b[0] - b[2], b[1] + 4], [a[0] + a[2], a[1] + 4]]), { f: P.strap.f, l: '#141420', lw: LW }); }
  if (o.headset === true) {
    const [cx, cy] = V.cup;
    const cup = new Path2D(); cup.ellipse(cx, cy, 14, 20, 0, 0, TAU);
    cel(g, cup, { f: P.phone.f, s: P.phone.s, so: SO(3), h: P.phone.h, ho: [-lx * 2, -ly * 2], l: '#08080c', lw: LP });
    const mx = view === 'side' ? 70 : view === 'q' ? 8 : -10, my = view === 'side' ? 80 : 86;
    line(g, [[cx + 6, cy + 14], [(cx + mx) / 2, my + 2], [mx, my]], P.phone.f, 3);
    const mic = new Path2D(); mic.ellipse(mx, my, 6, 4.5, 0, 0, TAU); cel(g, mic, { f: P.phone.h, l: '#08080c', lw: LW * .8 });
    g.fillStyle = '#ff9a3c'; g.beginPath(); g.arc(cx, cy, 3, 0, TAU); g.fill();
  }
}
function sideMouth(g, P, type) {
  const lc = P.skin.l;
  if (type === 'closed' || type === 'set') { line(g, [[69, 69], [77, 69]], lc, LS * 1.05); }
  else if (type === 'smile') line(g, [[67, 66], [71, 70], [77, 69]], lc, LS * 1.05);
  else { const MP = path([[69, 67, 1], [78, 66], [76, type === 'pant' ? 79 : 75], [70, 74]], true); g.fillStyle = '#5a1a2a'; g.fill(MP); g.strokeStyle = lc; g.lineWidth = LS * LWK.k; g.stroke(MP); }
}
function body(g, P, view, E) {
  const dx = view === 'front' ? 0 : view === 'q' ? -14 : -34, dy = E.shoulders || 0;
  cel(g, [[-190 + dx, 330], [-182 + dx, 206 + dy], [-140 + dx, 158 + dy], [-60 + dx, 138 + dy * .5], [50 + dx, 138 + dy * .5], [124 + dx, 156 + dy], [166 + dx, 204 + dy], [176 + dx, 330]], { f: P.jacket.f, s: P.jacket.s, so: [-30, -10], h: P.jacket.h, ho: [8, 6], l: P.jacket.l, lw: LW * 1.1,
    clipFn: gg => { gg.fillStyle = P.stripe.f; gg.fill(poly([[-172 + dx, 214 + dy], [-156 + dx, 190 + dy], [-138 + dx, 330], [-160 + dx, 330]])); gg.fill(poly([[150 + dx, 190 + dy], [166 + dx, 214 + dy], [158 + dx, 330], [136 + dx, 330]])); } });
  cel(g, [[-64 + dx, 146 + dy * .5], [-40 + dx, 120 + dy * .5], [40 + dx, 120 + dy * .5], [62 + dx, 146 + dy * .5], [40 + dx, 160], [-40 + dx, 160]], { f: P.jacket.f, s: P.jacket.s, so: [-8, -8], l: P.jacket.l, lw: LW });
  line(g, [[2 + dx, 158], [6 + dx, 330]], P.jacket.l, LW);
}
function scarf(g, P, view, E) {
  const dx = view === 'front' ? 0 : view === 'q' ? -14 : -34, dy = (E.shoulders || 0) * .5;
  cel(g, [[-44 + dx, 126 + dy], [-20 + dx, 121 + dy], [30 + dx, 123 + dy], [50 + dx, 127 + dy], [51 + dx, 134 + dy], [26 + dx, 137 + dy], [-20 + dx, 135 + dy], [-45 + dx, 133 + dy]], { f: P.scarf.f, s: P.scarf.s, so: [-4, -8], h: P.scarf.h, ho: [0, 3], l: P.scarf.l, lw: LW,
    sh: [[[-4 + dx, 120 + dy], [4 + dx, 137 + dy], [-4 + dx, 138 + dy], [-12 + dx, 120 + dy]], [[30 + dx, 122 + dy], [36 + dx, 137 + dy], [30 + dx, 138 + dy], [24 + dx, 122 + dy]]] });
  cel(g, [[12 + dx, 133 + dy], [32 + dx, 135 + dy], [38 + dx, 196], [26 + dx, 210], [16 + dx, 190]], { f: P.scarf.f, s: P.scarf.s, so: [-5, -4], l: P.scarf.l, lw: LW });
  line(g, [[18 + dx, 152 + dy], [24 + dx, 192]], P.scarf.l, LW * .6);
}

/* ── Sofia ──────────────────────────────────────────────────────────────
   The head / eye / hair construction above is adapted from
   lemomo-ai/lemo-opuscar (styles/cel-anime-80s, MIT licence). Sofia's
   palette, bun, earrings, top and the full-body poses below are original. */
const C4 = (f, s, h, l) => ({ f, s, h, l });
const SOFIA = {
  hair: C4('#3a2620', '#24160f', '#7a5040', '#1a0e0a'),
  skin: C4('#e8b48f', '#c08060', '#f6d2b6', '#6a3a28'),
  eye: C4('#7a5030', '#40281a', '#d8a070', '#2a180c'),
  top: C4('#1f2a4a', '#151d36', '#2e3d66', '#0b1022'),
  trousers: C4('#2b2f3a', '#1c1f28', '#3c4252', '#0c0e14'),
  shoe: C4('#2a2024', '#18121a', '#4a3a40', '#0a0608'),
  swim: C4('#f2617a', '#c23c5a', '#ff9fb0', '#5c1630'),
  phone: C4('#2a2a34', '#16161d', '#5c5c70', '#08080c'),
  strap: C4('#5a4c66', '#3a3044', '#7a6c86', '#16101c'),
  lens: C4('#86e6ff', '#3a9fd0', '#ffffff', '#1d3a58'),
  chrome: C4('#dfe7f3', '#646f90', '#ffffff', '#2b3350'),
  magenta: C4('#ff4fa8', '#b8327a', '#ff9fd0', '#5c1238'),
  jacket: C4('#2f6fe2', '#1d45a2', '#86b6ff', '#112459'),
  stripe: C4('#f4f6fb', '#b7c0d9', '#ffffff', '#44506e'),
  scarf: C4('#ff6b6b', '#cf3d5b', '#ffb6a2', '#761b34'),
  gold: C4('#e2b24e', '#9a6c28', '#fff0b0', '#4d3210'),
  dark: C4('#2b2d40', '#181a26', '#50546e', '#08090f'),
  white: C4('#f3f6fc', '#a9b3cd', '#ffffff', '#39456a'),
  mouth: '#c0505a', blush: '#ff9a9a', lash: '#1c0f26', white_eye: '#fbf8ff', sole: '#4a3a40', strapY: '#ffe08a'
};
const SOFIA_HAIR = JSON.parse(JSON.stringify(HAIR));
for (const v in SOFIA_HAIR) SOFIA_HAIR[v].goggles = [];
SOFIA_HAIR.q.side = [[-80, -40, -66, -52, -84, 36, -6], [56, -40, 62, -30, 58, 56, 8]];
SOFIA_HAIR.q.back = [[-78, -30], [-90, 10], [-84, 44], [-62, 60], [-30, 56], [36, 40], [56, 20], [56, -20], [-10, -60]];
if (SOFIA_HAIR.front) {
  SOFIA_HAIR.front.side = [[-76, -40, -58, -54, -66, 62, -6], [76, -40, 58, -54, 66, 62, 6]];
  SOFIA_HAIR.front.back = [[-80, -20], [-84, 20], [-74, 50], [-40, 60], [40, 60], [74, 50], [84, 20], [80, -20], [0, -60]];
}

const ellP = (cx, cy, rx, ry, n = 14, rot = 0) => {
  const c = Math.cos(rot), s = Math.sin(rot), out = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    out.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return out;
};
const xf = (ox, oy, a, s = 1) => {
  const c = Math.cos(a) * s, n = Math.sin(a) * s;
  return p => [ox + p[0] * c - p[1] * n, oy + p[0] * n + p[1] * c, p[2]];
};
const angOf = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
const arcS = (g, x, y, r, a0, a1, col, lw) => {
  g.beginPath(); g.arc(x, y, r, a0, a1); g.strokeStyle = col; g.lineWidth = lw * LWK.k; g.lineCap = 'round'; g.stroke();
};

function bun(g, P, view, hairSt, SO) {
  const [bx, by] = view === 'front' ? [0, -122] : view === 'side' ? [-34, -112] : [-16, -120];
  const rot = view === 'side' ? -.35 : -.08, T = xf(bx, by, rot);
  cel(g, ellP(0, 0, 33, 25, 18).map(T), { ...hairSt, so: SO(8) });
  line(g, [[-24, -4], [-8, -16], [14, -15], [26, -6]].map(T), P.hair.s, LS);
  line(g, [[-20, 8], [0, 0], [20, 4]].map(T), P.hair.s, LS * .9);
  cel(g, ellP(-6, -13, 10, 4, 10, -.15).map(T), { f: P.hair.h });
  cel(g, [[-28, 5], [-10, 10], [10, 10], [28, 4], [26, 12], [8, 18], [-10, 18], [-26, 13]].map(T),
    { f: P.scarf.f, s: P.scarf.s, so: [-2, -3], l: P.scarf.l, lw: LS });
  line(g, [[22, -16], [34, -28], [30, -40]].map(T), P.hair.l, LS * .9);
  line(g, [[-26, -12], [-38, -22], [-36, -32]].map(T), P.hair.l, LS * .9);
}

function hoop(g, P, view, SO) {
  const ears = view === 'front' ? [[-70, 30, -1], [70, 30, 1]] : view === 'side' ? [[-4, 26, 1]] : [[-60, 30, -1]];
  for (const [ex, ey, d] of ears) {
    cel(g, ellP(ex, ey, 9, 14, 12), { f: P.skin.f, s: P.skin.s, so: SO(3), l: P.skin.l, lw: LS });
    line(g, [[ex + d * 3, ey - 8], [ex - d * 2, ey - 2], [ex + d * 1, ey + 6]], P.skin.s, LS * .9);
    const hx = ex - d, hy = ey + 21, r = 8.5;
    arcS(g, hx, hy, r, 0, TAU, P.gold.l, 3.6);
    arcS(g, hx, hy, r, 0, TAU, P.gold.f, 2.2);
    arcS(g, hx, hy, r, Math.PI * 1.05, Math.PI * 1.45, P.gold.h, 1.2);
  }
}

function sofiaTop(g, P, view, E, o) {
  const dx = view === 'front' ? 0 : view === 'side' ? -34 : -14, X = v => v + dx;
  const dy = E.shoulders || 0, bot = o.topBot ?? 330;
  const [nl, nr] = view === 'front' ? [-76, 76] : view === 'side' ? [-58, 40] : [-82, 58];
  const [sl, sr] = view === 'front' ? [-182, 182] : view === 'side' ? [-124, 118] : [-178, 160];
  const mid = (nl + nr) / 2;
  const lx = o.light?.[0] ?? -1, ly = o.light?.[1] ?? -.8, SO = k => [lx * k, ly * k];
  const shoulders = [[X(nr * .55 + 12), 140 + dy * .5], [X(nr + 36), 166 + dy], [X(sr - 26), 188 + dy], [X(sr - 5), 226 + dy], [X(sr), bot, 1],
    [X(sl), bot, 1], [X(sl + 6), 232 + dy], [X(sl + 26), 194 + dy], [X(sl + 60), 172 + dy], [X(nl * .55 - 12), 140 + dy * .5]];
  if (o.swim) {
    cel(g, [[X(-22), 108, 1], [X(26), 108, 1], [X(30), 124, 1], ...shoulders, [X(-26), 124, 1]],
      { f: P.skin.f, s: P.skin.s, h: P.skin.h, so: SO(10), ho: [6, 4], l: P.skin.l, lw: LW * 1.1, clipFn: G => {
        cel(G, [[X(sl - 30), bot + 30, 1], [X(sl - 30), 224, 1], [X(mid - 56), 206], [X(mid - 8), 214, 1], [X(mid + 44), 204], [X(sr + 30), 220, 1], [X(sr + 30), bot + 30, 1]],
          { f: P.swim.f, s: P.swim.s, h: P.swim.h, so: [-6, -5], ho: [4, 3], l: P.swim.l, lw: LS });
        line(G, [[X(mid - 40), 210], [X(nl + 2), 176], [X(nl + 8), 150]], P.strapY, 3);
        line(G, [[X(mid + 30), 206], [X(nr - 2), 174], [X(nr + 6), 150]], P.strapY, 3);
      } });
    return;
  }
  cel(g, [[X(-22), 108, 1], [X(26), 108, 1], [X(30), 124, 1], [X(nr * .55 + 12), 140 + dy * .5], [X(nr + 3), 164 + dy, 1], [X(nr + 8), 200, 1],
    [X(nl - 8), 200, 1], [X(nl - 3), 164 + dy, 1], [X(nl * .55 - 12), 140 + dy * .5], [X(-26), 124, 1]],
    { f: P.skin.f, s: P.skin.s, h: P.skin.h, so: SO(6), l: P.skin.l, lw: LS });
  line(g, [[X(-28), 150], [X(-44), 154], [X(-60), 156]], P.skin.s, LS);
  line(g, [[X(18), 148], [X(30), 151], [X(40), 152]], P.skin.s, LS);
  cel(g, [[X(sl), bot, 1], [X(sl + 6), 232 + dy], [X(sl + 26), 194 + dy], [X(sl + 60), 172 + dy], [X(nl), 160 + dy, 1], [X(nl + 14), 178],
    [X(mid - 26), 194], [X(mid + 10), 197], [X(nr - 16), 184], [X(nr), 160 + dy, 1], [X(nr + 36), 166 + dy], [X(sr - 26), 188 + dy],
    [X(sr - 5), 226 + dy], [X(sr), bot, 1]],
    { f: P.top.f, s: P.top.s, h: P.top.h, so: SO(10), ho: [6, 4], l: P.top.l, lw: LW * 1.1 });
  line(g, [[X(sl + 44), 236 + dy], [X(sl + 52), 284], [X(sl + 54), bot]], P.top.l, LS);
  line(g, [[X(sr - 40), 234 + dy], [X(sr - 46), 284], [X(sr - 48), bot]], P.top.l, LS);
  line(g, [[X(nl + 18), 186], [X(mid - 24), 202], [X(mid + 12), 205], [X(nr - 14), 192]], P.top.h, LS * .8);
  const chain = [[X(-34), 134], [X(-22), 160], [X(-4), 178], [X(14), 160], [X(28), 134]];
  line(g, chain, P.gold.s, 1.6); line(g, chain, P.gold.f, .9);
  cel(g, [[X(-4), 176, 1], [X(2), 183, 1], [X(-4), 191, 1], [X(-10), 183, 1]], { f: P.gold.f, s: P.gold.s, so: [-1.5, -1.5], l: P.gold.l, lw: .9 });
}

/* Lighting variants: whole-palette tints per scene light. */
const LIGHTS = {
  night: { lit: [.78, .74, 1.0], shade: [.58, .52, .92], line: [.8, .7, 1.1] },
  dawn: { lit: [1.04, .9, .84], shade: [.86, .66, .8], line: [1, .8, .85] },
  sil: { lit: [.2, .16, .32], shade: [.14, .1, .24], line: [.3, .2, .5] },
  backlit: { lit: [.42, .3, .55], shade: [.24, .16, .36], line: [.4, .25, .5] },
};
const tintC = (c, m) => {
  const [r, gr, b] = hex(c), cl = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return '#' + cl(r * m[0]) + cl(gr * m[1]) + cl(b * m[2]);
};
const RLC = new WeakMap();
function relight(P, name) {
  const L = LIGHTS[name]; if (!L) return P;
  let c = RLC.get(P); if (!c) RLC.set(P, c = {});
  if (c[name]) return c[name];
  const out = {};
  for (const k in P) {
    const v = P[k];
    out[k] = typeof v === 'string' ? tintC(v, L.lit) : { f: tintC(v.f, L.lit), s: tintC(v.s, L.shade), h: tintC(v.h, L.lit), l: tintC(v.l, L.line) };
  }
  if (name === 'night') { out.skin = { ...out.skin, f: '#e9c9c4', s: '#9b82b4', h: '#fff2f2' }; out.blush = '#e0869a'; }
  return (c[name] = out);
}
const DIMC = new WeakMap();
function dimP(P, m = .8) {
  let d = DIMC.get(P); if (d) return d;
  d = {};
  for (const k in P) {
    const v = P[k];
    d[k] = typeof v === 'string' ? tintC(v, [m, m, m * 1.05]) : { f: tintC(v.f, [m, m, m * 1.05]), s: tintC(v.s, [m, m, m * 1.05]), h: tintC(v.h, [m, m, m]), l: v.l };
  }
  DIMC.set(P, d); return d;
}

/* Lip-flap from the voice timing file; null = keep the expression's mouth. */
function mouthAt(clip, t) {
  const V = (window.VT || {})[clip]; if (!V || t < 0 || t > V.dur) return null;
  const W = V.words;
  for (let i = 0; i < W.length; i++) {
    const s = W[i][0], nx = i + 1 < W.length ? W[i + 1][0] : V.dur, e = Math.min(nx, s + .12 + .06 * W[i][1].length);
    if (t >= s && t < e) return ['talk', 'oh', 'smileopen'][Math.floor((t - s) / .09) % 3];
  }
  return null;
}
const blinkAt = (t, seed = 0) => (((t + seed) % 3.1 + 3.1) % 3.1 < .1 ? 0 : null);

function bust(G, x, y, k, o = {}) {
  const pk = LWK.k; G.save();
  try {
    G.translate(x, y); G.scale(o.flip ? -k : k, k); LWK.k = o.lwk ?? 1.4;
    head80(G, o.P || SOFIA, { view: 'q', bun: true, hair: SOFIA_HAIR, wind: .15, ...o });
  } finally { LWK.k = pk; G.restore(); }
}

/* Full-body construction. Torso-local frame: hip at origin, up = -y, front = +x. */
const TORSO = [[-14, -276, 1], [18, -276, 1], [26, -258], [42, -238], [62, -204], [58, -176], [46, -150], [40, -104], [46, -50], [54, 4], [40, 30, 1],
  [-50, 24, 1], [-54, -30], [-40, -100], [-46, -180], [-42, -238], [-24, -262]];
const TOP_R = [[-90, -256, 1], [-28, -258, 1], [-4, -252], [20, -240], [48, -230, 1], [100, -230, 1], [100, 80, 1], [-90, 80, 1]];
const SWIM_R = [[-90, -214, 1], [-34, -216, 1], [6, -222], [44, -212, 1], [100, -212, 1], [100, -30, 1], [64, -30, 1], [30, 2], [-4, 40, 1], [-90, 40, 1]];

function torsoSide(g, P, TT, kind) {
  const swim = kind === 'swim', C = swim ? P.swim : P.top;
  cel(g, TORSO.map(TT), { f: P.skin.f, s: P.skin.s, h: P.skin.h, so: [-8, -6], l: swim ? P.skin.l : P.top.l, lw: LW, clipFn: G => {
    cel(G, (swim ? SWIM_R : TOP_R).map(TT), { f: C.f, s: C.s, h: C.h, so: [-8, -6], ho: [4, 3], l: C.l, lw: LS });
    if (swim) {
      line(G, [[40, -212], [26, -246], [12, -276]].map(TT), P.strapY, 3.2);
      line(G, [[-30, -214], [-28, -246], [-22, -276]].map(TT), P.strapY, 3.2);
    } else {
      line(G, [[2, -252], [22, -246], [36, -238]].map(TT), P.skin.s, LS);
      line(G, [[30, -170], [36, -120], [34, -70]].map(TT), C.s, LS);
    }
  } });
}
function handAt(g, P, w, a, o = {}) {
  const T = xf(w[0], w[1], a), st = { f: P.skin.f, s: P.skin.s, so: [-3, -3], l: P.skin.l, lw: LS };
  if (o.grip) {
    cel(g, ellP(9, 0, 14, 12, 12).map(T), st);
    line(g, [[2, -6], [10, -9], [18, -5]].map(T), P.skin.s, LS * .8);
    return;
  }
  cel(g, ellP(12, 0, 17, 10, 14).map(T), st);
  cel(g, ellP(6, -8, 8, 4.5, 10, -.5).map(T), st);
}
function armTo(g, P, S, E, W, o = {}) {
  const C = o.bare ? P.skin : P.top, st = { f: C.f, s: C.s, h: C.h, so: [-4, -6], l: C.l, lw: o.bare ? LS : LW };
  const [w1, w2, w3] = o.w || [40, 32, 24];
  cel(g, limb(E, W, w2, w3), st);
  cel(g, limb(S, E, w1, w2), st);
  if (!o.bare) {
    const a = angOf(E, W), T = xf(W[0], W[1], a);
    line(g, [[-10, -w3 * .5], [-10, w3 * .5]].map(T), C.l, LS);
  }
  if (o.hand !== false) handAt(g, P, W, angOf(E, W), o);
}
function footAt(g, P, A, a, o = {}) {
  const T = xf(A[0], A[1], a);
  if (o.bare) {
    cel(g, [[-16, -12], [8, -12], [34, -6], [54, 2], [58, 10], [50, 14], [-14, 14], [-20, 2]].map(T),
      { f: P.skin.f, s: P.skin.s, so: [-3, -4], l: P.skin.l, lw: LS });
    return;
  }
  cel(g, [[-24, -8, 1], [16, -10], [44, 6], [60, 22], [60, 32, 1], [-24, 32, 1]].map(T),
    { f: P.shoe.f, s: P.shoe.s, h: P.shoe.h, so: [-4, -5], ho: [3, 2], l: P.shoe.l, lw: LW, clipFn: G => {
      G.fillStyle = P.sole; G.fill(path([[-40, 26, 1], [80, 26, 1], [80, 50, 1], [-40, 50, 1]].map(T)));
    } });
}
function legTo(g, P, H, K, A, o = {}) {
  const C = o.bare ? P.skin : P.trousers, st = { f: C.f, s: C.s, h: C.h, so: [-5, -6], l: C.l, lw: o.bare ? LS : LW };
  cel(g, limb(K, A, 50, 36), st);
  cel(g, limb(H, K, 68, 50), st);
  footAt(g, P, A, o.footA ?? 0, o);
}
function headOn(g, P, nk, rot, sc, o = {}) {
  const ne = o.neckEnd ?? 128, off = xf(0, 0, rot, sc)([-12, ne]), pk = LWK.k;
  g.save();
  try {
    g.translate(nk[0] - off[0], nk[1] - off[1]); g.rotate(rot); g.scale(sc, sc);
    LWK.k = pk * (o.hk ?? .8) / sc;
    head80(g, P, { view: 'q', bun: true, hair: SOFIA_HAIR, wind: .15, body: false, neckEnd: ne, ...o });
    o.extra?.(g, P);
  } finally { LWK.k = pk; g.restore(); }
}

function chair(G, P) {
  const D = P.dark, st = { f: D.f, s: D.s, h: D.h, so: [-4, -5], ho: [3, 2], l: D.l, lw: LW };
  cel(G, [[-30, -340, 1], [-12, -340, 1], [4, -232, 1], [-14, -232, 1]], st);
  cel(G, [[-48, -594], [-36, -606, 1], [-2, -606, 1], [6, -592], [6, -344], [-6, -330, 1], [-38, -330, 1], [-48, -344]], st);
  cel(G, [[52, -206, 1], [66, -206, 1], [66, -70, 1], [52, -70, 1]], st);
  for (const [fx, fy] of [[-44, -30], [162, -30], [64, -22]]) {
    cel(G, limb([59, -72], [fx, fy], 14, 10), st);
    cel(G, ellP(fx, -12, 11, 11, 12), { f: '#16161d', s: '#0b0b10', so: [-2, -2], l: D.l, lw: LS });
  }
  cel(G, [[-40, -236, 1], [150, -236], [158, -226], [158, -212], [150, -204, 1], [-34, -204, 1], [-40, -212]], st);
}

/* Sofia seated at a desk, facing right. Floor at y = 0. Desk top ~ -340. */
function seated(G, x, y, k, o = {}) {
  const P = o.P || SOFIA, D = dimP(P), pk = LWK.k;
  G.save();
  try {
    G.translate(x, y); G.scale(o.flip ? -k : k, k); LWK.k = o.lwk ?? 1.8;
    if (o.chair !== false) chair(G, P);
    const hip = [40, -262], TT = xf(hip[0], hip[1], o.lean ?? .06), S = TT([6, -236]), nk = TT([3, -268]);
    const typ = o.typing ? Math.sin((o.t || 0) * 26) * 4 : 0, typ2 = o.typing ? Math.sin((o.t || 0) * 23 + 2) * 4 : 0;
    armTo(G, D, [S[0] - 6, S[1] - 4], [100, -350], [250, -374 + typ2], { w: [36, 30, 22] });
    legTo(G, D, [32, -268], [228, -252], [228, -32]);
    legTo(G, P, hip, [240, -246], [244, -32]);
    torsoSide(G, P, TT, 'top');
    const { P: _p, ...ho } = o;
    headOn(G, P, nk, o.headRot ?? .1, .62, { view: 'q', ...ho });
    armTo(G, P, S, [84, -340], [232, -366 + typ]);
  } finally { LWK.k = pk; G.restore(); }
}

function shades(g) {
  const fr = '#1a1a22';
  cel(g, ellP(-22, -78, 20, 12, 14), { f: '#2a1838', h: '#ff6fb0', hi: [ellP(-30, -82, 6, 3, 8)], l: fr, lw: LP });
  cel(g, ellP(34, -76, 14, 11, 12), { f: '#2a1838', h: '#ff6fb0', hi: [ellP(29, -80, 4, 2.5, 8)], l: fr, lw: LP });
  line(g, [[-2, -80], [8, -84], [20, -80]], fr, LP);
  line(g, [[-42, -80], [-58, -70]], fr, LP);
}
function cocktail(g, x, y) {
  const T = p => [x + p[0], y + p[1], p[2]];
  line(g, [[-4, -60], [-12, -82], [-16, -98]].map(T), '#35e7ff', 2.4);
  const bowl = [[-17, -74, 1], [17, -74, 1], [20, -56], [14, -38], [6, -27], [-6, -27], [-14, -38], [-20, -56]].map(T);
  cel(g, bowl, { f: 'rgba(220,240,255,.35)', l: '#5a4a6a', lw: LS, clipFn: G => {
    cel(G, [[-30, -64, 1], [30, -64, 1], [30, -20, 1], [-30, -20, 1]].map(T), { f: '#ff9a3c', sh: [[[-30, -48], [30, -48], [30, -20], [-30, -20]].map(T)], s: '#ff4f8a' });
    cel(G, ellP(-10, -50, 3, 9, 8).map(T), { f: 'rgba(255,255,255,.7)' });
  } });
  line(g, [[0, -27], [0, 12]].map(T), '#5a4a6a', 2.2);
  cel(g, ellP(0, 13, 12, 3, 10).map(T), { f: 'rgba(220,240,255,.6)', l: '#5a4a6a', lw: LS });
  cel(g, [[-26, -74, 1], [-8, -74, 1], [-10, -66], [-17, -62], [-24, -66]].map(T), { f: '#ffd23f', s: '#e09a20', so: [-1, -2], l: '#7a4a10', lw: LS });
  line(g, [[6, -70], [14, -96]].map(T), '#7a4a10', 1.6);
  cel(g, [[-4, -96], [14, -112, 1], [32, -96], [14, -100]].map(T), { f: '#35e7ff', s: '#1d8fc0', sh: [[[14, -112], [32, -96], [14, -100]].map(T)], l: '#123a58', lw: LS });
}

/* Sofia on a sun lounger, head left, sand at y = 0. */
function lounger(G, x, y, k, o = {}) {
  const P = o.P || SOFIA, D = dimP(P), pk = LWK.k;
  const FR = { f: '#f4f1ea', s: '#b9b2a6', h: '#ffffff', l: '#4a3a3a', so: [-3, -4], lw: LW };
  const u = [-.819, -.574], n = [-.574, .819], B0 = [36, -108], at = (t, d = 0) => [B0[0] + u[0] * t + n[0] * d, B0[1] + u[1] * t + n[1] * d];
  G.save();
  try {
    G.translate(x, y); G.scale(k, k); LWK.k = o.lwk ?? 1.8;
    for (const lx of [-150, 40, 470]) cel(G, [[lx - 7, -100, 1], [lx + 7, -100, 1], [lx + 9, 0, 1], [lx - 9, 0, 1]], FR);
    cel(G, [[-160, -104, 1], [500, -104, 1], [500, -92, 1], [-160, -92, 1]], FR);
    cel(G, limb([-120, -96], at(250, 10), 12, 12), FR);
    const back = [at(0), at(380), at(380, 20), at(0, 20)].map(p => [p[0], p[1], 1]);
    cel(G, back, { ...FR, clipFn: G2 => {
      G2.fillStyle = '#ff7aa8';
      for (let t = 0; t < 400; t += 40) G2.fill(poly([at(t, -4), at(t + 20, -4), at(t + 20, 30), at(t, 30)]));
    } });
    cel(G, [[30, -112, 1], [500, -112, 1], [500, -92, 1], [30, -92, 1]], { ...FR, clipFn: G2 => {
      G2.fillStyle = '#ff7aa8';
      for (let xx = 40; xx < 500; xx += 40) G2.fillRect(xx, -120, 20, 40);
    } });
    cel(G, ellP(...at(350, -14), 38, 16, 14, Math.atan2(u[1], u[0])), { f: '#ff7aa8', s: '#d94f86', h: '#ffc2da', so: [-3, -4], ho: [2, 2], l: '#7a2a4a', lw: LS });
    const hip = [60, -150], TT = xf(hip[0], hip[1], -.96), S = TT([6, -236]), nk = TT([3, -268]);
    armTo(G, D, [S[0] - 4, S[1] - 6], [-196, -470], [-246, -404], { bare: true, w: [34, 28, 22] });
    legTo(G, D, [52, -146], [262, -150], [470, -132], { bare: true, footA: -1.4 });
    legTo(G, P, hip, [250, -262], [392, -128], { bare: true, footA: .05 });
    torsoSide(G, P, TT, 'swim');
    const { P: _p, ...ho } = o;
    headOn(G, P, nk, -.6, .62, { view: 'q', expr: 'smile', E: { happy: true }, extra: shades, ...ho });
    cocktail(G, -20, -350);
    armTo(G, P, S, [-18, -180], [-20, -350], { bare: true, grip: true });
  } finally { LWK.k = pk; G.restore(); }
}

window.A = { head80, EXPR, VIEWS, HAIR, SOFIA, SOFIA_HAIR, mouthAt, blinkAt, bust, seated, lounger, sofiaTop, relight, dimP, headOn, armTo, legTo, footAt, handAt, torsoSide, chair, xf, ellP, angOf, tintC };
})();
