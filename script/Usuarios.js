let usuariosCompletos = [];
let usuariosFiltrados = [];
let filasPorPagina = 10;
let paginaActual = 1;
let horariosTemporales = [];
let departamentosDisponibles = [];
let diasSemana = [];

const apiPath = "https://abcd-asistencia.onrender.com"; // URL de la API para iniciar sesión


// Datos simulados para desarrollo
const datosSimulados = {
  usuarios: [
    {
      id_empleado: 1,
      nombre: "Juan Pérez",
      nombre_departamento: "Ventas",
      hora_entrada_estandar: "08:00",
      hora_salida_estandar: "17:00",
      id_departamento: 1,
      id_rol: 1, // 1 = Administrador
      horarios: [
        { id_dia: 1, hora_entrada_estandar: "08:00", hora_salida_estandar: "17:00", laborable: true },
        { id_dia: 2, hora_entrada_estandar: "08:00", hora_salida_estandar: "17:00", laborable: true }
      ]
    },
    {
      id_empleado: 2,
      nombre: "María García",
      nombre_departamento: "Recursos Humanos",
      hora_entrada_estandar: "09:00",
      hora_salida_estandar: "18:00",
      id_departamento: 2,
      id_rol: 2, // 2 = Empleado
      horarios: [
        { id_dia: 1, hora_entrada_estandar: "09:00", hora_salida_estandar: "18:00", laborable: true }
      ]
    }
  ],
  roles: [
    { id_rol: 1, nombre: "Administrador" },
    { id_rol: 2, nombre: "Empleado" }
  ],
  departamentos: [
    { id_departamento: 1, nombre: "Ventas" },
    { id_departamento: 2, nombre: "Recursos Humanos" },
    { id_departamento: 3, nombre: "TI" }
  ],
  dias: [
    { id_dia: 1, nombre: "Lunes" },
    { id_dia: 2, nombre: "Martes" },
    { id_dia: 3, nombre: "Miércoles" },
    { id_dia: 4, nombre: "Jueves" },
    { id_dia: 5, nombre: "Viernes" },
    { id_dia: 6, nombre: "Sábado" },
    { id_dia: 7, nombre: "Domingo" }
  ]
};

//ENDPOINT: Obtener lista completa de usuarios (GET)
async function cargarUsuarios() {
  const empleados = await obtenerUsuarios();

  usuariosCompletos = empleados.map(usuario => ({
    idUsuario: usuario.id_empleado,
    nombre: usuario.nombre,
    departamento: usuario?.Departamento?.nombre || 'Sin departamento',
    contrasena: '••••••••',
    idDepartamento: usuario.id_departamento,
    idRol: usuario.id_rol,
    horarios: usuario.Horario || []
  }));
  
  usuariosFiltrados = [...usuariosCompletos];
  actualizarTablaUsuarios();
  actualizarPaginacionUsuarios();
}

//ENDPOINT: Obtener departamentos para select (GET)
async function cargarDepartamentos() {
  const departamentos = await obtenerDepartamentos() 

  
  departamentosDisponibles = departamentos.map(departamento => ({
    id_departamento: departamento.id_departamento,
    nombre: departamento.nombre
  }));
  
  // Llenar select en modal agregar
  const selectAgregar = document.getElementById('departamentoUsuario');
  selectAgregar.innerHTML = '<option value="" selected disabled>Seleccione un departamento</option>';
  
  // Llenar select en modal editar
  const selectEditar = document.getElementById('editarDepartamentoUsuario');
  selectEditar.innerHTML = '<option value="" selected disabled>Seleccione un departamento</option>';
  
  departamentosDisponibles.forEach(depto => {
    const option = document.createElement('option');
    option.value = depto.id_departamento;
    option.textContent = depto.nombre;
    selectAgregar.appendChild(option.cloneNode(true));
    selectEditar.appendChild(option);
  });
}

//ENDPOINT: Obtener días de la semana (GET)
function cargarDiasSemana() {
  setTimeout(() => {
    diasSemana = datosSimulados.dias;
    
    // Llenar select en modal agregar
    const selectAgregar = document.getElementById('diaHorario');
    selectAgregar.innerHTML = '<option value="" selected disabled>Seleccione un día</option>';
    
    // Llenar select en modal editar
    const selectEditar = document.getElementById('diaHorarioEdicion');
    selectEditar.innerHTML = '<option value="" selected disabled>Seleccione un día</option>';
    
    diasSemana.forEach(dia => {
      const option = document.createElement('option');
      option.value = dia.id_dia;
      option.textContent = dia.nombre;
      selectAgregar.appendChild(option.cloneNode(true));
      selectEditar.appendChild(option);
    });
  }, 300);
}

