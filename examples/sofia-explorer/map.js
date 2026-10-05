// map.js - "Copilot Quest: Explorer" parchment expedition map.
// Coastlines: Natural Earth 1:110m land (public domain), Miller projection (see make_map.py).
(function(){
const {TAU,W,H,clamp,lerp,ease,easeOut,easeIn,back,seg,rgba,rng,hash,airbrush}=R;
const MD=window.MAPDATA, OX=20, OY=34, MW=600, MH=292.19, PK=4.5, D2R=Math.PI/180;
const miller=lat=>1.25*Math.log(Math.tan(Math.PI/4+.4*lat*D2R));
const Y0=miller(82);
function proj(lon,lat){return [OX+(lon+180)/360*MW, OY+(Y0-miller(clamp(lat,-85,85)))*MW/TAU];}

let LAND=null;
function land(){
  if(LAND) return LAND;
  const p=new Path2D();
  for(const r of MD.land){
    p.moveTo(r[0]+OX,r[1]+OY);
    for(let j=2;j<r.length;j+=2) p.lineTo(r[j]+OX,r[j+1]+OY);
    p.closePath();
  }
  return LAND=p;
}

// ---------- stops & route ----------
const STOPS=[
  ['LONDON',-0.13,51.5,0,0],['ICELAND',-21.9,64.1,-4,-13],['MEXICO',-98.8,19.7,-24,0],
  ['PERU',-72.5,-13.2,-22,6],['MOROCCO',-8.0,31.6,-14,14],['EGYPT',31.1,30.0,14,-12],
  ['CAMBODIA',103.9,13.4,18,-6],['INDIA',78.0,27.2,-4,-14],['TANZANIA',37.4,-3.1,16,10],
  ['BALI',115.2,-8.4,-18,10],['AUSTRALIA',151.2,-33.9,-22,12],['NEW ZEALAND',168.7,-45.0,-8,-22],
  ['JAPAN',135.8,35.0,18,-8],['HOME',-0.13,51.5,-20,12]
].map(([name,lon,lat,sx,sy])=>{const [x,y]=proj(lon,lat); return {name,lon,lat,x,y,sx,sy};});

const RP=[], SEGEND=[];
for(let i=0;i<STOPS.length-1;i++){
  const a=STOPS[i], b=STOPS[i+1];
  const dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy)||1;
  const n=dx>=0?[dy/d,-dx/d]:[-dy/d,dx/d];
  const cx=(a.x+b.x)/2+.25*d*n[0], cy=(a.y+b.y)/2+.25*d*n[1];
  for(let k=(i?1:0);k<=20;k++){
    const u=k/20, v=1-u;
    RP.push([v*v*a.x+2*u*v*cx+u*u*b.x, v*v*a.y+2*u*v*cy+u*u*b.y]);
  }
  SEGEND.push(RP.length-1);
}
const RL=[0];
for(let i=1;i<RP.length;i++) RL.push(RL[i-1]+Math.hypot(RP[i][0]-RP[i-1][0],RP[i][1]-RP[i-1][1]));
const RTOT=RL[RL.length-1];
const LEGD=[0].concat(SEGEND.map(i=>RL[i]));

const LEG_T=[];
for(let L=0;L<6;L++) LEG_T.push([1.3+L*.7,2.0+L*.7]);
for(let j=0;j<6;j++) LEG_T.push([10.9+j*2.6/6,10.9+(j+1)*2.6/6]);
LEG_T.push([13.5,14.5]);
const PIN_T=[-1].concat(LEG_T.map(l=>l[1]));

function distAt(t){
  for(let i=LEG_T.length-1;i>=0;i--){
    const [a,b]=LEG_T[i];
    if(t>=b) return LEGD[i+1];
    if(t>=a){let f=(t-a)/(b-a); f=lerp(f,ease(f),.5); return lerp(LEGD[i],LEGD[i+1],f);}
  }
  return 0;
}
function legAt(t){
  for(let i=LEG_T.length-1;i>=0;i--){const [a,b]=LEG_T[i]; if(t>=a) return {i,f:clamp((t-a)/(b-a))};}
  return {i:-1,f:0};
}
function posAt(d){
  d=clamp(d,0,RTOT);
  let lo=0,hi=RL.length-1;
  while(hi-lo>1){const m=(lo+hi)>>1; if(RL[m]<=d) lo=m; else hi=m;}
  const s=(RL[hi]-RL[lo])||1, u=clamp((d-RL[lo])/s);
  return [lerp(RP[lo][0],RP[hi][0],u), lerp(RP[lo][1],RP[hi][1],u)];
}
function headAt(d){const a=posAt(d-2), b=posAt(d+1); return Math.atan2(b[1]-a[1],b[0]-a[0]);}

// ---------- cameras ----------
function camClamp(x,y,z){
  const hw=320/z, hh=180/z;
  return {x:clamp(x,hw,640-hw), y:clamp(y,hh,360-hh), z, rot:0, dx:0, dy:0};
}
function mapCam(t){
  const b=ease(seg(t,1,1.9));
  let z=lerp(1,1.35,b);
  const d=distAt(t);
  let fx=0,fy=0;
  for(let k=0;k<6;k++){const p=posAt(d-6*k); fx+=p[0]; fy+=p[1];}
  fx/=6; fy/=6;
  let x=lerp(320,fx,b), y=lerp(180,fy,b);
  const e=ease(seg(t,5.4,6.2)), s=STOPS[6];
  x=lerp(x,s.x+s.sx/2,e); y=lerp(y,s.y+s.sy/2,e); z=lerp(z,2.0,e);
  return camClamp(x,y,z);
}
function homeCam(t){
  let z=1+.08*ease(seg(t,10.8,14.5)), x=320, y=180;
  const b=ease(seg(t,14.2,15.1)), s=STOPS[0];
  x=lerp(x,s.x,b); y=lerp(y,s.y,b); z=lerp(z,1.5,b);
  z+=.12*easeIn(seg(t,15.1,16.3));
  return camClamp(x,y,z);
}
function toScreen(p,c){
  const px=p.x!==undefined?p.x:p[0], py=p.y!==undefined?p.y:p[1];
  return [320+(px-c.x)*c.z, 180+(py-c.y)*c.z];
}

// ---------- plate helpers ----------
function plateCanvas(){const [c,G]=R.canvas(2880,1620); G.setTransform(PK,0,0,PK,0,0); return [c,G];}
function deckled(x0,y0,x1,y1,seed,amp){
  const r=rng(seed), p=new Path2D(), st=4;
  let first=true;
  const add=(x,y)=>{if(first){p.moveTo(x,y); first=false;} else p.lineTo(x,y);};
  for(let x=x0;x<x1;x+=st) add(x,y0+(r()-.5)*amp);
  for(let y=y0;y<y1;y+=st) add(x1+(r()-.5)*amp,y);
  for(let x=x1;x>x0;x-=st) add(x,y1+(r()-.5)*amp);
  for(let y=y1;y>y0;y-=st) add(x0+(r()-.5)*amp,y);
  p.closePath();
  return p;
}
function graticule(G,col,a,dash){
  G.save(); G.strokeStyle=rgba(col,a); G.lineWidth=.4; if(dash) G.setLineDash(dash);
  for(let lon=-150;lon<=150;lon+=30){const x=proj(lon,0)[0]; G.beginPath(); G.moveTo(x,OY); G.lineTo(x,OY+MH); G.stroke();}
  for(const lat of [-30,0,30,60]){const y=proj(0,lat)[1]; G.beginPath(); G.moveTo(OX,y); G.lineTo(OX+MW,y); G.stroke();}
  G.restore();
}
function rose(G,x,y,r,cols){
  const [ink,dark,light,acc]=cols;
  G.save(); G.translate(x,y); G.lineJoin='round';
  G.strokeStyle=ink; G.lineWidth=.45;
  G.beginPath(); G.arc(0,0,r*.8,0,TAU); G.stroke();
  G.beginPath(); G.arc(0,0,r*.72,0,TAU); G.stroke();
  for(let i=0;i<32;i++){
    const a=i/32*TAU, l=i%4?r*.04:r*.08;
    G.beginPath(); G.moveTo(Math.cos(a)*r*.72,Math.sin(a)*r*.72); G.lineTo(Math.cos(a)*(r*.72+l),Math.sin(a)*(r*.72+l)); G.stroke();
  }
  const pt=(a,len,w)=>{
    const ca=Math.cos(a), sa=Math.sin(a), cw=Math.cos(a+Math.PI/2), sw=Math.sin(a+Math.PI/2);
    G.fillStyle=dark; G.beginPath(); G.moveTo(0,0); G.lineTo(ca*len,sa*len); G.lineTo(cw*w,sw*w); G.closePath(); G.fill(); G.stroke();
    G.fillStyle=light; G.beginPath(); G.moveTo(0,0); G.lineTo(ca*len,sa*len); G.lineTo(-cw*w,-sw*w); G.closePath(); G.fill(); G.stroke();
  };
  for(let i=0;i<8;i++) pt(-Math.PI/2+(i*2+1)/16*TAU,r*.4,r*.06);
  for(let i=0;i<4;i++) pt(-Math.PI/2+(i*2+1)/8*TAU,r*.62,r*.09);
  for(let i=0;i<4;i++) pt(-Math.PI/2+i/4*TAU,r,r*.13);
  G.fillStyle=acc; G.beginPath(); G.arc(0,0,r*.07,0,TAU); G.fill(); G.stroke();
  G.fillStyle=ink; G.font=`bold ${(r*.32).toFixed(1)}px "Bookman Old Style", Georgia, serif`;
  G.textAlign='center'; G.textBaseline='alphabetic'; G.fillText('N',0,-r-1.5);
  G.restore();
}
function mountains(G,list){
  G.save(); G.strokeStyle=rgba('#5a3a1a',.75); G.lineWidth=.5; G.lineJoin='round';
  for(const [lon,lat] of list){
    const [x,y]=proj(lon,lat);
    G.fillStyle=rgba('#8a6a3a',.35);
    G.beginPath(); G.moveTo(x,y-2.6); G.lineTo(x+3,y+1.8); G.lineTo(x,y+1.8); G.closePath(); G.fill();
    G.beginPath(); G.moveTo(x-3,y+1.8); G.lineTo(x,y-2.6); G.lineTo(x+3,y+1.8); G.stroke();
    G.beginPath(); G.moveTo(x+.8,y-.6); G.lineTo(x+1.8,y+1.2); G.stroke();
  }
  G.restore();
}

// ---------- parchment plate ----------
let PARCH=null, NAVY=null, SHEET=null;
function parch(){
  if(PARCH) return PARCH;
  const [c,G]=plateCanvas(), rr=rng(11);
  // wood desk
  G.fillStyle='#3a2414'; G.fillRect(0,0,640,360);
  G.lineCap='round';
  for(let i=0;i<110;i++){
    const y0=rr()*380-10, amp=.6+rr()*2.4, ph=rr()*TAU, fr=.01+rr()*.025;
    G.strokeStyle=rgba(rr()<.5?'#26160a':'#52331b',.25+rr()*.35);
    G.lineWidth=.3+rr()*1.1;
    G.beginPath();
    for(let x=-10;x<=650;x+=8){
      const y=y0+Math.sin(x*fr+ph)*amp+Math.sin(x*.004+ph*2)*5;
      if(x===-10) G.moveTo(x,y); else G.lineTo(x,y);
    }
    G.stroke();
  }
  for(let i=0;i<6;i++){
    const kx=rr()*640, ky=rr()*360;
    G.strokeStyle=rgba('#1e1008',.45); G.lineWidth=.5;
    for(let j=1;j<5;j++){G.beginPath(); G.ellipse(kx,ky,j*3.2,j*1.1,0,0,TAU); G.stroke();}
  }
  // sheet + drop shadow
  SHEET=deckled(12,24,628,336,7,1.8);
  G.save();
  G.shadowColor='rgba(0,0,0,.6)'; G.shadowBlur=14*PK; G.shadowOffsetX=2*PK; G.shadowOffsetY=4*PK;
  G.fillStyle='#c9a46a'; G.fill(SHEET);
  G.restore();
  G.save(); G.clip(SHEET);
  const rg=G.createRadialGradient(320,180,30,320,180,390);
  rg.addColorStop(0,'#efe0bb'); rg.addColorStop(.55,'#e2cb98'); rg.addColorStop(1,'#c9a46a');
  G.fillStyle=rg; G.fillRect(0,0,640,360);
  for(let i=0;i<150;i++) airbrush(G,rr()*640,rr()*360,10+rr()*40,8+rr()*30,rr()<.55?'#b88a4a':'#f6e8c8',.05+rr()*.08);
  G.lineWidth=.22;
  for(let i=0;i<700;i++){
    const x=rr()*640, y=rr()*360, a=rr()*TAU, l=1+rr()*4;
    G.strokeStyle=rgba('#7a5a30',.06+rr()*.1);
    G.beginPath(); G.moveTo(x,y); G.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l); G.stroke();
  }
  // sea tint + graticule
  G.fillStyle='rgba(79,122,120,.18)'; G.fillRect(OX,OY,MW,MH);
  graticule(G,'#4a3418',.16,[1.6,1.6]);
  // coastal ripples
  {
    const [tc,TG]=plateCanvas();
    TG.strokeStyle='#4f7a78'; TG.lineJoin='round';
    for(const w of [11,7,3.5]){
      TG.globalCompositeOperation='source-over'; TG.lineWidth=w; TG.stroke(land());
      TG.globalCompositeOperation='destination-out'; TG.lineWidth=w-1; TG.stroke(land());
    }
    TG.globalCompositeOperation='destination-out'; TG.fill(land(),'evenodd');
    G.save(); G.setTransform(1,0,0,1,0,0); G.globalAlpha=.35; G.drawImage(tc,0,0); G.restore();
  }
  // land
  G.fillStyle='#e6d3a3'; G.fill(land(),'evenodd');
  G.save(); G.clip(land(),'evenodd');
  for(let i=0;i<120;i++) airbrush(G,OX+rr()*MW,OY+rr()*MH,6+rr()*22,5+rr()*16,rr()<.5?'#c9a86a':'#f2e4bc',.08+rr()*.08);
  for(const [x,y] of [[210,215],[360,205],[500,195],[180,190],[190,140],[330,120],[520,225]]) airbrush(G,x,y,34,24,'#9aa86a',.32);
  for(const [x,y] of [[335,160],[395,168],[555,265],[480,135],[150,150]]) airbrush(G,x,y,30,18,'#d9a066',.3);
  G.restore();
  mountains(G,[[-118,52],[-115,48],[-112,44],[-108,40],[-106,36],
    [-77,-2],[-75,-10],[-71,-17],[-69,-24],[-70,-31],[-71,-38],
    [78,33],[82,31],[86,29],[90,28.5],[94,29],[8,46],[11,46.8]]);
  G.strokeStyle=rgba('#5a3a1a',.6); G.lineWidth=.6; G.lineJoin='round'; G.stroke(land());
  // creases
  for(const x of [213.3,426.7]){
    G.strokeStyle=rgba('#fff6dc',.22); G.lineWidth=1.1; G.beginPath(); G.moveTo(x,20); G.lineTo(x,340); G.stroke();
    G.strokeStyle=rgba('#6a4a24',.16); G.lineWidth=.6; G.beginPath(); G.moveTo(x+.9,20); G.lineTo(x+.9,340); G.stroke();
  }
  G.strokeStyle=rgba('#fff6dc',.22); G.lineWidth=1.1; G.beginPath(); G.moveTo(8,180); G.lineTo(632,180); G.stroke();
  G.strokeStyle=rgba('#6a4a24',.16); G.lineWidth=.6; G.beginPath(); G.moveTo(8,180.9); G.lineTo(632,180.9); G.stroke();
  // stains + coffee ring
  for(let i=0;i<7;i++) airbrush(G,rr()*640,rr()*360,12+rr()*26,10+rr()*20,'#8a5a2a',.06+rr()*.05);
  G.save(); G.translate(590,70);
  airbrush(G,0,0,15,14,'#7a4a20',.06);
  G.strokeStyle=rgba('#6a3a14',.28); G.lineWidth=1.3;
  G.beginPath(); G.arc(0,0,15,.2,TAU-.5); G.stroke();
  G.strokeStyle=rgba('#6a3a14',.16); G.lineWidth=.6;
  G.beginPath(); G.arc(1,.5,13.6,-1,TAU-1.6); G.stroke();
  G.restore();
  // labels + sea serpent
  G.fillStyle=rgba('#3e2c18',.62); G.textAlign='center'; G.textBaseline='middle';
  G.font='italic 7px "Bookman Old Style", Georgia, serif';
  for(const [s,x,y] of [['Atlantic Ocean',300,240],['Pacific Ocean',80,215],['Indian Ocean',450,262],['Here be meetings',165,285]]) G.fillText(s,x,y);
  G.save(); G.strokeStyle=rgba('#3e2c18',.6); G.lineWidth=.6; G.lineCap='round';
  for(let i=0;i<3;i++){
    const hx=142+i*9;
    G.fillStyle=rgba('#4f7a78',.35); G.beginPath(); G.arc(hx,300,3.6,Math.PI,TAU); G.fill(); G.stroke();
    G.beginPath(); G.moveTo(hx-2.4,298.4); G.lineTo(hx-1.6,297); G.moveTo(hx,296.4); G.lineTo(hx+.4,295); G.stroke();
  }
  G.beginPath(); G.moveTo(168,300); G.quadraticCurveTo(170,293,175,294); G.quadraticCurveTo(178,295,177,297.5); G.lineTo(172,297); G.stroke();
  G.fillStyle=rgba('#3e2c18',.7); G.beginPath(); G.arc(174.6,295.4,.5,0,TAU); G.fill();
  G.beginPath(); G.moveTo(138.4,300); G.quadraticCurveTo(134,301,134,298); G.quadraticCurveTo(134,295.6,136.5,296.5); G.stroke();
  for(let i=0;i<4;i++){G.beginPath(); G.moveTo(132+i*13,302.5); G.quadraticCurveTo(135+i*13,301,138+i*13,302.5); G.stroke();}
  G.restore();
  rose(G,103,288,26,['#3e2c18','#6a4a24','#f2e4bc','#b3261e']);
  // borders + checker
  G.strokeStyle='#3e2c18'; G.lineWidth=.8; G.strokeRect(OX-.5,OY-.5,MW+1,MH+1);
  G.lineWidth=.4; G.strokeRect(OX-3.5,OY-3.5,MW+7,MH+7);
  G.fillStyle=rgba('#3e2c18',.8);
  for(let i=0;i<36;i++) if(i%2){
    const x=OX+i*MW/36;
    G.fillRect(x,OY-3.5,MW/36,3); G.fillRect(x,OY+MH+.5,MW/36,3);
  }
  const lats=[]; for(let l=-58;l<=82;l+=10) lats.push(proj(0,l)[1]);
  for(let i=0;i<lats.length-1;i++) if(i%2){
    const ya=Math.min(lats[i],lats[i+1]), yb=Math.max(lats[i],lats[i+1]);
    G.fillRect(OX-3.5,ya,3,yb-ya); G.fillRect(OX+MW+.5,ya,3,yb-ya);
  }
  // burnt edges
  G.lineJoin='round';
  G.strokeStyle=rgba('#7a4a1e',.22); G.lineWidth=10; G.stroke(SHEET);
  G.strokeStyle=rgba('#5a3210',.32); G.lineWidth=5; G.stroke(SHEET);
  G.strokeStyle=rgba('#3a1e08',.5); G.lineWidth=2; G.stroke(SHEET);
  G.restore();
  // vignette
  const vg=G.createRadialGradient(320,180,200,320,180,420);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(20,10,0,.38)');
  G.fillStyle=vg; G.fillRect(0,0,640,360);
  return PARCH=c;
}

