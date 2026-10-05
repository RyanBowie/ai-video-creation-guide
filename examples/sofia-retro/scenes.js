// Copilot Quest — Episode 1 — Act 1 scene renderers (title, travel, ret). Act 2 lives in act2.js and reuses S.U.
// travel/ret are authored in their own local clocks; the export at the bottom shifts them onto the 89.5 s timeline.
(function(){
const {W,H,g,gg,clamp,lerp,ease,easeOut,easeIn,back,seg,hash}=R;
const words=k=>(window.VT&&VT[k])?VT[k].words:null;
function fillPoly(G,P,c){G.beginPath();P.forEach((p,i)=>i?G.lineTo(p[0],p[1]):G.moveTo(p[0],p[1]));G.closePath();G.fillStyle=c;G.fill();}
function strokePoly(G,P,c,lw,close){G.beginPath();P.forEach((p,i)=>i?G.lineTo(p[0],p[1]):G.moveTo(p[0],p[1]));if(close)G.closePath();G.strokeStyle=c;G.lineWidth=lw;G.lineJoin=G.lineCap='round';G.stroke();}
function rect(G,x,y,w,h,c){G.fillStyle=c;G.fillRect(x,y,w,h);}
function spr(rows,x,y,s,pal,G=g){rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){const c=pal[r[i]];if(c){G.fillStyle=c;G.fillRect(x+i*s,y+j*s,s,s);}}});}
function ga(a,fn){g.save();gg.save();g.globalAlpha*=a;gg.globalAlpha*=a;try{fn();}finally{g.restore();gg.restore();}}
function scaled(cx,cy,sx,sy,fn){if(sx<=.001||sy<=.001)return;[g,gg].forEach(G=>{G.save();G.translate(cx,cy);G.scale(sx,sy);G.translate(-cx,-cy);});try{fn();}finally{g.restore();gg.restore();}}
function circ(G,x,y,r,c){G.beginPath();G.arc(x,y,Math.max(0,r),0,Math.PI*2);G.fillStyle=c;G.fill();}
function putC(G,s,cx,y,col,sh,sc){PF.put(G,s,Math.round(cx-PF.textW(s,sc)/2),y,col,sh,sc);}
function typedC(s,t,cps,cx,y,col,sc,core){const x0=cx-PF.textW(s,sc)/2;const sub=R.typeText(s,t,cps);if(sub)R.neonText(sub,x0,y,col,sc,core||'#fff','left');}

const TXT={
 travel:"Six months. Twelve countries. Beaches, mountains... and not a single email.",
 ahh:"Ahh... this is the life.",
 back:"It's Sofia's first day back, after a six-month sabbatical.",
 behind:"Six months behind...",
 mode:"...and in full catch-up mode.",
 good:"Okay... six months to catch up on. Where do I even start?"
};

/* ============================ TITLE 0–2.2 ============================ */
function ridge(seed,amp,col,step){
 for(let side=0;side<2;side++){
  const x0=side?378:0,x1=side?640:262,P=[[x0,214]];let i=0;
  for(let x=x0;x<=x1+.1;x+=step,i++){
   const d=side?(x-378):(262-x),u=clamp(d/262,0,1),taper=u*(2-u);
   const hi=i%2===0,y=210-taper*amp*(hi?(.6+.4*hash(seed+i*7+side*101)):(.22+.2*hash(seed+i*3+side*57)));
   P.push([x,y]);
  }
  P.push([x1,214]);fillPoly(g,P,col);
  const E=P.slice(1,-1);strokePoly(g,E,'#ff3fa4',1.5);ga(.6,()=>strokePoly(gg,E,'#ff3fa4',3));
 }
}
function title(t){
 R.drawPlate(R.ditherGrad('titleSky',640,212,['#0b0620','#1d0b44','#3c0f66','#7a1a86','#d0307e','#ff7a6a']),0,0,640,212);
 R.stars(g,t,11,70,0,0,640,170,['#ffffff','#ffd6f5','#9ff6ff'],.6);
 R.synthSun(320,205,92,t);
 ridge(3,62,'#2a0f4a',24);ridge(9,38,'#160828',16);
 rect(g,0,210,640,150,'#12061f');R.synthGrid(t,210,'#ff3fa4');
 if(t>.2&&t<1.0)PF.put(g,'PLAY ▶',28,22,'#fff',true,2);
 if(t>=1.0){PF.put(g,'1UP',40,12,'#ff3f5a',true,1);PF.put(g,'000000',40,22,'#fff',true,1);
  const cr='CREDIT 01';PF.put(g,cr,600-PF.textW(cr,1),340,'#fff',true,1);}
 const ms=40*back(seg(t,.3,.5));if(ms>1)R.markPix(320,46,ms);
 if(t>.5){
  let y=lerp(-40,78,back(seg(t,.5,.86)));
  if(t>.86&&t<1.1)y+=Math.sin(t*90)*(1-seg(t,.86,1.1))*4;
  R.logoText('COPILOT QUEST',320,y,5,{});
  if(t>.88){R.flare(320,95,1.2,.35+.65*(1-seg(t,.88,1.4)));
   [[118,70],[512,74],[180,118],[470,120],[330,64]].forEach(([x,yy],i)=>{
    const ph=(t*3+i*.37)%1;R.sparkle(g,x,yy,3+6*Math.sin(ph*Math.PI),'#fff',Math.sin(ph*Math.PI),i,.8);});}
 }
 if(t>1.0){const bw=340*easeOut(seg(t,1.0,1.15));
  rect(g,320-bw/2,120,bw,28,'rgba(12,4,28,.9)');rect(g,320-bw/2,120,bw,1,'#ff3fa4');rect(g,320-bw/2,147,bw,1,'#ff3fa4');
  typedC('EPISODE 1: ENTER COPILOT',t-1.0,80,320,127,'#35e7ff',2);}
 if(t>1.3&&R.blink(t,2))R.hudText('PRESS START',320,296,'#ffe14a',2,'center');
 return {power:ease(seg(t,0,.6)),bloom:.55,halo:.12};
}

