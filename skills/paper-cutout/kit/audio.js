// audio.js — voiceover + synthesised paper SFX + a bouncy synthesised score, offline export, and the player loop.
'use strict';
const VO_CUES = [['intro', 22, 'narr'], ['monday', 100, 'narr'], ['partner', 338, 'narr'], ['attack', 448, 'narr'], ['win', 585, 'narr'], ['outro', 712, 'narr']];
const SFX_CUES = [
  [8, 'rustle'], [16, 'pop'], [24, 'paperflip'], [55, 'pop'], [92, 'fold'],
  [100, 'paperflip'], [132, 'pop'], [140, 'select'], [162, 'sip'], [196, 'type'], [200, 'rustle'], [228, 'rumble'], [230, 'pop'], [243, 'boom'], [250, 'hit'],
  [268, 'paperflip'], [292, 'thunk'], [298, 'pop'], [305, 'whoosh'], [312, 'hit'], [318, 'whoosh'], [325, 'hit'], [331, 'whoosh'], [338, 'hit'],
  [350, 'select'], [362, 'select'], [372, 'select'], [374, 'confirm'], [382, 'fold'], [392, 'paperflip'], [404, 'chime'],
  [420, 'pop'], [424, 'ring'], [450, 'key'], [456, 'whoosh'], [468, 'hit'], [494, 'sparkle'], [504, 'hit'], [537, 'stamp'],
  [548, 'fold'], [552, 'fold'], [558, 'whoosh'], [576, 'paperflip'], [582, 'cheer'], [586, 'pop'], [590, 'click'], [610, 'click'], [627, 'click'],
  [662, 'stamp'], [658, 'levelup'], [690, 'rustle'], [712, 'thunk'], [758, 'pop'], [812, 'pop'], [842, 'pop'], [862, 'chime'],
];

