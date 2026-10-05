// example_scenes.js — chorus-hook scenes (23–36 s). Word-pop text is placeholder; swap in your own lyrics.
'use strict';
// S8 23.0–24.47 : title hook + gauge
function sPdoom(T) {
  paper(); tint('#FFF1DC', 1); sunburst(W / 2, 960, 26, ['#F7C51E', '#F7738A', '#FFB16A'], T * 20, .28);
  const v = seg(T, 23.7, 24.35, elasticOut);
  cam(punch(T, 23.0, .18) + .03 * kick(T), shake(T, 23.7, 10), 0, 0, () => {
    wpop("HERE WE", W / 2, 230, 150, 23.0, T, { rot: -5, fill: G_COOL, stroke: true });
    wpop('GO AGAIN', W / 2, 520, 210, 23.7, T, { rot: 3, fill: G_WARM, stroke: true, pulse: .05 });
    gauge(W / 2, 960, 250, v, T);
    shadowE(250, 1010, 70);
    person(250, 1010, 62, { pose: dance(T, 1), hands: { r: 'mic' }, eyes: 'star', mouth: sing(T) });
    clippy(1640 + Math.sin(T * 50) * 6 * v, 1000, 52, { dir: -1 });
  });
}

// S9 24.47–26.51 : exponential curve + boom
function sFoom(T) {
  paper(); tint('#EAE6FA', 1);
  const gx = 200, gy = 160, gw = 1520, gh = 600, u = seg(T, 24.55, 25.9, t => t * t * .5 + t * .5);
  const P = x => [gx + x * gw, gy + gh - (Math.exp(6 * x) - 1) / (Math.exp(6) - 1) * gh];
  const boom = seg(T, 25.9, 26.1, eout);
  cam(1 + .04 * kick(T) + .05 * boom, shake(T, 25.9, 16), shake(T, 25.9, 10), 0, () => {
    line([gx, gy - 20], [gx, gy + gh], { w: 4, op: .7 }); line([gx, gy + gh], [gx + gw + 20, gy + gh], { w: 4, op: .7 });
    letters('capabilities', gx - 40, gy + 150, 32, { font: HAND, weight: 700, rot: -90, align: 'center', shadow: false });
    letters('time', gx + gw - 30, gy + gh + 40, 32, { font: HAND, weight: 700, align: 'center', shadow: false });
    if (u > 0) { const pts = []; for (let i = 0; i <= 80; i++) pts.push(P(u * i / 80)); ink(pts, { closed: false, raw: true, w: 10, col: PAL.cpPurple }); const tp = P(u); mark(tp[0], tp[1], 60, { rot: T * 90 }); }
    if (boom > 0) {
      const tp = P(1); paint(starPts(tp[0], tp[1] + 40, 260 * boom, 120 * boom, 12, T * 30), { fill: G_SUN(C, tp[0], tp[1], 100), sw: 4, smooth: false });
      for (let i = 0; i < 26; i++) { const a = hash(i) * 6.28, d = (T - 25.9) * (500 + hash(i + 3) * 700); C.save(); C.globalAlpha = clamp(1.4 - (T - 25.9)); C.fillStyle = [PAL.cpSky, PAL.cpPink, PAL.cpYellow, PAL.cpGreen, PAL.cpPurple][i % 5]; C.translate(tp[0] + Math.cos(a) * d, tp[1] + 40 + Math.sin(a) * d + d * d * .0006); C.rotate(T * 8 + i); C.fillRect(-10, -5, 20, 10); C.restore(); }
    }
    [[430, 0, 'word'], [690, 2, 'excel'], [1230, 3, 'ppt'], [1490, 1, 'teams']].forEach(([x, off, lk]) => { shadowE(x, 1000, 60); person(x, 1000, 50, { look: lk, pose: dance(T, off), eyes: 'happy', mouth: 'grin' }); });
    shadowE(W / 2, 1000, 90);
    person(W / 2, 1000, 80, { pose: dance(T, 4), eyes: boom > 0 ? 'star' : 'happy', mouth: sing(T), hands: { r: 'mic' } });
    wpop("WATCH THE", 560, 200, 100, 24.5, T, { rot: -6, fill: G_COOL });
    wpop('CURVE', 700, 340, 160, WT(7, 2), T, { rot: -4, fill: G_COOL, stroke: true });
    wpop('GO', 1180, 190, 110, WT(7, 3), T, { rot: 6, fill: G_WARM });
    wpop('BOOM!!', 1400, 520, 250, 25.9, T, { rot: -8, fill: G_SUN, stroke: true, wig: 3, pulse: .08 });
  });
}

