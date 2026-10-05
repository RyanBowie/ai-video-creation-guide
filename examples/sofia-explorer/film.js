// film.js - WebGL2 film post pass for Copilot Quest: Explorer (16 mm adventure-serial look).
// Adapted from lemomo-ai/lemo-opuscar core/post/crt.js (MIT licence, (c) LemoLab).
// Pipeline: scene canvas + glow canvas -> bright-pass -> 4-level bloom pyramid -> composite
// (gate weave, soft focus, bloom, halation, warm grade, light leak, flicker, vignette, scratches, dust, grain, bars).
// Changes: plain global (no ES module), English comments, CRT stages replaced by film stages.
const VS = `#version 300 es
in vec2 p; out vec2 uv; void main(){ uv = p*.5+.5; gl_Position = vec4(p,0,1); }`;
const PRE = `#version 300 es
precision highp float; in vec2 uv; out vec4 o;
uniform sampler2D scene, glow; uniform vec2 px; uniform float thr, sk;
vec3 tap(vec2 q){ vec3 s = texture(scene,q).rgb; float l = dot(s, vec3(.3,.55,.15)); return texture(glow,q).rgb + s * smoothstep(thr, thr+.25, l) * sk; }
void main(){ vec3 c = tap(uv) * .4 + (tap(uv+px*vec2(1,1)) + tap(uv+px*vec2(-1,1)) + tap(uv+px*vec2(1,-1)) + tap(uv+px*vec2(-1,-1))) * .15; o = vec4(c,1); }`;
const DOWN = `#version 300 es
precision highp float; in vec2 uv; out vec4 o; uniform sampler2D src; uniform vec2 px;
void main(){ vec3 c = texture(src,uv).rgb*.25 + (texture(src,uv+px*vec2(1,1)).rgb + texture(src,uv+px*vec2(-1,1)).rgb + texture(src,uv+px*vec2(1,-1)).rgb + texture(src,uv+px*vec2(-1,-1)).rgb)*.1875; o = vec4(c,1); }`;
const BLUR = `#version 300 es
precision highp float; in vec2 uv; out vec4 o; uniform sampler2D src; uniform vec2 dir;
void main(){ float w[5] = float[](.2270270270, .1945945946, .1216216216, .0540540541, .0162162162);
  vec3 c = texture(src,uv).rgb*w[0]; for(int i=1;i<5;i++){ c += (texture(src,uv+dir*float(i)*1.5).rgb + texture(src,uv-dir*float(i)*1.5).rgb)*w[i]; } o = vec4(c,1); }`;
