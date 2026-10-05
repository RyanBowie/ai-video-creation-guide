/* Copilot Quest Ep.1 - Act 2 (31.5-89.5 s real): party, quest, enter, boss, drafts, clash, recap, clear, outro, credit.
   Scenes receive STORY time t = real − INS_D (timeline.js); every time literal below is story time (real − 2.0 s).
   Timeline globals (VO_CUES, FPS, INS_D) are read lazily. */
(function(){
'use strict';
const {W,H,g,gg,clamp,lerp,ease,easeOut,easeIn,back,seg}=R;
const hash=R.hash||(n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);});
const U=S.U;
const {rect,spr,ga,scaled,officeRoom,povDesk,burst,words,CALI,CHAT}=U;
const AN=(typeof A!=='undefined'&&A)||HER.A||window.A||{mouthAt:()=>0,blinkAt:()=>1};
const TAU=Math.PI*2;
const GOLD='#ffe14a',PALE='#fff3a0',CYAN='#35e7ff',PINK='#ff7ac8',GREEN='#4dff9a',RED='#ff3f5a',PURP='#b36bff',INK='#000000';
const POST={bloom:.55,halo:.12};

/* ---------- timing ---------- */
// VO cue start in STORY seconds (VO_CUES frames are real time)
const vs=k=>{const c=VO_CUES.find(c=>c[0]===k);return c?c[1]/FPS-(window.INS_D||0):0;};
const vd=k=>(window.VT&&VT[k]&&VT[k].dur)||2;
const ty=(s,t,t0,cps=34)=>t<t0?'':s.slice(0,Math.max(0,Math.floor((t-t0)*cps)));
const talking=(k,t)=>t>=vs(k)&&t<=vs(k)+vd(k);
const mouth=(k,t)=>talking(k,t)?AN.mouthAt(k,t-vs(k)):undefined;
const live=(k,t)=>{const s=vs(k);return t>=s-.16&&t<=s+vd(k)+.5;};
function latest(keys,t){let b=null;for(const k of keys)if(live(k,t)&&(!b||vs(k)>vs(b)))b=k;return b;}
function vo(k,t,name,o={}){
  if(!k||!live(k,t))return false;
  const s=vs(k),y=o.y!=null?o.y:(name?270:276),h=o.h||(name?82:80);
  R.vnBox(g,o.x!=null?o.x:16,y,o.w||608,h,name||'',S.TXT[k],t-(s-.16),{words:words(k),nameCol:o.nameCol||PINK});
  return true;}

/* ---------- drawing helpers ---------- */
function poly(G,P,fill,stroke,lw=2){
  G.beginPath();P.forEach((p,i)=>i?G.lineTo(p[0],p[1]):G.moveTo(p[0],p[1]));G.closePath();
  if(fill){G.fillStyle=fill;G.fill();}
  if(stroke){G.lineWidth=lw;G.lineJoin='round';G.strokeStyle=stroke;G.stroke();}}
function frame(G,x,y,w,h,col,lw=1){G.lineWidth=lw;G.strokeStyle=col;G.strokeRect(x+lw/2,y+lw/2,w-lw,h-lw);}
function line(G,x1,y1,x2,y2,col,lw=1){G.lineWidth=lw;G.strokeStyle=col;G.lineCap='round';G.beginPath();G.moveTo(x1,y1);G.lineTo(x2,y2);G.stroke();}
function pop(cx,cy,t,t0,fn,d=.18,ez=back){if(t<t0)return;const k=ez(seg(t,t0,t0+d));scaled(cx,cy,k,k,fn);}
function flash(t,t0,col='#ffe2c4',a=.35){if(t>=t0&&t<t0+.1)ga(a*(1-seg(t,t0,t0+.1)),()=>rect(g,0,0,W,H,col));}
function bigPop(s,cx,y,t,t0,col=GOLD,max=6){
  if(t<t0)return;const sc=Math.max(1,Math.round(max*back(seg(t,t0,t0+.25))));
  PF.putBig(g,s,cx-PF.textW(s,sc)/2,y,col,INK,sc);}
function cursor(x,y,down){
  const P=[[0,0],[0,16],[4,12],[7,19],[10,18],[7,11],[12,11]].map(p=>[x+p[0],y+p[1]+(down?1:0)]);
  poly(g,P,'#ffffff',INK,1.5);}
const fmt=n=>Math.round(n).toLocaleString('en-US');
const fitSc=(s,maxW,sc=2)=>PF.textW(s,sc)<=maxW?sc:1;
const textL=(s,x,y,col,sc=2)=>PF.putBig(g,s,x,y,col,INK,sc);
const textC=(s,cx,y,col,sc=2)=>PF.putBig(g,s,cx-PF.textW(s,sc)/2,y,col,INK,sc);
const small=(s,x,y,col=PALE,sh=INK)=>PF.put(g,s,x,y,col,sh,1);
const smallC=(s,cx,y,col=PALE)=>small(s,cx-PF.textW(s,1)/2,y,col);
const wrapL=(s,w)=>{const r=PF.wrap(s,w);return Array.isArray(r)?r:String(r).split('\n');};
function neonL(s,cx,y,col,core,t,t0,cps=40,sc=2){
  if(t<t0)return;R.neonText(ty(s,t,t0,cps),cx-PF.textW(s,sc)/2,y,col,sc,core,'left');}
function confetti(t,t0,n=48,seed=3){
  const dt=t-t0;if(dt<0)return;const C=[GOLD,CYAN,PINK,GREEN,'#ffffff',PURP];
  for(let i=0;i<n;i++){
    const h1=hash(i*3.1+seed),h2=hash(i*7.7+seed),h3=hash(i*1.3+seed);
    const x=h1*W+Math.sin(dt*3+i)*12,y=-10-h3*90+dt*(90+h2*90);if(y>H+10)continue;
    rect(g,x,y,Math.abs(Math.cos(dt*6+i))*5+1,4,C[i%C.length]);}}
function envIcon(x,y,flap='#cbbcf4',s=1){
  const w=14*s,h=10*s,x0=x-w/2,y0=y-h/2;
  poly(g,[[x0,y0],[x0+w,y0],[x0+w,y0+h],[x0,y0+h]],'#f4ecff','#1a0a2a',1.5);
  poly(g,[[x0,y0],[x,y0+h*.6],[x0+w,y0]],flap,'#1a0a2a',1.2);}
function sprC(rows,cx,cy,s,pal){if(!rows||!rows.length)return;spr(rows,Math.round(cx-rows[0].length*s/2),Math.round(cy-rows.length*s/2),s,pal);}
const KEY_L=()=>({a1:104,a2:26,f1:.9,f2:.59,hand:'key',off:40,hs:.9});
const KEY_R=()=>({a1:76,a2:154,f1:.9,f2:.59,hand:'key',off:-40,hs:.9});