// ---------- navy plate (title) ----------
function navy(){
  if(NAVY) return NAVY;
  const [c,G]=plateCanvas(), rr=rng(5);
  G.fillStyle='#14213d'; G.fillRect(0,0,640,360);
  for(let i=0;i<60;i++) airbrush(G,rr()*640,rr()*360,20+rr()*50,16+rr()*40,rr()<.5?'#0c1530':'#1f3060',.12);
  graticule(G,'#d9a441',.12,null);
  G.fillStyle='#1d2c4f'; G.fill(land(),'evenodd');
  G.strokeStyle=rgba('#d9a441',.35); G.lineWidth=.5; G.lineJoin='round'; G.stroke(land());
  G.save(); G.globalAlpha=.25; rose(G,103,288,26,['#d9a441','#8a6a2a','#1d2c4f','#d9a441']); G.restore();
  const vg=G.createRadialGradient(320,180,140,320,180,400);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,8,.6)');
  G.fillStyle=vg; G.fillRect(0,0,640,360);
  return NAVY=c;
}

// ---------- route ----------
function routePts(d){
  const pts=[posAt(0)];
  for(let i=1;i<RL.length;i++){if(RL[i]>=d) break; pts.push(RP[i]);}
  pts.push(posAt(d));
  return pts;
}
function strokePts(G,pts){
  G.beginPath(); G.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++) G.lineTo(pts[i][0],pts[i][1]);
  G.stroke();
}
function route(t,o){
  const g=R.g, gg=R.gg, gold=o.navy||o.goldRoute;
  const d=(gold||o.full)?RTOT:distAt(t);
  if(d<.5) return;
  const pts=routePts(d);
  g.save(); g.lineCap='round'; g.lineJoin='round'; g.setLineDash([5,3.5]);
  if(gold){
    const a=o.routeA===undefined?1:o.routeA;
    g.globalAlpha=a; g.strokeStyle='#d9a441'; g.lineWidth=1.4; strokePts(g,pts);
    gg.save(); gg.globalAlpha=a; gg.lineCap='round'; gg.setLineDash([5,3.5]); gg.strokeStyle=rgba('#d9a441',.55); gg.lineWidth=2.4; strokePts(gg,pts); gg.restore();
    g.setLineDash([]); g.fillStyle='#ffe9a8';
    for(let i=0;i<13;i++){const s=STOPS[i]; g.beginPath(); g.arc(s.x,s.y,1.6,0,TAU); g.fill();}
  } else {
    g.save(); g.translate(.6,.8); g.strokeStyle='rgba(40,20,5,.25)'; g.lineWidth=1.6; strokePts(g,pts); g.restore();
    g.strokeStyle='#b3261e'; g.lineWidth=1.6; strokePts(g,pts);
  }
  g.restore();
}

