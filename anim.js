// Sincronizar las letras con la canción.
// En el .html descargable la canción la prepara la portada (window.parent.AUDIO_FLORES)
// y empieza a sonar en el clic del botón, así no hay espera.
var audio = document.querySelector("audio");
try {
  if (window.parent !== window && window.parent.AUDIO_FLORES) audio = window.parent.AUDIO_FLORES;
} catch (e) {}
var lyrics = document.querySelector("#lyrics");

// Letra de "Flores Amarillas" (Floricienta). Los tiempos son aproximados:
// para ajustarlos abre flower.html?marcar (ver "Modo marcar" más abajo).
var lyricsData = [
  { text: "Él la estaba esperando con una flor amarilla", time: 18 },
  { text: "Ella lo estaba soñando con la luz en su pupila", time: 23 },
  { text: "Y el amarillo del sol, iluminaba la esquina", time: 28 },
  { text: "Lo sentía tan cercano, lo sentía desde niña", time: 33 },
  { text: "Ella sabía que él sabía", time: 38 },
  { text: "Que algún día pasaría", time: 41 },
  { text: "Que vendría a buscarla", time: 44 },
  { text: "Con sus flores amarillas", time: 47 },
  { text: "No te apures, no detengas", time: 50 },
  { text: "El instante del encuentro", time: 53 },
  { text: "Está dicho que es un hecho", time: 56 },
  { text: "No la pierdas, no hay derecho", time: 59 },
  { text: "No te olvides que la vida", time: 62 },
  { text: "Casi nunca está dormida", time: 65 },
  { text: "En ese bar tan desierto nos esperaba el encuentro", time: 78 },
  { text: "Ella llegó en limusina amarilla por supuesto", time: 83 },
  { text: "Él se acercó de repente la miro tan de frente", time: 88 },
  { text: "Toda una vida soñada y no pudo decir nada", time: 93 },
  { text: "Ella sabía que él sabía", time: 98 },
  { text: "Que algún día pasaría", time: 101 },
  { text: "Que vendría a buscarla", time: 104 },
  { text: "Con sus flores amarillas", time: 107 },
  { text: "No te apures, no detengas", time: 110 },
  { text: "El instante del encuentro", time: 113 },
  { text: "Está dicho que es un hecho", time: 116 },
  { text: "No la pierdas, no hay derecho", time: 119 },
  { text: "No te olvides que la vida", time: 122 },
  { text: "Casi nunca está dormida", time: 125 },
  { text: "Ella sabía que él sabía", time: 145 },
  { text: "Que algún día pasaría", time: 148 },
  { text: "Que vendría a buscarla", time: 151 },
  { text: "Con sus flores amarillas", time: 154 },
  { text: "No te apures, no detengas", time: 157 },
  { text: "El instante del encuentro", time: 160 },
  { text: "Está dicho que es un hecho", time: 163 },
  { text: "No la pierdas, no hay derecho", time: 166 },
  { text: "No te olvides que la vida", time: 169 },
  { text: "Casi nunca está dormida", time: 172 },
  { text: "Ella sabía que él sabía", time: 178 },
  { text: "Él sabía, ella sabía", time: 182 },
  { text: "Que él sabía, ella sabía", time: 186 },
  { text: "Y se olvidaron de sus flores amarillas", time: 190 },
];

// Los navegadores bloquean el autoplay con sonido: si falla, se reproduce al primer toque/clic
audio.play().catch(function () {
  function iniciarAudio() {
    audio.play();
    document.removeEventListener("click", iniciarAudio);
    document.removeEventListener("touchstart", iniciarAudio);
  }
  document.addEventListener("click", iniciarAudio);
  document.addEventListener("touchstart", iniciarAudio);
});

// Ubicar la letra justo encima de la flor más alta (sirve en celular y computador).
// Se guarda el punto más alto medido, así la letra no salta cuando las flores se balancean.
var topeFlor = Infinity;
function ubicarLetra() {
  document.querySelectorAll(".flower__leaf").forEach(function (p) {
    var r = p.getBoundingClientRect();
    if (r.height > 0) topeFlor = Math.min(topeFlor, r.top);
  });
  if (topeFlor === Infinity) return;
  var espacio = window.innerWidth <= 600 ? 16 : 24;
  var bottom = window.innerHeight - topeFlor + espacio;
  // en celular el título está arriba: la letra no puede subir tanto que lo tape
  var titulo = document.querySelector(".titulo");
  if (window.innerWidth <= 600 && titulo && titulo.style.display !== "none") {
    var limite = window.innerHeight - titulo.getBoundingClientRect().bottom - 8 - lyrics.offsetHeight;
    bottom = Math.min(bottom, limite);
  }
  lyrics.style.bottom = Math.max(0, bottom) + "px";
  ubicarGatito();
}

