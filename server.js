const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data.json");

/* ========= Pomocné funkce ========= */

function readData() {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function sendJSON(res, status, data) {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data));
}

function sendFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            return res.end("Soubor nenalezen");
        }
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
}

/* ========= Server ========= */

const server = http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    /* ===== STATICKÉ SOUBORY ===== */

    if (req.method === "GET" && pathname === "/") {
        return sendFile(res, path.join(__dirname, "index.html"), "text/html");
    }

    if (req.method === "GET" && pathname === "/pridat.html") {
        return sendFile(res, path.join(__dirname, "pridat.html"), "text/html");
    }

    if (req.method === "GET" && pathname === "/smazat.html") {
        return sendFile(res, path.join(__dirname, "smazat.html"), "text/html");
    }

    if (req.method === "GET" && pathname === "/data.json") {
        return sendFile(res, DATA_FILE, "application/json");
    }

    if (req.method === "GET") {
        let filePath = path.join(__dirname, pathname);
    
        if (pathname === "/") {
            filePath = path.join(__dirname, "index.html");
        }
    
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    
            const ext = path.extname(filePath);
            const contentTypes = {
                ".html": "text/html",
                ".css": "text/css",
                ".js": "text/javascript",
                ".json": "application/json",
                ".png": "image/png",
                ".jpg": "image/jpeg"
            };
    
            return sendFile(res, filePath, contentTypes[ext] || "text/plain");
        }
    }

    /* ===== API ===== */

    // GET /items
    if (req.method === "GET" && pathname === "/items") {
        const data = readData();
        return sendJSON(res, 200, data);
    }

    // GET /item/:id
    if (req.method === "GET" && pathname.startsWith("/item/")) {
        const id = Number(pathname.split("/")[2]);
        const data = readData();
        const car = data.find(a => a.id === id);

        if (!car) return sendJSON(res, 404, { error: "Auto nenalezeno" });

        return sendJSON(res, 200, car);
    }

    // POST /pridat-auto
    if (req.method === "POST" && pathname === "/pridat-auto") {
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
    

    // DELETE /delete/:id
    if (req.method === "DELETE" && pathname.startsWith("/delete/")) {
        const id = Number(pathname.split("/")[2]);
        let data = readData();

        const newData = data.filter(a => a.id !== id);

        if (data.length === newData.length) {
            return sendJSON(res, 404, { error: "Auto nenalezeno" });
        }

        writeData(newData);
        return sendJSON(res, 200, { success: true });
    }

    // POST /edit/:id
    if (req.method === "POST" && pathname.startsWith("/edit/")) {
        const id = Number(pathname.split("/")[2]);
        let body = "";

        req.on("data", chunk => body += chunk);

        req.on("end", () => {
            const updatedCar = JSON.parse(body);
            let data = readData();

            const index = data.findIndex(a => a.id === id);

            if (index === -1) {
                return sendJSON(res, 404, { error: "Auto nenalezeno" });
            }

            data[index] = { id, ...updatedCar };
            writeData(data);

            return sendJSON(res, 200, data[index]);
        });
    }

    // GET /filter
    if (req.method === "GET" && pathname === "/filter") {
        let data = readData();
        const { rok, minSpeed, nazev } = parsedUrl.query;

        if (rok) {
            data = data.filter(a => a.vyroba == rok);
        }

        if (minSpeed) {
            data = data.filter(a => a.rychlost >= Number(minSpeed));
        }

        if (nazev) {
            data = data.filter(a =>
                a.nazev.toLowerCase().includes(nazev.toLowerCase())
            );
        }

        return sendJSON(res, 200, data);
    }

    /* ===== 404 ===== */

    sendJSON(res, 404, { error: "Endpoint nenalezen" });
});

/* ========= Start ========= */

server.listen(PORT, () => {
    console.log(`Server běží na http://localhost:${PORT}`);
});