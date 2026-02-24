const http = require("http");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");

const DATA_FILE = path.join(__dirname, "data.json");

/* ---------- Pomocné funkce ---------- */
 
function readData() {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
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

/* ---------- Server ---------- */

const server = http.createServer((req, res) => {

    /* ===== API ===== */

    // GET /items  → všechna auta
    if (req.method === "GET" && req.url === "/items") {
        const data = readData();
        return sendJSON(res, 200, data);
    }

    // GET /item/:id → detail auta
    if (req.method === "GET" && req.url.startsWith("/item/")) {
        const id = Number(req.url.split("/")[2]);
        const data = readData();
        const item = data.find(a => a.id === id);

        if (!item) return sendJSON(res, 404, { error: "Auto nenalezeno" });
        return sendJSON(res, 200, item);
    }

    // POST /items → přidání auta
    if (req.method === "POST" && req.url === "/pridat-auto") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            const newCar = JSON.parse(body);
            const data = readData();

            const newId = data.length ? Math.max(...data.map(a => a.id)) + 1 : 1;

            const car = {
                id: newId,
                ...newCar
            };

            data.push(car);
            writeData(data);

            return sendJSON(res, 201, car);
        });
    }



    // DELETE /delete/:id → smazání auta
    if (req.method === "DELETE" && req.url.startsWith("/delete/")) {
        const id = Number(req.url.split("/")[2]);
        let data = readData();

        const newData = data.filter(a => a.id !== id);

        if (data.length === newData.length) {
            return sendJSON(res, 404, { error: "Auto nenalezeno" });
        }

        writeData(newData);
        return sendJSON(res, 200, { success: true });
    }

    // POST /edit/:id → uložení editace
    if (req.method === "POST" && req.url.startsWith("/edit/")) {
        const id = Number(req.url.split("/")[2]);
        let body = "";

        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            const updated = JSON.parse(body);
            const data = readData();

            const index = data.findIndex(a => a.id === id);
            if (index === -1) {
                return sendJSON(res, 404, { error: "Auto nenalezeno" });
            }

            data[index] = { id, ...updated };
            writeData(data);

            return sendJSON(res, 200, data[index]);
        });
    }

    // GET /filter?... → filtrace
    if (req.method === "GET" && req.url.startsWith("/filter")) {
        const qs = req.url.split("?")[1];
        const params = querystring.parse(qs);

        let data = readData();

        if (params.rok) {
            data = data.filter(a => a.vyroba == params.rok);
        }

        if (params.minSpeed) {
            data = data.filter(a => a.rychlost >= Number(params.minSpeed));
        }

        if (params.nazev) {
            data = data.filter(a => 
                a.nazev.toLowerCase().includes(params.nazev.toLowerCase())
            );
        }

        return sendJSON(res, 200, data);
    }

    /* ===== FALLBACK ===== */
    sendJSON(res, 404, { error: "Endpoint nenalezen" });
});

/* ---------- START ---------- */

server.listen(3000, () => {
    console.log("Server běží na http://localhost:3000");
});