/* ============================ WORLD MAP ============================ */
const MX=lon=>44+(lon+180)/360*552,MY=lat=>64+(80-lat)/136*204;
const LAND=[
 [[-168,66],[-160,71],[-140,70],[-120,72],[-95,75],[-80,73],[-65,62],[-55,52],[-66,45],[-75,38],[-81,31],[-80,25],[-90,29],[-97,26],[-97,20],[-90,16],[-83,10],[-79,8],[-87,13],[-95,16],[-105,20],[-112,29],[-117,32],[-124,40],[-124,48],[-135,58],[-150,60],[-165,60]],
 [[-50,60],[-42,60],[-20,70],[-20,80],[-60,82],[-70,78],[-55,68]],
 [[-80,9],[-72,12],[-60,8],[-50,0],[-35,-5],[-38,-13],[-40,-22],[-48,-26],[-53,-34],[-58,-38],[-65,-42],[-66,-50],[-70,-55],[-75,-50],[-73,-40],[-71,-30],[-70,-18],[-76,-14],[-81,-5],[-79,2]],
 [[-10,36],[-9,44],[-1,46],[2,51],[8,55],[5,62],[14,68],[25,71],[40,68],[60,70],[80,73],[100,76],[130,72],[160,70],[180,66],[175,62],[160,58],[155,50],[140,46],[135,40],[128,35],[122,30],[120,23],[110,20],[108,12],[104,8],[100,13],[98,17],[92,21],[88,22],[80,15],[77,8],[72,20],[66,25],[57,26],[48,30],[36,36],[27,40],[22,37],[15,38],[12,44],[8,44],[3,42],[-2,37]],
 [[35,30],[48,30],[56,26],[59,22],[52,16],[44,12],[38,18],[34,28]],
 [[-17,15],[-17,21],[-13,28],[-6,36],[10,37],[20,32],[32,31],[34,28],[38,18],[43,12],[51,12],[48,4],[40,-3],[40,-15],[35,-24],[32,-29],[26,-34],[19,-35],[16,-28],[12,-17],[13,-6],[9,-1],[9,4],[4,6],[-5,5],[-12,7],[-15,11]],
 [[44,-13],[50,-15],[48,-25],[44,-22]],
 [[95,5],[100,-2],[106,-7],[115,-9],[128,-9],[141,-9],[141,-2],[132,-1],[125,2],[119,7],[110,3],[104,3]],
 [[130,31],[136,34],[141,36],[142,41],[145,44],[141,45],[139,40],[135,36],[130,34]],
 [[113,-22],[114,-34],[118,-35],[124,-33],[132,-32],[138,-35],[141,-38],[147,-38],[150,-37],[153,-30],[153,-25],[146,-19],[142,-11],[136,-12],[131,-11],[126,-14],[122,-17]],
 [[166,-46],[172,-41],[174,-37],[178,-38],[175,-42],[170,-46]],
 [[-6,50],[1,51],[1,53],[-2,56],[-3,58],[-6,58],[-5,54],[-3,53],[-5,52]],
 [[-24,64],[-22,66],[-14,66],[-13,64],[-18,63]]
];
function inPoly(x,y,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const xi=P[i][0],yi=P[i][1],xj=P[j][0],yj=P[j][1];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;}
let MAPC=null;
function mapCanvas(){
 if(MAPC)return MAPC;const c=document.createElement('canvas');c.width=1920;c.height=1080;const G=c.getContext('2d');G.setTransform(3,0,0,3,0,0);
 const polys=LAND.map(P=>P.map(([lo,la])=>[MX(lo),MY(la)]));
 for(let y=66;y<=268;y+=5)for(let X=46;X<=594;X+=5){
  if(polys.some(P=>inPoly(X,y,P))){G.fillStyle=hash(X*7+y*13)>.8?'#3ff0d0':'#1fb5a8';G.fillRect(X-1,y-1,3,3);}
  else{G.fillStyle='rgba(53,231,255,.1)';G.fillRect(X,y,1,1);}
 }
 return MAPC=c;
}
const CITIES=[['LONDON',-0.1,51.5],['ICELAND',-21.9,64.1],['PORTUGAL',-9.1,38.7],['MOROCCO',-8,31.6],['SOUTH AFRICA',18.4,-33.9],['TANZANIA',39.2,-6.2],['MALDIVES',73.5,4.2],['THAILAND',100.5,13.8],['VIETNAM',105.8,21],['INDONESIA',115.2,-8.4],['AUSTRALIA',151.2,-33.9],['NEW ZEALAND',168.7,-45],['JAPAN',139.7,35.7]];
const CXY=CITIES.map(c=>[MX(c[1]),MY(c[2])]);
const ROUTE=[CXY[0]],RL=[0],SEGEND=[0];
for(let i=1;i<CXY.length;i++){
 const a=CXY[i-1],b=CXY[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]),cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2-.25*d;
 for(let s=1;s<=20;s++){const u=s/20,x=(1-u)*(1-u)*a[0]+2*(1-u)*u*cx+u*u*b[0],y=(1-u)*(1-u)*a[1]+2*(1-u)*u*cy+u*u*b[1];
  const p=ROUTE[ROUTE.length-1];RL.push(RL[RL.length-1]+Math.hypot(x-p[0],y-p[1]));ROUTE.push([x,y]);}
 SEGEND.push(ROUTE.length-1);
}
const RTOT=RL[RL.length-1];
const PIN_T=SEGEND.map(k=>2.6+RL[k]/RTOT*1.35);
const PLANE=["...#...","#..##..","#######","#..##..","...#..."];

function drawRoute(t){
 const dist=seg(t,2.6,3.95)*RTOT;if(dist<=0)return;
 let k=1;while(k<RL.length&&RL[k]<dist)k++;
 const pts=ROUTE.slice(0,k);let head;
 if(k<RL.length){const a=ROUTE[k-1],b=ROUTE[k],u=(dist-RL[k-1])/((RL[k]-RL[k-1])||1);head=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];pts.push(head);}
 else head=ROUTE[ROUTE.length-1];
 if(pts.length>1){
  g.setLineDash([3,3]);gg.setLineDash([3,3]);
  strokePoly(g,pts,'#ff3f5a',1.5);ga(.6,()=>strokePoly(gg,pts,'#ff3f5a',3));
  g.setLineDash([]);gg.setLineDash([]);
 }
 if(t>2.6&&t<4.25){
  const a=pts.length>1?pts[pts.length-2]:ROUTE[0],ang=Math.atan2(head[1]-a[1],head[0]-a[0]);
  g.save();g.translate(head[0],head[1]);g.rotate(ang);spr(PLANE,-7,-5,2,{'#':'#ffffff'});g.restore();
  gg.save();gg.globalAlpha=.5;circ(gg,head[0],head[1],6,'#ffffff');gg.restore();
 }
}
function drawPins(t){
 for(let i=0;i<CXY.length;i++){
  const [x,y]=CXY[i];
  if(i===0){if(t<2.45)continue;const pul=.5+.5*Math.sin(t*8);
   rect(g,x-2,y-2,4,4,'#ffe14a');ga(.4+.6*pul,()=>circ(gg,x,y,5,'#ffe14a'));
   R.panel(g,x-15,y-16,PF.textW('HOME',1)+6,11,{edge:'#ffe14a'});PF.put(g,'HOME',x-12,y-14,'#fff3a0',true,1);continue;}
  const t0=PIN_T[i];if(t<t0)continue;
  const k=back(seg(t,t0,t0+.15)),h=7*k;
  rect(g,x-.5,y-h,1.2,h,'#ffd0d8');circ(g,x,y-h,2.8*k,'#ff3f5a');rect(g,x-1,y-h-1.5,1,1,'#fff');
  ga(.7,()=>circ(gg,x,y-h,4*k,'#ff3f5a'));
  const sp=1-seg(t,t0,t0+.3);if(sp>0)R.pxSpark(g,x,y-8,2,'#ffffff',sp);
 }
}
function mapHUD(t){
 const n=PIN_T.filter((p,i)=>i>0&&t>=p).length;
 const hud='COUNTRIES '+String(n).padStart(2,'0')+'/12',hw=PF.textW(hud,1);
 R.panel(g,596-hw,258,hw+8,13,{edge:'#ffe14a'});PF.put(g,hud,600-hw,261,'#fff3a0',true,1);
 if(n>0){const c='▶ '+CITIES[n][0];R.panel(g,34,258,PF.textW(c,1)+8,13,{edge:'#35e7ff'});PF.put(g,c,38,261,'#ffffff',true,1);}
}

