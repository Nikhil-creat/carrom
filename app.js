'use strict';
const THEMES={classic:{f:'#5a3418',s:'#e8c98a',l:'#7a4a22',c:'#a33',p:'#111',w:'#f8f0d8',b:'#222'},neon:{f:'#0a0f2c',s:'#101a3d',l:'#00ffc8',c:'#ff2bd6',p:'#000',w:'#e0ffff',b:'#7a2cff'},marble:{f:'#2b2b2b',s:'#e9e9ee',l:'#8a8a99',c:'#c33',p:'#222',w:'#fff',b:'#333'},midnight:{f:'#0b1d33',s:'#1c3b5e',l:'#4aa3ff',c:'#4aa3ff',p:'#02060c',w:'#cfe8ff',b:'#0a1220'},royal:{f:'#3b0d0d',s:'#d9b36a',l:'#8a1c1c',c:'#8a1c1c',p:'#1a0505',w:'#fff4d6',b:'#2a1a0a'}};let TH=THEMES.classic;const PS=[],API=window.CX_API||'';const I={en:{hint:'🎯 AI Hint',heat:'🧠 CNN Map',new:'♻ New Game',eye:'👁 Agent Vision',mic:'🎙 Voice',undo:'↩ Undo',replay:'🎬 Replay',dly:'📅 Daily',again:'▶ Play again',share:'📤 Share',w:'White to play',b:'Black to play',m:'In motion…'},hi:{hint:'🎯 AI संकेत',heat:'🧠 CNN नक्शा',new:'♻ नया खेल',eye:'👁 एजेंट दृष्टि',mic:'🎙 आवाज़',undo:'↩ पूर्ववत',replay:'🎬 रीप्ले',dly:'📅 दैनिक',again:'▶ फिर खेलें',share:'📤 साझा करें',w:'सफ़ेद की बारी',b:'काले की बारी',m:'गति में…'},te:{hint:'🎯 AI సూచన',heat:'🧠 CNN మ్యాప్',new:'♻ కొత్త ఆట',eye:'👁 ఏజెంట్ విజన్',mic:'🎙 వాయిస్',undo:'↩ రద్దు',replay:'🎬 రీప్లే',dly:'📅 రోజువారీ',again:'▶ మళ్ళీ ఆడండి',share:'📤 షేర్',w:'తెలుపు వంతు',b:'నలుపు వంతు',m:'కదులుతోంది…'}};
const $=id=>document.getElementById(id),C=$('c'),X=C.getContext('2d');
const S=640,M=34,R=13,SR=16,PR=27,FR=.984,VM=12,P=[[M,M],[S-M,M],[M,S-M],[S-M,S-M]];
let ms=0,camT=0,rec=[],rp=[],replaying=false,snaps=[],series={w:0,b:0},daily=false,lang='en',tl=30,gt=0,sr={w:[0,0],b:[0,0]},online=false,my='w',room='',seq=0,poll=null,vision=null,visionY=0,eye=false,tele={sims:0,shots:0,pots:0},hist=[0],W=[],pots=[],scores={w:0,b:0},turn='w',busy=false,over=false,heat=false,aim=null,hint=null,sxp=320,cur='w';
const mk=(x,y,t)=>({x:+x.toFixed(3),y:+y.toFixed(3),vx:0,vy:0,t,r:t==='s'?SR:R,m:t==='s'?2:1,out:0});
const log=t=>{const l=$('log');l.textContent=t+'\n'+l.textContent.slice(0,900)};
/* ---------- physics ---------- */
function step(w,pl){
 for(const b of w){if(b.out)continue;b.x+=b.vx;b.y+=b.vy;b.vx*=FR;b.vy*=FR;
  if(Math.abs(b.vx)<.02)b.vx=0;if(Math.abs(b.vy)<.02)b.vy=0;
  for(const p of P)if(Math.sqrt((b.x-p[0])**2+(b.y-p[1])**2)<PR){b.out=1;b.vx=b.vy=0;pl.push(b);break}
  if(b.out)continue;const L=M+b.r,H=S-M-b.r;
  if(b.x<L){b.x=L;b.vx=Math.abs(b.vx)*.8}if(b.x>H){b.x=H;b.vx=-Math.abs(b.vx)*.8}
  if(b.y<L){b.y=L;b.vy=Math.abs(b.vy)*.8}if(b.y>H){b.y=H;b.vy=-Math.abs(b.vy)*.8}}
 for(let i=0;i<w.length;i++)for(let j=i+1;j<w.length;j++){const a=w[i],b=w[j];if(a.out||b.out)continue;
  const dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy),rr=a.r+b.r;if(d>=rr||d===0)continue;
  const nx=dx/d,ny=dy/d,ov=rr-d;a.x+=nx*ov/2;a.y+=ny*ov/2;b.x-=nx*ov/2;b.y-=ny*ov/2;
  const vn=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(vn<0){const j2=-1.9*vn/(1/a.m+1/b.m);
   a.vx+=j2*nx/a.m;a.vy+=j2*ny/a.m;b.vx-=j2*nx/b.m;b.vy-=j2*ny/b.m}}
}
const moving=w=>w.some(b=>!b.out&&(b.vx||b.vy));
function resolve(side,pl){const r={own:0,opp:0,q:0,f:0};for(const b of pl){if(b.t==='s')r.f=1;else if(b.t==='q')r.q=1;else if(b.t===side)r.own++;else r.opp++}if(r.q&&!r.own)r.q=0;return r}
/* ---------- agentic planner: observe -> simulate -> evaluate -> act ---------- */
function simulate(side,sx,y,vx,vy){const w=W.map(b=>({...b})),s=w[0];s.x=sx;s.y=y;s.vx=vx;s.vy=vy;s.out=0;const pl=[];
 for(let i=0;i<700&&(i===0||moving(w));i++)step(w,pl);return resolve(side,pl)}
