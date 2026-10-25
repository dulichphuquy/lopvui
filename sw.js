/* Lớp Vui – service worker: giữ sẵn app và kho câu hỏi trong máy để chạy khi mất mạng.
   Có bản mới thì tải ngầm, app báo "Có bản Lớp Vui mới · Cập nhật"; thầy cô bấm thì mới đổi (không đổi giữa tiết học). */
const VERSION = "lopvui-74a5efb21c95";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "kho/index.json", "kho/ly10.txt"];
self.addEventListener("install", e => e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("lopvui-") && k !== VERSION && k !== "lopvui-fonts").map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener("message", e => { if (e.data === "skip") self.skipWaiting(); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  // Phông chữ Google: lấy một lần, giữ lại dùng khi mất mạng
  if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.open("lopvui-fonts").then(c => c.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok || res.type === "opaque") c.put(r, res.clone()); return res; }).catch(() => hit))));
    return;
  }
  if (u.origin !== location.origin) return;
  // Trang chính: dùng bản đã giữ trong máy (mở nhanh, chạy được khi mất mạng)
  if (r.mode === "navigate") { e.respondWith(caches.match("index.html", { ignoreSearch: true }).then(hit => hit || fetch(r))); return; }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r)));
});
