// Copilot Quest — chiptune music, SFX and VO playback (realtime + offline export)
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
 // fromT/toT, base and the duck windows are REAL seconds. The score below is written in STORY seconds (the pre-insert
 // timeline) and N/D/rise/gsn/P warp it through SH: anything from 13 s on is pushed back by INS_D (see timeline.js).
 const bus=ctx.createGain();bus.gain.value=.55;const duck=ctx.createGain();bus.connect(duck).connect(dest);
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
 const SH=T=>T>=13?T+(window.INS_D||0):T;
 const N=(kind,m,T,dur,v,o)=>{T=SH(T);if(T>=fromT&&T<toT)tone(ctx,bus,kind,m,base+T,dur,v,o);};
 const D=(kind,T,v)=>{T=SH(T);if(T>=fromT&&T<toT)drum(ctx,bus,kind,base+T,v);};

 // ---- title fanfare
 [[.60,67,.07],[.67,72,.07],[.74,76,.07],[.81,79,.07],[.88,84,.42],[1.30,79,.09],[1.40,81,.09],[1.50,83,.09],[1.62,84,.6]].forEach(([T,m,d])=>N('p25',m,T,d,.22,{vib:d>.3?1:0}));
 N('p50',76,.88,.42,.08);N('p50',79,.88,.42,.08);N('p50',76,1.62,.6,.08);N('p50',79,1.62,.6,.08);
 N('tri',48,.88,.4,.32);N('tri',43,1.30,.3,.32);N('tri',48,1.62,.6,.32);
 D('crash',.88,.22);D('crash',1.62,.22);

 // ---- re-cut score helpers (times are STORY seconds; N/D/rise/gsn/P warp them to real time)
 const inR=T=>T>=fromT&&T<toT;
 const cutN=c=>(k,m,T,d,v,o)=>{if(T<c)N(k,m,T,Math.min(d,c-T),v,o);};
 const cutD=c=>(k,T,v)=>{if(T<c)D(k,T,v);};
 // noise riser: bandpass sweep 400→6000 Hz with an exponential swell (noiseHit can only decay)
 const rise=(T,dur,v)=>{T=SH(T);if(!inR(T))return;dur=Math.min(dur,1.9);const t=base+T,s=ctx.createBufferSource();s.buffer=AU.noise;
  const fl=ctx.createBiquadFilter();fl.type='bandpass';fl.Q.value=1.4;fl.frequency.setValueAtTime(400,t);fl.frequency.exponentialRampToValueAtTime(6000,t+dur);
  const gn=ctx.createGain();gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(v,t+dur);gn.gain.linearRampToValueAtTime(0,t+dur+.04);
  s.connect(fl).connect(gn).connect(bus);s.start(t,Math.random()*(1.93-dur),dur+.06);};
 // gated snare (80s outro backbeat)
 const gsn=(T,v)=>{D('snare',T,v);T=SH(T);if(!inR(T))return;const t=base+T,s=ctx.createBufferSource();s.buffer=AU.noise;
  const fl=ctx.createBiquadFilter();fl.type='bandpass';fl.frequency.value=1600;const gn=ctx.createGain();
  gn.gain.setValueAtTime(v*.55,t);gn.gain.setValueAtTime(v*.55,t+.2);gn.gain.linearRampToValueAtTime(0,t+.23);
  s.connect(fl).connect(gn).connect(bus);s.start(t,Math.random()*1.7,.25);};
 const padF=ctx.createBiquadFilter();padF.type='lowpass';padF.frequency.value=1400;padF.Q.value=.7;padF.connect(bus);
 const P=(m,T,d,v)=>{T=SH(T);if(!inR(T))return;tone(ctx,padF,'saw',m,base+T,d,v,{a:.1,r:.35,sus:.85});tone(ctx,padF,'saw',m,base+T,d,v,{a:.1,r:.35,sus:.85,hz:mtof(m)*1.004});};

 // ---- tropical travel groove (3.2–10.3, beat .5 s, F major) — the RING at 10.3 scratches it off
 const TB=[3.2,5.2,7.2,9.2],roots=[41,46,48,41],bt=.5,Nt=cutN(10.3),Dt=cutD(10.3);
 const LEAD=[[[0,72,.5],[.75,69,.25],[1,72,.5],[1.5,77,1],[2.5,76,.5],[3,74,.5],[3.5,72,.5]],
  [[0,74,.75],[.75,70,.25],[1,74,.5],[1.5,77,.5],[2,79,1],[3,77,.5],[3.5,74,.5]],
  [[0,76,.75],[.75,72,.25],[1,76,.5],[1.5,79,.5],[2,82,.75],[2.75,81,.25],[3,79,.5],[3.5,76,.5]],
  [[0,77,1.5],[1.5,72,.5],[2,69,.5],[2.5,72,.5],[3,77,1]]];
 const STAB=[[65,69,72],[65,70,74],[64,67,72],[65,69,72]];
 TB.forEach((b0,bi)=>{const r=roots[bi];
  [[0,r,.75],[1.5,r+7,.4],[2,r,.75],[3,r+7,.4],[3.5,r+12,.4]].forEach(([b,m,d])=>Nt('tri',m+12,b0+b*bt,d*bt,.3));
  LEAD[bi].forEach(([b,m,d])=>Nt('p25',m,b0+b*bt,d*bt*.9,.15,{vib:d>=1?1:0}));
  [.5,1.5,2.5,3.5].forEach(b=>STAB[bi].forEach(m=>Nt('p12',m,b0+b*bt,.12,.045)));
  [0,2].forEach(b=>Dt('kick',b0+b*bt,.45));
  for(let e=0;e<8;e++)Dt('shaker',b0+e*bt/2,.22);
 });
 D('scratch',10.3,.4);

 // ---- VACATION.EXE hang bed (REAL seconds, not warped). The score is silent from the scratch (10.3) to the stage
 // jingle (15.12), so a stuck two-note "loading" loop over a low drone keeps the crash hold alive. Once the box goes
 // NOT RESPONDING (13.1) the loop sags flat and drags, like a program grinding to a halt; the OK click (14.2) ends it.
 {const Nr=(k,m,T,d,v,o)=>{if(T>=fromT&&T<toT)tone(ctx,bus,k,m,base+T,d,v,o);};
  let T=11.9,i=0;while(T<14.1){const m=i%2?68:69;Nr('p12',m,T,.16,.03,T>=13.1?{hzTo:mtof(m)*.985}:{});T+=T<13.1?.25:.32;i++;}
  Nr('tri',45,11.9,2.2,.15,{a:.3,sus:.9,r:.25});}

 // ---- stage card jingle (13.1 story): lands with STAGE 1
 [[13.12,69],[13.22,72],[13.32,76],[13.42,81]].forEach(([T,m])=>N('p25',m,T,.09,.22));
 [69,72,76].forEach(m=>N('p50',m,13.58,.7,.08,{r:.2}));N('tri',57,13.58,.7,.32);

 // ---- office theme (140 bpm, A minor): soft bed → tension under SYNCING → theme hits on the inbox explosion (G0)
 const ob=60/140,e8=ob/2,G0=18.89;
 const CH=[[57,60,64],[53,57,60],[55,59,62],[52,56,59]];
 const BS=[[45,57],[41,53],[43,55],[40,52]];
 const OL=[[[0,76,1],[1,81,.5],[1.5,79,.5],[2,76,1],[3,74,.5],[3.5,72,.5]],
  [[0,72,1],[1,77,.5],[1.5,76,.5],[2,72,1],[3,69,1]],
  [[0,71,1],[1,74,.5],[1.5,79,.5],[2,77,.5],[2.5,76,.5],[3,74,1]],
  [[0,76,.5],[.5,80,.5],[1,83,1],[2,80,.5],[2.5,76,.5],[3,71,1]]];
 for(let k=-21;k<-12;k++)N('p12',[69,72,76,72][(k+21)%4],G0+k*e8,e8*.8,.03);
 N('tri',57,G0-21*e8,9*e8,.18,{a:.3,sus:.9});
 for(let e=0;e<12;e++){const T=G0-(12-e)*e8;D('hat',T,e%2?.07:.12);N('tri',57,T,e8*.8,.2+.01*e);N('p12',69+(e>>1),T,e8*.7,.03);}
 D('crash',G0,.26);
 for(let bi=0;bi<4;bi++){const b0=G0+bi*4*ob;
  for(let e=0;e<8;e++){const T=b0+e*e8;if(T>=24.4)break;
   N('tri',BS[bi][e%2]+12,T,e8*.85,.3);
   if(e%4===0)D('kick',T,.45);if(e%4===2)D('snare',T,.32);D('hat',T,.13);}
  for(let s=0;s<16;s++){const T=b0+s*ob/4;if(T>=24.4)break;N('p12',CH[bi][s%3]+12,T,ob/4*.8,.045);}
  OL[bi].forEach(([b,m,d])=>{const T=b0+b*ob;if(T<24.4)N('p50',m,T,Math.min(d*ob*.9,24.4-T),.1,{vib:d>=1?1:0});});
 }
 // soft bed under "good morning", then the gloom sag on "?!" (27.3)
 for(let k=26;k<40;k++){const ch=k<34?[57,60,64]:[53,57,60];N('p12',ch[k%3]+12,G0+k*e8,e8*.8,.04);}
 N('tri',57,G0+26*e8,8*e8,.24,{sus:.9});N('tri',53,G0+34*e8,6*e8,.24,{sus:.9});
 N('tri',45,27.3,1.8,.32);N('tri',52,27.3,1.8,.14);
 [64,63,62,61,60].forEach((m,i)=>N('p50',m,27.3+i*.35,i===4?.5:.3,.08,{vib:i===4?2:0}));

 // ---- party: colleagues at their desks (29.5–40.8) — bright C–Am–F–G, 120 bpm
 {const PR=[48,45,41,43],pb=.5,Np=cutN(40.8),Dp=cutD(40.8);
  const PL=[[[0,76,.5],[.5,79,.5],[1,84,1],[2,83,.5],[2.5,79,.5],[3,76,1]],
   [[0,76,.5],[.5,72,.5],[1,69,1],[2,72,.5],[2.5,76,.5],[3,81,1]],
   [[0,77,.5],[.5,81,.5],[1,84,1],[2,81,.5],[2.5,77,.5],[3,72,1]],
   [[0,74,.5],[.5,79,.5],[1,83,1],[2,81,1],[3,79,1]]];
  const PS=[[72,76,79],[69,72,76],[69,72,77],[67,71,74]];
  for(let k=0;k<6;k++){const b0=29.5+2*k,ci=k%4,r=PR[ci];
   [[0,r,.75],[1.5,r+7,.4],[2,r,.75],[3,r+7,.4],[3.5,r+12,.4]].forEach(([b,m,d])=>Np('tri',m+12,b0+b*pb,d*pb,.28));
   PL[ci].forEach(([b,m,d])=>Np('p25',m,b0+b*pb,d*pb*.9,.1,{vib:d>=1?1:0}));
   [.5,1.5,2.5,3.5].forEach(b=>PS[ci].forEach(m=>Np('p12',m,b0+b*pb,.1,.04)));
   [0,2].forEach(b=>Dp('kick',b0+b*pb,.42));[1,3].forEach(b=>Dp('snare',b0+b*pb,.26));
   for(let e=0;e<8;e++)Dp('hat',b0+e*pb/2,e%2?.08:.12);
  }}

 // ---- quest: Hannah's session (40.8–51.0) — curious D minor bed, then a build into the summon
 [74,77,81,85,88].forEach((m,i)=>N('p25',m,40.82+i*.1,i===4?.55:.09,.18,{vib:i===4?1.5:0}));
 N('tri',50,40.82,.9,.28);
 [[41.6,44.0,50,[74,77,81,84,88,84,81,77]],[44.0,46.4,46,[70,74,77,81,86,81,77,74]],
  [46.4,47.6,43,[67,70,74,77,82,77,74,70]],[47.6,48.6,45,[69,74,76,79,81,79,76,74]]].forEach(([a,b,r,arp])=>{
  for(let i=0;a+i*.15<b-.01;i++)N('p12',arp[i%8],a+i*.15,.12,.04);
  N('tri',r+12,a,b-a-.05,.24,{sus:.9});});
 {let T=48.6,dt=.22;while(T<50.72){D('snare',T,.1+.18*Math.min(1,(T-48.6)/2.1));T+=dt;dt=Math.max(.045,dt*.9);}}
 [69,71,73,74,76,78,79,81].forEach((m,i)=>N('p50',m,48.77+i*.25,.22,.08));
 N('tri',57,48.6,2.1,.26,{sus:.9});
 rise(49.0,1.75,.12);

 // ---- enter Copilot (51.0–53.8): beam rise (with the charge SFX) → D major bloom on the summon hit (51.6)
 N('tri',0,51.0,.6,.2,{hz:mtof(50),hzTo:mtof(74),a:.5,vib:1});N('sine',0,51.0,.6,.12,{hz:mtof(62),hzTo:mtof(86),a:.5});
 [62,66,69].forEach(m=>N('p50',m,51.6,2.1,.05,{a:.15,r:.4}));N('tri',62,51.6,2.1,.28,{sus:.9,r:.3});
 for(let i=0;51.6+i*.1<53.75;i++)N('p12',[74,78,81,86][i%4],51.6+i*.1,.08,.03);
 [74,78,81,86].forEach((m,i)=>N('p25',m,53.0+i*.08,i===3?.4:.07,.16,{vib:i===3?1:0}));

 // ---- battle loop (53.8–70.2): D minor, 150 bpm, 1.6 s bars — light bars under the drafts VO, break bar into the clash
 const bb=.4,B0=53.8,SEQ=[0,1,2,3,0,1,2,0,1,2],BR=[50,46,48,50];
 const BL=[[[0,74,1.5],[1.5,77,.5],[2,76,.5],[2.5,74,.5],[3,72,.5],[3.5,74,.5]],
  [[0,77,1.5],[1.5,74,.5],[2,70,1],[3,72,.5],[3.5,74,.5]],
  [[0,76,1],[1,79,1],[2,76,.5],[2.5,74,.5],[3,72,1]],
  [[0,74,.5],[.5,72,.5],[1,69,.5],[1.5,72,.5],[2,74,2]]];
 const BC=[[62,65,69],[58,62,65],[60,64,67],[62,65,69]];
 D('crash',B0,.22);
 for(let k=0;k<10;k++){const b0=B0+k*4*bb,ci=SEQ[k],r=BR[ci],brk=k===6,light=k>=3&&k<=5,full=!brk&&!light;
  for(let e=0;e<8;e++){const T=b0+e*bb/2;N('tri',e%2?r+12:r,T,bb/2*.85,brk?.18:.3);if(!brk)D('hat',T,light?.08:(e%2?.08:.12));}
  if(brk)for(let s=0;s<16;s++)D('hat',b0+s*bb/4,.04+.12*s/15);
  if(full){[0,1.5,2].forEach(b=>D('kick',b0+b*bb,.42));[1,3].forEach(b=>D('snare',b0+b*bb,.28));
   BL[ci].forEach(([b,m,d])=>N('p50',m,b0+b*bb,d*bb*.9,.1,{vib:d>=1?1:0}));}
  if(light){[0,2].forEach(b=>D('kick',b0+b*bb,.35));
   BL[ci].forEach(([b,m,d])=>N('p25',m,b0+b*bb,d*bb*.9,.08,{vib:d>=1?1:0}));
   for(let s=0;s<16;s++)N('p12',BC[ci][s%3]+12,b0+s*bb/4,bb/4*.8,.035);}
 }
 rise(63.4,1.55,.2);D('crash',65.0,.24);
 D('crash',69.8,.26);D('kick',69.8,.45);N('tri',50,69.8,.55,.32);[62,65,69].forEach(m=>N('p50',m,69.8,.5,.07,{r:.2}));

 // ---- recap montage (70.6–76.3): F–Am–Bb arpeggios (the Bb lifts into the C major clear fanfare)
 [[70.6,53,[65,69,72,77,81,77,72,69]],[72.6,57,[64,69,72,76,81,76,72,69]],[74.6,58,[62,65,70,74,77,74,70,65]]].forEach(([b0,r,arp])=>{
  for(let i=0;i<8;i++){const T=b0+i*.25;if(T>=76.3)break;N('p25',arp[i],T,.2,.06);D('shaker',T,.12);}
  for(let h=0;h<2;h++){const T=b0+h;if(T<76.3)N('tri',r,T,Math.min(.9,76.3-T),.28);}
 });
 [81,84,88,91,93,96,100].forEach((m,i)=>N('p12',m,72.3+i*.125,.1,.04));

 // ---- stage clear (76.5): original rising fanfare, warm C chord under the level-up
 [[76.5,67,.09],[76.6,72,.09],[76.7,76,.09],[76.8,79,.35],[77.15,77,.09],[77.25,79,.09],[77.35,84,.5]].forEach(([T,m,d])=>N('p25',m,T,d,.24,{vib:d>.3?1:0}));
 N('tri',48,76.5,.3,.3);N('tri',53,77.15,.18,.3);N('tri',48,77.35,.5,.3);D('crash',77.67,.18);
 [55,60,64].forEach(m=>N('p50',m,77.9,1.3,.06,{a:.05,r:.5}));N('tri',48,77.9,1.3,.28,{r:.5});

 // ---- outro (79.3–84.5 story = 81.3–86.5 real): warm Am–F–G–C, beat .515 — G lands on the logo (81.97), C on the fanfare (83.0)
 {const q=.515,No=cutN(84.5),Do=cutD(84.5);
  [[79.395,76],[79.6525,79]].forEach(([T,m])=>No('p25',m,T,.2,.07));
  [[79.91,[57,60,64],45],[80.94,[53,57,60],41],[81.97,[55,59,62],43],[83.0,[55,60,64],48],[84.03,[55,60,64],48]].forEach(([b0,ch,r])=>{
   ch.forEach(m=>P(m,b0,Math.min(2*q,84.5-b0)-.05,.035));
   const arp=[ch[0],ch[1],ch[2],ch[1]].map(m=>m+12);
   for(let i=0;i<4;i++){const T=b0+i*q/2;No('p25',arp[i],T,q/2*.8,.05);No('tri',r+12,T,q/2*.85,.26);}
   for(let b=0;b<2;b++)Do('kick',b0+b*q,.38);
  });
  [80.425,81.455,82.485,83.515].forEach(T=>gsn(T,.22));}

 // ---- credit sting (84.5–87.5 story = 86.5–89.5 real): "Created by GitHub Copilot"
 [[84.55,72],[84.8,76],[85.05,79],[85.3,84]].forEach(([T,m],i)=>N('p25',m,T,i===3?.6:.14,.18,{vib:i===3?1:0}));
 [60,64,67].forEach(m=>N('sine',m,85.3,1.0,.08,{r:.8}));N('tri',48,85.3,1.0,.26,{r:.8});
}