// Función para aplicar filtros
function aplicarFiltrosUsuarios() {
    const buscarInput = document.getElementById('buscarUsuario');
    if (!buscarInput) {
        console.error('No se encontró el input de búsqueda');
        return;
    }
    
    const buscar = buscarInput.value.toLowerCase();
    
    usuariosFiltrados = buscar ? 
        usuariosCompletos.filter(usuario => 
            usuario.idUsuario.toString().includes(buscar) || 
            usuario.nombre.toLowerCase().includes(buscar)
        ) : 
        [...usuariosCompletos];
    
    paginaActual = 1;
    actualizarTablaUsuarios();
    actualizarPaginacionUsuarios();
}

// Función para limpiar filtros 
function limpiarFiltrosUsuarios() {
    const buscarInput = document.getElementById('buscarUsuario');
    if (!buscarInput) {
        console.error('No se encontró el input de búsqueda');
        return;
    }
    
    buscarInput.value = '';
    usuariosFiltrados = [...usuariosCompletos];
    paginaActual = 1;
    actualizarTablaUsuarios();
    actualizarPaginacionUsuarios();
}

// Función para actualizar la tabla
function actualizarTablaUsuarios() {
  const inicio = (paginaActual - 1) * filasPorPagina;
  const fin = inicio + filasPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(inicio, fin);
  
  const tbody = document.querySelector('#tablaUsuarios tbody');
  tbody.innerHTML = '';
  
  if (usuariosPaginados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">No se encontraron resultados</td></tr>';
    return;
  }

  
  usuariosPaginados.forEach(usuario => {
    const rolTexto = usuario.idRol === 3 ? 'Administrador' : 'Empleado'; // Determinar texto del rol
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${usuario.idUsuario}</td>
      <td>${usuario.nombre}</td>
      <td>${usuario.departamento}</td>
      <td>${rolTexto}</td> <!-- Mostrar el tipo de usuario -->
      <td>${usuario.contrasena}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary btn-editar" data-id="${usuario.idUsuario}">
          <i class="bi bi-pencil-square"></i>
        </button>
      </td>
      <td>
        <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${usuario.idUsuario}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}


// ENDPOINT: Eliminar usuario (DELETE)
async function manejarEliminarUsuario(idUsuario) {
  if (!confirm(`¿Estás seguro de eliminar al usuario con ID: ${idUsuario}?`)) return;

  try {
    await eliminarEmpleado(idUsuario);
    mostrarExito('Usuario eliminado correctamente');

    // Recargar la lista de usuarios
    await cargarUsuarios();
    actualizarTablaUsuarios();
    actualizarPaginacionUsuarios();
  } catch (error) {
    console.error('Error al eliminar el empleado:', error);
    mostrarError('Error al eliminar el empleado');
    return;
  }
}
// -------------------------------------------------------Función para mostrar el modal de agregar usuario
// Función para mostrar el modal de agregar usuario
async function mostrarModalAgregarUsuario() {
  // document.getElementById('idUsuario').value = "8";
  console.log("Se activa fn")
  document.getElementById('modalAgregarUsuarioLabel').textContent = 'Agregar Nuevo Usuario';
  document.getElementById('formAgregarUsuario').reset();
  horariosTemporales = [];
  actualizarTablaHorarios('tablaHorarios');


  const siguienteId = await (await fetch(`${apiPath}/empleados/siguienteId`)).json();

  document.getElementById('idUsuario').value = siguienteId || '--';
  
  const modal = new bootstrap.Modal(document.getElementById('modalAgregarUsuario'));
  modal.show();
}

async function guardarUsuario() {
  const btnGuardar = document.getElementById('btnGuardarUsuario');
  btnGuardar.disabled = true; // Deshabilita el botón al iniciar

  const idUsuario = document.getElementById('idUsuario').value;
  const nombreUsuario = document.getElementById('nombreUsuario').value;
  const departamentoUsuario = document.getElementById('departamentoUsuario').value;
  const contrasenaUsuario = document.getElementById('contrasenaUsuario').value;
  const rolUsuario = document.getElementById('rolUsuario').value;

  if (!nombreUsuario || !departamentoUsuario || !contrasenaUsuario || !rolUsuario) {
    mostrarError('Por favor complete todos los campos obligatorios');
    btnGuardar.disabled = false; // Rehabilita si hay error de validación
    return;
  }

  const nuevoUsuario = {
    nombre: nombreUsuario,
    departamento: departamentosDisponibles.find(d => d.id_departamento == departamentoUsuario)?.nombre || 'Sin departamento',
    horaEntrada: '--:--',
    horaSalida: '--:--',
    contrasena: contrasenaUsuario,
    idDepartamento: departamentoUsuario,
    idRol: rolUsuario,
    horarios: horariosTemporales.map(h => ({
      idDia: h.idDia,
      nombreDia: diasSemana.find(d => d.id_dia == h.idDia)?.nombre || 'Día',
      horaEntrada: h.horaEntrada,
      horaSalida: h.horaSalida,
      laborable: h.laborable
    }))
  };

  try {
     const respuesta = await crearEmpleado(nuevoUsuario);
    await cargarUsuarios();
    mostrarExito(`Usuario creado correctamente. ID asignado: ${respuesta.idEmpleado || respuesta.id_empleado || 'N/A'}`);
    actualizarTablaUsuarios();
    actualizarPaginacionUsuarios();

    // Cerrar el modal automáticamente
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalAgregarUsuario'));
    modal.hide();
  } catch (error) {
    console.error('Error al crear el empleado:', error);
    mostrarError('Error al crear el empleado');
    btnGuardar.disabled = false; // Rehabilita si hay error en la petición
    return;
  }

  btnGuardar.disabled = false; 
}


// ---------------------------------------------------Función para mostrar el modal de edición---------------------------------------
function mostrarModalEditarUsuario(usuario) {
    console.log(usuario);
    // Rellena los campos del modal con los datos del usuario
    document.getElementById('editarIdUsuario').value = usuario.idUsuario;
    document.getElementById('editarNombreUsuario').value = usuario.nombre;
    document.getElementById('editarDepartamentoUsuario').value = usuario.idDepartamento;

    if (usuario.idRol) {
        document.getElementById('editarRolUsuario').value = usuario.idRol;
    }
    if (usuario.contrasena) {
        document.getElementById('editarContrasenaUsuario').value = usuario.contrasena;
    } else {
        document.getElementById('editarContrasenaUsuario').value = '';
    }

    horariosTemporales = (usuario.horarios || []).map(h => ({
    idDia: h.id_dia || h.idDia,
    nombreDia: (h.Dia && h.Dia.nombre) || h.nombreDia || '',
    horaEntrada: extraerHora(h.hora_entrada_estandar || h.horaEntrada),
    horaSalida: extraerHora(h.hora_salida_estandar || h.horaSalida),
    laborable: h.laborable
  }));
  actualizarTablaHorarios('tablaHorariosEdicion');

    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('modalEditarUsuario'));
    modal.show();
}

//ENDPOINT: Actualizar usuario (PUT)
async function guardarEdicionUsuario() {
    const idUsuario = document.getElementById('editarIdUsuario').value;
    const nombreUsuario = document.getElementById('editarNombreUsuario').value;
    const departamentoUsuario = document.getElementById('editarDepartamentoUsuario').value;
    const contrasenaUsuario = document.getElementById('editarContrasenaUsuario').value;
    const rolUsuario = document.getElementById('editarRolUsuario').value;

    if (!nombreUsuario || !departamentoUsuario || !rolUsuario) {
        mostrarError('Por favor complete todos los campos obligatorios');
        return;
    }

    const nuevoUsuario = {
        idUsuario: idUsuario,
        nombre: nombreUsuario,
        departamento: departamentosDisponibles.find(d => d.id_departamento == departamentoUsuario)?.nombre || 'Sin departamento',
        contrasena: contrasenaUsuario,
        idDepartamento: departamentoUsuario,
        idRol: rolUsuario,
        horarios: horariosTemporales.map(h => ({
            idDia: h.idDia,
            nombreDia: diasSemana.find(d => d.id_dia == h.idDia)?.nombre || 'Día',
            horaEntrada: h.horaEntrada,
            horaSalida: h.horaSalida,
            laborable: h.laborable
        }))
    };

    try {
        await updateEmpleado(idUsuario, nuevoUsuario);
        await cargarUsuarios(); 

        mostrarExito('Usuario actualizado correctamente');
        actualizarTablaUsuarios();
        actualizarPaginacionUsuarios();
    } catch (error) {
        console.error('Error al actualizar el empleado:', error);
        mostrarError('Error al actualizar el empleado');
        return;
    }

    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario'));
    modal.hide();
}

// Función para manejar la edición de usuario
function manejarEditarUsuario(idUsuario) {
    const usuarioExistente = usuariosCompletos.find(u => u.idUsuario == idUsuario);
    console.log({ usuarioExistente });
    if (usuarioExistente) {
        // Crear objeto para editar
        const usuarioParaEditar = {
            idUsuario: usuarioExistente.idUsuario,
            nombre: usuarioExistente.nombre,
            idRol: usuarioExistente.idRol,
            idDepartamento: usuarioExistente.idDepartamento,
            horarios: usuarioExistente.horarios || []
        };
        
        // Cargar datos necesarios si no están cargados
        const promises = [];
        if (departamentosDisponibles.length === 0) {
            promises.push(new Promise(resolve => {
                cargarDepartamentos();
                resolve();
            }));
        }
        if (diasSemana.length === 0) {
            promises.push(new Promise(resolve => {
                cargarDiasSemana();
                resolve();
            }));
        }
        
        Promise.all(promises).then(() => {
            mostrarModalEditarUsuario(usuarioParaEditar);
        });
    } else {
        mostrarError('Usuario no encontrado');
    }
}

function agregarHorarioTemporal(diaId, entradaId, salidaId, tablaId) {
  const diaSelect = document.getElementById(diaId);
  const horaEntrada = document.getElementById(entradaId).value;
  const horaSalida = document.getElementById(salidaId).value;

  if (!diaSelect.value) {
    alert('Por favor seleccione un día');
    return;
  }
  if (!horaEntrada || !horaSalida) {
    alert('Por favor ingrese ambas horas (entrada y salida)');
    return;
  }

  // Elimina el horario anterior de ese día si existe (para reemplazar)
  horariosTemporales = horariosTemporales.filter(h => h.idDia != diaSelect.value);

  const nuevoHorario = {
    idDia: diaSelect.value,
    nombreDia: diaSelect.options[diaSelect.selectedIndex].text,
    horaEntrada: horaEntrada,
    horaSalida: horaSalida,
    laborable: true
  };

  horariosTemporales.push(nuevoHorario);
  actualizarTablaHorarios(tablaId);

  // Limpiar campos
  document.getElementById(entradaId).value = '';
  document.getElementById(salidaId).value = '';
}

function actualizarTablaHorarios(tablaId) {
  const tbody = document.querySelector(`#${tablaId} tbody`);
  tbody.innerHTML = '';

  // Si es edición, mostrar los 7 días siempre
  if (tablaId === 'tablaHorariosEdicion') {
    diasSemana.forEach(dia => {
      // Busca si el día está en horariosTemporales
      const horario = horariosTemporales.find(h => h.idDia == dia.id_dia);
      let horaEntrada = '';
      let horaSalida = '';
      let laborable = false;

      if (horario) {
        horaEntrada = extraerHora(horario.horaEntrada || horario.hora_entrada_estandar);
        horaSalida = extraerHora(horario.horaSalida || horario.hora_salida_estandar);
        laborable = horario.laborable;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${dia.nombre}</td>
        <td>${horaEntrada}</td>
        <td>${horaSalida}</td>
        <td><span class="badge ${laborable ? 'bg-success' : 'bg-secondary'}">${laborable ? 'Sí' : 'No'}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-danger btn-eliminar-horario" data-dia="${dia.id_dia}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    // Modal agregar: solo mostrar los días agregados
    if (horariosTemporales.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-3">No hay horarios configurados</td></tr>';
      return;
    }
    horariosTemporales.forEach(horario => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${horario.nombreDia}</td>
        <td>${extraerHora(horario.horaEntrada)}</td>
        <td>${extraerHora(horario.horaSalida)}</td>
        <td><span class="badge ${horario.laborable ? 'bg-success' : 'bg-secondary'}">${horario.laborable ? 'Sí' : 'No'}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-danger btn-eliminar-horario" data-dia="${horario.idDia}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function actualizarTablaHorarios(tablaId) {
  const tbody = document.querySelector(`#${tablaId} tbody`);
  tbody.innerHTML = '';

  // Si es edición, mostrar SIEMPRE los 7 días
  if (tablaId === 'tablaHorariosEdicion') {
    diasSemana.forEach(dia => {
      // Buscar si el día está en horariosTemporales
      const horario = horariosTemporales.find(h => h.idDia == dia.id_dia);
      let horaEntrada = '';
      let horaSalida = '';
      let laborable = false;

      if (horario) {
        horaEntrada = extraerHora(horario.horaEntrada || horario.hora_entrada_estandar);
        horaSalida = extraerHora(horario.horaSalida || horario.hora_salida_estandar);
        laborable = horario.laborable;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${dia.nombre}</td>
        <td>${horaEntrada}</td>
        <td>${horaSalida}</td>
        <td><span class="badge ${laborable ? 'bg-success' : 'bg-secondary'}">${laborable ? 'Sí' : 'No'}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-danger btn-eliminar-horario" data-dia="${dia.id_dia}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    // Modal agregar: solo mostrar los días agregados
    if (horariosTemporales.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-3">No hay horarios configurados</td></tr>';
      return;
    }
    horariosTemporales.forEach(horario => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${horario.nombreDia}</td>
        <td>${extraerHora(horario.horaEntrada)}</td>
        <td>${extraerHora(horario.horaSalida)}</td>
        <td><span class="badge ${horario.laborable ? 'bg-success' : 'bg-secondary'}">${horario.laborable ? 'Sí' : 'No'}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-danger btn-eliminar-horario" data-dia="${horario.idDia}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function eliminarHorarioTemporal(idDia, tablaId) {
  debugger;
  // horariosTemporales = horariosTemporales.filter(h => h.idDia !== idDia);
  // horariosTemporales = horariosTemporales.filter(h => {
  //   console.log(`Comparando: ${h.idDia} con ${idDia}`);
  //   console.log( `Resultado: ${h.idDia != idDia}`);
  //   return h.idDia != idDia
  // });
  console.log({ horariosTemporales })

  horariosTemporales = horariosTemporales.map(h => {
    if(+h.idDia === +idDia) {
      return {
        ...h,
        horaEntrada: '',
        horaSalida: '',
        laborable: false
      };
    }
    return h;
  })

  console.log({ horariosTemporales })
  debugger;

  actualizarTablaHorarios(tablaId);
}

function extraerHora(valor) {
  if (!valor || valor === "1970-01-01T00:00:00.000Z") return "";
  // Si ya viene en formato "HH:mm:ss" o "HH:mm"
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(valor)) return valor.length === 5 ? valor + ':00' : valor;
  // Si viene en formato ISO
  const d = new Date(valor);
  return d.toISOString().substr(11, 8); // "HH:mm:ss"
}

// Funciones para mostrar mensajes
function mostrarExito(mensaje) {
  const toast = `<div class="toast align-items-center text-white bg-success" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="d-flex">
      <div class="toast-body">${mensaje}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  </div>`;
  
  document.getElementById('toastContainer').innerHTML = toast;
  $('.toast').toast('show');
}

function mostrarError(mensaje) {
  const toast = `<div class="toast align-items-center text-white bg-danger" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="d-flex">
      <div class="toast-body">${mensaje}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  </div>`;
  
  document.getElementById('toastContainer').innerHTML = toast;
  $('.toast').toast('show');
}


//Función para cambiar de página
function cambiarPaginaUsuarios(nuevaPagina) {
    paginaActual = nuevaPagina;
    actualizarTablaUsuarios();
    actualizarPaginacionUsuarios();
    
    document.querySelector('#tablaUsuarios').scrollIntoView({ behavior: 'smooth' });
}

function actualizarPaginacionUsuarios() {
    const totalPaginas = Math.ceil(usuariosFiltrados.length / filasPorPagina);
    const paginacion = document.querySelector('.pagination');
    paginacion.innerHTML = '';
    
    
    // Botón Anterior
    paginacion.innerHTML += `
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" id="paginaAnterior" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;
    
    // Números de página
    for (let i = 1; i <= totalPaginas; i++) {
        paginacion.innerHTML += `
            <li class="page-item ${paginaActual === i ? 'active' : ''}">
                <a class="page-link" href="#" data-pagina="${i}">${i}</a>
            </li>
        `;
    }
    
    // Botón Siguiente
    paginacion.innerHTML += `
        <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" id="paginaSiguiente" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;
    
    // Actualizar texto de información
    const inicio = (paginaActual - 1) * filasPorPagina + 1;
    const fin = Math.min(paginaActual * filasPorPagina, usuariosFiltrados.length);
    document.querySelector('.info-paginacion').textContent = `Mostrando ${inicio}-${fin} de ${usuariosFiltrados.length} registros`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
    // Inicializar datos
    await cargarUsuarios();
    cargarDepartamentos();
    cargarDiasSemana();
    
    // Crear contenedor para toasts
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '2000';
    document.body.appendChild(toastContainer);
    
    // Configurar eventos con verificación
    const btnBuscar = document.getElementById('btnBuscar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const buscarInput = document.getElementById('buscarUsuario');

    if (btnBuscar && btnLimpiar && buscarInput) {
        btnBuscar.addEventListener('click', aplicarFiltrosUsuarios);
        btnLimpiar.addEventListener('click', limpiarFiltrosUsuarios);
        buscarInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') aplicarFiltrosUsuarios();
        });
    } else {
        console.error('No se encontraron uno o más elementos requeridos');
    }
    // Configurar eventos
    document.getElementById('btnAgregarUsuario').addEventListener('click', mostrarModalAgregarUsuario);
    document.getElementById('btnBuscar').addEventListener('click', aplicarFiltrosUsuarios);
    document.getElementById('btnLimpiar').addEventListener('click', limpiarFiltrosUsuarios);
    document.getElementById('filasPorPagina').addEventListener('change', function() {
        filasPorPagina = parseInt(this.value);
        paginaActual = 1;
        actualizarTablaUsuarios();
        actualizarPaginacionUsuarios();
    });
    
    // Delegación de eventos
    document.querySelector('.pagination').addEventListener('click', function(e) {
        e.preventDefault();
        const target = e.target.closest('a');
        if (!target) return;
        
        if (target.id === 'paginaAnterior' && paginaActual > 1) {
            cambiarPaginaUsuarios(paginaActual - 1);
        } else if (target.id === 'paginaSiguiente' && paginaActual < Math.ceil(usuariosFiltrados.length / filasPorPagina)) {
            cambiarPaginaUsuarios(paginaActual + 1);
        } else if (target.hasAttribute('data-pagina')) {
            cambiarPaginaUsuarios(parseInt(target.getAttribute('data-pagina')));
        }
    });
    
    document.querySelector('#tablaUsuarios').addEventListener('click', function(e) {
    console.log("Elemento clickeado:", e.target);
    
    // Manejar botón editar
    let btnEditar = e.target.closest('.btn-editar');
    if (!btnEditar && e.target.classList.contains('bi-pencil-square')) {
        btnEditar = e.target.closest('button');
    }
    
    if (btnEditar) {
        const idUsuario = btnEditar.getAttribute('data-id');
        console.log("Editando usuario ID:", idUsuario);
        manejarEditarUsuario(idUsuario);
        return;
    }
    
    // Manejar botón eliminar
    const btnEliminar = e.target.closest('.btn-eliminar');
    if (btnEliminar) {
        const idUsuario = btnEliminar.getAttribute('data-id');
        manejarEliminarUsuario(idUsuario);
    }
});
    
    document.getElementById('buscarUsuario').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') aplicarFiltrosUsuarios();
    });
    
    // Eventos para modal de agregar
   // En tu DOMContentLoaded:
    document.getElementById('btnAgregarHorario').addEventListener('click', function() {
        agregarHorarioTemporal('diaHorario', 'horaEntrada', 'horaSalida', 'tablaHorarios');
    });

    document.getElementById('tablaHorariosEdicion').addEventListener('click', function(e) {
        if (e.target.closest('.btn-eliminar-horario')) {
            const idDia = e.target.closest('.btn-eliminar-horario').getAttribute('data-dia');
            eliminarHorarioTemporal(idDia, 'tablaHorariosEdicion');
        }
    });

    // document.getElementById('btnGuardarEdicion').addEventListener('click', guardarEdicionUsuario);
    document.getElementById('btnAgregarUsuario').addEventListener('click', mostrarModalAgregarUsuario);
    
    // Eventos para modal de edición
    document.getElementById('btnAgregarHorarioEdicion').addEventListener('click', function() {
        agregarHorarioTemporal('diaHorarioEdicion', 'horaEntradaEdicion', 'horaSalidaEdicion', 'tablaHorariosEdicion');
    });
    
    document.getElementById('tablaHorariosEdicion').addEventListener('click', function(e) {
        if (e.target.closest('.btn-eliminar-horario')) {
            const idDia = e.target.closest('.btn-eliminar-horario').getAttribute('data-dia');
            eliminarHorarioTemporal(idDia, 'tablaHorariosEdicion');
        }
    });
    
    document.getElementById('btnGuardarEdicion').addEventListener('click', guardarEdicionUsuario);

    document.getElementById('btnGuardarUsuario').addEventListener('click', guardarUsuario);
});

const obtenerUsuarios = async () => {
  try {
    const response = await fetch(`${apiPath}/empleados`);
    if (!response.ok) {
      throw new Error('Error al obtener los empleados');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

const obtenerDepartamentos = async () => {
  try {
    const response = await fetch(`${apiPath}/departamentos`);
    if (!response.ok) {
      throw new Error('Error al obtener los departamentos');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

const obtenerRoles = async () => {
  try {
    const response = await fetch(`${apiPath}/roles`);
    if (!response.ok) {
      throw new Error('Error al obtener los roles');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

const crearEmpleado = async (nuevoUsuario) => {
  // Mapeo de los días en el frontend a los días esperados en el backend
    const dias = {
        1: "lunes",
        2: "martes",
        3: "miercoles",
        4: "jueves",
        5: "viernes",
        6: "sabado",
        7: "domingo"
    };

    // Convertir el objeto nuevoUsuario a la estructura del backend
    const requestPayload = {
        nombre: nuevoUsuario.nombre,
        idDepartamento: parseInt(nuevoUsuario.idDepartamento),  // Asegurar que el id sea un número
        contrasena: nuevoUsuario.contrasena,
        idRol: parseInt(nuevoUsuario.idRol),  // Asegurar que el idRol sea un número
        diasLaborales: {}
    };

    // Inicializamos los días con valores por defecto (laborables de 8am a 5pm)
    Object.keys(dias).forEach(dia => {
        requestPayload.diasLaborales[dias[dia]] = {
            laborable: false,
            hora_entrada: "",
            hora_salida: ""
        };
    });

    // Mapeamos los horarios que vienen en 'horarios' al formato esperado
    nuevoUsuario.horarios.forEach(horario => {
        const dia = dias[parseInt(horario.idDia)];
        if (dia) {
            requestPayload.diasLaborales[dia] = {
                laborable: horario.laborable,
                hora_entrada: horario.horaEntrada,
                hora_salida: horario.horaSalida
            };
        }
    });

    const response = await fetch(`${apiPath}/empleados/createEmpleado`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
    });

    return response.json();
}

const updateEmpleado = async (id, nuevoUsuario) => {
  // Mapeo de los días en el frontend a los días esperados en el backend
    const dias = {
        1: "lunes",
        2: "martes",
        3: "miercoles",
        4: "jueves",
        5: "viernes",
        6: "sabado",
        7: "domingo"
    };

    // Convertir el objeto nuevoUsuario a la estructura del backend
    const requestPayload = {
        idEmpleado: parseInt(id),
        nombre: nuevoUsuario.nombre,
        idDepartamento: parseInt(nuevoUsuario.idDepartamento),  // Asegurarse que el id sea un número
        contrasena: nuevoUsuario.contrasena,
        idRol: parseInt(nuevoUsuario.idRol),  // Asegurarse que el idRol sea un número
        diasLaborales: {}
    };

    // Inicializamos los días con valores por defecto (laborables de 8am a 5pm)
    Object.keys(dias).forEach(dia => {
        requestPayload.diasLaborales[dias[dia]] = {
            laborable: false,
            hora_entrada: "",
            hora_salida: ""
        };
    });

    // Mapeamos los horarios que vienen en 'horarios' al formato esperado
    nuevoUsuario.horarios.forEach(horario => {
        const dia = dias[parseInt(horario.idDia)];
        if (dia) {
            requestPayload.diasLaborales[dia] = {
                laborable: horario.laborable,
                hora_entrada: horario.horaEntrada,
                hora_salida: horario.horaSalida
            };
        }
    });

    const response = await fetch(`${apiPath}/empleados/updateEmpleado`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
    });

    return response.json();
}

const eliminarEmpleado = async (id) => {
  try {
    const response = await fetch(`${apiPath}/empleados/deleteEmpleado`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idEmpleado: +id })
    });
    if (!response.ok) {
      throw new Error('Error al eliminar el empleado');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
  }
}