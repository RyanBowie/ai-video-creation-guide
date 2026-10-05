// battle.js — Act 2: the paper-theatre RPG battle and the victory screen.
'use strict';
const HITS = [312, 325, 338], VOLLEY = [305, 318, 331], DMG = [3, 2, 2];
function hpAt(F) { let hp = 10; HITS.forEach((h, i) => { if (F >= h) hp -= DMG[i]; }); return F >= 600 ? 10 : hp; }

function hud(F) {
  const y = lerp(-140, 205, eBack(prog(F, 298, 312))) - eIn(prog(F, 572, 584)) * 360, hp = hpAt(F), low = hp <= 3 && F < 600;
  sheet(460, 150, 230, 75, () => {
    piece(rrPts(-210, -55, 420, 110, 22), { fill: '#FFF4D6', seed: 320, shadow: false });
    X.save(); X.translate(-150, 0); const b = low ? 1 + Math.abs(Math.sin(F * .35)) * .18 : 1; X.scale(b, b); heart(34); X.restore();
    txt('HP', -78, 0, 38, INK);
    txt(`${hp}/10`, 30, 0, 50, low ? '#D7393A' : INK);
    for (let i = 0; i < 5; i++) { X.save(); X.translate(118 + i * 18, -22); X.scale(.3, .3); star(30, '#B04FE6'); X.restore(); }
    txt('FP', 150, 20, 22, '#B04FE6');
  }, { x: 360, y, rot: -.02 });
}
// the enemy volley: three envelopes fly in an arc and hit Pip
function volley(F) {
  VOLLEY.forEach((a, i) => {
    const t = prog(F, a, HITS[i]); if (F < a || F >= HITS[i]) return;
    const x = lerp(1300, 560, t), y = lerp(650, 640, t) - Math.sin(t * Math.PI) * 160;
    sheet(140, 110, 70, 55, () => envelope(F, { r: t * 9 }), { x, y, border: 6 });
  });
  HITS.forEach((h, i) => { starBurst(F, h, 540, 600, 6, 140); if (F >= h && F < h + 24) stickerText(`-${DMG[i]}`, 640, 470 - eOut(prog(F, h, h + 24)) * 60, 72, { fill: '#E8402F', s: popK(F, h, 6), border: 6 }); });
}
// action menu: three blocks over Pip's head, a glove cursor, then a select
const MENU = [['JUMP', '#F7C51E'], ['COFFEE', '#C98A52'], ['COPILOT', '#9FD3F5']], MSEL = [350, 362, 372];
function menuIcon(i) {
  if (i === 0) { shape(rr(-26, -30, 30, 44, 8), '#D7393A'); shape(rr(-30, 6, 60, 22, 10), '#D7393A'); }
  else if (i === 1) { shape(() => X.arc(26, 2, 14, -1.3, 1.3), null); shape(rr(-26, -24, 52, 54, 8), '#FFFDF7'); shape(rr(-26, -24, 52, 12, 5), '#2E6FD6', { sw: 3 }); line(-6, -44, -2, -32, 'rgba(255,255,255,.9)', 5); }
  else cpMark(86);
}
function commandMenu(F) {
  if (F < 348 || F > 394) return;
  const sel = F >= 372 ? 2 : F >= 362 ? 1 : 0, fold = 1 - eIn(prog(F, 382, 394));
  MENU.forEach(([lbl, col], i) => {
    const k = popK(F, 348 + i * 3, 10), bx = 610 + i * 160, by = 340 + (i === 1 ? -30 : 0) - (i === sel ? 14 + Math.sin(F * .4) * 5 : 0), press = i === 2 ? hop(F, 374, 6, 1) : 0;
    sheet(170, 170, 85, 85, () => {
      piece(rrPts(-62, -62, 124, 124, 16), { fill: col, seed: 330 + i, shadow: false, deco: () => { X.fillStyle = 'rgba(255,255,255,.35)'; X.fillRect(-62, -62, 124, 20); } });
      X.save(); X.scale(.9, .9); menuIcon(i); X.restore();
    }, { x: bx, y: by + press * 16, s: (i === sel ? 1.12 : .9) * k, sy: (1 - press * .2) * fold });
  });
  const cx = 610 + sel * 160 + pmNoise(F * .2) * 4, cy = 212 + Math.sin(F * .5) * 8 + (sel === 1 ? -30 : 0);
  if (fold > .3) {
    sheet(120, 130, 60, 70, () => { shape(() => { X.moveTo(0, 50); X.lineTo(-30, 0); X.lineTo(-12, 0); X.lineTo(-12, -40); X.lineTo(12, -40); X.lineTo(12, 0); X.lineTo(30, 0); X.closePath(); }, '#FFFDF7'); }, { x: cx, y: cy, sy: fold });
    stickerText(MENU[sel][0], 770, 470, 44, { fill: '#FFF4D6', s: popK(F, MSEL[sel], 6), sy: fold, border: 6 });
  }
}
// the action command: a Copilot key with a shrinking timing ring
function keycap(F) {
  if (F < 420 || F > 468) return;
  const k = popK(F, 420, 10) * (1 - eIn(prog(F, 458, 468))), down = F >= 450 && F < 456 ? 1 : 0, ring = lerp(230, 98, eIn(prog(F, 424, 450)));
  if (F < 450) { X.save(); X.lineWidth = 12; X.strokeStyle = '#FFD23F'; X.setLineDash([26, 14]); X.lineDashOffset = -F * 3; X.beginPath(); X.arc(1010, 330, ring * k, 0, TAU); X.stroke(); X.restore(); }
  sheet(220, 220, 110, 110, () => {
    shape(rr(-80, -70, 160, 150, 26), '#5E6475'); shape(rr(-72, -78 + down * 10, 144, 136, 22), down ? '#D6DCE6' : '#F2F4F8');
    X.save(); X.translate(0, -10 + down * 10); cpMark(92); X.restore();
  }, { x: 1010, y: 330, s: k });
  if (F < 450) stickerText('Press the Copilot key!', 1010, 490, 40, { fill: '#FFF4D6', s: k, border: 6 });
  if (F >= 450) { stickerText('NICE!', 1180, 210, 96, { fill: (tw, s) => lgr(0, -s / 2, 0, s / 2, ['#FFE58A', '#F7A928']), s: popK(F, 450, 7), rot: -.12 }); starBurst(F, 450, 1010, 330, 8, 220, '#FFE58A'); }
}
// Copilot's attack: summary cards fly to the goblin, then the meetings get sorted
function attack(F) {
  for (let i = 0; i < 6; i++) {
    const a = 452 + i * 4, t = prog(F, a, a + 12); if (F < a || F >= a + 12) continue;
    sheet(180, 130, 90, 65, () => summaryCard(), { x: lerp(800, 1360, eIO(t)), y: lerp(560, 620, t) - Math.sin(t * Math.PI) * 200, rot: (1 - t) * -.6, s: .8 });
  }
  starBurst(F, 468, 1380, 620, 7, 170);
  if (F >= 494 && F < 520) for (let i = 0; i < 5; i++) { const t = prog(F, 494 + i * 2, 508 + i * 2); if (t <= 0 || t >= 1) continue; X.save(); X.translate(lerp(820, 1640, t), lerp(540, 640, t) - Math.sin(t * Math.PI) * 140); X.rotate(F * .3); star(22, '#9FD3F5'); X.restore(); }
  starBurst(F, 504, 1640, 630, 6, 150, '#9FD3F5');
  if (F >= 533 && F < 572) { const s = F < 537 ? lerp(2.4, 1, eIn(prog(F, 533, 537))) : 1 + hop(F, 537, 6, .06);
    stickerText('EXCELLENT!', 1010, 300, 128, { fill: (tw, sz) => lgr(-tw / 2, 0, tw / 2, 0, ['#F7738A', '#B04FE6', '#1C8FE3']), s, sy: 1 - eIn(prog(F, 562, 572)), rot: -.07 }); }
}
// enemies: idle menace, volley lunges, hits, dizzy, then each folds into a paper plane and flies off
function enemy(F, kind, x, y, foldAt) {
  if (F >= foldAt + 40) return;
  const f = prog(F, foldAt, foldAt + 9);
  if (f < .5) {
    const sy = Math.cos(f * Math.PI), lunge = kind === 'g' ? VOLLEY.reduce((m, a) => m + hop(F, a - 4, 8, 40), 0) : 0;
    if (kind === 'g') { const hurt = [456, 460, 464, 468, 472, 476].reduce((m, a) => m + hop(F, a, 5, 1), 0), n = F < 458 ? 999 : lerp(999, 0, eIO(prog(F, 458, 490)));
      goblinAt(F, x - lunge + hop(F, 470, 8, 30), y - Math.abs(Math.sin(F * .18)) * 14, { count: n, hurt, dizzy: F >= 490 }, 1, sy); }
    else clashAt(F, x, y - Math.abs(Math.sin(F * .2 + 1)) * 12, { tidy: eIO(prog(F, 498, 525)), dizzy: F >= 520 }, .95, sy);
  } else {
    const t = prog(F, foldAt + 9, foldAt + 40), py = y - eIn(t) * 700 + Math.sin(t * 9) * 30;
    sheet(170, 90, 85, 45, () => plane(), { x: x + eIn(t) * 520, y: py, sy: Math.min(1, (f - .5) * 2), rot: -.3 - t * .5, s: 1.3 });
  }
}

