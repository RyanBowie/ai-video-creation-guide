
// ============================================================ voice showcase: helpers
function txt(x, y, s, o = {}) {
  const { size = 32, weight = 600, font = SANS, fill = COL.light, anchor = 'start', op = 1, ls = 0, italic = false, extra = '' } = o;
  if (op <= 0.001) return '';
  return `<text x="${n1(x)}" y="${n1(y)}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" opacity="${n3(op)}"${ls ? ` letter-spacing="${ls}"` : ''}${italic ? ' font-style="italic"' : ''}${extra}>${esc(String(s))}</text>`;
}
const pillW = (s, size = 24, weight = 600, font = SANS, padX = 18) => measure(s, size, weight, font) + padX * 2;
function pill(x, y, s, o = {}) {
  const { size = 24, weight = 600, font = SANS, fill = COL.light, bg = COL.panel, bgOp = 1, stroke = COL.line, op = 1, padX = 18, anchor = 'start', sc = 1 } = o;
  if (op <= 0.001 || sc <= 0.001) return '';
  const h = o.h || size * 1.75, w = pillW(s, size, weight, font, padX), cx = anchor === 'middle' ? x : x + w / 2;
  return `<g opacity="${n3(op)}" transform="translate(${n1(cx)} ${n1(y)}) scale(${n3(sc)})"><rect x="${n1(-w / 2)}" y="${n1(-h / 2)}" width="${n1(w)}" height="${n1(h)}" rx="${n1(h / 2)}" fill="${bg}" fill-opacity="${n3(bgOp)}" stroke="${stroke}" stroke-width="2"/><text x="0" y="${n1(size * 0.35)}" text-anchor="middle" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text></g>`;
}
function wrap(str, maxW, size, weight = 600, font = SANS) {
  const out = [[]]; let w = 0; const sp = measure(' ', size, weight, font);
  str.split(' ').forEach(t => { const tw = measure(t, size, weight, font); if (out[out.length - 1].length && w + sp + tw > maxW) { out.push([]); w = 0; } w += (out[out.length - 1].length ? sp : 0) + tw; out[out.length - 1].push(t); });
  return out;
}
const fadeIO = (f, d, a = 10, b = 12) => Math.min(prog(f, 0, a), 1 - prog(f, d - b, d));

