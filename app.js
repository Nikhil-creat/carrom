'use strict';
const $=id=>document.getElementById(id),C=$('c'),X=C.getContext('2d');
const S=640,M=34,R=13,SR=16,PR=27,FR=.984,VM=12,P=[[M,M],[S-M,M],[M,S-M],[S-M,S-M]];
let W=[],pots=[],scores={w:0,b:0},turn='w',busy=false,over=false,heat=false,aim=null,hint=null,sxp=320,cur='w';
const mk=(x,y,t)=>({x,y,vx:0,vy:0,t,r:t==='s'?SR:R,m:t==='s'?2:1,out:0});
const log=t=>{const l=$('log');l.textContent=t+'\n'+l.textContent.slice(0,900)};
/* ---------- physics ---------- */
function step(w,pl){
 for(const b of w){if(b.out)continue;b.x+=b.vx;b.y+=b.vy;b.vx*=FR;b.vy*=FR;
  if(Math.abs(b.vx)<.02)b.vx=0;if(Math.abs(b.vy)<.02)b.vy=0;
  for(const p of P)if(Math.hypot(b.x-p[0],b.y-p[1])<PR){b.out=1;b.vx=b.vy=0;pl.push(b);break}
  if(b.out)continue;const L=M+b.r,H=S-M-b.r;
  if(b.x<L){b.x=L;b.vx=Math.abs(b.vx)*.8}if(b.x>H){b.x=H;b.vx=-Math.abs(b.vx)*.8}
  if(b.y<L){b.y=L;b.vy=Math.abs(b.vy)*.8}if(b.y>H){b.y=H;b.vy=-Math.abs(b.vy)*.8}}
 for(let i=0;i<w.length;i++)for(let j=i+1;j<w.length;j++){const a=w[i],b=w[j];if(a.out||b.out)continue;
  const dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy),rr=a.r+b.r;if(d>=rr||d===0)continue;
  const nx=dx/d,ny=dy/d,ov=rr-d;a.x+=nx*ov/2;a.y+=ny*ov/2;b.x-=nx*ov/2;b.y-=ny*ov/2;
  const vn=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(vn<0){const j2=-1.9*vn/(1/a.m+1/b.m);
   a.vx+=j2*nx/a.m;a.vy+=j2*ny/a.m;b.vx-=j2*nx/b.m;b.vy-=j2*ny/b.m}}
}
const moving=w=>w.some(b=>!b.out&&(b.vx||b.vy));
function resolve(side,pl){const r={own:0,opp:0,q:0,f:0};for(const b of pl){if(b.t==='s')r.f=1;else if(b.t==='q')r.q=1;else if(b.t===side)r.own++;else r.opp++}return r}
/* ---------- agentic planner: observe -> simulate -> evaluate -> act ---------- */
function simulate(side,sx,y,vx,vy){const w=W.map(b=>({...b})),s=w[0];s.x=sx;s.y=y;s.vx=vx;s.vy=vy;s.out=0;const pl=[];
 for(let i=0;i<700&&(i===0||moving(w));i++)step(w,pl);return resolve(side,pl)}
function plan(side){const y=side==='w'?S-M-48:M+48,dir=side==='w'?-1:1;let best=null,n=0;
 const tg=W.filter(b=>!b.out&&b.t!=='s'&&(b.t===side||b.t==='q'));
 const tryS=(sx,dx,dy,pw)=>{const d=Math.hypot(dx,dy)||1,vx=dx/d*pw*VM,vy=dy/d*pw*VM,r=simulate(side,sx,y,vx,vy);
  const v=r.own*10+r.q*14-r.opp*10-r.f*15+Math.random()*.5;n++;if(!best||v>best.v)best={sx,vx,vy,v,r}};
 for(const c of tg)for(const p of P){const ux=p[0]-c.x,uy=p[1]-c.y,l=Math.hypot(ux,uy)||1,gx=c.x-ux/l*(R+SR),gy=c.y-uy/l*(R+SR);
  for(const sx of[130,320,510])for(const pw of[.6,1])tryS(sx,gx-sx,gy-y,pw)}
 for(let i=0;i<20;i++)tryS(90+Math.random()*460,Math.random()*400-200,dir*(50+Math.random()*300),.5+Math.random()*.5);
 return{best,n}}