function plan(side){const y=side==='w'?S-M-48:M+48,dir=side==='w'?-1:1;let best=null,n=0;const cs=[];
 const tg=W.filter(b=>!b.out&&b.t!=='s'&&(b.t===side||b.t==='q'));
 const run=(sx,vx,vy)=>{const r=simulate(side,sx,y,vx,vy),v=r.own*10+r.q*14-r.opp*10-r.f*15+Math.random()*.5;n++;cs.push({sx,vx,vy,v});if(!best||v>best.v)best={sx,vx,vy,v,r}},cl=[];
 const tryS=(sx,dx,dy,pw)=>{const d=Math.hypot(dx,dy)||1,vx=dx/d*pw*VM,vy=dy/d*pw*VM;if(window.ML&&ML.ready)cl.push({sx,vx,vy,p:ML.predict(ML.feat(W,side,sx,vx,vy))});else run(sx,vx,vy)};
 for(const c of tg)for(const p of P){const ux=p[0]-c.x,uy=p[1]-c.y,l=Math.hypot(ux,uy)||1,gx=c.x-ux/l*(R+SR),gy=c.y-uy/l*(R+SR);
  for(const sx of[130,320,510])for(const pw of[.6,1])tryS(sx,gx-sx,gy-y,pw)}
 for(let i=0;i<20;i++)tryS(90+Math.random()*460,Math.random()*400-200,dir*(50+Math.random()*300),.5+Math.random()*.5);
 cl.sort((a,b)=>b.p-a.p).slice(0,90).forEach(c=>run(c.sx,c.vx,c.vy));vision=cs.sort((a,b)=>b.v-a.v).slice(0,5);visionY=y;tele.sims+=n;return{best,n}}
/* ---------- game flow ---------- */
function place(side){const s=W[0];s.out=0;s.vx=s.vy=0;s.x=side==='w'||$('mode').value!=='ai'?sxp:S/2;s.y=side==='w'?S-M-48:M+48}
function reset(){W=[mk(S/2,S-M-48,'s')];if($('red').value==='red')W.push(mk(S/2,S/2,'q'));const c=S/2;
 for(let i=0;i<6;i++){const a=i*Math.PI/3;W.push(mk(c+Math.cos(a)*2.1*R,c+Math.sin(a)*2.1*R,i%2?'w':'b'))}
 for(let i=0;i<12;i++){const a=i*Math.PI/6+.26;W.push(mk(c+Math.cos(a)*4.2*R,c+Math.sin(a)*4.2*R,i%2?'b':'w'))}
 scores={w:0,b:0};turn='w';busy=false;over=false;hint=null;hist=[0];tele.shots=tele.pots=0;sr={w:[0,0],b:[0,0]};gt=0;rec=[];snaps=[];replaying=false;place('w');tl=+$('tlim').value;if(daily)dailyBoard();log('New game. Drag the striker backwards and release.');ui();draw()}
function ui(){$('sw').textContent=scores.w;$('sb').textContent=scores.b;
 if(!over)$('st').textContent=busy?(cur==='b'?'🤖 Agent is playing…':'Coins in motion…'):turn==='w'?'Your turn — pull back the striker':'Agent turn'}