/* ================= PARTY (29.5-40.8): colleagues levelled up ================= */
const CARDS=[
 {cast:'raj', name:'RAJ', role:'SALES',   lv:'LV 42',acc:CYAN,     bg:'#0c2c44',item:'DECK READY ✓',   it:31.81,key:'c1',f0:29.7,f1:33.6,
  gest:{a1:40,a2:-100,f1:.85,f2:.8,hand:'fist'}},
 {cast:'maya',name:'MAYA',role:'PROJECTS',lv:'LV 38',acc:PURP,     bg:'#24104a',item:'SUMMARY.DOC ✓',it:35.23,key:'c2',f0:33.6,f1:37.2,
  gest:{a1:60,a2:-60,f1:.9,f2:.8,hand:'flat'}},
 {cast:'leo', name:'LEO', role:'SUPPORT', lv:'LV 40',acc:'#ff5a3c',bg:'#3a1410',item:'RECAP ✓',      it:38.37,key:'c3',f0:37.2,f1:40.8,
  gest:{a1:50,a2:-80,f1:.8,f2:.85,hand:'wave'}}];
function gesture(c,t){
  const o=Object.assign({},c.gest);
  if(o.hand==='wave')o.a2+=Math.sin(t*10)*14;else if(o.hand==='fist')o.a2+=Math.sin(t*7)*8;else o.a1+=Math.sin(t*4)*4;
  return o;}
function cardDesk(x0,y0,w,cx,py,k){
  const top=py+180*k,bot=y0+190;
  rect(g,x0,top,w,bot-top,'#1c1438');rect(g,x0,top,w,2,'#5a4a9a');
  const ky0=py+198*k,ky1=py+259*k,a=137*k,b=167*k;
  poly(g,[[cx-a,ky0],[cx+a,ky0],[cx+b,ky1],[cx-b,ky1]],'#2c2450','#6a5ab0',1.5);
  for(let r=0;r<3;r++){const f=(r+.5)/3,yy=lerp(ky0,ky1,f)-1.5,hw=lerp(a,b,f)-5;
    for(let x=-hw;x<hw-4;x+=7)rect(g,cx+x,yy,5,3,'#4a3e80');}
  // laptop, back to camera, off to the side
  const lx=cx+60,base=top+12;
  poly(g,[[lx,base-24],[lx+32,base-24],[lx+34,base],[lx-2,base]],'#2a2a40','#8a8ab8',1.5);
  rect(g,lx-5,base-1,44,3,'#6a6a96');
  R.mark(g,lx+16,base-12,9,{});
  // mug on the left
  const mx=cx-84,my=top+6;
  rect(g,mx,my,10,12,'#e8e0ff');rect(g,mx,my,10,2,'#8a6a4a');frame(g,mx+9,my+3,5,6,'#e8e0ff',1.5);}
function partyCard(c,i,t){
  const t0=29.5+i*.12,sl=easeOut(seg(t,t0,t0+.45));if(sl<=0)return;
  const x0=14+i*208,y0=30+Math.round((1-sl)*330),w=196,h=232,cx=x0+98,k=.34;
  const foc=t>=c.f0&&t<c.f1,talk=talking(c.key,t);
  const py=y0+100+(talk?0:Math.sin(t*9+i)*.5);
  const z=foc?lerp(1,1.04,easeOut(seg(t,c.f0,c.f0+.2))):1;
  scaled(cx,y0+h/2,z,z,()=>{
    R.vgrad(g,x0,y0,w,h,[[0,c.bg],[1,'#0a0618']]);
    R.halftone(g,x0,y0,w,h,c.acc,(x,y)=>clamp(1-(y-y0)/150,0,1)*.28,6);
    const her={cast:c.cast,outfit:'tee',noHeadset:true,chair:'office',seated:true,clip:[x0,y0,w,h],noGlow:true,rim:c.acc,t,
      pose:'type',armL:KEY_L(),armR:talk?gesture(c,t):KEY_R(),expr:talk?'happy':'smile',mouth:talk?mouth(c.key,t):undefined,
      open:AN.blinkAt(t,11+i*7),look:talk?0:.1,turn:0};
    HER.portrait(g,cx,py,k,her);
    cardDesk(x0,y0,w,cx,py,k);
    HER.portrait(g,cx,py,k,Object.assign({},her,{armsOnly:true}));
    // header strip
    rect(g,x0,y0,w,14,c.acc);
    PF.put(g,c.role,cx-PF.textW(c.role,1)/2,y0+4,'#0a0618',null,1);
    // bottom band
    rect(g,x0,y0+190,w,42,'#0a0618');rect(g,x0,y0+190,w,2,c.acc);
    textL(c.name,x0+8,y0+195,'#ffffff',2);
    small(c.lv,x0+w-8-PF.textW(c.lv,1),y0+198,PALE);
    small('GEAR: MICROSOFT 365 COPILOT',x0+8,y0+212,PALE);
    if(t<c.it){if(Math.floor(t*3)%2===0)small('WORKING…',x0+8,y0+222,'#b8a8e8');}
    else{
      pop(x0+8+PF.textW(c.item,1)/2,y0+225,t,c.it,()=>small(c.item,x0+8,y0+222,GREEN));
      if(t<c.it+.5)R.sparkle(g,x0+14+PF.textW(c.item,1),y0+225,6*(1-seg(t,c.it,c.it+.5)),'#ffffff',1,t*6,.7);}
    if(foc){
      frame(g,x0,y0,w,h,c.acc,2);
      gg.save();gg.globalAlpha*=.8;frame(gg,x0-1,y0-1,w+2,h+2,c.acc,4);gg.restore();
      if(CHAT&&CHAT.length){
        const b=Math.abs(Math.sin(t*6))*3,cw=CHAT[0].length*2,ch=CHAT.length*2;
        rect(g,x0+w-cw-16,y0+19-b,cw+8,ch+8,'rgba(5,3,15,.85)');
        spr(CHAT,x0+w-cw-12,y0+23-b,2,{'#':c.acc});}
    }else if(t>=29.7)rect(g,x0,y0,w,h,'rgba(5,3,15,.5)');
  });}