// ---------- pins ----------
function pin(G,x,y,s){
  if(s<=0) return;
  G.save(); G.translate(x,y); G.scale(s,s);
  G.fillStyle='rgba(40,20,5,.3)'; G.beginPath(); G.ellipse(1.4,.4,2.4,.9,0,0,TAU); G.fill();
  G.strokeStyle='#5c5c64'; G.lineWidth=.6; G.lineCap='round'; G.beginPath(); G.moveTo(0,0); G.lineTo(-1.2,-6); G.stroke();
  G.fillStyle='#b3261e'; G.strokeStyle='#5a120c'; G.lineWidth=.5; G.beginPath(); G.arc(-1.4,-7,2.6,0,TAU); G.fill(); G.stroke();
  G.fillStyle='rgba(255,255,255,.8)'; G.beginPath(); G.arc(-2.2,-7.9,.8,0,TAU); G.fill();
  G.restore();
}
function pins(t){
  for(let i=0;i<=12;i++){
    const T=PIN_T[i]; if(t<T) continue;
    pin(R.g,STOPS[i].x,STOPS[i].y,back(seg(t,T,T+.18)));
  }
}

// ---------- stamps ----------
const INKS=['#a8322a','#23407a','#2f6b3a','#5b3a7a'];
const STAMPC=[];
let MEAS=null;
function meas(){if(!MEAS) MEAS=document.createElement('canvas').getContext('2d'); return MEAS;}
function stampImg(i){
  if(STAMPC[i]) return STAMPC[i];
  const s=STOPS[i], ink=INKS[i%4], SS=5, oval=i%2===0;
  const M=meas(); M.font='bold 7px Stencil, "Rockwell Extra Bold", Impact, sans-serif';
  const nw=M.measureText(s.name).width, fs=Math.min(7,7*40/nw), tw=Math.min(nw,40);
  const w=Math.max(30,tw+8)+(oval?6:0), h=22+(oval?2:0);
  const cw=Math.ceil((w+6)*SS), ch=Math.ceil((h+6)*SS);
  const [c,G]=R.canvas(cw,ch);
  G.setTransform(SS,0,0,SS,cw/2,ch/2);
  G.strokeStyle=ink; G.fillStyle=ink; G.lineJoin='round';
  if(oval){
    G.lineWidth=1.1; G.beginPath(); G.ellipse(0,0,w/2,h/2,0,0,TAU); G.stroke();
    G.lineWidth=.5; G.beginPath(); G.ellipse(0,0,w/2-1.8,h/2-1.8,0,0,TAU); G.stroke();
  } else {
    G.lineWidth=1.1; G.strokeRect(-w/2,-h/2,w,h);
    G.lineWidth=.5; G.strokeRect(-w/2+1.8,-h/2+1.8,w-3.6,h-3.6);
  }
  G.textAlign='center'; G.textBaseline='middle';
  G.font='bold 4.2px Rockwell, Georgia, serif'; G.fillText('ARRIVED',0,-6.3);
  G.font=`bold ${fs.toFixed(2)}px Stencil, "Rockwell Extra Bold", Impact, sans-serif`; G.fillText(s.name,0,.4);
  const day=Math.round(LEGD[i]/RTOT*183);
  G.font='bold 4.2px Rockwell, Georgia, serif'; G.fillText('DAY '+String(day).padStart(3,'0'),0,6.8);
  G.globalCompositeOperation='destination-out';
  const r=rng(100+i);
  for(let k=0;k<70;k++){G.fillStyle=`rgba(0,0,0,${.4+r()*.6})`; G.beginPath(); G.arc((r()-.5)*w,(r()-.5)*h,.15+r()*.45,0,TAU); G.fill();}
  for(let k=0;k<3;k++) airbrush(G,(r()-.5)*w,(r()-.5)*h,4+r()*8,3+r()*5,'#000000',.35+r()*.3);
  return STAMPC[i]={c,w:cw/SS,h:ch/SS};
}
function drawStamp(G,i,x,y,T0,t,mul){
  if(t<T0) return;
  const st=stampImg(i), sc=lerp(1.6,1,back(seg(t,T0,T0+.22)))*(mul||1), a=.78*seg(t,T0,T0+.06);
  G.save(); G.globalAlpha=a; G.translate(x,y); G.rotate((hash(i*7.1)-.5)*.5); G.scale(sc,sc);
  G.drawImage(st.c,-st.w/2,-st.h/2,st.w,st.h);
  G.restore();
}
function stamps(t){
  for(let i=1;i<=12;i++){const s=STOPS[i]; drawStamp(R.g,i,s.x+s.sx,s.y+s.sy,PIN_T[i]+.05,t);}
  const h=STOPS[13]; drawStamp(R.g,13,h.x+h.sx,h.y+h.sy,14.6,t,1.3);
}

