const http = require("http"); 
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data.json");

/* ---------- Pomocné funkce ---------- */
function readData() {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
function sendJSON(res, status, data) {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data));
}
function sendHTML(res, html) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
}

/* ---------- CSS ---------- */
const CSS_STYLE = `
*{margin:0;padding:0;box-sizing:border-box;font-family:"Segoe UI",Arial,sans-serif;}
body{background:#f1f1f1;color:#111;min-height:100vh;display:flex;flex-direction:column;transition:0.3s;}
body.dark-mode{background:#0d0f13;color:#f1f1f1;}
header{position:sticky;top:0;background:linear-gradient(90deg,#0d0f13,#1a1c22,#0d0f13);padding:18px 50px;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #c9a24d;}
header .logo img{height:55px;}
nav{display:flex;align-items:center;}
nav a{color:#c9a24d;text-decoration:none;margin-left:30px;font-weight:600;}
.toggle{margin-left:20px;background:none;border:2px solid #c9a24d;color:#c9a24d;padding:6px 12px;cursor:pointer;border-radius:20px;}
.sort-box{position:relative;margin-left:20px;}
.sort-btn{background:none;border:2px solid #c9a24d;color:#c9a24d;padding:6px 12px;cursor:pointer;border-radius:20px;font-weight:600;}
.sort-options{position:absolute;right:0;top:40px;background:#fff;border:1px solid #c9a24d;border-radius:15px;overflow:hidden;display:none;flex-direction:column;min-width:200px;z-index:10;}
body.dark-mode .sort-options{background:#1a1c22;}
.sort-options button{border:none;background:none;color:#111;padding:10px;text-align:left;cursor:pointer;font-weight:600;}
body.dark-mode .sort-options button{color:#c9a24d;}
.sort-options button:hover{background:#c9a24d;color:#111;}
main{max-width:1400px;margin:50px auto;display:grid;gap:40px;padding:0 30px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));scroll-padding-top: 80px;}
.car{background:white;border-radius:25px;padding:20px;box-shadow:0 20px 45px rgba(0,0,0,0.15);text-align:center;transition:0.3s;}
body.dark-mode .car{background:#1a1c22;box-shadow:0 20px 45px rgba(0,0,0,0.6);}
.car:hover{transform:translateY(-10px);box-shadow:0 30px 65px rgba(0,0,0,0.25);}
.car img.auto{width:100%;border-radius:15px;}
.car h2{margin:15px 0;font-size:20px;letter-spacing:2px;}
.info{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:10px;align-items:center;}
.label{display:block;font-size:12px;color:#777;letter-spacing:1px;}
body.dark-mode .label{color:#aaa;}
.flag{width:40px;border-radius:6px;box-shadow:0 0 6px rgba(0,0,0,0.3);}
.actions{margin-top:20px;display:flex;justify-content:center;gap:10px;}
.actions button{padding:8px 18px;border-radius:20px;border:none;cursor:pointer;font-weight:600;letter-spacing:1px;}
.btn-edit{background:#c9a24d;color:#111;}
.btn-edit:hover{background:#e0b85c;}
.btn-delete{background:#b33434;color:white;}
.btn-delete:hover{background:#d94a4a;}
footer{background:linear-gradient(90deg,#0d0f13,#1a1c22,#0d0f13);color:#c9a24d;padding:50px 20px;text-align:center;border-top:2px solid #c9a24d;}
footer img{height:45px;margin-bottom:20px;}
footer h3{letter-spacing:3px;margin-bottom:10px;}
footer p{color:#9a9a9a;font-size:14px;}
form{width:100%;max-width:600px;background:white;border-radius:25px;padding:30px;box-shadow:0 15px 35px rgba(0,0,0,0.1);display:flex;flex-direction:column;gap:20px;margin:0 auto;}
body.dark-mode form{background:#1a1c22;}
form h2{text-align:center;margin-bottom:20px;}
.form-group{display:flex;flex-direction:column;}
.form-group input{padding:10px 14px;border-radius:10px;border:1px solid #ccc;}
body.dark-mode input{background:#2a2c33;color:white;border:1px solid #555;}
.preview{margin-top:10px;max-width:100%;border-radius:15px;display:none;box-shadow:0 5px 15px rgba(0,0,0,0.2);}
button{background:#c9a24d;color:#111;padding:14px;border-radius:25px;border:none;font-weight:600;cursor:pointer;}
button:hover{background:#e0b85c;}
.confirm-box{background:white;border-radius:35px;padding:50px 40px;max-width:480px;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.2);margin:100px auto;}
.confirm-box h1{letter-spacing:3px;margin-bottom:20px;}
.confirm-box p{color:#666;margin-bottom:35px;line-height:1.6;}
.buttons{display:flex;justify-content:center;gap:25px;}
.buttons button{border:none;padding:14px 30px;border-radius:30px;font-size:15px;font-weight:600;cursor:pointer;}
.yes{background:#c94d4d;color:white;}
.no{background:#ccc;color:#111;}
.yes:hover{background:#b13f3f;}
.no:hover{background:#bbb;}
#toast{position:fixed;left:25px;bottom:25px;background:#1a1c22;color:#c9a24d;padding:14px 22px;border-radius:15px;box-shadow:0 15px 35px rgba(0,0,0,0.4);font-size:14px;opacity:0;pointer-events:none;transition:opacity 0.4s;}
#toast.show{opacity:1;}
`;