function party(t){
  R.vgrad(g,0,0,W,H,[[0,'#120a2e'],[1,'#2a0f4a']]);
  R.halftone(g,0,0,W,H,'#ff3fa4',(x,y)=>clamp((y-120)/240,0,1)*.3,7);
  R.stars(g,t,7,60,0,0,W,H,['#ffffff',CYAN,PINK],.35);
  CARDS.forEach((c,i)=>partyCard(c,i,t));
  R.hudText('★ YOUR PARTY LEVELLED UP ★',320,10,GOLD,2,'center');
  pop(574,311,t,30.2,()=>{
    const b=R.win(g,524,266,100,90,'SOFIA',{theme:'vapor',body:'#1a0a36'});
    R.halftone(g,b.x,b.y,b.w,b.h,'#ff3fa4',(x,y)=>clamp((y-b.y)/b.h,0,1)*.6,5);
    HER.portrait(g,574,341,.36,{clip:[b.x,b.y,b.w,b.h],noGlow:true,expr:'worried',sweat:true,look:-.4,turn:-.15,t,
      open:AN.blinkAt(t,4),rim:PINK});});
  const k=latest(['c1','c2','c3'],t);
  if(k){const c=CARDS.find(c=>c.key===k);vo(k,t,c.name,{w:500,nameCol:c.acc});}
  return POST;}

/* ================= QUEST (40.8-51.0): Hannah's session ================= */
function acceptBtn(t){
  const pressed=t>=48.77,x=404,y=192,w=120,h=22;
  pop(464,203,t,44.8,()=>{
    rect(g,x,y,w,h,pressed?'#1a6a40':'#2a1a5a');
    frame(g,x,y,w,h,pressed?GREEN:CYAN,2);
    rect(g,x+2,y+2,w-4,2,'rgba(255,255,255,.25)');
    textC('▶ ACCEPT',464,y+4+(pressed?1:0),'#ffffff',2);
    if(!pressed&&t>=46.6){const a=.5+.5*Math.sin(t*8);ga(a,()=>frame(gg,x-2,y-2,w+4,h+4,CYAN,3));}
  },.15);}
function questLog(t){
  if(t<41.9)return;
  pop(464,132,t,41.9,()=>{
    R.win(g,300,34,328,196,'QUEST LOG',{theme:'vapor'});
    R.neonText('★ NEW QUEST ★',464,56,GOLD,2,PALE,'center');
    const T0=42.8;
    if(t>=T0){
      if(CALI&&CALI.length)spr(CALI,312,80,2,{'#':'#ffffff'});
      small(ty('CALENDAR · TOMORROW · 10:00',t,T0,44),338,84,PALE);}
    neonL('INTRODUCTION TO',464,102,CYAN,'#e0fcff',t,43.3);
    neonL('MICROSOFT 365 COPILOT',464,120,CYAN,'#e0fcff',t,43.7);
    neonL('LED BY HANNAH',464,144,PINK,'#ffe6f4',t,44.2);
    if(t>=44.5)small(ty('YOU: ATTENDEE',t,44.5,40),464-PF.textW('YOU: ATTENDEE',1)/2,168,CYAN);
    if(t>=44.4&&t<46.8){
      const a=(.55+.45*Math.sin(t*10))*(1-seg(t,46.4,46.8)),bw=PF.textW('MICROSOFT 365 COPILOT',2)+16;
      ga(a,()=>{frame(g,464-bw/2,115,bw,24,GOLD,2);frame(gg,464-bw/2,115,bw,24,GOLD,3);});}
    acceptBtn(t);
  });
  if(t>=48.0&&t<49.4){const p=ease(seg(t,48.0,48.6));cursor(lerp(596,472,p),lerp(256,206,p),t>=48.77&&t<48.92);}
  if(t>=48.77)R.stamp(g,'QUEST ACCEPTED!',464,203,t-48.77,{col:GREEN,fill:'rgba(4,20,12,.85)'});}
function quest(t){
  const typing=t<41.2,accept=t>=48.6;
  let expr='happy',look=.4,turn=.2,htilt=0,pose='relax';
  if(typing){expr='panting';look=0;turn=0;pose='type';}
  else if(t<41.5){expr='surprised';look=.2;turn=0;}
  // hold the puzzled face through "...What's that?" until accept; never snap to closed-eye 'happy' mid-question
  if(t>=44.4&&t<48.8){expr='surprised';htilt=.12*ease(seg(t,44.4,44.6))*(1-ease(seg(t,48.6,48.8)));}
  if(accept){pose='fist';expr='determined';look=.2;turn=.1;}
  const mk=t>=48.6?'find':t>=44.4?'what':'session';
  const PY=120+(typing?Math.sin(t*9)*.5:0);
  const her={chair:'office',seated:true,look,turn,htilt,t,rim:GREEN,pose,expr,mouth:mouth(mk,t),sweat:typing,open:AN.blinkAt(t,3),
    armL:typing?KEY_L():undefined,armR:typing?KEY_R():undefined};
  R.withCam({x:394,y:140,z:1.3},()=>{
    officeRoom(t,true);
    if(accept)R.speedLines(g,320,60,36,GREEN,.22,Math.floor(t*8),90,420,.05);
    HER.portrait(g,320,PY,.46,her);
    povDesk(t,!typing,typing);
    if(typing)HER.portrait(g,320,PY,.46,Object.assign({},her,{armsOnly:true}));
  });
  if(t>=41.2&&t<41.9)bigPop('!',282,26,t,41.2);
  if(t>=46.2&&t<48.0)bigPop('?',282,26,t,46.2);
  questLog(t);
  vo(latest(['session','what','find'],t),t,'SOFIA');
  return POST;}

/* ================= ENTER (51.0-53.8): Copilot summoned ================= */
function summonRing(t,pa){
  if(pa<=0)return;
  for(const [G,lw,a] of [[g,2,.9],[gg,5,.6]]){
    G.save();G.globalAlpha*=a*pa;G.strokeStyle=CYAN;G.lineWidth=lw;
    G.beginPath();G.ellipse(320,230,150,36,0,0,TAU);G.stroke();
    G.setLineDash([12,8]);G.lineDashOffset=-t*40;G.beginPath();G.ellipse(320,230,122,28,0,0,TAU);G.stroke();
    G.restore();}
  ga(pa,()=>{for(let i=0;i<12;i++){const a=t*.8+i*TAU/12,x=320+Math.cos(a)*150,y=230+Math.sin(a)*36;
    poly(g,[[x,y-4],[x+3,y],[x,y+4],[x-3,y]],Math.sin(a)>0?'#c8fbff':'#5aa8c8');}});}
