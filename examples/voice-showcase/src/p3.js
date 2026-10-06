
// ============================================================ scene 3: roll call — one card per engine
const CARD_CLIPS = { sapi: ['sapi'], piper: ['piper1', 'piper2'], kitten: ['kitten'], kokoro: ['kokoro1', 'kokoro2', 'kokoro3'], super: ['super1', 'super2', 'super3', 'super4'], pocket: ['pocket1', 'pocket2'], cb: ['cb1', 'cb2', 'cb3'], edge: ['edge1', 'edge2'] };
const PIPER_V = ['en_US-lessac-medium', 'de_DE-thorsten-high', 'en_US-ryan-high', 'fr_FR-siwis-medium', 'es_ES-davefx-medium', 'en_GB-alba-medium', 'it_IT-riccardo-x_low', 'en_GB-northern_english_male-medium', 'nl_NL-mls-medium', 'pl_PL-gosia-medium', 'uk_UA-lada-x_low', 'pt_BR-faber-medium'];
const LOCALES = ['en-US', 'en-GB', 'en-AU', 'en-IN', 'fr-FR', 'de-DE', 'es-MX', 'it-IT', 'ja-JP', 'ko-KR', 'zh-CN', 'pt-BR', 'hi-IN', 'ar-EG', 'nl-NL', 'sv-SE', 'pl-PL', 'tr-TR', 'cy-GB', 'ga-IE', 'sw-KE', 'th-TH', 'vi-VN', 'uk-UA'];
const sec = s => Math.round(s * FPS);

function winLogo(cx, cy, sz, sp, col) {
  const g = sz * .06, q = (sz - g) / 2; let o = '';
  [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([i, j], n) => { const t = spring(sp - n * 3, { damping: 12 }); if (t > 0) o += `<rect x="${n1(cx - sz / 2 + i * (q + g))}" y="${n1(cy - sz / 2 + j * (q + g))}" width="${n1(q)}" height="${n1(q)}" fill="${col}" transform="translate(${n1((1 - t) * (i ? 30 : -30))} ${n1((1 - t) * (j ? 30 : -30))})" opacity="${n3(clamp01(t))}"/>`; });
  return o;
}
function piBoard(x, y, t, col) {
  if (t <= 0) return '';
  let o = `<rect x="0" y="0" width="230" height="150" rx="12" fill="#1F5F35" stroke="${col}" stroke-width="3"/><rect x="80" y="45" width="60" height="60" rx="4" fill="#222"/>`;
  for (let i = 0; i < 20; i++) o += `<circle cx="${18 + i * 10}" cy="14" r="3" fill="#E8C66A"/>`;
  [[0, 50], [0, 95]].forEach(([dx, dy]) => o += `<rect x="${200 + dx}" y="${dy}" width="40" height="34" rx="3" fill="#B8BCC8"/>`);
  return `<g transform="translate(${n1(x)} ${n1(y + (1 - t) * 40)})" opacity="${n3(t)}">${o}${txt(115, 182, 'runs on a Raspberry Pi', { size: 22, fill: col, anchor: 'middle' })}</g>`;
}
function floppy(x, y, s, col, op) { return op > .001 ? `<g transform="translate(${n1(x)} ${n1(y)}) scale(${n3(s)})" opacity="${n3(op)}"><path d="M0 0 H34 L40 6 V40 H0 Z" fill="${col}" fill-opacity=".85"/><rect x="8" y="0" width="20" height="13" fill="${COL.night}"/><rect x="22" y="2" width="4" height="9" fill="${col}"/><rect x="6" y="22" width="28" height="16" rx="2" fill="${COL.light}"/></g>` : ''; }
function gpuIcon(x, y, t, cross) {
  if (t <= 0) return '';
  let o = `<rect x="0" y="0" width="200" height="90" rx="10" fill="${COL.panel}" stroke="${COL.muted}" stroke-width="3"/><circle cx="60" cy="45" r="28" fill="none" stroke="${COL.muted}" stroke-width="3"/><circle cx="140" cy="45" r="28" fill="none" stroke="${COL.muted}" stroke-width="3"/><rect x="20" y="90" width="120" height="12" fill="${COL.muted}"/>${txt(100, 140, 'GPU', { size: 24, font: MONO, fill: COL.muted, anchor: 'middle' })}`;
  if (cross > 0) o += `<line x1="-14" y1="-14" x2="${n1(-14 + 228 * cross)}" y2="${n1(-14 + 130 * cross)}" stroke="#FF5A5A" stroke-width="10" stroke-linecap="round"/>`;
  return `<g transform="translate(${n1(x)} ${n1(y)})" opacity="${n3(t)}">${o}</g>`;
}

