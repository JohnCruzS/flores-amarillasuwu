"""
Arma un solo archivo HTML con todo adentro (imágenes, música, estilos y código)
para poder enviarlo a cualquier persona y abrirlo con doble clic, sin servidor.

Uso:  python construir.py
Sale: descargable/flores-amarillas.html
"""
import base64
import io
import json
import mimetypes
import os
import re

from PIL import Image

RAIZ = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(RAIZ, "descargable", "flores-amarillas.html")

# imágenes chicas en pantalla: se achican y pasan a WebP para que el archivo pese menos
LADO_MAXIMO = {"img/flor1.png": 360, "img/emoji-flores.png": 360, "img/gato-elegante.png": 360}
LADO_MAXIMO_DEFAULT = 240  # imágenes de la lluvia (se ven a 70px)


def leer(ruta):
    return io.open(os.path.join(RAIZ, ruta), encoding="utf-8").read()


def data_uri(ruta):
    """Convierte un archivo del proyecto en un data URI (texto) que el HTML puede usar."""
    completo = os.path.join(RAIZ, ruta)
    if ruta.endswith(".png"):
        im = Image.open(completo).convert("RGBA")
        lado = LADO_MAXIMO.get(ruta, LADO_MAXIMO_DEFAULT)
        im.thumbnail((lado, lado), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "WEBP", quality=90, alpha_quality=100, method=6)
        datos, tipo = buf.getvalue(), "image/webp"
    else:
        datos = open(completo, "rb").read()
        tipo = mimetypes.guess_type(completo)[0] or "application/octet-stream"
        if ruta.endswith(".webp"):
            tipo = "image/webp"
    return "data:%s;base64,%s" % (tipo, base64.b64encode(datos).decode("ascii"))


_cache = {}


def incrustar_archivos(texto):
    """Reemplaza cada "img/..." o "sound/..." por su contenido incrustado."""
    def reemplazar(m):
        ruta = m.group(1)
        if ruta not in _cache:
            _cache[ruta] = data_uri(ruta)
            print("  incluido %-45s %6d KB" % (ruta, len(_cache[ruta]) // 1024))
        return _cache[ruta]

    return re.sub(r"((?:img|sound)/[\w\-.]+)(?:\?v=\d+)?", reemplazar, texto)


CANCION = "sound/floricienta--flores-amarillas-letra.mp3"


def pagina_flores():
    html = leer("flower.html")
    # la canción no va aquí: la prepara la portada para que suene apenas se aprieta el botón
    html = re.sub(r'<audio src="[^"]*"[^>]*></audio>', "<audio loop></audio>", html)
    html = html.replace('<link rel="stylesheet" href="css/main.css" />', "<style>\n" + leer("css/main.css") + "\n</style>")
    tiempos = json.dumps(json.loads(leer("tiempos.json")), ensure_ascii=False)
    html = html.replace(
        '<script src="anim.js"></script>',
        "<script>\nwindow.TIEMPOS_EMBEBIDOS = " + tiempos + ";\n" + leer("anim.js") + "\n</script>",
    )
    html = html.replace('<script src="main.js"></script>', "<script>\n" + leer("main.js") + "\n</script>")
    return incrustar_archivos(html)


def pagina_inicio(flores):
    html = leer("index.html")
    html = html.replace('<link rel="stylesheet" href="css/style.css">', "<style>\n" + leer("css/style.css") + "\n</style>")
    html = incrustar_archivos(html)

    # la página de las flores va guardada como texto; "<" se escribe < para no cerrar el <script>
    flores_js = json.dumps(flores, ensure_ascii=False).replace("<", "\\u003C")
    musica_b64 = base64.b64encode(open(os.path.join(RAIZ, CANCION), "rb").read()).decode("ascii")
    print("  incluido %-45s %6d KB" % (CANCION, len(musica_b64) // 1024))
    abrir = """
  <script>
    // Canción incluida en este archivo. Se prepara apenas abre la portada
    // para que empiece a sonar sin espera al apretar el botón.
    var MUSICA_B64 = "%s";
    var AUDIO_FLORES = new Audio();
    AUDIO_FLORES.loop = true;
    AUDIO_FLORES.preload = "auto";
    function prepararMusica() {
      if (AUDIO_FLORES.src) return;
      var bin = atob(MUSICA_B64);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      AUDIO_FLORES.src = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
      AUDIO_FLORES.load();
    }
    setTimeout(prepararMusica, 0);

    // Página de las flores incluida en este mismo archivo
    var PAGINA_FLORES = %s;

    // Al apretar el botón: suena la música y se abre la página de las flores en toda la pantalla
    document.querySelector('a[href="flower.html"]').addEventListener("click", function (e) {
      e.preventDefault();
      prepararMusica();
      AUDIO_FLORES.play().catch(function () {});
      var marco = document.createElement("iframe");
      marco.setAttribute("allow", "autoplay");
      marco.style.cssText = "position:fixed;inset:0;width:100%%;height:100%%;border:0;z-index:99999;background:#000";
      marco.srcdoc = PAGINA_FLORES;
      document.body.innerHTML = "";
      document.body.appendChild(marco);
      document.title = "Flores Amarillas";
      var id = setInterval(function () {}, 1000);
      for (var i = 0; i <= id; i++) clearInterval(i); // detener la lluvia de la portada
    });
  </script>
""" % (musica_b64, flores_js)
    return html.replace("</body>", abrir + "</body>", 1)


if __name__ == "__main__":
    print("Armando la página de las flores...")
    flores = pagina_flores()
    print("Armando la portada...")
    final = pagina_inicio(flores)
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    io.open(SALIDA, "w", encoding="utf-8", newline="").write(final)
    print("\nListo: %s (%.1f MB)" % (os.path.relpath(SALIDA, RAIZ), os.path.getsize(SALIDA) / 1024 / 1024))
