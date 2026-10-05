// sets.js — the paper theatre: proscenium, curtains, backdrops (sky, office pop-up, night stage), floor, footlights, audience.
'use strict';
const FLOOR = 860, L0 = 150, R0 = 1770, TOP = 108;

function stageFloor(F) {
  piece(rectPts(L0 - 40, 820, R0 - L0 + 80, 300), { fill: '#D19A62', seed: 3, tear: 1.6, shadow: false, deco: () => {
    for (let i = 0; i < 9; i++) { const y = 840 + i * i * 4.2 + i * 14; X.fillStyle = i % 2 ? 'rgba(120,70,30,.13)' : 'rgba(255,230,190,.12)'; X.fillRect(0, y, W, 6 + i * 2); }
    for (let i = 0; i < 26; i++) { const x = L0 + i * 66 + pmHash(i) * 20; line(x, 840, W / 2 + (x - W / 2) * 1.5, 1080, 'rgba(110,60,25,.22)', 2.5); }
  } });
}
// ---------- intro sky: clouds, hills, sun (storybook world behind the title)
function skyWorld(F) {
  piece(rectPts(L0 - 30, TOP - 30, R0 - L0 + 60, 780), { fill: () => lgr(0, TOP, 0, 850, ['#7CCBF2', '#C6EBFA']), seed: 11, shadow: false });
  X.save(); X.translate(1520, 260); X.rotate(F * .01);
  piece(ellPts(0, 0, 90, 90, 18).map(([x, y], i) => i % 2 ? [x * .78, y * .78] : [x, y]), { fill: '#FFD34D', seed: 4 }); X.restore();
  for (let i = 0; i < 4; i++) { const cx = ((300 + i * 430 + F * (1 + i * .4)) % 1800) + 60, cy = 200 + (i % 2) * 110;
    piece([...ellPts(cx, cy, 90, 46, 22)], { fill: '#FFFDF7', seed: 20 + i, blur: 8 }); piece(ellPts(cx + 50, cy - 26, 60, 40, 18), { fill: '#FFFDF7', seed: 30 + i, shadow: false }); }
  piece([[L0 - 30, 860], ...Array.from({ length: 21 }, (_, i) => [L0 - 30 + i * 85, 600 - Math.sin(i * .5) * 70 - pmHash(i) * 30]), [R0 + 30, 860]], { fill: '#8FD16B', seed: 5 });
  piece([[L0 - 30, 860], ...Array.from({ length: 21 }, (_, i) => [L0 - 30 + i * 85, 700 - Math.sin(i * .45 + 2) * 60]), [R0 + 30, 860]], { fill: '#5DB548', seed: 6 });
}

