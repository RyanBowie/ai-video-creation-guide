// cast.js — rigged, code-drawn characters in the watercolour/ink style. Local units: head radius ≈ 1.1, feet at y=0.
'use strict';

// ---------- M365 Copilot mark (two interlocking ribbons) ----------
const CP_A = 'M70 325 L160 325 Q173 325 181 300 L216 185 Q224 155 250 155 L385 155 C350 155 348 110 340 82 C330 50 315 40 290 40 L150 40 Q115 40 105 75 L40 290 Q28 325 70 325 Z';
const CP_FOLD = 'M262 40 L290 40 C315 40 330 50 340 82 C348 110 350 155 385 155 L250 155 Q224 155 220 170 Q232 90 262 40 Z';
let _cpA, _cpF;
function mark(x, y, size, o = {}) {
  _cpA = _cpA || new Path2D(CP_A); _cpF = _cpF || new Path2D(CP_FOLD);
  const k = size / 360, gap = o.gap ?? 14;
  push(x, y, k, 1, o.rot || 0); C.translate(-240, -240);
  const half = (warm) => {
    C.save(); if (warm) { C.translate(480, 480); C.rotate(Math.PI); } C.translate(-gap * .5, -gap * .3);
    C.fillStyle = warm ? lg(150, 40, 110, 325, ['#FFB16A', '#F7738A', '#E4569A', '#B04FE6']) : lg(150, 40, 110, 325, ['#38C2F8', [.3, '#1C8FE3'], [.62, '#4DB57A'], [1, '#F7C51E']]);
    C.fill(_cpA);
    C.fillStyle = warm ? lg(250, 60, 380, 150, ['#C92E1C', '#F0582E', '#FF9A5A']) : lg(250, 60, 380, 150, ['#0B2BA8', '#1552D6', '#1E7BEA']);
    C.fill(_cpF);
    C.save(); C.clip(_cpA); C.fillStyle = rg(120, 90, 260, ['rgba(255,255,245,.45)', 'rgba(255,255,245,0)']); C.fillRect(0, 0, 480, 480); C.restore();
    if (o.ink !== false) { C.strokeStyle = PAL.ink; C.lineJoin = 'round'; C.lineWidth = (o.sw ?? 2.4) / U; C.stroke(_cpA); }
    C.restore();
  };
  half(false); half(true);
  pop();
}

// ---------- looks ----------
const HAIR_CP = () => lg(0, -1.4, 0, 1.3, ['#1E3FB8', '#1C8FE3', '#6A5BD0', '#B04FE6']);
const LOOKS = {
  idol: {
    hair: 'twin', hairCol: HAIR_CP, tailL: () => lg(-1.2, -.8, -1.8, 3.2, ['#38C2F8', '#1C8FE3', '#4DB57A', '#F7C51E']),
    tailR: () => lg(1.2, -.8, 1.8, 3.2, ['#FFB16A', '#F7738A', '#E4569A', '#B04FE6']),
    top: '#26306B', jacket: PAL.cream, trim: () => lg(-.8, -5.3, .8, -4, ['#38C2F8', '#1C8FE3', '#B04FE6', '#F7738A']),
    bottom: 'skirt', skirt: () => lg(-1.1, 0, 1.1, 0, ['#1C8FE3', '#6A5BD0', '#E4569A', '#FFB16A']), boots: PAL.cream, sole: '#E4569A',
    skin: PAL.skin, iris: () => lg(0, -.3, 0, .3, ['#0B2BA8', '#1C8FE3', '#38C2F8']), clip: true, mic: 'headset', puff: true,
  },
};
// brand dancers: logo = chest print (appTile), acc = brand accessory
LOOKS.word = { ...LOOKS.idol, hair: 'bob', hairCol: '#1B2F6B', top: '#FFF5E2', jacket: '#185ABD', trim: '#9CCBF5', skirt: '#103F91', boots: '#103F91', sole: '#41A5EE', logo: 'word', acc: 'doc', clip: false, mic: false, iris: '#2B7CD3' };
LOOKS.excel = { ...LOOKS.idol, hair: 'pony', hairCol: '#2F2A22', top: '#FFF5E2', jacket: '#107C41', trim: '#A6E3C2', skirt: '#185C37', boots: '#185C37', sole: '#33C481', logo: 'excel', acc: 'grid', clip: false, mic: false, iris: '#107C41' };
LOOKS.ppt = { ...LOOKS.idol, hair: 'buns', hairCol: '#B8461F', top: '#FFF5E2', jacket: '#C43E1C', trim: '#FFB29B', skirt: '#7A2410', boots: '#7A2410', sole: '#ED6C47', logo: 'ppt', acc: 'pie', clip: false, mic: false, iris: '#B7472A' };
LOOKS.teams = { ...LOOKS.idol, hair: 'spiky', hairCol: '#2B2A55', top: '#FFF5E2', jacket: PAL.teams, trim: '#C5C6F2', bottom: 'pants', pants: '#2F2F5E', boots: PAL.cream, sole: PAL.teams, logo: 'teams', clip: false, mic: false, puff: false, iris: '#6264A7' };
LOOKS.surface = { ...LOOKS.idol, hair: 'short', hairCol: '#3B2C24', top: '#C9CED6', jacket: '#C9CED6', hoodie: true, bottom: 'pants', pants: '#2E3446', boots: '#F4F4F4', sole: '#0078D4', clip: false, mic: false, puff: false, glasses: true, iris: '#3B2C24', skin: '#E8B996', logo: 'win', pen: true };
LOOKS.xbox = LOOKS.excel; LOOKS.ops = LOOKS.surface; // legacy names