// ---- score: [frame, midi, lenFrames, instrument, velocity]. 120 bpm -> 15 frames/beat, 7.5 frames/eighth
const SCORE = (() => {
  const S = [], N = (f, m, d, i, v = 1) => S.push([f, m, d, i, v]), E = 7.5;
  const tri = (r, minor) => [r, r + (minor ? 3 : 4), r + 7];
  const bouncy = (f0, chords, len, lead, inst) => chords.forEach(([r, mi], c) => {
    const f = f0 + c * len, t = tri(r, mi);
    for (let b = 0; b < len / 15; b++) N(f + b * 15, (b % 2 ? r + 7 : r) - 12, 6, 'bass', .9);
    for (let e = 0; e < len / E; e++) N(f + e * E, t[[0, 1, 2, 1][e % 4]] + 12, 5, inst, .45);
    (lead[c] || []).forEach((m, e) => m && N(f + e * E, m, E * 1.6, 'whistle', .7));
  });
  // music-box title (0-98)
  [72, 76, 79, 84, 83, 79, 76, 74, 72, 76, 79, 83, 84].forEach((m, i) => N(6 + i * E, m, 24, 'box', .9));
  [[48, 0], [53, 30], [55, 60]].forEach(([m, f]) => tri(m, 0).forEach(x => N(6 + f, x, 30, 'pad', .5)));
  // office (98-218): C Am F G, bouncy bass + pluck + whistled tune
  bouncy(98, [[48], [45, 1], [41], [43]], 30, [[76, 0, 79, 81], [79, 0, 76, 0], [77, 81, 84, 81], [79, 0, 74, 77]], 'pluck');
  [79, 78, 77, 76].forEach((m, i) => N(218 + i * 3, m, 4, 'pluck', .8));                       // uh-oh slide
  for (let f = 228; f < 266; f += 3.75) N(f, 33 + (Math.floor(f / 7.5) % 2), 4, 'bass', .55);   // tension tremolo
  // battle (296-404): Am F Dm E, driving eighths + hats
  const drive = (f0, chords, len, lead) => chords.forEach(([r, mi], c) => {
    const f = f0 + c * len, t = tri(r, mi);
    for (let e = 0; e < len / E; e++) { N(f + e * E, (e % 4 === 3 ? r + 12 : r) - 12, 5, 'bass', .8); N(f + e * E + 3.75, 0, 2, 'hat', e % 2 ? .6 : .35); }
    for (let b = 0; b < len / 15; b++) N(f + b * 15, 0, 3, 'kick', b % 2 ? .6 : 1);
    (lead[c] || []).forEach((m, e) => m && N(f + e * E, m, E * 1.2, 'lead', .55));
    if (!lead[c]) t.forEach(x => N(f, x + 12, len - 2, 'pad', .35));
  });
  drive(296, [[45, 1], [41], [38, 1], [40]], 27, [[69, 72, 76, 72], [65, 69, 72, 69], [62, 65, 69, 65], [64, 68, 71, 68]]);
  // hero theme once Copilot joins (404-576): C G Am F
  drive(404, [[48], [43], [45, 1], [41], [48], [43]], 28.5, [[72, 76, 79, 0], [74, 79, 83, 0], [76, 72, 69, 72], [77, 76, 74, 72], [79, 0, 84, 0], [83, 0, 79, 81]]);
  // victory fanfare (582-650) then a little dance loop
  [[582, 67, 4], [586, 67, 4], [590, 67, 4], [594, 72, 14], [610, 71, 6], [616, 72, 6], [622, 76, 26]].forEach(([f, m, d]) => { N(f, m, d, 'brass', 1); N(f, m - 12, d, 'brass', .5); });
  [[594, 48], [622, 48]].forEach(([f, r]) => tri(r, 0).forEach(x => N(f, x + 12, 26, 'pad', .6)));
  bouncy(650, [[48], [41]], 20, [[84, 0, 79], [81, 0, 77]], 'pluck');
  // curtain-call reprise (716-899)
  [76, 79, 84, 83, 79, 76, 74, 72, 76, 79, 83, 84, 86, 84].forEach((m, i) => N(716 + i * 10, m, 30, 'box', .75));
  [[48, 716], [53, 756], [55, 796], [48, 836]].forEach(([m, f]) => tri(m, 0).forEach(x => N(f, x, 40, 'pad', .55)));
  [60, 64, 67, 72, 76].forEach((m, i) => N(862 + i * 2, m, 38, 'box', .8));
  return S;
})();
const MIDI = m => 440 * Math.pow(2, (m - 69) / 12);

const AU = { ctx: null, bufs: {}, live: [], on: true };
function b64buf(b64) { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; }
async function audioInit() { if (AU.ctx) { if (AU.ctx.state !== 'running') await AU.ctx.resume(); return; } await audioSetup(AU.ctx = new AudioContext()); }
async function audioSetup(ctx) {
  AU.master = ctx.createDynamicsCompressor(); AU.master.threshold.value = -14; AU.master.ratio.value = 3;
  const mg = ctx.createGain(); mg.gain.value = .9; AU.master.connect(mg).connect(ctx.destination);
  const len = ctx.sampleRate * 1.6, ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.5); }
  AU.verb = ctx.createConvolver(); AU.verb.buffer = ir; AU.verb.connect(AU.master);
  AU.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const nd = AU.noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  AU.mus = ctx.createGain(); AU.mus.gain.value = .55; AU.mus.connect(AU.master); AU.mus.connect(vol(ctx, .25)).connect(AU.verb);
  if (window.VOICE) await Promise.all(Object.entries(VOICE).map(async ([k, v]) => { AU.bufs[k] = await ctx.decodeAudioData(b64buf(v)); }));
}
const vol = (ctx, v) => { const g = ctx.createGain(); g.gain.value = v; return g; };
function playClip(key, offset) {
  const b = AU.bufs[key]; if (!b || offset >= b.duration) return;
  const src = AU.ctx.createBufferSource(); src.buffer = b; const g = vol(AU.ctx, 1.1); src.connect(g); g.connect(AU.master); g.connect(vol(AU.ctx, .05)).connect(AU.verb);
  src.start(AU.at ?? 0, Math.max(0, offset)); AU.live.push(src);
}
function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
function noiseSrc(t, dur) { const s = AU.ctx.createBufferSource(); s.buffer = AU.noise; s.loop = true; s.start(t, Math.random()); s.stop(t + dur); AU.live.push(s); return s; }
function osc(type, f, t, dur) { const o = AU.ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.start(t); o.stop(t + dur); AU.live.push(o); return o; }
function filt(type, f, q = 1) { const b = AU.ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }

