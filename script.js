let frases = {};
let currentPage = 0;
const itemsPerPage = 3;
let filteredFrases = [];
let shownFrases = [];

async function cargarFrases() {
  try {
    const snapshot = await db.collection("frases").get();
    if (snapshot.empty) return;
    frases = {};
    snapshot.forEach(doc => {
      frases[doc.id] = doc.data().frase || doc.data().value || doc.data().texto || "(sin texto)";
    });
    localStorage.setItem("frases", JSON.stringify(frases));
    localStorage.setItem("range", JSON.stringify(snapshot.size));
  } catch {
    mostrarMensaje("Error al cargar frases. Intenta más tarde.", false);
  }
}

function mostrarFrase(num, random = false) {
  const fraseBox = document.getElementById("frase");
  fraseBox.classList.remove("repetida", "todas");
  if (num === "00") {
    fraseBox.textContent = "consola";
    return;
  }

  const texto = frases[num.toString()];
  if (!texto) {
    fraseBox.textContent = "Número no encontrado.";
    return;
  }

  if (shownFrases.includes(num.toString())) {
    fraseBox.textContent = texto;
    fraseBox.classList.add("repetida");
  } else {
    fraseBox.textContent = texto;
    shownFrases.push(num.toString());
  }

  if (shownFrases.length === Object.keys(frases).length && random) {
    fraseBox.textContent = "Ya se mostraron todas las frases.";
    fraseBox.classList.add("todas");
  }
}

function buscar() {
  const valor = document.getElementById("numero").value.trim();
  if (!valor) {
    mostrarMensaje("Por favor, ingresa un número válido.", false);
    return;
  }
  if (valor.toString() === '00') window.open('login/index.html', "_blank");
  mostrarFrase(valor);
}

function mostrarFraseAleatoria() {
  const keys = Object.keys(frases);
  const noMostradas = keys.filter(k => !shownFrases.includes(k));
  const fraseBox = document.getElementById("frase");
  fraseBox.classList.remove("todas");
  if (noMostradas.length === 0) {
    fraseBox.textContent = "Ya se mostraron todas las frases.";
    fraseBox.classList.add("todas");
    return;
  }
  const randomKey = noMostradas[Math.floor(Math.random() * noMostradas.length)];
  mostrarFrase(randomKey, true);
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
  const datos = campos.map(id => document.getElementById(id)?.value.trim() || "");
  if (datos.some(v => !v)) {
    mostrarMensaje("Completa todos los campos antes de subir.", false);
    throw new Error("Campos vacíos");
  }
  campos.forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
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
    if (!e.message.includes("Campos vacíos"))
      mostrarMensaje("Error al subir la frase. Revisa la conexión o permisos.", false);
  }
}
document.querySelector("#subirBtn").addEventListener("click", agregarNuevaFrase);

function renderFrasesCards() {
  const raw = localStorage.getItem("frases");
  if (!raw) return;

  const frasesData = Object.entries(JSON.parse(raw));
  filteredFrases = [...frasesData];

  const cardsContainer = document.getElementById("cards-container");
  const searchInput = document.getElementById("searchInput");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");

  function renderPage() {
    const totalPages = Math.ceil(filteredFrases.length / itemsPerPage);
    currentPage = Math.max(0, Math.min(currentPage, totalPages - 1));

    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    const currentItems = filteredFrases.slice(start, end);

    cardsContainer.innerHTML = "";
    currentItems.forEach(([num, texto], i) => {
      const div = document.createElement("div");
      div.className = "card-item";
      div.style.transitionDelay = `${i * 0.05}s`;
      div.innerHTML = `<h4>#${num}</h4><p>${texto}</p>`;
      cardsContainer.appendChild(div);
      requestAnimationFrame(() => div.classList.add("show"));
    });

    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= totalPages - 1;
  }

  prevBtn.onclick = () => {
    cardsContainer.style.transform = "translateX(40px)";
    cardsContainer.style.opacity = "0";
    setTimeout(() => {
      currentPage--;
      renderPage();
      cardsContainer.style.transform = "translateX(0)";
      cardsContainer.style.opacity = "1";
    }, 150);
  };
  nextBtn.onclick = () => {
    cardsContainer.style.transform = "translateX(-40px)";
    cardsContainer.style.opacity = "0";
    setTimeout(() => {
      currentPage++;
      renderPage();
      cardsContainer.style.transform = "translateX(0)";
      cardsContainer.style.opacity = "1";
    }, 150);
  };

  searchInput.oninput = () => {
    const query = searchInput.value.toLowerCase();
    filteredFrases = frasesData.filter(([_, texto]) => texto.toLowerCase().includes(query));
    currentPage = 0;
    renderPage();
  };

  renderPage();
}

window.onload = async () => {
  const guardadas = localStorage.getItem("frases");
  if (guardadas) frases = JSON.parse(guardadas);
  else await cargarFrases();

  const rangeDiv = document.querySelector(".range");
  rangeDiv.textContent = `Escribe un número del 1 al ${localStorage.getItem("range") || 158}`;
  const input = document.getElementById("numero");
  const btn = document.getElementById("buscarBtn");
  const randomBtn = document.getElementById("randomBtn");
  input.addEventListener("keydown", e => { if (e.key === "Enter") buscar(); });
  btn.addEventListener("click", buscar);
  btn.addEventListener("touchstart", buscar);
  randomBtn.addEventListener("click", mostrarFraseAleatoria);
};

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".card-container");
  const front = document.querySelector(".card.front");
  const backs = document.querySelectorAll(".card.back");
  const settingsBtn = document.querySelector(".settings-btn");
  const settingsBtn2 = document.querySelector(".settings-btn2");
  const closeBtns = document.querySelectorAll(".close-settings");
  const fraseBox = document.getElementById("frase");

  let activeBack = null;
  let animating = false;
  let mainHeight = null;

  function updateCardHeights() {
    if (!mainHeight) mainHeight = front.offsetHeight;
    document.querySelectorAll(".card").forEach(card => {
      card.style.height = `${mainHeight}px`;
    });
  }

  function flipTo(selector, direction) {
    if (animating) return;
    animating = true;
    backs.forEach(b => (b.style.zIndex = "0"));
    activeBack = document.querySelector(selector);
    if (activeBack) activeBack.style.zIndex = "1";
    container.classList.remove("flipped", "flipped-left");
    container.classList.add(direction);
    updateCardHeights();
    setTimeout(() => (animating = false), 850);
  }

  function flipRight() { flipTo(".card.back", "flipped"); }
  function flipLeft() {
    flipTo(".card.back.config", "flipped-left");
    setTimeout(renderFrasesCards, 400);
  }
  function flipOff() {
    if (animating) return;
    container.classList.remove("flipped", "flipped-left");
    activeBack = null;
  }

  if (settingsBtn) settingsBtn.addEventListener("click", flipRight);
  if (settingsBtn2) settingsBtn2.addEventListener("click", flipLeft);
  closeBtns.forEach(btn => btn.addEventListener("click", flipOff));

  window.addEventListener("resize", updateCardHeights);
  if (fraseBox) {
    const mo = new MutationObserver(updateCardHeights);
    mo.observe(fraseBox, { childList: true, characterData: true, subtree: true });
  }

  requestAnimationFrame(updateCardHeights);
});