function shoot(side,sx,y,vx,vy){if($('cam').checked)$('c').classList.add('cine');beep(200,.08);if(!replaying)rec.push([side,sx,y,vx,vy]);const s=W[0];s.x=sx;s.y=y;s.vx=vx;s.vy=vy;s.out=0;pots=[];busy=true;cur=side;hint=null;ui();requestAnimationFrame(loop)}
function loop(){const n0=pots.length;for(let i=0;i<2;i++)step(W,pots);pots.slice(n0).forEach(burst);draw();if(moving(W))return requestAnimationFrame(loop);end()}
function end(){busy=false;$('c').classList.remove('cine');camT=performance.now();if(PS.length)fxLoop();const r=resolve(cur,pots),o=cur==='w'?'b':'w';const qb=pots.find(b=>b.t==='q');if(qb&&!r.q){qb.out=0;qb.x=qb.y=S/2;qb.vx=qb.vy=0;log('👑 Queen not covered — returned to centre')}
 scores[cur]+=r.own+r.q*3-r.f;scores[o]+=r.opp;if(r.f){const pb=pots.find(b=>b.t===cur);if(pb){pb.out=0;pb.x=S/2;pb.y=S/2+34;pb.vx=pb.vy=0;scores[cur]--}tele.fouls=(tele.fouls|0)+1}if(r.own||r.q){beep(660,.15);navigator.vibrate&&navigator.vibrate(30)}commentate(cur,r);hist.push(scores.w-scores.b);sr[cur][0]++;sr[cur][1]+=(r.own||r.q)?1:0;tele.shots++;tele.pots+=r.own+r.q;drawTele();
 log(`${cur==='w'?'You':'Agent'}: own ${r.own}, opp ${r.opp}${r.q?', QUEEN +3':''}${r.f?', FOUL -1':''}`);
 const left=t=>W.filter(b=>b.t===t&&!b.out).length;
 if(!left('w')||!left('b')){over=true;saveStats();{const wn=scores.w>scores.b,dr=scores.w===scores.b,m=$('mode').value,msg=dr?'Draw!':m==='ai'?(wn?'🏆 You win!':'🤖 Agent wins'):(wn?'🏆 White wins!':'🏆 Black wins!'),won=m==='online'?(my==='w'?wn:!wn):m==='ai'?wn:true;$('st').textContent=msg;celebrate(!dr&&won,msg+` (${scores.w}–${scores.b})`+matchUpdate(wn,dr))}draw();return ui2()}
 turn=(r.own||r.q)&&!r.f?cur:o;place(turn);tl=+$('tlim').value;ui();draw();if(replaying)return void setTimeout(nextRp,600);if(turn==='b'&&$('mode').value==='ai')aiMove()}
const ui2=()=>{$('sw').textContent=scores.w;$('sb').textContent=scores.b};
function aiMove(){busy=true;cur='b';ui();setTimeout(()=>{const{best,n}=plan('b');log(`🤖 Simulated ${n} shots, best EV ${best.v.toFixed(1)}`);const q=(Math.random()-.5)*nzv(),cs=Math.cos(q),sn=Math.sin(q);shoot('b',best.sx,M+48,best.vx*cs-best.vy*sn,best.vx*sn+best.vy*cs)},60)}
/* ---------- CNN-style conv map (2 Gaussian conv layers over coin occupancy grid) ---------- */
function convMap(){const n=32,g=new Float32Array(n*n),cs=S/n;
 for(const b of W)if(!b.out&&b.t!=='s'){const i=Math.min(n-1,b.x/cs|0),j=Math.min(n-1,b.y/cs|0);g[j*n+i]+=b.t==='b'?-1:1}
 let a=g;for(let l=0;l<2;l++){const o=new Float32Array(n*n),k=[1,2,1,2,4,2,1,2,1];
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){let s=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&yy>=0&&xx<n&&yy<n)s+=a[yy*n+xx]*k[(dy+1)*3+dx+1]}o[y*n+x]=s/16*2}a=o}
 return{a,n,cs}}
/* ---------- render ---------- */
function circ(x,y,r,f,s){X.beginPath();X.arc(x,y,r,0,7);X.fillStyle=f;X.fill();if(s){X.strokeStyle=s;X.lineWidth=2;X.stroke()}}
function draw(){X.clearRect(0,0,S,S);X.fillStyle=TH.f;X.fillRect(0,0,S,S);X.fillStyle=TH.s;X.fillRect(M,M,S-2*M,S-2*M);
 X.strokeStyle=TH.l;X.lineWidth=2;X.strokeRect(M+30,M+30,S-2*M-60,S-2*M-60);circ(S/2,S/2,70,'rgba(0,0,0,0)',TH.c);circ(S/2,S/2,8,TH.c);
 for(const y of[M+48,S-M-48]){X.beginPath();X.moveTo(M+60,y);X.lineTo(S-M-60,y);X.stroke()}
 for(const p of P){const g=X.createRadialGradient(p[0],p[1],2,p[0],p[1],PR);g.addColorStop(0,'#000');g.addColorStop(1,TH.p);circ(p[0],p[1],PR-2,g,'rgba(255,255,255,.12)')};
 if(heat){const{a,n,cs}=convMap();for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=a[y*n+x];if(Math.abs(v)>.05){X.fillStyle=v>0?`rgba(0,200,255,${Math.min(.5,v*.25)})`:`rgba(255,60,60,${Math.min(.5,-v*.25)})`;X.fillRect(x*cs,y*cs,cs,cs)}}}
 for(const b of W)if(!b.out)coin3d(b);
 const s=W[0];X.setLineDash([6,6]);
 if(aim&&!busy){const dx=s.x-aim[0],dy=s.y-aim[1],l=Math.min(Math.hypot(dx,dy),130)||1,d=Math.hypot(dx,dy)||1;X.strokeStyle='#fff';X.beginPath();X.moveTo(s.x,s.y);const hit=rayHit(s,dx/d,dy/d),L=hit?hit.t:l*3;X.lineTo(s.x+dx/d*L,s.y+dy/d*L);X.stroke();if(hit){circ(hit.gx,hit.gy,SR,'rgba(255,255,255,.18)','#fff');X.beginPath();X.moveTo(hit.c.x,hit.c.y);X.lineTo(hit.c.x+hit.nx*70,hit.c.y+hit.ny*70);X.strokeStyle='#ff0';X.stroke()}X.fillStyle='#fff';X.fillText(Math.round(l/1.3)+'% power',s.x+12,s.y+30)}
 if(hint&&!busy){X.strokeStyle='#00ffc8';X.beginPath();X.moveTo(hint.sx,s.y);X.lineTo(hint.sx+hint.vx*30,s.y+hint.vy*30);X.stroke()}if(eye&&vision)vision.forEach((c,i)=>{X.strokeStyle=`rgba(255,200,0,${.8-i*.14})`;X.beginPath();X.moveTo(c.sx,visionY);X.lineTo(c.sx+c.vx*30,visionY+c.vy*30);X.stroke()});X.setLineDash([]);drawFx()}
