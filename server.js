'use strict';
process.on('uncaughtException',e=>console.error(e));
const http=require('http'),fs=require('fs'),path=require('path');
const T={'.html':'text/html','.json':'application/json','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const OK=['index.html','style.css','app.js','sw.js','manifest.webmanifest','icon.svg','ml.js','model.json','closing.css','closing.js','config.js','cine.js'];
const H=JSON.parse(fs.readFileSync(path.join(__dirname,'vercel.json'))).headers[0].headers;
http.createServer(async(req,res)=>{const u=new URL(req.url,'http://x');H.forEach(h=>res.setHeader(h.key,h.value));res.setHeader('Access-Control-Allow-Origin',process.env.ALLOWED_ORIGIN||'*');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');if(req.method==='OPTIONS'){res.statusCode=204;return res.end()}
 if(u.pathname.startsWith('/api/')){const f=path.join(__dirname,'api',path.basename(u.pathname)+'.js');
  if(!fs.existsSync(f)){res.statusCode=404;return res.end()}
  let b='';for await(const c of req){b+=c;if(b.length>5000){res.statusCode=413;return res.end()}}
  try{req.body=b?JSON.parse(b):{}}catch{req.body={}}
  res.status=c=>{res.statusCode=c;return res};res.json=o=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(o))};
  return require(f)(req,res)}
 const n=u.pathname==='/'?'index.html':u.pathname.slice(1);
 if(!OK.includes(n)){res.statusCode=404;return res.end('Not found')}
 res.setHeader('Content-Type',T[path.extname(n)]||'application/octet-stream');res.end(fs.readFileSync(path.join(__dirname,n)))}).listen(process.env.PORT||8080,()=>console.log('CARROM-X on :8080'));