// Gatito bailando encima de las flores hasta que empieza la letra.
// Su tamaño se ajusta al espacio libre entre la flor y el título (o el borde de arriba).
var gatito = document.querySelector("#gatito");
var gatitoAlto = 0;
var gatitoBottom = 0;
function ubicarGatito() {
  if (!gatito || topeFlor === Infinity) return;
  var arriba = 10;
  var titulo = document.querySelector(".titulo");
  if (window.innerWidth <= 600 && titulo && titulo.style.display !== "none") {
    arriba = titulo.getBoundingClientRect().bottom + 10;
  }
  var espacioLibre = topeFlor - arriba - 4;
  var alto = Math.max(90, Math.min(window.innerWidth <= 600 ? 160 : 230, espacioLibre));
  // si no cabe entero, baja un poco sobre la flor en vez de tapar el título
  var bottom = Math.min(window.innerHeight - topeFlor + 4, window.innerHeight - arriba - alto);
  // solo se toca el estilo si cambió de verdad (evita reiniciar la transición)
  if (Math.abs(alto - gatitoAlto) > 1 || Math.abs(bottom - gatitoBottom) > 1) {
    gatitoAlto = alto;
    gatitoBottom = bottom;
    gatito.style.height = alto + "px";
    gatito.style.bottom = bottom + "px";
  }
  if (!gatito.classList.contains("listo")) gatito.classList.add("listo");
}
// medir mientras las flores crecen y se mecen (primeros 15 s)
var medidas = 0;
var timerMedir = setInterval(function () {
  ubicarLetra();
  if (++medidas >= 30) clearInterval(timerMedir);
}, 500);
// mientras el gatito está visible se revisa su lugar cada segundo (por si cambia la pantalla)
setInterval(function () {
  if (gatito && !gatito.classList.contains("oculto")) ubicarGatito();
}, 1000);
window.addEventListener("resize", function () {
  clearTimeout(window.timerUbicar);
  window.timerUbicar = setTimeout(function () {
    topeFlor = Infinity;
    ubicarLetra();
  }, 200);
});

// Animar las letras: se muestra la última línea que ya empezó, hasta que llega la siguiente
// (o como máximo 10 segundos)
var lineaMostrada = null;
var timerSalida = null;

// Arma la línea palabra por palabra (entrada) y letra por letra (ola)
function mostrarLinea(texto) {
  clearTimeout(timerSalida);
  lyrics.classList.remove("saliendo");
  lyrics.innerHTML = "";
  var n = 0; // contador de letras para desfasar la ola
  texto.split(" ").forEach(function (palabra, i) {
    var span = document.createElement("span");
    span.className = "palabra";
    span.style.animationDelay = i * 0.12 + "s";
    Array.from(palabra).forEach(function (letra) {
      var l = document.createElement("span");
      l.className = "letra";
      l.textContent = letra;
      l.style.animationDelay = n * 0.07 + "s, " + n * 0.07 + "s";
      span.appendChild(l);
      n++;
    });
    lyrics.appendChild(span);
    lyrics.appendChild(document.createTextNode(" "));
  });
  ubicarLetra();
  if (texto.indexOf("Con sus flores amarillas") === 0) avisarFloresAmarillas();
}

// Ventanitas que salen con "Con sus flores amarillas":
// 1ª vez → "¿Sale su valo?" (se va sola a los 10 s)
// 2ª vez → "¿Sí o no?" con botones (espera la respuesta)
var vecesFloresAmarillas = 0;

function mostrarVentanita(v) {
  if (v) v.classList.add("visible");
}
function cerrarVentanita(v) {
  if (v) v.classList.add("saliendo");
}

var ventanita = document.querySelector("#ventanita");
var ventanitaPregunta = document.querySelector("#ventanitaPregunta");
document.querySelectorAll(".ventanita .cerrar").forEach(function (boton) {
  boton.addEventListener("click", function () {
    cerrarVentanita(boton.closest(".ventanita"));
  });
});

// respuesta a "¿Sí o no?": muestra un mensajito y se cierra
function responder(texto) {
  ventanitaPregunta.querySelector(".mensaje").textContent = texto;
  ventanitaPregunta.querySelector(".opciones").style.display = "none";
  setTimeout(function () {
    cerrarVentanita(ventanitaPregunta);
  }, 3000);
}
if (ventanitaPregunta) {
  ventanitaPregunta.querySelector(".si").addEventListener("click", function () {
    responder("¡Eso! 💛🌻");
  });
  ventanitaPregunta.querySelector(".no").addEventListener("click", function () {
    responder("Bueno... será otro día 🥺");
  });
}

