document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.querySelector('.button');
    loginButton.addEventListener('click', iniciarSesion);
});

async function iniciarSesion() {
    const idEmpleado = document.getElementById('idEmpleado').value;
    const password = document.getElementById('password').value;

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
                name: idEmpleado,
                contraseña: password || "ASCD3"
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = await response.json();
        console.log('Respuesta completa:', result);

        if (!result.data || !result.data.token) {
            throw new Error('No se recibió token en la respuesta');
        }

        // Decodificar el token JWT para obtener el rol
        const tokenPayload = JSON.parse(atob(result.data.token.split('.')[1]));
        console.log('Datos del token:', tokenPayload);

        if (!tokenPayload.id_rol) {
            throw new Error('El token no contiene información de rol');
        }

        // Redirigir según el rol
        if (tokenPayload.id_rol === 3) {
            localStorage.setItem('authToken', result.data.token);
            window.location.href = '../pages/DashboardAdmin.html';
        } else if (tokenPayload.id_rol === 4) {
            localStorage.setItem('authToken', result.data.token);
            window.location.href = '../pages/DashboardEmpleado.html';
        } else {
            alert(`Rol no reconocido (ID: ${tokenPayload.id_rol}). Contacta al administrador.`);
        }

    } catch (error) {
        console.error('Error en el login:', error);
        alert(`Error al iniciar sesión: ${error.message}`);
    } finally {
        // Restaurar estado del botón
        loginButton.disabled = false;
        loginButton.value = "Ingresar";
    }
}