function enter(t){
  rect(g,0,0,W,H,'#05030f');
  R.stars(g,t,11,90,0,0,W,H,['#ffffff',CYAN,PURP],.5);
  const pa=easeOut(seg(t,51.0,51.6));
  for(const [G,a] of [[g,.5],[gg,.6]]){
    const pw=14+pa*30,lg=G.createLinearGradient(320-pw,0,320+pw,0);
    lg.addColorStop(0,'rgba(53,231,255,0)');lg.addColorStop(.5,'rgba(200,250,255,'+(a*pa).toFixed(3)+')');lg.addColorStop(1,'rgba(53,231,255,0)');
    G.fillStyle=lg;G.fillRect(320-pw,0,pw*2,232);}
  summonRing(t,pa);
  if(t>=51.6){
    const br=220*easeOut(seg(t,51.6,52.3));
    if(br>1){g.save();g.beginPath();g.arc(320,140,br,0,TAU);g.clip();burst(g,320,140,16,420,'#0a1a3e','#14305e',t*.4);g.restore();}
    R.speedLines(g,320,140,40,CYAN,.3,Math.floor(t*10),150,440,.05);
    for(let i=0;i<6;i++){const a=t*1.6+i*TAU/6,r=96+Math.sin(t*3+i)*6;
      R.sparkle(g,320+Math.cos(a)*r,140+Math.sin(a)*r*.8,5+2*Math.sin(t*7+i),'#ffffff',.9,t*2+i,.6);}
    const fa=1-seg(t,51.6,52.15);if(fa>0)R.flare(320,140,1.25,fa);
    R.airbrush(gg,320,140,70,70,CYAN,.2);
    const sz=64*back(seg(t,51.6,52.0));
    if(sz>1){R.airbrush(gg,320,140,sz*.85,sz*.85,'#000000',.95*seg(t,51.8,52.2),.45);R.markPix(320,140,sz);}
    flash(t,51.6,'#e8fbff',.2);}
  if(t>=53.0)pop(320,233,t,53.0,()=>R.hudText('COPILOT JOINED THE PARTY!',320,226,GREEN,2,'center'));
  vo('enter',t,'');
  R.stepFade(1-seg(t,51,51.3),'#000000',5);
  return POST;}

/* ================= BOSS (53.8-58.6): the inbox ================= */
const MON={x:500,y:128};
const TRAY=[{x:140,lab:'★ PRIORITY',col:GOLD,n:12},{x:320,lab:'FYI',col:CYAN,n:1040},{x:500,lab:'LATER',col:PURP,n:3760}];
function orbit(t,cx,cy,s,front){
  for(let i=0;i<10;i++){const a=t*1.5+i*TAU/10,sn=Math.sin(a);if((sn>0)!==front)continue;
    envIcon(cx+Math.cos(a)*96*s,cy+sn*30*s-4,'#ff8aa0',front?1:.85);}}
function monster(t,hp){
  const hit=t>=54.5&&t<54.8,dying=t>=57.6;
  if(dying&&Math.floor(t*20)%2)return;
  const s=.7+.3*hp,cx=MON.x+(hit?Math.sin(t*90)*3:0),cy=MON.y+Math.sin(t*3)*4,ink='#1a0a2a';
  R.airbrush(gg,cx,cy,95*s,72*s,RED,.45);
  orbit(t,cx,cy,s,false);
  scaled(cx,cy,s,s,()=>{
    const x=cx-60,y=cy-42;
    poly(g,[[x,y],[x+120,y],[x+120,y+84],[x,y+84]],hit?'#ffffff':'#ece4ff',ink,3);
    poly(g,[[x,y],[cx,y+46],[x+120,y]],hit?'#ffffff':'#cbbcf4',ink,3);
    poly(g,[[cx-44,cy-26],[cx-16,cy-5],[cx-18,cy+5],[cx-42,cy-14]],RED,ink,2);
    poly(g,[[cx+44,cy-26],[cx+16,cy-5],[cx+18,cy+5],[cx+42,cy-14]],RED,ink,2);
    rect(g,cx-31,cy-12,5,5,GOLD);rect(g,cx+26,cy-12,5,5,GOLD);
    poly(g,[[cx-38,cy+12],[cx+38,cy+12],[cx+30,cy+32],[cx-30,cy+32]],'#3a0614',ink,2);
    for(let i=0;i<6;i++){const xx=cx-34+i*11.33;poly(g,[[xx,cy+13],[xx+11.33,cy+13],[xx+5.66,cy+21]],'#ffffff');}
    for(let i=0;i<5;i++){const xx=cx-28+i*11.2;poly(g,[[xx,cy+31],[xx+11.2,cy+31],[xx+5.6,cy+24]],'#ffffff');}
  });
  R.airbrush(gg,cx-28*s,cy-10*s,10,8,RED,.8);R.airbrush(gg,cx+28*s,cy-10*s,10,8,RED,.8);
  orbit(t,cx,cy,s,true);}
function monsterPop(t){
  const p=seg(t,57.9,58.5);if(p>=1)return;
  for(let i=0;i<18;i++){const a=i*TAU/18+hash(i)*.3,r=20+p*150*(.6+hash(i+5)*.6);
    ga(1-p,()=>i%3?rect(g,MON.x+Math.cos(a)*r-3,MON.y+Math.sin(a)*r-3,6,6,i%2?'#ece4ff':RED)
                  :envIcon(MON.x+Math.cos(a)*r,MON.y+Math.sin(a)*r,'#ff8aa0'));}
  ga(1-p,()=>R.airbrush(gg,MON.x,MON.y,120*p+20,100*p+20,'#ffffff',.6));
  R.sparkle(g,MON.x,MON.y,30*(1-p),'#ffffff',1-p,t*4,.8);}
function zap(t,x1,y1,x2,y2){
  const a=1-seg(t,54.5,54.9),P=[[x1,y1]],sd=Math.floor(t*30);
  for(let i=1;i<10;i++){const f=i/10;P.push([lerp(x1,x2,f),lerp(y1,y2,f)+(hash(sd*13+i)-.5)*26]);}P.push([x2,y2]);
  for(const [G,lw,col] of [[gg,10,CYAN],[g,4,CYAN],[g,1.5,'#ffffff']]){
    G.save();G.globalAlpha*=a;G.strokeStyle=col;G.lineWidth=lw;G.lineJoin='round';
    G.beginPath();P.forEach((p,i)=>i?G.lineTo(p[0],p[1]):G.moveTo(p[0],p[1]));G.stroke();G.restore();}
  R.sparkle(g,x2,y2,14*a,'#ffffff',a,t*8,.8);}
