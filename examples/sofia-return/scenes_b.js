// scenes_b.js — colleagues, Copilot-session hook, Copilot to the rescue, "I've got this", end card.
'use strict';

// ---------- 4: colleagues at their desks, already flying with Copilot (local 21.5 – 33.4) ----------
function sfLaptopBack(x, by, w, h) {
  paint([[x - w / 2 - 10, by], [x + w / 2 + 10, by], [x + w / 2, by - 10], [x - w / 2, by - 10]], { fill: '#AEB4C2', sw: 2.4, shade: false, smooth: false });
  paint(rrPts(x - w / 2, by - 10 - h, w, h, 10), { fill: '#C9CED6', sw: 2.6, shade: false });
  mark(x, by - 10 - h / 2, h * .32, { sw: .8 });
}
function sColleagues(T) {
  // camera drifts to whoever is speaking, then pulls in on Sofia for "Everyone knows something I don't"
  const foc = T < 25.1 ? 0 : T < 28.4 ? 1 : T < 30.9 ? 2 : 3;
  const targets = [[-80, 0, 1.06], [0, 0, 1.06], [80, 0, 1.06], [360, 120, 1.28]];
  const prevT = targets[Math.max(0, foc - 1)], cur = targets[foc], st = [21.5, 25.1, 28.4, 30.9][foc], k = seg(T, st, st + .6, eio);
  const cz = mix(prevT[2], cur[2], k), cx = mix(prevT[0], cur[0], k), cy = mix(prevT[1], cur[1], k);
  cam(cz, cx, cy, 0, () => {
    sfOffice(T, { win: [700, 90, 900, 380], clockAt: [300, 160], plantAt: 1860, board: false });
    const crew = [
      ['raj', 860, 21.7, VOD.c1, 0], ['maya', 1270, 25.3, VOD.c2, 1.7], ['leo', 1680, 28.65, VOD.c3, 3.1],
    ];
    const DY = 830;
    // chair backs
    crew.forEach(([, x]) => { paint(rrPts(x - 78, 640, 156, 220, 30), { fill: '#3B4A6B', sw: 2.6, shade: false }); });
    crew.forEach(([lk, x, t0, d, ph]) => {
      const talking = T >= t0 - .1 && T < t0 + d + .2;
      const bounce = talking ? Math.max(0, Math.sin((T - t0) * 7)) * .04 * (1 - seg(T, t0 + .8, t0 + 1.2)) : 0;
      let pose = sfIdle(T, ph, { lSh: 34 + Math.sin(T * 9 + ph) * 4, lEl: 95, rSh: 34 + Math.cos(T * 9 + ph) * 4, rEl: 95, bob: bounce + Math.sin(T * 2.2 + ph) * .02 });
      if (talking) pose = blendPose(pose, { rSh: 120, rEl: 60, lSh: 34, lEl: 95, tilt: 6 }, seg(T, t0, t0 + .25, eout));
      person(x, 1045, 66, { look: lk, dir: -1, pose, eyes: talking && (T - t0) > d * .6 ? 'happy' : sfBlink(T, ph) || 'open', mouth: sfTalk(T, t0, d, 'grin') || 'smile', hands: talking ? { r: 'peace' } : {}, sway: Math.sin(T * 2 + ph) * 2 });
    });
    // one long bench desk with pod dividers, laptops and mugs
    sfDesk(600, DY, 1260);
    [1065, 1475].forEach(dx => paint(rrPts(dx - 8, DY - 150, 16, 150, 6), { fill: '#BFD3E6', sw: 2.2, shade: false }));
    crew.forEach(([, x], i) => { sfLaptopBack(x - 120, DY, 150, 100); sfMug(x + 110, DY, 26, T + i); });
    // each colleague's Copilot "flex" pops up from their laptop
    const p1 = seg(T, 21.8, 22.3, x => backOut(x, 2));
    if (p1 > 0) {
      push(860, 330, p1, 1, -4);
      sfScreenProp(0, 0, 300, 190, 0, (x, y, w, h) => { sfSlide(x, y, w, h, 'Client meeting prep', seg(T, 22.4, 24.0), T); });
      sfWatch(170, -110, 44, seg(T, 22.6, 24.6), null);
      letters('5 min', 170, -40, 30, { font: MARKER, align: 'center', fill: PAL.cpGreen, stroke: true });
      pop();
    }
    const p2 = seg(T, 25.4, 25.9, x => backOut(x, 2));
    if (p2 > 0) {
      push(1270, 320, p2, 1, 3);
      sfScreenProp(0, 0, 260, 200, 0, (x, y, w, h) => sfDoc(x, y, w, h, seg(T, 25.8, 27.6), T > 27.2));
      paint(rrPts(-150, 116, 300, 50, 25), { fill: PAL.cpYellow, sw: 2.4, shade: false });
      letters('Summary ✓', 0, 150, 28, { font: HAND, weight: 700, align: 'center', shadow: false });
      pop();
    }
    const p3 = seg(T, 28.7, 29.2, x => backOut(x, 2));
    if (p3 > 0) {
      push(1660, 330, p3, 1, -3);
      sfPing(0, -60, .85, 'Copilot', 'Catch up: 12 missed threads', 1);
      sfPing(0, 30, .85, 'Copilot', 'Top 3 actions for you', seg(T, 29.3, 29.6));
      pop();
    }
    // dotted "beam" from each laptop up to its pop-up
    [[860, p1], [1270, p2], [1660, p3]].forEach(([x, p]) => { if (p > 0) { C.save(); C.globalAlpha = .5 * clamp(p); C.setLineDash([6, 10]); line([x - 120, DY - 115], [x, 450], { w: 2.4, col: PAL.cpSky }); C.restore(); } });
    // Sofia standing by the near end, looking from one to another
    const sx = 360;
    shadowE(sx, 990, 100);
    const pose = foc === 3 ? blendPose(sfIdle(T, .5), { lSh: 30, lEl: 130, rSh: 22, rEl: 20, tilt: -10, lean: -2 }, seg(T, 30.9, 31.3, eout)) : sfIdle(T, .5, { tilt: [6, 0, -4][foc] });
    person(sx, 990, 84, { look: 'sofia', dir: 1, pose, eyes: foc === 3 ? 'narrow' : 'open', brows: 'worry', mouth: sfTalk(T, 31.15, VOD.think, 'flat') || (foc === 3 ? 'flat' : 'O'), hands: {}, turn: foc === 3 ? 0 : .35 });
    // thought cloud: colleagues' magic she doesn't know yet
    const tk = seg(T, 31.0, 31.6);
    sfThought(sx + 300, 330, 240, 150, sx + 70, 360, tk, () => {
      const ap = ['word', 'ppt', 'teams'];
      ap.forEach((a, i) => appTile(a, -130 + i * 130, -20 + Math.sin(T * 4 + i) * 6, 70));
      letters('???', 0, 100, 60, { font: MARKER, align: 'center', fill: PAL.cpPink, shadow: false });
    });
  });
  // labels
  wpop('5 MINUTES!', 860, 150, 64, 23.6, T, { rot: -5, fill: G_SUN, until: 25.2 });
  wpop('WHOLE PROJECT, SUMMARISED', 1190, 150, 56, 26.6, T, { rot: 3, fill: G_COOL, until: 28.5 });
  wpop('CAUGHT UP?', 1580, 150, 64, 29.6, T, { rot: -4, fill: G_WARM, until: 30.9 });
}