/* ============================ POSTCARDS ============================ */
const CARDS={};
function palm(G,x,y,h,t,col,rim){
 const top=[x+16,y-h];
 G.lineCap='round';G.strokeStyle=col;G.lineWidth=h*.07;G.beginPath();G.moveTo(x,y);G.quadraticCurveTo(x-h*.08,y-h*.55,top[0],top[1]);G.stroke();
 if(rim){G.strokeStyle=rim;G.lineWidth=1.2;G.beginPath();G.moveTo(x+h*.03,y);G.quadraticCurveTo(x-h*.04,y-h*.55,top[0]+h*.03,top[1]+1);G.stroke();}
 for(let i=0;i<7;i++){
  const a=-Math.PI/2+(i-3)*.52+Math.sin(t*1.6+i)*.05,L=h*.5,dx=Math.cos(a),dy=Math.sin(a);
  const up=[],dn=[];
  for(let s=0;s<=8;s++){const u=s/8,px=top[0]+dx*L*u,py=top[1]+dy*L*u*.7+L*.55*u*u,w=h*.05*Math.sin(Math.PI*Math.min(1,u*1.1+.08));up.push([px,py-w]);dn.push([px,py+w*.6]);}
  fillPoly(G,up.concat(dn.reverse()),col);
 }
 circ(G,top[0]-2,top[1]+3,h*.03,col);circ(G,top[0]+3,top[1]+4,h*.03,col);
}
function cardCanvas(key,w,h,cap,paint){
 if(CARDS[key])return CARDS[key];
 const c=document.createElement('canvas');c.width=w*3;c.height=h*3;const G=c.getContext('2d');G.setTransform(3,0,0,3,0,0);
 G.fillStyle='#f6ecd2';G.fillRect(0,0,w,h);
 G.save();G.beginPath();G.rect(6,6,w-12,h-26);G.clip();G.translate(6,6);paint(G,w-12,h-26);G.restore();
 G.strokeStyle='#3a2a12';G.lineWidth=1.5;G.strokeRect(6,6,w-12,h-26);
 PF.put(G,cap,Math.round((w-PF.textW(cap,1))/2),h-15,'#3a2a12',false,1);
 G.fillStyle='#fffaf0';G.fillRect(w-30,10,20,24);
 G.fillStyle='#f6ecd2';for(let i=0;i<5;i++){G.fillRect(w-31,11+i*5,1.4,2);G.fillRect(w-11.4,11+i*5,1.4,2);}
 G.fillStyle='#ff3f5a';G.fillRect(w-27,13,14,14);
 spr([".#.#.","#####","#####",".###.","..#.."],w-25,15,2,{'#':'#fffaf0'},G);
 G.fillStyle='#3a2a12';PF.put(G,'1990',w-29,28,'#3a2a12',false,1);
 return CARDS[key]=c;
}
function beachCard(){return cardCanvas('beach',180,120,'WISH YOU WERE HERE',(G,w,h)=>{
 const bands=['#3a0f5e','#7a1a7a','#c42a78','#ff6a5a','#ffb44a'],hz=h*.62;
 bands.forEach((c,i)=>{G.fillStyle=c;G.fillRect(0,i*hz/5,w,hz/5+1);});
 const sx=w*.62,sy=hz,sr=24;
 G.save();G.beginPath();G.arc(sx,sy,sr,Math.PI,0);G.closePath();G.clip();G.fillStyle='#ffe14a';G.fillRect(sx-sr,sy-sr,sr*2,sr);
 for(let k=0;k<5;k++){G.fillStyle='#c42a78';G.fillRect(sx-sr,sy-3-k*4.5,sr*2,.8+k*.5);}G.restore();
 G.fillStyle='#2a1460';G.fillRect(0,hz,w,h*.22);
 for(let k=0;k<6;k++){G.fillStyle='#ff9a6a';const ww=26-k*4;G.fillRect(sx-ww/2+(k%2?3:-3),hz+2+k*3,ww,1);}
 G.fillStyle='#e8b07a';G.beginPath();G.moveTo(0,h);G.lineTo(0,hz+h*.2);G.quadraticCurveTo(w*.5,hz+h*.12,w,hz+h*.26);G.lineTo(w,h);G.closePath();G.fill();
 palm(G,24,h+2,h*.95,0,'#2b0f3d',null);
})}
function mountainCard(){return cardCanvas('mount',170,116,'GREETINGS FROM NZ',(G,w,h)=>{
 const sky=['#4aa8ff','#8fd0ff','#d8f0ff'];sky.forEach((c,i)=>{G.fillStyle=c;G.fillRect(0,i*h*.2,w,h*.2+1);});
 G.fillStyle='#d8f0ff';G.fillRect(0,h*.6,w,h*.1);
 const peaks=[[-10,h*.72],[30,h*.22],[58,h*.5],[92,h*.12],[128,h*.46],[150,h*.3],[w+10,h*.72]];
 fillPoly(G,peaks.concat([[w+10,h],[-10,h]]),'#3a4a8a');
 [[30,h*.22],[92,h*.12],[150,h*.3]].forEach(([x,y])=>fillPoly(G,[[x,y],[x+9,y+10],[x+4,y+8],[x,y+12],[x-4,y+8],[x-9,y+10]],'#ffffff'));
 fillPoly(G,[[-10,h*.72],[40,h*.6],[80,h*.68],[120,h*.58],[w+10,h*.7],[w+10,h],[-10,h]],'#2a3a6a');
 G.fillStyle='#2a6ab0';G.fillRect(0,h*.74,w,h*.26);
 for(let k=0;k<5;k++){G.fillStyle='#8fd0ff';G.fillRect(20+k*28,h*.8+(k%2)*5,14,1);}
 for(let i=0;i<9;i++){const x=4+i*19,y=h*.75,s=7+(i%3)*2;fillPoly(G,[[x,y-s*1.6],[x+s*.6,y],[x-s*.6,y]],'#1a4a3a');}
})}
function drawCard(c,cx,cy,w,h,rot,t,t0){
 if(t<t0)return;const yo=lerp(300,0,back(seg(t,t0,t0+.3)));
 g.save();g.translate(cx,cy+yo);g.rotate(rot*Math.PI/180);
 g.fillStyle='rgba(0,0,0,.45)';g.fillRect(-w/2+5,-h/2+6,w,h);g.drawImage(c,-w/2,-h/2,w,h);g.restore();
}

/* ============================ TRAVEL 2.2–9.8 ============================ */
function travelAB(t){
 R.vgrad(g,0,0,640,360,[[0,'#0a0620'],[1,'#1a0a3a']]);
 R.stars(g,t,5,60,0,0,640,360,['#ffffff','#9ff6ff'],.4);
 if(t>2.55){const full='★ 6 MONTHS AWAY ★',fw=PF.textW(full,2);R.panel(g,320-fw/2-8,8,fw+16,30,{alpha:easeOut(seg(t,2.55,2.7)),edge:'#ffe14a'});typedC(full,t-2.55,40,320,16,'#ffe14a',2);}
 const kz=easeIn(seg(t,6.55,6.8)),cam={x:lerp(320,190,kz),y:lerp(180,150,kz),z:lerp(1,5,kz)};
 R.withCam(cam,()=>{
  const op=easeOut(seg(t,2.25,2.45));
  scaled(320,160,1,op,()=>{
   R.win(g,28,44,584,232,'WORLD_TOUR.EXE',{theme:'night'});
   const M=mapCanvas();g.drawImage(M,0,0,640,360);ga(.25,()=>gg.drawImage(M,0,0,640,360));
   if(op>=1){drawRoute(t);drawPins(t);mapHUD(t);}
  });
 });
 if(t>4.95){const k=seg(t,4.95,5.15);R.ditherFade(.5*k,'#0a1030');gg.save();gg.fillStyle='rgba(0,0,0,'+(.5*k)+')';gg.fillRect(0,0,640,360);gg.restore();}
 R.withCam(cam,()=>{
  drawCard(beachCard(),190,150,180,120,-8,t,4.93);
  drawCard(mountainCard(),450,140,170,116,6,t,5.35);
  if(t>6.0){
   const s=lerp(.2,1,back(seg(t,6.0,6.25)));
   scaled(320,229,s,s,()=>{
    R.win(g,226,196,188,66,'INBOX.EXE',{theme:'classic'});
    PF.put(g,'✉ EMAILS: 0',236,217,'#000000',false,2);
    PF.put(g,'OUT OF OFFICE: ON ✓',236,238,'#1a9a3a',false,1);
   });
   if(t>6.517&&t<6.9){const a=1-seg(t,6.517,6.9);[[232,198],[410,204],[300,190],[392,258]].forEach(([x,y],i)=>R.sparkle(g,x,y,4+4*a,'#ffffff',a,i,.8));}
  }
 });
 R.pixelate(36*seg(t,6.55,6.8));
 vnTravel(t);
}
function vnTravel(t){if(t<7.36)R.vnBox(g,16,290,608,62,'',TXT.travel,t-2.307,{words:words('travel')});}

