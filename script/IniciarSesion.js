document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.querySelector('.button');
    loginButton.addEventListener('click', iniciarSesion);
});

async function iniciarSesion() {
    const numeroEmpleado = document.getElementById('idEmpleado').value;
    const contrasena = document.getElementById('password').value;

    const apiUrl = 'https://abcd-asistencia.onrender.com/empleados/login';

    try {
        const loginButton = document.querySelector('.button');
        loginButton.disabled = true;
        loginButton.value = "Cargando...";

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                numeroEmpleado: Number(numeroEmpleado),
                contrasena: contrasena
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = await response.json();
        console.log('Respuesta completa:', result);

        if (!result.data || !result.data.id_rol) {
            throw new Error('No se recibió información de rol en la respuesta');
        }

        // Redirigir según el rol
        if (result.data.id_rol === 3) {
            window.location.href = '../pages/DashboardAdmin.html';
        } else if (result.data.id_rol === 4) {
            window.location.href = '../pages/DashboardEmpleado.html';
        } else {
            alert(`Rol no reconocido (ID: ${result.data.id_rol}). Contacta al administrador.`);
        }

    } catch (error) {
        console.error('Error en el login:', error);
        alert(`Error al iniciar sesión: ${error.message}`);
    } finally {
        // Restaurar estado del botón
        const loginButton = document.querySelector('.button');
        loginButton.disabled = false;
        loginButton.value = "Ingresar";
    }
}