/* ---------- input ---------- */
const pt=e=>{const r=C.getBoundingClientRect();return[(e.clientX-r.left)*S/r.width,(e.clientY-r.top)*S/r.height]};
C.onpointerdown=e=>{if(busy||over||(turn==='b'&&$('mode').value==='ai')||(online&&turn!==my)||performance.now()-camT<900)return;const[x,y]=pt(e),s=W[0];if(Math.hypot(x-s.x,y-s.y)<50){aim=[x,y];C.setPointerCapture(e.pointerId)}};
C.onpointermove=e=>{if(aim){aim=pt(e);draw()}};
C.onpointerup=()=>{if(!aim)return;const s=W[0],dx=s.x-aim[0],dy=s.y-aim[1],d=Math.hypot(dx,dy),l=Math.min(d,130);aim=null;if(l<12)return draw();fire(turn,s.x,dx/d*l/130*VM,dy/d*l/130*VM)};
$('sl').oninput=e=>{sxp=+e.target.value;if(!busy&&!over&&(turn==='w'||$('mode').value!=='ai')){W[0].x=sxp;hint=null;draw()}};
$('new').onclick=reset;$('heat').onclick=()=>{heat=!heat;draw()};
$('hint').onclick=()=>{if(busy||over||(turn==='b'&&$('mode').value==='ai'))return;const{best,n}=plan(turn);hint=best;sxp=best.sx;W[0].x=sxp;$('sl').value=sxp;log(`🎯 Coach simulated ${n} shots; green line = best (EV ${best.v.toFixed(1)})`+(window.ML&&ML.ready?` · model pot chance ${Math.round(ML.predict(ML.feat(W,turn,best.sx,best.vx,best.vy))*100)}%`:''));draw()};
/* ---------- RAG coach: TF-IDF retrieval over local knowledge base, optional Groq generation (BYOK) ---------- */
const KB=['The queen is the red coin worth 3 points; pot it then cover it by potting one of your own coins in the same turn.',
'Aim using the ghost ball method: point the striker at the spot one coin-plus-striker distance behind the coin, on the line from the pocket through the coin.',
'Rebound shots off the cushion help when a coin sits near a wall; strike gently to keep control.',
'Potting the striker is a foul that costs one point, so avoid hard shots straight at a pocket.',
'Cluster breaks: hit the cluster from the side with medium power to scatter coins instead of full power.',
'Defensive play: leave the striker where the opponent has no clear line to their own coins.',
'Power control: low power for coins near a pocket, high power for long cross-board shots.',
'After potting your own coin you keep the turn, so plan the next coin before you shoot.',
'The convolution density map shows where your coins (blue) or opponent coins (red) are clustered, which hints at the best break direction.'];
const tok=s=>s.toLowerCase().match(/[a-z]{3,}/g)||[],docs=KB.map(tok),idf={};
docs.forEach(d=>new Set(d).forEach(t=>idf[t]=(idf[t]||0)+1));Object.keys(idf).forEach(t=>idf[t]=Math.log(1+KB.length/idf[t]));
const vec=ts=>{const v={};ts.forEach(t=>v[t]=(v[t]||0)+(idf[t]||0));return v},cos=(a,b)=>{let d=0,na=0,nb=0;for(const k in a){na+=a[k]**2;if(b[k])d+=a[k]*b[k]}for(const k in b)nb+=b[k]**2;return d/(Math.sqrt(na*nb)||1)};
const retrieve=(q,k=2)=>{const qv=vec(tok(q));return docs.map((d,i)=>[cos(qv,vec(d)),i]).sort((a,b)=>b[0]-a[0]).slice(0,k).map(x=>KB[x[1]])};
$('key').value=sessionStorage.getItem('gk')||'';
$('ask').onclick=async()=>{const q=$('q').value.trim().slice(0,200),a=$('ans');if(!q)return;const ctx=retrieve(q),key=$('key').value.trim();a.textContent='…';
 if(!key){a.textContent=ctx.join('\n\n');return}sessionStorage.setItem('gk',key);
 try{const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},
  body:JSON.stringify({model:'llama-3.3-70b-versatile',max_tokens:300,messages:[{role:'system',content:'You are a concise carrom coach. Ground answers in CONTEXT.\nCONTEXT:\n'+ctx.join('\n')+`\nSCORE: you ${scores.w}, agent ${scores.b}`},{role:'user',content:q}]})});
  const j=await r.json();a.textContent=j.choices?.[0]?.message?.content||ctx.join('\n\n')}catch{a.textContent=ctx.join('\n\n')}};
