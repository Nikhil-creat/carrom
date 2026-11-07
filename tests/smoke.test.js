// Loads the real index.html ids + scripts in a stubbed DOM and plays through every mode.
const t=require('node:test'),a=require('node:assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..'),rd=f=>fs.readFileSync(path.join(root,f),'utf8'),html=rd('index.html');
const ids=new Set([...html.matchAll(/id="([\w-]+)"/g)].map(m=>m[1]));
const DEF={lvl:'pro',mode:'ai',red:'red',tlim:'30',bo:'1',lang:'en',theme:'classic',sl:'320'};
function boot(){const els={},missing=[],raf=[],timers=[],errs=[];
 const ctx2d=()=>new Proxy(function(){},{get:(_,k)=>k==='createRadialGradient'||k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{},set:()=>true});
 const mk=id=>{const e={id,style:{},dataset:{},value:DEF[id]||'',checked:true,hidden:false,textContent:'',width:640,height:640,clientWidth:640,clientHeight:640,children:[],
  classList:{add(){},remove(){},contains:()=>false},addEventListener(){},setAttribute(){},removeAttribute(){},hasAttribute:()=>false,offsetWidth:0,
  getBoundingClientRect:()=>({left:0,top:0,width:640,height:640}),setPointerCapture(){},click(){e.onclick&&e.onclick()},getContext:ctx2d,
  querySelector:()=>mk('q'),querySelectorAll:()=>[],closest:()=>null};return e};
 const g={AbortController,URLSearchParams,clearTimeout(){},console,Math,Date,JSON,Promise,Array,Object,Number,String,Float32Array,isFinite,parseInt,sessionStorage:{getItem:()=>null,setItem(){}},localStorage:{getItem:()=>null,setItem(){}},
  navigator:{vibrate(){}},location:{pathname:'/',origin:'http://x',search:'',hash:''},performance:{now:()=>Date.now()},innerWidth:800,innerHeight:600,devicePixelRatio:1,
  matchMedia:()=>({matches:false}),requestAnimationFrame:cb=>raf.push(cb),setTimeout:cb=>{timers.push(cb);return 1},clearInterval(){},setInterval:cb=>{g.__tick=cb;return 2},addEventListener(){},
  fetch:()=>Promise.resolve({ok:false,status:503,json:async()=>({})}),
  document:{getElementById:id=>{if(!ids.has(id))missing.push(id);return els[id]||(els[id]=mk(id))},querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},body:{dataset:{}}}};
 g.window=g;const c=vm.createContext(g);
 for(const f of['ml.js','config.js','app.js','closing.js','cine.js']){try{vm.runInContext(rd(f),c,{filename:f})}catch(e){errs.push(f+': '+e.message)}}
 raf.length=0;const run=s=>vm.runInContext(s,c),flush=(n=4000)=>{for(let i=0;i<n;i++){const r=timers.length?null:raf.shift();if(timers.length)timers.shift()();else if(r)r(i*16);else break}};
 return{els,missing,errs,run,flush,g,raf,timers}}
t('every script loads without errors',()=>{const b=boot();a.deepStrictEqual(b.errs,[],'ERRS '+b.errs.join(' | '))});
t('every $() id used in app.js exists in index.html',()=>{const s=rd('app.js')+rd('cine.js'),used=new Set([...s.matchAll(/\$\('([\w-]+)'\)/g)].map(m=>m[1]));a.deepStrictEqual([...used].filter(x=>!ids.has(x)),[])});
for(const [name,setup] of [['vs agent (red mode)',''],['non-red mode',"$('red').value='nored';reset();"],['2 players',"$('mode').value='2p';reset();"],['doubles',"$('mode').value='4p';reset();"]])
 t('plays a full turn cycle: '+name,()=>{const b=boot();a.deepStrictEqual(b.errs,[],'ERRS '+b.errs.join(' | '));b.run(setup);
  b.run("fire(turn,320,0,-9)");b.flush();a.strictEqual(b.run('busy'),false);a.ok(Number.isFinite(b.run('scores.w+scores.b')));
  b.run("if(!busy&&!over)fire(turn,300,1,-8)");b.flush();b.g.document.getElementById('undo').click();b.g.document.getElementById('hint').click();b.flush();
  b.g.document.getElementById('replay').click();b.flush();b.run("passTurn()");b.flush();b.run("celebrate(true,'x');celebrate(false,'y');daily=true;reset();daily=false;reset();lang='te';applyLang();lang='hi';applyLang()");
  a.deepStrictEqual(b.missing,[])});
t('a full two-player game reaches the win screen',()=>{const b=boot();b.run("$('mode').value='2p';reset();");for(let i=0;i<500&&!b.run('over');i++){b.run("if(!busy)fire(turn,100+Math.random()*440,(Math.random()-.5)*8,(turn==='w'?-1:1)*(4+Math.random()*8))");b.flush(1500)}
 a.deepStrictEqual(b.errs,[],'ERRS '+b.errs.join(' | '));a.ok(b.run('scores.w+scores.b')>=0);a.deepStrictEqual(b.missing,[])});
t('the agent plays a move',()=>{const b=boot();b.run("fire('w',320,0,-9)");b.flush(3000);a.strictEqual(b.run('busy'),false);a.deepStrictEqual(b.errs,[])});