/* ---------- Server ---------- */
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url,true);
    const pathname = parsedUrl.pathname;
    // Servírování statických souborů (logo, fotky aut, CSS)
if(req.method === "GET" && pathname.startsWith("/")) {
    const filePath = path.join(__dirname, pathname);
    if(fs.existsSync(filePath) && fs.statSync(filePath).isFile()){
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".css": "text/css"
        };
        const contentType = mimeTypes[ext] || "application/octet-stream";
        res.writeHead(200, {"Content-Type": contentType});
        fs.createReadStream(filePath).pipe(res);
        return;
    }
}

    /* ===== ÚVOD / Hlavní stránka ===== */
    if(req.method==="GET" && (pathname==="/" || pathname==="/index.html")){
        const html=`<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8"><title>Katalog sportovních aut</title><style>${CSS_STYLE}</style></head><body>
<header><div class="logo"><img src="logo.png"></div>
<nav>
<a href="/">ÚVOD</a>
<a href="/pridat.html">PŘIDAT</a>
<div class="sort-box"><button class="sort-btn" onclick="toggleSort()">Řadit ▼</button>
<div class="sort-options" id="sortOptions">
<button onclick="applySort('nazev-az')">Název A-Z</button>
<button onclick="applySort('nazev-za')">Název Z-A</button>
<button onclick="applySort('rok-up')">Rok ↑</button>
<button onclick="applySort('rok-down')">Rok ↓</button>
<button onclick="applySort('rychlost-up')">Top speed ↑</button>
<button onclick="applySort('rychlost-down')">Top speed ↓</button>
<button onclick="applySort('zrychleni-up')">0-100 ↑</button>
<button onclick="applySort('zrychleni-down')">0-100 ↓</button>
</div></div>
<button class="toggle" onclick="toggleMode()">☀/☾</button>
</nav></header>
<main id="carsContainer"></main>
<footer><img src='logo.png'><h3>Katalog sportovních aut</h3><p>Adam Zdráhal</p></footer>
<script>
let currentSort=''; 
function toggleMode(){document.body.classList.toggle('dark-mode'); localStorage.setItem('darkMode',document.body.classList.contains('dark-mode'));}
window.onload=()=>{if(localStorage.getItem('darkMode')==='true') document.body.classList.add('dark-mode'); fetchCars();}
function toggleSort(){document.getElementById('sortOptions').style.display=(document.getElementById('sortOptions').style.display==='flex'?'none':'flex');}
function applySort(sortKey){currentSort=sortKey;document.getElementById('sortOptions').style.display='none';fetchCars();}
function fetchCars(){fetch('/items').then(r=>r.json()).then(data=>{
let cars=data;
if(currentSort==='nazev-az') cars.sort((a,b)=>a.nazev.localeCompare(b.nazev));
if(currentSort==='nazev-za') cars.sort((a,b)=>b.nazev.localeCompare(a.nazev));
if(currentSort==='rok-up') cars.sort((a,b)=>a.vyroba-b.vyroba);
if(currentSort==='rok-down') cars.sort((a,b)=>b.vyroba-a.vyroba);
if(currentSort==='rychlost-up') cars.sort((a,b)=>a.rychlost-b.rychlost);
if(currentSort==='rychlost-down') cars.sort((a,b)=>b.rychlost-a.rychlost);
if(currentSort==='zrychleni-up') cars.sort((a,b)=>a.zrychleni-b.zrychleni);
if(currentSort==='zrychleni-down') cars.sort((a,b)=>b.zrychleni-a.zrychleni);

let container=document.getElementById('carsContainer'); container.innerHTML='';
cars.forEach(car=>{
let card=document.createElement('div'); card.className='car';
card.innerHTML=\`<img class='auto' src='\${car.auto}'><h2>\${car.nazev}</h2><div class='info'><div><span class='label'>ROK</span>\${car.vyroba}</div><div><span class='label'>TOP SPEED</span>\${car.rychlost}</div><div><span class='label'>0-100</span>\${car.zrychleni}</div><div><img class='flag' src='\${car.vlajka}'></div></div><div class='actions'><button onclick="window.location='/smazat.html?id=\${car.id}'" class='btn-delete'>SMAZAT</button><button onclick="window.location='/upravit.html?id=\${car.id}'" class='btn-edit'>UPRAVIT</button></div>\`;
container.appendChild(card);
});
});}
</script></body></html>`;
        return sendHTML(res,html);
    }

