let frases = {};

async function cargarFrases() {
  try {
    const snapshot = await db.collection("frases").get();

    if (snapshot.empty) {
      return;
    }

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
  if (guardadas) {
    frases = JSON.parse(guardadas);
  } else {
    await cargarFrases();
  }

  const input = document.getElementById("numero");
  const btn = document.getElementById("buscarBtn");

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") buscar();
  });
  btn.addEventListener("click", buscar);
  btn.addEventListener("touchstart", buscar);
};
