// Copilot Quest: Explorer — adventure score, SFX and VO playback (realtime + offline export)
const AU={ctx:null,bufs:{},live:[],on:true};
function b64buf(b64){const bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer;}
async function audioInit(){if(AU.ctx){if(AU.ctx.state!=='running')await AU.ctx.resume();return;}await audioSetup(AU.ctx=new AudioContext());}
async function audioSetup(ctx){AU.master=ctx.createDynamicsCompressor();AU.master.threshold.value=-14;AU.master.ratio.value=3;const mg=ctx.createGain();mg.gain.value=.68;AU.master.connect(mg).connect(ctx.destination);const len=ctx.sampleRate*1.6,ir=ctx.createBuffer(2,len,ctx.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);}AU.verb=ctx.createConvolver();AU.verb.buffer=ir;AU.verb.connect(AU.master);AU.noise=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const nd=AU.noise.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;if(window.VOICE)await Promise.all(Object.entries(VOICE).map(async([k,v])=>{AU.bufs[k]=await ctx.decodeAudioData(b64buf(v));}));}
const vol=(ctx,v)=>{const g=ctx.createGain();g.gain.value=v;return g;};
function chain(kind){const ctx=AU.ctx,inp=ctx.createGain();if(kind==='room'){inp.connect(vol(ctx,1)).connect(AU.master);inp.connect(vol(ctx,.1)).connect(AU.verb);return inp;}inp.connect(AU.master);inp.connect(vol(ctx,.05)).connect(AU.verb);return inp;}
function playClip(key,kind,offset){const b=AU.bufs[key];if(!b||offset>=b.duration)return;const src=AU.ctx.createBufferSource();src.buffer=b;src.connect(chain(kind));src.start(AU.at??0,Math.max(0,offset));AU.live.push(src);}
function audioStop(){AU.live.forEach(n=>{try{n.stop();}catch(e){}});AU.live=[];}
function audioSeek(F){if(!AU.ctx||!AU.on)return;audioStop();AU.at=null;VO_CUES.forEach(([k,at,kind])=>{if(F>=at)playClip(k,kind,(F-at)/FPS);});scheduleMusic(AU.ctx,AU.master,AU.ctx.currentTime+.03-F/FPS,F/FPS,TOTAL/FPS);}
function audioStep(prev,F){if(!AU.ctx||!AU.on||AU.ctx.state!=='running')return;AU.at=null;VO_CUES.forEach(([k,at,kind])=>{if(prev<at&&F>=at)playClip(k,kind,(F-at)/FPS);});SFX_CUES.forEach(([at,n])=>{if(prev<at&&F>=at&&F-at<6)sfx(n);});}

const mtof=m=>440*Math.pow(2,(m-69)/12);
const _pw=new WeakMap();
function pulseWave(ctx,d){let m=_pw.get(ctx);if(!m){m={};_pw.set(ctx,m);}if(m[d])return m[d];const n=64,re=new Float32Array(n),im=new Float32Array(n);for(let k=1;k<n;k++)re[k]=2*Math.sin(k*Math.PI*d)/(k*Math.PI);return m[d]=ctx.createPeriodicWave(re,im);}
const isOffline=ctx=>typeof OfflineAudioContext!=='undefined'&&ctx instanceof OfflineAudioContext;

