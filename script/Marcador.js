const apiPath = "https://abcd-asistencia.onrender.com"; // URL de la API para iniciar sesión

document.getElementById('submit-btn').addEventListener('click', async function() {
    let id = document.getElementById('id-input').value;
    if (id) {
        // appendAlert(``,'strong-success', `Nombre: Juan Peréz [${id}]`, true);
      await marcarAsistencia(id);
    } else {
        appendAlert('Por favor, ingresa un ID.', 'danger', 'Error!', false);
    }
});

const alertContainer = document.getElementById('alertContainer');

const appendAlert = async (message, type, heading, showAdditionalContent) => {
  let id = document.getElementById('id-input').value;
  const mensajes = await obtenerMensajes(id) ?? []

  const additionalContent = showAdditionalContent ? 
    `<p class="mb-0">Ingreso registrado ${obtenerHoraActual()}.</p> <div class="d-flex justify-content-between"> <p class="mb-0">Tiene ${mensajes.length} mensajes nuevos.</p> <a href="pages/IniciarSesion.html" class="login-link2">Iniciar sesión</a> </div>` 
    : '';

  const wrapper = document.createElement('div');
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <h4 class="alert-heading">${heading}</h4>`,
    `   <p>${message}</p>`,
    additionalContent,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    '</div>'
  ].join('');

  alertContainer.append(wrapper);
};

const marcarAsistencia = async (idEmpleado) => {
  try {
    const response = await fetch(`${apiPath}/asistencias/marcar-asistencia`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idEmpleado: +idEmpleado })
    });

    if (!response.ok) {
      throw new Error('Error al marcar asistencia');
    }

    const data = await response.json();

    const tipoEvento = data.tipo_evento;
    let mensajeTipoEvento = '';

    switch (tipoEvento) {
      case 1:
        mensajeTipoEvento = 'Inicio de turno';
        break;

      case 2:
        mensajeTipoEvento = 'Inicio de hora de comida';
        break;

      case 3:
        mensajeTipoEvento = 'Fin de hora de comida';
        break;

      case 4:
        mensajeTipoEvento = 'Fin de turno';
        break;

      default:
        mensajeTipoEvento = '';
        break;
    }

    appendAlert(`${mensajeTipoEvento}. Asistencia marcada para el ID: ${idEmpleado}`, 'success', 'Éxito!', true);
    console.log({data});
  } catch (error) {
    appendAlert(error.message, 'danger', 'Error!', false);
  }
}

const obtenerMensajes = async (usuarioId) => {
    try {
        const response = await fetch(`${apiPath}/advertencias/advertenciasByEmpleado?id_empleado_destinatario=${usuarioId}`);

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

function obtenerHoraActual() {
    const ahora = new Date();
    return ahora.toLocaleTimeString('es-MX', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}