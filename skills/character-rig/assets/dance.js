// dance.js — pose library + beat-synced dance/run cycles for person(). Needs core.js.
'use strict';
// Set these to the track's tempo; fx.js in a music-video project may already define them.
if (typeof bpos === 'undefined') globalThis.bpos = T => T / (60 / (globalThis.BPM || 88));
const DP = [
  { lSh: 160, lEl: 10, rSh: 30, rEl: 60 }, { lSh: 30, lEl: 60, rSh: 160, rEl: 10 },
  { lSh: 120, lEl: 40, rSh: 120, rEl: 40, rHip: 30, rKn: -40 }, { lSh: 70, lEl: 60, rSh: 20, rEl: 100, lHip: 30, lKn: -40 },
  { lSh: 150, lEl: -20, rSh: 150, rEl: -20 }, { lSh: 40, lEl: 110, rSh: 40, rEl: 110, lHip: 14, rHip: 14, lKn: -20, rKn: -20 },
];
const PKEYS = { lSh: 10, lEl: 6, rSh: 10, rEl: 6, lHip: 4, lKn: -2, rHip: 4, rKn: -2, lean: 0, tilt: 0 };
function blendPose(A, B, k) { const P = {}; for (const q in PKEYS) P[q] = mix(A[q] ?? PKEYS[q], B[q] ?? PKEYS[q], k); return P; }
// snap into each pose in the first 35% of a beat, bob on the downbeat, head tilts with the bar
function dance(T, off = 0, lib = DP, rate = 1) {
  const p = bpos(T) * rate, i = Math.floor(p), f = p - i, n = lib.length;
  const P = blendPose(lib[((i - 1 + off) % n + n) % n], lib[((i + off) % n + n) % n], eout(clamp(f / .35)));
  P.bob = -.2 * Math.exp(-f * 6) + .14 * Math.sin(f * Math.PI); P.tilt = Math.sin(p * Math.PI) * 6; return P;
}
const RUN = [
  { lSh: 60, lEl: 70, rSh: -25, rEl: 40, lHip: -8, lKn: -4, rHip: 55, rKn: -75, lean: 10 },
  { lSh: -25, lEl: 40, rSh: 60, rEl: 70, lHip: 55, lKn: -75, rHip: -8, rKn: -4, lean: 10 },
];
function run(T, rate = 2.4) { const p = T * rate, i = Math.floor(p), f = p - i; const P = blendPose(RUN[i % 2], RUN[(i + 1) % 2], eio(f)); P.bob = -Math.abs(Math.sin(f * Math.PI)) * .25; return P; }
