// scenes_a.js ? starter scene. Scene fns take ABSOLUTE song time T; keep each file <= ~250 lines.
'use strict';
function sIntro(T) {
  paper(); sunburst(W / 2, 470, 24, ['#38C2F8', '#F7C51E', '#F7738A', '#B04FE6'], T * 12, .14);
  cam(punch(T, bt(0), .12) + .03 * kick(T), 0, 0, 0, () => {
    mark(W / 2, 150, 110 * backOut(seg(T, .1, .6), 2.2), { rot: Math.sin(T * 2) * 6 });
    wpop('HELLO WORLD', W / 2, 330, 130, .5, T, { rot: -4, fill: G_COOL, stroke: true, pulse: .05 });
    [[330, 1, 'word'], [620, 2, 'excel'], [1300, 3, 'ppt'], [1590, 0, 'teams']].forEach(([x, off, lk]) => {
      shadowE(x, 1000, 56); person(x, 1000, 46, { look: lk, pose: dance(T, off), eyes: 'happy', mouth: 'grin' });
    });
    shadowE(W / 2, 1000, 84); person(W / 2, 1000, 74, { pose: dance(T, 4), eyes: 'star', mouth: sing(T), hands: { r: 'mic' } });
    clippy(1810, 1000, 50, { dir: -1 });
  });
}