// S10 26.51–27.88 : locked room
function sRoom(T) {
  paper(); tint('#F3ECE0', 1);
  cam(punch(T, 26.51) + (T - 26.51) * .03, 0, 0, 0, () => {
    const R = rrPts(600, 250, 720, 660, 12);
    paint(R, { fill: '#D8C8B0', sw: 4, hatch: { ang: 45, gap: 18, op: .18 } });
    for (let i = 0; i < 7; i++) line([600, 330 + i * 90], [1320, 330 + i * 90], { w: 2, op: .25 });
    paint(rrPts(810, 410, 300, 300, 8), { fill: '#FFF3DF', sw: 3.4, shade: false });
    C.save(); path(rrPts(810, 410, 300, 300, 8)); C.clip();
    person(960, 940, 60, { pose: { lSh: 150, lEl: 20, rSh: 150, rEl: 20 }, eyes: 'shock', brows: 'worry', mouth: sing(T) === 'open' ? 'O' : 'wobble' });
    C.restore();
    for (let i = 0; i < 5; i++) { const x = 840 + i * 60; line([x, 410], [x, 710], { w: 7 }); }
    paint(rrPts(560, 560, 60, 40, 6), { fill: PAL.ink, sw: 2, shade: false }); paint(rrPts(1300, 560, 60, 40, 6), { fill: PAL.ink, sw: 2, shade: false });
    letters('IN', 520, 540, 30, { font: HAND, weight: 700, align: 'center', shadow: false }); letters('OUT', 1410, 540, 30, { font: HAND, weight: 700, align: 'center', shadow: false });
    const gl = ['字', '你好', '房间', '中文'];
    for (let i = 0; i < 4; i++) {
      const u = ((T - 26.51) / (BEAT / 2) + i * .5) % 2;
      if (u < 1) card(mix(120, 560, eio(u)), 580, 70, gl[i % 4], Math.sin(T * 4 + i) * 8);
      else card(mix(1360, 1800, eio(u - 1)), 580, 70, '?', Math.sin(T * 4 + i) * 8, PAL.cpPurple);
    }
    wpop('LOCKED IN A', W / 2, 170, 110, 26.5, T, { rot: -3, fill: G_COOL, stroke: true });
    wpop('BOX OF WORDS', W / 2, 870, 150, WT(8, 3), T, { rot: 2, fill: G_WARM, stroke: true, wig: 1.5 });
  });
}

// S11 27.88–29.35 : bag of snacks
function sShrooms(T) {
  paper();
  const cols = ['#F7B7CC', '#FBE38A', '#9ED8F5', '#A9DDB8', '#D7B8F2'];
  C.save();
  for (let i = 14; i >= 0; i--) { const r = i * 110 + ((T * 180) % 110); C.globalAlpha = .55; C.fillStyle = cols[(i + Math.floor(T * 180 / 110)) % 5]; path(blob(W / 2, H / 2, r + 20, 36, i * 1.7 + T * 2)); C.fill(); }
  C.restore();
  cam(1.02 + .03 * kick(T), 0, 0, Math.sin(T * 2.5) * 2.5, () => {
    person(620, 1110, 88, { pose: { lSh: 60 + Math.sin(T * 6) * 30, lEl: 40 + Math.sin(T * 5) * 30, rSh: 60 + Math.cos(T * 6) * 30, rEl: 40 + Math.cos(T * 5) * 30, lean: Math.sin(T * 3) * 8, tilt: Math.sin(T * 4) * 10 }, eyes: 'spiral', mouth: 'wobble' });
    shadowE(1320, 980, 200);
    bag(1320, 980, 100, T);
    wpop('WITH A BAG', 600, 180, 130, 28.0, T, { wob: true, fill: G_RIB, stroke: true, rot: -4 });
    wpop('OF SNACKS', 1330, 350, 150, WT(9, 3), T, { wob: true, fill: G_WARM, stroke: true, rot: 4 });
  });
}