/* ---------- game flow ---------- */
function place(side){const s=W[0];s.out=0;s.vx=s.vy=0;s.x=side==='w'?sxp:S/2;s.y=side==='w'?S-M-48:M+48}
function reset(){W=[mk(S/2,S-M-48,'s'),mk(S/2,S/2,'q')];const c=S/2;
 for(let i=0;i<6;i++){const a=i*Math.PI/3;W.push(mk(c+Math.cos(a)*2.1*R,c+Math.sin(a)*2.1*R,i%2?'w':'b'))}
 for(let i=0;i<12;i++){const a=i*Math.PI/6+.26;W.push(mk(c+Math.cos(a)*4.2*R,c+Math.sin(a)*4.2*R,i%2?'b':'w'))}
 scores={w:0,b:0};turn='w';busy=false;over=false;hint=null;place('w');log('New game. Drag the striker backwards and release.');ui();draw()}
function ui(){$('sw').textContent=scores.w;$('sb').textContent=scores.b;
 if(!over)$('st').textContent=busy?(cur==='b'?'🤖 Agent is playing…':'Coins in motion…'):turn==='w'?'Your turn — pull back the striker':'Agent turn'}
function shoot(side,sx,y,vx,vy){beep(200,.08);const s=W[0];s.x=sx;s.y=y;s.vx=vx;s.vy=vy;s.out=0;pots=[];busy=true;cur=side;hint=null;ui();requestAnimationFrame(loop)}
function loop(){for(let i=0;i<2;i++)step(W,pots);draw();if(moving(W))return requestAnimationFrame(loop);end()}
function end(){busy=false;const r=resolve(cur,pots),o=cur==='w'?'b':'w';
 scores[cur]+=r.own+r.q*3-r.f;scores[o]+=r.opp;if(r.own||r.q)beep(660,.15);
 log(`${cur==='w'?'You':'Agent'}: own ${r.own}, opp ${r.opp}${r.q?', QUEEN +3':''}${r.f?', FOUL -1':''}`);
 const left=t=>W.filter(b=>b.t===t&&!b.out).length;
 if(!left('w')||!left('b')){over=true;saveStats();$('st').textContent=scores.w===scores.b?'Draw!':scores.w>scores.b?'🏆 You win!':'🤖 Agent wins';draw();return ui2()}
 turn=(r.own||r.q)&&!r.f?cur:o;place(turn);ui();draw();if(turn==='b')aiMove()}
const ui2=()=>{$('sw').textContent=scores.w;$('sb').textContent=scores.b};
function aiMove(){busy=true;cur='b';ui();setTimeout(()=>{const{best,n}=plan('b');log(`🤖 Simulated ${n} shots, best EV ${best.v.toFixed(1)}`);const q=(Math.random()-.5)*NZ[$('lvl').value],cs=Math.cos(q),sn=Math.sin(q);shoot('b',best.sx,M+48,best.vx*cs-best.vy*sn,best.vx*sn+best.vy*cs)},60)}
/* ---------- CNN-style conv map (2 Gaussian conv layers over coin occupancy grid) ---------- */
function convMap(){const n=32,g=new Float32Array(n*n),cs=S/n;
 for(const b of W)if(!b.out&&b.t!=='s'){const i=Math.min(n-1,b.x/cs|0),j=Math.min(n-1,b.y/cs|0);g[j*n+i]+=b.t==='b'?-1:1}
 let a=g;for(let l=0;l<2;l++){const o=new Float32Array(n*n),k=[1,2,1,2,4,2,1,2,1];
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){let s=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&yy>=0&&xx<n&&yy<n)s+=a[yy*n+xx]*k[(dy+1)*3+dx+1]}o[y*n+x]=s/16*2}a=o}
 return{a,n,cs}}
