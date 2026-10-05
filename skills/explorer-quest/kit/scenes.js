// scenes.js - The Great Copilot Quest (explorer cut). Scenes take absolute t in seconds.
(function(){
const {TAU,W,H,clamp,lerp,ease,easeOut,easeIn,back,seg,rgba,mix,pulse,vgrad,path,poly,cel,line,airbrush,sparkle,hash}=R;
const M=window.MAP, HE=window.HER;

function cueT(k){ if(typeof VO_CUES==='undefined') return 0; const c=VO_CUES.find(v=>v[0]===k); return c?c[1]/30:0; }
function wt(k,i){ const v=window.VT&&VT[k]; if(!v||!v.words.length) return cueT(k)+i*.3; return cueT(k)+v.words[Math.min(i,v.words.length-1)][0]; }
function mouthAt(k,t){
  const v=window.VT&&VT[k]; if(!v) return undefined; const c=cueT(k), ws=v.words;
  for(let i=0;i<ws.length;i++){ const s=c+ws[i][0], nx=i+1<ws.length?c+ws[i+1][0]:s+1, e=Math.min(nx,s+.12+.06*String(ws[i][1]).length);
    if(t>=s&&t<e) return ['talk','oh','smileopen'][Math.floor((t-s)/.09)%3]; }
  return undefined;
}
function blinkAt(t,seed){ return (((t+seed)%3.1)+3.1)%3.1<.1?0:1; }
function fillAll(fn){ for(const G of [R.g,R.gg]){ G.save(); G.setTransform(R.K,0,0,R.K,0,0); G.globalAlpha=1; G.globalCompositeOperation='source-over'; fn(G,G===R.gg); G.restore(); } }
function bars(a){ if(a>0) fillAll(G=>{ G.globalAlpha=Math.min(1,a); G.fillStyle='#000'; G.fillRect(0,0,W,36); G.fillRect(0,H-36,W,36); }); }
function fadeBlack(a){ if(a>0) fillAll(G=>{ G.globalAlpha=Math.min(1,a); G.fillStyle='#000'; G.fillRect(0,0,W,H); }); }
function ls(G,v){ try{ G.letterSpacing=v; }catch(e){} }
function cap(t,parts,o={}){
  const g=R.g; g.save(); g.setTransform(R.K,0,0,R.K,0,0); g.globalCompositeOperation='source-over';
  g.font=o.say?'italic bold 17px "Bookman Old Style", Georgia, serif':'bold 17px Rockwell, Georgia, serif'; ls(g,o.say?'0px':'1px');
  g.textAlign='left'; g.textBaseline='alphabetic'; g.lineJoin='round';
  const y=o.y||342, gap=g.measureText(' ').width+2, ws=parts.map(p=>g.measureText(p[0]).width);
  let x=320-(ws.reduce((a,b)=>a+b,0)+gap*(parts.length-1))/2; const out=o.out!=null?1-seg(t,o.out,o.out+.2):1;
  for(let i=0;i<parts.length;i++){ const r=seg(t,parts[i][1],parts[i][1]+.15), a=r*out;
    if(a>0){ g.globalAlpha=a; const yy=y+4*(1-r); g.strokeStyle='#1a0f06'; g.lineWidth=4; g.strokeText(parts[i][0],x,yy); g.fillStyle='#f6ecd2'; g.fillText(parts[i][0],x,yy); }
    x+=ws[i]+gap; }
  g.restore();
}
function goldText(s,x,y,size,a=1,sc=1,o={}){
  if(a<=0||sc<=0) return; const d=Math.max(1,size*.035);
  for(const G of [R.g,R.gg]){ G.save(); G.setTransform(R.K,0,0,R.K,0,0); G.globalCompositeOperation='source-over';
    G.translate(x,y); G.scale(sc,sc); G.font=`900 ${size}px "Rockwell Extra Bold", Rockwell, Georgia, serif`; ls(G,(o.ls??1)+'px');
    G.textAlign='center'; G.textBaseline='alphabetic'; G.lineJoin='round';
    if(G===R.g){ G.globalAlpha=a; G.fillStyle='#3a2208'; for(let i=3;i>=1;i--) G.fillText(s,i*d*.6,i*d);
      G.strokeStyle='#2a1606'; G.lineWidth=size*.12; G.strokeText(s,0,0);
      const gr=G.createLinearGradient(0,-size*.78,0,0); gr.addColorStop(0,'#fff1bf'); gr.addColorStop(.48,'#f2c45a'); gr.addColorStop(.52,'#d29a32'); gr.addColorStop(1,'#9a6418');
      G.fillStyle=gr; G.fillText(s,0,0);
    } else { G.globalAlpha=a*(o.glow??.3); G.fillStyle='#ffb43a'; G.fillText(s,0,0); }
    G.restore(); }
}
function textW(s,font,spacing){ const g=R.g; g.save(); g.font=font; ls(g,spacing||'0px'); const w=g.measureText(s).width; g.restore(); return w; }
function motes(t,n,box,col='#ffd890',seed=1,a=1){
  const [x0,y0,w,h]=box||[0,36,W,H-72];
  for(let i=0;i<n;i++){ const r1=hash(i*7.13+seed), r2=hash(i*3.31+seed*2.7), r3=hash(i*1.77+seed*5.1);
    const x=x0+(((r1*w+t*(5+r3*9)+Math.sin(t*.7+i)*6)%w)+w)%w, y=y0+(((r2*h-t*(3+r3*5))%h)+h)%h;
    const al=a*(.25+.55*(.5+.5*Math.sin(t*(2+r3*3)+i*1.3))), s=.9+r3*1.1;
    R.g.fillStyle=rgba(col,al); R.g.fillRect(x-s/2,y-s/2,s,s); airbrush(R.gg,x,y,2.5+r3*3,2.5+r3*3,col,al*.6); }
}
function barText(l,r,a){ if(a<=0) return; const g=R.g; g.save(); g.setTransform(R.K,0,0,R.K,0,0); g.globalAlpha=a;
  g.font='bold 10px "Bookman Old Style", Georgia, serif'; ls(g,'2px'); g.fillStyle='#e8c26a'; g.textBaseline='middle';
  g.textAlign='left'; g.fillText(l,24,19); g.textAlign='right'; g.fillText(r,616,19); g.restore(); }

// ---- 0-6.2 s: parchment map, route draws stop by stop
function map(t){
  M.drawMap(t,M.mapCam(t),{});
  bars(1);
  M.hud(t,seg(t,.4,1)*(1-seg(t,5.5,5.8)));
  const w=i=>wt('open',i)-.05;
  cap(t,[['SIX',w(0)],['MONTHS\u2026',w(1)],['OFF',w(2)],['THE',w(3)],['MAP',w(4)]],{out:5.6});
  fadeBlack(1-seg(t,0,.6));
  return {flick:lerp(.4,.025,seg(t,0,1.2))};
}
// ---- 10.8-16 s: polaroids, the long road home
function home(t){
  M.drawMap(t,M.homeCam(t),{polaroids:true,home:true});
  bars(1);
  M.hud(t,seg(t,10.9,11.3)*(1-seg(t,15.2,15.6)));
  const w=i=>wt('home',i)-.05;
  if(t<13.4) cap(t,[['12',w(0)],['COUNTRIES',w(1)],['\u00b7',w(1)+.2],['1',w(2)],['EXPLORER',w(3)]],{out:13.15});
  cap(t,[['AND',w(4)],['NOW\u2026',w(5)],['THE',w(6)],['LONG',w(7)],['ROAD',w(8)],['HOME',w(9)]],{out:15.6});
  return {};
}
// ---- 6.2-10.8 s: Angkor at sunrise. Parallax: far .25, pool .35, mid .5, Sofia .7, near 1.2
const TOWERS=[[230,110,40],[175,150,30],[285,150,30],[135,175,24],[325,175,24]];
const TW=[[0,.5],[.25,.5],[.5,.56],[.72,.42],[.9,.2],[1,0]];
function towerPts(cx,top,bw){ const h=226-top, P=(f,w)=>[cx+w*bw,226-h*f];
  return [[cx-bw/2,226,1],P(.25,-.5),P(.5,-.56),P(.72,-.42),P(.9,-.2),[cx,top,1],P(.9,.2),P(.72,.42),P(.5,.56),P(.25,.5),[cx+bw/2,226,1]]; }
function towerHW(f,bw){ for(let i=1;i<TW.length;i++) if(f<=TW[i][0]){ const a=TW[i-1],b=TW[i]; return bw*lerp(a[1],b[1],(f-a[0])/(b[0]-a[0])); } return 0; }
function templeShape(G,col,dx,dy){
  G.save(); G.translate(dx,dy); G.fillStyle=col;
  G.fillRect(30,250,400,15); G.fillRect(55,238,350,12); G.fillRect(80,226,300,12);
  for(const [cx,top,bw] of TOWERS) G.fill(path(towerPts(cx,top,bw)));
  G.restore();
}
function temple(){
  const g=R.g;
  templeShape(g,'#ffb44a',-.7,-.9); templeShape(g,'#ffb44a',.7,-.9); templeShape(g,'#4a2a32',0,0);
  g.fillStyle='#2e1820';
  for(const [cx,top,bw] of TOWERS){ const h=226-top;
    for(const f of [.16,.3,.43,.55,.66,.76,.85]){ const hw=towerHW(f,bw)-1.6; if(hw>0) g.fillRect(cx-hw,226-h*f,hw*2,.8); } }
  for(const [y,x0,x1] of [[250,30,430],[238,55,405],[226,80,380]]) g.fillRect(x0,y+4,x1-x0,.7);
  g.fillStyle='#2a1620';
  const door=(x,y,h)=>{ g.fillRect(x-2.5,y-h+2.5,5,h-2.5); g.beginPath(); g.arc(x,y-h+2.5,2.5,Math.PI,0); g.fill(); };
  for(const x of [70,130,190,270,330,390]) door(x,265,8);
  for(const x of [110,170,290,350]) door(x,250,7);
  door(230,238,8);
  templeShape(R.gg,'rgba(255,150,60,.35)',0,-1.4); templeShape(R.gg,'rgba(0,0,0,.85)',0,0);
}
function far(t,refl){
  const g=R.g, gg=R.gg;
  vgrad(g,-30,0,W+60,272,[[0,'#2a1f45'],[.35,'#6b3358'],[.62,'#c4544f'],[.82,'#f08a3c'],[1,'#ffd27a']]);
  airbrush(gg,215,250,300,50,'#ff9a4a',.18);
  if(!refl) for(let i=0;i<26;i++){ const x=hash(i*5.1)*W, y=40+hash(i*2.3)*60, a=.15+.2*(.5+.5*Math.sin(t*3+i));
    g.fillStyle=rgba('#ffe8c0',a*(1-y/110)); g.fillRect(x,y,1,1); }
  for(const [x,y,w,h,c] of [[90,92,150,7,'#7a3a5e'],[420,70,190,8,'#6a3358'],[560,128,140,6,'#b4505a'],[330,142,120,5,'#d8664c'],[60,160,110,5,'#e0784a'],[480,184,160,6,'#f09048']]){
    const xx=x+t*2.2; g.fillStyle=c; g.beginPath(); g.ellipse(xx,y,w/2,h,0,0,TAU); g.fill();
    g.fillStyle=rgba('#ffc070',.45); g.beginPath(); g.ellipse(xx+3,y+h*.5,w*.4,h*.32,0,0,TAU); g.fill(); }
  airbrush(g,215,170,140,115,'#ffb060',.5); airbrush(g,215,170,74,74,'#ffe0a0',.55);
  g.fillStyle='#fff0c0'; g.beginPath(); g.arc(215,170,46,0,TAU); g.fill();
  airbrush(gg,215,170,120,100,'#ffcf80',.8); gg.fillStyle=rgba('#ffe6b0',.9); gg.beginPath(); gg.arc(215,170,46,0,TAU); gg.fill();
  for(const [G,al] of [[gg,.1],[g,.035]]){ G.fillStyle=rgba('#ffd890',al);
    for(let i=0;i<12;i++){ const a=i*TAU/12+t*.05, d=.055+.02*Math.sin(i*2.1);
      G.beginPath(); G.moveTo(215,170); G.lineTo(215+Math.cos(a-d)*420,170+Math.sin(a-d)*420); G.lineTo(215+Math.cos(a+d)*420,170+Math.sin(a+d)*420); G.fill(); } }
  temple();
}
function ruinsBack(t,lay){
  lay(.25,()=>far(t,false));
  lay(.35,()=>{
    for(const G of [R.g,R.gg]){ G.save(); G.beginPath(); G.rect(-40,265,W+80,70); G.clip(); G.translate(0,265); G.scale(1,-.36); G.translate(0,-265); }
    far(t,true);
    for(const G of [R.g,R.gg]) G.restore();
    const g=R.g, gg=R.gg;
    g.fillStyle=rgba('#24142e',.55); g.fillRect(-40,265,W+80,70); gg.fillStyle='rgba(0,0,0,.45)'; gg.fillRect(-40,265,W+80,70);
    g.fillStyle=rgba('#ffb070',.45); g.fillRect(-40,265,W+80,.8);
    for(let i=0;i<30;i++){ const y=268+(i*7.3)%56, w=10+hash(i+3)*26, x=((hash(i)*W+t*6*(i%2?1:-1))%W+W)%W;
      g.fillStyle=rgba('#ffcf8a',.14+.12*Math.sin(t*2+i)); g.fillRect(x,y,w,.7); }
    for(let j=0;j<20;j++){ const w=(15-j*.6)*(.45+.55*(.5+.5*Math.sin(t*9+j*1.7)));
      g.fillStyle=rgba('#fff0c0',.7); g.fillRect(215-w/2+Math.sin(t*3+j)*2,267+j*2.6,w,.9); }
    airbrush(gg,215,284,22,16,'#ffd890',.5);
  });
}
// foliage: cel silhouettes, painted black on the glow layer so they occlude the sun
function sil(P,col,rim){ const p=cel(R.g,P,{f:col,rim}); R.gg.fillStyle='#000'; R.gg.fill(p); return p; }
function frond(x,y,a,len,col,rc){
  const ex=x+Math.cos(a)*len, ey=y+Math.sin(a)*len*.55+len*.42, cx=x+Math.cos(a)*len*.62, cy=y+Math.sin(a)*len*.62-len*.14, A=[], B=[];
  for(let i=0;i<=12;i++){ const u=i/12, m=1-u, px=m*m*x+2*m*u*cx+u*u*ex, py=m*m*y+2*m*u*cy+u*u*ey;
    const dx=m*(cx-x)+u*(ex-cx), dy=m*(cy-y)+u*(ey-cy), dl=Math.hypot(dx,dy)||1, w=len*.12*Math.pow(Math.sin(Math.PI*u),.6)*(i%2?1:.4);
    A.push([px-dy/dl*w,py+dx/dl*w,1]); B.push([px+dy/dl*w*.8,py-dx/dl*w*.8,1]); }
  sil(A.concat(B.reverse()),col,{c:rc,d:[0,1.6]});
}
function palm(x,y,h,lean,t,seed,col,rc){
  const sw=Math.sin(t*1.2+seed)*1.6, tx=x+lean+sw, ty=y-h, A=[], B=[];
  for(let i=0;i<=8;i++){ const u=i/8, px=lerp(x,tx,u)+Math.sin(u*Math.PI)*lean*.35, py=lerp(y,ty,u), w=lerp(4.6,2.4,u)+(i%2)*.5;
    A.push([px-w,py,1]); B.push([px+w,py,1]); }
  sil(A.concat(B.reverse()),col,{c:rc,d:[x>215?1.5:-1.5,0]});
  for(let k=0;k<8;k++) frond(tx,ty,-Math.PI/2+(k-3.5)*.5+Math.sin(t*1.1+k*.9+seed)*.05,h*.42*(.8+.4*hash(k*3.3+seed)),col,rc);
  R.g.fillStyle=col; R.g.beginPath(); R.g.arc(tx,ty+2,4.5,0,TAU); R.g.fill();
}
function jungle(x0,x1,yTop,side,seed,col,rc){
  const P=[[x0,362,1]], n=16;
  for(let i=0;i<=n;i++){ const u=i/n, pr=side<0?1-u:u;
    P.push([lerp(x0,x1,u),lerp(300,yTop,Math.pow(pr,.7))-9*Math.abs(Math.sin(u*11+seed))]); }
  P.push([x1,362,1]);
  sil(P,col,{c:rc,d:[side<0?-2:2,2]});
}
function vine(x0,len,ph,t){
  const g=R.g, pts=[];
  for(let j=0;j<=6;j++){ const u=j/6; pts.push([x0+Math.sin(j*.8+ph+t*.8)*4*u,30+len*u]); }
  line(g,pts,'#1c1016',2);
  for(let y=44,j=0;y<30+len-4;y+=13,j++){ const u=(y-30)/len, vx=x0+Math.sin(u*6*.8+ph+t*.8)*4*u, s=j%2?1:-1;
    sil([[vx,y,1],[vx+s*5,y+1],[vx+s*9,y+5,1],[vx+s*4,y+6]],'#1c1016',{c:'#ff9a4a',d:[0,1.2]}); }
}
function ruinsFront(t,lay){
  lay(.5,()=>{
    jungle(-40,100,150,-1,1.3,'#2e1a22','#ff9a4a');
    jungle(500,690,120,1,4.1,'#2e1a22','#ff9a4a');
    palm(66,262,150,14,t,2,'#24141c','#ff9a4a');
    palm(528,282,196,-22,t,5,'#24141c','#ff9a4a');
    palm(612,276,150,-8,t,8,'#24141c','#ff9a4a');
  });
  lay(.7,()=>{
    const ex=t<6.9?'dreamy':t<8.94?'smile':'happy';
    HE.portrait(R.g,420,196+Math.sin(t*2)*.8,.56,{outfit:'explorer',pose:'compass',noLegs:true,rim:'#ffb44a',expr:ex,
      mouth:mouthAt('best',t),open:blinkAt(t,.7),t,turn:lerp(-1,0,ease(seg(t,6.6,7.2)))});
    const p=pulse(t,8.94,.5); if(p>0) sparkle(R.g,456,200,10*p,'#fff4c8',p);
  });
  lay(1.2,()=>{
    const g=R.g;
    sil([[288,362,1],[288,292,1],[296,284,1],[350,285],[420,283],[500,286],[580,284],[690,285,1],[690,362,1]],'#3a2228',{c:'#c8784a',d:[0,2.5]});
    g.fillStyle='#24141a'; for(const x of [360,452,548,640]) g.fillRect(x,292,1.2,32); g.fillRect(288,306,402,1.2);
    line(g,[[318,290],[324,298],[321,304]],'#1c1016',1); line(g,[[497,288],[503,296],[512,299]],'#1c1016',1);
    g.fillStyle=rgba('#c8784a',.25); for(let i=0;i<14;i++) g.fillRect(300+hash(i*2.7)*380,292+hash(i*5.3)*30,2+hash(i)*4,.8);
    sil([[-30,30,1],[34,30,1],[34,362,1],[-30,362,1]],'#2a1a20',{c:'#ff9a4a',d:[-2,0]});
    g.fillStyle='#1e1218'; for(const y of [92,98,226,232]) g.fillRect(-30,y,64,2);
    for(const [x0,len,ph] of [[24,120,0],[58,70,1.7],[600,90,3.1],[636,140,4.4]]) vine(x0,len,ph,t);
  });
}
// luggage tag on a string from the top bar: drops in on "Sabbatical" (back-ease = fastest at the start, so the drop
// starts 2 f before the word and the 'tag' SFX sits on it), then swings and settles
function tag(t){
  if(t<7.74) return;
  const oy=lerp(-120,0,back(seg(t,7.74,8.19))), D=Math.max(0,t-8.19), ang=.25*Math.exp(-2.2*D)*Math.sin(7*D)+Math.sin(t*1.3)*.012;
  const g=R.g, gg=R.gg;
  for(const G of [g,gg]){ G.save(); G.translate(112,36+oy); G.rotate(ang); }
  line(g,[[0,-40],[0,31]],'#3a2410',1.2);
  const p=cel(g,[[-68,40,1],[-55,30,1],[55,30,1],[68,40,1],[68,80,1],[-68,80,1]],{f:'#e8cf94',so:[-3,-3],s:'#c8a468'});
  gg.fillStyle='#000'; gg.fill(p);
  g.lineWidth=1.4; g.strokeStyle='#3a2410'; g.stroke(p);
  g.fillStyle='#3a2410'; g.beginPath(); g.arc(0,36,3.2,0,TAU); g.fill();
  g.fillStyle='#e8cf94'; g.beginPath(); g.arc(0,36,1.6,0,TAU); g.fill();
  g.fillStyle='#a8321e'; g.fillRect(-58,62,116,1.2);
  g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='#3a2410';
  g.font='bold 15px Rockwell, Georgia, serif'; ls(g,'2px'); g.fillText('SOFIA',1,51);
  g.font='bold 9px Rockwell, Georgia, serif'; ls(g,'.5px'); g.fillText('EXPLORER \u00b7 6 MONTHS',0,71); ls(g,'0px');
  for(const G of [g,gg]) G.restore();
}
function ruins(t){
  const drift=lerp(10,-10,seg(t,6.2,10.8));
  const lay=(f,fn)=>{ for(const G of [R.g,R.gg]){ G.save(); G.translate(drift*f,0); } fn(); for(const G of [R.g,R.gg]) G.restore(); };
  ruinsBack(t,lay); ruinsFront(t,lay);
  motes(t,40,[0,36,W,H-72],'#ffd890',3,.8);
  tag(t);
  bars(1);
  barText('EXPEDITION LOG','ANGKOR, CAMBODIA \u00b7 STOP 06/12',seg(t,6.4,6.9));
  cap(t,[['Best.',wt('best',0)-.05],['Sabbatical.',wt('best',1)-.05],['Ever!',wt('best',2)-.05]],{say:true,out:10.3});
  return {leak:.25,halo:.3};
}
// ---- 16-22.6 s: title card on the navy chart. Compass spins and settles; the gold title slams in on the VO
const HITS=[[18.67,4],[18.98,4],[19.56,5],[21.22,2.5]];
function lineText(s,x,y,size,a,col='#f6ecd2',sp='3px'){
  if(a<=0) return 0; const g=R.g; g.save(); g.setTransform(R.K,0,0,R.K,0,0); g.globalAlpha=a;
  g.font=`bold ${size}px Rockwell, Georgia, serif`; ls(g,sp); g.textAlign='center'; g.textBaseline='middle'; g.lineJoin='round';
  g.strokeStyle='#1a0f06'; g.lineWidth=4; g.strokeText(s,x,y); g.fillStyle=col; g.fillText(s,x,y);
  const w=g.measureText(s).width; g.restore(); return w;
}
function title(t){
  let amp=0; for(const [h,a] of HITS) if(t>=h) amp+=a*Math.exp(-(t-h)*12);
  const [dx,dy]=R.shake(Math.floor(t*30),amp), g=R.g, gg=R.gg;
  M.drawMap(t,{x:320,y:180,z:lerp(1.12,1.04,easeOut(seg(t,16,18.5))),rot:0,dx,dy},{navy:true,goldRoute:true,routeA:.5});
  for(const G of [g,gg]){ G.save(); G.translate(dx,dy); }
  const ra=seg(t,16,17);
  for(const [G,al] of [[g,.08],[gg,.12]]){ G.fillStyle=rgba('#ffd890',al*ra);
    for(let i=0;i<16;i++){ const a=i*TAU/16+t*.06, d=.075;
      G.beginPath(); G.moveTo(320,128); G.lineTo(320+Math.cos(a-d)*560,128+Math.sin(a-d)*560); G.lineTo(320+Math.cos(a+d)*560,128+Math.sin(a+d)*560); G.fill(); } }
  motes(t,34,[0,0,W,H],'#ffd890',5,.7);
  const da=seg(t,18.2,18.8); airbrush(g,320,262,270,62,'#0a0f1c',.55*da); airbrush(gg,320,262,270,62,'#000000',.6*da);
  const sc=1.5*back(seg(t,16.2,16.8)), D=t-18.4;
  const spin=-4*TAU*(1-easeOut(seg(t,16.2,18.4)))+(D>0?.35*Math.exp(-5*D)*Math.sin(25*D):0);
  if(sc>.01) HE.compass(g,320,128,sc,t,{gg,spin});
  for(const G of [g,gg]) G.restore();
  const w=i=>wt('quest',i)-.05;
  cap(t,[['Her',w(0)],['greatest',w(1)],['expedition',w(2)],['yet?',w(3)]],{say:true,y:330,out:18.3});
  goldText('THE GREAT',320+dx,226+dy,26,seg(t,18.52,18.6),lerp(1.6,1,back(seg(t,18.52,18.67))),{ls:4,glow:.35});
  const F='900 46px "Rockwell Extra Bold", Rockwell, Georgia, serif', wC=textW('COPILOT',F,'2px'), wQ=textW('QUEST',F,'2px'), tot=wC+14+wQ;
  const xC=320-tot/2+wC/2, xQ=320+tot/2-wQ/2;
  for(const [s,x,L] of [['COPILOT',xC,18.98],['QUEST',xQ,19.56]])
    goldText(s,x+dx,266+dy,46,seg(t,L-.15,L-.07),lerp(1.8,1,back(seg(t,L-.15,L))),{ls:2,glow:.4});
  const sp=pulse(t,19.62,.55); if(sp>0) sparkle(g,xQ+wQ/2-2+dx,234+dy,10*sp,'#fff4c8',sp);
  const ca=seg(t,20.1,20.5), tw=lineText('CHAPTER ONE \u00b7 THE RETURN',320+dx,300+dy+4*(1-ca),14,ca), rl=60*easeOut(seg(t,20.4,20.9));
  if(rl>0){ g.fillStyle='#e8c26a'; g.fillRect(320+dx-tw/2-14-rl,299.4+dy,rl,1.4); g.fillRect(320+dx+tw/2+12,299.4+dy,rl,1.4); }
  const bp=seg(t,21.1,21.22);
  if(bp>0){ const s=lerp(2.2,1,easeIn(bp)), a=Math.min(1,bp*3);
    for(const G of [g,gg]){ G.save(); G.translate(528+dx,203+dy); G.rotate(-.16); G.scale(s,s); G.globalAlpha=a*(G===gg?.35:1);
      G.beginPath(); if(G.roundRect) G.roundRect(-31,-14,62,28,5); else G.rect(-31,-14,62,28);
      G.fillStyle=G===gg?'#ff5a3a':'#c0392b'; G.fill(); }
    g.strokeStyle='#f6ecd2'; g.lineWidth=1.2; g.beginPath(); if(g.roundRect) g.roundRect(-27,-10,54,20,3); else g.rect(-27,-10,54,20); g.stroke();
    g.font='17px Stencil, "Rockwell Extra Bold", serif'; ls(g,'2px'); g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='#f6ecd2'; g.fillText('EP.1',1,1);
    for(const G of [g,gg]) G.restore(); }
  return {leak:.12+.25*pulse(t,19.56,.6),halo:.35};
}
// ---- 22.6-26 s: end card - Created by GitHub Copilot
function credit(t){
  const g=R.g, gg=R.gg;
  M.drawMap(t,{x:320,y:180,z:1.04+.02*seg(t,22.6,26),rot:0,dx:0,dy:0},{navy:true,goldRoute:true,routeA:.35});
  fillAll((G,isG)=>{ G.globalAlpha=isG?.85:.62; G.fillStyle=isG?'#000000':'#070a14'; G.fillRect(0,0,W,H); });
  motes(t,26,[0,0,W,H],'#ffd890',9,.5);
  goldText('THE GREAT COPILOT QUEST',320,110,22,seg(t,22.9,23.25),lerp(1.15,1,easeOut(seg(t,22.9,23.3))),{ls:3,glow:.3});
  const ca=seg(t,23.1,23.45), tw=lineText('CHAPTER ONE \u00b7 THE RETURN',320,140+3*(1-ca),13,ca,'#e8c26a');
  if(ca>0){ const rl=40*easeOut(ca); g.fillStyle=rgba('#e8c26a',ca); g.fillRect(320-tw/2-12-rl,139.4,rl,1.2); g.fillRect(320+tw/2+10,139.4,rl,1.2); }
  const ms=36*back(seg(t,23.3,23.7));
  if(ms>.5){ airbrush(gg,320,198,ms*1.4,ms*1.4,'#ffd890',.35); R.mark(g,320,198,ms,{glow:.5}); }
  const la=seg(t,23.7,24.1);
  lineText('Created by GitHub Copilot',320,268+4*(1-la),20,la,'#f6ecd2','1px');
  const sa=seg(t,24.0,24.4);
  lineText('Made with GitHub Copilot and Opus 5.5',320,293,12,sa,'#e6d8b4','1px');
  fadeBlack(seg(t,25.4,26));
  return {leak:0,halo:.25,flick:.015};
}
window.S={map,ruins,home,title,credit,util:{bars,fadeBlack,cap,goldText,motes,textW,barText}};
})();
