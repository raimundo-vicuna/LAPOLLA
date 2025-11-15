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
      const token = (self.crypto && self.crypto.getRandomValues)
        ? ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
        : Math.random().toString(36).substring(2) + Date.now().toString(36);

      const expiry = Date.now() + 60 * 60 * 1000;

      localStorage.setItem("auth_token", token);
      localStorage.setItem("token_expiry", expiry);
      localStorage.setItem("user", username);

      window.location.href = "config.html";
    } else {
      errorMsg.textContent = "Usuario o contraseña incorrectos";
      errorMsg.classList.remove("hidden");
    }

  } catch (error) {
    console.error("Error al verificar el login:", error);
    loader.classList.add("hidden");
    errorMsg.textContent = "Error al conectar con el servidor";
    errorMsg.classList.remove("hidden");
  }
});
