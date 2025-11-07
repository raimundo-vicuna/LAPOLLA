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
  } catch (error) {
    console.error(error);
  }
}

function mostrarFrase(num) {
  const fraseBox = document.getElementById("frase");
  const texto = frases[num.toString()];
  fraseBox.textContent = texto || "Número no encontrado.";
}

function buscar() {
  const valor = document.getElementById("numero").value.trim();
  if (valor) mostrarFrase(valor);
}

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
  const inner = document.querySelector(".card-inner");
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
