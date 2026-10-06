
// ============================================================ scene 1: the relay sentence
const RELAY = ['r_sapi', 'r_piper', 'r_kitten', 'r_kokoro', 'r_super', 'r_pocket', 'r_cb', 'r_edge'];
const RTXT = { r_sapi: 'This one sentence', r_piper: 'gets passed along', r_kitten: 'from one model to the next,', r_kokoro: 'and the next,', r_super: 'and the next,', r_pocket: 'and the next,', r_cb: 'to show you how different', r_edge: 'free A.I. voices can sound.' };
const RLINES = [['r_sapi', 'r_piper'], ['r_kitten'], ['r_kokoro', 'r_super', 'r_pocket'], ['r_cb'], ['r_edge']];
const R_SIZE = 66, R_Y0 = 318, R_STEP = 110;
const R_LAYOUT = (() => {
  const sp = measure(' ', R_SIZE, 600, SANS), out = [];
  RLINES.forEach((ln, li) => {
    const items = []; ln.forEach(k => RTXT[k].split(' ').forEach((w, wi, arr) => items.push({ k, w, wi, n: arr.length, ww: measure(w, R_SIZE, 600, SANS) })));
    let x = W / 2 - (items.reduce((a, b) => a + b.ww, 0) + sp * (items.length - 1)) / 2;
    items.forEach(it => { it.x = x; it.y = R_Y0 + li * R_STEP; x += it.ww + sp; out.push(it); });
  });
  return out;
})();
function relayEnv(s, f) { for (const k of RELAY) { const lf = f - s.at[k]; if (lf >= 0 && lf < LEN(k)) return [envAt(k, lf), engOf(k)]; } return [0, null]; }
function sRelay(f, d, s) {
  let o = bg(f, null);
  const c = cur(s, f, RELAY), e = engOf(c.k), fin = 1 - prog(f, d - 12, d);
  o += glow(e.id, W / 2, 520, 1000, c.started ? .9 : 0);
  o += txt(W / 2, 140, 'ONE SENTENCE  ·  EIGHT VOICE ENGINES', { size: 24, font: MONO, fill: COL.muted, anchor: 'middle', ls: 4, op: prog(f, 0, 14) * fin });
  if (c.started) o += pill(W / 2, 205, `${e.name}  ·  ${VOICE_ID[c.k]}`, { size: 26, anchor: 'middle', fill: COL.light, bg: e.col, bgOp: .16, stroke: e.col, op: fin * (c.on ? 1 : .55), sc: .9 + .1 * eback(prog(c.lf, 0, 8)) });
  // the sentence, chunk by chunk, karaoke-style in each engine's colour
  const chunks = {};
  R_LAYOUT.forEach(it => {
    const k = it.k, st = s.at[k], L = LEN(k), lf = f - st, ce = engOf(k); if (lf < 0) return;
    const words = RTXT[k].split(' '), tot = words.reduce((a, w) => a + w.length + 1, 0), acc = words.slice(0, it.wi).reduce((a, w) => a + w.length + 1, 0);
    const pthr = .04 + .88 * acc / tot, t = eout(clamp01((lf / L - pthr) * L / 7));
    if (t <= 0) return;
    const speaking = lf < L, fill = speaking ? ce.col : COL.light;
    o += txt(it.x, it.y + (1 - t) * 18, it.w, { size: R_SIZE, weight: 600, fill, op: t * fin });
    const ch = chunks[k] || (chunks[k] = { x0: it.x, x1: 0, y: it.y, lf, L, ce }); ch.x1 = it.x + it.ww;
  });
  Object.entries(chunks).forEach(([k, ch]) => {
    const p = eout(prog(ch.lf, 0, ch.L)), cx = (ch.x0 + ch.x1) / 2;
    o += `<line x1="${n1(ch.x0)}" y1="${n1(ch.y + 18)}" x2="${n1(mix(ch.x0, ch.x1, p))}" y2="${n1(ch.y + 18)}" stroke="${ch.ce.col}" stroke-width="4" stroke-linecap="round" opacity="${n3(.85 * fin)}"/>`;
    o += txt(cx, ch.y + 48, ch.ce.name.toUpperCase(), { size: 17, font: MONO, fill: ch.ce.col, anchor: 'middle', ls: 2, op: prog(ch.lf, 2, 12) * fin });
  });
  // scrolling waveform history, coloured by whoever was speaking
  const N = 150, x0 = 260, bw = (W - 2 * x0) / N;
  for (let i = 0; i < N; i++) {
    const ff = f - (N - 1 - i), [a, ee] = relayEnv(s, ff), h = Math.max(4, a * 120);
    o += `<rect x="${n1(x0 + i * bw + bw * .2)}" y="${n1(905 - h / 2)}" width="${n1(bw * .6)}" height="${n1(h)}" rx="${n1(bw * .3)}" fill="${ee ? ee.col : COL.line}" opacity="${n3(fin * (.25 + .75 * i / N) * prog(f, 0, 14))}"/>`;
  }
  o += chipRow(W / 2, 1010, ENG, 12, { size: 18 }, (i, en) => ({ active: f >= s.at[RELAY[i]], op: fin * prog(f, 4 + i * 2, 16 + i * 2), sc: .85 + .15 * eback(prog(f - s.at[RELAY[i]], 0, 10)) }));
  return o + `<rect width="${W}" height="${H}" fill="#000" opacity="${n3(1 - prog(f, 0, 12))}"/>`;
}

