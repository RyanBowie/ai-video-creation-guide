// audio.js - voiceover + synthesised pencil/paper SFX + a data-driven score (one plonk per year, pitched by world launches), offline export, and the player loop.
'use strict';
const VO_CUES = [['sputnik', 12, 'narr'], ['fail', 300, 'narr'], ['gagarin', 540, 'narr'], ['apollo', 715, 'narr'], ['soviet', 893, 'narr'], ['fall', 1060, 'narr'], ['landing', 1270, 'narr'], ['falcon', 1560, 'narr'], ['end', 1745, 'narr']];
// [frame, name, arg]; pencil sounds follow the engine's write/line windows so every mark on the page is heard; card SFX follow the drawn action.
const SFX_CUES = (() => {
  const C = [], s = (f, n, a) => C.push([f, n, a]), dur = w => (w[1] - w[0]) / FPS;
  // Fig. 1 cold open: vapour, ignition, lift, whip pan, beeps, the dot that becomes 1957
  s(36, 'hiss', 2.4); s(T.ignite, 'ignite', 2.2); s(T.lift, 'thud'); s(T.whip - 6, 'whoosh');
  T.beeps.forEach(f => s(f, 'beep')); s(T.peel, 'flip'); s(T.dot - 1, 'tap');
  s(294, 'ruler', dur([294, 318])); s(322, 'ruler', dur([322, 334])); s(HEAD.w[0], 'scratch', dur(HEAD.w));
  NOTES.forEach(n => { s(n.w[0], 'scratch', dur(n.w)); s(n.l[0], 'line', dur(n.l)); });
  GLYPHS.forEach(g => s(g[3], 'scratch', 10 / FPS));
  // Fig. 2 Apollo 11
  s(715, 'flip'); s(745, 'hiss', 2.4); s(T.moonTouch, 'touch'); s(832, 'scratch', dur([832, 852])); s(878, 'flip');
  // Fig. 3 LZ-1
  s(1262, 'flip'); s(1300, 'ignite', .8); s(T.landBurn, 'ignite', 1); s(T.landBurn + 3, 'hiss', 1); s(T.legs, 'ratchet'); s(T.legs + 6, 'ratchet');
  s(T.landTouch, 'touch'); s(T.boom, 'boom'); s(1403, 'scratch', dur([1403, 1428])); s(1456, 'flip');
  // the break-out and the red pen
  s(T.tear, 'tear'); s(T.flip, 'flip'); T.taps.forEach(f => s(f, 'ratchet'));
  s(RED.bracket[0], 'line', dur(RED.bracket)); s(RED.note.w[0], 'scratch', dur(RED.note.w)); s(RED.note.l[0], 'line', dur(RED.note.l));
  s(RED.ring[0], 'line', dur(RED.ring)); s(RED.big.w[0], 'scratch', dur(RED.big.w));
  s(CAL.txt.w[0], 'scratch', dur(CAL.txt.w));
  s(RED.cell[0], 'line', dur(RED.cell)); s(RED.q[0], 'scratch', dur(RED.q)); s(T.endCard, 'tap');
  return C.sort((a, b) => a[0] - b[0]);
})();