// one score note at absolute context time t
function note(t, m, dur, inst, v) {
  const ctx = AU.ctx, g = ctx.createGain(), out = AU.mus, f = MIDI(m);
  if (inst === 'box') { env(g, t, .004, .09 * v, Math.max(.6, dur)); osc('sine', f, t, dur + .8).connect(g); const g2 = ctx.createGain(); env(g2, t, .002, .03 * v, .25); osc('triangle', f * 3, t, .4).connect(g2); g2.connect(out); }
  else if (inst === 'pad') { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.035 * v, t + .12); g.gain.setValueAtTime(.035 * v, t + dur * .8); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .3); osc('triangle', f, t, dur + .4).connect(g); }
  else if (inst === 'bass') { env(g, t, .004, .16 * v, dur + .05); osc('triangle', f, t, dur + .2).connect(filt('lowpass', 900)).connect(g); }
  else if (inst === 'pluck') { env(g, t, .003, .05 * v, dur + .06); osc('square', f, t, dur + .15).connect(filt('lowpass', 1800)).connect(g); }
  else if (inst === 'lead') { env(g, t, .005, .05 * v, dur + .08); const o = osc('square', f, t, dur + .2); o.connect(filt('lowpass', 2400)).connect(g); }
  else if (inst === 'whistle') { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.06 * v, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .1); const o = osc('sine', f, t, dur + .2), lfo = osc('sine', 6, t, dur + .2), lg = vol(ctx, f * .012); lfo.connect(lg).connect(o.frequency); o.connect(g); }
  else if (inst === 'brass') { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.07 * v, t + .03); g.gain.setValueAtTime(.06 * v, t + dur * .7); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .12); const lp = filt('lowpass', 900); lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(3200, t + .06); osc('sawtooth', f, t, dur + .2).connect(lp).connect(g); }
  else if (inst === 'hat') { env(g, t, .001, .03 * v, .04); noiseSrc(t, .06).connect(filt('highpass', 7000)).connect(g); }
  else if (inst === 'kick') { env(g, t, .002, .22 * v, .14); const o = osc('sine', 130, t, .2); o.frequency.exponentialRampToValueAtTime(45, t + .12); o.connect(g); }
  g.connect(out);
}
// lay the score (and VO ducking) from frame F0 onwards; t0 = context time of frame F0
function scoreFrom(F0, t0) {
  const at = F => t0 + (F - F0) / FPS;
  for (const [f, m, d, inst, v] of SCORE) if (f >= F0) note(at(f), m, d / FPS, inst, v);
  const gp = AU.mus.gain; gp.cancelScheduledValues(t0); gp.setValueAtTime(.55, t0);
  for (const [k, f] of VO_CUES) { const e = f + ((window.VT && VT[k] && VT[k].dur) || 3) * FPS; if (e < F0) continue; gp.setValueAtTime(.55, Math.max(t0, at(f - 4))); gp.linearRampToValueAtTime(.3, Math.max(t0 + .01, at(f))); gp.setValueAtTime(.3, Math.max(t0 + .02, at(e))); gp.linearRampToValueAtTime(.55, Math.max(t0 + .03, at(e + 8))); }
}