// ---------- 5: she spots Hannah's session — 'Microsoft 365 Copilot? What's that?' (local 33.4 – 46.1) ----------
function sLead(T) {
  const zk = seg(T, 36.0, 36.8, eio);
  cam(1 + zk * .14, -zk * 120, 0, 0, () => {
    sfOffice(T, { win: [100, 100, 520, 400], clockAt: [1830, 130], plantAt: 1880, board: false });
    sfDesk(700, 760, 1220);
    sfMonitor(1290, 766, 760, 420, (x, y, w, h) => {
      C.fillStyle = MSC.out; C.fillRect(x, y, w, 46);
      letters('Calendar — Tomorrow', x + 20, y + 32, 24, { font: UI, weight: 700, fill: '#fff', shadow: false });
      const fk = seg(T, 36.1, 36.6, eout);
      const rows = [['9:00', 'Weekly sync', '#8A8FA3'], ['10:00', 'Intro to Microsoft 365 Copilot — Hannah', '#B04FE6'], ['11:30', 'Ops review', '#8A8FA3'], ['13:00', 'Budget check-in', '#8A8FA3'], ['15:00', 'Vendor call', '#8A8FA3']];
      rows.forEach(([tm, lab, col], i) => {
        const isIt = i === 1, ry = y + 62 + i * 70;
        letters(tm, x + 20, ry + 38, 22, { font: UI, weight: 700, fill: '#5A5A6E', shadow: false });
        C.save(); C.fillStyle = 'rgba(43,34,51,.08)'; C.fillRect(x + 90, ry - 4, w - 100, 1.5); C.restore();
        if (isIt) {
          C.save(); C.globalAlpha = fk; C.fillStyle = rg(x + w / 2, ry + 28, w * .6, ['rgba(247,197,30,.6)', 'rgba(247,197,30,0)']); C.fillRect(x, ry - 24, w, 110); C.restore();
          sfEvent(x + 96, ry, w - 116, 58, col, lab);
          if (fk > 0) mark(x + w - 50, ry + 29, 44 * backOut(fk, 2), { rot: Math.sin(T * 3) * 8 });
        } else { sfEvent(x + 96, ry + 4, (w - 116) * (.5 + (i % 2) * .15), 50, col, lab, { op: 1 - fk * .5 }); }
      });
    });
    // sticky note slaps onto the bezel
    const sk = seg(T, 39.1, 39.35, x => backOut(x, 2.6));
    if (sk > 0) sfSticky(1590, 300, 120 * sk, 8 + Math.sin(T * 3) * 1.5, [['COPILOT', .36], ['SESSION', .36], ['TOMORROW!', .36, '#E3243B']]);
    // desk calendar flips to tomorrow 10:00
    if (T > 40.15) {
      const ck = seg(T, 40.15, 40.45, x => backOut(x, 2));
      push(840, 640, ck, 1, -4);
      paint(rrPts(-80, -80, 160, 160, 12), { fill: '#FFFFFF', sw: 3, shade: false, base: 1 });
      C.save(); C.fillStyle = '#B04FE6'; C.fillRect(-80, -80, 160, 40); C.restore();
      letters('TOMORROW', 0, -50, 22, { font: UI, weight: 800, align: 'center', fill: '#fff', shadow: false });
      letters('10:00', 0, 40, 56, { font: MARKER, align: 'center', shadow: false });
      pop();
    }
    // Sofia: weary → spots it → "Ooh!" → "Microsoft 365 Copilot? What's that?" → "Let's find out!"
    const yes = seg(T, 37.2, 37.5, x => backOut(x, 2)), hmm = seg(T, 40.0, 40.35, eout), pump = seg(T, 43.95, 44.25, x => backOut(x, 2));
    const sx = 470;
    shadowE(sx, 980, 110);
    let pose = sfIdle(T, 1.2, { lSh: 20, lEl: 20, rSh: 20, rEl: 20, tilt: 8, lean: 4 }); // weary slump
    if (T > 36.1) pose = blendPose(pose, { lSh: 15, lEl: 10, rSh: 75, rEl: 70, tilt: 10, lean: 4 }, seg(T, 36.1, 36.4, eout));
    if (yes > 0) pose = blendPose(pose, { lSh: 40, lEl: 140, rSh: 40, rEl: 140, tilt: -4, bob: .12 * Math.max(0, Math.sin((T - 37.2) * 8)), lean: -2 }, clamp(yes) * (1 - hmm));
    if (hmm > 0) pose = blendPose(pose, { lSh: 25, lEl: 95, rSh: 55, rEl: 150, tilt: 12 + Math.sin(T * 2.2) * 3, lean: 3 }, hmm * (1 - pump)); // hand on chin, pondering
    if (pump > 0) pose = blendPose(pose, { lSh: 160, lEl: 30, rSh: 160, rEl: 30, tilt: -4, bob: .18 * Math.max(0, Math.sin((T - 40.8) * 8)), lean: -2 }, clamp(pump));
    person(sx, 980, 92, {
      look: 'sofia', turn: .45, pose,
      eyes: pump > .3 ? (sfBlink(T) || 'star') : hmm > .3 ? (sfBlink(T) || 'open') : yes > .3 ? (sfBlink(T) || 'star') : T > 36.1 ? 'open' : (sfBlink(T) || 'open'),
      brows: pump > .3 ? null : hmm > .3 ? 'up' : yes > .3 || T > 36.1 ? null : 'worry',
      mouth: sfTalk(T, 37.1, VOD.session, 'grin') || sfTalk(T, 40.05, VOD.what, 'O') || sfTalk(T, 44.0, VOD.find, 'grin') || (pump > .3 ? 'grin' : hmm > .3 ? 'flat' : yes > .3 ? 'grin' : T > 36.1 ? 'O' : 'flat'),
      hands: pump > .3 || hmm > .3 || yes > .3 ? {} : T > 36.1 ? { r: 'point' } : {},
    });
  });
  wpop('OOH!', 1000, 110, 90, 37.2, T, { rot: -4, fill: G_SUN, until: 39.9 });
  wpop('Microsoft 365 Copilot?', 1060, 110, 70, 40.3, T, { rot: -3, fill: G_RIB, until: 43.85 });
  for (let i = 0; i < 3; i++) { const k = seg(T, 42.8 + i * .12, 43.1 + i * .12, x => backOut(x, 2.4)) * (1 - seg(T, 43.8, 44.0)); if (k > 0) letters('?', 640 + i * 70, 300 - i * 34 + Math.sin(T * 5 + i) * 6, 90 * k, { font: MARKER, fill: [PAL.cpSky, PAL.cpPink, PAL.cpYellow][i], stroke: true }); }
  wpop('LET\'S FIND OUT!', 1000, 120, 84, 44.05, T, { rot: 3, fill: G_SUN, until: 46.1 });
  for (let i = 0; i < 5; i++) if (T > 37.3 && (T < 40.0 || T > 44.0)) spark(1240 + Math.cos(i * 1.3 + T * 2) * 420, 420 + Math.sin(i * 2 + T * 2) * 220, 18 * seg(T, 37.3 + i * .06, 37.6 + i * .06, x => backOut(x, 2)), [PAL.cpYellow, PAL.cpSky, PAL.cpPink, PAL.cpGreen, PAL.cpPurple][i], T * 100);
}

