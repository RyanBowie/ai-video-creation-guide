// Copilot Quest - "The Great Copilot Quest" explorer cut (opening, ~26 s).
// Timeline contract: SCENE_T [[scene, startSeconds]], VO_CUES [key, frame, chain], SFX_CUES [frame, sfx], draw(t) -> post overrides.
var FPS=30, TOTAL=780;
var SCENE_T=[['map',0],['ruins',6.2],['home',10.8],['title',16],['credit',22.6]];
var VO_CUES=[['open',27,'narr'],['best',207,'room'],['home',336,'narr'],['quest',489,'narr']];
var SFX_CUES=[
  [0,'projector'],[39,'plane'],[63,'pin1'],[84,'pin2'],[105,'pin3'],[126,'pin4'],[147,'pin5'],[168,'pin6'],  [174,'whoosh'],[233,'tag'],
  [327,'plane'],[343,'pin7'],[356,'pin8'],[369,'pin9'],[382,'pin10'],[395,'pin11'],[405,'plane'],[408,'pin12'],
  [436,'xmark'],[440,'stamp'],[468,'burn'],[486,'spin'],[552,'click'],[560,'hit'],[569,'hit'],[587,'hit'],[637,'stamp'],[700,'chime']
];
var draw;
(function(){
const {TAU,W,H,lerp,ease,easeIn,seg}=R;
const M=window.MAP;

// ---------- snapshots (full-res copies of the scene + glow layers) ----------
let SA=null, SB=null;
function snaps(){ if(!SA){ SA=R.canvas(R.DW,R.DH); SB=R.canvas(R.DW,R.DH); } return [SA,SB]; }
function snap(dst,src){ const G=dst[1]; G.setTransform(1,0,0,1,0,0); G.globalAlpha=1; G.globalCompositeOperation='source-over'; G.clearRect(0,0,R.DW,R.DH); G.drawImage(src,0,0); }
function paste(G,c,a){ if(a<=0) return; G.save(); G.setTransform(1,0,0,1,0,0); G.globalAlpha=Math.min(1,a); G.globalCompositeOperation='source-over'; G.drawImage(c,0,0); G.restore(); }

function sceneAt(t){ let n=SCENE_T[0][0]; for(const [k,s] of SCENE_T) if(t>=s) n=k; return n; }
function scene(name,t){ return S[name](t)||{}; }
function farCorner(x,y){ return Math.hypot(Math.max(x,W-x),Math.max(y,H-y))+12; }

// ---------- iris: the map closes on Cambodia, the ruins open from the sun ----------
function irisMask(cx,cy,r){
  for(const G of [R.g,R.gg]){
    G.save(); G.setTransform(R.K,0,0,R.K,0,0); G.globalAlpha=1; G.globalCompositeOperation='source-over';
    G.beginPath(); G.rect(0,0,W,H); if(r>0) G.arc(cx,cy,r,0,TAU);
    G.fillStyle='#000'; G.fill('evenodd');
    if(r>0){
      G.beginPath(); G.arc(cx,cy,r,0,TAU);
      G.strokeStyle=G===R.g?'rgba(217,164,65,.6)':'rgba(255,190,90,.3)'; G.lineWidth=2; G.stroke();
    }
    G.restore();
  }
}
function irisT(p,t){
  if(t<6.2){
    const o=scene('map',t), c=M.toScreen(M.STOPS[6],M.mapCam(t));
    irisMask(c[0],c[1],lerp(farCorner(c[0],c[1]),0,ease(seg(t,5.8,6.2))));
    return o;
  }
  const o=scene('ruins',t);
  irisMask(420,125,lerp(0,farCorner(420,125),ease(seg(t,6.2,6.6))));
  return o;
}

// ---------- dissolve: sunrise ruins melt into the polaroid map ----------
function dissolveT(p,t){
  const oA=scene('ruins',t), [A,B]=snaps();
  snap(A,R.SC); snap(B,R.GC);
  R.begin('#000');
  const oB=scene('home',t), e=ease(p);
  paste(R.g,A[0],1-e); paste(R.gg,B[0],1-e);
  return Object.assign({},oA,oB,{leak:lerp(oA.leak||0,oB.leak||0,e),halo:lerp(oA.halo??.25,oB.halo??.25,e)});
}
// ---------- film burn: the old reel catches fire at "home" and burns through to the title ----------
function blob(G,x,y,r,s){
  G.beginPath();
  for(let i=0;i<=24;i++){
    const a=i/24*TAU, f=1+.16*Math.sin(3*a+s)+.08*Math.sin(5*a+1.7*s)+.05*Math.sin(11*a+3.1*s);
    const px=x+Math.cos(a)*r*f, py=y+Math.sin(a)*r*f;
    if(i) G.lineTo(px,py); else G.moveTo(px,py);
  }
  G.closePath();
}
function burnT(p,t){
  const [A,B]=snaps();
  scene('home',t); snap(A,R.SC); snap(B,R.GC);
  const h=M.toScreen(M.STOPS[0],M.homeCam(t));
  const BL=[[h[0],h[1],560,0],[90,80,230,.1],[560,90,220,.18],[110,300,250,.25],[540,290,240,.3],[330,40,200,.38],[330,330,260,.45]];
  for(const [G,glow] of [[A[1],false],[B[1],true]]){
    G.save(); G.setTransform(R.K,0,0,R.K,0,0);
    BL.forEach(([x,y,Rm,d],i)=>{
      const r=easeIn(seg(p,d,1))*Rm; if(r<=0) return;
      const s=i*1.7+t*3;
      G.globalCompositeOperation='source-atop';
      if(!glow){
        G.fillStyle='rgba(40,20,5,.6)'; blob(G,x,y,r+16,s); G.fill();
        G.fillStyle='#ff9a3a'; blob(G,x,y,r+5,s); G.fill();
      } else { G.fillStyle='#ff7a1a'; blob(G,x,y,r+5,s); G.fill(); }
      G.globalCompositeOperation='destination-out'; G.fillStyle='#000'; blob(G,x,y,r,s); G.fill();
    });
    G.restore();
  }
  R.begin('#000');
  const o=scene('title',t);
  paste(R.g,A[0],1); paste(R.gg,B[0],1);
  return Object.assign({},o,{leak:.4*Math.sin(Math.PI*p)});
}

// ---------- dip to black: title -> credit ----------
function fadeT(p,t){
  const o=scene(t<22.6?'title':'credit',t);
  S.util.fadeBlack(1-Math.abs(2*p-1));
  return o;
}

const TRANS=[[5.8,6.6,irisT],[10.5,11.0,dissolveT],[15.6,16.3,burnT],[22.2,23.0,fadeT]];
draw=function(t){
  R.begin('#000');
  const tr=TRANS.find(([a,b])=>t>=a&&t<b);
  const over=tr?tr[2](seg(t,tr[0],tr[1]),t):scene(sceneAt(t),t);
  return Object.assign({leak:0,halo:.25,flick:.025},over||{});
};
})();
