// finale.js — Act 3 curtain call, the camera, and the master render(F).
'use strict';
const TOTAL = 900;
const SCENE_T = [['intro', 0], ['office', 98 / 30], ['pageturn', 268 / 30], ['battle', 296 / 30], ['victory', 576 / 30], ['curtaincall', 690 / 30]];
// visual anchors that must land on the spoken word [frame, voKey, word]
const SYNC = [[54, 'intro', 'Inbox'], [134, 'monday', 'Pip'], [140, 'monday', 'opens'], [246, 'monday', 'attack'], [374, 'partner', 'Call'], [404, 'partner', 'Copilot'],
  [450, 'attack', 'Summarise'], [468, 'attack', 'inbox'], [500, 'attack', 'Sort'], [537, 'attack', 'Excellent'], [590, 'win', 'Inbox'], [627, 'win', 'Three'], [662, 'win', 'Level'], [711, 'outro', 'Microsoft'], [812, 'outro', 'Your']];
const PUNCH = [[246, .04], [404, .025], [450, .06], [537, .05], [662, .045], [711, .04]];
const SHAKES = [[228, 22, 7], [312, 8, 10], [325, 8, 10], [338, 8, 10], [450, 8, 6], [537, 10, 8], [662, 10, 6], [711, 8, 5]];

function cam(F) {
  let z = 1 + Math.sin(F * .02) * .004, x = 0, y = 0;
  for (const [a, amt] of PUNCH) if (F >= a - 3 && F < a + 18) z += F < a ? amt * eOut(prog(F, a - 3, a)) : amt * (1 - eOut(prog(F, a, a + 18)));
  for (const s of SHAKES) { const [dx, dy] = shake(F, ...s); x += dx; y += dy; }
  return { x, y, z, r: Math.sin(F * .013) * .002 };
}

// curtain call: a hanging sign drops in front of the closed curtains; Pip and Copilot take a bow
function endSign(F) {
  if (F < 698) return;
  const d = prog(F, 698, 712), y = F < 712 ? lerp(-420, 470, eIn(d)) : 470 - hop(F, 712, 10, 26), sw = F >= 712 ? Math.sin((F - 712) * .22) * .05 * Math.exp(-(F - 712) * .035) : 0;
  X.save(); X.translate(960, y); X.rotate(sw);
  for (const sx of [-300, 300]) line(sx, -1000, sx, -230, '#C9A04A', 7);
  X.restore();
  sheet(940, 560, 470, 280, () => {
    piece(rrPts(-430, -240, 860, 480, 30), { fill: '#D29A68', seed: 400, deco: () => { for (let i = 0; i < 6; i++) { X.fillStyle = i % 2 ? 'rgba(120,70,30,.12)' : 'rgba(255,230,190,.12)'; X.fillRect(-430, -240 + i * 80, 860, 40); } } });
    piece(rrPts(-385, -200, 770, 400, 22), { fill: '#FFF4D6', seed: 401, shadow: false });
    for (const sx of [-300, 300]) shape(circ(sx, -218, 12), '#C9A04A');
    X.save(); X.translate(0, -62 - Math.abs(Math.sin(F * .14)) * 14); X.rotate(Math.sin(F * .07) * .06); cpMark(200); X.restore();
    txt('Microsoft 365 Copilot', 0, 120, 74, lgr(-330, 0, 330, 0, ['#1C8FE3', '#6A5CE8', '#B04FE6', '#F25C9A']), { stroke: INK, sw: 10 });
  }, { x: 960, y, rot: sw });
  if (F >= 808) stickerText('Your partner for every quest.', 960, 812 + Math.sin(F * .1) * 4, 60, { fill: '#FFF4D6', s: popK(F, 808, 10), rot: -.015 });
}
function endCredit(F) { if (F >= 842) stickerText('Made with GitHub Copilot and Opus 5.5', 960, 900, 32, { fill: '#FFE58A', s: popK(F, 842, 8), border: 6 }); }
function endCast(F) {
  if (F < 758) return;
  const k = popK(F, 758, 14), wave = F >= 828 ? Math.sin((F - 828) * .4) * .45 : 0, bow = hop(F, 870, 22, .3);
  X.save(); X.translate(0, 975); X.scale(1, k); X.translate(0, -975);
  pipAt(F, 330, 975 - hop(F, 812, 12, 40), { expr: 'grin', mug: true, armR: F >= 828 ? -2.6 + wave : -.2, tilt: bow }, .72);
  buddyAt(F, 1600, 770 - Math.abs(Math.sin(F * .12)) * 22 - hop(F, 812, 12, 40), { happy: true }, .82);
  X.restore();
}

let CTX = null;
function render(F) {
  F = clamp(Math.round(F), 0, TOTAL - 1); GF = F; X = CTX; X.setTransform(1, 0, 0, 1, 0, 0);
  X.fillStyle = '#2A1712'; X.fillRect(0, 0, W, H);
  X.save(); camera(cam(F));
  if (F < 712) {
    stageFloor(F);
    if (F >= 576 && F < 594) { X.fillStyle = '#3A2A22'; X.fillRect(L0 - 30, TOP - 30, R0 - L0 + 60, 780); }
    if (F < 112) introLayer(F);
    if (F >= 98 && F < 268) officeLayer(F);
    if (F >= 268) battleLayer(F);
    if (F >= 268 && F < 296) pageTurn(F);
  }
  const open = F < 8 ? 0 : F < 690 ? eOut(prog(F, 8, 40)) : 1 - eIO(prog(F, 690, 712));
  curtains(open);
  endSign(F); endCast(F);
  footlights(F, F < 8 ? .3 : 1);
  audience(F, F >= 582 ? 1 : F >= 296 && F < 576 ? 0 : .3);
  endCredit(F);
  proscenium(F);
  X.restore();
  grade(F);
}