// S12 29.35–33.33 : monster reveal
function sShog(T) {
  paper(); tint('#D9D0E6', 1);
  C.save(); C.globalAlpha = .5; hatch(rrPts(0, 0, W, H, 0), 30, 26, .12); C.restore();
  const m = seg(T, 32.0, 32.8, eio);
  cam(1.02 + .05 * seg(T, 32.0, 33.3, eio), -50 * seg(T, 32.0, 33.3, eio), 30 * seg(T, 32.0, 33.3, eio), 0, () => {
    shadowE(1250, 1010, 330);
    shoggoth(1250, 1010, 175, { t: T, mask: m, dir: -1 });
    if (m < 1) {
      C.save(); C.globalAlpha = 1 - m;
      paint(rrPts(1450, 170, 400, 110, 16), { fill: '#FFF5E2', sw: 3, shade: false });
      letters('RLHF :)', 1650, 225, 50, { align: 'center', fill: PAL.cpDeep, shadow: false });
      letters('helpful! harmless!', 1650, 265, 28, { font: HAND, weight: 700, align: 'center', shadow: false });
      ink(bez([1560, 285], [1500, 400], [1420, 520], [1300, 640]), { closed: false, raw: true, w: 4 });
      C.restore();
    }
    shadowE(430, 1010, 110);
    person(430, 1010, 76, { pose: { rSh: 95, rEl: -5, lSh: 20, lEl: 60, lean: 4 }, hands: { r: 'point' }, eyes: 'narrow', brows: 'angry', mouth: sing(T) });
    wpop('SEE THROUGH', 560, 190, 120, 29.5, T, { rot: -5, fill: G_COOL, stroke: true });
    wpop("THE MONSTER'S", 620, 340, 110, WT(10, 2), T, { rot: -3, fill: PAL.cpPurple, stroke: true });
    wpop('MASK', 1480, 200, 230, 32.0, T, { rot: 6, fill: PAL.cpRed, stroke: true, wig: 4, glitch: 10 });
  });
}

// S13 33.33–35.38 : glowing eyes — crimson disc, radial burst, push-in to glowing eyes
function sShini(T) {
  paper(); tint('#E8475A', 1);
  sunburst(W / 2, H / 2, 32, ['#7E0B22', '#FF8A96'], T * 14, .4);
  const dr = 440 * (1 + .04 * kick(T));
  C.save(); C.fillStyle = rg(W / 2, H / 2, dr, ['#FF5068', '#E3203F', '#B30F2E']); path(ellPts(W / 2, H / 2, dr, dr, 48)); C.fill(); C.restore();
  ink(ellPts(W / 2, H / 2, dr, dr, 48), { w: 5, op: .5 });
  for (let i = 0; i < 40; i++) { const a = i / 40 * 6.283 + T * .8; dot(W / 2 + Math.cos(a) * (dr + 46), H / 2 + Math.sin(a) * (dr + 46), 6, '#FFD6DC'); }
  const s = 150, fy = 470 + 6.65 * s, ey = 470 + .2 * s;
  const p = eio(seg(T, 34.0, 34.85)), z = mix(1, 3.1, p) * (1 + .03 * kick(T));
  const sy = mix(ey, H / 2 - 10, p);
  cam(z, 0, sy - H / 2 - z * (ey - H / 2), 0, () => {
    person(W / 2, fy, s, { pose: { rSh: 145, rEl: 100, lSh: 12, lEl: 8, tilt: -4 * (1 - p) }, hands: { r: 'peace' }, eyes: 'shini', mouth: T > 34.1 ? 'smirk' : sing(T) });
  });
  const tw = [[260, 300, 40], [1650, 260, 52], [1500, 820, 34], [360, 800, 46], [1760, 620, 28], [180, 560, 26]];
  tw.forEach(([x, y, r], i) => spark(x, y, r * (.7 + .3 * Math.sin(T * 9 + i * 2)), '#fff', 45 + T * 40 * (i % 2 ? 1 : -1)));
  if (T > 34.85) { C.save(); C.globalAlpha = .5 * (1 - seg(T, 34.85, 35.1)); C.fillStyle = '#fff'; C.fillRect(0, 0, W, H); C.restore(); }
  wpop('WITH THOSE', 430, 170, 110, 33.5, T, { rot: -6, fill: PAL.cream, stroke: true, shadow: false });
  wpop('GLOWING', 620, 950, 170, 34.1, T, { rot: -4, fill: GF(['#FFE3E8', '#FFB5C4', '#FF7A98']), stroke: true });
  wpop('EYES', 1580, 480, 220, 34.8, T, { rot: 6, fill: PAL.cream, stroke: true, shadow: false, pulse: .06 });
}

