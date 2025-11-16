let frases = {};
let descripciones = {};
let shownFrases = new Set();
let currentPage = 0;
let filteredFrases = [];
const itemsPerPage = 3;

let RANDOM_SPIN_DURATION_MS = 1000;
let RANDOM_SPIN_INTERVAL_MS = 100;

async function cargarFrases() {
  const snapshot = await db.collection("frases").get();
  if (snapshot.empty) return;
  frases = {};
  descripciones = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    const id = String(doc.id);
    frases[id] = data.frase || data.value || data.texto || "(sin texto)";
    descripciones[id] = data.des || data.descripcion || "(sin descripción)";
  });
  localStorage.setItem("frases", JSON.stringify(frases));
  localStorage.setItem("descripciones", JSON.stringify(descripciones));
  localStorage.setItem("range", JSON.stringify(snapshot.size));
}

function mostrarFrase(num, random = false) {
  num = String(num);
  const box = document.getElementById("frase");
  box.classList.remove("repetida", "todas");

  if (num === "00") {
    box.textContent = "Consola";
    return;
  }

  const txt = capitalize(frases[num]);
  if (!txt) {
    box.textContent = "Número no encontrado.";
    return;
  }

  if (shownFrases.has(num)) {
    box.style.animation = "none";
    box.textContent = txt;

    requestAnimationFrame(() => {
      box.style.animation = "";
      box.classList.add("repetida");
    });

  } else {
    box.textContent = txt;
    shownFrases.add(num);
  }

  if (shownFrases.size === Object.keys(frases).length && random) {
    box.style.animation = "none";

    requestAnimationFrame(() => {
      box.style.animation = "";
      box.classList.add("todas");
    });

    box.textContent = "Ya se mostraron todas las frases.";
  }
}

function showhistory() {
  if (shownFrases.size === 0) return mostrarMensaje("No hay frases previas", false);

  const popup = document.getElementById("infoPopup");
  const title = document.getElementById("infoTitle");
  const desc = document.getElementById("infoDescription");

  title.textContent = "Historial";
  desc.innerHTML = Array.from(shownFrases)
    .map(num => `#${num} – ${frases[num]}`)
    .join("<br>");

  popup.classList.add("show");
}

const historybtn = document.getElementById("history");
historybtn.addEventListener("click", showhistory);

function buscar() {
  const v = document.getElementById("numero").value.trim();
  if (!v) return mostrarMensaje("Por favor, ingresa un número válido.", false);
  if (v === "00") window.open("login/index.html", "_blank");
  mostrarFrase(v);
}

function mostrarMensaje(msg, ok = false, t = 3000) {
  const errorBoxBack = document.querySelector(".card.back .subtitle.error");
  const backVisible = document.querySelector(".card.back")?.style.zIndex === "1";

  if (backVisible && errorBoxBack) {
    errorBoxBack.textContent = msg;
    errorBoxBack.style.display = "block";
    errorBoxBack.style.opacity = "1";
    errorBoxBack.style.color = ok ? "#77ff8e" : "#ff7ee5";

    clearTimeout(errorBoxBack._timer);
    errorBoxBack._timer = setTimeout(() => {
      errorBoxBack.style.opacity = "0";
      setTimeout(() => (errorBoxBack.style.display = "none"), 300);
    }, t);
    return;
  }

  const box = document.getElementById("frase");
  if (!box) return;

  box.textContent = msg;
  box.style.opacity = "1";
  box.style.color = ok ? "#77ff8e" : "#ff7ee5";

  clearTimeout(box._timer);
  box._timer = setTimeout(() => {
    box.style.opacity = "0";
    setTimeout(() => {
      box.textContent = "";
      box.style.opacity = "1";
    }, 300);
  }, t);
}

function obtenerDatos() {
  const ids = ["autor", "nuevaFrase", "descripcion"];
  const datos = ids.map(id => document.getElementById(id).value.trim());
  if (datos.some(v => !v)) {
    mostrarMensaje("Completa todos los campos antes de subir.", false);
    throw "";
  }
  ids.forEach(id => (document.getElementById(id).value = ""));
  return datos;
}

async function agregarNuevaFrase() {
  try {
    const d = obtenerDatos();
    const set = { fecha: new Date(), autor: d[0], frase: d[1], descripcion: d[2], apiKey: "penedegorila007" };
    await db.collection("frasesNuevas").add(set);
    mostrarMensaje("Frase subida con éxito", true);
  } catch { }
}

