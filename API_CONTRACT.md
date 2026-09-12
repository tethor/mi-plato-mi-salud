# Contrato API para la otra IA (frontend)

Backend: `python3 server.py` → `http://localhost:8471`
Sirve frontend + API en el mismo puerto. Sin dependencias, stdlib only.

## Endpoints

POST /api/upload — multipart/form-data, campo `photo` (jpg/png/webp, máx 15MB)
  Header `X-Admin-Token` con la clave (default `1234`, env `ADMIN_TOKEN`). Sin clave → 401.
  → 200 `{"id":"aB3x9Q","url":"http://HOST:8471/#/foto/aB3x9Q","file":"http://HOST:8471/f/aB3x9Q.jpg","thumb":"http://HOST:8471/t/aB3x9Q.jpg","name":"...","ts":1726...}`
  → 400 sin archivo · 401 sin clave · 413 si pasa 15MB
  `url` es lo que se codifica en el QR (vista pública del frontend).

GET /api/admin/check — verifica clave (header `X-Admin-Token`). 200 `{"ok":true}` · 401.

GET /api/photos — `[{id,url,file,name,ts}]`, recientes primero. Galería/home.
GET /api/photo/:id — una foto. 404 `{"error":...}` si no existe.
GET /f/:archivo — imagen directa.
GET /fotos/grupal.jpg — foto hero (la pone el operador, ver frontend/fotos/LEEME.txt).
GET /, /app.js, /styles.css — frontend.

CORS abierto. Sin auth (red local del evento; agregar token si se expone a internet).
DB en db.json: `{id: {file, name, ts}}`.

## Reglas del frontend

1. Cero datos inventados: galería y home salen de GET /api/photos.
2. El QR codifica `url` tal cual. Se genera en el navegador (qrcodejs).
3. Base por default: `location.origin` (mismo servidor). Override operador:
   `localStorage.setItem('MIPLAT_API_BASE','http://IP:8471')`.
4. Impresión térmica 57mm: componer JPG de 384px con QR 240px centrado.
   El QR tarda en generarse: esperar a que el <img> esté cargado antes de
   dibujarlo al canvas, nunca con timeout fijo (sale en blanco).
