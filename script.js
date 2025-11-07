let frases = {};

async function cargarFrases() {
  try {
    const snapshot = await db.collection("frases").get();
    if (snapshot.empty) return;
    frases = {};
    snapshot.forEach(doc => {
      frases[doc.id] = doc.data().frase || doc.data().value || doc.data().texto || "(sin texto)";
    });
    localStorage.setItem("frases", JSON.stringify(frases));
  } catch {
    mostrarMensaje("Error al cargar frases. Intenta más tarde.", false);
  }
}

function mostrarFrase(num) {
  const fraseBox = document.getElementById("frase");
  const texto = frases[num.toString()];
  fraseBox.textContent = texto || "Número no encontrado.";
}

function buscar() {
  const valor = document.getElementById("numero").value.trim();
  if (!valor) {
    mostrarMensaje("Por favor, ingresa un número válido.", false);
    return;
  }

  if (valor.toString() === '007') {
    window.open('login/login.html')
  }
  mostrarFrase(valor);
}

function mostrarMensaje(mensaje, exito = false, tiempo = 3000) {
  const msgBox = document.querySelector(".subtitle.error");
  if (!msgBox) return;
  msgBox.textContent = mensaje;
  msgBox.style.display = "block";
  msgBox.style.opacity = "1";
  msgBox.style.color = exito ? "#77ff8e" : "#ff7ee5";
  clearTimeout(msgBox.timer);
  msgBox.timer = setTimeout(() => {
    msgBox.style.opacity = "0";
    setTimeout(() => (msgBox.style.display = "none"), 300);
  }, tiempo);
}

function obtenerDatos() {
  const campos = ["autor", "nuevaFrase", "descripcion"];
  const datos = campos.map(id => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  });

  if (datos.some(v => !v)) {
    mostrarMensaje("Completa todos los campos antes de subir.", false);
    throw new Error("Campos vacíos");
  }

  campos.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  return datos;
}

async function agregarNuevaFrase() {
  try {
    const data = obtenerDatos();
    const apiKey = "penedegorila007";

    const set = {
      fecha: new Date(),
      autor: data[0],
      frase: data[1],
      descripcion: data[2],
      apiKey: apiKey
    };

    await db.collection("frasesNuevas").add(set);
    mostrarMensaje("Frase subida con éxito", true);
  } catch (e) {
    if (e.message.includes("Campos vacíos")) return;
    mostrarMensaje("Error al subir la frase. Revisa la conexión o permisos.", false);
  }
}

document.querySelector("#subirBtn").addEventListener("click", agregarNuevaFrase);

window.onload = async () => {
  const guardadas = localStorage.getItem("frases");
  if (guardadas) frases = JSON.parse(guardadas);
  else await cargarFrases();

  const input = document.getElementById("numero");
  const btn = document.getElementById("buscarBtn");

  input.addEventListener("keydown", e => { if (e.key === "Enter") buscar(); });
  btn.addEventListener("click", buscar);
  btn.addEventListener("touchstart", buscar);
};

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".card-container");
  const front = document.querySelector(".card.front");
  const back = document.querySelector(".card.back");
  const settingsBtn = document.querySelector(".settings-btn");
  const closeBtn = document.querySelector(".close-settings");
  const fraseBox = document.getElementById("frase");

  function setFlipHeight() {
    const hFront = front.scrollHeight;
    const hBack = back.scrollHeight;
    const h = Math.max(hFront, hBack);
    container.style.height = h + "px";
  }

  function flipOn() {
    container.classList.add("flipped");
    requestAnimationFrame(setFlipHeight);
  }

  function flipOff() {
    container.classList.remove("flipped");
    requestAnimationFrame(setFlipHeight);
  }

  if (settingsBtn) settingsBtn.addEventListener("click", flipOn);
  if (closeBtn) closeBtn.addEventListener("click", flipOff);
  window.addEventListener("resize", setFlipHeight);

  if (fraseBox) {
    const mo = new MutationObserver(setFlipHeight);
    mo.observe(fraseBox, { childList: true, characterData: true, subtree: true });
  }

  requestAnimationFrame(setFlipHeight);
  const btn = document.getElementById("buscarBtn");
  if (btn) btn.addEventListener("click", () => setTimeout(setFlipHeight, 0));
});
