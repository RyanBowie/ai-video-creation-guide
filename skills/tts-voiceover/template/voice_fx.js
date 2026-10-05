// Web Audio voice treatments. Pair with tts.py --bundle (window.VOICE).
//
//   await voiceInit();                  // once, after a user gesture
//   playVoice('intro', 'narrator');     // kind: narrator | wizard | darklord | robot | radio
//
const AU = { ctx: null, bufs: {}, live: [], at: null };

const vol = (ctx, v) => { const g = ctx.createGain(); g.gain.value = v; return g; };
const filt = (ctx, type, f, q = 1) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
const b64buf = s => { const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; };

async function voiceInit(ctx = new AudioContext()) {
  AU.ctx = ctx;
  AU.master = ctx.createDynamicsCompressor();
  AU.master.threshold.value = -14; AU.master.ratio.value = 3;
  AU.master.connect(vol(ctx, .9)).connect(ctx.destination);

  // generated hall impulse - 2.2s of noise with a cubic decay, no IR file needed
  const len = ctx.sampleRate * 2.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  AU.verb = ctx.createConvolver(); AU.verb.buffer = ir; AU.verb.connect(AU.master);

  if (window.VOICE) await Promise.all(Object.entries(VOICE).map(async ([k, v]) => {
    AU.bufs[k] = await ctx.decodeAudioData(b64buf(v));
  }));
}

function chain(kind) {
  const ctx = AU.ctx, inp = ctx.createGain();

  if (kind === 'wizard') { // big room, no grit
    const ls = filt(ctx, 'lowshelf', 220); ls.gain.value = 5;
    inp.connect(ls);
    ls.connect(vol(ctx, 1)).connect(AU.master);
    ls.connect(vol(ctx, .42)).connect(AU.verb);
    return inp;
  }

  if (kind === 'darklord') { // helmet resonance + respirator grit, kept intelligible
    const hp = filt(ctx, 'highpass', 70);
    const pk = filt(ctx, 'peaking', 180, .9); pk.gain.value = 4;
    const ws = ctx.createWaveShaper(), cv = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; cv[i] = Math.tanh(1.2 * x) / Math.tanh(1.2); }
    ws.curve = cv;
    const dl = ctx.createDelay(); dl.delayTime.value = .007;
    dl.connect(vol(ctx, .2)).connect(dl);
    const pres = filt(ctx, 'peaking', 2800, 1); pres.gain.value = 5; // this keeps words readable
    inp.connect(hp).connect(pk).connect(ws);
    ws.connect(pres).connect(vol(ctx, .95)).connect(AU.master);
    ws.connect(dl); dl.connect(vol(ctx, .22)).connect(AU.master);
    ws.connect(vol(ctx, .12)).connect(AU.verb);
    return inp;
  }

  if (kind === 'robot') { // ring mod + narrow band
    const ring = ctx.createGain(); ring.gain.value = 0;
    const osc = ctx.createOscillator(); osc.frequency.value = 72;
    osc.connect(ring.gain); osc.start();
    const bp = filt(ctx, 'bandpass', 1200, .7);
    inp.connect(ring).connect(bp).connect(AU.master);
    return inp;
  }

  if (kind === 'radio') { // phone / comms
    const hp = filt(ctx, 'highpass', 400), lp = filt(ctx, 'lowpass', 3200);
    const ws = ctx.createWaveShaper(), cv = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; cv[i] = Math.tanh(2 * x) / Math.tanh(2); }
    ws.curve = cv;
    inp.connect(hp).connect(lp).connect(ws).connect(AU.master);
    return inp;
  }

  inp.connect(AU.master);
  inp.connect(vol(ctx, .06)).connect(AU.verb); // a touch of air so it isn't clinical
  return inp;
}

// offset trims the head of the clip; AU.at lets an OfflineAudioContext schedule absolutely
function playVoice(key, kind = 'narrator', offset = 0) {
  const b = AU.bufs[key];
  if (!b || offset >= b.duration) return;
  const src = AU.ctx.createBufferSource();
  src.buffer = b;
  src.connect(chain(kind));
  src.start(AU.at ?? AU.ctx.currentTime, Math.max(0, offset));
  AU.live.push(src);
}

function voiceStop() { AU.live.forEach(s => { try { s.stop(); } catch (e) { } }); AU.live = []; }
