'use strict';
const U=()=>process.env.UPSTASH_REDIS_REST_URL,T=()=>process.env.UPSTASH_REDIS_REST_TOKEN,hits=new Map();
const rc=a=>fetch(U(),{method:'POST',headers:{Authorization:'Bearer '+T()},body:JSON.stringify(a)}).then(r=>r.json()).then(j=>j.result);
const okc=c=>/^[A-Z2-9]{5}$/.test(c),num=(v,a,b)=>Number.isFinite(v)&&v>=a&&v<=b;
module.exports=async(req,res)=>{res.setHeader('Cache-Control','no-store');
 if(!U()||!T())return res.status(503).json({error:'Rooms not configured'});
 const ip=String(req.headers['x-forwarded-for']||'x').split(',')[0],now=Date.now(),h=(hits.get(ip)||[]).filter(t=>now-t<60000);
 if(h.length>=150)return res.status(429).json({error:'Rate limited'});h.push(now);hits.set(ip,h);
 try{if(req.method==='GET'){const q=new URL(req.url,'http://x').searchParams,c=String(q.get('code')||'').toUpperCase(),f=Math.max(0,parseInt(q.get('from'))||0);
   if(!okc(c))return res.status(400).json({error:'Bad code'});const m=await rc(['LRANGE','rm:'+c,f,f]);return res.status(200).json({moves:(m||[]).map(x=>JSON.parse(x))})}
  if(req.method!=='POST')return res.status(405).json({error:'GET or POST'});const b=req.body||{};
  if(b.a==='create'){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c='';for(let i=0;i<5;i++)c+=A[Math.floor(Math.random()*A.length)];
   if((await rc(['SET','rmx:'+c,'1','EX','7200']))!=='OK')return res.status(502).json({error:'Upstream error'});return res.status(200).json({code:c})}
  const c=String(b.code||'').toUpperCase();if(!okc(c))return res.status(400).json({error:'Bad code'});
  if(b.a==='join'){const ex=(await rc(['EXISTS','rmx:'+c]))===1;return res.status(ex?200:404).json({ok:ex})}
  if(b.a==='move'){if(b.side!=='w'&&b.side!=='b')return res.status(400).json({error:'Bad side'});
   const mv=b.pass?{side:b.side,pass:true}:{side:b.side,sx:+b.sx,vx:+b.vx,vy:+b.vy};
   if(!b.pass&&!(num(mv.sx,60,580)&&num(mv.vx,-12.5,12.5)&&num(mv.vy,-12.5,12.5)))return res.status(400).json({error:'Bad move'});
   if(!(await rc(['EXISTS','rmx:'+c])))return res.status(404).json({error:'No room'});
   const n=await rc(['RPUSH','rm:'+c,JSON.stringify(mv)]);await rc(['EXPIRE','rm:'+c,'7200']);return n>500?res.status(429).json({error:'Room full'}):res.status(200).json({ok:true})}
  return res.status(400).json({error:'Bad action'})}catch(e){return res.status(502).json({error:'Upstream error'})}};
