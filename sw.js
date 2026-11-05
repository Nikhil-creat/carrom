const K='cx-v6',A=['/','/index.html','/style.css','/app.js','/manifest.webmanifest','/icon.svg','/ml.js','/model.json','/closing.css','/closing.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(K).then(c=>c.addAll(A))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==K).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api'))return;
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(K).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
