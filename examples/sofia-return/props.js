// props.js — cute creatures & objects for the later verses
function gato(x, y, s, T, o = {}) { // cute cat, sitting; y = ground
  push(x, y, s, o.dir || 1);
  const t = Math.sin(T * 3);
  ink(bez([30, -20], [80, -20 + t * 10], [90, -90], [60 + t * 20, -120]), { closed: false, raw: true, w: 14, col: PAL.ink });
  ink(bez([30, -20], [80, -20 + t * 10], [90, -90], [60 + t * 20, -120]), { closed: false, raw: true, w: 9, col: o.col || PAL.cpPeach });
  paint(ellPts(0, -55, 55, 58, 30), { fill: o.col || PAL.cpPeach, sw: 4 });
  paint([[-40, -140], [-46, -190], [-12, -160]], { fill: o.col || PAL.cpPeach, sw: 3.5, smooth: false });
  paint([[40, -140], [46, -190], [12, -160]], { fill: o.col || PAL.cpPeach, sw: 3.5, smooth: false });
  paint(ellPts(0, -135, 50, 42, 30), { fill: o.col || PAL.cpPeach, sw: 4 });
  const bl = (T * .7 % 3) < .1;
  if (o.eyes === 'happy') { ink(arcPts(-18, -135, 9, 8, 200, 340, 8), { closed: false, raw: true, w: 4 }); ink(arcPts(18, -135, 9, 8, 200, 340, 8), { closed: false, raw: true, w: 4 }); }
  else if (!bl) { dot(-18, -138, 7, PAL.ink); dot(18, -138, 7, PAL.ink); dot(-16, -141, 2.5, '#fff'); dot(20, -141, 2.5, '#fff'); }
  dot(-30, -122, 7, PAL.blush || '#F7A1A1'); dot(30, -122, 7, PAL.blush || '#F7A1A1');
  ink([[-6, -124], [0, -118], [6, -124]], { closed: false, raw: true, w: 3 });
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([i, j]) => line([i * 28, -122 + j * 4], [i * 60, -126 + j * 10], { w: 2 }));
  paint(ellPts(-22, -4, 16, 9, 12), { fill: o.col || PAL.cpPeach, sw: 3 }); paint(ellPts(22, -4, 16, 9, 12), { fill: o.col || PAL.cpPeach, sw: 3 });
  pop();
}
function chinchilla(x, y, s, T, sq = 0) { // fluffy grey ball; sq squashes it dense
  push(x, y, s);
  const w = 70 * (1 + sq * .5), h = 70 * (1 - sq * .45);
  paint(ellPts(-38, -h * 2 + 10, 26, 34, 20), { fill: '#B8B3BE', sw: 3.5 }); paint(ellPts(38, -h * 2 + 10, 26, 34, 20), { fill: '#B8B3BE', sw: 3.5 });
  paint(ellPts(-38, -h * 2 + 12, 13, 20, 16), { fill: '#F2B8C6', sw: 1, shade: false }); paint(ellPts(38, -h * 2 + 12, 13, 20, 16), { fill: '#F2B8C6', sw: 1, shade: false });
  paint(blob(0, -h, w, 26, 5).map(([a, b]) => [a, -h + (b + h) * h / w]), { fill: '#A9A4B0', sw: 4 });
  dot(-20, -h - 8, 6, PAL.ink); dot(20, -h - 8, 6, PAL.ink); dot(0, -h + 6, 4, '#E48AA0');
  [[-1, 0], [1, 0]].forEach(([i]) => { line([i * 12, -h + 8], [i * 50, -h + 2], { w: 1.8 }); line([i * 12, -h + 10], [i * 48, -h + 16], { w: 1.8 }); });
  pop();
}
function basilisk(x, y, s, T, open = 0) { // cute noodle snake with shades
  push(x, y, s);
  const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push([-260 + u * 360, 40 * Math.sin(u * 9 - T * 5) * (1 - u * .6)]); }
  ink(pts, { closed: false, raw: true, w: 64, col: PAL.ink }); ink(pts, { closed: false, raw: true, w: 54, col: PAL.cpGreen });
  paint(ellPts(150, -20, 80, 64, 30), { fill: PAL.cpGreen, sw: 4 });
  paint(rrPts(110, -60, 58, 34, 10), { fill: PAL.ink, sw: 2, shade: false }); paint(rrPts(172, -60, 58, 34, 10), { fill: PAL.ink, sw: 2, shade: false });
  line([160, -46], [176, -46], { w: 4 }); dot(126, -52, 5, '#fff');
  if (open > 0) paint(ellPts(190, 18, 30, 8 + open * 22, 20), { fill: '#C2254A', sw: 3.5 }); else ink(arcPts(180, 10, 30, 12, 20, 160, 8), { closed: false, raw: true, w: 4 });
  pop();
}
function bomb(x, y, s, T, burn = 0) {
  push(x, y, s);
  paint(ellPts(0, 0, 90, 90, 36), { fill: rg(-30, -30, 140, ['#555A66', '#1E2230']), sw: 4 });
  paint(rrPts(-24, -110, 48, 30, 5), { fill: '#6B7385', sw: 3.5, shade: false }); dot(-34, -34, 14, 'rgba(255,255,255,.5)');
  const f = []; for (let i = 0; i <= 12; i++) { const u = i / 12; f.push([u * 90, -110 - Math.sin(u * 3) * 70]); }
  const n = Math.max(2, Math.round(12 * (1 - burn)) + 1); ink(f.slice(0, n), { closed: false, raw: true, w: 7, col: '#8A6A4A' });
  const [sx, sy] = f[n - 1]; spark(sx, sy, 34 + 10 * Math.sin(T * 30), PAL.cpYellow, T * 200); dot(sx, sy, 10, '#FFF3B0');
  pop();
}
function crystalBall(x, y, s, T) {
  push(x, y, s);
  paint([[-90, 70], [90, 70], [110, 120], [-110, 120]], { fill: '#7A4E8C', sw: 4, smooth: false });
  paint(ellPts(0, -40, 120, 120, 40), { fill: rg(-30, -80, 200, ['#F2E8FF', '#B8A2F0', '#6A4FD0']), sw: 4 });
  C.save(); C.globalAlpha = .5 + .5 * Math.sin(T * 3); mark(0, -40, 110 + 10 * Math.sin(T * 4), { rot: T * 20 }); C.restore();
  for (let i = 0; i < 5; i++) spark(Math.cos(T + i * 1.3) * 90, -40 + Math.sin(T * 1.3 + i) * 80, 10, '#fff', T * 90);
  pop();
}
function fence(x, y, s, T, bt = 1e9, dir = 1) { // picket fence; breaks at time bt
  const k = T > bt ? T - bt : 0;
  for (let i = 0; i < 5; i++) { const px = (i - 2) * 44, a = hash(i + 13) * 2 - 1;
    const dx = k * (300 + 200 * hash(i)) * dir, dy = -k * 500 * (.4 + hash(i + 2)) + k * k * 1400;
    push(x + (px + dx) * s, y + dy * s, s, 1, k * 600 * a);
    paint([[-16, 0], [16, 0], [16, -150], [0, -175], [-16, -150]], { fill: '#FFF5E2', sw: 3.5, smooth: false }); pop(); }
  if (!k) { line([x - 120 * s, y - 50 * s], [x + 120 * s, y - 50 * s], { w: 5 }); line([x - 120 * s, y - 120 * s], [x + 120 * s, y - 120 * s], { w: 5 }); }
}
function atom(x, y, r, T, col = PAL.cpSky) {
  for (let k = 0; k < 3; k++) { C.save(); C.translate(x, y); C.rotate(k * Math.PI / 3); ink(ellPts(0, 0, r, r * .35, 30), { w: 3, col }); C.restore();
    const a = T * 4 + k * 2; const ex = Math.cos(a) * r, ey = Math.sin(a) * r * .35, rr_ = k * Math.PI / 3;
    dot(x + ex * Math.cos(rr_) - ey * Math.sin(rr_), y + ex * Math.sin(rr_) + ey * Math.cos(rr_), 8, PAL.cpPink); }
  dot(x, y, r * .18, PAL.cpYellow);
}
function rocket(x, y, s, rot, T) {
  push(x, y, s, 1, rot);
  for (let i = 0; i < 4; i++) paint(ellPts(0, 120 + i * 30 + 10 * Math.sin(T * 30 + i), 30 - i * 5, 40 - i * 6, 14), { fill: i % 2 ? PAL.cpYellow : PAL.cpRed, sw: 0.1, shade: false });
  paint([[0, -120], [44, -30], [44, 90], [-44, 90], [-44, -30]], { fill: '#F4F1EA', sw: 4 });
  paint([[-44, 30], [-80, 110], [-44, 90]], { fill: PAL.cpRed, sw: 3.5, smooth: false }); paint([[44, 30], [80, 110], [44, 90]], { fill: PAL.cpRed, sw: 3.5, smooth: false });
  paint(ellPts(0, -20, 22, 22, 20), { fill: PAL.cpSky, sw: 3.5, shade: false }); pop();
}
function moon(x, y, r) {
  paint(ellPts(x, y, r, r, 40), { fill: rg(x - r * .3, y - r * .3, r * 1.4, ['#FFF7D6', '#EAD9A0']), sw: 4 });
  [[-.3, -.2, .18], [.35, .1, .12], [-.05, .45, .1]].forEach(([a, b, c]) => paint(ellPts(x + a * r, y + b * r, c * r, c * r, 16), { fill: '#D9C58A', sw: 2, shade: false }));
}
function stockChart(x, y, w, h, k, col = PAL.cpGreen) { // jagged up-and-to-the-right line, k = progress
  const pts = []; const n = 22; for (let i = 0; i <= n * k; i++) { const u = i / n; pts.push([x + u * w, y - h * Math.pow(u, 2.2) + (i % 2 ? 18 : -12) * (1 - u)]); }
  line([x, y + 20], [x + w, y + 20], { w: 4, op: .7 }); line([x, y + 20], [x, y - h], { w: 4, op: .7 });
  if (pts.length > 1) ink(pts, { closed: false, raw: true, w: 10, col });
  return pts[pts.length - 1] || [x, y];
}
function curtains(T, open) { // stage curtains, open 0..1
  const cw = W / 2 * (1 - open * .82);
  [-1, 1].forEach(sd => { const x0 = sd < 0 ? 0 : W - cw, pts = [];
    for (let i = 0; i <= 12; i++) pts.push([x0 + (sd < 0 ? cw : 0) + Math.sin(i * 1.3 + T * 2) * 10, i * H / 12]);
    const P = sd < 0 ? [[-20, -20], [cw, -20], ...pts, [-20, H + 20]] : [[W + 20, -20], [x0, -20], ...pts, [W + 20, H + 20]];
    paint(P, { fill: lg(0, 0, 0, H, ['#B0203A', '#7A1028']), sw: 5 });
    for (let f = 1; f < 5; f++) line([x0 + cw * f / 5, 0], [x0 + cw * f / 5 + 10, H], { w: 3, col: '#5A0A1C', op: .5 }); });
  paint([[-20, -20], [W + 20, -20], [W + 20, 90], ...Array.from({ length: 13 }, (_, i) => [W - i * W / 12, 90 + (i % 2) * 40]), [-20, 90]], { fill: '#9A1830', sw: 5, smooth: false });
}
function spotlight(x, y, r, op = .35) {
  C.save(); C.globalCompositeOperation = 'multiply'; C.fillStyle = 'rgba(40,30,60,' + op * 2 + ')'; C.beginPath(); C.rect(0, 0, W, H); C.ellipse(x, y, r, r * .35, 0, 0, 7); C.fill('evenodd'); C.restore();
  C.save(); C.globalAlpha = op * .6; C.fillStyle = rg(x, y - 200, r * 1.4, ['#FFF6D0', 'rgba(255,246,208,0)']); C.beginPath(); C.moveTo(x - 90, -10); C.lineTo(x + 90, -10); C.lineTo(x + r, y); C.lineTo(x - r, y); C.fill(); C.restore();
}