// app-icon chest prints (local units, s = width)
function tileLetter(ch, x, y, size, col = '#fff') { C.save(); C.translate(x, y); C.scale(size / 100, size / 100); C.fillStyle = col; C.font = '800 100px "Segoe UI", sans-serif'; C.textAlign = 'center'; C.textBaseline = 'middle'; C.fillText(ch, 0, 6); C.restore(); }
function appTile(kind, cx, cy, s) {
  const h = s / 2;
  if (kind === 'xbox') kind = 'excel';
  if (kind === 'win') {
    const g = s * .07, q = (s - g) / 2;
    for (const [i, j] of [[0, 0], [1, 0], [0, 1], [1, 1]]) paint(rrPts(cx - h + i * (q + g), cy - h + j * (q + g), q, q, q * .12), { fill: lg(cx - h, cy - h, cx + h, cy + h, ['#4CC2FF', '#1A8FEA', '#0067C0']), sw: 1.8, shade: false, smooth: false });
    return;
  }
  const P = {
    word: [['#41A5EE', '#2B7CD3', '#185ABD', '#103F91'], '#103F91', 'W'],
    ppt: [['#FF8F6B', '#ED6C47', '#D35230', '#C43E1C'], '#A8321A', 'P'],
    teams: [['#8B8CC7', '#6264A7', '#4B4C8F'], '#3D3E78', 'T'],
    excel: [['#33C481', '#21A366', '#107C41', '#185C37'], '#185C37', 'X'],
  }[kind];
  if (!P) return;
  paint(rrPts(cx - h, cy - h, s, s, s * .22), { fill: lg(cx, cy - h, cx, cy + h, P[0]), sw: 2.2, shade: false });
  C.save(); C.fillStyle = 'rgba(255,255,255,.6)';
  if (kind === 'word') for (let k = 0; k < 4; k++) C.fillRect(cx + h * .02, cy - h * .62 + k * h * .36, h * .74, h * .14);
  if (kind === 'excel') for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) C.fillRect(cx + h * (.02 + c * .4), cy - h * .66 + r * h * .34, h * .34, h * .26);
  if (kind === 'ppt') { C.beginPath(); C.arc(cx + h * .32, cy - h * .12, h * .52, 0, Math.PI * 2); C.fill(); C.fillStyle = '#FFE1D5'; C.beginPath(); C.moveTo(cx + h * .32, cy - h * .12); C.arc(cx + h * .32, cy - h * .12, h * .52, -Math.PI / 2, 0); C.closePath(); C.fill(); }
  C.restore();
  paint(rrPts(cx - h * .9, cy - h * .5, h * 1.05, h * 1.0, h * .14), { fill: P[1], sw: 1.8, shade: false, smooth: false });
  tileLetter(P[2], cx - h * .375, cy, h * .9);
}

const resolve = v => typeof v === 'function' ? v() : v;