function sfx(name){
 const ctx=AU.ctx;if(!ctx||!AU.master)return;const t0=AU.at??(ctx.currentTime+.01);
 const out=ctx.createGain();out.gain.value=.5;out.connect(AU.master);const wet=ctx.createGain();wet.gain.value=.12;out.connect(wet).connect(AU.verb);
 if(!isOffline(ctx))AU.live.push({stop(){try{out.disconnect();}catch(e){}}});
 const nz=(type,f0,f1,dur,v,tt=0,q=1)=>noiseHit(ctx,out,type,f0,f1,t0+tt,dur,v,q);
 const T=(kind,m,dur,v,o={},tt=0)=>tone(ctx,out,kind,m,t0+tt,dur,v,o);
 // swelling filtered-noise sweep (noiseHit can only decay)
 const sw=(type,f0,f1,dur,v,tt=0)=>{const s=ctx.createBufferSource();s.buffer=AU.noise;const fl=ctx.createBiquadFilter();fl.type=type;const t=t0+tt;fl.frequency.setValueAtTime(f0,t);fl.frequency.exponentialRampToValueAtTime(f1,t+dur);const gn=ctx.createGain();gn.gain.setValueAtTime(.001,t);gn.gain.exponentialRampToValueAtTime(v,t+dur*.9);gn.gain.linearRampToValueAtTime(0,t+dur);s.connect(fl).connect(gn).connect(out);s.start(t,Math.random()*Math.max(0,1.9-dur),dur+.02);};
 // pins climb F major pentatonic so they sit inside the travel groove's F bar
 if(name.startsWith('pin')){const i=Math.max(0,(+name.slice(3)||1)-1),m=65+[0,2,4,7,9][i%5]+12*Math.floor(i/5);T('p25',m,.06,.17);T('p25',m+12,.08,.14,{},.06);return;}
 if(name.startsWith('chk')){const m=[76,81,86][((+name.slice(3)||1)-1)%3];T('p25',m,.07,.16);T('p25',m+12,.07,.07,{r:.1},.06);return;}
 switch(name){
  case 'crt':T('sine',0,.5,.5,{hz:90,hzTo:40});nz('bandpass',3000,3000,.4,.22);T('saw',0,.35,.05,{hz:60,hzTo:2000},.05);break;
  case 'whoosh':nz('bandpass',500,3200,.35,.45,0,1.2);break;
  case 'card':nz('highpass',4000,4000,.03,.3);T('p50',79,.05,.1,{},.01);break;
  case 'select':T('p25',81,.06,.17);T('p25',88,.1,.17,{},.07);break;
  case 'alarm':for(let i=0;i<8;i++)T('p50',0,.05,.13,{hz:i%2?1100:880},i*.06);break;
  case 'glitch':for(let i=0;i<6;i++)T('p12',60+Math.floor(Math.random()*36),.03,.12,{},i*.04);nz('bandpass',2000,800,.25,.25,0,.8);break;
  case 'flip':nz('bandpass',2500,2500,.05,.35,0,1.5);break;
  case 'alert':T('p50',0,.12,.15,{hz:440});T('p50',0,.2,.15,{hz:330},.13);break;
  // soft Win9x-style "not responding" ding as the crash box greys out
  case 'hang':T('sine',0,.35,.14,{hz:880,r:.5});T('sine',0,.2,.04,{hz:2640,r:.3});T('sine',0,.5,.1,{hz:660,r:.6},.12);break;
  case 'stamp':T('sine',0,.25,.7,{hz:140,hzTo:45});nz('lowpass',900,300,.2,.5);break;
  case 'gloom':{const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.value=600;fl.connect(out);tone(ctx,fl,'saw',0,t0,1.2,.2,{hz:110,hzTo:55,r:.3});break;}
  case 'chime':[523,784,1046,1568].forEach((hz,i)=>T('sine',0,.5,.13,{hz,r:.4},i*.08));break;
  case 'pop':T('sine',0,.06,.4,{hz:500,hzTo:1400,r:.03});nz('highpass',6000,6000,.02,.25);break;
  case 'coin':T('p25',84,.07,.17);T('p25',91,.25,.17,{r:.15},.07);break;
  case 'charge':sw('bandpass',400,5000,.6,.3);T('tri',0,.6,.18,{hz:220,hzTo:1760,a:.4});break;
  case 'summon':[1480,1760,2349].forEach((hz,i)=>T('sine',0,.12,.16,{hz,r:.5},i*.05));T('sine',0,.4,.6,{hz:120,hzTo:50,r:.2});nz('highpass',3000,0,.6,.25);break;
  case 'zap':T('p25',0,.15,.2,{hz:1800,hzTo:180});nz('bandpass',2500,800,.12,.35,0,2);break;
  case 'sort':for(let i=0;i<6;i++){T('p12',[70,72,74,77,79,82][i],.03,.14,{},i*.045);nz('highpass',5000,5000,.02,.18,i*.045);}break;
  case 'boom':T('sine',0,.5,.6,{hz:160,hzTo:35,r:.2});nz('lowpass',1800,200,.7,.5);nz('highpass',4000,0,.25,.2);T('p50',0,.35,.12,{hz:400,hzTo:60});break;
  case 'type':for(let i=0;i<14;i++)nz('highpass',3500+Math.random()*2500,0,.025,.28,i*.085+Math.random()*.03);break;
  case 'untangle':for(let i=0;i<3;i++)T('tri',[60,64,67][i],.12,.25,{slide:7},i*.12);T('sine',0,.4,.15,{hz:2093,r:.4},.4);break;
  case 'scan':T('sine',0,.8,.1,{hz:880,hzTo:1760,vib:1});for(let i=0;i<4;i++)T('p25',89,.04,.12,{},i*.2);break;
  case 'confirm':[76,79,84].forEach((m,i)=>T('p25',m,.06,.17,{},i*.07));T('sine',0,.2,.15,{hz:2093,r:.6},.21);break;
  case 'ffwd':{const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.value=2200;fl.connect(out);tone(ctx,fl,'saw',0,t0,1.1,.12,{hz:400,hzTo:1600});for(let i=0;i<10;i++)nz('bandpass',1200+Math.random()*1800,0,.05,.15,i*.11,3);break;}
  case 'levelup':[72,76,79,84,88,91,96].forEach((m,i)=>T('p25',m,i===6?.3:.05,.17,{vib:i===6?1:0},i*.05));[2093,2637,3136].forEach((hz,i)=>T('sine',0,.3,.06,{hz,r:.5},.3+i*.04));break;
  case 'logo':[1568,1976,2349,3136].forEach((hz,i)=>T('sine',0,.1,.12,{hz,r:1.2},i*.06));sw('highpass',2000,8000,.6,.12);break;
  case 'fanfare':{const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.Q.value=2;fl.frequency.setValueAtTime(600,t0);fl.frequency.linearRampToValueAtTime(4000,t0+.08);fl.frequency.exponentialRampToValueAtTime(900,t0+.7);fl.connect(out);[60,64,67,72].forEach(m=>tone(ctx,fl,'saw',m,t0,.6,.09,{r:.25}));nz('highpass',3500,0,1.1,.22);break;}
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