function alarmClock(G,x,y,r,t,quiet){
 G.save();G.translate(x,y);if(!quiet)G.rotate(Math.sin(t*70)*.18);
 G.strokeStyle='#2a0e3a';G.lineWidth=2.5;G.lineCap='round';
 [-1,1].forEach(s=>{G.beginPath();G.arc(s*r*.62,-r*.84,r*.38,Math.PI,0);G.closePath();G.fillStyle='#ffd23a';G.fill();G.stroke();});
 G.beginPath();G.moveTo(0,-r*1.05);G.lineTo(0,-r*1.32);G.stroke();
 G.beginPath();G.moveTo(-r*.6,r*.72);G.lineTo(-r*.86,r*1.1);G.moveTo(r*.6,r*.72);G.lineTo(r*.86,r*1.1);G.stroke();
 G.beginPath();G.arc(0,0,r,0,Math.PI*2);G.fillStyle='#ff3f5a';G.fill();G.stroke();
 G.beginPath();G.arc(0,0,r*.78,0,Math.PI*2);G.fillStyle='#fff8e8';G.fill();G.lineWidth=1.5;G.stroke();
 G.fillStyle='#2a0e3a';for(let i=0;i<12;i++){const a=i/12*Math.PI*2;G.fillRect(Math.cos(a)*r*.66-1,Math.sin(a)*r*.66-1,2,2);}
 G.lineWidth=2.5;G.beginPath();G.moveTo(0,0);G.lineTo(Math.cos(Math.PI*.5+Math.PI/6)*r*.4,Math.sin(Math.PI*.5+Math.PI/6)*r*.4);G.stroke();
 G.lineWidth=1.8;G.beginPath();G.moveTo(0,0);G.lineTo(0,-r*.62);G.stroke();
 G.restore();
 if(quiet)return;
 G.save();G.strokeStyle='#ffffff';G.lineWidth=2;G.lineCap='round';
 [-1,1].forEach(s=>{for(let k=0;k<3;k++){const a=-Math.PI/2+s*(.7+k*.35);G.beginPath();G.moveTo(x+Math.cos(a)*r*1.25,y+Math.sin(a)*r*1.25);G.lineTo(x+Math.cos(a)*r*1.55,y+Math.sin(a)*r*1.55);G.stroke();}});
 G.restore();
}
const CURSOR=["X..........","XX.........","XoX........","XooX.......","XoooX......","XooooX.....","XoooooX....","XooooooX...","XoooooooX..","XooooXXXXX.","XooXooX....","XoX.XooX...","XX..XooX...","X....XooX..",".....XooX..","......XX..."];
// Win95 busy hourglass (11x14): the sand drains in three steps, then the glass flips over
const HG=[
 ["XXXXXXXXXXX",".XoooooooX.",".XsssssssX.","..XsssssX..","...XsssX...","....XsX....","....XsX....","....XsX....","....XsX....","...XosoX...","..XoosooX..",".XooosoooX.",".XoosssooX.","XXXXXXXXXXX"],
 ["XXXXXXXXXXX",".XoooooooX.",".XoooooooX.","..XosssoX..","...XsssX...","....XsX....","....XsX....","....XsX....","....XsX....","...XosoX...","..XoosooX..",".XoosssooX.",".XsssssssX.","XXXXXXXXXXX"],
 ["XXXXXXXXXXX",".XoooooooX.",".XoooooooX.","..XoooooX..","...XosoX...","....XsX....","....XsX....","....XsX....","....XsX....","...XosoX...","..XosssoX..",".XsssssssX.",".XsssssssX.","XXXXXXXXXXX"]];
// hourglass centre: idles over the box, then an impatient mouse-wiggle right after NOT RESPONDING (r 2.95-3.25)
function hgPos(r){const w=r>2.95&&r<3.25?Math.sin(Math.PI*(r-2.95)/.3):0,p=(r-2.95)*Math.PI*10;
 return [Math.round(575+3*Math.sin(r*2.1)+10*w*Math.sin(p)),Math.round(200+2*Math.sin(r*1.7)+4*w*Math.cos(p))];}
