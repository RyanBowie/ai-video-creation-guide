// scenes_a.js — title, return, inbox avalanche, calendar chaos. Scene functions take absolute time T (s).
'use strict';

// ---------- 0: quest title card (0 – 2.2) ----------
function sTitle(T) {
  paper(); tint('#1F2550', .92);
  sunburst(W / 2, H / 2 + 40, 18, ['#2F3C7A', '#26306A'], T * 8, .5);
  // postcards orbit in
  const pc = [['ROMA', '#F7C51E', -620, -250, -12], ['TOKYO', '#F7738A', 600, -260, 10], ['LIMA', '#4DB57A', -660, 250, 8], ['BALI', '#B04FE6', 640, 240, -9]];
  pc.forEach(([t, c, x, y, r], i) => { const k = seg(T, .1 + i * .08, .6 + i * .08, eout); if (k > 0) sfPostcard(W / 2 + x * k, H / 2 + 40 + y * k, 170, 118, r * k + Math.sin(T * 2 + i) * 3, t, c); });
  const k1 = seg(T, .05, .55, x => backOut(x, 2.2));
  if (k1 > 0) {
    push(W / 2, 300, k1);
    letters('COPILOT QUEST', 0, 0, 132, { font: MARKER, align: 'center', fill: G_RIB, stroke: true });
    pop();
  }
  if (T > .45) { const k = seg(T, .45, .8, x => backOut(x, 2)); push(W / 2, 420, k); paint(rrPts(-300, -48, 600, 70, 35), { fill: PAL.cpYellow, sw: 3, shade: false }); letters('EPISODE 1 · ENTER COPILOT', 0, 2, 40, { font: MARKER, align: 'center', shadow: false }); pop(); }
  sfBuddy(W / 2, 610, 120 + Math.sin(T * 4) * 4, T, seg(T, .55, 1.0));
  wpop('Mission: Save Sofia\'s First Day Back', W / 2, 830, 52, .95, T, { fill: '#FFF5E2', dur: .3 });
  wpop('6 months · 12 countries · 1 very full inbox', W / 2, 910, 34, 1.3, T, { fill: '#BFE3FA', dur: .3, font: HAND, weight: 700 });
}