reset();

/* ---------- v2: levels, sound, stats, backend coach, PWA ---------- */
const NZ={easy:.3,pro:.1,master:0};
function beep(f,d){try{if(!$('snd').checked)return;const a=beep.c||(beep.c=new AudioContext()),o=a.createOscillator(),g=a.createGain();o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d)}catch{}}
const getStats=()=>{try{return JSON.parse(localStorage.getItem('cx'))||{g:0,w:0,best:0}}catch{return{g:0,w:0,best:0}}};
function showStats(){const t=getStats();$('stats').textContent=`📊 Games ${t.g} · Wins ${t.w} · Best score ${t.best} · Rating ${t.elo||1000}`}
function saveStats(){if($('mode').value!=='ai')return;const t=getStats();t.g++;{const R0={easy:900,pro:1200,master:1500,auto:1200}[$('lvl').value],e=t.elo||1000,res=scores.w>scores.b?1:scores.w===scores.b?.5:0;t.elo=Math.round(e+24*(res-1/(1+10**((R0-e)/400))))}if(scores.w>scores.b)t.w++;t.best=Math.max(t.best,scores.w);try{localStorage.setItem('cx',JSON.stringify(t))}catch{}showStats()}
$('ask').onclick=async()=>{const q=$('q').value.trim().slice(0,200),a=$('ans'),key=$('key').value.trim();if(!q)return;const ctx=retrieve(q,2).concat([`PLAYER STATS: strike rate ${rate('w')}%, shots ${sr.w[0]}, fouls ${tele.fouls|0}, level ${$('lvl').value}. ${rate('w')<30?'Tip: use the yellow aim line and lower power near pockets.':'Keep pressure with covered queen shots.'}`]);a.textContent='…';
 try{const r=await fetch(API+'/api/coach',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q,ctx,score:`you ${scores.w}, agent ${scores.b}`})});
  if(r.ok){a.textContent=(await r.json()).answer;return}}catch{}
 if(key){sessionStorage.setItem('gk',key);try{const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:JSON.stringify({model:'llama-3.3-70b-versatile',max_tokens:300,messages:[{role:'system',content:'Concise carrom coach. CONTEXT:\n'+ctx.join('\n')},{role:'user',content:q}]})});
  const j=await r.json();if(j.choices){a.textContent=j.choices[0].message.content;return}}catch{}}
 a.textContent=ctx.join('\n\n')};
showStats();
ping(0);
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});

/* ---------- v3: adaptive agent, vision, telemetry, voice, keyboard, leaderboard ---------- */
function nzv(){const l=$('lvl').value;return l==='auto'?Math.max(0,.3-getStats().w*.04):NZ[l]}
function drawTele(){const c=$('sp'),g=c.getContext('2d'),w=c.width,h=c.height;g.clearRect(0,0,w,h);g.strokeStyle='#00ffc8';g.beginPath();const m=Math.max(5,...hist.map(Math.abs));
 hist.forEach((v,i)=>{const x=i/Math.max(1,hist.length-1)*w,y=h/2-v/m*(h/2-4);i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke();$('tt').textContent=`Strike rate — White ${rate('w')}% · Black ${rate('b')}%\nWin chance ~${winProb()}% (heuristic)\nShots ${tele.shots} · Pots ${tele.pots} · Agent sims ${tele.sims}`}
$('eye').onclick=()=>{eye=!eye;draw()};
$('mode').onchange=reset;
$('mic').onclick=()=>{const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R)return log('Voice not supported here');const r=new R();
 r.onresult=e=>{const t=e.results[0][0].transcript.toLowerCase();log('🎙 '+t.slice(0,40));if(t.includes('hint'))$('hint').click();else if(t.includes('new'))$('new').click();else if(t.includes('map'))$('heat').click();else if(t.includes('vision'))$('eye').click();else{$('q').value=t.slice(0,200);$('ask').click()}};r.start()};
addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const k=e.key.toLowerCase();
 if(k==='h')$('hint').click();if(k==='n')$('new').click();if(k==='m')$('heat').click();if(k==='v')$('eye').click();
 if(e.key==='ArrowLeft'||e.key==='ArrowRight'){$('sl').value=+$('sl').value+(e.key==='ArrowLeft'?-15:15);$('sl').oninput({target:$('sl')})}});