// ---- score: [frame, midi, lenFrames, instrument, velocity]. 30 fps; chords every 60 frames (D Bm G A).
const SCORE = (() => {
  const S = [], N = (f, m, d, i, v = 1) => S.push([f, m, d, i, v]);
  const tri = (r, minor) => [r, r + (minor ? 3 : 4), r + 7];
  const CH = [[50], [47, 1], [43], [45]];
  const chords = (a, b, v = .5, bass = .6) => { for (let f = Math.ceil(a / 60) * 60; f < b; f += 60) { const [r, mi] = CH[(f / 60) % 4]; tri(r, mi).forEach(x => N(f, x + 12, 58, 'pad', v)); if (bass) { N(f, r - 12, 28, 'bass', bass); N(f + 30, r - 5, 26, 'bass', bass * .8); } } };
  const drums = (a, b, v = .5, hat = 15) => { for (let f = a; f < b; f += 30) N(f, 0, 3, 'kick', v); for (let f = a; f < b; f += hat) N(Math.round(f), 0, 2, 'hat', v * .6); };
  const arp = (f, v = .7) => [62, 66, 69, 74, 78, 81].forEach((m, i) => N(f + i * 5, m, 40, 'box', v));
  // cold open: a low D drone under the steppe, a rising fifth at ignition, the orbit arpeggio as the dot lands
  [38, 45].forEach(m => N(10, m, 240, 'pad', .45));
  [50, 57, 62].forEach((m, i) => N(T.ignite + i * 8, m, 160, 'pad', .4 + i * .05));
  arp(T.dot - 6, .5);
  // the race: one plonk for every year that ticks past, pitched by that year's world total (D major pentatonic)
  const PENTA = [0, 2, 4, 7, 9];
  for (let F = 1; F < TOTAL; F++) {
    const a = Math.floor(yearPos(F - 1) + 1e-6), b = Math.floor(yearPos(F) + 1e-6);
    for (let y = a + 1; y <= b; y++) { const st = Math.round(D.world[y] / 324 * 14); N(F, 62 + 12 * Math.floor(st / 5) + PENTA[st % 5], 10, 'plonk', y === NY - 2 ? 1 : .6); }
  }
  N(352, 62, 10, 'plonk', .6); // 1957 itself
  chords(300, 700, .45, .5); drums(360, 690, .35, 30);
  // Apollo: drums out, wonder; a music-box arpeggio on touchdown
  chords(720, 900, .4, 0); arp(T.moonTouch, .7);
  chords(900, 1250, .48, .6); drums(900, 1240, .45);
  // LZ-1: a bass pulse that speeds up into the landing burn, the arpeggio on touchdown
  [38, 45, 50].forEach(m => N(1266, m, 130, 'pad', .45));
  for (let f = 1296, g = 20; f < T.landBurn; f += g, g = Math.max(6, g - 1.2)) N(Math.round(f), 38, 5, 'bass', .45);
  N(T.landBurn, 26, 30, 'bass', .8); arp(T.landTouch, .8); [50, 54, 57].forEach(m => N(T.landTouch, m + 12, 70, 'pad', .5));
  // build to the tear
  chords(1470, T.tear, .5, .6); drums(1500, T.tear - 30, .5);
  for (let i = 0; i < 8; i++) N(T.tear - 30 + Math.round(i * 3.75), 62 + [0, 2, 4, 7, 9, 12, 14, 16][i], 4, 'pluck', .4 + i * .07);
  chords(T.tear, 1745, .6, .8); drums(T.tear, 1740, 1, 7.5);
  // the red pen: half time under the reveal, then the resolve
  chords(1745, 1905, .45, .55); drums(1750, 1900, .45, 30);
  [[1920, 50], [1950, 43]].forEach(([f, r]) => { tri(r).forEach(x => N(f, x + 12, 58, 'pad', .55)); N(f, r - 12, 50, 'bass', .5); });
  arp(T.endCard + 8, .7); [38, 50, 57, 62].forEach(m => N(1930, m, 75, 'pad', .6));
  return S.sort((a, b) => a[0] - b[0]);
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
  if (inst === 'box') { env(g, t, .004, .08 * v, Math.max(.6, dur)); osc('sine', f, t, dur + .8).connect(g); const g2 = ctx.createGain(); env(g2, t, .002, .025 * v, .25); osc('triangle', f * 3, t, .4).connect(g2); g2.connect(out); }
  else if (inst === 'plonk') { env(g, t, .002, .11 * v, .45); osc('sine', f, t, .6).connect(g); const g2 = ctx.createGain(); env(g2, t, .001, .035 * v, .12); osc('triangle', f * 4, t, .2).connect(g2); g2.connect(out); }
  else if (inst === 'pad') { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.035 * v, t + .25); g.gain.setValueAtTime(.035 * v, t + dur * .8); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .25); osc('triangle', f, t, dur + .3).connect(filt('lowpass', 1600)).connect(g); }
  else if (inst === 'bass') { env(g, t, .006, .15 * v, dur + .05); osc('triangle', f, t, dur + .2).connect(filt('lowpass', 700)).connect(g); }
  else if (inst === 'pluck') { env(g, t, .003, .04 * v, dur + .06); osc('square', f, t, dur + .15).connect(filt('lowpass', 1800)).connect(g); }
  else if (inst === 'hat') { env(g, t, .001, .025 * v, .04); noiseSrc(t, .06).connect(filt('highpass', 7000)).connect(g); }
  else if (inst === 'kick') { env(g, t, .002, .2 * v, .14); const o = osc('sine', 120, t, .2); o.frequency.exponentialRampToValueAtTime(42, t + .12); o.connect(g); }
  g.connect(out);
}
// lay the score (and VO ducking) from frame F0 onwards; t0 = context time of frame F0
function scoreFrom(F0, t0) {
  const at = F => t0 + (F - F0) / FPS;
  for (const [f, m, d, inst, v] of SCORE) if (f >= F0) note(at(f), m, d / FPS, inst, v);
  const gp = AU.mus.gain; gp.cancelScheduledValues(t0); gp.setValueAtTime(.55, t0);
  for (const [k, f] of VO_CUES) { const e = f + ((window.VT && VT[k] && VT[k].dur) || 3) * FPS; if (e < F0) continue; gp.setValueAtTime(.55, Math.max(t0, at(f - 4))); gp.linearRampToValueAtTime(.3, Math.max(t0 + .01, at(f))); gp.setValueAtTime(.3, Math.max(t0 + .02, at(e))); gp.linearRampToValueAtTime(.55, Math.max(t0 + .03, at(e + 8))); }
}