function battleChars(F) {
  const join = prog(F, 392, 403), cheer = F >= 450 && F < 470 ? 1 : 0;
  let o = { expr: F >= 400 ? 'grin' : F >= 340 ? 'worried' : 'smile', armR: cheer ? -2.6 : undefined };
  HITS.forEach(h => { if (F >= h && F < h + 10) { o.expr = 'shock'; o.tilt = -.18; } });
  if (F >= 300 && F < 400 && hpAt(F) <= 3) o.sweat = true;
  if (F >= 582) { o = { expr: 'grin', armL: 2.5 + Math.sin(F * .3) * .2, armR: -2.5 - Math.sin(F * .3) * .2 }; }
  const knock = HITS.reduce((m, h) => m + hop(F, h, 10, 34), 0), jump = [585, 610, 640].reduce((m, a) => m + hop(F, a, 14, 110), 0);
  pipAt(F, 520 - knock, 872 - jump, o);
  if (F >= 392) buddyAt(F, 790, 560 - jump * .8, { happy: F >= 450 }, 1, Math.cos(Math.PI * (1 - eOut(join))));
  if (F >= 404 && F < 422) stickerText('Copilot joined the party!', 1010, 235, 64, { fill: '#FFF4D6', s: popK(F, 404, 8), sy: 1 - eIn(prog(F, 414, 422)) });
}