// ============================================================ engines + clips
const ENG = [
  { id: 'sapi', name: 'Windows SAPI', maker: 'Microsoft · built into Windows', col: '#7FB2FF', tags: ['Built in', 'Offline', 'Since 1995'] },
  { id: 'piper', name: 'Piper', maker: 'Open Home Foundation · Rhasspy', col: '#8BE38B', tags: ['ONNX', 'GPL-3.0', 'Hundreds of voices'] },
  { id: 'kitten', name: 'Kitten TTS', maker: 'KittenML · nano model', col: '#FF9ED2', tags: ['< 25 MB', 'Apache-2.0', 'CPU'] },
  { id: 'kokoro', name: 'Kokoro', maker: 'hexgrad · Kokoro-82M', col: COL.gold, tags: ['82M params', 'Apache-2.0', '54 voices'] },
  { id: 'super', name: 'Supertonic', maker: 'Supertone · on-device ONNX', col: COL.teal, tags: ['MIT code · OpenRAIL-M weights', '31 languages'] },
  { id: 'pocket', name: 'Pocket TTS', maker: 'Kyutai · 100M params', col: '#B59BFF', tags: ['CPU real-time', 'MIT code · CC-BY-4.0 weights'] },
  { id: 'cb', name: 'Chatterbox', maker: 'Resemble AI · 500M params', col: '#FF7A59', tags: ['MIT', 'Emotion control', 'Voice cloning'] },
  { id: 'edge', name: 'Edge TTS', maker: 'Microsoft neural voices · edge-tts', col: '#4CD7FF', tags: ['Cloud', 'No API key', '70+ languages'] },
];
const EI = Object.fromEntries(ENG.map((e, i) => [e.id, i]));
const engOf = k => ENG[EI[k.replace(/^[rf]_/, '').replace(/\d+$/, '')]];
const XDEFS = ENG.map(e => `<radialGradient id="g_${e.id}"><stop offset="0" stop-color="${e.col}" stop-opacity=".20"/><stop offset=".6" stop-color="${e.col}" stop-opacity=".05"/><stop offset="1" stop-color="${e.col}" stop-opacity="0"/></radialGradient>`).join('')
  + `<radialGradient id="g_white"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
const glow = (id, cx, cy, r, op = 1) => op > .001 ? `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" fill="url(#g_${id})" opacity="${n3(op)}"/>` : '';
const bg = (F, id, op = 1, cx = 480, cy = 420) => bgNight() + `<g opacity=".35">${stars(F, F * .4)}</g>` + (id ? glow(id, cx, cy, 900, op) : '');
const VOICE_ID = {
  r_sapi: 'Microsoft David Desktop', r_piper: 'en_US-ryan-high', r_kitten: 'expr-voice-3-m', r_kokoro: 'bm_george', r_super: 'F2', r_pocket: 'alba', r_cb: 'default voice', r_edge: 'en-US-AvaMultilingualNeural',
  sapi: 'Microsoft David Desktop', piper1: 'en_US-ryan-high', piper2: 'en_GB-northern_english_male-medium', kitten: 'expr-voice-4-f',
  kokoro1: 'af_heart', kokoro2: 'bm_george', kokoro3: 'ff_siwis', super1: 'M1 · English', super2: 'F1 · Spanish', super3: 'M3 · German', super4: 'F3 · Korean',
  pocket1: 'javert', pocket2: 'alba', cb1: 'exaggeration 0.25', cb2: 'exaggeration 1.3', cb3: 'zero-shot clone', edge1: 'en-US-AvaMultilingualNeural', edge2: 'en-AU-NatashaNeural',
};
const SUBS = {
  sapi: 'Hello. I am Microsoft David. I come built into Windows, and I work completely offline.',
  piper1: "I'm Piper. I'm small enough to run on a Raspberry Pi, and I come in hundreds of voices,",
  piper2: 'including this one, from the north of England.',
  kitten: "I'm Kitten TTS. My whole model is under 25 megabytes.",
  kokoro1: "I'm Kokoro. Just 82 million parameters,", kokoro2: 'more than 50 voices,', kokoro3: 'et je parle aussi français.',
  super1: "I'm Supertonic. I speak 31 languages.", super2: 'Hablo español,', super3: 'spreche Deutsch,', super4: '한국어도 할 수 있어요.',
  pocket1: "I'm Pocket TTS, from Kyutai. I talk faster than real time, on a laptop CPU.", pocket2: 'No graphics card required.',
  cb1: "Hi, I'm Chatterbox. I can keep things calm, and measured.", cb2: 'Or I can get really, really excited about it!',
  cb3: 'I can even clone a voice from a few seconds of audio. Sound familiar?',
  edge1: "And I'm a Microsoft neural voice, through edge-tts. Hundreds of voices, in over 70 languages.", edge2: "G'day from Australia, too!",
};
const TRANS = { kokoro3: '“…and I speak French too.”', super2: '“I speak Spanish,”', super3: '“…speak German,”', super4: '“I can speak Korean too.”' };
const KR = "'Malgun Gothic','Segoe UI',sans-serif";

// ============================================================ timeline builder (frames, relative to scene)
const LEN = k => (window.VENV && VENV[k]) ? VENV[k].length : Math.round(((window.VDUR || {})[k] || 1) * FPS);
function mk(name, fn) { const s = { name, cues: [], sfx: [], t: 0, at: {} }; s.render = (f, d) => fn(f, d, s); return s; }
function say(s, k, gap = 0) { s.cues.push([k, s.t]); s.at[k] = s.t; s.t += LEN(k) + gap; return s; }
const wait = (s, n) => (s.t += n, s);
const fx = (s, name, rel) => (s.sfx.push([rel ?? s.t, name]), s);
const envAt = (k, lf) => { const v = window.VENV && VENV[k]; return v && lf >= 0 && lf < v.length ? v[Math.floor(lf)] : 0; };
// the latest clip (of keys) that has started by scene frame f
function cur(s, f, keys) {
  let k = null; for (const q of keys) if (s.at[q] != null && f >= s.at[q]) k = q;
  if (!k) return { k: keys[0], lf: f - s.at[keys[0]], p: 0, on: false, started: false };
  const lf = f - s.at[k], L = LEN(k); return { k, lf, p: clamp01(lf / L), on: lf < L, started: true };
}
// word highlight proportional to character count (clips carry a little lead/tail silence)
function litCount(ws, p) {
  const tot = ws.reduce((a, w) => a + w.length + 1, 0), q = clamp01((p - .04) / .88); let acc = 0, n = 0;
  if (q <= 0) return 0; for (const w of ws) { if (q * tot >= acc) n++; acc += w.length + 1; } return n;
}
function subtitle(str, cx, y, maxW, p, col, o = {}) {
  const { size = 34, weight = 600, font = SANS, lh = 1.3, op = 1 } = o;
  const lines = wrap(str, maxW, size, weight, font), all = lines.flat(), lit = litCount(all, p), done = p >= 1;
  const sp = measure(' ', size, weight, font); let idx = 0, out = '';
  const y0 = y - (lines.length - 1) * size * lh / 2;
  lines.forEach((ln, li) => {
    const ws = ln.map(w => measure(w, size, weight, font)); let x = cx - (ws.reduce((a, b) => a + b, 0) + sp * (ln.length - 1)) / 2;
    ln.forEach((w, wi) => {
      const i = idx++, fill = done || i < lit - 1 ? COL.light : i === lit - 1 ? col : COL.muted, a = done || i < lit ? 1 : .4;
      out += txt(x, y0 + li * size * lh, w, { size, weight, font, fill, op: a * op }); x += ws[wi] + sp;
    });
  });
  return out;
}
// waveform of a whole clip: played part coloured + playhead
function waveBars(k, x, y, w, h, lf, col, n = 110, op = 1) {
  const v = (window.VENV && VENV[k]) || [], L = v.length || 1, bw = w / n; let out = '';
  for (let i = 0; i < n; i++) {
    let m = 0; for (let j = Math.floor(i * L / n); j < Math.max(Math.floor(i * L / n) + 1, Math.floor((i + 1) * L / n)); j++) m = Math.max(m, v[j] || 0);
    const bh = Math.max(4, m * h), played = (i + .5) / n * L <= lf;
    out += `<rect x="${n1(x + i * bw + bw * .2)}" y="${n1(y - bh / 2)}" width="${n1(bw * .6)}" height="${n1(bh)}" rx="${n1(bw * .3)}" fill="${played ? col : COL.line}"/>`;
  }
  const px = x + clamp01(lf / L) * w;
  if (lf > 0 && lf < L) out += `<line x1="${n1(px)}" y1="${n1(y - h / 2 - 10)}" x2="${n1(px)}" y2="${n1(y + h / 2 + 10)}" stroke="${COL.light}" stroke-width="2" opacity=".7"/>`;
  return op > .001 ? `<g opacity="${n3(op)}">${out}</g>` : '';
}
// voice orb: radial bars driven by the clip envelope
function orb(cx, cy, r, amp, col, F, op = 1) {
  if (op <= .001) return '';
  let out = `<circle cx="${cx}" cy="${cy}" r="${n1(r * 2.2)}" fill="${col}" opacity="${n3(.04 + amp * .1)}"/><circle cx="${cx}" cy="${cy}" r="${n1(r * (1 + amp * .06))}" fill="${COL.night}" stroke="${col}" stroke-width="4"/>`;
  for (let i = 0; i < 64; i++) {
    const a = i / 64 * Math.PI * 2, wob = .55 + .45 * Math.abs(Math.sin(F * .45 + i * 1.7 + rnd(i) * 6)), L = 8 + amp * 90 * wob * (.6 + .4 * rnd(i + 3));
    out += `<line x1="${n1(cx + Math.cos(a) * (r + 14))}" y1="${n1(cy + Math.sin(a) * (r + 14))}" x2="${n1(cx + Math.cos(a) * (r + 14 + L))}" y2="${n1(cy + Math.sin(a) * (r + 14 + L))}" stroke="${col}" stroke-width="5" stroke-linecap="round" opacity="${n3(.3 + amp * .7)}"/>`;
  }
  for (let i = -3; i <= 3; i++) { const hh = Math.max(6, (14 + amp * 46) * (1 - Math.abs(i) * .2) * (.65 + .35 * Math.abs(Math.sin(F * .6 + i * 1.3)))); out += `<rect x="${n1(cx + i * 17 - 5)}" y="${n1(cy - hh)}" width="10" height="${n1(hh * 2)}" rx="5" fill="${col}"/>`; }
  return `<g opacity="${n3(op)}">${out}</g>`;
}
// engine chip (coloured dot + name)
const chipW = (e, size = 24) => pillW(e.name, size, 600, SANS, 20) + size * .9;
function chip(cx, cy, e, o = {}) {
  const { size = 24, op = 1, sc = 1, active = true } = o;
  if (op <= .001 || sc <= .001) return '';
  const w = chipW(e, size), h = size * 1.9;
  return `<g opacity="${n3(op)}" transform="translate(${n1(cx)} ${n1(cy)}) scale(${n3(sc)})"><rect x="${n1(-w / 2)}" y="${n1(-h / 2)}" width="${n1(w)}" height="${n1(h)}" rx="${n1(h / 2)}" fill="${active ? e.col : COL.panel}" fill-opacity="${active ? .16 : 1}" stroke="${active ? e.col : COL.line}" stroke-width="2"/><circle cx="${n1(-w / 2 + size * .95)}" cy="0" r="${n1(size * .3)}" fill="${active ? e.col : COL.muted}"/><text x="${n1(size * .45)}" y="${n1(size * .35)}" text-anchor="middle" font-family="${SANS}" font-size="${size}" font-weight="600" fill="${active ? COL.light : COL.muted}">${esc(e.name)}</text></g>`;
}
function chipRow(cx, cy, list, gap, o = {}, per = () => ({})) {
  const ws = list.map(e => chipW(e, o.size || 24)), tot = ws.reduce((a, b) => a + b, 0) + gap * (list.length - 1); let x = cx - tot / 2, out = '';
  list.forEach((e, i) => { out += chip(x + ws[i] / 2, cy, e, { ...o, ...per(i, e) }); x += ws[i] + gap; }); return out;
}