function trays(t){
  const a=easeOut(seg(t,55.5,55.97));if(a<=0)return;
  TRAY.forEach((tr,i)=>{const y=236+(1-a)*40;
    ga(a,()=>{
      poly(g,[[tr.x-60,y-14],[tr.x+60,y-14],[tr.x+52,y+16],[tr.x-52,y+16]],'#141030',tr.col,2);
      rect(g,tr.x-56,y-14,112,3,tr.col);
      textC(tr.lab,tr.x,y-34,tr.col,2);
      textC(fmt(tr.n*seg(t,55.97+.1*i,57.0)),tr.x,y-5,'#ffffff',2);});});}
function envStream(t){
  for(let i=0;i<30;i++){
    const ts=55.97+i*.035,p=seg(t,ts,ts+.5);if(p<=0||p>=1)continue;
    const tr=TRAY[i%6===0?0:(i%2?1:2)],x0=MON.x,y0=MON.y,x1=tr.x,y1=224,mx=(x0+x1)/2,my=Math.min(y0,y1)-90-hash(i)*40,e=ease(p);
    envIcon((1-e)*(1-e)*x0+2*(1-e)*e*mx+e*e*x1,(1-e)*(1-e)*y0+2*(1-e)*e*my+e*e*y1,tr.col);}}
function matters(t){
  pop(280,121,t,57.17,()=>{
    const b=R.win(g,130,70,300,102,'WHAT MATTERS',{theme:'vapor'});
    ['★ BUDGET SIGN-OFF · FRI','★ CLIENT REVIEW · MON','★ TEAM REORG · READ'].forEach((s,i)=>{
      const t0=57.3+i*.15;if(t<t0)return;const dx=(1-easeOut(seg(t,t0,t0+.2)))*-20;
      ga(seg(t,t0,t0+.12),()=>textL(s,b.x+8+dx,b.y+7+i*23,GOLD,fitSc(s,b.w-14)));});});}
function boss(t){
  R.vgrad(g,0,0,W,H,[[0,'#0a0420'],[.6,'#1c0636'],[1,'#30083c']]);
  R.stars(g,t,5,40,0,0,W,200,['#ffffff',PINK],.3);
  R.synthGrid(t,250,'#ff3fa4');
  let hp=lerp(1,.7,easeOut(seg(t,54.5,54.7)));
  if(t>=55.97)hp=lerp(.7,.2,seg(t,55.97,57.0));
  if(t>=57.6)hp=lerp(.2,0,seg(t,57.6,57.9));
  const sh=(t>=54.5&&t<54.8)?R.shake(Math.floor(t*24),3,9):[0,0];
  const hy=118+Math.sin(t*2)*4;
  R.withCam({x:320,y:180,z:1,dx:sh[0],dy:sh[1]},()=>{
    R.airbrush(gg,96,hy,56,56,CYAN,.35);
    R.markPix(96,hy,44);
    if(t<57.9)monster(t,hp);else monsterPop(t);
    if(t>=54.5&&t<54.9)zap(t,96,hy,MON.x,MON.y);
    trays(t);
    if(t>=55.97)envStream(t);
  });
  flash(t,54.5,'#e8fbff',.4);flash(t,57.9,'#ffffff',.3);
  R.hudText('BOSS: THE INBOX',450,8,RED,2,'center');
  R.meter(g,350,30,200,8,hp,{segs:20,col:RED});
  if(t<57.9)R.hudText('✉ 4,812 UNREAD',450,44,PALE,2,'center');
  else pop(450,52,t,57.9,()=>R.hudText('SORTED ✓',450,44,GREEN,2,'center'));
  if(t>=57.17)matters(t);
  vo('inbox',t,'');
  return POST;}

/* ================= DRAFTS (58.6-63.9): replies + Planner ================= */
const DRAFT=['Hi Priya,','thanks for waiting.','The budget looks','good. I\'ll confirm','by Friday.','— Sofia'];
const PLAN=[{s:'SIGN OFF BUDGET',due:'FRI',col:GOLD},{s:'CALL CLIENT',due:'MON',col:CYAN},{s:'READ REORG PLAN',due:'THIS WK',col:PINK}];
function beam(t,x1,y1,x2,y2,t0,col){
  const a=easeOut(seg(t,t0,t0+.2));
  ga(a*.6,()=>{line(g,x1,y1,x2,y2,col,1);line(gg,x1,y1,x2,y2,col,3);});
  for(let i=0;i<4;i++){const f=((t-t0)*1.6+i/4)%1,x=lerp(x1,x2,f),y=lerp(y1,y2,f);
    ga(a,()=>{rect(g,x-2,y-2,4,4,'#ffffff');R.airbrush(gg,x,y,6,6,col,.8);});}}
function draftWin(t){
  pop(148,138,t,58.75,()=>{
    const b=R.win(g,12,36,272,204,'DRAFT REPLY · 1 OF 6',{theme:'classic'});
    PF.put(g,'TO: PRIYA',b.x+6,b.y+5,INK,true,1);
    PF.put(g,'RE: BUDGET SIGN-OFF',b.x+6,b.y+17,INK,true,1);
    rect(g,b.x+4,b.y+29,b.w-8,1,'#808080');rect(g,b.x+4,b.y+30,b.w-8,1,'#ffffff');
    let n=Math.floor(Math.max(0,t-59.33)*75),cx=null,cy=0;
    DRAFT.forEach((s,i)=>{if(n<=0)return;const p=s.slice(0,n);n-=s.length;const y=b.y+37+i*17;
      PF.put(g,p,b.x+6,y,'#101010',null,2);cx=b.x+6+PF.textW(p,2)+2;cy=y;});
    if(cx!==null&&t<60.73&&Math.floor(t*4)%2===0)rect(g,cx,cy,8,14,'#101010');
    if(t>=60.73)R.stamp(g,'READY FOR REVIEW ✓',b.x+b.w/2,b.y+161,t-60.73,{col:'#0f9a48',fill:'rgba(232,255,240,.92)'});
  });}
function planner(t){
  pop(492,134,t,61.55,()=>{
    const b=R.win(g,356,36,272,196,'PLANNER',{theme:'night'});
    textL('TO DO',b.x+8,b.y+6,'#ffffff',2);
    const n=PLAN.filter((p,i)=>t>=61.9+i*.25).length,lab=n+(n===1?' TASK':' TASKS');
    small(lab,b.x+b.w-8-PF.textW(lab,1),b.y+10,PALE);
    rect(g,b.x+6,b.y+24,b.w-12,1,CYAN);
    PLAN.forEach((p,i)=>{const t0=61.9+i*.25;if(t<t0)return;const y=b.y+30+i*48;
      // cards inside a window grow with easeOut: a back() overshoot would poke them through the window frame
      pop(b.x+b.w/2,y+21,t,t0,()=>{
        rect(g,b.x+6,y,b.w-12,42,'#16204a');frame(g,b.x+6,y,b.w-12,42,'#2e3e7a',1);
        rect(g,b.x+6,y,4,42,p.col);
        frame(g,b.x+16,y+8,11,11,'#ffffff',1.5);
        textL(p.s,b.x+34,y+6,'#ffffff',fitSc(p.s,b.w-48));
        const d='DUE '+p.due,pw=PF.textW(d,1)+10;
        rect(g,b.x+34,y+26,pw,11,p.col);PF.put(g,d,b.x+39,y+28,'#0a0618',null,1);},.18,easeOut);});
  });}