// ---------- plane ----------
let PLANE=null;
function planePath(){
  if(PLANE) return PLANE;
  const p=new Path2D();
  p.moveTo(7.2,0); p.quadraticCurveTo(6.4,-1.4,3,-1.35); p.lineTo(-5,-.8); p.lineTo(-7,-.5); p.lineTo(-7,.5); p.lineTo(-5,.8); p.lineTo(3,1.35); p.quadraticCurveTo(6.4,1.4,7.2,0); p.closePath();
  p.moveTo(2.8,-1.2); p.lineTo(1.2,-7.6); p.lineTo(-.6,-7.6); p.lineTo(-.4,-1.2); p.closePath();
  p.moveTo(2.8,1.2); p.lineTo(1.2,7.6); p.lineTo(-.6,7.6); p.lineTo(-.4,1.2); p.closePath();
  p.moveTo(-5,-.6); p.lineTo(-6.4,-3.2); p.lineTo(-7.4,-3.2); p.lineTo(-6.9,-.5); p.closePath();
  p.moveTo(-5,.6); p.lineTo(-6.4,3.2); p.lineTo(-7.4,3.2); p.lineTo(-6.9,.5); p.closePath();
  return PLANE=p;
}
function plane(t){
  if(t<.6||t>14.75) return;
  const g=R.g, gg=R.gg, d=distAt(t), p=posAt(d), a=headAt(d), L=legAt(t);
  const alt=(L.i>=0&&t<LEG_T[L.i][1])?Math.sin(Math.PI*L.f):0;
  const fin=1-seg(t,14.4,14.7), sc=(1+.25*alt)*lerp(.8,1,fin), vis=seg(t,.6,1.0)*fin;
  if(vis<=0) return;
  const P=planePath();
  g.save(); g.globalAlpha=vis;
  g.save(); g.translate(p[0]+2+5*alt,p[1]+3+6*alt); g.rotate(a); g.scale(sc*.92,sc*.92); g.fillStyle='rgba(40,20,5,.26)'; g.fill(P); g.restore();
  g.save(); g.translate(p[0],p[1]); g.rotate(a); g.scale(sc,sc);
  g.lineJoin='round'; g.lineWidth=1.2; g.strokeStyle='#2a1a0c'; g.stroke(P);
  g.fillStyle='#f6ecd2'; g.fill(P);
  g.fillStyle='#b3261e'; g.fillRect(-3.2,-.38,6,.76); g.fillRect(.2,-7.6,1,2.2); g.fillRect(.2,5.4,1,2.2);
  g.fillStyle='rgba(60,40,20,.35)'; g.beginPath(); g.ellipse(7.6,0,.6,3.4,0,0,TAU); g.fill();
  g.restore(); g.restore();
  airbrush(gg,p[0],p[1],9*sc,9*sc,'#ffd98a',.22*vis);
}

