const L=require('./loadPhysics')();require('../ml.js');const ML=globalThis.ML,{S,M,R,SR,P,mk,step,moving,resolve}=L;
let sd=7;const rnd=()=>(sd=(sd*1664525+1013904223)>>>0)/4294967296;const X=[],Y=[],c=S/2,y0=S-M-48;
for(let g=0;g<350;g++){const W=[mk(c,y0,'s'),mk(c,c,'q')];
 for(let i=0;i<6;i++){const a=i*Math.PI/3;W.push(mk(c+Math.cos(a)*2.1*R,c+Math.sin(a)*2.1*R,i%2?'w':'b'))}
 for(let i=0;i<12;i++){const a=i*Math.PI/6+.26;W.push(mk(c+Math.cos(a)*4.2*R,c+Math.sin(a)*4.2*R,i%2?'b':'w'))}
 const p=rnd()*.7;for(let i=1;i<W.length;i++)if(rnd()<p)W[i].out=1;
 for(let i=1;i<W.length;i++)if(!W[i].out&&rnd()<.5)for(let k=0;k<20;k++){const x=M+30+rnd()*(S-2*M-60),y=M+30+rnd()*(S-2*M-60);if(W.every(o=>o===W[i]||o.out||Math.hypot(o.x-x,o.y-y)>30)){W[i].x=x;W[i].y=y;break}}
 const live=W.filter(b=>!b.out&&b.t!=='s'&&(b.t==='w'||b.t==='q'));
 for(let k=0;k<50;k++){const sx=90+rnd()*460;let dx,dy;
  if(live.length&&rnd()<.65){const t=live[rnd()*live.length|0],q=P[rnd()*4|0],ux=q[0]-t.x,uy=q[1]-t.y,l=Math.hypot(ux,uy);dx=t.x-ux/l*(R+SR)-sx+(rnd()-.5)*6;dy=t.y-uy/l*(R+SR)-y0}
  else{dx=rnd()*400-200;dy=-(50+rnd()*300)}
  const d=Math.hypot(dx,dy),pw=.5+rnd()*.5,vx=dx/d*pw*12,vy=dy/d*pw*12,w=W.map(b=>({...b})),s=w[0];s.x=sx;s.y=y0;s.vx=vx;s.vy=vy;s.out=0;const pl=[];
  for(let i=0;i<700&&(i===0||moving(w));i++)step(w,pl);const r=resolve('w',pl);X.push(ML.feat(W,'w',sx,vx,vy));Y.push(r.own>0&&!r.f?1:0)}}
require('fs').writeFileSync(__dirname+'/dataset.json',JSON.stringify({X,Y}));console.log(X.length,'samples, positive rate',(Y.reduce((a,b)=>a+b)/Y.length).toFixed(3));