function drafts(t){
  R.vgrad(g,0,0,W,H,[[0,'#0c0a2a'],[1,'#1e0c3e']]);
  R.halftone(g,0,0,W,H,CYAN,(x,y)=>clamp(1-Math.hypot(x-320,y-130)/260,0,1)*.25,7);
  R.stars(g,t,9,40,0,0,W,H,['#ffffff',CYAN],.3);
  const my=132+Math.sin(t*2)*3;
  if(t>=59.33)beam(t,320,my,284,140,59.33,CYAN);
  if(t>=61.9)beam(t,320,my,356,140,61.9,GREEN);
  R.airbrush(gg,320,my,44,44,CYAN,.35);R.markPix(320,my,40);
  draftWin(t);
  planner(t);
  // plate sits in the gap between the Planner window (bottom 232, shadow 236) and the VO box (top 276)
  if(t>=62.7)pop(492,256,t,62.7,()=>R.hudText('+ ADDED TO PLANNER',492,248,GREEN,2,'center'));
  vo('drafts',t,'');
  return POST;}

/* ================= CLASH (63.9-70.4): calendar + Hannah's availability ================= */
const WK=[[0,0,1,1],[0,2,2,0],[0,4,1,1],[0,6,1,0],[1,1,1,1],[1,3,1,0],[1,5,2,1],[2,0,2,0],[2,3,1,1],[2,5,1,0],[2,6,1,1],
  [3,0,1,0],[3,1,1,1],[3,3,1,0],[3,6,2,1],[4,0,1,1],[4,2,1,0],[4,4,2,1],[4,7,1,0]];
const HB=[[0,1,2,4,5,6],[0,1,3,4,5,7],[1,2,3,5,6],[0,1,2,3,4,6,7],[0,2,3,4,5,6]];
const DAYS=['MON','TUE','WED','THU','FRI'],RY=68,RH=22;
function block(x,y,w,h,fill,edge,mark){
  rect(g,x,y,w,h,fill);frame(g,x,y,w,h,edge,1.5);
  if(mark)PF.put(g,mark,x+w/2-PF.textW(mark,1)/2,y+h/2-3,edge,INK,1);
  else if(w>20&&h>12)rect(g,x+4,y+5,Math.min(w-8,w*.55),2,'rgba(255,255,255,.35)');}
function hatch(x,y,w,h){
  rect(g,x,y,w,h,'#2a2a3e');g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
  g.strokeStyle='#4a4a66';g.lineWidth=1.5;for(let i=-h;i<w;i+=5){g.beginPath();g.moveTo(x+i,y+h);g.lineTo(x+i+h,y);g.stroke();}
  g.restore();}
function weekWin(t){
  R.win(g,16,34,384,230,'MY WEEK',{theme:'vapor'});
  const CX=50,CW=68.8;
  DAYS.forEach((d,i)=>smallC(d,CX+i*CW+CW/2,56,i===3?CYAN:PALE));
  for(let h=0;h<=8;h++){const y=RY+h*RH;rect(g,CX,y,CW*5,1,'rgba(120,140,220,.25)');
    if(h<8){const s=String(9+h);small(s,44-PF.textW(s,1),y+3,'#9aa8e8');}}
  for(let i=0;i<=5;i++)rect(g,CX+i*CW,RY,1,RH*8,'rgba(120,140,220,.25)');
  let ci=0;
  WK.forEach(([d,h,len,cl])=>{
    const x=CX+d*CW+2,y=RY+h*RH+2,w=CW-4,hh=len*RH-3;
    if(!cl){block(x,y,w,hh,'#2a3a7a','#5a6ab8');return;}
    const i=ci++,p=seg(t,64.87+i*.06,65.3+i*.06),hw=(w-2)/2;
    if(p<1)ga(1-p,()=>block(x+hw+2+p*24,y,hw,hh,'#3a0c1c',RED,'!'));
    block(x,y,lerp(hw,w,ease(p)),hh,p<.5?'#3a0c1c':'#0c3a4a',p<.5?RED:CYAN,p<.5?'!':'');});
  if(t>=68.33){ // drops in on "books a catch-up"
    const p=back(seg(t,68.33,68.76)),x=CX+3*CW+2,y=lerp(RY+5*RH-70,RY+5*RH+2,p);
    rect(g,x,y,CW-4,RH-3,'#0c5a32');frame(g,x,y,CW-4,RH-3,GREEN,1.5);
    small('CATCH-UP',x+4,y+2,'#ffffff');small('W/ HANNAH',x+4,y+11,PALE);
    R.airbrush(gg,x+CW/2,y+RH/2,30,14,GREEN,.6*(1-seg(t,68.76,69.46))+.15);}}
function hannahWin(t){
  pop(518,149,t,66.4,()=>{
    R.win(g,412,34,212,230,'HANNAH · FREE/BUSY',{theme:'vapor'});
    const CX=444,CW=34.4;
    'MTWTF'.split('').forEach((d,i)=>smallC(d,CX+i*CW+CW/2,56,i===3?CYAN:PALE));
    for(let h=0;h<=8;h++){const y=RY+h*RH;rect(g,CX,y,CW*5,1,'rgba(120,140,220,.25)');
      if(h<8){const s=String(9+h);small(s,440-PF.textW(s,1),y+3,'#9aa8e8');}}
    HB.forEach((hs,d)=>hs.forEach(h=>hatch(CX+d*CW+2,RY+h*RH+2,CW-4,RH-3)));
    if(t>=66.6&&t<67.17){ // scan on "checks when Hannah", FREE lands on "free"
      const y=lerp(RY,RY+8*RH,seg(t,66.6,67.13));
      ga(.18,()=>rect(g,CX,RY,CW*5,y-RY,CYAN));
      rect(g,CX,y-1,CW*5,2,CYAN);R.airbrush(gg,CX+CW*2.5,y,90,6,CYAN,.7);}
    if(t>=67.17){
      const x=CX+3*CW+2,y=RY+5*RH+2,on=Math.floor(t*4)%2===0;
      rect(g,x,y,CW-4,RH-3,'#1a8a4a');if(on)frame(g,x-2,y-2,CW,RH+1,GREEN,2);
      R.airbrush(gg,x+CW/2,y+RH/2,24,14,GREEN,.7);
      pop(518,252,t,67.17,()=>smallC('THU 14:00 FREE ✓',518,249,GREEN));}
  });}