function tone(ctx,dest,kind,m,t,dur,v,o={}){
 const osc=ctx.createOscillator();
 if(kind==='p12')osc.setPeriodicWave(pulseWave(ctx,.125));
 else if(kind==='p25')osc.setPeriodicWave(pulseWave(ctx,.25));
 else if(kind==='p50')osc.type='square';
 else if(kind==='tri')osc.type='triangle';
 else if(kind==='saw')osc.type='sawtooth';
 else osc.type='sine';
 const f=o.hz||mtof(m),a=o.a??.005,r=o.r??.04,sus=o.sus??.8;dur=Math.max(dur,a+.05);
 osc.frequency.setValueAtTime(f,t);
 if(o.hzTo)osc.frequency.exponentialRampToValueAtTime(Math.max(1,o.hzTo),t+dur);
 else if(o.slide)osc.frequency.exponentialRampToValueAtTime(mtof(m+o.slide),t+dur);
 if(o.vib){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=5.5;lg.gain.value=f*.012*o.vib;l.connect(lg).connect(osc.frequency);l.start(t);l.stop(t+dur+r+.05);}
 const gn=ctx.createGain();
 gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(v,t+a);
 gn.gain.linearRampToValueAtTime(v*sus,t+Math.min(dur,a+.06));gn.gain.setValueAtTime(v*sus,t+dur);gn.gain.linearRampToValueAtTime(0,t+dur+r);
 osc.connect(gn).connect(dest);osc.start(t);osc.stop(t+dur+r+.02);
 return osc;
}
function noiseHit(ctx,dest,type,f0,f1,t,dur,v,q){
 const s=ctx.createBufferSource();s.buffer=AU.noise;const fl=ctx.createBiquadFilter();fl.type=type;if(q)fl.Q.value=q;
 fl.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)fl.frequency.exponentialRampToValueAtTime(f1,t+dur);
 const gn=ctx.createGain();gn.gain.setValueAtTime(v,t);gn.gain.exponentialRampToValueAtTime(.001,t+dur);
 s.connect(fl).connect(gn).connect(dest);s.start(t,Math.max(0,Math.random()*(2-dur-.05)),dur+.02);
}
function drum(ctx,dest,kind,t,v){
 if(kind==='kick'){const o=ctx.createOscillator(),gn=ctx.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+.18);gn.gain.setValueAtTime(v,t);gn.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(gn).connect(dest);o.start(t);o.stop(t+.2);}
 else if(kind==='snare'){noiseHit(ctx,dest,'bandpass',1800,0,t,.14,v,.8);const o=ctx.createOscillator(),gn=ctx.createGain();o.type='triangle';o.frequency.value=180;gn.gain.setValueAtTime(v*.6,t);gn.gain.exponentialRampToValueAtTime(.001,t+.08);o.connect(gn).connect(dest);o.start(t);o.stop(t+.1);}
 else if(kind==='hat')noiseHit(ctx,dest,'highpass',7000,0,t,.035,v);
 else if(kind==='shaker')noiseHit(ctx,dest,'highpass',5000,0,t,.05,v*.6);
 else if(kind==='crash')noiseHit(ctx,dest,'highpass',3500,0,t,1.1,v);
 else if(kind==='scratch')noiseHit(ctx,dest,'bandpass',3000,300,t,.25,v,4);
}

