import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

const input = document.getElementById("numero");
const error = document.getElementById("error");
const fraseBox = document.getElementById("frase");

let frases = {};

async function cargarFrases() {
  const guardadas = localStorage.getItem("frases");

  if (guardadas) {
    frases = JSON.parse(guardadas);
    console.log("✅ Frases cargadas desde localStorage");
  } else {
    console.log("📡 Descargando frases desde Firebase...");
    const snapshot = await getDocs(collection(db, "frases"));
    snapshot.forEach((doc) => {
      frases[doc.id] = doc.data().texto;
    });
    localStorage.setItem("frases", JSON.stringify(frases));
    console.log("💾 Frases guardadas en localStorage");
  }
}

function mostrarFrase(num) {
  const texto = frases[num];
  if (!texto) {
    error.textContent = "No hay frase registrada para ese número.";
    fraseBox.textContent = "";
    return;
  }

  error.textContent = "";
  fraseBox.textContent = texto;
  fraseBox.classList.remove("visible");
  void fraseBox.offsetWidth;
  fraseBox.classList.add("visible");
}

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const valor = input.value.trim();
    if (valor) mostrarFrase(valor);
  }
});

cargarFrases();
