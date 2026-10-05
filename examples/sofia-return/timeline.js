// timeline.js — scene list, VO/SFX cue sheet and frame draw for "Copilot Quest Ep.1: Enter Copilot".
'use strict';
const FPS = 30;
// VO clip durations (s) — from voice_timing.json
const VOD = { travel: 4.85, ahh: 1.87, back: 6.65, good: 4.15, what: 3.77, dream: 2.52, pooped: 3.1, emails: 2.47, urgent: 3.29, cal: 3.86, c1: 3.5, c2: 3.24, c3: 2.38, think: 2.04, lead: 3.38, session: 2.76, find: 1.87, enter: 1.87, inbox: 4.15, drafts: 4.73, clash: 1.87, avail: 3.67, missed: 3.02, prep: 2.11, got: 2.02, outro: 4.39 };
// Got / Outro were authored on the original clock; LATE shifts them after the longer Copilot section
const LATE = 8.95, late = f => T => f(T - LATE);
// scenes keep their own local clocks; off(d) maps absolute time -> local (local = abs - d)
const off = d => f => T => f(T - d);
const O_INB = 9.84, O_COL = 16.3, O_CP = 22.74;
const SP = (x, y, sd) => ({ type: 'splat', d: .38, x, y, sd }), TR = { type: 'tear', d: .35 }, WP = { type: 'wipe', d: .32 };
// a = scene start (s); tin = transition into the scene
const SCN = [
  { a: 0, f: sTitle },
  { a: 2.2, f: off(2.2)(sTravel), tin: WP },
  { a: 9.8, f: off(7.6)(sReturn), tin: SP(960, 540, 3) },
  { a: 11.36 + O_INB, f: off(O_INB)(sInbox), tin: SP(960, 540, 7) },
  { a: 17.45 + O_INB, f: off(O_INB)(sCal), tin: TR },
  { a: 31.34, f: off(31.34)(sDream), tin: WP },
  { a: 21.5 + O_COL, f: off(O_COL)(sColleagues), tin: WP },
  { a: 33.4 + O_COL, f: off(O_COL)(sLead), tin: TR },
  { a: 39.66 + O_CP, f: off(O_CP)(sCopilot), tin: SP(960, 480, 11) },
  { a: 53.46 + LATE + O_CP, f: off(O_CP)(late(sGot)), tin: WP },
  { a: 55.76 + LATE + O_CP, f: off(O_CP)(late(sOutro)), tin: SP(960, 540, 5) },
];
const END = 61.5 + LATE + O_CP, TOTAL = Math.round(END * FPS);
// av-sync / exporter compatible frame-based scene list
const SCENES = SCN.map((s, i) => ({ from: Math.round(s.a * FPS), dur: Math.round(((SCN[i + 1] || { a: END }).a - s.a) * FPS), render: s.f }));

// [clip, time, chain] — Sofia/colleague lines get a 'room' chain, narrator 'narr'
const VO_CUES = [
  ['travel', 2.45, 'narr'], ['ahh', 7.6, 'room'],
  ...[['back', 2.4, 'narr'], ['good', 9.3, 'room']].map(([k, t, c]) => [k, t + 7.6, c]),
  ...[['emails', 11.45, 'room'], ['urgent', 14.0, 'narr'], ['cal', 17.5, 'narr']].map(([k, t, c]) => [k, t + O_INB, c]),
  ['dream', 31.59, 'room'], ['pooped', 34.39, 'narr'],
  ...[['c1', 21.7, 'room'], ['c2', 25.3, 'room'], ['c3', 28.65, 'room'], ['think', 31.15, 'room'],
    ['lead', 33.5, 'narr'], ['session', 37.1, 'room'], ['what', 40.05, 'room'], ['find', 44.0, 'room']].map(([k, t, c]) => [k, t + O_COL, c]),
  ...[['enter', 39.8, 'narr'], ['inbox', 41.8, 'narr'], ['drafts', 46.05, 'narr'], ['clash', 50.95, 'narr'], ['avail', 53.0, 'narr'], ['missed', 56.85, 'narr'], ['prep', 60.05, 'narr'],
    ['got', 53.55 + LATE, 'room'], ['outro', 55.9 + LATE, 'narr']].map(([k, t, c]) => [k, t + O_CP, c]),
].map(([k, t, c]) => [k, Math.round(t * FPS), c]);