// ---------- the rig ----------
// o: { dir, look, pose:{lSh,lEl,rSh,rEl,lHip,lKn,rHip,rKn,lean,tilt,bob}, eyes, mouth, turn, back, hands:{l,r}, sway, headOnly }
function person(x, y, s, o = {}) {
  const L = { ...LOOKS.idol, ...(typeof o.look === 'string' ? LOOKS[o.look] : o.look || {}) };
  const P = { lSh: 10, lEl: 6, rSh: 10, rEl: 6, lHip: 4, lKn: -2, rHip: 4, rKn: -2, lean: 0, tilt: 0, bob: 0, ...(o.pose || {}) };
  push(x, y, s, o.dir || 1);
  C.translate(0, -P.bob);
  if (o.headOnly) { head(L, o, P, 0, 0); pop(); return; }
  const pants = L.bottom === 'pants';
  // --- legs ---
  const leg = (sx, hipA, knA) => {
    const hip = [sx * .3, -3.05], knee = limb(hip, 1.35, sx * hipA), ank = limb(knee, 1.28, sx * (hipA + knA));
    const col = pants ? L.pants : L.skin;
    const a = sx * (hipA + knA) * D2R, ca = Math.cos(a), sa = Math.sin(a);
    const T = ([lx, ly]) => [ank[0] + lx * sx * ca + ly * sa, ank[1] - lx * sx * sa + ly * ca];
    if (L.swim) {
      paint(capsule(bend(hip, knee, ank, .4), .26, .17), { fill: L.skin, sw: 2.8 });
      paint([[-.16, -.08], [.12, -.1], [.3, .02], [.4, .16], [.34, .26], [-.14, .26], [-.2, .1]].map(T), { fill: L.skin, sw: 2.4, shade: false });
      return;
    }
    if (L.shoe && pants) {
      // low-profile shoe drawn first, straight trouser leg + hem over its top
      paint([[-.2, -.06], [.14, -.1], [.3, -.02], [.44, .1], [.45, .25], [0, .29], [-.21, .27], [-.25, .1]].map(T), { fill: L.boots, sw: 2.6 });
      ink([T([-.19, .26]), T([.12, .28]), T([.42, .25])], { closed: false, w: 3.2, col: resolve(L.sole) });
      const cuff = limb(knee, 1.16, sx * (hipA + knA));
      paint(capsule(bend(hip, knee, cuff, .4), .33, .29), { fill: col, sw: 2.8 });
      return;
    }
    paint(capsule(bend(hip, knee, ank, .4), pants ? .33 : .25, pants ? .27 : .18), { fill: col, sw: 2.8 });
    // boot: one silhouette (shaft + toe pointing outward), rotated with the shin
    const bootL = [[-.23, -.58], [.23, -.58], [.24, -.12], [.4, .0], [.52, .16], [.45, .3], [0, .31], [-.22, .29], [-.27, .12], [-.25, -.1]];
    paint(bootL.map(T), { fill: L.boots, sw: 2.8 });
    ink([T([-.2, .27]), T([.12, .3]), T([.44, .27])], { closed: false, w: 3.6, col: resolve(L.sole) });
  };
  leg(-1, P.lHip, P.lKn); leg(1, P.rHip, P.rKn);
  // --- upper body leans about the hips ---
  C.save(); C.translate(0, -3.1); C.rotate(P.lean * D2R); C.translate(0, 3.1);
  const back = o.back;
  // tails/back hair are behind the body
  if (!back) { C.save(); C.translate(0, -6.65); C.rotate(P.tilt * D2R); hairBack(L, o); C.restore(); }
  // torso
  const tb = pants || L.hoodie || L.swim ? -3.05 : -3.7;
  const torso = [[-.7, -5.2], [-.35, -5.33], [.35, -5.33], [.7, -5.2], [.64, -4.6], [.5, -4.0], [.54, tb], [-.54, tb], [-.5, -4.0], [-.64, -4.6]];
  if (L.hoodie) { // hood bunched behind neck
    paint([[-.62, -5.15], [-.5, -5.62], [0, -5.75], [.5, -5.62], [.62, -5.15]], { fill: L.jacket, sw: 2.8 });
    paint([[-.75, -5.2], [-.35, -5.35], [.35, -5.35], [.75, -5.2], [.72, -4.4], [.66, -3.3], [.7, -3.0], [-.7, -3.0], [-.66, -3.3], [-.72, -4.4]], { fill: L.jacket, sw: 3 });
    paint(rrPts(-.4, -3.95, .8, .5, .12), { fill: L.jacket, sw: 2.2, shade: false });
    line([-.15, -5.25], [-.2, -4.55], { w: 2 }); line([.15, -5.25], [.2, -4.55], { w: 2 });
    if (L.logo && !back) appTile(L.logo, .3, -4.35, .36);
    if (L.cpTee && !back) mark(0, -4.6, .46, { sw: 1.3 });
    if (L.pen && !back) { paint(capsule([[-.22, -3.72], [-.34, -4.3]], .055, .05), { fill: '#3A3F4C', sw: 2, shade: false }); paint(capsule([[-.34, -4.3], [-.37, -4.42]], .05, .02), { fill: '#1E2230', sw: 1.6, shade: false }); }
  } else if (L.swim) {
    paint(torso, { fill: L.skin, sw: 3 });
    const suit = [[-.6, -4.95], [-.25, -4.78], [0, -4.88], [.25, -4.78], [.6, -4.95], [.5, -4.0], [.56, -3.4], [.3, -3.0], [0, -2.95], [-.3, -3.0], [-.56, -3.4], [-.5, -4.0]];
    paint(suit, { fill: L.top, sw: 2.8 });
    if (!back) { for (const [px, py] of [[-.3, -4.4], [.25, -3.9], [-.15, -3.55], [.35, -4.55], [0, -4.2]]) dot(px, py, .07, L.trim); line([-.45, -4.9], [-.38, -5.3], { w: 3 }); line([.45, -4.9], [.38, -5.3], { w: 3 }); }
  } else {
    paint(torso, { fill: L.top, sw: 3 });
    if (!back) line([-.18, -5.3], [0, -5.05], { w: 2.2 }), line([.18, -5.3], [0, -5.05], { w: 2.2 });
  }
  // skirt / waistband
  if (L.bottom === 'skirt') {
    const hem = []; const n = 9;
    for (let i = 0; i <= n; i++) { const t = i / n; hem.push([mix(1.1, -1.1, t), -2.52 - (i % 2) * .1 + Math.sin(t * Math.PI) * .06]); }
    const sk = [[-.55, -3.85], [.55, -3.85], [.8, -3.25], ...hem, [-.8, -3.25]];
    paint(sk, { fill: resolve(L.skirt), sw: 3, seg: 2 });
    for (let i = 1; i < n; i += 2) line([mix(-.4, .4, i / n), -3.75], [hem[n - i][0], hem[n - i][1] + .02], { w: 1.8, op: .7 });
    paint(rrPts(-.58, -3.98, 1.16, .22, .08), { fill: L.top, sw: 2.4, shade: false });
    if (L.clip && !back) mark(0, -3.87, .5, { sw: 1.4 });
  } else if (!L.hoodie && !L.swim) {
    paint(rrPts(-.56, -3.2, 1.12, .25, .08), { fill: '#2B2233', sw: 2.2, shade: false });
  }
  // cropped jacket (open)
  if (!L.hoodie && !L.swim) {
    const so = L.soft ? [[-.68, -5.22], [-.2, -5.34], [-.3, -4.75], [-.34, -4.2], [-.5, -4.05], [-.7, -4.08], [-.72, -4.6]]
      : [[-.74, -5.24], [-.2, -5.34], [-.3, -4.75], [-.34, -4.2], [-.5, -4.05], [-.76, -4.08], [-.82, -4.6]];
    for (const sx of [-1, 1]) {
      const pn = so.map(([a, b]) => [a * sx, b]);
      paint(pn, { fill: L.jacket, sw: 3 });
      if (!back) paint([[-.2, -5.34], [-.44, -5.1], [-.34, -4.72], [-.28, -4.78]].map(([a, b]) => [a * sx, b]), { fill: resolve(L.trim), sw: 2.2, shade: false });
    }
    if (L.logo && !back) appTile(L.logo, 0, -4.55, .52);
    if (L.cpTee && !back) mark(0, -4.62, .4, { sw: 1.2 });
    if (L.clip && !back) mark(-.48, -4.85, .36, { sw: 1.2 });
  }
  // neck
  paint(capsule([[0, -5.2], [0, -5.75]], .17, .17), { fill: L.skin, sw: 2.6, shade: false });
  if (L.necklace && !back) { ink(arcPts(0, -5.45, .3, .5, 20, 160, 10), { closed: false, w: 1.6, col: '#D9A93A', raw: true }); dot(0, -4.96, .055, '#E8BC4A'); }
  // arms
  const hands = o.hands || {};
  const arm = (sx, shA, elA, hand) => {
    const sh = [sx * (L.soft ? .6 : .68), -5.05], el = limb(sh, 1.1, sx * shA), ha = limb(el, 1.0, sx * (shA + elA));
    const ch = bend(sh, el, ha, .32);
    if (L.hoodie) {
      paint(capsule(ch, .27, .2), { fill: L.jacket, sw: 2.8 });
      paint(capsule(ch.slice(11, 14), .215, .205, false), { fill: L.jacket, sw: 2.2, shade: false });
    } else if (L.swim) {
      paint(capsule(ch, .17, .115), { fill: L.skin, sw: 2.6 });
    } else {
      paint(capsule(ch.slice(5), .15, .115), { fill: L.skin, sw: 2.6 });
      const sl = ch.slice(0, 10);
      paint(capsule(sl, L.puff ? .29 : L.soft ? .2 : .25, L.soft ? .17 : .19), { fill: L.jacket, sw: 2.8 });
      paint(capsule(ch.slice(8, 11), L.soft ? .18 : .215, L.soft ? .17 : .2, false), { fill: resolve(L.trim), sw: 2, shade: false });
    }
    const hp = limb(ha, .1, sx * (shA + elA));
    handShape(hp, sx * (shA + elA), sx, hand, L);
  };
  arm(-1, P.lSh, P.lEl, hands.l); arm(1, P.rSh, P.rEl, hands.r);
  // head
  C.save(); C.translate(0, -6.65); C.rotate(P.tilt * D2R); head(L, o, P); if (back) hairBack(L, o); C.restore();
  C.restore();
  pop();
}