function scheduleMusic(ctx,dest,base,fromT,toT){
 // Original adventure score (no borrowed themes): D minor, 100 bpm, bar 2.4 s, first downbeat 1.86 s.
 // Pad 0.4 s, gallop ostinato 1.86, brass 4.26, strings + flute 6.66, snare 11.46, roll 15.06,
 // timpani + tremolo 16.26, D-major fanfare on the title hits 18.66, held D-major chord under the credit 23.46.
 const bus=ctx.createGain();bus.gain.value=.55;const duck=ctx.createGain();bus.connect(duck).connect(dest);
 const wet=ctx.createGain();wet.gain.value=.18;duck.connect(wet).connect(AU.verb);
 if(!isOffline(ctx))AU.live.push({stop(){try{bus.disconnect();}catch(e){}}});
 const DK=.42,wins=[];
 VO_CUES.forEach(([k,at])=>{const d=(window.VT&&VT[k])?VT[k].dur:(AU.bufs[k]?AU.bufs[k].duration:0);if(!d)return;
  const a=at/FPS-.08,b=at/FPS+d+.1,L=wins[wins.length-1];if(L&&a-L[1]<.5)L[1]=Math.max(L[1],b);else wins.push([a,b]);});
 const inside=wins.some(([a,b])=>fromT>=a&&fromT<=b);
 duck.gain.setValueAtTime(inside?DK:1,Math.max(ctx.currentTime,base+fromT));
 wins.forEach(([a,b])=>{
  if(a-.15>=fromT){duck.gain.setValueAtTime(1,base+a-.15);duck.gain.linearRampToValueAtTime(DK,base+a);}
  else if(a>=fromT)duck.gain.linearRampToValueAtTime(DK,base+a);
  if(b>=fromT){duck.gain.setValueAtTime(DK,base+b);duck.gain.linearRampToValueAtTime(1,base+b+.3);}
 });
 const lp=(hz,q=.7)=>{const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=hz;f.Q.value=q;f.connect(bus);return f;};
 const PAD=lp(1400),OST=lp(700,1.2),STR=lp(2600),FLU=bus;
 const BAR=2.4,Q=.6;
 const on=T=>T>=fromT&&T<toT;
 const N=(dst,kind,m,T,dur,v,o)=>{if(on(T))tone(ctx,dst,kind,m,base+T,dur,v,o);};
 const D=(kind,T,v)=>{if(on(T))drum(ctx,bus,kind,base+T,v);};
 // brass: three detuned saws through a lowpass that blats open (400 -> 2400 -> 1200 Hz)
 const brass=(m,T,dur,v)=>{if(!on(T))return;const t=base+T,f=ctx.createBiquadFilter();f.type='lowpass';f.Q.value=1.2;
  f.frequency.setValueAtTime(400,t);f.frequency.linearRampToValueAtTime(2400,t+.07);f.frequency.exponentialRampToValueAtTime(1200,t+.4);f.connect(bus);
  [-7,0,7].forEach(c=>tone(ctx,f,'saw',m,t,dur,v/3,{hz:mtof(m)*Math.pow(2,c/1200),a:.035,r:.14,sus:.85}));};
 // timpani: sine with a quick pitch drop plus a felt thump
 const timp=(m,T,v)=>{if(!on(T))return;const t=base+T,fq=mtof(m),o=ctx.createOscillator(),g=ctx.createGain();
  o.frequency.setValueAtTime(fq*1.3,t);o.frequency.exponentialRampToValueAtTime(fq,t+.09);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.005);g.gain.exponentialRampToValueAtTime(.001,t+1.3);
  o.connect(g).connect(bus);o.start(t);o.stop(t+1.35);noiseHit(ctx,bus,'lowpass',500,120,t,.14,v*.5);};
 // harmony: [start, pad chord, ostinato root]  Dm Dm F Gm Am Bb Gm|A D G|D (D held to the end)
 const HAR=[[1.86,[50,57,62,65],38],[4.26,[50,57,62,65],38],[6.66,[53,57,60,65],41],[9.06,[55,58,62,67],43],
  [11.46,[57,60,64,69],45],[13.86,[58,62,65,70],46],[16.26,[55,58,62,67],43],[17.46,[57,61,64,69],45],
  [18.66,[50,54,57,62],38],[21.06,[55,59,62,67],43],[22.26,[50,54,57,62],38],[23.46,null,38]];
 const at=T=>{let h=HAR[0];for(const x of HAR)if(x[0]<=T+1e-6)h=x;return h;};
 // pad: merged chord segments, the first swells in from 0.4 s; the last D chord releases before the end (26 s)
 const segs=[];for(const[T,c]of HAR){if(!c)continue;const L=segs[segs.length-1];if(L&&L[1].join()===c.join())continue;if(L)L[2]=T;segs.push([T,c,25.2]);}
 segs[0][0]=.4;
 segs.forEach(([s,c,e],i)=>{const s2=Math.max(s,fromT);if(s2>=e||s2>=toT)return;c.forEach(m=>tone(ctx,PAD,'saw',m,base+s2,e-s2,.03,{a:i?.25:1.4,r:.7,sus:1}));});
 // gallop ostinato (long-short-short) on the harmony root, growing from 1.86 s until the final chord
 for(let k=0;;k++){const T=1.86+k*Q;if(T>23.4)break;const r=at(T)[2],v=.04+.03*Math.min(1,(T-1.86)/9.6);
  N(OST,'saw',r,T,.24,v,{r:.05});N(OST,'saw',r+12,T+.3,.11,v*.75,{r:.04});N(OST,'saw',r+12,T+.45,.11,v*.75,{r:.04});}
 // brass theme (bars 1-6); flute doubles it an octave up from bar 3
 const B1=[[62,1],[69,1],[69,.5],[67,.5],[69,1]],B2=[[72,1.5],[70,.5],[69,2]],B3=[[67,1],[70,1],[69,.5],[67,.5],[65,1]],
  B4=[[64,1],[67,1],[69,2]],B6=[[74,1.5],[72,.5],[70,1],[69,1]];
 [B1,B2,B3,B4,B1,B6].forEach((bar,i)=>{let T=4.26+i*BAR;bar.forEach(([m,b])=>{brass(m,T,b*Q*.9,.15);
  if(i>=2)N(FLU,'tri',m+12,T,b*Q*.85,.028,{a:.04,r:.12,vib:1});T+=b*Q;});});
 // strings: rising octave line C D E F, tremolo G -> A into the fanfare, then sustained fifths
 [[6.66,60],[9.06,62],[11.46,64],[13.86,65]].forEach(([T,m])=>[m,m+12].forEach(x=>N(STR,'saw',x,T,BAR-.15,.02,{a:.4,r:.45,vib:.4})));
 for(let k=0;k<32;k++){const T=16.26+k*.075,m=T<17.46-1e-6?67:69,v=.016+.016*k/31;N(STR,'saw',m,T,.05,v,{r:.02});N(STR,'saw',m+12,T,.05,v*.8,{r:.02});}
 [[18.66,57,2.3],[21.06,59,1.1],[22.26,57,1.1],[23.46,62,1.8]].forEach(([T,m,d])=>[m,m+12].forEach(x=>N(STR,'saw',x,T,d,.022,{a:.08,r:.5})));
 // march snare + bass drum from 11.46, roll 15.06, timpani build 16.26, crash on the title hit 18.66
 const march=(t0,t1,s)=>{for(let k=0;;k++){const T=t0+k*.3;if(T>t1-.01)break;const e=k%8;
  if([0,2,3,4,6,7].includes(e))D('snare',T,(e%4?.055:.1)*s);if(e===0||e===4)D('kick',T,.26*s);}};
 march(11.46,15.06,1);
 for(let k=0;k<16;k++)D('snare',15.06+k*.075,.035+.085*k/15);
 [[16.26,43,.28],[16.86,43,.3],[17.46,45,.32],[17.76,45,.34],[18.06,45,.36],[18.21,45,.38],[18.36,45,.4],[18.51,45,.42]].forEach(([T,m,v])=>timp(m,T,v));
 for(let k=0;k<8;k++)D('snare',18.06+k*.075,.04+.08*k/7);
 D('crash',18.66,.14);timp(38,18.66,.5);
 march(18.66,23.46,.85);timp(43,21.06,.38);timp(38,22.26,.4);
 // D-major fanfare under the title, octave-doubled brass; final D chord with timpani + crash at 23.46
 [[[74,1],[69,.5],[74,.5],[78,1],[76,.5],[74,.5]],[[79,1],[78,.5],[76,.5],[78,2]]].forEach((bar,i)=>{let T=18.66+i*BAR;
  bar.forEach(([m,b])=>{brass(m,T,b*Q*.9,.16);brass(m-12,T,b*Q*.9,.08);T+=b*Q;});});
 [62,66,69,74].forEach(m=>brass(m,23.46,1.8,.065));brass(50,23.46,1.8,.05);
 timp(38,23.46,.5);D('crash',23.46,.12);D('kick',23.46,.3);
}