function clash(t){
  R.vgrad(g,0,0,W,H,[[0,'#0a0a2e'],[1,'#1a0c3a']]);
  R.stars(g,t,13,40,0,0,W,H,['#ffffff',CYAN],.25);
  weekWin(t);
  hannahWin(t);
  R.markPix(28,18,20);
  const u=seg(t,64.87,65.6);
  if(t<65.6)R.hudText('CLASHES: '+Math.round(37*(1-u)),208,10,u>0?GOLD:RED,2,'center');
  else pop(208,18,t,65.6,()=>R.hudText('CLASHES: 37 → 0 ✓',208,10,GREEN,2,'center'));
  if(t>=68.33)pop(516,18,t,68.33,()=>R.hudText('CATCH-UP BOOKED ✓',516,10,GREEN,2,'center'));
  vo(latest(['clash','avail'],t),t,'');
  return POST;}

/* ================= RECAP (70.4-76.5): six months in sixty seconds + session prep ================= */
const MONTHS=[['JAN','NEW ORG CHART',CYAN],['FEB','PROJECT ATLAS LAUNCH',PINK],['MAR','BUDGET V3',GOLD],
  ['APR','NEW CLIENT: CONTOSO',GREEN],['MAY','TEAM OFFSITE',PURP],['JUN','COPILOT ROLLOUT','#ff8a3c']];
function vhsNoise(t,a=1){
  const sd=Math.floor(t*24);
  for(let b=0;b<2;b++){const y0=((t*60+b*170)%420)-30;
    for(let i=0;i<40;i++){const x=hash(sd*7+i+b*100)*W,w=4+hash(sd*3+i)*30,yy=y0+hash(sd*5+i+b)*14;
      rect(g,x,yy,w,1,'rgba(255,255,255,'+((.12+hash(i+sd)*.2)*a).toFixed(3)+')');}}}
function monthCard(t,i,m){
  const t0=70.5+.3*i;if(t<t0)return;
  const f=seg(t,72.3+i*.08,72.7+i*.08);if(f>=1)return;
  const cx0=20+(i%3)*205+95,cy0=46+Math.floor(i/3)*106+50,fe=easeIn(f);
  const cx=lerp(cx0,320,fe),cy=lerp(cy0,150,fe),s=lerp(1,.12,fe),fl=easeOut(seg(t,t0,t0+.25));
  scaled(cx,cy,fl*s,s,()=>{
    const x=cx-95,y=cy-50,[mo,ev,col]=m;
    rect(g,x,y,190,100,'#10142e');frame(g,x,y,190,100,col,2);
    rect(g,x,y,190,20,col);
    ga(1-seg(f,0,.3),()=>{PF.put(g,mo,x+8,y+3,'#0a0618',null,2);
      small('2025',x+190-8-PF.textW('2025',1),y+7,'#0a0618',null);
      wrapL(ev,88).forEach((s,j)=>textL(s,x+10,y+30+j*19,'#ffffff',2));});});}
function doc(t,x){
  if(t<72.3)return;
  const k=back(seg(t,72.3,72.6)),y=150,pulse=1+.06*Math.max(0,Math.sin((t-72.3)*20))*(t<73.2?1:0);
  R.airbrush(gg,x,y,50,60,CYAN,.3*k);
  scaled(x,y,k*pulse,k*pulse,()=>{
    poly(g,[[x-35,y-45],[x+19,y-45],[x+35,y-29],[x+35,y+45],[x-35,y+45]],'#f4f0ff','#1a0a2a',2);
    poly(g,[[x+19,y-45],[x+19,y-29],[x+35,y-29]],'#c8c0e8','#1a0a2a',1.5);
    for(let i=0;i<6;i++)rect(g,x-25,y-26+i*9,i===0?40:50-(i%3)*8,3,'#8a80b8');
    R.mark(g,x,y+30,12,{});});
  if(t>=73.2)pop(x,212,t,73.2,()=>R.hudText('RECAP.DOC ✓',x,205,GREEN,2,'center'));}
function prepWin(t){
  pop(442,145,t,74.0,()=>{
    const b=R.win(g,260,40,364,210,'SESSION PREP ✓',{theme:'vapor'});
    textC('INTRO TO MICROSOFT 365 COPILOT',442,b.y+8,CYAN,fitSc('INTRO TO MICROSOFT 365 COPILOT',b.w-16));
    textC('TOMORROW 10:00',442,b.y+30,'#ffffff',2);
    textC('HOST: HANNAH',442,b.y+50,PINK,2);
    rect(g,b.x+12,b.y+72,b.w-24,1,'#5a4a9a');
    ['AGENDA','3 QUESTIONS','PRE-READ'].forEach((s,i)=>{
      const t0=74.4+.3*i,y=b.y+84+i*24,x=b.x+30;
      frame(g,x,y,14,14,'#ffffff',1.5);
      if(t>=t0)pop(x+7,y+7,t,t0,()=>PF.putBig(g,'✓',x+2,y,GREEN,INK,2));
      textL(s,x+24,y,t>=t0?'#ffffff':'#8a80b8',2);});
    if(t>=75.3)R.stamp(g,'READY ✓',b.x+b.w-70,b.y+b.h-30,t-75.3,{col:GREEN,fill:'rgba(4,20,12,.85)'});
  });}
function recap(t){
  R.vgrad(g,0,0,W,H,[[0,'#06061e'],[1,'#120a30']]);
  const ff=t<73.2;
  vhsNoise(t,ff?1:.35);
  if(ff){if(Math.floor(t*2.5)%2===0)textL('▶▶ FF',14,10,'#ffffff',2);}
  else textL('▶ PLAY',14,10,'#ffffff',2);
  R.hudText('6 MONTHS → 60 SECONDS',344,10,CYAN,2,'center');
  MONTHS.forEach((m,i)=>monthCard(t,i,m));
  doc(t,320+(t>=74?lerp(0,-180,ease(seg(t,74,74.35))):0));
  if(t>=74.0)prepWin(t);
  vo(latest(['missed','prep'],t),t,'');
  return POST;}

