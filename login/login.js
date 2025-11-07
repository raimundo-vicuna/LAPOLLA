const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  errorMsg.classList.add("hidden");

  try {
    const snapshot = await db.collection("login").get();
    let accesoConcedido = false;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.user === username && data.password === password) {
        accesoConcedido = true;
      }
    });

    if (accesoConcedido) {
      const token = crypto.randomUUID();
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", username);
      window.location.href = "../admin_dashboard/admin.html";
    } else {
      errorMsg.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error al verificar login:", error);
    errorMsg.textContent = "Error al conectar con el servidor";
    errorMsg.classList.remove("hidden");
  }
});