// ---------- 1a: the sabbatical — six months, twelve countries (local 0 – 7.6) ----------
function sfPlane(x, y, s, rot) {
  push(x, y, s, 1, rot);
  paint([[-.2, -.1], [.3, -1.1], [.55, -1.1], [.4, -.1]], { fill: '#C9CED6', sw: 2.2, shade: false, smooth: false });
  paint([[-.2, .1], [.3, 1.1], [.55, 1.1], [.4, .1]], { fill: '#C9CED6', sw: 2.2, shade: false, smooth: false });
  paint(ellPts(0, 0, 1.2, .26, 20), { fill: '#FFFFFF', sw: 2.4, shade: false });
  paint([[-1.0, 0], [-1.3, -.45], [-1.1, -.45], [-.75, 0]], { fill: PAL.cpSky, sw: 2, shade: false, smooth: false });
  pop();
}
function sTravel(T) {
  // flight route (ROMA → TOKYO → LIMA → BALI)
  const P = [[150, 420], [430, 560], [1470, 470], [830, 880], [1640, 860]];
  const at = u => {
    const n = P.length - 1, f = clamp(u) * n, i = Math.min(n - 1, Math.floor(f)), t = f - i;
    const a = P[i], b = P[i + 1], c = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 170];
    return [mix(mix(a[0], c[0], t), mix(c[0], b[0], t), t), mix(mix(a[1], c[1], t), mix(c[1], b[1], t), t)];
  };
  const fly = seg(T, .2, 4.1, eio);
  const iris = seg(T, 4.45, 5.05, eio);
  if (iris < 1) {
    paper('#BFE3FA');
    C.save(); C.globalAlpha = .5;
    for (let i = 0; i < 14; i++) ink(arcPts((i * 337) % W, 120 + (i * 211) % 880, 30, 8, 200, 340, 8), { closed: false, w: 2, col: '#FFFFFF' });
    C.restore();
    // continents
    paint([[230, 380], [700, 330], [760, 640], [520, 720], [260, 620]], { fill: '#F3E6C8', sw: 2.6, hatch: { ang: 30, gap: 26, op: .12 } });
    paint([[1180, 300], [1760, 330], [1720, 640], [1300, 620], [1160, 480]], { fill: '#F3E6C8', sw: 2.6, hatch: { ang: 30, gap: 26, op: .12 } });
    paint([[640, 740], [1000, 720], [1020, 1040], [700, 1060]], { fill: '#F3E6C8', sw: 2.6, hatch: { ang: 30, gap: 26, op: .12 } });
    paint([[1440, 760], [1860, 770], [1820, 1000], [1460, 990]], { fill: '#F3E6C8', sw: 2.6, hatch: { ang: 30, gap: 26, op: .12 } });
    // landmarks
    sfColosseum(470, 640, 80); sfFuji(1470, 600, 80); sfMachu(830, 1000, 70); sfPalm(1650, 990, .42, T);
    // dashed trail
    C.save(); C.setLineDash([16, 14]); C.lineWidth = 5; C.strokeStyle = PAL.cpPink; C.beginPath();
    for (let i = 0; i <= 120; i++) { const u = i / 120 * fly; const p = at(u); i ? C.lineTo(p[0], p[1]) : C.moveTo(p[0], p[1]); }
    C.stroke(); C.restore();
    // stamps as the plane arrives
    [['ROMA', '#E3243B', 470, 470, -10, .25], ['TOKYO', PAL.cpPurple, 1470, 350, 8, .5], ['LIMA', '#3C9A64', 820, 720, -6, .75], ['BALI', '#E07A1F', 1660, 600, 10, .92]]
      .forEach(([l, c, x, y, r, u]) => sfStampMark(x, y, 76, l, c, r, seg(fly, u - .02, u + .08)));
    if (fly > 0 && fly < 1) { const p = at(fly), q = at(Math.min(1, fly + .01)); sfPlane(p[0], p[1], 46, Math.atan2(q[1] - p[1], q[0] - p[0]) / D2R); }
    else if (fly >= 1 && T < 4.38) sfPlane(P[4][0], P[4][1], 46 * (1 - seg(T, 4.1, 4.4)), 0);
  }
  if (iris > 0) {
    C.save(); path(ellPts(960, 560, 1300 * iris, 1300 * iris, 60)); C.clip();
    C.fillStyle = lg(0, 0, 0, 720, ['#FFC98B', '#FFE6B8', '#BFE3FA']); C.fillRect(0, 0, W, H);
    sfSun(1560, 220, 90, T);
    sfSea(640, T);
    paint([[-40, 820], [700, 790], [1300, 800], [W + 40, 820], [W + 40, H + 40], [-40, H + 40]], { fill: '#F3D9A4', sw: 2.6, hatch: { ang: 10, gap: 30, op: .12 } });
    sfPalm(470, 960, 1.05, T, 1); sfPalm(1450, 960, 1.05, T, -1);
    // sun lounger + Sofia, reclined with arms behind her head
    const ahh = sfTalk(T, 5.4, VOD.ahh, 'O');
    const HX = 840, HY = 822;
    sfLounger(HX, HY, 55);
    push(HX - 6, HY + 10, 1, 1, -55);
    person(0, 3.05 * 76, 76, { look: 'sofiaBeach', pose: { lSh: 165, lEl: 125, rSh: 165, rEl: 125, lHip: -46, lKn: 32, rHip: 50, rKn: -38, tilt: -4 + Math.sin(T * 1.5) * 2 }, eyes: 'closed', mouth: ahh || 'smile' });
    pop();
    sfCocktail(1290, 905, T);
    paint(ellPts(1170, 925, 34, 13, 16), { fill: PAL.cpPink, sw: 2.2, shade: false });
    paint(ellPts(1215, 945, 34, 13, 16), { fill: PAL.cpPink, sw: 2.2, shade: false });
    C.restore();
    if (iris < 1) ink(ellPts(960, 560, 1300 * iris, 1300 * iris, 60), { w: 5 });
  }
  wpop('6 MONTHS OFF', 360, 150, 80, .35, T, { rot: -5, fill: G_WARM, until: 4.5 });
  wpop('12 COUNTRIES', 1520, 160, 80, 1.25, T, { rot: 4, fill: G_COOL, until: 4.5 });
  wpop('0 EMAILS', 960, 300, 120, 3.75, T, { rot: -3, fill: G_RIB, until: 4.55 });
  wpop('Pure bliss…', 960, 150, 72, 5.55, T, { rot: -2, fill: G_SUN, font: HAND, weight: 700 });
}

