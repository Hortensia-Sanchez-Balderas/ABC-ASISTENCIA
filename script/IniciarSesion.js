document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.querySelector('.button');
    loginButton.addEventListener('click', iniciarSesion);
});

//Funcion para decodificar el token JWT

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

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

        if (!result.data || !result.data.token) {
            throw new Error('No se recibió el token en la respuesta');
        }

        // Decodificar el token para obtener el id_rol
        const payload = parseJwt(result.data.token);
        if (!payload || !payload.id_rol) {
            throw new Error('No se encontró el id_rol en el token');
        }

        // Redirigir según el rol
        if (payload.id_rol === 3) {
            window.location.href = '../pages/DashboardAdmin.html';
        } else if (payload.id_rol === 4) {
            window.location.href = '../pages/DashboardEmpleado.html';
        } else {
            alert(`Rol no reconocido (ID: ${payload.id_rol}). Contacta al administrador.`);
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