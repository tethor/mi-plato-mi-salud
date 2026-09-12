"""Check de integración photobooth. Corre con: python3 test_api.py (server encendido)."""
import json, urllib.request, urllib.error

B = "http://127.0.0.1:8471"
n = 0
def check(name, cond):
    global n
    assert cond, f"FALLO: {name}"
    n += 1
    print(f"ok {n}: {name}")

def get(path):
    with urllib.request.urlopen(B + path) as r:
        return r.status, r.read()

def post_file(path, data, fname="t.jpg", ctype="image/jpeg", boundary="BND", admin=True):
    body = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"photo\"; filename=\"{fname}\"\r\n"
            f"Content-Type: {ctype}\r\n\r\n").encode() + data + f"\r\n--{boundary}--\r\n".encode()
    headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    if admin: headers["X-Admin-Token"] = "1234"
    req = urllib.request.Request(B + path, data=body, headers=headers)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()

# frontend vivo
s, home = get("/")
check("home 200", s == 200 and b"Mi Plato" in home)
s, _ = get("/app.js")
check("app.js 200", s == 200)
s, _ = get("/styles.css")
check("styles.css 200", s == 200)

# upload real (foto grande como las del evento)
from PIL import Image as _I
_big = "/tmp/big_test.jpg"
_I.new("RGB", (1600, 1200), (30, 150, 90)).save(_big, quality=92)
s, raw = post_file("/api/upload", open(_big, "rb").read(), fname="evento.jpg")
d = json.loads(raw)
check("upload 200", s == 200)
check("upload trae id/url/file/name", all(k in d for k in ("id", "url", "file", "name")))
check("url apunta a vista publica", f"#/foto/{d['id']}" in d["url"])
pid = d["id"]

# lectura
s, raw = get(f"/api/photo/{pid}")
check("photo 200 y coincide", s == 200 and json.loads(raw)["file"] == d["file"])
s, raw = get("/api/photos")
ids = [p["id"] for p in json.loads(raw)]
check("photos lista al nuevo", pid in ids)
s, img = get(f"/f/{d['file'].rsplit('/', 1)[1]}")
check("imagen directa 200", s == 200 and len(img) > 1000)
check("thumb en respuesta", "thumb" in d)
s, th = get(f"/t/{d['id']}.jpg")
check("thumb 200 y mas chica", s == 200 and len(th) < len(img))

# errores
s, _ = post_file("/api/upload", b"data", admin=False)
check("upload sin clave 401", s == 401)
try:
    get("/api/admin/check"); check("admin check sin clave 401", False)
except urllib.error.HTTPError as e:
    check("admin check sin clave 401", e.code == 401)
try:
    get("/api/photo/noexiste"); check("photo 404", False)
except urllib.error.HTTPError as e:
    check("photo 404", e.code == 404)
s, _ = post_file("/api/upload", b"")
check("upload vacio 400", s == 400)

# hero
def hero_req(method, data=None, admin=True):
    headers = {}
    if admin: headers["X-Admin-Token"] = "1234"
    if data: headers["Content-Type"] = "multipart/form-data; boundary=BND"
    req = urllib.request.Request(B + "/api/hero", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()
hb = (b"--BND\r\nContent-Disposition: form-data; name=\"photo\"; filename=\"h.jpg\"\r\n"
      b"Content-Type: image/jpeg\r\n\r\n" + open(_big, "rb").read() + b"\r\n--BND--\r\n")
s, _ = hero_req("POST", hb, admin=False)
check("hero sin clave 401", s == 401)
s, raw = hero_req("POST", hb)
check("hero upload 200", s == 200 and b"/f/hero.jpg" in raw)
s, raw = get("/api/hero")
check("hero get 200", s == 200)
s, _ = hero_req("DELETE")
check("hero delete 200", s == 200)
try:
    get("/api/hero"); check("hero get 404 tras borrar", False)
except urllib.error.HTTPError as e:
    check("hero get 404 tras borrar", e.code == 404)

print(f"\nTODO OK: {n} checks")
