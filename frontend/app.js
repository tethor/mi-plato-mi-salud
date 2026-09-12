/* Mi Plato, Mi Salud — frontend del evento.
   Las fotos salen del backend, aquí no hay nada inventado. */
const API_BASE = localStorage.getItem('MIPLAT_API_BASE') || location.origin;
const HERO_PHOTO = 'fotos/grupal.jpg';

function mascotSVG(size=120){return `<svg viewBox="0 0 160 160" width="${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="80" cy="82" r="54" fill="#fff" stroke="#1b6b45" stroke-width="6"/><path d="M44 67c9-21 27-32 51-31 17 1 26 8 33 18-22-2-35 12-43 25-15-1-27-4-41-12Z" fill="#80c849"/><path d="M58 73c14-16 34-19 51-12-2 34-15 55-40 54-17-1-23-19-11-42Z" fill="#f2ce53"/><circle cx="65" cy="84" r="5" fill="#173b32"/><circle cx="92" cy="84" r="5" fill="#173b32"/><path d="M67 101q13 11 26 0" fill="none" stroke="#e95f73" stroke-width="4" stroke-linecap="round"/><path d="M48 122 34 145M112 122l15 23" stroke="#173b32" stroke-width="8" stroke-linecap="round"/><path d="M34 145h-14M127 145h14" stroke="#4fa8d0" stroke-width="9" stroke-linecap="round"/></svg>`}

