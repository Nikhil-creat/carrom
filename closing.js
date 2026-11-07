(function(){'use strict';
const qs=[...document.querySelectorAll('.sx .q')];
qs.forEach(q=>q.querySelector('button').onclick=()=>{const open=q.hasAttribute('data-open');qs.forEach(o=>{o.removeAttribute('data-open');o.querySelector('button').setAttribute('aria-expanded','false')});if(!open){q.setAttribute('data-open','');q.querySelector('button').setAttribute('aria-expanded','true')}});
const cv=document.getElementById('dots');if(!cv)return;const ctx=cv.getContext('2d'),calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
let W=0,H=0,dpr=1,step=0,cols=0,rows=0,seed=[],mx=-9999,my=-9999,tmx=-9999,tmy=-9999,vis=true;
const hash=(i,j)=>{let h=Math.sin(i*127.1+j*311.7)*43758.5453;return h-Math.floor(h)};
function size(){dpr=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
 step=Math.max(14,Math.min(W/1600,H/940)*20.5);cols=Math.ceil(W/step)+1;rows=Math.ceil(H/step)+1;seed=[];for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)seed.push([hash(i,j),hash(i+71,j+13),hash(i+9,j+97)])}
addEventListener('resize',size);size();
addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();tmx=e.clientX-r.left;tmy=e.clientY-r.top});document.addEventListener('pointerleave',()=>{tmx=tmy=-9999});
if('IntersectionObserver'in window)new IntersectionObserver(e=>{vis=e[0].isIntersecting;if(vis&&!run){run=true;requestAnimationFrame(loop)}}).observe(cv);
const C0=[226,106,24],C1=[248,150,64],C2=[255,214,170],mix=(a,b,t)=>a.map((v,k)=>Math.round(v+(b[k]-v)*t));
function draw(t){ctx.clearRect(0,0,W,H);mx+=(tmx-mx)*.12;my+=(tmy-my)*.12;const top=H*.1,full=H*.36,R=step*.37;
 for(let j=0;j<rows;j++){const y=j*step+step*.5;if(y<top-step*2)continue;const v=Math.min(1,Math.max(0,(y-top)/(full-top)));
  const col=v<.55?mix(C0,C1,v/.55):mix(C1,C2,(v-.55)/.45*.85+Math.max(0,(y-H*.9)/(H*.1))*.15);ctx.fillStyle=`rgb(${col[0]},${col[1]},${col[2]})`;
  for(let i=0;i<cols;i++){const x=i*step+step*.5,[a,b,c]=seed[j*cols+i];
   const wave=calm?.7:.5+.5*Math.sin(t*(1.6+b*2.6)+a*6.283+Math.sin(t*.7+i*.21+j*.13)*1.4),keep=Math.min(1,v*1.6+.12)-(a*.6);if(keep<=0&&c>.08)continue;
   let s=(.42+.58*Math.pow(wave,1.3))*Math.min(1,.5+v*.6)*(keep>0?1:.8);const dx=x-mx,dy=y-my,hov=Math.exp(-(dx*dx+dy*dy)/(step*step*22));s=Math.min(1.05,s+hov*.7);
   const r=R*s;if(r<.6)continue;ctx.beginPath();ctx.arc(x,y,r,0,6.2832);ctx.fill()}}}
function loop(ms){if(!vis)return void(run=false);draw(ms/1000);requestAnimationFrame(loop)}let run=true;requestAnimationFrame(loop)})();