// ---------- 6: Enter Copilot (39.6 – 62.4) ----------
const CP_BEATS = [[41.6, 'inbox'], [45.95, 'drafts'], [50.85, 'cal'], [52.9, 'avail'], [56.75, 'recap'], [59.95, 'brief']];
const CP_XP = [43.4, 48.1, 50.25, 51.9, 55.9, 58.75, 61.3];
function cpPanel(T) { let cur = CP_BEATS[0][1], t0 = CP_BEATS[0][0]; for (const [t, n] of CP_BEATS) if (T >= t) { cur = n; t0 = t; } return [cur, t0]; }

function sCopilot(T) {
  paper(); tint('#EAF2FC', .7);
  sunburst(330, 560, 20, ['#BFE3FA', '#E9DDF8', '#FFE8C2'], T * 6, .35);
  // ENTER COPILOT burst
  const ek = seg(T, 39.65, 40.1, x => backOut(x, 2.2)), eo = seg(T, 41.3, 41.7, eio);
  const bx = mix(W / 2, 360, eo), by = mix(480, 300, eo), bs = mix(230, 110, eo);
  if (ek > 0 && eo < 1) { C.save(); C.globalAlpha = (1 - eo) * .9; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + T; line([W / 2 + Math.cos(a) * 280 * ek, 480 + Math.sin(a) * 280 * ek], [W / 2 + Math.cos(a) * 520 * ek, 480 + Math.sin(a) * 520 * ek], { w: 6, col: [PAL.cpSky, PAL.cpYellow, PAL.cpPink, PAL.cpPurple][i % 4] }); } C.restore(); }
  // Sofia (left), relaxed and engaged
  const sk = seg(T, 41.2, 41.8, eout);
  if (sk > 0) {
    const sx = mix(-200, 300, sk);
    shadowE(sx, 1010, 100);
    const [pn, pt] = cpPanel(T);
    const nod = Math.max(0, Math.sin((T - pt) * 5)) * .04;
    person(sx, 1010, 80, { look: 'sofia', turn: .4, pose: sfIdle(T, 2, { rSh: 60, rEl: 70, bob: nod, tilt: 6 }), hands: { r: 'point' }, eyes: T - pt < .5 ? 'star' : sfBlink(T, 1) || 'happy', mouth: 'grin' });
  }
  sfBuddy(bx, by + Math.sin(T * 2) * 8, bs * ek, T, ek);
  if (eo < 1) wpop('ENTER COPILOT', W / 2, 850, 110, 40.05, T, { fill: G_RIB, stroke: true, until: 41.4 });

  // the big Copilot panel
  const pk = seg(T, 41.3, 41.75, x => backOut(x, 1.6));
  if (pk <= 0) return;
  const X = 620, Y = 110, PW = 1220, PH = 800;
  push(X + PW / 2, Y + PH / 2, .6 + .4 * pk); C.translate(-(X + PW / 2), -(Y + PH / 2));
  sfWin(X, Y, PW, PH, 'Microsoft 365 Copilot', lg(X, 0, X + PW, 0, ['#1552D6', '#6A5BD0', '#B04FE6']), { icon: (a, b) => mark(a, b, 40, {}) });
  const [pn, pt] = cpPanel(T);
  const prompts = { inbox: 'Summarise my inbox. What really matters?', drafts: 'Draft my replies and add my actions to Planner', avail: 'Find 30 min with Hannah this week for a catch-up', cal: 'Sort out my calendar clashes for this week', recap: 'Recap the last 6 months for me', brief: 'Prep me for Hannah\'s Copilot session' };
  sfPrompt(X + 30, Y + 80, PW - 60, prompts[pn], seg(T, pt + .05, pt + .75), T);
  const ck = seg(T, pt + .8, pt + 1.3, eout), cx0 = X + 30, cy0 = Y + 170, cw = PW - 60;
  C.save(); path(rrPts(X + 4, Y + 160, PW - 8, PH - 164, 14)); C.clip();
  C.translate(0, (1 - ck) * 40); C.globalAlpha = ck;
  if (pn === 'inbox') {
    const rows = [['Hannah (Mgr)', 'Copilot session tomorrow — please accept', 'Today'], ['Client: Contoso', 'Renewal decision needed by Friday', 'This week'], ['Project Atlas', 'You are the new sponsor — sign-off', 'This week']];
    letters('3 things that really matter', cx0, cy0 + 34, 34, { font: UI, weight: 700, shadow: false });
    rows.forEach(([f, s], i) => { const rk = seg(T, pt + 1.0 + i * .3, pt + 1.3 + i * .3, x => backOut(x, 1.8)); if (rk > 0) { push(cx0 + cw / 2, cy0 + 100 + i * 96, rk); sfMail(-cw / 2, -40, cw, i, { h: 84, hi: true, from: f, subj: s, flag: false, tick: true }); pop(); } });
    const ak = seg(T, pt + 2.5, pt + 3.1, eout);
    if (ak > 0) {
      const n = Math.round(mix(3482, 3479, ak));
      paint(rrPts(cx0, cy0 + 420, cw, 110, 16), { fill: '#EEF3FA', sw: 2, shade: false });
      letters(`${n.toLocaleString('en-GB')} others: newsletters, FYIs, auto-replies`, cx0 + 30, cy0 + 466, 28, { font: UI, weight: 600, shadow: false, fill: '#5A5A6E' });
      letters('→ filed to "Catch up later"', cx0 + 30, cy0 + 506, 26, { font: UI, shadow: false, fill: '#1C8FE3' });
      // stack of envelopes whooshing away
      for (let i = 0; i < 5; i++) { const u = seg(T, pt + 2.5 + i * .08, pt + 3.2 + i * .08, eio); if (u > 0 && u < 1) { C.save(); C.globalAlpha = 1 - u; paint(rrPts(cx0 + cw - 160 + u * 300, cy0 + 440 - u * 120 - i * 12, 70, 46, 6), { fill: '#fff', sw: 2, shade: false }); C.restore(); } }
    }
  } else if (pn === 'drafts') {
    // left: drafted replies, waiting for Sofia's review
    const lw = 610;
    letters('Replies drafted — ready for your review', cx0, cy0 + 34, 28, { font: UI, weight: 700, shadow: false });
    [['Hannah (Mgr)', 'RE: Intro to Microsoft 365 Copilot — see you there'], ['Client: Contoso', 'RE: Renewal decision by Friday']].forEach(([to, sj], i) => {
      const q = seg(T, pt + .85 + i * .3, pt + 1.25 + i * .3, x => backOut(x, 1.8)); if (q <= .02) return;
      push(cx0 + lw / 2, cy0 + 165 + i * 235, q); sfDraft(-lw / 2, -105, lw, 210, to, sj, seg(T, pt + 1.1 + i * .3, pt + 1.9 + i * .3), seg(T, pt + 2.0 + i * .15, pt + 2.35 + i * .15)); pop();
    });
    const nk = seg(T, pt + 2.3, pt + 2.7, eout);
    if (nk > 0) { C.save(); C.globalAlpha *= nk; letters('Nothing is sent until you approve it.', cx0 + 4, cy0 + 556, 24, { font: UI, weight: 600, shadow: false, fill: '#5A5A6E' }); C.restore(); }
    // right: Planner board, tasks fly in from the drafts
    const px = cx0 + lw + 40, pw2 = cw - lw - 40, bk = seg(T, pt + 2.6, pt + 3.0, eout);
    if (bk > 0) {
      C.save(); C.globalAlpha *= bk;
      paint(rrPts(px, cy0 + 4, pw2, 590, 16), { fill: '#F3F8F2', sw: 2.4, shade: false, base: 1 });
      C.save(); path(rrPts(px, cy0 + 4, pw2, 590, 16)); C.clip(); C.fillStyle = '#31752F'; C.fillRect(px, cy0 + 4, pw2, 60); C.restore();
      ink(rrPts(px, cy0 + 4, pw2, 590, 16), { w: 2.4 });
      paint(ellPts(px + 36, cy0 + 34, 15, 15, 14), { fill: '#fff', sw: 1.6, shade: false });
      ink([[px + 29, cy0 + 34], [px + 35, cy0 + 40], [px + 44, cy0 + 28]], { closed: false, w: 3, col: '#31752F' });
      letters('Planner · My tasks', px + 64, cy0 + 44, 28, { font: UI, weight: 700, fill: '#fff', shadow: false });
      C.restore();
      const tasks = [['Approve Atlas sign-off', 'Due Wed', '#E0592A'], ['Contoso renewal deck', 'Due Fri', '#21A366'], ['Accept Hannah\'s Copilot session', 'Due today', '#1552D6'], ['Book 1:1s with team', 'Due next week', '#B04FE6']];
      tasks.forEach(([t, d, c], i) => {
        const u = seg(T, pt + 3.0 + i * .25, pt + 3.5 + i * .25, eio); if (u <= 0) return;
        const tx = mix(px + 40, px + 18, u), ty = mix(cy0 + 32 + i * 126, cy0 + 82 + i * 126, u);
        C.save(); C.globalAlpha *= Math.min(1, u * 3);
        sfTask(tx, ty, pw2 - 36, 110, t, d, c, false);
        C.restore();
      });
    }
  } else if (pn === 'avail') {
    letters('Finding a time: Sofia + Hannah · Thursday', cx0, cy0 + 34, 30, { font: UI, weight: 700, shadow: false });
    const gx = cx0 + 210, gw = cw - 230, hw = gw / 8, rows = [['Sofia', '#F7738A', [[0, 1.5], [2, 3], [6, 7.5]]], ['Hannah', '#B04FE6', [[.5, 2], [3, 5], [5.5, 6], [7, 8]]]];
    for (let h = 0; h <= 8; h++) { const lx = gx + h * hw; line([lx, cy0 + 100], [lx, cy0 + 340], { w: 1.2, op: .2 }); if (h < 8) letters((9 + h) + ':00', lx + 6, cy0 + 90, 20, { font: UI, weight: 600, shadow: false, fill: '#5A5A6E' }); }
    rows.forEach(([nm, col, busy], r) => {
      const ry = cy0 + 110 + r * 120;
      paint(ellPts(cx0 + 40, ry + 50, 32, 32, 16), { fill: col, sw: 2, shade: false });
      letters(nm[0], cx0 + 40, ry + 61, 30, { font: UI, weight: 800, align: 'center', fill: '#fff', shadow: false });
      letters(nm, cx0 + 86, ry + 60, 28, { font: UI, weight: 700, shadow: false });
      busy.forEach(([a, b], i) => { const q = seg(T, pt + .8 + (r * 4 + i) * .06, pt + 1.1 + (r * 4 + i) * .06, eout); if (q > 0) sfEvent(gx + a * hw + 3, ry + 8, Math.max(8, (b - a) * hw * q - 6), 88, '#8D96B5', b - a >= 1 ? 'Busy' : '', { op: .9 }); });
    });
    // scanning cursor sweeps the day, then locks on the shared free slot (14:00–14:30)
    const sx = gx + 5 * hw, sk = seg(T, pt + 1.2, pt + 2.0, eio), lk = seg(T, pt + 2.0, pt + 2.3, x => backOut(x, 2));
    if (sk > 0 && lk <= 0) { const cxs = mix(gx, sx, sk); C.save(); C.globalAlpha = .35; C.fillStyle = '#38C2F8'; C.fillRect(cxs, cy0 + 100, hw / 2, 240); C.restore(); }
    if (lk > 0) {
      C.save(); C.globalAlpha = .9; paint(rrPts(sx - 2, cy0 + 100, hw / 2 + 4, 240, 8), { fill: 'rgba(77,181,122,.28)', sw: 3, shade: false, inkCol: '#21A366' }); C.restore();
      push(sx + hw / 4, cy0 + 372, lk); letters('Both free · 14:00', 0, 0, 24, { font: UI, weight: 800, align: 'center', fill: '#21A366', shadow: false }); pop();
    }
    const ek = seg(T, pt + 2.3, pt + 2.7, x => backOut(x, 1.8));
    if (ek > .02) {
      push(cx0 + cw / 2, cy0 + 490, ek);
      paint(rrPts(-420, -78, 840, 156, 18), { fill: lg(-420, 0, 420, 0, ['#6264A7', '#B04FE6']), sw: 2.6, shade: false, base: 1 });
      letters('Catch-up call · Sofia + Hannah', -390, -18, 34, { font: UI, weight: 800, fill: '#fff', shadow: false });
      letters('Thu 14:00 – 14:30 · Teams meeting', -390, 28, 26, { font: UI, weight: 600, fill: '#E9DDF8', shadow: false });
      const ik = seg(T, pt + 2.75, pt + 3.05, x => backOut(x, 2.2));
      if (ik > .02) { push(290, 0, ik, 1, -6); paint(rrPts(-100, -26, 200, 52, 26), { fill: '#fff', sw: 2, shade: false }); letters('✓ Invite sent', 0, 9, 24, { font: UI, weight: 800, align: 'center', fill: '#21A366', shadow: false }); pop(); }
      pop();
    }
  } else if (pn === 'cal') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], dw = cw / 5;
    days.forEach((d, i) => letters(d, cx0 + dw * i + dw / 2, cy0 + 30, 28, { font: UI, weight: 700, align: 'center', shadow: false }));
    const evs = [[0, 0, 'Copilot session (Hannah)', '#1552D6', 1], [0, 2, 'Weekly sync', '#6264A7', 0], [1, 1, 'Contoso renewal', '#21A366', 1], [1, 1, 'Ops review', '#AEB4C2', -1], [2, 0, 'Atlas sign-off', '#E0592A', 1], [2, 0, 'Design crit', '#AEB4C2', -1], [3, 2, '1:1 Hannah', '#B04FE6', 1], [4, 1, 'Focus time', '#38C2F8', 1]];
    evs.forEach(([d, r, lb, col, st], i) => {
      const u = seg(T, pt + .9 + i * .06, pt + 1.5 + i * .06, eio);
      const ex = cx0 + dw * d + 10 + (st === -1 ? 30 * (1 - u) + u * dw * .5 : 0), ey = cy0 + 60 + r * 150, ew = dw - 20 - (st === -1 ? 40 : 0);
      C.save(); C.globalAlpha = ck * (st === -1 ? 1 - u * .65 : 1);
      sfEvent(ex, ey, ew, 120, col, lb, { tent: st === -1 && u < .5, op: 1 });
      if (st === 1 && u > .5) { paint(ellPts(ex + ew - 24, ey + 92, 16, 16, 12), { fill: '#4DB57A', sw: 1.6, shade: false }); ink([[ex + ew - 32, ey + 92], [ex + ew - 25, ey + 99], [ex + ew - 15, ey + 85]], { closed: false, w: 3, col: '#fff' }); }
      if (st === -1 && u > .5) letters('Declined · notes asked', ex + 10, ey + 112, 16, { font: UI, shadow: false, fill: '#5A5A6E' });
      C.restore();
    });
    const tk = seg(T, pt + 1.4, pt + 1.8, eout);
    if (tk > 0) letters('✓ Accepted 5   ✓ Declined 9   ✓ Clashes fixed 3', cx0 + cw / 2, cy0 + 560, 30 * tk, { font: UI, weight: 700, align: 'center', shadow: false, fill: '#21A366' });
  } else if (pn === 'recap') {
    letters('Your 6 months, in 60 seconds', cx0, cy0 + 34, 34, { font: UI, weight: 700, shadow: false });
    sfWatch(cx0 + cw - 120, cy0 + 120, 70, seg(T, pt + .8, pt + 3.0), '60s');
    const items = [['Jan', 'Re-org: new Creative Ops team', '#1C8FE3'], ['Mar', 'Contoso won — you\'re on the account', '#21A366'], ['Apr', 'Project Atlas launched', '#E0592A'], ['Jun', 'Copilot rolled out to everyone', '#B04FE6']];
    line([cx0 + 60, cy0 + 90], [cx0 + 60, cy0 + 90 + 420 * seg(T, pt + .8, pt + 2.2)], { w: 5, col: '#AEB4C2' });
    items.forEach(([m, t, c], i) => {
      const ik = seg(T, pt + .9 + i * .38, pt + 1.2 + i * .38, x => backOut(x, 2)); if (ik <= 0) return;
      const iy = cy0 + 120 + i * 110;
      paint(ellPts(cx0 + 60, iy, 22 * ik, 22 * ik, 14), { fill: c, sw: 2, shade: false });
      letters(m, cx0 + 110, iy - 6, 24, { font: UI, weight: 700, shadow: false, fill: c });
      letters(t, cx0 + 110, iy + 30, 30 * ik, { font: UI, weight: 600, shadow: false });
    });
  } else if (pn === 'brief') {
    letters('Copilot session prep — ready', cx0, cy0 + 34, 34, { font: UI, weight: 700, shadow: false });
    const sl = ['What is Copilot', 'Prompts to try', 'My questions'];
    sl.forEach((t, i) => { const q = seg(T, pt + .8 + i * .25, pt + 1.1 + i * .25, x => backOut(x, 2)); if (q > 0) { push(cx0 + 200 + i * 380, cy0 + 250, q, 1, (i - 1) * 3); C.save(); C.shadowColor = 'rgba(0,0,0,.2)'; C.shadowBlur = 16; sfSlide(-170, -105, 340, 210, t, seg(T, pt + 1 + i * .2, pt + 2 + i * .2), T); C.restore(); ink(rrPts(-170, -105, 340, 210, 4), { w: 2.4 }); pop(); } });
    const dk = seg(T, pt + 1.4, pt + 1.8, x => backOut(x, 2));
    if (dk > 0) { push(cx0 + cw / 2, cy0 + 470, dk); sfDoc(-260, -60, 520, 140, seg(T, pt + 1.5, pt + 2.3), true); ink(rrPts(-260, -60, 520, 140, 4), { w: 2.4 }); appTile('word', -300, 10, 60); appTile('ppt', 300, 10, 60); pop(); }
  }
  C.restore();
  pop();
  // XP bar fills as each quest step lands
  const xp = .08 + CP_XP.reduce((s, t) => s + .92 / CP_XP.length * seg(T, t, t + .4), 0);
  sfXP(660, 990, 1140, xp, 'Quest: First day back', T);
  [['Inbox tamed', '#4DB57A'], ['Replies drafted', PAL.cpBlue], ['Tasks in Planner', '#31752F'], ['Calendar sorted', PAL.cpBlue], ['Catch-up booked', PAL.cpPurple], ['Caught up', PAL.cpPurple], ['Session prep ready', PAL.cpPink]]
    .forEach(([t, c], i) => sfXPpop('+130 XP  ' + t, 1230, 960, CP_XP[i], T, c));
  // headline word pops on the VO keywords
  wpop('SORTED', 380, 115, 60, 41.85, T, { rot: -6, fill: G_COOL, until: 43.7 });
  wpop('SUMMARISED', 380, 115, 54, 43.65, T, { rot: 4, fill: G_WARM, until: 46.0 });
  wpop('DRAFTED', 380, 115, 64, 46.5, T, { rot: -5, fill: G_COOL, until: 49.9 });
  wpop('PLANNED', 380, 115, 64, 49.95, T, { rot: 4, fill: G_SUN, until: 50.9 });
  wpop('UNTANGLED', 380, 115, 64, 51.6, T, { rot: -5, fill: G_SUN, until: 52.95 });
  wpop('BOOKED!', 380, 115, 70, 55.15, T, { rot: 5, fill: G_RIB, until: 56.8 });
  wpop('6 MONTHS → 60 SEC', 380, 200, 50, 58.4, T, { rot: 3, fill: G_COOL, until: 60.0 });
  wpop('READY TO LEARN', 380, 115, 52, 61.2, T, { rot: -4, fill: G_RIB, until: 62.35 });
}