// ---------- 1b: Sofia returns (local 2.2 – 13.6) ----------
function sReturn(T) {
  cam(1, 0, 0, 0, () => {
    sfOffice(T, { win: [90, 110, 540, 420], clockAt: [660, 520], plantAt: 1840, board: [700, 150, 420, 300] });
    sfDesk(1150, 640, 760);
    sfMonitor(1520, 646, 440, 260, (x, y, w, h) => {
      C.fillStyle = lg(x, y, x + w, y + h, ['#0F6CBD', '#2B4FA8']); C.fillRect(x, y, w, h);
      appTile('win', x + w / 2, y + h * .38, 70);
      letters('Welcome back, Sofia', x + w / 2, y + h * .75, 26, { font: UI, weight: 600, align: 'center', fill: '#fff', shadow: false });
    });
    sfMug(1250, 640, 40, T);
    sfBackpack(1820, 900, 70 * seg(T, 5.0, 5.4, x => backOut(x, 2)));
    // Sofia: drags herself in, still on holiday time
    const wk = seg(T, 2.2, 5.0), sx = mix(-200, 1000, eout(wk)), walking = wk < .95;
    shadowE(sx, 905, 110);
    let pose = walking ? blendPose(sfWalk(T, 1.25), { tilt: 7, lean: 4 }, .7) : sfIdle(T, 0, { tilt: 5, lean: 3 });
    let eyes = 'narrow', mouth = 'flat', brows = 'worry', turn = 0, hands = {};
    const yawn = seg(T, 5.2, 5.6, eout) * (1 - seg(T, 6.0, 6.4));
    if (yawn > 0) { pose = blendPose(pose, { lSh: 150, lEl: 30, rSh: 150, rEl: 30, tilt: -6, bob: .06, lean: -3 }, yawn); if (yawn > .5) { eyes = 'closed'; mouth = 'O'; } }
    const glad = seg(T, 9.3, 9.6, eout) * (1 - seg(T, 11.4, 11.7));
    if (glad > 0) { pose = blendPose(pose, { lSh: 30, lEl: 40, rSh: 30, rEl: 40, tilt: -4, lean: -1 }, glad); eyes = 'happy'; brows = null; mouth = 'smile'; }
    const head = seg(T, 11.6, 11.9, eout) * (1 - seg(T, 13.4, 13.7));
    if (head > 0) { pose = blendPose(pose, { lSh: 120, lEl: 120, rSh: 120, rEl: 120, tilt: Math.sin(T * 5) * 6 }, head); if (head > .5) { eyes = 'spiral'; brows = 'worry'; mouth = 'wobble'; } }
    mouth = sfTalk(T, 9.3, VOD.good, glad > .5 ? 'grin' : 'wobble') || mouth;
    person(sx, 905, 96, { look: 'sofia', pose, eyes, mouth, brows, turn, hands, sway: Math.sin(T * 2) * 4 });
    if (walking) sfMug(sx + 150, 640, 34, T);
  });
  wpop('DAY 1 BACK', 420, 170, 80, 3.2, T, { rot: -5, fill: G_WARM, until: 9.2 });
  wpop('6 MONTHS BEHIND', 1540, 175, 74, 5.96, T, { rot: 4, fill: G_COOL, until: 9.2 });
  if (T > 7.86 && T < 9.2) {
    const k = seg(T, 7.86, 8.1, x => backOut(x, 2));
    push(420, 300, k, 1, -3);
    letters('CATCH-UP MODE', 0, 0, 46, { font: MARKER, align: 'center', fill: '#FFF5E2', stroke: true });
    paint(rrPts(-200, 22, 400, 40, 20), { fill: '#2B2233', sw: 2.6, shade: false, base: 1 });
    paint(rrPts(-194, 28, 12 + 6 * Math.abs(Math.sin(T * 6)), 28, 14), { fill: PAL.cpRed, sw: 1.4, shade: false });
    letters('0%', 0, 54, 26, { font: HAND, weight: 700, align: 'center', fill: '#FFF5E2', shadow: false });
    pop();
  }
  wpop('WHERE DO I START?', 1400, 250, 70, 11.7, T, { rot: 3, fill: G_WARM, until: 13.5 });
}