async function loadLB(){try{const r=await fetch(API+'/api/leaderboard');if(!r.ok)throw 0;const j=await r.json();$('lbl').textContent=j.top.map((x,i)=>`${i+1}. ${x.name} — ${x.score}`).join('\n')||'No scores yet'}catch{$('lbl').textContent='Leaderboard offline (set Upstash env vars)'}}
$('sub').onclick=async()=>{const name=$('nm').value.trim().slice(0,16);if(!name||!over)return log('Finish a game and enter a name first');
 try{await fetch(API+'/api/leaderboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,score:scores.w})})}catch{}loadLB()};
drawTele();loadLB();

/* ---------- v4: timer, themes, red/non-red, online rooms, aim assist, win animation ---------- */
function rate(s){return sr[s][0]?Math.round(sr[s][1]/sr[s][0]*100):0}
function rayHit(s,ux,uy){let best=null;const rr=(SR+R)**2;for(const c of W){if(c.out||c.t==='s')continue;const fx=c.x-s.x,fy=c.y-s.y,pr=fx*ux+fy*uy;if(pr<0)continue;const p2=fx*fx+fy*fy-pr*pr;if(p2>rr)continue;
 const t=pr-Math.sqrt(rr-p2);if(!best||t<best.t){const gx=s.x+ux*t,gy=s.y+uy*t,nx=c.x-gx,ny=c.y-gy,nl=Math.sqrt(nx*nx+ny*ny)||1;best={t,gx,gy,c,nx:nx/nl,ny:ny/nl}}}return best}
function hud(){const lim=+$('tlim').value;$('tm').textContent=lim?`⏱ ${Math.max(0,tl)}s`:'⏱ ∞';$('gc').textContent=String(gt/60|0).padStart(2,'0')+':'+String(gt%60).padStart(2,'0');
 $('trn').textContent=busy?I[lang].m:(turn==='w'?I[lang].w:I[lang].b)+($('mode').value==='4p'?` · P${sr[turn][0]%2+1}`:'');$('bi').style.width=(lim?Math.max(0,tl)/lim*100:100)+'%'}
function passTurn(){turn=turn==='w'?'b':'w';place(turn);tl=+$('tlim').value;log('⏱ Turn passed');ui();draw();hud();if(turn==='b'&&$('mode').value==='ai')aiMove()}
setInterval(()=>{if(over||replaying)return;gt++;const ai=turn==='b'&&$('mode').value==='ai',lim=+$('tlim').value;
 if(!busy&&!ai&&lim){tl--;if(tl<=0&&(!online||turn===my)){if(online)sendMove({a:'move',code:room,side:turn,pass:true});passTurn()}}hud()},1000);
function confetti(){const c=$('cf'),g=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;const ps=Array.from({length:150},()=>({x:Math.random()*c.width,y:-20-Math.random()*300,vx:Math.random()*4-2,vy:2+Math.random()*4,r:3+Math.random()*4,c:`hsl(${Math.random()*360},90%,60%)`}));let f=0;
 (function a(){g.clearRect(0,0,c.width,c.height);ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;g.fillStyle=p.c;g.fillRect(p.x,p.y,p.r,p.r*1.6)});if(++f<280)requestAnimationFrame(a);else g.clearRect(0,0,c.width,c.height)})()}
function celebrate(win,msg){$('wt').textContent=msg;$('win').className=win?'up':'lose';$('win').hidden=false;if(win){confetti();[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.18),i*140))}}
$('again').onclick=()=>{$('win').hidden=true;reset()};
$('share').onclick=()=>{const t=`I played CARROM-X (${scores.w}–${scores.b})! ${location.origin}`;navigator.share?navigator.share({text:t}).catch(()=>{}):navigator.clipboard&&navigator.clipboard.writeText(t)};
$('new').onclick=()=>{daily=false;$('win').hidden=true;reset()};$('red').onchange=()=>{$('win').hidden=true;reset()};$('tlim').onchange=()=>{tl=+$('tlim').value;hud()};
$('mode').onchange=()=>{if($('mode').value!=='online'){online=false;clearInterval(poll)}$('win').hidden=true;reset()};
$('theme').onchange=e=>{TH=THEMES[e.target.value];try{localStorage.setItem('cxt',e.target.value)}catch{}draw()};
try{const t=localStorage.getItem('cxt');if(THEMES[t]){TH=THEMES[t];$('theme').value=t}}catch{}
/* online rooms (turn-based, deterministic replay of shots via /api/room) */
function fire(sd,sx,vx,vy){const s=W[0];snaps.push(JSON.stringify({W:W.map(b=>({...b})),scores,turn,hist,sr,rl:rec.length}));shoot(sd,sx,s.y,vx,vy);if(online)sendMove({a:'move',code:room,side:sd,sx,vx,vy})}
function startOnline(code,side){$('mode').value='online';reset();online=true;my=side;room=code;seq=0;$('rs').textContent=`Room ${code} — you are ${side==='w'?'White':'Black'}. Share the code!`;clearInterval(poll);poll=setInterval(pollRoom,2000)}
async function pollRoom(){if(busy||over||turn===my)return;try{const j=await (await fetch(API+`/api/room?code=${room}&from=${seq}`)).json(),m=(j.moves||[])[0];if(!m)return;
 if(m.side===my){seq++;return}if(turn!==m.side)return;seq++;if(m.pass)passTurn();else shoot(m.side,m.sx,m.side==='w'?S-M-48:M+48,m.vx,m.vy)}catch{}}
