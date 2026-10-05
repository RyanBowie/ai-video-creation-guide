// timeline.js ? scene list + frame draw. Scenes take ABSOLUTE song time T.
'use strict';
const SP = (x, y, sd) => ({ type: 'splat', d: .38, x, y, sd }), TR = { type: 'tear', d: .35 }, WP = { type: 'wipe', d: .32 };
// a = scene start (land it on a beat: bt(k) or just before a vocal onset); tin = transition INTO this scene
const SC = [
  { a: 0, f: sIntro },
  // { a: bt(4), f: sVerse, tin: SP(W / 2, 470, 3) },
  // { a: bt(12), f: sHook, tin: TR },
];
function draw(T) {
  boil(T); U = 1; C.setTransform(1, 0, 0, 1, 0, 0); C.__u = [];
  let i = SC.length - 1; while (i > 0 && T < SC[i].a) i--;
  const S = SC[i];
  if (S.tin && i > 0 && T < S.a + S.tin.d) {
    SC[i - 1].f(T); layer(() => S.f(T));
    U = 1; C.setTransform(1, 0, 0, 1, 0, 0); C.__u = []; composite(S.tin, (T - S.a) / S.tin.d);
  } else S.f(T);
  U = 1; C.setTransform(1, 0, 0, 1, 0, 0); C.__u = []; karaoke(T); grain();
}
