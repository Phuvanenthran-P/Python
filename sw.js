// Simple service worker for offline caching
const CACHE='learnpy-v1';
const ASSETS=[
  './','./index.html','./styles.css','./app.js','./lessons.js','./quizzes.js',
  './manifest.json','./assets/icon-192.png','./assets/icon-512.png'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE&&caches.delete(k)))));
});
self.addEventListener('fetch',e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
