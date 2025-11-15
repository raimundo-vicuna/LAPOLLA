const token = localStorage.getItem("auth_token");
const expiry = localStorage.getItem("token_expiry");

if (!token || !expiry || Date.now() > Number(expiry)) {
  localStorage.clear();
  window.location.href = "../login";
}

let accionesPendientes = [];
let undoStack = [];
let redoStack = [];
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
      accionesPendientes = [];
      undoStack = [];
      redoStack = [];
      document.getElementById("changesCount").textContent =
        "0 cambio(s) pendiente(s)";
      cargarFrases();
    });
  }

  const frasesACbtn = document.getElementById("antiguasBtn");
  if (frasesACbtn) {
    frasesACbtn.addEventListener("click", () => {
      currentView = "actuales";
      accionesPendientes = [];
      undoStack = [];
      redoStack = [];
      document.getElementById("changesCount").textContent =
        "0 cambio(s) pendiente(s)";
      renderFrasesBack();
    });
  }
});

function pushUndo(action) {
  undoStack.push(JSON.parse(JSON.stringify(action)));
  redoStack = [];
}

function aplicarDeshacer() {
  if (!undoStack.length) return;
  const action = undoStack.pop();
  redoStack.push(JSON.parse(JSON.stringify(action)));

  if (action.view !== currentView) return;

  const approveBtn = document.querySelector(
    `button.approve[item-id="${action.id}"]`
  );
  if (!approveBtn) return;
  const row = approveBtn.closest("tr");
  if (!row) return;

  if (action.kind === "edit") {
    const fraseCell = row.querySelector('td[data-label="Frase"]');
    const descCell = row.querySelector('td[data-label="Descripción"]');

    if (fraseCell) fraseCell.textContent = action.prevText || "(sin texto)";
    if (descCell) descCell.textContent = action.prevDes || "-";

    const idx = accionesPendientes.findIndex(
      (a) => a.id === action.id && a.type === "edit"
    );

    if (action.hadPending) {
      if (idx === -1) {
        accionesPendientes.push({
          id: action.id,
          type: "edit",
          value: action.prevPendingValue,
          des: action.prevPendingDes,
          view: action.view,
        });
      } else {
        accionesPendientes[idx].value = action.prevPendingValue;
        accionesPendientes[idx].des = action.prevPendingDes;
      }
    } else {
      if (idx !== -1) accionesPendientes.splice(idx, 1);
    }
  }

  if (action.kind === "deleteToggle") {
    const idx = accionesPendientes.findIndex(
      (a) => a.id === action.id && a.type === "delete"
    );

    if (action.wasDeleted) {
      if (idx === -1) {
        accionesPendientes.push({
          id: action.id,
          type: "delete",
          view: action.view,
        });
      }
    } else {
      if (idx !== -1) accionesPendientes.splice(idx, 1);
    }
  }

  marcarPendientesVisuales();
  document.getElementById("changesCount").textContent =
    `${accionesPendientes.length} cambio(s) pendiente(s)`;
}

