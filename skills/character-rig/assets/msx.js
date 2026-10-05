// msx.js — Microsoft easter-egg props (watercolour style, pixel-scale units inside push)
const MSC = { r: '#F25022', g: '#7FBA00', b: '#00A4EF', y: '#FFB900', bsod: '#0078D7', out: '#0F6CBD', xp: '#245EDC', beige: '#E8DFC8' };
function tag(t, x, y, sz, col = PAL.ink, al = 'center', wt = 700, font = HAND) { letters(t, x, y, sz, { font, weight: wt, align: al, fill: col, shadow: false }); }

// classic four-pane flag; k 0..1 assembles the panes
function winFlag(x, y, s, T = 0, k = 1) {
  push(x, y, s);
  [[-1, -1, MSC.r], [1, -1, MSC.g], [-1, 1, MSC.b], [1, 1, MSC.y]].forEach(([i, j, col], n) => {
    const e = backOut(clamp(k * 1.6 - n * .15), 2); if (e <= 0) return;
    const w = 44 * e, cx = i * 50 * (2 - e), cy = j * 50 * (2 - e) + Math.sin(T * 4 + n) * 4;
    paint(rrPts(cx - w, cy - w, w * 2, w * 2, 8), { fill: col, sw: 4 });
  });
  pop();
}
function bliss(T) {
  C.save(); C.globalAlpha = .85; C.fillStyle = lg(0, 0, 0, H, ['#3F8FE0', '#8EC8F5', '#DDEFFB']); C.fillRect(0, 0, W, H); C.restore();
  for (let i = 0; i < 5; i++) { const cx = ((hash(i) * W + T * 30 * (1 + i * .2)) % (W + 400)) - 200, cy = 120 + hash(i + 9) * 260;
    paint(blob(cx, cy, 70 + hash(i + 3) * 50, 14, i + 2).map(([a, b]) => [cx + (a - cx) * 1.8, b]), { fill: '#FFFFFF', sw: 2.5, shade: false }); }
  const hill = []; for (let i = 0; i <= 30; i++) { const x = -60 + i * (W + 120) / 30; hill.push([x, 760 - 230 * Math.sin(Math.PI * i / 30) + 40 * Math.sin(i * .7)]); }
  hill.push([W + 60, H + 60], [-60, H + 60]);
  paint(hill, { fill: lg(0, 520, 0, H, ['#86CB45', '#3E8E22']), sw: 5 });
}
function bsod(x, y, w, h, T = 0, pct = 0) {
  paint(rrPts(x - w / 2, y - h / 2, w, h, 22), { fill: MSC.bsod, sw: 5 });
  tag(':(', x - w * .36, y - h * .06, h * .34, '#fff', 'left');
  tag('Your PC ran into a problem', x - w * .36, y + h * .14, h * .075, '#fff', 'left');
  tag(Math.floor(pct) + '% complete', x - w * .36, y + h * .27, h * .065, '#E6F2FF', 'left');
  dot(x - w * .12, y - h * .2, h * .03, '#FF9FB5'); dot(x + w * .02, y - h * .2, h * .03, '#FF9FB5');
  C.save(); C.fillStyle = '#fff'; C.globalAlpha = .9; const q = h * .16; C.fillRect(x + w * .24, y + h * .12, q, q);
  C.fillStyle = MSC.bsod; for (let i = 0; i < 16; i++) if (hash(i + 40) > .45) C.fillRect(x + w * .24 + (i % 4) * q / 4, y + h * .12 + Math.floor(i / 4) * q / 4, q / 4, q / 4); C.restore();
}
function outlookOOO(x, y, s, T = 0) {
  push(x, y, s, 1, Math.sin(T * 2) * 2);
  paint(rrPts(-230, -140, 460, 280, 18), { fill: '#FFFDF6', sw: 4 });
  paint(rrPts(-230, -140, 460, 70, 18), { fill: MSC.out, sw: 4, shade: false });
  paint(rrPts(-205, -123, 50, 36, 6), { fill: '#fff', sw: 3, shade: false }); ink([[-205, -123], [-180, -103], [-155, -123]], { closed: false, raw: true, w: 3 });
  tag('Automatic Replies: ON', -140, -93, 30, '#fff', 'left');
  tag('Out of office!', -200, -20, 40, PAL.ink, 'left'); tag('Back: Monday (probably)', -200, 30, 30, '#555', 'left');
  tag('Re: the killswitch', -200, 75, 28, '#888', 'left'); pop();
}
function teamsMute(x, y, s, T = 0) {
  push(x, y, s);
  paint(rrPts(-240, -44, 480, 88, 44), { fill: PAL.teams, sw: 4, shade: false });
  paint(rrPts(-195, -26, 26, 40, 13), { fill: '#fff', sw: 3, shade: false });
  ink(arcPts(-182, 0, 22, 22, 0, 180, 10), { closed: false, raw: true, w: 3, col: '#fff' });
  line([-212, -30], [-152, 28], { w: 5, col: '#FF8A8A' });
  tag("You're on mute", 30, 14, 40, '#fff'); pop();
}
function minesweeper(x, y, s, T, map, face = 'smile') {
  const n = Math.sqrt(map.length) | 0, c = 64; push(x, y, s);
  const w = n * c; paint(rrPts(-w / 2 - 24, -w / 2 - 110, w + 48, w + 134, 8), { fill: '#C6C6C6', sw: 4 });
  paint(ellPts(0, -w / 2 - 55, 32, 32, 20), { fill: MSC.y, sw: 3, shade: false });
  if (face === 'shock') { dot(-10, -w / 2 - 62, 5, PAL.ink); dot(10, -w / 2 - 62, 5, PAL.ink); dot(0, -w / 2 - 42, 8, PAL.ink); }
  else { dot(-10, -w / 2 - 62, 4, PAL.ink); dot(10, -w / 2 - 62, 4, PAL.ink); ink(arcPts(0, -w / 2 - 55, 14, 12, 20, 160, 8), { closed: false, raw: true, w: 3 }); }
  tag('0' + (99 - Math.floor(T) % 90), -w / 2 + 10, -w / 2 - 38, 44, '#E0201B', 'left', 700, 'monospace');
  const nc = { 1: '#1A3CD8', 2: '#1C8A1C', 3: '#D8201B', 4: '#1A1A80' };
  C.save(); for (let i = 0; i < map.length; i++) {
    const gx = -w / 2 + (i % n) * c, gy = -w / 2 + Math.floor(i / n) * c, ch = map[i];
    C.fillStyle = ch === '#' ? '#BDBDBD' : '#D9D9D9'; C.fillRect(gx, gy, c, c);
    C.strokeStyle = '#7B7B7B'; C.lineWidth = 2; C.strokeRect(gx + 1, gy + 1, c - 2, c - 2);
    if (ch === '#') { C.fillStyle = '#fff'; C.fillRect(gx + 3, gy + 3, c - 8, 5); C.fillRect(gx + 3, gy + 3, 5, c - 8); }
    else if (ch === '*') { C.fillStyle = PAL.ink; C.beginPath(); C.arc(gx + c / 2, gy + c / 2, 15, 0, 7); C.fill();
      for (let a = 0; a < 4; a++) { C.save(); C.translate(gx + c / 2, gy + c / 2); C.rotate(a * Math.PI / 4); C.fillRect(-22, -2.5, 44, 5); C.restore(); } C.fillStyle = '#fff'; C.fillRect(gx + c / 2 - 7, gy + c / 2 - 7, 5, 5); }
    else if (ch === 'F') { C.fillStyle = '#E0201B'; C.beginPath(); C.moveTo(gx + 20, gy + 14); C.lineTo(gx + 44, gy + 24); C.lineTo(gx + 20, gy + 34); C.fill(); C.fillStyle = PAL.ink; C.fillRect(gx + 18, gy + 14, 4, 34); C.fillRect(gx + 12, gy + 46, 20, 5); }
    else if (nc[ch]) { C.font = `700 40px monospace`; C.textAlign = 'center'; C.fillStyle = nc[ch]; C.fillText(ch, gx + c / 2, gy + c / 2 + 14); }
  } C.restore(); pop();
}
const SUITS = [['♥', '#D8201B'], ['♠', PAL.ink], ['♦', '#D8201B'], ['♣', PAL.ink]];
function solCard(x, y, s, rank, si, rot = 0, lite = false) {
  const [su, col] = SUITS[si % 4]; push(x, y, s, 1, rot);
  if (lite) { C.fillStyle = '#FFFDF6'; C.fillRect(-50, -70, 100, 140); C.strokeStyle = PAL.ink; C.lineWidth = 3 / U; C.strokeRect(-50, -70, 100, 140); }
  else paint(rrPts(-50, -70, 100, 140, 10), { fill: '#FFFDF6', sw: 3.5 });
  letters(rank, -40, -38, 30, { font: 'Georgia', weight: 700, fill: col, shadow: false });
  letters(su, 0, 22, 60, { font: 'serif', align: 'center', fill: col, shadow: false }); pop();
}
// Solitaire win: cards launched from the foundations bounce away leaving trails
function solCascade(T, t0, xs, s = 1) {
  const R = ['A', 'K', 'Q', 'J', '10', '7'];
  xs.forEach((x0, k) => { const st = t0 + k * .5; if (T < st) return; const dir = k % 2 ? 1 : -1, vx = (260 + hash(k) * 200) * dir;
    const pos = tau => { let y = 170, vy = -200 - hash(k + 5) * 200, t = 0, dt = 1 / 60; while (t < tau) { vy += 1400 * dt; y += vy * dt; if (y > 930) { y = 930; vy *= -.78; } t += dt; } return [x0 + vx * tau, y]; };
    for (let tau = Math.max(0, T - st - 3); tau <= T - st; tau += .045) { const [x, y] = pos(tau); if (x < -80 || x > W + 80) continue; solCard(x, y, s, R[k % 6], k, 0, true); }
  });
}
function azureRack(x, y, s, T) {
  push(x, y, s); paint(rrPts(-70, -220, 140, 440, 10), { fill: '#2F3440', sw: 4, shade: false });
  C.save(); for (let r = 0; r < 12; r++) { const yy = -200 + r * 34; C.fillStyle = '#454B5A'; C.fillRect(-58, yy, 116, 26);
    for (let l = 0; l < 5; l++) { const on = Math.sin(T * (6 + hash(r * 7 + l) * 10) + hash(r + l * 3) * 9) > 0; C.fillStyle = on ? (l % 3 ? '#50E6FF' : '#7FFF9A') : '#1E2330'; C.fillRect(-48 + l * 12, yy + 9, 7, 7); }
    C.fillStyle = '#6B7385'; C.fillRect(20, yy + 10, 28, 5); } C.restore();
  paint([[-26, -240], [-6, -290], [8, -290], [30, -240]], { fill: MSC.b, sw: 3, smooth: false, shade: false });
  pop();
}
// retro WordArt: extruded rainbow, skewed
function wordArt(txt, x, y, size, T, rot = -6) {
  C.save(); C.translate(x, y); C.rotate(rot * D2R); C.transform(1, 0, -.22, 1, 0, 0);
  const s = 1 + .04 * Math.sin(T * 6); C.scale(s, s);
  C.font = `700 ${size}px ${MARKER}`; const w = C.measureText(txt).width; C.restore();
  for (let k = 9; k >= 0; k--) { C.save(); C.translate(x + k * 3, y + k * 3); C.rotate(rot * D2R); C.transform(1, 0, -.22, 1, 0, 0); C.scale(s, s);
    letters(txt, 0, 0, size, { align: 'center', shadow: false, stroke: k === 0, fill: k ? (k === 9 ? PAL.ink : '#5A2A86') : lg(-w / 2, 0, w / 2, 0, ['#F25022', '#FFB900', '#7FBA00', '#00A4EF', '#B04FE6']) }); C.restore(); }
}
function clippyBubble(x, y, w, lines, side = 1) {
  const h = 30 + lines.length * 40; paint(rrPts(x - w / 2, y - h, w, h, 14), { fill: '#FFFFD2', sw: 3.5, shade: false });
  paint([[x + side * w * .2, y - 4], [x + side * w * .32, y + 40], [x + side * w * .34, y - 4]], { fill: '#FFFFD2', sw: 3, smooth: false, shade: false });
  lines.forEach((l, i) => tag(l, x, y - h + 48 + i * 40, 32));
}
function hourglass(x, y, s, T) {
  push(x, y, s, 1, (Math.floor(T * 1.5) + eio(clamp((T * 1.5 % 1) * 3))) * 180);
  paint([[-30, -46], [30, -46], [4, 0], [30, 46], [-30, 46], [-4, 0]], { fill: '#FFFDF6', sw: 3.5, smooth: false, shade: false });
  paint([[-14, 30], [14, 30], [24, 42], [-24, 42]], { fill: MSC.y, sw: 0.1, smooth: false, shade: false });
  line([-36, -48], [36, -48], { w: 6 }); line([-36, 48], [36, 48], { w: 6 }); pop();
}
function edgeLogo(x, y, s, T) {
  push(x, y, s, 1, T * 20);
  paint(ellPts(0, 0, 60, 60, 36), { fill: lg(-60, -60, 60, 60, ['#35C1F1', '#1B8BD8', '#2BB673']), sw: 4 });
  paint(ellPts(10, 14, 30, 24, 24), { fill: PAL.paper, sw: 3, shade: false }); pop();
}
function zune(x, y, s) {
  push(x, y, s, 1, -8); paint(rrPts(-45, -80, 90, 160, 16), { fill: '#6B4A2E', sw: 4 });
  paint(rrPts(-34, -68, 68, 70, 6), { fill: '#1E2330', sw: 3, shade: false }); paint(rrPts(-20, 18, 40, 40, 10), { fill: '#8A6A4A', sw: 3, shade: false }); pop();
}
function excelGrid(x, y, cols, rows, cw, ch, cells = {}, hi = null) {
  C.save(); C.globalAlpha = .92; C.fillStyle = '#FFFFFF'; C.fillRect(x, y, cols * cw + 50, rows * ch + 36);
  C.fillStyle = '#E4EFE7'; C.fillRect(x, y, cols * cw + 50, 36); C.fillRect(x, y, 50, rows * ch + 36);
  if (hi) { C.fillStyle = 'rgba(33,163,102,.25)'; C.fillRect(x + 50 + hi[0] * cw, y + 36 + hi[1] * ch, cw, ch); C.strokeStyle = PAL.excel; C.lineWidth = 4; C.strokeRect(x + 50 + hi[0] * cw, y + 36 + hi[1] * ch, cw, ch); }
  C.strokeStyle = '#B9C7BE'; C.lineWidth = 1.5; C.globalAlpha = 1;
  for (let i = 0; i <= cols; i++) { C.beginPath(); C.moveTo(x + 50 + i * cw, y); C.lineTo(x + 50 + i * cw, y + 36 + rows * ch); C.stroke(); }
  for (let j = 0; j <= rows; j++) { C.beginPath(); C.moveTo(x, y + 36 + j * ch); C.lineTo(x + 50 + cols * cw, y + 36 + j * ch); C.stroke(); }
  C.font = `700 22px ${HAND}`; C.textAlign = 'center'; C.fillStyle = '#4A5A50';
  for (let i = 0; i < cols; i++) C.fillText(String.fromCharCode(65 + i), x + 50 + (i + .5) * cw, y + 26);
  for (let j = 0; j < rows; j++) C.fillText(j + 1, x + 25, y + 36 + (j + .65) * ch);
  C.font = `700 ${ch * .55}px ${HAND}`; C.fillStyle = PAL.ink;
  for (const k in cells) { const [i, j] = k.split(',').map(Number); C.textAlign = 'right'; C.fillText(cells[k], x + 50 + (i + 1) * cw - 10, y + 36 + (j + .7) * ch); }
  C.restore(); ink(rrPts(x, y, cols * cw + 50, rows * ch + 36, 4), { w: 4, raw: true });
}
function keycap(x, y, label, down = 0, w = 170) {
  paint(rrPts(x - w / 2, y - 50 + 12, w, 100, 16), { fill: '#9B9387', sw: 3.5, shade: false });
  const dy = down * 10; paint(rrPts(x - w / 2, y - 50 + dy, w, 92, 16), { fill: '#F4EFE4', sw: 3.5 });
  tag(label, x, y + 12 + dy, 44);
}
function crt(x, y, s, T) {
  push(x, y, s); paint(rrPts(-150, -130, 300, 240, 22), { fill: MSC.beige, sw: 4 });
  paint(rrPts(-120, -105, 240, 170, 10), { fill: '#138A8A', sw: 3.5, shade: false });
  paint(rrPts(-120, 40, 240, 25, 2), { fill: '#C0C0C0', sw: 2, shade: false }); paint(rrPts(-116, 44, 60, 17, 2), { fill: '#D8D0C0', sw: 2, shade: false });
  tag('Start', -86, 59, 16); paint([[-60, 110], [60, 110], [90, 150], [-90, 150]], { fill: MSC.beige, sw: 4, smooth: false }); pop();
  winFlag(x, y - 40 * s, .28 * s, T);
}
function cdr(x, y, s, T, label = 'SETUP') {
  push(x, y, s, 1, T * 90);
  paint(ellPts(0, 0, 110, 110, 40), { fill: C.createConicGradient ? (() => { const g = C.createConicGradient(0, 0, 0); ['#D8E6F0', '#F7C8E0', '#C8F0E0', '#F0E6B0', '#D8E6F0'].forEach((c, i) => g.addColorStop(i / 4, c)); return g; })() : '#D8E6F0', sw: 4 });
  paint(ellPts(0, 0, 30, 30, 20), { fill: PAL.paper, sw: 3, shade: false }); tag(label, 0, -50, 26); pop();
}