function sfx(name){
 const ctx=AU.ctx;if(!ctx||!AU.master)return;const t0=AU.at??(ctx.currentTime+.01);
 const out=ctx.createGain();out.gain.value=.5;out.connect(AU.master);const wet=ctx.createGain();wet.gain.value=.12;out.connect(wet).connect(AU.verb);
 if(!isOffline(ctx))AU.live.push({stop(){try{out.disconnect();}catch(e){}}});
 const nz=(type,f0,f1,dur,v,tt=0,q=1)=>noiseHit(ctx,out,type,f0,f1,t0+tt,dur,v,q);
 const T=(kind,m,dur,v,o={},tt=0)=>tone(ctx,out,kind,m,t0+tt,dur,v,o);
 // swelling filtered-noise sweep (noiseHit can only decay)
 const sw=(type,f0,f1,dur,v,tt=0)=>{const s=ctx.createBufferSource();s.buffer=AU.noise;const fl=ctx.createBiquadFilter();fl.type=type;const t=t0+tt;fl.frequency.setValueAtTime(f0,t);fl.frequency.exponentialRampToValueAtTime(f1,t+dur);const gn=ctx.createGain();gn.gain.setValueAtTime(.001,t);gn.gain.exponentialRampToValueAtTime(v,t+dur*.9);gn.gain.linearRampToValueAtTime(0,t+dur);s.connect(fl).connect(gn).connect(out);s.start(t,Math.random()*Math.max(0,1.9-dur),dur+.02);};
 const lpf=(hz,q=1)=>{const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=hz;f.Q.value=q;f.connect(out);return f;};
 // map pins on D minor pentatonic (D F G A C): pins 1-6 climb outbound, 7-12 step back down to D on the way home
 const pm=/^pin(\d+)$/.exec(name);
 if(pm){const n=Math.max(0,+pm[1]-1),i=n<6?n:Math.max(0,11-n),m=62+[0,3,5,7,10][i%5]+12*Math.floor(i/5);nz('highpass',5000,0,.02,.22);T('tri',m,.07,.2,{r:.14});T('sine',m+12,.05,.07,{r:.2},.03);return;}
 switch(name){
  // 16 mm projector spinning up: shutter clatter at 18 fps over a mains hum
  case 'projector':for(let i=0;i<29;i++){const tt=i/18,v=.2*(1-tt/1.8);nz('bandpass',2000+Math.random()*700,0,.018,v,tt,2);if(i%2===0)nz('lowpass',380,0,.03,v*.6,tt);}T('sine',0,1.4,.05,{hz:50,a:.2,r:.4,sus:1});T('sine',0,1.4,.03,{hz:100,a:.2,r:.4,sus:1});break;
  // prop plane fly-by: two detuned saws, propeller tremolo, rising pitch, air swell
  case 'plane':{const am=ctx.createGain();am.gain.value=.6;const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=24;lg.gain.value=.4;l.connect(lg).connect(am.gain);l.start(t0);l.stop(t0+2.1);am.connect(lpf(900));
   tone(ctx,am,'saw',0,t0,1.5,.16,{hz:92,hzTo:118,a:.45,r:.4,sus:1});tone(ctx,am,'saw',0,t0,1.5,.08,{hz:184.5,hzTo:237,a:.45,r:.4,sus:1});sw('bandpass',300,1400,1.3,.1);break;}
  // grease pencil: two scratchy strokes of an X
  case 'xmark':nz('bandpass',2400,900,.12,.35,0,3);nz('bandpass',2700,1000,.13,.35,.17,3);break;
  case 'stamp':T('sine',0,.25,.7,{hz:140,hzTo:45});nz('lowpass',900,300,.2,.5);nz('bandpass',1500,600,.06,.25);break;
  // the film reel catches: crackles over a rising roar
  case 'burn':for(let i=0;i<26;i++)nz('highpass',3000+Math.random()*4000,0,.012+Math.random()*.02,.1+Math.random()*.22,Math.random()*1.0);sw('bandpass',300,2400,.7,.3);sw('lowpass',200,1500,.9,.18,.1);break;
  // compass needle: ratchet ticks that slow with the cubic ease-out spin, over a fading whirr
  case 'spin':for(let k=1;k<16;k++){const tt=2.2*(1-Math.pow(1-k/16,1/3));nz('highpass',4500,0,.015,.22-k*.008,tt);T('sine',0,.03,.05,{hz:2600,r:.03},tt);}nz('bandpass',2000,500,1.6,.15,0,2);break;
  // luggage tag on its string: paper flap on the drop, soft cord creak + card tap as it bottoms out (kept quiet)
  case 'tag':nz('bandpass',1900,700,.09,.2,0,1.4);nz('bandpass',650,420,.14,.08,.4,7);T('sine',0,.04,.06,{hz:820,r:.05},.43);break;
  // compass needle locking into place as the spin settles
  case 'click':nz('highpass',6000,0,.02,.4);T('sine',0,.06,.15,{hz:3200,r:.08});T('sine',0,.05,.08,{hz:4800,r:.06},.005);break;
  // title slam: low boom and a D power-chord brass stab
  case 'hit':{T('sine',0,.35,.5,{hz:150,hzTo:40,r:.15});nz('lowpass',2000,300,.3,.3);const fl=lpf(700,1.5);fl.frequency.setValueAtTime(700,t0);fl.frequency.linearRampToValueAtTime(3200,t0+.04);fl.frequency.exponentialRampToValueAtTime(800,t0+.45);
   [50,57,62].forEach((m,i)=>tone(ctx,fl,'saw',0,t0,.3,.05,{r:.2,hz:mtof(m)*(1+(i-1)*.004)}));break;}
  case 'whoosh':nz('bandpass',500,3200,.35,.45,0,1.2);break;
  // D-major sparkle for the Copilot mark (sits on the final D chord)
  case 'chime':[587,880,1175,1480].forEach((hz,i)=>T('sine',0,.5,.13,{hz,r:.4},i*.08));break;
 }
}