function nav(){return `<header class="nav"><div class="nav-inner"><a class="brand" href="#/" style="text-decoration:none;color:inherit"><div class="brand-mark">${mascotSVG(36)}</div><span>Mi Plato, Mi Salud</span></a><nav class="nav-links"><a href="#/">Inicio</a><a href="#/galeria">Galería</a><a href="#/subir">Subir foto</a></nav></div></header>`}
function footer(){return `<footer class="footer"><div class="container footer-inner"><div><strong>Mi Plato, Mi Salud</strong><br>IMSS UMF 178 · Evento escolar</div><div>Pequeños hábitos, grandes cambios. ♥</div></div></footer>`}
function shell(content){document.querySelector('#app').innerHTML=`<div class="page">${nav()}${content}${footer()}</div>`}
function fmt(ts){try{return new Date(ts*1000).toLocaleString('es-MX',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}catch(e){return ''}}
function safeName(s){return String(s||'foto').replace(/[^\wáéíóúñü \-]+/gi,'').slice(0,60)||'foto'}

async function getPhotos(){
  const res = await fetch(`${API_BASE}/api/photos`);
  if(!res.ok) throw new Error('api');
  return res.json();
}

function heroArt(){
  return `<div class="hero-art"><div class="blob"></div>`
    + `<img class="hero-photo" src="${HERO_PHOTO}" alt="Foto grupal del evento" onload="document.getElementById('heroDefault').style.display='none'" onerror="this.remove()">`
    + `<div id="heroDefault"><div class="bubble">¡Hoy aprendimos<br>a comer mejor! 💚</div><div class="plate-card"><div class="plate-top"><span class="mini-tag">PLATO DEL BUEN COMER</span><span style="font-size:26px">🍎🥦</span></div><div class="plate"><span class="food a">🥦</span><span class="food b">🌽</span><span class="food c">🍎</span><span class="food d">💧</span></div><div style="text-align:center;font-weight:900;margin-top:8px">¡Hoy elegimos comer mejor!</div></div><div class="mascot">${mascotSVG(130)}</div><span class="spark s1">✦</span><span class="spark s2">●</span><span class="spark s3">✿</span></div></div>`;
}

function platoSection(){
  return `<section class="section"><div class="container"><div class="section-head"><div><div class="eyebrow">Hoy aprendimos</div><h2>El Plato del Buen Comer</h2></div><p>Comer bien es fácil cuando el plato tiene de todo un poco. Esto fue lo que descubrieron hoy los niños:</p></div>`
  + `<div class="cards">`
  + `<div class="card"><div class="stat-icon" style="background:#edf8df">🥦</div><h3>Verduras y frutas</h3><p>Las de todos los colores. Entre más colores en tu plato, mejor.</p></div>`
  + `<div class="card"><div class="stat-icon" style="background:#fff0bd">🌽</div><h3>Tortilla, arroz y papa</h3><p>Nos dan la energía para jugar, correr y aprender.</p></div>`
  + `<div class="card"><div class="stat-icon" style="background:#fde8ed">🫘</div><h3>Frijoles, lentejas y huevo</h3><p>Nos ayudan a crecer fuertes. También el pollo y el pescado.</p></div>`
  + `<div class="card"><div class="stat-icon" style="background:#e4f5fb">💧</div><h3>Agua y movimiento</h3><p>Agua simple todos los días y salir a jugar. Así se cuida el cuerpo.</p></div>`
  + `</div></div></section>`;
}

function momentosHTML(photos, total){
  if(!photos.length) return `<div class="empty"><strong>Las fotos aparecerán aquí 📸</strong><p>En cuanto se suban las primeras fotos del evento, las verás en este lugar.</p></div>`;
  return `<div class="gallery-grid">${photos.map(photoCard).join('')}</div>`
    + (total > photos.length ? `<div class="view-all"><a class="btn btn-soft" href="#/galeria">Ver toda la galería →</a></div>` : '');
}

async function home(){
  shell(`<main><section class="hero"><div class="container hero-grid"><div><span class="kicker">IMSS · UMF 178 · Evento escolar</span><h1>Mi Plato,<br><span class="grad">Mi Salud</span> ✦</h1><p>Mamá, papá: aquí están las fotos de lo que vivieron hoy sus hijos. Juegos, actividades y lo que aprendieron sobre comer mejor. 💚</p><div class="cta-row"><a class="btn btn-primary" href="#/galeria">📸 Ver las fotos</a><a class="btn btn-soft" href="#/subir">＋ Subir foto</a></div></div>${heroArt()}</div></section>`
  + platoSection()
  + `<section class="section" style="padding-top:10px"><div class="container"><div class="section-head"><div><div class="eyebrow">Recuerdos</div><h2>Lo que vivimos hoy</h2></div></div><div id="momentos"><div class="empty"><strong>Cargando fotos…</strong></div></div></div></section></main>`);
  try{
    const photos = await getPhotos();
    document.getElementById('momentos').innerHTML = momentosHTML(photos.slice(0,6), photos.length);
  }catch(e){
    document.getElementById('momentos').innerHTML = `<div class="empty"><strong>Todavía no hay fotos 📸</strong><p>En cuanto se suban las primeras fotos del evento, las verás en este lugar.</p></div>`;
  }
}

function photoCard(p){
  return `<a href="#/foto/${p.id}" class="photo-card" style="text-decoration:none" aria-label="Ver ${safeName(p.name)}"><img src="${p.file}" alt="${safeName(p.name)}" loading="lazy"/><div class="overlay"><div style="font-weight:900">${safeName(p.name)}</div><div class="tiny" style="color:#fff">${fmt(p.ts)}</div></div></a>`;
}

async function gallery(){
  shell(`<main class="inner-page"><div class="container"><div class="page-title"><div><div class="eyebrow">Recuerdos del evento</div><h1>Galería 📸</h1><p>Aquí están todas las fotos del día. Toca una para verla en grande.</p></div><div class="toolbar"><input class="search" id="search" placeholder="Buscar foto…"/><a class="btn btn-primary" href="#/subir">＋ Subir foto</a></div></div><div class="gallery-grid" id="gallery"><div class="empty" style="grid-column:1/-1"><strong>Cargando fotos…</strong></div></div></div></main>`);
  let photos = [];
  try{ photos = await getPhotos(); }catch(e){
    document.getElementById('gallery').innerHTML = `<div class="empty" style="grid-column:1/-1"><strong>No se pudieron cargar las fotos</strong><p>Revisa la conexión e inténtalo de nuevo.</p></div>`;
    return;
  }
  const paint = q => {
    const list = photos.filter(p => (p.name||'').toLowerCase().includes(q));
    document.getElementById('gallery').innerHTML = list.length ? list.map(photoCard).join('')
      : `<div class="empty" style="grid-column:1/-1"><strong>${photos.length ? 'No hay fotos con ese nombre' : 'Todavía no hay fotos 📸'}</strong><p>${photos.length ? 'Prueba con otra palabra.' : 'Sé la primera persona en subir una del evento.'}</p></div>`;
  };
  paint('');
  document.getElementById('search').addEventListener('input', e => paint(e.target.value.toLowerCase()));
}

async function upload(){
  shell(`<main class="inner-page"><div class="container"><div class="page-title"><div><div class="eyebrow">Estación de fotos</div><h1>Foto + QR</h1><p>Elige la foto y aquí mismo sale su QR para imprimir.</p></div><div class="tiny" id="apiState">Revisando conexión…</div></div><div class="upload-shell"><label class="drop" for="photo"><div><div class="big">📷</div><h2 style="font-family:'Baloo 2';font-size:34px;margin:6px 0">Elige una foto</h2><p style="color:#60756b">Se vale JPG, PNG o WEBP</p><input id="photo" type="file" accept="image/*"/></div></label><section class="upload-preview"><div id="uploadState"><div style="padding:38px;text-align:center;color:#73847c">La foto y su QR aparecerán aquí.</div></div></section></div></div></main>`);
  document.getElementById('photo').addEventListener('change', handleUpload);
  try{ await getPhotos(); document.getElementById('apiState').innerHTML = 'Listo para recibir fotos ✓'; }
  catch(e){ document.getElementById('apiState').innerHTML = 'Sin conexión con el servidor. Revísalo antes de seguir.'; }
}

async function handleUpload(e){
  const file = e.target.files?.[0];
  if(!file) return;
  const box = document.getElementById('uploadState');
  const local = URL.createObjectURL(file);
  box.innerHTML = `<div class="preview-grid"><div class="preview-img"><img src="${local}" alt="Vista previa"/></div><div class="qr-box"><h4>Creando tu QR…</h4><div class="qr-canvas"></div><div class="tiny">Subiendo la foto…</div></div></div>`;
  const form = new FormData();
  form.append('photo', file);
  try{
    const res = await fetch(`${API_BASE}/api/upload`, {method:'POST', body:form});
    if(!res.ok) throw new Error('upload');
    renderQR(await res.json(), local);
  }catch(err){
    URL.revokeObjectURL(local);
    box.innerHTML = `<div class="empty"><strong>No se pudo subir la foto</strong><p>Revisa la conexión e inténtalo de nuevo.</p></div>`;
  }
}

function renderQR(data, localURL){
  const box = document.getElementById('uploadState');
  box.innerHTML = `<div class="preview-grid"><div><div class="preview-img"><img src="${localURL}" alt="Foto seleccionada"/></div><div class="tiny" style="margin-top:9px">${safeName(data.name)} · ya está en la galería ✓</div></div><div><div class="qr-box"><h4>Tu QR está listo</h4><div class="qr-canvas" id="qr"></div><div class="tiny">Escanea para abrir esta foto.</div></div><div class="cta-row" style="margin-top:14px"><button class="btn btn-primary" id="shareQR">Compartir / imprimir</button><button class="btn btn-soft" id="copyLink">Copiar enlace</button></div><div style="margin-top:10px"><a class="tiny" href="#/foto/${data.id}">Ver cómo se ve →</a></div></div></div>`;
  new QRCode(document.getElementById('qr'), {text:data.url, width:240, height:240, colorDark:'#173b32', colorLight:'#fff', correctLevel:QRCode.CorrectLevel.M});
  document.getElementById('copyLink').onclick = async ev => {
    try{ await navigator.clipboard.writeText(data.url); ev.target.textContent = '¡Copiado! ✓'; }
    catch(e){ ev.target.textContent = 'No se pudo copiar'; }
    setTimeout(() => ev.target.textContent = 'Copiar enlace', 2000);
  };
  document.getElementById('shareQR').onclick = () => sharePrintableQR(data.url);
}

/* Espera a que el QR exista de verdad antes de dibujarlo.
   Sin esto el papel puede salir en blanco. */
function qrImage(text, size){
  return new Promise(res => {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(t);
    new QRCode(t, {text, width:size, height:size, correctLevel:QRCode.CorrectLevel.M});
    const t0 = Date.now();
    (function chk(){
      const img = t.querySelector('img');
      if(img && img.complete && img.naturalWidth > 0){ t.remove(); return res(img); }
      if(Date.now() - t0 > 2500){ const cv = t.querySelector('canvas'); t.remove(); return res(cv || null); }
      setTimeout(chk, 50);
    })();
  });
}

async function sharePrintableQR(url){
  const c = document.createElement('canvas');
  c.width = 384; c.height = 380;
  const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 384, 380);
  x.fillStyle = '#176b44'; x.font = '800 24px Nunito, sans-serif'; x.textAlign = 'center';
  x.fillText('MI PLATO, MI SALUD', 192, 38);
  const qr = await qrImage(url, 240);
  if(!qr){ alert('No se pudo generar el QR. Inténtalo de nuevo.'); return; }
  x.drawImage(qr, 72, 62, 240, 240);
  x.fillStyle = '#173b32'; x.font = '800 20px Nunito, sans-serif';
  x.fillText('Escanea para ver tu foto', 192, 334);
  x.fillStyle = '#7d8a83'; x.font = '600 13px Nunito, sans-serif';
  x.fillText('IMSS · UMF 178', 192, 360);
  c.toBlob(async blob => {
    if(!blob) return;
    const f = new File([blob], 'qr.jpg', {type:'image/jpeg'});
    try{
      if(navigator.canShare?.({files:[f]})){ await navigator.share({files:[f], title:'Mi foto'}); return; }
    }catch(e){ if(e?.name === 'AbortError') return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'qr.jpg'; a.click();
  }, 'image/jpeg', .92);
}

async function publicPhoto(id){
  shell(`<main class="photo-page"><div class="container photo-wrap"><div class="empty"><strong>Cargando foto…</strong></div></div></main>`);
  let p;
  try{
    const res = await fetch(`${API_BASE}/api/photo/${encodeURIComponent(id)}`);
    if(!res.ok) throw new Error('missing');
    p = await res.json();
  }catch(e){
    shell(`<main class="photo-page"><div class="container photo-wrap"><a class="back" href="#/galeria">← Volver a la galería</a><div class="empty" style="margin-top:18px"><strong>Esta foto ya no está disponible</strong><p>Pero hay más recuerdos del evento esperándote.</p><p><a class="btn btn-primary" href="#/galeria" style="text-decoration:none">Ver la galería</a></p></div></div></main>`);
    return;
  }
  shell(`<main class="photo-page"><div class="container photo-wrap"><a class="back" href="#/galeria">← Volver a la galería</a><div class="photo-card-large" style="margin-top:18px"><div class="photo-large"><img src="${p.file}" alt="${safeName(p.name)}"/></div><div class="qr-side"><div class="eyebrow">Recuerdo del evento</div><h1>¡Tu foto está lista! 📸</h1><p>Gracias por ser parte de <strong>Mi Plato, Mi Salud</strong>. Guárdala y presume lo que aprendiste hoy. 💚</p><div class="public-qr" id="publicQR"></div><div class="tiny" style="margin-bottom:14px">Escanea este código desde otro celular para pasar la foto.</div><div class="public-actions"><button class="btn btn-primary" id="dlPhoto">Descargar foto</button><a class="btn btn-soft" href="#/galeria">Ver más recuerdos</a></div></div></div></div></main>`);
  new QRCode(document.getElementById('publicQR'), {text:location.href, width:220, height:220, colorDark:'#176b44', colorLight:'#fff', correctLevel:QRCode.CorrectLevel.M});
  document.getElementById('dlPhoto').onclick = () => downloadPhoto(p.file, p.name);
}

async function downloadPhoto(url, name){
  try{
    const r = await fetch(url);
    if(!r.ok) throw new Error('dl');
    const b = await r.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = safeName(name) + '.jpg';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }catch(e){ window.open(url, '_blank'); }
}

function router(){
  const hash = location.hash || '#/';
  const parts = hash.slice(2).split('/');
  if(parts[0] === 'galeria') gallery();
  else if(parts[0] === 'subir') upload();
  else if(parts[0] === 'foto') publicPhoto(parts[1]);
  else home();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', router);
router();
