/* heroine.js - rich 90s-anime tachie rig for Sofia (retro cut).
   HER.portrait(G,x,y,k,o). Origin = neck base, +x screen-right, +y down.
   o = {outfit:'office'|'beach'|'tee', expr, mouth, open, t, pose, armL, armR, look, turn,
        tilt, htilt, rim, sweat, lwk, chair:'office'|'beach', clip:[x,y,w,h], noGlow, seated,
        noHeadset, noLegs, cast:'raj'|'maya'|'leo'|{male,short,glasses,tail,star,ahoge,SK,HR,EY,tee}} */
(()=>{'use strict';
const {path,poly,cel,line,mix,rgba,airbrush,halftone,LWK,TAU}=R;
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, D2R=Math.PI/180, PI=Math.PI;
const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};

/* ---------- geometry helpers ---------- */
function starP(cx,cy,r1,r2,n=5,rot=-PI/2){const p=[];for(let i=0;i<n*2;i++){const r=i%2?r2:r1,a=rot+i*PI/n;p.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return poly(p,true);}
function spark4(cx,cy,r){const q=r*.22;return poly([[cx,cy-r],[cx+q,cy-q],[cx+r,cy],[cx+q,cy+q],[cx,cy+r],[cx-q,cy+q],[cx-r,cy],[cx-q,cy-q]],true);}
function capsule(a,b,r1,r2){const P=new Path2D(),an=Math.atan2(b[1]-a[1],b[0]-a[0]),nx=-Math.sin(an),ny=Math.cos(an);
  P.moveTo(a[0]+nx*r1,a[1]+ny*r1);P.lineTo(b[0]+nx*r2,b[1]+ny*r2);P.arc(b[0],b[1],r2,an+PI/2,an-PI/2,true);
  P.lineTo(a[0]-nx*r1,a[1]-ny*r1);P.arc(a[0],a[1],r1,an-PI/2,an+PI/2,true);P.closePath();return P;}
function sampleSpine(pts,n){const out=[],m=pts.length-1;
  for(let i=0;i<=n;i++){const u=i/n*m,k=Math.min(Math.floor(u),m-1),f=u-k;
    const p0=pts[Math.max(k-1,0)],p1=pts[k],p2=pts[k+1],p3=pts[Math.min(k+2,m)];
    const cr=(a,b,c,d)=>.5*(2*b+(-a+c)*f+(2*a-5*b+4*c-d)*f*f+(-a+3*b-3*c+d)*f*f*f);
    out.push([cr(p0[0],p1[0],p2[0],p3[0]),cr(p0[1],p1[1],p2[1],p3[1])]);}
  return out;}
/* ribbon around sampled spine S; wf(u)=half width, of(u)=normal offset */
function ribS(S,wf,of){const n=S.length-1,L=[],Rr=[];
  for(let i=0;i<=n;i++){const u=i/n,p=S[i],q=S[Math.min(i+1,n)],o=S[Math.max(i-1,0)];
    let dx=q[0]-o[0],dy=q[1]-o[1];const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
    const w=wf(u),off=of?of(u):0,cx=p[0]-dy*off,cy=p[1]+dx*off;
    if(w<.35){L.push([cx,cy,1]);continue;}
    L.push([cx-dy*w,cy+dx*w]);Rr.push([cx+dy*w,cy-dx*w]);}
  return L.concat(Rr.reverse());}
function rib(spine,wf,n=24,of){return ribS(sampleSpine(spine,n),wf,of);}
function ell(cx,cy,rx,ry,rot=0){const P=new Path2D();P.ellipse(cx,cy,rx,ry,rot,0,TAU);return P;}
const mir=pts=>pts.map(p=>[-p[0],p[1],p[2]]);
function strokeP(G,P,col,lw){G.save();G.strokeStyle=col;G.lineWidth=lw*LWK.k;G.lineJoin='round';G.lineCap='round';G.stroke(P);G.restore();}
function rawStroke(G,P,col,w){G.save();G.strokeStyle=col;G.lineWidth=w;G.lineJoin='round';G.lineCap='round';G.stroke(P);G.restore();}
function fillP(G,P,col){G.fillStyle=col;G.fill(P);}
function grp(C,dx,dy,rot,pv,fn){for(const c of C){c.save();c.translate(dx,dy);if(rot&&pv){c.translate(pv[0],pv[1]);c.rotate(rot);c.translate(-pv[0],-pv[1]);}}
  try{fn();}finally{for(const c of C)c.restore();}}

/* ---------- palettes ---------- */
/* SK/HR/EY are swapped per call by portrait({cast}) so supporting characters share the hero rig + art style */
let SK={f:'#ffe2cc',s:'#f2a98f',s2:'#d97e74',l:'#7a3b33',blush:'#ff8a8a'};
let HR={f:'#e8682c',s:'#b33a2a',d:'#7a1f2e',h:'#ffd2a0',h2:'#fff1d6',l:'#5a1424'};
let EY={top:'#0f4d55',f:'#1f8f8a',lo:'#3fd6c0',pu:'#0a2a33',l:'#1a0f1a',scl:'#fffaf6',sclS:'#c9d6ec'};
let CAST={};
const TEE_DEF={f:'#1f9e94',s:'#157a73',l:'#0b3c3a'};
/* supporting cast = the same rig with palette + feature switches (no second rig to maintain) */
const CASTS={
  raj:{male:true,short:true,tail:false,ahoge:false,
    SK:{f:'#c98a5e',s:'#a86a44',s2:'#8a5236',l:'#4a2614',blush:'#e0705a'},
    HR:{f:'#2a2230',s:'#18121e',d:'#0c0810',h:'#5a4a6a',h2:'#8a7a9a',l:'#05030a'},
    EY:{top:'#3a1e10',f:'#6a3a1e',lo:'#c08040',pu:'#1a0a04'},tee:{}},
  maya:{star:false,ahoge:false,
    SK:{f:'#f5cfa8',s:'#d9a07a',s2:'#c08060',l:'#6a3a2a'},
    HR:{f:'#4a2a5a',s:'#2e1a3a',d:'#1a0e22',h:'#8a6aa0',h2:'#c8b0e0',l:'#120818'},
    tee:{f:'#7a4aff',s:'#5a2ad0',l:'#2a1060'}},
  leo:{male:true,short:true,tail:false,glasses:true,
    HR:{f:'#e89a3c',s:'#b8662a',d:'#7a3a1a',h:'#ffd08a',h2:'#fff0d0',l:'#4a1a0a'},
    EY:{top:'#1a3a7a',f:'#3a6ad0',lo:'#8ab8ff',pu:'#0a1430'},
    tee:{f:'#ff6b5a',s:'#d9443f',l:'#7a2030'}}};
const JK={f:'#fbf3e4',s:'#d9c3a8',s2:'#b89c80',l:'#6b4a3a',trim:'#2bb3a6',trimS:'#1d7f78'};
const TOP={f:'#2a2433',s:'#18141f',l:'#0c0a10'};
const SKT={f:'#1f9e94',s:'#157a73',s2:'#0f5a55',l:'#0b3c3a',hem:'#fbf3e4'};
const GOLD={f:'#ffd34a',s:'#e09a1a',l:'#7a4a10'};
const SWIM={f:'#ff6b5a',s:'#d9443f',l:'#7a2030',st:'#ffffff',t:'#2bb3a6'};
const HS={band:'#2a2f3a',plate:'#4a5468',core:'#6b7a90',led:'#35e7ff'};
const LW=2.2;

/* ---------- poses (deg: 0=+x, 90=down) ---------- */
const POSES={
  relax:{L:{a1:98,a2:92,hand:'relax'},R:{a1:82,a2:88,hand:'relax'}},
  hip:{L:{a1:125,a2:40,hand:'fist'}},
  card:{L:{a1:125,a2:40,hand:'fist'},R:{a1:70,a2:-40,hand:'flat',off:40,fy:1}},
  wave:{R:{a1:45,a2:-75,hand:'wave'}},
  shock:{late:true,L:{a1:100,a2:-80,f1:.45,hand:'open',fy:-1},R:{a1:80,a2:-100,f1:.45,hand:'open',fy:1}},
  type:{L:{a1:80,a2:20,f1:.85,hand:'flat'},R:{a1:55,a2:5,hand:'flat'}},
  drink:{L:{a1:110,a2:100,hand:'relax'},R:{a1:80,f1:.9,a2:-115,f2:.85,hand:'hold',off:-65,fy:-1,cup:1,fold:1}},
  fist:{R:{a1:75,f1:.9,a2:-100,hand:'fist'}}
};
function armG(side,A){const S=[side*80,44],L1=150*(A.f1??1),L2=118*(A.f2??1),a1=A.a1*D2R,a2=A.a2*D2R;
  const E=[S[0]+Math.cos(a1)*L1,S[1]+Math.sin(a1)*L1],W=[E[0]+Math.cos(a2)*L2,E[1]+Math.sin(a2)*L2];
  return {S,E,W,a1,a2,up:capsule(S,E,21,15),fo:capsule(E,W,15,11)};}
/* line along the body-facing side of a capsule (separates arm from torso after a union fill) */
function innerEdge(G,a,b,r1,r2,col,from=.32,to=.92){const an=Math.atan2(b[1]-a[1],b[0]-a[0]);let nx=-Math.sin(an),ny=Math.cos(an);
  const mx=(a[0]+b[0])/2;if((mx+nx)*(mx+nx)>mx*mx){nx=-nx;ny=-ny;}
  const p=u=>{const r=lerp(r1,r2,u);return [lerp(a[0],b[0],u)+nx*r,lerp(a[1],b[1],u)+ny*r];};
  line(G,[p(from),p((from+to)/2),p(to)],col,LW);}

/* ---------- hands (local: fingers along +x) ---------- */
const PALM=[[0,-9],[14,-12],[34,-14],[38,-2],[36,12],[16,12],[0,9]];
const FB=[-11,-4,3,10], FL=[26,30,28,22];
function fingerSeg(b,ang,len,curl){const a1=ang*D2R,m=[b[0]+Math.cos(a1)*len*.5,b[1]+Math.sin(a1)*len*.5],a2=(ang+curl)*D2R,e=[m[0]+Math.cos(a2)*len*.5,m[1]+Math.sin(a2)*len*.5];
  return curl?[capsule(b,m,4.6,4.3),capsule(m,e,4.3,3.9)]:[capsule(b,e,4.6,3.9)];}
function hand(G,W,ang,kind,fy,col,lcol,rim,hs,tt){
  const C=col||SK,LC=lcol||C.l;G.save();G.translate(W[0],W[1]);G.rotate(ang);G.scale(1.15*(hs||1),1.15*(fy||1));
  const parts=[],fing=[];let thumb;
  parts.push(path(PALM));
  if(kind==='key'){
    /* back of the hand seen from above (typing): knuckles toward camera, fingertips curled onto keys, thumb tucked inside */
    const KB=[-9.4,-3.1,3.1,9.2],KL=[17,20,19,15],tips=[];
    thumb=capsule([12,-12],[27,-21],4.8,3.9);
    for(let i=0;i<4;i++){const lift=Math.sin((tt||0)*19+i*2.4)>.6?5:0,b=[22,KB[i]],e=[22+KL[i]-lift,KB[i]*1.32];
      fing.push(capsule(b,e,4.2,3.6));tips.push(e);}
    const back=path([[0,-10],[13,-13],[26,-13],[30,-7],[31,0],[30,7],[26,12],[13,11],[0,9]]);
    for(const p of[thumb,...fing,back])strokeP(G,p,LC,LW*1.6);
    for(const p of[thumb,...fing,back])cel(G,p,{f:C.f,s:C.s,so:[0,-3],rim});
    for(const e of tips)fillP(G,ell(e[0]-1.5,e[1],2.6,3.2),rgba(C.s2||C.s,.75));
    G.save();G.beginPath();G.rect(30,-60,80,120);G.clip();for(const p of fing)strokeP(G,p,LC,LW*.55);G.restore();
    for(const y of KB){const k=new Path2D();k.arc(25.5,y,3.2,-1.1,1.1);rawStroke(G,k,rgba(LC,.3),.8);}
    G.restore();return;}
  if(kind==='fist'||kind==='hold'){
    /* one clean knuckle block + 3 finger splits + thumb across the front (per-finger capsules read as scribble at video scale) */
    const blk=path([[24,-16],[40,-17],[49,-12],[52,-3],[51,7],[46,14],[34,16],[24,14]]);
    thumb=capsule([12,-13],[33,-2],5.8,4.8);
    for(const p of[parts[0],blk,thumb])strokeP(G,p,LC,LW*1.6);
    for(const p of[parts[0],blk])cel(G,p,{f:C.f,s:C.s,so:[0,-3.5],rim});
    G.save();G.clip(blk);for(const y of[-7.5,-.5,6.5])line(G,[[39,y],[54,y+.6]],LC,LW*.6);G.restore();
    cel(G,thumb,{f:C.f,s:C.s,so:[0,-2.5]});strokeP(G,thumb,LC,LW*.7);
    G.restore();return;
  }else{
    const spec={open:[[-10,0],[-3,0],[4,0],[12,0]],relax:[[-4,25],[0,25],[4,28],[8,30]],flat:[[-2,0],[0,0],[2,0],[4,0]],
      wave:[[-22,0],[-8,0],[6,0],[20,0]]}[kind]||[[-4,25],[0,25],[4,28],[8,30]];
    for(let i=0;i<4;i++){const [a,c]=spec[i];fing.push(...fingerSeg([34,FB[i]],a,FL[i],c));}
    thumb=kind==='relax'?capsule([8,-10],[22,-20],5.5,4.5):capsule([8,-10],[24,-24],5.5,4.5);
  }
  parts.push(...fing,thumb);
  for(const p of parts)strokeP(G,p,LC,LW*1.6);
  for(const p of parts)cel(G,p,{f:C.f,s:C.s,so:[0,-3.5],rim});
  G.save();G.beginPath();G.rect(32,-60,80,120);G.clip();for(const p of fing)strokeP(G,p,LC,LW*.55);G.restore();
  strokeP(G,thumb,LC,LW*.55);
  G.restore();}

/* ---------- chairs ---------- */
function chairOffice(G){
  const P=path([[-112,-40],[-70,-60],[0,-64],[70,-60],[112,-40],[120,110],[112,250],[70,262],[-70,262],[-112,250],[-120,110]]);
  cel(G,P,{f:'#2a2f3a',s:'#1b1f28',so:[-9,-2],h:'#3e4656',ho:[7,5],l:'#0c0e14',lw:2.4});}
function chairBeach(G){
  const P=poly([[-108,-120],[108,-120],[124,300],[-124,300]],true);
  /* sunny yellow stripes (teal echoed the sarong and read as a sailor collar behind the neck) + body cast shadow */
  cel(G,P,{f:'#fffaf0',l:'#3a2a20',lw:2.2,clipFn:g=>{
    for(let i=-6;i<6;i+=2){g.fillStyle='#ffc93a';g.fill(poly([[i*20,-130],[(i+1)*20,-130],[(i+1)*23.5,310],[i*23.5,310]],true));}
    g.fillStyle=rgba('#5a2a1a',.3);g.fill(ell(0,30,112,170));}});
  for(const s of[-1,1])cel(G,capsule([s*112,-132],[s*130,310],7,8),{f:'#c48a52',s:'#8a5a32',so:[-2,0],l:'#4a2a14'});
  cel(G,capsule([-118,-128],[118,-128],7,7),{f:'#c48a52',s:'#8a5a32',so:[0,-2],l:'#4a2a14'});}

/* ---------- back hair + ponytail ---------- */
/* inner edge runs down behind the neck (to y≈6) so no background shows through a neck gap */
const BACK_R=[[0,-232],[60,-222],[92,-190],[108,-145],[112,-100],[110,-55],[104,-10],[112,40,1],[88,10],[92,62,1],[66,22],[50,4],[30,8]];
const BACK=BACK_R.concat(mir(BACK_R).reverse().slice(0,-1));
/* short cut (cast.short): ends at the nape, hugs the skull a little tighter */
const BACKS_R=[[0,-238],[58,-228],[84,-198],[90,-160],[86,-122],[76,-96],[60,-84],[40,-80]];
const BACKS=BACKS_R.concat(mir(BACKS_R).reverse().slice(0,-1));
/* male short cut (cast.male): spiky crown, sides stop above the ears so it never reads as a bob */
const BACKM_R=[[0,-244],[14,-258,1],[28,-240],[46,-254,1],[58,-232],[76,-236,1],[78,-212],[90,-198,1],[80,-180],[86,-160,1],[74,-148],[70,-122],[60,-104],[36,-96]];
const BACKM=BACKM_R.concat(mir(BACKM_R).reverse().slice(0,-1));
function backHair(G,o,t){
  cel(G,path(CAST.male?BACKM:CAST.short?BACKS:BACK),{f:HR.s,s:HR.d,so:[0,-16],sh:[ell(0,-40,62,46)],l:HR.l,lw:2.4});
  if(CAST.tail===false||CAST.short)return;
  // ponytail (screen-right)
  const sp=[[84,-190],[130,-180],[150,-120],[150,-40],[140,40],[150,110]].map((p,i,a)=>{const u=i/(a.length-1);return [p[0]+Math.sin(t*1.6+u*2)*u*8,p[1]];});
  const S=sampleSpine(sp,24),wf=u=>34*(u<.25?.45+.55*u/.25:Math.pow(1-(u-.25)/.75,.8));
  const PT=path(ribS(S,wf));
  cel(G,PT,{f:HR.f,s:HR.s,so:[-9,-2],sh2:[path(ribS(S,u=>wf(u)*.28,u=>wf(u)*.62))],s2:HR.d,rim:o.rim?{c:o.rim,d:[-3.5,1]}:undefined,l:HR.l,lw:2.4,clipFn:g=>{
    const Sg=S.slice(3,14);g.fillStyle=HR.h;g.fill(path(ribS(Sg,u=>wf(.12+u*.42)*.2*Math.sin(u*PI)+.01,u=>-wf(.12+u*.42)*.38)));
    g.fillStyle=HR.h2;g.fill(path(ribS(Sg.slice(2,8),u=>wf(.2+u*.25)*.07*Math.sin(u*PI)+.01,u=>-wf(.2+u*.25)*.38)));
    for(const [k,a,b] of[[-.45,.18,.95],[.05,.3,1],[.4,.22,.85]]){const pts=[];for(let i=Math.round(a*24);i<=Math.round(b*24);i++){const u=i/24,p=S[i],q=S[Math.min(i+1,24)],r=S[Math.max(i-1,0)];let dx=q[0]-r[0],dy=q[1]-r[1];const d=Math.hypot(dx,dy)||1;pts.push([p[0]-dy/d*wf(u)*k,p[1]+dx/d*wf(u)*k]);}
      line(g,pts,HR.l,.9);}}});
  // star clip
  if(CAST.star===false)return;
  const st=starP(80,-188,16,7);strokeP(G,st,GOLD.l,LW*1.6);cel(G,st,{f:GOLD.f,s:GOLD.s,so:[-3,-3],h:'#fff6c8',ho:[3,3]});
}

/* ---------- lower body ---------- */
function thighs(G,o,rim){
  const P=o.seated?[[[-40,300],[-52,400],38,36],[[40,300],[52,400],38,36]]:[[[-38,320],[-40,500],36,30],[[38,320],[40,500],36,30]];
  const ps=P.map(q=>capsule(q[0],q[1],q[2],q[3]));
  for(const p of ps)strokeP(G,p,SK.l,LW*2);
  const band=poly([[-130,300],[130,300],[130,398],[0,404],[-130,398]],true);
  ps.forEach((p,i)=>cel(G,p,{f:SK.f,s:SK.s,so:[-7,-2],sh:[band],rim:i?rim:undefined}));
  line(G,[[0,338],[0,360]],SK.s2,1.2);}
function skirt(G,t,rim){
  const sw=Math.sin(t*1.3)*3,B=[];
  for(let i=0;i<=8;i++){const u=i/8;B.push([[-52+104*u,204,1],[-88+176*u+sw*.4,285],[-112+224*u+sw,372+12*Math.sin(u*PI)+(i%2?8:0),1]]);}
  const sil=[B[0][0],B[0][1]];for(let i=0;i<=8;i++)sil.push(B[i][2]);sil.push(B[8][1],B[8][0]);
  const panel=j=>path([B[j][0],B[j][1],B[j][2],B[j+1][2],B[j+1][1],B[j+1][0]]);
  cel(G,path(sil),{f:SKT.f,s:SKT.s,sh:[1,3,5].map(panel),s2:SKT.s2,sh2:[panel(0),panel(7)],rim,l:SKT.l,lw:2.4,clipFn:g=>{
    halftone(g,10,200,130,200,SKT.s2,(x,y)=>clamp((x-10)/110,0,1)*.55,5);
    g.fillStyle=rgba('#0b3c3a',.5);g.fill(path([[-90,198,1],[90,198,1],[84,224],[0,232],[-84,224]]));
    const hs=[];for(let i=0;i<=8;i++){const p=B[i][2];hs.push([p[0]*.985,p[1]-13]);}
    g.save();g.strokeStyle=SKT.hem;g.lineWidth=5;g.lineJoin='round';g.stroke(poly(hs,false));g.restore();
    for(let i=1;i<8;i++)line(g,path([B[i][0],B[i][1],[B[i][2][0],B[i][2][1]]],false),SKT.l,1.2);}});
}

/* ---------- torso (office) ---------- */
const NECK=[[-17,-66],[-17,-40],[-19,-8],[-34,6],[-34,40],[34,40],[34,6],[19,-8],[17,-40],[17,-66]];
function collarBack(G){cel(G,path([[-30,-14],[-22,-30],[0,-34],[22,-30],[30,-14],[22,4],[-22,4]]),{f:JK.s2,l:JK.l});}
function neckChest(G,rim){
  cel(G,path(NECK),{f:SK.f,s:SK.s,so:[-5,0],sh:[ell(0,-44,26,18)],rim,l:SK.l});
  line(G,[[-8,12],[-16,9],[-24,8]],SK.s2,1.3);line(G,[[8,12],[16,9],[24,8]],SK.s2,1.3);}
const TOPP=[[-30,6,1],[-62,14],[-86,30],[-90,60],[-82,100],[-66,140],[-54,170],[-56,198],[0,201],[56,198],[54,170],[66,140],[82,100],[90,60],[86,30],[62,14],[30,6,1],[22,26],[0,38],[-22,26]];
function topOffice(G,t,rim){
  cel(G,path(TOPP),{f:TOP.f,s:TOP.s,so:[-8,-3],rim,l:TOP.l,clipFn:g=>{
    halftone(g,6,10,90,195,'#0c0a10',(x,y)=>clamp((x-6)/80,0,1)*.6,5);
    for(let i=0;i<16;i++){const sx=-58+hash(i*3.1)*116,sy=44+hash(i*7.7)*150,tw=.5+.5*Math.sin(t*5+i*2.3),r=1.6+hash(i+.5)*3.2*tw;
      g.fillStyle=rgba('#ffffff',.45+.55*tw);g.fill(spark4(sx,sy,r));}
    line(g,[[-64,92],[-40,108],[-10,104]],'#4a405a',1.5);line(g,[[64,92],[40,108],[10,104]],'#4a405a',1.5);}});}
function belt(G){
  cel(G,path([[-56,190,1],[0,193],[56,190,1],[56,208,1],[0,211],[-56,208,1]]),{f:'#3a2f3a',s:'#241c26',so:[0,-4],h:'#5a4a5a',ho:[0,3],l:'#140e16'});
  cel(G,poly([[-10,190],[10,190],[10,208],[-10,208]],true),{f:GOLD.f,s:GOLD.s,so:[-3,-3],h:'#fff6c8',ho:[2,2],l:GOLD.l,lw:1.6,clipFn:g=>{g.fillStyle='#3a2f3a';g.fillRect(-5,195,10,8);}});}
const JKL=[[-22,-2],[-44,8],[-68,16],[-88,28],[-98,48],[-96,76],[-92,110],[-88,148,1],[-60,154],[-36,148,1],[-32,112],[-30,80],[-28,44],[-22,14]];
const JKT=[[-98,147,1],[-88,148,1],[-60,154],[-36,148,1],[-32,112],[-30,80],[-28,44],[-22,14],[-20,-8]];
function jacket(G,gL,gR,rim){
  const PL=path(JKL),PR=path(mir(JKL));
  for(const p of[PL,PR,gL.up,gR.up])strokeP(G,p,JK.l,LW*2);
  const trim=side=>g=>{const P=path(side<0?JKT:mir(JKT),false);rawStroke(g,P,JK.trimS,17);rawStroke(g,P,JK.trim,14);};
  cel(G,PL,{f:JK.f,s:JK.s,so:[-7,-3],clipFn:trim(-1)});
  cel(G,PR,{f:JK.f,s:JK.s,so:[-10,-3],s2:JK.s2,sh2:[path([[60,20],[96,40],[98,100],[90,150],[70,150]])],rim,clipFn:g=>{
    halftone(g,40,10,70,150,JK.s2,(x,y)=>clamp((x-40)/60,0,1)*.5,5);trim(1)(g);}});
  sleeveUp(G,gL,-1);sleeveUp(G,gR,1,rim);}
function sleeveUp(G,g,side,rim){
  cel(G,g.up,{f:JK.f,s:JK.s,so:[-6,-2],rim,clipFn:c=>{const m=[lerp(g.S[0],g.E[0],.62),lerp(g.S[1],g.E[1],.62)];line(c,[[m[0]-6,m[1]-4],[m[0]+2,m[1]],[m[0]+8,m[1]-2]],JK.s2,1.2);}});
  innerEdge(G,g.S,g.E,21,15,JK.l);}
function lapels(G){
  const LP=[[-22,8],[-40,22],[-58,50,1],[-44,58],[-30,84,1],[-26,44]];
  for(const pts of[LP,mir(LP)]){
    G.save();G.translate(3,4);fillP(G,path(pts),rgba('#b89c80',.7));G.restore();
    cel(G,path(pts),{f:JK.f,s:JK.s,so:[-3,-3],l:JK.l});
    G.save();G.clip(path(pts));rawStroke(G,path(pts.slice(0,5),false),JK.trim,6);G.restore();
    strokeP(G,path(pts),JK.l,LW);}}

/* ---------- torso (tee: supporting cast, Microsoft 365 Copilot team shirt) ---------- */
const TEE=[[-30,6,1],[-64,14],[-90,30],[-96,62],[-92,110],[-88,160],[-90,204],[0,208],[90,204],[88,160],[92,110],[96,62],[90,30],[64,14],[30,6,1],[22,24],[0,34],[-22,24]];
const teeCol=()=>Object.assign({},TEE_DEF,CAST.tee);
function teeSleeve(G,g,rim,T){
  const m=[lerp(g.S[0],g.E[0],.45),lerp(g.S[1],g.E[1],.45)],P=capsule(g.S,m,25,22);
  strokeP(G,P,T.l,LW*2);
  cel(G,P,{f:T.f,s:T.s,so:[-6,-2],rim,clipFn:c=>line(c,[[m[0]-10,m[1]-2],[m[0]+10,m[1]+1]],T.s,2)});}
function teeBody(G,gL,gR,rim,T){
  const P=path(TEE);
  strokeP(G,P,T.l,LW*2);for(const p of[gL.up,gR.up])strokeP(G,p,SK.l,LW*2);
  cel(G,P,{f:T.f,s:T.s,so:[-8,-3],rim,clipFn:g=>{
    halftone(g,10,20,90,190,T.l,(x,y)=>clamp((x-10)/80,0,1)*.45,5);
    line(g,[[-62,120],[-40,134],[-12,130]],T.s,1.5);line(g,[[62,120],[40,134],[12,130]],T.s,1.5);
    R.mark(g,0,80,46,{});}});
  const NL=path([[-30,6],[-22,24],[0,34],[22,24],[30,6]],false);
  rawStroke(G,NL,T.s,7);strokeP(G,NL,T.l,LW*.8);
  for(const [g,s] of[[gL,-1],[gR,1]]){const r=s>0?rim:undefined;
    cel(G,g.up,{f:SK.f,s:SK.s,so:[-6,-2],rim:r});innerEdge(G,g.S,g.E,21,15,SK.l,.5,.92);teeSleeve(G,g,r,T);}}

/* ---------- torso (beach) ---------- */
const TB_R=[[17,-66],[17,-40],[19,-8],[40,6],[70,14],[88,30],[90,60],[82,100],[66,140],[54,170],[56,198],[70,240],[84,290],[80,330],[0,336]];
const TB=mir(TB_R).concat(TB_R.slice(0,-1).reverse());
function torsoBeach(G,gL,gR,rim,t){
  const P=path(TB);
  for(const p of[P,gL.up,gR.up])strokeP(G,p,SK.l,LW*2);
  cel(G,P,{f:SK.f,s:SK.s,so:[-8,-3],sh:[ell(0,-44,26,18)],rim,clipFn:(g,TP)=>{
    line(g,[[-8,12],[-16,9],[-24,8]],SK.s2,1.3);line(g,[[8,12],[16,9],[24,8]],SK.s2,1.3);
    swimsuit(g,TP,rim);}});
  for(const [g,s] of[[gL,-1],[gR,1]]){cel(G,g.up,{f:SK.f,s:SK.s,so:[-6,-2],rim:s>0?rim:undefined});innerEdge(G,g.S,g.E,21,15,SK.l);}
  sarong(G,t,rim);}
/* retro racer one-piece: drawn inside the torso clip so it can never spill past the body outline */
const SUIT_R=[[0,64],[22,56],[36,34],[40,-8,1],[56,-8,1],[58,22],[68,46],[90,58],[124,58,1],[124,240,1],[98,246,1],[62,258],[30,286],[14,306,1]];
const SUIT=SUIT_R.concat(mir(SUIT_R).reverse().slice(0,-1));
const NECKLINE=[[-40,-8,1],[-36,34],[-22,56],[0,64],[22,56],[36,34],[40,-8,1]];
function swimsuit(g,TP,rim){
  const S=path(SUIT);
  g.save();g.clip(S);
  fillP(g,TP,SWIM.f);
  const Q=new Path2D();Q.addPath(TP);Q.addPath(TP,new DOMMatrix().translate(-9,-3));g.fillStyle=SWIM.s;g.fill(Q,'evenodd');
  if(rim){const Q2=new Path2D();Q2.addPath(TP);Q2.addPath(TP,new DOMMatrix().translate(rim.d[0],rim.d[1]));g.fillStyle=rim.c;g.fill(Q2,'evenodd');}
  line(g,[[-62,92],[-40,106],[-10,102]],SWIM.s,1.5);line(g,[[62,92],[40,106],[10,102]],SWIM.s,1.5);
  for(const s of[-1,1])line(g,[[s*70,58],[s*68,100],[s*54,140],[s*44,172],[s*46,200],[s*58,242]],s<0?SWIM.st:'#ffd9d2',3.2);
  line(g,[[-50,76],[-40,68],[-28,66]],'#ffb0a0',2);line(g,[[18,68],[26,66]],'#ffb0a0',1.6);
  rawStroke(g,path(NECKLINE,false),SWIM.t,7);
  g.restore();
  line(g,NECKLINE,SWIM.l,1.3);
  for(const s of[-1,1])line(g,[[s*56,-8,1],[s*58,22],[s*68,46],[s*90,58]],SWIM.l,1.3);}
function sarong(G,t,rim){
  const sw=Math.sin(t*1.4)*3;
  const P=path([[-86,236,1],[0,246],[84,232],[96,300],[110,370+sw],[40,384+sw,1],[-20,360],[-70,346,1],[-98,300]]);
  cel(G,P,{f:'#2bb3a6',s:'#1d7f78',so:[-8,-3],rim,l:'#0b3c3a',lw:2.4,clipFn:g=>{
    for(let i=0;i<22;i++){const x=-90+hash(i*2.7)*190,y=244+hash(i*5.3)*130;fillP(g,ell(x,y,3.2,3.2),'#ffffff');}
    line(g,[[-60,250],[-30,300],[-10,350]],'#1d7f78',1.4);line(g,[[20,252],[50,310],[70,370]],'#1d7f78',1.4);}});
  const K=ell(-80,246,14,11,-.4);strokeP(G,K,'#0b3c3a',LW*1.6);cel(G,K,{f:'#2bb3a6',s:'#1d7f78',so:[-3,-3]});
  for(const [a,b] of[[[-84,252],[-104,300]],[[-78,254],[-86,306]]]){const c=capsule(a,b,6,3);strokeP(G,c,'#0b3c3a',LW*1.6);cel(G,c,{f:'#2bb3a6',s:'#1d7f78',so:[-2,0]});}}

/* ---------- forearms + hands ---------- */
function forearm(G,gg,side,g,A,o,beach,refill,rim){
  /* fold: forearm bent back up across the upper arm -> no rim/inner edge (they cut through the overlap); re-ink the forearm so it reads in front */
  const tee=!!(o&&o.outfit==='tee'),bare=beach||tee;
  const col=bare?SK:JK,lc=bare?SK.l:JK.l,r=side>0&&!A.fold?rim:undefined;
  strokeP(G,g.fo,lc,LW*2);
  if(refill)cel(G,g.up,{f:col.f,s:col.s,so:[-6,-2],rim:r});
  if(refill&&tee)teeSleeve(G,g,r,teeCol());
  cel(G,g.fo,{f:col.f,s:col.s,so:[-6,-2],rim:r});
  if(refill&&!A.fold)innerEdge(G,g.S,g.E,21,15,lc,tee?.5:.32,.8);
  if(A.fold)strokeP(G,g.fo,lc,LW);
  const dir=[Math.cos(g.a2),Math.sin(g.a2)];
  if(!bare){const cf=capsule([g.W[0]-dir[0]*12,g.W[1]-dir[1]*12],[g.W[0]-dir[0]*1,g.W[1]-dir[1]*1],13,13);strokeP(G,cf,JK.trimS,LW*1.6);cel(G,cf,{f:JK.trim,s:JK.trimS,so:[-3,-2]});}
  if(A.cup){cocktail(G,g.W);if(!refill)parasol(G,g.W);}
  const fy=A.fy??(side<0?1:-1),ang=g.a2+(A.off||0)*D2R;
  hand(G,g.W,ang,A.hand||'relax',fy,SK,SK.l,r,A.hs,A.tt??(o&&o.t));}
function cocktail(G,W){
  const cx=W[0]-34,cy=W[1]-30;
  const bowl=path([[cx-24,cy-34,1],[cx+24,cy-34,1],[cx+18,cy-6],[cx+4,cy+8],[cx-4,cy+8],[cx-18,cy-6]]);
  line(G,[[cx+6,cy-34],[cx+12,cy-62]],'#ff4f9a',2.4);
  strokeP(G,bowl,'#3a2040',LW*1.6);
  G.save();G.clip(bowl);const gr=G.createLinearGradient(0,cy-30,0,cy+8);gr.addColorStop(0,'#ffb347');gr.addColorStop(1,'#ff4f7a');G.fillStyle=gr;G.fillRect(cx-30,cy-28,60,40);
  fillP(G,ell(cx-8,cy-16,4,10,.3),rgba('#ffffff',.55));G.restore();
  rawStroke(G,bowl,rgba('#ffffff',.6),1);
  const sl=new Path2D();sl.arc(cx-22,cy-34,10,PI*.1,PI*1.1,true);sl.closePath();strokeP(G,sl,'#7a4a10',LW);fillP(G,sl,'#ffb000');}
/* paper umbrella: leans screen-right, clear of the chin/neck (under the chin it read as a collar).
   Drawn after the head (see draw) so the hair lock doesn't swallow it - the glass is held in front of the hair. */
function parasol(G,W){
  const cx=W[0]-34,cy=W[1]-30;
  line(G,[[cx+16,cy-34],[cx+40,cy-56]],'#c48a52',1.4);
  const ux=cx+42,uy=cy-58,um=new Path2D();um.moveTo(ux-20,uy+5);um.quadraticCurveTo(ux-2,uy-20,ux+18,uy-3);um.closePath();
  strokeP(G,um,'#7a2040',LW*1.2);fillP(G,um,'#ff6bb5');line(G,[[ux-3,uy-7],[ux-11,uy+2]],'#ffd2e8',1.1);}

/* ---------- UI pill (card pose) ---------- */
function uiPill(G,gg,W,t){
  const cx=W[0]+40,cy=W[1]-70+Math.sin(t*2)*3,w=124,h=46;
  const P=new Path2D();P.roundRect?P.roundRect(cx-w/2,cy-h/2,w,h,h/2):P.rect(cx-w/2,cy-h/2,w,h);
  for(const c of gg?[G,gg]:[G]){const glow=c!==G;c.save();
    if(!glow){c.fillStyle=rgba('#0b1a3a',.86);c.fill(P);}
    c.strokeStyle=glow?rgba('#35e7ff',.8):'#35e7ff';c.lineWidth=glow?7:3;c.stroke(P);
    const ix=cx-36,iy=cy;c.strokeStyle='#35e7ff';c.lineWidth=3;c.lineJoin='round';
    c.beginPath();c.moveTo(ix-16,iy-2);c.lineTo(ix-10,iy-12);c.lineTo(ix+10,iy-12);c.lineTo(ix+16,iy-2);c.lineTo(ix+16,iy+12);c.lineTo(ix-16,iy+12);c.closePath();
    c.moveTo(ix-16,iy-2);c.lineTo(ix-6,iy-2);c.lineTo(ix-3,iy+3);c.lineTo(ix+3,iy+3);c.lineTo(ix+6,iy-2);c.lineTo(ix+16,iy-2);c.stroke();
    if(!glow){for(let i=0;i<3;i++){c.fillStyle=i?rgba('#35e7ff',.55):'#e8fbff';c.fillRect(cx-12,cy-12+i*9,i?46:54,4);}}
    c.fillStyle='#ff3f8a';c.beginPath();c.arc(cx+w/2-10,cy-h/2+4,10,0,TAU);c.fill();
    if(!glow){c.fillStyle='#fff';c.fillRect(cx+w/2-11.5,cy-h/2-2,3,8);c.fillRect(cx+w/2-11.5,cy-h/2+8,3,3);}
    c.restore();}}

/* ---------- main ---------- */
function portrait(G,x,y,k,o={}){
  const gg=(G===R.g&&!o.noGlow&&R.gg)?R.gg:null,C=gg?[G,gg]:[G],lk=LWK.k,sv=[SK,HR,EY,CAST];
  for(const c of C){c.save();if(o.clip){c.beginPath();c.rect(o.clip[0],o.clip[1],o.clip[2],o.clip[3]);c.clip();}c.translate(x,y);if(o.tilt)c.rotate(o.tilt);c.scale(k,k);}
  LWK.k=o.lwk??1.6;
  if(o.cast){const c=typeof o.cast==='string'?CASTS[o.cast]||{}:o.cast;SK=Object.assign({},SK,c.SK);HR=Object.assign({},HR,c.HR);EY=Object.assign({},EY,c.EY);CAST=c;}
  try{draw(G,gg,C,o,o.t||0);}finally{LWK.k=lk;[SK,HR,EY,CAST]=sv;for(const c of C)c.restore();}}
function draw(G,gg,C,o,t){
  const beach=o.outfit==='beach',tee=o.outfit==='tee',PS=POSES[o.pose]||POSES.relax;
  const AL=Object.assign({},POSES.relax.L,PS.L,o.armL),AR=Object.assign({},POSES.relax.R,PS.R,o.armR);
  if(o.pose==='type'){AL.a2+=Math.sin(t*17+1)*2.5;AR.a2+=Math.sin(t*20)*3;}
  const late=!!PS.late,rim=o.rim?{c:o.rim,d:[-3.5,1]}:undefined;
  const bdy=Math.sin(t*2.4)*1.2,hdy=bdy+Math.sin(t*2.4+.6)*.8,ht=o.htilt||0;
  const head=fn=>grp(C,0,hdy,ht,[0,-50],fn),body=fn=>grp(C,0,bdy,0,null,fn);
  const gL=armG(-1,AL),gR=armG(1,AR);
  if(o.armsOnly){body(()=>{forearm(G,gg,-1,gL,AL,o,beach,false,rim);forearm(G,gg,1,gR,AR,o,beach,false,rim);});return;}
  if(o.chair==='office')body(()=>chairOffice(G));else if(o.chair==='beach')chairBeach(G);
  head(()=>backHair(G,o,t));
  body(()=>{
    if(!tee&&!o.noLegs)thighs(G,o,rim);
    if(beach)torsoBeach(G,gL,gR,rim,t);
    else if(tee){neckChest(G,rim);teeBody(G,gL,gR,rim,teeCol());}
    else{skirt(G,t,rim);collarBack(G);neckChest(G,rim);topOffice(G,t,rim);belt(G);jacket(G,gL,gR,rim);lapels(G);}
    if(!late){forearm(G,gg,-1,gL,AL,o,beach,true,rim);forearm(G,gg,1,gR,AR,o,beach,true,rim);}
    if(o.pose==='card')uiPill(G,gg,gR.W,t);});
  head(()=>headAll(G,gg,o,t,rim,beach));
  if(!late&&(AL.cup||AR.cup))body(()=>{if(AL.cup)parasol(G,gL.W);if(AR.cup)parasol(G,gR.W);});
  if(late)body(()=>{forearm(G,gg,-1,gL,AL,o,beach,false,rim);forearm(G,gg,1,gR,AR,o,beach,false,rim);});}

/* ---------- head ---------- */
const EXPR={
  neutral:{eye:'open',mouth:'closed'},
  smile:{eye:'open',mouth:'smile',blush:.5},
  happy:{eye:'happy',mouth:'smileopen',blush:1},
  surprised:{eye:'wide',brow:'raised',mouth:'oh'},
  shocked:{eye:'dot',brow:'raised',mouth:'shocked',sweat:1},
  worried:{eye:'open',brow:'worried',mouth:'worried'},
  panting:{eye:'half',brow:'worried',mouth:'panting',sweat:1,blush:.8},
  determined:{eye:'open',brow:'angry',mouth:'smile'},
  dreamy:{eye:'closed',mouth:'smile',blush:1}};
const FACE=[[-50,-178],[-55,-140],[-53,-105],[-44,-74],[-24,-50],[0,-38,1],[24,-50],[44,-74],[53,-105],[55,-140],[50,-178],[0,-196]];
const FACE_M=[[-51,-178],[-56,-140],[-55,-105],[-48,-76],[-30,-52],[0,-42,1],[30,-52],[48,-76],[55,-105],[56,-140],[51,-178],[0,-196]];
const BTOP=[[-60,-140],[-66,-175],[-52,-212],[-20,-232],[20,-232],[54,-214],[68,-178],[62,-140]];
const BBOT=[[58,-118,1],[46,-142,1],[36,-126,1],[24,-148,1],[12,-130,1],[2,-152,1],[-8,-128,1],[-20,-148,1],[-32,-128,1],[-44,-144,1],[-56,-116,1]];
function bulge(pts){const out=[];for(let i=0;i<pts.length;i++){const a=pts[i];out.push(a);
  if(i<pts.length-1){const b=pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,amt=(a[2]&&b[2])?5:2;out.push([(a[0]+b[0])/2+dy/l*amt,(a[1]+b[1])/2-dx/l*amt]);}}
  return out;}
const BANG=BTOP.concat(bulge(BBOT));
/* male fringe: shorter, swept spikes so the forehead shows */
const BBOT_M=[[60,-128,1],[50,-160,1],[38,-140,1],[26,-168,1],[14,-146,1],[2,-172,1],[-12,-150,1],[-24,-170,1],[-36,-148,1],[-48,-164,1],[-60,-128,1]];
const BANG_M=BTOP.concat(bulge(BBOT_M));
const SCL=[[-15,0],[-13,-12],[-2,-18],[10,-16],[17,-9],[18,2],[13,12],[2,16],[-9,12]];
const LASH=[[-16,-1],[-12,-13],[-1,-19.5],[11,-17],[18,-10],[23,-5],[27,2]];
const lashW=u=>u<.6?lerp(.75,3.25,u/.6):lerp(3.25,.5,(u-.6)/.4);

function headAll(G,gg,o,t,rim,beach){
  const ex=EXPR[o.expr]||EXPR.neutral,T=(o.turn||0)*5,look=o.look||0;
  let eye=ex.eye;if(o.open===0&&eye!=='happy')eye='closed';
  const mouth=o.mouth||ex.mouth,bl=Math.max(ex.blush||0,o.blush||0);
  ears(G);face(G,rim);
  for(const s of[-1,1])eyeDraw(G,s,eye,T,look);
  nose(G,T);mouthDraw(G,mouth,T,t);
  if(bl)blush(G,CAST.male?bl*.45:bl,T);
  if(CAST.glasses)glasses(G,T);
  sideLocks(G,t,rim);bangs(G,rim);
  for(const s of[-1,1])brow(G,s,ex.brow,T);
  if(beach)shades(G);else if(!o.noHeadset)headset(G,gg);
  if(CAST.ahoge!==false)ahoge(G,t);
  if(ex.sweat||o.sweat)sweat(G,t);}
function ears(G){for(const s of[-1,1])cel(G,ell(s*54,-108,8,14,s*.15),{f:SK.f,s:SK.s,so:[s*3,0],l:SK.l});}
function face(G,rim){const BP=path(CAST.male?BANG_M:BANG);
  cel(G,path(CAST.male?FACE_M:FACE),{f:SK.f,s:SK.s,so:[-9,-3],rim,l:SK.l,clipFn:g=>{g.save();g.translate(3,9);fillP(g,BP,SK.s);g.restore();}});}
function glasses(G,T){
  const fr=CAST.frame||'#1c1a2a';
  for(const s of[-1,1]){const cx=s*29+T,L=ell(cx,-94,22,16);
    G.save();G.fillStyle=rgba('#cfe8ff',.14);G.fill(L);G.restore();
    line(G,[[cx-12,-102],[cx-4,-106]],'#ffffff',1.6);
    strokeP(G,L,fr,LW);
    line(G,[[s*51+T,-98],[s*56,-102]],fr,2.4);}
  line(G,[[-8+T,-96],[0+T,-99],[8+T,-96]],fr,2.4);}
function eyeDraw(G,side,st,T,look){
  G.save();G.translate(side*29+T,-96);G.scale(side,CAST.male?.86:1);
  if(st==='happy'){line(G,[[-15,4],[-4,-10],[10,-10],[20,2]],EY.l,3.4);line(G,[[20,2],[27,-3]],EY.l,1.8);G.restore();return;}
  if(st==='closed'){line(G,[[-15,-2],[-2,5],[12,4],[21,-3]],EY.l,3);line(G,[[21,-3],[28,-6]],EY.l,1.8);line(G,[[4,6],[5,10]],EY.l,1.1);line(G,[[12,4],[14,8]],EY.l,1.1);G.restore();return;}
  const s=st==='wide'?.72:st==='dot'?.35:1,SP=path(SCL),ix=2+side*look*5;
  fillP(G,SP,EY.scl);
  G.save();G.clip(SP);
  fillP(G,poly([[-20,-22],[24,-22],[24,-8],[-20,-12]],true),EY.sclS);
  if(st==='dot')fillP(G,ell(ix,0,4,5),EY.pu);
  else{const IR=ell(ix,0,11.5*s,15.5*s);fillP(G,IR,EY.f);
    G.save();G.clip(IR);
    fillP(G,poly([[-20,-20],[24,-20],[24,-3*s],[-20,-1*s]],true),EY.top);
    const gr=G.createRadialGradient(ix,10*s,1,ix,10*s,12*s);gr.addColorStop(0,EY.lo);gr.addColorStop(1,rgba(EY.lo,0));G.fillStyle=gr;G.fillRect(ix-14,-6,28,26);
    fillP(G,ell(ix,-1*s,5*s,8*s),EY.pu);G.restore();
    strokeP(G,IR,EY.l,.7);}
  fillP(G,poly([[-20,-22],[24,-22],[24,-12],[-20,-10]],true),rgba('#28305a',.28));
  if(st==='half'){G.fillStyle=SK.f;G.fillRect(-22,-26,50,20);}
  G.restore();
  if(st!=='dot'&&st!=='half'){const hs=Math.max(s,.75);
    fillP(G,ell(side*(-4+look*5),-8,4.5*hs,6*hs),'#ffffff');fillP(G,ell(side*(6+look*5),8,2.2*hs,2.2*hs),'#ffffff');}
  if(st==='half'){fillP(G,path(rib([[-16,-5],[0,-7],[18,-6],[27,-2]],lashW,14)),EY.l);}
  else if(CAST.male)fillP(G,path(rib(LASH,u=>lashW(u)*.55,20)),EY.l);
  else{fillP(G,path(rib(LASH,lashW,20)),EY.l);
    fillP(G,path([[15,-13],[27,-17,1],[22,-7]]),EY.l);fillP(G,path([[22,-4],[29,-4,1],[25,0]]),EY.l);}
  line(G,[[8,15],[13,13],[18,8]],EY.l,1.1);
  line(G,[[-8,-25],[4,-27.5],[16,-23]],SK.s2,1);
  G.restore();}
function brow(G,side,b,T){
  let p=[[10,-126],[28,-132],[48,-128]];
  if(b==='raised')p=p.map(q=>[q[0],q[1]-8]);
  else if(b==='worried')p=[[10,-133],[28,-134],[48,-127]];
  else if(b==='angry')p=[[10,-120],[28,-129],[48,-130]];
  const m=CAST.male;
  fillP(G,path(rib(p.map(q=>[side*q[0]+T,q[1]+(m?2:0)]),u=>m?lerp(3.6,1.2,u):lerp(2.4,.6,u),12)),HR.l);}
function nose(G,T){line(G,[[4+T,-84],[2.5+T,-78],[1+T,-74]],SK.s2,1.3);line(G,[[1+T,-74],[4+T,-73]],SK.s2,1);}
function mouthDraw(G,m,T,t){
  G.save();G.translate(T*.8,0);
  const MC='#8a2a3a',TG='#ff7a8a',L=SK.l;
  const open=(P,tongue,teeth)=>{fillP(G,P,MC);G.save();G.clip(P);if(tongue!=null)fillP(G,ell(0,tongue,8,5),TG);
    if(teeth!=null){G.fillStyle='#ffffff';G.fillRect(-14,teeth,28,3.5);}G.restore();strokeP(G,P,L,1.3);};
  switch(m){
    case 'smile':line(G,[[-11,-61],[0,-55],[11,-61]],L,1.8);break;
    case 'talk':open(path([[-9,-60],[0,-61],[9,-60],[6,-52],[0,-50],[-6,-52]]),-50);break;
    case 'oh':open(ell(0,-56,5.5,7.5),-51);break;
    case 'smileopen':open(path([[-12,-62,1],[12,-62,1],[7,-52],[0,-48],[-7,-52]]),-49,-62);break;
    case 'shocked':open(path([[-8,-63],[0,-65],[8,-63],[10,-50],[0,-43],[-10,-50]]),-45,-65);break;
    case 'panting':{G.translate(0,-56);G.scale(1,1+.15*Math.sin(t*12));G.translate(0,56);open(path([[-9,-60],[0,-62],[9,-60],[7,-51],[0,-48],[-7,-51]]),-49);break;}
    case 'worried':line(G,[[-9,-56],[-3,-59],[3,-57],[9,-60]],L,1.6);break;
    default:line(G,[[-7,-58],[0,-57],[7,-58]],L,1.6);}
  G.restore();}
function blush(G,a,T){for(const s of[-1,1]){const cx=s*34+T;airbrush(G,cx,-80,13,6,SK.blush,.75*a,1);
  for(let i=0;i<3;i++)line(G,[[cx-7+i*5,-77],[cx-4+i*5,-83]],rgba('#ff5a6a',.8*a),1);}}
function sweat(G,t){const y=-150+((t*24)%18);const P=path([[62,y-16,1],[69,y-3],[66,y+5],[58,y+5],[55,y-3]]);
  fillP(G,P,'#bff4ff');strokeP(G,P,'#2a6a8a',1.1);fillP(G,ell(60,y,1.8,3),'#ffffff');}
function sideLocks(G,t,rim){for(const s of[-1,1]){const sw=Math.sin(t*1.7+s)*3,sh=CAST.short;
  const sp=(sh?(CAST.male?[[56,-160],[60,-138],[58,-116]]:[[56,-160],[62,-125],[60,-92]]):[[56,-160],[64,-110],[66,-40],[62+sw*.5,20],[70+sw,80]]).map(q=>[s*q[0],q[1]]);
  cel(G,path(rib(sp,u=>(sh?12:14)*Math.pow(1-u,.8),20)),{f:HR.f,s:HR.s,so:[s>0?-5:5,-2],rim:s>0?rim:undefined,l:HR.l,lw:2.2,
    clipFn:g=>line(g,sp.slice(1,4).map(q=>[q[0]-s*3,q[1]]),HR.s,1)});}}
function bangs(G,rim){
  const BB=CAST.male?BBOT_M:BBOT,P=path(CAST.male?BANG_M:BANG),wedges=[];
  for(let i=1;i<BB.length;i+=2){const n=BB[i];wedges.push(poly([[n[0]-6,n[1]-34],[n[0]+6,n[1]-34],[n[0]+1,n[1]+2]],true));}
  const yc=x=>-196-12*(1-Math.pow(x/56,2)),top=[],bot=[];
  for(let x=-50;x<=50;x+=5)top.push([x,yc(x)-4]);
  for(let x=50;x>=-50;x-=5)bot.push([x,yc(x)+3+((x/5)%2?6:0),1]);
  cel(G,P,{f:HR.f,s:HR.s,so:[-7,-3],sh:wedges,rim,l:HR.l,lw:2.4,clipFn:g=>{
    for(let i=0;i<BB.length;i+=2){const tp=BB[i];line(g,[[tp[0]*.3,-222],[tp[0]*.7,(tp[1]-222)/2],[tp[0]*.92,tp[1]-14]],HR.s,1.1);}
    fillP(g,path(top.concat(bot)),HR.h);
    const core=[];for(let x=-30;x<=30;x+=5)core.push([x,yc(x)-2]);for(let x=30;x>=-30;x-=5)core.push([x,yc(x)+1+((x/5)%2?3:0),1]);
    fillP(g,path(core),HR.h2);}});}
/* front view: band hugs the hair (puffs above it), cups are seen edge-on as narrow pods over the ears */
function headset(G,gg){
  const band=path([[-68,-128],[-68,-152],[-65,-180],[-52,-203],[-28,-219],[0,-223],[28,-219],[52,-203],[65,-180],[68,-152],[68,-128]],false);
  rawStroke(G,band,'#0c0e14',10.5);rawStroke(G,band,HS.band,7);rawStroke(G,band,HS.plate,2);
  for(const s of[-1,1]){
    const yk=capsule([s*68,-162],[s*69,-138],4.5,4.5);strokeP(G,yk,'#0c0e14',LW*1.2);cel(G,yk,{f:HS.plate,s:HS.band,so:[s*-1.5,0]});
    const pad=capsule([s*61,-124],[s*61,-92],6.5,6.5);strokeP(G,pad,'#0c0e14',LW*1.3);cel(G,pad,{f:'#1b1f28',s:'#0c0e14',so:[s*-2,0]});
    const sh=capsule([s*70,-122],[s*70,-94],9,9);strokeP(G,sh,'#0c0e14',LW*1.5);
    cel(G,sh,{f:HS.band,s:'#14171e',so:[s*-3,-2],h:HS.core,ho:[s*2,2]});
    line(G,[[s*74,-117],[s*74,-101]],HS.core,2);
    fillP(G,ell(s*71,-90,2.6,2.6),HS.led);
    if(gg){gg.save();gg.fillStyle=rgba('#35e7ff',.9);gg.beginPath();gg.arc(s*71,-90,5,0,TAU);gg.fill();gg.restore();}}
  const boom=path([[-64,-88],[-60,-70],[-46,-59],[-28,-56]],false);
  rawStroke(G,boom,'#0c0e14',6);rawStroke(G,boom,HS.plate,3);
  const mic=capsule([-30,-56],[-19,-56],5.5,5.5);strokeP(G,mic,'#0c0e14',LW*1.4);cel(G,mic,{f:HS.band,s:'#14171e',so:[0,-2]});}
function shades(G){const fr='#ff6bb5';
  for(const s of[-1,1]){const L=ell(s*24,-206,20,11,s*-.08);strokeP(G,L,'#3a1030',LW*1.6);
    G.save();G.clip(L);const gr=G.createLinearGradient(0,-217,0,-195);gr.addColorStop(0,'#2a1a4a');gr.addColorStop(1,'#ff5a8a');G.fillStyle=gr;G.fillRect(s*24-22,-220,44,28);
    line(G,[[s*24-10,-212],[s*24-2,-200]],rgba('#ffffff',.7),2);G.restore();rawStroke(G,L,fr,3);}
  line(G,[[-5,-208],[0,-211],[5,-208]],fr,2.4);line(G,[[-44,-208],[-62,-196]],fr,2.4);line(G,[[44,-208],[62,-196]],fr,2.4);}
function ahoge(G,t){const sw=Math.sin(t*3)*3;
  cel(G,path(rib([[6,-228],[20+sw*.3,-262],[44+sw,-258]],u=>5.5*(1-u),14)),{f:HR.f,s:HR.s,so:[-2,-2],l:HR.l,lw:2});}

/* loose prop: where the held drink sits on screen for a portrait(x,y,k,{pose:'drink',tilt}) call, and a free-standing
   drawer so a scene can fling the glass out of her hand (RING! RING!) without re-posing the rig */
function cupAt(x,y,k,o={}){
  const W=armG(1,Object.assign({},POSES.relax.R,POSES.drink.R)).W,t=o.t||0;
  const lx=(W[0]-34)*k,ly=(W[1]-30+Math.sin(t*2.4)*1.2)*k,a=o.tilt||0,c=Math.cos(a),s=Math.sin(a);
  return [x+lx*c-ly*s,y+lx*s+ly*c];}
function drawCup(G,x,y,k,rot){
  const lk=LWK.k;G.save();G.translate(x,y);if(rot)G.rotate(rot);G.scale(k,k);LWK.k=1.6;
  try{cocktail(G,[34,30]);parasol(G,[34,30]);}finally{LWK.k=lk;G.restore();}}
window.HER={portrait,POSES,cupAt,drawCup,CASTS};
})();