function sfx(name) {
  const ctx = AU.ctx, t = AU.at ?? ctx.currentTime + .01, M = AU.master, V = AU.verb;
  const route = (node, dry, wet = 0) => { node.connect(vol(ctx, dry)).connect(M); if (wet) node.connect(vol(ctx, wet)).connect(V); };
  const nz = (d, dur, type, f, q, peak, a = .002) => { const n = noiseSrc(t + d, dur + .05), g = ctx.createGain(); env(g, t + d, a, peak, dur); n.connect(filt(type, f, q)).connect(g); return g; };
  if (name === 'chime') [523.3, 784, 1046.5, 1568].forEach((f, i) => { const g = ctx.createGain(); env(g, t + i * .07, .01, .1, 1.4); osc('sine', f, t + i * .07, 1.6).connect(g); route(g, 1, .5); });
  if (name === 'pop') { const o = osc('sine', 480, t, .14); o.frequency.exponentialRampToValueAtTime(1050, t + .08); const g = ctx.createGain(); env(g, t, .004, .2, .1); o.connect(g); route(g, 1, .15); route(nz(0, .03, 'bandpass', 3000, 1, .08), 1); }
  if (name === 'click') route(nz(0, .035, 'highpass', 3000, 1, .3, .001), 1);
  if (name === 'select') { const o = osc('square', 990, t, .07), g = ctx.createGain(); env(g, t, .002, .06, .05); o.connect(filt('lowpass', 3000)).connect(g); route(g, 1); }
  if (name === 'confirm') [880, 1320].forEach((f, i) => { const o = osc('square', f, t + i * .06, .12), g = ctx.createGain(); env(g, t + i * .06, .002, .07, .1); o.connect(filt('lowpass', 3500)).connect(g); route(g, 1, .2); });
  if (name === 'type') for (let i = 0; i < 12; i++) route(nz(i * .075, .03, 'bandpass', 2400 + i * 90, 2, .1, .001), 1);
  if (name === 'sip') route(nz(0, .25, 'bandpass', 900, 4, .05, .05), 1);
  if (name === 'paperflip') { for (let i = 0; i < 5; i++) route(nz(i * .045, .07, 'bandpass', 1800 + i * 500, 1.2, .22 - i * .03, .003), 1, .15); route(nz(0, .35, 'lowpass', 900, .7, .12, .05), 1); }
  if (name === 'fold') { for (let i = 0; i < 7; i++) route(nz(i * .035 + (i % 3) * .008, .025, 'bandpass', 3500 + (i % 3) * 1200, 3, .2, .001), 1); route(nz(.2, .08, 'lowpass', 1200, 1, .18), 1); }
  if (name === 'rustle') for (let i = 0; i < 8; i++) route(nz(i * .09, .14, 'bandpass', 1500 + (i % 4) * 700, 1.5, .07, .03), 1, .2);
  if (name === 'thunk' || name === 'stamp' || name === 'hit') { const o = osc('sine', name === 'hit' ? 220 : 150, t, .3); o.frequency.exponentialRampToValueAtTime(45, t + .18); const g = ctx.createGain(); env(g, t, .002, .75, .22); o.connect(g); route(g, 1, .15); route(nz(0, .07, 'lowpass', 2600, 1, .35, .001), 1); }
  if (name === 'stamp') { route(nz(0, .12, 'bandpass', 1200, .8, .3, .001), 1, .3); const o = osc('triangle', 660, t + .02, .3), g = ctx.createGain(); env(g, t + .02, .002, .06, .25); o.connect(g); route(g, 1, .4); }
  if (name === 'hit') { route(nz(0, .1, 'bandpass', 1600, 1, .3, .001), 1, .2); const o = osc('square', 300, t, .12); o.frequency.exponentialRampToValueAtTime(90, t + .1); const g = ctx.createGain(); env(g, t, .002, .06, .1); o.connect(g); route(g, 1); }
  if (name === 'whoosh') { const n = noiseSrc(t, .5), bp = filt('bandpass', 400, 1.2); bp.frequency.exponentialRampToValueAtTime(2800, t + .4); const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.2, t + .2); g.gain.exponentialRampToValueAtTime(.0001, t + .45); n.connect(bp).connect(g); route(g, 1, .3); }
  if (name === 'rumble') { const n = noiseSrc(t, 1.1), lp = filt('lowpass', 160, 2), g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.5, t + .3); g.gain.exponentialRampToValueAtTime(.0001, t + 1); n.connect(lp).connect(g); route(g, 1, .3); const o = osc('sine', 48, t, 1), og = ctx.createGain(); env(og, t, .2, .3, .7); o.connect(og); route(og, 1); }
  if (name === 'boom') { const o = osc('sine', 110, t, 1); o.frequency.exponentialRampToValueAtTime(30, t + .8); const g = ctx.createGain(); env(g, t, .004, .8, .85); o.connect(g); route(g, 1, .5); const n = noiseSrc(t, .9), lp = filt('lowpass', 1400); lp.frequency.exponentialRampToValueAtTime(120, t + .7); const ng = ctx.createGain(); env(ng, t, .002, .5, .75); n.connect(lp).connect(ng); route(ng, 1, .5); }
  if (name === 'ring') { for (let i = 0; i < 3; i++) { const o = osc('sine', 400 * (i + 1), t, 1); o.frequency.exponentialRampToValueAtTime(1300 * (i + 1), t + .9); const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.04, t + .85); g.gain.exponentialRampToValueAtTime(.0001, t + .95); o.connect(g); route(g, 1, .6); } }
  if (name === 'key') { route(nz(0, .04, 'bandpass', 2200, 1.5, .5, .001), 1); const o = osc('sine', 120, t, .15); o.frequency.exponentialRampToValueAtTime(50, t + .1); const g = ctx.createGain(); env(g, t, .002, .5, .1); o.connect(g); route(g, 1); [1318.5, 1760, 2637].forEach((f, i) => { const gg = ctx.createGain(); env(gg, t + .05 + i * .05, .005, .07, .7); osc('sine', f, t + .05 + i * .05, .9).connect(gg); route(gg, 1, .6); }); }
  if (name === 'sparkle') for (let i = 0; i < 9; i++) { const f = 1800 + ((i * 7) % 9) * 260, g = ctx.createGain(); env(g, t + i * .07, .003, .05, .3); osc('sine', f, t + i * .07, .4).connect(g); route(g, 1, .6); }
  if (name === 'levelup') [523.3, 659.3, 784, 1046.5, 1318.5].forEach((f, i) => { const g = ctx.createGain(); env(g, t + i * .06, .003, .06, .3); osc('square', f, t + i * .06, .4).connect(filt('lowpass', 4000)).connect(g); route(g, 1, .3); });
  if (name === 'cheer') { for (let i = 0; i < 3; i++) { const n = noiseSrc(t + i * .05, 1.8), bp = filt('bandpass', 900 + i * 600, .9), g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .35); g.gain.exponentialRampToValueAtTime(.0001, t + 1.8); n.connect(bp).connect(g); route(g, 1, .5); } for (let i = 0; i < 16; i++) route(nz(.1 + i * .09 + (i % 3) * .02, .02, 'bandpass', 2500, 2, .12, .001), 1, .2); }
}