function avisarFloresAmarillas() {
  vecesFloresAmarillas++;
  if (vecesFloresAmarillas === 1) {
    mostrarVentanita(ventanita);
    setTimeout(function () {
      cerrarVentanita(ventanita);
    }, 10000);
  } else if (vecesFloresAmarillas === 2) {
    cerrarVentanita(ventanita); // por si la primera sigue abierta
    mostrarVentanita(ventanitaPregunta);
  }
}

function ocultarLinea() {
  lyrics.classList.add("saliendo");
  timerSalida = setTimeout(function () {
    lyrics.innerHTML = "";
    lyrics.classList.remove("saliendo");
  }, 700);
}

function updateLyrics() {
  if (modoMarcar) return;
  var time = audio.currentTime;
  var index = -1;
  for (var i = 0; i < lyricsData.length; i++) {
    if (lyricsData[i].time > 0 && time >= lyricsData[i].time) index = i;
  }
  var currentLine = lyricsData[index];
  var next = lyricsData[index + 1];
  var visible = currentLine && time < currentLine.time + 10 && (!next || time < next.time || !next.time);
  var nueva = visible ? index : null;
  // el gatito se va cuando empieza la letra (y vuelve si la canción se repite)
  if (gatito && gatito.classList.contains("oculto") !== (index !== -1)) {
    gatito.classList.toggle("oculto", index !== -1);
  }

  if (nueva === lineaMostrada) return; // solo se anima cuando cambia la línea
  lineaMostrada = nueva;
  if (nueva === null) ocultarLinea();
  else mostrarLinea(currentLine.text);
}

setInterval(updateLyrics, 100);

// Si existe tiempos.json (se crea solo con el modo marcar), sus tiempos reemplazan a los de arriba.
// En el .html descargable los tiempos vienen incluidos en window.TIEMPOS_EMBEBIDOS.
(window.TIEMPOS_EMBEBIDOS
  ? Promise.resolve(window.TIEMPOS_EMBEBIDOS)
  : fetch("tiempos.json", { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; })
)
  .then(function (tiempos) {
    if (!tiempos || modoMarcar) return;
    tiempos.forEach(function (t, i) {
      if (lyricsData[i] && typeof t.time === "number") lyricsData[i].time = t.time;
    });
  })
  .catch(function () {});

// Modo marcar: abre flower.html?marcar (con "node servidor.js" corriendo) y presiona
// ESPACIO (o toca la pantalla) justo cuando empieza cada línea. Cada tiempo se guarda
// solo en tiempos.json y la página normal lo usa automáticamente.
var modoMarcar = location.search.indexOf("marcar") !== -1;
if (modoMarcar) {
  var linea = 0;
  lyrics.style.opacity = 1;
  lyrics.innerHTML = "Presiona ESPACIO apenas EMPIECE a cantarse: " + lyricsData[0].text;

  function guardarTiempos() {
    return fetch("/guardar-tiempos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lyricsData, null, 2),
    }).then(function (r) {
      if (!r.ok) throw new Error();
    });
  }

  function marcar() {
    // si el navegador bloqueó la música, el primer toque solo la inicia
    if (audio.paused) { audio.play(); return; }
    if (linea >= lyricsData.length) return;
    lyricsData[linea].time = Math.round(audio.currentTime * 10) / 10;
    linea++;
    var mensaje = linea < lyricsData.length
      ? "(" + linea + "/" + lyricsData.length + ") Presiona apenas EMPIECE: " + lyricsData[linea].text
      : "¡Listo! Tiempos guardados 💛";
    lyrics.innerHTML = mensaje;
    guardarTiempos().catch(function () {
      lyrics.innerHTML = "⚠ No se pudo guardar: abre la página con node servidor.js";
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.code === "Space") { e.preventDefault(); marcar(); }
  });
  document.addEventListener("touchstart", marcar);
}

//funcion titulo
// Función para ocultar el título después de 216 segundos
function ocultarTitulo() {
  var titulo = document.querySelector(".titulo");
  titulo.style.animation =
    "fadeOut 3s ease-in-out forwards"; /* Duración y función de temporización de la desaparición */
  setTimeout(function () {
    titulo.style.display = "none";
  }, 3000); // Espera 3 segundos antes de ocultar completamente
}

// Llama a la función después de 216 segundos (216,000 milisegundos)
setTimeout(ocultarTitulo, 216000);