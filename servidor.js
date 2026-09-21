// Servidor local: muestra la página y guarda los tiempos de la letra en tiempos.json
// Uso: node servidor.js  ->  http://localhost:8080
const http = require("http");
const fs = require("fs");
const path = require("path");

const PUERTO = 8080;
const RAIZ = __dirname;
const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".mp3": "audio/mpeg",
};

http
  .createServer((req, res) => {
    if (req.method === "POST" && req.url === "/guardar-tiempos") {
      let cuerpo = "";
      req.on("data", (parte) => (cuerpo += parte));
      req.on("end", () => {
        try {
          const datos = JSON.parse(cuerpo);
          fs.writeFileSync(path.join(RAIZ, "tiempos.json"), JSON.stringify(datos, null, 2));
          res.writeHead(200).end("ok");
        } catch {
          res.writeHead(400).end("json inválido");
        }
      });
      return;
    }

    const ruta = decodeURIComponent(req.url.split("?")[0]);
    const archivo = path.join(RAIZ, ruta === "/" ? "index.html" : ruta);
    if (!archivo.startsWith(RAIZ)) return res.writeHead(403).end();

    fs.stat(archivo, (err, info) => {
      if (err || !info.isFile()) return res.writeHead(404).end("No encontrado");
      const tipo = TIPOS[path.extname(archivo).toLowerCase()] || "application/octet-stream";
      const total = info.size;
      const rango = req.headers.range;
      // soporte de rangos para que el audio se pueda adelantar/retroceder
      if (rango) {
        const [ini, fin] = rango.replace("bytes=", "").split("-");
        const inicio = parseInt(ini, 10);
        const final = fin ? parseInt(fin, 10) : total - 1;
        res.writeHead(206, {
          "Content-Type": tipo,
          "Content-Range": `bytes ${inicio}-${final}/${total}`,
          "Accept-Ranges": "bytes",
          "Content-Length": final - inicio + 1,
        });
        fs.createReadStream(archivo, { start: inicio, end: final }).pipe(res);
      } else {
        // no-cache: el navegador siempre revisa si hay una versión nueva del archivo
        res.writeHead(200, { "Content-Type": tipo, "Content-Length": total, "Accept-Ranges": "bytes", "Cache-Control": "no-cache" });
        fs.createReadStream(archivo).pipe(res);
      }
    });
  })
  .listen(PUERTO, () => console.log(`Abierto en http://localhost:${PUERTO}`));