// ============================================================ scene 2: title — one sentence, eight engines
function sTitle(f, d, s) {
  const b = s.at.n_title, T = sec => b + Math.round(sec * FPS), fo = 1 - prog(f, d - 12, d);
  let o = bg(f, null) + `<g opacity="${n3(fo)}">`;
  o += glow('white', W / 2, 480, 900, 1);
  o += words([{ t: 'One sentence.' }], W / 2, 300, f, T(0), { size: 96, weight: 700, stagger: 5 });
  o += words([{ t: 'Eight', fill: COL.gold }, { t: 'different engines.' }], W / 2, 420, f, T(1.2), { size: 96, weight: 700, stagger: 5 });
  o += chipRow(W / 2, 535, ENG, 14, { size: 22 }, i => { const sp = spring(f - T(1.44) - i * 3, { damping: 11, stiffness: 190 }); return { sc: sp, op: clamp01(sp * 1.5) }; });
  const fp = 1 + .25 * Math.sin(Math.PI * prog(f, T(3.78), T(3.78) + 10));
  const sp3 = measure(' ', 60, 600, SANS), wA = measure('And every one of them is', 60, 600, SANS), wF = measure('free', 60, 800, SANS), wT = measure('to use.', 60, 600, SANS);
  const left = W / 2 - (wA + wF + wT + 2 * sp3) / 2, fx0 = left + wA + sp3;
  o += words([{ t: 'And every one of them is' }], left + wA / 2, 690, f, T(2.6), { size: 60, weight: 600, stagger: 6 });
  const tf = prog(f, T(3.78) - 2, T(3.78) + 8, eout);
  if (tf > 0) o += `<g transform="translate(${n1(fx0 + wF / 2)} 690) scale(${n3(fp)})">${txt(0, (1 - tf) * 24, 'free', { size: 60, weight: 800, fill: COL.gold, op: tf, anchor: 'middle' })}</g>`;
  o += txt(fx0 + wF + sp3, 690 + (1 - prog(f, T(4.3), T(4.3) + 14, eout)) * 24, 'to use.', { size: 60, weight: 600, op: prog(f, T(4.3), T(4.3) + 14) });
  o += words([{ t: "Let's meet the cast." }], W / 2, 820, f, T(5.28), { size: 46, weight: 500, stagger: 5, fill: COL.muted });
  return o + '</g>';
}
