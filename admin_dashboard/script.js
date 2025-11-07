const token = localStorage.getItem("auth_token");
const expiry = localStorage.getItem("token_expiry");

if (!token || !expiry || Date.now() > expiry) {
  localStorage.clear();
  window.location.href = "../login";
}


document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.createElement("button");
  logoutBtn.textContent = "Cerrar sesión";
  logoutBtn.className = "logout";
  logoutBtn.style.cssText = `
    background: linear-gradient(90deg, var(--accent1), var(--accent2));
    color: white; border: none; border-radius: 8px;
    padding: 10px 16px; cursor: pointer; margin-bottom: 16px;
  `;
  logoutBtn.onclick = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    window.location.href = "../login/login.html";
  };
  document.querySelector(".dashboard").prepend(logoutBtn);
});


function formatearFecha(fecha) {
  if (fecha && typeof fecha.toDate === "function") fecha = fecha.toDate();
  if (fecha instanceof Date) {
    return fecha.toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  if (typeof fecha === "string") {
    const f = new Date(fecha);
    if (!isNaN(f)) {
      return f.toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  }
  return "-";
}

async function cargarFrases() {
  const loader = document.getElementById("loader");
  const table = document.getElementById("table");
  const tbody = document.getElementById("table-body");

  try {
    loader.classList.remove("hidden");
    table.classList.add("hidden");

    const snapshot = await db.collection("frasesNuevas").get();
    if (snapshot.empty) {
      loader.innerHTML = "<p>No hay frases disponibles.</p>";
      return;
    }

    const frases = snapshot.docs
      .filter(doc => doc.id !== "1")
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    tbody.innerHTML = "";
    frases.forEach((item, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td data-label="#">${i + 1}</td>
        <td data-label="Fecha">${formatearFecha(item.fecha)}</td>
        <td data-label="Autor">${item.autor || "-"}</td>
        <td data-label="Frase">${item.frase || "(sin texto)"}</td>
        <td data-label="Descripción" class="description">${item.descripcion || "-"}</td>
        <td data-label="Acciones" class="actions">
          <button class="approve">✔</button>
          <button class="reject">✖</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    loader.classList.add("hidden");
    table.classList.remove("hidden");

  } catch (error) {
    console.error("Error al cargar las frases:", error);
    loader.innerHTML = "<p>Error al cargar las frases.</p>";
  }
}

cargarFrases();