// ---------- office pop-up diorama
function officeSet(F, k, screen, behind) {
  popup(k, 845, () => {
    piece(rectPts(L0 - 30, TOP - 30, R0 - L0 + 60, 780), { fill: '#CBE4EA', seed: 41, shadow: false, deco: () => {
      for (let x = L0; x < R0; x += 90) { X.fillStyle = 'rgba(255,255,255,.35)'; X.fillRect(x, 0, 30, H); }
      X.fillStyle = '#B48A5E'; X.fillRect(0, 770, W, 80);
    } });
    // window with the city
    piece(rectPts(270, 210, 430, 360), { fill: '#FFFDF7', seed: 42 });
    piece(rectPts(292, 232, 386, 316), { fill: () => lgr(0, 232, 0, 548, ['#86D0F5', '#D6F1FB']), seed: 43, shadow: false, rim: false });
    for (let i = 0; i < 6; i++) { const h = 90 + pmHash(i + 9) * 120; piece(rectPts(300 + i * 64, 548 - h, 54, h), { fill: i % 2 ? '#8CA6C9' : '#7690B8', seed: 50 + i, blur: 4, shy: 3 }); }
    line(485, 232, 485, 548, '#FFFDF7', 12); line(292, 390, 678, 390, '#FFFDF7', 12);
    // Bliss easter-egg poster
    piece(rectPts(800, 230, 260, 190), { fill: '#FFFDF7', seed: 44 });
    piece(rectPts(816, 246, 228, 158), { fill: '#6CB8F0', seed: 45, shadow: false, deco: () => { X.fillStyle = '#56B33D'; X.beginPath(); X.moveTo(816, 380); X.quadraticCurveTo(930, 300, 1044, 350); X.lineTo(1044, 404); X.lineTo(816, 404); X.fill(); X.fillStyle = '#fff'; X.beginPath(); X.ellipse(880, 290, 30, 12, 0, 0, TAU); X.fill(); } });
    // wall clock: hands spin when the inbox explodes
    const spin = F > 200 ? (F - 200) * .4 : 0;
    X.save(); X.translate(1250, 260); piece(ellPts(0, 0, 66, 66, 28), { fill: '#FFFDF7', seed: 46 });
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(Math.cos(a) * 48, Math.sin(a) * 48, Math.cos(a) * 56, Math.sin(a) * 56, INK, 4); }
    X.rotate(.6 + spin); line(0, 0, 0, -40, INK, 6); X.rotate(1.9 + spin * 6); line(0, 0, 0, -50, '#E8402F', 4); X.restore();
  });
  popup(clamp(k * 1.25 - .25), 860, () => {
    behind && behind();
    // desk
    piece(rectPts(1120, 700, 500, 160), { fill: '#B5774A', seed: 61, deco: () => { for (let i = 0; i < 2; i++) { X.strokeStyle = 'rgba(70,35,15,.4)'; X.lineWidth = 4; X.strokeRect(1150 + i * 240, 724, 200, 110); X.fillStyle = '#E8C9A0'; X.fillRect(1230 + i * 240, 770, 40, 10); } } });
    piece(rectPts(1090, 670, 560, 40), { fill: '#D29A68', seed: 62 });
    // plant
    piece([[1690, 860], [1670, 760], [1790, 760], [1770, 860]], { fill: '#E07A4F', seed: 63 });
    for (let i = 0; i < 5; i++) { const a = -2.3 + i * .4 + Math.sin(F * .05 + i) * .04; X.save(); X.translate(1730, 760); X.rotate(a + Math.PI / 2); piece(ellPts(0, -70, 22, 70, 16), { fill: i % 2 ? '#4DAA57' : '#3D9147', seed: 64 + i, blur: 4 }); X.restore(); }
    // monitor
    piece([[1335, 670], [1345, 610], [1405, 610], [1415, 670]], { fill: '#545A6B', seed: 70 });
    piece(rrPts(1200, 410, 350, 220, 18), { fill: '#3A3F4F', seed: 71 });
    screen && screen();
    // desk calendar (Meeting Clash's hiding place)
    if (F < 252) piece(rectPts(1540, 600, 80, 72), { fill: '#FBF7EE', seed: 72, deco: () => { X.fillStyle = '#D7393A'; X.fillRect(1540, 600, 80, 22); } });
    // mug spot / keyboard
    piece(rrPts(1210, 645, 170, 22, 8), { fill: '#E9E6E0', seed: 73, blur: 4 });
  });
}
function inboxScreen(F, lit, count, shakeAmt) {
  const [dx, dy] = [pmNoise(F * 1.3) * shakeAmt, pmNoise(F * 1.3 + 9) * shakeAmt];
  X.save(); X.translate(dx, dy);
  X.fillStyle = lit ? '#F7F9FC' : '#1E2433'; X.beginPath(); X.roundRect(1218, 428, 314, 184, 8); X.fill();
  if (lit) {
    X.fillStyle = '#1C6FD1'; X.fillRect(1218, 428, 314, 34); txt('Inbox', 1290, 446, 22, '#fff', { weight: 800 });
    const n = Math.floor(count);
    X.save(); X.translate(1468, 446); X.scale(1 + (n >= 999 ? Math.sin(F * .8) * .1 : 0), 1); X.fillStyle = n >= 999 ? '#E8402F' : '#1C6FD1'; X.beginPath(); X.roundRect(-48, -14, 96, 28, 14); X.fill(); txt(n >= 999 ? '999+' : String(n), 0, 1, 20, '#fff'); X.restore();
    for (let i = 0; i < 5; i++) { const y = 476 + i * 27 + ((F * (count > 10 ? 3 : 0)) % 27); if (y > 600) continue; X.fillStyle = i % 2 ? '#E3ECF7' : '#fff'; X.fillRect(1226, y, 298, 23); X.fillStyle = '#9AAAC2'; X.fillRect(1236, y + 8, 70 + pmHash(i + Math.floor(F / 3)) * 120, 7); X.fillStyle = '#1C6FD1'; X.beginPath(); X.arc(1512, y + 11, 4, 0, TAU); X.fill(); }
  }
  X.restore();
}