// Win95 "has stopped responding" box; r = seconds since the first RING. It pops at 1.53, hangs (title greys to
// NOT RESPONDING at 2.8 on the 'hang' ding), the hourglass turns back into the arrow at 3.3, OK is pressed at 3.9
function crashDialog(r){
 const x=332,y=150,w=284,h=108,s=back(seg(r,1.53,1.65)),sy=1-easeIn(seg(r,4.0,4.08)),hung=r>=2.8;
 if(s<=.01||sy<=.01)return;
 scaled(x+w/2,y+h/2,s,s*sy,()=>{
  // the box sits over the sun: knock the sun's glow out from behind it or the bloom washes the text away
  rect(gg,x-6,y-6,w+12,h+12,'#000000');
  const c=R.win(g,x,y,w,h,hung?'VACATION.EXE (NOT RESPONDING)':'VACATION.EXE',Object.assign({theme:'classic',body:'#c0c0c0'},hung?{t0:'#5a5a5a',t1:'#8a8a8a'}:{}));
  circ(g,c.x+20,c.y+21,12,'#000000');circ(g,c.x+19,c.y+20,12,'#e01c1c');
  g.save();g.strokeStyle='#ffffff';g.lineWidth=3.2;g.beginPath();g.moveTo(c.x+13,c.y+14);g.lineTo(c.x+25,c.y+26);g.moveTo(c.x+25,c.y+14);g.lineTo(c.x+13,c.y+26);g.stroke();g.restore();
  PF.put(g,'VACATION.EXE',c.x+42,c.y+7,'#000000',false,2);
  PF.put(g,'HAS STOPPED RESPONDING.',c.x+42,c.y+27,'#000000',false,1);
  // the dots tick until the hang, then freeze mid-cycle
  PF.put(g,'RETURNING TO WORK'+'...'.slice(0,1+Math.floor(Math.min(r,2.79)*3)%3),c.x+42,c.y+39,'#3a3a3a',false,1);
  // sunken Win95 progress bar: crawls a block every .4 s, then sticks at three blocks
  const px=c.x+42,py=c.y+50,pw=150,ph=9,nb=1+Math.min(2,Math.floor(Math.max(0,r-1.65)/.4));
  rect(g,px,py,pw,1,'#808080');rect(g,px,py,1,ph,'#808080');rect(g,px,py+ph-1,pw,1,'#ffffff');rect(g,px+pw-1,py,1,ph,'#ffffff');
  for(let i=0;i<nb;i++)rect(g,px+2+i*7,py+2,5,ph-4,'#000080');
  const bw=64,bh=18,bx=Math.round(c.x+c.w/2-bw/2),by=c.y+c.h-bh-5,dn=r>=3.9&&r<4.0?1:0;
  rect(g,bx-1,by-1,bw+2,bh+2,'#000000');rect(g,bx,by,bw,bh,'#c0c0c0');
  rect(g,bx,by,bw,1,dn?'#808080':'#ffffff');rect(g,bx,by,1,bh,dn?'#808080':'#ffffff');
  rect(g,bx,by+bh-1,bw,1,dn?'#ffffff':'#404040');rect(g,bx+bw-1,by,1,bh,dn?'#ffffff':'#404040');
  for(let i=0;i<bw-8;i+=2){rect(g,bx+4+i,by+3,1,1,'#000');rect(g,bx+4+i,by+bh-4,1,1,'#000');}
  PF.put(g,'OK',bx+bw/2-PF.textW('OK',1)/2+dn,by+6+dn,'#000000',false,1);
 });
 // busy hourglass (frame steps on the hang-bed ticks, flips every .75 s) -> arrow drifts onto OK -> click at 3.9
 const [hx,hy]=hgPos(r);
 if(r>1.65&&r<3.3){const fr=HG[Math.min(2,Math.floor(((r-1.6)%.75)/.25))],flip=Math.floor((r-1.6)/.75)%2;spr(flip?fr.slice().reverse():fr,hx-5,hy-7,1,{'X':'#000000','o':'#ffffff','s':'#e0b030'});}
 else if(r>=3.3&&r<4.08){const k=easeOut(seg(r,3.4,3.85));spr(CURSOR,Math.round(lerp(hx,474,k)),Math.round(lerp(hy,240,k)),1,{'X':'#000000','o':'#ffffff'});}
}
function travelC(t){
 const r=t-9.3,sh=r>0?R.shake(Math.floor(t*24),r<1.15?4:r<1.53?6:r<4.3?1:2,3):[0,0];
 R.drawPlate(R.ditherGrad('beachSky',640,200,['#1a0838','#3a0f5e','#7a1a7a','#c42a78','#ff6a5a','#ffb44a']),0,0,640,200);
 R.stars(g,t,21,40,0,0,640,100,['#ffffff','#ffd6f5'],.5);
 R.synthSun(470+sh[0],198+sh[1],64,t);
 for(let i=0;i<3;i++){const gx=((t-6.8)*26+i*120+60)%700-30,gy=56+i*20+Math.sin(t*2+i)*4,f=Math.sin(t*10+i*2)*3;
  strokePoly(g,[[gx-6,gy-f],[gx-3,gy-1],[gx,gy],[gx+3,gy-1],[gx+6,gy-f]],'#2b0f3d',1.6);}
 const k=ease(seg(t,6.8,9.3));
 R.withCam({x:lerp(320,290,k),y:lerp(180,200,k),z:1+.08*k,dx:sh[0],dy:sh[1]},()=>{
  R.vgrad(g,-40,200,720,66,[[0,'#3a1460'],[1,'#22093e']]);
  for(let i=0;i<13;i++){const y=203+i*4.6,w=64-i*4,x=470-w/2+Math.sin(t*3+i*1.7)*4;rect(g,x,y,w,1.3,'#ff9a6a');ga(.35,()=>rect(gg,x,y,w,1.3,'#ff9a6a'));}
  for(let i=0;i<8;i++){const x=(i*83+t*12)%700-30;rect(g,x,214+i%3*14,18,1,'rgba(255,180,200,.35)');}
  const sand=[[-40,262]];for(let x=-40;x<=680;x+=20)sand.push([x,262-6*Math.sin(x/120)+Math.sin(x/30+t)*.6]);sand.push([680,380],[-40,380]);
  g.save();const sg=g.createLinearGradient(0,255,0,360);sg.addColorStop(0,'#e89a6a');sg.addColorStop(1,'#7a3a5a');
  g.beginPath();sand.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=sg;g.fill();g.restore();
  const foam=[];for(let x=-40;x<=680;x+=10)foam.push([x,262-6*Math.sin(x/120)+Math.sin(x/30+t)*.6-1.5+Math.sin(x/17+t*2.5)*1.2]);
  strokePoly(g,foam,'rgba(255,240,230,.85)',1.4);
  for(let i=0;i<40;i++){const x=hash(i*3.1)*660-10,y=275+hash(i*7.7)*80;rect(g,x,y,1.4,1.4,'rgba(122,58,90,.5)');}
  palm(g,70,300,150,t,'#2b0f3d','#ff6a8a');
  palm(g,600,286,120,t+1,'#2b0f3d','#ff6a8a');
  const jolt=t>9.32;
  HER.portrait(g,250,206,.45,{outfit:'beach',pose:jolt?'shock':'drink',chair:'beach',seated:true,tilt:jolt?0:-.12,rim:'#ffb44a',
   expr:jolt?(r<2.8?'surprised':'worried'):'happy',mouth:jolt?(r<1.53?'shocked':r<2.8?'oh':'worried'):A.mouthAt('ahh',t-7.6),
   open:jolt?(((r>2.35&&r<2.45)||(r>2.55&&r<2.65)||(r>3.5&&r<3.6))?0:1):A.blinkAt(t,2),sweat:jolt&&r>2.8,t});
  // first RING: the cocktail leaves her hand, spins (two full turns) and lands upright on the crab, who scuttles off with it
  let cx=430+Math.sin(t*1.8)*24,cupOn=false;
  if(jolt){
   const [x0,y0]=HER.cupAt(250,206,.45,{tilt:-.12,t:9.3}),xl=430+Math.sin(10.1*1.8)*24+7,yl=296,arc=q=>[lerp(x0,xl,q),lerp(y0,yl,q)-360*q*(1-q)];
   if(r>=.8){cx=xl-7+(r-.8)*48;cupOn=true;}
   else{for(let i=4;i>=1;i--){const q=seg(r-i*.035,0,.8);if(q>0){const [dx,dy]=arc(q);ga(.6*(1-i/5),()=>rect(g,dx-1,dy-3,2.5,2.5,'#ffb347'));}}
    const u=seg(r,0,.8),[x,y]=arc(u);HER.drawCup(g,x,y,.45,u*Math.PI*4);}
  }
  spr(["#.....#","##...##",".#####.","#######","#.#.#.#"],cx,300,2,{'#':'#ff3f5a'});
  if(cupOn){HER.drawCup(g,cx+7,296-Math.abs(Math.sin(r*16))*1.5,.45,0);if(r<1.05)ga(1-seg(r,.8,1.05),()=>R.neonText('!',cx+7,276,'#ffe14a',2));}
 });
 if(t<7.36)vnTravel(t);
 else if(t>=7.44&&t<9.3)R.vnBox(g,20,292,600,58,'SOFIA',TXT.ahh,t-7.44,{words:words('ahh')});
 R.pixelate(36*(1-seg(t,6.8,7.0)));
 if(r<=0)return;
 // RING #1 (r 0-1.15) -> bigger RING #2 (1.2-1.53) -> VACATION.EXE box pops (1.53) with busy hourglass + crawling bar
 // -> NOT RESPONDING (2.8) -> mouse wiggle, arrow returns (3.3), clicks OK (3.9), box squashes (4.0-4.08) -> tracking glitch (4.3-4.8)
 const ring2=r>=1.2&&r<1.53,ringing=r<1.15||ring2;
 // red alarm wash: smooth 2.5 Hz pulse (a hard full-screen red strobe above 3 Hz is a photosensitivity hazard)
 if(r<1.53){const p=.5+.5*Math.cos(r*Math.PI*5);g.fillStyle=`rgba(255,40,60,${(.07+.15*p).toFixed(3)})`;g.fillRect(0,0,640,360);}
 const [ax,ay]=ringing?R.shake(Math.floor(t*24),ring2?6:4,7):[0,0],cr=ring2?44:34;
 if(ringing)R.speedLines(g,520,110,22,'#ffffff',.35,Math.floor(t*8),cr+14,420,.05);
 alarmClock(g,520+ax,110+ay,cr,t,!ringing);
 if(ringing){const s=ring2?'RING! RING!':'RING!',sc=ring2?6:5,pop=back(seg(r,ring2?1.2:0,ring2?1.3:.1));
  scaled(250,34,pop,pop,()=>R.neonText(s,250+ax,16+ay,'#ffe14a',sc,'#fff3a0'));}
 crashDialog(r);
 if(r>4.3)return {track:seg(r,4.3,4.8),noiseA:.006+.04*seg(r,4.3,4.8)};
 // dialog-legibility bloom dip: ease in/out instead of stepping (a step reads as a visible pop with no sound)
 if(r>1.43){const k=Math.min(seg(r,1.43,1.53),1-seg(r,4.05,4.3));return {bloom:lerp(.85,.5,k),halo:lerp(.22,.1,k)};}
}
function travel(t){return t<6.8?travelAB(t):travelC(t);}