const COMP = `#version 300 es
precision highp float; in vec2 uv; out vec4 o;
uniform sampler2D scene, b1, b2, b3, b4, subs; uniform vec2 res; uniform float frame, bloom, halo, soft, sat, lift, contrast, flick, expo, fade;
uniform float glow, grain, vig, leak, weave, dust, bars, hasSubs;
uniform vec3 tint, shadowTint;
float h1(float n){ return fract(sin(n*127.1+311.7)*43758.5453); }
float h2(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h2(i), h2(i+vec2(1,0)), f.x), mix(h2(i+vec2(0,1)), h2(i+vec2(1,1)), f.x), f.y); }
void main(){
  float fr = floor(frame), fz = mod(fr, 211.0);
  // gate weave: the whole frame drifts a pixel or two, like film sliding through a projector gate
  vec2 q = uv + vec2(h1(fz*1.7)-.5, h1(fz*2.3+4.0)-.5) * vec2(.0011, .0016) * weave;
  vec2 s = 1.0/res;
  vec3 c0 = texture(scene,q).rgb;
  vec3 bl = (texture(scene,q+s*vec2(1,0)).rgb + texture(scene,q-s*vec2(1,0)).rgb + texture(scene,q+s*vec2(0,1)).rgb + texture(scene,q-s*vec2(0,1)).rgb)*.25;
  vec3 c = mix(c0, bl, soft) * expo;
  vec3 B = texture(b1,q).rgb*.55 + texture(b2,q).rgb*.6 + texture(b3,q).rgb*.5 + texture(b4,q).rgb*.4;
  // halation: the red-orange halo film grows round bright highlights
  vec3 Hh = (texture(b3,q).rgb + texture(b4,q).rgb*1.3) * vec3(1.0,.45,.2);
  c += B * bloom + Hh * halo;
  c = clamp(c, 0.0, 1.0);
  float l = dot(c, vec3(.299,.587,.114));
  c = clamp(mix(vec3(l), c, sat), 0.0, 1.0);
  c = mix(c, c*c*(3.0-2.0*c), contrast);
  c *= tint;
  c = c*(1.0-lift) + lift*shadowTint;
  c = mix(c, vec3(dot(c, vec3(.33))), fade);
  if (hasSubs > 0.5) { vec4 sb = texture(subs, q); c = mix(c, sb.rgb, sb.a); }
  vec3 gb = texture(b1,q).rgb*.6 + texture(b2,q).rgb*.4;
  c += glow * max(gb - .15, 0.0);
  if (leak > 0.0) {
    // light leak: a warm amber flare breathing in from the right edge (screen blend)
    vec2 lc = vec2(1.02 + .06*sin(frame*.021), .28 + .2*sin(frame*.013));
    float lk = (1.0 - smoothstep(0.0, 1.0, length((uv-lc)*vec2(.9,1.25)))) * (.7 + .3*vn(uv*2.5 + frame*.012));
    c = 1.0 - (1.0-c) * (1.0 - clamp(leak*lk*mix(vec3(1.0,.32,.06), vec3(1.0,.78,.42), lk), 0.0, 1.0));
  }
  c *= 1.0 + (h1(fz*.73) - .5) * flick;
  c *= 1.0 - vig * smoothstep(.45, 1.15, length((uv - .5) * vec2(1.6, 1.25)));
  if (dust > 0.0) {
    for (int i = 0; i < 2; i++) {
      // scratches: thin pale vertical lines that live for four frames
      float sd = floor(frame/4.0)*1.31 + float(i)*7.7;
      if (h1(sd) < .3*dust) {
        float x = .08 + .84*h1(sd+1.1) + .0015*sin(uv.y*9.0 + sd);
        float a = 1.0 - smoothstep(.5, 2.0, abs(uv.x - x)*res.x);
        c = mix(c, vec3(.93,.88,.78), a * .3 * smoothstep(.35, .7, vn(vec2(uv.y*5.0, sd))));
      }
    }
    // dust: two or three specks per frame, dark or pale
    vec2 g = uv * vec2(res.x/res.y, 1.0) * 26.0;
    vec2 id = floor(g), f = fract(g) - .5;
    if (h2(id + fz*13.7) > 1.0 - .005*dust) {
      vec2 off = vec2(h2(id + fz*3.1), h2(id + fz*5.9)) - .5;
      float sz = .06 + .16*h2(id + fz*9.3);
      float spk = 1.0 - smoothstep(sz*.5, sz, length((f - off*.6) * vec2(1.0, .6 + .8*h2(id + fz*2.1))));
      c = mix(c, h2(id + fz*7.7) > .5 ? vec3(.06,.04,.03) : vec3(.95,.91,.82), spk * .7);
    }
  }
  vec2 P = uv * res;
  float Lc = dot(clamp(c,0.,1.), vec3(.3,.59,.11));
  // grain on 2 px cells (16 mm-coarse at 1080p; 1.5 px cells at .07 pushed a 26 s cut to 78 MB at crf 22)
  float gn = h2(floor(P/2.0) + fz*17.0) + h2(floor(P/2.0)*1.37 + fz*7.0 + 3.1) - 1.0;
  c += gn * grain * (.45 + 2.2*Lc*(1.0-Lc));
  if (bars > 0.0 && abs(uv.y - .5) > .5 - bars*.12) c = vec3(0);
  o = vec4(clamp(c, 0.0, 1.0), 1);
}`;