const EXTRA = {
  sapi(f, s, c, e) {
    const a = s.at.sapi;
    return winLogo(330, 680, 220, f - 4, e.col) + (() => { const t = prog(f, a + LEN('sapi') * .72, a + LEN('sapi') * .72 + 10, eback); return pill(560, 680, 'OFFLINE  ✓', { size: 30, fill: e.col, bg: e.col, bgOp: .12, stroke: e.col, sc: t, op: clamp01(t) }); })();
  },
  piper(f, s, c, e) {
    const a1 = s.at.piper1, a2 = s.at.piper2, n = PIPER_V.length;
    const pos = f < a2 ? mix(-14, 2, prog(f, a1 - 8, a1 + 22, eout)) : mix(2, 7 + n, prog(f, a2 - 4, a2 + 22, eout));
    let o = `<rect x="120" y="520" width="740" height="160" rx="18" fill="${COL.panel}" stroke="${COL.line}" stroke-width="2"/><rect x="120" y="573" width="740" height="54" fill="${e.col}" fill-opacity=".1"/>`;
    const base = Math.floor(pos), fr = pos - base;
    for (let i = -2; i <= 3; i++) { const dy = (i - fr) * 50, op = 1 - Math.abs(dy) / 85; if (op > 0) o += txt(490, 611 + dy, PIPER_V[((base + i) % n + n) % n], { size: 30, font: MONO, fill: Math.abs(dy) < 12 ? e.col : COL.muted, anchor: 'middle', op }); }
    o += txt(140, 505, 'VOICE', { size: 18, font: MONO, fill: COL.muted, ls: 3 });
    return o + piBoard(140, 715, prog(f, a1 + sec(1.92), a1 + sec(1.92) + 14, eout), e.col);
  },
  kitten(f, s, c, e) {
    const a = s.at.kitten, L = LEN('kitten'), p = prog(f, a + L * .45, a + L * .8, eout);
    const q = prog(f, a + L * .45 - 10, a + L * .45);
    let o = txt(120, 620, `${p >= 1 ? '< 25' : Math.max(1, Math.round(25 * p))} MB`, { size: 120, weight: 800, fill: e.col, op: q });
    o += txt(120, 670, 'the entire model', { size: 28, fill: COL.muted, op: q });
    for (let i = 0; i < 17; i++) { const t = prog(f, a + L * .5 + i * 2, a + L * .5 + i * 2 + 10, eback); o += floppy(120 + (i % 9) * 58, 720 + Math.floor(i / 9) * 60, .9 * t, e.col, clamp01(t)); }
    return o + txt(120, 870, '≈ 17 floppy disks', { size: 24, fill: COL.muted, op: prog(f, a + L * .8, a + L * .8 + 10) });
  },
  kokoro(f, s, c, e) {
    const a = s.at.kokoro1, t = prog(f, a + sec(1.22), a + sec(1.22) + 22, eout);
    let o = txt(120, 610, `${Math.round(82 * t)}M`, { size: 120, weight: 800, fill: e.col, op: clamp01(t * 3) }) + txt(400, 610, 'parameters', { size: 32, fill: COL.muted, op: t });
    [['af_heart', 'US English', 'kokoro1'], ['bm_george', 'UK English', 'kokoro2'], ['ff_siwis', 'French', 'kokoro3']].forEach(([v, l, k], i) => {
      const st = s.at[k], on = c.k === k, seen = f >= st - 4, y = 690 + i * 64;
      o += pill(120, y, v, { size: 26, font: MONO, fill: on ? COL.night : COL.light, bg: on ? e.col : COL.panel, stroke: seen ? e.col : COL.line, op: seen ? 1 : .35, sc: on ? 1 + .06 * Math.sin(Math.PI * prog(f, st, st + 10)) : 1 });
      o += txt(370, y + 9, l, { size: 24, fill: on ? e.col : COL.muted, op: seen ? 1 : .35 });
    });
    return o;
  },
  super(f, s, c, e) {
    let o = ''; const L4 = [['EN', 'super1'], ['ES', 'super2'], ['DE', 'super3'], ['KO', 'super4']];
    L4.forEach(([l, k], i) => { const st = s.at[k], on = c.k === k, seen = f >= st - 4, t = prog(f, st - 4, st + 8, eback); o += pill(120 + i * 150, 560, l, { size: 40, weight: 800, fill: on ? COL.night : e.col, bg: on ? e.col : COL.panel, stroke: e.col, padX: 26, op: seen ? 1 : .3, sc: seen ? mix(.8, 1, t) : .9 }); });
    for (let i = 0; i < 31; i++) {
      const lk = { 0: 'super1', 7: 'super2', 13: 'super3', 22: 'super4' }[i], lit = lk && f >= s.at[lk] - 4, x = 136 + (i % 11) * 62, y = 680 + Math.floor(i / 11) * 62;
      o += `<circle cx="${x}" cy="${y}" r="${lit ? 16 : 11}" fill="${lit ? e.col : COL.line}" opacity="${n3(prog(f, 4 + i, 14 + i))}"/>`;
    }
    return o + txt(120, 880, '31 languages · one 99M-param model', { size: 24, fill: COL.muted, op: prog(f, 20, 34) });
  },
  pocket(f, s, c, e) {
    const a = s.at.pocket1, cx = 330, cy = 800, R = 190, mx = 4;
    const v = mix(0, 3.2, prog(f, a + sec(3.2), a + sec(4.56), eout)) + .05 * Math.sin(f * .7) * prog(f, a + sec(4.56), a + sec(4.8));
    const ang = q => Math.PI * (1 + q / mx);
    let o = `<path d="M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}" fill="none" stroke="${COL.line}" stroke-width="18" stroke-linecap="round"/><path d="M${cx - R} ${cy} A${R} ${R} 0 0 1 ${n1(cx + Math.cos(ang(v)) * R)} ${n1(cy + Math.sin(ang(v)) * R)}" fill="none" stroke="${e.col}" stroke-width="18" stroke-linecap="round"/>`;
    for (let q = 0; q <= mx; q++) o += txt(cx + Math.cos(ang(q)) * (R + 40), cy + Math.sin(ang(q)) * (R + 40) + 8, `${q}×`, { size: 22, font: MONO, fill: q === 1 ? COL.light : COL.muted, anchor: 'middle' });
    o += `<line x1="${cx}" y1="${cy}" x2="${n1(cx + Math.cos(ang(v)) * (R - 30))}" y2="${n1(cy + Math.sin(ang(v)) * (R - 30))}" stroke="${COL.light}" stroke-width="6" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="12" fill="${COL.light}"/>`;
    o += txt(cx, cy + 50, 'speed vs real time', { size: 22, fill: COL.muted, anchor: 'middle' });
    const b = s.at.pocket2; return `<g opacity="${n3(prog(f, 4, 16))}">${o}</g>` + gpuIcon(620, 640, prog(f, b - 6, b + 6), prog(f, b + sec(.3), b + sec(.3) + 10, eout));
  },
  cb(f, s, c, e) {
    const a2 = s.at.cb2, a3 = s.at.cb3, fade = 1 - prog(f, a3 - 8, a3 + 4);
    const val = mix(.25, 1.3, prog(f, a2 - 6, a2 + 14, eback)), shake = c.k === 'cb2' ? envAt('cb2', c.lf) * 4 * Math.sin(f * 2.1) : 0, X = v => 160 + v / 2 * 640;
    let o = '';
    if (fade > 0) {
      o += txt(160, 545, 'exaggeration', { size: 24, font: MONO, fill: COL.muted }) + txt(800, 545, val.toFixed(2), { size: 30, font: MONO, fill: e.col, anchor: 'end' });
      o += `<line x1="160" y1="620" x2="800" y2="620" stroke="${COL.line}" stroke-width="10" stroke-linecap="round"/><line x1="160" y1="620" x2="${n1(X(val))}" y2="620" stroke="${e.col}" stroke-width="10" stroke-linecap="round"/><circle cx="${n1(X(val) + shake)}" cy="${n1(620 - Math.abs(shake))}" r="22" fill="${COL.light}" stroke="${e.col}" stroke-width="5"/>`;
      o += txt(160, 680, 'calm', { size: 26, fill: val < .7 ? e.col : COL.muted }) + txt(800, 680, 'excited!', { size: 26, fill: val > .7 ? e.col : COL.muted, anchor: 'end' });
      o = `<g opacity="${n3(fade)}">${o}</g>`;
    }
    const t3 = prog(f, a3 - 2, a3 + 14, eout);
    if (t3 > 0) {
      let q = txt(120, 560, 'a few seconds of the narrator…', { size: 24, fill: COL.muted });
      q += waveBars('n_title', 120, 630, 300, 80, 1e9, COL.light, 46);
      q += `<path d="M450 630 H520 M500 612 L522 630 L500 648" fill="none" stroke="${e.col}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
      q += txt(550, 560, '…cloned', { size: 24, fill: e.col }) + waveBars('cb3', 550, 630, 300, 80, f - a3, e.col, 46);
      const fam = prog(f, a3 + sec(3.56), a3 + sec(3.56) + 12, eback);
      q += pill(490, 780, 'Sound familiar?', { size: 34, anchor: 'middle', fill: e.col, bg: e.col, bgOp: .14, stroke: e.col, sc: fam, op: clamp01(fam) });
      o += `<g opacity="${n3(t3)}">${q}</g>`;
    }
    return o;
  },
  edge(f, s, c, e) {
    const a = s.at.edge1, b = s.at.edge2, t0 = a + sec(5.66) - 30; let o = '';
    LOCALES.forEach((l, i) => {
      const t = prog(f, t0 + i * 1.5, t0 + i * 1.5 + 10, eback), hi = l === 'en-AU' && f >= b - 4;
      o += pill(120 + (i % 4) * 182, 540 + Math.floor(i / 4) * 58, l, { size: 24, font: MONO, padX: 22, fill: hi ? COL.night : COL.light, bg: hi ? e.col : COL.panel, stroke: hi ? e.col : COL.line, sc: t * (hi ? 1.12 : 1), op: clamp01(t) });
    });
    return o + txt(120, 905, '…and hundreds more voices', { size: 24, fill: COL.muted, op: prog(f, t0 + 40, t0 + 52) });
  },
};

function sCard(f, d, s, e, idx) {
  const keys = CARD_CLIPS[e.id], c = cur(s, f, keys), fade = fadeIO(f, d, 10, 10), nm = spring(f - 2, { damping: 13, stiffness: 160 });
  let o = bg(f, e.id, 1, 480, 400) + `<g opacity="${n3(fade)}">`;
  o += txt(120, 130, `MEET THE CAST  ${String(idx + 1).padStart(2, '0')} / 08`, { size: 22, font: MONO, fill: COL.muted, ls: 4, op: prog(f, 0, 10) });
  o += `<g transform="translate(${n1((1 - nm) * -60)} 0)">${txt(120, 300, e.name, { size: 96, weight: 800, fill: e.col, op: clamp01(nm * 1.4) })}</g>`;
  o += txt(122, 360, e.maker, { size: 30, fill: COL.light, op: prog(f, 6, 18) });
  let tx = 120; e.tags.forEach((tg, i) => { const t = prog(f, 8 + i * 3, 20 + i * 3, eback); o += pill(tx, 430, tg, { size: 22, sc: t, op: clamp01(t), stroke: e.col }); tx += pillW(tg, 22) + 12; });
  o += EXTRA[e.id](f, s, c, e);
  // right panel: orb, voice id, waveform, karaoke subtitle
  const pin = prog(f, 0, 14, eout);
  o += `<g opacity="${n3(pin)}" transform="translate(${n1((1 - pin) * 40)} 0)"><rect x="960" y="170" width="840" height="710" rx="28" fill="${COL.panel}" fill-opacity=".72" stroke="${COL.line}" stroke-width="2"/>`;
  o += orb(1380, 370, 100, c.on ? envAt(c.k, c.lf) : 0, e.col, f);
  o += txt(1380, 575, `voice: ${VOICE_ID[c.k]}`, { size: 26, font: MONO, fill: COL.muted, anchor: 'middle' });
  o += waveBars(c.k, 1010, 650, 740, 80, c.started ? c.lf : 0, e.col);
  const ko = c.k === 'super4', tr = TRANS[c.k];
  o += subtitle(SUBS[c.k], 1380, tr ? 760 : 780, 740, c.started ? c.p : 0, e.col, { size: 34, font: ko ? KR : SANS });
  if (tr) o += txt(1380, 842, tr, { size: 26, italic: true, fill: COL.muted, anchor: 'middle', op: prog(c.lf, 4, 14) });
  o += '</g>';
  o += chipRow(W / 2, 985, ENG, 12, { size: 18 }, i => ({ active: i <= idx, op: i === idx ? 1 : .55 }));
  return o + '</g>';
}
const CARDS = ENG.map((e, i) => {
  const s = mk(e.id, (f, d, s) => sCard(f, d, s, e, i));
  fx(s, 'whoosh', 0); wait(s, 16);
  CARD_CLIPS[e.id].forEach((k, j, a) => say(s, k, j < a.length - 1 ? 6 : 0));
  return wait(s, 20);
});