// ---------- 7: "Okay. I've got this." (53.4 – 55.7) ----------
function sGot(T) {
  paper(); tint('#FFF1DE', .6);
  sunburst(W / 2, 560, 22, ['#FFE3A8', '#FFD0DA', '#D6ECFF'], T * 12, .55);
  const z = 1 + seg(T, 53.4, 55.7) * .05;
  cam(z, 0, 0, 0, () => {
    sfBuddy(W / 2 + 330, 330, 110, T, seg(T, 53.45, 53.8));
    shadowE(W / 2, 1010, 140);
    const pw = seg(T, 53.5, 53.9, eout);
    person(W / 2, 1010, 100, {
      look: 'sofia',
      pose: blendPose(sfIdle(T, 0), { lSh: 30, lEl: 120, rSh: 150, rEl: 20, tilt: 4, lean: -2, bob: .1 * Math.max(0, Math.sin((T - 53.5) * 6)) }, pw),
      hands: { r: 'peace' }, eyes: T > 54.6 && T < 54.9 ? 'wink' : 'happy', mouth: sfTalk(T, 53.55, VOD.got, 'grin') || 'grin',
    });
    sfBadge(W / 2 - 430, 380, 120, 'LEVEL UP', 'READY!', seg(T, 54.3, 54.7), T);
    // Clippy cameo peeking from the bottom-right corner
    const cl = seg(T, 54.4, 54.8, x => backOut(x, 2)) ;
    if (cl > 0) {
      clippy(1760, 1120 - cl * 200, 70, { dir: -1 });
      sfBubble(1380, 760 - cl * 40, 330, 100, ['Proud of you!'], 1680, 900, { size: 34 });
    }
  });
  wpop("I'VE GOT THIS!", W / 2, 170, 100, 54.25, T, { fill: G_RIB, stroke: true });
}