// ---------- 1c: daydreaming of the beach — pooped (local 0 – 6.46) ----------
function sDream(T) {
  sfOffice(T, { win: [90, 110, 540, 420], clockAt: [1500, 110], plantAt: 1840, board: false });
  const popT = 2.9, bub = seg(T, .15, .9) * (T < popT ? 1 : 0);
  // Sofia slumped at her desk
  const after = T >= popT;
  let pose = sfIdle(T, .3, { lSh: 30, lEl: 130, rSh: 22, rEl: 20, tilt: -10, lean: -2 });
  if (after) pose = blendPose(pose, { lSh: 20, lEl: 20, rSh: 20, rEl: 20, tilt: 9 + Math.sin(T * 3) * 2, lean: 5 }, seg(T, popT, popT + .3, eout));
  const eyes = !after ? 'happy' : T < 3.6 ? 'shock' : 'spiral';
  const mouth = sfTalk(T, .25, VOD.dream, 'smile') || (!after ? 'smile' : T < 3.6 ? 'O' : 'wobble');
  person(620, 1090, 90, { look: 'sofia', pose, eyes, mouth, brows: after ? 'worry' : null, sway: Math.sin(T * 1.6) * 3 });
  sfDesk(240, 830, 860);
  sfLaptopBack(890, 830, 300, 190);
  sfMug(400, 830, 40, T);
  // paper avalanche on the desk
  for (let i = 0; i < 7; i++) paint(rrPts(1010 + (i % 2) * 10, 822 - i * 16, 120, 14, 3), { fill: i % 3 ? '#FFFFFF' : '#FFF5E2', sw: 2, shade: false });
  // daydream bubble
  sfThought(1330, 380, 380, 240, 760, 470, bub, () => {
    C.save(); path(ellPts(0, 0, 350, 214, 50)); C.clip();
    C.fillStyle = lg(0, -220, 0, 60, ['#FFC98B', '#BFE3FA']); C.fillRect(-400, -240, 800, 480);
    sfSun(170, -110, 46, T);
    sfSea(30, T);
    paint([[-400, 120], [400, 105], [400, 240], [-400, 240]], { fill: '#F3D9A4', sw: 2.4, shade: false });
    sfPalm(-210, 190, .55, T, 1);
    push(-90, 150, .42); sfLounger(0, 0, 55); push(-6, 10, 1, 1, -55);
    person(0, 3.05 * 76, 76, { look: 'sofiaBeach', pose: { lSh: 165, lEl: 125, rSh: 165, rEl: 125, lHip: -46, lKn: 32, rHip: 50, rKn: -38, tilt: -4 }, eyes: 'closed', mouth: 'smile' });
    pop(); pop();
    letters('BALI', 120, 190, 40, { font: MARKER, align: 'center', fill: PAL.cpPink, shadow: false });
    C.restore();
    for (let i = 0; i < 3; i++) letters('♥', -280 + i * 50, -150 - Math.sin(T * 3 + i) * 10, 34, { fill: PAL.cpPink, shadow: false });
  });
  // POP — reality bites
  if (T > popT && T < popT + .5) { const u = seg(T, popT, popT + .5); for (let i = 0; i < 10; i++) { const a = i * 36 * D2R; spark(1330 + Math.cos(a) * 300 * eout(u), 380 + Math.sin(a) * 200 * eout(u), 20 * (1 - u), [PAL.cpSky, PAL.cpYellow, PAL.cpPink][i % 3], T * 200); } }
  sfPing(1360, 300, 1.3, 'Teams · Project Atlas', '47 new messages', seg(T, popT - .05, popT + .2));
  sfPing(1400, 450, 1.3, 'Teams · Hannah', 'Did you see the deck?', seg(T, 3.3, 3.55));
  sfPing(1440, 600, 1.3, 'Teams · Leadership', '@Sofia quick catch-up?', seg(T, 3.7, 3.95));
  // battery draining
  if (after) {
    const lvl = mix(1, .01, seg(T, 3.1, 5.4, eio)), k = seg(T, 3.0, 3.25, x => backOut(x, 2));
    push(330, 330, k, 1, -4);
    paint(rrPts(-90, -40, 180, 80, 14), { fill: '#FFFFFF', sw: 3, shade: false, base: 1 });
    paint(rrPts(92, -16, 16, 32, 5), { fill: '#2B2233', sw: 2, shade: false });
    paint(rrPts(-82, -32, 164 * lvl + 2, 64, 9), { fill: lvl > .4 ? '#4DB57A' : lvl > .15 ? '#F7C51E' : PAL.cpRed, sw: 1.4, shade: false });
    letters(Math.max(1, Math.round(lvl * 100)) + '%', 0, 82, 40, { font: MARKER, align: 'center', fill: lvl > .15 ? '#2B2233' : PAL.cpRed, stroke: false, shadow: false });
    pop();
  }
  wpop('JET-LAGGED', 360, 170, 70, 3.15, T, { rot: -6, fill: G_COOL });
  wpop('SWAMPED', 900, 170, 80, 3.95, T, { rot: 3, fill: G_WARM });
  wpop('POOPED!', 960, 520, 140, 5.4, T, { rot: -4, fill: G_RIB, dur: .25 });
}