function makePost(cv) {
  const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, alpha: false });
  const W = cv.width, H = cv.height;
  const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
  const prog = fs => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; };
  const P = { pre: prog(PRE), down: prog(DOWN), blur: prog(BLUR), comp: prog(COMP) };
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const tex = (w, h) => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v); return t; };
  const fbo = (w, h) => { const t = tex(w, h), f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return { t, f, w, h }; };
  const tScene = tex(W, H), tGlow = tex(W, H), tSubs = tex(W, H);
  const L = [2, 4, 8, 16].map(d => ({ a: fbo(Math.ceil(W / d), Math.ceil(H / d)), b: fbo(Math.ceil(W / d), Math.ceil(H / d)) }));
  const U = (p, n) => gl.getUniformLocation(p, n);
  const draw = (target) => { if (target) { gl.bindFramebuffer(gl.FRAMEBUFFER, target.f); gl.viewport(0, 0, target.w, target.h); } else { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H); } gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
  const bindT = (unit, t) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); };
  const upload = (t, c) => { gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, c); };

  const params = { bloom: .55, halo: .25, thr: .82, sk: .12, soft: .15, sat: .92, lift: .05, contrast: .18, flick: .025, expo: 1.04, fade: .06,
    glow: .35, grain: .06, vig: .45, leak: 0, weave: 1, dust: .5, bars: 0,
    tint: [1.05, .99, .88], shadowTint: [.14, .08, .04] };

  let blank = null;
  function render(scene, glow, frame, subs = null, over = {}) {
    const o = Object.assign({}, params, over);
    if (!glow) { if (!blank) { blank = document.createElement('canvas'); blank.width = W; blank.height = H; } glow = blank; }
    upload(tScene, scene); upload(tGlow, glow); if (subs) upload(tSubs, subs);
    gl.useProgram(P.pre); bindT(0, tScene); bindT(1, tGlow);
    gl.uniform1i(U(P.pre, 'scene'), 0); gl.uniform1i(U(P.pre, 'glow'), 1); gl.uniform2f(U(P.pre, 'px'), 1 / W, 1 / H);
    gl.uniform1f(U(P.pre, 'thr'), o.thr); gl.uniform1f(U(P.pre, 'sk'), o.sk);
    draw(L[0].a);
    for (let i = 0; i < L.length; i++) {
      const lv = L[i];
      if (i > 0) { gl.useProgram(P.down); bindT(0, L[i - 1].a.t); gl.uniform1i(U(P.down, 'src'), 0); gl.uniform2f(U(P.down, 'px'), 1 / L[i - 1].a.w, 1 / L[i - 1].a.h); draw(lv.a); }
      gl.useProgram(P.blur); gl.uniform1i(U(P.blur, 'src'), 0);
      bindT(0, lv.a.t); gl.uniform2f(U(P.blur, 'dir'), 1 / lv.a.w, 0); draw(lv.b);
      bindT(0, lv.b.t); gl.uniform2f(U(P.blur, 'dir'), 0, 1 / lv.a.h); draw(lv.a);
    }
    const p = P.comp; gl.useProgram(p);
    bindT(0, tScene); for (let i = 0; i < 4; i++) bindT(i + 1, L[i].a.t); bindT(5, tSubs);
    ['scene', 'b1', 'b2', 'b3', 'b4', 'subs'].forEach((n, i) => gl.uniform1i(U(p, n), i));
    gl.uniform2f(U(p, 'res'), W, H); gl.uniform1f(U(p, 'frame'), frame); gl.uniform1f(U(p, 'hasSubs'), subs ? 1 : 0);
    for (const k of ['bloom', 'halo', 'soft', 'sat', 'lift', 'contrast', 'flick', 'expo', 'fade', 'glow', 'grain', 'vig', 'leak', 'weave', 'dust', 'bars']) gl.uniform1f(U(p, k), o[k]);
    gl.uniform3fv(U(p, 'tint'), o.tint); gl.uniform3fv(U(p, 'shadowTint'), o.shadowTint);
    draw(null);
  }
  return { render, params, gl, P };
}
window.makePost = makePost;
