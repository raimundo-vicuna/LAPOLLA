const token = localStorage.getItem("auth_token");
const expiry = localStorage.getItem("token_expiry");

if (!token || !expiry || Date.now() > Number(expiry)) {
  localStorage.clear();
  window.location.href = "../login";
}

let accionesPendientes = [];
let enEjecucion = false;
let currentView = "actuales";

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
    nuevasBTN.addEventListener("click", () => {
      currentView = "nuevas";
      cargarFrases();
    });
  }

  const frasesACbtn = document.getElementById("antiguasBtn");
  if (frasesACbtn) {
    frasesACbtn.addEventListener("click", () => {
      currentView = "actuales";
      renderFrasesBack();
    });
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
      minute: "2-digit",
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
        minute: "2-digit",
      });
    }
  }
  return "-";
}

function capitalize(texto) {
  if (!texto || typeof texto !== "string") return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
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
      .filter((doc) => doc.id !== "1")
      .map((doc) => ({ id: doc.id, ...doc.data() }));

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
        <td data-label="Frase">${item.frase || item.texto || item.value || item.text || "(sin texto)"
        }</td>
        <td data-label="Descripción" class="description">${item.descripcion || "-"
        }</td>
        <td data-label="Acciones" class="actions">
          <button class="approve" data-mode="edit" item-id="${item.id}">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="reject" item-id="${item.id}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    marcarPendientesVisuales();
    loader.classList.add("hidden");
    table.classList.remove("hidden");
  } catch (error) {
    console.error("Error al cargar las frases:", error);
    loader.innerHTML = "<p>Error al cargar las frases.</p>";
  }
}