document.getElementById("subirBtn").addEventListener("click", agregarNuevaFrase);

function renderFrasesCards() {
  const raw = localStorage.getItem("frases");
  if (!raw) return;

  const frasesData = Object.entries(JSON.parse(raw));
  filteredFrases = [...frasesData];

  const c = document.getElementById("cards-container");
  const search = document.getElementById("searchInput");
  const prev = document.getElementById("prevPage");
  const next = document.getElementById("nextPage");

  function renderPage() {
    const total = Math.ceil(filteredFrases.length / itemsPerPage);
    currentPage = Math.max(0, Math.min(currentPage, total - 1));
    const start = currentPage * itemsPerPage;
    const items = filteredFrases.slice(start, start + itemsPerPage);

    c.innerHTML = "";
    items.forEach(([n, t], i) => {
      const div = document.createElement("div");
      div.className = "card-item";
      div.style.transitionDelay = `${i * 0.05}s`;
      div.innerHTML = `<h4>#${n}</h4><p>${t}</p>`;
      c.appendChild(div);
      requestAnimationFrame(() => div.classList.add("show"));
    });

    prev.disabled = currentPage === 0;
    next.disabled = currentPage >= total - 1;
  }

  prev.onclick = () => {
    c.style.transform = "translateX(40px)";
    c.style.opacity = "0";
    setTimeout(() => {
      currentPage--;
      renderPage();
      c.style.transform = "translateX(0)";
      c.style.opacity = "1";
    }, 150);
  };

  next.onclick = () => {
    c.style.transform = "translateX(-40px)";
    c.style.opacity = "0";
    setTimeout(() => {
      currentPage++;
      renderPage();
      c.style.transform = "translateX(0)";
      c.style.opacity = "1";
    }, 150);
  };

  search.oninput = () => {
    const q = search.value.toLowerCase();
    filteredFrases = frasesData.filter(([_, t]) => t.toLowerCase().includes(q));
    currentPage = 0;
    renderPage();
  };

  renderPage();
}

function runRandomSpin(onFinish) {
  const keys = Object.keys(frases);
  const input = document.getElementById("numero");

  let interval = setInterval(() => {
    input.value = keys[Math.floor(Math.random() * keys.length)];
  }, RANDOM_SPIN_INTERVAL_MS);

  setTimeout(() => {
    clearInterval(interval);
    const f = keys[Math.floor(Math.random() * keys.length)];
    input.value = f;
    onFinish(f);
  }, RANDOM_SPIN_DURATION_MS);
}

function resetJuego() {
  shownFrases = new Set();
  const fraseBox = document.getElementById("frase");
  const input = document.getElementById("numero");
  if (fraseBox) fraseBox.textContent = "";
  if (input) input.value = "";
}

