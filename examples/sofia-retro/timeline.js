// Copilot Quest — Episode 1: Enter Copilot (0–89.5 s)
var FPS=30, TOTAL=2685;
// 2.0 s inserted at abs 13.1 so the VACATION.EXE crash box can hang on screen. Scenes from 'ret' on are written in
// STORY time and draw() hands them t − INS_D; every array below (SCENE_T, VO_CUES, SFX_CUES, TRANS) is REAL time.
var INS_D=2.0;
// [S.fn, start s] — draw() dispatches from this; av_check reads SCENE_T / VO_CUES / SFX_CUES
var SCENE_T=[['title',0],['travel',3.2],['ret',15.1],['party',31.5],['quest',42.8],['enter',53.0],['boss',55.8],['drafts',60.6],['clash',65.9],['recap',72.4],['clear',78.5],['outro',81.3],['credit',86.5]];
var VO_CUES=[['travel',104,'narr'],['ahh',258,'room'],['back',465,'narr'],['behind',629,'narr'],['mode',719,'narr'],['good',807,'room'],
 ['c1',957,'room'],['c2',1074,'room'],['c3',1182,'room'],['session',1296,'room'],['what',1392,'room'],['find',1518,'room'],
 ['enter',1599,'narr'],['inbox',1680,'narr'],['drafts',1824,'narr'],['clash',1983,'narr'],['avail',2049,'narr'],
 ['missed',2178,'narr'],['prep',2280,'narr'],['got',2361,'room'],['outro',2448,'narr']];
var SFX_CUES=[
 // cues sit on the visual *hit*, not the tween start: back() card slides land ~+4f, R.stamp slams +4f, pop()/bigPop() peak +3f
 // act 1 (crash box: NOT RESPONDING f393, cursor clicks OK f426, tracking glitch f438, blinds f453)
 [0,'crt'],[93,'whoosh'],[182,'card'],[194,'card'],[210,'select'],[231,'whoosh'],
 [309,'alarm'],[345,'alarm'],[355,'alert'],[393,'hang'],[426,'select'],[438,'glitch'],[453,'whoosh'],[540,'whoosh'],
 [569,'flip'],[573,'flip'],[578,'flip'],[582,'flip'],[587,'flip'],[591,'flip'],
 [614,'alert'],[646,'stamp'],[658,'pop'],[666,'pop'],[673,'pop'],[715,'select'],[736,'pop'],[792,'whoosh'],[879,'gloom'],
 // act 2
 [939,'whoosh'],[951,'select'],[1068,'select'],[1176,'select'],
 [1284,'whoosh'],[1317,'alert'],[1344,'card'],[1449,'pop'],[1523,'select'],[1587,'whoosh'],
 [1608,'summon'],[1650,'pop'],[1674,'whoosh'],[1695,'zap'],[1739,'sort'],[1775,'coin'],
 [1818,'whoosh'],[1840,'type'],[1886,'stamp'],[1920,'pop'],[1941,'coin'],
 [1977,'whoosh'],[2006,'untangle'],[2059,'scan'],[2077,'confirm'],[2111,'chime'],
 [2172,'glitch'],[2229,'ffwd'],[2319,'chime'],[2355,'whoosh'],[2390,'levelup'],
 [2439,'whoosh'],[2519,'logo'],[2550,'fanfare'],[2595,'select'],
 // fill silent visual hits
 [1590,'charge'],[1797,'boom'],[1928,'pop'],[1935,'pop'],[2028,'select'],[2055,'card'],
 [2175,'flip'],[2184,'flip'],[2193,'flip'],[2202,'flip'],[2211,'flip'],[2220,'flip'],
 [2256,'pop'],[2280,'card'],[2292,'chk1'],[2301,'chk2'],[2310,'chk3']];
S.PIN_T.forEach((pt,i)=>{if(i>0)SFX_CUES.push([Math.round((pt+1.0)*FPS),'pin'+i]);});   // PIN_T is travel-local (abs − 1.0)
SFX_CUES.sort((a,b)=>a[0]-b[0]);
// scene transitions: [start, end, fn(p 0..1)] drawn over the finished frame
var TRANS=[
 [3.0,3.2,p=>R.diamonds(p,'#0b0620')],[3.2,3.4,p=>R.diamonds(1-p,'#0b0620')],
 [15.1,15.3,p=>R.blinds(1-p,'#000000')],
 [31.25,31.5,p=>{R.pixelate(3+p*27);R.stepFade(p*.6,'#0b0620');}],[31.5,31.75,p=>R.pixelate(30-p*27)],
 [42.6,42.8,p=>R.diamonds(p,'#0b0620',40,-1)],[42.8,43.0,p=>R.diamonds(1-p,'#0b0620',40,-1)],
 [52.8,53.0,p=>R.stepFade(p,'#000000',5)],
 [55.6,55.8,p=>R.blinds(p,'#05030f',12,true)],[55.8,56.0,p=>R.blinds(1-p,'#05030f',12,true)],
 [60.4,60.6,p=>R.diamonds(p,'#0b0620')],[60.6,60.8,p=>R.diamonds(1-p,'#0b0620')],
 [65.7,65.9,p=>R.blinds(p,'#05030f')],[65.9,66.1,p=>R.blinds(1-p,'#05030f')],
 [72.2,72.4,p=>R.pixelate(3+p*21)],[72.4,72.6,p=>R.pixelate(24-p*21)],
 [78.3,78.5,p=>R.iris(320,180,R.lerp(760,0,R.ease(p)),'#000000')],[78.5,78.7,p=>R.iris(320,180,R.lerp(0,760,R.ease(p)),'#000000')],
 [81.1,81.3,p=>R.diamonds(p,'#05030f',40,-1)],[81.3,81.5,p=>R.diamonds(1-p,'#05030f',40,-1)],
 // iris-out into the credit card (which irises back in from 86.5) instead of a hard cut to black
 [86.15,86.5,p=>R.iris(320,180,R.lerp(760,0,R.ease(p)),'#000000')],
];
function draw(t){
 R.begin('#000');let k=0;
 while(k+1<SCENE_T.length&&t>=SCENE_T[k+1][1])k++;
 // title + travel run on real time; 'ret' onwards gets story time (see INS_D)
 const fn=S[SCENE_T[k][0]],st=k>=2?t-INS_D:t;
 const over=fn?fn(st):(R.label(R.g,'['+SCENE_T[k][0]+']',320,176,'#ffffff',2,'center'),null);
 for(const [a,b,f] of TRANS)if(t>=a&&t<b)f(R.seg(t,a,b));
 const o=Object.assign({noiseA:.006,flick:0},over||{});
 if(t>=72.2&&t<72.6)o.track=Math.max(o.track||0,.6*(1-Math.abs(t-72.4)/.2));
 return o;
}