/* ===== Přidat auto ===== */
if(req.method==="GET" && pathname==="/pridat.html"){
    const html=`<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8"><title>Přidat auto</title><style>${CSS_STYLE}</style></head><body>
<header><div class='logo'><img src='logo.png'></div>
<nav><a href='/'>ÚVOD</a><a href='/pridat.html'>PŘIDAT</a><button class='toggle' onclick='toggleMode()'>☀/☾</button></nav></header>
<main>
<form id='addForm'>
<h2>Přidat nové auto</h2>
<div class='form-group'><label>Název auta</label><input type='text' id='carName' required></div>
<div class='form-group'><label>Max. rychlost (km/h)</label><input type='number' id='topSpeed' required></div>
<div class='form-group'><label>0–100 (s)</label><input type='number' step='0.1' id='zeroToHundred' required></div>
<div class='form-group'><label>Rok výroby</label><input type='number' id='year' required></div>
<div class='form-group'><label>URL fotky auta</label><input type='text' id='carImage' oninput='previewCar()' required><img id='carPreview' class='preview'></div>
<div class='form-group'><label>URL vlajky</label><input type='text' id='flagImage' oninput='previewFlag()' required><img id='flagPreview' class='preview' style='max-width:80px;'></div>
<button type='submit'>Přidat auto</button>
</form>
</main>
<footer><img src='logo.png'><h3>Katalog sportovních aut</h3><p>Adam Zdráhal</p></footer>
<script>
function toggleMode(){document.body.classList.toggle('dark-mode'); localStorage.setItem('darkMode',document.body.classList.contains('dark-mode'));}
window.onload=()=>{if(localStorage.getItem('darkMode')==='true') document.body.classList.add('dark-mode');}
function previewCar(){const url=document.getElementById('carImage').value;const img=document.getElementById('carPreview');img.style.display=url.trim()?'block':'none';img.src=url;}
function previewFlag(){const url=document.getElementById('flagImage').value;const img=document.getElementById('flagPreview');img.style.display=url.trim()?'block':'none';img.src=url;}
document.getElementById('addForm').addEventListener('submit',function(e){e.preventDefault();
const newCar={nazev:document.getElementById('carName').value,rychlost:Number(document.getElementById('topSpeed').value),zrychleni:Number(document.getElementById('zeroToHundred').value),vyroba:Number(document.getElementById('year').value),auto:document.getElementById('carImage').value,vlajka:document.getElementById('flagImage').value};
fetch('/pridat-auto',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(newCar)}).then(()=>window.location='/');});
</script></body></html>`;
    return sendHTML(res,html);
}

/* ===== Upravit auto ===== */
if(req.method==="GET" && pathname==="/upravit.html"){
    const id=parsedUrl.query.id;
    const html=`<!DOCTYPE html><html lang='cs'><head><meta charset='UTF-8'><title>Upravit auto</title><style>${CSS_STYLE}</style></head><body>
<header><div class='logo'><img src='logo.png'></div>
<nav><a href='/'>ÚVOD</a><a href='/pridat.html'>PŘIDAT</a><button class='toggle' onclick='toggleMode()'>☀/☾</button></nav></header>
<main>
<form id='editForm'><h2>Upravit auto</h2>
<div class='form-group'><label>Název auta</label><input id='carName' required></div>
<div class='form-group'><label>Max. rychlost (km/h)</label><input type='number' id='topSpeed' required></div>
<div class='form-group'><label>0–100 (s)</label><input type='number' step='0.1' id='zeroToHundred' required></div>
<div class='form-group'><label>Rok výroby</label><input type='number' id='year' required></div>
<div class='form-group'><label>URL fotky auta</label><input type='text' id='carImage' oninput='previewCar()' required><img id='carPreview' class='preview'></div>
<div class='form-group'><label>URL vlajky</label><input type='text' id='flagImage' oninput='previewFlag()' required><img id='flagPreview' class='preview' style='max-width:80px;'></div>
<button type='submit'>Uložit</button>
</form>
</main>
<footer><img src='logo.png'><h3>Katalog sportovních aut</h3><p>Adam Zdráhal</p></footer>
<script>
function toggleMode(){document.body.classList.toggle('dark-mode'); localStorage.setItem('darkMode',document.body.classList.contains('dark-mode'));}
window.onload=()=>{if(localStorage.getItem('darkMode')==='true') document.body.classList.add('dark-mode');}
function previewCar(){const url=document.getElementById('carImage').value;const img=document.getElementById('carPreview');img.style.display=url.trim()?'block':'none';img.src=url;}
function previewFlag(){const url=document.getElementById('flagImage').value;const img=document.getElementById('flagPreview');img.style.display=url.trim()?'block':'none';img.src=url;}
fetch('/item/${id}').then(r=>r.json()).then(car=>{
document.getElementById('carName').value=car.nazev;
document.getElementById('topSpeed').value=car.rychlost;
document.getElementById('zeroToHundred').value=car.zrychleni;
document.getElementById('year').value=car.vyroba;
document.getElementById('carImage').value=car.auto;previewCar();
document.getElementById('flagImage').value=car.vlajka;previewFlag();
});
document.getElementById('editForm').addEventListener('submit',function(e){
e.preventDefault();
const updated={nazev:document.getElementById('carName').value,rychlost:Number(document.getElementById('topSpeed').value),zrychleni:Number(document.getElementById('zeroToHundred').value),vyroba:Number(document.getElementById('year').value),auto:document.getElementById('carImage').value,vlajka:document.getElementById('flagImage').value};
fetch('/edit/${id}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(updated)}).then(()=>window.location='/');
});
</script></body></html>`;
    return sendHTML(res,html);
}

