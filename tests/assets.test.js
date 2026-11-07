const t=require('node:test'),a=require('node:assert'),fs=require('fs'),path=require('path');process.chdir(path.join(__dirname,'..'));
const html=fs.readFileSync('index.html','utf8'),assets=[...html.matchAll(/(?:src|href)="([\w.-]+\.(?:js|css|svg|webmanifest|json))"/g)].map(m=>m[1]);
const docker=fs.readFileSync('Dockerfile','utf8'),server=fs.readFileSync('server.js','utf8'),sw=fs.readFileSync('sw.js','utf8');
t('every asset exists and is shipped by Docker + server.js',()=>{a.ok(assets.length>=8);for(const f of assets){a.ok(fs.existsSync(f),f+' missing');a.ok(docker.includes(f),f+' not in Dockerfile');a.ok(server.includes("'"+f+"'"),f+' not served by server.js')}});
t('service worker precache lists real files',()=>{for(const m of sw.matchAll(/'\/([\w.-]+)'/g))a.ok(fs.existsSync(m[1]),m[1])});
t('.env.example covers render.yaml keys',()=>{const env=fs.readFileSync('.env.example','utf8');for(const m of fs.readFileSync('render.yaml','utf8').matchAll(/key: (\w+)/g))a.ok(env.includes(m[1]),m[1])});
t('CSP allows Render + fonts',()=>{for(const f of['index.html','vercel.json']){const s=fs.readFileSync(f,'utf8');a.ok(s.includes('onrender.com')&&s.includes('fonts.gstatic.com'),f)}});