function capitalize(texto) {
  if (!texto || typeof texto !== "string") return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

setInterval(() => {
  localStorage.setItem("lastActive", Date.now());
}, 1500);

window.onload = async () => {
  const lastActive = parseInt(localStorage.getItem("lastActive") || "0");
  const now = Date.now();
  if (now - lastActive > 5000) resetJuego();

  const f = localStorage.getItem("frases");
  const d = localStorage.getItem("descripciones");

  if (f && d) {
    frases = JSON.parse(f);
    descripciones = JSON.parse(d);
  } else {
    await cargarFrases();
  }

  document.querySelector(".range").textContent =
    `Escribe un número del 1 al ${localStorage.getItem("range")}`;

  const input = document.getElementById("numero");

  document.getElementById("buscarBtn").addEventListener("click", buscar);
  document.getElementById("buscarBtn").addEventListener("touchstart", buscar);
  input.addEventListener("keydown", e => e.key === "Enter" && buscar());

  document.getElementById("randomBtn").addEventListener("click", () => {
    runRandomSpin(num => mostrarFrase(num, true));
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".card-container");
  const front = document.querySelector(".card.front");
  const backs = document.querySelectorAll(".card.back");
  const settings1 = document.querySelector(".settings-btn");
  const settings2 = document.querySelector(".settings-btn2");
  const closeBtns = document.querySelectorAll(".close-settings");
  const fraseBox = document.getElementById("frase");
  const recharge = document.getElementById("rechargeBtn");

  let animating = false;
  let mainHeight = null;

  async function rechargeFrases() {
    document.body.classList.add("no-anim");
    recharge.disabled = true;
    recharge.innerHTML = '<i class="fa-solid fa-rotate fa-spin"></i>';

    try {
      setTimeout(() => {
        localStorage.removeItem("frases");
        localStorage.removeItem("descripciones");
        localStorage.removeItem("range");
      }, 0);

      shownFrases = new Set();
      document.getElementById("numero").value = "";
      document.getElementById("frase").textContent = "";

      await cargarFrases();

      setTimeout(() => {
        recharge.style.borderColor = "#4CAF50";
        recharge.innerHTML = '<i class="fa-solid fa-check" style="color:#4CAF50"></i>';
        setTimeout(() => {
          recharge.style.borderColor = "";
          recharge.innerHTML = '<i class="fa-solid fa-rotate"></i>';
          recharge.disabled = false;
          document.body.classList.remove("no-anim");
        }, 700);
      }, 700);

    } catch {
      setTimeout(() => {
        recharge.style.borderColor = "#ff3b3b";
        recharge.innerHTML = '<i class="fa-solid fa-xmark" style="color:#ff3b3b"></i>';
        setTimeout(() => {
          recharge.style.borderColor = "";
          recharge.innerHTML = '<i class="fa-solid fa-rotate"></i>';
          recharge.disabled = false;
          document.body.classList.remove("no-anim");
        }, 700);
      }, 700);
    }
  }

  recharge.addEventListener("click", rechargeFrases);
  recharge.addEventListener("touchstart", e => {
    e.preventDefault();
    rechargeFrases();
  });

  function updateHeights() {
    if (!mainHeight) mainHeight = front.offsetHeight;
    document.querySelectorAll(".card").forEach(c => {
      c.style.height = `${mainHeight}px`;
    });
  }

  function flip(selector, dir) {
    if (animating) return;
    animating = true;

    backs.forEach(b => (b.style.zIndex = "0"));
    const active = document.querySelector(selector);
    active.style.transform = "translateZ(0)";
    active.style.zIndex = "1";

    container.classList.remove("flipped", "flipped-left");
    container.classList.add(dir);

    updateHeights();
    setTimeout(() => (animating = false), 850);
  }

  settings1.addEventListener("click", () => flip(".card.back", "flipped"));
  settings2.addEventListener("click", () => {
    flip(".card.back.config", "flipped-left");
    setTimeout(renderFrasesCards, 400);
  });

  closeBtns.forEach(btn =>
    btn.addEventListener("click", () => {
      container.classList.remove("flipped", "flipped-left");
    })
  );

  window.addEventListener("resize", updateHeights);

  const infoBtn = document.getElementById("infoBtn");
  const popup = document.getElementById("infoPopup");
  const closeInfo = document.getElementById("closeInfo");
  const infoTitle = document.getElementById("infoTitle");
  const infoDesc = document.getElementById("infoDescription");

  infoBtn.addEventListener("click", () => {
    const num = document.getElementById("numero").value.trim();
    if (!num || !frases[num]) return mostrarMensaje("Primero busca un número válido.", false);

    const n = String(num);
    infoTitle.textContent = `#${n}`;

    const desc = descripciones[n] || "(Sin descripción)";
    const capText = capitalize(desc);

    if (n === "46") {
      infoDesc.innerHTML = `${capText}<br><br><img id="img-bongo" src="icons/king-of-the.bongo.svg" style="width:100%;max-width:240px;">`;
      const bongoImg = document.getElementById("img-bongo");
      bongoImg.style.cursor = "pointer";
      bongoImg.addEventListener("click", () => {
        window.open("https://open.spotify.com/intl-es/track/3zkRKcH2OdhHS6FUtX3P1o?si=06b9fc6054374717");
      });
    } else {
      infoDesc.textContent = capText;
    }

    popup.classList.add("show");
  });

  closeInfo.addEventListener("click", () => popup.classList.remove("show"));
  popup.addEventListener("click", e => { if (e.target === popup) popup.classList.remove("show"); });

  const mo = new MutationObserver(updateHeights);
  mo.observe(fraseBox, { childList: true, subtree: true });

  requestAnimationFrame(updateHeights);
});
