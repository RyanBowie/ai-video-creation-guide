
// ============================================================ scene 4: the wall — what a GPU unlocks
const WALL = ['VibeVoice', 'Dia', 'Orpheus', 'Parler-TTS', 'F5-TTS', 'XTTS-v2', 'Qwen3-TTS', 'NeuTTS Air', 'CosyVoice 3', 'Fish Audio S2', 'Sesame CSM', 'Zonos', 'IndexTTS2', 'Spark-TTS', 'StyleTTS 2', 'OuteTTS', 'Kyutai TTS', 'VoxCPM 2', 'Voxtral TTS', 'Maya1', 'Higgs Audio'];
const WALL_HI = [[0, 5.12, 'Microsoft', 'long multi-speaker podcasts', '#7FB2FF'], [1, 7.66, 'Nari Labs', 'realistic two-person dialogue', '#FF9ED2'], [2, 9.16, 'Canopy Labs', 'laughs, sighs & emotion tags', COL.gold], [3, 11.86, 'Hugging Face', 'designs a voice from a text description', COL.teal]];
function sWall(f, d, s) {
  const b = s.at.n_wall, T = x => b + sec(x), fade = fadeIO(f, d, 10, 14);
  let o = bg(f, null) + glow('white', 960, 520, 1000) + `<g opacity="${n3(fade)}">`;
  // laptop with the eight engines inside
  const lp = prog(f, 0, 18, eout);
  o += `<g opacity="${n3(lp)}" transform="translate(0 ${n1((1 - lp) * 30)})"><rect x="150" y="260" width="520" height="320" rx="18" fill="${COL.panel}" stroke="${COL.light}" stroke-width="4"/><path d="M110 590 H710 L680 625 H140 Z" fill="${COL.line}" stroke="${COL.light}" stroke-width="4" stroke-linejoin="round"/>`;
  ENG.forEach((e, i) => { const t = prog(f, 6 + i * 2, 18 + i * 2, eback); o += chip(290 + (i % 2) * 240, 312 + Math.floor(i / 2) * 72, e, { size: 20, sc: t, op: clamp01(t) }); });
  o += txt(410, 675, 'Runs on this laptop · CPU only', { size: 26, fill: COL.muted, anchor: 'middle' }) + '</g>';
  // + a graphics card
  const g = prog(f, T(2.54) - 4, T(2.54) + 12, eback);
  if (g > 0) o += `<g transform="translate(${n1((1 - g) * -300)} 0)">${txt(225, 790, '+', { size: 80, weight: 800, fill: COL.gold, anchor: 'middle', op: clamp01(g) })}${gpuIcon(300, 730, clamp01(g), 0)}</g>`;
  o += txt(1304, 140, 'Got a GPU? Dozens more open models:', { size: 40, weight: 700, anchor: 'middle', op: prog(f, T(3.5), T(3.5) + 12) });
  // the wall of names
  const hiNow = WALL_HI.filter(h => f >= T(h[1]) - 4).pop();
  WALL.forEach((nm, i) => {
    const col = i % 3, row = Math.floor(i / 3), x = 820 + col * 336, y = 200 + row * 86, t = prog(f, T(3.96) - 6 + i * 1.6, T(3.96) + 6 + i * 1.6, eback);
    const h = WALL_HI.find(q => q[0] === i), seen = h && f >= T(h[1]) - 4, now = hiNow && hiNow[0] === i, ac = h ? h[4] : COL.line;
    const pulse = now ? 1 + .06 * Math.sin(Math.PI * prog(f, T(h[1]) - 4, T(h[1]) + 8)) : 1;
    if (t > 0) o += `<g opacity="${n3(clamp01(t) * (hiNow && !now && !seen ? .55 : 1))}" transform="translate(${x + 156} ${y + 36}) scale(${n3(t * pulse)})"><rect x="-156" y="-36" width="312" height="72" rx="14" fill="${seen ? ac : COL.panel}" fill-opacity="${seen ? .18 : 1}" stroke="${seen ? ac : COL.line}" stroke-width="${now ? 4 : 2}"/>${txt(0, 10, nm, { size: 28, weight: 600, anchor: 'middle', fill: seen ? COL.light : COL.muted })}</g>`;
  });
  if (hiNow) {
    const [i, at, who, what, ac] = hiNow, t = prog(f, T(at) - 2, T(at) + 10, eout);
    o += `<g opacity="${n3(t)}" transform="translate(0 ${n1((1 - t) * 16)})">${txt(1304, 878, WALL[i], { size: 44, weight: 800, fill: ac, anchor: 'middle' })}${txt(1304, 926, `${who} · ${what}`, { size: 28, fill: COL.light, anchor: 'middle' })}</g>`;
  }
  return o + '</g>';
}

