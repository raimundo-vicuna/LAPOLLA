const token = localStorage.getItem("auth_token");
const expiry = localStorage.getItem("token_expiry");

if (!token || !expiry || Date.now() > Number(expiry)) {
  localStorage.clear();
  window.location.href = "../login";
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("token_expiry");
      window.location.href = "../login/login.html";
    });
  }

  const nuevasBTN = document.getElementById("nuevasBtn");
  if (nuevasBTN) {
    nuevasBTN.addEventListener("click", cargarFrases);
  }

  const frasesACbtn = document.getElementById("antiguasBtn");
  if (frasesACbtn) {
    frasesACbtn.addEventListener("click", renderFrasesBack);
  }
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
  const thead = table.querySelector("thead");
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
      .map(doc => ({ id: doc.id, ...doc.data() }));

    tbody.innerHTML = "";
    thead.innerHTML = `
      <tr>
        <th>#</th>
        <th>Fecha</th>
        <th>Autor</th>
        <th>Frase</th>
        <th>Descripción</th>
        <th>Acciones</th>
      </tr>
    `;

    frases.forEach((item, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td data-label="#">${i + 1}</td>
        <td data-label="Fecha">${formatearFecha(item.fecha)}</td>
        <td data-label="Autor">${item.autor || "-"}</td>
        <td data-label="Frase">${item.frase || "(sin texto)"}</td>
        <td data-label="Descripción" class="description">${item.descripcion || "-"}</td>
        <td data-label="Acciones" class="actions">
          <button class="approve" item-id="${item.id}">✔</button>
          <button class="reject" item-id="${item.id}">✖</button>
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

function renderFrasesBack() {
  const raw = localStorage.getItem("frases");
  const loader = document.getElementById("loader");
  const table = document.getElementById("table");
  const thead = table.querySelector("thead");
  const tbody = document.getElementById("table-body");

  loader.classList.remove("hidden");
  table.classList.add("hidden");

  if (!raw) {
    tbody.innerHTML = "<tr><td>No hay frases guardadas en localStorage.</td></tr>";
    thead.innerHTML = `<tr><th>#</th><th>Frase</th></tr>`;
    loader.classList.add("hidden");
    table.classList.remove("hidden");
    return;
  }

  const frases = JSON.parse(raw);

  tbody.innerHTML = "";
  thead.innerHTML = `
    <tr>
      <th>#</th>
      <th>Frase</th>
      <th>Acciones</th>
    </tr>
  `;

  Object.entries(frases).forEach(([num, texto]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td data-label="#">${num}</td>
      <td data-label="Frase">${texto}</td>
      <td data-label="Acciones" class="actions">
        <button class="approve" item-id="${num}">✔</button>
        <button class="reject" item-id="${num}">✖</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  loader.classList.add("hidden");
  table.classList.remove("hidden");
}

renderFrasesBack();

let accionesPendientes = [];

document.addEventListener("click", (e) => {
  if (e.target.matches(".approve, .reject")) {
    const id = e.target.getAttribute("item-id");
    const action = e.target.classList.contains("approve") ? "accept" : "reject";
    const row = e.target.closest("tr");
    const index = accionesPendientes.findIndex(a => a.id === id);

    if (index !== -1) {
      accionesPendientes.splice(index, 1);
      row.classList.remove("marked-accept", "marked-reject");
    } else {
      accionesPendientes.push({ id, action });
      row.classList.remove("marked-accept", "marked-reject");
      row.classList.add(action === "accept" ? "marked-accept" : "marked-reject");
    }

    const loader = document.getElementById("loader");
    loader.classList.remove("hidden");
    document.getElementById("changesCount").textContent =
      `${accionesPendientes.length} cambio(s) pendiente(s)`;
    setTimeout(() => loader.classList.add("hidden"), 1500);
  }

  if (e.target.id === "confirmChanges") {
    confirmarCambios();
  }
});

let enEjecucion = false;

async function confirmarCambios() {
  if (enEjecucion) return;
  enEjecucion = true;

  if (!accionesPendientes.length) {
    alert("No hay cambios pendientes.");
    enEjecucion = false;
    return;
  }

  const confirmar = confirm(`¿Aplicar ${accionesPendientes.length} cambio(s)?`);
  if (!confirmar) {
    enEjecucion = false;
    return;
  }

  const loader = document.getElementById("loader");
  loader.classList.remove("hidden");
  loader.innerHTML = "<p>Aplicando cambios...</p>";

  try {
    const frasesSnapshot = await db.collection("frases").get();
    let nextId = frasesSnapshot.size + 1;

    for (const acc of accionesPendientes) {
      const ref = db.collection("frasesNuevas").doc(acc.id);
      const doc = await ref.get();
      if (!doc.exists) continue;

      if (acc.action === "accept") {
        const data = doc.data();
        const texto = data.texto || data.frase || data.value || data.text;
        if (!texto || texto.trim() === "") continue;

        await db.collection("frases").doc(String(nextId)).set({
          texto,
          apiKey: "penedegorila007"
        });
        await ref.delete();
        nextId++;
      }

      if (acc.action === "reject") {
        await ref.delete();
      }
    }

    accionesPendientes = [];
    document.querySelectorAll("tr.marked-accept, tr.marked-reject").forEach(r => {
      r.classList.remove("marked-accept", "marked-reject");
    });
    document.getElementById("changesCount").textContent = "0 cambios pendientes";

    loader.innerHTML = "<p style='color:#77ff8e'>Cambios aplicados correctamente ✅</p>";
    setTimeout(() => {
      loader.classList.add("hidden");
      enEjecucion = false;
    }, 2000);

    await cargarFrases();
  } catch (err) {
    console.error("Error al aplicar cambios:", err);
    loader.innerHTML = "<p>Error al aplicar cambios.</p>";
    setTimeout(() => {
      loader.classList.add("hidden");
      enEjecucion = false;
    }, 2000);
  }
}