$('rcreate').onclick=async()=>{const j=await api({a:'create'}).catch(()=>({}));j.code?startOnline(j.code,'w'):$('rs').textContent='Online needs Upstash env vars'};
$('rjoin').onclick=async()=>{const c=$('rc').value.trim().toUpperCase(),j=await api({a:'join',code:c}).catch(()=>({}));j.ok?startOnline(c,'b'):$('rs').textContent='Room not found'};
reset();hud();

/* ---------- v5: learned model, undo/replay, series, Elo, daily, languages, commentary ---------- */
function say(a){return a[Math.random()*a.length|0]}
function commentate(side,r){if(side==='w'){ms=(r.own||r.q)?0:ms+1;if(ms>=3){ms=0;log('💡 Coach: '+retrieve('aim ghost ball pocket power',1)[0])}}const w=side==='w'?'White':'Black';log(r.f?say([`${w} fouls! A coin returns.`,'Striker in the pocket 😬']):r.q?`👑 ${w} takes the queen!`:r.own>1?say([`Double pot by ${w}!`,'Clean sweep 🔥']):r.own?say([`${w} pots one.`,'Nice shot!']):say([`${w} misses.`,'Safe play.','No luck this time.']))}
function matchUpdate(wn,dr){if(dr)return'';series[wn?'w':'b']++;const bo=+$('bo').value,need=Math.ceil(bo/2);let x='';
 if(bo>1&&(series.w>=need||series.b>=need)){x=` · MATCH ${series.w>=need?'WON':'LOST'} ${series.w}–${series.b}`;series={w:0,b:0}}$('ser').textContent=`Series ${series.w}–${series.b} (best of ${bo})`;return x}
function dailyBoard(){const d=new Date().toISOString().slice(0,10);let h=0;for(const c of d)h=(h*31+c.charCodeAt(0))>>>0;const a=(h%360)*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a);
 for(const b of W){if(b.t==='s')continue;const x=b.x-S/2,y=b.y-S/2;b.x=+(S/2+x*ca-y*sa).toFixed(3);b.y=+(S/2+x*sa+y*ca).toFixed(3)}}
function nextRp(){const m=rp.shift();if(!m){replaying=false;log('🎬 Replay finished');return}shoot(...m)}
$('replay').onclick=()=>{if(busy||!rec.length)return;const q=rec.slice();reset();rp=q;replaying=true;log('🎬 Replaying…');nextRp()};
$('undo').onclick=()=>{if(busy||online||replaying||!snaps.length)return;const o=JSON.parse(snaps.pop());W=o.W;scores=o.scores;turn=o.turn;hist=o.hist;sr=o.sr;rec.length=o.rl;over=false;$('win').hidden=true;place(turn);tl=+$('tlim').value;ui();draw();hud();drawTele();log('↩ Undone')};
$('dly').onclick=()=>{daily=true;$('win').hidden=true;reset();log('📅 Daily challenge '+new Date().toISOString().slice(0,10))};
function applyLang(){for(const k of['hint','heat','new','eye','mic','undo','replay','dly','again','share'])$(k).textContent=I[lang][k];hud()}
$('lang').onchange=e=>{lang=e.target.value;try{localStorage.setItem('cxl',lang)}catch{}applyLang()};
try{const l=localStorage.getItem('cxl');if(I[l]){lang=l;$('lang').value=l}}catch{}
applyLang();
fetch('model.json').then(r=>{if(!r.ok)throw 0;return r.json()}).then(m=>{if(m&&m.W1&&m.b1&&m.W2){ML.set(m)};log('🧬 Learned shot model loaded')}).catch(()=>{});

/* ---------- v7: pseudo-3D shading, particles, cinematic camera, win estimate ---------- */
function coin3d(b){const r=b.r,base=b.t==='s'?'#3b82f6':b.t==='w'?TH.w:b.t==='b'?TH.b:'#d22';
 X.beginPath();X.ellipse(b.x+3,b.y+5,r,r*.85,0,0,7);X.fillStyle='rgba(0,0,0,.38)';X.fill();
 if(b.t==='s'){X.shadowColor='#3b82f6';X.shadowBlur=14}circ(b.x,b.y,r,base,'rgba(0,0,0,.45)');X.shadowBlur=0;
 const g=X.createRadialGradient(b.x-r*.38,b.y-r*.42,r*.1,b.x,b.y,r);g.addColorStop(0,'rgba(255,255,255,.8)');g.addColorStop(.35,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.5)');circ(b.x,b.y,r,g);
 X.beginPath();X.arc(b.x,b.y,r*.62,0,7);X.strokeStyle='rgba(0,0,0,.25)';X.lineWidth=1.2;X.stroke()}