// ============================================================ scene 5: finale — everybody says "free"
const FIN = ENG.map(e => 'f_' + e.id);
function sFinale(f, d, s) {
  const fade = fadeIO(f, d, 10, 14); let o = bg(f, null) + `<g opacity="${n3(fade)}">`;
  o += txt(960, 250, 'So what do they all cost?', { size: 56, weight: 700, anchor: 'middle', op: prog(f, 0, 12) });
  FIN.forEach((k, i) => {
    const e = ENG[i], x = 960 + (i - 3.5) * 210, y = 480, a = s.at[k], t = spring(f - a + 2, { damping: 10, stiffness: 210 }), on = f - a >= -2 && f - a < LEN(k);
    const amp = envAt(k, f - a), ap = prog(f, 4 + i * 2, 14 + i * 2);
    o += `<circle cx="${x}" cy="${y}" r="${n1(70 + amp * 10)}" fill="${t > 0 ? e.col : COL.panel}" fill-opacity="${t > 0 ? .18 : 1}" stroke="${e.col}" stroke-width="${on ? 6 : 3}" opacity="${n3(ap)}"/>`;
    if (on) o += `<circle cx="${x}" cy="${y}" r="${n1(70 + 40 * prog(f - a, 0, 14))}" fill="none" stroke="${e.col}" stroke-width="3" opacity="${n3(1 - prog(f - a, 0, 14))}"/>`;
    if (t > 0) o += `<g transform="translate(${x} ${y}) scale(${n3(t)})">${txt(0, 12, 'FREE', { size: 34, weight: 800, fill: e.col, anchor: 'middle', ls: 1 })}</g>`;
    o += txt(x, y + 120, e.name, { size: 22, fill: t > 0 ? COL.light : COL.muted, anchor: 'middle', op: ap });
  });
  const last = s.at[FIN[7]] + LEN(FIN[7]), z = prog(f, last - 4, last + 12, eback);
  o += pill(960, 760, 'Open weights · open source · free to use', { size: 34, anchor: 'middle', fill: COL.gold, bg: COL.gold, bgOp: .12, stroke: COL.gold, sc: z, op: clamp01(z) });
  o += txt(960, 840, 'check each licence before commercial use', { size: 22, fill: COL.muted, anchor: 'middle', op: prog(f, last + 8, last + 20) });
  return o + '</g>';
}

// ============================================================ scene 6: outro
function sOutro(f, d, s) {
  const b = s.at.n_outro, T = x => b + sec(x);
  let o = bg(f, null) + glow('white', 960, 400, 800);
  o += mark(960, 330, 200, prog(f, 0, 36));
  o += words([{ t: 'One script.' }, { t: 'Many voices.', fill: COL.gold }], 960, 600, f, T(0) - 2, { size: 80, weight: 700, stagger: 30 });
  o += words([{ t: 'Made with GitHub Copilot + Claude Opus 5.5' }], 960, 690, f, T(2.3), { size: 40, weight: 500, fill: COL.muted, stagger: 4 });
  o += chipRow(960, 820, ENG, 12, { size: 18 }, i => ({ op: prog(f, T(4.6) + i * 2, T(4.6) + 10 + i * 2) * .8 }));
  return o + `<rect width="${W}" height="${H}" fill="#000" opacity="${n3(Math.max(1 - prog(f, 0, 10), prog(f, d - 30, d)))}"/>`;
}

// ============================================================ assembly
const sc = [];
{
  const r = mk('relay', sRelay); wait(r, 24); RELAY.forEach((k, i) => say(r, k, i < RELAY.length - 1 ? 3 : 0)); wait(r, 36); sc.push(r);
  const t = mk('title', sTitle); wait(t, 14); say(t, 'n_title'); wait(t, 18); fx(t, 'chime', t.at.n_title + sec(3.78)); fx(t, 'whoosh', t.t - 8); sc.push(t);
  sc.push(...CARDS);
  const w = mk('wall', sWall); fx(w, 'whoosh', 0); wait(w, 14); say(w, 'n_wall'); wait(w, 24);
  fx(w, 'clunk', w.at.n_wall + sec(2.54)); fx(w, 'charge', w.at.n_wall + sec(3.9)); WALL_HI.forEach(h => fx(w, 'click', w.at.n_wall + sec(h[1]) - 4)); sc.push(w);
  const fi = mk('finale', sFinale); wait(fi, 30);
  FIN.forEach((k, i) => { fi.at[k] = fi.t; fi.cues.push([k, fi.t]); fx(fi, 'pop', fi.t - 2); fi.t += i < FIN.length - 1 ? Math.max(22, LEN(k) + 4) : LEN(k); });
  fx(fi, 'chime', fi.t - 2); wait(fi, 60); sc.push(fi);
  const ou = mk('outro', sOutro); fx(ou, 'chime', 6); wait(ou, 16); say(ou, 'n_outro'); wait(ou, 60); sc.push(ou);
}
let acc = 0; for (const s of sc) { s.from = acc; s.dur = s.t; acc += s.dur; Object.defineProperty(s.render, 'name', { value: s.name }); }
const SCENES = sc, TOTAL = acc;
const VO_CUES = sc.flatMap(s => s.cues.map(([k, r]) => [k, s.from + r, 'v']));
const SFX_CUES = sc.flatMap(s => s.sfx.map(([r, n]) => [s.from + r, n])).sort((a, b) => a[0] - b[0]);
const SCENE_T = sc.map(s => [s.name, s.from / FPS]);