async function renderFrasesBack() {
  const loader = document.getElementById("loader");
  const table = document.getElementById("table");
  const thead = table.querySelector("thead");
  const tbody = document.getElementById("table-body");

  loader.classList.remove("hidden");
  table.classList.add("hidden");

  try {
    const snapshot = await db.collection("frases").get();

    if (snapshot.empty) {
      tbody.innerHTML =
        "<tr><td>No hay frases guardadas en la colección 'frases'.</td></tr>";
      thead.innerHTML = `<tr><th>#</th><th>Frase</th><th>Acciones</th></tr>`;
      loader.classList.add("hidden");
      table.classList.remove("hidden");
      return;
    }

    const docsOrdenados = snapshot.docs
      .slice()
      .sort((a, b) => Number(a.id) - Number(b.id));

    tbody.innerHTML = "";
    thead.innerHTML = `
      <tr>
        <th>#</th>
        <th>Frase</th>
        <th>Acciones</th>
      </tr>
    `;

    docsOrdenados.forEach((doc) => {
      const data = doc.data();
      const texto =
        data.texto || data.frase || data.value || data.text || "(sin texto)";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td data-label="#">${doc.id}</td>
        <td data-label="Frase">${capitalize(texto)}</td>
        <td data-label="Acciones" class="actions">
          <button class="approve" data-mode="edit" item-id="${doc.id}">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="reject" item-id="${doc.id}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    marcarPendientesVisuales();
    loader.classList.add("hidden");
    table.classList.remove("hidden");
  } catch (err) {
    console.error("Error al cargar frases actuales:", err);
    loader.innerHTML = "<p>Error al cargar las frases.</p>";
    loader.classList.remove("hidden");
    table.classList.remove("hidden");
  }
}

function marcarPendientesVisuales() {
  const rows = document.querySelectorAll("table.data-table tbody tr");
  rows.forEach((r) => {
    r.classList.remove("marked-edit", "marked-reject");
  });
  accionesPendientes.forEach((a) => {
    const btn = document.querySelector(`button[item-id="${a.id}"]`);
    if (!btn) return;
    const row = btn.closest("tr");
    if (!row) return;
    if (a.type === "edit") row.classList.add("marked-edit");
    if (a.type === "delete") row.classList.add("marked-reject");
  });
  document.getElementById(
    "changesCount"
  ).textContent = `${accionesPendientes.length} cambio(s) pendiente(s)`;
}

document.addEventListener("click", (e) => {
  const approveBtn = e.target.closest("button.approve");
  const rejectBtn = e.target.closest("button.reject");

  if (approveBtn) {
    const id = approveBtn.getAttribute("item-id");
    const row = approveBtn.closest("tr");
    const fraseCell = row.querySelector('td[data-label="Frase"]');
    const mode = approveBtn.dataset.mode || "edit";

    if (mode === "edit") {
      const currentText = fraseCell.textContent.trim();
      fraseCell.innerHTML = `<textarea class="edit-input" style="width:100%;min-height:60px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:#fff;padding:8px;">${currentText}</textarea>`;
      approveBtn.dataset.mode = "save";
      const icon = approveBtn.querySelector("i");
      if (icon) icon.className = "fa-solid fa-check";
    } else {
      const input = fraseCell.querySelector(".edit-input");
      const newText = (input ? input.value : fraseCell.textContent).trim();
      fraseCell.textContent = newText || "(sin texto)";

      const existingIdx = accionesPendientes.findIndex((a) => a.id === id);
      if (existingIdx !== -1) accionesPendientes.splice(existingIdx, 1);
      const delIdx = accionesPendientes.findIndex(
        (a) => a.id === id && a.type === "delete"
      );
      if (delIdx !== -1) accionesPendientes.splice(delIdx, 1);
      accionesPendientes.push({ id, type: "edit", value: newText, view: currentView });

      row.classList.remove("marked-reject");
      row.classList.add("marked-edit");

      approveBtn.dataset.mode = "edit";
      const icon = approveBtn.querySelector("i");
      if (icon) icon.className = "fa-solid fa-pen-to-square";

      const loader = document.getElementById("loader");
      loader.classList.remove("hidden");
      document.getElementById(
        "changesCount"
      ).textContent = `${accionesPendientes.length} cambio(s) pendiente(s)`;
      setTimeout(() => loader.classList.add("hidden"), 800);
    }
  }

  if (rejectBtn) {
    const id = rejectBtn.getAttribute("item-id");
    const row = rejectBtn.closest("tr");

    const existingIdx = accionesPendientes.findIndex(
      (a) => a.id === id && a.type === "delete"
    );
    if (existingIdx !== -1) {
      accionesPendientes.splice(existingIdx, 1);
      row.classList.remove("marked-reject");
    } else {
      accionesPendientes = accionesPendientes.filter((a) => a.id !== id);
      accionesPendientes.push({ id, type: "delete", view: currentView });
      row.classList.remove("marked-edit");
      row.classList.add("marked-reject");
    }

    const loader = document.getElementById("loader");
    loader.classList.remove("hidden");
    document.getElementById(
      "changesCount"
    ).textContent = `${accionesPendientes.length} cambio(s) pendiente(s)`;
    setTimeout(() => loader.classList.add("hidden"), 800);
  }

  if (e.target.id === "confirmChanges") {
    confirmarCambios();
  }
});

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
    for (const acc of accionesPendientes) {
      if (acc.type === "edit") {
        if (acc.view === "nuevas") {
          await db.collection("frasesNuevas").doc(acc.id).set(
            {
              frase: acc.value,
              texto: acc.value,
              apiKey: "penedegorila007",
            },
            { merge: true }
          );
        } else {
          await db.collection("frases").doc(String(acc.id)).set(
            {
              texto: acc.value,
              apiKey: "penedegorila007",
            },
            { merge: true }
          );
        }
      }

      if (acc.type === "delete") {
        if (acc.view === "nuevas") {
          await db
            .collection("frasesNuevas")
            .doc(acc.id)
            .set({ apiKey: "penedegorila007" }, { merge: true });
          await db.collection("frasesNuevas").doc(acc.id).delete();
        } else {
          await db
            .collection("frases")
            .doc(String(acc.id))
            .set({ apiKey: "penedegorila007" }, { merge: true });
          await db.collection("frases").doc(String(acc.id)).delete();
        }
      }
    }

    accionesPendientes = [];
    document
      .querySelectorAll("tr.marked-edit, tr.marked-reject")
      .forEach((r) => {
        r.classList.remove("marked-edit", "marked-reject");
      });
    document.getElementById("changesCount").textContent =
      "0 cambios pendientes";

    loader.innerHTML =
      "<p style='color:#77ff8e'>Cambios aplicados correctamente ✅</p>";
    setTimeout(() => {
      loader.classList.add("hidden");
      enEjecucion = false;
    }, 1200);

    if (currentView === "nuevas") {
      await cargarFrases();
    } else {
      renderFrasesBack();
    }
  } catch (err) {
    console.error("Error al aplicar cambios:", err);
    loader.innerHTML = "<p>Error al aplicar cambios.</p>";
    setTimeout(() => {
      loader.classList.add("hidden");
      enEjecucion = false;
    }, 1500);
  }
}

renderFrasesBack();
