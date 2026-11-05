const t=require('node:test'),a=require('node:assert'),L=require('../tools/loadPhysics')();require('../ml.js');
const board=()=>{const c=320,W=[L.mk(c,558,'s'),L.mk(c,c,'q')];for(let i=0;i<6;i++){const q=i*Math.PI/3;W.push(L.mk(c+Math.cos(q)*27.3,c+Math.sin(q)*27.3,i%2?'w':'b'))}return W};
const run=(vx,vy)=>{const W=board(),pl=[];W[0].vx=vx;W[0].vy=vy;for(let i=0;i<800&&(i===0||L.moving(W));i++)L.step(W,pl);return{W,pl}};
t('physics is deterministic',()=>a.deepStrictEqual(run(1.5,-11).W,run(1.5,-11).W));
t('coins stay on the board',()=>run(3,-12).W.forEach(b=>{if(!b.out){a.ok(b.x>=34&&b.x<=606&&b.y>=34&&b.y<=606)}}));
t('queen needs cover',()=>{a.strictEqual(L.resolve('w',[{t:'q'}]).q,0);a.strictEqual(L.resolve('w',[{t:'q'},{t:'w'}]).q,1)});
t('striker pot is a foul',()=>a.strictEqual(L.resolve('w',[{t:'s'}]).f,1));
t('learned model predicts a probability',()=>{const m=require('../model.json'),p=(globalThis.ML.set(m),globalThis.ML.predict(globalThis.ML.feat(board(),'w',320,0,-10)));a.ok(p>0&&p<1)});