function aplicarRehacer() {
  if (!redoStack.length) return;
  const action = redoStack.pop();
  undoStack.push(JSON.parse(JSON.stringify(action)));

  if (action.view !== currentView) return;

  const approveBtn = document.querySelector(
    `button.approve[item-id="${action.id}"]`
  );
  if (!approveBtn) return;
  const row = approveBtn.closest("tr");
  if (!row) return;

  if (action.kind === "edit") {
    const fraseCell = row.querySelector('td[data-label="Frase"]');
    const descCell = row.querySelector('td[data-label="Descripción"]');

    if (fraseCell) fraseCell.textContent = action.newText || "(sin texto)";
    if (descCell) descCell.textContent = action.newDes || "-";

    let idx = accionesPendientes.findIndex(
      (a) => a.id === action.id && a.type === "edit"
    );

    if (idx === -1) {
      accionesPendientes.push({
        id: action.id,
        type: "edit",
        value: action.newText,
        des: action.newDes,
        view: action.view,
      });
    } else {
      accionesPendientes[idx].value = action.newText;
      accionesPendientes[idx].des = action.newDes;
    }
  }

  if (action.kind === "deleteToggle") {
    const idx = accionesPendientes.findIndex(
      (a) => a.id === action.id && a.type === "delete"
    );

    if (action.wasDeleted) {
      if (idx !== -1) accionesPendientes.splice(idx, 1);
    } else {
      if (idx === -1) {
        accionesPendientes.push({
          id: action.id,
          type: "delete",
          view: action.view,
        });
      }
    }
  }

  marcarPendientesVisuales();
  document.getElementById("changesCount").textContent =
    `${accionesPendientes.length} cambio(s) pendiente(s)`;
}

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
        <td data-label="Frase">${item.frase || item.texto || item.value || "(sin texto)"}</td>
        <td data-label="Descripción" class="description">${item.descripcion || "-"}</td>
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
  } catch {
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

    const docsOrdenados = snapshot.docs
      .slice()
      .sort((a, b) => Number(a.id) - Number(b.id));

    tbody.innerHTML = "";
    thead.innerHTML = `
      <tr>
        <th>#</th>
        <th>Frase</th>
        <th>Descripción</th>
        <th>Acciones</th>
      </tr>
    `;

    docsOrdenados.forEach((doc) => {
      const data = doc.data();
      const texto = data.texto || data.frase || data.value || "(sin texto)";
      const des = data.des || "-";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td data-label="#">${doc.id}</td>
        <td data-label="Frase">${capitalize(texto)}</td>
        <td data-label="Descripción" class="description">${des}</td>
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
  } catch {
    loader.innerHTML = "<p>Error al cargar las frases.</p>";
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
}

document.addEventListener("click", (e) => {
  const approveBtn = e.target.closest("button.approve");
  const rejectBtn = e.target.closest("button.reject");

  if (approveBtn) {
    const id = approveBtn.getAttribute("item-id");
    const row = approveBtn.closest("tr");
    const fraseCell = row.querySelector('td[data-label="Frase"]');
    const descCell = row.querySelector('td[data-label="Descripción"]');
    const mode = approveBtn.dataset.mode || "edit";

    if (mode === "edit") {
      const currentText = fraseCell ? fraseCell.textContent.trim() : "";
      const currentDes = descCell ? descCell.textContent.trim() : "";

      if (fraseCell) {
        fraseCell.setAttribute("data-original", currentText);
        fraseCell.innerHTML = `<textarea class="edit-input frase-input neon-input">${currentText}</textarea>`;
      }
      if (descCell) {
        descCell.setAttribute("data-original", currentDes);
        descCell.innerHTML = `<textarea class="edit-input des-input neon-input">${currentDes}</textarea>`;
      }

      approveBtn.dataset.mode = "save";
      approveBtn.querySelector("i").className = "fa-solid fa-check";
      return;
    }

    if (mode === "save") {
      const fraseInput = row.querySelector(".frase-input");
      const desInput = row.querySelector(".des-input");

      const newText = fraseInput ? fraseInput.value.trim() : "";
      const newDes = desInput ? desInput.value.trim() : "";

      const prevText = fraseCell
        ? fraseCell.getAttribute("data-original") || ""
        : "";
      const prevDes = descCell
        ? descCell.getAttribute("data-original") || ""
        : "";

      const prevPending = accionesPendientes.find(
        (a) => a.id === id && a.type === "edit"
      );

      pushUndo({
        kind: "edit",
        id,
        view: currentView,
        prevText,
        prevDes,
        newText,
        newDes,
        hadPending: !!prevPending,
        prevPendingValue: prevPending ? prevPending.value : null,
        prevPendingDes: prevPending ? prevPending.des : null,
      });

      if (fraseCell) fraseCell.textContent = newText || "(sin texto)";
      if (descCell) descCell.textContent = newDes || "-";

      accionesPendientes = accionesPendientes.filter((a) => a.id !== id);

      accionesPendientes.push({
        id,
        type: "edit",
        value: newText,
        des: newDes,
        view: currentView,
      });

      approveBtn.dataset.mode = "edit";
      approveBtn.querySelector("i").className = "fa-solid fa-pen-to-square";

      marcarPendientesVisuales();
      document.getElementById("changesCount").textContent =
        `${accionesPendientes.length} cambio(s) pendiente(s)`;

      return;
    }
  }

  if (rejectBtn) {
    const id = rejectBtn.getAttribute("item-id");
    const row = rejectBtn.closest("tr");
    const approve = row.querySelector(".approve");
    const mode = approve.dataset.mode || "edit";

    if (mode === "save") {
      const fraseCell = row.querySelector('td[data-label="Frase"]');
      const descCell = row.querySelector('td[data-label="Descripción"]');

      const originalFrase = fraseCell
        ? fraseCell.getAttribute("data-original") || ""
        : "";
      const originalDes = descCell
        ? descCell.getAttribute("data-original") || ""
        : "";

      if (fraseCell) fraseCell.textContent = originalFrase;
      if (descCell) descCell.textContent = originalDes;

      approve.dataset.mode = "edit";
      approve.querySelector("i").className = "fa-solid fa-pen-to-square";

      accionesPendientes = accionesPendientes.filter((a) => a.id !== id);

      marcarPendientesVisuales();
      document.getElementById("changesCount").textContent =
        `${accionesPendientes.length} cambio(s) pendiente(s)`;

      return;
    }

    const wasDeleted = accionesPendientes.some(
      (a) => a.id === id && a.type === "delete"
    );

    pushUndo({
      kind: "deleteToggle",
      id,
      view: currentView,
      wasDeleted,
    });

    if (wasDeleted) {
      accionesPendientes = accionesPendientes.filter(
        (a) => !(a.id === id && a.type === "delete")
      );
    } else {
      accionesPendientes.push({ id, type: "delete", view: currentView });
    }

    marcarPendientesVisuales();
    document.getElementById("changesCount").textContent =
      `${accionesPendientes.length} cambio(s) pendiente(s)`;
  }

  if (e.target.id === "undoBtn") aplicarDeshacer();
  if (e.target.id === "redoBtn") aplicarRehacer();
  if (e.target.id === "confirmChanges") confirmarCambios();
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
              descripcion: acc.des,
              apiKey: "penedegorila007",
            },
            { merge: true }
          );
        } else {
          await db.collection("frases").doc(String(acc.id)).set(
            {
              texto: acc.value,
              des: acc.des,
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
    undoStack = [];
    redoStack = [];

    document
      .querySelectorAll("tr.marked-edit, tr.marked-reject")
      .forEach((r) => r.classList.remove("marked-edit", "marked-reject"));

    document.getElementById("changesCount").textContent =
      "0 cambio(s) pendiente(s)";

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
  } catch {
    loader.innerHTML = "<p>Error al aplicar cambios.</p>";
    setTimeout(() => {
      loader.classList.add("hidden");
      enEjecucion = false;
    }, 1500);
  }
}

renderFrasesBack();