/* ===== Smazat auto ===== */
if(req.method==="GET" && pathname==="/smazat.html"){
    const id=parsedUrl.query.id;
    const html=`<!DOCTYPE html><html lang='cs'><head><meta charset='UTF-8'><title>Smazat auto</title><style>${CSS_STYLE}</style></head><body>
<div class='confirm-box'>
<h1>Potvrzení smazání</h1>
<p id='deleteText'>Opravdu chceš smazat tuto položku? Tuto akci nelze vrátit zpět.</p>
<div class='buttons'><button class='yes' onclick='smazat()'>ANO, SMAZAT</button><button class='no' onclick='zrusit()'>NE, ZRUŠIT</button></div>
</div>
<div id='toast'>Položka byla úspěšně smazána</div>
<script>
const id=${id};
fetch('/item/'+id).then(r=>r.json()).then(car=>document.getElementById('deleteText').innerHTML='Opravdu chceš smazat <strong>'+car.nazev+'</strong>? Tuto akci nelze vrátit zpět.');
function smazat(){fetch('/delete/'+id,{method:'DELETE'}).then(()=>{const toast=document.getElementById('toast');toast.classList.add('show');setTimeout(()=>window.location='/',1500);});}
function zrusit(){window.location='/';}
</script></body></html>`;
    return sendHTML(res,html);
}

/* ===== API ===== */
if(req.method==="GET" && pathname==="/items") return sendJSON(res,200,readData());
if(req.method==="GET" && pathname.startsWith("/item/")){
    const id=Number(pathname.split("/")[2]);
    const car=readData().find(c=>c.id===id);
    if(!car) return sendJSON(res,404,{error:"Auto nenalezeno"});
    return sendJSON(res,200,car);
}
if(req.method==="POST" && pathname==="/pridat-auto"){
    let body=''; req.on('data',chunk=>body+=chunk);
    req.on('end',()=>{
        const newCar=JSON.parse(body);
        const data=readData();
        const newId=data.length?Math.max(...data.map(a=>a.id))+1:1;
        data.push({id:newId,...newCar});
        writeData(data);
        return sendJSON(res,201,{success:true});
    });
    return;
}
if(req.method==="POST" && pathname.startsWith("/edit/")){
    const id=Number(pathname.split("/")[2]);
    let body=''; req.on('data',chunk=>body+=chunk);
    req.on('end',()=>{
        const updated=JSON.parse(body);
        const data=readData();
        const idx=data.findIndex(a=>a.id===id);
        if(idx===-1) return sendJSON(res,404,{error:"Auto nenalezeno"});
        data[idx]={id,...updated};
        writeData(data);
        return sendJSON(res,200,data[idx]);
    });
    return;
}
if(req.method==="DELETE" && pathname.startsWith("/delete/")){
    const id=Number(pathname.split("/")[2]);
    let data=readData();
    const newData=data.filter(a=>a.id!==id);
    if(newData.length===data.length) return sendJSON(res,404,{error:"Auto nenalezeno"});
    writeData(newData);
    return sendJSON(res,200,{success:true});
}

/* ===== 404 fallback ===== */
res.writeHead(404,{'Content-Type':'application/json'});
res.end(JSON.stringify({error:"Endpoint nenalezen"}));

});

server.listen(PORT,()=>console.log(`Server běží na http://localhost:${PORT}`));
