document.querySelector(".button").addEventListener("click", function(event) {
    event.preventDefault(); // Prevenir el envío del formulario si está dentro de uno

    // Simular autenticación sin la API aún disponible
    let usuarioEjemplo = { nombre: "Hortensia", rol: "admin" };

    if (usuarioEjemplo.rol === "admin") {
        window.location.href = "../pages/DashboardAdmin.html"; // Redirigir al dashboard de administrador
    } else {
        window.location.href = "../pages/DashboardEmpleado.html"; // Redirigir al dashboard de empleado
    }
});