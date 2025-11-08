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
    localStorage.setItem("range", JSON.stringify(snapshot.size))
  } catch {
    mostrarMensaje("Error al cargar frases. Intenta más tarde.", false);
  }
}

function mostrarFrase(num) {
  const fraseBox = document.getElementById("frase");

  if (num === "00") {
    fraseBox.textContent = "consola";
    return;
  }

  const texto = frases[num.toString()];
  fraseBox.textContent = texto || "Número no encontrado.";
}


function buscar() {
  const valor = document.getElementById("numero").value.trim();
  if (!valor) {
    mostrarMensaje("Por favor, ingresa un número válido.", false);
    return;
  }

  if (valor.toString() === '00') {
    window.open('login/index.html', "_blank")
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

function renderFrasesBack() {
  const raw = localStorage.getItem("frases");
  if (!raw) return;

  const frases = JSON.parse(raw);
  const configCard = document.querySelector(".card.back.config");
  if (!configCard) return;

  Array.from(configCard.children).forEach(el => {
    if (!el.classList.contains("close-settings") && el.tagName !== "H2") el.remove();
  });

  const title = document.createElement("div");
  title.className = "subtitle";
  title.textContent = "Tus juegos";
  title.style.textAlign = "center";
  configCard.appendChild(title);

  const container = document.createElement("div");
  container.className = "config-table-container";

  const table = document.createElement("table");
  table.className = "config-table";

  table.innerHTML = `
    <thead>
      <tr>
        <th>#</th>
        <th>Frase</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(frases)
        .map(
          ([num, texto]) => `
          <tr>
            <td>${num}</td>
            <td>${texto}</td>
          </tr>
        `
        )
        .join("")}
    </tbody>
  `;

  container.appendChild(table);
  configCard.appendChild(container);
}

renderFrasesBack();


window.onload = async () => {
  const guardadas = localStorage.getItem("frases");
  if (guardadas) frases = JSON.parse(guardadas);
  else await cargarFrases();
  const rangeDiv = document.querySelector(".range");
  rangeDiv.textContent = `Escribe un número del 1 al ${localStorage.getItem("range") || 158}`;
  const input = document.getElementById("numero");
  const btn = document.getElementById("buscarBtn");

  input.addEventListener("keydown", e => { if (e.key === "Enter") buscar(); });
  btn.addEventListener("click", buscar);
  btn.addEventListener("touchstart", buscar);
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

  function setFlipHeight() {
    const hFront = front.scrollHeight;
    const hBack = activeBack ? activeBack.scrollHeight : 0;
    const h = Math.max(hFront, hBack);
    container.style.height = h + "px";
  }

  function flipTo(backSelector, directionClass) {
    backs.forEach(b => b.style.zIndex = "0");
    activeBack = document.querySelector(backSelector);
    if (activeBack) activeBack.style.zIndex = "1";

    container.classList.remove("flipped", "flipped-left");
    container.classList.add(directionClass);
    requestAnimationFrame(setFlipHeight);
  }

  function flipRight() {
    flipTo(".card.back:not(.config)", "flipped");
  }

  function flipLeft() {
    flipTo(".card.back.config", "flipped-left"); 
  }

  function flipOff() {
    container.classList.remove("flipped", "flipped-left");
    activeBack = null;
    requestAnimationFrame(setFlipHeight);
  }

  if (settingsBtn) settingsBtn.addEventListener("click", flipRight);
  if (settingsBtn2) settingsBtn2.addEventListener("click", flipLeft);
  closeBtns.forEach(btn => btn.addEventListener("click", flipOff));

  window.addEventListener("resize", setFlipHeight);

  if (fraseBox) {
    const mo = new MutationObserver(setFlipHeight);
    mo.observe(fraseBox, { childList: true, characterData: true, subtree: true });
  }

  requestAnimationFrame(setFlipHeight);
  const btn = document.getElementById("buscarBtn");
  if (btn) btn.addEventListener("click", () => setTimeout(setFlipHeight, 0));
});