function sfx(name, arg) {
  const ctx = AU.ctx, t = AU.at ?? ctx.currentTime + .01, M = AU.master, V = AU.verb;
  const route = (node, dry, wet = 0) => { node.connect(vol(ctx, dry)).connect(M); if (wet) node.connect(vol(ctx, wet)).connect(V); };
  const nz = (d, dur, type, f, q, peak, a = .002) => { const n = noiseSrc(t + d, dur + .05), g = ctx.createGain(); env(g, t + d, a, peak, dur); n.connect(filt(type, f, q)).connect(g); return g; };
  const len = arg || .5;
  if (name === 'scratch') { let d = 0; while (d < len) { route(nz(d, .02 + Math.random() * .03, 'bandpass', 2600 + Math.random() * 2600, 2.2, .025 + Math.random() * .03, .001), 1); d += .03 + Math.random() * .05; } }
  if (name === 'line') { const n = noiseSrc(t, len + .1), bp = filt('bandpass', 3200, 1.6), g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.035, t + .04); g.gain.setValueAtTime(.035, t + Math.max(.05, len - .05)); g.gain.exponentialRampToValueAtTime(.0001, t + len + .05); n.connect(bp).connect(g); route(g, 1); }
  if (name === 'ruler') { sfx('line', len); route(nz(len, .03, 'bandpass', 1800, 2, .12, .001), 1); }
  if (name === 'tap') { route(nz(0, .03, 'bandpass', 2400, 1.5, .25, .001), 1); const o = osc('sine', 260, t, .1); o.frequency.exponentialRampToValueAtTime(120, t + .06); const g = ctx.createGain(); env(g, t, .002, .25, .06); o.connect(g); route(g, 1); }
  if (name === 'beep') [0, .22].forEach(d => { const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t + d); g.gain.exponentialRampToValueAtTime(.06, t + d + .01); g.gain.setValueAtTime(.06, t + d + .12); g.gain.exponentialRampToValueAtTime(.0001, t + d + .14); osc('sine', 1440, t + d, .2).connect(g); route(g, 1, .6); });
  if (name === 'whoosh') { const n = noiseSrc(t, 1.4), bp = filt('bandpass', 300, 1); bp.frequency.exponentialRampToValueAtTime(1600, t + 1.3); const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.07, t + .8); g.gain.exponentialRampToValueAtTime(.0001, t + 1.4); n.connect(bp).connect(g); route(g, 1, .3); }
  if (name === 'thud') { const o = osc('sine', 110, t, .3); o.frequency.exponentialRampToValueAtTime(50, t + .2); const g = ctx.createGain(); env(g, t, .002, .3, .22); o.connect(g); route(g, 1, .2); }
  if (name === 'tear') { for (let i = 0; i < 14; i++) route(nz(i * .016 + Math.random() * .006, .025, 'bandpass', 1400 + Math.random() * 3200, 1.4, .22, .001), 1, .2); route(nz(0, .3, 'lowpass', 700, .7, .2, .005), 1, .3); const o = osc('sine', 90, t, .4); o.frequency.exponentialRampToValueAtTime(38, t + .3); const g = ctx.createGain(); env(g, t, .003, .5, .32); o.connect(g); route(g, 1, .3); }
  if (name === 'flip') { for (let i = 0; i < 5; i++) route(nz(i * .045, .07, 'bandpass', 1800 + i * 500, 1.2, .18 - i * .025, .003), 1, .15); route(nz(0, .3, 'lowpass', 900, .7, .1, .05), 1); }
  if (name === 'ratchet') { route(nz(0, .02, 'highpass', 2500, 1, .35, .001), 1); route(nz(.04, .02, 'bandpass', 3000, 3, .15, .001), 1); const o = osc('square', 1700, t, .04), g = ctx.createGain(); env(g, t, .001, .03, .03); o.connect(filt('lowpass', 3500)).connect(g); route(g, 1, .2); }
  if (name === 'hiss') { const n = noiseSrc(t, len + .3), g = ctx.createGain(), bp = filt('bandpass', 5200, .7); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.045, t + .25); g.gain.setValueAtTime(.045, t + Math.max(.3, len - .4)); g.gain.exponentialRampToValueAtTime(.0001, t + len); n.connect(bp).connect(g); route(g, 1, .3); }
  if (name === 'ignite') { const n = noiseSrc(t, len + .4), lp = filt('lowpass', 260, .8), g = ctx.createGain(); lp.frequency.exponentialRampToValueAtTime(900, t + .35); lp.frequency.exponentialRampToValueAtTime(380, t + len); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.45, t + .12); g.gain.setValueAtTime(.38, t + len * .6); g.gain.exponentialRampToValueAtTime(.0001, t + len + .3); n.connect(lp).connect(g); route(g, 1, .35); route(nz(0, .25, 'bandpass', 1400, 1, .12, .002), 1, .2); const o = osc('sine', 55, t, len + .3), go = ctx.createGain(); env(go, t, .05, .22, len); o.connect(go); route(go, 1); }
  if (name === 'boom') [0, .24].forEach((d, i) => { const o = osc('sine', 80, t + d, .5); o.frequency.exponentialRampToValueAtTime(34, t + d + .35); const g = ctx.createGain(); env(g, t + d, .003, .55 - i * .1, .4); o.connect(g); route(g, 1, .4); route(nz(d, .12, 'lowpass', 600, .7, .3 - i * .05, .002), 1, .4); });
  if (name === 'touch') { const o = osc('sine', 70, t, .35); o.frequency.exponentialRampToValueAtTime(36, t + .25); const g = ctx.createGain(); env(g, t, .003, .4, .28); o.connect(g); route(g, 1, .25); route(nz(.01, .5, 'lowpass', 900, .6, .14, .02), 1, .3); }
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
  SFX_CUES.forEach(([at, n, arg]) => { AU.at = at / FPS; sfx(n, arg); });
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
  SFX_CUES.forEach(([at, n, arg]) => { if (prev < at && F >= at && F - at < 6) sfx(n, arg); });
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