// ---------- 2: the inbox avalanche (11.3 – 17.4) ----------
function sInbox(T) {
  const sh = T > 16.0 && T < 16.5 ? shake(T, 16.0, 10) : null;
  paper(); tint('#DCE8F5', .6);
  const z = 1 + seg(T, 11.3, 17.4) * .06;
  cam(z, 0, 0, 0, () => {
    const x = 470, y = 70, w = 1360, h = 930;
    sfWin(x, y, w, h, 'Outlook — Inbox', MSC.out, { icon: (a, b) => sfOutlookIcon(a, b) });
    // folder pane
    C.save(); C.fillStyle = '#EEF3FA'; C.fillRect(x + 3, y + 58, 260, h - 61); C.restore();
    const n = Math.round(mix(0, 3482, seg(T, 11.6, 13.4, x => x * x)) + (T > 13.4 ? (T - 13.4) * 37 : 0));
    [['Inbox', n.toLocaleString('en-GB')], ['Focused', '???'], ['Other', '!!!'], ['Flagged', Math.round(n * .93).toLocaleString('en-GB')], ['Archive', '0']].forEach(([t, v], i) => {
      if (i === 0) { C.save(); C.fillStyle = 'rgba(15,108,189,.15)'; C.fillRect(x + 12, y + 80, 240, 54); C.restore(); }
      letters(t, x + 30, y + 116 + i * 64, 26, { font: UI, weight: i ? 400 : 700, shadow: false });
      letters(v, x + 244, y + 116 + i * 64, 24, { font: UI, weight: 700, align: 'right', shadow: false, fill: i < 4 ? '#E3243B' : '#5A5A6E' });
    });
    // scrolling mail list
    C.save(); C.beginPath(); C.rect(x + 263, y + 58, w - 266, h - 61); C.clip();
    const speed = 40 + seg(T, 11.5, 13.5) * 900, off = (T - 11.3) * speed;
    const i0 = Math.floor(off / 72);
    for (let r = -1; r < 14; r++) { const i = i0 + r; sfMail(x + 270, y + 66 + r * 72 - (off % 72), w - 280, i, { h: 70 }); }
    // the big "HIGH IMPORTANCE" redwash
    const red = seg(T, 15.95, 16.15);
    if (red > 0) { C.globalAlpha = .18 * red * (.7 + .3 * Math.sin(T * 18)); C.fillStyle = '#E3243B'; C.fillRect(x, y, w, h); }
    C.restore();
  });
  // Sofia panics bottom-left
  const pk = seg(T, 11.35, 11.7, x => backOut(x, 2));
  shadowE(250, 1040, 120);
  const panic = T > 12.8;
  person(250 + (panic ? Math.sin(T * 40) * 3 : 0), 1060 + (1 - pk) * 400, 82, {
    look: 'sofia', eyes: T > 14.2 ? 'spiral' : 'shock', brows: 'worry',
    mouth: sfTalk(T, 11.45, VOD.emails, 'O') || 'wobble',
    pose: { lSh: 150, lEl: 70, rSh: 150, rEl: 70, tilt: Math.sin(T * 6) * 5, bob: .03 },
  });
  // flying envelopes
  for (let i = 0; i < 14; i++) {
    const t0 = 12.6 + i * .2, u = (T - t0) / 1.4; if (u < 0 || u > 1) continue;
    push(mix(1300, -100 + hash(i) * 600, u), 300 - Math.sin(u * Math.PI) * 220 + i * 30, 1, 1, u * 300 * (hash(i + 2) - .5));
    paint(rrPts(-44, -30, 88, 60, 6), { fill: '#FFFFFF', sw: 2.4, shade: false }); ink([[-44, -28], [0, 6], [44, -28]], { closed: false, w: 2.4 });
    paint(ellPts(30, -24, 12, 12, 10), { fill: '#E3243B', sw: 1.6, shade: false });
    pop();
  }
  wpop('HOW MANY?!', 225, 200, 60, 12.85, T, { rot: -7, fill: G_WARM, until: 14.1 });
  wpop('THOUSANDS.', 225, 210, 62, 14.05, T, { rot: -5, fill: '#E3243B', until: 17.4 });
  if (T > 15.95) stamp('HIGH IMPORTANCE', 1150, 560, 120, 15.95, T, -8, '#E3243B');
}