// ---------- polaroids ----------
const POLS=[
  {k:'mex',x:88,y:150,t:11.4,rot:-.12,cap:'Mexico'},
  {k:'peru',x:255,y:280,t:11.75,rot:.1,cap:'Peru'},
  {k:'bali',x:452,y:276,t:12.3,rot:-.07,cap:'Bali'}
];
const POLC={};
function photo(G,k){
  // photo area 40 x 38 at (0,0)
  const w=40,h=38;
  G.save(); G.beginPath(); G.rect(0,0,w,h); G.clip();
  if(k==='mex'){
    R.vgrad(G,0,0,w,h,[[0,'#7fb4d6'],[.6,'#f3d6a0'],[1,'#e9b878']]);
    airbrush(G,31,9,7,7,'#fff2c0',.9);
    G.fillStyle='#6f8f4a'; G.fillRect(0,30,w,8);
    const tiers=[[6,30,28],[8.5,26,23],[11,22,18],[13.5,18,13],[16,14,8]];
    tiers.forEach(([x,y,ww],i)=>{G.fillStyle=i%2?'#b48a5a':'#c79e6a'; G.fillRect(x,y,ww,4.2); G.fillStyle='rgba(60,30,10,.25)'; G.fillRect(x+ww*.62,y,ww*.38,4.2);});
    G.fillStyle='#8a5a34'; G.fillRect(17.4,10,5.2,4.2);
    G.fillStyle='#d8b07a'; G.fillRect(18.8,14,2.4,16);
    G.fillStyle='#3f6a34'; for(let i=0;i<6;i++){G.beginPath(); G.arc(2+i*7.2,31+Math.sin(i)*1.2,2.6,0,TAU); G.fill();}
  } else if(k==='peru'){
    R.vgrad(G,0,0,w,h,[[0,'#a9c7d8'],[.7,'#e6e2cf'],[1,'#d9d4bc']]);
    G.fillStyle='#7d9a8a'; G.beginPath(); G.moveTo(0,24); G.lineTo(8,10); G.lineTo(15,20); G.lineTo(22,8); G.lineTo(32,18); G.lineTo(40,12); G.lineTo(40,38); G.lineTo(0,38); G.fill();
    G.fillStyle='#3f6e44'; G.beginPath(); G.moveTo(18,38); G.lineTo(24,6); G.quadraticCurveTo(27,3,30,7); G.lineTo(36,38); G.fill();
    G.fillStyle='#5a8a4e'; G.beginPath(); G.moveTo(0,38); G.lineTo(0,29); G.quadraticCurveTo(10,24,22,30); G.lineTo(22,38); G.fill();
    G.strokeStyle='rgba(230,220,190,.75)'; G.lineWidth=.6;
    for(let i=0;i<4;i++){G.beginPath(); G.moveTo(1,31+i*2); G.quadraticCurveTo(10,27+i*2,21,32+i*2); G.stroke();}
    G.fillStyle='#cfc6ae'; for(let i=0;i<5;i++) G.fillRect(4+i*3.4,28.6-i*.4,2.2,1.6);
    airbrush(G,20,20,22,5,'#ffffff',.35);
  } else {
    R.vgrad(G,0,0,w,h,[[0,'#5b3a6a'],[.35,'#d8606a'],[.62,'#ffb35a'],[.63,'#e98a4a'],[1,'#7a3a4a']]);
    airbrush(G,24,23.5,9,9,'#fff0b0',.9);
    G.fillStyle='#ffe9a0'; G.beginPath(); G.arc(24,23.6,4.2,Math.PI,TAU); G.fill();
    G.fillStyle='rgba(255,230,160,.6)'; for(let i=0;i<5;i++) G.fillRect(20-i*.8,25+i*2.2,8+i*1.6,.7);
    G.strokeStyle='#2a1420'; G.lineWidth=1.3; G.lineCap='round';
    G.beginPath(); G.moveTo(6,38); G.quadraticCurveTo(8,22,13,10); G.stroke();
    G.fillStyle='#2a1420';
    for(let i=0;i<6;i++){
      const a=-Math.PI*.95+i*Math.PI*.36;
      G.beginPath(); G.moveTo(13,10); G.quadraticCurveTo(13+Math.cos(a-.25)*7,10+Math.sin(a-.25)*7,13+Math.cos(a)*12,10+Math.sin(a)*12+3);
      G.quadraticCurveTo(13+Math.cos(a+.2)*6,10+Math.sin(a+.2)*6,13,10); G.fill();
    }
    G.fillRect(0,34,w,4);
  }
  airbrush(G,20,19,30,28,'#fff6e0',.08);
  G.restore();
}
function polImg(p){
  if(POLC[p.k]) return POLC[p.k];
  const SS=5, pw=46, ph=52;
  const [c,G]=R.canvas(pw*SS,ph*SS);
  G.setTransform(SS,0,0,SS,0,0);
  G.fillStyle='#f7f2e4'; G.fillRect(0,0,pw,ph);
  G.strokeStyle='rgba(120,100,70,.35)'; G.lineWidth=.4; G.strokeRect(.2,.2,pw-.4,ph-.4);
  G.save(); G.translate(3,3); photo(G,p.k); G.restore();
  G.fillStyle='#2a2a3a'; G.font='7px "Segoe Print", "Ink Free", cursive'; G.textAlign='center'; G.textBaseline='middle';
  G.fillText(p.cap,pw/2,ph-5.6);
  return POLC[p.k]={c,w:pw,h:ph};
}
function polaroids(t){
  const g=R.g;
  for(const p of POLS){
    if(t<p.t) continue;
    const u=seg(t,p.t,p.t+.35), sc=lerp(1.5,1,back(u)), rot=p.rot+(1-easeOut(u))*.35, a=seg(t,p.t,p.t+.08);
    const im=polImg(p), so=lerp(6,1.6,easeOut(u));
    g.save(); g.globalAlpha=a; g.translate(p.x,p.y); g.rotate(rot); g.scale(sc,sc);
    g.fillStyle='rgba(30,15,5,.3)'; g.fillRect(-im.w/2+so*.6,-im.h/2+so,im.w,im.h);
    g.drawImage(im.c,-im.w/2,-im.h/2,im.w,im.h);
    g.fillStyle='rgba(236,226,196,.72)'; g.save(); g.translate(0,-im.h/2+.5); g.rotate(-.08); g.fillRect(-9,-3,18,6); g.restore();
    g.restore();
  }
}