function victory(F) {
  if (F < 580) return;
  for (let i = 0; i < 70; i++) {
    const t = F - 582 - pmHash(i + 700) * 30; if (t < 0) continue;
    const x = L0 + pmHash(i + 800) * 1620 + Math.sin(t * .1 + i) * 40, y = 90 + t * (5 + pmHash(i + 900) * 4); if (y > 1000) continue;
    X.save(); X.translate(x, y); X.rotate(t * .1 + i); X.scale(Math.cos(t * .2 + i), 1); X.fillStyle = ['#F7738A', '#1C8FE3', '#FFD23F', '#4DB57A', '#B04FE6'][i % 5]; X.fillRect(-12, -7, 24, 14); X.restore();
  }
  stickerText('VICTORY!', 960, 228 + Math.sin(F * .12) * 6, 124, { fill: (tw, s) => lgr(0, -s / 2, 0, s / 2, ['#FFE58A', '#F7A928']), s: popK(F, 582, 12), rot: -.03 });
  const ck = popK(F, 586, 12);
  sheet(700, 470, 350, 235, () => {
    piece(rrPts(-310, -200, 620, 400, 26), { fill: '#FFF4D6', seed: 360, shadow: false });
    txt('QUEST REPORT', 0, -150, 44, '#B04FE6');
    const rows = [[590, 'Inbox  999+ → 0', '#1C6FD1'], [610, 'Meetings sorted', '#3DAA5C'], [627, '+3 hours back!', '#E8402F']];
    rows.forEach(([a, s, c], i) => { if (F < a) return; const k = popK(F, a, 8); X.save(); X.translate(-250 + (1 - k) * -40, -60 + i * 90); X.globalAlpha = clamp(k);
      txt(s, 0, 0, 50, c, { align: 'left' }); if (i < 2) { X.translate(470, 0); X.scale(k, k); line(-16, 0, -4, 14, '#3DAA5C', 10); line(-4, 14, 22, -18, '#3DAA5C', 10); } X.restore(); });
  }, { x: 1300, y: 560, s: ck, rot: .02 });
  if (F >= 658) { const s = F < 662 ? lerp(2.4, 1, eIn(prog(F, 658, 662))) : 1 + hop(F, 662, 6, .07);
    stickerText('LEVEL UP!', 1420, 820, 96, { fill: (tw, sz) => lgr(-tw / 2, 0, tw / 2, 0, ['#4DB57A', '#1C8FE3']), s, rot: -.12 }); starBurst(F, 662, 520, 500, 8, 200); }
}

function battleLayer(F) {
  const fp = prog(F, 576, 592);
  X.save(); X.translate(0, 470); X.scale(1, Math.abs(Math.cos(fp * Math.PI))); X.translate(0, -470);
  if (fp < .5) nightSet(F); else daySet(F);
  X.restore();
  if (F >= 298) hud(F);
  enemy(F, 'g', 1380, 690, 548); enemy(F, 'c', 1640, 720, 552);
  battleChars(F);
  if (F >= 300) volley(F);
  commandMenu(F); keycap(F); attack(F); victory(F);
}