async function exportAudio(){
 const save={ctx:AU.ctx,bufs:AU.bufs,live:AU.live,master:AU.master,verb:AU.verb,noise:AU.noise,at:AU.at},rnd0=Math.random;
 let sd=0x5EED;Math.random=()=>{sd=(sd+0x6D2B79F5)|0;let t=Math.imul(sd^sd>>>15,1|sd);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};  // seeded so every export (and av_check peak) is identical
 try{
  const SR=48000,len=Math.ceil(TOTAL/FPS*SR),ctx=new OfflineAudioContext(2,len,SR);
  AU.ctx=ctx;AU.bufs={};AU.live=[];await audioSetup(ctx);
  scheduleMusic(ctx,AU.master,0,0,TOTAL/FPS);
  VO_CUES.forEach(([k,at,kind])=>{AU.at=at/FPS;playClip(k,kind,0);});
  SFX_CUES.forEach(([at,n])=>{AU.at=at/FPS;sfx(n);});
  AU.at=null;
  const buf=await ctx.startRendering();
  const L=buf.getChannelData(0),Rr=buf.getChannelData(1),n=L.length,ab=new ArrayBuffer(44+n*4),dv=new DataView(ab);
  const ws=(o,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');dv.setUint32(4,36+n*4,true);ws(8,'WAVE');ws(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);
  dv.setUint32(24,SR,true);dv.setUint32(28,SR*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);ws(36,'data');dv.setUint32(40,n*4,true);
  for(let i=0,o=44;i<n;i++,o+=4){dv.setInt16(o,Math.max(-1,Math.min(1,L[i]))*32767,true);dv.setInt16(o+2,Math.max(-1,Math.min(1,Rr[i]))*32767,true);}
  const u=new Uint8Array(ab);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));
  return btoa(s);
 }finally{Object.assign(AU,save);Math.random=rnd0;}
}