// Offline render of the full soundtrack (used by export.py and av_check) -> base64 16-bit stereo WAV. Math.random seeded for determinism.
async function exportAudio() {
  const rnd0 = Math.random; let sd = 0x5EED;
  Math.random = () => { sd = (sd + 0x6D2B79F5) | 0; let t = Math.imul(sd ^ sd >>> 15, 1 | sd); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  try { return await renderSoundtrack(); } finally { Math.random = rnd0; }
}
async function renderSoundtrack() {
  const SR = 48000, ctx = new OfflineAudioContext(2, Math.ceil(TOTAL / FPS * SR), SR), keep = AU.ctx;
  AU.ctx = ctx; AU.live = []; await audioSetup(ctx);
  scoreFrom(0, 0);
  VO_CUES.forEach(([k, at]) => { AU.at = at / FPS; playClip(k, 0); });
  SFX_CUES.forEach(([at, n]) => { AU.at = at / FPS; sfx(n); });
  AU.at = null;
  const buf = await ctx.startRendering(); AU.ctx = keep; AU.live = [];
  const n = buf.length, L = buf.getChannelData(0), R = buf.getChannelData(1), dv = new DataView(new ArrayBuffer(44 + n * 4));
  const ws = (o, str) => [...str].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)));
  ws(0, 'RIFF'); dv.setUint32(4, 36 + n * 4, true); ws(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true);
  dv.setUint32(24, SR, true); dv.setUint32(28, SR * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true); ws(36, 'data'); dv.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) { dv.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); dv.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true); }
  const u = new Uint8Array(dv.buffer); let bin = ''; for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(bin);
}
function audioStop() { AU.live.forEach(n => { try { n.stop(); } catch (e) {} }); AU.live = []; if (AU.mus) { AU.mus.gain.cancelScheduledValues(0); AU.mus.gain.value = .55; } }
function audioSeek(F) {
  if (!AU.ctx || !AU.on) return; audioStop();
  const t0 = AU.ctx.currentTime + .03; scoreFrom(F, t0);
  VO_CUES.forEach(([k, at]) => { if (F >= at) { AU.at = t0; playClip(k, (F - at) / FPS); } }); AU.at = null;
}
function audioStep(prev, F) {
  if (!AU.ctx || !AU.on || AU.ctx.state !== 'running') return;
  VO_CUES.forEach(([k, at]) => { if (prev < at && F >= at) playClip(k, (F - at) / FPS); });
  SFX_CUES.forEach(([at, n]) => { if (prev < at && F >= at && F - at < 6) sfx(n); });
}