function handShape(p, ang, sx, kind, L) {
  const [x, y] = p;
  if (kind === 'peace') {
    for (const d of [-14, 14]) paint(capsule([p, limb(p, .42, ang + d * sx + 0)], .07, .06), { fill: L.skin, sw: 2.2, shade: false });
  }
  if (kind === 'point') paint(capsule([p, limb(p, .45, ang)], .07, .06), { fill: L.skin, sw: 2.2, shade: false });
  // mitten hand: egg shape along the arm with a small thumb bump
  const r = ang * D2R, cr = Math.cos(r), sr = Math.sin(r);
  const R = ([lx, ly]) => [x + lx * cr + ly * sr, y - lx * sr + ly * cr];
  const mit = [[-.13, -.12], [0, -.16], [.13, -.12], [.15, .04], [.1, .2], [0, .25], [-.1, .2], [-.15, .06]].map(([a, b]) => [a * sx, b]);
  paint(mit.map(R), { fill: L.skin, sw: 2.4, shade: false });
  paint([[-.12, -.05], [-.23, .02], [-.22, .12], [-.13, .1]].map(([a, b]) => R([a * sx, b])), { fill: L.skin, sw: 2, shade: false });
  if (kind === 'mic') {
    const a = limb(p, -.1, ang + 180), b = limb(p, .55, ang + 160 * sx);
    paint(capsule([[x, y + .2], [x + .05 * sx, y - .45]], .08, .1), { fill: '#3A3550', sw: 2.4 });
    paint(ellPts(x + .06 * sx, y - .6, .17, .19, 12), { fill: '#C7CBD6', sw: 2.4, hatch: { ang: 45, gap: .07, op: .35 } });
  }
}