/* ================= CLEAR (76.5-79.3): stage clear ================= */
function status(t){
  R.win(g,404,12,220,76,'STATUS',{theme:'vapor'});
  const up=t>=77.67,hp=lerp(.3,1,ease(seg(t,76.7,77.6)));
  PF.put(g,'SOFIA',412,31,PALE,INK,1);
  const lv=up?'LV '+Math.round(lerp(12,40,easeOut(seg(t,77.67,78.2)))):'LV 12';
  if(up)pop(616-PF.textW(lv,1)/2,34,t,77.67,()=>PF.put(g,lv,616-PF.textW(lv,1),31,GREEN,INK,1));
  else PF.put(g,lv,616-PF.textW(lv,1),31,'#ffffff',INK,1);
  PF.put(g,'HP',412,42,'#ffffff',INK,1);
  R.meter(g,432,42,120,6,hp,{col:hp>.75?GREEN:RED});
  PF.put(g,up?'STATUS: READY':'STATUS: SYNCING…',412,53,up?GREEN:GOLD,INK,1);
  PF.put(g,up?'MODE: CAUGHT UP':'MODE: 6 MO BEHIND',412,64,up?CYAN:RED,INK,1);}
function clear(t){
  R.vgrad(g,0,0,W,H,[[0,'#120a2e'],[1,'#2a0f4a']]);
  g.save();g.beginPath();g.arc(190,150,250,0,TAU);g.clip();burst(g,190,150,18,260,'#1e0a3e','#4a1050',t*.15);g.restore();
  R.halftone(g,0,0,420,330,'#ff3f5a',(x,y)=>clamp(1-Math.hypot(x-190,y-150)/230,0,1)*.4,6);
  R.halftone(g,330,0,310,300,CYAN,(x,y)=>clamp(1-Math.hypot(x-470,y-150)/190,0,1)*.55,6);
  R.speedLines(g,470,150,40,CYAN,.22,Math.floor(t*8),120,520,.05);
  HER.portrait(g,190,170+Math.sin(t*6)*1.5,.57,{pose:'fist',rim:GREEN,expr:t<78.4?'determined':'happy',mouth:mouth('got',t),
    open:AN.blinkAt(t,5),t});
  if(t>=77.67){
    confetti(t,77.67);
    pop(474,126,t,77.67,()=>R.logoText('STAGE CLEAR!',474,112,4,{}),.25);
    for(let i=0;i<5;i++){const a=t*2+i*TAU/5;
      R.sparkle(g,474+Math.cos(a)*170,126+Math.sin(a)*34,4+2*Math.sin(t*9+i),'#ffffff',.9,t*3+i,.6);}}
  status(t);
  flash(t,77.67,'#fff6d0',.35);
  vo('got',t,'SOFIA');
  return POST;}

/* ================= OUTRO (79.3-84.5) ================= */
function outro(t){
  R.vgrad(g,0,0,W,H,[[0,'#0a0420'],[.55,'#2a0c4a'],[1,'#120626']]);
  R.stars(g,t,17,80,0,0,W,220,['#ffffff',CYAN,PINK],.45);
  R.synthSun(320,190,80,t,{glow:1-.65*seg(t,81.97,82.6)});
  R.synthGrid(t,230,'#ff3fa4');
  // glow-layer masks: the grid/sun glow is additive and would bloom straight through Sofia and the logo
  R.airbrush(gg,110,300,110,175,'#000000',1,.45);
  const s1='MICROSOFT 365';
  if(t>=79.7)R.neonText(ty(s1,t,79.7,10),320-PF.textW(s1,3)/2,26,CYAN,3,'#e8fdff','left');
  if(t>=81.97){
    pop(320,77,t,81.97,()=>R.logoText('COPILOT',320,56,6,{}),.3);
    R.airbrush(gg,320,160,58,58,'#000000',.95*seg(t,81.97,82.3),.5);
    const fa=1-seg(t,81.97,82.7);if(fa>0)R.flare(320,160,1.3,fa);
    const sz=56*back(seg(t,81.97,82.4));if(sz>1)R.markPix(320,160,sz);
    flash(t,81.97,'#ffffff',.3);}
  const wv=Math.sin(t*8)*16;
  HER.portrait(g,110,252+Math.sin(t*3)*2,.45,{expr:'happy',t,rim:PINK,open:AN.blinkAt(t,7),look:.3,turn:.15,pose:'wave',
    armR:{a1:50,a2:-80+wv,f1:.8,f2:.85,hand:'wave'}});
  // starts 4f early so the spring's overshoot lands on the C-chord fanfare at 83.0
  if(t>=82.87)pop(400,306,t,82.87,()=>R.hudText('WELCOME BACK, SOFIA!',400,296,PINK,3,'center',{glow:.18,mask:true,core:'#ffe6f4'}),.25);
  return {bloom:.6,halo:.13};}

/* ================= CREDIT (84.5-87.5) ================= */
function creditScene(t){
  const sg=seg(t,84.5,85.3);
  rect(g,0,0,W,H,'#05030f');
  R.stars(g,t,21,80,0,0,W,H,['#ffffff',CYAN,PINK],.4);
  R.logoText('COPILOT QUEST',320,lerp(-40,80,back(sg)),4,{});
  // subtitle waits for the title's back() overshoot (peak ~84.96) to settle, so they never overlap
  const fs=seg(t,85.15,85.5);if(fs>0)ga(fs,()=>R.hudText('EP.1 · WELCOME BACK',320,136,GOLD,2,'center'));
  const sz=52*back(sg);if(sz>1)R.markPix(320,212,sz);
  const fa=seg(t,85.3,85.9);
  if(fa>0)ga(fa,()=>R.label(g,'Created by GitHub Copilot',320,290,'#f6ecd2',2,'center',INK));
  R.iris(320,180,lerp(0,800,ease(sg)),'#000000');
  return POST;}

Object.assign(S.TXT,{
  c1:"Copilot prepped my client meeting in five minutes!",
  c2:"I just asked Copilot to summarise the whole project.",
  c3:"Have you caught up on missed messages yet?",
  session:"Oh! Hannah's running a session tomorrow.",
  what:"Microsoft 365 Copilot? What's that?",
  find:"Let's find out!",
  enter:"Enter Copilot.",
  inbox:"It sorts the inbox, and summarises what really matters.",
  drafts:"Drafts her replies, ready to review, and adds her actions to Planner.",
  clash:"Untangles the calendar.",
  avail:"Then checks when Hannah is free, and books a catch-up.",
  missed:"Recaps six months in sixty seconds.",
  prep:"Gets her ready for tomorrow's session.",
  got:"Okay. I've got this.",
  outro:"Microsoft 365 Copilot. Welcome back."});
Object.assign(S,{party,quest,enter,boss,drafts,clash,recap,clear,outro,credit:creditScene});
})();