// ---------- 3: calendar chaos (17.4 – 21.5) ----------
function sCal(T) {
  paper(); tint('#ECE6F6', .6);
  const sk = T > 18.9 && T < 19.4;
  cam(1.02 + seg(T, 17.4, 21.5) * .05, sk ? Math.sin(T * 60) * 8 : 0, 0, 0, () => {
    const x = 430, y = 60, w = 1420, h = 960;
    sfWin(x, y, w, h, 'Calendar — Week of your return', '#0F6CBD', { icon: (a, b) => { paint(rrPts(a - 17, b - 16, 34, 32, 5), { fill: '#fff', sw: 1.6, shade: false }); letters('31', a, b + 9, 18, { font: UI, weight: 800, align: 'center', fill: MSC.out, shadow: false }); } });
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], cw = (w - 120) / 5, gy = y + 120, rh = 80;
    days.forEach((d, i) => letters(d, x + 100 + cw * i + cw / 2, y + 100, 28, { font: UI, weight: 700, align: 'center', shadow: false, fill: i === 0 ? MSC.out : '#2B2233' }));
    for (let r = 0; r < 10; r++) { line([x + 90, gy + r * rh], [x + w - 10, gy + r * rh], { w: 1, op: .15 }); letters((9 + r) + ':00', x + 78, gy + r * rh + 26, 20, { font: UI, align: 'right', shadow: false, fill: '#5A5A6E' }); }
    // events drop in, stacking and overlapping
    const ev = [];
    const labels = ['Weekly sync', 'Project Atlas', '1:1 Hannah', 'Client: Contoso', 'All hands', 'Stand-up', 'Budget review', 'Steering group', 'Brainstorm', 'Ops review', 'Townhall', 'Coffee chat', 'Design crit', 'QBR prep'];
    const cols = ['#0F6CBD', '#6264A7', '#E0592A', '#21A366', '#B04FE6', '#F7738A', '#38C2F8'];
    for (let i = 0; i < 34; i++) {
      const d = i % 5, r = Math.floor(hash(i * 3 + 1) * 8), lane = Math.floor(hash(i + 9) * 3);
      ev.push([d, r + hash(i + 4) * .4, lane, labels[i % labels.length], cols[i % cols.length], i]);
    }
    ev.forEach(([d, r, lane, lb, col, i]) => {
      const t0 = 17.5 + i * .045, k = seg(T, t0, t0 + .3, x => backOut(x, 1.8)); if (k <= 0) return;
      const ex = x + 100 + cw * d + 6 + lane * cw * .22, ey = gy + r * rh - (1 - k) * 300, ew = cw * .62, eh = rh * (1 + (i % 3) * .5);
      sfEvent(ex, ey, ew, eh, col, lb, { rec: i % 2 === 0, tent: true, q: T > 20.1, op: .92 });
    });
    // double-booked clash marker
    if (T > 18.9) {
      const k = seg(T, 18.9, 19.1, x => backOut(x, 2.5));
      for (const [cx, cy] of [[x + 100 + cw * 1 + 110, gy + 2.4 * rh], [x + 100 + cw * 3 + 120, gy + 5 * rh]]) {
        paint(starPts(cx, cy, 70 * k, 34 * k, 9, T * 30), { fill: '#E3243B', sw: 2.6, shade: false, smooth: false });
        letters('!!', cx, cy + 16, 44 * k, { font: MARKER, align: 'center', fill: '#fff', shadow: false });
      }
    }
  });
  // Teams pings stack on the right
  ['Are you joining?', 'You\'re double-booked', 'Meeting started 5 min ago', 'Can we move this?'].forEach((t, i) => sfPing(1650, 250 + i * 120, 1, ['Raj', 'Outlook', 'Teams', 'Maya'][i], t, seg(T, 18.2 + i * .45, 18.45 + i * .45)));
  // Sofia, frazzled
  const pk = seg(T, 17.45, 17.8, x => backOut(x, 2));
  person(240, 1080 + (1 - pk) * 400, 80, { look: 'sofia', eyes: T > 19 ? 'spiral' : 'shock', brows: 'worry', mouth: 'wobble', pose: { lSh: 120, lEl: 120, rSh: 120, rEl: 120, tilt: Math.sin(T * 5) * 6 } });
  wpop('RECURRING', 260, 160, 64, 17.55, T, { rot: -6, fill: G_COOL, until: 21.5 });
  if (T > 18.88) stamp('DOUBLE BOOKED', 1100, 520, 110, 18.88, T, 7, '#E3243B');
  wpop('0 accepted', 270, 300, 56, 20.1, T, { rot: 4, fill: G_WARM, until: 21.5 });
}