// ---------- 8: end card (55.7 – 61.5) ----------
function sOutro(T) {
  paper(); tint('#1F2550', .9);
  sunburst(W / 2, 400, 24, ['#2F3C7A', '#26306A'], T * 6, .55);
  // drifting confetti
  for (let i = 0; i < 40; i++) {
    const x = (hash(i) * W + Math.sin(T + i) * 30), y = ((hash(i + 50) * H + (T - 55.7) * (60 + hash(i + 9) * 90)) % (H + 60)) - 30;
    C.save(); C.globalAlpha = .8; C.fillStyle = [PAL.cpSky, PAL.cpYellow, PAL.cpPink, PAL.cpGreen, PAL.cpPurple][i % 5];
    C.translate(x, y); C.rotate(T * 2 + i); C.fillRect(-6, -10, 12, 20); C.restore();
  }
  const mk = seg(T, 55.8, 56.3, x => backOut(x, 2.2));
  sfBuddy(W / 2, 280, 170 * mk + Math.sin(T * 3) * 4, T, mk);
  wpop('Microsoft 365 Copilot', W / 2, 520, 92, 58.1, T, { fill: '#FFF5E2', font: MARKER });
  wpop('Welcome back, Sofia.', W / 2, 615, 58, 59.15, T, { fill: G_RIB, stroke: true });
  // quest line
  const qk = seg(T, 56.2, 56.6, eout) * (1 - seg(T, 57.8, 58.1));
  if (qk > 0) { C.save(); C.globalAlpha = qk; letters('COPILOT QUEST · EPISODE 1 · ENTER COPILOT', W / 2, 470, 32, { font: HAND, weight: 700, align: 'center', fill: '#BFE3FA', shadow: false }); C.restore(); }
  // CREATED BY GITHUB COPILOT — big, animated credit plate
  const gk = seg(T, 56.6, 57.1, x => backOut(x, 1.9));
  if (gk > 0) {
    const cy = 860, pw = 1000, ph = 200;
    push(W / 2, cy + (1 - gk) * 200, gk, 1, Math.sin(T * 1.6) * .8);
    C.save(); C.globalAlpha = .5; C.fillStyle = rg(0, 0, pw * .7, ['rgba(176,79,230,.8)', 'rgba(56,194,248,.3)', 'rgba(56,194,248,0)']); path(ellPts(0, 0, pw * .7, ph * 1.1, 30)); C.fill(); C.restore();
    paint(rrPts(-pw / 2, -ph / 2, pw, ph, ph / 2), { fill: '#0D1117', sw: 4, shade: false, base: 1, inkCol: '#FFF5E2' });
    // rainbow rim
    C.save(); C.lineWidth = 6; C.strokeStyle = lg(-pw / 2, 0, pw / 2, 0, ['#38C2F8', '#1C8FE3', '#4DB57A', '#F7C51E', '#FFB16A', '#F7738A', '#B04FE6']); path(rrPts(-pw / 2 + 10, -ph / 2 + 10, pw - 20, ph - 20, ph / 2 - 10)); C.stroke(); C.restore();
    letters('CREATED BY', 0, -58, 28, { font: HAND, weight: 700, align: 'center', fill: '#BFE3FA', shadow: false });
    letters('GitHub Copilot', 0, 8, 80, { font: MARKER, align: 'center', fill: G_RIB, stroke: true, shadow: false });
    letters('& Claude Opus 5.5', 0, 66, 24, { font: HAND, weight: 700, align: 'center', fill: '#C9CED6', shadow: false });
    // shimmer sweep
    const sw = ((T - 57.1) % 2.2) / 2.2;
    if (T > 57.1) { C.save(); path(rrPts(-pw / 2, -ph / 2, pw, ph, ph / 2)); C.clip(); C.globalCompositeOperation = 'screen'; const sx = mix(-pw, pw, sw); C.fillStyle = lg(sx - 120, 0, sx + 120, 0, ['rgba(255,255,255,0)', 'rgba(255,255,255,.5)', 'rgba(255,255,255,0)']); C.fillRect(sx - 120, -ph / 2, 240, ph); C.restore(); }
    for (let i = 0; i < 4; i++) { const a = T * 1.5 + i * Math.PI / 2; spark(Math.cos(a) * (pw / 2 + 30), Math.sin(a) * (ph / 2 + 24), 16, [PAL.cpYellow, PAL.cpSky, PAL.cpPink, PAL.cpGreen][i], T * 120); }
    pop();
  }
  sfBadge(260, 300, 110, 'QUEST', 'COMPLETE', seg(T, 57.6, 58.0), T);
  sfBadge(W - 260, 300, 110, 'NEW', 'GUIDE', seg(T, 57.9, 58.3), T);
  const ff = seg(T, 61.1, 61.5); if (ff > 0) { C.save(); C.globalAlpha = ff; C.fillStyle = '#0B0E22'; C.fillRect(0, 0, W, H); C.restore(); }
}
