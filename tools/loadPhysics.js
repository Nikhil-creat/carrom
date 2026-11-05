const fs=require('fs'),path=require('path');
module.exports=()=>{const s=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8'),a=s.indexOf('const S=640'),b=s.indexOf('/* ---------- agentic planner');
 return new Function('$',s.slice(a,b)+';return{S,M,R,SR,PR,VM,P,mk,step,moving,resolve}')(()=>({}))};