// ---------- night stage for the battle (flips to a sunny day backdrop at victory)
function nightSet(F) {
  piece(rectPts(L0 - 30, TOP - 30, R0 - L0 + 60, 780), { fill: () => lgr(0, TOP, 0, 850, ['#1E2A63', '#3F4FA0', '#7A6FB8']), seed: 81, shadow: false });
  for (let i = 0; i < 14; i++) { const x = L0 + 60 + pmHash(i + 3) * 1500, y = 160 + pmHash(i + 30) * 260; X.save(); X.translate(x, y); X.rotate(Math.sin(F * .05 + i) * .3); X.scale(.4 + pmHash(i) * .3, .4 + pmHash(i) * .3); star(30, '#FFE58A'); X.restore(); }
  X.save(); X.translate(1500, 230); X.rotate(Math.sin(F * .03) * .05);
  piece([...ellPts(0, 0, 80, 80, 26, -1.2).slice(0, 15), ...ellPts(30, -12, 66, 66, 26, -1.2).slice(0, 15).reverse()], { fill: '#FFF2B8', seed: 82 }); X.restore();
  const sky = (n, base, col, s0, wins) => { for (let i = 0; i < n; i++) { const w = 120 + pmHash(i + s0) * 90, h = base + pmHash(i + s0 + 7) * 220, x = L0 - 20 + i * (1680 / n);
    piece(rectPts(x, 840 - h, w, h + 20), { fill: col, seed: s0 + i, blur: 8, deco: wins ? () => { for (let r = 0; r < h / 46 - 1; r++) for (let c = 0; c < 3; c++) if (pmHash(i * 31 + r * 7 + c) > .45) { X.fillStyle = pmHash(r + c + Math.floor(F / 40)) > .15 ? '#FFD86B' : '#4A4F7A'; X.fillRect(x + 18 + c * (w - 36) / 3, 860 - h + r * 46, (w - 36) / 3 - 10, 22); } } : null }); } };
  sky(10, 180, '#2C3770', 90, false); sky(8, 90, '#202955', 120, true);
}
function daySet(F) { skyWorld(F); }
function footlights(F, on = 1) {
  piece(rectPts(L0 - 40, 990, R0 - L0 + 80, 100), { fill: '#6B3B2A', seed: 140, deco: () => { X.fillStyle = '#C9A04A'; X.fillRect(0, 990, W, 10); } });
  for (let i = 0; i < 9; i++) { const x = L0 + 80 + i * 190, fl = .85 + pmNoise(F * .3 + i) * .15;
    X.save(); X.globalCompositeOperation = 'screen'; X.fillStyle = rgr(x, 990, 0, 160, [`rgba(255,220,140,${.32 * on * fl})`, 'rgba(255,220,140,0)']); X.fillRect(x - 160, 830, 320, 170); X.restore();
    piece(ellPts(x, 992, 34, 18, 18).slice(9).concat([[x - 34, 992]]), { fill: '#FFE9A8', seed: 150 + i, blur: 4 }); }
}
// audience silhouettes in front of the stage; Clippy is in the crowd
function audience(F, cheer = 0) {
  for (let i = 0; i < 11; i++) { const x = 90 + i * 172, b = Math.abs(Math.sin(F * (.2 + cheer * .25) + i * 1.7)) * (4 + cheer * 22), y = 1060 - b;
    if (i === 7 && F >= 296) { sheet(160, 230, 80, 110, () => clippy(F), { x, y: y - 26, s: .8, paper: '#4A3348', shadow: false, border: 6 }); continue; }
    X.save(); X.fillStyle = '#2B1D2A'; X.beginPath(); X.arc(x, y - 70, 44, 0, TAU); X.fill(); X.beginPath(); X.ellipse(x, y + 20, 86, 70, 0, Math.PI, 0); X.fill(); X.restore();
    if (cheer > .5 && i % 3 === 0) { X.save(); X.fillStyle = '#2B1D2A'; X.translate(x + 60, y - 60); X.rotate(-.5 + Math.sin(F * .5 + i) * .3); X.fillRect(-10, -80, 20, 90); X.restore(); }
  }
}

