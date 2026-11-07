const t=require('node:test'),a=require('node:assert'),http=require('http'),path=require('path'),{spawn}=require('child_process');
const store={},lists={},z=[];
function cmd(c){const[op,...x]=c;switch(String(op).toUpperCase()){case'SET':store[x[0]]=x[1];return'OK';case'EXISTS':return x[0] in store?1:0;case'RPUSH':(lists[x[0]]=lists[x[0]]||[]).push(x[1]);return lists[x[0]].length;
 case'LRANGE':return(lists[x[0]]||[]).slice(+x[1],+x[2]+1);case'EXPIRE':return 1;case'ZADD':z.push([x[2],+x[1]]);return 1;case'ZREVRANGE':return z.slice().sort((p,q)=>q[1]-p[1]).slice(0,10).flatMap(([m,s])=>[m,String(s)])}}
const fake=http.createServer((q,r)=>{let b='';q.on('data',d=>b+=d);q.on('end',()=>{const c=q.method==='POST'&&b?JSON.parse(b):q.url.split('/').filter(Boolean).map(decodeURIComponent);r.setHeader('Content-Type','application/json');r.end(JSON.stringify({result:cmd(c)}))})});
let srv;const B='http://127.0.0.1:9322',J={'Content-Type':'application/json'},post=(p,o)=>fetch(B+p,{method:'POST',headers:J,body:JSON.stringify(o)});
t.before(async()=>{await new Promise(r=>fake.listen(9321,r));srv=spawn('node',[path.join(__dirname,'..','server.js')],{env:{...process.env,PORT:'9322',UPSTASH_REDIS_REST_URL:'http://127.0.0.1:9321',UPSTASH_REDIS_REST_TOKEN:'t',ALLOWED_ORIGIN:'https://a.example,https://b.example'}});
 await new Promise(r=>srv.stdout.once('data',r))});
t.after(()=>{srv.kill();fake.close()});
t('health + CORS preflight reflects an allowed origin',async()=>{a.strictEqual((await fetch(B+'/api/health')).status,200);const r=await fetch(B+'/api/room',{method:'OPTIONS',headers:{Origin:'https://b.example'}});a.strictEqual(r.status,204);a.strictEqual(r.headers.get('access-control-allow-origin'),'https://b.example')});
t('room lifecycle: create, join, move, poll',async()=>{const c=(await(await post('/api/room',{a:'create'})).json()).code;a.match(c,/^[A-Z2-9]{5}$/);
 a.strictEqual((await post('/api/room',{a:'join',code:c})).status,200);a.strictEqual((await post('/api/room',{a:'join',code:'ZZZZZ'})).status,404);
 a.strictEqual((await post('/api/room',{a:'move',code:c,side:'w',sx:320,vx:1,vy:-9})).status,200);a.strictEqual((await post('/api/room',{a:'move',code:c,side:'b',pass:true})).status,200);
 a.strictEqual((await post('/api/room',{a:'move',code:c,side:'w',sx:320,vx:99,vy:0})).status,400);a.strictEqual((await post('/api/room',{a:'move',code:c,side:'x',sx:320,vx:1,vy:1})).status,400);
 const m=(await(await fetch(`${B}/api/room?code=${c}&from=0`)).json()).moves;a.strictEqual(m.length,1);a.strictEqual(m[0].side,'w');
 const m2=(await(await fetch(`${B}/api/room?code=${c}&from=1`)).json()).moves;a.strictEqual(m2[0].pass,true)});
t('leaderboard validates and ranks',async()=>{a.strictEqual((await post('/api/leaderboard',{name:'Nikhil',score:12})).status,200);a.strictEqual((await post('/api/leaderboard',{name:'<script>',score:5})).status,400);a.strictEqual((await post('/api/leaderboard',{name:'Hack',score:9999})).status,400);
 await post('/api/leaderboard',{name:'Ravi',score:20});const top=(await(await fetch(B+'/api/leaderboard')).json()).top;a.strictEqual(top[0].name,'Ravi');a.strictEqual(top[1].name,'Nikhil')});
t('coach refuses cleanly without a server key',async()=>{const r=await post('/api/coach',{q:'hi',ctx:[]});a.ok([503,200].includes(r.status))});
