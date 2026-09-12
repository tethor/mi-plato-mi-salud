"""Photobooth QR backend — stdlib only. Corre con: python3 server.py"""
import cgi, json, os, secrets, time, mimetypes
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

BASE = Path(__file__).parent
UP = BASE / "uploads"
UP.mkdir(exist_ok=True)
FE = BASE / "frontend"
(FE / "fotos").mkdir(parents=True, exist_ok=True)
STATIC = {"/": "index.html", "/app.js": "app.js", "/styles.css": "styles.css"}
DB = UP / "db.json"
if not DB.exists(): DB.write_text("{}")
PORT = int(os.environ.get("PORT", 8471))
PUBLIC = os.environ.get("PUBLIC_URL", "").rstrip("/")  # ej: https://fotos.midominio.com
MAXB = 15 * 1024 * 1024  # ponytail: tope fijo para fotos; súbelo si aceptas video

def load_db(): return json.loads(DB.read_text())
def save_db(d): DB.write_text(json.dumps(d))

class H(BaseHTTPRequestHandler):
    def log_message(self, format, *args): pass
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
    def _send(self, b, ctype):
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(b)))
        self._cors(); self.end_headers(); self.wfile.write(b)
    def _json(self, code, obj):
        b = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(b)))
        self._cors(); self.end_headers(); self.wfile.write(b)
    def _file(self, f, ctype=None):
        f = f.resolve()
        if f.parent != UP and f.parent != FE / "fotos" or not f.is_file():
            self.send_response(404); self.end_headers(); return
        self._send(f.read_bytes(), ctype or mimetypes.guess_type(str(f))[0] or "image/jpeg")
    def _host(self):
        # ponytail: URL fija por env en prod; Host del request solo en local
        return PUBLIC or f"http://{self.headers.get('Host', f'localhost:{PORT}')}"
    def _rec(self, pid, r):
        host = self._host()
        return {"id": pid, "url": f"{host}/#/foto/{pid}",
                "file": f"{host}/f/{r['file']}", "name": r["name"], "ts": r["ts"]}
    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()
    def do_GET(self):
        path = self.path.split("?")[0]
        db = load_db()
        if path in STATIC:
            f = FE / STATIC[path]
            if not f.exists():
                self.send_response(404); self.end_headers(); return
            self._send(f.read_bytes(), mimetypes.guess_type(str(f))[0] or "text/html")
        elif path == "/api/photos":
            recs = sorted(db.items(), key=lambda kv: kv[1]["ts"], reverse=True)
            self._json(200, [self._rec(pid, r) for pid, r in recs])
        elif path.startswith("/api/photo/"):
            pid = path[len("/api/photo/"):].strip("/")
            if pid not in db:
                self._json(404, {"error": "esa foto ya no está disponible"}); return
            self._json(200, self._rec(pid, db[pid]))
        elif path.startswith("/fotos/"):
            self._file(FE / "fotos" / path[len("/fotos/"):].strip("/"))
        elif path.startswith("/f/"):
            self._file(UP / path[3:].strip("/"))
        else:
            self.send_response(404); self.end_headers()
    def do_POST(self):
        if self.path != "/api/upload":
            self.send_response(404); self.end_headers(); return
        try:
            if int(self.headers.get("Content-Length", 0)) > MAXB:
                self.send_response(413); self.send_header("Connection", "close")
                self.end_headers(); return
        except ValueError:
            pass
        form = cgi.FieldStorage(fp=self.rfile, headers=self.headers,
            environ={"REQUEST_METHOD": "POST", "CONTENT_TYPE": self.headers.get("Content-Type")})
        item = form["photo"] if "photo" in form else None
        if isinstance(item, list): item = item[0] if item else None
        if item is None or not item.file:
            self._json(400, {"error": "manda 'photo' como archivo"}); return
        ext = Path(item.filename or "f.jpg").suffix.lower() or ".jpg"
        if ext not in (".jpg", ".jpeg", ".png", ".webp"): ext = ".jpg"
        blob = item.file.read(MAXB + 1)
        if not blob:
            self._json(400, {"error": "el archivo viene vacio"}); return
        if len(blob) > MAXB:
            self._json(413, {"error": "foto muy pesada, max 15MB"}); return
        pid = secrets.token_urlsafe(4).replace("-", "").replace("_", "")[:6]
        fname = f"{pid}{ext}"
        UP.joinpath(fname).write_bytes(blob)
        name = Path(item.filename or "foto").stem[:60] or "foto"
        db = load_db()
        db[pid] = {"file": fname, "name": name, "ts": int(time.time())}
        save_db(db)
        self._json(200, self._rec(pid, db[pid]))

if __name__ == "__main__":
    print(f"photobooth en http://localhost:{PORT}")
    HTTPServer(("0.0.0.0", PORT), H).serve_forever()