/* ============================ RETURN (local 8.2–24.6) ============================ */
const SUBJ=['RE: Q3 PLAN','URGENT: BUDGET','FW: FW: FW: NOTES','ACTION REQUIRED','ALL HANDS RECAP','URGENT! PLS READ','RE: RE: ROADMAP','TIMESHEET DUE','NEW TOOLS UPDATE','HIGH PRIORITY','REMINDER: REVIEW'];
const MONTHS=['JAN','FEB','MAR','APR','MAY','JUN','JUL'],FLIPS=[12.07,12.2,12.37,12.5,12.67,12.8];
function stageCard(t){
 rect(g,0,0,640,360,'#05030f');R.stars(g,t,41,70,0,0,640,170,['#ffffff','#9ff6ff'],.5);
 rect(g,0,170,640,190,'#0a0620');R.synthGrid(t,170,'#35e7ff');
 if(R.blink(t,3))R.hudText('DAY 1',320,52,'#ffe14a',2,'center');
 if(t>8.4)R.logoText('STAGE 1',lerp(-200,320,back(seg(t,8.4,8.7))),82,5,{});
 if(t>8.9)typedC('THE RETURN',t-8.9,25,320,130,'#ff3fa4',3);
}
function officeRoom(t,noDesk){
 R.drawPlate(R.ditherGrad('wall',640,210,['#070b24','#0c1438','#16205a','#1e2a6a']),0,0,640,210);
 // window
 R.vgrad(g,24,26,152,138,[[0,'#120a3a'],[.6,'#5a2a7a'],[1,'#ff8a6a']]);
 R.stars(g,t,51,14,26,28,148,70,['#ffffff'],.4);
 circ(g,60,58,11,'#fff2c0');circ(g,65,54,10,'#2a1650');ga(.5,()=>circ(gg,60,58,13,'#fff2c0'));
 const sky=[[24,164],[24,140],[40,140],[40,124],[58,124],[58,132],[72,132],[72,110],[92,110],[92,128],[108,128],[108,118],[124,118],[124,136],[142,136],[142,122],[160,122],[160,142],[176,142],[176,164]];
 fillPoly(g,sky,'#1a1240');
 for(let i=0;i<16;i++){const x=28+hash(i*5.3)*140,y=126+hash(i*9.1)*34;if(hash(i+Math.floor(t*2)*.01)>.2)rect(g,x,y,2,2,'#ffd27a');}
 g.strokeStyle='#0a0f2a';g.lineWidth=4;g.strokeRect(24,26,152,138);g.lineWidth=2;g.beginPath();g.moveTo(100,26);g.lineTo(100,164);g.moveTo(24,95);g.lineTo(176,95);g.stroke();
 rect(g,18,162,164,6,'#2a3470');
 // circuits
 const CIR=[[[190,30],[260,30],[270,40],[360,40]],[[200,60],[300,60],[310,50],[420,50],[430,62],[540,62]],[[360,40],[380,20],[470,20],[480,30],[540,30]],[[250,78],[330,78],[340,70],[400,70]]];
 CIR.forEach((P,i)=>{strokePoly(g,P,'#1d6b8a',1.2);ga(.35,()=>strokePoly(gg,P,'#35e7ff',2.5));
  P.forEach(p=>rect(g,p[0]-1.5,p[1]-1.5,3,3,'#1d6b8a'));
  let L=0;const segs=[];for(let j=1;j<P.length;j++){const d=Math.hypot(P[j][0]-P[j-1][0],P[j][1]-P[j-1][1]);segs.push(d);L+=d;}
  let u=((t*60+i*47)%L);for(let j=1;j<P.length;j++){if(u<=segs[j-1]){const f=u/segs[j-1],x=lerp(P[j-1][0],P[j][0],f),y=lerp(P[j-1][1],P[j][1],f);rect(g,x-1.5,y-1.5,3,3,'#bff8ff');ga(.9,()=>circ(gg,x,y,4,'#35e7ff'));break;}u-=segs[j-1];}
 });
 // calendar
 rect(g,548,34,58,70,'#f2e9d8');rect(g,548,34,58,18,'#ff3f5a');rect(g,556,30,3,8,'#2a2a3a');rect(g,595,30,3,8,'#2a2a3a');
 let mi=0;FLIPS.forEach(f=>{if(t>=f)mi++;});
 putC(g,MONTHS[Math.min(mi,6)],577,39,'#ffffff',false,1);
 for(let r=0;r<4;r++)for(let c=0;c<6;c++){rect(g,553+c*8.5,58+r*10,6,7,(r*6+c)%5===2?'#ffb0bc':'#d8ccb8');}
 const lf=FLIPS.find(f=>t>=f&&t<f+.1);if(lf!=null){const p=(t-lf)/.1;fillPoly(g,[[548,34+70*p],[606,34+70*p],[606,34],[548,34]],'rgba(255,255,255,.55)');}
 // floor + desk
 R.vgrad(g,0,210,640,150,[[0,'#0b1030'],[1,'#05071a']]);
 if(noDesk)return;
 rect(g,232,202,408,8,'#3a2a5a');rect(g,232,202,408,2,'#6a5a9a');rect(g,262,210,10,150,'#2a1e44');rect(g,600,210,10,150,'#2a1e44');rect(g,232,210,408,4,'#1e1636');
}
function crt(t){
 rect(g,350,92,140,108,'#c8c0a8');rect(g,350,92,140,4,'#e8e0c8');rect(g,486,92,4,108,'#9a927a');
 rect(g,394,196,52,6,'#9a927a');
 rect(g,358,98,124,86,'#3a3630');
 rect(g,460,186,22,6,'#7a725a');for(let i=0;i<3;i++)rect(g,360+i*6,188,3,3,'#4dff9a');
}
function screen(t){
 const X=362,Y=102,Wd=116,Ht=78;
 if(t<13.56){
  rect(g,X,Y,Wd,Ht,'#04140c');
  PF.put(g,'MAIL V2.0',X+6,Y+6,'#4dff9a',false,1);
  if(t>11.4)PF.put(g,'HI SOFIA!',X+6,Y+18,'#4dff9a',false,1);
  if(t>11.6){PF.put(g,'SYNCING 6 MONTHS',X+6,Y+30,'#4dff9a',false,1);
   const v=seg(t,11.6,13.4);R.meter(g,X+6,Y+42,104,8,v,{segs:13,col:'#4dff9a'});
   PF.put(g,Math.round(v*100)+'%',X+6,Y+56,'#4dff9a',false,1);
   if(R.blink(t,3))rect(g,X+30,Y+56,5,7,'#4dff9a');}
  ga(.4,()=>rect(gg,X,Y,Wd,Ht,'rgba(77,255,154,.25)'));
 }else{
  rect(g,X,Y,Wd,Ht,'#160408');
  g.save();g.beginPath();g.rect(X+2,Y+30,Wd-4,Ht-32);g.clip();
  const off=40*Math.pow(t-13.56,2);const i0=Math.floor(off/9);
  for(let i=i0;i<i0+7;i++){const y=Y+32+i*9-off;PF.put(g,'!',X+4,y,'#ff3f5a',false,1);PF.put(g,SUBJ[i%SUBJ.length],X+11,y,i%3===0?'#fff3a0':'#ffd0d8',false,1);}
  g.restore();
  // the insert zooms ~3.4x, which magnifies glow: keep the red bloom faint and the flash inside the bezel
  ga(.12,()=>rect(gg,X,Y,Wd,Ht,'rgba(255,63,90,.22)'));
  if(t<13.7){const a=.3*(1-seg(t,13.56,13.7));ga(a,()=>{rect(g,X,Y,Wd,Ht,'#ff3f5a');rect(gg,X,Y,Wd,Ht,'#ff3f5a');});}
  // header drawn after the flash on its own dark plate so the counter stays legible; it starts mid-count so it never reads 0
  const n=Math.round(lerp(1200,4812,easeOut(seg(t,13.56,14.25))));   // lands on 4,812 before the cut so the room badge matches
  rect(g,X+2,Y+2,Wd-4,27,'#0a0204');rect(gg,X,Y,Wd,30,'#000000');   // black on gg = no red bloom bleeding over the counter
  PF.put(g,'UNREAD:',X+6,Y+4,'#ffe14a',true,1);PF.put(g,n.toLocaleString('en-US'),X+6,Y+13,'#ffffff',true,2);
 }
 R.screenFX(g,X,Y,Wd,Ht,{scan:.25,vig:.5});
}
function deskProps(t){
 rect(g,262,194,112,7,'#d8d0b8');rect(g,262,194,112,1,'#f2ead2');for(let r=0;r<2;r++)for(let i=0;i<14;i++)rect(g,265+i*7.8,196+r*2.4,6,1.6,'#a8a088');
 rect(g,556,186,14,16,'#ff6a8a');rect(g,570,190,4,7,'#ff6a8a');rect(g,558,188,10,2,'#5a2a1a');
 for(let i=0;i<3;i++){const ph=(t*.8+i/3)%1;ga(1-ph,()=>circ(g,561+Math.sin(ph*6+i)*3,182-ph*20,1.6,'rgba(255,255,255,.6)'));}
}
const FLOP=["########","#.####.#","#.####.#","#......#","#.####.#","########"];
/* desk seen from the monitor's point of view: the camera sits on it, so it runs from Sofia's waist to the frame bottom */
function povDesk(t,alert,typing){
 R.vgrad(g,0,206,640,154,[[0,'#3a2c5e'],[.3,'#271c44'],[1,'#0e0a1e']]);
 rect(g,0,203,640,3,'#7a6aaa');rect(g,0,206,640,2,'#1a1232');
 ga(.14,()=>fillPoly(g,[[236,208],[404,208],[520,360],[120,360]],alert?'#ff3f5a':'#4dff9a'));
 // six months of paper backlog
 rect(g,62,231,108,7,'#5a4a8a');rect(g,62,231,108,2,'#8a7ac0');
 for(let i=0;i<24;i++){const y=228-i*3.4,x=72+Math.sin(i*1.7)*4+(hash(i*3.1)-.5)*6;rect(g,x,y,86,3,i%2?'#ece4d0':'#d6ceb8');rect(g,x,y+3,86,.7,'#8a826e');}
 rect(g,150,158,10,13,'#ffe14a');rect(g,66,186,9,12,'#ff6a8a');rect(g,154,204,9,10,'#35e7ff');
 // mug
 rect(g,204,203,18,23,'#ff6a8a');rect(g,222,208,6,11,'#ff6a8a');rect(g,224,210,2,7,'#271c44');
 rect(g,206,205,14,2,'#5a2a1a');rect(g,204,224,18,2,'#c04a6a');rect(g,207,208,3,13,'#ffa0b8');
 for(let i=0;i<3;i++){const ph=(t*.8+i/3)%1;ga(1-ph,()=>circ(g,213+Math.sin(ph*6+i)*3,199-ph*22,1.8,'rgba(255,255,255,.6)'));}
 // keyboard (perspective slab, keys light up while she types)
 fillPoly(g,[[257,211],[383,211],[397,239],[243,239]],'#141026');
 fillPoly(g,[[259,212],[381,212],[394,236],[246,236]],'#d8d0b8');
 fillPoly(g,[[246,236],[394,236],[395,239],[245,239]],'#8a826a');rect(g,259,212,122,1,'#f2ead2');
 const hot=typing?Math.floor(t*16):-1;
 for(let r=0;r<4;r++){const f=(r+.5)/4.4,y=214+r*5.3,xl=lerp(261,248,f),xr=lerp(379,392,f),kw=(xr-xl)/14;
  if(r===3){rect(g,xl+kw*3.5,y,kw*7,3.6,'#a8a088');continue;}
  for(let i=0;i<14;i++){const on=hot>=0&&Math.floor(hash(hot*1.3+r*7.7)*14)===i;rect(g,xl+i*kw+.6,y,kw-1.2,3.6,on?'#ffffff':'#a8a088');}}
 // mouse + floppies
 strokePoly(g,[[408,226],[411,214],[404,207]],'#1a1232',1.2);circ(g,408,233,7,'#d8d0b8');rect(g,407,226,2,5,'#a8a088');
 [['#3a5aff',436,222],['#ff3fa4',441,216],['#ffe14a',437,210]].forEach(([c,x,y])=>spr(FLOP,x,y,2,{'#':c,'.':'#e8e8ff'}));
 // welcome-back tent card + plant
 fillPoly(g,[[478,232],[488,206],[542,206],[552,232]],'#f2e9d8');rect(g,488,206,54,2,'#ffffff');
 PF.put(g,'WELCOME',515-PF.textW('WELCOME',1)/2,211,'#ff3fa4',false,1);PF.put(g,'BACK!',515-PF.textW('BACK!',1)/2,221,'#3a5aff',false,1);
 fillPoly(g,[[584,214],[612,214],[608,236],[588,236]],'#c8643a');rect(g,582,212,32,4,'#e07b4a');
 [[598,212,-.5],[598,212,.2],[598,212,.9],[598,212,-1.2]].forEach(([x,y,a],i)=>{const L=22+i*3,ex=x+Math.sin(a)*L,ey=y-Math.cos(a)*L;
  fillPoly(g,[[x-2,y],[ex,ey],[x+2,y]],i%2?'#3e8e5e':'#5ac07a');});
}
function office(t,o){
 // screen-space stamp waits for the pull-back (never over the insert); its slam (+.13 s) lands on the VO word "behind"
 const T0=14.5,sh=(t>T0+.12&&t<T0+.5)?R.shake(Math.floor(t*24),3,9):[0,0];
 const typing=t<13.56,shock=!typing&&t<16.9,desk=typing||!shock;
 if(t>=13.4&&t<14.4){
  // insert: snap into her CRT as the inbox explodes
  const z=t<13.5?lerp(2.4,3.3,easeOut(seg(t,13.4,13.5))):lerp(3.3,3.5,seg(t,13.5,14.4));
  R.withCam({x:420,y:151,z},()=>{officeRoom(t);crt(t);screen(t);deskProps(t);});
 }else{
  // the camera is her monitor: she faces us, hands on the keyboard
  const pre=t<13.4,z=pre?lerp(1,1.03,ease(seg(t,11.2,13.4))):lerp(1.14,1.02,easeOut(seg(t,14.4,15.2)));
  const cy=pre?180:lerp(160,180,easeOut(seg(t,14.4,15.2))),PY=120+(typing?Math.sin(t*9)*.5:0);
  const her={chair:'office',seated:true,look:0,turn:0,t,rim:typing?'#4dff9a':'#ff3f5a',
   pose:typing?'type':(shock?'shock':'relax'),
   // after the shock her hands drop back onto the keys and rest there (tt freezes the finger taps with every fingertip down)
   armL:desk?{a1:104,a2:26,f1:.9,f2:.59,hand:'key',off:40,hs:.9,tt:typing?undefined:.224}:undefined,
   armR:desk?{a1:76,a2:154,f1:.9,f2:.59,hand:'key',off:-40,hs:.9,tt:typing?undefined:.224}:undefined,
   expr:typing?'smile':shock?'surprised':'panting',sweat:!typing&&!shock,open:A.blinkAt(t,3)};
  R.withCam({x:320,y:cy,z,dx:sh[0],dy:sh[1]},()=>{
   officeRoom(t,true);
   HER.portrait(g,320,PY,.46,her);
   povDesk(t,!typing,typing);
   if(desk)HER.portrait(g,320,PY,.46,Object.assign({},her,{armsOnly:true}));
  });
  if(pre&&t>11.3){
   const s=easeOut(seg(t,11.3,11.45));
   scaled(492,150,1,s,()=>{
    const b=R.win(g,404,104,176,92,'MAIL V2.0',{theme:'vapor'});
    if(t>11.4)PF.put(g,'HI SOFIA!',b.x+6,b.y+4,'#4dff9a',true,1);
    if(t>11.6){PF.put(g,'SYNCING 6 MONTHS',b.x+6,b.y+18,'#4dff9a',true,1);
     const v=seg(t,11.6,13.4);R.meter(g,b.x+6,b.y+32,b.w-12,8,v,{segs:13,col:'#4dff9a'});
     PF.put(g,Math.round(v*100)+'%',b.x+6,b.y+46,'#ffffff',true,1);
     if(R.blink(t,3))rect(g,b.x+32,b.y+46,5,7,'#4dff9a');}
   });
  }
  if(t>=14.4&&t<14.5)ga(.35*(1-seg(t,14.4,14.5)),()=>rect(g,0,0,640,360,'#ffe2c4'));
 }
 if(t>T0&&t<16.9){
  const a=1-seg(t,16.7,16.9);
  ga(a,()=>R.stamp(g,'6 MONTHS BEHIND',320+sh[0],250+sh[1],t-T0,{sc:2,col:'#ff3f5a',rot:-.06,fill:'rgba(20,4,16,.85)'}));
  // the damage report: a left-hand column of counters (clear of her head and the wall calendar) once the stamp has landed
  [['✉ 4,812 UNREAD','#ff3f5a',18,14.95],['MEETINGS: 214','#ff3fa4',51,15.2],['CLASHES: 37','#ff9a3c',84,15.45]].forEach(([s,col,y,t0])=>{
   if(t<t0)return;const k=back(seg(t,t0,t0+.15));
   ga(a,()=>scaled(20,y+7,k,k,()=>R.hudText(s,20,y,col,2,'left',{edge:col})));
  });
 }
 if(t>16.9){
  const s=easeOut(seg(t,16.9,17.04));
  scaled(80,12,1,s,()=>{
   const b=R.win(g,16,12,128,116,'SOFIA',{theme:'vapor',body:'#1a0a36'});
   R.halftone(g,b.x,b.y,b.w,b.h,'#ff3fa4',(x,y)=>clamp((y-b.y)/b.h,0,1)*.6,5);
   HER.portrait(g,80,122,.5,{clip:[b.x,b.y,b.w,b.h],noGlow:true,expr:'panting',sweat:true,open:A.blinkAt(t,3),look:.2,t,rim:'#ff3fa4'});
  });
  scaled(514,50,1,s,()=>{
   R.win(g,404,12,220,76,'STATUS',{theme:'vapor'});
   PF.put(g,'SOFIA',412,31,'#fff3a0',true,1);const lv='LV 1';PF.put(g,lv,616-PF.textW(lv,1),31,'#ffffff',true,1);
   PF.put(g,'HP',412,42,'#ffffff',true,1);if(t<17.16||R.blink(t,4))R.meter(g,432,42,120,6,.3,{col:'#ff3f5a'});
   PF.put(g,'STATUS: JET-LAGGED',412,53,'#ff9a3c',true,1);
   // blink as an inverse-video highlight (classic menu cursor) so the key line never vanishes from the frame
   const md='MODE: CATCH-UP',inv=t>=17.63&&R.blink(t,3);
   if(inv)rect(g,410,62,PF.textW(md,1)+4,11,'#35e7ff');
   PF.put(g,md,412,64,inv?'#1a0a36':'#35e7ff',inv?null:true,1);
  });
 }
 R.blinds(1-seg(t,11.2,11.45),'#000000');
}
const ENV=["########","##....##","#.#..#.#","#..##..#","#......#","########"];
const CALI=[".#....#.","########","#......#","#.#.#.##","#......#","#.#.#..#","########"];
const CHAT=[".#######.","#.......#","#.#.#.#.#","#.......#",".#######.","..#......",".#......."];
function burst(G,cx,cy,n,r,c1,c2,rot){
 G.save();G.fillStyle=c1;G.fillRect(cx-r,cy-r,r*2,r*2);G.fillStyle=c2;
 for(let i=0;i<n;i++){const a0=rot+i*Math.PI*2/n,a1=a0+Math.PI/n;G.beginPath();G.moveTo(cx,cy);G.lineTo(cx+Math.cos(a0)*r,cy+Math.sin(a0)*r);G.lineTo(cx+Math.cos(a1)*r,cy+Math.sin(a1)*r);G.closePath();G.fill();}
 G.restore();
}
function bustScene(t){
 R.vgrad(g,0,0,640,360,[[0,'#120a2e'],[1,'#2a0f4a']]);
 g.save();g.beginPath();g.arc(190,150,250,0,Math.PI*2);g.clip();burst(g,190,150,18,260,'#1e0a3e','#4a1050',t*.15);g.restore();
 R.halftone(g,0,0,420,330,'#ff3f5a',(x,y)=>clamp(1-Math.hypot(x-190,y-150)/230,0,1)*.4,6);
 R.halftone(g,330,0,310,300,'#35e7ff',(x,y)=>clamp(1-Math.hypot(x-470,y-150)/190,0,1)*.55,6);
 R.speedLines(g,470,150,40,'#35e7ff',.22,Math.floor(t*8),120,520,.05);
 const late=Math.max(0,t-22.4);
 [[ENV,'#ffe14a'],[CALI,'#ff3fa4'],[CHAT,'#35e7ff']].forEach(([S,col],i)=>{
  const a=t*1.2+late*late*2.2+i*2.094,x=470+Math.cos(a)*120,y=150+Math.sin(a)*62,s=3+Math.sin(a)*.6;
  const w=S[0].length*s,h=S.length*s;
  rect(g,x-w/2-3,y-h/2-3,w+6,h+6,'rgba(10,6,30,.75)');spr(S,x-w/2,y-h/2,s,{'#':col});
  ga(.5,()=>rect(gg,x-w/2-2,y-h/2-2,w+4,h+4,col));
 });
 const expr=t<22.4?'smile':'surprised';
 HER.portrait(g,190,170+Math.sin(t*6)*1.5,.57,{pose:'card',rim:'#35e7ff',expr,sweat:t>=22.4,mouth:A.mouthAt('good',t-20.0),open:A.blinkAt(t,5),t});
 if(t>22.4){
  R.gloom(g,t,0,W,140,'#0a0418',.85*seg(t,22.4,22.7));
  const k=back(seg(t,22.45,22.7)),s='?!',sc=Math.max(1,Math.round(6*k));
  PF.putBig(g,s,560-PF.textW(s,sc)/2,46-Math.abs(Math.sin(t*9))*4,'#ffe14a','#000000',sc);
 }
 R.pixelate(30*(1-seg(t,19.7,19.9)));
}
function ret(t,o={}){
 if(t<11.2)stageCard(t);
 else if(t<19.7)office(t,o);
 else bustScene(t);
 if(!o.noBox){
  const B=(k,t0,name='',y=276,h=80)=>R.vnBox(g,16,y,608,h,name,TXT[k],t-t0,{words:words(k)});
  if(t>=8.44&&t<12.6)B('back',8.44);
  else if(t>=13.95&&t<16.0)B('behind',13.907);
  else if(t>=16.9&&t<19.1)B('mode',16.907);
  else if(t>=19.7)B('good',19.84,'SOFIA',270,82);
 }
}

/* ============================ shared credit text ============================ */
function credit(G,s,cx,y,col,sc){
 if(PF.hasLower){putC(G,s,cx,y,col,true,sc);return;}
 G.save();G.font='bold '+(7*sc+2)+'px "Lucida Console","Courier New",monospace';G.textAlign='center';G.textBaseline='top';
 G.fillStyle='#000000';G.fillText(s,cx+1,y+1);G.fillStyle=col;G.fillText(s,cx,y);G.restore();
}

window.S={title,travel:t=>travel(t-1.0),ret:(t,o)=>ret(t-4.9,o),PIN_T,TXT,
 U:{fillPoly,strokePoly,rect,spr,ga,scaled,circ,putC,typedC,words,officeRoom,povDesk,crt,screen,deskProps,burst,ENV,CALI,CHAT,FLOP,palm,alarmClock,credit,CURSOR}};
})();