// ---- player
(function player() {
  const cv = document.getElementById('c'); CTX = cv.getContext('2d');
  const stage = document.getElementById('stage'), scrub = document.getElementById('scrub'), timeEl = document.getElementById('time'), playBtn = document.getElementById('play');
  scrub.max = TOTAL - 1;
  let frame = 0, playing = false, last = null;
  const show = F => { render(F); scrub.value = F; timeEl.textContent = (F / FPS).toFixed(1) + 's / ' + (TOTAL / FPS).toFixed(1) + 's'; };
  const fit = () => { const k = Math.min(innerWidth / W, (innerHeight - (document.body.classList.contains('clean') ? 0 : 56)) / H); stage.style.transform = `scale(${k})`; };
  const hideStart = () => { document.getElementById('start').style.display = 'none'; };
  function tick(ts) {
    if (playing) {
      if (last == null) last = ts;
      const el = (ts - last) / (1000 / FPS);
      if (el >= 1) { const pf = frame; frame += Math.floor(el); last = ts - (el % 1) * (1000 / FPS); audioStep(pf, frame); }
      if (frame >= TOTAL) { frame = TOTAL - 1; playing = false; playBtn.textContent = 'Play'; audioStop(); }
      show(frame);
    }
    requestAnimationFrame(tick);
  }
  async function toggle() { playing = !playing; last = null; if (playing && frame >= TOTAL - 1) frame = 0; playBtn.textContent = playing ? 'Pause' : 'Play'; hideStart(); if (playing) { await audioInit(); audioSeek(frame); } else audioStop(); }
  async function restart() { frame = 0; last = null; playing = true; playBtn.textContent = 'Pause'; hideStart(); await audioInit(); audioSeek(0); }
  playBtn.onclick = toggle; document.getElementById('restart').onclick = restart;
  scrub.oninput = () => { audioStop(); playing = false; playBtn.textContent = 'Play'; frame = +scrub.value; show(frame); };
  addEventListener('keydown', e => {
    if (e.code === 'Space') { e.preventDefault(); toggle(); }
    if (e.key === 'r' || e.key === 'R') restart();
    if (e.key === 'h' || e.key === 'H') { document.body.classList.toggle('clean'); fit(); }
    if (e.key === 'm' || e.key === 'M') { AU.on = !AU.on; if (AU.on && playing) audioSeek(frame); else audioStop(); document.getElementById('mute').textContent = AU.on ? 'Sound on' : 'Muted'; }
  });
  document.getElementById('start').onclick = toggle;
  document.getElementById('mute').onclick = () => dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }));
  addEventListener('resize', fit);
  try {
    makeTextures();
    const q = new URLSearchParams(location.search);
    if (q.has('frame')) { document.body.classList.add('clean'); frame = +q.get('frame'); hideStart(); }
    else if (q.has('clean')) document.body.classList.add('clean');
    fit(); show(frame); window.READY = true;
  } catch (e) { window.ERR = String(e && e.stack || e); console.error(e); }
  requestAnimationFrame(tick);
})();