// ---------- proscenium: red swag valance with a gold medallion + side curtains; curtains(open 0..1) are the main drapes
function velvet(pts, seed, folds, light = 0) {
  piece(pts, { fill: '#B3213A', seed, tear: 2.6, deco: (b) => {
    for (let i = 0; i < folds; i++) { const x = b[0] + (i + .5) / folds * (b[2] - b[0]); X.fillStyle = lgr(x - 40, 0, x + 40, 0, ['rgba(80,0,20,.45)', 'rgba(255,120,130,.22)', 'rgba(80,0,20,.45)']); X.fillRect(x - 40, b[1], 80, b[3] - b[1]); }
    X.fillStyle = `rgba(255,190,120,${light})`; X.fillRect(b[0], b[1], b[2] - b[0], b[3] - b[1]);
  } });
}
function curtains(open) {
  if (open >= .999) return;
  const e = eIO(clamp(open)), lx = lerp(W / 2 + 12, 40, e), rx = lerp(W / 2 - 12, W - 40, e);
  const wave = (x0, x1, s) => { const p = [[x0, 0], [x1, 0]]; for (let i = 0; i <= 12; i++) p.push([lerp(x1, x0, i / 12), 1060 + Math.sin(i * 1.6) * 12 + s * 4]); return p; };
  velvet(wave(-40, lx, 1), 160, Math.max(2, Math.round(lx / 140)));
  velvet(wave(rx, W + 40, -1), 170, Math.max(2, Math.round((W - rx) / 140)));
}
function proscenium(F) {
  velvet([[-40, -40], [L0 + 20, -40], [L0 + 10, 600], [L0 + 60, 1100], [-40, 1100]], 180, 2);
  velvet([[W + 40, -40], [R0 - 20, -40], [R0 - 10, 600], [R0 - 60, 1100], [W + 40, 1100]], 190, 2);
  const sw = [[-40, -40], [W + 40, -40]]; for (let i = 0; i <= 96; i++) { const x = W + 40 - i * (W + 80) / 96; sw.push([x, 92 + Math.abs(Math.sin(i / 12 * Math.PI)) * 58]); }
  velvet(sw, 200, 8, .04);
  piece(rectPts(-40, 70, W + 80, 26), { fill: '#D9A93E', seed: 210, blur: 6 });
  X.save(); X.translate(W / 2, 92);
  piece(ellPts(0, 0, 74, 74, 30), { fill: '#E8B84A', seed: 211 }); piece(ellPts(0, 0, 58, 58, 30), { fill: '#FFF4D6', seed: 212, shadow: false });
  X.rotate(Math.sin(F * .04) * .06); cpMark(84); X.restore();
}