function eye(x, y, kind, L, sc = 1, side = 1) {
  const rx = .2 * sc, ry = .27;
  switch (kind) {
    case 'happy': ink([[x - rx, y + .06], [x, y - .1], [x + rx, y + .06]], { closed: false, w: 4.2 }); return;
    case 'closed': ink([[x - rx, y - .02], [x, y + .08], [x + rx, y - .02]], { closed: false, w: 4 }); return;
    case 'wink': ink([[x - rx * 1.1, y - .1], [x + rx * .9, y], [x - rx * 1.1, y + .1]], { closed: false, w: 4 }); return;
    case 'star': paint(starPts(x, y, .27, .12), { fill: PAL.cpYellow, sw: 2.4, smooth: false, shade: false }); return;
    case 'heart': { const h = []; for (let i = 0; i < 24; i++) { const t = i / 24 * Math.PI * 2; h.push([x + .016 * 16 * Math.pow(Math.sin(t), 3), y - .016 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); } paint(h, { fill: PAL.cpPink, sw: 2.4, smooth: false, shade: false }); return; }
    case 'spiral': { const s = []; for (let i = 0; i < 40; i++) { const a = i * .45, r = .02 + i * .0058; s.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } paint(ellPts(x, y, .25, .27, 16), { fill: '#fff', sw: 2.4, shade: false }); ink(s, { closed: false, w: 2.4 }); return; }
    case 'shock': paint(ellPts(x, y, .22, .27, 16), { fill: '#fff', sw: 2.6, shade: false }); dot(x, y + .02, .06); return;
    case 'narrow': ink([[x - rx, y], [x + rx, y - .03]], { closed: false, w: 4.5 }); return;
    case 'shini': { // idol "shinigami" eye: glowing pink-red rounded rect + white star glint
      const w = .38 * sc, h = .46, x0 = x - w / 2, y0 = y - h / 2 + .02;
      C.save(); C.fillStyle = rg(x, y + .02, .5, ['rgba(255,60,110,.75)', 'rgba(255,60,110,.25)', 'rgba(255,60,110,0)']); path(ellPts(x, y + .02, .5, .5, 20)); C.fill(); C.restore();
      paint(rrPts(x0, y0, w, h, .12), { fill: lg(x, y0, x, y0 + h, ['#FFC2D2', '#FF5A86', '#E3124B']), sw: 2.4, shade: false });
      C.save(); C.globalAlpha = .45; C.fillStyle = '#fff'; path(rrPts(x0 + .05 * sc, y0 + .04, w - .1 * sc, h * .32, .07)); C.fill(); C.restore();
      ink(arcPts(x, y + .02, w * .62, h * .56, 200, 340, 10), { closed: false, w: 5.5, raw: true });
      paint(starPts(x + .06 * sc, y - .05, .14, .045, 4, -15), { fill: '#fff', ink: false, shade: false, smooth: false });
      dot(x - .08 * sc, y + .1, .035 * sc, '#fff');
      return;
    }
  }
  // open, anime style
  paint(ellPts(x, y + .02, rx, ry, 18), { fill: resolve(L.iris), sw: 2.2, shade: false, base: 1, fillOp: .3 });
  C.save(); path(ellPts(x, y + .02, rx, ry, 18)); C.clip(); dot(x, y + .06, .11 * sc, '#1A1230'); C.restore();
  ink(arcPts(x, y + .02, rx * 1.12, ry * 1.05, 195, 345, 10), { closed: false, w: 5.5, raw: true });
  ink([[x + side * rx * .95, y - .16], [x + side * (rx + .1), y - .24]], { closed: false, w: 3 });
  dot(x - .07 * sc, y - .06, .065 * sc, '#fff'); dot(x + .07 * sc, y + .12, .035 * sc, '#fff');
}
function mouth(x, y, kind) {
  switch (kind) {
    case 'open': paint([[x - .2, y - .04], [x + .2, y - .04], [x + .12, y + .18], [x, y + .22], [x - .12, y + .18]], { fill: '#8E2F3A', sw: 2.4, shade: false }); paint(ellPts(x, y + .15, .09, .05, 10), { fill: PAL.cpCoral, ink: false, shade: false }); return;
    case 'O': paint(ellPts(x, y + .06, .11, .15, 14), { fill: '#8E2F3A', sw: 2.4, shade: false }); return;
    case 'grin': paint([[x - .3, y - .06], [x + .3, y - .06], [x + .2, y + .14], [x, y + .2], [x - .2, y + .14]], { fill: '#fff', sw: 2.6, shade: false }); return;
    case 'flat': ink([[x - .14, y + .02], [x + .14, y]], { closed: false, w: 3 }); return;
    case 'cat': ink([[x - .2, y - .02], [x - .1, y + .06], [x, y - .01], [x + .1, y + .06], [x + .2, y - .02]], { closed: false, w: 3 }); return;
    case 'wobble': ink([[x - .2, y + .04], [x - .1, y - .03], [x, y + .04], [x + .1, y - .03], [x + .2, y + .04]], { closed: false, w: 3 }); return;
    case 'smirk': ink([[x - .14, y + .04], [x + .06, y + .04], [x + .18, y - .06]], { closed: false, w: 3 }); return;
  }
  ink([[x - .16, y - .01], [x, y + .08], [x + .16, y - .01]], { closed: false, w: 3.2 });
}

function ribbon(cl, w0, w1, bulge = .45) {
  const c = smooth(cl, false, 6), Lp = [], Rp = [], n = c.length;
  for (let i = 0; i < n; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const t = i / (n - 1), w = mix(w0, w1, t) * (1 + bulge * Math.sin(Math.PI * t));
    Lp.push([c[i][0] - dy * w, c[i][1] + dx * w]); Rp.push([c[i][0] + dy * w, c[i][1] - dx * w]);
  }
  return [...Lp, ...Rp.reverse()];
}
function swayPts(pts, anchor, amt) { return pts.map(([x, y], i) => { const a = amt * D2R * i / (pts.length - 1), dx = x - anchor[0], dy = y - anchor[1]; return [anchor[0] + dx * Math.cos(a) - dy * Math.sin(a), anchor[1] + dx * Math.sin(a) + dy * Math.cos(a)]; }); }

function hairBack(L, o) {
  const hc = resolve(L.hairCol), sw = o.sway || 0;
  if (L.hair === 'twin') {
    for (const sx of [-1, 1]) {
      const cl = [[1.0, -.65], [1.6, -.8], [1.95, -.2], [1.95, .7], [1.75, 1.65], [1.45, 2.4], [1.62, 2.8]].map(([a, b]) => [a * sx, b]);
      const pts = ribbon(swayPts(cl, cl[0], sw * sx), .3, .03, .7);
      paint(pts, { fill: sx < 0 ? resolve(L.tailL) : resolve(L.tailR), sw: 3, smooth: false, shadeO: { light: .45 } });
      const inner = swayPts(cl, cl[0], sw * sx).slice(1, 6).map(([a, b]) => [a - sx * .08, b]);
      ink(inner, { closed: false, w: 1.6, op: .55 });
    }
  }
  if (L.hair === 'pony') {
    const cl = [[.1, -1.05], [.9, -1.55], [1.65, -1.2], [1.85, -.1], [1.6, 1.0], [1.85, 1.75]];
    paint(ribbon(swayPts(cl, cl[0], sw), .28, .03, .8), { fill: hc, sw: 3, smooth: false });
  }
  if (L.hair === 'topbun') { // messy top knot (Sofia)
    const bx = .12 + sw * .004, by = -1.42;
    paint(ellPts(bx, by, .58, .5, 18), { fill: hc, sw: 3 });
    ink(arcPts(bx, by, .34, .28, 190, 480, 16), { closed: false, w: 1.8, raw: true, op: .6 });
    ink([[bx - .45, by - .2], [bx - .72, by - .55], [bx - .6, by - .72]], { closed: false, w: 2, op: .8 });
    ink([[bx + .4, by - .3], [bx + .62, by - .62]], { closed: false, w: 2, op: .8 });
  }
  if (L.hair === 'twin' || L.hair === 'bob' || L.hair === 'pony' || L.hair === 'topbun') {
    const long = L.hair === 'twin' ? 1.3 : L.hair === 'bob' ? .95 : L.hair === 'topbun' ? .45 : .6;
    paint([...arcPts(0, -.05, 1.3, 1.28, 180, 360, 14), [1.28, .4], [1.2, long], [.8, long + .15], [-.8, long + .15], [-1.2, long], [-1.28, .4]], { fill: hc, sw: 3 });
  }
  if (L.hair === 'buns') for (const sx of [-1, 1]) { const c = [sx * .92, -1.0]; paint(ellPts(c[0], c[1], .46, .44, 16), { fill: hc, sw: 3 }); ink(arcPts(c[0], c[1], .26, .24, 200, 470, 14), { closed: false, w: 1.8, raw: true, op: .7 });
    if (L.acc === 'pie') { const px = sx * 1.22, py = -1.3; paint(ellPts(px, py, .17, .17, 14), { fill: '#FFE1D5', sw: 2, shade: false }); paint([[px, py], ...arcPts(px, py, .17, .17, 270, 360, 6)], { fill: '#C43E1C', sw: 1.6, shade: false, smooth: false }); } }
}

function head(L, o, P) {
  const hc = resolve(L.hairCol), turn = o.turn || 0, fx = turn * .36;
  const face = [...arcPts(0, 0, 1.08, 1.08, 180, 360, 14), [1.07, .2], [.92 - turn * .1, .64], [.5 + fx * .4, .98], [fx * .45, 1.1], [-.5 + fx * .4, .98], [-.92 - turn * .1, .64], [-1.07, .2]];
  if (o.back) { // back of head
    paint(face.map(([a, b]) => [a * 1.08, b * 1.02 - .03]), { fill: hc, sw: 3 });
    ink([[0, -1.05], [.05, -.4], [0, .3]], { closed: false, w: 1.6, op: .5 });
    hairFront(L, o, true); return;
  }
  paint(face, { fill: L.skin, sw: 3, shadeO: { light: .3, dark: .12 } });
  if (L.hoops) for (const sx of [-1, 1]) { C.save(); C.strokeStyle = '#D9A93A'; C.lineWidth = 4 / U; C.beginPath(); C.arc(sx * (1.04 - (sx === Math.sign(turn) ? turn * .1 : 0)), .62, .13, 0, Math.PI * 2); C.stroke(); C.restore(); }
  // blush
  for (const sx of [-1, 1]) {
    const bx = sx * .62 + fx * (sx === Math.sign(turn) ? .7 : 1.1);
    C.save(); C.globalAlpha = .38; C.fillStyle = PAL.blush; path(ellPts(bx, .52, .2, .1, 12)); C.fill(); C.restore();
    for (let k = -1; k <= 1; k++) line([bx + k * .08 - .03, .56], [bx + k * .08 + .04, .47], { w: 1.4, op: .6 });
  }
  const ex = .42, E = o.eyes || 'open', eL = typeof E === 'object' ? E.l : E, eR = typeof E === 'object' ? E.r : E;
  const scL = turn < 0 ? 1 + turn * .45 : 1, scR = turn > 0 ? 1 - turn * .45 : 1;
  eye(-ex + fx * (turn > 0 ? 1.25 : .8), .2, eL, L, scL, -1); eye(ex + fx * (turn > 0 ? .8 : 1.25), .2, eR, L, scR, 1);
  if (L.glasses) { for (const sx of [-1, 1]) ink(ellPts(sx * ex + fx, .2, .3, .26, 16), { w: 2.6 }); line([-.12 + fx, .18], [.12 + fx, .18], { w: 2.4 }); }
  mouth(fx * 1.1, .72, o.mouth || 'smile');
  if (o.brows) for (const sx of [-1, 1]) line([sx * .6 + fx, -.25 + (o.brows === 'worry' ? -sx * -.06 : sx * -.06) * (o.brows === 'angry' ? -1 : 1)], [sx * .22 + fx, -.25 + (o.brows === 'worry' ? .06 : -.06) * (o.brows === 'angry' ? -1 : 1)], { w: 3 });
  hairFront(L, o, false);
}

function hairFront(L, o, back) {
  const hc = resolve(L.hairCol), turn = o.turn || 0, fx = turn * .3;
  if (!back) {
    if (L.hair === 'spiky') {
      paint([[-1.12, .05], [-1.2, -.6], [-1.0, -1.05], [-.7, -1.35], [-.35, -1.28], [-.1, -1.5], [.25, -1.3], [.55, -1.45], [.8, -1.15], [1.1, -.9], [1.2, -.3], [1.1, .05], [.85, -.35], [.55, -.2], [.3, -.4], [.0, -.18], [-.3, -.4], [-.6, -.2], [-.85, -.4]], { fill: hc, sw: 3, smooth: false });
    } else if (L.hair === 'short') {
      paint([[-1.12, .1], [-1.2, -.55], [-.95, -1.1], [-.4, -1.32], [.25, -1.3], [.8, -1.12], [1.15, -.65], [1.14, .05], [.95, -.3], [.55, -.45], [.2, -.3], [-.2, -.5], [-.6, -.35], [-.9, -.25]], { fill: hc, sw: 3 });
    } else if (L.hair === 'topbun') { // pulled back into the top knot: soft hairline, loose wisps
      const top = arcPts(fx * .3, -.04, 1.16, 1.14, 185, 355, 12);
      paint([...top, [1.12, -.2], [.92, -.52], [.5 + fx, -.74], [.08 + fx, -.68], [-.32 + fx, -.76], [-.78, -.56], [-1.12, -.2]], { fill: hc, sw: 3, seg: 2 });
      for (const sx of [-1, 1]) ink([[sx * 1.02, -.4], [sx * 1.12, .12], [sx * 1.04, .5]], { closed: false, w: 2.4, col: hc });
      ink([[.18 + fx, -.7], [.42 + fx, -.46], [.5 + fx, -.12]], { closed: false, w: 2 });
      ink([[-.1 + fx, -.95], [-.05 + fx, -.72]], { closed: false, w: 1.6, op: .6 });
    } else {
      // bangs with a zig-zag fringe
      const top = arcPts(fx * .3, -.04, 1.16, 1.14, 185, 355, 12);
      const fringe = L.hair === 'bob' ? [[1.12, -.1], [.6, -.28], [0 + fx, -.26], [-.6, -.28], [-1.12, -.1]]
        : [[1.12, -.2], [.85 + fx, -.32], [.62 + fx, -.52], [.38 + fx, -.26], [.12 + fx, -.46], [-.14 + fx, -.24], [-.42 + fx, -.5], [-.66 + fx, -.3], [-.9, -.42], [-1.12, -.18]];
      paint([...top, ...fringe], { fill: hc, sw: 3, seg: 2 });
      // side locks
      for (const sx of [-1, 1]) paint([[1.0, -.5], [1.14, .1], [1.08, .7], [.94, 1.05], [.88, .5], [.84, -.1]].map(([a, b]) => [a * sx + (sx === Math.sign(turn) ? -fx * .2 : 0), b]), { fill: hc, sw: 2.6 });
    }
    // anime shine
    C.save(); C.globalAlpha = .55; C.strokeStyle = '#FFF8EE'; C.lineWidth = 5 / U; C.lineCap = 'round';
    C.beginPath(); C.arc(fx * .3 - .1, -.1, .88, -2.55, -2.05); C.stroke(); C.beginPath(); C.arc(fx * .3 - .1, -.1, .88, -1.9, -1.72); C.stroke(); C.restore();
  }
  if (L.hair === 'twin') {
    for (const sx of [-1, 1]) paint(ellPts(sx * 1.04, -.66, .2, .2, 12), { fill: sx < 0 ? PAL.cpBlue : PAL.cpPink, sw: 2.4, shade: false }); // scrunchies
    if (L.clip) mark(.72, -.98, .62, { rot: 20, sw: 1.6 });
  }
  if (L.mic === 'headset' && !back) {
    ink([[-1.1, .05], [-1.0, .55], [-.6, .82], [-.32, .82]], { closed: false, w: 2.2 });
    dot(-.28, .82, .07, '#3A3550');
  }
  if (L.acc === 'grid' && !back) { // Excel sheet hairclip
    C.save(); C.translate(.74, -.95); C.rotate(-14 * D2R);
    paint(rrPts(-.2, -.2, .4, .4, .06), { fill: '#fff', sw: 2.2, shade: false, smooth: false });
    C.fillStyle = '#21A366'; C.fillRect(-.2, -.2, .4, .1); C.fillRect(-.2, -.2, .1, .4);
    for (let k = 1; k < 3; k++) { line([-.2, -.2 + k * .13], [.2, -.2 + k * .13], { w: 1.6, col: '#107C41' }); line([-.2 + k * .13, -.2], [-.2 + k * .13, .2], { w: 1.6, col: '#107C41' }); }
    C.restore();
  }
  if (L.acc === 'doc' && !back) { // Word doc hairclip
    C.save(); C.translate(.74, -.95); C.rotate(18 * D2R);
    paint([[-.17, -.22], [.08, -.22], [.17, -.13], [.17, .22], [-.17, .22]], { fill: '#fff', sw: 2.2, shade: false, smooth: false });
    for (let k = 0; k < 3; k++) line([-.1, -.08 + k * .1], [.1, -.08 + k * .1], { w: 2, col: '#2B7CD3' });
    C.restore();
  }
}

// ---------- cameos ----------
function clippy(x, y, s, o = {}) {
  push(x, y, s, o.dir || 1);
  const cl = [[.35, .9], [.35, -2.2], ...arcPts(0, -2.2, .35, .35, 0, -180, 10), [-.35, .6], ...arcPts(.12, .6, .47, .47, 180, 0, 10), [.59, -2.65], ...arcPts(.05, -2.65, .54, .54, 0, -180, 12), [-.49, -.9]]
    .map(([a, b]) => [a + jit(.008), b + jit(.008)]);
  C.save(); C.lineJoin = C.lineCap = 'round';
  C.strokeStyle = PAL.ink; C.lineWidth = .2 + 5 / U; path(cl, false); C.stroke();
  C.strokeStyle = lg(-.5, -3, .6, 1, ['#E7EAF1', '#9CA3B5', '#DCE0EA']); C.lineWidth = .2; path(cl, false); C.stroke();
  C.strokeStyle = 'rgba(255,255,255,.8)'; C.lineWidth = .05; C.translate(-.05, -.04); path(cl, false); C.stroke(); C.restore();
  for (const [ex, sx] of [[-.22, -1], [.26, 1]]) { paint(ellPts(ex, -1.55, .24, .3, 16), { fill: '#fff', sw: 2.6, shade: false }); dot(ex + .06, -1.5, .1); dot(ex + .03, -1.56, .03, '#fff'); line([ex - .2, -2.0 - sx * .05], [ex + .2, -2.0 + sx * .05], { w: 3.4 }); }
  pop();
}
function shoggoth(x, y, s, o = {}) {
  push(x, y, s, o.dir || 1);
  const T = o.t || 0;
  // tentacles
  for (let i = 0; i < 7; i++) {
    const bx = mix(-1.6, 1.6, i / 6), cl = [[bx, -.6], [bx + Math.sin(T * 2 + i) * .3, -.2], [bx * 1.25 + Math.sin(T * 2 + i * 1.7) * .4, .1], [bx * 1.45 + .2 * Math.sin(i), .05]];
    paint(ribbon(cl, .22, .04, .2), { fill: i % 2 ? '#3E3A5C' : '#46406A', sw: 2.6, smooth: false });
  }
  const body = [[-1.9, -.4], [-2.1, -1.6], [-1.6, -2.9], [-.6, -3.5], [.5, -3.4], [1.5, -2.9], [2.05, -1.8], [1.9, -.4], [.9, -.1], [-.9, -.1]];
  paint(body, { fill: lg(0, -3.5, 0, 0, ['#5A4F86', '#3A3458', '#2E4A45']), sw: 3.4, hatch: { ang: -30, gap: .16, op: .12 } });
  const eyes = [[-1.35, -2.1, .28], [-.9, -1.1, .2], [1.3, -2.3, .24], [1.55, -1.2, .3], [.95, -.75, .16], [-1.5, -.8, .15], [-.3, -.55, .18], [.6, -3.0, .17], [-.9, -2.95, .15]];
  for (const [ex, ey, r] of eyes) { paint(ellPts(ex, ey, r, r * .9, 14), { fill: '#F4F0D8', sw: 2.2, shade: false }); dot(ex + r * .2, ey + r * .1, r * .45, '#1A1230'); }
  // what's under the mask
  const mk = clamp(o.mask || 0);
  if (mk > 0) {
    paint(ellPts(.05, -1.9, .82, .6, 18), { fill: '#F4F0D8', sw: 3, shade: false });
    C.save(); path(ellPts(.05, -1.9, .82, .6, 18)); C.clip();
    dot(.05, -1.9, .42, '#8E1020'); dot(.05, -1.9, .2, '#1A1230'); dot(-.08, -2.02, .07, '#fff'); C.restore();
    ink(ellPts(.05, -1.9, .82, .6, 18), { w: 3.4 });
  }
  // the friendly mask
  C.save(); C.translate(.05 + mk * 2.6, -1.9 - mk * 1.6 + mk * mk * 2.2); C.rotate((-6 + mk * 55) * D2R);
  paint(ellPts(0, 0, .88, .82, 20), { fill: PAL.cream, sw: 3.2 });
  line([.6, -.1], [.95, -.2], { w: 2 }); line([-.6, -.1], [-.95, -.2], { w: 2 });
  eye(-.3, -.12, 'happy', LOOKS.idol); eye(.3, -.12, 'happy', LOOKS.idol); mouth(0, .28, 'grin');
  mark(.55, .45, .38, { sw: 1.2 });
  C.restore();
  pop();
}

// hand-held Surface Laptop prop (for the Surface dancer)
function laptop(x, y, s, o = {}) {
  push(x, y, s);
  paint([[-.9, 0], [.9, 0], [.75, -1.05], [-.75, -1.05]], { fill: '#D5D9E0', sw: 2.8, smooth: false });
  paint([[-.65, -.15], [.65, -.15], [.55, -.9], [-.55, -.9]], { fill: lg(0, -.9, 0, -.15, ['#1F3A8F', '#2E62C9', '#8FB8F0']), sw: 1.6, smooth: false, shade: false });
  paint([[-.63, -.15], [.63, -.15], [.615, -.25], [-.615, -.25]], { fill: 'rgba(240,244,250,.85)', ink: false, smooth: false, shade: false });
  appTile('win', -.08, -.2, .08); mark(.06, -.2, .09, { ink: false });
  mark(0, -.56, .45, { sw: 1 });
  paint(rrPts(-1.0, -.02, 2.0, .16, .06), { fill: '#BCC2CE', sw: 2.4, shade: false });
  pop();
}
// floating Excel sheet + chart prop
function sheetProp(x, y, s, o = {}) {
  push(x, y, s, 1, o.rot || 0);
  paint(rrPts(-1, -.7, 2, 1.4, .1), { fill: '#FBFFFC', sw: 2.8 });
  C.fillStyle = '#21A366'; C.fillRect(-1, -.7, 2, .22); C.fillStyle = '#E3F4EA'; C.fillRect(-1, -.48, .28, 1.18);
  for (let k = 0; k < 4; k++) line([-1, -.48 + k * .3], [1, -.48 + k * .3], { w: 1.4, col: '#9CCFB2' });
  for (let k = 0; k < 4; k++) line([-.72 + k * .43, -.48], [-.72 + k * .43, .7], { w: 1.4, col: '#9CCFB2' });
  const T = o.t || 0;
  [.35, .6, .45, .85].forEach((v, k) => { const hh = v * (.8 + .2 * Math.sin(T * 6 + k)); paint(rrPts(-.55 + k * .38, .6 - hh, .24, hh, .03), { fill: ['#33C481', '#21A366', '#107C41', '#185C37'][k], sw: 1.8, shade: false, smooth: false }); });
  appTile('excel', .78, -.59, .3);
  pop();
}
