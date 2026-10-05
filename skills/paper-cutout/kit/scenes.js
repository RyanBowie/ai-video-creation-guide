// scenes.js — Act 1: title pop-up, the office pop-up book, the inbox attack, and the page turn into the battle.
'use strict';
// cast placement (sticker sheets). flip<0 mirrors without showing the paper back
function pipAt(F, x, y, o = {}, s = .85, flip = 1) { sheet(420, 480, 210, 455, () => pip(F, o), { x, y, s, sx: flip, back: false, rot: o.rot }); }
function buddyAt(F, x, y, o = {}, s = 1, sx = 1) { sheet(300, 300, 150, 150, () => buddy(F, o), { x, y, s, sx }); }
function goblinAt(F, x, y, o = {}, s = 1, sy = 1) { sheet(420, 340, 200, 175, () => goblin(F, o), { x, y, s, sy, rot: o.rot }); }
function clashAt(F, x, y, o = {}, s = 1, sy = 1) { sheet(300, 340, 150, 190, () => clash(F, o), { x, y, s, sy, rot: o.rot }); }
function bang(F, a, x, y, str = '!', size = 110, col = '#FFD23F') { if (F < a || F > a + 34) return; stickerText(str, x, y - hop(F, a, 10, 30), size, { fill: col, s: popK(F, a, 8), rot: .12 }); }
function starBurst(F, a, x, y, n = 6, r = 120, col = '#FFD23F') {
  if (F < a || F > a + 16) return; const t = eOut((F - a) / 16);
  for (let i = 0; i < n; i++) { const ang = i / n * TAU + a; X.save(); X.translate(x + Math.cos(ang) * r * t, y + Math.sin(ang) * r * t); X.rotate(t * 3 + i); X.scale(1 - t * .7, 1 - t * .7); star(30, col); X.restore(); }
}

// ---------- intro: storybook sky + pop-up title
function introLayer(F) {
  const k = 1 - eIn(prog(F, 92, 110));
  popup(k, 845, () => {
    skyWorld(F);
    const tk = popK(F, 16, 16);
    popup(tk, 840, () => {
      sheet(360, 360, 180, 180, () => cpMark(250), { x: 960, y: 395 + Math.sin(F * .1) * 6, rot: Math.sin(F * .06) * .05 });
      stickerText('Microsoft 365 Copilot', 960, 580, 84, { fill: (tw, s) => lgr(-tw / 2, 0, tw / 2, 0, ['#1C8FE3', '#6A5CE8', '#B04FE6', '#F25C9A']) });
    });
    const rp = prog(F, 20, 32);
    if (F >= 20) sheet(520, 140, 260, 70, () => {
      piece([[-250, -44], [250, -44], [220, 0], [250, 44], [-250, 44], [-220, 0]], { fill: '#D7393A', seed: 300, shadow: false });
      txt('CHAPTER 1', 0, 2, 54, '#FFF4D6', { stroke: INK, sw: 9 });
    }, { x: 960, y: 225, sx: Math.cos(Math.PI * (1 - eOut(rp))), rot: -.02 });
    if (F >= 50) stickerText('The Inbox Quest', 960, 735 + Math.sin(F * .12) * 4, 104, { fill: (tw, s) => lgr(0, -s / 2, 0, s / 2, ['#FFE58A', '#F7A928']), s: popK(F, 50, 10), rot: -.03 + Math.sin(F * .09) * .015 });
  });
}