/* ---------- render ---------- */
function circ(x,y,r,f,s){X.beginPath();X.arc(x,y,r,0,7);X.fillStyle=f;X.fill();if(s){X.strokeStyle=s;X.lineWidth=2;X.stroke()}}
function draw(){X.clearRect(0,0,S,S);X.fillStyle='#5a3418';X.fillRect(0,0,S,S);X.fillStyle='#e8c98a';X.fillRect(M,M,S-2*M,S-2*M);
 X.strokeStyle='#7a4a22';X.lineWidth=2;X.strokeRect(M+30,M+30,S-2*M-60,S-2*M-60);circ(S/2,S/2,70,'rgba(0,0,0,0)','#a33');circ(S/2,S/2,8,'#a33');
 for(const y of[M+48,S-M-48]){X.beginPath();X.moveTo(M+60,y);X.lineTo(S-M-60,y);X.stroke()}
 for(const p of P)circ(p[0],p[1],PR-4,'#111');
 if(heat){const{a,n,cs}=convMap();for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=a[y*n+x];if(Math.abs(v)>.05){X.fillStyle=v>0?`rgba(0,200,255,${Math.min(.5,v*.25)})`:`rgba(255,60,60,${Math.min(.5,-v*.25)})`;X.fillRect(x*cs,y*cs,cs,cs)}}}
 for(const b of W){if(b.out)continue;if(b.t==='s')circ(b.x,b.y,b.r,'#3b82f6','#fff');else circ(b.x,b.y,b.r,b.t==='w'?'#f8f0d8':b.t==='b'?'#222':'#d22','#555')}
 const s=W[0];X.setLineDash([6,6]);
 if(aim&&!busy){const dx=s.x-aim[0],dy=s.y-aim[1],l=Math.min(Math.hypot(dx,dy),130)||1,d=Math.hypot(dx,dy)||1;X.strokeStyle='#fff';X.beginPath();X.moveTo(s.x,s.y);X.lineTo(s.x+dx/d*l*3,s.y+dy/d*l*3);X.stroke();X.fillStyle='#fff';X.fillText(Math.round(l/1.3)+'% power',s.x+12,s.y+30)}
 if(hint&&!busy){X.strokeStyle='#00ffc8';X.beginPath();X.moveTo(hint.sx,s.y);X.lineTo(hint.sx+hint.vx*30,s.y+hint.vy*30);X.stroke()}X.setLineDash([])}
/* ---------- input ---------- */
const pt=e=>{const r=C.getBoundingClientRect();return[(e.clientX-r.left)*S/r.width,(e.clientY-r.top)*S/r.height]};
C.onpointerdown=e=>{if(busy||turn!=='w'||over)return;const[x,y]=pt(e),s=W[0];if(Math.hypot(x-s.x,y-s.y)<50){aim=[x,y];C.setPointerCapture(e.pointerId)}};
C.onpointermove=e=>{if(aim){aim=pt(e);draw()}};
C.onpointerup=()=>{if(!aim)return;const s=W[0],dx=s.x-aim[0],dy=s.y-aim[1],d=Math.hypot(dx,dy),l=Math.min(d,130);aim=null;if(l<12)return draw();shoot('w',s.x,s.y,dx/d*l/130*VM,dy/d*l/130*VM)};
$('sl').oninput=e=>{sxp=+e.target.value;if(!busy&&turn==='w'&&!over){W[0].x=sxp;hint=null;draw()}};
$('new').onclick=reset;$('heat').onclick=()=>{heat=!heat;draw()};
$('hint').onclick=()=>{if(busy||turn!=='w'||over)return;const{best,n}=plan('w');hint=best;sxp=best.sx;W[0].x=sxp;$('sl').value=sxp;log(`🎯 Coach simulated ${n} shots; green line = best (EV ${best.v.toFixed(1)})`);draw()};
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
function beep(f,d){try{const a=beep.c||(beep.c=new AudioContext()),o=a.createOscillator(),g=a.createGain();o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d)}catch{}}
const getStats=()=>{try{return JSON.parse(localStorage.getItem('cx'))||{g:0,w:0,best:0}}catch{return{g:0,w:0,best:0}}};
function showStats(){const t=getStats();$('stats').textContent=`📊 Games ${t.g} · Wins ${t.w} · Best score ${t.best}`}
function saveStats(){const t=getStats();t.g++;if(scores.w>scores.b)t.w++;t.best=Math.max(t.best,scores.w);try{localStorage.setItem('cx',JSON.stringify(t))}catch{}showStats()}
$('ask').onclick=async()=>{const q=$('q').value.trim().slice(0,200),a=$('ans'),key=$('key').value.trim();if(!q)return;const ctx=retrieve(q,3);a.textContent='…';
 try{const r=await fetch('/api/coach',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q,ctx,score:`you ${scores.w}, agent ${scores.b}`})});
  if(r.ok){a.textContent=(await r.json()).answer;return}}catch{}
 if(key){sessionStorage.setItem('gk',key);try{const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:JSON.stringify({model:'llama-3.3-70b-versatile',max_tokens:300,messages:[{role:'system',content:'Concise carrom coach. CONTEXT:\n'+ctx.join('\n')},{role:'user',content:q}]})});
  const j=await r.json();if(j.choices){a.textContent=j.choices[0].message.content;return}}catch{}}
 a.textContent=ctx.join('\n\n')};
showStats();
fetch('/api/health').then(r=>r.json()).then(j=>{$('api').textContent=j.ok?'online ✅':'offline'}).catch(()=>{$('api').textContent='offline (static mode)'});
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