const sh = (d, L) => L.map(([t, n]) => [t + d, n]);
const SFX_CUES = [
  [0.05, 'chime'], [0.9, 'pop'],
  ...sh(2.2, [[0.2, 'whoosh'], [0.35, 'pop'], [1.25, 'pop'], [1.52, 'stamp'], [2.11, 'stamp'], [2.67, 'stamp'], [3.23, 'stamp'], [3.75, 'pop'], [4.45, 'whoosh']]),
  ...sh(7.6, [[2.2, 'whoosh'], [3.2, 'pop'], [5.0, 'pop'], [5.96, 'pop'], [7.86, 'pop'], [11.7, 'pop']]),
  ...sh(O_INB, [[11.36, 'whoosh'], [11.9, 'ping'], [12.8, 'pop'], [14.0, 'pop'], [15.9, 'stamp'],
    [17.45, 'whoosh'], [18.2, 'ping'], [18.65, 'ping'], [18.85, 'stamp'], [19.1, 'ping'], [19.55, 'ping'], [20.05, 'pop']]),
  ...sh(31.34, [[0, 'whoosh'], [2.85, 'ping'], [2.9, 'pop'], [3.15, 'pop'], [3.3, 'ping'], [3.7, 'ping'], [3.95, 'pop'], [5.4, 'pop']]),
  ...sh(O_COL, [[21.5, 'whoosh'], [21.8, 'pop'], [23.55, 'pop'], [25.4, 'pop'], [26.55, 'pop'], [28.7, 'ping'], [29.3, 'ping'], [29.55, 'pop'], [31.0, 'pop'],
    [33.4, 'whoosh'], [36.1, 'chime'], [37.2, 'pop'], [39.1, 'stamp'], [40.15, 'pop'], [40.3, 'pop'], [42.8, 'pop'], [44.0, 'levelup'], [44.05, 'pop']]),
  ...sh(O_CP, [[39.66, 'whoosh'], [39.95, 'levelup'], [41.3, 'whoosh'], [41.8, 'typing'], [43.4, 'xp'],
    [45.95, 'typing'], [48.1, 'xp'], [49.0, 'whoosh'], [50.25, 'xp'],
    [50.85, 'typing'], [51.9, 'xp'], [52.9, 'typing'], [54.9, 'ping'], [55.2, 'pop'], [55.9, 'xp'],
    [56.75, 'typing'], [58.75, 'xp'], [59.95, 'typing'], [61.3, 'xp'],
    ...sh(LATE, [[53.46, 'whoosh'], [54.25, 'pop'], [54.3, 'levelup'], [54.4, 'pop'],
      [55.76, 'whoosh'], [55.8, 'chime'], [56.6, 'levelup'], [57.6, 'pop'], [57.9, 'pop'], [59.1, 'chime']])]),
].map(([t, n]) => [Math.round(t * FPS), n]);
function draw(T) {
  boil(T); U = 1; C.setTransform(1, 0, 0, 1, 0, 0); C.__u = [];
  let i = SCN.length - 1; while (i > 0 && T < SCN[i].a) i--;
  const S = SCN[i];
  if (S.tin && i > 0 && T < S.a + S.tin.d) {
    SCN[i - 1].f(T); layer(() => S.f(T));
    U = 1; C.setTransform(1, 0, 0, 1, 0, 0); C.__u = []; composite(S.tin, (T - S.a) / S.tin.d);
  } else S.f(T);
  U = 1; C.setTransform(1, 0, 0, 1, 0, 0); C.__u = []; grain();
}