// ---------- home marks ----------
function homeMarks(t){
  if(t<14.52) return;
  const g=R.g, s=STOPS[0], L=5;
  g.save(); g.translate(s.x,s.y); g.lineCap='round';
  g.strokeStyle='#b3261e'; g.lineWidth=1.8;
  const a=seg(t,14.52,14.64), b=seg(t,14.64,14.76);
  if(a>0){g.beginPath(); g.moveTo(-L,-L); g.lineTo(-L+2*L*a,-L+2*L*a); g.stroke();}
  if(b>0){g.beginPath(); g.moveTo(L,-L); g.lineTo(L-2*L*b,-L+2*L*b); g.stroke();}
  const c=seg(t,14.76,15.0);
  if(c>0){g.strokeStyle=rgba('#3a3a40',.7); g.lineWidth=.9; g.beginPath(); g.ellipse(0,0,10,8,-.2,-Math.PI/2,-Math.PI/2+c*TAU*1.08); g.stroke();}
  g.restore();
}

// ---------- public ----------
function drawMap(t,cam,o){
  o=o||{};
  R.withCam(cam,()=>{
    R.g.drawImage(o.navy?navy():parch(),0,0,W,H);
    route(t,o);
    if(!o.navy){
      stamps(t);
      if(o.polaroids) polaroids(t);
      pins(t);
      if(o.home) homeMarks(t);
      plane(t);
    }
  });
}
function hud(t,a){
  if(!(a>0)) return;
  const g=R.g, day=Math.round(distAt(t)/RTOT*183);
  let n=0; for(let i=1;i<=12;i++) if(t>=PIN_T[i]) n++;
  g.save(); g.globalAlpha=a; g.font='bold 10px "Bookman Old Style", Georgia, serif'; g.textBaseline='middle';
  g.fillStyle='#e8c26a';
  g.textAlign='left'; g.fillText('EXPEDITION LOG',24,19);
  g.textAlign='right'; g.fillText('DAY '+String(day).padStart(3,'0')+'  \u00b7  STOPS '+String(n).padStart(2,'0')+'/12',616,19);
  g.restore();
}
function warm(){parch(); navy(); for(let i=1;i<=13;i++) stampImg(i); POLS.forEach(polImg);}

window.MAP={proj,STOPS,PIN_T,LEG_T,RTOT,distAt,legAt,posAt,headAt,drawMap,mapCam,homeCam,toScreen,hud,warm};
})();
