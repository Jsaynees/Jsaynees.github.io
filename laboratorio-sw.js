/* Guarda la app en el teléfono para que abra sin señal.
   Los datos del profesor NO pasan por aquí: viven en localStorage. */
const CACHE = "laboratorio-v2";
const ARCHIVOS = [
  "laboratorio.html",
  "laboratorio.webmanifest",
  "img/lab-icon-180.png",
  "img/lab-icon-512.png",
  "img/logo-descartes.png",
  "img/siunam.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* Primero la red, para que una versión nueva llegue sola;
   si no hay señal, lo guardado. */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("laboratorio.html")))
  );
});