// ---------- office: Pip's desk pops up out of the book
const OFF_ENV = Array.from({ length: 16 }, (_, i) => ({ t: 200 + i * 2.6, vx: -6 - pmHash(i + 400) * 16, vy: -14 - pmHash(i + 500) * 10, r: pmHash(i + 600) * 6 }));
function pipOffice(F) {
  const x = lerp(40, 1000, eOut(prog(F, 104, 142))), walking = F > 104 && F < 140;
  let o = { mug: true, walk: walking ? F * .55 : 0, expr: 'smile' };
  if (F >= 136) o.armR = lerp(-.12, -2.15, eBack(prog(F, 136, 144))) * (1 - prog(F, 190, 198));
  if (F >= 162 && F < 190) o.armL = -2.5 * Math.sin(prog(F, 162, 190) * Math.PI);
  if (F >= 225) { o.expr = 'worried'; o.armR = .5; }
  if (F >= 235) { o.expr = 'shock'; o.sweat = true; o.armL = -.9; o.armR = .9; }
  const [sx2] = shake(F, 228, 30, 6);
  pipAt(F, x + sx2, 872 - hop(F, 235, 8, 26), o);
  if (F >= 132 && F < 186) sheet(260, 110, 130, 55, () => { piece(rrPts(-110, -36, 220, 72, 14), { fill: '#FFF4D6', seed: 310, shadow: false }); txt('PIP', -36, 2, 40, INK); txt('Lv.1', 54, 4, 26, '#B04FE6'); },
    { x: x, y: 425 - hop(F, 132, 10, 20), sy: popK(F, 132, 8) * (1 - prog(F, 178, 186)), rot: -.05 });
  bang(F, 230, x + 70, 400);
}
function officeLayer(F) {
  const k = eBack(prog(F, 98, 126)), count = F < 196 ? 12 : lerp(12, 999, eIn(prog(F, 196, 224)));
  const peek = eOut(prog(F, 160, 172)) - eIn(prog(F, 240, 246));
  officeSet(F, k, () => inboxScreen(F, F >= 140, count, F >= 196 && F < 250 ? 3 + prog(F, 196, 245) * 6 : 0),
    () => { if (peek > 0) sheet(160, 230, 80, 110, () => clippy(F), { x: 1150, y: 760 - peek * 120, s: .85, rot: -.1 }); });
  if (F < 104) return;
  pipOffice(F);
  // the inbox overflows: envelopes spurt from the monitor and pile on the floor
  for (const e of OFF_ENV) {
    if (F < e.t) continue; const tl = (-e.vy + Math.sqrt(e.vy * e.vy + 3.6 * 325)) / 1.8, t = Math.min(F - e.t, tl);
    const x = 1375 + e.vx * t, y = t >= tl ? 840 - e.r * 2 : 520 + e.vy * t + .9 * t * t, r = t >= tl ? (e.r - 3) * .08 : e.r + t * .2;
    X.save(); X.translate(x, y); X.scale(.62, .62); envelope(F, { r }); X.restore();
  }
  // Inbox Goblin bursts out of the monitor; Meeting Clash leaps off the desk calendar
  if (F >= 243) { const p = popK(F, 243, 10); goblinAt(F, lerp(1375, 1360, p), lerp(520, 470, p) + Math.sin(F * .3) * 6, { count: 999 }, .4 + p * .6); }
  if (F >= 250) { const p = popK(F, 250, 10); clashAt(F, lerp(1580, 1640, p), lerp(640, 560, p) - hop(F, 250, 12, 60), {}, .3 + p * .5); }
}

// ---------- page turn: the office page is drawn to its own canvas and swings away on a hinge at the left of the stage
let PAGE = null;
function pageTurn(F) {
  if (!PAGE) PAGE = Object.assign(document.createElement('canvas'), { width: W, height: H }).getContext('2d');
  const keep = X; PAGE.setTransform(1, 0, 0, 1, 0, 0); PAGE.clearRect(0, 0, W, H); X = PAGE; officeLayer(F); X = keep;
  const p = eIn(prog(F, 268, 294)), c = Math.cos(p * Math.PI / 2), hx = L0 - 30;
  if (c < .02) return;
  PAGE.save(); PAGE.globalCompositeOperation = 'source-atop'; PAGE.fillStyle = `rgba(40,20,10,${p * .55})`; PAGE.fillRect(0, 0, W, H); PAGE.restore();
  X.save(); X.fillStyle = `rgba(30,15,5,${.35 * Math.sin(p * Math.PI)})`; X.fillRect(hx, 80, (R0 + 30 - hx) * c + 80 * Math.sin(p * Math.PI), 780); X.restore();
  X.save(); X.translate(hx, 0); X.transform(c, -.12 * Math.sin(p * Math.PI), 0, 1, 0, 0); X.translate(-hx, 0); X.drawImage(PAGE.canvas, 0, 0);
  X.fillStyle = lgr(R0 - 120, 0, R0 + 30, 0, ['rgba(255,250,235,0)', `rgba(255,250,235,${.5 * p})`]); X.fillRect(R0 - 120, 78, 150, 782); X.restore();
}
