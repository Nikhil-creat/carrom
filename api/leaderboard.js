'use strict';
const hits=new Map(),U=()=>process.env.UPSTASH_REDIS_REST_URL,T=()=>process.env.UPSTASH_REDIS_REST_TOKEN;
const rd=p=>fetch(U()+p,{headers:{Authorization:'Bearer '+T()}}).then(r=>r.json());
module.exports=async(req,res)=>{res.setHeader('Cache-Control','no-store');
 if(!U()||!T())return res.status(503).json({error:'Leaderboard not configured'});
 try{if(req.method==='GET'){const j=await rd('/zrevrange/cx-lb/0/9/withscores'),a=j.result||[],top=[];
   for(let i=0;i<a.length;i+=2)top.push({name:String(a[i]).split('|')[0],score:Number(a[i+1])});return res.status(200).json({top})}
  if(req.method!=='POST')return res.status(405).json({error:'GET or POST'});
  const ip=String(req.headers['x-forwarded-for']||'x').split(',')[0],now=Date.now(),h=(hits.get(ip)||[]).filter(t=>now-t<60000);
  if(h.length>=5)return res.status(429).json({error:'Rate limited'});h.push(now);hits.set(ip,h);
  const b=req.body||{},name=String(b.name||'').trim(),score=Math.floor(Number(b.score));
  if(!/^[\w .-]{1,16}$/.test(name)||!(score>=0&&score<=60))return res.status(400).json({error:'Invalid input'});
  await rd('/zadd/cx-lb/'+score+'/'+encodeURIComponent(name+'|'+now));return res.status(200).json({ok:true})}
 catch(e){return res.status(502).json({error:'Upstream error'})}};
