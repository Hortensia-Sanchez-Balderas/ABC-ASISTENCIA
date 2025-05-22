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

const appendAlert = (message, type, heading, showAdditionalContent) => {
  const additionalContent = showAdditionalContent ? 
    '<p class="mb-0">Ingreso registrado 10:22:16.</p> <div class="d-flex justify-content-between"> <p class="mb-0">Tiene 2 mensajes nuevos.</p> <a href="../PROYECTO ABC ASISTENCIA/pages/IniciarSesion.html" class="login-link2">Iniciar sesión</a> </div>' 
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
    appendAlert(`Asistencia marcada para el ID: ${idEmpleado}`, 'success', 'Éxito!', true);
    console.log({data});
  } catch (error) {
    appendAlert(error.message, 'danger', 'Error!', false);
  }
}