function burst(b){for(let i=0;i<26;i++){const a=Math.random()*6.283,s=1+Math.random()*3.6;PS.push({x:b.x,y:b.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,c:b.t==='q'?'#ff4d4d':b.t==='s'?'#6aa8ff':'#ffd27a'})}
 const c=$('c');c.classList.remove('shk');void c.offsetWidth;c.classList.add('shk');beep(880,.1)}
function drawFx(){for(let i=PS.length-1;i>=0;i--){const p=PS[i];p.x+=p.vx;p.y+=p.vy;p.vx*=.96;p.vy*=.96;p.l-=.03;if(p.l<=0){PS.splice(i,1);continue}X.globalAlpha=p.l;X.fillStyle=p.c;X.beginPath();X.arc(p.x,p.y,2.4*p.l+.6,0,7);X.fill()}X.globalAlpha=1}
function fxLoop(){if(!PS.length||busy)return;draw();requestAnimationFrame(fxLoop)}
function winProb(){const left=t=>W.filter(b=>b.t===t&&!b.out).length,d=scores.w-scores.b+.6*(left('b')-left('w'));return Math.round(100/(1+Math.exp(-d/2.5)))}

/* ---------- v8: hardened online play, invites, wake-up ping, clearer errors ---------- */
function apiMsg(j){return j.status===503?'Online rooms need the Upstash keys on the server.':j.status===404?'Room not found or expired.':j.status===429?'Too many requests — wait a minute.':!j.status?'Server is waking up (free tier). Wait 30–60 s and try again.':'Server error '+j.status}
async function api(o){let tm;const ctl=typeof AbortController!=='undefined'?new AbortController():null;try{if(ctl)tm=setTimeout(()=>ctl.abort(),65000);
 const r=await fetch(API+'/api/room',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o),signal:ctl?ctl.signal:undefined});let j={};try{j=await r.json()}catch{}return{ok:r.ok,status:r.status,...j}}catch(e){return{ok:false,status:0}}finally{clearTimeout(tm)}}
async function sendMove(o){for(let i=0;i<4;i++){const r=await api(o);if(r.ok)return;await new Promise(s=>setTimeout(s,1200*(i+1)))}log('⚠ Could not send your move — check connection')}
$('rcreate').onclick=async()=>{$('rs').textContent='⏳ Creating room…';const j=await api({a:'create'});j.code?startOnline(j.code,'w'):$('rs').textContent='⚠ '+apiMsg(j)};
$('rjoin').onclick=async()=>{const c=$('rc').value.trim().toUpperCase();if(!/^[A-Z2-9]{5}$/.test(c))return void($('rs').textContent='⚠ Enter the 5-character room code');$('rs').textContent='⏳ Joining…';const j=await api({a:'join',code:c});j.ok?startOnline(c,'b'):$('rs').textContent='⚠ '+apiMsg(j)};
$('rinv').onclick=()=>{if(!room)return void($('rs').textContent='Create a room first');const link=`${location.origin}${location.pathname}?room=${room}`,txt=`Join my CARROM-X match! Room code ${room}`;
 if(navigator.share)navigator.share({title:'CARROM-X',text:txt,url:link}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(txt+' '+link).then(()=>{$('rs').textContent='🔗 Invite link copied!'}).catch(()=>{$('rs').textContent=link})};
$('sub').onclick=async()=>{const name=$('nm').value.trim().slice(0,16);if(!name||!over)return log('Finish a game and enter a name first');
 try{const r=await fetch(API+'/api/leaderboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,score:scores.w})});
  if(!r.ok)return void($('lbl').textContent='⚠ '+(r.status===400?'Name: letters/numbers only (max 16)':r.status===503?'Leaderboard not configured on server':'Could not submit'))}catch{return void($('lbl').textContent='⚠ Server is waking up — try again in a minute')}loadLB()};
function ping(n){$('api').textContent=n?'waking server… ⏳':'checking…';fetch(API+'/api/health').then(r=>r.json()).then(j=>{$('api').textContent=j.ok?'online ✅':'offline'}).catch(()=>{if(n<12)setTimeout(()=>ping(n+1),5000);else $('api').textContent='offline (game still works locally)'})}
ping(0);
{const rm=new URLSearchParams(location.search).get('room');if(rm&&/^[A-Za-z2-9]{5}$/.test(rm)){$('rc').value=rm.toUpperCase();setTimeout(()=>$('rjoin').click(),800)}}
