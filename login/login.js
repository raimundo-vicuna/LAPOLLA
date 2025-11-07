const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");
const loader = document.getElementById("loader");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  errorMsg.classList.add("hidden");
  loader.classList.remove("hidden");

  try {
    const snapshot = await db.collection("login").get();
    let accesoConcedido = false;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.user === username && data.password === password) {
        accesoConcedido = true;
      }
    });

    loader.classList.add("hidden");

    if (accesoConcedido) {
      const token = crypto.randomUUID();
      const expiry = Date.now() + 60 * 60 * 1000;
      localStorage.setItem("auth_token", token);
      localStorage.setItem("token_expiry", expiry);
      localStorage.setItem("user", username);
      window.location.href = "../admin_dashboard";
    } else {
      errorMsg.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error al verificar el login:", error);
    loader.classList.add("hidden");
    errorMsg.textContent = "Error al conectar con el servidor";
    errorMsg.classList.remove("hidden");
  }
});
